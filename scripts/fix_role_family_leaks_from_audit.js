"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const AUDIT_PATH = process.argv.find((arg) => arg.startsWith("--audit="))?.split("=")[1] || "";

function compact(value, length = 260) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, length);
}

function segmentIdFromAdviceId(adviceId) {
  const match = String(adviceId || "").match(/^seg_(\d+)$/);
  return match ? Number(match[1]) : null;
}

function inferNextFields(row) {
  const text = [
    row.role_family, row.target_roles, row.keywords, row.advice_card_title,
    row.user_problem_summary, row.A_action, row.action_summary, row.I_insight,
  ].filter(Boolean).join(" ").toLowerCase();

  if (/\b(esg|sustainability|sustainable|carbon|climate|environmental)\b/i.test(text)) {
    return {
      role_family: "sustainability_environment",
      target_roles: "sustainability_analyst,esg_analyst,climate_analyst",
      reason: "content points to Sustainability/ESG",
    };
  }
  if (/\b(marketing|social media|copywriting|campaign|seo|sem|brand|ecommerce|listing|product promotion)\b/i.test(text)) {
    return {
      role_family: "marketing",
      target_roles: "marketing_analyst,digital_marketing_specialist,brand_manager",
      reason: "content points to Marketing",
    };
  }
  if (/\b(data analyst|da方向|da role|business analyst|ba方向|analytics analyst|bi analyst|dashboard|kpi|business insight)\b/i.test(text)) {
    return {
      role_family: "data_analyst,business_analysis",
      target_roles: "data_analyst,business_analyst,analytics_analyst",
      reason: "content points to DA/BA/Analytics",
    };
  }
  if (/\b(data scientist|ds方向|statistical model|ab testing|a\/b testing|experiment design)\b/i.test(text)) {
    return {
      role_family: "data_scientist",
      target_roles: "data_scientist",
      reason: "content points to Data Science",
    };
  }
  if (/\b(accounting|accountant|audit|gaap|quickbooks|reconciliation|accounts payable|accounts receivable)\b/i.test(text)) {
    return {
      role_family: "accounting",
      target_roles: "accountant,accounting_analyst,auditor",
      reason: "content points to Accounting",
    };
  }
  if (/\b(financial analyst|valuation|fp&a|fpa|investment analyst|financial modeling)\b/i.test(text)) {
    return {
      role_family: "finance",
      target_roles: "financial_analyst,investment_analyst",
      reason: "content points to Finance",
    };
  }
  if (/\b(ux designer|ui\/ux|graphic designer|portfolio|figma|storyboarding|2d animation|visual design)\b/i.test(text)) {
    return {
      role_family: "ux_research_design,design_creative",
      target_roles: "ux_designer,graphic_designer,product_designer",
      reason: "content points to Design/UX",
    };
  }
  if (/\b(hardware engineer|fpga|pcb|rtl|verilog|tape out|adc comparator|circuit)\b/i.test(text)) {
    return {
      role_family: "hardware_electrical",
      target_roles: "hardware_engineer,electrical_engineer",
      reason: "content points to Hardware",
    };
  }
  if (/\b(frontend|backend|full stack|react|node|api|software engineer|swe|sde)\b/i.test(text)) {
    return {
      role_family: "software_engineer",
      target_roles: "software_engineer,backend_engineer,frontend_engineer",
      reason: "content points to Software Engineering",
    };
  }
  if (/\b(clinical|patient|healthcare|medical|clinical trial)\b/i.test(text)) {
    return {
      role_family: "healthcare",
      target_roles: "clinical_research_associate,healthcare_analyst",
      reason: "content points to Healthcare",
    };
  }
  return null;
}

function flaggedIdsFromAudit(audit) {
  const ids = new Set();
  for (const result of Array.isArray(audit) ? audit : []) {
    for (const item of result.mismatches || []) {
      const id = segmentIdFromAdviceId(item.adviceId);
      if (id) ids.add(id);
    }
  }
  return [...ids].sort((a, b) => a - b);
}

async function main() {
  if (!AUDIT_PATH) {
    throw new Error("Usage: node scripts\\fix_role_family_leaks_from_audit.js --audit=data\\audits\\role_retrieval_audit_<timestamp>.json [--apply]");
  }
  const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  const ids = flaggedIdsFromAudit(audit);
  const pool = db.getPool();
  if (!ids.length) {
    console.log(JSON.stringify({ apply: APPLY, audit: AUDIT_PATH, flaggedIds: 0 }, null, 2));
    return;
  }

  const { rows } = await pool.query(
    `
      SELECT id, retrieval_scope, role_family, target_roles, problem_tags,
             ats_dimensions, keywords, advice_card_title, user_problem_summary,
             "A_action", action_summary, "I_insight"
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY id
    `,
    [ids]
  );

  const candidates = rows.map((row) => ({
    current: row,
    next: inferNextFields(row),
  }));
  const updates = candidates.filter((item) => item.next);
  const manualReview = candidates.filter((item) => !item.next);

  console.log(JSON.stringify({
    apply: APPLY,
    audit: AUDIT_PATH,
    flaggedIds: ids.length,
    updatable: updates.length,
    manualReview: manualReview.length,
  }, null, 2));

  for (const item of candidates) {
    const row = item.current;
    console.log(`\n# id=${row.id}`);
    console.log(`current role=${row.role_family || ""} targets=${row.target_roles || ""}`);
    if (item.next) {
      console.log(`next role=${item.next.role_family} targets=${item.next.target_roles}`);
      console.log(`reason=${item.next.reason}`);
    } else {
      console.log("next=manual_review");
    }
    console.log(`title=${compact(row.advice_card_title || row.user_problem_summary)}`);
    console.log(`action=${compact(row.A_action || row.action_summary, 420)}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_role_family_leaks_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(candidates, null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    for (const item of updates) {
      await pool.query(
        `
          UPDATE segments
             SET role_family = $2,
                 target_roles = $3
           WHERE id = $1
        `,
        [item.current.id, item.next.role_family, item.next.target_roles]
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
