"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

const SAMPLE_LIMIT = Number((process.argv.find((arg) => arg.startsWith("--sample=")) || "").slice("--sample=".length)) || 10;

const CORE_COLUMNS = [
  "advice_card_title_en",
  "user_problem_summary_en",
  "action_summary_en",
  "canonical_title_en",
  "humanized_mentor_insight_en",
  "humanized_hr_perspective_en",
];

const FULL_COLUMNS = [
  ...CORE_COLUMNS,
  "humanized_mentor_insight_raw_en",
  "humanized_hr_perspective_raw_en",
  "humanized_mentor_insight_generalized_en",
  "humanized_hr_perspective_generalized_en",
];

function completeExpr(columns) {
  return columns.map((column) => `COALESCE(to_jsonb(segments)->>'${column}', '') <> ''`).join(" AND ");
}

async function main() {
  const pool = db.getPool();
  try {
    const scopeSql = `
      FROM segments
      WHERE (retrieval_scope IS NULL OR retrieval_scope = 'resume_edit')
        AND COALESCE(advice_card_title, user_problem_summary, action_summary, canonical_title, '') <> ''
    `;
    const { rows: [counts] } = await pool.query(`
      SELECT
        COUNT(*)::int AS total_display_rows,
        COUNT(*) FILTER (WHERE ${completeExpr(CORE_COLUMNS)})::int AS core_complete,
        COUNT(*) FILTER (WHERE ${completeExpr(FULL_COLUMNS)})::int AS full_complete,
        COUNT(*) FILTER (WHERE COALESCE(to_jsonb(segments)->>'translation_review_status', '') = 'approved')::int AS approved_status
      ${scopeSql}
    `);
    const { rows: samples } = await pool.query(`
      SELECT id, advice_card_title, action_summary,
             to_jsonb(segments)->>'advice_card_title_en' AS advice_card_title_en,
             to_jsonb(segments)->>'action_summary_en' AS action_summary_en
      ${scopeSql}
        AND NOT (${completeExpr(CORE_COLUMNS)})
      ORDER BY id ASC
      LIMIT $1
    `, [SAMPLE_LIMIT]);
    console.log(JSON.stringify({
      ...counts,
      core_missing: counts.total_display_rows - counts.core_complete,
      full_missing: counts.total_display_rows - counts.full_complete,
      sampleMissingCore: samples,
    }, null, 2));
  } finally {
    await db.closeDB();
  }
}

main().catch((error) => {
  console.error(error);
  db.closeDB().finally(() => process.exit(1));
});
