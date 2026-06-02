"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");

const UPDATES = [
  {
    id: 14919,
    retrieval_scope: "career_strategy",
    reason: "networking_accent_practice_not_resume_edit",
  },
  {
    id: 7706,
    retrieval_scope: "job_search",
    reason: "job_target_timing_filter_not_resume_edit",
  },
];

function compact(row) {
  return {
    id: row.id,
    from_scope: row.retrieval_scope || "",
    to_scope: row.next_scope,
    reason: row.reason,
    topic: row.topic || "",
    L1: row.L1 || "",
    L2: row.L2 || "",
    tags: row.problem_tags || "",
    title: String(row.advice_card_title || row.user_problem_summary || row.P_mentor || "").replace(/\s+/g, " ").slice(0, 220),
    action: String(row.A_action || row.action_summary || "").replace(/\s+/g, " ").slice(0, 360),
  };
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || 0) + 1;
    return acc;
  }, {});
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");

  const ids = UPDATES.map((row) => row.id);
  const { rows } = await pool.query(
    `
      SELECT id, topic, "L1", "L2", retrieval_scope, problem_tags,
             advice_card_title, user_problem_summary, "P_mentor", "A_action", action_summary
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY id
    `,
    [ids]
  );

  const byId = new Map(UPDATES.map((row) => [row.id, row]));
  const updates = rows
    .map((row) => ({ ...row, next_scope: byId.get(row.id).retrieval_scope, reason: byId.get(row.id).reason }))
    .filter((row) => (row.retrieval_scope || "resume_edit") === "resume_edit");

  const missing = ids.filter((id) => !rows.some((row) => row.id === id));
  console.log(JSON.stringify({
    apply: APPLY,
    intended: UPDATES.length,
    found: rows.length,
    eligible_resume_scope: updates.length,
    missing,
    by_scope: countBy(updates, "next_scope"),
  }, null, 2));

  for (const row of updates.map(compact)) {
    console.log(`\n# id=${row.id} ${row.from_scope || "resume_edit"} -> ${row.to_scope} (${row.reason})`);
    console.log(`topic=${row.topic} / ${row.L1} / ${row.L2}`);
    console.log(`tags=${row.tags}`);
    console.log(`title=${row.title}`);
    console.log(`action=${row.action}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }
  if (!updates.length) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_remaining_scope_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates.map(compact), null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query("CREATE TEMP TABLE segment_remaining_scope_updates (id integer PRIMARY KEY, retrieval_scope text) ON COMMIT DROP");
    for (const row of updates) {
      await pool.query(
        "INSERT INTO segment_remaining_scope_updates (id, retrieval_scope) VALUES ($1, $2)",
        [row.id, row.next_scope]
      );
    }
    await pool.query(`
      UPDATE segments AS target
         SET retrieval_scope = updates.retrieval_scope
        FROM segment_remaining_scope_updates AS updates
       WHERE target.id = updates.id
    `);
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
