"use strict";

const assert = require("assert");
const {
  hasCaseLeak,
  proposedFor,
} = require("./backfill_segments_perspective_split");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`ok ${name}`);
    passed += 1;
  } catch (error) {
    console.error(`fail ${name}`);
    console.error(error.message);
    failed += 1;
  }
}

test("HR_os without case leak fills raw HR perspective", () => {
  const row = proposedFor({
    id: 1,
    canonical_action_family: "experience_evidence",
    humanized_mentor_insight: "Skills should map to real work evidence.",
    humanized_hr_perspective: "",
    HR_os: "For data analyst roles I look for SQL, dashboard, and business impact evidence.",
    I_insight: "Data analyst resumes need a clear data workflow.",
    perspective_review_status: "approved",
  });
  assert.strictEqual(row.humanized_hr_perspective_raw, "For data analyst roles I look for SQL, dashboard, and business impact evidence.");
  assert.strictEqual(row.perspective_split_meta.hrSource, "HR_os");
});

test("HR_os with case leak does not fill raw HR perspective from that source", () => {
  const row = proposedFor({
    id: 2,
    canonical_action_family: "experience_evidence",
    humanized_mentor_insight: "Skills should map to real work evidence.",
    humanized_hr_perspective: "",
    HR_os: "I will ask about Alpha Research, VADER, and MACD.",
    I_insight: "Experience evidence matters.",
    perspective_review_status: "approved",
  });
  assert.ok(!/Alpha Research|VADER|MACD/.test(row.humanized_hr_perspective_raw));
  assert.strictEqual(row.perspective_split_meta.hrSource, "template");
});

test("mentor legacy case leak can be replaced by safe I_insight", () => {
  const row = proposedFor({
    id: 3,
    canonical_action_family: "jd_keyword_alignment",
    humanized_mentor_insight: "Alpha Research and VADER should be expanded.",
    humanized_hr_perspective: "",
    HR_os: "I look for keyword evidence in real experience.",
    I_insight: "Domain keywords should appear next to real evidence in the experience section.",
    perspective_review_status: "approved",
  });
  assert.strictEqual(row.humanized_mentor_insight_raw, "Domain keywords should appear next to real evidence in the experience section.");
  assert.strictEqual(row.perspective_split_meta.mentorSource, "I_insight");
});

test("case leak detector catches project names", () => {
  assert.ok(hasCaseLeak("Alpha Research project with VADER and MACD"));
  assert.ok(!hasCaseLeak("Hardware roles can keep test and debug evidence."));
});

console.log(`${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
