import sqlite3, sys
sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('mentor_kb-v5.db')
cur = conn.cursor()

# Each entry: (id, field, value)
fixes = [
    # ── Fill empty A_action ───────────────────────────────────────────────────
    (1856, 'A_action', '面试后系统复盘：记录被问到的每道技术题（如ADC型号、示波器操作、焊接细节）和行为题；对答不上的技术细节在课后找资料补全，同时练习英语听力以减少听不清题意的情况。'),
    (2408, 'A_action', '先评估自身Python/C编程能力及现有项目经历的含金量；区分高中夏令营项目与大学正式课程项目，只将大学阶段有实质贡献的项目写入简历，高中项目建议删除。'),
    (2435, 'A_action', '求职DA岗位时，优先掌握SQL、数据清洗、可视化等核心DA技能，不必强求补全Random Forest等机器学习模型；将有限时间集中在最高频的面试考点上，而非追求全面覆盖ML知识体系。'),
    (4726, 'A_action', '向导师提供更完整的实习细节（具体业务背景、使用工具、任务输出），让导师有足够信息提炼出清晰的bullet point框架；信息越具体，简历改写质量越高。'),
    (5384, 'A_action', '将PE实习经历中的可迁移技能（如数据分析、流程管理、跨部门沟通）重新包装，去除金融术语，改用Operations/BA通用语言描述；投递Operations和Business Analyst方向岗位时主打"系统思维+执行力"而非"金融专业"。'),
    (6040, 'A_action', '继续积极投递，咨询行业背景已足以获得面试机会；重点将简历文字表达精炼，确保每条bullet点突出具体贡献和可量化成果，而非仅描述职责。'),
    (7163, 'A_action', '评估自身差异化竞争力，考虑在DA基础上叠加数据可视化、商业分析或特定行业知识（如医疗、金融数据）等细分优势；同时不排除技术要求更高的Data Engineer或Analytics Engineer方向以减少竞争者数量。'),
    (7881, 'A_action', '系统复习DCF估值、利率复利、financial statement分析等金融分析基础概念，直到能流畅讲解而无需临时查资料；可通过YouTube金融入门课或CFA Level 1材料进行自学。'),
    (8539, 'A_action', '记忆并熟练使用DRC违规的标准英文术语：short（线间短路）、open（断路）、wrong net（错误连接）、spacing violation（间距违规）；面试中用专业术语作答，避免用口语化描述（如"线打架"）降低专业印象。'),
    (10844, 'A_action', '提前评估老年照护相关岗位的市场容量；若目标岗位极为稀缺，主动拓展横向迁移方向（如VR辅助、辅助设备设计、healthcare technology），补充相关项目经历或技能以拓宽求职面。'),
    (11150, 'A_action', '优先通过校内实验室、导师项目或线上开源项目尽快补充实践经历；若短期内无法获得正式实习，可做个人项目并发布GitHub，以项目质量弥补实习和科研空白。'),
    (11378, 'A_action', '在当前市场环境下，将投递范围从纯Data职能扩展到Business Intelligence、Operations Analytics、Growth Analyst等偏业务侧的数据岗位；同时针对仍在扩张的行业（如AI、医疗、能源）集中投递。'),
    (11564, 'A_action', '通过YouTube金融入门课或CFA Level 1学习材料，系统补习DCF估值、利率复利（interest rate compounding）、P&L报表解读等基础金融概念；建立能在面试中流畅作答的知识储备，弥补本科经济课程中的金融知识缺口。'),
    (11671, 'A_action', '将法律实习经历中的口语描述替换为法律行业标准动词：将"查资料"改为"conducted legal research"，将"整理文件"改为"drafted legal documents"或"organized case files"，确保HR和律师一眼识别出专业法律工作经验。'),

    # ── Fix truncated A_action ────────────────────────────────────────────────
    (3607, 'A_action', '当面试中遇到一时想不起来的问题，先说"That\'s a good question. Can I have a moment to think?"争取10秒思考时间，避免仓促作答；同时准备面试中的新story，不要重复简历上已有的内容。'),
    (9208, 'A_action', '删除实习经历中含"learn"、"from scratch"、"helped"等被动学习词汇，改用主动贡献动词（如"implemented"、"developed"、"contributed to"）；若在特定team工作，务必写明team名称以提升简历可信度。'),

    # ── Fix truncated I_insight ───────────────────────────────────────────────
    (2299, 'I_insight', '面试官通常不会明确区分"这是技术问题还是行为问题"，两者往往混杂出现；候选人需要在同一回答中灵活切换技术细节与行为案例，这种灵活性本身就是考察点。'),
    (3607, 'I_insight', '面试中主动争取思考时间是专业应对难题的标准策略；与其仓促给出不完整答案，用礼貌缓冲语句争取思考时间，更能展示候选人的从容和系统性思维，同时面试分享的story应补充简历上没有体现的新信息。'),
    (4170, 'I_insight', '导师采用"最有影响力的一件事是什么"这一追问框架，帮助候选人聚焦在最能体现贡献价值的交付物上；简历bullet的核心是传递"你做成了什么"而非"你参与了什么"。'),
    (9208, 'I_insight', '实习简历的核心信号是"我来创造价值"而非"我来学习"；使用主动动词和具体成果描述，能让面试官看到候选人作为独立贡献者的潜力，"learn"等学习型词汇会削弱这一信号。'),
    (11564, 'I_insight', '金融分析类岗位（如投资分析、equity research）通常要求候选人掌握DCF、interest rate compounding等基础金融概念；若本科课程未覆盖，需在申请前通过自学填补差距，否则难以通过技术面试筛选。'),
]

for row_id, field, value in fixes:
    cur.execute(f'UPDATE segments SET {field} = ? WHERE id = ?', (value, row_id))
    print(f'  id={row_id} {field}: {cur.rowcount} updated')

conn.commit()

# Final status
cur.execute("""
    SELECT COUNT(*) FROM segments
    WHERE LENGTH(TRIM(COALESCE(A_action,''))) < 20
       OR LENGTH(TRIM(COALESCE(I_insight,''))) < 20
""")
remaining = cur.fetchone()[0]
print(f'\nRemaining stub rows: {remaining}')

# Show what's left
if remaining > 0:
    cur.execute("""
        SELECT id, A_action, I_insight FROM segments
        WHERE LENGTH(TRIM(COALESCE(A_action,''))) < 20
           OR LENGTH(TRIM(COALESCE(I_insight,''))) < 20
        LIMIT 30
    """)
    for r in cur.fetchall():
        print(f'  id={r[0]}  A=[{(r[1] or "")[:50]}]  I=[{(r[2] or "")[:50]}]')

conn.close()
print('Done.')
