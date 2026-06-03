# Role Retrieval Audit

Generated: 2026-06-02T23:01:53.706Z

## Summary
- finance (finance_accounting, positions=45): top=12, flags=0, buried=5
- hardware_electrical (engineering_hardware, positions=35): top=12, flags=1, buried=5
- supply_chain_logistics (business_ops, positions=32): top=12, flags=4, buried=5
- design_creative (design_creative, positions=27): top=12, flags=3, buried=5
- business_analysis (business_ops, positions=22): top=12, flags=4, buried=5
- manufacturing_process (engineering_hardware, positions=18): top=12, flags=11, buried=5
- cloud_infrastructure (tech, positions=16): top=12, flags=9, buried=5
- ux_research_design (design_creative, positions=13): top=12, flags=6, buried=5
- industrial_quality (engineering_hardware, positions=12): top=12, flags=11, buried=5
- consulting (business_ops, positions=11): top=12, flags=1, buried=5
- data_scientist (data, positions=8): top=12, flags=5, buried=5
- trading_quant (finance_accounting, positions=8): top=12, flags=0, buried=5
- accounting (finance_accounting, positions=6): top=12, flags=0, buried=5

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
- id=19925 score=20 role=accounting,finance,trading_quant target=financial_analyst,risk_analyst,asset_management tags=low_role_specificity,missing_portfolio
  - title: 求职者现有简历偏向accounting（应收账款方向）
  - action: 根据目标岗位方向重写简历内容，针对不同岗位嵌入对应关键词：Risk Management方向需体现risk valuation、stress testing、scenario analysis、sensitivity measurement；Asset Management方向需体现portfolio construction、backtesting、different asset classes等。
- id=23958 score=20 role=finance target=financial_analyst,investment_analyst,risk_analyst,fp_and_a tags=weak_target_role_alignment,low_role_specificity,missing_exact_job_title
  - title: 求职者背景为生物工程
  - action: 拓宽投递方向，搜索关键词包括Corporate Finance、Healthcare Finance、Advisory、M&A、Healthcare Equity等，增加目标岗位覆盖范围，同时优先考虑IB及Advisory方向（相比纯医药金融BC更有希望）。
- id=485 score=17 role=finance target=financial_analyst,investment_analyst,risk_analyst,fp_and_a tags=weak_result_orientation,weak_action_verbs,low_measurable_results,weak_experience_keyword_evidence
  - title: 有金融/投资背景、希望将简历调整为适配风控岗位的求...
  - action: 选择改写方案时，根据目标职位的风控程度决定：若目标岗位风控成分适中，保留现有职位名称、仅在职责描述中增加风险相关内容即可；若目标岗位是纯风控职位，则需同时修改职位名称和职责描述，使简历整体呈现为风控定向

## hardware_electrical
Target: Hardware Engineer
Keywords: Verilog, RTL, FPGA, PCB, circuit, simulation, VLSI, EDA, lab

### Flagged Current Top Rows
- #6 seg_4874 [not_role_safe] role=universal target=universal
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
- #7 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #9 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #10 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #12 seg_7487 [no_role_signal] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。

### Buried Candidate Rows
- id=10782 score=26 role=procurement,supply_chain_logistics target=procurement_specialist,purchasing_agent,supply_chain_analyst tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者简历中采购相关经历描述过于笼统宽泛
  - action: 将采购经历拆分为独立bullet point，结构为：Manage procurement process for operations, including collecting purchase requirements, comparing multiple suppliers, selecting optimal vendors, and making purchase orders to enhance supply chain efficiency；同时补充历史数据参考（如去年支出40万、业务增长15%
- id=4154 score=23 role=supply_chain_logistics,finance target=supply_chain_analyst,procurement_specialist,financial_analyst tags=education_details_missing,weak_target_role_alignment
  - title: 求职者以为Coursework只能填学校正式课程
  - action: 在Coursework区域填写与目标岗位（FA/Supply Chain）相关的课程，包括线上自学课程；面试官不会核查成绩单，只会询问学到了什么
- id=14868 score=15 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=education_details_missing
  - title: 求职者希望转行至PM或supply chain岗位
  - action: 在简历中尽量凸显与PM或supply chain相关的经验，哪怕是间接经验也需包装体现；同时通过考取相关证书（如PMP、Lean Six Sigma）填补经验空白，确保至少能通过HR初筛关卡。
- id=14873 score=15 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=low_role_specificity
  - title: 不要一份简历投所有岗位
  - action: 明确告知目标岗位方向（如supply chain或PM），再由导师根据方向针对性润色简历；可同时提供多个方向供导师参考
- id=14889 score=15 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=short_tenure_unclear,education_details_missing,weak_target_role_alignment
  - title: 求职者倾向于PM方向而非supply chain
  - action: 根据自身时间安排决定是否考取PMP；若短期以求职为优先，可先专注简历修改和投递，待入职后再考虑PMP以支持晋升

## design_creative
Target: Graphic Designer
Keywords: portfolio, Adobe, Figma, visual design, brand identity, layout, typography, PDF

### Flagged Current Top Rows
- #2 seg_4867 [not_role_safe] role=design_creative target=game_designer
  - title: 求职者的Summary仅陈述身份和年限，缺乏对设计理念和专业定位的表达，HR无法感知其作为Game Designer的独特视角与核心价值主张。
  - action: 将Summary改写为两三句话：首句保留身份与经验年限，后续句子点明Game Design方向，并融入个人设计理念，例如将心理学背景与玩家体验设计相结合，写出'combines analytical mindset with player psychology to craft the player experience'类似表达，体现差异化竞争力。
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

## business_analysis
Target: Business Analyst
Keywords: requirements gathering, process improvement, SQL, Excel, stakeholder, JIRA, business case

### Flagged Current Top Rows
- #7 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #8 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #9 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #12 seg_7487 [no_role_signal] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。

### Buried Candidate Rows
- id=1984 score=26 role=business_analysis,data_analyst target=business_analyst,data_analyst tags=weak_soft_skill_evidence,weak_experience_keyword_evidence,weak_target_role_alignment
  - title: 求职者可能以为BA和DA技能要求相似
  - action: 申请BA岗位时，在简历和面试中重点突出：用plain language解释技术细节的能力、documentation经验、跨部门协作经历，同时展示SQL和Excel的实际应用案例。
- id=2792 score=26 role=business_analysis,data_analyst target=business_analyst,data_analyst tags=low_soft_skill_match
  - title: 求职者简历中SQL和Excel技能未通过具体业务场景体现
  - action: 在工作经历bullet point中加入ad hoc analytics需求场景：描述'接收stakeholder临时数据需求→用SQL提取数据→用Excel完成分析并输出KPI报告'，一条经历同时展示SQL、Excel及业务沟通能力。
- id=11739 score=17 role=consulting,business_analysis target=management_consultant,business_analyst tags=weak_experience_keyword_evidence,weak_result_orientation,vague_project_details
  - title: 求职者将research experience单独列出
  - action: 将research experience与professional project合并，在介绍时简要提及：'在Yale期间参与了若干faculty主导的项目以及Yale医学院的研究'，不需单独强调研究经历，以commercial导向为主。
- id=1081 score=15 role=data_analyst target=data_analyst,business_analyst tags=low_role_specificity,education_details_missing
  - title: 求职者当前简历投DA岗位无回音
  - action: 将简历重新调整为DA版本：保留2个internship + 3个项目（共5个经历），每个经历的描述聚焦分析类工作，删除或淡化建模内容，突出SQL、Excel、可视化、业务分析等DA核心技能。
- id=11568 score=15 role=software_engineer,machine_learning,data_analyst target=data_analyst,data_scientist,business_analyst tags=low_hard_skill_match,keywords_only_in_skills
  - title: 简历要清晰展示你的目标岗位
  - action: 将简历技能部分聚焦于Excel和Tableau，同时添加基础machine learning相关内容增加竞争力；刷题时选择简单难度题目，避免挑战Python/SQL高难度题；投递时筛选对编程要求较低的数据分析岗位，量力而行逐步提升。

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
- #3 seg_24900 [role_mismatch, not_role_safe] role=software_engineer,product_manager target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者项目描述的第一句话未能清晰说明产品类型和所属领域（domain），HR在极短时间内无法判断项目与目标岗位的匹配度，导致错失筛选机会。
  - action: 将项目描述第一句改写为明确说明「这是什么产品/系统 + 所属领域」，例如Fintech支付系统、内部运营工具等，让HR在3秒内判断domain匹配度。
- #4 seg_3928 [role_mismatch, not_role_safe] role=software_engineer target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者的项目bullet point只写了概括性描述（如'seamless interaction with Snowflake database'）
  - action: 在每条项目bullet point中明确写出具体开发的feature名称，再说明该feature的功能和实现方式，最后加上性能/测试相关结论。例如：先写product summary和impact，再展开detail，最后补充testing等细节。
- #5 seg_10084 [role_mismatch, not_role_safe] role=software_engineer,data_analyst target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者在项目中使用了Spring Boot、Google Cloud、PostgreSQL等多项技术，但简历只写3个bullet point
  - action: 梳理项目中实际使用的所有技术点，逐一检查是否在简历中有对应bullet体现；针对PostgreSQL，补充写明SQL相关工作内容（如schema设计、查询优化、stored procedure等），确保bullet数量达到4-5条
- #6 seg_6097 [role_mismatch, not_role_safe] role=software_engineer,ai_engineer,machine_learning,data_analyst target=machine_learning_engineer
  - title: 求职者技能栏内容过少，缺乏AI/ML相关关键词，无法通过ATS筛选，也难以在面试官30秒扫描中留下印象。
  - action: 将技能栏扩充为3~5个bullet，每个bullet包含5~10个技能词，重点覆盖大模型（OpenAI、GPT）、RAG/Agent、深度学习框架（PyTorch、TensorFlow、Transformer）、云技术（AWS）、开发工具（Git、Docker）等AI/ML相关关键词。
- #8 seg_2479 [role_mismatch] role=software_engineer,data_analyst target=universal
  - title: 求职者的项目描述中缺少具体技术工具的提及，未将MySQL数据库存储与SQL分析方法写入bullet point，导致技术深度不足且ATS关键词匹配率低。
  - action: 在该项目的bullet point中明确加入「stored survey data in MySQL database」和「used SQL to analyze survey results with statistical methods」等表述，将技术工具与分析动作直接绑定，提升简历关键词密度。
- #9 seg_21017 [role_mismatch, not_role_safe] role=software_engineer,ai_engineer,machine_learning target=ai_engineer
  - title: 求职者简历中ML与SDE内容各占一半，导致HR和招聘方认为其ML背景不够深厚；对于想走ML/AI Engineer方向的求职者，SDE内容稀释了专业印象。
  - action: 将简历中SDE相关的项目经历和工作描述删除或大幅压缩，把SDE技能（如MLOps、cloud、database、project management）统一归入Skills列表；确保简历正文80%以上内容为ML/AI相关项目和经历。

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

## cloud_infrastructure
Target: Cloud Engineer
Keywords: AWS, Azure, GCP, Kubernetes, Docker, CI/CD, Terraform, Linux, networking

### Flagged Current Top Rows
- #1 seg_26527 [not_role_safe] role=software_engineer,cloud_infrastructure target=backend_engineer,frontend_engineer,software_engineer,cloud_engineer
  - title: 求职者不清楚HR实际阅读简历的顺序和时间，可能导致最关键信息未放在显眼位置
  - action: 将Skills区放在简历显眼位置，并按类别清晰分组（如Languages、Frameworks、Tools等），确保HR在5-10秒内能快速判断候选人技术栈是否匹配岗位需求
- #2 seg_22431 [not_role_safe] role=software_engineer,cloud_infrastructure,cybersecurity target=backend_engineer,cloud_engineer,software_engineer,security_engineer
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

## ux_research_design
Target: UX Designer
Keywords: Figma, user research, wireframe, prototype, usability testing, design system, user journey

### Flagged Current Top Rows
- #7 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #8 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #9 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #10 seg_7487 [no_role_signal] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #11 seg_13261 [no_role_signal] role=universal target=universal
  - title: 求职者简历中项目经历未突出本人担任的职责和角色，只列出项目名称和细碎小点，面试官无法一眼判断求职者在项目中的主要贡献和职位。
  - action: 在每个项目条目下方明确写出担任的角色（如 Hard Surface Artist、Environment Artist），并将该角色信息粗体显示；bullet point 按贡献大小排序，将贡献最大的点放在第一条。
- #12 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。

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
- #3 seg_24900 [role_mismatch, not_role_safe] role=software_engineer,product_manager target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者项目描述的第一句话未能清晰说明产品类型和所属领域（domain），HR在极短时间内无法判断项目与目标岗位的匹配度，导致错失筛选机会。
  - action: 将项目描述第一句改写为明确说明「这是什么产品/系统 + 所属领域」，例如Fintech支付系统、内部运营工具等，让HR在3秒内判断domain匹配度。
- #4 seg_3928 [role_mismatch, not_role_safe] role=software_engineer target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者的项目bullet point只写了概括性描述（如'seamless interaction with Snowflake database'）
  - action: 在每条项目bullet point中明确写出具体开发的feature名称，再说明该feature的功能和实现方式，最后加上性能/测试相关结论。例如：先写product summary和impact，再展开detail，最后补充testing等细节。
- #5 seg_10084 [role_mismatch, not_role_safe] role=software_engineer,data_analyst target=backend_engineer,software_engineer,software_development_engineer
  - title: 求职者在项目中使用了Spring Boot、Google Cloud、PostgreSQL等多项技术，但简历只写3个bullet point
  - action: 梳理项目中实际使用的所有技术点，逐一检查是否在简历中有对应bullet体现；针对PostgreSQL，补充写明SQL相关工作内容（如schema设计、查询优化、stored procedure等），确保bullet数量达到4-5条
- #6 seg_6097 [role_mismatch, not_role_safe] role=software_engineer,ai_engineer,machine_learning,data_analyst target=machine_learning_engineer
  - title: 求职者技能栏内容过少，缺乏AI/ML相关关键词，无法通过ATS筛选，也难以在面试官30秒扫描中留下印象。
  - action: 将技能栏扩充为3~5个bullet，每个bullet包含5~10个技能词，重点覆盖大模型（OpenAI、GPT）、RAG/Agent、深度学习框架（PyTorch、TensorFlow、Transformer）、云技术（AWS）、开发工具（Git、Docker）等AI/ML相关关键词。
- #8 seg_2479 [role_mismatch] role=software_engineer,data_analyst target=universal
  - title: 求职者的项目描述中缺少具体技术工具的提及，未将MySQL数据库存储与SQL分析方法写入bullet point，导致技术深度不足且ATS关键词匹配率低。
  - action: 在该项目的bullet point中明确加入「stored survey data in MySQL database」和「used SQL to analyze survey results with statistical methods」等表述，将技术工具与分析动作直接绑定，提升简历关键词密度。
- #9 seg_21017 [role_mismatch, not_role_safe] role=software_engineer,ai_engineer,machine_learning target=ai_engineer
  - title: 求职者简历中ML与SDE内容各占一半，导致HR和招聘方认为其ML背景不够深厚；对于想走ML/AI Engineer方向的求职者，SDE内容稀释了专业印象。
  - action: 将简历中SDE相关的项目经历和工作描述删除或大幅压缩，把SDE技能（如MLOps、cloud、database、project management）统一归入Skills列表；确保简历正文80%以上内容为ML/AI相关项目和经历。

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

## data_scientist
Target: Data Scientist
Keywords: Python, R, SQL, statistical modeling, A/B testing, machine learning, experimentation, visualization

### Flagged Current Top Rows
- #3 seg_4438 [not_role_safe] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #4 seg_7487 [not_role_safe] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #6 seg_6807 [not_role_safe] role=universal target=universal
  - title: 求职者简历项目过多且偏长，部分项目与目标岗位（CDM相关）关联度低，稀释了简历的针对性和重点。
  - action: 从简历中筛选出2-3个与目标岗位最相关、质量最高的项目重点展示，其余项目移至作品集网站；与目标岗位无关的项目（如environment项目）可单独制作一份简历版本使用。
- #10 seg_2406 [not_role_safe] role=universal target=universal
  - title: 求职者对项目验证流程的描述停留在表面（检查波形、注入错误），无法清晰阐述验证目的、发现的具体问题及解决方法，面试官无法判断其真实技术深度
  - action: 回忆并梳理完整的RTL验证流程：1）验证目的是什么；2）发现了哪些具体错误（如信号X态）；3）如何定位并修复该错误；4）使用了哪些EDA工具（如ModelSim、VCS等）；将这些细节补充至简历项目描述中，体现问题发现与解决的完整闭环
- #12 seg_21656 [not_role_safe] role=universal target=universal
  - title: 求职者简历内容过于宽泛，涵盖多个不相关方向的实习经历，让HR感觉求职者没有明确专注方向，降低获得目标岗位面试的概率。
  - action: 按目标方向（buy side、sell side、consulting）分别制作多版简历，每版只保留与该方向高度相关的实习经历和技能，删除或弱化不相关内容，使简历让HR感受到候选人背景专为该岗位而设。

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