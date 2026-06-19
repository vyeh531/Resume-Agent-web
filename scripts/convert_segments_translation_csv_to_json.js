"use strict";

const fs = require("fs");
const path = require("path");

const INPUT_FILE = (process.argv.find((arg) => arg.startsWith("--file=")) || "").slice("--file=".length);
const OUT_FILE = (process.argv.find((arg) => arg.startsWith("--out=")) || "").slice("--out=".length);
const COMPLETED_ONLY = process.argv.includes("--completed-only");

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

function reviewRow(row) {
  const problems = [];
  if (!Number.isInteger(Number(row.id)) || Number(row.id) <= 0) problems.push("invalid id");
  for (const column of EN_COLUMNS) {
    if (!row[column]) problems.push(`missing ${column}`);
    if (hasCjk(row[column])) problems.push(`${column}: contains CJK`);
  }
  return problems;
}

function main() {
  if (!INPUT_FILE) throw new Error("--file is required");
  const raw = fs.readFileSync(path.resolve(INPUT_FILE), "utf8").replace(/^\uFEFF/, "");
  const table = parseCsv(raw);
  const headers = table.shift();
  if (!headers?.length) throw new Error("CSV is empty");
  const sourceRows = table.map((values) => {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    row.id = Number(row.id);
    row.translation_source = "manual_csv";
    const problems = reviewRow(row);
    row.translation_review_status = problems.length ? "pending_review" : "approved";
    row.review = {
      problems,
      recommendation: problems.length ? "hold" : "approved",
    };
    return row;
  });
  const rows = COMPLETED_ONLY
    ? sourceRows.filter((row) => row.review.recommendation === "approved")
    : sourceRows;
  const payload = {
    generatedAt: new Date().toISOString(),
    mode: "manual-csv-converted",
    profile: "core",
    sourceFile: path.resolve(INPUT_FILE),
    completedOnly: COMPLETED_ONLY,
    rows,
  };
  const defaultSuffix = COMPLETED_ONLY ? "_completed_apply.json" : "_apply.json";
  const outPath = path.resolve(OUT_FILE || INPUT_FILE.replace(/\.csv$/i, defaultSuffix));
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(JSON.stringify({
    sourceRows: sourceRows.length,
    rows: rows.length,
    approved: rows.filter((row) => row.review.recommendation === "approved").length,
    hold: rows.filter((row) => row.review.recommendation !== "approved").length,
    completedOnly: COMPLETED_ONLY,
    outPath,
  }, null, 2));
}

main();
