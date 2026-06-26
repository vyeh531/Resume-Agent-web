'use client';
import Script from 'next/script';

export default function HomePage() {
  return (
    <>
      <div className="page home-page">
        <div className="brandbar">
          <div className="brand">
            <img src="/logo/logo%20banner_no_bg.png" alt="EdAIX" className="brand-img" />
          </div>
          <div className="brand-meta" style={{fontSize:'10px',letterSpacing:'.08em'}}>Version: Beta</div>
        </div>

        <section className="hero fade-in">
          <div className="seal"><div className="seal-inner">Offer<br/>Ready</div></div>
          <div className="hero-kicker"><span className="dot"></span> International career search - 30-second diagnosis</div>
          <h1>
            <span className="hero-line">Resume getting ignored?</span>
            <em className="hero-line">EdAIX mentors x AI</em>
            <span className="hero-line">Make it <span className="underline">interview-ready</span>.</span>
          </h1>
          <p className="lede">1,300+ industry mentors and AI-powered analysis. Get a practical resume improvement plan in 30 seconds.</p>
          <div className="hero-proof">
            <div><strong>1,300+</strong><span>Industry mentors</span></div>
            <div><strong>30,000+</strong><span>Real coaching cases</span></div>
            <div><strong>30s</strong><span>Initial diagnosis</span></div>
          </div>
        </section>

        <section className="section upload-section">
          <div className="panel-kicker">START DIAGNOSIS</div>
          <h2 className="section-title">Let EdAIX mentors review your resume</h2>
          <form className="card" onSubmit={(e) => { e.preventDefault(); if (window.submitResume) window.submitResume(e.currentTarget); }} noValidate>
            <div className="input-group resume-source-group">
              <label className="input-label">Resume</label>
              <div className="resume-source-toggle" role="radiogroup" aria-label="resume input mode">
                <label className="resume-source-option">
                  <input type="radio" name="resumeInputMode" value="file" defaultChecked />
                  <span className="resume-source-radio" aria-hidden="true"></span>
                  <span>Upload file</span>
                </label>
                <label className="resume-source-option">
                  <input type="radio" name="resumeInputMode" value="text" />
                  <span className="resume-source-radio" aria-hidden="true"></span>
                  <span>Paste resume text</span>
                </label>
              </div>
              <div className="resume-source-panel" data-resume-source-panel="file">
                <label className="file-upload" id="fileUploadLabel">
                  <input type="file" name="resume" id="resumeFileInput" accept=".pdf,.doc,.docx,.txt,text/plain" />
                  <div className="fu-empty" id="fuEmpty">
                    <div className="fu-icon" aria-hidden="true"></div>
                    <div className="fu-main">Click or drag to upload your resume</div>
                    <div className="fu-sub">PDF - Word (.docx/.doc) - Plain text (.txt)</div>
                  </div>
                  <div className="fu-success" id="fuSuccess" style={{display:'none'}}>
                    <div className="fu-icon-done" aria-hidden="true"></div>
                    <div className="fu-info" style={{flex:1,minWidth:0}}>
                      <div className="fu-filename" id="fuFilename" style={{fontWeight:600,fontSize:13,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}></div>
                      <div className="fu-meta" id="fuMeta" style={{fontSize:12,color:'var(--ink-soft)',marginTop:2}}></div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0,fontSize:12,fontWeight:600,color:'var(--jade)'}}>
                      <span style={{width:6,height:6,borderRadius:'50%',background:'var(--jade)',display:'inline-block'}}></span>
                      Uploaded
                    </div>
                  </div>
                </label>
              </div>
              <span className="input-hint">If the PDF cannot be parsed, paste the resume text directly.</span>
            </div>

            <div className="input-group" hidden>
              <label className="input-label">Resume text <span className="text-mute" style={{fontWeight:400}}>(use this if upload fails)</span></label>
              <textarea className="textarea" name="resumeText" rows="6" placeholder="If PDF or Word parsing fails, paste your resume content here..."></textarea>
            </div>

            <div className="input-group">
              <label className="input-label">Target role <span className="text-mute" style={{fontWeight:400}}>(or paste a JD below)</span></label>
              <select className="input" name="job" id="jobSelect" defaultValue="">
                <option value="" disabled>-- Select target role --</option>
              </select>
              <span className="input-hint" id="jobSelectHint">Loading role list...</span>
            </div>

            <div className="input-group">
              <label className="input-label">Target job description <span className="text-mute" style={{fontWeight:400}}>(or select a role above)</span></label>
              <textarea className="textarea" name="jd" rows="5" placeholder="Paste the full JD for a more precise diagnosis..."></textarea>
              <span className="input-hint">Supports LinkedIn / Indeed / Glassdoor / Handshake and other global job descriptions.</span>
            </div>

            <div className="form-error input-error mb-12"></div>
            <button className="btn btn-jade btn-block" type="submit">
              Generate diagnosis in 30 seconds <span className="btn-icon">-&gt;</span>
            </button>
          </form>
        </section>

        <hr className="divider" />

        <section className="section credibility-section">
          <h2 className="section-title" style={{whiteSpace:'nowrap',fontSize:'clamp(20px,5.6vw,28px)'}}>10 years of real coaching data, built for global careers.</h2>
          <p className="section-desc">EdAIX has supported international career coaching since 2015, with <b style={{color:'var(--ink)',fontWeight:700}}>1,300+</b> industry mentors and <b style={{color:'var(--ink)',fontWeight:700}}>30,000+</b> real coaching cases. Every recommendation is grounded in practical hiring patterns, not generic templates.</p>
          <div className="philo">
            <article className="philo-card">
              <span className="tag">Industry mentors</span>
              <div className="num">01</div>
              <h3>Mentors from top companies</h3>
              <p>Current and former mentors from Google, Amazon, Goldman Sachs, McKinsey, and other global firms across North America, Europe, and Asia.</p>
            </article>
            <article className="philo-card">
              <span className="tag">10-year dataset</span>
              <div className="num">02</div>
              <h3>Driven by real coaching data</h3>
              <p>Each recommendation reflects patterns from 30,000+ coaching cases, so the guidance is practical instead of purely AI-generated.</p>
            </article>
            <article className="philo-card">
              <span className="tag">Custom diagnosis</span>
              <div className="num">03</div>
              <h3>Matched to your background</h3>
              <p>The system matches your industry, target role, and background to relevant mentor experience, including CPT/OPT and H-1B scenarios.</p>
            </article>
          </div>
        </section>

        <div className="footnote">
          Powered by <span>Vibe ID</span> - EdAIX<br/>
          (c) 2026 - Your resume is private and used only for this diagnosis.
        </div>
      </div>

      <Script id="load-positions" strategy="afterInteractive">{`
  (async function loadPositions() {
    const sel  = document.getElementById("jobSelect");
    const hint = document.getElementById("jobSelectHint");
    try {
      const resp = await fetch("/api/positions");
      if (!resp.ok) throw new Error("HTTP " + resp.status);
      const { data } = await resp.json();
      if (!sel || !data) return;
      data.forEach(title => {
        const opt = document.createElement("option");
        opt.value = title;
        opt.textContent = title;
        sel.appendChild(opt);
      });
      if (hint) hint.textContent = "Loaded " + data.length + " roles";
      if (sel) sel.value = "";
    } catch (e) {
      if (hint) hint.textContent = "Could not connect to the server";
      if (sel) {
        const txt = document.createElement("input");
        txt.type = "text"; txt.name = "job"; txt.id = "jobSelect"; txt.className = "input";
        txt.placeholder = "For example: Product Manager / Data Analyst";
        sel.parentNode.replaceChild(txt, sel);
      }
    }
  })();
`}</Script>
    </>
  );
}
