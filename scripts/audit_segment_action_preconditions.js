"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

const CHECKS = [
  {
    name: "section_order",
    covered: true,
    pattern: /reorder|order|sequence|first|second|third|front|before|after|move|section\s*order|section\s*structure|summary.*skills.*experience|education.*experience|skills.*experience|排序|顺序|前置|靠前|提前|后移|往后|移到后面|退居|第一|第二|第三|教育.*经历|技能.*经历/i,
  },
  {
    name: "section_creation",
    covered: true,
    pattern: /add\s+(?:a\s+)?(?:summary|skills?\s+section|technical\s+skills)|create\s+(?:a\s+)?(?:summary|skills?\s+section)|新增.*(?:summary|技能|板块|模块)|补上.*summary|写.*summary|加.*skills?\s*section|在.*education.*列.*skills?|technical\s+skills?\s*(?:区|板块|模块)/i,
  },
  {
    name: "section_title_rename",
    covered: true,
    pattern: /rename.*(?:internship|experience)|change.*section title|professional\s+experience|经历栏标题|经历.*标题|section title/i,
  },
  {
    name: "profile_link_add",
    covered: true,
    pattern: /add.*(?:linkedin|github|portfolio|personal website|website link)|(?:linkedin|github|portfolio|作品集|项目链接|个人网站|链接).*(?:放|加|补|加入|添加|放到|写到|header|抬头|名字下方)/i,
  },
  {
    name: "keyword_gap",
    covered: true,
    pattern: /jd|ats|keyword|keywords|priority keyword|关键词|核心词|技能词|岗位词/i,
  },
  {
    name: "quantification",
    covered: true,
    pattern: /quantif|measurable|metrics?|result|impact|数字|量化|成果|规模|频率|效率/i,
  },
  {
    name: "format_length_dates",
    covered: true,
    pattern: /one[-\s]?page|format|layout|date|pdf|word|spacing|font|一页|格式|版式|排版|日期|月份|行距|字体|页边距|压缩|压到|错位/i,
  },
  {
    name: "education_details",
    covered: true,
    pattern: /gpa|coursework|course work|relevant courses?|education|certificate|certification|training|课程|教育|证书|培训|评分制/i,
  },
  {
    name: "project_or_named_material",
    covered: true,
    pattern: /(?:split|rewrite|expand|merge|重写|改写|拆分|展开|合并).{0,80}(?:project|pipeline|项目)|\b[A-Z][A-Za-z0-9&/ .-]{2,70}\s+(?:project|pipeline)\b|项目.*(?:改写|拆分|展开|合并)/i,
  },
  {
    name: "delete_section_or_content",
    covered: true,
    pattern: /delete|remove|drop|cut|删掉|删除|删去|移除|去掉|弱化|后移.{0,20}(?:活动|奖项|课程|education|projects?|section|skills?)|(?:activities|awards|interests|languages|coursework|education|projects?|skills?).{0,30}(?:delete|remove|删掉|删除|移除|去掉)/i,
  },
  {
    name: "skill_truthfulness_or_pruning",
    covered: true,
    pattern: /(?:delete|remove|删掉|删除|移除|去掉).{0,60}(?:skills?|tools?|技术|技能|工具)|(?:unused|not used|不会|没用过|只是听过|解释不清).{0,60}(?:skills?|tools?|技能|工具)/i,
  },
  {
    name: "gpa_conditional_write_or_hide",
    covered: true,
    pattern: /(?:high|low|低|高).{0,20}gpa|gpa.{0,40}(?:hide|omit|remove|delete|不写|删|保留|写出|scale|评分)/i,
  },
];

function textOf(row) {
  return [
    row.id,
    row.canonical_action_family,
    row.problem_tags,
    row.topic,
    row.advice_card_title,
    row.user_problem_summary,
    row.A_action,
    row.action_summary,
    row.generalized_action,
    row.I_insight,
    row.HR_os,
  ].filter(Boolean).join(" ");
}

function compact(value, max = 180) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

(async () => {
  const pool = db.getPool();
  const { rows } = await pool.query(`
    SELECT id, chunk_id, topic, advice_card_title, user_problem_summary,
           "A_action", action_summary, generalized_action, "I_insight", "HR_os",
           problem_tags, canonical_action_family, action_depth, display_action_mode,
           action_specificity, activation_role_family, activation_keywords, grounding_terms
      FROM segments
     WHERE retrieval_scope = 'resume_edit'
       AND COALESCE(action_review_status, '') != 'exclude'
  `);

  const summary = new Map();
  const samples = new Map();
  const missingRows = [];

  for (const row of rows) {
    const text = textOf(row);
    for (const check of CHECKS) {
      if (!check.pattern.test(text)) continue;
      const item = summary.get(check.name) || { count: 0, covered: check.covered };
      item.count += 1;
      summary.set(check.name, item);
      if (!samples.has(check.name)) samples.set(check.name, []);
      if (samples.get(check.name).length < 8) samples.get(check.name).push(row);
      if (!check.covered) missingRows.push({ check: check.name, row });
    }
  }

  console.log(`Audited resume_edit segments: ${rows.length}`);
  console.log("\nPrecondition-sensitive categories:");
  for (const [name, item] of [...summary.entries()].sort((a, b) => b[1].count - a[1].count)) {
    console.log(`- ${name}: ${item.count} (${item.covered ? "runtime gate exists" : "needs runtime gate review"})`);
  }

  console.log("\nNeeds runtime gate review samples:");
  for (const { check, row } of missingRows.slice(0, 40)) {
    console.log(`\n[${check}] id=${row.id} family=${row.canonical_action_family || ""} tags=${row.problem_tags || ""}`);
    console.log(`  action=${compact(row.action_summary || row.A_action || row.generalized_action)}`);
    console.log(`  grounding=${compact(row.grounding_terms)} activation=${compact(row.activation_role_family || row.activation_keywords)}`);
  }

  console.log("\nRepresentative samples by category:");
  for (const [name, rowsForCategory] of samples.entries()) {
    console.log(`\n## ${name}`);
    for (const row of rowsForCategory.slice(0, 3)) {
      console.log(`- id=${row.id} family=${row.canonical_action_family || ""} action=${compact(row.action_summary || row.A_action || row.generalized_action, 140)}`);
    }
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
