"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 80);
const ONLY_IDS = new Set(
  (process.argv.find((arg) => arg.startsWith("--ids="))?.split("=")[1] || "")
    .split(",")
    .map((id) => Number(id.trim()))
    .filter(Boolean)
);

function splitCsv(value) {
  if (!value) return [];
  return String(value)
    .split(/[,;|，、\n{}"]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function hasConversationNoise(text) {
  const value = String(text || "");
  const severe = /导师\s|老师|我觉得|我认为|对吧|你懂|你知道|说句不好听|咱们|我给你|我看看|Christy|抽查|哈\b|啊；|诶|对对对|然后我|因为我|我一开始/i;
  if (severe.test(value)) return true;
  const lightMatches = value.match(/好像|感觉|其实|就是|那个|这个/g) || [];
  return lightMatches.length >= 4;
}

function isAlreadyPolishedInsight(text) {
  const value = String(text || "").trim();
  if (!value) return false;
  if (/导师\s|老师|我觉得|我认为|对吧|你懂|你知道|说句不好听|咱们|我给你|我看看|Christy|抽查|哈\b|啊；|诶|对对对|然后我|因为我|我一开始/i.test(value)) {
    return false;
  }
  return /^(HR|ATS|招聘方|招聘经理|面试官|简历|作品集|教育背景|技能栏|项目|经历)/i.test(value) && value.length <= 280;
}

function hasResumeEditAction(text) {
  return /简历|resume|bullet|summary|skills?|experience|project|education|header|linkedin|github|portfolio|作品集|ats|jd|关键词|keyword|技能栏|工作经历|项目经历|项目描述|教育背景|联系方式|格式|排版|版块|板块|改写|重写|润色|优化|调整|删除|补充|加入|添加|写入|写进|替换|保留|突出|呈现|展示|列出|量化|包装|重构|提炼|转化|结构|排序/i.test(String(text || ""));
}

function insightFromTags(row) {
  const tags = splitCsv(row.problem_tags);
  const topic = [row.topic, row.L1, row.L2].filter(Boolean).join(" ");
  const action = String(row.A_action || row.action_summary || "");

  if (/地址|城市|location|relocate|relocation|电话|邮箱|email|phone|联系方式/i.test(`${topic} ${action}`) ||
      tags.some((tag) => /missing_relocation_signal|missing_contact_info/.test(tag))) {
    return "联系方式、所在地和身份相关信息会影响 HR 对沟通成本、地域灵活性和用工风险的判断。简历顶部信息应简洁、准确，并避免让招聘方产生不必要的顾虑。";
  }
  if (/课程作业|课堂练习|作业|coursework|course project/i.test(`${topic} ${action}`)) {
    return "课程作业如果直接以作业口吻呈现，招聘方很难判断其实际价值。改成项目经历语言，说明背景、方法、产出和结果，会更接近真实招聘筛选方式。";
  }
  if (tags.some((tag) => /weak_result_orientation|low_measurable_results|weak_action_verbs/.test(tag)) ||
      /量化|成果|bullet|impact|result|指标/i.test(`${topic} ${action}`)) {
    return "HR 快速扫简历时更容易记住具体动作和可验证结果。每条 bullet 都应尽量说明你做了什么、用了什么方法，以及带来了什么结果。";
  }
  if (tags.some((tag) => /weak_summary_role_alignment|missing_exact_job_title|weak_target_role_alignment|low_role_specificity|generic_resume_positioning/.test(tag)) ||
      /目标岗位|定位|summary|版本|方向/i.test(`${topic} ${action}`)) {
    return "简历需要让招聘方在第一眼就判断出你的目标方向。标题、Summary、技能顺序和前几条经历应共同服务于同一个岗位定位。";
  }
  if (tags.some((tag) => /format|formatting|education|missing_section_dates|inconsistent_date_format/.test(tag)) ||
      /格式|排版|日期|教育|section|版块|板块/i.test(`${topic} ${action}`)) {
    return "格式和版块安排会影响 HR 的阅读效率，也会影响 ATS 解析稳定性。清晰、一致、可扫描的结构能减少初筛阶段的误判。";
  }
  if (tags.some((tag) => /low_jd_keyword_match|missing_priority_keywords|resume_not_tailored_to_jd|keyword|hard_skill/.test(tag)) ||
      /关键词|JD|ATS|技能|skills?/i.test(`${topic} ${action}`)) {
    return "招聘方和 ATS 会优先扫描目标岗位相关关键词，以及这些关键词是否出现在经历和项目证据中。把技能放到对应经历里，比只在 Skills 栏罗列更有说服力。";
  }
  if (tags.some((tag) => /portfolio|github|linkedin|contact/.test(tag)) ||
      /作品集|portfolio|github|linkedin|联系方式|链接/i.test(`${topic} ${action}`)) {
    return "链接和联系方式是招聘方验证能力与推进沟通的入口。相关链接应清晰、可点击，并放在容易被看到的位置。";
  }
  return "这条建议的重点是让简历表达更贴近招聘方的筛选方式：减少需要解释的背景信息，增加可直接识别的岗位信号、具体动作和结果证据。";
}

function compact(value, length = 320) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");

  const { rows } = await pool.query(`
    SELECT id, topic, "L1", "L2", retrieval_scope, problem_tags, ats_dimensions,
           advice_card_title, user_problem_summary, action_summary,
           "P_mentor", "A_action", "I_insight"
      FROM segments
     WHERE COALESCE(retrieval_scope, 'resume_edit') = 'resume_edit'
       AND "I_insight" IS NOT NULL
       AND "I_insight" <> ''
     ORDER BY id
  `);

  const updates = rows
    .filter((row) => !ONLY_IDS.size || ONLY_IDS.has(row.id))
    .filter((row) => hasConversationNoise(row.I_insight))
    .filter((row) => !isAlreadyPolishedInsight(row.I_insight))
    .filter((row) => hasResumeEditAction([row.A_action, row.action_summary, row.topic, row.L1, row.L2].filter(Boolean).join(" ")))
    .slice(0, LIMIT)
    .map((row) => ({ ...row, next_I_insight: insightFromTags(row) }))
    .filter((row) => row.next_I_insight !== row.I_insight);

  console.log(JSON.stringify({
    apply: APPLY,
    scanned: rows.length,
    updates: updates.length,
    limit: LIMIT,
  }, null, 2));

  for (const row of updates) {
    console.log(`\n# id=${row.id}`);
    console.log(`topic=${row.topic || ""} / ${row.L1 || ""} / ${row.L2 || ""}`);
    console.log(`tags=${row.problem_tags || ""}`);
    console.log(`title=${compact(row.advice_card_title || row.user_problem_summary || row.P_mentor, 220)}`);
    console.log(`action=${compact(row.A_action || row.action_summary, 280)}`);
    console.log(`old=${compact(row.I_insight, 420)}`);
    console.log(`new=${row.next_I_insight}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }
  if (!updates.length) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_conversation_insights_${Date.now()}.json`);
  fs.writeFileSync(
    backupPath,
    JSON.stringify(updates.map((row) => ({
      id: row.id,
      old_I_insight: row.I_insight || "",
      new_I_insight: row.next_I_insight,
      topic: row.topic || "",
      problem_tags: row.problem_tags || "",
    })), null, 2)
  );
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query("CREATE TEMP TABLE segment_conversation_insight_updates (id integer PRIMARY KEY, i_insight text) ON COMMIT DROP");
    for (const row of updates) {
      await pool.query(
        "INSERT INTO segment_conversation_insight_updates (id, i_insight) VALUES ($1, $2)",
        [row.id, row.next_I_insight]
      );
    }
    await pool.query(`
      UPDATE segments AS target
         SET "I_insight" = updates.i_insight
        FROM segment_conversation_insight_updates AS updates
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
