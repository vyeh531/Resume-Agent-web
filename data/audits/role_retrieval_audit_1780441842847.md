# Role Retrieval Audit

Generated: 2026-06-02T23:10:42.849Z

## Summary
- manufacturing_process (engineering_hardware, positions=18): top=12, flags=7, buried=5
- mechanical_engineering (engineering_hardware, positions=18): top=12, flags=0, buried=5
- cloud_infrastructure (tech, positions=16): top=12, flags=9, buried=5
- cybersecurity (tech, positions=12): top=12, flags=2, buried=5
- industrial_quality (engineering_hardware, positions=12): top=12, flags=7, buried=5
- data_scientist (data, positions=8): top=12, flags=5, buried=5
- it_support (tech, positions=6): top=12, flags=6, buried=5
- business_operations (business_ops, positions=3): top=12, flags=8, buried=5
- hr_recruiting (business_ops, positions=3): top=12, flags=10, buried=5
- procurement (business_ops, positions=1): top=12, flags=6, buried=5

## manufacturing_process
Target: Manufacturing Engineer
Keywords: manufacturing, process improvement, quality, lean, six sigma, yield, root cause

### Flagged Current Top Rows
- #2 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #4 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #5 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #7 seg_10394 [not_role_safe] role=universal target=universal
  - title: 学生完成了项目实操练习，但尚未将项目经历整理成简历语言，需要导师协助将技术细节转化为简历bullet point。
  - action: 将当前简历和项目细节的中英文版本一并发给导师，由导师协助调整措辞后放入正式简历。
- #9 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #11 seg_6807 [no_role_signal] role=universal target=universal
  - title: 求职者简历项目过多且偏长，部分项目与目标岗位（CDM相关）关联度低，稀释了简历的针对性和重点。
  - action: 从简历中筛选出2-3个与目标岗位最相关、质量最高的项目重点展示，其余项目移至作品集网站；与目标岗位无关的项目（如environment项目）可单独制作一份简历版本使用。
- #12 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

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
- none

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
- #3 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #4 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #6 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #7 seg_7487 [no_role_signal, conflict:portfolio] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #8 seg_13261 [no_role_signal, conflict:portfolio] role=universal target=universal
  - title: 求职者简历中项目经历未突出本人担任的职责和角色，只列出项目名称和细碎小点，面试官无法一眼判断求职者在项目中的主要贡献和职位。
  - action: 在每个项目条目下方明确写出担任的角色（如 Hard Surface Artist、Environment Artist），并将该角色信息粗体显示；bullet point 按贡献大小排序，将贡献最大的点放在第一条。
- #9 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #10 seg_6807 [no_role_signal, conflict:portfolio] role=universal target=universal
  - title: 求职者简历项目过多且偏长，部分项目与目标岗位（CDM相关）关联度低，稀释了简历的针对性和重点。
  - action: 从简历中筛选出2-3个与目标岗位最相关、质量最高的项目重点展示，其余项目移至作品集网站；与目标岗位无关的项目（如environment项目）可单独制作一份简历版本使用。
- #11 seg_14883 [no_role_signal, conflict:portfolio] role=universal target=universal
  - title: 求职者有参与跨部门良率分析会议的经历，但简历中只写了很短一点，未充分挖掘该经历作为PM相关项目的价值。
  - action: 将跨部门协作分析良率的经历展开描述，突出主导会议召集、问题分析、协调各部门负责人等关键动作，并匹配PM岗位相关关键词，使其成为有说服力的项目案例。

### Buried Candidate Rows
- id=26527 score=23 role=software_engineer,cloud_infrastructure target=backend_engineer,frontend_engineer,software_engineer,cloud_engineer tags=low_hard_skill_match,keywords_only_in_skills
  - title: 求职者不清楚HR实际阅读简历的顺序和时间
  - action: 将Skills区放在简历显眼位置，并按类别清晰分组（如Languages、Frameworks、Tools等），确保HR在5-10秒内能快速判断候选人技术栈是否匹配岗位需求
- id=18029 score=22 role=software_engineer,machine_learning target=machine_learning_engineer tags=missing_microservices,keywords_only_in_skills
  - title: 求职者技能列表尚未完整罗列已用过的工具
  - action: 在技能列表一行写满常用工具：Git、Linux、Docker、Unity 等基础项，再补充 AWS、GCP 等云平台；已使用过的 Kubernetes、TensorFlow、Prolog 等工具按实际情况酌情添加，TensorFlow 可归入 Tools 类别一并列出。
- id=22431 score=20 role=software_engineer,cloud_infrastructure,cybersecurity target=backend_engineer,cloud_engineer,software_engineer,security_engineer tags=low_hard_skill_match,missing_priority_keywords
  - title: 现在招聘流程中HR和hiring manager越...
  - action: 在项目bullet point中主动植入云服务关键词（如AWS S3、CloudFront CDN）、数据库关键词（PostgreSQL）、安全相关关键词（rate limiting、authentication），确保AI摘要时能保留技术亮点，提升简历通过机筛的概率。
- id=18025 score=19 role=software_engineer,data_analyst target=universal tags=keywords_only_in_skills
  - title: 求职者技能列表填写不完整
  - action: 将技能行写满，优先列出 Git、Linux、Docker、Unity 等基础工具，再补充云平台经验如 AWS、GCP、Azure；对于久未使用但有接触的工具（如 MATLAB）可暂不列入，避免面试时无法应对追问
- id=19882 score=16 role=software_engineer target=backend_engineer,software_engineer,software_development_engineer tags=low_hard_skill_match,missing_microservices,keywords_only_in_skills,missing_linkedin
  - title: 求职者 Technical Skills 部分只有...
  - action: 将 Technical Skills section 扩充至 4~5 个 bullet/子类别，参考结构：Programming Languages、Frameworks、Databases、Cloud/DevOps Tools、其他（如 Message Queue、CI/CD 等）；同时参考 LinkedIn 上后端岗位 JD，将目标岗位高频技能关键词填入对应子类别。

## cybersecurity
Target: Cybersecurity Analyst
Keywords: security, incident response, SIEM, vulnerability, threat, risk, network security

### Flagged Current Top Rows
- #3 seg_7487 [conflict:portfolio] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #7 seg_7479 [not_role_safe] role=universal target=universal
  - title: 求职者教育背景模块排版顺序混乱，缩写未加点、GPA未注明满分、课程关键词首字母未大写，细节不规范影响专业度。
  - action: 教育模块按「就读时间 → 学校/机构名称（加粗）→ 专业/学位 → 地点（斜体）→ GPA → 相关课程」顺序排列；缩写后加点（如Aug.）；GPA写为3.8 out of 4.0；相关课程各词首字母大写。

### Buried Candidate Rows
- id=22431 score=20 role=software_engineer,cloud_infrastructure,cybersecurity target=backend_engineer,cloud_engineer,software_engineer,security_engineer tags=low_hard_skill_match,missing_priority_keywords
  - title: 现在招聘流程中HR和hiring manager越...
  - action: 在项目bullet point中主动植入云服务关键词（如AWS S3、CloudFront CDN）、数据库关键词（PostgreSQL）、安全相关关键词（rate limiting、authentication），确保AI摘要时能保留技术亮点，提升简历通过机筛的概率。
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

## industrial_quality
Target: Quality Engineer
Keywords: quality, QA, root cause, CAPA, process improvement, six sigma, inspection

### Flagged Current Top Rows
- #2 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #4 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #5 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #7 seg_10394 [not_role_safe] role=universal target=universal
  - title: 学生完成了项目实操练习，但尚未将项目经历整理成简历语言，需要导师协助将技术细节转化为简历bullet point。
  - action: 将当前简历和项目细节的中英文版本一并发给导师，由导师协助调整措辞后放入正式简历。
- #9 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #11 seg_6807 [no_role_signal] role=universal target=universal
  - title: 求职者简历项目过多且偏长，部分项目与目标岗位（CDM相关）关联度低，稀释了简历的针对性和重点。
  - action: 从简历中筛选出2-3个与目标岗位最相关、质量最高的项目重点展示，其余项目移至作品集网站；与目标岗位无关的项目（如environment项目）可单独制作一份简历版本使用。
- #12 seg_19982 [no_role_signal] role=universal target=universal
  - title: 求职者简历中包含3年以上的早期教育/工作经历，对于entry至mid level岗位，HR通常不会重点审阅过久的经历，且简历篇幅有限
  - action: 评估3年以上旧经历是否有突出亮点，若无明显优势则大幅删减或移除；将简历重心集中在最近、最相关的三段经历上，确保每段经历质量高于数量堆砌。

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

## it_support
Target: IT Support Specialist
Keywords: ticketing, troubleshooting, help desk, Windows, Linux, network, hardware, customer support

### Flagged Current Top Rows
- #4 seg_6303 [role_mismatch] role={"universal"} target={"universal"}
  - title: 求职者简历未针对目标岗位的具体技能要求进行定制，需要根据职位描述调整简历内容，使技能与岗位需求高度匹配。
  - action: 对照目标职位的 job description，识别岗位所需的核心技能关键词，将简历中相关经历和技能描述与之对齐，确保简历语言与职位要求高度吻合。
- #5 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #6 seg_19340 [no_role_signal] role=universal target=universal
  - title: 导师通过阅读CITI岗位JD，判断该职位属于前台80%、中台20%的销售支持性质岗位，求职者需要据此调整简历内容侧重点，而非用通用版本投递。
  - action: 阅读目标岗位JD首句话判断岗位前中后台比例，识别核心关键词（如analytical、transactional、client support、source），再针对性改写简历bullet point，使经历描述与岗位性质匹配。
- #7 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #11 seg_7487 [no_role_signal, conflict:portfolio] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #12 seg_9903 [no_role_signal] role=universal target=universal
  - title: 求职者的简历bullet point缺乏高价值技术关键词，未能体现Multi Processing等专业技术能力，ATS机篩时关键词匹配度不足
  - action: 在项目描述中补充技术关键词，将bullet point改写为「Build [项目名] from Scratch supporting Multi Processing, generating metrics like [具体指标]」结构，主动加入高辨识度的技术词汇以提升ATS通过率

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

## business_operations
Target: Business Operations Manager
Keywords: operations, business process, KPI, stakeholder, cross-functional, process improvement, reporting

### Flagged Current Top Rows
- #3 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #5 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #6 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #8 seg_7487 [no_role_signal] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #9 seg_13261 [no_role_signal] role=universal target=universal
  - title: 求职者简历中项目经历未突出本人担任的职责和角色，只列出项目名称和细碎小点，面试官无法一眼判断求职者在项目中的主要贡献和职位。
  - action: 在每个项目条目下方明确写出担任的角色（如 Hard Surface Artist、Environment Artist），并将该角色信息粗体显示；bullet point 按贡献大小排序，将贡献最大的点放在第一条。
- #10 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #11 seg_441 [no_role_signal] role=universal target=universal
  - title: 简历关键词优化的系统做法：收集10份目标方向的JD，用在线JD-简历匹配工具（如JobScan）扫描，找出简历缺少的高频关键词
  - action: 执行：在目标方向找10个JD → 用JobScan等工具逐一扫描 → 统计缺失关键词 → 在简历各处自然加入 → 用7个新JD测试验证匹配度提升。
- #12 seg_6807 [no_role_signal] role=universal target=universal
  - title: 求职者简历项目过多且偏长，部分项目与目标岗位（CDM相关）关联度低，稀释了简历的针对性和重点。
  - action: 从简历中筛选出2-3个与目标岗位最相关、质量最高的项目重点展示，其余项目移至作品集网站；与目标岗位无关的项目（如environment项目）可单独制作一份简历版本使用。

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
- id=2792 score=10 role=business_analysis,data_analyst target=business_analyst,data_analyst tags=low_soft_skill_match
  - title: 求职者简历中SQL和Excel技能未通过具体业务场景体现
  - action: 在工作经历bullet point中加入ad hoc analytics需求场景：描述'接收stakeholder临时数据需求→用SQL提取数据→用Excel完成分析并输出KPI报告'，一条经历同时展示SQL、Excel及业务沟通能力。

## hr_recruiting
Target: Human Resources Specialist
Keywords: recruiting, onboarding, HRIS, employee relations, Workday, talent acquisition, screening

### Flagged Current Top Rows
- #3 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #4 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #5 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #6 seg_7487 [no_role_signal] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #7 seg_13261 [no_role_signal] role=universal target=universal
  - title: 求职者简历中项目经历未突出本人担任的职责和角色，只列出项目名称和细碎小点，面试官无法一眼判断求职者在项目中的主要贡献和职位。
  - action: 在每个项目条目下方明确写出担任的角色（如 Hard Surface Artist、Environment Artist），并将该角色信息粗体显示；bullet point 按贡献大小排序，将贡献最大的点放在第一条。
- #8 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。
- #9 seg_6807 [no_role_signal] role=universal target=universal
  - title: 求职者简历项目过多且偏长，部分项目与目标岗位（CDM相关）关联度低，稀释了简历的针对性和重点。
  - action: 从简历中筛选出2-3个与目标岗位最相关、质量最高的项目重点展示，其余项目移至作品集网站；与目标岗位无关的项目（如environment项目）可单独制作一份简历版本使用。
- #10 seg_14883 [no_role_signal] role=universal target=universal
  - title: 求职者有参与跨部门良率分析会议的经历，但简历中只写了很短一点，未充分挖掘该经历作为PM相关项目的价值。
  - action: 将跨部门协作分析良率的经历展开描述，突出主导会议召集、问题分析、协调各部门负责人等关键动作，并匹配PM岗位相关关键词，使其成为有说服力的项目案例。

### Buried Candidate Rows
- id=4149 score=20 role=finance,hr_recruiting target=financial_analyst,human_resources_specialist tags=low_jd_keyword_match,missing_priority_keywords,resume_not_tailored_to_jd,weak_experience_keyword_evidence,weak_result_orientation
  - title: 求职者简历缺乏足够的行业关键词
  - action: 根据目标岗位（FA或HR方向）在技能区及工作经历中主动补充相关专业关键词。FA方向补充：Financial Analysis、Portfolio Management、DCF、Financial Modeling等；HR方向补充对应HR专业术语，确保关键词覆盖目标JD中的核心词汇。
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

## procurement
Target: Purchasing Agent
Keywords: procurement, vendor, sourcing, purchase order, negotiation, supply chain, cost savings

### Flagged Current Top Rows
- #3 seg_25938 [no_role_signal] role=universal target=universal
  - title: 求职者将GPA单独占一行，浪费宝贵版面空间，导致无法放置更有价值的内容
  - action: 将GPA合并到教育背景同一行（如：Accumulate GPA 3.7），节省一行版面，用于补充更有意义的项目经历或关键词内容
- #5 seg_17880 [no_role_signal] role=universal target=universal
  - title: 求职者简历在完成细节填写后仍存在内容冗余问题：部分bullet point重复传递相同信息，同时某些条目（如在线项目）放错位置，未能发挥最大效果。
  - action: 完成当前逐条删减与补写后，进行第二轮整体筛选：（1）识别并删除重复条目；（2）评估是否将某些在线项目内容移至project栏目下展示；（3）以HR视角判断哪些内容读一遍已足够、无需重复出现。
- #6 seg_4438 [no_role_signal] role=universal target=universal
  - title: 求职者简历内容分散、不够紧凑，且未针对ATS机器筛选优化，导致通过率低
  - action: 将简历压缩至一页，删除冗余内容（如学生会经历、操作系统列表等），重组结构为education、technical project and internship、relevant technical skills，提升ATS关键词密度
- #7 seg_7487 [no_role_signal] role=universal target=universal
  - title: 求职者的案例研究经历仅列出研究内容，未清晰呈现每个case的核心产出和目的，HR无法判断研究的实际价值和商业影响力。
  - action: 将每个case study改写为独立的summary bullet point，结构为：研究对象/场景 + 分析内容（如PR管理、竞争分析、宏观影响）+ 目的/价值（帮助客户规避风险或理解竞争环境），确保每条bullet都能独立传递信息量。
- #8 seg_13261 [no_role_signal] role=universal target=universal
  - title: 求职者简历中项目经历未突出本人担任的职责和角色，只列出项目名称和细碎小点，面试官无法一眼判断求职者在项目中的主要贡献和职位。
  - action: 在每个项目条目下方明确写出担任的角色（如 Hard Surface Artist、Environment Artist），并将该角色信息粗体显示；bullet point 按贡献大小排序，将贡献最大的点放在第一条。
- #11 seg_22876 [no_role_signal] role=universal target=universal
  - title: 求职者简历按时间线排列，将论文和专利放在靠前位置，但这些内容与目标岗位关联性不如技能/工具模块强，导致HR扫描时无法第一时间看到最匹配的信息。
  - action: 将简历中的 skills 和相关工具模块调整到靠前位置，paper 和 patent 移至后面；同时可在教育经历下补充与目标岗位相关的重要课程名称，以增强匹配度。

### Buried Candidate Rows
- id=4154 score=15 role=supply_chain_logistics,finance target=supply_chain_analyst,procurement_specialist,financial_analyst tags=education_details_missing,weak_target_role_alignment
  - title: 求职者以为Coursework只能填学校正式课程
  - action: 在Coursework区域填写与目标岗位（FA/Supply Chain）相关的课程，包括线上自学课程；面试官不会核查成绩单，只会询问学到了什么
- id=4668 score=15 role=supply_chain_logistics target=supply_chain_analyst,logistics_analyst,procurement_specialist tags=low_jd_keyword_match,missing_priority_keywords,weak_target_role_alignment,missing_exact_job_title
  - title: 求职者面向Supply Chain Analyst...
  - action: 分开准备两版简历，但内容无需大幅改动，主要调整职位Title使其与目标岗位更贴近，例如面向物流/供应链岗位时将Title改为Logistics Engineer，以提升关键词匹配度。
- id=14868 score=10 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=education_details_missing
  - title: 求职者希望转行至PM或supply chain岗位
  - action: 在简历中尽量凸显与PM或supply chain相关的经验，哪怕是间接经验也需包装体现；同时通过考取相关证书（如PMP、Lean Six Sigma）填补经验空白，确保至少能通过HR初筛关卡。
- id=14873 score=10 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=low_role_specificity
  - title: 不要一份简历投所有岗位
  - action: 明确告知目标岗位方向（如supply chain或PM），再由导师根据方向针对性润色简历；可同时提供多个方向供导师参考
- id=14889 score=10 role=supply_chain target=supply_chain_analyst,procurement,logistics tags=short_tenure_unclear,education_details_missing,weak_target_role_alignment
  - title: 求职者倾向于PM方向而非supply chain
  - action: 根据自身时间安排决定是否考取PMP；若短期以求职为优先，可先专注简历修改和投递，待入职后再考虑PMP以支持晋升