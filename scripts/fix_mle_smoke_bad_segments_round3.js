"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");

const UPDATES = [
  { id: 1118, role_family: "data_analyst", target_roles: "data_analyst" },
  { id: 13320, role_family: "ops", target_roles: "industrial_engineering,process_improvement" },
  { id: 24644, retrieval_scope: "job_search" },
  { id: 5690, role_family: "product", target_roles: "product_manager" },
];

async function main() {
  const ids = UPDATES.map((item) => item.id);
  const pool = db.getPool();
  const { rows } = await pool.query(
    `
      SELECT id, retrieval_scope, role_family, target_roles, advice_card_title,
             user_problem_summary, "A_action", action_summary
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY array_position($1::int[], id)
    `,
    [ids]
  );
  const byId = new Map(rows.map((row) => [row.id, row]));
  const changes = UPDATES.map((update) => ({ ...byId.get(update.id), next: update })).filter((row) => row.id);
  console.log(JSON.stringify({ apply: APPLY, updates: changes.length }, null, 2));
  for (const row of changes) {
    console.log(`\n# ${row.id}`);
    console.log(`scope: ${row.retrieval_scope || ""} -> ${row.next.retrieval_scope || row.retrieval_scope || ""}`);
    console.log(`role: ${row.role_family || ""} -> ${row.next.role_family || row.role_family || ""}`);
    console.log(`targets: ${row.target_roles || ""} -> ${row.next.target_roles || row.target_roles || ""}`);
    console.log(`title=${String(row.advice_card_title || row.user_problem_summary || "").replace(/\s+/g, " ").slice(0, 220)}`);
    console.log(`action=${String(row.A_action || row.action_summary || "").replace(/\s+/g, " ").slice(0, 300)}`);
  }
  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }
  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_mle_smoke_bad_round3_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(changes, null, 2));
  console.log(`backup=${backupPath}`);
  await pool.query("BEGIN");
  try {
    for (const row of changes) {
      await pool.query(
        `
          UPDATE segments
             SET retrieval_scope = COALESCE($2, retrieval_scope),
                 role_family = COALESCE($3, role_family),
                 target_roles = COALESCE($4, target_roles)
           WHERE id = $1
        `,
        [row.id, row.next.retrieval_scope || null, row.next.role_family || null, row.next.target_roles || null]
      );
    }
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
