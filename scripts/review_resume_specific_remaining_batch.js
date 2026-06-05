"use strict";

const fs = require("fs");
const path = require("path");

const STAMP = process.argv[2];
const BATCH_LABEL = process.argv[3] || "batch_09";
const LIMIT = Number(process.argv[4] || 80);

if (!STAMP) {
  throw new Error("Usage: node scripts\\review_resume_specific_remaining_batch.js <STAMP> <batch_label> [limit]");
}

const BATCH_DIR = path.join(process.cwd(), "data", "audit", "segments_action_review_batches");
const INPUT = path.join(BATCH_DIR, `segments_action_governance_review_all_${STAMP}.json`);
const OUTPUT = path.join(BATCH_DIR, `reviewed_resume_specific_remaining_${BATCH_LABEL}_${STAMP}.json`);
const SAFE_RAW_IDS = new Set([12361, 20014]);

function textOf(row) {
  return [row.advice_card_title, row.user_problem_summary, row.A_action, row.action_summary, row.I_insight]
    .filter(Boolean)
    .join("\n");
}

function firstConcreteRoleFamily(row) {
  return String(row.role_family || row.roleFamily || row.target_roles || row.targetRoles || "")
    .split(",")
    .map((value) => value.trim())
    .find((value) => value && value !== "universal") || "";
}

function genericActionFor(row) {
  const family = row.proposed?.canonical_action_family || "";
  const text = textOf(row);

  if (/职位Title|Project Manager|Data Recorder|Head of Communication|Research Assistant.*Developer|Investment Banking Intern|Investment Research Intern/i.test(text)) {
    return "不要把官方职位名改成没有真实发生过的岗位；可以在项目名、括号说明或 bullet 中突出目标职能，让经历看起来更贴近岗位但仍然真实。";
  }
  if (/Business Intelligence|Data Pipeline|ETL|job description/i.test(text)) {
    return "先用目标 JD 判断岗位更偏分析、BI 还是数据工程，再调整简历版本：分析岗突出业务问题和洞察，数据工程岗突出 ETL、pipeline、数据建模和稳定交付。";
  }
  if (/包装为|包装成|自行完成|Kaggle|GitHub|Personal Projects|Research Projects/i.test(text)) {
    return "如果目标岗位缺少项目证据，可以补一个真实可解释的项目或作品；写进简历时要说明数据来源、方法、交付物和结果，不要把练习项目包装成真实工作经历。";
  }
  if (/Google Drive|portfolio|link|链接/i.test(text)) {
    return "作品链接可以保留，但要放在项目名、作品集或个人主页等清晰位置；链接旁边写明内容类型和价值，不要让 HR 需要自己猜里面是什么。";
  }
  if (/Skills|Relevant Courses|Awards|Activities|Education|Professional Experience|Selected Projects|Academic Projects/i.test(text)) {
    return "根据目标岗位重排简历板块：最能证明匹配度的技能、经历、项目或课程放前面，弱相关内容压缩或合并，避免占用首屏注意力。";
  }
  if (/keyword|JD|ATS|JobScan|match/i.test(text) || family === "jd_keyword_alignment") {
    return "对照 JD 提取真实掌握的核心关键词，把它们分配到 Summary、Skills 和最相关的 Experience bullet 中，避免为了匹配而堆词。";
  }
  if (family === "education_signal") {
    return "只保留和目标岗位相关的课程、证书或训练成果，并说明它们如何支撑岗位要求；不相关内容不要占据主要篇幅。";
  }
  return "选择最相关的经历，把 bullet 改成「动作 + 方法/工具 + 结果」结构，让关键词有真实证据支撑。";
}

function shouldGeneralize(row) {
  const text = textOf(row);
  return /包装为|包装成|自行完成|Kaggle|GitHub|Google Drive|代写|用AI|AI润色|改写.*Title|职位Title|Project Manager|Data Recorder|Head of Communication|Investment Banking Intern|Investment Research Intern/i.test(text);
}

function reviewed(row) {
  const proposed = row.proposed || {};
  if (proposed.action_specificity !== "resume_specific") {
    throw new Error(`Expected resume_specific row, got id=${row.id} specificity=${proposed.action_specificity}`);
  }

  const next = {
    ...proposed,
    action_specificity: "resume_specific",
    action_review_status: "approved",
  };

  const forceRaw = SAFE_RAW_IDS.has(Number(row.id));

  if (!next.generalized_action || (shouldGeneralize(row) && !forceRaw)) {
    next.generalized_action = genericActionFor(row);
  }

  if (shouldGeneralize(row) && !forceRaw) {
    next.display_action_mode = "generalized";
  }

  if (next.display_action_mode === "grounded_raw") {
    const hasGate = [next.activation_role_family, next.activation_keywords, next.grounding_terms]
      .some((value) => String(value || "").trim());
    if (!hasGate) {
      const roleFamily = firstConcreteRoleFamily(row);
      if (roleFamily) {
        next.activation_role_family = roleFamily;
      } else {
        next.display_action_mode = "generalized";
        next.generalized_action = genericActionFor(row);
      }
    }
  }

  if (next.display_action_mode !== "exclude" && !next.generalized_action) {
    throw new Error(`Missing generalized_action for id=${row.id}`);
  }
  if (next.display_action_mode === "grounded_raw") {
    const hasGate = [next.activation_role_family, next.activation_keywords, next.grounding_terms]
      .some((value) => String(value || "").trim());
    if (!hasGate) throw new Error(`Grounded raw without gate for id=${row.id}`);
  }

  next.review_reason = [
    next.display_action_mode === "generalized"
      ? `reviewed_resume_specific_remaining_${BATCH_LABEL}: generalized resume-specific raw detail to avoid title/project overreach`
      : `reviewed_resume_specific_remaining_${BATCH_LABEL}: resume-specific raw action allowed only when grounding gate passes`,
    proposed.review_reason || "",
  ].filter(Boolean).join("; ");

  return {
    ...row,
    proposed: next,
    review_decision: {
      reviewer: "chat_context",
      decision: next.display_action_mode === "generalized" ? "approved_generalized" : "approved_grounded_raw",
      notes: "保留命中同一履历材料时的价值；涉及改职称、包装项目或补作品时改为真实可执行的 generalized action。",
    },
  };
}

const allRows = JSON.parse(fs.readFileSync(INPUT, "utf8"));
const rows = allRows
  .filter((row) => !row.current?.action_review_status)
  .filter((row) => row.proposed?.action_specificity === "resume_specific")
  .slice(0, LIMIT)
  .map(reviewed);

if (!rows.length) throw new Error("No unreviewed resume_specific rows found");
const ids = rows.map((row) => Number(row.id));
if (new Set(ids).size !== ids.length) throw new Error("Duplicate ids in resume-specific remaining batch");

fs.writeFileSync(OUTPUT, JSON.stringify(rows, null, 2));
console.log(JSON.stringify({
  output: OUTPUT,
  rows: rows.length,
  modes: rows.reduce((acc, row) => {
    acc[row.proposed.display_action_mode] = (acc[row.proposed.display_action_mode] || 0) + 1;
    return acc;
  }, {}),
  generalizedIds: rows.filter((row) => row.proposed.display_action_mode === "generalized").map((row) => row.id),
}, null, 2));
