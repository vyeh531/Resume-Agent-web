"use strict";

const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");
const {
  humanizeMentorInsight,
  humanizeHrPerspective,
  avoidRepeatedPerspectives,
} = require("../services/mentorAdviceRetrieval");

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = Math.min(Math.max(Number(limitArg ? limitArg.slice("--limit=".length) : 20) || 20, 1), 100);
const idsArg = process.argv.find((arg) => arg.startsWith("--ids="));
const IDS = idsArg
  ? idsArg.slice("--ids=".length).split(",").map((value) => Number(value.trim())).filter(Number.isFinite)
  : [];
const outArg = process.argv.find((arg) => arg.startsWith("--out="));
const OUT_PATH = outArg ? outArg.slice("--out=".length).trim() : "";
const csvArg = process.argv.find((arg) => arg.startsWith("--csv="));
const CSV_PATH = csvArg ? csvArg.slice("--csv=".length).trim() : "";

const CATEGORY_PATTERNS = {
  positioning: /定位|目标岗位|投递方向|通用版|版本|tailor|JD|岗位原词|role|position/i,
  keyword: /关键词|技能|Skills|SQL|Python|Tableau|Excel|VLOOKUP|pivot|VaR|stress testing|regression|prototype|debug|test|ATS|JD/i,
  portfolio: /作品集|作品|Demo|可运行|portfolio|可访问|链接|Github|project link/i,
  education: /课程|证书|教育|GPA|学校|学历|名校|course|certificate|education/i,
  format: /格式|排版|版面|一页|超页|跨页|字号|行距|日期|地址|section|layout|PDF|Word/i,
  impact: /量化|数字|结果|成果|影响|规模|效率|提升|impact|metrics?|measurable/i,
  truthfulness: /追问|可信度|真实|包装|虚构|注水|参与度|背调|background check|讲不出来/i,
  data: /数据|模型|分析|评估|算法|业务决策|业务影响|可复现|cohort|ML|DS|DA|model|analysis/i,
  collaboration: /协作|沟通|cross-functional|stakeholder|communication|团队/i,
  market: /身份|relocation|sponsorship|OPT|CPT|本地|地址|渠道|市场|公司规模|consumer|marketing/i,
};

const NORMAL_CATEGORY_PATTERNS = {
  positioning: /目标岗位|投递方向|通用版|多版本|目标JD|JD为锚点|岗位原词|定位/i,
  keyword: /关键词|技能|技术词|ATS|AB测试|A\/B测试|Skills|SQL|Python|Tableau|Excel/i,
  portfolio: /作品集|可访问|可验证|LinkedIn链接|LinkedIn link|GitHub|portfolio|project link/i,
  education: /相关课程|课程项目|证书|GPA|target school|course|certificate|education/i,
  format: /格式|排版|版面|一页|超页|跨页|字号|行距|section|layout|PDF|Word/i,
  impact: /量化|数字|结果|成果|影响力|效率提升|impact|metrics?|measurable/i,
  truthfulness: /追问|可信|可信度|真实|包装|虚构|注水|参与度|背调|background check|讲不出来/i,
  data: /数据|模型|算法|业务决策|业务影响|可复现|cohort|ML|DS|DA|model|analysis/i,
  collaboration: /协作|沟通|cross-functional|stakeholder|communication|团队/i,
  market: /relocation|sponsorship|OPT|CPT|渠道|consumer|marketing/i,
};

const STRONG_REVIEW_CATEGORIES = new Set([
  "positioning",
  "keyword",
  "portfolio",
  "education",
  "truthfulness",
  "collaboration",
]);

const DETAIL_PATTERNS = [
  /\bSQL\b/i,
  /\bPython\b/i,
  /\bTableau\b/i,
  /\bExcel\b/i,
  /\bPower BI\b/i,
  /\bPL300\b/i,
  /\bOffice\b/i,
  /\bVLOOKUP\b/i,
  /pivot table/i,
  /window function/i,
  /\bVaR\b/i,
  /stress testing/i,
  /regression model/i,
  /prototype|debug|test/i,
  /stable metrics/i,
  /benchmark/i,
  /GPA|scale|4\.0/i,
  /1\s*(?:至|到|-|~)\s*2|1-2|5\s*份/i,
  /Walmart|Costco|price elasticity/i,
  /Cohort Analysis/i,
  /ML|Machine Learning|模型名称|预测任务|特征规模/i,
  /cross-functional|stakeholder|communication/i,
  /background check|背调/i,
];

const GENERIC_PATTERNS = [
  /你这里有可修改的空间/,
  /不是推倒重来/,
  /方向对了以后/,
  /把现有材料讲得更清楚/,
  /不是没有材料/,
  /不是没价值/,
  /优先修的信号/,
];

const MENTOR_OVERACTIVE_PATTERNS = [
  /\u6211\u4f1a\u5e2e\u4f60/,
  /\u6211\u4f1a\u5148\u5e2e/,
  /\u6211\u4f1a\u966a\u4f60/,
  /\u6211\u4f1a\u4ece.{0,12}(?:\u4e0b\u624b|\u5f00\u59cb|\u6539)/,
  /\u6211\u4f1a\u628a.{0,28}(?:\u653e|\u8865|\u62c6|\u6536|\u5199|\u6539|\u63a5|\u6807|\u5220|\u7406\u987a|\u8bb2\u6e05\u695a)/,
];

const CORE_RISK_FLAGS = new Set([
  "lost_detail_risk",
  "wrong_family_risk",
  "lost_specific_terms",
  "mentor_overactive_voice_risk",
]);

function categoriesOf(text = "") {
  const value = text || "";
  const categories = new Set();
  for (const [category, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (pattern.test(value)) categories.add(category);
  }
  for (const [category, pattern] of Object.entries(NORMAL_CATEGORY_PATTERNS)) {
    if (pattern.test(value)) categories.add(category);
  }
  return Array.from(categories);
}

function detailTermsOf(text = "") {
  return DETAIL_PATTERNS
    .filter((pattern) => pattern.test(text || ""))
    .map((pattern) => pattern.source.replace(/\\b|\(\?:|\)|\?|\\/g, "").slice(0, 42));
}

function normalizedTextKey(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[，。；、,.!?;:："'“”‘’（）()\[\]{}<>]/g, "")
    .slice(0, 56);
}

function reviewFlagsFor(row) {
  const originalText = `${row.original.mentorInsight || ""} ${row.original.hrPerspective || ""}`;
  const originalMentorText = row.original.mentorInsight || "";
  const primaryOriginalText = categoriesOf(originalMentorText).length || detailTermsOf(originalMentorText).length
    ? originalMentorText
    : originalText;
  const proposedText = `${row.proposed.humanized_mentor_insight || ""} ${row.proposed.humanized_hr_perspective || ""}`;
  const originalCategories = categoriesOf(primaryOriginalText);
  const proposedCategories = categoriesOf(proposedText);
  const lostCategories = originalCategories
    .filter((category) => STRONG_REVIEW_CATEGORIES.has(category))
    .filter((category) => !proposedCategories.includes(category));
  const fullOriginalCategories = categoriesOf(originalText);
  const gainedCategories = proposedCategories
    .filter((category) => STRONG_REVIEW_CATEGORIES.has(category))
    .filter((category) => !fullOriginalCategories.includes(category));
  const originalDetails = detailTermsOf(primaryOriginalText);
  const proposedDetails = detailTermsOf(proposedText);
  const lostDetails = originalDetails.filter((detail) => !proposedDetails.some((item) => item.toLowerCase() === detail.toLowerCase()));
  const flags = [];
  const reasons = [];

  if (lostCategories.length) {
    flags.push("lost_detail_risk");
    reasons.push(`Proposed text no longer shows original category signal(s): ${lostCategories.join(", ")}`);
  }
  if (gainedCategories.length >= 2 || (gainedCategories.length && !originalCategories.length)) {
    flags.push("wrong_family_risk");
    reasons.push(`Proposed text adds category signal(s) not clearly present in original: ${gainedCategories.join(", ")}`);
  }
  if (lostDetails.length) {
    flags.push("lost_specific_terms");
    reasons.push(`Specific source term(s) may be missing: ${lostDetails.join(", ")}`);
  }
  if (GENERIC_PATTERNS.some((pattern) => pattern.test(proposedText))) {
    flags.push("too_generic_risk");
    reasons.push("Proposed text matches a known generic template phrase.");
  }
  if (MENTOR_OVERACTIVE_PATTERNS.some((pattern) => pattern.test(row.proposed.humanized_mentor_insight || ""))) {
    flags.push("mentor_overactive_voice_risk");
    reasons.push("Mentor copy sounds like the mentor will personally edit or operate on the resume, instead of giving senior-schoolmate advice.");
  }
  if (!/\u4f60|\u6211|\u8fd9\u6761|\u8fd9\u91cc|\u8fd9\u5757|\u5148/.test(row.proposed.humanized_mentor_insight || "")) {
    flags.push("mentor_not_conversational");
    reasons.push("Mentor copy may not read like direct senior-schoolmate advice.");
  }
  if (!/\u6211|\u7b5b|\u5224\u65ad|\u98ce\u9669|\u7b2c\u4e00\u773c|\u7ee7\u7eed\u8bfb|\u63a8\u8fdb|\u9762\u8bd5/.test(row.proposed.humanized_hr_perspective || "")) {
    flags.push("hr_not_screening_voice");
    reasons.push("HR copy may not sound like a screening decision/risk statement.");
  }

  return {
    flags,
    reasons,
    originalCategories,
    proposedCategories,
    lostCategories,
    gainedCategories,
    originalDetails,
    proposedDetails,
    lostDetails,
  };
}

function coreRiskCount(row) {
  return reviewFlagsFor(row).flags.filter((flag) => CORE_RISK_FLAGS.has(flag)).length;
}

function csvEscape(value = "") {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function writeCsv(rows, outputPath) {
  const headers = [
    "id",
    "topic",
    "problem_tags",
    "review_recommendation",
    "review_flags",
    "review_reasons",
    "lost_categories",
    "gained_categories",
    "lost_details",
    "original_mentor",
    "humanized_mentor",
    "original_hr",
    "humanized_hr",
    "db_humanized_mentor",
    "db_humanized_hr",
    "db_review_status",
  ];
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push([
      row.id,
      row.topic,
      row.problem_tags,
      row.review.recommendation,
      row.review.flags,
      row.review.reasons,
      row.review.lostCategories,
      row.review.gainedCategories,
      row.review.lostDetails,
      row.original.mentorInsight,
      row.proposed.humanized_mentor_insight,
      row.original.hrPerspective,
      row.proposed.humanized_hr_perspective,
      row.dbDisplay.humanized_mentor_insight,
      row.dbDisplay.humanized_hr_perspective,
      row.dbDisplay.perspective_review_status,
    ].map(csvEscape).join(","));
  }
  const resolved = path.resolve(process.cwd(), outputPath);
  fs.mkdirSync(path.dirname(resolved), { recursive: true });
  fs.writeFileSync(resolved, `\uFEFF${lines.join("\n")}\n`, "utf8");
  console.error(`[audit] wrote CSV ${rows.length} rows to ${resolved}`);
}

async function main() {
  const pool = db.getPool();
  const query = IDS.length
    ? {
        text: `SELECT id, chunk_id, topic, "L1", "L2", "P_mentor", "A_action", "I_insight", "HR_os",
            problem_tags, role_family, target_roles, canonical_action_family, action_depth,
            advice_card_title, user_problem_summary, action_summary, unlock_tier, confidence,
            to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
            to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
            to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status,
            to_jsonb(segments)->>'perspective_source' AS perspective_source,
            to_jsonb(segments)->>'perspective_confidence' AS perspective_confidence
       FROM segments
      WHERE id = ANY($1::int[])
      ORDER BY array_position($1::int[], id)`,
        values: [IDS],
      }
    : {
        text: `SELECT id, chunk_id, topic, "L1", "L2", "P_mentor", "A_action", "I_insight", "HR_os",
            problem_tags, role_family, target_roles, canonical_action_family, action_depth,
            advice_card_title, user_problem_summary, action_summary, unlock_tier, confidence,
            to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
            to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
            to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status,
            to_jsonb(segments)->>'perspective_source' AS perspective_source,
            to_jsonb(segments)->>'perspective_confidence' AS perspective_confidence
       FROM segments
      WHERE (retrieval_scope IS NULL OR retrieval_scope = 'resume_edit')
        AND COALESCE("I_insight", '') <> ''
        AND COALESCE("HR_os", '') <> ''
      ORDER BY random()
      LIMIT $1`,
        values: [LIMIT],
      };
  const { rows } = await pool.query(query);

  const proposed = avoidRepeatedPerspectives(rows.map((row) => {
    const card = {
      ...row,
      adviceId: row.id ? `seg_${row.id}` : row.chunk_id,
      title: row.advice_card_title || row.topic || "",
      mentorInsight: row.I_insight || "",
      mentorLens: row.P_mentor || "",
      hrPerspective: row.HR_os || "",
      relatedProblemTags: String(row.problem_tags || "").split(",").map((v) => v.trim()).filter(Boolean),
      canonicalActionFamily: row.canonical_action_family || "",
    };
    return {
      id: row.id,
      topic: row.topic,
      problem_tags: row.problem_tags,
      original: {
        mentorInsight: row.I_insight,
        hrPerspective: row.HR_os,
      },
      dbDisplay: {
        humanized_mentor_insight: row.humanized_mentor_insight || "",
        humanized_hr_perspective: row.humanized_hr_perspective || "",
        perspective_review_status: row.perspective_review_status || "",
        perspective_source: row.perspective_source || "",
        perspective_confidence: row.perspective_confidence || "",
      },
      proposed: {
        humanized_mentor_insight: humanizeMentorInsight(card),
        humanized_hr_perspective: humanizeHrPerspective(card),
        perspective_review_status: "needs_review",
        perspective_source: "runtime_rule_audit",
        perspective_confidence: 0.72,
      },
    };
  }));
  const dedupedDisplay = avoidRepeatedPerspectives(proposed.map((row) => ({
    ...row,
    mentorInsight: row.proposed.humanized_mentor_insight,
    mentorLens: row.proposed.humanized_mentor_insight,
    hrPerspective: row.proposed.humanized_hr_perspective,
    HR_os: row.proposed.humanized_hr_perspective,
  })));
  for (let index = 0; index < proposed.length; index += 1) {
    const originalCoreRisk = coreRiskCount(proposed[index]);
    const mentorCandidate = dedupedDisplay[index].mentorInsight || dedupedDisplay[index].mentorLens || proposed[index].proposed.humanized_mentor_insight;
    const hrCandidate = dedupedDisplay[index].hrPerspective || dedupedDisplay[index].HR_os || proposed[index].proposed.humanized_hr_perspective;
    if (mentorCandidate !== proposed[index].proposed.humanized_mentor_insight) {
      const candidateRow = {
        ...proposed[index],
        proposed: {
          ...proposed[index].proposed,
          humanized_mentor_insight: mentorCandidate,
        },
      };
      if (coreRiskCount(candidateRow) <= originalCoreRisk) {
        proposed[index].proposed.humanized_mentor_insight = mentorCandidate;
      }
    }
    if (hrCandidate !== proposed[index].proposed.humanized_hr_perspective) {
      const candidateRow = {
        ...proposed[index],
        proposed: {
          ...proposed[index].proposed,
          humanized_hr_perspective: hrCandidate,
        },
      };
      if (coreRiskCount(candidateRow) <= originalCoreRisk) {
        proposed[index].proposed.humanized_hr_perspective = hrCandidate;
      }
    }
  }
  const mentorCounts = new Map();
  const hrCounts = new Map();
  for (const row of proposed) {
    const mentorKey = normalizedTextKey(row.proposed.humanized_mentor_insight);
    const hrKey = normalizedTextKey(row.proposed.humanized_hr_perspective);
    if (mentorKey) mentorCounts.set(mentorKey, (mentorCounts.get(mentorKey) || 0) + 1);
    if (hrKey) hrCounts.set(hrKey, (hrCounts.get(hrKey) || 0) + 1);
  }
  for (const row of proposed) {
    const review = reviewFlagsFor(row);
    const mentorRepeated = (mentorCounts.get(normalizedTextKey(row.proposed.humanized_mentor_insight)) || 0) > 1;
    const hrRepeated = (hrCounts.get(normalizedTextKey(row.proposed.humanized_hr_perspective)) || 0) > 1;
    if (mentorRepeated || hrRepeated) {
      review.flags.push("repeated_template_risk");
      review.reasons.push(`${mentorRepeated ? "Mentor" : "HR"} copy repeats within this audit sample.`);
    }
    row.review = {
      ...review,
      recommendation: review.flags.length ? "needs_manual_review" : "good_as_is",
    };
    if (!review.flags.length) {
      row.review.flags.push("good_as_is");
      row.review.reasons.push("No heuristic review risks detected; still requires human spot-check before DB approval.");
    }
  }

  const payload = {
    table: "vibe_offer.segments",
    dryRun: true,
    generatedAt: new Date().toISOString(),
    query: IDS.length ? { ids: IDS } : { limit: LIMIT },
    sampledRows: proposed.length,
    reviewSummary: proposed.reduce((acc, row) => {
      for (const flag of row.review.flags) acc[flag] = (acc[flag] || 0) + 1;
      return acc;
    }, {}),
    rows: proposed,
  };

  if (OUT_PATH) {
    const resolved = path.resolve(process.cwd(), OUT_PATH);
    fs.mkdirSync(path.dirname(resolved), { recursive: true });
    fs.writeFileSync(resolved, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    console.error(`[audit] wrote ${proposed.length} rows to ${resolved}`);
  }
  if (CSV_PATH) writeCsv(proposed, CSV_PATH);

  console.log(JSON.stringify(payload, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  categoriesOf,
  detailTermsOf,
  normalizedTextKey,
  reviewFlagsFor,
  coreRiskCount,
  writeCsv,
};
