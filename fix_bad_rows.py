import sqlite3, sys
sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('mentor_kb-v5.db')
cur = conn.cursor()

fixes = [
    (380, 'I_insight', '项目版块在求职中的价值在于展示广度而非深度；3-4个项目各用简短描述的策略，能让招聘官感知候选人经验广博，有效弥补实习数量不足的劣势。'),
    (524, 'I_insight', '面试官评估海外求职者时，关注其能否将不同国家工作经验与所学知识有机整合；清晰叙述"中国实习+美国硕士知识→胜任美国岗位"的逻辑链条，能显著降低面试官对背景匹配度的疑虑。'),
    (528, 'I_insight', '会计求职存在两条平行路线：公共会计（事务所）和企业内部会计部门（private accounting）；了解两条路线差异并制定分层投递策略，能在不同规模机会中保持竞争力，避免孤注一掷。'),
    (532, 'I_insight', '大型事务所面试官对应届生的期望是"理解基本原则"而非"拥有大量工作经验"；面试重心在行为/情景题上，专注behavioral练习而非死记技术细节，符合大公司的实际考察逻辑。'),
    (563, 'I_insight', '面试官无法评估自己不熟悉领域的挑战程度；BQ故事须与目标岗位核心能力高度相关，让面试官能真正理解并认可挑战的难度，才能达到BQ的说服效果。'),
    (4631, 'A_action', '将每条bullet point改写为"执行内容 + contributing to [贡献/影响]"结构，确保每条经历描述均包含行动带来的具体贡献或业务影响，而非仅描述职责。'),
    (4631, 'I_insight', '简历中"做了什么"是基础门槛，"产生了什么影响"才是区分候选人质量的关键；contribution结尾结构让每条经历都能直接回答"为什么应该聘用你"这个核心问题。'),
    (20857, 'A_action', '对于非自己主导的项目，以"协助"、"支持"、"参与"等词汇诚实描述参与角色；将参与项目写入简历和作品集，展示广度和真实经历，不因非主导而放弃展示机会。'),
    (20857, 'I_insight', '经历的广度和真实性在求职市场同样重要；诚实描述参与角色而非虚报主导，既能展示实际参与的能力，又能避免面试被追问细节时露馅的风险。'),
    (24890, 'A_action', '将相关技术工具和功能合并为一句完整的bullet：以"使用[工具A]+[工具B]实现[功能]，优化[指标]"的句式，把分散在两条bullet的技术细节融合为逻辑连贯的单句描述。'),
    (24890, 'I_insight', '简历bullet point的信息密度决定阅读体验；将碎片化技术细节整合为单句完整表达，不仅节约空间，更能让招聘官一眼看清技术选型的完整逻辑链条，体现工程思维的系统性。'),
]

for row_id, field, value in fixes:
    cur.execute(f'UPDATE segments SET {field} = ? WHERE id = ?', (value, row_id))
    print(f'  id={row_id} {field}: {cur.rowcount} row updated')

conn.commit()

# Check for remaining truly truncated A_action (ends with open paren+如 at end, or very short verb phrase)
import re
cur.execute("SELECT id, A_action FROM segments WHERE A_action IS NOT NULL")
truly_truncated = []
for row_id, a in cur.fetchall():
    a = (a or '').strip()
    # Ends with open bracket without close, or ends with verb without object (<10 chars after last comma/period)
    if re.search(r'（如$', a) or (len(a) < 12 and a and not re.search(r'[。！？；]$', a)):
        truly_truncated.append((row_id, a))

print(f'\nStill truly truncated A_action: {len(truly_truncated)}')
for rid, a in truly_truncated:
    print(f'  id={rid}: [{a}]')

# Final stats
cur.execute("SELECT COUNT(*) FROM segments WHERE LENGTH(TRIM(COALESCE(A_action,''))) < 20 OR LENGTH(TRIM(COALESCE(I_insight,''))) < 20")
print(f'\nRemaining stub rows (< 20 chars): {cur.fetchone()[0]}')
cur.execute("SELECT COUNT(*) FROM segments")
print(f'Total rows: {cur.fetchone()[0]}')

conn.close()
print('Done.')
