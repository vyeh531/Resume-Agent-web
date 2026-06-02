"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
const REVIEW_FILE = fileArg ? fileArg.slice("--file=".length) : "data/audit/segments_manual_review_scope_batch1.json";

const UPDATE_COLUMNS = [
  "retrieval_scope",
  "topic",
  "L1",
  "L2",
  "topic_slug",
  "advice_type",
  "problem_tags",
  "ats_dimensions",
  "role_family",
  "target_roles",
  "generality",
];

function loadReviews() {
  const fullPath = path.resolve(process.cwd(), REVIEW_FILE);
  const rows = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  if (!Array.isArray(rows) || !rows.length) {
    throw new Error(`Review file has no rows: ${fullPath}`);
  }
  return { fullPath, rows };
}

function compact(row) {
  const out = { id: row.id };
  for (const column of UPDATE_COLUMNS) out[column] = row[column] || "";
  return out;
}

async function main() {
  const { fullPath, rows: reviews } = loadReviews();
  const ids = reviews.map((row) => row.id);
  const reviewById = new Map(reviews.map((row) => [row.id, row]));

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const current = await pool.query(
    `SELECT id, ${UPDATE_COLUMNS.map((column) => `"${column}"`).join(", ")}
       FROM segments
      WHERE id = ANY($1::int[])
      ORDER BY id`,
    [ids]
  );

  const diffs = current.rows.map((before) => {
    const proposed = reviewById.get(before.id);
    const changes = {};
    for (const column of UPDATE_COLUMNS) {
      const oldValue = before[column] || "";
      const newValue = proposed[column] || "";
      if (oldValue !== newValue) changes[column] = { from: oldValue, to: newValue };
    }
    return {
      id: before.id,
      changes,
      review_note: proposed.review_note || "",
    };
  }).filter((row) => Object.keys(row.changes).length);

  console.log(JSON.stringify({
    apply: APPLY,
    review_file: fullPath,
    requested_rows: reviews.length,
    matched_rows: current.rows.length,
    changed_rows: diffs.length,
  }, null, 2));

  for (const diff of diffs) {
    console.log(`\n# id=${diff.id} ${diff.review_note}`);
    for (const [column, value] of Object.entries(diff.changes)) {
      console.log(`- ${column}: ${JSON.stringify(value.from)} -> ${JSON.stringify(value.to)}`);
    }
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing diffs.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_manual_review_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(current.rows.map(compact), null, 2));
  console.log(`\nbackup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    for (const review of reviews) {
      await pool.query(
        `UPDATE segments
            SET retrieval_scope = $2,
                topic = $3,
                "L1" = $4,
                "L2" = $5,
                topic_slug = $6,
                advice_type = $7,
                problem_tags = $8,
                ats_dimensions = $9,
                role_family = $10,
                target_roles = $11,
                generality = $12
          WHERE id = $1`,
        [
          review.id,
          review.retrieval_scope,
          review.topic,
          review.L1,
          review.L2,
          review.topic_slug,
          review.advice_type,
          review.problem_tags,
          review.ats_dimensions,
          review.role_family,
          review.target_roles,
          review.generality,
        ]
      );
    }
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
