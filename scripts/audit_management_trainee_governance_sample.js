"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");
const governance = require("../services/actionGovernance");

const RISK_PATTERN = /Risk Consulting|RCSA|Financial Advisor|\bFA\b|Alpha Research|VADER|MACD|trading book|limits monitoring|Risk Quant|Quantitative Risk/i;

const managementTraineeContext = {
  roleFamily: "business",
  targetRole: "Management Trainee",
  jobTitle: "Management Trainee 管培生",
  jdText: [
    "Management Trainee entry-level role.",
    "Rotate through operations, sales, finance, and customer service.",
    "Assist managers in day-to-day tasks and projects.",
    "Participate in strategic planning and decision-making.",
    "Analyze data and create reports to improve business processes.",
    "Strong leadership, communication, analytical problem-solving, and willingness to learn.",
  ].join(" "),
  resumeText: [
    "Zhehan Zhang resume.",
    "Biostatistics and statistics background.",
    "CDISC data mapping, SDTM, ADaM, SAS/R/Python, reports, teamwork, communication, data analysis, and research projects.",
  ].join(" "),
};

async function main() {
  const pool = db.getPool();
  const { rows } = await pool.query(
    `SELECT id, "A_action", action_summary, generalized_action,
            display_action_mode, activation_role_family, activation_keywords,
            grounding_terms, action_specificity
       FROM segments
      WHERE concat_ws(' ', "A_action", action_summary, generalized_action,
                      activation_keywords, grounding_terms)
            ~* $1
      ORDER BY id`,
    ["(Risk Consulting|RCSA|Financial Advisor|Alpha Research|VADER|MACD|trading book|limits monitoring|Risk Quant|Quantitative Risk)"]
  );

  const counts = {};
  const badRaw = [];
  for (const row of rows) {
    const resolved = governance.resolveDisplayAction(row, managementTraineeContext);
    counts[resolved.usedMode || "none"] = (counts[resolved.usedMode || "none"] || 0) + 1;
    if (resolved.usedMode === "raw" && RISK_PATTERN.test(resolved.action)) {
      badRaw.push({
        id: row.id,
        mode: row.display_action_mode || "",
        action: resolved.action.slice(0, 180),
        activation: row.activation_keywords || "",
        grounding: row.grounding_terms || "",
      });
    }
  }

  console.log(JSON.stringify({
    sampled: rows.length,
    counts,
    badRawCount: badRaw.length,
    badRaw: badRaw.slice(0, 20),
  }, null, 2));

  if (badRaw.length) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
