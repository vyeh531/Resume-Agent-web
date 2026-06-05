"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const COMMIT_PER_CHUNK = process.argv.includes("--commit-per-chunk");
const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
const chunkArg = process.argv.find((arg) => arg.startsWith("--chunk-size="));
if (!fileArg) {
  console.error("Usage: node scripts/apply_auto_classified_governance_bulk.js --file=data/audit/...json [--apply] [--chunk-size=1000]");
  process.exit(1);
}

const REVIEW_FILE = fileArg.slice("--file=".length);
const CHUNK_SIZE = Math.max(1, Number(chunkArg?.split("=")[1] || 1000));

function loadRows() {
  const fullPath = path.resolve(process.cwd(), REVIEW_FILE);
  const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  const rows = Array.isArray(parsed) ? parsed : parsed.rows;
  if (!Array.isArray(rows) || !rows.length) throw new Error(`No rows in ${fullPath}`);
  for (const row of rows) {
    if (
      row.action_specificity !== "generic" ||
      row.display_action_mode !== "raw" ||
      row.action_review_status !== "auto_classified"
    ) {
      throw new Error(`Bulk script only accepts generic/raw auto_classified rows. Bad row id=${row.id}`);
    }
  }
  return { fullPath, rows };
}

function chunks(rows, size) {
  const out = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

async function countMatches(pool, rows) {
  const ids = rows.map((row) => Number(row.id)).filter(Boolean);
  const { rows: result } = await pool.query(
    `SELECT COUNT(*)::int AS matched,
            COUNT(*) FILTER (
              WHERE COALESCE(action_specificity, '') <> ''
                 OR COALESCE(display_action_mode, '') <> ''
                 OR COALESCE(action_review_status, '') <> ''
            )::int AS already_governed
       FROM segments
      WHERE id = ANY($1::int[])`,
    [ids]
  );
  return result[0];
}

async function backupRows(pool, rows, suffix = "") {
  const ids = rows.map((row) => Number(row.id)).filter(Boolean);
  const { rows: currentRows } = await pool.query(
    `SELECT id, topic, "L1", "L2", "P_mentor", "A_action", "I_insight", "HR_os",
            action_summary, keywords, problem_tags, role_family, target_roles, retrieval_text,
            action_specificity, display_action_mode, generalized_action,
            activation_role_family, activation_keywords, grounding_terms,
            canonical_action_family, action_depth, action_review_status
       FROM segments
      WHERE id = ANY($1::int[])
      ORDER BY id`,
    [ids]
  );
  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_auto_classified_governance_${Date.now()}${suffix}.jsonl`);
  fs.writeFileSync(backupPath, currentRows.map((row) => JSON.stringify(row)).join("\n") + "\n");
  return backupPath;
}

async function applyChunk(pool, rows) {
  const payload = rows.map((row) => ({
    id: Number(row.id),
    canonical_action_family: row.canonical_action_family || "",
    action_depth: row.action_depth || "",
  }));
  const { rowCount } = await pool.query(
    `
    WITH input AS (
      SELECT *
        FROM jsonb_to_recordset($1::jsonb)
             AS x(id int, canonical_action_family text, action_depth text)
    )
    UPDATE segments AS s
       SET action_specificity = 'generic',
           display_action_mode = 'raw',
           generalized_action = '',
           activation_role_family = '',
           activation_keywords = '',
           grounding_terms = '',
           canonical_action_family = input.canonical_action_family,
           action_depth = input.action_depth,
           action_review_status = 'auto_classified',
           retrieval_text = concat_ws(E'\n',
             s.topic,
             s."L1",
             s."L2",
             s."P_mentor",
             COALESCE(NULLIF(s."A_action", ''), s.action_summary),
             s."I_insight",
             s."HR_os",
             s.keywords,
             s.problem_tags,
             s.role_family,
             s.target_roles,
             input.canonical_action_family,
             input.action_depth,
             'generic'
           )
      FROM input
     WHERE s.id = input.id
       AND (s.retrieval_scope IS NULL OR s.retrieval_scope = 'resume_edit')
       AND COALESCE(s.action_specificity, '') = ''
       AND COALESCE(s.display_action_mode, '') = ''
       AND COALESCE(s.action_review_status, '') = ''
    `,
    [JSON.stringify(payload)]
  );
  return rowCount;
}

async function main() {
  const { fullPath, rows } = loadRows();
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const preflight = await countMatches(pool, rows);
  console.log(JSON.stringify({
    apply: APPLY,
    reviewFile: fullPath,
    requestedRows: rows.length,
    chunkSize: CHUNK_SIZE,
    commitPerChunk: COMMIT_PER_CHUNK,
    matchedRows: preflight.matched,
    alreadyGoverned: preflight.already_governed,
  }, null, 2));

  if (!APPLY) return;

  let changedRows = 0;
  const rowChunks = chunks(rows, CHUNK_SIZE);
  try {
    for (let index = 0; index < rowChunks.length; index += 1) {
      const chunk = rowChunks[index];
      const suffix = `_part_${String(index + 1).padStart(3, "0")}`;
      const backupPath = await backupRows(pool, chunk, suffix);
      console.log(`backup=${backupPath}`);
      if (COMMIT_PER_CHUNK) await pool.query("BEGIN");
      else if (index === 0) await pool.query("BEGIN");
      changedRows += await applyChunk(pool, chunk);
      console.log(`updated=${changedRows}/${rows.length}`);
      if (COMMIT_PER_CHUNK) await pool.query("COMMIT");
    }
    if (!COMMIT_PER_CHUNK) await pool.query("COMMIT");
  } catch (error) {
    try {
      await pool.query("ROLLBACK");
    } catch (_) {
      // Ignore rollback failures when a per-chunk transaction already committed.
    }
    throw error;
  }
  console.log(JSON.stringify({ changedRows }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
