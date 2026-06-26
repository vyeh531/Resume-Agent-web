(function () {
  const STORE_KEY = "resumeFixMVP";
  const DEFAULT_LOCALE = "zh-CN";
  const SUPPORTED = ["zh-CN", "en-US"];

  function normalizeLocale(value) {
    const raw = String(value || "").trim().toLowerCase().replace("_", "-");
    if (raw === "en" || raw.startsWith("en-")) return "en-US";
    return "zh-CN";
  }

  function readStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}"); }
    catch { return {}; }
  }

  function writeStore(patch) {
    const next = { ...readStore(), ...patch };
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    return next;
  }

  function getLocale() {
    return normalizeLocale(readStore().locale || document.documentElement.lang || DEFAULT_LOCALE);
  }

  function setText(selector, text) {
    const el = document.querySelector(selector);
    if (el && text) el.textContent = text;
  }

  function setHtml(selector, html) {
    const el = document.querySelector(selector);
    if (el && html) el.innerHTML = html;
  }

  const EN_COPY = {
    home: {
      meta: "Version: Beta",
      seal: "Offer<br/>Ready",
      kicker: "International career search - 30-second diagnosis",
      h1: "<span class=\"hero-line\">Resume getting ignored?</span><em class=\"hero-line\">EdAIX mentors x AI</em><span class=\"hero-line\">Make it <span class=\"underline\">interview-ready</span>.</span>",
      lede: "1,300+ industry mentors and AI-powered analysis. Get a practical resume improvement plan in 30 seconds.",
      proof1: "Industry mentors",
      proof2: "Real coaching cases",
      proof3: "Initial diagnosis",
      uploadTitle: "Let EdAIX mentors review your resume",
      uploadLabel: "Resume",
      fileMode: "Upload file",
      textMode: "Paste resume text",
      fileMain: "Click or drag to upload your resume",
      fileSub: "PDF - Word (.docx/.doc) - Plain text (.txt)",
      uploaded: "Uploaded",
      resumeHint: "If the PDF cannot be parsed, paste the resume text directly.",
      textLabel: "Resume text",
      textPlaceholder: "If PDF or Word parsing fails, paste your resume content here...",
      jobLabel: "Target role",
      jobOption: "-- Select target role --",
      jobHint: "Loading role list...",
      jdLabel: "Target job description",
      jdPlaceholder: "Paste the full JD for a more precise diagnosis...",
      jdHint: "Supports LinkedIn / Indeed / Glassdoor / Handshake and other global job descriptions.",
      submit: "Generate diagnosis in 30 seconds",
      credibilityTitle: "10 years of real coaching data, built for global careers.",
      credibilityDesc: "EdAIX has supported international career coaching since 2015, with <b style=\"color:var(--ink);font-weight:700\">1,300+</b> industry mentors and <b style=\"color:var(--ink);font-weight:700\">30,000+</b> real coaching cases. Every recommendation is grounded in practical hiring patterns, not generic templates.",
      tags: ["Industry mentors", "10-year dataset", "Custom diagnosis"],
      cardTitles: ["Mentors from top companies", "Driven by real coaching data", "Matched to your background"],
      cardText: [
        "Current and former mentors from Google, Amazon, Goldman Sachs, McKinsey, and other global firms across North America, Europe, and Asia.",
        "Each recommendation reflects patterns from 30,000+ coaching cases, so the guidance is practical instead of purely AI-generated.",
        "The system matches your industry, target role, and background to relevant mentor experience, including CPT/OPT and H-1B scenarios."
      ],
      footnote: "Powered by <span>Vibe ID</span> - EdAIX<br/>(c) 2026 - Your resume is private and used only for this diagnosis.",
    },
    result: {
      step: "1 / 2 · Diagnosis complete",
      status: "Diagnosis complete · 4 mentors have reviewed your resume",
      conclusion: "You still have a clear gap from the target role. Prioritize JD keywords, skill evidence, and measurable outcomes.",
      loadingResume: "Reading resume information...",
      targetLoading: "Target: loading",
      headline: "You still have a gap before reaching the top offer line.",
      issues: ["JD keyword coverage is too low", "Skill match is not direct enough", "Experience bullets need more measurable impact"],
      viewAdvice: "View recommendations",
      viewScore: "View score details",
      dimensions: "Data dimensions",
      dimensionsTitle: "See your position from 4 angles",
      dimensionsDesc: "Each dimension expands directly so you can scan the summary and risk.",
      freeTitle: "Mentor advice preview",
      freeDesc: "Matched from EdAIX's mentor knowledge base and prioritized for your resume risks.",
      unlockTitle: "More mentor recommendations",
      unlockDesc: "Unlock the full mentor plan, JD keyword placement guidance, and exportable rewrite report.",
      unlockBtn: "$49 Unlock now",
      risk: "High risk",
      topIssues: "Top issues",
      metricLabels: ["JD match", "ATS readability", "Salary growth", "AI impact trend"],
      metricCaptions: ["Keyword coverage is low", "Mainstream ATS parsing", "5-year upside", "Calibrating"],
      atsNum: "ATS diagnosis",
      atsTitle: "ATS system score",
      atsProblems: "Key issues",
      atsSuggestions: "Priority recommendations",
      keywordTitle: "JD keyword checklist",
      keywordDesc: "These are keywords detected from the JD. Prioritize missing items in Summary, Skills, or Experience.",
      covered: "Covered",
      needsWork: "Needs work",
      expand: "View more ↓",
      freeNum: "Free preview - 3 recommendations",
      lockedNum: "Unlock - 9 deeper recommendations",
      lockedSuffix: "(paid unlock)",
      priceWas: "Was ¥199",
      perks: [
        "Full recommendations from 4 industry mentors",
        "Full JD keyword checklist + placement guidance",
        "Exportable .md report for ChatGPT / Claude resume rewriting"
      ],
      footnote: "Diagnosis produced by real mentors + AI. Not an offer guarantee.<br/>Powered by <span>Vibe ID</span> - EdAIX",
    },
    report: {
      meta: "Full report",
      ready: "Your full report is ready",
      reportTitle: "Full diagnosis report",
      reportDesc: "Upload this PDF to ChatGPT, Claude, or another LLM with your original resume to produce an application-ready version.",
      download: "Download PDF report",
      prompt: "Download AI rewrite prompt pack",
      summaryReady: "Full report generated",
      targetDone: "Target role analysis complete",
      mentorTitle: "Every angle has been reviewed",
      insiderTitle: "Mentor notes: what these companies actually look for",
      serviceTitle: "Want to go further?",
    },
    payment: {
      meta: "4 / 5 · Unlock payment",
      back: "Back to diagnosis report",
      title: "Final step: unlock the full report",
      desc: "After payment, unlock the full diagnosis report, 4 mentor plans, JD keyword list, and AI resume rewrite prompt pack.",
      order: "Order summary",
      total: "Total",
      pay: "Amount due",
      scan: "Scan with WeChat to pay",
      original: "Was ¥199",
      discount: "Limited-time offer · 75% off",
      items: [
        ["Full recommendations from 4 industry mentors", "Up to 12"],
        ["Full JD keyword checklist", "Placement guidance included"],
        ["Full diagnosis report PDF", "Downloadable"],
        ["AI resume rewrite prompt pack", "ChatGPT / Claude"]
      ],
      method: "WeChat Pay",
      methodSub: "Scan the QR code above and confirm in WeChat",
      done: "I have completed payment",
      trust: ["Encrypted transaction", "Invoice available", "7-day refund policy"],
      foot: 'Payment issue? Contact support <a>edaix-support</a><br/>This order is provided by EdAIX',
    },
    analyzing: {
      meta: "Analyzing...",
      title: "Finding your resume opportunity areas",
      desc: "Analyzing your target JD, mentor knowledge base, and HR screening signals.",
      depth: "Deep analysis in progress",
      eta: "About 20-35 seconds",
      progress: "Analysis progress",
    },
    login: {
      meta: "2 / 5",
      title: "Sign in to view your report",
      sub: "Your analysis has started in the background. Sign in to view the result when it is ready.",
      resumeLoading: "Loading resume...",
      noResume: "No resume detected. Please return to the home page and upload one.",
      targetDefault: "Target role",
      targetPrefix: "Target role: ",
      targetFromJd: "Target role: analyzing from JD",
      analyzing: "Analyzing",
      progressTitle: "Report generation progress",
      progressStatus: "Scanning your resume highlights. Processing will continue after sign-in.",
      button: "Continue with WeChat",
      buttonReady: "Continue with WeChat - View report",
      buttonGenerating: "Generating report...",
      tip: "We will not publish your resume. All content is used only for this diagnosis.",
      sideTitle: "Report generation started\nProgress syncs after sign-in",
      method: "Secure WeChat sign-in",
      methodNote: "Used to sync your report. Your resume stays private.",
      foot: 'By signing in, you agree to the <a href="#">User Agreement</a> and <a href="#">Privacy Policy</a><br/>Need help? Contact support <span style="color:var(--rose)">edaix-support</span>',
    },
  };

  const ZH_COPY = {
    home: {
      meta: "Version: Beta",
      seal: "求职<br/>必胜",
      kicker: "留学求职专属 - 30 秒诊断",
      h1: "<span class=\"hero-line\">简历石沉大海?</span><em class=\"hero-line\">大厂导师 x 智慧核心</em><span class=\"hero-line\">联合帮你<span class=\"underline\">升级</span>简历。</span>",
      lede: "1,300+ 大厂导师实战经验 x AI 精准分析，30 秒拿到可落地的优化方案。",
      proof1: "大厂导师",
      proof2: "真实辅导样本",
      proof3: "初步诊断",
      uploadTitle: "把简历交给大厂导师",
      uploadLabel: "上传简历",
      fileMode: "上传档案",
      textMode: "文字输入简历",
      fileMain: "点击或拖拽上传简历",
      fileSub: "PDF - Word (.docx/.doc) - 纯文本 (.txt)",
      uploaded: "已上传",
      resumeHint: "如果 PDF 无法解析，也可以直接粘贴简历文本。",
      textLabel: "简历文本",
      textPlaceholder: "如果 PDF / Word 解析失败，可把简历内容粘贴到这里...",
      jobLabel: "目标岗位",
      jobOption: "-- 选择目标岗位 --",
      jobHint: "加载岗位列表中...",
      jdLabel: "目标岗位 JD",
      jdPlaceholder: "贴 JD 越完整，诊断越精准...",
      jdHint: "支持 LinkedIn / Indeed / Glassdoor / Handshake 等海外 JD",
      submit: "30 秒生成诊断报告",
      credibilityTitle: "10 年真实辅导数据，服务全球求职。",
      credibilityDesc: "EdAIX 自 2015 年深耕留学求职，拥有 <b style=\"color:var(--ink);font-weight:700\">1,300+</b> 大厂导师、<b style=\"color:var(--ink);font-weight:700\">30,000+</b> 场真实辅导。每条建议都从实战中提炼，不是通用模板。",
      tags: ["名企导师", "十年数据", "定制诊断"],
      cardTitles: ["导师来自顶级企业", "真实辅导数据驱动", "精准匹配你的背景"],
      cardText: [
        "Google、Amazon、Goldman Sachs、McKinsey 等全球名企在职导师，覆盖北美、欧洲、中国。",
        "每条建议背后是 30,000+ 场真实辅导积累的成功模式，不是 AI 凭空生成。",
        "按行业、岗位、背景智能匹配最相关的导师经验，覆盖 CPT/OPT、H-1B 等留学生场景。"
      ],
      footnote: "Powered by <span>Vibe ID</span> - EdAIX<br/>(c) 2026 - 不会公开你的简历内容，仅本次诊断使用"
    },
    login: {
      meta: "2 / 5",
      title: "登录领取报告",
      sub: "分析已在后台开始，登录后即可查看结果",
      resumeLoading: "简历加载中...",
      noResume: "未检测到简历，请返回首页上传",
      targetDefault: "目标岗位",
      targetPrefix: "目标岗位：",
      targetFromJd: "目标岗位：根据 JD 分析",
      analyzing: "分析中",
      progressTitle: "报告生成进度",
      progressStatus: "正在扫描你的履历亮点，登录时会继续处理。",
      button: "微信一键登录",
      buttonReady: "微信一键登录 - 查看报告",
      buttonGenerating: "报告生成中...",
      tip: "我们不会公开你的简历，所有内容仅用于本次诊断。",
      foot: '登录代表你同意 <a href="#">《用户协议》</a> 和 <a href="#">《隐私政策》</a><br/>遇到问题？联系客服 <span style="color:var(--rose)">edaix-support</span>',
    }
  };

  ZH_COPY.result = {
    step: "1 / 2 · 诊断完成",
    status: "诊断完成 · 4 位导师已读完你的简历",
    conclusion: "距离目标岗位仍有明显差距，优先补齐岗位关键词、技能证据和量化成果。",
    loadingResume: "正在读取简历信息...",
    targetLoading: "目标: 读取中",
    headline: "离顶级 Offer 线 <span class=\"gap\" id=\"headlineSalaryTop\">--</span> 仍有差距。",
    issues: ["JD 关键词覆盖不足", "技能匹配与目标岗位不够直接", "经历中的量化结果偏少"],
    viewAdvice: "查看优化建议",
    viewScore: "查看评分细节",
    dimensions: "数据维度",
    dimensionsTitle: "从 4 个角度看你的位置",
    dimensionsDesc: "四个维度直接展开，看摘要和风险，不需要再切换。",
    freeTitle: "导师建议预览",
    freeDesc: "由 EdAIX 导师知识库中的真实大厂经验交叉匹配，系统会优先挑出最贴合你简历问题的建议。",
    unlockTitle: "更多导师建议",
    unlockDesc: "融合 4 位导师完整建议、JD Keyword 放置建议和可导出的改写报告，不再分散成多个解锁入口。",
    unlockBtn: "¥ 49 立即解锁",
    risk: "高风险",
    topIssues: "Top issues",
    metricLabels: ["JD 匹配度", "ATS 可读性", "Salary · 薪资成长", "AI 影响趋势"],
    metricCaptions: ["关键词覆盖偏低", "主流系统识别", "5年上限", "待校准"],
    atsNum: "ATS 诊断",
    atsTitle: "ATS System 评分",
    atsProblems: "关键问题",
    atsSuggestions: "优先建议",
    keywordTitle: "JD Keyword 清单",
    keywordDesc: "这些是系统从 JD 中识别出的关键词。优先把待补强项写进 Summary、Skills 或 Experience。",
    covered: "已具备",
    needsWork: "待补强",
    expand: "查看更多 ↓",
    freeNum: "免费试读 · 3 条建议",
    lockedNum: "付费解锁 · 9 条深度建议",
    lockedSuffix: "(付费解锁)",
    priceWas: "原价 ¥199",
    perks: [
      "4 位大厂导师完整建议",
      "完整 JD Keyword 清单 + 放置建议",
      "报告导出 .md，可直接给 ChatGPT / Claude 改简历"
    ],
    footnote: "诊断由 4 位真实导师 + AI 联合产出 · 不构成 Offer 承诺<br/>Powered by <span>Vibe ID</span> - EdAIX",
  };

  Object.assign(ZH_COPY.home, {
    seal: "求职<br/>必胜",
    kicker: "留学求职专属 - 30 秒诊断",
    h1: "<span class=\"hero-line\">简历石沉大海?</span><em class=\"hero-line\">大厂导师 x 智慧核心</em><span class=\"hero-line\">联合帮你<span class=\"underline\">升级</span>简历。</span>",
    lede: "1,300+ 大厂导师实战经验 x AI 精准分析，30 秒拿到可落地的优化方案。",
    proof1: "大厂导师",
    proof2: "真实辅导样本",
    proof3: "初步诊断",
    uploadTitle: "把简历交给大厂导师",
    uploadLabel: "上传简历",
    fileMode: "上传档案",
    textMode: "文字输入简历",
    fileMain: "点击或拖拽上传简历",
    fileSub: "PDF - Word (.docx/.doc) - 纯文本 (.txt)",
    uploaded: "已上传",
    resumeHint: "如果 PDF 无法解析，也可以直接粘贴简历文本。",
    textLabel: "简历文本",
    textPlaceholder: "如果 PDF / Word 解析失败，可把简历内容粘贴到这里...",
    jobLabel: "目标岗位",
    jobOption: "-- 选择目标岗位 --",
    jobHint: "加载岗位列表中...",
    jdLabel: "目标岗位 JD",
    jdPlaceholder: "贴 JD 越完整，诊断越精准...",
    jdHint: "支持 LinkedIn / Indeed / Glassdoor / Handshake 等海外 JD",
    submit: "30 秒生成诊断报告",
    credibilityTitle: "10 年真实辅导数据，服务全球求职。",
    credibilityDesc: "EdAIX 自 2015 年深耕留学求职，拥有 <b style=\"color:var(--ink);font-weight:700\">1,300+</b> 大厂导师、<b style=\"color:var(--ink);font-weight:700\">30,000+</b> 场真实辅导。每条建议都从实战中提炼，不是通用模板。",
    tags: ["名企导师", "十年数据", "定制诊断"],
    cardTitles: ["导师来自顶级企业", "真实辅导数据驱动", "精准匹配你的背景"],
    cardText: [
      "Google、Amazon、Goldman Sachs、McKinsey 等全球名企在职导师，覆盖北美、欧洲、中国。",
      "每条建议背后是 30,000+ 场真实辅导积累的成功模式，不是 AI 凭空生成。",
      "按行业、岗位、背景智能匹配最相关的导师经验，覆盖 CPT/OPT、H-1B 等留学生场景。"
    ],
    footnote: "Powered by <span>Vibe ID</span> - EdAIX<br/>(c) 2026 - 不会公开你的简历内容，仅本次诊断使用"
  });

  Object.assign(ZH_COPY.login, {
    title: "登录领取报告",
    sub: "分析已在后台开始，登录后即可查看结果",
    resumeLoading: "简历加载中...",
    noResume: "未检测到简历，请返回首页上传",
    targetDefault: "目标岗位",
    targetPrefix: "目标岗位：",
    targetFromJd: "目标岗位：根据 JD 分析",
    analyzing: "分析中",
    progressTitle: "报告生成进度",
    progressStatus: "正在扫描你的履历亮点，登录时会继续处理。",
    button: "微信一键登录",
    buttonReady: "微信一键登录 - 查看报告",
    buttonGenerating: "报告生成中...",
    tip: "我们不会公开你的简历，所有内容仅用于本次诊断。",
    sideTitle: "报告已开始生成\n登录后自动同步进度",
    method: "微信安全登录",
    methodNote: "用于同步报告，不会公开简历",
    foot: '登录代表你同意 <a href="#">《用户协议》</a> 和 <a href="#">《隐私政策》</a><br/>遇到问题？联系客服 <span style="color:var(--rose)">edaix-support</span>'
  });

  ZH_COPY.payment = {
    meta: "4 / 5 · 解锁支付",
    back: "返回诊断报告",
    title: "最后一步，解锁完整报告",
    desc: "支付完成后立即解锁完整诊断报告、4 位导师建议、JD Keyword 清单和 AI 改简历指令包。",
    order: "订单内容",
    total: "合计",
    pay: "应付金额",
    scan: "微信扫码完成支付",
    original: "原价 ¥199",
    discount: "秋招特价 · 限时 75% off",
    items: [
      ["4 位行业导师完整建议", "最多 12 条"],
      ["完整 JD Keyword 清单", "含放置建议"],
      ["完整诊断报告 PDF", "可下载"],
      ["AI 改简历指令包", "ChatGPT / Claude"]
    ],
    method: "微信支付",
    methodSub: "扫上方二维码，在微信中确认",
    done: "我已扫码完成支付",
    trust: ["加密交易", "支持开发票", "7 天无理由退款"],
    foot: '支付遇到问题？联系客服 <a>edaix-support</a><br/>本订单由 EdAIX 提供',
  };

  function setDirectButtonText(button, text) {
    if (!button || !text) return;
    let textNode = null;
    button.childNodes.forEach((node) => {
      if (node.nodeType === 3 && String(node.nodeValue || "").trim()) textNode = node;
    });
    if (textNode) textNode.nodeValue = " " + text;
    else button.appendChild(document.createTextNode(" " + text));
  }

  function applyLoginCopy(copy) {
    setText(".brand-meta", copy.meta);
    setText(".login-title", copy.title);
    setText(".login-sub", copy.sub);
    const resumeName = document.getElementById("resumeFileName");
    if (resumeName && /loading|加载|未检测|no resume|\u00c2|\u00c3|\u00e6|\u00e7|\u00e8|\u00e5|\u00e4|\u00f0/i.test(resumeName.textContent || "")) {
      resumeName.textContent = copy.resumeLoading;
    }
    const resumeJob = document.getElementById("resumeJobTitle");
    if (resumeJob) {
      const currentJob = String(resumeJob.textContent || "").trim();
      const actualTarget = currentJob
        .replace(/^Target role\s*[:：]\s*/i, "")
        .replace(/^目标岗位\s*[:：]\s*/i, "")
        .trim();
      const isPlaceholder = !actualTarget || /target role|目标岗位|analyzing from jd|根据\s*JD|select target role|选择目标岗位|请选择/i.test(actualTarget);
      if (isPlaceholder) {
        resumeJob.textContent = copy.targetDefault;
      } else if (copy.targetPrefix) {
        resumeJob.textContent = copy.targetPrefix + actualTarget;
      }
    }
    const pill = document.getElementById("analysisPill");
    if (pill && !/ready|failed|已完成|失败/i.test(pill.textContent || "")) {
      pill.innerHTML = '<span class="dot"></span>' + copy.analyzing;
    }
    setText(".login-analysis-row strong", copy.progressTitle);
    setText("#loginProgressStatus", copy.progressStatus);
    setDirectButtonText(document.getElementById("wechatLoginButton"), copy.button);
    const loginWrap = document.querySelector(".login-page .login-wrap");
    if (loginWrap && copy.sideTitle) loginWrap.setAttribute("data-login-side-title", copy.sideTitle);
    const loginIcon = document.querySelector(".login-page .wechat-icon");
    if (loginIcon && copy.method) loginIcon.setAttribute("data-login-method", copy.method);
    if (loginIcon && copy.methodNote) loginIcon.setAttribute("data-login-method-note", copy.methodNote);
    const tip = document.querySelector(".login-tip span:last-child");
    if (tip) tip.textContent = copy.tip;
    setHtml(".login-foot", copy.foot);
  }

  function applyHomeCopy(copy) {
    setText(".brand-meta", copy.meta);
    setHtml(".seal-inner", copy.seal);
    setHtml(".hero-kicker", '<span class="dot"></span> ' + copy.kicker);
    setHtml(".hero h1", copy.h1);
    setText(".hero .lede", copy.lede);
    const proof = document.querySelectorAll(".hero-proof span");
    if (proof[0]) proof[0].textContent = copy.proof1;
    if (proof[1]) proof[1].textContent = copy.proof2;
    if (proof[2]) proof[2].textContent = copy.proof3;
    setText(".upload-section .section-title", copy.uploadTitle);
    setText(".resume-source-group .input-label", copy.uploadLabel);
    const modes = document.querySelectorAll(".resume-source-option span:last-child");
    if (modes[0]) modes[0].textContent = copy.fileMode;
    if (modes[1]) modes[1].textContent = copy.textMode;
    setText(".fu-main", copy.fileMain);
    setText(".fu-sub", copy.fileSub);
    if (copy.uploaded) {
      const uploaded = document.querySelector(".fu-success > div:last-child");
      if (uploaded) uploaded.lastChild.textContent = copy.uploaded;
    }
    setText(".resume-source-group .input-hint", copy.resumeHint);
    const labels = document.querySelectorAll(".input-group > .input-label");
    if (labels[1]) labels[1].textContent = copy.textLabel;
    if (labels[2]) labels[2].textContent = copy.jobLabel;
    if (labels[3]) labels[3].textContent = copy.jdLabel;
    const resumeText = document.querySelector('textarea[name="resumeText"]');
    if (resumeText && copy.textPlaceholder) resumeText.placeholder = copy.textPlaceholder;
    const jobOption = document.querySelector("#jobSelect option[value='']");
    if (jobOption && copy.jobOption) jobOption.textContent = copy.jobOption;
    setText("#jobSelectHint", copy.jobHint);
    const jd = document.querySelector('textarea[name="jd"]');
    if (jd && copy.jdPlaceholder) jd.placeholder = copy.jdPlaceholder;
    const jdHint = document.querySelectorAll(".input-group .input-hint")[2];
    if (jdHint && copy.jdHint) jdHint.textContent = copy.jdHint;
    setText('button[type="submit"]', copy.submit + " ->");
    setText(".credibility-section .section-title", copy.credibilityTitle);
    if (copy.credibilityDesc) setHtml(".credibility-section .section-desc", copy.credibilityDesc);
    const tags = document.querySelectorAll(".philo-card .tag");
    const cardTitles = document.querySelectorAll(".philo-card h3");
    const cardText = document.querySelectorAll(".philo-card p");
    (copy.tags || []).forEach((text, i) => { if (tags[i]) tags[i].textContent = text; });
    (copy.cardTitles || []).forEach((text, i) => { if (cardTitles[i]) cardTitles[i].textContent = text; });
    (copy.cardText || []).forEach((text, i) => { if (cardText[i]) cardText[i].textContent = text; });
    if (copy.footnote) setHtml(".footnote", copy.footnote);
  }

  function applyResultCopy(copy) {
    setText(".result-stepper, .result-header .brand-meta, .mobile-result-page .brand-meta", copy.step);
    setText(".result-status-banner div:last-child, .mobile-result-page .banner div:last-child", copy.status);
    setText(".result-risk-badge-warn", copy.risk);
    setText(".result-score-conclusion", copy.conclusion);
    const studentInfo = document.querySelector("#studentInfo");
    if (studentInfo && /reading|正在|resume information/i.test(studentInfo.textContent || "")) studentInfo.textContent = copy.loadingResume;
    const targetJob = document.querySelector("#targetJob");
    if (targetJob && /target|目标/i.test(targetJob.textContent || "")) {
      const currentTarget = String(targetJob.textContent || "");
      if (copy === EN_COPY.result && /^目标[:：]/.test(currentTarget)) {
        targetJob.textContent = currentTarget.replace(/^目标[:：]\s*/, "Target: ");
      } else if (copy === ZH_COPY.result && /^Target:/i.test(currentTarget)) {
        targetJob.textContent = currentTarget.replace(/^Target:\s*/i, "目标: ");
      } else if (/loading|读取/i.test(currentTarget)) {
        targetJob.textContent = copy.targetLoading;
      }
    }
    if (copy.headline) setHtml("#headline", copy.headline);
    const issueLabel = document.querySelector(".result-issue-list > span");
    if (issueLabel) issueLabel.textContent = copy.topIssues;
    document.querySelectorAll(".result-issue-list li").forEach((li, i) => { if (copy.issues[i]) li.textContent = copy.issues[i]; });
    const actions = document.querySelectorAll(".result-hero-actions .btn");
    if (actions[0]) actions[0].textContent = copy.viewAdvice;
    if (actions[1]) actions[1].textContent = copy.viewScore;

    setText(".result-metrics-panel .section-num, .mobile-result-page .section:nth-of-type(2) .section-num", copy.dimensions);
    setText(".result-metrics-panel .section-title, .mobile-result-page .section:nth-of-type(2) .section-title", copy.dimensionsTitle);
    setText(".result-metrics-panel .section-desc, .mobile-result-page .section:nth-of-type(2) .section-desc", copy.dimensionsDesc);
    document.querySelectorAll(".tile-label").forEach((el, i) => {
      const target = el.querySelector("span:first-child") || el;
      if (copy.metricLabels[i]) target.textContent = copy.metricLabels[i];
    });
    document.querySelectorAll(".tile-caption").forEach((el, i) => {
      if (!copy.metricCaptions[i]) return;
      if (i === 2 && el.querySelector("#salaryTop")) {
        el.firstChild.textContent = copy.metricCaptions[i] + " ";
      } else {
        const dynamic = el.querySelector("#admitRate, #atsRiskCaption");
        if (dynamic) dynamic.textContent = copy.metricCaptions[i];
        else el.textContent = copy.metricCaptions[i];
      }
    });

    setText("#atsDetailSection .section-num", copy.atsNum);
    setText("#atsDetailSection .section-title", copy.atsTitle);
    const problemSummary = document.querySelector("#atsProblemsDetails summary span:first-child");
    if (problemSummary) problemSummary.textContent = copy.atsProblems;
    const suggestionSummary = document.querySelector("#atsSuggestionsDetails summary span:first-child");
    if (suggestionSummary) suggestionSummary.textContent = copy.atsSuggestions;

    setText("#skillSectionTitle", copy.keywordTitle);
    const skillScore = document.querySelector(".skill-score small:first-child");
    if (skillScore) skillScore.textContent = copy.covered + " ";
    setText("#skillSectionDesc", copy.keywordDesc);
    const legend = document.querySelectorAll(".skill-legend span");
    if (legend[0]) legend[0].lastChild.textContent = copy.covered;
    if (legend[1]) legend[1].lastChild.textContent = copy.needsWork;
    setText("#skillExpandToggle", copy.expand);

    const freePanel = document.querySelector(".result-mentor-free-panel, .mobile-result-page .section:has(#mentorFree)");
    if (freePanel) {
      const num = freePanel.querySelector(".section-num");
      const title = freePanel.querySelector(".section-title");
      const desc = freePanel.querySelector(".section-desc");
      if (num) num.textContent = copy.freeNum;
      if (title) title.textContent = copy.freeTitle;
      if (desc) desc.textContent = copy.freeDesc;
    }
    const unlockPanel = document.querySelector(".result-mentor-unlock-card, .mobile-result-page .section:has(#lockedMentorsArea)");
    if (unlockPanel) {
      const num = unlockPanel.querySelector(".section-num");
      const title = unlockPanel.querySelector(".section-title");
      const desc = unlockPanel.querySelector(".section-desc");
      if (num) num.textContent = copy.lockedNum;
      if (title) {
        title.childNodes.forEach((node) => { if (node.nodeType === 3) node.nodeValue = copy.unlockTitle + " "; });
        const suffix = title.querySelector(".text-mute");
        if (suffix) suffix.textContent = copy.lockedSuffix;
      }
      if (desc) desc.textContent = copy.unlockDesc;
      const was = unlockPanel.querySelector(".result-unlock-price small, .unlock-cta-price .was");
      if (was) was.textContent = copy.priceWas;
      unlockPanel.querySelectorAll(".result-unlock-perks li, .unlock-cta-perks li").forEach((li, i) => { if (copy.perks[i]) li.textContent = copy.perks[i]; });
      const unlockBtn = unlockPanel.querySelector(".result-unlock-button, .unlock-cta .btn");
      if (unlockBtn) unlockBtn.textContent = copy.unlockBtn + " →";
    }
    if (copy.footnote) setHtml(".result-page .footnote, .mobile-result-page .footnote", copy.footnote);
    if (copy === EN_COPY.result) translateResultFallbackTextToEnglish();
  }

  function applyPaymentCopy(copy) {
    setText(".brand-meta", copy.meta);
    setText(".pay-back", "← " + copy.back);
    setText(".payment-page > .section-title", copy.title);
    setText(".payment-page > .section-desc", copy.desc);
    setText(".pay-summary .label", copy.order);
    document.querySelectorAll(".pay-summary .item:not(.total)").forEach((item, i) => {
      const spans = item.querySelectorAll("span");
      if (spans[0] && copy.items?.[i]?.[0]) spans[0].textContent = copy.items[i][0];
      if (spans[1] && copy.items?.[i]?.[1]) spans[1].textContent = copy.items[i][1];
    });
    setText(".pay-summary .item.total span:first-child", copy.total);
    setText(".pay-amount-label", copy.pay);
    setText(".pay-was", copy.original);
    setText(".pay-discount", copy.discount);
    setText(".pay-scan", copy.scan);
    setText(".pay-method .label", copy.method);
    setText(".pay-method .sub", copy.methodSub);
    setText(".pay-card button.btn-jade", copy.done);
    document.querySelectorAll(".pay-trust span").forEach((span, i) => {
      if (copy.trust?.[i]) span.textContent = copy.trust[i];
    });
    if (copy.foot) setHtml(".pay-foot", copy.foot);
  }

  function applyReportFooterCopy(locale) {
    if (location.pathname !== "/report") return;
    const isEnglish = normalizeLocale(locale) === "en-US";
    const html = isEnglish
      ? 'Report generated by EdAIX mentors + AI. For reference only; not an offer guarantee.<br/>Powered by <span>Vibe ID</span> · EdAIX · Since 2015 · 1,300+ industry mentors'
      : '报告由 EdAIX 导师 + AI 联合生成 · 内容仅供参考，不构成 Offer 承诺<br/>Powered by <span>Vibe ID</span> · 蔓藤教育 · 2015 至今 · 1,300+ 大厂导师';
    document.querySelectorAll(".footnote").forEach((el) => {
      el.innerHTML = html;
    });
  }

  function translateResultFallbackTextToEnglish() {
    const replacements = new Map([
      ["开头定位", "Opening positioning"],
      ["補上結果數字", "Add outcome metrics"],
      ["补上结果数字", "Add outcome metrics"],
      ["这块可以先把经历讲完整。现在像是在说你参与过，但还没说明你具体推进了什么、产出了什么。", "First make this experience complete. Right now it says you participated, but it does not show what you drove or produced."],
      ["你不是没有材料，是一份简历同时想服务太多方向。建议先拆成 1-2 个版本，让每一版都能一眼看出目标岗位。", "You do have usable material, but this resume is trying to serve too many directions at once. Split it into one or two versions so each version makes the target role obvious."],
      ["把职责型 bullet 改成结果型表达：先写动作和方法，再补产出、影响或业务价值，让 HR 能判断你做出了什么。", "Rewrite responsibility-style bullets into outcome-oriented bullets: state the action and method first, then add output, impact, or business value so HR can judge what you delivered."],
      ["这条要把 impact 放到经历里，用数量、频率、规模或效率说明贡献，避免只写负责和参与。", "Put impact into the experience section. Use quantity, frequency, scale, or efficiency to show contribution instead of only saying responsible for or participated in."],
      ["结果表达会直接影响可信度；没有规模或变化，我只能按普通执行经历来理解。", "Outcome language directly affects credibility. Without scale or change, I can only read it as routine execution experience."],
      ["补上结果数字", "Add outcome metrics"],
      ["用指标说明实际贡献", "Use metrics to show real contribution"],
      ["把经历改成可衡量结果", "Rewrite experience into measurable outcomes"],
      ["强化 bullet 的结果表达", "Strengthen outcome language in bullets"],
      ["补上规模、频率和效率", "Add scale, frequency, and efficiency"],
      ["说明处理量与影响范围", "Clarify volume and impact scope"],
      ["把工作量写成可比较指标", "Turn workload into comparable metrics"],
      ["补上成果数字和规模", "Add outcome numbers and scale"],
      ["把职责写成项目证据", "Turn responsibilities into project evidence"],
      ["把职责与成果项目证据", "Turn responsibilities and outcomes into project evidence"],
      ["补强经历里的动作和交付", "Strengthen actions and deliverables in experience"],
      ["重写核心经历 bullet", "Rewrite core experience bullets"],
      ["补齐项目产出证据", "Add project output evidence"],
      ["统一简历结构与信息层级", "Unify resume structure and information hierarchy"],
      ["把技能词写成项目证据", "Turn skill terms into project evidence"],
      ["让关键词出现在真实项目里", "Show keywords in real projects"],
      ["补齐经历里的关键词证据", "Add keyword evidence in experience"],
      ["把 JD 关键词放回经历", "Put JD keywords back into experience"],
      ["补齐关键词匹配信号", "Strengthen keyword match signals"],
      ["校准 ATS 关键词", "Calibrate ATS keywords"],
      ["信息层级", "Information hierarchy"],
      ["Section 顺序", "Section order"],
      ["可读性", "Readability"],
      ["岗位描述关键词匹配仍有提升空间。", "JD keyword matching still has room to improve."],
      ["JD 关键词匹配", "JD keyword match"],
      ["已覆盖 / JD 关键词总数。", "Covered / total JD keywords."],
      ["已覆盖 / JD 关键词总数", "Covered / total JD keywords"],
      ["主要缺口", "Main gap"],
      ["下方 JD Keyword 清单已整理关键词与放置建议。", "The JD keyword checklist below organizes keywords and placement guidance."],
      ["完整清单可付费解锁查看。", "Unlock the full checklist to view all details."],
      ["ATS 总分", "ATS total score"],
      ["高风险", "High risk"],
      ["中风险", "Medium risk"],
      ["低风险", "Low risk"],
      ["当前赛道参考", "Current track benchmark"],
      ["基于此方向与全美市场估算。", "Estimated from this track and the US market."],
      ["3 年成长区间", "3-year growth range"],
      ["若持续积累目标岗位相关经验和可验证成果，3 年内可参考这个区间。", "If you keep building relevant experience and verifiable outcomes, this is a reasonable 3-year reference range."],
      ["5 年成长区间", "5-year growth range"],
      ["代表同类岗位中经验更成熟、职责更完整时的市场参考。", "A market reference for similar roles with more mature experience and broader ownership."],
      ["同赛道高分位", "High percentile in this track"],
      ["数据来源：美国官方职业薪资资料（BLS/O*NET），按相近岗位赛道估算。", "Source: US official salary data (BLS/O*NET), estimated from adjacent role tracks."],
      ["中等影响", "Medium impact"],
      ["容易被自动化", "Easier to automate"],
      ["资料整理、初稿生成、状态同步", "Data organization, first drafts, status updates"],
      ["初稿会越来越容易生成，难的是判断方向对不对、内容有没有用。", "First drafts are getting easier to generate; the harder part is judging direction and usefulness."],
      ["更有价值的能力", "More valuable abilities"],
      ["方向判断、优先级取舍、跨团队推动、结果负责", "Direction judgment, prioritization, cross-team execution, ownership of outcomes"],
      ["越是需要协调人、处理例外、推动落地的部分，越值得写清楚。", "The more a task requires coordination, exceptions, and execution, the more clearly it should be written."],
      ["简历应强化", "Resume should emphasize"],
      ["策略选择、指标变化、项目结果、团队协作", "Strategy choices, metric changes, project results, teamwork"],
      ["写成具体故事会更好：当时遇到什么问题，你怎么处理，最后改善了什么。", "Make it a concrete story: what problem you faced, how you handled it, and what improved."],
      ["格式规范", "Format"],
      ["基本资料", "Profile"],
      ["内容质量", "Content quality"],
      ["技能匹配", "Skill match"],
      ["市场适配", "Market fit"],
      ["经验匹配", "Experience match"],
      ["经历中的量化结果偏少，建议补充百分比或规模数据。", "Experience bullets need more quantified results; add percentages or scale where possible."],
      ["简历整体结构可以进一步围绕目标岗位强化。", "The overall resume structure can be aligned more tightly with the target role."],
      ["查看更多", "View more"],
      ["收起", "Collapse"],
      ["更多岗位匹配风险", "More role-match risks"],
      ["更多 ATS 细分问题", "More ATS detail issues"],
      ["完整问题优先级排序", "Full prioritized issue list"],
      ["解锁", "Unlock"],
      ["全部 4 位导师", "all 4 mentors"],
      ["完整改写报告", "the full rewrite report"],
      ["含完整 JD Keyword 清单", "Includes full JD keyword checklist"],
      ["解锁更多内容", "Unlock more"],
      ["由 EdAIX 导师知识库中的真实大厂经验交叉匹配，系统会优先挑出最贴合你简历问题的建议。", "Matched from EdAIX's mentor knowledge base and prioritized for your resume risks."],
      ["补充", "Supplemental"],
      ["必改", "Must fix"],
      ["建议改", "Recommended"],
      ["你的现状", "Current state"],
      ["建议你做", "Recommended action"],
      ["补充视角", "Additional perspective"],
      ["导师", "Mentor"],
      ["把经历改成动作和结果", "Rewrite experience into actions and outcomes"],
      ["把目标岗位关键词写进经历证据", "Put target-role keywords into experience evidence"],
      ["现在的经历描述容易停留在职责层，和目标岗位 JD 的关键词连接不够明确。", "Current experience bullets stay too close to responsibilities and do not clearly connect to target JD keywords."],
      ["挑 2 到 3 段最相关经历，把 JD 里的核心技能词改写成项目动作、工具和结果，而不是只放在技能列表。", "Pick 2-3 of the most relevant experiences and turn core JD skills into project actions, tools, and outcomes instead of leaving them only in Skills."],
      ["导师会先看关键词有没有被真实项目承接；只有出现在经历证据里，才像是你真的做过。", "Mentors first check whether keywords are backed by real project evidence; keywords feel credible only when they appear in experience bullets."],
      ["HR 快速扫简历时，会优先匹配岗位关键词和最近经历；关键词只堆在技能栏，可信度会比较弱。", "When HR scans quickly, they match role keywords against recent experience; keywords only stacked in Skills feel less credible."],
      ["把成果写成可判断的业务影响", "Write outcomes as clear business impact"],
      ["部分 bullet 目前能看出你做了什么，但还不够容易判断影响范围、质量或结果。", "Some bullets show what you did, but the scope, quality, or result is still hard to judge."],
      ["每段重点经历至少补一个结果指标：规模、转化、效率、准确率、成本、用户量或上线影响都可以。", "Add at least one outcome metric to each key experience: scale, conversion, efficiency, accuracy, cost, users, or launch impact."],
      ["大厂导师会用结果判断候选人的 ownership；没有量化结果时，很难判断你只是参与还是主导。", "Industry mentors use outcomes to judge ownership; without quantified results, it is hard to tell whether you participated or led."],
      ["HR 会把结果数字当作筛选信号，它能让你的经历从普通执行描述里跳出来。", "HR treats result numbers as screening signals; they help your experience stand out from routine task descriptions."],
      ["9 条付费深度建议", "9 paid deep-dive recommendations"],
      ["暂无导师建议，请返回首页重新提交简历。", "No mentor recommendations yet. Please return to the home page and submit again."],
    ]);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const raw = node.nodeValue || "";
      const trimmed = raw.replace(/\s+/g, " ").trim();
      if (!trimmed || !/[\u4e00-\u9fff]/.test(trimmed)) return;
      const replacement = replacements.get(trimmed);
      if (replacement) {
        node.nodeValue = raw.replace(trimmed, replacement);
        return;
      }
      const hrActionMatch = trimmed.match(/^HR 会把这里当作快速筛选信号；建议优先处理「(.+)」。$/);
      if (hrActionMatch) {
        node.nodeValue = raw.replace(trimmed, `HR treats this as a fast screening signal. Prioritize "${hrActionMatch[1]}".`);
        return;
      }
      const roleFocusMatch = trimmed.match(/^简历整体对\s*(.+?)\s*的主线还不够集中，ATS 和 HR 可能需要额外判断你的目标方向。$/);
      if (roleFocusMatch) {
        node.nodeValue = raw.replace(trimmed, `The resume storyline is not focused enough on ${roleFocusMatch[1]}, so ATS and HR may need extra effort to infer your target direction.`);
        return;
      }
      const summaryActionMatch = trimmed.match(/^在 Summary 第一或第二句自然写出\s*(.+?)\s*，并紧接一句连接\s*(.+?)\s*或最相关项目证据。$/);
      if (summaryActionMatch) {
        node.nodeValue = raw.replace(trimmed, `Naturally state ${summaryActionMatch[1]} in the first or second Summary sentence, then add one sentence connecting ${summaryActionMatch[2]} or the most relevant project evidence.`);
        return;
      }
      const reorderMatch = trimmed.match(/^围绕\s*(.+?)\s*重排 Summary、Skills 和最靠前的经历，把最相关的职责、关键词和结果证据放到前面，弱相关内容收住。$/);
      if (reorderMatch) {
        node.nodeValue = raw.replace(trimmed, `Reorder Summary, Skills, and the earliest experience around ${reorderMatch[1]}. Move the most relevant responsibilities, keywords, and outcome evidence forward, and reduce weakly related content.`);
        return;
      }
      const frontloadMatch = trimmed.match(/^把最贴近\s*(.+?)\s*的经历、项目和技能放到更靠前位置；弱相关内容只保留能证明协作、交付或基础职业能力的部分。$/);
      if (frontloadMatch) {
        node.nodeValue = raw.replace(trimmed, `Move the experience, projects, and skills closest to ${frontloadMatch[1]} into a more prominent position. Keep weakly related content only when it proves collaboration, delivery, or basic professional ability.`);
        return;
      }
      const frontloadBulletMatch = trimmed.match(/^把最贴近\s*(.+?)\s*的经历或项目放到更靠前位置，并给它多\s*1-2\s*条 bullet；弱相关经历只保留能证明\s*(.+?)\s*、协作或基础职业能力的内容。$/);
      if (frontloadBulletMatch) {
        node.nodeValue = raw.replace(trimmed, `Move the experience or project closest to ${frontloadBulletMatch[1]} into a more prominent position and give it 1-2 more bullets. Keep weakly related experience only when it proves ${frontloadBulletMatch[2]}, collaboration, or basic professional ability.`);
        return;
      }
      const structuralFallbacks = new Map([
        ["简历里不同经历的重要性还没有拉开，读者可能会把弱相关内容和核心经历看成同等重要。", "The resume does not clearly separate the importance of different experiences, so readers may treat weakly related content and core experience as equally important."],
        ["简历还有部分结构性优化空间，重要信息和弱相关内容的层级不够分明。", "The resume still has structural room to improve; important information and weakly related content are not clearly prioritized."],
        ["这里先做减法会很有效。把最相关的内容往前放，弱相关内容收住，整份简历会更像在服务同一个目标岗位。", "Reducing clutter here will help. Move the most relevant content forward and tighten weakly related content so the whole resume serves one target role."],
        ["完整报告不只改关键词，也要让读者第一眼看到最相关证据。", "The full report is not only about keywords; it should also make the most relevant evidence visible at first glance."],
        ["完整报告里除了改关键词，也要处理信息权重。越靠前、越详细的经历，越会影响第一判断。", "Beyond keywords, the full report should also fix information hierarchy. Earlier and more detailed experience has the strongest impact on the first impression."],
        ["我不会平均阅读每个 section；越靠前、越清楚的内容越影响第一判断。", "I do not read every section equally; earlier and clearer content has the strongest impact on my first impression."],
        ["我不会平均阅读每个 section；越靠前的内容越决定我怎么理解你。", "I do not read every section equally; earlier content largely determines how I understand your profile."],
        ["我不会平均阅读每段经历；最前面的经历如果不够相关，后面的亮点很可能来不及被看到。", "I do not read every experience equally; if the first experience is not relevant enough, later strengths may never get noticed."],
      ]);
      const structuralReplacement = structuralFallbacks.get(trimmed);
      if (structuralReplacement) {
        node.nodeValue = raw.replace(trimmed, structuralReplacement);
      }
    });
  }

  function translateReportFallbackTextToEnglish() {
    const replacements = new Map([
      ["完整报告", "Full report"],
      ["完整报告已为你生成", "Your full report is ready"],
      ["完整诊断报告", "Full diagnosis report"],
      ["把这份 PDF 整段喂给 ChatGPT / Claude / 豆包 等任意 LLM，基于 4 位大厂导师建议自动重写你的简历，一键产出可投递的新版本。", "Upload this PDF to ChatGPT, Claude, or another LLM with your original resume to produce an application-ready version."],
      ["把这份 PDF 整段喂给 ChatGPT / Claude / 豆包 等任意 LLM，基于 4 位大厂导师建议自动重写你的简历——不用一句句改，一键产出可投递的新版本。", "Upload this PDF to ChatGPT, Claude, or another LLM with your original resume to produce an application-ready version."],
      ["先保存完整报告，再下载 AI 改简历指令包。", "Save the full report first, then download the AI rewrite prompt pack."],
      ["下载 PDF 报告", "Download PDF report"],
      ["下载 AI 改简历指令包", "Download AI rewrite prompt pack"],
      ["上传指令包 + 原简历，让 AI 按关键词和导师建议直接重写。", "Upload the prompt pack with your original resume so AI can rewrite it using the keywords and mentor recommendations."],
      ["ATS 通过率 +30%，自动匹配 JD 技能", "Improve ATS readiness and align with JD skills"],
      ["面试邀约率 翻倍，简历讲对 PM 的语言", "Make the resume speak the language recruiters expect"],
      ["1 份报告反复用，投每个公司都能精准对齐", "Reuse the report to tailor each application"],
      ["整体诊断", "Overall diagnosis"],
      ["先看大盘", "Start with the big picture"],
      ["简历评分", "Resume score"],
      ["高风险", "High risk"],
      ["中风险", "Medium risk"],
      ["低风险", "Low risk"],
      ["距离目标岗位仍有明显差距，优先补齐岗位关键词、技能证据和量化成果。", "You still have a clear gap from the target role. Prioritize JD keywords, skill evidence, and measurable outcomes."],
      ["完整报告已生成", "Full report generated"],
      ["目标岗位分析完成", "Target role analysis complete"],
      ["离顶级 Offer 线 待校准 仍有差距。", "You still have a gap before reaching the top offer line."],
      ["查看导师建议", "View mentor recommendations"],
      ["查看评分细节", "View score details"],
      ["JD Keyword 清单", "JD keyword checklist"],
      ["这些是系统从 JD 中识别出的关键词。优先把待补强项写进 Summary、Skills 或 Experience。", "These are keywords detected from the JD. Prioritize missing items in Summary, Skills, or Experience."],
      ["已覆盖", "Covered"],
      ["待补强", "Needs work"],
      ["查看更多 ↓", "View more ↓"],
      ["收起 ↑", "Collapse ↑"],
      ["查看全部", "View all"],
      ["数据维度", "Data dimensions"],
      ["四个判断维度", "Four evaluation dimensions"],
      ["完整报告保留所有评分依据，和结果页使用同一套四卡结构。", "The full report keeps all scoring evidence and uses the same four-card structure as the result page."],
      ["这里对应结果页的四张预览卡片，点击展开查看完整说明。", "These match the four preview cards from the result page. Expand each one for full detail."],
      ["JD 匹配度", "JD match"],
      ["基于 JD 关键词覆盖", "Based on JD keyword coverage"],
      ["ATS 可读性", "ATS readability"],
      ["主流系统识别", "Mainstream ATS parsing"],
      ["SALARY · 薪资成长", "Salary growth"],
      ["成长潜力", "Growth potential"],
      ["5年上限", "5-year upside"],
      ["待校准", "Calibrating"],
      ["AI 影响趋势", "AI impact trend"],
      ["评分依据", "Scoring evidence"],
      ["ATS 诊断", "ATS diagnosis"],
      ["系统评分详情", "ATS system score"],
      ["关键问题", "Key issues"],
      ["JD 关键词覆盖：", "JD keyword coverage: "],
      ["格式处罚：", "Format penalty: "],
      ["完整导师建议", "Full mentor recommendations"],
      ["每个角度都有人帮你看过了", "Every angle has been reviewed"],
      ["按你的简历问题匹配", "Matched to your resume risks"],
      ["公司内幕", "Company insight"],
      ["导师亲述：这些公司到底看什么", "Mentor notes: what these companies actually look for"],
      ["升级服务", "Upgrade service"],
      ["想走得更远?", "Want to go further?"],
      ["升级专属求职顾问服务，由大厂导师团队为你定制方案", "Upgrade to dedicated career advisor support, customized by industry mentors"],
      ["从简历精修、投递策略到面试冲刺，享受高匹配度个人化陪跑。专业大厂在职导师团队，按目标公司 / 岗位 / 学校背景为你甄选匹配。", "From resume refinement and application strategy to interview preparation, get personalized support matched to your target companies, roles, and background."],
      ["求职策略 1v1", "1:1 career strategy"],
      ["定位 + 投递时间线 + 公司清单 + 风险评估", "Positioning, application timeline, company list, and risk review"],
      ["简历精修", "Resume refinement"],
      ["项目级深度改写，逐句对照 JD 优化", "Project-level rewrite with JD-by-JD optimization"],
      ["模拟面试", "Mock interviews"],
      ["语音 / 视频实战，高频问题穿透，即时点评", "Voice/video practice, high-frequency questions, and live feedback"],
      ["Offer 谈薪", "Offer negotiation"],
      ["多 Offer 取舍 + HR 报价 counter 话术", "Multiple-offer decisions and HR counteroffer scripts"],
      ["扫码添加专属求职导师", "Scan to add your dedicated career mentor"],
      ["老学员 9 折优惠 · 不满意 7 天内全额退款 · 支持月度陪跑套餐", "Returning students get 10% off. 7-day refund policy. Monthly support plans available."],
      ["报告由 MentorX × AI 联合生成 · 内容仅供参考，不构成 Offer 承诺", "Report generated by EdAIX mentors + AI. For reference only; not an offer guarantee."],
      ["报告由 EdAIX × AI 联合生成 · 内容仅供参考，不构成 Offer 承诺", "Report generated by EdAIX mentors + AI. For reference only; not an offer guarantee."],
      ["蔓藤教育 · 2015 至今 · 1,300+ 大厂导师", "EdAIX · Since 2015 · 1,300+ industry mentors"],
      ["由 MentorX 导师知识库中的真实大厂经验交叉匹配，系统会优先挑出最贴合你简历问题的建议。", "Matched from EdAIX's mentor knowledge base and prioritized for your resume risks."],
      ["由 EdAIX 导师知识库中的真实大厂经验交叉匹配，系统会优先挑出最贴合你简历问题的建议。", "Matched from EdAIX's mentor knowledge base and prioritized for your resume risks."],
      ["导师建议加载失败，请返回首页重新提交简历。", "Mentor recommendations failed to load. Please return to the home page and submit again."],
      ["导师", "Mentor"],
      ["当前状态", "Current state"],
      ["建议动作", "Recommended action"],
      ["补充视角", "Additional perspective"],
      ["改写示例", "Rewrite example"],
      ["改前", "Before"],
      ["改后", "After"],
      ["复制改后", "Copy rewrite"],
      ["已复制", "Copied"],
      ["免费试读", "Free preview"],
      ["职业路径", "Career path"],
      ["技能/工具", "Skills/tools"],
      ["职责/场景", "Responsibilities/scenarios"],
      ["行业/业务词", "Industry/business terms"],
      ["软技能/协作词", "Soft skills/collaboration"],
      ["已具备", "Covered"],
      ["待 AI 生成原句定位", "Original sentence pending AI generation"],
      ["待 AI 生成改写句", "Rewrite pending AI generation"],
      ["低-中等影响", "Low-medium impact"],
      ["中等影响", "Medium impact"],
      ["高影响", "High impact"],
      ["AI 更像效率工具", "AI is more of an efficiency tool"],
      ["重复任务会被自动化", "Repetitive tasks may be automated"],
      ["部分流程会被自动化", "Some workflows may be automated"],
      ["需要更多岗位信息", "More role information needed"],
      ["容易被自动化", "Easier to automate"],
      ["更有价值的能力", "More valuable abilities"],
      ["简历应强化", "Resume should emphasize"],
      ["薪资成长潜力", "Salary growth potential"],
      ["展示原则", "Display principle"],
      ["不使用 mock 薪资", "No mock salary used"],
      ["当前赛道参考", "Current track benchmark"],
      ["3 年成长区间", "3-year growth range"],
      ["5 年成长区间", "5-year growth range"],
      ["同赛道高分位", "High percentile in this track"],
      ["JD 标注薪资", "JD stated salary"],
      ["简历质量", "Resume quality"],
      ["内容质量与成果表达", "Content quality and outcome language"],
      ["ATS 总分", "ATS total score"],
      ["JD 关键词匹配", "JD keyword match"],
      ["已覆盖 / JD 关键词总数。", "Covered / total JD keywords."],
      ["已覆盖 / JD 关键词总数", "Covered / total JD keywords"],
      ["主要缺口", "Main gap"],
      ["下方岗位描述关键词清单已整理关键词与放置建议。", "The keyword checklist below organizes keywords and placement guidance."],
      ["报告页会直接展示当前可用的完整分析内容。", "The report page shows the full analysis currently available."],
    ]);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const raw = node.nodeValue || "";
      const trimmed = raw.replace(/\s+/g, " ").trim();
      if (!trimmed || !/[\u4e00-\u9fff]/.test(trimmed)) return;
      const direct = replacements.get(trimmed);
      if (direct) {
        node.nodeValue = raw.replace(trimmed, direct);
        return;
      }
      let translated = trimmed
        .replace(/^你的当前简历综合评分\s*(\d+|--)\s*分，?\s*离顶级 Offer 线\s*(.+?)\s*仍有差距。$/, "Your current resume score is $1/100. You still have a gap before the top offer line.")
        .replace(/^ATS (高风险|中风险|低风险)（(.+?)\/100），请优先查看 ATS 诊断中的分项得分和修改建议。$/, "ATS $1 ($2/100). Prioritize the dimension scores and recommendations in the ATS diagnosis.")
        .replace(/高风险/g, "High risk")
        .replace(/中风险/g, "Medium risk")
        .replace(/低风险/g, "Low risk")
        .replace(/待校准/g, "Calibrating")
        .replace(/需补充/g, "Needs more information")
        .replace(/完整报告/g, "Full report")
        .replace(/导师建议/g, "mentor recommendations")
        .replace(/大厂导师/g, "industry mentors")
        .replace(/蔓藤教育/g, "EdAIX")
        .replace(/MentorX/g, "EdAIX");
      if (translated !== trimmed && !/[\u4e00-\u9fff]/.test(translated)) {
        node.nodeValue = raw.replace(trimmed, translated);
      }
    });
  }

  function applyEnglishCopy() {
    const path = location.pathname;
    if (path === "/") {
      applyHomeCopy(EN_COPY.home);
    }
    if (path === "/result") {
      applyResultCopy(EN_COPY.result);
    }
    if (path === "/report") {
      setText(".brand-meta", EN_COPY.report.meta);
      setText(".banner div:last-child", EN_COPY.report.ready);
      setText(".export-card-title", EN_COPY.report.reportTitle);
      setText(".export-card-desc", EN_COPY.report.reportDesc);
      setText(".export-card-actions-title", "Download deliverables");
      setText(".export-card-actions-sub", "Save the full report first, then download the AI rewrite prompt pack.");
      setText(".export-card-hint", "Upload the prompt pack with your original resume so AI can rewrite it using the keywords and mentor recommendations.");
      const exportPerks = document.querySelectorAll(".export-card-perks li span:last-child");
      if (exportPerks[0]) exportPerks[0].innerHTML = "Improve ATS readiness by <b>+30%</b> and align with JD skills";
      if (exportPerks[1]) exportPerks[1].textContent = "Improve interview callback readiness with role-specific resume language";
      if (exportPerks[2]) exportPerks[2].textContent = "Reuse the report to tailor each application";
      const buttons = document.querySelectorAll(".export-card-actions .btn");
      if (buttons[0]) buttons[0].textContent = EN_COPY.report.download;
      if (buttons[1]) buttons[1].textContent = EN_COPY.report.prompt;
      setText("#summary .who", EN_COPY.report.summaryReady);
      setText("#summary .pill", EN_COPY.report.targetDone);
      const salaryGap = document.getElementById("reportHeadlineSalaryTop")?.textContent?.trim() || "calibrating";
      const headline = document.querySelector(".report-summary-headline");
      if (headline) headline.innerHTML = `You still have a gap before the top offer line: <span class="gap" id="reportHeadlineSalaryTop">${salaryGap}</span>.`;
      const issueItems = document.querySelectorAll(".report-issue-list li");
      ["JD keyword coverage is too low", "Skill match is not direct enough", "Experience bullets need more measurable impact"].forEach((text, index) => {
        if (issueItems[index]) issueItems[index].textContent = text;
      });
      setText(".report-hero-actions .btn-jade", "View mentor recommendations");
      setText(".report-hero-actions .report-secondary-btn", "View score details");
      setText("#atsDetailSection .section-num", "03 · ATS diagnosis");
      setText("#mentors .section-title", EN_COPY.report.mentorTitle);
      const mentorNum = document.querySelector("#mentors .section-num");
      if (mentorNum) mentorNum.textContent = mentorNum.textContent.replace(/04\s*·.*/i, "04 · Full mentor recommendations");
      setText("#insider-tips .section-title", EN_COPY.report.insiderTitle);
      setText("#insider-tips .section-num", "05 · Company insight");
      const insiderReason = document.getElementById("insiderTipsReason");
      if (insiderReason && /[\u4e00-\u9fff]/.test(insiderReason.textContent || "")) insiderReason.textContent = "Relevant to your target role.";
      setText("#service .section-title", EN_COPY.report.serviceTitle);
      setText("#serviceNum", "06 · Upgrade service");
      const serviceCardTitle = document.querySelector(".service-card-title");
      if (serviceCardTitle) serviceCardTitle.innerHTML = `Upgrade to <em>dedicated career advisor support</em>,<br/>customized by industry mentors`;
      const serviceSub = document.querySelector(".service-card-sub");
      if (serviceSub) serviceSub.innerHTML = "From resume refinement and application strategy to interview preparation, get personalized support.<br/>Industry mentors are matched by target company, role, and background.";
      const serviceItems = document.querySelectorAll(".service-list li");
      [
        ["1:1 career strategy", "Positioning, application timeline, company list, and risk review"],
        ["Resume refinement", "Project-level rewrite with JD-by-JD optimization"],
        ["Mock interviews", "Voice/video practice, high-frequency questions, and live feedback"],
        ["Offer negotiation", "Multiple-offer decisions and HR counteroffer scripts"],
      ].forEach(([titleText, descText], index) => {
        const item = serviceItems[index];
        if (!item) return;
        const strong = item.querySelector("strong");
        const span = item.querySelector("strong + span");
        if (strong) strong.textContent = titleText;
        if (span) span.textContent = descText;
      });
      setText(".service-cta-text", "Scan to add your dedicated career mentor");
      document.querySelectorAll(".service-qr").forEach((img) => img.setAttribute("alt", "Scan to add your dedicated career mentor"));
      const metricsSection = document.getElementById("reportDataMetrics");
      if (metricsSection) {
        setText("#reportDataMetrics .section-num", "02 · Data dimensions");
        setText("#reportDataMetrics .section-title", "Four evaluation dimensions");
        setText("#reportDataMetrics .section-desc", "The full report keeps all scoring evidence and uses the same four-card structure as the result page.");
        const labels = metricsSection.querySelectorAll(".tile-label");
        if (labels[0]) labels[0].textContent = "JD match";
        if (labels[1]) labels[1].textContent = "ATS readability";
        if (labels[2]) labels[2].firstChild ? labels[2].firstChild.textContent = "Salary growth" : labels[2].textContent = "Salary growth";
        if (labels[3]) labels[3].firstChild ? labels[3].firstChild.textContent = "AI impact trend" : labels[3].textContent = "AI impact trend";
      }
      applyReportFooterCopy("en-US");
      translateReportFallbackTextToEnglish();
    }
    if (path === "/payment") {
      setText(".brand-meta", EN_COPY.payment.meta);
      setText(".pay-back", "<- " + EN_COPY.payment.back);
      setText(".payment-page > .section-title", EN_COPY.payment.title);
      setText(".payment-page > .section-desc", EN_COPY.payment.desc);
      setText(".pay-summary .label", EN_COPY.payment.order);
      setText(".pay-summary .item.total span:first-child", EN_COPY.payment.total);
      setText(".pay-price + div + .pay-discount", "Limited-time offer · 75% off");
      setText(".pay-card button.btn-jade", EN_COPY.payment.done);
    }
    if (path === "/payment") applyPaymentCopy(EN_COPY.payment);
    if (path === "/analyzing") {
      setText(".brand-meta", EN_COPY.analyzing.meta);
      setText(".analyzing-head h1", EN_COPY.analyzing.title);
      setText(".analyzing-head p", EN_COPY.analyzing.desc);
      setText(".progress-card-row .left span:last-child", EN_COPY.analyzing.depth);
      setText(".progress-card-row .right span:first-child", EN_COPY.analyzing.eta);
      setText(".steps-card h3", EN_COPY.analyzing.progress);
    }
    if (path === "/login") {
      applyLoginCopy(EN_COPY.login);
    }
  }

  function applyChineseCopy() {
    if (location.pathname === "/") applyHomeCopy(ZH_COPY.home);
    if (location.pathname === "/login") applyLoginCopy(ZH_COPY.login);
    if (location.pathname === "/result") applyResultCopy(ZH_COPY.result);
    if (location.pathname === "/report") applyReportFooterCopy("zh-CN");
    if (location.pathname === "/payment") applyPaymentCopy(ZH_COPY.payment);
  }

  async function reloadReportForLocale(locale) {
    const store = readStore();
    if (!store.reportId || !store.reportAccessToken) return;
    const qs = `reportAccessToken=${encodeURIComponent(store.reportAccessToken)}&locale=${encodeURIComponent(locale)}`;
    try {
      const response = await fetch(`/api/v1/reports/${encodeURIComponent(store.reportId)}/public?${qs}`);
      if (response.ok) {
        const payload = await response.json();
        const publicReport = payload.publicReport || {};
        const atsResult = typeof window.formatATSResult === "function"
          ? window.formatATSResult({ ...publicReport, reportId: store.reportId, reportAccessToken: store.reportAccessToken })
          : publicReport;
        writeStore({
          locale,
          atsResult,
          freeMentorAdvice: publicReport.freeMentorAdvice || null,
          resultPageAdviceItems: publicReport.resultPageAdviceItems || null,
          lockedAdvicePreview: publicReport.lockedAdvicePreview || null,
          mentorLogoPool: publicReport.lockedAdvicePreview?.mentorLogoPool || publicReport.freeMentorAdvice?.mentorLogoPool || store.mentorLogoPool || null,
          translationFallback: Boolean(payload.translationFallback || publicReport.translationFallback),
        });
      }
      if (store.isPaid) {
        const unlock = await fetch(`/api/v1/reports/${encodeURIComponent(store.reportId)}/unlock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportAccessToken: store.reportAccessToken, locale }),
        });
        if (unlock.ok) {
          const payload = await unlock.json();
          const premiumReport = payload.premiumReport || {};
          writeStore({
            locale,
            premiumMentors: premiumReport.mentors || null,
            reportPageMentorGroups: premiumReport.reportPageMentorGroups || null,
            premiumAdviceItems: premiumReport.allAdviceItems || null,
            premiumKeywordBreakdown: premiumReport.keywordBreakdown || null,
            missingKeywordChecklist: premiumReport.missingKeywordChecklist || null,
            sectionFixPlan: premiumReport.sectionFixPlan || null,
            problemTags: premiumReport.problemTags || null,
            detailedSuggestions: premiumReport.detailedSuggestions || null,
            mentorLogoPool: premiumReport.mentorLogoPool || store.mentorLogoPool || null,
            companyInsiderTips: premiumReport.companyInsiderTips || [],
            translationFallback: Boolean(payload.translationFallback || premiumReport.translationFallback),
          });
        }
      }
      if (location.pathname === "/result" || location.pathname === "/report") location.reload();
    } catch (error) {
      console.warn("[i18n] locale reload failed:", error.message);
    }
  }

  function injectToggle() {
    if (document.querySelector(".locale-toggle")) return;
    const wrap = document.createElement("div");
    wrap.className = "locale-toggle";
    wrap.innerHTML = '<button type="button" data-locale="zh-CN">中</button><button type="button" data-locale="en-US">EN</button>';
    const style = document.createElement("style");
    style.textContent = ".locale-toggle{display:inline-flex;align-items:center;gap:2px;border:1px solid var(--line,#e5e7eb);border-radius:999px;background:rgba(255,255,255,.82);padding:3px;box-shadow:0 8px 22px rgba(31,23,68,.08);z-index:20}.locale-toggle button{border:0;background:transparent;color:var(--ink-soft,#5f567a);font-size:12px;font-weight:800;min-width:34px;height:28px;border-radius:999px;cursor:pointer;letter-spacing:0}.locale-toggle button.active{background:var(--ink,#1f1744);color:#fff}.locale-toggle.is-floating{position:fixed;right:18px;top:14px}.brandbar .locale-toggle{margin-left:auto;flex-shrink:0}";
    document.head.appendChild(style);
    const host = document.querySelector(".brandbar");
    if (host) host.appendChild(wrap);
    else {
      wrap.classList.add("is-floating");
      document.body.appendChild(wrap);
    }
    wrap.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-locale]");
      if (!button) return;
      const nextLocale = normalizeLocale(button.dataset.locale);
      if (nextLocale === getLocale()) return;
      writeStore({ locale: nextLocale });
      document.documentElement.lang = nextLocale;
      updateToggle();
      if (nextLocale === "en-US") applyEnglishCopy();
      else applyChineseCopy();
      await reloadReportForLocale(nextLocale);
      if (location.pathname === "/result") location.reload();
      else if (nextLocale === "zh-CN" && location.pathname !== "/" && location.pathname !== "/login") location.reload();
    });
  }

  function updateToggle() {
    const locale = getLocale();
    document.documentElement.lang = locale;
    document.querySelectorAll(".locale-toggle button").forEach((button) => {
      button.classList.toggle("active", normalizeLocale(button.dataset.locale) === locale);
    });
  }

  function init() {
    const locale = getLocale();
    writeStore({ locale });
    injectToggle();
    updateToggle();
    if (locale === "en-US") applyEnglishCopy();
    else applyChineseCopy();
    if (location.pathname === "/result") {
      [400, 1200, 2500].forEach((delay) => setTimeout(applyCurrentLocaleCopy, delay));
    }
    if (location.pathname === "/report") {
      [300, 900, 1800, 3200].forEach((delay) => setTimeout(applyCurrentLocaleCopy, delay));
    }
  }

  function applyCurrentLocaleCopy() {
    if (getLocale() === "en-US") applyEnglishCopy();
    else applyChineseCopy();
  }

  window.I18N = {
    normalizeLocale,
    getLocale,
    setLocale(locale) {
      writeStore({ locale: normalizeLocale(locale) });
      init();
    },
    applyCurrentLocaleCopy,
    reloadReportForLocale,
  };

  window.addEventListener("edaix:result-rendered", applyCurrentLocaleCopy);
  window.addEventListener("edaix:report-rendered", applyCurrentLocaleCopy);

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
