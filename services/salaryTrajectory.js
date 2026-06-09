"use strict";

const fs = require("fs");
const path = require("path");

function loadBenchmarks() {
  const generatedPath = path.join(__dirname, "..", "data", "salary_benchmarks.generated.json");
  if (fs.existsSync(generatedPath)) return JSON.parse(fs.readFileSync(generatedPath, "utf8"));
  return require("../data/salary_benchmarks.json");
}

const benchmarks = loadBenchmarks();

const ROLE_FAMILY_ALIASES = {
  logistics_operations: "logistics_operations_support",
  logistics_operations_support: "logistics_operations_support",
  supply_chain: "supply_chain_operations",
  supply_chain_operations: "supply_chain_operations",
  business_operations: "business_operations",
  operations: "business_operations",
  data_analyst: "data_analytics",
  data_analytics: "data_analytics",
  data_scientist: "data_analytics",
  machine_learning: "data_analytics",
  machine_learning_engineer: "data_analytics",
  ai_engineer: "software_engineering",
  software_engineer: "software_engineering",
  software_engineering: "software_engineering",
  software_development_engineer: "software_engineering",
  frontend_engineer: "software_engineering",
  backend_engineer: "software_engineering",
  full_stack_engineer: "software_engineering",
  product_manager: "product_management",
  product_management: "product_management",
  marketing: "marketing",
  marketing_growth: "marketing",
  finance: "finance_accounting",
  financial_analyst: "finance_accounting",
  accounting: "finance_accounting",
  finance_accounting: "finance_accounting",
};

const ROLE_FAMILY_PATTERNS = [
  { family: "software_engineering", pattern: /\b(software engineer|software developer|sde|swe|frontend|front-end|backend|back-end|full stack|full-stack|react|node\.?js|typescript|java|python developer)\b|软件|前端|后端|全栈/i },
  { family: "data_analytics", pattern: /\b(data analyst|business analyst|business intelligence|bi analyst|data scientist|analytics|sql|tableau|power bi|dashboard|machine learning|ml engineer|mle)\b|数据分析|商业分析|数据科学|机器学习|算法/i },
  { family: "product_management", pattern: /\b(product manager|associate product manager|apm|product owner|roadmap|user research|product strategy)\b|产品经理|产品负责人/i },
  { family: "finance_accounting", pattern: /\b(financial analyst|finance|accounting|accountant|audit|tax|fp&a|valuation|quickbooks|gaap)\b|会计|审计|财务|金融分析/i },
  { family: "marketing", pattern: /\b(marketing|growth|social media|campaign|content marketing|seo|sem|brand)\b|市场|营销|增长|社媒|内容运营/i },
  { family: "supply_chain_operations", pattern: /\b(supply chain|logistics analyst|operations analyst|inventory|fulfillment|procurement)\b|供应链|库存|履约|物流分析/i },
  { family: "logistics_operations_support", pattern: /\b(logistics|operations support|pickup|dispatch|warehouse|delivery|parcel|fleet)\b|揽收|调度|仓库|物流|末端|运营支持/i },
  { family: "business_operations", pattern: /\b(business operations|operations specialist|program coordinator|project coordinator|operations coordinator)\b|业务运营|项目协调|运营专员/i },
];

const LOCATION_ALIASES = [
  { pattern: /\b(virginia|va)\b|弗吉尼亚/i, label: "Virginia" },
  { pattern: /\b(tennessee|tn)\b|田纳西/i, label: "Tennessee" },
  { pattern: /\b(california|ca)\b|加州|洛杉矶|los angeles|san francisco/i, label: "California" },
  { pattern: /\b(new york|ny)\b|纽约/i, label: "New York" },
  { pattern: /\b(washington|wa|seattle)\b|西雅图/i, label: "Washington" },
  { pattern: /\b(texas|tx|austin|dallas|houston)\b/i, label: "Texas" },
  { pattern: /\b(florida|fl|miami)\b|迈阿密/i, label: "Florida" },
  { pattern: /\b(remote)\b|远程/i, label: "Remote / US" },
];

function normalizeText(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function normalizeFamily(value = "") {
  const normalized = normalizeText(value).replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return ROLE_FAMILY_ALIASES[normalized] || normalized;
}

function inferRoleFamilyFromText(value = "") {
  const text = String(value || "");
  if (!text.trim()) return "";
  const match = ROLE_FAMILY_PATTERNS.find((item) => item.pattern.test(text));
  return match ? match.family : "";
}

function money(value) {
  if (!Number.isFinite(Number(value))) return null;
  const rounded = Math.round(Number(value) / 1000);
  return `$${rounded}K`;
}

function range(low, high) {
  const a = money(low);
  const b = money(high);
  if (!a && !b) return null;
  if (a === b || !b) return a;
  return `${a}-${b}`;
}

function parseNumber(raw = "") {
  const text = String(raw).replace(/[$,\s]/g, "").toLowerCase();
  const number = parseFloat(text);
  if (!Number.isFinite(number)) return null;
  if (/万/.test(raw)) return number * 10000;
  if (/k/.test(text)) return number * 1000;
  if (number < 1000 && !/\/\s*(h|hr|hour)|小时|每小时/i.test(raw)) return number * 1000;
  return number;
}

function formatExplicitSalary(match) {
  if (!match) return null;
  if (match.kind === "hourly") {
    return match.high && match.high !== match.low ? `$${match.low}-${match.high}/hr` : `$${match.low}/hr`;
  }
  return range(match.low, match.high || match.low);
}

function extractExplicitSalary(jdText = "") {
  const text = String(jdText || "");
  if (!text.trim()) return null;

  const hourly = text.match(/\$?\s*(\d{2,3}(?:\.\d+)?)\s*(?:-|–|—|to|~|至|到)\s*\$?\s*(\d{2,3}(?:\.\d+)?)\s*(?:\/\s*(?:h|hr|hour)|per\s+hour|每小时|小时)/i)
    || text.match(/\$?\s*(\d{2,3}(?:\.\d+)?)\s*(?:\/\s*(?:h|hr|hour)|per\s+hour|每小时|小时)/i);
  if (hourly) {
    return {
      kind: "hourly",
      low: Number(hourly[1]),
      high: hourly[2] ? Number(hourly[2]) : Number(hourly[1]),
      label: formatExplicitSalary({ kind: "hourly", low: Number(hourly[1]), high: hourly[2] ? Number(hourly[2]) : Number(hourly[1]) }),
      confidence: "high",
    };
  }

  const annualPatterns = [
    /(?:salary|compensation|base pay|pay range|薪资|薪酬|年薪)[^\n$￥¥\d]{0,20}[$￥¥]?\s*([\d,.]+)\s*(k|K|万)?\s*(?:-|–|—|to|~|至|到)\s*[$￥¥]?\s*([\d,.]+)\s*(k|K|万)?/i,
    /[$￥¥]\s*([\d,.]+)\s*(k|K)?\s*(?:-|–|—|to|~|至|到)\s*[$￥¥]?\s*([\d,.]+)\s*(k|K)?/i,
    /([\d,.]+)\s*(k|K|万)\s*(?:-|–|—|to|~|至|到)\s*([\d,.]+)\s*(k|K|万)/i,
    /\b([\d]{2,3}(?:,\d{3})+)\s*(?:-|–|—|to|~|至|到)\s*([\d]{2,3}(?:,\d{3})+)\b/i,
  ];

  for (const pattern of annualPatterns) {
    const found = text.match(pattern);
    if (!found) continue;
    const compactRange = !found[3];
    const firstSuffix = compactRange ? "" : (found[2] || found[4] || "");
    const secondSuffix = compactRange ? "" : (found[4] || found[2] || "");
    const low = parseNumber(`${found[1]}${firstSuffix}`);
    const high = parseNumber(`${compactRange ? found[2] : found[3]}${secondSuffix}`);
    if (!low || !high) continue;
    const normalizedLow = Math.min(low, high);
    const normalizedHigh = Math.max(low, high);
    if (normalizedHigh < 20000 || normalizedHigh > 1000000) continue;
    return {
      kind: "annual",
      low: normalizedLow,
      high: normalizedHigh,
      label: range(normalizedLow, normalizedHigh),
      confidence: "high",
    };
  }

  if (/\b(doe|depends on experience|competitive salary|negotiable)\b|薪资面议|薪酬面议|面议/i.test(text)) {
    return { kind: "undisclosed", label: "JD 写明薪资面议", confidence: "medium" };
  }
  return null;
}

function detectLocation(explicitLocation = "") {
  if (explicitLocation) {
    for (const item of LOCATION_ALIASES) {
      if (item.pattern.test(explicitLocation)) return { label: item.label, source: "explicit" };
    }
    return { label: explicitLocation, source: "explicit" };
  }
  return { label: "United States", source: "default" };
}

function keywordScore(benchmark, text) {
  return (benchmark.keywords || []).reduce((score, keyword) => {
    const normalized = normalizeText(keyword);
    if (!normalized) return score;
    if (text.includes(normalized)) return score + Math.min(4, Math.max(1, normalized.split(/\s+/).length));
    return score;
  }, 0);
}

function locationScore(benchmark, matchedLocation) {
  const location = String(matchedLocation || "United States").toLowerCase();
  const benchmarkLocation = String(benchmark.location_name || "").toLowerCase();
  const scope = String(benchmark.location_scope || "").toLowerCase();
  if (!location || location === "united states") return scope === "national" ? 2 : 0;
  if (benchmarkLocation === location) return 4;
  if (benchmarkLocation.includes(location) || location.includes(benchmarkLocation)) return 3;
  if (scope === "national") return 1;
  return 0;
}

function benchmarkFamilyScore(benchmark, roleFamily = "") {
  const mapped = normalizeFamily(roleFamily);
  if (!mapped) return 0;
  return mapped === benchmark.role_family ? 12 : 0;
}

function matchBenchmark(jobTitle = "", jdText = "", matchedLocation = "United States", options = {}) {
  const titleText = normalizeText(jobTitle);
  const inferredFamily = inferRoleFamilyFromText([jobTitle, options.targetRole, options.resumeText].filter(Boolean).join(" "))
    || normalizeFamily(options.roleFamily)
    || inferRoleFamilyFromText(jdText);
  const profileText = normalizeText([
    options.roleFamily,
    options.targetRole,
    options.resumeText,
  ].filter(Boolean).join(" ")).slice(0, 4000);
  const fullText = normalizeText(`${jobTitle} ${jdText} ${profileText}`).slice(0, 12000);
  const ranked = benchmarks
    .map((benchmark) => {
      const titleScore = keywordScore(benchmark, titleText) * 3;
      const bodyScore = keywordScore(benchmark, fullText);
      const familyScore = benchmarkFamilyScore(benchmark, inferredFamily || options.roleFamily || options.targetRole);
      const roleScore = titleScore + bodyScore + familyScore;
      return {
        benchmark,
        roleScore,
        score: roleScore * 10 + (familyScore ? 1000 : 0) + locationScore(benchmark, matchedLocation),
      };
    })
    .sort((a, b) => b.score - a.score);
  if (!ranked[0] || ranked[0].roleScore <= 0) return null;
  return {
    ...ranked[0].benchmark,
    match_score: ranked[0].roleScore,
    confidence: ranked[0].roleScore >= 6 ? ranked[0].benchmark.confidence : "low",
    inferred_family: inferredFamily || null,
  };
}

function buildTrajectoryFromBenchmark(benchmark) {
  if (!benchmark) return null;
  return {
    current_range: range(benchmark.annual_p25, benchmark.annual_median),
    three_year_range: range(benchmark.annual_median, benchmark.annual_p75),
    five_year_range: range(benchmark.annual_p75, benchmark.annual_p90),
    top_range: money(benchmark.annual_p90),
  };
}

function buildSalaryTrajectory({ jobTitle = "", jdText = "", location = "", resumeText = "", roleFamily = "", targetRole = "" } = {}) {
  const explicitSalary = extractExplicitSalary(jdText);
  const locationMatch = detectLocation(location);
  const matchedLocation = locationMatch.label;
  const benchmark = matchBenchmark(jobTitle, jdText, matchedLocation, { resumeText, roleFamily, targetRole });
  const trajectory = buildTrajectoryFromBenchmark(benchmark);

  if (!benchmark || !trajectory) {
    return {
      success: true,
      found: Boolean(explicitSalary),
      salary_source: explicitSalary ? "jd_explicit" : "unavailable",
      trajectory_source: "unavailable",
      jd_salary: explicitSalary ? explicitSalary.label : null,
      salary_range: explicitSalary ? explicitSalary.label : null,
      current_range: null,
      three_year_range: null,
      five_year_range: null,
      top_range: null,
      role_family: null,
      matched_role: null,
      matched_location: matchedLocation,
      matched_location_source: locationMatch.source,
      confidence: explicitSalary ? "low" : "low",
      source_note: explicitSalary
        ? "JD 写明薪资，但暂未稳定匹配到同赛道成长 benchmark。"
        : "暂未稳定匹配到岗位 family，无法给出可靠成长区间。",
    };
  }

  return {
    success: true,
    found: true,
    salary_source: explicitSalary ? "jd_explicit" : "benchmark",
    trajectory_source: "benchmark",
    jd_salary: explicitSalary ? explicitSalary.label : null,
    salary_range: explicitSalary ? explicitSalary.label : trajectory.current_range,
    current_range: trajectory.current_range,
    three_year_range: trajectory.three_year_range,
    five_year_range: trajectory.five_year_range,
    top_range: trajectory.top_range,
    role_family: benchmark.role_family,
    matched_role: benchmark.family_label || benchmark.soc_title,
    position_title: benchmark.family_label || benchmark.soc_title,
    matched_location: matchedLocation,
    matched_location_source: locationMatch.source,
    confidence: benchmark.confidence || "medium",
    source_note: `${benchmark.source}; ${benchmark.source_year}; SOC ${benchmark.soc_code} ${benchmark.soc_title}.`,
  };
}

module.exports = {
  buildSalaryTrajectory,
  extractExplicitSalary,
  matchBenchmark,
};
