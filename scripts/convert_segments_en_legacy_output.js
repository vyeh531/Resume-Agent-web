"use strict";

const fs = require("fs");
const path = require("path");

const fileArg = process.argv.find((arg) => arg.startsWith("--file="));
if (!fileArg) {
  console.error("Usage: node scripts/convert_segments_en_legacy_output.js --file=outputs/segment-translations/segments_en_...json");
  process.exit(1);
}

const INPUT_FILE = path.resolve(fileArg.slice("--file=".length));

const MAP = {
  advice_card_title: "advice_card_title_en",
  user_problem_summary: "user_problem_summary_en",
  action_summary: "action_summary_en",
  canonical_title: "canonical_title_en",
  humanized_mentor_insight: "humanized_mentor_insight_en",
  humanized_hr_perspective: "humanized_hr_perspective_en",
  humanized_mentor_insight_raw: "humanized_mentor_insight_raw_en",
  humanized_hr_perspective_raw: "humanized_hr_perspective_raw_en",
  humanized_mentor_insight_generalized: "humanized_mentor_insight_generalized_en",
  humanized_hr_perspective_generalized: "humanized_hr_perspective_generalized_en",
};

const EN_COLUMNS = Object.values(MAP);

function compact(value, max = 1600) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function hasCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ""));
}

function hasMojibake(value) {
  return /(?:Ã|Â|â|æ|ç|è|é|å|ä|ï|ðŸ)/.test(String(value || ""));
}

function rowsFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.rows)) return payload.rows;
  return [];
}

function convertRow(row) {
  const converted = {
    id: Number(row.id),
    translation_review_status: "pending_review",
    translation_source: row.translation_source || "legacy_conversion",
    review: { problems: [], recommendation: "approved" },
    source: row.source || {},
  };

  for (const [legacy, target] of Object.entries(MAP)) {
    converted[target] = compact(row[target] || row[legacy] || "");
  }

  for (const column of EN_COLUMNS) {
    const value = converted[column];
    if (!value) continue;
    if (hasCjk(value)) converted.review.problems.push(`${column}: contains CJK`);
    if (hasMojibake(value)) converted.review.problems.push(`${column}: possible mojibake`);
  }
  if (!converted.advice_card_title_en && !converted.canonical_title_en) converted.review.problems.push("missing title");
  if (!converted.action_summary_en) converted.review.problems.push("missing action");
  converted.review.recommendation = converted.review.problems.length ? "hold" : "approved";
  return converted;
}

function main() {
  const payload = JSON.parse(fs.readFileSync(INPUT_FILE, "utf8"));
  const rows = rowsFromPayload(payload).map(convertRow);
  const outPath = INPUT_FILE.replace(/\.json$/i, "_converted.json");
  fs.writeFileSync(outPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    sourceFile: INPUT_FILE,
    mode: "converted-legacy-output",
    rows,
  }, null, 2));
  console.log(JSON.stringify({
    rows: rows.length,
    approved: rows.filter((row) => row.review.recommendation === "approved").length,
    hold: rows.filter((row) => row.review.recommendation !== "approved").length,
    outPath,
  }, null, 2));
}

main();
