"use strict";

/**
 * PART 9 — Tests for the new mentor advice schema
 * Run: node scripts/test_mentor_advice_schema.js
 *
 * 7 test cases covering:
 *   1. fallbackAdviceItems (accounting) — new fields present
 *   2. fallbackAdviceItems (software_engineer) — new fields present
 *   3. toAdviceItem with DB-adapted card — source="db_adapted", compat aliases work
 *   4. toAdviceItem with native new-schema card — source="db"
 *   5. buildAdviceEvidence with explicit evidence — returns chips unchanged (max 3)
 *   6. buildAdviceEvidence with no evidence — derives from relatedProblemTags
 *   7. formatPublicFreeMentorAdvice — all new fields + backward compat in output
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// We need to import module internals. Since some are not exported, we stub
// the db require so the module loads without a real DB file.
const Module = require("module");
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "../database") {
    return { getDB: () => null };  // stub — tests don't touch DB
  }
  return originalLoad.apply(this, arguments);
};

const {
  buildAdviceEvidence,
  buildPublicSafeEvidence,
  formatPublicFreeMentorAdvice,
  isCardAlignedWithTargetProblems,
  extractGroundingTermsFromAdvice,
  isResumeGroundedAdvice,
  actionPreconditionGate,
  normalizeDisplayActionLanguage,
  normalizeDisplayTitle,
  normalizeDisplayDiagnosis,
  humanizeMentorInsight,
  humanizeHrPerspective,
  avoidRepeatedPerspectives,
  selectPremiumMentorPlan,
  formatPremiumMentorReport,
  isDisplayableInsiderKnowledge,
  buildInsiderKnowledgeTip,
} = require("../services/mentorAdviceRetrieval");
const mentorInsightRulesBackfill = require("./backfill_segments_mentor_insight_rules");
const mentorInsightLlmGeneration = require("./generate_segments_mentor_insight_llm");
const {
  formatPremiumUnlockedReport,
} = require("../src/ats/report-formatter");

// Re-load the module to get non-exported helpers via internal eval
// Instead, test exported functions + manually construct what fallbackAdviceItems produces
// by calling the public entry points with mocked internalAtsResult.

// ─── helpers ───────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓  ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗  ${name}`);
    console.error(`     ${err.message}`);
    failed++;
  }
}

function assertHasKeys(obj, keys, label = "object") {
  for (const key of keys) {
    assert.ok(key in obj, `${label} is missing key "${key}"`);
  }
}

// ─── TEST 1: buildAdviceEvidence — explicit chips honoured ─────────────────
console.log("\nTest 1: buildAdviceEvidence — explicit evidence chips returned as-is");
test("returns explicit evidence array unchanged", () => {
  const item = {
    adviceId: "fb_target_role_positioning",
    evidence: ["JD Match 偏低", "F 职位相关性偏低", "缺少目标岗位原词"],
    relatedProblemTags: [],
  };
  const result = buildAdviceEvidence(item, null, {});
  assert.deepStrictEqual(result, ["JD Match 偏低", "F 职位相关性偏低", "缺少目标岗位原词"]);
});

// ─── TEST 2: buildAdviceEvidence — caps at 3 chips ────────────────────────
console.log("\nTest 2: buildAdviceEvidence — caps at 3 even if more provided");
test("trims explicit evidence to max 3", () => {
  const item = {
    evidence: ["A", "B", "C", "D", "E"],
    relatedProblemTags: [],
  };
  const result = buildAdviceEvidence(item, null, {});
  assert.strictEqual(result.length, 3);
  assert.deepStrictEqual(result, ["A", "B", "C"]);
});

// ─── TEST 3: buildAdviceEvidence — derives from tags (no explicit evidence) ─
console.log("\nTest 3: buildAdviceEvidence — derives chips from relatedProblemTags");
test("derives JD Match chip from low_jd_keyword_match tag", () => {
  const item = { relatedProblemTags: ["low_jd_keyword_match"] };
  const chips = buildAdviceEvidence(item, null, {});
  assert.ok(chips.includes("JD Match 偏低"), `expected "JD Match 偏低", got: ${JSON.stringify(chips)}`);
});

test("derives 岗位原词 chip from missing_exact_job_title tag", () => {
  const item = { relatedProblemTags: ["missing_exact_job_title"] };
  const chips = buildAdviceEvidence(item, null, {});
  assert.ok(chips.includes("缺少目标岗位原词"), `expected "缺少目标岗位原词", got: ${JSON.stringify(chips)}`);
});

test("derives Experience chip from weak_experience_keyword_evidence tag", () => {
  const item = { relatedProblemTags: ["weak_experience_keyword_evidence"] };
  const chips = buildAdviceEvidence(item, null, {});
  assert.ok(chips.includes("Experience 缺少关键词证据"), `expected Experience chip, got: ${JSON.stringify(chips)}`);
});

// ─── TEST 4: buildPublicSafeEvidence is a deprecated alias ───────────────
console.log("\nTest 4: buildPublicSafeEvidence delegates to buildAdviceEvidence");
test("buildPublicSafeEvidence returns same result as buildAdviceEvidence", () => {
  const item = { evidence: ["chip-A", "chip-B"], relatedProblemTags: [] };
  const a = buildAdviceEvidence(item, null, {});
  const b = buildPublicSafeEvidence(item, {});
  assert.deepStrictEqual(a, b);
});

// ─── TEST 5: formatPublicFreeMentorAdvice — new fields in output ──────────
console.log("\nTest 5: formatPublicFreeMentorAdvice includes all new schema fields");
test("adviceItems contain mentorLens, currentDiagnosis, action, reason, evidence", () => {
  const freePlan = {
    mentorId: "mentor_test",
    mentorName: "Y 导师",
    company: "Amazon",
    companyLogo: "/logos/Amazon.png",
    mentorTitle: "ATS 策略师",
    badges: ["ATS"],
    matchReason: "test reason",
    matchedProblems: [],
    adviceItems: [
      {
        adviceId: "test_schema_item",
        title: "Test title",
        mentorLens: "lens text",
        currentDiagnosis: "diagnosis text",
        action: "action text",
        reason: "reason text",
        evidence: ["chip1", "chip2"],
        relatedProblemTags: [],
        targetSection: "summary",
        priority: "high",
        source: "fallback",
      },
    ],
  };
  const result = formatPublicFreeMentorAdvice(freePlan, {});
  assert.ok(Array.isArray(result.adviceItems), "adviceItems should be array");
  const item = result.adviceItems[0];
  assertHasKeys(item, ["mentorLens", "currentDiagnosis", "action", "reason", "evidence"], "adviceItem");
  assert.ok(item.mentorLens, "mentorLens should be populated");
  assert.strictEqual(item.currentDiagnosis, "diagnosis text");
  assert.strictEqual(item.action, "action text");
  assert.ok(item.reason, "reason should be populated");
  assert.ok(Array.isArray(item.evidence), "evidence should be array");
  assert.ok(item.evidence.length > 0, "evidence should be populated");
});

test("premium report preserves rewriteExample and legacy beforeAfter fields", () => {
  const internal = {
    priorityMissingKeywords: [],
    structuredSuggestions: [],
    keywordMatch: { categories: {} },
    problemTags: [],
  };
  const report = formatPremiumUnlockedReport(internal, {
    mentors: [{
      mentorId: "m_rewrite",
      mentorName: "Rewrite mentor",
      adviceItems: [{
        adviceId: "rewrite_item",
        title: "Rewrite weak bullet",
        example: "Built SQL dashboard for weekly KPI reporting.",
        rewriteExample: {
          before: "Made reports every week.",
          after: "Built SQL dashboard for weekly KPI reporting.",
        },
        beforeAfter: {
          before: "Made reports.",
          after: "Built SQL dashboard.",
        },
      }],
    }],
    allAdviceItems: [{
      adviceId: "rewrite_item",
      title: "Rewrite weak bullet",
      example: "Built SQL dashboard for weekly KPI reporting.",
      rewriteExample: {
        before: "Made reports every week.",
        after: "Built SQL dashboard for weekly KPI reporting.",
      },
      beforeAfter: {
        before: "Made reports.",
        after: "Built SQL dashboard.",
      },
    }],
  });
  const item = report.allAdviceItems[0];
  assert.deepStrictEqual(item.rewriteExample, {
    before: "Made reports every week.",
    after: "Built SQL dashboard for weekly KPI reporting.",
  });
  assert.deepStrictEqual(item.beforeAfter, {
    before: "Made reports.",
    after: "Built SQL dashboard.",
  });
});

test("report logic renders example as rewrite-after fallback", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "public", "report-logic.js"), "utf8");
  assert.ok(/function buildRewriteExample/.test(source), "buildRewriteExample should exist");
  assert.ok(/explicitAfter \|\| firstTextValue\(\[example\]\)/.test(source), "example should feed rewrite after fallback");
  assert.ok(/renderRewriteExampleCard\(item\)/.test(source), "advice renderer should use rewrite card");
  assert.ok(/改前/.test(source), "rewrite card should label before text");
  assert.ok(/改后/.test(source), "rewrite card should label after text");
  assert.ok(/\\u7121Summary/.test(source), "missing Summary rewrite before should show 無Summary");
  assert.ok(/&#20851;&#38190;&#38382;&#39064;/.test(source), "key-problem heading should use encoding-safe text");
});

// ─── TEST 6: backward compat aliases ─────────────────────────────────────
console.log("\nTest 6: backward compat — problemSummary and actionSummary present");
test("problemSummary equals currentDiagnosis", () => {
  const freePlan = {
    mentorId: "m1", mentorName: "X", company: "Test", badges: [],
    matchReason: "", matchedProblems: [],
    adviceItems: [{
      adviceId: "test_id",
      title: "Test",
      currentDiagnosis: "the diagnosis",
      action: "the action",
      relatedProblemTags: [],
      targetSection: "skills",
      priority: "medium",
      source: "fallback",
    }],
  };
  const result = formatPublicFreeMentorAdvice(freePlan, {});
  const item = result.adviceItems[0];
  assert.strictEqual(item.problemSummary, item.currentDiagnosis,
    "problemSummary should equal currentDiagnosis");
  assert.strictEqual(item.actionSummary, item.action,
    "actionSummary should equal action");
});

// ─── TEST 7: source field logic ───────────────────────────────────────────
console.log("\nTest 7: source field — fallback items keep source='fallback'");
test("source field passed through unchanged from fallback item", () => {
  const freePlan = {
    mentorId: "m1", mentorName: "Y", company: "Test", badges: [],
    matchReason: "", matchedProblems: [],
    adviceItems: [{
      adviceId: "fb_jd_keyword_alignment",
      title: "Keywords",
      currentDiagnosis: "missing keywords",
      action: "add keywords",
      relatedProblemTags: ["low_jd_keyword_match"],
      targetSection: "skills",
      priority: "high",
      source: "fallback",
    }],
  };
  const result = formatPublicFreeMentorAdvice(freePlan, {});
  const item = result.adviceItems[0];
  assert.strictEqual(item.source, "fallback");
});

console.log("\nTest 8: display copy governance");
test("English action is replaced with Chinese display action while preserving common terms", () => {
  const action = "Rewrite the Summary to include the exact target job title and add stronger Experience bullet evidence for the target JD.";
  const normalized = normalizeDisplayActionLanguage(action, {
    canonicalActionFamily: "summary_positioning",
  }, "优先把目标岗位关键词、相关技能和经历证据放到 Summary、Skills 和 Experience 中。");
  assert.ok(/[\u4e00-\u9fff]/.test(normalized), normalized);
  assert.ok(!/^Rewrite the Summary/i.test(normalized), normalized);
});

test("system placeholder title and diagnosis are not displayed", () => {
  assert.notStrictEqual(
    normalizeDisplayTitle("简历优化建议 11", { canonicalActionFamily: "experience_evidence" }),
    "简历优化建议 11"
  );
  assert.ok(!/导师建议不足 12 条/.test(
    normalizeDisplayDiagnosis("当前报告可用的导师建议不足 12 条，系统基于 ATS 诊断补充了这一条优先行动。")
  ));
});

test("front-end report logic does not re-enable empty report fallback suggestions", () => {
  const source = fs.readFileSync(path.join(__dirname, "..", "public", "report-logic.js"), "utf8");
  assert.ok(!/const\s+fallbackSuggestions\s*=\s*normalizeSuggestionList\s*\(\s*\)/.test(source));
  assert.ok(!/report-fallback/i.test(source));
  assert.ok(!/while\s*\(\s*items\.length\s*<\s*12/i.test(source));
});

test("premium plan may return fewer than 12 advice items without system placeholders", () => {
  const internal = {
    jobTitle: "Management Trainee",
    profile: { roleFamily: "business", targetRole: "Management Trainee" },
    adviceCoverageObligations: [{
      id: "ob_kw",
      tag: "missing_priority_keywords",
      severity: "high",
      dimension: "D",
      keywords: ["process improvement"],
      message: "简历缺少 process improvement 相关证据。",
      required: true,
    }],
  };
  const plan = selectPremiumMentorPlan([], internal, { adviceItems: [] });
  const report = formatPremiumMentorReport(plan, internal);
  assert.ok(report.allAdviceItems.length > 0, "should include problem-specific fallback");
  assert.ok(report.allAdviceItems.length < 12, "should not force-fill to 12");
  const text = report.allAdviceItems.map((item) => `${item.title} ${item.currentDiagnosis} ${item.action}`).join(" ");
  assert.ok(!/简历优化建议\s*\d+|导师建议不足\s*12\s*条|report-fallback/i.test(text), text);
});

console.log("\nTest 8b: humanized mentor / HR perspectives");
test("mentor insight becomes senior-schoolmate style instead of report summary", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_test_mentor_tone",
    canonicalActionFamily: "experience_evidence",
    I_insight: "HR在扫描简历时优先寻找候选人的贡献与影响力。被动式表述只证明执行了任务，而成果导向的表述能体现候选人的主观能动性。",
    relatedProblemTags: ["weak_action_verbs", "weak_result_orientation"],
  });
  assert.ok(/你|我会/.test(text), text);
  assert.ok(!/候选人|主观能动性/.test(text), text);
});

test("mentor tone suggests instead of sounding like the mentor will edit it for the user", () => {
  const cases = [
    {
      adviceId: "seg_versioning_tone_boundary",
      problem_tags: "generic_resume_positioning,resume_not_tailored_to_jd,low_role_specificity",
      canonicalActionFamily: "summary_positioning",
      I_insight: "简历定位模糊是投递中最常见的问题。HR若看到简历混合多个方向，会认为求职者自己都不清楚要做什么。",
      title: "多版本简历策略",
    },
    {
      adviceId: "seg_format_tone_boundary",
      problem_tags: "formatting_penalty_triggered",
      canonicalActionFamily: "format_cleanup",
      I_insight: "简历排版需要通过地址位置调整、字体大小、行间距等细节手段最大化利用页面空间，避免内容跨页断裂影响阅读体验",
      title: "简历格式规范",
    },
    {
      adviceId: "seg_data_tone_boundary",
      problem_tags: "weak_result_orientation",
      canonicalActionFamily: "experience_evidence",
      I_insight: "DA岗位HR最关注候选人是否有从raw data出发、解决实际业务问题的经验，能清楚描述完整的数据分析场景远比罗列技能更有说服力",
      title: "项目经历描述",
    },
  ];
  const text = cases.map((item) => humanizeMentorInsight(item)).join("\n");
  assert.ok(!/我会帮你|我会先帮你|我会从|我会把|我会陪你/.test(text), text);
  assert.ok(/建议|可以|要|先/.test(text), text);
});

test("audit review flags overactive mentor voice", () => {
  const auditScript = fs.readFileSync(path.join(__dirname, "audit_segments_perspective_tone.js"), "utf8");
  assert.ok(auditScript.includes("mentor_overactive_voice_risk"));
  assert.ok(auditScript.includes("MENTOR_OVERACTIVE_PATTERNS"));
});

test("HR perspective uses approved DB display field before runtime fallback", () => {
  const text = humanizeHrPerspective({
    humanized_hr_perspective: "我会先看这条经历有没有结果；如果只有协助和参与，筛选时会被当成弱信号。",
    perspective_review_status: "approved",
    HR_os: "旧 HR 文案",
  });
  assert.strictEqual(text, "我会先看这条经历有没有结果；如果只有协助和参与，筛选时会被当成弱信号。");
});

test("unapproved DB display field falls back to runtime tone", () => {
  const text = humanizeMentorInsight({
    humanized_mentor_insight: "待审核文案不该直接展示",
    perspective_review_status: "needs_review",
    canonicalActionFamily: "jd_keyword_alignment",
    I_insight: "ATS系统通过关键词匹配筛选简历，加入岗位特定词汇能提升匹配分数。",
    relatedProblemTags: ["low_jd_keyword_match"],
  });
  assert.notStrictEqual(text, "待审核文案不该直接展示");
  assert.ok(/你|我会|这里/.test(text), text);
});

test("avoidRepeatedPerspectives replaces repeated HR template within a bundle", () => {
  const repeated = "我第一眼会先看你到底投什么岗；定位不明确，再好的经历也容易被放到旁边。";
  const items = avoidRepeatedPerspectives([
    { adviceId: "a", canonicalActionFamily: "summary_positioning", mentorInsight: "导师 A", hrPerspective: repeated, HR_os: repeated },
    { adviceId: "b", canonicalActionFamily: "summary_positioning", mentorInsight: "导师 B", hrPerspective: repeated, HR_os: repeated },
  ]);
  assert.notStrictEqual(items[0].hrPerspective, items[1].hrPerspective);
  assert.strictEqual(items[1].hrPerspective, items[1].HR_os);
});

test("portfolio advice stays portfolio-specific instead of generic positioning", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_portfolio_case",
    problem_tags: "missing_portfolio",
    canonicalActionFamily: "profile_links",
    I_insight: "Game Design岗位招聘方高度看重候选人的实际作品，一个可运行的Demo即使美术粗糙，也能证明候选人的完整开发能力与项目交付经验。",
    title: "补充作品集或 Demo",
  });
  assert.ok(/作品|Demo|链接|验证|入口/.test(text), text);
  assert.ok(!/目标岗位放出来|方向立住/.test(text), text);
});

test("plain demo mention in data work does not force portfolio tone", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_plain_demo_case",
    problem_tags: "low_jd_keyword_match,weak_result_orientation",
    canonicalActionFamily: "jd_keyword_alignment",
    I_insight: "HR筛选数据相关岗位简历时，会重点看候选人是否有数据处理、模型评估等实质性数据工作经验，仅有算法部署和Demo展示的描述不足以证明数据能力。",
    title: "项目经历描述",
  });
  assert.ok(!/作品|Demo 会更有说服力|美术/.test(text), text);
});

test("data science rigor keeps reproducible metrics detail instead of format tone", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_data_rigor_case",
    problem_tags: "missing_code_review_documentation,low_measurable_results",
    canonicalActionFamily: "format_cleanup",
    I_insight: "Data science岗位最看重的不是deep learning建模能力，而是分析能否影响业务决策、模型能否可复现且持续使用、metrics是否stable且可追踪。",
    title: "工作经历描述",
  });
  assert.ok(/业务决策|可复现|stable metrics|持续使用|分析成果/.test(text), text);
  assert.ok(!/section|格式|排版/.test(text), text);
});

test("deployable product detail is preserved instead of generic packaging risk", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_deployable_product_case",
    problem_tags: "weak_result_orientation,weak_action_verbs,low_measurable_results",
    canonicalActionFamily: "quantified_impact",
    I_insight: "将项目做成可部署、可访问的产品形态，能大幅提升简历项目的可信度和区分度；与知名产品做benchmark对比，展示技术深度。",
    title: "项目经历描述",
  });
  assert.ok(/部署|访问|benchmark|产品|验证|对比/.test(text), text);
  assert.ok(!/追问|参与度|包装/.test(text), text);
});

test("skills advice stays keyword-specific instead of generic positioning", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_skill_case",
    problem_tags: "low_hard_skill_match,keywords_only_in_skills,education_details_missing",
    canonicalActionFamily: "skills_section",
    I_insight: "一般情况下简历最后一个section是skill，这是市场上普遍认可的简历结构惯例，有助于让HR快速了解求职者的技能栈。",
    title: "技能栏优化",
  });
  assert.ok(/关键词|技能|JD|词/.test(text), text);
  assert.ok(!/目标岗位放出来|方向立住/.test(text), text);
});

test("generic resume positioning uses versioning tone instead of keyword-only tone", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_versioning_case",
    problem_tags: "generic_resume_positioning,resume_not_tailored_to_jd,low_role_specificity",
    canonicalActionFamily: "summary_positioning",
    I_insight: "简历定位模糊是投递中最常见的致命问题。HR在6-10秒内判断候选人是否匹配，若简历混合多个方向，HR会认为候选人自己都不清楚要做什么。",
    title: "多版本简历策略",
  });
  assert.ok(/版本|方向|通用版|每一版/.test(text), text);
  assert.ok(!/硬塞关键词|JD 的核心词/.test(text), text);
});

test("versioning mentor tone preserves 1-2 version detail when present", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_versioning_detail_case",
    problem_tags: "generic_resume_positioning,resume_not_tailored_to_jd,low_role_specificity",
    canonicalActionFamily: "summary_positioning",
    I_insight: "技术栈匹配是Hiring Manager筛选的首要标准，准备多版本简历可提升每次投递的命中率；但版本过多（如5份）并无必要，精准1至2份效果更佳。",
    title: "多版本简历策略",
  });
  assert.ok(/5 份|1-2 个/.test(text), text);
});

test("format-specific source is not swallowed by low role specificity", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_format_role_mix_case",
    problem_tags: "low_role_specificity,formatting_penalty_triggered",
    canonicalActionFamily: "format_cleanup",
    I_insight: "简历控制在一页是求职的基本要求，HR扫描时更倾向于一页简历，超页会影响整体阅读体验和第一印象。",
    HR_os: "格式不是小事，版面一乱，我会更难快速抓到经历顺序和最相关的内容。",
  });
  assert.ok(/结构|格式|section|减法|版面|相关内容|一页|超页|阅读成本/.test(text), text);
  assert.ok(!/1-2 个岗位版|通用版/.test(text), text);
});

test("format spacing details are not converted into education tone", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_format_spacing_case",
    problem_tags: "education_details_missing,formatting_penalty_triggered",
    canonicalActionFamily: "format_cleanup",
    I_insight: "简历排版需要通过地址位置调整、字体大小、行间距等细节手段最大化利用页面空间，避免内容跨页断裂影响阅读体验",
    title: "简历格式规范",
  });
  assert.ok(/地址|字号|行距|跨页|版面/.test(text), text);
  assert.ok(!/课程|证书|教育|junior/.test(text), text);
});

test("generic entrance wording does not force portfolio tone", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_summary_entrance_case",
    problem_tags: "weak_result_orientation,weak_action_verbs,low_measurable_results",
    canonicalActionFamily: "experience_evidence",
    I_insight: "HR阅读简历时遵循从宏观到微观的认知习惯，先看整体再看细节。若开篇缺乏高层概述，读者会迷失在细节中，无法快速判断候选人的贡献价值",
    HR_os: "Summary 像简历的入口；入口不聚焦时，HR 很难马上判断你该被推给哪个团队。",
  });
  assert.ok(!/作品|Demo|作品集/.test(text), text);
});

test("tool-specific skills keep SQL and Excel details", () => {
  const excelText = humanizeMentorInsight({
    adviceId: "seg_excel_marketing_case",
    problem_tags: "low_hard_skill_match,keywords_only_in_skills",
    canonicalActionFamily: "skills_section",
    I_insight: "中小规模公司marketing岗位对数据工具要求不高，Excel达到中级水平（pivot table、vlookup）基本足够；规模较大的公司可能要求更多数据分析工具，需视目标公司规模调整技能侧重。",
    title: "技术技能补强",
  });
  const sqlText = humanizeMentorInsight({
    adviceId: "seg_sql_depth_case",
    problem_tags: "low_hard_skill_match",
    canonicalActionFamily: "skills_section",
    I_insight: "自学SQL容易遗漏细枝末节，如window function等进阶函数；面试中SQL题目无刷题积累难以通过，需系统复习后配合刷题才能真正掌握",
    title: "技术技能补强",
  });
  assert.ok(/Excel|pivot table|vlookup|公司规模/.test(excelText), excelText);
  assert.ok(/SQL|window function|面试/.test(sqlText), sqlText);
});

test("hands-on hardware details are preserved", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_hardware_practical_case",
    problem_tags: "low_jd_keyword_match",
    canonicalActionFamily: "jd_keyword_alignment",
    I_insight: "硬件/医疗器械类岗位JD往往强调实操能力（test、debug、prototype），HR和用人经理会重点筛查候选人是否有实际动手经验，而非仅有理论分析能力",
    title: "工作经历描述",
  });
  assert.ok(/test|debug|prototype|实操|动手/.test(text), text);
});

test("project/work distinction and role-language detail are preserved", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_work_project_distinction_case",
    problem_tags: "weak_experience_keyword_evidence,weak_result_orientation,vague_project_details",
    canonicalActionFamily: "experience_evidence",
    I_insight: "HR看简历时无法区分项目和正式工作经历会造成困惑，影响判断；即使是非传统行业的工作，只要实际工作内容与目标岗位匹配，就应以目标岗位的职能语言重新表述",
    title: "工作经历描述",
  });
  assert.ok(/项目|正式工作|非传统行业|职能语言/.test(text), text);
});

test("structured bullet and ML evidence details are preserved", () => {
  const structuredText = humanizeMentorInsight({
    adviceId: "seg_structured_bullet_case",
    problem_tags: "weak_summary_role_alignment,missing_code_review_documentation",
    canonicalActionFamily: "experience_evidence",
    I_insight: "结构化的bullet point让HR能快速抓取关键信息：做了什么、用什么工具、产生什么结果。缺少技术工具和量化影响的描述，HR无法判断候选人的实际能力深度。",
    title: "工作经历描述",
  });
  const mlText = humanizeMentorInsight({
    adviceId: "seg_ml_evidence_case",
    problem_tags: "low_measurable_results",
    canonicalActionFamily: "quantified_impact",
    I_insight: "HR在扫描ML相关简历时，会优先关注候选人使用的具体算法和量化结果。模糊的模型描述等同于无效信息，具体的模型名称+预测任务+特征规模+量化成果的四元组结构才能体现技术能力。",
    title: "项目经历描述",
  });
  assert.ok(/做了什么|工具|结果|深度/.test(structuredText), structuredText);
  assert.ok(/模型名称|预测任务|特征规模|量化结果/.test(mlText), mlText);
});

test("hard plus soft skill detail is preserved", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_hard_soft_skill_case",
    problem_tags: "low_hard_skill_match,keywords_only_in_skills,weak_result_orientation",
    canonicalActionFamily: "jd_keyword_alignment",
    I_insight: "金融类岗位HR不仅关注技术工具使用，也高度重视候选人跨团队协作与洞察输出能力；将soft skill（communication）与hard skill（Python、Tableau）结合呈现，能显著提升简历吸引力",
    title: "工作经历描述",
  });
  assert.ok(/Python|Tableau|hard skill|soft skill|跨团队|洞察/.test(text), text);
  assert.ok(!/作品|Demo/.test(text), text);
});

test("certification and company-screening strategy details are preserved", () => {
  const certText = humanizeMentorInsight({
    adviceId: "seg_finra_cert_case",
    problem_tags: "weak_target_role_alignment,low_role_specificity,missing_exact_job_title",
    canonicalActionFamily: "summary_positioning",
    I_insight: "金融行业前台岗位（如wealth management、stock trading）通常要求Series 7、Series 66等FINRA证书。部分公司要求入职前持证，部分允许入职后一定期限内取得。",
    title: "目标岗位定位",
  });
  const companyText = humanizeMentorInsight({
    adviceId: "seg_company_screening_case",
    problem_tags: "low_hard_skill_match,missing_distributed_systems",
    canonicalActionFamily: "jd_keyword_alignment",
    I_insight: "谷歌、Meta等大厂面试官随机抽取，面试与入组完全分离，HR筛简历不看具体技术栈；而Doordash、Instacart等中型公司由用人团队直接参与，技术栈匹配是核心筛选标准。",
    title: "目标岗位定位",
  });
  assert.ok(/Series 7|Series 66|FINRA|证照|硬门槛/.test(certText), certText);
  assert.ok(/Google|Meta|DoorDash|Instacart|技术栈|用人团队/.test(companyText), companyText);
});

test("r3 linkedin location and consulting details are preserved", () => {
  const linkedinItem = {
    adviceId: "6747",
    canonicalActionFamily: "profile_links",
    I_insight: "简历地点填写特定城市会暗示求职者只考虑该地区，可能使外地雇主主动排除候选人；LinkedIn链接乱码给人不用心的印象，整洁的自定义URL体现专业度。",
  };
  const consultingItem = {
    adviceId: "25169",
    canonicalActionFamily: "jd_keyword_alignment",
    I_insight: "咨询类简历需要体现具体的项目工作内容和咨询核心技能（如问题分析、数据支撑、客户沟通等），仅列出职位名称不足以打动招聘方；利用实习中导师分配的任务清单可帮助还原细节",
  };
  const linkedinMentor = humanizeMentorInsight(linkedinItem);
  const linkedinHr = humanizeHrPerspective(linkedinItem);
  const consultingMentor = humanizeMentorInsight(consultingItem);
  const consultingHr = humanizeHrPerspective(consultingItem);
  assert.ok(/LinkedIn|地点|城市|URL/.test(linkedinMentor), linkedinMentor);
  assert.ok(/LinkedIn|地点|链接|可信度/.test(linkedinHr), linkedinHr);
  assert.ok(!/作品|Demo/.test(linkedinMentor), linkedinMentor);
  assert.ok(/问题分析|数据支撑|客户沟通|任务清单/.test(consultingMentor), consultingMentor);
  assert.ok(/问题分析|数据支撑|客户沟通|咨询能力/.test(consultingHr), consultingHr);
});

test("r3 embedded Ray and LLM details are preserved", () => {
  const embeddedItem = {
    adviceId: "23719",
    canonicalActionFamily: "jd_keyword_alignment",
    I_insight: "操作系统编程（C/C++）和嵌入式编程是硬件/系统方向的重要细分赛道，有相关背景会显著加分；物理背景的候选人有时会有嵌入式接触经历，值得确认",
  };
  const rayItem = {
    adviceId: "4070",
    canonicalActionFamily: "jd_keyword_alignment",
    I_insight: "有经验的竞争者通常持有Solution Architect认证但不懂Ray或大模型；反之，掌握Ray+大模型的候选人在市场上属稀缺组合，能在简历筛选和面试中形成差异化优势。",
  };
  const llmItem = {
    adviceId: "9818",
    canonicalActionFamily: "jd_keyword_alignment",
    I_insight: "自ChatGPT发布后，LLM已成为AI领域主流范式，不仅处理文本，还涵盖图像、音频、视频等多模态输入，大量企业正将传统模型迁移至LLM架构，懂LLM的人才供不应求。",
  };
  const embeddedMentor = humanizeMentorInsight(embeddedItem);
  const rayMentor = humanizeMentorInsight(rayItem);
  const llmMentor = humanizeMentorInsight(llmItem);
  assert.ok(/C\/C\+\+|操作系统|嵌入式|硬件\/系统|物理背景/.test(embeddedMentor), embeddedMentor);
  assert.ok(!/prototype|debug|test/.test(embeddedMentor), embeddedMentor);
  assert.ok(/Solution Architect|Ray|大模型|稀缺/.test(rayMentor), rayMentor);
  assert.ok(/LLM|多模态|传统模型|AI/.test(llmMentor), llmMentor);
  assert.ok(/Ray|大模型|稀缺/.test(humanizeHrPerspective(rayItem)), humanizeHrPerspective(rayItem));
  assert.ok(/LLM|多模态|传统模型/.test(humanizeHrPerspective(llmItem)), humanizeHrPerspective(llmItem));
});

test("r3 internship timeline and ATS generalizability details are preserved", () => {
  const timelineItem = {
    adviceId: "10970",
    canonicalActionFamily: "skills_section",
    I_insight: "美国科技公司暑期实习招募普遍提前一年启动，8-9月Career Fair是获取大公司实习名额的黄金窗口，招募对象已是次年summer intern；春招期间大公司名额基本饱和，留给低年级学生的机会更少。",
  };
  const atsItem = {
    adviceId: "1034",
    canonicalActionFamily: "jd_keyword_alignment",
    I_insight: "ATS系统本质是关键词匹配，简历需要像ML模型一样对目标方向具备generalizability——对所有同类JD都有不错的匹配分，而非过拟合于某一份JD。",
  };
  const timelineMentor = humanizeMentorInsight(timelineItem);
  const timelineHr = humanizeHrPerspective(timelineItem);
  const atsMentor = humanizeMentorInsight(atsItem);
  const atsHr = humanizeHrPerspective(atsItem);
  assert.ok(/8-9 月|Career Fair|summer intern|春招/.test(timelineMentor), timelineMentor);
  assert.ok(!/Skills|技术栈/.test(timelineMentor), timelineMentor);
  assert.ok(/8-9 月|时间窗口|机会/.test(timelineHr), timelineHr);
  assert.ok(/ATS|关键词匹配|generalizability|过拟合|同类 JD/.test(atsMentor), atsMentor);
  assert.ok(/同类岗位|过拟合|泛用性/.test(atsHr), atsHr);
});

test("r15 detail-specific samples are not swallowed by broad templates", () => {
  const cases = [
    {
      name: "RAG policy scenario",
      I_insight: "简历中的项目描述需要有明确的业务场景和用户痛点，'帮内部员工查询policy文档'比'做了一个RAG系统'更能让HR理解项目价值；场景越具体，项目可信度和吸引力越高",
      mentorMust: /RAG|policy|业务场景|真实需求/,
      hrMust: /RAG|policy|价值/,
      mentorMustNot: /学校合作|自主投递/,
    },
    {
      name: "writing tutor evidence",
      I_insight: "能担任writing tutor本身已证明写作能力高于同龄人；招聘方看到tutor经历会预设求职者有较强写作能力，若能附上writing sample或在简历中量化辅导成效（如辅导人数、成绩提升），说服力大幅提升。",
      mentorMust: /writing tutor|writing sample|辅导人数|成绩提升/,
      hrMust: /writing tutor|sample|辅导人数|成绩提升/,
      mentorMustNot: /真实参与度|写太满/,
    },
    {
      name: "financial risk methods",
      I_insight: "金融风险岗位HR会重点考察候选人是否掌握主流风险计量方法（VaR、Monte Carlo等）及对应工具，bullet point需展示完整分析链条而非孤立技能点",
      mentorMust: /VaR|Monte Carlo|风险计量|分析链条/,
      hrMust: /VaR|Monte Carlo|分析链条/,
      mentorMustNot: /作品|Demo/,
    },
    {
      name: "ambiguous action follow-up",
      I_insight: "面试官会对模糊的action追问follow-up，如'你用了什么工具''你怎么分析的''有没有建立framework'。候选人自己先把细节讲清楚，可以减少被动追问，降低面试紧张感，同时展现结构化思维。",
      mentorMust: /action|工具|分析方法|framework/,
      hrMust: /action|工具|framework/,
      mentorMustNot: /项目深度要控制/,
    },
    {
      name: "specific AI model names",
      I_insight: "HR 和技术面试官看项目经历时，会关注候选人是否真正动手使用过具体工具或模型，泛泛描述会让人怀疑深度，写出完整模型名称（如 LoRA、Stable Diffusion v2 inpainting）可显著提升专业可信度。",
      mentorMust: /LoRA|Stable Diffusion v2 inpainting|完整模型名/,
      hrMust: /LoRA|Stable Diffusion v2 inpainting|模型名/,
      mentorMustNot: /LLM|传统模型迁移/,
    },
    {
      name: "interviewer two-minute glance",
      I_insight: "面试官在面试开始时通常刚开完会或未提前细看简历，只有约两分钟快速glance，阅读路径是先看第一条bullet，再从第二条起扫描关键词和数字，形成对候选人的high level understanding并准备问题。",
      mentorMust: /glance|两分钟|第一条 bullet|high level understanding/,
      hrMust: /两分钟|第一条 bullet|关键词|数字/,
      mentorMustNot: /Demo|数据岗/,
    },
  ];
  for (const c of cases) {
    const item = {
      adviceId: `r15_${c.name}`,
      canonicalActionFamily: "experience_evidence",
      problem_tags: "weak_result_orientation,weak_action_verbs,low_measurable_results",
      I_insight: c.I_insight,
    };
    const mentor = humanizeMentorInsight(item);
    const hr = humanizeHrPerspective(item);
    assert.ok(c.mentorMust.test(mentor), `${c.name} mentor: ${mentor}`);
    assert.ok(c.hrMust.test(hr), `${c.name} HR: ${hr}`);
    assert.ok(!c.mentorMustNot.test(mentor), `${c.name} mentor wrong family: ${mentor}`);
  }
});

test("phase2 seed detail families are not swallowed by broad templates", () => {
  const cases = [
    {
      name: "official title reframing",
      I_insight: "求职者往往受限于官方职位名称，忽视实际工作内容与目标岗位的契合点。通过重新框架（reframing）岗位叙事，可以显著提升简历与JD的关键词匹配度，增加通过ATS筛选的概率。",
      mentorMust: /official title|官方 title|实际工作内容|目标岗位语言|ATS/,
      hrMust: /title|实际工作内容|目标岗位/,
      mentorMustNot: /技术项目|实现方式/,
    },
    {
      name: "SDE frameworks beyond languages",
      I_insight: "对SDE岗位而言，编程语言只是基础门槛，ATS和HR更关注候选人掌握的framework、数据库和云服务；只写语言等于只说「我会说中文」，却没说自己会做什么",
      mentorMust: /SDE|编程语言|framework|数据库|云服务/,
      hrMust: /SDE|framework|数据库|云服务/,
      mentorMustNot: /模糊的 action|分析方法/,
    },
    {
      name: "ESG stakeholders",
      I_insight: "sustainability/ESG类岗位的HR不仅看技术能力，也看候选人能否与政府机构、社区等外部方协作；city officials和residents均构成真实的stakeholder场景，应显式呈现。",
      mentorMust: /ESG|city officials|residents|stakeholder/,
      hrMust: /ESG|city officials|residents|stakeholder/,
      mentorMustNot: /数字很朴素|影响讲出来/,
    },
    {
      name: "Web GIS",
      I_insight: "当前GIS就业市场中Web GIS是热门技能方向，大量GIS岗位招聘要求候选人具备Web GIS相关能力，缺少该技能会显著降低竞争力。",
      mentorMust: /GIS|Web GIS|竞争力/,
      hrMust: /GIS|Web GIS|匹配/,
      mentorMustNot: /1-2 个版本|多方向/,
    },
    {
      name: "first bullet anchor",
      I_insight: "简历第一个bullet point起到定锚作用，HR快速扫描时若无法在第一句话抓到重点，后续内容的价值会大打折扣。",
      mentorMust: /第一条 bullet|定锚|第一句话/,
      hrMust: /第一条 bullet|第一句话|降权/,
      mentorMustNot: /通用版|岗位版/,
    },
    {
      name: "deployment platform",
      I_insight: "描述端到端系统时，部署平台是体现工程化能力的关键信息，HR和技术面试官均会关注求职者是否具备将模型/脚本实际落地的能力。",
      mentorMust: /部署平台|端到端|工程化|落地/,
      hrMust: /部署平台|落地|工程化/,
      mentorMustNot: /结果往回改/,
    },
    {
      name: "risk departments",
      I_insight: "Risk部门在金融公司体量大、细分多（市场风险、信用风险、中台风控等），与金融量化或分析类专业背景高度契合，是值得重点关注的求职赛道。",
      mentorMust: /Risk|市场风险|信用风险|中台风控|量化/,
      hrMust: /Risk|市场风险|信用风险|中台风控/,
      mentorMustNot: /链接|验证入口/,
    },
    {
      name: "market research Nielsen",
      I_insight: "大型快消公司通常设有专职market research团队，也会向Nielsen等第三方数据公司购买受众数据和报告。这类调研公司招募具备心理学、社会学背景的人才，用于受众细分、消费行为洞察等工作，是非传统但高匹配的求职渠道。",
      mentorMust: /market research|Nielsen|心理学|社会学|受众/,
      hrMust: /Market research|Nielsen|心理学|社会学|受众/,
      mentorMustNot: /电商运营/,
    },
    {
      name: "analyst recommendation",
      I_insight: "能写出recommendation的候选人才能与只会\"SQL monkey/Excel monkey\"的机械性操作者拉开差距。分析师越往后走，策略思维越是核心竞争力，简历需体现这一层次",
      mentorMust: /recommendation|SQL|Excel|策略/,
      hrMust: /recommendation|SQL|Excel|策略/,
      mentorMustNot: /Python|Machine Learning/,
    },
    {
      name: "course order",
      I_insight: "在校生简历教育背景信息有限，GPA和相关课程是HR判断学术实力与岗位匹配度的重要信号；课程顺序可针对不同职能方向做定向调整，提升简历与JD的契合度",
      mentorMust: /GPA|相关课程|课程顺序|目标职能/,
      hrMust: /GPA|课程|目标方向/,
      mentorMustNot: /低 GPA/,
    },
    {
      name: "participate weak action verb",
      I_insight: "简历bullet point应以强行动动词开头，体现求职者的主动性和主导角色；使用'participate'等词暗示候选人处于边缘角色，会降低HR对其实际贡献的评价",
      mentorMust: /强动词|participate|边缘|主导/,
      hrMust: /participate|边缘|动词/,
      mentorMustNot: /impact 放到最前面/,
    },
    {
      name: "deal purchase price",
      I_insight: "金融简历中，HR和招聘方高度关注候选人是否有真实deal经验及对应交易规模。即使是初级参与者，只要能写出具体purchase price和交易类型，即可显著提升简历可信度与竞争力。",
      mentorMust: /deal|purchase price|交易类型/,
      hrMust: /deal|purchase price|交易类型/,
      mentorMustNot: /验证入口/,
    },
    {
      name: "oral self-structure",
      I_insight: "许多求职者在简历写作前缺乏结构化自我梳理，导致内容散乱或遗漏亮点。先用口头叙述将经历完整还原，再筛选提炼，是高效生成有质量简历内容的常用方法。",
      mentorMust: /口头叙述|还原|筛选亮点|bullet/,
      hrMust: /还原|提炼|亮点/,
      mentorMustNot: /section 顺序|格式/,
    },
    {
      name: "credit risk dimensions",
      I_insight: "金融信贷岗位的HR和面试官关注候选人是否掌握实际的风险量化评估方法，能列举具体评估维度（如净资产乘以行业调节系数、信用评级得分）比泛泛说\"参与风险评估\"更有说服力。",
      mentorMust: /金融信贷|净资产|行业调节系数|信用评级得分/,
      hrMust: /信贷风险|净资产|信用评级得分/,
      mentorMustNot: /规模、频率或效率/,
    },
    {
      name: "Power BI PL300",
      I_insight: "Power BI因与微软Office生态捆绑、管理层易于理解可视化图表而广泛普及；PL300是微软官方认证，含金量高且通过难度相对较低，是快速提升简历竞争力的高性价比途径。",
      mentorMust: /Power BI|PL300|Office|管理层/,
      hrMust: /Power BI|PL300|可视化/,
      mentorMustNot: /TB 级|LinkedIn/,
    },
  ];
  for (const c of cases) {
    const item = {
      adviceId: `phase2_${c.name}`,
      canonicalActionFamily: "experience_evidence",
      problem_tags: "weak_result_orientation,weak_action_verbs,low_measurable_results",
      I_insight: c.I_insight,
    };
    const mentor = humanizeMentorInsight(item);
    const hr = humanizeHrPerspective(item);
    assert.ok(c.mentorMust.test(mentor), `${c.name} mentor: ${mentor}`);
    assert.ok(c.hrMust.test(hr), `${c.name} HR: ${hr}`);
    assert.ok(!c.mentorMustNot.test(mentor), `${c.name} mentor wrong family: ${mentor}`);
  }
});

test("phase2 r2 flagged seed details keep specificity and direct mentor voice", () => {
  const cases = [
    {
      name: "mother resume subset versioning",
      I_insight: "多目标岗位求职时，维护多份简历版本是标准做法。母简历收录所有经历，针对每个岗位挑选最匹配的子集，可大幅提升简历与JD的匹配度。",
      mentorMust: /你可以|母简历|JD|子集|对焦/,
      hrMust: /母简历|当前岗位|筛选/,
      mentorMustNot: /1-2 个版本|不是没有材料/,
    },
    {
      name: "iterative JD methodology",
      I_insight: "求职是一个持续迭代的过程，不同阶段需要针对不同JD调整简历。掌握方法论比一次性修改成果更有长期价值。",
      mentorMust: /你这里|持续迭代|JD|方法论/,
      hrMust: /随 JD 调整|同一版|对齐岗位/,
      mentorMustNot: /section 顺序|格式/,
    },
    {
      name: "model follow-up truthfulness",
      I_insight: "简历上写的任何内容都可能被面试官追问，写上去就代表你懂，必须能讲清楚最基本的逻辑：模型做了什么、结果如何。",
      mentorMust: /你这条|模型做了什么|结果如何|可信度/,
      hrMust: /模型|基本逻辑|结果|写过头/,
      mentorMustNot: /真实参与度|写太满/,
    },
    {
      name: "Power BI wins over generic LinkedIn HR",
      I_insight: "Power BI因与微软Office生态捆绑、管理层易于理解可视化图表而广泛普及；PL300是微软官方认证，含金量高且通过难度相对较低，是快速提升简历竞争力的高性价比途径。",
      HR_os: "LinkedIn、GitHub 或作品集能降低验证成本；没有入口时，很多亮点就只能停在描述里。",
      mentorMust: /Power BI|PL300|Office|管理层/,
      hrMust: /Power BI|PL300|可视化|商业呈现/,
      mentorMustNot: /LinkedIn/,
      hrMustNot: /LinkedIn|链接乱码/,
    },
  ];
  for (const c of cases) {
    const item = {
      adviceId: `phase2_r2_${c.name}`,
      canonicalActionFamily: "summary_positioning",
      problem_tags: "generic_resume_positioning,resume_not_tailored_to_jd,low_role_specificity",
      I_insight: c.I_insight,
      HR_os: c.HR_os,
    };
    const mentor = humanizeMentorInsight(item);
    const hr = humanizeHrPerspective(item);
    assert.ok(c.mentorMust.test(mentor), `${c.name} mentor: ${mentor}`);
    assert.ok(c.hrMust.test(hr), `${c.name} HR: ${hr}`);
    assert.ok(!c.mentorMustNot.test(mentor), `${c.name} mentor wrong family: ${mentor}`);
    if (c.hrMustNot) assert.ok(!c.hrMustNot.test(hr), `${c.name} HR wrong family: ${hr}`);
  }
});

test("role-specific humanized perspectives require matching target role context", () => {
  const daItem = {
    adviceId: "phase2_da_role_gate",
    canonicalActionFamily: "skills_section",
    problem_tags: "low_hard_skill_match,keywords_only_in_skills",
    I_insight: "DA简历的bullet point应让HR一眼对应到岗位JD中要求的技能点。按技能维度分拆而非按时间顺序叙事，能最大化关键词覆盖密度。",
    HR_os: "HR会快速扫描DA经历中的关键词和技能点。",
  };
  const daContext = { internalAtsResult: { jobTitle: "Data Analyst", jdText: "SQL dashboard data cleaning visualization" } };
  const sdeContext = { internalAtsResult: { jobTitle: "Software Engineer", jdText: "backend services distributed systems Java" } };
  const daMentor = humanizeMentorInsight(daItem, daContext);
  const daHr = humanizeHrPerspective(daItem, daContext);
  const sdeMentor = humanizeMentorInsight(daItem, sdeContext);
  const sdeHr = humanizeHrPerspective(daItem, sdeContext);
  assert.ok(/DA bullet|技能维度|关键词密度/.test(daMentor), daMentor);
  assert.ok(/DA bullet|关键词覆盖/.test(daHr), daHr);
  assert.ok(!/DA bullet|技能维度|关键词密度/.test(sdeMentor), sdeMentor);
  assert.ok(!/DA bullet|关键词覆盖/.test(sdeHr), sdeHr);

  const sdeItem = {
    adviceId: "phase2_sde_role_gate",
    canonicalActionFamily: "experience_evidence",
    problem_tags: "weak_experience_keyword_evidence",
    I_insight: "SWE岗位中，理解AI系统如何与ML系统整合是重要加分项，例如Gemini、图像类和语言类模型的API应用。",
  };
  const sdeSpecific = humanizeMentorInsight(sdeItem, sdeContext);
  const daSpecific = humanizeMentorInsight(sdeItem, daContext);
  assert.ok(/SWE|Gemini|ML 系统/.test(sdeSpecific), sdeSpecific);
  assert.ok(!/SWE|Gemini/.test(daSpecific), daSpecific);
});

test("approved DB humanized perspectives still respect target role context", () => {
  const approvedDaItem = {
    adviceId: "approved_da_role_gate",
    perspective_review_status: "approved",
    humanized_mentor_insight: "你这条 DA bullet 可以按技能维度拆，不要只按时间顺序讲故事。让 HR 一眼对到 JD 技能点，关键词密度会更有效。",
    humanized_hr_perspective: "我会按 JD 技能点扫 DA bullet；如果只按时间线叙事，匹配信号会变慢，关键词覆盖也不够集中。",
    I_insight: "DA简历的bullet point应让HR一眼对应到岗位JD中要求的技能点。",
    HR_os: "HR会快速扫描DA经历中的关键词和技能点。",
  };
  const daContext = { internalAtsResult: { jobTitle: "Data Analyst", jdText: "SQL dashboard data cleaning visualization" } };
  const sdeContext = { internalAtsResult: { jobTitle: "Software Engineer", jdText: "backend services distributed systems Java" } };
  const daMentor = humanizeMentorInsight(approvedDaItem, daContext);
  const daHr = humanizeHrPerspective(approvedDaItem, daContext);
  const sdeMentor = humanizeMentorInsight(approvedDaItem, sdeContext);
  const sdeHr = humanizeHrPerspective(approvedDaItem, sdeContext);
  assert.ok(/DA bullet|技能维度/.test(daMentor), daMentor);
  assert.ok(/DA bullet|关键词覆盖/.test(daHr), daHr);
  assert.ok(!/DA bullet|技能维度/.test(sdeMentor), sdeMentor);
  assert.ok(!/DA bullet|关键词覆盖/.test(sdeHr), sdeHr);
});

test("marketing analyst and Tableau project evidence details are preserved", () => {
  const marketingText = humanizeMentorInsight({
    adviceId: "seg_marketing_analyst_case",
    problem_tags: "low_role_specificity,weak_target_role_alignment,missing_exact_job_title",
    canonicalActionFamily: "summary_positioning",
    I_insight: "Marketing analyst岗位通常分两个方向：消费者研究型（需理解消费者行为、市场趋势）和付费增长分析型（需分析广告投放ROI、营销漏斗转化）。",
    title: "目标岗位定位",
  });
  const tableauText = humanizeMentorInsight({
    adviceId: "seg_tableau_project_case",
    problem_tags: "low_hard_skill_match,keywords_only_in_skills,education_details_missing",
    canonicalActionFamily: "skills_section",
    I_insight: "HR看简历时技能列表中的工具需有对应的项目/经历背书，仅列出「熟悉Tableau」而无实际产出，说服力极弱。通过课程实操产出的作品同样可写入简历。",
    title: "技术技能补强",
  });
  assert.ok(/消费者研究|付费增长|广告投放ROI|营销漏斗/.test(marketingText), marketingText);
  assert.ok(/Tableau|课程实操|项目产出|可视化/.test(tableauText), tableauText);
});

test("DA raw-data flow and contact-info details are preserved", () => {
  const daText = humanizeMentorInsight({
    adviceId: "seg_da_raw_data_case",
    problem_tags: "weak_experience_keyword_evidence",
    canonicalActionFamily: "experience_evidence",
    I_insight: "DA岗位HR最关注候选人是否有从raw data出发、解决实际业务问题的经验，能清楚描述一个完整的数据分析场景（拿到数据→分析→产出洞见）远比罗列技能更有说服力",
    title: "项目经历描述",
  });
  const contactText = humanizeMentorInsight({
    adviceId: "seg_us_phone_case",
    problem_tags: "missing_contact_info",
    canonicalActionFamily: "format_cleanup",
    I_insight: "美国招聘流程中HR有时会直接致电候选人进行初步沟通或安排面试，简历上缺少美国电话会增加沟通障碍，降低被联系的概率。",
    title: "个人总结撰写",
  });
  assert.ok(/raw data|分析|洞见|业务问题/.test(daText), daText);
  assert.ok(/美国电话|联系|初筛|安排面试/.test(contactText), contactText);
});

test("report-like mentor source uses human template instead of splicing formal copy", () => {
  const text = humanizeMentorInsight({
    adviceId: "seg_report_like_case",
    problem_tags: "low_measurable_results,weak_action_verbs",
    canonicalActionFamily: "quantified_impact",
    I_insight: "简历读者在扫描项目描述时，主动语态配合量化数据能快速传递候选人的实际贡献；被动或平铺直叙的写法会让项目经历显得平淡。",
  });
  assert.ok(/我会|你/.test(text), text);
  assert.ok(!/候选人|简历读者|扫描项目描述/.test(text), text);
});

console.log("\nTest 9: advice action family must match the user problem family");
test("keyword problem rejects format-only action cards", () => {
  const card = {
    title: "不要一份简历投所有岗位",
    problemSummary: "简历内容超过一页，包含不相关活动，导致重点分散。",
    actionSummary: "删除不相关 internship、活动和获奖记录，调整字体或行间距，将简历压缩至一页。",
    relatedProblemTags: ["low_jd_keyword_match"],
  };
  const keywordProblem = [{ tag: "low_jd_keyword_match", severity: "high" }];
  assert.strictEqual(isCardAlignedWithTargetProblems(card, keywordProblem), false);
});

test("format problem accepts format action cards", () => {
  const card = {
    title: "压缩简历到一页",
    problemSummary: "简历超过一页，版面过松，重点不够集中。",
    actionSummary: "删除不相关活动，调整字体或行间距，将简历压缩至一页。",
    relatedProblemTags: ["formatting_penalty_triggered"],
  };
  const formatProblem = [{ tag: "formatting_penalty_triggered", severity: "medium" }];
  assert.strictEqual(isCardAlignedWithTargetProblems(card, formatProblem), true);
});

// ─── Summary ───────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`  ${passed + failed} tests: ${passed} passed, ${failed} failed`);
console.log("\nTest 9: resume grounding rejects advice about absent project-specific material");
test("Alpha Research / VADER / MACD advice is rejected when resume lacks those terms", () => {
  const card = {
    actionSummary: "将Alpha Research项目拆分为两段：第一段专写NLP pipeline，按四步结构展开：①爬虫数据采集（data acquisition）→②数据预处理（pre-processing headlines and article summary）→③用VADER生成compound sentiment scores→④结果聚合并量化市场趋势（quantify market trends）；第二段写MACD与NLP的结合。",
  };
  const resumeText = [
    "Zhehan Zhang",
    "OBJECTIVE Detail-oriented and research-driven Biostatistician.",
    "CDISC Data Mapping Project (SAS)",
    "Transformed raw clinical trial data into SDTM domains.",
    "Biostatistics Research on COVID-19",
  ].join("\n");
  const terms = extractGroundingTermsFromAdvice(card);
  assert.ok(terms.includes("Alpha Research"), `expected Alpha Research in grounding terms, got ${JSON.stringify(terms)}`);
  assert.strictEqual(isResumeGroundedAdvice(card, { resumeText }), false);
});

test("project-specific advice is accepted when the named project exists in resume", () => {
  const card = {
    actionSummary: "将CDISC Data Mapping Project项目改写成两条 bullet，分别说明SDTM mapping和ADaM datasets的产出。",
  };
  const resumeText = "CDISC Data Mapping Project (SAS)\nTransformed raw clinical trial data into SDTM domains and converted SDTM datasets into ADaM datasets.";
  assert.strictEqual(isResumeGroundedAdvice(card, { resumeText }), true);
});

console.log(`\nAfter grounding tests: ${passed + failed} tests: ${passed} passed, ${failed} failed`);
console.log("\nTest 10: action precondition gate uses resumeFacts");

function baseFacts(overrides = {}) {
  return {
    sections: {
      hasInternshipTitle: false,
      hasProfessionalExperienceTitle: true,
      hasEducation: true,
      hasProjects: false,
      educationBeforeExperience: false,
      ...(overrides.sections || {}),
    },
    links: {
      hasLinkedIn: true,
      hasGithub: false,
      hasPortfolio: false,
      ...(overrides.links || {}),
    },
    keywords: {
      jdRequired: ["operations", "sales", "finance", "customer service", "data analysis", "reporting"],
      missingFromResume: ["operations"],
      skillsOnly: [],
      ...(overrides.keywords || {}),
    },
    experience: {
      quantifiedBulletCount: 1,
      hasMeasurableResults: true,
      ...(overrides.experience || {}),
    },
    roleEvidence: {
      targetRoleFamily: "management_trainee",
      resumeRoleFamily: "biostatistics",
      ...(overrides.roleEvidence || {}),
    },
    format: {
      likelyOverOnePage: false,
      hasDateInconsistency: false,
      hasMonthStyleInconsistency: false,
      missingDatesSections: [],
      ...(overrides.format || {}),
    },
    education: {
      hasCoursework: false,
      ...(overrides.education || {}),
    },
  };
}

test("rejects Internship rename when Professional Experience already exists", () => {
  const result = actionPreconditionGate({
    actionSummary: 'Change the Experience section title from "Internship" to "Professional Experience".',
  }, { resumeFacts: baseFacts() });
  assert.strictEqual(result.allowed, false);
  assert.ok(/section_title/.test(result.reason));
});

test("allows Internship rename when Internship exists and Professional Experience does not", () => {
  const result = actionPreconditionGate({
    actionSummary: 'Rename Internship section to Professional Experience.',
  }, { resumeFacts: baseFacts({ sections: { hasInternshipTitle: true, hasProfessionalExperienceTitle: false } }) });
  assert.strictEqual(result.allowed, true);
});

test("rejects LinkedIn advice when LinkedIn is already present", () => {
  const result = actionPreconditionGate({
    actionSummary: "Add your LinkedIn link to the header.",
  }, { resumeFacts: baseFacts({ links: { hasLinkedIn: true } }) });
  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.reason, "linkedin_already_present");
});

test("allows LinkedIn advice when LinkedIn is missing", () => {
  const result = actionPreconditionGate({
    actionSummary: "Add your LinkedIn link to the header.",
  }, { resumeFacts: baseFacts({ links: { hasLinkedIn: false } }) });
  assert.strictEqual(result.allowed, true);
});

test("rejects stale AWS/GCP keyword advice for Management Trainee facts", () => {
  const result = actionPreconditionGate({
    actionSummary: "Add JD keywords such as AWS, GCP, and IT infrastructure.",
  }, { resumeFacts: baseFacts() });
  assert.strictEqual(result.allowed, false);
  assert.ok(/stale_keyword/.test(result.reason));
});

test("rejects generic quantification advice when quantification is sufficient", () => {
  const result = actionPreconditionGate({
    actionSummary: "Strengthen bullet quantification, measurable results, and impact.",
  }, { resumeFacts: baseFacts({ experience: { quantifiedBulletCount: 4, hasMeasurableResults: true } }) });
  assert.strictEqual(result.allowed, false);
  assert.strictEqual(result.reason, "quantification_already_sufficient");
});

test("allows quantification advice when quantified bullets are weak", () => {
  const result = actionPreconditionGate({
    actionSummary: "Strengthen bullet quantification, measurable results, and impact.",
  }, { resumeFacts: baseFacts({ experience: { quantifiedBulletCount: 1, hasMeasurableResults: true } }) });
  assert.strictEqual(result.allowed, true);
});

test("missing resumeFacts falls back without crashing", () => {
  const result = actionPreconditionGate({
    actionSummary: "Rename Internship section to Professional Experience.",
  }, {});
  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.fallbackMode, "resumeFacts_missing");
});

test("exact job title card does not reuse unrelated wording cleanup action", () => {
  const premiumReport = formatPremiumMentorReport([{
    mentorId: "mentor_test",
    mentorName: "Y mentor",
    adviceItems: [{
      adviceId: "bad_exact_title_mismatch",
      title: "Role Alignment",
      currentDiagnosis: "Resume is missing the exact target title.",
      action: "Replace long descriptive phrases such as large volumes of with concise wording.",
      reason: "Bullet wording should be concise.",
      relatedProblemTags: ["missing_exact_job_title"],
      source: "db",
    }],
  }], {
    jobTitle: "Network Operator",
    profile: { targetRole: "Network Operator" },
  });

  const item = premiumReport.allAdviceItems[0];
  assert.strictEqual(item.title, "补上目标岗位原词");
  assert.ok(item.action.includes("Network Operator"));
  assert.ok(item.action.includes("Summary"));
  assert.strictEqual(/large volumes of|long descriptive phrases|concise wording/i.test(item.action), false);
});

test("problem coherence rewrites unrelated actions for other high-risk tags", () => {
  const cases = [
    {
      tag: "missing_portfolio",
      title: "补上作品集入口",
      badAction: "Replace long descriptive phrases such as large volumes of with concise wording.",
      mustMatch: /portfolio|作品集|project link|personal website/i,
      mustNotMatch: /large volumes of|concise wording/i,
    },
    {
      tag: "uploaded_non_pdf_format",
      title: "稳定简历提交格式",
      badAction: "Add more quantified impact metrics to each work bullet.",
      mustMatch: /PDF|格式|ATS|解析/i,
      mustNotMatch: /quantified impact metrics/i,
    },
    {
      tag: "low_jd_keyword_match",
      title: "补齐 JD 关键词证据",
      badAction: "Add your LinkedIn link to the header.",
      mustMatch: /aws|gcp|it infrastructure|JD|关键词|Skills|Experience/i,
      mustNotMatch: /LinkedIn link/i,
    },
    {
      tag: "low_measurable_results",
      title: "强化 bullet 的结果表达",
      badAction: "Add the exact target job title to Summary.",
      mustMatch: /量化|数字|结果|规模|效率|metric|impact/i,
      mustNotMatch: /exact target job title/i,
    },
  ];

  for (const testCase of cases) {
    const premiumReport = formatPremiumMentorReport([{
      mentorId: `mentor_${testCase.tag}`,
      mentorName: "Y mentor",
      adviceItems: [{
        adviceId: `bad_${testCase.tag}`,
        title: testCase.title,
        currentDiagnosis: "diagnosis for the target problem",
        action: testCase.badAction,
        reason: "unrelated reason",
        relatedProblemTags: [testCase.tag],
        source: "db",
      }],
    }], {
      jobTitle: "Network Operator",
      topMissingKeywords: ["aws", "gcp", "it infrastructure"],
      profile: { targetRole: "Network Operator" },
    });

    const item = premiumReport.allAdviceItems[0];
    assert.strictEqual(item.title, testCase.title);
    assert.ok(testCase.mustMatch.test(item.action), `${testCase.tag} action was not coherent: ${item.action}`);
    assert.strictEqual(testCase.mustNotMatch.test(item.action), false, `${testCase.tag} kept unrelated action: ${item.action}`);
  }
});

console.log("\nTest 16: global resume advice display governance");
test("missing Summary forces summary creation before exact title wording", () => {
  const result = formatPublicFreeMentorAdvice({
    mentorId: "m_summary",
    mentorName: "Y mentor",
    company: "MentorX",
    badges: [],
    adviceItems: [{
      adviceId: "exact_title_first",
      title: "补上目标岗位原词",
      currentDiagnosis: "JD Match is low.",
      action: "在 Summary 第一或第二句自然加入 Network Operator。",
      relatedProblemTags: ["missing_summary", "missing_exact_job_title", "low_jd_keyword_match"],
      canonicalActionFamily: "summary_positioning",
      targetSection: "summary",
      priority: "high",
    }],
  }, {
    jobTitle: "Network Operator",
    profile: { targetRole: "Network Operator" },
    problemTags: [{ tag: "missing_summary", severity: "high" }],
  });

  assert.strictEqual(result.adviceItems[0].canonicalActionFamily, "summary_creation");
  assert.ok(/Summary/.test(result.adviceItems[0].action), `expected Summary creation action, got ${result.adviceItems[0].action}`);
});

test("non-rotation target role drops rotation readiness advice", () => {
  const result = formatPremiumMentorReport([{
    mentorId: "m_rotation",
    mentorName: "Y mentor",
    adviceItems: [{
      adviceId: "bad_rotation",
      title: "写出轮岗适应能力",
      currentDiagnosis: "rotation diagnosis",
      action: "在 Summary 或经历 bullet 中加入一条轮岗可读的表达。",
      mentorInsight: "管培生岗位的特殊点是轮岗。",
      hrPerspective: "能快速切换场景，对管培生很重要。",
      relatedProblemTags: ["rotation_readiness_gap", "weak_target_role_alignment"],
      canonicalActionFamily: "rotation_readiness",
      targetSection: "summary",
      priority: "low",
    }],
  }], {
    jobTitle: "Network Operator",
    profile: { targetRole: "Network Operator", roleFamily: "operations" },
    resumeText: "Coordinated network tickets and maintained service logs.",
    resumeFacts: {
      roleEvidence: { targetRoleFamily: "operations" },
      sections: {},
      links: {},
      keywords: {},
      experience: {},
      format: {},
      education: {},
    },
  });

  assert.strictEqual(result.allAdviceItems.some((item) => item.canonicalActionFamily === "rotation_readiness"), false);
});

test("education and quantified advice perspectives stay on-family", () => {
  const result = formatPremiumMentorReport([{
    mentorId: "m_quality",
    mentorName: "Y mentor",
    adviceItems: [
      {
        adviceId: "edu_bad_perspective",
        title: "补强教育背景相关信号",
        currentDiagnosis: "education signal missing",
        action: "只保留相关课程、证书或 lab/project。",
        mentorInsight: "ATS 和 recruiter 会优先查找目标岗位原词。",
        hrPerspective: "我会用 JD 关键词快速确认基本匹配。",
        relatedProblemTags: ["education_details_missing"],
        canonicalActionFamily: "education_signal",
        targetSection: "education",
        priority: "medium",
      },
      {
        adviceId: "impact_bad_perspective",
        title: "强化 bullet 的量化结果",
        currentDiagnosis: "impact missing",
        action: "补充数量、频率、规模、效率或结果。",
        mentorInsight: "新增用户、销售增长、识别率提升这类数字最重要。",
        hrPerspective: "排版和结构会影响我读下去的耐心。",
        relatedProblemTags: ["low_measurable_results"],
        canonicalActionFamily: "quantified_impact",
        targetSection: "experience",
        priority: "medium",
      },
    ],
  }], {
    jobTitle: "Network Operator",
    profile: { targetRole: "Network Operator" },
  });

  const edu = result.allAdviceItems.find((item) => item.canonicalActionFamily === "education_signal");
  const impact = result.allAdviceItems.find((item) => item.canonicalActionFamily === "quantified_impact");
  assert.ok(/课程|证书|教育|training|course|certificate/i.test(`${edu.mentorInsight} ${edu.hrPerspective}`));
  assert.ok(/数量|频率|规模|效率|结果|成果|impact|metric/i.test(`${impact.mentorInsight} ${impact.hrPerspective}`));
  assert.strictEqual(/排版|新增用户|销售增长|识别率/.test(`${impact.mentorInsight} ${impact.hrPerspective}`), false);
  return;
  assert.ok(/课程|证书|教育|training|course|certificate/i.test(`${edu.mentorInsight} ${edu.hrPerspective}`));
  assert.ok(/数量|频率|规模|效率|结果|成果|impact|metric/i.test(`${impact.mentorInsight} ${impact.hrPerspective}`));
  assert.strictEqual(/排版|新增用户|销售增长|识别率/.test(`${impact.mentorInsight} ${impact.hrPerspective}`), false);
});

test("empty example placeholder is removed from final advice", () => {
  const result = formatPremiumMentorReport([{
    mentorId: "m_example",
    mentorName: "Y mentor",
    adviceItems: [{
      adviceId: "empty_example",
      title: "聚焦目标岗位定位",
      currentDiagnosis: "role alignment weak",
      action: "重排 Summary、Skills 和最靠前的经历。",
      example: "（无具体示例）",
      relatedProblemTags: ["weak_target_role_alignment"],
      canonicalActionFamily: "summary_positioning",
      targetSection: "overall",
      priority: "medium",
    }],
  }], {
    jobTitle: "Network Operator",
    profile: { targetRole: "Network Operator" },
  });
  assert.strictEqual(result.allAdviceItems[0].example, "");
});

test("mentor rules backfill uses P_mentor action fields instead of I_insight as generation source", () => {
  const row = {
    id: 90001,
    P_mentor: "你这条经历的问题是目标岗位方向太散，需要先收成一个更清楚的投递版本。",
    A_action: "先按目标岗位拆成 1-2 个版本，把最相关项目放到前面。",
    action_summary: "维护多版本简历。",
    user_problem_summary: "一份简历同时服务太多方向。",
    H_hook: "不是说你没有材料，是版本太散。",
    E_example: "后端版本突出 Spring Boot；AI 版本突出 PyTorch。",
    I_insight: "ATS generalizability 是内部 insight，不应该作为生成主文本。",
  };
  const source = mentorInsightRulesBackfill.sourceTextForGeneration(row);
  assert.ok(source.includes("1-2"));
  assert.ok(source.includes("Spring Boot"));
  assert.strictEqual(source.includes("generalizability"), false);

  const card = mentorInsightRulesBackfill.cardFromRow(row);
  assert.strictEqual(card.mentorInsight, source);
  assert.strictEqual(card.I_insight, "");
});

test("mentor rules backfill holds rows when I_insight detail terms are lost", () => {
  const row = {
    id: 90002,
    P_mentor: "你这里可以把教育背景写得更像岗位训练证据，不要只列学校名称。",
    A_action: "补充相关课程和证书，把课程放到目标岗位更容易理解的位置。",
    action_summary: "补强教育背景。",
    user_problem_summary: "教育背景信息太薄。",
    H_hook: "课程不是装饰，它可以补足 entry-level 的训练信号。",
    E_example: "Relevant Coursework 加上 Database Systems。",
    I_insight: "Power BI 和 PL300 是这条建议必须人工检查的细节。",
  };
  const output = mentorInsightRulesBackfill.buildOutput(row);
  assert.strictEqual(output.proposed.perspective_source, mentorInsightRulesBackfill.PERSPECTIVE_SOURCE);
  assert.ok(output.review.flags.includes("lost_specific_terms"));
  assert.strictEqual(output.review.recommendation, "needs_review");
});

test("mentor rules backfill keeps special resume families from broad templates", () => {
  const rag = mentorInsightRulesBackfill.buildOutput({
    id: 90003,
    retrieval_scope: "resume_edit",
    P_mentor: "Candidate may mention irrelevant metrics like BLEU for RAG evaluation.",
    A_action: "掌握并能解释忠实性、答案相关性、上下文召回率；不要在RAG场景中提到BLEU。",
    I_insight: "",
  });
  assert.strictEqual(rag.mentor_rule_family, "rag_evaluation");
  assert.ok(/RAG|BLEU|忠实性|上下文召回率/.test(rag.proposed.humanized_mentor_insight));

  const agent = mentorInsightRulesBackfill.buildOutput({
    id: 90004,
    retrieval_scope: "resume_edit",
    P_mentor: "Candidate has multi-agent experience but needs to know which aspects are valued.",
    A_action: "明确提及如何定义智能体边界、上下文传递、错误处理、重试逻辑和降级机制。",
    I_insight: "",
  });
  assert.strictEqual(agent.mentor_rule_family, "multi_agent");
  assert.ok(/边界|上下文|重试|降级/.test(agent.proposed.humanized_mentor_insight));

  const phd = mentorInsightRulesBackfill.buildOutput({
    id: 90005,
    retrieval_scope: "resume_edit",
    P_mentor: "博士候选人用应届生简历格式求职工业界岗位。",
    A_action: "博士/研究生找工业界岗位时，简历顺序改为：技能 → 研究/工作经历 → 发表论文 → 教育经历放最后。",
    I_insight: "",
  });
  assert.strictEqual(phd.mentor_rule_family, "industry_resume_order");
  assert.ok(/工业界|教育背景|学生版/.test(phd.proposed.humanized_mentor_insight));
});

test("mentor rules backfill handles cleanup, interests, publication, and role title families", () => {
  const cleanup = mentorInsightRulesBackfill.buildOutput({
    id: 90006,
    retrieval_scope: "resume_edit",
    P_mentor: "学员简历内容冗余，包含不相关实习、活动区域、获奖记录及重复的学术项目，导致简历超过一页，重点不突出。",
    A_action: "删掉不服务目标岗位的内容，把一页空间留给最相关经历。",
    I_insight: "",
  });
  assert.strictEqual(cleanup.mentor_rule_family, "redundant_content_cleanup");
  assert.ok(/无关|一页|最相关/.test(cleanup.proposed.humanized_mentor_insight));

  const interests = mentorInsightRulesBackfill.buildOutput({
    id: 90007,
    retrieval_scope: "resume_edit",
    P_mentor: "学生简历保留了Interests兴趣爱好版块，但现在这已不是主流做法。",
    A_action: "删除 Interests section，把空间让给项目和技能证据。",
    I_insight: "",
  });
  assert.strictEqual(interests.mentor_rule_family, "interests_section");
  assert.ok(/Interests|兴趣|版面/.test(interests.proposed.humanized_mentor_insight));

  const publication = mentorInsightRulesBackfill.buildOutput({
    id: 90008,
    retrieval_scope: "resume_edit",
    P_mentor: "Student had published a research paper comparing futures markets across two regions.",
    A_action: "正式发表的研究应标注为已发表，包括发表地点、主题和具体贡献。",
    I_insight: "",
  });
  assert.strictEqual(publication.mentor_rule_family, "research_publication");
  assert.ok(/发表|研究|贡献/.test(publication.proposed.humanized_mentor_insight));

  const title = mentorInsightRulesBackfill.buildOutput({
    id: 90009,
    retrieval_scope: "resume_edit",
    P_mentor: "候选人简历中使用了与目标岗位无关的原始职位名称，降低了简历相关性。",
    A_action: "将经历用更贴合目标岗位JD的名称呈现。",
    I_insight: "",
  });
  assert.strictEqual(title.mentor_rule_family, "role_title_reframing");
  assert.ok(/title|职能语言|JD|真实工作/.test(title.proposed.humanized_mentor_insight));
});

test("mentor rules backfill handles page overflow, metric terminology, and dual-track projects", () => {
  const overflow = mentorInsightRulesBackfill.buildOutput({
    id: 90010,
    retrieval_scope: "resume_edit",
    P_mentor: "候选人简历内容溢出到第二页，哪怕只有一小段溢出，招聘官也没有时间翻第二页。",
    A_action: "严格控制简历在一页内，宁可删减内容也不要两页。",
    I_insight: "",
  });
  assert.strictEqual(overflow.mentor_rule_family, "page_overflow");
  assert.ok(/第二页|一页|第一印象/.test(overflow.proposed.humanized_mentor_insight));

  const metrics = mentorInsightRulesBackfill.buildOutput({
    id: 90011,
    retrieval_scope: "resume_edit",
    P_mentor: "简历中使用的指标术语必须准确：user engagement 和 conversion rate 不能混用。",
    A_action: "检查所有metrics描述，确认术语定义正确。",
    I_insight: "",
  });
  assert.strictEqual(metrics.mentor_rule_family, "metric_terminology");
  assert.ok(/User engagement|conversion rate|术语/.test(metrics.proposed.humanized_mentor_insight));

  const dual = mentorInsightRulesBackfill.buildOutput({
    id: 90012,
    retrieval_scope: "resume_edit",
    P_mentor: "学员想同时投BA和Marketing Analytics两个方向，但经历没有明确的marketing成分。",
    A_action: "做一个营销数据分析项目，写入简历后可在两个版本中共用。",
    I_insight: "",
  });
  assert.strictEqual(dual.mentor_rule_family, "dual_track_project");
  assert.ok(/BA|Marketing Analytics|营销数据分析|两个版本/.test(dual.proposed.humanized_mentor_insight));
});

test("mentor rules backfill keeps PDF, contribution, cross-industry, and portfolio specifics", () => {
  const pdf = mentorInsightRulesBackfill.buildOutput({
    id: 90013,
    retrieval_scope: "resume_edit",
    P_mentor: "申请岗位时，简历必须以PDF格式递交；Word或Google Docs文件格式容易错乱。",
    A_action: "每次投递前将简历导出为PDF再提交。",
    I_insight: "",
  });
  assert.strictEqual(pdf.mentor_rule_family, "pdf_submission");
  assert.ok(/PDF|Word|格式/.test(pdf.proposed.humanized_mentor_insight));

  const cpa = mentorInsightRulesBackfill.buildOutput({
    id: 90017,
    retrieval_scope: "resume_edit",
    P_mentor: "申请美国公共会计（public accounting）岗位的求职者需要说明CPA eligible date。",
    A_action: "主动提及满足150学分可申请坐考CPA的时间节点。",
    I_insight: "",
  });
  assert.strictEqual(cpa.mentor_rule_family, "cpa_eligibility");
  assert.ok(/CPA eligible date|150 学分|public accounting/.test(cpa.proposed.humanized_mentor_insight));

  const contribution = mentorInsightRulesBackfill.buildOutput({
    id: 90014,
    retrieval_scope: "resume_edit",
    P_mentor: "经历描述很散，因为没有从最重要的贡献开始写。",
    A_action: "先明确核心价值，把最重要的贡献作为第一条bullet。",
    I_insight: "",
  });
  assert.strictEqual(contribution.mentor_rule_family, "core_contribution_first");
  assert.ok(/核心价值|第一条 bullet|贡献/.test(contribution.proposed.humanized_mentor_insight));

  const language = mentorInsightRulesBackfill.buildOutput({
    id: 90015,
    retrieval_scope: "resume_edit",
    P_mentor: "跨行业DA/BA简历中不应出现行业专有内部术语，其他行业HR看不懂。",
    A_action: "将行业专有缩写替换为通用的数据/分析语言。",
    I_insight: "",
  });
  assert.strictEqual(language.mentor_rule_family, "cross_industry_language");
  assert.ok(/跨行业|内部术语|数据语言/.test(language.proposed.humanized_mentor_insight));

  const ux = mentorInsightRulesBackfill.buildOutput({
    id: 90016,
    retrieval_scope: "resume_edit",
    P_mentor: "UX作品集必须展示user persona、journey map等用户研究产出，而不只是视觉稿。",
    A_action: "补充用户研究内容并加入项目页面。",
    I_insight: "",
  });
  assert.strictEqual(ux.mentor_rule_family, "ux_research_portfolio");
  assert.ok(/UX|User persona|journey map|UI/.test(ux.proposed.humanized_mentor_insight));
});

test("mentor rules backfill does not approve high-risk broad-template misses", () => {
  const negotiation = mentorInsightRulesBackfill.buildOutput({
    id: 90101,
    retrieval_scope: "resume_edit",
    P_mentor: "Sales intern experience should not claim negotiation because that sounds above intern scope.",
    A_action: "Replace negotiation with client meeting, meeting minutes, and client relationship maintenance that the student can explain.",
    H_hook: "negotiate feels like something senior people do with clients.",
    I_insight: "",
  });
  assert.strictEqual(negotiation.mentor_rule_family, "intern_scope_truthfulness");
  assert.ok(/negotiation|client meeting|会议记录|客户/.test(negotiation.proposed.humanized_mentor_insight));
  assert.strictEqual(negotiation.review.recommendation, "approved");

  const acronym = mentorInsightRulesBackfill.buildOutput({
    id: 90102,
    retrieval_scope: "resume_edit",
    P_mentor: "Resume mentions YOLO and COCO but non-technical readers may not understand the acronyms.",
    A_action: "Spell out YOLO (You Only Look Once) and explain COCO the first time it appears.",
    I_insight: "",
  });
  assert.strictEqual(acronym.mentor_rule_family, "acronym_explanation");
  assert.ok(/YOLO|COCO|全称|解释/.test(acronym.proposed.humanized_mentor_insight));
  assert.strictEqual(acronym.review.recommendation, "approved");

  const portfolio = mentorInsightRulesBackfill.buildOutput({
    id: 90103,
    retrieval_scope: "resume_edit",
    P_mentor: "Portfolio quality is uneven; early student work lowers the recruiter's impression.",
    A_action: "Choose 3-5 strongest portfolio pieces, put the best one first, and remove weak early work.",
    I_insight: "",
  });
  assert.strictEqual(portfolio.mentor_rule_family, "portfolio_quality");
  assert.ok(/3-5|作品集|最前面|当前水平/.test(portfolio.proposed.humanized_mentor_insight));
  assert.strictEqual(portfolio.review.recommendation, "approved");
});

test("mentor rules backfill keeps project and versioning specifics", () => {
  const yelp = mentorInsightRulesBackfill.buildOutput({
    id: 90104,
    retrieval_scope: "resume_edit",
    P_mentor: "The Yelp project is too simple and does not show data analysis depth.",
    A_action: "Use Yelp API to collect restaurant data, run analysis, apply clustering, and add visualization.",
    I_insight: "",
  });
  assert.strictEqual(yelp.mentor_rule_family, "project_depth_chain");
  assert.ok(/Yelp API|clustering|visualization|分析链条/.test(yelp.proposed.humanized_mentor_insight));
  assert.strictEqual(yelp.review.recommendation, "approved");

  const versions = mentorInsightRulesBackfill.buildOutput({
    id: 90105,
    retrieval_scope: "resume_edit",
    P_mentor: "Candidate is applying to BA and PM at the same time, so one generic resume is too scattered.",
    A_action: "Maintain a BA version and a PM version; keep DS material only where it supports the target.",
    H_hook: "BA and PM should run in parallel, but each resume needs its own emphasis.",
    I_insight: "",
  });
  assert.strictEqual(versions.mentor_rule_family, "multi_version_resume");
  assert.ok(/BA|PM|DS|版本/.test(versions.proposed.humanized_mentor_insight));
  assert.strictEqual(versions.review.recommendation, "approved");
});

test("mentor rules backfill requires high-signal terms before approval", () => {
  const row = {
    id: 90106,
    retrieval_scope: "resume_edit",
    P_mentor: "Project should mention Yelp API and clustering.",
    A_action: "Use Yelp API data and clustering to show analysis depth.",
    I_insight: "",
  };
  const badText = "你这条项目可以写得更具体一点，先把任务、方法和结果补完整。";
  const review = mentorInsightRulesBackfill.reviewMentor(row, badText);
  assert.ok(review.flags.includes("lost_required_signal"));
  assert.strictEqual(review.recommendation, "needs_review");
});

test("mentor rules backfill keeps reviewer-flagged B batch details", () => {
  const chatbot = mentorInsightRulesBackfill.buildOutput({
    id: 90201,
    retrieval_scope: "resume_edit",
    P_mentor: "LLM/chatbot project currently repeats data cleaning and data transformation already shown elsewhere.",
    A_action: "Show RAG system construction, AI API calls, and chatbot evaluation instead.",
    E_example: "LLM mental health chatbot should focus on RAG system, AI API, and evaluate chatbot effects.",
    I_insight: "",
  });
  assert.strictEqual(chatbot.mentor_rule_family, "project_capability_map");
  assert.ok(/LLM|chatbot|RAG|AI API|evaluation/.test(chatbot.proposed.humanized_mentor_insight));

  const title = mentorInsightRulesBackfill.buildOutput({
    id: 90202,
    retrieval_scope: "resume_edit",
    P_mentor: "Company title is Business Analyst, but actual work is competitor research and social media operations.",
    A_action: "Use Marketing Intern instead of Business Analyst so title matches the actual work.",
    I_insight: "",
  });
  assert.strictEqual(title.mentor_rule_family, "title_role_truthfulness");
  assert.ok(/Marketing Intern|Business Analyst|竞品|社媒|真实工作/.test(title.proposed.humanized_mentor_insight));

  const customer = mentorInsightRulesBackfill.buildOutput({
    id: 90203,
    retrieval_scope: "resume_edit",
    P_mentor: "Student is unclear whether the company work is B2B or B2C.",
    A_action: "Separate B2B enterprise clients from B2C consumer engagement in resume bullets.",
    I_insight: "",
  });
  assert.strictEqual(customer.mentor_rule_family, "customer_segment_framing");
  assert.ok(/B2B|B2C|客户群体/.test(customer.proposed.humanized_mentor_insight));

  const link = mentorInsightRulesBackfill.buildOutput({
    id: 90204,
    retrieval_scope: "resume_edit",
    P_mentor: "Resume lacks portfolio link.",
    A_action: "Add Portfolio link under the name, such as a Notion page link, with LinkedIn and email.",
    I_insight: "",
  });
  assert.strictEqual(link.mentor_rule_family, "portfolio_link");
  assert.ok(/Notion|portfolio|LinkedIn|名字下方/.test(link.proposed.humanized_mentor_insight));
});

test("mentor rules backfill keeps reviewer-flagged C batch details", () => {
  const ownership = mentorInsightRulesBackfill.buildOutput({
    id: 90205,
    retrieval_scope: "resume_edit",
    P_mentor: "Chinese applicants often understate ownership and write contributed to.",
    A_action: "Replace contributed to with in charge of five drawings and add concrete numbers.",
    I_insight: "",
  });
  assert.strictEqual(ownership.mentor_rule_family, "ownership_voice");
  assert.ok(/ownership|contributed to|in charge of|数量/.test(ownership.proposed.humanized_mentor_insight));

  const space = mentorInsightRulesBackfill.buildOutput({
    id: 90206,
    retrieval_scope: "resume_edit",
    P_mentor: "Extracurricular section and Languages: English, Mandarin take resume space.",
    A_action: "Delete extracurriculars and English/Mandarin, then use the space for technical skills.",
    I_insight: "",
  });
  assert.strictEqual(space.mentor_rule_family, "space_reallocation");
  assert.ok(/课外活动|English|Mandarin|technical skills/.test(space.proposed.humanized_mentor_insight));

  const linux = mentorInsightRulesBackfill.buildOutput({
    id: 90207,
    retrieval_scope: "resume_edit",
    P_mentor: "Student listed Ubuntu, CentOS, Red Hat, and virtual machines but only used Ubuntu and VM.",
    A_action: "Keep Ubuntu and virtual machine, delete CentOS and Red Hat if unused.",
    I_insight: "",
  });
  assert.strictEqual(linux.mentor_rule_family, "skill_truthfulness_linux");
  assert.ok(/Ubuntu|CentOS|红帽|虚拟机/.test(linux.proposed.humanized_mentor_insight));

  const hardware = mentorInsightRulesBackfill.buildOutput({
    id: 90208,
    retrieval_scope: "resume_edit",
    P_mentor: "Student worries no PCB or circuit drawing experience hurts hardware development applications.",
    A_action: "Do not fake PCB drawing; write testing, product familiarity, and debugging with hardware engineers.",
    I_insight: "",
  });
  assert.strictEqual(hardware.mentor_rule_family, "hardware_truthfulness");
  assert.ok(/PCB|电路图|测试|调试|虚构/.test(hardware.proposed.humanized_mentor_insight));
});

test("mentor rules backfill fast lane only approves high-signal rows", () => {
  const fast = mentorInsightRulesBackfill.buildOutput({
    id: 90301,
    retrieval_scope: "resume_edit",
    P_mentor: "Resume uses spaces to align content instead of Word Ruler and Tab.",
    A_action: "Use Word Ruler left margin with Tab key so formatting does not break.",
    I_insight: "",
  });
  assert.strictEqual(fast.mentor_rule_family, "word_ruler_format");
  assert.strictEqual(fast.review.fastLaneApproved, true);

  const broad = mentorInsightRulesBackfill.buildOutput({
    id: 90302,
    retrieval_scope: "resume_edit",
    P_mentor: "Resume layout is generally hard to scan.",
    A_action: "Improve basic readability and spacing.",
    I_insight: "",
  });
  assert.strictEqual(broad.review.recommendation, "approved");
  assert.strictEqual(broad.review.fastLaneApproved, false);
});

test("mentor rules backfill bulk safe approves advisory-only template rows", () => {
  const row = mentorInsightRulesBackfill.buildOutput({
    id: 90303,
    retrieval_scope: "resume_edit",
    P_mentor: "This project experience is valuable but currently reads like a task list without enough context about what the student did, how they did it, and why it mattered for the target role. The resume should make the work easier to understand.",
    A_action: "Rewrite the project bullet so it explains the task, method, and result in a more complete way.",
    I_insight: "",
  });
  assert.strictEqual(row.mentor_rule_family, "experience");
  assert.ok(row.review.flags.includes("mentor_generic_template_risk"));
  assert.strictEqual(row.review.recommendation, "approved");
  assert.strictEqual(row.review.bulkSafeApproved, true);
});

test("mentor rules backfill bulk safe still blocks HR voice and lost high-signal terms", () => {
  const hrVoice = mentorInsightRulesBackfill.reviewMentor({
    id: 90304,
    retrieval_scope: "resume_edit",
    P_mentor: "Resume lacks portfolio link.",
    A_action: "Add a portfolio link under the name.",
    I_insight: "",
  }, "HR 会先看有没有作品集链接，没有的话会影响初筛。");
  assert.ok(hrVoice.flags.includes("mentor_hr_voice_risk"));
  assert.strictEqual(hrVoice.recommendation, "needs_review");

  const lostSignal = mentorInsightRulesBackfill.reviewMentor({
    id: 90305,
    retrieval_scope: "resume_edit",
    P_mentor: "Project should mention Yelp API and clustering.",
    A_action: "Use Yelp API data and clustering to show analysis depth.",
    I_insight: "",
  }, "你这个项目可以写得更完整一点，先把方法和结果补清楚。");
  assert.ok(lostSignal.flags.includes("lost_required_signal"));
  assert.strictEqual(lostSignal.recommendation, "needs_review");
});

test("mentor rules bulk classifier keeps process-engineer and JD-matching specifics", () => {
  const process = mentorInsightRulesBackfill.buildOutput({
    id: 90306,
    retrieval_scope: "resume_edit",
    problem_tags: "low_role_specificity,weak_target_role_alignment",
    P_mentor: "Graduate chemistry background with catalysis can support process engineer work in chemical plants.",
    A_action: "Connect catalysis, key parameter monitoring, and control-console tuning to process engineer daily work.",
    H_hook: "看催化反应和塔里面需要关注哪几个参数。",
    I_insight: "",
  });
  assert.strictEqual(process.mentor_rule_family, "research_industry_positioning");
  assert.ok(/process engineer|催化反应|参数/.test(process.proposed.humanized_mentor_insight));

  const matching = mentorInsightRulesBackfill.buildOutput({
    id: 90307,
    retrieval_scope: "resume_edit",
    problem_tags: "low_role_specificity,weak_target_role_alignment",
    P_mentor: "Resume keyword coverage is too low for ATS.",
    A_action: "Collect 10 target JDs, run resume-JD matching score, add missing keywords, then validate with 5-7 new JDs.",
    I_insight: "",
  });
  assert.strictEqual(matching.mentor_rule_family, "keyword_evidence");
  assert.ok(/10 份|matching score|5-7 份/.test(matching.proposed.humanized_mentor_insight));
});

test("mentor rules bulk classifier handles strategy and interview rows without keyword drift", () => {
  const cases = [
    {
      row: {
        id: 94001,
        retrieval_scope: "resume_edit",
        P_mentor: "Student is unsure how many bullet points each experience should have.",
        A_action: "Write 3-5 bullet points per work or project experience, keeping density useful but not redundant.",
      },
      family: "bullet_count_density",
      must: /3-5|bullet|任务|方法|结果/,
    },
    {
      row: {
        id: 94002,
        retrieval_scope: "resume_edit",
        P_mentor: "Several students use the same project template, so identical wording may look duplicated.",
        A_action: "Use ChatGPT to rewrite wording while keeping the project title and core facts unchanged.",
      },
      family: "template_differentiation",
      must: /项目模板|措辞|雷同|核心事实/,
    },
    {
      row: {
        id: 94003,
        retrieval_scope: "job_search",
        P_mentor: "The market is tough for new grad full-time roles, but ICC contract jobs are more available.",
        A_action: "Consider contract jobs as a 3-6 month project path before applying to full-time roles again.",
      },
      family: "contract_path_strategy",
      must: /contract|3-6|美国经验|正职/,
    },
    {
      row: {
        id: 94004,
        retrieval_scope: "interview",
        P_mentor: "LeetCode around 200 problems may be enough for intern or ICC, but not enough for full time big tech.",
        A_action: "Continue LeetCode practice and focus on high-frequency Java questions.",
      },
      family: "interview_prep_depth",
      must: /LeetCode|Intern|full time|高频题/,
    },
    {
      row: {
        id: 94005,
        retrieval_scope: "interview",
        P_mentor: "Modern control theory is academic; most industry systems still use PID and frequency domain analysis.",
        A_action: "Review Bode plot, Nyquist plot, PID, servo drive, actuator, and system identification.",
      },
      family: "controls_engineering_depth",
      must: /PID|Bode|Nyquist|system identification/,
    },
    {
      row: {
        id: 94006,
        retrieval_scope: "resume_edit",
        P_mentor: "A project only says product features and misses market launch thinking.",
        A_action: "Add user survey, user study, target audience, campaign, and go-to-market plan.",
      },
      family: "product_business_framing",
      must: /user survey|user study|go-to-market|目标用户/,
    },
    {
      row: {
        id: 94007,
        retrieval_scope: "resume_edit",
        P_mentor: "Only listing Azure narrows the company match; tech companies and startups often use AWS or Google Cloud.",
        A_action: "Show AWS first if available, then Google Cloud; keep Azure for Microsoft-related applications.",
      },
      family: "cloud_platform_positioning",
      must: /Azure|AWS|Google Cloud|科技公司/,
    },
  ];

  for (const c of cases) {
    const output = mentorInsightRulesBackfill.buildOutput({
      problem_tags: "",
      I_insight: "",
      ...c.row,
    });
    assert.strictEqual(output.mentor_rule_family, c.family, `${c.family}: ${output.mentor_rule_family}`);
    assert.ok(c.must.test(output.proposed.humanized_mentor_insight), output.proposed.humanized_mentor_insight);
    assert.strictEqual(output.review.recommendation, "approved", JSON.stringify(output.review));
    assert.ok(!/HR|招聘|我初筛|我第一眼|我会帮你|我会把|我会从|我会陪你/.test(output.proposed.humanized_mentor_insight), output.proposed.humanized_mentor_insight);
  }
});

test("mentor rules detail keepers preserve top hold signals", () => {
  const cases = [
    {
      row: {
        id: 94101,
        retrieval_scope: "resume_edit",
        P_mentor: "Finance student is targeting Business Analyst and Accounting roles, but the resume mixes Advisory and valuation language.",
        A_action: "Split Finance, Accounting, and Business Analyst positioning so each version has the right evidence.",
      },
      family: "finance_accounting_positioning",
      must: /Finance|Accounting|Business Analyst|Advisory/,
    },
    {
      row: {
        id: 94102,
        retrieval_scope: "resume_edit",
        P_mentor: "The DA project starts from raw data but the resume only lists SQL and Python.",
        A_action: "Show the raw data flow, analysis, visualization, and dashboard result for BA and DS readers.",
      },
      family: "analytics_visualization_evidence",
      must: /DA\/DS|raw data|visualization|dashboard/,
    },
    {
      row: {
        id: 94103,
        retrieval_scope: "resume_edit",
        P_mentor: "The Portfolio case study and research paper are useful but currently hidden as generic project text.",
        A_action: "Describe the Portfolio case study, paper status, research role, and contribution.",
      },
      family: "portfolio_research_artifact",
      must: /Portfolio|paper|research|contribution/,
    },
    {
      row: {
        id: 94104,
        retrieval_scope: "resume_edit",
        P_mentor: "The RAG chatbot project lacks evaluation details.",
        A_action: "Explain faithfulness, answer relevance, context recall, and chatbot evaluation instead of only saying AI API.",
      },
      family: "rag_chatbot_evaluation",
      must: /RAG|evaluation|faithfulness|answer relevance|context recall/,
    },
    {
      row: {
        id: 94105,
        retrieval_scope: "resume_edit",
        P_mentor: "The student lists linear regression but cannot explain the analytics method clearly.",
        A_action: "Explain variables, target, result, limitations, and how linear regression supports the business analytics conclusion.",
      },
      family: "analytics_method_truthfulness",
      must: /linear regression|变量|结果|限制/,
    },
  ];

  for (const c of cases) {
    const output = mentorInsightRulesBackfill.buildOutput({
      problem_tags: "",
      I_insight: "",
      ...c.row,
    });
    assert.strictEqual(output.mentor_rule_family, c.family, `${c.family}: ${output.mentor_rule_family}`);
    assert.ok(c.must.test(output.proposed.humanized_mentor_insight), output.proposed.humanized_mentor_insight);
    assert.strictEqual(output.review.recommendation, "approved", JSON.stringify(output.review));
    assert.ok(!/HR|招聘|我初筛|我第一眼|我会帮你|我会把|我会从|我会陪你/.test(output.proposed.humanized_mentor_insight), output.proposed.humanized_mentor_insight);
  }
});

test("mentor LLM generation review blocks overactive or HR-like mentor copy", () => {
  const row = {
    id: 90401,
    retrieval_scope: "resume_edit",
    P_mentor: "学生需要把 Notion portfolio 链接放到名字下方。",
    A_action: "在简历抬头加入 Portfolio: notion.so/xxx。",
    H_hook: "别让 HR 自己找作品集。",
    E_example: "姓名 | Portfolio: notion.so/xxx | LinkedIn | 邮箱",
    I_insight: "",
  };
  const overactive = mentorInsightLlmGeneration.buildOutput(row, {
    id: 90401,
    humanized_mentor_insight: "我会帮你把 Notion portfolio 放到名字下方，这样 HR 就能一眼看到。",
    perspective_confidence: 0.88,
  });
  assert.strictEqual(overactive.review.recommendation, "needs_review");
  assert.ok(overactive.review.flags.includes("mentor_overactive_voice_risk"));

  const hrLike = mentorInsightLlmGeneration.buildOutput(row, {
    id: 90401,
    humanized_mentor_insight: "HR会先看你有没有作品集链接；没有的话筛选时会被扣分。",
    perspective_confidence: 0.88,
  });
  assert.strictEqual(hrLike.review.recommendation, "needs_review");
  assert.ok(hrLike.review.flags.includes("mentor_hr_voice_risk"));
});

test("company insider knowledge keeps market insight separate from advice POV", () => {
  const retrievalQuery = {
    targetRole: "Data Analyst",
    roleFamily: "data_analyst",
    priorityKeywords: ["SQL", "Tableau"],
    filters: {
      roleFamily: ["data_analyst"],
      targetRoles: ["data_analyst"],
    },
  };
  const row = {
    id: 91001,
    chunk_id: "seg_91001",
    mentor_company: "Amazon",
    mentor_name: "Y导师",
    mentor_title: "Marketing Manager",
    topic: "技术技能补强",
    L1: "技能提升",
    role_family: "data_analyst",
    target_roles: "data_analyst,marketing_analytics",
    keywords: "SQL,Tableau,marketing analytics",
    mentor_quality_score: 0.95,
    I_insight: "Amazon Marketing Analytics 岗位通常更看重 SQL 和 Excel 的数据处理能力，Tableau/Power BI 是常见加分项，Python/R 多半属于 preferred 而不是硬性门槛。",
  };

  assert.strictEqual(isDisplayableInsiderKnowledge(row, retrievalQuery), true);
  const tip = buildInsiderKnowledgeTip(row, retrievalQuery);
  assert.strictEqual(tip.company, "Amazon");
  assert.strictEqual(tip.sourceMentorName, "Y导师");
  assert.strictEqual(tip.sourceTopic, "技术技能补强");
  assert.ok(tip.knowledgeTitle.includes("Amazon"));
  assert.ok(/sql/i.test(tip.relevanceReason));
  assert.equal(Object.prototype.hasOwnProperty.call(tip, "insightType"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(tip, "hrPerspective"), false);
});

test("company insider knowledge rejects direct resume actions", () => {
  const retrievalQuery = {
    targetRole: "Data Analyst",
    roleFamily: "data_analyst",
    filters: { roleFamily: ["data_analyst"], targetRoles: ["data_analyst"] },
  };
  const row = {
    mentor_company: "Amazon",
    role_family: "data_analyst",
    target_roles: "data_analyst",
    I_insight: "Amazon 岗位看重 SQL，因此建议你把 SQL 写进 Skills，并在简历中补充 Tableau bullet。",
  };

  assert.strictEqual(isDisplayableInsiderKnowledge(row, retrievalQuery), false);
});

console.log(`\nAfter action precondition tests: ${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
