"use strict";

const fs = require("fs");
const path = require("path");

const AUDIT_ARG = process.argv.find((arg) => arg.startsWith("--audit="))?.split("=")[1];
const auditPath = AUDIT_ARG || path.join(process.cwd(), "data", "audits", "role_retrieval_audit_1780440282961.json");

function riskScore(result) {
  const flags = result.mismatches?.length || 0;
  const buried = result.buried?.length || 0;
  const positions = result.positionCount || 0;
  const topWeight = Math.min(12, flags) / 12;
  const buriedWeight = Math.min(5, buried) / 5;
  const positionWeight = Math.min(1, positions / 20);
  return Number((topWeight * 0.65 + buriedWeight * 0.25 + positionWeight * 0.1).toFixed(4));
}

function compact(value, length = 120) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, length);
}

function main() {
  const results = JSON.parse(fs.readFileSync(auditPath, "utf8"));
  const queue = results
    .map((result) => ({
      family: result.profile.family,
      group: result.profile.group,
      targetRole: result.profile.targetRole,
      positions: result.positionCount,
      riskScore: riskScore(result),
      flaggedTopRows: result.mismatches.length,
      buriedCandidates: result.buried.length,
      flaggedIds: result.mismatches.map((item) => item.adviceId).slice(0, 12),
      buriedIds: result.buried.map((item) => item.id).slice(0, 8),
      firstFlag: result.mismatches[0]
        ? {
            adviceId: result.mismatches[0].adviceId,
            roleFamily: result.mismatches[0].roleFamily,
            targetRoles: result.mismatches[0].targetRoles,
            title: compact(result.mismatches[0].title),
          }
        : null,
      firstBuried: result.buried[0]
        ? {
            id: result.buried[0].id,
            roleFamily: result.buried[0].role_family,
            targetRoles: result.buried[0].target_roles,
            title: compact(result.buried[0].advice_card_title || result.buried[0].user_problem_summary),
          }
        : null,
    }))
    .sort((a, b) => b.riskScore - a.riskScore || b.flaggedTopRows - a.flaggedTopRows || b.positions - a.positions);

  const outDir = path.join(process.cwd(), "data", "audits");
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = Date.now();
  const jsonPath = path.join(outDir, `role_cleanup_queue_${stamp}.json`);
  const mdPath = path.join(outDir, `role_cleanup_queue_${stamp}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(queue, null, 2));

  const lines = ["# Role Cleanup Queue", "", `Source: ${auditPath}`, "", "| Rank | Family | Group | Positions | Risk | Flags | Buried |", "| ---: | --- | --- | ---: | ---: | ---: | ---: |"];
  queue.forEach((item, index) => {
    lines.push(`| ${index + 1} | ${item.family} | ${item.group} | ${item.positions} | ${item.riskScore} | ${item.flaggedTopRows} | ${item.buriedCandidates} |`);
  });
  lines.push("");
  lines.push("## First Pass Batches");
  const batchSize = 5;
  for (let i = 0; i < queue.length; i += batchSize) {
    const batch = queue.slice(i, i + batchSize);
    lines.push(`- Batch ${Math.floor(i / batchSize) + 1}: ${batch.map((item) => item.family).join(", ")}`);
  }
  fs.writeFileSync(mdPath, lines.join("\n"));

  console.log(JSON.stringify({ count: queue.length, jsonPath, mdPath, top10: queue.slice(0, 10) }, null, 2));
}

main();
