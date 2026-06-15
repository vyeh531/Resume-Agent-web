"use strict";

const { buildRoleProfileFromContext } = require("../src/ats/role-profile");


function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value) {
  return String(value || "").trim();
}

function lowerText(value) {
  return normalizeText(value).toLowerCase();
}

function compactKey(value) {
  return lowerText(value).replace(/[^a-z0-9]+/g, " ").trim();
}

function isMentorXProfile(profile = {}) {
  const text = compactKey(`${profile.company || ""} ${profile.mentorName || ""} ${profile.mentorTitle || ""} ${profile.mentorSubtitle || ""}`);
  return /\bmentorx\b/.test(text);
}

function mentorGroupKey(profile = {}) {
  if (isMentorXProfile(profile)) return "mentorx";
  const company = compactKey(profile.company);
  const title = compactKey(profile.mentorTitle || profile.mentorSubtitle);
  const name = compactKey(profile.mentorName);
  if (company) return [company, title, name].filter(Boolean).join("|");
  if (profile.mentorId) return `id:${profile.mentorId}`;
  if (name) return `name:${name}`;
  return "mentorx";
}

function mentorLogoFor(profile = {}) {
  if (profile.companyLogo) return profile.companyLogo;
  if (isMentorXProfile(profile)) return "/logo/MentorX.png";
  return null;
}

function cleanMentorSource(source = {}) {
  if (!source) return null;
  const mentorName = normalizeText(source.mentorName || source.name);
  const company = normalizeText(source.company || source.mentorCompany);
  const mentorTitle = normalizeText(source.mentorTitle || source.title);
  const mentorId = source.mentorId || source.id || null;
  if (!mentorId && !mentorName && !company && !mentorTitle) return null;
  const profile = {
    mentorId,
    mentorName,
    company,
    companyLogo: source.companyLogo || null,
    mentorTitle,
    mentorSubtitle: source.mentorSubtitle || "",
  };
  return {
    ...profile,
    companyLogo: mentorLogoFor(profile) || profile.companyLogo,
  };
}

const MENTORX_SOURCE = {
  mentorId: "mentorx_strategy",
  mentorName: "MentorX",
  company: "MentorX",
  companyLogo: "/logo/MentorX.png",
  mentorTitle: "ç®€åŽ†ç­–ç•¥ç»„",
  mentorSubtitle: "ç®€åŽ†ç­–ç•¥ç»„",
};

function sameMentorSource(a = {}, b = {}) {
  const left = cleanMentorSource(a);
  const right = cleanMentorSource(b);
  if (!left || !right) return false;
  if (left.mentorId && right.mentorId && String(left.mentorId) === String(right.mentorId)) return true;
  return mentorGroupKey(left) === mentorGroupKey(right);
}

function sourceDisclosureFor(mode) {
  if (mode === "verified_original") return "æ¥æºï¼šè¯¥å¯¼å¸ˆå»ºè®®";
  if (mode === "mentorx_strategy") return "æ¥æºï¼šMentorX ç­–ç•¥å»ºè®®";
  return "æ¥æºï¼šMentorX æŒ‰è¯¥å¯¼å¸ˆèƒŒæ™¯æ•´ç†";
}

function inferAttributionMode(item = {}, originalSource = null, displayedSource = null) {
  const explicit = normalizeText(item.attributionMode);
  if (["verified_original", "stitched_lens", "mentorx_strategy"].includes(explicit)) return explicit;
  if (isMentorXProfile(displayedSource || {})) return "mentorx_strategy";
  if (originalSource && displayedSource && sameMentorSource(originalSource, displayedSource)) return "verified_original";
  return "stitched_lens";
}

function roleProfileFromContext(context = {}) {
  try {
    const taxonomyProfile = buildRoleProfileFromContext(context);
    if (taxonomyProfile && taxonomyProfile.functionCluster) return taxonomyProfile;
  } catch {
    // Fall back to the local coarse classifier below for legacy payloads.
  }
  const roleEntry = findDictionaryRoleEntry(context) || {};
  const targetText = lowerText(roleContextText(context));
  const roleFamilyText = lowerText([
    roleEntry.role_family,
    roleEntry.roleFamily,
    roleEntry.family,
    roleEntry.canonical_role,
    roleEntry.position_title_original,
    context.internalAtsResult?.profile?.roleFamily,
    context.retrievalQuery?.roleFamily,
  ].filter(Boolean).join(" "));

  let functionCluster = "general";
  if (/account|audit|tax|bookkeep|cpa|ä¼šè®¡|æœƒè¨ˆ|å®¡è®¡|å¯©è¨ˆ|ç¨ŽåŠ¡|ç¨…å‹™/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "accounting";
  } else if (/finance|financial|fp&a|valuation|treasury|investment|bank|é‡‘èž|è´¢åŠ¡|è²¡å‹™/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "finance";
  } else if (/software|developer|engineer|frontend|backend|fullstack|swe|sde|å¼€å‘|å·¥ç¨‹/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "software";
  } else if (/data|analytics|business analyst|sql|tableau|æ•°æ®|è³‡æ–™|åˆ†æž/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "data";
  } else if (/design|designer|ux|ui|portfolio|è®¾è®¡|è¨­è¨ˆ/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "design";
  } else if (/marketing|brand|growth|campaign|å¸‚åœº|ç‡ŸéŠ·|è¡ŒéŠ·/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "marketing";
  } else if (/operation|supply|logistics|procurement|è¿è¥|ç‡Ÿé‹/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "operations";
  }

  const clusterConfig = {
    accounting: {
      adjacentClusters: ["audit", "tax", "finance_operations", "compliance", "financial_reporting", "finance"],
      skillClusters: ["excel", "reconciliation", "month_end_close", "reporting", "compliance", "financial_reporting"],
      forbiddenDriftClusters: ["software", "design", "quant_trading", "investment_research"],
    },
    finance: {
      adjacentClusters: ["accounting", "audit", "finance_operations", "banking", "investment_research", "compliance"],
      skillClusters: ["financial_analysis", "excel", "reporting", "valuation", "forecasting"],
      forbiddenDriftClusters: ["software", "design"],
    },
    software: {
      adjacentClusters: ["data", "machine_learning", "product", "technical_depth"],
      skillClusters: ["programming", "api", "backend", "frontend", "deployment", "system_design"],
      forbiddenDriftClusters: ["accounting", "audit", "tax", "investment_research"],
    },
    machine_learning: {
      adjacentClusters: ["software", "data", "data_science", "ai_engineering", "technical_depth"],
      skillClusters: ["python", "machine_learning", "model_evaluation", "ml_deployment", "data", "experimentation"],
      forbiddenDriftClusters: ["accounting", "audit", "tax", "finance_operations", "investment_research", "compliance", "finance"],
    },
    data: {
      adjacentClusters: ["analytics", "business", "finance", "product", "operations"],
      skillClusters: ["sql", "tableau", "power_bi", "excel", "reporting", "analytics"],
      forbiddenDriftClusters: ["software_deep", "design"],
    },
    design: {
      adjacentClusters: ["product", "portfolio", "marketing", "creative"],
      skillClusters: ["portfolio", "figma", "visual", "ux", "user_research"],
      forbiddenDriftClusters: ["accounting", "finance", "software_deep"],
    },
    marketing: {
      adjacentClusters: ["brand", "growth", "sales", "content", "business"],
      skillClusters: ["campaign", "seo", "content", "analytics", "stakeholder"],
      forbiddenDriftClusters: ["accounting", "software_deep"],
    },
    operations: {
      adjacentClusters: ["business", "supply_chain", "finance_operations", "compliance"],
      skillClusters: ["process", "reporting", "coordination", "excel", "operations"],
      forbiddenDriftClusters: ["software_deep", "investment_research"],
    },
    general: {
      adjacentClusters: ["business", "operations", "recruiting"],
      skillClusters: ["communication", "coordination", "reporting", "stakeholder"],
      forbiddenDriftClusters: [],
    },
  };
  const config = clusterConfig[functionCluster] || clusterConfig.general;
  return {
    targetRole: context.targetRole || context.internalAtsResult?.jobTitle || "",
    canonicalRole: roleEntry.canonical_role || roleEntry.role_id || roleEntry.position_title_original || "",
    roleFamily: roleEntry.role_family || context.internalAtsResult?.profile?.roleFamily || context.retrievalQuery?.roleFamily || functionCluster,
    functionCluster,
    adjacentClusters: config.adjacentClusters,
    skillClusters: config.skillClusters,
    forbiddenDriftClusters: config.forbiddenDriftClusters,
  };
}

function clustersForText(value = "") {
  const text = lowerText(value);
  const clusters = new Set();
  const add = (cluster, pattern) => {
    if (pattern.test(text)) clusters.add(cluster);
  };
  add("accounting", /account|accountant|accounting|bookkeep|è´¦|å¸³|ä¼šè®¡|æœƒè¨ˆ/);
  add("audit", /audit|auditor|å®¡è®¡|å¯©è¨ˆ/);
  add("tax", /tax|ç¨Ž|ç¨…/);
  add("financial_reporting", /financial reporting|reporting|statement|gaap|ifrs|æŠ¥è¡¨|å ±è¡¨/);
  add("finance_operations", /finance ops|financial operations|fp&a|treasury|budget|forecast|è´¢åŠ¡|è²¡å‹™/);
  add("finance", /finance|financial|bank|ubs|barclays|blackrock|goldman|jpmorgan|é‡‘èž|é“¶è¡Œ|éŠ€è¡Œ/);
  add("investment_research", /investment|portfolio|equity|asset management|valuation|æŠ•è³‡|æŠ•èµ„/);
  add("quant_trading", /quant|trading|trader|risk quant|é‡åŒ–|äº¤æ˜“/);
  add("compliance", /compliance|control|regulatory|risk management|åˆè§„|åˆè¦|å†…æŽ§|å…§æŽ§/);
  add("software", /software|developer|engineer|frontend|backend|fullstack|api|java|python|google|amazon|aws|meta|microsoft|openai|anyscale|å¼€å‘|å·¥ç¨‹/);
  add("machine_learning", /machine learning|\bml\b|\bmle\b|deep learning|pytorch|tensorflow|model|llm|nlp|computer vision/);
  add("model_evaluation", /evaluation|accuracy|precision|recall|f1|auc|metric/);
  add("ml_deployment", /deployment|serving|pipeline|mlops|cloud|docker|api/);
  add("software_deep", /system design|architecture|distributed|deployment|kubernetes|microservice/);
  add("data", /data|analytics|sql|tableau|power bi|dashboard|æ•°æ®|è³‡æ–™|åˆ†æž/);
  add("design", /design|designer|ux|ui|figma|architecture designer|architect|è®¾è®¡|è¨­è¨ˆ/);
  add("portfolio", /portfolio|ä½œå“é›†/);
  add("marketing", /marketing|brand|growth|campaign|seo|content|å¸‚åœº|è¡Œé”€|ç‡ŸéŠ·/);
  add("operations", /operation|supply chain|logistics|procurement|è¿è¥|ç‡Ÿé‹/);
  add("business", /business|stakeholder|cross-functional|communication|collaboration|ä¸šåŠ¡|å•†æ¥­|åä½œ|å”ä½œ/);
  add("excel", /excel|spreadsheet|pivot|vlookup/);
  add("reconciliation", /reconciliation|reconcile|å¯¹è´¦|å°å¸³/);
  add("month_end_close", /month[-\s]?end|close process|ç»“è´¦|çµå¸³/);
  return [...clusters];
}

function inferMentorClusters(profile = {}) {
  const text = [
    profile.company,
    profile.mentorTitle,
    profile.mentorSubtitle,
    profile.mentorName,
    profile.careerPathDisplay,
    ...(profile.badges || []),
  ].filter(Boolean).join(" ");
  return clustersForText(text);
}

function inferAdviceSkillClusters(item = {}) {
  return clustersForText(adviceText(item));
}

function buildMentorPool(mentors = [], items = []) {
  const byKey = new Map();
  const add = (source = {}) => {
    const clean = cleanMentorSource(source);
    if (!clean) return;
    const key = mentorGroupKey(clean);
    if (!byKey.has(key)) {
      byKey.set(key, {
        ...clean,
        mentorRoleCluster: "",
        mentorSkillClusters: inferMentorClusters(source),
      });
    } else {
      const existing = byKey.get(key);
      existing.mentorSkillClusters = unique([...existing.mentorSkillClusters, ...inferMentorClusters(source)]);
      if (!existing.companyLogo && source.companyLogo) existing.companyLogo = source.companyLogo;
    }
  };
  asArray(mentors).forEach(add);
  asArray(items).forEach((item) => {
    add(item._mentor || {});
    add(item.mentorSource || {});
    add(item.originalMentorSource || {});
    add(item.displayedMentorSource || {});
  });
  add(MENTORX_SOURCE);
  return [...byKey.values()];
}

function problemLensAllowsMentor(item = {}, mentorClusters = []) {
  const clusters = new Set(mentorClusters);
  if (isMentorXProfile(item.mentorSource || {})) return true;
  if (item.coverageFamily === "risk_explanation") return clusters.has("design") || clusters.has("operations") || clusters.has("business") || clusters.has("finance");
  if (item.coverageFamily === "cross_domain_transfer") return clusters.has("design") || clusters.has("business") || clusters.has("operations") || clusters.has("finance");
  if (item.coverageFamily === "readability_structure") return clusters.has("design") || clusters.has("business") || clusters.has("operations");
  if (item.coverageFamily === "impact_metrics") return clusters.has("finance") || clusters.has("data") || clusters.has("business") || clusters.has("operations");
  if (item.coverageFamily === "experience_evidence") return clusters.has("business") || clusters.has("operations") || clusters.has("data") || clusters.has("finance");
  return false;
}

function scoreMentorDisplayFit(item = {}, mentor = {}, context = {}, originalSource = null) {
  if (isMentorXProfile(mentor)) {
    return {
      mentor,
      score: 35,
      fit: "mentorx_strategy",
      reason: "No sufficiently explainable external mentor lens was found; MentorX strategy fallback is used.",
    };
  }
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const mentorClusters = inferMentorClusters(mentor);
  const adviceClusters = inferAdviceSkillClusters(item);
  const mentorClusterSet = new Set(mentorClusters);
  const adviceClusterSet = new Set(adviceClusters);
  let score = 0;
  let fit = "problem_lens";
  const reasons = [];

  if (mentorClusterSet.has(roleProfile.functionCluster)) {
    score += 35;
    fit = "direct";
    reasons.push("same function cluster");
  }
  const adjacentHits = roleProfile.adjacentClusters.filter((cluster) => mentorClusterSet.has(cluster));
  if (adjacentHits.length) {
    score += 28;
    if (fit !== "direct") fit = "adjacent";
    reasons.push(`adjacent cluster: ${adjacentHits[0]}`);
  }
  const skillHits = roleProfile.skillClusters.filter((cluster) => mentorClusterSet.has(cluster) || adviceClusterSet.has(cluster));
  if (skillHits.length) {
    score += Math.min(20, skillHits.length * 7);
    reasons.push(`skill cluster: ${skillHits[0]}`);
  }
  if (problemLensAllowsMentor(item, mentorClusters)) {
    score += 20;
    if (fit !== "direct" && fit !== "adjacent") fit = "problem_lens";
    reasons.push("problem lens fit");
  }
  if (/(ubs|barclays|blackrock|goldman|jpmorgan|bank|finance|financial)/i.test(`${mentor.company || ""} ${mentor.mentorTitle || ""}`)) {
    score += roleProfile.functionCluster === "accounting" || roleProfile.functionCluster === "finance" ? 10 : 0;
  }
  if (sameMentorSource(originalSource, mentor)) {
    score += 10;
    reasons.push("same original source");
  }

  const forbiddenHits = roleProfile.forbiddenDriftClusters.filter((cluster) => mentorClusterSet.has(cluster));
  if (forbiddenHits.length) {
    score -= 40;
    if (fit === "direct" || fit === "adjacent") fit = "problem_lens";
    reasons.push(`role drift: ${forbiddenHits[0]}`);
  }
  if (score < 30 && !problemLensAllowsMentor(item, mentorClusters)) {
    score -= 30;
    reasons.push("unexplainable mentor");
  }
  return {
    mentor,
    score,
    fit,
    reason: reasons.join("; ") || "general resume lens",
  };
}

function selectDisplayedMentorForAdvice(item = {}, mentorPool = [], context = {}, originalSource = null) {
  if (isMentorXProfile(originalSource || {})) {
    return {
      displayedMentorSource: cleanMentorSource(originalSource) || cleanMentorSource(MENTORX_SOURCE),
      mentorDisplayFit: "mentorx_strategy",
      mentorFitReason: "Original advice is a MentorX strategy fallback.",
      displayMentorScore: 35,
    };
  }
  const candidates = asArray(mentorPool).length ? mentorPool : [originalSource, MENTORX_SOURCE].filter(Boolean);
  const scored = candidates
    .map((mentor) => scoreMentorDisplayFit(item, mentor, context, originalSource))
    .sort((a, b) => b.score - a.score || (sameMentorSource(a.mentor, originalSource) ? -1 : 1));
  const best = scored[0];
  if (!best || best.score < 35 || isMentorXProfile(best.mentor)) {
    return {
      displayedMentorSource: cleanMentorSource(MENTORX_SOURCE),
      mentorDisplayFit: "mentorx_strategy",
      mentorFitReason: "No sufficiently explainable external mentor lens was found.",
      displayMentorScore: best ? Math.round(best.score) : 0,
    };
  }
  return {
    displayedMentorSource: cleanMentorSource(best.mentor),
    mentorDisplayFit: best.fit,
    mentorFitReason: best.reason,
    displayMentorScore: Math.round(best.score),
  };
}

function unique(items) {
  return [...new Set(asArray(items).filter(Boolean))];
}

let cachedRoleDirectionEntries = null;

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeRoleDirectionAlias(value) {
  return lowerText(value)
    .replace(/[^a-z0-9+#.\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function loadRoleDictionaryRoles() {
  try {
    return require("../public/ats_role_dictionary.json").roles || [];
  } catch {
    try {
      return require("../data/ats/ats_role_dictionary.json").roles || [];
    } catch {
      return [];
    }
  }
}

function roleAliasesFor(role = {}) {
  const aliases = [
    role.canonical_role,
    role.position_title_original,
    ...(role.target_role_aliases || []),
  ].filter(Boolean);
  const normalized = unique(aliases.map(normalizeRoleDirectionAlias))
    .filter((alias) => alias.length >= 3 && !/^(role|position|job|intern|business|finance|data|design|marketing)$/.test(alias));
  const acronyms = [];
  for (const alias of normalized) {
    const words = alias.split(/\s+/).filter((word) => /^[a-z][a-z0-9+#.-]*$/.test(word));
    if (words.length >= 2 && words.length <= 4) {
      const acronym = words.map((word) => word[0]).join("");
      if (acronym.length >= 2 && acronym.length <= 4) acronyms.push(acronym);
    }
  }
  return unique([...normalized, ...acronyms]);
}

function getRoleDirectionEntries() {
  if (cachedRoleDirectionEntries) return cachedRoleDirectionEntries;
  cachedRoleDirectionEntries = loadRoleDictionaryRoles()
    .map((role) => ({
      role,
      roleId: role.role_id || role.canonical_role || role.position_title_original,
      aliases: roleAliasesFor(role),
    }))
    .filter((entry) => entry.aliases.length)
    .map((entry) => ({
      ...entry,
      directionPatterns: entry.aliases.map((alias) => {
        const escaped = escapeRegExp(alias).replace(/\s+/g, "\\s+");
        return new RegExp(`\\b${escaped}\\b\\s*(?:å²—ä½|å²—|æ–¹å‘|èŒä½|è·ä½|role|roles|position|positions|track|direction|job|jobs|jd)s?`, "ig");
      }),
    }))
    .sort((a, b) => Math.max(...b.aliases.map((x) => x.length)) - Math.max(...a.aliases.map((x) => x.length)));
  return cachedRoleDirectionEntries;
}

function findDictionaryRoleEntry(context = {}) {
  const target = [
    context.targetRole,
    context.internalAtsResult?.jobTitle,
    context.internalAtsResult?.profile?.targetRole,
    context.retrievalQuery?.targetRole,
  ].filter(Boolean).join(" ");
  const jdText = [
    context.internalAtsResult?.jdText,
    context.retrievalQuery?.queryText,
  ].filter(Boolean).join(" ");
  try {
    const { findRoleDictionaryEntry } = require("../src/ats/role-dictionary");
    return findRoleDictionaryEntry(target, jdText);
  } catch {
    const targetText = normalizeRoleDirectionAlias(`${target} ${jdText}`).slice(0, 5000);
    let best = null;
    let bestScore = 0;
    for (const entry of getRoleDirectionEntries()) {
      let score = 0;
      for (const alias of entry.aliases) {
        if (targetText.includes(alias)) score += 8 + alias.split(/\s+/).length;
      }
      if (score > bestScore) {
        best = entry.role;
        bestScore = score;
      }
    }
    return bestScore >= 3 ? best : null;
  }
}

function adviceText(item = {}) {
  return [
    item.title,
    item.currentDiagnosis,
    item.problemSummary,
    item.action,
    item.actionSummary,
    item.mentorInsight,
    item.mentorLens,
    item.reason,
    item.topicCluster,
    item.displayAdviceType,
    item.canonicalActionFamily,
    item.targetSection,
    ...asArray(item.relatedProblemTags),
  ].filter(Boolean).join(" ");
}
function priorityRank(value) {
  const text = lowerText(value);
  if (text === "critical" || text === "high" || text === "p0" || text.includes("å¿…")) return 0;
  if (text === "medium" || text === "mid" || text === "p1" || text.includes("å»ºè®®")) return 1;
  return 2;
}

function severityRank(value) {
  const text = lowerText(value);
  if (text === "critical") return 0;
  if (text === "high") return 1;
  if (text === "medium") return 2;
  if (text === "low") return 3;
  return 4;
}

function hasProblemTag(context = {}, pattern) {
  return asArray(context.problemTags).some((item) => pattern.test(item.tag || item));
}

function isKeywordCritical(context = {}) {
  return asArray(context.problemTags).some((item) =>
    /keyword|hard_skill|priority/.test(item.tag || item) &&
    ["critical", "high"].includes(item.severity)
  );
}

function targetRoleAllowsFinance(context = {}) {
  const text = [
    context.targetRole,
    context.internalAtsResult?.jobTitle,
    context.internalAtsResult?.profile?.targetRole,
    context.internalAtsResult?.profile?.roleFamily,
    context.internalAtsResult?.jdText,
    context.retrievalQuery?.queryText,
    context.retrievalQuery?.targetRole,
    context.retrievalQuery?.roleFamily,
  ].filter(Boolean).join(" ");
  return /finance|financial|quant|trading|investment|bank|fintech|risk|portfolio|asset|equity|é‡‘èž|é‡åŒ–|æŠ•è³‡|æŠ•èµ„|é“¶è¡Œ/i.test(text);
}

function targetRoleAllowsRiskOrFinanceDirection(context = {}) {
  const text = [
    context.targetRole,
    context.internalAtsResult?.jobTitle,
    context.internalAtsResult?.profile?.targetRole,
    context.internalAtsResult?.profile?.roleFamily,
    context.retrievalQuery?.targetRole,
    context.retrievalQuery?.roleFamily,
  ].filter(Boolean).join(" ");
  return /finance|financial|quant|trading|investment|bank|fintech|risk|portfolio|asset|equity|é‡‘èž|é‡åŒ–|æŠ•è³‡|æŠ•èµ„|é“¶è¡Œ|é£ŽæŽ§|é¢¨æŽ§/i.test(text);
}

const ROLE_DIRECTION_GUARDS = [
  {
    family: "finance",
    allow: /finance|financial|quant|trading|investment|bank|fintech|risk|portfolio|asset|equity|wealth|é‡‘èž|é‡åŒ–|æŠ•è³‡|æŠ•èµ„|é“¶è¡Œ|é¢¨æŽ§|é£ŽæŽ§/i,
    replacements: [
      [/é’ˆå¯¹\s*risk\s*(?:å’Œ|\/|&|ã€|and)\s*finance\s*æ–¹å‘/ig, "é’ˆå¯¹_TARGET_æ–¹å‘"],
      [/risk\s*(?:å’Œ|\/|&|ã€|and)\s*finance\s*æ–¹å‘/ig, "_TARGET_æ–¹å‘"],
      [/(?:ç›®æ ‡)?(?:é‡‘èž|é‡åŒ–|æŠ•è¡Œ|æŠ•èµ„|æŠ•è³‡|é“¶è¡Œ|é¢¨æŽ§|é£ŽæŽ§)(?:ç›¸å…³)?(?:å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD|åœºæ™¯|ææ–™)/g, "_TARGET_æ–¹å‘"],
      [/(?:finance|financial|quant|risk|investment banking|banking|portfolio|asset management)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "accounting",
    allow: /accounting|accountant|audit|tax|cpa|bookkeep|ä¼šè®¡|æœƒè¨ˆ|å®¡è®¡|å¯©è¨ˆ|ç¨ŽåŠ¡|ç¨…å‹™|è´¢åŠ¡æŠ¥è¡¨|è²¡å‹™å ±è¡¨/i,
    replacements: [
      [/(?:ä¼šè®¡|æœƒè¨ˆ|å®¡è®¡|å¯©è¨ˆ|ç¨ŽåŠ¡|ç¨…å‹™|è´¢åŠ¡æŠ¥è¡¨|è²¡å‹™å ±è¡¨)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:accounting|accountant|audit|tax|cpa|bookkeeping)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "data",
    allow: /data analyst|business analyst|data science|data scientist|analytics|bi\b|sql|tableau|power\s*bi|æ•°æ®|æ•¸æ“š|è³‡æ–™|åˆ†æžå¸ˆ|åˆ†æžå¸«|å•†ä¸šåˆ†æž|å•†æ¥­åˆ†æž|æ•°æ®ç§‘å­¦|è³‡æ–™ç§‘å­¸/i,
    replacements: [
      [/\b(?:DA|BA)\s*(?:å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/ig, "_TARGET_æ–¹å‘"],
      [/(?:æ•°æ®åˆ†æž|æ•¸æ“šåˆ†æž|è³‡æ–™åˆ†æž|å•†ä¸šåˆ†æž|å•†æ¥­åˆ†æž|æ•°æ®ç§‘å­¦|è³‡æ–™ç§‘å­¸)(?:å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:data analyst|business analyst|data science|data scientist|analytics)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "software",
    allow: /software|swe|sde|developer|engineer|frontend|backend|full[-\s]?stack|java|python|api|å·¥ç¨‹|å¼€å‘|é–‹ç™¼|ç¨‹åº|ç¨‹å¼|è½¯ä»¶|è»Ÿé«”/i,
    replacements: [
      [/(?:è½¯ä»¶|è»Ÿé«”|å¼€å‘|é–‹ç™¼|å·¥ç¨‹å¸ˆ|å·¥ç¨‹å¸«)(?:å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:software engineer|swe|sde|developer|frontend|backend|full[-\s]?stack)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "marketing",
    allow: /marketing|brand|growth|content|campaign|seo|social media|å¸‚åœº|å¸‚å ´|è¥é”€|è¡ŒéŠ·|å“ç‰Œ|å¢žé•¿|å¢žé•·|å†…å®¹|å…§å®¹|æŠ•æ”¾/i,
    replacements: [
      [/(?:Marketing|å¸‚åœº|å¸‚å ´|è¥é”€|è¡ŒéŠ·|å“ç‰Œ|å¢žé•¿|å¢žé•·|å†…å®¹|å…§å®¹)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:marketing|brand|growth|content|campaign|seo|social media)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "design",
    allow: /design|designer|ux|ui|product design|portfolio|figma|visual|è®¾è®¡|è¨­è¨ˆ|ä½œå“é›†|äº¤äº’|è§†è§‰|è¦–è¦º/i,
    replacements: [
      [/(?:è®¾è®¡|è¨­è¨ˆ|UX|UI|è§†è§‰|è¦–è¦º)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:design|designer|ux|ui|product design|visual design)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "product",
    allow: /product manager|\bpm\b|product owner|äº§å“|ç”¢å“|äº§å“ç»ç†|ç”¢å“ç¶“ç†/i,
    replacements: [
      [/(?:äº§å“|ç”¢å“|äº§å“ç»ç†|ç”¢å“ç¶“ç†)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:product manager|product owner|pm)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "legal",
    allow: /legal|law|paralegal|attorney|å¾‹å¸ˆ|å¾‹å¸«|æ³•å¾‹|æ³•åŠ¡|æ³•å‹™/i,
    replacements: [
      [/(?:æ³•å¾‹|æ³•åŠ¡|æ³•å‹™|å¾‹å¸ˆ|å¾‹å¸«)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:legal|law|paralegal|attorney)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "operations",
    allow: /operations|supply chain|logistics|procurement|è¿è¥|ç‡Ÿé‹|ä¾›åº”é“¾|ä¾›æ‡‰éˆ|ç‰©æµ|é‡‡è´­|æŽ¡è³¼/i,
    replacements: [
      [/(?:è¿è¥|ç‡Ÿé‹|ä¾›åº”é“¾|ä¾›æ‡‰éˆ|ç‰©æµ|é‡‡è´­|æŽ¡è³¼)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:operations|supply chain|logistics|procurement)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
];

function roleContextText(context = {}) {
  return [
    context.targetRole,
    context.internalAtsResult?.jobTitle,
    context.internalAtsResult?.profile?.targetRole,
    context.internalAtsResult?.profile?.roleFamily,
    context.internalAtsResult?.jdText,
    context.retrievalQuery?.queryText,
    context.retrievalQuery?.targetRole,
    context.retrievalQuery?.roleFamily,
  ].filter(Boolean).join(" ");
}

function targetRoleSupportsFamily(context = {}, spec = {}) {
  return spec.allow.test(roleContextText(context));
}

function supportedDictionaryRoleIds(context = {}) {
  const targetRole = findDictionaryRoleEntry(context);
  if (!targetRole) return new Set();
  const targetAliases = new Set(roleAliasesFor(targetRole));
  const ids = new Set([targetRole.role_id || targetRole.canonical_role || targetRole.position_title_original]);
  for (const entry of getRoleDirectionEntries()) {
    if (entry.roleId === (targetRole.role_id || targetRole.canonical_role || targetRole.position_title_original)) {
      ids.add(entry.roleId);
      continue;
    }
    if (entry.aliases.some((alias) => targetAliases.has(alias))) ids.add(entry.roleId);
  }
  return ids;
}

function roleDirectionReplacement(match, target) {
  return /å²—ä½|å²—|æ–¹å‘|èŒä½|è·ä½/.test(match) ? `${target}æ–¹å‘` : `${target} direction`;
}

function sanitizeDictionaryRoleDirections(text, context = {}, target = "ç›®æ ‡å²—ä½") {
  const supportedIds = supportedDictionaryRoleIds(context);
  if (!supportedIds.size) return text;

  let output = text;
  for (const entry of getRoleDirectionEntries()) {
    if (supportedIds.has(entry.roleId)) continue;
    for (const pattern of entry.directionPatterns) {
      output = output.replace(pattern, (match) => roleDirectionReplacement(match, target));
    }
  }
  return output;
}

function sanitizeUnsupportedRoleDirections(text, context = {}, target = "ç›®æ ‡å²—ä½") {
  let output = sanitizeDictionaryRoleDirections(text, context, target);
  for (const spec of ROLE_DIRECTION_GUARDS) {
    if (targetRoleSupportsFamily(context, spec)) continue;
    for (const [pattern, replacement] of spec.replacements) {
      output = output.replace(pattern, replacement.replace(/_TARGET_/g, target));
    }
  }
  return output;
}

function sanitizeRoleMixedText(value, context = {}) {
  const text = normalizeText(value);
  if (!text) return text;
  const target = normalizeText(context.targetRole || context.internalAtsResult?.jobTitle || "ç›®æ ‡å²—ä½");
  let output = sanitizeUnsupportedRoleDirections(text, context, target);
  if (!targetRoleAllowsRiskOrFinanceDirection(context)) {
    output = output
      .replace(/é’ˆå¯¹\s*risk\s*(?:å’Œ|\/|&|ã€)\s*finance\s*æ–¹å‘/ig, `é’ˆå¯¹ ${target} æ–¹å‘`)
      .replace(/risk\s*(?:å’Œ|\/|&|ã€)\s*finance\s*æ–¹å‘/ig, `${target} æ–¹å‘`)
      .replace(/risk\s*æ–¹å‘/ig, `${target} æ–¹å‘`)
      .replace(/é£ŽæŽ§æ–¹å‘/g, `${target} æ–¹å‘`)
      .replace(/é¢¨æŽ§æ–¹å‘/g, `${target} æ–¹å‘`);
  }
  if (targetRoleAllowsFinance(context)) return output;
  if (!/software|swe|sde|developer|engineer|å·¥ç¨‹|å¼€å‘/i.test(target)) return output;
  return output
    .replace(/ç›®æ ‡é‡‘èžå²—ä½/g, `ç›®æ ‡ ${target} å²—ä½`)
    .replace(/é‡‘èžå²—ä½/g, `${target} å²—ä½`)
    .replace(/é‡‘èžç›¸å…³ææ–™/g, "ç›¸å…³ææ–™")
    .replace(/é‡‘èžåœºæ™¯/g, "ä¸šåŠ¡åœºæ™¯");
}

function evidenceMatchesCoverage(evidence = [], coverageFamily = "") {
  const text = lowerText(asArray(evidence).join(" "));
  if (!text) return false;
  const exactDefaults = new Map([
    ["keyword", defaultEvidenceForCoverage("keyword", "skills").join(" ")],
    ["positioning", defaultEvidenceForCoverage("positioning").join(" ")],
    ["experience_evidence", defaultEvidenceForCoverage("experience_evidence").join(" ")],
    ["impact_metrics", defaultEvidenceForCoverage("impact_metrics").join(" ")],
    ["risk_explanation", defaultEvidenceForCoverage("risk_explanation").join(" ")],
    ["junior_signal", defaultEvidenceForCoverage("junior_signal").join(" ")],
  ]);
  for (const [family, defaultText] of exactDefaults.entries()) {
    if (family !== coverageFamily && text === lowerText(defaultText)) return false;
  }
  if (coverageFamily !== "risk_explanation" && /ç¨³å®šæ€§é£Žé™©|ç»åŽ†æ€§è´¨|é¡¹ç›®è¾¹ç•Œ|short tenure|internship period/i.test(text)) return false;
  if (coverageFamily !== "experience_evidence" && /æŽ¨è¿›åŠ¨ä½œ|äº¤ä»˜ç‰©|collaboration delivery/i.test(text)) return false;
  if (coverageFamily === "keyword") return /keyword|jd|ats|å…³é”®è¯|åŒ¹é…|æŠ€èƒ½/.test(text);
  if (coverageFamily === "positioning") return /position|summary|target|å²—ä½|å®šä½|å¼€å¤´|ä¸»çº¿/.test(text);
  if (coverageFamily === "experience_evidence") return /experience|bullet|project|collaboration|ç»åŽ†|é¡¹ç›®|è¯æ®|åä½œ|äº¤ä»˜/.test(text);
  if (coverageFamily === "impact_metrics") return /impact|metric|result|quant|æˆæžœ|é‡åŒ–|ç»“æžœ|è§„æ¨¡|æ•ˆçŽ‡/.test(text);
  if (coverageFamily === "risk_explanation") return /risk|short|intern|tenure|çŸ­æœŸ|å®žä¹ |å‘¨æœŸ|è¾¹ç•Œ|é£Žé™©/.test(text);
  if (coverageFamily === "junior_signal") return /education|course|certificate|æ•™è‚²|è¯¾ç¨‹|è¯ä¹¦|è®­ç»ƒ/.test(text);
  return true;
}

function defaultEvidenceForCoverage(coverageFamily = "", targetSection = "") {
  if (coverageFamily === "keyword") return ["JD å…³é”®è¯", "ATS åŒ¹é…", targetSection === "skills" ? "Skills æŽ’åº" : "ç»åŽ†è¯æ®"];
  if (coverageFamily === "positioning") return ["å²—ä½å®šä½", "å¼€å¤´ä¸»çº¿", "ç›®æ ‡å²—ä½"];
  if (coverageFamily === "experience_evidence") return ["ç»åŽ†è¯æ®", "æŽ¨è¿›åŠ¨ä½œ", "äº¤ä»˜ç‰©"];
  if (coverageFamily === "impact_metrics") return ["é‡åŒ–ç»“æžœ", "æˆæžœè¡¨è¾¾", "å½±å“è§„æ¨¡"];
  if (coverageFamily === "risk_explanation") return ["ç»åŽ†æ€§è´¨", "é¡¹ç›®è¾¹ç•Œ", "ç¨³å®šæ€§é£Žé™©"];
  if (coverageFamily === "junior_signal") return ["è¯¾ç¨‹/è¯ä¹¦", "æ•™è‚²è®­ç»ƒ", "å²—ä½èƒ½åŠ›è¯æ®"];
  if (coverageFamily === "cross_domain_transfer") return ["å¯è¿ç§»èƒ½åŠ›", "è·¨é¢†åŸŸè¡¨è¾¾", "ç›®æ ‡å²—ä½è¯­è¨€"];
  return [];
}

function inferActionFamily(item = {}) {
  const native = normalizeText(item.actionFamily || item.canonicalActionFamily);
  const allText = lowerText(adviceText(item));
  if (native) {
    if (/short tenure|internship|intern|contract|gap|çŸ­æœŸ|å®žä¹ |å¯¦ç¿’|é¡¹ç›®å‘¨æœŸ|é …ç›®é€±æœŸ|æ—¶é•¿|æ™‚é•·|ç¨³å®šæ€§é£Žé™©|ç©©å®šæ€§é¢¨éšª/.test(allText)) {
      return "risk_explanation";
    }
    if (/education|coursework|gpa|certificate|è¯¾ç¨‹|èª²ç¨‹|è¯ä¹¦|è­‰æ›¸|æ•™è‚²/.test(allText)) {
      return "education_signal";
    }
    if (/impact metrics|metric|quantif|measurable|æˆæžœé‡åŒ–|é‡åŒ–|æ•°å­—|æ•¸å­—|ä¸šåŠ¡ä»·å€¼|æ¥­å‹™åƒ¹å€¼/.test(allText)) {
      return "impact_metrics";
    }
    return native;
  }
  const visibleText = lowerText([
    item.title,
    item.currentDiagnosis,
    item.problemSummary,
    item.action,
    item.actionSummary,
    item.mentorInsight,
    item.mentorLens,
    item.reason,
    item.topicCluster,
    item.displayAdviceType,
    item.targetSection,
  ].filter(Boolean).join(" "));
  const tagText = lowerText(asArray(item.relatedProblemTags).join(" "));
  if (/weak_experience_keyword_evidence/.test(tagText) && !/keyword|jd|ats|hard skill|å…³é”®è¯|æŠ€èƒ½è¯/.test(visibleText)) {
    return "experience_evidence";
  }
  const text = allText;
  if (/missing_summary|add\s+(?:a\s+)?summary|æ–°å¢ž.*summary|è¡¥.*summary/.test(text)) return "summary_creation";
  if (/summary|headline|target role|job title|å²—ä½åŽŸè¯|å®šä½|å¼€å¤´/.test(text)) return "summary_positioning";
  if (/keyword|jd|ats|hard skill|å…³é”®è¯|æŠ€èƒ½è¯/.test(text) && /experience|bullet|ç»åŽ†|é¡¹ç›®/.test(text)) return "keyword_in_experience";
  if (/keyword|jd|ats|hard skill|å…³é”®è¯|æŠ€èƒ½è¯/.test(text) && /skills?|æŠ€èƒ½åŒº|æŠ€èƒ½æ /.test(text)) return "skills_keyword_ordering";
  if (/keyword|jd|ats|hard skill|å…³é”®è¯|æŠ€èƒ½è¯/.test(text)) return "jd_keyword_alignment";
  if (/short tenure|internship|intern|contract|gap|çŸ­æœŸ|å®žä¹ |é¡¹ç›®å‘¨æœŸ|æ—¶é•¿/.test(text)) return "risk_explanation";
  if (/education|coursework|gpa|certificate|è¯¾ç¨‹|è¯ä¹¦|æ•™è‚²/.test(text)) return "education_signal";
  if (/impact|metric|quantif|result|æˆæžœ|é‡åŒ–|æ•°å­—|ä¸šåŠ¡ä»·å€¼/.test(text)) return "impact_metrics";
  if (/system design|architecture|deployment|engineering|æŠ€æœ¯æ·±åº¦|ç³»ç»Ÿ|æž¶æž„|éƒ¨ç½²|å·¥ç¨‹åŒ–/.test(text)) return "technical_depth";
  if (/cross[-\s]?domain|transferable|reframing|è·¨é¢†åŸŸ|è¿ç§»|è½¬åŒ–/.test(text)) return "cross_domain_reframing";
  if (/section|format|readability|layout|æŽ’åº|ç‰ˆé¢|å¯è¯»|æ ¼å¼/.test(text)) return "section_relevance_order";
  if (/experience|bullet|project|evidence|ç»åŽ†|é¡¹ç›®|è¯æ®/.test(text)) return "experience_evidence";
  return "general_resume_edit";
}

function inferTargetSection(item = {}) {
  const native = lowerText(item.targetSection);
  if (native) return native;
  const text = lowerText(adviceText(item));
  if (/summary|headline|å¼€å¤´|ç®€ä»‹/.test(text)) return "summary";
  if (/skills?|æŠ€èƒ½/.test(text)) return "skills";
  if (/education|coursework|gpa|certificate|è¯¾ç¨‹|è¯ä¹¦|æ•™è‚²/.test(text)) return "education";
  if (/project|portfolio|github|é¡¹ç›®|ä½œå“/.test(text)) return "projects";
  if (/experience|bullet|ç»åŽ†|å·¥ä½œ/.test(text)) return "experience";
  return "overall";
}

function inferCoverageFamily(item = {}) {
  const actionFamily = inferActionFamily(item);
  const text = lowerText(adviceText(item));
  const tags = asArray(item.relatedProblemTags).join(" ");
  const combined = `${text} ${tags}`.toLowerCase();
  if (["jd_keyword_alignment", "keyword_in_experience", "skills_keyword_ordering"].includes(actionFamily)) return "keyword";
  if (["summary_creation", "summary_positioning"].includes(actionFamily)) return "positioning";
  if (actionFamily === "impact_metrics") return "impact_metrics";
  if (actionFamily === "technical_depth") return "technical_depth";
  if (actionFamily === "cross_domain_reframing") return "cross_domain_transfer";
  if (actionFamily === "education_signal") return "junior_signal";
  if (actionFamily === "risk_explanation") return "risk_explanation";
  if (actionFamily === "section_relevance_order") return "readability_structure";
  if (actionFamily === "experience_evidence") return "experience_evidence";
  if (/short|tenure|intern|gap|contract|risk|çŸ­æœŸ|å®žä¹ |å‘¨æœŸ|è¾¹ç•Œ|ç¨³å®š/.test(combined)) return "risk_explanation";
  if (/education|coursework|gpa|certificate|è¯¾ç¨‹|è¯ä¹¦|æ•™è‚²/.test(combined)) return "junior_signal";
  if (/cross|transfer|refram|china|market|è·¨é¢†åŸŸ|è¿ç§»|è½¬åŒ–|éžå…¸åž‹/.test(combined)) return "cross_domain_transfer";
  if (/system design|architecture|deployment|technical_depth|å·¥ç¨‹åŒ–|ç³»ç»Ÿ|æž¶æž„|éƒ¨ç½²|æŠ€æœ¯æ·±åº¦/.test(combined)) return "technical_depth";
  if (/finance|financial|quant|business|stakeholder|data|analytics|ä¸šåŠ¡|é‡‘èž|æ•°æ®|å•†ä¸š/.test(combined)) {
    if (!/keyword|ats|jd/.test(combined) || /business|data|finance|ä¸šåŠ¡|é‡‘èž|æ•°æ®/.test(combined)) return "business_data_context";
  }
  if (/impact|metric|quantif|measurable|result|æˆæžœ|é‡åŒ–|æ•°å­—|ä»·å€¼/.test(combined) || actionFamily === "impact_metrics") return "impact_metrics";
  if (/experience|bullet|project|evidence|ç»åŽ†|é¡¹ç›®|è¯æ®/.test(combined) || actionFamily === "experience_evidence") return "experience_evidence";
  if (/keyword|jd|ats|hard_skill|priority_keyword|å…³é”®è¯|æŠ€èƒ½è¯/.test(combined)) return "keyword";
  if (/summary|headline|target role|job title|position|å®šä½|å²—ä½|å¼€å¤´/.test(combined)) return "positioning";
  if (/section|format|readability|layout|ç‰ˆé¢|å¯è¯»|æ ¼å¼|æŽ’åº/.test(combined)) return "readability_structure";
  return "experience_evidence";
}

function inferActionSlot(item = {}) {
  const family = inferActionFamily(item);
  const coverage = inferCoverageFamily(item);
  const section = inferTargetSection(item);
  const text = lowerText(adviceText(item));
  if (family === "summary_creation") return "summary_creation";
  if (section === "summary" && /target|job title|exact|åŽŸè¯|å²—ä½/.test(text)) return "summary_target_role";
  if (section === "summary") return "summary_positioning";
  if (coverage === "keyword" && section === "experience") return "keyword_in_experience";
  if (coverage === "keyword" && section === "skills") return "skills_keyword_ordering";
  if (coverage === "keyword") return "keyword_placement";
  if (coverage === "impact_metrics") return "experience_impact_metrics";
  if (coverage === "risk_explanation") return "short_tenure_explanation";
  if (coverage === "junior_signal") return "education_coursework_signal";
  if (coverage === "readability_structure") return "section_weighting";
  if (coverage === "cross_domain_transfer") return "cross_domain_reframing";
  if (coverage === "technical_depth") return "technical_project_depth";
  if (coverage === "business_data_context") return "business_data_context";
  return "experience_bullet_evidence";
}

function buildDuplicateGroupKey(item = {}) {
  return `${item.coverageFamily || inferCoverageFamily(item)}:${item.targetSection || inferTargetSection(item)}:${item.actionFamily || inferActionFamily(item)}`;
}

function deterministicIndex(value = "", modulo = 1) {
  const text = normalizeText(value);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return modulo ? hash % modulo : 0;
}

function pickTitleVariant(item = {}, variants = []) {
  if (!variants.length) return item.title || "";
  const seed = [
    item.adviceId,
    item.id,
    item.coverageFamily,
    item.actionSlot,
    item.actionFamily,
    item.targetSection,
    item.action,
  ].filter(Boolean).join("|");
  return variants[deterministicIndex(seed, variants.length)];
}

function diversifyAdviceTitle(item = {}, context = {}) {
  const title = sanitizeRoleMixedText(item.title || "", context);
  const compact = normalizeText(title).toLowerCase();
  const isGenericExperienceTitle =
    /^æ”¹å†™å·¥ä½œç»åŽ†\s*bullet$/i.test(title) ||
    /^rewrite\s+experience\s+bullet$/i.test(compact) ||
    /^rewrite\s+work\s+experience\s+bullet$/i.test(compact);
  if (!isGenericExperienceTitle) return title;

  const family = item.coverageFamily || inferCoverageFamily(item);
  if (family === "keyword") {
    return pickTitleVariant(item, ["æŠŠ JD å…³é”®è¯æ”¾å›žç»åŽ†", "è¡¥é½ç»åŽ†é‡Œçš„å…³é”®è¯è¯æ®", "è®©å…³é”®è¯å‡ºçŽ°åœ¨çœŸå®žé¡¹ç›®é‡Œ"]);
  }
  if (family === "readability_structure") {
    return pickTitleVariant(item, ["è°ƒæ•´ç»åŽ†ç¯‡å¹…æƒé‡", "é‡æŽ’æœ€ç›¸å…³ç»åŽ†é¡ºåº", "çªå‡ºæ ¸å¿ƒç»åŽ†"]);
  }
  if (family === "impact_metrics") {
    return pickTitleVariant(item, ["å¼ºåŒ– bullet çš„ç»“æžœè¡¨è¾¾", "è¡¥ä¸Šæˆæžœæ•°å­—å’Œè§„æ¨¡", "æŠŠç»åŽ†æ”¹æˆå¯è¡¡é‡ç»“æžœ"]);
  }
  if (family === "risk_explanation") {
    return pickTitleVariant(item, ["è¯´æ˜ŽçŸ­æœŸç»åŽ†æ€§è´¨", "äº¤ä»£å®žä¹ æˆ–é¡¹ç›®å‘¨æœŸ", "è¡¥æ¸…ç»åŽ†è¾¹ç•Œ"]);
  }
  if (family === "positioning") {
    return pickTitleVariant(item, ["è¡¥ä¸Šç›®æ ‡å²—ä½åŽŸè¯", "ç»Ÿä¸€å¼€å¤´å²—ä½å®šä½", "è®© Summary æŒ‡å‘ç›®æ ‡å²—ä½"]);
  }
  if (family === "junior_signal") {
    return pickTitleVariant(item, ["ç”¨è¯¾ç¨‹æˆ–é¡¹ç›®è¡¥è¶³ junior ä¿¡å·", "æŠŠè®­ç»ƒèƒŒæ™¯å†™æˆå²—ä½è¯æ®"]);
  }
  return pickTitleVariant(item, ["è¡¥å¼ºç»åŽ†é‡Œçš„åŠ¨ä½œå’Œäº¤ä»˜", "æŠŠèŒè´£å†™æˆé¡¹ç›®è¯æ®", "é‡å†™æ ¸å¿ƒç»åŽ† bullet"]);
}

function displayPriorityFor(item = {}, context = {}) {
  const tags = asArray(item.relatedProblemTags);
  const tagSeverity = new Map(asArray(context.problemTags).map((p) => [p.tag || p, p.severity || "medium"]));
  const strongestTag = tags.reduce((best, tag) => Math.min(best, severityRank(tagSeverity.get(tag))), 4);
  let score = 100 - priorityRank(item.priority) * 12 - strongestTag * 8;
  if (item.coverageFamily === "positioning") score += 9;
  if (item.coverageFamily === "experience_evidence") score += 8;
  if (item.coverageFamily === "impact_metrics") score += 7;
  if (item.coverageFamily === "risk_explanation") score += 8;
  if (item.targetSection && item.targetSection !== "overall") score += 5;
  if (normalizeText(item.currentDiagnosis || item.problemSummary).length > 30) score += 3;
  if (normalizeText(item.action || item.actionSummary).length > 30) score += 4;
  if (item.source === "fallback") score -= 12;
  if (item.source === "curator_supplement") score -= 20;
  if (item.coverageFamily === "keyword") score -= 3;
  return Math.max(0, Math.round(score));
}

function normalizeAdviceItemForCuration(item = {}, context = {}, mentor = {}) {
  const actionFamily = inferActionFamily(item);
  const targetSection = inferTargetSection(item);
  const coverageFamily = inferCoverageFamily({ ...item, actionFamily, targetSection });
  const actionSlot = inferActionSlot({ ...item, actionFamily, targetSection, coverageFamily });
  const evidence = evidenceMatchesCoverage(item.evidence, coverageFamily)
    ? unique(item.evidence)
    : defaultEvidenceForCoverage(coverageFamily, targetSection);
  const fallbackMentorSource = cleanMentorSource({
    mentorId: mentor.mentorId,
    mentorName: mentor.mentorName,
    company: mentor.company,
    companyLogo: mentor.companyLogo || null,
    mentorTitle: mentor.mentorTitle,
    mentorSubtitle: mentor.mentorSubtitle,
  });
  const originalMentorSource = cleanMentorSource(item.originalMentorSource || item.mentorSource) || fallbackMentorSource;
  const mentorPool = buildMentorPool(
    context.mentorPool || [],
    [
      { mentorSource: originalMentorSource },
      { mentorSource: item.displayedMentorSource },
      { mentorSource: fallbackMentorSource },
    ]
  );
  const displayFit = selectDisplayedMentorForAdvice(
    { ...item, actionFamily, targetSection, coverageFamily, actionSlot },
    mentorPool,
    context,
    originalMentorSource
  );
  const displayedMentorSource = displayFit.displayedMentorSource || originalMentorSource || fallbackMentorSource;
  const attributionMode = inferAttributionMode(item, originalMentorSource, displayedMentorSource);
  const sourceDisclosure = sourceDisclosureFor(attributionMode);
  const normalized = {
    ...item,
    title: diversifyAdviceTitle({ ...item, actionFamily, targetSection, coverageFamily, actionSlot }, context),
    currentDiagnosis: sanitizeRoleMixedText(item.currentDiagnosis || item.problemSummary || "", context),
    problemSummary: sanitizeRoleMixedText(item.problemSummary || item.currentDiagnosis || "", context),
    action: sanitizeRoleMixedText(item.action || item.actionSummary || "", context),
    actionSummary: sanitizeRoleMixedText(item.actionSummary || item.action || "", context),
    mentorInsight: sanitizeRoleMixedText(item.mentorInsight || item.mentorLens || item.reason || "", context),
    mentorLens: sanitizeRoleMixedText(item.mentorLens || item.mentorInsight || item.reason || "", context),
    hrPerspective: sanitizeRoleMixedText(item.hrPerspective || item.HR_os || "", context),
    HR_os: sanitizeRoleMixedText(item.HR_os || item.hrPerspective || "", context),
    actionFamily,
    canonicalActionFamily: item.canonicalActionFamily || actionFamily,
    targetSection,
    coverageFamily,
    actionSlot,
    relatedProblemTags: unique(item.relatedProblemTags),
    evidence,
    attributionMode,
    originalMentorSource,
    displayedMentorSource,
    sourceDisclosure,
    mentorSource: displayedMentorSource,
    mentorDisplayFit: displayFit.mentorDisplayFit,
    mentorFitReason: displayFit.mentorFitReason,
    displayMentorScore: displayFit.displayMentorScore,
    mentorRoleCluster: displayFit.mentorDisplayFit,
    adviceSkillClusters: inferAdviceSkillClusters(item),
  };
  normalized.duplicateGroupKey = buildDuplicateGroupKey(normalized);
  normalized.displayPriority = Number.isFinite(Number(item.displayPriority))
    ? Number(item.displayPriority)
    : displayPriorityFor(normalized, context);
  normalized.isPreviewWorthy = item.isPreviewWorthy !== false &&
    ["positioning", "experience_evidence", "impact_metrics", "risk_explanation", "keyword"].includes(normalized.coverageFamily);
  return normalized;
}

function compareAdvice(a, b) {
  return (Number(b.displayPriority || 0) - Number(a.displayPriority || 0)) ||
    (priorityRank(a.priority) - priorityRank(b.priority)) ||
    String(a.adviceId || "").localeCompare(String(b.adviceId || ""));
}

function hasRequiredFamily(items, family) {
  return items.some((item) => item.coverageFamily === family);
}

function chooseBestByKey(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const existing = map.get(key);
    if (!existing || compareAdvice(item, existing) < 0) map.set(key, item);
  }
  return [...map.values()];
}

function enforceKeywordCaps(items, context = {}) {
  const maxKeyword = isKeywordCritical(context) ? 2 : 2;
  let globalKeywordCount = 0;
  const keywordByMentor = new Map();
  const output = [];
  for (const item of items.sort(compareAdvice)) {
    if (item.coverageFamily !== "keyword") {
      output.push(item);
      continue;
    }
    const mentorKey = mentorGroupKey(item.mentorSource || {});
    if ((keywordByMentor.get(mentorKey) || 0) >= 1) continue;
    if (globalKeywordCount >= maxKeyword) continue;
    keywordByMentor.set(mentorKey, (keywordByMentor.get(mentorKey) || 0) + 1);
    globalKeywordCount += 1;
    output.push(item);
  }
  return output.sort(compareAdvice);
}

function compactAdviceText(value) {
  return lowerText(value).replace(/\s+/g, " ").trim();
}

function adviceExactKey(item = {}) {
  const stableText = [
    item.title,
    item.currentDiagnosis || item.problemSummary,
    item.action || item.actionSummary,
  ].map(compactAdviceText).filter(Boolean).join("|");
  return stableText || String(item.adviceId || item.id || "");
}

function supplementalAdviceTemplates(context = {}) {
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const isMachineLearning = roleProfile.functionCluster === "machine_learning";
  const isAccounting = roleProfile.functionCluster === "accounting";
  const targetRole = normalizeText(context.targetRole || context.internalAtsResult?.jobTitle || "ç›®æ ‡å²—ä½");
  const toolTitle = isMachineLearning ? "补足模型工具和评估语境" : "补足岗位工具和交付语境";
  const toolDiagnosis = isMachineLearning
    ? "简历已经有项目经历，但还可以更明确连接到 MLE 岗位常见的模型、数据、评估或部署交付。"
    : "简历已经有可迁移经历，但还可以更明确连接到目标岗位常见工具、流程或交付物。";
  const toolAction = isMachineLearning
    ? `检查 ${targetRole} JD 中反复出现的模型、数据、评估和部署要求，把真实掌握的 Python、PyTorch/TensorFlow、模型评估、数据处理、API 或部署经验放回对应项目。`
    : isAccounting
      ? `检查 ${targetRole} JD 中反复出现的工具和交付物，把真实掌握的 Excel、报表、对账、合规、流程跟进或数据整理内容放回对应经历。`
      : `检查 ${targetRole} JD 中反复出现的工具、流程和交付物，把真实掌握的技能放回对应经历或项目。`;
  const deliveryTitle = isMachineLearning
    ? "把项目改成模型交付证据"
    : isAccounting
      ? "把职责改成会计交付物"
      : "把职责改成岗位交付物";
  const deliveryDiagnosis = isMachineLearning
    ? "部分项目还停留在参与或负责层面，和 MLE 岗位常见的模型训练、评估、上线或实验结论连接不够明确。"
    : isAccounting
      ? "部分经历还停留在参与或负责层面，和会计岗位常见的交付物连接不够明确。"
      : "部分经历还停留在参与或负责层面，和目标岗位常见交付物连接不够明确。";
  const deliveryAction = isMachineLearning
    ? "挑一条最相关项目，补成「任务场景 + 模型/数据方法 + 评估指标或部署结果」结构，例如数据清洗、特征处理、模型训练、效果评估、API 服务或实验结论。"
    : isAccounting
      ? "挑一条最相关经历，补成「任务场景 + 处理对象 + 交付物」结构，例如报表、对账记录、费用整理、流程跟进、数据核对或月度汇总。"
      : "挑一条最相关经历，补成「任务场景 + 处理对象 + 交付物」结构，让读者能看见你具体完成了什么。";
  return [
    {
      adviceId: "mentorx_supplement_section_weighting",
      title: "è°ƒæ•´ç»åŽ†ç¯‡å¹…æƒé‡",
      currentDiagnosis: "ç®€åŽ†é‡Œä¸åŒç»åŽ†çš„é‡è¦æ€§è¿˜æ²¡æœ‰æ‹‰å¼€ï¼Œè¯»è€…å¯èƒ½ä¼šæŠŠå¼±ç›¸å…³å†…å®¹å’Œæ ¸å¿ƒç»åŽ†çœ‹æˆåŒç­‰é‡è¦ã€‚",
      action: `æŠŠæœ€è´´è¿‘ ${targetRole} çš„ç»åŽ†æˆ–é¡¹ç›®æ”¾åˆ°æ›´é å‰ä½ç½®ï¼Œå¹¶ç»™å®ƒå¤š 1-2 æ¡ bulletï¼›å¼±ç›¸å…³ç»åŽ†åªä¿ç•™èƒ½è¯æ˜Žäº¤ä»˜ã€åä½œæˆ–åŸºç¡€èŒä¸šèƒ½åŠ›çš„å†…å®¹ã€‚`,
      mentorInsight: "å®Œæ•´æŠ¥å‘Šé‡Œé™¤äº†æ”¹å…³é”®è¯ï¼Œä¹Ÿè¦å¤„ç†ä¿¡æ¯æƒé‡ã€‚è¶Šé å‰ã€è¶Šè¯¦ç»†çš„ç»åŽ†ï¼Œè¶Šä¼šå½±å“ HR å¯¹åŒ¹é…åº¦çš„ç¬¬ä¸€åˆ¤æ–­ã€‚",
      hrPerspective: "æˆ‘ä¸ä¼šå¹³å‡é˜…è¯»æ¯æ®µç»åŽ†ï¼›æœ€å‰é¢çš„ç»åŽ†å¦‚æžœä¸å¤Ÿç›¸å…³ï¼ŒåŽé¢çš„äº®ç‚¹å¾ˆå¯èƒ½æ¥ä¸åŠè¢«çœ‹åˆ°ã€‚",
      priority: "medium",
      targetSection: "experience",
      relatedProblemTags: ["weak_section_order"],
      actionFamily: "section_relevance_order",
      canonicalActionFamily: "section_relevance_order",
      mentorSource: MENTORX_SOURCE,
      source: "curator_supplement",
    },
    {
      adviceId: "mentorx_supplement_accounting_tools",
      title: toolTitle,
      currentDiagnosis: toolDiagnosis,
      action: toolAction,
      mentorInsight: "å·¥å…·åä¸è¦åªå †åœ¨ Skillsï¼›æœ€å¥½å’Œå…·ä½“äº¤ä»˜åœºæ™¯ç»‘å®šï¼Œæ‰èƒ½åŒæ—¶æœåŠ¡ ATS å’Œäººå·¥é˜…è¯»ã€‚",
      hrPerspective: "æˆ‘ä¼šçœ‹æŠ€èƒ½æ˜¯å¦å‡ºçŽ°åœ¨çœŸå®žåœºæ™¯é‡Œã€‚åªåˆ—å·¥å…·åä¸å¦‚è¯´æ˜Žä½ ç”¨å®ƒå®Œæˆäº†ä»€ä¹ˆã€‚",
      priority: "medium",
      targetSection: "skills",
      relatedProblemTags: ["weak_experience_keyword_evidence"],
      actionFamily: "experience_evidence",
      canonicalActionFamily: "experience_evidence",
      mentorSource: MENTORX_SOURCE,
      source: "curator_supplement",
    },
    {
      adviceId: "mentorx_supplement_delivery_examples",
      title: deliveryTitle,
      currentDiagnosis: deliveryDiagnosis,
      action: deliveryAction,
      mentorInsight: "ä¼šè®¡ç±»å²—ä½å¾ˆçœ‹é‡ç¨³å®šã€å‡†ç¡®ã€å¯å¤æ ¸çš„äº¤ä»˜ç‰©ã€‚æŠŠç»åŽ†å†™æˆå…·ä½“äº¤ä»˜ï¼Œä¼šæ¯”æ³›æ³›å†™ååŠ©æˆ–å‚ä¸Žæ›´æœ‰è¯´æœåŠ›ã€‚",
      hrPerspective: "æˆ‘ä¼šçœ‹ä½ æ˜¯å¦çœŸçš„æŽ¥è§¦è¿‡å²—ä½ç›¸è¿‘çš„å·¥ä½œæµï¼›äº¤ä»˜ç‰©è¶Šå…·ä½“ï¼Œè¶Šå®¹æ˜“åˆ¤æ–­å¯è¿ç§»æ€§ã€‚",
      priority: "medium",
      targetSection: "experience",
      relatedProblemTags: ["weak_experience_keyword_evidence"],
      actionFamily: "experience_delivery_context",
      canonicalActionFamily: "experience_delivery_context",
      mentorSource: MENTORX_SOURCE,
      source: "curator_supplement",
    },
  ];
}

function fillReportRichness(normalized = [], curated = [], context = {}) {
  let output = curated.slice();
  if (output.length >= 7) return output;
  const existingKeys = new Set(output.map(adviceExactKey));
  const supplements = supplementalAdviceTemplates(context)
    .map((item) => normalizeAdviceItemForCuration(item, context, { ...MENTORX_SOURCE }))
    .filter((item) => normalizeText(item.title) && normalizeText(item.action || item.actionSummary));
  for (const item of supplements) {
    if (output.length >= 7) break;
    const key = adviceExactKey(item);
    if (existingKeys.has(key)) continue;
    output.push(item);
    existingKeys.add(key);
  }
  return output.sort(compareAdvice);
}

function selectDiverseReportAdviceItems(normalized = [], context = {}) {
  const keywordCapped = enforceKeywordCaps(normalized, context).sort(compareAdvice);
  const exactSeen = new Set();
  const sameMentorSlotSeen = new Set();
  const duplicateCounts = new Map();
  const selected = [];

  for (const item of keywordCapped) {
    const exactKey = adviceExactKey(item);
    if (!exactKey || exactSeen.has(exactKey)) continue;

    const slotKey = item.duplicateGroupKey || buildDuplicateGroupKey(item);
    const mentorSlotKey = `${mentorGroupKey(item.mentorSource || {})}:${slotKey}`;
    if (sameMentorSlotSeen.has(mentorSlotKey)) continue;

    const maxPerSlot = item.coverageFamily === "keyword" ? 1 : 2;
    if ((duplicateCounts.get(slotKey) || 0) >= maxPerSlot) continue;

    exactSeen.add(exactKey);
    sameMentorSlotSeen.add(mentorSlotKey);
    duplicateCounts.set(slotKey, (duplicateCounts.get(slotKey) || 0) + 1);
    selected.push(item);
    if (selected.length >= 9) break;
  }

  return selected.sort(compareAdvice);
}

function curateAdviceItems(items = [], context = {}) {
  const normalized = items
    .map((item) => normalizeAdviceItemForCuration(item, context, item._mentor || {}))
    .filter((item) => normalizeText(item.title) && normalizeText(item.action || item.actionSummary));
  let curated = selectDiverseReportAdviceItems(normalized, context);

  const addBestFamily = (family) => {
    if (hasRequiredFamily(curated, family)) return;
    const candidate = normalized.filter((item) => item.coverageFamily === family).sort(compareAdvice)[0];
    if (candidate && !curated.some((item) => adviceExactKey(item) === adviceExactKey(candidate))) {
      curated.push(candidate);
      curated = chooseBestByKey(curated, adviceExactKey).sort(compareAdvice);
    }
  };

  if (hasProblemTag(context, /short_tenure|intern|gap/)) addBestFamily("risk_explanation");
  if (hasProblemTag(context, /education|coursework|gpa/)) addBestFamily("junior_signal");
  if (hasProblemTag(context, /weak_experience_keyword_evidence|low_measurable_results|weak_result_orientation/)) {
    addBestFamily("experience_evidence");
    if (!hasRequiredFamily(curated, "experience_evidence")) addBestFamily("impact_metrics");
  }

  curated = fillReportRichness(normalized, curated, context);

  return curated.sort(compareAdvice).slice(0, 9);
}

function selectResultPageAdviceItems(curatedItems = [], context = {}) {
  const maxKeyword = isKeywordCritical(context) ? 2 : 1;
  const selected = [];
  const usedFamilies = new Set();
  let keywordCount = 0;
  const candidates = curatedItems
    .filter((item) => item.isPreviewWorthy !== false)
    .sort(compareAdvice);

  for (const item of candidates) {
    if (selected.length >= 3) break;
    if (item.coverageFamily === "keyword" && keywordCount >= maxKeyword) continue;
    if (usedFamilies.has(item.coverageFamily)) continue;
    selected.push(item);
    usedFamilies.add(item.coverageFamily);
    if (item.coverageFamily === "keyword") keywordCount += 1;
  }

  for (const item of candidates) {
    if (selected.length >= 3) break;
    if (selected.some((x) => (x.adviceId || x.duplicateGroupKey) === (item.adviceId || item.duplicateGroupKey))) continue;
    if (item.coverageFamily === "keyword" && keywordCount >= maxKeyword) continue;
    selected.push(item);
    if (item.coverageFamily === "keyword") keywordCount += 1;
  }

  return selected.slice(0, 3);
}

const LENS_CONFIG = {
  positioning: {
    lens: "å²—ä½å®šä½è§†è§’",
    reason: "è¿™ç»„å»ºè®®ä¸»è¦é’ˆå¯¹ç®€åŽ†å¼€å¤´ã€ç›®æ ‡å²—ä½åŽŸè¯å’Œæ•´ä½“ä¸»çº¿ï¼Œè®© HR æ›´å¿«åˆ¤æ–­ä½ çš„æŠ•é€’æ–¹å‘ã€‚",
  },
  keyword: {
    lens: "ATS å…³é”®è¯è§†è§’",
    reason: "è¿™ç»„å»ºè®®ä¸»è¦é’ˆå¯¹ JD å…³é”®è¯è¦†ç›–å’Œæ”¾ç½®ä½ç½®ï¼Œå¸®åŠ© ATS ä¸Ž HR åŒæ—¶çœ‹åˆ°åŒ¹é…è¯æ®ã€‚",
  },
  experience_evidence: {
    lens: "ç»åŽ†è¯æ®è§†è§’",
    reason: "è¿™ç»„å»ºè®®ä¸»è¦é’ˆå¯¹ç»åŽ† bullet çš„åŠ¨ä½œã€æ–¹æ³•ã€å·¥å…·å’Œäº§å‡ºï¼Œè®©æ ¸å¿ƒèƒ½åŠ›æœ‰çœŸå®žé¡¹ç›®è¯æ®æ”¯æ’‘ã€‚",
  },
  impact_metrics: {
    lens: "æˆæžœé‡åŒ–è§†è§’",
    reason: "è¿™ç»„å»ºè®®ä¸»è¦é’ˆå¯¹ç»“æžœã€æŒ‡æ ‡å’Œä¸šåŠ¡ä»·å€¼è¡¨è¾¾ï¼Œè®©è¯»è€…æ›´å®¹æ˜“åˆ¤æ–­ä½ çš„å®žé™…è´¡çŒ®ã€‚",
  },
  risk_explanation: {
    lens: "çŸ­æœŸç»åŽ†ä¸Žé£Žé™©è§£é‡Šè§†è§’",
    reason: "è¿™ç»„å»ºè®®ä¸»è¦é’ˆå¯¹çŸ­æœŸç»åŽ†ã€å®žä¹ æ€§è´¨æˆ–é¡¹ç›®è¾¹ç•Œè¯´æ˜Žï¼Œå¸®åŠ© HR æ›´å¿«ç†è§£æ¯æ®µç»åŽ†çš„æ€§è´¨å’Œäº§å‡ºã€‚",
  },
  junior_signal: {
    lens: "Junior èƒŒæ™¯è¡¥å¼ºè§†è§’",
    reason: "è¿™ç»„å»ºè®®ä¸»è¦é’ˆå¯¹è¯¾ç¨‹ã€é¡¹ç›®ã€è¯ä¹¦å’Œè®­ç»ƒç»åŽ†ï¼ŒæŠŠ junior å€™é€‰äººçš„å­¦ä¹ è¯æ®è½¬æˆå²—ä½èƒ½åŠ›ä¿¡å·ã€‚",
  },
  cross_domain_transfer: {
    lens: "è·¨é¢†åŸŸè¿ç§»è§†è§’",
    reason: "è¿™ç»„å»ºè®®ä¸»è¦é’ˆå¯¹éžå…¸åž‹èƒŒæ™¯å’Œå¯è¿ç§»èƒ½åŠ›è¡¨è¾¾ï¼Œå¸®åŠ©ä½ æŠŠå·²æœ‰ç»åŽ†ç¿»è¯‘æˆç›®æ ‡å²—ä½èƒ½ç†è§£çš„è¯­è¨€ã€‚",
  },
  technical_depth: {
    lens: "æŠ€æœ¯é¡¹ç›®æ·±åº¦è§†è§’",
    reason: "è¿™ç»„å»ºè®®ä¸»è¦é’ˆå¯¹æŠ€æœ¯é¡¹ç›®ã€ç³»ç»Ÿå®žçŽ°å’Œå·¥ç¨‹åŒ–äº¤ä»˜ï¼Œè®©æŠ€æœ¯èƒ½åŠ›ä¸åªåœç•™åœ¨å·¥å…·æ¸…å•ã€‚",
  },
  business_data_context: {
    lens: "ä¸šåŠ¡ / é‡‘èž / æ•°æ®åœºæ™¯è§†è§’",
    reason: "è¿™ç»„å»ºè®®ä¸»è¦é’ˆå¯¹æ•°æ®ã€ä¸šåŠ¡åœºæ™¯å’Œå†³ç­–ä»·å€¼ï¼ŒæŠŠåˆ†æžæˆ–é¡¹ç›®ç»åŽ†è¿žæŽ¥åˆ°å²—ä½çœŸå®žå·¥ä½œè¯­å¢ƒã€‚",
  },
  readability_structure: {
    lens: "ç‰ˆé¢ä¸Žå¯è¯»æ€§è§†è§’",
    reason: "è¿™ç»„å»ºè®®ä¸»è¦é’ˆå¯¹ section é¡ºåºã€ä¿¡æ¯æƒé‡å’Œå¯æ‰«ææ€§ï¼Œè®©é‡è¦ç»åŽ†æ›´å®¹æ˜“è¢« HR ç¬¬ä¸€çœ¼çœ‹åˆ°ã€‚",
  },
};

function inferMentorGroupLens(adviceItems = [], mentorProfile = {}, targetRole = "") {
  const scores = new Map();
  for (const item of adviceItems) {
    const family = item.coverageFamily || inferCoverageFamily(item);
    scores.set(family, (scores.get(family) || 0) + 1 + Number(item.displayPriority || 0) / 100);
  }
  const mentorText = lowerText(`${mentorProfile.company || ""} ${mentorProfile.mentorTitle || ""} ${targetRole || ""}`);
  if (/blackrock|ubs|goldman|jpmorgan|finance|quant|financial|bank|é‡‘èž|é‡åŒ–/.test(mentorText)) {
    scores.set("business_data_context", (scores.get("business_data_context") || 0) + 0.35);
  }
  if (/software|engineer|machine learning|ml|ai|developer|anyscale|openai|google|amazon|meta/.test(mentorText)) {
    scores.set("technical_depth", (scores.get("technical_depth") || 0) + 0.25);
  }
  if (/architect|design|designer|portfolio|architecture/.test(mentorText)) {
    scores.set("cross_domain_transfer", (scores.get("cross_domain_transfer") || 0) + 0.2);
    scores.set("risk_explanation", (scores.get("risk_explanation") || 0) + 0.2);
  }
  const bestFamily = [...scores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "experience_evidence";
  return LENS_CONFIG[bestFamily] || LENS_CONFIG.experience_evidence;
}

function buildReportPageMentorGroups(curatedItems = [], originalMentors = [], context = {}) {
  const mentorByKey = new Map();
  for (const mentor of originalMentors || []) {
    const keys = [
      mentorGroupKey(mentor),
      mentor.mentorId ? `id:${mentor.mentorId}` : "",
      mentor.company ? compactKey(mentor.company) : "",
      mentor.mentorName ? compactKey(mentor.mentorName) : "",
    ].filter(Boolean);
    keys.forEach((key) => {
      if (!mentorByKey.has(key)) mentorByKey.set(key, mentor);
    });
  }
  const groups = new Map();
  for (const item of curatedItems) {
    const src = item.mentorSource || {};
    const key = mentorGroupKey(src);
    const base = mentorByKey.get(key) || mentorByKey.get(src.mentorId ? `id:${src.mentorId}` : "") || src;
    if (!groups.has(key)) {
      groups.set(key, {
        mentorId: base.mentorId || src.mentorId || key,
        mentorName: base.mentorName || src.mentorName || "MentorX å¯¼å¸ˆ",
        company: base.company || src.company || "MentorX",
        companyLogo: mentorLogoFor(base) || mentorLogoFor(src),
        mentorTitle: base.mentorTitle || src.mentorTitle || "",
        mentorSubtitle: base.mentorSubtitle || src.mentorSubtitle || "",
        careerPathDisplay: base.careerPathDisplay || src.careerPathDisplay || null,
        badges: base.badges || [],
        matchReason: base.matchReason || item.matchReason || "",
        matchedProblems: base.matchedProblems || [],
        adviceItems: [],
      });
    }
    groups.get(key).adviceItems.push(item);
  }
  const groupCount = groups.size;
  const totalCurated = curatedItems.length;
  return [...groups.values()].slice(0, 5).map((group) => {
    const groupLimit = isMentorXProfile(group) && (totalCurated < 7 || groupCount <= 3) ? 4 : 3;
    group.adviceItems = group.adviceItems
      .sort((a, b) => {
        const aSupplement = a.source === "curator_supplement";
        const bSupplement = b.source === "curator_supplement";
        if (aSupplement !== bSupplement) return aSupplement ? 1 : -1;
        return compareAdvice(a, b);
      })
      .slice(0, groupLimit);
    const lens = inferMentorGroupLens(group.adviceItems, group, context.targetRole);
    const modes = unique(group.adviceItems.map((item) => item.attributionMode || "verified_original"));
    const attributionMode = modes.length === 1 ? modes[0] : (modes.includes("stitched_lens") ? "stitched_lens" : "verified_original");
    const sourceDisclosure = sourceDisclosureFor(attributionMode);
    return {
      ...group,
      attributionMode,
      sourceDisclosure,
      mentorGroupLens: lens.lens,
      mentorGroupReason: lens.reason,
      adviceItems: group.adviceItems.map((item) => ({
        ...item,
        attributionMode: item.attributionMode || attributionMode,
        sourceDisclosure: item.sourceDisclosure || sourceDisclosureFor(item.attributionMode || attributionMode),
        mentorGroupLens: lens.lens,
        mentorGroupReason: lens.reason,
      })),
    };
  });
}

function buildCoverageSummary(curatedItems = [], context = {}) {
  const targetTags = unique(asArray(context.problemTags).map((item) => item.tag || item));
  const coveredTags = unique(curatedItems.flatMap((item) => item.relatedProblemTags || []))
    .filter((tag) => targetTags.includes(tag));
  const families = unique(curatedItems.map((item) => item.coverageFamily));
  return {
    totalProblemsDetected: targetTags.length,
    problemsCovered: coveredTags.length,
    coverageRatio: targetTags.length ? Number((coveredTags.length / targetTags.length).toFixed(3)) : 1,
    coveredProblemTags: coveredTags,
    uncoveredProblemTags: targetTags.filter((tag) => !coveredTags.includes(tag)),
    coverageFamilies: families,
    totalAdviceItems: curatedItems.length,
    targetAdviceCountMin: 7,
    targetAdviceCountMax: 9,
    adviceCountStatus: curatedItems.length >= 7 ? "sufficient" : "candidate_pool_insufficient",
    shortageReason: curatedItems.length >= 7 ? "" : "Curated candidate pool had fewer than 7 non-duplicate, role-safe advice items.",
  };
}

function flattenMentorItems(mentorReport = {}) {
  return asArray(mentorReport.mentors).flatMap((mentor) =>
    asArray(mentor.adviceItems).map((item) => ({ ...item, _mentor: mentor }))
  );
}

function curateMentorAdvicePlan(input = {}) {
  const internalAtsResult = input.internalAtsResult || {};
  const context = {
    ...input,
    internalAtsResult,
    problemTags: asArray(internalAtsResult.problemTags),
    targetRole: input.targetRole || internalAtsResult.jobTitle || internalAtsResult.profile?.targetRole || "",
  };
  const mentorReport = input.mentorReport || {};
  const rawItems = input.items || flattenMentorItems(mentorReport);
  const roleProfile = roleProfileFromContext(context);
  const mentorPool = buildMentorPool(asArray(mentorReport.mentors), rawItems);
  context.roleProfile = roleProfile;
  context.mentorPool = mentorPool;
  const curatedAdviceItems = curateAdviceItems(rawItems, context);
  const resultPageAdviceItems = selectResultPageAdviceItems(curatedAdviceItems, context);
  const reportPageMentorGroups = buildReportPageMentorGroups(
    curatedAdviceItems,
    asArray(mentorReport.mentors),
    context
  );
  return {
    curatedAdviceItems,
    resultPageAdviceItems,
    reportPageMentorGroups,
    coverageSummary: buildCoverageSummary(curatedAdviceItems, context),
  };
}

module.exports = {
  normalizeAdviceItemForCuration,
  inferCoverageFamily,
  inferActionFamily,
  inferActionSlot,
  buildDuplicateGroupKey,
  curateAdviceItems,
  selectResultPageAdviceItems,
  buildReportPageMentorGroups,
  inferMentorGroupLens,
  curateMentorAdvicePlan,
};
