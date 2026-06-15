"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const { scoreResumeATS } = require("../src/ats/ats-scorer");
const {
  formatInternalAtsResult,
  formatPremiumUnlockedReport,
  formatPublicFreeReport,
} = require("../src/ats/report-formatter");
const {
  retrieveMentorAdviceWithStatus,
  selectFreeMentorPlan,
  selectPremiumMentorPlan,
  formatPublicFreeMentorAdvice,
  formatPremiumMentorReport,
  buildLockedAdvicePreview,
  groupAdviceByMentor,
} = require("../services/mentorAdviceRetrieval");
const { curateMentorAdvicePlan } = require("../services/adviceCurator");
const { parsePDF, parseDocx } = require("../file-parser");

const DEFAULT_INPUT_DIR = "C:\\Users\\viviy\\Desktop\\新增資料夾";
const OUT_JSON = path.join(process.cwd(), "outputs", "advice_quality_audit_desktop_cases.raw.json");
const OUT_MD = path.join(process.cwd(), "outputs", "advice_quality_audit_desktop_cases.md");

function argValue(name, fallback) {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function compactFileLabel(fileName) {
  return path.basename(fileName).replace(/\.[^.]+$/, "");
}

async function readResumeText(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);
  if (ext === ".pdf") return parsePDF(buffer);
  if (ext === ".docx") return parseDocx(buffer);
  return buffer.toString("utf8");
}

function adviceSummary(items = []) {
  return items.map((item) => ({
    adviceId: item.adviceId || null,
    title: item.title || item.adviceTitle || "",
    coverageFamily: item.coverageFamily || "",
    actionFamily: item.actionFamily || item.canonicalActionFamily || "",
    targetSection: item.targetSection || "",
    source: item.source || "db",
    attributionMode: item.attributionMode || "",
    sourceDisclosure: item.sourceDisclosure || "",
    action: normalizeText(item.action || item.actionSummary || "").slice(0, 220),
  }));
}

function mentorSummary(mentors = []) {
  return mentors.map((mentor) => ({
    mentorId: mentor.mentorId || null,
    mentorName: mentor.mentorName || "",
    company: mentor.company || "",
    mentorTitle: mentor.mentorTitle || mentor.mentorSubtitle || "",
    mentorGroupLens: mentor.mentorGroupLens || "",
    adviceCount: (mentor.adviceItems || []).length,
    adviceItems: adviceSummary(mentor.adviceItems || []),
  })).filter((mentor) => mentor.adviceCount > 0);
}

async function runCase({ resumeText, jdPath }) {
  const jdText = fs.readFileSync(jdPath, "utf8");
  const rawScoreResult = scoreResumeATS(resumeText, "", jdText);
  const input = { resumeText, jobTitle: "", jdText };
  const internalAtsResult = formatInternalAtsResult(rawScoreResult, input);
  const retrievalQuery = internalAtsResult.retrievalQuery;
  const { candidates, status } = await retrieveMentorAdviceWithStatus(retrievalQuery, {
    limit: 120,
    includeDebugCounts: true,
  });
  internalAtsResult.retrievalStatus = status;

  const freeMentorPlan = selectFreeMentorPlan(candidates, internalAtsResult);
  const premiumMentorPlan = selectPremiumMentorPlan(candidates, internalAtsResult, freeMentorPlan);
  const freeAdvice = formatPublicFreeMentorAdvice(freeMentorPlan, internalAtsResult);
  const paidAdvice = premiumMentorPlan.slice(1);
  const premiumMentorReport = formatPremiumMentorReport(premiumMentorPlan, internalAtsResult);
  const curatedAdvice = curateMentorAdvicePlan({
    internalAtsResult,
    retrievalQuery,
    freeAdvice,
    paidAdvice,
    mentorReport: premiumMentorReport,
    candidateMentors: groupAdviceByMentor(candidates),
    targetRole: internalAtsResult.jobTitle,
  });
  const publicReport = formatPublicFreeReport(
    internalAtsResult,
    freeAdvice,
    buildLockedAdvicePreview(premiumMentorPlan, internalAtsResult),
    curatedAdvice
  );
  publicReport.retrievalStatus = status;
  const premiumReport = formatPremiumUnlockedReport(internalAtsResult, {
    ...premiumMentorReport,
    curatedAdviceItems: curatedAdvice.curatedAdviceItems,
    resultPageAdviceItems: curatedAdvice.resultPageAdviceItems,
    reportPageMentorGroups: curatedAdvice.reportPageMentorGroups,
    coverageSummary: {
      ...(premiumMentorReport.coverageSummary || {}),
      ...(curatedAdvice.coverageSummary || {}),
      retrievalStatus: status,
    },
  });
  premiumReport.retrievalStatus = status;

  return {
    caseName: compactFileLabel(jdPath),
    jdFile: jdPath,
    jobTitle: internalAtsResult.jobTitle || jobTitle,
    total: internalAtsResult.total,
    risk: internalAtsResult.risk,
    retrievalStatus: status,
    retrievalQualityStatus: status.retrievalStatus === "error"
      ? "retrieval_error"
      : status.retrievalStatus === "empty"
        ? "retrieval_empty"
        : "retrieval_ok",
    candidateCount: status.retrievalStatus === "error" ? null : status.candidateCount,
    freeAdviceItems: adviceSummary(publicReport.resultPageAdviceItems || freeAdvice.adviceItems || []),
    paidAdviceCount: (premiumReport.reportPageMentorGroups || []).reduce((sum, mentor) => sum + (mentor.adviceItems || []).length, 0),
    reportMentorGroups: mentorSummary(premiumReport.reportPageMentorGroups || premiumReport.mentors || []),
    coverageSummary: premiumReport.coverageSummary || {},
  };
}

function writeMarkdown(results, inputDir) {
  const lines = [];
  lines.push("# MentorX Advice Quality Audit - Desktop JD Cases");
  lines.push("");
  lines.push(`Input folder: \`${inputDir}\``);
  lines.push(`Case count: ${results.length}`);
  lines.push("");
  lines.push("| Case | Job title | Retrieval status | Candidates | Free items | Paid items |");
  lines.push("| --- | --- | --- | ---: | ---: | ---: |");
  for (const result of results) {
    lines.push(`| ${result.caseName} | ${result.jobTitle} | ${result.retrievalQualityStatus} | ${result.candidateCount ?? "n/a"} | ${result.freeAdviceItems.length} | ${result.paidAdviceCount} |`);
  }
  lines.push("");
  for (const result of results) {
    lines.push(`## ${result.caseName}`);
    lines.push("");
    lines.push(`- Job title: ${result.jobTitle}`);
    lines.push(`- Retrieval: ${result.retrievalQualityStatus}`);
    lines.push(`- Candidate count: ${result.candidateCount ?? "n/a"}`);
    if (result.retrievalStatus.retrievalErrorMessage) {
      lines.push(`- Retrieval error: ${result.retrievalStatus.retrievalErrorCode || "error"} - ${result.retrievalStatus.retrievalErrorMessage}`);
    }
    lines.push("");
    lines.push("Free advice:");
    for (const item of result.freeAdviceItems) {
      lines.push(`- ${item.title} [${item.coverageFamily || "unknown"}] ${item.source ? `(${item.source})` : ""}`);
    }
    lines.push("");
    lines.push("Paid mentor groups:");
    for (const mentor of result.reportMentorGroups) {
      lines.push(`- ${mentor.company || "MentorX"} · ${mentor.mentorTitle || mentor.mentorName} · ${mentor.mentorGroupLens || "视角未标注"} (${mentor.adviceCount})`);
      for (const item of mentor.adviceItems) {
        lines.push(`  - ${item.title} [${item.coverageFamily || "unknown"}]`);
      }
    }
    lines.push("");
  }
  fs.mkdirSync(path.dirname(OUT_MD), { recursive: true });
  fs.writeFileSync(OUT_MD, `\ufeff${lines.join("\n")}`, "utf8");
}

async function main() {
  const inputDir = argValue("input", DEFAULT_INPUT_DIR);
  const entries = fs.readdirSync(inputDir)
    .map((name) => path.join(inputDir, name));
  const resumeFile = entries.find((file) => /\.(pdf|docx|txt)$/i.test(file) && /resume/i.test(path.basename(file)));
  if (!resumeFile) throw new Error(`No resume file found in ${inputDir}`);
  const jdFiles = entries
    .filter((file) => /\.txt$/i.test(file) && file !== resumeFile)
    .sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
  if (!jdFiles.length) throw new Error(`No JD .txt files found in ${inputDir}`);

  const resumeText = await readResumeText(resumeFile);
  const results = [];
  for (const jdPath of jdFiles) {
    console.log(`[audit] running ${path.basename(jdPath)}`);
    results.push(await runCase({ resumeText, jdPath }));
  }
  const payload = {
    generatedAt: new Date().toISOString(),
    inputDir,
    resumeFile,
    caseCount: results.length,
    results,
  };
  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), "utf8");
  writeMarkdown(results, inputDir);
  console.log(`[audit] wrote ${OUT_JSON}`);
  console.log(`[audit] wrote ${OUT_MD}`);
}

main()
  .catch((error) => {
    console.error("[audit] failed", error);
    process.exitCode = 1;
  });
