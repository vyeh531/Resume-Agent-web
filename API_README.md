# Resume-Agent-MVP ATS API

Resume-Agent-MVP now uses the ATS System rule engine as the single ATS scoring source.

Current scoring engine:

- Local module: `src/ats/ats-scorer.js`
- Hosted proxy fallback target: `ATS_API_URL`, defaulting to `https://ats-system-wec6.onrender.com/api/v1/score`
- Legacy 5-dimension ATS scorers have been removed.

## Scoring Dimensions

The active engine uses a 6-dimension, 100-point rubric:

| Dimension | Max | Meaning |
|---|---:|---|
| A | 8 | File and format parsing quality |
| B | 7 | Basic profile completeness |
| C | 12 | Content quality and impact |
| D | 45 | JD keyword match |
| E | 5 | Region and market fit |
| F | 23 | Target role and experience relevance |

## Endpoints

### `POST /api/v1/score`

Primary product endpoint. Scores the resume with the local ATS System engine, builds the public report, retrieves mentor advice, and stores the report.

### `POST /api/v1/ats/rule`

Proxy endpoint. Calls the hosted ATS System API when `ATS_API_KEY` is configured; falls back to the local ATS System engine if the hosted API is unavailable.

### `POST /api/v1/ats/rule-local`

Local-only ATS System scoring path.

### `POST /api/score-resume`

Compatibility endpoint for older clients. It now uses the same local ATS System 6-dimension engine.

### `GET /api/v1/ats/health`

Returns server and rule-engine status.

## Request Body

JSON:

```json
{
  "resumeText": "Resume plain text",
  "jobTitle": "Software Engineer",
  "jdText": "Job description text"
}
```

Multipart:

- `file`: PDF, DOCX, or TXT resume
- `jobTitle`: target role
- `jdText`: job description text

