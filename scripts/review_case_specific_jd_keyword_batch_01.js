"use strict";

const fs = require("fs");
const path = require("path");

const INPUT = path.join(
  process.cwd(),
  "data",
  "audit",
  "segments_action_review_batches",
  "case_specific_jd_keyword_alignment_evidence__batch_01_2026-06-05T01-32-55-549Z.json"
);

const OUTPUT = path.join(
  process.cwd(),
  "data",
  "audit",
  "segments_action_review_batches",
  "reviewed_case_specific_jd_keyword_alignment_evidence__batch_01_2026-06-05T01-32-55-549Z.json"
);

const actions = new Map();

function set(ids, action) {
  for (const id of ids) actions.set(Number(id), action);
}

set([662], "项目标题和前两条 bullet 要让目标关键词快速出现；不要虚构职位 title，而是用专业项目名称、角色描述和核心技术词共同建立岗位相关性。");
set([4367, 9801, 19521], "版面不够时，优先保留真实实习和最强项目；低技术含量、低相关或只为凑关键词的 academic project 应删除或降级。");
set([7465, 8979, 16619], "把 JD 要求的工具词放到真实使用场景里：Skills 可以列词，但至少要有一个项目或经历 bullet 说明你用它完成了什么任务。");
set([17977, 20130, 21980], "遇到 JD 中抽象或专业的工具/模型词，先拆成具体使用场景、输入数据、计算方法和输出结果，再回到简历中寻找真实经历对应。");
set([12701, 12705], "针对专业岗位，先提取 JD 和行业常见方法词，再从课程、研究或项目中找能支撑这些方法的证据；没有真实使用过的词不要硬塞。");
set([1498], "如果项目能体现沟通、协作、展示或解决问题能力，可以保留为软技能证据；写法要说明场景、你的角色、交付物和结果。");
set([1655, 1986, 2131], "项目 bullet 不要只写工具实现。先交代业务目标或分析框架，再写工具方法，最后补结论、建议或业务影响，让关键词有上下文。");
set([2417, 10311], "逐项核查 Skills：能独立讲清楚流程的技能正常保留；只在课程中浅接触的技能要降低权重、注明背景，或暂时移除。");
set([5730], "课程项目模板只能作为结构参考，不能直接复制。最终 bullet 必须替换成自己的项目背景、任务、工具、方法和结果。");
set([6966, 11271, 21497, 25488, 26320], "如果缺少 JD 相关项目证据，就从课程项目、个人项目或实习可公开部分中补一个真实项目；只要与目标岗位相关并能讲清楚，就可以写入 Projects。");
set([7924], "技术型课程或实验项目要回查报告和作业，找出真实使用过的工具、平台或环境，并把这些关键词放进项目 bullet 或 Skills。");
set([8501, 18998], "把模糊技术词换成具体方法、算法或差异点；同时补上项目背景、个人贡献和面向谁产生了什么结果，避免只写泛泛的技术标签。");

function reviewed(row) {
  const action = actions.get(Number(row.id));
  if (!action) throw new Error(`Missing reviewed action for id=${row.id}`);
  return {
    ...row,
    proposed: {
      ...row.proposed,
      action_specificity: "case_specific",
      display_action_mode: "generalized",
      generalized_action: action,
      activation_role_family: "",
      activation_keywords: "",
      grounding_terms: "",
      canonical_action_family: "jd_keyword_alignment",
      action_depth: "evidence",
      action_review_status: "approved",
      review_reason: "reviewed_jd_keyword_batch_01: case-specific JD/tool keywords generalized; original A_action retained but not displayed raw",
    },
    review_decision: {
      reviewer: "chat_context",
      decision: "approved_generalized",
      notes: "保留原始 mentor 判断，去掉上一份 JD、课程、工具或行业专属词；前端显示 generalized_action。",
    },
  };
}

const rows = JSON.parse(fs.readFileSync(INPUT, "utf8"));
if (!Array.isArray(rows) || rows.length !== 27) {
  throw new Error(`Expected 27 rows, got ${Array.isArray(rows) ? rows.length : "non-array"}`);
}

const reviewedRows = rows.map(reviewed);
fs.writeFileSync(OUTPUT, JSON.stringify(reviewedRows, null, 2));
console.log(JSON.stringify({ input: INPUT, output: OUTPUT, rows: reviewedRows.length }, null, 2));
