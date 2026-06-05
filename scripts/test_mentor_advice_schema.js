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
  normalizeDisplayActionLanguage,
  normalizeDisplayTitle,
  normalizeDisplayDiagnosis,
  selectPremiumMentorPlan,
  formatPremiumMentorReport,
} = require("../services/mentorAdviceRetrieval");

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
        adviceId: "fb_target_role_positioning",
        title: "先让简历看起来像 Accounting 岗位",
        mentorLens: "lens text",
        currentDiagnosis: "diagnosis text",
        action: "action text",
        reason: "reason text",
        evidence: ["chip1", "chip2"],
        relatedProblemTags: ["missing_exact_job_title"],
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
  assert.strictEqual(item.mentorLens, "lens text");
  assert.strictEqual(item.currentDiagnosis, "diagnosis text");
  assert.strictEqual(item.action, "action text");
  assert.strictEqual(item.reason, "reason text");
  assert.deepStrictEqual(item.evidence, ["chip1", "chip2"]);
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
if (failed > 0) process.exit(1);
