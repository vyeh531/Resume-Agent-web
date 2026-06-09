"use strict";

const fs = require("fs");
const path = require("path");

const replacements = {
  2469: "这个 NGO 数据项目不要只写 Excel，建议把 SQL 也放进真实动作里。可以写 built a SQL database to consolidate attendance and observation data for analysis，这样关键词和项目证据会连起来。",
  2475: "survey design 不能只写 designed survey，建议补出对象、目的和问题维度。比如面向 parents，了解学生暑期项目里 access to healthcare resources 等困难，研究设计能力才看得出来。",
  2476: "IMF 宏观经济项目如果只写定性研究，会弱掉数据分析感。建议补出数据收集，并用 Linear Regression 预测未来 5 年汇率趋势，把纸面报告转成量化分析项目。",
  2477: "建议把数据收集环节写进去，不然项目像是直接跳到结论。可以写 collected macroeconomic and financial indicators, such as currency、exchange rate，再接处理、建模和结论输出。",
  2479: "建议把 MySQL 和 SQL 直接绑定到 survey result 的处理里。比如 stored survey data in MySQL database，并用 SQL 和 statistical methods 分析 survey results。",
  2483: "这段经济赋权经历要把 Excel 的具体产出写出来，比如财务报表、financial projection model 或 cash flow forecast。再补帮助多少 small business owners 申请贷款或成立公司。",
  2567: "面试前要逐行拆 JD 的技能要求，SQL、Tableau 这类明确写到的工具要主动提。proficiency 是硬门槛，familiarity 只要基础了解，表达上要分清楚。",
  2612: "自我介绍不要只卡在 content 或 social media，否则申请范围会变窄。建议改成 digital marketing，再覆盖 content、social media、SEO 或 campaign execution。",
  2620: "饲料协会经历要从政策协助转成 Business Analytics 语言。可以写收集饲料成本和产量数据，做 feed types 与 livestock yield 的 correlation analysis，并产出 cost-reduction insight。",
  2625: "问卷和 focus group 是很好的研究证据，不要只写“收集反馈”。建议写 performed survey、定性访谈、satisfaction score 和 policy evaluation 结论。",
  2632: "农村妇女调研不要停在定性描述，可以重构成数据分析项目。建议写多数据源收集、过去 20 年趋势分析、segmentation analysis、key factors 和 Python 可视化。",
  2633: "只有 Excel 会显得技术含量偏低。可以把项目升级为 Python 分析：用 pandas、matplotlib 做 segmentation analysis、统计分析和可视化，再服务政策建议。",
  2645: "coding 不强时不要堆太多编程项目，反而容易被追问细节。建议把比亚迪新能源分析写成 Python/Excel 数据分析和可视化，再补一个 AB testing 分析项目。",
  2653: "软件和硬件内容混在一起会让定位发散。建议先确定硬件开发或硬件测试方向，删掉无关软件经历，并分别强化 PCB 设计或测试提报 bug 的证据。",
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

for (const batch of ["r19", "r20"]) {
  const dir = `artifacts/mentor-chat-batch-50-${batch}`;
  const proposalChanged = updateJson(`${dir}/chat_proposals.json`, (row, text) => {
    row.humanized_mentor_insight = text;
  });
  const reviewedChanged = updateJson(`${dir}/chat_reviewed_agent_approved.json`, (row, text) => {
    row.proposed.humanized_mentor_insight = text;
    row.review = row.review || {};
    row.review.agentEdit = "Manual rewrite preserved required signal before rerun review.";
  });
  console.log(`${batch}: proposals=${proposalChanged}, reviewed=${reviewedChanged}`);
}
