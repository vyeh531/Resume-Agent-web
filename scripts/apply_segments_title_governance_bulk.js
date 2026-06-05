"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const ALL_SCOPES = process.argv.includes("--all-scopes");
const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
const chunkArg = process.argv.find((arg) => arg.startsWith("--chunk-size="));
if (!fileArg) {
  console.error("Usage: node scripts/apply_segments_title_governance_bulk.js --file=data/audit/...json [--apply] [--chunk-size=1000]");
  process.exit(1);
}

const REVIEW_FILE = fileArg.slice("--file=".length);
const CHUNK_SIZE = Math.max(1, Number(chunkArg?.split("=")[1] || 1000));

function loadRows() {
  const fullPath = path.resolve(process.cwd(), REVIEW_FILE);
  const parsed = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  const rows = Array.isArray(parsed) ? parsed : parsed.rows;
  if (!Array.isArray(rows) || !rows.length) throw new Error(`No rows in ${fullPath}`);
  return { fullPath, rows: rows.map((row) => row.proposed ? { id: row.id, ...row.proposed } : row) };
}

function chunks(rows, size) {
  const out = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size));
  return out;
}

async function backupRows(pool, rows, suffix) {
  const ids = rows.map((row) => Number(row.id)).filter(Boolean);
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
  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_title_governance_${Date.now()}_${suffix}.jsonl`);
  fs.writeFileSync(backupPath, currentRows.map((row) => JSON.stringify(row)).join("\n") + "\n");
  return backupPath;
}

async function applyChunk(pool, rows) {
  const payload = rows.map((row) => ({
    id: Number(row.id),
    canonical_title: row.canonical_title || "",
    title_review_status: row.title_review_status || "",
    title_source: row.title_source || "",
    title_confidence: row.title_confidence == null ? null : Number(row.title_confidence),
  }));
  const scopePredicate = ALL_SCOPES ? "" : "AND (s.retrieval_scope IS NULL OR s.retrieval_scope = 'resume_edit')";
  const { rowCount } = await pool.query(
    `
    WITH input AS (
      SELECT *
        FROM jsonb_to_recordset($1::jsonb)
             AS x(id int, canonical_title text, title_review_status text, title_source text, title_confidence numeric)
    )
    UPDATE segments AS s
       SET canonical_title = input.canonical_title,
           title_review_status = input.title_review_status,
           title_source = input.title_source,
           title_confidence = input.title_confidence,
           retrieval_text = concat_ws(E'\n',
             s.topic,
             s."L1",
             s."L2",
             input.canonical_title,
             s."P_mentor",
             COALESCE(NULLIF(s."A_action", ''), s.action_summary),
             s."I_insight",
             s."HR_os",
             s.keywords,
             s.problem_tags,
             s.role_family,
             s.target_roles,
             s.canonical_action_family,
             s.action_depth,
             s.action_specificity
           )
     FROM input
     WHERE s.id = input.id
       ${scopePredicate}
    `,
    [JSON.stringify(payload)]
  );
  return rowCount;
}

async function main() {
  const { fullPath, rows } = loadRows();
  const ids = rows.map((row) => Number(row.id)).filter(Boolean);
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const { rows: counts } = await pool.query(
    `SELECT COUNT(*)::int AS matched,
            COUNT(*) FILTER (WHERE COALESCE(canonical_title, '') <> '')::int AS already_titled
       FROM segments
      WHERE id = ANY($1::int[])`,
    [ids]
  );
  console.log(JSON.stringify({
    apply: APPLY,
    allScopes: ALL_SCOPES,
    reviewFile: fullPath,
    requestedRows: rows.length,
    chunkSize: CHUNK_SIZE,
    matchedRows: counts[0].matched,
    alreadyTitled: counts[0].already_titled,
  }, null, 2));

  if (!APPLY) return;

  let changedRows = 0;
  const rowChunks = chunks(rows, CHUNK_SIZE);
  for (let index = 0; index < rowChunks.length; index += 1) {
    const suffix = `part_${String(index + 1).padStart(3, "0")}`;
    const chunk = rowChunks[index];
    const backupPath = await backupRows(pool, chunk, suffix);
    console.log(`backup=${backupPath}`);
    await pool.query("BEGIN");
    try {
      changedRows += await applyChunk(pool, chunk);
      await pool.query("COMMIT");
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
    console.log(`updated=${changedRows}/${rows.length}`);
  }
  console.log(JSON.stringify({ changedRows }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
