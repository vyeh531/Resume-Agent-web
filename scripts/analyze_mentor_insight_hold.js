"use strict";

const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const OUT = stringArg("--out", "");
const LIMIT_EXAMPLES = numberArg("--examples", 30);
const INPUTS = argv.filter((arg) => !arg.startsWith("--"));

function stringArg(name, fallback) {
  const raw = argv.find((arg) => arg.startsWith(`${name}=`));
  return raw ? raw.slice(name.length + 1) : fallback;
}

function numberArg(name, fallback) {
  const raw = argv.find((arg) => arg.startsWith(`${name}=`));
  if (!raw) return fallback;
  const value = Number(raw.slice(name.length + 1));
  return Number.isFinite(value) ? value : fallback;
}

function top(counts, limit = 30) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function add(counts, key) {
  if (!key) return;
  counts[key] = (counts[key] || 0) + 1;
}

function compact(value, max = 260) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

function readRows(file) {
  const resolved = path.resolve(process.cwd(), file);
  const payload = JSON.parse(fs.readFileSync(resolved, "utf8"));
  return Array.isArray(payload.rows) ? payload.rows : [];
}

function analyze(files) {
  const families = {};
  const flags = {};
  const lostSignals = {};
  const blockingCombos = {};
  const buckets = {};
  const examples = [];
  let rowCount = 0;

  for (const file of files) {
    for (const row of readRows(file)) {
      rowCount += 1;
      const family = row.mentor_rule_family || "unknown";
      const rowFlags = row.review && Array.isArray(row.review.flags) ? row.review.flags : [];
      const rowSignals = row.review && Array.isArray(row.review.lostRequiredSignals) ? row.review.lostRequiredSignals : [];
      add(families, family);
      for (const flag of rowFlags) add(flags, flag);
      for (const signal of rowSignals) {
        add(lostSignals, signal);
        add(buckets, `${family} :: ${signal}`);
      }
      add(blockingCombos, rowFlags.filter((flag) => flag !== "lost_detail_risk" && flag !== "mentor_generic_template_risk").sort().join("+") || "advisory_only");

      if (examples.length < LIMIT_EXAMPLES && (rowFlags.includes("lost_required_signal") || rowFlags.includes("wrong_family_risk"))) {
        examples.push({
          id: row.id,
          family,
          flags: rowFlags,
          lostRequiredSignals: rowSignals,
          title: row.title || "",
          source: compact(row.original && row.original.source_text_for_generation),
          proposed: compact(row.proposed && row.proposed.humanized_mentor_insight),
        });
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    files,
    rowCount,
    topFamilies: top(families),
    topFlags: top(flags),
    topLostRequiredSignals: top(lostSignals),
    topFamilySignalBuckets: top(buckets, 40),
    topBlockingCombos: top(blockingCombos, 20),
    examples,
  };
}

function main() {
  if (!INPUTS.length) {
    throw new Error("Usage: node scripts\\analyze_mentor_insight_hold.js <hold.json...> [--out=path] [--examples=30]");
  }
  const result = analyze(INPUTS);
  const text = JSON.stringify(result, null, 2) + "\n";
  if (OUT) {
    const resolved = path.resolve(process.cwd(), OUT);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, text, "utf8");
  }
  process.stdout.write(text);
}

if (require.main === module) {
  main();
}

module.exports = { analyze };
