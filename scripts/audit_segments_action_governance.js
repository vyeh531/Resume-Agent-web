"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");
const governance = require("../services/actionGovernance");

const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 0);
const REVIEW_LIMIT = Number(process.argv.find((arg) => arg.startsWith("--review-limit="))?.split("=")[1] || 300);
const BATCH_SIZE = Number(process.argv.find((arg) => arg.startsWith("--batch-size="))?.split("=")[1] || 80);

function safeSlug(value) {
  return String(value || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80) || "unknown";
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function rowForOutput(row, classification) {
  return {
    id: row.id,
    chunk_id: row.chunk_id,
    topic: row.topic || "",
    L1: row.L1 || "",
    L2: row.L2 || "",
    retrieval_scope: row.retrieval_scope || "",
    role_family: row.role_family || "",
    target_roles: row.target_roles || "",
    problem_tags: row.problem_tags || "",
    ats_dimensions: row.ats_dimensions || "",
    advice_card_title: row.advice_card_title || "",
    user_problem_summary: row.user_problem_summary || "",
    A_action: row.A_action || "",
    action_summary: row.action_summary || "",
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
    proposed: classification,
  };
}

function priorityOf(row) {
  const specificity = row.proposed.action_specificity;
  const family = row.proposed.canonical_action_family;
  const raw = `${row.A_action || ""} ${row.action_summary || ""}`.toLowerCase();
  const reasons = [];
  let score = 0;

  if (specificity === "case_specific") {
    score += 100;
    reasons.push("case_specific action is most likely to contain a previous student's context");
  }
  if (specificity === "resume_specific") {
    score += 80;
    reasons.push("resume_specific action needs resume grounding before showing raw text");
  }
  if (specificity === "role_specific") {
    score += 60;
    reasons.push("role_specific action is valuable but must be role/JD gated");
  }
  if (specificity === "jd_specific") {
    score += 50;
    reasons.push("jd_specific action needs target JD grounding");
  }
  if (family === "experience_evidence" || family === "summary_positioning" || family === "jd_keyword_alignment") {
    score += 20;
    reasons.push(`high-frequency family: ${family}`);
  }
  if (/(risk consulting|fraud|aml|rcsa|control framework|financial advisor|quant|trading book|limits monitoring|alpha research|vader|macd|midterm|final|course project|rag|llm|aws|gcp|tableau|powerbi)/i.test(raw)) {
    score += 30;
    reasons.push("contains high-risk role/project/tool terms");
  }

  return { score, reasons };
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function splitIntoBatches(rows, size) {
  const batches = [];
  const chunkSize = Math.max(1, Number(size) || 80);
  for (let i = 0; i < rows.length; i += chunkSize) batches.push(rows.slice(i, i + chunkSize));
  return batches;
}

function buildReviewRows(audited) {
  return audited
    .filter((row) => row.proposed.action_review_status === "needs_review")
    .map((row) => {
      const priority = priorityOf(row);
      return {
        ...row,
        review_priority_score: priority.score,
        review_priority_reasons: priority.reasons,
      };
    })
    .sort((a, b) => {
      if (b.review_priority_score !== a.review_priority_score) {
        return b.review_priority_score - a.review_priority_score;
      }
      return Number(a.id) - Number(b.id);
    });
}

function writeReviewBatches(batchDir, stamp, reviewRows) {
  const index = [];
  const scopedRows = REVIEW_LIMIT > 0 ? reviewRows.slice(0, REVIEW_LIMIT) : reviewRows;
  const allReviewPath = path.join(batchDir, `segments_action_governance_review_all_${stamp}.json`);
  writeJson(allReviewPath, scopedRows);

  const groupMap = new Map();
  for (const row of scopedRows) {
    const key = [
      row.proposed.action_specificity || "unknown_specificity",
      row.proposed.canonical_action_family || "unknown_family",
      row.proposed.action_depth || "unknown_depth",
    ].join("__");
    if (!groupMap.has(key)) groupMap.set(key, []);
    groupMap.get(key).push(row);
  }

  for (const [groupKey, groupRows] of [...groupMap.entries()].sort((a, b) => b[1].length - a[1].length)) {
    const batches = splitIntoBatches(groupRows, BATCH_SIZE);
    batches.forEach((batchRows, batchIndex) => {
      const batchName = `${safeSlug(groupKey)}__batch_${String(batchIndex + 1).padStart(2, "0")}_${stamp}.json`;
      const batchPath = path.join(batchDir, batchName);
      writeJson(batchPath, batchRows);
      index.push({
        file: batchPath,
        group: groupKey,
        batchIndex: batchIndex + 1,
        rowCount: batchRows.length,
        specificity: batchRows[0]?.proposed.action_specificity || "",
        canonicalActionFamily: batchRows[0]?.proposed.canonical_action_family || "",
        actionDepth: batchRows[0]?.proposed.action_depth || "",
        topPriorityScore: batchRows[0]?.review_priority_score || 0,
      });
    });
  }

  const indexPath = path.join(batchDir, `segments_action_governance_batch_index_${stamp}.json`);
  writeJson(indexPath, {
    generatedAt: new Date().toISOString(),
    reviewLimit: REVIEW_LIMIT,
    batchSize: BATCH_SIZE,
    rowCount: scopedRows.length,
    allReviewPath,
    batches: index,
  });

  return { allReviewPath, indexPath, batchCount: index.length, reviewRows: scopedRows.length };
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const limitSql = LIMIT > 0 ? `LIMIT ${LIMIT}` : "";
  const { rows } = await pool.query(`
    SELECT id, chunk_id, topic, "L1", "L2", retrieval_scope,
           role_family, target_roles, problem_tags, ats_dimensions,
           advice_card_title, user_problem_summary, action_summary,
           "P_mentor", "A_action", "I_insight", "HR_os",
           action_specificity, display_action_mode, generalized_action,
           activation_role_family, activation_keywords, grounding_terms,
           canonical_action_family, action_depth, action_review_status
      FROM segments
     WHERE retrieval_scope IS NULL OR retrieval_scope = 'resume_edit'
     ORDER BY id
     ${limitSql}
  `);

  const audited = rows.map((row) => rowForOutput(row, governance.classifyActionGovernance(row)));
  const summary = {
    generatedAt: new Date().toISOString(),
    rowCount: audited.length,
    bySpecificity: countBy(audited.map((row) => row.proposed), "action_specificity"),
    byDisplayMode: countBy(audited.map((row) => row.proposed), "display_action_mode"),
    byCanonicalFamily: countBy(audited.map((row) => row.proposed), "canonical_action_family"),
    byActionDepth: countBy(audited.map((row) => row.proposed), "action_depth"),
    needsReview: audited.filter((row) => row.proposed.action_review_status === "needs_review").length,
  };

  const auditDir = path.join(process.cwd(), "data", "audit");
  const batchDir = path.join(auditDir, "segments_action_review_batches");
  fs.mkdirSync(batchDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const auditPath = path.join(auditDir, `segments_action_governance_${stamp}.json`);
  const reviewPath = path.join(batchDir, `segments_action_governance_review_${stamp}.json`);

  writeJson(auditPath, { summary, rows: audited });
  const reviewRows = buildReviewRows(audited);
  const legacyReviewRows = REVIEW_LIMIT > 0 ? reviewRows.slice(0, REVIEW_LIMIT) : reviewRows;
  writeJson(reviewPath, legacyReviewRows);
  const batchOutput = writeReviewBatches(batchDir, stamp, reviewRows);

  console.log(JSON.stringify({
    summary,
    auditPath,
    reviewPath,
    reviewRows: legacyReviewRows.length,
    batchIndexPath: batchOutput.indexPath,
    allReviewPath: batchOutput.allReviewPath,
    batchCount: batchOutput.batchCount,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
