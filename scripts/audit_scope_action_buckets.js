"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const db = require("../database");

const auditPath =
  process.argv.find((arg) => arg.startsWith("--audit="))?.split("=")[1] ||
  "data/audit/segments_quality_1780404180456.json";
const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 25);

const SCOPE_LABELS = new Set([
  "scope:school_application",
  "scope:job_search_timing",
  "scope:career_strategy",
  "scope:interview_outcome",
]);

function compact(value, length = 320) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

function actionOf(row) {
  return [row.A_action, row.action_summary].filter(Boolean).join(" ");
}

function topicOf(row) {
  return [row.topic, row.L1, row.L2, row.advice_type].filter(Boolean).join(" ");
}

function hasResumeEditAction(text) {
  return /简历|resume|履历|bullet|summary|skills?|experience|project|education|coursework|header|linkedin|github|portfolio|作品集|pdf|word|ats|jd|关键词|keyword|岗位原词|目标岗位|技能栏|技能列表|工作经历|项目经历|项目描述|教育背景|联系方式|格式|排版|版块|板块|栏目|标题|改写|重写|润色|精修|优化|调整|删除|删去|删掉|移除|补充|加入|添加|写入|写进|放入|替换|保留|突出|呈现|展示|列出|量化|成果|描述|措辞|表达|结构|排序|置顶|放在|移至|合并|精简|浓缩|链接|日期|月份|gpa|课程|publication|包装|重构|重新叙事|重新框架|提炼|转化为|表述为|翻译为|展开为|组织为|叙事|故事线/i.test(text);
}

function hasResumeEditTopic(text) {
  return /简历内容|简历格式|简历结构|工作经历|项目经历|项目描述|教育背景|个人总结|技能栏|技能列表|ats|jd 关键词|关键词匹配|header|联系方式|格式优化|结构调整|经历改写|项目包装|bullet|summary|简历版本|简历定向|简历针对/i.test(text);
}

function classify(row) {
  const action = actionOf(row);
  const topic = topicOf(row);
  const text = [topic, row.P_mentor, action, row.I_insight, row.HR_os].filter(Boolean).join(" ");
  if (!action.trim()) return null;
  if (hasResumeEditAction(action)) return null;
  if (hasResumeEditTopic(topic) && !/投递|面试|申研|申请学校|目标学校|文书|推荐信|录取|networking|recruiter|内推|referral/i.test(action)) return null;

  if (/申研|升学|录取|申请学校|目标学校|文书|推荐信|\bGRE\b|\bTOEFL\b|雅思|gpa.*录取|phd|master项目|研究生申请/i.test(action)) {
    return { scope: "school_application", reason: "school_application_action" };
  }
  if (/linkedin.*(私信|消息|dm|联系)|招聘人员|recruiter|内推|referral|networking|coffee chat|校友|公司清单|海投|投递\d+|投递目标|每日投递|申请窗口|秋招|春招|career fair|handshake|indeed|glassdoor|官网直投|发送.*消息|追踪投递|记录投递|复盘投递|投递漏斗/i.test(action)) {
    return { scope: "job_search", reason: "job_search_action" };
  }
  if (/面试|interview|mock|behavioral|technical|case interview|oa|online assessment|自我介绍|tell me about yourself|star法则|回答.*问题|练习.*表达|复盘面试|面试题|刷题|leetcode|白板|coding题|面试官|约面后|收到面试/i.test(action)) {
    return { scope: "interview", reason: "interview_action" };
  }
  if (/职业规划|转行|职业方向|主攻方向|备选方向|保底方向|签证|sponsorship|cpt|opt|h-?1b|身份|本地实习|本地经验|市场竞争|学习计划|自学|补学|补强|课程|证书|备考|练习|掌握|理解|系统学习|系统复习|准备.*知识|技能.*测评|测评.*能力/i.test(action)) {
    return { scope: "career_strategy", reason: "career_or_learning_action" };
  }
  if (/岗位下线|岗位消失|快速约面|急招|急需人才|面试邀请|好兆头|放平心态|积极应对/i.test(text) && !hasResumeEditAction(action)) {
    return { scope: "job_search", reason: "job_search_outcome_signal" };
  }
  return { scope: "unclear", reason: "non_resume_action_no_bucket" };
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || 0) + 1;
    return acc;
  }, {});
}

async function main() {
  const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
  const ids = (audit.suspicious || [])
    .filter((row) => row.issues?.some((issue) => SCOPE_LABELS.has(issue)))
    .map((row) => row.id);
  const uniqueIds = [...new Set(ids)];
  console.log(`scope_suspicious_unique=${uniqueIds.length}`);
  if (!uniqueIds.length) return;

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const { rows } = await pool.query(
    `
      SELECT id, topic, "L1", "L2", advice_type, retrieval_scope,
             problem_tags, role_family, target_roles,
             advice_card_title, user_problem_summary, action_summary,
             "P_mentor", "A_action", "I_insight", "HR_os"
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY id
    `,
    [uniqueIds]
  );

  const classified = rows.filter((row) => (row.retrieval_scope || "resume_edit") === "resume_edit").map((row) => {
    const result = classify(row);
    return result ? { ...row, next_scope: result.scope, reason: result.reason } : null;
  }).filter(Boolean);

  console.log(JSON.stringify({
    candidates: classified.length,
    by_scope: countBy(classified, "next_scope"),
    by_reason: countBy(classified, "reason"),
  }, null, 2));

  for (const scope of Object.keys(countBy(classified, "next_scope")).sort()) {
    console.log(`\n## ${scope}`);
    for (const row of classified.filter((item) => item.next_scope === scope).slice(0, LIMIT)) {
      console.log(`\n# id=${row.id} reason=${row.reason} current=${row.retrieval_scope || ""}`);
      console.log(`topic=${row.topic || ""} / ${row.L1 || ""} / ${row.L2 || ""} / ${row.advice_type || ""}`);
      console.log(`tags=${row.problem_tags || ""}`);
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
