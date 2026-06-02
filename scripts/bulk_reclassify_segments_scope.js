"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 0);
const SAMPLE_LIMIT = Number(process.argv.find((arg) => arg.startsWith("--samples="))?.split("=")[1] || 12);

const STRONG_RESUME_ACTION_RE =
  /(改写|重写|删除|删去|补充|加入|写入|放入|移至|移到|替换|精简|保留|调整|重新包装|递交|提交|bullet|summary|skills?\s*section|技能栏|项目经历|工作经历|教育背景|简历标题|关键词|JD|ATS|PDF|Word|格式|排版|版块|板块|section|projects?\s*section|professional experience|resume)/i;

const SCHOOL_RE =
  /(申研|升学|申请学校|目标学校|留学申请|学校申请|录取侧重|录取标准|文书|推荐信)/i;

const INTERVIEW_RE =
  /(面试准备|mock interview|technical interview|behavioral interview|面经|STAR|自我介绍|case interview|复盘面试|记录.*面试|面试题|约面后|收到约面|快速约面|面试邀请)/i;

const JOB_SEARCH_RE =
  /(开始投递|大量投递|海投|内推|networking|LinkedIn Easy Apply|Handshake|Indeed|Glassdoor|Career Fair|官网直投|求职渠道|投递渠道|春招|秋招|招聘窗口|窗口期|return offer|contractor|岗位下线|岗位消失|急招|申请时间|投递时间|投递量|公司清单|校友|referral|offer\s*率|拿到offer|找工作)/i;

const CAREER_RE =
  /(职业规划|方向定位|目标方向|转行方向|市场竞争|竞争激烈|课程补强|选修.*课程|Coursera|LinkedIn Learning|学习计划|技能补强计划|知识补强|Sponsorship|sponsorship|CPT|OPT|H-?1B|签证|身份|本地实习|本地经验|holiday season|gap report|能力差距)/i;

const RESUME_TOPIC_RE =
  /(简历内容|简历格式|工作经历|项目经历|教育背景|技能栏|个人总结|Summary|ATS机筛|关键词匹配|Bullet|结构调整|格式优化)/i;

function textOf(row) {
  return [
    row.topic,
    row.topic_slug,
    row.L1,
    row.L2,
    row.P_mentor,
    row.A_action,
    row.I_insight,
    row.E_example,
    row.HR_os,
    row.advice_card_title,
    row.user_problem_summary,
    row.action_summary,
    row.keywords,
    row.problem_tags,
    row.ats_dimensions,
  ].filter(Boolean).join("\n");
}

function actionTextOf(row) {
  return [row.A_action, row.action_summary].filter(Boolean).join("\n");
}

function classify(row) {
  const text = textOf(row);
  const action = actionTextOf(row);
  const topicText = [row.topic, row.L1, row.L2, row.topic_slug, row.advice_type].filter(Boolean).join(" ");
  const decisionText = [row.topic, row.L1, row.L2, row.advice_type, row.A_action, row.action_summary].filter(Boolean).join("\n");
  const hasStrongResumeAction = STRONG_RESUME_ACTION_RE.test(action);
  const hasResumeTopic = RESUME_TOPIC_RE.test(topicText);
  const isExplicitStrategyTopic = /(求职策略|技能提升|职业准备|职业规划|面试准备|目标岗位定位|方向定位)/i.test(topicText);

  if (SCHOOL_RE.test(decisionText) && !hasStrongResumeAction && !hasResumeTopic) {
    return { scope: "school_application", reason: "school_application_terms" };
  }

  if (INTERVIEW_RE.test(decisionText) && !hasStrongResumeAction && isExplicitStrategyTopic) {
    return { scope: "interview", reason: "interview_terms" };
  }

  if (JOB_SEARCH_RE.test(decisionText) && !hasStrongResumeAction && isExplicitStrategyTopic) {
    return { scope: "job_search", reason: "job_search_terms" };
  }

  if (CAREER_RE.test(decisionText) && !hasStrongResumeAction && !hasResumeTopic) {
    return { scope: "career_strategy", reason: "career_strategy_terms" };
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
    sample: String(row.P_mentor || row.A_action || row.advice_card_title || "").replace(/\s+/g, " ").slice(0, 220),
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

  const limitClause = LIMIT > 0 ? `LIMIT ${LIMIT}` : "";
  const { rows } = await pool.query(`
    SELECT id, topic, topic_slug, "L1", "L2", "P_mentor", "A_action", "I_insight",
           "E_example", "HR_os", advice_card_title, user_problem_summary,
           action_summary, keywords, problem_tags, ats_dimensions,
           advice_type, retrieval_scope
      FROM segments
     WHERE COALESCE(retrieval_scope, 'resume_edit') = 'resume_edit'
     ORDER BY id
     ${limitClause}
  `);

  const updates = rows.map((row) => {
    const result = classify(row);
    return result ? { ...row, next_scope: result.scope, reason: result.reason } : null;
  }).filter(Boolean);

  console.log(JSON.stringify({
    apply: APPLY,
    scanned_resume_scope_rows: rows.length,
    high_confidence_updates: updates.length,
    by_scope: countBy(updates, "next_scope"),
    by_reason: countBy(updates, "reason"),
  }, null, 2));

  for (const scope of Object.keys(countBy(updates, "next_scope")).sort()) {
    console.log(`\n## ${scope}`);
    for (const row of updates.filter((item) => item.next_scope === scope).slice(0, SAMPLE_LIMIT)) {
      const item = compact(row);
      console.log(`- id=${item.id} reason=${item.reason} topic=${item.topic || ""} / ${item.L1 || ""} / ${item.L2 || ""} :: ${item.sample}`);
    }
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  if (!updates.length) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_bulk_scope_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates.map(compact), null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query("CREATE TEMP TABLE segment_bulk_scope_updates (id integer PRIMARY KEY, retrieval_scope text) ON COMMIT DROP");

    for (let start = 0; start < updates.length; start += 1000) {
      const chunk = updates.slice(start, start + 1000);
      const params = [];
      const values = chunk.map((row, index) => {
        params.push(row.id, row.next_scope);
        const offset = index * 2;
        return `($${offset + 1}, $${offset + 2})`;
      });
      await pool.query(
        `INSERT INTO segment_bulk_scope_updates (id, retrieval_scope) VALUES ${values.join(",")}`,
        params
      );
    }

    await pool.query(`
      UPDATE segments AS target
         SET retrieval_scope = updates.retrieval_scope
        FROM segment_bulk_scope_updates AS updates
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
