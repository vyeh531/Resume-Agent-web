'use client';
import Script from 'next/script';

function ResultHeader() {
  return (
    <header className="brandbar result-header">
      <div className="brand">
        <img src="/logo/logo%20banner_no_bg.png" alt="MentorX 蔓藤教育" className="brand-img" />
      </div>
      <div className="brand-meta result-stepper">1 / 2 · 诊断完成</div>
    </header>
  );
}

function DiagnosisStatusBar() {
  return (
    <div className="banner result-status-banner fade-in">
      <div className="banner-check">✓</div>
      <div>诊断完成 · 4 位导师已读完你的简历</div>
    </div>
  );
}

function ScoreHeroCard() {
  return (
    <section className="section result-summary-panel" id="score-summary">
      <div className="result-score-block">
        <div className="result-eyebrow">Resume Score</div>
        <div className="result-score-line">
          <span className="result-score-number" id="atsHeadlineScore">--</span>
          <span className="result-score-denominator">/100</span>
        </div>
        <div className="result-score-badges">
          <span className="result-risk-badge">Needs Improvement</span>
          <span className="result-risk-badge result-risk-badge-warn">高风险</span>
        </div>
        <p className="result-score-conclusion">
          距离目标岗位仍有明显差距，优先补齐岗位关键词、技能证据和量化成果。
        </p>
      </div>

      <div className="result-summary-copy">
        <div className="student-row">
          <span className="who" id="studentInfo">正在读取简历信息…</span>
          <span className="pill pill-mute" id="targetJob">目标:读取中</span>
        </div>
        <h2 className="summary-headline" id="headline">
          离顶级 Offer 线 <span className="gap" id="headlineSalaryTop">--</span> 仍有差距。
        </h2>
        <p className="summary-issue" id="coreIssue"></p>
        <div className="result-issue-list" aria-label="Top 3 Issues">
          <span>Top issues</span>
          <ol>
            <li>JD 关键词覆盖不足</li>
            <li>技能匹配与目标岗位不够直接</li>
            <li>经历中的量化结果偏少</li>
          </ol>
        </div>
        <div className="result-hero-actions">
          <a className="btn btn-jade" href="#mentor-advice">查看优化建议</a>
          <a className="btn result-secondary-btn" href="#score-breakdown">查看评分细节</a>
        </div>
      </div>
    </section>
  );
}

function MetricOverviewCards() {
  const cards = [
    {
      key: 'jd',
      label: 'JD 匹配度',
      value: <span id="rankPct">--</span>,
      caption: '关键词覆盖偏低',
      detailId: 'rankDetail',
      tone: 'purple',
    },
    {
      key: 'ats',
      label: 'ATS 可读性',
      value: (
        <span>
          <span id="atsScore">--</span><span className="tile-percent">%</span>
        </span>
      ),
      caption: <span id="atsRiskCaption">主流系统识别</span>,
      detailId: 'atsDetail',
      tone: 'red',
    },
    {
      key: 'salary',
      label: 'Salary · 薪资成长',
      value: <span id="salaryRange">--</span>,
      caption: <>5年上限 <span id="salaryTop">--</span></>,
      detailId: 'salaryDetail',
      tone: 'blue',
    },
    {
      key: 'ai',
      label: 'AI 影响趋势',
      value: <span id="compCount">--</span>,
      caption: <span id="admitRate">待校准</span>,
      detailId: 'compDetail',
      tone: 'orange',
    },
  ];

  return (
    <section className="section result-metrics-panel" id="score-breakdown">
      <div className="result-section-head">
        <div>
          <div className="section-num">数据维度</div>
          <h3 className="section-title">从 4 个角度看你的位置</h3>
        </div>
        <p className="section-desc">四个维度直接展开，看摘要和风险，不需要再切换。</p>
      </div>
      <div className="result-dimension-grid" id="tilesArea" aria-label="数据维度">
        {cards.map((card) => (
          <article className={`result-dimension-card result-dimension-card--${card.tone}`} key={card.key}>
            <header className="result-dimension-card-head">
              <div>
                <div className="tile-label">{card.label}</div>
                <div className="tile-value">{card.value}</div>
              </div>
              <div className="result-dimension-marker" aria-hidden="true"></div>
            </header>
            <div className="tile-caption">{card.caption}</div>
            <div className="result-dimension-divider"></div>
            <div className="tile-detail" id={card.detailId}></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AtsSystemCard() {
  return (
    <section className="section result-ats-panel" id="atsDetailSection" hidden>
      <div className="result-section-head">
        <div>
          <div className="section-num">ATS 诊断</div>
          <h3 className="section-title">ATS System 评分</h3>
        </div>
      </div>
      <div className="card result-ats-card">
        <div className="result-ats-visual">
          <div id="atsRiskBadge"></div>
          <div id="atsTotalScore"></div>
          <svg id="atsRadarChart" width="360" height="320" viewBox="0 0 360 320"></svg>
        </div>
        <div className="result-ats-copy">
          <div id="atsSystemSummary"></div>
          <div id="atsDimensionProblems"></div>
          <details id="atsProblemsDetails" className="ats-preview-details" open>
            <summary>
              <span>关键问题</span><span id="atsProblemsChev">▾</span>
            </summary>
            <ul id="atsProblems"></ul>
          </details>
          <details id="atsSuggestionsDetails" className="ats-preview-details" open hidden>
            <summary>
              <span>优先建议</span><span id="atsSuggestionsChev">▾</span>
            </summary>
            <ul id="atsSuggestions"></ul>
          </details>
        </div>
      </div>
    </section>
  );
}

function JdKeywordCard() {
  return (
    <section className="section result-keywords-panel">
      <div className="result-keyword-aside">
        <div className="section-num">JD KEYWORDS</div>
        <div className="row-between mb-12">
          <h3 className="section-title" id="skillSectionTitle">JD Keyword 清单</h3>
          <div className="skill-score"><small>已覆盖 </small><span id="skillHave">0</span><small> / <span id="skillTotal">--</span></small></div>
        </div>
        <p className="skill-section-desc" id="skillSectionDesc">这些是系统从 JD 中识别出的关键词。优先把待补强项写进 Summary、Skills 或 Experience。</p>
        <div className="skill-summary" id="skillSummary"></div>
        <div className="skill-legend">
          <span><i style={{background:'var(--good)'}}></i>已具备</span>
          <span><i style={{background:'var(--warn)'}}></i>待补强</span>
        </div>
      </div>
      <div className="card card-tight result-keyword-table-card">
        <ul className="skill-list" id="skillListTop3"></ul>
        <button className="skill-expand-toggle" id="skillExpandToggle" type="button">查看更多 ↓</button>
        <div className="skill-paywall" id="skillPaywall" hidden>
          <ul className="skill-list skill-paywall-list" id="skillPaywallList"></ul>
          <div className="skill-paywall-overlay">
            <div className="lock">🔒</div>
            <div className="text">完整 JD Keyword 清单会随下方完整诊断一起解锁<br/><span style={{color:'var(--ink-soft)',fontWeight:500}}>包含关键词放置建议和改写报告</span></div>
            <a className="result-lock-cta-button" href="/payment">解锁更多内容</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function MentorAdvicePreview() {
  return (
    <section className="section result-mentor-free-panel" id="mentor-advice">
      <div className="section-num">免费试读 · 3 条建议</div>
      <h3 className="section-title">导师建议预览</h3>
      <p className="section-desc">由 MentorX 导师知识库中的真实大厂经验交叉匹配，系统会优先挑出最贴合你简历问题的建议。</p>
      <article className="mentor-detail" id="mentorFree"></article>
    </section>
  );
}

function UnlockSidebarCard() {
  return (
    <aside className="section result-mentor-locked-panel result-mentor-unlock-card">
      <div className="result-unlock-copy">
        <div>
          <div className="section-num">付费解锁 · 9 条深度建议</div>
          <h3 className="section-title">更多导师建议 <span className="text-mute">(付费解锁)</span></h3>
          <p className="section-desc">融合 4 位导师完整建议、JD Keyword 放置建议和可导出的改写报告，不再分散成多个解锁入口。</p>
        </div>
        <div className="result-unlock-price" aria-label="解锁价格">
          <span><b>¥</b>49</span>
          <small>原价 ¥199</small>
        </div>
      </div>
      <div className="result-unlock-body">
        <div className="result-unlock-preview">
          <div className="stack-12" id="lockedMentorsArea"></div>
          <ul className="result-unlock-perks">
            <li>4 位大厂导师完整建议</li>
            <li>完整 JD Keyword 清单 + 放置建议</li>
            <li>报告导出 .md，可直接给 ChatGPT / Claude 改简历</li>
          </ul>
          <a href="/payment" className="btn btn-jade result-unlock-button">¥ 49 立即解锁 →</a>
        </div>
      </div>
    </aside>
  );
}

export default function ResultPage() {
  return (
    <>
      <style>{`
        .summary-headline{font-family:var(--serif);font-weight:700;font-size:22px;line-height:1.4;margin:12px 0 8px;letter-spacing:-0.01em}
        .summary-headline .num{font-style:italic;color:var(--indigo);font-size:32px}
        .summary-headline .gap{font-style:italic;color:var(--rose);font-weight:700}
        .summary-issue{font-size:14px;color:var(--ink-soft);line-height:1.6;border-left:3px solid var(--apricot);padding:4px 0 4px 12px;margin-top:12px}
        .student-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:4px}
        .student-row .who{font-size:13px;color:var(--ink-soft)}
        .skill-list{list-style:none;padding:0;margin:0}
        .skill-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px dashed var(--line);gap:10px}
        .skill-row:last-child{border-bottom:none}
        .skill-name{font-size:14px;font-weight:500}
        .skill-name .priority{font-family:var(--mono);font-size:10px;color:var(--ink-mute);margin-right:8px;letter-spacing:0}
        .skill-summary{display:flex;gap:4px;height:8px;border-radius:999px;overflow:hidden;margin:12px 0 12px}
        .skill-summary span{flex:1;transition:flex 1s ease}
        .skill-have{background:var(--good)}
        .skill-weak{background:var(--warn)}
        .skill-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--ink-soft);margin-bottom:14px}
        .skill-legend span{display:inline-flex;align-items:center;gap:5px}
        .skill-legend i{width:8px;height:8px;border-radius:50%;display:inline-block}
        .skill-section-desc{font-size:12.5px;color:var(--ink-soft);line-height:1.55;margin:-4px 0 12px}
        .keyword-use{font-size:10.5px;font-weight:700;border-radius:999px;padding:3px 7px;border:1px solid var(--line);white-space:nowrap;background:#fff;color:var(--ink-soft)}
        .keyword-use--skills{background:var(--jade-soft);color:var(--jade);border-color:var(--line)}
        .keyword-use--experience{background:#fff7ed;color:#9a3412;border-color:#fed7aa}
        .keyword-use--summary{background:#eef2ff;color:#4338ca;border-color:#c7d2fe}
        .keyword-use--reference{background:#F7F3FC;color:#5F567A;border-color:#E6DEF2}
        .skill-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end}
        .jd-keyword-details{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}
        .jd-keyword-details summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:center;gap:6px;color:var(--ink-soft);font-size:13px;font-weight:700;padding:6px 0}
        .jd-keyword-details summary::-webkit-details-marker{display:none}
        .jd-keyword-groups{display:grid;gap:10px;margin-top:8px}
        .jd-keyword-groups.is-locked{filter:blur(4px);user-select:none;pointer-events:none}
        .jd-keyword-group{border:1px solid var(--line);background:#fff;border-radius:10px;padding:10px 11px}
        .jd-keyword-group-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
        .jd-keyword-group-title{font-size:12px;font-weight:800;color:var(--ink);letter-spacing:.01em}
        .jd-keyword-group-count{font-family:var(--mono);font-size:10px;color:var(--ink-mute)}
        .jd-keyword-chips{display:flex;flex-wrap:wrap;gap:6px}
        .jd-keyword-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:4px 8px;font-size:11.5px;color:var(--ink-soft);max-width:100%}
        .jd-keyword-chip b{font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .jd-keyword-chip .state{width:6px;height:6px;border-radius:50%;flex-shrink:0;background:var(--warn)}
        .jd-keyword-chip.is-have .state{background:var(--good)}
        .jd-keyword-paywall{position:relative;min-height:142px;margin-top:10px;border:1px dashed var(--line);border-radius:10px;overflow:hidden;background:#F7F3FC}
        .jd-keyword-paywall .paywall-more-list{filter:blur(4px);user-select:none;pointer-events:none;padding:12px}
        .result-mentor-unlock-card{position:relative;overflow:hidden;background:linear-gradient(180deg,#FFFFFF 0%,#FBFAFF 100%);border:1px solid #E6DEF2;box-shadow:0 18px 46px rgba(69,42,147,.07)}
        .result-mentor-unlock-card::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 86% 18%,rgba(122,82,197,.13) 0%,transparent 34%);pointer-events:none}
        .result-mentor-unlock-card > *{position:relative}
        .result-unlock-copy{display:flex;justify-content:space-between;gap:24px;align-items:flex-start;margin-bottom:18px}
        .result-unlock-copy .section-desc{max-width:660px}
        .result-unlock-price{min-width:128px;border:1px solid rgba(83,51,166,.16);background:#fff;border-radius:16px;padding:12px 14px;text-align:center;box-shadow:0 12px 28px rgba(69,42,147,.06)}
        .result-unlock-price span{display:block;font-family:var(--serif);font-style:italic;font-weight:800;font-size:34px;line-height:1;color:var(--indigo)}
        .result-unlock-price span b{font-size:18px;margin-right:2px}
        .result-unlock-price small{display:block;margin-top:5px;color:var(--ink-mute);font-size:12px;text-decoration:line-through}
        .result-unlock-body{display:block}
        .result-unlock-preview{min-width:0;border:1px solid rgba(83,51,166,.12);border-radius:18px;background:linear-gradient(180deg,#F9F6FF 0%,#FFFFFF 100%);padding:18px;box-shadow:inset 0 1px 0 rgba(255,255,255,.72)}
        .result-unlock-preview .locked-mentor-v2{min-height:150px!important;background:transparent!important;border:0!important;border-radius:0!important;box-shadow:none!important}
        .result-unlock-perks{list-style:none;padding:16px 0 0;margin:16px 0 0;border-top:1px solid rgba(83,51,166,.10);display:grid;gap:10px;color:var(--ink);font-size:13.5px;font-weight:650;line-height:1.45}
        .result-unlock-perks li{display:grid;grid-template-columns:18px minmax(0,1fr);gap:9px;align-items:start}
        .result-unlock-perks li::before{content:"✓";color:var(--indigo);font-weight:900;line-height:1.45}
        .result-unlock-button{width:100%;min-height:48px;justify-content:center;margin-top:16px;box-shadow:0 14px 28px rgba(83,51,166,.20)}
        @media (max-width: 760px){
          .result-unlock-copy{display:grid;gap:14px;margin-bottom:16px}
          .result-unlock-price{width:100%;min-width:0;box-sizing:border-box;display:flex;align-items:baseline;justify-content:center;gap:10px}
          .result-unlock-price small{margin-top:0}
          .result-unlock-preview{padding:16px}
          .result-unlock-preview .locked-mentor-v2{min-height:142px!important}
        }
        .logo-marquee{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff;margin:0 0 16px;padding:10px 0}
        .logo-marquee-track{display:flex;gap:14px;width:max-content;animation:logo-scroll 72s linear infinite}
        .logo-marquee:hover .logo-marquee-track{animation-play-state:paused}
        .mentor-logo-chip{width:72px;height:42px;border:1px solid var(--line);border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;padding:7px;flex:0 0 auto}
        .mentor-logo-chip img{max-width:100%;max-height:100%;object-fit:contain}
        .result-mentor-free-panel .section-num{margin-bottom:8px}
        .result-mentor-free-panel .section-title{margin:0 0 14px}
        .result-mentor-free-panel > .section-desc{margin:0 0 18px;line-height:1.65}
        .result-mentor-free-panel .mentor-logo-intro{margin:0 0 20px}
        .result-mentor-free-panel .mentor-logo-copy{font-size:12.5px;line-height:1.6;color:var(--ink-soft);margin:0 0 12px}
        .result-mentor-free-panel .logo-marquee{margin:0;padding:10px 0}
        .result-mentor-free-panel .mentor-detail{margin-top:20px}
        .mentor-logo-intro{margin:0 0 20px}
        .mentor-logo-copy{font-size:12.5px;line-height:1.6;color:var(--ink-soft);margin:0 0 12px}
        .paywall-more{position:relative;margin-top:8px;min-height:170px;border-radius:10px;overflow:hidden;border:1px dashed var(--line);background:#F7F3FC}
        .paywall-more-list{filter:blur(4px);user-select:none;pointer-events:none;padding:10px 12px}
        .paywall-more-list div{font-size:13px;line-height:1.5;margin:0 0 8px;padding-left:18px;position:relative;color:var(--ink-soft)}
        .paywall-more-overlay,.locked-preview-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-start;flex-direction:column;background:linear-gradient(180deg,rgba(247,243,252,.54) 0%,rgba(247,243,252,.96) 56%);backdrop-filter:blur(1px);padding:14px 18px 18px;text-align:center;box-sizing:border-box}
        .result-lock-cta{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;color:var(--ink);width:fit-content;max-width:100%;margin:auto;box-sizing:border-box}
        .result-lock-cta .lock{width:34px;height:34px;border-radius:50%;background:var(--ink);color:var(--paper-warm);display:grid;place-items:center;font-size:15px;box-shadow:0 8px 20px -8px rgba(24,24,22,.4)}
        .result-lock-cta .text{font-size:12.5px;font-weight:600;line-height:1.45;color:var(--ink)}
        .result-lock-cta .text b{color:var(--jade)}
        .result-lock-cta .text span{color:var(--ink-soft);font-weight:500}
        .result-lock-cta-button{display:inline-flex;align-items:center;justify-content:center;min-height:34px;margin-top:2px;padding:8px 16px;border-radius:999px;background:var(--jade,#5333A6);color:#fff;text-decoration:none;font-size:12.5px;font-weight:800;box-shadow:0 10px 22px rgba(83,51,166,.18)}
        .result-lock-cta-button:hover{background:#6843BB;color:#fff}
        .ats-preview-details .paywall-more{display:none}
        .ats-preview-details.is-expanded .paywall-more{display:block}
        @keyframes logo-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      `}</style>

      <div className="page result-page">
        <ResultHeader />
        <DiagnosisStatusBar />
        <ScoreHeroCard />
        <MetricOverviewCards />
        <AtsSystemCard />
        <JdKeywordCard />
        <div className="result-mentor-layout">
          <MentorAdvicePreview />
          <UnlockSidebarCard />
        </div>

        <div className="footnote">
          诊断由 4 位真实导师 + AI 联合产出 · 不构成 Offer 承诺<br/>
          Powered by <span>Vibe ID</span> · MentorX
        </div>
      </div>

      <Script src="/result-logic.js?v=edaix-purple-20260612-1" strategy="afterInteractive" />
    </>
  );
}
