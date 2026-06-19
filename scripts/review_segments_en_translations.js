"use strict";

const fs = require("fs");
const path = require("path");

const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
const dirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const INPUT_FILE = fileArg ? fileArg.slice("--file=".length) : "";
const INPUT_DIR = dirArg ? dirArg.slice("--dir=".length) : path.join("outputs", "segment-translations");

const EN_COLUMNS = [
  "advice_card_title_en",
  "user_problem_summary_en",
  "action_summary_en",
  "canonical_title_en",
  "humanized_mentor_insight_en",
  "humanized_hr_perspective_en",
  "humanized_mentor_insight_raw_en",
  "humanized_hr_perspective_raw_en",
  "humanized_mentor_insight_generalized_en",
  "humanized_hr_perspective_generalized_en",
];

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ""));
}

function hasMojibake(value) {
  return /(?:Ã|Â|â|æ|ç|è|é|å|ä|ï|ðŸ)/.test(String(value || ""));
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function rowsFromPayload(payload) {
  if (Array.isArray(payload)) return { rows: payload, shape: "raw-array" };
  if (Array.isArray(payload.rows)) return { rows: payload.rows, shape: "payload" };
  return { rows: [], shape: "unknown" };
}

function reviewRow(row) {
  const problems = [];
  if (!Number.isInteger(Number(row.id)) || Number(row.id) <= 0) problems.push("invalid id");
  const hasNewShape = EN_COLUMNS.some((column) => Object.prototype.hasOwnProperty.call(row, column));
  if (!hasNewShape) problems.push("missing *_en fields (raw model output, not apply-ready)");
  for (const column of EN_COLUMNS) {
    const value = row[column];
    if (!value) continue;
    if (hasCjk(value)) problems.push(`${column}: contains CJK`);
    if (hasMojibake(value)) problems.push(`${column}: possible mojibake`);
  }
  if (hasNewShape) {
    if (!row.advice_card_title_en && !row.canonical_title_en) problems.push("missing title");
    if (!row.action_summary_en) problems.push("missing action");
  }
  return problems;
}

function summarizeFile(filePath) {
  let payload;
  try {
    payload = readJson(filePath);
  } catch (error) {
    return {
      filePath,
      parseOk: false,
      error: error.message,
    };
  }
  const { rows, shape } = rowsFromPayload(payload);
  const seen = new Set();
  const duplicateIds = new Set();
  const reviewed = rows.map((row) => {
    const id = Number(row.id);
    if (seen.has(id)) duplicateIds.add(id);
    seen.add(id);
    const problems = reviewRow(row);
    const existingRecommendation = row.review?.recommendation || row.translation_review_status || "";
    const recommendation = problems.length ? "hold" : (existingRecommendation === "approved" ? "approved" : "approved");
    return { id, recommendation, problems };
  });
  const holdRows = reviewed.filter((row) => row.problems.length);
  const approvedRows = reviewed.filter((row) => !row.problems.length);
  return {
    filePath,
    parseOk: true,
    shape,
    rows: rows.length,
    approved: approvedRows.length,
    hold: holdRows.length,
    duplicateIds: [...duplicateIds],
    applyReady: shape === "payload" && rows.length > 0 && !holdRows.length && duplicateIds.size === 0,
    sampleHolds: holdRows.slice(0, 10),
  };
}

function listInputFiles() {
  if (INPUT_FILE) return [path.resolve(INPUT_FILE)];
  if (!fs.existsSync(INPUT_DIR)) return [];
  return fs.readdirSync(INPUT_DIR)
    .filter((file) => /^segments_en_.*\.json$/i.test(file))
    .map((file) => path.resolve(INPUT_DIR, file))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
}

function main() {
  const files = listInputFiles();
  if (!files.length) {
    console.log(JSON.stringify({ files: 0, message: "No segments_en_*.json files found." }, null, 2));
    return;
  }
  const summaries = files.map(summarizeFile);
  const totals = summaries.reduce((acc, summary) => {
    if (!summary.parseOk) {
      acc.parseFailed += 1;
      return acc;
    }
    acc.rows += summary.rows;
    acc.approved += summary.approved;
    acc.hold += summary.hold;
    acc.applyReadyFiles += summary.applyReady ? 1 : 0;
    acc.duplicateIds += summary.duplicateIds.length;
    return acc;
  }, {
    rows: 0,
    approved: 0,
    hold: 0,
    parseFailed: 0,
    applyReadyFiles: 0,
    duplicateIds: 0,
  });
  console.log(JSON.stringify({ files: summaries.length, totals, summaries }, null, 2));
}

main();
