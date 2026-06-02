"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const db = require("../database");

const auditPath =
  process.argv.find((arg) => arg.startsWith("--audit="))?.split("=")[1] ||
  "data/audit/segments_quality_1780402799497.json";
const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 80);

function compact(value, length = 320) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

function bucket(row) {
  const topic = [row.topic, row.L1, row.L2, row.advice_type].filter(Boolean).join(" ");
  const action = [row.A_action, row.action_summary].filter(Boolean).join(" ");
  if (/(技术技能补强|技能综合提升|证书资质|技能提升)/.test(topic)) return "skill_or_learning_topic";
  if (/(工作经历|项目经历|项目描述|经历改写|项目包装|Bullet)/i.test(topic)) return "experience_project_topic";
  if (/(目标岗位定位|方向聚焦|简历版本|多版本|简历定向)/.test(topic)) return "role_positioning_topic";
  if (/(技能栏|技能列表|Technical Skills|Skills)/i.test(topic)) return "skills_section_topic";
  if (/(ATS|JD|关键词|机筛|keyword)/i.test(topic)) return "actual_keyword_topic";
  if (/(学习|刷题|课程|面试|LeetCode|自学|证书|投递|内推|networking)/i.test(action)) return "non_resume_action";
  if (/(项目|经历|bullet|量化|成果|impact|result|改写|拆解|合并|精简)/i.test(action)) return "experience_project_action";
  if (/(技能|工具|Python|SQL|Tableau|Power BI|Machine Learning|模型|框架|算法|AWS|Azure|GCP)/i.test(action)) return "actual_skill_action";
  if (/(JD|ATS|关键词|keyword|匹配|机筛|岗位描述)/i.test(action)) return "actual_keyword_action";
  return "unclear";
}

async function main() {
  const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
  const ids = (audit.suspicious || [])
    .filter((row) => row.issues?.includes("tag:keyword_tag_without_keyword_action"))
    .map((row) => row.id);

  console.log(`count=${ids.length}`);
  if (!ids.length) return;

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const { rows } = await pool.query(
    `
      SELECT id, topic, "L1", "L2", advice_type, retrieval_scope,
             role_family, target_roles, problem_tags, ats_dimensions,
             advice_card_title, user_problem_summary, action_summary,
             "P_mentor", "A_action", "I_insight", keywords
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY id
    `,
    [ids]
  );

  const buckets = new Map();
  for (const row of rows) {
    const key = bucket(row);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(row);
  }

  console.log(JSON.stringify(
    Object.fromEntries([...buckets.entries()].map(([key, value]) => [key, value.length])),
    null,
    2
  ));

  for (const [key, bucketRows] of [...buckets.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n## ${key} count=${bucketRows.length}`);
    for (const row of bucketRows.slice(0, LIMIT)) {
      console.log(`\n# id=${row.id}`);
      console.log(`topic=${row.topic || ""} / ${row.L1 || ""} / ${row.L2 || ""} / ${row.advice_type || ""}`);
      console.log(`role=${row.role_family || ""} targets=${row.target_roles || ""}`);
      console.log(`tags=${row.problem_tags || ""} dims=${row.ats_dimensions || ""}`);
      console.log(`title=${compact(row.advice_card_title || row.user_problem_summary || row.P_mentor, 240)}`);
      console.log(`action=${compact(row.A_action || row.action_summary, 420)}`);
      console.log(`insight=${compact(row.I_insight, 300)}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
