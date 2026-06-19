"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const OUT_FILE = (process.argv.find((arg) => arg.startsWith("--out=")) || "").slice("--out=".length);
const LIMIT_ARG = (process.argv.find((arg) => arg.startsWith("--limit=")) || "").slice("--limit=".length);
const NO_BOM = process.argv.includes("--no-bom");
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG) : null;

function csvCell(value) {
  if (value == null) return "\"\"";
  const text = value instanceof Date
    ? value.toISOString()
    : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function ensureOutputDir() {
  const dir = path.join(process.cwd(), "outputs", "segments");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function loadColumns(pool) {
  const { rows } = await pool.query(`
    SELECT column_name
      FROM information_schema.columns
     WHERE table_schema = 'vibe_offer'
       AND table_name = 'segments'
     ORDER BY ordinal_position
  `);
  return rows.map((row) => row.column_name);
}

function quoteIdentifier(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function main() {
  if (LIMIT != null && (!Number.isInteger(LIMIT) || LIMIT <= 0)) {
    throw new Error("--limit must be a positive integer.");
  }

  const pool = db.getPool();
  try {
    const columns = await loadColumns(pool);
    if (!columns.length) throw new Error("No columns found for vibe_offer.segments.");

    const selectList = columns.map(quoteIdentifier).join(", ");
    const sql = `SELECT ${selectList} FROM segments ORDER BY id ASC${LIMIT ? " LIMIT $1" : ""}`;
    const { rows } = await pool.query(sql, LIMIT ? [LIMIT] : []);

    const csv = [
      columns.map(csvCell).join(","),
      ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
    ].join("\r\n");

    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outPath = path.resolve(OUT_FILE || path.join(ensureOutputDir(), `segments_${stamp}.csv`));
    fs.writeFileSync(outPath, `${NO_BOM ? "" : "\uFEFF"}${csv}\r\n`, "utf8");

    console.log(JSON.stringify({
      table: "vibe_offer.segments",
      rows: rows.length,
      columns: columns.length,
      encoding: NO_BOM ? "utf8" : "utf8-bom",
      outPath,
    }, null, 2));
  } finally {
    await db.closeDB();
  }
}

main().catch((error) => {
  console.error(error);
  db.closeDB().finally(() => process.exit(1));
});
