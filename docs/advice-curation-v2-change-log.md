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
