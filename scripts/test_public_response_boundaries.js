"use strict";

const assert = require("assert");
const {
  formatPublicFreeReport,
  formatPremiumUnlockedReport,
} = require("../src/ats/report-formatter");
const {
  buildInsiderKnowledgeTip,
  buildGeneralInsiderTips,
  formatAdviceCardForPublic,
} = require("../services/mentorAdviceRetrieval");

function makeAdvice(id) {
  return {
    adviceId: `advice_${id}`,
    title: `Advice ${id}`,
    currentDiagnosis: `Problem diagnosis ${id}`,
    action: `Action ${id}`,
    evidence: [`hidden evidence ${id}`],
    relatedProblemTags: [`hidden_tag_${id}`],
    targetSection: id % 3 === 0 ? "experience" : id % 3 === 1 ? "summary" : "skills",
    priority: id <= 1 ? "high" : id <= 2 ? "medium" : "low",
  };
}

function makeInternalAtsResult() {
  return {
    engine: "ats-system-api",
    version: "0.2.0",
    scoringMode: "external_ats_like",
    jobTitle: "Machine Learning Engineer",
    hasJD: true,
    total: 48,
    jdMatchRatio: 24,
    maxScore: 100,
    risk: "高",
    scores: {
      overall: { score: 48, max: 100 },
      resumeQuality: { score: 55, max: 100 },
      jdMatch: { score: 24, max: 100 },
      searchability: { score: 60, max: 100 },
    },
    dimensions: {
      A: { score: 6, max: 8, percentage: 0.75, label: "Format", problems: ["hidden A problem"] },
      B: { score: 4, max: 7, percentage: 0.57, label: "Contact", problems: ["hidden B problem"] },
      C: { score: 6, max: 12, percentage: 0.5, label: "Content", problems: ["hidden C problem"] },
      D: { score: 8, max: 45, percentage: 0.18, label: "Keywords", problems: ["hidden D problem"] },
      E: { score: 4, max: 5, percentage: 0.8, label: "Market", problems: ["hidden E problem"] },
      F: { score: 7, max: 23, percentage: 0.3, label: "Role", problems: ["hidden F problem"] },
    },
    diagnostics: {
      searchability: {
        hasEmail: false,
        hasPhone: false,
        hasLinkedIn: false,
        hasPortfolio: false,
      },
      jobTitleMatch: {
        exactMatch: false,
        targetTitle: "Machine Learning Engineer",
        severity: "high",
      },
      measurableResults: {
        count: 1,
        status: "weak",
      },
    },
    keywordMatch: {
      categories: {
        core_skills: {
          total: 6,
          matchedTerms: ["Python"],
          missing: ["PyTorch", "TensorFlow", "model deployment", "RAG"],
        },
        tools: {
          total: 4,
          matchedTerms: ["Git"],
          missing: ["Docker", "Kubernetes"],
        },
      },
    },
    priorityMissingKeywords: [
      { term: "PyTorch", priority: "must_have", category: "hard_skill" },
      { term: "TensorFlow", priority: "must_have", category: "hard_skill" },
      { term: "model deployment", priority: "high", category: "hard_skill" },
      { term: "RAG", priority: "high", category: "hard_skill" },
    ],
    problemTags: [
      { tag: "low_jd_keyword_match", severity: "critical", dimension: "D", topic: "keyword_alignment" },
      { tag: "missing_priority_keywords", severity: "high", dimension: "D", topic: "keyword_alignment" },
      { tag: "weak_summary_role_alignment", severity: "medium", dimension: "F", topic: "summary_positioning" },
      { tag: "low_measurable_results", severity: "medium", dimension: "C", topic: "content_quality" },
    ],
    topProblems: [
      { title: "Problem 1", severity: "critical", message: "Visible problem 1" },
      { title: "Problem 2", severity: "high", message: "Visible problem 2" },
      { title: "Problem 3", severity: "medium", message: "Visible problem 3" },
      { title: "Problem 4", severity: "medium", message: "Hidden problem 4" },
    ],
    topInsights: [],
    structuredSuggestions: [
      { targetSection: "summary", type: "section_rewrite", message: "Hidden structured suggestion 1" },
      { targetSection: "skills", type: "keyword_fix", message: "Hidden structured suggestion 2" },
    ],
    retrievalQuery: { problemTags: ["hidden"] },
    mentorAdviceSlots: { free: { count: 1 }, paid: { count: 3 } },
    reportAssembly: { freeSections: ["ats_score"], paidSections: ["all_mentor_advice"] },
    metrics: { keywordMatch: { hidden: true } },
    topMissingKeywords: ["PyTorch", "TensorFlow", "model deployment", "RAG"],
    problems: ["Problem A", "Problem B", "Problem C", "Problem D"],
    suggestions: ["Suggestion A", "Suggestion B", "Suggestion C", "Suggestion D"],
    dimensionProblems: { D: ["hidden dimension issue"] },
    improvement: "hidden improvement estimate",
  };
}

function assertNoFreeLeak(publicReport) {
  const forbidden = [
    "problemTags",
    "retrievalQuery",
    "mentorAdviceSlots",
    "reportAssembly",
    "keywordMatch",
    "priorityMissingKeywords",
    "structuredSuggestions",
    "scoreCaps",
    "metrics",
    "dimensionProblems",
    "premiumReport",
    "premiumMentors",
    "premiumAdviceItems",
  ];
  for (const key of forbidden) {
    assert.equal(Object.prototype.hasOwnProperty.call(publicReport, key), false, `free response leaked ${key}`);
  }
}

function main() {
  const internal = makeInternalAtsResult();
  const adviceItems = Array.from({ length: 12 }, (_, i) => makeAdvice(i + 1));
  const freeAdvice = {
    mentorId: "mentor_free",
    mentorName: "Free Mentor",
    company: "Example",
    adviceItems,
    matchedProblems: ["hidden matched problem"],
    mentorLogoPool: [{ company: "Example", companyLogo: "/logos/example.png" }],
  };
  const lockedPreview = {
    lockedMentorCount: 3,
    lockedAdviceCount: 9,
    totalMentorCount: 4,
    totalAdviceCount: 12,
    topics: ["keyword", "summary", "experience"],
  };

  const publicReport = formatPublicFreeReport(internal, freeAdvice, lockedPreview);
  assertNoFreeLeak(publicReport);
  assert.ok((publicReport.problems || []).length <= 3);
  assert.ok((publicReport.suggestions || []).length <= 3);
  assert.ok((publicReport.topProblems || []).length <= 3);
  assert.ok((publicReport.topMissingKw || []).length <= 3);
  assert.ok((publicReport.topMissingKeywords || []).length <= 3);
  assert.equal(publicReport.freeMentorAdvice.adviceItems.length, 3);
  assert.equal(Object.prototype.hasOwnProperty.call(publicReport.freeMentorAdvice, "matchedProblems"), false);
  for (const item of publicReport.freeMentorAdvice.adviceItems) {
    assert.equal(Object.prototype.hasOwnProperty.call(item, "relatedProblemTags"), false);
    assert.equal(Object.prototype.hasOwnProperty.call(item, "evidence"), false);
  }
  const keywordPreviewCount = (publicReport.keywordBreakdown || []).reduce(
    (sum, group) => sum + (group.matched || []).length + (group.missing || []).length,
    0
  );
  assert.ok(keywordPreviewCount <= 3);
  assert.equal(Object.prototype.hasOwnProperty.call(publicReport.diagnostics || {}, "searchability"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(publicReport.diagnostics || {}, "measurableResults"), false);

  const publicReportEn = formatPublicFreeReport(internal, freeAdvice, lockedPreview, null, { locale: "en-US" });
  assert.equal(publicReportEn.locale, "en-US");
  assert.equal(publicReportEn.freeMentorAdvice.adviceItems[0].priorityLabel, "Must fix");

  const mentors = [0, 1, 2, 3].map((mentorIndex) => ({
    mentorId: `mentor_${mentorIndex + 1}`,
    mentorName: `Mentor ${mentorIndex + 1}`,
    matchedProblems: [`paid_matched_problem_${mentorIndex + 1}`],
    adviceItems: adviceItems.slice(mentorIndex * 3, mentorIndex * 3 + 3),
  }));
  const premiumReport = formatPremiumUnlockedReport(internal, {
    mentors,
    allAdviceItems: adviceItems,
    mentorLogoPool: [{ company: "Example", companyLogo: "/logos/example.png" }],
  });

  assert.equal(premiumReport.allAdviceItems.length, 12);
  assert.equal(premiumReport.freeAdviceItems.length, 3);
  assert.equal(premiumReport.paidAdviceItems.length, 9);
  assert.deepEqual(
    premiumReport.freeAdviceItems.map((item) => item.adviceId),
    publicReport.freeMentorAdvice.adviceItems.map((item) => item.adviceId),
    "paid unlock must include the same first 3 advice items shown for free"
  );
  assert.ok(premiumReport.mentors.every((mentor) => mentor.adviceItems.length <= 3));

  const premiumReportEn = formatPremiumUnlockedReport(internal, {
    mentors,
    allAdviceItems: adviceItems,
    mentorLogoPool: [{ company: "Example", companyLogo: "/logos/example.png" }],
  }, { locale: "en-US" });
  assert.equal(premiumReportEn.locale, "en-US");
  assert.equal(premiumReportEn.keywordBreakdown[0].label, "Core skills");
  assert.equal(premiumReportEn.allAdviceItems[0].priorityLabel, "Must fix");

  const localizedCard = formatAdviceCardForPublic({
    id: 9001,
    chunk_id: "chunk_9001",
    advice_card_title: "中文标题",
    advice_card_title_en: "Use targeted resume positioning",
    user_problem_summary: "中文问题",
    user_problem_summary_en: "The resume is not positioned for the target role.",
    action_summary: "中文动作",
    action_summary_en: "Rewrite the summary and first experience bullet around the target JD.",
    problem_tags: "weak_target_role_alignment",
    unlock_tier: "free",
    safe_to_show_free: 1,
  }, { locale: "en-US" });
  assert.equal(localizedCard.title, "Use targeted resume positioning");
  assert.equal(localizedCard.problemSummary, "The resume is not positioned for the target role.");
  assert.ok(localizedCard.actionSummary.includes("target JD"));

  const insiderTip = buildInsiderKnowledgeTip(
    {
      I_insight: "Recruiters for this team screen for React API ownership and production delivery evidence.",
      mentor_company: "Example",
      mentor_quality_score: 0.8,
    },
    {
      targetRole: "software_development_engineer",
      priorityKeywords: ["r", "React", "API"],
    }
  );
  assert.ok(!insiderTip.relevanceReason.includes("software_development_engineer"));
  assert.equal(insiderTip.relevanceReason, "与你申请的 Software Development Engineer 方向相关。");

  const generalInsiderTips = buildGeneralInsiderTips({ targetRole: "financial_analyst" }, 2);
  assert.equal(generalInsiderTips.length, 2);
  assert.equal(generalInsiderTips[0].source, "fallback");
  assert.ok(generalInsiderTips[0].relevanceReason.includes("Financial Analyst"));
  assert.ok(generalInsiderTips[0].sourceMentorName);

  console.log("public response boundary tests passed");
}

main();
