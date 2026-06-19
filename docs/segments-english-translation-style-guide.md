# Segments English Translation Style Guide

Use this guide when filling `*_en` columns in `segments_translation_manual*.csv`.

## Goal

Create natural American English resume-coaching copy. Do not translate word for word. Preserve the original advice intent, facts, role context, ATS/JD terminology, and specificity.

## Field Guidance

| Field | Purpose | Style |
| --- | --- | --- |
| `advice_card_title_en` | Short card headline | Clear, specific, 5-12 words when possible |
| `user_problem_summary_en` | What problem the user has | Plain explanation of the resume issue |
| `action_summary_en` | What the user should do | Direct action sentence, imperative or strong recommendation |
| `canonical_title_en` | Stable normalized title | Concise taxonomy-like label |
| `humanized_mentor_insight_en` | Mentor-facing coaching explanation | Warm, practical, specific |
| `humanized_hr_perspective_en` | Recruiter/HR perspective | Explain how a recruiter or ATS may read it |

## Voice

- Professional, direct, and supportive.
- Use natural US career-coaching language.
- Prefer concrete verbs: `tailor`, `highlight`, `quantify`, `move`, `trim`, `group`, `rename`, `add`, `remove`.
- Keep resume terms familiar: `resume`, `bullet`, `ATS`, `JD`, `recruiter`, `technical skills`, `project`, `internship`, `coursework`.

## Preserve

- Keep all existing numbers, percentages, counts, dates, durations, and versions unless the original meaning clearly does not require them.
- Keep specific English technical tokens from the source, such as `Python`, `Java`, `React`, `AWS`, `SQL`, `ATS`, `JD`, `OPT`, `CPT`.
- Keep the original action intent. If the Chinese says to remove, do not soften it into only revise.
- Do not add companies, schools, awards, metrics, tools, platforms, or credentials that are not in the source.

## Avoid

- Do not leave Chinese main clauses in `*_en` fields.
- Do not add quotation marks around phrases unless necessary.
- Do not write generic filler such as `Improve your resume` when the source is specific.
- Do not over-polish into marketing copy.
- Do not convert advice into a long paragraph if the source is concise.

## Examples

Chinese source:

`不要一份简历投所有岗位`

Good:

`Do not use one resume for every role`

Avoid:

`Please optimize your resume for job applications`

Chinese source:

`关键词匹配是ATS机筛的核心`

Good:

`Keyword matching is central to ATS screening`

Avoid:

`Keywords are important`

## QA Before Apply

Run:

```powershell
node scripts\audit_segments_translation_csv.js --file=outputs\segment-translations\<filled-file>.csv
```

Before converting/applying, check:

- `completeRows` equals `totalRows`, unless intentionally applying only completed rows.
- `duplicateIds` is empty.
- `cjkByColumn` values are all `0`.
- Review `qaWarnings.rowsWithNumberIssues`.
- Review `qaWarnings.rowsWithLatinTokenIssues`.
- Review `qaWarnings.rowsWithShortTranslations`.

