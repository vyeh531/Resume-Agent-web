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
  console.error("Usage: node scripts/apply_segments_title_governance.js --file=data/audit/...json [--apply] [--allow-unreviewed]");
  process.exit(1);
}

const REVIEW_FILE = fileArg.slice("--file=".length);
const UPDATE_COLUMNS = ["canonical_title", "title_review_status", "title_source", "title_confidence"];

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
    canonical_title: source.canonical_title || "",
    title_review_status: source.title_review_status || "",
    title_source: source.title_source || "",
    title_confidence: source.title_confidence == null ? null : Number(source.title_confidence),
  };
}

function assertRowsCanApply(rows) {
  if (!APPLY || ALLOW_UNREVIEWED) return;
  const bad = rows.filter((row) => row.title_review_status !== "approved");
  if (!bad.length) return;
  throw new Error(`Refusing to apply ${bad.length} title rows without approved status. Use --allow-unreviewed for rule backfill.`);
}

function buildRetrievalText(current, proposed) {
  return [
    current.topic,
    current.L1,
    current.L2,
    proposed.canonical_title,
    current.P_mentor,
    current.A_action || current.action_summary,
    current.I_insight,
    current.HR_os,
    current.keywords,
    current.problem_tags,
    current.role_family,
    current.target_roles,
    current.canonical_action_family,
    current.action_depth,
    current.action_specificity,
  ].filter(Boolean).join("\n");
}

async function main() {
  const { fullPath, rows } = loadRows();
  const reviews = rows.map(proposedFor);
  assertRowsCanApply(reviews);
  const ids = [...new Set(reviews.map((row) => row.id).filter(Boolean))];
  const byId = new Map(reviews.map((row) => [row.id, row]));
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const { rows: currentRows } = await pool.query(
    `SELECT id, topic, "L1", "L2", "P_mentor", "A_action", "I_insight", "HR_os",
            action_summary, keywords, problem_tags, role_family, target_roles,
            canonical_action_family, action_depth, action_specificity,
            retrieval_text, canonical_title, title_review_status, title_source, title_confidence
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
    const nextRetrievalText = buildRetrievalText(current, proposed);
    if (compact(current.retrieval_text) !== compact(nextRetrievalText)) {
      changes.retrieval_text = {
        from: compact(current.retrieval_text).slice(0, 180),
        to: compact(nextRetrievalText).slice(0, 180),
      };
    }
    return { id: current.id, current, proposed, changes, nextRetrievalText };
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
  const backupPath = path.join(backupDir, `segments_title_governance_${Date.now()}.jsonl`);
  fs.writeFileSync(backupPath, currentRows.map((row) => JSON.stringify(row)).join("\n") + "\n");
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    for (const diff of diffs) {
      const p = diff.proposed;
      await pool.query(
        `UPDATE segments
            SET canonical_title = $2,
                title_review_status = $3,
                title_source = $4,
                title_confidence = $5,
                retrieval_text = $6
          WHERE id = $1`,
        [diff.id, p.canonical_title, p.title_review_status, p.title_source, p.title_confidence, diff.nextRetrievalText]
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
