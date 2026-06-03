"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");

const UPDATES = [
  {
    id: 8966,
    role_family: "finance,data_analyst,data_scientist",
    target_roles: "financial_analyst,data_analyst,business_analyst,data_scientist",
  },
  {
    id: 8967,
    role_family: "finance,data_analyst",
    target_roles: "financial_analyst,data_analyst,risk_analyst",
  },
  {
    id: 24799,
    role_family: "finance",
    target_roles: "quantitative_analyst,quantitative_research,risk_analyst",
  },
  {
    id: 3479,
    role_family: "finance,operations",
    target_roles: "risk_consulting,risk_analyst,operations",
  },
  {
    id: 2989,
    role_family: "healthcare,data_scientist",
    target_roles: "healthcare_analytics,biotech_data_scientist,clinical_data",
  },
  {
    id: 12013,
    role_family: "data_analyst,marketing",
    target_roles: "data_analyst,business_analyst,marketing_analyst",
  },
  {
    id: 14294,
    role_family: "universal",
    target_roles: "universal",
    problem_tags: "weak_experience_keyword_evidence,vague_project_details,weak_result_orientation",
    ats_dimensions: "C_content_quality",
  },
  {
    id: 24389,
    role_family: "data_scientist,data_analyst",
    target_roles: "data_scientist,data_analyst",
  },
  {
    id: 9892,
    role_family: "finance,data_scientist",
    target_roles: "quantitative_research,data_scientist",
  },
];

async function main() {
  const ids = UPDATES.map((item) => item.id);
  const pool = db.getPool();
  const { rows } = await pool.query(
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
  const byId = new Map(rows.map((row) => [row.id, row]));
  const changes = UPDATES.map((update) => ({ ...byId.get(update.id), next: update })).filter((row) => row.id);

  console.log(JSON.stringify({ apply: APPLY, updates: changes.length }, null, 2));
  for (const row of changes) {
    console.log(`\n# ${row.id}`);
    console.log(`role: ${row.role_family || ""} -> ${row.next.role_family || row.role_family || ""}`);
    console.log(`targets: ${row.target_roles || ""} -> ${row.next.target_roles || row.target_roles || ""}`);
    console.log(`tags: ${row.problem_tags || ""} -> ${row.next.problem_tags || row.problem_tags || ""}`);
    console.log(`dims: ${row.ats_dimensions || ""} -> ${row.next.ats_dimensions || row.ats_dimensions || ""}`);
    console.log(`title=${String(row.advice_card_title || row.user_problem_summary || "").replace(/\s+/g, " ").slice(0, 220)}`);
    console.log(`action=${String(row.A_action || row.action_summary || "").replace(/\s+/g, " ").slice(0, 300)}`);
  }
  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_mle_smoke_bad_round4_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(changes, null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    for (const row of changes) {
      await pool.query(
        `
          UPDATE segments
             SET role_family = COALESCE($2, role_family),
                 target_roles = COALESCE($3, target_roles),
                 problem_tags = COALESCE($4, problem_tags),
                 ats_dimensions = COALESCE($5, ats_dimensions)
           WHERE id = $1
        `,
        [
          row.id,
          row.next.role_family || null,
          row.next.target_roles || null,
          row.next.problem_tags || null,
          row.next.ats_dimensions || null,
        ]
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
