# Role Retrieval Audit

Generated: 2026-06-03T08:58:32.402Z

## Summary
- finance (finance_accounting, positions=45): top=6, flags=0, buried=2
- software_engineer (tech, positions=42): top=6, flags=0, buried=2
- data_analyst (data, positions=37): top=6, flags=0, buried=2
- hardware_electrical (engineering_hardware, positions=35): top=6, flags=1, buried=2
- design_creative (design_creative, positions=27): top=6, flags=0, buried=2
- marketing (marketing_sales, positions=26): top=6, flags=1, buried=2
- mechanical_engineering (engineering_hardware, positions=18): top=6, flags=0, buried=2
- healthcare (healthcare_life_sciences, positions=16): top=6, flags=2, buried=2
- machine_learning (data, positions=16): top=6, flags=2, buried=2
- ux_research_design (design_creative, positions=13): top=6, flags=3, buried=2
- legal_compliance (legal_policy, positions=8): top=6, flags=0, buried=2
- product_manager (product, positions=8): top=6, flags=4, buried=2
- operations (business_ops, positions=7): top=6, flags=5, buried=2
- accounting (finance_accounting, positions=6): top=6, flags=0, buried=2
- journalism_media (media, positions=3): top=6, flags=3, buried=2
- education (education_research, positions=2): top=6, flags=0, buried=2

## finance
Target: Financial Analyst
Keywords: financial modeling, Excel, forecasting, budgeting, variance analysis, valuation, KPI

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=4149 score=20 role=finance,hr_recruiting target=financial_analyst,human_resources_specialist tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,weak_experience_keyword_evidence,weak_result_orientation
  - title: 求职者简历缺乏足够的行业关键词
  - action: 根据目标岗位（FA或HR方向）在技能区及工作经历中主动补充相关专业关键词。FA方向补充：Financial Analysis、Portfolio Management、DCF、Financial Modeling等；HR方向补充对应HR专业术语，确保关键词覆盖目标JD中的核心词汇。
- id=13980 score=20 role=finance target=financial_analyst,investment_analyst,risk_analyst,fp_and_a tags=weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者简历中涉及SaaS行业
  - action: 研究目标行业的核心KPI：SaaS公司关注subscription model指标，如Active User、Churn Rate、Lifetime Value（LTV）；豪客（大客户）模式则关注不同指标。根据目标公司业务模式，在简历中突出对应的量化指标。

## software_engineer
Target: Software Development Engineer
Keywords: software development, data structures, algorithms, Java, Python, API, debugging, code review, microservices

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=328 score=29 role=software_engineer,ai_engineer,data_analyst target=backend_engineer tags=low_hard_skill_match,missing_microservices,keywords_only_in_skills
  - title: 学员技能区内容混乱且写得太少
  - action: 将技能区按6个维度分层呈现：1.Programming Languages；2.Backend Framework（如Spring Boot）；3.Database（如MySQL、PostgreSQL）；4.Cloud/DevOps（如AWS、Docker）；5.Architecture Components（如Microservices、RESTful API、Event-driven design）；6.AI/ML（如RAG、LLM工具）；删除"familiar with"等程度描述，直接列出会用的技术名称。
- id=3959 score=26 role=software_engineer target=backend_engineer,full_stack_engineer,software_engineer,software_development_engineer tags=low_hard_skill_match,keywords_only_in_skills
  - title: 求职者有full stack开发经验（前后端数据流...
  - action: 针对性学习Java及Spring Boot框架，重点掌握RESTful API开发、数据库集成（如JPA/Hibernate）等后端核心能力，可将现有项目用Java重新实现以加深掌握并丰富简历项目多样性。

## data_analyst
Target: Data Analyst
Keywords: SQL, Excel, Tableau, Power BI, dashboard, KPI, data cleaning, business insights

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=1005 score=29 role=data_analyst target=data_analyst tags=keywords_only_in_skills
  - title: 求职者用于投DA岗位的简历缺乏DA必备关键词（SQ...
  - action: 在DA简历的实习经历中明确体现SQL、Python、Excel、Tableau或Power BI、跨部门协作（works with other functions）这五类关键词，优先出现在工作经历bullet point中。
- id=1012 score=29 role=software_engineer,machine_learning,data_analyst target=data_analyst tags=low_measurable_results
  - title: 求职者的实习经历描述混杂多种工作内容
  - action: 将实习bullet point按技能维度重构为4-5条：①数据采集（Python/API/数据库）②SQL查询和machine learning建模③数据清洗整合（提升数据质量X%）④Excel分析⑤Tableau dashboard可视化+跨部门协作。每条尽量加入量化结果。

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
- id=6317 score=20 role=hardware_electrical target=hardware_engineer,electrical_engineer tags=generic_resume_positioning,resume_not_tailored_to_jd
  - title: 求职者同时投递两类公司
  - action: 针对不同目标公司制作差异化简历版本：调整顶部突出点和核心技能，将最相关的经历和技能放在最显眼位置；后段的experience内容可保持一致，但开头的highlight需根据岗位侧重点分别定制

## design_creative
Target: Graphic Designer
Keywords: portfolio, Adobe, Figma, visual design, brand identity, layout, typography, PDF

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=8705 score=26 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=low_hard_skill_match,missing_portfolio
  - title: 求职者已掌握Adobe系列工具（AI、PS、Ill...
  - action: 立即学习Figma，利用已有的Adobe基础快速上手，将Figma纳入作品集制作工具链，并在简历技能栏中添加Figma，以满足UI/UX实习岗位的基本要求。
- id=8706 score=26 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=low_hard_skill_match,keywords_only_in_skills
  - title: 求职者具备基础应用工具技能
  - action: 学习Figma作为核心设计工具，利用已有Adobe基础降低学习成本，将其作为构建UI/UX portfolio和申请实习的必备技能

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
- id=5241 score=21 role=marketing,data_analyst target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者在朋友的初创卖课公司工作
  - action: 将初创公司经历改写为涵盖social media运营、search ads、YouTube广告、PMAX campaign、content development、influencer合作等具体数字营销技能的bullet points，并说明各渠道的业务逻辑和成果

## mechanical_engineering
Target: Mechanical Engineer
Keywords: CAD, SolidWorks, mechanical design, FEA, manufacturing, robotics, control system

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=7198 score=20 role=mechanical_engineering target=mechanical_engineer,robotics_engineer tags=weak_target_role_alignment,low_role_specificity,missing_exact_job_title
  - title: 求职者目标暑期实习
  - action: 利用1-2月投递窗口前的剩余时间，继续推进 haptic device 项目进度，同时完善简历中该项目的描述内容，确保在正式投递前简历达到最佳状态。
- id=19065 score=20 role=mechanical_engineering target=mechanical_engineer,automotive_engineer tags=low_hard_skill_match
  - title: 求职者有SolidWorks基础但未接触过汽车行业...
  - action: 在YouTube上搜索CATIA教程，了解其基本操作（与SolidWorks大差不差），学习后将CATIA列入简历技能栏，以满足汽车硬件岗位的工具要求。

## healthcare
Target: Clinical Research Associate
Keywords: clinical, healthcare, patient, trial, regulatory, data collection, medical

### Flagged Current Top Rows
- #4 seg_5787 [not_role_safe] role=universal target=universal
  - title: 求职者简历顶部Summary着重强调healthcare方向，若申请广泛ESG岗位，会让HR误判这是为医疗或建筑行业专门准备的简历，降低匹配感。
  - action: 将Summary中过于垂直的healthcare专攻描述删减，改写为更通用的ESG/sustainability方向表述，以适配更广泛的目标岗位；同时将education和skills板块移至简历下方。
- #5 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。

### Buried Candidate Rows
- id=2989 score=18 role=healthcare,data_scientist target=healthcare_analytics,biotech_data_scientist,clinical_data tags=generic_resume_positioning
  - title: 求职者有两段Healthcare实习经历
  - action: 根据目标岗位准备多版简历：申healthcare/CRO方向时重点突出两段healthcare实习及clinical data相关项目；申tech biotech方向时加入machine learning相关项目（用Python/R实现）；申药厂方向时补充CD相关项目。同时删除2018年过期的research assistant经历。
- id=24633 score=13 role=machine_learning target=universal tags=resume_not_tailored_to_jd
  - title: 简历要清晰展示你的目标岗位
  - action: 针对不同求职方向定制简历：申请clinical trial方向则强调数据处理量、模型构建与统计显著性结论；申请healthcare/biotech方向则强调模型准确度优化、模型对比、运行时间优化等内容

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
- id=1418 score=26 role=software_engineer,machine_learning,data_analyst target=machine_learning_engineer,data_analyst tags=generic_resume_positioning,resume_not_tailored_to_jd,low_role_specificity,low_hard_skill_match,weak_target_role_alignment
  - title: 不要一份简历投所有岗位
  - action: 根据申请方向定制两套简历：DA版聚焦analytics、SQL、Excel、可视化，机器学习内容少量点到即止；DS版突出建模、Python、machine learning算法、深度学习框架。同一段经历用不同角度的bullet point描述。

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
- #6 seg_355 [no_role_signal] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能

### Buried Candidate Rows
- id=4693 score=17 role=ux_research_design,design_creative,product_manager target=ux_designer,product_designer,product_manager tags=weak_experience_keyword_evidence,missing_linkedin
  - title: 求职者目前只有不相关工作经验
  - action: 将学校设计项目（如design project、more code等）添加至简历，不需要单独分设Projects section，直接合并入Experience section，确保ATS能扫描到相关关键词，通过初筛。
- id=8705 score=12 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=low_hard_skill_match,missing_portfolio
  - title: 求职者已掌握Adobe系列工具（AI、PS、Ill...
  - action: 立即学习Figma，利用已有的Adobe基础快速上手，将Figma纳入作品集制作工具链，并在简历技能栏中添加Figma，以满足UI/UX实习岗位的基本要求。

## legal_compliance
Target: Compliance Analyst
Keywords: compliance, regulatory, legal research, contract, risk, policy, documentation

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=3478 score=13 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=missing_portfolio
  - title: 求职者同时申请Credit Risk、Fraud/...
  - action: 为三个方向分别准备简历版本：Credit Risk版强调portfolio monitoring、delinquency、default、PD/LGD/EAD、roll rate、vintage等；Fraud/AML版强调fraud detection、transaction monitoring、AML、KYC、suspicious activity、pattern anomaly monitoring；Risk Consulting版强调internal control、process improvement、
- id=3479 score=13 role=finance,operations target=risk_consulting,risk_analyst,operations tags=low_soft_skill_match,keywords_only_in_skills,generic_resume_positioning
  - title: 求职者简历中Python及quantitative...
  - action: 针对Risk Consulting方向，将简历中Python、statistical modeling等技术描述弱化或移至技能列表次要位置，工作经历bullet point改为突出internal control、RCSA、control framework、process improvement、governance、regulatory compliance等关键词，体现咨询思维与风险治理能力。

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
- #6 seg_26130 [not_role_safe] role=product_manager,marketing target=universal
  - title: 求职者第三段经历为家族企业虚构经历，内容空泛，缺乏可信度与技能展示；原版偏重电商平台操作，未能体现可迁移的营销能力
  - action: 将家族企业（惠普电脑代理零售）经历重新包装为general marketing方向，聚焦三类可信技能：①Social media内容创作（小红书/公众号产品推广帖）；②电商产品详情页copywriting（京东/淘宝listing优化）；③产品图片拍摄与修图，三条bullet point分别对应一个技能，使经历看起来真实且与营销岗位匹配

### Buried Candidate Rows
- id=8654 score=26 role=product_manager,data_analyst target=product_manager,data_analyst tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者项目经历中未体现产品规划能力
  - action: 在项目描述中补充：build产品roadmap（如Q1/Q2里程碑规划），以及与设计团队合作使用Figma进行UI/UX设计，体现cross-functional协作能力和产品全周期管理经验。
- id=3310 score=23 role=software_engineer,product_manager,data_analyst target=product_manager,data_analyst tags=missing_priority_keywords,low_role_specificity,missing_linkedin
  - title: 求职者对AI PM岗位实际做什么尚不清晰
  - action: 在LinkedIn上搜索至少10个AI Product Manager职位，仔细阅读JD，归纳高频关键词（如roadmap、cross-functional、data-driven等），再将自身过往经历与这些关键词对齐，删除不相关内容，补充匹配项。

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
- #5 seg_5991 [not_role_safe] role=universal target=universal
  - title: 求职者将餐厅自营经验视为与财务岗位无关的经历，未能提炼其中的business acumen价值，导致简历中最有力的差异化卖点被埋没。
  - action: 在简历和面试中将餐厅经营经验重新定位为"business acumen"的来源，强调全局经营视角（整体看公司运作、实现长期盈利），并与IBM财务实习经验形成组合叙事，展示"宏观视野+财务技能"的双重优势。
- #6 seg_340 [no_role_signal] role=universal target=universal
  - title: 学生简历只写了SolidWorks和3D打印等少量硬技能，大量版面空白，内容单薄
  - action: 将所有相关技能（project management、软件工具、软技能等）都写入简历；若内容不足以填满一页，可添加professional summary作为补充

### Buried Candidate Rows
- id=3479 score=15 role=finance,operations target=risk_consulting,risk_analyst,operations tags=low_soft_skill_match,keywords_only_in_skills,generic_resume_positioning
  - title: 求职者简历中Python及quantitative...
  - action: 针对Risk Consulting方向，将简历中Python、statistical modeling等技术描述弱化或移至技能列表次要位置，工作经历bullet point改为突出internal control、RCSA、control framework、process improvement、governance、regulatory compliance等关键词，体现咨询思维与风险治理能力。
- id=14883 score=12 role=project_program_management,business_operations,manufacturing_process target=project_manager,program_manager,operations_manager tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,weak_experience_keyword_evidence,weak_result_orientation
  - title: 求职者有参与跨部门良率分析会议的经历
  - action: 将跨部门协作分析良率的经历展开描述，突出主导会议召集、问题分析、协调各部门负责人等关键动作，并匹配PM岗位相关关键词，使其成为有说服力的项目案例。

## accounting
Target: Accountant
Keywords: GAAP, reconciliation, accounts payable, accounts receivable, audit, month-end close, QuickBooks

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=12900 score=29 role=accounting target=accountant,auditor,tax_consultant tags=weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者在会计实习中做了bookkeeping、re...
  - action: 逐一追问工作细节（使用哪些工具、操作流程、服务了几家公司），将散乱描述整理为可写入简历的具体职责，如：进入QuickBooks进行month-end close、协助revenue分类、执行monthly reconciliation。
- id=1953 score=23 role=accounting target=accountant,auditor,tax_consultant tags=low_soft_skill_match
  - title: 求职者在丽思卡尔顿实习的经历中
  - action: 将AP invoice核对、reconciliation等高频操作提炼为"注重细节"技能；将主动识别invoice分类错误、跨部门确认沟通的经历提炼为"沟通能力"，并在简历bullet point中具体呈现这两项能力的应用场景。

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
- #5 seg_355 [no_role_signal] role=universal target=universal
  - title: 学生只有一份通用简历，对所有岗位一份发到底，缺乏针对性
  - action: 根据目标岗位类别（如analog IC、数字IC、硬件测试等）准备2-3个微调版本，每个版本突出与该类岗位最相关的项目和技能

### Buried Candidate Rows
- id=2060 score=10 role=data_analyst,product_manager,marketing target=universal tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者背景缺乏金融相关实习和项目经历
  - action: 针对金融中后台（风控、financial reporting、treasury、operation）方向，简历上需补充金融相关经历：一是将现有实习经历向金融方向改写，二是增加金融相关项目（如了解bond/equity等金融产品、风险敏感性分析、investment research等内容的项目）
- id=2830 score=10 role=marketing target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者的活动项目经历描述过于笼统
  - action: 将活动经历改写为：①明确target audience（如武汉45-60岁中老年群体）②描述所做research方法（线上调查+线下访问）③呈现得出的insight（中老年群体不信任线上广告）④说明基于insight的策略决策（选择线下社区活动形式），最后附上活动results数据。

## education
Target: Instructional Designer
Keywords: curriculum, instructional design, learning, training, assessment, student, LMS

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=140 score=10 role=software_engineer,machine_learning,marketing target=data_analyst tags=low_hard_skill_match,keywords_only_in_skills,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: Data science student had...
  - action: 将欺诈检测ML经历框架为三层架构：(1)数据层——"使用SQL查询从MySQL数据库检索交易记录"；(2)建模层——"应用分类模型（指定：逻辑回归、随机森林、XGBoost）预测欺诈概率"；(3)验证层——"使用统计显著性测试验证模型结果，评估性能改进是否具有统计意义"。说明具体的模型类型和统计测试（如适用）。
- id=157 score=10 role=machine_learning target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: Student had exchange rate...
  - action: 对于涉及时间序列或截面数据的经济或金融研究项目，将叙事重新框架为：(1)识别哪些经济特征（变量）影响结果（汇率、GDP、资产价格）；(2)应用线性回归基于这些特征预测未来值；(3)生成关于哪些驱动因素具有最强预测关系的洞察。这种框架将要点从"我研究了汇率"转变为"我构建了使用特征分析和线性回归的汇率走势预测模型"。