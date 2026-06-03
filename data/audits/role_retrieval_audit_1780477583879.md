# Role Retrieval Audit

Generated: 2026-06-03T09:06:23.881Z

## Summary
- finance (finance_accounting, positions=45): top=3, flags=0, buried=1
- software_engineer (tech, positions=42): top=3, flags=0, buried=1
- hardware_electrical (engineering_hardware, positions=35): top=3, flags=1, buried=1
- healthcare (healthcare_life_sciences, positions=16): top=3, flags=0, buried=1
- machine_learning (data, positions=16): top=3, flags=1, buried=1
- ux_research_design (design_creative, positions=13): top=3, flags=1, buried=1
- accounting (finance_accounting, positions=6): top=3, flags=0, buried=1
- education (education_research, positions=2): top=3, flags=0, buried=1

## finance
Target: Financial Analyst
Keywords: financial modeling, Excel, forecasting, budgeting, variance analysis, valuation, KPI

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=4149 score=20 role=finance,hr_recruiting target=financial_analyst,human_resources_specialist tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,weak_experience_keyword_evidence,weak_result_orientation
  - title: 求职者简历缺乏足够的行业关键词
  - action: 根据目标岗位（FA或HR方向）在技能区及工作经历中主动补充相关专业关键词。FA方向补充：Financial Analysis、Portfolio Management、DCF、Financial Modeling等；HR方向补充对应HR专业术语，确保关键词覆盖目标JD中的核心词汇。

## software_engineer
Target: Software Development Engineer
Keywords: software development, data structures, algorithms, Java, Python, API, debugging, code review, microservices

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=328 score=29 role=software_engineer,ai_engineer,data_analyst target=backend_engineer tags=low_hard_skill_match,missing_microservices,keywords_only_in_skills
  - title: 学员技能区内容混乱且写得太少
  - action: 将技能区按6个维度分层呈现：1.Programming Languages；2.Backend Framework（如Spring Boot）；3.Database（如MySQL、PostgreSQL）；4.Cloud/DevOps（如AWS、Docker）；5.Architecture Components（如Microservices、RESTful API、Event-driven design）；6.AI/ML（如RAG、LLM工具）；删除"familiar with"等程度描述，直接列出会用的技术名称。

## hardware_electrical
Target: Hardware Engineer
Keywords: Verilog, RTL, FPGA, PCB, circuit, simulation, VLSI, EDA, lab

### Flagged Current Top Rows
- #2 seg_4874 [severe; not_role_safe] role=universal target=universal
  - title: 求职者简历Summary未突出差异化亮点，HR无法快速形成印象并产生继续阅读项目经历的动力。
  - action: 在Summary中明确列出3个核心能力关键词（如label design、gameplay mechanics、player psychology/flow），让HR在阅读Summary后能主动去项目经历中寻找对应佐证，形成阅读引导链路。

### Buried Candidate Rows
- id=6311 score=20 role=hardware_electrical target=hardware_engineer,electrical_engineer tags=low_hard_skill_match,outdated_resume
  - title: 求职者简历中的项目技术描述已过时（仍写旧工具）
  - action: 用 ChatGPT 辅助将项目 bullet point 改写，突出当前实际使用的技术（如 Python），并加入「designing and debugging feedback circuits」等体现动手能力的描述，传递候选人能独立解决硬件/电路问题的形象。

## healthcare
Target: Clinical Research Associate
Keywords: clinical, healthcare, patient, trial, regulatory, data collection, medical

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=2989 score=18 role=healthcare,data_scientist target=healthcare_analytics,biotech_data_scientist,clinical_data tags=generic_resume_positioning
  - title: 求职者有两段Healthcare实习经历
  - action: 根据目标岗位准备多版简历：申healthcare/CRO方向时重点突出两段healthcare实习及clinical data相关项目；申tech biotech方向时加入machine learning相关项目（用Python/R实现）；申药厂方向时补充CD相关项目。同时删除2018年过期的research assistant经历。

## machine_learning
Target: Machine Learning Engineer Intern (MLE)
Keywords: machine learning, image generation, Stable Diffusion, SDXL, Flux, ComfyUI, Python, PyTorch, TensorFlow, model evaluation, debugging, pipeline

### Flagged Current Top Rows
- #2 seg_8981 [severe; not_role_safe] role=machine_learning,data_analyst target=universal
  - title: 求职者简历中有AB testing项目和machine learning风控项目，但未充分利用两个项目的关键词覆盖广度，只保留一个会损失关键词多样性。
  - action: 将两个项目都保留在简历中，每个项目各精简为两条bullet point，确保涵盖AB testing（数据分析实战）和machine learning/risk（偏技术建模）两类关键词，以应对DA和银行风控两种职位方向。

### Buried Candidate Rows
- id=9453 score=29 role=software_engineer,machine_learning,data_analyst target=machine_learning_engineer tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者简历未体现machine learning、...
  - action: 在简历技能列表或项目描述中补充machine learning、big data、deep learning相关工具和软件包的使用经验，即使是调用API层面的应用也应明确写出，以匹配岗位关键词筛选。

## ux_research_design
Target: UX Designer
Keywords: Figma, user research, wireframe, prototype, usability testing, design system, user journey

### Flagged Current Top Rows
- #3 seg_22876 [info; no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。

### Buried Candidate Rows
- id=4693 score=17 role=ux_research_design,design_creative,product_manager target=ux_designer,product_designer,product_manager tags=weak_experience_keyword_evidence,missing_linkedin
  - title: 求职者目前只有不相关工作经验
  - action: 将学校设计项目（如design project、more code等）添加至简历，不需要单独分设Projects section，直接合并入Experience section，确保ATS能扫描到相关关键词，通过初筛。

## accounting
Target: Accountant
Keywords: GAAP, reconciliation, accounts payable, accounts receivable, audit, month-end close, QuickBooks

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=12900 score=29 role=accounting target=accountant,auditor,tax_consultant tags=weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者在会计实习中做了bookkeeping、re...
  - action: 逐一追问工作细节（使用哪些工具、操作流程、服务了几家公司），将散乱描述整理为可写入简历的具体职责，如：进入QuickBooks进行month-end close、协助revenue分类、执行monthly reconciliation。

## education
Target: Instructional Designer
Keywords: curriculum, instructional design, learning, training, assessment, student, LMS

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=140 score=10 role=software_engineer,machine_learning,marketing target=data_analyst tags=low_hard_skill_match,keywords_only_in_skills,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: Data science student had...
  - action: 将欺诈检测ML经历框架为三层架构：(1)数据层——"使用SQL查询从MySQL数据库检索交易记录"；(2)建模层——"应用分类模型（指定：逻辑回归、随机森林、XGBoost）预测欺诈概率"；(3)验证层——"使用统计显著性测试验证模型结果，评估性能改进是否具有统计意义"。说明具体的模型类型和统计测试（如适用）。