# Role Retrieval Audit

Generated: 2026-06-02T22:30:02.621Z

## Summary
- finance (finance_accounting, positions=45): top=12, flags=0, buried=5
- hardware_electrical (engineering_hardware, positions=35): top=12, flags=1, buried=5
- design_creative (design_creative, positions=27): top=12, flags=2, buried=5
- machine_learning (data, positions=16): top=12, flags=5, buried=5
- ai_engineer (data, positions=15): top=12, flags=4, buried=5
- data_scientist (data, positions=8): top=12, flags=8, buried=5

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