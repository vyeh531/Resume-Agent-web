// Store fallback（防止 app.js 還沒載入的 race condition）
const _S = window.Store || {
  get() { try { return JSON.parse(localStorage.getItem("resumeFixMVP") || "{}"); } catch { return {}; } }
};

if (typeof guardSubmitted === 'function') {
  guardSubmitted();
} else {
  if (!_S.get().resumeName) { window.location.href = "/"; }
}

const s = _S.get();
if (!s.atsResult) {
  window.location.href = s.resumeName ? "/login" : "/";
}
const atsResult = s.atsResult || {};
const mentorSections = document.querySelectorAll(".section");
if (mentorSections.length) {
  const freeNum = document.querySelector("#mentorFree")?.closest(".section")?.querySelector(".section-num");
  if (freeNum) freeNum.textContent = "免费试读 · 3 条建议";
  const lockedNum = document.querySelector("#lockedMentorsArea")?.closest(".section")?.querySelector(".section-num");
  if (lockedNum) lockedNum.textContent = "付费解锁 · 9 条深度建议";
}

// ── helpers ──────────────────────────────────────────────────────
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
function escapeHtml(str) {
  return String(str || "").replace(/[&<>"']/g, ch =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[ch])
  );
}
function escapeAttr(str) { return String(str).replace(/'/g,"&apos;").replace(/"/g,"&quot;"); }
function renderUnlockMiniCta(options = {}) {
  const showButton = options.showButton !== false;
  return `
    <div class="result-lock-cta">
      <div class="lock">🔒</div>
      <div class="text">解锁<b>全部 4 位导师</b> + <b>完整改写报告</b><br><span>含完整 JD Keyword 清单</span></div>
      ${showButton ? `<a class="result-lock-cta-button" href="/payment">解锁更多内容</a>` : ""}
    </div>`;
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
function getKeywordBreakdown() {
  return s.premiumKeywordBreakdown || atsResult.raw?.premiumKeywordBreakdown || atsResult.keywordBreakdown || atsResult.raw?.keywordBreakdown || [];
}
function getMissingKeywordChecklist() {
  return Array.isArray(s.missingKeywordChecklist) ? s.missingKeywordChecklist : [];
}
function uniqueList(items) {
  const seen = new Set();
  return (items || []).map((item) => String(item || "").trim()).filter(Boolean).filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function normalizeAtsListText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/\d+(?:\.\d+)?\s*%/g, "<pct>")
    .replace(/\d+/g, "<num>")
    .replace(/[，。、“”‘’：；（）()[\]{}<>"'`~!@#$%^&*_+=|\\/?.:,;\-\s]/g, "")
    .trim();
}
function atsListTopicKey(text) {
  const value = String(text || "");
  const lower = value.toLowerCase();
  const normalized = normalizeAtsListText(value);
  const has = (pattern) => pattern.test(value) || pattern.test(lower);
  // fine-grained keys checked first
  if (has(/\u628a.{0,10}(?:\u5173\u952e\u8bcd|\u6280\u80fd|\u539f\u8bcd).{0,15}(?:\u5199\u8fdb|\u653e\u8fdb|\u8fc1\u79fb|\u8865\u8fdb|\u52a0\u8fdb).{0,15}(?:\u7ecf\u5386|\u8981\u70b9|\u6280\u80fd\u680f|\u7b80\u4ecb)|\u628a.{0,6}\u6280\u80fd\u680f.{0,10}\u8fc1\u79fb|\u8865\u9f50.{0,20}(?:\u5c97\u4f4d)?\u5173\u952e\u8bcd|\u8fc1\u79fb.{0,8}\u7ecf\u5386\u8981\u70b9/i)) return "keyword-placement";
  if (has(/(?:\u6dfb\u52a0|\u5148\u5199|\u91cd\u5199|\u65b0\u589e|\u7f3a\u5c11).{0,6}\u4e2a\u4eba\u7b80\u4ecb|\u4e2a\u4eba\u7b80\u4ecb.{0,6}(?:\u6bb5\u843d|\u6dfb\u52a0|\u65b0\u589e|\u7f3a\u5931)|\u5148.{0,4}\u4e2a\u4eba\u7b80\u4ecb\u6bb5\u843d/i)) return "write-summary";
  if (has(/\u91cd\u6392.{0,8}\u7b80\u5386|\u6574\u4f53.{0,8}\u91cd\u65b0\u7ec4\u7ec7|\u56f4\u7ed5\u76ee\u6807\u5c97\u4f4d.{0,6}\u91cd\u65b0|\u4e3b\u7ebf\u4e0d\u591f\u6e05\u695a/i)) return "structure-reorganize";
  if (has(/\u7edf\u4e00.{0,10}(?:headline|\u4e2a\u4eba\u7b80\u4ecb|\u7ecf\u5386\u6807\u9898)|headline.{0,6}\u5c97\u4f4d|\u804c\u4f4d\u540d\u79f0.{0,6}\u4e00\u81f4|\u5c97\u4f4d\u540d\u79f0.{0,6}\u4e0d\u591f\u4e00\u81f4/i)) return "headline-consistency";
  if (has(/\u88ab\u52a8(?:\u8bed\u6001|\u53e5)|\u6539\u6210\u4e3b\u52a8|\u4e3b\u52a8\u8d21\u732e|\u91cd\u590d.{0,4}\u52a8\u4f5c\u52a8\u8bcd|\u52a8\u8bcd.{0,4}\u5c42\u6b21|\u66ff\u6362.{0,4}\u52a8\u8bcd/i)) return "verbs-passive";
  if (has(/\u5730\u70b9.{0,6}\u5de5\u4f5c\u6388\u6743|relocation|\u5de5\u4f5c\u6388\u6743|\u5230\u5c97\u65b9\u5f0f|work\s*authorization/i)) return "location-auth";
  if (has(/\u4e0d\u591f\u65b0|\u66f4\u65b0.{0,6}\u5f53\u524d\u72b6\u6001|\u7b80\u5386\u5185\u5bb9.{0,4}\u65b0|\u6700\u8fd1\u7ecf\u5386.{0,6}\u4e0d\u591f|\u66f4\u65b0.{0,20}(?:\u7ecf\u5386|\u9879\u76ee|\u65e5\u671f)/i)) return "recency";
  if (has(/\u534f\u4f5c|\u6c9f\u901a|\u9886\u5bfc\u529b|stakeholder|soft.{0,4}skill|\u8f6f\u6280\u80fd/i)) return "soft-skills";
  // broad buckets
  if (has(/summary|\u4e2a\u4eba\u7b80\u4ecb|\u5b9a\u4f4d|\u76ee\u6807\u5c97\u4f4d|\u539f\u8bcd|job\s*title|target\s*role/i)) return "positioning";
  if (has(/jd|keyword|\u5173\u952e\u8bcd|\u6280\u80fd|\u5de5\u5177|\u9886\u57df\u8bcd|\u5339\u914d|\u8986\u76d6|\u7f3a\u5931|\u8865\u9f50/i)) return "keywords";
  if (has(/\u91cf\u5316|\u6210\u679c|\u7ed3\u679c|\u5f71\u54cd|\u6548\u7387|\u767e\u5206\u6bd4|\u91d1\u989d|impact|result|measurable/i)) return "impact";
  if (has(/bullet|\u7ecf\u5386|\u8bc1\u636e|\u9879\u76ee|action\s*\+\s*method|\u52a8\u4f5c|\u65b9\u6cd5/i)) return "experience-evidence";
  if (has(/\u65f6\u95f4\u5012\u5e8f|chronolog|\u65e5\u671f|\u5e74\u4efd/i)) return "chronology";
  if (has(/\u4e2d\u56fd|\u7f8e\u56fd|\u975e\u76ee\u6807\u5e02\u573a|us-based|willing\s*to\s*relocate|relocat/i)) return "market-fit";
  if (has(/email|phone|linkedin|github|portfolio|\u8054\u7cfb|\u90ae\u7bb1|\u4f5c\u54c1\u96c6|\u94fe\u63a5/i)) return "profile-links";
  if (has(/\u683c\u5f0f|\u6587\u4ef6|format|file/i)) return "format";
  if (has(/intern|internship|\u5b9e\u4e60|\u65f6\u957f\u4e0d\u8db3|\u77ed\u671f/i)) return "tenure";
  if (has(/helped|assisted|responsible|led|built|optimized|\u52a8\u8bcd|\u4e3b\u52a8/i)) return "verbs";
  return normalized || lower.trim();
}
function dedupeAtsList(items, options = {}) {
  const { max = Infinity, topicDedupe = true } = options;
  const seenExact = new Set();
  const seenTopics = new Set();
  const output = [];
  for (const item of items || []) {
    const text = String(item || "").trim();
    if (!text) continue;
    const exactKey = normalizeAtsListText(text) || text.toLowerCase();
    const topicKey = atsListTopicKey(text);
    if (seenExact.has(exactKey)) continue;
    if (topicDedupe && seenTopics.has(topicKey)) continue;
    seenExact.add(exactKey);
    seenTopics.add(topicKey);
    output.push(text);
    if (output.length >= max) break;
  }
  return output;
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
function renderMentorLogoMarquee(pool) {
  const source = (pool && pool.length ? pool : STATIC_MENTOR_COMPANY_LOGOS);
  const logos = source.filter(item => item && item.companyLogo).slice(0, 80);
  if (!logos.length) return "";
  const chips = [...logos, ...logos].map(item => `
    <div class="mentor-logo-chip" title="${escapeAttr(item.company || "")}">
      <img src="${escapeAttr(item.companyLogo)}" alt="${escapeAttr(item.company || "")}">
    </div>
  `).join("");
  return `<div class="logo-marquee" aria-label="Mentor company logos"><div class="logo-marquee-track">${chips}</div></div>`;
}
function renderMentorLogoIntro() {
  return `
    <div class="mentor-logo-intro" id="mentorLogoIntro">
      <p class="mentor-logo-copy">由 MentorX 导师知识库中的真实大厂经验交叉匹配，系统会优先挑出最贴合你简历问题的建议。</p>
      ${renderMentorLogoMarquee(STATIC_MENTOR_COMPANY_LOGOS)}
    </div>`;
}
function renderPaywallMoreBlock(kind) {
  const rows = kind === "suggestions"
    ? ["更多优先修改动作", "分段改写路径", "可直接套用的优化方向"]
    : ["更多岗位匹配风险", "更多 ATS 细分问题", "完整问题优先级排序"];
  return `
    <li class="paywall-more" style="list-style:none;padding:0;margin:10px 0 0;">
      <div class="paywall-more-list">
        ${rows.map(row => `<div>${escapeHtml(row)}</div>`).join("")}
      </div>
      <div class="paywall-more-overlay">${renderUnlockMiniCta()}</div>
    </li>`;
}
function renderAtsPreviewMoreButton(kind) {
  return `
    <li class="ats-preview-more-item">
      <button type="button" class="ats-preview-more" data-ats-preview-more="${escapeAttr(kind)}">查看更多</button>
    </li>`;
}
function normalizeProblemListLegacy() {
  const raw = [
    ...(atsResult.keyProblems || []),
    ...(atsResult.problems || []),
    ...(atsResult.raw?.problems || []),
    ...((atsResult.topProblems || []).map(item => item.message || item.title).filter(Boolean)),
  ];
  const items = [...new Set(raw.filter(Boolean).map(repairTargetRoleProblem))].slice(0, 3);
  while (items.length < 3) items.push(["JD 关键词匹配仍有提升空间。", "简历定位需要更贴近目标岗位。", "经历证据需要更清楚支撑核心技能。"][items.length]);
  return items;
}
function isIrrelevantSuggestion(text) {
  return /(供应链|marketing analyst|SaaS|银行|制造|自动化|汽车行业|bank)/i.test(String(text || ""));
}
function isMlTargetRole() {
  return /\b(machine learning|mle|ml engineer|ai engineer)\b/i.test(getTargetJobTitle());
}
function isIrrelevantMlAdvice(item) {
  if (!isMlTargetRole()) return false;
  const text = [
    item?.title,
    item?.currentDiagnosis,
    item?.problemSummary,
    item?.action,
    item?.actionSummary,
    item?.mentorInsight,
    item?.hrPerspective,
    ...(item?.evidence || [])
  ].filter(Boolean).join(" ");
  return /\b(financial analyst|investment analyst|risk analyst|accounting|accountant|valuation|fp&a|financial reporting|会计|投资分析|金融公司)\b/i.test(text);
}
function buildRoleAwareSuggestions() {
  const job = getTargetJobTitle();
  if (!/\b(machine learning|mle|ml engineer|ai engineer)\b/i.test(job)) return [];
  const missing = [
    ...(atsResult.topMissingKw || []),
    ...(atsResult.topMissingKeywords || []),
    ...(atsResult.raw?.topMissingKw || []),
    ...(atsResult.raw?.topMissingKeywords || []),
  ].filter(Boolean).slice(0, 5);
  const kwText = missing.length ? `，优先补齐 ${missing.join("、")} 等 JD 高频词` : "";
  return [
    `把 Summary 第一行改成 Machine Learning Engineer 定位${kwText}。`,
    "在 Skills 中单独列出 ML 技术栈，例如 Python、PyTorch/TensorFlow、scikit-learn、model training、evaluation、data pipeline。",
    "把最相关的项目或经历改写成 MLE 证据链：数据规模、模型/特征方法、评估指标、上线或业务影响。"
  ];
}
function hasConfirmedMissingSummary() {
  const sources = [
    ...(atsResult.problemTags || []),
    ...(atsResult.raw?.problemTags || []),
    ...(atsResult.diagnosticObligations || []),
    ...(atsResult.raw?.diagnosticObligations || []),
  ];
  return sources.some((item) => {
    const tag = typeof item === "string" ? item : item?.tag || item?.id || item?.problemTag || "";
    return tag === "missing_summary";
  }) || atsResult.diagnostics?.searchability?.hasSummary === false || atsResult.raw?.diagnostics?.searchability?.hasSummary === false;
}
function isMostlyEnglishProblem(text = "") {
  const value = String(text || "").trim();
  if (!value) return false;
  const latin = (value.match(/[A-Za-z]/g) || []).length;
  const cjk = (value.match(/[\u4e00-\u9fff]/g) || []).length;
  return latin > 20 && cjk === 0;
}
function resultSummarySuggestionFallback() {
  return "添加个人简介段落：用 2-3 句话说明你的背景、核心技能和目标岗位，这是系统和招聘方第一眼读到的内容，也有助于提升关键词覆盖。";
}
function resultKeywordSuggestionFallback() {
  return "优先补齐岗位描述匹配缺口：只补真实经历能支撑的工具、领域词和动作词，分别放进技能栏和最相关的经历要点。";
}
function resultBulletSuggestionFallback() {
  return "将每段核心经历改成「动作 + 方法/工具 + 量化结果」结构，让系统和招聘方都能看到岗位证据。";
}
function resultSuggestionFallbacks() {
  return [
    ...(hasConfirmedMissingSummary() ? [resultSummarySuggestionFallback()] : []),
    resultKeywordSuggestionFallback(),
    resultBulletSuggestionFallback(),
    "调整开头定位和经历顺序，让目标岗位的主线更容易被读到。",
  ];
}
function simplifySuggestionText(text) {
  const value = String(text || "").trim();
  if (!value) return "";
  if (/Add a 2-3 line Summary section first/i.test(value)) return hasConfirmedMissingSummary() ? resultSummarySuggestionFallback() : "";
  if (/Prioritize missing role keywords/i.test(value)) return resultKeywordSuggestionFallback();
  if (/Rewrite top bullets/i.test(value)) return resultBulletSuggestionFallback();
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
    .replace(/bullet/g, "要点")
    .replace(/个人简介\s*\/\s*个人简介段落/g, "个人简介段落")
    .replace(/个人简介\s*\/\s*个人简介/g, "个人简介")
    .replace(/岗位描述\s+关键词/g, "岗位描述关键词")
    .replace(/要点\s+的/g, "要点的")
    .replace(/系统\s+和\s+招聘方/g, "系统和招聘方")
    .replace(/\s+(个人简介段落|个人简介)/g, "$1")
    .replace(/(系统和招聘方)\s+/g, "$1")
    .replace(/这是\s+系统和招聘方/g, "这是系统和招聘方")
    .replace(/([一-鿿＀-￯]) +([一-鿿＀-￯，。、：；！？])/g, "$1$2")
    .replace(/([一-鿿＀-￯，。、：；！？]) +([一-鿿＀-￯])/g, "$1$2");
}
function normalizeSuggestionListLegacy() {
  const raw = [
    ...buildRoleAwareSuggestions(),
    ...(atsResult.suggestions || []),
    ...(atsResult.raw?.suggestions || []),
  ].filter(text => text && !isIrrelevantSuggestion(text));
  const items = [...new Set(raw)].slice(0, 3);
  while (items.length < 3) items.push(["优先补齐目标岗位的核心关键词。", "把关键词写进经历要点的具体成果证据。", "调整个人简介，让岗位方向一眼可见。"][items.length]);
  return items;
}
function normalizeSuggestionList() {
  const fallbacks = resultSuggestionFallbacks();
  const raw = [
    ...(atsResult.suggestions || []),
    ...(atsResult.raw?.suggestions || []),
    ...fallbacks,
  ]
    .filter(text => text && !isIrrelevantSuggestion(text))
    .map(simplifySuggestionText)
    .filter(Boolean);
  const items = [];
  for (const item of raw) {
    if (isMostlyEnglishProblem(item)) continue;
    const nextItems = dedupeAtsList([...items, item], { max: 3 });
    if (nextItems.length > items.length) items.push(item);
    if (items.length === 3) break;
  }
  for (const item of fallbacks) {
    if (items.length === 3) break;
    const nextItems = dedupeAtsList([...items, item], { max: 3 });
    if (nextItems.length > items.length) items.push(item);
  }
  // 兜底：topic 去重后仍不足 3 条，放宽到精确去重确保显示 3 条
  for (const item of fallbacks) {
    if (items.length >= 3) break;
    if (!items.includes(item)) items.push(item);
  }
  return items.slice(0, 3);
}
function resultProblemFallbacks() {
  return [
    ...(hasConfirmedMissingSummary() ? ["简历缺少个人简介段落，岗位定位线索不够清晰。"] : []),
    "岗位描述关键词匹配仍有提升空间。",
    "经历中的量化结果偏少，建议补充百分比或规模数据。",
    "简历整体结构可以进一步围绕目标岗位强化。",
  ];
}
function normalizeProblemList() {
  const fallbacks = resultProblemFallbacks();
  const raw = [
    ...(atsResult.keyProblems || []),
    ...(atsResult.problems || []),
    ...(atsResult.raw?.problems || []),
    ...((atsResult.topProblems || []).map(item => item.message || item.title).filter(Boolean)),
  ]
    .map(repairTargetRoleProblem)
    .map(simplifySuggestionText)
    .filter(Boolean);
  const items = [];
  for (const item of raw) {
    if (isMostlyEnglishProblem(item)) continue;
    const nextItems = dedupeAtsList([...items, item], { max: 3 });
    if (nextItems.length > items.length) items.push(item);
    if (items.length === 3) break;
  }
  for (const item of fallbacks) {
    if (items.length === 3) break;
    const nextItems = dedupeAtsList([...items, item], { max: 3 });
    if (nextItems.length > items.length) items.push(item);
  }
  // 兜底：topic 去重后仍不足 3 条，放宽到精确去重确保显示 3 条
  for (const item of fallbacks) {
    if (items.length >= 3) break;
    if (!items.includes(item)) items.push(item);
  }
  return items.slice(0, 3);
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
    s.jdText,
    atsResult.jdText,
    atsResult.raw?.jdText,
    ...(atsResult.topMissingKw || []),
    ...(atsResult.raw?.topMissingKw || []),
  ].filter(Boolean).join(" ").toLowerCase();
}
function getAiTitleSignalText() {
  return [
    getTargetJobTitle(),
    s.jobTitle,
    atsResult.jobTitle,
    atsResult.raw?.jobTitle,
  ].filter(Boolean).join(" ").toLowerCase();
}

function aiFamilyProfile(level, caption, auto, value, resume) {
  return {
    level,
    caption,
    rows: [
      { k: "容易被自动化", v: auto.v, note: auto.note },
      { k: "更有价值的能力", v: value.v, note: value.note },
      { k: "简历应强化", v: resume.v, note: resume.note },
    ],
  };
}

const AI_FAMILY_RULES = [
  ["ai_engineer", /(^|\b)(ai|ai engineer|ai scientist|ai developer|artificial intelligence|generative ai|genai|llm|agent engineer|prompt engineer|ai\/ml|ai for drug|nlp engineer)(\b|$)/i],
  ["machine_learning", /\b(machine learning|ml engineer|mle|deep learning|deep reinforcement|computer vision|algorithm|autonomous driving|autonomy|robotic|robotics|path planning|signal processing|predictive modeler|computational imaging)\b/i],
  ["data_scientist", /\b(data scientist|statistician|biostatistician|decision scientist|applied scientist|research scientist)\b/i],
  ["data_engineer", /\b(data engineer|analytics engineering|data architect|etl|big data|data warehouse|data warehousing|database architect|database administrator|database engineer|database manager|data integration|database developer)\b/i],
  ["data_analyst", /\b(data analyst|data analytics|analytics manager|web analyst|data governance|data mining|data modeler|data strategist|data visualization|database analyst|technical data analysts|gis\/geospatial|geospatial analyst|business intelligence|bi analyst|reporting analyst|insights analyst|dashboard|sql|tableau|power bi)\b/i],
  ["business_analysis", /\b(business analyst|business analysis|business analytics manager|business strategist|corporate performance analyst|decision analyst|erp analyst|technical analyst|business systems|business process|applications analyst|salesforce analyst|systems analyst|management analyst)\b/i],
  ["accounting", /\b(accountant|accounting|audit|auditor|tax|controller|bookkeep|payroll|accounts payable|accounts receivable)\b/i],
  ["actuarial", /\b(actuarial|actuary)\b/i],
  ["trading_quant", /\b(quant|quantitative|trader|trading|desk quant|risk quant)\b/i],
  ["finance", /\b(finance|financial|investment|equity|banking|fp&a|fpa|treasury|credit|valuation|portfolio|wealth|fund|asset management|cost analyst|cost engineer|forecasting analyst|m&a|mergers and acquisitions|pe\/vc|pevc|venture capital|private equity|hedge fund|real estate analyst|risk analyst|risk management|risk manager|risk modeling|budget analyst|pricing analyst|pricing manager|economist)\b/i],
  ["cybersecurity", /\b(cyber|cybersecurity|computer security|security analyst|security engineer|information security|network security|penetration tester)\b/i],
  ["cloud_infrastructure", /\b(cloud|linux\/platform|wifi engineer|wi-fi engineer|solutions architect|system administrator|systems administrator|system engineer|systems architect|network administrator|network architect|network engineer|technical architect|systems engineer|platform engineer)\b/i],
  ["software_engineer", /\b(software|application engineer|backend|front[- ]?end|full[- ]?stack|sde|swe|developer|programmer|devops|mobile|android|ios|web developer|application developer|software tester|qa engineer|test engineer|embedded software)\b/i],
  ["hardware_electrical", /\b(hardware|electrical|electronic engineer|electronics|circuit|pcb|semiconductor|vlsi|analog|rf|fpga|asic|ic design|cmos|silicon|firmware|embedded engineer|embedded hardware|embedded system|rtl|verification|optical|thermal engineer)\b/i],
  ["mechanical_engineering", /\b(mechanical|cad\/cam|civil engineer|chemical engineer|control system|controls engineer|automation engineer|automotive|electric vehicle|energy analyst|maintenance engineer|material engineer|materials engineer|plant engineer|reliability engineer|safety engineer|value stream)\b/i],
  ["manufacturing_process", /\b(manufacturing|fabrication|failure analysis|material$|materials manager|process control|process engineer|production manager|production supervisor|production engineer|plant manager|production planner|semiconductor process|materials planner)\b/i],
  ["industrial_quality", /\b(industrial engineer|lean engineer|quality|test\/quality|continuous improvement|process improvement)\b/i],
  ["civil_construction", /\b(construction|urban planner|site manager|civil construction)\b/i],
  ["product_manager", /\b(product manager|product owner|product analyst|product operations|technical product manager|product marketing manager|product development engineer|product designer|product engineer)\b/i],
  ["project_program_management", /\b(project manager|project management|program manager|program coordinator|scrum master|delivery manager|implementation manager|engineering manager|project analyst|project coordinator|project planner|project engineer|technical program)\b/i],
  ["procurement", /\b(procurement|purchasing|vendor manager|sourcing)\b/i],
  ["supply_chain_logistics", /\b(logistics|inventory|warehouse|supply chain|distribution|demand planner|planning engineer|scheduling engineer|materials planner|shipping|receiving|dispatch|pickup)\b/i],
  ["operations", /\b(operation|operations|admin assistant|administrative|business manager|fundraising manager)\b/i],
  ["business_operations", /\b(management trainee|business manager|sport management|business operations)\b/i],
  ["consulting", /\b(consultant|consulting|strategy|advisory|management consultant|business consultant)\b/i],
  ["marketing", /\b(marketing|marketer|market research|brand|branding|growth|seo|sem|content|social media|advertising|campaign|digital strategist)\b/i],
  ["sales_customer_success", /\b(sales|account executive|account manager|business development|customer success|solution consultant|sales engineer)\b/i],
  ["communications_pr", /\b(communication|communications|public relations|pr specialist|technical writer)\b/i],
  ["ux_research_design", /\b(ux|ui|information architect|user experience|user interface|user researcher|interaction designer|web designer|technical designer)\b/i],
  ["design_creative", /\b(design|designer|artist|animator|illustrator|game|visual|creative|cinematography|film|video editor|storyboard|motion designer|producer|art management|hard surface|interactive installation)\b/i],
  ["legal_compliance", /\b(legal|lawyer|attorney|paralegal|compliance|counsel|law clerk|contract)\b/i],
  ["healthcare", /\b(health|healthcare|clinical|medical|patient|therapist|counselor|psychologist|nurse)\b/i],
  ["life_sciences", /\b(bio|biological engineer|bioinformatics|omics|biomedical|biopharma|pharma|pharmaceutical|life sciences|protein|vaccine|lab|clinical research)\b/i],
  ["hr_recruiting", /\b(human resources|people ops|recruiter|talent acquisition|hrbp|full-cycle recruiter)\b/i],
  ["education", /\b(teacher|tutor|academic|education|instructional|curriculum|instructor)\b/i],
  ["policy_public_sector", /\b(policy|political|public health|public sector|government|sustainability|esg|climate|environmental|community health)\b/i],
  ["journalism_media", /\b(journalist|media|writer|copywriter|editor|music production|video editor)\b/i],
  ["hospitality_events", /\b(hospitality|hotel|host|event planner|restaurant|tourism)\b/i],
  ["research_academic", /\b(research and development|research assistant|research associate|research engineer|research analyst|researcher|scientist|r&d)\b/i],
  ["social_services", /\b(social worker|psychologist|case manager|community services|counselor)\b/i],
  ["sustainability_environment", /\b(sustainability|environmental|esg|climate|csr|corporate social responsibility)\b/i],
  ["it_support", /\b(it support|technical support|help desk|service desk|it specialist|it analyst|it manager|information systems manager)\b/i],
];

const AI_HIGH_IMPACT_TITLE_OVERRIDES = [
  {
    patterns: /\b(admin assistant|administrative assistant|receptionist|office assistant|data entry|clerk)\b/i,
    profile: aiFamilyProfile("高影响", "日常事务会被工具接手",
      { v: "日程安排、邮件初稿、表格整理、提醒跟进", note: "排程、提醒和资料整理会更省力，但临时状况和优先级判断还是要靠人。" },
      { v: "优先级判断、保密意识、临时协调、服务体验", note: "行政岗位的亮点不只是快，而是分得清轻重缓急、守得住细节和边界。" },
      { v: "响应效率、流程优化、错误减少、团队支持", note: "不要只写日常协助，写清楚你让谁的工作变快、变准或更稳定。" }),
  },
  {
    patterns: /\b(it support|technical support|software support|help desk|service desk|support specialist|support engineer)\b/i,
    profile: aiFamilyProfile("高影响", "标准排查会被工具接手",
      { v: "FAQ、工单分类、基础故障排查", note: "标准问题会越来越自动化，但复杂故障和用户沟通仍然需要人。" },
      { v: "问题定位、用户沟通、升级协调、知识库优化", note: "技术支持要写出你怎么更快解决问题、减少重复问题。" },
      { v: "响应时间、解决率、用户满意度、知识库改进", note: "用 SLA、解决率或满意度来写会更具体。" }),
  },
  {
    patterns: /\b(data analyst|business intelligence analyst|bi analyst|web analyst|reporting analyst|report analyst|data visualization analyst|data mining analyst|database analyst|data entry analyst|documentation specialist)\b/i,
    profile: aiFamilyProfile("高影响", "基础报表会被工具接手",
      { v: "取数、报表初稿、固定指标解释", note: "固定报表会越来越快，真正拉开差距的是你能不能看出问题。" },
      { v: "指标判断、异常解释、业务沟通、流程改进", note: "不要只写产出报表，要写你怎么把数据变成下一步动作。" },
      { v: "报表自动化、错误率下降、决策支持、效率提升", note: "把报表工作写成改善结果，会比只写整理数据更有力。" }),
  },
  {
    patterns: /\b(social media specialist|copywriter|content writer|content creator|technical writer)\b/i,
    exclude: /\b(manager|strategist|strategy|lead|director|head)\b/i,
    profile: aiFamilyProfile("高影响", "基础内容生产会越来越工具化",
      { v: "文案初稿、标题变体、资料摘要、发布排程", note: "普通内容会更快生成，难的是判断受众、语气和转化方向。" },
      { v: "选题判断、品牌语气、事实核查、转化优化", note: "内容岗位要写出你怎么让内容有效，而不是只写负责发布。" },
      { v: "阅读量、转化、互动率、内容质量标准", note: "写出内容带来的结果，会比只列平台和工具更有说服力。" }),
  },
  {
    patterns: /\b(computer programmer|web developer|application developer|software tester|quality assurance tester|qa tester|junior software|entry[- ]level software)\b/i,
    exclude: /\b(architect|principal|staff|manager|lead|devops|security|cloud|embedded)\b/i,
    profile: aiFamilyProfile("高影响", "样板代码会被工具接手",
      { v: "样板代码、基础测试、简单 bug 修复", note: "基础实现会被明显提速，尤其是重复 CRUD、测试和小修小改。" },
      { v: "需求拆解、复杂调试、系统判断、上线质量", note: "SDE 更该把自己写成能判断和交付的人，而不是只会照需求写代码。" },
      { v: "复杂问题、性能/可靠性、业务影响、上线结果", note: "简历里要写工程取舍和结果，别只列语言和框架。" }),
  },
];

const AI_TITLE_IMPACT_OVERRIDES = [
  {
    patterns: /\b(social media manager|social media strategist|content strategist|digital strategist|brand manager|marketing manager|product manager|technical product manager|program manager|project manager|it manager|information systems manager|management consultant|strategy consultant)\b/i,
    profile: aiFamilyProfile("中等影响", "策略判断会更重要",
      { v: "资料整理、初稿生成、状态同步", note: "工具会帮你省掉很多整理时间，但策略和取舍还是要人来做。" },
      { v: "方向判断、优先级取舍、跨团队推动、结果负责", note: "这类 title 的重点不是产出多少材料，而是判断对不对、能不能推进。" },
      { v: "策略选择、指标变化、项目结果、团队协作", note: "简历里要写清楚你做了什么判断，以及结果有没有变好。" }),
  },
  {
    patterns: /\b(product analyst|analytics consultant|business analytics consultant|data consultant|insights analyst|corporate performance analyst)\b/i,
    profile: aiFamilyProfile("高影响", "基础分析会被工具接手",
      { v: "取数、分析初稿、固定指标解释", note: "基础分析会越来越快，真正拉开差距的是你能不能解释业务问题。" },
      { v: "指标判断、业务解释、实验分析、建议落地", note: "不要只写做分析，要写你怎么把分析变成决策或行动。" },
      { v: "业务洞察、指标提升、决策支持、自动化效率", note: "把分析工作写成结果，会比只写工具和图表更有力。" }),
  },
  ...AI_HIGH_IMPACT_TITLE_OVERRIDES,
];

const AI_FAMILY_PROFILES = {
  accounting: aiFamilyProfile("中等影响", "基础核对会越来越工具化",
    { v: "凭证整理、基础核对、报表初稿", note: "规则清楚的核对会更省时间，但异常解释和风险判断还是要靠人。" },
    { v: "异常解释、合规意识、业务理解、准确性", note: "会计/审计岗位更该写你怎么发现问题，而不是只写做账或对账。" },
    { v: "月结、审计发现、错误率下降、流程规范", note: "用准确率、周期缩短或审计发现来证明你的价值。" }),
  actuarial: aiFamilyProfile("中等影响", "模型初稿会帮你提速",
    { v: "基础测算、数据整理、模型版本对比", note: "工具能加快测算，但假设是否合理仍然需要专业判断。" },
    { v: "风险建模、假设选择、监管理解、结果解释", note: "精算岗位最该体现的是你如何解释风险，而不是只会套模型。" },
    { v: "模型准确性、风险评估、假设依据、业务影响", note: "写清楚你做了什么判断，以及这个判断影响了什么结果。" }),
  finance: aiFamilyProfile("中等影响", "基础分析会被工具接手",
    { v: "资料整理、财务模型初稿、市场摘要", note: "基础材料会更快，但投资判断和商业解释不会自动生成。" },
    { v: "估值判断、风险解释、业务建模、投资逻辑", note: "金融岗位要写出你为什么这么判断，而不是只说会建模。" },
    { v: "估值、预算、成本节省、投资建议采纳", note: "尽量把模型结论和业务动作连起来写。" }),
  trading_quant: aiFamilyProfile("中等影响", "回测与研究会更自动化",
    { v: "数据清洗、回测框架、策略初筛", note: "工具能加快研究节奏，但信号是否可靠仍然要人判断。" },
    { v: "风险控制、策略解释、市场直觉、稳健性验证", note: "量化岗位更看重你怎么证明策略不是偶然有效。" },
    { v: "收益风险、回撤、样本外验证、交易约束", note: "把策略表现和风险边界写清楚，会比只列模型更有力。" }),
  business_analysis: aiFamilyProfile("中等影响", "需求整理会被工具接手",
    { v: "会议纪要、流程图初稿、需求摘要", note: "整理工作会更快，但真正重要的是你有没有理解业务问题。" },
    { v: "问题拆解、流程诊断、系统沟通、需求取舍", note: "BA 的亮点在于把模糊问题讲清楚，并推动团队对齐。" },
    { v: "流程改善、需求落地、系统优化、效率提升", note: "写出你发现了什么卡点，以及最后流程怎么变好了。" }),
  business_operations: aiFamilyProfile("中等影响", "日常跟进会被工具接手",
    { v: "进度提醒、信息同步、运营汇总", note: "重复跟进会更省力，但跨团队推进和结果负责仍然很看人。" },
    { v: "资源协调、优先级判断、流程改进、执行落地", note: "运营岗位要写出你怎么把事情真正推进到结果。" },
    { v: "效率提升、周期缩短、错误减少、跨部门协作", note: "把日常运营写成具体改善，用户和 HR 都更容易看懂。" }),
  operations: aiFamilyProfile("中等影响", "重复事务会被工具接手",
    { v: "排程、资料整理、基础报表、提醒跟进", note: "工具会分担很多日常事务，但临场判断和协调还是关键。" },
    { v: "优先级判断、现场协调、流程优化、服务体验", note: "不要只写执行，要写你怎么让流程更顺、问题更少。" },
    { v: "响应效率、流程优化、成本降低、团队支持", note: "写清楚你让谁的工作变快、变准或更稳定。" }),
  consulting: aiFamilyProfile("低-中等影响", "资料整理会被工具接手",
    { v: "行业摘要、PPT 初稿、资料归纳", note: "材料会做得更快，但客户问题怎么拆，还是核心能力。" },
    { v: "结构化思考、商业判断、客户沟通、落地推动", note: "顾问价值不在页数，而在判断和影响力。" },
    { v: "分析框架、客户结果、建议采纳、项目影响", note: "写出你的建议如何被使用，比只写做了 deck 更强。" }),
  procurement: aiFamilyProfile("中等影响", "比价与跟踪会越来越工具化",
    { v: "供应商资料整理、报价比对、采购跟进", note: "工具能加快比价和追踪，但谈判和风险判断仍然靠人。" },
    { v: "供应商判断、成本谈判、风险识别、跨部门协调", note: "采购岗位的价值在于拿到更稳、更合适的方案。" },
    { v: "成本节省、交付稳定、供应商绩效、风险降低", note: "把节省金额、周期或供应稳定性写出来会更有说服力。" }),
  supply_chain_logistics: aiFamilyProfile("中等影响", "追踪与调度会越来越工具化",
    { v: "库存追踪、基础预测、运输/仓库数据整理", note: "报表、提醒和基础调度会更自动化，但现场异常和资源协调还是关键。" },
    { v: "供需判断、异常协调、成本与时效权衡", note: "越能把现场问题转成可执行的优化，越不容易被写成普通执行岗。" },
    { v: "库存优化、成本降低、时效提升、完结率提升", note: "最好写出你怎么让流程更准、更快或更省成本。" }),
  project_program_management: aiFamilyProfile("低-中等影响", "状态同步会被工具接手",
    { v: "进度更新、会议纪要、风险清单初稿", note: "工具能帮忙追状态，但项目卡住时还是要人来推动。" },
    { v: "优先级管理、风险升级、资源协调、交付判断", note: "项目管理的价值在于让复杂事情按时落地。" },
    { v: "按期交付、风险处理、跨团队协作、范围管理", note: "写清楚你解决过什么阻塞，以及项目因此怎么推进。" }),
  data_analyst: aiFamilyProfile("中等影响", "基础分析会被工具接手",
    { v: "取数、报表初稿、常规指标解释", note: "报表会越来越快，真正拉开差距的是你能不能看出问题。" },
    { v: "定义问题、选择指标、解释业务原因", note: "重点不是工具用得多快，而是你能不能把信息变成决策。" },
    { v: "指标体系、业务洞察、实验分析、决策影响", note: "别只写做图表，要写你发现了什么、推动了什么。" }),
  data_engineer: aiFamilyProfile("中等影响", "脚本和管道初稿会提速",
    { v: "样板 ETL、SQL 初稿、数据校验脚本", note: "工具能加快实现，但数据质量和系统稳定性仍然要人负责。" },
    { v: "数据建模、管道可靠性、质量治理、成本控制", note: "数据工程更该突出你怎么让数据稳定、可信、可复用。" },
    { v: "延迟降低、稳定性、数据质量、平台复用", note: "写出规模、稳定性和影响范围，会比只列工具更有力。" }),
  data_scientist: aiFamilyProfile("中等影响", "建模初稿会帮你提速",
    { v: "特征初筛、模型 baseline、结果摘要", note: "模型跑得更快了，但问题定义和结果解释还是关键。" },
    { v: "实验设计、因果判断、模型解释、业务落地", note: "DS 的价值在于把模型变成可信的业务判断。" },
    { v: "实验结果、模型效果、业务提升、方法选择", note: "写清楚为什么选这个方法，以及它解决了什么问题。" }),
  machine_learning: aiFamilyProfile("中等影响", "代码与实验会提速",
    { v: "训练脚本、模型 baseline、论文摘要", note: "工具能加快实验起步，但不会替你判断模型是否可靠。" },
    { v: "模型设计、误差分析、部署约束、数据判断", note: "MLE/ML 岗位更看重你怎么处理真实数据和工程限制。" },
    { v: "模型指标、部署效果、延迟/成本、泛化能力", note: "把模型效果和上线约束一起写，会更像真实项目。" }),
  ai_engineer: aiFamilyProfile("中等影响", "原型搭建会更快",
    { v: "prompt 初稿、agent demo、RAG 样板流程", note: "AI 工具会让原型更快，但稳定性和产品化仍然要人把关。" },
    { v: "系统设计、评估方法、安全边界、业务落地", note: "AI 岗位不要只写会调模型，要写你怎么让它可靠可用。" },
    { v: "评估指标、上线效果、成本控制、用户影响", note: "写清楚你怎么验证效果，而不是只展示 demo。" }),
  software_engineer: aiFamilyProfile("中等影响", "代码生成会帮你提速",
    { v: "样板代码、基础测试、简单 bug 修复", note: "简单实现会被提速，但需求拆解和上线质量还是关键。" },
    { v: "系统设计、复杂调试、性能与安全判断", note: "越能处理复杂系统和模糊需求，越能体现工程价值。" },
    { v: "架构选择、可靠性、性能指标、上线影响", note: "把项目写成工程决策和结果，不只是技术栈清单。" }),
  cloud_infrastructure: aiFamilyProfile("中等影响", "配置初稿会被工具接手",
    { v: "脚本模板、监控摘要、配置建议", note: "工具能帮忙写配置，但稳定性、成本和安全要有人负责。" },
    { v: "架构可靠性、故障排查、成本优化、安全意识", note: "基础设施岗位的亮点在系统稳定和问题恢复能力。" },
    { v: "可用性、恢复时间、成本节省、自动化覆盖", note: "用 uptime、恢复时间或成本指标来写会更有力量。" }),
  cybersecurity: aiFamilyProfile("中等影响", "告警初筛会更自动化",
    { v: "日志摘要、告警分流、漏洞资料整理", note: "工具能帮忙看更多信号，但风险优先级还是要人判断。" },
    { v: "威胁判断、事件响应、风险沟通、安全架构", note: "安全岗位最重要的是判断什么真的危险，以及怎么处理。" },
    { v: "风险降低、响应时间、漏洞修复、安全策略", note: "写出你降低了什么风险，会比只列工具更可信。" }),
  it_support: aiFamilyProfile("高影响", "标准排查会被工具接手",
    { v: "FAQ、工单分类、基础故障排查", note: "标准问题会越来越自动化，但复杂故障和用户沟通仍然需要人。" },
    { v: "问题定位、用户沟通、升级协调、知识库优化", note: "IT 支持要写出你怎么更快解决问题、减少重复问题。" },
    { v: "响应时间、解决率、用户满意度、知识库改进", note: "用 SLA、解决率或满意度来写会更具体。" }),
  hardware_electrical: aiFamilyProfile("低-中等影响", "设计辅助会提速",
    { v: "资料检索、仿真设置、测试记录整理", note: "工具能加快准备工作，但硬件判断和验证责任仍然很重。" },
    { v: "电路判断、验证计划、故障定位、跨团队协作", note: "硬件岗位更看重你怎么验证、排错和保证可靠性。" },
    { v: "性能指标、良率、验证结果、量产影响", note: "写出测试结果和工程约束，会比只列设计工具更强。" }),
  mechanical_engineering: aiFamilyProfile("低-中等影响", "设计与记录会提速",
    { v: "CAD 初稿、测试记录、资料整理", note: "工具能帮忙生成和整理，但现场约束和工程判断仍然关键。" },
    { v: "设计取舍、可靠性、安全、制造可行性", note: "机械岗位要写出你怎么在成本、性能和安全之间做取舍。" },
    { v: "性能改善、成本降低、可靠性、测试结果", note: "用工程指标写成果，会比只写参与设计更有说服力。" }),
  manufacturing_process: aiFamilyProfile("中等影响", "记录与监控会更自动化",
    { v: "生产记录、异常初筛、工艺数据监控", note: "系统能更快发现波动，真正重要的是你怎么定位原因。" },
    { v: "根因分析、工艺优化、现场判断、安全意识", note: "能把异常变成流程改善，会比只记录问题更有价值。" },
    { v: "良率提升、缺陷下降、停机减少、SOP 改进", note: "把改善前后写出来，让人看到你推动了解决。" }),
  industrial_quality: aiFamilyProfile("中等影响", "检测与记录会越来越工具化",
    { v: "质量记录、异常初筛、检测数据汇总", note: "检测记录会更快，但质量问题背后的原因仍需要人判断。" },
    { v: "根因分析、流程改善、质量体系、跨部门推动", note: "质量岗位的价值在于让问题不再重复发生。" },
    { v: "缺陷率下降、良率提升、返工减少、流程改善", note: "用质量指标写成果，会比只说负责 QA/QC 更强。" }),
  civil_construction: aiFamilyProfile("低-中等影响", "排程与文档会被工具接手",
    { v: "施工记录、排程提醒、材料文档整理", note: "文档和排程会更省力，但现场安全和协调还是靠人。" },
    { v: "现场判断、安全管理、供应商协调、进度控制", note: "施工/现场岗位最值钱的是稳住安全、进度和质量。" },
    { v: "按期交付、安全记录、成本控制、质量问题减少", note: "写出现场问题怎么被你解决，会比职责列表更有用。" }),
  product_manager: aiFamilyProfile("低-中等影响", "文档初稿会被工具接手",
    { v: "竞品摘要、PRD 初稿、用户反馈整理", note: "工具能帮忙起草，但产品判断和取舍不能外包。" },
    { v: "用户洞察、优先级判断、跨团队推动", note: "产品岗位的核心是定义问题、取舍资源、推动结果。" },
    { v: "需求判断、指标提升、实验结果、上线影响", note: "写出你为什么这么做，以及结果有没有变好。" }),
  marketing: aiFamilyProfile("中等影响", "内容初稿会越来越工具化",
    { v: "文案初稿、素材变体、基础复盘", note: "普通内容会更快生成，难的是判断受众和转化方向。" },
    { v: "受众判断、策略定位、渠道组合、转化优化", note: "市场岗位要写出你怎么让 campaign 真的有效。" },
    { v: "转化率、ROI、留存、品牌/内容影响", note: "别只写执行活动，要写指标和业务影响。" }),
  sales_customer_success: aiFamilyProfile("中等影响", "跟进和回复会被工具接手",
    { v: "线索研究、邮件初稿、CRM 更新、FAQ 回复", note: "标准沟通会更省力，但客户判断和推进节奏仍然很看人。" },
    { v: "客户判断、谈判推进、复杂问题处理、关系建立", note: "销售/客户成功的价值在信任、判断和结果推进。" },
    { v: "成交额、pipeline、续约、满意度、留存", note: "用转化、成交或续约结果来证明你的贡献。" }),
  communications_pr: aiFamilyProfile("中等影响", "初稿和摘要会越来越工具化",
    { v: "新闻稿初稿、资料摘要、传播素材变体", note: "工具能帮忙起草，但语气、风险和受众判断仍然重要。" },
    { v: "信息判断、品牌语气、危机沟通、利益相关方管理", note: "传播岗位最关键的是知道什么该说、怎么说、对谁说。" },
    { v: "传播效果、媒体覆盖、受众反馈、风险处理", note: "写出传播结果和影响范围，会比只写产出材料更强。" }),
  design_creative: aiFamilyProfile("中等影响", "草图与变体会越来越工具化",
    { v: "视觉变体、初稿生成、素材延展", note: "工具能帮你起步，但方向和审美判断还是你的价值。" },
    { v: "用户理解、审美判断、故事表达、落地协作", note: "设计/创意岗位要写出为什么这样做，以及结果是否有效。" },
    { v: "作品影响、用户问题、设计决策、效率或转化提升", note: "不要只放作品名，写清楚你的判断和贡献。" }),
  ux_research_design: aiFamilyProfile("低-中等影响", "整理和原型会提速",
    { v: "访谈摘要、原型初稿、可用性问题归纳", note: "工具能整理材料，但用户真正的问题还是要你判断。" },
    { v: "研究设计、洞察提炼、信息架构、跨团队推动", note: "UX 的价值在于把用户问题转成产品决策。" },
    { v: "研究方法、洞察影响、设计改进、指标变化", note: "写出你的洞察如何影响设计或业务结果。" }),
  legal_compliance: aiFamilyProfile("中等影响", "检索与初稿会越来越工具化",
    { v: "法规检索、合同初稿、条款比对", note: "标准文本处理会省时间，但风险判断不能只交给工具。" },
    { v: "风险判断、事实分析、谈判沟通、合规取舍", note: "法律/合规岗位要写出你怎么识别和降低风险。" },
    { v: "风险识别、合同审阅、流程合规、跨部门沟通", note: "不要只写审文件，写你发现并修正了什么问题。" }),
  healthcare: aiFamilyProfile("低-中等影响", "记录整理会被工具接手",
    { v: "记录整理、基础数据录入、资料摘要", note: "文档会更省力，但安全、准确性和责任边界不能含糊。" },
    { v: "专业判断、质量控制、患者/实验安全、跨团队协作", note: "涉及安全和专业责任时，人的判断仍然非常重要。" },
    { v: "准确率、SOP 遵循、质量改进、护理/研究结果", note: "写清楚你如何保证准确、安全和稳定。" }),
  life_sciences: aiFamilyProfile("低-中等影响", "文献与记录会提速",
    { v: "文献摘要、实验记录整理、基础数据录入", note: "工具能帮忙整理资料，但实验设计和结果解释仍要人负责。" },
    { v: "实验设计、方法选择、质量控制、结果解释", note: "生命科学岗位要体现严谨性和可验证的判断。" },
    { v: "实验方法、样本规模、发现结论、发表或应用影响", note: "把研究写成方法和结果，不只是实验任务。" }),
  hr_recruiting: aiFamilyProfile("中等影响", "筛选和排程会被工具接手",
    { v: "简历初筛、面试安排、候选人沟通模板", note: "流程会更自动化，但人才判断和候选人体验仍然靠人。" },
    { v: "人才判断、面试校准、雇主品牌、员工关系", note: "HR 的价值在判断、关系和组织理解。" },
    { v: "招聘转化、time-to-fill、留存、流程优化", note: "写出你怎么提高招聘效率或质量，会更具体。" }),
  education: aiFamilyProfile("中等影响", "备课与反馈会被工具接手",
    { v: "教案初稿、练习题生成、基础反馈", note: "材料会更容易准备，但学生状态和课堂判断还是要靠人。" },
    { v: "学生判断、课堂管理、学习设计、沟通陪伴", note: "教育岗位的价值在理解人和推动成长。" },
    { v: "学习成果、课程设计、学生支持、参与度提升", note: "把学生前后变化写出来，会比只写授课内容更有说服力。" }),
  research_academic: aiFamilyProfile("低-中等影响", "资料整理会被工具接手",
    { v: "文献摘要、数据清洗、实验记录整理", note: "准备工作会更快，但好问题和可靠方法仍然稀缺。" },
    { v: "问题定义、实验设计、方法选择、结果解释", note: "研究价值来自提出好问题和做出可靠判断。" },
    { v: "研究方法、样本规模、发现结论、发表或应用影响", note: "写清楚方法和结果，让别人看到研究质量。" }),
  policy_public_sector: aiFamilyProfile("中等影响", "材料整理会被工具接手",
    { v: "政策摘要、申请材料初稿、项目进度整理", note: "文档会更快，但政策理解和利益相关方沟通仍然关键。" },
    { v: "政策理解、项目落地、影响评估、公众沟通", note: "公共部门/政策岗位更看重协调和实际影响。" },
    { v: "服务人数、资金规模、项目结果、流程改进", note: "用影响范围和结果证明项目价值。" }),
  sustainability_environment: aiFamilyProfile("中等影响", "资料和报告会被工具接手",
    { v: "ESG 资料整理、政策摘要、基础报告初稿", note: "材料整理会更快，但环境判断和落地方案仍然需要人。" },
    { v: "数据解释、政策理解、项目推进、影响评估", note: "可持续岗位要把理念写成实际行动和可衡量结果。" },
    { v: "排放/成本改善、项目影响、合规进展、报告质量", note: "写出你推动了什么改变，而不是只写关注可持续。" }),
  social_services: aiFamilyProfile("低-中等影响", "记录和材料会被工具接手",
    { v: "个案记录、资源资料整理、沟通模板", note: "文档会更省力，但人的判断、陪伴和边界感替代不了。" },
    { v: "个案判断、危机处理、资源协调、信任建立", note: "社会服务岗位最重要的是处理复杂的人和真实情境。" },
    { v: "服务人数、个案进展、资源链接、干预结果", note: "写出你如何支持对象发生具体变化。" }),
  journalism_media: aiFamilyProfile("中等影响", "初稿与改写会越来越工具化",
    { v: "初稿生成、标题变体、资料摘要", note: "普通内容会更快，难的是选题判断、事实核查和观点。" },
    { v: "选题判断、采访能力、事实核查、独特表达", note: "媒体岗位真正稀缺的是判断、来源和表达。" },
    { v: "阅读量、转化、选题影响、内容质量标准", note: "少写抽象词，多写你做过什么，以及带来什么变化。" }),
  hospitality_events: aiFamilyProfile("中等影响", "预订与排班会越来越工具化",
    { v: "预订确认、排班提醒、标准客户回复", note: "重复流程会被工具优化，但现场服务和临时处理仍然靠人。" },
    { v: "现场服务、投诉处理、团队协调、体验设计", note: "服务岗位的价值在对人的理解和现场判断。" },
    { v: "满意度、复购、投诉解决、运营效率", note: "写出你怎么提升体验或让现场运转更顺。" }),
  other: aiFamilyProfile("待校准", "需要更明确的岗位信息",
    { v: "待判断", note: "岗位职责越具体，这里就能判断得越准。" },
    { v: "判断力、协作、结果负责", note: "先把最能体现判断和结果的经历写清楚。" },
    { v: "场景、动作、结果", note: "别硬塞关键词，先把真实贡献讲清楚。" }),
};

function matchAiFamilyProfile(text, titleText = "") {
  const normalized = String(text || "");
  const titleSignal = String(titleText || normalized);
  for (const override of AI_TITLE_IMPACT_OVERRIDES) {
    if (override.patterns.test(titleSignal) && !(override.exclude && override.exclude.test(titleSignal))) return override.profile;
  }
  for (const [family, re] of AI_FAMILY_RULES) {
    if (re.test(normalized)) return AI_FAMILY_PROFILES[family];
  }
  return null;
}

const AI_IMPACT_PROFILES = [
  {
    patterns: /(logistics_operations_support|logistics|operations support|pickup|dispatch|warehouse|delivery|parcel|fleet|shipping|receiving|揽收|调度|仓库|物流|快递|末端|运营支持|报告制作|成本控制)/i,
    level: "中等影响",
    caption: "重复任务会被自动化",
    rows: [
      { k:"容易被自动化", v:"重复报表、基础数据整理、标准流程提醒", note:"AI 会先压缩低判断、可模板化的日常工作。" },
      { k:"更有价值的能力", v:"异常判断、跨团队协同、流程优化、数据决策", note:"越能处理例外情况和协调现场资源，越不容易被工具替代。" },
      { k:"简历应强化", v:"数据发现问题、优化调度、降低成本、提升完结率", note:"把工作写成判断和改进，而不是只写执行任务。" },
    ],
  },
  {
    patterns: /(supply_chain_operations|supply chain|logistician|logistics analyst|operations analyst|transportation analyst|inventory|fulfillment|procurement|供应链|物流分析|库存|履约|采购)/i,
    level: "中等影响",
    caption: "预测与跟踪会更自动化",
    rows: [
      { k:"容易被自动化", v:"库存追踪、基础预测、供应商数据整理", note:"规则清楚、数据结构稳定的分析会越来越多由系统完成。" },
      { k:"更有价值的能力", v:"供需判断、异常协调、成本与时效权衡", note:"真正的价值在于理解业务约束，并推动跨团队决策。" },
      { k:"简历应强化", v:"优化库存、缩短周期、降低缺货或运输成本", note:"用结果证明你不只是跟踪流程，也能改善流程。" },
    ],
  },
  {
    patterns: /(data_analytics|data analyst|data analytics|business intelligence|bi analyst|sql|tableau|power bi|dashboard|数据分析|商业分析|报表|指标|仪表盘)/i,
    level: "中等影响",
    caption: "基础分析会被自动化",
    rows: [
      { k:"容易被自动化", v:"取数、报表初稿、常规指标解释", note:"AI 会降低基础分析和图表生成的门槛。" },
      { k:"更有价值的能力", v:"定义问题、选择指标、解释业务原因", note:"能把数据转成决策的人，会比只会做图表的人更有优势。" },
      { k:"简历应强化", v:"指标体系、业务洞察、实验分析、决策影响", note:"强调你如何发现问题、提出建议并影响业务结果。" },
    ],
  },
  {
    patterns: /(software_engineering|software_engineer|software engineer|software developer|frontend|backend|full stack|sde|web developer|developer|软件工程师|前端|后端|全栈|开发)/i,
    level: "中等影响",
    caption: "代码生成会提升效率",
    rows: [
      { k:"容易被自动化", v:"样板代码、基础测试、简单 bug 修复", note:"AI 会让常规实现更快，但不会替代完整工程判断。" },
      { k:"更有价值的能力", v:"系统设计、复杂调试、性能与安全判断", note:"越能处理模糊需求和复杂系统，越能体现不可替代性。" },
      { k:"简历应强化", v:"架构选择、规模指标、可靠性、上线影响", note:"把项目写成工程决策和业务结果，而不是技术栈清单。" },
    ],
  },
  {
    patterns: /(product_management|product manager|associate product manager|apm|product owner|growth product|roadmap|user story|产品经理|产品负责人|产品运营)/i,
    level: "低-中等影响",
    caption: "AI 更像效率工具",
    rows: [
      { k:"容易被自动化", v:"竞品摘要、PRD 初稿、用户反馈整理", note:"AI 会加快信息整理和文档初稿，但不能代替产品判断。" },
      { k:"更有价值的能力", v:"用户洞察、优先级判断、跨团队推动", note:"产品岗位的核心仍是定义问题、取舍资源、推动结果。" },
      { k:"简历应强化", v:"需求判断、指标提升、实验结果、上线影响", note:"突出你如何从用户和数据中做判断，并推动产品改进。" },
    ],
  },
  {
    patterns: /(marketing|growth|social media|smm|campaign|content marketing|seo|sem|brand|市场|营销|增长|社媒|内容运营|品牌|投放)/i,
    level: "中等影响",
    caption: "内容与投放初稿会自动化",
    rows: [
      { k:"容易被自动化", v:"文案初稿、素材变体、基础数据复盘", note:"AI 会显著提升内容生产和 campaign 分析效率。" },
      { k:"更有价值的能力", v:"受众判断、策略定位、渠道组合、转化优化", note:"能定义策略和解释增长原因的人更难被工具替代。" },
      { k:"简历应强化", v:"转化率、留存、ROI、campaign 结果", note:"不要只写执行活动，要写清楚策略、指标和业务影响。" },
    ],
  },
  {
    patterns: /(finance_accounting|financial analyst|finance|accounting|accountant|audit|tax|fp&a|valuation|会计|审计|财务|金融分析|估值|税务)/i,
    level: "中等影响",
    caption: "基础核对会更自动化",
    rows: [
      { k:"容易被自动化", v:"凭证整理、基础核对、报表初稿", note:"规则明确、重复性高的财务工作会被系统加速。" },
      { k:"更有价值的能力", v:"风险判断、异常解释、业务建模、合规意识", note:"岗位价值会更多体现在解释数字和判断风险上。" },
      { k:"简历应强化", v:"预算分析、成本节省、审计发现、模型准确性", note:"用具体数字证明你能支持决策，而不只是处理表格。" },
    ],
  },
  {
    patterns: /(business_operations|business operations|operations specialist|program coordinator|project coordinator|business analyst|运营专员|项目协调|业务运营|流程|项目管理)/i,
    level: "中等影响",
    caption: "流程跟进会被自动化",
    rows: [
      { k:"容易被自动化", v:"进度提醒、会议纪要、流程状态汇总", note:"AI 会减少重复协调和信息同步的时间。" },
      { k:"更有价值的能力", v:"流程设计、资源协调、问题升级、结果负责", note:"能推动复杂事项落地的人会更有优势。" },
      { k:"简历应强化", v:"缩短周期、提升效率、减少错误、跨部门协作", note:"把运营工作写成改进结果，而不是日常跟进。" },
    ],
  },
  {
    patterns: /(human_resources|human resources|hr specialist|recruiter|talent acquisition|people operations|人力资源|招聘|人才招聘|员工关系)/i,
    level: "中等影响",
    caption: "筛选与沟通会被自动化",
    rows: [
      { k:"容易被自动化", v:"简历初筛、面试安排、候选人沟通模板", note:"标准化招聘流程会越来越依赖自动化工具。" },
      { k:"更有价值的能力", v:"人才判断、面试校准、雇主品牌、员工关系", note:"HR 的核心价值会更偏向判断、关系和组织理解。" },
      { k:"简历应强化", v:"招聘转化、time-to-fill、留存、流程优化", note:"用指标说明你如何提高招聘或组织运营质量。" },
    ],
  },
  {
    patterns: /(customer_support|customer support|customer service|customer success|client success|support specialist|客服|客户支持|客户成功|售后|工单)/i,
    level: "高影响",
    caption: "标准回复会被自动化",
    rows: [
      { k:"容易被自动化", v:"FAQ 回复、工单分类、基础问题排查", note:"重复咨询和标准流程会优先被 AI 接管。" },
      { k:"更有价值的能力", v:"复杂问题判断、客户安抚、升级协调、续约洞察", note:"能处理高风险客户和复杂场景的人更有价值。" },
      { k:"简历应强化", v:"满意度、响应时效、升级解决率、留存贡献", note:"强调你如何解决复杂问题并改善客户体验。" },
    ],
  },
  {
    patterns: /(sales|account executive|business development|bd|partnership|revenue|客户经理|销售|商务拓展|渠道|合作伙伴)/i,
    level: "中等影响",
    caption: "线索整理会被自动化",
    rows: [
      { k:"容易被自动化", v:"线索研究、邮件初稿、CRM 更新", note:"AI 会提高销售准备和跟进效率。" },
      { k:"更有价值的能力", v:"客户判断、谈判推进、方案匹配、关系建立", note:"真实成交仍依赖信任、判断和复杂沟通。" },
      { k:"简历应强化", v:"pipeline、成交额、转化率、客户保留", note:"用数字展示你如何带来收入或关键客户进展。" },
    ],
  },
  {
    patterns: /(designer|ux|ui|product design|graphic design|creative|visual|figma|设计|视觉|交互|用户体验)/i,
    level: "中等影响",
    caption: "草图与变体会自动化",
    rows: [
      { k:"容易被自动化", v:"视觉变体、初稿生成、素材延展", note:"AI 会加快探索速度，但不会自动产生好判断。" },
      { k:"更有价值的能力", v:"用户理解、信息架构、审美判断、落地协作", note:"能把设计和业务目标连接起来的人更有优势。" },
      { k:"简历应强化", v:"用户问题、设计决策、转化或效率提升", note:"作品集和简历都要说明为什么这么设计，以及结果如何。" },
    ],
  },
  {
    patterns: /(consulting|consultant|strategy|management trainee|business strategy|咨询|顾问|战略|管培生)/i,
    level: "低-中等影响",
    caption: "研究整理会被自动化",
    rows: [
      { k:"容易被自动化", v:"资料整理、行业摘要、PPT 初稿", note:"AI 会减少基础研究和材料制作时间。" },
      { k:"更有价值的能力", v:"结构化思考、客户沟通、商业判断、落地推动", note:"顾问价值更多来自判断和影响力，而不是材料本身。" },
      { k:"简历应强化", v:"分析框架、客户结果、项目影响、建议采纳", note:"写清你如何拆解问题并推动决策。" },
    ],
  },
  {
    patterns: /(legal|paralegal|law clerk|compliance|contract|policy|律师|法务|合规|合同|法律助理|政策)/i,
    level: "中等影响",
    caption: "检索与初稿会自动化",
    rows: [
      { k:"容易被自动化", v:"法规检索、合同初稿、条款比对", note:"AI 会提升资料查找和标准文本处理效率。" },
      { k:"更有价值的能力", v:"风险判断、事实分析、谈判沟通、合规取舍", note:"法律相关岗位仍依赖专业判断和责任边界。" },
      { k:"简历应强化", v:"风险识别、合同审阅、流程合规、跨部门沟通", note:"突出你如何降低风险或提升合规效率。" },
    ],
  },
  {
    patterns: /(healthcare|clinical|medical|nurse|pharmacy|biotech|life science|lab|research associate|医疗|临床|护理|药房|生物|生命科学|实验室|医药)/i,
    level: "低-中等影响",
    caption: "记录整理会被自动化",
    rows: [
      { k:"容易被自动化", v:"记录整理、文献摘要、基础数据录入", note:"AI 会辅助文档和研究资料处理，但不能替代专业责任。" },
      { k:"更有价值的能力", v:"专业判断、质量控制、患者/实验安全、跨团队协作", note:"越涉及安全、伦理和专业判断，越需要人来负责。" },
      { k:"简历应强化", v:"SOP 遵循、准确率、质量改进、研究或护理结果", note:"用具体场景证明你的严谨性和专业贡献。" },
    ],
  },
  {
    patterns: /(education|teacher|tutor|academic advisor|student affairs|instructional|学校|教师|老师|助教|课程|学生事务|教育)/i,
    level: "中等影响",
    caption: "备课与反馈会被自动化",
    rows: [
      { k:"容易被自动化", v:"教案初稿、练习题生成、基础反馈", note:"AI 会降低内容准备和个性化材料制作成本。" },
      { k:"更有价值的能力", v:"学生判断、课堂管理、学习设计、沟通陪伴", note:"教育岗位的核心价值仍在理解人和推动成长。" },
      { k:"简历应强化", v:"学习成果、课程设计、学生支持、参与度提升", note:"强调你如何帮助学生达成可观察的进步。" },
    ],
  },
  {
    patterns: /(research|scientist|r&d|quantitative researcher|policy research|研究|科研|研发|调研|实验设计)/i,
    level: "低-中等影响",
    caption: "资料整理会被自动化",
    rows: [
      { k:"容易被自动化", v:"文献摘要、数据清洗、实验记录整理", note:"AI 会提升研究准备和资料处理速度。" },
      { k:"更有价值的能力", v:"问题定义、实验设计、方法选择、结果解释", note:"研究价值来自提出好问题和做出可靠判断。" },
      { k:"简历应强化", v:"研究方法、样本规模、发现结论、发表或应用影响", note:"把研究写成可验证的方法和结果。" },
    ],
  },
  {
    patterns: /(administrative|office assistant|executive assistant|coordinator|receptionist|行政|助理|前台|秘书|文员|办公室)/i,
    level: "高影响",
    caption: "日常事务会被自动化",
    rows: [
      { k:"容易被自动化", v:"日程安排、邮件初稿、表格整理、提醒跟进", note:"标准化事务会越来越多由工具完成。" },
      { k:"更有价值的能力", v:"优先级判断、现场协调、保密意识、服务体验", note:"能处理临时情况和复杂关系的人更有价值。" },
      { k:"简历应强化", v:"流程优化、响应效率、跨部门支持、错误减少", note:"证明你不只是执行，也能让团队运转更顺。" },
    ],
  },
  {
    patterns: /(manufacturing|production|quality|qa|qc|process engineer|industrial|工厂|制造|生产|质检|质量|工艺|工业工程)/i,
    level: "中等影响",
    caption: "检测与记录会更自动化",
    rows: [
      { k:"容易被自动化", v:"质量记录、异常初筛、生产数据监控", note:"标准检测和数据汇总会被系统持续增强。" },
      { k:"更有价值的能力", v:"现场判断、根因分析、工艺优化、安全意识", note:"真实产线问题仍需要经验和跨团队处理。" },
      { k:"简历应强化", v:"良率提升、缺陷下降、停机减少、SOP 改进", note:"用产线指标证明你的改进效果。" },
    ],
  },
  {
    patterns: /(facilities|maintenance|field technician|technician|construction|site manager|物业|设施|维修|技术员|施工|现场|安保)/i,
    level: "低-中等影响",
    caption: "排程与记录会自动化",
    rows: [
      { k:"容易被自动化", v:"工单分派、巡检记录、维护提醒", note:"AI 会让现场工作的信息流更自动化。" },
      { k:"更有价值的能力", v:"现场判断、安全处理、供应商协调、应急响应", note:"现场岗位的关键仍是及时判断和可靠执行。" },
      { k:"简历应强化", v:"响应时间、故障恢复、安全记录、成本节约", note:"突出你如何保障稳定运行和降低风险。" },
    ],
  },
  {
    patterns: /(government|public sector|nonprofit|ngo|program officer|community|政府|公共部门|公益|非营利|项目官员|社区)/i,
    level: "中等影响",
    caption: "材料整理会被自动化",
    rows: [
      { k:"容易被自动化", v:"资料汇总、申请材料初稿、项目进度整理", note:"AI 会提升文档和项目管理效率。" },
      { k:"更有价值的能力", v:"政策理解、利益相关方沟通、项目落地、影响评估", note:"公共与公益岗位更看重协调和实际影响。" },
      { k:"简历应强化", v:"服务人数、资金规模、项目结果、流程改进", note:"用影响范围和结果证明项目价值。" },
    ],
  },
  {
    patterns: /(real estate|property manager|leasing|mortgage|房地产|物业管理|租赁|房贷|地产)/i,
    level: "中等影响",
    caption: "资料与跟进会自动化",
    rows: [
      { k:"容易被自动化", v:"房源整理、客户跟进、合同资料初稿", note:"标准信息整理和沟通会更依赖自动化工具。" },
      { k:"更有价值的能力", v:"客户判断、谈判推进、风险识别、现场协调", note:"交易和服务仍依赖信任、判断和关系经营。" },
      { k:"简历应强化", v:"成交率、出租率、客户满意度、运营效率", note:"用业务指标证明你的服务和转化能力。" },
    ],
  },
  {
    patterns: /(hospitality|hotel|restaurant|event|tourism|front desk|酒店|餐饮|旅游|活动|会务|前厅)/i,
    level: "中等影响",
    caption: "预订与排班会自动化",
    rows: [
      { k:"容易被自动化", v:"预订确认、排班提醒、标准客户回复", note:"重复服务流程会被工具持续优化。" },
      { k:"更有价值的能力", v:"现场服务、投诉处理、团队协调、体验设计", note:"高质量服务仍来自对人的理解和现场判断。" },
      { k:"简历应强化", v:"满意度、复购、投诉解决、运营效率", note:"强调你如何提升体验或让现场运行更顺畅。" },
    ],
  },
  {
    patterns: /(journalist|editor|writer|content creator|copywriter|media|出版|编辑|记者|写作|文案|媒体|内容创作)/i,
    level: "中等影响",
    caption: "初稿与改写会自动化",
    rows: [
      { k:"容易被自动化", v:"初稿生成、标题变体、资料摘要", note:"AI 会加快文字生产，但也让普通内容更容易同质化。" },
      { k:"更有价值的能力", v:"选题判断、采访能力、事实核查、独特表达", note:"真正稀缺的是判断、来源和观点。" },
      { k:"简历应强化", v:"阅读量、转化、选题影响、内容质量标准", note:"突出你如何做出有影响力且可靠的内容。" },
    ],
  },
];
function matchAiImpactProfile(text) {
  return AI_IMPACT_PROFILES.find(profile => profile.patterns.test(text)) || null;
}

function humanizeAiImpactCaption(caption) {
  return String(caption || "")
    .replace(/会被自动化/g, "会被工具接手")
    .replace(/会更自动化/g, "会越来越工具化")
    .replace(/会自动化/g, "会越来越工具化")
    .replace(/AI 更像效率工具/g, "更像帮你提速的工具")
    .replace(/会提升效率/g, "会帮你提速");
}

function stablePick(items, seed) {
  if (!items.length) return "";
  const text = String(seed || "");
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return items[hash % items.length];
}

function detectAiImpactContext(trend) {
  const text = [
    trend?.caption,
    ...(trend?.rows || []).flatMap(row => [row.k, row.v, row.note]),
  ].filter(Boolean).join(" ");

  if (/(日程安排|邮件初稿|表格整理|提醒跟进|行政|office assistant|executive assistant|receptionist)/i.test(text)) return "admin";
  if (/(工单分派|巡检记录|维护提醒|故障恢复|设施|维修|field technician|maintenance|construction)/i.test(text)) return "field";
  if (/(质量记录|异常初筛|生产数据|良率|缺陷|停机|SOP|manufacturing|production|quality)/i.test(text)) return "manufacturing";
  if (/(房源|出租率|成交率|房贷|leasing|real estate|property)/i.test(text)) return "real_estate";
  if (/(法规检索|合同|条款|合规|legal|paralegal|compliance)/i.test(text)) return "legal";
  if (/(教案|练习题|学生|课堂|education|teacher|tutor)/i.test(text)) return "education";
  if (/(患者|实验|护理|临床|医疗|healthcare|clinical|lab)/i.test(text)) return "healthcare";
  if (/(代码|测试|bug|架构|software|developer|frontend|backend)/i.test(text)) return "software";
  if (/(视觉|设计|用户理解|Figma|designer|ux|ui)/i.test(text)) return "design";
  if (/(线索|CRM|成交|pipeline|sales|account executive)/i.test(text)) return "sales";
  if (/(FAQ|工单分类|客户安抚|续约|customer support|customer success)/i.test(text)) return "support";
  if (/(库存|供应商|供需|运输|supply chain|inventory|procurement)/i.test(text)) return "supply_chain";
  if (/(调度|仓库|揽收|物流|delivery|warehouse|dispatch|pickup)/i.test(text)) return "logistics";
  if (/(报表|数据|指标|dashboard|取数|analytics|business intelligence)/i.test(text)) return "data";
  return "general";
}

function contextSpecificAiImpactNote(context, rowKey, rowValue, seed) {
  const isAutomation = /容易被自动化/.test(rowKey);
  const isValue = /更有价值/.test(rowKey);
  const isResume = /简历/.test(rowKey);

  if (context === "admin") {
    if (isAutomation) return stablePick([
      "排程、提醒和资料整理会更省力，但临时状况和优先级判断还是要靠人。",
      "日常事务会被工具分担不少，真正要写的是你怎么让团队运转更顺。",
    ], seed);
    if (isValue) return stablePick([
      "行政岗位的亮点不只是快，而是分得清轻重缓急、守得住细节和边界。",
      "越能处理临时需求、保密信息和多人协调，越能体现你的价值。",
    ], seed);
    if (isResume) return stablePick([
      "把支持工作写成具体改善，比如节省时间、减少出错、让跨部门配合更顺。",
      "不要只写日常协助，写清楚你让谁的工作变快、变准或更稳定。",
    ], seed);
  }

  if (context === "field") {
    if (isAutomation) return stablePick([
      "派工和巡检记录会更自动化，但现场安全、临时判断和响应速度仍然很看人。",
      "工具能提醒和分派任务，真正关键的是你到现场后怎么判断和处理。",
    ], seed);
    if (isValue) return stablePick([
      "这类岗位最值钱的是现场判断、应急处理和把资源协调到位。",
      "现场问题很少完全照剧本走，能稳住安全和进度的人更有优势。",
    ], seed);
    if (isResume) return stablePick([
      "最好写出响应时间、故障恢复、安全记录或成本节约，这些比职责清单更有力。",
      "把经历写成你解决了什么现场问题，以及结果有没有更快、更稳、更安全。",
    ], seed);
  }

  if (context === "manufacturing") {
    if (isAutomation) return stablePick([
      "质量记录和数据监控会越来越自动化，但异常背后的原因还是需要人判断。",
      "系统能更快发现波动，真正重要的是你怎么定位原因、推动修正。",
    ], seed);
    if (isValue) return stablePick([
      "制造和质量岗位的价值在现场排查、根因分析和把改善落到流程里。",
      "能把异常变成可执行的工艺或流程改进，会比只记录问题更有说服力。",
    ], seed);
    if (isResume) return stablePick([
      "用良率、缺陷率、停机时间或 SOP 改善来写，会比单纯说负责质检更强。",
      "把改善前后写出来，让人看到你不是只发现问题，也推动了解决。",
    ], seed);
  }

  if (context === "real_estate") {
    if (isAutomation) return stablePick([
      "房源整理、跟进提醒和资料初稿会更省力，但客户判断和谈判节奏仍然靠人。",
      "工具能帮你整理信息，真正难的是判断客户需求、风险和成交时机。",
    ], seed);
    if (isValue) return stablePick([
      "这里更该写客户判断、谈判推进和风险识别，而不是只写维护房源。",
      "交易和租赁都很看信任与判断，能处理复杂客户场景会更有价值。",
    ], seed);
    if (isResume) return stablePick([
      "成交率、出租率、客户满意度和运营效率都可以写，越具体越可信。",
      "把你怎么推进交易、降低风险或改善服务体验写出来，会比泛泛描述更有效。",
    ], seed);
  }

  if (context === "legal") {
    if (isAutomation) return stablePick([
      "检索、比对和初稿会更快，但风险判断和责任边界不能只交给工具。",
      "标准文本处理会省时间，真正重要的是你怎么看事实、风险和取舍。",
    ], seed);
    if (isValue) return stablePick([
      "法律/合规相关岗位更该突出风险判断、事实分析和跨部门沟通。",
      "工具能帮忙找资料，但怎么解释、怎么把风险讲清楚，还是核心能力。",
    ], seed);
    if (isResume) return stablePick([
      "写清楚你处理过什么风险、合同或合规流程，以及最后降低了什么问题。",
      "不要只写审阅文件，最好写出你发现了什么风险、推动了什么修正。",
    ], seed);
  }

  if (context === "education") {
    if (isAutomation) return stablePick([
      "备课材料和练习题会更容易生成，但学生状态和课堂判断还是需要人。",
      "工具能帮忙准备内容，难的是让学生真的理解、跟上和进步。",
    ], seed);
    if (isValue) return stablePick([
      "教育岗位的亮点在观察学生、调整方法和持续沟通，不只是准备材料。",
      "越能根据学生情况调整教学，越能体现你的价值。",
    ], seed);
    if (isResume) return stablePick([
      "可以写学习成果、参与度、课程改进或学生支持结果，让贡献更具体。",
      "把学生前后变化写出来，会比只写授课内容更有说服力。",
    ], seed);
  }

  if (context === "healthcare") {
    if (isAutomation) return stablePick([
      "记录整理和资料摘要会更快，但安全、准确性和专业责任仍然不能含糊。",
      "工具能帮忙处理文档，真正关键的是你怎么守住质量和安全。",
    ], seed);
    if (isValue) return stablePick([
      "这里更该突出专业判断、质量控制和跨团队配合，而不是只写完成记录。",
      "涉及患者、实验或安全时，严谨和责任感本身就是很重要的竞争力。",
    ], seed);
    if (isResume) return stablePick([
      "用准确率、SOP 遵循、质量改进或研究/护理结果来证明你的专业度。",
      "写清楚你如何保证准确、安全和稳定，会比泛泛写职责更有用。",
    ], seed);
  }

  if (context === "logistics") {
    if (isAutomation) return stablePick([
      "报表、提醒和基础调度会更自动化，但现场异常和资源协调还是关键。",
      "工具能帮忙盯流程，真正值钱的是你怎么处理异常、调人调资源。",
    ], seed);
    if (isValue) return stablePick([
      "揽收、仓库和调度类岗位，最该写的是异常判断、跨团队配合和流程优化。",
      "越能把现场问题转成可执行的优化，越不容易被写成普通执行岗。",
    ], seed);
    if (isResume) return stablePick([
      "把数据发现问题、优化调度、降低成本或提升完结率写出来，会很有用。",
      "最好写出你怎么让揽收或配送更准、更快、更省成本。",
    ], seed);
  }

  return null;
}

function humanizeAiImpactNote(key, value, note, context = "general") {
  const rowKey = String(key || "");
  const rowValue = String(value || "");
  const seed = `${rowKey}|${rowValue}|${note || ""}`;
  const contextNote = contextSpecificAiImpactNote(context, rowKey, rowValue, seed);
  if (contextNote) return contextNote;

  if (/容易被自动化/.test(rowKey)) {
    if (/待判断/.test(rowValue)) return "如果岗位职责写得更具体，这里就能判断得更准。";
    if (/(报表|数据|指标|dashboard|分析|录入|表格|report|data|metric)/i.test(rowValue)) {
      return stablePick([
        "报表、整理和基础解释会越来越快，但真正拉开差距的是你能不能看出问题。",
        "这些任务工具会帮很多忙，所以简历里最好别只写“做报表”，要写你看出了什么。",
        "基础数据活会被压缩，能留下来的亮点是你怎么用数据推动下一步。",
      ], seed);
    }
    if (/(客户|客服|工单|回复|FAQ|续约|销售|线索|CRM|customer|sales|lead)/i.test(rowValue)) {
      return stablePick([
        "标准回复和跟进会更省力，但棘手客户、判断时机这些还是很看人。",
        "工具能处理一部分重复沟通，真正重要的是你怎么稳住客户、推进结果。",
        "可模板化的沟通会被加速，所以简历要多写复杂场景里的处理能力。",
      ], seed);
    }
    if (/(代码|测试|bug|系统|架构|software|code|test|debug)/i.test(rowValue)) {
      return stablePick([
        "样板代码会写得更快，但需求拆解、排查问题和上线质量还是关键。",
        "简单实现会被提速，简历里更该突出你处理复杂系统的经验。",
        "工具能省掉一部分重复开发时间，但不会替你承担工程取舍。",
      ], seed);
    }
    if (/(文案|初稿|PPT|素材|标题|摘要|PRD|设计|视觉|content|copy|design|draft)/i.test(rowValue)) {
      return stablePick([
        "初稿会越来越容易生成，难的是判断方向对不对、内容有没有用。",
        "工具能帮你起步，但最后能不能打动用户，还是看你的取舍和判断。",
        "普通版本会变得很快，简历里要写你怎么把初稿变成有效结果。",
      ], seed);
    }
    if (/(现场|巡检|维护|安全|生产|质量|工单|仓库|调度|dispatch|warehouse|field|quality)/i.test(rowValue)) {
      return stablePick([
        "记录和提醒会更自动化，但现场变化多，还是需要人做判断。",
        "工具能帮忙盯流程，真正值钱的是你处理异常和协调资源的能力。",
        "标准流程会更顺，但一到突发情况，经验和判断就会变得很重要。",
      ], seed);
    }
    return stablePick([
      "这些通常会先被工具接手，所以简历里别只停在日常执行。",
      "重复性高的部分会越来越省力，重点要放在你做了哪些判断和改进。",
      "这类工作会被提速，但不代表岗位没价值，关键是别把自己写成只会照流程做事。",
    ], seed);
  }
  if (/更有价值/.test(rowKey)) {
    if (/(数据|指标|业务|成本|风险|模型|finance|analytics|metric)/i.test(rowValue)) {
      return stablePick([
        "这里更该突出的是你怎么解释原因、做判断，而不是只会产出数字。",
        "能把数字翻成业务动作的人，会比只会整理数据更有竞争力。",
        "重点不是工具用得多快，而是你能不能把信息变成决策。",
      ], seed);
    }
    if (/(协调|跨团队|现场|异常|流程|资源|客户|沟通|stakeholder|coordination)/i.test(rowValue)) {
      return stablePick([
        "这些能力更难被工具替代，因为里面有判断、人和现场变量。",
        "越是需要协调人、处理例外、推动落地的部分，越值得写清楚。",
        "这类能力最好写成具体场景，让 HR 看到你不是只负责传话。",
      ], seed);
    }
    if (/(设计|产品|用户|策略|审美|内容|品牌|strategy|product|design)/i.test(rowValue)) {
      return stablePick([
        "真正有价值的是你怎么判断方向、做取舍，并让结果变好。",
        "工具能给选项，但选哪个、为什么选，还是需要你的判断。",
        "这部分适合写成“我发现了什么，所以做了什么，结果怎样”。",
      ], seed);
    }
    return stablePick([
      "更值得强调的是你怎么判断、怎么协调，以及怎么把事情往前推。",
      "这里不要只列能力词，最好写出你在哪个场景里用过它。",
      "能体现主动判断和结果负责的经历，会比单纯执行更有说服力。",
    ], seed);
  }
  if (/简历/.test(rowKey)) {
    if (/(成本|效率|完结率|转化率|满意度|响应|周期|错误率|ROI|accuracy|revenue)/i.test(rowValue)) {
      return stablePick([
        "能量化就尽量量化，让别人看到你不是只参与，而是真的带来改善。",
        "这类内容最好带数字，哪怕是区间，也会比空泛描述更有力。",
        "把结果写出来，例如省了多少时间、降低多少错误、提高多少转化。",
      ], seed);
    }
    if (/(判断|协调|流程|调度|客户|团队|风险|现场)/i.test(rowValue)) {
      return stablePick([
        "写成具体故事会更好：当时遇到什么问题，你怎么处理，最后改善了什么。",
        "不要只写“负责协调”，要写你协调了谁、解决了什么卡点。",
        "把职责改成结果导向，HR 会更容易看出你的岗位价值。",
      ], seed);
    }
    return stablePick([
      "写的时候尽量带上场景、动作和结果，让别人一眼看出你的贡献。",
      "少写抽象词，多写你真的做过什么，以及带来了什么变化。",
      "这一行不是让你硬塞关键词，而是提醒你把最相关的经历写清楚。",
    ], seed);
  }
  return note;
}

function humanizeAiImpactTrend(trend) {
  if (!trend || !Array.isArray(trend.rows)) return trend;
  const context = detectAiImpactContext(trend);
  return {
    ...trend,
    caption: humanizeAiImpactCaption(trend.caption),
    rows: trend.rows.map(row => ({
      ...row,
      note: humanizeAiImpactNote(row.k, row.v, row.note, context),
    })),
  };
}

function buildAiImpactTrend() {
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
  const familyProfile = matchAiFamilyProfile(text, getAiTitleSignalText());
  if (familyProfile) {
    return familyProfile;
  }
  const profile = matchAiImpactProfile(text);
  if (profile) {
    return {
      level: profile.level,
      caption: profile.caption,
      rows: profile.rows,
    };
  }
  const highAutomation = /(data entry|clerk|administrative|assistant|basic report|reporting|documentation|scheduling|客服|文员|行政|录入|基础报表|重复报表|数据整理|标准流程|报告制作)/i.test(text);
  const opsSignal = /(logistics|operations support|pickup|dispatch|warehouse|delivery|parcel|customer support|揽收|调度|仓库|物流|快递|客服|运营支持|报告制作|成本控制)/i.test(text);
  const judgmentSignal = /(strategy|manager|lead|principal|architect|research|consulting|stakeholder|cross-functional|onsite|现场|异常|协同|流程优化|数据决策|成本控制)/i.test(text);
  const techSignal = /(software|engineer|machine learning|ai engineer|data scientist|product manager|developer|软件|算法|产品经理)/i.test(text);

  if (opsSignal) {
    return {
      level: "中等影响",
      caption: "重复任务会被自动化",
      rows: [
        { k:"容易被自动化", v:"重复报表、基础数据整理、标准流程提醒", note:"AI 会先压缩低判断、可模板化的日常工作。" },
        { k:"更有价值的能力", v:"异常判断、跨团队协同、流程优化、数据决策", note:"越能处理例外情况和协调现场资源，越不容易被工具替代。" },
        { k:"简历应强化", v:"数据发现问题、优化调度、降低成本、提升完结率", note:"把工作写成判断和改进，而不是只写执行任务。" },
      ],
    };
  }
  if (highAutomation && !judgmentSignal) {
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
  if (judgmentSignal || techSignal) {
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

// ── 1. Student info ──────────────────────────────────────────────
(function setStudentInfo() {
  const text = s.resumeText || "";
  const el = document.getElementById("studentInfo");

  // 1. 找 EDUCATION 段落：停在下一個全大寫 section header（如 PROFESSIONAL EXPERIENCE）
  const eduMatch = text.match(
    /\bEDUCATION\b[^\n]*\n([\s\S]{0,2500}?)(?=\n[A-Z]{3}[A-Z\s&,/]{2,}\n|$)/
  );
  const eduText = eduMatch ? eduMatch[1] : text.slice(0, 2000);

  // 2. 直接找 "School... | ...– EndYear\nDegree" 格式的條目
  // 每個條目：含 University/College 的行 + " | " + 日期（包含結束年份）
  //           下一行是 degree 名
  const entryRE = /^(.+?(?:University|College|School|Institute)[^|\n]*)\|[^|\n]*?[-–]\s*(?:[A-Z][a-z]*\s+)?(\d{4})[^\n]*\n([^\n]+)/gm;

  const entries = [];
  let m;
  while ((m = entryRE.exec(eduText)) !== null) {
    // 學校名：去掉 "City, ST" 地址後綴
    let school = m[1]
      .replace(/\s+[A-Z][a-zA-Z.\s]*,\s*[A-Z]{2}\b.*$/, '')  // "New York, NY"
      .replace(/\s+[A-Z][a-z]+,\s*[A-Z]{2}.*$/, '')           // "Stillwater, OK"
      .replace(/^(?:[A-Z]{2,}\s+)+(?=[A-Z][a-z])/, '')        // "LINKEDIN EDUCATION" 前綴
      .trim();

    const endYear = parseInt(m[2]);

    // degree：取 " | " 之前、GPA 之前的部分
    let degree = m[3].split(/\s*\|\s*/)[0].replace(/\bGPA\b.*/i, '').trim();
    if (degree.length > 70) degree = degree.slice(0, 70);

    if (school && endYear) entries.push({ school, endYear, degree });
  }

  // 3. 取 endYear 最大的條目（最新學歷）
  if (!entries.length) {
    if (el) el.textContent = s.resumeName || "已上传简历";
    return;
  }
  const best = entries.reduce((a, b) => b.endYear > a.endYear ? b : a);

  const parts = [];
  if (best.endYear) parts.push(best.endYear + "届");
  if (best.school)  parts.push(best.school);
  if (best.degree)  parts.push(best.degree);
  if (el) el.textContent = parts.join(" · ");
})();

// 目标岗位 pill
const targetJobEl = document.getElementById("targetJob");
if (targetJobEl) {
  function isPlaceholderTitle(v) { return !v || /依\s*JD|自动识别|unknown|^目标岗位$/i.test(String(v)); }
  const job = getTargetJobTitle();
  targetJobEl.textContent = job ? "目标:" + job : "目标:根据 JD 分析";
}

// ── 2. 标题分数 & core issue ─────────────────────────────────────
const atsScore = atsResult.atsScore || 0;
const headlineScoreEl = document.getElementById("atsHeadlineScore");
if (headlineScoreEl) headlineScoreEl.textContent = atsScore;

const coreIssueEl = document.getElementById("coreIssue");
if (coreIssueEl) {
  const problems = normalizeProblemList();
  coreIssueEl.textContent = problems.length
    ? problems[0]
    : atsScore
      ? `ATS ${atsRiskText(atsResult.riskLevel)}（${atsScore}/100），请优先查看 ATS 诊断中的分项得分和修改建议。`
      : "";
}

// ── 3. 4 Tiles（用真實數據）─────────────────────────────────────
// ATS tile：直接用分數
const atsTileEl = document.getElementById("atsScore");
if (atsTileEl) atsTileEl.textContent = atsScore;

// JD match tile：wide JD keyword coverage
const jdMatchValue = formatJdKeywordMatchValue(atsResult);
const rankPctEl = document.getElementById("rankPct");
if (rankPctEl) rankPctEl.textContent = jdMatchValue;

// Salary：先顯示空，等 API
const salaryRangeEl = document.getElementById("salaryRange");
const salaryTopEl   = document.getElementById("salaryTop");
const headlineSalaryTopEl = document.getElementById("headlineSalaryTop");
if (salaryRangeEl) salaryRangeEl.textContent = "成长潜力";
if (salaryTopEl)   salaryTopEl.textContent   = "待校准";

// AI impact trend：local rule-based signal, no AI/API call
const compCountEl  = document.getElementById("compCount");
const admitRateEl  = document.getElementById("admitRate");
const aiTrend = humanizeAiImpactTrend(buildAiImpactTrend());
if (compCountEl) {
  compCountEl.textContent = aiTrend.level;
  compCountEl.classList.remove("ai-impact-low", "ai-impact-medium", "ai-impact-high", "ai-impact-pending");
  const levelText = String(aiTrend.level || "");
  const impactClass = /高/.test(levelText)
    ? "ai-impact-high"
    : /低/.test(levelText)
      ? "ai-impact-low"
      : /中/.test(levelText)
        ? "ai-impact-medium"
        : "ai-impact-pending";
  compCountEl.classList.add(impactClass);
}
if (admitRateEl)  admitRateEl.textContent  = aiTrend.caption;

// Detail rows
function renderRows(arr) {
  return (arr || []).map(r => `
    <div class="detail-card">
      <div class="detail-row"><span class="k">${escapeHtml(r.k)}</span><span class="v">${escapeHtml(r.v)}</span></div>
      <div class="detail-note">${escapeHtml(r.note)}</div>
    </div>
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

// ATS tile detail
const atsDetailEl = document.getElementById("atsDetail");
if (atsDetailEl && atsScore) {
  atsDetailEl.innerHTML = renderRows([
    { k:"ATS 总分", v: atsScore + "/100", note: atsRiskText(atsResult.riskLevel) },
    { k:"JD 关键词匹配", v: formatDisplayJdKeywordCount(), note:"已覆盖 / JD 关键词总数" },
    { k:"简历质量", v: (atsResult.dimensions?.C?.score ?? "--") + "/" + (atsResult.dimensions?.C?.max ?? 12), note:"内容质量与成果表达" },
  ]);
}
const atsRiskCaptionEl = document.getElementById("atsRiskCaption");
if (atsRiskCaptionEl) {
  const riskLabel = atsRiskText(atsResult.riskLevel);
  atsRiskCaptionEl.textContent = riskLabel;
  atsRiskCaptionEl.classList.remove("risk-high", "risk-medium", "risk-low", "risk-pending");
  atsRiskCaptionEl.classList.add(riskToneClass(riskLabel));
}

// JD match detail
const rankDetailEl = document.getElementById("rankDetail");
if (rankDetailEl) {
  rankDetailEl.innerHTML = renderRows([
    { k:"JD 关键词匹配", v: formatDisplayJdKeywordCount(), note:"已覆盖 / JD 关键词总数。" },
    { k:"整体覆盖率", v: formatJdKeywordMatchPercent(atsResult), note:"基于目标 JD 的关键词覆盖情况估算。" },
  ]) + renderStackedRows([
    { k:"主要缺口", v:"下方 JD Keyword 清单已整理关键词与放置建议。", note:"完整清单可付费解锁查看。" },
  ]);
}
const compDetailEl = document.getElementById("compDetail");
if (compDetailEl) compDetailEl.innerHTML = renderStackedRows(aiTrend.rows);

// ── 4. 薪资 & 竞争（同赛道成长 benchmark）────────────────────────────────
(function syncTileRowHeights() {
  const tiles = Array.from(document.querySelectorAll("#tilesArea .tile"));
  if (!tiles.length) return;

  function measureExpandedTileHeight(tile) {
    const rect = tile.getBoundingClientRect();
    const clone = tile.cloneNode(true);
    clone.open = true;
    clone.style.position = "absolute";
    clone.style.visibility = "hidden";
    clone.style.pointerEvents = "none";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = `${rect.width}px`;
    clone.style.minHeight = "";
    clone.style.height = "auto";
    document.body.appendChild(clone);
    const height = clone.offsetHeight;
    clone.remove();
    return height;
  }

  function measureClosedTileHeight(tile) {
    const rect = tile.getBoundingClientRect();
    const clone = tile.cloneNode(true);
    clone.open = false;
    clone.style.position = "absolute";
    clone.style.visibility = "hidden";
    clone.style.pointerEvents = "none";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.width = `${rect.width}px`;
    clone.style.minHeight = "";
    clone.style.height = "auto";
    document.body.appendChild(clone);
    const height = clone.offsetHeight;
    clone.remove();
    return height;
  }

  function updateAllRows() {
    tiles.forEach(tile => {
      tile.classList.remove("is-row-equal-height");
      tile.style.minHeight = "";
    });

    const closedBaseHeight = Math.max(...tiles.map(measureClosedTileHeight));
    tiles.forEach(tile => {
      if (!tile.open) tile.style.minHeight = `${closedBaseHeight}px`;
    });

    for (let i = 0; i < tiles.length; i += 2) {
      const pair = tiles.slice(i, i + 2);
      const rowHeight = Math.max(...pair.map(measureExpandedTileHeight));
      const openTiles = pair.filter(tile => tile.open);
      const targets = openTiles.length === pair.length ? pair : openTiles;
      targets.forEach(tile => {
        tile.classList.add("is-row-equal-height");
        tile.style.minHeight = `${rowHeight}px`;
      });
    }
  }

  tiles.forEach(tile => tile.addEventListener("toggle", updateAllRows));
  window.addEventListener("resize", updateAllRows);
  updateAllRows();
})();

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
(async function loadSalaryTrajectory() {
  const jobTitle = getTargetJobTitle() || s.jobTitle || atsResult.jobTitle || (atsResult.raw && atsResult.raw.jobTitle) || "";
  const jdText = getStoredJdText();
  const location = getStoredLocation();
  const resumeText = getStoredResumeText();
  const roleFamily = getSalaryRoleFamily();
  const targetRole = getSalaryTargetRole();
  const salaryDetailEl = document.getElementById("salaryDetail");
  const showSalaryFallback = () => {
    if (salaryRangeEl) salaryRangeEl.textContent = "待校准";
    if (salaryTopEl) salaryTopEl.textContent = "需补充";
    if (salaryDetailEl) salaryDetailEl.innerHTML = renderRows(salaryUnavailableRows());
  };
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
      if (salaryRangeEl) salaryRangeEl.textContent = "待校准";
      if (salaryTopEl) salaryTopEl.textContent = "需补充";
      if (salaryDetailEl) salaryDetailEl.innerHTML = renderRows(salaryUnavailableRows());
      return;
    }
    if (salaryRangeEl) salaryRangeEl.textContent = data.three_year_range;
    if (salaryTopEl) salaryTopEl.textContent = data.five_year_range;
    if (headlineSalaryTopEl) headlineSalaryTopEl.textContent = data.top_range || data.five_year_range;
    const rows = [];
    if (data.jd_salary) {
      rows.push({
        k:"JD 标注薪资",
        v:data.jd_salary,
        note:"这是 JD 中写明的薪资，不等同于长期成长上限。",
      });
    }
    rows.push(
      {
        k:"当前赛道参考",
        v:data.current_range || "待校准",
        note:formatSalaryBasisNote(data),
      },
      {
        k:"3 年成长区间",
        v:data.three_year_range,
        note:"若持续积累目标岗位相关经验和可验证成果，3 年内可参考这个区间。",
      },
      {
        k:"5 年成长区间",
        v:data.five_year_range,
        note:"代表同类岗位中经验更成熟、职责更完整时的市场参考。",
      },
      {
        k:"同赛道高分位",
        v:data.top_range || data.five_year_range,
        note:salarySourceDisplayNote(),
      }
    );
    if (salaryDetailEl) salaryDetailEl.innerHTML = renderRows(rows);
  } catch(e) {
    console.warn("[Salary]", e.message);
    showSalaryFallback();
  }
})();

// ── 5. Skills ────────────────────────────────────────────────────
const labelMap = {
  have: `<span class="pill pill-good"><span class="dot"></span>已具备</span>`,
  weak: `<span class="pill pill-warn"><span class="dot"></span>待补强</span>`
};
const KEYWORD_CATEGORY_CONFIG = {
  skill_tool: { label: "技能/工具", sourceKeys: ["core_skills", "tools"] },
  responsibility_scene: { label: "职责/场景", sourceKeys: ["action_verbs", "nice_to_have"] },
  domain_business: { label: "行业/业务词", sourceKeys: ["domain_keywords"] },
  soft_collab: { label: "软技能/协作词", sourceKeys: [] },
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
  if (/(title|岗位|职位|summary|定位|目标)/i.test(term) && !/(工具|系统|数据)/i.test(term)) {
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
    return { label: "按需放入", className: "keyword-use--reference" };
  }
  return { label: "按需放入", className: "keyword-use--reference" };
}
function keywordItemKey(item) {
  return String(item?.name || "").trim().toLowerCase();
}
function buildKeywordItems() {
  const items = [];
  const seen = new Set();
  const add = (name, status, sourceKey = "", sourceLabel = "", priority = 50) => {
    const clean = String(name || "").trim();
    if (!clean) return;
    const key = clean.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    const group = categoryGroupForTerm(clean, sourceKey, sourceLabel);
    const placement = placementForKeyword(clean, group, sourceKey);
    items.push({ name: clean, status, sourceKey, sourceLabel, group, placement, priority });
  };
  const checklist = getMissingKeywordChecklist();
  checklist.forEach((item, index) => {
    const term = item?.term || item;
    const where = String(item?.whereToAdd || "").toLowerCase();
    const sourceKey = /experience/.test(where) ? "action_verbs" : item?.category === "hard_skill" ? "core_skills" : "";
    add(term, "weak", sourceKey, "", index);
  });
  getKeywordBreakdown().forEach((cat, catIndex) => {
    const sourceKey = cat.key || "";
    const sourceLabel = cat.label || "";
    (cat.missing || []).forEach((term, index) => add(term, "weak", sourceKey, sourceLabel, catIndex * 20 + index));
    (cat.matched || []).forEach((term, index) => add(term, "have", sourceKey, sourceLabel, 100 + catIndex * 20 + index));
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
  return items.slice(0, 3);
}
function keywordTypeLabel(group) {
  const labels = {
    skill_tool: "工具",
    responsibility_scene: "职责",
    domain_business: "业务词",
    soft_collab: "协作",
  };
  return labels[group] || "关键词";
}
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
function getJdSkillDisplayCount(skills) {
  const have = skills.filter(sk => sk.status === "have").length;
  const total = skills.length;
  return { have, total, weak: Math.max(total - have, 0) };
}
function getDisplayJdKeywordCount() {
  const items = buildKeywordItems();
  if (items.length) return getJdSkillDisplayCount(items);
  const jdCount = getJdKeywordCount(atsResult);
  if (jdCount) return { have: jdCount.matched, total: jdCount.total, weak: Math.max(jdCount.total - jdCount.matched, 0) };
  return { have: 0, total: 0, weak: 0 };
}
function formatDisplayJdKeywordCount() {
  const count = getDisplayJdKeywordCount();
  return count.total ? `${count.have}/${count.total}` : "--";
}
function renderSkillSection(skills) {
  const visibleCount = Math.min(skills.length, 3);
  const visibleSkills = skills.slice(0, visibleCount);
  const hiddenSkills = skills.slice(visibleCount);
  const paywallPreviewCount = Math.max(0, 10 - visibleCount);
  const paywallPreviewSkills = hiddenSkills.slice(0, paywallPreviewCount);
  const counts = getJdSkillDisplayCount(skills);
  const lockedKeywordCount = Math.max(0, counts.total - visibleSkills.length - paywallPreviewSkills.length);
  const have  = counts.have;
  const weak  = counts.weak;
  const total = counts.total;
  const skillHaveEl    = document.getElementById("skillHave");
  const skillTotalEl   = document.getElementById("skillTotal");
  const skillSummaryEl = document.getElementById("skillSummary");
  const skillListTop3El    = document.getElementById("skillListTop3");
  const skillPaywallListEl = document.getElementById("skillPaywallList");
  const expandBtn = document.getElementById("skillExpandToggle");
  if (skillHaveEl)   skillHaveEl.textContent  = have;
  if (skillTotalEl)  skillTotalEl.textContent = total;
  if (skillSummaryEl) skillSummaryEl.innerHTML = `
    <span class="skill-have" style="flex:${have}"></span>
    <span class="skill-weak" style="flex:${Math.max(weak, 1)}"></span>`;
  if (skillListTop3El)    skillListTop3El.innerHTML    = visibleSkills.map(renderSkillRow).join("");
  if (skillPaywallListEl) {
    skillPaywallListEl.innerHTML = paywallPreviewSkills
      .map((sk, i) => ({ ...sk, priority: visibleCount + i + 1 }))
      .map(renderSkillRow)
      .join("");
  }
  const paywallTextEl = document.querySelector("#skillPaywall .skill-paywall-overlay .text");
  if (paywallTextEl) {
    paywallTextEl.innerHTML = lockedKeywordCount > 0
      ? `还有 <b style="color:var(--jade)">${lockedKeywordCount}</b> 个 keyword 等你解锁加强简历竞争力<br/><span style="color:var(--ink-soft);font-weight:500">包含关键词放置建议和完整改写报告</span>`
      : `完整 JD Keyword 清单会随下方完整诊断一起解锁<br/><span style="color:var(--ink-soft);font-weight:500">包含关键词放置建议和改写报告</span>`;
  }
  if (expandBtn && hiddenSkills.length) {
    expandBtn.hidden = false;
    expandBtn.innerHTML = "查看更多 ↓";
  } else if (expandBtn) {
    expandBtn.hidden = true;
  }
}
(async function loadSkills() {
  const keywordItems = buildKeywordItems();
  const previewItems = primaryKeywordItems(keywordItems).map(function(sk, i) {
    return { ...sk, priority: i + 1 };
  });
  const sectionTitleEl = document.getElementById("skillSectionTitle");
  const sectionDescEl = document.getElementById("skillSectionDesc");
  if (sectionTitleEl) sectionTitleEl.textContent = "JD Keyword 清单";
  if (sectionDescEl) {
    sectionDescEl.textContent = "这些是系统从 JD 中识别出的关键词。优先把待补强项写进 Summary、Skills 或 Experience。";
  }
  if (previewItems.length === 0 && !getJdKeywordCount(atsResult)) return;
  renderSkillSection(keywordItems.map(function(sk, i) {
    return { ...sk, priority: i + 1 };
  }));
})();

// Toggle paywall
const expandBtn = document.getElementById("skillExpandToggle");
const paywallEl = document.getElementById("skillPaywall");
if (expandBtn && paywallEl) {
  let open = false;
  expandBtn.addEventListener("click", () => {
    open = !open;
    paywallEl.hidden = !open;
    expandBtn.innerHTML = open ? "收起 ↑" : "查看更多 ↓";
  });
}

// ── 6. Mentor 渲染 ────────────────────────────────────────────────
function formatAdvice(text) {
  if (!text) return "";
  const parts = String(text).split(/(?=\(\d+\))/);
  if (parts.length <= 1) return escapeHtml(text);
  return parts.map(p => p.trim()).filter(Boolean)
    .map(p => `<div style="margin-bottom:5px;">${escapeHtml(p)}</div>`)
    .join("");
}
function copyExample(btn) {
  const raw = btn.getAttribute("data-content").replace(/&apos;/g,"'").replace(/&quot;/g,'"');
  if (navigator.clipboard) navigator.clipboard.writeText(raw).then(
    () => { btn.innerHTML = "✓ 已复制"; setTimeout(() => btn.innerHTML = "📋 复制", 2000); }
  );
}
window.copyExample = copyExample;

function sectionLabel(sec) {
  return { summary:"Summary", skills:"Skills", experience:"Experience", projects:"Projects", education:"Education", overall:"Overall" }[sec] || "Overall";
}
function priorityBadge(p) {
  const lv = (p === "high" || p === "critical" || p === "P0") ? "high"
           : (p === "medium" || p === "P1") ? "medium" : "low";
  const cfg = {
    high:   { dot:"#DC2626", bg:"#FFF1F1", color:"#991B1B", border:"#FCA5A5", label:"必改" },
    medium: { dot:"#EA580C", bg:"#FFF7ED", color:"#9A3412", border:"#FDBA74", label:"建议改" },
    low:    { dot:"#8B82A8", bg:"#F7F3FC", color:"#5F567A", border:"#E6DEF2", label:"补充" },
  };
  const c = cfg[lv] || cfg.medium;
  return `<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;background:${c.bg};color:${c.color};border:1px solid ${c.border};letter-spacing:.01em;"><span style="width:5px;height:5px;border-radius:50%;background:${c.dot};flex-shrink:0;"></span>${c.label}</span>`;
}

const FIT_TYPE_CONFIG = {
  same_role:                { label:"同职位导师",  bg:"#F0E8FA", color:"#5333A6", border:"#E6DEF2" },
  same_industry:            { label:"同产业导师",  bg:"#F0FDF4", color:"#15803D", border:"#BBF7D0" },
  same_function:            { label:"同职能导师",  bg:"#F0FDF4", color:"#166534", border:"#BBF7D0" },
  cross_domain_high_relevance: { label:"跨领域高相关", bg:"#FFF7ED", color:"#92400E", border:"#FDE68A" },
  ats_universal:            { label:"ATS 通用建议", bg:"#F5F3FF", color:"#5B21B6", border:"#DDD6FE" },
  recruiter_perspective:    { label:"HR",          bg:"#FFF1F2", color:"#9F1239", border:"#FECDD3" },
};

function resultAdviceIdentity(item) {
  return String(item?.adviceId || item?.id || `${item?.title || ""}|${item?.action || item?.actionSummary || ""}`).trim();
}
function collectResultHrPerspectiveLookup() {
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
    [item.adviceId, item.id, resultAdviceIdentity(item)].filter(Boolean).forEach((key) => {
      if (!lookup.has(String(key))) lookup.set(String(key), hr);
    });
  });
  return lookup;
}
const HR_PERSPECTIVE_LOOKUP = collectResultHrPerspectiveLookup();
function truncateAtSentence(value = "", maxLength = 120) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text || text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const sentenceEnd = Math.max(
    slice.lastIndexOf("。"), slice.lastIndexOf("！"), slice.lastIndexOf("？"),
    slice.lastIndexOf("."), slice.lastIndexOf("!"), slice.lastIndexOf("?")
  );
  if (sentenceEnd >= 24) return slice.slice(0, sentenceEnd + 1).trim();
  const commaEnd = Math.max(slice.lastIndexOf("，"), slice.lastIndexOf(","), slice.lastIndexOf("；"), slice.lastIndexOf(";"));
  if (commaEnd >= 28) return slice.slice(0, commaEnd).trim() + "。";
  return slice.replace(/[，,；;：:\s]+$/g, "").trim() + "。";
}
function fallbackHrPerspective(item = {}) {
  const tags = item.relatedProblemTags || [];
  if (tags.includes("missing_summary")) {
    return "HR 会先看简历开头是否说明投递方向；缺少 Summary 时，后面的技能和经历更容易被读散。";
  }
  if (tags.some(tag => /education|coursework|gpa/.test(tag))) {
    return "HR 会把教育背景当作 junior 候选人的快速筛选信号；相关课程和训练需要完整、靠前、可识别。";
  }
  if (tags.some(tag => /keyword|jd|hard_skill/.test(tag))) {
    return "HR 会用 JD 技能词快速确认候选人是否匹配；关键词缺少经历证据时，可信度会下降。";
  }
  const action = truncateAtSentence(item.action || item.actionSummary || item.title || "这条修改建议", 64);
  return `HR 会把这里当作快速筛选信号；建议优先处理「${action.replace(/[。.!?！？]$/g, "")}」。`;
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
  const text = [item.title, item.action, item.actionSummary, item.currentDiagnosis, item.problemSummary].filter(Boolean).join(" ");
  const talksAboutSummaryKeyword = /summary/i.test(text) && /岗位原词|目标岗位原词|exact (?:target )?(?:job )?title|target title|job title|keyword|关键词/i.test(text);
  if (!tags.includes("missing_summary") && !(hasMissingSummarySignal() && talksAboutSummaryKeyword)) return item;
  const targetRole = s.jobTitle || atsResult.jobTitle || atsResult.profile?.targetRole || atsResult.raw?.jobTitle || "目标岗位";
  const action = `新增 2-3 行 Summary：第一句写目标岗位 ${targetRole}，第二句连接你最相关的经历、技能和可量化成果；先把段落搭起来，再补具体关键词。`;
  return {
    ...item,
    title: "先补上 Summary 段落",
    currentDiagnosis: "原简历目前缺少 Summary 段落；需要先有一个岗位定位入口，再谈把 JD 关键词放进 Summary。",
    problemSummary: "原简历目前缺少 Summary 段落；需要先有一个岗位定位入口，再谈把 JD 关键词放进 Summary。",
    action,
    actionSummary: action,
    mentorLens: "没有 Summary 时，简历开头缺少岗位定位入口；先搭出这一段，后续目标岗位原词和 JD 关键词才有自然承载位置。",
    hrPerspective: "HR 会先看简历开头是否说明投递方向；缺少 Summary 时，后面的技能和经历更容易被读散。",
    relatedProblemTags: [...new Set(["missing_summary", ...tags.filter((tag) => tag !== "missing_exact_job_title")])],
    canonicalActionFamily: "summary_creation",
    targetSection: "summary",
  };
}

function renderApiAdviceItem(item, i) {
  item = normalizeMissingSummaryAdviceItem(item);
  const diagnosis   = item.currentDiagnosis || item.problemSummary || "";
  const action      = item.action || item.actionSummary || "";
  const insight     = item.mentorInsight || item.mentorLens || item.reason || item.I_insight || item.P_mentor || "";
  const hrPov       = truncateAtSentence(item.hrPerspective || item.HR_os || item.hrPov || item.recruiterPerspective || HR_PERSPECTIVE_LOOKUP.get(String(item.adviceId || "")) || HR_PERSPECTIVE_LOOKUP.get(resultAdviceIdentity(item)) || fallbackHrPerspective(item), 150);
  const matchReason = item.matchReason || "";
  const fitType     = item.mentorFitType || "";
  const topicCluster = item.displayAdviceType || item.topicCluster || sectionLabel(item.targetSection);

  const fitCfg = FIT_TYPE_CONFIG[fitType];
  const fitChip = fitCfg
    ? `<span style="display:inline-flex;align-items:center;font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;background:${fitCfg.bg};color:${fitCfg.color};border:1px solid ${fitCfg.border};">${fitCfg.label}</span>` : "";

  const divider = i > 0
    ? `<div style="height:1px;background:linear-gradient(to right,transparent,rgba(69,42,147,.10),transparent);margin:22px 0;"></div>` : "";

  return `${divider}
    <div style="margin-top:${i > 0 ? "0" : "4px"};">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap;">
        ${priorityBadge(item.priority)}
        ${topicCluster ? `<span style="font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;background:#F0E8FA;color:#5333A6;border:1px solid #E6DEF2;">${escapeHtml(topicCluster)}</span>` : ""}
        ${fitChip}
      </div>
      ${matchReason ? `<div style="display:flex;align-items:flex-start;gap:7px;background:#FAFAF8;border-radius:8px;padding:7px 10px;margin-bottom:12px;border:1px solid rgba(0,0,0,0.05);"><span style="font-size:11px;flex-shrink:0;opacity:.5;margin-top:1px;">💬</span><p style="margin:0;font-size:11.5px;line-height:1.55;color:#78716C;font-style:italic;">${escapeHtml(matchReason)}</p></div>` : ""}
      <h4 style="margin:0 0 13px;font-size:15px;font-weight:700;color:#111827;line-height:1.4;"><span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:#111827;color:#fff;font-size:11px;margin-right:8px;vertical-align:1px;">${i + 1}</span>${escapeHtml(item.title)}</h4>
      ${diagnosis ? `<div style="margin-bottom:11px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
          <span style="width:3px;height:14px;background:#D4A574;border-radius:2px;flex-shrink:0;"></span>
          <span style="font-size:11px;font-weight:700;color:#92400E;letter-spacing:.02em;">你的现状</span>
        </div>
        <p style="margin:0 0 0 9px;font-size:13px;line-height:1.65;color:#44403C;">${escapeHtml(diagnosis)}</p>
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
        ${insight ? `<div style="display:flex;align-items:flex-start;gap:8px;${hrPov ? "margin-bottom:8px;" : ""}">
          <span style="display:inline-flex;align-items:center;justify-content:center;min-width:42px;font-size:11px;font-weight:600;color:#6D28D9;background:#F5F3FF;padding:2px 7px;border-radius:99px;flex-shrink:0;">导师</span>
          <span style="flex:1;min-width:0;font-size:12.5px;line-height:1.6;color:#374151;">${escapeHtml(insight)}</span>
        </div>` : ""}
        ${hrPov ? `<div style="display:flex;align-items:flex-start;gap:8px;">
          <span style="display:inline-flex;align-items:center;justify-content:center;min-width:42px;font-size:11px;font-weight:600;color:#B45309;background:#FFFBEB;padding:2px 7px;border-radius:99px;flex-shrink:0;">HR</span>
          <span style="flex:1;min-width:0;font-size:12.5px;line-height:1.6;color:#374151;">${escapeHtml(hrPov)}</span>
        </div>` : ""}
      </div>` : ""}
    </div>`;
}

function prepareDisplayAdviceItems(items = []) {
  const missingSummary = hasMissingSummarySignal();
  const normalized = items
    .filter((item) => !isIrrelevantMlAdvice(item))
    .map((item) => normalizeMissingSummaryAdviceItem(item));
  const seen = new Set();
  const unique = [];
  normalized.forEach((item) => {
    const tags = item.relatedProblemTags || [];
    const family = item.canonicalActionFamily || "";
    const key = missingSummary && (family === "summary_creation" || tags.includes("missing_summary"))
      ? "missing_summary"
      : resultAdviceIdentity(item);
    if (!key || seen.has(key)) return;
    seen.add(key);
    unique.push(item);
  });
  if (!missingSummary) return unique;
  return unique.sort((a, b) => {
    const aTags = a.relatedProblemTags || [];
    const bTags = b.relatedProblemTags || [];
    const aMissing = a.canonicalActionFamily === "summary_creation" || aTags.includes("missing_summary");
    const bMissing = b.canonicalActionFamily === "summary_creation" || bTags.includes("missing_summary");
    if (aMissing !== bMissing) return aMissing ? -1 : 1;
    return 0;
  });
}

function fallbackFreeAdviceItems() {
  return [
    {
      adviceId: "free_fallback_jd_keyword",
      priority: "high",
      displayAdviceType: "JD Keyword",
      title: "先把目标岗位关键词放进经历证据里",
      currentDiagnosis: "现在的经历描述容易停留在职责层，和目标岗位 JD 的关键词连接不够明确。",
      action: "挑 2 到 3 段最相关经历，把 JD 里的核心技能词改写成项目动作、工具和结果，而不是只放在技能列表。",
      mentorLens: "导师会先看关键词有没有被真实项目承接；只有出现在经历证据里，才像是你真的做过。",
      hrPerspective: "HR 快速扫简历时，会优先匹配岗位关键词和最近经历；关键词只堆在技能栏，可信度会比较弱。",
      relatedProblemTags: ["jd_keyword_gap"],
      canonicalActionFamily: "keyword_evidence",
      targetSection: "experience",
    },
    {
      adviceId: "free_fallback_impact",
      priority: "mid",
      displayAdviceType: "Impact",
      title: "把成果写成可判断的业务影响",
      currentDiagnosis: "部分 bullet 目前能看出你做了什么，但还不够容易判断影响范围、质量或结果。",
      action: "每段重点经历至少补一个结果指标：规模、转化、效率、准确率、成本、用户量或上线影响都可以。",
      mentorLens: "大厂导师会用结果判断候选人的 ownership；没有量化结果时，很难判断你只是参与还是主导。",
      hrPerspective: "HR 会把结果数字当作筛选信号，它能让你的经历从普通执行描述里跳出来。",
      relatedProblemTags: ["impact_missing"],
      canonicalActionFamily: "impact_quantification",
      targetSection: "experience",
    },
    {
      adviceId: "free_fallback_structure",
      priority: "mid",
      displayAdviceType: "Structure",
      title: "重排首屏信息，让岗位定位更快被读到",
      currentDiagnosis: "简历开头需要更快说明你是谁、投什么岗位、最强的匹配证据是什么。",
      action: "把 Summary、核心技能和最近一段最相关经历放在前半页，并删除和目标岗位弱相关的低信号内容。",
      mentorLens: "导师通常会先帮你整理叙事顺序；顺序对了，后面的经历才不会被误读成散点。",
      hrPerspective: "HR 的初筛时间很短，首屏没有清楚定位时，后面再好的项目也可能来不及被看到。",
      relatedProblemTags: ["structure"],
      canonicalActionFamily: "resume_structure",
      targetSection: "summary",
    },
  ];
}

function ensureThreeFreeAdviceItems(items = []) {
  const prepared = prepareDisplayAdviceItems(items || []);
  const seen = new Set(prepared.map((item) => resultAdviceIdentity(item)));
  fallbackFreeAdviceItems().forEach((item) => {
    if (prepared.length >= 3) return;
    const key = resultAdviceIdentity(item);
    if (seen.has(key)) return;
    seen.add(key);
    prepared.push(item);
  });
  return prepared.slice(0, 3);
}

function mentorInitials(name) {
  const clean = String(name || "").replace(/[导师]/g, "").trim();
  return clean.slice(0, 2) || (name || "M").slice(0, 1);
}

function renderFreeMentor(m) {
  const mentorFreeEl = document.getElementById("mentorFree");
  if (!mentorFreeEl || !m) return;

  const name = m.mentorName || "导师";
  const initials = mentorInitials(name);
  const company = m.company || "";
  const title = m.mentorTitle || "";
  const careerPath = m.careerPathDisplay || "";
  const companyMeta = [company, title].filter(Boolean).join(" · ");
  const adviceHtml = ensureThreeFreeAdviceItems(m.adviceItems || []).map(renderApiAdviceItem).join("");

  mentorFreeEl.innerHTML = `
    <div style="background:#FFFFFF;border:1px solid rgba(69,42,147,.10);border-radius:20px;padding:20px 20px 18px;box-shadow:0 1px 6px rgba(69,42,147,.08);">
      <div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:14px;">
        <div style="width:46px;height:46px;border-radius:50%;background:linear-gradient(135deg,#E8D5B7,#C8A46E);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:15px;font-weight:700;color:#78350F;letter-spacing:.03em;">${escapeHtml(initials)}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:18px;font-weight:700;color:#111827;line-height:1.2;">${escapeHtml(name)}</span>
            <span style="flex-shrink:0;font-size:11px;font-weight:600;padding:3px 9px;border-radius:99px;background:#FEF9C3;color:#713F12;border:1px solid #FDE68A;">免费试读</span>
          </div>
          ${companyMeta ? `<div style="font-size:12px;color:#6B7280;margin-top:3px;">${escapeHtml(companyMeta)}</div>` : ""}
          ${careerPath ? `<div style="font-size:11.5px;color:#9CA3AF;margin-top:2px;"><span style="font-weight:600;color:#A8A29E;">职业路径</span> · ${escapeHtml(careerPath)}</div>` : ""}
        </div>
      </div>
      <div style="height:1px;background:rgba(0,0,0,0.05);margin:0 0 18px;"></div>
      ${adviceHtml}
    </div>`;
  const rootCard = mentorFreeEl.firstElementChild;
  if (rootCard) {
    const oldHeader = rootCard.firstElementChild;
    if (oldHeader) oldHeader.remove();
  }
  const section = mentorFreeEl.closest(".section");
  const titleEl = section?.querySelector(".section-title");
  if (titleEl && !document.getElementById("mentorLogoIntro")) {
    titleEl.insertAdjacentHTML("afterend", renderMentorLogoIntro());
  }
}

function collectResultPageAdviceItems() {
  const items = s.resultPageAdviceItems || atsResult.resultPageAdviceItems || atsResult.raw?.resultPageAdviceItems || [];
  return Array.isArray(items) ? items.filter(Boolean).slice(0, 3) : [];
}

function renderResultPageAdvicePreview(items) {
  const mentorFreeEl = document.getElementById("mentorFree");
  if (!mentorFreeEl || !items.length) return false;
  const adviceHtml = ensureThreeFreeAdviceItems(items).map(renderApiAdviceItem).join("");
  mentorFreeEl.innerHTML = `
    <div style="background:#FFFFFF;border:1px solid rgba(69,42,147,.10);border-radius:20px;padding:20px 20px 18px;box-shadow:0 1px 6px rgba(69,42,147,.08);">
      ${adviceHtml}
    </div>`;
  const section = mentorFreeEl.closest(".section");
  const numEl = section?.querySelector(".section-num");
  const titleEl = section?.querySelector(".section-title");
  const descEl = section?.querySelector(".section-desc");
  if (numEl) numEl.textContent = "免费试读 · 3 个优先修改点";
  if (titleEl) titleEl.textContent = "先改这 3 件事";
  if (descEl) descEl.textContent = "系统从完整导师建议中挑出最值得先处理的三个修改动作，优先覆盖不同简历部位。";
  if (titleEl && !document.getElementById("mentorLogoIntro")) {
    titleEl.insertAdjacentHTML("afterend", renderMentorLogoIntro());
  }
  return true;
}

function renderLockedAdvicePreview(preview) {
  const areaEl = document.getElementById("lockedMentorsArea");
  if (!areaEl || !preview) return;
  const topics = (preview.topics || []).slice(0, 4).map(t => `<span class="cred-pill">${escapeHtml(t)}</span>`).join("");
  areaEl.innerHTML = `
    <article class="locked-mentor-v2" style="position:relative;overflow:hidden;min-height:190px;">
      <div style="font-size:12px;font-weight:600;color:var(--ink-soft);font-family:var(--mono);margin:0 0 8px;">${preview.lockedAdviceCount || 9} 条付费深度建议</div>
      <div class="cred-pills" style="margin-bottom:10px;">${topics}</div>
      <div class="locked-preview-overlay">${renderUnlockMiniCta({ showButton: false })}</div>
    </article>`;
  return;
  const lockedMentors = preview.lockedMentors || [];
  if (lockedMentors.length > 0) {
    areaEl.innerHTML = lockedMentors.map(m => {
      const topics = (m.previewTopics || []).map(t => `<span class="cred-pill">${escapeHtml(t)}</span>`).join("");
      const companyMeta = [m.company, m.mentorTitle].filter(Boolean).join(" · ");
      return `<article class="locked-mentor-v2" style="position:relative;overflow:hidden;min-height:190px;">
        <div style="margin-bottom:8px;">
          <div style="font-size:17px;font-weight:700;color:var(--ink);line-height:1.2;">${escapeHtml(m.mentorName || "导师")}</div>
          ${companyMeta ? `<div style="font-size:12px;color:var(--ink-mute);margin-top:3px;">${escapeHtml(companyMeta)}</div>` : ""}
          ${m.careerPathDisplay ? `<div style="font-size:12px;color:var(--ink-soft);margin-top:3px;">${escapeHtml(m.careerPathDisplay)}</div>` : ""}
        </div>
        <div style="font-size:12px;font-weight:600;color:var(--ink-soft);font-family:var(--mono);margin:6px 0 6px;">${m.lockedAdviceCount || 3} 条建议</div>
        <div class="cred-pills" style="margin-bottom:10px;">${topics}</div>
        <div class="locked-preview-overlay">${renderUnlockMiniCta({ showButton: false })}</div>
      </article>`;
    }).join("");
  }
}

// 读取并渲染导师建议
function renderLockedAdvicePreviewClean(preview) {
  const areaEl = document.getElementById("lockedMentorsArea");
  if (!areaEl || !preview) return;
  const topics = (preview.topics || []).slice(0, 4).map(t => `<span class="cred-pill">${escapeHtml(t)}</span>`).join("");
  areaEl.innerHTML = `
    <article class="locked-mentor-v2" style="position:relative;overflow:hidden;min-height:190px;">
      <div style="font-size:12px;font-weight:600;color:var(--ink-soft);font-family:var(--mono);margin:0 0 8px;">${preview.lockedAdviceCount || 9} 条付费深度建议</div>
      <div class="cred-pills" style="margin-bottom:10px;">${topics}</div>
      <div class="locked-preview-overlay">${renderUnlockMiniCta({ showButton: false })}</div>
    </article>`;
}

(function renderMentorAdvice() {
  const resultAdviceItems = collectResultPageAdviceItems();
  const freeMentor  = s.freeMentorAdvice || atsResult.raw?.freeMentorAdvice;
  const lockedPrev  = s.lockedAdvicePreview || atsResult.raw?.lockedAdvicePreview;
  if (resultAdviceItems.length) {
    renderResultPageAdvicePreview(resultAdviceItems);
    renderLockedAdvicePreviewClean(lockedPrev);
    return;
  }
  if (freeMentor) {
    renderFreeMentor(freeMentor);
    renderLockedAdvicePreviewClean(lockedPrev);
    return;
  }
  const mentorFreeEl = document.getElementById("mentorFree");
  if (mentorFreeEl) mentorFreeEl.innerHTML = `<p style="color:var(--ink-soft);font-size:14px;padding:16px 0;">暂无导师建议，请返回首页重新提交简历。</p>`;
})();

// ── 7. ATS 评分详情 ────────────────────────────────────────────
if (atsResult && atsResult.atsScore) {
  const atsSectionEl = document.getElementById("atsDetailSection");
  if (atsSectionEl) atsSectionEl.removeAttribute("hidden");

  const items = (function dimensionRows(ats) {
    const dims = ats.dimensions || ats.raw?.dimensions || {};
    return Object.entries(dims).map(([key, value]) => ({
      key, label: value.label || key,
      score: value.score ?? 0, max: value.max ?? 100,
      pct: value.max ? Math.round((Number(value.score || 0) / Number(value.max)) * 100) : 0
    }));
  })(atsResult);

  // ATS system summary
  const sysSummaryEl = document.getElementById("atsSystemSummary");
  if (sysSummaryEl) {
    const jdKeywordCount = formatDisplayJdKeywordCount();
    const jdCount = getJdKeywordCount(atsResult);
    const coverageRatio = jdCount && jdCount.total ? jdCount.matched / jdCount.total : null;
    const coverageNote = coverageRatio !== null && coverageRatio >= 0.65
      ? "关键词覆盖良好。建议重点检查下方关键词是否有足够的经历证据支撑。"
      : "覆盖偏低。先看下方关键词。";
    sysSummaryEl.innerHTML = [
      jdKeywordCount !== "--" ? `<div><b>JD 关键词覆盖：</b>${jdKeywordCount}</div>` : "",
      jdKeywordCount !== "--" ? `<div>${coverageNote}</div>` : "",
      atsResult.formatPenaltyTriggered ? `<div style="color:var(--bad);"><b>格式处罚：</b>${(atsResult.formatPenaltyReason || []).join("；")}</div>` : "",
    ].filter(Boolean).join("");
  }

  // 六边形雷达图
  (function renderRadar() {
    const svgEl = document.getElementById("atsRadarChart");
    if (!svgEl) return;
    svgEl.setAttribute("viewBox", "0 0 360 320");
    svgEl.setAttribute("width", "360");
    svgEl.setAttribute("height", "320");
    const cx = 180, cy = 150, R = 88;
    const dimKeys = ["A","B","C","D","E","F"];
    const dimLabels = { A:"格式规范", B:"基本资料", C:"内容质量", D:"技能匹配", E:"市场适配", F:"经验匹配" };
    const raw = atsResult.raw?.dimensions || atsResult.dimensions || {};
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
    svg += `<polygon points="${dataPts}" fill="rgba(83,51,166,.16)" stroke="var(--jade,#5333A6)" stroke-width="2"/>`;
    dims.forEach((d, i) => {
      const [dx, dy] = pt(i, R * d.pct / 100);
      const [lx, ly] = pt(i, R + 26);
      const anchor = lx < cx - 4 ? "end" : lx > cx + 4 ? "start" : "middle";
      const color = d.pct >= 70 ? "var(--good,#1F7A4D)" : d.pct >= 45 ? "var(--warn,#B25E00)" : "var(--bad,#B3261E)";
      svg += `<circle cx="${dx}" cy="${dy}" r="4" fill="${color}"/>`;
      svg += `<text x="${lx}" y="${ly}" text-anchor="${anchor}" font-size="11" font-weight="600" fill="var(--ink-soft)" font-family="var(--sans)">${dimLabels[dimKeys[i]]}</text>`;
      svg += `<text x="${lx}" y="${ly + 13}" text-anchor="${anchor}" font-size="12" font-weight="800" fill="${color}" font-family="var(--sans)">${d.score}/${d.max}</text>`;
    });
    svgEl.innerHTML = svg;

    const totalEl = document.getElementById("atsTotalScore");
    if (totalEl) {
      const sc = atsResult.atsScore;
      const scoreColor = sc >= 75 ? "var(--good,#1F7A4D)" : sc >= 55 ? "var(--warn,#B25E00)" : "var(--bad,#B3261E)";
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
  })();

  // 关键问题
  const problemsEl = document.getElementById("atsProblems");
  if (problemsEl) {
    const problems = normalizeProblemList();
    problemsEl.innerHTML = problems.map((p) =>
      `<li style="margin-bottom:10px;padding-left:20px;position:relative;line-height:1.5;"><span style="position:absolute;left:0;top:8px;width:6px;height:6px;border-radius:50%;background:var(--bad);"></span>${escapeHtml(p)}</li>`
    ).join("") + renderAtsPreviewMoreButton("problems") + renderPaywallMoreBlock("problems");
  }

  // 优先建议 — 暂时隐藏，与下方建议重复
  // const suggestionsEl = document.getElementById("atsSuggestions");
  // if (suggestionsEl) { ... }

  // Keep the first three bullets visible; clicking the header only reveals the paid teaser.
  function toggleAtsPreviewDetails(el, chev) {
    if (!el) return;
    el.open = true;
    el.classList.toggle("is-expanded");
    const expanded = el.classList.contains("is-expanded");
    if (chev) chev.style.transform = expanded ? "rotate(180deg)" : "rotate(0deg)";
    el.querySelectorAll(".ats-preview-more").forEach(btn => {
      btn.textContent = expanded ? "收起" : "查看更多";
    });
  }
  ["atsProblemsDetails", "atsSuggestionsDetails"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const chevId = id === "atsProblemsDetails" ? "atsProblemsChev" : "atsSuggestionsChev";
    el.open = true;
    el.classList.add("ats-preview-details");
    el.classList.remove("is-expanded");
    const summary = el.querySelector("summary");
    summary?.addEventListener("click", (event) => {
      event.preventDefault();
      const chev = document.getElementById(chevId);
      toggleAtsPreviewDetails(el, chev);
    });
    el.querySelectorAll(".ats-preview-more").forEach(btn => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const chev = document.getElementById(chevId);
        toggleAtsPreviewDetails(el, chev);
      });
    });
    const chev = document.getElementById(chevId);
    if (chev) chev.style.transform = "rotate(0deg)";
    el.querySelectorAll(".ats-preview-more").forEach(btn => { btn.textContent = "查看更多"; });
  });

  // ATS tile detail（覆盖前面的预设）
  if (atsDetailEl) atsDetailEl.innerHTML = renderRows([
    { k:"ATS 总分", v:`${atsResult.atsScore}/100`, note: atsRiskText(atsResult.riskLevel) },
    { k:"JD 关键词匹配", v: formatDisplayJdKeywordCount(), note:"已覆盖 / JD 关键词总数" },
  ]);
}
