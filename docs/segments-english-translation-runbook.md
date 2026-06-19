# Segments English Translation Runbook

This runbook translates `segments` display fields into English for bilingual reports.

Before filling any CSV, use the style guide:

[Segments English Translation Style Guide](./segments-english-translation-style-guide.md)

## 1. Prepare columns

```powershell
node scripts\migrate_bilingual_segments.js
node scripts\migrate_bilingual_segments.js --apply
```

## 2. Check current DB status

```powershell
node scripts\audit_segments_translation_status.js
```

`core_missing` is the main v1 metric. Core columns are the fields used by the app UI:

- `advice_card_title_en`
- `user_problem_summary_en`
- `action_summary_en`
- `canonical_title_en`
- `humanized_mentor_insight_en`
- `humanized_hr_perspective_en`

## 3. Generate a 1,000-row sample

```powershell
node scripts\generate_segments_en_translations.js --limit=1000 --batch-size=40 --concurrency=4 --profile=core --order-by=id --acknowledge-external-translation
node scripts\review_segments_en_translations.js
```

Review the latest file in `outputs\segment-translations`. Do not apply files with holds.

## 4. Generate all rows

Single terminal:

```powershell
node scripts\generate_segments_en_translations.js --limit=25000 --batch-size=40 --concurrency=4 --profile=core --order-by=id --acknowledge-external-translation
```

Parallel fixed shards:

```powershell
node scripts\generate_segments_en_translations.js --limit=7000 --shard-count=4 --shard-index=0 --batch-size=40 --concurrency=3 --profile=core --order-by=id --acknowledge-external-translation
node scripts\generate_segments_en_translations.js --limit=7000 --shard-count=4 --shard-index=1 --batch-size=40 --concurrency=3 --profile=core --order-by=id --acknowledge-external-translation
node scripts\generate_segments_en_translations.js --limit=7000 --shard-count=4 --shard-index=2 --batch-size=40 --concurrency=3 --profile=core --order-by=id --acknowledge-external-translation
node scripts\generate_segments_en_translations.js --limit=7000 --shard-count=4 --shard-index=3 --batch-size=40 --concurrency=3 --profile=core --order-by=id --acknowledge-external-translation
```

Use fixed shards instead of `--offset` for long parallel runs. `--offset` is fine for inspection, but fixed shards avoid row shifts after applying translated rows.

Long runs continue after an individual batch fails. Failed batches write paired files:

- `segments_en_batch_<n>_<timestamp>_failed_raw.txt`
- `segments_en_batch_<n>_<timestamp>_failed_input.json`

Re-run a failed input file with:

```powershell
node scripts\generate_segments_en_translations.js --input-file=outputs\segment-translations\<failed-input-file>.json --batch-size=20 --concurrency=2 --profile=core --acknowledge-external-translation
```

Use `--fail-fast` only when debugging the first failed batch.

## 5. Review, merge, apply

```powershell
node scripts\review_segments_en_translations.js
node scripts\merge_segments_en_translations.js
node scripts\generate_segments_en_translations.js --apply --apply-file=outputs\segment-translations\<merged-file>.json
```

## 6. Manual or external CSV path

If Anthropic export is not approved, export missing rows to CSV:

```powershell
node scripts\export_segments_translation_csv.js --limit=13075 --out=outputs\segment-translations\segments_translation_manual.csv
```

The CSV is written as UTF-8 with BOM by default so Excel on Windows can open Chinese text correctly. Use `--no-bom` only if another tool requires plain UTF-8.

Fill the `*_en` columns in the CSV, then convert it into the same apply JSON shape:

```powershell
node scripts\audit_segments_translation_csv.js --file=outputs\segment-translations\segments_translation_manual.csv
node scripts\convert_segments_translation_csv_to_json.js --file=outputs\segment-translations\segments_translation_manual.csv
node scripts\review_segments_en_translations.js --file=outputs\segment-translations\segments_translation_manual_apply.json
node scripts\generate_segments_en_translations.js --dry-run-apply-file=outputs\segment-translations\segments_translation_manual_apply.json
node scripts\generate_segments_en_translations.js --apply --apply-file=outputs\segment-translations\segments_translation_manual_apply.json
```

To apply only rows that are already fully filled, use `--completed-only`:

```powershell
node scripts\convert_segments_translation_csv_to_json.js --file=outputs\segment-translations\segments_translation_manual_filled.csv --completed-only
node scripts\generate_segments_en_translations.js --dry-run-apply-file=outputs\segment-translations\segments_translation_manual_filled_completed_apply.json
node scripts\generate_segments_en_translations.js --apply --apply-file=outputs\segment-translations\segments_translation_manual_filled_completed_apply.json
```

After any partial apply, refresh the remaining untranslated CSV so future batches exclude completed rows:

```powershell
node scripts\audit_segments_translation_status.js
node scripts\export_segments_translation_csv.js --limit=<core_missing> --out=outputs\segment-translations\segments_translation_remaining.csv
node scripts\split_segments_translation_csv.js --file=outputs\segment-translations\segments_translation_remaining.csv --rows-per-file=1000
node scripts\audit_segments_translation_chunks.js --dir=outputs\segment-translations\segments_translation_remaining_chunks
```

For parallel manual exports:

```powershell
node scripts\export_segments_translation_csv.js --limit=4000 --shard-count=4 --shard-index=0 --out=outputs\segment-translations\segments_translation_manual_0.csv
node scripts\export_segments_translation_csv.js --limit=4000 --shard-count=4 --shard-index=1 --out=outputs\segment-translations\segments_translation_manual_1.csv
node scripts\export_segments_translation_csv.js --limit=4000 --shard-count=4 --shard-index=2 --out=outputs\segment-translations\segments_translation_manual_2.csv
node scripts\export_segments_translation_csv.js --limit=4000 --shard-count=4 --shard-index=3 --out=outputs\segment-translations\segments_translation_manual_3.csv
```

For easier manual or external processing, split one large CSV into smaller files:

```powershell
node scripts\split_segments_translation_csv.js --file=outputs\segment-translations\segments_translation_manual.csv --rows-per-file=1000
node scripts\audit_segments_translation_chunks.js --dir=outputs\segment-translations\segments_translation_manual_chunks
```

After filling the split files, merge them back:

```powershell
node scripts\merge_segments_translation_csv.js --dir=outputs\segment-translations\segments_translation_manual_chunks --out=outputs\segment-translations\segments_translation_manual_filled.csv
node scripts\audit_segments_translation_csv.js --file=outputs\segment-translations\segments_translation_manual_filled.csv
```

Before converting a filled CSV, confirm:

- `completeRows` equals `totalRows`
- `duplicateIds` is empty
- `cjkByColumn` counts are all `0`
- `qaWarnings` are reviewed, especially extra/missing numbers and missing Latin technical tokens

## 7. Verify completion

```powershell
node scripts\audit_segments_translation_status.js
```

For v1 completion, `core_missing` should be `0`.
