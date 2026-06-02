"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const db = require("../database");

const auditPath =
  process.argv.find((arg) => arg.startsWith("--audit="))?.split("=")[1] ||
  "data/audit/segments_quality_1780405456607.json";
const LABEL = process.argv.find((arg) => arg.startsWith("--label="))?.split("=")[1] ||
  "tag:summary_role_tag_without_summary_action";
const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 40);
const ONLY_BUCKET = process.argv.find((arg) => arg.startsWith("--bucket="))?.split("=")[1] || "";

function compact(value, length = 320) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

function actionOf(row) {
  return [row.A_action, row.action_summary].filter(Boolean).join(" ");
}

function bucket(row) {
  const action = actionOf(row);
  const topic = [row.topic, row.L1, row.L2, row.advice_type].filter(Boolean).join(" ");
  if (/summary|个人总结|headline|profile|objective|目标岗位|岗位原词|职位名称|title|定位|方向/i.test(action)) {
    return "actually_summary_role";
  }
  if (/bullet|经历|项目|experience|project|量化|成果|impact|result|STAR|职责|工作内容|描述|改写|重写|包装|提炼/i.test(`${topic} ${action}`)) {
    return "experience_content";
  }
  if (/格式|排版|PDF|Word|section|版块|板块|标题|日期|页|字体|行距|对齐|删除.*版块|删掉.*版块/i.test(`${topic} ${action}`)) {
    return "format_structure";
  }
  if (/技能|skills?|技术|工具|Python|SQL|Tableau|Power BI|Excel|framework|模型|算法|关键词|keyword|ATS|JD/i.test(`${topic} ${action}`)) {
    return "keyword_skills";
  }
  if (/portfolio|作品集|github|linkedin|链接|联系方式/i.test(`${topic} ${action}`)) {
    return "link_portfolio_contact";
  }
  if (/投递|面试|networking|内推|申请|职业规划|学习|课程|证书/i.test(action)) {
    return "non_resume_or_strategy";
  }
  return "unclear";
}

async function main() {
  const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
  const ids = (audit.suspicious || [])
    .filter((row) => row.issues?.includes(LABEL))
    .map((row) => row.id);
  console.log(`label=${LABEL} count=${ids.length}`);
  if (!ids.length) return;

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const { rows } = await pool.query(
    `
      SELECT id, topic, "L1", "L2", advice_type, retrieval_scope,
             problem_tags, ats_dimensions, role_family, target_roles,
             advice_card_title, user_problem_summary, action_summary,
             "P_mentor", "A_action", "I_insight", "HR_os"
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY id
    `,
    [ids]
  );

  const rowsWithBucket = rows
    .filter((row) => (row.retrieval_scope || "resume_edit") === "resume_edit")
    .map((row) => ({ ...row, bucket: bucket(row) }));

  const counts = rowsWithBucket.reduce((acc, row) => {
    acc[row.bucket] = (acc[row.bucket] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ resume_scope_rows: rowsWithBucket.length, by_bucket: counts }, null, 2));

  for (const name of Object.keys(counts).sort()) {
    if (ONLY_BUCKET && name !== ONLY_BUCKET) continue;
    console.log(`\n## ${name} count=${counts[name]}`);
    for (const row of rowsWithBucket.filter((item) => item.bucket === name).slice(0, LIMIT)) {
      console.log(`\n# id=${row.id}`);
      console.log(`topic=${row.topic || ""} / ${row.L1 || ""} / ${row.L2 || ""} / ${row.advice_type || ""}`);
      console.log(`role=${row.role_family || ""} targets=${row.target_roles || ""}`);
      console.log(`tags=${row.problem_tags || ""} dims=${row.ats_dimensions || ""}`);
      console.log(`title=${compact(row.advice_card_title || row.user_problem_summary || row.P_mentor, 220)}`);
      console.log(`action=${compact(actionOf(row), 420)}`);
      console.log(`insight=${compact(row.I_insight || row.HR_os, 260)}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
