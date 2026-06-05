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
  console.error("Usage: node scripts/apply_segments_action_governance.js --file=data/audit/...json [--apply] [--allow-unreviewed]");
  process.exit(1);
}

const REVIEW_FILE = fileArg.slice("--file=".length);
const UPDATE_COLUMNS = [
  "action_specificity",
  "display_action_mode",
  "generalized_action",
  "activation_role_family",
  "activation_keywords",
  "grounding_terms",
  "canonical_action_family",
  "action_depth",
  "action_review_status",
];

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
  const out = { id: row.id };
  for (const column of UPDATE_COLUMNS) out[column] = source[column] || "";
  return out;
}

function assertApplyRowsAreReviewed(reviews = []) {
  if (!APPLY || ALLOW_UNREVIEWED) return;
  const unapproved = reviews.filter((row) => row.action_review_status !== "approved");
  if (!unapproved.length) return;
  const sample = unapproved.slice(0, 12).map((row) => ({
    id: row.id,
    action_review_status: row.action_review_status || "",
  }));
  throw new Error(
    `Refusing to apply ${unapproved.length} unapproved governance rows. ` +
    `Set action_review_status='approved' after review, or rerun with --allow-unreviewed for an intentional bulk write. ` +
    `Sample=${JSON.stringify(sample)}`
  );
}

function buildRetrievalText(current, proposed) {
  return [
    current.topic,
    current.L1,
    current.L2,
    current.P_mentor,
    proposed.generalized_action || current.A_action || current.action_summary,
    current.I_insight,
    current.HR_os,
    current.keywords,
    current.problem_tags,
    current.role_family,
    current.target_roles,
    proposed.canonical_action_family,
    proposed.action_depth,
    proposed.action_specificity,
  ].filter(Boolean).join("\n");
}

async function main() {
  const { fullPath, rows } = loadRows();
  const reviews = rows.map(proposedFor);
  assertApplyRowsAreReviewed(reviews);
  const ids = [...new Set(reviews.map((row) => Number(row.id)).filter(Boolean))];
  const byId = new Map(reviews.map((row) => [Number(row.id), row]));
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const { rows: currentRows } = await pool.query(
    `SELECT id, topic, "L1", "L2", "P_mentor", "A_action", "I_insight", "HR_os",
            action_summary, keywords, problem_tags, role_family, target_roles, retrieval_text,
            ${UPDATE_COLUMNS.map((column) => `"${column}"`).join(", ")}
       FROM segments
      WHERE id = ANY($1::int[])
      ORDER BY id`,
    [ids]
  );

  const diffs = currentRows.map((current) => {
    const proposed = byId.get(Number(current.id));
    const changes = {};
    for (const column of UPDATE_COLUMNS) {
      const from = current[column] || "";
      const to = proposed[column] || "";
      if (from !== to) changes[column] = { from, to };
    }
    const nextRetrievalText = buildRetrievalText(current, proposed);
    if (compact(current.retrieval_text) !== compact(nextRetrievalText)) {
      changes.retrieval_text = {
        from: compact(current.retrieval_text).slice(0, 180),
        to: compact(nextRetrievalText).slice(0, 180),
      };
    }
    return { id: current.id, proposed, current, changes, nextRetrievalText };
  }).filter((row) => Object.keys(row.changes).length);

  console.log(JSON.stringify({
    apply: APPLY,
    reviewFile: fullPath,
    requestedRows: rows.length,
    matchedRows: currentRows.length,
    changedRows: diffs.length,
  }, null, 2));

  for (const diff of diffs.slice(0, 80)) {
    console.log(`\n# id=${diff.id}`);
    for (const [column, change] of Object.entries(diff.changes)) {
      console.log(`- ${column}: ${JSON.stringify(change.from)} -> ${JSON.stringify(change.to)}`);
    }
  }
  if (diffs.length > 80) console.log(`\n... ${diffs.length - 80} more changed rows`);

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing diffs.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_action_governance_${Date.now()}.jsonl`);
  fs.writeFileSync(backupPath, currentRows.map((row) => JSON.stringify(row)).join("\n") + "\n");
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    for (const diff of diffs) {
      const p = diff.proposed;
      await pool.query(
        `UPDATE segments
            SET action_specificity = $2,
                display_action_mode = $3,
                generalized_action = $4,
                activation_role_family = $5,
                activation_keywords = $6,
                grounding_terms = $7,
                canonical_action_family = $8,
                action_depth = $9,
                action_review_status = $10,
                retrieval_text = $11
          WHERE id = $1`,
        [
          diff.id,
          p.action_specificity,
          p.display_action_mode,
          p.generalized_action,
          p.activation_role_family,
          p.activation_keywords,
          p.grounding_terms,
          p.canonical_action_family,
          p.action_depth,
          p.action_review_status,
          diff.nextRetrievalText,
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
