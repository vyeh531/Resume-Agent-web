"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const SAMPLE_LIMIT = Number(process.argv.find((arg) => arg.startsWith("--samples="))?.split("=")[1] || 12);

const RESUME_EDIT_ACTION_RE =
  /(改写|重写|删(除|去)?|补充|加入|写入|放入|移至|移到|替换|精简|保留|调整|重新包装|提交|递交|bullet|summary|skills?\s*section|技能栏|项目经历|工作经历|教育背景|简历|简历标题|关键词|JD|ATS|PDF|Word|格式|排版|版块|板块|section|projects?\s*section|professional experience|resume|LinkedIn链接|作品集|portfolio|header|联系方式|课程|coursework)/i;

const JOB_SEARCH_ACTION_RE =
  /(开始投递|立即投递|尽快投递|大量投递|继续投递|集中投递|同步投递|投递\d+|投递约?\d+|海投|内推|找内推|networking|LinkedIn|Handshake|Indeed|Glassdoor|Career Fair|官网直投|公司清单|校友|referral|猎头|contractor|全职和实习都投|实习和全职都投|不要只盯全职|申请窗口|投递窗口|春招|秋招|new grad|summer internship)/i;

const INTERVIEW_ACTION_RE =
  /(准备面试|备战面试|mock interview|technical interview|behavioral interview|case interview|面试题|刷题|LeetCode|复盘面试|记录.*面试|STAR|自我介绍|视频介绍|回答.*问题|练习.*表达|面试准备)/i;

const CAREER_ACTION_RE =
  /(选修|学习|自学|补强|课程|Coursera|LinkedIn Learning|制定.*学习|技能.*提升|确定.*方向|明确.*方向|聚焦.*方向|转向|放弃.*方向|选择.*方向|优先.*方向|gap report|能力差距|Sponsorship|sponsorship|CPT|OPT|H-?1B|签证|身份|return offer|本地实习|本地经验|保底方向|备选方向)/i;

const SCHOOL_ACTION_RE =
  /(申研|升学|申请学校|目标学校|留学申请|学校申请|录取侧重|录取标准|文书|推荐信)/i;

function actionTextOf(row) {
  return [row.A_action, row.action_summary].filter(Boolean).join("\n");
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
  ].filter(Boolean).join("\n");
}

function classify(row) {
  const action = actionTextOf(row);
  const text = textOf(row);
  const topicText = [row.topic, row.L1, row.L2, row.advice_type].filter(Boolean).join("\n");
  if (!action.trim()) return null;

  if (/(简历内容|简历格式|工作经历|项目经历|项目描述|教育背景|个人总结|技能栏|技能列表|ATS|关键词|Header|联系方式|格式优化|结构调整|经历改写|项目包装|Bullet|Summary)/i.test(topicText)) {
    return null;
  }

  // If the proposed action directly edits resume content/format/links/JD wording,
  // keep it in resume_edit. Mixed advice is too risky for bulk updates.
  if (RESUME_EDIT_ACTION_RE.test(action)) {
    if (/简历(改好|修改完成|ready|完成)后.*(投递|申请|面试)|先以当前.*简历开始投递|收到.*反馈.*再.*调整/.test(action)) {
      return { scope: "job_search", reason: "action_job_search_after_resume_ready" };
    }
    return null;
  }

  if (SCHOOL_ACTION_RE.test(action)) return { scope: "school_application", reason: "action_school_application" };
  if (INTERVIEW_ACTION_RE.test(action)) return { scope: "interview", reason: "action_interview" };
  if (JOB_SEARCH_ACTION_RE.test(action)) return { scope: "job_search", reason: "action_job_search" };
  if (CAREER_ACTION_RE.test(action)) return { scope: "career_strategy", reason: "action_career_strategy" };

  // Some imported rows have short action summaries; fall back to full text only
  // for very explicit non-resume phrases.
  if (/岗位下线|岗位消失|急招|快速约面|收到约面/.test(text)) {
    return { scope: "job_search", reason: "text_job_search_signal" };
  }
  if (/申研|申请学校|目标学校|文书|推荐信/.test(text) && !RESUME_EDIT_ACTION_RE.test(action)) {
    return { scope: "school_application", reason: "text_school_application" };
  }

  return null;
}

function compact(row) {
  return {
    id: row.id,
    retrieval_scope: row.retrieval_scope,
    next_scope: row.next_scope,
    reason: row.reason,
    topic: row.topic,
    L1: row.L1,
    L2: row.L2,
    action: String(row.A_action || row.action_summary || "").replace(/\s+/g, " ").slice(0, 260),
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
    SELECT id, topic, "L1", "L2", "P_mentor", "A_action", action_summary,
           advice_type, retrieval_scope
      FROM segments
     WHERE COALESCE(retrieval_scope, 'resume_edit') = 'resume_edit'
       AND COALESCE(topic, '') !~ '(简历|ATS|关键词|Header|联系方式|工作经历|项目经历|教育背景|个人总结|技能栏|Bullet|Summary)'
       AND COALESCE("L1", '') !~ '(简历内容|简历格式)'
       AND COALESCE("L2", '') !~ '(工作经历|项目描述|项目经历|教育背景|个人总结|技能列表|技能栏|联系方式|ATS|关键词|格式)'
       AND COALESCE(advice_type, '') !~ '(格式优化|结构调整|经历改写|项目包装|Bullet|Summary|关键词匹配|技能栏优化)'
     ORDER BY id
  `);

  const updates = rows.map((row) => {
    const result = classify(row);
    return result ? { ...row, next_scope: result.scope, reason: result.reason } : null;
  }).filter(Boolean);

  console.log(JSON.stringify({
    apply: APPLY,
    scanned_resume_scope_rows: rows.length,
    action_high_confidence_updates: updates.length,
    by_scope: countBy(updates, "next_scope"),
    by_reason: countBy(updates, "reason"),
  }, null, 2));

  for (const scope of Object.keys(countBy(updates, "next_scope")).sort()) {
    console.log(`\n## ${scope}`);
    for (const row of updates.filter((item) => item.next_scope === scope).slice(0, SAMPLE_LIMIT)) {
      const item = compact(row);
      console.log(`- id=${item.id} reason=${item.reason} topic=${item.topic || ""} / ${item.L1 || ""} / ${item.L2 || ""} :: ${item.action}`);
    }
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  if (!updates.length) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_bulk_action_scope_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates.map(compact), null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query("CREATE TEMP TABLE segment_bulk_action_scope_updates (id integer PRIMARY KEY, retrieval_scope text) ON COMMIT DROP");

    for (let start = 0; start < updates.length; start += 1000) {
      const chunk = updates.slice(start, start + 1000);
      const params = [];
      const values = chunk.map((row, index) => {
        params.push(row.id, row.next_scope);
        const offset = index * 2;
        return `($${offset + 1}, $${offset + 2})`;
      });
      await pool.query(
        `INSERT INTO segment_bulk_action_scope_updates (id, retrieval_scope) VALUES ${values.join(",")}`,
        params
      );
    }

    await pool.query(`
      UPDATE segments AS target
         SET retrieval_scope = updates.retrieval_scope
        FROM segment_bulk_action_scope_updates AS updates
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
