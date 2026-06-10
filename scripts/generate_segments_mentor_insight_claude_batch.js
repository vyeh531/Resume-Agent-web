"use strict";

/**
 * generate_segments_mentor_insight_claude_batch.js
 *
 * Claude-powered batch generator for humanized_mentor_insight.
 * Extends generate_segments_mentor_insight_llm.js with:
 *   --apply          apply approved rows to DB
 *   --apply-file=<p> load existing approved JSON, skip generation
 *   --from-hold=<p>  read candidate rows from a hold JSON (multiple files OK)
 *   --all            required when applying without --limit
 *   id=29 guard, backup before apply
 *
 * Recommended flow:
 *   1. dry-run 50 rows:    node scripts/generate_segments_mentor_insight_claude_batch.js --limit=50
 *   2. inspect CSV
 *   3. apply approved:     node scripts/generate_segments_mentor_insight_claude_batch.js --apply --apply-file=<approved_path>
 *   4. verify:             node scripts/verify_mentor_humanized_counts.js && node scripts/test_mentor_advice_schema.js
 */

require("dotenv").config({ path: ".env.local", override: true });
require("dotenv").config({ path: ".env", override: false });

const fs   = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const db = require("../database");
const {
  sourceTextForGeneration,
  detailTextForReview,
  classifyMentorRow,
  reviewMentor,
} = require("./backfill_segments_mentor_insight_rules");

// ── CLI args ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const APPLY          = argv.includes("--apply");
const ALL            = argv.includes("--all");
const OVERWRITE      = argv.includes("--overwrite");
const LIMIT          = numberArg("--limit", APPLY ? 0 : 50);
const OFFSET         = numberArg("--offset", 0);
const BATCH_SIZE     = Math.min(Math.max(numberArg("--batch-size", 20), 1), 50);
const SCOPE          = stringArg("--scope", "resume_edit");
const OUT_DIR        = stringArg("--out-dir", path.join("artifacts", "mentor-claude-batch-r1"));
const APPLY_FILE     = stringArg("--apply-file", "");
const FROM_HOLD      = stringArg("--from-hold", "");   // single path
const APPLY_CHUNK_SIZE = numberArg("--apply-chunk-size", 500);
const MODEL          = stringArg("--model",
  process.env.MENTOR_HUMANIZE_MODEL || "claude-haiku-4-5");

const PERSPECTIVE_SOURCE = "mentor_claude_batch_from_p_mentor";

// ── helpers ───────────────────────────────────────────────────────────────────
function numberArg(name, fallback) {
  const raw = argv.find((a) => a.startsWith(`${name}=`));
  if (!raw) return fallback;
  const v = Number(raw.slice(name.length + 1));
  return Number.isFinite(v) ? v : fallback;
}
function stringArg(name, fallback) {
  const raw = argv.find((a) => a.startsWith(`${name}=`));
  return raw ? raw.slice(name.length + 1) : fallback;
}
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); return dir; }
function timestamp()    { return new Date().toISOString().replace(/[:.]/g, "-"); }
function compact(v, max = 900) { return String(v || "").replace(/\s+/g, " ").trim().slice(0, max); }

function extractJsonArray(text) {
  const cleaned = String(text || "").replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("LLM response did not contain a JSON array");
  return JSON.parse(match[0]);
}

function csvCell(v) {
  return `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}
function writeCsv(filePath, rows) {
  const headers = [
    "id","retrieval_scope","topic","title","mentor_rule_family",
    "recommendation","review_flags","review_reasons",
    "P_mentor","A_action","H_hook","E_example","I_insight_detail_review_only",
    "humanized_mentor_insight","perspective_source","perspective_confidence",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((row) => [
      row.id, row.retrieval_scope, row.topic, row.title, row.mentor_rule_family,
      row.review.recommendation,
      row.review.flags.join("|"),
      row.review.reasons.join("|"),
      row.original.P_mentor,
      row.original.A_action,
      row.original.H_hook,
      row.original.E_example,
      row.original.I_insight,
      row.proposed.humanized_mentor_insight,
      row.proposed.perspective_source,
      row.proposed.perspective_confidence,
    ].map(csvCell).join(",")),
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}
function summarize(rows) {
  return rows.reduce((acc, row) => {
    for (const f of row.review.flags) acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {});
}

// ── DB columns ────────────────────────────────────────────────────────────────
const SELECT_COLUMNS = `
  id, chunk_id, retrieval_scope, topic, "L1", "L2", advice_type,
  problem_tags, ats_dimensions, role_family, target_roles, seniority,
  advice_card_title, user_problem_summary, action_summary,
  "P_mentor", "A_action", "I_insight", "H_hook", "E_example", "HR_os",
  retrieval_text,
  to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
  to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
  to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status,
  to_jsonb(segments)->>'perspective_source' AS perspective_source,
  to_jsonb(segments)->>'perspective_confidence' AS perspective_confidence
`;

// ── prompt ────────────────────────────────────────────────────────────────────
function systemPrompt() {
  return [
    "你是资深简历导师文案编辑，只重写中文 mentor display copy。",
    "只返回 JSON array，不要 markdown，不要解释。",
    '每个元素必须是 {"id": number, "humanized_mentor_insight": string, "perspective_confidence": number}。',
    "主来源只能用 P_mentor、A_action、action_summary、user_problem_summary、H_hook、E_example。",
    "I_insight 只用于检查专业细节是否丢失，不要把 I_insight 当主文案改写。",
    "语气像已经工作一段时间的学长姐提醒学弟妹：口语、具体、有经验感，但不是代操作。",
    "禁止代操语气：不要写「我会帮你、我会把、我会从、我会陪你」。",
    "禁止 HR / 招聘视角：不要出现 HR、招聘、招聘方、recruiter、初筛、机筛、ATS系统会、面试官会这类说法。",
    "  学长姐只对学生说话，不站在 HR 或招聘官角度评价。",
    "可以用：你这里、这条 bullet、建议、可以先、要补出、不要急着、这段经历。",
    "每条最多 2 句，35-95 个中文字左右。",
    "必须保留来源里的具体细节，例如岗位方向、工具名、指标、项目名、签证状态、",
    "  Finance/Accounting/BA/DS/PM、Portfolio/paper、visualization/dashboard、",
    "  RAG/chatbot/evaluation/LLM、linear regression、CPA eligible、AWS/SQL/Tableau 等。",
    "如果来源含有具体工具名（如 Python、SQL、Redis、Tableau、HPLC、CATIA），必须在建议里保留该词。",
    "不要发明来源没有的工具、岗位、指标、数字、平台、项目或行动。",
    "如果来源只是在说 A，不要套成 B；",
    "  例如 OPT ≠ optimize，sponsorship 活动 ≠ 工签，日期缩写 ≠ 专业缩写。",
    "如果来源角色不明或内容混杂，写较保守但仍具体的建议，不要硬套错误 family。",
  ].join("\n");
}

function promptRows(rows) {
  return rows.map((row) => ({
    id: row.id,
    title: row.advice_card_title || row.topic || "",
    retrieval_scope: row.retrieval_scope || "",
    problem_tags: row.problem_tags || "",
    mentor_family_hint: classifyMentorRow(row),
    target_roles: compact(row.target_roles, 120),
    source_for_generation: {
      P_mentor:             compact(row.P_mentor,             520),
      A_action:             compact(row.A_action,             520),
      action_summary:       compact(row.action_summary,       260),
      user_problem_summary: compact(row.user_problem_summary, 260),
      H_hook:               compact(row.H_hook,               360),
      E_example:            compact(row.E_example,            420),
    },
    detail_terms_to_preserve_if_present: compact(row.I_insight, 360),
  }));
}

// ── generate + review ─────────────────────────────────────────────────────────
async function generateBatch(client, rows) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 6000,
    temperature: 0.25,
    system: systemPrompt(),
    messages: [{ role: "user", content: JSON.stringify(promptRows(rows), null, 2) }],
  });
  const raw = message.content?.[0]?.text || "";
  let parsed;
  try {
    parsed = extractJsonArray(raw);
  } catch {
    // retry once with stricter parse: extract first [...] block
    const m = raw.match(/\[[\s\S]*?\]/);
    if (!m) throw new Error(`Claude did not return JSON array. Raw:\n${raw.slice(0, 300)}`);
    parsed = JSON.parse(m[0]);
  }
  const byId = new Map(parsed.map((r) => [Number(r.id), r]));
  return rows.map((row) => byId.get(Number(row.id)) || { id: row.id, humanized_mentor_insight: "", perspective_confidence: 0 });
}

function validateGenerated(row, proposal) {
  const mentor = compact(proposal.humanized_mentor_insight || "", 180);
  const review = reviewMentor(row, mentor);
  const extraFlags   = [];
  const extraReasons = [];

  if (!mentor) {
    extraFlags.push("llm_empty_output");
    extraReasons.push("Claude did not return mentor copy for this row.");
  }
  // explicit double-check on forbidden patterns (reviewMentor already covers most)
  if (/我会帮你|我会先帮|我会把|我会从|我会陪你/.test(mentor)) {
    if (!review.flags.includes("mentor_overactive_voice_risk")) {
      extraFlags.push("mentor_overactive_voice_risk");
      extraReasons.push("Mentor copy sounds like direct operation instead of advice.");
    }
  }
  // Also catch 面试官 / 机筛 — not in MENTOR_HR_VOICE_PATTERNS but forbidden by the prompt
  if (/我初筛|我第一眼|HR\s*会|招聘\s*会|面试官|机筛/.test(mentor)) {
    if (!review.flags.includes("mentor_hr_voice_risk")) {
      extraFlags.push("mentor_hr_voice_risk");
      extraReasons.push("Mentor copy contains HR/recruiting-screen voice (面试官 or similar).");
    }
  }

  // Note: mentor_hr_voice_risk from reviewMentor (\bHR\b) is correct — do NOT override.
  // Empirically, Claude almost always uses HR in "HR看/HR想/HR眼裡" (screening voice),
  // not in neutral career-target mentions. False-positive rate is negligible.
  let filteredFlags   = review.flags.filter((f) => f !== "good_as_is");
  let filteredReasons = review.reasons.filter((r) => !/No mentor-only heuristic risks/i.test(r));

  // ── Override: lost_required_signal — accept abbreviation expansions ───────────
  // reviewMentor uses text.includes("ds") but Claude may write "Data Science".
  // If all lost signals can be matched by their expanded form, lift the flag.
  const ABBREV_EXPANSIONS = {
    "ds":  /\bds\b|data science/i,
    "ba":  /\bba\b|business anal/i,
    "pm":  /\bpm\b|product manag|project manag/i,
    "ml":  /\bml\b|machine learning/i,
    "nlp": /\bnlp\b|natural language processing/i,
    "dl":  /\bdl\b|deep learning/i,
  };
  if (filteredFlags.includes("lost_required_signal")) {
    const signalReasonIdx = filteredReasons.findIndex((r) => /missing from mentor copy/i.test(r));
    if (signalReasonIdx >= 0) {
      const signalReason = filteredReasons[signalReasonIdx];
      const signalsPart  = signalReason.replace(/.*missing from mentor copy:\s*/i, "");
      const lostSignals  = signalsPart.split(/,\s*/).map((s) => s.trim().toLowerCase());
      const stillLost    = lostSignals.filter((sig) => {
        const expanded = ABBREV_EXPANSIONS[sig];
        if (!expanded) return true;          // no expansion defined → still lost
        return !expanded.test(mentor);       // expansion matches → signal satisfied
      });
      if (stillLost.length === 0) {
        filteredFlags   = filteredFlags.filter((f) => f !== "lost_required_signal");
        filteredReasons.splice(signalReasonIdx, 1);
      } else if (stillLost.length < lostSignals.length) {
        filteredReasons[signalReasonIdx] = signalReason.replace(
          signalsPart,
          stillLost.join(", ")
        );
      }
    }
  }

  const allFlags   = [...new Set([...filteredFlags, ...extraFlags])];
  const allReasons = [...filteredReasons, ...extraReasons];
  const approved   = allFlags.length === 0;

  return {
    mentor,
    review: {
      ...review,
      flags:          approved ? ["good_as_is"] : allFlags,
      reasons:        approved ? ["Claude mentor copy passed heuristic review; sample before apply."] : allReasons,
      recommendation: approved ? "approved" : "needs_review",
      llmGenerated:   true,
      claudeBatch:    true,
    },
  };
}

function buildOutput(row, proposal) {
  const validated = validateGenerated(row, proposal);
  return {
    id:               row.id,
    retrieval_scope:  row.retrieval_scope || "",
    topic:            row.topic || "",
    mentor_rule_family: classifyMentorRow(row),
    problem_tags:     row.problem_tags || "",
    title:            row.advice_card_title || row.user_problem_summary || row.topic || "",
    original: {
      P_mentor:             row.P_mentor             || "",
      A_action:             row.A_action             || "",
      action_summary:       row.action_summary       || "",
      user_problem_summary: row.user_problem_summary || "",
      H_hook:               row.H_hook               || "",
      E_example:            row.E_example            || "",
      I_insight:            row.I_insight            || "",
      source_text_for_generation: sourceTextForGeneration(row),
      detail_text_for_review:     detailTextForReview(row),
    },
    dbDisplay: {
      humanized_mentor_insight:  row.humanized_mentor_insight  || "",
      humanized_hr_perspective:  row.humanized_hr_perspective  || "",
      perspective_review_status: row.perspective_review_status || "",
      perspective_source:        row.perspective_source        || "",
      perspective_confidence:    row.perspective_confidence    || "",
    },
    proposed: {
      humanized_mentor_insight:  validated.mentor,
      perspective_review_status: validated.review.recommendation === "approved" ? "approved" : "needs_review",
      perspective_source:        PERSPECTIVE_SOURCE,
      perspective_confidence:    Number(proposal.perspective_confidence || 0.82),
    },
    review: validated.review,
  };
}

// ── DB fetch ──────────────────────────────────────────────────────────────────
async function fetchRows(pool) {
  const params = [];
  const where  = [
    `concat_ws(' ', "P_mentor", "A_action", action_summary, user_problem_summary, "H_hook", "E_example") <> ''`,
  ];
  if (!OVERWRITE) {
    where.push(`COALESCE(humanized_mentor_insight, '') = ''`);
  }
  if (SCOPE !== "all") {
    params.push(SCOPE);
    where.push(`retrieval_scope = $${params.length}`);
  }
  const limitSql  = LIMIT > 0 ? `LIMIT ${LIMIT}`  : "";
  const offsetSql = OFFSET > 0 ? `OFFSET ${OFFSET}` : "";
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLUMNS}
       FROM segments
      WHERE ${where.join(" AND ")}
      ORDER BY id
      ${limitSql}
      ${offsetSql}`,
    params
  );
  return rows;
}

// ── load from hold JSON ───────────────────────────────────────────────────────
function loadHoldRows(holdPath) {
  const resolved = path.resolve(process.cwd(), holdPath);
  const payload  = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const items    = Array.isArray(payload.rows) ? payload.rows : [];
  // hold rows store DB fields in row.original; reconstruct a DB-like row
  return items.map((item) => ({
    id:                   item.id,
    retrieval_scope:      item.retrieval_scope || "",
    topic:                item.topic           || "",
    L1:                   item.original?.L1    || "",
    L2:                   item.original?.L2    || "",
    advice_card_title:    item.title           || "",
    problem_tags:         item.problem_tags    || "",
    role_family:          item.mentor_rule_family || "",
    target_roles:         item.original?.target_roles || "",
    user_problem_summary: item.original?.user_problem_summary || "",
    action_summary:       item.original?.action_summary       || "",
    P_mentor:             item.original?.P_mentor             || "",
    A_action:             item.original?.A_action             || "",
    I_insight:            item.original?.I_insight            || "",
    H_hook:               item.original?.H_hook               || "",
    E_example:            item.original?.E_example            || "",
    HR_os:                item.original?.HR_os                || "",
    retrieval_text:       item.original?.retrieval_text       || "",
    humanized_mentor_insight:  item.dbDisplay?.humanized_mentor_insight  || "",
    humanized_hr_perspective:  item.dbDisplay?.humanized_hr_perspective  || "",
    perspective_review_status: item.dbDisplay?.perspective_review_status || "",
    perspective_source:        item.dbDisplay?.perspective_source        || "",
    perspective_confidence:    item.dbDisplay?.perspective_confidence    || "",
  }));
}

// ── load approved from file (for --apply-file) ────────────────────────────────
function loadApprovedFromFile(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  const payload  = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const rows     = Array.isArray(payload.rows) ? payload.rows : [];
  return rows.filter((row) => row.review && row.review.recommendation === "approved");
}

// ── apply ─────────────────────────────────────────────────────────────────────
async function backupRows(pool, ids, backupPath) {
  if (!ids.length) return;
  const { rows } = await pool.query(
    `SELECT id,
            to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
            to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status,
            to_jsonb(segments)->>'perspective_source' AS perspective_source,
            to_jsonb(segments)->>'perspective_confidence' AS perspective_confidence
       FROM segments WHERE id = ANY($1::int[])`,
    [ids]
  );
  const stream = fs.createWriteStream(backupPath, { flags: "a", encoding: "utf8" });
  for (const row of rows) {
    stream.write(JSON.stringify({
      id:                        row.id,
      old_humanized_mentor_insight:  row.humanized_mentor_insight  || "",
      old_perspective_review_status: row.perspective_review_status || "",
      old_perspective_source:        row.perspective_source        || "",
      old_perspective_confidence:    row.perspective_confidence    || "",
    }) + "\n");
  }
  await new Promise((resolve, reject) => { stream.end(resolve); stream.on("error", reject); });
}

async function applyApproved(pool, approvedRows) {
  // id=29 must never be written
  const safe = approvedRows.filter((row) => Number(row.id) !== 29);
  const skippedId29 = approvedRows.length - safe.length;
  if (skippedId29 > 0) {
    console.warn(`[GUARD] Skipped id=29 (${skippedId29} row(s) filtered before apply).`);
  }

  for (let start = 0; start < safe.length; start += APPLY_CHUNK_SIZE) {
    const chunk = safe.slice(start, start + APPLY_CHUNK_SIZE);
    await pool.query("BEGIN");
    try {
      await pool.query(`
        CREATE TEMP TABLE IF NOT EXISTS seg_mentor_claude_batch_updates (
          id integer PRIMARY KEY,
          humanized_mentor_insight  text NOT NULL,
          perspective_review_status text NOT NULL,
          perspective_source        text NOT NULL,
          perspective_confidence    numeric
        ) ON COMMIT DROP
      `);
      await pool.query("TRUNCATE seg_mentor_claude_batch_updates");
      const params = [];
      const values = chunk.map((item, index) => {
        params.push(
          item.id,
          item.proposed.humanized_mentor_insight,
          item.proposed.perspective_review_status,
          item.proposed.perspective_source,
          item.proposed.perspective_confidence
        );
        const o = index * 5;
        return `($${o+1}, $${o+2}, $${o+3}, $${o+4}, $${o+5})`;
      });
      await pool.query(
        `INSERT INTO seg_mentor_claude_batch_updates
           (id, humanized_mentor_insight, perspective_review_status, perspective_source, perspective_confidence)
         VALUES ${values.join(",")}`,
        params
      );
      await pool.query(`
        UPDATE segments AS target
           SET humanized_mentor_insight  = updates.humanized_mentor_insight,
               perspective_review_status = updates.perspective_review_status,
               perspective_source        = updates.perspective_source,
               perspective_confidence    = updates.perspective_confidence
          FROM seg_mentor_claude_batch_updates AS updates
         WHERE target.id = updates.id
           AND (${OVERWRITE ? "TRUE" : "COALESCE(target.humanized_mentor_insight, '') = ''"})
      `);
      await pool.query("COMMIT");
    } catch (err) {
      await pool.query("ROLLBACK");
      throw err;
    }
  }
  return safe.length;
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  // safety guards
  if (APPLY && LIMIT === 0 && !ALL && !APPLY_FILE) {
    throw new Error("Full apply requires --all. Use --apply --all after reviewing dry-run output.");
  }
  if (APPLY_FILE && !APPLY) {
    throw new Error("--apply-file requires --apply to prevent accidentally writing stale artifacts.");
  }
  if (!APPLY_FILE && !process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required for Claude generation.");
  }

  const ts             = timestamp();
  const resolvedOutDir = ensureDir(path.resolve(process.cwd(), OUT_DIR));
  const fullPath       = path.join(resolvedOutDir, `mentor_claude_batch_${ts}.json`);
  const approvedPath   = path.join(resolvedOutDir, `mentor_claude_batch_${ts}_approved.json`);
  const holdPath       = path.join(resolvedOutDir, `mentor_claude_batch_${ts}_hold.json`);
  const csvPath        = path.join(resolvedOutDir, `mentor_claude_batch_${ts}.csv`);
  const approvedCsvPath= path.join(resolvedOutDir, `mentor_claude_batch_${ts}_approved.csv`);
  const holdCsvPath    = path.join(resolvedOutDir, `mentor_claude_batch_${ts}_hold.csv`);
  const backupPath     = path.join(
    ensureDir(path.join(process.cwd(), "data", "backups")),
    `segments_mentor_claude_batch_${ts}.jsonl`
  );

  console.log(JSON.stringify({
    mode:       APPLY_FILE ? "apply-from-file" : APPLY ? "generate-and-apply" : "dry-run",
    limit:      LIMIT || "all",
    offset:     OFFSET,
    batchSize:  BATCH_SIZE,
    scope:      SCOPE,
    model:      MODEL,
    overwrite:  OVERWRITE,
    applyFile:  APPLY_FILE || "",
    fromHold:   FROM_HOLD  || "",
    outDir:     resolvedOutDir,
  }, null, 2));

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '30min'");

  // ── path A: apply-file mode (no generation) ────────────────────────────────
  if (APPLY_FILE) {
    const approved = loadApprovedFromFile(APPLY_FILE);
    console.log(`Loaded ${approved.length} approved row(s) from ${APPLY_FILE}`);

    // forbidden-phrase scan before writing anything
    const dangerous = approved.filter((row) =>
      /我会帮你|我会把|我会从|我会陪你|我初筛|我第一眼|招聘|面试官|机筛/.test(
        row.proposed?.humanized_mentor_insight || ""
      )
    );
    if (dangerous.length) {
      console.error("[BLOCK] Forbidden phrases found in approved rows before apply:");
      dangerous.slice(0, 5).forEach((row) => console.error(`  id=${row.id}: ${row.proposed.humanized_mentor_insight}`));
      throw new Error(`Apply blocked: ${dangerous.length} row(s) contain forbidden phrases.`);
    }

    const ids = approved.map((r) => Number(r.id)).filter(Number.isFinite);
    await backupRows(pool, ids, backupPath);
    console.log(`backup=${backupPath}`);
    const applied = await applyApproved(pool, approved);
    console.log(JSON.stringify({ applied, backupPath }, null, 2));
    return;
  }

  // ── path B: generation mode ────────────────────────────────────────────────
  let rows;
  if (FROM_HOLD) {
    rows = loadHoldRows(FROM_HOLD);
    if (LIMIT > 0) rows = rows.slice(OFFSET, OFFSET + LIMIT);
    console.log(`Loaded ${rows.length} row(s) from hold file: ${FROM_HOLD}`);
  } else {
    rows = await fetchRows(pool);
    console.log(`Loaded ${rows.length} row(s) from DB`);
  }

  const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const outputs = [];

  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch     = rows.slice(start, start + BATCH_SIZE);
    let proposals;
    try {
      proposals = await generateBatch(client, batch);
    } catch (err) {
      console.error(`[ERROR] Batch ${start}-${start + batch.length - 1} failed: ${err.message}`);
      // emit hold entries for failed batch so we don't lose the IDs
      proposals = batch.map((row) => ({ id: row.id, humanized_mentor_insight: "", perspective_confidence: 0 }));
    }
    const byId = new Map(proposals.map((p) => [Number(p.id), p]));
    outputs.push(...batch.map((row) => buildOutput(row, byId.get(Number(row.id)) || {})));
    console.log(`generated=${Math.min(start + BATCH_SIZE, rows.length)}/${rows.length}`);
  }

  const approved = outputs.filter((row) => row.review.recommendation === "approved");
  const hold     = outputs.filter((row) => row.review.recommendation !== "approved");

  // write artifacts
  fs.writeFileSync(fullPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    table:       "vibe_offer.segments",
    dryRun:      !APPLY,
    model:       MODEL,
    rows:        outputs,
    reviewSummary: summarize(outputs),
  }, null, 2) + "\n", "utf8");
  fs.writeFileSync(approvedPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    table:       "vibe_offer.segments",
    model:       MODEL,
    rows:        approved,
    reviewSummary: summarize(approved),
  }, null, 2) + "\n", "utf8");
  fs.writeFileSync(holdPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    table:       "vibe_offer.segments",
    model:       MODEL,
    rows:        hold,
    reviewSummary: summarize(hold),
  }, null, 2) + "\n", "utf8");
  writeCsv(csvPath, outputs);
  writeCsv(approvedCsvPath, approved);
  writeCsv(holdCsvPath, hold);

  console.log(JSON.stringify({
    rows:         outputs.length,
    approvedRows: approved.length,
    holdRows:     hold.length,
    reviewSummary: summarize(outputs),
    fullPath,
    approvedPath,
    holdPath,
    csvPath,
    approvedCsvPath,
    holdCsvPath,
    applied: APPLY,
  }, null, 2));

  if (!APPLY) {
    console.log("\nDry run only. After reviewing the CSV:");
    console.log(`  node scripts/generate_segments_mentor_insight_claude_batch.js --apply --apply-file=${approvedPath}`);
    return;
  }

  // apply in same run (only if --apply passed alongside generation)
  const dangerous = approved.filter((row) =>
    /我会帮你|我会把|我会从|我会陪你|我初筛|我第一眼|招聘|面试官|机筛/.test(
      row.proposed?.humanized_mentor_insight || ""
    )
  );
  if (dangerous.length) {
    console.error("[BLOCK] Forbidden phrases found; apply aborted. Re-run with --apply-file after manual review.");
    return;
  }

  const ids = approved.map((r) => Number(r.id)).filter(Number.isFinite);
  await backupRows(pool, ids, backupPath);
  console.log(`backup=${backupPath}`);
  const applied = await applyApproved(pool, approved);
  console.log(`applied=${applied}`);
}

if (require.main === module) {
  main().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { promptRows, validateGenerated, buildOutput, loadHoldRows };
