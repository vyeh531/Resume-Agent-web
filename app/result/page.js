'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

function ResultHeader() {
  return (
    <header className="brandbar result-header">
      <div className="brand">
        <img src="/logo/logo%20banner_no_bg.png" alt="EdAIX" className="brand-img" />
      </div>
      <div className="brand-meta result-stepper">1 / 2 - Diagnosis complete</div>
    </header>
  );
}

function DiagnosisStatusBar() {
  return (
    <div className="banner result-status-banner fade-in">
      <div className="banner-check">✓</div>
      <div>Diagnosis complete - 4 mentors reviewed your resume</div>
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
          <span className="result-risk-badge result-risk-badge-warn">High risk</span>
        </div>
        <p className="result-score-conclusion">
          You still have a clear gap from the target role. Prioritize JD keywords, skill evidence, and measurable outcomes.
        </p>
      </div>

      <div className="result-summary-copy">
        <div className="student-row">
          <span className="who" id="studentInfo">Reading resume information...</span>
          <span className="pill pill-mute" id="targetJob">Target: loading</span>
        </div>
        <h2 className="summary-headline" id="headline">
          You still have a gap before reaching the top offer line.
        </h2>
        <p className="summary-issue" id="coreIssue"></p>
        <div className="result-issue-list" aria-label="Top 3 Issues">
          <span>Top issues</span>
          <ol>
            <li>JD keyword coverage is too low</li>
            <li>Skill match is not direct enough</li>
            <li>Experience bullets need more measurable impact</li>
          </ol>
        </div>
        <div className="result-hero-actions">
          <a className="btn btn-jade" href="#mentor-advice">View recommendations</a>
          <a className="btn result-secondary-btn" href="#score-breakdown">View score details</a>
        </div>
      </div>
    </section>
  );
}

function MetricOverviewCards() {
  const cards = [
    {
      key: 'jd',
      label: 'JD match',
      value: <span id="rankPct">--</span>,
      caption: 'Keyword coverage is low',
      detailId: 'rankDetail',
      tone: 'purple',
    },
    {
      key: 'ats',
      label: 'ATS readability',
      value: (
        <span>
          <span id="atsScore">--</span><span className="tile-percent">%</span>
        </span>
      ),
      caption: <span id="atsRiskCaption">Mainstream ATS parsing</span>,
      detailId: 'atsDetail',
      tone: 'red',
    },
    {
      key: 'salary',
      label: 'Salary growth',
      value: <span id="salaryRange">--</span>,
      caption: <>5-year upside <span id="salaryTop">--</span></>,
      detailId: 'salaryDetail',
      tone: 'blue',
    },
    {
      key: 'ai',
      label: 'AI impact trend',
      value: <span id="compCount">--</span>,
      caption: <span id="admitRate">Calibrating</span>,
      detailId: 'compDetail',
      tone: 'orange',
    },
  ];

  return (
    <section className="section result-metrics-panel" id="score-breakdown">
      <div className="result-section-head">
        <div>
          <div className="section-num">Data dimensions</div>
          <h3 className="section-title">See your position from 4 angles</h3>
        </div>
        <p className="section-desc">Each dimension expands directly so you can scan the summary and risk.</p>
      </div>
      <div className="result-dimension-grid" id="tilesArea" aria-label="Data dimensions">
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
          <div className="section-num">ATS diagnosis</div>
          <h3 className="section-title">ATS system score</h3>
        </div>
      </div>
      <div className="card result-ats-card">
        <div className="result-ats-visual">
          <div id="atsRiskBadge"></div>
          <div id="atsTotalScore"></div>
          <svg id="atsRadarChart" width="100%" height="340" viewBox="-58 0 476 340"></svg>
        </div>
        <div className="result-ats-copy">
          <div id="atsSystemSummary"></div>
          <div id="atsDimensionProblems"></div>
          <details id="atsProblemsDetails" className="ats-preview-details" open>
            <summary>
              <span>Key issues</span><span id="atsProblemsChev">▾</span>
            </summary>
            <ul id="atsProblems"></ul>
          </details>
          <details id="atsSuggestionsDetails" className="ats-preview-details" open hidden>
            <summary>
              <span>Priority recommendations</span><span id="atsSuggestionsChev">▾</span>
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
          <h3 className="section-title" id="skillSectionTitle">JD keyword checklist</h3>
          <div className="skill-score"><small>Covered </small><span id="skillHave">0</span><small> / <span id="skillTotal">--</span></small></div>
        </div>
        <p className="skill-section-desc" id="skillSectionDesc">These are keywords detected from the JD. Prioritize missing items in Summary, Skills, or Experience.</p>
        <div className="skill-summary" id="skillSummary"></div>
        <div className="skill-legend">
          <span><i style={{background:'var(--good)'}}></i>Covered</span>
          <span><i style={{background:'var(--warn)'}}></i>Needs work</span>
        </div>
      </div>
      <div className="card card-tight result-keyword-table-card">
        <ul className="skill-list" id="skillListTop3"></ul>
        <button className="skill-expand-toggle" id="skillExpandToggle" type="button">View more ↓</button>
        <div className="skill-paywall" id="skillPaywall" hidden>
          <ul className="skill-list skill-paywall-list" id="skillPaywallList"></ul>
          <div className="skill-paywall-overlay">
            <div className="lock" aria-hidden="true"></div>
            <div className="text">The full JD keyword checklist unlocks with the complete diagnosis<br/><span style={{color:'var(--ink-soft)',fontWeight:500}}>Includes keyword placement guidance and rewrite report</span></div>
            <a className="result-lock-cta-button" href="/payment">Unlock more</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function MentorAdvicePreview() {
  return (
    <section className="section result-mentor-free-panel" id="mentor-advice">
      <div className="section-num">Free preview - 3 recommendations</div>
      <h3 className="section-title">Mentor advice preview</h3>
      <p className="section-desc">Matched from EdAIX's mentor knowledge base and prioritized for your resume risks.</p>
      <article className="mentor-detail" id="mentorFree"></article>
    </section>
  );
}

function UnlockSidebarCard() {
  return (
    <aside className="section result-mentor-locked-panel result-mentor-unlock-card">
      <div className="result-unlock-copy">
        <div>
          <div className="section-num">Unlock - 9 deeper recommendations</div>
          <h3 className="section-title">More mentor recommendations <span className="text-mute">(paid unlock)</span></h3>
          <p className="section-desc">Unlock the full mentor plan, JD keyword placement guidance, and exportable rewrite report.</p>
        </div>
        <div className="result-unlock-price" aria-label="Unlock price">
          <span><b>¥</b>49</span>
          <small>Was ¥199</small>
        </div>
      </div>
      <div className="result-unlock-body">
        <div className="result-unlock-preview">
          <div className="stack-12" id="lockedMentorsArea"></div>
          <ul className="result-unlock-perks">
            <li>Full recommendations from 4 industry mentors</li>
            <li>Full JD keyword checklist + placement guidance</li>
            <li>Exportable .md report for ChatGPT / Claude resume rewriting</li>
          </ul>
          <a href="/payment" className="btn btn-jade result-unlock-button">¥49 Unlock now →</a>
        </div>
      </div>
    </aside>
  );
}

function DesktopResultLayout() {
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
        .paywall-more-overlay,.locked-preview-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;background:linear-gradient(180deg,rgba(247,243,252,.54) 0%,rgba(247,243,252,.96) 56%);backdrop-filter:blur(1px);padding:14px 18px 18px;text-align:center;box-sizing:border-box}
        .result-lock-cta{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;color:var(--ink);width:fit-content;max-width:100%;margin:auto;box-sizing:border-box}
        .result-lock-cta .lock{width:34px;height:34px;border-radius:50%;background:var(--ink);color:var(--paper-warm);display:grid;place-items:center;font-size:15px;box-shadow:0 8px 20px -8px rgba(24,24,22,.4)}
        .result-lock-cta .lock::before{content:"";width:15px;height:15px;display:block;background:currentColor;-webkit-mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='5' y='10' width='14' height='10' rx='2'/><path d='M8 10V7a4 4 0 0 1 8 0v3h-2V7a2 2 0 0 0-4 0v3z'/></svg>") center/contain no-repeat;mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='5' y='10' width='14' height='10' rx='2'/><path d='M8 10V7a4 4 0 0 1 8 0v3h-2V7a2 2 0 0 0-4 0v3z'/></svg>") center/contain no-repeat}
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
          Diagnosis produced by real mentors + AI. Not an offer guarantee.<br/>
          Powered by <span>Vibe ID</span> - EdAIX
        </div>
      </div>

    </>
  );
}




function MobileResultLayout() {
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
        .unlock-cta{background:linear-gradient(135deg,#452A93 0%,#5333A6 45%,#7A52C5 100%);color:#fff;border-radius:var(--r-lg);padding:22px;text-align:center;margin-top:16px;position:relative;overflow:hidden;box-shadow:var(--shadow-pop)}
        .unlock-cta::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 80% 20%,rgba(180,126,219,.32) 0%,transparent 50%);pointer-events:none}
        .unlock-cta > *{position:relative}
        .unlock-cta-title{font-family:var(--serif);font-weight:700;font-size:18px;margin:0 0 8px}
        .unlock-cta-price{margin:12px 0 18px;display:flex;align-items:baseline;justify-content:center;gap:10px}
        .unlock-cta-price .now{font-family:var(--serif);font-style:italic;font-weight:700;font-size:40px;color:#FFFFFF}
        .unlock-cta-price .now b{font-size:22px}
        .unlock-cta-price .was{color:rgba(255,255,255,.5);font-size:14px;text-decoration:line-through}
        .unlock-cta-perks{list-style:none;padding:0;margin:0 0 16px;font-size:13px;color:rgba(255,255,255,.85);text-align:left;display:inline-flex;flex-direction:column;gap:6px}
        .unlock-cta-perks li{display:flex;gap:8px;align-items:flex-start}
        .unlock-cta-perks li::before{content:"✓";color:#B47EDB;font-weight:700;flex-shrink:0}
        .unlock-cta-foot{font-size:11px;color:rgba(255,255,255,.5);margin-top:12px;font-family:var(--mono);letter-spacing:.04em}
        .unlock-cta .btn-jade{background:#FFFFFF;color:var(--indigo);box-shadow:0 12px 28px rgba(31,23,68,.22);font-weight:700}
        .unlock-cta .btn-jade:hover{background:#F4EDFB}
        .logo-marquee{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff;margin:0 0 16px;padding:10px 0}
        .logo-marquee-track{display:flex;gap:14px;width:max-content;animation:logo-scroll 72s linear infinite}
        .logo-marquee:hover .logo-marquee-track{animation-play-state:paused}
        .mentor-logo-chip{width:72px;height:42px;border:1px solid var(--line);border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;padding:7px;flex:0 0 auto}
        .mentor-logo-chip img{max-width:100%;max-height:100%;object-fit:contain}
        .mentor-logo-intro{margin:4px 0 14px}
        .mentor-logo-copy{font-size:12.5px;line-height:1.55;color:var(--ink-soft);margin:0 0 8px}
        .paywall-more{position:relative;margin-top:8px;min-height:170px;border-radius:10px;overflow:hidden;border:1px dashed var(--line);background:#F7F3FC}
        .paywall-more-list{filter:blur(4px);user-select:none;pointer-events:none;padding:10px 12px}
        .paywall-more-list div{font-size:13px;line-height:1.5;margin:0 0 8px;padding-left:18px;position:relative;color:var(--ink-soft)}
        .paywall-more-overlay,.locked-preview-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;background:linear-gradient(180deg,rgba(247,243,252,.54) 0%,rgba(247,243,252,.96) 56%);backdrop-filter:blur(1px);padding:14px 18px 18px;text-align:center;box-sizing:border-box}
        .result-lock-cta{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;color:var(--ink);width:fit-content;max-width:100%;margin:0 auto;box-sizing:border-box}
        .result-lock-cta .lock{width:34px;height:34px;border-radius:50%;background:var(--ink);color:var(--paper-warm);display:grid;place-items:center;font-size:15px;box-shadow:0 8px 20px -8px rgba(24,24,22,.4)}
        .result-lock-cta .lock::before{content:"";width:15px;height:15px;display:block;background:currentColor;-webkit-mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='5' y='10' width='14' height='10' rx='2'/><path d='M8 10V7a4 4 0 0 1 8 0v3h-2V7a2 2 0 0 0-4 0v3z'/></svg>") center/contain no-repeat;mask:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><rect x='5' y='10' width='14' height='10' rx='2'/><path d='M8 10V7a4 4 0 0 1 8 0v3h-2V7a2 2 0 0 0-4 0v3z'/></svg>") center/contain no-repeat}
        .result-lock-cta .text{font-size:12.5px;font-weight:600;line-height:1.45;color:var(--ink)}
        .result-lock-cta .text b{color:var(--jade)}
        .result-lock-cta .text span{color:var(--ink-soft);font-weight:500}
        .result-lock-cta .btn{font-size:13px;padding:9px 18px;min-height:auto}
        .ats-preview-details .paywall-more{display:none}
        .ats-preview-details.is-expanded .paywall-more{display:block}
        @keyframes logo-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      `}</style>

      <div className="page mobile-result-page">
        <div className="brandbar">
          <div className="brand">
            <img src="/logo/logo%20banner_no_bg.png" alt="EdAIX" className="brand-img" />
          </div>
          <div className="brand-meta" style={{fontSize:'10px',letterSpacing:'.08em'}}>1 / 2 - Diagnosis complete</div>
        </div>

        <div className="banner fade-in">
          <div className="banner-check">✓</div>
          <div>Diagnosis complete - 4 mentors reviewed your resume</div>
        </div>

        <section className="section" style={{marginTop:0}}>
          <div className="student-row">
            <span className="who" id="studentInfo">Reading resume information...</span>
            <span className="pill pill-mute" id="targetJob">Target: loading</span>
          </div>
          <h2 className="summary-headline" id="headline">
            Your current resume score is <span className="num" id="atsHeadlineScore">--</span> /100.<br/>
            You still have a gap before the top offer line.
          </h2>
          <p className="summary-issue" id="coreIssue"></p>
        </section>

        <section className="section">
          <div className="section-num">Data dimensions</div>
          <h3 className="section-title" style={{fontSize:'18px'}}>See your position from 4 angles</h3>
          <p className="section-desc">Tap to expand the detailed breakdown →</p>
          <div className="tiles" id="tilesArea">
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>JD match</span><span className="chev">▼</span></div>
                <div className="tile-value"><span id="rankPct">--</span></div>
                <div className="tile-caption">Based on JD keyword coverage</div>
              </summary>
              <div className="tile-detail" id="rankDetail"></div>
            </details>
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>ATS readability</span><span className="chev">▼</span></div>
                <div className="tile-value tile-value-split tile-value-ats"><span><span id="atsScore">--</span><span className="tile-percent">%</span></span><span className="tile-risk-value" id="atsRiskCaption">Mainstream ATS parsing</span></div>
              </summary>
              <div className="tile-detail" id="atsDetail"></div>
            </details>
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>Salary growth</span><span className="chev">▼</span></div>
                <div className="tile-value" style={{fontSize:'22px'}} id="salaryRange">--</div>
                <div className="tile-caption">5-year upside <span id="salaryTop">--</span></div>
              </summary>
              <div className="tile-detail" id="salaryDetail"></div>
            </details>
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>AI impact trend</span><span className="chev">▼</span></div>
                <div className="tile-value" style={{fontSize:'22px'}}><span id="compCount">--</span></div>
                <div className="tile-caption"><span id="admitRate">Calibrating</span></div>
              </summary>
              <div className="tile-detail" id="compDetail"></div>
            </details>
          </div>
        </section>

        <section className="section" id="atsDetailSection" hidden>
          <div className="section-num">ATS diagnosis</div>
          <h3 className="section-title" style={{fontSize:'18px'}}>ATS system score</h3>
          <div className="card" style={{background:'linear-gradient(135deg,rgba(247,243,252,.92) 0%,rgba(255,255,255,.96) 100%)',border:'1px solid var(--line)'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'16px',position:'relative'}}>
              <div id="atsRiskBadge" style={{position:'absolute',top:0,right:0,padding:'4px 10px',borderRadius:'99px',fontSize:'12px',fontWeight:700,fontFamily:'var(--mono)',letterSpacing:'.04em'}}></div>
              <div id="atsTotalScore" style={{position:'absolute',top:0,left:0,fontSize:'22px',fontWeight:800,fontFamily:'var(--mono)',lineHeight:1}}></div>
              <svg id="atsRadarChart" width="100%" height="340" viewBox="-58 0 476 340" style={{overflow:'visible',marginTop:'28px'}}></svg>
            </div>
            <div id="atsSystemSummary" style={{fontSize:'13px',color:'var(--ink-soft)',lineHeight:1.6,marginBottom:'14px'}}></div>
            <div id="atsDimensionProblems" style={{marginTop:'12px'}}></div>
            <details id="atsProblemsDetails" className="ats-preview-details" style={{marginTop:'16px'}} open>
              <summary style={{cursor:'pointer',fontSize:'13px',fontWeight:700,color:'var(--rose)',listStyle:'none',display:'flex',alignItems:'center',gap:'6px',padding:'4px 0'}}>
                <span>Key issues</span><span id="atsProblemsChev" style={{fontSize:'11px',transition:'transform .2s'}}>▾</span>
              </summary>
              <ul id="atsProblems" style={{listStyle:'none',padding:0,margin:'8px 0 0',fontSize:'13px'}}></ul>
            </details>
            <details id="atsSuggestionsDetails" className="ats-preview-details" style={{marginTop:'12px'}} open hidden>
              <summary style={{cursor:'pointer',fontSize:'13px',fontWeight:700,color:'var(--jade)',listStyle:'none',display:'flex',alignItems:'center',gap:'6px',padding:'4px 0'}}>
                <span>Priority recommendations</span><span id="atsSuggestionsChev" style={{fontSize:'11px',transition:'transform .2s'}}>▾</span>
              </summary>
              <ul id="atsSuggestions" style={{listStyle:'none',padding:0,margin:'8px 0 0',fontSize:'13px'}}></ul>
            </details>
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="section-num">JD KEYWORDS</div>
          <div className="row-between mb-12" style={{marginTop:'4px'}}>
            <h3 className="section-title" id="skillSectionTitle" style={{fontSize:'18px',margin:0}}>JD keyword checklist</h3>
            <div className="skill-score"><small>Covered </small><span id="skillHave">0</span><small> / <span id="skillTotal">--</span></small></div>
          </div>
          <p className="skill-section-desc" id="skillSectionDesc">These are keywords detected from the JD. Prioritize missing items in Summary, Skills, or Experience.</p>
          <div className="skill-summary" id="skillSummary"></div>
          <div className="skill-legend">
            <span><i style={{background:'var(--good)'}}></i>Covered</span>
            <span><i style={{background:'var(--warn)'}}></i>Needs work</span>
          </div>
          <div className="card card-tight">
            <ul className="skill-list" id="skillListTop3"></ul>
            <button className="skill-expand-toggle" id="skillExpandToggle" type="button">View more ↓</button>
            <div className="skill-paywall" id="skillPaywall" hidden>
              <ul className="skill-list skill-paywall-list" id="skillPaywallList"></ul>
              <div className="skill-paywall-overlay">
                <div className="lock" aria-hidden="true"></div>
                <div className="text">Unlock <b style={{color:'var(--jade)'}}>all 4 mentors</b> + <b style={{color:'var(--jade)'}}>the full rewrite report</b><br/><span style={{color:'var(--ink-soft)',fontWeight:500}}>Includes full JD keyword checklist</span></div>
                <a className="btn btn-jade" href="/payment">¥49 Unlock full diagnosis</a>
              </div>
            </div>
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="section-num">Mentor 1 / 4 - Free preview</div>
          <h3 className="section-title" style={{fontSize:'20px'}}>Mentor advice preview</h3>
          <article className="mentor-detail" id="mentorFree"></article>
        </section>

        <section className="section">
          <div className="section-num">Mentors 2-4 / 4</div>
          <h3 className="section-title" style={{fontSize:'20px'}}>More mentor recommendations <span className="text-mute" style={{fontSize:'14px',fontFamily:'var(--sans)',fontWeight:400}}>(paid unlock)</span></h3>
          <p className="section-desc">Each mentor gives must-fix, recommended, and supplemental advice from a different angle.</p>
          <div className="stack-12" id="lockedMentorsArea"></div>
          <div className="unlock-cta">
            <p className="unlock-cta-title">Unlock all 4 mentors + full rewrite report</p>
            <div className="unlock-cta-price"><span className="now"><b>¥</b>49</span><span className="was">Was ¥199</span></div>
            <ul className="unlock-cta-perks">
              <li>Full recommendations from 4 industry mentors</li>
              <li>Full JD keyword checklist + placement guidance</li>
              <li>Exportable .md report for ChatGPT / Claude resume rewriting</li>
            </ul>
            <a href="/payment" className="btn btn-jade btn-block">¥49 Unlock now →</a>
            <div className="unlock-cta-foot">Limited offer - this diagnosis only</div>
          </div>
        </section>

        <div className="footnote">
          Diagnosis produced by real mentors + AI. Not an offer guarantee.<br/>
          Powered by <span>Vibe ID</span> - EdAIX
        </div>
      </div>
    </>
  );
}

function useInitialMobileLayout() {
  const [isMobile, setIsMobile] = useState(null);

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 639px)').matches);
  }, []);

  return isMobile;
}

function ResultLayoutPending() {
  return <div className="page result-page responsive-layout-pending" aria-hidden="true" />;
}

export default function ResultPage() {
  const isMobile = useInitialMobileLayout();

  if (isMobile === null) {
    return <ResultLayoutPending />;
  }

  return (
    <>
      {isMobile ? <MobileResultLayout /> : <DesktopResultLayout />}
      <Script src="/result-logic.js?v=edaix-result-i18n-20260626-3" strategy="afterInteractive" />
    </>
  );
}

