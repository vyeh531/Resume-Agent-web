"use strict";

const fs = require("fs");
const path = require("path");

const auditArg = process.argv.find((arg) => arg.startsWith("--audit="));
if (!auditArg) {
  console.error("Usage: node scripts/build_auto_classified_governance_review.js --audit=data/audit/segments_action_governance_*.json");
  process.exit(1);
}

const auditPath = path.resolve(process.cwd(), auditArg.slice("--audit=".length));
const parsed = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const rows = Array.isArray(parsed) ? parsed : parsed.rows;
if (!Array.isArray(rows)) throw new Error(`No rows found in ${auditPath}`);

const reviewRows = rows
  .filter((row) => {
    const current = row.current || {};
    const proposed = row.proposed || {};
    return !current.action_specificity
      && !current.display_action_mode
      && proposed.action_specificity === "generic"
      && proposed.display_action_mode === "raw"
      && proposed.action_review_status === "auto_classified";
  })
  .map((row) => ({
    id: row.id,
    action_specificity: "generic",
    display_action_mode: "raw",
    generalized_action: "",
    activation_role_family: "",
    activation_keywords: "",
    grounding_terms: "",
    canonical_action_family: row.proposed.canonical_action_family || "",
    action_depth: row.proposed.action_depth || "",
    action_review_status: "auto_classified",
  }));

if (!reviewRows.length) throw new Error("No blank generic/raw auto-classified rows found.");

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = path.join(process.cwd(), "data", "audit", "segments_action_review_batches");
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `reviewed_auto_classified_generic_raw_${stamp}.json`);
fs.writeFileSync(outPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  sourceAudit: auditPath,
  rowCount: reviewRows.length,
  rows: reviewRows,
}, null, 2));

console.log(JSON.stringify({
  sourceAudit: auditPath,
  output: outPath,
  rowCount: reviewRows.length,
}, null, 2));
