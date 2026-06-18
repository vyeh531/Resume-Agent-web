'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

function DesktopReportLayout() {
  return (
    <>
      <style>{`
        .report-headline{font-family:var(--serif);font-weight:700;font-size:22px;line-height:1.4;margin:8px 0 8px;letter-spacing:-0.01em;}
        .report-headline .num{font-style:italic;color:var(--indigo);font-size:32px;}
        .report-headline .gap{font-style:italic;color:var(--rose);font-weight:700;}
        .report-issue{font-size:14px;color:var(--ink-soft);line-height:1.6;border-left:3px solid var(--apricot);padding:4px 0 4px 12px;margin:12px 0 0;}
        .report-metrics .tile-caption b{color:var(--ink);font-weight:700;}
        .tile-value-ats #reportAtsScore{font-size:30px;}
        .report-summary-panel{display:grid;grid-template-columns:280px minmax(0,1fr);gap:28px;align-items:stretch;background:linear-gradient(135deg,#FFFFFF 0%,#FBFAFF 64%,#F7F3FC 100%);border:1px solid #E6DEF2;border-radius:24px;padding:24px;box-shadow:0 18px 48px rgba(69,42,147,.08);}
        .report-score-block{border:1px solid rgba(83,51,166,.14);background:linear-gradient(180deg,#FFFFFF 0%,#F9F6FF 100%);border-radius:18px;padding:28px 22px;display:flex;flex-direction:column;justify-content:center;min-height:260px;box-shadow:inset 0 1px 0 rgba(255,255,255,.82);}
        .report-score-block .result-eyebrow{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute);font-weight:800;margin-bottom:16px;}
        .report-score-line{display:flex;align-items:baseline;gap:5px;line-height:1;margin:0 0 12px;}
        .report-score-line #reportHeadlineScore{font-family:var(--serif);font-style:italic;font-size:72px;font-weight:800;color:var(--indigo);letter-spacing:-.03em;}
        .report-score-line small{font-size:18px;color:var(--ink-soft);font-weight:800;}
        .report-score-badges{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px;}
        .report-risk-badge{display:inline-flex;align-items:center;min-height:28px;border-radius:999px;background:#F0E8FA;color:var(--indigo);padding:5px 10px;font-size:12px;font-weight:800;}
        .report-risk-badge-warn{background:#FBEAF1;color:#B3261E;}
        .report-score-caption{font-size:13px;color:var(--ink-soft);line-height:1.65;margin:0;}
        .report-score-caption b{color:var(--indigo);font-weight:900;}
        .report-summary-copy{display:flex;flex-direction:column;justify-content:center;min-width:0;}
        .report-summary-copy .student-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px;}
        .report-summary-copy .who,.report-summary-copy .pill{display:inline-flex;align-items:center;min-height:28px;border:1px solid #E6DEF2;border-radius:999px;background:#fff;padding:4px 10px;color:#5F567A;font-size:12px;font-weight:700;}
        .report-summary-headline{font-family:var(--serif);font-size:28px;line-height:1.3;margin:0 0 12px;color:var(--ink);letter-spacing:-.01em;}
        .report-summary-headline .gap{color:var(--indigo);font-style:italic;font-weight:900;}
        .report-issue-list{border:1px solid rgba(83,51,166,.12);border-radius:16px;background:rgba(255,255,255,.72);padding:16px 18px;margin:16px 0 16px;}
        .report-issue-list span{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-mute);font-weight:800;margin-bottom:8px;}
        .report-issue-list ol{margin:0;padding-left:20px;color:var(--ink);font-size:13.5px;line-height:1.8;font-weight:600;}
        .report-hero-actions{display:flex;flex-wrap:wrap;gap:10px;}
        .report-hero-actions .btn{min-height:46px;border-radius:12px;}
        .report-secondary-btn{background:#fff;color:var(--ink);border:1px solid #E6DEF2;box-shadow:none;}
        .report-keywords-panel{display:grid;grid-template-columns:minmax(250px,320px) minmax(0,1fr);gap:22px;align-items:stretch;background:#fff;border:1px solid #E6DEF2;border-radius:24px;padding:24px;box-shadow:0 18px 48px rgba(69,42,147,.07);}
        .report-keyword-aside{background:linear-gradient(180deg,#FBFAFF 0%,#FFFFFF 100%);border:1px solid rgba(83,51,166,.12);border-radius:18px;padding:20px;display:flex;flex-direction:column;justify-content:center;}
        .report-keyword-aside .row-between{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
        .report-keyword-aside .section-title{font-size:20px;margin:0;}
        .report-keyword-aside .skill-score{font-size:13px;font-weight:900;color:var(--indigo);white-space:nowrap;}
        .report-keyword-aside .skill-score small{color:var(--ink-soft);font-weight:700;}
        .report-keyword-aside .ai-insight{margin:12px 0 0;padding:12px 13px;border-radius:14px;}
        .report-keyword-table-card{border:1px solid rgba(83,51,166,.12);border-radius:18px;background:#fff;padding:16px 18px;box-shadow:0 12px 28px rgba(69,42,147,.05);}
        .report-keyword-table-card .skill-list{max-height:420px;overflow:auto;padding-right:4px;}
        .report-keyword-table-card .skill-row{min-height:48px;}
        @media (max-width: 860px){
          .report-summary-panel,.report-keywords-panel{grid-template-columns:1fr;padding:18px;border-radius:20px;}
          .report-score-block{min-height:auto;padding:22px;}
          .report-score-line #reportHeadlineScore{font-size:60px;}
          .report-summary-headline{font-size:23px;}
          .report-keyword-table-card .skill-list{max-height:none;}
        }
        .report-page > #summary.report-summary-panel{display:grid;grid-template-columns:280px minmax(0,1fr);gap:28px;align-items:stretch;background:linear-gradient(135deg,#FFFFFF 0%,#FBFAFF 64%,#F7F3FC 100%);border:1px solid #E6DEF2;border-radius:24px;padding:24px!important;box-shadow:0 18px 48px rgba(69,42,147,.08);}
        .report-page > #summary .report-score-block{border:1px solid rgba(83,51,166,.14);background:linear-gradient(180deg,#FFFFFF 0%,#F9F6FF 100%);border-radius:18px;padding:28px 22px;display:flex;flex-direction:column;justify-content:center;min-height:260px;}
        .report-page > #summary .report-score-line{display:flex;align-items:baseline;gap:5px;line-height:1;margin:0 0 12px;color:var(--indigo);font-size:inherit;font-weight:inherit;}
        .report-page > #summary .report-score-line #reportHeadlineScore{font-family:var(--serif);font-style:italic;font-size:72px;font-weight:800;color:var(--indigo);letter-spacing:-.03em;line-height:1;}
        .report-page > #summary .report-summary-copy{display:flex;flex-direction:column;justify-content:center;gap:0;min-width:0;}
        .report-page > #summary .report-summary-headline{font-family:var(--serif);font-size:28px;font-weight:800;line-height:1.3;margin:0 0 12px;color:var(--ink);letter-spacing:-.01em;}
        .report-page > .report-keywords-panel{grid-column:1 / -1;display:grid;grid-template-columns:minmax(250px,320px) minmax(0,1fr);gap:22px;align-items:stretch;background:#fff;border:1px solid #E6DEF2;border-radius:24px;padding:24px!important;box-shadow:0 18px 48px rgba(69,42,147,.07);}
        .report-page > .report-keywords-panel .report-keyword-aside{background:linear-gradient(180deg,#FBFAFF 0%,#FFFFFF 100%);border:1px solid rgba(83,51,166,.12);border-radius:18px;padding:20px;}
        .report-page > .report-keywords-panel .report-keyword-table-card{border:1px solid rgba(83,51,166,.12);border-radius:18px;background:#fff;padding:16px 18px;}
        .report-page > #insider-tips{grid-column:1 / -1!important;width:100%!important;box-sizing:border-box!important;padding:24px!important;border:1px solid #E6DEF2;border-radius:24px;background:#fff;box-shadow:0 18px 48px rgba(69,42,147,.07);}
        .report-page > #insider-tips .section-num{margin:0 0 8px!important;}
        .report-page > #insider-tips .section-title{margin:0 0 14px!important;line-height:1.28!important;}
        .report-page > #insider-tips #insiderTipsReason{margin:0 0 18px!important;}
        .report-page > #insider-tips #insiderTipsList{display:grid;gap:14px;margin-top:18px;}
        .report-page > #insider-tips #insiderTipsList > div{margin-bottom:0!important;}
        .report-page > #insider-tips-divider{grid-column:1 / -1!important;width:100%!important;}
        @media (max-width: 860px){
          .report-page > #summary.report-summary-panel,.report-page > .report-keywords-panel{grid-template-columns:1fr;padding:18px!important;border-radius:20px;}
          .report-page > #summary .report-score-block{min-height:auto;padding:22px;}
          .report-page > #summary .report-score-line #reportHeadlineScore{font-size:60px;}
          .report-page > #summary .report-summary-headline{font-size:23px;}
          .report-page > #insider-tips{padding:18px!important;border-radius:20px;}
          .report-page > #insider-tips .section-title{margin-bottom:12px!important;}
          .report-page > #insider-tips #insiderTipsReason{margin-bottom:14px!important;}
        }
        .export-card{display:block;background:linear-gradient(135deg,#FFFFFF 0%,#FBFAFF 58%,#F0E8FA 100%);border:1px solid #E6DEF2;border-radius:24px;padding:22px;margin:0 0 22px;position:relative;overflow:hidden;box-shadow:0 18px 48px rgba(69,42,147,.08);}
        .export-card::before{content:"";position:absolute;right:-70px;top:-80px;width:220px;height:220px;background:radial-gradient(circle,rgba(122,82,197,.18) 0%,transparent 68%);pointer-events:none;}
        .export-card::after{content:"";position:absolute;left:26px;bottom:-56px;width:180px;height:120px;background:radial-gradient(circle,rgba(83,51,166,.08) 0%,transparent 72%);pointer-events:none;}
        .export-card-main{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,360px);gap:22px;align-items:stretch;}
        .export-card-copy{min-width:0;display:flex;flex-direction:column;gap:14px;justify-content:center;}
        .export-card-head{display:flex;align-items:center;gap:12px;position:relative;}
        .export-card-icon{width:44px;height:44px;border-radius:14px;background:#F0E8FA;color:var(--indigo);display:grid;place-items:center;font-size:18px;flex-shrink:0;box-shadow:inset 0 1px 0 rgba(255,255,255,.8);}
        .export-card-kicker{font-family:var(--mono);font-size:10px;letter-spacing:.10em;text-transform:uppercase;color:var(--ink-mute);font-weight:800;margin:0 0 4px;}
        .export-card-title{font-family:var(--serif);font-weight:800;font-size:22px;line-height:1.18;letter-spacing:-.01em;color:var(--ink);}
        .export-card-format-tag{display:inline-flex;align-items:center;background:#F0E8FA;color:var(--indigo);font-family:var(--mono);font-size:10px;letter-spacing:.04em;padding:3px 8px;border-radius:999px;margin-left:8px;vertical-align:3px;}
        .export-card-desc{max-width:720px;font-size:13.5px;color:var(--ink-soft);margin:0;line-height:1.65;position:relative;font-weight:550;}
        .export-card-desc b{color:var(--ink);font-weight:800;}
        .export-card-perks{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;position:relative;}
        .export-card-perks li{display:grid;grid-template-columns:20px minmax(0,1fr);gap:8px;align-items:start;background:rgba(255,255,255,.72);border:1px solid rgba(83,51,166,.10);border-radius:14px;padding:10px 11px;font-size:12.5px;font-weight:650;color:var(--ink);line-height:1.35;}
        .export-card-perks .check{width:20px;height:20px;border-radius:50%;background:var(--indigo);color:#fff;display:grid;place-items:center;font-size:10px;font-weight:800;flex-shrink:0;}
        .export-card-actions{position:relative;background:#fff;border:1px solid rgba(83,51,166,.14);border-radius:20px;padding:18px;display:flex;flex-direction:column;justify-content:center;gap:12px;box-shadow:0 16px 36px rgba(69,42,147,.08);}
        .export-card-actions-title{font-size:14px;font-weight:800;color:var(--ink);line-height:1.35;margin:0;}
        .export-card-actions-sub{font-size:12px;color:var(--ink-soft);line-height:1.5;margin:0 0 2px;font-weight:600;}
        .export-card-actions .btn{width:100%;min-height:48px;justify-content:center;border-radius:14px;box-shadow:none;margin:0!important;}
        .export-card-actions .btn-jade{background:linear-gradient(135deg,#5333A6 0%,#7A52C5 100%);color:#fff;box-shadow:0 14px 28px rgba(83,51,166,.20);}
        .btn-ai-prompt{background:#fff;color:var(--ink);border:1px solid #E6DEF2;}
        .btn-ai-prompt:hover{background:#F7F3FC;border-color:rgba(83,51,166,.24);}
        .export-card-hint{font-size:11.5px;color:var(--ink-soft);line-height:1.5;text-align:left;margin:2px 0 0;font-weight:600;}
        @media (max-width: 860px){
          .export-card{padding:18px;border-radius:20px;}
          .export-card-main{grid-template-columns:1fr;gap:16px;}
          .export-card-title{font-size:20px;}
          .export-card-perks{grid-template-columns:1fr;}
          .export-card-actions{padding:16px;}
        }
        .report-page > .export-card{display:block!important;grid-template-columns:none!important;grid-column:1 / -1!important;max-width:none!important;width:100%!important;box-sizing:border-box!important;}
        .report-page > .export-card .export-card-main{display:grid!important;width:100%!important;grid-template-columns:minmax(0,1fr) minmax(300px,360px)!important;gap:24px!important;align-items:stretch!important;}
        .report-page > .export-card .export-card-copy{min-width:0!important;}
        .report-page > .export-card .export-card-perks{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important;margin:0!important;}
        .report-page > .export-card .export-card-actions{min-width:0!important;}
        @media (max-width: 860px){
          .report-page > .export-card .export-card-main{grid-template-columns:1fr!important;}
          .report-page > .export-card .export-card-perks{grid-template-columns:1fr!important;}
        }
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
            <img src="/logo/logo%20banner_no_bg.png" alt="MentorX 蔓藤教育" className="brand-img" />
          </div>
          <div className="brand-meta" style={{fontSize:'10px',letterSpacing:'.08em'}}>完整报告</div>
        </div>

        <div className="banner fade-in">
          <div className="banner-check">✓</div>
          <div>完整报告已为你生成</div>
        </div>

        <div className="export-card">
          <div className="export-card-main">
            <div className="export-card-copy">
              <div className="export-card-head">
                <div className="export-card-icon">📄</div>
                <div>
                  <p className="export-card-kicker">Report Ready</p>
                  <div className="export-card-title">完整诊断报告<span className="export-card-format-tag">PDF</span></div>
                </div>
              </div>
              <p className="export-card-desc">把这份 PDF 整段喂给 <b>ChatGPT / Claude / 豆包</b> 等任意 LLM，基于 4 位大厂导师建议<b>自动重写你的简历</b>，一键产出可投递的新版本。</p>
              <ul className="export-card-perks">
                <li><span className="check">✓</span><span>ATS 通过率 <b>+30%</b>，自动匹配 JD 技能</span></li>
                <li><span className="check">✓</span><span>面试邀约率 <b>翻倍</b>，简历讲对 PM 的语言</span></li>
                <li><span className="check">✓</span><span>1 份报告反复用，投每个公司都能精准对齐</span></li>
              </ul>
            </div>
            <div className="export-card-actions">
              <p className="export-card-actions-title">下载交付文件</p>
              <p className="export-card-actions-sub">先保存完整报告，再下载 AI 改简历指令包。</p>
              <button className="btn btn-jade btn-block" onClick={() => window.exportPDF && window.exportPDF()}>
                ↓ 下载 PDF 报告
              </button>
              <button className="btn btn-block btn-ai-prompt" onClick={() => window.exportAiRewritePDF && window.exportAiRewritePDF()}>
                下载 AI 改简历指令包
              </button>
              <p className="export-card-hint">上传指令包 + 原简历，让 AI 按关键词和导师建议直接重写。</p>
            </div>
          </div>
        </div>

        <section className="section report-summary-panel" id="summary">
          <div className="report-score-block">
            <div className="result-eyebrow">Resume Score</div>
            <div className="report-score-line"><span id="reportHeadlineScore">--</span><small>/100</small></div>
            <div className="report-score-badges">
              <span className="report-risk-badge">Needs Improvement</span>
              <span className="report-risk-badge report-risk-badge-warn">高风险</span>
            </div>
            <p className="report-score-caption">距离目标岗位仍有明显差距，优先补齐岗位关键词、技能证据和量化成果。</p>
          </div>

          <div className="report-summary-copy">
            <div className="student-row">
              <span className="who">完整报告已生成</span>
              <span className="pill pill-mute">目标岗位分析完成</span>
            </div>
            <h2 className="report-summary-headline">离顶级 Offer 线 <span className="gap" id="reportHeadlineSalaryTop">待校准</span> 仍有差距。</h2>
            <p className="report-issue" id="coreIssue"></p>
            <div className="report-issue-list" aria-label="Full report coverage">
              <span>Top issues</span>
              <ol>
                <li>JD 关键词覆盖不足</li>
                <li>技能匹配与目标岗位不够直接</li>
                <li>经历中的量化结果偏少</li>
              </ol>
            </div>
            <div className="report-hero-actions">
              <a className="btn btn-jade" href="#mentors">查看导师建议</a>
              <a className="btn report-secondary-btn" href="#reportDataMetrics">查看评分细节</a>
            </div>
          </div>

        </section>

        <section className="section report-keywords-panel">
          <div className="report-keyword-aside">
            <div className="section-num">JD KEYWORDS</div>
            <div className="row-between mb-12">
              <h3 className="section-title" id="reportSkillSectionTitle">JD Keyword 清单</h3>
              <div className="skill-score"><small>已覆盖 </small><span id="reportSkillHave">0</span><small> / <span id="reportSkillTotal">--</span></small></div>
            </div>
            <p className="skill-section-desc" id="reportSkillSectionDesc">这些是系统从 JD 中识别出的关键词。优先把待补强项写进 Summary、Skills 或 Experience。</p>
            <div className="ai-insight">
              <p className="ai-insight-diagnosis">
                <span className="ico">·</span>正在加载技能匹配数据...
              </p>
            </div>
          </div>
          <div className="card card-tight report-keyword-table-card">
            <ul className="skill-list" id="skillList"></ul>
            <button className="skill-expand-toggle" id="reportSkillExpandToggle" type="button" hidden>查看更多 ↓</button>
          </div>
        </section>

        <hr className="divider" />

        <section className="section report-metrics" id="reportDataMetrics">
          <div className="section-num">02 · 数据维度</div>
          <h2 className="section-title">四个判断维度</h2>
          <p className="section-desc">完整报告保留所有评分依据，和结果页使用同一套四卡结构。</p>
          <div className="report-dimension-grid" id="reportDataTiles">
            <article className="report-dimension-card report-dimension-card--purple tile">
              <header className="report-dimension-card-head">
                <div>
                  <div className="tile-label">JD 匹配度</div>
                  <div className="tile-value"><span id="reportRankPct">--</span></div>
                </div>
                <div className="report-dimension-marker" aria-hidden="true"></div>
              </header>
              <div className="tile-caption">基于 JD 关键词覆盖</div>
              <div className="report-dimension-divider"></div>
              <div className="report-dimension-detail-head">评分依据</div>
              <div className="tile-detail" id="reportRankDetail"></div>
            </article>
            <article className="report-dimension-card report-dimension-card--red tile">
              <header className="report-dimension-card-head">
                <div>
                  <div className="tile-label">ATS 可读性</div>
                  <div className="tile-value tile-value-ats"><span id="reportAtsScore">--</span><span className="tile-percent">%</span></div>
                </div>
                <div className="report-dimension-marker" aria-hidden="true"></div>
              </header>
              <div className="tile-caption" id="reportAtsRiskCaption">主流系统识别</div>
              <div className="report-dimension-divider"></div>
              <div className="report-dimension-detail-head">评分依据</div>
              <div className="tile-detail" id="reportAtsDetail"></div>
            </article>
            <article className="report-dimension-card report-dimension-card--blue tile">
              <header className="report-dimension-card-head">
                <div>
                  <div className="tile-label">Salary · 薪资成长</div>
                  <div className="tile-value" id="reportSalaryRange">成长潜力</div>
                </div>
                <div className="report-dimension-marker" aria-hidden="true"></div>
              </header>
              <div className="tile-caption">5年上限 <b id="reportSalaryTop">待校准</b></div>
              <div className="report-dimension-divider"></div>
              <div className="report-dimension-detail-head">评分依据</div>
              <div className="tile-detail" id="reportSalaryDetail"></div>
            </article>
            <article className="report-dimension-card report-dimension-card--orange tile">
              <header className="report-dimension-card-head">
                <div>
                  <div className="tile-label">AI 影响趋势</div>
                  <div className="tile-value"><span id="reportAiImpactLevel">--</span></div>
                </div>
                <div className="report-dimension-marker" aria-hidden="true"></div>
              </header>
              <div className="tile-caption"><span id="reportAiImpactCaption">待校准</span></div>
              <div className="report-dimension-divider"></div>
              <div className="report-dimension-detail-head">评分依据</div>
              <div className="tile-detail" id="reportAiImpactDetail"></div>
            </article>
          </div>
        </section>

        <hr className="divider" />

        <section className="section report-ats-panel" id="atsDetailSection">
          <div className="section-num">03 · ATS 诊断</div>
          <h2 className="section-title">系统评分详情</h2>
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
          <div className="section-num">04 · 完整导师建议</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>每个角度都有人帮你看过了</h2>
          <div id="mentorLogoIntroSlot"></div>
          <div id="mentorsList"></div>
        </section>

        <hr className="divider" />

        <section className="section" id="insider-tips">
          <div className="section-num">05 · 公司内幕</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>导师亲述：这些公司到底看什么</h2>
          <div id="insiderTipsList"></div>
        </section>

        <hr className="divider" id="insider-tips-divider" />

        <section className="section" id="service">
          <div className="section-num" id="serviceNum">06 · 升级服务</div>
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

        <hr className="divider" />

        <div className="footnote">
          报告由 MentorX × AI 联合生成 · 内容仅供参考，不构成 Offer 承诺<br/>
          Powered by <span>Vibe ID</span> · 蔓藤教育 · 2015 至今 · 1,300+ 大厂导师
        </div>
      </div>

    </>
  );
}




function MobileReportLayout() {
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

      <div className="page mobile-report-page">
        <div className="brandbar">
          <div className="brand">
            <img src="/logo/logo%20banner_no_bg.png" alt="MentorX 蔓藤教育" className="brand-img" />
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
          <div className="card card-tight" style={{background:'linear-gradient(135deg,rgba(247,243,252,.92) 0%,rgba(255,255,255,.96) 100%)',border:'1px solid var(--line)'}}>
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

        <section className="section" id="insider-tips">
          <div className="section-num">05 · 公司内幕</div>
          <h2 className="section-title" style={{fontSize:'22px'}}>导师亲述：这些公司到底看什么</h2>
          <div id="insiderTipsList"></div>
        </section>

        <hr className="divider" id="insider-tips-divider" />

        <section className="section" id="service">
          <div className="section-num" id="serviceNum">06 · 升级服务</div>
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

function ReportLayoutPending() {
  return <div className="page report-page responsive-layout-pending" aria-hidden="true" />;
}

export default function ReportPage() {
  const isMobile = useInitialMobileLayout();

  if (isMobile === null) {
    return <ReportLayoutPending />;
  }

  return (
    <>
      {isMobile ? <MobileReportLayout /> : <DesktopReportLayout />}
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" strategy="lazyOnload" />
      <Script src="/report-logic.js?v=edaix-purple-20260612-1" strategy="afterInteractive" />
    </>
  );
}

