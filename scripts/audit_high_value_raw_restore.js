"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const VALUE_PATTERN = [
  "Risk Consulting", "RCSA", "control framework", "regulatory compliance",
  "Management Consulting", "consulting", "recommendation", "client",
  "CDISC", "SDTM", "ADaM", "clinical", "biostat",
  "GitHub", "portfolio", "Kaggle", "machine learning", "MLE", "RAG",
  "SQL", "Tableau", "Power BI", "dashboard", "process improvement",
].join("|");

const EXCLUDE_PATTERN = /OPT|CPT|H1B|Green Card|sponsorship|visa|work authorization|造假|虚构|捏造/i;

function scoreRow(row) {
  const text = [row.A_action, row.action_summary, row.P_mentor, row.I_insight, row.generalized_action, row.role_family, row.target_roles].filter(Boolean).join(" ");
  let score = 0;
  if (/Risk Consulting|RCSA|control framework|regulatory compliance/i.test(text)) score += 30;
  if (/Management Consulting|consulting|recommendation|client/i.test(text)) score += 24;
  if (/CDISC|SDTM|ADaM|clinical|biostat/i.test(text)) score += 22;
  if (/GitHub|portfolio|Kaggle|machine learning|MLE|RAG/i.test(text)) score += 20;
  if (/SQL|Tableau|Power BI|dashboard|process improvement/i.test(text)) score += 14;
  if (row.display_action_mode === "generalized") score += 8;
  if (row.grounding_terms) score += 5;
  if (row.activation_keywords) score += 5;
  if (EXCLUDE_PATTERN.test(text)) score -= 100;
  return score;
}

function recommendation(row) {
  const text = [row.A_action, row.action_summary, row.P_mentor, row.I_insight].filter(Boolean).join(" ");
  if (EXCLUDE_PATTERN.test(text)) return { decision: "keep_exclude_or_generalized", reason: "identity/legal/fabrication risk" };
  if (/CDISC|SDTM|ADaM|Alpha Research|VADER|MACD|GitHub|Kaggle/i.test(text)) {
    return { decision: "grounded_raw_candidate", gate: "resume_grounding", reason: "valuable only if resume contains named project/tool terms" };
  }
  if (/Risk Consulting|RCSA|control framework|regulatory compliance|Management Consulting|consulting/i.test(text)) {
    return { decision: "grounded_raw_candidate", gate: "role_jd_keywords", reason: "valuable role-specific advice if JD/role matches" };
  }
  return { decision: "quality_generalized_candidate", gate: "keep_generalized", reason: "value is reusable but raw may be over-specific" };
}

async function main() {
  const limit = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 200);
  const pool = db.getPool();
  const { rows } = await pool.query(
    `SELECT id, chunk_id, topic, "L1", "L2", role_family, target_roles,
            "P_mentor", "A_action", action_summary, "I_insight", "HR_os",
            action_specificity, display_action_mode, generalized_action,
            activation_role_family, activation_keywords, grounding_terms,
            canonical_action_family, action_depth, action_review_status
       FROM segments
      WHERE (retrieval_scope IS NULL OR retrieval_scope = 'resume_edit')
        AND COALESCE(display_action_mode, '') IN ('generalized', 'grounded_raw')
        AND concat_ws(' ', "A_action", action_summary, "P_mentor", "I_insight", generalized_action, role_family, target_roles) ~* $1
      ORDER BY id`,
    [VALUE_PATTERN]
  );
  const candidates = rows
    .map((row) => ({ ...row, highValueScore: scoreRow(row), recommendation: recommendation(row) }))
    .filter((row) => row.highValueScore > 0)
    .sort((a, b) => b.highValueScore - a.highValueScore || Number(a.id) - Number(b.id))
    .slice(0, limit);
  const outDir = path.join(process.cwd(), "data", "audit", "high_value_raw_restore");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `candidates_${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), rowCount: candidates.length, candidates }, null, 2), "utf8");
  console.log(JSON.stringify({ scanned: rows.length, candidates: candidates.length, outPath, topIds: candidates.slice(0, 20).map((row) => row.id) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
