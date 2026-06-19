"use strict";

const fs = require("fs");
const path = require("path");

const INPUT_DIR = (process.argv.find((arg) => arg.startsWith("--dir=")) || "").slice("--dir=".length);
const OUT_FILE = (process.argv.find((arg) => arg.startsWith("--out=")) || "").slice("--out=".length);

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
  if (!INPUT_DIR) throw new Error("--dir is required");
  const inputDir = path.resolve(INPUT_DIR);
  const files = fs.readdirSync(inputDir)
    .filter((file) => /\.csv$/i.test(file))
    .map((file) => path.join(inputDir, file))
    .sort();
  if (!files.length) throw new Error("No CSV files found in --dir");
  let headers = null;
  const byId = new Map();
  const duplicateIds = new Set();
  for (const file of files) {
    const table = parseCsv(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
    const fileHeaders = table.shift();
    if (!headers) headers = fileHeaders;
    if (JSON.stringify(headers) !== JSON.stringify(fileHeaders)) {
      throw new Error(`Header mismatch in ${file}`);
    }
    const idIndex = headers.indexOf("id");
    if (idIndex < 0) throw new Error("CSV is missing id column");
    for (const row of table) {
      const id = Number(row[idIndex]);
      if (byId.has(id)) duplicateIds.add(id);
      byId.set(id, row);
    }
  }
  const rows = [...byId.values()].sort((a, b) => Number(a[headers.indexOf("id")]) - Number(b[headers.indexOf("id")]));
  const outPath = path.resolve(OUT_FILE || path.join(path.dirname(inputDir), `${path.basename(inputDir)}_merged.csv`));
  writeCsv(outPath, headers, rows);
  console.log(JSON.stringify({
    inputDir,
    files: files.length,
    rows: rows.length,
    duplicateIds: [...duplicateIds],
    outPath,
  }, null, 2));
}

main();
