const STORE_KEY = "resumeFixMVP";
// NOTE: API_BASE is declared in api-client.js (loaded before this file)
window.__resumeAppState = window.__resumeAppState || { isSubmitting: false, loaderRotateTimer: null, loaderProgressTimer: null };
window.__resumeAppState.loaderDisplayedProgress = window.__resumeAppState.loaderDisplayedProgress || 0;
window.__resumeAppState.loaderProgressTarget = window.__resumeAppState.loaderProgressTarget || 0;

window.Store = window.Store || {
  get() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
    catch(e) { return {}; }
  },
  set(patch) {
    try {
      const next = { ...this.get(), ...patch };
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
      return next;
    } catch(e) { throw new Error("localStorage failed"); }
  },
  clear() { try { localStorage.removeItem(STORE_KEY); } catch(e) {} }
};

const ANALYSIS_MESSAGES = [
  ["正在扫描你的履历亮点…", "先找出最能打动 HR 的经历、技能和项目证据"],
  ["正在对照目标岗位 JD…", "逐项比对关键词、职责语言和岗位匹配信号"],
  ["正在匹配大厂导师经验…", "从真实辅导案例里筛选与你背景最接近的优化方向"],
  ["正在定位高优先级问题…", "优先抓出最影响通过率的格式、关键词和表达短板"],
  ["正在生成你的初步诊断…", "把最关键的简历风险和提升机会整理成清晰报告"],
];
const PAYMENT_MESSAGES = [
  ["正在为你匹配知名大厂导师…", "优先筛选与你目标岗位最相关的真实辅导经验"],
  ["正在解锁大厂级简历视角…", "从 HR 初筛、ATS 命中和导师建议里抓出最该改的地方"],
  ["正在生成你的高分改写路线…", "把关键词、经历亮点和岗位语言整理成更像 offer 简历的版本"],
  ["正在点亮完整报告…", "完整诊断马上就绪，准备查看你的专属提升方案"],
];

function showLoader(text, subtext, rotate, options = {}) {
  let o = document.querySelector(".loader-overlay");
  if (!o) {
    o = document.createElement("div");
    o.className = "loader-overlay";
    o.innerHTML = '<div class="loader-container"><div class="loader-badge">MentorX premium matching</div><div class="loader-dots"><span></span><span></span><span></span></div><div class="loader-text"></div><div class="loader-subtext"></div><div class="loader-progress"><div class="loader-progress-fill"></div></div><div class="loader-progress-label">0%</div></div>';
    document.body.appendChild(o);
    const s = document.createElement("style");
    s.textContent = ".loader-overlay{position:fixed;inset:0;background:radial-gradient(circle at 50% 38%,rgba(180,126,219,.24),transparent 34%),rgba(31,23,68,.88);backdrop-filter:blur(7px);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;pointer-events:none;transition:opacity .3s}.loader-overlay.show{opacity:1;pointer-events:auto}.loader-container{text-align:center;color:#f8fafc;padding:30px 32px 28px;max-width:380px;width:min(380px,calc(100% - 40px));border:1px solid rgba(255,255,255,.13);border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.045));box-shadow:0 30px 80px -34px rgba(0,0,0,.85)}.loader-badge{display:inline-flex;align-items:center;justify-content:center;margin:0 auto 18px;padding:6px 10px;border-radius:999px;background:rgba(180,126,219,.18);border:1px solid rgba(180,126,219,.42);color:#B47EDB;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;font-family:ui-monospace,Menlo,Consolas,monospace}.loader-dots{display:flex;gap:10px;justify-content:center;margin-bottom:22px}.loader-dots span{width:11px;height:11px;border-radius:50%;background:#B47EDB;box-shadow:0 0 18px rgba(180,126,219,.45);animation:ldBounce 1.4s infinite ease-in-out both}.loader-dots span:nth-child(1){animation-delay:-.32s}.loader-dots span:nth-child(2){animation-delay:-.16s}@keyframes ldBounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}.loader-text{font-size:20px;font-weight:800;margin-bottom:10px;transition:opacity .35s;color:#FFFFFF;letter-spacing:0;line-height:1.25}.loader-subtext{font-size:14px;color:#D9D1EA;line-height:1.6;transition:opacity .35s;min-height:44px}.loader-progress{height:8px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden;margin:22px auto 8px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}.loader-progress-fill{height:100%;width:0%;border-radius:inherit;background:linear-gradient(90deg,#5333A6,#7A52C5,#B47EDB);transition:width .45s ease;position:relative}.loader-progress-fill::after{content:\"\";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.45),transparent);animation:ldShimmer 1.35s linear infinite}@keyframes ldShimmer{from{transform:translateX(-100%)}to{transform:translateX(100%)}}.loader-progress-label{font-size:11px;color:#D9D1EA;font-family:ui-monospace,Menlo,Consolas,monospace}";
    document.head.appendChild(s);
  }
  const textEl    = o.querySelector(".loader-text");
  const subtextEl = o.querySelector(".loader-subtext");
  const progressEl = o.querySelector(".loader-progress-fill");
  const progressLabelEl = o.querySelector(".loader-progress-label");
  const badgeEl = o.querySelector(".loader-badge");
  const dotsEl = o.querySelector(".loader-dots");
  textEl.textContent    = text    || "";
  subtextEl.textContent = subtext || "";
  if (dotsEl) dotsEl.style.display = "flex";
  if (progressEl) progressEl.style.background = "linear-gradient(90deg,#5333A6,#7A52C5,#B47EDB)";
  o.classList.add("show");

  // Stop any previous rotation
  if (window.__resumeAppState.loaderRotateTimer) {
    clearInterval(window.__resumeAppState.loaderRotateTimer);
    window.__resumeAppState.loaderRotateTimer = null;
  }
  if (window.__resumeAppState.loaderProgressTimer) {
    clearInterval(window.__resumeAppState.loaderProgressTimer);
    window.__resumeAppState.loaderProgressTimer = null;
  }

  const mode = options.mode || (rotate === "payment" ? "payment" : "analysis");
  const shouldRotate = Boolean(rotate);
  const isPayment = mode === "payment";
  if (badgeEl) badgeEl.style.display = isPayment ? "inline-flex" : "none";
  let progress = Number.isFinite(Number(options.initialProgress))
    ? Math.max(0, Math.min(100, Math.floor(Number(options.initialProgress))))
    : (isPayment ? 35 : 0);
  window.__resumeAppState.loaderDisplayedProgress = progress;
  window.__resumeAppState.loaderProgressTarget = progress;
  if (progressEl) progressEl.style.width = progress + "%";
  if (progressLabelEl) progressLabelEl.textContent = progress + "%";

  if (shouldRotate) {
    const messages = isPayment ? PAYMENT_MESSAGES : ANALYSIS_MESSAGES;
    let idx = 0;
    if (isPayment) {
      window.__resumeAppState.loaderRotateTimer = setInterval(() => {
        idx = (idx + 1) % messages.length;
        textEl.style.opacity = "0";
        subtextEl.style.opacity = "0";
        setTimeout(() => {
          textEl.textContent    = messages[idx][0];
          subtextEl.textContent = messages[idx][1];
          textEl.style.opacity = "1";
          subtextEl.style.opacity = "0.7";
        }, 300);
      }, 1800);
      window.__resumeAppState.loaderProgressTimer = setInterval(() => {
        progress = Math.min(97, progress + Math.max(2, Math.round((98 - progress) * 0.18)));
        if (progressEl) progressEl.style.width = progress + "%";
        if (progressLabelEl) progressLabelEl.textContent = progress + "%";
      }, 280);
    }
  }
}

function updateLoaderProgress(pct, text, subtext, options = {}) {
  const o = document.querySelector(".loader-overlay");
  if (!o) return;
  const number = Number(pct);
  const safePct = Number.isFinite(number) ? Math.max(0, Math.min(100, Math.floor(number))) : null;
  const textEl = o.querySelector(".loader-text");
  const subtextEl = o.querySelector(".loader-subtext");
  const progressEl = o.querySelector(".loader-progress-fill");
  const progressLabelEl = o.querySelector(".loader-progress-label");
  if (textEl && text) textEl.textContent = text;
  if (subtextEl && subtext) subtextEl.textContent = subtext;
  if (safePct === null) return;

  const setDisplayedProgress = (value) => {
    window.__resumeAppState.loaderDisplayedProgress = value;
    if (progressEl) progressEl.style.width = value + "%";
    if (progressLabelEl) progressLabelEl.textContent = value + "%";
  };

  window.__resumeAppState.loaderProgressTarget = safePct;
  const current = Math.max(0, Math.min(100, Number(window.__resumeAppState.loaderDisplayedProgress || 0)));
  if (options.instant || safePct <= current) {
    if (window.__resumeAppState.loaderProgressTimer) {
      clearInterval(window.__resumeAppState.loaderProgressTimer);
      window.__resumeAppState.loaderProgressTimer = null;
    }
    setDisplayedProgress(safePct);
    return;
  }

  if (window.__resumeAppState.loaderProgressTimer) return;
  window.__resumeAppState.loaderProgressTimer = setInterval(() => {
    const target = Number(window.__resumeAppState.loaderProgressTarget || 0);
    const shown = Math.max(0, Math.min(100, Number(window.__resumeAppState.loaderDisplayedProgress || 0)));
    if (shown >= target) {
      clearInterval(window.__resumeAppState.loaderProgressTimer);
      window.__resumeAppState.loaderProgressTimer = null;
      return;
    }
    setDisplayedProgress(Math.min(target, shown + 1));
  }, 60);
}
function completeLoader(text, subtext) {
  if (window.__resumeAppState.loaderRotateTimer) {
    clearInterval(window.__resumeAppState.loaderRotateTimer);
    window.__resumeAppState.loaderRotateTimer = null;
  }
  if (window.__resumeAppState.loaderProgressTimer) {
    clearInterval(window.__resumeAppState.loaderProgressTimer);
    window.__resumeAppState.loaderProgressTimer = null;
  }
  const o = document.querySelector(".loader-overlay");
  if (!o) return;
  const textEl = o.querySelector(".loader-text");
  const subtextEl = o.querySelector(".loader-subtext");
  const progressEl = o.querySelector(".loader-progress-fill");
  const progressLabelEl = o.querySelector(".loader-progress-label");
  if (textEl) textEl.textContent = text || "已完成";
  if (subtextEl) subtextEl.textContent = subtext || "";
  window.__resumeAppState.loaderDisplayedProgress = 100;
  window.__resumeAppState.loaderProgressTarget = 100;
  if (progressEl) progressEl.style.width = "100%";
  if (progressLabelEl) progressLabelEl.textContent = "100%";
}
function hideLoader() {
  if (window.__resumeAppState.loaderRotateTimer) {
    clearInterval(window.__resumeAppState.loaderRotateTimer);
    window.__resumeAppState.loaderRotateTimer = null;
  }
  if (window.__resumeAppState.loaderProgressTimer) {
    clearInterval(window.__resumeAppState.loaderProgressTimer);
    window.__resumeAppState.loaderProgressTimer = null;
  }
  const o = document.querySelector(".loader-overlay");
  if (o) o.classList.remove("show");
}

function showLoaderError(text, subtext) {
  showLoader(text || "分析失败", subtext || "请返回首页重新提交，或改用简历文本粘贴方式。", false);
  if (window.__resumeAppState.loaderRotateTimer) {
    clearInterval(window.__resumeAppState.loaderRotateTimer);
    window.__resumeAppState.loaderRotateTimer = null;
  }
  if (window.__resumeAppState.loaderProgressTimer) {
    clearInterval(window.__resumeAppState.loaderProgressTimer);
    window.__resumeAppState.loaderProgressTimer = null;
  }
  const o = document.querySelector(".loader-overlay");
  if (!o) return;
  const progressEl = o.querySelector(".loader-progress-fill");
  const progressLabelEl = o.querySelector(".loader-progress-label");
  const dotsEl = o.querySelector(".loader-dots");
  if (progressEl) {
    progressEl.style.width = "100%";
    progressEl.style.background = "linear-gradient(90deg,#B42318,#E05243)";
  }
  if (progressLabelEl) progressLabelEl.textContent = "ERROR";
  if (dotsEl) dotsEl.style.display = "none";
}

function analysisJobStageText(stage) {
  const stageTextMap = {
    queued: "正在排队准备分析。",
    scoring: "正在对照目标岗位 JD。",
    building_report: "正在生成报告结构。",
    format_internal_ats: "正在整理 ATS 诊断。",
    retrieve_mentor_advice: "正在匹配导师建议。",
    select_mentor_plan: "正在筛选最适合你的建议。",
    format_reports: "正在生成诊断内容。",
    format_public_premium: "正在整理可视化报告。",
    save_report: "正在保存报告。",
  };
  return stageTextMap[stage] || "正在分析你的履历。";
}

function inferTargetJobFromJD(jdText) {
  const text = String(jdText || "").replace(/\r/g, "\n").trim();
  if (!text) return "";
  const clean = (value) => normalizeTargetJobTitle(String(value || "")
    .replace(/\s*【.*$/, "")
    .replace(/[|;；].*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80));
  const locationWords = /\b(remote|hybrid|onsite|on-site|virginia|tennessee|california|new york|seattle|boston|austin|atlanta|miami|los angeles|wa|ca|ny|tx|fl|tn|va)\b|弗吉尼亚|田纳西|加州|纽约|西雅图|洛杉矶|亚特兰大|迈阿密|远程|地点|地区|城市/i;
  const roleWords = /(engineer|developer|scientist|analyst|manager|management\s+trainee|trainee|designer|consultant|researcher|architect|specialist|associate|intern|coordinator|assistant|support|officer|实习|管培生|工程师|分析师|经理|顾问|研究员|设计师|专员|助理|主管|负责人|产品|运营|算法|机器学习|软件|前端|后端)/i;
  const noiseWords = /(responsibilities|requirements|qualifications|about us|description|summary|duties|tasks|projects|policies|procedures|goals|薪资|职责|要求|资格|福利|公司|公司介绍|我们|工作内容|任职要求|岗位职责)/i;
  function isLikelyTitle(value, allowNoRoleNoun) {
    const title = clean(value);
    if (!title || title.length < 2 || title.length > 80) return false;
    if (noiseWords.test(title)) return false;
    if (locationWords.test(title) && !roleWords.test(title)) return false;
    return allowNoRoleNoun || roleWords.test(title);
  }
  const labeledPatterns = [
    /^\s*(?:【\s*)?(?:job\s*title|position\s*title|position|role\s*title|role|title|opening|target\s*(?:role|position)|目标岗位|岗位|职位|职称|职务|招聘岗位|应聘岗位)(?:\s*】)?\s*[:：\-–]\s*([^\n|;；]+)/gim,
    /^\s*(?:job\s*title|position\s*title|position|role\s*title|role|title|opening|target\s*(?:role|position))\s*[:\-]\s*([^\n|;]+)/gim,
  ];
  for (const pattern of labeledPatterns) {
    for (const match of text.matchAll(pattern)) {
      const title = match && clean(match[1]);
      if (isLikelyTitle(title, true)) return title;
    }
  }
  const beforeDuties = text.split(/(?:【\s*)?(?:岗位职责|工作职责|工作内容|responsibilities|duties)(?:\s*】)?\s*[:：]?/i)[0] || text;
  const lines = beforeDuties.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 18);
  for (const line of lines) {
    const cleaned = line
      .replace(/^[#*\-\s]+/, "")
      .replace(/\s+/g, " ")
      .trim();
    if (cleaned.length < 3 || cleaned.length > 90) continue;
    if (noiseWords.test(cleaned)) continue;
    if (isLikelyTitle(cleaned, false)) return clean(cleaned);
  }
  return "";
}

function normalizeTargetJobTitle(value) {
  return String(value || "")
    .replace(/^\s*【(?:岗位|职位|职称|职务|招聘岗位|应聘岗位)】\s*[：:]\s*/i, "")
    .replace(/^\s*(?:目标岗位|岗位|职位|职称|职务|招聘岗位|应聘岗位)\s*[：:\-–]\s*/i, "")
    .replace(/\s*[（(](?:junior|senior|entry[-\s]?level|full[-\s]?time|part[-\s]?time|internship|intern|co-?op|new\s*grad|全职|兼职|实习|校招)[^）)]*[）)]\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeExtractedTargetJobTitle(value) {
  return String(value || "")
    .replace(/^\s*\u3010(?:\u76ee\u6807\u5c97\u4f4d|\u5c97\u4f4d|\u804c\u4f4d|\u804c\u79f0|\u804c\u52a1|\u62db\u8058\u5c97\u4f4d|\u5e94\u8058\u5c97\u4f4d)\u3011\s*[\uff1a:]\s*/i, "")
    .replace(/^\s*(?:\u76ee\u6807\u5c97\u4f4d|\u5c97\u4f4d|\u804c\u4f4d|\u804c\u79f0|\u804c\u52a1|\u62db\u8058\u5c97\u4f4d|\u5e94\u8058\u5c97\u4f4d)\s*[\uff1a:\-–]\s*/i, "")
    .replace(/^\s*(?:job\s+title|position\s+title|position|role\s+title|role|title|opening)\s*[:\-–]\s*/i, "")
    .replace(/\s*[（(](?:junior|senior|entry[-\s]?level|full[-\s]?time|part[-\s]?time|internship|intern|co-?op|new\s*grad|全职|兼职|实习|校招)[^）)]*[）)]\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTargetJobFromJD(jdText) {
  const text = String(jdText || "").replace(/\r/g, "\n").trim();
  if (!text) return "";
  const clean = (value) => normalizeExtractedTargetJobTitle(String(value || "")
    .replace(/\s*\u3010.*$/, "")
    .replace(/[|;；].*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80));
  const locationWords = /\b(remote|hybrid|onsite|on-site|virginia|tennessee|california|new york|seattle|boston|austin|atlanta|miami|los angeles|wa|ca|ny|tx|fl|tn|va)\b|弗吉尼亚|田纳西|加州|纽约|西雅图|洛杉矶|亚特兰大|迈阿密|远程|地点|地区|城市/i;
  const roleWords = /(engineer|developer|scientist|analyst|manager|management\s+trainee|trainee|designer|consultant|researcher|architect|specialist|associate|intern|coordinator|assistant|support|officer|\u5b9e\u4e60|\u7ba1\u57f9\u751f|\u5de5\u7a0b\u5e08|\u5206\u6790\u5e08|\u7ecf\u7406|\u987e\u95ee|\u7814\u7a76\u5458|\u8bbe\u8ba1\u5e08|\u4e13\u5458|\u52a9\u7406|\u4e3b\u7ba1|\u8d1f\u8d23\u4eba|\u4ea7\u54c1|\u8fd0\u8425|\u7b97\u6cd5|\u673a\u5668\u5b66\u4e60|\u8f6f\u4ef6|\u524d\u7aef|\u540e\u7aef)/i;
  const noiseWords = /(responsibilities|requirements|qualifications|about us|description|summary|duties|tasks|projects|policies|procedures|goals|\u85aa\u8d44|\u804c\u8d23|\u8981\u6c42|\u8d44\u683c|\u798f\u5229|\u516c\u53f8|\u516c\u53f8\u4ecb\u7ecd|\u6211\u4eec|\u5de5\u4f5c\u5185\u5bb9|\u4efb\u804c\u8981\u6c42|\u5c97\u4f4d\u804c\u8d23)/i;
  function isLikelyTitle(value, allowNoRoleNoun) {
    const title = clean(value);
    if (!title || title.length < 2 || title.length > 80) return false;
    if (noiseWords.test(title)) return false;
    if (locationWords.test(title) && !roleWords.test(title)) return false;
    return allowNoRoleNoun || roleWords.test(title);
  }
  const labeledPatterns = [
    /^\s*(?:\u3010\s*)?(?:job\s*title|position\s*title|position|role\s*title|role|title|opening|target\s*(?:role|position)|\u76ee\u6807\u5c97\u4f4d|\u5c97\u4f4d|\u804c\u4f4d|\u804c\u79f0|\u804c\u52a1|\u62db\u8058\u5c97\u4f4d|\u5e94\u8058\u5c97\u4f4d)(?:\s*\u3011)?\s*[:\uff1a\-–]\s*([^\n|;\uff1b]+)/gim,
    /^\s*(?:job\s*title|position\s*title|position|role\s*title|role|title|opening|target\s*(?:role|position))\s*[:\-]\s*([^\n|;]+)/gim,
  ];
  for (const pattern of labeledPatterns) {
    for (const match of text.matchAll(pattern)) {
      const title = match && clean(match[1]);
      if (isLikelyTitle(title, true)) return title;
    }
  }

  // Sentence-embedded hiring phrases (LinkedIn "As a", Indeed "The X will", Handshake "hiring a")
  const sentencePatterns = [
    /\bAs\s+(?:an?\s+|the\s+)((?:(?:Senior|Sr\.?|Junior|Jr\.?|Lead|Principal|Staff|Associate|Head)\s+)?(?:\w+(?:\s+\w+){0,4}))\s*,/gi,
    /\bThe\s+((?:(?:Senior|Sr\.?|Junior|Jr\.?|Lead|Principal|Staff|Associate|Head)\s+)?(?:\w+(?:\s+\w+){0,4}))\s+(?:will\b|is\s+responsible|leads?\b|manages?\b)/gi,
    /(?:we(?:'re|\s+are)\s+(?:looking|hiring|seeking)\s+(?:for\s+)?(?:an?\s+)?)([\w\s\-\/]+?)(?:\s*(?:to\b|who\b|that\b|and\b|\.|,|$))/gi,
    /(?:join\s+us\s+as\s+(?:an?\s+)?)([\w\s\-\/]+?)(?:\s*(?:to\b|who\b|and\b|\.|,|$))/gi,
    /(?:\bhiring\s+(?:an?\s+)?)([\w\s\-\/]+?)(?:\s*(?:to\b|who\b|and\b|\.|,|!|$))/gi,
  ];
  for (const re of sentencePatterns) {
    for (const m of text.matchAll(re)) {
      const t = clean(m[1]).replace(/\s+(?:will|is|leads?|manages?)$/i, "").replace(/[.!?]*$/, "").trim();
      const wc = t.split(/\s+/).length;
      if (wc >= 2 && wc <= 6 && isLikelyTitle(t, false)) return t;
    }
  }
  const dutyLeadWords = /^(rotate|assist|participate|develop|analy[sz]e|complete|provide|learn|create|help|support|work|collaborate|manage\s+day[-\s]?to[-\s]?day)\b/i;
  const beforeDuties = text.split(/(?:\u3010\s*)?(?:\u5c97\u4f4d\u804c\u8d23|\u5de5\u4f5c\u804c\u8d23|\u5de5\u4f5c\u5185\u5bb9|responsibilities|duties)(?:\s*\u3011)?\s*[:\uff1a]?/i)[0] || text;
  const lines = beforeDuties.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 18);
  for (const line of lines) {
    const cleaned = line.replace(/^[#*\-\s]+/, "").replace(/\s+/g, " ").trim();
    if (cleaned.length < 3 || cleaned.length > 90) continue;
    if (noiseWords.test(cleaned) || dutyLeadWords.test(cleaned)) continue;
    if (isLikelyTitle(cleaned, false)) return clean(cleaned);
  }
  return normalizeExtractedTargetJobTitle(inferTargetJobFromJD(text));
}

async function submitResume(form) {
  if (window.__resumeAppState.isSubmitting) return false;
  const inputMode = form.elements["resumeInputMode"]?.value || "file";
  const selectedFile = form.elements["resume"].files[0];
  const pastedResumeText = (form.elements["resumeText"]?.value || "").trim();
  const file = inputMode === "text" ? null : selectedFile;
  const resumeTextInput = inputMode === "text" ? pastedResumeText : "";
  const job      = form.elements["job"].value.trim();
  const jd       = form.elements["jd"].value.trim();
  const errorBox = form.querySelector(".form-error");
  const btn      = form.querySelector('button[type="submit"]');
  if (inputMode === "text" && !resumeTextInput) { errorBox.textContent = "请先粘贴简历文本"; errorBox.classList.add("show"); return false; }
  if (inputMode !== "text" && !file) { errorBox.textContent = "请先上传简历文件，或切换为文字输入简历"; errorBox.classList.add("show"); return false; }
  if (!file && !pastedResumeText) { errorBox.textContent = "请先上传简历文件，或直接粘贴简历文本"; errorBox.classList.add("show"); return false; }
  if (!job && !jd) { errorBox.textContent = "请填写目标岗位或粘贴目标岗位 JD，二选一即可"; errorBox.classList.add("show"); return false; }
  errorBox.classList.remove("show");
  window.__resumeAppState.isSubmitting = true;
  if (btn) btn.disabled = true;
  try {
    const resumeText = resumeTextInput;
    const resumeName = file?.name || "手动粘贴的简历";
    const scoringJobTitle = String(job || "").trim();
    const targetJob = normalizeTargetJobTitle(job || extractTargetJobFromJD(jd));
    const locale = (window.I18N && window.I18N.getLocale && window.I18N.getLocale()) || window.Store.get().locale || "zh-CN";
    const analysisJob = await startAnalysisJobAPI(resumeText, scoringJobTitle || null, jd, file?.name || "", file);
    window.Store.set({
      locale,
      resumeName,
      jobTitle: scoringJobTitle,
      targetLabel: targetJob,
      jdText: jd,
      resumeText,
      analysisJobId: analysisJob.jobId,
      analysisJobStatus: analysisJob.status,
      analysisJobStartedAt: Date.now(),
      atsResult: null,
      freeMentorAdvice: null,
      lockedAdvicePreview: null,
      premiumMentors: null,
      premiumAdviceItems: null,
      mentorLogoPool: null,
      submittedAt: Date.now(),
      isPaid: false,
      mentorAdvice: null
    });
    window.location.href = "/login";
  } catch(err) {
    errorBox.textContent = "❌ " + (err.message || "未知错误");
    errorBox.classList.add("show");
    hideLoader();
    window.__resumeAppState.isSubmitting = false;
    if (btn) btn.disabled = false;
  }
  return false;
}

function bindFileUpload() {
  const wrap = document.querySelector(".file-upload");
  if (!wrap) return;
  const input   = wrap.querySelector('input[type="file"]');
  const empty   = document.getElementById("fuEmpty");
  const success = document.getElementById("fuSuccess");
  const fnEl    = document.getElementById("fuFilename");
  const metaEl  = document.getElementById("fuMeta");
  function fmtBytes(b) {
    if (b < 1024)    return b + " B";
    if (b < 1048576) return (b/1024).toFixed(1) + " KB";
    return (b/1048576).toFixed(1) + " MB";
  }
  input.addEventListener("change", () => {
    const f = input.files[0];
    if (f) {
      wrap.classList.add("has-file");
      const ext = f.name.split(".").pop().toUpperCase();
      if (fnEl)   fnEl.textContent   = f.name;
      if (metaEl) metaEl.textContent = ext + " · " + fmtBytes(f.size);
      if (empty)   empty.style.display   = "none";
      if (success) success.style.display = "flex";
    } else {
      wrap.classList.remove("has-file");
      if (empty)   empty.style.display   = "";
      if (success) success.style.display = "none";
    }
  });
}

function bindResumeInputMode() {
  const form = document.querySelector(".home-page form");
  if (!form) return;
  const modeInputs = Array.from(form.querySelectorAll('input[name="resumeInputMode"]'));
  const filePanel = form.querySelector('[data-resume-source-panel="file"]');
  const textArea = form.querySelector('textarea[name="resumeText"]');
  const textPanel = textArea?.closest(".input-group");
  if (!modeInputs.length || !filePanel || !textPanel) return;
  function sync() {
    const mode = form.elements["resumeInputMode"]?.value || "file";
    const isText = mode === "text";
    filePanel.hidden = isText;
    textPanel.hidden = !isText;
    textPanel.classList.toggle("resume-text-active", isText);
  }
  modeInputs.forEach((input) => input.addEventListener("change", sync));
  sync();
}

function storeAnalysisJobResult(result) {
  const publicReport = result?.publicReport || result?.data || {};
  const atsResult = typeof formatATSResult === "function"
    ? formatATSResult({ ...publicReport, reportId: result?.reportId, reportAccessToken: result?.reportAccessToken })
    : publicReport;
  window.Store.set({
    locale: result?.locale || publicReport.locale || window.Store.get().locale || "zh-CN",
    reportId: result?.reportId || publicReport.reportId || null,
    sessionId: result?.reportId || publicReport.reportId || null,
    reportAccessToken: result?.reportAccessToken || null,
    atsResult,
    targetLabel: window.Store.get().targetLabel || window.Store.get().jobTitle || publicReport.jobTitle || atsResult.jobTitle || null,
    freeMentorAdvice: publicReport.freeMentorAdvice || null,
    resultPageAdviceItems: publicReport.resultPageAdviceItems || null,
    lockedAdvicePreview: publicReport.lockedAdvicePreview || null,
    mentorLogoPool: publicReport.lockedAdvicePreview?.mentorLogoPool || publicReport.freeMentorAdvice?.mentorLogoPool || null,
    analysisJobStatus: "completed",
    analysisCompletedAt: Date.now(),
    analysisDebugSummary: result?.debugSummary || null,
  });
}

async function waitForAnalysisJobAndRedirect(btn) {
  const current = window.Store.get();
  if (current.reportId && current.atsResult) {
    showLoader("诊断完成！", "报告已生成，正在进入结果页…");
    setTimeout(() => { window.location.href = "/result"; }, 500);
    return;
  }
  if (!current.analysisJobId || typeof getAnalysisJobAPI !== "function") {
    showLoaderError("分析任务未启动", "请返回首页重新提交，或改用简历文本粘贴方式。");
    if (btn) btn.disabled = false;
    return;
  }

  showLoader("正在读取分析进度…", "报告完成后将自动跳转。", false);
  try {
    const job = await getAnalysisJobAPI(current.analysisJobId);
    window.Store.set({ analysisJobStatus: job.status, analysisJobStage: job.stage });
    if (job.status === "completed" && job.result) {
      storeAnalysisJobResult(job.result);
      showLoader("诊断完成！", "报告已生成，正在进入结果页…");
      setTimeout(() => { window.location.href = "/result"; }, 500);
      return;
    }
    if (job.status === "failed") {
      if (btn) btn.disabled = false;
      showLoaderError("分析失败", job.error ? "原因：" + job.error : "请返回首页重新提交，或改用简历文本粘贴方式。");
      return;
    }
    updateLoaderProgress(job.progress || 0, analysisJobStageText(job.stage), "报告完成后将自动跳转。");
    setTimeout(() => waitForAnalysisJobAndRedirect(btn), 1200);
  } catch (err) {
    if (btn) btn.disabled = false;
    const message = err?.code === "JOB_NOT_FOUND"
      ? "分析任务已中断，请返回首页重新提交。"
      : (err?.message || "无法确认分析状态，请返回首页重新提交。");
    showLoaderError("无法确认分析状态", message);
  }
}

function mockLogin(btn) {
  if (btn) btn.disabled = true;
  window.Store.set({ userId: "mock_" + Date.now(), loginAt: Date.now() });
  waitForAnalysisJobAndRedirect(btn);
}
function mockPayment(btn) {
  btn.disabled = true;
  showLoader("正在确认支付…", "正在校验支付状态与报告权限", true, { mode: "payment" });
  setTimeout(async () => {
    try {
      const s = window.Store.get();
      if (!s.reportId || !s.reportAccessToken) throw new Error("缺少报告解锁凭证");

      const markResponse = await fetch(`/api/v1/reports/${encodeURIComponent(s.reportId)}/mark-paid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportAccessToken: s.reportAccessToken, locale: s.locale || "zh-CN" }),
      });
      if (!markResponse.ok) {
        const error = await markResponse.json().catch(() => ({}));
        throw new Error(error.error || "支付状态更新失败");
      }

      const unlockResponse = await fetch(`/api/v1/reports/${encodeURIComponent(s.reportId)}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportAccessToken: s.reportAccessToken, locale: s.locale || "zh-CN" }),
      });
      if (!unlockResponse.ok) {
        const error = await unlockResponse.json().catch(() => ({}));
        throw new Error(error.error || "完整报告解锁失败");
      }

      const unlocked = await unlockResponse.json();
      const premiumReport = unlocked.premiumReport || {};
      window.Store.set({
        locale: unlocked.locale || premiumReport.locale || s.locale || "zh-CN",
        isPaid: true,
        paidAt: Date.now(),
        premiumMentors: premiumReport.mentors || null,
        reportPageMentorGroups: premiumReport.reportPageMentorGroups || null,
        premiumAdviceItems: premiumReport.allAdviceItems || null,
        premiumKeywordBreakdown: premiumReport.keywordBreakdown || null,
        missingKeywordChecklist: premiumReport.missingKeywordChecklist || null,
        sectionFixPlan: premiumReport.sectionFixPlan || null,
        problemTags: premiumReport.problemTags || null,
        detailedSuggestions: premiumReport.detailedSuggestions || null,
        mentorLogoPool: premiumReport.mentorLogoPool || s.mentorLogoPool || null,
        companyInsiderTips: premiumReport.companyInsiderTips || [],
      });
      completeLoader("解锁完成！", "完整报告已生成，正在进入报告页…");
      setTimeout(() => { window.location.href = "/report"; }, 350);
    } catch (err) {
      hideLoader();
      btn.disabled = false;
      alert(err.message || "支付确认失败，请重试");
    }
  }, 1800);
}

function guardSubmitted() {
  const s = window.Store.get();
  if (!s.resumeName) window.location.href = "/";
}
function guardPaid() {
  const s = window.Store.get();
  if (!s.isPaid) window.location.href = "/result";
}

function buildMarkdown() {
  const M = window.MOCK || {};
  const s = window.Store.get();
  const sc = M.scores || {};
  const st = M.student || {};
  const lines = [];
  lines.push("# " + (st.school || "Resume") + " Diagnosis");
  lines.push("> Target: **" + (s.jobTitle || "") + "**");
  lines.push("> Source: MentorX x Vibe ID");
  lines.push("");
  lines.push("## ATS Score");
  lines.push("- ATS: " + (sc.ats || "N/A") + "%");
  lines.push("- Ranking: TOP " + (sc.rankingPercentile || "N/A") + "%");
  lines.push("- Salary: " + (sc.salaryNow || "N/A") + " ~ " + (sc.salaryTop || "N/A"));
  return lines.join("\n");
}
function stripHTML(html) { return String(html).replace(/<[^>]+>/g, ""); }
function exportReport() {
  const md = buildMarkdown();
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "MentorX-" + new Date().toISOString().slice(0,10) + ".md";
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast("Report downloaded");
}
function copyReport() {
  const md = buildMarkdown();
  if (navigator.clipboard) navigator.clipboard.writeText(md).then(() => toast("Copied"));
}

function toast(msg) {
  let t = document.querySelector(".__toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "__toast";
    t.style.cssText = "position:fixed;left:50%;bottom:96px;transform:translateX(-50%);background:var(--ink);color:var(--paper-warm);padding:12px 18px;border-radius:999px;font-size:13px;font-weight:500;z-index:200;max-width:90vw;text-align:center;opacity:0;transition:opacity .2s;pointer-events:none;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  clearTimeout(t.__hide);
  t.__hide = setTimeout(() => { t.style.opacity = "0"; }, 2400);
}

function initPage() {
  bindResumeInputMode();
  bindFileUpload();
  console.log("[App] ready");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}

window.submitResume = submitResume;
window.showLoader = showLoader;
window.updateLoaderProgress = updateLoaderProgress;
window.showLoaderError = showLoaderError;
window.hideLoader = hideLoader;
window.mockLogin = window.mockLogin || mockLogin;
window.mockPayment = mockPayment;
window.guardSubmitted = guardSubmitted;
window.guardPaid = guardPaid;
window.exportReport = exportReport;
window.copyReport = copyReport;
