"use strict";

const assert = require("assert");
const {
  curateMentorAdvicePlan,
  inferMentorGroupLens,
} = require("../services/adviceCurator");
const { buildRoleProfileFromContext } = require("../src/ats/role-profile");
const {
  buildRoleLexicon,
  buildRoleAwareFallbackAdvice,
} = require("../src/ats/role-fallback-advice");
const {
  retrieveMentorAdviceWithStatus,
  selectFreeMentorPlan,
  selectPremiumMentorPlan,
} = require("../services/mentorAdviceRetrieval");

function makeItem(id, overrides = {}) {
  return {
    adviceId: id,
    title: overrides.title || `Advice ${id}`,
    currentDiagnosis: overrides.currentDiagnosis || "Current diagnosis is specific enough for preview.",
    action: overrides.action || "Rewrite the relevant resume section with action, method, and result.",
    priority: overrides.priority || "medium",
    targetSection: overrides.targetSection || "experience",
    relatedProblemTags: overrides.relatedProblemTags || [],
    mentorSource: overrides.mentorSource || {
      mentorId: overrides.mentorId || "mentor_a",
      mentorName: overrides.mentorName || "A Mentor",
      company: overrides.company || "MentorX",
      mentorTitle: overrides.mentorTitle || "Resume Mentor",
    },
    ...overrides,
  };
}

function makeContext(overrides = {}) {
  const targetRole = overrides.jobTitle || "Software Engineer";
  const roleFamily = overrides.roleFamily || (targetRole === "Software Engineer" ? "software_engineer" : "");
  return {
    internalAtsResult: {
      jobTitle: targetRole,
      jdText: overrides.jdText || `${targetRole} role responsibilities from the target JD.`,
      profile: { targetRole, roleFamily },
      problemTags: overrides.problemTags || [
        { tag: "low_jd_keyword_match", severity: "critical" },
        { tag: "weak_experience_keyword_evidence", severity: "high" },
        { tag: "low_measurable_results", severity: "medium" },
      ],
    },
    retrievalQuery: {
      targetRole,
      roleFamily,
      queryText: overrides.queryText || targetRole,
    },
    targetRole,
  };
}

function runKeywordCapsTest() {
  const mentorReport = {
    mentors: [
      {
        mentorId: "m1",
        mentorName: "Mentor 1",
        company: "Google",
        mentorTitle: "Software Engineer",
        adviceItems: [
          makeItem("kw1", { title: "Add JD keywords", action: "Add JD keywords to Skills.", targetSection: "skills", relatedProblemTags: ["low_jd_keyword_match"], mentorId: "m1" }),
          makeItem("kw2", { title: "Embed keywords", action: "Embed JD keywords into experience bullet.", relatedProblemTags: ["low_jd_keyword_match"], mentorId: "m1" }),
          makeItem("kw3", { title: "Keyword terminology", action: "Replace terminology with JD keywords.", targetSection: "summary", relatedProblemTags: ["low_jd_keyword_match"], mentorId: "m1" }),
        ],
      },
      {
        mentorId: "m2",
        mentorName: "Mentor 2",
        company: "Amazon",
        mentorTitle: "Recruiter",
        adviceItems: [
          makeItem("kw4", { title: "ATS keyword scan", action: "Add missing ATS keywords.", targetSection: "skills", relatedProblemTags: ["missing_priority_keywords"], mentorId: "m2" }),
          makeItem("kw5", { title: "Keyword placement", action: "Place keywords in Summary and Experience.", relatedProblemTags: ["missing_priority_keywords"], mentorId: "m2" }),
          makeItem("exp1", { title: "Strengthen project evidence", action: "Rewrite one bullet with action, method, and result.", relatedProblemTags: ["weak_experience_keyword_evidence"], mentorId: "m2" }),
        ],
      },
    ],
  };
  const result = curateMentorAdvicePlan({ ...makeContext(), mentorReport });
  const keywordItems = result.curatedAdviceItems.filter((item) => item.coverageFamily === "keyword");
  assert.ok(keywordItems.length <= 2, `expected at most 2 keyword items, got ${keywordItems.length}`);
  const resultKeywordItems = result.resultPageAdviceItems.filter((item) => item.coverageFamily === "keyword");
  assert.ok(resultKeywordItems.length <= 2, `critical keyword preview allows at most 2, got ${resultKeywordItems.length}`);
}

function runResultDistributionTest() {
  const mentorReport = {
    mentors: [{
      mentorId: "m1",
      mentorName: "Mentor 1",
      company: "MentorX",
      mentorTitle: "Resume Mentor",
      adviceItems: [
        makeItem("summary", { title: "Add target role to Summary", action: "Add Software Engineer to the first Summary sentence.", targetSection: "summary", relatedProblemTags: ["missing_exact_job_title"], priority: "high" }),
        makeItem("experience", { title: "Rewrite experience bullet", action: "Rewrite one bullet with action, method, and result.", targetSection: "experience", relatedProblemTags: ["weak_experience_keyword_evidence"], priority: "high" }),
        makeItem("impact", { title: "Quantify results", action: "Add metrics to show business impact.", targetSection: "experience", relatedProblemTags: ["low_measurable_results"] }),
        makeItem("keyword", { title: "Add JD keywords", action: "Put keywords into Skills.", targetSection: "skills", relatedProblemTags: ["low_jd_keyword_match"] }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext(), mentorReport });
  assert.equal(result.resultPageAdviceItems.length, 3);
  const families = new Set(result.resultPageAdviceItems.map((item) => item.coverageFamily));
  assert.ok(families.size >= 2, `expected varied preview families, got ${[...families].join(",")}`);
}

function runReportRichnessTest() {
  const mentorReport = {
    mentors: [
      {
        mentorId: "m1",
        mentorName: "Mentor 1",
        company: "Google",
        mentorTitle: "Software Engineer",
        adviceItems: [
          makeItem("exp_google", { title: "Rewrite backend experience bullet", action: "Show the API work with action, method, tools, and result.", relatedProblemTags: ["weak_experience_keyword_evidence"], mentorId: "m1", company: "Google" }),
          makeItem("kw_google", { title: "Add JD keywords", action: "Place backend and API keywords into Skills.", targetSection: "skills", relatedProblemTags: ["low_jd_keyword_match"], mentorId: "m1", company: "Google" }),
        ],
      },
      {
        mentorId: "m2",
        mentorName: "Mentor 2",
        company: "Amazon",
        mentorTitle: "Recruiter",
        adviceItems: [
          makeItem("exp_amazon", { title: "Strengthen project evidence", action: "Rewrite the project bullet with task, method, and deliverable.", relatedProblemTags: ["weak_experience_keyword_evidence"], mentorId: "m2", company: "Amazon" }),
          makeItem("impact_amazon", { title: "Quantify engineering impact", action: "Add measurable latency, reliability, or user impact where truthful.", relatedProblemTags: ["low_measurable_results"], mentorId: "m2", company: "Amazon" }),
        ],
      },
      {
        mentorId: "m3",
        mentorName: "Mentor 3",
        company: "MentorX",
        mentorTitle: "Resume Mentor",
        adviceItems: [
          makeItem("summary_mx", { title: "Add target role to Summary", action: "Add Software Engineering to the first Summary sentence.", targetSection: "summary", relatedProblemTags: ["missing_exact_job_title"], mentorId: "m3", company: "MentorX" }),
          makeItem("kw_mx", { title: "Keyword placement", action: "Place JD keywords in Summary and Experience.", relatedProblemTags: ["missing_priority_keywords"], mentorId: "m3", company: "MentorX" }),
          makeItem("risk_mx", { title: "Explain internship period", action: "Clarify whether the short experience was an Internship or scoped project.", relatedProblemTags: ["short_tenure_unclear"], mentorId: "m3", company: "MentorX" }),
        ],
      },
    ],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    problemTags: [
      { tag: "low_jd_keyword_match", severity: "critical" },
      { tag: "missing_priority_keywords", severity: "high" },
      { tag: "weak_experience_keyword_evidence", severity: "high" },
      { tag: "low_measurable_results", severity: "medium" },
      { tag: "short_tenure_unclear", severity: "medium" },
      { tag: "missing_exact_job_title", severity: "medium" },
    ],
  }), mentorReport });
  const keywords = result.curatedAdviceItems.filter((item) => item.coverageFamily === "keyword");
  const experience = result.curatedAdviceItems.filter((item) => item.coverageFamily === "experience_evidence");
  assert.ok(result.curatedAdviceItems.length >= 6, `expected richer report curation, got ${result.curatedAdviceItems.length}`);
  assert.ok(keywords.length <= 2, `expected keyword cap to hold, got ${keywords.length}`);
  assert.ok(experience.length >= 2, `expected two non-duplicate experience perspectives, got ${experience.length}`);
}

function runMentorLensTest() {
  const lens = inferMentorGroupLens([
    makeItem("risk1", { title: "Explain internship period", action: "Mark this experience as Internship and clarify project period.", relatedProblemTags: ["short_tenure_unclear"] }),
    makeItem("risk2", { title: "Clarify project boundary", action: "Explain the project scope and deliverable boundary.", relatedProblemTags: ["short_tenure_unclear"] }),
  ], { company: "Robert A.M. Stern Architects", mentorTitle: "Architecture Designer" }, "Software Engineer");
  assert.ok(/短期|项目|风险|risk|intern|project|çŸ­|é¡¹|é£Ž/.test(`${lens.lens} ${lens.reason}`), JSON.stringify(lens));
  assert.ok(!/æŠ€æœ¯é¡¹ç›®æ·±åº¦/.test(lens.lens), JSON.stringify(lens));
}

function runMentorXGroupingTest() {
  const mentorReport = {
    mentors: [
      {
        mentorId: "fallback_paid_1",
        mentorName: "ä»˜è´¹å»ºè®® 1",
        company: "MentorX",
        mentorTitle: "ç®€åŽ†ç­–ç•¥ç»„",
        adviceItems: [
          makeItem("risk_group", {
            title: "è¯´æ˜ŽçŸ­æœŸç»åŽ†æ€§è´¨",
            action: "Mark the role as Internship or clarify the project period.",
            relatedProblemTags: ["short_tenure_unclear"],
            mentorSource: {
              mentorId: "fallback_paid_1",
              mentorName: "ä»˜è´¹å»ºè®® 1",
              company: "MentorX",
              mentorTitle: "ç®€åŽ†ç­–ç•¥ç»„",
            },
          }),
        ],
      },
      {
        mentorId: "fallback_free_1",
        mentorName: "å¯¼å¸ˆå»ºè®®",
        company: "MentorX",
        mentorTitle: "ç®€åŽ†ç­–ç•¥ç»„",
        adviceItems: [
          makeItem("summary_group", {
            title: "è¡¥ä¸Šç›®æ ‡å²—ä½åŽŸè¯",
            action: "Add Software Engineering to the Summary and connect it to project evidence.",
            targetSection: "summary",
            relatedProblemTags: ["missing_exact_job_title"],
            mentorSource: {
              mentorId: "fallback_free_1",
              mentorName: "å¯¼å¸ˆå»ºè®®",
              company: "MentorX",
              mentorTitle: "ç®€åŽ†ç­–ç•¥ç»„",
            },
          }),
        ],
      },
    ],
  };
  const result = curateMentorAdvicePlan({ ...makeContext(), mentorReport });
  const mentorXGroups = result.reportPageMentorGroups.filter((group) => group.company === "MentorX");
  assert.equal(mentorXGroups.length, 0, `expected no displayed MentorX group, got ${mentorXGroups.length}`);
  const displayedItems = result.reportPageMentorGroups.flatMap((group) => group.adviceItems || []);
  assert.ok(displayedItems.some((item) => item.adviceId === "risk_group"));
  assert.ok(displayedItems.some((item) => item.adviceId === "summary_group"));
  assert.ok(displayedItems.every((item) => item.sourceDisclosure !== "来源：MentorX 策略建议"));
}

function runAttributionModeTest() {
  const ubsSource = {
    mentorId: "ubs_1",
    mentorName: "Få¯¼å¸ˆ",
    company: "UBS",
    mentorTitle: "Associate Director",
  };
  const neurotechSource = {
    mentorId: "neuro_1",
    mentorName: "Uå¯¼å¸ˆ",
    company: "Neurotech",
    mentorTitle: "Founder & CEO",
  };
  const mentorReport = {
    mentors: [
      {
        ...ubsSource,
        adviceItems: [
          makeItem("verified_ubs", {
            title: "Quantify accounting impact",
            action: "Add scale, frequency, and output metrics to the accounting bullet.",
            relatedProblemTags: ["low_measurable_results"],
            mentorSource: ubsSource,
          }),
        ],
      },
      {
        ...neurotechSource,
        adviceItems: [
          makeItem("stitched_to_ubs", {
            title: "Rewrite experience evidence",
            action: "Rewrite one bullet with action, method, and deliverable.",
            relatedProblemTags: ["weak_experience_keyword_evidence"],
            originalMentorSource: neurotechSource,
            displayedMentorSource: ubsSource,
            mentorSource: neurotechSource,
          }),
        ],
      },
    ],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Accountant",
    problemTags: [
      { tag: "low_measurable_results", severity: "high" },
      { tag: "weak_experience_keyword_evidence", severity: "high" },
    ],
  }), mentorReport });
  const verified = result.curatedAdviceItems.find((item) => item.adviceId === "verified_ubs");
  const stitched = result.curatedAdviceItems.find((item) => item.adviceId === "stitched_to_ubs");
  assert.equal(verified.attributionMode, "verified_original");
  assert.equal(verified.sourceDisclosure, "来源：该导师建议");
  assert.equal(stitched.attributionMode, "stitched_lens");
  assert.equal(stitched.sourceDisclosure, "来源：MentorX 按该导师背景整理");
  assert.equal(stitched.originalMentorSource.company, "Neurotech");
  assert.equal(stitched.displayedMentorSource.company, "UBS");
  assert.equal(stitched.mentorSource.company, "UBS");
  const ubsGroup = result.reportPageMentorGroups.find((group) => group.company === "UBS");
  assert.ok(ubsGroup, "expected stitched advice to group under displayed UBS mentor");
  assert.ok(ubsGroup.adviceItems.some((item) => item.adviceId === "stitched_to_ubs"));
}

function runAccountantMentorDisplayFitTest() {
  const neurotechSource = {
    mentorId: "neuro_1",
    mentorName: "UÃ¥Â¯Â¼Ã¥Â¸Ë†",
    company: "Neurotech",
    mentorTitle: "Founder & CEO",
  };
  const mentorReport = {
    mentors: [
      {
        mentorId: "ubs_1",
        mentorName: "FÃ¥Â¯Â¼Ã¥Â¸Ë†",
        company: "UBS",
        mentorTitle: "Associate Director",
        adviceItems: [],
      },
      {
        mentorId: "barclays_1",
        mentorName: "ZÃ¥Â¯Â¼Ã¥Â¸Ë†",
        company: "Barclays",
        mentorTitle: "AVP",
        adviceItems: [],
      },
      {
        ...neurotechSource,
        adviceItems: [
          makeItem("neuro_accountant_positioning", {
            title: "Focus target role positioning",
            action: "Reorder Summary, Skills, and the first experience around Accountant evidence.",
            targetSection: "summary",
            relatedProblemTags: ["weak_target_role_alignment"],
            mentorSource: neurotechSource,
          }),
        ],
      },
    ],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Accountant",
    roleFamily: "accounting",
    problemTags: [{ tag: "weak_target_role_alignment", severity: "high" }],
  }), mentorReport });
  const item = result.curatedAdviceItems.find((entry) => entry.adviceId === "neuro_accountant_positioning");
  assert.ok(item, "expected accountant positioning advice");
  assert.equal(item.originalMentorSource.company, "Neurotech");
  assert.notEqual(item.displayedMentorSource.company, "Neurotech");
  assert.ok(["UBS", "Barclays", "MentorX"].includes(item.displayedMentorSource.company), item.displayedMentorSource.company);
  assert.ok(["stitched_lens", "mentorx_strategy"].includes(item.attributionMode), item.attributionMode);
  assert.ok(!/该导师建议/.test(item.sourceDisclosure), item.sourceDisclosure);
}

function runMentorXAttributionTest() {
  const mentorReport = {
    mentors: [{
      mentorId: "fallback",
      mentorName: "å¯¼å¸ˆå»ºè®®",
      company: "MentorX",
      mentorTitle: "ç®€åŽ†ç­–ç•¥ç»„",
      adviceItems: [
        makeItem("mentorx_strategy", {
          title: "Explain short tenure",
          action: "Clarify the role as Internship or scoped project.",
          relatedProblemTags: ["short_tenure_unclear"],
          mentorSource: {
            mentorId: "fallback",
            mentorName: "å¯¼å¸ˆå»ºè®®",
            company: "MentorX",
            mentorTitle: "ç®€åŽ†ç­–ç•¥ç»„",
          },
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    problemTags: [{ tag: "short_tenure_unclear", severity: "high" }],
  }), mentorReport });
  const item = result.curatedAdviceItems.find((entry) => entry.adviceId === "mentorx_strategy");
  assert.equal(item.attributionMode, "stitched_lens");
  assert.equal(item.sourceDisclosure, "来源：MentorX 按该导师背景整理");
  assert.ok(result.reportPageMentorGroups.every((group) => group.company !== "MentorX"));
}

function runMentorXFallbackCanStitchToExplainableMentorTest() {
  const mentorXSource = {
    mentorId: "mentorx_strategy",
    mentorName: "MentorX",
    company: "MentorX",
    mentorTitle: "简历策略组",
  };
  const ubsSource = {
    mentorId: "ubs_accounting_lens",
    mentorName: "F导师",
    company: "UBS",
    mentorTitle: "Associate Director",
  };
  const mentorReport = {
    mentors: [
      { ...ubsSource, adviceItems: [] },
      {
        ...mentorXSource,
        adviceItems: [
          makeItem("mentorx_impact", {
            title: "强化 bullet 的结果表达",
            action: "Add transaction volume, accuracy, and close cycle metrics to the accounting bullet.",
            coverageFamily: "impact_metrics",
            actionFamily: "experience_impact_metrics",
            targetSection: "Experience",
            source: "fallback",
            attributionMode: "mentorx_strategy",
            mentorSource: mentorXSource,
            originalMentorSource: mentorXSource,
          }),
        ],
      },
    ],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Accountant",
    problemTags: [{ tag: "low_measurable_results", severity: "high" }],
  }), mentorReport });
  const item = result.curatedAdviceItems.find((advice) => advice.adviceId === "mentorx_impact");
  assert.ok(item, "expected MentorX fallback item to be curated");
  assert.equal(item.displayedMentorSource.company, "UBS");
  assert.equal(item.attributionMode, "stitched_lens");
  assert.equal(item.sourceDisclosure, "来源：MentorX 按该导师背景整理");
  const ubsGroup = result.reportPageMentorGroups.find((group) => group.company === "UBS");
  assert.ok(ubsGroup?.adviceItems.some((advice) => advice.adviceId === "mentorx_impact"));
}

function runReportTitleDeduplicationTest() {
  const mentorXSource = {
    mentorId: "mentorx_strategy",
    mentorName: "MentorX",
    company: "MentorX",
    mentorTitle: "简历策略组",
  };
  const mentorReport = {
    mentors: [{
      ...mentorXSource,
      adviceItems: [
        makeItem("impact_a", {
          title: "强化 bullet 的结果表达",
          action: "Add measurable result numbers to the first bullet.",
          coverageFamily: "impact_metrics",
          actionFamily: "experience_impact_metrics",
          source: "fallback",
          mentorSource: mentorXSource,
        }),
        makeItem("impact_b", {
          title: "强化 bullet 的结果表达",
          action: "Add scale and frequency to the second bullet.",
          coverageFamily: "impact_metrics",
          actionFamily: "experience_impact_metrics",
          source: "fallback",
          mentorSource: mentorXSource,
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Network Operator",
    problemTags: [{ tag: "low_measurable_results", severity: "high" }],
  }), mentorReport });
  const reportTitles = result.reportPageMentorGroups.flatMap((group) => group.adviceItems.map((item) => item.title));
  assert.equal(reportTitles.length, new Set(reportTitles).size, reportTitles.join(" | "));
}

function runExternalMentorCoverageLimitTest() {
  const anyscaleSource = {
    mentorId: "anyscale_ml",
    mentorName: "G导师",
    company: "Anyscale",
    mentorTitle: "Staff Machine Learning Engineer",
  };
  const mentorReport = {
    mentors: [{
      ...anyscaleSource,
      adviceItems: [
        makeItem("ml_impact_a", {
          title: "强化 bullet 的结果表达",
          action: "Add accuracy and model evaluation metrics to the ML project bullet.",
          coverageFamily: "impact_metrics",
          actionFamily: "experience_impact_metrics",
          relatedProblemTags: ["low_measurable_results"],
          mentorSource: anyscaleSource,
        }),
        makeItem("ml_impact_b", {
          title: "补上成果数字和规模",
          action: "Add inference latency, throughput, and deployment scale to another ML bullet.",
          coverageFamily: "impact_metrics",
          actionFamily: "experience_impact_metrics",
          relatedProblemTags: ["low_measurable_results"],
          mentorSource: anyscaleSource,
        }),
        makeItem("ml_junior", {
          title: "把训练背景写成岗位证据",
          action: "Connect coursework and model evaluation projects to the MLE role.",
          coverageFamily: "junior_signal",
          actionFamily: "education_signal",
          targetSection: "skills",
          relatedProblemTags: ["education_details_missing"],
          mentorSource: anyscaleSource,
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Machine Learning Engineer Intern (MLE)",
    roleFamily: "machine_learning",
    problemTags: [
      { tag: "low_measurable_results", severity: "high" },
      { tag: "education_details_missing", severity: "medium" },
    ],
    jdText: "Machine Learning Engineer Intern using Python, model evaluation, deployment, and PyTorch.",
  }), mentorReport });
  const anyscaleGroup = result.reportPageMentorGroups.find((group) => group.company === "Anyscale");
  assert.ok(anyscaleGroup, "expected Anyscale group");
  const slotKeys = anyscaleGroup.adviceItems.map((item) => item.duplicateGroupKey || `${item.coverageFamily}:${item.targetSection}:${item.actionFamily}`);
  assert.equal(slotKeys.length, new Set(slotKeys).size, JSON.stringify(anyscaleGroup.adviceItems.map((item) => item.title)));
  assert.ok(anyscaleGroup.adviceItems.some((item) => item.coverageFamily === "junior_signal"), JSON.stringify(anyscaleGroup.adviceItems.map((item) => item.title)));
}

function runWeakDataMentorStitchGuardTest() {
  const mentorXSource = {
    mentorId: "mentorx_strategy",
    mentorName: "MentorX",
    company: "MentorX",
    mentorTitle: "简历策略组",
  };
  const dataMentor = {
    mentorId: "polarr_data",
    mentorName: "P导师",
    company: "Polarr/Facebook",
    mentorTitle: "Lead Data Scientist",
  };
  const baseMentorReport = (action) => ({
    mentors: [
      { ...dataMentor, adviceItems: [] },
      {
        ...mentorXSource,
        adviceItems: [
          makeItem("mentorx_generic_impact", {
            title: "强化 bullet 的结果表达",
            action,
            coverageFamily: "impact_metrics",
            actionFamily: "experience_impact_metrics",
            targetSection: "Experience",
            source: "fallback",
            attributionMode: "mentorx_strategy",
            mentorSource: mentorXSource,
            originalMentorSource: mentorXSource,
          }),
        ],
      },
    ],
  });

  const genericResult = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Pickup Support Specialist",
    problemTags: [{ tag: "low_measurable_results", severity: "high" }],
  }), mentorReport: baseMentorReport("Add quantity, frequency, and scale to the operations bullet.") });
  const genericItem = genericResult.curatedAdviceItems.find((item) => item.adviceId === "mentorx_generic_impact");
  assert.ok(["Amazon", "DHL"].includes(genericItem.displayedMentorSource.company), JSON.stringify(genericItem.displayedMentorSource));
  assert.equal(genericItem.attributionMode, "stitched_lens");

  const weakOpsToolingResult = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Pickup Support Specialist",
    problemTags: [{ tag: "weak_experience_keyword_evidence", severity: "high" }],
  }), mentorReport: baseMentorReport("Rewrite the bullet with pickup coordination, tracking dashboard, CRM, and dispatch plan delivery.") });
  const weakOpsToolingItem = weakOpsToolingResult.curatedAdviceItems.find((item) => item.adviceId === "mentorx_generic_impact");
  assert.ok(["Amazon", "DHL"].includes(weakOpsToolingItem.displayedMentorSource.company), JSON.stringify(weakOpsToolingItem.displayedMentorSource));
  assert.equal(weakOpsToolingItem.attributionMode, "stitched_lens");

  const dataToolingResult = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Marketing Specialist",
    problemTags: [{ tag: "low_measurable_results", severity: "high" }],
  }), mentorReport: baseMentorReport("Add Google Analytics dashboard, SQL query, and campaign conversion metrics to the bullet.") });
  const dataToolingItem = dataToolingResult.curatedAdviceItems.find((item) => item.adviceId === "mentorx_generic_impact");
  assert.ok(["Google", "Meta", "Polarr/Facebook"].includes(dataToolingItem.displayedMentorSource.company), JSON.stringify(dataToolingItem.displayedMentorSource));
  assert.equal(dataToolingItem.attributionMode, "stitched_lens");
}

function runFinanceAndNetworkDataMentorBlockTest() {
  const mentorXSource = {
    mentorId: "mentorx_strategy",
    mentorName: "MentorX",
    company: "MentorX",
    mentorTitle: "简历策略组",
  };
  const polarrData = {
    mentorId: "polarr_data",
    mentorName: "P导师",
    company: "Polarr/Facebook",
    mentorTitle: "Lead Data Scientist",
  };
  const ubsFinance = {
    mentorId: "ubs_finance",
    mentorName: "F导师",
    company: "UBS",
    mentorTitle: "Associate Director",
  };
  const financeResult = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Investment Banking Analyst",
    problemTags: [{ tag: "low_jd_keyword_match", severity: "high" }],
  }), mentorReport: {
    mentors: [
      { ...polarrData, adviceItems: [] },
      { ...ubsFinance, adviceItems: [] },
      {
        ...mentorXSource,
        adviceItems: [makeItem("ib_keyword_sql", {
          title: "把技能词写成项目证据",
          action: "Put SQL, Tableau, valuation, and pitch deck keywords into real investment banking project evidence.",
          coverageFamily: "keyword",
          actionFamily: "keyword_in_experience",
          source: "fallback",
          mentorSource: mentorXSource,
          originalMentorSource: mentorXSource,
          relatedProblemTags: ["low_jd_keyword_match"],
        })],
      },
    ],
  } });
  const financeItem = financeResult.curatedAdviceItems.find((item) => item.adviceId === "ib_keyword_sql");
  assert.notEqual(financeItem.displayedMentorSource.company, "Polarr/Facebook", JSON.stringify(financeItem.displayedMentorSource));

  const cbreDataFinance = {
    mentorId: "cbre_data_finance",
    mentorName: "W导师",
    company: "CBRE",
    mentorTitle: "Data & Financial Analyst",
  };
  const broadFinanceResult = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Investment Banking Analyst",
    problemTags: [{ tag: "low_jd_keyword_match", severity: "high" }, { tag: "repetitive_verbs", severity: "medium" }],
  }), mentorReport: {
    mentors: [
      { ...cbreDataFinance, adviceItems: [] },
      {
        ...mentorXSource,
        adviceItems: [
          makeItem("ib_generic_keyword", {
            title: "补齐经历里的关键词证据",
            action: "对照 Investment Banking Analyst JD，把核心关键词分配到 Summary、Skills 和 Experience bullet 中。",
            coverageFamily: "keyword",
            actionFamily: "keyword_in_experience",
            source: "fallback",
            mentorSource: mentorXSource,
            originalMentorSource: mentorXSource,
            relatedProblemTags: ["low_jd_keyword_match"],
          }),
          makeItem("ib_repetitive_verbs", {
            title: "替换重复动词",
            action: "把重复的 responsible for / helped with 改成更具体的动作动词。",
            coverageFamily: "business_data_context",
            actionFamily: "readability_structure",
            source: "fallback",
            mentorSource: mentorXSource,
            originalMentorSource: mentorXSource,
            relatedProblemTags: ["repetitive_verbs"],
          }),
        ],
      },
    ],
  } });
  const broadFinanceItems = broadFinanceResult.curatedAdviceItems.filter((item) => ["ib_generic_keyword", "ib_repetitive_verbs"].includes(item.adviceId));
  assert.ok(broadFinanceItems.length >= 2);
  for (const item of broadFinanceItems) {
    assert.notEqual(item.displayedMentorSource.company, "CBRE", JSON.stringify(item.displayedMentorSource));
  }

  const amazonVp = {
    mentorId: "amazon_vp",
    mentorName: "X导师",
    company: "Amazon",
    mentorTitle: "Vice President",
  };
  const broadNonFinanceResult = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Investment Banking Analyst",
    problemTags: [{ tag: "low_measurable_results", severity: "high" }],
  }), mentorReport: {
    mentors: [
      { ...amazonVp, adviceItems: [] },
      {
        ...mentorXSource,
        adviceItems: [makeItem("ib_generic_impact", {
          title: "补上规模、频率和效率",
          action: "为核心 bullet 补充处理量、频率、规模、效率、准确率、响应时间或节省成本。",
          coverageFamily: "impact_metrics",
          actionFamily: "impact_metrics",
          source: "fallback",
          mentorSource: mentorXSource,
          originalMentorSource: mentorXSource,
          relatedProblemTags: ["low_measurable_results"],
        })],
      },
    ],
  } });
  const broadImpactItem = broadNonFinanceResult.curatedAdviceItems.find((item) => item.adviceId === "ib_generic_impact");
  assert.notEqual(broadImpactItem.displayedMentorSource.company, "Amazon", JSON.stringify(broadImpactItem.displayedMentorSource));

  const networkResult = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "网络运营专员 Network Operator (Junior full-time)",
    problemTags: [{ tag: "weak_experience_keyword_evidence", severity: "high" }],
  }), mentorReport: {
    mentors: [
      { ...polarrData, adviceItems: [] },
      { ...cbreDataFinance, adviceItems: [] },
      {
        ...mentorXSource,
        adviceItems: [makeItem("network_evidence", {
          title: "补强经历里的动作和交付",
          action: "Rewrite the bullet with Zabbix, Nagios, Grafana, Wireshark, incident response, and troubleshooting runbook delivery.",
          coverageFamily: "experience_evidence",
          actionFamily: "experience_bullet_evidence",
          source: "fallback",
          mentorSource: mentorXSource,
          originalMentorSource: mentorXSource,
          relatedProblemTags: ["weak_experience_keyword_evidence"],
        })],
      },
    ],
  } });
  const networkItem = networkResult.curatedAdviceItems.find((item) => item.adviceId === "network_evidence");
  assert.ok(["Cisco", "Microsoft"].includes(networkItem.displayedMentorSource.company), JSON.stringify(networkItem.displayedMentorSource));

  const ambiguousNetworkResult = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "网络运营专员 Network Operator (Junior full-time)",
    roleProfile: {
      canonicalRole: "Network Operator",
      canonicalRoleFamily: "logistics_operations",
      roleFamily: "logistics_operations",
      functionCluster: "logistics_operations",
    },
    problemTags: [{ tag: "low_jd_keyword_match", severity: "high" }],
  }), mentorReport: {
    mentors: [{
      ...mentorXSource,
      adviceItems: [makeItem("ambiguous_network_keyword", {
        title: "整理 Skills 关键词",
        action: "把 Network Operator JD 的 network monitoring、incident response、TCP/IP 和 troubleshooting 放回真实经历。",
        coverageFamily: "keyword",
        actionFamily: "skills_keyword_ordering",
        source: "fallback",
        mentorSource: mentorXSource,
        originalMentorSource: mentorXSource,
        relatedProblemTags: ["low_jd_keyword_match"],
      })],
    }],
  } });
  const ambiguousNetworkItem = ambiguousNetworkResult.curatedAdviceItems.find((item) => item.adviceId === "ambiguous_network_keyword");
  assert.ok(["Cisco", "Microsoft"].includes(ambiguousNetworkItem.displayedMentorSource.company), JSON.stringify(ambiguousNetworkItem.displayedMentorSource));
}

function runRoleAwareMockMentorDisplayTest() {
  const mentorXSource = {
    mentorId: "mentorx_strategy",
    mentorName: "MentorX",
    company: "MentorX",
    mentorTitle: "简历策略组",
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "揽收支持专员（全职）",
    problemTags: [{ tag: "weak_experience_keyword_evidence", severity: "high" }],
  }), mentorReport: {
    mentors: [{
      ...mentorXSource,
      adviceItems: [makeItem("pickup_evidence", {
        title: "重写核心经历 bullet",
        action: "Rewrite the bullet with pickup coordination, dispatch scheduling, delivery operations, and exception handling deliverables.",
        coverageFamily: "experience_evidence",
        actionFamily: "experience_bullet_evidence",
        source: "fallback",
        mentorSource: mentorXSource,
        originalMentorSource: mentorXSource,
        relatedProblemTags: ["weak_experience_keyword_evidence"],
      })],
    }],
  } });
  const item = result.curatedAdviceItems.find((advice) => advice.adviceId === "pickup_evidence");
  assert.ok(["Amazon", "DHL"].includes(item.displayedMentorSource.company), JSON.stringify(item.displayedMentorSource));
  assert.equal(item.attributionMode, "stitched_lens");
  assert.equal(item.sourceDisclosure, "来源：MentorX 按该导师背景整理");

  const networkFamilies = [
    "impact_metrics",
    "keyword",
    "risk_explanation",
    "junior_signal",
    "experience_evidence",
    "positioning",
    "keyword",
    "experience_evidence",
    "experience_evidence",
  ];
  const networkResult = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "网络运营专员 Network Operator (Junior full-time)",
    roleProfile: {
      canonicalRole: "Network Operator",
      canonicalRoleFamily: "logistics_operations",
      roleFamily: "logistics_operations",
      functionCluster: "logistics_operations",
    },
    problemTags: [{ tag: "low_jd_keyword_match", severity: "high" }],
  }), mentorReport: {
    mentors: [{
      ...mentorXSource,
      adviceItems: networkFamilies.map((coverageFamily, index) => makeItem(`network_mock_${index}`, {
        title: `网络运营建议 ${index + 1}`,
        action: "把 Network Operator JD 的 network monitoring、incident response、TCP/IP 和 troubleshooting 放回真实经历。",
        coverageFamily,
        actionFamily: `network_action_${index}`,
        source: "fallback",
        mentorSource: mentorXSource,
        originalMentorSource: mentorXSource,
        relatedProblemTags: ["low_jd_keyword_match"],
      })),
    }],
  } });
  const networkCompanies = new Set(networkResult.reportPageMentorGroups.map((group) => group.company));
  assert.ok(networkCompanies.has("Cisco"), [...networkCompanies].join(","));
  assert.ok(networkCompanies.has("Microsoft"), [...networkCompanies].join(","));
  assert.ok(!networkCompanies.has("Amazon") && !networkCompanies.has("DHL"), [...networkCompanies].join(","));
}

function runUncoveredProblemFillTest() {
  const mentorReport = {
    mentors: [{
      mentorId: "mx",
      mentorName: "MentorX",
      company: "MentorX",
      mentorTitle: "简历策略组",
      adviceItems: [
        makeItem("base_summary", {
          title: "补上目标岗位原词",
          action: "Add Software Engineer to Summary.",
          targetSection: "summary",
          relatedProblemTags: ["missing_exact_job_title"],
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Software Engineer",
    problemTags: [
      { tag: "missing_exact_job_title", severity: "high" },
      { tag: "missing_github_link", severity: "medium" },
      { tag: "missing_exp_location", severity: "low" },
      { tag: "repetitive_verbs", severity: "low" },
    ],
  }), mentorReport });
  const covered = new Set(result.curatedAdviceItems.flatMap((item) => item.relatedProblemTags || []));
  assert.ok(covered.has("missing_github_link"), [...covered].join(","));
  assert.ok(covered.has("missing_exp_location"), [...covered].join(","));
  assert.ok(covered.has("repetitive_verbs"), [...covered].join(","));
}

function runSameMentorSoftCapRedistributionTest() {
  const amazon = {
    mentorId: "amazon_marketing",
    mentorName: "A导师",
    company: "Amazon",
    mentorTitle: "Marketing Manager",
  };
  const google = {
    mentorId: "google_growth",
    mentorName: "G导师",
    company: "Google",
    mentorTitle: "Growth Marketing Manager",
  };
  const items = [
    ["mkt_1", "positioning", "summary_positioning", "summary"],
    ["mkt_2", "keyword", "skills_keyword_ordering", "skills"],
    ["mkt_3", "keyword", "keyword_in_experience", "experience"],
    ["mkt_4", "impact_metrics", "experience_impact_metrics", "experience"],
    ["mkt_5", "junior_signal", "education_signal", "skills"],
    ["mkt_6", "risk_explanation", "risk_explanation", "experience"],
    ["mkt_7", "experience_evidence", "experience_bullet_evidence", "experience"],
  ].map(([id, coverageFamily, actionFamily, targetSection]) => makeItem(id, {
    title: `Marketing advice ${id}`,
    action: `Improve campaign, CRM, content, analytics, or marketing deliverable evidence for ${id}.`,
    coverageFamily,
    actionFamily,
    targetSection,
    mentorSource: amazon,
    relatedProblemTags: [id],
  }));
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Marketing Specialist",
    problemTags: items.map((item) => ({ tag: item.relatedProblemTags[0], severity: "medium" })),
  }), mentorReport: {
    mentors: [
      { ...amazon, adviceItems: items },
      { ...google, adviceItems: [] },
    ],
  } });
  const marketingGroups = result.reportPageMentorGroups.filter((group) => /marketing/i.test(`${group.mentorTitle || ""} ${group.mentorSubtitle || ""}`));
  assert.ok(marketingGroups.length >= 2, `expected secondary marketing mentor group, got ${result.reportPageMentorGroups.map((group) => group.company).join(",")}`);
  assert.ok(marketingGroups.every((group) => group.adviceItems.length <= 5), `expected soft cap redistribution, got ${marketingGroups.map((group) => `${group.company}:${group.adviceItems.length}`).join(",")}`);
  assert.ok(new Set(marketingGroups.map((group) => group.company)).size >= 2, `expected multiple companies, got ${marketingGroups.map((group) => group.company).join(",")}`);
}

function runMentorXItemChipsDoNotInheritGroupLensTest() {
  const mentorReport = {
    mentors: [{
      mentorId: "mentorx",
      mentorName: "Ã¥Â¯Â¼Ã¥Â¸Ë†Ã¥Â»ÂºÃ¨Â®Â®",
      company: "MentorX",
      mentorTitle: "Ã§Â®â‚¬Ã¥Å½â€ Ã§Â­â€“Ã§â€¢Â¥Ã§Â»â€ž",
      adviceItems: [
        makeItem("collaboration_delivery", {
          title: "Ã§ÂªÂÃ¥â€¡ÂºÃ¨Â·Â¨Ã©Æ’Â¨Ã©â€”Â¨Ã¥ÂÂÃ¤Â½Å“Ã¤ÂºÂ¤Ã¤Â»Ëœ",
          action: "Rewrite one experience as collaborator, action, and deliverable.",
          relatedProblemTags: ["weak_experience_keyword_evidence"],
        }),
        makeItem("short_tenure_boundary", {
          title: "Ã¨Â¯Â´Ã¦ËœÅ½Ã§Å¸Â­Ã¦Å“Å¸Ã§Â»ÂÃ¥Å½â€ Ã¦â‚¬Â§Ã¨Â´Â¨",
          action: "Clarify whether the short experience was an Internship or scoped project.",
          relatedProblemTags: ["short_tenure_unclear"],
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    problemTags: [
      { tag: "weak_experience_keyword_evidence", severity: "high" },
      { tag: "short_tenure_unclear", severity: "high" },
    ],
  }), mentorReport });
  const collaboration = result.curatedAdviceItems.find((item) => item.adviceId === "collaboration_delivery");
  const risk = result.curatedAdviceItems.find((item) => item.adviceId === "short_tenure_boundary");
  assert.deepEqual(collaboration.evidence, ["经历证据", "推进动作", "交付物"]);
  assert.deepEqual(risk.evidence, ["经历性质", "项目边界", "稳定性风险"]);
}

function runReportProblemCoverageWithoutHardCapTest() {
  const mentorReport = {
    mentors: [
      {
        mentorId: "google",
        mentorName: "Google Mentor",
        company: "Google",
        mentorTitle: "Software Engineer",
        adviceItems: [
          makeItem("summary_role", { title: "Add target role to Summary", action: "Add Software Engineer to the first Summary sentence.", targetSection: "summary", relatedProblemTags: ["missing_exact_job_title"], mentorId: "google", company: "Google", mentorTitle: "Software Engineer" }),
          makeItem("api_keywords", { title: "Add API JD keywords", action: "Place backend API keywords into Skills.", targetSection: "skills", relatedProblemTags: ["low_jd_keyword_match"], mentorId: "google", company: "Google", mentorTitle: "Software Engineer" }),
          makeItem("backend_evidence", { title: "Rewrite backend bullet", action: "Rewrite backend experience with action, method, and deliverable.", relatedProblemTags: ["weak_experience_keyword_evidence"], mentorId: "google", company: "Google", mentorTitle: "Software Engineer" }),
        ],
      },
      {
        mentorId: "amazon",
        mentorName: "Amazon Mentor",
        company: "Amazon",
        mentorTitle: "Recruiter",
        adviceItems: [
          makeItem("impact_latency", { title: "Quantify latency impact", action: "Add latency, reliability, or user impact metrics.", relatedProblemTags: ["low_measurable_results"], mentorId: "amazon", company: "Amazon", mentorTitle: "Recruiter" }),
          makeItem("project_depth", { title: "Show deployment depth", action: "Explain deployment, ownership, and production result.", relatedProblemTags: ["weak_experience_keyword_evidence"], mentorId: "amazon", company: "Amazon", mentorTitle: "Recruiter" }),
          makeItem("keyword_experience", { title: "Embed keywords in project", action: "Put JD keywords into one project bullet with evidence.", relatedProblemTags: ["missing_priority_keywords"], mentorId: "amazon", company: "Amazon", mentorTitle: "Recruiter" }),
        ],
      },
      {
        mentorId: "mentorx",
        mentorName: "MentorX",
        company: "MentorX",
        mentorTitle: "Ã§Â®â‚¬Ã¥Å½â€ Ã§Â­â€“Ã§â€¢Â¥Ã§Â»â€ž",
        adviceItems: [
          makeItem("short_tenure", { title: "Explain internship period", action: "Clarify whether the short experience was an Internship or scoped project.", relatedProblemTags: ["short_tenure_unclear"] }),
          makeItem("education_signal", { title: "Use coursework as junior signal", action: "Connect coursework, project deliverables, and Software Engineer ability.", relatedProblemTags: ["education_coursework_weak"] }),
          makeItem("section_weight", { title: "Reweight sections", action: "Put the most relevant full-time or project experience before weaker content.", relatedProblemTags: ["weak_section_order"] }),
          makeItem("collaboration_delivery", { title: "Show collaboration delivery", action: "Write collaborator, action, and deliverable for one experience.", relatedProblemTags: ["weak_experience_keyword_evidence"] }),
        ],
      },
    ],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    problemTags: [
      { tag: "low_jd_keyword_match", severity: "critical" },
      { tag: "missing_priority_keywords", severity: "high" },
      { tag: "weak_experience_keyword_evidence", severity: "high" },
      { tag: "low_measurable_results", severity: "medium" },
      { tag: "short_tenure_unclear", severity: "medium" },
      { tag: "education_coursework_weak", severity: "medium" },
      { tag: "missing_exact_job_title", severity: "medium" },
    ],
  }), mentorReport });
  assert.ok(result.curatedAdviceItems.length >= 7, `expected problem coverage advice, got ${result.curatedAdviceItems.length}`);
  assert.ok(result.curatedAdviceItems.filter((item) => item.coverageFamily === "keyword").length <= 4);
  const visibleCount = result.reportPageMentorGroups.reduce((sum, group) => sum + group.adviceItems.length, 0);
  assert.ok(visibleCount >= result.curatedAdviceItems.length, `expected all curated advice to remain visible, got ${visibleCount}/${result.curatedAdviceItems.length}`);
  const visibleExactKeys = result.reportPageMentorGroups.flatMap((group) => group.adviceItems.map((item) => `${item.title}|${item.action}`));
  assert.equal(visibleExactKeys.length, new Set(visibleExactKeys).size, "expected no exact duplicate advice cards");
}

function runSoftwareLensConsistencyTest() {
  const lens = inferMentorGroupLens([
    makeItem("positioning", {
      title: "Focus target role positioning",
      action: "Reorder Summary, Skills, and the first experience around Software Engineering.",
      coverageFamily: "positioning",
      displayPriority: 120,
      targetSection: "summary",
    }),
  ], { company: "Anyscale", mentorTitle: "Staff Machine Learning Engineer" }, "Software Engineer");
  assert.ok(!/ä¸šåŠ¡|é‡‘èž|æ•°æ®/.test(lens.lens), JSON.stringify(lens));
}

function runAccountantRoleConsistencyTest() {
  const mentorReport = {
    mentors: [{
      mentorId: "barclays",
      mentorName: "Bank Mentor",
      company: "Barclays",
      mentorTitle: "AVP",
      adviceItems: [
        makeItem("accountant_keyword", {
          title: "æ•´ç† Skills å…³é”®è¯",
          action: "å°†communicationç­‰è½¯æŠ€èƒ½å…³é”®è¯è¡¥å……è‡³ç®€åŽ†skills/advantageæ¿å—ï¼›é’ˆå¯¹riskå’Œfinanceæ–¹å‘å¤šæœé›†JDï¼Œä½¿ç”¨JobScanå·¥å…·åšå…³é”®è¯åŒ¹é…åº¦æ£€æµ‹ã€‚",
          targetSection: "skills",
          evidence: ["å²—ä½å®šä½", "å¼€å¤´ä¸»çº¿", "ç›®æ ‡å²—ä½"],
          relatedProblemTags: ["low_jd_keyword_match"],
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "å…¨èŒä¼šè®¡å¸ˆAccountant",
    problemTags: [{ tag: "low_jd_keyword_match", severity: "high" }],
  }), mentorReport });
  const item = result.curatedAdviceItems[0];
  assert.ok(!/riskå’Œfinanceæ–¹å‘|risk\/financeæ–¹å‘|é£ŽæŽ§æ–¹å‘/.test(item.action), item.action);
  assert.equal(item.coverageFamily, "keyword");
  assert.ok(/JD|ATS|Skills/.test(item.evidence.join(" ")), item.evidence.join(" "));
}

function runCrossRoleDirectionSanitizerTest() {
  const mentorReport = {
    mentors: [{
      mentorId: "mixed",
      mentorName: "Mixed Mentor",
      company: "MentorX",
      mentorTitle: "Resume Mentor",
      adviceItems: [
        makeItem("mixed_roles", {
          title: "è°ƒæ•´ç»åŽ†æ–¹å‘",
          currentDiagnosis: "è¿™æ®µå†…å®¹æ›´åƒ DAå²—ä½ æˆ– design roleï¼Œä¸åƒå½“å‰ç›®æ ‡ã€‚",
          action: "ä¸è¦æŒ‰ software engineer role æˆ– finance direction å†™ï¼Œæ”¹æˆæœåŠ¡ç›®æ ‡å²—ä½çš„ç»åŽ†è¯æ®ã€‚",
          relatedProblemTags: ["weak_target_role_alignment"],
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Marketing Specialist",
    problemTags: [{ tag: "weak_target_role_alignment", severity: "high" }],
  }), mentorReport });
  const text = result.curatedAdviceItems.map((item) => `${item.currentDiagnosis} ${item.action}`).join(" ");
  assert.ok(!/DAå²—ä½|design role|software engineer role|finance direction/i.test(text), text);
  assert.ok(/Marketing Specialist/.test(text), text);
}

function runDictionaryWideRoleSanitizerTest() {
  const roleDictionary = require("../public/ats_role_dictionary.json").roles || [];
  assert.ok(roleDictionary.length >= 500, `expected 500+ dictionary roles, got ${roleDictionary.length}`);
  const mentorReport = {
    mentors: [{
      mentorId: "dictionary",
      mentorName: "Dictionary Mentor",
      company: "MentorX",
      mentorTitle: "Resume Mentor",
      adviceItems: [
        makeItem("dictionary_roles", {
          title: "æ ¡å‡†å²—ä½æ–¹å‘",
          currentDiagnosis: "è¿™æ®µå†™æ³•æ›´åƒ 2D Animator role æˆ– Architectural Designer positionã€‚",
          action: "ä¸è¦æŒ‰ 3D Artist role æˆ– Account Executive position å†™ï¼Œæ”¹æˆç›®æ ‡å²—ä½è¯æ®ã€‚",
          relatedProblemTags: ["weak_target_role_alignment"],
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Marketing Specialist",
    problemTags: [{ tag: "weak_target_role_alignment", severity: "high" }],
  }), mentorReport });
  const text = result.curatedAdviceItems.map((item) => `${item.currentDiagnosis} ${item.action}`).join(" ");
  assert.ok(!/2D Animator role|Architectural Designer position|3D Artist role|Account Executive position/i.test(text), text);
  assert.ok(/Marketing Specialist/.test(text), text);
}

function runAllowedRoleDirectionTest() {
  const mentorReport = {
    mentors: [{
      mentorId: "software",
      mentorName: "Software Mentor",
      company: "Google",
      mentorTitle: "Software Engineer",
      adviceItems: [
        makeItem("software_role", {
          title: "Strengthen software role positioning",
          action: "Keep the Software Engineer role wording in Summary and project bullets.",
          relatedProblemTags: ["weak_target_role_alignment"],
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({ jobTitle: "Software Engineer" }), mentorReport });
  const text = result.curatedAdviceItems.map((item) => `${item.title} ${item.action}`).join(" ");
  assert.ok(/Software Engineer role/.test(text), text);
}

function runFinanceMentorImpactLensTest() {
  const lens = inferMentorGroupLens([
    makeItem("impact", {
      title: "å¼ºåŒ– bullet çš„ç»“æžœè¡¨è¾¾",
      action: "Add quantity, frequency, scale, efficiency, or cost savings to the bullet.",
      coverageFamily: "impact_metrics",
      displayPriority: 115,
      targetSection: "experience",
    }),
  ], { company: "UBS", mentorTitle: "Associate Director" }, "å…¨èŒä¼šè®¡å¸ˆAccountant");
  assert.ok(/成果|量化/.test(lens.lens), JSON.stringify(lens));
}

function runRoleConsistencyTest() {
  const mentorReport = {
    mentors: [{
      mentorId: "m1",
      mentorName: "Finance Mentor",
      company: "BlackRock",
      mentorTitle: "Quantitative Researcher",
      adviceItems: [
        makeItem("finance_mixed", {
          title: "æŠŠå…³é”®è¯åµŒå…¥ç»åŽ† bullet",
          currentDiagnosis: "ç›®æ ‡é‡‘èžå²—ä½å…³é”®è¯ä¸è¶³ã€‚",
          action: "æ¢³ç†é¡¹ç›®ä¸­çš„å¯è¿ç§»æŠ€èƒ½ï¼Œä¸Žç›®æ ‡é‡‘èžå²—ä½çš„ JD å…³é”®è¯å¯¹ç…§ã€‚",
          relatedProblemTags: ["low_jd_keyword_match"],
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext(), mentorReport });
  const text = result.curatedAdviceItems.map((item) => `${item.currentDiagnosis} ${item.action}`).join(" ");
  assert.ok(!/ç›®æ ‡é‡‘èžå²—ä½|é‡‘èžå²—ä½/.test(text), text);
  assert.ok(/Software Engineer/.test(text), text);
}

function runMachineLearningSupplementRoleAwarenessTest() {
  const mentorReport = {
    mentors: [{
      mentorId: "mx",
      mentorName: "MentorX",
      company: "MentorX",
      mentorTitle: "Resume Mentor",
      adviceItems: [
        makeItem("mle_base", {
          title: "è¡¥ä¸Šç›®æ ‡å²—ä½åŽŸè¯",
          action: "Add Machine Learning Engineer Intern (MLE) to Summary.",
          targetSection: "summary",
          relatedProblemTags: ["weak_target_role_alignment"],
          mentorId: "mx",
          company: "MentorX",
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Machine Learning Engineer Intern (MLE)",
    roleFamily: "machine_learning",
    problemTags: [
      { tag: "weak_target_role_alignment", severity: "high" },
      { tag: "weak_experience_keyword_evidence", severity: "high" },
    ],
    jdText: "Machine Learning Engineer Intern role using Python, PyTorch, model evaluation, data processing, and deployment.",
  }), mentorReport });
  const text = result.curatedAdviceItems.map((item) => `${item.title} ${item.currentDiagnosis} ${item.action}`).join(" ");
  assert.ok(/Python|PyTorch|TensorFlow|æ¨¡åž‹|è¯„ä¼°|éƒ¨ç½²|model|evaluation|deployment/i.test(text), text);
  assert.ok(!/Excel|æŠ¥è¡¨|å¯¹è´¦|åˆè§„|ä¼šè®¡|reconciliation|month.?end/i.test(text), text);
}

function runRoleProfileTaxonomyTest() {
  const mle = buildRoleProfileFromContext({
    targetRole: "Machine Learning Engineer Intern (MLE)",
    internalAtsResult: {
      jobTitle: "Machine Learning Engineer Intern (MLE)",
      jdText: "Python, PyTorch, model evaluation, model deployment.",
    },
  });
  assert.equal(mle.canonicalRoleFamily, "machine_learning");
  assert.equal(mle.functionCluster, "machine_learning");
  assert.ok(mle.skillClusters.includes("model_evaluation"), JSON.stringify(mle));
  assert.ok(mle.forbiddenDriftClusters.includes("finance"), JSON.stringify(mle));

  const accountant = buildRoleProfileFromContext({
    targetRole: "Accountant",
    internalAtsResult: {
      jobTitle: "Accountant",
      jdText: "general ledger, reconciliation, financial statements",
    },
  });
  assert.equal(accountant.canonicalRoleFamily, "accounting");
  assert.equal(accountant.functionCluster, "accounting");
  assert.ok(accountant.skillClusters.includes("financial_reporting"), JSON.stringify(accountant));
  assert.ok(!accountant.skillClusters.includes("machine_learning"), JSON.stringify(accountant));
}

function runMachineLearningFinanceMentorDriftTest() {
  const mentorReport = {
    mentors: [{
      mentorId: "ubs",
      mentorName: "Finance Mentor",
      company: "UBS",
      mentorTitle: "Associate Director",
      adviceItems: [
        makeItem("ubs_mle", {
          title: "å¼ºåŒ– bullet çš„ç»“æžœè¡¨è¾¾",
          action: "Add measurable model evaluation or deployment result to the project bullet.",
          relatedProblemTags: ["low_measurable_results"],
          mentorId: "ubs",
          company: "UBS",
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext({
    jobTitle: "Machine Learning Engineer Intern (MLE)",
    roleFamily: "machine_learning",
    problemTags: [{ tag: "low_measurable_results", severity: "high" }],
    jdText: "Machine Learning Engineer Intern with Python, model training, evaluation, and deployment.",
  }), mentorReport });
  const item = result.curatedAdviceItems.find((advice) => advice.adviceId === "ubs_mle");
  assert.ok(item, "expected UBS source advice to remain available for audit");
  assert.notEqual(item.displayedMentorSource?.company, "UBS", JSON.stringify(item));
  assert.ok(["Google", "OpenAI", "Anyscale", "Apple", "MentorX"].includes(item.displayedMentorSource?.company), JSON.stringify(item));
}

function runGenericTitleDiversificationTest() {
  const mentorReport = {
    mentors: [{
      mentorId: "m1",
      mentorName: "Mentor 1",
      company: "MentorX",
      mentorTitle: "Resume Mentor",
      adviceItems: [
        makeItem("generic_exp", {
          title: "æ”¹å†™å·¥ä½œç»åŽ† bullet",
          action: "Rewrite one bullet with action, method, and deliverable.",
          relatedProblemTags: ["weak_experience_keyword_evidence"],
        }),
        makeItem("generic_kw", {
          title: "æ”¹å†™å·¥ä½œç»åŽ† bullet",
          action: "Embed JD keywords into real project evidence.",
          relatedProblemTags: ["low_jd_keyword_match"],
        }),
        makeItem("generic_weight", {
          title: "æ”¹å†™å·¥ä½œç»åŽ† bullet",
          action: "Give the most relevant experience one or two more bullets.",
          relatedProblemTags: ["weak_section_order"],
        }),
      ],
    }],
  };
  const result = curateMentorAdvicePlan({ ...makeContext(), mentorReport });
  const titles = result.curatedAdviceItems
    .filter((item) => /^generic_/.test(item.adviceId))
    .map((item) => item.title);
  assert.ok(titles.length >= 2, titles.join(", "));
  assert.ok(new Set(titles).size > 1, titles.join(", "));
  assert.ok(titles.every((title) => title !== "改写工作经历 bullet"), titles.join(", "));
}

function roleFallbackTextFor(role) {
  const internalAtsResult = {
    jobTitle: role,
    problemTags: [
      "low_jd_keyword_match",
      "weak_experience_keyword_evidence",
      "low_measurable_results",
      "education_details_missing",
      "short_tenure_unclear",
    ],
  };
  const roleProfile = buildRoleProfileFromContext({ targetRole: role, internalAtsResult });
  const lexicon = buildRoleLexicon(roleProfile);
  const { fallbackAdviceItems, fallbackCoverageSummary } = buildRoleAwareFallbackAdvice({
    internalAtsResult,
    roleProfile,
    targetCount: 9,
  });
  return {
    roleProfile,
    lexicon,
    fallbackAdviceItems,
    fallbackCoverageSummary,
    text: fallbackAdviceItems.map((item) => `${item.title} ${item.currentDiagnosis} ${item.action}`).join("\n"),
  };
}

function runRoleAwareFallbackWordingTest() {
  const mle = roleFallbackTextFor("Machine Learning Engineer Intern (MLE)");
  assert.ok(mle.fallbackAdviceItems.length >= 7 && mle.fallbackAdviceItems.length <= 9);
  assert.ok(/model|python|pytorch|tensorflow|evaluation|deployment|inference/i.test(mle.text), mle.text);
  assert.ok(!/accounts payable|accounts receivable|GAAP|month-end close/i.test(mle.text), mle.text);

  const marketing = roleFallbackTextFor("Marketing Specialist");
  assert.ok(/campaign|lead|analytics|crm|google analytics|hubspot|content/i.test(marketing.text), marketing.text);
  assert.ok(!/general ledger|journal entries|GAAP|month-end close/i.test(marketing.text), marketing.text);

  const network = roleFallbackTextFor("Network Operator");
  assert.ok(/network monitoring|troubleshooting|routing|tcp\/ip|incident|wireshark|uptime/i.test(network.text), network.text);
  assert.ok(!/campaign brief|content calendar|accounts payable|GAAP/i.test(network.text), network.text);

  const misclassifiedNetworkProfile = {
    targetRole: "网络运营专员 Network Operator (Junior full-time)",
    canonicalRole: "Network Operator",
    canonicalRoleFamily: "logistics_operations",
    functionCluster: "operations",
    roleDictionaryEntry: { canonical_role: "Pickup Support Specialist" },
  };
  const misclassifiedNetworkText = buildRoleAwareFallbackAdvice({
    internalAtsResult: {
      jobTitle: "网络运营专员 Network Operator (Junior full-time)",
      problemTags: ["low_jd_keyword_match", "weak_experience_keyword_evidence", "low_measurable_results"],
    },
    roleProfile: misclassifiedNetworkProfile,
    targetCount: 7,
  }).fallbackAdviceItems.map((item) => `${item.title} ${item.action}`).join("\n");
  assert.ok(/network monitoring|incident response|tcp\/ip|wireshark|uptime|noc/i.test(misclassifiedNetworkText), misclassifiedNetworkText);
  assert.ok(!/pickup|dispatch|route planning|delivery status|last-mile/i.test(misclassifiedNetworkText), misclassifiedNetworkText);

  const accountant = roleFallbackTextFor("Accountant");
  assert.ok(/reporting|reconciliation|GAAP|general ledger|journal entries|financial statements/i.test(accountant.text), accountant.text);
  assert.ok(!/model deployment|inference service|campaign brief|investment memo|valuation model/i.test(accountant.text), accountant.text);
}

function runDictionaryFallbackCoverageSampleTest() {
  const roles = require("../public/ats_role_dictionary.json").roles || [];
  const sample = roles.slice(0, 30);
  assert.ok(sample.length >= 30, "expected at least 30 dictionary roles for fallback coverage sample");
  for (const role of sample) {
    const targetRole = role.canonical_role || role.position_title_original;
    const roleProfile = buildRoleProfileFromContext({ targetRole, internalAtsResult: { jobTitle: targetRole, jdText: "" } });
    const lexicon = buildRoleLexicon(roleProfile);
    assert.ok(lexicon.roleLabel, `missing role label for ${targetRole}`);
    assert.ok(lexicon.roleSpecificTerms.length >= 3, `not enough role terms for ${targetRole}: ${lexicon.roleSpecificTerms.join(", ")}`);
  }
}

function runPaidFallbackRichnessWithEmptyRetrievalTest() {
  const internalAtsResult = {
    jobTitle: "Network Operator",
    problemTags: [
      "low_jd_keyword_match",
      "weak_experience_keyword_evidence",
      "low_measurable_results",
      "education_details_missing",
      "short_tenure_unclear",
    ],
    retrievalQuery: {
      jobTitle: "Network Operator",
      problemTags: [
        "low_jd_keyword_match",
        "weak_experience_keyword_evidence",
        "low_measurable_results",
        "education_details_missing",
        "short_tenure_unclear",
      ],
    },
  };
  const candidates = [];
  Object.defineProperty(candidates, "debug", {
    enumerable: false,
    value: {
      retrievalQuery: internalAtsResult.retrievalQuery,
      strictCandidates: 0,
      fallbackCandidates: 0,
    },
  });
  const freePlan = selectFreeMentorPlan(candidates, internalAtsResult);
  const premiumPlan = selectPremiumMentorPlan(candidates, internalAtsResult, freePlan);
  const paidItems = premiumPlan.flatMap((mentor) => mentor.adviceItems || []);
  assert.ok(paidItems.length >= 7 && paidItems.length <= 12, `expected complete fallback report, got ${paidItems.length}`);
  const visibleText = paidItems.map((item) => `${item.title} ${item.action || item.actionSummary}`).join("\n");
  assert.ok(/network monitoring|incident|troubleshooting|wireshark|uptime|tcp\/ip/i.test(visibleText), visibleText);
  assert.ok(!/accounts payable|campaign brief|content calendar|GAAP/i.test(visibleText), visibleText);
}

async function runRetrievalStatusWrapperTest() {
  const okResult = await retrieveMentorAdviceWithStatus({}, {
    retrieveImpl: async () => {
      const candidates = [{ adviceId: "a1" }];
      Object.defineProperty(candidates, "debug", {
        enumerable: false,
        value: { strictCandidates: 1, fallbackCandidates: 0, rawRows: 10, eligibleRows: 8 },
      });
      return candidates;
    },
  });
  assert.equal(okResult.status.retrievalStatus, "ok");
  assert.equal(okResult.status.candidateCount, 1);
  assert.equal(okResult.status.strictCandidateCount, 1);

  const emptyResult = await retrieveMentorAdviceWithStatus({}, { retrieveImpl: async () => [] });
  assert.equal(emptyResult.status.retrievalStatus, "empty");
  assert.equal(emptyResult.status.candidateCount, 0);

  const error = new Error("connect EACCES");
  error.code = "EACCES";
  const errorResult = await retrieveMentorAdviceWithStatus({}, { retrieveImpl: async () => { throw error; } });
  assert.equal(errorResult.status.retrievalStatus, "error");
  assert.equal(errorResult.status.retrievalErrorCode, "EACCES");
  assert.equal(errorResult.candidates.length, 0);
}

async function main() {
  runKeywordCapsTest();
  runResultDistributionTest();
  runReportRichnessTest();
  runMentorLensTest();
  runMentorXGroupingTest();
  runAttributionModeTest();
  runAccountantMentorDisplayFitTest();
  runMentorXAttributionTest();
  runMentorXFallbackCanStitchToExplainableMentorTest();
  runReportTitleDeduplicationTest();
  runExternalMentorCoverageLimitTest();
  runWeakDataMentorStitchGuardTest();
  runFinanceAndNetworkDataMentorBlockTest();
  runRoleAwareMockMentorDisplayTest();
  runUncoveredProblemFillTest();
  runSameMentorSoftCapRedistributionTest();
  runMentorXItemChipsDoNotInheritGroupLensTest();
  runReportProblemCoverageWithoutHardCapTest();
  runSoftwareLensConsistencyTest();
  runAccountantRoleConsistencyTest();
  runCrossRoleDirectionSanitizerTest();
  runDictionaryWideRoleSanitizerTest();
  runAllowedRoleDirectionTest();
  runFinanceMentorImpactLensTest();
  runRoleConsistencyTest();
  runRoleProfileTaxonomyTest();
  runMachineLearningSupplementRoleAwarenessTest();
  runMachineLearningFinanceMentorDriftTest();
  runGenericTitleDiversificationTest();
  runRoleAwareFallbackWordingTest();
  runDictionaryFallbackCoverageSampleTest();
  runPaidFallbackRichnessWithEmptyRetrievalTest();
  await runRetrievalStatusWrapperTest();
  console.log("advice curator tests passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
