"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

const IDS = (process.argv.find((arg) => arg.startsWith("--ids="))?.split("=")[1] || "")
  .split(",")
  .map((id) => Number(id.trim()))
  .filter(Boolean);

function compact(value, length = 320) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

async function main() {
  if (!IDS.length) {
    console.error("Usage: node scripts\\inspect_segments_by_ids.js --ids=1,2,3");
    process.exit(1);
  }
  const pool = db.getPool();
  const { rows } = await pool.query(
    `
      SELECT id, chunk_id, retrieval_scope, role_family, target_roles,
             problem_tags, ats_dimensions, keywords, topic, "L1", "L2",
             advice_card_title, user_problem_summary, action_summary, "A_action"
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY array_position($1::int[], id)
    `,
    [IDS]
  );
  for (const row of rows) {
    console.log(`\n# ${row.id}`);
    console.log(`chunk=${row.chunk_id || ""}`);
    console.log(`scope=${row.retrieval_scope || ""} role=${row.role_family || ""} targets=${row.target_roles || ""}`);
    console.log(`tags=${row.problem_tags || ""} dims=${row.ats_dimensions || ""}`);
    console.log(`keywords=${compact(row.keywords, 220)}`);
    console.log(`topic=${[row.topic, row.L1, row.L2].filter(Boolean).join(" / ")}`);
    console.log(`title=${compact(row.advice_card_title || row.user_problem_summary, 240)}`);
    console.log(`action=${compact(row.A_action || row.action_summary, 380)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
