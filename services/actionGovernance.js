"use strict";

const ACTION_SPECIFICITY = new Set(["generic", "role_specific", "jd_specific", "resume_specific", "case_specific"]);
const DISPLAY_ACTION_MODE = new Set(["raw", "grounded_raw", "generalized", "exclude"]);

function splitCsv(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  return String(value || "")
    .split(/[,;|，、\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTerm(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^\p{L}\p{N}_]+/gu, "")
    .replace(/^_+|_+$/g, "");
}

function compactText(value, max = 500) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function actionTextOf(row = {}) {
  return [row.A_action, row.action_summary, row.rawActionSummary, row.action, row.actionSummary]
    .filter(Boolean)
    .join(" ");
}

function primaryActionTextOf(row = {}) {
  return [
    row.A_action,
    row.action_summary,
    row.rawActionSummary,
    row.action,
    row.actionSummary,
  ].find((value) => String(value || "").trim()) || "";
}

function fullTextOf(row = {}) {
  return [
    row.topic, row.L1, row.L2, row.P_mentor, row.I_insight, row.HR_os, row.E_example,
    row.advice_card_title, row.user_problem_summary, row.retrieval_text,
    row.role_family, row.target_roles, actionTextOf(row),
  ].filter(Boolean).join(" ");
}

function normalizeGroundingText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function termAppearsInText(term, text) {
  const normalizedTerm = normalizeGroundingText(term);
  if (!normalizedTerm || normalizedTerm.length < 2) return true;
  const normalizedText = normalizeGroundingText(text);
  if (!normalizedText) return false;
  if (normalizedText.includes(normalizedTerm)) return true;
  const compactTerm = normalizedTerm.replace(/\s+/g, "");
  const compactHaystack = normalizedText.replace(/\s+/g, "");
  return compactTerm.length >= 3 && compactHaystack.includes(compactTerm);
}

function extractGroundingTerms(row = {}) {
  const actionText = actionTextOf(row);
  const terms = new Set(splitCsv(row.grounding_terms || row.groundingTerms));
  const add = (value) => {
    const term = String(value || "")
      .replace(/^(?:the|a|an)\s+/i, "")
      .replace(/\b(project|pipeline|section|bullet|summary|experience|skills?)\b$/i, "")
      .replace(/\s+/g, " ")
      .trim();
    if (term.length >= 3 && term.length <= 80) terms.add(term);
  };

  const projectPatterns = [
    /(?:将|把|在|从|选择|拆分|重写|改写|展开|合并)\s*([A-Z][A-Za-z0-9&/ .-]{2,70}?)(?:项目|project)/g,
    /\b([A-Z][A-Za-z0-9&/ .-]{2,70}?)\s+(?:project|pipeline)\b/gi,
  ];
  for (const pattern of projectPatterns) {
    let match;
    while ((match = pattern.exec(actionText))) add(match[1]);
  }

  const acronymAllowlist = new Set([
    "ATS", "HR", "JD", "PDF", "DOC", "DOCX", "GPA", "USA", "US", "CA", "NY",
    "BA", "BS", "MS", "MBA", "PHD", "CEO", "CFO", "API", "KPI", "OKR",
  ]);
  for (const match of actionText.matchAll(/\b[A-Z][A-Z0-9+/#.-]{1,}\b/g)) {
    const token = match[0].replace(/[.,;:!?]+$/, "");
    if (acronymAllowlist.has(token.toUpperCase())) continue;
    if (/^\d+$/.test(token)) continue;
    add(token);
  }

  const phrasePatterns = [
    /\b(compound sentiment scores?|market trends?|sentiment scores?|data acquisition|data pre[-\s]?processing|pre[-\s]?processing headlines?|article summar(?:y|ies)|trading book|limits monitoring|risk profile|control framework|regulatory compliance|internal control|process improvement|strategic planning)\b/gi,
  ];
  for (const pattern of phrasePatterns) {
    let match;
    while ((match = pattern.exec(actionText))) add(match[1]);
  }

  return [...terms];
}

function inferActivationKeywords(row = {}) {
  const existing = splitCsv(row.activation_keywords || row.activationKeywords);
  if (existing.length) return existing;
  const text = actionTextOf(row);
  const keywords = [];
  const patterns = [
    /\b(risk consulting|internal control|RCSA|control framework|governance|regulatory compliance|trading book|limits monitoring|risk profile)\b/gi,
    /\b(financial advisor|financial analyst|FA|quant|risk quant|management consulting|consulting|midterm|final)\b/gi,
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text))) keywords.push(match[1]);
  }
  return [...new Set(keywords.map((item) => item.trim()).filter(Boolean))];
}

function inferActivationRoleFamily(row = {}) {
  const existing = splitCsv(row.activation_role_family || row.activationRoleFamily);
  if (existing.length) return existing.map(normalizeTerm);
  const text = fullTextOf(row).toLowerCase();
  const pairs = [
    ["risk_consulting", /risk consulting|rcsa|internal control|control framework|regulatory compliance|risk governance/],
    ["consulting", /management consulting|consulting思维|client recommendation|客户企业|case interview/],
    ["finance", /\bfa\b|financial advisor|financial analyst|融资|盈利能力|估值|valuation/],
    ["trading_quant", /quant|risk quant|trading book|limits monitoring|sharpe ratio/],
    ["education_research", /midterm|final|课程项目|course project/],
    ["data_scientist", /nlp|vader|macd|sentiment score|statistical modeling/],
  ];
  return pairs.filter(([, pattern]) => pattern.test(text)).map(([family]) => family);
}

function inferCanonicalActionFamily(row = {}) {
  const existing = normalizeTerm(row.canonical_action_family || row.canonicalActionFamily);
  if (existing) return existing;
  const text = fullTextOf(row).toLowerCase();
  if (/summary|objective|定位|岗位原词|目标岗位|positioning|target role|exact.*title/.test(text)) return "summary_positioning";
  if (/jd|ats|keyword|关键词|技能词|hard skill|priority keyword/.test(text)) return "jd_keyword_alignment";
  if (/experience|bullet|经历|项目|证据|project/.test(text)) return "experience_evidence";
  if (/量化|quantif|result|impact|成果|metrics?|数据/.test(text)) return "quantified_impact";
  if (/skills?|技能栏|技能列表|tools?|技术栈/.test(text)) return "skills_section";
  if (/education|coursework|课程|gpa|certificate|证书|training/.test(text)) return "education_signal";
  if (/format|格式|版式|一页|日期|section|结构|排版|spacing|font/.test(text)) return "format_cleanup";
  if (/linkedin|github|portfolio|联系方式|header|link/.test(text)) return "profile_links";
  return "overall_positioning";
}

function inferActionDepth(row = {}) {
  const existing = normalizeTerm(row.action_depth || row.actionDepth);
  if (existing) return existing;
  const text = actionTextOf(row).toLowerCase();
  if (/why|原因|判断|诊断|先看|识别|确认|评估/.test(text)) return "diagnose";
  if (/改写|重写|rewrite|改成|表述为|转化为|包装|reframe/.test(text)) return "rewrite";
  if (/证据|bullet|experience|经历|项目|project|工具|方法|产出/.test(text)) return "evidence";
  if (/结构|拆分|合并|section|顺序|排序|放到|移至|版块|框架/.test(text)) return "structure";
  if (/量化|数字|结果|impact|成果|证明|proof|metrics?|提升|降低/.test(text)) return "proof";
  if (/导出|提交|pdf|link|投递|delivery|格式|文件名/.test(text)) return "delivery";
  return "rewrite";
}

function inferActionSpecificity(row = {}) {
  const existing = normalizeTerm(row.action_specificity || row.actionSpecificity);
  if (ACTION_SPECIFICITY.has(existing)) return existing;
  const text = fullTextOf(row);
  const action = actionTextOf(row);
  const grounding = extractGroundingTerms(row);
  const activation = inferActivationKeywords(row);
  const hasNamedProject = /(?:[A-Z][A-Za-z0-9&/ .-]{2,70}\s+(?:Project|Research|Pipeline)|(?:将|把|拆分|改写|重写)[A-Z][A-Za-z0-9&/ .-]{2,70}项目)/.test(action);
  const hasJdSection = /what role will you play|responsibilities section|具体职责板块|jd.*板块|职位描述.*章节/i.test(action);
  const hasCourseMoment = /midterm|final|课程项目|course project/i.test(text);
  if (hasNamedProject) return "resume_specific";
  if (hasJdSection) return "jd_specific";
  if (hasCourseMoment) return "case_specific";
  if (activation.length || inferActivationRoleFamily(row).length) return "role_specific";
  if (grounding.length >= 3) return "resume_specific";
  return "generic";
}

function buildGeneralizedAction(row = {}) {
  const existing = String(row.generalized_action || row.generalizedAction || "").trim();
  if (existing) return existing;
  const family = inferCanonicalActionFamily(row);
  const text = fullTextOf(row).toLowerCase();
  if (/risk consulting|rcsa|internal control|control framework|governance|regulatory compliance/.test(text)) {
    return "根据目标岗位重新分配简历叙事重点：弱化与岗位主线无关的技术细节，把 Experience bullet 改写为目标 JD 中的核心职责、业务流程、协作对象和结果证据。";
  }
  if (/management consulting|consulting思维|客户企业|recommendation/.test(text)) {
    return "把研究或分析类经历改写成咨询式表达：先说明业务问题，再写分析方法、给出的建议，以及这些建议如何支持客户或团队决策。";
  }
  if (/\bfa\b|financial advisor|financial analyst/.test(text)) {
    return "围绕目标金融岗位保持真实匹配，把最相关的分析、沟通、客户或报告经验写清楚，避免为了包装而夸大职责或成果。";
  }
  if (/midterm|final|课程项目|course project/.test(text)) {
    return "把近期最相关的课程、项目或训练成果整理进 Projects / Education，并优先保留能证明目标岗位能力的任务、方法和产出。";
  }
  if (/alpha research|vader|macd|nlp|sentiment/.test(text)) {
    return "选择最贴近目标岗位的一段项目经历，按「数据来源/任务背景 → 方法或工具 → 分析过程 → 结果或业务意义」重写，避免只列工具名。";
  }
  const templates = {
    summary_positioning: "先把 Summary / Objective 改成目标岗位导向：写出目标岗位原词，并用一句话连接你已有经历与 JD 的核心职责。",
    jd_keyword_alignment: "对照 JD 提取真实掌握的核心关键词，把它们分配到 Summary、Skills 和最相关的 Experience bullet 中。",
    experience_evidence: "选择最相关的经历，把 bullet 改成「动作 + 方法/工具 + 结果」结构，让关键词有真实证据支撑。",
    quantified_impact: "为核心 bullet 补充数量、频率、规模、效率或结果，让 HR 能判断你实际带来的影响。",
    skills_section: "重排 Skills，把目标 JD 最需要且你真实掌握的技能放在前面，并删除干扰岗位定位的弱相关技能。",
    education_signal: "只保留和目标岗位相关的课程、证书或训练成果，并说明它们如何支撑岗位要求。",
    format_cleanup: "统一简历格式、日期和 section 结构，优先保证 ATS 可解析、HR 可快速扫描。",
    profile_links: "在简历头部补齐可验证资料入口，并确保链接、联系方式和文件格式稳定可用。",
  };
  return templates[family] || "围绕目标岗位重新检查这条建议对应的简历部分，把最相关的职责、关键词和结果证据写得更明确。";
}

function inferDisplayActionMode(row = {}) {
  const existing = normalizeTerm(row.display_action_mode || row.displayActionMode);
  if (DISPLAY_ACTION_MODE.has(existing)) return existing;
  const specificity = inferActionSpecificity(row);
  const generalized = buildGeneralizedAction(row);
  if (specificity === "generic") return "raw";
  if (specificity === "role_specific" || specificity === "jd_specific" || specificity === "resume_specific") return "grounded_raw";
  if (specificity === "case_specific") return generalized ? "generalized" : "exclude";
  return "raw";
}

function classifyActionGovernance(row = {}) {
  const action_specificity = inferActionSpecificity(row);
  const canonical_action_family = inferCanonicalActionFamily(row);
  const action_depth = inferActionDepth(row);
  const generalized_action = buildGeneralizedAction(row);
  const activation_role_family = inferActivationRoleFamily(row).join(",");
  const activation_keywords = inferActivationKeywords(row).join(",");
  const grounding_terms = extractGroundingTerms(row).join(",");
  const display_action_mode = inferDisplayActionMode({
    ...row,
    action_specificity,
    generalized_action,
  });
  const highRisk = action_specificity !== "generic" || display_action_mode !== "raw";
  return {
    action_specificity,
    display_action_mode,
    generalized_action,
    activation_role_family,
    activation_keywords,
    grounding_terms,
    canonical_action_family,
    action_depth,
    action_review_status: highRisk ? "needs_review" : "auto_classified",
    review_reason: [
      action_specificity !== "generic" ? `specificity:${action_specificity}` : "",
      grounding_terms ? "has_grounding_terms" : "",
      activation_keywords || activation_role_family ? "has_activation_conditions" : "",
    ].filter(Boolean).join(";") || "generic_low_risk",
  };
}

function activationRoleMatches(card = {}, context = {}) {
  const required = splitCsv(card.activation_role_family || card.activationRoleFamily).map(normalizeTerm);
  if (!required.length) return true;
  const roleTerms = [
    context.roleFamily,
    context.targetRole,
    context.jobTitle,
    card.roleFamily,
    card.role_family,
  ].flatMap(splitCsv).map(normalizeTerm).filter(Boolean);
  return required.some((term) => roleTerms.includes(term) || roleTerms.some((role) => role.includes(term) || term.includes(role)));
}

function activationKeywordsMatch(card = {}, context = {}) {
  const required = splitCsv(card.activation_keywords || card.activationKeywords);
  if (!required.length) return true;
  const haystack = [context.jdText, context.targetRole, context.jobTitle, context.roleFamily].filter(Boolean).join(" ");
  return required.some((term) => termAppearsInText(term, haystack));
}

function groundingMatches(card = {}, context = {}) {
  const terms = extractGroundingTerms(card);
  if (!terms.length) return true;
  const haystack = [context.resumeText, context.jdText].filter(Boolean).join(" ");
  if (!haystack.trim()) return false;
  const missing = terms.filter((term) => !termAppearsInText(term, haystack));
  if (!missing.length) return true;
  const grounded = terms.length - missing.length;
  return grounded >= 2 && grounded / terms.length >= 0.5;
}

function ungroundedRawExampleTerms(card = {}, context = {}) {
  const rawAction = primaryActionTextOf(card);
  if (!rawAction) return [];
  const patterns = [
    ["Risk Consulting", /\brisk consulting\b/i],
    ["RCSA", /\brcsa\b/i],
    ["Financial Advisor", /\bfinancial advisor\b/i],
    ["FA", /\bFA\b/],
    ["Quant", /\bquant\b/i],
    ["Alpha Research", /\balpha research\b/i],
    ["VADER", /\bVADER\b/],
    ["MACD", /\bMACD\b/],
    ["trading book", /\btrading book\b/i],
    ["limits monitoring", /\blimits monitoring\b/i],
    ["buy side", /\bbuy side\b/i],
    ["banking", /\bbanking\b/i],
    ["insurance", /\binsurance company\b/i],
    ["realty", /\brealty\b/i],
    ["energy", /\benergy\b/i],
    ["petroleum", /\bpetroleum|oil\b/i],
    ["Marketing", /\bMarketing\b/],
    ["midterm", /\bmidterm\b/i],
    ["final", /\bfinal\b/i],
    ["GitHub", /\bGitHub\b/],
    ["green book", /\bgreen book\b/i],
    ["interview", /\binterview\b|面试/],
    ["project storyline", /完整故事线|storyline|story line|小项目合并|data-driven/i],
    ["keyword highlighting", /加粗|高亮|highlight|bold|显眼位置/],
    ["education order condition", /应届毕业生|无工作经验者|教育背景置顶|教育背景.*在后|education.*top/i],
    ["石油", /石油/],
  ];
  const haystack = [context.resumeText, context.jdText, context.targetRole, context.jobTitle, context.roleFamily]
    .filter(Boolean)
    .join(" ");
  return patterns
    .filter(([, pattern]) => pattern.test(rawAction))
    .map(([term]) => term)
    .filter((term) => !termAppearsInText(term, haystack));
}

function rawActionAllowed(card = {}, context = {}) {
  const specificity = inferActionSpecificity(card);
  const hasExplicitGrounding = splitCsv(card.grounding_terms || card.groundingTerms).length > 0;
  const needsGrounding = hasExplicitGrounding || specificity === "resume_specific" || specificity === "case_specific";
  if (ungroundedRawExampleTerms(card, context).length) return false;
  return activationRoleMatches(card, context) &&
    activationKeywordsMatch(card, context) &&
    (!needsGrounding || groundingMatches(card, context));
}

function resolveDisplayAction(card = {}, context = {}) {
  const rawAction = primaryActionTextOf(card).trim();
  const explicitGeneralized = String(card.generalized_action || card.generalizedAction || "").trim();
  const generatedGeneralized = String(buildGeneralizedAction(card) || "").trim();
  const mode = normalizeTerm(card.display_action_mode || card.displayActionMode || inferDisplayActionMode(card));
  if (mode === "exclude") return { allowed: false, action: "", usedMode: "exclude" };
  if (mode === "generalized") {
    return explicitGeneralized
      ? { allowed: true, action: explicitGeneralized, usedMode: "generalized" }
      : { allowed: false, action: "", usedMode: "exclude" };
  }
  if (mode === "grounded_raw") {
    if (rawAction && rawActionAllowed(card, context)) return { allowed: true, action: rawAction, usedMode: "raw" };
    if (explicitGeneralized) return { allowed: true, action: explicitGeneralized, usedMode: "generalized" };
    return { allowed: false, action: "", usedMode: "exclude" };
  }
  if (rawAction && rawActionAllowed(card, context)) return { allowed: true, action: rawAction, usedMode: "raw" };
  const rawFallback = explicitGeneralized || generatedGeneralized;
  return rawFallback
    ? { allowed: true, action: rawFallback, usedMode: "generalized" }
    : { allowed: false, action: "", usedMode: "exclude" };
}

module.exports = {
  ACTION_SPECIFICITY,
  DISPLAY_ACTION_MODE,
  splitCsv,
  normalizeTerm,
  compactText,
  actionTextOf,
  primaryActionTextOf,
  fullTextOf,
  normalizeGroundingText,
  termAppearsInText,
  extractGroundingTerms,
  inferActivationKeywords,
  inferActivationRoleFamily,
  inferCanonicalActionFamily,
  inferActionDepth,
  inferActionSpecificity,
  buildGeneralizedAction,
  inferDisplayActionMode,
  classifyActionGovernance,
  activationRoleMatches,
  activationKeywordsMatch,
  groundingMatches,
  ungroundedRawExampleTerms,
  rawActionAllowed,
  resolveDisplayAction,
};
