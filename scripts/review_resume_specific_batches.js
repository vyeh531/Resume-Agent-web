"use strict";

const fs = require("fs");
const path = require("path");

const STAMP = "2026-06-05T02-11-48-318Z";
const BATCH_DIR = path.join(
  process.cwd(),
  "data",
  "audit",
  "segments_action_review_batches"
);

const OUTPUT = path.join(BATCH_DIR, `reviewed_resume_specific_${STAMP}.json`);

const INPUTS = fs.readdirSync(BATCH_DIR)
  .filter((filename) => filename.startsWith("resume_specific_") && filename.endsWith(`_${STAMP}.json`))
  .sort();

const OVERRIDES = new Map([
  [18706, {
    display_action_mode: "generalized",
    generalized_action: "国内工具或行业平台可以翻译成海外 HR 能理解的功能描述，但不要替换成没实际用过的工具名；若补学了国际工具，也应单独写成新增技能或训练经历。",
  }],
  [8812, {
    grounding_terms: "Summer Research Program,Investment Analysis,Quantitative Modeling",
  }],
  [6322, {
    grounding_terms: "lab,course,Relevant Coursework,Course Projects,circuit",
  }],
  [3542, {
    activation_role_family: "marketing",
    activation_keywords: "Marketing,Marketing Research,Consumer Data",
    grounding_terms: "Marketing Management,Marketing Research,Consumer Data,Relevant Courses",
  }],
  [15004, {
    grounding_terms: "Quant Research,Wikipedia,financial statement analysis,time series",
  }],
  [15008, {
    grounding_terms: "Quant Research,DS,financial statement analysis,time series",
  }],
  [24799, {
    grounding_terms: "Quantitative Research,Jobscan,JD,matching score",
  }],
  [24807, {
    grounding_terms: "Quant Research,Risk Quant,coursework",
  }],
  [22358, {
    display_action_mode: "generalized",
    generalized_action: "从真实任务中抽取与目标风险岗位相关的证据：分析对象、风险指标、数据来源和报告产出都要能被解释，不能为了关键词把经历改成没做过的内容。",
  }],
  [23853, {
    display_action_mode: "generalized",
    generalized_action: "如果项目已有真实标注集或评估记录，可以补充评估方法、基线结果和真实提升幅度；不要虚构 ground truth、API 评测流程或 40% 到 90% 这类指标。",
  }],
  [2344, {
    display_action_mode: "grounded_raw",
    generalized_action: "把 deploy、real-time、production 等泛词补成真实可验证的环境、平台、延迟或使用场景；没有测过的数值不要写成结果。",
    grounding_terms: "AWS,EC2,Jetson,NVIDIA,Docker,latency",
  }],
  [9187, {
    display_action_mode: "generalized",
    generalized_action: "Skills 只列能被追问时讲清楚的技术；可以覆盖 JD 关键词，但要按熟练度和真实使用场景排序，避免把只是听过的工具写成会用。",
  }],
  [15460, {
    display_action_mode: "grounded_raw",
    generalized_action: "小组项目里接触过的云服务可以写，但要用 assisted、supported、exposed to 或 used in team project 这类真实语气说明参与深度。",
    grounding_terms: "AWS,EC2,RDS,S3",
  }],
  [21479, {
    action_specificity: "role_specific",
    activation_role_family: "software_engineer,backend_engineer",
    grounding_terms: "Java,Spring Boot,Kafka,Redis,MySQL,PostgreSQL,AWS",
  }],
  [25323, {
    action_specificity: "role_specific",
    activation_role_family: "software_engineer,backend_engineer",
    grounding_terms: "Java,C++,Database,Cloud,ORM,Microservice",
  }],
  [25858, {
    action_specificity: "role_specific",
    activation_role_family: "software_engineer,backend_engineer",
    grounding_terms: "Java,Spring Boot,AWS,EC2,RDS,SNS/SQS",
  }],
  [3962, {
    action_specificity: "role_specific",
    activation_role_family: "ai_engineer,machine_learning",
    grounding_terms: "RAG,fine-tuning,AI Agent,serving,DPO,SFT",
  }],
  [6097, {
    action_specificity: "role_specific",
    activation_role_family: "ai_engineer,machine_learning",
    grounding_terms: "OpenAI,GPT,RAG,Agent,PyTorch,TensorFlow,AWS,Docker",
  }],
  [6113, {
    action_specificity: "role_specific",
    activation_role_family: "ai_engineer,machine_learning",
    grounding_terms: "fine-tuning,GPU,RAG,LLM Agent",
  }],
  [19846, {
    action_specificity: "role_specific",
    activation_role_family: "ai_engineer,machine_learning",
    grounding_terms: "LLM,vLLM,Ray Serve,SFT,PPO,DPO,KTO,RLHF,RAG,Agent",
  }],
  [13093, {
    display_action_mode: "generalized",
    generalized_action: "经历第一条 bullet 要先交代团队或业务背景，再用一句话说明研究对象、方法和核心贡献，让 HR 不需要猜这段经历的方向。",
  }],
  [15024, {
    display_action_mode: "exclude",
    generalized_action: "",
  }],
  [22007, {
    action_specificity: "role_specific",
    display_action_mode: "generalized",
    activation_role_family: "trading_quant,finance",
    activation_keywords: "Quant,Quant Research,Systematic Investing",
    grounding_terms: "",
    generalized_action: "如果目标是量化或金融前台岗位，先用目标 JD 反推技能缺口和项目证据，再决定主投方向与备选方向；不要在履历建议里绑定具体公司名单或年份。",
  }],
  [25537, {
    display_action_mode: "grounded_raw",
    generalized_action: "行业缩写会影响 HR 对候选人方向的判断；只保留目标岗位能理解且相关的缩写，其他缩写改成通用业务描述。",
    grounding_terms: "GPO,IND,FDA,CM,SQL,Tableau,Python",
  }],
]);

function reviewed(row, sourceFile) {
  const proposed = row.proposed || {};
  if (proposed.action_specificity !== "resume_specific") {
    throw new Error(`Expected resume_specific proposed row, got id=${row.id} specificity=${proposed.action_specificity}`);
  }
  const override = OVERRIDES.get(Number(row.id)) || {};
  const nextProposed = { ...proposed, ...override };
  if (!["grounded_raw", "generalized", "exclude"].includes(nextProposed.display_action_mode)) {
    throw new Error(`Unexpected display mode for id=${row.id}: ${nextProposed.display_action_mode}`);
  }
  if (nextProposed.display_action_mode !== "exclude" && !nextProposed.generalized_action) {
    throw new Error(`Missing generalized_action fallback for id=${row.id}`);
  }

  return {
    ...row,
    review_source_batch: sourceFile,
    proposed: {
      ...nextProposed,
      action_specificity: nextProposed.action_specificity || "resume_specific",
      action_review_status: "approved",
      review_reason: [
        override.display_action_mode
          ? `reviewed_resume_specific_batches: id-level override to ${nextProposed.display_action_mode}`
          : "reviewed_resume_specific_batches: raw action allowed only when resume/JD grounding passes",
        proposed.review_reason || "",
      ].filter(Boolean).join("; "),
    },
    review_decision: {
      reviewer: "chat_context",
      decision: "approved_grounded_raw",
      notes: "保留命中同一履历材料时的原文价值；若 grounding 或 role gate 不通过，前端使用 generalized_action 或排除 raw action。",
    },
  };
}

const rows = INPUTS.flatMap((filename) => {
  const parsed = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, filename), "utf8"));
  if (!Array.isArray(parsed)) throw new Error(`${filename} did not contain an array`);
  return parsed.map((row) => reviewed(row, filename));
});

const ids = rows.map((row) => Number(row.id));
const uniqueIds = new Set(ids);
if (INPUTS.length !== 11) throw new Error(`Expected 11 resume_specific batch files, got ${INPUTS.length}`);
if (rows.length !== 82) throw new Error(`Expected 82 rows, got ${rows.length}`);
if (uniqueIds.size !== rows.length) throw new Error("Duplicate ids found in resume_specific rows");

const rowsWithoutGate = rows.filter((row) => {
  const p = row.proposed;
  if (p.display_action_mode !== "grounded_raw") return false;
  return !String(p.grounding_terms || "").trim() &&
    !String(p.activation_role_family || "").trim() &&
    !String(p.activation_keywords || "").trim();
});
if (rowsWithoutGate.length) {
  throw new Error(`Grounded raw rows without any gate: ${rowsWithoutGate.map((row) => row.id).join(", ")}`);
}

fs.writeFileSync(OUTPUT, JSON.stringify(rows, null, 2));
console.log(JSON.stringify({
  output: OUTPUT,
  inputs: INPUTS.length,
  rows: rows.length,
  overrides: rows.filter((row) => OVERRIDES.has(Number(row.id))).length,
  families: rows.reduce((acc, row) => {
    const key = `${row.proposed.canonical_action_family}:${row.proposed.action_depth}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
}, null, 2));
