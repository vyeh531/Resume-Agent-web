"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const FAIL_FAST = process.argv.includes("--fail-fast");
const ACK_EXTERNAL_TRANSLATION = process.argv.includes("--acknowledge-external-translation");
const APPLY_FILE = (process.argv.find((arg) => arg.startsWith("--apply-file=")) || "").slice("--apply-file=".length);
const DRY_RUN_APPLY_FILE = (process.argv.find((arg) => arg.startsWith("--dry-run-apply-file=")) || "").slice("--dry-run-apply-file=".length);
const INPUT_FILE = (process.argv.find((arg) => arg.startsWith("--input-file=")) || "").slice("--input-file=".length);
const LIMIT = Number((process.argv.find((arg) => arg.startsWith("--limit=")) || "").slice("--limit=".length)) || 100;
const OFFSET = Number((process.argv.find((arg) => arg.startsWith("--offset=")) || "").slice("--offset=".length)) || 0;
const AFTER_ID = Number((process.argv.find((arg) => arg.startsWith("--after-id=")) || "").slice("--after-id=".length)) || 0;
const SHARD_COUNT = Number((process.argv.find((arg) => arg.startsWith("--shard-count=")) || "").slice("--shard-count=".length)) || 0;
const SHARD_INDEX = Number((process.argv.find((arg) => arg.startsWith("--shard-index=")) || "").slice("--shard-index=".length));
const BATCH_SIZE = Number((process.argv.find((arg) => arg.startsWith("--batch-size=")) || "").slice("--batch-size=".length)) ||
  Number(process.env.TRANSLATION_BATCH_SIZE || 25);
const CONCURRENCY = Number((process.argv.find((arg) => arg.startsWith("--concurrency=")) || "").slice("--concurrency=".length)) ||
  Number(process.env.TRANSLATION_CONCURRENCY || 3);
const PROFILE = ((process.argv.find((arg) => arg.startsWith("--profile=")) || "").slice("--profile=".length) ||
  process.env.TRANSLATION_PROFILE ||
  "core").toLowerCase();
const ORDER_BY = ((process.argv.find((arg) => arg.startsWith("--order-by=")) || "").slice("--order-by=".length) ||
  process.env.TRANSLATION_ORDER_BY ||
  "id").toLowerCase();
const MODEL = process.env.ANTHROPIC_TRANSLATION_MODEL || "claude-sonnet-4-6";

const ALL_OUTPUT_COLUMNS = [
  "advice_card_title_en",
  "user_problem_summary_en",
  "action_summary_en",
  "canonical_title_en",
  "humanized_mentor_insight_en",
  "humanized_hr_perspective_en",
  "humanized_mentor_insight_raw_en",
  "humanized_hr_perspective_raw_en",
  "humanized_mentor_insight_generalized_en",
  "humanized_hr_perspective_generalized_en",
];
const CORE_OUTPUT_COLUMNS = [
  "advice_card_title_en",
  "user_problem_summary_en",
  "action_summary_en",
  "canonical_title_en",
  "humanized_mentor_insight_en",
  "humanized_hr_perspective_en",
];
const OUTPUT_COLUMNS = PROFILE === "core" ? CORE_OUTPUT_COLUMNS : ALL_OUTPUT_COLUMNS;

function compact(value, max = 1200) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ""));
}

function validateRow(row) {
  const problems = [];
  for (const column of OUTPUT_COLUMNS) {
    if (row[column] && hasCjk(row[column])) problems.push(`${column}: contains CJK text`);
  }
  if (!row.advice_card_title_en && (row.advice_card_title || row.canonical_title)) problems.push("missing title translation");
  if (!row.action_summary_en && row.action_summary) problems.push("missing action translation");
  return problems;
}

function ensureOutputDir() {
  const dir = path.join(process.cwd(), "outputs", "segment-translations");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function parseJsonArray(text) {
  const cleaned = String(text || "").replace(/^```[a-z]*\s*/i, "").replace(/```$/i, "").trim();
  try {
    const match = cleaned.match(/\[[\s\S]*\]/);
    const parsed = JSON.parse(match ? match[0] : cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.rows)) return parsed.rows;
  } catch {}
  const rows = [];
  for (const line of cleaned.split(/\r?\n/)) {
    const trimmed = line.trim().replace(/,$/, "");
    if (!trimmed || !trimmed.startsWith("{")) continue;
    rows.push(JSON.parse(trimmed));
  }
  if (rows.length) return rows;
  throw new SyntaxError("Unable to parse model output as JSON array or NDJSON");
}

function chunkRows(rows, size) {
  const chunks = [];
  for (let i = 0; i < rows.length; i += size) chunks.push(rows.slice(i, i + size));
  return chunks;
}

function orderClause() {
  if (ORDER_BY === "quality") return "mentor_quality_score DESC NULLS LAST, id ASC";
  return "id ASC";
}

async function loadRows(pool) {
  if (SHARD_COUNT > 0 && (!Number.isInteger(SHARD_INDEX) || SHARD_INDEX < 0 || SHARD_INDEX >= SHARD_COUNT)) {
    throw new Error("--shard-index must be an integer from 0 to shard-count - 1.");
  }
  const params = [LIMIT];
  const filters = [
    "(retrieval_scope IS NULL OR retrieval_scope = 'resume_edit')",
    "COALESCE(advice_card_title, user_problem_summary, action_summary, canonical_title, '') <> ''",
    "COALESCE(to_jsonb(segments)->>'advice_card_title_en', '') = ''",
  ];
  if (AFTER_ID > 0) {
    params.push(AFTER_ID);
    filters.push(`id > $${params.length}`);
  }
  if (SHARD_COUNT > 0) {
    params.push(SHARD_COUNT);
    const shardCountParam = params.length;
    params.push(SHARD_INDEX);
    const shardIndexParam = params.length;
    filters.push(`MOD(id, $${shardCountParam}) = $${shardIndexParam}`);
  }
  const offsetSql = OFFSET > 0 ? `OFFSET ${Number.isFinite(OFFSET) ? Math.max(0, OFFSET) : 0}` : "";
  const { rows } = await pool.query(
    `SELECT id, chunk_id, topic, "L1", "L2",
            advice_card_title, user_problem_summary, action_summary, canonical_title,
            to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
            to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
            to_jsonb(segments)->>'humanized_mentor_insight_raw' AS humanized_mentor_insight_raw,
            to_jsonb(segments)->>'humanized_hr_perspective_raw' AS humanized_hr_perspective_raw,
            to_jsonb(segments)->>'humanized_mentor_insight_generalized' AS humanized_mentor_insight_generalized,
            to_jsonb(segments)->>'humanized_hr_perspective_generalized' AS humanized_hr_perspective_generalized,
            to_jsonb(segments)->>'advice_card_title_en' AS advice_card_title_en,
            to_jsonb(segments)->>'action_summary_en' AS action_summary_en
       FROM segments
      WHERE ${filters.join("\n        AND ")}
      ORDER BY ${orderClause()}
      LIMIT $1
      ${offsetSql}`,
    params
  );
  return rows;
}

function loadRowsFromFile(filePath) {
  const payload = JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
  const rows = Array.isArray(payload) ? payload : payload.rows;
  if (!Array.isArray(rows)) throw new Error("--input-file must contain a JSON array or an object with rows.");
  return rows.map((row) => ({
    ...row,
    id: Number(row.id),
  })).filter((row) => Number.isInteger(row.id) && row.id > 0);
}

function promptRows(rows) {
  return rows.map((row) => ({
    id: row.id,
    context: compact([row.topic, row.L1, row.L2].filter(Boolean).join(" / "), 220),
    advice_card_title: compact(row.advice_card_title, 180),
    user_problem_summary: compact(row.user_problem_summary, 300),
    action_summary: compact(row.action_summary, 420),
    canonical_title: compact(row.canonical_title, 180),
    humanized_mentor_insight: compact(row.humanized_mentor_insight, 520),
    humanized_hr_perspective: compact(row.humanized_hr_perspective, 520),
    humanized_mentor_insight_raw: compact(row.humanized_mentor_insight_raw, 520),
    humanized_hr_perspective_raw: compact(row.humanized_hr_perspective_raw, 520),
    humanized_mentor_insight_generalized: compact(row.humanized_mentor_insight_generalized, 520),
    humanized_hr_perspective_generalized: compact(row.humanized_hr_perspective_generalized, 520),
  }));
}

function projectedPromptRows(rows) {
  const rowsForPrompt = promptRows(rows);
  if (PROFILE !== "core") return rowsForPrompt;
  return rowsForPrompt.map((row) => ({
    id: row.id,
    context: row.context,
    advice_card_title: row.advice_card_title,
    user_problem_summary: row.user_problem_summary,
    action_summary: row.action_summary,
    canonical_title: row.canonical_title,
    humanized_mentor_insight: row.humanized_mentor_insight,
    humanized_hr_perspective: row.humanized_hr_perspective,
  }));
}

async function withRetry(fn, label) {
  let lastError;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const retryable = /rate|overload|timeout|429|529|ECONNRESET|ETIMEDOUT/i.test(String(error?.message || ""));
      if (!retryable || attempt === 4) break;
      const delay = Math.min(30000, 1200 * 2 ** (attempt - 1));
      console.warn(`[retry] ${label} attempt ${attempt} failed: ${error.message}. Waiting ${delay}ms.`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

async function generateTranslations(client, rows, batchIndex = 0) {
  const inputRows = promptRows(rows);
  const projectedRows = projectedPromptRows(rows);
  const message = await withRetry(() => client.messages.create({
      model: MODEL,
      max_tokens: Number(process.env.TRANSLATION_MAX_TOKENS || 16000),
      system: [
        "You localize resume coaching content from Simplified Chinese into natural American English.",
        "Return ONLY newline-delimited JSON (NDJSON): one compact JSON object per line, no markdown, no array wrapper.",
        `Each object must include id and these keys: ${OUTPUT_COLUMNS.join(", ")}.`,
        "Keep the same ids. Do not add companies, schools, metrics, tools, awards, or facts not present in the source.",
        "Do not change the advice intent. Preserve ATS/JD/resume terminology.",
        "Use concise career coaching language, not literal translation.",
        "Avoid double quote characters inside values. Use apostrophes or no quote marks for quoted phrases.",
        "If a source field is empty, return an empty string for that English field.",
      ].join(" "),
      messages: [{
        role: "user",
        content: JSON.stringify(projectedRows, null, 2),
      }],
    }), `batch ${batchIndex}`);
  const rawText = message.content?.[0]?.text || "";
  try {
    return parseJsonArray(rawText);
  } catch (error) {
    const dir = ensureOutputDir();
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const prefix = path.join(dir, `segments_en_batch_${batchIndex}_${stamp}_failed`);
    fs.writeFileSync(`${prefix}_raw.txt`, rawText);
    fs.writeFileSync(`${prefix}_input.json`, JSON.stringify(inputRows, null, 2));
    error.message = `${error.message}. Saved failed batch raw response to ${prefix}_raw.txt`;
    throw error;
  }
}

function mergeOutputs(sourceRows, translatedRows) {
  const sourceById = new Map(sourceRows.map((row) => [Number(row.id), row]));
  return translatedRows.map((proposal) => {
    const source = sourceById.get(Number(proposal.id)) || {};
    const row = { id: Number(proposal.id) };
    for (const column of ALL_OUTPUT_COLUMNS) row[column] = compact(proposal[column], 1600);
    row.translation_review_status = "pending_review";
    row.translation_source = `anthropic:${MODEL}`;
    row.review = {
      problems: validateRow({ ...source, ...row }),
      recommendation: validateRow({ ...source, ...row }).length ? "hold" : "approved",
    };
    row.source = source;
    return row;
  });
}

function loadApplyPayload(filePath) {
  const payload = JSON.parse(fs.readFileSync(path.resolve(filePath), "utf8"));
  const rows = Array.isArray(payload) ? payload : payload.rows;
  if (!Array.isArray(rows)) throw new Error("Apply file must contain a JSON array or an object with rows.");
  return { payload, rows };
}

function summarizeApplyFile(filePath) {
  const { payload, rows } = loadApplyPayload(filePath);
  const seen = new Set();
  const duplicateIds = new Set();
  const approvedRows = [];
  const holdRows = [];
  for (const row of rows) {
    const id = Number(row.id);
    if (seen.has(id)) duplicateIds.add(id);
    seen.add(id);
    const approved = row.review
      ? row.review.recommendation === "approved"
      : row.translation_review_status === "approved";
    if (approved) approvedRows.push(row);
    else holdRows.push(row);
  }
  const profile = payload.profile === "full" ? "full" : "core";
  const columnsToApply = profile === "core" ? CORE_OUTPUT_COLUMNS : ALL_OUTPUT_COLUMNS;
  return {
    filePath: path.resolve(filePath),
    profile,
    columnsToApply,
    totalRows: rows.length,
    approvedRows: approvedRows.length,
    holdRows: holdRows.length,
    duplicateIds: [...duplicateIds],
    sourceFile: payload.sourceFile || null,
    mode: payload.mode || null,
  };
}

async function applyFile(pool, filePath) {
  const { payload, rows: allRows } = loadApplyPayload(filePath);
  const rows = allRows.filter((row) => (
    row.review ? row.review.recommendation === "approved" : row.translation_review_status === "approved"
  ));
  if (!rows.length) throw new Error("No approved rows found in apply file.");
  const columnsToApply = payload.profile === "core" ? CORE_OUTPUT_COLUMNS : ALL_OUTPUT_COLUMNS;
  const setColumnsSql = columnsToApply.map((column, index) => `${column} = $${index + 2}`).join(",\n                ");
  await pool.query("BEGIN");
  try {
    for (const row of rows) {
      await pool.query(
        `UPDATE segments
            SET ${setColumnsSql},
                translation_review_status = 'approved',
                translation_source = COALESCE($${columnsToApply.length + 2}, translation_source),
                translation_updated_at = now()
          WHERE id = $1`,
        [
          row.id,
          ...columnsToApply.map((column) => row[column] || ""),
          row.translation_source || null,
        ]
      );
    }
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
  console.log(`Applied ${rows.length} approved translation row(s).`);
}

async function main() {
  let pool;
  try {
    if (DRY_RUN_APPLY_FILE) {
      console.log(JSON.stringify({
        dryRun: true,
        ...summarizeApplyFile(DRY_RUN_APPLY_FILE),
      }, null, 2));
      return;
    }
    if (APPLY_FILE) {
      if (!APPLY) throw new Error("--apply-file requires --apply");
      pool = db.getPool();
      await applyFile(pool, APPLY_FILE);
      return;
    }
    if (!ACK_EXTERNAL_TRANSLATION) {
      throw new Error(
        "This command sends segment text to Anthropic. Re-run with --acknowledge-external-translation after confirming this data export is acceptable."
      );
    }
    if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is required unless using --apply-file");
    const rows = INPUT_FILE ? loadRowsFromFile(INPUT_FILE) : await loadRows(pool = db.getPool());
    const batches = chunkRows(rows, Math.max(1, BATCH_SIZE));
    const outputRows = [];
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const dir = ensureOutputDir();
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    let nextBatchIndex = 0;
    let completedBatches = 0;
    const failedBatches = [];
    async function worker(workerIndex) {
      while (nextBatchIndex < batches.length) {
        const index = nextBatchIndex;
        nextBatchIndex += 1;
        const batch = batches[index];
        console.log(`Worker ${workerIndex}: generating batch ${index + 1}/${batches.length} (${batch.length} rows)...`);
        try {
          const translated = await generateTranslations(client, batch, index + 1);
          outputRows.push(...mergeOutputs(batch, translated));
          completedBatches += 1;
        } catch (error) {
          failedBatches.push({
            batch: index + 1,
            worker: workerIndex,
            rowIds: batch.map((row) => row.id),
            error: error.message,
          });
          console.error(`[batch failed] ${index + 1}/${batches.length}: ${error.message}`);
          if (FAIL_FAST) throw error;
        }
        outputRows.sort((a, b) => Number(a.id) - Number(b.id));
        const partialPath = path.join(dir, `segments_en_${stamp}_partial.json`);
        fs.writeFileSync(partialPath, JSON.stringify({
          generatedAt: new Date().toISOString(),
          mode: APPLY ? "generate-only-apply-disabled" : "dry-run",
          batchSize: BATCH_SIZE,
          concurrency: CONCURRENCY,
          profile: PROFILE,
          orderBy: ORDER_BY,
          offset: OFFSET,
          afterId: AFTER_ID,
          inputFile: INPUT_FILE || null,
          acknowledgedExternalTranslation: ACK_EXTERNAL_TRANSLATION,
          shardCount: SHARD_COUNT,
          shardIndex: Number.isInteger(SHARD_INDEX) ? SHARD_INDEX : null,
          failFast: FAIL_FAST,
          completedBatches,
          failedBatches,
          totalBatches: batches.length,
          rows: outputRows,
        }, null, 2));
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, batches.length) }, (_, index) => worker(index + 1)));
    outputRows.sort((a, b) => Number(a.id) - Number(b.id));
    const outPath = path.join(dir, `segments_en_${stamp}.json`);
    fs.writeFileSync(outPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      mode: APPLY ? "generate-only-apply-disabled" : "dry-run",
      batchSize: BATCH_SIZE,
      concurrency: CONCURRENCY,
      profile: PROFILE,
      orderBy: ORDER_BY,
      offset: OFFSET,
      afterId: AFTER_ID,
      inputFile: INPUT_FILE || null,
      acknowledgedExternalTranslation: ACK_EXTERNAL_TRANSLATION,
      shardCount: SHARD_COUNT,
      shardIndex: Number.isInteger(SHARD_INDEX) ? SHARD_INDEX : null,
      failFast: FAIL_FAST,
      completedBatches,
      failedBatches,
      rows: outputRows,
    }, null, 2));
    console.log(JSON.stringify({
      requestedRows: rows.length,
      rows: outputRows.length,
      approved: outputRows.filter((row) => row.review.recommendation === "approved").length,
      hold: outputRows.filter((row) => row.review.recommendation !== "approved").length,
      batchSize: BATCH_SIZE,
      concurrency: CONCURRENCY,
      profile: PROFILE,
      orderBy: ORDER_BY,
      offset: OFFSET,
      afterId: AFTER_ID,
      inputFile: INPUT_FILE || null,
      acknowledgedExternalTranslation: ACK_EXTERNAL_TRANSLATION,
      shardCount: SHARD_COUNT,
      shardIndex: Number.isInteger(SHARD_INDEX) ? SHARD_INDEX : null,
      failFast: FAIL_FAST,
      completedBatches,
      failedBatches: failedBatches.length,
      outPath,
    }, null, 2));
    console.log(`Review the file, mark rows approved if needed, then run: node scripts/generate_segments_en_translations.js --apply --apply-file=${outPath}`);
  } finally {
    if (pool) await db.closeDB();
  }
}

main().catch((error) => {
  console.error(error);
  db.closeDB().finally(() => process.exit(1));
});
