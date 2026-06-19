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
      kicker: "International career search · 30-second diagnosis",
      h1: "Is your resume getting ignored?<br/><em>MentorX mentors x AI</em><br/>help you upgrade it.",
      lede: "1,300+ industry mentors and AI-powered analysis. Get a practical resume improvement plan in 30 seconds.",
      proof1: "Industry mentors",
      proof2: "Real coaching cases",
      proof3: "Initial diagnosis",
      uploadTitle: "Let MentorX mentors review your resume",
      uploadLabel: "Resume",
      fileMode: "Upload file",
      textMode: "Paste resume text",
      fileMain: "Click or drag to upload your resume",
      fileSub: "PDF · Word (.docx/.doc) · Plain text (.txt)",
      resumeHint: "If the PDF cannot be parsed, paste the resume text directly.",
      textLabel: "Resume text",
      jobLabel: "Target role",
      jdLabel: "Target job description",
      submit: "Generate diagnosis in 30 seconds",
      credibilityTitle: "10 years of real coaching data, built for global careers.",
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
      freeDesc: "Matched from MentorX's mentor knowledge base and prioritized for your resume risks.",
      unlockTitle: "More mentor recommendations",
      unlockDesc: "Unlock the full mentor plan, JD keyword placement guidance, and exportable rewrite report.",
      unlockBtn: "$49 Unlock now",
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
      done: "I have completed payment",
    },
    analyzing: {
      meta: "Analyzing...",
      title: "Finding your resume opportunity areas",
      desc: "Analyzing your target JD, mentor knowledge base, and HR screening signals.",
      depth: "Deep analysis in progress",
      eta: "About 20-35 seconds",
      progress: "Analysis progress",
    },
  };

  function applyEnglishCopy() {
    const path = location.pathname;
    if (path === "/") {
      setText(".brand-meta", EN_COPY.home.meta);
      setHtml(".hero-kicker", '<span class="dot"></span> ' + EN_COPY.home.kicker);
      setHtml(".hero h1", EN_COPY.home.h1);
      setText(".hero .lede", EN_COPY.home.lede);
      const proof = document.querySelectorAll(".hero-proof span");
      if (proof[0]) proof[0].textContent = EN_COPY.home.proof1;
      if (proof[1]) proof[1].textContent = EN_COPY.home.proof2;
      if (proof[2]) proof[2].textContent = EN_COPY.home.proof3;
      setText(".upload-section .section-title", EN_COPY.home.uploadTitle);
      setText(".resume-source-group .input-label", EN_COPY.home.uploadLabel);
      const modes = document.querySelectorAll(".resume-source-option span:last-child");
      if (modes[0]) modes[0].textContent = EN_COPY.home.fileMode;
      if (modes[1]) modes[1].textContent = EN_COPY.home.textMode;
      setText(".fu-main", EN_COPY.home.fileMain);
      setText(".fu-sub", EN_COPY.home.fileSub);
      setText(".resume-source-group .input-hint", EN_COPY.home.resumeHint);
      const labels = document.querySelectorAll(".input-group > .input-label");
      if (labels[1]) labels[1].textContent = EN_COPY.home.textLabel;
      if (labels[2]) labels[2].textContent = EN_COPY.home.jobLabel;
      if (labels[3]) labels[3].textContent = EN_COPY.home.jdLabel;
      setText('button[type="submit"]', EN_COPY.home.submit + " ->");
      setText(".credibility-section .section-title", EN_COPY.home.credibilityTitle);
    }
    if (path === "/result") {
      setText(".result-stepper", EN_COPY.result.step);
      setText(".result-status-banner div:last-child", EN_COPY.result.status);
      setText(".result-score-conclusion", EN_COPY.result.conclusion);
      setText("#studentInfo", EN_COPY.result.loadingResume);
      setText("#targetJob", EN_COPY.result.targetLoading);
      setHtml("#headline", EN_COPY.result.headline);
      document.querySelectorAll(".result-issue-list li").forEach((li, i) => { if (EN_COPY.result.issues[i]) li.textContent = EN_COPY.result.issues[i]; });
      const actions = document.querySelectorAll(".result-hero-actions .btn");
      if (actions[0]) actions[0].textContent = EN_COPY.result.viewAdvice;
      if (actions[1]) actions[1].textContent = EN_COPY.result.viewScore;
      setText(".result-metrics-panel .section-num", EN_COPY.result.dimensions);
      setText(".result-metrics-panel .section-title", EN_COPY.result.dimensionsTitle);
      setText(".result-metrics-panel .section-desc", EN_COPY.result.dimensionsDesc);
      setText(".result-mentor-free-panel .section-title", EN_COPY.result.freeTitle);
      setText(".result-mentor-free-panel .section-desc", EN_COPY.result.freeDesc);
      setText(".result-mentor-unlock-card .section-title", EN_COPY.result.unlockTitle);
      setText(".result-mentor-unlock-card .section-desc", EN_COPY.result.unlockDesc);
      setText(".result-unlock-button", EN_COPY.result.unlockBtn + " ->");
    }
    if (path === "/report") {
      setText(".brand-meta", EN_COPY.report.meta);
      setText(".banner div:last-child", EN_COPY.report.ready);
      setText(".export-card-title", EN_COPY.report.reportTitle);
      setText(".export-card-desc", EN_COPY.report.reportDesc);
      const buttons = document.querySelectorAll(".export-card-actions .btn");
      if (buttons[0]) buttons[0].textContent = EN_COPY.report.download;
      if (buttons[1]) buttons[1].textContent = EN_COPY.report.prompt;
      setText("#summary .who", EN_COPY.report.summaryReady);
      setText("#summary .pill", EN_COPY.report.targetDone);
      setText("#mentors .section-title", EN_COPY.report.mentorTitle);
      setText("#insider-tips .section-title", EN_COPY.report.insiderTitle);
      setText("#service .section-title", EN_COPY.report.serviceTitle);
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
    if (path === "/analyzing") {
      setText(".brand-meta", EN_COPY.analyzing.meta);
      setText(".analyzing-head h1", EN_COPY.analyzing.title);
      setText(".analyzing-head p", EN_COPY.analyzing.desc);
      setText(".progress-card-row .left span:last-child", EN_COPY.analyzing.depth);
      setText(".progress-card-row .right span:first-child", EN_COPY.analyzing.eta);
      setText(".steps-card h3", EN_COPY.analyzing.progress);
    }
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
      await reloadReportForLocale(nextLocale);
      if (nextLocale === "zh-CN") location.reload();
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
  }

  window.I18N = {
    normalizeLocale,
    getLocale,
    setLocale(locale) {
      writeStore({ locale: normalizeLocale(locale) });
      init();
    },
    reloadReportForLocale,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
