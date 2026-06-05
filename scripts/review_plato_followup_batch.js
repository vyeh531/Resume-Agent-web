"use strict";

const fs = require("fs");
const path = require("path");

const OUT = path.join(
  process.cwd(),
  "data/audit/segments_action_review_batches/reviewed_plato_followup_2026-06-05T03-42-32-480Z.json"
);

const reviews = [
  {
    id: 24599,
    proposed: {
      action_specificity: "resume_specific",
      display_action_mode: "generalized",
      generalized_action: "针对每个目标岗位准备定制版简历：保留与 JD 直接相关的项目，弱化不相关项目，并把真实掌握的关键词写进对应项目证据里。",
      activation_role_family: "embedded_software",
      activation_keywords: "embedded, ARM, I2C, SPI, robotics, firmware",
      grounding_terms: "ARM,I2C,SPI",
      canonical_action_family: "jd_keyword_alignment",
      action_depth: "evidence",
      action_review_status: "approved",
      review_reason: "plato_followup: raw contains overclaim wording; use truth-safe generalized action.",
    },
  },
  {
    id: 25629,
    proposed: {
      action_specificity: "resume_specific",
      display_action_mode: "grounded_raw",
      generalized_action: "选择最相关的金融或分析经历，把 bullet 改成「动作 + 方法/工具 + 结果」结构，让专业关键词有真实证据支撑。",
      activation_role_family: "finance,asset_management",
      activation_keywords: "asset management, portfolio, PNL, DCF, CAPM, finance",
      grounding_terms: "PNL,DCF,CAPM",
      canonical_action_family: "experience_evidence",
      action_depth: "rewrite",
      action_review_status: "approved",
      review_reason: "plato_followup: keep valuable finance raw only behind finance role and resume grounding gates.",
    },
  },
  {
    id: 25910,
    proposed: {
      action_specificity: "resume_specific",
      display_action_mode: "generalized",
      generalized_action: "如果目标岗位明显看重技术能力，可以把 Technical Skills 前移，并按 JD 优先级排列真实掌握的工具；不要为了某个方向硬塞不熟的技能。",
      activation_role_family: "quant_risk",
      activation_keywords: "quant, risk, SQL, VBA, MATLAB, Python",
      grounding_terms: "SQL,VBA,MATLAB",
      canonical_action_family: "skills_section",
      action_depth: "structure",
      action_review_status: "approved",
      review_reason: "plato_followup: raw suggests writing skills before mastery; use generalized truth-safe action.",
    },
  },
  {
    id: 26582,
    proposed: {
      action_specificity: "resume_specific",
      display_action_mode: "generalized",
      generalized_action: "如果简历里 Research Projects、Work Experience 或 Projects 之间内容重叠，先统一版块逻辑和对齐方式；只把能证明目标岗位能力的内容放在最容易被 HR 扫到的位置。",
      activation_role_family: "",
      activation_keywords: "",
      grounding_terms: "Research Projects,Work Experience",
      canonical_action_family: "section_structure",
      action_depth: "structure",
      action_review_status: "approved",
      review_reason: "plato_followup: section merge advice is not universally generic; use safer generalized section action.",
    },
  },
];

for (const review of reviews) {
  review.review_decision = {
    reviewer: "plato_followup_chat_context",
    decision: `approved_${review.proposed.display_action_mode}`,
    notes: "Follow-up from monitoring agent: reduce overclaim, raw skill-writing, and section-merge risks.",
  };
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, `${JSON.stringify(reviews, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ output: OUT, rows: reviews.length }, null, 2));
