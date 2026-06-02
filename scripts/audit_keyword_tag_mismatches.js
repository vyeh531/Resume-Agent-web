"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 80);

function splitCsv(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function textOf(row) {
  return [
    row.topic,
    row.L1,
    row.L2,
    row.advice_type,
    row.P_mentor,
    row.A_action,
    row.advice_card_title,
    row.user_problem_summary,
    row.action_summary,
    row.problem_tags,
  ].filter(Boolean).join(" ");
}

function actionOf(row) {
  return [row.A_action, row.action_summary].filter(Boolean).join(" ");
}

function classify(row) {
  const text = textOf(row);
  const action = actionOf(row);
  const tags = splitCsv(row.problem_tags);
  const hasKeywordTag = tags.some((tag) => /^(low_jd_keyword_match|missing_priority_keywords|low_hard_skill_match|keywords_only_in_skills|resume_not_tailored_to_jd)$/.test(tag));
  if (!hasKeywordTag) return null;

  const keywordAction = /(JD|ATS|关键词|keyword|机筛|匹配|岗位描述|高频词|targeted resume|定制)/i.test(action);
  const skillsAction = /(技能|Skills?|Technical Skills|技术栈|工具|Python|SQL|Tableau|Power BI|framework|MLOps|Machine Learning)/i.test(action);
  const projectAction = /(项目|project|Projects|经历|Experience|bullet|STAR|量化|result|impact|成果)/i.test(action);
  const summaryAction = /(Summary|个人总结|headline|title|目标岗位|岗位原词|定位)/i.test(action);

  if (keywordAction) return "actual_keyword_action";
  if (skillsAction) return "actual_skills_action";
  if (projectAction) return "should_be_experience_project";
  if (summaryAction) return "should_be_summary_role";
  if (/(学习|刷题|课程|LeetCode|面试|投递|内推|networking|签证|sponsorship)/i.test(action)) return "non_resume_or_learning";
  if (/(JD|ATS|关键词|keyword|技能|Skills?|Technical Skills|Python|SQL|Tableau|Power BI|project|项目|经历|Experience)/i.test(text)) return "context_only_needs_review";
  return "unclear";
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");

  const { rows } = await pool.query(`
    SELECT id, topic, "L1", "L2", "P_mentor", "A_action", advice_card_title,
           user_problem_summary, action_summary, role_family, target_roles,
           problem_tags, ats_dimensions, advice_type
      FROM segments
     WHERE COALESCE(retrieval_scope, 'resume_edit') = 'resume_edit'
       AND problem_tags ~ '(low_jd_keyword_match|missing_priority_keywords|low_hard_skill_match|keywords_only_in_skills|resume_not_tailored_to_jd)'
     ORDER BY id
  `);

  const inspected = rows.map((row) => ({ ...row, bucket: classify(row) })).filter((row) => row.bucket);
  const counts = inspected.reduce((acc, row) => {
    acc[row.bucket] = (acc[row.bucket] || 0) + 1;
    return acc;
  }, {});

  console.log(JSON.stringify({
    scanned_keyword_tag_rows: rows.length,
    bucket_counts: counts,
  }, null, 2));

  for (const bucket of Object.keys(counts).sort()) {
    console.log(`\n## ${bucket}`);
    for (const row of inspected.filter((item) => item.bucket === bucket).slice(0, LIMIT)) {
      const sample = String(row.advice_card_title || row.P_mentor || row.A_action || "").replace(/\s+/g, " ").slice(0, 180);
      const action = String(row.A_action || row.action_summary || "").replace(/\s+/g, " ").slice(0, 220);
      console.log(`- id=${row.id} topic=${row.topic || ""} tags=[${row.problem_tags || ""}] dims=[${row.ats_dimensions || ""}] :: ${sample}`);
      console.log(`  action=${action}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
