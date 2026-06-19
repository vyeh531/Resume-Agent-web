"use strict";

const fs = require("fs");
const path = require("path");

const dirArg = process.argv.find((arg) => arg.startsWith("--dir="));
const outArg = process.argv.find((arg) => arg.startsWith("--out="));
const includePartials = process.argv.includes("--include-partials");
const includeMerged = process.argv.includes("--include-merged");
const keepHolds = process.argv.includes("--keep-holds");
const allowEmpty = process.argv.includes("--allow-empty");
const INPUT_DIR = dirArg ? dirArg.slice("--dir=".length) : path.join("outputs", "segment-translations");
const OUTPUT_FILE = outArg ? outArg.slice("--out=".length) : "";

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
  return /(?:Ãƒ|Ã‚|Ã¢|Ã¦|Ã§|Ã¨|Ã©|Ã¥|Ã¤|Ã¯|Ã°Å¸)/.test(String(value || ""));
}

function rowsFromPayload(payload) {
  if (Array.isArray(payload)) return { rows: payload, profile: "unknown" };
  if (Array.isArray(payload.rows)) return { rows: payload.rows, profile: payload.profile || "unknown" };
  return { rows: [], profile: "unknown" };
}

function reviewRow(row) {
  const problems = [];
  if (!Number.isInteger(Number(row.id)) || Number(row.id) <= 0) problems.push("invalid id");
  const hasEnShape = EN_COLUMNS.some((column) => Object.prototype.hasOwnProperty.call(row, column));
  if (!hasEnShape) problems.push("missing *_en fields");
  for (const column of EN_COLUMNS) {
    const value = row[column];
    if (!value) continue;
    if (hasCjk(value)) problems.push(`${column}: contains CJK`);
    if (hasMojibake(value)) problems.push(`${column}: possible mojibake`);
  }
  if (hasEnShape) {
    if (!row.advice_card_title_en && !row.canonical_title_en) problems.push("missing title");
    if (!row.action_summary_en) problems.push("missing action");
  }
  return problems;
}

function listFiles() {
  if (!fs.existsSync(INPUT_DIR)) return [];
  return fs.readdirSync(INPUT_DIR)
    .filter((file) => /^segments_en_.*\.json$/i.test(file))
    .filter((file) => includePartials || !/_partial(?:_converted)?\.json$/i.test(file))
    .filter((file) => includeMerged || !/^segments_en_merged_/i.test(file))
    .map((file) => path.resolve(INPUT_DIR, file))
    .sort((a, b) => fs.statSync(a).mtimeMs - fs.statSync(b).mtimeMs);
}

function readRows(filePath) {
  const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const { rows, profile } = rowsFromPayload(payload);
  return rows.map((row) => ({ ...row, _sourceFile: filePath, _profile: profile }));
}

function rank(row) {
  const approved = row.review?.recommendation === "approved" || row.translation_review_status === "approved";
  const hasProblems = reviewRow(row).length > 0;
  if (approved && !hasProblems) return 3;
  if (!hasProblems) return 2;
  return 1;
}

function main() {
  const files = listFiles();
  const byId = new Map();
  let loadedRows = 0;
  for (const file of files) {
    const rows = readRows(file);
    loadedRows += rows.length;
    for (const row of rows) {
      const id = Number(row.id);
      if (!id) continue;
      const existing = byId.get(id);
      if (!existing || rank(row) >= rank(existing)) byId.set(id, row);
    }
  }
  const rows = [...byId.values()]
    .map((row) => {
      const problems = reviewRow(row);
      return {
        ...row,
        review: {
          ...(row.review || {}),
          problems,
          recommendation: problems.length ? "hold" : "approved",
        },
        translation_review_status: problems.length ? "pending_review" : "approved",
      };
    })
    .filter((row) => keepHolds || row.review.recommendation === "approved")
    .sort((a, b) => Number(a.id) - Number(b.id));
  const profile = rows.some((row) => row._profile === "full") ? "full" : "core";
  if (!rows.length && !allowEmpty) {
    console.log(JSON.stringify({
      files: files.length,
      loadedRows,
      uniqueRows: byId.size,
      outputRows: 0,
      keptHolds: keepHolds,
      includePartials,
      includeMerged,
      outPath: null,
      message: "No approved rows to merge. Use --keep-holds to inspect holds or --allow-empty to write an empty payload.",
    }, null, 2));
    return;
  }
  const payload = {
    generatedAt: new Date().toISOString(),
    mode: "merged",
    profile,
    sourceFiles: files,
    loadedRows,
    rows,
  };
  const outPath = path.resolve(OUTPUT_FILE || path.join(INPUT_DIR, `segments_en_merged_${new Date().toISOString().replace(/[:.]/g, "-")}.json`));
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify({
    files: files.length,
    loadedRows,
    uniqueRows: byId.size,
    outputRows: rows.length,
    keptHolds: keepHolds,
    includePartials,
    includeMerged,
    outPath,
  }, null, 2));
}

main();
