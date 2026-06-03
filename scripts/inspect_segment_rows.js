"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

const ids = process.argv.slice(2).map((item) => Number(item)).filter(Number.isFinite);

function compact(value, length = 360) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, length);
}

async function main() {
  if (!ids.length) {
    console.log("Usage: node scripts\\inspect_segment_rows.js <id> [id...]");
    return;
  }

  const { rows } = await db.getPool().query(
    `
      SELECT id, retrieval_scope, role_family, target_roles, problem_tags,
             ats_dimensions, advice_card_title, user_problem_summary,
             "A_action", action_summary
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY array_position($1::int[], id)
    `,
    [ids]
  );

  for (const row of rows) {
    console.log(`\n# ${row.id}`);
    console.log(`scope=${row.retrieval_scope || ""}`);
    console.log(`role=${row.role_family || ""}`);
    console.log(`target=${row.target_roles || ""}`);
    console.log(`tags=${row.problem_tags || ""}`);
    console.log(`dims=${row.ats_dimensions || ""}`);
    console.log(`title=${compact(row.advice_card_title || row.user_problem_summary)}`);
    console.log(`action=${compact(row.A_action || row.action_summary)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
