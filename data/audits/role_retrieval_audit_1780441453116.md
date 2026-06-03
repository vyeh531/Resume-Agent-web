# Role Retrieval Audit

Generated: 2026-06-02T23:04:13.119Z

## Summary
- finance (finance_accounting, positions=45): top=12, flags=0, buried=5
- hardware_electrical (engineering_hardware, positions=35): top=12, flags=1, buried=5
- supply_chain_logistics (business_ops, positions=32): top=12, flags=4, buried=5
- design_creative (design_creative, positions=27): top=12, flags=3, buried=5
- business_analysis (business_ops, positions=22): top=12, flags=4, buried=5
- ux_research_design (design_creative, positions=13): top=12, flags=6, buried=5
- consulting (business_ops, positions=11): top=12, flags=1, buried=5
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