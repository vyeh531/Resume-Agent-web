"use strict";

const fs = require("fs");
const path = require("path");

const INPUT_FILE = (process.argv.find((arg) => arg.startsWith("--file=")) || "").slice("--file=".length);
const SAMPLE_LIMIT = Number((process.argv.find((arg) => arg.startsWith("--sample=")) || "").slice("--sample=".length)) || 10;

const EN_COLUMNS = [
  "advice_card_title_en",
  "user_problem_summary_en",
  "action_summary_en",
  "canonical_title_en",
  "humanized_mentor_insight_en",
  "humanized_hr_perspective_en",
];

const SOURCE_COLUMNS = [
  "advice_card_title",
  "user_problem_summary",
  "action_summary",
  "canonical_title",
  "humanized_mentor_insight",
  "humanized_hr_perspective",
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

function extractNumbers(value) {
  return [...String(value || "").matchAll(/\b\d+(?:[.,:/-]\d+)*(?:%|k|K|m|M)?\b/g)].map((match) => match[0].toLowerCase());
}

function extractLatinTokens(value) {
  const ignored = new Set(["the", "and", "or", "with", "for", "from", "into", "your", "you", "are", "is", "to", "of", "in"]);
  return [...String(value || "").matchAll(/\b[A-Za-z][A-Za-z0-9+#./-]{1,}\b/g)]
    .map((match) => match[0])
    .filter((token) => !ignored.has(token.toLowerCase()));
}

function missingTokens(sourceTokens, targetText) {
  const target = String(targetText || "").toLowerCase();
  return [...new Set(sourceTokens)].filter((token) => !target.includes(token.toLowerCase()));
}

function rowsFromCsv(filePath) {
  const raw = fs.readFileSync(path.resolve(filePath), "utf8").replace(/^\uFEFF/, "");
  const table = parseCsv(raw);
  const headers = table.shift();
  if (!headers?.length) throw new Error("CSV is empty");
  return table.map((values) => {
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    row.id = Number(row.id);
    return row;
  });
}

function main() {
  if (!INPUT_FILE) throw new Error("--file is required");
  const rows = rowsFromCsv(INPUT_FILE);
  const seen = new Set();
  const duplicateIds = new Set();
  const missingByColumn = Object.fromEntries(EN_COLUMNS.map((column) => [column, 0]));
  const cjkByColumn = Object.fromEntries(EN_COLUMNS.map((column) => [column, 0]));
  const incompleteSamples = [];
  const cjkSamples = [];
  const numberIssueSamples = [];
  const latinTokenIssueSamples = [];
  const shortTranslationSamples = [];
  let rowsWithNumberIssues = 0;
  let rowsWithLatinTokenIssues = 0;
  let rowsWithShortTranslations = 0;
  let completeRows = 0;

  for (const row of rows) {
    if (seen.has(row.id)) duplicateIds.add(row.id);
    seen.add(row.id);
    const missingColumns = EN_COLUMNS.filter((column) => !String(row[column] || "").trim());
    const cjkColumns = EN_COLUMNS.filter((column) => hasCjk(row[column]));
    const sourceText = SOURCE_COLUMNS.map((column) => row[column] || "").join(" ");
    const englishText = EN_COLUMNS.map((column) => row[column] || "").join(" ");
    for (const column of missingColumns) missingByColumn[column] += 1;
    for (const column of cjkColumns) cjkByColumn[column] += 1;
    if (!missingColumns.length) {
      completeRows += 1;
      const sourceNumbers = extractNumbers(sourceText);
      const englishNumbers = extractNumbers(englishText);
      const extraNumbers = [...new Set(englishNumbers)].filter((number) => !sourceNumbers.includes(number));
      const missingNumbers = [...new Set(sourceNumbers)].filter((number) => !englishNumbers.includes(number));
      if (extraNumbers.length || missingNumbers.length) {
        rowsWithNumberIssues += 1;
        if (numberIssueSamples.length < SAMPLE_LIMIT) {
          numberIssueSamples.push({
            id: row.id,
            extraNumbers,
            missingNumbers,
          });
        }
      }
      const missingLatinTokens = missingTokens(extractLatinTokens(sourceText), englishText);
      if (missingLatinTokens.length) {
        rowsWithLatinTokenIssues += 1;
        if (latinTokenIssueSamples.length < SAMPLE_LIMIT) {
          latinTokenIssueSamples.push({
            id: row.id,
            missingLatinTokens: missingLatinTokens.slice(0, 20),
          });
        }
      }
      const shortColumns = EN_COLUMNS.filter((column) => String(row[column] || "").trim().length > 0 && String(row[column] || "").trim().length < 8);
      if (shortColumns.length) {
        rowsWithShortTranslations += 1;
        if (shortTranslationSamples.length < SAMPLE_LIMIT) {
          shortTranslationSamples.push({
            id: row.id,
            shortColumns,
          });
        }
      }
    }
    else if (incompleteSamples.length < SAMPLE_LIMIT) {
      incompleteSamples.push({
        id: row.id,
        missingColumns,
        advice_card_title: row.advice_card_title || "",
      });
    }
    if (cjkColumns.length && cjkSamples.length < SAMPLE_LIMIT) {
      cjkSamples.push({
        id: row.id,
        cjkColumns,
      });
    }
  }

  console.log(JSON.stringify({
    filePath: path.resolve(INPUT_FILE),
    totalRows: rows.length,
    completeRows,
    incompleteRows: rows.length - completeRows,
    duplicateIds: [...duplicateIds],
    missingByColumn,
    cjkByColumn,
    qaWarnings: {
      rowsWithNumberIssues,
      rowsWithLatinTokenIssues,
      rowsWithShortTranslations,
    },
    sampleIncompleteRows: incompleteSamples,
    sampleCjkRows: cjkSamples,
    sampleNumberIssueRows: numberIssueSamples,
    sampleLatinTokenIssueRows: latinTokenIssueSamples,
    sampleShortTranslationRows: shortTranslationSamples,
  }, null, 2));
}

main();
