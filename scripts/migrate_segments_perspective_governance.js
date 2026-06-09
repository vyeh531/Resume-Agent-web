"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

const APPLY = process.argv.includes("--apply");

const COLUMNS = [
  ["humanized_mentor_insight", "text"],
  ["humanized_hr_perspective", "text"],
  ["perspective_review_status", "text"],
  ["perspective_source", "text"],
  ["perspective_confidence", "numeric"],
];

async function columnExists(pool, column) {
  const { rows } = await pool.query(
    `SELECT 1
       FROM information_schema.columns
      WHERE table_schema = 'vibe_offer'
        AND table_name = 'segments'
        AND column_name = $1
      LIMIT 1`,
    [column]
  );
  return Boolean(rows[0]);
}

async function main() {
  const pool = db.getPool();
  const missing = [];
  for (const [column, type] of COLUMNS) {
    if (!(await columnExists(pool, column))) missing.push([column, type]);
  }

  console.log(JSON.stringify({
    apply: APPLY,
    table: "vibe_offer.segments",
    missingColumns: missing.map(([column, type]) => ({ column, type })),
  }, null, 2));

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply to alter vibe_offer.segments.");
    return;
  }

  await pool.query("BEGIN");
  try {
    for (const [column, type] of missing) {
      await pool.query(`ALTER TABLE segments ADD COLUMN IF NOT EXISTS "${column}" ${type}`);
    }
    await pool.query("CREATE INDEX IF NOT EXISTS idx_segments_perspective_review_status ON segments (perspective_review_status)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_segments_perspective_source ON segments (perspective_source)");
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
  console.log("\nMigration complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
