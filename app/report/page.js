'use client';
import Script from 'next/script';

export default function ReportPage() {
  return (
    <>
      <style>{`
        .report-headline{font-family:var(--serif);font-weight:700;font-size:22px;line-height:1.4;margin:8px 0 8px;letter-spacing:-0.01em;}
        .report-headline .num{font-style:italic;color:var(--indigo);font-size:32px;}
        .report-headline .gap{font-style:italic;color:var(--rose);font-weight:700;}
        .report-issue{font-size:14px;color:var(--ink-soft);line-height:1.6;border-left:3px solid var(--apricot);padding:4px 0 4px 12px;margin:12px 0 0;}
        .report-metrics .tile-caption b{color:var(--ink);font-weight:700;}
        .tile-value-ats #reportAtsScore{font-size:30px;}
        .export-card{background:linear-gradient(135deg,#F7F3FC 0%,#EFE5FA 45%,#FFFFFF 100%);border:1px solid var(--line);border-radius:var(--r-lg);padding:18px 18px 16px;margin:0 0 22px;position:relative;overflow:hidden;box-shadow:var(--shadow-card);}
        .export-card::before{content:"";position:absolute;right:-30px;top:-30px;width:120px;height:120px;background:radial-gradient(circle,rgba(180,126,219,.24) 0%,transparent 70%);pointer-events:none;}
        .export-card-head{display:flex;align-items:center;gap:10px;margin-bottom:8px;position:relative;}
        .export-card-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#5333A6,#B47EDB);color:#fff;display:grid;place-items:center;font-size:16px;flex-shrink:0;}
        .export-card-title{font-family:var(--serif);font-weight:700;font-size:17px;line-height:1.2;}
        .export-card-format-tag{display:inline-block;background:var(--indigo);color:#fff;font-family:var(--mono);font-size:10px;letter-spacing:.06em;padding:2px 8px;border-radius:6px;margin-left:6px;vertical-align:2px;}
        .export-card-desc{font-size:13px;color:var(--ink);margin:0 0 12px;line-height:1.6;position:relative;font-weight:500;}
        .export-card-perks{list-style:none;padding:0;margin:0 0 16px;display:flex;flex-direction:column;gap:7px;position:relative;}
        .export-card-perks li{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ink);line-height:1.4;}
        .export-card-perks .check{width:18px;height:18px;border-radius:50%;background:var(--jade);color:#fff;display:grid;place-items:center;font-size:10px;font-weight:700;flex-shrink:0;}
        .export-card-actions{display:flex;flex-direction:column;gap:10px;position:relative;}
        .btn-ai-prompt{background:#F0E8FA;color:var(--jade);border:1.5px solid var(--line);box-shadow:none;}
        .btn-ai-prompt:hover{background:var(--jade-soft);}
        .export-card-hint{font-size:12px;color:var(--ink-soft);line-height:1.5;text-align:center;margin:0;font-weight:600;}
        .ai-rewrite-pdf{width:794px;max-width:794px;background:var(--paper);color:var(--ink);font-family:var(--sans);padding:34px 48px 44px;line-height:1.55;letter-spacing:0;}
        .ai-rewrite-pdf *{box-sizing:border-box;}
        .ai-rewrite-pdf h1{font-family:var(--serif);font-size:28px;line-height:1.15;margin:10px 0 8px;letter-spacing:0;font-weight:800;}
        .ai-rewrite-pdf h2{font-family:var(--serif);font-size:18px;line-height:1.25;margin:0 0 10px;font-weight:800;letter-spacing:0;}
        .ai-rewrite-pdf h3{font-size:14px;line-height:1.35;margin:0 0 8px;font-weight:800;letter-spacing:0;}
        .ai-rewrite-pdf p{font-size:12.5px;line-height:1.65;margin:0;color:var(--ink-soft);}
        .ai-rewrite-pdf ul,.ai-rewrite-pdf ol{margin:8px 0 0;padding-left:20px;font-size:12.5px;line-height:1.6;color:var(--ink-soft);}
        .ai-rewrite-pdf li{margin:3px 0;}
        .ai-pdf-brand{display:flex;align-items:center;justify-content:space-between;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:18px;}
        .ai-pdf-brand img{height:44px;width:auto;}
        .ai-pdf-kicker{font-family:var(--mono);font-size:10px;letter-spacing:.12em;color:var(--jade);font-weight:800;text-transform:uppercase;}
        .ai-pdf-card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:14px 16px;margin:12px 0;break-inside:avoid;page-break-inside:avoid;}
        .ai-pdf-card.ai-pdf-prompt{background:#F7F3FC;border-color:var(--line);}
        .ai-pdf-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .ai-pdf-chip-list{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
        .ai-pdf-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:4px 8px;font-size:11px;color:var(--ink-soft);line-height:1.3;}
        .ai-pdf-chip strong{color:var(--ink);font-weight:800;}
        .ai-pdf-chip.weak{border-color:#fed7aa;background:#fff7ed;color:#9a3412;}
        .ai-pdf-chip.have{border-color:#c2dcc6;background:#f0f9f2;color:#2f6b4f;}
        .ai-pdf-meta{font-family:var(--mono);font-size:10px;color:var(--ink-mute);margin-top:2px;}
        .ai-pdf-advice{border-top:1px dashed var(--line);padding-top:12px;margin-top:12px;break-inside:avoid;page-break-inside:avoid;}
        .ai-pdf-advice:first-of-type{border-top:none;padding-top:0;margin-top:0;}
        .ai-pdf-label{display:inline-flex;font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;background:#F0E8FA;color:#5333A6;margin-right:6px;}
        .ai-insight{margin:14px 0 16px;padding:14px 16px;background:linear-gradient(135deg,#F7F3FC 0%,#FFFFFF 100%);border:1px solid var(--line);border-radius:var(--r-md);}
        .ai-insight-diagnosis{font-size:13px;line-height:1.65;color:var(--ink);margin:0;font-weight:500;}
        .ai-insight-diagnosis .ico{margin-right:4px;font-size:15px;}
        .ai-insight-diagnosis b{color:var(--terracotta);font-weight:700;}
        .skill-list{list-style:none;padding:0;margin:0;}
        .skill-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px dashed var(--line);gap:10px;}
        .skill-row:last-child{border-bottom:none;}
        .skill-name{font-size:14px;font-weight:500;}
        .skill-name .priority{font-family:var(--mono);font-size:10px;color:var(--ink-mute);margin-right:8px;}
        .skill-section-desc{font-size:12.5px;color:var(--ink-soft);line-height:1.55;margin:-2px 0 12px;}
        .skill-meta{display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end;}
        .keyword-use{font-size:10.5px;font-weight:700;border-radius:999px;padding:3px 7px;border:1px solid var(--line);white-space:nowrap;background:#fff;color:var(--ink-soft);}
        .keyword-use--skills{background:var(--jade-soft);color:var(--jade);border-color:var(--line);}
        .keyword-use--experience{background:#fff7ed;color:#9a3412;border-color:#fed7aa;}
        .keyword-use--summary{background:#eef2ff;color:#4338ca;border-color:#c7d2fe;}
        .keyword-use--reference{background:#F7F3FC;color:#5F567A;border-color:#E6DEF2;}
        .skill-extra[hidden],.report-skill-extra[hidden]{display:none!important;}
        .skill-expand-toggle{width:100%;margin-top:8px;border:1px dashed var(--line);background:var(--paper-warm);border-radius:10px;padding:10px 12px;font-size:13px;font-weight:700;color:var(--jade);cursor:pointer}
        .skill-expand-toggle:hover{background:var(--jade-soft)}
        .jd-keyword-details{margin-top:12px;border-top:1px solid var(--line);padding-top:10px;}
        .jd-keyword-details[hidden]{display:none!important;}
        .jd-keyword-groups{display:grid;gap:10px;margin-top:8px;}
        .jd-keyword-group{border:1px solid var(--line);background:#fff;border-radius:10px;padding:10px 11px;}
        .jd-keyword-group-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;}
        .jd-keyword-group-title{font-size:12px;font-weight:800;color:var(--ink);letter-spacing:.01em;}
        .jd-keyword-group-count{font-family:var(--mono);font-size:10px;color:var(--ink-mute);}
        .jd-keyword-chips{display:flex;flex-wrap:wrap;gap:6px;}
        .jd-keyword-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid var(--line);background:#fff;border-radius:999px;padding:4px 8px;font-size:11.5px;color:var(--ink-soft);max-width:100%;}
        .jd-keyword-chip[hidden]{display:none!important;}
        .jd-keyword-chip b{font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .jd-keyword-chip .state{width:6px;height:6px;border-radius:50%;flex-shrink:0;background:var(--warn);}
        .jd-keyword-chip.is-have .state{background:var(--good);}
        .jd-keyword-chip .keyword-use{font-size:9.5px;padding:2px 6px;}
        .service-card{background:linear-gradient(135deg,#F7F3FC 0%,#EFE5FA 45%,#FFFFFF 100%);border:1px solid var(--line);border-radius:var(--r-lg);padding:26px 22px 22px;margin-top:12px;position:relative;overflow:hidden;box-shadow:var(--shadow-card);}
        .service-card::before{content:"";position:absolute;left:-40px;bottom:-40px;width:140px;height:140px;background:radial-gradient(circle,rgba(180,126,219,.24) 0%,transparent 70%);pointer-events:none;}
        .service-card-title{font-family:var(--serif);font-weight:700;font-size:22px;line-height:1.3;text-align:center;margin:0 0 8px;position:relative;letter-spacing:-0.01em;}
        .service-card-title em{color:var(--terracotta);font-style:italic;}
        .service-card-sub{font-size:14px;color:var(--ink-soft);text-align:center;margin:0 0 22px;line-height:1.55;position:relative;}
        .service-list{list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:10px;position:relative;}
        .service-list li{background:var(--paper-warm);border:1px solid var(--line);border-radius:var(--r-md);padding:14px 16px 14px 50px;position:relative;font-size:13px;line-height:1.5;}
        .service-list li strong{display:block;font-size:14px;color:var(--ink);margin-bottom:2px;}
        .service-list li span{color:var(--ink-soft);}
        .service-list .num-badge{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#5333A6,#B47EDB);color:#fff;display:grid;place-items:center;font-family:var(--serif);font-style:italic;font-weight:700;font-size:13px;}
        .service-cta-block{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px 16px 20px;text-align:center;margin:18px auto 12px;position:relative;max-width:286px;box-shadow:var(--shadow-soft);}
        .service-handle{font-family:var(--mono);font-size:12px;color:var(--ink);font-weight:600;margin-top:6px;}
        .service-cta-text{font-size:14px;color:var(--ink);font-weight:800;margin:0 0 12px;line-height:1.35;}
        .service-qr{width:190px;height:190px;object-fit:contain;margin:0 auto;border-radius:10px;border:1px solid var(--line);background:#fff;padding:7px;box-shadow:0 8px 24px rgba(69,42,147,.10);}
        .service-foot{font-size:11px;color:var(--ink-mute);text-align:center;line-height:1.6;position:relative;}
        .logo-marquee{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fff;margin:0 0 16px;padding:10px 0}
        .logo-marquee-track{display:flex;gap:14px;width:max-content;animation:logo-scroll 72s linear infinite}
        .logo-marquee:hover .logo-marquee-track{animation-play-state:paused}
        .mentor-logo-chip{width:72px;height:42px;border:1px solid var(--line);border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;padding:7px;flex:0 0 auto}
        .mentor-logo-chip img{max-width:100%;max-height:100%;object-fit:contain}
        .mentor-logo-intro{margin:4px 0 14px}
        .mentor-logo-copy{font-size:12.5px;line-height:1.55;color:var(--ink-soft);margin:0 0 8px}
        @keyframes logo-scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        body.exporting .banner, body.exporting .export-card, body.exporting .footnote{display:none!important;}
        body.exporting{background:var(--paper)!important;}
        body.exporting .page{
          width:794px!important;
          max-width:794px!important;
          margin:0 auto!important;
          padding:32px 48px 44px!important;
          box-shadow:none!important;
          border:none!important;
          background:var(--paper)!important;
          transform:none!important;
        }
        body.exporting .section{break-inside:avoid;page-break-inside:avoid;}
        body.exporting .card,
        body.exporting .tile,
        body.exporting .service-card,
        body.exporting .advice-example{break-inside:avoid;page-break-inside:avoid;}
      `}</style>

      <div className="page report-page">
        <div className="brandbar">
          <div className="brand">
            <img src="/logo/logo%20banner_no_bg.png" alt="MentorX è”“è—¤æ•™è‚²" className="brand-img" />
          </div>
          <div className="brand-meta" style={{fontSize:'10px',letterSpacing:'.08em'}}>å®Œæ•´æŠ¥å‘Š</div>
        </div>

        <div className="banner fade-in">
          <div className="banner-check">âœ“</div>
          <div>å®Œæ•´æŠ¥å‘Šå·²ä¸ºä½ ç”Ÿæˆ</div>
        </div>

        <div className="export-card">
          <div className="export-card-head">
            <div className="export-card-icon">ðŸ“„</div>
            <div>
              <div className="export-card-title">å®Œæ•´è¯Šæ–­æŠ¥å‘Š<span className="export-card-format-tag">PDF</span></div>
            </div>
          </div>
          <p className="export-card-desc">æŠŠè¿™ä»½ PDF æ•´æ®µå–‚ç»™ <b>ChatGPT / Claude / è±†åŒ…</b> ç­‰ä»»æ„ LLMï¼ŒåŸºäºŽ 4 ä½å¤§åŽ‚å¯¼å¸ˆå»ºè®®<b>è‡ªåŠ¨é‡å†™ä½ çš„ç®€åŽ†</b>â€”â€”ä¸ç”¨ä¸€å¥å¥æ”¹ï¼Œä¸€é”®äº§å‡ºå¯æŠ•é€’çš„æ–°ç‰ˆæœ¬ã€‚</p>
          <ul className="export-card-perks">
            <li><span className="check">âœ“</span><span>ATS é€šè¿‡çŽ‡ <b>+30%</b>ï¼Œè‡ªåŠ¨åŒ¹é… JD æŠ€èƒ½</span></li>
            <li><span className="check">âœ“</span><span>é¢è¯•é‚€çº¦çŽ‡ <b>ç¿»å€</b>ï¼Œç®€åŽ†è®²å¯¹ PM çš„è¯­è¨€</span></li>
            <li><span className="check">âœ“</span><span>1 ä»½æŠ¥å‘Šåå¤ç”¨ï¼ŒæŠ•æ¯ä¸ªå…¬å¸éƒ½èƒ½ç²¾å‡†å¯¹é½</span></li>
          </ul>
          <button className="btn btn-jade btn-block" onClick={() => window.exportPDF && window.exportPDF()}>
            â¬‡ ä¸‹è½½ PDF æŠ¥å‘Š
          </button>
          <button className="btn btn-block btn-ai-prompt" onClick={() => window.exportAiRewritePDF && window.exportAiRewritePDF()} style={{marginTop:'10px'}}>
            &#19979;&#36733; AI &#25913;&#31616;&#21382;&#25351;&#20196;&#21253;
          </button>
          <p className="export-card-hint">&#19978;&#20256;&#36825;&#20221;&#25351;&#20196;&#21253; + &#20320;&#30340;&#21407;&#31616;&#21382;&#65292;&#35753; AI &#25353;&#20851;&#38190;&#35789;&#21644;&#23548;&#24072;&#24314;&#35758;&#30452;&#25509;&#37325;&#20889;&#12290;</p>
        </div>

        <section className="section report-summary-panel" id="summary">
          <div className="report-score-block">
            <div className="result-eyebrow">Resume Score</div>
            <div className="report-score-line"><span id="reportHeadlineScore">--</span><small>/100</small></div>
            <div className="report-score-badges">
              <span className="report-risk-badge">Full Report</span>
              <span className="report-risk-badge report-risk-badge-warn">Mentor Review</span>
            </div>
            <p className="report-score-caption">ç¦»é¡¶çº§ Offer çº¿ <b id="reportHeadlineSalaryTop">å¾…æ ¡å‡†</b> ä»æœ‰å·®è·ã€‚</p>
          </div>

          <div className="report-summary-copy">
            <div>
              <div className="section-num">01 Â· æ•´ä½“è¯Šæ–­</div>
              <h2 className="section-title">å®Œæ•´æŠ¥å‘Šæ¦‚è§ˆ</h2>
            </div>
            <h3 className="report-summary-headline">å…ˆä¿®æœ€å½±å“æŠ•é€’è½¬åŒ–çš„ 3 ä¸ªé—®é¢˜</h3>
            <p className="report-issue" id="coreIssue"></p>
            <div className="report-issue-list" aria-label="Full report coverage">
              <span>Report includes</span>
              <ol>
                <li>ATS åˆ†é¡¹è¯Šæ–­ä¸Žé£Žé™©è§£é‡Š</li>
                <li>JD Keyword è¦†ç›–ã€ç¼ºå£å’Œæ”¾ç½®å»ºè®®</li>
                <li>4 ä½å¯¼å¸ˆçš„ç®€åŽ†ä¼˜åŒ–å»ºè®®</li>
              </ol>
            </div>
            <div className="report-hero-actions">
              <a className="btn btn-jade" href="#mentors">æŸ¥çœ‹å¯¼å¸ˆå»ºè®®</a>
              <a className="btn report-secondary-btn" href="#reportDataMetrics">æŸ¥çœ‹è¯„åˆ†ç»†èŠ‚</a>
            </div>
          </div>

          <div className="report-summary-card report-summary-keyword-card">
            <div className="report-keyword-head">
              <div>
                <div className="section-num" id="reportSkillSectionTitle">JD Keyword æ¸…å•</div>
                <p className="skill-section-desc" id="reportSkillSectionDesc">è¿™äº›æ˜¯ç³»ç»Ÿä»Ž JD ä¸­è¯†åˆ«å‡ºçš„å…³é”®è¯ã€‚ä¼˜å…ˆæŠŠå¾…è¡¥å¼ºé¡¹å†™è¿› Summaryã€Skills æˆ– Experienceã€‚</p>
              </div>
              <div className="ai-insight">
                <p className="ai-insight-diagnosis">
                  <span className="ico">Â·</span>æ­£åœ¨åŠ è½½æŠ€èƒ½åŒ¹é…æ•°æ®...
                </p>
              </div>
            </div>
            <ul className="skill-list" id="skillList"></ul>
            <button className="skill-expand-toggle" id="reportSkillExpandToggle" type="button" hidden>æŸ¥çœ‹æ›´å¤š â†“</button>
          </div>
        </section>

        <hr className="divider" />

        <section className="section report-metrics" id="reportDataMetrics">
          <div className="section-num">02 Â· æ•°æ®ç»´åº¦</div>
          <h2 className="section-title">å››ä¸ªåˆ¤æ–­ç»´åº¦</h2>
          <p className="section-desc">å®Œæ•´æŠ¥å‘Šä¿ç•™æ‰€æœ‰è¯„åˆ†ä¾æ®ï¼Œå’Œç»“æžœé¡µä½¿ç”¨åŒä¸€å¥—å››å¡ç»“æž„ã€‚</p>
          <div className="report-dimension-grid" id="reportDataTiles">
            <article className="report-dimension-card report-dimension-card--purple tile">
              <header className="report-dimension-card-head">
                <div>
                  <div className="tile-label">JD åŒ¹é…åº¦</div>
                  <div className="tile-value"><span id="reportRankPct">--</span></div>
                </div>
                <div className="report-dimension-marker" aria-hidden="true"></div>
              </header>
              <div className="tile-caption">åŸºäºŽ JD å…³é”®è¯è¦†ç›–</div>
              <div className="report-dimension-divider"></div>
              <div className="report-dimension-detail-head">è¯„åˆ†ä¾æ®</div>
              <div className="tile-detail" id="reportRankDetail"></div>
            </article>
            <article className="report-dimension-card report-dimension-card--red tile">
              <header className="report-dimension-card-head">
                <div>
                  <div className="tile-label">ATS å¯è¯»æ€§</div>
                  <div className="tile-value tile-value-ats"><span id="reportAtsScore">--</span><span className="tile-percent">%</span></div>
                </div>
                <div className="report-dimension-marker" aria-hidden="true"></div>
              </header>
              <div className="tile-caption" id="reportAtsRiskCaption">ä¸»æµç³»ç»Ÿè¯†åˆ«</div>
              <div className="report-dimension-divider"></div>
              <div className="report-dimension-detail-head">è¯„åˆ†ä¾æ®</div>
              <div className="tile-detail" id="reportAtsDetail"></div>
            </article>
            <article className="report-dimension-card report-dimension-card--blue tile">
              <header className="report-dimension-card-head">
                <div>
                  <div className="tile-label">Salary Â· è–ªèµ„æˆé•¿</div>
                  <div className="tile-value" id="reportSalaryRange">æˆé•¿æ½œåŠ›</div>
                </div>
                <div className="report-dimension-marker" aria-hidden="true"></div>
              </header>
              <div className="tile-caption">5å¹´ä¸Šé™ <b id="reportSalaryTop">å¾…æ ¡å‡†</b></div>
              <div className="report-dimension-divider"></div>
              <div className="report-dimension-detail-head">è¯„åˆ†ä¾æ®</div>
              <div className="tile-detail" id="reportSalaryDetail"></div>
            </article>
            <article className="report-dimension-card report-dimension-card--orange tile">
              <header className="report-dimension-card-head">
                <div>
                  <div className="tile-label">AI å½±å“è¶‹åŠ¿</div>
                  <div className="tile-value"><span id="reportAiImpactLevel">--</span></div>
                </div>
                <div className="report-dimension-marker" aria-hidden="true"></div>
              </header>
              <div className="tile-caption"><span id="reportAiImpactCaption">å¾…æ ¡å‡†</span></div>
              <div className="report-dimension-divider"></div>
              <div className="report-dimension-detail-head">è¯„åˆ†ä¾æ®</div>
              <div className="tile-detail" id="reportAiImpactDetail"></div>
            </article>
          </div>
        </section>

        <hr className="divider" />

        <section className="section report-ats-panel" id="atsDetailSection">
          <div className="section-num">03 Â· ATS è¯Šæ–­</div>
          <h2 className="section-title">ç³»ç»Ÿè¯„åˆ†è¯¦æƒ…</h2>
          <div className="card report-ats-card">
            <div className="report-ats-visual">
              <div id="atsRiskBadge"></div>
              <div id="atsTotalScore"></div>
              <svg id="atsRadarChart" width="360" height="320" viewBox="0 0 360 320"></svg>
            </div>
            <div className="report-ats-copy">
              <div id="atsSystemSummary"></div>
              <div id="atsDimensionProblems"></div>
              <div id="atsProblemsSection"></div>
            </div>
          </div>
        </section>

        <hr className="divider" />

        <section className="section" id="mentors">
          <div className="section-num">04 Â· å®Œæ•´å¯¼å¸ˆå»ºè®®</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>æ¯ä¸ªè§’åº¦éƒ½æœ‰äººå¸®ä½ çœ‹è¿‡äº†</h2>
          <div id="mentorLogoIntroSlot"></div>
          <div id="mentorsList"></div>
        </section>

        <hr className="divider" />

        <section className="section" id="service">
          <div className="section-num" id="serviceNum">05 Â· å‡çº§æœåŠ¡</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>æƒ³èµ°å¾—æ›´è¿œ?</h2>
          <div className="service-card">
            <h3 className="service-card-title">å‡çº§<em>ä¸“å±žæ±‚èŒé¡¾é—®æœåŠ¡</em>ï¼Œ<br/>ç”±å¤§åŽ‚å¯¼å¸ˆå›¢é˜Ÿä¸ºä½ å®šåˆ¶æ–¹æ¡ˆ</h3>
            <p className="service-card-sub">ä»Žç®€åŽ†ç²¾ä¿®ã€æŠ•é€’ç­–ç•¥åˆ°é¢è¯•å†²åˆºï¼Œäº«å—é«˜åŒ¹é…åº¦ä¸ªäººåŒ–é™ªè·‘ã€‚<br/>ä¸“ä¸šå¤§åŽ‚åœ¨èŒå¯¼å¸ˆå›¢é˜Ÿï¼ŒæŒ‰ç›®æ ‡å…¬å¸ / å²—ä½ / å­¦æ ¡èƒŒæ™¯ä¸ºä½ ç”„é€‰åŒ¹é…ã€‚</p>
            <ul className="service-list">
              <li><span className="num-badge">1</span><strong>æ±‚èŒç­–ç•¥ 1v1</strong><span>å®šä½ + æŠ•é€’æ—¶é—´çº¿ + å…¬å¸æ¸…å• + é£Žé™©è¯„ä¼°</span></li>
              <li><span className="num-badge">2</span><strong>ç®€åŽ†ç²¾ä¿®</strong><span>é¡¹ç›®çº§æ·±åº¦æ”¹å†™ï¼Œé€å¥å¯¹ç…§ JD ä¼˜åŒ–</span></li>
              <li><span className="num-badge">3</span><strong>æ¨¡æ‹Ÿé¢è¯•</strong><span>è¯­éŸ³ / è§†é¢‘å®žæˆ˜ï¼Œé«˜é¢‘é—®é¢˜ç©¿é€ï¼Œå³æ—¶ç‚¹è¯„</span></li>
              <li><span className="num-badge">4</span><strong>Offer è°ˆè–ª</strong><span>å¤š Offer å–èˆ + HR æŠ¥ä»· counter è¯æœ¯</span></li>
            </ul>
            <div className="service-cta-block">
              <div className="service-cta-text">æ‰«ç æ·»åŠ ä¸“å±žæ±‚èŒå¯¼å¸ˆ</div>
              <img className="service-qr" src="/qr.jpg" alt="æ‰«ç æ·»åŠ ä¸“å±žæ±‚èŒå¯¼å¸ˆ" />
            </div>
            <div className="service-foot">è€å­¦å‘˜ 9 æŠ˜ä¼˜æƒ  Â· ä¸æ»¡æ„ 7 å¤©å†…å…¨é¢é€€æ¬¾ Â· æ”¯æŒæœˆåº¦é™ªè·‘å¥—é¤</div>
          </div>
        </section>

        <hr className="divider" />

        <section className="section" id="insider-tips" style={{display:'none'}}>
          <div className="section-num">06 Â· å…¬å¸å†…å¹•</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>å¯¼å¸ˆäº²è¿°ï¼šè¿™äº›å…¬å¸åˆ°åº•çœ‹ä»€ä¹ˆ</h2>
          <div id="insiderTipsList"></div>
        </section>

        <hr className="divider" id="insider-tips-divider" style={{display:'none'}} />

        <div className="footnote">
          æŠ¥å‘Šç”± MentorX Ã— AI è”åˆç”Ÿæˆ Â· å†…å®¹ä»…ä¾›å‚è€ƒï¼Œä¸æž„æˆ Offer æ‰¿è¯º<br/>
          Powered by <span>Vibe ID</span> Â· è”“è—¤æ•™è‚² Â· 2015 è‡³ä»Š Â· 1,300+ å¤§åŽ‚å¯¼å¸ˆ
        </div>
      </div>

      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />
      <Script src="/report-logic.js?v=edaix-purple-20260612-1" strategy="afterInteractive" />
    </>
  );
}
