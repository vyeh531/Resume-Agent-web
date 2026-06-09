window.Store = window.Store || {
  get() { try { return JSON.parse(localStorage.getItem("resumeFixMVP") || "{}"); } catch { return {}; } }
};

if (typeof guardSubmitted === 'function') {
  guardSubmitted();
} else {
  const s0 = window.Store.get();
  if (!s0.resumeName) { window.location.href = "/"; }
}

const s = window.Store.get();
const atsResult = s.atsResult || {};
if (s.reportId && s.reportAccessToken && (!s.premiumKeywordBreakdown || !s.premiumAdviceItems)) {
  fetch(`/api/v1/reports/${encodeURIComponent(s.reportId)}/unlock`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportAccessToken: s.reportAccessToken }),
  })
    .then((res) => res.ok ? res.json() : null)
    .then((data) => {
      const premiumReport = data?.premiumReport;
      if (!premiumReport) return;
      window.Store.set({
        premiumMentors: premiumReport.mentors || null,
        premiumAdviceItems: premiumReport.allAdviceItems || null,
        premiumKeywordBreakdown: premiumReport.keywordBreakdown || null,
        missingKeywordChecklist: premiumReport.missingKeywordChecklist || null,
        sectionFixPlan: premiumReport.sectionFixPlan || null,
        mentorLogoPool: premiumReport.mentorLogoPool || s.mentorLogoPool || null,
      });
      window.location.reload();
    })
    .catch(() => {});
}
const mentorsSection = document.getElementById("mentors");
if (mentorsSection) {
  const num = mentorsSection.querySelector(".section-num");
  const title = mentorsSection.querySelector(".section-title");
  if (num) num.textContent = "04 · 完整导师建议";
  if (title) title.textContent = "按你的简历问题优先匹配";
}

function priorityClass(p){
  if (p && p.startsWith("P0")) return "";
  if (p && p.startsWith("P1")) return "priority-tag--p1";
  if (p && p.startsWith("P2")) return "priority-tag--p2";
  return "";
}
function escapeAttr(str){ return String(str).replace(/'/g,"&apos;").replace(/"/g,"&quot;"); }
function escapeHtml(s){
  return String(s||"").replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}
const STATIC_MENTOR_COMPANY_LOGOS = [
  { company: "Amazon", companyLogo: "/logos/Amazon.png" },
  { company: "Amazon Web Services", companyLogo: "/logos/Amazon Web Services, Inc.png" },
  { company: "Google", companyLogo: "/logos/google.png" },
  { company: "Meta", companyLogo: "/logos/Meta.png" },
  { company: "Microsoft", companyLogo: "/logos/Microsoft.png" },
  { company: "Apple", companyLogo: "/logos/Apple.png" },
  { company: "NVIDIA", companyLogo: "/logos/NVIDIA.png" },
  { company: "Intel", companyLogo: "/logos/Intel.png" },
  { company: "Qualcomm", companyLogo: "/logos/Qualcomm.png" },
  { company: "Cisco", companyLogo: "/logos/Cisco.png" },
  { company: "IBM", companyLogo: "/logos/IBM.jpg" },
  { company: "Oracle", companyLogo: "/logos/Oracle.png" },
  { company: "Salesforce", companyLogo: "/logos/Salesforce.png" },
  { company: "Adobe", companyLogo: "/logos/Adobe.png" },
  { company: "Intuit", companyLogo: "/logos/Intuit.png" },
  { company: "Snowflake", companyLogo: "/logos/Snowflake.png" },
  { company: "Spotify", companyLogo: "/logos/Spotify.png" },
  { company: "Uber", companyLogo: "/logos/Uber.jpg" },
  { company: "Robinhood", companyLogo: "/logos/Robinhood.png" },
  { company: "OpenAI", companyLogo: "/logos/OpenAI.png" },
  { company: "ByteDance", companyLogo: "/logos/ByteDance.png" },
  { company: "TikTok", companyLogo: "/logos/Tiktok.png" },
  { company: "SAP", companyLogo: "/logos/SAP.png" },
  { company: "Goldman Sachs", companyLogo: "/logos/Goldman Sachs.png" },
  { company: "JPMorgan Chase", companyLogo: "/logos/JPMorganChase.png" },
  { company: "Morgan Stanley", companyLogo: "/logos/Morgan Stanley.png" },
  { company: "BlackRock", companyLogo: "/logos/BlackRock.png" },
  { company: "Capital One", companyLogo: "/logos/Capital One.png" },
  { company: "Bank of America", companyLogo: "/logos/Bank of America.png" },
  { company: "Citigroup", companyLogo: "/logos/Citigroup.png" },
  { company: "American Express", companyLogo: "/logos/American Express.png" },
  { company: "State Street", companyLogo: "/logos/State Street.png" },
  { company: "McKinsey", companyLogo: "/logos/McKinsey & Company.png" },
  { company: "BCG", companyLogo: "/logos/Boston Consulting Group.png" },
  { company: "Deloitte", companyLogo: "/logos/Deloitte.png" },
  { company: "KPMG", companyLogo: "/logos/KPMG.png" },
  { company: "EY", companyLogo: "/logos/EY.png" },
  { company: "PwC", companyLogo: "/logos/PRICE WATERHOUSE COOPERS.png" },
  { company: "Accenture", companyLogo: "/logos/Accenture.png" },
  { company: "BDO", companyLogo: "/logos/BDO.png" },
  { company: "Applied Materials", companyLogo: "/logos/Applied Materials.png" },
  { company: "KLA", companyLogo: "/logos/KLA.png" },
  { company: "Lam Research", companyLogo: "/logos/Lam Research.png" },
  { company: "Marvell", companyLogo: "/logos/Marvell.png" },
  { company: "TSMC", companyLogo: "/logos/TSMC.png" },
  { company: "Texas Instruments", companyLogo: "/logos/Texas Instruments.png" },
  { company: "Cirrus Logic", companyLogo: "/logos/Cirrus Logic.png" },
  { company: "NXP", companyLogo: "/logos/NXP Semiconductors.png" },
  { company: "Renesas", companyLogo: "/logos/Renesas Electronics.png" },
  { company: "Skyworks", companyLogo: "/logos/Skyworks.png" },
  { company: "Johnson & Johnson", companyLogo: "/logos/Johnson & Johnson.png" },
  { company: "Merck", companyLogo: "/logos/Merck.png" },
  { company: "Bristol Myers Squibb", companyLogo: "/logos/Bristol Myers Squibb.png" },
  { company: "Amgen", companyLogo: "/logos/Amgen.png" },
  { company: "Biogen", companyLogo: "/logos/Biogen.png" },
  { company: "Moderna", companyLogo: "/logos/Moderna.png" },
  { company: "AbbVie", companyLogo: "/logos/AbbVie.png" },
  { company: "Humana", companyLogo: "/logos/Humana.png" },
  { company: "CVS Health", companyLogo: "/logos/CVS Health.png" },
  { company: "Kaiser Permanente", companyLogo: "/logos/Kaiser Permanente.png" },
  { company: "Tesla", companyLogo: "/logos/Tesla.png" },
  { company: "Ford", companyLogo: "/logos/Ford Motor Company.png" },
  { company: "General Motors", companyLogo: "/logos/General Motors.png" },
  { company: "Nissan", companyLogo: "/logos/Nissan.png" },
  { company: "Volvo", companyLogo: "/logos/Volvo Group.png" },
  { company: "John Deere", companyLogo: "/logos/John Deere.png" },
  { company: "General Electric", companyLogo: "/logos/General Electric.png" },
  { company: "Bosch", companyLogo: "/logos/Bosch Group.png" },
  { company: "Walmart", companyLogo: "/logos/Walmart.png" },
  { company: "Target", companyLogo: "/logos/Target.png" },
  { company: "Costco", companyLogo: "/logos/Costco.png" },
  { company: "Nordstrom", companyLogo: "/logos/Nordstrom.png" },
  { company: "Kroger", companyLogo: "/logos/Kroger.png" },
  { company: "Disney", companyLogo: "/logos/Disney.png" },
  { company: "Sony", companyLogo: "/logos/Sony AI America Inc.png" },
  { company: "FedEx", companyLogo: "/logos/FedEx.png" },
  { company: "Amtrak", companyLogo: "/logos/Amtrak.png" },
];
function getJdMatchRatio(ats) {
  const value = ats?.jdMatchRatio ?? ats?.raw?.jdMatchRatio ?? ats?.raw?.metrics?.jdMatchRatio ?? ats?.metrics?.jdMatchRatio;
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.round(number > 0 && number <= 1 ? number * 100 : number);
}
function uniqueList(items) {
  const seen = new Set();
  return (items || []).filter(Boolean).filter((item) => {
    const key = String(item).trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function getKeywordBreakdown() {
  return s.premiumKeywordBreakdown || atsResult.raw?.premiumKeywordBreakdown || atsResult.keywordBreakdown || atsResult.raw?.keywordBreakdown || [];
}
function getMissingKeywordChecklist() {
  return Array.isArray(s.missingKeywordChecklist) ? s.missingKeywordChecklist : [];
}
function getJdKeywordCount(ats) {
  const explicit = ats?.keywordMatchCount || ats?.raw?.keywordMatchCount;
  if (explicit && Number.isFinite(Number(explicit.total)) && Number(explicit.total) > 0) {
    return { matched: Number(explicit.matched || 0), total: Number(explicit.total) };
  }
  const count = getKeywordBreakdown().reduce((acc, cat = {}) => {
    const matched = Array.isArray(cat.matched) ? cat.matched.length : Number(cat.matched || 0);
    const missing = Array.isArray(cat.missing) ? cat.missing.length : 0;
    const total = Number(cat.total || matched + missing);
    acc.matched += matched;
    acc.total += total;
    return acc;
  }, { matched: 0, total: 0 });
  return count.total > 0 ? count : null;
}
function formatJdKeywordCount(ats) {
  const count = getJdKeywordCount(ats);
  return count ? `${count.matched}/${count.total}` : "--";
}
function formatJdKeywordMatchValue(ats) {
  const count = getJdKeywordCount(ats);
  if (!count || !count.total) return "--";
  return `${count.matched}/${count.total}`;
}
function formatJdKeywordMatchPercent(ats) {
  const ratio = getJdMatchRatio(ats);
  if (ratio !== null) return ratio + "%";
  const count = getJdKeywordCount(ats);
  if (!count || !count.total) return "--";
  return Math.round((count.matched / count.total) * 100) + "%";
}
function atsRiskText(risk) {
  if (risk === "低") return "低风险";
  if (risk === "中") return "中风险";
  if (risk === "高") return "高风险";
  return risk || "未评级";
}
function riskToneClass(risk) {
  const text = String(risk || "");
  if (/高|high|severe|red/i.test(text)) return "risk-high";
  if (/中|medium|mid|moderate|orange|yellow/i.test(text)) return "risk-medium";
  if (/低|low|green/i.test(text)) return "risk-low";
  return "risk-pending";
}
function renderRows(arr) {
  return (arr || []).map(r => `
    <div class="detail-row"><span class="k">${escapeHtml(r.k)}</span><span class="v">${escapeHtml(r.v)}</span></div>
    <div class="detail-note">${escapeHtml(r.note)}</div>
  `).join("");
}
function renderStackedRows(arr) {
  return (arr || []).map(r => `
    <div class="detail-row detail-row-stacked">
      <span class="k">${escapeHtml(r.k)}</span>
      <span class="v">${escapeHtml(r.v)}</span>
      <span class="detail-note">${escapeHtml(r.note)}</span>
    </div>
  `).join("");
}
function getStoredJdText() {
  return s.jdText || atsResult.jdText || atsResult.raw?.jdText || "";
}
function getStoredLocation() {
  return s.location || s.jobLocation || atsResult.location || atsResult.raw?.location || "";
}
function getStoredResumeText() {
  return s.resumeText || atsResult.resumeText || atsResult.raw?.resumeText || "";
}
function inferSalaryRoleFamilyFromText(text) {
  const value = String(text || "");
  if (/\b(software engineer|software developer|sde|swe|frontend|front-end|backend|back-end|full stack|full-stack|react|node\.?js|typescript|java|python developer)\b|软件|前端|后端|全栈/i.test(value)) return "software_engineering";
  if (/\b(data analyst|business analyst|business intelligence|bi analyst|data scientist|analytics|sql|tableau|power bi|dashboard|machine learning|ml engineer|mle)\b|数据分析|商业分析|数据科学|机器学习|算法/i.test(value)) return "data_analytics";
  if (/\b(product manager|associate product manager|apm|product owner|roadmap|user research|product strategy)\b|产品经理|产品负责人/i.test(value)) return "product_management";
  if (/\b(financial analyst|finance|accounting|accountant|audit|tax|fp&a|valuation|quickbooks|gaap)\b|会计|审计|财务|金融分析/i.test(value)) return "finance_accounting";
  if (/\b(marketing|growth|social media|campaign|content marketing|seo|sem|brand)\b|市场|营销|增长|社媒|内容运营/i.test(value)) return "marketing";
  if (/\b(supply chain|logistics analyst|operations analyst|inventory|fulfillment|procurement)\b|供应链|库存|履约|物流分析/i.test(value)) return "supply_chain_operations";
  if (/\b(logistics|operations support|pickup|dispatch|warehouse|delivery|parcel|fleet)\b|揽收|调度|仓库|物流|末端|运营支持/i.test(value)) return "logistics_operations_support";
  if (/\b(business operations|operations specialist|program coordinator|project coordinator|operations coordinator)\b|业务运营|项目协调|运营专员/i.test(value)) return "business_operations";
  return "";
}
function getSalaryRoleFamily() {
  const primaryText = [getTargetJobTitle(), atsResult.profile?.targetRole, atsResult.raw?.profile?.targetRole, getStoredResumeText()].filter(Boolean).join(" ");
  return inferSalaryRoleFamilyFromText(primaryText)
    || atsResult.profile?.roleFamily
    || atsResult.raw?.profile?.roleFamily
    || atsResult.roleFamily
    || atsResult.raw?.roleFamily
    || "";
}
function getSalaryTargetRole() {
  return atsResult.profile?.targetRole || atsResult.raw?.profile?.targetRole || getTargetJobTitle() || "";
}
function formatConfidenceLabel(confidence) {
  const key = String(confidence || "").toLowerCase();
  if (key === "high") return "高";
  if (key === "medium") return "中等";
  if (key === "low") return "较低";
  return "中等";
}
function formatSalaryBasisNote(data) {
  const locationSource = String(data.matched_location_source || "").toLowerCase();
  const market = locationSource === "explicit"
    ? `${data.matched_location || "United States"} 地区`
    : "全美市场";
  return `基于此方向与${market}估算。`;
}
function salarySourceDisplayNote() {
  return "数据来源：美国官方职业薪资资料（BLS/O*NET），按相近岗位赛道估算。";
}
function salaryUnavailableRows() {
  return [
    { k:"薪资成长潜力", v:"待校准", note:"暂未匹配到足够明确的岗位赛道，薪资成长区间需要进一步校准。" },
    { k:"展示原则", v:"不使用 mock 薪资", note:"不会把 $120K/$200K 这类示例数字当作真实薪资或长期上限。" },
  ];
}
function getRoleSignalText() {
  return [
    getTargetJobTitle(),
    s.jobTitle,
    atsResult.jobTitle,
    atsResult.profile?.roleFamily,
    atsResult.raw?.profile?.roleFamily,
    atsResult.roleFamily,
    atsResult.raw?.roleFamily,
    atsResult.raw?.jobTitle,
    getStoredJdText(),
    ...(atsResult.topMissingKw || []),
    ...(atsResult.raw?.topMissingKw || []),
  ].filter(Boolean).join(" ").toLowerCase();
}
function buildReportAiImpactTrend() {
  const text = getRoleSignalText();
  if (!text.trim()) {
    return {
      level: "待校准",
      caption: "需要更多岗位信息",
      rows: [
        { k:"容易被自动化", v:"待判断", note:"需要更明确的岗位职责后再判断。" },
        { k:"更有价值的能力", v:"判断力与协作", note:"优先写出你如何处理复杂问题，而不是只列日常任务。" },
        { k:"简历应强化", v:"成果证据", note:"补充能体现判断、协作、优化结果的经历。" },
      ],
    };
  }
  const opsSignal = /(logistics|operations|dispatch|warehouse|delivery|parcel|customer support|揽收|调度|仓库|物流|快递|客服|运营|报表|成本控制)/i.test(text);
  const techSignal = /(software|engineer|machine learning|ai engineer|data scientist|product manager|developer|软件|算法|产品经理|数据科学)/i.test(text);
  const adminSignal = /(data entry|clerk|administrative|assistant|basic report|documentation|scheduling|文员|行政|录入|基础报表|重复报表|数据整理|标准流程)/i.test(text);
  if (adminSignal && !techSignal) {
    return {
      level: "高影响",
      caption: "标准化任务会被自动化",
      rows: [
        { k:"容易被自动化", v:"基础录入、重复整理、模板化沟通", note:"这类任务更容易被工具接管或压缩。" },
        { k:"更有价值的能力", v:"问题判断、流程改进、跨团队沟通", note:"需要证明你不只是执行流程，也能优化流程。" },
        { k:"简历应强化", v:"效率提升、错误率下降、流程优化结果", note:"用数字写出你带来的改进。" },
      ],
    };
  }
  if (opsSignal) {
    return {
      level: "中等影响",
      caption: "重复任务会被自动化",
      rows: [
        { k:"容易被自动化", v:"重复报表、基础数据整理、标准流程提醒", note:"AI 会先压缩低判断、可模板化的日常工作。" },
        { k:"更有价值的能力", v:"异常判断、跨团队协同、流程优化、数据决策", note:"越能处理例外情况和协调现场资源，越不容易被工具替代。" },
        { k:"简历应强化", v:"数据发现问题、优化调度、降低成本、提升完成率", note:"把工作写成判断和改进，而不是只写执行任务。" },
      ],
    };
  }
  if (techSignal) {
    return {
      level: "低-中等影响",
      caption: "AI 更像效率工具",
      rows: [
        { k:"容易被自动化", v:"资料整理、初稿生成、基础分析", note:"AI 会提升执行速度，但不直接替代完整判断。" },
        { k:"更有价值的能力", v:"复杂决策、产品/业务判断、跨团队影响", note:"能定义问题和推动结果的人更有优势。" },
        { k:"简历应强化", v:"决策依据、业务影响、规模化成果", note:"突出你如何用工具和数据做出更好的判断。" },
      ],
    };
  }
  return {
    level: "中等影响",
    caption: "部分流程会被自动化",
    rows: [
      { k:"容易被自动化", v:"重复整理、标准沟通、基础分析", note:"AI 会优先影响低判断、重复性强的工作。" },
      { k:"更有价值的能力", v:"业务判断、协作推进、结果负责", note:"未来更看重能把问题推进到结果的人。" },
      { k:"简历应强化", v:"问题、行动、结果", note:"用清楚的证据说明你解决了什么问题。" },
    ],
  };
}
function getTargetJobTitle() {
  const candidates = [s.jobTitle, atsResult.jobTitle, atsResult.raw && atsResult.raw.jobTitle];
  const raw = candidates.find(v => v && !/依\s*JD|自动识别|unknown|^目标岗位$/i.test(String(v))) || "";
  return normalizeDisplayTargetJob(raw);
}
function normalizeDisplayTargetJob(value) {
  return String(value || "")
    .replace(/^\s*【(?:岗位|职位|职称|职务|招聘岗位|应聘岗位)】\s*[：:]\s*/i, "")
    .replace(/^\s*(?:目标岗位|岗位|职位|职称|职务|招聘岗位|应聘岗位)\s*[：:\-–]\s*/i, "")
    .replace(/\s*\((?:junior|senior|entry[-\s]?level|full[-\s]?time|part[-\s]?time|internship|intern|co-?op|new\s*grad)[^)]*\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}
function formatTargetJobForProblem(jobTitle) {
  const cleaned = String(jobTitle || "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(internship|intern|co-op|coop)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (/\bmachine learning engineer\b/i.test(cleaned)) return "Machine Learning Engineer";
  return cleaned || "目标岗位";
}
function repairTargetRoleProblem(text) {
  const target = formatTargetJobForProblem(getTargetJobTitle());
  return String(text || "")
    .replace(/目标岗位像是「[^」]+」/g, `目标岗位是「${target}」`)
    .replace(/目标岗位是「数据科学家」/g, `目标岗位是「${target}」`);
}
function normalizeProblemList() {
  return uniqueList([
    ...(atsResult.keyProblems || []),
    ...(atsResult.problems || []),
    ...(atsResult.raw?.keyProblems || []),
    ...(atsResult.raw?.problems || []),
    ...((atsResult.topProblems || []).map(item => item.message || item.title).filter(Boolean)),
    ...((atsResult.raw?.topProblems || []).map(item => item.message || item.title).filter(Boolean)),
  ].map(repairTargetRoleProblem));
}
function reportSuggestionFallbacks() {
  return [
    "添加个人简介段落：用 2-3 句话说明你的背景、核心技能和目标岗位，这是系统和招聘方第一眼读到的内容，也有助于提升关键词覆盖。",
    "优先补齐岗位描述匹配缺口：只补真实经历能支撑的工具、领域词和动作词，分别放进个人简介、技能栏和最相关的经历要点。",
    "将每段核心经历改成「动作 + 方法/工具 + 量化结果」结构，让系统和招聘方都能看到岗位证据。",
  ];
}
function simplifySuggestionText(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  if (/Add a 2-3 line Summary section first/i.test(value)) return reportSuggestionFallbacks()[0];
  if (/Prioritize missing role keywords/i.test(value)) return reportSuggestionFallbacks()[1];
  if (/Rewrite top bullets/i.test(value)) return reportSuggestionFallbacks()[2];
  return value
    .replace(/exact phrase/gi, "精确岗位原词")
    .replace(/Summary section/gi, "个人简介段落")
    .replace(/\bSummary\b/g, "个人简介")
    .replace(/Experience bullet/gi, "经历要点")
    .replace(/\bSkills\b/g, "技能栏")
    .replace(/\bJD\b/g, "岗位描述")
    .replace(/\bATS\b/g, "系统")
    .replace(/\bHR\b/g, "招聘方")
    .replace(/target role/gi, "目标岗位")
    .replace(/role keywords/gi, "岗位关键词")
    .replace(/real project or work evidence/gi, "真实项目或工作证据")
    .replace(/action, method, and measurable result/gi, "动作、方法和量化结果")
    .replace(/Experience/g, "经历")
    .replace(/bullet/g, "要点");
}
function normalizeSuggestionList() {
  const missingKw = uniqueList([
    ...(atsResult.topMissingKw || []),
    ...(atsResult.topMissingKeywords || []),
    ...(atsResult.raw?.topMissingKw || []),
    ...(atsResult.raw?.topMissingKeywords || []),
  ]).slice(0, 8);
  const fallbackSuggestions = [
    missingKw.length ? `优先补齐 JD 缺失技能：${missingKw.join("、")}。` : "",
    "把目标岗位关键词写进个人简介、技能栏和最相关的经历要点，避免只堆在技能列表。",
    "将每段核心经历改成「动作 + 方法/工具 + 量化结果」结构，让 ATS 和招聘官都能看到岗位证据。",
  ];
  return uniqueList([
    ...(atsResult.suggestions || []),
    ...(atsResult.raw?.suggestions || []),
    ...Object.values(s.sectionFixPlan || {}).flat().map(item => item.message || item.action || item.actionSummary || item.title).filter(Boolean),
    ...((atsResult.structuredSuggestions || []).map(item => item.action || item.actionSummary || item.title).filter(Boolean)),
    ...((atsResult.raw?.structuredSuggestions || []).map(item => item.action || item.actionSummary || item.title).filter(Boolean)),
    ...fallbackSuggestions,
  ]);
}
function normalizeSuggestionList() {
  const missingKw = uniqueList([
    ...(atsResult.topMissingKw || []),
    ...(atsResult.topMissingKeywords || []),
    ...(atsResult.raw?.topMissingKw || []),
    ...(atsResult.raw?.topMissingKeywords || []),
  ]).slice(0, 8);
  const fallbackSuggestions = [
    missingKw.length ? "优先补齐岗位描述中的缺失技能：只保留真实经历能支撑的工具、领域词和动作词，并写入对应段落。" : "",
    ...reportSuggestionFallbacks(),
  ];
  const raw = [
    ...(atsResult.suggestions || []),
    ...(atsResult.raw?.suggestions || []),
    ...Object.values(s.sectionFixPlan || {}).flat().map(item => item.message || item.action || item.actionSummary || item.title).filter(Boolean),
    ...((atsResult.structuredSuggestions || []).map(item => item.action || item.actionSummary || item.title).filter(Boolean)),
    ...((atsResult.raw?.structuredSuggestions || []).map(item => item.action || item.actionSummary || item.title).filter(Boolean)),
    ...fallbackSuggestions,
  ]
    .map(simplifySuggestionText)
    .filter(Boolean)
    .filter(item => !/[A-Za-z]/.test(item));
  const items = uniqueList(raw);
  for (const item of reportSuggestionFallbacks()) {
    if (!items.includes(item)) items.push(item);
  }
  return items;
}
function reportProblemFallbacks() {
  return [
    "岗位描述关键词匹配仍有提升空间。",
    "简历定位需要更贴近目标岗位。",
    "经历证据需要更清楚地支撑核心技能。",
  ];
}
function normalizeProblemList() {
  const raw = [
    ...(atsResult.keyProblems || []),
    ...(atsResult.problems || []),
    ...(atsResult.raw?.keyProblems || []),
    ...(atsResult.raw?.problems || []),
    ...((atsResult.topProblems || []).map(item => item.message || item.title).filter(Boolean)),
    ...((atsResult.raw?.topProblems || []).map(item => item.message || item.title).filter(Boolean)),
  ]
    .map(repairTargetRoleProblem)
    .map(simplifySuggestionText)
    .filter(Boolean)
    .filter(item => !/[A-Za-z]/.test(item));
  const items = uniqueList(raw);
  for (const item of reportProblemFallbacks()) {
    if (items.length >= 3) break;
    if (!items.includes(item)) items.push(item);
  }
  return items;
}
function renderAtsProblemItem(text) {
  return `<li style="margin-bottom:10px;padding-left:20px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:8px;width:6px;height:6px;border-radius:50%;background:var(--rose);"></span>${escapeHtml(text)}</li>`;
}
function renderAtsSuggestionItem(text) {
  return `<li style="margin-bottom:10px;padding-left:20px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:8px;width:6px;height:6px;border-radius:50%;background:var(--jade);"></span>${escapeHtml(text)}</li>`;
}
function normalizeTerms(value) {
  const raw = Array.isArray(value) ? value : [value];
  return raw.flatMap((item) => {
    const text = typeof item === "string" ? item : (item?.term || item?.name || "");
    return splitKeywordText(text);
  }).map((item) => String(item).trim()).filter(Boolean);
}

function splitKeywordText(text) {
  let value = String(text || "").trim();
  if (!value) return [];
  value = value
    .replace(/machine learningimage generationdebugging/gi, "machine learning,image generation,debugging")
    .replace(/machine learningimage generation/gi, "machine learning,image generation")
    .replace(/image generationdebugging/gi, "image generation,debugging");
  if (/[、,;；|]/.test(value)) return value.split(/[、,;；|]/).map((item) => item.trim()).filter(Boolean);
  return [value];
}

const KEYWORD_CATEGORY_CONFIG = {
  skill_tool: { label: "技能/工具" },
  responsibility_scene: { label: "职责/场景" },
  domain_business: { label: "行业/业务词" },
  soft_collab: { label: "软技能/协作词" },
};
const CATEGORY_LABEL_TO_GROUP = {
  "核心技能": "skill_tool",
  "工具 / 技术": "skill_tool",
  "工具/技术": "skill_tool",
  "领域词": "domain_business",
  "动作词": "responsibility_scene",
  "加分项": "responsibility_scene",
};
function categoryGroupForTerm(term, sourceKey = "", sourceLabel = "") {
  const text = String(term || "").toLowerCase();
  if (CATEGORY_LABEL_TO_GROUP[sourceLabel]) return CATEGORY_LABEL_TO_GROUP[sourceLabel];
  if (["core_skills", "tools", "hard_skills"].includes(sourceKey)) return "skill_tool";
  if (["domain_keywords"].includes(sourceKey)) return "domain_business";
  if (["action_verbs", "nice_to_have"].includes(sourceKey)) return "responsibility_scene";
  if (/(communication|collaboration|stakeholder|cross-functional|leadership|teamwork|沟通|协作|协调|跨部门|客服|客户|抗压)/i.test(term)) return "soft_collab";
  if (/(excel|sql|python|tableau|power\s*bi|quickbooks|gaap|aws|gcp|azure|jira|figma|system|系统|工具|报表|数据分析|成本控制|调度|报告制作|kpi|数据|分析)/i.test(term)) return "skill_tool";
  if (/(负责|创建|指派|调度|监控|优化|协同|值班|应急|流程|卸车|分拨|support|manage|analyze|coordinate|report|track)/i.test(term)) return "responsibility_scene";
  if (/(行业|业务|揽收|物流|快递|仓库|warehouse|logistics|parcel|delivery|运营|末端|区域)/i.test(term)) return "domain_business";
  return "domain_business";
}
function placementForKeyword(term, group, sourceKey = "") {
  const text = String(term || "").toLowerCase();
  if (sourceKey === "summary" || (/(title|岗位|职位|summary|定位|目标)/i.test(term) && !/(工具|系统|数据)/i.test(term))) {
    return { label: "放 Summary", className: "keyword-use--summary" };
  }
  if (group === "skill_tool" || ["core_skills", "tools"].includes(sourceKey)) {
    return { label: "放 Skills", className: "keyword-use--skills" };
  }
  if (group === "responsibility_scene" || /(负责|创建|指派|调度|监控|优化|协同|值班|应急|support|manage|analyze|coordinate|report|track)/i.test(term)) {
    return { label: "写进经历要点", className: "keyword-use--experience" };
  }
  if (group === "soft_collab") {
    return { label: "写进经历要点", className: "keyword-use--experience" };
  }
  if (/(公司|福利|地点|城市|全职|兼职|remote|onsite)/i.test(text)) {
    return { label: "只作参考，不建议硬塞", className: "keyword-use--reference" };
  }
  return { label: "只作参考，不建议硬塞", className: "keyword-use--reference" };
}
function keywordItemKey(item) {
  return String(item?.name || "").trim().toLowerCase();
}
function buildKeywordItems() {
  const items = [];
  const seen = new Set();
  const add = (name, status, sourceKey = "", sourceLabel = "", priority = 50) => {
    normalizeTerms(name).forEach((term) => {
      const clean = String(term || "").trim();
      if (!clean) return;
      const key = clean.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      const group = categoryGroupForTerm(clean, sourceKey, sourceLabel);
      const placement = placementForKeyword(clean, group, sourceKey);
      items.push({ name: clean, status, sourceKey, sourceLabel, group, placement, priority });
    });
  };
  getMissingKeywordChecklist().forEach((item, index) => {
    const term = item?.term || item?.name || item;
    const where = String(item?.whereToAdd || "").toLowerCase();
    const sourceKey = /experience/.test(where) ? "action_verbs" : /summary/.test(where) ? "summary" : /skills?/.test(where) || item?.category === "hard_skill" ? "core_skills" : "";
    add(term, "weak", sourceKey, "", index);
  });
  getKeywordBreakdown().forEach((cat, catIndex) => {
    const sourceKey = cat.key || "";
    const sourceLabel = cat.label || "";
    normalizeTerms(cat.missing || []).forEach((term, index) => add(term, "weak", sourceKey, sourceLabel, catIndex * 20 + index));
    normalizeTerms(cat.matched || []).forEach((term, index) => add(term, "have", sourceKey, sourceLabel, 100 + catIndex * 20 + index));
  });
  uniqueList([
    ...(atsResult.topMissingKw || []),
    ...(atsResult.topMissingKeywords || []),
    ...(atsResult.raw?.topMissingKw || []),
    ...(atsResult.raw?.topMissingKeywords || []),
  ]).forEach((term, index) => add(term, "weak", "", "", index + 5));
  return items.sort((a, b) => {
    if (a.status !== b.status) return a.status === "weak" ? -1 : 1;
    const aSkill = a.group === "skill_tool" ? 0 : 1;
    const bSkill = b.group === "skill_tool" ? 0 : 1;
    if (aSkill !== bSkill) return aSkill - bSkill;
    return a.priority - b.priority;
  });
}
function primaryKeywordItems(items) {
  const skillItems = items.filter((item) => item.group === "skill_tool");
  const source = skillItems.length >= 2 ? skillItems : items;
  return source.slice(0, 5);
}
function hasReliableSkillClassification(items) {
  return items.some((item) => item.group === "skill_tool");
}
function renderMentorLogoMarquee(pool) {
  const source = (pool && pool.length ? pool : STATIC_MENTOR_COMPANY_LOGOS);
  const logos = (source || []).filter(item => item && item.companyLogo).slice(0, 80);
  if (!logos.length) return "";
  const chips = [...logos, ...logos].map(item => `
    <div class="mentor-logo-chip" title="${escapeAttr(item.company || "")}">
      <img src="${escapeAttr(item.companyLogo)}" alt="${escapeAttr(item.company || "")}">
    </div>
  `).join("");
  return `<div class="logo-marquee" aria-label="Mentor company logos"><div class="logo-marquee-track">${chips}</div></div>`;
}
function renderMentorLogoIntro(pool) {
  return `
    <div class="mentor-logo-intro" id="mentorLogoIntro">
      <p class="mentor-logo-copy">由 MentorX 导师知识库中的真实大厂经验交叉匹配，系统会优先挑出最贴合你简历问题的建议。</p>
      ${renderMentorLogoMarquee(STATIC_MENTOR_COMPANY_LOGOS)}
    </div>`;
}

function collectMentorLogoPool() {
  const pools = [
    ...(s.mentorLogoPool || []),
    ...(s.lockedAdvicePreview?.mentorLogoPool || []),
    ...(s.freeMentorAdvice?.mentorLogoPool || []),
    ...(s.premiumMentors || []).map((m) => ({ company: m.company, companyLogo: m.companyLogo })),
    ...(atsResult.raw?.premiumMentors || []).map((m) => ({ company: m.company, companyLogo: m.companyLogo })),
    ...(atsResult.raw?.freeMentorAdvice?.mentorLogoPool || []),
  ];
  const seen = new Set();
  return pools.filter((item) => {
    const key = `${item?.company || ""}|${item?.companyLogo || ""}`;
    if (!item?.companyLogo || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function formatMentorName(name){
  if (!name) return "X导师";
  const parts = name.trim().split(/\s+/);
  const last = parts[parts.length - 1] || parts[0];
  return last[0].toUpperCase() + "导师";
}
function formatAdvice(text){
  if (!text) return "";
  const parts = String(text).split(/(?=\(\d+\))/);
  if (parts.length <= 1) return highlightFake(text);
  return parts.map(p => p.trim()).filter(Boolean)
    .map(p => `<div style="margin-bottom:5px;">${highlightFake(p)}</div>`)
    .join("");
}
function highlightFake(text){
  if (!text) return "";
  return String(text).replace(/\[\[([^\]]+)\]\]/g,
    '<mark style="background:rgba(232,160,107,.22);color:var(--apricot,#e8a06b);border-radius:3px;padding:0 2px;font-weight:600;" title="AI 估算数据，仅供参考">$1</mark>'
  );
}
function copyMentorExample(btn){
  const raw = btn.getAttribute("data-content").replace(/&apos;/g,"'").replace(/&quot;/g,'"');
  const text = raw.replace(/\[\[([^\]]+)\]\]/g,"$1");
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(
    () => { btn.innerHTML = "✓ 已复制"; setTimeout(() => btn.innerHTML = "📋 复制", 2000); }
  );
}
window.copyMentorExample = copyMentorExample;

// ── 1. Summary ──
const atsScore = atsResult.atsScore || 0;
const issueProblems = normalizeProblemList();
const issueText = issueProblems.length
  ? issueProblems[0]
  : atsScore
    ? `ATS ${atsRiskText(atsResult.riskLevel)}（${atsScore}/100），请优先查看 ATS 诊断中的分项得分和修改建议。`
    : "";
const coreIssueEl = document.getElementById("coreIssue");
if (coreIssueEl) coreIssueEl.textContent = issueText;

const headlineEl = document.getElementById("reportHeadlineScore") || document.querySelector(".report-headline .num");
if (headlineEl) headlineEl.textContent = atsScore || "--";

// ── 1.5. Result-page metrics, fully expanded for report ──
(function renderReportDataMetrics() {
  const jdMatchValue = formatJdKeywordMatchValue(atsResult);
  const rankPctEl = document.getElementById("reportRankPct");
  if (rankPctEl) rankPctEl.textContent = jdMatchValue;

  const atsTileEl = document.getElementById("reportAtsScore");
  if (atsTileEl) atsTileEl.textContent = atsScore || "--";
  const riskCaptionEl = document.getElementById("reportAtsRiskCaption");
  if (riskCaptionEl) {
    const riskLabel = atsRiskText(atsResult.riskLevel);
    riskCaptionEl.textContent = riskLabel;
    riskCaptionEl.classList.remove("risk-high", "risk-medium", "risk-low", "risk-pending");
    riskCaptionEl.classList.add(riskToneClass(riskLabel));
  }

  const rankDetailEl = document.getElementById("reportRankDetail");
  if (rankDetailEl) {
    rankDetailEl.innerHTML = renderRows([
      { k:"JD 关键词匹配", v: formatJdKeywordCount(atsResult), note:"已覆盖 / JD 关键词总数。" },
      { k:"整体覆盖率", v: formatJdKeywordMatchPercent(atsResult), note:"基于目标 JD 的关键词覆盖情况估算。" },
    ]) + renderStackedRows([
      { k:"主要缺口", v:"下方岗位描述关键词清单已整理关键词与放置建议。", note:"报告页会直接展示当前可用的完整分析内容。" },
    ]);
  }

  const atsDetailEl = document.getElementById("reportAtsDetail");
  if (atsDetailEl) {
    atsDetailEl.innerHTML = renderRows([
      { k:"ATS 总分", v: atsScore ? `${atsScore}/100` : "--", note: atsRiskText(atsResult.riskLevel) },
      { k:"JD 关键词匹配", v: formatJdKeywordCount(atsResult), note:"已覆盖 / JD 关键词总数" },
      { k:"简历质量", v: (atsResult.dimensions?.C?.score ?? atsResult.raw?.dimensions?.C?.score ?? "--") + "/" + (atsResult.dimensions?.C?.max ?? atsResult.raw?.dimensions?.C?.max ?? 12), note:"内容质量与成果表达" },
    ]);
  }

  const aiTrend = buildReportAiImpactTrend();
  const aiLevelEl = document.getElementById("reportAiImpactLevel");
  const aiCaptionEl = document.getElementById("reportAiImpactCaption");
  const aiDetailEl = document.getElementById("reportAiImpactDetail");
  if (aiLevelEl) {
    aiLevelEl.textContent = aiTrend.level;
    aiLevelEl.classList.remove("ai-impact-low", "ai-impact-medium", "ai-impact-high", "ai-impact-pending");
    const levelText = String(aiTrend.level || "");
    aiLevelEl.classList.add(/高/.test(levelText) ? "ai-impact-high" : /低/.test(levelText) ? "ai-impact-low" : /中/.test(levelText) ? "ai-impact-medium" : "ai-impact-pending");
  }
  if (aiCaptionEl) aiCaptionEl.textContent = aiTrend.caption;
  if (aiDetailEl) aiDetailEl.innerHTML = renderStackedRows(aiTrend.rows);

  const tiles = Array.from(document.querySelectorAll("#reportDataTiles .tile"));
  if (tiles.length) {
    const syncClosedTileHeight = () => {
      tiles.forEach((tile) => {
        tile.style.minHeight = "";
      });
      const closedHeight = Math.max(...tiles.map((tile) => {
        const wasOpen = tile.open;
        tile.open = false;
        const height = tile.offsetHeight;
        tile.open = wasOpen;
        return height;
      }));
      tiles.forEach((tile) => {
        if (!tile.open) tile.style.minHeight = `${closedHeight}px`;
      });
    };
    tiles.forEach((tile) => tile.addEventListener("toggle", syncClosedTileHeight));
    window.addEventListener("resize", syncClosedTileHeight);
    requestAnimationFrame(syncClosedTileHeight);
  }
})();

(async function loadReportSalaryTrajectory() {
  const salaryRangeEl = document.getElementById("reportSalaryRange");
  const salaryTopEl = document.getElementById("reportSalaryTop");
  const headlineSalaryTopEl = document.getElementById("reportHeadlineSalaryTop");
  const salaryDetailEl = document.getElementById("reportSalaryDetail");
  const showSalaryFallback = () => {
    if (salaryRangeEl) salaryRangeEl.textContent = "待校准";
    if (salaryTopEl) salaryTopEl.textContent = "需补充";
    if (headlineSalaryTopEl) headlineSalaryTopEl.textContent = "待校准";
    if (salaryDetailEl) salaryDetailEl.innerHTML = renderRows(salaryUnavailableRows());
    window.dispatchEvent(new Event("resize"));
  };
  const jobTitle = getTargetJobTitle() || s.jobTitle || atsResult.jobTitle || atsResult.raw?.jobTitle || "";
  const jdText = getStoredJdText();
  const location = getStoredLocation();
  const resumeText = getStoredResumeText();
  const roleFamily = getSalaryRoleFamily();
  const targetRole = getSalaryTargetRole();
  if (!jobTitle && !jdText) {
    showSalaryFallback();
    return;
  }
  try {
    const resp = await fetch("/api/position-salary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobTitle, jdText, location, resumeText, roleFamily, targetRole }),
    });
    if (!resp.ok) {
      showSalaryFallback();
      return;
    }
    const data = await resp.json();
    if (data.trajectory_source !== "benchmark" || !data.three_year_range || !data.five_year_range) {
      showSalaryFallback();
      return;
    }
    if (salaryRangeEl) salaryRangeEl.textContent = data.three_year_range;
    if (salaryTopEl) salaryTopEl.textContent = data.five_year_range;
    if (headlineSalaryTopEl) headlineSalaryTopEl.textContent = data.top_range || data.five_year_range;
    const rows = [];
    if (data.jd_salary) {
      rows.push({ k:"JD 标注薪资", v:data.jd_salary, note:"这是 JD 中写明的薪资，不等同于长期成长上限。" });
    }
    rows.push(
      { k:"当前赛道参考", v:data.current_range || "待校准", note:formatSalaryBasisNote(data) },
      { k:"3 年成长区间", v:data.three_year_range, note:"若持续积累目标岗位相关经验和可验证成果，3 年内可参考这个区间。" },
      { k:"5 年成长区间", v:data.five_year_range, note:"代表同类岗位中经验更成熟、职责更完整时的市场参考。" },
      { k:"同赛道高分位", v:data.top_range || data.five_year_range, note:salarySourceDisplayNote() }
    );
    if (salaryDetailEl) salaryDetailEl.innerHTML = renderRows(rows);
    window.dispatchEvent(new Event("resize"));
  } catch (e) {
    console.warn("[Report salary]", e.message);
    showSalaryFallback();
  }
})();

// ── 2. ATS 详细分数 ──
(function renderAtsDetail() {
  const raw = atsResult.raw?.dimensions || atsResult.dimensions || {};
  const dimKeys = ["A","B","C","D","E","F"];
  const dimLabels = { A:"格式规范", B:"基本资料", C:"内容质量", D:"技能匹配", E:"市场适配", F:"经验匹配" };
  const jdKeywordCount = formatJdKeywordCount(atsResult);

  const svgEl = document.getElementById("atsRadarChart");
  if (svgEl) {
    const cx = 120, cy = 110, R = 80;
    const dims = dimKeys.map(k => {
      const d = raw[k];
      return d ? { score:d.score, max:d.max, pct:Math.round((d.score / d.max) * 100) } : { score:0, max:1, pct:0 };
    });
    const angle = (i) => (Math.PI / 3) * i - Math.PI / 2;
    const pt = (i, r) => [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))];
    let svg = "";
    [0.25, 0.5, 0.75, 1].forEach(frac => {
      svg += `<polygon points="${dimKeys.map((_,i) => pt(i, R * frac).join(",")).join(" ")}" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="1"/>`;
    });
    dimKeys.forEach((_, i) => {
      const [x, y] = pt(i, R);
      svg += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(0,0,0,.1)" stroke-width="1"/>`;
    });
    const dataPts = dims.map((d, i) => pt(i, R * d.pct / 100).join(",")).join(" ");
    svg += `<polygon points="${dataPts}" fill="rgba(106,191,123,.25)" stroke="var(--jade,#6abf7b)" stroke-width="2"/>`;
    dims.forEach((d, i) => {
      const [dx, dy] = pt(i, R * d.pct / 100);
      const [lx, ly] = pt(i, R + 22);
      const anchor = lx < cx - 4 ? "end" : lx > cx + 4 ? "start" : "middle";
      const color = d.pct >= 70 ? "var(--good,#6abf7b)" : d.pct >= 45 ? "#e9a84c" : "var(--rose,#e07070)";
      svg += `<circle cx="${dx}" cy="${dy}" r="4" fill="${color}"/>`;
      svg += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="11" font-weight="600" fill="var(--ink-soft)" font-family="var(--sans)">${dimLabels[dimKeys[i]]}</text>`;
      svg += `<text x="${lx}" y="${ly + 13}" text-anchor="${anchor}" font-size="12" font-weight="800" fill="${color}" font-family="var(--sans)">${d.score}/${d.max}</text>`;
    });
    svgEl.innerHTML = svg;
  }

  const totalEl = document.getElementById("atsTotalScore");
  if (totalEl && atsResult.atsScore) {
    const sc = atsResult.atsScore;
    const scoreColor = sc >= 75 ? "var(--jade,#6abf7b)" : sc >= 55 ? "#e9a84c" : "var(--rose,#e07070)";
    totalEl.innerHTML = `<span style="color:${scoreColor};">${sc}</span><span style="font-size:13px;color:var(--ink-soft);font-weight:500;">/100</span>`;
  }
  const riskMap = {
    "低": { label:"低风险", bg:"#d4f0de", color:"#2d7a4a", border:"#2d7a4a" },
    "中": { label:"中风险", bg:"#fde8c8", color:"#b05e00", border:"#b05e00" },
    "高": { label:"高风险", bg:"#fdd8d8", color:"#b02020", border:"#b02020" },
  };
  const r = riskMap[atsResult.riskLevel] || { label: atsResult.riskLevel || "未知", bg:"#eee", color:"#666", border:"#999" };
  const badgeEl = document.getElementById("atsRiskBadge");
  if (badgeEl) { badgeEl.textContent = r.label; badgeEl.style.background = r.bg; badgeEl.style.color = r.color; badgeEl.style.border = `1.5px solid ${r.border}`; }

  const sysSummaryEl = document.getElementById("atsSystemSummary");
  if (sysSummaryEl) {
    sysSummaryEl.innerHTML = [
      jdKeywordCount !== "--" ? `<div><b>JD 关键词覆盖：</b>${jdKeywordCount}</div>` : "",
      atsResult.formatPenaltyTriggered ? `<div style="color:var(--rose);"><b>格式处罚：</b>${(atsResult.formatPenaltyReason || []).join("；")}</div>` : "",
    ].filter(Boolean).join("");
  }

  const problems = normalizeProblemList();
  const suggestions = normalizeSuggestionList();
  const probSection = document.getElementById("atsProblemsSection");
  if (probSection) {
    probSection.innerHTML = `
      ${problems.length ? `<div style="font-size:13px;font-weight:600;color:var(--rose);margin-bottom:8px;">🔍 关键问题</div>
      <ul style="list-style:none;padding:0;margin:0;font-size:13px;">
        ${problems.map(renderAtsProblemItem).join("")}
      </ul>` : ""}
      ${suggestions.length ? `<div style="font-size:13px;font-weight:600;color:var(--jade);margin:14px 0 8px;">✨ 优先建议</div>
      <ul style="list-style:none;padding:0;margin:0;font-size:13px;">
        ${suggestions.map(renderAtsSuggestionItem).join("")}
      </ul>` : ""}`;
  }
})();

// ── 3. Skills ──
const labelMap = {
  have: `<span class="pill pill-good"><span class="dot"></span>已具备</span>`,
  weak: `<span class="pill pill-warn"><span class="dot"></span>待补强</span>`
};
function renderSkillRow(sk) {
  const placement = sk.placement || placementForKeyword(sk.name, sk.group, sk.sourceKey);
  return `<li class="skill-row">
    <div class="skill-name"><span class="priority">#${sk.priority}</span>${escapeHtml(sk.name)}</div>
    <div class="skill-meta">
      <span class="keyword-use ${placement.className}">${escapeHtml(placement.label)}</span>
      ${labelMap[sk.status] || ""}
    </div>
  </li>`;
}
function renderSkillList(skills){
  const skillListEl = document.getElementById("skillList");
  if (!skillListEl) return;
  const visibleCount = 5;
  const visibleSkills = skills.slice(0, visibleCount);
  const hiddenSkills = skills.slice(visibleCount);
  skillListEl.innerHTML = [
    ...visibleSkills.map(renderSkillRow),
    ...hiddenSkills.map((sk) => renderSkillRow(sk).replace('<li class="skill-row">', '<li class="skill-row report-skill-extra" hidden>')),
  ].join("");
  const expandBtn = document.getElementById("reportSkillExpandToggle");
  if (expandBtn) {
    expandBtn.hidden = hiddenSkills.length === 0;
    expandBtn.textContent = "查看更多 ↓";
    let open = false;
    expandBtn.onclick = () => {
      open = !open;
      skillListEl.querySelectorAll(".report-skill-extra").forEach((el) => {
        el.hidden = !open;
      });
      expandBtn.textContent = open ? "收起 ↑" : "查看更多 ↓";
    };
  }
  const jdCount = getJdKeywordCount(atsResult);
  const have = jdCount ? jdCount.matched : skills.filter(sk => sk.status === "have").length;
  const total = jdCount ? jdCount.total : skills.length;
  const weak = Math.max(0, total - have);
  const insightEl = document.querySelector(".ai-insight-diagnosis");
  if (insightEl) insightEl.innerHTML = `<span class="ico">💡</span>你已掌握 <b>${have}/${total}</b> 项岗位描述关键词，还有 <b>${weak} 项</b>待补强。${weak > 0 ? "优先处理可放进技能栏、个人简介和经历要点的技能/工具/能力词，避免把所有关键词平铺硬塞。" : "关键词覆盖率良好，建议进一步量化成果。"}`;
}
function renderKeywordCategories(items) {
  const detailsEl = document.getElementById("jdKeywordDetails");
  const listEl = document.getElementById("jdKeywordCategoryList");
  if (!detailsEl || !listEl) return;
  const grouped = Object.keys(KEYWORD_CATEGORY_CONFIG).map((group) => ({
    group,
    label: KEYWORD_CATEGORY_CONFIG[group].label,
    items: items.filter((item) => item.group === group),
  })).filter((group) => group.items.length);
  if (!grouped.length) {
    detailsEl.hidden = true;
    listEl.innerHTML = "";
    return;
  }
  detailsEl.hidden = false;
  listEl.innerHTML = grouped.map((group) => `
    <div class="jd-keyword-group">
      <div class="jd-keyword-group-head">
        <span class="jd-keyword-group-title">${escapeHtml(group.label)}</span>
        <span class="jd-keyword-group-count">${group.items.length}</span>
      </div>
      <div class="jd-keyword-chips">
        ${group.items.map((item) => `
          <span class="jd-keyword-chip ${item.status === "have" ? "is-have" : ""}" title="${escapeAttr(item.placement.label)}">
            <span class="state"></span><b>${escapeHtml(item.name)}</b>
            <span class="keyword-use ${item.placement.className}">${escapeHtml(item.placement.label)}</span>
          </span>
        `).join("")}
      </div>
    </div>
  `).join("");
}
(async function loadSkills(){
  const keywordItems = buildKeywordItems();
  const reliableSkills = hasReliableSkillClassification(keywordItems);
  const displayItems = keywordItems.map((sk, i) => ({ ...sk, priority: i + 1 }));
  const titleEl = document.getElementById("reportSkillSectionTitle");
  const descEl = document.getElementById("reportSkillSectionDesc");
  if (titleEl) titleEl.textContent = "JD Keyword 清单";
  if (descEl) {
    descEl.textContent = "这些是系统从 JD 中识别出的关键词。优先把待补强项写进 Summary、Skills 或 Experience。";
  }
  renderKeywordCategories(keywordItems);
  if (displayItems.length > 0 || getJdKeywordCount(atsResult)) {
    renderSkillList(displayItems);
  } else {
    const skillListEl = document.getElementById("skillList");
    const insightEl = document.querySelector(".ai-insight-diagnosis");
    if (skillListEl) skillListEl.innerHTML = "";
    if (insightEl) insightEl.innerHTML = `<span class="ico">💡</span>暂未识别到稳定的 JD 关键词。建议先确认 JD 文本是否包含岗位职责、任职要求和工具/技能信息。`;
  }
})();

// ── 4. Mentors ──
// Re-render ATS keyword, problems, and suggestions without preview caps.
(function renderFullAtsLists() {
  const kwSection = document.getElementById("atsKeywordSection");
  if (kwSection) {
    const breakdown = getKeywordBreakdown();
    const jdKeywordCount = formatJdKeywordCount(atsResult);
    let kwHTML = `<div style="font-size:13px;font-weight:700;color:var(--ink);margin-bottom:10px;padding-bottom:8px;border-bottom:1px dashed var(--line);">JD 技能覆盖${jdKeywordCount !== "--" ? ` <span style="color:var(--ink);font-family:var(--mono);font-size:13px;"> · 已具备 ${jdKeywordCount}</span>` : ""}</div>`;
    if (breakdown.length) {
      kwHTML += breakdown.map(cat => {
        const matched = normalizeTerms(cat.matched || []);
        const missing = normalizeTerms(cat.missing || []);
        const total = cat.total || matched.length + missing.length;
        const pct = total ? Math.round((matched.length / total) * 100) : 0;
        const pctColor = pct>=70 ? "var(--good)" : pct>=40 ? "#e9a84c" : "var(--rose)";
        const matchedPills = matched.map(k => `<span style="display:inline-block;padding:3px 8px;border-radius:99px;background:rgba(106,191,123,.15);color:#2d7a4a;font-size:12px;font-weight:500;margin:2px;">${escapeHtml(k)}</span>`).join("");
        const missingPills = missing.map(k => `<span style="display:inline-block;padding:3px 8px;border-radius:99px;background:rgba(224,112,112,.12);color:#b02020;font-size:12px;font-weight:500;margin:2px;">${escapeHtml(k)}</span>`).join("");
        return `<div style="margin-bottom:14px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:700;color:var(--ink);font-family:var(--mono);letter-spacing:.04em;text-transform:uppercase;">${escapeHtml(cat.label || "JD Keywords")}</span>
            <span style="font-size:12px;font-weight:700;font-family:var(--mono);color:${pctColor};">${matched.length}/${total}</span>
          </div>
          ${matchedPills ? `<div style="margin-bottom:4px;"><span style="font-size:10px;color:var(--ink-mute);font-family:var(--mono);letter-spacing:.03em;">✓ 已命中</span><div style="margin-top:3px;">${matchedPills}</div></div>` : ""}
          ${missingPills ? `<div><span style="font-size:10px;color:var(--ink-mute);font-family:var(--mono);letter-spacing:.03em;">× 未命中</span><div style="margin-top:3px;">${missingPills}</div></div>` : ""}
        </div>`;
      }).join("");
    } else {
      const missingKw = uniqueList([
        ...(atsResult.topMissingKw || []),
        ...(atsResult.raw?.topMissingKw || []),
        ...getMissingKeywordChecklist().map(item => item.term || item.name),
      ]);
      if (missingKw.length) {
        kwHTML += `<div><div style="font-size:11px;color:var(--ink-soft);font-family:var(--mono);letter-spacing:.04em;margin-bottom:4px;">待补关键词</div><div style="display:flex;flex-wrap:wrap;gap:4px;">${missingKw.map(k=>`<span style="display:inline-block;padding:3px 8px;border-radius:99px;background:rgba(224,112,112,.12);color:#b02020;font-size:12px;">${escapeHtml(k)}</span>`).join("")}</div></div>`;
      }
    }
    kwSection.innerHTML = kwHTML;
  }

  const probSection = document.getElementById("atsProblemsSection");
  if (probSection) {
    const problems = normalizeProblemList();
    const suggestions = normalizeSuggestionList();
    probSection.innerHTML = `
      ${problems.length ? `<div style="font-size:13px;font-weight:600;color:var(--rose);margin-bottom:8px;">🔍 关键问题</div>
      <ul style="list-style:none;padding:0;margin:0;font-size:13px;">${problems.map(renderAtsProblemItem).join("")}</ul>` : ""}
      ${suggestions.length ? `<div style="font-size:13px;font-weight:600;color:var(--jade);margin:14px 0 8px;">✨ 优先建议</div>
      <ul style="list-style:none;padding:0;margin:0;font-size:13px;">${suggestions.map(renderAtsSuggestionItem).join("")}</ul>` : ""}`;
  }
})();

const sectionLabelMap = {
  summary:"Summary", skills:"Skills", experience:"Experience",
  projects:"Projects", education:"Education", overall:"Overall"
};
function sectionLabel(sec){ return sectionLabelMap[sec] || "Overall"; }

function priorityLabel(p){
  if(!p) return "medium";
  if(p==="high"||p==="P0"||p==="critical") return "high";
  if(p==="medium"||p==="P1") return "medium";
  return "low";
}
function priorityBadge(p){
  const lv = priorityLabel(p);
  const cfg = {
    high:   { dot:"#EF4444", bg:"#FEF2F2", color:"#B91C1C", border:"#FECACA", label:"必改" },
    medium: { dot:"#F97316", bg:"#FFF7ED", color:"#C2410C", border:"#FED7AA", label:"建议改" },
    low:    { dot:"#3B82F6", bg:"#EFF6FF", color:"#1D4ED8", border:"#BFDBFE", label:"补充" },
  };
  const c = cfg[lv] || cfg.medium;
  return `<span style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;background:${c.bg};color:${c.color};border:1px solid ${c.border};"><span style="width:6px;height:6px;border-radius:50%;background:${c.dot};flex-shrink:0;"></span>${c.label}</span>`;
}

function renderAdviceItem(item, idx) {
  const insight = item.mentorInsight || "";
  const example = /^[（(]?\s*无具体示例\s*[）)]?$/i.test(String(item.example || "").trim()) ? "" : (item.example || "");
  const hrPerspective = item.hrPerspective || item.HR_os || item.hrPov || item.recruiterPerspective || HR_PERSPECTIVE_LOOKUP.get(String(item.adviceId || "")) || HR_PERSPECTIVE_LOOKUP.get(adviceIdentity(item)) || fallbackHrPerspective(item);
  const divider = idx > 0
    ? `<div style="height:1px;background:linear-gradient(to right,transparent,#DDD6CA,transparent);margin:24px 0;"></div>`
    : "";
  const problemSummary = item.problemSummary || item.currentDiagnosis || "";
  const actionSummary = item.actionSummary || item.action || "";
  return `
    <div style="margin-top:${idx>0?'0':'12px'};">
      ${divider}
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;">
        ${priorityBadge(item.priority)}
        <span style="font-size:11px;color:#9CA3AF;font-weight:500;">导师建议 ${idx+1}</span>
        <span style="margin-left:auto;font-size:11px;font-weight:600;padding:3px 10px;border-radius:99px;background:#EEF2FF;color:#4338CA;border:1px solid #C7D2FE;flex-shrink:0;">${escapeHtml(item.displayAdviceType || item.topicCluster || sectionLabel(item.targetSection))}</span>
      </div>
      <h4 style="margin:0 0 14px;font-size:16px;font-weight:700;color:#111827;line-height:1.4;">${escapeHtml(item.title)}</h4>
      ${problemSummary ? `<div style="display:flex;gap:10px;background:#F8F7F4;border-left:3px solid #D1C9B8;border-radius:0 10px 10px 0;padding:12px 14px;margin-bottom:10px;"><span style="font-size:15px;flex-shrink:0;margin-top:1px;">💡</span><div><div style="font-size:11px;font-weight:700;color:#78350F;margin-bottom:4px;">你的现状</div><p style="margin:0;font-size:13px;line-height:1.65;color:#44403C;">${escapeHtml(problemSummary)}</p></div></div>` : ""}
      ${actionSummary ? `<div style="display:flex;gap:10px;background:#F0FDF4;border-left:3px solid #4ADE80;border-radius:0 10px 10px 0;padding:12px 14px;margin-bottom:10px;"><span style="font-size:15px;flex-shrink:0;margin-top:1px;">⚡</span><div><div style="font-size:11px;font-weight:700;color:#15803D;margin-bottom:4px;">建议你先做</div><p style="margin:0;font-size:13px;line-height:1.65;color:#166534;">${escapeHtml(actionSummary)}</p></div></div>` : ""}
      ${insight ? `<div style="background:#F5F3FF;border-left:3px solid #C4B5FD;border-radius:0 10px 10px 0;padding:12px 14px;margin-bottom:10px;"><div style="font-size:11px;font-weight:700;color:#6D28D9;margin-bottom:4px;">导师视角</div><p style="margin:0;font-size:13px;line-height:1.65;color:#4C1D95;">${escapeHtml(insight)}</p></div>` : ""}
      ${example ? `<div class="advice-example"><div class="advice-example-head"><div class="title"><span class="check">✓</span><span>改写示例</span></div><button class="copy-btn" onclick="copyMentorExample(this)" data-content='${escapeAttr(example)}'>📋 复制</button></div><div class="advice-example-body"><span style="font-size:13px;font-weight:500;line-height:1.6;font-family:var(--mono,monospace);">${escapeHtml(example)}</span></div></div>` : ""}
      ${hrPerspective ? `<div style="background:#F5F3FF;border-left:3px solid #C4B5FD;border-radius:0 10px 10px 0;padding:12px 14px;margin-top:8px;"><div style="font-size:11px;font-weight:700;color:#6D28D9;margin-bottom:4px;">HR</div><p style="margin:0;font-size:13px;line-height:1.65;color:#4C1D95;">${escapeHtml(hrPerspective)}</p></div>` : ""}
    </div>
  `;
}

function avatarCircle(company, size) {
  const colors = ["#6366F1","#10B981","#F59E0B","#EF4444","#8B5CF6","#0EA5E9","#F97316","#EC4899"];
  const idx = (company||"M").charCodeAt(0) % colors.length;
  const initial = (company||"M")[0].toUpperCase();
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${colors[idx]};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:${Math.round(size*0.35)}px;flex-shrink:0;">${initial}</div>`;
}

function renderPremiumMentorCard(m, idx) {
  const allTags = (m.badges||[]);
  const advice = (m.adviceItems||[]).slice(0,3).map((item,i)=>renderAdviceItem(item,i)).join("");
  const companyMeta = [m.company, m.mentorTitle].filter(Boolean).join(" · ");
  return `
    <article style="background:#FFFDF6;border:1px solid #EDE9DC;border-radius:22px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.06);margin-bottom:16px;">
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:18px;">
        <div class="mentor-avatar-placeholder" style="width:48px;height:48px;border-radius:50%;background:#F3F4F6;border:1px solid #EDE9DC;flex-shrink:0;"></div>
        <div style="flex:1;min-width:0;">
        <div style="font-weight:700;font-size:18px;color:#111827;line-height:1.2;">${escapeHtml(m.mentorName||"导师")}</div>
        ${companyMeta ? `<div style="font-size:12px;color:#9CA3AF;margin-top:4px;">${escapeHtml(companyMeta)}</div>` : ""}
        ${m.careerPathDisplay ? `<div style="font-size:12px;color:#9CA3AF;margin-top:2px;">${escapeHtml(m.careerPathDisplay)}</div>` : ""}
        </div>
      </div>
      <div style="height:1px;background:#EDE9DC;margin:0 0 20px;"></div>
      <div>${advice}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;border-top:1px solid #EDE9DC;margin-top:20px;padding-top:14px;">
        <span style="font-size:12px;color:#9CA3AF;font-weight:500;">导师 ${idx+1} / 4</span>
      </div>
    </article>
  `;
}

function renderAdviceBundle(items, logoPool) {
  const advice = (items || []).slice(0, 12).map((item, i) => renderAdviceItem(item, i)).join("");
  return `
    <article style="background:#FFFDF6;border:1px solid #EDE9DC;border-radius:22px;padding:24px;box-shadow:0 2px 12px rgba(0,0,0,0.06);margin-bottom:16px;">
      <div>${advice}</div>
    </article>
  `;
}

function adviceIdentity(item) {
  return String(item?.adviceId || item?.id || `${item?.title || ""}|${item?.action || item?.actionSummary || ""}`).trim();
}
function collectHrPerspectiveLookup() {
  const lookup = new Map();
  const sources = [
    ...(s.premiumAdviceItems || []),
    ...(atsResult.raw?.premiumAdviceItems || []),
    ...((s.premiumMentors || []).flatMap(m => m.adviceItems || m.adviceList || [])),
    ...((atsResult.raw?.premiumMentors || []).flatMap(m => m.adviceItems || m.adviceList || [])),
    ...(s.freeMentorAdvice?.adviceItems || []),
    ...(atsResult.raw?.freeMentorAdvice?.adviceItems || []),
    ...((s.mentorAdvice || []).flatMap(m => m.adviceItems || m.adviceList || [])),
  ];
  sources.forEach((item) => {
    const hr = item?.hrPerspective || item?.HR_os || item?.hrPov || item?.recruiterPerspective || "";
    if (!hr) return;
    [item.adviceId, item.id, adviceIdentity(item)].filter(Boolean).forEach((key) => {
      if (!lookup.has(String(key))) lookup.set(String(key), hr);
    });
  });
  return lookup;
}
const HR_PERSPECTIVE_LOOKUP = collectHrPerspectiveLookup();
function fallbackHrPerspective(item = {}) {
  const action = item.action || item.actionSummary || item.title || "这条修改建议";
  return `HR 会把这里当作快速筛选信号：如果简历没有体现「${String(action).slice(0, 42)}」这一点，候选人与 JD 的匹配感会被削弱。`;
}
function isUnsafeReportAdvice(item) {
  const text = [
    item?.title,
    item?.currentDiagnosis,
    item?.problemSummary,
    item?.action,
    item?.actionSummary,
    item?.mentorInsight,
    item?.mentorLens,
    item?.I_insight,
    item?.P_mentor,
    item?.example,
    item?.hrPerspective,
    item?.HR_os,
  ].filter(Boolean).join(" ").toLowerCase();
  return /绿卡|green card|工作身份|work authorization|holder|quant research|risk quant|mfe|sharpe ratio|embedded system|computer vision|ba方向|ba\s*\/\s*da|da\s*\/\s*ba/i.test(text);
}
function hasMissingSummarySignal() {
  const sources = [
    ...(atsResult.problemTags || []),
    ...(atsResult.raw?.problemTags || []),
    ...(atsResult.diagnosticObligations || []),
    ...(atsResult.raw?.diagnosticObligations || []),
    ...(atsResult.problems || []),
    ...(atsResult.raw?.problems || []),
  ];
  return sources.some((item) => {
    const tag = typeof item === "string" ? item : item?.tag || item?.id || item?.problemTag || "";
    const text = typeof item === "string" ? item : [item?.message, item?.title, item?.evidence].filter(Boolean).join(" ");
    return /missing_summary|缺少\s*summary|没有\s*summary|add\s+(?:a\s+)?summary/i.test(`${tag} ${text}`);
  }) || atsResult.diagnostics?.searchability?.hasSummary === false || atsResult.raw?.diagnostics?.searchability?.hasSummary === false;
}
function normalizeMissingSummaryAdviceItem(item = {}) {
  const tags = item.relatedProblemTags || [];
  const text = [item.title, item.action, item.actionSummary, item.currentDiagnosis, item.problemSummary, item.mentorInsight, item.reason].filter(Boolean).join(" ");
  const talksAboutSummaryKeyword = /summary/i.test(text) && /岗位原词|目标岗位原词|exact (?:target )?(?:job )?title|target title|job title|keyword|关键词|定位|目标岗位/i.test(text);
  if (!tags.includes("missing_summary") && !(hasMissingSummarySignal() && talksAboutSummaryKeyword)) return item;
  const targetRole = getTargetJobTitle() || s.jobTitle || atsResult.jobTitle || atsResult.profile?.targetRole || atsResult.raw?.jobTitle || "目标岗位";
  const action = `新增 2-3 行 Summary：第一句写目标岗位 ${targetRole}，第二句连接你最相关的经历、技能和可量化成果；先把段落搭起来，再补具体关键词。`;
  return {
    ...item,
    title: "先补上 Summary 段落",
    currentDiagnosis: "原简历目前缺少 Summary 段落；需要先有一个岗位定位入口，再谈把 JD 关键词放进 Summary。",
    problemSummary: "原简历目前缺少 Summary 段落；需要先有一个岗位定位入口，再谈把 JD 关键词放进 Summary。",
    action,
    actionSummary: action,
    mentorInsight: "没有 Summary 时，简历开头缺少岗位定位入口；先搭出这一段，后续目标岗位原词和 JD 关键词才有自然承载位置。",
    hrPerspective: "HR 会先看简历开头是否说明投递方向；缺少 Summary 时，后面的技能和经历更容易被读散。",
    relatedProblemTags: [...new Set(["missing_summary", ...tags.filter((tag) => tag !== "missing_exact_job_title")])],
    canonicalActionFamily: "summary_creation",
    targetSection: "summary",
  };
}
function isMissingSummaryAdvice(item = {}) {
  return item.canonicalActionFamily === "summary_creation" || (item.relatedProblemTags || []).includes("missing_summary");
}
function collectReportAdviceItems() {
  const sources = [
    ...(s.premiumAdviceItems || []),
    ...(atsResult.raw?.premiumAdviceItems || []),
    ...((s.premiumMentors || []).flatMap(m => m.adviceItems || [])),
    ...((atsResult.raw?.premiumMentors || []).flatMap(m => m.adviceItems || [])),
    ...(s.freeMentorAdvice?.adviceItems || []),
    ...(atsResult.raw?.freeMentorAdvice?.adviceItems || []),
    ...((s.mentorAdvice || []).flatMap(m => m.adviceItems || m.adviceList || [])),
  ];
  const seen = new Set();
  const items = [];
  for (const item of sources) {
    if (isUnsafeReportAdvice(item)) continue;
    const normalized = normalizeMissingSummaryAdviceItem(item);
    const key = hasMissingSummarySignal() && isMissingSummaryAdvice(normalized) ? "missing_summary" : adviceIdentity(normalized);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    items.push(normalized);
    if (items.length >= 12) break;
  }
  return items.sort((a, b) => {
    const aMissing = hasMissingSummarySignal() && isMissingSummaryAdvice(a);
    const bMissing = hasMissingSummarySignal() && isMissingSummaryAdvice(b);
    if (aMissing !== bMissing) return aMissing ? -1 : 1;
    return 0;
  }).slice(0, 12);
}

const FIT_TYPE_CONFIG = {
  same_role: { label:"同职位导师", bg:"#EFF6FF", color:"#1D4ED8", border:"#BFDBFE" },
  same_industry: { label:"同产业导师", bg:"#F0FDF4", color:"#15803D", border:"#BBF7D0" },
  same_function: { label:"同职能导师", bg:"#F0FDF4", color:"#166534", border:"#BBF7D0" },
  cross_domain_high_relevance: { label:"跨领域高相关", bg:"#FFF7ED", color:"#92400E", border:"#FDE68A" },
  recruiter_perspective: { label:"HR", bg:"#FFF1F2", color:"#9F1239", border:"#FECDD3" },
};

function renderAdviceItem(item, i) {
  const diagnosis = item.currentDiagnosis || item.problemSummary || "";
  const action = item.action || item.actionSummary || "";
  const insight = item.mentorInsight || item.mentorLens || item.reason || item.I_insight || item.P_mentor || "";
  const hrPov = item.hrPerspective || item.HR_os || item.hrPov || item.recruiterPerspective || HR_PERSPECTIVE_LOOKUP.get(String(item.adviceId || "")) || HR_PERSPECTIVE_LOOKUP.get(adviceIdentity(item)) || fallbackHrPerspective(item);
  const fitType = item.mentorFitType || "";
  const rawTopicCluster = item.displayAdviceType || item.topicCluster || sectionLabel(item.targetSection);
  const topicCluster = /ATS\s*通用建议/i.test(String(rawTopicCluster)) ? "" : rawTopicCluster;
  const example = /^[（(]?\s*无具体示例\s*[）)]?$/i.test(String(item.example || "").trim()) ? "" : (item.example || "");
  const fitCfg = FIT_TYPE_CONFIG[fitType];
  const fitChip = fitCfg
    ? `<span style="display:inline-flex;align-items:center;font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;background:${fitCfg.bg};color:${fitCfg.color};border:1px solid ${fitCfg.border};">${fitCfg.label}</span>`
    : "";
  const evidenceChips = (item.evidence || []).length
    ? `<div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:7px;">${item.evidence.map(e => `<span style="font-size:11px;padding:2px 8px;border-radius:99px;background:#F3F4F6;color:#6B7280;border:1px solid #E5E7EB;">${escapeHtml(e)}</span>`).join("")}</div>`
    : "";
  const divider = i > 0
    ? `<div style="height:1px;background:linear-gradient(to right,transparent,rgba(0,0,0,0.07),transparent);margin:22px 0;"></div>`
    : "";

  return `${divider}
    <div style="margin-top:${i > 0 ? "0" : "4px"};">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap;">
        ${priorityBadge(item.priority)}
        ${topicCluster ? `<span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;background:#EEF2FF;color:#4338CA;border:1px solid #C7D2FE;">${escapeHtml(topicCluster)}</span>` : ""}
        ${fitChip}
      </div>
      <h4 style="margin:0 0 13px;font-size:15px;font-weight:700;color:#111827;line-height:1.4;"><span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#111827;color:#fff;font-size:11px;margin-right:8px;vertical-align:1px;">${i + 1}</span>${escapeHtml(item.title)}</h4>
      ${diagnosis ? `<div style="margin-bottom:11px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
          <span style="width:3px;height:14px;background:#D4A574;border-radius:2px;flex-shrink:0;"></span>
          <span style="font-size:11px;font-weight:700;color:#92400E;letter-spacing:.02em;">你的现状</span>
        </div>
        <p style="margin:0 0 0 9px;font-size:13px;line-height:1.65;color:#44403C;">${escapeHtml(diagnosis)}</p>
        ${evidenceChips ? `<div style="margin-left:9px;">${evidenceChips}</div>` : ""}
      </div>` : ""}
      ${action ? `<div style="background:#F6FEF9;border:1px solid #D1FAE5;border-radius:12px;padding:12px 14px;margin-bottom:10px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="width:18px;height:18px;border-radius:50%;background:#059669;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;font-size:9px;color:#fff;font-weight:700;">✓</span>
          <span style="font-size:11px;font-weight:700;color:#065F46;letter-spacing:.02em;">建议你先做</span>
        </div>
        <p style="margin:0;font-size:13px;line-height:1.65;color:#065F46;font-weight:600;">${escapeHtml(action)}</p>
      </div>` : ""}
      ${(insight || hrPov) ? `<div style="background:#FAFAF9;border:1px solid rgba(0,0,0,0.05);border-radius:10px;padding:11px 13px;margin-top:8px;">
        <div style="font-size:10.5px;font-weight:700;color:#9CA3AF;margin-bottom:8px;letter-spacing:.05em;text-transform:uppercase;">补充视角</div>
        ${insight ? `<div style="${hrPov ? "margin-bottom:8px;" : ""}"><span style="font-size:11px;font-weight:600;color:#6D28D9;background:#F5F3FF;padding:2px 7px;border-radius:99px;margin-right:6px;">导师</span><span style="font-size:12.5px;line-height:1.6;color:#374151;">${escapeHtml(insight)}</span></div>` : ""}
        ${hrPov ? `<div><span style="font-size:11px;font-weight:600;color:#B45309;background:#FFFBEB;padding:2px 7px;border-radius:99px;margin-right:6px;">HR</span><span style="font-size:12.5px;line-height:1.6;color:#374151;">${escapeHtml(hrPov)}</span></div>` : ""}
      </div>` : ""}
      ${example ? `<div class="advice-example" style="margin-top:10px;"><div class="advice-example-head"><div class="title"><span class="check">✓</span><span>改写示例</span></div><button class="copy-btn" onclick="copyMentorExample(this)" data-content='${escapeAttr(example)}'>📋 复制</button></div><div class="advice-example-body"><span style="font-size:13px;font-weight:500;line-height:1.6;font-family:var(--mono,monospace);">${escapeHtml(example)}</span></div></div>` : ""}
    </div>`;
}

const premiumMentors = s.premiumMentors;
const premiumAdviceItems = collectReportAdviceItems();
const mentorLogoPool = collectMentorLogoPool();
const legacyMentors = s.mentorAdvice;
if (mentorsSection) {
  const num = mentorsSection.querySelector(".section-num");
  if (num) {
    const legacyAdviceCount = (legacyMentors || []).reduce((sum, mentor) =>
      sum + ((mentor.adviceItems || mentor.adviceList || []).length), 0);
    const adviceCount = (premiumAdviceItems || []).length || legacyAdviceCount;
    num.textContent = adviceCount ? `04 · 完整 ${adviceCount} 条导师建议` : "04 · 完整导师建议";
  }
}
const mentorLogoIntroSlot = document.getElementById("mentorLogoIntroSlot");
if (mentorLogoIntroSlot) {
  mentorLogoIntroSlot.innerHTML = renderMentorLogoIntro(mentorLogoPool);
}
const mentorsListEl = document.getElementById("mentorsList");
if (mentorsListEl) {
  if (premiumAdviceItems && premiumAdviceItems.length > 0) {
    mentorsListEl.innerHTML = renderAdviceBundle(premiumAdviceItems, mentorLogoPool);
  } else if (legacyMentors && legacyMentors.length > 0) {
    mentorsListEl.innerHTML = legacyMentors.map((m,i)=>renderPremiumMentorCard(m,i)).join("");
  } else {
    mentorsListEl.innerHTML = `<p style="color:var(--ink-soft);font-size:14px;padding:16px 0;">导师建议加载失败，请返回首页重新提交简历。</p>`;
  }
}

// ── 5. PDF Export ──
function exportPDF(){
  if (!window.html2pdf) { alert("PDF 库未加载，请刷新重试"); return; }
  const btn = document.querySelector('.export-card .btn');
  const orig = btn ? btn.innerHTML : "";
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ 正在生成 PDF…'; }
  document.body.classList.add('exporting');
  const opt = {
    margin: [10, 8, 10, 8],
    filename: "MentorX-诊断报告-" + new Date().toISOString().slice(0,10) + ".pdf",
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#f6f3ec', windowWidth: 480 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'], avoid: '.section, .mentor-card-v2, .advice-example, .service-card' }
  };
  html2pdf().set(opt).from(document.querySelector('.page')).save()
    .then(() => { document.body.classList.remove('exporting'); if(btn){btn.disabled=false;btn.innerHTML=orig;} })
    .catch(err => { console.error(err); document.body.classList.remove('exporting'); if(btn){btn.disabled=false;btn.innerHTML=orig;} });
}
window.exportPDF = exportPDF;
