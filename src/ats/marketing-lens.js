"use strict";

const MARKETING_ROLE_PATTERN = /\b(marketing|marketer|growth|crm|lifecycle|brand|content|seo|sem|social media|paid search|paid social|performance marketing|product marketing|marketing analytics|campaign)\b/i;

const TOOL_GROUPS = {
  crm: ["salesforce", "hubspot", "crm"],
  automation: ["marketo", "pardot", "mailchimp", "klaviyo", "braze", "customer.io", "marketing automation"],
  analytics: ["google analytics", "ga4", "adobe analytics", "looker", "tableau", "power bi", "mixpanel", "amplitude"],
  ads: ["google ads", "meta ads", "facebook ads", "linkedin ads", "tiktok ads", "paid search", "paid social"],
  seo: ["semrush", "ahrefs", "google search console", "seo", "sem"],
  ai: ["chatgpt", "openai", "gemini", "claude", "custom gpt", "gpts", "agent"]
};

const BUSINESS_GOALS = [
  "acquisition", "engagement", "retention", "conversion", "brand awareness",
  "lead generation", "pipeline", "revenue", "roas", "cac", "ltv", "insight"
];

const CHANNEL_TERMS = [
  "email", "lifecycle", "crm", "paid search", "paid social", "seo", "sem",
  "content", "social media", "influencer", "webinar", "event", "affiliate",
  "google ads", "meta ads", "tiktok", "instagram", "linkedin"
];

const AUDIENCE_TERMS = [
  "audience", "segment", "segmentation", "customer", "user", "persona",
  "cohort", "lead", "prospect", "subscriber", "buyer", "b2b", "b2c"
];

const METRIC_TERMS = [
  "ctr", "cvr", "roas", "cac", "ltv", "cpa", "cpc", "cpm", "open rate",
  "click rate", "conversion rate", "engagement rate", "retention", "churn",
  "impressions", "reach", "traffic", "leads", "mql", "sql", "pipeline",
  "revenue", "followers", "subscribers"
];

function analyzeMarketingResume(input = {}) {
  const jobTitle = input.jobTitle || "";
  const jdText = input.jdText || "";
  const resumeText = input.resumeText || "";
  const rawBullets = input.rawBullets || [];
  const keywordProfile = input.keywordProfile || {};
  const detectedRole = input.detectedRole || {};
  const roleText = [
    jobTitle,
    jdText,
    keywordProfile.canonical_role,
    ...(keywordProfile.target_role || []),
    detectedRole.role
  ].filter(Boolean).join(" ");

  if (!MARKETING_ROLE_PATTERN.test(roleText)) {
    return inactive();
  }

  const jdLower = normalize(`${jobTitle}\n${jdText}`);
  const resumeLower = normalize(resumeText);
  const bulletsLower = normalize(rawBullets.join("\n"));
  const subtype = classifySubtype(jdLower || normalize(roleText));
  const requiredTools = collectRequiredTools(jdLower, keywordProfile);
  const missingTools = requiredTools.filter((tool) => !hasTerm(resumeLower, tool));
  const foundTools = requiredTools.filter((tool) => hasTerm(resumeLower, tool));
  const hasBusinessGoal = BUSINESS_GOALS.some((term) => hasTerm(bulletsLower || resumeLower, term));
  const hasAudience = AUDIENCE_TERMS.some((term) => hasTerm(bulletsLower, term));
  const hasChannel = CHANNEL_TERMS.some((term) => hasTerm(bulletsLower, term));
  const hasCampaign = /\bcampaign|launch|go-to-market|gtm|activation|promotion\b/i.test(bulletsLower);
  const hasMetric = hasMarketingMetric(rawBullets);
  const hasAction = /\b(launched|optimized|analyzed|managed|created|built|segmented|tested|improved|increased|reduced|grew|drove|converted)\b/i.test(bulletsLower);
  const hasSarStructure = hasAction && (hasMetric || hasBusinessGoal) && (hasAudience || hasChannel || hasCampaign);

  const tags = [];
  const problems = [];
  const suggestions = [];
  const add = (tag, problem, suggestion) => {
    tags.push(tag);
    problems.push(problem);
    suggestions.push(suggestion);
  };

  if (missingTools.length) {
    add(
      "marketing_tool_gap",
      `Marketing JD tools missing or not evidenced in resume: ${missingTools.slice(0, 4).join(", ")}.`,
      `If you have used ${missingTools.slice(0, 3).join(", ")}, add them to real Marketing bullets, not only the Skills section.`
    );
  }
  if (!hasMetric) {
    add(
      "marketing_metric_gap",
      "Marketing bullets do not show clear campaign or funnel metrics.",
      "Add Marketing metrics such as CTR, conversion rate, ROAS, retention, open rate, reach, or engagement rate where truthful."
    );
  }
  if (!(hasAudience && hasChannel && hasCampaign)) {
    add(
      "marketing_audience_channel_gap",
      "Marketing experience lacks audience, channel, or campaign context.",
      "Rewrite Marketing bullets with audience, channel, action, and measurable result."
    );
  }
  if (!hasBusinessGoal) {
    add(
      "marketing_business_goal_gap",
      "Marketing bullets do not connect work to acquisition, engagement, retention, conversion, or brand goals.",
      "Tie Marketing work to the business goal the JD cares about, such as acquisition, engagement, retention, conversion, or brand awareness."
    );
  }
  if (!hasSarStructure) {
    add(
      "marketing_experience_keyword_gap",
      "Marketing keywords are not strongly supported by Situation/Action/Result-style experience evidence.",
      "Turn generic Marketing responsibilities into SAR bullets: business context, action/tool, and result."
    );
  }

  return {
    active: true,
    subtype,
    requiredTools,
    foundTools,
    missingTools,
    tags,
    problems,
    suggestions
  };
}

function inactive() {
  return {
    active: false,
    subtype: "",
    requiredTools: [],
    foundTools: [],
    missingTools: [],
    tags: [],
    problems: [],
    suggestions: []
  };
}

function classifySubtype(text) {
  if (/\b(lifecycle|crm|email|retention|marketing automation|klaviyo|braze|marketo|mailchimp)\b/.test(text)) return "lifecycle_crm";
  if (/\b(analytics|analyst|google analytics|ga4|looker|tableau|dashboard|insight)\b/.test(text)) return "marketing_analytics";
  if (/\b(growth|performance|paid search|paid social|ppc|roas|cac|acquisition|conversion)\b/.test(text)) return "growth_performance";
  if (/\b(product marketing|pmm|go-to-market|gtm|positioning|launch messaging)\b/.test(text)) return "product_marketing";
  if (/\b(brand|content|social media|influencer|community|copywriting|seo)\b/.test(text)) return "brand_content_social";
  return "general_marketing";
}

function collectRequiredTools(jdLower, keywordProfile) {
  const candidates = new Set();
  Object.values(TOOL_GROUPS).flat().forEach((tool) => {
    if (hasTerm(jdLower, tool)) candidates.add(tool);
  });
  (keywordProfile.tools || []).forEach((tool) => {
    const clean = normalize(tool);
    if (Object.values(TOOL_GROUPS).flat().some((known) => clean === known || clean.includes(known))) {
      candidates.add(clean);
    }
  });
  return [...candidates].slice(0, 12);
}

function hasMarketingMetric(rawBullets) {
  const text = normalize(rawBullets.join("\n"));
  return METRIC_TERMS.some((term) => hasTerm(text, term)) || /\b\d+(\.\d+)?\s*%|\$\s?\d|\b\d+[kKmM]\+?\b/.test(text);
}

function hasTerm(text, term) {
  const clean = normalize(term);
  if (!clean) return false;
  if (clean.includes(" ") || clean.includes(".") || clean.includes("/")) return text.includes(clean);
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(clean)}([^a-z0-9]|$)`).test(text);
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = {
  analyzeMarketingResume
};
