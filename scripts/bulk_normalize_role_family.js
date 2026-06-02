"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const SAMPLE_LIMIT = Number(process.argv.find((arg) => arg.startsWith("--samples="))?.split("=")[1] || 20);

const ROLE_RULES = [
  {
    family: "machine_learning",
    roles: ["machine_learning_engineer", "mle", "ai_engineer"],
    re: /\b(machine learning|mle|ml engineer|mlre|rag|llm|agent|fine-?tuning|tensorflow|pytorch|mlops|comfyui|sdxl|stable diffusion|image generation)\b/i,
  },
  {
    family: "software_engineer",
    roles: ["software_engineer", "software_development_engineer"],
    re: /\b(software engineer|swe|backend|frontend|full stack|fullstack|api|react|node\.?js|java|spring|microservice|system design)\b/i,
  },
  {
    family: "data_analyst",
    roles: ["data_analyst", "business_analyst"],
    re: /\b(data analyst|business analyst|analytics|sql|tableau|power bi|dashboard|data visualization|ab testing|a\/b testing)\b/i,
  },
  {
    family: "design_creative",
    roles: ["graphic_designer", "ux_designer", "ui_designer", "designer"],
    re: /\b(graphic designer|ux|ui|figma|adobe|photoshop|illustrator|portfolio|作品集|visual design|brand design)\b/i,
  },
  {
    family: "marketing",
    roles: ["marketing", "marketing_analyst", "digital_marketing", "marketing_research"],
    re: /\b(marketing|seo|campaign|paid media|google ads|growth|market research|brand marketing|digital marketing)\b/i,
  },
  {
    family: "finance",
    roles: ["financial_analyst", "investment_analyst", "risk_analyst", "fp_and_a"],
    re: /\b(financial analyst|investment analyst|risk analyst|fp&a|treasury|equity research|asset management|corporate finance|portfolio management)\b/i,
  },
  {
    family: "accounting",
    roles: ["accountant", "auditor", "tax_consultant"],
    re: /\b(accounting|audit|tax|cpa|bookkeeping|会计|审计|税务)\b/i,
  },
  {
    family: "product_manager",
    roles: ["product_manager"],
    re: /\b(product manager|product management|prd|roadmap|user story|stakeholder)\b/i,
  },
  {
    family: "supply_chain",
    roles: ["supply_chain_analyst", "procurement", "logistics"],
    re: /\b(supply chain|procurement|logistics|inventory|采购|供应链)\b/i,
  },
];

function splitCsv(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function uniq(items) {
  return [...new Set(items.filter(Boolean))];
}

function joinCsv(items) {
  return uniq(items).join(",");
}

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
    row.problem_tags,
  ].filter(Boolean).join(" ");
}

function infer(row) {
  const text = textOf(row);
  const matches = ROLE_RULES.filter((rule) => rule.re.test(text));
  if (matches.length !== 1) return null;
  return matches[0];
}

function normalizeExisting(row) {
  const families = splitCsv(row.role_family);
  const roles = splitCsv(row.target_roles);
  const nonUniversalFamilies = families.filter((item) => item !== "universal");
  const nonUniversalRoles = roles.filter((item) => item !== "universal");

  if (nonUniversalFamilies.length) {
    return {
      reason: "remove_universal_from_existing",
      role_family: joinCsv(nonUniversalFamilies),
      target_roles: joinCsv(nonUniversalRoles.length ? nonUniversalRoles : roles),
    };
  }

  const inferred = infer(row);
  if (!inferred) return null;

  return {
    reason: `infer_${inferred.family}`,
    role_family: inferred.family,
    target_roles: inferred.roles.join(","),
  };
}

function compact(row) {
  return {
    id: row.id,
    reason: row.reason,
    old_role_family: row.role_family || "",
    new_role_family: row.next_role_family,
    old_target_roles: row.target_roles || "",
    new_target_roles: row.next_target_roles,
    topic: row.topic || "",
    sample: String(row.advice_card_title || row.P_mentor || row.A_action || "").replace(/\s+/g, " ").slice(0, 220),
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
  const { rows } = await pool.query(`
    SELECT id, topic, "L1", "L2", "P_mentor", "A_action", advice_card_title,
           user_problem_summary, action_summary, role_family, target_roles,
           target_role, target_role_family, problem_tags
      FROM segments
     WHERE COALESCE(retrieval_scope, 'resume_edit') = 'resume_edit'
       AND (role_family IS NULL OR role_family = '' OR role_family = 'universal' OR role_family LIKE '%universal%')
     ORDER BY id
  `);

  const updates = [];
  for (const row of rows) {
    const next = normalizeExisting(row);
    if (!next) continue;
    if ((row.role_family || "") === next.role_family && (row.target_roles || "") === next.target_roles) continue;
    updates.push({
      ...row,
      reason: next.reason,
      next_role_family: next.role_family,
      next_target_roles: next.target_roles,
    });
  }

  console.log(JSON.stringify({
    apply: APPLY,
    scanned_universal_rows: rows.length,
    role_updates: updates.length,
    by_reason: countBy(updates, "reason"),
  }, null, 2));

  for (const row of updates.slice(0, SAMPLE_LIMIT)) {
    const item = compact(row);
    console.log(`\n# id=${item.id} reason=${item.reason}`);
    console.log(`old_role=${item.old_role_family} -> ${item.new_role_family}`);
    console.log(`old_targets=${item.old_target_roles} -> ${item.new_target_roles}`);
    console.log(`topic=${item.topic}`);
    console.log(`sample=${item.sample}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  if (!updates.length) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_bulk_roles_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates.map((row) => ({
    id: row.id,
    role_family: row.role_family || "",
    target_roles: row.target_roles || "",
    next_role_family: row.next_role_family,
    next_target_roles: row.next_target_roles,
    reason: row.reason,
  })), null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query("CREATE TEMP TABLE segment_bulk_role_updates (id integer PRIMARY KEY, role_family text, target_roles text) ON COMMIT DROP");

    for (let start = 0; start < updates.length; start += 1000) {
      const chunk = updates.slice(start, start + 1000);
      const params = [];
      const values = chunk.map((row, index) => {
        params.push(row.id, row.next_role_family, row.next_target_roles);
        const offset = index * 3;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      });
      await pool.query(
        `INSERT INTO segment_bulk_role_updates (id, role_family, target_roles) VALUES ${values.join(",")}`,
        params
      );
    }

    await pool.query(`
      UPDATE segments AS target
         SET role_family = updates.role_family,
             target_roles = updates.target_roles
        FROM segment_bulk_role_updates AS updates
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
