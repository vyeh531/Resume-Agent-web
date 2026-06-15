"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");
const { ROLE_GROUP_BY_FAMILY } = require("./position_role_taxonomy");

const MIN_COUNT = Number(process.argv.find((arg) => arg.startsWith("--min-count="))?.split("=")[1] || 1);
const ONLY_GAPS = process.argv.includes("--only-gaps");

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

const CORE_TAGS = [
  "missing_summary",
  "missing_exact_job_title",
  "weak_summary_role_alignment",
  "weak_target_role_alignment",
  "generic_resume_positioning",
  "resume_not_tailored_to_jd",
  "low_jd_keyword_match",
  "missing_priority_keywords",
  "low_hard_skill_match",
  "weak_experience_keyword_evidence",
  "keywords_only_in_skills",
  "low_measurable_results",
  "weak_action_verbs",
  "weak_result_orientation",
  "education_details_missing",
  "missing_gpa",
  "missing_coursework",
  "missing_contact_info",
  "missing_linkedin",
  "missing_relocation_signal",
  "short_tenure_unclear",
  "outdated_resume",
  "non_chronological_order",
  "missing_section_dates",
  "inconsistent_date_format",
  "file_naming_issue",
  "formatting_penalty_triggered",
  "uploaded_non_pdf_format",
  "missing_exp_location",
  "job_title_mismatch",
  "passive_voice",
  "repetitive_verbs",
];

const ROLE_SPECIFIC_CORE_TAGS = new Set([
  "missing_exact_job_title",
  "weak_summary_role_alignment",
  "weak_target_role_alignment",
  "generic_resume_positioning",
  "resume_not_tailored_to_jd",
  "low_jd_keyword_match",
  "missing_priority_keywords",
  "low_hard_skill_match",
  "weak_experience_keyword_evidence",
  "keywords_only_in_skills",
  "job_title_mismatch",
]);

const GROUP_SPECIFIC_TAGS = {
  tech: ["missing_github_link"],
  data: ["missing_github_link"],
  design_creative: ["missing_portfolio"],
  product: ["missing_portfolio"],
  marketing_sales: ["missing_portfolio"],
  media: ["missing_portfolio"],
};

function splitCsv(value) {
  if (Array.isArray(value)) return value.flatMap(splitCsv);
  return String(value || "")
    .split(/[,;|，、\n]+/)
    .map((item) => item.trim().toLowerCase().replace(/[\s-]+/g, "_"))
    .filter(Boolean);
}

function normalizeTag(tag) {
  const normalized = String(tag || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  return TAG_ALIASES[normalized] || normalized;
}

function familyTags(family) {
  const group = ROLE_GROUP_BY_FAMILY[family] || "other";
  return [...new Set([...CORE_TAGS, ...(GROUP_SPECIFIC_TAGS[group] || [])])].sort();
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

async function loadFamilies(pool) {
  const { rows } = await pool.query(`
    SELECT canonical_role_family, role_group, COUNT(*)::int AS position_count
      FROM position_skills
     WHERE canonical_role_family IS NOT NULL
       AND canonical_role_family <> ''
     GROUP BY canonical_role_family, role_group
     ORDER BY canonical_role_family
  `);
  return rows;
}

async function loadCoverage(pool, hasJoinTable) {
  if (hasJoinTable) {
    const { rows } = await pool.query(`
      SELECT lower(s.role_family) AS role_family,
             lower(spt.problem_tag) AS problem_tag,
             COUNT(DISTINCT s.id)::int AS count
        FROM segments AS s
        JOIN segment_problem_tags AS spt ON spt.segment_id = s.id
       WHERE (s.retrieval_scope IS NULL OR s.retrieval_scope = 'resume_edit')
         AND COALESCE(s.role_family, '') <> ''
       GROUP BY lower(s.role_family), lower(spt.problem_tag)
    `);
    return rows;
  }

  const { rows } = await pool.query(`
    SELECT lower(role_family) AS role_family,
           problem_tags,
           COUNT(*)::int AS count
      FROM segments
     WHERE (retrieval_scope IS NULL OR retrieval_scope = 'resume_edit')
       AND COALESCE(role_family, '') <> ''
       AND COALESCE(problem_tags, '') <> ''
     GROUP BY lower(role_family), problem_tags
  `);
  return rows.flatMap((row) => splitCsv(row.role_family).flatMap((family) =>
    splitCsv(row.problem_tags).map((tag) => ({
      role_family: family,
      problem_tag: tag,
      count: row.count,
    }))
  ));
}

function addCount(map, family, tag, count) {
  const key = `${family}::${normalizeTag(tag)}`;
  map.set(key, (map.get(key) || 0) + Number(count || 0));
}

function countOf(map, family, tag) {
  return map.get(`${family}::${normalizeTag(tag)}`) || 0;
}

function effectiveCountOf(map, family, tag) {
  const exact = countOf(map, family, tag);
  if (ROLE_SPECIFIC_CORE_TAGS.has(tag)) return exact;
  return exact + countOf(map, "universal", tag);
}

function renderMarkdown(summary) {
  const lines = [];
  lines.push("# Role Problem Tag Gap Audit");
  lines.push("");
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push(`Source: ${summary.coverageSource}`);
  lines.push(`Minimum count for covered: ${summary.minCount}`);
  lines.push("");
  lines.push("## Summary");
  for (const row of summary.rows) {
    lines.push(`- ${row.family} (${row.group}, positions=${row.positionCount}): covered=${row.coveredCount}/${row.expectedCount}, missing=${row.missing.length}, role_specific_missing=${row.roleSpecificMissing.length}`);
  }
  lines.push("");
  lines.push("## Missing Tags By Family");
  for (const row of summary.rows) {
    if (ONLY_GAPS && !row.missing.length) continue;
    lines.push("");
    lines.push(`### ${row.family}`);
    lines.push(`Group: ${row.group}; positions: ${row.positionCount}`);
    if (!row.missing.length) {
      lines.push("- none");
    } else {
      for (const tag of row.missing) lines.push(`- ${tag}`);
    }
    if (row.roleSpecificMissing.length) {
      lines.push("");
      lines.push("Role-specific gaps:");
      for (const tag of row.roleSpecificMissing) lines.push(`- ${tag}`);
    }
  }
  return lines.join("\n");
}

async function main() {
  const pool = db.getPool();
  const hasJoinTable = await tableExists(pool, "segment_problem_tags");
  const [families, rawCoverage] = await Promise.all([loadFamilies(pool), loadCoverage(pool, hasJoinTable)]);

  const coverage = new Map();
  for (const row of rawCoverage) {
    for (const family of splitCsv(row.role_family)) addCount(coverage, family, row.problem_tag, row.count);
  }

  const rows = families.map((familyRow) => {
    const family = familyRow.canonical_role_family;
    const group = familyRow.role_group || ROLE_GROUP_BY_FAMILY[family] || "other";
    const expectedTags = familyTags(family);
    const exactCounts = Object.fromEntries(expectedTags.map((tag) => [tag, countOf(coverage, family, tag)]));
    const effectiveCounts = Object.fromEntries(expectedTags.map((tag) => [tag, effectiveCountOf(coverage, family, tag)]));
    const missing = expectedTags.filter((tag) => effectiveCounts[tag] < MIN_COUNT);
    const roleSpecificMissing = expectedTags.filter((tag) => ROLE_SPECIFIC_CORE_TAGS.has(tag) && exactCounts[tag] < MIN_COUNT);
    return {
      family,
      group,
      positionCount: familyRow.position_count,
      expectedCount: expectedTags.length,
      coveredCount: expectedTags.length - missing.length,
      missing,
      roleSpecificMissing,
      universalCovered: expectedTags.filter((tag) => exactCounts[tag] < MIN_COUNT && effectiveCounts[tag] >= MIN_COUNT),
      lowCoverage: expectedTags.filter((tag) => effectiveCounts[tag] > 0 && effectiveCounts[tag] < Math.max(MIN_COUNT, 2)),
      counts: effectiveCounts,
      exactCounts,
    };
  }).sort((a, b) => b.missing.length - a.missing.length || a.family.localeCompare(b.family));

  const summary = {
    generatedAt: new Date().toISOString(),
    coverageSource: hasJoinTable ? "segment_problem_tags" : "segments.problem_tags",
    minCount: MIN_COUNT,
    familyCount: rows.length,
    rows,
  };

  const auditDir = path.join(process.cwd(), "data", "audits");
  fs.mkdirSync(auditDir, { recursive: true });
  const stamp = Date.now();
  const jsonPath = path.join(auditDir, `role_problem_tag_gaps_${stamp}.json`);
  const mdPath = path.join(auditDir, `role_problem_tag_gaps_${stamp}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(summary, null, 2));
  fs.writeFileSync(mdPath, renderMarkdown(summary));

  const top = rows.slice(0, 20).map((row) => ({
    family: row.family,
    group: row.group,
    positions: row.positionCount,
    covered: `${row.coveredCount}/${row.expectedCount}`,
    missingCount: row.missing.length,
    roleSpecificMissingCount: row.roleSpecificMissing.length,
    missing: row.missing.slice(0, 12),
    roleSpecificMissing: row.roleSpecificMissing.slice(0, 12),
  }));

  console.log(JSON.stringify({ jsonPath, mdPath, familyCount: rows.length, top }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
