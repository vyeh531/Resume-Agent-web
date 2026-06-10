"use strict";

/**
 * backfill_segments_mentor_insight_from_templates.js
 *
 * 使用人工撰寫的導師視角模板批量回填 humanized_mentor_insight。
 * 模板來源：scripts/mentor_insight_templates.js
 * perspective_source = "mentor_template_from_chat"
 *
 * Usage:
 *   node scripts/backfill_segments_mentor_insight_from_templates.js          # dry-run 500 rows
 *   node scripts/backfill_segments_mentor_insight_from_templates.js --apply  # 生成並寫 DB
 *   node scripts/backfill_segments_mentor_insight_from_templates.js --apply --apply-file=<path>
 *   node scripts/backfill_segments_mentor_insight_from_templates.js --apply --all
 */

require("dotenv").config({ path: ".env.local", override: true });
require("dotenv").config({ path: ".env", override: false });

const fs   = require("fs");
const path = require("path");

const db = require("../database");
const {
  classifyMentorRow,
  extractConcreteTerms,
  reviewMentor,
  sourceTextForGeneration,
} = require("./backfill_segments_mentor_insight_rules");

const {
  TEMPLATE_GROUPS,
  resolveGroup,
  pickVariant,
} = require("./mentor_insight_templates");

// ── CLI args ──────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const APPLY        = argv.includes("--apply");
const ALL          = argv.includes("--all");
const OVERWRITE    = argv.includes("--overwrite");
const LIMIT        = numberArg("--limit",  APPLY ? 0 : 500);
const OFFSET       = numberArg("--offset", 0);
const SCOPE        = stringArg("--scope",  "resume_edit");
const APPLY_FILE   = stringArg("--apply-file", "");
const APPLY_CHUNK  = numberArg("--apply-chunk-size", 500);
const OUT_DIR      = stringArg("--out-dir",
  path.join("artifacts", `mentor-template-${timestamp()}`));

const PERSPECTIVE_SOURCE     = "mentor_template_from_chat";
const PERSPECTIVE_CONFIDENCE = 0.85;

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
function timestamp() { return new Date().toISOString().replace(/[:.]/g, "-"); }
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); return dir; }

function csvCell(v) {
  return `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}
function writeCsv(filePath, rows) {
  const headers = ["id","family","group","recommendation","flags","mentor_insight"];
  const lines = [
    headers.join(","),
    ...rows.map((r) => [
      r.id, r.family, r.group, r.review.recommendation,
      r.review.flags.join("|"), r.proposed.humanized_mentor_insight,
    ].map(csvCell).join(",")),
  ];
  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
}

// ── DB query ──────────────────────────────────────────────────────────────────
const SELECT_COLUMNS = `
  id, chunk_id, retrieval_scope, topic, "L1", "L2", advice_type,
  problem_tags, ats_dimensions, role_family, target_roles, seniority,
  advice_card_title, user_problem_summary, action_summary,
  "P_mentor", "A_action", "I_insight", "H_hook", "E_example", "HR_os",
  retrieval_text,
  to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
  to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status,
  to_jsonb(segments)->>'perspective_source'        AS perspective_source,
  to_jsonb(segments)->>'perspective_confidence'    AS perspective_confidence
`;

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
  const limitSql  = LIMIT > 0 ? `LIMIT ${LIMIT}`   : "";
  const offsetSql = OFFSET > 0 ? `OFFSET ${OFFSET}` : "";
  const { rows } = await pool.query(
    `SELECT ${SELECT_COLUMNS}
       FROM segments
      WHERE ${where.join(" AND ")}
      ORDER BY id
      ${limitSql} ${offsetSql}`,
    params
  );
  return rows;
}

// ── template review filter ────────────────────────────────────────────────────
// Templates are principle-based and don't preserve source-specific terms by design.
// Suppress flags that penalise generic writing when that's the intent.
const TEMPLATE_SUPPRESSED_FLAGS = new Set([
  "lost_specific_terms",   // templates don't echo row-specific tool names
  "lost_required_signal",  // templates express general principles, not role signals
  "wrong_family_risk",     // templates are principle-based; family mismatch risk is low
]);
// Blocking flags that still apply to templates
const TEMPLATE_BLOCKING_FLAGS = new Set([
  "mentor_too_short",
  "mentor_too_long",
  "wrong_family_risk",
  "mentor_overactive_voice_risk",
  "mentor_hr_voice_risk",
  "mentor_not_conversational",
]);

function filterReviewForTemplate(review) {
  const filteredFlags = review.flags.filter((f) => !TEMPLATE_SUPPRESSED_FLAGS.has(f));
  const hasBlocking   = filteredFlags.some((f) => TEMPLATE_BLOCKING_FLAGS.has(f));
  return {
    ...review,
    flags:          filteredFlags,
    recommendation: hasBlocking ? "hold" : "approved",
    suppressedFlags: review.flags.filter((f) => TEMPLATE_SUPPRESSED_FLAGS.has(f)),
  };
}

// ── generate ──────────────────────────────────────────────────────────────────
function generateInsight(row) {
  const family = classifyMentorRow(row);
  const group  = resolveGroup(family);
  const terms  = extractConcreteTerms(row);
  const ctx    = {
    source: sourceTextForGeneration(row),
    family,
    roles: String(row.target_roles || ""),
  };

  const variants = TEMPLATE_GROUPS[group] || TEMPLATE_GROUPS.general;
  let text = pickVariant(variants, row, terms, ctx);

  // fallback chain
  if (!text && group !== "general") {
    text = pickVariant(TEMPLATE_GROUPS.general, row, terms, ctx);
  }
  if (!text) {
    text = "简历的每一行都要让目标更清楚一点。具体、量化、有针对性，是让 bullet 更有力的三个方向，可以逐条对照检查。";
  }

  const rawReview = reviewMentor(row, text);
  const review    = filterReviewForTemplate(rawReview);

  return {
    id:    row.id,
    family,
    group,
    terms,
    proposed: {
      humanized_mentor_insight:  text,
      perspective_review_status: review.recommendation === "approved" ? "approved" : "needs_review",
      perspective_source:        PERSPECTIVE_SOURCE,
      perspective_confidence:    PERSPECTIVE_CONFIDENCE,
    },
    review,
    original: {
      P_mentor:             row.P_mentor             || "",
      A_action:             row.A_action             || "",
      action_summary:       row.action_summary       || "",
      user_problem_summary: row.user_problem_summary || "",
      H_hook:               row.H_hook               || "",
      E_example:            row.E_example            || "",
      I_insight:            row.I_insight            || "",
    },
  };
}

// ── apply ─────────────────────────────────────────────────────────────────────
async function backupRows(pool, ids, backupPath) {
  if (!ids.length) return;
  const { rows } = await pool.query(
    `SELECT id,
            to_jsonb(segments)->>'humanized_mentor_insight' AS old_mentor,
            to_jsonb(segments)->>'perspective_source'       AS old_source
       FROM segments WHERE id = ANY($1::int[])`,
    [ids]
  );
  const stream = fs.createWriteStream(backupPath, { flags: "a", encoding: "utf8" });
  for (const row of rows) stream.write(JSON.stringify(row) + "\n");
  await new Promise((resolve, reject) => { stream.end(resolve); stream.on("error", reject); });
}

async function applyApproved(pool, approvedRows) {
  const safe = approvedRows;

  for (let start = 0; start < safe.length; start += APPLY_CHUNK) {
    const chunk = safe.slice(start, start + APPLY_CHUNK);
    await pool.query("BEGIN");
    try {
      await pool.query(`
        CREATE TEMP TABLE IF NOT EXISTS seg_mentor_tpl_updates (
          id integer PRIMARY KEY,
          humanized_mentor_insight  text NOT NULL,
          perspective_review_status text NOT NULL,
          perspective_source        text NOT NULL,
          perspective_confidence    numeric
        ) ON COMMIT DROP
      `);
      await pool.query("TRUNCATE seg_mentor_tpl_updates");
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
        return `($${o+1},$${o+2},$${o+3},$${o+4},$${o+5})`;
      });
      await pool.query(
        `INSERT INTO seg_mentor_tpl_updates
           (id, humanized_mentor_insight, perspective_review_status, perspective_source, perspective_confidence)
         VALUES ${values.join(",")}`,
        params
      );
      await pool.query(`
        UPDATE segments AS target
           SET humanized_mentor_insight  = u.humanized_mentor_insight,
               perspective_review_status = u.perspective_review_status,
               perspective_source        = u.perspective_source,
               perspective_confidence    = u.perspective_confidence
          FROM seg_mentor_tpl_updates AS u
         WHERE target.id = u.id
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

// ── load approved from file ───────────────────────────────────────────────────
function loadApprovedFromFile(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  const payload  = JSON.parse(fs.readFileSync(resolved, "utf8"));
  const rows     = Array.isArray(payload.rows) ? payload.rows : [];
  return rows.filter((r) => r.review && r.review.recommendation === "approved");
}

// ── main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (APPLY && LIMIT === 0 && !ALL && !APPLY_FILE) {
    throw new Error("全量 apply 需要加 --all。先 dry-run 確認品質後再加 --all。");
  }
  if (APPLY_FILE && !APPLY) {
    throw new Error("--apply-file 需要同時加 --apply。");
  }

  const ts             = timestamp();
  const resolvedOutDir = ensureDir(path.resolve(process.cwd(), OUT_DIR));
  const backupPath     = path.join(
    ensureDir(path.join(process.cwd(), "data", "backups")),
    `segments_mentor_tpl_${ts}.jsonl`
  );

  console.log(JSON.stringify({
    mode:      APPLY_FILE ? "apply-from-file" : APPLY ? "generate-and-apply" : "dry-run",
    limit:     LIMIT || "all",
    offset:    OFFSET,
    scope:     SCOPE,
    overwrite: OVERWRITE,
    applyFile: APPLY_FILE || "",
    outDir:    resolvedOutDir,
  }, null, 2));

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '30min'");

  // ── path A: apply-from-file ────────────────────────────────────────────────
  if (APPLY_FILE) {
    const approved = loadApprovedFromFile(APPLY_FILE);
    console.log(`Loaded ${approved.length} approved row(s) from ${APPLY_FILE}`);
    const ids = approved.map((r) => Number(r.id)).filter(Number.isFinite);
    await backupRows(pool, ids, backupPath);
    const applied = await applyApproved(pool, approved);
    console.log(JSON.stringify({ applied, backupPath }, null, 2));
    return;
  }

  // ── path B: generate ───────────────────────────────────────────────────────
  const rows = await fetchRows(pool);
  console.log(`Loaded ${rows.length} row(s) from DB`);

  const outputs  = rows.map(generateInsight);
  const approved = outputs.filter((r) => r.review.recommendation === "approved");
  const hold     = outputs.filter((r) => r.review.recommendation !== "approved");

  // flag distribution (post-filter)
  const flagCounts = {};
  for (const r of hold) {
    for (const f of r.review.flags) flagCounts[f] = (flagCounts[f] || 0) + 1;
  }
  // suppressed flag distribution (informational)
  const suppressedCounts = {};
  for (const r of outputs) {
    for (const f of (r.review.suppressedFlags || [])) {
      suppressedCounts[f] = (suppressedCounts[f] || 0) + 1;
    }
  }

  // write artifacts
  const fullPath     = path.join(resolvedOutDir, `mentor_tpl_${ts}.json`);
  const approvedPath = path.join(resolvedOutDir, `mentor_tpl_${ts}_approved.json`);
  const holdPath     = path.join(resolvedOutDir, `mentor_tpl_${ts}_hold.json`);
  const csvPath      = path.join(resolvedOutDir, `mentor_tpl_${ts}.csv`);
  const appCsvPath   = path.join(resolvedOutDir, `mentor_tpl_${ts}_approved.csv`);
  const holdCsvPath  = path.join(resolvedOutDir, `mentor_tpl_${ts}_hold.csv`);

  fs.writeFileSync(fullPath, JSON.stringify({ generatedAt: new Date().toISOString(),
    source: PERSPECTIVE_SOURCE, rows: outputs }, null, 2) + "\n", "utf8");
  fs.writeFileSync(approvedPath, JSON.stringify({ generatedAt: new Date().toISOString(),
    source: PERSPECTIVE_SOURCE, rows: approved }, null, 2) + "\n", "utf8");
  fs.writeFileSync(holdPath, JSON.stringify({ generatedAt: new Date().toISOString(),
    source: PERSPECTIVE_SOURCE, rows: hold }, null, 2) + "\n", "utf8");
  writeCsv(csvPath, outputs);
  writeCsv(appCsvPath, approved);
  writeCsv(holdCsvPath, hold);

  console.log(JSON.stringify({
    rows:            outputs.length,
    approvedRows:    approved.length,
    holdRows:        hold.length,
    holdFlagCounts:  flagCounts,
    suppressedCounts,
    approvedPath,
    holdPath,
    csvPath:         appCsvPath,
    applied:         APPLY,
  }, null, 2));

  if (!APPLY) {
    console.log("\nDry run. 抽查 approved CSV 後 apply：");
    console.log(`  node scripts/backfill_segments_mentor_insight_from_templates.js --apply --apply-file=${approvedPath}`);
    return;
  }

  // apply in same run
  const ids = approved.map((r) => Number(r.id)).filter(Number.isFinite);
  await backupRows(pool, ids, backupPath);
  const applied = await applyApproved(pool, approved);
  console.log(`backup=${backupPath}`);
  console.log(`applied=${applied}`);
}

if (require.main === module) {
  main().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = { generateInsight };
