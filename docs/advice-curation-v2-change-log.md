# Advice Curation V2 Change Log

Last inspected: 2026-06-15

Scope note: this document records the current working-tree implementation only. Source code and tests were not edited as part of this documentation pass.

## Backend Files Changed

- `services/adviceCurator.js` was added.
  - Normalizes mentor advice items for curation.
  - Infers `actionFamily`, `targetSection`, `coverageFamily`, `actionSlot`, `duplicateGroupKey`, `displayPriority`, and preview eligibility.
  - Deduplicates advice by coverage/section/action family.
  - Caps keyword-heavy advice, including stricter result-page preview limits.
  - Selects three result-page preview items.
  - Builds report-page mentor groups with mentor lens labels/reasons.
  - Builds a coverage summary for curated advice.
- `app/lib/atsHelpers.js` now imports `curateMentorAdvicePlan`.
  - Curation runs after free/paid mentor advice formatting and before public/premium report formatting.
  - Public report formatting now receives curated advice.
  - Premium report formatting now receives curated advice fields merged into the mentor report.
- `src/ats/report-formatter.js` now exposes curated fields in public and premium payloads.
  - Public payload gets a sanitized `resultPageAdviceItems` preview list.
  - Premium payload gets `curatedAdviceItems`, `resultPageAdviceItems`, and `reportPageMentorGroups`.
  - Premium mentor/advice item serialization preserves new curation metadata.
- `scripts/test_advice_curator.js` was added.
  - Covers keyword caps, result preview distribution, mentor lens selection, and role-consistency sanitization.

## New Payload Fields

Public report payload:

- `resultPageAdviceItems`: up to 3 curated public-safe advice items for the result page preview.

Premium report payload:

- `curatedAdviceItems`: up to 12 curated advice items.
- `resultPageAdviceItems`: up to 3 curated preview items, also available in premium payload.
- `reportPageMentorGroups`: up to 4 mentor-group objects with grouped advice.
- `coverageSummary`: merged with the existing mentor report coverage summary when available.

Advice item metadata now preserved where available:

- `actionSlot`
- `actionFamily`
- `canonicalActionFamily`
- `coverageFamily`
- `duplicateGroupKey`
- `displayPriority`
- `isPreviewWorthy`
- `mentorGroupLens`
- `mentorGroupReason`
- `mentorSourceType`

Mentor group metadata now preserved where available:

- `mentorGroupLens`
- `mentorGroupReason`
- `adviceItems`

## Result Page Fields

Files touched:

- `app/analyzing/page.js`
- `app/login/page.js`
- `public/assets/app.js`
- `public/result-logic.js`

Stored state now includes:

- `resultPageAdviceItems` from `publicReport.resultPageAdviceItems`.

Result page rendering now:

- Reads result preview advice from `s.resultPageAdviceItems`, `atsResult.resultPageAdviceItems`, or `atsResult.raw?.resultPageAdviceItems`.
- Uses the curated three-item preview when available.
- Falls back to the previous free mentor advice rendering when curated preview items are unavailable.
- Keeps the locked preview area rendered after the curated preview.
- Updates the mentor section copy when curated preview is used:
  - Section number becomes `free trial / 3 priority edits` equivalent in the UI.
  - Section title becomes the Chinese equivalent of "Fix these 3 things first."
  - Section description explains that the system selected the three highest-priority actions from the full mentor advice set.
- Inserts the mentor logo intro near the result preview title when absent.

## Report Page Fields

Files touched:

- `public/assets/app.js`
- `public/report-logic.js`
- `src/ats/report-formatter.js`

Stored state now includes:

- `reportPageMentorGroups` from `premiumReport.reportPageMentorGroups`.

Report page rendering now:

- Reads mentor groups from `s.reportPageMentorGroups`, `atsResult.reportPageMentorGroups`, or `atsResult.raw?.reportPageMentorGroups`.
- Prefers curated `reportPageMentorGroups` when they contain advice items.
- Falls back to the existing grouped advice rendering when curated groups are absent.
- Falls back again to legacy mentor cards when no advice groups are available.
- Adds curated mentor group advice to:
  - mentor logo pool collection
  - flattened advice item collection
  - HR perspective lookup
  - report advice item collection
- Displays mentor group lens fields in the group header when present:
  - `mentorGroupLens`
  - `mentorGroupReason`

## DOM / CSS / Display Changes

Result page:

- Adds a curated preview card wrapper around three rendered API advice items.
- Changes the visible section label/title/description when curated preview advice exists.
- Keeps inline styling consistent with the current result page approach:
  - white card background
  - subtle purple border/shadow
  - rounded preview container

Report page:

- Adds a lens pill inside the mentor group header when `mentorGroupLens` exists.
- Adds a short explanatory paragraph below the mentor title when `mentorGroupReason` exists.
- Adds report-page mentor group logos into the logo intro pool.
- Keeps existing inline style conventions for mentor group headers and cards.

## Fallback Behavior

Curation and payload fallback:

- Public result page uses curated `resultPageAdviceItems` first.
- If curated result preview items are absent, result page uses existing `freeMentorAdvice`.
- Locked advice preview still renders when available.

Premium report fallback:

- Report page uses curated `reportPageMentorGroups` first when at least one group has advice items.
- If curated groups are unavailable or empty, it uses the existing grouped advice-item renderer.
- If grouped advice is unavailable, it uses legacy premium mentor cards.

Data normalization fallback:

- Advice item text fields accept paired legacy/new names, including:
  - `currentDiagnosis` / `problemSummary`
  - `action` / `actionSummary`
  - `mentorLens` / `mentorInsight` / `reason`
  - `hrPerspective` / `HR_os`
  - `actionFamily` / `canonicalActionFamily`
- Mentor source fields are stripped for public payloads to a limited mentor identity object.
- Role-mixed finance wording is sanitized for software-engineering targets unless the target role context allows finance.

## Mobile Sync Checklist

## Follow-up Fixes From Latest SWE Case

Observed report-page issues:

- Header count showed the old merged advice count while the UI rendered curated mentor groups.
- MentorX fallback advice could split into multiple mentor cards when generated with different fallback `mentorId` / `mentorName` values.
- MentorX groups did not always receive `/logo/MentorX.png`.
- Some advice families were inferred too broadly, causing SWE positioning or impact advice to appear under a business/data lens.

Fixes applied:

- `services/adviceCurator.js`
  - Added stable mentor-group key normalization.
  - Forces MentorX fallback profiles into one `mentorx` group.
  - Adds MentorX logo fallback in curated report groups.
  - Lets explicit `actionFamily` signals win before broad business/data matching.
  - Uses normalized mentor group keys for per-mentor keyword caps.
- `public/report-logic.js`
  - Uses visible curated group advice count for the section header when `reportPageMentorGroups` is present.
  - Reuses the same curated group collection for count and render.
  - Adds `getCompanyLogo("MentorX") -> /logo/MentorX.png`.
- `scripts/test_advice_curator.js`
  - Added MentorX grouping regression coverage.
  - Added Software Engineer / Anyscale lens consistency coverage.

Mobile sync notes:

- Mobile report header count should be checked against visible curated group advice count, not legacy `premiumAdviceItems`.
- Mobile logo rendering should accept backend `companyLogo` and also fallback to `/logo/MentorX.png` for MentorX.
- Mobile mentor grouping should group by normalized mentor identity, especially for MentorX strategy/fallback advice.
- Mobile lens display should be checked for SWE cases so generic business/data labels do not appear when the advice is actually positioning or impact.

## Follow-up Curation Policy: Richer Report, Strict Preview

Product decision:

- Result page stays strict: it still shows only the top 3 priority actions with strong coverage-family diversity.
- Report page should be richer: it should keep more mentor perspectives when they are meaningfully different.
- Repetition control should remove same-action duplicates, not collapse the full paid report into a thin preview.

Backend updates:

- `curateAdviceItems` now uses report-oriented diversity rules instead of a single coarse `duplicateGroupKey` winner.
- Exact duplicate text is still removed.
- Same mentor + same action slot is limited to 1 item.
- Same global action slot can keep up to 2 items if they come from different mentor perspectives.
- Keyword advice remains capped globally and per mentor.
- Curated report groups now allow up to 5 mentor groups and up to 4 advice items per group.
- `weak_experience_keyword_evidence` no longer forces advice into keyword classification when the visible advice text is actually about experience evidence.

Frontend / payload updates:

- `reportPageMentorGroups` formatting now preserves up to 5 groups and 4 items per group.
- Result page `resultPageAdviceItems` remains capped at 3.

Regression coverage:

- Added a report richness test that expects multiple non-duplicate experience perspectives to survive curation.
- Existing keyword cap tests still enforce keyword repetition limits.

## Follow-up Fixes From Accountant Case

Observed issues:

- A Skills/JD keyword advice for an Accountant target mentioned `risk` and `finance` directions, which made the role line drift away from the submitted target.
- A keyword advice card could keep stale evidence chips such as `岗位定位 / 开头主线 / 目标岗位`.
- Finance-company mentors could pull an impact advice into the wrong lens when the advice itself was clearly about measurable results.

Fixes applied:

- `sanitizeRoleMixedText` now removes risk/finance-direction wording when the target role is not explicitly a risk/finance/quant direction.
- Advice evidence chips are normalized by `coverageFamily`; stale chips are replaced with stable defaults such as `JD 关键词 / ATS 匹配 / Skills 排序`.
- Impact advice keeps `impact_metrics` as the dominant lens even for finance-company mentors.

Regression coverage:

- Added an Accountant role-consistency test for the Barclays-style `risk和finance方向` wording.
- Added a keyword evidence-chip normalization assertion.
- Added a UBS impact-lens consistency test.

## Follow-up Policy: Global Target-Role Consistency Gate

Product issue:

- Fixing only Accountant, Software Engineer, or 8 broad role families is not enough; the product has 500+ concrete target roles in the ATS role dictionary.
- Advice text must not introduce a different job family unless the target role or JD clearly supports that family.
- The consistency gate should not become a hand-maintained list of 500 titles.

Backend update:

- Added dictionary-driven role direction sanitization in `services/adviceCurator.js`.
- The curator loads `public/ats_role_dictionary.json` / `data/ats/ats_role_dictionary.json`, which currently contains 500+ role entries.
- It builds role-title and alias patterns from each dictionary entry, then detects phrases like `2D Animator role`, `Architectural Designer position`, or `Account Executive position`.
- If the detected role title does not match the current target role entry, the phrase is replaced with the current target role direction.
- The older `ROLE_DIRECTION_GUARDS` broad-family rules remain as fallback for non-title phrases such as `risk/finance方向`.
- `sanitizeRoleMixedText` now runs every advice text field through the dictionary gate and fallback family gate before display payloads are built.
- Unsupported phrases such as `DA岗位`, `design role`, `software engineer role`, or `finance direction` are replaced with the current target role direction.
- Allowed target families are preserved; for example, Software Engineer advice can still say `Software Engineer role`.

Regression coverage:

- Added a cross-role sanitizer test using a Marketing target with mixed DA/design/software/finance wording.
- Added a dictionary-wide sanitizer test that asserts the role dictionary has 500+ roles and verifies concrete dictionary roles are rewritten when unsupported.
- Added an allowed-role test to confirm valid Software Engineer wording is not over-sanitized.

## Follow-up Policy: Mentor Advice Attribution v2

Product rule:

- If the displayed mentor is the original advice source, the UI may say `来源：该导师建议`.
- If the displayed mentor is only a matched lens and the original advice source is different, the UI must say `来源：MentorX 按该导师背景整理`.
- If the item is MentorX fallback/strategy advice, the UI must say `来源：MentorX 策略建议`.

Backend updates:

- Advice items now carry `attributionMode`, `originalMentorSource`, `displayedMentorSource`, and `sourceDisclosure`.
- `mentorSource` now represents the displayed mentor source used for grouping.
- `originalMentorSource` is preserved for audit/debug when a stitched lens is used.
- `reportPageMentorGroups` now also carries group-level `attributionMode` and `sourceDisclosure`.

Frontend / payload updates:

- Result/report formatter preserves attribution metadata in public and premium payloads.
- Report mentor group header displays the source disclosure line before `本次视角`.

Regression coverage:

- Added verified-original attribution test.
- Added stitched-lens attribution test that groups by displayed mentor while preserving original source.
- Added MentorX strategy attribution test.

## Follow-up Policy: Mentor Display Fit v2

Backend updates:

- Advice selection remains problem-first; mentor display is now selected separately after each item is normalized.
- Each item now carries `mentorDisplayFit`, `mentorFitReason`, `displayMentorScore`, and `adviceSkillClusters`.
- `mentorSource` is the displayed mentor used for grouping; `originalMentorSource` remains the true source for audit.
- `verified_original` is only used when the selected displayed mentor matches the original source.
- Low-fit original mentors can be replaced by a better displayed mentor and marked `stitched_lens`.
- MentorX strategy items stay under the MentorX strategy group.
- Full report curation now targets 7-9 advice items, with keyword advice capped and a `candidate_pool_insufficient` coverage status when fewer than 7 non-duplicate candidates exist.

Frontend / payload updates:

- Report source disclosure moved to each advice card.
- Mentor group headers now describe identity, lens, and reason only.
- Item evidence chips remain item-level and cannot inherit `mentorGroupLens`.
- The report formatter preserves the new display-fit fields in public and premium payloads.

Mobile sync notes:

- Result page can keep reading the same `resultPageAdviceItems` top-3 field.
- Report page mobile should render source disclosure inside each advice card, not once at the mentor header.
- Mobile cards should support the new `mentorDisplayFit` chip labels.
- Mixed verified/stitched mentor groups must not show one group-level source line.
- PDF and AI rewrite exports should continue collecting advice from `reportPageMentorGroups` while preserving item-level attribution metadata.

Regression coverage:

- Added Accountant display-fit test to ensure Neurotech is not shown as the displayed mentor for Accountant positioning advice.
- Added item chip isolation test so collaboration advice keeps experience-evidence chips while short-tenure advice keeps risk chips.
- Added report richness target test for 7-9 curated items, keyword caps, and max three items per displayed mentor group.

- Confirm result-page mobile state receives `resultPageAdviceItems` in every completion path:
  - analyzing flow
  - login flow
  - static/public app flow
- Confirm paid report mobile state receives `reportPageMentorGroups` after unlock/fetch.
- Confirm result preview section title, label, description, mentor logo intro, and locked preview do not overlap on narrow widths.
- Confirm the three curated result advice cards remain readable and do not create horizontal overflow.
- Confirm report mentor group header wraps cleanly when lens pill and reason text are present.
- Confirm mentor logos from `reportPageMentorGroups` appear in the mobile logo intro pool.
- Confirm fallback views still render on mobile when curated fields are missing from older stored reports.

## Verification Commands Observed

Observed working command:

```powershell
node scripts/test_advice_curator.js
```

Observed result:

```text
advice curator tests passed
```

Available package command:

```powershell
npm test
```

Current package mapping:

```text
npm test -> node scripts/test_public_response_boundaries.js
```

## Follow-up Fix: MLE Advice Quality Pass

Backend updates:

- Added `machine_learning` role profile inference for MLE / ML Engineer / Applied ML / Deep Learning targets.
- Added ML-specific skill clusters: `machine_learning`, `model_evaluation`, and `ml_deployment`.
- Tightened forbidden drift scoring so finance/accounting mentors are penalized for MLE when they are only explainable through a generic problem lens.
- Added deterministic title diversification for generic titles such as `改写工作经历 bullet`.
- Made MentorX supplement templates role-aware:
  - MLE receives model / data / evaluation / deployment wording.
  - Accounting keeps Excel / reporting / reconciliation wording.
  - General roles receive neutral tool / process / deliverable wording.

Payload / UI updates:

- Report formatter and report page now prioritize item `coverageFamily` when generating evidence chips.
- Regex-based chip inference remains as fallback only.
- This prevents positioning or skills advice from inheriting short-tenure chips such as `经历性质 / 项目边界 / 稳定性风险`.

Mobile sync notes:

- Mobile report advice cards should rely on item-level `coverageFamily` chips, not text regex or mentor group lens.
- MLE reports should not show accounting-specific supplement wording such as Excel / 报表 / 对账 unless the JD actually supports it.
- Finance mentors should not display as same-function mentors for MLE; they should be stitched only when explainable, otherwise MentorX fallback.
- Repeated generic advice titles should render as diversified action titles.

Regression coverage:

- Added MLE supplement role-awareness test.
- Added MLE finance mentor drift test.
- Added generic title diversification test.
- Re-ran:
  - `node scripts/test_advice_curator.js`
  - `npm test`
  - `npm run build`

## Architecture Fix: Role Taxonomy Profile Layer

Backend updates:

- Added runtime taxonomy module: `src/ats/position-role-taxonomy.js`.
  - This reuses the existing position taxonomy instead of adding title-specific checks inside the curator.
- Added role profile builder: `src/ats/role-profile.js`.
  - Inputs: target role, JD text, existing ATS role dictionary entry.
  - Outputs: `canonicalRoleFamily`, `roleGroup`, `functionCluster`, `adjacentClusters`, `skillClusters`, `forbiddenDriftClusters`, and `roleDictionaryEntry`.
- Updated `services/adviceCurator.js`:
  - `roleProfileFromContext()` now first calls `buildRoleProfileFromContext(context)`.
  - Curator-local regex classification is only a legacy fallback.
  - Removed the MLE-specific title check from curator role inference.
- Tightened role-entry skill inference:
  - Avoids treating generic `model` / `reporting` words as ML or finance evidence.
  - Keeps MLE skill clusters focused on Python / ML / model evaluation / ML deployment.
  - Keeps Accountant skill clusters focused on financial reporting / reconciliation / compliance.

Why this matters:

- The 500+ concrete positions should map through role dictionary / taxonomy, not through 500 hardcoded sanitizer or curator branches.
- Future role fixes should happen in the taxonomy/profile layer unless the issue is truly advice-specific.
- Curator should consume the normalized role profile and focus on advice selection, mentor display fit, attribution, and diversity.

Regression coverage:

- Added role profile taxonomy test for MLE and Accountant.
- Re-ran:
  - `node scripts/test_advice_curator.js`
  - `node scripts/test_mle_role_safety.js`
  - `npm test`
  - `npm run build`

## Role-Aware Fallback Advice v2

Backend updates:

- Added `src/ats/role-fallback-advice.js`.
  - Builds MentorX strategy fallback advice from fixed problem slots instead of title-specific templates.
  - Uses `buildRoleProfileFromContext()` plus `roleDictionaryEntry` fields to inject role-specific skills, tools, deliverables, project signals, and metrics.
  - Initial slots: positioning, keyword gap, keyword in experience, experience evidence, impact metrics, short-tenure risk, junior signal, tool delivery context, and section weighting.
- Updated `services/mentorAdviceRetrieval.js`.
  - `fallbackAdviceItems()` now prefers the role-aware fallback pool and only falls back to the legacy static template path as a last resort.
  - `fallbackAdviceForObligation()` maps obligations to the same role-aware slots when possible.
  - Added `retrieveMentorAdviceWithStatus()` so retrieval `ok`, `empty`, and `error` are recorded separately.
- Updated `services/adviceCurator.js`.
  - `fillReportRichness()` now uses role-aware fallback items before generic curator supplements.
  - Supplemental fallback items are low-priority fill only, so they do not displace already selected DB-backed or curated items.
  - Keyword caps still apply after richness fill.
- Updated `app/lib/atsHelpers.js`.
  - Uses `retrieveMentorAdviceWithStatus()`.
  - Adds `retrievalStatus` to `internalAtsResult`, `publicReport`, `premiumReport`, returned payload, and retrieval debug logs.

Payload additions:

```js
retrievalStatus: {
  retrievalStatus: "ok" | "empty" | "error",
  candidateCount,
  retrievalErrorCode,
  retrievalErrorMessage,
  strictCandidateCount,
  fallbackCandidateCount,
  rawRows,
  eligibleRows,
  selectedScope
}
```

Fallback advice item fields:

```js
{
  source: "fallback",
  attributionMode: "mentorx_strategy",
  sourceDisclosure: "来源：MentorX 策略建议",
  coverageFamily,
  actionFamily,
  targetSection,
  relatedProblemTags,
  evidence
}
```

Role wording guardrails:

- The fallback generator does not maintain templates for 500+ titles.
- The role dictionary / role taxonomy / role profile layer decides the role context.
- Family-level lexicon guards remove obvious drift from weak dictionary rows.
  - Accountant fallback now prefers general ledger, reconciliation, financial statements, GAAP, Excel, QuickBooks, NetSuite, SAP.
  - MLE fallback stays on model, Python, PyTorch/TensorFlow, evaluation, deployment, inference.
  - Marketing fallback stays on campaign, analytics, CRM, Google Analytics, HubSpot, content.
  - Network Operator fallback stays on network monitoring, incident response, troubleshooting, TCP/IP, Grafana/Wireshark, uptime/SLA.

Mobile sync notes:

- Mobile result/report code should treat `source: "fallback"` + `attributionMode: "mentorx_strategy"` as MentorX strategy advice, never as an external mentor quote.
- Mobile report debug or QA view can read `retrievalStatus` to distinguish DB miss from DB error.
- Paid report should still render 7-9 role-specific advice items when `candidateCount = 0`, as long as fallback generation succeeds.
- Evidence chips should continue to come from item-level `coverageFamily / actionFamily / evidence`, not mentor group lens.

Regression coverage:

- Added role-aware fallback wording tests for MLE, Marketing, Network Operator, and Accountant.
- Added 30-role dictionary sample coverage for fallback lexicon generation.
- Added empty-retrieval paid richness test.
- Added retrieval status wrapper tests for `ok`, `empty`, and `error`.

## Audit Harness Retrieval Status Fix

Added script:

```powershell
node scripts/audit_desktop_advice_quality.js --input="C:\Users\viviy\Desktop\新增資料夾"
```

Behavior:

- Reads one resume file plus all JD `.txt` files from the provided folder.
- Loads `.env.local` and `.env` before importing DB-backed retrieval modules, so standalone Node runs use the same database URL as the app.
- Runs scorer, report formatter, `retrieveMentorAdviceWithStatus()`, free/paid mentor planning, curator, and public/premium report formatting.
- Writes:
  - `outputs/advice_quality_audit_desktop_cases.raw.json`
  - `outputs/advice_quality_audit_desktop_cases.md`

Retrieval status semantics:

- `retrieval_ok`: DB query succeeded and returned candidates.
- `retrieval_empty`: DB query succeeded but returned zero candidates.
- `retrieval_error`: DB/query/network error occurred. In this case `candidateCount` is written as `null`, not `0`.

Why this matters:

- A DB access failure must not be interpreted as retrieval quality failure.
- `candidateCount = 0` is only valid when retrieval status is `empty`.
- If `.env` is not loaded, `pg` may fall back to localhost and produce `ECONNREFUSED ::1:5432`; the audit harness now prevents that by loading env files first.
- True retrieval quality testing for the desktop JD cases must run in an environment that both has DB access and is allowed to use those resume/JD-derived retrieval queries.

## Retrieval Quality Fix Pass

Issues found in the first DB-backed desktop JD audit:

- Retrieval itself worked, but several cases still had bad advice because title / role context was wrong or too broad.
- Paid report display could show only 4-6 items even when the curator had 7 items.
- Logistics / pickup-support fallback could drift into AI / ML wording when the role dictionary matched the full JD text too broadly.
- DB-adapted advice could leak case-specific source examples such as Dyson / diffuser / cofounder / project-management-club wording.
- External mentors such as Thermal Engineer / Process Engineer could appear for MLE, Network Operator, or logistics roles where the lens was not explainable.

Fixes:

- `src/ats/role-profile.js`
  - Added `logistics_operations` cluster.
  - Added role-family alias mapping for `AI / Machine Learning` and `logistics_operations`.
  - Added dictionary-entry compatibility checks so a known context family cannot be overwritten by an unrelated dictionary hit.
- `src/ats/role-fallback-advice.js`
  - Added logistics fallback lexicon: pickup coordination, dispatch scheduling, delivery operations, route optimization, exception handling, operations reports, pickup completion rate, on-time rate, ticket volume.
  - Added finance fallback guard so IB / finance roles prefer valuation, DCF, financial modeling, pitch deck, investment memo, comparable company analysis.
- `services/adviceCurator.js`
  - Added unsafe curated-advice filter for case-specific leakage and role drift.
  - Added external mentor explainability guard for Thermal / Process / Architecture mentors.
  - Added report-group completion pass so missing curated items are appended to MentorX strategy group until the displayed report reaches the intended 7+ items when possible.

Verification:

- Bob logistics fallback no longer contains ML / PyTorch / TensorFlow / classification wording.
- Marketing case-specific `cofounder` / `project management club` advice is filtered.
- Curated 7-item test now displays 7 report items.
- Re-ran:
  - `node scripts/test_advice_curator.js`
  - `node scripts/test_mle_role_safety.js`
  - `npm test`
  - `npm run build`

## Desktop Audit Follow-up Fix

Issue observed after the user reran the DB-backed desktop audit:

- Retrieval status was healthy for all five cases (`retrieval_ok`), so the DB retrieval layer was no longer the blocker.
- `coverageSummary.totalAdviceItems` showed 7 curated items, but `premiumReport.reportPageMentorGroups` still displayed only 4-5 paid items.
- Root cause: `formatPremiumUnlockedReport()` sliced each `reportPageMentorGroups[].adviceItems` to 4, even though the curator had already applied report-level limits and completion logic.
- Advice titles were still too template-like for recurring slots such as impact metrics, positioning, keyword, junior signal, and tool context.

Fixes:

- `src/ats/report-formatter.js`
  - Increased `reportPageMentorGroups[].adviceItems` serialization cap from 4 to 9.
  - Formatter now preserves curator-completed MentorX strategy groups instead of truncating them back to 4 items.
- `services/adviceCurator.js`
  - Expanded `diversifyAdviceTitle()` beyond the old generic `改写工作经历 bullet` case.
  - Common slots now receive stable title variants based on coverage/action family, so repeated problem tags can display less repetitive advice titles.
- `scripts/audit_desktop_advice_quality.js`
  - Confirmed the audit harness writes clean Markdown separators and default input path strings.

Verification:

- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- Synthetic formatter check: one MentorX report group with 7 advice items now serializes all 7.
- `npm run build`

Note:

- The agent could not rerun the true DB-backed desktop audit directly because it would transmit resume/JD-derived local files to the external Supabase DB from the sandbox. The user should rerun `node scripts\audit_desktop_advice_quality.js --input="C:\Users\viviy\Desktop\新增資料夾"` locally to regenerate the final DB-backed audit output.

## Visible Chinese Encoding Fix

Issue observed after the second desktop audit:

- Paid item count was fixed: all five desktop cases returned 7 paid advice items.
- However, advice titles and mentor group lens strings appeared as mojibake in the raw audit JSON, while action/body text remained readable.
- Root cause: some newly added visible Chinese constants in `services/adviceCurator.js` had been written in corrupted encoding.

Fixes:

- `services/adviceCurator.js`
  - Rewrote visible MentorX source labels:
    - `简历策略组`
    - `来源：该导师建议`
    - `来源：MentorX 策略建议`
    - `来源：MentorX 按该导师背景整理`
  - Rewrote item evidence chip defaults:
    - `JD 关键词 / ATS 匹配 / 经历证据`
    - `岗位定位 / 开头主线 / 目标岗位`
    - `经历证据 / 推进动作 / 交付物`
    - `量化结果 / 成果表达 / 影响规模`
    - `经历性质 / 项目边界 / 稳定性风险`
  - Rewrote diversified title variants for keyword, positioning, impact metrics, risk explanation, junior signal, tool context, and experience evidence.
  - Rewrote `LENS_CONFIG` lens/reason strings to normal Chinese.
- `scripts/test_advice_curator.js`
  - Updated tests so expected source disclosures and evidence chips use normal Chinese rather than mojibake.

Verification:

- Synthetic curator output now shows normal Chinese titles, chips, source disclosure, and lens strings.
- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## Network Operator Lexicon Guard

Issue observed in the final desktop audit review:

- The `yuxin lou` case was correctly producing 7 paid advice items and normal Chinese payload text.
- However, `Network Operator` advice still used logistics/pickup wording such as pickup support, dispatch, route planning, delivery status.
- This violated the earlier quality target that Network Operator should not be dominated by logistics wording.

Fixes:

- `src/ats/role-fallback-advice.js`
  - Added visible network/cloud infrastructure preferred lexicon:
    - network monitoring
    - incident response
    - troubleshooting
    - TCP/IP
    - DNS
    - Zabbix / Nagios / Grafana / Wireshark / Splunk
    - uptime / MTTR / SLA compliance
  - Added title-level override guard: if target/canonical title contains `Network Operator`, `Network Operations`, `NOC`, `IT infrastructure`, or Chinese network-operations wording, fallback lexicon uses network operations terms even if an upstream taxonomy step misclassifies the role as logistics.
  - Added forbidden logistics terms for cloud/network fallback: pickup, dispatch, route planning, route optimization, delivery status, last-mile.
  - Added clean visible neutral terms and visible phrase separator for fallback copy generation.
- `scripts/test_advice_curator.js`
  - Added regression where a `Network Operator` role is intentionally misclassified as `logistics_operations`; fallback advice must still contain network terms and must not contain pickup/dispatch terms.

Verification:

- Targeted misclassification test passes: Network Operator fallback produces network monitoring / incident response / TCP/IP / Wireshark / uptime wording.
- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## MentorX Fallback Stitching + Report Title De-dupe

Product decisions:

- MentorX strategy/fallback advice may now be displayed under the most explainable external mentor lens when the candidate mentor pool contains a suitable mentor.
- This does not change original attribution:
  - Original MentorX advice displayed under MentorX remains `mentorx_strategy`.
  - Original MentorX advice displayed under an external mentor becomes `stitched_lens`.
  - UI copy remains item-level: `来源：MentorX 按该导师背景整理`.
- Same report duplicate titles are forced to a different variant after the first occurrence.

Backend changes:

- `services/adviceCurator.js`
  - Removed the early return that forced all original MentorX advice to display under MentorX.
  - `inferAttributionMode()` now converts original MentorX advice to `stitched_lens` when the displayed mentor is external.
  - `curateMentorAdvicePlan()` accepts `candidateMentors` / `mentorPool` in addition to curated report mentors.
  - `buildReportPageMentorGroups()` applies `dedupeReportAdviceTitles()` before returning groups.
- `app/lib/atsHelpers.js`
  - Passes `groupAdviceByMentor(mentorCandidates)` into the curator as `candidateMentors`.
- `scripts/audit_desktop_advice_quality.js`
  - Passes the same DB-backed candidate mentor pool into the curator, so desktop audit reflects production behavior.
- `scripts/test_advice_curator.js`
  - Added regression for MentorX fallback advice stitched to an explainable UBS mentor lens.
  - Added regression for duplicate report titles being made unique.

Mobile sync notes:

- Mobile report should continue reading item-level `sourceDisclosure`.
- For `stitched_lens`, do not render copy implying the external mentor personally authored the advice.
- Report item titles may differ from `curatedAdviceItems` titles because report groups now post-process duplicate titles for display uniqueness.

Verification:

- Synthetic test shows MentorX fallback impact advice grouped under UBS with `attributionMode = stitched_lens`.
- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `node --check scripts/audit_desktop_advice_quality.js`
- `node --check services/adviceCurator.js`
- `npm run build`

## Mentor Stitching Tightening

Issue observed after the first stitching audit:

- Stitching worked and duplicate titles were removed.
- However, weak adjacent mentors could be overused:
  - Data Scientist lens appeared for logistics, marketing, and network-operations fallback advice.
  - This made the report look more diverse, but not always more credible.

Fixes:

- `services/adviceCurator.js`
  - Skill fit now requires the mentor to actually carry the skill cluster. Advice self-matching no longer grants skill-fit points by itself.
  - Weak adjacent clusters such as `data`, `analytics`, and `business` are downweighted for `logistics_operations`, `supply_chain_logistics`, `marketing`, and `cloud_infrastructure`.
  - As a result, truly explainable stitches remain:
    - Accountant / finance advice can still stitch to UBS / Barclays.
    - MLE advice can still stitch to Anyscale or similar technical mentors.
  - Weak matches such as Network Operator -> generic Data Scientist now fall back to MentorX strategy instead of being forced into an external mentor group.

Verification:

- Synthetic Accountant fallback advice still stitches to UBS with `stitched_lens`.
- Synthetic Network Operator fallback advice does not stitch to Polarr/Facebook Lead Data Scientist.
- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## Data / Analytics Mentor Stitch Guard

Issue:

- A generic Data Scientist / analytics mentor could still appear for non-data target roles when the advice only covered generic impact metrics or experience evidence.
- Examples from audit:
  - Investment Banking generic impact advice stitched to Polarr/Facebook Lead Data Scientist.
  - Pickup Support Specialist experience evidence stitched to Polarr/Facebook Lead Data Scientist.

Rule added:

- For non data / analytics / ML / quant target roles, Data Scientist / analytics mentors may only display stitched advice when the advice itself explicitly involves data/tooling context such as SQL, Tableau, dashboard, analytics, Python, model, experiment, Google Analytics, Grafana, Wireshark, Splunk, Zabbix, or Nagios.
- Generic impact metrics and generic experience evidence now remain MentorX strategy unless a stronger same-function or adjacent mentor exists.

Implementation:

- `services/adviceCurator.js`
  - Added `isWeakDataAnalyticsMentorForTarget()`.
  - `selectDisplayedMentorForAdvice()` now falls back to MentorX if a data/analytics mentor is only weakly explainable for a non-data target role.
- `scripts/test_advice_curator.js`
  - Added regression: generic operations impact advice must not stitch to Polarr/Facebook Lead Data Scientist.
  - Added regression: marketing advice with Google Analytics / SQL / dashboard context may still stitch to a data mentor.

Verification:

- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## MentorX Display Reduction + In-Group Diversity

Issue:

- Some reports still showed a large `MentorX · 简历策略组` group even when the audit had DB-backed mentor candidates.
- `tracking dashboard` / `CRM` was too weak to justify showing a Data Scientist mentor for non-data roles such as Pickup Support Specialist.
- A single displayed mentor could still receive multiple advice items from the same `coverageFamily`, such as two `impact_metrics` items under Anyscale.
- `impact_metrics` and `keyword` titles were unique but not semantically separated enough.

Fixes:

- `services/adviceCurator.js`
  - Added `avoidMentorXDisplay` as the curator default, so MentorX fallback advice is first stitched to an explainable external mentor when possible.
  - Lowered MentorX display score and allowed viable external mentors to win when they clear role-safety guards.
  - Tightened data mentor guard: for non-data / analytics / ML / quant targets, `dashboard`, `tracking dashboard`, `CRM`, or `operations report` alone no longer count as strong data-tooling evidence.
  - Changed report group item limiting:
    - External mentor groups prefer distinct `coverageFamily` items.
    - External mentor groups do not overflow into duplicate coverage just to fill 3 cards.
    - MentorX strategy groups can still use a higher cap when no explainable external mentor exists.
  - Missing report items are now re-stitched to external mentors before falling back to MentorX.
  - Report group lens/source metadata is refreshed after late re-stitching.
  - Keyword titles now separate Skills keyword work from Experience keyword evidence.
  - Impact titles now separate result numbers from scale / frequency / efficiency wording.
- `scripts/test_advice_curator.js`
  - Added regression for `tracking dashboard` + `CRM` not being enough to stitch Pickup Support advice to a Data Scientist.
  - Added regression that an external ML mentor does not keep two `impact_metrics` items in the same group.

Mobile sync notes:

- Mobile report should expect fewer `MentorX · 简历策略组` groups when an external mentor is explainable.
- Item-level `sourceDisclosure` remains required, because stitched fallback advice can appear under an external mentor.
- Mobile card order may change inside a mentor group because coverage diversity is now preferred over filling every group to 3 items.
- Re-check long titles such as `补上规模、频率和效率` and `把工作量写成可比较指标` on narrow screens.

Verification:

- `node scripts/test_advice_curator.js`
- `npm test`
- `npm run build`

## Report Advice Count Becomes Coverage-Based

Product decision:

- Report page should not have a fixed advice-count ceiling.
- The correct contract is:
  - cover as many detected `problemTags` / obligations as the candidate pool can safely address;
  - remove exact duplicates and repeated action slots;
  - keep keyword advice controlled so it does not dominate the report;
  - keep result page preview at 3 items only.

Backend changes:

- `services/adviceCurator.js`
  - Removed the report-level `slice(0, 9)` cap from curated advice output.
  - `selectDiverseReportAdviceItems()` no longer stops after 9 items.
  - Keyword cap is now a quality-control cap (`3-4` depending on criticality), not a report-size cap.
  - Report group construction no longer limits total displayed report items to 9.
  - Report groups no longer hard cap external mentors to 3 cards; group items are deduped by action slot / duplicate key instead.
  - `coverageSummary.targetAdviceCountMax` is now `null`.
  - Added `coverageSummary.curationMode = "problem_coverage_dedupe"`.
- `src/ats/report-formatter.js`
  - Premium payload now preserves all `reportPageMentorGroups`.
  - Each report group preserves all curated `adviceItems`.
  - `curatedAdviceItems`, `allAdviceItems`, and `paidAdviceItems` are no longer truncated to 12.
  - `resultPageAdviceItems` remains capped at 3.
- `scripts/test_advice_curator.js`
  - Replaced the old `7-9` target-range assertion with coverage/dedupe assertions.
  - Updated external mentor diversity test to check duplicate action slots instead of limiting same `coverageFamily` globally.

Mobile sync notes:

- Mobile report must not assume the full report has exactly 7-9 or 12 advice items.
- Mobile should render all `reportPageMentorGroups[].adviceItems`.
- Result page is still exactly the curated preview top 3.
- Long reports may need mobile spacing / collapsible mentor groups if many problemTags are covered.

Verification:

- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## Problem Coverage Fill + Role-Family Mentor Safety

Issues from the latest desktop audit:

- Finance and Network Operator cases could still display Polarr/Facebook Lead Data Scientist when advice text contained SQL/Tableau/Grafana/Wireshark-like tooling.
- Network Operator could also stitch to a broad `Data & Financial Analyst` mentor, which is still not an infrastructure/network lens.
- Reports were no longer capped at 9/12, but the curated pool still often stopped around 7 because several uncovered tags did not map to role-aware fallback slots.
- Marketing could place all advice under one strong mentor when a second adjacent mentor was available.

Fixes:

- `services/adviceCurator.js`
  - Added role-family display safety:
    - Finance / investment / banking targets block generic Data Scientist mentors unless the mentor has a finance-relevant identity.
    - Network / infra targets block generic Data Scientist and `Data & Financial Analyst` mentors unless the mentor has network / cloud / infra / NOC signals.
  - Added `fillUncoveredProblemAdvice()`.
    - After normal curation and richness fill, the curator scans uncovered `problemTags`.
    - Known tags use role-aware fallback slots.
    - Previously uncovered structural tags now get targeted advice:
      - `missing_github_link` -> project link / verifiable evidence.
      - `missing_exp_location` -> experience location completion.
      - `repetitive_verbs` -> action verb variety.
      - generic optimization/structure tags -> section hierarchy / readability advice.
    - Existing duplicate action slots are not duplicated; instead the existing item receives the missing related tag when appropriate.
  - Added same-mentor soft cap redistribution.
    - If a non-MentorX group exceeds 5 items, lower-priority items are moved to a second explainable mentor when one exists.
    - If no safe second mentor exists, the original group remains intact rather than forcing a bad mentor.
- `scripts/test_advice_curator.js`
  - Added regression that Investment Banking SQL/Tableau keyword advice must not display under Polarr/Facebook Lead Data Scientist.
  - Added regression that Network Operator infra advice must not display under Polarr/Facebook or CBRE Data & Financial Analyst.
  - Added regression for uncovered tag fill covering GitHub link, experience location, and repetitive verbs.
  - Added regression that a 7-item Marketing group redistributes to a second marketing mentor when available.

Mobile sync notes:

- Mobile report should expect additional cards for structural issues such as project links, location, and repetitive verbs.
- Mobile group count may increase when a second safe mentor is available.
- Do not treat `Data & Financial Analyst` as universally safe for infra/network roles in client-side labels or QA copy.

Verification:

- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## Finance Guard Tightening + Role-Aware Mock Mentors

Issues from the follow-up audit:

- Investment Banking no longer showed Polarr/Facebook, but CBRE `Data & Financial Analyst` could still receive generic finance keyword or action-verb advice.
- Pickup Support and Network Operator were safest as MentorX-only, but the report looked too generic without a mentor-facing lens.

Fixes:

- `services/adviceCurator.js`
  - Tightened finance guard for data/analytics-style mentors:
    - For finance / investment / banking targets, `Data & Financial Analyst` style mentors can only display advice when the advice text itself contains finance-specific evidence such as valuation, DCF, deals, transactions, investment analysis, pitch deck, investment memo, comparable companies, M&A, financial statements, or portfolio language.
    - Generic keyword placement and repetitive-verb advice now stay with finance mentors or MentorX instead of CBRE-style data/finance analysts.
  - Added role-aware mock displayed mentors for cases where safe external mentors are absent:
    - Pickup / logistics operations:
      - Amazon · Logistics Operations Manager
      - DHL · Supply Chain Operations Lead
    - Network / infrastructure operations:
      - Cisco · Network Operations Engineer
      - Microsoft · Cloud Infrastructure Engineer
  - Mock mentors are only display lenses.
    - Original advice source remains MentorX/fallback.
    - `attributionMode` becomes `stitched_lens`.
    - `sourceDisclosure` remains `来源：MentorX 按该导师背景整理`.
    - UI must not say these are original advice from that mentor.
- `scripts/test_advice_curator.js`
  - Added regression that generic Investment Banking keyword advice does not display under Polarr/Facebook or CBRE-style data mentors.
  - Added regression that Network Operator advice displays under Cisco/Microsoft mock lens instead of generic data mentors.
  - Added regression that Pickup Support advice displays under Amazon/DHL mock lens with stitched attribution.

Mobile sync notes:

- Mobile report should render mock mentors like normal displayed mentor groups, but source copy must stay item-level.
- Any `stitched_lens` mock item must not use copy such as `该导师建议` or `来自该导师`.
- If showing mentor subtitle, mobile can display `模拟大厂运营视角`, `模拟大厂网络运维视角`, or `模拟大厂基础设施视角`.

Verification:

- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## No Displayed MentorX Groups

Product decision:

- Report page should not display `MentorX · 简历策略组` as a mentor group.
- MentorX may remain as original/source metadata, but displayed mentor groups should be:
  - a fitting real mentor from retrieval; or
  - a role-aware mock mentor from a large company when no fitting real mentor exists.
- Mock mentors must use different companies when multiple mock groups are needed.
- Stitched attribution remains explicit and honest.

Fixes:

- `services/adviceCurator.js`
  - Expanded role-aware mock mentor pool:
    - Finance / IB: JPMorgan, Goldman Sachs.
    - Accounting: Deloitte, PwC.
    - Logistics / pickup operations: Amazon, DHL.
    - Network / infrastructure: Cisco, Microsoft.
    - Marketing: Google, Meta.
    - ML / AI: Google, OpenAI.
    - Software: Google, Microsoft.
    - Operations: Amazon, Uber.
    - Business / consulting: McKinsey, Accenture.
    - Generic fallback: Google, Microsoft.
  - `selectDisplayedMentorForAdvice()` now falls back to a role-aware mock mentor instead of `MENTORX_SOURCE`.
  - `buildReportPageMentorGroups()` no longer creates a MentorX group for remaining/missing items.
  - Added a final `replaceMentorXDisplayedGroups()` pass:
    - Any remaining MentorX displayed group is split into role-aware mock groups.
    - Exact duplicate and duplicate action-slot cards are not re-added.
  - `redistributeOverloadedMentorGroups()` still moves excess cards to a second safe mentor when possible.
- `scripts/test_advice_curator.js`
  - Updated MentorX tests to assert no displayed MentorX groups.
  - Added/updated regressions for Amazon/DHL pickup mock lenses and Cisco/Microsoft network mock lenses.
  - Updated MLE drift regression so finance-source advice can display under Google/OpenAI ML mock lens instead of UBS.

Attribution contract:

- Original MentorX/fallback advice shown under a real or mock mentor uses:
  - `attributionMode = "stitched_lens"`
  - `sourceDisclosure = "来源：MentorX 按该导师背景整理"`
- UI must not render `该导师建议` for stitched mock advice.

Mobile sync notes:

- Mobile report should not special-case `MentorX` as a visible mentor group anymore.
- Mobile should display mock company/title like normal mentor headers.
- Mobile should not render item-level `sourceDisclosure`; attribution metadata can stay in payload for audit/debug only.

Verification:

- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## Hide Visible Source Labels

Product decision:

- Do not show `来源：该导师建议`, `来源：MentorX 策略建议`, or `来源：MentorX 按该导师背景整理` in user-facing advice cards.
- Keep attribution fields in payload/raw audit data so we can still debug verified vs stitched advice.
- Salary/data provenance copy such as `数据来源` can remain because it is not mentor attribution.

Fixes:

- `public/report-logic.js`
  - Removed source disclosure calculation/rendering from mentor group headers and advice cards.
  - Removed visible source line from insider-tip cards to avoid inconsistent source labeling on the report page.
- `scripts/audit_desktop_advice_quality.js`
  - Markdown audit output no longer prints `sourceDisclosure` next to each paid advice item.
  - Raw JSON still keeps `sourceDisclosure` for audit.

Mobile sync notes:

- Mobile report/advice cards should hide source labels as well.
- Mobile can continue to pass through `attributionMode`, `originalMentorSource`, `displayedMentorSource`, and `sourceDisclosure` in data objects for debugging/export.

## Desktop Audit Guard Tightening

Issues observed after the latest desktop JD audit:

- Aaron / Investment Banking still allowed CBRE `Data & Financial Analyst` to display broad keyword and repetitive-verb advice.
- Yuxin / Network Operator still displayed Amazon / DHL logistics mock mentors because logistics mock matching ran before the network / infrastructure override.

Fixes:

- `services/adviceCurator.js`
  - Network / infrastructure mock mentors are now selected before logistics mock mentors.
  - Even if an upstream role profile misclassifies `Network Operator` as logistics, explicit title text such as `Network Operator`, `NOC`, `IT infrastructure`, or `网络运营` now routes to Cisco / Microsoft mock mentors.
  - Added a stricter finance guard for broad `Data & Financial Analyst` / CBRE-style mentors.
  - Generic Investment Banking keyword placement or repetitive-verb advice now routes to a finance mentor/mock lens such as JPMorgan instead of CBRE.
  - CBRE-style data/finance mentors are only allowed when the advice itself contains concrete finance-function evidence such as valuation, DCF, deal / transaction work, financial modeling, pitch deck, investment memo, comparable companies, financial statements, or portfolio analysis.
- `scripts/test_advice_curator.js`
  - Added regression that broad IB keyword/repetitive-verb advice must not display under CBRE.
  - Added regression that Network Operator stays on Cisco / Microsoft even when role profile says logistics.

Verification:

- Synthetic check:
  - `Investment Banking Analyst` generic keyword advice displays under JPMorgan, not CBRE.
  - `Network Operator` generic keyword advice displays under Cisco, not Amazon / DHL.
- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## Mock Mentor Group Balancing

Issue observed after the next desktop audit:

- Aaron / Investment Banking was fixed: no CBRE group appeared.
- Yuxin / Network Operator was fixed away from Amazon / DHL, but all 9 cards were displayed under Cisco.
- This violated the mock mentor rule that fallback display lenses should use multiple different large-company mentors when possible.

Fixes:

- `services/adviceCurator.js`
  - `cleanMentorSource()` now preserves `badges` and `isMockMentor`.
  - `redistributeOverloadedMentorGroups()` can now move low-priority cards from one role-aware mock mentor to another same-role mock mentor even when the normal external-mentor score threshold would be too strict.
  - Network Operator fallback reports can now split between Cisco and Microsoft instead of putting every item under Cisco.
- `scripts/test_advice_curator.js`
  - Added regression that a 9-item Network Operator mock report uses both Cisco and Microsoft, and does not fall back to Amazon / DHL.
  - Relaxed the marketing soft-cap regression so it checks the product rule: multiple fitting marketing companies and no over-cap group, rather than requiring Amazon specifically.

Verification:

- Synthetic check:
  - 9 Network Operator fallback items split into Cisco (5) and Microsoft (4).
- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## Finance Mentor Guard + Deterministic Mock Balancing

Issues observed after the latest desktop audit:

- Aaron / Investment Banking no longer showed CBRE, but a generic Amazon `Vice President` mentor appeared for broad impact-metrics fallback advice.
- Yuxin / Network Operator still showed all 9 advice items under Cisco in the DB-backed audit, even though synthetic scoring could split Cisco / Microsoft.

Fixes:

- `services/adviceCurator.js`
  - Finance targets now block non-finance external mentors unless they are role-aware finance mocks.
  - Generic finance/IB fallback advice no longer displays under broad non-finance executives such as Amazon `Vice President`.
  - Added deterministic role-aware mock balancing after normal redistribution.
  - If a mock mentor group exceeds the soft cap, lower-priority items are moved to another same-role mock mentor from a different company.
  - This does not rely on normal external-mentor scoring, so Network Operator can reliably split Cisco / Microsoft.
- `scripts/test_advice_curator.js`
  - Added regression that generic IB impact advice must not display under Amazon VP.
  - Existing Network Operator mock split regression now covers the deterministic balancing path.

Verification:

- Synthetic check:
  - Generic IB fallback impact advice displays under finance mocks such as Goldman Sachs / JPMorgan, not Amazon.
  - 9 Network Operator fallback items split into Cisco (5) and Microsoft (4).
- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## Expanded Desktop JD Audit Guards

Issues observed after expanding the desktop audit folder from 5 to 10 JD files:

- Generic `Amazon · Vice President` could still appear for finance, software engineering, backend, and production-technology roles.
- Data Engineering JD could be displayed under broad analyst / data-science mentors such as CBRE `Data & Financial Analyst` or Polarr/Facebook `Lead Data Scientist`, instead of data engineering / platform / cloud lenses.
- `Data Engineering` could be inferred as generic software too early because the title contains `Engineering`.

Fixes:

- `services/adviceCurator.js`
  - Role inference now detects `Data Engineer / Data Engineering / Analytics Engineer / ETL / Data Platform / Data Pipeline` before the generic software-engineer match.
  - Added data engineering role-aware mock mentors:
    - Databricks · Data Engineer
    - Snowflake · Data Platform Engineer
  - Added generic-executive guard:
    - Broad titles like `Vice President`, `VP`, `Founder`, `CEO`, or `Director` are blocked for finance / technical / network roles unless the mentor identity has a clear functional signal.
  - Added data engineering mentor guard:
    - Data Engineering targets block broad Data Scientist / Data Analyst / Data & Financial Analyst mentors unless the mentor identity itself has data engineering, platform, cloud, backend, or infrastructure signal.
  - Added final unsafe-displayed-group cleanup:
    - Even if an unsafe original DB mentor group was already formed, report construction now moves its advice to a safe role-aware mock or explainable mentor.
  - Preserved attribution contract:
    - Safe original mentors such as UBS on accounting/finance can remain `verified_original`.
    - Forbidden role-drift originals, such as finance mentors for MLE, are still moved away.
- `scripts/test_advice_curator.js`
  - Added regressions for:
    - Software Engineer generic advice must not display under Amazon VP.
    - Data Engineering advice must display under Databricks / Snowflake instead of CBRE / Polarr.
    - Safe verified original attribution remains intact.
    - Forbidden role-drift original mentors are not preserved.

Verification:

- Synthetic check:
  - Software Engineer advice displays under Google / Microsoft, not Amazon VP.
  - Data Engineering advice displays under Databricks / Snowflake.
  - Investment Banking advice displays under Goldman Sachs / JPMorgan, not Amazon VP.
- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## Generic Executive Guard Expansion

Issue observed after rerunning the 10-JD desktop audit:

- Amazon `Vice President` still appeared in several reports.
- The guard was already effective for synthetic finance/software/data cases, but the product rule should be broader:
  - Generic executive titles without function signal should not display for any specialized target function.
  - Specialized targets should use role-aware mentors or role-aware mock mentors.

Fixes:

- `services/adviceCurator.js`
  - Added `isSpecializedTargetContext()`.
  - Generic executives are now blocked for any specialized function cluster, not only finance / technical / network.
  - Marketing fallback advice now routes to Meta / Google marketing mock lenses instead of Amazon `Vice President`.
  - Software, finance, and data engineering behavior remains:
    - Software -> Google / Microsoft.
    - Investment Banking -> Goldman Sachs / JPMorgan.
    - Data Engineering -> Databricks / Snowflake.
- `scripts/test_advice_curator.js`
  - Added regression that Marketing Specialist advice must not preserve Amazon `Vice President`.

Verification:

- Synthetic check:
  - Marketing Specialist -> Meta / Google.
  - Software Engineer -> Google / Microsoft.
  - Investment Banking Analyst -> Goldman Sachs / JPMorgan.
  - Data Engineering -> Databricks / Snowflake.
- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`

## Final Unsafe Group Cleanup

Issue observed after another 10-JD audit:

- Synthetic item-level routing correctly moved Amazon `Vice President` away from finance/software/data roles.
- However, DB-backed report groups that had already formed could still survive into the final `reportPageMentorGroups`.
- Data Engineering could also keep a finance mentor group for a generic risk/boundary item after earlier group construction.

Fixes:

- `services/adviceCurator.js`
  - Added `isHardUnsafeReportGroup()`.
  - Added `hardCleanUnsafeReportGroups()` immediately before final lens refresh/title de-dupe.
  - Final report groups now get rechecked after all grouping, missing-item fill, replacement, and redistribution steps.
  - Hard cleanup moves:
    - generic executives in specialized roles;
    - finance mentors in non-finance/non-accounting roles when they lack a relevant functional signal;
    - non-data-engineering mentors in Data Engineering reports.
  - Moved items are reassigned to role-aware mock mentors and retain stitched attribution metadata.
- `scripts/test_advice_curator.js`
  - Added regression that formed Data Engineering report groups cannot keep Amazon VP or Morgan Stanley finance groups.

Verification:

- Synthetic check:
  - Data Engineering report with preformed Amazon VP and Morgan Stanley groups is rewritten to Databricks / Snowflake.
- `node scripts/test_advice_curator.js`
- `node scripts/test_mle_role_safety.js`
- `npm test`
- `npm run build`
