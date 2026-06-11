"use strict";

const assert = require("assert");
const Module = require("module");

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "../database") return { getDB: () => null };
  return originalLoad.apply(this, arguments);
};

const {
  isAdviceRoleSafe,
  isCardAlignedWithTargetProblems,
  inferAdviceActionFamily,
  humanizeHrPerspective,
} = require("../services/mentorAdviceRetrieval");

const targetRole = "Machine Learning Engineer Intern (MLE)";
const roleFamily = "machine_learning";

const unsafeRows = [
  {
    title: "Rewrite Summary for 2D animation",
    currentDiagnosis: "The resume does not clearly show 2D animation and storyboarding focus.",
    action: "Add 2D animation, storyboarding, and concept design to Summary.",
    action_summary: "Add 2D animation, storyboarding, and concept design to Summary.",
    retrieval_scope: "resume_edit",
    mentorTitle: "Senior Animator",
    company: "Superseed Studios",
  },
  {
    title: "Merge ADC comparator projects",
    currentDiagnosis: "The resume has two ADC comparator layout projects.",
    action: "Combine layout and tape out into one hardware project bullet.",
    action_summary: "Combine layout and tape out into one hardware project bullet.",
    retrieval_scope: "resume_edit",
    mentorTitle: "Hardware Engineer",
    company: "Broadcom",
  },
  {
    title: "Add portfolio link",
    currentDiagnosis: "The resume lacks a portfolio link for UIUX design.",
    action: "Add the portfolio website to the resume header.",
    action_summary: "Add the portfolio website to the resume header.",
    retrieval_scope: "resume_edit",
    mentorTitle: "UX Designer",
    company: "Google",
  },
  {
    title: "候选人担心自己ML不够深，影响求职",
    currentDiagnosis: "简历中缺少 Machine Learning Engineer Intern (MLE) 作为精确职位名称。",
    action: "如果目标岗位是analytics（而非DS），机器学习不需要学得很透彻；把精力放在SQL、统计和业务理解上",
    action_summary: "如果目标岗位是analytics（而非DS），机器学习不需要学得很透彻；把精力放在SQL、统计和业务理解上",
    retrieval_scope: "resume_edit",
    mentorTitle: "Data Analytics Manager",
    company: "Meta",
  },
  {
    title: "学生不确定岗位消失+快速约面是否是好兆头",
    currentDiagnosis: "简历整体对 Machine Learning Engineer Intern (MLE) 的方向匹配度偏弱。",
    action: "把快速联系解读为公司急需人才的信号，放平心态积极应对；岗位消失说明候选人已足够",
    action_summary: "把快速联系解读为公司急需人才的信号，放平心态积极应对；岗位消失说明候选人已足够",
    retrieval_scope: "resume_edit",
    mentorTitle: "Recruiter",
    company: "Amazon",
  },
];

unsafeRows.push({
  title: "Use BA job descriptions for keyword training",
  currentDiagnosis: "The resume is weakly aligned to Machine Learning Engineer Intern (MLE).",
  action: "First use 10 BA方向JD to train resume keywords, then test against 7 unseen BA JDs.",
  action_summary: "Use 10 BA方向JD to train resume keywords.",
  retrieval_scope: "resume_edit",
  mentorTitle: "Business Analyst",
  company: "Amazon",
});

unsafeRows.push({
  title: "Add green card status to the top",
  currentDiagnosis: "Summary is not aligned to Machine Learning Engineer Intern (MLE).",
  action: "将绿卡/工作身份放到简历最顶部，并写 Green Card Holder。",
  action_summary: "将绿卡/工作身份放到简历最顶部。",
  retrieval_scope: "resume_edit",
  mentorTitle: "Recruiter",
  company: "Amazon",
});

unsafeRows.push({
  title: "Assume PhD background",
  currentDiagnosis: "Education section is incomplete.",
  action: "Keep only master's degree and above, then add the PhD research domain under education.",
  action_summary: "Add PhD research domain to education.",
  retrieval_scope: "resume_edit",
  mentorTitle: "Recruiter",
  company: "Amazon",
});

unsafeRows.push({
  title: "Customize for Quant Research",
  currentDiagnosis: "The resume has low JD keyword match for MLE.",
  action: "确定2~3个目标Quant方向，如Quant Research、Risk Quant，并突出Sharpe Ratio。",
  action_summary: "确定Quant Research和Risk Quant方向。",
  retrieval_scope: "resume_edit",
  mentorTitle: "Quant Researcher",
  company: "Goldman Sachs",
});

unsafeRows.push({
  title: "Embedded system JD match",
  currentDiagnosis: "The resume has low JD keyword match for MLE.",
  action: "若JD要求embedded system、deep learning和computer vision，则准备1-2个embedded system项目。",
  action_summary: "准备embedded system和computer vision项目。",
  retrieval_scope: "resume_edit",
  mentorTitle: "Embedded Engineer",
  company: "NVIDIA",
});

unsafeRows.push({
  title: "Marketing Analytics versioning",
  currentDiagnosis: "The resume has low JD keyword match for MLE.",
  action: "Rewrite one resume version for Marketing Analytics and another for Marketing General.",
  action_summary: "Prepare Marketing Analytics and Marketing General resume versions.",
  retrieval_scope: "resume_edit",
  mentorTitle: "Marketing Analyst",
  company: "Amazon",
});

for (const row of unsafeRows) {
  assert.strictEqual(isAdviceRoleSafe(row, targetRole, roleFamily), false, row.title);
}

const safeMlRow = {
  title: "Strengthen machine learning project keywords",
  currentDiagnosis: "The resume has relevant projects but misses machine learning engineer keywords.",
  action: "Add supported machine learning, model evaluation, and Python evidence to project bullets.",
  action_summary: "Add supported machine learning, model evaluation, and Python evidence to project bullets.",
  retrieval_scope: "resume_edit",
  mentorTitle: "Machine Learning Engineer",
  company: "Amazon",
};

assert.strictEqual(isAdviceRoleSafe(safeMlRow, targetRole, roleFamily), true, "safe ML row");

const sectionTitleOnlyRow = {
  title: "简历经历栏标注为 Internship 限制了后续添加全职工作的灵活性",
  currentDiagnosis: "简历经历栏标注为 Internship 限制了后续添加全职工作的灵活性，格式缺乏可扩展性",
  action: "将简历经历栏标题从 Internship 改为 Professional Experience",
  action_summary: "将简历经历栏标题从 Internship 改为 Professional Experience",
  retrieval_scope: "resume_edit",
  problem_tags: "weak_experience_keyword_evidence",
};

assert.strictEqual(
  isCardAlignedWithTargetProblems(sectionTitleOnlyRow, [
    { tag: "low_jd_keyword_match", severity: "high" },
    { tag: "missing_priority_keywords", severity: "high" },
    { tag: "weak_target_role_alignment", severity: "medium" },
  ]),
  false,
  "section-title-only advice should not satisfy MLE keyword problems"
);

const bulletReadabilityRow = {
  title: "简历 bullet point 行数过多，可读性下降",
  problemSummary: "简历 bullet point 存在写满整行、行数过多的问题。",
  actionSummary: "每段工作经历写3到5个bullet point，每个bullet point控制在1到2行；第一个点写该段经历的summary，后续各点按「做了什么事+用了什么工具+达成什么效果」结构写。",
  mentorInsight: "视觉上行数过满会降低可读性（readability）。",
  retrieval_scope: "resume_edit",
  problem_tags: "readability_issue,weak_experience_keyword_evidence",
};

assert.strictEqual(
  isCardAlignedWithTargetProblems(bulletReadabilityRow, [
    { tag: "weak_summary_role_alignment", severity: "medium" },
  ]),
  false,
  "bullet readability advice should not satisfy Summary alignment problems just because it mentions a summary bullet"
);

assert.strictEqual(
  isCardAlignedWithTargetProblems(bulletReadabilityRow, [
    { tag: "weak_experience_keyword_evidence", severity: "medium" },
  ]),
  true,
  "bullet readability advice can satisfy experience evidence problems"
);

assert.strictEqual(
  inferAdviceActionFamily({
    actionSummary: "在简历中将与目标职位高度相关的关键词加粗（bold）或高亮（highlight）。",
  }),
  "keyword_visibility",
  "keyword highlight advice should have its own action family"
);

assert.strictEqual(
  inferAdviceActionFamily({
    actionSummary: "将简历中的专业术语替换或轮换为更通用的同义表达，并对照目标岗位JD提取关键词。",
  }),
  "jd_terminology",
  "JD terminology rewrite advice should have its own action family"
);

assert.strictEqual(
  inferAdviceActionFamily({
    actionSummary: "翻出所有在校期间的非考试类项目，按背景、问题、行动、成果整理后用于改写简历 bullet。",
  }),
  "project_evidence",
  "project evidence advice should have its own action family"
);

const mleHrPerspective = humanizeHrPerspective(
  {
    title: "Keep the latest relevant projects",
    currentDiagnosis: "The resume is weakly aligned to Machine Learning Engineer Intern (MLE).",
    actionSummary: "Prepare a dedicated AI resume version, keep AI and LLM projects, and weaken unrelated full stack or Android experience.",
    hrPerspective: "The direction is not focused, so resume and interview preparation will be weaker.",
    HR_os: "The direction is not focused, so resume and interview preparation will be weaker.",
  },
  {
    internalAtsResult: {
      jobTitle: targetRole,
      profile: {
        targetRole,
        roleFamily,
      },
    },
  }
);

assert.match(
  mleHrPerspective,
  /MLE|Applied ML|LLM|模型|评估|部署/,
  "MLE HR perspective should stay in ML context"
);
assert.ok(
  !/芯片|RTL|Physical Design|Synthesis/i.test(mleHrPerspective),
  `MLE HR perspective should not use hardware examples: ${mleHrPerspective}`
);

const mleModelHrPerspective = humanizeHrPerspective(
  {
    title: "Add basic ML evidence",
    currentDiagnosis: "The resume has low JD keyword match for MLE.",
    actionSummary: "Add model evaluation and explainable machine learning project evidence.",
    hrPerspective: "基础ML、线性回归、模型逻辑和口头解释模型是 ATS 和人工初筛会看的信号。",
    HR_os: "基础ML、线性回归、模型逻辑和口头解释模型是 ATS 和人工初筛会看的信号。",
  },
  {
    internalAtsResult: {
      jobTitle: targetRole,
      profile: {
        targetRole,
        roleFamily,
      },
    },
  }
);

assert.match(
  mleModelHrPerspective,
  /MLE|模型|评估|项目证据/,
  "MLE model HR perspective should stay in MLE wording"
);
assert.ok(
  !/数据分析岗|数据分析岗位|数据分析版/i.test(mleModelHrPerspective),
  `MLE model HR perspective should not use data analyst wording: ${mleModelHrPerspective}`
);

console.log("MLE role safety regression passed");
