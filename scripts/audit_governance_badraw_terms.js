"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");
const governance = require("../services/actionGovernance");

const ROLE_CONTEXTS = {
  management_trainee: {
    roleFamily: "business",
    targetRole: "Management Trainee",
    jobTitle: "Management Trainee 管培生",
    jdText: [
      "Rotate through operations, sales, finance, and customer service.",
      "Assist department managers in tasks and projects.",
      "Participate in strategic planning and decision-making.",
      "Analyze data and create reports to improve business processes.",
      "Leadership, communication, problem-solving, adaptability, teamwork.",
    ].join(" "),
    resumeText: [
      "Biostatistics and statistics background.",
      "CDISC data mapping, SDTM, ADaM, SAS, R, Python, reports, teamwork, communication.",
    ].join(" "),
  },
  software_engineer: {
    roleFamily: "software_engineer",
    targetRole: "Software Engineer",
    jobTitle: "Software Engineer",
    jdText: "Build backend services, APIs, databases, cloud infrastructure, testing, collaboration, and production systems.",
    resumeText: "Computer science projects, JavaScript, Python, APIs, database, web app, GitHub, teamwork.",
  },
  data_analyst: {
    roleFamily: "data_analytics",
    targetRole: "Data Analyst",
    jobTitle: "Data Analyst",
    jdText: "Analyze data, build reports and dashboards, SQL, Excel, Tableau, Power BI, stakeholder communication.",
    resumeText: "Data analysis coursework, SQL, Excel, Python, dashboard project, reporting, communication.",
  },
};

const RISK_REGEX = [
  "Risk Consulting",
  "RCSA",
  "control framework",
  "regulatory compliance",
  "Financial Advisor",
  "\\bFA\\b",
  "financial advisory",
  "Alpha Research",
  "Alpha research",
  "VADER",
  "MACD",
  "trading book",
  "limits monitoring",
  "Risk Quant",
  "Quantitative Risk",
  "MFE",
  "sponsor",
  "sponsorship",
  "H1B",
  "\\b(?:STEM\\s+)?OPT\\b",
  "STEM OPT",
  "\\bCPT\\b",
  "\\bEAD\\b",
  "\\bF-1\\b",
  "work authorization",
  "authorized to work",
  "no sponsorship",
  "GREEN CARD",
  "Green Card",
  "擦边球",
  "先写入",
  "包装成",
  "包装为",
  "无法支持背调",
  "DeepSeek",
  "midterm",
  "final project",
  "final report",
  "final presentation",
  "course project",
  "Kaggle",
  "Google Drive",
].join("|");

function hasUnsafeRawText(text) {
  return new RegExp(RISK_REGEX, "i").test(String(text || ""));
}

async function main() {
  const contextName = process.argv.find((arg) => arg.startsWith("--context="))?.split("=")[1] || "management_trainee";
  const context = ROLE_CONTEXTS[contextName];
  if (!context) throw new Error(`Unknown context: ${contextName}`);

  const pool = db.getPool();
  const { rows } = await pool.query(
    `SELECT id, chunk_id, topic, "L1", "L2", retrieval_scope,
            role_family, target_roles, problem_tags, ats_dimensions,
            advice_card_title, user_problem_summary,
            "P_mentor", "A_action", "I_insight", "HR_os",
            action_summary, generalized_action, display_action_mode,
            action_specificity, activation_role_family, activation_keywords,
            grounding_terms, canonical_action_family, action_depth, action_review_status
       FROM segments
      WHERE (retrieval_scope IS NULL OR retrieval_scope = 'resume_edit')
        AND concat_ws(' ', "A_action", action_summary, "P_mentor", "I_insight", "HR_os",
                      generalized_action, activation_keywords, grounding_terms)
            ~* $1
      ORDER BY id`,
    [RISK_REGEX]
  );

  const badRaw = [];
  const counts = {};
  for (const row of rows) {
    const resolved = governance.resolveDisplayAction(row, context);
    counts[resolved.usedMode || "none"] = (counts[resolved.usedMode || "none"] || 0) + 1;
    if (resolved.usedMode === "raw" && hasUnsafeRawText(resolved.action)) {
      badRaw.push({
        id: row.id,
        chunk_id: row.chunk_id || "",
        topic: row.topic || "",
        role_family: row.role_family || "",
        display_action_mode: row.display_action_mode || "",
        action_specificity: row.action_specificity || "",
        action_review_status: row.action_review_status || "",
        action: resolved.action.slice(0, 260),
        A_action: row.A_action || "",
        action_summary: row.action_summary || "",
        P_mentor: row.P_mentor || "",
        I_insight: row.I_insight || "",
        HR_os: row.HR_os || "",
        current: {
          action_specificity: row.action_specificity || "",
          display_action_mode: row.display_action_mode || "",
          generalized_action: row.generalized_action || "",
          activation_role_family: row.activation_role_family || "",
          activation_keywords: row.activation_keywords || "",
          grounding_terms: row.grounding_terms || "",
          canonical_action_family: row.canonical_action_family || "",
          action_depth: row.action_depth || "",
          action_review_status: row.action_review_status || "",
        },
      });
    }
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outPath = path.join(process.cwd(), "data", "audit", `governance_badraw_${contextName}_${stamp}.json`);
  fs.writeFileSync(outPath, `${JSON.stringify({ contextName, sampled: rows.length, counts, badRawCount: badRaw.length, badRaw }, null, 2)}\n`);

  console.log(JSON.stringify({
    contextName,
    sampled: rows.length,
    counts,
    badRawCount: badRaw.length,
    output: outPath,
    sampleIds: badRaw.slice(0, 40).map((row) => row.id),
  }, null, 2));

  if (process.argv.includes("--fail-on-badraw") && badRaw.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
