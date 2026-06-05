"use strict";

const assert = require("assert");
const { formatInternalAtsResult } = require("../src/ats/report-formatter");
const {
  selectFreeMentorPlan,
  selectPremiumMentorPlan,
  formatPremiumMentorReport,
} = require("../services/mentorAdviceRetrieval");

const resumeText = `
Chris Lin
chris@example.com | 555-777-1111 | linkedin.com/in/chrislin

Summary
IT support graduate with help desk and campus network troubleshooting experience.

Skills
Linux, Windows, TCP/IP, DNS, ticketing, network monitoring

Experience
IT Assistant, Campus Lab, Taipei
- Supported student lab computers and responded to network issues.
- Checked router and switch connectivity during lab incidents.

Operations Assistant, Local ISP, Taipei
- Helped monitor service tickets.

Education
B.S. Information Systems, Example University, 2025
`;

const jdText = `
Network Operator (Junior full-time)
Responsibilities include monitoring IT infrastructure, responding to network incidents,
supporting AWS and GCP cloud environments, troubleshooting connectivity, documenting
operational runbooks, and escalating incidents.
`;

const internal = formatInternalAtsResult({
  engine: "rule-based",
  version: "0.2.0",
  jobTitle: "Network Operator (Junior full-time)",
  hasJD: true,
  total: 38,
  risk: "high",
  dimensions: {
    A: { score: 4, max: 8 },
    B: { score: 5, max: 7 },
    C: { score: 4, max: 12 },
    D: { score: 6, max: 45 },
    E: { score: 3, max: 5 },
    F: { score: 5, max: 23 },
  },
  dimensionProblems: {
    C: [
      "在职时长不足 3 个月的经历请明确标注 Intern/Internship。",
      "经历描述缺少动作 + 方法/工具 + 量化结果。",
    ],
    D: ["优先补齐 JD 缺失技能：gcp、it infrastructure、aws。"],
    F: ["Summary 缺少 exact target title：Network Operator (Junior full-time)。"],
  },
  metrics: {
    checks: {
      exactJobTitle: { exact: false, targetTitle: "Network Operator (Junior full-time)" },
      coreSkillBulletCoverage: 0.2,
    },
    keywordMatch: {
      matchMethod: { hardCoverage: 15, combinedKeywordCoverage: 18 },
      hard_skills: {
        total: 6,
        matchedTerms: ["network monitoring"],
        missing: ["aws", "gcp", "it infrastructure"],
      },
    },
  },
  priorityMissingKeywords: [
    { term: "aws", priority: "high", category: "hard_skill" },
    { term: "gcp", priority: "high", category: "hard_skill" },
    { term: "it infrastructure", priority: "high", category: "hard_skill" },
  ],
  problemTags: [
    { tag: "missing_exact_job_title", severity: "high", dimension: "F", topic: "role_fit", retrievalWeight: 0.9 },
    { tag: "low_jd_keyword_match", severity: "high", dimension: "D", topic: "keyword_alignment", retrievalWeight: 0.9 },
    { tag: "low_hard_skill_match", severity: "high", dimension: "D", topic: "keyword_alignment", retrievalWeight: 0.9 },
    { tag: "weak_experience_keyword_evidence", severity: "medium", dimension: "C", topic: "experience_rewrite", retrievalWeight: 0.7 },
    { tag: "low_measurable_results", severity: "high", dimension: "C", topic: "experience_rewrite", retrievalWeight: 0.85 },
    { tag: "short_tenure_unclear", severity: "high", dimension: "C", topic: "content_quality", retrievalWeight: 0.8 },
  ],
  topMissingKeywords: ["aws", "gcp", "it infrastructure"],
  suggestions: [
    "把目标岗位关键词写进 Summary、Skills 和最相关的 Experience bullet，避免只堆在技能列表。",
  ],
}, {
  jobTitle: "Network Operator (Junior full-time)",
  jdText,
  resumeText,
});

assert.ok(internal.adviceCoverageObligations.length >= 6);

const freePlan = selectFreeMentorPlan([], internal);
const premiumPlan = selectPremiumMentorPlan([], internal, freePlan);
const premiumReport = formatPremiumMentorReport(premiumPlan, internal);
const allItems = premiumReport.allAdviceItems;
const premiumAdviceCount = premiumPlan.reduce((sum, mentor) => sum + mentor.adviceItems.length, 0);

assert.ok(premiumAdviceCount > 0);
assert.ok(premiumAdviceCount <= 12);
assert.equal(new Set(allItems.map((item) => item.adviceId)).size, allItems.length);
assert.ok(premiumReport.coverageSummary.totalObligationsDetected >= 6);

const adviceText = allItems.flatMap((item) => [
  item.title,
  item.currentDiagnosis,
  item.action,
  item.mentorInsight,
  item.example,
]).join(" ").toLowerCase();

assert.ok(adviceText.includes("network operator"), "fallback advice should mention target role");
assert.ok(
  ["aws", "gcp", "it infrastructure"].some((term) => adviceText.includes(term)),
  "fallback advice should mention at least one missing JD skill"
);
assert.ok(/intern|internship|short tenure|经历/.test(adviceText), "fallback advice should mention experience evidence or tenure");

assert.equal(
  /battery scandal|pr crisis|public relations crisis|当前报告可用的导师建议不足 12 条/.test(adviceText),
  false
);

assert.equal(/当前报告可用的导师建议不足 12 条|简历优化建议\s*\d+|report-fallback/i.test(adviceText), false);

const highRequiredObligations = internal.adviceCoverageObligations
  .filter((item) => item.required !== false && ["critical", "high"].includes(item.severity))
  .map((item) => item.id);

assert.ok(highRequiredObligations.length > 0);
assert.ok(premiumReport.coverageSummary.obligationsCovered > 0);
assert.ok(premiumReport.coverageSummary.coverageRatio > 0);

console.log("obligation fallback tests passed");

const rawDiagnosticInternal = formatInternalAtsResult({
  engine: "rule-based",
  jobTitle: "网络运营专员 network operator",
  hasJD: true,
  total: 42,
  risk: "high",
  dimensions: {
    D: { score: 5, max: 45 },
    F: { score: 6, max: 23 },
  },
  metrics: {
    checks: {
      exactJobTitle: { exact: false, targetTitle: "网络运营专员 network operator" },
    },
    keywordMatch: {
      matchMethod: { hardCoverage: 12, combinedKeywordCoverage: 16 },
    },
  },
  problemTags: [
    { tag: "keyword_gap_critical", severity: "high", dimension: "D", evidence: "must-have keywords missing." },
    { tag: "missing_exact_job_title", severity: "high", dimension: "F", evidence: "Target title \"网络运营专员 network operator\" not found in resume." },
    { tag: "keyword_gap_critical", severity: "high", dimension: "D", evidence: "keyword_gap_critical detected by ATS rules." },
    { tag: "partial_china_experience", severity: "medium", dimension: "E", evidence: "partial_china_experience detected by ATS rules." },
  ],
  priorityMissingKeywords: [
    { term: "aws", priority: "high", category: "hard_skill" },
  ],
}, {
  jobTitle: "网络运营专员 network operator",
  jdText: "网络运营专员 network operator role requiring aws and it infrastructure.",
  resumeText,
});

const rawFree = selectFreeMentorPlan([], rawDiagnosticInternal);
const rawPremium = selectPremiumMentorPlan([], rawDiagnosticInternal, rawFree);
const rawReport = formatPremiumMentorReport(rawPremium, rawDiagnosticInternal);
const rawDiagnosisText = rawReport.allAdviceItems.map((item) => item.currentDiagnosis).join(" ");

assert.equal(
  /detected by ATS rules|not found in resume|must-have keywords missing|keyword_gap_critical|partial_china_experience/.test(rawDiagnosisText),
  false
);

console.log("raw diagnostic copy sanitation tests passed");
