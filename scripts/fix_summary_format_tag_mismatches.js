"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const SAMPLE_LIMIT = Number(process.argv.find((arg) => arg.startsWith("--samples="))?.split("=")[1] || 60);
const AUDIT_PATH = process.argv.find((arg) => arg.startsWith("--audit="))?.split("=")[1] ||
  "data/audit/segments_quality_1780405456607.json";
const SKIP_IDS = new Set([507, 16321, 19078]);

function splitCsv(value) {
  return String(value || "")
    .split(/[,;|，、\n{}"]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniq(items) {
  return [...new Set(items.filter(Boolean))];
}

function actionOf(row) {
  return [row.A_action, row.action_summary].filter(Boolean).join(" ");
}

function textOf(row) {
  return [
    row.topic,
    row.L1,
    row.L2,
    row.advice_type,
    row.advice_card_title,
    row.user_problem_summary,
    row.P_mentor,
    row.A_action,
    row.action_summary,
    row.I_insight,
  ].filter(Boolean).join(" ");
}

function isFormatStructureCandidate(row) {
  const action = actionOf(row);
  const text = textOf(row);
  if (/summary|个人总结|headline|profile|objective|目标岗位|岗位原词|职位名称|title|定位|方向/i.test(action)) {
    return false;
  }
  return /格式|排版|PDF|Word|section|版块|板块|标题|日期|页|字体|行距|对齐|地址|邮箱|电话|联系方式|Green Card|Permanent Resident|sponsor|relocate|LinkedIn|Gmail|163|edu邮箱|US Letter|margin|Interest|Hobbies/i.test(text);
}

function withoutSummaryRoleTags(tags) {
  return tags.filter((tag) => ![
    "weak_summary_role_alignment",
    "missing_exact_job_title",
    "weak_target_role_alignment",
    "low_role_specificity",
    "generic_resume_positioning",
    "resume_not_tailored_to_jd",
    "low_jd_keyword_match",
    "missing_priority_keywords",
  ].includes(tag));
}

function classify(row) {
  if (!isFormatStructureCandidate(row)) return null;
  if (SKIP_IDS.has(row.id)) return null;

  const text = textOf(row);
  const actionText = [
    row.advice_card_title,
    row.user_problem_summary,
    row.P_mentor,
    row.A_action,
    row.action_summary,
  ].filter(Boolean).join(" ");
  const currentTags = splitCsv(row.problem_tags);
  if (/Interest|Hobbies|兴趣爱好|hobby|small talk/i.test(actionText)) return null;
  if (/CPA eligible|CPA eligibility|certificate板块|证书|备考/i.test(actionText)) return null;
  if (/寒假期间|下学期|优先完成.*学习|学习后立即更新|招聘季|刷题|LeetCode|BQ/i.test(actionText) &&
      !/简历联系|联系方式|邮箱|电话|地址|Green Card|sponsor|relocate/i.test(actionText)) {
    return null;
  }
  let tags = withoutSummaryRoleTags(currentTags);
  let dims = splitCsv(row.ats_dimensions).filter((dim) => !/^D_keyword_match$|^F_role_fit$/.test(dim));
  let reason = "";

  if (/Skill section|Skills板块|Skills section|技能栏|技能列表|Tools|Software|课程板块|Related Coursework|Coursework|certificate板块|CPA eligible/i.test(actionText)) {
    tags = uniq([...tags, "keywords_only_in_skills", "low_hard_skill_match"]);
    dims = uniq([...dims, "D_keyword_match"]);
    reason = "skills_section_keyword_signal";
  } else if (/Green Card|green card|Permanent Resident|permanent resident|No Sponsorship|无需sponsor|无需\s*sponsorship|visa sponsorship|sponsorship|open to relocate|relocate|工作身份|工签|身份状态/i.test(actionText)) {
    tags = uniq([...tags, "missing_relocation_signal"]);
    dims = uniq([...dims, "B_contact", "F_role_fit"]);
    reason = "work_auth_or_relocation_signal";
  } else if (/邮箱|Gmail|163|edu邮箱|学校邮箱|个人邮箱|电话号码|电话|phone|联系方式|联系信息|LinkedIn|linkedin|超链接|hyperlink|家庭地址|具体地址|出生日期|生日|隐私/i.test(actionText) ||
      /\bemail address\b|\bcontact information\b/i.test(actionText)) {
    tags = uniq([...tags, "missing_contact_info"]);
    if (/地址|relocate|location|所在地|城市/i.test(actionText)) tags = uniq([...tags, "missing_relocation_signal"]);
    if (/超链接|hyperlink|ATS|乱码|解析/i.test(actionText)) tags = uniq([...tags, "formatting_penalty_triggered"]);
    dims = uniq([...dims, "B_contact"]);
    reason = "contact_section_signal";
  } else if (/US Letter|A4|页面尺寸|页边距|narrow margins|字体|字号|Times New Roman|行距|段间距|空白|下划线|加粗|斜体|consistency|格式一致|排版|ATS友好版格式|标准美国格式|连续空格|Ruler|标尺|Tab键/i.test(actionText)) {
    tags = uniq([...tags, "formatting_penalty_triggered"]);
    dims = uniq([...dims.filter((dim) => dim !== "B_contact"), "A_format"]);
    reason = "layout_formatting";
  } else {
    return null;
  }

  if (reason !== "skills_section_keyword_signal") {
    tags = tags.filter((tag) => tag !== "education_details_missing");
  } else {
    tags = tags.filter((tag) => tag !== "education_details_missing" || /GPA|课程|Coursework|education|Education|学历|学校|学位/i.test(text));
  }
  dims = dims.length ? dims : ["A_format"];

  const nextTags = uniq(tags).join(",");
  const nextDims = uniq(dims).join(",");
  if (!nextTags || ((row.problem_tags || "") === nextTags && (row.ats_dimensions || "") === nextDims)) return null;

  return { reason, problem_tags: nextTags, ats_dimensions: nextDims };
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
    title: String(row.advice_card_title || row.user_problem_summary || row.P_mentor || "").replace(/\s+/g, " ").slice(0, 220),
    action: String(row.A_action || row.action_summary || "").replace(/\s+/g, " ").slice(0, 360),
  };
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    acc[row[key]] = (acc[row[key]] || 0) + 1;
    return acc;
  }, {});
}

async function main() {
  const audit = JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  const ids = (audit.suspicious || [])
    .filter((row) => row.issues?.includes("tag:summary_role_tag_without_summary_action"))
    .map((row) => row.id);

  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const { rows } = await pool.query(
    `
      SELECT id, topic, "L1", "L2", advice_type, retrieval_scope,
             problem_tags, ats_dimensions, role_family, target_roles,
             advice_card_title, user_problem_summary, action_summary,
             "P_mentor", "A_action", "I_insight"
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY id
    `,
    [ids]
  );

  const updates = rows
    .filter((row) => (row.retrieval_scope || "resume_edit") === "resume_edit")
    .map((row) => {
      const next = classify(row);
      return next ? {
        ...row,
        reason: next.reason,
        next_problem_tags: next.problem_tags,
        next_ats_dimensions: next.ats_dimensions,
      } : null;
    })
    .filter(Boolean);

  console.log(JSON.stringify({
    apply: APPLY,
    scanned_summary_mismatch_rows: rows.length,
    updates: updates.length,
    by_reason: countBy(updates, "reason"),
  }, null, 2));

  for (const row of updates.slice(0, SAMPLE_LIMIT).map(compact)) {
    console.log(`\n# id=${row.id} reason=${row.reason}`);
    console.log(`topic=${row.topic}`);
    console.log(`title=${row.title}`);
    console.log(`action=${row.action}`);
    console.log(`tags: ${row.old_problem_tags} -> ${row.new_problem_tags}`);
    console.log(`dims: ${row.old_ats_dimensions} -> ${row.new_ats_dimensions}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }
  if (!updates.length) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_summary_format_tags_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates.map(compact), null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query("CREATE TEMP TABLE segment_summary_format_updates (id integer PRIMARY KEY, problem_tags text, ats_dimensions text) ON COMMIT DROP");
    for (const row of updates) {
      await pool.query(
        "INSERT INTO segment_summary_format_updates (id, problem_tags, ats_dimensions) VALUES ($1, $2, $3)",
        [row.id, row.next_problem_tags, row.next_ats_dimensions]
      );
    }
    await pool.query(`
      UPDATE segments AS target
         SET problem_tags = updates.problem_tags,
             ats_dimensions = updates.ats_dimensions
        FROM segment_summary_format_updates AS updates
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
