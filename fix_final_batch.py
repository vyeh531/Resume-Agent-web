import sqlite3, sys
sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('mentor_kb-v5.db')
cur = conn.cursor()

fixes = [
    # Truncated A_action + bad I_insight
    (16343, 'A_action', '在每条经历bullet point中以"developed [项目] with [工具名]"句式嵌入具体技术工具（如Python、SQL、Spark、TensorFlow），既刷ATS关键词，也让每条经历都有明确的技术信号。'),
    (16343, 'I_insight', '将工具名直接嵌入经历描述而非只列在Skills栏，是提升ATS关键词命中率的有效策略；面试官也能从项目描述中直接感知候选人的技术工具使用深度，而非依赖泛泛的技能清单。'),
    (23300, 'A_action', '将数据库设计相关术语写全称并在括号内注明简称，例如将"3NF"改写为"third normal form（3NF）"；数据来源类别使用"e.g., sales, inventory"等具体举例，让非专业背景的HR也能理解。'),
    (23300, 'I_insight', '简历中的技术缩写对HR等非技术读者不友好；全称加括号简称的格式兼顾专业准确性和可读性，既通过ATS关键词匹配，又确保技术面试官以外的读者能理解候选人的技术工作内容。'),

    # Empty A_action — derived from I_insight + context
    (11960, 'A_action', '检查简历中是否包含目标岗位（BA/DA）的核心关键词（如SQL、Excel、Tableau、data analysis、business insight）；参照目标JD逐项对照，将缺失关键词补充进技能栏或经历描述中。'),
    (12514, 'A_action', '尽快通过校内项目、志愿者数据分析、Kaggle竞赛等渠道获取可写入简历的实践经历；若短期内无法实习，可用高质量个人项目（有完整分析流程+量化结论）部分弥补实习空白。'),
    (13005, 'A_action', '在导师辅导开始前，主动梳理并提供：当前投递的岗位方向、已投数量、面试转化率、收到的反馈；让导师快速了解背景，提高辅导针对性和效率。'),
    (13019, 'A_action', '系统复习SQL四种JOIN（INNER、LEFT、RIGHT、FULL OUTER）及常用查询（GROUP BY、窗口函数、子查询）；同时掌握Python pandas数据清洗和基础统计建模，确保技术面试中能流畅作答。'),
    (13212, 'A_action', '将咨询经历中涉及市场调研、竞品分析或客户洞察的部分重新包装为Marketing语言；同时通过volunteer项目或个人案例补充实际campaign执行经历（如内容运营、邮件营销、社媒分析），以弥补直接执行经验的空白。'),
    (14246, 'A_action', '审查简历中的学术研究项目，保留与data analysis直接相关的部分（如数据收集、统计分析、可视化），删除与目标岗位不相关的纯学术内容；用数据分析语言重新包装保留的项目，突出工业界可迁移的技能。'),
    (14249, 'A_action', '向导师详细说明课程项目的完整流程：数据来源、分析方法、个人贡献、最终产出；让导师判断项目是否有足够深度写入简历，以及如何包装才能体现分析能力。'),
    (14300, 'A_action', '分析当前简历的ATS关键词覆盖率，对照目标岗位JD补充缺失关键词；同时扩大投递渠道，将部分精力从广撒网转向针对性投递目标行业的相关岗位，提升面试转化率。'),
    (14580, 'A_action', '在SQL实操测试中展示基础查询能力（SELECT、JOIN、GROUP BY、HAVING）；若测试中发现薄弱点，课后针对性补强该题型，确保技术面试中SQL实操与简历描述一致。'),
    (14587, 'A_action', '明确毕业后的优先路径（全职求职 vs 研究生申请），避免两者同时推进导致精力分散；若优先求职，集中资源完善简历和面试准备；若优先申研，先确定申请截止日期再规划求职时间线。'),
    (14971, 'A_action', '准备behavioral题时，在通用回答框架（沟通、调研、协调）的基础上，补充1-2个能说明你独特处理方式的具体细节（具体说了什么、做了什么决策、对方的反应）；细节是证明经历真实性的关键。'),
    (15609, 'A_action', '评估自身coding能力与量化岗位（如Quant Analyst、Algo Trading）的要求差距；若差距较大，优先补强LeetCode中等难度题和统计编程（Python/R），或考虑更贴近当前能力的Data Analyst/Risk Analyst方向。'),
    (16129, 'A_action', '在导师正向评估基础上，继续保持当前简历的量化指标表达方式；重点检查是否每段经历都有至少一条量化bullet，以及数字是否可在面试中自圆其说。'),
    (16322, 'A_action', '调整求职预期，将2024年市场收缩纳入考量；缩短单次投递等待时间（超过2周无回音则继续下一家），同时扩展目标行业（如医疗科技、AI、能源等仍在增长的领域），避免集中投递单一收缩行业。'),
    (16635, 'A_action', '在简历中明确呈现前后端+AI开发的复合技术栈，将全职工作经历与SDE岗位的JD关键词对齐；强调实际生产环境的工作经验（非实习），以此作为对比在校生的核心差异化优势。'),
    (17199, 'A_action', '将顶级公司实习经历按实际参与范围如实描述，不过度渲染；重点突出在有限范围内交付的具体成果（如优化了某模块、完成了某分析），而非模糊描述参与了整个项目。'),
    (17480, 'A_action', '练习将业务问题拆解为可量化指标的思维框架：先定义成功标准（如用户留存率、转化率），再拆分为可测量的子指标，最后说明如何用数据验证；将这一框架应用于准备数据分析面试的指标设计题。'),
    (17784, 'A_action', '将自我介绍改为三段式结构：①一句话总结背景和专长，②1-2个最相关的项目/经历亮点，③明确说明与目标岗位的匹配点；避免逐一列举技能，改为讲清"我能为你的团队解决什么问题"。'),
    (21469, 'A_action', '在内推渠道之外，同时通过官网直投、LinkedIn Easy Apply、校招平台（Handshake等）多元化投递；将内推作为优先渠道，但不以是否有内推决定是否投递，确保投递量和覆盖面。'),
    (21720, 'A_action', '针对海外求职中国内经验认可度低的问题，在简历中补充英文表达能力信号（如英文授课项目、英文发表）；通过mock interview练习临场反应，降低语言和文化差异对面试表现的影响。'),
    (21817, 'A_action', '评估电路设计方向的就业市场容量，考虑向计算机工程（软硬件结合）或嵌入式系统方向拓展；补充C/C++、FPGA或嵌入式Linux相关经历，提升在更宽泛的工程岗位市场中的竞争力。'),
    (22141, 'A_action', '为简历中的SQL项目补充业务背景和分析结论：描述分析了什么问题、用SQL处理了多大规模的数据、得出了什么可操作的结论；将"会用SQL"转化为"用SQL解决了具体业务问题"的完整叙事。'),
    (22242, 'A_action', '将简历聚焦在1-2个核心方向（如数据分析 or 产品运营），删除与目标方向关联度低的经历描述；针对聚焦方向，将所有经历的语言统一调整为目标岗位的JD关键词和行业术语。'),
    (22771, 'A_action', '为金融实习经历中的每条bullet point补充量化数据：分析了多少家公司/产品、模型预测准确率、报告覆盖的资产规模等；若无精确数字，可用"approximately"或范围值（如"~50 companies"）合理呈现。'),
    (23357, 'A_action', '针对应届生经验不足的结构性劣势，通过高质量个人项目、开源贡献或竞赛成绩补充可量化的实践经历；在求职材料中主动展示学习速度和主动性，以弥补工作年限上的不足。'),
    (23672, 'A_action', '优先建立3D动画或角色动画的作品集（至少2-3个完整作品）；即使是学生项目也可展示，关键是呈现从概念到成品的完整工作流程（rigging、skinning、animation cycle等），让HR和招聘方有具体内容评估。'),
]

for row_id, field, value in fixes:
    cur.execute(f'UPDATE segments SET {field} = ? WHERE id = ?', (value, row_id))
    print(f'  id={row_id} {field}: {cur.rowcount} updated')

conn.commit()

cur.execute("""
    SELECT COUNT(*) FROM segments
    WHERE LENGTH(TRIM(COALESCE(A_action,''))) < 20
       OR LENGTH(TRIM(COALESCE(I_insight,''))) < 20
""")
remaining = cur.fetchone()[0]
print(f'\nFinal remaining stub rows: {remaining}')

if remaining > 0:
    cur.execute("""
        SELECT id, A_action, I_insight FROM segments
        WHERE LENGTH(TRIM(COALESCE(A_action,''))) < 20
           OR LENGTH(TRIM(COALESCE(I_insight,''))) < 20
    """)
    for r in cur.fetchall():
        print(f'  id={r[0]}  A=[{(r[1] or "")[:60]}]  I=[{(r[2] or "")[:60]}]')

conn.close()
print('Done.')
