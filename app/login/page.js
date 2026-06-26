'use client';
import Script from 'next/script';

export default function LoginPage() {
  return (
    <>
      <style>{`
        .login-wrap{display:flex;flex-direction:column;min-height:80vh;justify-content:center;align-items:stretch}
        .wechat-icon{width:88px;height:88px;margin:0 auto 22px;background:linear-gradient(135deg,#07c160,#2f6b4f);border-radius:24px;display:grid;place-items:center;color:#fff;font-family:var(--serif);font-weight:700;font-size:44px;box-shadow:0 18px 32px -12px rgba(7,193,96,.45);position:relative}
        .wechat-icon::after{content:"";position:absolute;inset:-3px;border-radius:26px;border:2px solid rgba(255,255,255,.9);pointer-events:none}
        .login-title{font-family:var(--serif);font-weight:700;font-size:26px;line-height:1.2;text-align:center;letter-spacing:-.015em;margin:0 0 8px}
        .login-sub{text-align:center;color:var(--ink-soft);font-size:14px;margin:0 0 28px}
        .login-progress{display:flex;gap:6px;justify-content:center;margin-bottom:24px}
        .login-progress span{width:24px;height:4px;border-radius:2px;background:var(--paper-deep)}
        .login-progress span.active{background:var(--jade)}
        .login-resume-mini{background:var(--paper-warm);border:1px solid var(--line);border-radius:var(--r-md);padding:14px 16px;margin-bottom:22px;display:flex;align-items:center;gap:12px}
        .login-resume-mini .icon{width:36px;height:36px;border-radius:8px;background:var(--jade-soft);color:var(--jade);display:grid;place-items:center;flex-shrink:0}
        .login-resume-mini .icon::before{content:"";width:17px;height:20px;display:block;background:currentColor;-webkit-mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 28'><path d='M5 2h9l5 5v19H5z'/><path d='M14 2v6h5' fill='none' stroke='white' stroke-width='2'/><path d='M8 14h8M8 18h8M8 22h5' fill='none' stroke='white' stroke-width='1.7' stroke-linecap='round'/></svg>") center/contain no-repeat;mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 28'><path d='M5 2h9l5 5v19H5z'/><path d='M14 2v6h5' fill='none' stroke='white' stroke-width='2'/><path d='M8 14h8M8 18h8M8 22h5' fill='none' stroke='white' stroke-width='1.7' stroke-linecap='round'/></svg>") center/contain no-repeat}
        .login-resume-mini .info{flex:1;min-width:0}
        .login-resume-mini .name{font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .login-resume-mini .meta{font-size:11px;color:var(--ink-mute);margin-top:2px}
        .login-analysis{display:none;background:var(--paper-warm);border:1px solid var(--line);border-radius:var(--r-md);padding:14px 16px;margin:-8px 0 18px}
        .login-analysis-row{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:13px;color:var(--ink-soft);margin-bottom:10px}
        .login-analysis-row strong{color:var(--ink);font-size:14px}
        .login-analysis-pct{font-family:var(--mono);color:var(--jade);font-weight:700}
        .login-analysis-bar{height:8px;border-radius:999px;background:var(--paper-deep);overflow:hidden}
        .login-analysis-fill{height:100%;width:8%;border-radius:inherit;background:linear-gradient(90deg,#5333A6,#7A52C5,#B47EDB);transition:width .45s ease}
        .login-analysis-status{margin-top:9px;font-size:12px;color:var(--ink-mute);line-height:1.4}
        .login-foot{text-align:center;margin-top:18px;font-size:11px;color:var(--ink-mute);line-height:1.7}
        .login-foot a{color:var(--ink-soft);text-decoration:underline;text-decoration-style:dotted}
        .login-tip{background:var(--jade-soft);border:1px solid var(--line);border-radius:var(--r-md);padding:12px 14px;font-size:13px;color:var(--jade);margin-top:22px;display:flex;align-items:flex-start;gap:8px;line-height:1.5}
        .login-tip-lock{width:16px;height:16px;display:inline-grid;place-items:center;flex-shrink:0;margin-top:2px;color:var(--jade)}
        .login-tip-lock::before{content:"";width:14px;height:14px;display:block;background:currentColor;-webkit-mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='5' y='10' width='14' height='10' rx='2'/><path d='M8 10V7a4 4 0 0 1 8 0v3h-2V7a2 2 0 0 0-4 0v3z'/></svg>") center/contain no-repeat;mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='5' y='10' width='14' height='10' rx='2'/><path d='M8 10V7a4 4 0 0 1 8 0v3h-2V7a2 2 0 0 0-4 0v3z'/></svg>") center/contain no-repeat}
      `}</style>

      <div className="page login-page">
        <div className="brandbar">
          <div className="brand">
            <img src="/logo/logo%20banner_no_bg.png" alt="EdAIX" className="brand-img" />
          </div>
          <div className="brand-meta" style={{fontSize:'10px',letterSpacing:'.08em'}}>2 / 5</div>
        </div>

        <div
          className="login-wrap fade-in"
          data-login-side-title={"Report generation started\nProgress syncs after sign-in"}
        >
          <div className="login-progress">
            <span className="active"></span>
            <span className="active"></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div
            className="wechat-icon"
            aria-hidden="true"
            data-login-method="Secure WeChat sign-in"
            data-login-method-note="Used to sync your report. Your resume stays private."
          >
            <svg className="wechat-mark" viewBox="0 0 64 56" focusable="false">
              <path d="M27.3 6C14.8 6 4.7 14.1 4.7 24.1c0 5.7 3.3 10.8 8.4 14.1L10.9 45l7.7-4c2.6.8 5.5 1.2 8.6 1.2 12.5 0 22.6-8.1 22.6-18.1C49.9 14.1 39.8 6 27.3 6Zm-7.8 12.9c-1.5 0-2.7-1.1-2.7-2.4s1.2-2.4 2.7-2.4 2.7 1.1 2.7 2.4-1.2 2.4-2.7 2.4Zm15.7 0c-1.5 0-2.7-1.1-2.7-2.4s1.2-2.4 2.7-2.4 2.7 1.1 2.7 2.4-1.2 2.4-2.7 2.4Z" fill="currentColor"/>
              <path d="M60 34.1c0-8.6-8.7-15.6-19.5-15.6S21 25.5 21 34.1s8.7 15.6 19.5 15.6c2.6 0 5.1-.4 7.4-1.1l6.6 3.4-1.9-5.8c4.5-2.8 7.4-7.2 7.4-12.1Zm-26.1-4.6c-1.2 0-2.2-.9-2.2-2s1-2 2.2-2 2.2.9 2.2 2-1 2-2.2 2Zm13.4 0c-1.2 0-2.2-.9-2.2-2s1-2 2.2-2 2.2.9 2.2 2-1 2-2.2 2Z" fill="currentColor" opacity=".92"/>
            </svg>
          </div>
          <h1 className="login-title">Sign in to view your report</h1>
          <p className="login-sub">Your analysis has started in the background. Sign in to view the result when it is ready.</p>

          <div className="login-resume-mini" id="resumeMini">
            <div className="icon" aria-hidden="true"></div>
            <div className="info">
              <div className="name" id="resumeFileName">Loading resume...</div>
              <div className="meta" id="resumeJobTitle">Target role</div>
            </div>
            <span className="pill pill-jade" id="analysisPill"><span className="dot"></span>Analyzing</span>
          </div>

          <div className="login-analysis" id="loginAnalysisProgress">
            <div className="login-analysis-row">
              <strong>Report generation progress</strong>
              <span className="login-analysis-pct"><span id="loginPct">8</span>%</span>
            </div>
            <div className="login-analysis-bar">
              <div className="login-analysis-fill" id="loginProgressFill"></div>
            </div>
            <div className="login-analysis-status" id="loginProgressStatus">Scanning your resume highlights. Processing will continue after sign-in.</div>
          </div>

          <button className="btn btn-jade btn-block" id="wechatLoginButton" type="button">
            <span className="wechat-button-icon" aria-hidden="true">
              <svg viewBox="0 0 64 56" focusable="false">
                <path d="M27.3 6C14.8 6 4.7 14.1 4.7 24.1c0 5.7 3.3 10.8 8.4 14.1L10.9 45l7.7-4c2.6.8 5.5 1.2 8.6 1.2 12.5 0 22.6-8.1 22.6-18.1C49.9 14.1 39.8 6 27.3 6Zm-7.8 12.9c-1.5 0-2.7-1.1-2.7-2.4s1.2-2.4 2.7-2.4 2.7 1.1 2.7 2.4-1.2 2.4-2.7 2.4Zm15.7 0c-1.5 0-2.7-1.1-2.7-2.4s1.2-2.4 2.7-2.4 2.7 1.1 2.7 2.4-1.2 2.4-2.7 2.4Z" fill="currentColor"/>
                <path d="M60 34.1c0-8.6-8.7-15.6-19.5-15.6S21 25.5 21 34.1s8.7 15.6 19.5 15.6c2.6 0 5.1-.4 7.4-1.1l6.6 3.4-1.9-5.8c4.5-2.8 7.4-7.2 7.4-12.1Zm-26.1-4.6c-1.2 0-2.2-.9-2.2-2s1-2 2.2-2 2.2.9 2.2 2-1 2-2.2 2Zm13.4 0c-1.2 0-2.2-.9-2.2-2s1-2 2.2-2 2.2.9 2.2 2-1 2-2.2 2Z" fill="currentColor" opacity=".92"/>
              </svg>
            </span>
            Continue with WeChat
          </button>

          <div className="login-tip">
            <span className="login-tip-lock" aria-hidden="true"></span>
            <span>We will not publish your resume. All content is used only for this diagnosis.</span>
          </div>

          <div className="login-foot">
            By signing in, you agree to the <a href="#">User Agreement</a> and <a href="#">Privacy Policy</a><br/>
            Need help? Contact support <span style={{color:'var(--rose)'}}>edaix-support</span>
          </div>
        </div>
      </div>

      <Script id="login-logic" strategy="afterInteractive">{`
        let loginAnalysisReady = false;
        let loginClicked = false;
        let loginButton = null;
        let loginVisualPct = 8;
        const loginStartedAt = Date.now();
        let loginProgressTicker = null;

        function showLoginLoader(text, subtext, rotate) {
          if (typeof window.showLoader === "function") {
            window.showLoader(text, subtext, rotate);
            return;
          }
          let overlay = document.querySelector(".loader-overlay");
          if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "loader-overlay";
            overlay.innerHTML = '<div class="loader-container"><div class="loader-dots"><span></span><span></span><span></span></div><div class="loader-text"></div><div class="loader-subtext"></div><div class="loader-progress"><div class="loader-progress-fill"></div></div><div class="loader-progress-label">8%</div></div>';
            document.body.appendChild(overlay);
            const style = document.createElement("style");
            style.textContent = ".loader-overlay{position:fixed;inset:0;background:rgba(31,23,68,.86);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:9999;opacity:0;pointer-events:none;transition:opacity .3s}.loader-overlay.show{opacity:1;pointer-events:auto}.loader-container{text-align:center;color:#f8fafc;padding:0 32px;max-width:360px;width:min(360px,100%)}.loader-dots{display:flex;gap:10px;justify-content:center;margin-bottom:24px}.loader-dots span{width:11px;height:11px;border-radius:50%;background:#B47EDB;animation:ldBounce 1.4s infinite ease-in-out both}.loader-dots span:nth-child(1){animation-delay:-.32s}.loader-dots span:nth-child(2){animation-delay:-.16s}@keyframes ldBounce{0%,80%,100%{transform:scale(.6);opacity:.4}40%{transform:scale(1);opacity:1}}.loader-text{font-size:19px;font-weight:700;margin-bottom:10px;color:#f8fafc}.loader-subtext{font-size:14px;color:#D9D1EA;line-height:1.5}.loader-progress{height:8px;border-radius:999px;background:rgba(255,255,255,.14);overflow:hidden;margin:22px auto 8px}.loader-progress-fill{height:100%;width:8%;border-radius:inherit;background:linear-gradient(90deg,#5333A6,#7A52C5,#B47EDB);transition:width .45s ease}.loader-progress-label{font-size:11px;color:#D9D1EA;font-family:ui-monospace,Menlo,Consolas,monospace}";
            document.head.appendChild(style);
          }
          overlay.querySelector(".loader-text").textContent = text || "";
          overlay.querySelector(".loader-subtext").textContent = subtext || "";
          overlay.querySelector(".loader-progress-fill").style.width = rotate ? "18%" : "100%";
          overlay.querySelector(".loader-progress-label").textContent = rotate ? "18%" : "100%";
          overlay.classList.add("show");
        }

        function setStorePatch(patch) {
          if (window.Store && typeof window.Store.set === "function") {
            window.Store.set(patch);
            return;
          }
          const current = JSON.parse(localStorage.getItem("resumeFixMVP") || "{}");
          localStorage.setItem("resumeFixMVP", JSON.stringify({ ...current, ...patch }));
        }

        function readStoreSnapshot() {
          if (window.Store && typeof window.Store.get === "function") return window.Store.get();
          return JSON.parse(localStorage.getItem("resumeFixMVP") || "{}");
        }

        function getLoginLocale() {
          if (window.I18N && typeof window.I18N.getLocale === "function") return window.I18N.getLocale();
          try {
            const s = JSON.parse(localStorage.getItem("resumeFixMVP") || "{}");
            return String(s.locale || document.documentElement.lang || "zh-CN").toLowerCase().startsWith("en") ? "en-US" : "zh-CN";
          } catch (_) {
            return "zh-CN";
          }
        }

        function loginText() {
          const en = getLoginLocale() === "en-US";
          return en ? {
            queued: "Queueing your analysis.",
            scoring: "Comparing your resume with the target JD.",
            building_report: "Building the report structure.",
            format_internal_ats: "Preparing the ATS diagnosis.",
            retrieve_mentor_advice: "Matching mentor recommendations.",
            select_mentor_plan: "Selecting the most relevant recommendations.",
            format_reports: "Generating diagnosis content.",
            format_public_premium: "Preparing the visual report.",
            save_report: "Saving the report.",
            analyzing: "Analyzing your resume.",
            redirect: "You will be redirected when the report is ready.",
            reading: "Reading analysis progress...",
            readingStatus: "Reading analysis progress.",
            completeTitle: "Diagnosis complete!",
            completeSub: "The report is ready. Redirecting to results...",
            readyStatus: "The report is ready. Sign in to view your result.",
            readyButton: "Continue with WeChat - View report",
            generatingButton: "Generating report...",
            targetPrefix: "Target role: ",
            targetFromJd: "Target role: analyzing from JD",
            failed: "Analysis failed. Please return to the home page and submit again, or paste your resume text instead.",
            failedPrefix: "Analysis failed: ",
            retryButton: "Return home and submit again",
            waiting: "Waiting for the analysis job to start.",
            interrupted: "The analysis job was interrupted. Please return to the home page and submit again.",
            unknown: "Could not confirm analysis status. Please return to the home page and submit again, or paste your resume text instead.",
            fallback: "Completing the report through the fallback path.",
          } : {
            queued: "正在排队准备分析。",
            scoring: "正在对照目标岗位 JD。",
            building_report: "正在生成报告结构。",
            format_internal_ats: "正在整理 ATS 诊断。",
            retrieve_mentor_advice: "正在匹配导师建议。",
            select_mentor_plan: "正在筛选最适合你的建议。",
            format_reports: "正在生成诊断内容。",
            format_public_premium: "正在整理可视化报告。",
            save_report: "正在保存报告。",
            analyzing: "正在分析你的履历。",
            redirect: "报告完成后将自动跳转。",
            reading: "正在读取分析进度...",
            readingStatus: "正在读取分析进度。",
            completeTitle: "诊断完成！",
            completeSub: "报告已生成，正在进入结果页...",
            readyStatus: "报告已生成，登录后即可查看结果。",
            readyButton: "微信一键登录 - 查看报告",
            generatingButton: "报告生成中...",
            targetPrefix: "目标岗位：",
            targetFromJd: "目标岗位：根据 JD 分析",
            failed: "分析失败，请返回首页重新提交，或改用简历文本粘贴方式。",
            failedPrefix: "分析失败：",
            retryButton: "返回首页重新提交",
            waiting: "等待分析任务启动。",
            interrupted: "分析任务已中断，请返回首页重新提交。",
            unknown: "无法确认分析状态，请返回首页重新提交，或改用简历文本粘贴方式。",
            fallback: "正在用备用通道完成报告。",
          };
        }

        function normalizeDisplayTargetJob(value) {
          return String(value || "")
            .replace(/^\\s*【(?:目标岗位|岗位|职位|职称|职务|招聘岗位|应聘岗位)】\\s*[：:]\\s*/i, "")
            .replace(/^\\s*(?:目标岗位|岗位|职位|职称|职务|招聘岗位|应聘岗位)\\s*[：:\\-–]\\s*/i, "")
            .replace(/\\s*\\((?:junior|senior|entry[-\\s]?level|full[-\\s]?time|part[-\\s]?time|internship|intern|co-?op|new\\s*grad)[^)]*\\)\\s*$/i, "")
            .replace(/\\s+/g, " ")
            .trim();
        }

        function normalizeDisplayTargetJobStrict(value) {
          return normalizeDisplayTargetJob(String(value || "")
            .replace(/^\\s*\\u3010(?:\\u76ee\\u6807\\u5c97\\u4f4d|\\u5c97\\u4f4d|\\u804c\\u4f4d|\\u804c\\u79f0|\\u804c\\u52a1|\\u62db\\u8058\\u5c97\\u4f4d|\\u5e94\\u8058\\u5c97\\u4f4d)\\u3011\\s*[\\uff1a:]\\s*/i, "")
            .replace(/^\\s*(?:\\u76ee\\u6807\\u5c97\\u4f4d|\\u5c97\\u4f4d|\\u804c\\u4f4d|\\u804c\\u79f0|\\u804c\\u52a1|\\u62db\\u8058\\u5c97\\u4f4d|\\u5e94\\u8058\\u5c97\\u4f4d)\\s*[\\uff1a:\\-–]\\s*/i, ""));
        }

        function setLoginProgress(pct, status) {
          loginVisualPct = Math.max(0, Math.min(100, Math.floor(pct)));
          const pctEl = document.getElementById("loginPct");
          const fillEl = document.getElementById("loginProgressFill");
          const statusEl = document.getElementById("loginProgressStatus");
          if (pctEl) pctEl.textContent = loginVisualPct;
          if (fillEl) fillEl.style.width = loginVisualPct + "%";
          if (statusEl && status) statusEl.textContent = status;
        }

        function displayProgressForElapsed(seconds) {
          const points = [
            [0, 3], [6, 14], [14, 30], [24, 52],
            [36, 72], [50, 88], [70, 94],
          ];
          for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const next = points[i];
            if (seconds <= next[0]) {
              const ratio = Math.max(0, Math.min(1, (seconds - prev[0]) / (next[0] - prev[0])));
              return prev[1] + (next[1] - prev[1]) * ratio;
            }
          }
          return 94;
        }

        function startLoginProgressCreep() {
          if (loginProgressTicker) return;
          loginProgressTicker = setInterval(function(){
            if (loginAnalysisReady || loginVisualPct >= 100) {
              clearInterval(loginProgressTicker);
              loginProgressTicker = null;
              return;
            }
            const elapsed = (Date.now() - loginStartedAt) / 1000;
            const creepTarget = displayProgressForElapsed(elapsed);
            if (loginVisualPct < creepTarget) {
              setLoginProgress(loginVisualPct + 1);
              if (typeof window.updateLoaderProgress === "function") {
                window.updateLoaderProgress(loginVisualPct, null, null);
              }
            }
          }, 450);
        }

        function analysisStageText(stage) {
          const text = loginText();
          return text[stage] || text.analyzing;
        }

        function syncAnalysisProgress(job) {
          const backendPct = Math.max(0, Math.min(100, Math.floor(Number(job?.progress || 0))));
          const elapsed = (Date.now() - loginStartedAt) / 1000;
          const timeTarget = displayProgressForElapsed(elapsed);
          const pct = backendPct >= 96 ? backendPct : Math.max(timeTarget, Math.min(backendPct, timeTarget + 8));
          const stageText = analysisStageText(job?.stage);
          setLoginProgress(pct, stageText);
          if (typeof window.updateLoaderProgress === "function") {
            window.updateLoaderProgress(pct, stageText, loginText().redirect);
          }
        }

        function storeCompletedReport(result) {
          const publicReport = result.publicReport || result.data || {};
          const atsResult = typeof formatATSResult === "function"
            ? formatATSResult({ ...publicReport, reportId: result.reportId, reportAccessToken: result.reportAccessToken })
            : publicReport;
          Store.set({
            locale: result.locale || publicReport.locale || Store.get().locale || "zh-CN",
            reportId: result.reportId || publicReport.reportId || null,
            sessionId: result.reportId || publicReport.reportId || null,
            reportAccessToken: result.reportAccessToken || null,
            atsResult,
            targetLabel: Store.get().targetLabel || Store.get().jobTitle || publicReport.jobTitle || atsResult.jobTitle || null,
            freeMentorAdvice: publicReport.freeMentorAdvice || null,
            resultPageAdviceItems: publicReport.resultPageAdviceItems || null,
            lockedAdvicePreview: publicReport.lockedAdvicePreview || null,
            mentorLogoPool: publicReport.lockedAdvicePreview?.mentorLogoPool || publicReport.freeMentorAdvice?.mentorLogoPool || null,
            analysisJobStatus: "completed",
            analysisCompletedAt: Date.now(),
            analysisDebugSummary: result.debugSummary || null,
          });
        }

        async function completeWithScoreFallback(reason) {
          const s = Store.get();
          if (s.analysisFallbackStarted || !s.resumeText || typeof scoreResumeAPI !== "function") return false;
          Store.set({
            analysisFallbackStarted: true,
            analysisFallbackReason: reason || "job_unavailable",
            analysisJobStatus: "fallback_running",
          });
          setLoginProgress(92, loginText().fallback);
          if (typeof window.updateLoaderProgress === "function") {
            window.updateLoaderProgress(92, loginText().fallback, loginText().redirect);
          }
          const publicReport = await scoreResumeAPI(s.resumeText, s.jobTitle || null, s.jdText || null, null, s.resumeName || "");
          storeCompletedReport({
            success: true,
            publicReport,
            reportId: publicReport.reportId || null,
            reportAccessToken: publicReport.reportAccessToken || null,
            locale: s.locale || publicReport.locale || "zh-CN",
          });
          markReportReady(null);
          return true;
        }

        function markReportReady(result) {
          if (result) storeCompletedReport(result);
          loginAnalysisReady = true;
          setLoginProgress(100, loginText().readyStatus);
          const pill = document.getElementById("analysisPill");
          if (pill) pill.innerHTML = '<span class="dot"></span>' + (getLoginLocale() === "en-US" ? "Ready" : "已完成");
          if (loginButton && !loginClicked) {
            loginButton.disabled = false;
            loginButton.textContent = loginText().readyButton;
          }
          if (loginClicked) {
            showLoginLoader(loginText().completeTitle, loginText().completeSub);
            if (typeof window.updateLoaderProgress === "function") {
              window.updateLoaderProgress(100, loginText().completeTitle, loginText().completeSub, { instant: true });
            }
            setTimeout(function(){ window.location.href = "/result"; }, 500);
          }
        }

        function markAnalysisFailed(message) {
          setLoginProgress(100, message || loginText().failed);
          const pill = document.getElementById("analysisPill");
          if (pill) pill.innerHTML = '<span class="dot"></span>' + (getLoginLocale() === "en-US" ? "Failed" : "失败");
          if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = loginText().retryButton;
            loginButton.onclick = function(){ window.location.href = "/"; };
          }
        }

        async function pollLoginAnalysis() {
          startLoginProgressCreep();
          if (typeof Store === "undefined" || typeof getAnalysisJobAPI !== "function") {
            setTimeout(pollLoginAnalysis, 300);
            return;
          }
          const s = Store.get();
          if (s.reportId && s.atsResult) {
            markReportReady(null);
            return;
          }
          if (!s.analysisJobId) {
            if (await completeWithScoreFallback("missing_job_id")) return;
            setLoginProgress(12, loginText().waiting);
            if (typeof window.updateLoaderProgress === "function") {
              window.updateLoaderProgress(12, loginText().waiting, loginText().redirect);
            }
            return;
          }
          try {
            const job = await getAnalysisJobAPI(s.analysisJobId);
            Store.set({ analysisJobStatus: job.status, analysisJobStage: job.stage });
            if (job.status === "completed" && job.result) {
              markReportReady(job.result);
              return;
            }
            if (job.status === "failed") {
              markAnalysisFailed(job.error ? loginText().failedPrefix + job.error : loginText().failed);
              return;
            }
            syncAnalysisProgress(job);
            setTimeout(pollLoginAnalysis, 1200);
          } catch (error) {
            if (error && (error.code === "JOB_NOT_FOUND" || error.message === "JOB_NOT_FOUND")) {
              if (await completeWithScoreFallback("job_not_found")) return;
            }
            const message = error && (error.code === "JOB_NOT_FOUND" || error.message === "JOB_NOT_FOUND")
              ? loginText().interrupted
              : loginText().unknown;
            markAnalysisFailed(message);
          }
        }

        (function(){
          const s = JSON.parse(localStorage.getItem("resumeFixMVP") || "{}");
          const nameEl = document.getElementById("resumeFileName");
          if (nameEl) nameEl.textContent = s.resumeName || (getLoginLocale() === "en-US" ? "No resume detected. Please return to the home page and upload one." : "未检测到简历，请返回首页上传");
          const atsR = s.atsResult || {};
          function isPlaceholder(v) {
            return !v || /依\\s*JD|自动识别|根据\\s*JD|unknown|select\\s+target\\s+role|target\\s+role|^目标岗位$|选择目标岗位|请选择/i.test(String(v));
          }
          const jobT = normalizeDisplayTargetJobStrict([
            s.targetLabel,
            s.targetRole,
            s.selectedTargetRole,
            s.selectedRole,
            s.jobTitle,
            atsR.targetLabel,
            atsR.targetRole,
            atsR.profile && atsR.profile.targetRole,
            atsR.raw && atsR.raw.profile && atsR.raw.profile.targetRole,
            atsR.jobTitle,
            atsR.raw && atsR.raw.jobTitle
          ].find(function(v){ return v && !isPlaceholder(v); }) || "");
          const jobEl = document.getElementById("resumeJobTitle");
          if (jobEl) jobEl.textContent = jobT ? loginText().targetPrefix + jobT : loginText().targetFromJd;
        })();

        function handleWechatLogin(btn){
          if (!btn || btn.dataset.loginStarted === "1") return;
          btn.dataset.loginStarted = "1";
          loginButton = btn;
          loginClicked = true;
          btn.disabled = true;
          showLoginLoader(loginText().reading, loginText().redirect, false);
          if (typeof window.updateLoaderProgress === "function") {
            window.updateLoaderProgress(loginVisualPct, loginText().reading, loginText().redirect);
          }
          setStorePatch({ userId: "mock_" + Date.now(), loginAt: Date.now() });
          const snapshot = readStoreSnapshot();
          if (loginAnalysisReady || (snapshot.reportId && snapshot.atsResult)) {
            showLoginLoader(loginText().completeTitle, loginText().completeSub);
            setTimeout(function(){ window.location.href = "/result"; }, 500);
            return;
          }
          btn.textContent = loginText().generatingButton;
          setLoginProgress(loginVisualPct, loginText().readingStatus);
          pollLoginAnalysis();
        }

        const wechatLoginButton = document.getElementById("wechatLoginButton");
        if (wechatLoginButton) {
          wechatLoginButton.addEventListener("click", function(e) {
            e.preventDefault();
            handleWechatLogin(wechatLoginButton);
          });
        }
        window.mockLogin = handleWechatLogin;
      `}</Script>
    </>
  );
}
