"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");
const {
  inferAdviceIntent,
  inferAdviceScope,
  isEligibleForAtsResumeReport,
  splitCsv,
} = require("../services/mentorAdviceRetrieval");

const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 80);
const WRITE_JSON = process.argv.includes("--json");

function uniq(items) {
  return [...new Set(items.filter(Boolean))];
}

function textOf(row) {
  return [
    row.topic,
    row.L1,
    row.L2,
    row.P_mentor,
    row.A_action,
    row.I_insight,
    row.E_example,
    row.HR_os,
    row.keywords,
    row.retrieval_text,
    row.advice_card_title,
    row.user_problem_summary,
    row.action_summary,
    row.role_family,
    row.target_roles,
    row.target_role,
    row.target_role_family,
  ].filter(Boolean).join(" ").toLowerCase();
}

function actionTextOf(row) {
  return [row.A_action, row.action_summary].filter(Boolean).join(" ").toLowerCase();
}

function sampleText(row) {
  return String(row.advice_card_title || row.user_problem_summary || row.P_mentor || row.A_action || row.topic || "")
    .replace(/\s+/g, " ")
    .slice(0, 180);
}

const TAG_RULES = [
  {
    label: "keyword_tag_without_keyword_action",
    tag: /^(low_jd_keyword_match|missing_priority_keywords|low_hard_skill_match|keywords_only_in_skills|resume_not_tailored_to_jd|keyword_gap_minor|missing_domain_keywords)$/,
    action: /jd|ats|keyword|关键词|技能|skills?|工具|技术|技术词|技术栈|模型|框架|算法|指标|术语|简历|定制|版本|岗位|职位|方向|title|栏目|专栏|模块|pdf|summary|experience|project|经历|项目|补充|加入|写进|改写|rewrite|python|sql|tableau|power\s*bi|excel|react|angular|aws|docker|kafka/i,
  },
  {
    label: "experience_evidence_tag_without_experience_action",
    tag: /experience|evidence|skills_only/,
    action: /experience|bullet|project|经历|项目|证据|量化|成果|impact|result|keyword|关键词|写进|改写/,
  },
  {
    label: "summary_role_tag_without_summary_action",
    tag: /summary|exact_job_title|target_role|role_alignment/,
    action: /summary|title|岗位原词|目标岗位|target role|position|定位|改写|加入|写进/,
  },
  {
    label: "format_tag_without_format_action",
    tag: /format|pdf|file|layout|readability|section_order/,
    action: /format|pdf|word|layout|spacing|section|header|排版|格式|对齐|页边距|标题|版块|板块/,
  },
  {
    label: "portfolio_tag_without_portfolio_action",
    tag: /portfolio/,
    action: /portfolio|作品集|personal website|website|behance|dribbble|link|链接|可点击/,
  },
];

const NON_RESUME_PATTERNS = [
  ["job_search_timing", /投递窗口|窗口期|海投|内推|networking|career fair|抢投|申请时间|秋招|春招|投递量|追加约?\d+|先追加|offer/i],
  ["interview_outcome", /约面|快速联系|岗位消失|岗位下线|急招|急需人才|好兆头|放平心态|积极应对|面试邀请|interview invitation|interview outcome/i],
  ["school_application", /申研|升学|录取|admission|申请文书|推荐信|gre|目标学校|学校申请/i],
  ["career_strategy", /职业规划|职业方向|转行|市场竞争|背景差距|gap分析|路线规划|full-time job offer|entry point/i],
];

const STUDENT_SPECIFIC_PATTERNS = [
  ["student_state", /仍在读|目前在国内|人在国内|国内远程|需要sponsorship|需要\s*sponsorship|cpt|opt|h-?1b|gap year|毕业后有超过一年空白|毕业超过一年/i],
  ["mental_state", /担心|不确定|怕|焦虑|丧失信心|没进步|心态/i],
  ["conversation_trace", /导师\s|我觉得|我认为|你后续|对吧|好像|应该知道|这人/i],
  ["specific_event", /岗位消失|岗位下线|快速约面|收到约面|三四天|急招|约面邀请/i],
];

const ROLE_SPECIFIC_TERMS = [
  "financial analyst", "investment analyst", "risk analyst", "accounting", "audit",
  "hardware", "onsite", "lab", "analytics", "data scientist", "data analyst",
  "graphic designer", "ux designer", "animation",
  "machine learning", "mle", "software engineer", "swe", "backend", "frontend",
  "会计", "投资分析", "硬件", "硬體", "作品集", "设计师", "動畫",
];

function detectTagActionMismatches(row) {
  const tags = splitCsv(row.problem_tags);
  const action = actionTextOf(row);
  if (!tags.length || !action) return [];
  const issues = [];
  for (const rule of TAG_RULES) {
    if (tags.some((tag) => rule.tag.test(tag)) && !rule.action.test(action)) {
      issues.push(rule.label);
    }
  }
  return issues;
}

function detectNonResume(row) {
  const text = textOf(row);
  return NON_RESUME_PATTERNS
    .filter(([, pattern]) => pattern.test(text))
    .map(([label]) => label);
}

function detectStudentSpecific(row) {
  const text = textOf(row);
  return STUDENT_SPECIFIC_PATTERNS
    .filter(([, pattern]) => pattern.test(text))
    .map(([label]) => label);
}

function isSectionTitleOnly(row) {
  const text = textOf(row);
  return /internship/.test(text) &&
    /professional experience|experience/.test(text) &&
    /标题|栏|section|header|heading|版块|板块/.test(text) &&
    !/jd|ats|keyword|关键词|machine learning|mle|image generation|stable diffusion|sdxl|flux|comfyui/i.test(text);
}

function hasUniversalRoleLeak(row) {
  const roles = splitCsv(row.role_family || row.target_roles || "");
  const isUniversal = !roles.length || roles.includes("universal");
  if (!isUniversal) return false;
  const text = textOf(row);
  if (splitCsv(row.problem_tags).some((tag) => /portfolio|github|linkedin|format|education|keyword|summary|experience|measurable|action/.test(tag))) {
    return false;
  }
  return ROLE_SPECIFIC_TERMS.some((term) => text.includes(term));
}

function recommendedSpecificity(row, flags) {
  if (flags.studentSpecific.length || flags.nonResume.length) return "student_specific";
  if (hasUniversalRoleLeak(row)) return "role_specific";
  const roleFamilies = splitCsv(row.role_family).filter((role) => role !== "universal");
  if (roleFamilies.length) return roleFamilies.length > 1 ? "function_specific" : "role_specific";
  if (splitCsv(row.problem_tags).length) return "issue_specific";
  return "unknown";
}

function inspectRow(row) {
  const flags = {
    nonResume: detectNonResume(row),
    studentSpecific: detectStudentSpecific(row),
    tagActionMismatch: detectTagActionMismatches(row),
    sectionTitleOnly: isSectionTitleOnly(row),
    universalRoleLeak: hasUniversalRoleLeak(row),
    eligibleNow: isEligibleForAtsResumeReport(row),
    inferredScope: inferAdviceScope(row),
    inferredIntent: inferAdviceIntent(row),
  };
  const issueLabels = [
    ...flags.nonResume.map((label) => `scope:${label}`),
    ...flags.studentSpecific.map((label) => `specific:${label}`),
    ...flags.tagActionMismatch.map((label) => `tag:${label}`),
    flags.sectionTitleOnly ? "specific:section_title_only" : "",
    flags.universalRoleLeak ? "role:universal_role_leak" : "",
  ].filter(Boolean);

  return {
    id: row.id,
    chunk_id: row.chunk_id,
    retrieval_scope: row.retrieval_scope || "",
    role_family: row.role_family || "",
    target_roles: row.target_roles || "",
    problem_tags: row.problem_tags || "",
    topic: row.topic || "",
    inferred_scope: flags.inferredScope,
    inferred_intent: flags.inferredIntent,
    eligible_now: flags.eligibleNow,
    recommended_specificity: recommendedSpecificity(row, flags),
    issues: uniq(issueLabels),
    sample: sampleText(row),
  };
}

function countBy(items, keyFn) {
  const counts = new Map();
  for (const item of items) {
    const keys = [].concat(keyFn(item)).filter(Boolean);
    for (const key of keys) counts.set(key, (counts.get(key) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function printBucket(title, rows, predicate) {
  const bucket = rows.filter(predicate);
  console.log(`\n# ${title}: ${bucket.length}`);
  for (const row of bucket.slice(0, LIMIT)) {
    console.log(`- id=${row.id} scope=${row.retrieval_scope || "(empty)"} spec=${row.recommended_specificity} issues=[${row.issues.join(", ")}] tags=[${row.problem_tags}] :: ${row.sample}`);
  }
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");

  const { rows } = await pool.query(`
    SELECT id, chunk_id, topic, "L1", "L2", "P_mentor", "A_action", "I_insight",
           "E_example", "HR_os", keywords, retrieval_text, advice_card_title,
           user_problem_summary, action_summary, role_family, target_roles,
           target_role, target_role_family, generality, advice_type, problem_tags,
           ats_dimensions, retrieval_scope, topic_slug
      FROM segments
     WHERE retrieval_scope IS NULL OR retrieval_scope = 'resume_edit'
     ORDER BY id
  `);

  const inspected = rows.map(inspectRow);
  const suspicious = inspected.filter((row) => row.issues.length);
  const summary = {
    total_resume_scope_rows: rows.length,
    suspicious_rows: suspicious.length,
    limit: LIMIT,
  };

  console.log(JSON.stringify(summary, null, 2));

  console.log("\n# issue_counts");
  for (const [issue, count] of countBy(suspicious, (row) => row.issues).slice(0, 60)) {
    console.log(`${issue}: ${count}`);
  }

  console.log("\n# recommended_specificity_counts");
  for (const [level, count] of countBy(inspected, (row) => row.recommended_specificity)) {
    console.log(`${level}: ${count}`);
  }

  printBucket("student_specific_samples", suspicious, (row) => row.issues.some((issue) => issue.startsWith("specific:")));
  printBucket("scope_suspicious_samples", suspicious, (row) => row.issues.some((issue) => issue.startsWith("scope:")));
  printBucket("tag_action_mismatch_samples", suspicious, (row) => row.issues.some((issue) => issue.startsWith("tag:")));
  printBucket("universal_role_leak_samples", suspicious, (row) => row.issues.includes("role:universal_role_leak"));

  if (WRITE_JSON) {
    const outDir = path.join(process.cwd(), "data", "audit");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `segments_quality_${Date.now()}.json`);
    fs.writeFileSync(outPath, JSON.stringify({ summary, suspicious }, null, 2));
    console.log(`\njson=${outPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
