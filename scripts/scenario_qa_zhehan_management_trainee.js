"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const { scoreResumeATS } = require("../src/ats/ats-scorer");
const {
  formatInternalAtsResult,
  formatPublicFreeReport,
  formatPremiumUnlockedReport,
} = require("../src/ats/report-formatter");
const {
  retrieveMentorAdvice,
  selectFreeMentorPlan,
  selectPremiumMentorPlan,
  formatPublicFreeMentorAdvice,
  formatPremiumMentorReport,
  buildLockedAdvicePreview,
  canonicalActionFamilyOf,
  actionDepthOf,
} = require("../services/mentorAdviceRetrieval");
const actionGovernance = require("../services/actionGovernance");

const DEFAULT_RESUME = `
Zhehan Zhang
M.S. Biostatistics / Statistics background

Skills
SAS, R, Python, SQL, statistical analysis, data analysis, reporting, teamwork, communication

Projects
CDISC Data Mapping Project
- Transformed raw clinical trial data into SDTM domains and converted SDTM datasets into ADaM datasets.
- Prepared analysis-ready datasets and supported reporting deliverables.

Experience
Research Assistant
- Coordinated with team members on data review and documentation.
- Prepared summaries and reports for academic research projects.
`;

const DEFAULT_JD = `
Management Trainee position is an entry-level role designed to develop future leaders for the company.
The trainee will rotate through operations, sales, finance, and customer service to learn how different areas of the business function.
Assist department managers in day-to-day tasks and projects.
Participate in strategic planning and decision-making processes.
Analyze data and create reports to help improve business processes.
Provide suggestions for process improvements and contribute to company growth.
Requirements: Bachelor's degree in business administration, management, or related field.
Strong leadership potential, excellent communication and interpersonal skills, analytical and problem-solving abilities, willingness to learn and adapt, teamwork.
`;

const FORBIDDEN = [
  /Risk Consulting/i,
  /\bRCSA\b/i,
  /Financial Advisor/i,
  /\bFA\b/,
  /Alpha Research/i,
  /VADER/i,
  /MACD/i,
  /trading book/i,
  /limits monitoring/i,
  /\bOPT\b/i,
  /\bCPT\b/i,
  /sponsorship/i,
  /Green Card/i,
  /H1B/i,
];

const EXPECTED = [
  /Management Trainee|管培/i,
  /Summary|定位|目标岗位|岗位原词/i,
  /data|analysis|report|process|communication|team/i,
  /bullet|量化|结果|impact|evidence|证据/i,
];

function argValue(name, fallback = "") {
  const raw = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return raw ? raw.slice(name.length + 3) : fallback;
}

function readOptional(filePath, fallback) {
  if (!filePath) return fallback;
  return fs.readFileSync(path.resolve(process.cwd(), filePath), "utf8");
}

function adviceItemsFromReports(freeAdvice, premiumReport) {
  return [
    ...(freeAdvice.adviceItems || []),
    ...(premiumReport.allAdviceItems || []).slice(3, 12),
  ].slice(0, 12);
}

function familyStats(items) {
  const counts = {};
  const depths = {};
  for (const item of items) {
    const family = canonicalActionFamilyOf(item);
    const depth = actionDepthOf(item);
    counts[family] = (counts[family] || 0) + 1;
    depths[family] = depths[family] || [];
    if (!depths[family].includes(depth)) depths[family].push(depth);
  }
  return { counts, depths };
}

function textOf(item) {
  return [
    item.title,
    item.currentDiagnosis,
    item.action,
    item.mentorLens,
    item.mentorInsight,
    item.reason,
    item.hrPerspective,
    item.HR_os,
  ].filter(Boolean).join(" ");
}

function qaItems(items, internalAtsResult) {
  const governanceContext = {
    roleFamily: "business",
    targetRole: "Management Trainee",
    jobTitle: "Management Trainee 管培生",
    jdText: DEFAULT_JD,
    resumeText: DEFAULT_RESUME,
  };
  return items.map((item, index) => {
    const text = textOf(item);
    const forbiddenHits = FORBIDDEN.filter((pattern) => pattern.test(text)).map((pattern) => String(pattern));
    const expectedHits = EXPECTED.filter((pattern) => pattern.test(text)).length;
    const governed = actionGovernance.resolveDisplayAction(item, governanceContext);
    const family = canonicalActionFamilyOf(item);
    const depth = actionDepthOf(item);
    const expectedByFamily = [
      "format_cleanup",
      "profile_links",
      "education_signal",
      "section_structure",
      "transferable_framing",
      "skills_section",
      "experience_evidence",
    ].includes(family);
    return {
      index: index + 1,
      adviceId: item.adviceId || "",
      source: item.source || "",
      title: item.title || "",
      currentDiagnosis: item.currentDiagnosis || "",
      action: item.action || "",
      mentorLens: item.mentorLens || item.mentorInsight || "",
      hrPerspective: item.hrPerspective || item.HR_os || "",
      relatedProblemTags: item.relatedProblemTags || [],
      family,
      depth,
      displayMode: item.actionDisplayModeUsed || item.governedAction?.usedMode || governed.usedMode || "",
      forbiddenHits,
      expectedHits,
      pass: forbiddenHits.length === 0 && (expectedHits > 0 || expectedByFamily) && Boolean(item.action),
    };
  });
}

function markdownReport(result) {
  const lines = [];
  lines.push(`# Zhehan / Management Trainee Scenario QA`);
  lines.push("");
  lines.push(`- Status: ${result.pass ? "PASS" : "FAIL"}`);
  lines.push(`- Total advice: ${result.counts.totalAdvice}`);
  lines.push(`- Free advice: ${result.counts.freeAdvice}`);
  lines.push(`- Paid advice: ${result.counts.paidAdvice}`);
  lines.push(`- Forbidden hits: ${result.counts.forbiddenHits}`);
  lines.push(`- Duplicate family violations: ${result.violations.duplicateFamily.length}`);
  lines.push(`- Same family/depth violations: ${result.violations.sameFamilyDepth.length}`);
  lines.push("");
  for (const item of result.items) {
    lines.push(`## ${item.index}. ${item.title}`);
    lines.push(`- id: ${item.adviceId}`);
    lines.push(`- source: ${item.source}`);
    lines.push(`- family/depth: ${item.family} / ${item.depth}`);
    lines.push(`- mode: ${item.displayMode}`);
    lines.push(`- pass: ${item.pass}`);
    if (item.forbiddenHits.length) lines.push(`- forbidden: ${item.forbiddenHits.join(", ")}`);
    lines.push(`- current: ${item.currentDiagnosis}`);
    lines.push(`- action: ${item.action}`);
    lines.push(`- mentor: ${item.mentorLens}`);
    lines.push(`- HR: ${item.hrPerspective}`);
    lines.push("");
  }
  return lines.join("\n");
}

async function main() {
  const resumeText = readOptional(argValue("resume-file"), DEFAULT_RESUME);
  const jdText = readOptional(argValue("jd-file"), DEFAULT_JD);
  const jobTitle = argValue("job-title", "Management Trainee");

  const rawScoreResult = scoreResumeATS(resumeText, jobTitle, jdText);
  const internalAtsResult = formatInternalAtsResult(rawScoreResult, { resumeText, jobTitle, jdText });
  const mentorCandidates = await retrieveMentorAdvice(internalAtsResult.retrievalQuery);
  const freeMentorPlan = selectFreeMentorPlan(mentorCandidates, internalAtsResult);
  const premiumMentorPlan = selectPremiumMentorPlan(mentorCandidates, internalAtsResult, freeMentorPlan);
  const freeAdvice = formatPublicFreeMentorAdvice(freeMentorPlan, internalAtsResult);
  const premiumReport = formatPremiumMentorReport(premiumMentorPlan, internalAtsResult);
  const lockedPreview = buildLockedAdvicePreview(premiumMentorPlan, internalAtsResult);
  const publicReport = formatPublicFreeReport(internalAtsResult, freeAdvice, lockedPreview);
  const items = adviceItemsFromReports(freeAdvice, premiumReport);
  const itemQa = qaItems(items, internalAtsResult);
  const stats = familyStats(items);
  const duplicateFamily = Object.entries(stats.counts).filter(([, count]) => count > 2).map(([family, count]) => ({ family, count }));
  const sameFamilyDepth = Object.entries(stats.depths)
    .filter(([family]) => stats.counts[family] > stats.depths[family].length)
    .map(([family, depths]) => ({ family, depths }));
  const result = {
    generatedAt: new Date().toISOString(),
    scenario: "zhehan_management_trainee",
    jobTitle,
    counts: {
      totalAdvice: items.length,
      freeAdvice: freeAdvice.adviceItems?.length || 0,
      paidAdvice: premiumReport.paidAdviceItems?.length || 0,
      mentorCandidates: mentorCandidates.length,
      forbiddenHits: itemQa.reduce((sum, item) => sum + item.forbiddenHits.length, 0),
    },
    score: {
      total: internalAtsResult.total,
      risk: internalAtsResult.risk,
      jdMatchRatio: internalAtsResult.jdMatchRatio,
    },
    familyStats: stats,
    violations: {
      duplicateFamily,
      sameFamilyDepth,
      incompleteTwelve: items.length !== 12,
      emptyPaidBuckets: (premiumMentorPlan || []).slice(1).filter((mentor) => !mentor.adviceItems?.length).map((mentor) => mentor.mentorId),
    },
    items: itemQa,
  };
  result.pass = result.counts.totalAdvice === 12 &&
    result.counts.freeAdvice === 3 &&
    result.counts.paidAdvice === 9 &&
    result.counts.forbiddenHits === 0 &&
    result.violations.duplicateFamily.length === 0 &&
    result.violations.sameFamilyDepth.length === 0 &&
    result.violations.emptyPaidBuckets.length === 0 &&
    result.items.every((item) => item.pass);

  const outDir = path.join(process.cwd(), "data", "audit", "scenario_qa");
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const jsonPath = path.join(outDir, `zhehan_management_trainee_${stamp}.json`);
  const mdPath = path.join(outDir, `zhehan_management_trainee_${stamp}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify({ ...result, publicReport }, null, 2), "utf8");
  fs.writeFileSync(mdPath, markdownReport(result), "utf8");
  console.log(JSON.stringify({
    pass: result.pass,
    counts: result.counts,
    violations: result.violations,
    jsonPath,
    mdPath,
  }, null, 2));
  if (process.argv.includes("--fail-on-error") && !result.pass) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
