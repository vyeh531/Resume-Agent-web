"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const ALLOW_UNREVIEWED = process.argv.includes("--allow-unreviewed");
const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
if (!fileArg) {
  console.error("Usage: node scripts/apply_segments_perspective_governance.js --file=data/audits/...json [--apply] [--allow-unreviewed]");
  process.exit(1);
}

const REVIEW_FILE = fileArg.slice("--file=".length);
const UPDATE_COLUMNS = [
  "humanized_mentor_insight",
  "humanized_hr_perspective",
  "humanized_mentor_insight_raw",
  "humanized_hr_perspective_raw",
  "humanized_mentor_insight_generalized",
  "humanized_hr_perspective_generalized",
  "perspective_review_status",
  "perspective_source",
  "perspective_confidence",
];

async function columnExists(pool, column) {
  const { rows } = await pool.query(
    `SELECT 1
       FROM information_schema.columns
      WHERE table_schema = 'vibe_offer'
        AND table_name = 'segments'
        AND column_name = $1
      LIMIT 1`,
    [column]
  );
  return Boolean(rows[0]);
}

async function assertColumnsExistForApply(pool) {
  if (!APPLY) return;
  const missing = [];
  for (const column of UPDATE_COLUMNS) {
    if (!(await columnExists(pool, column))) missing.push(column);
  }
  if (missing.length) {
    throw new Error(`Missing perspective column(s): ${missing.join(", ")}. Run scripts/migrate_segments_perspective_governance.js --apply first.`);
  }
}

function compact(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function loadRows() {
  const fullPath = path.resolve(process.cwd(), REVIEW_FILE);
  const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  const rows = Array.isArray(parsed) ? parsed : parsed.rows;
  if (!Array.isArray(rows) || !rows.length) throw new Error(`No rows in ${fullPath}`);
  return { fullPath, rows };
}

function proposedFor(row) {
  const source = row.proposed || row;
  return {
    id: Number(row.id),
    humanized_mentor_insight: compact(source.humanized_mentor_insight),
    humanized_hr_perspective: compact(source.humanized_hr_perspective),
    humanized_mentor_insight_raw: compact(source.humanized_mentor_insight_raw),
    humanized_hr_perspective_raw: compact(source.humanized_hr_perspective_raw),
    humanized_mentor_insight_generalized: compact(source.humanized_mentor_insight_generalized),
    humanized_hr_perspective_generalized: compact(source.humanized_hr_perspective_generalized),
    perspective_review_status: compact(source.perspective_review_status || "needs_review"),
    perspective_source: compact(source.perspective_source || "manual_review"),
    perspective_confidence: source.perspective_confidence == null ? null : Number(source.perspective_confidence),
  };
}

function assertRowsCanApply(rows) {
  if (!APPLY || ALLOW_UNREVIEWED) return;
  const bad = rows.filter((row) => row.perspective_review_status !== "approved");
  if (!bad.length) return;
  throw new Error(`Refusing to apply ${bad.length} perspective rows without approved status. Use --allow-unreviewed only for intentional backfills.`);
}

async function main() {
  const { fullPath, rows } = loadRows();
  const reviews = rows.map(proposedFor);
  assertRowsCanApply(reviews);
  const ids = [...new Set(reviews.map((row) => row.id).filter(Boolean))];
  const byId = new Map(reviews.map((row) => [row.id, row]));
  const pool = db.getPool();
  await assertColumnsExistForApply(pool);
  await pool.query("SET statement_timeout = '10min'");
  const { rows: currentRows } = await pool.query(
    `SELECT id, topic, "L1", "L2", "P_mentor", "A_action", "I_insight", "HR_os",
            action_summary, keywords, problem_tags, role_family, target_roles,
            canonical_action_family, action_depth, action_specificity,
            retrieval_text, canonical_title,
            to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
            to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
            to_jsonb(segments)->>'humanized_mentor_insight_raw' AS humanized_mentor_insight_raw,
            to_jsonb(segments)->>'humanized_hr_perspective_raw' AS humanized_hr_perspective_raw,
            to_jsonb(segments)->>'humanized_mentor_insight_generalized' AS humanized_mentor_insight_generalized,
            to_jsonb(segments)->>'humanized_hr_perspective_generalized' AS humanized_hr_perspective_generalized,
            to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status,
            to_jsonb(segments)->>'perspective_source' AS perspective_source,
            to_jsonb(segments)->>'perspective_confidence' AS perspective_confidence
       FROM segments
      WHERE id = ANY($1::int[])
      ORDER BY id`,
    [ids]
  );

  const diffs = currentRows.map((current) => {
    const proposed = byId.get(Number(current.id));
    const changes = {};
    for (const column of UPDATE_COLUMNS) {
      const from = current[column] == null ? "" : String(current[column]);
      const to = proposed[column] == null ? "" : String(proposed[column]);
      if (from !== to) changes[column] = { from, to };
    }
    return { id: current.id, current, proposed, changes };
  }).filter((row) => Object.keys(row.changes).length);

  console.log(JSON.stringify({
    apply: APPLY,
    reviewFile: fullPath,
    requestedRows: rows.length,
    matchedRows: currentRows.length,
    changedRows: diffs.length,
  }, null, 2));

  for (const diff of diffs.slice(0, 60)) {
    console.log(`\n# id=${diff.id}`);
    for (const [column, change] of Object.entries(diff.changes)) {
      console.log(`- ${column}: ${JSON.stringify(change.from)} -> ${JSON.stringify(change.to)}`);
    }
  }
  if (diffs.length > 60) console.log(`\n... ${diffs.length - 60} more changed rows`);
  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing diffs.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_perspective_governance_${Date.now()}.jsonl`);
  fs.writeFileSync(backupPath, currentRows.map((row) => JSON.stringify(row)).join("\n") + "\n");
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    for (const diff of diffs) {
      const p = diff.proposed;
      await pool.query(
        `UPDATE segments
            SET humanized_mentor_insight = $2,
                humanized_hr_perspective = $3,
                humanized_mentor_insight_raw = $4,
                humanized_hr_perspective_raw = $5,
                humanized_mentor_insight_generalized = $6,
                humanized_hr_perspective_generalized = $7,
                perspective_review_status = $8,
                perspective_source = $9,
                perspective_confidence = $10
          WHERE id = $1`,
        [
          diff.id,
          p.humanized_mentor_insight,
          p.humanized_hr_perspective,
          p.humanized_mentor_insight_raw,
          p.humanized_hr_perspective_raw,
          p.humanized_mentor_insight_generalized,
          p.humanized_hr_perspective_generalized,
          p.perspective_review_status,
          p.perspective_source,
          p.perspective_confidence,
        ]
      );
    }
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
  console.log("Apply complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
