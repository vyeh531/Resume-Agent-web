"use strict";

const fs = require("fs");
const path = require("path");
const { classifyPositionTitle } = require("./position_role_taxonomy");

const ROOT = path.resolve(__dirname, "..");
const POSITION_SKILLS_PATH = path.join(
  ROOT,
  "data",
  "backups",
  "position_skills_before_az_id_reorder_2026-06-01T22-07-27-386Z.json"
);
const DETAIL_DICTIONARY_PATH = path.join(ROOT, "data", "ats", "ats_role_dictionary.json");
const OUTPUT_PATH = path.join(ROOT, "public", "ats_role_dictionary.json");

const FAMILY_DOMAIN = {
  finance_accounting: ["financial reporting", "analysis", "compliance", "risk", "stakeholder communication"],
  business_ops: ["process improvement", "operations", "stakeholder communication", "workflow", "execution"],
  data: ["data analysis", "metrics", "insights", "reporting", "business impact"],
  tech: ["systems", "debugging", "technical documentation", "reliability", "scalability"],
  product: ["roadmap", "user needs", "requirements", "metrics", "launch"],
  marketing_sales: ["campaign", "customer insights", "conversion", "brand", "pipeline"],
  design_creative: ["portfolio", "visual communication", "creative direction", "user experience", "production"],
  engineering_hardware: ["design validation", "testing", "systems engineering", "quality", "documentation"],
  healthcare_life_sciences: ["clinical context", "research", "compliance", "patient outcomes", "documentation"],
  legal_policy: ["policy", "compliance", "research", "documentation", "stakeholder communication"],
  education_research: ["research", "teaching", "curriculum", "analysis", "communication"],
  media: ["storytelling", "content production", "audience", "editing", "publishing"],
  other: ["communication", "analysis", "execution", "problem solving", "documentation"],
};

const FAMILY_VERBS = {
  finance_accounting: ["analyzed", "reconciled", "forecasted", "reported", "reviewed", "modeled"],
  business_ops: ["coordinated", "improved", "managed", "executed", "streamlined", "documented"],
  data: ["analyzed", "built", "visualized", "automated", "measured", "reported"],
  tech: ["built", "implemented", "debugged", "optimized", "deployed", "documented"],
  product: ["defined", "prioritized", "launched", "researched", "aligned", "analyzed"],
  marketing_sales: ["launched", "optimized", "analyzed", "managed", "created", "converted"],
  design_creative: ["designed", "produced", "created", "iterated", "presented", "delivered"],
  engineering_hardware: ["designed", "tested", "validated", "modeled", "improved", "documented"],
  healthcare_life_sciences: ["researched", "analyzed", "documented", "coordinated", "evaluated", "supported"],
  legal_policy: ["researched", "reviewed", "drafted", "analyzed", "advised", "documented"],
  education_research: ["researched", "taught", "designed", "evaluated", "presented", "documented"],
  media: ["wrote", "edited", "produced", "published", "researched", "managed"],
  other: ["analyzed", "coordinated", "managed", "improved", "documented", "communicated"],
};

const TOOL_PATTERN = /(sql|python|excel|tableau|powerbi|power bi|aws|azure|gcp|jira|figma|sap|oracle|salesforce|quickbooks|netsuite|r\b|java|javascript|typescript|react|node|docker|kubernetes|git|looker|snowflake|spark|airflow|autocad|solidworks|matlab|linux|cisco|splunk|wireshark|servicenow)/i;

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value) {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 70);
}

function unique(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function skillList(row) {
  return unique(Array.from({ length: 10 }, (_, index) => row[`top${index + 1}_skill`]));
}

function titleAliases(title) {
  const text = String(title || "").trim();
  const aliases = [normalize(text)];
  if (/\bai\b/i.test(text)) aliases.push(text.replace(/\bAi\b/g, "AI"), text.replace(/\bAi\b/g, "Artificial Intelligence"));
  if (/\bbi\b/i.test(text)) aliases.push(text.replace(/\bBi\b/g, "BI"), text.replace(/\bBi\b/g, "Business Intelligence"));
  if (/\bqa\b/i.test(text)) aliases.push(text.replace(/\bQa\b/g, "QA"), text.replace(/\bQa\b/g, "Quality Assurance"));
  if (/\bux\b/i.test(text)) aliases.push(text.replace(/\bUx\b/g, "UX"), text.replace(/\bUx\b/g, "User Experience"));
  if (/\bui\b/i.test(text)) aliases.push(text.replace(/\bUi\b/g, "UI"), text.replace(/\bUi\b/g, "User Interface"));
  return unique(aliases.filter((alias) => alias && alias !== text));
}

function buildPositionRole(row) {
  const title = row.position_title;
  const taxonomy = classifyPositionTitle(title);
  const roleGroup = taxonomy.roleGroup || "other";
  const skills = skillList(row);
  const core = skills.slice(0, 6);
  const secondary = skills.slice(6);

  return {
    role_id: `P${String(row.id).padStart(3, "0")}_${slug(title)}`,
    position_title_original: title,
    canonical_role: title,
    role_family: taxonomy.canonicalRoleFamily,
    role_group: roleGroup,
    target_role_aliases: titleAliases(title),
    core_skills_required: core,
    secondary_skills: secondary,
    tools_technologies: skills.filter((skill) => TOOL_PATTERN.test(skill)),
    domain_keywords: unique([title, ...core.slice(0, 4), ...(FAMILY_DOMAIN[roleGroup] || FAMILY_DOMAIN.other)]),
    experience_project_signals: [
      `worked on ${title.toLowerCase()} responsibilities`,
      `applied ${core[0] || "role-specific skills"} in practical projects`,
      `collaborated with stakeholders on ${title.toLowerCase()} deliverables`,
    ],
    deliverables_outputs: unique([`${title} deliverables`, `${title} report`, "documentation", "analysis summary"]),
    metrics_kpis: ["accuracy", "efficiency", "quality", "cycle time", "stakeholder satisfaction"],
    strong_action_verbs: FAMILY_VERBS[roleGroup] || FAMILY_VERBS.other,
    preferred_certs: [],
    education_background_keywords: unique([title, ...core]).slice(0, 6),
    source: "position_skills_backup",
  };
}

function mergeDetailedRole(base, detail) {
  if (!detail) return base;
  return {
    ...base,
    ...detail,
    role_id: detail.role_id || base.role_id,
    position_title_original: base.position_title_original,
    canonical_role: detail.canonical_role || base.canonical_role,
    role_family: detail.role_family || base.role_family,
    role_group: base.role_group || detail.role_group,
    target_role_aliases: unique([...(detail.target_role_aliases || []), ...(base.target_role_aliases || [])]),
    core_skills_required: unique([...(detail.core_skills_required || []), ...(base.core_skills_required || [])]).slice(0, 18),
    secondary_skills: unique([...(detail.secondary_skills || []), ...(base.secondary_skills || [])]).slice(0, 18),
    tools_technologies: unique([...(detail.tools_technologies || []), ...(base.tools_technologies || [])]).slice(0, 18),
    domain_keywords: unique([...(detail.domain_keywords || []), ...(base.domain_keywords || [])]).slice(0, 24),
    experience_project_signals: unique([...(detail.experience_project_signals || []), ...(base.experience_project_signals || [])]).slice(0, 12),
    deliverables_outputs: unique([...(detail.deliverables_outputs || []), ...(base.deliverables_outputs || [])]).slice(0, 12),
    metrics_kpis: unique([...(detail.metrics_kpis || []), ...(base.metrics_kpis || [])]).slice(0, 12),
    strong_action_verbs: unique([...(detail.strong_action_verbs || []), ...(base.strong_action_verbs || [])]).slice(0, 12),
    preferred_certs: unique([...(detail.preferred_certs || []), ...(base.preferred_certs || [])]).slice(0, 10),
    education_background_keywords: unique([...(detail.education_background_keywords || []), ...(base.education_background_keywords || [])]).slice(0, 10),
    source: detail.source || "data_ats_merged_with_position_skills",
  };
}

function buildNetworkOperatorRole() {
  return {
    role_id: "P563_network_operator_zh",
    position_title_original: "网络运营专员 Network Operator",
    canonical_role: "Network Operator",
    role_family: "cloud_infrastructure",
    role_group: "tech",
    target_role_aliases: [
      "network operator",
      "network operations specialist",
      "network operations associate",
      "noc operator",
      "noc technician",
      "network support specialist",
      "网络运营",
      "网络运维",
      "网络监控",
      "网络运营专员",
    ],
    core_skills_required: ["network monitoring", "incident response", "troubleshooting", "ticket handling", "tcp/ip", "dns", "dhcp", "routing", "switching", "linux"],
    secondary_skills: ["sla tracking", "root cause analysis", "network documentation", "vendor coordination", "customer support", "change management"],
    tools_technologies: ["zabbix", "nagios", "grafana", "wireshark", "splunk", "servicenow", "jira", "cisco", "vpn", "firewall"],
    domain_keywords: ["network operations center", "noc", "network availability", "uptime", "latency", "packet loss", "outage", "alerts", "runbook", "service desk"],
    experience_project_signals: ["handled network alerts", "resolved connectivity issues", "monitored production network", "created incident tickets", "supported network troubleshooting"],
    deliverables_outputs: ["incident report", "network status report", "troubleshooting log", "runbook", "sla report"],
    metrics_kpis: ["uptime", "mean time to resolution", "sla compliance", "ticket volume", "incident count"],
    strong_action_verbs: ["monitored", "diagnosed", "resolved", "escalated", "documented", "coordinated", "maintained", "configured", "triaged", "improved"],
    preferred_certs: ["ccna", "comptia network+", "itil foundation"],
    education_background_keywords: ["computer networking", "information technology", "computer science", "network engineering"],
    source: "manual_priority_addition",
  };
}

function main() {
  const positions = JSON.parse(fs.readFileSync(POSITION_SKILLS_PATH, "utf8"));
  const detailed = JSON.parse(fs.readFileSync(DETAIL_DICTIONARY_PATH, "utf8")).roles || [];
  const detailByTitle = new Map(detailed.map((role) => [normalize(role.position_title_original || role.canonical_role), role]));
  const detailByCanonical = new Map(detailed.map((role) => [normalize(role.canonical_role), role]));

  const roles = positions.map((row) => {
    const base = buildPositionRole(row);
    const detail = detailByTitle.get(normalize(row.position_title)) || detailByCanonical.get(normalize(row.position_title));
    return mergeDetailedRole(base, detail);
  });

  if (!roles.some((role) => normalize(role.position_title_original) === normalize("网络运营专员 Network Operator"))) {
    roles.push(buildNetworkOperatorRole());
  }

  roles.sort((a, b) => String(a.position_title_original).localeCompare(String(b.position_title_original)));

  const payload = {
    generated_from: [
      "data/backups/position_skills_before_az_id_reorder_2026-06-01T22-07-27-386Z.json",
      "data/ats/ats_role_dictionary.json",
    ],
    generated_at: "2026-06-04",
    role_count: roles.length,
    roles,
  };

  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`wrote ${roles.length} roles to ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main();
