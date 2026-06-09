"use strict";

const fs = require("fs");
const path = require("path");

const batchDir = path.join("artifacts", "mentor-chat-batch-50-r42");
const sourcePath = path.join(batchDir, "source_rows.json");
const outPath = path.join(batchDir, "chat_proposals.json");

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const mentorById = new Map([
  [4919, "你这条项目标题先别写成 research project 这种泛称，太可惜了。建议直接用 LLM Multi-turn Agent Reasoning 或 C++/CUDA 这类名字，把方向和技术栈先露出来。"],
  [4920, "你这里要先承认现实：硕士阶段硬走 LLM research interest 路线会很窄。短期找工作建议转向工程类岗位，除非你明确继续读博或冲企业研发中心。"],
  [4921, "这份简历现在不是没内容，是内容太多把重点挤散了。entry level 建议强行压到一页，research interest 先删掉，Education 开头就够。"],
  [4922, "这段经历别只挂 Research Assistant，不然会把你推回纯研究方向。可以改成 Software Developer and Researcher，并把开发相关 bullet 往前放。"],
  [4923, "Paper 不是不能放，但现在放太前面会抢走工程能力的注意力。建议顺序改成 Education、Professional Experience、Projects/Skills，Publications 放最后。"],
  [4924, "你这里 C++ 这种核心语言一定要明写出来，必要时加粗。不是能力不够，是现在读者扫一眼时抓不到你的技术栈。"],
  [4925, "Skills 放太后面会让好材料被埋掉。建议直接移到 Education 下面，让 Education 和 Skills 先完成第一轮匹配。"],
  [4926, "这块 Skills 分类有点乱，ML 和 evaluation 更像方向，不适合当工具类目。建议拆成 Languages、Frameworks & Libraries、Tools & Systems，Python、C++、PyTorch 先放清楚。"],
  [4927, "BPE tokenization、constitutional prompting 这种词太细，很多岗位不会按它们找人。建议保留 TensorFlow、PyTorch、Pandas、scikit-learn、LangChain 这类更通用的关键词。"],
  [4928, "这类课程里的细节步骤不一定适合放 Skills。建议只保留你在项目里真实用过、而且比较通用的工具或语言，太细的 tokenization 步骤可以删。"],
  [4929, "Evaluation、consistent prompting 这种自创分类会让技能栏不好扫。建议改成 Languages、Frameworks & Libraries、Systems & Tools，把 Git、Docker、GCP 这些标准词放进去。"],
  [4930, "AI/ML 方向证书不用再花太多时间追了，它不是这类简历的核心筹码。空间紧的话证书栏可以删，把位置让给项目、技能和 awards。"],
  [4931, "你这段 experience 要少写学术判断，多写技术工具。像 PyTorch、transformer-based models、learning rate scheduling 这类词，比泛泛讲收敛性更能帮你对上岗位。"],
  [4932, "你这里先别只从自己觉得稀缺的经历出发。DeepMind reasoning 轨迹数据当然特别，但要先看目标 JD 是否真的需要，不然它会占掉更有用的关键词空间。"],
  [4935, "这份简历不用一次塞进所有技能。建议保留一版通用简历，遇到真的需要 reasoning 能力的岗位，再临时加进那一版。"],
  [4939, "你可以投前端、后端和 full stack，不用因为 ML/研究背景就先把自己挡掉。embedded system 这种深 C/C++ 方向先谨慎，和你现在材料没那么贴。"],
  [4944, "你这里缺的是简历上的前后端证据，不是单纯刷题。可以 fork 一个前后端 repo，真的改代码、跑通流程，再写成 2 条项目 bullet。"],
  [4946, "开源项目如果你真的理解、改过代码、前后端也跑通了，就可以写进项目经历。重点不是包装得多大，而是 bullet 里要说清你改了哪个模块。"],
  [4952, "BA 不是只做数据模型，更重要是把 data 翻译成业务听得懂的故事。建议把 SQL、Tableau、Power BI、Excel 图表和 presentation 能力放在一起练。"],
  [4962, "如果你想走 data science 或 risk 相关方向，Python 要放到学习重心。numpy、scikit-learn、logistic regression、linear regression、stress testing 这些要能写成真实项目能力。"],
  [4974, "实习不够贴目标岗位时，academic project 可以帮你补证据。建议只选一个最相关的项目写扎实，把 Python 分析、regression、统计建模这些方法讲完整。"],
  [4979, "Skills 现在放后面有点浪费。对学生简历来说，可以排成 Education、Skills、Experience、Academic Projects，让技能先被看到。"],
  [4982, "你这份简历整体已经有基础了，下一步是把 skill section 往前挪。放在教育背景之后、工作经历之前，会更容易让技术匹配度被读到。"],
  [4993, "HTML/CSS 更像基本功，jQuery 也有点旧了，别把它们当主卖点。建议选一个方向补现代框架，比如 Python 配 Django、Flask 或 FastAPI。"],
  [5014, "你有 OS 背景时，看到 C/C++ 要求的 server、router 或 hardware related 岗位可以大胆试。不要被 hardware 标签吓退，底层软件很多能力是相通的。"],
  [5017, "你这种方向不适合只靠一份通用简历。建议准备三版，其中一版专门打 OS 项目，把操作系统技术栈和目标 JD 对齐。"],
  [5018, "项目第一句不要一上来就钻技术细节。建议先写产品或系统是什么、解决什么问题、有什么 impact，再展开后面的实现。"],
  [5019, "这条项目开头要先给读者一个背景。可以按产品介绍、解决的问题、impact 来写第一句，后面再接推荐系统或技术实现。"],
  [5021, "简历的第一目标是拿到面试机会，不是把所有能力一次讲完。建议每条内容都问一句：它能不能帮我通过这次筛选，不能就删或后移。"],
  [5022, "技术 bullet 建议用 Develop feature using technology 这种结构。先把 feature 说短，再接 Flex、API 这类工具，读起来会比一长串功能清楚很多。"],
  [5023, "项目 bullet 的顺序也要设计。第 1 条交代技术栈，第 2 到 4 条写核心 feature，deployment、testing、documentation 这类杂项放最后更顺。"],
  [5024, "这类项目不能只写别人看不懂的术语。第一句建议改成做了什么功能、服务哪类用户、带来什么影响，比如 UCSD campus 和 500+ downloads 这种信息要前置。"],
  [5026, "前后端不要混在同一条里写成一团。建议前端写 React pages/components，后端写 API 或 feature，再单独补 SQL query 和 query optimization。"],
  [5028, "localhost 项目也可以把部署实践写出来，但要写得诚实。只要你确实做过 deploy 配置或 JUnit test，就可以放进 bullet 当技术证据。"],
  [5030, "AI research 经历也需要先让非技术读者听懂。建议第一句先说应用场景，比如 AI-powered music recommendation system，再写模型和实现细节。"],
  [5031, "SDE 版本里 Skills 不要放太后面。建议排在 Education 后面，publication 则放到 Professional Experience 或项目之后，别让技能匹配被埋住。"],
  [5033, "你方向多不是坏事，但一份简历会被稀释。建议拆成前后端 SDE、系统/OS、AI 三版，每版只突出对应技术栈和项目。"],
  [5034, "学生简历可以 Education 第一、Skills 第二；有经验后再把 Skills 放更前。你现在先让技能栏靠前，别让读者翻到后面才看到匹配点。"],
  [5035, "字号 10.5 已经算紧凑了，超页时不要先牺牲重点项目。建议优先删本科教育条目，保留硕士、技能、经历和最有价值的项目。"],
  [5036, "digital twin 和 OS 项目里有 CPU scheduling、memory management、concurrency，这些很有辨识度。建议放进 operating system 或 C++ 版本，不要被通用简历冲淡。"],
  [5037, "LaTeX 和 Word 不是现在最大的矛盾，内容才是。建议先把经历和 bullet 改扎实，格式直接用 Word 也完全可以。"],
  [5040, "CPU scheduling、memory management、concurrency 这些底层项目很少见，要好好用起来。建议放到 C/C++ 方向简历里，当成系统能力的差异化亮点。"],
  [5041, "项目太多时，不是每段 research 都要保留。可以先删 2 到 3 年前、相关性弱的 research，publication 对 SWE/C++ 方向也可以酌情后移或删掉。"],
  [5042, "AI 项目只有 3 条 bullet 会显得有点薄。建议至少补到 4 条，可以加部署、性能优化、应用场景或量化结果，让项目深度更完整。"],
  [5044, "finance 和 marketing 要先选清楚，不能靠兴趣声明硬转。finance 已有基础可以继续；如果真投 marketing，至少要补 1 到 2 段相关实习。"],
  [5052, "经济学背景加 Finance 实习，其实可以往 Product Marketing 靠。建议围绕 positioning、GTM strategy、market opportunity、竞品分析这些词来定制简历。"],
  [5061, "你说想做 marketing，但三段实习都是 finance，证据会断掉。建议至少补一段市场推广、内容运营或品牌相关实习，让方向选择站得住。"],
  [5063, "超一页时实习通常要优先保留。建议比较每段经历和目标岗位的相关性，把实验室或可替代性高的内容合并或删掉，保证一页里留下最强证据。"],
  [5065, "广告数据经历可以包装成 Market Analyst 的量化亮点。建议把 CTR 对比、受众偏好、竞品态势这些写进 bullet，比如 8% vs 5% 这种差异要露出来。"],
  [5066, "加新实习后超页，就要看经历之间有没有重复。建议保留技能覆盖不同的内容，早期、相似或相关性低的项目可以替换、合并或删掉。"],
]);

const rows = source.rows.map((row) => {
  const text = mentorById.get(Number(row.id));
  if (!text) throw new Error(`Missing proposal for id=${row.id}`);
  return {
    id: row.id,
    humanized_mentor_insight: text,
  };
});

const payload = {
  generatedAt: new Date().toISOString(),
  table: "vibe_offer.segments",
  generationMode: "chatbox_no_external_api",
  source: "chat_mentor_from_p_mentor",
  rows,
};

fs.writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(JSON.stringify({ outPath, rows: rows.length }, null, 2));
