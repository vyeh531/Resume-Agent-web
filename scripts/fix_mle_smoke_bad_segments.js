"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");

const UPDATES = [
  { id: 5938, role_family: "administration,education", target_roles: "administration,education_consulting" },
  { id: 5939, role_family: "administration,education", target_roles: "administration,education_consulting" },
  { id: 6640, role_family: "legal", target_roles: "entertainment_law" },
  { id: 8701, role_family: "healthcare", target_roles: "clinical" },
  { id: 12650, role_family: "ops", target_roles: "industrial_engineering,process_improvement" },
  { id: 9948, retrieval_scope: "interview" },
  { id: 15592, retrieval_scope: "job_search" },
  { id: 17930, retrieval_scope: "interview" },
];

function compact(value, length = 240) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

async function main() {
  const ids = UPDATES.map((item) => item.id);
  const pool = db.getPool();
  const { rows } = await pool.query(
    `
      SELECT id, retrieval_scope, role_family, target_roles, problem_tags,
             topic, "L1", "L2", advice_card_title, user_problem_summary, "A_action", action_summary
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY array_position($1::int[], id)
    `,
    [ids]
  );
  const currentById = new Map(rows.map((row) => [row.id, row]));
  const changes = UPDATES.map((update) => {
    const current = currentById.get(update.id);
    return { ...current, next: { ...update } };
  }).filter((row) => row.id);

  console.log(JSON.stringify({ apply: APPLY, updates: changes.length }, null, 2));
  for (const row of changes) {
    console.log(`\n# ${row.id}`);
    console.log(`scope: ${row.retrieval_scope || ""} -> ${row.next.retrieval_scope || row.retrieval_scope || ""}`);
    console.log(`role: ${row.role_family || ""} -> ${row.next.role_family || row.role_family || ""}`);
    console.log(`targets: ${row.target_roles || ""} -> ${row.next.target_roles || row.target_roles || ""}`);
    console.log(`title=${compact(row.advice_card_title || row.user_problem_summary)}`);
    console.log(`action=${compact(row.A_action || row.action_summary, 320)}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_mle_smoke_bad_${Date.now()}.json`);
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
