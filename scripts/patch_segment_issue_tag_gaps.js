"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const SOURCE = "manual_issue_tag_gap_2026_06_03";

const TAG_UPDATES = [
  { tag: "job_title_mismatch", ids: [24405], dims: ["F_role_fit"] },
  { tag: "missing_github_link", ids: [28, 30, 1776, 1784, 1788, 1791], dims: ["B_contact"] },
  { tag: "missing_summary", ids: [8486, 8495, 11251, 11254, 24386, 24389], dims: ["B_contact", "F_role_fit"] },
  { tag: "missing_gpa", ids: [467, 538, 551, 3694], dims: ["B_contact"] },
  { tag: "missing_coursework", ids: [7, 759, 1102, 4205, 6321, 8102, 8888], dims: ["B_contact"] },
  { tag: "passive_voice", ids: [3564, 5172, 6767], dims: ["C_content_quality"] },
];

const MANUAL_SEGMENTS = [
  {
    tag: "partial_china_experience",
    dims: ["F_role_fit", "C_content_quality"],
    topic: "US job search resume positioning",
    l1: "Resume ATS issue",
    l2: "China-heavy experience needs stronger US-market proof",
    title: "强化美国岗位可验证的经历证据",
    problem: "简历里的经历主要发生在中国，申请美国岗位时容易让招聘方觉得相关性和可信度支撑不够强。",
    action: "在简历中优先保留和目标美国岗位最相关的中国经历，但把 bullet 改写成美国招聘方能验证和理解的证据：写清业务对象、技术栈、指标、跨国协作、英文交付物、美国市场相关项目；如果有美国课程项目、校内项目、实习、research、volunteer 或 freelance 经历，把它们提前并展开。",
    insight: "问题不是中国经历不能用，而是不能只靠地点本身支撑能力。要把经历改成可迁移、可验证、和美国 JD 直接相连的证据。",
    keywords: "china experience,domestic experience,us market,north america,role fit,experience credibility,transferable evidence",
  },
  {
    tag: "passive_voice",
    dims: ["C_content_quality"],
    topic: "Resume bullet wording",
    l1: "Resume ATS issue",
    l2: "Passive voice and weak ownership",
    title: "把被动语态改成主动负责的表达",
    problem: "简历 bullet 使用 passive voice 或弱 ownership 表述时，会让贡献看起来像旁观或参与，而不是你主动推动的结果。",
    action: "逐条检查 Experience 和 Projects bullet，把 was responsible for、participated in、was involved in、helped with 这类被动或弱主动性表达，改成主动动词开头：Owned、Built、Analyzed、Led、Automated、Improved、Reduced、Launched，并在后面接具体动作、工具和结果。",
    insight: "ATS 和招聘者都更容易识别主动动词 + 影响结果的句子；被动语态会削弱 ownership 和 seniority 信号。",
    keywords: "passive voice,active voice,ownership,action verbs,responsible for,participated in,weak verbs",
  },
  {
    tag: "missing_exp_location",
    dims: ["A_format"],
    topic: "Resume formatting completeness",
    l1: "Resume ATS issue",
    l2: "Experience location missing",
    title: "给每段经历补上地点",
    problem: "Experience、Projects 或 Education 条目缺少地点时，ATS 和招聘者不容易判断经历发生的环境、市场和工作形式。",
    action: "检查每个 Experience、Projects、Education 条目标题行，在公司/学校名称旁或日期同一行补上地点，格式保持统一，例如 City, State/Country、Remote 或 Hybrid。不要猜地点；只填写用户真实经历对应的位置。",
    insight: "地点是简历结构信息，不应该被写成某个固定城市。正确做法是补齐真实地点并保持全篇格式一致。",
    keywords: "experience location,missing location,city,state,country,remote,hybrid,resume format",
  },
  {
    tag: "missing_section_dates",
    dims: ["A_format"],
    topic: "Resume date completeness",
    l1: "Resume ATS issue",
    l2: "Section dates missing",
    title: "补齐缺失的经历日期",
    problem: "简历某些 Experience、Education、Projects 或 Activities 条目缺少日期，会让 ATS 和招聘者无法判断时间线和经历新旧。",
    action: "检查所有 Experience、Education、Projects、Activities 条目，只要标题行没有日期，就补上统一格式的时间范围，例如 Jan 2024 - May 2024 或 Sep 2023 - Present。若 ATS 指出具体 section，就优先改那个 section；若没有指出，就全篇扫描。",
    insight: "这个问题不需要猜是哪一个 section；建议应覆盖所有可能缺日期的 section，并让用户按 ATS evidence 优先处理。",
    keywords: "missing dates,section dates,date range,experience dates,education dates,project dates,present",
  },
  {
    tag: "repetitive_verbs",
    dims: ["C_content_quality"],
    topic: "Resume bullet wording",
    l1: "Resume ATS issue",
    l2: "Repetitive action verbs",
    title: "减少重复动词，让每条 bullet 分工更清楚",
    problem: "多条 bullet 反复用同一个开头动词，会让经历显得单一，也降低招聘者对能力层次的判断。",
    action: "把 Experience 和 Projects 中重复出现的句首动词标出来，每段经历最多保留一次相同强动词；按真实贡献替换为不同动作类别，例如 Analyzed 数据、Built 系统、Automated 流程、Collaborated 跨团队、Improved 指标、Presented 结果。",
    insight: "动词变化不是为了花哨，而是为了让招聘者快速看到不同能力：分析、构建、协作、优化、交付。",
    keywords: "repetitive verbs,action verb,bullet verbs,verb variety,resume wording",
  },
  {
    tag: "job_title_mismatch",
    dims: ["F_role_fit", "A_format"],
    topic: "Resume experience title clarity",
    l1: "Resume ATS issue",
    l2: "Job title and organization fields are mixed",
    title: "把公司、部门和职位名称分清楚",
    problem: "经历标题行如果把公司名、部门名和职位名称混在一起，ATS 和招聘者会难以判断你的真实角色、层级和岗位相关性。",
    action: "检查每段 Experience 的标题行，统一写成 Company Name | Job Title | Team/Department | Dates 的结构。Job Title 要使用真实、标准、可被招聘者理解的名称，例如 Software Engineer Intern、Data Analyst Intern 或 Research Assistant；不要用部门名、项目名或公司子机构名称代替职位名称。",
    insight: "招聘者先扫公司和 title 来判断候选人角色。如果 title 不清楚，即使经历内容不错，也会削弱岗位匹配信号。",
    keywords: "job title,title mismatch,position title,company name,department,experience header,role clarity",
  },
  {
    tag: "file_naming_issue",
    dims: ["A_format"],
    topic: "Resume file hygiene",
    l1: "Resume ATS issue",
    l2: "Resume file name is not professional",
    title: "把简历文件名改成专业格式",
    problem: "简历文件名过于随意、含版本备注或无法识别姓名岗位时，会影响招聘者下载、转发和归档。",
    action: "把上传文件名改成清楚的专业格式，建议使用 FirstName_LastName_Resume_TargetRole.pdf。删除 final、new、copy、修改版、最新版、v3 这类内部版本词，并确认最终上传的是 PDF。",
    insight: "文件名本身不是能力问题，但它会影响第一印象和招聘流程中的可管理性。",
    keywords: "file name,resume file,pdf,final copy,version name,professional format",
  },
  {
    tag: "inconsistent_date_format",
    dims: ["A_format"],
    topic: "Resume date formatting",
    l1: "Resume ATS issue",
    l2: "Inconsistent date format",
    title: "统一全篇日期格式",
    problem: "简历中日期格式混用，例如 2024.01、Jan 2024、01/2024 或 Present/current 混杂，会降低可读性并增加 ATS 解析风险。",
    action: "把全篇 Experience、Education、Projects 的日期统一成一种格式，推荐 Mon YYYY - Mon YYYY 或 Mon YYYY - Present。统一月份缩写、连接符、大小写和右对齐方式，不要在不同 section 使用不同格式。",
    insight: "日期格式一致能让时间线更清楚，也减少 ATS 把日期解析成普通文本的机会。",
    keywords: "date format,inconsistent dates,month year,present,resume format,ats parsing",
  },
  {
    tag: "non_chronological_order",
    dims: ["A_format"],
    topic: "Resume section ordering",
    l1: "Resume ATS issue",
    l2: "Experience is not reverse chronological",
    title: "把经历改成倒序时间排列",
    problem: "同一 section 内经历没有按时间倒序排列，会让招聘者难以快速判断最近经历，也可能让 ATS 时间线看起来混乱。",
    action: "在每个 section 内按结束日期从新到旧排序：Present 或最近结束的经历放最上面，较早经历往下放。Education、Experience、Projects 分别独立排序，不要把不同时期的条目交错排列。",
    insight: "倒序时间排列是美国简历默认阅读习惯，能帮助招聘者先看到最近、最相关的经历。",
    keywords: "reverse chronological,chronological order,experience order,resume order,date order",
  },
];

function splitCsv(value) {
  if (!value) return [];
  return String(value)
    .split(/[,;|，、\n]+/)
    .map((item) => item.trim().replace(/^[{"'\s]+|[}"'\s]+$/g, ""))
    .filter(Boolean);
}

function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}

function appendCsv(current, additions) {
  return uniq([...splitCsv(current), ...additions]).join(",");
}

function compactText(value, length = 360) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

function manualChunkId(tag) {
  return `${SOURCE}:${tag}`;
}

function toManualRow(segment) {
  const retrievalText = [
    segment.topic,
    segment.l1,
    segment.l2,
    segment.problem,
    segment.action,
    segment.insight,
    segment.keywords,
  ].filter(Boolean).join("\n");

  return {
    chunk_id: manualChunkId(segment.tag),
    session_id: SOURCE,
    topic: segment.topic,
    L1: segment.l1,
    L2: segment.l2,
    P_mentor: segment.problem,
    A_action: segment.action,
    I_insight: segment.insight,
    H_hook: "",
    E_example: "",
    HR_os: "",
    advice_type: "resume_edit",
    generality: "universal",
    confidence: "high",
    background_fit: 1,
    industry_fit: 1,
    mentor_name: "MentorX ATS Review",
    target_role: "universal",
    target_industry: "universal",
    classification_source: SOURCE,
    target_role_family: "universal",
    role_family: "universal",
    target_roles: "universal",
    seniority: "all",
    ats_dimensions: segment.dims.join(","),
    problem_tags: segment.tag,
    keywords: segment.keywords,
    topic_slug: segment.tag,
    retrieval_text: retrievalText,
    priority: 95,
    unlock_tier: "free",
    advice_card_title: segment.title,
    user_problem_summary: segment.problem,
    action_summary: segment.action,
    safe_to_show_free: 1,
    requires_ai_rewrite: 0,
    mentor_quality_score: 0.92,
    feedback_score: 0.8,
    mentor_title: "ATS Resume Reviewer",
    mentor_career_keywords: "ATS,resume editing,recruiter screening",
    mentor_career_path_display: "ATS Resume Review",
    mentor_company: "MentorX",
    retrieval_scope: "resume_edit",
  };
}

function compactUpdate(row) {
  return {
    id: row.id,
    tag: row.patch_tag,
    old_problem_tags: row.problem_tags || "",
    new_problem_tags: row.next_problem_tags,
    old_ats_dimensions: row.ats_dimensions || "",
    new_ats_dimensions: row.next_ats_dimensions,
    scope: row.retrieval_scope || "",
    topic: compactText([row.topic, row.L1, row.L2].filter(Boolean).join(" / "), 220),
    action: compactText(row.A_action || row.action_summary, 420),
  };
}

function compactInsert(row) {
  return {
    id: row.id || null,
    chunk_id: row.chunk_id,
    tag: row.problem_tags,
    dims: row.ats_dimensions,
    source: row.classification_source,
    title: row.advice_card_title,
    problem: compactText(row.user_problem_summary, 260),
    action: compactText(row.action_summary, 520),
  };
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");

  const updateIds = [...new Set(TAG_UPDATES.flatMap((item) => item.ids))];
  const { rows: currentRows } = await pool.query(
    `
      SELECT id, topic, "L1", "L2", retrieval_scope, problem_tags, ats_dimensions,
             "A_action", action_summary
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY id
    `,
    [updateIds]
  );

  const rowsById = new Map(currentRows.map((row) => [row.id, row]));
  const updates = [];
  const missingIds = [];

  for (const patch of TAG_UPDATES) {
    for (const id of patch.ids) {
      const row = rowsById.get(id);
      if (!row) {
        missingIds.push({ id, tag: patch.tag });
        continue;
      }
      const nextProblemTags = appendCsv(row.problem_tags, [patch.tag]);
      const nextAtsDimensions = appendCsv(row.ats_dimensions, patch.dims);
      if (nextProblemTags !== (row.problem_tags || "") || nextAtsDimensions !== (row.ats_dimensions || "")) {
        updates.push({
          ...row,
          patch_tag: patch.tag,
          next_problem_tags: nextProblemTags,
          next_ats_dimensions: nextAtsDimensions,
        });
      }
    }
  }

  const manualRows = MANUAL_SEGMENTS.map(toManualRow);
  const manualChunkIds = manualRows.map((row) => row.chunk_id);
  const { rows: existingManualRows } = await pool.query(
    `
      SELECT id, chunk_id, problem_tags, classification_source, retrieval_scope
        FROM segments
       WHERE chunk_id = ANY($1::text[])
       ORDER BY chunk_id
    `,
    [manualChunkIds]
  );
  const existingChunkIds = new Set(existingManualRows.map((row) => row.chunk_id));
  const inserts = manualRows.filter((row) => !existingChunkIds.has(row.chunk_id));

  console.log(JSON.stringify({
    apply: APPLY,
    source: SOURCE,
    intendedExistingIds: updateIds.length,
    foundExistingIds: currentRows.length,
    tagUpdates: updates.length,
    manualSegmentsConfigured: manualRows.length,
    manualSegmentsAlreadyPresent: existingManualRows.length,
    manualSegmentsToInsert: inserts.length,
    missingIds,
  }, null, 2));

  for (const row of updates.map(compactUpdate)) {
    console.log(`\n# update id=${row.id} tag=${row.tag}`);
    console.log(`scope=${row.scope}`);
    console.log(`topic=${row.topic}`);
    console.log(`action=${row.action}`);
    console.log(`tags: ${row.old_problem_tags} -> ${row.new_problem_tags}`);
    console.log(`dims: ${row.old_ats_dimensions} -> ${row.new_ats_dimensions}`);
  }

  for (const row of inserts.map(compactInsert)) {
    console.log(`\n# insert ${row.chunk_id}`);
    console.log(`tag=${row.tag} dims=${row.dims} source=${row.source}`);
    console.log(`title=${row.title}`);
    console.log(`problem=${row.problem}`);
    console.log(`action=${row.action}`);
  }

  if (existingManualRows.length) {
    console.log("\nExisting manual rows skipped:");
    for (const row of existingManualRows) {
      console.log(`- id=${row.id} chunk_id=${row.chunk_id} tag=${row.problem_tags} source=${row.classification_source}`);
    }
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  if (!updates.length && !inserts.length) {
    console.log("Nothing to apply.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_issue_tag_gaps_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({
    source: SOURCE,
    updates: updates.map(compactUpdate),
    inserts: inserts.map(compactInsert),
    existingManualRows,
    currentRows,
  }, null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    if (updates.length) {
      await pool.query(`
        CREATE TEMP TABLE segment_issue_tag_gap_updates (
          id integer PRIMARY KEY,
          problem_tags text,
          ats_dimensions text
        ) ON COMMIT DROP
      `);
      for (const row of updates) {
        await pool.query(
          `
            INSERT INTO segment_issue_tag_gap_updates (id, problem_tags, ats_dimensions)
            VALUES ($1, $2, $3)
          `,
          [row.id, row.next_problem_tags, row.next_ats_dimensions]
        );
      }
      await pool.query(`
        UPDATE segments AS target
           SET problem_tags = updates.problem_tags,
               ats_dimensions = updates.ats_dimensions
          FROM segment_issue_tag_gap_updates AS updates
         WHERE target.id = updates.id
      `);
    }

    if (inserts.length) {
      await pool.query("LOCK TABLE segments IN EXCLUSIVE MODE");
      const { rows: maxRows } = await pool.query("SELECT COALESCE(MAX(id), 0) AS max_id FROM segments");
      const nextId = Number(maxRows[0].max_id) + 1;
      const insertsWithIds = inserts.map((row, index) => ({ id: nextId + index, ...row }));
      const columns = Object.keys(insertsWithIds[0]);
      for (const row of insertsWithIds) {
        const params = columns.map((column) => row[column]);
        const placeholders = params.map((_, index) => `$${index + 1}`).join(", ");
        await pool.query(
          `
            INSERT INTO segments (${columns.map((column) => `"${column}"`).join(", ")})
            VALUES (${placeholders})
          `,
          params
        );
      }
    }

    await pool.query("COMMIT");
    console.log(`Applied updates=${updates.length} inserts=${inserts.length}`);
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
