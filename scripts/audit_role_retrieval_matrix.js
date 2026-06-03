"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");
const {
  retrieveMentorAdvice,
  isAdviceRoleSafe,
  hasCrossRoleUnsafeAdvice,
  careerGroupOf,
} = require("../services/mentorAdviceRetrieval");

const FAMILY_ARG = process.argv.find((arg) => arg.startsWith("--families="))?.split("=")[1] || "";
const LIMIT_FAMILIES = Number(process.argv.find((arg) => arg.startsWith("--limit-families="))?.split("=")[1] || 0);
const TOP = Number(process.argv.find((arg) => arg.startsWith("--top="))?.split("=")[1] || 12);
const BURIED = Number(process.argv.find((arg) => arg.startsWith("--buried="))?.split("=")[1] || 5);
const FAIL_ON_FLAGS = process.argv.includes("--fail-on-flags");
const FAIL_ON_SEVERE = process.argv.includes("--fail-on-severe");
const MAX_FLAGS = Number(process.argv.find((arg) => arg.startsWith("--max-flags="))?.split("=")[1] || 0);

const DEFAULT_PROBLEM_TAGS = [
  "low_jd_keyword_match",
  "missing_priority_keywords",
  "low_hard_skill_match",
  "weak_experience_keyword_evidence",
  "missing_exact_job_title",
  "weak_target_role_alignment",
];

const ROLE_GROUPS = {
  tech: ["software_engineer", "cloud_infrastructure", "cybersecurity", "it_support"],
  data: ["machine_learning", "ai_engineer", "data_scientist", "data_analyst", "data_engineer"],
  design_creative: ["design_creative", "ux_research_design"],
  finance_accounting: ["finance", "accounting", "trading_quant", "actuarial"],
  business_ops: ["business_analysis", "operations", "business_operations", "project_program_management", "consulting", "supply_chain_logistics", "procurement", "hr_recruiting", "hospitality_events"],
  marketing_sales: ["marketing", "sales_customer_success", "communications_pr"],
  product: ["product_manager"],
  engineering_hardware: ["hardware_electrical", "mechanical_engineering", "manufacturing_process", "industrial_quality", "civil_construction"],
  healthcare_life_sciences: ["healthcare", "life_sciences", "social_services"],
  legal_policy: ["legal_compliance", "policy_public_sector", "sustainability_environment"],
  education_research: ["education", "research_academic"],
  media: ["journalism_media"],
};

function groupOf(family) {
  for (const [group, families] of Object.entries(ROLE_GROUPS)) {
    if (families.includes(family)) return group;
  }
  return "other";
}

const ROLE_CONFIG = {
  software_engineer: {
    targetRole: "Software Development Engineer",
    targetRoles: ["software_engineer", "software_development_engineer", "backend_engineer"],
    keywords: ["software development", "data structures", "algorithms", "Java", "Python", "API", "debugging", "code review", "microservices"],
  },
  cloud_infrastructure: {
    targetRole: "Cloud Engineer",
    targetRoles: ["cloud_engineer", "solutions_architect", "devops_engineer"],
    keywords: ["AWS", "Azure", "GCP", "Kubernetes", "Docker", "CI/CD", "Terraform", "Linux", "networking"],
  },
  cybersecurity: {
    targetRole: "Cybersecurity Analyst",
    targetRoles: ["cybersecurity_analyst", "security_engineer"],
    keywords: ["security", "incident response", "SIEM", "vulnerability", "threat", "risk", "network security"],
  },
  machine_learning: {
    targetRole: "Machine Learning Engineer Intern (MLE)",
    targetRoles: ["machine_learning_engineer", "mle", "machine_learning_engineer_intern"],
    keywords: ["machine learning", "image generation", "Stable Diffusion", "SDXL", "Flux", "ComfyUI", "Python", "PyTorch", "TensorFlow", "model evaluation", "debugging", "pipeline"],
  },
  ai_engineer: {
    targetRole: "AI Engineer",
    targetRoles: ["ai_engineer", "llm_engineer", "generative_ai_engineer"],
    keywords: ["LLM", "RAG", "agent", "fine-tuning", "prompt engineering", "vector database", "Python", "LangChain", "model deployment"],
  },
  data_scientist: {
    targetRole: "Data Scientist",
    targetRoles: ["data_scientist", "applied_scientist", "statistician"],
    keywords: ["Python", "R", "SQL", "statistical modeling", "A/B testing", "machine learning", "experimentation", "visualization"],
  },
  data_analyst: {
    targetRole: "Data Analyst",
    targetRoles: ["data_analyst", "business_intelligence_analyst"],
    keywords: ["SQL", "Excel", "Tableau", "Power BI", "dashboard", "KPI", "data cleaning", "business insights"],
  },
  data_engineer: {
    targetRole: "Data Engineer",
    targetRoles: ["data_engineer", "data_warehouse_engineer"],
    keywords: ["ETL", "data pipeline", "Spark", "Airflow", "SQL", "Python", "data warehouse", "AWS", "Snowflake"],
  },
  design_creative: {
    targetRole: "Graphic Designer",
    targetRoles: ["graphic_designer", "visual_designer", "brand_designer"],
    keywords: ["portfolio", "Adobe", "Figma", "visual design", "brand identity", "layout", "typography", "PDF"],
  },
  ux_research_design: {
    targetRole: "UX Designer",
    targetRoles: ["ux_designer", "product_designer", "ui_designer"],
    keywords: ["Figma", "user research", "wireframe", "prototype", "usability testing", "design system", "user journey"],
  },
  product_manager: {
    targetRole: "Product Manager",
    targetRoles: ["product_manager", "associate_product_manager"],
    keywords: ["roadmap", "PRD", "user research", "A/B testing", "stakeholder", "metrics", "launch", "cross-functional"],
  },
  marketing: {
    targetRole: "Marketing Analyst",
    targetRoles: ["marketing_analyst", "digital_marketing_specialist", "brand_manager"],
    keywords: ["campaign", "SEO", "SEM", "Google Analytics", "CRM", "conversion", "content strategy", "brand"],
  },
  finance: {
    targetRole: "Financial Analyst",
    targetRoles: ["financial_analyst", "finance_analyst"],
    keywords: ["financial modeling", "Excel", "forecasting", "budgeting", "variance analysis", "valuation", "KPI"],
  },
  accounting: {
    targetRole: "Accountant",
    targetRoles: ["accountant", "accounting_analyst", "auditor"],
    keywords: ["GAAP", "reconciliation", "accounts payable", "accounts receivable", "audit", "month-end close", "QuickBooks"],
  },
  trading_quant: {
    targetRole: "Quantitative Analyst",
    targetRoles: ["quantitative_analyst", "quantitative_researcher", "trader"],
    keywords: ["Python", "statistical modeling", "portfolio", "risk", "backtesting", "financial markets", "time series"],
  },
  business_analysis: {
    targetRole: "Business Analyst",
    targetRoles: ["business_analyst", "business_systems_analyst"],
    keywords: ["requirements gathering", "process improvement", "SQL", "Excel", "stakeholder", "JIRA", "business case"],
  },
  consulting: {
    targetRole: "Management Consultant",
    targetRoles: ["management_consultant", "business_consultant"],
    keywords: ["client", "problem structuring", "market research", "Excel modeling", "presentation", "recommendation", "stakeholder"],
  },
  operations: {
    targetRole: "Operations Analyst",
    targetRoles: ["operations_analyst", "operations_manager"],
    keywords: ["process optimization", "KPI", "workflow", "cross-functional", "efficiency", "cost reduction", "operations"],
  },
  supply_chain_logistics: {
    targetRole: "Supply Chain Analyst",
    targetRoles: ["supply_chain_analyst", "logistics_analyst"],
    keywords: ["supply chain", "inventory", "logistics", "demand planning", "forecasting", "ERP", "vendor"],
  },
  project_program_management: {
    targetRole: "Project Manager",
    targetRoles: ["project_manager", "program_manager"],
    keywords: ["timeline", "budget", "risk management", "stakeholder", "Agile", "Scrum", "delivery", "cross-functional"],
  },
  sales_customer_success: {
    targetRole: "Account Executive",
    targetRoles: ["account_executive", "account_manager", "customer_success_manager"],
    keywords: ["quota", "pipeline", "CRM", "Salesforce", "account management", "cold outreach", "negotiation", "revenue"],
  },
  communications_pr: {
    targetRole: "Public Relations Specialist",
    targetRoles: ["public_relations_specialist", "communications_specialist", "technical_writer"],
    keywords: ["public relations", "communications", "press release", "media relations", "content", "stakeholder", "writing"],
  },
  it_support: {
    targetRole: "IT Support Specialist",
    targetRoles: ["it_support_specialist", "it_specialist", "systems_administrator"],
    keywords: ["ticketing", "troubleshooting", "help desk", "Windows", "Linux", "network", "hardware", "customer support"],
  },
  business_operations: {
    targetRole: "Business Operations Manager",
    targetRoles: ["business_operations_manager", "business_manager", "management_trainee"],
    keywords: ["operations", "business process", "KPI", "stakeholder", "cross-functional", "process improvement", "reporting"],
  },
  hospitality_events: {
    targetRole: "Event Planner",
    targetRoles: ["event_planner", "hospitality_manager", "host"],
    keywords: ["event", "hospitality", "vendor", "guest experience", "coordination", "budget", "operations"],
  },
  hr_recruiting: {
    targetRole: "Human Resources Specialist",
    targetRoles: ["human_resources_specialist", "recruiter", "talent_acquisition"],
    keywords: ["recruiting", "onboarding", "HRIS", "employee relations", "Workday", "talent acquisition", "screening"],
  },
  journalism_media: {
    targetRole: "Data Journalist",
    targetRoles: ["data_journalist", "journalist", "media_assistant"],
    keywords: ["journalism", "storytelling", "data visualization", "reporting", "editing", "audience", "research"],
  },
  actuarial: {
    targetRole: "Actuarial Analyst",
    targetRoles: ["actuarial_analyst", "actuary"],
    keywords: ["actuarial", "risk modeling", "Excel", "R", "Python", "pricing", "reserving", "insurance"],
  },
  sustainability_environment: {
    targetRole: "Sustainability Analyst",
    targetRoles: ["sustainability_analyst", "esg_analyst", "climate_analyst"],
    keywords: ["ESG", "sustainability", "climate", "carbon", "policy", "reporting", "impact analysis"],
  },
  social_services: {
    targetRole: "Social Worker",
    targetRoles: ["social_worker", "psychologist", "counselor"],
    keywords: ["case management", "counseling", "community", "client", "assessment", "care plan", "mental health"],
  },
  civil_construction: {
    targetRole: "Construction Manager",
    targetRoles: ["construction_manager", "civil_engineer"],
    keywords: ["construction", "site", "project schedule", "budget", "AutoCAD", "safety", "contractor"],
  },
  procurement: {
    targetRole: "Purchasing Agent",
    targetRoles: ["purchasing_agent", "procurement_specialist", "buyer"],
    keywords: ["procurement", "vendor", "sourcing", "purchase order", "negotiation", "supply chain", "cost savings"],
  },
  other: {
    targetRole: "General Resume",
    targetRoles: ["general"],
    keywords: ["resume", "summary", "skills", "experience", "project", "keyword", "ATS"],
  },
  hardware_electrical: {
    targetRole: "Hardware Engineer",
    targetRoles: ["hardware_engineer", "electrical_engineer", "ic_design_engineer"],
    keywords: ["Verilog", "RTL", "FPGA", "PCB", "circuit", "simulation", "VLSI", "EDA", "lab"],
  },
  mechanical_engineering: {
    targetRole: "Mechanical Engineer",
    targetRoles: ["mechanical_engineer", "robotics_engineer"],
    keywords: ["CAD", "SolidWorks", "mechanical design", "FEA", "manufacturing", "robotics", "control system"],
  },
  manufacturing_process: {
    targetRole: "Manufacturing Engineer",
    targetRoles: ["manufacturing_engineer", "process_engineer"],
    keywords: ["manufacturing", "process improvement", "quality", "lean", "six sigma", "yield", "root cause"],
  },
  industrial_quality: {
    targetRole: "Quality Engineer",
    targetRoles: ["quality_engineer", "quality_assurance_engineer"],
    keywords: ["quality", "QA", "root cause", "CAPA", "process improvement", "six sigma", "inspection"],
  },
  healthcare: {
    targetRole: "Clinical Research Associate",
    targetRoles: ["clinical_research_associate", "healthcare_analyst"],
    keywords: ["clinical", "healthcare", "patient", "trial", "regulatory", "data collection", "medical"],
  },
  life_sciences: {
    targetRole: "Bioinformatics Scientist",
    targetRoles: ["bioinformatics_scientist", "biomedical_researcher"],
    keywords: ["bioinformatics", "omics", "Python", "R", "wet lab", "assay", "research", "biotech"],
  },
  legal_compliance: {
    targetRole: "Compliance Analyst",
    targetRoles: ["compliance_analyst", "legal_assistant", "paralegal"],
    keywords: ["compliance", "regulatory", "legal research", "contract", "risk", "policy", "documentation"],
  },
  policy_public_sector: {
    targetRole: "Policy Analyst",
    targetRoles: ["policy_analyst", "public_policy_analyst"],
    keywords: ["policy", "public sector", "research", "stakeholder", "legislation", "impact analysis", "brief"],
  },
  education: {
    targetRole: "Instructional Designer",
    targetRoles: ["instructional_designer", "education_consultant"],
    keywords: ["curriculum", "instructional design", "learning", "training", "assessment", "student", "LMS"],
  },
  research_academic: {
    targetRole: "Research Assistant",
    targetRoles: ["research_assistant", "research_associate", "research_scientist"],
    keywords: ["research", "literature review", "experiment", "data analysis", "publication", "methodology", "grant"],
  },
};

const CONFLICT_TERMS_BY_GROUP = {
  tech: ["financial analyst", "accounting", "portfolio", "fashion", "graphic designer", "healthcare", "clinical", "hardware", "fpga"],
  data: ["financial reporting", "accounting", "graphic designer", "portfolio link", "ux", "hardware", "clinical trial", "risk consulting"],
  design_creative: ["accounting", "financial modeling", "SQL dashboard", "machine learning engineer", "hardware", "clinical"],
  finance_accounting: ["machine learning engineer", "pytorch", "graphic designer", "ux designer", "hardware", "clinical"],
  business_ops: ["pytorch", "machine learning engineer", "graphic designer", "verilog", "clinical trial"],
  marketing_sales: ["pytorch", "verilog", "accounting reconciliation", "clinical trial", "machine learning engineer"],
  engineering_hardware: ["financial analyst", "accounting", "graphic designer", "marketing campaign", "clinical trial"],
  healthcare_life_sciences: ["financial analyst", "graphic designer", "frontend", "hardware engineer", "marketing campaign"],
  legal_policy: ["pytorch", "frontend", "graphic designer", "financial modeling", "hardware engineer"],
  education_research: ["financial analyst", "frontend", "graphic designer", "hardware engineer", "accounting"],
};

function splitCsv(value) {
  if (Array.isArray(value)) return value.flatMap(splitCsv);
  return String(value || "")
    .split(/[,;|，、\n]+/)
    .map((item) => item.trim().toLowerCase().replace(/[\s-]+/g, "_"))
    .filter(Boolean);
}

function compact(value, length = 220) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, length);
}

function regexFromTerms(terms) {
  return terms
    .filter(Boolean)
    .map((term) => String(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/[_\s-]+/g, "[_\\s-]+"))
    .join("|") || "a^";
}

function textOf(rowOrCard) {
  return [
    rowOrCard.role_family, rowOrCard.roleFamily,
    rowOrCard.target_roles, rowOrCard.targetRoles,
    rowOrCard.problem_tags, rowOrCard.relatedProblemTags,
    rowOrCard.keywords, rowOrCard.title, rowOrCard.problemSummary,
    rowOrCard.currentDiagnosis, rowOrCard.actionSummary, rowOrCard.action,
    rowOrCard.advice_card_title, rowOrCard.user_problem_summary,
    rowOrCard.A_action, rowOrCard.action_summary, rowOrCard.I_insight,
  ].filter(Boolean).join(" ").toLowerCase();
}

function buildProfile(family, sampleTitles = []) {
  const config = ROLE_CONFIG[family] || {};
  const title = config.targetRole || sampleTitles[0] || family.replace(/_/g, " ");
  return {
    family,
    group: groupOf(family),
    targetRole: title,
    targetRoles: config.targetRoles || [family],
    keywords: config.keywords || sampleTitles.slice(0, 4).concat(family.replace(/_/g, " ")),
    problemTags: DEFAULT_PROBLEM_TAGS,
  };
}

function isConcreteMismatch(card, profile) {
  const families = splitCsv(card.roleFamily || card.role_family).filter((term) => term !== "universal");
  if (!families.length) return false;
  if (families.includes(profile.family)) return false;
  const profileCareerGroup = careerGroupOf(profile.family) || profile.group;
  return !families.some((family) => (careerGroupOf(family) || groupOf(family)) === profileCareerGroup);
}

function hasConflictText(card, profile) {
  const terms = CONFLICT_TERMS_BY_GROUP[profile.group] || [];
  const text = textOf(card);
  return terms.filter((term) => text.includes(term.toLowerCase()));
}

function roleSignal(card) {
  const reasons = new Set(card.matched_reasons || []);
  return [
    reasons.has("role_family") ? "role" : "",
    reasons.has("target_roles") ? "target" : "",
    reasons.has("keywords") ? "kw" : "",
    reasons.has("content_keywords") ? "content" : "",
  ].filter(Boolean).join("+") || "none";
}

function buriedScore(row, profile) {
  const text = textOf(row);
  let score = 0;
  for (const keyword of profile.keywords) {
    const normalized = String(keyword).toLowerCase().replace(/_/g, " ");
    if (normalized && text.includes(normalized)) score += 3;
  }
  const rowFamilies = splitCsv(row.role_family);
  const rowTargets = splitCsv(row.target_roles);
  if (rowFamilies.includes(profile.family)) score += 8;
  if (rowTargets.some((target) => profile.targetRoles.map((t) => t.toLowerCase()).includes(target))) score += 5;
  if ((row.retrieval_scope || "resume_edit") === "resume_edit") score += 2;
  if (/project|项目|experience|经历|bullet|skills|技能|summary|简历|resume|jd|ats|keyword|关键词/i.test(text)) score += 2;
  if (hasConflictText(row, profile).length) score -= 8;
  if (/interview|面试|job_search|career_strategy|school_application/i.test(row.retrieval_scope || "")) score -= 10;
  return score;
}

async function loadFamilies(pool) {
  const { rows } = await pool.query(`
    SELECT canonical_role_family, role_group, array_agg(position_title ORDER BY position_title) AS titles, COUNT(*)::int AS count
      FROM position_skills
     WHERE canonical_role_family IS NOT NULL
       AND canonical_role_family <> ''
     GROUP BY canonical_role_family, role_group
     ORDER BY count DESC, canonical_role_family
  `);
  return rows;
}

async function findBuriedRows(pool, profile, selectedIds) {
  const terms = [
    profile.family,
    ...profile.targetRoles,
    ...profile.keywords,
  ].filter(Boolean);
  const pattern = regexFromTerms(terms);
  const { rows } = await pool.query(
    `
      SELECT id, chunk_id, retrieval_scope, role_family, target_roles, problem_tags,
             ats_dimensions, keywords, topic, "L1", "L2", advice_card_title,
             user_problem_summary, "A_action", action_summary, "I_insight"
        FROM segments
       WHERE (retrieval_scope IS NULL OR retrieval_scope = 'resume_edit')
         AND (
           role_family ~* $1 OR target_roles ~* $1 OR keywords ~* $1 OR
           retrieval_text ~* $1 OR advice_card_title ~* $1 OR user_problem_summary ~* $1 OR
           "A_action" ~* $1 OR action_summary ~* $1 OR "I_insight" ~* $1
         )
       ORDER BY id
       LIMIT 1500
    `,
    [pattern]
  );

  return rows
    .filter((row) => !selectedIds.has(`seg_${row.id}`))
    .map((row) => ({ ...row, auditScore: buriedScore(row, profile) }))
    .filter((row) => row.auditScore > 4)
    .sort((a, b) => b.auditScore - a.auditScore || a.id - b.id)
    .slice(0, BURIED);
}

function buildRetrievalQuery(profile) {
  return {
    targetRole: profile.targetRole,
    problemTags: profile.problemTags,
    priorityKeywords: profile.keywords,
    filters: {
      roleFamily: [profile.family],
      targetRoles: profile.targetRoles,
      seniority: ["intern", "entry"],
    },
  };
}

async function auditProfile(pool, familyRow) {
  const profile = buildProfile(familyRow.canonical_role_family, familyRow.titles || []);
  const retrievalQuery = buildRetrievalQuery(profile);
  const candidates = await retrieveMentorAdvice(retrievalQuery, { limit: Math.max(80, TOP * 8) });
  const top = candidates.slice(0, TOP);
  const selectedIds = new Set(top.map((card) => card.adviceId));
  const mismatches = top.map((card, index) => {
    const conflictTerms = hasConflictText(card, profile);
    const mismatch = isConcreteMismatch(card, profile);
    const safe = isAdviceRoleSafe(card, profile.targetRole, profile.family);
    const crossRoleUnsafe = hasCrossRoleUnsafeAdvice(card, profile.family, profile.targetRole);
    return {
      index: index + 1,
      adviceId: card.adviceId,
      roleFamily: card.roleFamily || "",
      targetRoles: card.targetRoles || "",
      signal: roleSignal(card),
      safe,
      mismatch,
      crossRoleUnsafe,
      severity: (mismatch || !safe || crossRoleUnsafe || conflictTerms.length) ? "severe" : "info",
      conflicts: conflictTerms,
      title: card.title || "",
      action: card.actionSummary || "",
    };
  }).filter((item) => item.mismatch || item.conflicts.length || !item.safe || item.crossRoleUnsafe || item.signal === "none");
  const buried = await findBuriedRows(pool, profile, selectedIds);
  return { profile, positionCount: familyRow.count, top, mismatches, buried };
}

function renderMarkdown(results) {
  const lines = [];
  lines.push("# Role Retrieval Audit");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Summary");
  for (const result of results) {
    lines.push(`- ${result.profile.family} (${result.profile.group}, positions=${result.positionCount}): top=${result.top.length}, flags=${result.mismatches.length}, buried=${result.buried.length}`);
  }
  for (const result of results) {
    lines.push("");
    lines.push(`## ${result.profile.family}`);
    lines.push(`Target: ${result.profile.targetRole}`);
    lines.push(`Keywords: ${result.profile.keywords.join(", ")}`);
    lines.push("");
    lines.push("### Flagged Current Top Rows");
    if (!result.mismatches.length) {
      lines.push("- none");
    } else {
      for (const item of result.mismatches.slice(0, 8)) {
        const flags = [
          item.mismatch ? "role_mismatch" : "",
          item.safe ? "" : "not_role_safe",
          item.crossRoleUnsafe ? "cross_role_unsafe" : "",
          item.signal === "none" ? "no_role_signal" : "",
          item.conflicts.length ? `conflict:${item.conflicts.join("/")}` : "",
        ].filter(Boolean).join(", ");
        lines.push(`- #${item.index} ${item.adviceId} [${item.severity}; ${flags}] role=${item.roleFamily || "-"} target=${item.targetRoles || "-"}`);
        lines.push(`  - title: ${compact(item.title, 180)}`);
        lines.push(`  - action: ${compact(item.action, 240)}`);
      }
    }
    lines.push("");
    lines.push("### Buried Candidate Rows");
    if (!result.buried.length) {
      lines.push("- none");
    } else {
      for (const row of result.buried) {
        lines.push(`- id=${row.id} score=${row.auditScore} role=${row.role_family || "-"} target=${row.target_roles || "-"} tags=${row.problem_tags || "-"}`);
        lines.push(`  - title: ${compact(row.advice_card_title || row.user_problem_summary, 180)}`);
        lines.push(`  - action: ${compact(row.A_action || row.action_summary, 260)}`);
      }
    }
  }
  return lines.join("\n");
}

async function main() {
  const pool = db.getPool();
  let families = await loadFamilies(pool);
  if (FAMILY_ARG) {
    const requested = new Set(FAMILY_ARG.split(",").map((item) => item.trim()).filter(Boolean));
    families = families.filter((row) => requested.has(row.canonical_role_family));
  }
  if (LIMIT_FAMILIES > 0) families = families.slice(0, LIMIT_FAMILIES);

  const results = [];
  for (const familyRow of families) {
    console.log(`[audit] ${familyRow.canonical_role_family} (${familyRow.count})`);
    results.push(await auditProfile(pool, familyRow));
  }

  const auditDir = path.join(process.cwd(), "data", "audits");
  fs.mkdirSync(auditDir, { recursive: true });
  const stamp = Date.now();
  const jsonPath = path.join(auditDir, `role_retrieval_audit_${stamp}.json`);
  const mdPath = path.join(auditDir, `role_retrieval_audit_${stamp}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
  fs.writeFileSync(mdPath, renderMarkdown(results));

  const summary = results.map((result) => ({
    family: result.profile.family,
    group: result.profile.group,
    positions: result.positionCount,
    flaggedTopRows: result.mismatches.length,
    severeFlaggedTopRows: result.mismatches.filter((item) => item.severity === "severe").length,
    infoFlaggedTopRows: result.mismatches.filter((item) => item.severity !== "severe").length,
    buriedCandidates: result.buried.length,
  }));
  console.log(JSON.stringify({ families: results.length, jsonPath, mdPath, summary }, null, 2));
  const totalFlags = summary.reduce((sum, row) => sum + row.flaggedTopRows, 0);
  const totalSevereFlags = summary.reduce((sum, row) => sum + row.severeFlaggedTopRows, 0);
  if (FAIL_ON_FLAGS && totalFlags > MAX_FLAGS) {
    console.error(`[role-audit] failed: total flagged top rows ${totalFlags} > ${MAX_FLAGS}`);
    process.exit(1);
  }
  if (FAIL_ON_SEVERE && totalSevereFlags > MAX_FLAGS) {
    console.error(`[role-audit] failed: severe flagged top rows ${totalSevereFlags} > ${MAX_FLAGS}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
