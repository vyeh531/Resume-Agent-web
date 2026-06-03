# Database Agent

This project now has a Claude subagent definition for database work:

`C:\Users\viviy\Documents\GitHub\Resume-Agent-MVP\.claude\agents\database-agent.md`

## What It Is For

Use `database-agent` when you want help with:

- Postgres/Supabase access through `database.js`
- Mentor KB SQLite schema and retrieval metadata in `mentor_kb-v5.db`
- data quality audits for `segments`
- safe migration planning
- writing or reviewing `scripts/audit_*.js`, `scripts/inspect_*.js`, and `scripts/fix_*.js`
- checking retrieval behavior before changing data

## How To Invoke It

In Claude Code, ask for it by name, for example:

```text
Use the database-agent to inspect why AI engineer retrieval returns unrelated segments.
```

```text
Use database-agent to design a safe migration for ats_reports and include verification queries.
```

```text
Ask database-agent to audit segment IDs 123, 456, and 789 before we change tags.
```

## Safety Rules

The agent is configured to default to read-only inspection. For data changes, it should first report:

- target database: Postgres/Supabase or SQLite mentor KB
- affected table and columns
- expected row count
- backup or rollback plan
- verification query or smoke test

It should not expose `.env`, `.env.local`, or `DATABASE_URL`, and it should not run broad destructive SQL without an explicit request.

## Useful Existing Commands

```powershell
python scripts/migrate_segments_schema.py --help
python scripts/enrich_segments_metadata.py --help
python scripts/retrieve_advice.py --help
npm test
```

For role/retrieval work, prefer the existing audit scripts under `scripts/` before creating new repair scripts.
