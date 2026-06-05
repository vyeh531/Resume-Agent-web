const fs = require('fs');
const path = require('path');

const reviewPath = path.join(
  process.cwd(),
  'data/audit/segments_action_review_batches/reviewed_resume_specific_remaining_batch_11_2026-06-05T03-35-05-865Z.json'
);

const rows = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));

const updates = new Map([
  [24468, {
    display_action_mode: 'generalized',
    generalized_action: '如果简历里有无法背调或容易被误解的经历标签，先改成真实可核验的项目或作品表述；说明你实际做了什么、交付了什么，不要把练习或个人项目包装成雇佣经历。',
    activation_role_family: '',
    activation_keywords: '',
    grounding_terms: '',
    canonical_action_family: 'experience_evidence',
    action_depth: 'rewrite',
    review_reason: 'batch_11_manual_quality_review: preserve integrity warning without showing prior-student Self-employed detail.'
  }],
  [25027, {
    display_action_mode: 'generalized',
    generalized_action: '如果目标岗位要求 HPLC 或实验技能，先补齐基础原理和常见方法，再把真实课程、实验或训练经历写进 Education 或 Projects，避免只写自学清单。',
    activation_role_family: 'lab_research',
    activation_keywords: 'HPLC, chromatography, lab, QC, research',
    grounding_terms: 'HPLC,IEX,HIC,SEC',
    canonical_action_family: 'education_signal',
    action_depth: 'proof',
    review_reason: 'batch_11_manual_quality_review: skill-gap learning advice kept as generalized, not raw.'
  }],
  [24599, {
    display_action_mode: 'grounded_raw',
    generalized_action: '针对每个目标岗位准备定制版简历：保留与 JD 直接相关的项目，弱化不相关项目，并把真实掌握的关键词写进对应项目证据里。',
    activation_role_family: 'embedded_software',
    activation_keywords: 'embedded, ARM, I2C, SPI, robotics, firmware',
    grounding_terms: 'ARM,I2C,SPI',
    canonical_action_family: 'jd_keyword_alignment',
    action_depth: 'evidence',
    review_reason: 'batch_11_manual_quality_review: project-tailoring action kept raw only for embedded grounding; fallback must stay project/keyword focused.'
  }],
  [25802, {
    display_action_mode: 'generalized',
    generalized_action: '针对目标岗位提取市场调研、竞争分析、用户或客户分析等关键词；只有在简历中有真实项目、课程或工作支撑时，才写进经历 bullet，并补上方法和产出。',
    activation_role_family: 'marketing',
    activation_keywords: 'competitive analysis, market research, customer analysis, marketing',
    grounding_terms: '',
    canonical_action_family: 'jd_keyword_alignment',
    action_depth: 'evidence',
    review_reason: 'batch_11_manual_quality_review: marketing keyword advice has no resume grounding, so use reusable generalized action.'
  }],
  [25327, {
    display_action_mode: 'generalized',
    generalized_action: '如果目标岗位需要后端或数据工程能力，先补齐真实掌握的主技术栈和数据处理关键词；简历里只写能用项目、课程或工作任务解释清楚的技能。',
    activation_role_family: 'software_engineer,data_engineering',
    activation_keywords: 'Java, backend, ETL, data pipeline, AI/ML',
    grounding_terms: 'data,ETL,AI/ML',
    canonical_action_family: 'skills_section',
    action_depth: 'proof',
    review_reason: 'batch_11_manual_quality_review: career skill-stack advice kept as generalized to avoid forcing a prior-student Java path.'
  }],
  [26582, {
    action_specificity: 'generic',
    display_action_mode: 'raw',
    generalized_action: '',
    activation_role_family: '',
    activation_keywords: '',
    grounding_terms: '',
    canonical_action_family: 'format_cleanup',
    action_depth: 'structure',
    review_reason: 'batch_11_manual_quality_review: format alignment advice is broadly safe and should be treated as generic.'
  }],
  [26586, {
    display_action_mode: 'generalized',
    generalized_action: '如果 Research Projects 与目标岗位关系弱，不要让它单独占一个板块；把相关项目并入 Projects、Education 或 Experience，并保留能支撑 JD 的证据。',
    activation_role_family: '',
    activation_keywords: '',
    grounding_terms: 'Research Projects',
    canonical_action_family: 'section_structure',
    action_depth: 'structure',
    review_reason: 'batch_11_manual_quality_review: section-removal advice needs resume grounding and safer generalized wording.'
  }],
  [25908, {
    display_action_mode: 'generalized',
    generalized_action: '如果目标岗位看重金融或数据工具，先核对 JD 中真正高频的技能词；技能栏只补真实掌握的 SQL、Excel/VBA、MATLAB 或分析工具，并让经历里有证据支撑。',
    activation_role_family: 'finance,data_analytics',
    activation_keywords: 'SQL, MATLAB, VBA, Excel, Google Analytics',
    grounding_terms: 'SQL,MATLAB,VBA',
    canonical_action_family: 'skills_section',
    action_depth: 'proof',
    review_reason: 'batch_11_manual_quality_review: skill-gap advice kept as generalized rather than raw tool list.'
  }],
  [25910, {
    display_action_mode: 'grounded_raw',
    generalized_action: '如果目标岗位明显看重技术能力，可以把 Technical Skills 前移，并按 JD 优先级排列真实掌握的工具；不要为了某个方向硬塞不熟的技能。',
    activation_role_family: 'quant_risk',
    activation_keywords: 'quant, risk, SQL, VBA, MATLAB, Python',
    grounding_terms: 'SQL,VBA,MATLAB',
    canonical_action_family: 'skills_section',
    action_depth: 'structure',
    review_reason: 'batch_11_manual_quality_review: quant/risk skills layout advice gated by role and tool grounding.'
  }],
  [25997, {
    display_action_mode: 'generalized',
    generalized_action: '如果某段经历无法背调或不能被真实证明，不要放在 Work Experience 里；改用项目、课程或作品形式呈现你实际完成的任务和产出。',
    activation_role_family: '',
    activation_keywords: '',
    grounding_terms: '',
    canonical_action_family: 'experience_evidence',
    action_depth: 'rewrite',
    review_reason: 'batch_11_manual_quality_review: background-check risk should be a generalized integrity action, not prior-company raw advice.'
  }],
  [26106, {
    display_action_mode: 'generalized',
    generalized_action: '如果目标岗位偏营销分析，先补齐渠道、投放指标和归因模型的基础理解；简历里只写你能解释清楚的 CTR、CPA、CVR 等指标和真实分析场景。',
    activation_role_family: 'marketing,data_analytics',
    activation_keywords: 'marketing analytics, paid media, attribution, CTR, CPA, CVR',
    grounding_terms: 'CTR,CPA,CVR',
    canonical_action_family: 'skills_section',
    action_depth: 'proof',
    review_reason: 'batch_11_manual_quality_review: marketing channel knowledge gap kept as generalized.'
  }],
  [7759, {
    action_specificity: 'case_specific',
    display_action_mode: 'exclude',
    generalized_action: '',
    activation_role_family: '',
    activation_keywords: '',
    grounding_terms: 'GREEN CARD HOLDER,H1B,work authorization',
    canonical_action_family: 'overall_positioning',
    action_depth: 'delivery',
    action_review_status: 'approved',
    review_reason: 'batch_11_manual_quality_review: work authorization / identity-status advice is excluded by governance principle.'
  }],
  [13914, {
    display_action_mode: 'generalized',
    generalized_action: '如果目标岗位要求 Excel，不要只在技能栏写名字；先补练常用函数、透视表和查找类操作，再把真实练习、课程或项目产出写成可验证的证据。',
    activation_role_family: 'data_analytics',
    activation_keywords: 'Excel, VLOOKUP, SUMIF, COUNTIF, Pivot Table',
    grounding_terms: 'VLOOKUP,SUMIF,COUNTIF,INDEX/MATCH',
    canonical_action_family: 'skills_section',
    action_depth: 'proof',
    review_reason: 'batch_11_manual_quality_review: skill-gap practice advice kept as generalized.'
  }],
  [16855, {
    display_action_mode: 'generalized',
    generalized_action: '如果目标岗位需要 Excel 分析能力，先补齐透视表、条件汇总和查找函数；简历里只写真实掌握并能用项目或工作任务证明的技能。',
    activation_role_family: 'data_analytics',
    activation_keywords: 'Excel, Pivot Table, SUMIF, COUNTIF, VLOOKUP',
    grounding_terms: 'SUMIF,COUNTIF,VLOOKUP',
    canonical_action_family: 'skills_section',
    action_depth: 'proof',
    review_reason: 'batch_11_manual_quality_review: Excel learning advice kept as generalized.'
  }],
  [16890, {
    display_action_mode: 'generalized',
    generalized_action: '如果目标岗位需要 SQL，不要只停留在基础查询；补齐窗口函数、排序分组和常见业务分析写法，再用真实项目或练习结果支撑技能栏。',
    activation_role_family: 'data_analytics',
    activation_keywords: 'SQL, window functions, RANK, LAG, LEAD',
    grounding_terms: 'SQL,RANK,LAG/LEAD',
    canonical_action_family: 'skills_section',
    action_depth: 'proof',
    review_reason: 'batch_11_manual_quality_review: SQL learning advice kept as generalized.'
  }],
  [22449, {
    display_action_mode: 'generalized',
    generalized_action: '如果目标岗位需要机器学习基础，可以用选课或课程项目补信号；优先选择与 JD 最相关的算法方向，并把真实项目产出写进 Projects 或 Education。',
    activation_role_family: 'machine_learning',
    activation_keywords: 'machine learning, KNN, regression, CNN, RNN',
    grounding_terms: 'KNN,SGD,CNN,RNN',
    canonical_action_family: 'education_signal',
    action_depth: 'proof',
    review_reason: 'batch_11_manual_quality_review: course-selection advice kept as generalized education signal.'
  }],
  [26583, {
    display_action_mode: 'grounded_raw',
    generalized_action: '作品集或项目列表不要一次性堆满；优先展示最贴近目标岗位的代表作，把其他项目收进次级分类，让招聘方先看到你的核心能力。',
    activation_role_family: 'product_design,uiux',
    activation_keywords: 'UIUX, product design, portfolio',
    grounding_terms: 'UIUX',
    canonical_action_family: 'experience_evidence',
    action_depth: 'delivery',
    review_reason: 'batch_11_manual_quality_review: portfolio selection action kept raw only for design grounding; fallback stays portfolio-specific.'
  }]
]);

let patched = 0;
for (const row of rows) {
  const update = updates.get(row.id);
  if (!update) continue;
  row.proposed = { ...row.proposed, ...update };
  row.review_decision = {
    reviewer: 'chat_context',
    decision: row.proposed.display_action_mode === 'exclude' ? 'rejected_exclude' : `approved_${row.proposed.display_action_mode}`,
    notes: 'Manual quality review for final resume-specific batch; exclude only for identity/work-authorization risk and keep skill/project gaps as generalized advice.'
  };
  patched += 1;
}

fs.writeFileSync(reviewPath, `${JSON.stringify(rows, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ reviewPath, patched }, null, 2));
