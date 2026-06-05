"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");
const titleGovernance = require("../services/titleGovernance");

const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 0);
const REVIEW_LIMIT = Number(process.argv.find((arg) => arg.startsWith("--review-limit="))?.split("=")[1] || 500);
const BATCH_SIZE = Number(process.argv.find((arg) => arg.startsWith("--batch-size="))?.split("=")[1] || 100);
const ALL_SCOPES = process.argv.includes("--all-scopes");

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || "";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function rowForOutput(row, proposed) {
  return {
    id: row.id,
    chunk_id: row.chunk_id,
    topic: row.topic || "",
    L1: row.L1 || "",
    L2: row.L2 || "",
    problem_tags: row.problem_tags || "",
    canonical_action_family: row.canonical_action_family || "",
    action_depth: row.action_depth || "",
    advice_card_title: row.advice_card_title || "",
    user_problem_summary: row.user_problem_summary || "",
    A_action: row.A_action || "",
    action_summary: row.action_summary || "",
    current: {
      canonical_title: row.canonical_title || "",
      title_review_status: row.title_review_status || "",
      title_source: row.title_source || "",
      title_confidence: row.title_confidence || null,
    },
    proposed,
  };
}

function splitIntoBatches(rows, size) {
  const out = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const limitSql = LIMIT > 0 ? `LIMIT ${LIMIT}` : "";
  const scopeSql = ALL_SCOPES ? "" : "WHERE retrieval_scope IS NULL OR retrieval_scope = 'resume_edit'";
  const { rows } = await pool.query(`
    SELECT id, chunk_id, topic, "L1", "L2", problem_tags,
           canonical_action_family, action_depth,
           advice_card_title, user_problem_summary,
           "P_mentor", "A_action", action_summary,
           canonical_title, title_review_status, title_source, title_confidence
      FROM segments
     ${scopeSql}
     ORDER BY id
     ${limitSql}
  `);

  const audited = rows.map((row) => rowForOutput(row, titleGovernance.classifyTitleGovernance(row)));
  const proposedRows = audited.map((row) => row.proposed);
  const titleCounts = countBy(proposedRows, "canonical_title");
  const overCommon = new Set(Object.entries(titleCounts).filter(([, count]) => count > Math.max(300, rows.length * 0.12)).map(([title]) => title));
  for (const row of audited) {
    if (overCommon.has(row.proposed.canonical_title)) {
      row.proposed.titleFlags = [...new Set([...(row.proposed.titleFlags || []), "high_frequency_title"])];
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    rowCount: audited.length,
    blankCurrentTitle: audited.filter((row) => !row.current.canonical_title).length,
    byReviewStatus: countBy(proposedRows, "title_review_status"),
    byTitleSource: countBy(proposedRows, "title_source"),
    byCanonicalTitle: titleCounts,
    needsReview: audited.filter((row) => row.proposed.title_review_status === "needs_review").length,
    flaggedRows: audited.filter((row) => (row.proposed.titleFlags || []).length).length,
  };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const auditPath = path.join(process.cwd(), "data", "audit", `segments_title_governance_${stamp}.json`);
  writeJson(auditPath, { summary, rows: audited });

  const reviewRows = audited
    .filter((row) => row.proposed.title_review_status === "needs_review" || (row.proposed.titleFlags || []).length)
    .slice(0, REVIEW_LIMIT > 0 ? REVIEW_LIMIT : undefined);
  const batchDir = path.join(process.cwd(), "data", "audit", "segments_title_review_batches");
  const batches = splitIntoBatches(reviewRows, BATCH_SIZE);
  const batchFiles = [];
  batches.forEach((batch, index) => {
    const file = path.join(batchDir, `segments_title_review_batch_${String(index + 1).padStart(2, "0")}_${stamp}.json`);
    writeJson(file, batch);
    batchFiles.push(file);
  });

  console.log(JSON.stringify({
    summary,
    auditPath,
    reviewRows: reviewRows.length,
    batchFiles,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
