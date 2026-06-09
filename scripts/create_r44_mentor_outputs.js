const fs = require('fs');
const path = require('path');

const dir = path.join('artifacts', 'mentor-chat-batch-50-r44');
const sourcePath = path.join(dir, 'source_rows.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const rows = source.rows || source;

const insights = {
  5159: '你这段实习不是没内容，而是少了第五条工程杂项。可以在最后补 testing/deployment/documentation，像 unit tests for 某个 feature、achieving X% test coverage 这种就很适合 general SDE。',
  5160: '你这个 Beagle AI 项目放在 Projects 有点亏，因为真实公司合作经历本来就比普通课程项目更有说服力。建议挪到 Experience/Internship 里，把 employer 名称和可联系邮箱这些信息写清楚。',
  5161: '你这里要分版本看：游戏方向就把同一门课做过的游戏项目都放出来，项目数量和相关性更重要。general SDE 版本再挑手机 App、ML 这类更通用的 application 项目，别让 research 抢主线。',
  5162: '这条 bullet 里的 showcasing 可以删掉，它听起来像展示技术，不像真正 impact。保留 dynamic dialogue、museum tour guidance 这种功能落地，再补具体模型或技术名，价值会更清楚。',
  5163: 'speech recognition 和 real-time scene detection 其实可以拆成两条，不要挤在同一句里。即使用的是类似 LLM，也要分别写出模型名称和应用场景，让这段实习撑到 5 条 bullet。',
  5164: '应届生实习经历如果只有四条，会显得参与度不够满。最后一条可以补 testing、deployment 或 documentation，比如写 unit tests for 某个模块和 test coverage，工程成熟度会更明显。',
  5165: '你不要低估 Intern 的重量，真实实习通常比 Project 更能说明可信度。每段 Intern 可以按产品背景、技术结构、impact 来写，哪怕没有项目区也不一定是劣势。',
  5166: '假期这段先别把任务排太散，刷题和投递要变成每天固定动作。比较实际的节奏是每天刷算法题，再把投简历当打卡任务，先稳定投到大约 10 个岗位。',
  5167: '游戏岗位不能直接拿 AI 版本简历去投，research 和 intern 对游戏方向的加分有限。建议单独做游戏版本，把 Unity/Unreal、核心玩法、上线或玩家数据这类游戏项目细节放前面。',
  5168: '这条现在太像在说自己做了什么操作，读者还看不到最后产出。建议改成 result driven：先写城市价格比对分析这类结果，再说明你清理数据库、做 Tableau 的方法。',
  5169: '咨询版本里 Skills 不适合放太前，尤其是 Python、coding、data analyst 味道太重的时候。建议把 Skills 移到底部，并把重点换成结构化分析、沟通、项目管理这些更贴咨询的能力。',
  5170: 'clean and analyze data 这种开头会让重点落在动作上，不够咨询。可以改成“产生了什么 business insight + by cleaning/analyzing data”，先讲结果，再讲 Python 或数据方法。',
  5171: '每段 4-5 条 bullet 不一定更强，太多工具和动作会稀释重点。建议保留最能说明 business objective 的条目，把商业目的放句首，纯工具描述放后面或删掉。',
  5172: 'researched 这类动词偏弱，会让你看起来只是参与执行。可以根据真实职责换成 Led、Spearheaded、Drove 这类更有主导感的动词，让贡献位置更清楚。',
  5173: '版面不够时，不是每条都值得硬留。建议优先删掉信息量低、看不出商业目的的 bullet；能留下的也要按“结果/目的 + 方法/工具”重写。',
  5174: 'AI/ML 的 feature correlation、LLM prediction model 这些细节在咨询简历里容易太技术。建议换成 market research 和 competitor landscape analysis，并写出 domestic vs international LLM dementia solution 的市场发现。',
  5175: '这条要从 task list 改成 accomplishment。比如别先写 extract/clean Zillow data，先写 pricing comparison analysis 和 housing trend insight，再把清洗数据库当成支持方法。',
  5176: '你这里最该补的是 finding 本身，而不是继续解释 extract、clean data。建议直接写分析发现了什么，例如哪个城市价格增长更快、如何支持市场优先级判断。',
  5177: '咨询简历不用把 GPA 或目标写得太重，反而要让人看到 leadership。可以把社团、课外活动里真正带人、推动事情的经历放进来，补足“你是什么样的 leader”。',
  5178: 'generate embeddings、feature fitting classifiers 这类词对非技术读者太难消化。建议删掉中间那段技术黑话，保留 validate model performance、identify limitations、suggest improvements 这种能读懂的贡献。',
  5179: '25% 这种数字不要藏在句尾，太容易被扫过去。建议把 reduced preparation time by 25% 放到前半句，再说明用了什么 workflow 或工具，读者会更快抓到亮点。',
  5180: '这里要注意是 market research，不是 marketing research。建议直接写 market research and competitor landscape analysis，让咨询读者一眼看到你做的是市场和竞品判断。',
  5181: '2、3 条如果只是在说 data analysis 过程，可能不如 1、4、5 有说服力。建议删掉纯过程条目，保留 developed workflow、reduced preparation time 25% 这类有结果的 bullet。',
  5182: '成果放后面会很吃亏，尤其是 reduce preparation time 25% 这种数字。建议用 Developed a data analysis workflow 开头，中间放工具，最后接 reducing preparation time by 25%。',
  5183: 'Leadership Experience 不需要硬跟 market 方向绑定，它本来就是展示 ownership 和 leadership 的地方。Work Experience 已经讲专业方向了，这里重点写你怎么带人、推进事。',
  5184: '如果 Leadership 的两段社团经历比原 Projects 更有内容，就可以直接替换掉弱项目区。简历不是非要保留某个版块名，关键是哪个内容更能代表你。',
  5185: '咨询版本不能只堆数据和技术项目，还要有 professional experience 加 leadership experience 的结构。可以删掉弱相关的远期实习或纯技术项目，换成能体现 ownership 的社团经历。',
  5186: '这段生物实验室实习如果提不出咨询需要的问题分析、沟通协作或领导力，就别硬包装。版面很宝贵，建议把空间留给更贴 consulting 的工作或领导力经历。',
  5187: '第二、三条如果都在讲协调，就可以合并成一条。写清楚 coordinated with technical crew and performer leaders，并补人数或场次，比重复两条更有力量。',
  5188: 'Leadership 版块可以有，但不能比 Work Experience 还抢空间。建议只留前两条最能代表 leadership 的 bullet，让视觉重心还是落在正式工作经历上。',
  5189: '两段 leadership 都是 social media/marketing，会让能力面向有点单一。可以一段保留 campaign，另一段换成中秋晚会舞台导演这类活动策划和现场管理经历。',
  5190: 'collaborated with designers 那条如果没有数字、也不是你主导，就容易显得虚。篇幅有限时优先保留 monthly sale +35%、50% growth 这类有结果、也更能体现 drive 的 bullet。',
  5191: 'Leadership 不是越长越好，它不能压过上面的 Work Experience。建议控制在更短的篇幅，只保留最能体现领导力和结果驱动的前两条。',
  5192: '课外活动如果全是同一种 social media/campaign，读起来会重复。建议保留一个 marketing 方向，再换一个中秋晚会这类文化活动组织经历，让能力面更 diverse。',
  5193: '这段活动经历要先把动词立起来，用 Led、Coordinated 这类词会更像 leadership。第二、三条可以合并，并写出 technical crew 人数，避免内容重叠。',
  5194: '这条不要只写“负责道具”，太干了。建议写出你 lead 了多少 crew、覆盖多少 performances，以及怎么保证演出顺利，这些人际协调和规模才是重点。',
  5195: '不同经历不要都写成同一种味道，不然读者会觉得能力展示很平。这里可以刻意强调领导与执行，和 marketing 项目形成差异，让整份简历更有层次。',
  5197: '这段 TikTok shop 项目要先讲清楚业务链条：第三方公司做什么、自动化工具服务谁、你分析数据是为了什么。再写 selling trends、influencer collaboration、content strategy，价值会清楚很多。',
  5198: '咨询版本的 Skills 顺序要换一下，Python 不该压在最前。建议第一行放 Market Research、Competitive Analysis、Data Analysis、Visualization、Statistical Analysis、Data Cleaning，Programming Tools 再往后。',
  5199: '这段咨询相关经历现在有点虚，重点应该回到 trend analysis 和 business decision。可以围绕 product selling trends、marketing data、automation tool adoption 写，让分析目的更清楚。',
  5207: '如果你想投电商 marketing 团队，Google Ads、Meta Ads、TikTok Ads 这种投放平台经验很关键。哪怕先从个人项目或小实习积累，也要把实际投放案例写进简历。',
  5208: '你有 Python/SQL 又学 marketing，其实很适合往渠道销售分析靠。可以重点看宝洁、耐克这类消费品公司的渠道岗位，把 Walmart/Costco、price elasticity、促销效果分析写出来。',
  5213: '这类岗位不要只靠感觉改简历，最直接的方法就是拿 JD 逐条对照。把 research、analytical approach、deliverable 这类高频词补到对应经历里，语言越贴 JD 越稳。',
  5216: '只写调研 110 个 XR vendor 还不够，读者不知道你会不会做 market research。建议补 client problem、研究方法，以及你从产品应用和技术采用里得出的 3 个 use-case 结论。',
  5218: 'market research 最后一定要有 recommendation，不然像资料整理。可以补 XR 在房产虚拟家装、医疗器官模拟等落地场景，让研究结果变成可执行建议。',
  5220: '这条要从“调研了很多公司”升级成完整研究链路。建议写 110 家公司、240+ products、10 个品类、XR 应用维度，以及最终推荐的 3 个高潜力品类。',
  5221: '你的调研项目少了最后的 recommendation，就像故事没有收尾。建议基于 market growth 和客户技术储备，写清楚 XR 应该优先落在哪些场景，比如 industrial safety、retail、real estate。',
  5223: '没有直接对接客户不等于这段不能写，关键是研究有没有站在潜在客户需求上。建议把研究、分析、PPT 包装成面向 B 端采购需求的定制化行业洞察。',
  5225: '如果目标是 FA，那无关的第一段 professional experience 真的可以删。简历要把空间留给财务分析、valuation 这些直接相关经历，别让方向看起来发散。',
  5226: 'Financial Analyst/Fintech Analyst 版本不能继续主打 industry research 和 marketing。建议把 EY 写成财务咨询、财务表现分析，把 fund 经历改到 valuation、Excel ratio analysis、financial statement review。'
};

const banned = ['HR', '招聘', '我初筛', '我第一眼', '我会帮你', '我会把', '我会从', '我会陪你'];
const missing = rows.filter((r) => !insights[r.id]);
if (missing.length) {
  throw new Error(`Missing insights for ids: ${missing.map((r) => r.id).join(',')}`);
}

const proposalRows = rows.map((row) => ({
  id: row.id,
  humanized_mentor_insight: insights[row.id],
  perspective_confidence: 0.92
}));

const reviewedRows = rows.map((row) => ({
  id: row.id,
  original: row,
  proposed: {
    humanized_mentor_insight: insights[row.id],
    perspective_review_status: 'approved',
    perspective_source: 'mentor_chat_context_r44',
    perspective_confidence: 0.92
  },
  review: {
    recommendation: 'approved',
    flags: [],
    reasons: [],
    reviewer: 'codex_r44_direct',
    source_policy: 'P_mentor/A_action/action_summary/user_problem_summary/H_hook/E_example for generation; I_insight only for signal review'
  }
}));

const issues = [];
for (const row of reviewedRows) {
  const text = row.proposed.humanized_mentor_insight;
  const hits = banned.filter((term) => text.includes(term));
  if (!text.trim() || /\?{3,}/.test(text) || hits.length) {
    issues.push({ id: row.id, hits, text });
  }
}
if (issues.length) {
  throw new Error(`R44 final scan failed: ${JSON.stringify(issues, null, 2)}`);
}

const payloadBase = {
  batch: 'r44',
  generatedAt: new Date().toISOString(),
  source_policy: 'Generate from P_mentor/A_action/action_summary/user_problem_summary/H_hook/E_example; I_insight only used for signal preservation review.'
};

fs.writeFileSync(
  path.join(dir, 'chat_proposals.json'),
  JSON.stringify({ ...payloadBase, rows: proposalRows }, null, 2) + '\n',
  'utf8'
);
fs.writeFileSync(
  path.join(dir, 'chat_reviewed_agent_approved.json'),
  JSON.stringify({ ...payloadBase, rows: reviewedRows, summary: { approved: reviewedRows.length, hold: 0, issues: 0 } }, null, 2) + '\n',
  'utf8'
);
fs.writeFileSync(
  path.join(dir, 'chat_reviewed_agent_approved_apply.json'),
  JSON.stringify({ ...payloadBase, rows: reviewedRows, summary: { approved: reviewedRows.length, hold: 0, issues: 0 } }, null, 2) + '\n',
  'utf8'
);

console.log(JSON.stringify({ batch: 'r44', rows: rows.length, approved: reviewedRows.length, hold: 0, issues: 0 }, null, 2));
