var STORE_KEY = "resumeFixMVP";
// NOTE: API_BASE is declared in api-client.js (loaded before this file)
var isSubmitting = false;
var loaderProgressTimer = null;
var loaderRotateTimer = null;
var PAYMENT_MESSAGES = [
  ["æ­£åœ¨ç¡®è®¤æ”¯ä»˜â€¦", "æ­£åœ¨æ ¡éªŒæ”¯ä»˜çŠ¶æ€ä¸ŽæŠ¥å‘Šæƒé™"],
  ["æ­£åœ¨è§£é”å¯¼å¸ˆå»ºè®®â€¦", "é‡Šæ”¾ 12 æ¡å®Œæ•´å¯¼å¸ˆå»ºè®®ä¸Ž HR"],
  ["æ­£åœ¨ç”Ÿæˆå®Œæ•´æŠ¥å‘Šâ€¦", "åŒæ­¥æŠ€èƒ½æ¸…å•ã€æ”¹å†™è·¯å¾„å’Œå…¬å¸å¯¼å¸ˆèƒŒæ™¯"],
];

var Store = {
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

function showLoader(text, subtext, options) {
  options = options || {};
  let o = document.querySelector(".loader-overlay");
  if (!o) {
    o = document.createElement("div");
    o.className = "loader-overlay";
    o.innerHTML = '<div class="loader-container"><div class="loader-dots"><span></span><span></span><span></span></div><div class="loader-text"></div><div class="loader-subtext"></div><div class="loader-progress"><div class="loader-progress-fill"></div></div><div class="loader-progress-label">0%</div></div>';
    document.body.appendChild(o);
    const s = document.createElement("style");
    s.textContent = ".loader-overlay{position:fixed;inset:0;background:rgba(24,24,22,.88);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;pointer-events:none;transition:opacity .3s}.loader-overlay.show{opacity:1;pointer-events:auto}.loader-container{text-align:center;color:#f6f3ec;padding:0 24px;max-width:360px;width:min(360px,100%)}.loader-dots{display:flex;gap:8px;justify-content:center;margin-bottom:20px}.loader-dots span{width:12px;height:12px;border-radius:50%;background:#a8d5ba;animation:ldBounce 1.4s infinite ease-in-out both}.loader-dots span:nth-child(1){animation-delay:-.32s}.loader-dots span:nth-child(2){animation-delay:-.16s}@keyframes ldBounce{0%,80%,100%{transform:scale(.6);opacity:.5}40%{transform:scale(1);opacity:1}}.loader-text{font-size:18px;font-weight:600;margin-bottom:8px}.loader-subtext{font-size:14px;opacity:.7;line-height:1.5}.loader-progress{height:8px;border-radius:999px;background:rgba(255,255,255,.16);overflow:hidden;margin:20px auto 8px}.loader-progress-fill{height:100%;width:0%;border-radius:inherit;background:linear-gradient(90deg,#a8d5ba,#e8a06b,#e07070);transition:width .28s ease}.loader-progress-label{font-size:11px;opacity:.8;font-family:ui-monospace,Menlo,Consolas,monospace}";
    document.head.appendChild(s);
  }
  if (loaderProgressTimer) clearInterval(loaderProgressTimer);
  if (loaderRotateTimer) clearInterval(loaderRotateTimer);
  o.querySelector(".loader-text").textContent = text || "";
  o.querySelector(".loader-subtext").textContent = subtext || "";
  const fill = o.querySelector(".loader-progress-fill");
  const label = o.querySelector(".loader-progress-label");
  let progress = options.mode === "payment" ? 35 : (text && text.indexOf("å®Œæˆ") >= 0 ? 100 : 18);
  if (fill) fill.style.width = progress + "%";
  if (label) label.textContent = progress + "%";
  if (options.mode === "payment") {
    let idx = 0;
    loaderRotateTimer = setInterval(() => {
      idx = (idx + 1) % PAYMENT_MESSAGES.length;
      o.querySelector(".loader-text").textContent = PAYMENT_MESSAGES[idx][0];
      o.querySelector(".loader-subtext").textContent = PAYMENT_MESSAGES[idx][1];
    }, 1800);
    loaderProgressTimer = setInterval(() => {
      progress = Math.min(97, progress + Math.max(2, Math.round((98 - progress) * 0.18)));
      if (fill) fill.style.width = progress + "%";
      if (label) label.textContent = progress + "%";
    }, 280);
  }
  o.classList.add("show");
}
function completeLoader(text, subtext) {
  if (loaderProgressTimer) clearInterval(loaderProgressTimer);
  if (loaderRotateTimer) clearInterval(loaderRotateTimer);
  const o = document.querySelector(".loader-overlay");
  if (!o) return;
  o.querySelector(".loader-text").textContent = text || "å·²å®Œæˆ";
  o.querySelector(".loader-subtext").textContent = subtext || "";
  const fill = o.querySelector(".loader-progress-fill");
  const label = o.querySelector(".loader-progress-label");
  if (fill) fill.style.width = "100%";
  if (label) label.textContent = "100%";
}
function hideLoader() {
  if (loaderProgressTimer) clearInterval(loaderProgressTimer);
  if (loaderRotateTimer) clearInterval(loaderRotateTimer);
  const o = document.querySelector(".loader-overlay");
  if (o) o.classList.remove("show");
}

function normalizeExtractedTargetJobTitle(value) {
  return String(value || "")
    .replace(/^\s*\u3010(?:\u76ee\u6807\u5c97\u4f4d|\u5c97\u4f4d|\u804c\u4f4d|\u804c\u79f0|\u804c\u52a1|\u62db\u8058\u5c97\u4f4d|\u5e94\u8058\u5c97\u4f4d)\u3011\s*[\uff1a:]\s*/i, "")
    .replace(/^\s*(?:\u76ee\u6807\u5c97\u4f4d|\u5c97\u4f4d|\u804c\u4f4d|\u804c\u79f0|\u804c\u52a1|\u62db\u8058\u5c97\u4f4d|\u5e94\u8058\u5c97\u4f4d)\s*[\uff1a:\-–]\s*/i, "")
    .replace(/\s*\((?:junior|senior|entry[-\s]?level|full[-\s]?time|part[-\s]?time|internship|intern|co-?op|new\s*grad)[^)]*\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTargetJobFromJD(jdText) {
  const text = String(jdText || "").replace(/\r/g, "\n").trim();
  if (!text) return "";
  const clean = (value) => normalizeExtractedTargetJobTitle(String(value || "")
    .replace(/\s*\u3010.*$/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80));
  const labeledPatterns = [
    /^\s*(?:\u3010\s*)?(?:job\s*title|position\s*title|role\s*title|target\s*(?:role|position)|\u76ee\u6807\u5c97\u4f4d|\u5c97\u4f4d|\u804c\u4f4d|\u804c\u79f0|\u804c\u52a1|\u62db\u8058\u5c97\u4f4d|\u5e94\u8058\u5c97\u4f4d)(?:\s*\u3011)?\s*[:\uff1a\-–]\s*([^\n|;\uff1b]+)/i,
    /^\s*(?:job\s*title|position\s*title|role\s*title|target\s*(?:role|position))\s*[:\-]\s*([^\n|;]+)/i,
  ];
  for (const pattern of labeledPatterns) {
    const match = text.match(pattern);
    const title = match && clean(match[1]);
    if (title) return title;
  }
  const roleWords = /(engineer|developer|scientist|analyst|manager|management\s+trainee|trainee|designer|consultant|researcher|architect|specialist|associate|intern|\u5b9e\u4e60|\u7ba1\u57f9\u751f|\u5de5\u7a0b\u5e08|\u5206\u6790\u5e08|\u7ecf\u7406|\u987e\u95ee|\u7814\u7a76\u5458|\u8bbe\u8ba1\u5e08|\u4ea7\u54c1|\u8fd0\u8425|\u6570\u636e|\u7b97\u6cd5|\u673a\u5668\u5b66\u4e60|\u8f6f\u4ef6|\u524d\u7aef|\u540e\u7aef)/i;
  const noiseWords = /(responsibilities|requirements|qualifications|about us|description|summary|duties|tasks|projects|policies|procedures|goals|\u85aa\u8d44|\u804c\u8d23|\u8981\u6c42|\u8d44\u683c|\u798f\u5229|\u516c\u53f8|\u6211\u4eec|\u5de5\u4f5c\u5185\u5bb9)/i;
  const dutyLeadWords = /^(rotate|assist|participate|develop|analy[sz]e|complete|provide|learn|create|help|support|work|collaborate|manage\s+day[-\s]?to[-\s]?day)\b/i;
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean).slice(0, 18);
  for (const line of lines) {
    const cleaned = line.replace(/^[#*\-\s]+/, "").replace(/\s+/g, " ").trim();
    if (cleaned.length < 3 || cleaned.length > 90) continue;
    if (noiseWords.test(cleaned) || dutyLeadWords.test(cleaned)) continue;
    if (roleWords.test(cleaned)) return clean(cleaned);
  }
  return "";
}

async function submitResume(form) {
  if (isSubmitting) return false;
  const file     = form.elements["resume"].files[0];
  const job      = form.elements["job"].value.trim();
  const jd       = form.elements["jd"].value.trim();
  const errorBox = form.querySelector(".form-error");
  const btn      = form.querySelector('button[type="submit"]');
  if (!file) { errorBox.textContent = "è¯·å…ˆä¸Šä¼ ä½ çš„ç®€åŽ†æ–‡ä»¶"; errorBox.classList.add("show"); return false; }
  if (!job && !jd) { errorBox.textContent = "è¯·å¡«å†™ç›®æ ‡å²—ä½æˆ–ç²˜è´´ç›®æ ‡å²—ä½ JDï¼ŒäºŒé€‰ä¸€å³å¯"; errorBox.classList.add("show"); return false; }
  errorBox.classList.remove("show");
  isSubmitting = true;
  if (btn) btn.disabled = true;
  try {
    showLoader("å‡†å¤‡æ–‡ä»¶â€¦", "è¯»å–ç®€åŽ†å†…å®¹â€¦");
    const resumeText = await readResumeFile(file);
    showLoader("ATS æ­£åœ¨è¯„åˆ†â€¦", "ä½¿ç”¨æœ¬åœ°è§„åˆ™å¼•æ“Žåˆ†æžç®€åŽ†è´¨é‡ï¼Œä¸è°ƒç”¨ AI");
    showLoader("分析已在后台开始…", "登录时会继续处理，完成后自动进入结果页");
    const targetJob = normalizeExtractedTargetJobTitle(job || extractTargetJobFromJD(jd));
    const analysisJob = await startAnalysisJobAPI(resumeText, targetJob || null, jd, file.name);
    Store.set({
      resumeName: file.name,
      jobTitle: targetJob,
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
    setTimeout(() => { window.location.href = "/login"; }, 250);
  } catch(err) {
    errorBox.textContent = "âŒ " + (err.message || "æœªçŸ¥é”™è¯¯");
    errorBox.classList.add("show");
    hideLoader();
    isSubmitting = false;
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
      if (metaEl) metaEl.textContent = ext + " Â· " + fmtBytes(f.size) + " Â· å·²å‡†å¤‡å¥½";
      if (empty)   empty.style.display   = "none";
      if (success) success.style.display = "flex";
    } else {
      wrap.classList.remove("has-file");
      if (empty)   empty.style.display   = "";
      if (success) success.style.display = "none";
    }
  });
}

function storeAnalysisJobResult(result) {
  const publicReport = result && (result.publicReport || result.data) || {};
  const atsResult = typeof formatATSResult === "function"
    ? formatATSResult({ ...publicReport, reportId: result?.reportId, reportAccessToken: result?.reportAccessToken })
    : publicReport;
  Store.set({
    reportId: result?.reportId || publicReport.reportId || null,
    sessionId: result?.reportId || publicReport.reportId || null,
    reportAccessToken: result?.reportAccessToken || null,
    atsResult,
    targetLabel: Store.get().targetLabel || Store.get().jobTitle || publicReport.jobTitle || atsResult.jobTitle || null,
    freeMentorAdvice: publicReport.freeMentorAdvice || null,
    lockedAdvicePreview: publicReport.lockedAdvicePreview || null,
    mentorLogoPool: publicReport.lockedAdvicePreview?.mentorLogoPool || publicReport.freeMentorAdvice?.mentorLogoPool || null,
    analysisJobStatus: "completed",
    analysisCompletedAt: Date.now(),
  });
}

async function waitForAnalysisJobAndRedirect(btn) {
  const current = Store.get();
  if (current.reportId && current.atsResult) {
    completeLoader("诊断完成！", "报告已生成，正在进入结果页…");
    setTimeout(() => { window.location.href = "/result"; }, 500);
    return;
  }
  if (!current.analysisJobId || typeof getAnalysisJobAPI !== "function") {
    hideLoader();
    if (btn) btn.disabled = false;
    alert("分析任务尚未建立，请回到首页重新提交简历。");
    return;
  }
  showLoader("正在完成后台分析…", "登录成功，报告完成后会自动跳转。");
  try {
    const job = await getAnalysisJobAPI(current.analysisJobId);
    Store.set({ analysisJobStatus: job.status, analysisJobStage: job.stage });
    if (job.status === "completed" && job.result) {
      storeAnalysisJobResult(job.result);
      completeLoader("诊断完成！", "报告已生成，正在进入结果页…");
      setTimeout(() => { window.location.href = "/result"; }, 500);
      return;
    }
    if (job.status === "failed") {
      hideLoader();
      if (btn) btn.disabled = false;
      alert("分析失败，请返回首页重新提交。");
      return;
    }
    setTimeout(() => waitForAnalysisJobAndRedirect(btn), 1200);
  } catch (err) {
    setTimeout(() => waitForAnalysisJobAndRedirect(btn), 1800);
  }
}

function mockLogin(btn) {
  if (btn) btn.disabled = true;
  Store.set({ userId: "mock_" + Date.now(), loginAt: Date.now() });
  waitForAnalysisJobAndRedirect(btn);
}
async function mockPayment(btn) {
  btn.disabled = true;
  showLoader("æ­£åœ¨ç¡®è®¤æ”¯ä»˜â€¦", "æ­£åœ¨æ ¡éªŒæ”¯ä»˜çŠ¶æ€ä¸ŽæŠ¥å‘Šæƒé™", { mode: "payment" });
  try {
    const s = Store.get();
    const reportId = s.reportId || s.sessionId;
    const token = s.reportAccessToken;
    if (reportId && token) {
      await fetch(`/api/v1/reports/${encodeURIComponent(reportId)}/mark-paid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-report-access-token": token,
        },
        body: JSON.stringify({ reportAccessToken: token }),
      });
    }
  } catch (e) {
    console.warn("[Payment] mark-paid failed, continuing:", e.message);
  }
  Store.set({ isPaid: true, paidAt: Date.now() });
  completeLoader("è§£é”å®Œæˆï¼", "å®Œæ•´æŠ¥å‘Šå·²ç”Ÿæˆï¼Œæ­£åœ¨è¿›å…¥æŠ¥å‘Šé¡µâ€¦");
  setTimeout(() => { window.location.href = "/report"; }, 350);
}

function guardSubmitted() {
  const s = Store.get();
  if (!s.resumeName || !s.jobTitle) window.location.href = "/";
}
function guardPaid() {
  const s = Store.get();
  if (!s.isPaid) window.location.href = "/result";
}

function buildMarkdown() {
  const M = window.MOCK || {};
  const s = Store.get();
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

document.addEventListener("DOMContentLoaded", () => {
  bindFileUpload();
  console.log("[App] ready");
});
