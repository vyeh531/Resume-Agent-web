"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");
const { ROLE_GROUP_BY_FAMILY } = require("./position_role_taxonomy");

const TARGET_ARG = process.argv.find((arg) => arg.startsWith("--families="))?.split("=")[1] || "";
const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 18);

const BUCKETS = {
  positioning: [
    "missing_exact_job_title",
    "weak_summary_role_alignment",
    "weak_target_role_alignment",
    "generic_resume_positioning",
    "resume_not_tailored_to_jd",
    "job_title_mismatch",
  ],
  keyword_evidence: [
    "low_jd_keyword_match",
    "missing_priority_keywords",
    "low_hard_skill_match",
    "weak_experience_keyword_evidence",
    "keywords_only_in_skills",
  ],
  artifact_links: [
    "missing_github_link",
    "missing_portfolio",
  ],
};

function splitCsv(value) {
  if (Array.isArray(value)) return value.flatMap(splitCsv);
  return String(value || "")
    .split(/[,;|，、\n]+/)
    .map((item) => item.trim().toLowerCase().replace(/[\s-]+/g, "_"))
    .filter(Boolean);
}

function loadLatestGapAudit() {
  const auditDir = path.join(process.cwd(), "data", "audits");
  const files = fs.readdirSync(auditDir)
    .filter((file) => /^role_problem_tag_gaps_\d+\.json$/.test(file))
    .sort();
  if (!files.length) throw new Error("No role_problem_tag_gaps_*.json file found. Run audit_role_problem_tag_gaps.js first.");
  const latest = path.join(auditDir, files[files.length - 1]);
  return { file: latest, data: JSON.parse(fs.readFileSync(latest, "utf8")) };
}

function bucketsFor(tags) {
  const tagSet = new Set(tags);
  return Object.entries(BUCKETS)
    .map(([bucket, bucketTags]) => ({
      bucket,
      tags: bucketTags.filter((tag) => tagSet.has(tag)),
    }))
    .filter((item) => item.tags.length);
}

function normalizeMentorKey(row) {
  return [
    row.mentor_name || "unknown",
    row.mentor_title || "",
    row.mentor_company || "",
  ].map((item) => String(item).trim().toLowerCase()).join("|");
}

function displayMentor(profile) {
  return [
    profile.mentor_name || "Unknown mentor",
    profile.mentor_title ? `, ${profile.mentor_title}` : "",
    profile.mentor_company ? ` @ ${profile.mentor_company}` : "",
  ].join("");
}

async function loadMentorStats(pool) {
  const { rows } = await pool.query(`
    SELECT mentor_name, mentor_title, mentor_company, mentor_career_keywords,
           role_family, target_role_family, target_roles, problem_tags,
           COUNT(*)::int AS count
      FROM segments
     WHERE (retrieval_scope IS NULL OR retrieval_scope = 'resume_edit')
       AND COALESCE(mentor_name, '') <> ''
     GROUP BY mentor_name, mentor_title, mentor_company, mentor_career_keywords,
              role_family, target_role_family, target_roles, problem_tags
  `);

  const mentors = new Map();
  for (const row of rows) {
    const key = normalizeMentorKey(row);
    if (!mentors.has(key)) {
      mentors.set(key, {
        mentor_name: row.mentor_name,
        mentor_title: row.mentor_title,
        mentor_company: row.mentor_company,
        mentor_career_keywords: row.mentor_career_keywords,
        total: 0,
        familyCounts: new Map(),
        groupCounts: new Map(),
        bucketCounts: new Map(),
      });
    }
    const mentor = mentors.get(key);
    mentor.total += row.count;
    const families = [...new Set([...splitCsv(row.role_family), ...splitCsv(row.target_role_family)])]
      .filter((family) => family && family !== "universal");
    const tags = splitCsv(row.problem_tags);
    for (const family of families) {
      mentor.familyCounts.set(family, (mentor.familyCounts.get(family) || 0) + row.count);
      const group = ROLE_GROUP_BY_FAMILY[family] || "other";
      mentor.groupCounts.set(group, (mentor.groupCounts.get(group) || 0) + row.count);
    }
    for (const { bucket } of bucketsFor(tags)) {
      mentor.bucketCounts.set(bucket, (mentor.bucketCounts.get(bucket) || 0) + row.count);
    }
  }
  return [...mentors.values()];
}

function scoreMentor(mentor, family, bucket) {
  const group = ROLE_GROUP_BY_FAMILY[family] || "other";
  const exact = mentor.familyCounts.get(family) || 0;
  const sameGroup = mentor.groupCounts.get(group) || 0;
  const bucketHits = mentor.bucketCounts.get(bucket) || 0;
  const keywordText = `${mentor.mentor_title || ""} ${mentor.mentor_company || ""} ${mentor.mentor_career_keywords || ""}`.toLowerCase();
  const textBonus = keywordText.includes(family.replace(/_/g, " ")) ? 8 : 0;
  return exact * 8 + sameGroup * 2 + bucketHits * 1.5 + Math.min(mentor.total, 40) * 0.2 + textBonus;
}

function recommendedMentors(mentors, family, bucket) {
  return mentors
    .map((mentor) => ({
      mentor,
      score: scoreMentor(mentor, family, bucket),
      exactRows: mentor.familyCounts.get(family) || 0,
      groupRows: mentor.groupCounts.get(ROLE_GROUP_BY_FAMILY[family] || "other") || 0,
      bucketRows: mentor.bucketCounts.get(bucket) || 0,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || b.exactRows - a.exactRows || b.groupRows - a.groupRows)
    .slice(0, 4)
    .map((item) => ({
      mentor: displayMentor(item.mentor),
      score: Math.round(item.score),
      exactRows: item.exactRows,
      groupRows: item.groupRows,
      bucketRows: item.bucketRows,
    }));
}

function renderMarkdown(plan) {
  const lines = [];
  lines.push("# Mentor Advice Assignment Plan");
  lines.push("");
  lines.push(`Generated: ${plan.generatedAt}`);
  lines.push(`Gap source: ${plan.gapSource}`);
  lines.push("");
  lines.push("## How To Use");
  lines.push("- Assign by task package: role positioning, keyword/evidence, and artifact links.");
  lines.push("- Prefer exact-family mentors. If none exist, use same career-group mentors plus a stricter prompt.");
  lines.push("- Universal resume-format gaps should be handled by templates, not individual mentors.");
  lines.push("");
  lines.push("## Assignments");
  for (const row of plan.assignments) {
    lines.push("");
    lines.push(`### ${row.family}`);
    lines.push(`Group: ${row.group}; positions: ${row.positionCount}; covered: ${row.covered}`);
    for (const task of row.tasks) {
      lines.push("");
      lines.push(`- Task: ${task.bucket}`);
      lines.push(`  Tags: ${task.tags.join(", ")}`);
      lines.push(`  Suggested brief: ${task.brief}`);
      if (!task.mentors.length) {
        lines.push("  Mentors: none found; use MentorX strategy/template or recruit new source.");
      } else {
        lines.push("  Mentors:");
        for (const mentor of task.mentors) {
          lines.push(`  - ${mentor.mentor} (score=${mentor.score}, exact=${mentor.exactRows}, group=${mentor.groupRows}, bucket=${mentor.bucketRows})`);
        }
      }
    }
  }
  return lines.join("\n");
}

function briefFor(family, bucket) {
  const title = family.replace(/_/g, " ");
  if (bucket === "positioning") {
    return `補 ${title} 的 summary/header/target-title 定位建議：如何把過往經歷翻成該崗位語言，避免泛泛寫求職方向。`;
  }
  if (bucket === "keyword_evidence") {
    return `補 ${title} 的 JD keyword 與經歷證據建議：哪些技能詞要出現，以及如何放進 bullets 而不是只放 Skills。`;
  }
  if (bucket === "artifact_links") {
    return `補 ${title} 的作品/代碼/portfolio 類證據建議：什麼連結值得放、放在哪、如何避免空連結。`;
  }
  return `補 ${title} 的缺口建議。`;
}

async function main() {
  const { file, data } = loadLatestGapAudit();
  const requested = new Set(TARGET_ARG.split(",").map((item) => item.trim()).filter(Boolean));
  let gapRows = data.rows
    .filter((row) => row.roleSpecificMissing?.length)
    .filter((row) => !requested.size || requested.has(row.family))
    .sort((a, b) => b.roleSpecificMissing.length - a.roleSpecificMissing.length || b.missing.length - a.missing.length)
    .slice(0, LIMIT);

  const pool = db.getPool();
  const mentors = await loadMentorStats(pool);
  const assignments = gapRows.map((row) => ({
    family: row.family,
    group: row.group,
    positionCount: row.positionCount,
    covered: `${row.coveredCount}/${row.expectedCount}`,
    tasks: bucketsFor(row.roleSpecificMissing).map((task) => ({
      ...task,
      brief: briefFor(row.family, task.bucket),
      mentors: recommendedMentors(mentors, row.family, task.bucket),
    })),
  }));

  const plan = {
    generatedAt: new Date().toISOString(),
    gapSource: file,
    assignments,
  };
  const auditDir = path.join(process.cwd(), "data", "audits");
  const stamp = Date.now();
  const jsonPath = path.join(auditDir, `mentor_advice_assignment_plan_${stamp}.json`);
  const mdPath = path.join(auditDir, `mentor_advice_assignment_plan_${stamp}.md`);
  fs.writeFileSync(jsonPath, JSON.stringify(plan, null, 2));
  fs.writeFileSync(mdPath, renderMarkdown(plan));
  console.log(JSON.stringify({
    jsonPath,
    mdPath,
    assignmentCount: assignments.length,
    preview: assignments.slice(0, 8).map((row) => ({
      family: row.family,
      tasks: row.tasks.map((task) => ({
        bucket: task.bucket,
        tags: task.tags,
        mentors: task.mentors.slice(0, 2).map((mentor) => mentor.mentor),
      })),
    })),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
