"use strict";

const fs = require("fs");
const path = require("path");

const INPUT = path.join(
  process.cwd(),
  "data",
  "audit",
  "segments_action_review_batches",
  "case_specific_experience_evidence_evidence__batch_02_2026-06-05T01-32-55-549Z.json"
);

const OUTPUT = path.join(
  process.cwd(),
  "data",
  "audit",
  "segments_action_review_batches",
  "reviewed_case_specific_experience_evidence_evidence__batch_02_2026-06-05T01-32-55-549Z.json"
);

const actions = new Map();

function set(ids, action) {
  for (const id of ids) actions.set(Number(id), action);
}

set([12604, 12605, 15907, 21706], "正式实习或工作经历不足时，可以先用 2-5 个高相关项目撑起简历；一旦有真实实习，就把实习放到更显眼位置，并替换掉相关性较弱的项目。");
set([12625, 19330, 19342], "如果简历有空白或项目过旧，优先补近期、相关、能说明方法和产出的课程或研究项目；相关课程可以作为辅助信号，但不能替代项目和经历证据。");
set([12628, 12639, 21934, 23745, 25436], "不要因为课程项目体量小就自动放弃。只要能讲清任务、方法、工具和产出，就可以写入简历；项目较小时可合并同类成果，突出个人贡献。");
set([12679, 16907, 17870, 23143], "写进简历的内容必须是自己能讲清楚的。优先选择掌握扎实、能解释逻辑和结果的项目；对已经遗忘或只是听过的技术，先复习补实操，不能硬写。");
set([12981, 16665, 16667, 20660, 20783], "技术项目不一定要和目标岗位技术栈完全一致。能体现算法、系统、工程基础或复杂实现的项目，应保留并写清技术难点、实现方式和最终成果。");
set([14082, 19177, 23042], "先建立一份经历素材库，把课程项目、研究、兼职、社团、论文、作品链接等全部盘点出来；再按目标岗位筛选最有证据价值的内容放进简历。");
set([14441, 26508], "版面有限时，优先级通常是正式实习/工作经历高于项目，项目高于普通课程和低相关活动；学历或活动信息只保留能明显加分的部分。");
set([14536, 17872], "可以补充估算或量化成果，但要保持可信和可解释。数字最好来自真实记录；如果是估算，要控制量级，并能说明估算依据。");
set([15087, 17899, 18739, 24137, 24190, 26377], "按经历性质分栏：正式工作或实习放 Experience / Internship，课程、研究或个人项目放 Projects / Research。不要把课程项目包装成正式工作经历。");
set([15707, 25377], "课程或训练项目要整理成可投递版本：每个项目写清工具、行动、方法和结果；不要直接复制模板，必须替换成自己的数据、职责和产出。");
set([15853], "新项目或新技能完成后要及时更新简历。先记录任务、工具、产出和结果，避免等到投递时再回忆细节导致内容变空。");
set([16279, 16287], "如果简历项目过于常见或像开源复现，要补一个更有行业场景或差异化问题的项目；重点让项目看起来不是人人都有的模板经历。");
set([16485, 17863, 17864], "课程项目不要铺太多 bullet。每个项目保留 1-2 个最强亮点，围绕技术复杂度、数据规模、模型效果或业务结果写，弱亮点宁可删除。");
set([16774], "数据类项目可以补强 pipeline 视角：从数据来源、采集、处理、调度到分析输出讲清完整链路，让项目不只是单点工具练习。");
set([16806, 20132], "把简单实习或课程项目写具体：说明数据来源、字段或对象、处理方法、自动化流程和报告产出，再补上节省时间、数据规模或业务结论。");
set([17868], "未落地的项目也可以写，但要诚实呈现为 proposal、prototype 或 design project；重点写调研过程、方案设计、预期影响和交付物。");
set([17877], "如果课外领导或组织经历有真实成果，优先级可以高于普通课程模拟项目；写法要聚焦组织规模、资源协调、合作对象和量化结果。");
set([18396, 18401], "项目数量不足时，可以先用一个经典但完整的基础项目占位；后续有更高质量课程或实战项目后，再逐步替换临时项目。");
set([19054], "工程项目可以按完整生命周期重写：需求或业务设计、系统实现、测试验证、交付或制造约束。只写代码实现会显得项目深度不够。");
set([19115], "多方向投递时，先把项目按申请方向分类，标记每个项目能支持的岗位能力；不同版本简历只选择对应方向最强的项目。");
set([20331], "模拟课程项目不能长期替代真实工业经验。若目标岗位看重实战，优先寻找实习、真实客户项目或可验证外部项目来补强简历。");
set([22121, 24998], "项目质量弱时，用更相关、更完整的项目替换，而不是继续堆旧项目。新项目至少要写出方法、技术细节、结果和岗位相关性。");
set([23718], "把有实际产出的课程项目整理成正式项目描述，写清技术栈、个人负责部分、核心功能和结果；重点证明你真的做出了可展示成果。");
set([24165], "如果多个课程小项目属于同一条学习或业务主线，可以整合成一个大项目来写，说明前期模块和最终综合项目之间的递进关系。");
set([24193], "面向特定行业投递时，可以补一个高相关行业项目；描述要包含行业背景、方法、结果和可解释性，确保面试时能讲清项目来源和价值。");
set([24840], "如果现有经历偏离目标方向，先盘点是否有相关课程、研究或自主项目可补位；没有的话，再设计一个能证明目标岗位能力的项目。");
set([24993], "工具学习本身应放在 Skills；只有当课程内容产生了真实分析过程、项目结果或可展示产出时，才适合放到 Projects。");
set([26233], "简历内容不足时按优先级补：先补实习或工作经历，再补相关项目和课程作业，最后才考虑活动或志愿者经历；每项都要服务目标岗位。");
set([26333], "有名校、实验室或专项课程经历时，先明确它的性质：课程项目、研究项目还是正式职位。title 和描述必须真实，同时突出品牌背书和可验证产出。");
set([26356], "把算法学习和代码实现合并成一条完整证据链：说明研究了什么方法、如何实现、比较了什么结果，以及这个过程证明了哪项技术能力。");

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
      canonical_action_family: "experience_evidence",
      action_depth: "evidence",
      action_review_status: "approved",
      review_reason: "reviewed_batch_02: case-specific raw action generalized; original A_action retained but not displayed raw",
    },
    review_decision: {
      reviewer: "chat_context",
      decision: "approved_generalized",
      notes: "保留原始 mentor 判断，去掉上一位学生的项目、课程、工具、学校或公司细节；前端显示 generalized_action。",
    },
  };
}

const rows = JSON.parse(fs.readFileSync(INPUT, "utf8"));
if (!Array.isArray(rows) || rows.length !== 62) {
  throw new Error(`Expected 62 rows, got ${Array.isArray(rows) ? rows.length : "non-array"}`);
}

const reviewedRows = rows.map(reviewed);
fs.writeFileSync(OUTPUT, JSON.stringify(reviewedRows, null, 2));
console.log(JSON.stringify({ input: INPUT, output: OUTPUT, rows: reviewedRows.length }, null, 2));
