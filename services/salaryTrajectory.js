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
  // Logistics / Operations Support
  logistics_operations: "logistics_operations_support",
  logistics_operations_support: "logistics_operations_support",
  // Supply Chain
  supply_chain: "supply_chain_operations",
  supply_chain_operations: "supply_chain_operations",
  supply_chain_logistics: "supply_chain_operations",
  // Business Operations
  business_operations: "business_operations",
  operations: "business_operations",
  // Data Analytics (ML, DS → same benchmark)
  data_analyst: "data_analytics",
  data_analytics: "data_analytics",
  data_scientist: "data_analytics",
  machine_learning: "data_analytics",
  machine_learning_engineer: "data_analytics",
  // Data Engineering
  data_engineer: "data_engineer",
  analytics_engineer: "data_engineer",
  database_administrator: "data_engineer",
  database_engineer: "data_engineer",
  // Software Engineering (AI → same benchmark)
  ai_engineer: "software_engineering",
  software_engineer: "software_engineering",
  software_engineering: "software_engineering",
  software_development_engineer: "software_engineering",
  frontend_engineer: "software_engineering",
  backend_engineer: "software_engineering",
  full_stack_engineer: "software_engineering",
  // Product Management
  product_manager: "product_management",
  product_management: "product_management",
  // Marketing
  marketing: "marketing",
  marketing_growth: "marketing",
  // Finance / Accounting
  finance: "finance_accounting",
  financial_analyst: "finance_accounting",
  accounting: "finance_accounting",
  finance_accounting: "finance_accounting",
  // Cybersecurity
  cybersecurity: "cybersecurity",
  information_security: "cybersecurity",
  security_analyst: "cybersecurity",
  security_engineer: "cybersecurity",
  // Cloud / Infrastructure / DevOps
  cloud_infrastructure: "cloud_infrastructure",
  devops: "cloud_infrastructure",
  sre: "cloud_infrastructure",
  site_reliability_engineer: "cloud_infrastructure",
  platform_engineer: "cloud_infrastructure",
  system_administrator: "cloud_infrastructure",
  network_engineer: "cloud_infrastructure",
  solutions_architect: "cloud_infrastructure",
  // Hardware / Electrical
  hardware_electrical: "hardware_electrical",
  hardware_engineer: "hardware_electrical",
  electrical_engineer: "hardware_electrical",
  embedded_engineer: "hardware_electrical",
  // Mechanical Engineering
  mechanical_engineering: "mechanical_engineering",
  mechanical_engineer: "mechanical_engineering",
  // Manufacturing / Process
  manufacturing_process: "manufacturing_process",
  process_engineer: "manufacturing_process",
  manufacturing_engineer: "manufacturing_process",
  production_engineer: "manufacturing_process",
  // Industrial / Quality
  industrial_quality: "industrial_quality",
  industrial_engineer: "industrial_quality",
  quality_engineer: "industrial_quality",
  qa_engineer: "industrial_quality",
  // Civil / Construction
  civil_construction: "civil_construction",
  civil_engineer: "civil_construction",
  structural_engineer: "civil_construction",
  construction_manager: "civil_construction",
  // Project / Program Management
  project_program_management: "project_program_management",
  project_manager: "project_program_management",
  program_manager: "project_program_management",
  scrum_master: "project_program_management",
  technical_program_manager: "project_program_management",
  engineering_manager: "project_program_management",
  // Procurement
  procurement: "procurement",
  purchasing_agent: "procurement",
  sourcing_manager: "procurement",
  // Consulting
  consulting: "consulting",
  management_consultant: "consulting",
  strategy_consultant: "consulting",
  management_trainee: "consulting",
  // Business Analysis
  business_analysis: "business_analysis",
  business_analyst: "business_analysis",
  systems_analyst: "business_analysis",
  management_analyst: "business_analysis",
  // Actuarial
  actuarial: "actuarial",
  actuary: "actuarial",
  // Trading / Quant
  trading_quant: "trading_quant",
  quantitative_analyst: "trading_quant",
  quant_researcher: "trading_quant",
  // Sales / Customer Success
  sales_customer_success: "sales_customer_success",
  sales: "sales_customer_success",
  account_executive: "sales_customer_success",
  customer_success: "sales_customer_success",
  business_development: "sales_customer_success",
  // Communications / PR
  communications_pr: "communications_pr",
  public_relations: "communications_pr",
  communications: "communications_pr",
  technical_writer: "communications_pr",
  // UX / Product Design
  ux_research_design: "ux_research_design",
  ux_designer: "ux_research_design",
  ux_researcher: "ux_research_design",
  product_designer: "ux_research_design",
  ui_designer: "ux_research_design",
  // Graphic / Creative Design
  design_creative: "design_creative",
  graphic_designer: "design_creative",
  visual_designer: "design_creative",
  // Legal / Compliance
  legal_compliance: "legal_compliance",
  lawyer: "legal_compliance",
  attorney: "legal_compliance",
  paralegal: "legal_compliance",
  compliance_officer: "legal_compliance",
  legal_analyst: "legal_compliance",
  // Healthcare
  healthcare: "healthcare",
  nurse: "healthcare",
  // Life Sciences
  life_sciences: "life_sciences",
  biologist: "life_sciences",
  research_scientist: "life_sciences",
  // HR / Recruiting
  hr_recruiting: "hr_recruiting",
  hr_specialist: "hr_recruiting",
  recruiter: "hr_recruiting",
  talent_acquisition: "hr_recruiting",
  human_resources: "hr_recruiting",
  // Education
  education: "education",
  teacher: "education",
  instructor: "education",
  professor: "education",
  // Policy / Public Sector
  policy_public_sector: "policy_public_sector",
  policy_analyst: "policy_public_sector",
  government: "policy_public_sector",
  nonprofit: "policy_public_sector",
  // Journalism / Media
  journalism_media: "journalism_media",
  journalist: "journalism_media",
  reporter: "journalism_media",
  editor: "journalism_media",
  // Hospitality / Events
  hospitality_events: "hospitality_events",
  hospitality: "hospitality_events",
  event_planner: "hospitality_events",
  // Research / Academic
  research_academic: "research_academic",
  research_assistant: "research_academic",
  postdoc: "research_academic",
  researcher: "research_academic",
  // Social Services
  social_services: "social_services",
  social_worker: "social_services",
  case_manager: "social_services",
  // Sustainability / Environment
  sustainability_environment: "sustainability_environment",
  sustainability: "sustainability_environment",
  environmental_analyst: "sustainability_environment",
  esg_analyst: "sustainability_environment",
  // IT Support
  it_support: "it_support",
  technical_support: "it_support",
  help_desk: "it_support",
};

const ROLE_FAMILY_PATTERNS = [
  // Higher-specificity patterns first
  { family: "data_engineer",              pattern: /\b(data engineer|analytics engineer|etl|data pipeline|data warehouse|data architect|spark|kafka|airflow|dbt|big data)\b|数据工程|数据管道|数据架构/i },
  { family: "cybersecurity",              pattern: /\b(cybersecurity|information security|security analyst|security engineer|penetration tester|soc analyst|network security|siem|vulnerability)\b|网络安全|信息安全/i },
  { family: "cloud_infrastructure",       pattern: /\b(cloud engineer|devops|sre|site reliability|platform engineer|system administrator|network architect|solutions architect|kubernetes|terraform)\b|云计算|基础设施|平台工程/i },
  { family: "hardware_electrical",        pattern: /\b(hardware engineer|electrical engineer|circuit|pcb|semiconductor|vlsi|fpga|asic|embedded|firmware|rf engineer|analog|硬件|电气|嵌入式|芯片|半导体)\b/i },
  { family: "mechanical_engineering",     pattern: /\b(mechanical engineer|solidworks|autocad|thermal engineer|structural engineer|fea|hvac|cad engineer)\b|机械工程师|机械设计/i },
  { family: "manufacturing_process",      pattern: /\b(process engineer|manufacturing engineer|production engineer|semiconductor process|fab engineer|clean room|yield engineer|materials engineer)\b|工艺工程师|制造工程师|产线/i },
  { family: "industrial_quality",         pattern: /\b(industrial engineer|quality engineer|lean engineer|six sigma|continuous improvement|quality assurance|quality control|iso engineer)\b|工业工程|质量工程|精益/i },
  { family: "civil_construction",         pattern: /\b(civil engineer|structural engineer|geotechnical|construction manager|site manager|transportation engineer)\b|土木工程师|结构工程师|施工/i },
  { family: "actuarial",                  pattern: /\b(actuary|actuarial|actuarial analyst|insurance modeling|catastrophe modeling|pension actuarial)\b|精算师|精算/i },
  { family: "trading_quant",              pattern: /\b(quant|quantitative analyst|algorithmic trading|quant researcher|hedge fund|derivatives trader|portfolio manager)\b|量化分析师|交易员|对冲基金/i },
  { family: "project_program_management", pattern: /\b(project manager|program manager|scrum master|technical program manager|tpm|delivery manager|pmp|agile coach)\b|项目经理|项目管理|技术项目/i },
  { family: "procurement",                pattern: /\b(procurement|purchasing agent|sourcing manager|category manager|strategic sourcing|vendor manager|contract manager)\b|采购|供应商管理|战略采购/i },
  { family: "consulting",                 pattern: /\b(management consultant|strategy consultant|business consultant|advisory consultant|management trainee|associate consultant)\b|管理咨询|战略顾问|管培生/i },
  { family: "business_analysis",          pattern: /\b(business analyst|systems analyst|business systems analyst|requirements analyst|process analyst|erp analyst)\b|业务分析师|系统分析师|需求分析/i },
  { family: "ux_research_design",         pattern: /\b(ux designer|ui designer|user experience|user researcher|product designer|interaction designer|hci|usability researcher|figma)\b|用户体验|交互设计|产品设计师/i },
  { family: "design_creative",            pattern: /\b(graphic designer|visual designer|art director|illustrator|animator|motion designer|brand designer|creative director)\b|平面设计师|视觉设计|品牌设计/i },
  { family: "legal_compliance",           pattern: /\b(lawyer|attorney|paralegal|compliance officer|compliance analyst|regulatory analyst|general counsel|law clerk|legal operations)\b|律师|法务|合规|法律顾问/i },
  { family: "healthcare",                 pattern: /\b(nurse|registered nurse|physician|clinical|healthcare|therapist|pharmacist|radiology|epidemiologist|public health)\b|医疗|临床护理|护士|公共卫生/i },
  { family: "life_sciences",              pattern: /\b(biologist|biochemist|research scientist|biomedical|pharmaceutical scientist|clinical research associate|genomics|bioinformatics|biotech|drug discovery)\b|生命科学|生物学家|制药研究|生化/i },
  { family: "hr_recruiting",              pattern: /\b(human resources|hr specialist|recruiter|talent acquisition|people operations|hrbp|hr business partner|compensation analyst)\b|人力资源|招聘专员|人才获取/i },
  { family: "sales_customer_success",     pattern: /\b(account executive|account manager|customer success|business development|sales engineer|solutions engineer|revenue)\b|客户成功|商务拓展|销售工程师/i },
  { family: "communications_pr",          pattern: /\b(public relations|pr specialist|media relations|corporate communications|technical writer|copywriter|external communications)\b|公关专员|企业传播|媒体关系/i },
  { family: "sustainability_environment", pattern: /\b(sustainability|environmental scientist|environmental analyst|esg analyst|climate|carbon|renewable energy|csr)\b|可持续发展|环境分析师|碳排放|ESG/i },
  { family: "research_academic",          pattern: /\b(research assistant|research associate|postdoc|postdoctoral|lab researcher|academic researcher|r&d scientist)\b|研究助理|博士后|科研|学术研究/i },
  { family: "social_services",            pattern: /\b(social worker|case manager|crisis counselor|child welfare|family services|mental health counselor|substance abuse)\b|社工|案例管理|心理辅导|家庭服务/i },
  { family: "policy_public_sector",       pattern: /\b(policy analyst|government analyst|public administration|urban planner|nonprofit program|legislative analyst|public health policy)\b|政策分析师|政府|公共部门|非营利/i },
  { family: "journalism_media",           pattern: /\b(journalist|reporter|news editor|news analyst|broadcaster|publishing|digital media producer|videographer)\b|记者|新闻编辑|媒体人|新闻/i },
  { family: "education",                  pattern: /\b(teacher|professor|instructor|curriculum designer|instructional designer|k-12|academic advisor|student affairs|tutor)\b|教师|课程设计师|学术顾问|助教/i },
  { family: "hospitality_events",         pattern: /\b(hotel manager|event planner|event coordinator|food and beverage|catering|concierge|tourism|front desk manager)\b|酒店管理|活动策划|餐饮|旅游/i },
  { family: "it_support",                 pattern: /\b(it support|technical support|help desk|service desk|desktop support|it operations|computer user support)\b|IT支持|技术支持|服务台/i },
  // Broader patterns (lower specificity, checked after specific ones)
  { family: "software_engineering",       pattern: /\b(software engineer|software developer|sde|swe|frontend|front-end|backend|back-end|full stack|full-stack|react|node\.?js|typescript|java|python developer)\b|软件工程师|前端|后端|全栈/i },
  { family: "data_analytics",             pattern: /\b(data analyst|business intelligence|bi analyst|data scientist|analytics|sql|tableau|power bi|dashboard|machine learning|ml engineer|mle)\b|数据分析|商业分析|数据科学|机器学习|算法/i },
  { family: "product_management",         pattern: /\b(product manager|associate product manager|apm|product owner|roadmap|user research|product strategy)\b|产品经理|产品负责人/i },
  { family: "finance_accounting",         pattern: /\b(financial analyst|finance|accounting|accountant|audit|tax|fp&a|valuation|quickbooks|gaap)\b|会计|审计|财务|金融分析/i },
  { family: "marketing",                  pattern: /\b(marketing|growth marketer|social media|campaign|content marketing|seo|sem|brand manager)\b|市场|营销|增长|社媒|内容运营/i },
  { family: "supply_chain_operations",    pattern: /\b(supply chain|logistics analyst|operations analyst|inventory|fulfillment)\b|供应链|库存|履约|物流分析/i },
  { family: "logistics_operations_support", pattern: /\b(logistics|operations support|pickup|dispatch|warehouse|delivery|parcel|fleet)\b|揽收|调度|仓库|物流|末端|运营支持/i },
  { family: "business_operations",        pattern: /\b(business operations|operations specialist|program coordinator|project coordinator|operations coordinator)\b|业务运营|项目协调|运营专员/i },
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
