"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const SAMPLE_LIMIT = Number(process.argv.find((arg) => arg.startsWith("--samples="))?.split("=")[1] || 40);

function actionOf(row) {
  return [row.A_action, row.action_summary].filter(Boolean).join(" ");
}

function topicOf(row) {
  return [row.topic, row.L1, row.L2, row.advice_type].filter(Boolean).join(" ");
}

function hasResumeEditAction(text) {
  return /(简历|resume|bullet|Summary|summary|技能栏|技能列表|技能部分|工作经历|项目经历|项目描述|教育背景|Coursework|Education|Header|联系方式|LinkedIn|作品集|portfolio|PDF|Word|格式|排版|关键词|JD|ATS|改写|重写|调整|删除|补充|加入|写入|放入|替换|精简|保留|包装|呈现|突出|嵌入|覆盖|匹配|列在|写为|改为|填写|移至|板块|区域|栏|在项目中|在简历中|经历中|描述中|模块)/i.test(text);
}

function classify(row) {
  const topic = topicOf(row);
  const action = actionOf(row);
  if (!/(技能综合提升|技术技能补强|技能提升|证书资质规划|软技能发展)/.test(topic)) return null;
  if (!action.trim()) return null;
  if (hasResumeEditAction(action)) return null;

  if (/(面试|准备回答|能解释|刷题|LeetCode|OA|technical interview|behavioral interview|case interview|自我介绍|回答.*问题|练习.*表达|现场作答|测评|评估题目难度)/i.test(action)) {
    return { scope: "interview", reason: "skill_topic_interview_or_assessment_action" };
  }

  if (/(学习|自学|补学|补强|掌握|理解|练习|课程|录播|YouTube|B站|Coursera|Udemy|教材|教程|复习|选课|证书|备考|观看|跟着.*敲代码|集中学精|系统.*知识|建立.*知识体系|了解.*基本操作|优先.*学习|回去.*看|准备.*知识)/i.test(action)) {
    return { scope: "career_strategy", reason: "skill_topic_learning_action" };
  }

  return null;
}

function compact(item) {
  return {
    id: item.id,
    retrieval_scope: item.retrieval_scope || "",
    next_scope: item.next_scope,
    reason: item.reason,
    topic: item.topic || "",
    L1: item.L1 || "",
    L2: item.L2 || "",
    tags: item.problem_tags || "",
    action: String(item.A_action || item.action_summary || "").replace(/\s+/g, " ").slice(0, 320),
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

  const updates = rows.map((row) => {
    const result = classify(row);
    return result ? { ...row, next_scope: result.scope, reason: result.reason } : null;
  }).filter(Boolean);

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
  const backupPath = path.join(backupDir, `segments_skill_non_resume_scope_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates.map(compact), null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query("CREATE TEMP TABLE segment_skill_scope_updates (id integer PRIMARY KEY, retrieval_scope text) ON COMMIT DROP");
    for (let start = 0; start < updates.length; start += 1000) {
      const chunk = updates.slice(start, start + 1000);
      const params = [];
      const values = chunk.map((row, index) => {
        params.push(row.id, row.next_scope);
        const offset = index * 2;
        return `($${offset + 1}, $${offset + 2})`;
      });
      await pool.query(`INSERT INTO segment_skill_scope_updates (id, retrieval_scope) VALUES ${values.join(",")}`, params);
    }
    await pool.query(`
      UPDATE segments AS target
         SET retrieval_scope = updates.retrieval_scope
        FROM segment_skill_scope_updates AS updates
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
