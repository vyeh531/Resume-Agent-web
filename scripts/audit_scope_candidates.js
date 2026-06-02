"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const db = require("../database");

const auditPath =
  process.argv.find((arg) => arg.startsWith("--audit="))?.split("=")[1] ||
  "data/audit/segments_quality_1780400767685.json";
const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 20);

const SCOPE_LABELS = [
  "scope:school_application",
  "scope:job_search_timing",
  "scope:career_strategy",
  "scope:interview_outcome",
];

function compact(value, length = 260) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

async function main() {
  const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
  const idsByScope = new Map();
  for (const label of SCOPE_LABELS) idsByScope.set(label, []);

  for (const row of audit.suspicious || []) {
    for (const label of SCOPE_LABELS) {
      if (row.issues?.includes(label)) idsByScope.get(label).push(row.id);
    }
  }

  const allIds = [...new Set([...idsByScope.values()].flat())];
  if (!allIds.length) {
    console.log("No scope candidates found.");
    return;
  }

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const { rows } = await pool.query(
    `
      SELECT id, topic, "L1", "L2", advice_type, retrieval_scope,
             problem_tags, role_family, target_roles,
             advice_card_title, user_problem_summary, action_summary,
             "P_mentor", "A_action", "I_insight", "HR_os"
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY id
    `,
    [allIds]
  );
  const byId = new Map(rows.map((row) => [row.id, row]));

  for (const label of SCOPE_LABELS) {
    const ids = idsByScope.get(label);
    console.log(`\n## ${label} count=${ids.length}`);
    for (const id of ids.slice(0, LIMIT)) {
      const row = byId.get(id);
      if (!row) continue;
      console.log(`\n# id=${row.id} scope=${row.retrieval_scope || ""}`);
      console.log(`topic=${row.topic || ""} / ${row.L1 || ""} / ${row.L2 || ""} / ${row.advice_type || ""}`);
      console.log(`tags=${row.problem_tags || ""}`);
      console.log(`title=${compact(row.advice_card_title || row.user_problem_summary || row.P_mentor, 220)}`);
      console.log(`action=${compact(row.A_action || row.action_summary, 420)}`);
      console.log(`insight=${compact(row.I_insight || row.HR_os, 300)}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
