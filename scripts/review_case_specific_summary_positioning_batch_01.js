"use strict";

const fs = require("fs");
const path = require("path");

const INPUT = path.join(
  process.cwd(),
  "data",
  "audit",
  "segments_action_review_batches",
  "case_specific_summary_positioning_evidence__batch_01_2026-06-05T01-32-55-549Z.json"
);

const OUTPUT = path.join(
  process.cwd(),
  "data",
  "audit",
  "segments_action_review_batches",
  "reviewed_case_specific_summary_positioning_evidence__batch_01_2026-06-05T01-32-55-549Z.json"
);

const actions = new Map();

function set(ids, action) {
  for (const id of ids) actions.set(Number(id), action);
}

set([3716, 10437, 1064, 1990, 2309, 8287, 9702, 11431, 12291, 12510, 15032, 22329, 24273, 25940, 26203], "如果原经历不能直接支撑目标岗位，就补充最相关的课程、项目或自主实践作为定位证据；写法要围绕目标岗位需要的工具、方法、任务和产出。");
set([10488, 15853, 15452], "简历要随着新项目和新技能及时更新。每完成一个能支撑目标方向的课程、项目或训练成果，就把它整理成可投递的经历证据，而不是只停留在学习记录里。");
set([12213], "项目标题、角色和技能列表都要服务同一个目标方向。标题保持简洁专业，角色名称贴近目标岗位，技能只保留能支撑该方向的主流能力。");
set([24631, 974, 5069, 5894, 6964, 8088, 9179, 9552, 12002, 12006, 12627, 12644, 15451, 19664, 22036, 22120, 24875], "不要用一份简历投所有岗位。先建立素材库，再按目标方向筛选项目、经历和技能，做出不同版本，让每版简历只讲一个清楚的职业定位。");
set([2317], "如果年级还早、专业项目不足，可以先把重点放在课程、实践和可展示项目积累上；等有足够证据后再正式搭建求职简历。");
set([2414, 3154], "过旧或入学前的项目会削弱当前定位。优先替换为近期、大学阶段或研究生阶段更相关的课程项目、实验经历或实习证据。");
set([5755], "项目第一条 bullet 先写 high-level summary：概括你解决的问题、使用的方法和产出结果；后面的 bullet 再展开工具、步骤和细节。");
set([5794], "如果简历过于科研或学术，要主动补实习、项目或业务实践来平衡定位；课程项目可以使用，但写法要突出应用场景和岗位相关性。");
set([6465, 12256, 22666, 23199, 26249], "项目筛选要服务目标岗位。只保留最能证明目标能力、自己也能讲清楚的项目；相似或低相关项目要删除、降级或放到其他版本里。");
set([6967, 7322, 8962, 17757, 24840], "如果目标方向发生变化，要重新挖掘或补充该方向的技能和项目证据；不要只保留旧方向经历，要让 Skills、Projects 和 Summary 同时指向新定位。");
set([7981, 25377], "课程或训练项目可以补定位，但必须先真正做懂。理解项目逻辑后，再把最相关的项目写成工具、行动、方法和结果清楚的简历 bullet。");
set([8288, 19115], "先从目标 JD 提取核心关键词，再回头 fine tune 实习、课程项目和技能表达；多方向求职时，项目也要按方向分类管理。");
set([10916], "从过往课程和项目中筛选能支撑目标能力的模块，尤其是分析、商业判断、产品理解或数据处理相关内容，再补进项目经历板块。");
set([12555, 17809, 17816, 21353], "删除或弱化与目标方向无关的经历，把版面换给更能证明目标岗位能力的实习、课程项目、技术项目或业务项目。");
set([13603, 24614], "不同类型经历要归类清楚：正式实习或工作放 Work / Professional Experience，课程或个人项目放 Projects，研究经历放 Research，避免标题和内容错位。");
set([14250], "如果课内项目都围绕同一旧背景，可以补一个不同场景的独立技术项目，让简历证明的是目标岗位能力，而不只是原专业背景。");
set([15168], "项目描述不要按过程流水账写。用项目最终状态或最终成果来概括核心贡献，再补关键方法和结果，避免把每个阶段都铺开。");
set([17418], "刚入学或经历还少时，先把已有实习认真打磨，再补 1-2 个高相关项目，形成工作经历加项目证据的基本结构。");
set([17829, 22390], "当工作经历和目标岗位不完全贴合时，用目标方向相关的课程项目、领导力或软技能模块补位；同时删除明显偏离目标的 bullet。");
set([17859], "课程项目没有真实商业影响时，不要硬写业务结果。可以诚实强调学到的技能、掌握的工具、模拟决策过程或可迁移的方法。");
set([19114], "简历超过一页时，先压缩到核心结构：Education、Professional Experience、Project Experience。工作经历少时，用相关项目补充定位，但每条都要有明确价值。");
set([19177], "建立个人内容库，把过去几年所有课程、论文、研究、活动、媒体链接和项目先收集起来；之后按目标岗位挑选最相关的证据写入简历。");
set([21430], "如果正式经历偏非技术，但目标是技术岗位，要优先挖掘课程、个人或工作中偏 technical 的部分，单独写成能证明技术能力的经历证据。");
set([22422], "有实习时，优先把重要技术关键词和工程细节写进实习经历；课程项目保留关键亮点即可，不要让项目抢走正式经历的权重。");
set([22629], "项目排序也在传递定位。把最贴近目标岗位、最容易被 HR 理解的项目放前面，低相关或专业术语过重的项目后置或删除。");
set([26618], "如果目标是美国或北美市场，要前置可验证的本地或跨国经历证据；其他地区经历保留最相关部分，并写清英文交付物、技术栈、业务对象和量化结果。");

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
      canonical_action_family: "summary_positioning",
      action_depth: "evidence",
      action_review_status: "approved",
      review_reason: "reviewed_summary_positioning_batch_01: case-specific raw action generalized; original A_action retained but not displayed raw",
    },
    review_decision: {
      reviewer: "chat_context",
      decision: "approved_generalized",
      notes: "保留原始 mentor 判断，去掉上一位学生的方向、课程、项目、学校、公司或工具细节；前端显示 generalized_action。",
    },
  };
}

const rows = JSON.parse(fs.readFileSync(INPUT, "utf8"));
if (!Array.isArray(rows) || rows.length !== 69) {
  throw new Error(`Expected 69 rows, got ${Array.isArray(rows) ? rows.length : "non-array"}`);
}

const reviewedRows = rows.map(reviewed);
fs.writeFileSync(OUTPUT, JSON.stringify(reviewedRows, null, 2));
console.log(JSON.stringify({ input: INPUT, output: OUTPUT, rows: reviewedRows.length }, null, 2));
