"use strict";

const assert = require("assert");
const {
  curateMentorAdvicePlan,
  inferMentorGroupLens,
} = require("../services/adviceCurator");
const { buildRoleProfileFromContext } = require("../src/ats/role-profile");

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
  assert.equal(mentorXGroups.length, 1, `expected one MentorX group, got ${mentorXGroups.length}`);
  assert.equal(mentorXGroups[0].companyLogo, "/logo/MentorX.png");
  assert.ok(mentorXGroups[0].adviceItems.length >= 2);
  assert.ok(mentorXGroups[0].adviceItems.some((item) => item.adviceId === "risk_group"));
  assert.ok(mentorXGroups[0].adviceItems.some((item) => item.adviceId === "summary_group"));
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
  assert.equal(verified.sourceDisclosure, "æ¥æºï¼šè¯¥å¯¼å¸ˆå»ºè®®");
  assert.equal(stitched.attributionMode, "stitched_lens");
  assert.equal(stitched.sourceDisclosure, "æ¥æºï¼šMentorX æŒ‰è¯¥å¯¼å¸ˆèƒŒæ™¯æ•´ç†");
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
  assert.ok(!/Ã¨Â¯Â¥Ã¥Â¯Â¼Ã¥Â¸Ë†Ã¥Â»ÂºÃ¨Â®Â®|è¯¥å¯¼å¸ˆå»ºè®®/.test(item.sourceDisclosure), item.sourceDisclosure);
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
  assert.equal(item.attributionMode, "mentorx_strategy");
  assert.equal(item.sourceDisclosure, "æ¥æºï¼šMentorX ç­–ç•¥å»ºè®®");
  assert.equal(result.reportPageMentorGroups[0].attributionMode, "mentorx_strategy");
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
  assert.deepEqual(collaboration.evidence, ["ç»åŽ†è¯æ®", "æŽ¨è¿›åŠ¨ä½œ", "äº¤ä»˜ç‰©"]);
  assert.deepEqual(risk.evidence, ["ç»åŽ†æ€§è´¨", "é¡¹ç›®è¾¹ç•Œ", "ç¨³å®šæ€§é£Žé™©"]);
}

function runReportRichnessTargetRangeTest() {
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
  assert.ok(result.curatedAdviceItems.length >= 7 && result.curatedAdviceItems.length <= 9, `expected 7-9 curated items, got ${result.curatedAdviceItems.length}`);
  assert.ok(result.curatedAdviceItems.filter((item) => item.coverageFamily === "keyword").length <= 2);
  assert.ok(result.reportPageMentorGroups.every((group) =>
    group.company === "MentorX" ? group.adviceItems.length <= 4 : group.adviceItems.length <= 3
  ));
  const visibleCount = result.reportPageMentorGroups.reduce((sum, group) => sum + group.adviceItems.length, 0);
  assert.ok(visibleCount >= 7, `expected at least 7 visible grouped advice items, got ${visibleCount}`);
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
  assert.ok(/æˆæžœ|é‡åŒ–/.test(lens.lens), JSON.stringify(lens));
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
  assert.notEqual(item.mentorDisplayFit, "direct", JSON.stringify(item));
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
  assert.ok(titles.every((title) => title !== "æ”¹å†™å·¥ä½œç»åŽ† bullet"), titles.join(", "));
}

function main() {
  runKeywordCapsTest();
  runResultDistributionTest();
  runReportRichnessTest();
  runMentorLensTest();
  runMentorXGroupingTest();
  runAttributionModeTest();
  runAccountantMentorDisplayFitTest();
  runMentorXAttributionTest();
  runMentorXItemChipsDoNotInheritGroupLensTest();
  runReportRichnessTargetRangeTest();
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
  console.log("advice curator tests passed");
}

main();
