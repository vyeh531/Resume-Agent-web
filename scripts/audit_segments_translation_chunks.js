"use strict";

const fs = require("fs");
const path = require("path");

const INPUT_DIR = (process.argv.find((arg) => arg.startsWith("--dir=")) || "").slice("--dir=".length);
const SAMPLE_LIMIT = Number((process.argv.find((arg) => arg.startsWith("--sample=")) || "").slice("--sample=".length)) || 5;

const EN_COLUMNS = [
  "advice_card_title_en",
  "user_problem_summary_en",
  "action_summary_en",
  "canonical_title_en",
  "humanized_mentor_insight_en",
  "humanized_hr_perspective_en",
];

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

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ""));
}

function rowsFromCsv(filePath) {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  const table = parseCsv(raw);
  const headers = table.shift();
  if (!headers?.length) throw new Error(`CSV is empty: ${filePath}`);
  return table.map((values) => {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    row.id = Number(row.id);
    return row;
  });
}

function summarizeFile(filePath) {
  const rows = rowsFromCsv(filePath);
  const seen = new Set();
  const duplicateIds = new Set();
  const missingByColumn = Object.fromEntries(EN_COLUMNS.map((column) => [column, 0]));
  const cjkByColumn = Object.fromEntries(EN_COLUMNS.map((column) => [column, 0]));
  const incompleteSamples = [];
  let completeRows = 0;
  for (const row of rows) {
    if (seen.has(row.id)) duplicateIds.add(row.id);
    seen.add(row.id);
    const missingColumns = EN_COLUMNS.filter((column) => !String(row[column] || "").trim());
    const cjkColumns = EN_COLUMNS.filter((column) => hasCjk(row[column]));
    for (const column of missingColumns) missingByColumn[column] += 1;
    for (const column of cjkColumns) cjkByColumn[column] += 1;
    if (!missingColumns.length) completeRows += 1;
    else if (incompleteSamples.length < SAMPLE_LIMIT) {
      incompleteSamples.push({
        id: row.id,
        missingColumns,
        advice_card_title: row.advice_card_title || "",
      });
    }
  }
  return {
    filePath,
    rows: rows.length,
    completeRows,
    incompleteRows: rows.length - completeRows,
    duplicateIds: [...duplicateIds],
    missingByColumn,
    cjkByColumn,
    sampleIncompleteRows: incompleteSamples,
  };
}

function main() {
  if (!INPUT_DIR) throw new Error("--dir is required");
  const inputDir = path.resolve(INPUT_DIR);
  const files = fs.readdirSync(inputDir)
    .filter((file) => /\.csv$/i.test(file))
    .map((file) => path.join(inputDir, file))
    .sort();
  if (!files.length) throw new Error("No CSV files found in --dir");
  const summaries = files.map(summarizeFile);
  const totals = summaries.reduce((acc, summary) => {
    acc.rows += summary.rows;
    acc.completeRows += summary.completeRows;
    acc.incompleteRows += summary.incompleteRows;
    acc.duplicateIds.push(...summary.duplicateIds);
    for (const column of EN_COLUMNS) {
      acc.missingByColumn[column] += summary.missingByColumn[column];
      acc.cjkByColumn[column] += summary.cjkByColumn[column];
    }
    return acc;
  }, {
    rows: 0,
    completeRows: 0,
    incompleteRows: 0,
    duplicateIds: [],
    missingByColumn: Object.fromEntries(EN_COLUMNS.map((column) => [column, 0])),
    cjkByColumn: Object.fromEntries(EN_COLUMNS.map((column) => [column, 0])),
  });
  console.log(JSON.stringify({
    inputDir,
    files: summaries.length,
    totals: {
      ...totals,
      duplicateIds: [...new Set(totals.duplicateIds)],
    },
    summaries,
  }, null, 2));
}

main();
