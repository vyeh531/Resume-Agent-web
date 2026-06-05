"use strict";

const fs = require("fs");
const path = require("path");

const STAMP = "2026-06-05T02-21-24-821Z";
const BATCH_DIR = path.join(process.cwd(), "data", "audit", "segments_action_review_batches");
const INPUT = path.join(BATCH_DIR, `segments_action_governance_review_all_${STAMP}.json`);
const OUTPUT = path.join(BATCH_DIR, `reviewed_role_jd_high_priority_batch_01_${STAMP}.json`);

function textOf(row) {
  return [row.advice_card_title, row.user_problem_summary, row.A_action, row.action_summary, row.I_insight]
    .filter(Boolean)
    .join("\n");
}

function genericActionFor(row) {
  const family = row.proposed?.canonical_action_family || "";
  const text = textOf(row);
  let role = String(row.proposed?.activation_role_family || "").replace(/_/g, " ");
  if (/UX Researcher|UX Research|social psychology|qualitative research/i.test(text)) role = "UX research";
  else if (/Marketing Analyst|market research|Marketing/i.test(text)) role = "marketing analyst";
  else if (/Risk Consulting|RCSA|control framework|regulatory compliance/i.test(text)) role = "risk consulting";
  else if (/AI Engineer|大模型|RAG|LLM|Agent|Fine-tuning/i.test(text)) role = "AI/ML";
  else if (/Quant|quantitative finance|绿皮书|VAR|backtesting/i.test(text)) role = "quant/risk";
  else if (/Financial Advisor|Financial Analyst|FA\/|DCF|IRR|investment/i.test(text)) role = "finance";
  const roleText = role ? `目标 ${role} 方向` : "目标岗位";
  if (family === "jd_keyword_alignment") {
    return `围绕${roleText}提取 JD 关键词，但只写自己真实做过、能解释清楚的工具、方法和指标；不要为了匹配而堆词或替换成没用过的技术。`;
  }
  if (family === "summary_positioning") {
    return `根据${roleText}重排简历主线：保留最相关的经历和关键词，弱化低相关内容，但经历性质、职位名称和职责边界必须真实。`;
  }
  if (family === "experience_evidence") {
    return `把经历改写成${roleText}能读懂的证据：说明任务、方法、数据或对象、交付物和结果；没有亲自做过的内容不要写成个人贡献。`;
  }
  return `按${roleText}重新检查这条建议，只保留真实、可解释、能支撑岗位匹配的内容。`;
}

function needsGeneralized(row) {
  const text = textOf(row);
  return [
    /大量堆砌/,
    /堆砌.*关键词/,
    /重新包装/,
    /包装bullet/,
    /包装：/,
    /跟练/,
    /刷《?绿皮书/,
    /边刷题边投递/,
    /职位名称写为/,
    /正式职位名称/,
    /职位名称.*Quantitative/,
    /改为量化经济/,
    /未亲身操作/,
    /补充风险建模相关经验/,
    /全部写入/,
    /越广越好/,
    /LinkedIn.*UX Researcher/,
    /LinkedIn Jobs搜索目标岗位JD/,
  ].some((pattern) => pattern.test(text));
}

function needsExclude(row) {
  return [
    /F1签证/,
    /UICS/,
    /paperwork/,
    /工作签证/,
    /身份问题/,
  ].some((pattern) => pattern.test(textOf(row)));
}

function reviewed(row) {
  const proposed = row.proposed || {};
  const next = { ...proposed };
  const excluded = needsExclude(row);
  const generalized = needsGeneralized(row);
  if (excluded) {
    next.display_action_mode = "exclude";
    next.generalized_action = "";
  } else if (generalized) {
    next.display_action_mode = "generalized";
    next.generalized_action = genericActionFor(row);
  }
  if (!next.generalized_action && next.display_action_mode !== "exclude") {
    throw new Error(`Missing generalized_action for id=${row.id}`);
  }
  if (next.display_action_mode === "grounded_raw") {
    const hasGate = [
      next.activation_role_family,
      next.activation_keywords,
      next.grounding_terms,
    ].some((value) => String(value || "").trim());
    if (!hasGate) throw new Error(`Grounded raw without gate for id=${row.id}`);
  }

  return {
    ...row,
    proposed: {
      ...next,
      action_review_status: "approved",
      review_reason: [
        excluded
            ? "reviewed_role_jd_high_priority_batch_01: excluded because action is immigration/work-authorization guidance, not resume action"
          : generalized
            ? "reviewed_role_jd_high_priority_batch_01: generalized due to overclaim/career/process wording risk"
          : "reviewed_role_jd_high_priority_batch_01: role/JD-specific raw action allowed only when role/JD/resume gate passes",
        proposed.review_reason || "",
      ].filter(Boolean).join("; "),
    },
    review_decision: {
      reviewer: "chat_context",
      decision: excluded ? "approved_exclude" : generalized ? "approved_generalized" : "approved_grounded_raw",
      notes: excluded
        ? "這類內容涉及身份/工作授權判斷，不應由 segments resume action 對用戶展示。"
        : generalized
        ? "原文方向有价值，但用户端不显示可能鼓励过度包装、堆关键词或职业路径绑定的 raw wording。"
        : "保留角色方向细节；非匹配岗位或 grounding 不通过时走 generalized fallback。",
    },
  };
}

const allRows = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const rows = allRows
  .filter((row) => !row.current?.action_review_status)
  .filter((row) => ["role_specific", "jd_specific"].includes(row.proposed?.action_specificity))
  .slice(0, 80)
  .map(reviewed);

if (rows.length !== 80) throw new Error(`Expected 80 rows, got ${rows.length}`);
const ids = rows.map((row) => Number(row.id));
if (new Set(ids).size !== ids.length) throw new Error("Duplicate ids in reviewed role/jd batch");

fs.writeFileSync(OUTPUT, JSON.stringify(rows, null, 2));
console.log(JSON.stringify({
  output: OUTPUT,
  rows: rows.length,
  modes: rows.reduce((acc, row) => {
    acc[row.proposed.display_action_mode] = (acc[row.proposed.display_action_mode] || 0) + 1;
    return acc;
  }, {}),
  generalizedIds: rows
    .filter((row) => row.proposed.display_action_mode === "generalized")
    .map((row) => row.id),
}, null, 2));
