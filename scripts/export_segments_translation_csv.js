"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const LIMIT = Number((process.argv.find((arg) => arg.startsWith("--limit=")) || "").slice("--limit=".length)) || 1000;
const SHARD_COUNT = Number((process.argv.find((arg) => arg.startsWith("--shard-count=")) || "").slice("--shard-count=".length)) || 0;
const SHARD_INDEX = Number((process.argv.find((arg) => arg.startsWith("--shard-index=")) || "").slice("--shard-index=".length));
const OUT_FILE = (process.argv.find((arg) => arg.startsWith("--out=")) || "").slice("--out=".length);
const NO_BOM = process.argv.includes("--no-bom");

const COLUMNS = [
  "id",
  "topic",
  "L1",
  "L2",
  "advice_card_title",
  "user_problem_summary",
  "action_summary",
  "canonical_title",
  "humanized_mentor_insight",
  "humanized_hr_perspective",
  "advice_card_title_en",
  "user_problem_summary_en",
  "action_summary_en",
  "canonical_title_en",
  "humanized_mentor_insight_en",
  "humanized_hr_perspective_en",
];

function csvCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function ensureOutputDir() {
  const dir = path.join(process.cwd(), "outputs", "segment-translations");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
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
  if (SHARD_COUNT > 0) {
    params.push(SHARD_COUNT);
    const shardCountParam = params.length;
    params.push(SHARD_INDEX);
    const shardIndexParam = params.length;
    filters.push(`MOD(id, $${shardCountParam}) = $${shardIndexParam}`);
  }
  const { rows } = await pool.query(
    `SELECT id, topic, "L1", "L2",
            advice_card_title, user_problem_summary, action_summary, canonical_title,
            to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
            to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
            '' AS advice_card_title_en,
            '' AS user_problem_summary_en,
            '' AS action_summary_en,
            '' AS canonical_title_en,
            '' AS humanized_mentor_insight_en,
            '' AS humanized_hr_perspective_en
       FROM segments
      WHERE ${filters.join("\n        AND ")}
      ORDER BY id ASC
      LIMIT $1`,
    params
  );
  return rows;
}

async function main() {
  const pool = db.getPool();
  try {
    const rows = await loadRows(pool);
    const csv = [
      COLUMNS.map(csvCell).join(","),
      ...rows.map((row) => COLUMNS.map((column) => csvCell(row[column])).join(",")),
    ].join("\r\n");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outPath = path.resolve(OUT_FILE || path.join(ensureOutputDir(), `segments_translation_export_${stamp}.csv`));
    fs.writeFileSync(outPath, `${NO_BOM ? "" : "\uFEFF"}${csv}`, "utf8");
    console.log(JSON.stringify({
      rows: rows.length,
      shardCount: SHARD_COUNT,
      shardIndex: SHARD_COUNT > 0 && Number.isInteger(SHARD_INDEX) ? SHARD_INDEX : null,
      outPath,
    }, null, 2));
  } finally {
    await db.closeDB();
  }
}

main().catch((error) => {
  console.error(error);
  db.closeDB().finally(() => process.exit(1));
});
