"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const db = require("../database");

const auditPath =
  process.argv.find((arg) => arg.startsWith("--audit="))?.split("=")[1] ||
  "data/audit/segments_quality_1780402799497.json";

function compact(value, length = 360) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

async function main() {
  const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
  const ids = (audit.suspicious || [])
    .filter((row) => row.issues?.includes("role:universal_role_leak"))
    .map((row) => row.id);

  console.log(`ids=${ids.join(",")}`);
  console.log(`count=${ids.length}`);
  if (!ids.length) return;

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const { rows } = await pool.query(
    `
      SELECT id, topic, "L1", "L2", advice_type, retrieval_scope,
             role_family, target_roles, target_role, target_role_family,
             problem_tags, advice_card_title, user_problem_summary,
             action_summary, "P_mentor", "A_action", "I_insight", keywords
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY id
    `,
    [ids]
  );

  for (const row of rows) {
    console.log(`\n# id=${row.id}`);
    console.log(`role=${row.role_family || ""} target_roles=${row.target_roles || ""} target_role=${row.target_role || ""} target_family=${row.target_role_family || ""}`);
    console.log(`topic=${row.topic || ""} / ${row.L1 || ""} / ${row.L2 || ""} / ${row.advice_type || ""}`);
    console.log(`tags=${row.problem_tags || ""}`);
    console.log(`title=${compact(row.advice_card_title || row.user_problem_summary || row.P_mentor, 260)}`);
    console.log(`action=${compact(row.A_action || row.action_summary, 420)}`);
    console.log(`insight=${compact(row.I_insight, 360)}`);
    console.log(`keywords=${compact(row.keywords, 240)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
