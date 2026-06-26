"use strict";

const { findRoleDictionaryEntry } = require("./role-dictionary");
const { classifyPositionTitle, ROLE_GROUP_BY_FAMILY } = require("./position-role-taxonomy");

const FAMILY_CLUSTER_CONFIG = {
  accounting: {
    functionCluster: "accounting",
    adjacentClusters: ["audit", "tax", "finance_operations", "compliance", "financial_reporting", "finance"],
    forbiddenDriftClusters: ["software", "design", "quant_trading", "investment_research", "machine_learning"],
  },
  actuarial: {
    functionCluster: "finance",
    adjacentClusters: ["finance", "data", "risk", "insurance", "statistics"],
    forbiddenDriftClusters: ["software_deep", "design", "marketing"],
  },
  finance: {
    functionCluster: "finance",
    adjacentClusters: ["accounting", "audit", "finance_operations", "banking", "investment_research", "compliance"],
    forbiddenDriftClusters: ["software", "design", "machine_learning"],
  },
  trading_quant: {
    functionCluster: "quant_trading",
    adjacentClusters: ["finance", "data", "machine_learning", "investment_research", "risk"],
    forbiddenDriftClusters: ["accounting", "design", "marketing"],
  },
  business_analysis: {
    functionCluster: "business",
    adjacentClusters: ["data", "operations", "product", "finance", "consulting"],
    forbiddenDriftClusters: ["software_deep", "design"],
  },
  business_operations: {
    functionCluster: "operations",
    adjacentClusters: ["business", "finance_operations", "supply_chain", "project_management"],
    forbiddenDriftClusters: ["software_deep", "investment_research"],
  },
  consulting: {
    functionCluster: "business",
    adjacentClusters: ["operations", "finance", "data", "product", "strategy"],
    forbiddenDriftClusters: ["software_deep", "design"],
  },
  operations: {
    functionCluster: "operations",
    adjacentClusters: ["business", "supply_chain", "finance_operations", "compliance"],
    forbiddenDriftClusters: ["software_deep", "investment_research"],
  },
  procurement: {
    functionCluster: "operations",
    adjacentClusters: ["supply_chain", "finance_operations", "business", "vendor_management"],
    forbiddenDriftClusters: ["software_deep", "investment_research"],
  },
  supply_chain_logistics: {
    functionCluster: "operations",
    adjacentClusters: ["supply_chain", "procurement", "business", "finance_operations"],
    forbiddenDriftClusters: ["software_deep", "investment_research"],
  },
  logistics_operations: {
    functionCluster: "operations",
    adjacentClusters: ["supply_chain", "dispatch", "delivery_operations", "customer_success", "business", "data"],
    forbiddenDriftClusters: ["machine_learning", "software_deep", "investment_research", "design"],
  },
  data_analyst: {
    functionCluster: "data",
    adjacentClusters: ["analytics", "business", "finance", "product", "operations"],
    forbiddenDriftClusters: ["software_deep", "design"],
  },
  data_engineer: {
    functionCluster: "data",
    adjacentClusters: ["software", "cloud_infrastructure", "analytics", "machine_learning"],
    forbiddenDriftClusters: ["accounting", "design", "marketing"],
  },
  data_scientist: {
    functionCluster: "data",
    adjacentClusters: ["machine_learning", "analytics", "research", "product", "finance"],
    forbiddenDriftClusters: ["accounting", "design"],
  },
  machine_learning: {
    functionCluster: "machine_learning",
    adjacentClusters: ["software", "data", "data_science", "ai_engineering", "technical_depth"],
    forbiddenDriftClusters: ["accounting", "audit", "tax", "finance_operations", "investment_research", "compliance", "finance"],
  },
  ai_engineer: {
    functionCluster: "machine_learning",
    adjacentClusters: ["software", "data", "machine_learning", "technical_depth"],
    forbiddenDriftClusters: ["accounting", "audit", "tax", "finance_operations", "investment_research", "compliance", "finance"],
  },
  software_engineer: {
    functionCluster: "software",
    adjacentClusters: ["data", "machine_learning", "product", "technical_depth", "cloud_infrastructure"],
    forbiddenDriftClusters: ["accounting", "audit", "tax", "investment_research"],
  },
  cloud_infrastructure: {
    functionCluster: "software",
    adjacentClusters: ["software", "cybersecurity", "it_support", "data_engineer"],
    forbiddenDriftClusters: ["accounting", "design", "marketing"],
  },
  cybersecurity: {
    functionCluster: "software",
    adjacentClusters: ["software", "cloud_infrastructure", "it_support", "compliance"],
    forbiddenDriftClusters: ["accounting", "design", "marketing"],
  },
  it_support: {
    functionCluster: "operations",
    adjacentClusters: ["software", "cloud_infrastructure", "business", "customer_success"],
    forbiddenDriftClusters: ["investment_research", "design"],
  },
  product_manager: {
    functionCluster: "product",
    adjacentClusters: ["business", "software", "data", "marketing", "operations"],
    forbiddenDriftClusters: ["accounting", "audit", "tax"],
  },
  marketing: {
    functionCluster: "marketing",
    adjacentClusters: ["brand", "growth", "sales", "content", "business", "data"],
    forbiddenDriftClusters: ["accounting", "software_deep"],
  },
  sales_customer_success: {
    functionCluster: "business",
    adjacentClusters: ["marketing", "operations", "product", "customer_success"],
    forbiddenDriftClusters: ["software_deep", "investment_research"],
  },
  communications_pr: {
    functionCluster: "marketing",
    adjacentClusters: ["marketing", "brand", "content", "business"],
    forbiddenDriftClusters: ["software_deep", "accounting"],
  },
  ux_research_design: {
    functionCluster: "design",
    adjacentClusters: ["product", "research", "software", "marketing"],
    forbiddenDriftClusters: ["accounting", "finance", "software_deep"],
  },
  design_creative: {
    functionCluster: "design",
    adjacentClusters: ["product", "portfolio", "marketing", "creative"],
    forbiddenDriftClusters: ["accounting", "finance", "software_deep"],
  },
  hardware_electrical: {
    functionCluster: "engineering_hardware",
    adjacentClusters: ["software", "manufacturing", "quality", "technical_depth"],
    forbiddenDriftClusters: ["accounting", "marketing", "design"],
  },
  mechanical_engineering: {
    functionCluster: "engineering_hardware",
    adjacentClusters: ["manufacturing", "quality", "operations", "technical_depth"],
    forbiddenDriftClusters: ["accounting", "marketing", "investment_research"],
  },
  manufacturing_process: {
    functionCluster: "operations",
    adjacentClusters: ["engineering_hardware", "quality", "supply_chain", "business"],
    forbiddenDriftClusters: ["investment_research", "design"],
  },
  industrial_quality: {
    functionCluster: "operations",
    adjacentClusters: ["manufacturing", "engineering_hardware", "business", "compliance"],
    forbiddenDriftClusters: ["investment_research", "design"],
  },
  civil_construction: {
    functionCluster: "engineering_hardware",
    adjacentClusters: ["project_management", "operations", "technical_depth"],
    forbiddenDriftClusters: ["accounting", "marketing", "investment_research"],
  },
  legal_compliance: {
    functionCluster: "compliance",
    adjacentClusters: ["business", "finance", "operations", "policy"],
    forbiddenDriftClusters: ["software_deep", "design"],
  },
  healthcare: {
    functionCluster: "healthcare",
    adjacentClusters: ["operations", "life_sciences", "policy", "research"],
    forbiddenDriftClusters: ["investment_research", "software_deep", "design"],
  },
  life_sciences: {
    functionCluster: "life_sciences",
    adjacentClusters: ["healthcare", "research", "data", "engineering_hardware"],
    forbiddenDriftClusters: ["investment_research", "marketing"],
  },
  hr_recruiting: {
    functionCluster: "business",
    adjacentClusters: ["operations", "communications", "customer_success"],
    forbiddenDriftClusters: ["software_deep", "investment_research"],
  },
  education: {
    functionCluster: "education",
    adjacentClusters: ["research", "communications", "social_services"],
    forbiddenDriftClusters: ["investment_research", "software_deep"],
  },
  research_academic: {
    functionCluster: "research",
    adjacentClusters: ["education", "data", "life_sciences", "technical_depth"],
    forbiddenDriftClusters: ["marketing", "sales"],
  },
  policy_public_sector: {
    functionCluster: "policy",
    adjacentClusters: ["compliance", "research", "healthcare", "sustainability"],
    forbiddenDriftClusters: ["software_deep", "investment_research"],
  },
  journalism_media: {
    functionCluster: "media",
    adjacentClusters: ["communications", "marketing", "content", "research"],
    forbiddenDriftClusters: ["software_deep", "accounting"],
  },
  hospitality_events: {
    functionCluster: "operations",
    adjacentClusters: ["business", "customer_success", "marketing"],
    forbiddenDriftClusters: ["software_deep", "investment_research"],
  },
  social_services: {
    functionCluster: "healthcare",
    adjacentClusters: ["education", "policy", "operations"],
    forbiddenDriftClusters: ["software_deep", "investment_research"],
  },
  sustainability_environment: {
    functionCluster: "policy",
    adjacentClusters: ["research", "compliance", "operations", "data"],
    forbiddenDriftClusters: ["software_deep", "investment_research"],
  },
  other: {
    functionCluster: "general",
    adjacentClusters: ["business", "operations", "recruiting"],
    forbiddenDriftClusters: [],
  },
};

const FAMILY_ALIAS = {
  "finance / accounting": "finance",
  "finance accounting": "finance",
  "data & analytics": "data_analyst",
  "data analytics": "data_analyst",
  "ai machine learning": "ai_engineer",
  "ai ml": "ai_engineer",
  "machine learning ai": "ai_engineer",
  "software engineering": "software_engineer",
  "full stack": "software_engineer",
  "full stack engineer": "software_engineer",
  "full stack developer": "software_engineer",
  fullstack: "software_engineer",
  "logistics operations": "logistics_operations",
  engineering: "software_engineer",
  "business / consulting / operations": "business_analysis",
  "business consulting operations": "business_analysis",
  design: "design_creative",
  "marketing / sales / communications": "marketing",
  healthcare: "healthcare",
  education: "education",
};

function buildRoleProfileFromContext(context = {}) {
  const targetRole = context.targetRole || context.internalAtsResult?.jobTitle || context.internalAtsResult?.profile?.targetRole || context.retrievalQuery?.targetRole || "";
  const jdText = context.internalAtsResult?.jdText || context.retrievalQuery?.queryText || "";
  const contextFamily = normalizeFamily(context.internalAtsResult?.profile?.roleFamily) || normalizeFamily(context.retrievalQuery?.roleFamily);
  const foundRoleEntry = context.roleDictionaryEntry || findRoleDictionaryEntry(targetRole, jdText) || null;
  const roleEntry = isCompatibleRoleEntry(foundRoleEntry, contextFamily) ? foundRoleEntry : null;
  const titleForTaxonomy = [
    roleEntry?.canonical_role,
    roleEntry?.position_title_original,
    targetRole,
    context.internalAtsResult?.profile?.roleFamily,
    context.retrievalQuery?.roleFamily,
  ].filter(Boolean).join(" ");
  const classified = classifyPositionTitle(titleForTaxonomy);
  const familyFromEntry = normalizeFamily(roleEntry?.role_family);
  const canonicalRoleFamily = classified.canonicalRoleFamily !== "other"
    ? classified.canonicalRoleFamily
    : familyFromEntry || contextFamily || "other";
  const config = FAMILY_CLUSTER_CONFIG[canonicalRoleFamily] || FAMILY_CLUSTER_CONFIG.other;
  const roleSkillClusters = inferSkillClustersFromRoleEntry(roleEntry);
  return {
    targetRole,
    canonicalRole: roleEntry?.canonical_role || roleEntry?.position_title_original || targetRole,
    roleFamily: familyFromEntry || canonicalRoleFamily,
    canonicalRoleFamily,
    roleGroup: classified.roleGroup || ROLE_GROUP_BY_FAMILY[canonicalRoleFamily] || "other",
    taxonomySource: roleEntry ? "role_dictionary" : classified.source,
    functionCluster: config.functionCluster,
    adjacentClusters: unique([...(config.adjacentClusters || []), ...roleSkillClusters.adjacentHints]),
    skillClusters: unique([...(config.skillClusters || []), ...roleSkillClusters.skillClusters]),
    forbiddenDriftClusters: config.forbiddenDriftClusters || [],
    roleDictionaryEntry: roleEntry,
  };
}

function normalizeFamily(value = "") {
  const key = String(value || "").toLowerCase().replace(/[_/-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!key) return "";
  if (FAMILY_CLUSTER_CONFIG[key]) return key;
  if (FAMILY_ALIAS[key]) return FAMILY_ALIAS[key];
  const snake = key.replace(/\s+/g, "_");
  if (FAMILY_CLUSTER_CONFIG[snake]) return snake;
  return "";
}

function isCompatibleRoleEntry(roleEntry = null, contextFamily = "") {
  if (!roleEntry || !contextFamily || contextFamily === "other") return true;
  const entryFamily = normalizeFamily(roleEntry.role_family);
  if (!entryFamily || entryFamily === contextFamily) return true;
  const contextConfig = FAMILY_CLUSTER_CONFIG[contextFamily] || {};
  const entryConfig = FAMILY_CLUSTER_CONFIG[entryFamily] || {};
  const contextRelated = new Set([contextFamily, ...(contextConfig.adjacentClusters || [])]);
  const entryRelated = new Set([entryFamily, ...(entryConfig.adjacentClusters || [])]);
  return contextRelated.has(entryFamily) || entryRelated.has(contextFamily);
}

function inferSkillClustersFromRoleEntry(role = null) {
  const text = [
    ...(role?.core_skills_required || []),
    ...(role?.secondary_skills || []),
    ...(role?.tools_technologies || []),
    ...(role?.domain_keywords || []),
    ...(role?.experience_project_signals || []),
    ...(role?.deliverables_outputs || []),
  ].join(" ").toLowerCase();
  const skillClusters = [];
  const adjacentHints = [];
  const add = (target, pattern, bucket = skillClusters) => {
    if (pattern.test(text)) bucket.push(target);
  };
  add("python", /\bpython\b/);
  add("sql", /\bsql\b/);
  add("excel", /\bexcel|spreadsheet|pivot|vlookup/);
  add("machine_learning", /machine learning|model training|model evaluation|model deployment|model monitoring|model inference|pytorch|tensorflow|deep learning|llm|nlp|computer vision/);
  add("model_evaluation", /model evaluation|accuracy|precision|recall|f1 score|auc|experiment|a\/b/);
  add("ml_deployment", /model deployment|deploy ml|ml service|inference service|serving|mlops|docker|kubernetes/);
  add("financial_reporting", /financial statement|gaap|ifrs|journal entr|general ledger|income statement|balance sheet|cash flow/);
  add("reconciliation", /reconciliation|reconcile|month-end|month end|close/);
  add("compliance", /compliance|regulatory|controls|audit/);
  add("data", /\b(data|analytics|dashboard|tableau|power bi|etl|warehouse)\b/, adjacentHints);
  add("software", /\b(software|api|backend|frontend|java|javascript|typescript|cloud)\b/, adjacentHints);
  add("finance", /\b(finance|financial|valuation|budget|forecast|investment)\b/, adjacentHints);
  return {
    skillClusters: unique(skillClusters),
    adjacentHints: unique(adjacentHints),
  };
}

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

module.exports = {
  buildRoleProfileFromContext,
  FAMILY_CLUSTER_CONFIG,
};
