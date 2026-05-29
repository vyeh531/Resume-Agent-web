# ATS Setup

Resume-Agent-MVP uses the ATS System rule engine as its ATS scoring system.

The legacy 5-dimension ATS scorers have been removed. Use these files as the current source of truth:

- `src/ats/ats-scorer.js`: local 6-dimension scoring engine
- `src/ats/role-dictionary.js`: role dictionary loader
- `src/ats/report-formatter.js`: public and premium report formatter
- `API_README.md`: active API reference

## Run Locally

```bash
npm install
npm start
```

Default local URL:

```text
http://localhost:3000
```

## Active Rubric

| Dimension | Max | Meaning |
|---|---:|---|
| A | 8 | File and format parsing quality |
| B | 7 | Basic profile completeness |
| C | 12 | Content quality and impact |
| D | 45 | JD keyword match |
| E | 5 | Region and market fit |
| F | 23 | Target role and experience relevance |

The main product route is `POST /api/v1/score`.

