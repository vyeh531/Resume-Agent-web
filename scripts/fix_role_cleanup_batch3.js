"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");

const UPDATES = [
  {
    id: 14868,
    role_family: "supply_chain_logistics,project_program_management,procurement",
    target_roles: "supply_chain_analyst,procurement_specialist,project_manager",
  },
  {
    id: 14873,
    retrieval_scope: "career_strategy",
    role_family: "supply_chain_logistics,project_program_management",
    target_roles: "supply_chain_analyst,project_manager",
  },
  {
    id: 14889,
    retrieval_scope: "career_strategy",
    role_family: "supply_chain_logistics,project_program_management",
    target_roles: "supply_chain_analyst,project_manager",
  },
  {
    id: 6303,
    role_family: "universal",
    target_roles: "universal",
    problem_tags: "low_hard_skill_match,resume_not_tailored_to_jd,missing_priority_keywords",
    ats_dimensions: "D_keyword_match,F_role_fit",
  },
  {
    id: 19340,
    role_family: "finance,sales_customer_success",
    target_roles: "financial_services_sales_support,client_support,front_office_support",
  },
  {
    id: 2516,
    role_family: "hardware_electrical,software_engineer",
    target_roles: "robotics_engineer,embedded_software_engineer",
  },
  {
    id: 8542,
    role_family: "hardware_electrical",
    target_roles: "digital_ic_engineer,hardware_engineer",
  },
  {
    id: 8440,
    role_family: "manufacturing_process,hardware_electrical",
    target_roles: "automation_engineer,controls_engineer,hardware_engineer",
  },
  {
    id: 9903,
    role_family: "software_engineer",
    target_roles: "software_engineer,backend_engineer",
  },
  {
    id: 14883,
    role_family: "project_program_management,business_operations,manufacturing_process",
    target_roles: "project_manager,program_manager,operations_manager",
  },
];

function compact(value, length = 320) {
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
    console.log(`scope: ${current.retrieval_scope || ""} -> ${next.retrieval_scope || current.retrieval_scope || ""}`);
    console.log(`role: ${current.role_family || ""} -> ${next.role_family || current.role_family || ""}`);
    console.log(`targets: ${current.target_roles || ""} -> ${next.target_roles || current.target_roles || ""}`);
    console.log(`tags: ${current.problem_tags || ""} -> ${next.problem_tags || current.problem_tags || ""}`);
    console.log(`dims: ${current.ats_dimensions || ""} -> ${next.ats_dimensions || current.ats_dimensions || ""}`);
    console.log(`title=${compact(current.advice_card_title || current.user_problem_summary)}`);
    console.log(`action=${compact(current.A_action || current.action_summary)}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_role_cleanup_batch3_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(changes, null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    for (const { current, next } of changes) {
      await pool.query(
        `
          UPDATE segments
             SET retrieval_scope = COALESCE($2, retrieval_scope),
                 role_family = COALESCE($3, role_family),
                 target_roles = COALESCE($4, target_roles),
                 problem_tags = COALESCE($5, problem_tags),
                 ats_dimensions = COALESCE($6, ats_dimensions)
           WHERE id = $1
        `,
        [
          current.id,
          next.retrieval_scope || null,
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
