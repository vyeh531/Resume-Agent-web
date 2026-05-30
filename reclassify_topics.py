"""
Reclassify segments.topic into ~30 canonical controlled-vocabulary tags.
Strategy: deterministic mapping from (L1, L2, advice_type) — no API needed.
Any combination not in the explicit map falls back to "L1 · L2".
"""
import sqlite3, sys, re
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('mentor_kb-v5.db')
conn.row_factory = sqlite3.Row
cur = conn.cursor()

# ── Canonical topic vocabulary ─────────────────────────────────────────────────
# Priority order: more specific rules first.
# Each rule: (L1_pattern, L2_pattern, advice_type_pattern) -> topic
# Patterns are substring matches (None = match anything)

RULES = [
    # ── 简历内容 ──────────────────────────────────────────────────────────────
    ('简历内容', '工作经历',       None,          '工作经历描述'),
    ('简历内容', '项目描述',       None,          '项目经历描述'),
    ('简历内容', '技能列表',       None,          '技能栏优化'),
    ('简历内容', '技术技能',       None,          '技能栏优化'),
    ('简历内容', '教育背景',       None,          '教育背景优化'),
    ('简历内容', '格式优化',       None,          '简历格式规范'),
    ('简历内容', '简历版本规划',   None,          '多版本简历策略'),
    ('简历内容', '个人总结',       None,          '个人总结撰写'),
    ('简历内容', '关键词匹配',     None,          '关键词布局'),
    ('简历内容', 'ATS',            None,          '关键词布局'),
    ('简历内容', None,             '量化成果',    '简历量化成果'),
    ('简历内容', None,             '结构调整',    '简历结构调整'),
    ('简历内容', None,             '格式优化',    '简历格式规范'),
    ('简历内容', None,             '项目包装',    '项目经历描述'),
    ('简历内容', None,             '方向聚焦',    '简历定向策略'),
    ('简历内容', None,             None,          '简历内容优化'),   # 兜底

    # ── 求职策略 ──────────────────────────────────────────────────────────────
    ('求职策略', 'ATS',            None,          'ATS机筛策略'),
    ('求职策略', '目标岗位定位',   None,          '目标岗位定位'),
    ('求职策略', '方向定位',       None,          '目标岗位定位'),
    ('求职策略', '投递渠道',       None,          '投递渠道规划'),
    ('求职策略', '竞争分析',       None,          '市场竞争分析'),
    ('求职策略', '时间规划',       None,          '求职时间规划'),
    ('求职策略', 'GAP分析',        None,          '背景差距分析'),
    ('求职策略', '简历版本规划',   None,          '多版本简历策略'),
    ('求职策略', None,             '关键词匹配',  'ATS机筛策略'),
    ('求职策略', None,             '方向聚焦',    '目标岗位定位'),
    ('求职策略', None,             None,          '求职综合策略'),   # 兜底

    # ── 面试准备 ──────────────────────────────────────────────────────────────
    ('面试准备', '行为面试',       None,          '行为面试备考'),
    ('面试准备', '技术面试',       None,          '技术面试备考'),
    ('面试准备', '面试复盘',       None,          '面试复盘改进'),
    ('面试准备', None,             '面试策略',    '面试综合策略'),
    ('面试准备', None,             None,          '面试综合策略'),   # 兜底

    # ── 职业规划 ──────────────────────────────────────────────────────────────
    ('职业规划', 'GAP分析',        None,          '背景差距分析'),
    ('职业规划', '转行路径',       None,          '转行路径规划'),
    ('职业规划', '方向定位',       None,          '职业方向选择'),
    ('职业规划', '目标岗位定位',   None,          '职业方向选择'),
    ('职业规划', '时间规划',       None,          '求职时间规划'),
    ('职业规划', None,             '方向聚焦',    '职业方向选择'),
    ('职业规划', None,             None,          '职业发展规划'),   # 兜底

    # ── 技能提升 ──────────────────────────────────────────────────────────────
    ('技能提升', '技术技能',       None,          '技术技能补强'),
    ('技能提升', '软技能',         None,          '软技能发展'),
    ('技能提升', '证书资质',       None,          '证书资质规划'),
    ('技能提升', None,             '技能补强',    '技术技能补强'),
    ('技能提升', None,             None,          '技能综合提升'),   # 兜底
]

def match(value, pattern):
    """None pattern matches anything; otherwise substring match."""
    if pattern is None:
        return True
    return value is not None and pattern in value

def classify(l1, l2, advice_type):
    for r_l1, r_l2, r_at, topic in RULES:
        if match(l1, r_l1) and match(l2, r_l2) and match(advice_type, r_at):
            return topic
    # Fallback: L1 · L2
    if l1 and l2:
        return f'{l1} · {l2}'
    return l1 or '其他'

# ── Apply to all rows ──────────────────────────────────────────────────────────
cur.execute('SELECT id, L1, L2, advice_type FROM segments')
rows = cur.fetchall()

from collections import Counter
topic_counts = Counter()
batch = []
for r in rows:
    new_topic = classify(r['L1'], r['L2'], r['advice_type'])
    topic_counts[new_topic] += 1
    batch.append((new_topic, r['id']))

cur.executemany('UPDATE segments SET topic = ? WHERE id = ?', batch)
conn.commit()

print(f'Updated {len(batch)} rows\n')
print(f'Distinct topics: {len(topic_counts)}\n')
print('Topic distribution:')
for topic, n in topic_counts.most_common():
    bar = '█' * (n // 100)
    print(f'  {n:5d}  {topic:<20}  {bar}')

conn.close()
print('\nDone.')
