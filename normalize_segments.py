import sqlite3, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('mentor_kb-v5.db')
cur = conn.cursor()

# ── 1. advice_type → 10 canonical Simplified Chinese values ──────────────────
ADVICE_TYPE_MAP = {
    # 方向聚焦
    '方向聚焦': '方向聚焦', '战略规划': '方向聚焦', '战术建议': '方向聚焦',
    '方向选择': '方向聚焦', '方向规划': '方向聚焦', '职业定位': '方向聚焦',
    'strategy': '方向聚焦', 'strategic': '方向聚焦', 'direction': '方向聚焦',
    'positioning': '方向聚焦', 'reframe': '方向聚焦', 'career_path': '方向聚焦',

    # 项目包装
    '项目包裝': '项目包装', '項目包裝': '项目包装', '项目包装': '项目包装',
    '经历包装': '项目包装', '经历构建': '项目包装', '项目叙事': '项目包装',
    '内容挖掘': '项目包装', '简历包装': '项目包装',
    'project_framing': '项目包装', 'project_presentation': '项目包装',
    'project_strategy': '项目包装', 'narrative': '项目包装',

    # 结构调整
    '结构调整': '结构调整', '結構調整': '结构调整', '结構調整': '结构调整',
    '结构調整': '结构调整', '简历优化': '结构调整', '简历技巧': '结构调整',
    '简历策略': '结构调整', '简历写作': '结构调整', '简历版本规划': '结构调整',
    '簡歷版本規劃': '结构调整', '内容策略': '结构调整',
    'resume_writing': '结构调整', 'resume': '结构调整',
    'resume_advice': '结构调整', 'resume_strategy': '结构调整',
    'resume_content': '结构调整', 'resume_format': '结构调整',
    'framework': '结构调整',

    # 格式优化
    '格式优化': '格式优化', '格式優化': '格式优化',
    'resume_format': '格式优化',

    # 关键词匹配
    '关键词匹配': '关键词匹配', '關鍵詞匹配': '关键词匹配', '关键詞匹配': '关键词匹配',
    'ATS机筛机制': '关键词匹配',

    # 量化成果
    '量化成果': '量化成果',

    # 技能补强
    '技能补强': '技能补强', '技能補強': '技能补强', '技能补強': '技能补强',
    '技术备考': '技能补强', '技能规划': '技能补强', '技能建议': '技能补强',
    'skill_building': '技能补强', 'technical': '技能补强',
    'study_plan': '技能补强', 'drill': '技能补强',

    # 面试策略
    '面试策略': '面试策略', '面試策略': '面试策略', '面试技巧': '面试策略',
    '面试准备': '面试策略',
    'interview_prep': '面试策略', 'interview_strategy': '面试策略',
    'interview_skill': '面试策略', 'interview': '面试策略',
    'interview_technique': '面试策略',

    # 求职策略
    '求职策略': '求职策略', '求职技巧': '求职策略', '求职心态': '求职策略',
    '签证策略': '求职策略', '投递策略': '求职策略', '投递渠道': '求职策略',
    'job_search_strategy': '求职策略', 'job_search': '求职策略',
    'networking': '求职策略', 'actionable': '求职策略',
    'reality_check': '求职策略', 'expectation_setting': '求职策略',
    'ethics': '求职策略',

    # 职业规划
    '职业规划': '职业规划', '行业认知': '职业规划', '市场认知': '职业规划',
    '知识讲解': '职业规划', '作品集策略': '职业规划', '经历包装': '职业规划',
    '身份规划': '职业规划',
    'career_planning': '职业规划', 'industry_knowledge': '职业规划',
    'industry_trend': '职业规划', 'market_insight': '职业规划',
    'mindset': '职业规划', 'diagnosis': '职业规划', 'diagnostic': '职业规划',
    'GAP分析': '职业规划',

    # fallback for english catch-alls
    'general': '方向聚焦', 'tactical': '求职策略', 'specific': '结构调整',
    'conceptual': '职业规划', 'process': '求职策略',
    'communication': '面试策略', 'case_analysis': '面试策略',
    'project_development': '项目包装', 'project_description': '项目包装',
    'methodology': '结构调整', 'resource': '求职策略', 'salary': '职业规划',
    'skill_building': '技能补强',
    '技能板块': '结构调整',
}

cur.execute('SELECT DISTINCT advice_type FROM segments')
existing = [r[0] for r in cur.fetchall()]
unmapped = [v for v in existing if v and v not in ADVICE_TYPE_MAP]
print(f'advice_type unmapped ({len(unmapped)}): {unmapped}')

updated = 0
for old, new in ADVICE_TYPE_MAP.items():
    cur.execute('UPDATE segments SET advice_type = ? WHERE advice_type = ?', (new, old))
    updated += cur.rowcount
print(f'advice_type rows updated: {updated}')


# ── 2. L1 → 5 canonical Simplified Chinese values ───────────────────────────
L1_MAP = {
    # 简历内容
    '简历内容': '简历内容', '简歷內容': '简历内容', '简歷內容': '简历内容',
    '简历': '简历内容', '简历优化': '简历内容', '简历写作': '简历内容',
    '简历策略': '简历内容', '经历描述': '简历内容', '格式规范': '简历内容',
    '项目展示': '简历内容',

    # 求职策略
    '求职策略': '求职策略', '求職策略': '求职策略', '求职': '求职策略',
    '求职技巧': '求职策略', '求职辅导': '求职策略', '求职准备': '求职策略',
    '求职规划': '求职策略', '求职定位': '求职策略', '求职认知': '求职策略',
    '求职心态': '求职策略', '国际学生求职': '求职策略',

    # 面试准备
    '面试准备': '面试准备', '面試準備': '面试准备', '面试技巧': '面试准备',
    '面试': '面试准备', '面试準備': '面试准备',

    # 职业规划
    '职业规划': '职业规划', '職業規劃': '职业规划', '职业规劃': '职业规划',
    '职业发展': '职业规划', '职业定位': '职业规划', '职业认知': '职业规划',
    '职业转型': '职业规划', '市场营销求职': '职业规划',
    '咨询方向求职': '职业规划', '数据分析求职': '职业规划',
    '行业知识': '职业规划', '作品集建设': '职业规划',
    '专业知识': '职业规划', '市场营销求职': '职业规划',
    '学业': '职业规划',

    # 技能提升
    '技能提升': '技能提升', '技术知识': '技能提升', '技能板块': '技能提升',
    '技能发展': '技能提升', '技能技术': '技能提升', '技术技能': '技能提升',
    '数据与分析技能': '技能提升',
}

cur.execute('SELECT DISTINCT L1 FROM segments')
existing_l1 = [r[0] for r in cur.fetchall()]
unmapped_l1 = [v for v in existing_l1 if v and v not in L1_MAP]
print(f'L1 unmapped ({len(unmapped_l1)}): {unmapped_l1}')

updated_l1 = 0
for old, new in L1_MAP.items():
    cur.execute('UPDATE segments SET L1 = ? WHERE L1 = ?', (new, old))
    updated_l1 += cur.rowcount
print(f'L1 rows updated: {updated_l1}')


# ── 3. L2 → merge Traditional/Simplified duplicates for top values ───────────
L2_MAP = {
    # 工作经历
    '工作经歷': '工作经历', '工作經歷': '工作经历',
    # 项目描述
    '項目描述': '项目描述',
    # 行为面试
    '行為面試': '行为面试', '行为面試': '行为面试',
    # 技术技能
    '技術技能': '技术技能',
    # 目标岗位定位
    '目标崗位定位': '目标岗位定位', '目標崗位定位': '目标岗位定位',
    # 技术面试
    '技術面試': '技术面试', '技术面試': '技术面试',
    # 投递渠道
    '投遞渠道': '投递渠道',
    # ATS机筛机制
    'ATS机篩機制': 'ATS机筛机制', 'ATS机篩机制': 'ATS机筛机制', 'ATS機篩機制': 'ATS机筛机制',
    # 竞争分析
    '競爭分析': '竞争分析',
    # 简历版本规划
    '簡歷版本規劃': '简历版本规划', '简历版本規劃': '简历版本规划',
    # 时间规划
    '時間規劃': '时间规划',
    # 软技能
    '軟技能': '软技能',
    # 个人总结
    '個人總結': '个人总结',
    # 证书资质
    '證書資質': '证书资质', '证書資質': '证书资质',
    # 转行路径
    '轉行路徑': '转行路径', '转行路徑': '转行路径',
    # 格式优化
    '格式優化': '格式优化',
    # 面试复盘
    '面试復盤': '面试复盘', '面試復盤': '面试复盘',
}

updated_l2 = 0
for old, new in L2_MAP.items():
    cur.execute('UPDATE segments SET L2 = ? WHERE L2 = ?', (new, old))
    updated_l2 += cur.rowcount
print(f'L2 rows updated: {updated_l2}')


# ── 4. generality → canonical categorical ────────────────────────────────────
# numeric: 0.85+ = universal, 0.75-0.85 = industry-specific, <0.75 = role-specific
# '5' = universal, '4' = industry-specific, '3' = role-specific
# 'high' = universal, 'medium' = industry-specific
GENERALITY_LITERAL = {
    'high': 'universal', 'medium': 'industry-specific',
    '5': 'universal', '4': 'industry-specific', '3': 'role-specific',
    '': None,
}
for old, new in GENERALITY_LITERAL.items():
    if new is None:
        cur.execute('UPDATE segments SET generality = NULL WHERE generality = ?', (old,))
    else:
        cur.execute('UPDATE segments SET generality = ? WHERE generality = ?', (new, old))

# numeric floats stored as text
cur.execute("SELECT DISTINCT generality FROM segments WHERE generality NOT IN ('universal','industry-specific','role-specific') AND generality IS NOT NULL")
remaining = cur.fetchall()
for (val,) in remaining:
    try:
        f = float(val)
        if f >= 0.85:
            new = 'universal'
        elif f >= 0.75:
            new = 'industry-specific'
        else:
            new = 'role-specific'
        cur.execute('UPDATE segments SET generality = ? WHERE generality = ?', (new, val))
    except (ValueError, TypeError):
        pass

cur.execute("SELECT DISTINCT generality FROM segments")
print(f'generality distinct after: {[r[0] for r in cur.fetchall()]}')


# ── 5. confidence → canonical categorical ────────────────────────────────────
CONFIDENCE_LITERAL = {
    '5': 'high', '': None,
}
for old, new in CONFIDENCE_LITERAL.items():
    if new is None:
        cur.execute('UPDATE segments SET confidence = NULL WHERE confidence = ?', (old,))
    else:
        cur.execute('UPDATE segments SET confidence = ? WHERE confidence = ?', (new, old))

cur.execute("SELECT DISTINCT confidence FROM segments WHERE confidence NOT IN ('high','medium','low') AND confidence IS NOT NULL")
remaining = cur.fetchall()
for (val,) in remaining:
    try:
        f = float(val)
        if f >= 0.88:
            new = 'high'
        elif f >= 0.78:
            new = 'medium'
        else:
            new = 'low'
        cur.execute('UPDATE segments SET confidence = ? WHERE confidence = ?', (new, val))
    except (ValueError, TypeError):
        pass

cur.execute("SELECT DISTINCT confidence FROM segments")
print(f'confidence distinct after: {[r[0] for r in cur.fetchall()]}')


conn.commit()
conn.close()
print('Done.')
