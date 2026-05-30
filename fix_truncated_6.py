import sqlite3, sys
sys.stdout.reconfigure(encoding='utf-8')
conn = sqlite3.connect('mentor_kb-v5.db')
cur = conn.cursor()

fixes = {
    1740: '将学位与辅修专业合并为一行（如"BS in Business Administration, Minor in Applied Analytics and Cyber Security"），再用Tab键将GPA靠右对齐，节省一行纵向空间。',

    2630: '在简历项目描述中加入"Linear Regression to predict [目标变量]"等数据建模关键词；若项目中实际使用过回归分析，明确写出模型类型和预测目标，以体现数据分析能力。',

    2884: '将地址改写为"城市, 国家"格式（如"上海, China"）；上海为直辖市无需写省份，确保海外与国内地址格式保持一致。',

    9119: '评估自己各项目的开发耗时是否低于行业平均水平；若属于高效完成，在作品集对应项目中明确标注开发周期（如"1-2 weeks, solo project"），以开发效率作为差异化竞争力信号。',

    24769: '将项目用户数量写为5,000+（实际700-800亦属合理范围）；个人项目用户量低于万人级别不会触发技术难度质疑，保守合理放大数字有助于体现项目规模感。',

    26421: '在简历中写"CFA Level I Candidate"或"CFA Candidate, Level I, Expected [年份]"；出成绩前以候选人身份呈现，面试官关注的是积极追求专业认证的态度，而非证书是否已到手。',
}

for row_id, new_a in fixes.items():
    cur.execute('UPDATE segments SET A_action = ? WHERE id = ?', (new_a, row_id))
    print(f'  id={row_id}: updated ({cur.rowcount} row)')

conn.commit()

# Final check
cur.execute("""
    SELECT COUNT(*) FROM segments
    WHERE LENGTH(TRIM(COALESCE(A_action,''))) < 20
       OR LENGTH(TRIM(COALESCE(I_insight,''))) < 20
""")
print(f'\nRemaining stub rows (< 20 chars): {cur.fetchone()[0]}')

# Show what's left if any
cur.execute("""
    SELECT id, A_action, I_insight FROM segments
    WHERE LENGTH(TRIM(COALESCE(A_action,''))) < 20
       OR LENGTH(TRIM(COALESCE(I_insight,''))) < 20
    LIMIT 20
""")
for r in cur.fetchall():
    print(f'  id={r[0]}  A=[{r[1]}]  I=[{r[2]}]')

conn.close()
print('Done.')
