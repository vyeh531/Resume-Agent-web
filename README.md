# Resume Agent MVP - Web

MentorX resume diagnosis MVP. This app lets a user upload or paste a resume, choose a target role or paste a JD, receive a capped free ATS diagnosis, then unlock a fuller mentor-style report after payment.

The current version is a Next.js App Router application with backend API routes, hosted ATS integration, local ATS fallback, Postgres-backed report storage, mentor advice retrieval, and bilingual report hydration.

## What It Does

- Upload or paste resume text from the landing page.
- Parse `.pdf`, `.docx`, and `.txt` resume files.
- Score the resume against a target role or job description.
- Prefer the hosted ATS API and fall back to the local rule-based scorer if hosted scoring is unavailable.
- Store the full internal report server-side.
- Return only a capped free report to the browser.
- Unlock the premium report after payment or dev unlock.
- Retrieve mentor advice from the Postgres knowledge base.
- Serve public and premium report pages by `reportId` plus access token.
- Support locale-aware report loading through `src/i18n` and `app/lib/localeReports.js`.

## Tech Stack

- Next.js 15 App Router
- React 19
- Node.js API routes
- PostgreSQL via `pg`
- Hosted ATS API integration
- Local ATS scorer fallback in `src/ats`
- PDF parsing with `pdf-parse`
- DOCX parsing with `mammoth`
- Anthropic SDK for selected offline/content generation scripts and mentor-advice routes

## Quick Start

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Production-style run:

```bash
npm run build
npm start
```

Run the public response boundary test:

```bash
npm test
```

## Environment

Create `.env.local` for local development. Do not commit real secrets.

```bash
DATABASE_URL=postgresql://...

# Hosted ATS. If unavailable, /api/v1/score falls back to local scoring.
ATS_SOURCE=hosted
ATS_API_URL=https://ats-system-wec6.onrender.com/api/v1/score
ATS_API_KEY=...
ATS_API_TIMEOUT_MS=30000

# Optional local/dev behavior
DEV_UNLOCK_REPORTS=false
PAYMENT_MOCK_ENABLED=true

# Optional debug logging
LOG_ATS_PUBLIC_RESPONSE=false
LOG_ATS_RETRIEVAL_DEBUG=false
MENTOR_RETRIEVAL_TIMING=false

# Optional scripts / mentor generation
ANTHROPIC_API_KEY=...
```

Notes:

- `DATABASE_URL` is required for full report persistence and mentor advice retrieval.
- `/api/positions` falls back to the local role dictionary if the database is unavailable.
- `DEV_UNLOCK_REPORTS=true` unlocks premium reports only outside production.
- `PAYMENT_MOCK_ENABLED=true` allows mock paid marking in production-like environments where the real payment flow is not wired yet.

## Main User Flow

1. `/` - Upload/paste resume, select target role, or paste JD.
2. `/analyzing` - Starts or polls an analysis job for slower flows.
3. `/result` - Shows the capped free report, score, top issues, and free mentor advice.
4. `/payment` - Mock payment/unlock step.
5. `/report` - Shows the premium unlocked report.

The frontend stores only browser-safe state in `localStorage.resumeFixMVP`, such as `reportId`, `reportAccessToken`, the selected locale, and visible public report data. Full ATS results, retrieval queries, hidden problem tags, and paid advice stay server-side.

## Important API Routes

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Basic server health check. |
| `GET /api/positions` | Target role list from Postgres, with local dictionary fallback. |
| `POST /api/parse-file` | Parse uploaded PDF/DOCX/TXT into resume text. |
| `POST /api/v1/score` | Main scoring route. Builds and stores a report, returns capped public output. |
| `POST /api/v1/analysis-jobs` | Starts async analysis for the analyzing page. |
| `GET /api/v1/analysis-jobs/:jobId` | Polls async analysis status. |
| `GET /api/v1/reports/:reportId/public` | Loads the public/free report with access validation. |
| `POST /api/v1/reports/:reportId/unlock` | Returns the premium report after payment/dev unlock. |
| `POST /api/v1/reports/:reportId/mark-paid` | Mock paid status update. |
| `GET /api/v1/reports/:reportId/debug` | Internal/debug report inspection when allowed. |
| `POST /api/v1/ats/rule` | Direct hosted ATS rule route. |
| `POST /api/v1/ats/rule-local` | Direct local ATS route. |

## Scoring And Report Boundary

The product boundary is important:

- The backend may call the hosted ATS service and receive complete diagnostics.
- The backend stores the full internal response in Postgres.
- The browser receives only the public report from `formatPublicFreeReport`.
- The public report is capped to top visible issues, suggestions, keyword previews, and free advice.
- Premium unlock returns the fuller `premiumReport`, but not debug-only internals.

See [docs/ats_system_mvp_mapping.md](docs/ats_system_mvp_mapping.md) for the detailed contract.

## Data And Knowledge Base

Key database-backed areas:

- `ats_reports` stores public reports, internal ATS results, retrieval queries, free advice, paid advice, premium reports, payment status, access-token hash, and resume text.
- `resume_analyses` stores older/direct scoring analysis records.
- `position_skills` powers the role selector.
- Mentor advice retrieval is implemented mainly in `services/mentorAdviceRetrieval.js`.

Local/static fallbacks and assets:

- `public/ats_role_dictionary.json`
- `data/ats/ats_role_dictionary.json`
- `data/salary_benchmarks.json`
- `public/logos/`
- `public/assets/`

## Project Structure

```text
app/
  api/                    Next.js API routes
  lib/                    report build, hosted ATS, async job, locale helpers
  page.js                 landing/upload page
  analyzing/              async progress page
  result/                 free report page
  payment/                unlock/payment page
  report/                 premium report page

src/
  ats/                    local ATS scoring, role dictionary, report formatting
  i18n/                   locale normalization and helpers

services/
  mentorAdviceRetrieval.js mentor retrieval, ranking, grouping, insider tips
  adviceCurator.js         advice selection and coverage curation

public/
  assets/                 browser scripts and styles
  logos/                  company and mentor-facing logo assets
  logo/                   MentorX brand assets

data/
  ats/                    role dictionary data
  salary/                 salary benchmark source data

docs/
  *.md                    architecture notes, data contracts, runbooks

scripts/
  *.js / *.py             audits, migrations, data cleanup, verification

database.js               Postgres access layer and report persistence
file-parser.js            PDF/DOCX parsing helpers
```

## Useful Scripts

```bash
npm run dev      # local Next.js dev server
npm run build    # production build
npm start        # run built Next app
npm test         # public response boundary test
```

Additional scripts under `scripts/` are mostly data audits, migration helpers, translation utilities, and mentor advice quality checks. Read the script before running it, especially anything that writes to the database.

## Development Notes

- Keep public response safety tests passing when changing scoring, report formatting, or unlock behavior.
- Do not return hosted ATS internals directly to the frontend.
- Keep access-token handling server-side; only store the raw report token in browser state when needed to reload the user's own report.
- Use `DATABASE_URL` with the expected schema/search path for mentor retrieval and report persistence.
- The app still contains some legacy routes and compatibility fields from the earlier static MVP. Prefer the `/api/v1/*` routes for new work.
- Several source files currently contain mojibake in Chinese UI strings. Treat README as the current architecture guide, not a guarantee that every visible UI string has been cleaned up.

## Deployment

The repository includes `vercel.json` and can run as a Next.js app on Vercel or any Node-compatible host. Configure the same environment variables used locally, especially:

- `DATABASE_URL`
- `ATS_API_KEY`
- `ATS_API_URL`
- `ATS_SOURCE`
- payment-related flags or real payment integration settings

Before deploying a paid/public flow, verify:

- `npm run build`
- `npm test`
- Free report payload does not expose internal ATS fields.
- Unlock requires payment or an explicit non-production dev unlock.
- Report access works with `reportId` and `reportAccessToken`.

## Related Docs

- [ATS system mapping](docs/ats_system_mvp_mapping.md)
- [Problem tag contract](docs/problem_tag_contract.md)
- [Mentor advice DB schema](docs/mentor_advice_db_schema.md)
- [Database agent notes](docs/database_agent.md)
- [Salary benchmark pipeline](docs/salary-benchmark-pipeline.md)

