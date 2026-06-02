"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

const TERMS = [
  ["machine_learning", /machine learning|mle|ml engineer|rag|llm|model|tensorflow|pytorch|fine-tuning|comfyui|sdxl|stable diffusion|image generation/i],
  ["software_engineer", /software engineer|swe|backend|frontend|full stack|api|database|react|node|java|system design/i],
  ["design_creative", /graphic designer|ux|ui|portfolio|作品集|design|figma|adobe|visual|brand/i],
  ["marketing", /marketing|seo|campaign|paid media|google ads|brand|growth|market research/i],
  ["finance", /financial analyst|investment|fp&a|treasury|risk analyst|finance|equity|portfolio management/i],
  ["data_analyst", /data analyst|business analyst|sql|tableau|power bi|dashboard|analytics|data visualization/i],
  ["accounting", /accounting|audit|tax|cpa|会计|审计|税务/i],
  ["product_manager", /product manager|product|roadmap|prd|user story|stakeholder/i],
  ["supply_chain", /supply chain|procurement|logistics|inventory|采购|供应链/i],
];

function textOf(row) {
  return [
    row.topic,
    row.L1,
    row.L2,
    row.P_mentor,
    row.A_action,
    row.advice_card_title,
    row.user_problem_summary,
    row.action_summary,
    row.target_role,
    row.target_role_family,
  ].filter(Boolean).join(" ");
}

function inferLabels(row) {
  const text = textOf(row);
  return TERMS.filter(([, re]) => re.test(text)).map(([name]) => name);
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const { rows } = await pool.query(`
    SELECT id, topic, "L1", "L2", "P_mentor", "A_action", advice_card_title,
           user_problem_summary, action_summary, role_family, target_roles,
           target_role, target_role_family, problem_tags, ats_dimensions
      FROM segments
     WHERE COALESCE(retrieval_scope, 'resume_edit') = 'resume_edit'
       AND (role_family IS NULL OR role_family = '' OR role_family = 'universal' OR role_family LIKE '%universal%')
     ORDER BY id
  `);

  const inferred = rows.map((row) => ({ ...row, inferred: inferLabels(row) }));
  const counts = {};
  for (const row of inferred) {
    for (const label of row.inferred) counts[label] = (counts[label] || 0) + 1;
  }

  console.log(JSON.stringify({
    scanned_universal_resume_rows: rows.length,
    rows_with_inferred_role: inferred.filter((row) => row.inferred.length).length,
    counts,
  }, null, 2));

  for (const row of inferred.filter((item) => item.inferred.length).slice(0, 40)) {
    const sample = String(row.advice_card_title || row.P_mentor || row.A_action || "").replace(/\s+/g, " ").slice(0, 180);
    console.log(`- id=${row.id} inferred=[${row.inferred.join(",")}] old_role=${row.role_family || ""} target=${row.target_roles || ""} topic=${row.topic || ""} :: ${sample}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
