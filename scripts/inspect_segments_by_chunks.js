"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

const CHUNKS = (process.argv.find((arg) => arg.startsWith("--chunks="))?.slice("--chunks=".length) || "")
  .split("|||")
  .map((item) => item.trim())
  .filter(Boolean);

function compact(value, length = 260) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

async function main() {
  if (!CHUNKS.length) {
    console.error("Usage: node scripts\\inspect_segments_by_chunks.js --chunks=chunk_a|||chunk_b");
    process.exit(1);
  }
  const { rows } = await db.getPool().query(
    `
      SELECT id, chunk_id, retrieval_scope, role_family, target_roles,
             problem_tags, ats_dimensions, advice_card_title, user_problem_summary,
             "A_action", action_summary
        FROM segments
       WHERE chunk_id = ANY($1::text[])
       ORDER BY chunk_id, id
    `,
    [CHUNKS]
  );
  for (const row of rows) {
    console.log(`\n# ${row.id} ${row.chunk_id}`);
    console.log(`scope=${row.retrieval_scope || ""} role=${row.role_family || ""} targets=${row.target_roles || ""}`);
    console.log(`tags=${row.problem_tags || ""} dims=${row.ats_dimensions || ""}`);
    console.log(`title=${compact(row.advice_card_title || row.user_problem_summary)}`);
    console.log(`action=${compact(row.A_action || row.action_summary, 340)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
