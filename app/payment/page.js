'use client';
import Script from 'next/script';

export default function PaymentPage() {
  return (
    <>
      <style>{`
        .pay-card{background:rgba(255,255,255,.9);border:1px solid var(--line);border-radius:var(--r-lg);padding:24px 22px;text-align:center;margin-top:8px;box-shadow:var(--shadow-card)}
        .pay-summary{background:var(--paper-deep);border-radius:var(--r-md);padding:14px 16px;margin-bottom:22px;text-align:left;font-size:13px}
        .pay-summary .label{font-family:var(--mono);font-size:10px;color:var(--ink-mute);letter-spacing:.12em;text-transform:uppercase;margin-bottom:6px}
        .pay-summary .item{display:flex;justify-content:space-between;padding:4px 0;color:var(--ink)}
        .pay-summary .item.total{border-top:1px solid var(--line);margin-top:8px;padding-top:8px;font-weight:700}
        .pay-price{font-family:var(--serif);font-style:italic;font-weight:700;color:var(--rose);font-size:56px;line-height:1;display:flex;align-items:baseline;justify-content:center;gap:8px;margin:4px 0 6px}
        .pay-price b{font-size:28px}
        .pay-was{color:var(--ink-mute);text-decoration:line-through;font-size:14px;font-family:var(--mono)}
        .pay-discount{display:inline-block;margin-top:6px;background:linear-gradient(135deg,#5333A6,#B47EDB);color:#fff;font-size:11px;font-weight:600;padding:4px 10px;border-radius:999px;font-family:var(--mono);letter-spacing:.04em}
        .pay-method{display:flex;align-items:center;gap:12px;border:1.5px solid var(--line);background:var(--jade-soft);border-radius:var(--r-md);padding:14px 16px;margin:22px 0 22px;text-align:left}
        .pay-method .wx{width:36px;height:36px;border-radius:8px;background:#07c160;color:#fff;display:grid;place-items:center;font-family:var(--serif);font-weight:700;font-size:18px;flex-shrink:0}
        .pay-method .text{flex:1}
        .pay-method .label{font-weight:700;font-size:14px}
        .pay-method .sub{font-size:12px;color:var(--ink-soft);margin-top:2px}
        .pay-method .check{width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#5333A6,#B47EDB);color:#fff;display:grid;place-items:center;font-size:12px;font-weight:700;flex-shrink:0}
        .pay-trust{display:flex;gap:16px;justify-content:center;margin-top:16px;font-size:11px;color:var(--ink-mute);flex-wrap:wrap}
        .pay-trust span{display:inline-flex;align-items:center;gap:4px}
        .pay-foot{text-align:center;font-size:11px;color:var(--ink-mute);margin-top:18px;line-height:1.7}
        .pay-foot a{color:var(--rose)}
        .pay-back{display:inline-flex;align-items:center;gap:6px;color:var(--ink-soft);font-size:13px;margin-bottom:12px;text-decoration:none}
        .pay-back:hover{color:var(--ink)}
        .qr{width:140px;height:140px;border:2px solid var(--line);border-radius:var(--r-md);margin:0 auto;background:var(--paper-deep);display:grid;place-items:center;font-size:40px}
      `}</style>

      <div className="page payment-page">
        <div className="brandbar">
          <div className="brand">
            <img src="/logo/logo%20banner_no_bg.png" alt="MentorX 蔓藤教育" className="brand-img" />
          </div>
          <div className="brand-meta">4 / 5 · 解锁支付</div>
        </div>

        <a href="/result" className="pay-back">← 返回诊断报告</a>
        <h1 className="section-title" style={{fontSize:'22px',marginTop:'8px'}}>最后一步,解锁完整报告</h1>
        <p className="section-desc">支付完成后立即解锁完整诊断报告、4 位导师建议、JD Keyword 清单和 AI 改简历指令包。</p>

        <div className="pay-card fade-in">
          <div className="pay-summary">
            <div className="label">订单内容</div>
            <div className="item"><span>4 位大厂导师完整建议</span><span className="text-mute">最多 12 条</span></div>
            <div className="item"><span>完整 JD Keyword 清单</span><span className="text-mute">含放置建议</span></div>
            <div className="item"><span>完整诊断报告 PDF</span><span className="text-mute">可下载</span></div>
            <div className="item"><span>AI 改简历指令包</span><span className="text-mute">ChatGPT / Claude</span></div>
            <div className="item total"><span>合计</span><span>¥ 49.00</span></div>
          </div>

          <div className="text-mute" style={{fontSize:'11px',fontFamily:'var(--mono)',letterSpacing:'.12em',textTransform:'uppercase'}}>应付金额</div>
          <div className="pay-price"><b>¥</b>49</div>
          <div><span className="pay-was">原价 ¥199</span></div>
          <div className="pay-discount">秋招特价 · 限时 75% off</div>

          <div style={{margin:'26px 0 12px'}}><div className="qr">📱</div></div>
          <p className="text-mute" style={{fontSize:'12px',margin:'0 0 6px'}}>微信扫码完成支付</p>
          <p className="text-soft" style={{fontSize:'12px',margin:'0 0 0'}} id="qrTimer">二维码 14:59 后过期</p>

          <div className="pay-method">
            <div className="wx">微</div>
            <div className="text">
              <div className="label">微信支付</div>
              <div className="sub">扫上方二维码,在微信中确认</div>
            </div>
            <div className="check">✓</div>
          </div>

          <button className="btn btn-jade btn-block" onClick={(e) => window.mockPayment && window.mockPayment(e.currentTarget)}>我已扫码完成支付</button>

          <div className="pay-trust">
            <span>🔒 加密交易</span>
            <span>· 支持开发票</span>
            <span>· 7 天无理由退款</span>
          </div>
        </div>

        <div className="pay-foot">
          支付遇到问题?联系客服 <a>mentorx-zhushou</a><br/>
          本订单由 蔓藤教育(MentorX) 提供
        </div>
      </div>

      <Script id="payment-logic" strategy="afterInteractive">{`
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
        let timer = 14 * 60 + 59;
        const el = document.getElementById("qrTimer");
        const countdown = setInterval(() => {
          if (timer <= 0) { clearInterval(countdown); if (el) el.textContent = "二维码已过期,请刷新页面"; return; }
          timer--;
          const m = Math.floor(timer / 60), s = timer % 60;
          if (el) el.textContent = "二维码 " + m + ":" + String(s).padStart(2, "0") + " 后过期";
        }, 1000);
      `}</Script>
    </>
  );
}
