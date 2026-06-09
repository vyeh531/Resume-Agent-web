"use strict";

const fs = require("fs");
const path = require("path");

const replacements = {
  3759: "training dataset 这段建议把技术链路写顺：Python 收集和清洗数据，存入 MongoDB，再自动化 test flow。后面接 statistical analysis、feature importance 和模型提升 X%。",
  3760: "数据方向简历里 SQL 不能缺。Skills 里先补 SQL，项目 bullet 再写一个真实查询、清洗或分析场景，才不像只是在堆关键词。",
  3761: "这段技术动作已经有了，结尾要补量化结果。比如模型准确率提升 X%、测试效率提升 X%，数字确认前可以先留占位。",
  3778: "BA/MA 方向只写 Excel 和 Pivot Table 会偏弱。Power BI 或 Tableau 要放进 Skills 和项目里，Excel 可以保留，但不要成为唯一的数据能力信号。",
  3780: "没有工作经验时，Education 要按目标岗位分版本。Accounting 写会计课程，BA/Data Analytics 写 SQL、Tableau、Power BI，Finance/IB 再写 Financial Modeling 和 Due Diligence。",
  3782: "国泰君安这类经历要往数据分析逻辑靠：定义问题、处理数据、识别结果、给 stakeholder 建议。现有内容补不满四步，就用课程项目补能力证据。",
  3785: "数据分析 bullet 里要写数据量级，不然复杂度看不出来。客户数量、数据行数、维度数量这些信息补进去，会比泛泛说 dashboard 更有力。",
  3786: "dashboard 项目要直接点出 Python 和具体可视化工具。把 Python、matplotlib 或 plotly 放进 bullet，再说明分析了什么数据、产出了什么图表。",
  3787: "课外活动和 English/Mandarin 这类低信息量内容可以删掉。把空间留给 computer/technical skills，尤其是目标岗位真正会看的工具。",
  3788: "数字相关的维度要写精确，别只说分析了客户数据。客户量级、数据维度数量、分类类别数都要确认并记住，面试被追问时才撑得住。",
  3789: "Microsoft 这段第一点和第四点都在讲 soft skill，就会显得重复。保留一条 teamwork/communication 就够，其余 bullet 换成技术动作和量化成果。",
  3794: "投 BA/MA 时，corporate governance 和 professional ethics 相关度偏低，可以删掉或降权。用数据分析、市场研究这类项目替换，简历主线会更贴目标岗位。",
  3796: "问卷项目可以拆成两条：一条写 interest level 和市场空间，一条写 survey result 提取出的优化指标。样本量、年级分组、收藏数、评论数这些细节要放进去。",
  3797: "两段经历都在讲 teamwork 或 presentation 时，保留更强的一处就够了。另一处换成数据分析、工具使用或差异化产出，避免重复同一种能力。",
  3798: "不要写“提升了某技能”，这类表达太像自我感受。改成研究了哪些数据维度、用了哪些数据库、和谁合作、怎么分析，让事实证明能力。",
  3801: "模块顺序按目标岗位的阅读优先级来排：Education、Internship、Research Experience。相关教育背景和真实实习要先出现，其他内容往后放。",
  3802: "Technical Skills 不能只写 Microsoft Office/computer。BA/MA 版写 SQL、Python、Tableau、Power BI、Google Analytics、Snowflake；FA/Accounting 版再换成 Oracle 和财务建模工具。",
  3817: "Accounting 经历不要写成数据工具展示，重点放在准则应用、expense 管理和 PNL 报表判断。比如 GAAP、expense、PNL 这些词要服务细节把控能力。",
  3874: "金融简历别只压在 portfolio management 一个方向上。risk management、treasury、financial analysis 可以穿插呈现，让前台和中台岗位都读到相关信号。",
  3929: "项目 bullet 先写 product summary 加 impact，再展开实现细节。React、Snowflake、Python API 这些技术放第二层，最后再收 testing 或性能保障。",
  3937: "music slider 不能只写 built with Swift，太像功能记录。补出 gesture-based slide controls 和多少音乐课学生试用过，scope 和 impact 才出来。",
  3951: "Visualization 如果真的做了，就单独起一条 bullet。写清 Matplotlib 或 Seaborn、可视化了什么数据，以及 line chart、bar chart 这些图表产出。",
  3953: "new grad 投 ML 时，传统 CV、NLP deploy 可以降权，大模型方向更值得优先押。简历上把 RAG、Agent、Finetuning 这些 AI Engineer 信号放得更明显。",
  3979: "传统 CV、NLP 项目不用全部保留，尤其 YOLO 这类内容太多会抢掉 LLM/Agent 信号。把篇幅集中到 Multi-agent、RAG pipeline 和 fine-tuning 项目。",
  3990: "LLM/AI Engineer 和 Solution Engineer 的卖点不一样，建议做两份简历。主版写模型训练、架构和 coding，备用版写 client engagement、technical demo 和方案交付。",
  3993: "专业名里的 Product Innovation 会让技术定位变模糊。简历上可以简化成 Master in AI 或 Master in Artificial Intelligence，让技术方向更清楚。",
  3995: "最相关的大模型、RAG、LLM 经历不能藏在 Education 下面三句话带过。把它单独提前成核心项目，不相关实习缩短或后移。",
  4005: "应届或经验不多时，Summary 往往信息量低，还占版面。除非有 10 年经验、publication 或 conference 这类强信号，否则直接从 Education、Skills、Projects 开始。",
  4013: "3.7 GPA 是可以写的 highlight，尤其 3.6 以上通常值得放在 Education 里。低于这个线再考虑删掉，让注意力回到经历上。",
  4014: "论文标题可以加粗，但前提是你能讲清楚。提前准备四人如何分工、用了哪些分析工具、你负责什么，以及这篇研究解决了什么问题。",
  4031: "只有一份实习时，这段就要承担更多证明作用。把 Transecurity 里行业调研、证券分析和金融分析/风险方向的连接写具体，别只简单带过。",
  4032: "分析类或风险相关岗位要多出现 analysis、analyze、risk 这类关键词。把它们自然放进实习 bullet，比如 industry analysis 或 analyzed risk factors。",
  4033: "A4 单页底部空着不划算，尤其经历本来不多时。把实习扩到 3-4 条 bullet，补工具、方法、量化成果或技能内容，让页面更扎实。",
};

function updateJson(filePath, updateRow) {
  const resolved = path.resolve(process.cwd(), filePath);
  const payload = JSON.parse(fs.readFileSync(resolved, "utf8"));
  let changed = 0;
  for (const row of payload.rows || []) {
    if (!replacements[row.id]) continue;
    updateRow(row, replacements[row.id]);
    changed += 1;
  }
  fs.writeFileSync(resolved, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return changed;
}

for (const batch of ["r30", "r31", "r32"]) {
  const dir = `artifacts/mentor-chat-batch-50-${batch}`;
  const proposalChanged = updateJson(`${dir}/chat_proposals.json`, (row, text) => {
    row.humanized_mentor_insight = text;
  });
  const reviewedChanged = updateJson(`${dir}/chat_reviewed_agent_approved.json`, (row, text) => {
    row.proposed.humanized_mentor_insight = text;
    row.review = row.review || {};
    row.review.agentEdit = "Manual rewrite preserved source-specific signal before rerun review.";
  });
  console.log(`${batch}: proposals=${proposalChanged}, reviewed=${reviewedChanged}`);
}
