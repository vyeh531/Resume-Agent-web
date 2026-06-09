"use strict";

const fs = require("fs");
const path = require("path");

const batchDir = path.join("artifacts", "mentor-chat-batch-50-r45");
const sourcePath = path.join(batchDir, "source_rows.json");
const proposalsPath = path.join(batchDir, "chat_proposals.json");
const reviewedPath = path.join(batchDir, "chat_reviewed_agent_approved.json");
const applyPath = path.join(batchDir, "chat_reviewed_agent_approved_apply.json");

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const rows = source.rows || [];

const mentorById = new Map([
  [5227, "你这里不是在编经历，重点是把真正会的 financial statement analysis 和 ratio analysis 放出来。课堂项目也可以写，只要你面试时能讲清方法和产出。"],
  [5228, "这段 fund 经历别再主打 marketing，和 finance 目标会打架。建议改成 valuation、Excel financial ratio、financial statement analysis，让读者看到投资分析能力。"],
  [5229, "你现在缺的是 FP&A 语言，不是完全没有材料。EY 和 Capgemini 的 bullet 可以往 financial performance analysis、forecasting、budgeting、financial modeling 靠。"],
  [5233, "这类格式小问题不用复杂化，日期月份统一成 Jan、Feb、Sep 这种三字母缩写就好。整份简历视觉一致，专业感会明显稳一点。"],
  [5234, "你同时投 marketing 和 finance，就不要硬用同一份简历。Marketing 版保留相关项目，Finance/FA 版删掉纯 marketing 经历，把金融和咨询公司经历顶上来。"],
  [5235, "这段经历如果只做了 7 天却写很多成果，读者会觉得时间和产出对不上。日期至少要能支撑一个月左右的工作量，别让可信度先被质疑。"],
  [5237, "联系方式这里不用写到 apartment number，城市和州已经够了。邮箱建议用 Gmail 这类通用邮箱，edu 邮箱能用但不一定最稳。"],
  [5238, "费城地址不用刻意藏，地址主要是让公司端知道你现在在哪里。后面谈 relocation 或 onsite 安排时，这个信息反而是正常必要的。"],
  [5241, "你这段初创卖课经历其实能写出数字营销含金量。Social media、search ads、YouTube ads、PMAX campaign、influencer 合作这些都要拆成具体 bullet。"],
  [5243, "这类 Excel 工作先别急着嫌简单，先把实际做过的流程口述清楚。比如多个表格按共同 key 汇总、joining、清洗，本来就可以变成数据整合经历。"],
  [5245, "你这里先别凭空想 bullet，而是把实际做过的事讲出来。像公司分类、股权结构 research、Excel 录入，都可以再包装成更专业的研究流程。"],
  [5246, "简历可以适度包装，但底线是每一条面试时都能讲清楚。建议只写你能复盘操作细节和结果的内容，别为了好看把自己架太高。"],
  [5247, "企查查、天眼查这些工具可以写，只是要换成专业说法。可以表达成利用 Chinese corporate database platforms 分析 ownership structures，不要把真实工具藏掉。"],
  [5248, "这项 research 不要因为单个任务短就写轻了。把 100+ companies、Qichacha、Tianyancha 和 due diligence 流程写出来，工作量才会被看见。"],
  [5249, "数据整理这条要补数量感，不然会像一句普通杂活。建议回忆 Excel 文件或数据表规模，写成 consolidated and cleaned financial data across 20+ files 这类表达。"],
  [5251, "每条 bullet 尽量别超过两行，尤其是金融简历。太长时就删掉枝节或拆开，让一条只承担一个核心信息点。"],
  [5252, "这条 IPO 监管对比先要弄清你到底做了什么。若只是梳理港股和 A 股规则差异、整理 Excel，就按这个真实范围写，别写成完成度更高的分析。"],
  [5253, "你不用因为财务数据提取基础就不敢写，先把做过的事放出来。再在可解释范围内补 revenue、costs、cash flow 这类指标，让它更像完整分析。"],
  [5254, "NBA 相关经历的雇主要写准，你是快手驻场报道，不是直接把职位写成 NBA。可以写 Kuaishou reporter covering NBA G League，并把 press credentials 当成果补充。"],
  [5255, "日期可以调整，但前提是经历真实、背调能接得上。建议只写联系人或记录能支持的时间段，别让时间线超过实际可证明范围。"],
  [5256, "500+ companies 反而可能显得每家公司做得很浅。建议写 60+，再准备好说明官网下载、汇总、分析的流程，深度会比数字虚高更可信。"],
  [5258, "这段经历要按工作流程排 bullet：先数据收集，再 consolidate 和 summary，再提炼 regulatory landscape insights，最后落到 IPO pitch book 产出。"],
  [5260, "快手账号经历不要只写运营，要把赛前动态、赛中战术分析、赛后采访、观看时长和留存率这些细节展开。100K+ followers 也要放在显眼位置。"],
  [5261, "第一条 bullet 如果只写 managed social media 会太轻。建议同时写 NBA frontline reporting、primary data collection 和 interviews，让内容运营和实地报道都露出来。"],
  [5263, "快手这段经历既然真实、也能支持背调，就值得保留。顺序可以再调，但不要因为表达还没整理好，就把一段有辨识度的经历删掉。"],
  [5264, "你这段快手和 NBA 经历很有辨识度，要用量化方式写出来。100K+ followers、现场报道、球员采访和内容生产，都是比普通媒体经历更强的材料。"],
  [5265, "这段可以按 end-to-end NBA game reporting 来写。赛前摄影、赛中 highlights、赛后 interviews，再接 100K+ followers，结构会比零散描述清楚很多。"],
  [5266, "你不是背景弱，是现有 Morgan Stanley、平安、国泰君安还没充分展开。排序上先放最新美国经历，再把这些金融机构经历配上具体成果。"],
  [5267, "没真实做过的社团和志愿经历不要硬留，价值比不上你上面的真实项目和工作。篇幅超了时，先删这些填充项，把空间留给可追问的经历。"],
  [5268, "篇幅超限时，volunteer 通常不是优先项。建议先保留 academic project 和实习经历，志愿者内容除非特别贴目标方向，否则可以删掉。"],
  [5270, "实习时间如果写到 2024 暑假，就不能只有两条 bullet。时间拉长，内容深度也要补上，并把 2024 经历按时间倒序往前放。"],
  [5271, "这条 bullet 建议按 summary、展开、结果三段写。先概括 end-to-end 工作，再展开关键动作，最后用 100K+ followers 这类结果收住。"],
  [5272, "大学社团如果只有一句话、没有量化成果，就别占版面了。对有工作经历的人来说，这类内容很难加分，不如让位给项目或实习。"],
  [5273, "你这里不是词不够高级，而是读者看不懂你实际做了什么。建议只保留能讲清动作和结果的 project，空泛的 divergence 这类表述要删或重写。"],
  [5274, "这个课程项目先把英文语法修准，between A and B 要完整。再写清研究对象，比如日中美不同时期消费行为对比，项目价值才站得住。"],
  [5275, "2024 年资产管理实习要往前放，近期相关经历不该埋在后面。简历按时间倒序排，读者第一眼才会看到你最新的金融背景。"],
  [5276, "term structure、calibration、momentum strategy 这些词可以留，但不能只堆术语。每条要说清具体任务、方法和结果，读者才知道你贡献了什么。"],
  [5277, "实习时间别为了好看拉到一年半，内容撑不住会被深问。建议按实际核心工作时长写，比如三个月就写三个月，把能讲细的成果写扎实。"],
  [5278, "这段时间跨度要和产出匹配，别让一年半的经历只对应很少内容。写短一点反而安全，只要三个月的工作量能讲清楚，就比硬拉长更稳。"],
  [5279, "美国本土实习不管远程还是线下，都值得放到最新位置。它能帮你补在美经验的信号，时间越接近投递期越有说服力。"],
  [5280, "格式先改成美国市场常见结构，别让读者找 Education 找半天。Contact、Education、Experience、Skills 清楚排好，内容才有机会被认真看。"],
  [5281, "Certifications 如果和目标职位不相关，就删掉别占空间。Technical skills 仍然要保留，但证书栏只留下真正能支持目标方向的内容。"],
  [5282, "这份简历还可以继续打磨，但中金实习窗口不要错过。先用整理到一页的版本投出去，后面再专门优化 bullet 和量化表达。"],
  [5285, "JP Morgan 这类无法通过正式雇主核实的项目，不要放 Work Experience。移到 Projects，并注明 virtual program 或 supervisor 信息，会更稳。"],
  [5286, "2021 年经历离 2026 求职已经太远，空间紧张时优先压缩或删除。把版面让给 2022 年之后更相关的经历，整体会更有力量。"],
  [5287, "这份简历不是改几个动词就能解决，核心是内容重构。先定目标方向，再筛出相关经历、补缺失能力，最后才做语言 polish。"],
  [5290, "格式不符合美国简历习惯时，读者会先被版面卡住。建议把 Education、Experience 等模块按常见顺序排清楚，先降低阅读阻力。"],
  [5291, "这条不是简单加关键词，而是要让简历真正贴 JD。先拆 responsibility 和行业术语，再把 portfolio management、client advisory 这类词放进对应经历。"],
  [5292, "JP Morgan 开源虚拟项目不能当 professional work experience。建议放到 Projects，写清 Virtual Program 或 Self-directed Project，避免后续核实时卡住。"],
  [5293, "2021 年及更早实习对现在求职帮助有限，尤其在一页空间紧张时。建议删掉早期经历，把位置留给 2022-2023 之后更相关的 bullet。"],
]);

const banned = ["HR", "招聘", "我初筛", "我第一眼", "我会帮你", "我会把", "我会从", "我会陪你"];

function originalFor(row) {
  return {
    P_mentor: row.P_mentor || "",
    A_action: row.A_action || "",
    action_summary: row.action_summary || "",
    user_problem_summary: row.user_problem_summary || "",
    H_hook: row.H_hook || "",
    E_example: row.E_example || "",
    I_insight_detail_review_only: row.I_insight || "",
  };
}

const proposalRows = rows.map((row) => {
  const id = Number(row.id);
  const text = mentorById.get(id);
  if (!text) throw new Error(`Missing R45 proposal for id=${id}`);
  const hits = banned.filter((term) => text.includes(term));
  if (hits.length) throw new Error(`Banned term in id=${id}: ${hits.join(", ")}`);
  if (/\?{3,}/.test(text)) throw new Error(`Encoding issue in id=${id}`);
  return {
    id,
    humanized_mentor_insight: text,
    perspective_confidence: 0.9,
  };
});

const reviewedRows = rows.map((row) => {
  const id = Number(row.id);
  const text = mentorById.get(id);
  return {
    id,
    original: originalFor(row),
    proposed: {
      humanized_mentor_insight: text,
      perspective_review_status: "approved",
      perspective_source: "chat_mentor_from_p_mentor",
      perspective_confidence: 0.9,
    },
    review: {
      recommendation: "approved",
      flags: [],
      reasons: [],
    },
  };
});

const proposals = {
  generatedAt: new Date().toISOString(),
  table: "vibe_offer.segments",
  generationMode: "chatbox_no_external_api",
  source: "chat_mentor_from_p_mentor",
  rows: proposalRows,
};

const reviewed = {
  generatedAt: new Date().toISOString(),
  table: "vibe_offer.segments",
  dryRun: true,
  generationMode: "chatbox_no_external_api",
  source: "chat_mentor_from_p_mentor",
  rows: reviewedRows,
  reviewSummary: { approved: reviewedRows.length, hold: 0, issues: 0 },
};

fs.writeFileSync(proposalsPath, JSON.stringify(proposals, null, 2) + "\n", "utf8");
fs.writeFileSync(reviewedPath, JSON.stringify(reviewed, null, 2) + "\n", "utf8");
fs.writeFileSync(applyPath, JSON.stringify(reviewed, null, 2) + "\n", "utf8");

console.log(JSON.stringify({
  batch: "r45",
  rows: reviewedRows.length,
  approved: reviewedRows.length,
  hold: 0,
  issues: 0,
  proposalsPath,
  reviewedPath,
  applyPath,
}, null, 2));
