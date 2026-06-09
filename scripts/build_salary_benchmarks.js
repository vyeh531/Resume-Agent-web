#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const JSZip = require("jszip");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_ALIAS_PATH = path.join(ROOT, "data", "salary", "role_family_aliases.json");
const DEFAULT_OUTPUT_PATH = path.join(ROOT, "data", "salary_benchmarks.generated.json");
const DEFAULT_RAW_DIR = path.join(ROOT, "data", "salary", "raw");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    const item = argv[i];
    if (!item.startsWith("--")) continue;
    const key = item.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i += 1;
    }
  }
  return args;
}

function usage() {
  console.log(`
Build local salary benchmarks from BLS OEWS TXT/CSV data.

Usage:
  node scripts/build_salary_benchmarks.js --input <oews-all-data.txt|csv|zip> [--output data/salary_benchmarks.generated.json]

Options:
  --input       Official BLS OEWS All Data TXT/CSV file, or ZIP containing TXT/CSV.
  --output      Output benchmark JSON path. Defaults to data/salary_benchmarks.generated.json.
  --aliases     Role family alias JSON. Defaults to data/salary/role_family_aliases.json.
  --year        Source year label. Defaults to 2025.

Notes:
  - Download the BLS OEWS "All data (TXT)" file manually if automated download is blocked.
  - The generated file is read by services/salaryTrajectory.js before the small seed fallback.
`);
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function normalizeHeader(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function detectDelimiter(line) {
  const tabs = (line.match(/\t/g) || []).length;
  const commas = (line.match(/,/g) || []).length;
  return tabs > commas ? "\t" : ",";
}

function splitCsvLine(line, delimiter) {
  const out = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      out.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out.map((value) => value.trim());
}

function parseDelimited(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) return [];
  const delimiter = detectDelimiter(lines[0]);
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line, delimiter);
    return headers.reduce((row, header, index) => {
      row[header] = cells[index] || "";
      return row;
    }, {});
  });
}

async function readInputRows(inputPath) {
  const abs = path.resolve(ROOT, inputPath);
  if (!fs.existsSync(abs)) throw new Error(`Input file not found: ${abs}`);
  const ext = path.extname(abs).toLowerCase();
  if (ext === ".zip") {
    const zip = await JSZip.loadAsync(fs.readFileSync(abs));
    const candidate = Object.values(zip.files)
      .filter((file) => !file.dir)
      .find((file) => /\.(txt|csv|tsv)$/i.test(file.name));
    if (!candidate) throw new Error("ZIP did not contain a TXT/CSV/TSV file. Use the BLS OEWS All data (TXT) download.");
    return parseDelimited(await candidate.async("string"));
  }
  return parseDelimited(fs.readFileSync(abs, "utf8"));
}

function cleanNumber(value) {
  const text = String(value || "").replace(/[$,]/g, "").trim();
  if (!text || text === "*" || text === "#" || text.toLowerCase() === "na") return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function pick(row, keys) {
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== "") return row[key];
  }
  return "";
}

function annual(row, percentile) {
  const key = percentile === "median" ? ["a_median", "annual_median"] : [`a_pct${percentile}`, `annual_pct${percentile}`];
  const value = cleanNumber(pick(row, key));
  if (value) return value;
  const hourlyKey = percentile === "median" ? ["h_median", "hourly_median"] : [`h_pct${percentile}`, `hourly_pct${percentile}`];
  const hourly = cleanNumber(pick(row, hourlyKey));
  return hourly ? Math.round(hourly * 2080) : null;
}

function isUsableOccupationRow(row) {
  const occCode = pick(row, ["occ_code", "occupation_code"]);
  const occTitle = pick(row, ["occ_title", "occupation_title"]);
  if (!occCode || !occTitle) return false;
  if (!/^\d{2}-\d{4}$/.test(occCode)) return false;
  const group = String(pick(row, ["o_group", "occ_group", "occupation_group"]) || "").toLowerCase();
  return !group || ["detailed", "broad", "major", "minor"].includes(group);
}

function areaInfo(row) {
  const areaTitle = pick(row, ["area_title", "area_name", "area"]);
  const areaType = String(pick(row, ["area_type", "a_type"]) || "").toLowerCase();
  const primState = pick(row, ["prim_state", "state", "state_abbr"]);
  const isNational = /u\.?s\.?|united states|national/i.test(areaTitle) || areaType === "1" || areaType === "national";
  const isState = Boolean(primState) || areaType === "2" || areaType === "state";
  return {
    location_scope: isNational ? "national" : isState ? "state" : "area",
    location_name: isNational ? "United States" : areaTitle || primState || "United States",
  };
}

function benchmarkFromRow(row, meta, aliases, year) {
  const p25 = annual(row, "25");
  const median = annual(row, "median");
  const p75 = annual(row, "75");
  const p90 = annual(row, "90");
  if (!median || !p75 || !p90) return null;
  const occCode = pick(row, ["occ_code", "occupation_code"]);
  const occTitle = pick(row, ["occ_title", "occupation_title"]);
  return {
    role_family: meta.role_family,
    family_label: meta.family_label,
    soc_code: occCode,
    soc_title: occTitle,
    keywords: Array.from(new Set([...(meta.keywords || []), occTitle])),
    location_scope: meta.location_scope,
    location_name: meta.location_name,
    annual_p25: p25 || Math.round(median * 0.8),
    annual_median: median,
    annual_p75: p75,
    annual_p90: p90,
    source: "BLS OEWS official downloadable data / O*NET-SOC aligned",
    source_year: year,
    confidence: aliases ? "medium" : "low",
  };
}

function buildBenchmarks(rows, aliases, year) {
  const aliasBySoc = new Map();
  for (const alias of aliases) {
    for (const code of alias.soc_codes || []) {
      const list = aliasBySoc.get(code) || [];
      list.push(alias);
      aliasBySoc.set(code, list);
    }
  }

  const output = [];
  const seen = new Set();
  for (const row of rows.filter(isUsableOccupationRow)) {
    const occCode = pick(row, ["occ_code", "occupation_code"]);
    const occTitle = pick(row, ["occ_title", "occupation_title"]);
    const area = areaInfo(row);
    const aliasMatches = aliasBySoc.get(occCode) || [];
    const metas = aliasMatches.length ? aliasMatches : [{
      role_family: `soc_${occCode.replace(/-/g, "_")}`,
      family_label: occTitle,
      keywords: [occTitle],
    }];
    for (const meta of metas) {
      const enrichedMeta = { ...meta, ...area };
      const benchmark = benchmarkFromRow(row, enrichedMeta, aliasMatches.length > 0, year);
      if (!benchmark) continue;
      const key = `${benchmark.role_family}|${benchmark.soc_code}|${benchmark.location_scope}|${benchmark.location_name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      output.push(benchmark);
    }
  }
  return output.sort((a, b) =>
    a.role_family.localeCompare(b.role_family)
    || a.location_scope.localeCompare(b.location_scope)
    || a.location_name.localeCompare(b.location_name)
    || a.soc_code.localeCompare(b.soc_code)
  );
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help || args.h) {
    usage();
    return;
  }
  const input = args.input || findDefaultInput();
  if (!input) {
    usage();
    throw new Error(`No input file provided. Put BLS OEWS TXT/CSV/ZIP in ${DEFAULT_RAW_DIR} or pass --input.`);
  }
  const aliases = readJson(path.resolve(ROOT, args.aliases || DEFAULT_ALIAS_PATH));
  const rows = await readInputRows(input);
  const benchmarks = buildBenchmarks(rows, aliases, args.year || "2025");
  if (!benchmarks.length) throw new Error("No salary benchmarks were generated. Check input headers and wage columns.");
  const output = path.resolve(ROOT, args.output || DEFAULT_OUTPUT_PATH);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(benchmarks, null, 2) + "\n", "utf8");
  console.log(`[salary] generated ${benchmarks.length} benchmarks`);
  console.log(`[salary] output ${output}`);
}

function findDefaultInput() {
  if (!fs.existsSync(DEFAULT_RAW_DIR)) return null;
  const file = fs.readdirSync(DEFAULT_RAW_DIR).find((name) => /\.(zip|txt|csv|tsv)$/i.test(name));
  return file ? path.join(DEFAULT_RAW_DIR, file) : null;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`[salary] ${error.message}`);
    process.exit(1);
  });
}

module.exports = {
  parseDelimited,
  buildBenchmarks,
};
