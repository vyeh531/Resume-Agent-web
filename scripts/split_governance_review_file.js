"use strict";

const fs = require("fs");
const path = require("path");

const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
const sizeArg = process.argv.find((arg) => arg.startsWith("--size="));
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
if (!fileArg) {
  console.error("Usage: node scripts/split_governance_review_file.js --file=data/audit/...json [--size=800]");
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), fileArg.slice("--file=".length));
const size = Math.max(1, Number(sizeArg?.split("=")[1] || 800));
const limit = Number(limitArg?.split("=")[1] || 0);
const parsed = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const sourceRows = Array.isArray(parsed) ? parsed : parsed.rows;
const rows = limit > 0 ? sourceRows.slice(0, limit) : sourceRows;
if (!Array.isArray(rows) || !rows.length) throw new Error(`No rows found in ${inputPath}`);

const baseName = path.basename(inputPath, ".json");
const outDir = path.join(path.dirname(inputPath), `${baseName}_parts`);
fs.mkdirSync(outDir, { recursive: true });

const outputs = [];
for (let i = 0; i < rows.length; i += size) {
  const partRows = rows.slice(i, i + size);
  const partNo = String(outputs.length + 1).padStart(3, "0");
  const outPath = path.join(outDir, `${baseName}_part_${partNo}.json`);
  fs.writeFileSync(outPath, JSON.stringify({
    sourceFile: inputPath,
    part: outputs.length + 1,
    offset: i,
    rowCount: partRows.length,
    rows: partRows,
  }, null, 2));
  outputs.push(outPath);
}

console.log(JSON.stringify({
  input: inputPath,
  size,
  partCount: outputs.length,
  outputDir: outDir,
  outputs,
}, null, 2));
