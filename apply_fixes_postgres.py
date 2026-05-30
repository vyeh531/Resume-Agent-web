"""
Apply all segment data fixes to Postgres vibe_offer.segments.
Consolidated from all the SQLite fix scripts we ran today.
"""
import psycopg2, json, re, os, sys
sys.stdout.reconfigure(encoding='utf-8')

for l in open('.env'):
    k, *v = l.strip().split('=')
    if k and v: os.environ.setdefault(k.strip(), '='.join(v).strip())

conn = psycopg2.connect(os.environ['DATABASE_URL'], options='-c search_path=vibe_offer')
cur = conn.cursor()

def count(label):
    cur.execute('SELECT COUNT(*) FROM segments')
    print(f'{label}: {cur.fetchone()[0]} rows')

def run_updates(updates, label):
    n = 0
    for old, new, field in updates:
        cur.execute(f'UPDATE segments SET "{field}" = %s WHERE "{field}" = %s', (new, old))
        n += cur.rowcount
    conn.commit()
    print(f'{label}: {n} rows updated')

count('Start')

# ════════════════════════════════════════════════════════════════
# 1. advice_type → 10 canonical Simplified Chinese values
# ════════════════════════════════════════════════════════════════
print('\n── advice_type normalization ──')
ADVICE_TYPE_MAP = {
    '方向聚焦':'方向聚焦','战略规划':'方向聚焦','战术建议':'方向聚焦','方向选择':'方向聚焦',
    '方向规划':'方向聚焦','职业定位':'方向聚焦','strategy':'方向聚焦','strategic':'方向聚焦',
    'direction':'方向聚焦','positioning':'方向聚焦','reframe':'方向聚焦','career_path':'方向聚焦',
    '心态策略':'求职策略','职场策略':'求职策略','求职认知':'求职策略','签证策略':'求职策略',
    '投递策略':'求职策略','投递渠道':'求职策略','求职策略':'求职策略','求职技巧':'求职策略',
    '求职心态':'求职策略','job_search_strategy':'求职策略','job_search':'求职策略',
    'networking':'求职策略','actionable':'求职策略','reality_check':'求职策略',
    'expectation_setting':'求职策略','ethics':'求职策略','process':'求职策略',
    'communication':'求职策略','resource':'求职策略',
    '项目包裝':'项目包装','項目包裝':'项目包装','项目包装':'项目包装','经历包装':'项目包装',
    '经历构建':'项目包装','项目叙事':'项目包装','内容挖掘':'项目包装','简历包装':'项目包装',
    'project_framing':'项目包装','project_presentation':'项目包装','narrative':'项目包装',
    'project_strategy':'项目包装','project_development':'项目包装','project_description':'项目包装',
    '结构调整':'结构调整','結構調整':'结构调整','结構調整':'结构调整','结构調整':'结构调整',
    '简历优化':'结构调整','简历技巧':'结构调整','简历策略':'结构调整','简历写作':'结构调整',
    '简历版本规划':'结构调整','簡歷版本規劃':'结构调整','内容策略':'结构调整','简历改写':'结构调整',
    'resume_writing':'结构调整','resume':'结构调整','resume_advice':'结构调整',
    'resume_strategy':'结构调整','resume_content':'结构调整','framework':'结构调整',
    'methodology':'结构调整','specific':'结构调整','技能板块':'结构调整',
    '格式优化':'格式优化','格式優化':'格式优化','resume_format':'格式优化',
    '关键词匹配':'关键词匹配','關鍵詞匹配':'关键词匹配','关键詞匹配':'关键词匹配',
    'ATS机筛机制':'关键词匹配',
    '量化成果':'量化成果',
    '技能补强':'技能补强','技能補強':'技能补强','技能补強':'技能补强','技术备考':'技能补强',
    '技能规划':'技能补强','技能建议':'技能补强','skill_building':'技能补强',
    'technical':'技能补强','study_plan':'技能补强','drill':'技能补强','技术知识':'技能补强',
    '面试策略':'面试策略','面試策略':'面试策略','面试技巧':'面试策略','面试准备':'面试策略',
    'interview_prep':'面试策略','interview_strategy':'面试策略','interview_skill':'面试策略',
    'interview':'面试策略','interview_technique':'面试策略','interview_strategy':'面试策略',
    '职业规划':'职业规划','行业认知':'职业规划','市场认知':'职业规划','知识讲解':'职业规划',
    '作品集策略':'职业规划','身份规划':'职业规划','薪资参考':'职业规划','职业认知':'职业规划',
    '岗位认知':'职业规划','竞争分析':'方向聚焦','思维框架':'方向聚焦',
    'career_planning':'职业规划','industry_knowledge':'职业规划','industry_trend':'职业规划',
    'market_insight':'职业规划','mindset':'职业规划','diagnosis':'职业规划','diagnostic':'职业规划',
    'GAP分析':'职业规划','salary':'职业规划',
    'general':'方向聚焦','tactical':'求职策略','conceptual':'职业规划','case_analysis':'面试策略',
    'interview_technique':'面试策略','resume_format':'格式优化',
}
for old, new in ADVICE_TYPE_MAP.items():
    cur.execute('UPDATE segments SET advice_type = %s WHERE advice_type = %s', (new, old))
# Clear empty
cur.execute("UPDATE segments SET advice_type = '方向聚焦' WHERE advice_type = '' OR advice_type IS NULL")
conn.commit()
cur.execute("SELECT advice_type, COUNT(*) n FROM segments GROUP BY advice_type ORDER BY n DESC")
rows = cur.fetchall()
print(f'  → {len(rows)} distinct values')
for v, n in rows: print(f'    {n:5d}  {v}')

# ════════════════════════════════════════════════════════════════
# 2. L1 → 5 canonical Simplified Chinese values
# ════════════════════════════════════════════════════════════════
print('\n── L1 normalization ──')
L1_MAP = {
    '简历内容':'简历内容','简歷內容':'简历内容','简歷內容':'简历内容','简歷內容':'简历内容',
    '简历':'简历内容','简历优化':'简历内容','简历写作':'简历内容','简历策略':'简历内容',
    '经历描述':'简历内容','格式规范':'简历内容','项目展示':'简历内容','项目经历':'简历内容',
    '求职策略':'求职策略','求職策略':'求职策略','求职':'求职策略','求职技巧':'求职策略',
    '求职辅导':'求职策略','求职准备':'求职策略','求职规划':'求职策略','求职定位':'求职策略',
    '求职认知':'求职策略','求职心态':'求职策略','国际学生求职':'求职策略','职场策略':'求职策略',
    '面试准备':'面试准备','面試準備':'面试准备','面试技巧':'面试准备','面试':'面试准备',
    '面试準備':'面试准备',
    '职业规划':'职业规划','職業規劃':'职业规划','职业规劃':'职业规划','职业規劃':'职业规划',
    '职业发展':'职业规划','职业定位':'职业规划','职业认知':'职业规划','职业转型':'职业规划',
    '市场营销求职':'职业规划','咨询方向求职':'职业规划','数据分析求职':'职业规划',
    '行业知识':'职业规划','作品集建设':'职业规划','专业知识':'职业规划','学业':'职业规划',
    '技能提升':'技能提升','技术知识':'技能提升','技能板块':'技能提升','技能发展':'技能提升',
    '技术技能':'技能提升','数据与分析技能':'技能提升','学习策略':'技能提升',
    '项目开发':'技能提升','数据思维':'技能提升','职场技能':'技能提升',
}
for old, new in L1_MAP.items():
    cur.execute('UPDATE segments SET "L1" = %s WHERE "L1" = %s', (new, old))
conn.commit()
cur.execute('SELECT "L1", COUNT(*) n FROM segments GROUP BY "L1" ORDER BY n DESC')
rows = cur.fetchall()
print(f'  → {len(rows)} distinct values')
for v, n in rows: print(f'    {n:5d}  {v}')

# ════════════════════════════════════════════════════════════════
# 3. L2 → merge Traditional/Simplified duplicates
# ════════════════════════════════════════════════════════════════
print('\n── L2 normalization ──')
L2_MAP = {
    '工作经歷':'工作经历','工作經歷':'工作经历','項目描述':'项目描述','行為面試':'行为面试',
    '行为面試':'行为面试','技術技能':'技术技能','目标崗位定位':'目标岗位定位',
    '目標崗位定位':'目标岗位定位','技術面試':'技术面试','技术面試':'技术面试',
    '投遞渠道':'投递渠道','ATS机篩機制':'ATS机筛机制','ATS机篩机制':'ATS机筛机制',
    'ATS機篩機制':'ATS机筛机制','競爭分析':'竞争分析','簡歷版本規劃':'简历版本规划',
    '简历版本規劃':'简历版本规划','時間規劃':'时间规划','軟技能':'软技能',
    '個人總結':'个人总结','證書資質':'证书资质','证書資質':'证书资质',
    '轉行路徑':'转行路径','转行路徑':'转行路径','格式優化':'格式优化',
    '面试復盤':'面试复盘','面試復盤':'面试复盘',
}
n_l2 = 0
for old, new in L2_MAP.items():
    cur.execute('UPDATE segments SET "L2" = %s WHERE "L2" = %s', (new, old))
    n_l2 += cur.rowcount
conn.commit()
print(f'  → {n_l2} rows updated')

# ════════════════════════════════════════════════════════════════
# 4. generality → categorical
# ════════════════════════════════════════════════════════════════
print('\n── generality normalization ──')
GENERALITY_LITERAL = {'high':'universal','medium':'industry-specific','5':'universal',
                      '4':'industry-specific','3':'role-specific'}
for old, new in GENERALITY_LITERAL.items():
    cur.execute('UPDATE segments SET generality = %s WHERE generality = %s', (new, old))
cur.execute("UPDATE segments SET generality = NULL WHERE generality = ''")
cur.execute("SELECT DISTINCT generality FROM segments WHERE generality NOT IN ('universal','industry-specific','role-specific') AND generality IS NOT NULL")
for (val,) in cur.fetchall():
    try:
        f = float(val)
        new = 'universal' if f >= 0.85 else ('industry-specific' if f >= 0.75 else 'role-specific')
        cur.execute('UPDATE segments SET generality = %s WHERE generality = %s', (new, val))
    except: pass
conn.commit()
cur.execute("SELECT generality, COUNT(*) n FROM segments GROUP BY generality ORDER BY n DESC")
print('  →', cur.fetchall())

# ════════════════════════════════════════════════════════════════
# 5. confidence → categorical
# ════════════════════════════════════════════════════════════════
print('\n── confidence normalization ──')
cur.execute("UPDATE segments SET confidence = 'high' WHERE confidence = '5'")
cur.execute("UPDATE segments SET confidence = NULL WHERE confidence = ''")
cur.execute("SELECT DISTINCT confidence FROM segments WHERE confidence NOT IN ('high','medium','low') AND confidence IS NOT NULL")
for (val,) in cur.fetchall():
    try:
        f = float(val)
        new = 'high' if f >= 0.88 else ('medium' if f >= 0.78 else 'low')
        cur.execute('UPDATE segments SET confidence = %s WHERE confidence = %s', (new, val))
    except: pass
conn.commit()
cur.execute("SELECT confidence, COUNT(*) n FROM segments GROUP BY confidence ORDER BY n DESC")
print('  →', cur.fetchall())

# ════════════════════════════════════════════════════════════════
# 6. topic → 29 canonical controlled-vocabulary tags
# ════════════════════════════════════════════════════════════════
print('\n── topic reclassification ──')
RULES = [
    ('简历内容','工作经历',None,'工作经历描述'),
    ('简历内容','项目描述',None,'项目经历描述'),
    ('简历内容','技能列表',None,'技能栏优化'),
    ('简历内容','技术技能',None,'技能栏优化'),
    ('简历内容','教育背景',None,'教育背景优化'),
    ('简历内容','格式优化',None,'简历格式规范'),
    ('简历内容','简历版本规划',None,'多版本简历策略'),
    ('简历内容','个人总结',None,'个人总结撰写'),
    ('简历内容','关键词匹配',None,'关键词布局'),
    ('简历内容','ATS',None,'关键词布局'),
    ('简历内容',None,'量化成果','简历量化成果'),
    ('简历内容',None,'结构调整','简历结构调整'),
    ('简历内容',None,'格式优化','简历格式规范'),
    ('简历内容',None,'项目包装','项目经历描述'),
    ('简历内容',None,'方向聚焦','简历定向策略'),
    ('简历内容',None,None,'简历内容优化'),
    ('求职策略','ATS',None,'ATS机筛策略'),
    ('求职策略','目标岗位定位',None,'目标岗位定位'),
    ('求职策略','方向定位',None,'目标岗位定位'),
    ('求职策略','投递渠道',None,'投递渠道规划'),
    ('求职策略','竞争分析',None,'市场竞争分析'),
    ('求职策略','时间规划',None,'求职时间规划'),
    ('求职策略','GAP分析',None,'背景差距分析'),
    ('求职策略','简历版本规划',None,'多版本简历策略'),
    ('求职策略',None,'关键词匹配','ATS机筛策略'),
    ('求职策略',None,'方向聚焦','目标岗位定位'),
    ('求职策略',None,None,'求职综合策略'),
    ('面试准备','行为面试',None,'行为面试备考'),
    ('面试准备','技术面试',None,'技术面试备考'),
    ('面试准备','面试复盘',None,'面试复盘改进'),
    ('面试准备',None,'面试策略','面试综合策略'),
    ('面试准备',None,None,'面试综合策略'),
    ('职业规划','GAP分析',None,'背景差距分析'),
    ('职业规划','转行路径',None,'转行路径规划'),
    ('职业规划','方向定位',None,'职业方向选择'),
    ('职业规划','目标岗位定位',None,'职业方向选择'),
    ('职业规划','时间规划',None,'求职时间规划'),
    ('职业规划',None,'方向聚焦','职业方向选择'),
    ('职业规划',None,None,'职业发展规划'),
    ('技能提升','技术技能',None,'技术技能补强'),
    ('技能提升','软技能',None,'软技能发展'),
    ('技能提升','证书资质',None,'证书资质规划'),
    ('技能提升',None,'技能补强','技术技能补强'),
    ('技能提升',None,None,'技能综合提升'),
]

def classify(l1, l2, at):
    for r_l1, r_l2, r_at, topic in RULES:
        l1_ok = r_l1 is None or (l1 and r_l1 in l1)
        l2_ok = r_l2 is None or (l2 and r_l2 in l2)
        at_ok = r_at is None or (at and r_at in at)
        if l1_ok and l2_ok and at_ok:
            return topic
    return f'{l1} · {l2}' if l1 and l2 else (l1 or '其他')

cur.execute('SELECT id, "L1", "L2", advice_type FROM segments')
rows = cur.fetchall()
batch = [(classify(r[1], r[2], r[3]), r[0]) for r in rows]
cur.executemany('UPDATE segments SET topic = %s WHERE id = %s', batch)
conn.commit()
cur.execute('SELECT COUNT(DISTINCT topic) FROM segments')
print(f'  → {cur.fetchone()[0]} distinct topics')

# ════════════════════════════════════════════════════════════════
# 7. Fix specific bad I_insight rows (raw transcript text)
# ════════════════════════════════════════════════════════════════
print('\n── Fix bad I_insight & truncated A_action ──')
specific_fixes = [
    (380,'I_insight','项目版块在求职中的价值在于展示广度而非深度；3-4个项目各用简短描述的策略，能让招聘官感知候选人经验广博，有效弥补实习数量不足的劣势。'),
    (524,'I_insight','面试官评估海外求职者时，关注其能否将不同国家工作经验与所学知识有机整合；清晰叙述"中国实习+美国硕士知识→胜任美国岗位"的逻辑链条，能显著降低面试官对背景匹配度的疑虑。'),
    (528,'I_insight','会计求职存在两条平行路线：公共会计（事务所）和企业内部会计部门（private accounting）；了解两条路线差异并制定分层投递策略，能在不同规模机会中保持竞争力，避免孤注一掷。'),
    (532,'I_insight','大型事务所面试官对应届生的期望是"理解基本原则"而非"拥有大量工作经验"；面试重心在行为/情景题上，专注behavioral练习而非死记技术细节，符合大公司的实际考察逻辑。'),
    (563,'I_insight','面试官无法评估自己不熟悉领域的挑战程度；BQ故事须与目标岗位核心能力高度相关，让面试官能真正理解并认可挑战的难度，才能达到BQ的说服效果。'),
    (4631,'A_action','将每条bullet point改写为"执行内容 + contributing to [贡献/影响]"结构，确保每条经历描述均包含行动带来的具体贡献或业务影响，而非仅描述职责。'),
    (4631,'I_insight','简历中"做了什么"是基础门槛，"产生了什么影响"才是区分候选人质量的关键；contribution结尾结构让每条经历都能直接回答"为什么应该聘用你"这个核心问题。'),
    (20857,'A_action','对于非自己主导的项目，以"协助"、"支持"、"参与"等词汇诚实描述参与角色；将参与项目写入简历和作品集，展示广度和真实经历，不因非主导而放弃展示机会。'),
    (20857,'I_insight','经历的广度和真实性在求职市场同样重要；诚实描述参与角色而非虚报主导，既能展示实际参与的能力，又能避免面试被追问细节时露馅的风险。'),
    (24890,'A_action','将相关技术工具和功能合并为一句完整的bullet：以"使用[工具A]+[工具B]实现[功能]，优化[指标]"的句式，把分散在两条bullet的技术细节融合为逻辑连贯的单句描述。'),
    (24890,'I_insight','简历bullet point的信息密度决定阅读体验；将碎片化技术细节整合为单句完整表达，不仅节约空间，更能让招聘官一眼看清技术选型的完整逻辑链条，体现工程思维的系统性。'),
    # Truncated A_action
    (1740,'A_action','将学位与辅修专业合并为一行（如"BS in Business Administration, Minor in Applied Analytics and Cyber Security"），再用Tab键将GPA靠右对齐，节省一行纵向空间。'),
    (2630,'A_action','在简历项目描述中加入"Linear Regression to predict [目标变量]"等数据建模关键词；若项目中实际使用过回归分析，明确写出模型类型和预测目标，以体现数据分析能力。'),
    (2884,'A_action','将地址改写为"城市, 国家"格式（如"上海, China"）；上海为直辖市无需写省份，确保海外与国内地址格式保持一致。'),
    (9119,'A_action','评估自己各项目的开发耗时是否低于行业平均水平；若属于高效完成，在作品集对应项目中明确标注开发周期（如"1-2 weeks, solo project"），以开发效率作为差异化竞争力信号。'),
    (24769,'A_action','将项目用户数量写为5,000+（实际700-800亦属合理范围）；个人项目用户量低于万人级别不会触发技术难度质疑，保守合理放大数字有助于体现项目规模感。'),
    (26421,'A_action','在简历中写"CFA Level I Candidate"或"CFA Candidate, Level I, Expected [年份]"；出成绩前以候选人身份呈现，面试官关注的是积极追求专业认证的态度，而非证书是否已到手。'),
    # Bad I_insight (raw transcript)
    (16343,'A_action','在每条经历bullet point中以"developed [项目] with [工具名]"句式嵌入具体技术工具（如Python、SQL、Spark、TensorFlow），既刷ATS关键词，也让每条经历都有明确的技术信号。'),
    (16343,'I_insight','将工具名直接嵌入经历描述而非只列在Skills栏，是提升ATS关键词命中率的有效策略；面试官也能从项目描述中直接感知候选人的技术工具使用深度，而非依赖泛泛的技能清单。'),
    (23300,'A_action','将数据库设计相关术语写全称并在括号内注明简称，例如将"3NF"改写为"third normal form（3NF）"；数据来源类别使用"e.g., sales, inventory"等具体举例，让非专业背景的HR也能理解。'),
    (23300,'I_insight','简历中的技术缩写对HR等非技术读者不友好；全称加括号简称的格式兼顾专业准确性和可读性，既通过ATS关键词匹配，又确保技术面试官以外的读者能理解候选人的技术工作内容。'),
    # Remaining empty A_action (filled from context)
    (3607,'A_action','当面试中遇到一时想不起来的问题，先说"That\'s a good question. Can I have a moment to think?"争取10秒思考时间，避免仓促作答；同时准备面试中的新story，不要重复简历上已有的内容。'),
    (3607,'I_insight','面试中主动争取思考时间是专业应对难题的标准策略；与其仓促给出不完整答案，用礼貌缓冲语句争取思考时间，更能展示候选人的从容和系统性思维。'),
    (9208,'A_action','删除实习经历中含"learn"、"from scratch"、"helped"等被动学习词汇，改用主动贡献动词（如"implemented"、"developed"、"contributed to"）；若在特定team工作，务必写明team名称以提升简历可信度。'),
    (9208,'I_insight','实习简历的核心信号是"我来创造价值"而非"我来学习"；使用主动动词和具体成果描述，能让面试官看到候选人作为独立贡献者的潜力，"learn"等学习型词汇会削弱这一信号。'),
    (2299,'I_insight','面试官通常不会明确区分"这是技术问题还是行为问题"，两者往往混杂出现；候选人需要在同一回答中灵活切换技术细节与行为案例，这种灵活性本身就是考察点。'),
    (4170,'I_insight','导师采用"最有影响力的一件事是什么"这一追问框架，帮助候选人聚焦在最能体现贡献价值的交付物上；简历bullet的核心是传递"你做成了什么"而非"你参与了什么"。'),
    (11564,'I_insight','金融分析类岗位（如投资分析、equity research）通常要求候选人掌握DCF、interest rate compounding等基础金融概念；若本科课程未覆盖，需在申请前通过自学填补差距，否则难以通过技术面试筛选。'),
]

n = 0
for row_id, field, value in specific_fixes:
    cur.execute(f'UPDATE segments SET "{field}" = %s WHERE id = %s', (value, row_id))
    n += cur.rowcount
conn.commit()
print(f'  → {n} specific rows fixed')

# ════════════════════════════════════════════════════════════════
# 8. Heuristic stub fix: I_insight placeholders + empty A_action
# ════════════════════════════════════════════════════════════════
print('\n── Heuristic stub fix ──')
CHUNKS_PATH = r'C:\Users\viviy\Documents\GitHub\db_creator\data\chunks.json'
with open(CHUNKS_PATH, encoding='utf-8') as f:
    chunk_map = {c['chunk_id']: c['text'] for c in json.load(f)}

PLACEHOLDER = {'（无）','（无具体示例）','无','(无)',''}
INSIGHT_KW = ['因为','原因','关键','本质','核心','重要','才能','才会','因此','导致','决定','影响','原则','规律']
ACTION_STARTERS = ['建议','推荐','需要','应该','要','把','将','可以','必须','确保','优先','删除','增加','补充','调整','改写','通过','用','针对']

def clean_chunk(text):
    out = []
    for l in text.split('\n'):
        l = l.strip()
        m = re.match(r'^L\d+:\s*(.*)', l)
        if m:
            c = m.group(1).strip()
            if c and not re.match(r'^\d{4}-\d{2}', c) and not re.match(r'^[\w\s]+\s\d{2}:\d{2}:\d{2}', c) and len(c) > 5:
                out.append(c)
    return ''.join(out)

def split_sents(text):
    return [s.strip() for s in re.split(r'[。！？；\n]', text) if len(s.strip()) > 10]

def extract_insight(chunk, topic, a):
    clean = clean_chunk(chunk)
    scored = []
    for s in split_sents(clean):
        sc = sum(1 for kw in INSIGHT_KW if kw in s)
        sc += sum(1 for w in re.findall(r'[一-鿿]{2,}', topic or '') if w in s)
        if sc > 0: scored.append((sc, s))
    if not scored: return ''
    scored.sort(reverse=True)
    return '；'.join(s for _, s in scored[:2])[:200]

def extract_action(chunk, topic, p):
    clean = clean_chunk(chunk)
    scored = []
    for s in split_sents(clean):
        sc = sum(1 for st in ACTION_STARTERS if s.startswith(st) or f'，{st}' in s)
        sc += sum(1 for w in re.findall(r'[一-鿿]{2,}', topic or '') if w in s)
        if sc > 0: scored.append((sc, s))
    if not scored: return ''
    scored.sort(reverse=True)
    return '；'.join(s for _, s in scored[:2])[:250]

cur.execute("""
    SELECT id, chunk_id, topic, "P_mentor", "A_action", "I_insight", "H_hook"
    FROM segments
    WHERE LENGTH(TRIM(COALESCE("A_action",''))) < 20
       OR LENGTH(TRIM(COALESCE("I_insight",''))) < 20
       OR TRIM(COALESCE("I_insight",'')) IN ('（无）','（无具体示例）','无','(无)')
""")
stub_rows = cur.fetchall()
fixed_i = fixed_a = 0
for row in stub_rows:
    rid, chunk_id, topic, p, a, i, h = row
    chunk = chunk_map.get(chunk_id or '', '')
    updates = {}
    a_str = (a or '').strip()
    i_str = (i or '').strip()
    if i_str in PLACEHOLDER or len(i_str) < 15:
        new_i = extract_insight(chunk, topic, a_str)
        if new_i and len(new_i) > 20:
            updates['I_insight'] = new_i
            fixed_i += 1
    if not a_str:
        new_a = extract_action(chunk, topic, p)
        if new_a and len(new_a) > 20:
            updates['A_action'] = new_a
            fixed_a += 1
    if updates:
        set_clause = ', '.join(f'"{k}" = %s' for k in updates)
        cur.execute(f'UPDATE segments SET {set_clause} WHERE id = %s', list(updates.values()) + [rid])

conn.commit()
print(f'  → I_insight filled: {fixed_i}, A_action filled: {fixed_a}')

# ════════════════════════════════════════════════════════════════
# Final stats
# ════════════════════════════════════════════════════════════════
print('\n── Final verification ──')
cur.execute("SELECT COUNT(DISTINCT advice_type) FROM segments")
print(f'advice_type distinct: {cur.fetchone()[0]}')
cur.execute('SELECT COUNT(DISTINCT "L1") FROM segments')
print(f'L1 distinct: {cur.fetchone()[0]}')
cur.execute('SELECT COUNT(DISTINCT topic) FROM segments')
print(f'topic distinct: {cur.fetchone()[0]}')
cur.execute("SELECT COUNT(*) FROM segments WHERE LENGTH(TRIM(COALESCE(\"A_action\",''))) < 20 OR LENGTH(TRIM(COALESCE(\"I_insight\",''))) < 20")
print(f'stub rows remaining: {cur.fetchone()[0]}')

conn.close()
print('\nAll done. Postgres vibe_offer.segments updated.')
