/* =====================================================================
   Mock 数据 · MentorX Resume Diagnosis
   所有页面引用 window.MOCK 拿数据
   实际接入 LLM 时,只需替换这一份对象
   ===================================================================== */

window.MOCK = {
  student: {
    name: "你",
    school: "Columbia University",
    grade: "2025届",
    major: "Marketing Science",
    fileName: "resume_v3.pdf"
  },

  job: {
    title: "Product Manager",
    location: "Seattle, WA",
    targetSalary: "$200K"
  },

  scores: {
    overall: 75,
    targetSalary: "$200K",
    salaryNow: "$120K",
    salaryTop: "$200K",
    ats: 78,
    skillHave: 4,
    skillTotal: 10,
    rankingPercentile: 32,
    competitorCount: 3247,
    admitRate: 2.1
  },

  // ATS 详情
  atsBreakdown: [
    { k: "格式可解析", v: "92%", note: "PDF 结构清晰,推荐继续使用" },
    { k: "PM 关键词密度", v: "62%", note: "缺 product roadmap / OKRs / user research 等核心词" },
    { k: "标准化句式", v: "78%", note: "项目描述偏 marketing 语言,需改成 PM 语言" }
  ],

  // 排名
  rankingBreakdown: [
    { k: "学校梯队", v: "TOP 12%", note: "Columbia/常春藤背景在 PM 池中有天然优势" },
    { k: "项目深度", v: "TOP 38%", note: "实习经历有量化但缺 PM 思维框架" },
    { k: "技能匹配", v: "TOP 41%", note: "硬技能偏 marketing,缺 PM 核心词汇" }
  ],

  // 薪资
  salaryBreakdown: [
    { k: "当前简历水平", v: "$120K", note: "marketing analyst / associate PM 区间" },
    { k: "面试加分线", v: "$150K", note: "+ PM 思维框架重写即可达到" },
    { k: "顶级 PM Offer 线", v: "$200K", note: "需补 user research + OKR 框架 + scale impact" }
  ],

  // 竞争
  compBreakdown: [
    { k: "总投递", v: "3,247 人", note: "Amazon Product Manager · 2026 NCG" },
    { k: "进入面试", v: "186 人", note: "约 5.7%" },
    { k: "拿到 Offer", v: "68 人", note: "录取率 2.1%" }
  ],

  // === Top 10 必备技能(只 2 种状态:have / weak) ===
  skillGap: [
    { name: "Product Thinking 框架",        status: "weak", priority: 1 },
    { name: "User Research 方法论",         status: "weak", priority: 2 },
    { name: "Marketing Analytics (CTR/CVR)", status: "have", priority: 3 },
    { name: "A/B Testing 设计",             status: "have", priority: 4 },
    { name: "OKRs / KPIs 框架",             status: "weak", priority: 5 },
    { name: "Stakeholder Management",       status: "weak", priority: 6 },
    { name: "SQL / Python 数据处理",         status: "have", priority: 7 },
    { name: "Wireframing / Prototyping",    status: "weak", priority: 8 },
    { name: "Agile / Scrum",                status: "weak", priority: 9 },
    { name: "Funnel & Cohort Analysis",     status: "have", priority: 10 }
  ],

  // === 整体诊断 summary ===
  summary: {
    headline: "你的当前简历综合评分 75 分,",
    salaryGap: "离获得大厂 $200K 薪资仍有差距",
    coreIssue: "简历完全用 marketing 语言写作,缺少 PM 思维框架的 credibility signal,ATS 与招聘官无法识别你的 PM 能力。"
  },

  // === 4 位导师(detailed) ===
  mentors: [
    {
      id: 1,
      company: "Amazon",
      companyKey: "amazon",
      mentorCode: "Y导师",
      position: "Marketing Manager",
      credentials: ["Columbia Marketing Science 硕士", "650K+ 视频播放转化", "70+ 创作者 campaign 管理"],
      careerPath: "广告 agency → 快消品牌（百威）→ 科技公司（Amazon）",
      students: 1247,
      locked: false,
      priority: "P0-必改",
      issue: "简历完全缺失 PM 岗位的核心语言和框架,导致 ATS 和招聘官无法识别你的 PM 能力。",
      strategy: "科技公司(尤其 Amazon)在筛选 PM 候选人时,首先看的是你是否理解 product thinking 的语言──product roadmap、user stories、OKRs、metrics/KPIs、stakeholder management 这些词汇的出现本身就是一个 credibility signal。你现在的简历用的全是 marketing analytics 的语言(CTR、CVR、CPM、A/B testing),这让招聘官很难判断你是否真的理解 product management 的核心逻辑。根据知识库中的量化数据与 verbal 互相支撑原则,「你不能就直接告诉他我觉得我很适合,但是为什么呢?你没有讲,你要让他觉得为什么」──你需要用 PM 的语言来讲你做过什么。",
      current: "简历中完全没有出现以下 PM 核心词汇:product roadmap、user stories、OKRs、metrics/KPIs(虽然有 funnel metrics 但没有明确的 KPI 框架)、user research methodology、wireframing、prototyping、stakeholder management、agile/scrum。CocoSoft 实习的所有 bullet 都用 marketing analytics 框架来描述(「Conducted market and creator research」「Managed influencer campaign」「Built campaign trackers」「Analyzed campaign performance」),完全没有体现 product thinking。",
      advice: "重写 CocoSoft 实习的 bullet,从 product thinking 角度重新组织。核心改写策略:(1) 把「creator research」改写为「user research」框架,说明你如何定义 target user persona、收集 user feedback;(2) 把「campaign management」改写为「product feature adoption」的角度,说明你如何通过不同的 distribution channel(creator partnerships)来 drive product adoption;(3) 把「performance analysis」改写为「metrics definition and KPI tracking」,明确说出你定义了哪些 success metrics、如何用这些 metrics 来 inform product decisions。",
      example: "Conducted user research with <b>70+</b> YouTube creators to identify target user personas, pain points, and content preferences; synthesized insights into <b>5</b> user stories that directly informed product positioning and feature roadmap.<br/><br/>Designed creator partnership distribution strategy with clear success metrics (CTR, CVR, registration rate); tracked performance against OKRs and iterated on creator selection criteria, resulting in <b>650K+</b> video views and <b>2,500+</b> product registrations (<b>8%</b> conversion rate)."
    },
    {
      id: 2,
      company: "Amazon",
      companyKey: "amazon",
      mentorCode: "C导师",
      position: "Senior ML Engineer",
      credentials: ["AWS 认证专家", "476+ 辅导经验", "分布式系统架构"],
      careerPath: "学术研究 → 创业公司 ML lead → Amazon AWS",
      students: 476,
      locked: true,
      priority: "P1-建议改",
      issue: "技术简历缺少 scale 信号和 system design 框架,看起来像 prototype 工程师而非 production ML engineer。",
      strategy: "Senior ML Engineer 岗位最看重 distributed systems / scalability。你需要在 bullet 里明确写出 model serving QPS、latency p99、training data scale(TB 级)、infrastructure stack(SageMaker / Spark / Kubernetes)。这些不是炫技,是 credibility signal。",
      current: "目前的 ML 项目描述停留在「trained a model with 92% accuracy」级别,没有 production deployment 信息,没有 latency / throughput 数字,没有 system design 决策。",
      advice: "把每个 ML 项目改写成 4 段式:(1) Problem framing + business metric;(2) Data scale + infrastructure;(3) Model architecture + offline metrics;(4) Production deployment + online metrics + impact。每一段都要有具体数字。",
      example: "Built end-to-end recommendation pipeline serving <b>50M+</b> users with <b>p99 latency &lt;200ms</b>; designed feature store on AWS SageMaker handling <b>2TB</b> daily training data, deployed via Kubernetes with auto-scaling.<br/><br/>Improved CTR by <b>+18%</b> A/A test confirmed, contributing <b>$4.2M ARR</b> uplift in Q3."
    },
    {
      id: 3,
      company: "Google",
      companyKey: "google",
      mentorCode: "X导师",
      position: "Senior Product Manager",
      credentials: ["Stanford MBA", "Google Pixel 产品线", "1,200+ 辅导经验"],
      careerPath: "麦肯锡咨询 → Stanford MBA → Google Pixel PM",
      students: 1200,
      locked: true,
      priority: "P1-建议改",
      issue: "缺乏 product impact at scale 的叙事,无法体现你能在亿级用户产品中做决策的能力。",
      strategy: "Google PM 招聘最看重 product sense × execution at scale。你的简历需要明确写出每个项目的「decision context」(为什么做这个决策)、「trade-offs considered」(权衡了哪些方案)、「impact at scale」(影响多少用户 / 多少 revenue)。Google 招聘官不喜欢看 task list,喜欢看 decision narrative。",
      current: "简历里所有 PM 经历都是「launched feature X」「analyzed Y」这种任务陈述,没有体现「为什么是这个 trade-off」「为什么 ship 这个而不是 ship 那个」的 product sense。",
      advice: "把 1-2 个最重要的 PM 项目改写成 STAR + Trade-off 结构:Situation(用户痛点)→ Task(你要解决什么)→ Trade-offs(考虑了哪几个方案,为什么选这个)→ Action(执行)→ Result(at scale)。",
      example: "Identified <b>30%</b> drop-off in onboarding funnel for <b>10M+</b> creators; evaluated 3 solutions (in-app tutorial vs. progressive disclosure vs. AI-assisted setup), shipped progressive disclosure based on cost/risk analysis.<br/><br/>Reduced onboarding time from <b>14 → 6 min</b>, increased D7 retention <b>+22%</b>, equivalent to <b>$8M ARR</b>."
    },
    {
      id: 4,
      company: "Meta",
      companyKey: "meta",
      mentorCode: "W导师",
      position: "Lead PM Manager",
      credentials: ["MIT Sloan MBA", "Meta AI 产品线 leader", "830+ 辅导经验"],
      careerPath: "投行 → MIT Sloan → Facebook PM → Meta Lead PM",
      students: 830,
      locked: true,
      priority: "P2-加分项",
      issue: "缺乏 cross-functional leadership 信号,看起来像 individual contributor 而非 future people manager。",
      strategy: "Lead PM Manager track 招聘最看重「能不能带团队」。你的简历需要在 bullet 里明确写「跨 X 个 function 协作」「带 Y 名 engineer/designer/data scientist」「mentor 过 Z 名 junior PM」。即使是校招,也要有 student org / 项目 lead 的 leadership 经历。",
      current: "目前简历里 leadership 经历完全缺失。所有项目都是 individual contributor 的描述方式,没有体现你协调过多少人、推动过多少跨团队决策。",
      advice: "在每个有协作元素的项目里加上「cross-functional collaboration」描述。学生会 / club 经历也可以重写成 leadership story:协调多少人、推动了什么决策、产出了什么成果。",
      example: "Led cross-functional team of <b>8</b> (3 engineers, 2 designers, 1 data scientist, 2 marketers) to launch creator monetization feature; aligned roadmap with leadership across <b>5</b> orgs.<br/><br/>Mentored <b>2</b> APM interns through structured weekly 1:1s; both received return offers."
    }
  ],

  // === 5 组 Before / After ===
  beforeAfter: [
    {
      title: "实习 bullet · marketing → PM 语言",
      before: ["Conducted market and creator research for AI product"],
      after: ["Conducted <b>user research</b> with <b>70+</b> YouTube creators to identify <b>target user personas</b>, pain points, and content preferences; synthesized insights into <b>5 user stories</b> that informed <b>product positioning and feature roadmap</b>"]
    },
    {
      title: "campaign 经历 · 加 product thinking",
      before: ["Managed influencer campaign that drove 650K+ video views"],
      after: ["Designed <b>creator partnership distribution strategy</b> as a channel to drive product adoption; defined <b>success metrics (CTR, CVR, registration rate)</b> tracked against <b>OKRs</b>, resulting in <b>650K+</b> video views and <b>2,500+</b> product registrations (<b>8%</b> conversion)"]
    },
    {
      title: "Skills 区 · 重排优先级",
      before: ["Marketing Tools: Google Analytics, Meta Ads Manager, Excel"],
      after: ["<b>Product:</b> Roadmapping, OKRs, User Research, Wireframing (Figma), A/B Testing<br/><b>Data:</b> SQL, Python (pandas), Tableau, Funnel & Cohort Analysis<br/><b>Process:</b> Agile/Scrum, Stakeholder Management"]
    },
    {
      title: "Self Summary · 删 marketing 词,加 PM 词",
      before: ["Marketing professional with experience in influencer campaigns and creator partnerships"],
      after: ["<b>Aspiring Product Manager</b> with proven experience using <b>data-driven user research</b> and <b>distribution strategy</b> to drive product adoption; bridged marketing analytics with PM thinking to grow products from <b>0 to 650K+</b> users"]
    },
    {
      title: "Education · 加 PM-relevant coursework",
      before: ["MS in Marketing Science · Columbia University"],
      after: ["MS in Marketing Science · <b>Columbia University</b><br/><b>Relevant Coursework:</b> Behavioral Economics, Causal Inference, Product Analytics, User Experience Design"]
    }
  ],

  generatedAt: "2026.05.07"
};
