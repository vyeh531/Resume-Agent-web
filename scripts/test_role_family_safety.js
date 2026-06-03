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
  hasCrossRoleUnsafeAdvice,
  careerGroupOf,
} = require("../services/mentorAdviceRetrieval");

function resumeRow(overrides = {}) {
  return {
    retrieval_scope: "resume_edit",
    title: "Tailor resume keywords",
    currentDiagnosis: "The resume is weakly aligned to the target role.",
    action: "Update Summary, Skills, and Experience bullets to match the target JD keywords.",
    action_summary: "Update Summary, Skills, and Experience bullets to match the target JD keywords.",
    problem_tags: "low_jd_keyword_match,weak_target_role_alignment",
    ...overrides,
  };
}

const cases = [
  {
    name: "MLE rejects DA direction",
    targetRole: "Machine Learning Engineer Intern (MLE)",
    roleFamily: "machine_learning",
    row: resumeRow({
      action: "If the target is a DA role, do not emphasize PyTorch or neural network; focus on SQL, statistics, and business understanding.",
      action_summary: "If the target is a DA role, do not emphasize PyTorch or neural network.",
      role_family: "machine_learning",
      target_roles: "data_analyst",
    }),
    safe: false,
  },
  {
    name: "MLE allows DS technical evidence",
    targetRole: "Machine Learning Engineer Intern (MLE)",
    roleFamily: "machine_learning",
    row: resumeRow({
      action: "Add model evaluation, Python, PyTorch, and dataset evidence to project bullets.",
      action_summary: "Add model evaluation, Python, PyTorch, and dataset evidence to project bullets.",
      role_family: "data_scientist,machine_learning",
      target_roles: "data_scientist,machine_learning_engineer",
    }),
    safe: true,
  },
  {
    name: "Accounting rejects ML stack advice",
    targetRole: "Accountant",
    roleFamily: "accounting",
    row: resumeRow({
      action: "Add PyTorch, neural network, and model deployment evidence to Skills and project bullets.",
      action_summary: "Add PyTorch and model deployment evidence.",
      role_family: "machine_learning",
      target_roles: "machine_learning_engineer",
    }),
    safe: false,
  },
  {
    name: "UX rejects finance modeling advice",
    targetRole: "UX Designer",
    roleFamily: "ux_research_design",
    row: resumeRow({
      action: "Add accounting, valuation, and financial modeling keywords to the Summary.",
      action_summary: "Add accounting and financial modeling keywords.",
      role_family: "finance",
      target_roles: "financial_analyst",
    }),
    safe: false,
  },
  {
    name: "Hardware rejects DA positioning advice",
    targetRole: "Hardware Engineer",
    roleFamily: "hardware_electrical",
    row: resumeRow({
      action: "Rewrite the resume toward Data Analyst roles with dashboard, KPI, and business insight bullets.",
      action_summary: "Rewrite toward Data Analyst roles.",
      role_family: "data_analyst",
      target_roles: "data_analyst",
    }),
    safe: false,
  },
  {
    name: "Healthcare rejects frontend advice",
    targetRole: "Clinical Research Associate",
    roleFamily: "healthcare",
    row: resumeRow({
      action: "Add frontend, React, and backend API keywords to Skills and project bullets.",
      action_summary: "Add frontend and backend API keywords.",
      role_family: "software_engineer",
      target_roles: "frontend_engineer",
    }),
    safe: false,
  },
  {
    name: "Finance allows accounting group transfer",
    targetRole: "Financial Analyst",
    roleFamily: "finance",
    row: resumeRow({
      action: "Add financial reporting, Excel, reconciliation, and variance analysis evidence to Experience bullets.",
      action_summary: "Add financial reporting, Excel, reconciliation, and variance analysis evidence.",
      role_family: "accounting,finance",
      target_roles: "accounting_analyst,financial_analyst",
    }),
    safe: true,
  },
];

assert.strictEqual(careerGroupOf("machine_learning"), "data");
assert.strictEqual(careerGroupOf("accounting"), "finance_accounting");
assert.strictEqual(careerGroupOf("ux_research_design"), "design_creative");

for (const item of cases) {
  assert.strictEqual(
    isAdviceRoleSafe(item.row, item.targetRole, item.roleFamily),
    item.safe,
    item.name
  );
  assert.strictEqual(
    hasCrossRoleUnsafeAdvice(item.row, item.roleFamily, item.targetRole),
    !item.safe,
    `${item.name} unsafe detector`
  );
}

console.log("Role family safety regression passed");
