"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const SAMPLE_LIMIT = Number(process.argv.find((arg) => arg.startsWith("--samples="))?.split("=")[1] || 20);

function splitCsv(value) {
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean);
}

function actionOf(row) {
  return [row.A_action, row.action_summary].filter(Boolean).join(" ");
}

function hasKeywordTag(row) {
  return splitCsv(row.problem_tags).some((tag) => /^(low_jd_keyword_match|missing_priority_keywords|low_hard_skill_match|keywords_only_in_skills|resume_not_tailored_to_jd)$/.test(tag));
}

function classify(row) {
  if (!hasKeywordTag(row)) return null;
  const action = actionOf(row);
  const topic = String(row.topic || "");

  const keywordAction = /(JD|ATS|关键词|keyword|机筛|匹配|岗位描述|高频词|targeted resume|定制)/i.test(action);
  const skillsAction = /(技能|Skills?|Technical Skills|技术栈|工具|技术|算法|Python|SQL|Tableau|Power BI|framework|MLOps|Machine Learning|ML|RAG|LLM|模型|框架|TensorFlow|PyTorch|CNN|RNN|Transformer|AWS|Azure|GCP|cloud|云平台|数据库|API)/i.test(action);
  const sectionTitleAction = /(标题|标注|栏目|板块|版块|section|Professional Experience|Internship)/i.test(action);
  const learningCareerAction = /(学习|刷题|课程|LeetCode|面试|投递|内推|networking|签证|sponsorship|证书|职业规划|求职策略|岗位消失|约面)/i.test(action);
  const strategyTopic = /(技术技能补强|多版本简历策略|目标岗位定位|ATS机筛策略|简历定向策略)/.test(topic);
  const toolOnlyAction = /(ChatGPT|GPT|polish|润色|上传至)/i.test(action);
  const titleRoleAction = /(职位\s*title|title|职位名称|职位名|职位头衔|岗位名称)/i.test(action);
  const terminologyAction = /(术语|专业表达|行业标准|标准指标|高频指标|通用表达|惯用语|内部指标|Cohort Analysis|AB Testing|A\/B testing|ad hoc|CVR|CPA|CTR|Conversion Rate|stress testing|Agile|Sprint|PRD|Product Requirement|APR flow|objective function|React|TypeScript|Redux)/i.test(action);
  const addSpecificTermAction = /(加入|补充|明确|写出|使用|替换|体现).{0,40}(bullet|描述|相关|方法|术语|表述|词|关键词)/i.test(action);
  const roleRetargetAction = /(改写为|包装|聚焦|贴近|强化).{0,40}(方向|角色|岗位|语言体系|目标|软件工程|market risk|data分析|数据分析)/i.test(action);
  if (keywordAction || skillsAction) return null;
  if (sectionTitleAction || learningCareerAction || strategyTopic || toolOnlyAction || titleRoleAction || terminologyAction || addSpecificTermAction || roleRetargetAction) return null;

  const contentTopic = /(项目经历描述|工作经历描述)/.test(topic);
  const contentAction = /(STAR|量化|result|impact|成果|职责|客户|业务影响|具体化|拆解|改写|扩展|笼统|空洞|方法论深度|合并|精简|删除)/i.test(action);

  if (contentTopic && contentAction) {
    return {
      reason: "keyword_to_experience_project",
      tags: "weak_experience_keyword_evidence,weak_result_orientation,vague_project_details",
      dims: "C_content_quality,F_role_fit",
    };
  }

  if (/^(Summary|Professional Summary|个人总结)$/.test(topic) && /(Summary|个人总结|headline|目标岗位|岗位原词|职位名称)/i.test(action)) {
    return {
      reason: "keyword_to_summary_role",
      tags: "weak_summary_role_alignment,low_role_specificity,weak_target_role_alignment",
      dims: "B_contact,F_role_fit",
    };
  }

  return null;
}

function compact(row) {
  return {
    id: row.id,
    reason: row.reason,
    old_problem_tags: row.problem_tags || "",
    new_problem_tags: row.next_problem_tags,
    old_ats_dimensions: row.ats_dimensions || "",
    new_ats_dimensions: row.next_ats_dimensions,
    topic: row.topic || "",
    sample: String(row.advice_card_title || row.P_mentor || row.A_action || "").replace(/\s+/g, " ").slice(0, 220),
    action: String(row.A_action || row.action_summary || "").replace(/\s+/g, " ").slice(0, 240),
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
    SELECT id, topic, "L1", "L2", "P_mentor", "A_action", advice_card_title,
           user_problem_summary, action_summary, role_family, target_roles,
           problem_tags, ats_dimensions, advice_type
      FROM segments
     WHERE COALESCE(retrieval_scope, 'resume_edit') = 'resume_edit'
       AND problem_tags ~ '(low_jd_keyword_match|missing_priority_keywords|low_hard_skill_match|keywords_only_in_skills|resume_not_tailored_to_jd)'
     ORDER BY id
  `);

  const updates = [];
  for (const row of rows) {
    const next = classify(row);
    if (!next) continue;
    if ((row.problem_tags || "") === next.tags && (row.ats_dimensions || "") === next.dims) continue;
    updates.push({
      ...row,
      reason: next.reason,
      next_problem_tags: next.tags,
      next_ats_dimensions: next.dims,
    });
  }

  console.log(JSON.stringify({
    apply: APPLY,
    scanned_keyword_tag_rows: rows.length,
    updates: updates.length,
    by_reason: countBy(updates, "reason"),
  }, null, 2));

  for (const row of updates.slice(0, SAMPLE_LIMIT)) {
    const item = compact(row);
    console.log(`\n# id=${item.id} reason=${item.reason}`);
    console.log(`topic=${item.topic}`);
    console.log(`old_tags=${item.old_problem_tags}`);
    console.log(`new_tags=${item.new_problem_tags}`);
    console.log(`old_dims=${item.old_ats_dimensions}`);
    console.log(`new_dims=${item.new_ats_dimensions}`);
    console.log(`sample=${item.sample}`);
    console.log(`action=${item.action}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  if (!updates.length) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_keyword_bucket_fix_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates.map((row) => ({
    id: row.id,
    reason: row.reason,
    problem_tags: row.problem_tags || "",
    ats_dimensions: row.ats_dimensions || "",
    next_problem_tags: row.next_problem_tags,
    next_ats_dimensions: row.next_ats_dimensions,
  })), null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query("CREATE TEMP TABLE segment_keyword_bucket_updates (id integer PRIMARY KEY, problem_tags text, ats_dimensions text) ON COMMIT DROP");

    for (let start = 0; start < updates.length; start += 1000) {
      const chunk = updates.slice(start, start + 1000);
      const params = [];
      const values = chunk.map((row, index) => {
        params.push(row.id, row.next_problem_tags, row.next_ats_dimensions);
        const offset = index * 3;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      });
      await pool.query(
        `INSERT INTO segment_keyword_bucket_updates (id, problem_tags, ats_dimensions) VALUES ${values.join(",")}`,
        params
      );
    }

    await pool.query(`
      UPDATE segments AS target
         SET problem_tags = updates.problem_tags,
             ats_dimensions = updates.ats_dimensions
        FROM segment_keyword_bucket_updates AS updates
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
