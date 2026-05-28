import psycopg2, json, sys
sys.stdout.reconfigure(encoding='utf-8')

conn = psycopg2.connect(
    "postgresql://postgres.jzqmlqfkaxtthzojloth:NGxQxx-972afQcK@aws-0-us-west-2.pooler.supabase.com:5432/postgres",
    options="-c search_path=vibe_offer"
)
cur = conn.cursor()

# Sample career_path and career_path_display
cur.execute("SELECT name, company, title, career_path, career_path_display FROM mentors WHERE career_path IS NOT NULL LIMIT 10")
rows = cur.fetchall()
for r in rows:
    print(f"name: {r[0]}")
    print(f"  company: {r[1]}")
    print(f"  title: {r[2]}")
    print(f"  career_path: {r[3]}")
    print(f"  career_path_display: {r[4]}")
    print()

# How many have career_path vs career_path_display
cur.execute("SELECT COUNT(*) FROM mentors")
total = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM mentors WHERE career_path IS NOT NULL AND career_path != ''")
has_cp = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM mentors WHERE career_path_display IS NOT NULL AND career_path_display != ''")
has_cpd = cur.fetchone()[0]

print(f"Total mentors: {total}")
print(f"Has career_path: {has_cp}")
print(f"Has career_path_display: {has_cpd}")

conn.close()
