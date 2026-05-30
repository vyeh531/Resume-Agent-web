import sys
sys.stdout.reconfigure(encoding='utf-8')
import sqlite3
import random
import re
from collections import Counter

DB = r'C:\Users\viviy\Documents\GitHub\Resume-Agent-MVP\mentor_kb-v5.db'
conn = sqlite3.connect(DB)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

PLAIEHT = ['P_mentor', 'A_action', 'I_insight', 'H_hook', 'E_example', 'HR_os']

print("=" * 70)
print("SEGMENTS TABLE QUALITY AUDIT")
print("=" * 70)

# ── 1. NULL / EMPTY RATES ────────────────────────────────────────────────────
print("\n### 1. NULL / EMPTY FIELD RATES ###\n")
cur.execute("SELECT COUNT(*) FROM segments")
total = cur.fetchone()[0]
print(f"Total rows: {total}\n")

null_rates = {}
for field in PLAIEHT:
    cur.execute(f"SELECT COUNT(*) FROM segments WHERE {field} IS NULL OR TRIM({field})=''")
    n = cur.fetchone()[0]
    pct = n / total * 100
    null_rates[field] = pct
    flag = " *** HIGH ***" if pct > 30 else (" *" if pct > 10 else "")
    print(f"  {field:12s}: {n:6d} / {total}  ({pct:.1f}%){flag}")

# ── 2. LENGTH DISTRIBUTIONS ──────────────────────────────────────────────────
print("\n### 2. LENGTH DISTRIBUTIONS (chars) ###\n")
print(f"  {'Field':12s} {'min':>6} {'avg':>7} {'max':>7}  flag")
for field in PLAIEHT:
    cur.execute(f"""
        SELECT MIN(LENGTH({field})), AVG(LENGTH({field})), MAX(LENGTH({field}))
        FROM segments
        WHERE {field} IS NOT NULL AND TRIM({field}) != ''
    """)
    mn, av, mx = cur.fetchone()
    av = round(av, 1) if av else 0
    flag = " *** avg<30 ***" if av and av < 30 else ""
    print(f"  {field:12s} {(mn or 0):>6} {av:>7} {(mx or 0):>7} {flag}")

# ── 3. DUPLICATE DETECTION ───────────────────────────────────────────────────
print("\n### 3. DUPLICATE DETECTION ###\n")

cur.execute("""
    SELECT COUNT(*) FROM (
        SELECT P_mentor, A_action FROM segments
        WHERE P_mentor IS NOT NULL AND A_action IS NOT NULL
        GROUP BY P_mentor, A_action HAVING COUNT(*) > 1
    )
""")
dup_pa = cur.fetchone()[0]
print(f"  (P_mentor, A_action) duplicate groups : {dup_pa}")

cur.execute("""
    SELECT COUNT(*) FROM (
        SELECT P_mentor, A_action, COUNT(*) as cnt FROM segments
        WHERE P_mentor IS NOT NULL AND A_action IS NOT NULL
        GROUP BY P_mentor, A_action HAVING COUNT(*) > 1
    )
""")
# total rows that are in dup groups
cur.execute("""
    SELECT SUM(cnt) FROM (
        SELECT COUNT(*) as cnt FROM segments
        WHERE P_mentor IS NOT NULL AND A_action IS NOT NULL
        GROUP BY P_mentor, A_action HAVING COUNT(*) > 1
    )
""")
dup_rows = cur.fetchone()[0] or 0
print(f"  Rows involved in (P_mentor, A_action) dups: {dup_rows} ({dup_rows/total*100:.1f}%)")

cur.execute("""
    SELECT topic, COUNT(*) as cnt FROM segments GROUP BY topic ORDER BY cnt DESC LIMIT 5
""")
print("\n  Top 5 topics by row count:")
for r in cur.fetchall():
    print(f"    {r['topic']:40s}  {r['cnt']}")

# ── 4. CONTENT QUALITY SAMPLING ──────────────────────────────────────────────
print("\n### 4. CONTENT QUALITY SAMPLING (10 random rows) ###\n")
cur.execute("SELECT id, P_mentor, A_action, I_insight, H_hook FROM segments ORDER BY RANDOM() LIMIT 10")
rows = cur.fetchall()

vague_action_patterns = ['改善', '优化', '提升', '加强', '注意', '确保', '提高', '增强', '完善', '做好']
hook_quality_issues = 0
action_vague_count = 0
insight_restate_count = 0

for i, r in enumerate(rows, 1):
    print(f"  --- Row {i} (id={r['id']}) ---")
    h = r['H_hook'] or ''
    a = r['A_action'] or ''
    ins = r['I_insight'] or ''
    p = r['P_mentor'] or ''

    # Hook quality: should be quote-like (Chinese, colloquial)
    has_first_person = '我' in h or '你' in h or '我们' in h
    is_short = len(h) < 20
    hook_ok = has_first_person and not is_short
    if not hook_ok:
        hook_quality_issues += 1

    # Action specificity
    is_vague = any(h in a for h in vague_action_patterns) and len(a) < 60
    if is_vague:
        action_vague_count += 1

    # Insight vs action overlap (first 30 chars)
    overlap = a[:30] if a else ''
    if overlap and overlap in ins:
        insight_restate_count += 1

    print(f"    H_hook   [{len(h):3d}c]: {h[:80]}")
    print(f"    A_action [{len(a):3d}c]: {a[:80]}")
    print(f"    I_insight[{len(ins):3d}c]: {ins[:80]}")
    hook_note = "OK" if hook_ok else "ISSUE: no 1st-person or too short"
    action_note = "VAGUE" if is_vague else "OK"
    print(f"    >> Hook: {hook_note} | Action: {action_note}")
    print()

print(f"  Summary of 10 sampled rows:")
print(f"    Hook quality issues : {hook_quality_issues}/10")
print(f"    Vague actions       : {action_vague_count}/10")
print(f"    Insight=Action restate: {insight_restate_count}/10")

# ── 5. FIELD CONFUSION CHECK ─────────────────────────────────────────────────
print("\n### 5. FIELD CONFUSION CHECK (P_mentor framing) ###\n")
cur.execute("SELECT id, P_mentor FROM segments WHERE P_mentor IS NOT NULL ORDER BY RANDOM() LIMIT 20")
rows5 = cur.fetchall()
problem_framing = ['候选人', '用户', '求职者', '他', '她', '该']
action_verbs = ['把', '将', '用', '在', '添加', '修改', '删除', '优化', '改', '写', '做', '加', '去', '让']
wrong_frame = 0
for r in rows5:
    p = (r['P_mentor'] or '').strip()
    starts_with_action = any(p.startswith(v) for v in action_verbs)
    starts_with_problem = any(p.startswith(v) for v in problem_framing) or '问题' in p[:20] or '不' in p[:10]
    if starts_with_action:
        wrong_frame += 1
        print(f"  id={r['id']} [ACTION-FRAMED P_mentor]: {p[:100]}")

print(f"\n  Wrong-framed P_mentor (action verb start): {wrong_frame}/20 sampled")

# check imperative-framed at scale
cur.execute("SELECT COUNT(*) FROM segments WHERE P_mentor LIKE '把%' OR P_mentor LIKE '将%' OR P_mentor LIKE '用%' OR P_mentor LIKE '在简历%' OR P_mentor LIKE '添加%' OR P_mentor LIKE '修改%'")
imp_count = cur.fetchone()[0]
print(f"  Imperative-style P_mentor (whole table): {imp_count} ({imp_count/total*100:.1f}%)")

# ── 6. TOPIC / L1 / L2 DISTRIBUTION ─────────────────────────────────────────
print("\n### 6. TOPIC / L1 / L2 DISTRIBUTION ###\n")
cur.execute("SELECT topic, COUNT(*) as cnt FROM segments GROUP BY topic ORDER BY cnt DESC LIMIT 20")
print("  Top 20 topics:")
for r in cur.fetchall():
    flag = " *** OVER-REPRESENTED ***" if r['cnt'] > 50 else ""
    print(f"    {(r['topic'] or 'NULL'):45s}  {r['cnt']:5d}{flag}")

print()
cur.execute("SELECT L1, COUNT(*) as cnt FROM segments GROUP BY L1 ORDER BY cnt DESC")
print("  L1 breakdown:")
for r in cur.fetchall():
    print(f"    {(r['L1'] or 'NULL'):35s}  {r['cnt']:5d}")

print()
cur.execute("SELECT L2, COUNT(*) as cnt FROM segments GROUP BY L2 ORDER BY cnt DESC LIMIT 20")
print("  Top 20 L2:")
for r in cur.fetchall():
    print(f"    {(r['L2'] or 'NULL'):45s}  {r['cnt']:5d}")

# ── 7. TARGET ROLE DISTRIBUTION ──────────────────────────────────────────────
print("\n### 7. TARGET ROLE DISTRIBUTION ###\n")
cur.execute("SELECT COUNT(*) FROM segments WHERE target_role IS NULL OR TRIM(target_role)=''")
null_tr = cur.fetchone()[0]
print(f"  NULL/empty target_role: {null_tr} ({null_tr/total*100:.1f}%)")
cur.execute("SELECT target_role, COUNT(*) as cnt FROM segments GROUP BY target_role ORDER BY cnt DESC LIMIT 15")
print("\n  Top 15 target_role values:")
for r in cur.fetchall():
    print(f"    {(r['target_role'] or 'NULL'):40s}  {r['cnt']:5d}")

# ── 8. GENERALITY / ADVICE_TYPE BALANCE ──────────────────────────────────────
print("\n### 8. GENERALITY / ADVICE_TYPE BALANCE ###\n")
cur.execute("SELECT generality, COUNT(*) as cnt FROM segments GROUP BY generality ORDER BY cnt DESC")
print("  Generality breakdown:")
for r in cur.fetchall():
    print(f"    {(r['generality'] or 'NULL'):20s}  {r['cnt']:5d}")

cur.execute("SELECT advice_type, COUNT(*) as cnt FROM segments GROUP BY advice_type ORDER BY cnt DESC")
print("\n  Advice_type breakdown:")
for r in cur.fetchall():
    print(f"    {(r['advice_type'] or 'NULL'):30s}  {r['cnt']:5d}")

# ── 9. CROSS-CHUNK DUPLICATE SEGMENTS ────────────────────────────────────────
print("\n### 9. CROSS-CHUNK NEAR-DUPLICATE A_action / I_insight ###\n")

cur.execute("""
    SELECT session_id, SUBSTR(A_action, 1, 100) as a_prefix, COUNT(*) as cnt
    FROM segments
    WHERE A_action IS NOT NULL AND LENGTH(A_action) > 10
    GROUP BY session_id, SUBSTR(A_action, 1, 100)
    HAVING COUNT(*) > 1
    ORDER BY cnt DESC
    LIMIT 10
""")
rows9 = cur.fetchall()
print(f"  Near-dup A_action (same session, same first 100 chars) — top 10 groups:")
for r in rows9:
    print(f"    session={r['session_id']}  cnt={r['cnt']}  prefix: {r['a_prefix'][:70]}")

cur.execute("""
    SELECT COUNT(*) FROM (
        SELECT session_id, SUBSTR(A_action, 1, 100) as a_prefix
        FROM segments WHERE A_action IS NOT NULL AND LENGTH(A_action) > 10
        GROUP BY session_id, SUBSTR(A_action, 1, 100) HAVING COUNT(*) > 1
    )
""")
dup9a = cur.fetchone()[0]

cur.execute("""
    SELECT COUNT(*) FROM (
        SELECT session_id, SUBSTR(I_insight, 1, 100) as i_prefix
        FROM segments WHERE I_insight IS NOT NULL AND LENGTH(I_insight) > 10
        GROUP BY session_id, SUBSTR(I_insight, 1, 100) HAVING COUNT(*) > 1
    )
""")
dup9i = cur.fetchone()[0]
print(f"\n  Total near-dup A_action groups (same session): {dup9a}")
print(f"  Total near-dup I_insight groups (same session): {dup9i}")

# ── ADDITIONAL: confidence & classification_source ───────────────────────────
print("\n### 10. CONFIDENCE & CLASSIFICATION_SOURCE ###\n")
cur.execute("SELECT confidence, COUNT(*) as cnt FROM segments GROUP BY confidence ORDER BY cnt DESC")
print("  Confidence breakdown:")
for r in cur.fetchall():
    print(f"    {(r['confidence'] or 'NULL'):15s}  {r['cnt']:5d}")

cur.execute("SELECT classification_source, COUNT(*) as cnt FROM segments GROUP BY classification_source ORDER BY cnt DESC")
print("\n  Classification_source breakdown:")
for r in cur.fetchall():
    print(f"    {(r['classification_source'] or 'NULL'):30s}  {r['cnt']:5d}")

# ── GLOBAL QUALITY SCORE ESTIMATE ────────────────────────────────────────────
print("\n### SUMMARY SCORECARD ###\n")
issues = []
for f, pct in null_rates.items():
    if pct > 50:
        issues.append(f"CRITICAL: {f} is >50% null/empty ({pct:.0f}%)")
    elif pct > 20:
        issues.append(f"MODERATE: {f} is >20% null/empty ({pct:.0f}%)")

if dup_rows / total > 0.1:
    issues.append(f"CRITICAL: {dup_rows/total*100:.0f}% rows are (P,A) duplicates")
if imp_count / total > 0.05:
    issues.append(f"MODERATE: {imp_count/total*100:.0f}% rows have action-framed P_mentor")
if null_tr / total > 0.3:
    issues.append(f"MODERATE: {null_tr/total*100:.0f}% rows missing target_role")

for issue in issues:
    print(f"  {issue}")

conn.close()
print("\n=== AUDIT COMPLETE ===")
