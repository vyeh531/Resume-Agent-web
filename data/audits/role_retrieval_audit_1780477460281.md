# Role Retrieval Audit

Generated: 2026-06-03T09:04:20.285Z

## Summary
- finance (finance_accounting, positions=45): top=4, flags=0, buried=1
- software_engineer (tech, positions=42): top=4, flags=0, buried=1
- data_analyst (data, positions=37): top=4, flags=0, buried=1
- hardware_electrical (engineering_hardware, positions=35): top=4, flags=1, buried=1
- supply_chain_logistics (business_ops, positions=32): top=4, flags=0, buried=1
- design_creative (design_creative, positions=27): top=4, flags=0, buried=1
- marketing (marketing_sales, positions=26): top=4, flags=1, buried=1
- business_analysis (business_ops, positions=22): top=4, flags=4, buried=1
- data_engineer (data, positions=18): top=4, flags=4, buried=1
- manufacturing_process (engineering_hardware, positions=18): top=4, flags=2, buried=1
- mechanical_engineering (engineering_hardware, positions=18): top=4, flags=0, buried=1
- cloud_infrastructure (tech, positions=16): top=4, flags=3, buried=1
- healthcare (healthcare_life_sciences, positions=16): top=4, flags=1, buried=1
- machine_learning (data, positions=16): top=4, flags=2, buried=1
- ai_engineer (data, positions=15): top=4, flags=1, buried=1
- project_program_management (business_ops, positions=13): top=4, flags=1, buried=1
- ux_research_design (design_creative, positions=13): top=4, flags=2, buried=1
- cybersecurity (tech, positions=12): top=4, flags=0, buried=1
- industrial_quality (engineering_hardware, positions=12): top=4, flags=2, buried=1
- consulting (business_ops, positions=11): top=4, flags=1, buried=1
- life_sciences (healthcare_life_sciences, positions=9): top=4, flags=0, buried=1
- data_scientist (data, positions=8): top=4, flags=1, buried=1
- legal_compliance (legal_policy, positions=8): top=4, flags=0, buried=1
- policy_public_sector (legal_policy, positions=8): top=4, flags=2, buried=1
- product_manager (product, positions=8): top=4, flags=3, buried=1
- sales_customer_success (marketing_sales, positions=8): top=4, flags=2, buried=1
- sustainability_environment (legal_policy, positions=8): top=4, flags=4, buried=1
- trading_quant (finance_accounting, positions=8): top=4, flags=3, buried=1
- operations (business_ops, positions=7): top=4, flags=3, buried=1
- accounting (finance_accounting, positions=6): top=4, flags=0, buried=1
- communications_pr (marketing_sales, positions=6): top=4, flags=2, buried=1
- it_support (tech, positions=6): top=4, flags=3, buried=1
- research_academic (education_research, positions=6): top=4, flags=3, buried=1
- business_operations (business_ops, positions=3): top=4, flags=2, buried=1
- hospitality_events (business_ops, positions=3): top=4, flags=3, buried=1
- hr_recruiting (business_ops, positions=3): top=4, flags=2, buried=1
- journalism_media (media, positions=3): top=4, flags=2, buried=1
- actuarial (finance_accounting, positions=2): top=4, flags=0, buried=1
- education (education_research, positions=2): top=4, flags=0, buried=1
- other (other, positions=2): top=4, flags=0, buried=1
- social_services (healthcare_life_sciences, positions=2): top=4, flags=0, buried=1
- civil_construction (engineering_hardware, positions=1): top=4, flags=2, buried=1
- procurement (business_ops, positions=1): top=4, flags=3, buried=1

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

## data_analyst
Target: Data Analyst
Keywords: SQL, Excel, Tableau, Power BI, dashboard, KPI, data cleaning, business insights

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=1005 score=29 role=data_analyst target=data_analyst tags=keywords_only_in_skills
  - title: 求职者用于投DA岗位的简历缺乏DA必备关键词（SQ...
  - action: 在DA简历的实习经历中明确体现SQL、Python、Excel、Tableau或Power BI、跨部门协作（works with other functions）这五类关键词，优先出现在工作经历bullet point中。

## hardware_electrical
Target: Hardware Engineer
Keywords: Verilog, RTL, FPGA, PCB, circuit, simulation, VLSI, EDA, lab

### Flagged Current Top Rows
- #2 seg_4874 [not_role_safe] role=universal target=universal
  - title: 求职者简历Summary未突出差异化亮点，HR无法快速形成印象并产生继续阅读项目经历的动力。
  - action: 在Summary中明确列出3个核心能力关键词（如label design、gameplay mechanics、player psychology/flow），让HR在阅读Summary后能主动去项目经历中寻找对应佐证，形成阅读引导链路。

### Buried Candidate Rows
- id=6311 score=20 role=hardware_electrical target=hardware_engineer,electrical_engineer tags=low_hard_skill_match,outdated_resume
  - title: 求职者简历中的项目技术描述已过时（仍写旧工具）
  - action: 用 ChatGPT 辅助将项目 bullet point 改写，突出当前实际使用的技术（如 Python），并加入「designing and debugging feedback circuits」等体现动手能力的描述，传递候选人能独立解决硬件/电路问题的形象。

## supply_chain_logistics
Target: Supply Chain Analyst
Keywords: supply chain, inventory, logistics, demand planning, forecasting, ERP, vendor

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=10782 score=26 role=procurement,supply_chain_logistics target=procurement_specialist,purchasing_agent,supply_chain_analyst tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者简历中采购相关经历描述过于笼统宽泛
  - action: 将采购经历拆分为独立bullet point，结构为：Manage procurement process for operations, including collecting purchase requirements, comparing multiple suppliers, selecting optimal vendors, and making purchase orders to enhance supply chain efficiency；同时补充历史数据参考（如去年支出40万、业务增长15%

## design_creative
Target: Graphic Designer
Keywords: portfolio, Adobe, Figma, visual design, brand identity, layout, typography, PDF

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=8705 score=26 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=low_hard_skill_match,missing_portfolio
  - title: 求职者已掌握Adobe系列工具（AI、PS、Ill...
  - action: 立即学习Figma，利用已有的Adobe基础快速上手，将Figma纳入作品集制作工具链，并在简历技能栏中添加Figma，以满足UI/UX实习岗位的基本要求。

## marketing
Target: Marketing Analyst
Keywords: campaign, SEO, SEM, Google Analytics, CRM, conversion, content strategy, brand

### Flagged Current Top Rows
- #2 seg_26130 [not_role_safe] role=product_manager,marketing target=universal
  - title: 求职者第三段经历为家族企业虚构经历，内容空泛，缺乏可信度与技能展示；原版偏重电商平台操作，未能体现可迁移的营销能力
  - action: 将家族企业（惠普电脑代理零售）经历重新包装为general marketing方向，聚焦三类可信技能：①Social media内容创作（小红书/公众号产品推广帖）；②电商产品详情页copywriting（京东/淘宝listing优化）；③产品图片拍摄与修图，三条bullet point分别对应一个技能，使经历看起来真实且与营销岗位匹配

### Buried Candidate Rows
- id=2867 score=21 role=ai_engineer,data_analyst,marketing target=universal tags=low_hard_skill_match,keywords_only_in_skills,weak_experience_keyword_evidence,weak_result_orientation
  - title: 求职者非营销专业出身
  - action: 系统学习北美数字营销核心知识，重点补充Email Marketing、SEO/SEM、Google Analytics等工具的实操知识；可通过Google Digital Garage、HubSpot Academy等免费平台获取认证课程。

## business_analysis
Target: Business Analyst
Keywords: requirements gathering, process improvement, SQL, Excel, stakeholder, JIRA, business case

### Flagged Current Top Rows
- #1 seg_14423 [not_role_safe] role=business_analysis,data_analyst target=business_analyst,data_analyst
  - title: 求职者简历尚未针对BA岗位JD进行关键词匹配，导师通过展示真实JD示例，指出简历应主动提炼并体现JD中的高频词汇和核心要求。
  - action: 仔细阅读目标BA职位的job description，提取高频出现的技能词、工具名称和职责描述，将这些关键词有机融入简历的工作经历和技能列表中，确保与JD高度匹配。
- #2 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #3 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。
- #4 seg_355 [no_role_signal] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能

### Buried Candidate Rows
- id=1984 score=26 role=business_analysis,data_analyst target=business_analyst,data_analyst tags=weak_soft_skill_evidence,weak_experience_keyword_evidence,weak_target_role_alignment
  - title: 求职者可能以为BA和DA技能要求相似
  - action: 申请BA岗位时，在简历和面试中重点突出：用plain language解释技术细节的能力、documentation经验、跨部门协作经历，同时展示SQL和Excel的实际应用案例。

## data_engineer
Target: Data Engineer
Keywords: ETL, data pipeline, Spark, Airflow, SQL, Python, data warehouse, AWS, Snowflake

### Flagged Current Top Rows
- #1 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #2 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。
- #3 seg_355 [no_role_signal] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能
- #4 seg_340 [no_role_signal] role=universal target=universal
  - title: 学生简历只写了SolidWorks和3D打印等少量硬技能，大量版面空白，内容单薄
  - action: 将所有相关技能（project management、软件工具、软技能等）都写入简历；若内容不足以填满一页，可添加professional summary作为补充

### Buried Candidate Rows
- id=328 score=13 role=software_engineer,ai_engineer,data_analyst target=backend_engineer tags=low_hard_skill_match,missing_microservices,keywords_only_in_skills
  - title: 学员技能区内容混乱且写得太少
  - action: 将技能区按6个维度分层呈现：1.Programming Languages；2.Backend Framework（如Spring Boot）；3.Database（如MySQL、PostgreSQL）；4.Cloud/DevOps（如AWS、Docker）；5.Architecture Components（如Microservices、RESTful API、Event-driven design）；6.AI/ML（如RAG、LLM工具）；删除"familiar with"等程度描述，直接列出会用的技术名称。

## manufacturing_process
Target: Manufacturing Engineer
Keywords: manufacturing, process improvement, quality, lean, six sigma, yield, root cause

### Flagged Current Top Rows
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #4 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

### Buried Candidate Rows
- id=2543 score=10 role=data_analyst target=universal tags=missing_linkedin
  - title: 求职者供应链方向简历缺乏行业认可证书
  - action: 优先通过网课考取Lean Six Sigma Green Belt作为入门证书，跳过Yellow/White Belt直接从Green Belt开始；后续根据职业发展目标逐步提升至Black Belt乃至Master Black Belt；同时查阅目标岗位JD确认所需等级。

## mechanical_engineering
Target: Mechanical Engineer
Keywords: CAD, SolidWorks, mechanical design, FEA, manufacturing, robotics, control system

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=7198 score=20 role=mechanical_engineering target=mechanical_engineer,robotics_engineer tags=weak_target_role_alignment,low_role_specificity,missing_exact_job_title
  - title: 求职者目标暑期实习
  - action: 利用1-2月投递窗口前的剩余时间，继续推进 haptic device 项目进度，同时完善简历中该项目的描述内容，确保在正式投递前简历达到最佳状态。

## cloud_infrastructure
Target: Cloud Engineer
Keywords: AWS, Azure, GCP, Kubernetes, Docker, CI/CD, Terraform, Linux, networking

### Flagged Current Top Rows
- #1 seg_26527 [not_role_safe] role=software_engineer,cloud_infrastructure target=backend_engineer,frontend_engineer,software_engineer,cloud_engineer
  - title: 求职者不清楚HR实际阅读简历的顺序和时间，可能导致最关键信息未放在显眼位置
  - action: 将Skills区放在简历显眼位置，并按类别清晰分组（如Languages、Frameworks、Tools等），确保HR在5-10秒内能快速判断候选人技术栈是否匹配岗位需求
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #4 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

### Buried Candidate Rows
- id=18029 score=22 role=software_engineer,machine_learning target=machine_learning_engineer tags=missing_microservices,keywords_only_in_skills
  - title: 求职者技能列表尚未完整罗列已用过的工具
  - action: 在技能列表一行写满常用工具：Git、Linux、Docker、Unity 等基础项，再补充 AWS、GCP 等云平台；已使用过的 Kubernetes、TensorFlow、Prolog 等工具按实际情况酌情添加，TensorFlow 可归入 Tools 类别一并列出。

## healthcare
Target: Clinical Research Associate
Keywords: clinical, healthcare, patient, trial, regulatory, data collection, medical

### Flagged Current Top Rows
- #4 seg_5787 [not_role_safe] role=universal target=universal
  - title: 求职者简历顶部Summary着重强调healthcare方向，若申请广泛ESG岗位，会让HR误判这是为医疗或建筑行业专门准备的简历，降低匹配感。
  - action: 将Summary中过于垂直的healthcare专攻描述删减，改写为更通用的ESG/sustainability方向表述，以适配更广泛的目标岗位；同时将education和skills板块移至简历下方。

### Buried Candidate Rows
- id=2989 score=18 role=healthcare,data_scientist target=healthcare_analytics,biotech_data_scientist,clinical_data tags=generic_resume_positioning
  - title: 求职者有两段Healthcare实习经历
  - action: 根据目标岗位准备多版简历：申healthcare/CRO方向时重点突出两段healthcare实习及clinical data相关项目；申tech biotech方向时加入machine learning相关项目（用Python/R实现）；申药厂方向时补充CD相关项目。同时删除2018年过期的research assistant经历。

## machine_learning
Target: Machine Learning Engineer Intern (MLE)
Keywords: machine learning, image generation, Stable Diffusion, SDXL, Flux, ComfyUI, Python, PyTorch, TensorFlow, model evaluation, debugging, pipeline

### Flagged Current Top Rows
- #2 seg_8981 [not_role_safe] role=machine_learning,data_analyst target=universal
  - title: 求职者简历中有AB testing项目和machine learning风控项目，但未充分利用两个项目的关键词覆盖广度，只保留一个会损失关键词多样性。
  - action: 将两个项目都保留在简历中，每个项目各精简为两条bullet point，确保涵盖AB testing（数据分析实战）和machine learning/risk（偏技术建模）两类关键词，以应对DA和银行风控两种职位方向。
- #4 seg_22618 [not_role_safe] role=machine_learning,data_analyst target=machine_learning_engineer,business_analyst,data_analyst
  - title: 求职者需要同时投递DS/ML方向和DA/BA方向岗位，单一版本简历无法有效匹配两类不同职位的要求，需制定多版本策略。
  - action: 准备两个版本的简历：一个偏DS/Machine Learning Engineer方向，一个偏DA/BA方向；在DA/BA基础版本之上，针对具体投递岗位的JD进行进一步微调，突出与岗位最相关的经验。

### Buried Candidate Rows
- id=9453 score=29 role=software_engineer,machine_learning,data_analyst target=machine_learning_engineer tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者简历未体现machine learning、...
  - action: 在简历技能列表或项目描述中补充machine learning、big data、deep learning相关工具和软件包的使用经验，即使是调用API层面的应用也应明确写出，以匹配岗位关键词筛选。

## ai_engineer
Target: AI Engineer
Keywords: LLM, RAG, agent, fine-tuning, prompt engineering, vector database, Python, LangChain, model deployment

### Flagged Current Top Rows
- #1 seg_8569 [not_role_safe] role=software_engineer,ai_engineer target=universal
  - title: 求职者简历在Education之前缺少Objective段落，HR无法快速了解求职方向与核心优势
  - action: 在Education之前新增Objective段落，格式参考Education section，内容约1-2句话（3行以内）：先说明目标行业与岗位方向（如automotive/autonomous driving或smart home），再总结自身核心优势（如嵌入式经验丰富、兼具芯片设计能力、软硬件协同debug/开发能力），并根据每个GID（目标岗位）灵活调整关键词。

### Buried Candidate Rows
- id=4527 score=32 role=ai_engineer,machine_learning target=ai_engineer,machine_learning_engineer tags=low_hard_skill_match,missing_priority_keywords,keywords_only_in_skills
  - title: 求职者简历中未突出 LLM 相关技能
  - action: 在技能列表和项目 bullet point 中显著体现 LLM 核心技术栈：fine tuning、inference、prompt engineering、LangChain、RAG、Multi-agent、PyTorch、HuggingFace，并结合 cloud development 经验，确保面试官一眼识别 AI/大模型方向。

## project_program_management
Target: Project Manager
Keywords: timeline, budget, risk management, stakeholder, Agile, Scrum, delivery, cross-functional

### Flagged Current Top Rows
- #4 seg_5787 [not_role_safe] role=universal target=universal
  - title: 求职者简历顶部Summary着重强调healthcare方向，若申请广泛ESG岗位，会让HR误判这是为医疗或建筑行业专门准备的简历，降低匹配感。
  - action: 将Summary中过于垂直的healthcare专攻描述删减，改写为更通用的ESG/sustainability方向表述，以适配更广泛的目标岗位；同时将education和skills板块移至简历下方。

### Buried Candidate Rows
- id=14868 score=17 role=supply_chain_logistics,project_program_management,procurement target=supply_chain_analyst,procurement_specialist,project_manager tags=education_details_missing
  - title: 求职者希望转行至PM或supply chain岗位
  - action: 在简历中尽量凸显与PM或supply chain相关的经验，哪怕是间接经验也需包装体现；同时通过考取相关证书（如PMP、Lean Six Sigma）填补经验空白，确保至少能通过HR初筛关卡。

## ux_research_design
Target: UX Designer
Keywords: Figma, user research, wireframe, prototype, usability testing, design system, user journey

### Flagged Current Top Rows
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #4 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

### Buried Candidate Rows
- id=4693 score=17 role=ux_research_design,design_creative,product_manager target=ux_designer,product_designer,product_manager tags=weak_experience_keyword_evidence,missing_linkedin
  - title: 求职者目前只有不相关工作经验
  - action: 将学校设计项目（如design project、more code等）添加至简历，不需要单独分设Projects section，直接合并入Experience section，确保ATS能扫描到相关关键词，通过初筛。

## cybersecurity
Target: Cybersecurity Analyst
Keywords: security, incident response, SIEM, vulnerability, threat, risk, network security

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=22431 score=20 role=software_engineer,cloud_infrastructure,cybersecurity target=backend_engineer,cloud_engineer,software_engineer,security_engineer tags=low_hard_skill_match,missing_priority_keywords
  - title: 现在招聘流程中HR和hiring manager越...
  - action: 在项目bullet point中主动植入云服务关键词（如AWS S3、CloudFront CDN）、数据库关键词（PostgreSQL）、安全相关关键词（rate limiting、authentication），确保AI摘要时能保留技术亮点，提升简历通过机筛的概率。

## industrial_quality
Target: Quality Engineer
Keywords: quality, QA, root cause, CAPA, process improvement, six sigma, inspection

### Flagged Current Top Rows
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #4 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

### Buried Candidate Rows
- id=30 score=7 role=software_engineer,data_analyst target=universal tags=missing_portfolio,missing_github_link
  - title: Candidate worries about c...
  - action: 无论代码质量如何，简历上始终附上GitHub链接；有链接表明你是会实际写代码的从业者

## consulting
Target: Management Consultant
Keywords: client, problem structuring, market research, Excel modeling, presentation, recommendation, stakeholder

### Flagged Current Top Rows
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。

### Buried Candidate Rows
- id=4798 score=13 role=data_analyst,product_manager,marketing target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者简历偏重技术层面（写码、数据分析）
  - action: 在简历bullet point中补充与client或跨部门合作的具体经历，如weekly sync-up、presentation、市场报告汇报等，以证明候选人具备communication能力，而不仅仅是技术能力。

## life_sciences
Target: Bioinformatics Scientist
Keywords: bioinformatics, omics, Python, R, wet lab, assay, research, biotech

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=2989 score=16 role=healthcare,data_scientist target=healthcare_analytics,biotech_data_scientist,clinical_data tags=generic_resume_positioning
  - title: 求职者有两段Healthcare实习经历
  - action: 根据目标岗位准备多版简历：申healthcare/CRO方向时重点突出两段healthcare实习及clinical data相关项目；申tech biotech方向时加入machine learning相关项目（用Python/R实现）；申药厂方向时补充CD相关项目。同时删除2018年过期的research assistant经历。

## data_scientist
Target: Data Scientist
Keywords: Python, R, SQL, statistical modeling, A/B testing, machine learning, experimentation, visualization

### Flagged Current Top Rows
- #3 seg_355 [not_role_safe] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能

### Buried Candidate Rows
- id=2989 score=21 role=healthcare,data_scientist target=healthcare_analytics,biotech_data_scientist,clinical_data tags=generic_resume_positioning
  - title: 求职者有两段Healthcare实习经历
  - action: 根据目标岗位准备多版简历：申healthcare/CRO方向时重点突出两段healthcare实习及clinical data相关项目；申tech biotech方向时加入machine learning相关项目（用Python/R实现）；申药厂方向时补充CD相关项目。同时删除2018年过期的research assistant经历。

## legal_compliance
Target: Compliance Analyst
Keywords: compliance, regulatory, legal research, contract, risk, policy, documentation

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=3478 score=13 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=missing_portfolio
  - title: 求职者同时申请Credit Risk、Fraud/...
  - action: 为三个方向分别准备简历版本：Credit Risk版强调portfolio monitoring、delinquency、default、PD/LGD/EAD、roll rate、vintage等；Fraud/AML版强调fraud detection、transaction monitoring、AML、KYC、suspicious activity、pattern anomaly monitoring；Risk Consulting版强调internal control、process improvement、

## policy_public_sector
Target: Policy Analyst
Keywords: policy, public sector, research, stakeholder, legislation, impact analysis, brief

### Flagged Current Top Rows
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #4 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

### Buried Candidate Rows
- id=7371 score=13 role=product_manager,data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者的项目经历描述缺乏具体行动和结构
  - action: 将项目bullet point拆分为三层：1）访谈关键利益相关者（如'Interviewed 3 key stakeholders to better understand the problem statement'）；2）研究覆盖范围（如'Researched EV charging policies across 4 states, identifying gaps between current and ideal policies'）；3）产出成果（如'Created an X-page report w

## product_manager
Target: Product Manager
Keywords: roadmap, PRD, user research, A/B testing, stakeholder, metrics, launch, cross-functional

### Flagged Current Top Rows
- #1 seg_2571 [not_role_safe] role=data_analyst,product_manager target=data_analyst
  - title: 求职者简历中软技能描述不够具体，缺乏数据分析岗位常见的关键词，如复杂数据集分析能力、细心程度、洞察传达给利益相关方等表述。
  - action: 在简历技能或个人总结部分补充以下关键词和表述：'Strong ability to analyze complex and ambiguous data sets'、'Attention to detail'、'Organizational skills'、'Communicate insights to stakeholders'，以匹配数据分析岗位JD要求。
- #2 seg_24900 [not_role_safe] role=software_engineer,product_manager target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者项目描述的第一句话未能清晰说明产品类型和所属领域（domain），HR在极短时间内无法判断项目与目标岗位的匹配度，导致错失筛选机会。
  - action: 将项目描述第一句改写为明确说明「这是什么产品/系统 + 所属领域」，例如Fintech支付系统、内部运营工具等，让HR在3秒内判断domain匹配度。
- #3 seg_18160 [not_role_safe] role=product_manager,data_analyst target=business_analyst,data_analyst
  - title: 求职者尚未针对目标岗位（BA/DA）做关键词匹配优化，通用简历无法有效通过 ATS 筛选，需系统性提取高频关键词。
  - action: 第一步先完成通用版简历框架；第二步在 Google 上搜集至少 10 份目标岗位（如 BA）的 job description，提取高频关键词，按频次优先级融入简历对应 bullet point。

### Buried Candidate Rows
- id=8654 score=26 role=product_manager,data_analyst target=product_manager,data_analyst tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者项目经历中未体现产品规划能力
  - action: 在项目描述中补充：build产品roadmap（如Q1/Q2里程碑规划），以及与设计团队合作使用Figma进行UI/UX设计，体现cross-functional协作能力和产品全周期管理经验。

## sales_customer_success
Target: Account Executive
Keywords: quota, pipeline, CRM, Salesforce, account management, cold outreach, negotiation, revenue

### Flagged Current Top Rows
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #4 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

### Buried Candidate Rows
- id=6197 score=13 role=data_analyst,marketing target=data_analyst tags=low_hard_skill_match
  - title: 求职者对Salesforce（CRM工具）不熟悉
  - action: 在YouTube搜索"Salesforce for sales demo"视频，注册Salesforce免费账号进行实操体验，理解CRM在销售pipeline管理、客户跟进阶段记录等核心用途，并将Salesforce等知名analytics工具写入简历。

## sustainability_environment
Target: Sustainability Analyst
Keywords: ESG, sustainability, climate, carbon, policy, reporting, impact analysis

### Flagged Current Top Rows
- #1 seg_5787 [not_role_safe] role=universal target=universal
  - title: 求职者简历顶部Summary着重强调healthcare方向，若申请广泛ESG岗位，会让HR误判这是为医疗或建筑行业专门准备的简历，降低匹配感。
  - action: 将Summary中过于垂直的healthcare专攻描述删减，改写为更通用的ESG/sustainability方向表述，以适配更广泛的目标岗位；同时将education和skills板块移至简历下方。
- #2 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #3 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。
- #4 seg_355 [no_role_signal] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能

### Buried Candidate Rows
- id=5792 score=10 role=universal target=universal tags=weak_target_role_alignment,low_role_specificity,missing_exact_job_title,low_hard_skill_match
  - title: 求职者背景偏向Healthcare与ESG交叉领域
  - action: 将投递范围扩展至所有ESG相关数据岗位（包括Energy Modeling Analyst、Sustainability Analyst等），不必只聚焦Healthcare专项；同时梳理LL97框架下碳排放计算与超标判断逻辑，作为差异化卖点在简历和面试中体现。

## trading_quant
Target: Quantitative Analyst
Keywords: Python, statistical modeling, portfolio, risk, backtesting, financial markets, time series

### Flagged Current Top Rows
- #2 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #3 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。
- #4 seg_355 [no_role_signal] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能

### Buried Candidate Rows
- id=270 score=13 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=generic_resume_positioning,low_role_specificity,missing_portfolio
  - title: 候选人用一份简历投递各类风险管理岗位
  - action: 根据目标岗位调整简历重点：Fraud/AML/Credit Risk等合规类要强调RCSA/control framework；Data Risk/Portfolio Risk等技术类要强调Python和modeling

## operations
Target: Operations Analyst
Keywords: process optimization, KPI, workflow, cross-functional, efficiency, cost reduction, operations

### Flagged Current Top Rows
- #2 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #3 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。
- #4 seg_355 [no_role_signal] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能

### Buried Candidate Rows
- id=3479 score=15 role=finance,operations target=risk_consulting,risk_analyst,operations tags=low_soft_skill_match,keywords_only_in_skills,generic_resume_positioning
  - title: 求职者简历中Python及quantitative...
  - action: 针对Risk Consulting方向，将简历中Python、statistical modeling等技术描述弱化或移至技能列表次要位置，工作经历bullet point改为突出internal control、RCSA、control framework、process improvement、governance、regulatory compliance等关键词，体现咨询思维与风险治理能力。

## accounting
Target: Accountant
Keywords: GAAP, reconciliation, accounts payable, accounts receivable, audit, month-end close, QuickBooks

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=12900 score=29 role=accounting target=accountant,auditor,tax_consultant tags=weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者在会计实习中做了bookkeeping、re...
  - action: 逐一追问工作细节（使用哪些工具、操作流程、服务了几家公司），将散乱描述整理为可写入简历的具体职责，如：进入QuickBooks进行month-end close、协助revenue分类、执行monthly reconciliation。

## communications_pr
Target: Public Relations Specialist
Keywords: public relations, communications, press release, media relations, content, stakeholder, writing

### Flagged Current Top Rows
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #4 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

### Buried Candidate Rows
- id=2017 score=10 role=product_manager,marketing target=universal tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者有实际做过网站内容撰写的经历
  - action: 将关键词研究流程写入简历：先自行brainstorming产品特点得出seed keywords列表，再用SEO工具验证各关键词的搜索volume，最终根据数据选定高价值关键词指导产品描述撰写，并在results中量化网页流量提升幅度（如30%-40%）。

## it_support
Target: IT Support Specialist
Keywords: ticketing, troubleshooting, help desk, Windows, Linux, network, hardware, customer support

### Flagged Current Top Rows
- #2 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #3 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。
- #4 seg_355 [no_role_signal] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能

### Buried Candidate Rows
- id=8442 score=10 role=universal target=universal tags=low_hard_skill_match,weak_experience_keyword_evidence
  - title: 求职者有MCU和嵌入式项目经验
  - action: 深入理解real-time control的本质（确定性时间中断、固定控制周期），研究EtherCAT与CAN的关联，在简历项目描述中加入'real-time control'关键词，面试中能够解释为何工业控制不能用普通TCP/IP而需要专用工业网络。

## research_academic
Target: Research Assistant
Keywords: research, literature review, experiment, data analysis, publication, methodology, grant

### Flagged Current Top Rows
- #2 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #3 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。
- #4 seg_355 [no_role_signal] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能

### Buried Candidate Rows
- id=364 score=10 role=marketing target=universal tags=low_role_specificity,low_soft_skill_match,low_measurable_results,weak_target_role_alignment
  - title: 学生简历排序不当
  - action: 把实习经历放最前面（最重要），research/publications放后；针对event management和marketing方向挑选关键词融入简历，展示该方向的能力

## business_operations
Target: Business Operations Manager
Keywords: operations, business process, KPI, stakeholder, cross-functional, process improvement, reporting

### Flagged Current Top Rows
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #4 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

### Buried Candidate Rows
- id=20490 score=13 role=data_analyst,product_manager,marketing target=data_analyst tags=low_hard_skill_match,low_soft_skill_match,low_role_specificity,weak_target_role_alignment,missing_exact_job_title
  - title: 求职者在修改简历前未明确目标岗位所需核心技能
  - action: 在修改简历前先拆解目标岗位核心能力：1）marketing business sense；2）技术技能如SQL和数据表格分析；3）软技能包括presentation、communication、reporting；4）跨组协作能力（cross-functional stakeholder collaboration），再逐条对应简历内容进行改写。

## hospitality_events
Target: Event Planner
Keywords: event, hospitality, vendor, guest experience, coordination, budget, operations

### Flagged Current Top Rows
- #2 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #3 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。
- #4 seg_355 [no_role_signal] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能

### Buried Candidate Rows
- id=7702 score=13 role=data_analyst,marketing target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者在event执行中产出了SOP文件并迭代更新
  - action: 在event planning相关bullet point中加入SOP产出这一成果，说明SOP覆盖的活动站数或使用范围，体现从单次执行到可复用流程建立的能力跃迁

## hr_recruiting
Target: Human Resources Specialist
Keywords: recruiting, onboarding, HRIS, employee relations, Workday, talent acquisition, screening

### Flagged Current Top Rows
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #4 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

### Buried Candidate Rows
- id=4149 score=20 role=finance,hr_recruiting target=financial_analyst,human_resources_specialist tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,weak_experience_keyword_evidence,weak_result_orientation
  - title: 求职者简历缺乏足够的行业关键词
  - action: 根据目标岗位（FA或HR方向）在技能区及工作经历中主动补充相关专业关键词。FA方向补充：Financial Analysis、Portfolio Management、DCF、Financial Modeling等；HR方向补充对应HR专业术语，确保关键词覆盖目标JD中的核心词汇。

## journalism_media
Target: Data Journalist
Keywords: journalism, storytelling, data visualization, reporting, editing, audience, research

### Flagged Current Top Rows
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #4 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

### Buried Candidate Rows
- id=2060 score=10 role=data_analyst,product_manager,marketing target=universal tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者背景缺乏金融相关实习和项目经历
  - action: 针对金融中后台（风控、financial reporting、treasury、operation）方向，简历上需补充金融相关经历：一是将现有实习经历向金融方向改写，二是增加金融相关项目（如了解bond/equity等金融产品、风险敏感性分析、investment research等内容的项目）

## actuarial
Target: Actuarial Analyst
Keywords: actuarial, risk modeling, Excel, R, Python, pricing, reserving, insurance

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=72 score=13 role=machine_learning,data_analyst target=data_analyst tags=low_hard_skill_match,keywords_only_in_skills
  - title: Candidate and mentor are...
  - action: 对四个工具进行自我评估（1-5分）：(1)Excel——数据透视表、SUMIF/COUNTIF/VLOOKUP/INDEX-MATCH、跨表公式；(2)SQL——SELECT/JOIN/GROUP BY/子查询；(3)Python——pandas、matplotlib、sklearn基础；(4)Tableau/PowerBI——仪表板构建、计算字段；找出评分最低的工具，从那里开始

## education
Target: Instructional Designer
Keywords: curriculum, instructional design, learning, training, assessment, student, LMS

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=140 score=10 role=software_engineer,machine_learning,marketing target=data_analyst tags=low_hard_skill_match,keywords_only_in_skills,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: Data science student had...
  - action: 将欺诈检测ML经历框架为三层架构：(1)数据层——"使用SQL查询从MySQL数据库检索交易记录"；(2)建模层——"应用分类模型（指定：逻辑回归、随机森林、XGBoost）预测欺诈概率"；(3)验证层——"使用统计显著性测试验证模型结果，评估性能改进是否具有统计意义"。说明具体的模型类型和统计测试（如适用）。

## other
Target: General Resume
Keywords: resume, summary, skills, experience, project, keyword, ATS

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=23 score=19 role=data_analyst target=data_analyst tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 很多学生保留Leadership和Activiti...
  - action: 评估简历是否需要Leadership版块：若Education + Work Experience + Projects已能填满一页，直接删去Leadership/Activities；若有空白需要填充，可保留1行社团干事或志愿者经历。

## social_services
Target: Social Worker
Keywords: case management, counseling, community, client, assessment, care plan, mental health

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=25788 score=10 role=universal target=universal tags=short_tenure_unclear
  - title: 求职者认为实习时间短（一个月）且工作内容普通
  - action: 梳理实习中涉及 client onboarding、credit assessment、compliance 等工作，尽量量化（如一个月 onboarded 20 个客户），不要自我限制 bullet point 数量，将所有相关经历展示出来。

## civil_construction
Target: Construction Manager
Keywords: construction, site, project schedule, budget, AutoCAD, safety, contractor

### Flagged Current Top Rows
- #3 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #4 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

### Buried Candidate Rows
- id=24404 score=13 role=software_engineer,machine_learning target=data_analyst tags=resume_not_tailored_to_jd
  - title: 求职者参与AI视觉识别项目
  - action: 将项目bullet point聚焦于自身实际贡献：分析AI视觉识别模型的准确率、功能验证及应用场景落地，而非算法开发本身；可写"Analyzed accuracy and functionality of AI visual recognition model applied to construction site safety compliance"

## procurement
Target: Purchasing Agent
Keywords: procurement, vendor, sourcing, purchase order, negotiation, supply chain, cost savings

### Flagged Current Top Rows
- #2 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #3 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。
- #4 seg_355 [no_role_signal] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能

### Buried Candidate Rows
- id=10782 score=29 role=procurement,supply_chain_logistics target=procurement_specialist,purchasing_agent,supply_chain_analyst tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者简历中采购相关经历描述过于笼统宽泛
  - action: 将采购经历拆分为独立bullet point，结构为：Manage procurement process for operations, including collecting purchase requirements, comparing multiple suppliers, selecting optimal vendors, and making purchase orders to enhance supply chain efficiency；同时补充历史数据参考（如去年支出40万、业务增长15%