"use strict";

const { buildRoleProfileFromContext } = require("./role-profile");

const NEUTRAL_TERMS = {
  skills: ["岗位核心技能", "业务理解", "交付能力"],
  tools: ["岗位工具", "常用系统", "协作工具"],
  keywords: ["岗位关键词", "职责语言", "JD 高频词"],
  deliverables: ["核心交付物", "分析结果", "项目产出"],
  projectSignals: ["相关项目", "真实经历", "任务场景"],
  metrics: ["数量", "频率", "规模", "效率"],
};

const VISIBLE_NEUTRAL_TERMS = {
  skills: ["岗位核心技能", "业务理解", "交付能力"],
  tools: ["岗位工具", "常用系统", "协作工具"],
  keywords: ["岗位关键词", "职责语言", "JD 高频词"],
  deliverables: ["核心交付物", "分析结果", "项目产出"],
  projectSignals: ["相关项目", "真实经历", "任务场景"],
  metrics: ["数量", "频率", "规模", "效率"],
};

const FAMILY_LEXICON_GUARDS = {
  accounting: {
    preferredSkills: ["general ledger", "journal entries", "account reconciliation", "month-end close", "financial statements", "GAAP"],
    preferredTools: ["Excel", "QuickBooks", "NetSuite", "SAP"],
    preferredKeywords: ["GAAP", "accounts payable", "accounts receivable", "reconciliation", "month-end close", "financial reporting"],
    preferredDeliverables: ["financial statements", "reconciliation report", "journal entry", "audit workpaper", "tax return", "month-end close checklist"],
    preferredMetrics: ["accuracy", "variance", "transaction volume", "close cycle time", "reconciliation aging"],
    forbidden: [/valuation/i, /\binvestment\b/i, /\bDCF\b/i, /\bIRR\b/i, /\bNPV\b/i, /\bAUM\b/i, /trading/i, /portfolio/i],
  },
  finance: {
    preferredSkills: ["financial modeling", "valuation", "DCF analysis", "company research", "financial statement analysis", "pitch materials"],
    preferredTools: ["Excel", "PowerPoint", "financial model", "market research database"],
    preferredKeywords: ["investment banking", "M&A", "valuation", "financial modeling", "transaction execution", "pitch deck"],
    preferredDeliverables: ["valuation model", "company profile", "pitch deck", "investment memo", "comparable company analysis"],
    preferredMetrics: ["deal size", "revenue", "EBITDA", "valuation multiple", "model accuracy"],
    forbidden: [/dispatch/i, /pickup/i, /route optimization/i, /machine learning/i, /pytorch/i, /tensorflow/i],
  },
  machine_learning: {
    forbidden: [/accounts payable/i, /accounts receivable/i, /reconciliation/i, /\bGAAP\b/i, /month-end close/i],
  },
  ai_engineer: {
    forbidden: [/accounts payable/i, /accounts receivable/i, /reconciliation/i, /\bGAAP\b/i, /month-end close/i],
  },
  marketing: {
    forbidden: [/general ledger/i, /journal entries/i, /reconciliation/i, /\bGAAP\b/i, /month-end close/i],
  },
  cloud_infrastructure: {
    preferredSkills: ["network monitoring", "incident response", "troubleshooting", "ticket handling", "TCP/IP", "DNS"],
    preferredTools: ["Zabbix", "Nagios", "Grafana", "Wireshark", "Splunk"],
    preferredKeywords: ["network operations center", "NOC", "network availability", "uptime", "latency", "packet loss"],
    preferredDeliverables: ["incident report", "network status report", "troubleshooting log", "runbook", "SLA report"],
    preferredMetrics: ["uptime", "mean time to resolution", "SLA compliance", "ticket volume", "incident count"],
    forbidden: [/general ledger/i, /journal entries/i, /\bGAAP\b/i, /campaign brief/i, /content calendar/i, /pickup/i, /dispatch/i, /route planning/i, /route optimization/i, /delivery status/i, /last-mile/i],
  },
  logistics_operations: {
    preferredSkills: ["pickup coordination", "dispatch scheduling", "delivery operations", "route optimization", "exception handling", "operations analysis"],
    preferredTools: ["Excel", "dispatch system", "tracking dashboard", "CRM", "operations report"],
    preferredKeywords: ["pickup support", "dispatch", "route planning", "delivery status", "exception handling", "last-mile operations"],
    preferredDeliverables: ["pickup schedule", "dispatch plan", "operations report", "exception log", "route optimization summary"],
    preferredMetrics: ["pickup completion rate", "on-time rate", "ticket volume", "dispatch accuracy", "cost per pickup"],
    forbidden: [/machine learning/i, /deep learning/i, /model training/i, /pytorch/i, /tensorflow/i, /classification/i, /computer vision/i, /inference/i],
  },
};

const NETWORK_OPERATIONS_GUARD = {
  preferredSkills: ["network monitoring", "incident response", "troubleshooting", "ticket handling", "TCP/IP", "DNS"],
  preferredTools: ["Zabbix", "Nagios", "Grafana", "Wireshark", "Splunk"],
  preferredKeywords: ["network operations center", "NOC", "network availability", "uptime", "latency", "packet loss", "IT infrastructure"],
  preferredDeliverables: ["incident report", "network status report", "troubleshooting log", "runbook", "SLA report"],
  preferredMetrics: ["uptime", "mean time to resolution", "SLA compliance", "ticket volume", "incident count"],
  forbidden: [/pickup/i, /dispatch/i, /route planning/i, /route optimization/i, /delivery status/i, /last-mile/i, /campaign brief/i, /content calendar/i, /general ledger/i, /\bGAAP\b/i],
};

const SLOT_DEFINITIONS = {
  positioning: {
    title: "收束目标岗位定位",
    coverageFamily: "positioning",
    actionFamily: "summary_positioning",
    targetSection: "Summary",
    defaultTags: ["weak_target_role_alignment", "weak_summary_role_alignment", "missing_exact_job_title"],
  },
  keyword_gap: {
    title: "补齐 JD 高频关键词",
    coverageFamily: "keyword",
    actionFamily: "skills_keyword_ordering",
    targetSection: "Skills",
    defaultTags: ["low_jd_keyword_match", "low_hard_skill_match", "missing_priority_keywords"],
  },
  keyword_in_experience: {
    title: "把关键词放回经历证据",
    coverageFamily: "experience_evidence",
    actionFamily: "keyword_in_experience",
    targetSection: "Experience",
    defaultTags: ["weak_experience_keyword_evidence", "keywords_only_in_skills"],
  },
  experience_evidence: {
    title: "补强经历动作和交付物",
    coverageFamily: "experience_evidence",
    actionFamily: "experience_bullet_evidence",
    targetSection: "Experience",
    defaultTags: ["weak_experience_keyword_evidence", "weak_action_verbs", "generic_experience_bullets"],
  },
  impact_metrics: {
    title: "强化 bullet 的结果表达",
    coverageFamily: "impact_metrics",
    actionFamily: "experience_impact_metrics",
    targetSection: "Experience",
    defaultTags: ["low_measurable_results", "weak_result_orientation", "low_impact_evidence"],
  },
  short_tenure_risk: {
    title: "说明短期经历性质",
    coverageFamily: "risk_explanation",
    actionFamily: "short_tenure_explanation",
    targetSection: "Experience",
    defaultTags: ["short_tenure_unclear", "short_tenure_risk", "internship_unclear"],
  },
  junior_signal: {
    title: "用课程或项目补足 junior 信号",
    coverageFamily: "junior_signal",
    actionFamily: "education_coursework_signal",
    targetSection: "Education",
    defaultTags: ["education_details_missing", "junior_signal_weak", "low_hard_skill_match"],
  },
  tool_delivery_context: {
    title: "补足岗位工具和交付语境",
    coverageFamily: "experience_evidence",
    actionFamily: "tool_delivery_context",
    targetSection: "Skills",
    defaultTags: ["weak_experience_keyword_evidence", "low_hard_skill_match", "missing_tool_context"],
  },
  section_weighting: {
    title: "调整经历篇幅权重",
    coverageFamily: "readability_structure",
    actionFamily: "section_weighting",
    targetSection: "Experience",
    defaultTags: ["weak_section_order", "weak_target_role_alignment", "low_content_quality"],
  },
};

const PROBLEM_TAG_TO_SLOT = [
  { pattern: /short.*tenure|tenure.*unclear|internship.*unclear|stability/i, slot: "short_tenure_risk" },
  { pattern: /measurable|metric|quantif|impact|result/i, slot: "impact_metrics" },
  { pattern: /education|course|certificate|junior|training/i, slot: "junior_signal" },
  { pattern: /keyword.*experience|experience.*keyword|skills?.*context|tool.*context/i, slot: "keyword_in_experience" },
  { pattern: /keyword|ats|jd.*match|hard.*skill|missing.*priority/i, slot: "keyword_gap" },
  { pattern: /summary|position|target.*role|role.*alignment|exact.*job/i, slot: "positioning" },
  { pattern: /section|readability|content.*quality|weight|order/i, slot: "section_weighting" },
  { pattern: /experience|bullet|action.*verb|evidence/i, slot: "experience_evidence" },
];

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function clean(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanVisibleFallback(value, fallback = "") {
  const text = clean(value);
  return /[ÃÂ]|æ|ç|è|å|é/.test(text) ? fallback : text;
}

function compactKey(value) {
  return clean(value).toLowerCase().replace(/[^a-z0-9+#./-]+/g, " ").trim();
}

function uniqueTerms(values, limit = 6) {
  const seen = new Set();
  const out = [];
  for (const value of asArray(values).flat(Infinity)) {
    const term = clean(value);
    const key = compactKey(term);
    if (!key || key.length < 2 || seen.has(key)) continue;
    seen.add(key);
    out.push(term);
    if (out.length >= limit) break;
  }
  return out;
}

function familyGuard(roleProfile = {}) {
  const roleText = compactKey([
    roleProfile.canonicalRole,
    roleProfile.targetRole,
    roleProfile.roleDictionaryEntry?.canonical_role,
    roleProfile.roleDictionaryEntry?.position_title_original,
  ].filter(Boolean).join(" "));
  if (/(^|\b)(network operator|network operations|noc|it infrastructure)(\b|$)/.test(roleText) || /网络运营|網絡運營|网路运营|網路運營/.test(roleText)) {
    return NETWORK_OPERATIONS_GUARD;
  }
  const family = roleProfile.canonicalRoleFamily || roleProfile.roleFamily || roleProfile.roleDictionaryEntry?.canonical_role_family || "";
  return FAMILY_LEXICON_GUARDS[family] || {};
}

function filterForbiddenTerms(values, guard = {}) {
  const forbidden = guard.forbidden || [];
  if (!forbidden.length) return asArray(values);
  return asArray(values).filter((term) => !forbidden.some((pattern) => pattern.test(clean(term))));
}

function ensureTerms(values, fallback, limit = 5) {
  const terms = uniqueTerms(values, limit);
  return terms.length ? terms : fallback.slice(0, limit);
}

function visiblePhraseList(values, fallback, limit = 4) {
  return ensureTerms(values, fallback, limit).join("、");
}

function phraseList(values, fallback, limit = 4) {
  return ensureTerms(values, fallback, limit).join("、");
}

function allRoleTerms(lexicon = {}) {
  return uniqueTerms([
    lexicon.topSkills,
    lexicon.topTools,
    lexicon.roleKeywords,
    lexicon.deliverables,
    lexicon.projectSignals,
    lexicon.metrics,
  ], 30);
}

function buildRoleLexicon(roleProfile = {}) {
  const entry = roleProfile.roleDictionaryEntry || {};
  const guard = familyGuard(roleProfile);
  const roleLabel = clean(roleProfile.canonicalRole || entry.canonical_role || roleProfile.targetRole || entry.position_title_original || "目标岗位");
  const coreSkills = [
    ...(guard.preferredSkills || []),
    ...(entry.core_skills_required || []),
    ...(entry.secondary_skills || []),
    ...(roleProfile.skillClusters || []),
  ];
  const roleKeywords = [
    ...(guard.preferredKeywords || []),
    ...(entry.domain_keywords || []),
    ...(entry.responsibility_keywords || []),
    ...(entry.core_skills_required || []),
  ];
  const deliverables = [
    ...(guard.preferredDeliverables || []),
    ...(entry.deliverables_outputs || []),
    ...(entry.experience_project_signals || []),
  ];
  const projectSignals = [
    ...(entry.experience_project_signals || []),
    ...(entry.strong_action_verbs || []),
  ];
  const metrics = [
    ...(guard.preferredMetrics || []),
    ...(entry.metrics_kpis || []),
    ...(entry.deliverables_outputs || []),
  ];
  const topSkills = ensureTerms(filterForbiddenTerms(coreSkills, guard), VISIBLE_NEUTRAL_TERMS.skills, 6);
  const topTools = ensureTerms([...(guard.preferredTools || []), ...filterForbiddenTerms(entry.tools_technologies || [], guard)], VISIBLE_NEUTRAL_TERMS.tools, 5);
  const keywordTerms = ensureTerms(filterForbiddenTerms(roleKeywords, guard), VISIBLE_NEUTRAL_TERMS.keywords, 6);
  const deliveryTerms = ensureTerms(filterForbiddenTerms(deliverables, guard), VISIBLE_NEUTRAL_TERMS.deliverables, 5);
  const signalTerms = ensureTerms(filterForbiddenTerms(projectSignals, guard), VISIBLE_NEUTRAL_TERMS.projectSignals, 5);
  const metricTerms = ensureTerms(filterForbiddenTerms(metrics, guard), VISIBLE_NEUTRAL_TERMS.metrics, 5);

  return {
    roleLabel: cleanVisibleFallback(roleLabel, "目标岗位"),
    canonicalRoleFamily: roleProfile.canonicalRoleFamily || roleProfile.roleFamily || entry.canonical_role_family || "general",
    functionCluster: roleProfile.functionCluster || "general",
    roleGroup: roleProfile.roleGroup || "general",
    topSkills,
    topTools,
    roleKeywords: keywordTerms,
    deliverables: deliveryTerms,
    projectSignals: signalTerms,
    metrics: metricTerms,
    evidenceExamples: uniqueTerms([deliveryTerms, signalTerms, metricTerms], 8),
    roleSpecificTerms: allRoleTerms({
      topSkills,
      topTools,
      roleKeywords: keywordTerms,
      deliverables: deliveryTerms,
      projectSignals: signalTerms,
      metrics: metricTerms,
    }),
  };
}

function problemTagsFromInternal(internalAtsResult = {}) {
  const buckets = [
    internalAtsResult.problemTags,
    internalAtsResult.atsProblemTags,
    internalAtsResult.resumeProblemTags,
    internalAtsResult.keyProblems,
    internalAtsResult.detectedProblems,
    internalAtsResult.obligations,
  ];
  const tags = [];
  for (const bucket of buckets) {
    for (const item of asArray(bucket)) {
      if (typeof item === "string") tags.push(item);
      else if (item && typeof item === "object") tags.push(item.tag || item.problemTag || item.problem || item.type || item.id);
    }
  }
  return uniqueTerms(tags, 60).map((tag) => compactKey(tag).replace(/\s+/g, "_"));
}

function slotForProblemTag(tag = "", coverageFamily = "") {
  const text = `${tag} ${coverageFamily}`;
  const match = PROBLEM_TAG_TO_SLOT.find((rule) => rule.pattern.test(text));
  return match ? match.slot : null;
}

function tagsMatchingSlot(problemTags = [], slotId = "") {
  return problemTags.filter((tag) => slotForProblemTag(tag) === slotId);
}

function buildEvidenceForSlot(slotId, lexicon = {}) {
  if (slotId === "impact_metrics") return ["量化结果", "成果表达", "影响规模"];
  if (slotId === "short_tenure_risk") return ["经历性质", "项目边界", "稳定性风险"];
  if (slotId === "junior_signal") return ["课程/证书", "教育训练", "岗位能力证据"];
  if (slotId === "keyword_gap") return ["JD 关键词", "ATS 匹配", "技能排序"];
  if (slotId === "positioning") return ["岗位定位", "开头主线", "目标岗位"];
  if (slotId === "tool_delivery_context") return ["岗位工具", "真实场景", "交付物"];
  if (slotId === "section_weighting") return ["信息权重", "经历排序", "可读性"];
  return ["经历证据", "推进动作", "交付物"];
}

function buildSlotCopy(slotId, lexicon = {}) {
  const role = lexicon.roleLabel || "目标岗位";
  const skills = visiblePhraseList(lexicon.topSkills, VISIBLE_NEUTRAL_TERMS.skills, 4);
  const tools = visiblePhraseList(lexicon.topTools, VISIBLE_NEUTRAL_TERMS.tools, 4);
  const keywords = visiblePhraseList(lexicon.roleKeywords, VISIBLE_NEUTRAL_TERMS.keywords, 4);
  const deliverables = visiblePhraseList(lexicon.deliverables, VISIBLE_NEUTRAL_TERMS.deliverables, 4);
  const signals = visiblePhraseList(lexicon.projectSignals, VISIBLE_NEUTRAL_TERMS.projectSignals, 3);
  const metrics = visiblePhraseList(lexicon.metrics, VISIBLE_NEUTRAL_TERMS.metrics, 4);

  const copies = {
    positioning: {
      currentDiagnosis: `简历整体对 ${role} 的主线还不够集中，ATS 和 HR 可能需要额外判断你的目标方向。`,
      action: `在 Summary 第一或第二句自然写出 ${role}，并紧接一句连接 ${skills}、${deliverables} 或最相关项目证据。`,
      mentorInsight: "岗位定位要先收束主线，让开头、技能和最靠前经历都指向同一个目标岗位。",
      hrPerspective: "我会看标题、Summary、技能排序和前几条经历是不是指向同一岗位。",
    },
    keyword_gap: {
      currentDiagnosis: `简历和 ${role} JD 的关键词连接还不够稳定，核心职责语言可能没有被 ATS 充分捕捉。`,
      action: `对照 JD 提取真实掌握的 ${keywords}，优先放入 Summary、Skills 和最相关经历，不要只堆在一个技能列表里。`,
      mentorInsight: "关键词要回到真实经历里，ATS 扫得到，HR 也能看到证据。",
      hrPerspective: "我会用 JD 高频词快速确认基本匹配；核心词缺失时，第一轮就容易显得不贴合。",
    },
    keyword_in_experience: {
      currentDiagnosis: `简历里可能列出了部分技能，但还没有充分说明这些技能如何服务 ${role} 的真实工作任务。`,
      action: `选 2-3 条经历 bullet，把 ${skills} 和 ${tools} 放进具体动作中，并说明完成了什么 ${deliverables}。`,
      mentorInsight: "技能名不要只留在 Skills；最好绑定任务、工具和交付物，才能同时服务 ATS 和人工阅读。",
      hrPerspective: "我会看技能是否出现在真实场景里。只列工具名不如说明你用它完成了什么。",
    },
    experience_evidence: {
      currentDiagnosis: `经历描述还可以更明确写出动作、方法和产出，否则读者难判断你是否具备 ${role} 的实操能力。`,
      action: `把核心 bullet 改成「任务背景 + 你的动作 + 使用的 ${tools} / ${skills} + 交付的 ${deliverables}」结构。`,
      mentorInsight: "这条要把经历讲完整，不只是参与过，而是推进了什么、怎么做、交付了什么。",
      hrPerspective: "我不会只因为写了负责或参与就加分；要看到你做了什么动作，产出了什么结果。",
    },
    impact_metrics: {
      currentDiagnosis: "经历描述里可量化结果不足，HR 很难判断你具体带来了什么影响或产出。",
      action: `为核心 bullet 补充 ${metrics}，例如处理量、频率、规模、效率、准确率、响应时间或节省成本。`,
      mentorInsight: "impact 要放到经历里，用数量、频率、规模或效率说明贡献，避免只写负责和参与。",
      hrPerspective: "经历如果只写做了什么，我很难判断你做得多深、成果多大、是否值得面试。",
    },
    short_tenure_risk: {
      currentDiagnosis: "简历中有时长较短的经历，如果不标注 Intern / Internship 或说明项目周期，HR 可能会对稳定性产生疑虑。",
      action: "如果这段经历是实习，请在 title 中明确标注 Intern / Internship；如果是项目制经历，在 bullet 中说明项目周期、职责边界和最终产出。",
      mentorInsight: "短期经历不是不能写，关键是把性质、边界和产出讲清楚。",
      hrPerspective: "我会看这条修改能不能直接降低筛选成本，而不是只让文字更好看。",
    },
    junior_signal: {
      currentDiagnosis: `教育背景、课程或项目训练还没有充分服务 ${role} 的岗位能力证明。`,
      action: `保留和 ${role} 相关的课程、证书或项目，把它们写成「学了什么 ${skills} + 做了什么 ${deliverables} + 支撑哪项岗位能力」。`,
      mentorInsight: "课程、证书或训练要写成岗位能力证据；只列课程名不够，要说明它支撑了哪项职责。",
      hrPerspective: "经验不长时，我会看训练是否补得上；相关课程别只列名字，要让我看到它和岗位的关系。",
    },
    tool_delivery_context: {
      currentDiagnosis: `简历已经有可迁移经历，但还可以更明确连接到 ${role} 常见工具、流程或交付物。`,
      action: `检查 ${role} JD 中反复出现的工具、流程和交付物，把真实掌握的 ${tools} 放回对应经历或项目，并说明完成了什么 ${deliverables}。`,
      mentorInsight: "工具名要和具体交付场景绑定，才能避免看起来像泛泛罗列。",
      hrPerspective: "我会看技能是否出现在真实场景里。只列工具名不如说明你用它完成了什么。",
    },
    section_weighting: {
      currentDiagnosis: "简历里不同经历的重要性还没有拉开，读者可能会把弱相关内容和核心经历看成同等重要。",
      action: `把最贴近 ${role} 的经历或项目放到更靠前位置，并给它多 1-2 条 bullet；弱相关经历只保留能证明 ${signals}、协作或基础职业能力的内容。`,
      mentorInsight: "完整报告里除了改关键词，也要处理信息权重。越靠前、越详细的经历，越会影响第一判断。",
      hrPerspective: "我不会平均阅读每段经历；最前面的经历如果不够相关，后面的亮点很可能来不及被看到。",
    },
  };
  return copies[slotId] || copies.experience_evidence;
}

function buildFallbackAdviceForSlot(slotId, roleLexicon = {}, obligation = {}, context = {}) {
  const slot = SLOT_DEFINITIONS[slotId] || SLOT_DEFINITIONS.experience_evidence;
  const copy = buildSlotCopy(slotId, roleLexicon);
  const roleKey = compactKey(roleLexicon.roleLabel || context.targetRole || "target").replace(/\s+/g, "_").slice(0, 40);
  const matchedTags = uniqueTerms([
    obligation.tag,
    obligation.problemTag,
    obligation.relatedProblemTags,
    slot.defaultTags,
  ], 8);
  return {
    adviceId: `rolefb_${roleKey}_${slotId}`,
    title: slot.title,
    currentDiagnosis: obligation.currentDiagnosis || obligation.problemSummary || copy.currentDiagnosis,
    problemSummary: obligation.currentDiagnosis || obligation.problemSummary || copy.currentDiagnosis,
    action: obligation.action || obligation.actionSummary || copy.action,
    actionSummary: obligation.action || obligation.actionSummary || copy.action,
    mentorInsight: obligation.mentorInsight || copy.mentorInsight,
    hrPerspective: obligation.hrPerspective || copy.hrPerspective,
    targetSection: slot.targetSection,
    coverageFamily: slot.coverageFamily,
    actionFamily: slot.actionFamily,
    actionSlot: slot.actionFamily,
    relatedProblemTags: matchedTags,
    problemTags: matchedTags,
    evidence: buildEvidenceForSlot(slotId, roleLexicon),
    source: "fallback",
    attributionMode: "mentorx_strategy",
    sourceDisclosure: "来源：MentorX 策略建议",
    displayPriority: obligation.displayPriority || context.displayPriority || 70,
    isPreviewWorthy: true,
  };
}

function slotPriority(slotId, problemTags = []) {
  const matched = tagsMatchingSlot(problemTags, slotId);
  const base = {
    impact_metrics: 95,
    positioning: 90,
    experience_evidence: 88,
    keyword_gap: 84,
    short_tenure_risk: 86,
    keyword_in_experience: 82,
    junior_signal: 76,
    tool_delivery_context: 74,
    section_weighting: 70,
  }[slotId] || 60;
  return base + matched.length * 12;
}

function buildRoleAwareFallbackAdvice({
  internalAtsResult = {},
  retrievalQuery = {},
  roleProfile = null,
  targetCount = 9,
  usedAdviceItems = [],
} = {}) {
  const profile = roleProfile || buildRoleProfileFromContext({
    internalAtsResult,
    retrievalQuery,
    targetRole: internalAtsResult.jobTitle || retrievalQuery.jobTitle || retrievalQuery.targetRole,
  });
  const roleLexicon = buildRoleLexicon(profile || {});
  const problemTags = problemTagsFromInternal(internalAtsResult);
  const usedKeys = new Set(asArray(usedAdviceItems).map((item) => compactKey(`${item.title || ""}|${item.action || item.actionSummary || ""}`)));

  const orderedSlots = Object.keys(SLOT_DEFINITIONS)
    .map((slotId) => ({
      slotId,
      priority: slotPriority(slotId, problemTags),
      matchedTags: tagsMatchingSlot(problemTags, slotId),
    }))
    .sort((a, b) => b.priority - a.priority);

  const selected = [];
  const coverageCounts = new Map();
  let keywordCount = 0;
  for (const { slotId, priority, matchedTags } of orderedSlots) {
    const item = buildFallbackAdviceForSlot(slotId, roleLexicon, {
      relatedProblemTags: matchedTags,
      displayPriority: priority,
    }, {
      targetRole: roleLexicon.roleLabel,
      displayPriority: priority,
    });
    const slot = SLOT_DEFINITIONS[slotId];
    const key = compactKey(`${item.title}|${item.action}`);
    if (usedKeys.has(key)) continue;
    const familyCount = coverageCounts.get(slot.coverageFamily) || 0;
    if (familyCount >= 2) continue;
    if (slot.coverageFamily === "keyword" && keywordCount >= 2) continue;
    selected.push(item);
    usedKeys.add(key);
    coverageCounts.set(slot.coverageFamily, familyCount + 1);
    if (slot.coverageFamily === "keyword") keywordCount += 1;
    if (selected.length >= targetCount) break;
  }

  return {
    fallbackAdviceItems: selected.slice(0, targetCount),
    fallbackCoverageSummary: {
      source: "role_aware_fallback",
      targetCount,
      generatedCount: selected.length,
      roleLabel: roleLexicon.roleLabel,
      canonicalRoleFamily: roleLexicon.canonicalRoleFamily,
      roleSpecificTerms: roleLexicon.roleSpecificTerms.slice(0, 12),
      problemTags,
      insufficientReason: selected.length < Math.min(targetCount, 7) ? "fallback_slot_pool_insufficient" : null,
    },
  };
}

module.exports = {
  SLOT_DEFINITIONS,
  buildRoleLexicon,
  buildRoleAwareFallbackAdvice,
  buildFallbackAdviceForSlot,
  slotForProblemTag,
  problemTagsFromInternal,
};
