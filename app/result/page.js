'use client';
import Script from 'next/script';

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
        .keyword-use{font-size:10.5px;font-weight:700;border-radius:999px;padding:3px 7px;border:1px solid var(--line);white-space:nowrap;background:#fffdf7;color:var(--ink-soft)}
        .keyword-use--skills{background:var(--jade-soft);color:var(--jade);border-color:#c2dcc6}
        .keyword-use--experience{background:#fff7ed;color:#9a3412;border-color:#fed7aa}
        .keyword-use--summary{background:#eef2ff;color:#4338ca;border-color:#c7d2fe}
        .keyword-use--reference{background:#f5f5f4;color:#78716c;border-color:#e7e2d6}
        .skill-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end}
        .jd-keyword-details{margin-top:12px;border-top:1px solid var(--line);padding-top:10px}
        .jd-keyword-details summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:center;gap:6px;color:var(--ink-soft);font-size:13px;font-weight:700;padding:6px 0}
        .jd-keyword-details summary::-webkit-details-marker{display:none}
        .jd-keyword-groups{display:grid;gap:10px;margin-top:8px}
        .jd-keyword-groups.is-locked{filter:blur(4px);user-select:none;pointer-events:none}
        .jd-keyword-group{border:1px solid #ede9dc;background:#fffdf7;border-radius:10px;padding:10px 11px}
        .jd-keyword-group-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px}
        .jd-keyword-group-title{font-size:12px;font-weight:800;color:var(--ink);letter-spacing:.01em}
        .jd-keyword-group-count{font-family:var(--mono);font-size:10px;color:var(--ink-mute)}
        .jd-keyword-chips{display:flex;flex-wrap:wrap;gap:6px}
        .jd-keyword-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid #e7e2d6;background:#fff;border-radius:999px;padding:4px 8px;font-size:11.5px;color:var(--ink-soft);max-width:100%}
        .jd-keyword-chip b{font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .jd-keyword-chip .state{width:6px;height:6px;border-radius:50%;flex-shrink:0;background:var(--warn)}
        .jd-keyword-chip.is-have .state{background:var(--good)}
        .jd-keyword-paywall{position:relative;min-height:142px;margin-top:10px;border:1px dashed var(--line);border-radius:10px;overflow:hidden;background:#fffdf8}
        .jd-keyword-paywall .paywall-more-list{filter:blur(4px);user-select:none;pointer-events:none;padding:12px}
        .unlock-cta{background:linear-gradient(135deg,var(--ink) 0%,var(--indigo-deep) 100%);color:#fff;border-radius:var(--r-lg);padding:22px;text-align:center;margin-top:16px;position:relative;overflow:hidden}
        .unlock-cta::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 80% 20%,rgba(232,160,107,.25) 0%,transparent 50%);pointer-events:none}
        .unlock-cta > *{position:relative}
        .unlock-cta-title{font-family:var(--serif);font-weight:700;font-size:18px;margin:0 0 8px}
        .unlock-cta-price{margin:12px 0 18px;display:flex;align-items:baseline;justify-content:center;gap:10px}
        .unlock-cta-price .now{font-family:var(--serif);font-style:italic;font-weight:700;font-size:40px;color:var(--apricot)}
        .unlock-cta-price .now b{font-size:22px}
        .unlock-cta-price .was{color:rgba(255,255,255,.5);font-size:14px;text-decoration:line-through}
        .unlock-cta-perks{list-style:none;padding:0;margin:0 0 16px;font-size:13px;color:rgba(255,255,255,.85);text-align:left;display:inline-flex;flex-direction:column;gap:6px}
        .unlock-cta-perks li{display:flex;gap:8px;align-items:flex-start}
        .unlock-cta-perks li::before{content:"✓";color:var(--apricot);font-weight:700;flex-shrink:0}
        .unlock-cta-foot{font-size:11px;color:rgba(255,255,255,.5);margin-top:12px;font-family:var(--mono);letter-spacing:.04em}
        .unlock-cta .btn-jade{background:var(--apricot);color:var(--ink);box-shadow:0 12px 28px -10px rgba(232,160,107,.55);font-weight:700}
        .unlock-cta .btn-jade:hover{background:#db8e57}
        .logo-marquee{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fffdf7;margin:0 0 16px;padding:10px 0}
        .logo-marquee-track{display:flex;gap:14px;width:max-content;animation:logo-scroll 72s linear infinite}
        .logo-marquee:hover .logo-marquee-track{animation-play-state:paused}
        .mentor-logo-chip{width:72px;height:42px;border:1px solid #ede9dc;border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;padding:7px;flex:0 0 auto}
        .mentor-logo-chip img{max-width:100%;max-height:100%;object-fit:contain}
        .mentor-logo-intro{margin:4px 0 14px}
        .mentor-logo-copy{font-size:12.5px;line-height:1.55;color:var(--ink-soft);margin:0 0 8px}
        .paywall-more{position:relative;margin-top:8px;min-height:170px;border-radius:10px;overflow:hidden;border:1px dashed var(--line);background:#fffdf8}
        .paywall-more-list{filter:blur(4px);user-select:none;pointer-events:none;padding:10px 12px}
        .paywall-more-list div{font-size:13px;line-height:1.5;margin:0 0 8px;padding-left:18px;position:relative;color:var(--ink-soft)}
        .paywall-more-overlay,.locked-preview-overlay{position:absolute;inset:0;display:flex;align-items:center;justify-content:flex-start;flex-direction:column;background:linear-gradient(180deg,rgba(251,250,243,.54) 0%,rgba(251,250,243,.96) 56%);backdrop-filter:blur(1px);padding:14px 18px 18px;text-align:center;box-sizing:border-box}
        .result-lock-cta{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;color:var(--ink);width:fit-content;max-width:100%;margin:0 auto;box-sizing:border-box}
        .result-lock-cta .lock{width:34px;height:34px;border-radius:50%;background:var(--ink);color:var(--paper-warm);display:grid;place-items:center;font-size:15px;box-shadow:0 8px 20px -8px rgba(24,24,22,.4)}
        .result-lock-cta .text{font-size:12.5px;font-weight:600;line-height:1.45;color:var(--ink)}
        .result-lock-cta .text b{color:var(--jade)}
        .result-lock-cta .text span{color:var(--ink-soft);font-weight:500}
        .result-lock-cta .btn{font-size:13px;padding:9px 18px;min-height:auto}
        .ats-preview-details .paywall-more{display:none}
        .ats-preview-details.is-expanded .paywall-more{display:block}
        @keyframes logo-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
      `}</style>

      <div className="page">
        <div className="brandbar">
          <div className="brand">
            <img src="/logo/MentorX.png" alt="MentorX 蔓藤教育" className="brand-img" />
          </div>
          <div className="brand-meta" style={{fontSize:'10px',letterSpacing:'.08em'}}>1 / 2 · 诊断完成</div>
        </div>

        <div className="banner fade-in">
          <div className="banner-check">✓</div>
          <div>诊断完成 · 4 位导师已读完你的简历</div>
        </div>

        <section className="section" style={{marginTop:0}}>
          <div className="student-row">
            <span className="who" id="studentInfo">正在读取简历信息…</span>
            <span className="pill pill-mute" id="targetJob">目标:读取中</span>
          </div>
          <h2 className="summary-headline" id="headline">
            你的当前简历综合评分 <span className="num" id="atsHeadlineScore">--</span> 分,<br/>
            离顶级 Offer 线 <span className="gap" id="headlineSalaryTop">--</span> 仍有差距。
          </h2>
          <p className="summary-issue" id="coreIssue"></p>
        </section>

        <section className="section">
          <div className="section-num">数据维度</div>
          <h3 className="section-title" style={{fontSize:'18px'}}>从 4 个角度看你的位置</h3>
          <p className="section-desc">点击展开看详细拆解 →</p>
          <div className="tiles" id="tilesArea">
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>JD 匹配度</span><span className="chev">▼</span></div>
                <div className="tile-value"><span id="rankPct">--</span></div>
                <div className="tile-caption">基于 JD 关键词覆盖</div>
              </summary>
              <div className="tile-detail" id="rankDetail"></div>
            </details>
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>ATS 可读性</span><span className="chev">▼</span></div>
                <div className="tile-value tile-value-split tile-value-ats"><span><span id="atsScore">--</span><span className="tile-percent">%</span></span><span className="tile-risk-value" id="atsRiskCaption">主流系统识别</span></div>
              </summary>
              <div className="tile-detail" id="atsDetail"></div>
            </details>
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>SALARY · 薪资成长</span><span className="chev">▼</span></div>
                <div className="tile-value" style={{fontSize:'22px'}} id="salaryRange">--</div>
                <div className="tile-caption">5年上限 <span id="salaryTop">--</span></div>
              </summary>
              <div className="tile-detail" id="salaryDetail"></div>
            </details>
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>AI 影响趋势</span><span className="chev">▼</span></div>
                <div className="tile-value" style={{fontSize:'22px'}}><span id="compCount">--</span></div>
                <div className="tile-caption"><span id="admitRate">待校准</span></div>
              </summary>
              <div className="tile-detail" id="compDetail"></div>
            </details>
          </div>
        </section>

        <section className="section" id="atsDetailSection" hidden>
          <div className="section-num">ATS 诊断</div>
          <h3 className="section-title" style={{fontSize:'18px'}}>ATS System 评分</h3>
          <div className="card" style={{background:'linear-gradient(135deg,rgba(168,213,186,.08) 0%,rgba(232,160,107,.06) 100%)',border:'1px solid rgba(168,213,186,.2)'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'16px',position:'relative'}}>
              <div id="atsRiskBadge" style={{position:'absolute',top:0,right:0,padding:'4px 10px',borderRadius:'99px',fontSize:'12px',fontWeight:700,fontFamily:'var(--mono)',letterSpacing:'.04em'}}></div>
              <div id="atsTotalScore" style={{position:'absolute',top:0,left:0,fontSize:'22px',fontWeight:800,fontFamily:'var(--mono)',lineHeight:1}}></div>
              <svg id="atsRadarChart" width="240" height="220" viewBox="0 0 240 220" style={{overflow:'visible',marginTop:'28px'}}></svg>
            </div>
            <div id="atsSystemSummary" style={{fontSize:'13px',color:'var(--ink-soft)',lineHeight:1.6,marginBottom:'14px'}}></div>
            <div id="atsDimensionProblems" style={{marginTop:'12px'}}></div>
            <details id="atsProblemsDetails" className="ats-preview-details" style={{marginTop:'16px'}} open>
              <summary style={{cursor:'pointer',fontSize:'13px',fontWeight:700,color:'var(--rose)',listStyle:'none',display:'flex',alignItems:'center',gap:'6px',padding:'4px 0'}}>
                <span>🔍 关键问题</span><span id="atsProblemsChev" style={{fontSize:'11px',transition:'transform .2s'}}>▾</span>
              </summary>
              <ul id="atsProblems" style={{listStyle:'none',padding:0,margin:'8px 0 0',fontSize:'13px'}}></ul>
            </details>
            <details id="atsSuggestionsDetails" className="ats-preview-details" style={{marginTop:'12px'}} open hidden>
              <summary style={{cursor:'pointer',fontSize:'13px',fontWeight:700,color:'var(--jade)',listStyle:'none',display:'flex',alignItems:'center',gap:'6px',padding:'4px 0'}}>
                <span>✨ 优先建议</span><span id="atsSuggestionsChev" style={{fontSize:'11px',transition:'transform .2s'}}>▾</span>
              </summary>
              <ul id="atsSuggestions" style={{listStyle:'none',padding:0,margin:'8px 0 0',fontSize:'13px'}}></ul>
            </details>
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="section-num">JD KEYWORDS</div>
          <div className="row-between mb-12" style={{marginTop:'4px'}}>
            <h3 className="section-title" id="skillSectionTitle" style={{fontSize:'18px',margin:0}}>JD Keyword 清单</h3>
            <div className="skill-score"><small>已覆盖 </small><span id="skillHave">0</span><small> / <span id="skillTotal">--</span></small></div>
          </div>
          <p className="skill-section-desc" id="skillSectionDesc">这些是系统从 JD 中识别出的关键词。优先把待补强项写进 Summary、Skills 或 Experience。</p>
          <div className="skill-summary" id="skillSummary"></div>
          <div className="skill-legend">
            <span><i style={{background:'var(--good)'}}></i>已具备</span>
            <span><i style={{background:'var(--warn)'}}></i>待补强</span>
          </div>
          <div className="card card-tight">
            <ul className="skill-list" id="skillListTop3"></ul>
            <button className="skill-expand-toggle" id="skillExpandToggle" type="button">查看更多 ↓</button>
            <div className="skill-paywall" id="skillPaywall" hidden>
              <ul className="skill-list skill-paywall-list" id="skillPaywallList"></ul>
              <div className="skill-paywall-overlay">
                <div className="lock">🔒</div>
                <div className="text">解锁<b style={{color:'var(--jade)'}}>全部 4 位导师</b> + <b style={{color:'var(--jade)'}}>完整改写报告</b><br/><span style={{color:'var(--ink-soft)',fontWeight:500}}>含完整 JD Keyword 清单</span></div>
                <a className="btn btn-jade" href="/payment">¥ 49 解锁完整诊断</a>
              </div>
            </div>
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="section-num">导师 1 / 4 · 免费试读</div>
          <h3 className="section-title" style={{fontSize:'20px'}}>导师建议预览</h3>
          <article className="mentor-detail" id="mentorFree"></article>
        </section>

        <section className="section">
          <div className="section-num">导师 2-4 / 4</div>
          <h3 className="section-title" style={{fontSize:'20px'}}>更多导师建议 <span className="text-mute" style={{fontSize:'14px',fontFamily:'var(--sans)',fontWeight:400}}>(付费解锁)</span></h3>
          <p className="section-desc">每位导师从不同角度给出必改、建议改、补充建议。</p>
          <div className="stack-12" id="lockedMentorsArea"></div>
          <div className="unlock-cta">
            <p className="unlock-cta-title">解锁全部 4 位导师 + 完整改写报告</p>
            <div className="unlock-cta-price"><span className="now"><b>¥</b>49</span><span className="was">原价 ¥199</span></div>
            <ul className="unlock-cta-perks">
              <li>4 位大厂导师完整建议(必改 / 建议改 / 补充)</li>
              <li>完整 JD Keyword 清单 + 放置建议</li>
              <li>报告导出 .md,直接喂给 ChatGPT / Claude 改简历</li>
            </ul>
            <a href="/payment" className="btn btn-jade btn-block">¥ 49 立即解锁 →</a>
            <div className="unlock-cta-foot">秋招特价 · 仅限本次</div>
          </div>
        </section>

        <div className="footnote">
          诊断由 4 位真实导师 + AI 联合产出 · 不构成 Offer 承诺<br/>
          Powered by <span>Vibe ID</span> · MentorX
        </div>
      </div>

      <Script src="/result-logic.js?v=ats-display-zh-20260609-4" strategy="afterInteractive" />
    </>
  );
}
