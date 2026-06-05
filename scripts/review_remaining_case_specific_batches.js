"use strict";

const fs = require("fs");
const path = require("path");

const BATCH_DIR = path.join(
  process.cwd(),
  "data",
  "audit",
  "segments_action_review_batches"
);

const INPUTS = [
  "case_specific_experience_evidence_rewrite__batch_01_2026-06-05T01-32-55-549Z.json",
  "case_specific_experience_evidence_diagnose__batch_01_2026-06-05T01-32-55-549Z.json",
  "case_specific_summary_positioning_rewrite__batch_01_2026-06-05T01-32-55-549Z.json",
  "case_specific_summary_positioning_diagnose__batch_01_2026-06-05T01-32-55-549Z.json",
  "case_specific_jd_keyword_alignment_rewrite__batch_01_2026-06-05T01-32-55-549Z.json",
  "case_specific_jd_keyword_alignment_diagnose__batch_01_2026-06-05T01-32-55-549Z.json",
];

const OUTPUT = path.join(
  BATCH_DIR,
  "reviewed_case_specific_remaining_2026-06-05T01-32-55-549Z.json"
);

const actions = new Map();

function set(ids, action) {
  for (const id of ids) actions.set(Number(id), action);
}

set([2321], "如果课程项目还没开始，可以提前选择与目标岗位相关的题目；完成后把项目按问题、方法、工具和成果写成 Projects 证据。");
set([4030], "团队项目不一定要夸大角色。写清自己真实贡献，如资料整理、分析、slides、demo、documentation 或交付支持。");
set([12528], "转方向后，把新方向课程或项目整理为简历证据；学校、专业和背景表述保持真实，重点让 Summary 和 Projects 指向目标岗位。");
set([22061], "职位 title 要和实际职责及可验证记录一致；如果承担了带队或管理职责，可在 bullet 中体现 leadership，不要把未正式确认的 title 写成已任命。");
set([25684], "把协作色彩弱、技术贡献强的经历改写成端到端流程：数据准备、自动化处理、报告或交付和结果，让个人技术贡献成为主线。");
set([488], "写 bullet 前先把项目故事讲清楚：背景、问题、行动、发现和结果；再提炼成 2-4 条最有价值的简历 bullet。");
set([1589], "课程或小组项目可从项目管理、分工协作、文档交付和技术实现几个角度展开，前提是每个贡献都是真实发生的。");
set([2055], "把已有经历按目标方向重写：挑出最像咨询、营销或分析工作的任务，写清问题、分析框架、建议和交付物。");
set([2065], "缺少目标方向项目时，可用高质量实践课程或自建项目补位；写清渠道、工具、策略、指标和结果，不要只写课程名。");
set([2257], "商业或咨询类课程项目要把分析工具、数据来源、调研方式、分析框架和建议产出写清楚，避免只写“提出方案”。");
set([3333], "相关实习即使短，也比空白更有价值；可以保留但要诚实说明周期、任务边界和具体产出。");
set([3948], "两段经历任务相似时，用业务场景、服务对象、数据规模或技术复杂度区分，不要让第一句都写成同一种功能实现。");
set([7036], "课程技术项目要先用一句话说明系统给谁用、解决什么问题，再写数据库、后端、前端实现和结果。");
set([7977], "分析类项目不要停在报告总结；补上建模方法、时间跨度、指标关系和预测结论，让项目体现分析深度。");
set([10468], "跨专业经历要先挖掘可迁移证据，如数据整理、统计分析、实验记录、报告输出；能转成目标岗位语言的再保留。");
set([10473, 10477], "课程项目标题要像正式项目成果，不要直接写“上课作业”；描述中补数据规模、方法、指标和个人贡献。");
set([10486], "机器学习或预测类项目按目标、数据、模型对比、调参和评估指标写，避免只写学习了某个算法。");
set([13418], "先把所有非考试型课程成果列成素材，再按背景、问题、行动和交付物整理，作为后续简历项目候选。");
set([14181], "数据项目要从分析走到建议：先写数据和方法，再写洞察，最后补对营销、产品或业务决策的 recommendation。");
set([15270], "产品方向需要可展示作品。把课程或个人项目按 roadmap、用户问题、功能方案、交付物和结果写清楚；作品链接只有质量够时再前置。");
set([21624], "不要把项目写成“学习过程”。改成实际应用：用了什么工具或模块，处理了什么问题，输出了什么分析或功能。");
set([22525, 22531], "不要把课程项目包装成虚假的实习或工业项目。可以提升项目呈现方式，但经历性质、公司和数据来源必须真实可解释。");
set([25198], "多个相关课程项目可以整合成一个完整项目主线，再补一个更接近实战的项目，让简历既有深度也有岗位相关性。");
set([26373], "Projects 可以放课堂、课外、自主或研究项目；筛选标准是技术栈、功能实现、研究深度和目标岗位相关性。");

set([25], "同质化热门项目不要占据核心位置；如果保留，必须写出独特数据、评估方法、业务场景或量化效果。");
set([11762], "诊断泛化 bullet：每条改成背景或目的 + 具体行动 + 可验证结果，至少包含一个工具、对象、规模或影响指标。");
set([487], "判断经历归类时看是否可验证：能被背调或证明的写 Work/Internship，不能的写 Project/Research，并保持标题诚实。");
set([1758], "项目尚未完整时，先按目标、数据流程、方法选择、评估结果和交付物设计 bullet 框架，完成后再填真实内容。");
set([3057], "已有足够强实习时，Projects 只保留高度相关且质量突出的内容；低相关项目应删除，避免稀释主线。");
set([3782], "把经历改写为目标岗位可读的四步：解决什么问题、处理什么数据、得到什么结论、如何向 stakeholder 呈现建议。");
set([8862], "购买或跟做的课程项目必须先吃透技术选型、系统限制和扩展方案；讲不清楚前不要放到简历核心位置。");
set([10472], "诊断项目价值：没有数据规模、分析方法、技术实现或具体产出的文献综述或纯作业，不适合作为核心项目。");
set([12301], "从课程 syllabus 和作业中识别可写项目，优先选有数据、工具、分析过程和结果的内容补进 Projects。");
set([15112], "单条 bullet 项目通常信息不足；补充决策过程、假设、优先级、成本或约束，让项目能支撑目标岗位能力。");
set([17865], "具有真实操作、真实客户或真实决策性质的课程项目，可提高权重；写法要强调操作过程、交付物和结果。");
set([22142], "只证明基础工具使用的项目含金量有限；等有完整成果、规模、设计复杂度或业务影响后再作为强项目展示。");

set([1032], "目标方向项目要先补齐知识和实操，再按 summary、工具方法和结果重写；不要在没做懂前只堆关键词。");
set([4698], "转向设计或产品类岗位时，把已有经历改写为用户问题、协作、设计决策和反馈结果；相关课程项目可作为补充证据。");
set([5226], "同一段经历要按目标方向改写重点：投金融或投资就突出财务分析、估值、报表和判断；低相关叙事要删掉。");
set([5657], "用更相关的课程或项目替换弱项目时，不要直接套模板；要结合自己实际操作、数据、方法和结果改写。");
set([9316], "产品或增长方向可围绕用户访谈、GTM、产品 insight 三类证据重写经历；每类都要对应真实项目或任务。");
set([11543], "不要把没用过的工具硬写进工作经历。可以在课程项目中体现该技能，工作经历则只写真实发生的数据整理或分析任务。");
set([14808], "参考模板时要保留结构、替换内容：用自己的项目背景、工具、步骤和结果改写，避免和其他人简历雷同。");
set([18267], "每次完成课程项目后保存 PPT、报告、截图、代码和结果记录；这些材料会决定之后能否写出具体、可信的简历内容。");
set([23881], "PM 项目要从路线图、用户问题、deliverables、分析方法和 UX/流程设计来写，避免只列课程任务。");
set([25197], "多个课程项目可以合并成一个更完整的项目条目，按共同问题、技术栈、个人贡献和最终产出重组。");
set([26609], "面向美国岗位时，保留最相关经历并改写成美国招聘方能理解的证据：业务对象、英文交付物、技术栈、指标和跨国协作。");

set([13453], "把每次修改意见沉淀成最终版 checklist：定位、关键词、经历证据、格式逐项确认后再投递。");
set([1965], "先诊断项目是否支撑目标方向：它解决的是宏观系统设计、技术实现还是安全运营；定位清楚后再决定放入哪个版本。");
set([10570], "优先展示最近、最相关、最能证明当前技术状态的项目；旧项目只有在更强或更匹配时才保留。");
set([10917], "给每个项目按目标岗位相关度、掌握程度、可量化结果和可展示材料打分，保留高分项目，低分项目删除。");
set([11508], "逐项挖掘经历中的目标岗位任务，在不虚构的前提下换成目标方向语境；能支撑定位的内容才展开。");
set([14334], "先列出课程和技能并自评强中弱，再和 JD 对照，决定简历主打哪些课程项目、技能和版本方向。");
set([22664], "简历满一页时，保留最相关、最差异化、最能证明核心技能的项目；删除逻辑重复或背景相近的项目。");
set([23928], "归类不只看身份标签，也看相关性和交付物；强相关项目可提高展示优先级，但经历性质必须写清楚。");
set([26255], "按目标岗位核心能力筛选经历；保留最能证明产品、市场、用户、增长或行业理解的内容，低相关旧经历删除。");

set([15166], "每条 bullet 用 action verb 开头，包含方法或工具、对象和结果；时态保持统一，句子短而具体。");
set([20493], "把“做了展示”改成具体交付：用了什么工具做可视化或分析，向谁呈现了什么 insight，产生了什么决策价值。");
set([21921], "只有真实做过部署或云端交付，才写 DevOps/Cloud；否则只写本地开发、测试或应用实现，避免技能过度包装。");
set([22388], "金融或风险类经历要把分析对象、指标、方法和输出写清楚；不要直接套某个旧 JD 的资产类别或监管词。");
set([6833], "项目标题要用行业 + 分析角度命名，让 HR 一眼看懂主题；描述中再写数据、方法、结论和关键词。");
set([18164], "团队项目写自己的具体贡献，实习经历写真实协作对象和交付；不要把 group project 和 internship 的协作叙事混用。");
set([26248], "课程项目标题要改成外部 HR 能看懂的通用名称；描述按协作规模、具体任务、方法和产出组织。");
set([26614], "上传文件名用专业格式，如 FirstName_LastName_Resume_TargetRole.pdf；删除 final/new/copy/v3 等内部版本词，并确认 PDF。");
set([1571], "每投一个 JD 都先提取硬性关键词和软性关键词，检查 Summary、Skills、Experience 是否有真实覆盖。");
set([1760], "不要为了条数限制压缩有价值项目；每个重要技术点、方法和结果都应有独立 bullet 或清楚短句呈现。");

function loadRows() {
  return INPUTS.flatMap((filename) => {
    const rows = JSON.parse(fs.readFileSync(path.join(BATCH_DIR, filename), "utf8"));
    if (!Array.isArray(rows)) throw new Error(`${filename} did not contain an array`);
    return rows.map((row) => ({ ...row, review_source_batch: filename }));
  });
}

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
      canonical_action_family: row.proposed.canonical_action_family,
      action_depth: row.proposed.action_depth,
      action_review_status: "approved",
      review_reason: "reviewed_remaining_case_specific_batches: case-specific action generalized; original A_action retained but not displayed raw",
    },
    review_decision: {
      reviewer: "chat_context",
      decision: "approved_generalized",
      notes: "保留原始 mentor 判断，去掉上一位学生、公司、课程、JD 或工具细节；前端显示 generalized_action。",
    },
  };
}

const rows = loadRows();
const ids = rows.map((row) => Number(row.id));
const uniqueIds = new Set(ids);
if (rows.length !== 68) throw new Error(`Expected 68 rows, got ${rows.length}`);
if (uniqueIds.size !== rows.length) throw new Error(`Duplicate ids found in remaining rows`);

const missing = ids.filter((id) => !actions.has(id));
const extra = [...actions.keys()].filter((id) => !uniqueIds.has(id));
if (missing.length || extra.length) {
  throw new Error(`Action coverage mismatch: missing=${missing.join(",")} extra=${extra.join(",")}`);
}

const reviewedRows = rows.map(reviewed);
fs.writeFileSync(OUTPUT, JSON.stringify(reviewedRows, null, 2));
console.log(JSON.stringify({
  output: OUTPUT,
  inputs: INPUTS.length,
  rows: reviewedRows.length,
  families: reviewedRows.reduce((acc, row) => {
    const key = `${row.proposed.canonical_action_family}:${row.proposed.action_depth}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {}),
}, null, 2));
