"use strict";

const fs = require("fs");
const path = require("path");

const INPUT_FILE = (process.argv.find((arg) => arg.startsWith("--file=")) || "").slice("--file=".length);
const OUT_DIR = (process.argv.find((arg) => arg.startsWith("--out-dir=")) || "").slice("--out-dir=".length);
const ROWS_PER_FILE = Number((process.argv.find((arg) => arg.startsWith("--rows-per-file=")) || "").slice("--rows-per-file=".length)) || 1000;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (inQuotes && char === "\"" && next === "\"") {
      cell += "\"";
      i += 1;
      continue;
    }
    if (char === "\"") {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    if (row.some((value) => value !== "")) rows.push(row);
  }
  return rows;
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function writeCsv(filePath, headers, rows) {
  const csv = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\r\n");
  fs.writeFileSync(filePath, `\uFEFF${csv}`, "utf8");
}

function main() {
  if (!INPUT_FILE) throw new Error("--file is required");
  if (!Number.isInteger(ROWS_PER_FILE) || ROWS_PER_FILE <= 0) throw new Error("--rows-per-file must be a positive integer");
  const inputPath = path.resolve(INPUT_FILE);
  const outputDir = path.resolve(OUT_DIR || path.join(path.dirname(inputPath), `${path.basename(inputPath, ".csv")}_chunks`));
  fs.mkdirSync(outputDir, { recursive: true });
  const table = parseCsv(fs.readFileSync(inputPath, "utf8").replace(/^\uFEFF/, ""));
  const headers = table.shift();
  if (!headers?.length) throw new Error("CSV is empty");
  const files = [];
  for (let index = 0; index < table.length; index += ROWS_PER_FILE) {
    const rows = table.slice(index, index + ROWS_PER_FILE);
    const fileName = `${path.basename(inputPath, ".csv")}_part_${String(files.length + 1).padStart(3, "0")}.csv`;
    const filePath = path.join(outputDir, fileName);
    writeCsv(filePath, headers, rows);
    files.push({ filePath, rows: rows.length });
  }
  console.log(JSON.stringify({
    inputPath,
    outputDir,
    rows: table.length,
    rowsPerFile: ROWS_PER_FILE,
    files,
  }, null, 2));
}

main();
