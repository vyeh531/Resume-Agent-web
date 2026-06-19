"use strict";

const DEFAULT_LOCALE = "zh-CN";
const SUPPORTED_LOCALES = new Set(["zh-CN", "en-US"]);

function normalizeLocale(value) {
  const raw = String(value || "").trim();
  if (!raw) return DEFAULT_LOCALE;
  const lower = raw.toLowerCase().replace("_", "-");
  if (lower === "en" || lower.startsWith("en-")) return "en-US";
  if (lower === "zh" || lower === "zh-cn" || lower.startsWith("zh-hans")) return "zh-CN";
  if (lower === "zh-tw" || lower === "zh-hk" || lower.startsWith("zh-hant")) return "zh-CN";
  return SUPPORTED_LOCALES.has(raw) ? raw : DEFAULT_LOCALE;
}

function isEnglishLocale(locale) {
  return normalizeLocale(locale) === "en-US";
}

function firstNonEmpty(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && String(value).trim() !== "") return value;
  }
  return "";
}

function pickLocalized(baseValue, englishValue, locale) {
  return isEnglishLocale(locale) ? firstNonEmpty(englishValue, baseValue) : firstNonEmpty(baseValue, englishValue);
}

function requestLocaleFromParts({ body, formData, request, url } = {}) {
  const headerLocale = request?.headers?.get?.("x-locale") || request?.headers?.get?.("accept-language") || "";
  return normalizeLocale(
    body?.locale ||
    formData?.get?.("locale") ||
    url?.searchParams?.get?.("locale") ||
    headerLocale
  );
}

const LABELS = {
  "zh-CN": {
    priority: { high: "必改", medium: "建议改", low: "补充" },
    keywordCategory: {
      core_skills: "核心技能",
      tools: "工具 / 技术",
      domain_keywords: "领域词",
      action_verbs: "动作词",
      nice_to_have: "加分项",
    },
    section: {
      summary: "Summary",
      skills: "Skills",
      experience: "Experience",
      projects: "Projects",
      education: "Education",
      overall: "整体简历",
    },
    whereToAddHardSkill: "Experience - first relevant role",
    whereToAddDefault: "Summary or Skills",
  },
  "en-US": {
    priority: { high: "Must fix", medium: "Recommended", low: "Bonus" },
    keywordCategory: {
      core_skills: "Core skills",
      tools: "Tools / technologies",
      domain_keywords: "Domain keywords",
      action_verbs: "Action verbs",
      nice_to_have: "Nice-to-haves",
    },
    section: {
      summary: "Summary",
      skills: "Skills",
      experience: "Experience",
      projects: "Projects",
      education: "Education",
      overall: "Overall resume",
    },
    whereToAddHardSkill: "Experience - first relevant role",
    whereToAddDefault: "Summary or Skills",
  },
};

function labelFor(locale, group, key, fallback = "") {
  const normalized = normalizeLocale(locale);
  return LABELS[normalized]?.[group]?.[key] || LABELS[DEFAULT_LOCALE]?.[group]?.[key] || fallback || key;
}

module.exports = {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  LABELS,
  normalizeLocale,
  isEnglishLocale,
  firstNonEmpty,
  pickLocalized,
  requestLocaleFromParts,
  labelFor,
};
