"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const FAIL_ON_MISSING = process.argv.includes("--fail-on-missing");

const DERIVED_TAGS = [
  "low_jd_keyword_match",
  "low_hard_skill_match",
  "missing_exact_job_title",
  "weak_experience_keyword_evidence",
  "keyword_gap_minor",
  "career_growth_optimization",
];

const TAG_ALIASES = {
  keyword_gap_critical: "low_jd_keyword_match",
  keyword_gap_major: "low_jd_keyword_match",
  keyword_gap_minor: "low_jd_keyword_match",
  insufficient_quantification: "low_measurable_results",
  weak_verbs: "weak_action_verbs",
  missing_tools: "low_hard_skill_match",
  low_bullet_coverage: "weak_experience_keyword_evidence",
  no_relocate_signal: "missing_relocation_signal",
  short_tenure_unexplained: "short_tenure_unclear",
  role_mismatch: "weak_target_role_alignment",
  summary_missing_role: "weak_summary_role_alignment",
};

function normalizeTag(tag) {
  return String(tag || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function extractAtsScorerTags() {
  const filePath = path.join(process.cwd(), "src", "ats", "ats-scorer.js");
  const text = fs.readFileSync(filePath, "utf8");
  const match = text.match(/const\s+PROBLEM_TAG_DEFS\s*=\s*\{([\s\S]*?)\n\};/);
  if (!match) throw new Error("Could not locate PROBLEM_TAG_DEFS in src/ats/ats-scorer.js");
  const tags = [];
  const keyPattern = /^\s*([a-zA-Z0-9_]+)\s*:/gm;
  let keyMatch;
  while ((keyMatch = keyPattern.exec(match[1]))) {
    tags.push(normalizeTag(keyMatch[1]));
  }
  return tags.filter(Boolean);
}

async function tableExists(pool, tableName) {
  const { rows } = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
          FROM information_schema.tables
         WHERE table_schema = current_schema()
           AND table_name = $1
      ) AS exists
    `,
    [tableName]
  );
  return Boolean(rows[0]?.exists);
}

async function coverageCount(pool, tag, hasJoinTable) {
  if (hasJoinTable) {
    const { rows } = await pool.query(
      `
        SELECT COUNT(DISTINCT s.id)::int AS count
          FROM segment_problem_tags AS spt
          JOIN segments AS s ON s.id = spt.segment_id
         WHERE s.retrieval_scope = 'resume_edit'
           AND spt.problem_tag = $1
      `,
      [tag]
    );
    return rows[0].count;
  }
  const { rows } = await pool.query(
    `
      SELECT COUNT(*)::int AS count
        FROM segments
       WHERE retrieval_scope = 'resume_edit'
         AND (',' || regexp_replace(COALESCE(problem_tags,''), '["{}\\s]', '', 'g') || ',') LIKE $1
    `,
    [`%,${tag},%`]
  );
  return rows[0].count;
}

async function main() {
  const pool = db.getPool();
  const hasJoinTable = await tableExists(pool, "segment_problem_tags");
  const tagUniverse = [...new Set([...extractAtsScorerTags(), ...DERIVED_TAGS].map(normalizeTag).filter(Boolean))].sort();

  const rows = [];
  for (const tag of tagUniverse) {
    const normalizedTo = TAG_ALIASES[tag] || tag;
    const exactCount = await coverageCount(pool, tag, hasJoinTable);
    const normalizedCount = normalizedTo === tag ? exactCount : await coverageCount(pool, normalizedTo, hasJoinTable);
    rows.push({
      tag,
      normalized_to: normalizedTo,
      exact_count: exactCount,
      normalized_count: normalizedCount,
      status: exactCount > 0 ? "exact" : normalizedCount > 0 && normalizedTo !== tag ? "mapped" : "missing",
    });
  }

  const summary = {
    joinTable: hasJoinTable ? "segment_problem_tags" : "segments.problem_tags fallback",
    total_tags: rows.length,
    exact: rows.filter((row) => row.status === "exact").length,
    mapped: rows.filter((row) => row.status === "mapped").length,
    missing: rows.filter((row) => row.status === "missing").length,
    rows,
  };

  console.log(JSON.stringify(summary, null, 2));
  if (FAIL_ON_MISSING && summary.missing > 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
