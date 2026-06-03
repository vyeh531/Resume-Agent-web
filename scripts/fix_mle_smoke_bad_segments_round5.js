"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");

const UPDATES = [
  {
    id: 25957,
    role_family: "data_analyst,finance",
    target_roles: "data_analyst,quantitative_analyst",
  },
  {
    id: 15186,
    role_family: "data_scientist,healthcare",
    target_roles: "biostatistician,biostatistics,data_scientist",
  },
  {
    id: 1081,
    role_family: "data_analyst",
    target_roles: "data_analyst,business_analyst",
  },
];

async function main() {
  const ids = UPDATES.map((item) => item.id);
  const pool = db.getPool();
  const { rows } = await pool.query(
    `
      SELECT id, role_family, target_roles, problem_tags, ats_dimensions,
             advice_card_title, user_problem_summary, "A_action", action_summary
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
    console.log(`role: ${row.role_family || ""} -> ${row.next.role_family}`);
    console.log(`targets: ${row.target_roles || ""} -> ${row.next.target_roles}`);
    console.log(`title=${String(row.advice_card_title || row.user_problem_summary || "").replace(/\s+/g, " ").slice(0, 220)}`);
    console.log(`action=${String(row.A_action || row.action_summary || "").replace(/\s+/g, " ").slice(0, 300)}`);
  }
  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_mle_smoke_bad_round5_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(changes, null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    for (const row of changes) {
      await pool.query(
        `
          UPDATE segments
             SET role_family = $2,
                 target_roles = $3
           WHERE id = $1
        `,
        [row.id, row.next.role_family, row.next.target_roles]
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
