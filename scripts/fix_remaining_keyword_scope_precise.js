"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");

const UPDATES = [
  { id: 582, retrieval_scope: "interview", reason: "past_question_review" },
  { id: 1223, retrieval_scope: "interview", reason: "risk_concept_prep" },
  { id: 1224, retrieval_scope: "interview", reason: "risk_concept_prep" },
  { id: 1573, retrieval_scope: "interview", reason: "risk_concept_prep" },
  { id: 3739, retrieval_scope: "career_strategy", reason: "prompt_writing_skill_practice" },
  { id: 7735, retrieval_scope: "interview", reason: "quant_math_prep" },
  { id: 7737, retrieval_scope: "interview", reason: "quant_math_prep" },
  { id: 7748, retrieval_scope: "interview", reason: "quant_math_prep" },
  { id: 8673, retrieval_scope: "interview", reason: "sql_concept_prep" },
  { id: 9871, retrieval_scope: "career_strategy", reason: "project_building_guidance" },
  { id: 10251, retrieval_scope: "interview", reason: "sql_concept_prep" },
  { id: 10258, retrieval_scope: "interview", reason: "sql_concept_prep" },
  { id: 10381, retrieval_scope: "interview", reason: "algorithm_question_prep" },
  { id: 10658, retrieval_scope: "interview", reason: "financial_model_case_prep" },
  { id: 13168, retrieval_scope: "interview", reason: "ab_testing_case_prep" },
  { id: 13284, retrieval_scope: "career_strategy", reason: "portfolio_project_building" },
  { id: 14231, retrieval_scope: "interview", reason: "sql_concept_prep" },
  { id: 14241, retrieval_scope: "interview", reason: "sql_concept_prep" },
  { id: 15229, retrieval_scope: "career_strategy", reason: "linux_skill_learning" },
  { id: 15230, retrieval_scope: "career_strategy", reason: "linux_skill_learning" },
  { id: 18327, retrieval_scope: "interview", reason: "finance_risk_concept_prep" },
  { id: 18331, retrieval_scope: "interview", reason: "finance_risk_concept_prep" },
  { id: 18611, retrieval_scope: "interview", reason: "finance_risk_concept_prep" },
  { id: 19716, retrieval_scope: "career_strategy", reason: "ml_concept_learning" },
  { id: 19724, retrieval_scope: "career_strategy", reason: "ml_concept_learning" },
  { id: 20049, retrieval_scope: "interview", reason: "sql_concept_prep" },
  { id: 20081, retrieval_scope: "career_strategy", reason: "rag_concept_learning" },
  { id: 20106, retrieval_scope: "career_strategy", reason: "rag_concept_learning" },
  { id: 20587, retrieval_scope: "interview", reason: "typescript_concept_prep" },
  { id: 21659, retrieval_scope: "interview", reason: "sql_concept_prep" },
  { id: 23333, retrieval_scope: "interview", reason: "sql_concept_prep" },
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
    by_reason: countBy(updates, "reason"),
  }, null, 2));

  for (const row of updates.map(compact)) {
    console.log(`- id=${row.id} ${row.from_scope || "resume_edit"} -> ${row.to_scope} (${row.reason}) topic=${row.topic} / ${row.L1} / ${row.L2}`);
    console.log(`  title=${row.title}`);
    console.log(`  action=${row.action}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }
  if (!updates.length) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_remaining_keyword_scope_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates.map(compact), null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query("CREATE TEMP TABLE segment_remaining_keyword_scope_updates (id integer PRIMARY KEY, retrieval_scope text) ON COMMIT DROP");
    for (const row of updates) {
      await pool.query(
        "INSERT INTO segment_remaining_keyword_scope_updates (id, retrieval_scope) VALUES ($1, $2)",
        [row.id, row.next_scope]
      );
    }
    await pool.query(`
      UPDATE segments AS target
         SET retrieval_scope = updates.retrieval_scope
        FROM segment_remaining_keyword_scope_updates AS updates
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
