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
        .login-resume-mini .icon{width:36px;height:36px;border-radius:8px;background:var(--jade-soft);color:var(--jade);display:grid;place-items:center;font-size:16px;flex-shrink:0}
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
      `}</style>

      <div className="page login-page">
        <div className="brandbar">
          <div className="brand">
            <img src="/logo/logo%20banner_no_bg.png" alt="MentorX 蔓藤教育" className="brand-img" />
          </div>
          <div className="brand-meta" style={{fontSize:'10px',letterSpacing:'.08em'}}>2 / 5</div>
        </div>

        <div className="login-wrap fade-in">
          <div className="login-progress">
            <span className="active"></span>
            <span className="active"></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <div className="wechat-icon" aria-hidden="true">
            <svg className="wechat-mark" viewBox="0 0 64 56" focusable="false">
              <path d="M27.3 6C14.8 6 4.7 14.1 4.7 24.1c0 5.7 3.3 10.8 8.4 14.1L10.9 45l7.7-4c2.6.8 5.5 1.2 8.6 1.2 12.5 0 22.6-8.1 22.6-18.1C49.9 14.1 39.8 6 27.3 6Zm-7.8 12.9c-1.5 0-2.7-1.1-2.7-2.4s1.2-2.4 2.7-2.4 2.7 1.1 2.7 2.4-1.2 2.4-2.7 2.4Zm15.7 0c-1.5 0-2.7-1.1-2.7-2.4s1.2-2.4 2.7-2.4 2.7 1.1 2.7 2.4-1.2 2.4-2.7 2.4Z" fill="currentColor"/>
              <path d="M60 34.1c0-8.6-8.7-15.6-19.5-15.6S21 25.5 21 34.1s8.7 15.6 19.5 15.6c2.6 0 5.1-.4 7.4-1.1l6.6 3.4-1.9-5.8c4.5-2.8 7.4-7.2 7.4-12.1Zm-26.1-4.6c-1.2 0-2.2-.9-2.2-2s1-2 2.2-2 2.2.9 2.2 2-1 2-2.2 2Zm13.4 0c-1.2 0-2.2-.9-2.2-2s1-2 2.2-2 2.2.9 2.2 2-1 2-2.2 2Z" fill="currentColor" opacity=".92"/>
            </svg>
          </div>
          <h1 className="login-title">登录领取报告</h1>
          <p className="login-sub">分析已在后台开始，登录后即可查看结果</p>

          <div className="login-resume-mini" id="resumeMini">
            <div className="icon">📄</div>
            <div className="info">
              <div className="name" id="resumeFileName">简历加载中...</div>
              <div className="meta" id="resumeJobTitle">目标岗位</div>
            </div>
            <span className="pill pill-jade" id="analysisPill"><span className="dot"></span>分析中</span>
          </div>

          <div className="login-analysis" id="loginAnalysisProgress">
            <div className="login-analysis-row">
              <strong>报告生成进度</strong>
              <span className="login-analysis-pct"><span id="loginPct">8</span>%</span>
            </div>
            <div className="login-analysis-bar">
              <div className="login-analysis-fill" id="loginProgressFill"></div>
            </div>
            <div className="login-analysis-status" id="loginProgressStatus">正在扫描你的履历亮点，登录时会继续处理。</div>
          </div>

          <button className="btn btn-jade btn-block" id="wechatLoginButton" type="button">
            <span className="wechat-button-icon" aria-hidden="true">
              <svg viewBox="0 0 64 56" focusable="false">
                <path d="M27.3 6C14.8 6 4.7 14.1 4.7 24.1c0 5.7 3.3 10.8 8.4 14.1L10.9 45l7.7-4c2.6.8 5.5 1.2 8.6 1.2 12.5 0 22.6-8.1 22.6-18.1C49.9 14.1 39.8 6 27.3 6Zm-7.8 12.9c-1.5 0-2.7-1.1-2.7-2.4s1.2-2.4 2.7-2.4 2.7 1.1 2.7 2.4-1.2 2.4-2.7 2.4Zm15.7 0c-1.5 0-2.7-1.1-2.7-2.4s1.2-2.4 2.7-2.4 2.7 1.1 2.7 2.4-1.2 2.4-2.7 2.4Z" fill="currentColor"/>
                <path d="M60 34.1c0-8.6-8.7-15.6-19.5-15.6S21 25.5 21 34.1s8.7 15.6 19.5 15.6c2.6 0 5.1-.4 7.4-1.1l6.6 3.4-1.9-5.8c4.5-2.8 7.4-7.2 7.4-12.1Zm-26.1-4.6c-1.2 0-2.2-.9-2.2-2s1-2 2.2-2 2.2.9 2.2 2-1 2-2.2 2Zm13.4 0c-1.2 0-2.2-.9-2.2-2s1-2 2.2-2 2.2.9 2.2 2-1 2-2.2 2Z" fill="currentColor" opacity=".92"/>
              </svg>
            </span>
            微信一键登录
          </button>

          <div className="login-tip">
            <span style={{flexShrink:0}}>🔒</span>
            <span>我们不会公开你的简历，所有内容仅用于本次诊断。</span>
          </div>

          <div className="login-foot">
            登录代表你同意 <a href="#">《用户协议》</a> 和 <a href="#">《隐私政策》</a><br/>
            遇到问题？联系客服 <span style={{color:'var(--rose)'}}>mentorx-zhushou</span>
          </div>
        </div>
      </div>

      <Script id="login-logic" strategy="afterInteractive">{`
        let loginAnalysisReady = false;
        let loginClicked = false;
        let loginButton = null;
        let loginVisualPct = 8;

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

        function normalizeDisplayTargetJob(value) {
          return String(value || "")
            .replace(/^\\s*【(?:岗位|职位|职称|职务|招聘岗位|应聘岗位)】\\s*[：:]\\s*/i, "")
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
          loginVisualPct = Math.max(loginVisualPct, Math.min(100, Math.floor(pct)));
          const pctEl = document.getElementById("loginPct");
          const fillEl = document.getElementById("loginProgressFill");
          const statusEl = document.getElementById("loginProgressStatus");
          if (pctEl) pctEl.textContent = loginVisualPct;
          if (fillEl) fillEl.style.width = loginVisualPct + "%";
          if (statusEl && status) statusEl.textContent = status;
        }

        function storeCompletedReport(result) {
          const publicReport = result.publicReport || result.data || {};
          const atsResult = typeof formatATSResult === "function"
            ? formatATSResult({ ...publicReport, reportId: result.reportId, reportAccessToken: result.reportAccessToken })
            : publicReport;
          Store.set({
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
          });
        }

        function markReportReady(result) {
          if (result) storeCompletedReport(result);
          loginAnalysisReady = true;
          setLoginProgress(100, "报告已生成，登录后即可查看结果。");
          const pill = document.getElementById("analysisPill");
          if (pill) pill.innerHTML = '<span class="dot"></span>已完成';
          if (loginButton && !loginClicked) {
            loginButton.disabled = false;
            loginButton.textContent = "微信一键登录 · 查看报告";
          }
          if (loginClicked) {
            showLoginLoader("诊断完成！", "报告已生成，正在进入结果页…");
            setTimeout(function(){ window.location.href = "/result"; }, 500);
          }
        }

        function markAnalysisFailed(message) {
          setLoginProgress(100, message || "分析失败，请返回首页重新提交，或改用简历文本粘贴方式。");
          const pill = document.getElementById("analysisPill");
          if (pill) pill.innerHTML = '<span class="dot"></span>失败';
          if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = "返回首页重新提交";
            loginButton.onclick = function(){ window.location.href = "/"; };
          }
        }

        async function pollLoginAnalysis() {
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
            setLoginProgress(12, "等待分析任务启动。");
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
              markAnalysisFailed(job.error ? "分析失败：" + job.error : "分析失败，请返回首页重新提交，或改用简历文本粘贴方式。");
              return;
            }
            const stageText = job.stage === "scoring"
              ? "正在对照目标岗位 JD。"
              : job.stage === "retrieving_advice"
                ? "正在匹配大厂导师经验。"
                : "正在扫描你的履历亮点。";
            setLoginProgress(Math.min(94, job.progress || 12), stageText);
            setTimeout(pollLoginAnalysis, 1200);
          } catch (error) {
            const message = error && (error.code === "JOB_NOT_FOUND" || error.message === "JOB_NOT_FOUND")
              ? "分析任务已中断，请返回首页重新提交。"
              : "无法确认分析状态，请返回首页重新提交，或改用简历文本粘贴方式。";
            markAnalysisFailed(message);
          }
        }

        (function(){
          const s = JSON.parse(localStorage.getItem("resumeFixMVP") || "{}");
          const nameEl = document.getElementById("resumeFileName");
          if (nameEl) nameEl.textContent = s.resumeName || "未检测到简历，请返回首页上传";
          const atsR = s.atsResult || {};
          function isPlaceholder(v) {
            return !v || /依\\s*JD|自动识别|根据\\s*JD|unknown|^目标岗位$/i.test(String(v));
          }
          const jobT = normalizeDisplayTargetJobStrict([s.targetLabel, s.jobTitle, atsR.jobTitle, atsR.raw && atsR.raw.jobTitle].find(function(v){ return v && !isPlaceholder(v); }) || "");
          const jobEl = document.getElementById("resumeJobTitle");
          if (jobEl) jobEl.textContent = jobT ? "目标岗位：" + jobT : "目标岗位：根据 JD 分析";
        })();

        function handleWechatLogin(btn){
          if (!btn || btn.dataset.loginStarted === "1") return;
          btn.dataset.loginStarted = "1";
          loginButton = btn;
          loginClicked = true;
          btn.disabled = true;
          showLoginLoader("正在扫描你的履历亮点…", "先找出最能打动 HR 的经历、技能和项目证据", true);
          setStorePatch({ userId: "mock_" + Date.now(), loginAt: Date.now() });
          const snapshot = readStoreSnapshot();
          if (loginAnalysisReady || (snapshot.reportId && snapshot.atsResult)) {
            showLoginLoader("诊断完成！", "报告已生成，正在进入结果页…");
            setTimeout(function(){ window.location.href = "/result"; }, 500);
            return;
          }
          btn.textContent = "报告生成中...";
          setLoginProgress(loginVisualPct, "已登录，报告完成后将自动跳转。");
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
