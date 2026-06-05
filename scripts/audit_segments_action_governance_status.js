"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

function groupCount(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "";
    acc[value] = Number(row.count || 0);
    return acc;
  }, {});
}

async function queryGroup(pool, field) {
  const { rows } = await pool.query(`
    SELECT COALESCE(NULLIF(${field}, ''), '(blank)') AS value, COUNT(*)::int AS count
      FROM segments
     WHERE retrieval_scope IS NULL OR retrieval_scope = 'resume_edit'
     GROUP BY 1
     ORDER BY count DESC, value
  `);
  return groupCount(rows, "value");
}

async function main() {
  const pool = db.getPool();
  const [{ rows: totals }, bySpecificity, byDisplayMode, byReviewStatus, byFamily, byDepth] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE COALESCE(action_specificity, '') = '')::int AS blank_specificity,
        COUNT(*) FILTER (WHERE COALESCE(display_action_mode, '') = '')::int AS blank_display_mode,
        COUNT(*) FILTER (WHERE COALESCE(action_review_status, '') = '')::int AS blank_review_status,
        COUNT(*) FILTER (
          WHERE COALESCE(display_action_mode, '') IN ('generalized', 'grounded_raw')
            AND COALESCE(generalized_action, '') = ''
        )::int AS missing_generalized_for_fallback,
        COUNT(*) FILTER (
          WHERE COALESCE(display_action_mode, '') = 'exclude'
        )::int AS excluded_rows,
        COUNT(*) FILTER (
          WHERE COALESCE(action_review_status, '') = 'needs_review'
        )::int AS needs_review_rows
      FROM segments
      WHERE retrieval_scope IS NULL OR retrieval_scope = 'resume_edit'
    `),
    queryGroup(pool, "action_specificity"),
    queryGroup(pool, "display_action_mode"),
    queryGroup(pool, "action_review_status"),
    queryGroup(pool, "canonical_action_family"),
    queryGroup(pool, "action_depth"),
  ]);

  console.log(JSON.stringify({
    generatedAt: new Date().toISOString(),
    totals: totals[0],
    bySpecificity,
    byDisplayMode,
    byReviewStatus,
    byFamily,
    byDepth,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
