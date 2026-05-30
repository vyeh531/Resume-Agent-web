"""
LLM batch fix for segments table:
1. Re-extract A_action / I_insight for stub rows (<20 chars)
2. Fill E_example for empty rows

Usage: python fix_segments_llm.py [--task 1|2|all]
Supports resume: already-fixed rows are skipped.
"""
import sqlite3, json, sys, argparse, os
sys.stdout.reconfigure(encoding='utf-8')

# Load .env manually (no dotenv required)
ENV_FILE = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(ENV_FILE):
    with open(ENV_FILE, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if '=' in line and not line.startswith('#'):
                k, v = line.split('=', 1)
                os.environ.setdefault(k.strip(), v.strip())

from anthropic import Anthropic
client = Anthropic()

CHUNKS_PATH = r'C:\Users\viviy\Documents\GitHub\db_creator\data\chunks.json'
DB_PATH     = r'C:\Users\viviy\Documents\GitHub\Resume-Agent-MVP\mentor_kb-v5.db'
COMMIT_EVERY = 30   # commit after every N rows to allow safe interruption

# ── CLI args ──────────────────────────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument('--task', default='all', choices=['1', '2', 'all'],
                    help='1=fix stubs, 2=fill E_example, all=both')
args = parser.parse_args()

# ── Load chunk lookup ─────────────────────────────────────────────────────────
print('Loading chunks.json...')
with open(CHUNKS_PATH, encoding='utf-8') as f:
    chunks_raw = json.load(f)
chunk_map = {c['chunk_id']: c['text'] for c in chunks_raw}
print(f'Loaded {len(chunk_map)} chunks\n')

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cur  = conn.cursor()

def call_llm(prompt: str) -> dict | None:
    """Call Haiku and parse JSON response. Returns None on any failure."""
    try:
        resp = client.messages.create(
            model='claude-haiku-4-5-20251001',
            max_tokens=400,
            messages=[{'role': 'user', 'content': prompt}]
        )
        text = resp.content[0].text.strip()
        if '```' in text:
            text = text.split('```')[1]
            if text.startswith('json'):
                text = text[4:]
        return json.loads(text.strip())
    except Exception as e:
        print(f'    [LLM error] {e}')
        return None

# ── Task 1: Fix A_action / I_insight stubs ───────────────────────────────────
STUB_PROMPT = """\
你是求職輔導知識萃取助手。根據下方導師課程原文，重新萃取兩個欄位的完整內容。
只輸出 JSON，不要其他文字。

原文（節錄）：
{chunk_text}

已有資訊：
- topic: {topic}
- P_mentor: {P_mentor}
- H_hook: {H_hook}
- 現有 A_action（可能截斷或空）: {A_action}
- 現有 I_insight（可能截斷或空）: {I_insight}

輸出格式：
{{
  "A_action": "完整具體的行動建議，至少50字，描述求職者應做什麼",
  "I_insight": "完整的洞見原則，至少50字，解釋為什麼這樣做有效"
}}"""

def run_task1():
    cur.execute("""
        SELECT id, chunk_id, topic, P_mentor, A_action, I_insight, H_hook
        FROM segments
        WHERE LENGTH(TRIM(COALESCE(A_action,''))) < 20
           OR LENGTH(TRIM(COALESCE(I_insight,''))) < 20
    """)
    rows = cur.fetchall()
    print(f'Task 1: {len(rows)} stub rows to fix\n')

    fixed = 0
    for i, row in enumerate(rows):
        chunk_text = chunk_map.get(row['chunk_id'], '')
        if not chunk_text:
            print(f'  [{i+1}/{len(rows)}] id={row["id"]} — no chunk text, skip')
            continue

        prompt = STUB_PROMPT.format(
            chunk_text=chunk_text[:3000],
            topic=row['topic'] or '',
            P_mentor=row['P_mentor'] or '',
            H_hook=row['H_hook'] or '',
            A_action=row['A_action'] or '',
            I_insight=row['I_insight'] or '',
        )
        result = call_llm(prompt)
        if not result:
            continue

        updates = {}
        if len((row['A_action'] or '').strip()) < 20 and len(result.get('A_action','').strip()) >= 20:
            updates['A_action'] = result['A_action']
        if len((row['I_insight'] or '').strip()) < 20 and len(result.get('I_insight','').strip()) >= 20:
            updates['I_insight'] = result['I_insight']

        if updates:
            set_clause = ', '.join(f'{k} = ?' for k in updates)
            cur.execute(f'UPDATE segments SET {set_clause} WHERE id = ?',
                        list(updates.values()) + [row['id']])
            fixed += 1

        if (i+1) % COMMIT_EVERY == 0:
            conn.commit()
            print(f'  [{i+1}/{len(rows)}] {fixed} fixed so far')

    conn.commit()
    print(f'\nTask 1 done: {fixed}/{len(rows)} stubs fixed\n')


# ── Task 2: Fill E_example for empty rows ────────────────────────────────────
EXAMPLE_PROMPT = """\
你是求職輔導知識萃取助手。根據下方導師課程原文，找出一個具體的例子（E_example）。
E_example 應是導師提到的具體情境、數字、公司名、工具名或操作步驟，讓建議更具體可感。
只輸出 JSON，不要其他文字。

原文（節錄）：
{chunk_text}

建議摘要：
- topic: {topic}
- A_action: {A_action}
- H_hook: {H_hook}

輸出格式：
{{
  "E_example": "導師舉的具體例子（30-200字）。若原文確實沒有具體例子，輸出空字串。"
}}"""

def run_task2():
    cur.execute("""
        SELECT id, chunk_id, topic, A_action, H_hook
        FROM segments
        WHERE E_example IS NULL OR TRIM(E_example) = ''
    """)
    rows = cur.fetchall()
    print(f'Task 2: {len(rows)} rows with empty E_example\n')

    filled = 0
    for i, row in enumerate(rows):
        chunk_text = chunk_map.get(row['chunk_id'], '')
        if not chunk_text:
            continue

        prompt = EXAMPLE_PROMPT.format(
            chunk_text=chunk_text[:3000],
            topic=row['topic'] or '',
            A_action=row['A_action'] or '',
            H_hook=row['H_hook'] or '',
        )
        result = call_llm(prompt)
        if not result:
            continue

        example = result.get('E_example', '').strip()
        if example:
            cur.execute('UPDATE segments SET E_example = ? WHERE id = ?', (example, row['id']))
            filled += 1

        if (i+1) % COMMIT_EVERY == 0:
            conn.commit()
            print(f'  [{i+1}/{len(rows)}] {filled} filled so far')

    conn.commit()
    print(f'\nTask 2 done: {filled}/{len(rows)} E_example filled\n')


# ── Main ──────────────────────────────────────────────────────────────────────
if args.task in ('1', 'all'):
    run_task1()
if args.task in ('2', 'all'):
    run_task2()

conn.close()
print('All done.')
