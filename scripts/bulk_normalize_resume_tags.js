"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const PRUNE_OVERLAP = process.argv.includes("--prune-overlap");
const SAMPLE_LIMIT = Number(process.argv.find((arg) => arg.startsWith("--samples="))?.split("=")[1] || 12);

const CATEGORY_RULES = [
  {
    name: "portfolio",
    re: /(作品集|design portfolio|creative portfolio|portfolio link|portfolio website|Behance|Dribbble|personal website|个人网站|可点击链接)/i,
    tags: ["missing_portfolio"],
    dims: ["B_contact", "F_role_fit"],
  },
  {
    name: "summary",
    re: /(个人总结|Summary|professional summary|简历标题|目标岗位原词|岗位原词|title|headline)/i,
    tags: ["weak_summary_role_alignment", "low_role_specificity", "weak_target_role_alignment"],
    dims: ["B_contact", "F_role_fit"],
  },
  {
    name: "jd_keywords",
    re: /(JD|ATS|关键词|keyword|机筛|匹配|targeted resume|定制|高频词|岗位描述)/i,
    tags: ["low_jd_keyword_match", "missing_priority_keywords", "resume_not_tailored_to_jd"],
    dims: ["D_keyword_match", "F_role_fit"],
  },
  {
    name: "skills",
    re: /(技能栏|技能列表|Technical Skills|Skills版块|skill section|技术栈|工具|framework|Python|SQL|Tableau|Power BI|Machine Learning|MLOps)/i,
    tags: ["low_hard_skill_match", "keywords_only_in_skills"],
    dims: ["D_keyword_match"],
  },
  {
    name: "bullet_results",
    re: /(bullet|STAR|量化|成果|result|impact|metrics|指标|动词|action verb|职责描述|结果优先)/i,
    tags: ["weak_result_orientation", "weak_action_verbs", "low_measurable_results"],
    dims: ["C_content_quality"],
  },
  {
    name: "experience",
    re: /(工作经历|实习经历|Experience|Professional Experience|经历描述|职责|客户|项目产出|transferable)/i,
    tags: ["weak_experience_keyword_evidence", "weak_result_orientation"],
    dims: ["C_content_quality", "F_role_fit"],
  },
  {
    name: "project",
    re: /(项目经历|项目描述|Projects|academic project|课程项目|project section|vague project|项目细节)/i,
    tags: ["weak_experience_keyword_evidence", "vague_project_details"],
    dims: ["C_content_quality", "F_role_fit"],
  },
  {
    name: "education",
    re: /(教育背景|Education|GPA|Relevant Coursework|coursework|degree|毕业时间|学位|论文|publication)/i,
    tags: ["education_details_missing"],
    dims: ["B_contact"],
  },
  {
    name: "format_contact",
    re: /(排版|PDF|Word|一页简历|页边距|字体|Header|联系方式|电话|邮箱|地址|LinkedIn|GitHub|链接|contact|ATS解析|文件格式)/i,
    tags: ["formatting_penalty_triggered"],
    dims: ["A_format", "B_contact"],
  },
];

function splitCsv(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function uniq(items) {
  return [...new Set(items.filter(Boolean))];
}

function textOf(row) {
  return [
    row.topic,
    row.L1,
    row.L2,
    row.advice_type,
    row.P_mentor,
    row.A_action,
    row.action_summary,
    row.advice_card_title,
    row.user_problem_summary,
  ].filter(Boolean).join("\n");
}

function infer(row) {
  const text = textOf(row);
  const matched = CATEGORY_RULES.filter((rule) => rule.re.test(text));
  if (!matched.length) return null;

  // Keep at most two strongest categories to avoid broad noisy tags.
  const selected = matched.slice(0, 2);
  return {
    categories: selected.map((rule) => rule.name),
    problem_tags: uniq(selected.flatMap((rule) => rule.tags)).join(","),
    ats_dimensions: uniq(selected.flatMap((rule) => rule.dims)).join(","),
  };
}

function isNoisyTagSet(row, inferred) {
  const currentTags = splitCsv(row.problem_tags);
  const inferredTags = splitCsv(inferred.problem_tags);
  if (!currentTags.length) return true;

  const currentSet = new Set(currentTags);
  const overlap = inferredTags.filter((tag) => currentSet.has(tag)).length;
  if (overlap > 0 && !PRUNE_OVERLAP) return false;

  const noisyPortfolio = currentTags.includes("missing_portfolio") && !inferred.categories.includes("portfolio");
  const noisyFormat = currentTags.includes("formatting_penalty_triggered") && !inferred.categories.includes("format_contact") && !inferred.categories.includes("bullet_results");
  const noisySummary = currentTags.some((tag) => /summary|exact_job_title|role_alignment|role_specificity/.test(tag)) && !inferred.categories.includes("summary") && !inferred.categories.includes("jd_keywords");
  const noisyKeyword = currentTags.some((tag) => /keyword|hard_skill|priority/.test(tag)) && !inferred.categories.includes("jd_keywords") && !inferred.categories.includes("skills");
  const noisyExperience = currentTags.some((tag) => /experience|evidence|measurable|action_verbs|result/.test(tag)) && !inferred.categories.includes("experience") && !inferred.categories.includes("project") && !inferred.categories.includes("bullet_results");

  const hasNoisyTags = noisyPortfolio || noisyFormat || noisySummary || noisyKeyword || noisyExperience;
  if (!hasNoisyTags) return false;
  if (!PRUNE_OVERLAP) return true;

  // In prune mode, require some overlap so we only remove extra noisy tags from
  // rows that are already partly aligned with the inferred category.
  return overlap > 0;
}

function compact(row) {
  return {
    id: row.id,
    topic: row.topic,
    old_problem_tags: row.problem_tags || "",
    new_problem_tags: row.next_problem_tags,
    old_ats_dimensions: row.ats_dimensions || "",
    new_ats_dimensions: row.next_ats_dimensions,
    categories: row.categories,
    sample: String(row.advice_card_title || row.P_mentor || row.A_action || "").replace(/\s+/g, " ").slice(0, 220),
  };
}

function countCategories(rows) {
  const counts = {};
  for (const row of rows) {
    for (const category of row.categories) counts[category] = (counts[category] || 0) + 1;
  }
  return counts;
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");

  const { rows } = await pool.query(`
    SELECT id, topic, "L1", "L2", "P_mentor", "A_action", action_summary,
           advice_card_title, user_problem_summary, advice_type,
           problem_tags, ats_dimensions, retrieval_scope
      FROM segments
     WHERE COALESCE(retrieval_scope, 'resume_edit') = 'resume_edit'
     ORDER BY id
  `);

  const updates = [];
  for (const row of rows) {
    const inferred = infer(row);
    if (!inferred) continue;
    if (!isNoisyTagSet(row, inferred)) continue;
    if ((row.problem_tags || "") === inferred.problem_tags && (row.ats_dimensions || "") === inferred.ats_dimensions) continue;
    updates.push({
      ...row,
      categories: inferred.categories,
      next_problem_tags: inferred.problem_tags,
      next_ats_dimensions: inferred.ats_dimensions,
    });
  }

  console.log(JSON.stringify({
    apply: APPLY,
    prune_overlap: PRUNE_OVERLAP,
    scanned_resume_scope_rows: rows.length,
    high_confidence_tag_updates: updates.length,
    by_category: countCategories(updates),
  }, null, 2));

  for (const row of updates.slice(0, SAMPLE_LIMIT)) {
    const item = compact(row);
    console.log(`\n# id=${item.id} categories=${item.categories.join(",")}`);
    console.log(`topic=${item.topic || ""}`);
    console.log(`old_tags=${item.old_problem_tags}`);
    console.log(`new_tags=${item.new_problem_tags}`);
    console.log(`old_dims=${item.old_ats_dimensions}`);
    console.log(`new_dims=${item.new_ats_dimensions}`);
    console.log(`sample=${item.sample}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  if (!updates.length) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_bulk_tags_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates.map((row) => ({
    id: row.id,
    problem_tags: row.problem_tags || "",
    ats_dimensions: row.ats_dimensions || "",
    next_problem_tags: row.next_problem_tags,
    next_ats_dimensions: row.next_ats_dimensions,
    categories: row.categories,
  })), null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query("CREATE TEMP TABLE segment_bulk_tag_updates (id integer PRIMARY KEY, problem_tags text, ats_dimensions text) ON COMMIT DROP");

    for (let start = 0; start < updates.length; start += 1000) {
      const chunk = updates.slice(start, start + 1000);
      const params = [];
      const values = chunk.map((row, index) => {
        params.push(row.id, row.next_problem_tags, row.next_ats_dimensions);
        const offset = index * 3;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      });
      await pool.query(
        `INSERT INTO segment_bulk_tag_updates (id, problem_tags, ats_dimensions) VALUES ${values.join(",")}`,
        params
      );
    }

    await pool.query(`
      UPDATE segments AS target
         SET problem_tags = updates.problem_tags,
             ats_dimensions = updates.ats_dimensions
        FROM segment_bulk_tag_updates AS updates
       WHERE target.id = updates.id
    `);
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
