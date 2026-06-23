"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node scripts/compare_ats_system_score.js <payload.json>");
  process.exit(1);
}

const atsSystemRoot = process.env.ATS_SYSTEM_ROOT || "C:/Users/viviy/Documents/GitHub/ats_system";
const payload = JSON.parse(fs.readFileSync(path.resolve(inputPath), "utf8"));
const current = require("../src/ats/ats-scorer.js");
const external = require(path.join(atsSystemRoot, "src/ats-scorer.js"));

const input = {
  resumeText: payload.resumeText || payload.text || "",
  jobTitle: payload.jobTitle || "",
  jdText: payload.jdText || "",
  fileName: payload.fileName || payload.resumeFileName || "",
};

function pick(result) {
  return {
    total: result.total,
    risk: result.risk,
    jobTitle: result.jobTitle || null,
    hasJD: Boolean(result.hasJD),
    dimensions: Object.fromEntries(
      Object.entries(result.dimensions || {}).map(([key, value]) => [
        key,
        { score: value.score, max: value.max },
      ])
    ),
    jdMatchRatio: result.metrics?.jdMatchRatio ?? null,
    keywordProfileSource: result.metrics?.keywordProfile?.source || null,
    roleId: result.metrics?.keywordProfile?.role_id || null,
  };
}

const currentResult = current.scoreResumeATS(input.resumeText, input.jobTitle, input.jdText, { fileName: input.fileName });
const externalResult = external.scoreResumeATS(input.resumeText, input.jobTitle, input.jdText, { fileName: input.fileName });
const currentPicked = pick(currentResult);
const externalPicked = pick(externalResult);

console.log(JSON.stringify({
  input: {
    resumeTextLength: input.resumeText.length,
    resumeTextHash: crypto.createHash("sha256").update(input.resumeText).digest("hex"),
    jobTitle: input.jobTitle,
    jdTextLength: input.jdText.length,
    jdTextHash: crypto.createHash("sha256").update(input.jdText).digest("hex"),
    fileName: input.fileName,
  },
  current: currentPicked,
  atsSystem: externalPicked,
  equal: JSON.stringify(currentPicked) === JSON.stringify(externalPicked),
}, null, 2));
