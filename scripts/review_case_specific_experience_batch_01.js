"use strict";

const fs = require("fs");
const path = require("path");

const INPUT = path.join(
  process.cwd(),
  "data",
  "audit",
  "segments_action_review_batches",
  "case_specific_experience_evidence_evidence__batch_01_2026-06-05T01-32-55-549Z.json"
);

const OUTPUT = path.join(
  process.cwd(),
  "data",
  "audit",
  "segments_action_review_batches",
  "reviewed_case_specific_experience_evidence_evidence__batch_01_2026-06-05T01-32-55-549Z.json"
);

const actions = new Map();

function set(ids, action) {
  for (const id of ids) actions.set(Number(id), action);
}

set([1545], "把重复的数据处理内容合并成一条主线：先写你维护或清洗了什么数据，再写分析了什么业务问题，最后补上报告、协作或结果指标，避免多段经历都停留在同一种任务。");
set([1771], "如果正式项目经验不足，可以选一个最完整的课程或练习项目写入 Projects；按分析对象、目标、方法、数据处理、模型或评估结果拆成 3-5 条 bullet，确保每一步都能被追问。");
set([3707, 3712, 5660, 5739], "经验还不够时，可以用高质量课程项目、虚拟项目或训练项目补位；但只放自己真正完成并能讲清楚的内容，写清任务、方法、产出和与目标岗位的关联。");
set([6461], "把旧项目重写成完整的数据分析闭环：说明数据来源和清洗方式，按业务维度展开分析，再用可视化或报告呈现结论，让项目从工具练习变成岗位相关证据。");
set([8793, 489, 1056, 2836, 3053, 8818], "项目不是越多越好。优先保留与目标岗位最相关、数据或技术含量最高、有真实产出的项目；如果已有更强实习或工作经历，课程项目应降级、压缩或删除。");
set([9018, 19163], "工具不要只堆在 Skills 里。把真正会用的工具挂到一个具体项目里，写清使用场景、处理对象和产出；入门级技能可以诚实标注熟悉程度，避免面试被追问穿帮。");
set([10663], "如果目标岗位看重分析判断，就把项目里的评估指标写出来：先说明你用什么指标衡量表现，再解释这些指标如何支持决策，而不是只写完成了分析。");
set([12257, 24919], "项目标题要像一个专业成果，而不是作业标签。把泛泛的 main project / course project 改成能体现技术、研究对象或业务问题的标题，并避免和其他板块重复。");
set([12975, 12478], "检查项目和 bullet 是否重复；重复内容要删除或改写成不同贡献点。每条 bullet 最好对应不同任务、方法或结果，并尽量补上时间、规模、性能或影响数据。");
set([23834, 2996, 11273], "如果目标方向需要前沿技能，可以通过公开课、课程项目或自主项目补证据；但简历只写已经做出产出的部分，重点呈现实现过程、使用方法和可验证结果。");
set([25378, 1179, 1997, 11551, 12311], "每完成一个相关课程或训练项目，就及时整理成简历项目；不要只写课程名，要写数据来源、工具方法、关键步骤和最终产出，先形成可投递版本，再持续迭代。");
set([557, 4699], "协作经历必须基于真实发生的事情。不要空泛写 cross-functional 或 group work，而是写清你和谁协作、负责哪一部分、如何推动结果。");
set([1018, 1988, 10795], "把写进简历的项目重新过一遍，确认自己能讲清项目目标、数据、方法、结果和遇到的问题；没有真实操作基础的内容先补实操或删除。");
set([1055, 10920, 11522], "把研究或分析类项目写成业务决策语言：先交代问题，再写分析方法，最后补上你提出的 recommendation 或策略建议，让经历体现从分析到行动的价值。");
set([1080, 1240, 4656], "产品相关项目不要只写技术流程；补上一条业务需求或 PRD/BRD 视角的 bullet，说明你如何定义问题、用户流程、功能方案和 success metrics。");
set([1581, 5610, 9345], "有实习或工作经历时，应优先打磨 Experience，把最有工作含金量的经历放在项目之前；项目可以保留，但不要抢走正式经历的版面和注意力。");
set([1931, 6213, 7237, 8468], "系统盘点过往课程、小组作业和研究项目，只保留有实际操作或可展示产出的内容；每个候选项目先写清角色、工具、过程、结果，再决定是否放入简历。");
set([1967], "缺少相关实习时，可以用一个高相关项目补位；项目描述按需求分析、方案设计、实施过程和最终成果展开，重点证明你具备目标岗位的实际操作能力。");
set([2050, 7006], "转向咨询、市场或产品类岗位时，要把课程或项目包装成解决问题的经历：说明对象、问题、分析框架、建议方案和交付物，而不是只列学习内容。");
set([2649], "简历内容偏少时，先规划经历结构：优先放 2-3 段最强工作/实习经历，再补 1-3 个相关项目；每个模块都要能证明一个明确岗位能力。");
set([3458, 3467, 3824, 4314, 6403, 7641], "项目 bullet 里要补可验证的证据：数据规模、用户量、准确率、处理时长、成本节省、风险下降或成绩排名。没有精确数字时，也要用可信区间或规模描述。");
set([3692, 3700], "不要把多门课程作业混成一个模糊项目。挑出最有目标、数据和结论的一到几个项目单独写，每个项目都交代背景、工具方法、分析过程和结果。");
set([4129, 5403, 6752], "课程项目能不能放，关键看是否有真实产出和足够细节。只有概念或 prototype 的项目先不放；至少能写出 3 条实质 bullet 后，再作为项目经历展示。");
set([4886], "合并相似项目时，不要重复写同一类观察或研究过程；把用户研究、理论依据和设计决策串成一条逻辑，让项目体现清晰的问题分析和设计取舍。");
set([5160, 8057], "如果课程项目有真实公司、真实客户或外部交付物，可以适度提高它的权重；描述时重点写研究设计、执行过程、交付报告和业务 insight，不要只写成普通课堂作业。");
set([5274], "项目描述要先保证语言和结构准确，再补背景、研究对象和产出。尤其是比较类项目，要写清比较对象、分析维度和最后得到的结论。");
set([5718], "需要马上投递时，先把已经掌握且能解释的项目写进简历，不必等所有课程完成；后续再用更完整、更相关的项目替换初版内容。");
set([5790], "短期经历不要靠拉长时间来增强可信度。更好的做法是明确经历性质、项目周期和实际产出；必要时可合并相关项目与经历，但时间线必须真实。");
set([7049], "把课程项目当作真实应用来写：先说明产品或系统要解决的问题，再写核心功能、数据或后端设计，最后补上结果、限制或下一步优化。");
set([7403, 12480], "学术、研究或课程项目不要混在正式工作经历里。按性质放入 Project Experience / Research Experience，并用时间倒序或相关性排序，让 HR 快速理解经历类型。");
set([7627], "课程项目看起来普通时，优先提升呈现方式：写清真实场景、个人贡献、关键方法和结果证据，而不是硬把项目复杂度说大。");
set([8992], "不要把课程模型或实验项目包装成生产级经验。只有模型真的上线、被调用或参与部署，才写 implementation / deployment；否则就诚实写建模、验证或原型阶段。");
set([9181, 10053], "作品链接只在内容能加分时放。GitHub 或 portfolio 至少要有清楚 README、整洁代码、项目说明和可验证成果；内容空或质量弱时先不要放。");
set([9549], "选择项目时优先放自己掌握最扎实的内容。模板可以参考，但最终 bullet 必须和真实能力一致，确保面试时能解释每个工具、步骤和结果。");
set([10002], "课程项目不能直接复制模板。可以先用模板搭结构，但必须替换成自己的数据、方法、职责和结果，否则简历看起来会很空，也经不起追问。");
set([10068], "技术项目要写清贡献边界：用了什么语言或框架、负责前端/后端/全栈哪一块、有没有系统设计、项目规模多大，以及最终交付了什么。");
set([10483], "选课或补项目时，优先选择能产出简历作品的内容；纯工具学习可以自学补足，正式项目资源应服务于目标岗位需要的作品和经历证据。");
set([11009], "早期学生可以把相关课程项目写进简历，但要用项目成果命名，而不是只写课程名；重点说明自己完成的模块、使用工具和可展示结果。");
set([11443], "如果学校项目或活动占版面太多，先压缩低相关内容；有价值的项目可以迁移到更合适的经历或项目条目里，但不要让社团和课程作业盖过核心经历。");

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
      review_reason: "reviewed_batch_01: case-specific raw action generalized; original A_action retained but not displayed raw",
    },
    review_decision: {
      reviewer: "chat_context",
      decision: "approved_generalized",
      notes: "保留原始 mentor 判断，去掉上一位学生的项目、课程、工具或公司细节；前端显示 generalized_action。",
    },
  };
}

const rows = JSON.parse(fs.readFileSync(INPUT, "utf8"));
if (!Array.isArray(rows) || rows.length !== 80) {
  throw new Error(`Expected 80 rows, got ${Array.isArray(rows) ? rows.length : "non-array"}`);
}

const reviewedRows = rows.map(reviewed);
fs.writeFileSync(OUTPUT, JSON.stringify(reviewedRows, null, 2));
console.log(JSON.stringify({ input: INPUT, output: OUTPUT, rows: reviewedRows.length }, null, 2));
