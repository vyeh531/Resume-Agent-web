'use client';
import Script from 'next/script';

export default function AnalyzingPage() {
  return (
    <>
      <div className="page analyzing-page">
        <div className="brandbar">
          <div className="brand">
            <img src="/logo/logo%20banner_no_bg.png" alt="MentorX 蔓藤教育" className="brand-img" />
          </div>
          <div className="brand-meta" style={{fontSize:'10px',letterSpacing:'.08em'}}>分析中…</div>
        </div>

        <header className="analyzing-head fade-in">
          <div className="analyzing-icon"></div>
          <div>
            <h1>正在定位你的简历机会点</h1>
            <p>结合目标 JD、大厂导师经验与 HR 初筛视角分析</p>
          </div>
        </header>

        <div className="progress-card fade-in">
          <div className="progress-card-row">
            <div className="left">
              <span className="spinner-ring"></span>
              <span>深度分析中</span>
            </div>
            <div className="right">
              <span>约 20–35 秒</span>
              <span className="pct"><span id="pct">0</span>%</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill-anim" id="progressFill"></div>
          </div>
          <div className="progress-substatus" id="subStatus">正在扫描你的履历亮点…</div>
        </div>

        <div className="steps-card fade-in">
          <h3>分析进度</h3>
          <ul className="steps-list" id="stepsList">
            <li data-state="pending">
              <span className="step-icon"></span>
              <div className="step-body"><strong>扫描亮点</strong><p>识别最能打动 HR 的经历、技能和项目证据</p></div>
              <span className="step-status">等待</span>
            </li>
            <li data-state="pending">
              <span className="step-icon"></span>
              <div className="step-body"><strong>匹配导师</strong><p>从真实辅导经验中筛选最相关的大厂视角</p></div>
              <span className="step-status">等待</span>
            </li>
            <li data-state="pending">
              <span className="step-icon"></span>
              <div className="step-body"><strong>对照 JD</strong><p>比对关键词、职责语言和岗位匹配信号</p></div>
              <span className="step-status">等待</span>
            </li>
            <li data-state="pending">
              <span className="step-icon"></span>
              <div className="step-body"><strong>生成诊断</strong><p>输出最关键的简历风险和提升机会</p></div>
              <span className="step-status">等待</span>
            </li>
          </ul>
          <div className="steps-card-foot">
            <span>已用时 <span id="elapsed">0</span>s</span>
            <span>请保持网络连接</span>
          </div>
        </div>
      </div>

      <Script id="analyzing-logic" strategy="afterInteractive">{`
        if (typeof guardSubmitted === "function") {
          guardSubmitted();
        } else {
          try {
            const store = JSON.parse(localStorage.getItem("resumeFixMVP") || "{}");
            if (!store.resumeName && !store.reportId) window.location.href = "/";
          } catch {
            window.location.href = "/";
          }
        }
        const startedAt = Date.now();
        const pctEl = document.getElementById("pct");
        const fillEl = document.getElementById("progressFill");
        const subStatusEl = document.getElementById("subStatus");
        const elapsedEl = document.getElementById("elapsed");
        const stepEls = document.querySelectorAll("#stepsList li");
        const subStatuses = [
          { from: 0,  text: "正在扫描你的履历亮点…" },
          { from: 25, text: "正在对照目标岗位 JD…" },
          { from: 50, text: "正在匹配大厂导师经验…" },
          { from: 75, text: "正在定位高优先级问题…" },
          { from: 92, text: "正在生成你的初步诊断…" }
        ];
        const stepBoundaries = [25, 55, 80, 100];
        let visualPct = 8;
        let lastKnownJob = null;
        let analysisStopped = false;
        function applyProgress(pct) {
          pctEl.textContent = pct;
          fillEl.style.width = pct + "%";
          elapsedEl.textContent = Math.floor((Date.now() - startedAt) / 1000);
          for (let i = subStatuses.length - 1; i >= 0; i--){
            if (pct >= subStatuses[i].from){ subStatusEl.textContent = subStatuses[i].text; break; }
          }
          stepEls.forEach((li, idx) => {
            const myEnd = stepBoundaries[idx];
            const prevEnd = idx === 0 ? 0 : stepBoundaries[idx - 1];
            const status = li.querySelector(".step-status");
            if (pct >= myEnd){ li.dataset.state = "done"; status.textContent = "完成"; }
            else if (pct >= prevEnd){ li.dataset.state = "active"; status.textContent = "进行中…"; }
            else { li.dataset.state = "pending"; status.textContent = "等待"; }
          });
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
            freeMentorAdvice: publicReport.freeMentorAdvice || null,
            resultPageAdviceItems: publicReport.resultPageAdviceItems || null,
            lockedAdvicePreview: publicReport.lockedAdvicePreview || null,
            mentorLogoPool: publicReport.lockedAdvicePreview?.mentorLogoPool || publicReport.freeMentorAdvice?.mentorLogoPool || null,
            analysisJobStatus: "completed",
            analysisCompletedAt: Date.now(),
          });
        }
        async function pollJob() {
          if (typeof Store === "undefined" || typeof getAnalysisJobAPI !== "function") {
            setTimeout(pollJob, 300);
            return;
          }
          const store = Store.get();
          if (!store.analysisJobId) {
            if (store.reportId && store.atsResult) window.location.href = "/result";
            return;
          }
          try {
            const job = await getAnalysisJobAPI(store.analysisJobId);
            lastKnownJob = job;
            Store.set({ analysisJobStatus: job.status, analysisJobStage: job.stage });
            if (job.status === "completed" && job.result) {
              visualPct = 100;
              applyProgress(visualPct);
              storeCompletedReport(job.result);
              setTimeout(() => { window.location.href = "/result"; }, 500);
              return;
            }
            if (job.status === "failed") {
              analysisStopped = true;
              subStatusEl.textContent = "分析失败，请返回首页重试";
              Store.set({ analysisJobError: job.error || "analysis failed" });
              return;
            }
            visualPct = Math.max(visualPct, Math.min(94, Number(job.progress || 10)));
            applyProgress(Math.floor(visualPct));
            setTimeout(pollJob, 1200);
          } catch (error) {
            console.warn("[Analysis Job] poll failed", error.message);
            if (error.code === "JOB_NOT_FOUND" || error.message === "JOB_NOT_FOUND") {
              analysisStopped = true;
              Store.set({
                analysisJobId: null,
                analysisJobStatus: "failed",
                analysisJobError: "分析任务已中断，请返回首页重新提交。",
              });
              subStatusEl.textContent = "分析任务已中断，请返回首页重新提交。";
              return;
            }
            analysisStopped = true;
            Store.set({
              analysisJobStatus: "failed",
              analysisJobError: error.message || "analysis status polling failed",
            });
            subStatusEl.textContent = "无法确认分析状态，请返回首页重新提交，或改用简历文本粘贴方式。";
            stepEls.forEach((li) => {
              const status = li.querySelector(".step-status");
              if (li.dataset.state === "active" && status) status.textContent = "失败";
            });
          }
        }
        const tick = setInterval(() => {
          if (analysisStopped) {
            clearInterval(tick);
            return;
          }
          const elapsed = (Date.now() - startedAt) / 1000;
          const cap = lastKnownJob?.status === "completed" ? 100 : 94;
          const pct = Math.min(cap, Math.max(visualPct, Math.floor(12 + elapsed * 3)));
          visualPct = pct;
          pctEl.textContent = pct;
          fillEl.style.width = pct + "%";
          elapsedEl.textContent = Math.floor(elapsed);
          for (let i = subStatuses.length - 1; i >= 0; i--){
            if (pct >= subStatuses[i].from){ subStatusEl.textContent = subStatuses[i].text; break; }
          }
          stepEls.forEach((li, idx) => {
            const myEnd = stepBoundaries[idx];
            const prevEnd = idx === 0 ? 0 : stepBoundaries[idx - 1];
            const status = li.querySelector(".step-status");
            if (pct >= myEnd){ li.dataset.state = "done"; status.textContent = "完成"; }
            else if (pct >= prevEnd){ li.dataset.state = "active"; status.textContent = "进行中…"; }
            else { li.dataset.state = "pending"; status.textContent = "等待"; }
          });
          if (pct >= 100){ clearInterval(tick); setTimeout(() => { window.location.href = "/result"; }, 700); }
        }, 500);
        pollJob();
      `}</Script>
    </>
  );
}
