# Role Retrieval Audit

Generated: 2026-06-02T22:44:42.968Z

## Summary
- finance (finance_accounting, positions=45): top=12, flags=0, buried=5
- software_engineer (tech, positions=42): top=12, flags=0, buried=5
- data_analyst (data, positions=37): top=12, flags=1, buried=5
- hardware_electrical (engineering_hardware, positions=35): top=12, flags=1, buried=5
- supply_chain_logistics (business_ops, positions=32): top=12, flags=5, buried=5
- design_creative (design_creative, positions=27): top=12, flags=2, buried=5
- marketing (marketing_sales, positions=26): top=12, flags=0, buried=5
- business_analysis (business_ops, positions=22): top=12, flags=8, buried=5
- data_engineer (data, positions=18): top=12, flags=3, buried=5
- manufacturing_process (engineering_hardware, positions=18): top=12, flags=10, buried=5
- mechanical_engineering (engineering_hardware, positions=18): top=12, flags=7, buried=5
- cloud_infrastructure (tech, positions=16): top=12, flags=9, buried=5
- healthcare (healthcare_life_sciences, positions=16): top=12, flags=3, buried=5
- machine_learning (data, positions=16): top=12, flags=5, buried=5
- ai_engineer (data, positions=15): top=12, flags=4, buried=5
- project_program_management (business_ops, positions=13): top=12, flags=4, buried=5
- ux_research_design (design_creative, positions=13): top=12, flags=7, buried=5
- cybersecurity (tech, positions=12): top=12, flags=7, buried=5
- industrial_quality (engineering_hardware, positions=12): top=12, flags=10, buried=5
- consulting (business_ops, positions=11): top=12, flags=1, buried=5
- life_sciences (healthcare_life_sciences, positions=9): top=12, flags=2, buried=5
- data_scientist (data, positions=8): top=12, flags=8, buried=5
- legal_compliance (legal_policy, positions=8): top=12, flags=0, buried=5
- policy_public_sector (legal_policy, positions=8): top=12, flags=0, buried=5
- product_manager (product, positions=8): top=12, flags=1, buried=5
- sales_customer_success (marketing_sales, positions=8): top=12, flags=4, buried=5
- sustainability_environment (legal_policy, positions=8): top=12, flags=6, buried=5
- trading_quant (finance_accounting, positions=8): top=12, flags=0, buried=5
- operations (business_ops, positions=7): top=12, flags=5, buried=5
- accounting (finance_accounting, positions=6): top=12, flags=0, buried=5
- communications_pr (marketing_sales, positions=6): top=12, flags=7, buried=5
- it_support (tech, positions=6): top=12, flags=7, buried=5
- research_academic (education_research, positions=6): top=12, flags=0, buried=5
- business_operations (business_ops, positions=3): top=12, flags=8, buried=5
- hospitality_events (business_ops, positions=3): top=12, flags=7, buried=5
- hr_recruiting (business_ops, positions=3): top=12, flags=10, buried=5
- journalism_media (media, positions=3): top=12, flags=0, buried=5
- actuarial (finance_accounting, positions=2): top=12, flags=1, buried=5
- education (education_research, positions=2): top=12, flags=2, buried=5
- other (other, positions=2): top=12, flags=1, buried=5
- social_services (healthcare_life_sciences, positions=2): top=12, flags=2, buried=5
- civil_construction (engineering_hardware, positions=1): top=12, flags=3, buried=5
- procurement (business_ops, positions=1): top=12, flags=9, buried=5

## finance
Target: Financial Analyst
Keywords: financial modeling, Excel, forecasting, budgeting, variance analysis, valuation, KPI

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=13980 score=20 role=finance target=financial_analyst,investment_analyst,risk_analyst,fp_and_a tags=weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者简历中涉及SaaS行业
  - action: 研究目标行业的核心KPI：SaaS公司关注subscription model指标，如Active User、Churn Rate、Lifetime Value（LTV）；豪客（大客户）模式则关注不同指标。根据目标公司业务模式，在简历中突出对应的量化指标。
- id=13982 score=20 role=finance target=financial_analyst,investment_analyst,risk_analyst,fp_and_a tags=weak_target_role_alignment,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者简历中写的行业sector（如SaaS）与其...
  - action: 根据目标岗位所在行业组（如infrastructure、房地产等），将简历中的deal sector替换为对应行业，同时补充了解该行业的核心KPI和估值指标
- id=23958 score=20 role=finance target=financial_analyst,investment_analyst,risk_analyst,fp_and_a tags=weak_target_role_alignment,low_role_specificity,missing_exact_job_title
  - title: 求职者背景为生物工程
  - action: 拓宽投递方向，搜索关键词包括Corporate Finance、Healthcare Finance、Advisory、M&A、Healthcare Equity等，增加目标岗位覆盖范围，同时优先考虑IB及Advisory方向（相比纯医药金融BC更有希望）。
- id=485 score=17 role=finance target=financial_analyst,investment_analyst,risk_analyst,fp_and_a tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 有金融/投资背景、希望将简历调整为适配风控岗位的求...
  - action: 选择改写方案时，根据目标职位的风控程度决定：若目标岗位风控成分适中，保留现有职位名称、仅在职责描述中增加风险相关内容即可；若目标岗位是纯风控职位，则需同时修改职位名称和职责描述，使简历整体呈现为风控定向
- id=487 score=17 role=finance target=financial_analyst,investment_analyst,risk_analyst,fp_and_a tags=short_tenure_unclear,education_details_missing
  - title: 有各类短期经历、不确定哪些可以算作正式工作经验写入...
  - action: 判断某段经历是否可以列为简历中的"work experience"时，以该公司能否支持background check（背景调查）为标准：能背调则列为internship/work experience，否则列为project

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
- id=9340 score=26 role=software_engineer target=backend_engineer,frontend_engineer,software_engineer,software_development_engineer tags=low_hard_skill_match,missing_microservices,keywords_only_in_skills
  - title: 求职者Technical Skills部分未按类别归组
  - action: 将Technical Skills按以下类别分组排列：1）Languages（Java、Python、C++等）；2）Frameworks（Spring、React、Angular等）；3）Cloud/DevOps（AWS、Kubernetes等）；4）Databases（MySQL、Oracle等）。确保各分类标题格式（加粗/大小写）保持一致。
- id=3 score=23 role=software_engineer,machine_learning target=backend_engineer,frontend_engineer,machine_learning_engineer,software_engineer,software_development_engineer tags=low_hard_skill_match,keywords_only_in_skills,low_jd_keyword_match
  - title: 按属性重组你的技能板块
  - action: 将Skills版块统一按属性重组为四类：①Programming Languages（Python/Java/C++）②Libraries（NumPy、TensorFlow、JUnit）③Frameworks & Platforms（Flask、Spring Boot、Node.js、Redis）④Tools & Software（Git、Docker、IntelliJ、PyCharm）
- id=576 score=23 role=software_engineer target=backend_engineer tags=low_hard_skill_match
  - title: Skills部分要按四类分组：编程语言、框架库、数...
  - action: 删除所有个性描述词，将技能按编程语言、框架库、数据库、云平台四类重新整理排列

## data_analyst
Target: Data Analyst
Keywords: SQL, Excel, Tableau, Power BI, dashboard, KPI, data cleaning, business insights

### Flagged Current Top Rows
- #7 seg_16049 [not_role_safe] role=data_analyst target=data_analyst
  - title: 求职者简历缺乏能在7秒内抓住HR注意力的结构设计，HR扫描简历只有7秒，若Summary内容不精准，关键信息无法被快速识别，导致简历在HR环节被淘汰。
  - action: 在简历顶部保留Summary，并确保Summary内容精准呈现与目标岗位匹配的核心关键词和技能，使HR在7秒内能判断候选人是否符合岗位需求。

### Buried Candidate Rows
- id=1005 score=29 role=data_analyst target=data_analyst tags=keywords_only_in_skills
  - title: 求职者用于投DA岗位的简历缺乏DA必备关键词（SQ...
  - action: 在DA简历的实习经历中明确体现SQL、Python、Excel、Tableau或Power BI、跨部门协作（works with other functions）这五类关键词，优先出现在工作经历bullet point中。
- id=1012 score=29 role=software_engineer,machine_learning,data_analyst target=data_analyst tags=low_measurable_results
  - title: 求职者的实习经历描述混杂多种工作内容
  - action: 将实习bullet point按技能维度重构为4-5条：①数据采集（Python/API/数据库）②SQL查询和machine learning建模③数据清洗整合（提升数据质量X%）④Excel分析⑤Tableau dashboard可视化+跨部门协作。每条尽量加入量化结果。
- id=1118 score=29 role=data_analyst target=data_analyst tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 学生用偏DS风格的简历投DA岗位
  - action: 在DA简历的实习/项目描述中明确体现SQL、Python、Excel、Tableau或Power BI，以及跨部门协作经验
- id=1239 score=29 role=data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者在汽车零部件startup的实习经历描述过于零散
  - action: 按分析流程重组为4个bullet point：1）用SQL提取生产数据；2）分析parts production duration及material/labor cost；3）与operation manager合作监测EV card生产流程并提供优化建议；4）用Tableau/Power BI搭建dashboard进行可视化。
- id=1335 score=29 role=data_analyst target=data_analyst tags=low_soft_skill_match,keywords_only_in_skills
  - title: 求职者的DA简历里充斥DS/DE相关术语
  - action: 在DA简历的实习/项目bullet point中，明确写入SQL、Python、Excel、Tableau或Power BI，以及cross-functional合作等关键词。

## hardware_electrical
Target: Hardware Engineer
Keywords: Verilog, RTL, FPGA, PCB, circuit, simulation, VLSI, EDA, lab

### Flagged Current Top Rows
- #5 seg_4874 [not_role_safe] role=universal target=universal
  - title: 求职者简历Summary未突出差异化亮点，HR无法快速形成印象并产生继续阅读项目经历的动力。
  - action: 在Summary中明确列出3个核心能力关键词（如label design、gameplay mechanics、player psychology/flow），让HR在阅读Summary后能主动去项目经历中寻找对应佐证，形成阅读引导链路。

### Buried Candidate Rows
- id=6311 score=20 role=hardware_electrical target=hardware_engineer,electrical_engineer tags=low_hard_skill_match,outdated_resume
  - title: 求职者简历中的项目技术描述已过时（仍写旧工具）
  - action: 用 ChatGPT 辅助将项目 bullet point 改写，突出当前实际使用的技术（如 Python），并加入「designing and debugging feedback circuits」等体现动手能力的描述，传递候选人能独立解决硬件/电路问题的形象。
- id=15133 score=20 role=hardware_electrical target=electronic_engineer,hardware_engineer tags=missing_code_review_documentation
  - title: 求职者的学校项目（ocean detector f...
  - action: 为项目 bullet point 拆分为三层结构：1）数据采集工具/硬件；2）具体测量行为（如测量海洋温度）；3）总结发现并文档化（如 summarize findings and document them in lab report）。若无法量化，可描述流程与产出。
- id=23334 score=20 role=hardware_electrical target=hardware_engineer,ic_design_engineer tags=low_hard_skill_match,weak_target_role_alignment
  - title: 求职者对功耗优化的切入层级理解不清
  - action: 在简历或面试中描述功耗优化经验时，优先强调架构级和RTL级的优化方法（如clock gating），说明从顶层设计出发的工程思维，而非停留在电路级细节，以体现系统性思维。
- id=7878 score=17 role=hardware_electrical target=hardware_engineer tags=low_role_specificity
  - title: 不要一份简历投所有岗位
  - action: 将3~5份目标实习JD对比阅读，找出高频关键词后针对性修改简历；若不打算读博，则将科研定位为锦上添花的加分项，不必过度投入精力
- id=8517 score=17 role=hardware_electrical target=digital_ic_engineer,analog_ic_engineer,hardware_engineer tags=generic_resume_positioning,low_role_specificity
  - title: 不要一份简历投所有岗位
  - action: 将现有简历拆分为两份独立版本：一份针对数字电路岗位，突出数字相关项目与技能；一份针对模拟电路岗位，突出模拟相关内容。两份简历分别投递对应方向的职位。

## supply_chain_logistics
Target: Supply Chain Analyst
Keywords: supply chain, inventory, logistics, demand planning, forecasting, ERP, vendor

### Flagged Current Top Rows
- #6 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #7 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #9 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。
- #10 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #11 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度

### Buried Candidate Rows
- id=4154 score=15 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=education_details_missing,weak_target_role_alignment
  - title: 求职者以为Coursework只能填学校正式课程
  - action: 在Coursework区域填写与目标岗位（FA/Supply Chain）相关的课程，包括线上自学课程；面试官不会核查成绩单，只会询问学到了什么
- id=4668 score=15 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=low_jd_keyword_match,missing_priority_keywords,weak_target_role_alignment,missing_exact_job_title
  - title: 求职者面向Supply Chain Analyst...
  - action: 分开准备两版简历，但内容无需大幅改动，主要调整职位Title使其与目标岗位更贴近，例如面向物流/供应链岗位时将Title改为Logistics Engineer，以提升关键词匹配度。
- id=14866 score=15 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=missing_priority_keywords,keywords_only_in_skills,weak_target_role_alignment,low_hard_skill_match,low_jd_keyword_match
  - title: 求职者简历缺乏与目标岗位匹配的关键词
  - action: 在简历中补充与Supply Chain/PM岗位相关的关键词和技能描述，确保HR在初筛时能快速识别并向Hiring Manager传达候选人具备岗位所需技能。
- id=14868 score=15 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=education_details_missing
  - title: 求职者希望转行至PM或supply chain岗位
  - action: 在简历中尽量凸显与PM或supply chain相关的经验，哪怕是间接经验也需包装体现；同时通过考取相关证书（如PMP、Lean Six Sigma）填补经验空白，确保至少能通过HR初筛关卡。
- id=14873 score=15 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=low_role_specificity
  - title: 不要一份简历投所有岗位
  - action: 明确告知目标岗位方向（如supply chain或PM），再由导师根据方向针对性润色简历；可同时提供多个方向供导师参考

## design_creative
Target: Graphic Designer
Keywords: portfolio, Adobe, Figma, visual design, brand identity, layout, typography, PDF

### Flagged Current Top Rows
- #5 seg_4716 [not_role_safe] role=universal target=product_manager
  - title: 求职者作品集case study结构不清晰，缺乏对role、platform、timeline、contribution及impact的系统性呈现
  - action: 参考优秀设计师作品集结构：每个case study开头highlight自己的role、平台、timeline和contribution，正文说明项目背景与设计内容，结尾展示impact；同时确保作品集内容与简历bullet point相互呼应，至少准备2-4个case study。
- #11 seg_4891 [not_role_safe] role=design_creative target=graphic_designer,ux_designer,ui_designer,designer
  - title: 求职者将个人主页链接（github.io域名）放在简历标题行，HR可能误以为是代码仓库而不点开，且链接在标题区不一定被阅读到。
  - action: 将个人主页链接从标题行移除，改在summary最后一句以文字形式引导HR点击，例如写'You can review my portfolio here'，因为HR一定会读summary，曝光率更高。

### Buried Candidate Rows
- id=8705 score=26 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=low_hard_skill_match,missing_portfolio
  - title: 求职者已掌握Adobe系列工具（AI、PS、Ill...
  - action: 立即学习Figma，利用已有的Adobe基础快速上手，将Figma纳入作品集制作工具链，并在简历技能栏中添加Figma，以满足UI/UX实习岗位的基本要求。
- id=8706 score=26 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=low_hard_skill_match,keywords_only_in_skills
  - title: 求职者具备基础应用工具技能
  - action: 学习Figma作为核心设计工具，利用已有Adobe基础降低学习成本，将其作为构建UI/UX portfolio和申请实习的必备技能
- id=503 score=23 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=missing_portfolio
  - title: UX/设计类求职者
  - action: 准备两种格式的作品集：投递简历时附上个人作品集网站链接（视觉简洁、加载快、链接有效）；面试现场讲解案例时准备专门的PDF或Deck版本，控制叙述节奏和重点
- id=8761 score=23 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=formatting_penalty_triggered
  - title: 求职者简历内容已较丰富但layout不够体现设计师水准
  - action: 精简简历内容，使用Illustrator或InDesign参考网上流行模板重新排版，加入能体现个人性格的颜色和设计元素，使简历本身即为设计作品。
- id=270 score=20 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=generic_resume_positioning,low_role_specificity,missing_portfolio
  - title: 候选人用一份简历投递各类风险管理岗位
  - action: 根据目标岗位调整简历重点：Fraud/AML/Credit Risk等合规类要强调RCSA/control framework；Data Risk/Portfolio Risk等技术类要强调Python和modeling

## marketing
Target: Marketing Analyst
Keywords: campaign, SEO, SEM, Google Analytics, CRM, conversion, content strategy, brand

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=2867 score=21 role=ai_engineer,data_analyst,marketing target=universal tags=low_hard_skill_match,keywords_only_in_skills,weak_experience_keyword_evidence,weak_result_orientation
  - title: 求职者非营销专业出身
  - action: 系统学习北美数字营销核心知识，重点补充Email Marketing、SEO/SEM、Google Analytics等工具的实操知识；可通过Google Digital Garage、HubSpot Academy等免费平台获取认证课程。
- id=5241 score=21 role=marketing,data_analyst target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者在朋友的初创卖课公司工作
  - action: 将初创公司经历改写为涵盖social media运营、search ads、YouTube广告、PMAX campaign、content development、influencer合作等具体数字营销技能的bullet points，并说明各渠道的业务逻辑和成果
- id=9307 score=21 role=marketing target=universal tags=missing_linkedin
  - title: 求职者拥有中国市场营销背景
  - action: 明确区分北美市场与中国市场的求职方向，不要试图用同一套简历和面试策略同时申请两个市场；若目标是北美，聚焦digital marketing（SEO、SEM、Email）相关经验包装；若考虑中国市场，需补充campaign策划和本土化创意能力。
- id=9635 score=21 role=data_analyst,marketing target=universal tags=education_details_missing,low_measurable_results
  - title: 求职者缺乏各营销渠道的基础实操技能
  - action: 考取Google Analytics证书以建立网站campaign分析能力；了解Marketo、Salesforce等主流CRM/Email marketing工具的基本功能；补充社交媒体数据分析（点赞、互动等指标）、视频/图片编辑基础技能，以及Google ADS付费广告投放的基本逻辑，不需每项精通但需大概了解。
- id=14695 score=21 role=data_analyst,marketing target=data_analyst tags=missing_linkedin
  - title: 求职者本科学心理、项目经验偏DA
  - action: 若要转投marketing岗位，须补充实操经验，如Google Analytics使用记录、Facebook/Google Ads Campaign、Email Campaign或SEO项目，并在简历中明确体现这些关键词，提升被HR主动联系的概率。

## business_analysis
Target: Business Analyst
Keywords: requirements gathering, process improvement, SQL, Excel, stakeholder, JIRA, business case

### Flagged Current Top Rows
- #1 seg_15871 [role_mismatch] role=data_analyst,product_manager target=business_analyst
  - title: 求职者简历关键词与目标岗位（BA方向）的JD匹配度不足，可能在ATS机筛阶段被过滤
  - action: 在网上搜集10份目标BA岗位的Job Description，将About Us、Responsibilities、Qualifications等内容复制粘贴到一个Word文档，再用JD与简历匹配工具（Google搜索'job description and resume matching tool'）分析关键词缺口，针对性补充至简历中
- #2 seg_8297 [role_mismatch] role=data_analyst,product_manager target=data_analyst,business_analyst
  - title: 求职者简历关键词匹配度不足，可能在ATS机筛阶段即被过滤，无法到达HR和hiring manager手中。
  - action: 简历修改完成后，针对目标方向（如BA/Data Analyst）在Indeed、LinkedIn或目标公司官网收集约10份相关JD，使用在线resume关键词匹配工具（Google搜索"resume keyword match tool"）对比简历与JD的关键词重合度，据此补充或调整简历中的关键词。
- #3 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #7 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #8 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。
- #9 seg_14423 [role_mismatch] role=data_analyst,product_manager target=business_analyst,data_analyst
  - title: 求职者简历尚未针对BA岗位JD进行关键词匹配，导师通过展示真实JD示例，指出简历应主动提炼并体现JD中的高频词汇和核心要求。
  - action: 仔细阅读目标BA职位的job description，提取高频出现的技能词、工具名称和职责描述，将这些关键词有机融入简历的工作经历和技能列表中，确保与JD高度匹配。
- #10 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #11 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度

### Buried Candidate Rows
- id=1081 score=15 role=data_analyst target=data_analyst,business_analyst tags=low_role_specificity,education_details_missing
  - title: 求职者当前简历投DA岗位无回音
  - action: 将简历重新调整为DA版本：保留2个internship + 3个项目（共5个经历），每个经历的描述聚焦分析类工作，删除或淡化建模内容，突出SQL、Excel、可视化、业务分析等DA核心技能。
- id=11568 score=15 role=software_engineer,machine_learning,data_analyst target=data_analyst,data_scientist,business_analyst tags=low_hard_skill_match,keywords_only_in_skills
  - title: 简历要清晰展示你的目标岗位
  - action: 将简历技能部分聚焦于Excel和Tableau，同时添加基础machine learning相关内容增加竞争力；刷题时选择简单难度题目，避免挑战Python/SQL高难度题；投递时筛选对编程要求较低的数据分析岗位，量力而行逐步提升。
- id=11608 score=15 role=data_analyst target=business_analyst,data_analyst tags=low_hard_skill_match,education_details_missing
  - title: 求职者Python基础薄弱且无实际项目经验
  - action: 按优先级依次补强技能：先学Excel和SQL（可通过旁听商业分析课程覆盖SQL基础），Python放在最后补充；同时尽量用所学技能做项目并放入简历，使简历内容更充实
- id=1984 score=13 role=data_analyst,product_manager target=data_analyst tags=low_soft_skill_match,missing_code_review_documentation
  - title: 求职者可能以为BA和DA技能要求相似
  - action: 申请BA岗位时，在简历和面试中重点突出：用plain language解释技术细节的能力、documentation经验、跨部门协作经历，同时展示SQL和Excel的实际应用案例。
- id=2792 score=13 role=data_analyst,product_manager target=data_analyst tags=low_soft_skill_match
  - title: 求职者简历中SQL和Excel技能未通过具体业务场景体现
  - action: 在工作经历bullet point中加入ad hoc analytics需求场景：描述'接收stakeholder临时数据需求→用SQL提取数据→用Excel完成分析并输出KPI报告'，一条经历同时展示SQL、Excel及业务沟通能力。

## data_engineer
Target: Data Engineer
Keywords: ETL, data pipeline, Spark, Airflow, SQL, Python, data warehouse, AWS, Snowflake

### Flagged Current Top Rows
- #2 seg_26527 [not_role_safe] role=software_engineer,marketing,data_analyst target=backend_engineer,frontend_engineer
  - title: 求职者不清楚HR实际阅读简历的顺序和时间，可能导致最关键信息未放在显眼位置
  - action: 将Skills区放在简历显眼位置，并按类别清晰分组（如Languages、Frameworks、Tools等），确保HR在5-10秒内能快速判断候选人技术栈是否匹配岗位需求
- #4 seg_21863 [not_role_safe] role=software_engineer,data_analyst target=data_analyst
  - title: 求职者简历中ETL相关bullet point只写了"Python script"，未说明具体使用的library或工具，技术深度不足
  - action: 在ETL相关bullet point中补充具体技术term，例如使用了哪些Python library（如Pandas、PySpark、Airflow等）或工具，以提升技术可信度和关键词匹配度。
- #8 seg_18841 [not_role_safe] role=software_engineer,data_analyst target=software_engineer,software_development_engineer
  - title: 求职者简历技能列表固定不变，未根据目标岗位JD中的关键词动态调整，导致ATS匹配率低，中小型公司筛选时容易被过滤。
  - action: 用AI工具提取目标岗位JD中的关键技能词，将简历技能栏和项目经历中的技术栈词汇替换或调整顺序，使其与JD一致。例如对方要求C#则将Java移后或替换，并在project experience中相应修改技术描述，以提升关键词匹配率。

### Buried Candidate Rows
- id=328 score=13 role=software_engineer,ai_engineer,data_analyst target=backend_engineer tags=low_hard_skill_match,missing_microservices,keywords_only_in_skills
  - title: 学员技能区内容混乱且写得太少
  - action: 将技能区按6个维度分层呈现：1.Programming Languages；2.Backend Framework（如Spring Boot）；3.Database（如MySQL、PostgreSQL）；4.Cloud/DevOps（如AWS、Docker）；5.Architecture Components（如Microservices、RESTful API、Event-driven design）；6.AI/ML（如RAG、LLM工具）；删除"familiar with"等程度描述，直接列出会用的技术名称。
- id=578 score=13 role=software_engineer target=universal tags=low_hard_skill_match
  - title: 简历所有条目禁止出现主语I或we
  - action: 逐一检查每条简历内容，删除I和we，将动词改为过去式，对Python、SQL、AWS等技术词汇加粗
- id=1491 score=13 role=data_analyst target=data_analyst tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者担心简历上写「SQL清理数据」太过简单没有竞争力
  - action: 将SQL相关经历保留在简历中，但用更专业的术语表达，如用ETL（Extract, Transform, Load）来描述数据处理过程，并将SQL技能放在合适的位置顺序中；同时持续刷题提升实际水平到中级。
- id=1725 score=13 role=software_engineer,machine_learning target=backend_engineer,frontend_engineer,software_engineer,software_development_engineer tags=low_hard_skill_match
  - title: 学生四个项目清一色后端（ETL、Python、Flask）
  - action: 压缩现有项目各删一个bullet point，腾出空间新增一个与后端差异化的项目（前端、machine learning或移动端均可）；若坚持后端方向则集中投backend专项岗位。
- id=2345 score=13 role=software_engineer,data_analyst target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者写了'end-to-end data pro...
  - action: 在data pipeline的bullet point中补充：数据量级（如'processed 500K+ images'）、数据来源（如'from AWS S3 / camera feeds / internal database'）、pipeline终点（如'output to training-ready labeled dataset'），让'end-to-end'有实质内容支撑。

## manufacturing_process
Target: Manufacturing Engineer
Keywords: manufacturing, process improvement, quality, lean, six sigma, yield, root cause

### Flagged Current Top Rows
- #1 seg_26336 [role_mismatch, not_role_safe] role=software_engineer,data_analyst target=universal
  - title: 求职者的简历bullet point只写了量化结果（如提升20%），但未说明项目背景、系统用途及优化手段，HR无法判断项目的实际场景和影响力
  - action: 通过追问项目背景（系统是内部工具还是面向客户？用于什么业务流程？）来补充简历描述，将项目定位清楚地写入bullet point，例如：'Involved in optimizing a prototype system design for internal use'
- #2 seg_12485 [role_mismatch, not_role_safe] role=software_engineer target=frontend_engineer,software_engineer,software_development_engineer
  - title: 求职者项目bullet point缺乏层次结构，直接罗列细节，缺少一个总览性的第一点让HR快速理解整个项目是什么、做了什么。
  - action: 将项目的第一个bullet point作为整体summary，用一句话说明项目是什么、使用了哪些核心技术、解决了什么问题，后续bullet再展开具体技术实现与成果，例如：'Developed a cross-platform fitness tracking and campus event APP integrating QR-based features using TypeScript, React Native, and Node.js'。
- #3 seg_21863 [role_mismatch, not_role_safe] role=software_engineer,data_analyst target=data_analyst
  - title: 求职者简历中ETL相关bullet point只写了"Python script"，未说明具体使用的library或工具，技术深度不足
  - action: 在ETL相关bullet point中补充具体技术term，例如使用了哪些Python library（如Pandas、PySpark、Airflow等）或工具，以提升技术可信度和关键词匹配度。
- #4 seg_24900 [role_mismatch, not_role_safe] role=software_engineer,product_manager target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者项目描述的第一句话未能清晰说明产品类型和所属领域（domain），HR在极短时间内无法判断项目与目标岗位的匹配度，导致错失筛选机会。
  - action: 将项目描述第一句改写为明确说明「这是什么产品/系统 + 所属领域」，例如Fintech支付系统、内部运营工具等，让HR在3秒内判断domain匹配度。
- #6 seg_3928 [role_mismatch, not_role_safe] role=software_engineer target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者的项目bullet point只写了概括性描述（如'seamless interaction with Snowflake database'）
  - action: 在每条项目bullet point中明确写出具体开发的feature名称，再说明该feature的功能和实现方式，最后加上性能/测试相关结论。例如：先写product summary和impact，再展开detail，最后补充testing等细节。
- #7 seg_10084 [role_mismatch, not_role_safe] role=software_engineer,data_analyst target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者在项目中使用了Spring Boot、Google Cloud、PostgreSQL等多项技术，但简历只写3个bullet point
  - action: 梳理项目中实际使用的所有技术点，逐一检查是否在简历中有对应bullet体现；针对PostgreSQL，补充写明SQL相关工作内容（如schema设计、查询优化、stored procedure等），确保bullet数量达到4-5条
- #8 seg_6097 [role_mismatch, not_role_safe] role=software_engineer,ai_engineer,machine_learning,data_analyst target=machine_learning_engineer
  - title: 求职者技能栏内容过少，缺乏AI/ML相关关键词，无法通过ATS筛选，也难以在面试官30秒扫描中留下印象。
  - action: 将技能栏扩充为3~5个bullet，每个bullet包含5~10个技能词，重点覆盖大模型（OpenAI、GPT）、RAG/Agent、深度学习框架（PyTorch、TensorFlow、Transformer）、云技术（AWS）、开发工具（Git、Docker）等AI/ML相关关键词。
- #9 seg_25523 [role_mismatch] role=software_engineer,data_analyst target=data_analyst
  - title: 求职者的实习经历描述中缺少SQL等关键技术工具，仅有Tableau，导致简历无法匹配数据分析类岗位的ATS关键词筛选，削弱竞争力。
  - action: 在实习经历的bullet point中主动加入SQL，结合实际工作内容描述使用场景，例如用SQL进行数据提取或分析，确保技术关键词覆盖目标岗位要求。

### Buried Candidate Rows
- id=2543 score=10 role=data_analyst target=universal tags=missing_linkedin
  - title: 求职者供应链方向简历缺乏行业认可证书
  - action: 优先通过网课考取Lean Six Sigma Green Belt作为入门证书，跳过Yellow/White Belt直接从Green Belt开始；后续根据职业发展目标逐步提升至Black Belt乃至Master Black Belt；同时查阅目标岗位JD确认所需等级。
- id=22 score=7 role=machine_learning,data_analyst target=data_analyst tags=low_hard_skill_match,keywords_only_in_skills,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 数据分析岗位的经历若只写「analyzed dat...
  - action: 将数据类工作经历按以下链条拆解成3-4条bullet：①Data Collection（从哪些来源收集什么数据，用了哪些工具）；②Data Cleaning & Transformation（如何处理缺失值、格式转换、数据聚合）；③Data Analysis（用什么方法分析，发现了什么指标）；④Modeling/Scoring（是否构建评分模型、预测模型）。
- id=30 score=7 role=software_engineer,data_analyst target=universal tags=missing_portfolio
  - title: Candidate worries about c...
  - action: 无论代码质量如何，简历上始终附上GitHub链接；有链接表明你是会实际写代码的从业者
- id=211 score=7 role=data_analyst target=universal tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 候选人的医疗数据分析简历只写了通用的数据分析技能
  - action: 在医疗分析简历中明确写出data domain关键词：demographic data、inpatient、outpatient、performance metrics等；让hiring manager一眼看出领域经验
- id=767 score=7 role=data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence,vague_project_details
  - title: AB test项目bullet quality明显...
  - action: 先去认真学完AB test相关课程，真正理解后再回来重新改写这个项目描述

## mechanical_engineering
Target: Mechanical Engineer
Keywords: CAD, SolidWorks, mechanical design, FEA, manufacturing, robotics, control system

### Flagged Current Top Rows
- #1 seg_12485 [role_mismatch, not_role_safe] role=software_engineer target=frontend_engineer,software_engineer,software_development_engineer
  - title: 求职者项目bullet point缺乏层次结构，直接罗列细节，缺少一个总览性的第一点让HR快速理解整个项目是什么、做了什么。
  - action: 将项目的第一个bullet point作为整体summary，用一句话说明项目是什么、使用了哪些核心技术、解决了什么问题，后续bullet再展开具体技术实现与成果，例如：'Developed a cross-platform fitness tracking and campus event APP integrating QR-based features using TypeScript, React Native, and Node.js'。
- #2 seg_9363 [role_mismatch, not_role_safe] role=software_engineer target=frontend_engineer,software_engineer,software_development_engineer
  - title: 求职者前端简历描述过于笼统，只写了使用React，未说明具体开发了哪个页面（如购物车页面）、哪些component，以及是否使用Redux进行状态管理
  - action: 在前端React bullet中明确写出：1）具体负责的页面名称（如cart page、checkout page）；2）开发的核心component；3）使用的状态管理方案（如Redux）。例：Developed the shopping cart page using React, built CartItem and OrderSummary components, and managed cart state with Redux。
- #3 seg_10987 [role_mismatch, not_role_safe] role=software_engineer,data_analyst target=frontend_engineer,data_analyst
  - title: 求职者简历在描述前端开发工作时未明确写出所用技术栈（如React、H5等），导致技术关键词缺失，难以通过ATS筛选或让工程师评审时留下技术印象。
  - action: 在bullet point第二句起加入feature development描述，并明确嵌入技术名称：前端开发写'Developed XX pages/components using React'；若使用原生H5也可直接标注技术名称，确保关键词可见。
- #5 seg_3928 [role_mismatch, not_role_safe] role=software_engineer target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者的项目bullet point只写了概括性描述（如'seamless interaction with Snowflake database'）
  - action: 在每条项目bullet point中明确写出具体开发的feature名称，再说明该feature的功能和实现方式，最后加上性能/测试相关结论。例如：先写product summary和impact，再展开detail，最后补充testing等细节。
- #6 seg_3926 [role_mismatch, not_role_safe] role=software_engineer,ai_engineer,data_analyst target=frontend_engineer,software_engineer,software_development_engineer
  - title: 求职者的简历bullet point结构混乱，细节描述放在前面，缺乏先总后分的逻辑，且遗漏testing和internal module维护等关键信息
  - action: 按照「第一句：product summary + impact → 第二至三句：detail feature + technology → 最后句：testing、internal module/tool维护等补充」的三段式结构重写每条bullet point，将细节后置，确保首句即体现业务价值。
- #10 seg_7039 [role_mismatch, not_role_safe] role=product_manager,software_engineer target=software_engineer,software_development_engineer
  - title: 求职者项目描述只列出功能点，缺乏产品定位、impact说明、技术栈展示和testing等结构化内容，HR无法快速判断项目价值和候选人技术深度。
  - action: 将项目描述改为四段式结构：第一句描述产品功能与影响（matching + impact），第二、三句分别展示具体feature及使用的技术栈（feature detail + technology），第四句补充testing或其他工程实践，推荐写满4个bullet point。
- #11 seg_15284 [role_mismatch] role=software_engineer,data_analyst,product_manager target=product_manager
  - title: 求职者的项目描述缺乏完整叙事逻辑，只陈述功能点，未体现发现问题、分析原因、设计解决方案、产出量化结果的完整链条，HR难以感知候选人的影响力。
  - action: 按「现状痛点→数据分析→根因定位→解决方案设计→量化结果→后续优化」结构重写项目bullet point：先指出用户完成率/转化率低，再写分析出yes/no形式覆盖场景不全且流程过长，然后写开发AI预设template方案，最后以time management提升、engagement提升、conversion rate提升收尾。

### Buried Candidate Rows
- id=7198 score=20 role=mechanical_engineering target=mechanical_engineer,robotics_engineer tags=weak_target_role_alignment,low_role_specificity,missing_exact_job_title
  - title: 求职者目标暑期实习
  - action: 利用1-2月投递窗口前的剩余时间，继续推进 haptic device 项目进度，同时完善简历中该项目的描述内容，确保在正式投递前简历达到最佳状态。
- id=19065 score=20 role=mechanical_engineering target=mechanical_engineer,automotive_engineer tags=low_hard_skill_match
  - title: 求职者有SolidWorks基础但未接触过汽车行业...
  - action: 在YouTube上搜索CATIA教程，了解其基本操作（与SolidWorks大差不差），学习后将CATIA列入简历技能栏，以满足汽车硬件岗位的工具要求。
- id=8559 score=13 role=software_engineer target=software_engineer,software_development_engineer tags=low_hard_skill_match
  - title: 求职者对Solidworks有一定基础但尚未精通
  - action: 花更多时间精通Solidworks，包括其FEA、热力学、流体力学分析功能；同时补充基础coding能力，但无需像软件工程学生那样大量刷题，重点仍在工程设计软件的深度掌握上。
- id=1913 score=10 role=software_engineer target=software_engineer,software_development_engineer tags=low_jd_keyword_match
  - title: 求职者简历缺乏Solidworks和CAD相关项目经历
  - action: 将硕士期间用Solidworks画图并导入ANSYS分析的桥梁实验项目写入简历，即使项目未完成也要写上；用中文先起草后翻译成英文发给导师修改。
- id=3162 score=10 role=marketing target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者简历中的项目描述只体现了CAD画图能力
  - action: 在每个项目的bullet point中补充设计决策依据和工程约束考量，体现「design for manufacturing」和「design for assembly」的思维，而不仅仅描述使用了什么软件画了什么图。

## cloud_infrastructure
Target: Cloud Engineer
Keywords: AWS, Azure, GCP, Kubernetes, Docker, CI/CD, Terraform, Linux, networking

### Flagged Current Top Rows
- #1 seg_26527 [not_role_safe] role=software_engineer,marketing,data_analyst target=backend_engineer,frontend_engineer
  - title: 求职者不清楚HR实际阅读简历的顺序和时间，可能导致最关键信息未放在显眼位置
  - action: 将Skills区放在简历显眼位置，并按类别清晰分组（如Languages、Frameworks、Tools等），确保HR在5-10秒内能快速判断候选人技术栈是否匹配岗位需求
- #2 seg_22431 [not_role_safe] role=software_engineer,ai_engineer,data_analyst target=universal
  - title: 现在招聘流程中HR和hiring manager越来越依赖AI对简历进行摘要总结，简历若缺乏足够的技术关键词，AI汇总后信息量极低
  - action: 在项目bullet point中主动植入云服务关键词（如AWS S3、CloudFront CDN）、数据库关键词（PostgreSQL）、安全相关关键词（rate limiting、authentication），确保AI摘要时能保留技术亮点，提升简历通过机筛的概率。
- #3 seg_3928 [not_role_safe] role=software_engineer target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者的项目bullet point只写了概括性描述（如'seamless interaction with Snowflake database'）
  - action: 在每条项目bullet point中明确写出具体开发的feature名称，再说明该feature的功能和实现方式，最后加上性能/测试相关结论。例如：先写product summary和impact，再展开detail，最后补充testing等细节。
- #4 seg_19882 [not_role_safe] role=software_engineer target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者 Technical Skills 部分只有 Programming 和 Framework 两个子类别，内容过于单薄，无法充分展示技术广度
  - action: 将 Technical Skills section 扩充至 4~5 个 bullet/子类别，参考结构：Programming Languages、Frameworks、Databases、Cloud/DevOps Tools、其他（如 Message Queue、CI/CD 等）；同时参考 LinkedIn 上后端岗位 JD，将目标岗位高频技能关键词填入对应子类别。
- #5 seg_6097 [not_role_safe] role=software_engineer,ai_engineer,machine_learning,data_analyst target=machine_learning_engineer
  - title: 求职者技能栏内容过少，缺乏AI/ML相关关键词，无法通过ATS筛选，也难以在面试官30秒扫描中留下印象。
  - action: 将技能栏扩充为3~5个bullet，每个bullet包含5~10个技能词，重点覆盖大模型（OpenAI、GPT）、RAG/Agent、深度学习框架（PyTorch、TensorFlow、Transformer）、云技术（AWS）、开发工具（Git、Docker）等AI/ML相关关键词。
- #8 seg_3294 [not_role_safe, no_role_signal] role=software_engineer,product_manager,data_analyst target=backend_engineer,data_analyst
  - title: 求职者背景偏商科/风险方向，缺乏大型公司data infrastructure、system design、cloud platform等技术深度
  - action: 针对目标AI PM岗位的JD，逐条补充对应的技术知识：1）了解cloud platform组件（如elastic load balancer、cloud tools如Vercel等）；2）学习data infrastructure基础（pipeline设计、bad/good data routing）；3）掌握system design中的trade-off分析框架（cost、前后端交互、API调用）；4）将已有的data security/风险经验与岗位要求对齐并主动强调。
- #10 seg_6121 [not_role_safe] role=software_engineer,ai_engineer,machine_learning target=full_stack_engineer,machine_learning_engineer
  - title: 求职者的简历缺乏足够的大模型相关关键词，面试官扫描简历时无法在1秒内判断候选人是否具备相关经验，导致简历被忽视。
  - action: 在工作经历的bullet point和skills section中大量堆砌大模型相关关键词，包括模型名称（GPT、LLaMA、Mistral）、框架（PyTorch、HuggingFace、LangChain）、技术方向（RAG、Agent、NLP、CV）、部署工具（Docker、AWS、GCP）等，确保面试官扫一眼即可识别相关性。
- #11 seg_26145 [not_role_safe] role=software_engineer,ai_engineer,machine_learning,data_analyst target=frontend_engineer,machine_learning_engineer,software_engineer,software_development_engineer
  - title: 求职者的 relevant skills 部分内容过少，缺乏对 technical skill 的细分（如 programming、GenAI 相关工具）
  - action: 将 relevant skills 扩展至约五行，按类别细分：programming languages、technical tools、GenAI 相关技能（如 LangChain、RAG、Agent 框架等），确保覆盖目标 JD 关键词

### Buried Candidate Rows
- id=18029 score=22 role=software_engineer,machine_learning target=machine_learning_engineer tags=missing_microservices,keywords_only_in_skills
  - title: 求职者技能列表尚未完整罗列已用过的工具
  - action: 在技能列表一行写满常用工具：Git、Linux、Docker、Unity 等基础项，再补充 AWS、GCP 等云平台；已使用过的 Kubernetes、TensorFlow、Prolog 等工具按实际情况酌情添加，TensorFlow 可归入 Tools 类别一并列出。
- id=18025 score=19 role=software_engineer,data_analyst target=universal tags=keywords_only_in_skills
  - title: 求职者技能列表填写不完整
  - action: 将技能行写满，优先列出 Git、Linux、Docker、Unity 等基础工具，再补充云平台经验如 AWS、GCP、Azure；对于久未使用但有接触的工具（如 MATLAB）可暂不列入，避免面试时无法应对追问
- id=21855 score=16 role=software_engineer,ai_engineer,machine_learning,data_analyst target=software_development_engineer,machine_learning_engineer,data_analyst tags=low_hard_skill_match,keywords_only_in_skills,education_details_missing
  - title: 求职者Technical Skills部分内容过少
  - action: 将Technical Skills区块扩展为4-5个bullet，每个bullet 1-2行，分类覆盖：Programming Languages、ML/LLM相关框架、Data Science工具、SDE工具（Git、Database、Terminal/CLI）、Cloud技能（AWS/GCP/Azure）。同时删除Education中的课程列表，腾出空间
- id=26358 score=16 role=software_engineer,data_analyst target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者简历中关于原型系统的经历描述过于笼统
  - action: 将原型系统相关bullet point扩展为：1）部署到具体云平台（AWS/GCP/Azure）；2）使用Jenkins等工具搭建自动化deployment pipeline；3）编写query性能测试（如row test for query），量化查询优化效果。每条bullet point包含工具名称+行动+结果。
- id=362 score=13 role=software_engineer,product_manager target=frontend_engineer,full_stack_engineer,software_engineer,software_development_engineer tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence,vague_project_details
  - title: 学生只写了开发功能
  - action: 项目bullet的最后一行应写misc内容（deployment、测试、文档等）：包括将APP从localhost部署到云平台（AWS/GCP等）、数据收集、CI/CD等

## healthcare
Target: Clinical Research Associate
Keywords: clinical, healthcare, patient, trial, regulatory, data collection, medical

### Flagged Current Top Rows
- #6 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #9 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #11 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。

### Buried Candidate Rows
- id=8701 score=18 role=healthcare target=clinical tags=weak_experience_keyword_evidence,weak_result_orientation
  - title: 不要一份简历投所有岗位
  - action: 根据所投职位的不同，调整简历中的经历描述和技能侧重点，确保每个版本都能对应目标岗位的核心要求，尤其是临床相关职位需突出临床经历。
- id=15186 score=15 role=data_scientist,healthcare target=biostatistician,biostatistics,data_scientist tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者简历缺少目标岗位（Biostatistics...
  - action: 在简历技能或项目描述中补充与目标岗位匹配的统计模型关键词，至少体现部分STATS model相关知识，如repeated measurement、ANOVA、Bayesian methods等；改完后向导师反馈哪些模型不熟，以便针对性补强。
- id=24633 score=13 role=machine_learning target=universal tags=resume_not_tailored_to_jd
  - title: 简历要清晰展示你的目标岗位
  - action: 针对不同求职方向定制简历：申请clinical trial方向则强调数据处理量、模型构建与统计显著性结论；申请healthcare/biotech方向则强调模型准确度优化、模型对比、运行时间优化等内容
- id=5081 score=10 role=software_engineer,data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,education_details_missing
  - title: 求职者将data privacy保护混淆为cybe...
  - action: 将简历中涉及医疗数据隐私保护的描述改为data security或data privacy相关关键词，避免使用cybersecurity，除非项目中确实涉及网络攻击防御或数据传输协议等内容。
- id=5585 score=10 role=machine_learning,data_analyst target=data_analyst tags=low_hard_skill_match,low_role_specificity,resume_not_tailored_to_jd
  - title: 不要一份简历投所有岗位
  - action: 准备两个项目放入简历：①CDISC standard项目，用于申请药厂、medical device和CRO公司；②Machine learning + real world evidence项目，用于申请医院和Healthcare公司。投递不同类型公司时，按需切换对应项目，实现简历精准匹配。

## machine_learning
Target: Machine Learning Engineer Intern (MLE)
Keywords: machine learning, image generation, Stable Diffusion, SDXL, Flux, ComfyUI, Python, PyTorch, TensorFlow, model evaluation, debugging, pipeline

### Flagged Current Top Rows
- #1 seg_12483 [not_role_safe] role=machine_learning,software_engineer target=software_engineer,software_development_engineer
  - title: 求职者项目描述bullet point数量不足，未能完整呈现所做工作的各个环节，如模型训练、评估指标、技术栈等，导致项目价值无法充分展示。
  - action: 每个项目至少写3个bullet point：第一点作为整体项目summary，说明项目是什么、解决什么问题；第二点描述核心技术实现（如模型训练）；第三点补充评估或成果，例如'Evaluated model performance using F1 metrics'，将所有实际参与的工作环节都写进去。
- #6 seg_1031 [not_role_safe] role=machine_learning,data_analyst target=data_analyst
  - title: 项目描述缺乏完整的技术流程展示，没有充分体现从数据处理到特征工程到建模评估的完整pipeline，关键词覆盖不足。
  - action: 按照end-to-end的数据科学流程组织bullet：①数据规模和清洗（45K records, missing value handling）②特征选择（从232个feature降至61个，使用PCA等）③建模（random forest, logistic regression, MLP等）④评估（accuracy score），确保DS/DA方向关键词全面覆盖。
- #7 seg_4523 [not_role_safe] role=machine_learning target=universal
  - title: 求职者的研究项目描述未在标题中体现大模型相关内容，recruiter只有5秒浏览时间，无法一眼判断项目与LLM方向的相关性
  - action: 为每个项目添加明确标题，将大模型相关关键词前置于标题中，例如将研究经历改名为"大模型反训练 With Improved Mathematical Skills"，确保recruiter3秒内识别方向
- #8 seg_22807 [not_role_safe] role=machine_learning,data_analyst target=machine_learning_engineer,data_analyst,data_scientist
  - title: 求职者同一份简历中出现AI optimization specialist、machine learning engineer、data analyst int
  - action: 针对不同目标岗位制作两份简历：bullet point内容可基本保持一致，仅将每段经历的job title替换为对应方向（如MLE版本改为Machine Learning Engineer，DS版本改为Data Scientist），确保recruiter第一眼就能看出简历与目标岗位的匹配性。
- #11 seg_2480 [not_role_safe] role=machine_learning,data_analyst target=universal
  - title: 求职者的项目仅停留在数据分析层面，缺乏预测建模环节，未能充分展示机器学习技能，项目深度不足。
  - action: 在汇率项目中增加Linear Regression预测模块，预测未来5年汇率趋势；在简历bullet point中明确写入"Linear Regression"和"Python"两个关键词，并描述数据清洗处理过程及最终提供的Insights。

### Buried Candidate Rows
- id=9453 score=29 role=software_engineer,machine_learning,data_analyst target=machine_learning_engineer tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者简历未体现machine learning、...
  - action: 在简历技能列表或项目描述中补充machine learning、big data、deep learning相关工具和软件包的使用经验，即使是调用API层面的应用也应明确写出，以匹配岗位关键词筛选。
- id=1418 score=26 role=software_engineer,machine_learning,data_analyst target=machine_learning_engineer,data_analyst tags=generic_resume_positioning,resume_not_tailored_to_jd,low_role_specificity,low_hard_skill_match,weak_target_role_alignment
  - title: 不要一份简历投所有岗位
  - action: 根据申请方向定制两套简历：DA版聚焦analytics、SQL、Excel、可视化，机器学习内容少量点到即止；DS版突出建模、Python、machine learning算法、深度学习框架。同一段经历用不同角度的bullet point描述。
- id=1716 score=26 role=software_engineer,machine_learning target=backend_engineer,frontend_engineer,machine_learning_engineer,software_engineer,software_development_engineer tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者技能栏分类混乱
  - action: 将技能栏统一按属性重新分为四类：①Programming Languages；②Libraries（Tensorflow/Pytorch/Numpy等）；③Platforms & Frameworks（Flask/Redis/Spring Boot/Node.js等）；④Tools & Software（Git/Docker/IDE等），并挖掘项目经历中遗漏的库和工具补充进去。
- id=4916 score=26 role=software_engineer,machine_learning target=machine_learning_engineer tags=low_hard_skill_match,keywords_only_in_skills
  - title: 求职者目前加粗的是论文成果等内容
  - action: 优先加粗编程语言和主流深度学习框架（如PyTorch、TensorFlow），确保写入简历；metrics数字（55%、20%）可酌情加粗，但两派观点均有合理性，自行决策避免加粗过多显乱。同时注意MATLAB在大型科技企业认可度不高，以Python生态工具为主。
- id=4926 score=26 role=software_engineer,machine_learning target=machine_learning_engineer tags=low_hard_skill_match,keywords_only_in_skills
  - title: 求职者Skills分类混乱
  - action: 按工具属性重新分类Skills：第一类写Languages（Python、C++等编程语言）；第二类写Frameworks and Libraries（PyTorch等框架和库）；移除过于细节或缩写不通用的技术词（如BPE、tokenization等）。

## ai_engineer
Target: AI Engineer
Keywords: LLM, RAG, agent, fine-tuning, prompt engineering, vector database, Python, LangChain, model deployment

### Flagged Current Top Rows
- #3 seg_13616 [not_role_safe] role=ai_engineer,data_analyst,marketing target=data_analyst
  - title: 求职者的case competition项目描述偏向商科叙述，缺少数据分析相关关键词，HR快速扫描时无法识别其数据能力，导致简历与数据分析岗位关联性弱。
  - action: 在项目描述中明确写出与数据相关的关键词，例如将分析market revenue、industry growth rate等行为用数据分析语言表述，如'utilized open source data to project revenue growth'，确保HR扫描时能快速捕捉到数据分析信号。
- #5 seg_5174 [not_role_safe] role=ai_engineer,machine_learning,marketing target=universal
  - title: 求职者将AI/ML技术细节（feature correlation、LLM预测模型等）写进咨询简历，但咨询岗位的面试官不理解也不关心这些内容
  - action: 将实习bullet point中的技术描述替换为咨询语言，优先突出'market research'和'competitor landscape analysis'两个动作，用'Conducted market research and competitor landscape analysis'作为bullet point开头，再补充对应的业务发现或影响。
- #8 seg_1826 [not_role_safe] role=ai_engineer,marketing,data_analyst target=universal
  - title: 求职者在简历中使用了HyDE技术但无法清晰解释其解决的问题，同时误用了BLEU score作为RAG系统的评估指标，BLEU score本为机器翻译设计
  - action: 修改简历中RAG项目描述：1）先点明传统RAG的不足（query与answer匹配问题），再说明如何用HyDE解决；2）将BLEU score替换为precision、recall、F1、MRR或MAP等正确评估指标；3）阅读导师提供的RAG优化文档，内化chunking、OCR质量、表格处理等进阶方法。
- #11 seg_17175 [not_role_safe] role=ai_engineer,data_analyst target=universal
  - title: 求职者在Financial Analyst经历下所写的内容，与HR对该岗位职责的认知不符，造成阅读困惑，无法体现候选人真正符合岗位要求的能力。
  - action: 重新审视Financial Analyst经历下的每条bullet point，对照岗位JD调整描述方向，确保所写内容与该职位典型职责（如财务建模、数据分析、报告输出）相关联，而非堆砌无关工具操作。

### Buried Candidate Rows
- id=6069 score=27 role=ai_engineer,machine_learning,data_analyst target=universal tags=low_hard_skill_match
  - title: 求职者有Python/SQL基础但缺乏AI大模型相关项目经验
  - action: 参与自然语言转SQL项目，学习Agent架构、LLM调用及Prompt Engineering；同时考虑做RAG项目，以两个AI实战项目充实简历的技术深度。
- id=15730 score=27 role=ai_engineer,machine_learning target=universal tags=low_hard_skill_match,missing_code_review_documentation
  - title: 求职者AI基础薄弱
  - action: 依次完成三个项目：1）用LangChain调用大模型API并搭建简单应用；2）用LangChain或其他框架搭建RAG（Retrieval Augmented Generation）系统，将大模型与文档/数据结合；3）用大模型构建Agent框架，实现复杂问题的拆解与工具调用。将项目经历写入简历以大幅提升面试几率。
- id=3953 score=26 role=ai_engineer,machine_learning,marketing target=ai_engineer,machine_learning_engineer tags=weak_target_role_alignment,low_role_specificity,missing_exact_job_title
  - title: 传统ML方向（CV、NLP deploy等）对ne...
  - action: 将求职优先级聚焦在AI Engineer（大模型方向），弱化传统ML Engineer投递比重，重点突出简历中RAG、Agent、Finetuning等大模型相关项目经验。
- id=4521 score=26 role=software_engineer,ai_engineer,machine_learning target=ai_engineer,machine_learning_engineer tags=low_jd_keyword_match
  - title: 求职者不清楚大模型/AI方向岗位的核心技能要求
  - action: 以JD关键词为导向，重点评估并补强三大技能：①RAG系统（Retrieval-Augmented Generation）②Agent开发 ③大模型Post Training（SFT、RLHF、RLVR/GRPO等）；职位名称以LLM Engineer、GenAI Engineer、ML Engineer(GenAI)为主，以JD描述为准。
- id=25 score=24 role=software_engineer,ai_engineer,machine_learning target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 2024-2025年RAG系统、LLM Agent...
  - action: 将RAG/LLM类项目从简历的主要位置移开；用篇幅重点描述真实工作经历中的技术深度和业务影响。若必须保留AI项目，需突出差异化角度（独特数据集、创新评估方法、可量化的效果）而非项目类型本身。

## project_program_management
Target: Project Manager
Keywords: timeline, budget, risk management, stakeholder, Agile, Scrum, delivery, cross-functional

### Flagged Current Top Rows
- #2 seg_4716 [not_role_safe] role=universal target=product_manager
  - title: 求职者作品集case study结构不清晰，缺乏对role、platform、timeline、contribution及impact的系统性呈现
  - action: 参考优秀设计师作品集结构：每个case study开头highlight自己的role、平台、timeline和contribution，正文说明项目背景与设计内容，结尾展示impact；同时确保作品集内容与简历bullet point相互呼应，至少准备2-4个case study。
- #9 seg_7479 [not_role_safe] role=universal target=universal
  - title: 求职者教育背景模块排版顺序混乱，缩写未加点、GPA未注明满分、课程关键词首字母未大写，细节不规范影响专业度。
  - action: 教育模块按「就读时间 → 学校/机构名称（加粗）→ 专业/学位 → 地点（斜体）→ GPA → 相关课程」顺序排列；缩写后加点（如Aug.）；GPA写为3.8 out of 4.0；相关课程各词首字母大写。
- #11 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #12 seg_17178 [no_role_signal] role=universal target=universal
  - title: 求职者的due diligence相关bullet point描述过于笼统，缺少具体分析类型的关键词，HR和ATS无法识别其专业能力范围
  - action: 在due diligence相关bullet point中明确列出具体工作内容，补充关键词如：competitive landscape analysis、financial analysis、industry analysis、risk assessment，使内容具体且关键词丰富

### Buried Candidate Rows
- id=24268 score=13 role=software_engineer,product_manager,data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者有agile development和spr...
  - action: 将agile/sprint参与经历整理成具体bullet point，明确写出参与的ceremony类型（如sprint planning、retrospective等），由导师审阅后润色。
- id=448 score=10 role=machine_learning,product_manager target=data_analyst tags=low_measurable_results
  - title: 简历中的项目经历要量化成果：如果做了回归模型
  - action: 回顾项目中可量化的结果，找到具体的误差率、提升幅度或效率改善数字，写入简历；同时在描述中加入"collaborated with stakeholders"或"presented to cross-functional teams"等表达。
- id=2293 score=10 role=product_manager,marketing target=universal tags=low_soft_skill_match,missing_code_review_documentation
  - title: 求职者描述Popmart实习中的跨部门工作时
  - action: 将跨部门协作经历改写为具体行动bullet：1）'Designed SOPs and shared documents to clarify design requirements across teams'；2）'Arranged cross-functional meetings with marketing and retailing teams to communicate on product data'；3）'Gathered feedback iteratively and optimized res
- id=2725 score=10 role=marketing target=universal tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者有音乐会策划演出经历
  - action: 将音乐会经历拆解为三个bullet point模块：①选题与宣传策划（planning + content creation）；②选址、定设备、管理timeline与budget（project management）；③现场场地布置、观众引导与幕后协调（coordination & communication）。每条bullet突出技能关键词。
- id=2967 score=10 role=product_manager,data_analyst target=universal tags=low_hard_skill_match,low_soft_skill_match
  - title: 求职者的实习经历偏向助理性质（写notes、帮忙整理）
  - action: 将助理类经历重新归类为三个维度：1）硬技能：研究能力（行业报告、法律guidance、竞品分析）；2）软技能：cross-functional沟通（与HR、Legal、Compliance团队对接）；3）项目管理能力（整理会议记录、梳理项目timeline、支持senior人员）。每条bullet point用对应维度的关键词包装。

## ux_research_design
Target: UX Designer
Keywords: Figma, user research, wireframe, prototype, usability testing, design system, user journey

### Flagged Current Top Rows
- #4 seg_4867 [not_role_safe, no_role_signal] role=universal target=universal
  - title: 求职者的Summary仅陈述身份和年限，缺乏对设计理念和专业定位的表达，HR无法感知其作为Game Designer的独特视角与核心价值主张。
  - action: 将Summary改写为两三句话：首句保留身份与经验年限，后续句子点明Game Design方向，并融入个人设计理念，例如将心理学背景与玩家体验设计相结合，写出'combines analytical mindset with player psychology to craft the player experience'类似表达，体现差异化竞争力。
- #5 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #8 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #9 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。
- #10 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #11 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #12 seg_7487 [no_role_signal] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。

### Buried Candidate Rows
- id=8705 score=12 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=low_hard_skill_match,missing_portfolio
  - title: 求职者已掌握Adobe系列工具（AI、PS、Ill...
  - action: 立即学习Figma，利用已有的Adobe基础快速上手，将Figma纳入作品集制作工具链，并在简历技能栏中添加Figma，以满足UI/UX实习岗位的基本要求。
- id=8706 score=12 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=low_hard_skill_match,keywords_only_in_skills
  - title: 求职者具备基础应用工具技能
  - action: 学习Figma作为核心设计工具，利用已有Adobe基础降低学习成本，将其作为构建UI/UX portfolio和申请实习的必备技能
- id=22201 score=12 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者的项目描述缺少具体使用的设计软件和工具名称
  - action: 在项目描述中明确列出设计过程中使用的软件和系统工具（如Figma、Unity、Python等），将工具信息嵌入bullet point中以增强技术可信度
- id=22205 score=12 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=low_hard_skill_match,keywords_only_in_skills,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者的项目描述细节不足
  - action: 在bullet point中具体写明使用的工具（如Figma）以及操作方式（如利用AI生成人物角色），让描述更具可读性和说服力，避免笼统表述。
- id=7176 score=10 role=software_engineer,product_manager,data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者的项目仅完成了wireframe和prototype
  - action: 判断项目是否可写入简历时，需确认是否有实际交付成果（如上线产品、可演示原型、量化数据），仅停留在wireframe/prototype阶段且无后续的项目建议暂不列入。

## cybersecurity
Target: Cybersecurity Analyst
Keywords: security, incident response, SIEM, vulnerability, threat, risk, network security

### Flagged Current Top Rows
- #1 seg_19951 [conflict:portfolio] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #4 seg_7487 [conflict:portfolio] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #6 seg_10709 [conflict:portfolio] role=universal target=universal
  - title: 求职者用同一份简历投递不同类别的金融岗位，导致简历关键词与各岗位JD不匹配，HR看不到目标关键词，通过率低。
  - action: 按岗位大方向准备2-3份差异化简历，针对每类岗位的job description提取核心关键词并融入简历，无需为每个职位单独定制，但大方向必须覆盖到，如risk岗focus on risk相关词汇，front office岗focus on投资决策相关词汇。
- #8 seg_23091 [conflict:portfolio] role=universal target=universal
  - title: 求职者目标方向为Asset Management的Portfolio Management岗位，但简历中缺乏HR/面试官期望看到的核心内容
  - action: 在简历中补充AM行业Portfolio Management岗位的核心关键词与经历描述，包括：managed book PNL、portfolio risk management、sensitivity metrics评估、limit管理、fund performance research、investment opportunity research及trade idea committee参与等内容；如本人未实际操作过，可通过自学掌握后填入，面试时须能流畅回答相关问题。
- #9 seg_20716 [conflict:portfolio] role=universal target=universal
  - title: 求职者的会计背景虽符合目标岗位要求，但简历中缺乏与目标职位（risk、product controller、treasury等）相关的专业关键词
  - action: 根据目标岗位类型，将对应关键词嵌入简历：risk岗位写入 value at risk、stress testing；product controller岗位写入 asset classes、portfolio、PNL、performance；treasury岗位写入 financial forecasting、cash flow analysis。先确定目标岗位，再针对性补充关键词。
- #11 seg_19925 [conflict:financial analyst/accounting/portfolio] role=universal target=universal
  - title: 求职者现有简历偏向accounting（应收账款方向），但目标岗位为Financial Analyst、Risk Management等
  - action: 根据目标岗位方向重写简历内容，针对不同岗位嵌入对应关键词：Risk Management方向需体现risk valuation、stress testing、scenario analysis、sensitivity measurement；Asset Management方向需体现portfolio construction、backtesting、different asset classes等。
- #12 seg_7479 [not_role_safe] role=universal target=universal
  - title: 求职者教育背景模块排版顺序混乱，缩写未加点、GPA未注明满分、课程关键词首字母未大写，细节不规范影响专业度。
  - action: 教育模块按「就读时间 → 学校/机构名称（加粗）→ 专业/学位 → 地点（斜体）→ GPA → 相关课程」顺序排列；缩写后加点（如Aug.）；GPA写为3.8 out of 4.0；相关课程各词首字母大写。

### Buried Candidate Rows
- id=7 score=7 role=software_engineer,machine_learning target=software_engineer,software_development_engineer tags=education_details_missing
  - title: 应届生的课程区域是低风险高收益的关键词扩展区：面试...
  - action: 扩展Relevant Coursework至填满两行；可补充：Linear Algebra、Computer Networks、Image Processing、Statistical Analysis、Database Systems、Cybersecurity等相关课程（须真实修过）。
- id=103 score=7 role=machine_learning target=data_analyst tags=low_soft_skill_match
  - title: Candidate applying to bot...
  - action: 为每个项目要点写两个版本。BA版本：强调需求收集、利益相关方沟通、业务流程改进、仪表板/报告。风险版本：强调模型验证、风险指标、监管背景、投资组合敞口。事实相同；改变框架词汇。
- id=485 score=7 role=finance target=financial_analyst,investment_analyst,risk_analyst,fp_and_a tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 有金融/投资背景、希望将简历调整为适配风控岗位的求...
  - action: 选择改写方案时，根据目标职位的风控程度决定：若目标岗位风控成分适中，保留现有职位名称、仅在职责描述中增加风险相关内容即可；若目标岗位是纯风控职位，则需同时修改职位名称和职责描述，使简历整体呈现为风控定向
- id=487 score=7 role=finance target=financial_analyst,investment_analyst,risk_analyst,fp_and_a tags=short_tenure_unclear,education_details_missing
  - title: 有各类短期经历、不确定哪些可以算作正式工作经验写入...
  - action: 判断某段经历是否可以列为简历中的"work experience"时，以该公司能否支持background check（背景调查）为标准：能背调则列为internship/work experience，否则列为project
- id=692 score=7 role=data_analyst target=data_analyst tags=low_hard_skill_match
  - title: Crystal指出简历中的同一段实习经历可以从完全...
  - action: 针对每段经历，问自己：这段经历中有哪些部分可以从"投资分析"或"风险管理"的角度来讲？将operational细节替换为investment thesis、analysis、model、recommendation等框架下的描述

## industrial_quality
Target: Quality Engineer
Keywords: quality, QA, root cause, CAPA, process improvement, six sigma, inspection

### Flagged Current Top Rows
- #1 seg_26336 [role_mismatch, not_role_safe] role=software_engineer,data_analyst target=universal
  - title: 求职者的简历bullet point只写了量化结果（如提升20%），但未说明项目背景、系统用途及优化手段，HR无法判断项目的实际场景和影响力
  - action: 通过追问项目背景（系统是内部工具还是面向客户？用于什么业务流程？）来补充简历描述，将项目定位清楚地写入bullet point，例如：'Involved in optimizing a prototype system design for internal use'
- #2 seg_12485 [role_mismatch, not_role_safe] role=software_engineer target=frontend_engineer,software_engineer,software_development_engineer
  - title: 求职者项目bullet point缺乏层次结构，直接罗列细节，缺少一个总览性的第一点让HR快速理解整个项目是什么、做了什么。
  - action: 将项目的第一个bullet point作为整体summary，用一句话说明项目是什么、使用了哪些核心技术、解决了什么问题，后续bullet再展开具体技术实现与成果，例如：'Developed a cross-platform fitness tracking and campus event APP integrating QR-based features using TypeScript, React Native, and Node.js'。
- #3 seg_21863 [role_mismatch, not_role_safe] role=software_engineer,data_analyst target=data_analyst
  - title: 求职者简历中ETL相关bullet point只写了"Python script"，未说明具体使用的library或工具，技术深度不足
  - action: 在ETL相关bullet point中补充具体技术term，例如使用了哪些Python library（如Pandas、PySpark、Airflow等）或工具，以提升技术可信度和关键词匹配度。
- #4 seg_24900 [role_mismatch, not_role_safe] role=software_engineer,product_manager target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者项目描述的第一句话未能清晰说明产品类型和所属领域（domain），HR在极短时间内无法判断项目与目标岗位的匹配度，导致错失筛选机会。
  - action: 将项目描述第一句改写为明确说明「这是什么产品/系统 + 所属领域」，例如Fintech支付系统、内部运营工具等，让HR在3秒内判断domain匹配度。
- #6 seg_3928 [role_mismatch, not_role_safe] role=software_engineer target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者的项目bullet point只写了概括性描述（如'seamless interaction with Snowflake database'）
  - action: 在每条项目bullet point中明确写出具体开发的feature名称，再说明该feature的功能和实现方式，最后加上性能/测试相关结论。例如：先写product summary和impact，再展开detail，最后补充testing等细节。
- #7 seg_10084 [role_mismatch, not_role_safe] role=software_engineer,data_analyst target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者在项目中使用了Spring Boot、Google Cloud、PostgreSQL等多项技术，但简历只写3个bullet point
  - action: 梳理项目中实际使用的所有技术点，逐一检查是否在简历中有对应bullet体现；针对PostgreSQL，补充写明SQL相关工作内容（如schema设计、查询优化、stored procedure等），确保bullet数量达到4-5条
- #8 seg_6097 [role_mismatch, not_role_safe] role=software_engineer,ai_engineer,machine_learning,data_analyst target=machine_learning_engineer
  - title: 求职者技能栏内容过少，缺乏AI/ML相关关键词，无法通过ATS筛选，也难以在面试官30秒扫描中留下印象。
  - action: 将技能栏扩充为3~5个bullet，每个bullet包含5~10个技能词，重点覆盖大模型（OpenAI、GPT）、RAG/Agent、深度学习框架（PyTorch、TensorFlow、Transformer）、云技术（AWS）、开发工具（Git、Docker）等AI/ML相关关键词。
- #9 seg_8959 [role_mismatch] role=software_engineer,machine_learning,data_analyst target=universal
  - title: 求职者简历Skills区全为Financial Analysis相关技能，结构单一，只适合投FA职位，缺乏针对DA等其他方向的版本
  - action: 将Skills区重构为多个子模块：Programming、Certificate、Methodology等；同时准备至少两个简历版本（FA版和DA版），在Relevant Courses栏分别列3~4门最匹配目标岗位的课程，以适配不同投递方向。

### Buried Candidate Rows
- id=30 score=7 role=software_engineer,data_analyst target=universal tags=missing_portfolio
  - title: Candidate worries about c...
  - action: 无论代码质量如何，简历上始终附上GitHub链接；有链接表明你是会实际写代码的从业者
- id=767 score=7 role=data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence,vague_project_details
  - title: AB test项目bullet quality明显...
  - action: 先去认真学完AB test相关课程，真正理解后再回来重新改写这个项目描述
- id=1124 score=7 role=machine_learning,data_analyst,marketing target=data_analyst tags=low_measurable_results
  - title: 学生项目描述缺乏量化结果
  - action: 在描述anomaly detection等项目时加入具体量化结果，如"improve data quality by X%"或"detect X% abnormal records"
- id=1341 score=7 role=software_engineer,machine_learning,data_analyst,product_manager target=product_manager,data_analyst tags=low_soft_skill_match
  - title: 求职者实习经历bullet point结构混乱
  - action: 将DA实习经历按以下五个维度拆分bullet point：①数据采集（Python/API/database）②数据清洗（SQL/normalize）③建模分析（machine learning/SQL）④数据整合（improve data quality+量化）⑤可视化与跨部门合作（Tableau dashboard+product manager）。
- id=1664 score=7 role=software_engineer,machine_learning,data_analyst,product_manager target=product_manager,data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,low_hard_skill_match
  - title: 求职者的实习经历描述散乱
  - action: 将实习经历整理为5个结构化bullet：①数据采集（Python+API+数据库）②建模分析（SQL+machine learning）③数据整合清洗（normalize+improve data quality+量化%）④Excel分析⑤Tableau dashboard+跨部门协作（with product manager，define metrics）。

## consulting
Target: Management Consultant
Keywords: client, problem structuring, market research, Excel modeling, presentation, recommendation, stakeholder

### Flagged Current Top Rows
- #12 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容

### Buried Candidate Rows
- id=4798 score=13 role=data_analyst,product_manager,marketing target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者简历偏重技术层面（写码、数据分析）
  - action: 在简历bullet point中补充与client或跨部门合作的具体经历，如weekly sync-up、presentation、市场报告汇报等，以证明候选人具备communication能力，而不仅仅是技术能力。
- id=2386 score=10 role=data_analyst,product_manager,marketing target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者对简历中'partner with stak...
  - action: 将简历bullet point中涉及stakeholder协作的描述拆解为三层逻辑：1）接收stakeholder提出的业务问题；2）将业务问题转化为数据分析框架（translate question）；3）输出findings与recommendation。确保每条bullet能对应到实际工作场景，而非直接复制模板。
- id=2724 score=10 role=data_analyst target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,education_details_missing
  - title: 求职者的实习经历仅停留在表面描述（如"满意度调查"）
  - action: 将实习 bullet point 按三层结构撰写：第一层写 research 能力（如何设计问卷、如何做 interview）；第二层写数据分析能力（每日记录、整理归纳 survey 与 interview 结果）；第三层写从数据到 insight 再到 recommendation 的产出，最终以 presentation 形式呈现。
- id=3570 score=10 role=product_manager,marketing target=universal tags=low_soft_skill_match,weak_action_verbs
  - title: 求职者在知名美国大型建筑公司ACOM的实习描述过于简短
  - action: 将ACOM实习扩写为3~4个bullet point，分别涵盖：①具体设计工具与成果数量（如用Rhino出了多少张图）；②负责的presentation册子；③参与client meeting及coordination经历，每点均需附具体数字
- id=3782 score=10 role=data_analyst,product_manager,marketing target=universal tags=weak_target_role_alignment,education_details_missing,weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者的简历工作经历（如国泰君安）缺乏与数据分析岗...
  - action: 将每段工作经历改写为四步骤结构：①解决了什么问题；②处理了哪些数据；③识别出什么结果或结论；④如何向stakeholder呈现建议。现有经历尽量向这四个维度靠拢，同时补充课程项目或新项目来填补经历空白。

## life_sciences
Target: Bioinformatics Scientist
Keywords: bioinformatics, omics, Python, R, wet lab, assay, research, biotech

### Flagged Current Top Rows
- #9 seg_1570 [role_mismatch] role=machine_learning,data_analyst target=data_analyst
  - title: 求职者实际掌握feature engineering等技术技能，但简历项目描述中未体现这些关键词，导致ATS关键词匹配度低，250份投递仅获2次面试
  - action: 将feature engineering、EDA（exploratory data analysis）、data cleaning、data modeling、visualization等实际使用过的技术关键词补充进项目bullet point；按照实际操作流程（数据清洗→EDA→特征工程→模型选择→可视化）重新组织描述
- #11 seg_5969 [role_mismatch] role={"universal"} target={"universal"}
  - title: 求职者投递超过1800份简历但面试转化率极低（HR screening仅12-13个），反映简历未针对不同JD做定制化匹配，导致大量简历在筛选阶段即被淘汰。
  - action: 停止纯海投策略，针对每个目标岗位的JD关键词对简历进行定制化调整，确保简历中的技能描述、经历表述与JD用词高度匹配，提升ATS通过率及HR关注度。

### Buried Candidate Rows
- id=2989 score=16 role=healthcare,data_scientist target=healthcare_analytics,biotech_data_scientist,clinical_data tags=generic_resume_positioning
  - title: 求职者有两段Healthcare实习经历
  - action: 根据目标岗位准备多版简历：申healthcare/CRO方向时重点突出两段healthcare实习及clinical data相关项目；申tech biotech方向时加入machine learning相关项目（用Python/R实现）；申药厂方向时补充CD相关项目。同时删除2018年过期的research assistant经历。
- id=61 score=13 role=software_engineer target=universal tags=weak_experience_keyword_evidence,vague_project_details
  - title: Candidate describes resea...
  - action: 对每个研究项目，确定技术或应用相关的2-3个行业，并明确说明；这使一个项目能与多种类型的招聘经理产生共鸣
- id=153 score=13 role=data_analyst,business_analyst target=data_analyst,business_analyst tags=low_hard_skill_match,keywords_only_in_skills,weak_experience_keyword_evidence,weak_result_orientation
  - title: Student had policy/govern...
  - action: 将政策、政府、军事或学术经历翻译成DA/BA简历时，去掉所有特定组织的缩写（如INDOPACOM、联合国集群名称、军事单位编号）和政策术语。用以下内容替换：你使用的数据（类型、规模）、你执行的分析（方法、工具），以及输出是什么（报告、模型、建议）。DA/BA招聘经理不知道INDOPACOM是什么，也不会去查——术语浪费空间并表明经历没有被翻译。
- id=972 score=13 role=data_analyst target=data_analyst tags=education_details_missing
  - title: 求职者将public health researc...
  - action: 将项目按四步重构：①收集清洗数据；②分析各城市health status及驱动因素（如education level等）；③加权计算综合health score；④基于可视化结果提出policy recommendation。
- id=1766 score=13 role=software_engineer,machine_learning,data_analyst target=data_analyst tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者不熟悉Jupyter Notebook
  - action: 学习并使用Jupyter Notebook完成数据项目，将代码运行结果、数据探索过程（如head/tail输出）、可视化图表保存为HTML格式，便于展示和存档。

## data_scientist
Target: Data Scientist
Keywords: Python, R, SQL, statistical modeling, A/B testing, machine learning, experimentation, visualization

### Flagged Current Top Rows
- #1 seg_19951 [not_role_safe] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #3 seg_9077 [not_role_safe] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。
- #5 seg_4438 [not_role_safe] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #6 seg_7487 [not_role_safe] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #7 seg_21665 [not_role_safe] role=universal target=universal
  - title: 求职者倾向于只投纯金融买方/卖方岗位，忽略了保险资管等具有相关性的岗位，而自身已有相关工作经验，理应拓宽投递范围。
  - action: 在保持核心目标岗位的同时，将保险资管、liability driven investment等相关机构纳入投递范围，充分利用已有的relevant working experience提升录取概率。
- #9 seg_4149 [not_role_safe] role=universal target=universal
  - title: 求职者简历缺乏足够的行业关键词，在中大型公司投递时容易被ATS机器筛选直接过滤，无法进入HR人工审阅环节。
  - action: 根据目标岗位（FA或HR方向）在技能区及工作经历中主动补充相关专业关键词。FA方向补充：Financial Analysis、Portfolio Management、DCF、Financial Modeling等；HR方向补充对应HR专业术语，确保关键词覆盖目标JD中的核心词汇。
- #10 seg_5969 [role_mismatch] role={"universal"} target={"universal"}
  - title: 求职者投递超过1800份简历但面试转化率极低（HR screening仅12-13个），反映简历未针对不同JD做定制化匹配，导致大量简历在筛选阶段即被淘汰。
  - action: 停止纯海投策略，针对每个目标岗位的JD关键词对简历进行定制化调整，确保简历中的技能描述、经历表述与JD用词高度匹配，提升ATS通过率及HR关注度。
- #11 seg_6807 [not_role_safe] role=universal target=universal
  - title: 求职者简历项目过多且偏长，部分项目与目标岗位（CDM相关）关联度低，稀释了简历的针对性和重点。
  - action: 从简历中筛选出2-3个与目标岗位最相关、质量最高的项目重点展示，其余项目移至作品集网站；与目标岗位无关的项目（如environment项目）可单独制作一份简历版本使用。

### Buried Candidate Rows
- id=2989 score=21 role=healthcare,data_scientist target=healthcare_analytics,biotech_data_scientist,clinical_data tags=generic_resume_positioning
  - title: 求职者有两段Healthcare实习经历
  - action: 根据目标岗位准备多版简历：申healthcare/CRO方向时重点突出两段healthcare实习及clinical data相关项目；申tech biotech方向时加入machine learning相关项目（用Python/R实现）；申药厂方向时补充CD相关项目。同时删除2018年过期的research assistant经历。
- id=1159 score=18 role=machine_learning,data_analyst,marketing target=data_analyst,data_scientist,business_analyst tags=low_hard_skill_match,keywords_only_in_skills
  - title: 学生技术基础较薄弱（ML未学、Python尚在补）...
  - action: 将求职目标明确定位为Data Analyst相关岗位，简历和技能补充方向围绕分析能力（SQL、Python基础、可视化、AB测试）展开，暂不追求Data Scientist职位。
- id=446 score=16 role=machine_learning,data_analyst target=data_analyst tags=low_hard_skill_match
  - title: 对于数据类岗位（DA/DS/DE）
  - action: 对照这6个核心技能检查自己的简历和项目，找出哪些已覆盖、哪些缺失；为缺失项制定学习计划或在项目中补充体现。
- id=449 score=16 role=machine_learning target=data_analyst tags=low_hard_skill_match,keywords_only_in_skills
  - title: 有金融背景但目标是数据岗的候选人
  - action: 审视简历中的项目，选择最能体现金融知识的一个保留，其他项目替换成能体现SQL、Python、AB test、ML的数据项目；这样既保留finance加分点，又满足data岗位的核心要求。
- id=1012 score=16 role=software_engineer,machine_learning,data_analyst target=data_analyst tags=low_measurable_results
  - title: 求职者的实习经历描述混杂多种工作内容
  - action: 将实习bullet point按技能维度重构为4-5条：①数据采集（Python/API/数据库）②SQL查询和machine learning建模③数据清洗整合（提升数据质量X%）④Excel分析⑤Tableau dashboard可视化+跨部门协作。每条尽量加入量化结果。

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
- id=20425 score=13 role=universal target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者描述实习工作内容时用语模糊（如"辅助性工作"...
  - action: 回忆每段工作经历时，明确回答"做了什么具体操作"、"操作对象是什么"、"产出是什么"，将模糊表述转化为可写入简历的具体动作，如"定期整理税务相关法规更新"应写为"Compiled monthly regulatory updates on R&D super deduction to ensure policy compliance"。
- id=11372 score=10 role=software_engineer,ai_engineer,data_analyst target=data_analyst tags=missing_code_review_documentation
  - title: 求职者的实习项目实际内容较模糊、公司需求不明确
  - action: 为简历中的RAG/AI项目设定一个清晰的内部应用场景，例如：为real estate公司员工构建policy文档检索工具，帮助撰写报告时快速查询当地政策，避免手动检索耗时，使项目背景具体可信
- id=11461 score=10 role=data_analyst target=data_analyst,business_analyst tags=weak_summary_role_alignment,missing_portfolio
  - title: 求职者有意向投行（IB）
  - action: 将金融求职目标分三层规划：①冲刺层：IB、M&A（踮脚可及）；②匹配层：Asset Management、Portfolio Management、Global Research、Equity Research（够得着）；③保底层：Risk Management、Financial Analyst、Operations、Compliance（稳妥）。同时可探索DA/BA等科技交叉岗位。

## policy_public_sector
Target: Policy Analyst
Keywords: policy, public sector, research, stakeholder, legislation, impact analysis, brief

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=7371 score=13 role=product_manager,data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者的项目经历描述缺乏具体行动和结构
  - action: 将项目bullet point拆分为三层：1）访谈关键利益相关者（如'Interviewed 3 key stakeholders to better understand the problem statement'）；2）研究覆盖范围（如'Researched EV charging policies across 4 states, identifying gaps between current and ideal policies'）；3）产出成果（如'Created an X-page report w
- id=23792 score=13 role=marketing target=marketing,marketing_analyst,digital_marketing,marketing_research tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者简历中的bullet point只写了通用职...
  - action: 按项目维度重新梳理每段经历：先明确该项目要达成的目的，再列出为达成该目的所做的具体事项，形成'目的+行动'结构的bullet point。
- id=153 score=10 role=data_analyst,business_analyst target=data_analyst,business_analyst tags=low_hard_skill_match,keywords_only_in_skills,weak_experience_keyword_evidence,weak_result_orientation
  - title: Student had policy/govern...
  - action: 将政策、政府、军事或学术经历翻译成DA/BA简历时，去掉所有特定组织的缩写（如INDOPACOM、联合国集群名称、军事单位编号）和政策术语。用以下内容替换：你使用的数据（类型、规模）、你执行的分析（方法、工具），以及输出是什么（报告、模型、建议）。DA/BA招聘经理不知道INDOPACOM是什么，也不会去查——术语浪费空间并表明经历没有被翻译。
- id=972 score=10 role=data_analyst target=data_analyst tags=education_details_missing
  - title: 求职者将public health researc...
  - action: 将项目按四步重构：①收集清洗数据；②分析各城市health status及驱动因素（如education level等）；③加权计算综合health score；④基于可视化结果提出policy recommendation。
- id=2293 score=10 role=product_manager,marketing target=universal tags=low_soft_skill_match,missing_code_review_documentation
  - title: 求职者描述Popmart实习中的跨部门工作时
  - action: 将跨部门协作经历改写为具体行动bullet：1）'Designed SOPs and shared documents to clarify design requirements across teams'；2）'Arranged cross-functional meetings with marketing and retailing teams to communicate on product data'；3）'Gathered feedback iteratively and optimized res

## product_manager
Target: Product Manager
Keywords: roadmap, PRD, user research, A/B testing, stakeholder, metrics, launch, cross-functional

### Flagged Current Top Rows
- #4 seg_24763 [not_role_safe] role=product_manager,data_analyst target=universal
  - title: 求职者的项目描述缺乏明确的目标用户群体定位，且未体现量化影响力（如用户规模、healthcare领域impact），导致bullet point缺乏说服力。
  - action: 在项目bullet point中明确写出目标用户群体（如"for elderly users"），并补充量化成果，例如真实用户数量（七八百家数据）或healthcare领域的具体影响，使每条bullet point具备"功能+用户+impact"结构。

### Buried Candidate Rows
- id=8654 score=26 role=product_manager,data_analyst target=product_manager,data_analyst tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者项目经历中未体现产品规划能力
  - action: 在项目描述中补充：build产品roadmap（如Q1/Q2里程碑规划），以及与设计团队合作使用Figma进行UI/UX设计，体现cross-functional协作能力和产品全周期管理经验。
- id=3310 score=23 role=software_engineer,product_manager,data_analyst target=product_manager,data_analyst tags=missing_priority_keywords,low_role_specificity,missing_linkedin
  - title: 求职者对AI PM岗位实际做什么尚不清晰
  - action: 在LinkedIn上搜索至少10个AI Product Manager职位，仔细阅读JD，归纳高频关键词（如roadmap、cross-functional、data-driven等），再将自身过往经历与这些关键词对齐，删除不相关内容，补充匹配项。
- id=4656 score=23 role=product_manager,software_engineer target=product_manager tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence,vague_project_details
  - title: 应届生普遍缺乏产品文档（BRD/PRD）撰写经验
  - action: 学习并理解BRD（Business Requirement Document）和PRD（Product Requirement Document）的结构与用途：BRD由业务方撰写描述需求，PRD由产品经理撰写包含问题场景、解决方案及Success Metrics；可通过实习项目或课程项目练习撰写PRD，在简历或面试中展示文档落地能力。
- id=16396 score=23 role=software_engineer,product_manager,data_analyst target=product_manager,data_analyst tags=low_soft_skill_match
  - title: 求职者简历中缺乏与产品经理（PM）合作开发feat...
  - action: 在工作经历的最后一条bullet point中补充与PM合作开发新feature、共同规划product roadmap的经历，以体现跨职能协作能力和沟通能力。
- id=1664 score=20 role=software_engineer,machine_learning,data_analyst,product_manager target=product_manager,data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,low_hard_skill_match
  - title: 求职者的实习经历描述散乱
  - action: 将实习经历整理为5个结构化bullet：①数据采集（Python+API+数据库）②建模分析（SQL+machine learning）③数据整合清洗（normalize+improve data quality+量化%）④Excel分析⑤Tableau dashboard+跨部门协作（with product manager，define metrics）。

## sales_customer_success
Target: Account Executive
Keywords: quota, pipeline, CRM, Salesforce, account management, cold outreach, negotiation, revenue

### Flagged Current Top Rows
- #1 seg_8566 [conflict:verilog] role=universal target=universal
  - title: 求职者简历中芯片设计项目过多，若目标是转嵌入式方向，大量芯片设计项目（如Verilog架构设计、physical design、floor planning）对
  - action: 将简历中芯片设计相关项目压缩至最多1-2个，优先保留与嵌入式直接相关的内容（如PCB design、microcontroller、IoT数据采集），删除或改写纯数字芯片设计描述（如Verilog架构、floor planning），整理后压缩至一页并发Word版本供进一步修改。
- #7 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #10 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #11 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。

### Buried Candidate Rows
- id=6197 score=13 role=data_analyst,marketing target=data_analyst tags=low_hard_skill_match
  - title: 求职者对Salesforce（CRM工具）不熟悉
  - action: 在YouTube搜索"Salesforce for sales demo"视频，注册Salesforce免费账号进行实操体验，理解CRM在销售pipeline管理、客户跟进阶段记录等核心用途，并将Salesforce等知名analytics工具写入简历。
- id=6199 score=13 role=data_analyst target=data_analyst tags=low_hard_skill_match,low_soft_skill_match,keywords_only_in_skills
  - title: 求职者简历目前缺乏CRM工具经验
  - action: 学习Salesforce基础操作，包括Sales Pipeline追踪、Cold Call后的Follow-up记录、客户谈判阶段管理等功能，并将其加入简历技能列表或工作经历描述中。
- id=21 score=10 role=data_analyst target=data_analyst tags=low_hard_skill_match,weak_target_role_alignment,education_details_missing
  - title: 很多候选人忽视将行业专有工具（Bloomberg、...
  - action: 检查所有使用过的专业工具：数据/金融类（Pitchbook、Bloomberg、Crunchbase、Refinitiv）、BI工具（Tableau、Power BI）、CRM（Salesforce）等均应写入Skills的Tools & Software栏目，或在相关经历的bullet中提及。
- id=9635 score=10 role=data_analyst,marketing target=universal tags=education_details_missing,low_measurable_results
  - title: 求职者缺乏各营销渠道的基础实操技能
  - action: 考取Google Analytics证书以建立网站campaign分析能力；了解Marketo、Salesforce等主流CRM/Email marketing工具的基本功能；补充社交媒体数据分析（点赞、互动等指标）、视频/图片编辑基础技能，以及Google ADS付费广告投放的基本逻辑，不需每项精通但需大概了解。
- id=10809 score=10 role=software_engineer,machine_learning,data_analyst target=data_analyst tags=low_measurable_results
  - title: 求职者实习中涉及上市公司财务数据分析
  - action: 将简历中金融数据分析的bullet point改写为：使用Python收集并清洗三家上市公司的财务报表数据（revenue、cost of goods sold等），并利用线性回归模型预测股价，以MAPE指标评估预测精度，体现工具+方法+量化结果的完整链条。

## sustainability_environment
Target: Sustainability Analyst
Keywords: ESG, sustainability, climate, carbon, policy, reporting, impact analysis

### Flagged Current Top Rows
- #2 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #5 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #6 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。
- #10 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #11 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #12 seg_7487 [no_role_signal] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。

### Buried Candidate Rows
- id=6833 score=10 role=marketing,data_analyst target=data_analyst tags=education_details_missing
  - title: 求职者的课程项目涵盖financial和envir...
  - action: 明确项目的核心分析角度（environmental sustainability vs. financial sustainability），将项目标题改写为能体现行业+分析视角的组合，例如"Sustainability Analysis on Fast Food Industry"，并在描述中突出environmental贡献这一差异化卖点
- id=14933 score=10 role=data_analyst target=data_analyst tags=missing_linkedin
  - title: 经济学背景求职者不清楚应该用哪些关键词搜索匹配自身的职位
  - action: 在LinkedIn/招聘平台使用三类关键词组合搜索：1）'data analyst'；2）'economic analyst'（不要写consulting）；3）'investment analyst' + 'natural gas'/'ESG'/'carbon market'等垂直领域词，逐一筛选匹配职位。
- id=15092 score=10 role=data_analyst target=data_analyst tags=keywords_only_in_skills
  - title: 求职者ESG相关简历缺乏具体framework关键...
  - action: 主动研究ESG领域常见framework（如TNFD及其他标准），选择1-2个自己能深入了解的，添加到相关实习经历或技能栏中，以提升简历与ESG岗位JD的关键词匹配度。
- id=15094 score=10 role=data_analyst target=data_analyst tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者有多个项目经历
  - action: 从现有项目中优先保留与ESG/sustainability主题最相关、且时间较近（记忆清晰、细节可补充）的项目；对入选项目逐一评估可植入的技术工具关键词，确保每条bullet point体现实际使用的数据处理工具。
- id=15113 score=10 role=data_analyst target=data_analyst tags=weak_target_role_alignment
  - title: 求职者背景涵盖policy research与ESG相关经历
  - action: 将简历中与policy、ESG相关的经历保留，定向投递ESG Consulting类岗位（包括大公司和小型ESG Consulting公司），同时关注analyst、program manager、project manager等职位类型，充分利用consulting导向的背景优势。

## trading_quant
Target: Quantitative Analyst
Keywords: Python, statistical modeling, portfolio, risk, backtesting, financial markets, time series

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=270 score=13 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=generic_resume_positioning,low_role_specificity,missing_portfolio
  - title: 候选人用一份简历投递各类风险管理岗位
  - action: 根据目标岗位调整简历重点：Fraud/AML/Credit Risk等合规类要强调RCSA/control framework；Data Risk/Portfolio Risk等技术类要强调Python和modeling
- id=3460 score=13 role=data_analyst target=universal tags=missing_portfolio
  - title: 简历要清晰展示你的目标岗位
  - action: 将80%求职精力集中投递Credit Risk Analyst、Portfolio Risk Analyst、Risk Modeling等岗位；确保简历中保留并突出roll rate、vintage、early warning等关键词；强化SQL技能作为加分项。
- id=3478 score=13 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=missing_portfolio
  - title: 求职者同时申请Credit Risk、Fraud/...
  - action: 为三个方向分别准备简历版本：Credit Risk版强调portfolio monitoring、delinquency、default、PD/LGD/EAD、roll rate、vintage等；Fraud/AML版强调fraud detection、transaction monitoring、AML、KYC、suspicious activity、pattern anomaly monitoring；Risk Consulting版强调internal control、process improvement、
- id=3479 score=13 role=finance,operations target=risk_consulting,risk_analyst,operations tags=low_soft_skill_match,keywords_only_in_skills,generic_resume_positioning
  - title: 求职者简历中Python及quantitative...
  - action: 针对Risk Consulting方向，将简历中Python、statistical modeling等技术描述弱化或移至技能列表次要位置，工作经历bullet point改为突出internal control、RCSA、control framework、process improvement、governance、regulatory compliance等关键词，体现咨询思维与风险治理能力。
- id=9450 score=13 role=software_engineer target=universal tags=missing_priority_keywords,low_jd_keyword_match,generic_resume_positioning,weak_target_role_alignment,resume_not_tailored_to_jd
  - title: 不要一份简历投所有岗位
  - action: 以一份主简历为模板，针对每个职位要求做定向修改：岗位强调Python则扩展Python相关经历，压缩或删除无关内容；岗位强调risk/statistics则突出time series等相关项目经历。

## operations
Target: Operations Analyst
Keywords: process optimization, KPI, workflow, cross-functional, efficiency, cost reduction, operations

### Flagged Current Top Rows
- #6 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #8 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #9 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。
- #11 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #12 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度

### Buried Candidate Rows
- id=3479 score=15 role=finance,operations target=risk_consulting,risk_analyst,operations tags=low_soft_skill_match,keywords_only_in_skills,generic_resume_positioning
  - title: 求职者简历中Python及quantitative...
  - action: 针对Risk Consulting方向，将简历中Python、statistical modeling等技术描述弱化或移至技能列表次要位置，工作经历bullet point改为突出internal control、RCSA、control framework、process improvement、governance、regulatory compliance等关键词，体现咨询思维与风险治理能力。
- id=10782 score=10 role=ai_engineer,data_analyst,marketing target=data_analyst tags=weak_action_verbs
  - title: 求职者简历中采购相关经历描述过于笼统宽泛
  - action: 将采购经历拆分为独立bullet point，结构为：Manage procurement process for operations, including collecting purchase requirements, comparing multiple suppliers, selecting optimal vendors, and making purchase orders to enhance supply chain efficiency；同时补充历史数据参考（如去年支出40万、业务增长15%
- id=12501 score=10 role=software_engineer,data_analyst target=software_engineer,software_development_engineer tags=low_hard_skill_match,missing_microservices,missing_code_review_documentation,low_measurable_results,weak_action_verbs
  - title: 求职者bullet point只写职责描述
  - action: 将每条bullet point改写为「技术工具/方法 + 具体行动 + 量化成果」结构，一句话带完所有关键信息。例：Engineer a document automation platform using C#, .NET, SQL Server with rule-based workflow, boosting operational efficiency by 25%。
- id=13592 score=10 role=ai_engineer,data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者的简历bullet point只描述技术方法和分析过程
  - action: 将每条bullet point改写为「分析/技术行动 + 建议/决策 + 量化business impact」结构，impact方向可从四个角度入手：提高收入（revenue）、提升效率（efficiency）、降低成本（cost reduction）、提高准确率（accuracy）。争取至少一半的bullet point带有business impact。
- id=13594 score=10 role=software_engineer,machine_learning target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 数据/分析岗位的求职者不知道如何将技术工作转化为可...
  - action: 从以下四个维度思考并量化每条bullet point的business impact：1）提高收入（revenue increase）；2）提升效率（efficiency，如节省多少工时/时间）；3）降低成本（cost reduction）；4）提高准确率（accuracy improvement）。结合实际工作场景套用最贴切的维度。

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
- id=3795 score=23 role=accounting target=accountant,auditor,tax_consultant tags=weak_result_orientation,weak_action_verbs,low_measurable_results,education_details_missing
  - title: 求职者的会计相关经历仅笼统写"识别accounti...
  - action: 在会计版本简历中，将bullet point具体化，体现USGAAP与IFRS的区别，如研发费用在USGAAP下必须记入R&D而不能费用化转移，通过具体准则条款展示专业能力。
- id=3799 score=23 role=accounting target=accountant,auditor,tax_consultant tags=low_role_specificity
  - title: 不要一份简历投所有岗位
  - action: 根据目标岗位制作不同版本简历：投BA/DA岗位时删除Corporate Governance经历，并补充数据相关项目；投Accounting岗位时保留该经历并体现US GAAP专业知识
- id=3800 score=23 role=accounting target=accountant,auditor,tax_consultant tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,weak_experience_keyword_evidence,weak_result_orientation
  - title: 求职者Accounting方向简历仅泛泛提及「评估...
  - action: 在Accounting版简历中，具体写出US GAAP与IFRS的实质性差异知识点（如折旧摊销、费用化处理规则），并将其体现在项目经历的具体分析内容中

## communications_pr
Target: Public Relations Specialist
Keywords: public relations, communications, press release, media relations, content, stakeholder, writing

### Flagged Current Top Rows
- #3 seg_5969 [role_mismatch] role={"universal"} target={"universal"}
  - title: 求职者投递超过1800份简历但面试转化率极低（HR screening仅12-13个），反映简历未针对不同JD做定制化匹配，导致大量简历在筛选阶段即被淘汰。
  - action: 停止纯海投策略，针对每个目标岗位的JD关键词对简历进行定制化调整，确保简历中的技能描述、经历表述与JD用词高度匹配，提升ATS通过率及HR关注度。
- #4 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #5 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #7 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #8 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #10 seg_10394 [not_role_safe] role=universal target=universal
  - title: 学生完成了项目实操练习，但尚未将项目经历整理成简历语言，需要导师协助将技术细节转化为简历bullet point。
  - action: 将当前简历和项目细节的中英文版本一并发给导师，由导师协助调整措辞后放入正式简历。
- #12 seg_21665 [no_role_signal] role=universal target=universal
  - title: 求职者倾向于只投纯金融买方/卖方岗位，忽略了保险资管等具有相关性的岗位，而自身已有相关工作经验，理应拓宽投递范围。
  - action: 在保持核心目标岗位的同时，将保险资管、liability driven investment等相关机构纳入投递范围，充分利用已有的relevant working experience提升录取概率。

### Buried Candidate Rows
- id=2017 score=10 role=product_manager,marketing target=universal tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者有实际做过网站内容撰写的经历
  - action: 将关键词研究流程写入简历：先自行brainstorming产品特点得出seed keywords列表，再用SEO工具验证各关键词的搜索volume，最终根据数据选定高价值关键词指导产品描述撰写，并在results中量化网页流量提升幅度（如30%-40%）。
- id=2019 score=10 role=data_analyst,marketing target=universal tags=weak_experience_keyword_evidence,weak_result_orientation
  - title: 学生实习内容少（仅发2个post）、manager指导不足
  - action: 按content planning、execution、copy writing、image editing、performance review等维度拆解实际工作内容，即使产出有限，也要将所有参与环节逐一写入简历，使social media这段经历在简历上呈现丰富度。
- id=173 score=7 role=marketing target=universal tags=missing_portfolio
  - title: Marketing候选人简历缺乏作品集链接
  - action: 在简历名字下方添加portfolio链接，让面试官直接看到过往作品；适用于content marketing、digital marketing等创意岗位
- id=448 score=7 role=machine_learning,product_manager target=data_analyst tags=low_measurable_results
  - title: 简历中的项目经历要量化成果：如果做了回归模型
  - action: 回顾项目中可量化的结果，找到具体的误差率、提升幅度或效率改善数字，写入简历；同时在描述中加入"collaborated with stakeholders"或"presented to cross-functional teams"等表达。
- id=782 score=7 role=data_analyst,product_manager,marketing target=data_analyst tags=low_soft_skill_match
  - title: 候选人制造业实习只强调了"画图"
  - action: 加入"collaborate with operation manager to monitor EV production process"，最后加visualization

## it_support
Target: IT Support Specialist
Keywords: ticketing, troubleshooting, help desk, Windows, Linux, network, hardware, customer support

### Flagged Current Top Rows
- #1 seg_7872 [conflict:hardware] role=universal target=universal
  - title: 求职者简历中与硬件相关的技能条目偏少，core skills未能充分覆盖目标JD中的关键词，导致HR无法快速判断匹配度，简历被刷掉风险高。
  - action: 对照目标岗位的job description，逐一检查自己已掌握但未写入简历的技能，将示波器等实验仪器、testing等实操经验补充至Hardware技能栏；确保core skills与JD关键词匹配度达到60%以上。
- #4 seg_19951 [no_role_signal, conflict:portfolio] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #6 seg_6303 [role_mismatch] role={"universal"} target={"universal"}
  - title: 求职者简历未针对目标岗位的具体技能要求进行定制，需要根据职位描述调整简历内容，使技能与岗位需求高度匹配。
  - action: 对照目标职位的 job description，识别岗位所需的核心技能关键词，将简历中相关经历和技能描述与之对齐，确保简历语言与职位要求高度吻合。
- #7 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #8 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。
- #9 seg_19340 [no_role_signal] role=universal target=universal
  - title: 导师通过阅读CITI岗位JD，判断该职位属于前台80%、中台20%的销售支持性质岗位，求职者需要据此调整简历内容侧重点，而非用通用版本投递。
  - action: 阅读目标岗位JD首句话判断岗位前中后台比例，识别核心关键词（如analytical、transactional、client support、source），再针对性改写简历bullet point，使经历描述与岗位性质匹配。
- #10 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。

### Buried Candidate Rows
- id=12972 score=10 role=software_engineer,data_analyst target=universal tags=low_hard_skill_match
  - title: 简历中仅写"Desktop application"
  - action: 将简历中"Desktop application"改为"Windows Desktop application"，以明确技术背景与平台适用性，避免歧义。
- id=7 score=7 role=software_engineer,machine_learning target=software_engineer,software_development_engineer tags=education_details_missing
  - title: 应届生的课程区域是低风险高收益的关键词扩展区：面试...
  - action: 扩展Relevant Coursework至填满两行；可补充：Linear Algebra、Computer Networks、Image Processing、Statistical Analysis、Database Systems、Cybersecurity等相关课程（须真实修过）。
- id=758 score=7 role=data_analyst target=universal tags=formatting_penalty_triggered
  - title: 候选人在不同OS/设备上看到的简历格式不一样
  - action: 确保简历PDF在不同平台（Windows/Mac/PDF viewer）显示一致；提交时始终用PDF格式
- id=895 score=7 role=machine_learning target=machine_learning_engineer,data_analyst tags=weak_target_role_alignment,low_role_specificity,missing_exact_job_title
  - title: 候选人有PyTorch经验
  - action: 如果目标是DA岗位，不要强调PyTorch或neural network；这些是DS的技能，会让你的定位模糊
- id=1417 score=7 role=software_engineer,machine_learning,data_analyst target=machine_learning_engineer,data_analyst tags=keywords_only_in_skills
  - title: 求职者在DA版简历中出现了PyTorch等深度学习框架关键词
  - action: DA版简历中删除PyTorch、neural network等DS专属关键词；保留SQL、Excel、Python（数据处理层面）、Tableau/Power BI等DA核心技能；DS版简历才放PyTorch、CNN、机器学习算法等内容。

## research_academic
Target: Research Assistant
Keywords: research, literature review, experiment, data analysis, publication, methodology, grant

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=364 score=10 role=marketing target=universal tags=low_role_specificity,low_soft_skill_match,low_measurable_results,weak_target_role_alignment
  - title: 学生简历排序不当
  - action: 把实习经历放最前面（最重要），research/publications放后；针对event management和marketing方向挑选关键词融入简历，展示该方向的能力
- id=1307 score=10 role=data_analyst target=data_analyst tags=generic_resume_positioning,resume_not_tailored_to_jd,low_role_specificity,formatting_penalty_triggered
  - title: 不要一份简历投所有岗位
  - action: 将已发表的研究单独列为「Publication」专栏，让HR在扫简历时能第一时间注意到，提升简历亮点的可见度。
- id=1462 score=10 role=data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_target_role_alignment,education_details_missing
  - title: 导师考虑将AI实习经历包装成logistic方向以...
  - action: 放弃将AI实习强行包装成logistic方向；保留data analysis的通用描述，但不要深入某个求职者不熟悉的垂直行业，确保所有内容在面试中都能自洽解释。
- id=1513 score=10 role=data_analyst,product_manager target=data_analyst tags=low_soft_skill_match,low_jd_keyword_match,short_tenure_unclear
  - title: 当前简历中含有大量AI相关关键词
  - action: 对照目标岗位JD，将Neura实习的描述从AI/research方向改写为data analysis和requirement gathering方向，删除JD中未出现的AI关键词，补充运营和沟通相关的关键词。
- id=1750 score=10 role=software_engineer,machine_learning,data_analyst target=data_analyst tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者参与的项目中有自主开发的评分模型（team...
  - action: 将项目中自己参与开发的评分体系（如fit score、VC tier score、team score）写入简历项目描述，只要能解释清楚逻辑和trade-off即可，无需自己独立写代码；通过这一写法将简历定位从纯research转向research+data analysis的middle ground。

## business_operations
Target: Business Operations Manager
Keywords: operations, business process, KPI, stakeholder, cross-functional, process improvement, reporting

### Flagged Current Top Rows
- #2 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #4 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #5 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。
- #7 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #8 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #10 seg_7487 [no_role_signal] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #11 seg_11739 [no_role_signal] role=universal target=universal
  - title: 求职者将research experience单独列出，但咨询公司更看重commercial能力而非学术研究，独立列出反而稀释重点
  - action: 将research experience与professional project合并，在介绍时简要提及：'在Yale期间参与了若干faculty主导的项目以及Yale医学院的研究'，不需单独强调研究经历，以commercial导向为主。
- #12 seg_21665 [no_role_signal] role=universal target=universal
  - title: 求职者倾向于只投纯金融买方/卖方岗位，忽略了保险资管等具有相关性的岗位，而自身已有相关工作经验，理应拓宽投递范围。
  - action: 在保持核心目标岗位的同时，将保险资管、liability driven investment等相关机构纳入投递范围，充分利用已有的relevant working experience提升录取概率。

### Buried Candidate Rows
- id=20490 score=13 role=data_analyst,product_manager,marketing target=data_analyst tags=low_hard_skill_match,low_soft_skill_match,low_role_specificity,weak_target_role_alignment,missing_exact_job_title
  - title: 求职者在修改简历前未明确目标岗位所需核心技能
  - action: 在修改简历前先拆解目标岗位核心能力：1）marketing business sense；2）技术技能如SQL和数据表格分析；3）软技能包括presentation、communication、reporting；4）跨组协作能力（cross-functional stakeholder collaboration），再逐条对应简历内容进行改写。
- id=448 score=10 role=machine_learning,product_manager target=data_analyst tags=low_measurable_results
  - title: 简历中的项目经历要量化成果：如果做了回归模型
  - action: 回顾项目中可量化的结果，找到具体的误差率、提升幅度或效率改善数字，写入简历；同时在描述中加入"collaborated with stakeholders"或"presented to cross-functional teams"等表达。
- id=2293 score=10 role=product_manager,marketing target=universal tags=low_soft_skill_match,missing_code_review_documentation
  - title: 求职者描述Popmart实习中的跨部门工作时
  - action: 将跨部门协作经历改写为具体行动bullet：1）'Designed SOPs and shared documents to clarify design requirements across teams'；2）'Arranged cross-functional meetings with marketing and retailing teams to communicate on product data'；3）'Gathered feedback iteratively and optimized res
- id=2387 score=10 role=data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,education_details_missing
  - title: 求职者在描述'build and maintain...
  - action: 在dashboard/reporting相关bullet中补充：1）定义了哪些KPI/metrics；2）如何确保计算逻辑跨周期一致（consistent performance tracking）；3）准确性保障措施。例：Defined and standardized 10+ KPIs in Power BI dashboards, ensuring consistent calculation logic and accurate weekly performance tracking across team
- id=2792 score=10 role=data_analyst,product_manager target=data_analyst tags=low_soft_skill_match
  - title: 求职者简历中SQL和Excel技能未通过具体业务场景体现
  - action: 在工作经历bullet point中加入ad hoc analytics需求场景：描述'接收stakeholder临时数据需求→用SQL提取数据→用Excel完成分析并输出KPI报告'，一条经历同时展示SQL、Excel及业务沟通能力。

## hospitality_events
Target: Event Planner
Keywords: event, hospitality, vendor, guest experience, coordination, budget, operations

### Flagged Current Top Rows
- #4 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #6 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #7 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。
- #9 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #10 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #11 seg_11739 [no_role_signal] role=universal target=universal
  - title: 求职者将research experience单独列出，但咨询公司更看重commercial能力而非学术研究，独立列出反而稀释重点
  - action: 将research experience与professional project合并，在介绍时简要提及：'在Yale期间参与了若干faculty主导的项目以及Yale医学院的研究'，不需单独强调研究经历，以commercial导向为主。
- #12 seg_21665 [no_role_signal] role=universal target=universal
  - title: 求职者倾向于只投纯金融买方/卖方岗位，忽略了保险资管等具有相关性的岗位，而自身已有相关工作经验，理应拓宽投递范围。
  - action: 在保持核心目标岗位的同时，将保险资管、liability driven investment等相关机构纳入投递范围，充分利用已有的relevant working experience提升录取概率。

### Buried Candidate Rows
- id=7702 score=13 role=data_analyst,marketing target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者在event执行中产出了SOP文件并迭代更新
  - action: 在event planning相关bullet point中加入SOP产出这一成果，说明SOP覆盖的活动站数或使用范围，体现从单次执行到可复用流程建立的能力跃迁
- id=2000 score=10 role=data_analyst target=data_analyst tags=low_soft_skill_match
  - title: 学生课外活动经历描述过于笼统（too general）
  - action: 先写一句高层级总述（如管理多少人、部门职能），再逐条展开具体职责：如预算管理、招募流程、活动策划等；每条用量化数字支撑，如"Raised 50K budget by collaborating with local vendors"；完成初稿后用ChatGPT润色。
- id=2725 score=10 role=marketing target=universal tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者有音乐会策划演出经历
  - action: 将音乐会经历拆解为三个bullet point模块：①选题与宣传策划（planning + content creation）；②选址、定设备、管理timeline与budget（project management）；③现场场地布置、观众引导与幕后协调（coordination & communication）。每条bullet突出技能关键词。
- id=3058 score=10 role=marketing,data_analyst target=data_analyst tags=weak_action_verbs
  - title: 求职者将新东方直播实习经历描述为零散任务（联系校友、做访谈）
  - action: 将直播实习经历重新包装为端到端的Event Planning流程：从选主题、招募Guest Speaker、设计Engagement Mechanism，到现场Coordination及突发情况处理，突出overall campaign planning与coordination skills；同时补充量化数据，如直播场次（可写超过10场）、观看人数、评论数等。
- id=4454 score=10 role={"sports_management","event_management"} target={"sports_management","event_operations"} tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者对国内赛事管理实习经历的可用性存在疑虑
  - action: 将重庆足球协会赛事管理实习纳入简历，强调组织整场比赛流程的实际操作经验，即使规模或背景与北美不同，仍属真实可量化的相关经历，应主动包装而非淡化。

## hr_recruiting
Target: Human Resources Specialist
Keywords: recruiting, onboarding, HRIS, employee relations, Workday, talent acquisition, screening

### Flagged Current Top Rows
- #3 seg_5969 [role_mismatch] role={"universal"} target={"universal"}
  - title: 求职者投递超过1800份简历但面试转化率极低（HR screening仅12-13个），反映简历未针对不同JD做定制化匹配，导致大量简历在筛选阶段即被淘汰。
  - action: 停止纯海投策略，针对每个目标岗位的JD关键词对简历进行定制化调整，确保简历中的技能描述、经历表述与JD用词高度匹配，提升ATS通过率及HR关注度。
- #4 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #5 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #6 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。
- #7 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #8 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #9 seg_7487 [no_role_signal] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #10 seg_11739 [no_role_signal] role=universal target=universal
  - title: 求职者将research experience单独列出，但咨询公司更看重commercial能力而非学术研究，独立列出反而稀释重点
  - action: 将research experience与professional project合并，在介绍时简要提及：'在Yale期间参与了若干faculty主导的项目以及Yale医学院的研究'，不需单独强调研究经历，以commercial导向为主。

### Buried Candidate Rows
- id=1326 score=7 role=data_analyst target=data_analyst tags=missing_linkedin
  - title: 求职者依赖传统网申
  - action: 在LinkedIn搜索目标公司的「talent recruiting」「hiring」等关键词，主动加好友并留言，附上简历；同时在LinkedIn上搜索独立猎头，主动联系，直接绕过ATS系统。
- id=2640 score=7 role=software_engineer,data_analyst target=business_analyst,data_analyst tags=low_hard_skill_match,keywords_only_in_skills,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者HR实习经历缺乏具体分析项目
  - action: 在HR实习简历中增加onboarding分析项目：使用SQL从内部数据库提取新员工入职数据，分析哪些training因素能提升员工工作效率，将分析结论量化呈现在简历bullet point中
- id=3234 score=7 role=data_analyst target=data_analyst tags=missing_relocation_signal
  - title: 简历要清晰展示你的目标岗位
  - action: 了解招聘流程各阶段时长（内部讨论约1周、HR准备JD并发布约数周），据此合理设定求职时间预期，不要因等待过久而焦虑或放弃。
- id=5137 score=7 role=software_engineer,data_analyst target=frontend_engineer tags=keywords_only_in_skills,education_details_missing
  - title: 求职者将Skills放在简历较靠后位置
  - action: 对于Newgrads，将Skills板块移至Education板块上方或紧随其后的显眼位置，并按Language、Framework/Tools、Database等分类列出。
- id=7908 score=7 role=universal target=universal tags=weak_target_role_alignment,low_role_specificity,missing_exact_job_title,education_details_missing
  - title: 求职者已到4月中旬才开始准备summer实习
  - action: 立即投递现有简历争取summer实习机会；同时做好心理预期——若summer留局，需在大四开学前全力准备秋季recruiting season，将求职列为最高优先级，投入百分之百甚至两倍精力。

## journalism_media
Target: Data Journalist
Keywords: journalism, storytelling, data visualization, reporting, editing, audience, research

### Flagged Current Top Rows
- none

### Buried Candidate Rows
- id=2060 score=10 role=data_analyst,product_manager,marketing target=universal tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者背景缺乏金融相关实习和项目经历
  - action: 针对金融中后台（风控、financial reporting、treasury、operation）方向，简历上需补充金融相关经历：一是将现有实习经历向金融方向改写，二是增加金融相关项目（如了解bond/equity等金融产品、风险敏感性分析、investment research等内容的项目）
- id=2830 score=10 role=marketing target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 求职者的活动项目经历描述过于笼统
  - action: 将活动经历改写为：①明确target audience（如武汉45-60岁中老年群体）②描述所做research方法（线上调查+线下访问）③呈现得出的insight（中老年群体不信任线上广告）④说明基于insight的策略决策（选择线下社区活动形式），最后附上活动results数据。
- id=3203 score=10 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=missing_portfolio
  - title: 求职者的作品集项目只是展示最终成品
  - action: 在每个项目页面中加入文字说明，描述：1）使用的工具与材质（如ZBrush、texture处理方式）；2）创作过程中的research与努力；3）受到哪些reference影响，以storytelling方式呈现完整创作故事，让观众记住你的作品。
- id=3400 score=10 role=product_manager,marketing target=universal tags=weak_experience_keyword_evidence,weak_result_orientation
  - title: 求职者的实习经历包含大量琐碎杂事
  - action: 将实习经历按新产品上市项目的完整流程重新串联：第一步competitor research、第二步target audience research、第三步IP合作选择、第四步KOL/social执行，形成从前期调研到落地执行的完整链条，体现全程参与的项目管理能力。
- id=5198 score=10 role=software_engineer,data_analyst,marketing target=universal tags=keywords_only_in_skills
  - title: 求职者简历Skills区以Python等编程工具为主
  - action: 将Skills区重新排序：第一行放Analytical Tools（Market Research、Competitive Analysis、Data Analysis、Data Visualization、Statistical Analysis、Data Cleaning），第二行才放Programming Tools；弱化或不单独突出Python等纯技术工具。

## actuarial
Target: Actuarial Analyst
Keywords: actuarial, risk modeling, Excel, R, Python, pricing, reserving, insurance

### Flagged Current Top Rows
- #10 seg_5969 [role_mismatch] role={"universal"} target={"universal"}
  - title: 求职者投递超过1800份简历但面试转化率极低（HR screening仅12-13个），反映简历未针对不同JD做定制化匹配，导致大量简历在筛选阶段即被淘汰。
  - action: 停止纯海投策略，针对每个目标岗位的JD关键词对简历进行定制化调整，确保简历中的技能描述、经历表述与JD用词高度匹配，提升ATS通过率及HR关注度。

### Buried Candidate Rows
- id=72 score=13 role=machine_learning,data_analyst target=data_analyst tags=low_hard_skill_match,keywords_only_in_skills
  - title: Candidate and mentor are...
  - action: 对四个工具进行自我评估（1-5分）：(1)Excel——数据透视表、SUMIF/COUNTIF/VLOOKUP/INDEX-MATCH、跨表公式；(2)SQL——SELECT/JOIN/GROUP BY/子查询；(3)Python——pandas、matplotlib、sklearn基础；(4)Tableau/PowerBI——仪表板构建、计算字段；找出评分最低的工具，从那里开始
- id=155 score=13 role=software_engineer,data_analyst target=universal tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: Student had listed tools...
  - action: 在每个实际使用工具的要点中说明具体工具：在使用Excel的要点中提及Excel，在运行Python的地方提及Python，在查询数据库的地方提及SQL，在构建可视化的地方提及Tableau/Power BI。不要将所有工具只集中在技能部分——ATS系统对整个文档的关键词频率评分，人工审阅者希望看到工具在语境中（你如何使用它们），而不只是列出。目标是每个主要工具至少出现两次：一次在技能中，一次在要点中。
- id=434 score=13 role=data_analyst target=universal tags=low_jd_keyword_match
  - title: 对于Financial Planning & An...
  - action: 明确FP&A求职技能优先级：先巩固Excel高级技能（pivot table、函数公式），再学SQL基础，Tableau/Power BI作为加分项；Python暂时不是优先项。
- id=450 score=13 role=software_engineer,machine_learning,data_analyst target=data_analyst tags=low_hard_skill_match,low_soft_skill_match
  - title: 一份完整的数据岗位简历应覆盖：Python/SQL...
  - action: 用这5个维度检查简历覆盖度：①Python/SQL ②AB test ③机器学习 ④可视化工具 ⑤跨部门协作；针对缺失的维度，在现有经历描述中补充或增加相关项目。
- id=1005 score=13 role=data_analyst target=data_analyst tags=keywords_only_in_skills
  - title: 求职者用于投DA岗位的简历缺乏DA必备关键词（SQ...
  - action: 在DA简历的实习经历中明确体现SQL、Python、Excel、Tableau或Power BI、跨部门协作（works with other functions）这五类关键词，优先出现在工作经历bullet point中。

## education
Target: Instructional Designer
Keywords: curriculum, instructional design, learning, training, assessment, student, LMS

### Flagged Current Top Rows
- #8 seg_5969 [role_mismatch] role={"universal"} target={"universal"}
  - title: 求职者投递超过1800份简历但面试转化率极低（HR screening仅12-13个），反映简历未针对不同JD做定制化匹配，导致大量简历在筛选阶段即被淘汰。
  - action: 停止纯海投策略，针对每个目标岗位的JD关键词对简历进行定制化调整，确保简历中的技能描述、经历表述与JD用词高度匹配，提升ATS通过率及HR关注度。
- #9 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。

### Buried Candidate Rows
- id=140 score=10 role=software_engineer,machine_learning,marketing target=data_analyst tags=low_hard_skill_match,keywords_only_in_skills,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: Data science student had...
  - action: 将欺诈检测ML经历框架为三层架构：(1)数据层——"使用SQL查询从MySQL数据库检索交易记录"；(2)建模层——"应用分类模型（指定：逻辑回归、随机森林、XGBoost）预测欺诈概率"；(3)验证层——"使用统计显著性测试验证模型结果，评估性能改进是否具有统计意义"。说明具体的模型类型和统计测试（如适用）。
- id=157 score=10 role=machine_learning target=universal tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: Student had exchange rate...
  - action: 对于涉及时间序列或截面数据的经济或金融研究项目，将叙事重新框架为：(1)识别哪些经济特征（变量）影响结果（汇率、GDP、资产价格）；(2)应用线性回归基于这些特征预测未来值；(3)生成关于哪些驱动因素具有最强预测关系的洞察。这种框架将要点从"我研究了汇率"转变为"我构建了使用特征分析和线性回归的汇率走势预测模型"。
- id=656 score=10 role=ai_engineer,machine_learning target=universal tags=low_hard_skill_match,education_details_missing
  - title: 学生不确定应该补哪些LLM项目才能让简历在AI岗位...
  - action: 优先完成三类LLM项目并写入简历：(1)RAG检索增强生成，(2)AI Agent/MCP工具调用，(3)大模型fine-tuning/post-training
- id=1063 score=10 role=machine_learning,data_analyst target=data_analyst tags=weak_summary_role_alignment
  - title: 不要一份简历投所有岗位
  - action: 制作两版简历：精算版（现版）和数据分析版；数据版需修改objective statement去掉actuarial student改为data science方向；移除精算考试相关内容；加入SQL项目experience；将精算项目的bullet point关键词调整为更偏数据分析的表述。
- id=1601 score=10 role=data_analyst,product_manager target=universal tags=low_jd_keyword_match,low_role_specificity,resume_not_tailored_to_jd
  - title: 求职者目标岗位横跨教育科技、高等教育、企业培训三个方向
  - action: ①先做一份包含所有经历的完整长版简历（不限页数）；②根据目标岗位保存三个针对性版本：instructional design版、教育科技版、数据分析/大学版；③每个版本用对应JD中的关键词替换通用描述词（如将'learning designer'替换为目标公司JD中的具体职位名称）。

## other
Target: General Resume
Keywords: resume, summary, skills, experience, project, keyword, ATS

### Flagged Current Top Rows
- #9 seg_1570 [role_mismatch] role=machine_learning,data_analyst target=data_analyst
  - title: 求职者实际掌握feature engineering等技术技能，但简历项目描述中未体现这些关键词，导致ATS关键词匹配度低，250份投递仅获2次面试
  - action: 将feature engineering、EDA（exploratory data analysis）、data cleaning、data modeling、visualization等实际使用过的技术关键词补充进项目bullet point；按照实际操作流程（数据清洗→EDA→特征工程→模型选择→可视化）重新组织描述

### Buried Candidate Rows
- id=23 score=19 role=data_analyst target=data_analyst tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 很多学生保留Leadership和Activiti...
  - action: 评估简历是否需要Leadership版块：若Education + Work Experience + Projects已能填满一页，直接删去Leadership/Activities；若有空白需要填充，可保留1行社团干事或志愿者经历。
- id=1297 score=19 role=machine_learning target=data_analyst tags=low_hard_skill_match,keywords_only_in_skills,weak_experience_keyword_evidence,vague_project_details
  - title: 求职者同时申请DS和DA
  - action: 若同时申请DS岗位，需在简历中增加更多machine learning相关内容和项目经历，以满足DS职位的技能要求。
- id=1577 score=19 role=data_analyst target=data_analyst,business_analyst tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,low_hard_skill_match,keywords_only_in_skills
  - title: 求职者简历内容与目标岗位JD要求不匹配
  - action: 搜索3个以上目标岗位（GIS data analyst、business analyst），阅读qualification和experience部分，提炼共性技能要求（SQL、Python、data visualization、statistical methods），对照自身项目经历更新简历关键词，确保匹配度达到70%-80%。
- id=1782 score=19 role=data_analyst target=universal tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者将Skills放在简历靠前位置
  - action: 调整简历版块顺序为：教育背景第一、工作经历第二、项目经历简化后第三、Skills放最后；重点精力投入工作经历的亮点挖掘与细节撰写。
- id=2296 score=19 role=design_creative target=graphic_designer,ux_designer,ui_designer,designer tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,weak_experience_keyword_evidence,weak_result_orientation
  - title: 求职者纠结于是否提交排版更美观的简历版本
  - action: 始终提交内容清晰、关键词完整的纯文本版简历（第一版），而非花哨排版版；同时在简历中附上 portfolio 网址，帮助招聘者直观感受作品，弥补纯文字简历的视觉局限

## social_services
Target: Social Worker
Keywords: case management, counseling, community, client, assessment, care plan, mental health

### Flagged Current Top Rows
- #10 seg_19346 [no_role_signal] role=universal target=universal
  - title: 求职者的项目经历缺乏一句话概括性的summary bullet point，无法让HR快速了解项目规模、团队协作及核心产出。
  - action: 将项目summary bullet point改写为：团队规模 + 合作对象 + 核心行动 + 项目规模/金额，例：Led a team of four and collaborated with professor to conduct an end-to-end real estate development plan on a $10M commercial site in Fort Worth, Texas。
- #11 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容

### Buried Candidate Rows
- id=25788 score=10 role=universal target=universal tags=short_tenure_unclear
  - title: 求职者认为实习时间短（一个月）且工作内容普通
  - action: 梳理实习中涉及 client onboarding、credit assessment、compliance 等工作，尽量量化（如一个月 onboarded 20 个客户），不要自我限制 bullet point 数量，将所有相关经历展示出来。
- id=1459 score=7 role=software_engineer,ai_engineer,data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results,education_details_missing
  - title: 销售实习的bullet缺乏结构
  - action: 采用总分结构：先写一句总领（assisted fund managers with daily business development and sales tasks），再展开具体子项；嵌入sales专业术语如lead research、cold calls、touch base emails、relationship maintenance等。
- id=1460 score=7 role=data_analyst target=data_analyst tags=weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者在sales intern经历中想写nego...
  - action: 删除negotiation相关描述，替换为实习生实际可参与的工作，如参加client meeting、记录会议纪要、维护客户关系等；确保每条bullet与实习生身份匹配。
- id=1631 score=7 role=software_engineer,data_analyst,product_manager target=data_analyst tags=low_soft_skill_match,missing_priority_keywords,missing_linkedin
  - title: 求职者LinkedIn实习bullet只有3条且过于简单
  - action: 将LinkedIn实习bullets扩展至5-8条，加入：business requirement gathering、data filtering/query条件、report呈现形式（PPT/Dashboard）、host meeting/client interaction、collaborate/coordinate等关键词；使用更专业的技术词汇如SQL query、data extraction。
- id=2443 score=7 role=data_analyst target=universal tags=low_soft_skill_match
  - title: 不要一份简历投所有岗位
  - action: 删除与数据无关的 leadership 和 community engagement 两段经历，保留原有4段数据相关经历，补充一段 AB 测试项目和一段电商客户预测分析项目，使简历共6段且全部与数据分析岗位高度相关

## civil_construction
Target: Construction Manager
Keywords: construction, site, project schedule, budget, AutoCAD, safety, contractor

### Flagged Current Top Rows
- #6 seg_19925 [conflict:financial analyst/accounting] role=universal target=universal
  - title: 求职者现有简历偏向accounting（应收账款方向），但目标岗位为Financial Analyst、Risk Management等
  - action: 根据目标岗位方向重写简历内容，针对不同岗位嵌入对应关键词：Risk Management方向需体现risk valuation、stress testing、scenario analysis、sensitivity measurement；Asset Management方向需体现portfolio construction、backtesting、different asset classes等。
- #7 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #12 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容

### Buried Candidate Rows
- id=24404 score=13 role=software_engineer,machine_learning target=data_analyst tags=resume_not_tailored_to_jd
  - title: 求职者参与AI视觉识别项目
  - action: 将项目bullet point聚焦于自身实际贡献：分析AI视觉识别模型的准确率、功能验证及应用场景落地，而非算法开发本身；可写"Analyzed accuracy and functionality of AI visual recognition model applied to construction site safety compliance"
- id=326 score=7 role=software_engineer target=software_engineer,software_development_engineer tags=weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 学员在简历中写了"improve search e...
  - action: 简历上只写自己能清楚解释来源的量化数字；无法量化时改用定性描述（如"基于用户budget偏好排序，改善搜索用户体验"）；每个数字都要能说出"我们用什么方法测量的、基准是什么、怎么得到的"；不要因为别人建议加数字就随意填写无法支撑的数据。
- id=1913 score=7 role=software_engineer target=software_engineer,software_development_engineer tags=low_jd_keyword_match
  - title: 求职者简历缺乏Solidworks和CAD相关项目经历
  - action: 将硕士期间用Solidworks画图并导入ANSYS分析的桥梁实验项目写入简历，即使项目未完成也要写上；用中文先起草后翻译成英文发给导师修改。
- id=2000 score=7 role=data_analyst target=data_analyst tags=low_soft_skill_match
  - title: 学生课外活动经历描述过于笼统（too general）
  - action: 先写一句高层级总述（如管理多少人、部门职能），再逐条展开具体职责：如预算管理、招募流程、活动策划等；每条用量化数字支撑，如"Raised 50K budget by collaborating with local vendors"；完成初稿后用ChatGPT润色。
- id=2725 score=7 role=marketing target=universal tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,weak_result_orientation,weak_action_verbs,low_measurable_results
  - title: 求职者有音乐会策划演出经历
  - action: 将音乐会经历拆解为三个bullet point模块：①选题与宣传策划（planning + content creation）；②选址、定设备、管理timeline与budget（project management）；③现场场地布置、观众引导与幕后协调（coordination & communication）。每条bullet突出技能关键词。

## procurement
Target: Purchasing Agent
Keywords: procurement, vendor, sourcing, purchase order, negotiation, supply chain, cost savings

### Flagged Current Top Rows
- #3 seg_19951 [no_role_signal] role=universal target=universal
  - title: 求职者的实习经历仅体现了财务记账和账单处理能力，未挖掘其中涉及客户信用评估（credit worthiness）和坏账风险管理的相关经验
  - action: 在accounts receivable相关的bullet point中，补充描述对客户信用状况的评估行为，例如审查客户的信用记录、处理chargeback及insufficient fund情况，体现'know your customer'及信用风险识别能力，以匹配credit risk相关岗位要求。
- #4 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #6 seg_9077 [no_role_signal] role=universal target=universal
  - title: 求职者简历中复合词（如'world-building'）的连字符使用不确定，若拼写或格式有误会影响专业观感，且可能影响ATS关键词匹配。
  - action: 逐一核查简历中所有复合专业术语的标准写法，例如确认'world-building'是否需要连字符，确保与行业通用写法一致，避免因拼写错误被HR或ATS扣分。
- #7 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #8 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #9 seg_7487 [no_role_signal] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #10 seg_11739 [no_role_signal] role=universal target=universal
  - title: 求职者将research experience单独列出，但咨询公司更看重commercial能力而非学术研究，独立列出反而稀释重点
  - action: 将research experience与professional project合并，在介绍时简要提及：'在Yale期间参与了若干faculty主导的项目以及Yale医学院的研究'，不需单独强调研究经历，以commercial导向为主。
- #11 seg_21665 [no_role_signal] role=universal target=universal
  - title: 求职者倾向于只投纯金融买方/卖方岗位，忽略了保险资管等具有相关性的岗位，而自身已有相关工作经验，理应拓宽投递范围。
  - action: 在保持核心目标岗位的同时，将保险资管、liability driven investment等相关机构纳入投递范围，充分利用已有的relevant working experience提升录取概率。

### Buried Candidate Rows
- id=10782 score=16 role=ai_engineer,data_analyst,marketing target=data_analyst tags=weak_action_verbs
  - title: 求职者简历中采购相关经历描述过于笼统宽泛
  - action: 将采购经历拆分为独立bullet point，结构为：Manage procurement process for operations, including collecting purchase requirements, comparing multiple suppliers, selecting optimal vendors, and making purchase orders to enhance supply chain efficiency；同时补充历史数据参考（如去年支出40万、业务增长15%
- id=4154 score=10 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=education_details_missing,weak_target_role_alignment
  - title: 求职者以为Coursework只能填学校正式课程
  - action: 在Coursework区域填写与目标岗位（FA/Supply Chain）相关的课程，包括线上自学课程；面试官不会核查成绩单，只会询问学到了什么
- id=4668 score=10 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=low_jd_keyword_match,missing_priority_keywords,weak_target_role_alignment,missing_exact_job_title
  - title: 求职者面向Supply Chain Analyst...
  - action: 分开准备两版简历，但内容无需大幅改动，主要调整职位Title使其与目标岗位更贴近，例如面向物流/供应链岗位时将Title改为Logistics Engineer，以提升关键词匹配度。
- id=14866 score=10 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=missing_priority_keywords,keywords_only_in_skills,weak_target_role_alignment,low_hard_skill_match,low_jd_keyword_match
  - title: 求职者简历缺乏与目标岗位匹配的关键词
  - action: 在简历中补充与Supply Chain/PM岗位相关的关键词和技能描述，确保HR在初筛时能快速识别并向Hiring Manager传达候选人具备岗位所需技能。
- id=14868 score=10 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=education_details_missing
  - title: 求职者希望转行至PM或supply chain岗位
  - action: 在简历中尽量凸显与PM或supply chain相关的经验，哪怕是间接经验也需包装体现；同时通过考取相关证书（如PMP、Lean Six Sigma）填补经验空白，确保至少能通过HR初筛关卡。