"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const db = require("../database");
const {
  PERSPECTIVE_SOURCE: RULES_SOURCE,
  sourceTextForGeneration,
  detailTextForReview,
  classifyMentorRow,
  reviewMentor,
} = require("./backfill_segments_mentor_insight_rules");

const argv = process.argv.slice(2);
const LIMIT = numberArg("--limit", 100);
const OFFSET = numberArg("--offset", 0);
const BATCH_SIZE = Math.min(Math.max(numberArg("--batch-size", 25), 1), 50);
const SCOPE = stringArg("--scope", "resume_edit");
const OUT_DIR = stringArg("--out-dir", path.join("artifacts", "mentor-insight-llm"));
const MODEL = stringArg("--model", process.env.MENTOR_HUMANIZE_MODEL || process.env.PERSPECTIVE_HUMANIZE_MODEL || "claude-sonnet-4-6");
const REVIEW_STATUS_APPROVED = "approved";
const REVIEW_STATUS_HOLD = "needs_review";
const PERSPECTIVE_SOURCE = "anthropic_mentor_from_p_mentor";

function numberArg(name, fallback) {
  const raw = argv.find((arg) => arg.startsWith(`${name}=`));
  if (!raw) return fallback;
  const value = Number(raw.slice(name.length + 1));
  return Number.isFinite(value) ? value : fallback;
}

function stringArg(name, fallback) {
  const raw = argv.find((arg) => arg.startsWith(`${name}=`));
  return raw ? raw.slice(name.length + 1) : fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function compact(value, max = 900) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function extractJsonArray(text) {
  const cleaned = String(text || "").replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("LLM response did not contain a JSON array");
  return JSON.parse(match[0]);
}

function splitCsv(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

function writeCsv(filePath, rows) {
  const headers = [
    "id",
    "retrieval_scope",
    "title",
    "mentor_rule_family",
    "recommendation",
    "review_flags",
    "review_reasons",
    "P_mentor",
    "A_action",
    "H_hook",
    "E_example",
    "I_insight_detail_review_only",
    "humanized_mentor_insight",
    "perspective_source",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((row) => [
      row.id,
      row.retrieval_scope,
      row.title,
      row.mentor_rule_family,
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
    ].map(csvCell).join(",")),
  ];
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function promptRows(rows) {
  return rows.map((row) => ({
    id: row.id,
    title: row.advice_card_title || row.topic || "",
    retrieval_scope: row.retrieval_scope || "",
    problem_tags: row.problem_tags || "",
    role_family: row.role_family || "",
    target_roles: row.target_roles || "",
    mentor_family_hint: classifyMentorRow(row),
    source_for_generation: {
      P_mentor: compact(row.P_mentor, 520),
      A_action: compact(row.A_action, 520),
      action_summary: compact(row.action_summary, 260),
      user_problem_summary: compact(row.user_problem_summary, 260),
      H_hook: compact(row.H_hook, 360),
      E_example: compact(row.E_example, 420),
    },
    detail_terms_to_preserve_if_present: compact(row.I_insight, 360),
  }));
}

function systemPrompt() {
  return [
    "你是资深简历导师文案编辑，只重写中文 mentor display copy。",
    "只返回 JSON array，不要 markdown，不要解释。",
    "每个元素必须是 {\"id\": number, \"humanized_mentor_insight\": string, \"perspective_confidence\": number}。",
    "主来源只能用 P_mentor、A_action、action_summary、user_problem_summary、H_hook、E_example。",
    "I_insight 只用于检查专业细节是否丢失，不要把 I_insight 当主文案改写。",
    "语气像已经工作一段时间的学长姐提醒学弟妹：口语、具体、有经验感，但不是代操作。",
    "禁止代操语气：不要写“我会帮你、我会把、我会从、我会陪你”。",
    "可以用：你这里、这条 bullet、建议、可以先、要补出、不要急着。",
    "每条最多 2 句，35-95 个中文字左右。",
    "必须保留来源里的具体细节，例如岗位方向、工具、指标、项目名、链接位置、签证状态、B2B/B2C、RAG、SQL、Notion 等。",
    "不要发明来源没有的工具、岗位、指标、数字、平台、项目或行动。",
    "如果来源只是在说 A，不要套成 B；例如 OPT 不等于 optimize，sponsorship 活动不等于工签，日期缩写不等于专业缩写。",
    "文案只给建议，不要像 HR 初筛，也不要吐槽学生。",
  ].join("\n");
}

async function generateBatch(client, rows) {
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 6000,
    temperature: 0.25,
    system: systemPrompt(),
    messages: [{
      role: "user",
      content: JSON.stringify(promptRows(rows), null, 2),
    }],
  });
  const raw = message.content?.[0]?.text || "";
  const parsed = extractJsonArray(raw);
  const byId = new Map(parsed.map((row) => [Number(row.id), row]));
  return rows.map((row) => byId.get(Number(row.id)) || { id: row.id, humanized_mentor_insight: "" });
}

function validateGenerated(row, proposal) {
  const mentor = compact(proposal.humanized_mentor_insight, 180);
  const review = reviewMentor(row, mentor);
  const flags = [...review.flags];
  const reasons = [...review.reasons];

  if (!mentor) {
    flags.push("llm_empty_output");
    reasons.push("LLM did not return mentor copy.");
  }
  if (/我会帮你|我会先帮|我会把|我会从|我会陪你/.test(mentor)) {
    flags.push("mentor_overactive_voice_risk");
    reasons.push("LLM mentor copy sounds like direct operation.");
  }
  if (/候选人|招聘方|HR会|初筛|筛选/i.test(mentor)) {
    flags.push("mentor_hr_voice_risk");
    reasons.push("Mentor copy sounds like HR/report voice instead of senior-schoolmate advice.");
  }

  const cleanFlags = [...new Set(flags.filter((flag) => flag !== "good_as_is"))];
  const cleanReasons = reasons.filter((reason) => !/^No mentor-only heuristic risks/i.test(reason));
  const approved = cleanFlags.length === 0;

  return {
    mentor,
    review: {
      ...review,
      flags: approved ? ["good_as_is"] : cleanFlags,
      reasons: approved ? ["LLM mentor copy passed heuristic review; still sampled before apply."] : cleanReasons,
      recommendation: approved ? "approved" : "needs_review",
      llmGenerated: true,
      ruleSourceForComparison: RULES_SOURCE,
    },
  };
}

function buildOutput(row, proposal) {
  const validated = validateGenerated(row, proposal);
  return {
    id: row.id,
    retrieval_scope: row.retrieval_scope || "",
    topic: row.topic || "",
    mentor_rule_family: classifyMentorRow(row),
    problem_tags: row.problem_tags || "",
    title: row.advice_card_title || row.user_problem_summary || row.topic || "",
    original: {
      P_mentor: row.P_mentor || "",
      A_action: row.A_action || "",
      action_summary: row.action_summary || "",
      user_problem_summary: row.user_problem_summary || "",
      H_hook: row.H_hook || "",
      E_example: row.E_example || "",
      I_insight: row.I_insight || "",
      source_text_for_generation: sourceTextForGeneration(row),
      detail_text_for_review: detailTextForReview(row),
    },
    dbDisplay: {
      humanized_mentor_insight: row.humanized_mentor_insight || "",
      humanized_hr_perspective: row.humanized_hr_perspective || "",
      perspective_review_status: row.perspective_review_status || "",
      perspective_source: row.perspective_source || "",
      perspective_confidence: row.perspective_confidence || "",
    },
    proposed: {
      humanized_mentor_insight: validated.mentor,
      perspective_review_status: validated.review.recommendation === "approved" ? REVIEW_STATUS_APPROVED : REVIEW_STATUS_HOLD,
      perspective_source: PERSPECTIVE_SOURCE,
      perspective_confidence: Number(proposal.perspective_confidence || 0.82),
    },
    review: validated.review,
  };
}

function summarize(rows) {
  return rows.reduce((acc, row) => {
    for (const flag of row.review.flags) acc[flag] = (acc[flag] || 0) + 1;
    return acc;
  }, {});
}

async function fetchRows(pool) {
  const params = [];
  const where = [
    `concat_ws(' ', "P_mentor", "A_action", action_summary, user_problem_summary, "H_hook", "E_example") <> ''`,
    `COALESCE(humanized_mentor_insight, '') = ''`,
  ];
  if (SCOPE !== "all") {
    params.push(SCOPE);
    where.push(`retrieval_scope = $${params.length}`);
  }
  const { rows } = await pool.query(
    `
      SELECT id, chunk_id, retrieval_scope, topic, "L1", "L2", advice_type,
             problem_tags, ats_dimensions, role_family, target_roles, seniority,
             advice_card_title, user_problem_summary, action_summary,
             "P_mentor", "A_action", "I_insight", "H_hook", "E_example", "HR_os",
             retrieval_text,
             to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
             to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
             to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status,
             to_jsonb(segments)->>'perspective_source' AS perspective_source,
             to_jsonb(segments)->>'perspective_confidence' AS perspective_confidence
        FROM segments
       WHERE ${where.join(" AND ")}
       ORDER BY id
       LIMIT ${LIMIT}
       OFFSET ${OFFSET}
    `,
    params
  );
  return rows;
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required for mentor LLM generation.");
  }
  const ts = timestamp();
  const resolvedOutDir = ensureDir(path.resolve(process.cwd(), OUT_DIR));
  const fullPath = path.join(resolvedOutDir, `mentor_insight_llm_${ts}.json`);
  const approvedPath = path.join(resolvedOutDir, `mentor_insight_llm_${ts}_approved.json`);
  const holdPath = path.join(resolvedOutDir, `mentor_insight_llm_${ts}_hold.json`);
  const csvPath = path.join(resolvedOutDir, `mentor_insight_llm_${ts}.csv`);
  const approvedCsvPath = path.join(resolvedOutDir, `mentor_insight_llm_${ts}_approved.csv`);
  const holdCsvPath = path.join(resolvedOutDir, `mentor_insight_llm_${ts}_hold.csv`);

  console.log(JSON.stringify({
    mode: "llm-dry-run",
    limit: LIMIT,
    offset: OFFSET,
    batchSize: BATCH_SIZE,
    scope: SCOPE,
    model: MODEL,
  }, null, 2));

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '30min'");
  const rows = await fetchRows(pool);
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const outputs = [];

  for (let start = 0; start < rows.length; start += BATCH_SIZE) {
    const batch = rows.slice(start, start + BATCH_SIZE);
    const proposals = await generateBatch(client, batch);
    const byId = new Map(proposals.map((proposal) => [Number(proposal.id), proposal]));
    outputs.push(...batch.map((row) => buildOutput(row, byId.get(Number(row.id)) || {})));
    console.log(`generated=${Math.min(start + BATCH_SIZE, rows.length)}/${rows.length}`);
  }

  const approved = outputs.filter((row) => row.review.recommendation === "approved");
  const hold = outputs.filter((row) => row.review.recommendation !== "approved");

  fs.writeFileSync(fullPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    table: "vibe_offer.segments",
    dryRun: true,
    model: MODEL,
    rows: outputs,
    reviewSummary: summarize(outputs),
  }, null, 2) + "\n", "utf8");
  fs.writeFileSync(approvedPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    table: "vibe_offer.segments",
    model: MODEL,
    rows: approved,
    reviewSummary: summarize(approved),
  }, null, 2) + "\n", "utf8");
  fs.writeFileSync(holdPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    table: "vibe_offer.segments",
    model: MODEL,
    rows: hold,
    reviewSummary: summarize(hold),
  }, null, 2) + "\n", "utf8");
  writeCsv(csvPath, outputs);
  writeCsv(approvedCsvPath, approved);
  writeCsv(holdCsvPath, hold);

  console.log(JSON.stringify({
    rows: outputs.length,
    approvedRows: approved.length,
    holdRows: hold.length,
    reviewSummary: summarize(outputs),
    fullPath,
    approvedPath,
    holdPath,
    csvPath,
    approvedCsvPath,
    holdCsvPath,
    applied: false,
  }, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  promptRows,
  validateGenerated,
  buildOutput,
};
