"""
Fix A_action / I_insight stubs without any LLM API.
Strategies:
  1. I_insight = placeholder ('（无）' etc.) → extract "why" sentences from chunk
  2. A_action = '' → extract action sentences from chunk
  3. A_action truncated (ends mid-word) → find full sentence in chunk text
"""
import sqlite3, re, sys
sys.stdout.reconfigure(encoding='utf-8')
import json

CHUNKS_PATH = r'C:\Users\viviy\Documents\GitHub\db_creator\data\chunks.json'
DB_PATH = r'C:\Users\viviy\Documents\GitHub\Resume-Agent-MVP\mentor_kb-v5.db'

print('Loading chunks...')
with open(CHUNKS_PATH, encoding='utf-8') as f:
    chunks_raw = json.load(f)
chunk_map = {c['chunk_id']: c['text'] for c in chunks_raw}
print(f'Loaded {len(chunk_map)} chunks\n')

# ── Helpers ───────────────────────────────────────────────────────────────────

PLACEHOLDER = {'（无）', '（无具体示例）', '无', '(无)', ''}

INSIGHT_KEYWORDS = [
    '因为', '原因', '关键', '本质', '核心', '重要', '必须', '才能',
    '才会', '这样', '所以', '因此', '导致', '决定', '影响', '取决于',
    '逻辑', '背后', '根本', '原则', '规律', '规则',
]

ACTION_STARTERS = [
    '建议', '推荐', '需要', '应该', '要', '先', '把', '将', '可以',
    '必须', '确保', '优先', '删除', '增加', '补充', '调整', '改写',
    '在', '通过', '用', '利用', '从', '针对',
]

def clean_chunk(text: str) -> str:
    """Remove transcript line numbers and speaker labels, return clean sentences."""
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        # skip metadata lines: "L1: ...", timestamps, speaker labels
        line = line.strip()
        if re.match(r'^L\d+:', line):
            content = re.sub(r'^L\d+:\s*', '', line)
            # skip pure timestamp lines
            if re.match(r'^\d{4}-\d{2}-\d{2}', content) or re.match(r'^\d+小时', content):
                continue
            # skip speaker+timestamp lines like "张三 00:01:23.456"
            if re.match(r'^[\w ]+\s+\d{2}:\d{2}:\d{2}', content):
                continue
            if content.strip():
                cleaned.append(content.strip())
    return ''.join(cleaned)

def split_sentences(text: str):
    """Split Chinese text into sentences."""
    return [s.strip() for s in re.split(r'[。！？；\n]', text) if len(s.strip()) > 10]

def extract_insight_sentences(chunk_text: str, topic: str, a_action: str) -> str:
    """Find sentences that explain WHY from chunk text."""
    clean = clean_chunk(chunk_text)
    sentences = split_sentences(clean)

    # Score sentences by insight keywords
    scored = []
    for s in sentences:
        score = sum(1 for kw in INSIGHT_KEYWORDS if kw in s)
        # bonus if related to topic words
        topic_words = [w for w in re.findall(r'[一-鿿]{2,}', topic) if len(w) >= 2]
        score += sum(1 for w in topic_words if w in s)
        if score > 0:
            scored.append((score, s))

    if not scored:
        # fallback: synthesize from P_mentor + A_action
        return ''

    scored.sort(reverse=True)
    # take top 1-2 sentences, cap at 150 chars
    result = '；'.join(s for _, s in scored[:2])
    return result[:200]

def extract_action_sentences(chunk_text: str, topic: str, p_mentor: str) -> str:
    """Find sentences that describe what to DO from chunk text."""
    clean = clean_chunk(chunk_text)
    sentences = split_sentences(clean)

    scored = []
    for s in sentences:
        score = sum(1 for starter in ACTION_STARTERS if s.startswith(starter) or f'，{starter}' in s)
        topic_words = [w for w in re.findall(r'[一-鿿]{2,}', topic) if len(w) >= 2]
        score += sum(1 for w in topic_words if w in s)
        if score > 0:
            scored.append((score, s))

    if not scored:
        return ''

    scored.sort(reverse=True)
    result = '；'.join(s for _, s in scored[:2])
    return result[:250]

def find_full_sentence(chunk_text: str, truncated: str) -> str:
    """Find the full version of a truncated sentence in chunk text."""
    clean = clean_chunk(chunk_text)
    # Try to find where the truncated text appears and extend to sentence boundary
    idx = clean.find(truncated[:20])  # search by first 20 chars
    if idx == -1:
        return ''
    # Find sentence end from that position
    end_chars = '。！？；\n'
    end = idx
    while end < len(clean) and clean[end] not in end_chars:
        end += 1
    full = clean[idx:end].strip()
    if len(full) > len(truncated) + 5:
        return full[:300]
    return ''

def is_truncated(text: str) -> bool:
    """Detect if text is cut off mid-sentence."""
    if not text:
        return False
    last_char = text.rstrip()[-1] if text.rstrip() else ''
    # Ends without sentence-ending punctuation and ends on a content word
    return last_char not in '。！？；：…）」』' and len(text) > 5

# ── Main processing ───────────────────────────────────────────────────────────
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

cur.execute('''
    SELECT id, chunk_id, topic, P_mentor, A_action, I_insight, H_hook
    FROM segments
    WHERE LENGTH(TRIM(COALESCE(A_action,""))) < 20
       OR LENGTH(TRIM(COALESCE(I_insight,""))) < 20
       OR TRIM(COALESCE(I_insight,"")) IN ("（无）","（无具体示例）","无","(无)")
    ORDER BY id
''')
rows = cur.fetchall()
print(f'Rows to fix: {len(rows)}\n')

fixed_insight = 0
fixed_action = 0
fixed_truncated = 0
skipped = 0

for row in rows:
    chunk_text = chunk_map.get(row['chunk_id'], '')
    updates = {}

    a = (row['A_action'] or '').strip()
    i = (row['I_insight'] or '').strip()

    # Case 1: I_insight is placeholder or very short
    if i in PLACEHOLDER or len(i) < 15:
        new_i = extract_insight_sentences(chunk_text, row['topic'] or '', a)
        if new_i and len(new_i) > 20:
            updates['I_insight'] = new_i
            fixed_insight += 1

    # Case 2: A_action is empty
    if not a:
        new_a = extract_action_sentences(chunk_text, row['topic'] or '', row['P_mentor'] or '')
        if new_a and len(new_a) > 20:
            updates['A_action'] = new_a
            fixed_action += 1

    # Case 3: A_action is truncated
    elif is_truncated(a) and len(a) < 80:
        full = find_full_sentence(chunk_text, a)
        if full and len(full) > len(a) + 5:
            updates['A_action'] = full
            fixed_truncated += 1

    if updates:
        set_clause = ', '.join(f'{k} = ?' for k in updates)
        cur.execute(f'UPDATE segments SET {set_clause} WHERE id = ?',
                    list(updates.values()) + [row['id']])
    else:
        skipped += 1

conn.commit()
conn.close()

print(f'I_insight placeholders filled: {fixed_insight}')
print(f'A_action empty filled:        {fixed_action}')
print(f'A_action truncated fixed:     {fixed_truncated}')
print(f'Could not fix (skipped):      {skipped}')
print(f'Total processed:              {len(rows)}')
