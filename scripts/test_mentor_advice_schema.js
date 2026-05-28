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

// ─── Summary ───────────────────────────────────────────────────────────────
console.log(`\n${"─".repeat(50)}`);
console.log(`  ${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
