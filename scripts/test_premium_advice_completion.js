"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const assert = require("assert");
const { scoreResumeATS } = require("../src/ats/ats-scorer");
const { formatInternalAtsResult } = require("../src/ats/report-formatter");
const {
  retrieveMentorAdvice,
  selectFreeMentorPlan,
  selectPremiumMentorPlan,
  formatPremiumMentorReport,
} = require("../services/mentorAdviceRetrieval");

const resumeText = `
Jane Doe
Bachelor of Business Administration
Skills: Excel, data analysis, reporting, communication, teamwork
Experience
- Analyzed sales reports in Excel.
- Coordinated cross-functional projects.
- Prepared weekly customer service reports.
- Supported operations process improvement.
`;

const jdText = `
Management Trainee role rotates through operations, sales, finance, and customer service.
Assist managers, analyze data, create reports, communicate with teams, solve problems,
and improve business processes.
`;

(async () => {
  const rawScoreResult = scoreResumeATS(resumeText, "Management Trainee", jdText);
  const internal = formatInternalAtsResult(rawScoreResult, { resumeText, jobTitle: "Management Trainee", jdText });
  const candidates = await retrieveMentorAdvice(internal.retrievalQuery);
  const free = selectFreeMentorPlan(candidates, internal);
  const premium = selectPremiumMentorPlan(candidates, internal, free);
  const report = formatPremiumMentorReport(premium, internal);
  assert.equal((free.adviceItems || []).length, 3, "free plan should have 3 items");
  assert.ok((report.paidAdviceItems || []).length <= 9, "premium plan should not exceed 9 paid items");
  assert.ok((report.allAdviceItems || []).length <= 12, "full bundle should not exceed 12 items");
  assert.ok((report.allAdviceItems || []).every((item) => item.action || item.actionSummary), "all displayed advice items should have an action");
  console.log("premium advice quality gate test passed");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
