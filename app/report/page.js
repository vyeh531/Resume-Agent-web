'use client';
import Script from 'next/script';

export default function ReportPage() {
  return (
    <>
      <div className="page">
        <div className="brandbar">
          <div className="brand">
            <img src="/logo/cropped-cropped-WechatIMG231-1.png" alt="MentorX 蔓藤教育" className="brand-img" />
          </div>
          <div className="brand-meta" style={{fontSize:'10px',letterSpacing:'.08em'}}>完整报告</div>
        </div>

        <div id="reportContent">
          <p style={{padding:'40px 20px',color:'var(--ink-soft)',textAlign:'center'}}>报告加载中…</p>
        </div>

        <div className="footnote">
          诊断由 4 位真实导师 + AI 联合产出<br/>
          Powered by <span>Vibe ID</span> · MentorX
        </div>
      </div>

      <Script src="/report-logic.js" strategy="afterInteractive" />
    </>
  );
}
