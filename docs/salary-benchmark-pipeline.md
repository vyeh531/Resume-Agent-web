# Salary Benchmark Pipeline

Result page salary growth uses local benchmark data only. It does not call AI APIs, BLS/O*NET live APIs, or third-party salary sites at user runtime.

## Data Source

Use BLS OEWS official downloadable data as the wage source. Use O*NET/SOC concepts for occupation alignment and role-family naming.

Recommended source:

- BLS OEWS May 2025 `All data (TXT)` or `All data (CSV/TXT ZIP)` from the OEWS tables page.
- If automated download is blocked by BLS bot protection, download the file manually in a browser.

Do not scrape Levels.fyi, Glassdoor, Indeed, or similar commercial sites. Add those only through licensed data/API access.

## File Layout

Place raw official files here:

```text
data/salary/raw/
```

The app reads benchmarks in this order:

```text
data/salary_benchmarks.generated.json
data/salary_benchmarks.json
```

The generated file is the full benchmark. The smaller `salary_benchmarks.json` file is only a seed fallback.

## Generate Benchmarks

```bash
node scripts/build_salary_benchmarks.js --input data/salary/raw/oesm25all.zip --year 2025
```

or:

```bash
node scripts/build_salary_benchmarks.js --input data/salary/raw/oesm25all.txt --year 2025
```

Output:

```text
data/salary_benchmarks.generated.json
```

## What The Script Produces

For each usable OEWS occupation row, the script creates benchmark rows with:

- `role_family`
- `family_label`
- `soc_code`
- `soc_title`
- `location_scope`
- `location_name`
- `annual_p25`
- `annual_median`
- `annual_p75`
- `annual_p90`
- `source`
- `source_year`
- `confidence`

Curated families in `data/salary/role_family_aliases.json` map common product-facing families such as logistics, data, software, PM, marketing, finance, and operations. All other occupations are still imported as SOC-level fallback families.

## Runtime Behavior

At runtime, `/api/position-salary`:

1. extracts explicit JD salary if present,
2. detects role family / SOC benchmark from title and JD text,
3. prefers matching state/location benchmark when available,
4. falls back to national benchmark,
5. returns current / 3-year / 5-year / high-percentile salary ranges.

