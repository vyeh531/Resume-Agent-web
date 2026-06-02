"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const db = require("../database");

const auditPath =
  process.argv.find((arg) => arg.startsWith("--audit="))?.split("=")[1] ||
  "data/audit/segments_quality_1780404751730.json";
const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 30);

const LABELS = [
  "specific:mental_state",
  "specific:student_state",
  "specific:conversation_trace",
  "specific:specific_event",
];

function compact(value, length = 320) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

function bucket(row) {
  const text = [
    row.topic,
    row.L1,
    row.L2,
    row.advice_type,
    row.P_mentor,
    row.A_action,
    row.I_insight,
    row.HR_os,
    row.advice_card_title,
    row.user_problem_summary,
    row.action_summary,
  ].filter(Boolean).join(" ");
  const action = [row.A_action, row.action_summary].filter(Boolean).join(" ");

  if (/导师\s|我觉得|我认为|对吧|好像|这人|Christy|老师|你后续|说句不好听|你懂/i.test(text)) {
    return "conversation_cleanup_or_exclude";
  }
  if (/岗位下线|岗位消失|快速约面|急招|急需人才|面试邀请|好兆头|放平心态|积极应对/i.test(text)) {
    return "job_search_event";
  }
  if (/担心|焦虑|怕|丧失信心|没进步|心态|不确定/i.test(text) && !/简历|resume|bullet|summary|skills|experience|project|岗位|关键词|ATS|JD|格式|补充|删除|改写|重写|调整|写入|写进|加入|展示|突出|量化|包装|重构|提炼|转化/i.test(action)) {
    return "mental_non_resume";
  }
  if (/目前在国内|人在国内|国内远程|需要sponsorship|需要\s*sponsorship|cpt|opt|h-?1b|gap year|毕业后有超过一年空白|毕业超过一年/i.test(text) && !/简历|resume|header|联系方式|标注|写|加入|补充|删除|移除|注明|Green Card|No Sponsorship/i.test(action)) {
    return "student_state_non_resume";
  }
  if (/目前在国内|人在国内|国内远程|需要sponsorship|需要\s*sponsorship|cpt|opt|h-?1b|gap year|毕业后有超过一年空白|毕业超过一年/i.test(text)) {
    return "student_state_resume_framing";
  }
  if (/担心|焦虑|怕|丧失信心|没进步|心态|不确定/i.test(text)) {
    return "mental_resume_framing";
  }
  return "unclear";
}

async function main() {
  const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
  const idsByLabel = new Map(LABELS.map((label) => [label, []]));
  for (const row of audit.suspicious || []) {
    for (const label of LABELS) {
      if (row.issues?.includes(label)) idsByLabel.get(label).push(row.id);
    }
  }
  const ids = [...new Set([...idsByLabel.values()].flat())];
  console.log(`specific_unique=${ids.length}`);
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

  const labelsForId = new Map();
  for (const [label, labelIds] of idsByLabel.entries()) {
    for (const id of labelIds) {
      if (!labelsForId.has(id)) labelsForId.set(id, []);
      labelsForId.get(id).push(label);
    }
  }

  const rowsWithBucket = rows
    .filter((row) => (row.retrieval_scope || "resume_edit") === "resume_edit")
    .map((row) => ({ ...row, labels: labelsForId.get(row.id) || [], bucket: bucket(row) }));

  const counts = rowsWithBucket.reduce((acc, row) => {
    acc[row.bucket] = (acc[row.bucket] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ resume_scope_candidates: rowsWithBucket.length, by_bucket: counts }, null, 2));

  for (const name of Object.keys(counts).sort()) {
    console.log(`\n## ${name} count=${counts[name]}`);
    for (const row of rowsWithBucket.filter((item) => item.bucket === name).slice(0, LIMIT)) {
      console.log(`\n# id=${row.id} labels=${row.labels.join(",")} scope=${row.retrieval_scope || ""}`);
      console.log(`topic=${row.topic || ""} / ${row.L1 || ""} / ${row.L2 || ""} / ${row.advice_type || ""}`);
      console.log(`role=${row.role_family || ""} targets=${row.target_roles || ""}`);
      console.log(`tags=${row.problem_tags || ""} dims=${row.ats_dimensions || ""}`);
      console.log(`title=${compact(row.advice_card_title || row.user_problem_summary || row.P_mentor, 220)}`);
      console.log(`action=${compact(row.A_action || row.action_summary, 420)}`);
      console.log(`insight=${compact(row.I_insight || row.HR_os, 360)}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
