"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const SAMPLE_LIMIT = Number(process.argv.find((arg) => arg.startsWith("--samples="))?.split("=")[1] || 20);

function text(row) {
  return [row.topic, row.L1, row.L2, row.advice_type, row.P_mentor, row.A_action, row.action_summary]
    .filter(Boolean)
    .join("\n");
}

function action(row) {
  return [row.A_action, row.action_summary].filter(Boolean).join("\n");
}

function hasResumeEditAction(value) {
  return /(简历|resume|bullet|Summary|summary|技能栏|技能列表|技能部分|工作经历|项目经历|项目描述|教育背景|Coursework|Education|Header|联系方式|LinkedIn|作品集|portfolio|PDF|Word|格式|排版|关键词|JD|ATS|改写|重写|调整|删除|补充|加入|写入|放入|替换|精简|保留|包装|呈现|突出|嵌入|覆盖|匹配|列在|写为|改为|填写|移至|板块|区域|栏|在项目中|在简历中|经历中|描述中|模块)/i.test(value);
}

function hasResumeEditTopic(row) {
  return /(简历内容|简历格式|工作经历|项目经历|项目描述|教育背景|个人总结|技能栏|技能列表|ATS|关键词|Header|联系方式|格式优化|结构调整|经历改写|项目包装|Bullet|Summary)/i.test(
    [row.topic, row.L1, row.L2, row.advice_type].filter(Boolean).join("\n")
  );
}

function classify(row) {
  const value = text(row);
  const act = action(row);
  if (!act.trim()) return null;
  if (hasResumeEditTopic(row)) return null;

  // School mentions are often part of resume context, so only classify when the
  // action is explicitly about application materials outside resume editing.
  if (/(申请学校|目标学校|申研|升学|读PhD|博士生|推荐信|文书|\bGRE\b)/i.test(act) && !hasResumeEditAction(act)) {
    return { scope: "school_application", reason: "explicit_school_application_action" };
  }

  if (/(LinkedIn上.*招聘人员|发送\d*\+?条|发送直接消息|内推|referral|networking|海投|公司清单|校友|招聘人员|投递\d+|追加约?\d+|开始投递|大量投递|申请窗口|秋招|春招|官网直投|Handshake|Indeed|Glassdoor|Career Fair)/i.test(act) && !hasResumeEditAction(act)) {
    return { scope: "job_search", reason: "explicit_job_search_action" };
  }

  if (/(准备面试|mock interview|technical interview|behavioral interview|case interview|面试题|刷题|LeetCode|复盘面试|自我介绍|练习.*表达|回答.*问题|视频介绍)/i.test(act) && !hasResumeEditAction(act)) {
    return { scope: "interview", reason: "explicit_interview_action" };
  }

  if (/(转变认知框架|自学|补学|补强方向|制定.*学习|课程|Coursera|LinkedIn Learning|SQL实战能力测评|现场作答|技能.*测评|确定后续补强|职业规划|签证|sponsorship|CPT|OPT|H-?1B|身份|本地实习|本地经验|保底方向|备选方向)/i.test(act) && !hasResumeEditAction(act)) {
    return { scope: "career_strategy", reason: "explicit_career_strategy_action" };
  }

  // Very explicit text-only interview/job-search outcome advice can be moved
  // when the action itself does not edit the resume.
  if (/(岗位下线|岗位消失|急招|快速约面|收到约面|面试邀请)/i.test(value) && !hasResumeEditAction(act)) {
    return { scope: "job_search", reason: "explicit_outcome_signal" };
  }

  return null;
}

function compact(row) {
  return {
    id: row.id,
    retrieval_scope: row.retrieval_scope || "",
    next_scope: row.next_scope,
    reason: row.reason,
    topic: row.topic || "",
    L1: row.L1 || "",
    L2: row.L2 || "",
    tags: row.problem_tags || "",
    action: String(row.A_action || row.action_summary || "").replace(/\s+/g, " ").slice(0, 320),
  };
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || 0) + 1;
    return acc;
  }, {});
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");

  const { rows } = await pool.query(`
    SELECT id, topic, "L1", "L2", advice_type, retrieval_scope,
           problem_tags, "P_mentor", "A_action", action_summary
      FROM segments
     WHERE COALESCE(retrieval_scope, 'resume_edit') = 'resume_edit'
     ORDER BY id
  `);

  const updates = rows
    .map((row) => {
      const result = classify(row);
      return result ? { ...row, next_scope: result.scope, reason: result.reason } : null;
    })
    .filter(Boolean);

  console.log(JSON.stringify({
    apply: APPLY,
    scanned_resume_scope_rows: rows.length,
    updates: updates.length,
    by_scope: countBy(updates, "next_scope"),
    by_reason: countBy(updates, "reason"),
  }, null, 2));

  for (const scope of Object.keys(countBy(updates, "next_scope")).sort()) {
    console.log(`\n## ${scope}`);
    for (const row of updates.filter((item) => item.next_scope === scope).slice(0, SAMPLE_LIMIT)) {
      const item = compact(row);
      console.log(`- id=${item.id} reason=${item.reason} topic=${item.topic} / ${item.L1} / ${item.L2} tags=[${item.tags}] :: ${item.action}`);
    }
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }
  if (!updates.length) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_precise_scope_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates.map(compact), null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query("CREATE TEMP TABLE segment_precise_scope_updates (id integer PRIMARY KEY, retrieval_scope text) ON COMMIT DROP");
    for (let start = 0; start < updates.length; start += 1000) {
      const chunk = updates.slice(start, start + 1000);
      const params = [];
      const values = chunk.map((row, index) => {
        params.push(row.id, row.next_scope);
        const offset = index * 2;
        return `($${offset + 1}, $${offset + 2})`;
      });
      await pool.query(`INSERT INTO segment_precise_scope_updates (id, retrieval_scope) VALUES ${values.join(",")}`, params);
    }
    await pool.query(`
      UPDATE segments AS target
         SET retrieval_scope = updates.retrieval_scope
        FROM segment_precise_scope_updates AS updates
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
