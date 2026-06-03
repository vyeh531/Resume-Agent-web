"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");

const UPDATES = [
  {
    id: 19951,
    role_family: "finance,accounting",
    target_roles: "credit_risk_analyst,financial_analyst,accounting_analyst",
    problem_tags: "weak_experience_keyword_evidence,weak_result_orientation,low_measurable_results",
    ats_dimensions: "C_content_quality,F_role_fit",
  },
  {
    id: 9077,
    role_family: "design_creative",
    target_roles: "game_designer,concept_artist,designer",
    problem_tags: "format_issue,readability_issue,weak_experience_keyword_evidence",
    ats_dimensions: "A_format,C_content_quality",
  },
  {
    id: 10782,
    role_family: "procurement,supply_chain_logistics",
    target_roles: "procurement_specialist,purchasing_agent,supply_chain_analyst",
    problem_tags: "weak_experience_keyword_evidence,weak_result_orientation,vague_project_details",
    ats_dimensions: "C_content_quality,F_role_fit",
  },
  {
    id: 4154,
    role_family: "supply_chain_logistics,finance",
    target_roles: "supply_chain_analyst,procurement_specialist,financial_analyst",
  },
  {
    id: 4668,
    role_family: "supply_chain_logistics",
    target_roles: "supply_chain_analyst,logistics_analyst,procurement_specialist",
  },
  {
    id: 15871,
    role_family: "business_analysis,data_analyst",
    target_roles: "business_analyst,data_analyst",
  },
  {
    id: 8297,
    role_family: "business_analysis,data_analyst",
    target_roles: "business_analyst,data_analyst",
  },
  {
    id: 8959,
    role_family: "finance,data_analyst",
    target_roles: "financial_analyst,data_analyst,business_analyst",
  },
  {
    id: 26527,
    role_family: "software_engineer,cloud_infrastructure",
    target_roles: "backend_engineer,frontend_engineer,software_engineer,cloud_engineer",
  },
  {
    id: 22431,
    role_family: "software_engineer,cloud_infrastructure,cybersecurity",
    target_roles: "backend_engineer,cloud_engineer,software_engineer,security_engineer",
  },
  {
    id: 21863,
    role_family: "data_engineer,data_analyst",
    target_roles: "data_engineer,data_analyst",
  },
  {
    id: 25523,
    role_family: "data_analyst",
    target_roles: "data_analyst,business_analyst",
  },
  {
    id: 18122,
    role_family: "data_analyst,data_scientist",
    target_roles: "data_analyst,data_scientist",
  },
];

function compact(value, length = 300) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, length);
}

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
  const changes = UPDATES.map((next) => ({ current: byId.get(next.id), next })).filter((item) => item.current);

  console.log(JSON.stringify({ apply: APPLY, updates: changes.length }, null, 2));
  for (const { current, next } of changes) {
    console.log(`\n# ${current.id}`);
    console.log(`role: ${current.role_family || ""} -> ${next.role_family || current.role_family || ""}`);
    console.log(`targets: ${current.target_roles || ""} -> ${next.target_roles || current.target_roles || ""}`);
    console.log(`tags: ${current.problem_tags || ""} -> ${next.problem_tags || current.problem_tags || ""}`);
    console.log(`dims: ${current.ats_dimensions || ""} -> ${next.ats_dimensions || current.ats_dimensions || ""}`);
    console.log(`title=${compact(current.advice_card_title || current.user_problem_summary, 220)}`);
    console.log(`action=${compact(current.A_action || current.action_summary, 360)}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_role_cleanup_batch1_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(changes, null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    for (const { current, next } of changes) {
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
          current.id,
          next.role_family || null,
          next.target_roles || null,
          next.problem_tags || null,
          next.ats_dimensions || null,
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
