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
        .export-card{background:linear-gradient(135deg,var(--paper-warm) 0%,var(--jade-soft) 100%);border:1px solid #b8d6bd;border-radius:var(--r-lg);padding:18px 18px 16px;margin:0 0 22px;position:relative;overflow:hidden;box-shadow:var(--shadow-soft);}
        .export-card::before{content:"";position:absolute;right:-30px;top:-30px;width:120px;height:120px;background:radial-gradient(circle,rgba(47,107,79,.18) 0%,transparent 70%);pointer-events:none;}
        .export-card-head{display:flex;align-items:center;gap:10px;margin-bottom:8px;position:relative;}
        .export-card-icon{width:36px;height:36px;border-radius:10px;background:var(--ink);color:var(--paper-warm);display:grid;place-items:center;font-size:16px;flex-shrink:0;}
        .export-card-title{font-family:var(--serif);font-weight:700;font-size:17px;line-height:1.2;}
        .export-card-format-tag{display:inline-block;background:var(--ink);color:var(--paper-warm);font-family:var(--mono);font-size:10px;letter-spacing:.06em;padding:2px 8px;border-radius:6px;margin-left:6px;vertical-align:2px;}
        .export-card-desc{font-size:13px;color:var(--ink);margin:0 0 12px;line-height:1.6;position:relative;font-weight:500;}
        .export-card-perks{list-style:none;padding:0;margin:0 0 16px;display:flex;flex-direction:column;gap:7px;position:relative;}
        .export-card-perks li{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--ink);line-height:1.4;}
        .export-card-perks .check{width:18px;height:18px;border-radius:50%;background:var(--jade);color:#fff;display:grid;place-items:center;font-size:10px;font-weight:700;flex-shrink:0;}
        .export-card-actions{display:flex;flex-direction:column;gap:10px;position:relative;}
        .btn-ai-prompt{background:#fffdf7;color:var(--jade);border:1.5px solid var(--jade);box-shadow:none;}
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
        .ai-pdf-card{background:#fffdf7;border:1px solid #ede9dc;border-radius:12px;padding:14px 16px;margin:12px 0;break-inside:avoid;page-break-inside:avoid;}
        .ai-pdf-card.ai-pdf-prompt{background:#f3fbf5;border-color:#c2dcc6;}
        .ai-pdf-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .ai-pdf-chip-list{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
        .ai-pdf-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid #e7e2d6;background:#fff;border-radius:999px;padding:4px 8px;font-size:11px;color:var(--ink-soft);line-height:1.3;}
        .ai-pdf-chip strong{color:var(--ink);font-weight:800;}
        .ai-pdf-chip.weak{border-color:#fed7aa;background:#fff7ed;color:#9a3412;}
        .ai-pdf-chip.have{border-color:#c2dcc6;background:#f0f9f2;color:#2f6b4f;}
        .ai-pdf-meta{font-family:var(--mono);font-size:10px;color:var(--ink-mute);margin-top:2px;}
        .ai-pdf-advice{border-top:1px dashed var(--line);padding-top:12px;margin-top:12px;break-inside:avoid;page-break-inside:avoid;}
        .ai-pdf-advice:first-of-type{border-top:none;padding-top:0;margin-top:0;}
        .ai-pdf-label{display:inline-flex;font-size:10px;font-weight:800;padding:2px 7px;border-radius:999px;background:#eef2ff;color:#4338ca;margin-right:6px;}
        .ai-insight{margin:14px 0 16px;padding:14px 16px;background:linear-gradient(135deg,var(--jade-soft) 0%,var(--paper-warm) 100%);border:1px solid #b8d6bd;border-radius:var(--r-md);}
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
        .keyword-use{font-size:10.5px;font-weight:700;border-radius:999px;padding:3px 7px;border:1px solid var(--line);white-space:nowrap;background:#fffdf7;color:var(--ink-soft);}
        .keyword-use--skills{background:var(--jade-soft);color:var(--jade);border-color:#c2dcc6;}
        .keyword-use--experience{background:#fff7ed;color:#9a3412;border-color:#fed7aa;}
        .keyword-use--summary{background:#eef2ff;color:#4338ca;border-color:#c7d2fe;}
        .keyword-use--reference{background:#f5f5f4;color:#78716c;border-color:#e7e2d6;}
        .skill-extra[hidden],.report-skill-extra[hidden]{display:none!important;}
        .skill-expand-toggle{width:100%;margin-top:8px;border:1px dashed var(--line);background:var(--paper-warm);border-radius:10px;padding:10px 12px;font-size:13px;font-weight:700;color:var(--jade);cursor:pointer}
        .skill-expand-toggle:hover{background:var(--jade-soft)}
        .jd-keyword-details{margin-top:12px;border-top:1px solid var(--line);padding-top:10px;}
        .jd-keyword-details[hidden]{display:none!important;}
        .jd-keyword-groups{display:grid;gap:10px;margin-top:8px;}
        .jd-keyword-group{border:1px solid #ede9dc;background:#fffdf7;border-radius:10px;padding:10px 11px;}
        .jd-keyword-group-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;}
        .jd-keyword-group-title{font-size:12px;font-weight:800;color:var(--ink);letter-spacing:.01em;}
        .jd-keyword-group-count{font-family:var(--mono);font-size:10px;color:var(--ink-mute);}
        .jd-keyword-chips{display:flex;flex-wrap:wrap;gap:6px;}
        .jd-keyword-chip{display:inline-flex;align-items:center;gap:5px;border:1px solid #e7e2d6;background:#fff;border-radius:999px;padding:4px 8px;font-size:11.5px;color:var(--ink-soft);max-width:100%;}
        .jd-keyword-chip[hidden]{display:none!important;}
        .jd-keyword-chip b{font-weight:700;color:var(--ink);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .jd-keyword-chip .state{width:6px;height:6px;border-radius:50%;flex-shrink:0;background:var(--warn);}
        .jd-keyword-chip.is-have .state{background:var(--good);}
        .jd-keyword-chip .keyword-use{font-size:9.5px;padding:2px 6px;}
        .service-card{background:linear-gradient(135deg,var(--paper-warm) 0%,var(--paper-deep) 100%);border:1px solid var(--line);border-radius:var(--r-lg);padding:26px 22px 22px;margin-top:12px;position:relative;overflow:hidden;}
        .service-card::before{content:"";position:absolute;left:-40px;bottom:-40px;width:140px;height:140px;background:radial-gradient(circle,rgba(232,160,107,.22) 0%,transparent 70%);pointer-events:none;}
        .service-card-title{font-family:var(--serif);font-weight:700;font-size:22px;line-height:1.3;text-align:center;margin:0 0 8px;position:relative;letter-spacing:-0.01em;}
        .service-card-title em{color:var(--terracotta);font-style:italic;}
        .service-card-sub{font-size:14px;color:var(--ink-soft);text-align:center;margin:0 0 22px;line-height:1.55;position:relative;}
        .service-list{list-style:none;padding:0;margin:0 0 20px;display:flex;flex-direction:column;gap:10px;position:relative;}
        .service-list li{background:var(--paper-warm);border:1px solid var(--line);border-radius:var(--r-md);padding:14px 16px 14px 50px;position:relative;font-size:13px;line-height:1.5;}
        .service-list li strong{display:block;font-size:14px;color:var(--ink);margin-bottom:2px;}
        .service-list li span{color:var(--ink-soft);}
        .service-list .num-badge{position:absolute;left:14px;top:50%;transform:translateY(-50%);width:26px;height:26px;border-radius:50%;background:var(--terracotta);color:#fff;display:grid;place-items:center;font-family:var(--serif);font-style:italic;font-weight:700;font-size:13px;}
        .service-cta-block{background:#fffdf7;border:1px solid rgba(47,107,79,.18);border-radius:14px;padding:18px 16px 20px;text-align:center;margin:18px auto 12px;position:relative;max-width:286px;box-shadow:0 1px 0 rgba(24,24,22,.04),0 12px 22px -18px rgba(24,24,22,.24);}
        .service-handle{font-family:var(--mono);font-size:12px;color:var(--ink);font-weight:600;margin-top:6px;}
        .service-cta-text{font-size:14px;color:var(--ink);font-weight:800;margin:0 0 12px;line-height:1.35;}
        .service-qr{width:190px;height:190px;object-fit:contain;margin:0 auto;border-radius:10px;border:1px solid #ede9dc;background:#fff;padding:7px;box-shadow:0 1px 8px rgba(24,24,22,.08);}
        .service-foot{font-size:11px;color:var(--ink-mute);text-align:center;line-height:1.6;position:relative;}
        .logo-marquee{overflow:hidden;border:1px solid var(--line);border-radius:12px;background:#fffdf7;margin:0 0 16px;padding:10px 0}
        .logo-marquee-track{display:flex;gap:14px;width:max-content;animation:logo-scroll 72s linear infinite}
        .logo-marquee:hover .logo-marquee-track{animation-play-state:paused}
        .mentor-logo-chip{width:72px;height:42px;border:1px solid #ede9dc;border-radius:8px;background:#fff;display:flex;align-items:center;justify-content:center;padding:7px;flex:0 0 auto}
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

      <div className="page">
        <div className="brandbar">
          <div className="brand">
            <img src="/logo/MentorX.png" alt="MentorX 蔓藤教育" className="brand-img" />
          </div>
          <div className="brand-meta" style={{fontSize:'10px',letterSpacing:'.08em'}}>完整报告</div>
        </div>

        <div className="banner fade-in">
          <div className="banner-check">✓</div>
          <div>完整报告已为你生成</div>
        </div>

        <div className="export-card">
          <div className="export-card-head">
            <div className="export-card-icon">📄</div>
            <div>
              <div className="export-card-title">完整诊断报告<span className="export-card-format-tag">PDF</span></div>
            </div>
          </div>
          <p className="export-card-desc">把这份 PDF 整段喂给 <b>ChatGPT / Claude / 豆包</b> 等任意 LLM，基于 4 位大厂导师建议<b>自动重写你的简历</b>——不用一句句改，一键产出可投递的新版本。</p>
          <ul className="export-card-perks">
            <li><span className="check">✓</span><span>ATS 通过率 <b>+30%</b>，自动匹配 JD 技能</span></li>
            <li><span className="check">✓</span><span>面试邀约率 <b>翻倍</b>，简历讲对 PM 的语言</span></li>
            <li><span className="check">✓</span><span>1 份报告反复用，投每个公司都能精准对齐</span></li>
          </ul>
          <button className="btn btn-jade btn-block" onClick={() => window.exportPDF && window.exportPDF()}>
            ⬇ 下载 PDF 报告
          </button>
          <button className="btn btn-block btn-ai-prompt" onClick={() => window.exportAiRewritePDF && window.exportAiRewritePDF()} style={{marginTop:'10px'}}>
            &#19979;&#36733; AI &#25913;&#31616;&#21382;&#25351;&#20196;&#21253;
          </button>
          <p className="export-card-hint">&#19978;&#20256;&#36825;&#20221;&#25351;&#20196;&#21253; + &#20320;&#30340;&#21407;&#31616;&#21382;&#65292;&#35753; AI &#25353;&#20851;&#38190;&#35789;&#21644;&#23548;&#24072;&#24314;&#35758;&#30452;&#25509;&#37325;&#20889;&#12290;</p>
        </div>

        <section className="section" id="summary">
          <div className="section-num">01 · 整体诊断</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>先看大盘</h2>
          <div className="card card-tight">
            <h3 className="report-headline">
              你的当前简历综合评分 <span className="num" id="reportHeadlineScore">--</span> 分，<br/>
              离顶级 Offer 线 <span className="gap" id="reportHeadlineSalaryTop">待校准</span> 仍有差距。
            </h3>
            <p className="report-issue" id="coreIssue"></p>
          </div>
          <div className="card card-tight mt-16">
            <div className="section-num" id="reportSkillSectionTitle" style={{marginBottom:6}}>JD Keyword 清单</div>
            <p className="skill-section-desc" id="reportSkillSectionDesc">这些是系统从 JD 中识别出的关键词。优先把待补强项写进 Summary、Skills 或 Experience。</p>
            <div className="ai-insight">
              <p className="ai-insight-diagnosis">
                <span className="ico">💡</span>正在加载技能匹配数据…
              </p>
            </div>
            <ul className="skill-list" id="skillList"></ul>
            <button className="skill-expand-toggle" id="reportSkillExpandToggle" type="button" hidden>查看更多 ↓</button>
          </div>
        </section>

        <hr className="divider" />

        <section className="section report-metrics" id="reportDataMetrics">
          <div className="section-num">02 · 数据维度</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>四个判断维度</h2>
          <p className="section-desc">这里对应结果页的四张预览卡片，点击展开查看完整说明。</p>
          <div className="tiles" id="reportDataTiles">
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>JD 匹配度</span><span className="chev">▼</span></div>
                <div className="tile-value"><span id="reportRankPct">--</span></div>
                <div className="tile-caption">基于 JD 关键词覆盖</div>
              </summary>
              <div className="tile-detail" id="reportRankDetail"></div>
            </details>
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>ATS 可读性</span><span className="chev">▼</span></div>
                <div className="tile-value tile-value-split tile-value-ats"><span><span id="reportAtsScore">--</span><span className="tile-percent">%</span></span><span className="tile-risk-value" id="reportAtsRiskCaption">主流系统识别</span></div>
              </summary>
              <div className="tile-detail" id="reportAtsDetail"></div>
            </details>
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>SALARY · 薪资成长</span><span className="chev">▼</span></div>
                <div className="tile-value" style={{fontSize:'22px'}} id="reportSalaryRange">成长潜力</div>
                <div className="tile-caption">5年上限 <b id="reportSalaryTop">待校准</b></div>
              </summary>
              <div className="tile-detail" id="reportSalaryDetail"></div>
            </details>
            <details className="tile">
              <summary className="tile-summary">
                <div className="tile-label"><span>AI 影响趋势</span><span className="chev">▼</span></div>
                <div className="tile-value" style={{fontSize:'22px'}}><span id="reportAiImpactLevel">--</span></div>
                <div className="tile-caption"><span id="reportAiImpactCaption">待校准</span></div>
              </summary>
              <div className="tile-detail" id="reportAiImpactDetail"></div>
            </details>
          </div>
        </section>

        <hr className="divider" />

        <section className="section" id="atsDetailSection">
          <div className="section-num">03 · ATS 诊断</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>系统评分详情</h2>
          <div className="card card-tight" style={{background:'linear-gradient(135deg,rgba(168,213,186,.08) 0%,rgba(232,160,107,.06) 100%)',border:'1px solid rgba(168,213,186,.2)'}}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:'16px',position:'relative'}}>
              <div id="atsRiskBadge" style={{position:'absolute',top:0,right:0,padding:'4px 10px',borderRadius:'99px',fontSize:'12px',fontWeight:700,fontFamily:'var(--mono)',letterSpacing:'.04em'}}></div>
              <div id="atsTotalScore" style={{position:'absolute',top:0,left:0,fontSize:'22px',fontWeight:800,fontFamily:'var(--mono)',lineHeight:1}}></div>
              <svg id="atsRadarChart" width="240" height="220" viewBox="0 0 240 220" style={{overflow:'visible',marginTop:'28px'}}></svg>
            </div>
            <div id="atsSystemSummary" style={{fontSize:'13px',color:'var(--ink-soft)',lineHeight:1.6,marginBottom:'14px'}}></div>
            <div id="atsDimensionProblems" style={{marginTop:'12px'}}></div>
            <div id="atsProblemsSection"></div>
          </div>
        </section>

        <hr className="divider" />

        <section className="section" id="mentors">
          <div className="section-num">04 · 完整导师建议</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>每个角度都有人帮你看过了</h2>
          <div id="mentorLogoIntroSlot"></div>
          <div id="mentorsList"></div>
        </section>

        <hr className="divider" />

        <section className="section" id="insider-tips" style={{display:'none'}}>
          <div className="section-num">05 · 公司内幕</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>导师亲述：这些公司到底看什么</h2>
          <div id="insiderTipsList"></div>
        </section>

        <hr className="divider" id="insider-tips-divider" style={{display:'none'}} />

        <section className="section" id="service">
          <div className="section-num" id="serviceNum">05 · 升级服务</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>想走得更远?</h2>
          <div className="service-card">
            <h3 className="service-card-title">升级<em>专属求职顾问服务</em>，<br/>由大厂导师团队为你定制方案</h3>
            <p className="service-card-sub">从简历精修、投递策略到面试冲刺，享受高匹配度个人化陪跑。<br/>专业大厂在职导师团队，按目标公司 / 岗位 / 学校背景为你甄选匹配。</p>
            <ul className="service-list">
              <li><span className="num-badge">1</span><strong>求职策略 1v1</strong><span>定位 + 投递时间线 + 公司清单 + 风险评估</span></li>
              <li><span className="num-badge">2</span><strong>简历精修</strong><span>项目级深度改写，逐句对照 JD 优化</span></li>
              <li><span className="num-badge">3</span><strong>模拟面试</strong><span>语音 / 视频实战，高频问题穿透，即时点评</span></li>
              <li><span className="num-badge">4</span><strong>Offer 谈薪</strong><span>多 Offer 取舍 + HR 报价 counter 话术</span></li>
            </ul>
            <div className="service-cta-block">
              <div className="service-cta-text">扫码添加专属求职导师</div>
              <img className="service-qr" src="/qr.jpg" alt="扫码添加专属求职导师" />
            </div>
            <div className="service-foot">老学员 9 折优惠 · 不满意 7 天内全额退款 · 支持月度陪跑套餐</div>
          </div>
        </section>

        <div className="footnote">
          报告由 MentorX × AI 联合生成 · 内容仅供参考，不构成 Offer 承诺<br/>
          Powered by <span>Vibe ID</span> · 蔓藤教育 · 2015 至今 · 1,300+ 大厂导师
        </div>
      </div>

      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />
      <Script src="/report-logic.js?v=utf8-source-clean-20260611-1" strategy="afterInteractive" />
    </>
  );
}
