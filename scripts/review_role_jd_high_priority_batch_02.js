"use strict";

const fs = require("fs");
const path = require("path");

const STAMP = process.argv[2] || "2026-06-05T02-30-21-751Z";
const BATCH_LABEL = process.argv[3] || "batch_02";
const BATCH_DIR = path.join(process.cwd(), "data", "audit", "segments_action_review_batches");
const INPUT = path.join(BATCH_DIR, `segments_action_governance_review_all_${STAMP}.json`);
const OUTPUT = path.join(BATCH_DIR, `reviewed_role_jd_high_priority_${BATCH_LABEL}_${STAMP}.json`);

function textOf(row) {
  return [row.advice_card_title, row.user_problem_summary, row.A_action, row.action_summary, row.I_insight]
    .filter(Boolean)
    .join("\n");
}

function isAiMlProject(text) {
  return /machine learning|ML project|MLE|ML Infra|Deep Learning|overfitting|underfitting|bias-variance|CNN|RNN|SGD|machine learning engineer|evaluation|experiment|debugging|deploy|deployment|logistic regression|Gradient Boost|feature engineering|hypertuning|model evaluation/i.test(text);
}

function isFinanceValuation(text) {
  return /value investment|\bvaluation\b|DCF|CAPM|Comparable Company Analysis|capital asset pricing model|implied enterprise value|implied stock price|analyst associate|Financial Advisor|Financial Analyst|financial reporting|financial modeling|Investment Analyst|Treasury Analyst|FA\/|IRR|FP&A|Accounting|portfolio construction|portfolio risk management|mark-to-market|P&L commentary|risk and control/i.test(text);
}

function isBusinessDataAnalyst(text) {
  return /Business Analyst|Data Analyst|BA\/DA|SQL Analyst|BI|business_analyst|data_analyst/i.test(text);
}

function firstConcreteRoleFamily(row) {
  return String(row.role_family || row.roleFamily || row.target_roles || row.targetRoles || "")
    .split(",")
    .map((value) => value.trim())
    .find((value) => value && value !== "universal") || "";
}

function roleLabelFor(row) {
  const text = textOf(row);
  if (false && /Professional Experience|full-time|Relevant Courses|education|section|Skills|Projects/i.test(text)) {
    return `根据${roleText}和个人背景强弱调整简历板块顺序：最能证明岗位匹配的经历、项目、课程或技能放前面，弱相关内容压缩到后面；每个板块都要服务同一个目标岗位。`;
  }
  const proposedRole = String(row.proposed?.activation_role_family || "");
  const activationKeywords = String(row.proposed?.activation_keywords || "");
  if (isFinanceValuation(text)) return "finance";
  if (isAiMlProject(text)) return "AI/ML";
  if (isBusinessDataAnalyst(text)) return "business/data analyst";
  if (!proposedRole && /consulting/i.test(activationKeywords)) return "consulting";
  if (/Consulting club|case competition|consulting实战|咨询行业|咨询类项目/i.test(text)) return "consulting";
  if (proposedRole) {
    if (/risk_consulting/.test(proposedRole)) return "risk consulting";
    if (/consulting/.test(proposedRole)) return "consulting";
    if (/trading_quant|quant/.test(proposedRole)) return "quant/risk";
    if (/data_scientist|ai|ml/.test(proposedRole)) return "AI/ML";
    if (/finance/.test(proposedRole)) {
      if (/Machine Learning Engineer|machine learning engineer|ML\/SWE|ML Engineer|production side|SLA|oncall|training.*evaluation|logistic regression|Gradient Boost|feature engineering|hypertuning|model evaluation/i.test(text)) return "AI/ML";
      if (isBusinessDataAnalyst(text)) return "business/data analyst";
      return "finance";
    }
    return proposedRole.replace(/_/g, " ");
  }
  let role = "";
  if (isBusinessDataAnalyst(text)) role = "business/data analyst";
  else if (/UX Researcher|UX Research|user feedback|qualitative research/i.test(text)) role = "UX research";
  else if (/Marketing Analyst|market research|market researcher|marketing方向|SEO/i.test(text)) role = "marketing analyst";
  else if (/Risk Consulting|RCSA|control framework|regulatory compliance/i.test(text)) role = "risk consulting";
  else if (/Quant|quantitative finance|绿皮书|VAR|backtesting|Sharpe|Alpha|trading book|MFE/i.test(text)) role = "quant/risk";
  else if (/AI Engineer|大模型|RAG|LLM|\bAgent\b|Fine-tuning|GPT|BERT|NLP/i.test(text)) role = "AI/ML";
  else if (/Financial Advisor|Financial Analyst|FA\/|DCF|IRR|investment|FP&A|Accounting/i.test(text)) role = "finance";
  return role || "目标岗位";
}

function genericActionFor(row) {
  const family = row.proposed?.canonical_action_family || "";
  const role = roleLabelFor(row);
  const roleText = role === "目标岗位" ? role : `目标 ${role} 方向`;
  const text = textOf(row);

  if (/缺乏|没有|补充|补学|学习|项目经验|hands-on|实战项目|自主完成|GitHub|Quantconnect/i.test(text)) {
    return `如果${roleText}缺少项目或技能证据，优先补一个真实可解释的项目/训练成果；完成后再写进 Projects 或 Skills，写清数据来源、方法、指标、交付物和结果。`;
  }
  if (/关键词|JD|ATS|匹配|Job Description/i.test(text) || family === "jd_keyword_alignment") {
    return `围绕${roleText}提取 JD 关键词，但只写自己真实做过、能解释清楚的工具、方法和指标；不要为了匹配而堆词或替换成没用过的技术。`;
  }
  if (/版本|方向|定位|删除|弱化|保留|前置|重心/i.test(text) || family === "summary_positioning") {
    return `根据${roleText}重排简历主线：保留最相关的经历和关键词，弱化低相关内容，但经历性质、职位名称和职责边界必须真实。`;
  }
  if (family === "experience_evidence") {
    return `把经历改写成${roleText}能读懂的证据：说明任务、方法、数据或对象、交付物和结果；没有亲自做过的内容不要写成个人贡献。`;
  }
  return `按${roleText}重新检查这条建议，只保留真实、可解释、能支撑岗位匹配的内容。`;
}

function needsExclude(row) {
  const text = textOf(row);
  if (/US GAAP|GAAP/i.test(text)) return false;
  if (/筛选startup|startup质量|避免加入.*startup|避免加入过早期/.test(text)) return true;
  return [
    /F1签证/,
    /UICS/,
    /paperwork/,
    /工作签证/,
    /身份问题/,
    /OPT\b/,
    /CPT\b/,
    /法律意见/,
  ].some((pattern) => pattern.test(text));
}

function excludeReasonFor(row) {
  const text = textOf(row);
  if (/筛选startup|startup质量|避免加入.*startup|避免加入过早期/.test(text)) {
    return {
      reason: "excluded because action is company-screening/career strategy, not a resume action",
      notes: "公司筛选、融资轮次、创始人背景判断不作为简历 action 展示。",
    };
  }
  return {
    reason: "excluded because action is immigration/legal/identity guidance, not resume action",
    notes: "身份/法律/工作授权类不作为简历 action 展示。",
  };
}

function needsGeneralized(row) {
  const text = textOf(row);
  if (/Professional Experience|full-time|Relevant Courses|education|section|Skills|Projects/i.test(text)) return false;
  return [
    /即便尚未完全掌握/,
    /注明为学习中/,
    /尽快补学/,
    /大量堆砌/,
    /堆砌.*关键词/,
    /尽可能融入/,
    /全部填入/,
    /尽快安排一段/,
    /代为撰写/,
    /补完.*课程/,
    /补充.*(项目|技能|作品|实践|经历)/,
    /缺乏.*(项目|技能|作品|实践|经历)/,
    /Marketing岗位面试|Marketing面试|营销能力/,
    /先写.*(补学|自学)/,
    /未实际使用过|不会用|自学了解/,
    /若无真实数据/,
    /overfitted|不可信|合理估算值/,
    /替换.*项目|增加.*项目/,
    /NLP基础薄弱|使用LangChain|完成一个entity|entity extraction/,
    /完成.*(课程|训练|模拟|simulation)/i,
    /Virtual Job Simulation|Forage/i,
    /info session|case competition|pizza/i,
    /去GitHub上搜索/,
    /注册并熟练使用/,
    /刷题/,
    /LeetCode/,
    /ChatGPT/,
    /Point 72|Two Sigma|Trump/,
    /改为量化经济/,
    /不必每个工具都在它实际所在的经历里写/,
    /没有亲身操作|未亲身操作/,
    /可能会学习/,
    /搜索词.*替换/,
    /LinkedIn/,
    /Coursera/,
    /yfinance/,
  ].some((pattern) => pattern.test(text));
}

function reviewed(row) {
  const proposed = row.proposed || {};
  const next = { ...proposed };
  const excluded = needsExclude(row);
  const generalized = needsGeneralized(row);
  const excludeReason = excluded ? excludeReasonFor(row) : null;
  if (/Marketing岗位面试|Marketing面试|营销能力/.test(textOf(row))) {
    next.activation_role_family = "marketing";
  }
  if (/market research|market researcher|marketing方向/i.test(textOf(row))) {
    next.activation_role_family = "marketing";
  }
  if (/Consulting club|case competition|consulting实战|咨询行业|咨询类项目/i.test(textOf(row))) {
    next.activation_role_family = "consulting";
  }
  if (/Machine Learning Engineer|machine learning engineer|ML\/SWE|ML Engineer|production side|SLA|oncall|training.*evaluation|logistic regression|Gradient Boost|feature engineering|hypertuning|model evaluation/i.test(textOf(row))) {
    next.activation_role_family = "data_scientist";
  }

  if (isFinanceValuation(textOf(row))) {
    next.activation_role_family = "finance";
  } else if (isAiMlProject(textOf(row))) {
    next.activation_role_family = "data_scientist";
  } else if (isBusinessDataAnalyst(textOf(row))) {
    next.activation_role_family = "data_analyst";
  }

  if (excluded) {
    next.display_action_mode = "exclude";
    next.generalized_action = "";
  } else if (generalized) {
    next.display_action_mode = "generalized";
    next.generalized_action = genericActionFor({ ...row, proposed: next });
  }

  if (next.display_action_mode !== "exclude" && !next.generalized_action) {
    throw new Error(`Missing generalized_action for id=${row.id}`);
  }
  if (next.display_action_mode === "grounded_raw") {
    if (!String(next.activation_role_family || next.activation_keywords || next.grounding_terms || "").trim()) {
      next.activation_role_family = firstConcreteRoleFamily(row);
    }
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
          ? `reviewed_role_jd_high_priority_${BATCH_LABEL}: ${excludeReason.reason}`
          : generalized
            ? `reviewed_role_jd_high_priority_${BATCH_LABEL}: generalized to keep project/skill-gap value while removing overclaim/career/process wording`
            : `reviewed_role_jd_high_priority_${BATCH_LABEL}: role/JD-specific raw action allowed only when role/JD/resume gate passes`,
        proposed.review_reason || "",
      ].filter(Boolean).join("; "),
    },
    review_decision: {
      reviewer: "chat_context",
      decision: excluded ? "approved_exclude" : generalized ? "approved_generalized" : "approved_grounded_raw",
      notes: excluded
        ? excludeReason.notes
        : generalized
          ? "保留缺项目、缺技能、需补作品的价值，但改成可用于简历卡片的安全 action。"
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

if (rows.length < 1) throw new Error("No unreviewed role/jd rows found");
const ids = rows.map((row) => Number(row.id));
if (new Set(ids).size !== ids.length) throw new Error("Duplicate ids in reviewed role/jd batch 02");

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
  excludedIds: rows
    .filter((row) => row.proposed.display_action_mode === "exclude")
    .map((row) => row.id),
}, null, 2));
