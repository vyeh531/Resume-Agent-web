"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");

const UPDATES = [
  {
    id: 14866,
    role_family: "supply_chain_logistics,project_program_management",
    target_roles: "supply_chain_analyst,procurement_specialist,project_manager",
  },
  {
    id: 14423,
    role_family: "business_analysis,data_analyst",
    target_roles: "business_analyst,data_analyst",
  },
  {
    id: 1984,
    role_family: "business_analysis,data_analyst",
    target_roles: "business_analyst,data_analyst",
    problem_tags: "weak_soft_skill_evidence,weak_experience_keyword_evidence,weak_target_role_alignment",
    ats_dimensions: "C_content_quality,F_role_fit",
  },
  {
    id: 2792,
    role_family: "business_analysis,data_analyst",
    target_roles: "business_analyst,data_analyst",
  },
  {
    id: 4867,
    role_family: "design_creative",
    target_roles: "game_designer",
    problem_tags: "weak_summary_role_alignment,weak_target_role_alignment,weak_experience_keyword_evidence",
    ats_dimensions: "B_summary,C_content_quality,F_role_fit",
  },
  {
    id: 4693,
    role_family: "ux_research_design,design_creative,product_manager",
    target_roles: "ux_designer,product_designer,product_manager",
  },
  {
    id: 21665,
    retrieval_scope: "job_search",
    role_family: "finance",
    target_roles: "asset_management,investment_analyst",
  },
  {
    id: 4149,
    role_family: "finance,hr_recruiting",
    target_roles: "financial_analyst,human_resources_specialist",
  },
  {
    id: 5969,
    role_family: "universal",
    target_roles: "universal",
    problem_tags: "low_jd_keyword_match,resume_not_tailored_to_jd,missing_priority_keywords",
    ats_dimensions: "D_keyword_match,F_role_fit",
  },
  {
    id: 10709,
    role_family: "finance,trading_quant",
    target_roles: "risk_analyst,investment_analyst,front_office_analyst",
  },
  {
    id: 23091,
    role_family: "finance,trading_quant",
    target_roles: "asset_management,portfolio_manager,investment_analyst",
  },
  {
    id: 20716,
    role_family: "accounting,finance",
    target_roles: "risk_analyst,product_controller,treasury_analyst,accounting_analyst",
  },
  {
    id: 19925,
    role_family: "accounting,finance,trading_quant",
    target_roles: "financial_analyst,risk_analyst,asset_management",
  },
  {
    id: 7872,
    role_family: "hardware_electrical",
    target_roles: "hardware_engineer",
  },
  {
    id: 11739,
    role_family: "consulting,business_analysis",
    target_roles: "management_consultant,business_analyst",
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
    console.log(`scope: ${current.retrieval_scope || ""} -> ${next.retrieval_scope || current.retrieval_scope || ""}`);
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
  const backupPath = path.join(backupDir, `segments_role_cleanup_batch2_${Date.now()}.json`);
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
