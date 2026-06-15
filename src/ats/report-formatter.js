"use strict";

const crypto = require("crypto");
const { buildRoleProfileFromContext } = require("./role-profile");

const SCORING_MODE = "external_ats_like";
const REPORT_VERSION = "0.2.0";

const DIMENSION_LABELS = {
  A: "\u6587\u4ef6\u4e0e\u683c\u5f0f\u89c4\u8303",
  B: "\u57fa\u672c\u8d44\u6599\u5b8c\u6574\u6027",
  C: "\u5185\u5bb9\u8d28\u91cf\u4e0e\u6210\u679c\u8868\u8fbe",
  D: "JD \u5173\u952e\u8bcd\u5339\u914d\u5ea6",
  E: "\u5730\u57df\u4e0e\u5e02\u573a\u9002\u914d\u5ea6",
  F: "\u804c\u4f4d\u76f8\u5173\u6027 / \u7ecf\u9a8c\u5339\u914d\u5ea6",
};

const SCORE_CAP_THRESHOLDS = {
  hardSkillCritical: 0.3,
  hardSkillLow: 0.45,
  hardSkillCriticalCap: 60,
  hardSkillLowCap: 70,
  jdMatchLow: 45,
  jdMatchLowCap: 75,
};

function clampRound(value, min = 0, max = 100) {
  const number = Number.isFinite(Number(value)) ? Number(value) : 0;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function pct(score, max) {
  const value = max ? score / max : 0;
  return Number(Math.max(0, Math.min(1, value)).toFixed(3));
}

function snakeCase(value) {
  return String(value || "unknown")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "unknown";
}

function isPlaceholderTitle(value) {
  return !value || /根据\s*JD\s*分析|依\s*JD\s*自动识别|unknown/i.test(String(value));
}

function titleCaseRole(value) {
  return String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function extractExplicitLabeledTitle(jdText) {
  const lines = String(jdText || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const positiveLabels = /^(?:\u3010?[\u5c97\u804c][\u4f4d\u79f0\u52a1]\u3011?|\u3010?\u6295\u9012\u5c97\u4f4d\u3011?|\u3010?\u5e94\u8058\u5c97\u4f4d\u3011?|position|job\s+title|role|title)\s*[\uff1a:]/i;
  const negativeLabels = /(?:\u516c\u53f8|\u4f01\u4e1a|\u7f51\u7ad9|\u5730\u70b9|\u5730\u5740|location|website|company)/i;
  const locationOnly = /^(?:\u65e7\u91d1\u5c71|\u5f17\u5409\u5c3c\u4e9a|\u7530\u7eb3\u897f|remote|hybrid|onsite|virginia|tennessee|california|new york|san francisco|bay area)\b|[,，]\s*(?:\u7530\u7eb3\u897f|tennessee|virginia|ca|ny|tx|tn|va)\b/i;
  for (const line of lines.slice(0, 30)) {
    if (!positiveLabels.test(line) || negativeLabels.test(line.split(/[\uff1a:]/)[0] || "")) continue;
    const value = line.replace(/^[^:\uff1a]+[:\uff1a]\s*/, "").replace(/[|;；].*$/, "").trim();
    if (!value || value.length > 90 || locationOnly.test(value)) continue;
    return value.replace(/\s+/g, " ").trim();
  }
  return null;
}

/**
 * Try to extract a job title directly from JD text.
 * Looks for explicit markers first, then falls back to first short capitalized line.
 */
function extractTitleFromJD(jdText) {
  if (!jdText || typeof jdText !== "string") return null;
  const lineLabeledTitle = extractExplicitLabeledTitle(jdText);
  if (lineLabeledTitle) return lineLabeledTitle;
  const text = jdText.trim();
  const explicitTitlePatterns = [
    /(?:^|\n)\s*(?:\u3010\u5c97\u4f4d\u3011|\u3010\u804c\u4f4d\u3011|\u3010\u804c\u79f0\u3011|\u5c97\u4f4d|\u804c\u4f4d|\u804c\u79f0|\u804c\u52a1|\u62db\u8058\u5c97\u4f4d|\u5e94\u8058\u5c97\u4f4d|\u6295\u9012\u5c97\u4f4d)\s*[\uff1a:]\s*([^\n\u3010]+)/g,
    /(?:^|\n)\s*(?:position|job\s+title|role|title)\s*[\uff1a:]\s*([^\n]+)/gi,
  ];
  const normalizeTitle = (value) => String(value || "")
    .replace(/\s*【.*$/, "")
    .replace(/[|;；].*$/, "")
    .replace(/\s*[（(](?:junior|senior|entry[-\s]?level|full[-\s]?time|part[-\s]?time|internship|intern|co-?op|new\s*grad|全职|兼职|实习|校招)[^）)]*[）)]\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  const roleNouns = /(engineer|developer|scientist|analyst|manager|management\s+trainee|trainee|designer|consultant|researcher|architect|specialist|associate|intern|coordinator|assistant|support|officer|director|lead|strategist|recruiter|writer|editor|实习|管培生|工程师|分析师|经理|顾问|研究员|设计师|专员|助理|主管|负责人|产品|运营|算法|机器学习|软件|前端|后端)/i;
  const locationWords = /\b(remote|hybrid|onsite|on-site|virginia|tennessee|california|new york|seattle|boston|austin|atlanta|miami|los angeles|wa|ca|ny|tx|fl|tn|va)\b|弗吉尼亚|田纳西|加州|纽约|西雅图|洛杉矶|亚特兰大|迈阿密|远程|地点|地区|城市/i;
  const sectionNoise = /responsibilities|requirements|qualifications|about us|description|summary|duties|tasks|projects|policies|procedures|goals|薪资|职责|要求|资格|福利|公司|公司介绍|我们|工作内容|任职要求|岗位职责/i;
  const seniorityPrefix = /^(?:Senior|Sr\.?|Junior|Jr\.?|Lead|Principal|Staff|Associate|Head\s+of|Mid[- ]Level|Entry[- ]Level|New\s+Grad)\s+/i;
  const isLikelyTitle = (value, allowNoRoleNoun = false) => {
    const title = normalizeTitle(value);
    if (!title || title.length < 2 || title.length > 80) return false;
    if (sectionNoise.test(title)) return false;
    if (locationWords.test(title) && !roleNouns.test(title)) return false;
    return allowNoRoleNoun || roleNouns.test(title);
  };

  // 1a. Explicit label markers (key: value format) — allowNoRoleNoun because these are definitive
  for (const re of explicitTitlePatterns) {
    for (const m of text.matchAll(re)) {
      const title = normalizeTitle(m[1]).replace(/[.!?\u3002\uff01\uff1f]$/, "").trim();
      const wordCount = title.split(/\s+/).filter(Boolean).length;
      if (wordCount <= 9 && title.length <= 80 && !locationWords.test(title)) return title;
    }
  }

  const strictLabelPatterns = [
    /【(?:岗位|职位|职称|职务|招聘岗位|应聘岗位)】\s*[：:]\s*([^\n【]+)/g,
    /^(?:岗位|职位|职称|职务|招聘职位|应聘职位)\s*[：:\-–]\s*(.+)/gm,
    /^(?:job\s+title|position\s+title|position|role\s+title|role|title|opening)\s*[:\-–]\s*(.+)/gim,
  ];
  for (const re of strictLabelPatterns) {
    for (const m of text.matchAll(re)) {
      const title = normalizeTitle(m[1]).replace(/[.!?。！？]$/, "").trim();
      const wordCount = title.split(/\s+/).length;
      if (wordCount <= 7 && isLikelyTitle(title, true)) return title;
    }
  }

  // 1b. Sentence-embedded hiring phrases — require roleNoun to avoid matching generic words like "someone"
  const sentencePatterns = [
    /(?:we(?:'re|\s+are)\s+(?:looking|hiring|seeking)\s+(?:for\s+)?(?:an?\s+)?)([\w\s\-\/]+?)(?:\s*(?:to\b|who\b|that\b|and\b|\.|,|$))/gi,
    /(?:join\s+us\s+as\s+(?:an?\s+)?)([\w\s\-\/]+?)(?:\s*(?:to\b|who\b|and\b|to\s+help\b|\.|,|$))/gi,
    /(?:\bhiring\s+(?:an?\s+)?)([\w\s\-\/]+?)(?:\s*(?:to\b|who\b|and\b|\.|,|!|$))/gi,
  ];
  for (const re of sentencePatterns) {
    for (const m of text.matchAll(re)) {
      const title = normalizeTitle(m[1]).replace(/[.!?。！？]$/, "").trim();
      const wordCount = title.split(/\s+/).length;
      if (wordCount <= 7 && isLikelyTitle(title, false)) return title;
    }
  }

  // 2. "As a/an/the [Title], ..." — extremely common in LinkedIn, Greenhouse, Lever JDs
  const asAPattern = /\bAs\s+(?:an?\s+|the\s+)((?:(?:Senior|Sr\.?|Junior|Jr\.?|Lead|Principal|Staff|Head|Associate|Entry[- ]Level|Mid[- ]Level)\s+)?(?:\w+(?:\s+\w+){0,4}))\s*,/gi;
  for (const m of text.matchAll(asAPattern)) {
    const title = normalizeTitle(m[1]).replace(/[.!?。！？]$/, "").trim();
    const wordCount = title.split(/\s+/).length;
    if (wordCount <= 6 && isLikelyTitle(title)) return title;
  }

  // 3. "The [Title] will/is responsible for/leads/manages..." — Indeed, Workday Role Summary style
  //    e.g. "The Senior Software Engineer will lead the delivery of..."
  const titleWillPattern = /\bThe\s+((?:(?:Senior|Sr\.?|Junior|Jr\.?|Lead|Principal|Staff|Associate|Head)\s+)?(?:\w+(?:\s+\w+){0,4}))\s+(?:will\b|is\s+responsible|leads?\b|manages?\b|oversees?\b|works?\s+(?:closely|with)\b)/gi;
  for (const m of text.matchAll(titleWillPattern)) {
    const title = normalizeTitle(m[1])
      .replace(/\s+(?:will|is|leads?|manages?|oversees?|works?)$/i, "")
      .replace(/[.!?。！？]$/, "")
      .trim();
    const wordCount = title.split(/\s+/).length;
    if (wordCount >= 2 && wordCount <= 6 && isLikelyTitle(title)) return title;
  }

  // 4. Title embedded after section intro headers like "Role Summary:", "About the Role:", "About This Position:"
  //    — scan the first paragraph of these sections for an embedded title
  const sectionIntroMatch = text.match(
    /^(?:role\s+summary|about\s+(?:the\s+)?(?:role|position|this\s+role|this\s+position|the\s+job)|position\s+(?:summary|overview)|job\s+(?:summary|overview))\s*[:\-–]?\s*\n+([\s\S]{0,600})/im
  );
  if (sectionIntroMatch) {
    const para = sectionIntroMatch[1].split(/\n\n/)[0];
    for (const re of [asAPattern, titleWillPattern]) {
      re.lastIndex = 0;
      for (const m of para.matchAll(re)) {
        const title = normalizeTitle(m[1]).replace(/[.!?。！？]$/, "").trim();
        const wordCount = title.split(/\s+/).length;
        if (wordCount >= 2 && wordCount <= 6 && isLikelyTitle(title)) return title;
      }
    }
  }

  // 5. First non-empty line that looks like a job title
  //    (short, not a sentence, not all-caps noise like "JOB DESCRIPTION")
  const beforeDuties = text.split(/(?:【\s*)?(?:岗位职责|工作职责|工作内容|responsibilities|duties)(?:\s*】)?\s*[：:]?/i)[0] || text;
  const lines = beforeDuties.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 8)) {
    if (/^(job\s+description|about\s+(us|the\s+role|this\s+role|this\s+position)|role\s+summary|position\s+(?:summary|overview)|job\s+(?:summary|overview)|overview|summary|responsibilities|requirements|qualifications)/i.test(line)) continue;
    if (/^[A-Z\s\-&]+$/.test(line) && line.length > 30) continue; // all-caps long header
    if (line.length < 3 || line.length > 70) continue;
    const wordCount = line.split(/\s+/).length;
    if (wordCount <= 6 && !/[.?!。？！]$/.test(line) && isLikelyTitle(line, false)) return normalizeTitle(line);
  }

  return null;
}

function inferCanonicalTargetRole(rawScoreResult, input = {}) {
  // Priority 1: user-typed jobTitle (most explicit)
  if (input.jobTitle && !isPlaceholderTitle(input.jobTitle)) {
    return { role: snakeCase(input.jobTitle), display: input.jobTitle };
  }

  // Priority 2: extract directly from JD label (Position:, 【岗位】: etc.) — exact beats generic patterns
  const labelExtracted = extractTitleFromJD(input.jdText);
  if (labelExtracted) {
    return { role: snakeCase(labelExtracted), display: labelExtracted };
  }

  const candidates = [
    rawScoreResult.jobTitle,
    rawScoreResult.metrics?.checks?.exactJobTitle?.targetTitle,
    ...(rawScoreResult.metrics?.keywordProfile?.target_role || []),
    rawScoreResult.metrics?.detectedTargetRole,
    rawScoreResult.profile?.targetRole,
  ].filter((value) => value && !isPlaceholderTitle(value));

  // Priority 3: candidates from score result
  const firstCandidate = candidates.find((value) => snakeCase(value) !== "general");
  if (firstCandidate) {
    return { role: snakeCase(firstCandidate), display: titleCaseRole(firstCandidate) };
  }

  // Priority 4: generic rolePatterns against full text (fallback only)
  const text = `${candidates.join(" ")} ${input.jdText || ""}`.toLowerCase();
  const rolePatterns = [
    { role: "software_development_engineer", display: "Software Development Engineer", pattern: /\bsoftware development engineer\b|\bsde\b/ },
    { role: "software_engineer", display: "Software Engineer", pattern: /\bsoftware engineer\b|\bswe\b|\bsoftware developer\b/ },
    { role: "full_stack_engineer", display: "Full Stack Engineer", pattern: /\bfull[-\s]?stack\b/ },
    { role: "frontend_engineer", display: "Frontend Engineer", pattern: /\bfront[-\s]?end\b/ },
    { role: "backend_engineer", display: "Backend Engineer", pattern: /\bback[-\s]?end\b/ },
    { role: "data_engineer", display: "Data Engineer", pattern: /\bdata engineer\b/ },
    { role: "data_analyst", display: "Data Analyst", pattern: /\bdata analyst\b/ },
    { role: "data_scientist", display: "Data Scientist", pattern: /\bdata scientist\b/ },
    { role: "machine_learning_engineer", display: "Machine Learning Engineer", pattern: /\bmachine learning engineer\b|\bml engineer\b/ },
    { role: "ai_engineer", display: "AI Engineer", pattern: /\bai engineer\b|\bartificial intelligence engineer\b/ },
    { role: "product_manager", display: "Product Manager", pattern: /\bproduct manager\b|\bsenior pm\b/ },
    { role: "product_designer", display: "Product Designer", pattern: /\bproduct designer\b/ },
    { role: "ux_designer", display: "UX Designer", pattern: /\bux designer\b|\bui\/ux\b|\bux\/ui\b/ },
    { role: "financial_analyst", display: "Financial Analyst", pattern: /\bfinancial analyst\b/ },
    { role: "investment_analyst", display: "Investment Analyst", pattern: /\binvestment analyst\b/ },
    { role: "accounting", display: "Accountant", pattern: /\baccountant\b|\baccounting\b/ },
    { role: "business_analyst", display: "Business Analyst", pattern: /\bbusiness analyst\b|\bba\b/ },
    { role: "marketing_manager", display: "Marketing Manager", pattern: /\bmarketing manager\b/ },
    { role: "marketing_analyst", display: "Marketing Analyst", pattern: /\bmarketing analyst\b/ },
    { role: "operations_manager", display: "Operations Manager", pattern: /\boperations manager\b/ },
    { role: "project_manager", display: "Project Manager", pattern: /\bproject manager\b|\bpmp\b/ },
    { role: "consultant", display: "Consultant", pattern: /\bconsultant\b/ },
    { role: "attorney", display: "Attorney", pattern: /\battorney\b|\blawyer\b/ },
    { role: "paralegal", display: "Paralegal", pattern: /\bparalegal\b/ },
    { role: "hr_manager", display: "HR Manager", pattern: /\bhr manager\b|\bhuman resources manager\b/ },
    { role: "recruiter", display: "Recruiter", pattern: /\brecruiter\b|\btalent acquisition\b/ },
    { role: "sales_representative", display: "Sales Representative", pattern: /\bsales representative\b|\baccount executive\b/ },
    { role: "research_analyst", display: "Research Analyst", pattern: /\bresearch analyst\b/ },
    { role: "supply_chain", display: "Supply Chain Analyst", pattern: /\bsupply chain\b/ },
  ];
  const matched = rolePatterns.find((item) => item.pattern.test(text));
  if (matched) return matched;

  return { role: "unknown", display: null };
}

function buildInternalJobTitle(rawScoreResult, input = {}) {
  const rawTitle = input.jobTitle || rawScoreResult.jobTitle || "";
  if (!isPlaceholderTitle(rawTitle)) return rawTitle || null;
  const explicitTitle = extractTitleFromJD(input.jdText);
  if (explicitTitle) return explicitTitle;
  const canonicalRole = inferCanonicalTargetRole(rawScoreResult, input);
  return canonicalRole.role === "unknown" ? "unknown" : canonicalRole.display;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildDimensions(rawScoreResult) {
  const dimensions = rawScoreResult.dimensions || {};
  const dimensionProblems = rawScoreResult.dimensionProblems || {};
  return Object.fromEntries(["A", "B", "C", "D", "E", "F"].map((key) => {
    const dim = dimensions[key] || {};
    const score = Number(dim.score || 0);
    const max = Number(dim.max || 0);
    return [key, {
      score,
      max,
      percentage: pct(score, max),
      label: dim.label || DIMENSION_LABELS[key],
      problems: asArray(dimensionProblems[key]),
    }];
  }));
}

function buildScoreCaps(rawScoreResult, scores) {
  const reasons = [];
  const hardSkillCoverage = Number(rawScoreResult.metrics?.keywordMatch?.matchMethod?.hardCoverage || 0) / 100;
  const exactJobTitle = rawScoreResult.metrics?.checks?.exactJobTitle;

  if (hardSkillCoverage < SCORE_CAP_THRESHOLDS.hardSkillCritical) {
    reasons.push({
      code: "LOW_HARD_SKILL_MATCH",
      message: "Hard skill coverage is below the configured critical threshold, so the total score is capped.",
      finalCap: SCORE_CAP_THRESHOLDS.hardSkillCriticalCap,
    });
  } else if (hardSkillCoverage < SCORE_CAP_THRESHOLDS.hardSkillLow) {
    reasons.push({
      code: "LOW_HARD_SKILL_MATCH",
      message: "Hard skill coverage is below the configured threshold, so the total score is capped.",
      finalCap: SCORE_CAP_THRESHOLDS.hardSkillLowCap,
    });
  }

  if (scores.jdMatch.score < SCORE_CAP_THRESHOLDS.jdMatchLow) {
    reasons.push({
      code: "LOW_JD_MATCH",
      message: "JD match score is below the configured threshold, so the total score is capped.",
      finalCap: SCORE_CAP_THRESHOLDS.jdMatchLowCap,
    });
  }

  if (exactJobTitle && !exactJobTitle.exact) {
    reasons.push({
      code: "MISSING_EXACT_JOB_TITLE",
      message: "Exact target job title is missing from the resume.",
    });
  }

  for (const cap of asArray(rawScoreResult.metrics?.checks?.scoreCaps)) {
    if (!reasons.some((reason) => reason.message === cap.reason)) {
      reasons.push({
        code: snakeCase(cap.reason).toUpperCase(),
        message: cap.reason,
        finalCap: cap.max || null,
      });
    }
  }

  const caps = reasons.map((reason) => reason.finalCap).filter((value) => Number.isFinite(value));
  return {
    applied: caps.length > 0,
    finalCap: caps.length ? Math.min(...caps) : null,
    reasons: reasons.map(({ code, message }) => ({ code, message })),
  };
}

function buildScores(rawScoreResult, dimensions) {
  const d = dimensions || buildDimensions(rawScoreResult);
  const scorePercent = (keys) => {
    const score = keys.reduce((sum, key) => sum + (d[key]?.score || 0), 0);
    const max = keys.reduce((sum, key) => sum + (d[key]?.max || 0), 0);
    return clampRound(max ? (score / max) * 100 : rawScoreResult.total || 0);
  };

  const searchabilityChecks = rawScoreResult.metrics?.checks || {};
  const searchabilityBonus = [
    searchabilityChecks.emailValid,
    searchabilityChecks.phoneValid,
    searchabilityChecks.hasLinkedIn,
    searchabilityChecks.hasPortfolio,
    searchabilityChecks.hasSummary,
  ].filter(Boolean).length;

  return {
    overall: {
      score: clampRound(rawScoreResult.total, 0, 100),
      max: 100,
      risk: rawScoreResult.risk || "\u4e2d",
    },
    resumeQuality: {
      score: scorePercent(["A", "B", "C"]),
      max: 100,
      label: "Resume Quality",
    },
    jdMatch: {
      score: scorePercent(["D", "F"]),
      max: 100,
      label: "JD Match",
    },
    searchability: {
      score: clampRound(scorePercent(["A", "B"]) * 0.8 + searchabilityBonus * 4, 0, 100),
      max: 100,
      label: "ATS Searchability",
    },
  };
}

function buildProfile(rawScoreResult, input = {}) {
  const rawProfile = rawScoreResult.profile || {};
  const canonicalRole = inferCanonicalTargetRole(rawScoreResult, input);
  const title = isPlaceholderTitle(input.jobTitle || rawScoreResult.jobTitle)
    ? canonicalRole.display
    : (input.jobTitle || rawScoreResult.jobTitle || "");
  const targetRole = canonicalRole.role && canonicalRole.role !== "unknown"
    ? canonicalRole.role
    : (canonicalRole.display || rawProfile.targetRole || snakeCase(title));
  const roleText = `${title} ${input.jdText || ""}`.toLowerCase();
  const roleProfile = buildRoleProfileFromContext({
    targetRole: canonicalRole.display || title || rawProfile.targetRole || "",
    internalAtsResult: {
      jobTitle: canonicalRole.display || title || rawProfile.targetRole || "",
      jdText: "",
      profile: rawProfile,
    },
    retrievalQuery: {
      jobTitle: canonicalRole.display || title || rawProfile.targetRole || "",
      jdText: "",
    },
  });
  const roleFamilyByTarget = {
    management_trainee: "management_trainee",
    machine_learning_engineer: "machine_learning",
    ai_engineer: "ai_engineer",
    data_scientist: "data_scientist",
    data_analyst: "data_analyst",
    software_engineer: "software_engineer",
    software_development_engineer: "software_engineer",
    backend_engineer: "software_engineer",
    frontend_engineer: "software_engineer",
    full_stack_engineer: "software_engineer",
  };
  const roleProfileFamily = roleProfile.canonicalRoleFamily && roleProfile.canonicalRoleFamily !== "other"
    ? roleProfile.canonicalRoleFamily
    : "";
  const roleFamily = roleProfileFamily || roleFamilyByTarget[targetRole]
    || (/\b(management trainee|graduate trainee|leadership development program|rotational program)\b/.test(roleText) || /管培/.test(roleText)
      ? "management_trainee"
      : /\b(machine learning engineer|ml engineer|mle|deep learning engineer)\b/.test(roleText)
      ? "machine_learning"
      : /\b(ai engineer|artificial intelligence engineer|llm engineer|generative ai engineer)\b/.test(roleText)
        ? "ai_engineer"
        : /\b(data scientist)\b/.test(roleText)
          ? "data_scientist"
          : /\b(data analyst|business intelligence|bi analyst)\b/.test(roleText)
            ? "data_analyst"
            : /\b(accountant|accounting|bookkeep|audit|tax|controller|cpa|accounts payable|accounts receivable)\b/.test(roleText)
              ? "accounting"
              : /\b(finance|financial|investment|fp&a|valuation|treasury)\b/.test(roleText)
                ? "finance"
                : /software|swe|sde|full.?stack|backend|frontend/.test(roleText)
                  ? "software_engineer"
                  : rawProfile.roleFamily || targetRole || "unknown");

  return {
    roleFamily,
    targetRole: targetRole === "general" ? "unknown" : targetRole,
    seniority: rawProfile.seniority || inferSeniority(roleText),
    candidateType: rawProfile.candidateType || inferCandidateType(roleText, rawProfile.seniority),
    yearsOfExperience: rawProfile.yearsOfExperience ?? null,
    degreeField: rawProfile.degreeField || null,
    market: rawProfile.market || "unknown",
    location: rawProfile.location || null,
    willingToRelocate: Boolean(rawProfile.willingToRelocate || rawScoreResult.metrics?.checks?.hasWillingToRelocate),
  };
}

function inferSeniority(text) {
  if (/student|intern/.test(text)) return "student";
  if (/new grad|graduate/.test(text)) return "new_grad";
  if (/senior|staff|principal|lead/.test(text)) return "senior";
  if (/mid/.test(text)) return "mid_level";
  if (/entry|junior|associate/.test(text)) return "entry_level";
  return "unknown";
}

function inferCandidateType(text, seniority) {
  if (seniority === "student" || /student|intern/.test(text)) return "student";
  if (seniority === "new_grad" || /new grad|graduate/.test(text)) return "new_grad";
  if (seniority === "entry_level" || seniority === "early_career") return "early_career";
  if (seniority === "mid_level" || seniority === "senior") return "experienced";
  return "unknown";
}

function buildDiagnostics(rawScoreResult, input = {}) {
  const diagnostics = rawScoreResult.diagnostics || {};
  const checks = rawScoreResult.metrics?.checks || {};
  const canonicalRole = inferCanonicalTargetRole(rawScoreResult, input);
  const internalTargetTitle = canonicalRole.role === "unknown" ? "unknown" : canonicalRole.display;
  return {
    searchability: {
      hasEmail: Boolean(diagnostics.searchability?.hasEmail ?? checks.emailValid),
      hasPhone: Boolean(diagnostics.searchability?.hasPhone ?? checks.phoneValid),
      hasLinkedIn: Boolean(diagnostics.searchability?.hasLinkedIn ?? checks.hasLinkedIn),
      hasPortfolio: Boolean(diagnostics.searchability?.hasPortfolio ?? checks.hasPortfolio),
      hasSummary: Boolean(diagnostics.searchability?.hasSummary ?? checks.hasSummary),
      hasEducation: Boolean(diagnostics.searchability?.hasEducation ?? true),
      hasExperience: Boolean(diagnostics.searchability?.hasExperience ?? true),
      hasSkills: true,
      dateFormattingValid: Boolean(diagnostics.searchability?.dateFormattingValid ?? !checks.inconsistentDates),
      wordCount: Number(diagnostics.searchability?.wordCount || 0),
    },
    jobTitleMatch: {
      exactMatch: Boolean(diagnostics.jobTitleMatch?.exactMatch ?? checks.exactJobTitle?.exact),
      targetTitle: internalTargetTitle,
      foundTitles: asArray(diagnostics.jobTitleMatch?.foundTitles),
      severity: diagnostics.jobTitleMatch?.severity || (checks.exactJobTitle?.exact === false ? "medium" : "none"),
    },
    measurableResults: {
      count: Number(diagnostics.measurableResults?.count || rawScoreResult.metrics?.quantifiedCount || 0),
      status: diagnostics.measurableResults?.status || "weak",
    },
    resumeTone: {
      hasNegativePhrases: false,
      flaggedPhrases: [],
    },
  };
}

function buildKeywordMatchV2(rawScoreResult) {
  const legacy = rawScoreResult.metrics?.keywordMatch || {};
  const matchMethod = legacy.matchMethod || {};
  const categories = {};
  for (const key of ["core_skills", "tools", "domain_keywords", "action_verbs", "nice_to_have"]) {
    const source = legacy[key] || {};
    categories[key] = {
      total: source.total || 0,
      matched: source.matched || 0,
      missing: asArray(source.missing),
      matchedTerms: asArray(source.matchedTerms).map((term) => ({ term, matchType: "exact" })),
    };
  }

  const toSkillGroup = (source = {}) => ({
    total: source.total || 0,
    matched: asArray(source.matchedTerms).length,
    missing: asArray(source.missing).length,
    matchedTerms: asArray(source.matchedTerms).map((term) => ({
      term,
      matchType: "exact",
      resumeCount: null,
      jdCount: null,
      locations: [],
    })),
    missingTerms: asArray(source.missing).map((term) => ({
      term,
      priority: "medium",
      safeToAdd: true,
      reason: "Relevant to the target role or job description.",
    })),
  });

  return {
    summary: {
      hardSkillCoverage: Number(((matchMethod.hardCoverage || 0) / 100).toFixed(3)),
      softSkillCoverage: Number(((matchMethod.softCoverage || 0) / 100).toFixed(3)),
      overallKeywordCoverage: Number(((matchMethod.combinedKeywordCoverage || rawScoreResult.metrics?.jdMatchRatio || 0) / 100).toFixed(3)),
    },
    categories,
    hardSkills: toSkillGroup(legacy.hard_skills),
    softSkills: toSkillGroup(legacy.soft_skills),
  };
}

function buildPriorityMissingKeywords(rawScoreResult) {
  return asArray(rawScoreResult.priorityMissingKeywords).map((item) => ({
    term: item.term,
    priority: item.priority || "medium",
    category: item.category || "hard_skill",
    safeToAdd: item.safeToAdd !== false,
    reason: item.reason || "Relevant to the target role.",
  }));
}

function buildProblemTags(internalAtsResult) {
  const tags = [];
  const add = (tag) => {
    if (!tag?.tag) return;
    const existingIndex = tags.findIndex((item) => item.tag === tag.tag);
    if (existingIndex === -1) {
      tags.push(tag);
      return;
    }
    const existing = tags[existingIndex];
    const strongerSeverity = severityRank(tag.severity) < severityRank(existing.severity);
    const strongerWeight = Number(tag.retrievalWeight || 0) > Number(existing.retrievalWeight || 0);
    if (strongerSeverity || strongerWeight) {
      tags[existingIndex] = {
        ...existing,
        ...tag,
        severity: strongerSeverity ? tag.severity : existing.severity,
        retrievalWeight: Math.max(Number(existing.retrievalWeight || 0), Number(tag.retrievalWeight || 0)),
      };
    }
  };
  asArray(internalAtsResult.problemTags).map(normalizeProblemTag).filter(Boolean).forEach(add);

  const dScore = internalAtsResult.dimensions?.D?.percentage || 0;
  const hardCoverage = internalAtsResult.keywordMatch?.summary?.hardSkillCoverage || 0;
  const titleExact = internalAtsResult.diagnostics?.jobTitleMatch?.exactMatch;
  const evidence = internalAtsResult.metrics?.checks?.coreSkillBulletCoverage;

  if (dScore < 0.55) add(tag("low_jd_keyword_match", "D", "keyword_alignment", "high", 0.85));
  if (hardCoverage < 0.45) add(tag("low_hard_skill_match", "D", "keyword_alignment", "high", 0.9));
  if (titleExact === false) add(tag("missing_exact_job_title", "F", "role_fit", "medium", 0.65));
  if (evidence != null && evidence < 0.4) add(tag("weak_experience_keyword_evidence", "C", "engineering_practices", "medium", 0.65));
  if (!tags.length || internalAtsResult.total >= 75) {
    add(tag("keyword_gap_minor", "D", "keyword_alignment", "low", 0.4));
    add(tag("career_growth_optimization", "F", "career_growth", "low", 0.35));
  }

  return tags.sort((a, b) => {
    const severityDiff = severityRank(a.severity) - severityRank(b.severity);
    if (severityDiff !== 0) return severityDiff;
    return Number(b.retrievalWeight || 0) - Number(a.retrievalWeight || 0);
  });
}

function normalizeProblemTag(item) {
  if (!item || !item.tag) return null;
  const mapping = {
    keyword_gap_critical: "low_jd_keyword_match",
    keyword_gap_major: "low_jd_keyword_match",
    keyword_gap_minor: "low_jd_keyword_match",
    insufficient_quantification: "low_measurable_results",
    weak_verbs: "weak_action_verbs",
    missing_tools: "low_hard_skill_match",
    low_bullet_coverage: "weak_experience_keyword_evidence",
    missing_summary: "missing_summary",
    no_relocate_signal: "missing_relocation_signal",
    short_tenure_unexplained: "short_tenure_unclear",
    missing_coursework: "education_details_missing",
    missing_gpa: "education_details_missing",
    role_mismatch: "weak_target_role_alignment",
    summary_missing_role: "weak_summary_role_alignment",
  };
  return {
    tag: mapping[item.tag] || item.tag,
    dimension: item.dimension || "overall",
    topic: normalizeTopic(item.topic),
    severity: normalizeSeverity(item.severity),
    retrievalWeight: Number(item.retrievalWeight || 0.4),
    evidence: item.evidence || `${item.tag} detected by ATS rules.`,
  };
}

function tag(tagName, dimension, topic, severity, retrievalWeight) {
  return {
    tag: tagName,
    dimension,
    topic,
    severity,
    retrievalWeight,
    evidence: `${tagName} detected by ATS rules.`,
  };
}

function normalizeTopic(topic) {
  const mapping = {
    resume_structure: "summary_positioning",
    career_positioning: "role_fit",
    tools_alignment: "keyword_alignment",
    resume_maintenance: "content_quality",
    education_completeness: "content_quality",
    career_narrative: "content_quality",
  };
  return mapping[topic] || topic || "content_quality";
}

function normalizeSeverity(value) {
  return ["critical", "high", "medium", "low"].includes(value) ? value : "medium";
}

function severityRank(value) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[value] ?? 9;
}

function buildTopInsights(internalAtsResult) {
  const lowTags = internalAtsResult.problemTags.filter((item) => item.severity === "low").slice(0, 3);
  const source = lowTags.length ? lowTags : internalAtsResult.problemTags.slice(-2);
  return dedupeInsights(source.map((item) => ({
    title: insightTitle(item),
    severity: item.severity,
    dimension: item.dimension,
    topic: item.topic,
    message: insightMessage(item),
    relatedTags: [item.tag],
  })));
}

function buildTopProblems(internalAtsResult) {
  return dedupeInsights(internalAtsResult.problemTags
    .filter((item) => ["critical", "high", "medium"].includes(item.severity))
    .map((item) => ({
      title: problemTitle(item),
      severity: item.severity,
      dimension: item.dimension,
      topic: item.topic,
      message: problemMessage(item),
      relatedTags: [item.tag],
    })));
}

function stripProblemTagForClient(item) {
  if (!item || !item.tag) return null;
  return {
    tag: item.tag,
    severity: item.severity,
    dimension: item.dimension,
    topic: item.topic,
    message: problemMessage(item),
    title: problemTitle(item),
    evidence: item.evidence || "",
  };
}

function dedupeInsights(items) {
  const byKey = new Map();
  for (const item of items) {
    const relatedTags = asArray(item.relatedTags).sort();
    const key = [
      item.title || "",
    ].join("|");
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, { ...item, relatedTags });
    } else {
      const mergedTags = [...new Set([...existing.relatedTags, ...relatedTags])].sort();
      byKey.set(key, {
        ...existing,
        severity: severityRank(item.severity) < severityRank(existing.severity) ? item.severity : existing.severity,
        relatedTags: mergedTags,
      });
    }
  }
  return [...byKey.values()]
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity))
    .slice(0, 3);
}

function insightTitle(item) {
  if (item.tag === "career_growth_optimization") return "\u53ef\u4ee5\u8fdb\u4e00\u6b65\u5f3a\u5316\u804c\u4e1a\u6210\u957f\u6545\u4e8b";
  return "\u5173\u952e\u8bcd\u5339\u914d\u5ea6\u4ecd\u6709\u5c0f\u5e45\u4f18\u5316\u7a7a\u95f4";
}

function insightMessage(item) {
  if (item.tag === "career_growth_optimization") {
    return "\u4f60\u7684\u7b80\u5386\u57fa\u7840\u4e0d\u9519\uff0c\u89e3\u9501\u540e\u53ef\u4ee5\u770b\u66f4\u5177\u4f53\u7684\u5bfc\u5e08\u5efa\u8bae\u6765\u63d0\u5347\u5b9a\u4f4d\u548c\u7ade\u4e89\u529b\u3002";
  }
  return "\u4f60\u7684\u7b80\u5386\u6574\u4f53\u5339\u914d\u5ea6\u8f83\u9ad8\uff0c\u4f46\u4ecd\u6709\u5c11\u91cf JD \u5173\u952e\u8bcd\u53ef\u4ee5\u66f4\u81ea\u7136\u5730\u8865\u8fdb Summary \u6216 Experience\u3002";
}

function problemTitle(item) {
  if (item.tag === "missing_summary") return "\u7f3a\u5c11 Summary \u5c97\u4f4d\u5b9a\u4f4d\u6bb5";
  if (item.tag === "low_hard_skill_match") return "\u6838\u5fc3\u786c\u6280\u80fd\u5339\u914d\u504f\u4f4e";
  if (item.tag === "missing_exact_job_title") return "\u7f3a\u5c11\u76ee\u6807\u5c97\u4f4d\u539f\u8bcd";
  if (item.tag === "low_measurable_results") return "\u53ef\u91cf\u5316\u6210\u679c\u4e0d\u8db3";
  if (item.tag === "missing_portfolio") return "\u7f3a\u5c11\u4f5c\u54c1\u96c6\u94fe\u63a5";
  if (item.tag === "missing_github_link") return "\u7f3a\u5c11\u4ee3\u7801\u6216\u9879\u76ee\u94fe\u63a5";
  return "JD \u5173\u952e\u8bcd\u5339\u914d\u5ea6\u504f\u4f4e";
}

const PROBLEM_MESSAGE_BY_TAG = {
  uploaded_non_pdf_format: "上传文件不是稳定的 PDF 格式，可能在不同系统里出现版式错乱或解析失败。",
  file_naming_issue: "简历文件名不够清晰专业，可能影响招聘方快速识别候选人和目标岗位。",
  formatting_penalty_triggered: "简历格式或版面解析存在风险，系统可能无法稳定读取关键信息。",
  missing_section_dates: "简历中有教育、项目或经历条目缺少年份/日期，时间线完整度不足。",
  inconsistent_date_format: "简历中的日期格式不统一，会降低版面专业度，也可能影响系统解析。",
  missing_contact_info: "简历顶部联系方式不完整，可能影响招聘方后续联系或初筛判断。",
  missing_linkedin: "简历中缺少 LinkedIn 链接，招聘方较难快速核验背景与职业轨迹。",
  missing_portfolio: "目标岗位需要通过作品集判断能力，但简历头部未检测到可点击的作品集链接。",
  missing_github_link: "目标岗位需要项目或代码证据，但简历中未检测到 GitHub 或相关代码链接。",
  education_details_missing: "Education 段落缺少关键细节，例如 GPA、相关课程、学位、毕业时间或学校信息。",
  missing_gpa: "Education 段落缺少 GPA；对早期职业或在校候选人来说，这会减少可筛选信号。",
  missing_coursework: "Education 段落缺少 Relevant Coursework，早期职业候选人的技能证据会偏弱。",
  missing_exp_location: "部分经历缺少地点或 Remote/Hybrid 信息，招聘方较难判断市场和工作场景匹配度。",
  missing_summary: "简历缺少 Summary 段落，HR 和 ATS 需要先有一条清晰的岗位定位线索，后续关键词补充才有承载位置。",
  missing_exact_job_title: "简历中未稳定出现目标岗位原词，可能影响 ATS 对职位定位的判断。",
  weak_summary_role_alignment: "Summary 和目标岗位的关联不够直接，HR 初筛时可能看不出你正在投这个方向。",
  weak_target_role_alignment: "简历整体还没有围绕目标岗位重新组织，相关技能、经历和成果之间的主线不够清楚。",
  generic_resume_positioning: "这份简历定位过于通用，像是在同时服务多个方向，目标岗位信号不够集中。",
  resume_not_tailored_to_jd: "简历内容还没有充分贴合当前 JD 的职责、关键词和表达方式。",
  keyword_gap_critical: "简历和目标 JD 的语言匹配严重不足，ATS 可能无法识别你和这个岗位的直接关联。",
  keyword_gap_major: "简历和目标 JD 的语言匹配还不够，ATS 可能无法快速识别你和这个岗位的直接关联。",
  keyword_gap_minor: "简历和目标 JD 仍有少量关键词缺口，可以进一步提升岗位匹配信号。",
  low_jd_keyword_match: "简历和目标 JD 的语言匹配还不够，ATS 可能无法快速识别你和这个岗位的直接关联。",
  missing_priority_keywords: "简历缺少目标 JD 中优先级较高的关键词，需要先补真实掌握、且能用经历支撑的技能词。",
  low_hard_skill_match: "核心硬技能覆盖不足，需要把有真实经验支撑的工具、技能和场景写进经历证据里。",
  missing_tools: "目标 JD 要求的工具或技术栈覆盖不足，简历需要补充真实使用过的工具证据。",
  low_soft_skill_match: "目标岗位需要的协作、沟通或领导力信号不足，经历表达偏少体现软技能证据。",
  weak_experience_keyword_evidence: "目标岗位的关键词在经历里缺少对应证据，只看 Skills 很难判断你是否真的做过相关工作。",
  keywords_only_in_skills: "部分关键词只堆在 Skills 区块，没有进入项目或经历要点，可信度会偏弱。",
  low_measurable_results: "经历中的结果证据偏少，建议提升百分比、规模、效率等量化表达。",
  insufficient_quantification: "经历中的结果证据偏少，建议提升百分比、规模、效率等量化表达。",
  weak_action_verbs: "经历要点中弱动词或被动表达偏多，行动 ownership 不够清楚。",
  weak_verbs: "经历要点中弱动词或被动表达偏多，行动 ownership 不够清楚。",
  passive_voice: "简历中被动语态偏多，会削弱你在项目和成果中的主动贡献感。",
  repetitive_verbs: "经历要点重复使用相同动作动词，表达层次和可读性会被削弱。",
  weak_result_orientation: "经历要点偏任务描述，缺少结果、业务影响或用户价值。",
  low_bullet_coverage: "核心技能在经历要点中的覆盖不足，技能列表和真实项目证据没有连起来。",
  short_tenure_unclear: "简历中有时长较短的经历，如果不标注 Intern / Internship 或说明项目周期，HR 可能会对稳定性产生疑虑。",
  short_tenure_unexplained: "简历中有时长较短的经历，如果不标注 Intern / Internship 或说明项目周期，HR 可能会对稳定性产生疑虑。",
  outdated_resume: "最近经历或简历内容看起来不够新，可能让招聘方怀疑当前状态没有更新。",
  missing_relocation_signal: "地点、工作授权、到岗方式或 relocation 信号不够清楚，可能影响招聘推进。",
  no_relocate_signal: "地点、工作授权、到岗方式或 relocation 信号不够清楚，可能影响招聘推进。",
  non_chronological_order: "工作经历没有按时间倒序排列，招聘方和系统都较难快速理解你的职业时间线。",
  job_title_mismatch: "简历中的职位名称或 headline 与目标 JD 的岗位名称不够一致，定位信号会被削弱。",
  role_mismatch: "简历整体方向和目标岗位存在偏差，需要重新突出最相关的技能与经历。",
  summary_missing_role: "Summary 没有明确承接目标岗位，开头定位信号不够稳定。",
  all_china_experience: "简历核心经历主要来自中国或非目标市场，需要强化可迁移能力证据，降低 HR 对市场适配度的疑虑。",
  partial_china_experience: "简历中有部分经历来自中国或非目标市场，需要补充更容易被目标市场 HR 理解的工具、场景和成果表达。",
  career_growth_optimization: "简历基础不错，但职业成长故事和竞争力表达仍有进一步强化空间。",
};

function problemMessage(item) {
  if (PROBLEM_MESSAGE_BY_TAG[item.tag]) return PROBLEM_MESSAGE_BY_TAG[item.tag];
  if (item.tag === "missing_summary") return "简历缺少 Summary 段落，HR 和 ATS 需要先有一条清晰的岗位定位线索，后续关键词补充才有承载位置。";
  if (item.tag === "missing_exact_job_title") return "\u7b80\u5386\u4e2d\u672a\u7a33\u5b9a\u51fa\u73b0\u76ee\u6807\u5c97\u4f4d\u539f\u8bcd\uff0c\u53ef\u80fd\u5f71\u54cd ATS \u5bf9\u804c\u4f4d\u5b9a\u4f4d\u7684\u5224\u65ad\u3002";
  if (item.tag === "missing_priority_keywords") return "\u7b80\u5386\u7f3a\u5c11\u76ee\u6807 JD \u4e2d\u4f18\u5148\u7ea7\u8f83\u9ad8\u7684\u5173\u952e\u8bcd\uff0c\u9700\u8981\u5148\u8865\u771f\u5b9e\u638c\u63e1\u3001\u4e14\u80fd\u7528\u7ecf\u5386\u652f\u6491\u7684\u6280\u80fd\u8bcd\u3002";
  if (item.tag === "low_jd_keyword_match") return "\u7b80\u5386\u548c\u76ee\u6807 JD \u7684\u8bed\u8a00\u5339\u914d\u8fd8\u4e0d\u591f\uff0cATS \u53ef\u80fd\u65e0\u6cd5\u5feb\u901f\u8bc6\u522b\u4f60\u548c\u8fd9\u4e2a\u5c97\u4f4d\u7684\u76f4\u63a5\u5173\u8054\u3002";
  if (item.tag === "low_measurable_results") return "\u7ecf\u5386\u4e2d\u7684\u7ed3\u679c\u8bc1\u636e\u504f\u5c11\uff0c\u5efa\u8bae\u63d0\u5347\u767e\u5206\u6bd4\u3001\u89c4\u6a21\u3001\u6548\u7387\u7b49\u91cf\u5316\u8868\u8fbe\u3002";
  if (item.tag === "low_hard_skill_match") return "\u6838\u5fc3\u786c\u6280\u80fd\u8986\u76d6\u4e0d\u8db3\uff0c\u9700\u8981\u628a\u6709\u771f\u5b9e\u7ecf\u9a8c\u652f\u6491\u7684\u5de5\u5177\u3001\u6280\u80fd\u548c\u573a\u666f\u5199\u8fdb\u7ecf\u5386\u8bc1\u636e\u91cc\u3002";
  if (item.tag === "weak_summary_role_alignment") return "Summary \u548c\u76ee\u6807\u5c97\u4f4d\u7684\u5173\u8054\u4e0d\u591f\u76f4\u63a5\uff0cHR \u521d\u7b5b\u65f6\u53ef\u80fd\u770b\u4e0d\u51fa\u4f60\u6b63\u5728\u6295\u8fd9\u4e2a\u65b9\u5411\u3002";
  if (item.tag === "weak_target_role_alignment") return "\u7b80\u5386\u6574\u4f53\u8fd8\u6ca1\u6709\u56f4\u7ed5\u76ee\u6807\u5c97\u4f4d\u91cd\u65b0\u7ec4\u7ec7\uff0c\u76f8\u5173\u6280\u80fd\u3001\u7ecf\u5386\u548c\u6210\u679c\u4e4b\u95f4\u7684\u4e3b\u7ebf\u4e0d\u591f\u6e05\u695a\u3002";
  if (item.tag === "weak_experience_keyword_evidence") return "\u76ee\u6807\u5c97\u4f4d\u7684\u5173\u952e\u8bcd\u5728\u7ecf\u5386\u91cc\u7f3a\u5c11\u5bf9\u5e94\u8bc1\u636e\uff0c\u53ea\u770b Skills \u5f88\u96be\u5224\u65ad\u4f60\u662f\u5426\u771f\u7684\u505a\u8fc7\u76f8\u5173\u5de5\u4f5c\u3002";
  if (item.tag === "short_tenure_unclear") return "\u7b80\u5386\u4e2d\u6709\u65f6\u957f\u8f83\u77ed\u7684\u7ecf\u5386\uff0c\u5982\u679c\u4e0d\u6807\u6ce8 Intern / Internship \u6216\u8bf4\u660e\u9879\u76ee\u5468\u671f\uff0cHR \u53ef\u80fd\u4f1a\u5bf9\u7a33\u5b9a\u6027\u4ea7\u751f\u7591\u8651\u3002";
  if (item.tag === "partial_china_experience") return "\u7b80\u5386\u4e2d\u6709\u90e8\u5206\u7ecf\u5386\u6765\u81ea\u4e2d\u56fd\u6216\u975e\u76ee\u6807\u5e02\u573a\uff0c\u9700\u8981\u8865\u5145\u66f4\u5bb9\u6613\u88ab\u76ee\u6807\u5e02\u573a HR \u7406\u89e3\u7684\u5de5\u5177\u3001\u573a\u666f\u548c\u6210\u679c\u8868\u8fbe\u3002";
  if (item.tag === "all_china_experience") return "\u7b80\u5386\u7684\u6838\u5fc3\u7ecf\u5386\u4e3b\u8981\u6765\u81ea\u4e2d\u56fd\u6216\u975e\u76ee\u6807\u5e02\u573a\uff0c\u5efa\u8bae\u5f3a\u5316\u53ef\u8fc1\u79fb\u7684\u80fd\u529b\u8bc1\u636e\uff0c\u964d\u4f4e HR \u5bf9\u5e02\u573a\u9002\u914d\u5ea6\u7684\u7591\u8651\u3002";
  if (item.tag === "missing_portfolio") return "\u76ee\u6807\u5c97\u4f4d\u9700\u8981\u901a\u8fc7\u4f5c\u54c1\u96c6\u5224\u65ad\u8bbe\u8ba1\u80fd\u529b\uff0c\u4f46\u7b80\u5386\u5934\u90e8\u672a\u68c0\u6d4b\u5230\u53ef\u70b9\u51fb\u7684\u4f5c\u54c1\u96c6\u94fe\u63a5\u3002";
  if (item.tag === "missing_github_link") return "\u76ee\u6807\u5c97\u4f4d\u9700\u8981\u9879\u76ee\u6216\u4ee3\u7801\u8bc1\u636e\uff0c\u4f46\u7b80\u5386\u4e2d\u672a\u68c0\u6d4b\u5230 GitHub \u6216\u76f8\u5173\u4ee3\u7801\u94fe\u63a5\u3002";
  return "\u4f60\u7684\u7b80\u5386\u7f3a\u5c11\u591a\u4e2a\u76ee\u6807\u5c97\u4f4d\u6838\u5fc3\u5173\u952e\u8bcd\uff0c\u53ef\u80fd\u5f71\u54cd ATS \u521d\u7b5b\u3002";
}

function looksLikeRawAtsDiagnostic(value = "") {
  return /detected by ATS rules|not found in resume|must-have keywords missing|keyword_gap_|^target title\b|^partial_china_experience\b|^all_china_experience\b/i.test(String(value || "").trim());
}

function userFacingProblemMessage(item = {}, fallback = "") {
  const raw = String(item.message || item.evidence || fallback || "").trim();
  if (!raw || looksLikeRawAtsDiagnostic(raw)) return problemMessage(item);
  return raw;
}

const PRIORITY_ACTION_BY_TAG = {
  uploaded_non_pdf_format: "将简历导出为 PDF 后再提交，确认打开后的版面、字体和链接都稳定可读。",
  file_naming_issue: "把上传文件名改成清楚的专业格式，例如 FirstName_LastName_Resume_TargetRole.pdf。",
  formatting_penalty_triggered: "先修复版面和解析风险：避免复杂表格、双栏错位、图片文字和不可复制文本。",
  missing_section_dates: "补齐教育、项目和经历条目的月份/年份，让时间线完整可判断。",
  inconsistent_date_format: "统一所有日期格式，例如全部使用 Jan 2024 - May 2024 或 01/2024 - 05/2024。",
  missing_contact_info: "补齐邮箱、电话、所在地和必要链接，并放在姓名下方的头部区域。",
  missing_linkedin: "在简历头部加入可点击 LinkedIn 链接，并确保页面内容与简历主线一致。",
  missing_portfolio: "在简历头部加入作品集链接，并优先展示 3-5 个最贴近目标岗位的项目。",
  missing_github_link: "为技术类项目补充 GitHub、repo、demo 或项目链接，让代码和实现证据可验证。",
  education_details_missing: "补齐 Education 里的学位、学校、毕业时间、相关课程或 GPA 等筛选信号。",
  missing_gpa: "如果 GPA 对当前阶段有帮助，把 GPA 加到 Education 中，并保持格式简洁。",
  missing_coursework: "为早期职业或转专业场景补上 Relevant Coursework，承接目标岗位关键词。",
  missing_exp_location: "为每段经历补充地点或 Remote/Hybrid 信息，降低市场和工作场景的不确定性。",
  missing_summary: "先添加 2-3 行个人简介段落，再写入目标岗位，并用一句证据说明最相关的经历或技能。",
  missing_exact_job_title: "把目标岗位原词自然写进个人简介段落或 headline。",
  weak_summary_role_alignment: "重写 Summary：第一句说明目标方向，第二句连接最相关技能、经历和成果。",
  weak_target_role_alignment: "按目标岗位重排简历重点，把最相关的技能、项目和成果提前。",
  generic_resume_positioning: "拆出面向当前目标岗位的版本，删减不服务这个方向的经历和技能。",
  resume_not_tailored_to_jd: "逐条对照 JD，把职责、工具和关键词改写进 Summary、Skills 和最相关经历。",
  keyword_gap_critical: "优先补齐真实项目或工作经历能支撑的岗位关键词。",
  keyword_gap_major: "优先补齐真实项目或工作经历能支撑的岗位关键词。",
  keyword_gap_minor: "把少量缺失的 JD 关键词自然补进 Summary、Skills 或最相关经历。",
  low_jd_keyword_match: "优先补齐真实项目或工作经历能支撑的岗位关键词。",
  missing_priority_keywords: "把高优先级 JD 关键词放进真实经历、项目或技能栏，不要只做关键词堆叠。",
  low_hard_skill_match: "把目标岗位要求的工具、技术和方法写进项目动作和结果证据里。",
  missing_tools: "补充真实使用过的工具/平台，并说明在项目中如何使用、解决了什么问题。",
  low_soft_skill_match: "在经历要点中加入协作、沟通、stakeholder 或领导力场景，并写清结果。",
  weak_experience_keyword_evidence: "把 Skills 中的核心关键词迁移到经历要点，用项目动作和结果支撑。",
  keywords_only_in_skills: "不要只把关键词放在 Skills；至少在一到两条经历 bullet 中写出使用场景。",
  low_measurable_results: "把靠前的经历要点改成「动作 + 方法 + 可量化结果」结构。",
  insufficient_quantification: "把靠前的经历要点改成「动作 + 方法 + 可量化结果」结构。",
  weak_action_verbs: "把 helped、responsible for、participated in 改成 led、built、analyzed、optimized 等主动动词。",
  weak_verbs: "把 helped、responsible for、participated in 改成 led、built、analyzed、optimized 等主动动词。",
  passive_voice: "把被动句改成主动句，明确你负责的动作、方法和产出。",
  repetitive_verbs: "替换重复动作动词，让每条经历要点体现不同能力层次。",
  weak_result_orientation: "为任务型 bullet 补上结果、影响对象或业务/用户价值。",
  low_bullet_coverage: "把核心技能写进更多经历要点，而不是只放在 Skills 清单。",
  short_tenure_unclear: "为短期经历标注 Intern/Contract/Project，或用一句话说明项目周期和职责边界。",
  short_tenure_unexplained: "为短期经历标注 Intern/Contract/Project，或用一句话说明项目周期和职责边界。",
  outdated_resume: "更新最近经历、项目和日期，确保简历反映当前求职状态。",
  missing_relocation_signal: "在 Summary 或头部补充 location、work authorization、relocation 或到岗方式相关信号。",
  no_relocate_signal: "在 Summary 或头部补充 location、work authorization、relocation 或到岗方式相关信号。",
  non_chronological_order: "将工作经历重新排列为时间倒序，最新经历放在最前面。",
  job_title_mismatch: "统一 headline、Summary 和经历标题里的岗位语言，让它贴近目标 JD。",
  role_mismatch: "围绕目标岗位重写 Summary 和前两段经历，减少偏离方向的信息。",
  summary_missing_role: "在 Summary 第一句明确目标岗位，并连接最相关的经历证据。",
  all_china_experience: "把非目标市场经历改写成目标市场可读的工具、场景和成果证据。",
  partial_china_experience: "把非目标市场经历聚焦到可迁移技能、业务结果和目标岗位相关工具上。",
  career_growth_optimization: "补强职业成长线：写清你能力升级、项目复杂度提升和影响范围扩大。",
};

function priorityActionForTag(item = {}) {
  if (PRIORITY_ACTION_BY_TAG[item.tag]) return PRIORITY_ACTION_BY_TAG[item.tag];
  return "围绕目标岗位重新检查这条问题对应的简历部分，把最相关的职责、关键词和结果证据写得更明确。";
}

function buildStructuredSuggestions(internalAtsResult) {
  const suggestions = [];
  let priority = 1;
  const add = (type, targetSection, message, relatedTags, relatedKeywords = [], unlockTier = "paid") => {
    suggestions.push({ type, priority: priority++, targetSection, message, relatedTags, relatedKeywords, unlockTier });
  };

  const hasMissingSummary = internalAtsResult.problemTags.some((item) => item.tag === "missing_summary");
  const hasMissingExactJobTitle = internalAtsResult.problemTags.some((item) => item.tag === "missing_exact_job_title");
  const targetTitle = internalAtsResult.diagnostics.jobTitleMatch.targetTitle;

  if (hasMissingSummary) {
    add(
      "structure_fix",
      "summary",
      "先添加 2-3 行个人简介段落，再写入目标岗位，并用一句证据说明最相关的经历或技能。",
      hasMissingExactJobTitle ? ["missing_summary", "missing_exact_job_title"] : ["missing_summary"],
      targetTitle ? [targetTitle] : [],
      "free"
    );
  } else if (hasMissingExactJobTitle) {
    add("keyword_fix", "summary", "把目标岗位原词自然写进个人简介段落。", ["missing_exact_job_title"], [internalAtsResult.diagnostics.jobTitleMatch.targetTitle], "free");
  }
  if (internalAtsResult.problemTags.some((item) => item.tag === "low_jd_keyword_match" || item.tag === "low_hard_skill_match")) {
    add("keyword_fix", "experience", "优先补齐真实项目或工作经历能支撑的岗位关键词。", ["low_jd_keyword_match", "low_hard_skill_match"], internalAtsResult.priorityMissingKeywords.slice(0, 3).map((item) => item.term), "paid");
  }
  if (internalAtsResult.problemTags.some((item) => item.tag === "low_measurable_results")) {
    add("content_fix", "experience", "把靠前的经历要点改成「动作 + 方法 + 可量化结果」结构。", ["low_measurable_results"], [], "paid");
  }

  const coveredTags = new Set(suggestions.flatMap((item) => asArray(item.relatedTags)));
  for (const problemTag of asArray(internalAtsResult.problemTags)) {
    if (!problemTag?.tag || coveredTags.has(problemTag.tag)) continue;
    add(
      "tag_fix",
      targetSectionForTag(problemTag.tag, problemTag.dimension),
      priorityActionForTag(problemTag),
      [problemTag.tag],
      asArray(problemTag.keywords),
      problemTag.severity === "critical" || problemTag.severity === "high" ? "paid" : "premium"
    );
    coveredTags.add(problemTag.tag);
  }

  for (const suggestion of asArray(internalAtsResult.suggestions).slice(0, 3)) {
    add("content_fix", "overall", suggestion, [], [], "premium");
  }

  return suggestions;
}

function coverageFamilyForTag(tagName = "", dimension = "overall") {
  if (/exact_job_title|summary|target_role|role_alignment|position|role_specificity/.test(tagName)) return "positioning";
  if (/keyword|hard_skill|priority_keyword|jd_match/.test(tagName)) return "keywords";
  if (/experience|evidence|skills_only|bullet|project_details/.test(tagName)) return "experience_evidence";
  if (/measurable|result|impact|action_verbs/.test(tagName)) return "impact";
  if (/short_tenure|intern|internship/.test(tagName)) return "tenure_clarity";
  if (/linkedin|github|portfolio|contact|link/.test(tagName)) return "profile_links";
  if (/education|gpa|coursework/.test(tagName)) return "education";
  if (/format|date|file|section|chronological|readability/.test(tagName)) return "format";
  if (dimension === "D") return "keywords";
  if (dimension === "F") return "positioning";
  if (dimension === "C") return "impact";
  if (dimension === "B") return "profile_completeness";
  if (dimension === "A") return "format";
  return "overall";
}

function targetSectionForTag(tagName = "", dimension = "overall") {
  if (/missing_summary/.test(tagName)) return "summary";
  if (/exact_job_title|summary|target_role|role_alignment|position/.test(tagName)) return "summary";
  if (/keyword|hard_skill|priority_keyword/.test(tagName)) return "skills";
  if (/experience|evidence|skills_only|measurable|result|impact|action_verbs|short_tenure|intern/.test(tagName)) return "experience";
  if (/github|portfolio|project/.test(tagName)) return "projects";
  if (/linkedin|contact|email|phone/.test(tagName)) return "header";
  if (/education|gpa|coursework/.test(tagName)) return "education";
  if (/format|date|file|chronological/.test(tagName)) return "overall";
  if (dimension === "D") return "skills";
  if (dimension === "F") return "summary";
  if (dimension === "C") return "experience";
  if (dimension === "B") return "header";
  return "overall";
}

function inferTagFromProblemText(value = "", dimension = "overall") {
  const text = String(value || "").toLowerCase();
  if (/intern|internship|short tenure|不足\s*3\s*个月|短期|在职时长/.test(text)) return "short_tenure_unclear";
  if (/exact title|job title|target title|岗位原词|职位名称/.test(text)) return "missing_exact_job_title";
  if (/keyword|jd|关键词|技能词|hard skill|aws|gcp|infrastructure/.test(text)) return "missing_priority_keywords";
  if (/summary|定位|求职方向/.test(text)) return "weak_summary_role_alignment";
  if (/experience|bullet|经历|证据|skills.*only|技能.*经历/.test(text)) return "weak_experience_keyword_evidence";
  if (/quant|metric|measurable|数字|量化|结果|成果/.test(text)) return "low_measurable_results";
  if (/linkedin/.test(text)) return "missing_linkedin";
  if (/github|repo|repository|代码/.test(text)) return "missing_github_link";
  if (/portfolio|作品集/.test(text)) return "missing_portfolio";
  if (/date|日期|时间线/.test(text)) return "missing_section_dates";
  if (/gpa|coursework|课程|教育/.test(text)) return "education_details_missing";
  if (dimension === "D") return "low_jd_keyword_match";
  if (dimension === "F") return "weak_target_role_alignment";
  if (dimension === "C") return "weak_result_orientation";
  if (dimension === "B") return "profile_completeness_gap";
  if (dimension === "A") return "format_structure_gap";
  return "resume_optimization_gap";
}

function weakDimensionMessage(key, dimension = {}) {
  const labels = {
    A: "文件与格式规范维度偏低，需要修复影响 ATS 读取和 HR 扫读的格式问题。",
    B: "基本资料完整性维度偏低，需要补齐联系方式、链接、教育或日期等基础可信信息。",
    C: "内容质量与成果表达维度偏低，需要把经历改成动作、方法/工具和量化结果结构。",
    D: "JD 关键词匹配维度偏低，需要补齐真实掌握的岗位关键词并放到合适位置。",
    E: "地域与市场适配维度偏低，需要补充能降低市场/地区疑虑的可信信号。",
    F: "职位相关性维度偏低，需要让 Summary 和核心经历更像目标岗位。",
  };
  return labels[key] || `${dimension.label || key} 维度得分偏低，需要针对这个维度补强简历证据。`;
}

function buildAdviceCoverageObligations(internalAtsResult) {
  const obligations = [];
  const add = (raw = {}) => {
    const tagName = raw.tag || inferTagFromProblemText(raw.message, raw.dimension);
    const dimension = raw.dimension || "overall";
    const severity = normalizeSeverity(raw.severity || (raw.required ? "high" : "medium"));
    const id = raw.id || `${raw.source || "ats"}:${dimension}:${tagName}:${obligations.length}`;
    if (obligations.some((item) => item.id === id)) return;
    obligations.push({
      id,
      tag: tagName,
      dimension,
      severity,
      targetSection: raw.targetSection || targetSectionForTag(tagName, dimension),
      message: userFacingProblemMessage({ tag: tagName, message: raw.message, evidence: raw.evidence, dimension }),
      keywords: asArray(raw.keywords).filter(Boolean),
      coverageFamily: raw.coverageFamily || coverageFamilyForTag(tagName, dimension),
      source: raw.source || "ats",
      required: raw.required !== false && ["critical", "high", "medium"].includes(severity),
    });
  };

  for (const item of asArray(internalAtsResult.problemTags)) {
    add({
      id: `problem:${item.tag}`,
      tag: item.tag,
      dimension: item.dimension,
      severity: item.severity,
      message: userFacingProblemMessage(item),
      source: "problemTags",
      required: ["critical", "high"].includes(item.severity),
    });
  }

  for (const item of asArray(internalAtsResult.topProblems)) {
    const relatedTag = asArray(item.relatedTags)[0] || inferTagFromProblemText(item.message, item.dimension);
    add({
      id: `topProblem:${relatedTag}`,
      tag: relatedTag,
      dimension: item.dimension,
      severity: item.severity,
      message: userFacingProblemMessage({ tag: relatedTag, message: item.message, dimension: item.dimension }),
      source: "topProblems",
      required: true,
    });
  }

  for (const item of asArray(internalAtsResult.structuredSuggestions)) {
    const relatedTag = asArray(item.relatedTags)[0] || inferTagFromProblemText(item.message, item.targetSection);
    add({
      id: `suggestion:${item.priority}:${relatedTag}`,
      tag: relatedTag,
      dimension: relatedTag === "missing_exact_job_title" ? "F" : undefined,
      severity: item.unlockTier === "free" ? "high" : "medium",
      targetSection: item.targetSection,
      message: userFacingProblemMessage({ tag: relatedTag, message: item.message }),
      keywords: item.relatedKeywords,
      coverageFamily: coverageFamilyForTag(relatedTag),
      source: "structuredSuggestions",
      required: true,
    });
  }

  for (const item of asArray(internalAtsResult.priorityMissingKeywords)) {
    add({
      id: `keyword:${String(item.term || "").toLowerCase()}`,
      tag: "missing_priority_keywords",
      dimension: "D",
      severity: item.priority === "high" ? "high" : "medium",
      targetSection: item.category === "hard_skill" ? "experience" : "skills",
      message: `简历中还缺少 JD 明确要求的关键词「${item.term}」，建议只在你真实掌握、且有经历可以支撑时补进简历。`,
      keywords: [item.term],
      coverageFamily: "keywords",
      source: "priorityMissingKeywords",
      required: item.priority === "high" || item.priority === "medium",
    });
  }

  for (const [dimensionKey, problems] of Object.entries(internalAtsResult.dimensionProblems || {})) {
    asArray(problems).forEach((problem, index) => {
      const message = typeof problem === "string" ? problem : (problem.message || problem.title || problem.evidence || "");
      const tagName = (problem && typeof problem === "object" && problem.tag) || inferTagFromProblemText(message, dimensionKey);
      add({
        id: `dimensionProblem:${dimensionKey}:${index}:${tagName}`,
        tag: tagName,
        dimension: dimensionKey,
        severity: (problem && typeof problem === "object" && problem.severity) || "medium",
        message,
        keywords: problem && typeof problem === "object" ? problem.keywords : [],
        source: "dimensionProblems",
        required: true,
      });
    });
  }

  const titleMatch = internalAtsResult.diagnostics?.jobTitleMatch;
  if (titleMatch?.exactMatch === false) {
    add({
      id: "diagnostic:missing_exact_job_title",
      tag: "missing_exact_job_title",
      dimension: "F",
      severity: titleMatch.severity || "medium",
      targetSection: "summary",
      message: userFacingProblemMessage({ tag: "missing_exact_job_title" }),
      keywords: [titleMatch.targetTitle].filter(Boolean),
      coverageFamily: "positioning",
      source: "diagnostics.jobTitleMatch",
      required: true,
    });
  }

  for (const [key, dimension] of Object.entries(internalAtsResult.dimensions || {})) {
    const percentage = Number(dimension.percentage || 0);
    if (dimension.max > 0 && percentage < 0.65) {
      const tagName = inferTagFromProblemText("", key);
      add({
        id: `weakDimension:${key}`,
        tag: tagName,
        dimension: key,
        severity: percentage < 0.45 ? "high" : "medium",
        message: weakDimensionMessage(key, dimension),
        coverageFamily: coverageFamilyForTag(tagName, key),
        source: "dimensions",
        required: true,
      });
    }
  }

  return obligations.sort((a, b) => {
    const severityDiff = severityRank(a.severity) - severityRank(b.severity);
    if (severityDiff !== 0) return severityDiff;
    if (a.required !== b.required) return a.required ? -1 : 1;
    return String(a.id).localeCompare(String(b.id));
  }).slice(0, 24);
}

function buildRetrievalQuery(internalAtsResult) {
  const topics = [...new Set(internalAtsResult.problemTags.map((tagItem) => tagItem.topic))].slice(0, 6);
  const problemTags = [...new Set(internalAtsResult.problemTags.map((tagItem) => tagItem.tag).filter(Boolean))].slice(0, 8);
  const priorityKeywords = internalAtsResult.priorityMissingKeywords
    .filter((item) => item.priority === "high" || item.priority === "medium")
    .map((item) => item.term)
    .slice(0, 6);
  const profile = internalAtsResult.profile;
  const targetRoles = [...new Set([profile.targetRole, profile.roleFamily, "universal"].filter(Boolean))];
  const seniority = [...new Set([profile.seniority, profile.candidateType, "universal"].filter(Boolean))];

  return {
    roleFamily: profile.roleFamily,
    targetRole: profile.targetRole,
    seniority: profile.seniority,
    candidateType: profile.candidateType,
    topics,
    problemTags,
    priorityKeywords,
    queryText: [profile.seniority, profile.targetRole, ...problemTags.slice(0, 4), ...topics.slice(0, 3)].filter(Boolean).join(" "),
    filters: {
      roleFamily: [profile.roleFamily, "universal"].filter(Boolean),
      targetRoles,
      seniority,
      topics,
    },
    resumeFacts: internalAtsResult.resumeFacts || null,
  };
}

function buildMentorAdviceSlots() {
  return {
    free: {
      count: 1,
      selectionStrategy: "highest_retrieval_score",
      requiredTags: [],
    },
    paid: {
      count: 3,
      selectionStrategy: "diverse_topics",
      preferredTopics: ["keyword_alignment", "summary_positioning", "experience_rewrite", "career_growth"],
    },
  };
}

function buildReportAssembly() {
  return {
    freeSections: ["ats_score", "top_insights", "one_mentor_advice", "locked_advice_preview"],
    paidSections: ["all_mentor_advice", "missing_keyword_checklist", "section_fix_plan", "ai_rewrite_cta"],
  };
}

function buildInternalAtsResult(rawScoreResult, input = {}) {
  const dimensions = buildDimensions(rawScoreResult);
  const scores = buildScores(rawScoreResult, dimensions);
  const jdMatchRatio = rawScoreResult.metrics?.jdMatchRatio ??
    (Number.isFinite(Number(rawScoreResult.jdMatchRatio)) ? Number((Number(rawScoreResult.jdMatchRatio) * 100).toFixed(1)) : null);
  const result = {
    engine: rawScoreResult.engine || "rule-based",
    version: REPORT_VERSION,
    scoringMode: SCORING_MODE,
    jobTitle: buildInternalJobTitle(rawScoreResult, input),
    resumeText: input.resumeText || rawScoreResult.resumeText || "",
    jdText: input.jdText || rawScoreResult.jdText || "",
    hasJD: Boolean(rawScoreResult.hasJD ?? input.jdText),
    total: scores.overall.score,
    jdMatchRatio,
    maxScore: 100,
    risk: rawScoreResult.risk || scores.overall.risk,
    formatPenaltyTriggered: Boolean(rawScoreResult.formatPenaltyTriggered),
    formatPenaltyReason: asArray(rawScoreResult.formatPenaltyReason),
    scores,
    scoreCaps: null,
    dimensions,
    profile: buildProfile(rawScoreResult, input),
    diagnostics: buildDiagnostics(rawScoreResult, input),
    keywordMatch: buildKeywordMatchV2(rawScoreResult),
    priorityMissingKeywords: buildPriorityMissingKeywords(rawScoreResult),
    problemTags: asArray(rawScoreResult.problemTags),
    adviceCoverageObligations: [],
    topInsights: [],
    topProblems: [],
    structuredSuggestions: [],
    retrievalQuery: null,
    resumeFacts: rawScoreResult.resumeFacts || rawScoreResult.hostedAtsResponse?.resumeFacts || null,
    mentorAdviceSlots: buildMentorAdviceSlots(),
    reportAssembly: buildReportAssembly(),
    metrics: rawScoreResult.metrics || {},
    topMissingKeywords: asArray(rawScoreResult.topMissingKeywords),
    problems: asArray(rawScoreResult.problems),
    suggestions: asArray(rawScoreResult.suggestions),
    dimensionProblems: rawScoreResult.dimensionProblems || {},
    improvement: rawScoreResult.improvement || {},
  };

  result.scoreCaps = buildScoreCaps(rawScoreResult, result.scores);
  result.keywordMatchCount = buildKeywordMatchCount(result);
  result.problemTags = buildProblemTags(result);
  result.topProblems = buildTopProblems(result);
  result.topInsights = buildTopInsights(result);
  result.structuredSuggestions = buildStructuredSuggestions(result);
  result.adviceCoverageObligations = buildAdviceCoverageObligations(result);
  result.retrievalQuery = buildRetrievalQuery(result);
  return result;
}

function formatInternalAtsResult(rawScoreResult, input = {}) {
  return buildInternalAtsResult(rawScoreResult, input);
}

function buildLockedPreview(paidAdvice) {
  return {
    lockedMentorCount: 3,
    lockedAdviceCount: 9,
    totalMentorCount: 4,
    totalAdviceCount: 12,
    topics: ["\u5173\u952e\u8bcd\u8865\u5145\u4f4d\u7f6e", "Summary \u5b9a\u4f4d\u5f3a\u5316", "Experience bullet \u4f18\u5316", "\u5c97\u4f4d\u5339\u914d\u7b56\u7565"],
    message: "\u89e3\u9501\u540e\u67e5\u770b 4 \u4f4d\u5bfc\u5e08\u7684 12 \u6761\u5b8c\u6574\u5efa\u8bae\uff0c\u8986\u76d6\u4f60\u7684\u4e3b\u8981 ATS \u95ee\u9898\u4e0e\u5206\u6bb5\u4fee\u6539\u8def\u5f84\u3002",
  };
}

function topicPreviewLabel(topicValue) {
  const labels = {
    keyword_alignment: "\u5173\u952e\u8bcd\u8865\u5145\u4f4d\u7f6e",
    summary_positioning: "Summary \u5b9a\u4f4d\u5f3a\u5316",
    experience_rewrite: "Experience bullet \u4f18\u5316",
    career_growth: "\u5c97\u4f4d\u5b9a\u4f4d\u5f3a\u5316",
  };
  return labels[topicValue] || "\u5bfc\u5e08\u4fee\u6539\u5efa\u8bae";
}

function reportAdviceText(item = {}) {
  return [
    item.title,
    item.currentDiagnosis,
    item.problemSummary,
    item.action,
    item.actionSummary,
    item.mentorInsight,
    item.mentorLens,
    item.reason,
    item.actionFamily,
    item.canonicalActionFamily,
    item.coverageFamily,
    ...(asArray(item.relatedProblemTags)),
  ].filter(Boolean).join(" ").toLowerCase();
}

function normalizeEvidenceForReport(item = {}) {
  const text = reportAdviceText(item);
  const familyEvidence = {
    positioning: ["岗位定位", "开头主线", "目标岗位"],
    keyword: ["JD 关键词", "ATS 匹配", item.targetSection === "skills" ? "Skills 排序" : "经历证据"],
    keywords: ["JD 关键词", "ATS 匹配", item.targetSection === "skills" ? "Skills 排序" : "经历证据"],
    experience_evidence: ["经历证据", "推进动作", "交付物"],
    impact_metrics: ["量化结果", "成果表达", "影响规模"],
    risk_explanation: ["经历性质", "项目边界", "稳定性风险"],
    junior_signal: ["课程/证书", "教育训练", "岗位能力证据"],
    cross_domain_transfer: ["可迁移能力", "跨领域表达", "目标岗位语言"],
    readability_structure: ["Section 顺序", "信息权重", "可读性"],
    technical_depth: ["技术深度", "项目方法", "工程证据"],
    business_data_context: ["业务场景", "数据应用", "结论价值"],
  };
  if (familyEvidence[item.coverageFamily]) return familyEvidence[item.coverageFamily];
  if (item.coverageFamily === "junior_signal" || item.actionFamily === "education_signal" || item.canonicalActionFamily === "education_signal") {
    return ["课程/证书", "教育训练", "岗位能力证据"];
  }
  if (/short tenure|internship|intern\b|project period|短期|实习|實習|项目周期|項目週期|稳定性|穩定性/.test(text)) {
    return ["经历性质", "项目边界", "稳定性风险"];
  }
  if (/cross-functional|collaboration|collaborat|teamwork|stakeholder|协作|協作|跨部门|跨部門|推进|推進|交付物|deliverable/.test(text)) {
    return ["经历证据", "推进动作", "交付物"];
  }
  if (/course|coursework|certificate|education|课程|課程|证书|證書|教育/.test(text)) {
    return ["课程/证书", "教育训练", "岗位能力证据"];
  }
  if (/quantif|metric|measurable|impact|成果|量化|数字|數字|规模|規模|效率/.test(text)) {
    return ["量化结果", "成果表达", "影响规模"];
  }
  const evidence = asArray(item.evidence).slice(0, 3);
  if (evidence.join(" ") === "经历性质 项目边界 稳定性风险") return ["经历证据", "推进动作", "交付物"];
  return evidence;
}

function stripCuratedAdviceItemForPublic(item = {}) {
  const stripMentorSource = (source) => source ? {
    mentorId: source.mentorId || null,
    mentorName: source.mentorName || "",
    company: source.company || "",
    companyLogo: source.companyLogo || null,
    mentorTitle: source.mentorTitle || "",
  } : null;
  return {
    adviceId: item.adviceId,
    title: item.title,
    currentDiagnosis: item.currentDiagnosis || item.problemSummary,
    problemSummary: item.problemSummary || item.currentDiagnosis,
    action: item.action || item.actionSummary,
    actionSummary: item.actionSummary || item.action,
    mentorLens: item.mentorLens || item.mentorInsight || item.reason || "",
    mentorInsight: item.mentorInsight || item.mentorLens || item.reason || "",
    hrPerspective: item.hrPerspective || item.HR_os || "",
    HR_os: item.HR_os || item.hrPerspective || "",
    targetSection: item.targetSection || "overall",
    priority: item.priority || "medium",
    topicCluster: item.topicCluster || item.displayAdviceType || "",
    displayAdviceType: item.displayAdviceType || item.topicCluster || "",
    actionSlot: item.actionSlot || "",
    actionFamily: item.actionFamily || item.canonicalActionFamily || "",
    canonicalActionFamily: item.canonicalActionFamily || item.actionFamily || "",
    coverageFamily: item.coverageFamily || "",
    displayPriority: item.displayPriority || 0,
    isPreviewWorthy: item.isPreviewWorthy !== false,
    attributionMode: item.attributionMode || "verified_original",
    sourceDisclosure: item.sourceDisclosure || "",
    originalMentorSource: stripMentorSource(item.originalMentorSource),
    displayedMentorSource: stripMentorSource(item.displayedMentorSource),
    mentorSource: stripMentorSource(item.mentorSource),
    mentorDisplayFit: item.mentorDisplayFit || "",
    mentorFitReason: item.mentorFitReason || "",
    displayMentorScore: item.displayMentorScore || 0,
    adviceSkillClusters: item.adviceSkillClusters || [],
    source: item.source || "db",
    mentorSourceType: item.mentorSourceType || null,
  };
}

function formatPublicFreeReport(internalAtsResult, freeAdvice, lockedPreview, curatedAdvice = null) {
  const riskBucket = riskToBucket(internalAtsResult.risk, internalAtsResult.total);
  const topProblems = riskBucket === "low" ? [] : internalAtsResult.topProblems.slice(0, 3);
  const topInsights = riskBucket === "high"
    ? []
    : internalAtsResult.topInsights.slice(0, riskBucket === "medium" ? 2 : 3);
  const freeSuggestions = asArray(internalAtsResult.suggestions).slice(0, 3);
  const freeMissingKeywords = asArray(internalAtsResult.topMissingKeywords).slice(0, 3);
  const publicProblems = topProblems
    .map((item) => item.message || item.title)
    .filter(Boolean)
    .slice(0, 3);

  return {
    engine: internalAtsResult.engine,
    version: internalAtsResult.version,
    schemaVersion: "ats_response_v0.2.0",
    scoringMode: internalAtsResult.scoringMode,
    jobTitle: (internalAtsResult.jobTitle === "unknown" || !internalAtsResult.jobTitle) ? null : internalAtsResult.jobTitle,
    hasJD: internalAtsResult.hasJD,
    total: internalAtsResult.total,
    jdMatchRatio: internalAtsResult.jdMatchRatio,
    risk: internalAtsResult.risk,
    scores: stripScoreLabels(internalAtsResult.scores),
    dimensions: stripDimensionProblems(internalAtsResult.dimensions),
    diagnostics: stripDiagnostics(internalAtsResult.diagnostics),
    topInsights: topInsights.map(stripInsight),
    topProblems: topProblems.map(stripInsight),
    freeMentorAdvice: freeAdvice ? stripFreeAdvice(freeAdvice) : null,
    lockedAdvicePreview: lockedPreview,
    keywordBreakdown: buildPublicKeywordBreakdown(internalAtsResult, 3),
    keywordMatchCount: buildKeywordMatchCount(internalAtsResult),
    topMissingKw: freeMissingKeywords,
    topMissingKeywords: freeMissingKeywords,
    resultPageAdviceItems: asArray(curatedAdvice?.resultPageAdviceItems).slice(0, 3).map(stripCuratedAdviceItemForPublic),
    problems: publicProblems,
    suggestions: freeSuggestions,
  };
}

function buildKeywordMatchCount(internalAtsResult) {
  const cats = internalAtsResult.keywordMatch?.categories || {};
  return Object.values(cats).reduce((acc, cat = {}) => {
    const total = Number(cat.total || 0);
    const matched = Number(cat.matched || (cat.matchedTerms || []).length || 0);
    acc.total += total;
    acc.matched += matched;
    return acc;
  }, { matched: 0, total: 0 });
}

function buildPublicKeywordBreakdown(internalAtsResult, visibleLimit = 3) {
  const cats = internalAtsResult.keywordMatch?.categories || {};
  const order = ["core_skills", "tools", "domain_keywords"];
  const labels = { core_skills: "核心技能", tools: "工具 / 技术", domain_keywords: "领域词" };
  let remaining = visibleLimit;
  return order
    .filter((k) => cats[k] && (cats[k].total > 0 || (cats[k].matchedTerms || []).length > 0 || (cats[k].missing || []).length > 0))
    .map((k) => {
      const cat = cats[k];
      const matched = (cat.matchedTerms || []).map((t) => (typeof t === "string" ? t : t.term)).filter(Boolean);
      const missing = (cat.missing || []).filter(Boolean);
      const visibleMissing = missing.slice(0, Math.max(remaining, 0));
      remaining -= visibleMissing.length;
      const visibleMatched = visibleMissing.length ? [] : matched.slice(0, Math.max(remaining, 0));
      remaining -= visibleMatched.length;
      return {
        key: k,
        label: labels[k] || k,
        matched: visibleMatched,
        missing: visibleMissing,
        total: cat.total || 0,
      };
    })
    .filter((cat) => cat.matched.length || cat.missing.length);
}

function riskToBucket(risk, total) {
  if (risk === "高" || risk === "high" || total < 55) return "high";
  if (risk === "中" || risk === "medium" || total < 75) return "medium";
  return "low";
}

function stripScoreLabels(scores) {
  return {
    overall: scores.overall,
    resumeQuality: { score: scores.resumeQuality.score, max: scores.resumeQuality.max },
    jdMatch: { score: scores.jdMatch.score, max: scores.jdMatch.max },
    searchability: { score: scores.searchability.score, max: scores.searchability.max },
  };
}

function stripDimensionProblems(dimensions) {
  return Object.fromEntries(Object.entries(dimensions).map(([key, value]) => [key, {
    score: value.score,
    max: value.max,
    percentage: value.percentage,
    label: value.label,
  }]));
}

function stripDiagnostics(diagnostics) {
  return {
    jobTitleMatch: {
      exactMatch: diagnostics.jobTitleMatch.exactMatch,
      targetTitle: (diagnostics.jobTitleMatch.targetTitle === "unknown" || !diagnostics.jobTitleMatch.targetTitle)
        ? null
        : diagnostics.jobTitleMatch.targetTitle,
      severity: diagnostics.jobTitleMatch.severity,
    },
  };
}

function stripInsight(item) {
  return {
    title: item.title,
    severity: item.severity,
    message: item.message,
  };
}

function stripFreeAdvice(item) {
  if (Array.isArray(item.adviceItems)) {
    return {
      mentorId: item.mentorId,
      mentorName: item.mentorName,
      company: item.company,
      companyLogo: item.companyLogo || null,
      mentorTitle: item.mentorTitle,
      mentorSubtitle: item.mentorSubtitle,
      badges: asArray(item.badges).slice(0, 4),
      matchReason: item.matchReason,
      mentorLogoPool: asArray(item.mentorLogoPool).slice(0, 16).map((mentor) => ({
        company: mentor.company,
        companyLogo: mentor.companyLogo || null,
      })),
      adviceItems: item.adviceItems.slice(0, 3).map((advice) => ({
        adviceId: advice.adviceId,
        title: advice.title,
        currentDiagnosis: advice.currentDiagnosis || advice.problemSummary,
        action: advice.action || advice.actionSummary,
        mentorLens: advice.mentorLens || advice.P_mentor || "",
        reason: advice.reason || advice.I_insight || "",
        mentorInsight: advice.mentorInsight || advice.I_insight || advice.mentorLens || advice.P_mentor || "",
        example: advice.example || "",
        rewriteExample: advice.rewriteExample || null,
        beforeAfter: advice.beforeAfter || null,
        hrPerspective: advice.hrPerspective || advice.HR_os || "",
        HR_os: advice.HR_os || advice.hrPerspective || "",
        targetSection: advice.targetSection || "overall",
        priority: advice.priority || "medium",
        priorityLabel: advice.priorityLabel || (advice.priority === "high" ? "必改" : advice.priority === "medium" ? "建议改" : "补充"),
        source: advice.source || "db",
        mentorSource: advice.mentorSource || null,
      })),
      careerPathDisplay: item.careerPathDisplay || null,
    };
  }
  return {
    adviceId: item.adviceId,
    title: item.title,
    problemSummary: item.problemSummary,
    actionSummary: item.actionSummary,
  };
}

function formatPremiumUnlockedReport(internalAtsResult, paidAdviceOrMentorReport) {
  const checklist = internalAtsResult.priorityMissingKeywords.slice(0, 20).map((item) => ({
    term: item.term,
    priority: item.priority,
    category: item.category,
    safeToAdd: item.safeToAdd,
    whereToAdd: item.category === "hard_skill" ? "Experience - first relevant role" : "Summary or Skills",
    reason: item.reason,
  }));

  const sectionFixPlan = {
    summary: internalAtsResult.structuredSuggestions.filter((item) => item.targetSection === "summary"),
    skills: internalAtsResult.structuredSuggestions.filter((item) => item.targetSection === "skills"),
    experience: internalAtsResult.structuredSuggestions.filter((item) => item.targetSection === "experience"),
    projects: internalAtsResult.structuredSuggestions.filter((item) => item.targetSection === "projects"),
    education: internalAtsResult.structuredSuggestions.filter((item) => item.targetSection === "education"),
  };
  const premiumKeywordBreakdown = buildPremiumKeywordBreakdown(internalAtsResult);

  const mentorReport = Array.isArray(paidAdviceOrMentorReport) && paidAdviceOrMentorReport.some((item) => Array.isArray(item.adviceItems))
    ? { mentors: paidAdviceOrMentorReport }
    : paidAdviceOrMentorReport;

  if (mentorReport && Array.isArray(mentorReport.mentors)) {
    const allAdviceItems = asArray(mentorReport.allAdviceItems).length
      ? asArray(mentorReport.allAdviceItems)
      : mentorReport.mentors.flatMap((mentor) => asArray(mentor.adviceItems));
    const stripMentorSource = (source) => source ? {
      mentorId: source.mentorId || null,
      mentorName: source.mentorName || "",
      company: source.company || "",
      companyLogo: source.companyLogo || null,
      mentorTitle: source.mentorTitle || "",
    } : null;
    const stripAdviceItem = (item) => ({
      adviceId: item.adviceId,
      title: item.title,
      problemSummary: item.problemSummary || item.currentDiagnosis,
      actionSummary: item.actionSummary || item.action,
      currentDiagnosis: item.currentDiagnosis || item.problemSummary,
      action: item.action || item.actionSummary,
      mentorLens: item.mentorLens || item.P_mentor || "",
      reason: item.reason || item.I_insight || "",
      evidence: normalizeEvidenceForReport(item),
      mentorInsight: item.mentorInsight || item.I_insight || item.mentorLens || item.P_mentor || "",
      example: item.example,
      rewriteExample: item.rewriteExample || null,
      beforeAfter: item.beforeAfter || null,
      hrPerspective: item.hrPerspective || item.HR_os || "",
      HR_os: item.HR_os || item.hrPerspective || "",
      targetSection: item.targetSection || "overall",
      topicCluster: item.topicCluster || "",
      matchReason: item.matchReason || "",
      mentorFitType: item.mentorFitType || "",
      relatedProblemTags: asArray(item.relatedProblemTags).slice(0, 5),
      priority: item.priority || "medium",
      actionSlot: item.actionSlot || "",
      actionFamily: item.actionFamily || item.canonicalActionFamily || "",
      canonicalActionFamily: item.canonicalActionFamily || item.actionFamily || "",
      coverageFamily: item.coverageFamily || "",
      duplicateGroupKey: item.duplicateGroupKey || "",
      displayPriority: item.displayPriority || 0,
      isPreviewWorthy: item.isPreviewWorthy !== false,
      mentorGroupLens: item.mentorGroupLens || "",
      mentorGroupReason: item.mentorGroupReason || "",
      attributionMode: item.attributionMode || "verified_original",
      sourceDisclosure: item.sourceDisclosure || "",
      originalMentorSource: stripMentorSource(item.originalMentorSource),
      displayedMentorSource: stripMentorSource(item.displayedMentorSource),
      source: item.source,
      mentorSource: stripMentorSource(item.mentorSource),
      mentorDisplayFit: item.mentorDisplayFit || "",
      mentorFitReason: item.mentorFitReason || "",
      displayMentorScore: item.displayMentorScore || 0,
      adviceSkillClusters: item.adviceSkillClusters || [],
    });
    return {
      mentors: mentorReport.mentors.slice(0, 4).map((mentor) => ({
        mentorId: mentor.mentorId,
        mentorName: mentor.mentorName,
        company: mentor.company,
        companyLogo: mentor.companyLogo || null,
        mentorTitle: mentor.mentorTitle,
        mentorSubtitle: mentor.mentorSubtitle,
        badges: asArray(mentor.badges).slice(0, 4),
        matchReason: mentor.matchReason,
        matchedProblems: asArray(mentor.matchedProblems).slice(0, 8),
        attributionMode: mentor.attributionMode || "",
        sourceDisclosure: mentor.sourceDisclosure || "",
        mentorGroupLens: mentor.mentorGroupLens || "",
        mentorGroupReason: mentor.mentorGroupReason || "",
        adviceItems: asArray(mentor.adviceItems).slice(0, 3).map(stripAdviceItem),
      })),
      reportPageMentorGroups: asArray(mentorReport.reportPageMentorGroups).map((mentor) => ({
        mentorId: mentor.mentorId,
        mentorName: mentor.mentorName,
        company: mentor.company,
        companyLogo: mentor.companyLogo || null,
        mentorTitle: mentor.mentorTitle,
        mentorSubtitle: mentor.mentorSubtitle,
        badges: asArray(mentor.badges).slice(0, 4),
        matchReason: mentor.matchReason,
        matchedProblems: asArray(mentor.matchedProblems).slice(0, 8),
        attributionMode: mentor.attributionMode || "",
        sourceDisclosure: mentor.sourceDisclosure || "",
        mentorGroupLens: mentor.mentorGroupLens || "",
        mentorGroupReason: mentor.mentorGroupReason || "",
        adviceItems: asArray(mentor.adviceItems).map(stripAdviceItem),
      })),
      curatedAdviceItems: asArray(mentorReport.curatedAdviceItems).map(stripAdviceItem),
      resultPageAdviceItems: asArray(mentorReport.resultPageAdviceItems).slice(0, 3).map(stripAdviceItem),
      allAdviceItems: allAdviceItems.map(stripAdviceItem),
      freeAdviceItems: allAdviceItems.slice(0, 3).map(stripAdviceItem),
      paidAdviceItems: allAdviceItems.slice(3).map(stripAdviceItem),
      mentorLogoPool: asArray(mentorReport.mentorLogoPool).slice(0, 16).map((mentor) => ({
        company: mentor.company,
        companyLogo: mentor.companyLogo || null,
      })),
      coverageSummary: mentorReport.coverageSummary || {
        totalProblemsDetected: 0,
        problemsCovered: 0,
        coverageRatio: 1,
        coveredProblemTags: [],
        uncoveredProblemTags: [],
        totalObligationsDetected: 0,
        obligationsCovered: 0,
        coveredObligationIds: [],
        uncoveredObligationIds: [],
      },
      problemTags: internalAtsResult.problemTags.map(stripProblemTagForClient).filter(Boolean),
      detailedSuggestions: internalAtsResult.structuredSuggestions,
      keywordBreakdown: premiumKeywordBreakdown,
      missingKeywordChecklist: checklist,
      sectionFixPlan,
    };
  }

  const paidAdvice = paidAdviceOrMentorReport;
  return {
    allMentorAdvice: asArray(paidAdvice).map((item) => ({
      adviceId: item.adviceId,
      title: item.title,
      problemSummary: item.problemSummary,
      actionSummary: item.actionSummary,
      mentorInsight: item.mentorInsight,
      example: item.example,
      rewriteExample: item.rewriteExample || null,
      beforeAfter: item.beforeAfter || null,
      mentorName: item.mentorName,
      topic: item.topic,
    })),
    missingKeywordChecklist: checklist,
    keywordBreakdown: premiumKeywordBreakdown,
    sectionFixPlan,
    detailedSuggestions: internalAtsResult.structuredSuggestions,
    problemTags: internalAtsResult.problemTags.map(stripProblemTagForClient).filter(Boolean),
  };
}

function buildPremiumKeywordBreakdown(internalAtsResult) {
  const cats = internalAtsResult.keywordMatch?.categories || {};
  const order = ["core_skills", "tools", "domain_keywords", "action_verbs", "nice_to_have"];
  const labels = {
    core_skills: "\u6838\u5fc3\u6280\u80fd",
    tools: "\u5de5\u5177 / \u6280\u672f",
    domain_keywords: "\u9886\u57df\u8bcd",
    action_verbs: "\u52a8\u4f5c\u8bcd",
    nice_to_have: "\u52a0\u5206\u9879",
  };
  return order
    .filter((key) => cats[key])
    .map((key) => {
      const cat = cats[key] || {};
      const matched = (cat.matchedTerms || []).map((term) => (typeof term === "string" ? term : term.term)).filter(Boolean);
      const missing = (cat.missing || []).filter(Boolean);
      return {
        key,
        label: labels[key] || key,
        matched,
        missing,
        total: cat.total || matched.length + missing.length,
      };
    })
    .filter((cat) => cat.total || cat.matched.length || cat.missing.length);
}

function formatDebugReport(internalAtsResult, mentorCandidates = []) {
  return {
    internalAtsResult,
    metrics: internalAtsResult.metrics,
    problemTags: internalAtsResult.problemTags,
    retrievalQuery: internalAtsResult.retrievalQuery,
    mentorCandidates,
  };
}

function createReportId() {
  return `rpt_${crypto.randomBytes(9).toString("hex")}`;
}

function createReportAccessToken() {
  return `rat_${crypto.randomBytes(24).toString("base64url")}`;
}

module.exports = {
  SCORE_CAP_THRESHOLDS,
  buildInternalAtsResult,
  buildScores,
  buildScoreCaps,
  buildDimensions,
  buildProfile,
  buildDiagnostics,
  buildKeywordMatchV2,
  buildPriorityMissingKeywords,
  buildProblemTags,
  buildAdviceCoverageObligations,
  buildTopInsights,
  buildTopProblems,
  buildStructuredSuggestions,
  buildRetrievalQuery,
  buildMentorAdviceSlots,
  buildReportAssembly,
  buildLockedPreview,
  formatInternalAtsResult,
  formatPublicFreeReport,
  formatPremiumUnlockedReport,
  formatDebugReport,
  createReportId,
  createReportAccessToken,
};
