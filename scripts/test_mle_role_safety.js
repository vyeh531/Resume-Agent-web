"use strict";

const assert = require("assert");
const Module = require("module");

const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "../database") return { getDB: () => null };
  return originalLoad.apply(this, arguments);
};

const { isAdviceRoleSafe, isCardAlignedWithTargetProblems } = require("../services/mentorAdviceRetrieval");

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

console.log("MLE role safety regression passed");
