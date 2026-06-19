"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

const APPLY = process.argv.includes("--apply");

const SEGMENT_COLUMNS = [
  ["advice_card_title_en", "text"],
  ["user_problem_summary_en", "text"],
  ["action_summary_en", "text"],
  ["canonical_title_en", "text"],
  ["humanized_mentor_insight_en", "text"],
  ["humanized_hr_perspective_en", "text"],
  ["humanized_mentor_insight_raw_en", "text"],
  ["humanized_hr_perspective_raw_en", "text"],
  ["humanized_mentor_insight_generalized_en", "text"],
  ["humanized_hr_perspective_generalized_en", "text"],
  ["translation_review_status", "text"],
  ["translation_source", "text"],
  ["translation_updated_at", "timestamptz"],
];

const REPORT_COLUMNS = [
  ["locale", "text DEFAULT 'zh-CN'"],
];

async function missingColumns(pool, tableName, columns) {
  const { rows } = await pool.query(
    `SELECT column_name
       FROM information_schema.columns
      WHERE table_schema = 'vibe_offer'
        AND table_name = $1`,
    [tableName]
  );
  const existing = new Set(rows.map((row) => row.column_name));
  return columns.filter(([column]) => !existing.has(column));
}

async function main() {
  const pool = db.getPool();
  try {
    const missingSegmentColumns = await missingColumns(pool, "segments", SEGMENT_COLUMNS);
    const missingReportColumns = await missingColumns(pool, "ats_reports", REPORT_COLUMNS);

    console.log(JSON.stringify({
      apply: APPLY,
      tables: {
        "vibe_offer.segments": missingSegmentColumns.map(([column, type]) => ({ column, type })),
        "vibe_offer.ats_reports": missingReportColumns.map(([column, type]) => ({ column, type })),
      },
    }, null, 2));

    if (!APPLY) {
      console.log("\nDry run only. Re-run with --apply to alter Supabase.");
      return;
    }

    await pool.query("BEGIN");
    try {
      for (const [column, type] of missingSegmentColumns) {
        await pool.query(`ALTER TABLE segments ADD COLUMN IF NOT EXISTS "${column}" ${type}`);
      }
      for (const [column, type] of missingReportColumns) {
        await pool.query(`ALTER TABLE ats_reports ADD COLUMN IF NOT EXISTS "${column}" ${type}`);
      }
      await pool.query("CREATE INDEX IF NOT EXISTS idx_segments_translation_review_status ON segments (translation_review_status)");
      await pool.query("CREATE INDEX IF NOT EXISTS idx_ats_reports_locale ON ats_reports (locale)");
      await pool.query("COMMIT");
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
    console.log("\nBilingual migration complete.");
  } finally {
    await db.closeDB();
  }
}

main().catch((error) => {
  console.error(error);
  db.closeDB().finally(() => process.exit(1));
});
