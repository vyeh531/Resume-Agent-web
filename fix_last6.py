import sqlite3, sys
sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('mentor_kb-v5.db')
cur = conn.cursor()

fixes = [
    (23910, 'A_action', '删除通用性低价值的bullet point（如"used Excel to organize data"等每人都能写的内容）；保留能体现主动推动成果的bullet，改写为"实现了什么效果/达到了什么结果"的结果导向表达。'),
    (24953, 'A_action', '将CDC会议论文写入简历的Publications或Research Experience板块，注明论文标题、会议全称及年份；以此作为研究能力的背书，尤其在申请技术类研究岗或工程岗时可提升简历可信度。'),
    (26053, 'A_action', '大一阶段立即开始行动：了解目标行业的实习招聘时间线（通常大二暑期开始），规划大学前两年的选课方向，尽早接触相关社团/项目积累简历内容；早准备的复合价值随时间线性放大。'),
    (26288, 'A_action', '设计结构化自我介绍：①一句话背景定位（学校+专业+核心经历方向），②1个最能体现能力的项目/成果，③明确说明与目标岗位的匹配点和求职动机；控制在60-90秒内，让面试官留下清晰记忆点。'),
    (26307, 'A_action', '针对关键面试问题（如"为什么你适合这个职位"、"介绍你最有挑战性的项目"），提前将答案写下来反复修改，而非死记简历内容；书面整理迫使思路清晰，口头表达时更自然流畅。'),
    (26307, 'I_insight', '将答案写下来是面试备考的高效策略：书写过程本身能暴露逻辑漏洞，反复修改后的答案比临场发挥更有说服力；区别于只读简历，书面答案帮助候选人形成可复用的表达框架。'),
    (26571, 'A_action', '在正式投递前对照标准简历结构逐项检查：Header、Summary（可选）、Experience、Education、Skills、Projects是否齐全；重点确认最关键的板块（通常是Experience和Skills）内容完整且格式规范。'),
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
n = cur.fetchone()[0]
print(f'\nFinal remaining stub rows: {n}')
if n:
    cur.execute("""
        SELECT id, A_action, I_insight FROM segments
        WHERE LENGTH(TRIM(COALESCE(A_action,''))) < 20
           OR LENGTH(TRIM(COALESCE(I_insight,''))) < 20
    """)
    for r in cur.fetchall():
        print(f'  id={r[0]}  A=[{(r[1] or "")[:60]}]  I=[{(r[2] or "")[:60]}]')

conn.close()
print('All done.')
