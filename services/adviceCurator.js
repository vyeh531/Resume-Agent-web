"use strict";

const { buildRoleProfileFromContext } = require("../src/ats/role-profile");
const {
  buildRoleAwareFallbackAdvice,
  buildFallbackAdviceForSlot,
  buildRoleLexicon,
  slotForProblemTag,
} = require("../src/ats/role-fallback-advice");


function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeText(value) {
  return String(value || "").trim();
}

function lowerText(value) {
  return normalizeText(value).toLowerCase();
}

function compactKey(value) {
  return lowerText(value).replace(/[^a-z0-9]+/g, " ").trim();
}

function isMentorXProfile(profile = {}) {
  const text = compactKey(`${profile.company || ""} ${profile.mentorName || ""} ${profile.mentorTitle || ""} ${profile.mentorSubtitle || ""}`);
  return /\bmentorx\b/.test(text);
}

function mentorGroupKey(profile = {}) {
  if (isMentorXProfile(profile)) return "mentorx";
  const company = compactKey(profile.company);
  const title = compactKey(profile.mentorTitle || profile.mentorSubtitle);
  const name = compactKey(profile.mentorName);
  if (company) return [company, title, name].filter(Boolean).join("|");
  if (profile.mentorId) return `id:${profile.mentorId}`;
  if (name) return `name:${name}`;
  return "mentorx";
}

function mentorLogoFor(profile = {}) {
  if (profile.companyLogo) return profile.companyLogo;
  if (isMentorXProfile(profile)) return "/logo/MentorX.png";
  return null;
}

function cleanMentorSource(source = {}) {
  if (!source) return null;
  const mentorName = normalizeText(source.mentorName || source.name);
  const company = normalizeText(source.company || source.mentorCompany);
  const mentorTitle = normalizeText(source.mentorTitle || source.title);
  const mentorId = source.mentorId || source.id || null;
  if (!mentorId && !mentorName && !company && !mentorTitle) return null;
  const profile = {
    mentorId,
    mentorName,
    company,
    companyLogo: source.companyLogo || null,
    mentorTitle,
    mentorSubtitle: source.mentorSubtitle || "",
    badges: source.badges || [],
    isMockMentor: source.isMockMentor === true || /^mock_/.test(String(mentorId || "")),
  };
  return {
    ...profile,
    companyLogo: mentorLogoFor(profile) || profile.companyLogo,
  };
}

const MENTORX_SOURCE = {
  mentorId: "mentorx_strategy",
  mentorName: "MentorX",
  company: "MentorX",
  companyLogo: "/logo/MentorX.png",
  mentorTitle: "简历策略组",
  mentorSubtitle: "简历策略组",
};

function sameMentorSource(a = {}, b = {}) {
  const left = cleanMentorSource(a);
  const right = cleanMentorSource(b);
  if (!left || !right) return false;
  if (left.mentorId && right.mentorId && String(left.mentorId) === String(right.mentorId)) return true;
  return mentorGroupKey(left) === mentorGroupKey(right);
}

function isRoleAwareMockMentor(profile = {}) {
  return profile?.isMockMentor === true || /^mock_/.test(String(profile?.mentorId || ""));
}

function sourceDisclosureFor(mode) {
  if (mode === "verified_original") return "来源：该导师建议";
  if (mode === "mentorx_strategy") return "来源：MentorX 策略建议";
  return "来源：MentorX 按该导师背景整理";
}

function inferAttributionMode(item = {}, originalSource = null, displayedSource = null) {
  const explicit = normalizeText(item.attributionMode);
  if (isMentorXProfile(originalSource || {}) && displayedSource && !isMentorXProfile(displayedSource || {})) return "stitched_lens";
  if (["verified_original", "stitched_lens", "mentorx_strategy"].includes(explicit)) return explicit;
  if (isMentorXProfile(displayedSource || {})) return "mentorx_strategy";
  if (originalSource && displayedSource && sameMentorSource(originalSource, displayedSource)) return "verified_original";
  return "stitched_lens";
}

function roleProfileFromContext(context = {}) {
  try {
    const taxonomyProfile = buildRoleProfileFromContext(context);
    if (taxonomyProfile && taxonomyProfile.functionCluster) return taxonomyProfile;
  } catch {
    // Fall back to the local coarse classifier below for legacy payloads.
  }
  const roleEntry = findDictionaryRoleEntry(context) || {};
  const targetText = lowerText(roleContextText(context));
  const roleFamilyText = lowerText([
    roleEntry.role_family,
    roleEntry.roleFamily,
    roleEntry.family,
    roleEntry.canonical_role,
    roleEntry.position_title_original,
    context.internalAtsResult?.profile?.roleFamily,
    context.retrievalQuery?.roleFamily,
  ].filter(Boolean).join(" "));

  let functionCluster = "general";
  if (/account|audit|tax|bookkeep|cpa|ä¼šè®¡|æœƒè¨ˆ|å®¡è®¡|å¯©è¨ˆ|ç¨ŽåŠ¡|ç¨…å‹™/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "accounting";
  } else if (/finance|financial|fp&a|valuation|treasury|investment|bank|é‡‘èž|è´¢åŠ¡|è²¡å‹™/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "finance";
  } else if (/data engineer|data engineering|analytics engineer|etl|data platform|data pipeline|数据工程|資料工程/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "data";
  } else if (/software|developer|engineer|frontend|backend|fullstack|swe|sde|å¼€å‘|å·¥ç¨‹/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "software";
  } else if (/data|analytics|business analyst|sql|tableau|æ•°æ®|è³‡æ–™|åˆ†æž/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "data";
  } else if (/design|designer|ux|ui|portfolio|è®¾è®¡|è¨­è¨ˆ/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "design";
  } else if (/marketing|brand|growth|campaign|å¸‚åœº|ç‡ŸéŠ·|è¡ŒéŠ·/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "marketing";
  } else if (/operation|supply|logistics|procurement|è¿è¥|ç‡Ÿé‹/.test(`${targetText} ${roleFamilyText}`)) {
    functionCluster = "operations";
  }

  const clusterConfig = {
    accounting: {
      adjacentClusters: ["audit", "tax", "finance_operations", "compliance", "financial_reporting", "finance"],
      skillClusters: ["excel", "reconciliation", "month_end_close", "reporting", "compliance", "financial_reporting"],
      forbiddenDriftClusters: ["software", "design", "quant_trading", "investment_research"],
    },
    finance: {
      adjacentClusters: ["accounting", "audit", "finance_operations", "banking", "investment_research", "compliance"],
      skillClusters: ["financial_analysis", "excel", "reporting", "valuation", "forecasting"],
      forbiddenDriftClusters: ["software", "design"],
    },
    software: {
      adjacentClusters: ["data", "machine_learning", "product", "technical_depth"],
      skillClusters: ["programming", "api", "backend", "frontend", "deployment", "system_design"],
      forbiddenDriftClusters: ["accounting", "audit", "tax", "investment_research"],
    },
    machine_learning: {
      adjacentClusters: ["software", "data", "data_science", "ai_engineering", "technical_depth"],
      skillClusters: ["python", "machine_learning", "model_evaluation", "ml_deployment", "data", "experimentation"],
      forbiddenDriftClusters: ["accounting", "audit", "tax", "finance_operations", "investment_research", "compliance", "finance"],
    },
    data: {
      adjacentClusters: ["analytics", "data_engineering", "software", "cloud_infrastructure", "product"],
      skillClusters: ["sql", "python", "etl", "data_pipeline", "analytics", "cloud"],
      forbiddenDriftClusters: ["design", "accounting", "audit", "tax"],
    },
    design: {
      adjacentClusters: ["product", "portfolio", "marketing", "creative"],
      skillClusters: ["portfolio", "figma", "visual", "ux", "user_research"],
      forbiddenDriftClusters: ["accounting", "finance", "software_deep"],
    },
    marketing: {
      adjacentClusters: ["brand", "growth", "sales", "content", "business"],
      skillClusters: ["campaign", "seo", "content", "analytics", "stakeholder"],
      forbiddenDriftClusters: ["accounting", "software_deep"],
    },
    operations: {
      adjacentClusters: ["business", "supply_chain", "finance_operations", "compliance"],
      skillClusters: ["process", "reporting", "coordination", "excel", "operations"],
      forbiddenDriftClusters: ["software_deep", "investment_research"],
    },
    general: {
      adjacentClusters: ["business", "operations", "recruiting"],
      skillClusters: ["communication", "coordination", "reporting", "stakeholder"],
      forbiddenDriftClusters: [],
    },
  };
  const config = clusterConfig[functionCluster] || clusterConfig.general;
  return {
    targetRole: context.targetRole || context.internalAtsResult?.jobTitle || "",
    canonicalRole: roleEntry.canonical_role || roleEntry.role_id || roleEntry.position_title_original || "",
    roleFamily: roleEntry.role_family || context.internalAtsResult?.profile?.roleFamily || context.retrievalQuery?.roleFamily || functionCluster,
    functionCluster,
    adjacentClusters: config.adjacentClusters,
    skillClusters: config.skillClusters,
    forbiddenDriftClusters: config.forbiddenDriftClusters,
  };
}

function clustersForText(value = "") {
  const text = lowerText(value);
  const clusters = new Set();
  const add = (cluster, pattern) => {
    if (pattern.test(text)) clusters.add(cluster);
  };
  add("accounting", /account|accountant|accounting|bookkeep|è´¦|å¸³|ä¼šè®¡|æœƒè¨ˆ/);
  add("audit", /audit|auditor|å®¡è®¡|å¯©è¨ˆ/);
  add("tax", /tax|ç¨Ž|ç¨…/);
  add("financial_reporting", /financial reporting|reporting|statement|gaap|ifrs|æŠ¥è¡¨|å ±è¡¨/);
  add("finance_operations", /finance ops|financial operations|fp&a|treasury|budget|forecast|è´¢åŠ¡|è²¡å‹™/);
  add("finance", /finance|financial|bank|ubs|barclays|blackrock|goldman|jpmorgan|é‡‘èž|é“¶è¡Œ|éŠ€è¡Œ/);
  add("investment_research", /investment|portfolio|equity|asset management|valuation|æŠ•è³‡|æŠ•èµ„/);
  add("quant_trading", /quant|trading|trader|risk quant|é‡åŒ–|äº¤æ˜“/);
  add("compliance", /compliance|control|regulatory|risk management|åˆè§„|åˆè¦|å†…æŽ§|å…§æŽ§/);
  add("software", /software|developer|engineer|frontend|backend|fullstack|api|java|python|google|amazon|aws|meta|microsoft|openai|anyscale|å¼€å‘|å·¥ç¨‹/);
  add("data_engineering", /data engineer|data engineering|analytics engineer|etl|data pipeline|data platform|spark|airflow|dbt|snowflake|databricks|bigquery/);
  add("machine_learning", /machine learning|\bml\b|\bmle\b|deep learning|pytorch|tensorflow|model|llm|nlp|computer vision/);
  add("model_evaluation", /evaluation|accuracy|precision|recall|f1|auc|metric/);
  add("ml_deployment", /deployment|serving|pipeline|mlops|cloud|docker|api/);
  add("software_deep", /system design|architecture|distributed|deployment|kubernetes|microservice/);
  add("data", /data|analytics|sql|tableau|power bi|dashboard|æ•°æ®|è³‡æ–™|åˆ†æž/);
  add("design", /design|designer|ux|ui|figma|architecture designer|architect|è®¾è®¡|è¨­è¨ˆ/);
  add("portfolio", /portfolio|ä½œå“é›†/);
  add("marketing", /marketing|brand|growth|campaign|seo|content|å¸‚åœº|è¡Œé”€|ç‡ŸéŠ·/);
  add("operations", /operation|supply chain|logistics|procurement|è¿è¥|ç‡Ÿé‹/);
  add("business", /business|stakeholder|cross-functional|communication|collaboration|ä¸šåŠ¡|å•†æ¥­|åä½œ|å”ä½œ/);
  add("excel", /excel|spreadsheet|pivot|vlookup/);
  add("reconciliation", /reconciliation|reconcile|å¯¹è´¦|å°å¸³/);
  add("month_end_close", /month[-\s]?end|close process|ç»“è´¦|çµå¸³/);
  return [...clusters];
}

function inferMentorClusters(profile = {}) {
  const text = [
    profile.company,
    profile.mentorTitle,
    profile.mentorSubtitle,
    profile.mentorName,
    profile.careerPathDisplay,
    ...(profile.badges || []),
  ].filter(Boolean).join(" ");
  return clustersForText(text);
}

function inferAdviceSkillClusters(item = {}) {
  return clustersForText(adviceText(item));
}

function buildMentorPool(mentors = [], items = []) {
  const byKey = new Map();
  const add = (source = {}) => {
    const clean = cleanMentorSource(source);
    if (!clean) return;
    const key = mentorGroupKey(clean);
    if (!byKey.has(key)) {
      byKey.set(key, {
        ...clean,
        mentorRoleCluster: "",
        mentorSkillClusters: inferMentorClusters(source),
      });
    } else {
      const existing = byKey.get(key);
      existing.mentorSkillClusters = unique([...existing.mentorSkillClusters, ...inferMentorClusters(source)]);
      if (!existing.companyLogo && source.companyLogo) existing.companyLogo = source.companyLogo;
    }
  };
  asArray(mentors).forEach(add);
  asArray(items).forEach((item) => {
    add(item._mentor || {});
    add(item.mentorSource || {});
    add(item.originalMentorSource || {});
    add(item.displayedMentorSource || {});
  });
  add(MENTORX_SOURCE);
  return [...byKey.values()];
}

function roleAwareMockMentors(context = {}) {
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const family = roleProfile.canonicalRoleFamily || roleProfile.roleFamily || "";
  const functionCluster = roleProfile.functionCluster || "";
  const text = targetRoleText({ ...context, roleProfile });
  if (family === "cloud_infrastructure" || ["cloud_infrastructure", "network_operations", "it_operations"].includes(functionCluster) ||
    /network operator|network operations|noc\b|it infrastructure|network monitoring|网络运营|網絡運營|网络运维|網路/.test(text)) {
    return [
      {
        mentorId: "mock_cisco_network_ops",
        mentorName: "Cisco 网络运维视角",
        company: "Cisco",
        companyLogo: null,
        mentorTitle: "Network Operations Engineer",
        mentorSubtitle: "模拟大厂网络运维视角",
        badges: ["network operations", "NOC", "routing", "TCP/IP", "incident response"],
        isMockMentor: true,
      },
      {
        mentorId: "mock_microsoft_cloud_infra",
        mentorName: "Microsoft 云基础设施视角",
        company: "Microsoft",
        companyLogo: null,
        mentorTitle: "Cloud Infrastructure Engineer",
        mentorSubtitle: "模拟大厂基础设施视角",
        badges: ["cloud infrastructure", "network monitoring", "SRE", "incident response", "runbook"],
        isMockMentor: true,
      },
    ];
  }
  if (family === "logistics_operations" || /pickup support|logistics|dispatch|delivery operations|揽收|攬收|物流|配送/.test(text)) {
    return [
      {
        mentorId: "mock_amazon_logistics_ops",
        mentorName: "Amazon 运营视角",
        company: "Amazon",
        companyLogo: null,
        mentorTitle: "Logistics Operations Manager",
        mentorSubtitle: "模拟大厂运营视角",
        badges: ["logistics operations", "dispatch coordination", "delivery operations", "process improvement"],
        isMockMentor: true,
      },
      {
        mentorId: "mock_dhl_supply_chain_ops",
        mentorName: "DHL 供应链视角",
        company: "DHL",
        companyLogo: null,
        mentorTitle: "Supply Chain Operations Lead",
        mentorSubtitle: "模拟大厂供应链视角",
        badges: ["supply chain", "pickup coordination", "exception handling", "operations reporting"],
        isMockMentor: true,
      },
    ];
  }
  if (family === "accounting" || functionCluster === "accounting") {
    return [
      {
        mentorId: "mock_deloitte_accounting",
        mentorName: "Deloitte 会计视角",
        company: "Deloitte",
        companyLogo: null,
        mentorTitle: "Audit & Assurance Senior",
        mentorSubtitle: "模拟大厂审计会计视角",
        badges: ["accounting", "audit", "financial reporting", "reconciliation"],
        isMockMentor: true,
      },
      {
        mentorId: "mock_pwc_accounting",
        mentorName: "PwC 会计视角",
        company: "PwC",
        companyLogo: null,
        mentorTitle: "Accounting Advisory Associate",
        mentorSubtitle: "模拟大厂会计咨询视角",
        badges: ["accounting advisory", "month-end close", "compliance", "reporting"],
        isMockMentor: true,
      },
    ];
  }
  if (isFinanceTargetContext({ ...context, roleProfile })) {
    return [
      {
        mentorId: "mock_jpmorgan_ib",
        mentorName: "JPMorgan 投行视角",
        company: "JPMorgan",
        companyLogo: null,
        mentorTitle: "Investment Banking Associate",
        mentorSubtitle: "模拟大厂金融职能视角",
        badges: ["investment banking", "valuation", "financial modeling", "deal execution"],
        isMockMentor: true,
      },
      {
        mentorId: "mock_goldman_finance",
        mentorName: "Goldman Sachs 金融分析视角",
        company: "Goldman Sachs",
        companyLogo: null,
        mentorTitle: "Financial Analyst",
        mentorSubtitle: "模拟大厂金融分析视角",
        badges: ["financial analysis", "investment memo", "pitch deck", "transaction support"],
        isMockMentor: true,
      },
    ];
  }
  if (functionCluster === "marketing" || family === "marketing") {
    return [
      {
        mentorId: "mock_google_growth_marketing",
        mentorName: "Google 增长营销视角",
        company: "Google",
        companyLogo: null,
        mentorTitle: "Growth Marketing Manager",
        mentorSubtitle: "模拟大厂增长营销视角",
        badges: ["growth marketing", "campaign analytics", "CRM", "content strategy"],
        isMockMentor: true,
      },
      {
        mentorId: "mock_meta_brand_marketing",
        mentorName: "Meta 品牌营销视角",
        company: "Meta",
        companyLogo: null,
        mentorTitle: "Brand Marketing Manager",
        mentorSubtitle: "模拟大厂品牌营销视角",
        badges: ["brand marketing", "campaign", "audience insight", "cross-functional"],
        isMockMentor: true,
      },
    ];
  }
  if (functionCluster === "data" || family === "data_engineer" || family === "data_analyst" ||
    /data engineer|data engineering|analytics engineer|etl|data platform|data pipeline/.test(text)) {
    return [
      {
        mentorId: "mock_databricks_data_engineering",
        mentorName: "Databricks 数据工程视角",
        company: "Databricks",
        companyLogo: null,
        mentorTitle: "Data Engineer",
        mentorSubtitle: "模拟大厂数据工程视角",
        badges: ["data engineering", "Spark", "ETL", "data pipeline"],
        isMockMentor: true,
      },
      {
        mentorId: "mock_snowflake_data_platform",
        mentorName: "Snowflake 数据平台视角",
        company: "Snowflake",
        companyLogo: null,
        mentorTitle: "Data Platform Engineer",
        mentorSubtitle: "模拟大厂数据平台视角",
        badges: ["data platform", "SQL", "warehouse", "pipeline reliability"],
        isMockMentor: true,
      },
    ];
  }
  if (functionCluster === "machine_learning" || family === "machine_learning" || family === "ai_engineer") {
    return [
      {
        mentorId: "mock_google_ml",
        mentorName: "Google ML 工程视角",
        company: "Google",
        companyLogo: null,
        mentorTitle: "Machine Learning Engineer",
        mentorSubtitle: "模拟大厂机器学习视角",
        badges: ["machine learning", "model evaluation", "deployment", "python"],
        isMockMentor: true,
      },
      {
        mentorId: "mock_openai_ai",
        mentorName: "OpenAI AI 工程视角",
        company: "OpenAI",
        companyLogo: null,
        mentorTitle: "AI Engineer",
        mentorSubtitle: "模拟大厂 AI 工程视角",
        badges: ["AI engineering", "model deployment", "evaluation", "LLM"],
        isMockMentor: true,
      },
    ];
  }
  if (functionCluster === "software" || /software|developer|engineer|frontend|backend|fullstack/.test(text)) {
    return [
      {
        mentorId: "mock_google_swe",
        mentorName: "Google 工程视角",
        company: "Google",
        companyLogo: null,
        mentorTitle: "Software Engineer",
        mentorSubtitle: "模拟大厂软件工程视角",
        badges: ["software engineering", "backend", "system design", "deployment"],
        isMockMentor: true,
      },
      {
        mentorId: "mock_microsoft_swe",
        mentorName: "Microsoft 工程视角",
        company: "Microsoft",
        companyLogo: null,
        mentorTitle: "Software Engineer",
        mentorSubtitle: "模拟大厂软件工程视角",
        badges: ["software engineering", "cloud", "api", "production systems"],
        isMockMentor: true,
      },
    ];
  }
  if (functionCluster === "operations" || /operations|operation|coordinator|support|运营|營運/.test(text)) {
    return [
      {
        mentorId: "mock_amazon_ops",
        mentorName: "Amazon 运营视角",
        company: "Amazon",
        companyLogo: null,
        mentorTitle: "Operations Manager",
        mentorSubtitle: "模拟大厂运营视角",
        badges: ["operations", "process improvement", "stakeholder coordination", "reporting"],
        isMockMentor: true,
      },
      {
        mentorId: "mock_uber_ops",
        mentorName: "Uber 运营视角",
        company: "Uber",
        companyLogo: null,
        mentorTitle: "Operations Manager",
        mentorSubtitle: "模拟大厂运营视角",
        badges: ["market operations", "process", "metrics", "cross-functional"],
        isMockMentor: true,
      },
    ];
  }
  if (functionCluster === "business" || family === "business_analysis") {
    return [
      {
        mentorId: "mock_mckinsey_business",
        mentorName: "McKinsey 商业分析视角",
        company: "McKinsey",
        companyLogo: null,
        mentorTitle: "Business Analyst",
        mentorSubtitle: "模拟大厂商业分析视角",
        badges: ["business analysis", "stakeholder", "strategy", "problem solving"],
        isMockMentor: true,
      },
      {
        mentorId: "mock_accenture_business",
        mentorName: "Accenture 咨询交付视角",
        company: "Accenture",
        companyLogo: null,
        mentorTitle: "Business Consultant",
        mentorSubtitle: "模拟大厂咨询交付视角",
        badges: ["business consulting", "process", "delivery", "requirements"],
        isMockMentor: true,
      },
    ];
  }
  return [
    {
      mentorId: "mock_google_business_ops",
      mentorName: "Google 业务运营视角",
      company: "Google",
      companyLogo: null,
      mentorTitle: "Business Operations Manager",
      mentorSubtitle: "模拟大厂业务运营视角",
      badges: ["business operations", "stakeholder", "metrics", "process"],
      isMockMentor: true,
    },
    {
      mentorId: "mock_microsoft_program_ops",
      mentorName: "Microsoft 项目运营视角",
      company: "Microsoft",
      companyLogo: null,
      mentorTitle: "Program Manager",
      mentorSubtitle: "模拟大厂项目运营视角",
      badges: ["program management", "cross-functional", "delivery", "reporting"],
      isMockMentor: true,
    },
  ];
}

function problemLensAllowsMentor(item = {}, mentorClusters = []) {
  const clusters = new Set(mentorClusters);
  if (isMentorXProfile(item.mentorSource || {})) return true;
  if (/^marketing_/.test(item.coverageFamily || "")) return clusters.has("marketing") || clusters.has("business") || clusters.has("data");
  if (item.coverageFamily === "risk_explanation") return clusters.has("design") || clusters.has("operations") || clusters.has("business") || clusters.has("finance");
  if (item.coverageFamily === "cross_domain_transfer") return clusters.has("design") || clusters.has("business") || clusters.has("operations") || clusters.has("finance");
  if (item.coverageFamily === "readability_structure") return clusters.has("design") || clusters.has("business") || clusters.has("operations");
  if (item.coverageFamily === "impact_metrics") return clusters.has("finance") || clusters.has("data") || clusters.has("business") || clusters.has("operations");
  if (item.coverageFamily === "experience_evidence") return clusters.has("business") || clusters.has("operations") || clusters.has("data") || clusters.has("finance");
  return false;
}

function isWeakAdjacentCluster(cluster = "", roleProfile = {}) {
  const family = roleProfile.canonicalRoleFamily || roleProfile.roleFamily || "";
  if (["logistics_operations", "supply_chain_logistics", "marketing", "cloud_infrastructure"].includes(family) && ["data", "analytics", "business"].includes(cluster)) {
    return true;
  }
  if (family === "marketing" && cluster === "operations") return true;
  return false;
}

function scoreMentorDisplayFit(item = {}, mentor = {}, context = {}, originalSource = null) {
  if (isMentorXProfile(mentor)) {
    return {
      mentor,
      score: context.avoidMentorXDisplay ? 18 : 35,
      fit: "mentorx_strategy",
      reason: "No sufficiently explainable external mentor lens was found; MentorX strategy fallback is used.",
    };
  }
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const mentorClusters = inferMentorClusters(mentor);
  const adviceClusters = inferAdviceSkillClusters(item);
  const mentorClusterSet = new Set(mentorClusters);
  const adviceClusterSet = new Set(adviceClusters);
  let score = 0;
  let fit = "problem_lens";
  const reasons = [];

  if (mentorClusterSet.has(roleProfile.functionCluster)) {
    score += 35;
    fit = "direct";
    reasons.push("same function cluster");
  }
  const adjacentHits = roleProfile.adjacentClusters.filter((cluster) => mentorClusterSet.has(cluster));
  if (adjacentHits.length) {
    const strongAdjacentHits = adjacentHits.filter((cluster) => !isWeakAdjacentCluster(cluster, roleProfile));
    score += strongAdjacentHits.length ? 28 : 10;
    if (fit !== "direct" && strongAdjacentHits.length) fit = "adjacent";
    reasons.push(`adjacent cluster: ${adjacentHits[0]}`);
  }
  const skillHits = unique([
    ...roleProfile.skillClusters.filter((cluster) => mentorClusterSet.has(cluster)),
    ...adviceClusters.filter((cluster) => mentorClusterSet.has(cluster)),
  ]);
  if (skillHits.length) {
    score += Math.min(20, skillHits.length * 7);
    reasons.push(`skill cluster: ${skillHits[0]}`);
  }
  if (problemLensAllowsMentor(item, mentorClusters)) {
    score += 20;
    if (fit !== "direct" && fit !== "adjacent") fit = "problem_lens";
    reasons.push("problem lens fit");
  }
  if (/(ubs|barclays|blackrock|goldman|jpmorgan|bank|finance|financial)/i.test(`${mentor.company || ""} ${mentor.mentorTitle || ""}`)) {
    score += roleProfile.functionCluster === "accounting" || roleProfile.functionCluster === "finance" ? 10 : 0;
  }
  if (sameMentorSource(originalSource, mentor)) {
    score += 10;
    reasons.push("same original source");
  }

  const forbiddenHits = roleProfile.forbiddenDriftClusters.filter((cluster) => mentorClusterSet.has(cluster));
  if (forbiddenHits.length) {
    score -= 40;
    if (fit === "direct" || fit === "adjacent") fit = "problem_lens";
    reasons.push(`role drift: ${forbiddenHits[0]}`);
  }
  if (score < 30 && !problemLensAllowsMentor(item, mentorClusters)) {
    score -= 30;
    reasons.push("unexplainable mentor");
  }
  return {
    mentor,
    score,
    fit,
    reason: reasons.join("; ") || "general resume lens",
  };
}

function selectDisplayedMentorForAdvice(item = {}, mentorPool = [], context = {}, originalSource = null) {
  const candidates = asArray(mentorPool).length ? mentorPool : [originalSource, MENTORX_SOURCE].filter(Boolean);
  const explicitDisplayed = cleanMentorSource(item.displayedMentorSource);
  if (explicitDisplayed &&
    !isMentorXProfile(explicitDisplayed) &&
    !isUnexplainableExternalMentor(explicitDisplayed, context) &&
    !isRoleFamilyUnsafeDisplayedMentor(explicitDisplayed, item, context) &&
    !isWeakDataAnalyticsMentorForTarget(explicitDisplayed, item, context)) {
    const scored = scoreMentorDisplayFit(item, explicitDisplayed, context, originalSource);
    return {
      displayedMentorSource: explicitDisplayed,
      mentorDisplayFit: scored.fit,
      mentorFitReason: scored.reason,
      displayMentorScore: Math.round(scored.score),
    };
  }
  const cleanOriginal = cleanMentorSource(originalSource);
  if (shouldPreserveOriginalMentorSource(cleanOriginal, item, context)) {
    const originalScore = scoreMentorDisplayFit(item, cleanOriginal, context, originalSource);
    return {
      displayedMentorSource: cleanOriginal,
      mentorDisplayFit: originalScore.fit,
      mentorFitReason: originalScore.reason,
      displayMentorScore: Math.round(originalScore.score),
    };
  }
  const scored = candidates
    .map((mentor) => scoreMentorDisplayFit(item, mentor, context, originalSource))
    .sort((a, b) => b.score - a.score || (sameMentorSource(a.mentor, originalSource) ? -1 : 1));
  const viableRealExternal = scored.find((candidate) =>
    !isRoleAwareMockMentor(candidate.mentor) &&
    !isMentorXProfile(candidate.mentor) &&
    !isUnexplainableExternalMentor(candidate.mentor, context) &&
    !isRoleFamilyUnsafeDisplayedMentor(candidate.mentor, item, context) &&
    !isWeakDataAnalyticsMentorForTarget(candidate.mentor, item, context) &&
    candidate.score >= (context.avoidMentorXDisplay ? 25 : 35)
  );
  const viableExternal = viableRealExternal || scored.find((candidate) =>
    !isMentorXProfile(candidate.mentor) &&
    !isUnexplainableExternalMentor(candidate.mentor, context) &&
    !isRoleFamilyUnsafeDisplayedMentor(candidate.mentor, item, context) &&
    !isWeakDataAnalyticsMentorForTarget(candidate.mentor, item, context) &&
    candidate.score >= (context.avoidMentorXDisplay ? 25 : 35)
  );
  const best = viableExternal || scored[0];
  if (!best ||
    best.score < 35 ||
    isMentorXProfile(best.mentor) ||
    isUnexplainableExternalMentor(best.mentor, context) ||
    isRoleFamilyUnsafeDisplayedMentor(best.mentor, item, context) ||
    isWeakDataAnalyticsMentorForTarget(best.mentor, item, context)) {
    if (viableExternal) {
      return {
        displayedMentorSource: cleanMentorSource(viableExternal.mentor),
        mentorDisplayFit: viableExternal.fit,
        mentorFitReason: viableExternal.reason,
        displayMentorScore: Math.round(viableExternal.score),
      };
    }
    const fallbackMock = selectRoleAwareMockDisplayedMentor(item, context, mentorPool);
    if (fallbackMock) {
      return {
        displayedMentorSource: cleanMentorSource(fallbackMock.mentor),
        mentorDisplayFit: fallbackMock.fit || "mock_lens",
        mentorFitReason: fallbackMock.reason || "Role-aware mock mentor lens used because no suitable real mentor was available.",
        displayMentorScore: Math.round(fallbackMock.score || 25),
      };
    }
    return {
      displayedMentorSource: cleanMentorSource(MENTORX_SOURCE),
      mentorDisplayFit: "mentorx_strategy",
      mentorFitReason: "No sufficiently explainable external mentor lens was found.",
      displayMentorScore: best ? Math.round(best.score) : 0,
    };
  }
  return {
    displayedMentorSource: cleanMentorSource(best.mentor),
    mentorDisplayFit: best.fit,
    mentorFitReason: best.reason,
    displayMentorScore: Math.round(best.score),
  };
}

function selectRoleAwareMockDisplayedMentor(item = {}, context = {}, mentorPool = []) {
  const mockMentors = asArray(mentorPool).filter((mentor) => mentor.isMockMentor || /^mock_/.test(String(mentor.mentorId || "")));
  const candidates = mockMentors.length ? mockMentors : roleAwareMockMentors(context);
  const scored = candidates
    .map((mentor) => scoreMentorDisplayFit(item, mentor, context, item.originalMentorSource))
    .filter((candidate) =>
      !isUnexplainableExternalMentor(candidate.mentor, context) &&
      !isRoleFamilyUnsafeDisplayedMentor(candidate.mentor, item, context) &&
      !isWeakDataAnalyticsMentorForTarget(candidate.mentor, item, context)
    )
    .sort((a, b) => b.score - a.score);
  if (scored[0]) return scored[0];
  const fallback = candidates[deterministicIndex(adviceExactKey(item) || item.adviceId || item.title || "", candidates.length || 1)];
  return fallback ? {
    mentor: fallback,
    score: 25,
    fit: "mock_lens",
    reason: "Role-aware mock mentor lens used because no suitable real mentor was available.",
  } : null;
}

function isUnexplainableExternalMentor(mentor = {}, context = {}) {
  if (!mentor || isMentorXProfile(mentor)) return false;
  const family = context.roleProfile?.canonicalRoleFamily || context.internalAtsResult?.profile?.roleFamily || "";
  const text = lowerText([
    mentor.company,
    mentor.mentorTitle,
    mentor.mentorSubtitle,
    mentor.careerPathDisplay,
  ].filter(Boolean).join(" "));
  const hardwareFamilies = new Set(["hardware_electrical", "mechanical_engineering", "manufacturing_process", "industrial_quality", "civil_construction"]);
  if (/thermal engineer|process engineer|mechanical engineer|manufacturing engineer/.test(text) && !hardwareFamilies.has(family)) return true;
  if (/architecture designer|architectural designer/.test(text) && !["design_creative", "ux_research_design", "civil_construction"].includes(family)) return true;
  return false;
}

function targetRoleText(context = {}) {
  return lowerText([
    context.targetRole,
    context.internalAtsResult?.jobTitle,
    context.internalAtsResult?.profile?.targetRole,
    context.retrievalQuery?.targetRole,
    context.retrievalQuery?.roleFamily,
    context.roleProfile?.canonicalRole,
    context.roleProfile?.canonicalRoleFamily,
    context.roleProfile?.functionCluster,
  ].filter(Boolean).join(" "));
}

function mentorDescriptorText(mentor = {}) {
  return lowerText([
    mentor.company,
    mentor.mentorTitle,
    mentor.mentorSubtitle,
    mentor.careerPathDisplay,
    ...(mentor.badges || []),
  ].filter(Boolean).join(" "));
}

function isFinanceTargetContext(context = {}) {
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const family = roleProfile.canonicalRoleFamily || roleProfile.roleFamily || "";
  const functionCluster = roleProfile.functionCluster || "";
  const text = targetRoleText({ ...context, roleProfile });
  return ["finance", "accounting", "trading_quant"].includes(functionCluster) ||
    /finance|financial|investment|banking|asset management|private equity|valuation|accounting|accountant|audit|tax|会计|會計|金融|投資|投资|银行|銀行/.test(`${family} ${text}`);
}

function isNetworkInfraTargetContext(context = {}) {
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const family = roleProfile.canonicalRoleFamily || roleProfile.roleFamily || "";
  const functionCluster = roleProfile.functionCluster || "";
  const text = targetRoleText({ ...context, roleProfile });
  return ["cloud_infrastructure", "it_operations"].includes(family) ||
    ["cloud_infrastructure", "network_operations", "it_operations"].includes(functionCluster) ||
    /network operator|network operations|noc\b|it infrastructure|network monitoring|网络运营|網絡運營|网络运维|網路/.test(`${family} ${text}`);
}

function hasFinanceMentorSignal(mentor = {}) {
  return /ubs|barclays|blackrock|goldman|jpmorgan|morgan stanley|bank|finance|financial|investment|asset management|private equity|accounting|audit|tax/.test(mentorDescriptorText(mentor));
}

function hasNetworkInfraMentorSignal(mentor = {}) {
  return /network|noc\b|infrastructure|cloud|site reliability|sre\b|devops|systems engineer|it operations|security operations|telecom|routing|tcp\/ip/.test(mentorDescriptorText(mentor));
}

function hasTechnicalMentorSignal(mentor = {}) {
  return /software|engineer|developer|backend|frontend|fullstack|infrastructure|cloud|platform|systems|sre\b|devops|data engineer|data engineering|machine learning|ml engineer|ai engineer|technical|production technology/.test(mentorDescriptorText(mentor));
}

function isTechnicalTargetContext(context = {}) {
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const family = roleProfile.canonicalRoleFamily || roleProfile.roleFamily || "";
  const functionCluster = roleProfile.functionCluster || "";
  const text = targetRoleText({ ...context, roleProfile });
  return ["software", "machine_learning", "data", "cloud_infrastructure", "network_operations", "it_operations"].includes(functionCluster) ||
    /software|developer|engineer|backend|frontend|fullstack|data engineer|data engineering|machine learning|\bmle\b|ai engineer|network operator|infrastructure|production technology|技术|技術|工程/.test(`${family} ${text}`);
}

function isSpecializedTargetContext(context = {}) {
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const functionCluster = roleProfile.functionCluster || "";
  if (!functionCluster || ["general", "business"].includes(functionCluster)) return false;
  return true;
}

function isDataEngineeringTargetContext(context = {}) {
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const family = roleProfile.canonicalRoleFamily || roleProfile.roleFamily || "";
  const functionCluster = roleProfile.functionCluster || "";
  const text = targetRoleText({ ...context, roleProfile });
  return functionCluster === "data" && /data engineer|data engineering|analytics engineer|etl|data platform|data pipeline|数据工程|資料工程/.test(`${family} ${text}`);
}

function isDataOrAnalyticsMentor(mentor = {}) {
  return /data scientist|data analyst|data\s*&\s*financial analyst|analytics|business analytics|machine learning|ml engineer|ai engineer|data science/.test(mentorDescriptorText(mentor));
}

function isBroadDataScienceOrAnalystMentor(mentor = {}) {
  return /data scientist|lead data scientist|data analyst|data\s*&\s*financial analyst|business analytics/.test(mentorDescriptorText(mentor));
}

function hasFinanceAdviceSignal(item = {}) {
  return /financial model|financial modeling|valuation|dcf|deal|transaction|investment analysis|investment banking|asset management|private equity|pitch deck|investment memo|comparable compan|m&a|merger|acquisition|equity research|financial statement|financial reporting|portfolio|投行|投资|投資|估值|交易|并购|併購/.test(lowerText(adviceText(item)));
}

function hasStrictFinanceFunctionAdviceSignal(item = {}) {
  return /financial model|financial modeling|valuation|dcf|deal|transaction|investment analysis|pitch deck|investment memo|comparable compan|m&a|merger|acquisition|equity research|financial statement|financial reporting|portfolio analysis|portfolio construction|投行项目|金融建模|估值|交易执行|并购|併購/.test(lowerText(adviceText(item)));
}

function isBroadDataFinancialMentor(mentor = {}) {
  return /data\s*&\s*financial analyst|data and financial analyst|cbre/.test(mentorDescriptorText(mentor));
}

function isGenericExecutiveMentor(mentor = {}) {
  const text = mentorDescriptorText(mentor);
  if (!/\b(vp|vice president|founder|ceo|chief executive|director|general manager|president)\b/.test(text)) return false;
  if (hasFinanceMentorSignal(mentor) || hasTechnicalMentorSignal(mentor) || hasNetworkInfraMentorSignal(mentor)) return false;
  return !/software|engineer|engineering|data|analytics|machine learning|\bml\b|ai|finance|financial|investment|banking|marketing|growth|brand|operations|logistics|network|infrastructure|cloud|product/.test(text);
}

function isRoleFamilyUnsafeDisplayedMentor(mentor = {}, item = {}, context = {}) {
  if (!mentor || isMentorXProfile(mentor)) return false;
  if (isGenericExecutiveMentor(mentor) && isSpecializedTargetContext(context)) return true;
  if (isFinanceTargetContext(context) && !hasFinanceMentorSignal(mentor) && !isRoleAwareMockMentor(mentor)) return true;
  if (isTechnicalTargetContext(context) && isGenericExecutiveMentor(mentor) && !hasTechnicalMentorSignal(mentor) && !isRoleAwareMockMentor(mentor)) return true;
  if (isDataEngineeringTargetContext(context) && isBroadDataScienceOrAnalystMentor(mentor) && !/data engineer|data engineering|platform|cloud|backend|infrastructure/.test(mentorDescriptorText(mentor))) return true;
  if (!isDataOrAnalyticsMentor(mentor)) return false;
  if (isNetworkInfraTargetContext(context) && !hasNetworkInfraMentorSignal(mentor)) return true;
  if (isFinanceTargetContext(context) && isBroadDataFinancialMentor(mentor) && !hasStrictFinanceFunctionAdviceSignal(item)) return true;
  if (isFinanceTargetContext(context) && (!hasFinanceMentorSignal(mentor) || !hasFinanceAdviceSignal(item))) return true;
  return false;
}

function shouldPreserveOriginalMentorSource(mentor = {}, item = {}, context = {}) {
  if (!mentor || isMentorXProfile(mentor)) return false;
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const mentorClusters = inferMentorClusters(mentor);
  if (asArray(roleProfile.forbiddenDriftClusters).some((cluster) => mentorClusters.includes(cluster))) return false;
  if (isUnexplainableExternalMentor(mentor, context)) return false;
  if (isGenericExecutiveMentor(mentor) && isSpecializedTargetContext(context)) return false;
  if (isFinanceTargetContext(context) && !hasFinanceMentorSignal(mentor)) return false;
  if (isNetworkInfraTargetContext(context) && !hasNetworkInfraMentorSignal(mentor)) return false;
  if (isDataEngineeringTargetContext(context) && isBroadDataScienceOrAnalystMentor(mentor) && !/data engineer|data engineering|platform|cloud|backend|infrastructure/.test(mentorDescriptorText(mentor))) return false;
  if (isWeakDataAnalyticsMentorForTarget(mentor, item, context)) return false;
  return true;
}

function isWeakDataAnalyticsMentorForTarget(mentor = {}, item = {}, context = {}) {
  if (!mentor || isMentorXProfile(mentor)) return false;
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const family = roleProfile.canonicalRoleFamily || roleProfile.roleFamily || "";
  const functionCluster = roleProfile.functionCluster || "";
  const targetAllowsDataLens = [
    "data_analyst",
    "data_engineer",
    "data_scientist",
    "machine_learning",
    "ai_engineer",
    "trading_quant",
  ].includes(family) || ["data", "machine_learning", "quant_trading"].includes(functionCluster);
  if (targetAllowsDataLens) return false;

  const isDataMentor = isDataOrAnalyticsMentor(mentor);
  if (!isDataMentor) return false;

  const itemText = lowerText(adviceText(item));
  const hasStrongDataTooling = /\b(sql|tableau|power\s*bi|analytics?|data pipeline|python|r\b|model|experiment|a\/b test|ab test|google analytics|looker|grafana|wireshark|splunk|zabbix|nagios)\b/.test(itemText);
  const hasWeakOpsDataToolingOnly = /\b(dashboard|crm|tracking dashboard|operations report)\b/.test(itemText) && !hasStrongDataTooling;
  if (hasWeakOpsDataToolingOnly) return true;
  const hasExplicitDataTooling = hasStrongDataTooling;
  return !hasExplicitDataTooling;
}

function unique(items) {
  return [...new Set(asArray(items).filter(Boolean))];
}

let cachedRoleDirectionEntries = null;

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeRoleDirectionAlias(value) {
  return lowerText(value)
    .replace(/[^a-z0-9+#.\s/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function loadRoleDictionaryRoles() {
  try {
    return require("../public/ats_role_dictionary.json").roles || [];
  } catch {
    try {
      return require("../data/ats/ats_role_dictionary.json").roles || [];
    } catch {
      return [];
    }
  }
}

function roleAliasesFor(role = {}) {
  const aliases = [
    role.canonical_role,
    role.position_title_original,
    ...(role.target_role_aliases || []),
  ].filter(Boolean);
  const normalized = unique(aliases.map(normalizeRoleDirectionAlias))
    .filter((alias) => alias.length >= 3 && !/^(role|position|job|intern|business|finance|data|design|marketing)$/.test(alias));
  const acronyms = [];
  for (const alias of normalized) {
    const words = alias.split(/\s+/).filter((word) => /^[a-z][a-z0-9+#.-]*$/.test(word));
    if (words.length >= 2 && words.length <= 4) {
      const acronym = words.map((word) => word[0]).join("");
      if (acronym.length >= 2 && acronym.length <= 4) acronyms.push(acronym);
    }
  }
  return unique([...normalized, ...acronyms]);
}

function getRoleDirectionEntries() {
  if (cachedRoleDirectionEntries) return cachedRoleDirectionEntries;
  cachedRoleDirectionEntries = loadRoleDictionaryRoles()
    .map((role) => ({
      role,
      roleId: role.role_id || role.canonical_role || role.position_title_original,
      aliases: roleAliasesFor(role),
    }))
    .filter((entry) => entry.aliases.length)
    .map((entry) => ({
      ...entry,
      directionPatterns: entry.aliases.map((alias) => {
        const escaped = escapeRegExp(alias).replace(/\s+/g, "\\s+");
        return new RegExp(`\\b${escaped}\\b\\s*(?:å²—ä½|å²—|æ–¹å‘|èŒä½|è·ä½|role|roles|position|positions|track|direction|job|jobs|jd)s?`, "ig");
      }),
    }))
    .sort((a, b) => Math.max(...b.aliases.map((x) => x.length)) - Math.max(...a.aliases.map((x) => x.length)));
  return cachedRoleDirectionEntries;
}

function findDictionaryRoleEntry(context = {}) {
  const target = [
    context.targetRole,
    context.internalAtsResult?.jobTitle,
    context.internalAtsResult?.profile?.targetRole,
    context.retrievalQuery?.targetRole,
  ].filter(Boolean).join(" ");
  const jdText = [
    context.internalAtsResult?.jdText,
    context.retrievalQuery?.queryText,
  ].filter(Boolean).join(" ");
  try {
    const { findRoleDictionaryEntry } = require("../src/ats/role-dictionary");
    return findRoleDictionaryEntry(target, jdText);
  } catch {
    const targetText = normalizeRoleDirectionAlias(`${target} ${jdText}`).slice(0, 5000);
    let best = null;
    let bestScore = 0;
    for (const entry of getRoleDirectionEntries()) {
      let score = 0;
      for (const alias of entry.aliases) {
        if (targetText.includes(alias)) score += 8 + alias.split(/\s+/).length;
      }
      if (score > bestScore) {
        best = entry.role;
        bestScore = score;
      }
    }
    return bestScore >= 3 ? best : null;
  }
}

function adviceText(item = {}) {
  return [
    item.title,
    item.currentDiagnosis,
    item.problemSummary,
    item.action,
    item.actionSummary,
    item.mentorInsight,
    item.mentorLens,
    item.reason,
    item.topicCluster,
    item.displayAdviceType,
    item.canonicalActionFamily,
    item.targetSection,
    ...asArray(item.relatedProblemTags),
  ].filter(Boolean).join(" ");
}
function priorityRank(value) {
  const text = lowerText(value);
  if (text === "critical" || text === "high" || text === "p0" || text.includes("å¿…")) return 0;
  if (text === "medium" || text === "mid" || text === "p1" || text.includes("å»ºè®®")) return 1;
  return 2;
}

function severityRank(value) {
  const text = lowerText(value);
  if (text === "critical") return 0;
  if (text === "high") return 1;
  if (text === "medium") return 2;
  if (text === "low") return 3;
  return 4;
}

function hasProblemTag(context = {}, pattern) {
  return asArray(context.problemTags).some((item) => pattern.test(item.tag || item));
}

function isKeywordCritical(context = {}) {
  return asArray(context.problemTags).some((item) =>
    /keyword|hard_skill|priority/.test(item.tag || item) &&
    ["critical", "high"].includes(item.severity)
  );
}

function targetRoleAllowsFinance(context = {}) {
  const text = [
    context.targetRole,
    context.internalAtsResult?.jobTitle,
    context.internalAtsResult?.profile?.targetRole,
    context.internalAtsResult?.profile?.roleFamily,
    context.internalAtsResult?.jdText,
    context.retrievalQuery?.queryText,
    context.retrievalQuery?.targetRole,
    context.retrievalQuery?.roleFamily,
  ].filter(Boolean).join(" ");
  return /finance|financial|quant|trading|investment|bank|fintech|risk|portfolio|asset|equity|é‡‘èž|é‡åŒ–|æŠ•è³‡|æŠ•èµ„|é“¶è¡Œ/i.test(text);
}

function targetRoleAllowsRiskOrFinanceDirection(context = {}) {
  const text = [
    context.targetRole,
    context.internalAtsResult?.jobTitle,
    context.internalAtsResult?.profile?.targetRole,
    context.internalAtsResult?.profile?.roleFamily,
    context.retrievalQuery?.targetRole,
    context.retrievalQuery?.roleFamily,
  ].filter(Boolean).join(" ");
  return /finance|financial|quant|trading|investment|bank|fintech|risk|portfolio|asset|equity|é‡‘èž|é‡åŒ–|æŠ•è³‡|æŠ•èµ„|é“¶è¡Œ|é£ŽæŽ§|é¢¨æŽ§/i.test(text);
}

const ROLE_DIRECTION_GUARDS = [
  {
    family: "finance",
    allow: /finance|financial|quant|trading|investment|bank|fintech|risk|portfolio|asset|equity|wealth|é‡‘èž|é‡åŒ–|æŠ•è³‡|æŠ•èµ„|é“¶è¡Œ|é¢¨æŽ§|é£ŽæŽ§/i,
    replacements: [
      [/é’ˆå¯¹\s*risk\s*(?:å’Œ|\/|&|ã€|and)\s*finance\s*æ–¹å‘/ig, "é’ˆå¯¹_TARGET_æ–¹å‘"],
      [/risk\s*(?:å’Œ|\/|&|ã€|and)\s*finance\s*æ–¹å‘/ig, "_TARGET_æ–¹å‘"],
      [/(?:ç›®æ ‡)?(?:é‡‘èž|é‡åŒ–|æŠ•è¡Œ|æŠ•èµ„|æŠ•è³‡|é“¶è¡Œ|é¢¨æŽ§|é£ŽæŽ§)(?:ç›¸å…³)?(?:å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD|åœºæ™¯|ææ–™)/g, "_TARGET_æ–¹å‘"],
      [/(?:finance|financial|quant|risk|investment banking|banking|portfolio|asset management)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "accounting",
    allow: /accounting|accountant|audit|tax|cpa|bookkeep|ä¼šè®¡|æœƒè¨ˆ|å®¡è®¡|å¯©è¨ˆ|ç¨ŽåŠ¡|ç¨…å‹™|è´¢åŠ¡æŠ¥è¡¨|è²¡å‹™å ±è¡¨/i,
    replacements: [
      [/(?:ä¼šè®¡|æœƒè¨ˆ|å®¡è®¡|å¯©è¨ˆ|ç¨ŽåŠ¡|ç¨…å‹™|è´¢åŠ¡æŠ¥è¡¨|è²¡å‹™å ±è¡¨)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:accounting|accountant|audit|tax|cpa|bookkeeping)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "data",
    allow: /data analyst|business analyst|data science|data scientist|analytics|bi\b|sql|tableau|power\s*bi|æ•°æ®|æ•¸æ“š|è³‡æ–™|åˆ†æžå¸ˆ|åˆ†æžå¸«|å•†ä¸šåˆ†æž|å•†æ¥­åˆ†æž|æ•°æ®ç§‘å­¦|è³‡æ–™ç§‘å­¸/i,
    replacements: [
      [/\b(?:DA|BA)\s*(?:å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/ig, "_TARGET_æ–¹å‘"],
      [/(?:æ•°æ®åˆ†æž|æ•¸æ“šåˆ†æž|è³‡æ–™åˆ†æž|å•†ä¸šåˆ†æž|å•†æ¥­åˆ†æž|æ•°æ®ç§‘å­¦|è³‡æ–™ç§‘å­¸)(?:å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:data analyst|business analyst|data science|data scientist|analytics)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "software",
    allow: /software|swe|sde|developer|engineer|frontend|backend|full[-\s]?stack|java|python|api|å·¥ç¨‹|å¼€å‘|é–‹ç™¼|ç¨‹åº|ç¨‹å¼|è½¯ä»¶|è»Ÿé«”/i,
    replacements: [
      [/(?:è½¯ä»¶|è»Ÿé«”|å¼€å‘|é–‹ç™¼|å·¥ç¨‹å¸ˆ|å·¥ç¨‹å¸«)(?:å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:software engineer|swe|sde|developer|frontend|backend|full[-\s]?stack)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "marketing",
    allow: /marketing|brand|growth|content|campaign|seo|social media|å¸‚åœº|å¸‚å ´|è¥é”€|è¡ŒéŠ·|å“ç‰Œ|å¢žé•¿|å¢žé•·|å†…å®¹|å…§å®¹|æŠ•æ”¾/i,
    replacements: [
      [/(?:Marketing|å¸‚åœº|å¸‚å ´|è¥é”€|è¡ŒéŠ·|å“ç‰Œ|å¢žé•¿|å¢žé•·|å†…å®¹|å…§å®¹)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:marketing|brand|growth|content|campaign|seo|social media)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "design",
    allow: /design|designer|ux|ui|product design|portfolio|figma|visual|è®¾è®¡|è¨­è¨ˆ|ä½œå“é›†|äº¤äº’|è§†è§‰|è¦–è¦º/i,
    replacements: [
      [/(?:è®¾è®¡|è¨­è¨ˆ|UX|UI|è§†è§‰|è¦–è¦º)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:design|designer|ux|ui|product design|visual design)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "product",
    allow: /product manager|\bpm\b|product owner|äº§å“|ç”¢å“|äº§å“ç»ç†|ç”¢å“ç¶“ç†/i,
    replacements: [
      [/(?:äº§å“|ç”¢å“|äº§å“ç»ç†|ç”¢å“ç¶“ç†)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:product manager|product owner|pm)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "legal",
    allow: /legal|law|paralegal|attorney|å¾‹å¸ˆ|å¾‹å¸«|æ³•å¾‹|æ³•åŠ¡|æ³•å‹™/i,
    replacements: [
      [/(?:æ³•å¾‹|æ³•åŠ¡|æ³•å‹™|å¾‹å¸ˆ|å¾‹å¸«)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:legal|law|paralegal|attorney)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
  {
    family: "operations",
    allow: /operations|supply chain|logistics|procurement|è¿è¥|ç‡Ÿé‹|ä¾›åº”é“¾|ä¾›æ‡‰éˆ|ç‰©æµ|é‡‡è´­|æŽ¡è³¼/i,
    replacements: [
      [/(?:è¿è¥|ç‡Ÿé‹|ä¾›åº”é“¾|ä¾›æ‡‰éˆ|ç‰©æµ|é‡‡è´­|æŽ¡è³¼)(?:å²—|å²—ä½|æ–¹å‘|èŒä½|è·ä½|JD)/g, "_TARGET_æ–¹å‘"],
      [/(?:operations|supply chain|logistics|procurement)\s*(?:role|roles|position|positions|track|direction|jobs?|jd)s?/ig, "_TARGET_ direction"],
    ],
  },
];

function roleContextText(context = {}) {
  return [
    context.targetRole,
    context.internalAtsResult?.jobTitle,
    context.internalAtsResult?.profile?.targetRole,
    context.internalAtsResult?.profile?.roleFamily,
    context.internalAtsResult?.jdText,
    context.retrievalQuery?.queryText,
    context.retrievalQuery?.targetRole,
    context.retrievalQuery?.roleFamily,
  ].filter(Boolean).join(" ");
}

function targetRoleSupportsFamily(context = {}, spec = {}) {
  return spec.allow.test(roleContextText(context));
}

function supportedDictionaryRoleIds(context = {}) {
  const targetRole = findDictionaryRoleEntry(context);
  if (!targetRole) return new Set();
  const targetAliases = new Set(roleAliasesFor(targetRole));
  const ids = new Set([targetRole.role_id || targetRole.canonical_role || targetRole.position_title_original]);
  for (const entry of getRoleDirectionEntries()) {
    if (entry.roleId === (targetRole.role_id || targetRole.canonical_role || targetRole.position_title_original)) {
      ids.add(entry.roleId);
      continue;
    }
    if (entry.aliases.some((alias) => targetAliases.has(alias))) ids.add(entry.roleId);
  }
  return ids;
}

function roleDirectionReplacement(match, target) {
  return /å²—ä½|å²—|æ–¹å‘|èŒä½|è·ä½/.test(match) ? `${target}æ–¹å‘` : `${target} direction`;
}

function sanitizeDictionaryRoleDirections(text, context = {}, target = "ç›®æ ‡å²—ä½") {
  const supportedIds = supportedDictionaryRoleIds(context);
  if (!supportedIds.size) return text;

  let output = text;
  for (const entry of getRoleDirectionEntries()) {
    if (supportedIds.has(entry.roleId)) continue;
    for (const pattern of entry.directionPatterns) {
      output = output.replace(pattern, (match) => roleDirectionReplacement(match, target));
    }
  }
  return output;
}

function sanitizeUnsupportedRoleDirections(text, context = {}, target = "ç›®æ ‡å²—ä½") {
  let output = sanitizeDictionaryRoleDirections(text, context, target);
  for (const spec of ROLE_DIRECTION_GUARDS) {
    if (targetRoleSupportsFamily(context, spec)) continue;
    for (const [pattern, replacement] of spec.replacements) {
      output = output.replace(pattern, replacement.replace(/_TARGET_/g, target));
    }
  }
  return output;
}

function sanitizeRoleMixedText(value, context = {}) {
  const text = normalizeText(value);
  if (!text) return text;
  const target = normalizeText(context.targetRole || context.internalAtsResult?.jobTitle || "ç›®æ ‡å²—ä½");
  let output = sanitizeUnsupportedRoleDirections(text, context, target);
  if (!targetRoleAllowsRiskOrFinanceDirection(context)) {
    output = output
      .replace(/é’ˆå¯¹\s*risk\s*(?:å’Œ|\/|&|ã€)\s*finance\s*æ–¹å‘/ig, `é’ˆå¯¹ ${target} æ–¹å‘`)
      .replace(/risk\s*(?:å’Œ|\/|&|ã€)\s*finance\s*æ–¹å‘/ig, `${target} æ–¹å‘`)
      .replace(/risk\s*æ–¹å‘/ig, `${target} æ–¹å‘`)
      .replace(/é£ŽæŽ§æ–¹å‘/g, `${target} æ–¹å‘`)
      .replace(/é¢¨æŽ§æ–¹å‘/g, `${target} æ–¹å‘`);
  }
  if (targetRoleAllowsFinance(context)) return output;
  if (!/software|swe|sde|developer|engineer|å·¥ç¨‹|å¼€å‘/i.test(target)) return output;
  return output
    .replace(/ç›®æ ‡é‡‘èžå²—ä½/g, `ç›®æ ‡ ${target} å²—ä½`)
    .replace(/é‡‘èžå²—ä½/g, `${target} å²—ä½`)
    .replace(/é‡‘èžç›¸å…³ææ–™/g, "ç›¸å…³ææ–™")
    .replace(/é‡‘èžåœºæ™¯/g, "ä¸šåŠ¡åœºæ™¯");
}

function evidenceMatchesCoverage(evidence = [], coverageFamily = "") {
  const text = lowerText(asArray(evidence).join(" "));
  if (!text) return false;
  const exactDefaults = new Map([
    ["keyword", defaultEvidenceForCoverage("keyword", "skills").join(" ")],
    ["positioning", defaultEvidenceForCoverage("positioning").join(" ")],
    ["experience_evidence", defaultEvidenceForCoverage("experience_evidence").join(" ")],
    ["impact_metrics", defaultEvidenceForCoverage("impact_metrics").join(" ")],
    ["risk_explanation", defaultEvidenceForCoverage("risk_explanation").join(" ")],
    ["junior_signal", defaultEvidenceForCoverage("junior_signal").join(" ")],
  ]);
  for (const [family, defaultText] of exactDefaults.entries()) {
    if (family !== coverageFamily && text === lowerText(defaultText)) return false;
  }
  if (coverageFamily !== "risk_explanation" && /ç¨³å®šæ€§é£Žé™©|ç»åŽ†æ€§è´¨|é¡¹ç›®è¾¹ç•Œ|short tenure|internship period/i.test(text)) return false;
  if (coverageFamily !== "experience_evidence" && /æŽ¨è¿›åŠ¨ä½œ|äº¤ä»˜ç‰©|collaboration delivery/i.test(text)) return false;
  if (coverageFamily === "keyword") return /keyword|jd|ats|å…³é”®è¯|åŒ¹é…|æŠ€èƒ½/.test(text);
  if (coverageFamily === "marketing_campaign_context") return /marketing|campaign|audience|channel|crm|ga4|hubspot|klaviyo|meta ads|工具|渠道|场景/.test(text);
  if (coverageFamily === "marketing_growth_metrics") return /ctr|cvr|roas|cac|retention|open rate|engagement|conversion|metric|growth|业务目标|增长|指标/.test(text);
  if (coverageFamily === "positioning") return /position|summary|target|å²—ä½|å®šä½|å¼€å¤´|ä¸»çº¿/.test(text);
  if (coverageFamily === "experience_evidence") return /experience|bullet|project|collaboration|ç»åŽ†|é¡¹ç›®|è¯æ®|åä½œ|äº¤ä»˜/.test(text);
  if (coverageFamily === "impact_metrics") return /impact|metric|result|quant|æˆæžœ|é‡åŒ–|ç»“æžœ|è§„æ¨¡|æ•ˆçŽ‡/.test(text);
  if (coverageFamily === "risk_explanation") return /risk|short|intern|tenure|çŸ­æœŸ|å®žä¹ |å‘¨æœŸ|è¾¹ç•Œ|é£Žé™©/.test(text);
  if (coverageFamily === "junior_signal") return /education|course|certificate|æ•™è‚²|è¯¾ç¨‹|è¯ä¹¦|è®­ç»ƒ/.test(text);
  return true;
}

function defaultEvidenceForCoverage(coverageFamily = "", targetSection = "") {
  if (coverageFamily === "keyword") return ["JD 关键词", "ATS 匹配", targetSection === "skills" ? "Skills 排序" : "经历证据"];
  if (coverageFamily === "marketing_campaign_context") return ["Marketing 工具", "audience/channel", "campaign 场景"];
  if (coverageFamily === "marketing_growth_metrics") return ["CTR/CVR/ROAS", "业务目标", "增长结果"];
  if (coverageFamily === "positioning") return ["岗位定位", "开头主线", "目标岗位"];
  if (coverageFamily === "experience_evidence") return ["经历证据", "推进动作", "交付物"];
  if (coverageFamily === "impact_metrics") return ["量化结果", "成果表达", "影响规模"];
  if (coverageFamily === "risk_explanation") return ["经历性质", "项目边界", "稳定性风险"];
  if (coverageFamily === "junior_signal") return ["课程/证书", "教育训练", "岗位能力证据"];
  if (coverageFamily === "cross_domain_transfer") return ["可迁移能力", "跨领域表达", "目标岗位语言"];
  return [];
}

function inferActionFamily(item = {}) {
  const native = normalizeText(item.actionFamily || item.canonicalActionFamily);
  const allText = lowerText(adviceText(item));
  const tagTextForAction = lowerText(asArray(item.relatedProblemTags).join(" "));
  if (/marketing_metric_gap|marketing_business_goal_gap/.test(tagTextForAction)) return "marketing_growth_metrics";
  if (/marketing_tool_gap|marketing_audience_channel_gap|marketing_experience_keyword_gap/.test(tagTextForAction)) return "marketing_campaign_context";
  if (native) {
    if (/short tenure|internship|intern|contract|gap|çŸ­æœŸ|å®žä¹ |å¯¦ç¿’|é¡¹ç›®å‘¨æœŸ|é …ç›®é€±æœŸ|æ—¶é•¿|æ™‚é•·|ç¨³å®šæ€§é£Žé™©|ç©©å®šæ€§é¢¨éšª/.test(allText)) {
      return "risk_explanation";
    }
    if (/education|coursework|gpa|certificate|è¯¾ç¨‹|èª²ç¨‹|è¯ä¹¦|è­‰æ›¸|æ•™è‚²/.test(allText)) {
      return "education_signal";
    }
    if (/impact metrics|metric|quantif|measurable|æˆæžœé‡åŒ–|é‡åŒ–|æ•°å­—|æ•¸å­—|ä¸šåŠ¡ä»·å€¼|æ¥­å‹™åƒ¹å€¼/.test(allText)) {
      return "impact_metrics";
    }
    return native;
  }
  const visibleText = lowerText([
    item.title,
    item.currentDiagnosis,
    item.problemSummary,
    item.action,
    item.actionSummary,
    item.mentorInsight,
    item.mentorLens,
    item.reason,
    item.topicCluster,
    item.displayAdviceType,
    item.targetSection,
  ].filter(Boolean).join(" "));
  const tagText = lowerText(asArray(item.relatedProblemTags).join(" "));
  if (/weak_experience_keyword_evidence/.test(tagText) && !/keyword|jd|ats|hard skill|å…³é”®è¯|æŠ€èƒ½è¯/.test(visibleText)) {
    return "experience_evidence";
  }
  const text = allText;
  if (/missing_summary|add\s+(?:a\s+)?summary|æ–°å¢ž.*summary|è¡¥.*summary/.test(text)) return "summary_creation";
  if (/summary|headline|target role|job title|å²—ä½åŽŸè¯|å®šä½|å¼€å¤´/.test(text)) return "summary_positioning";
  if (/keyword|jd|ats|hard skill|å…³é”®è¯|æŠ€èƒ½è¯/.test(text) && /experience|bullet|ç»åŽ†|é¡¹ç›®/.test(text)) return "keyword_in_experience";
  if (/keyword|jd|ats|hard skill|å…³é”®è¯|æŠ€èƒ½è¯/.test(text) && /skills?|æŠ€èƒ½åŒº|æŠ€èƒ½æ /.test(text)) return "skills_keyword_ordering";
  if (/keyword|jd|ats|hard skill|å…³é”®è¯|æŠ€èƒ½è¯/.test(text)) return "jd_keyword_alignment";
  if (/short tenure|internship|intern|contract|gap|çŸ­æœŸ|å®žä¹ |é¡¹ç›®å‘¨æœŸ|æ—¶é•¿/.test(text)) return "risk_explanation";
  if (/education|coursework|gpa|certificate|è¯¾ç¨‹|è¯ä¹¦|æ•™è‚²/.test(text)) return "education_signal";
  if (/impact|metric|quantif|result|æˆæžœ|é‡åŒ–|æ•°å­—|ä¸šåŠ¡ä»·å€¼/.test(text)) return "impact_metrics";
  if (/system design|architecture|deployment|engineering|æŠ€æœ¯æ·±åº¦|ç³»ç»Ÿ|æž¶æž„|éƒ¨ç½²|å·¥ç¨‹åŒ–/.test(text)) return "technical_depth";
  if (/cross[-\s]?domain|transferable|reframing|è·¨é¢†åŸŸ|è¿ç§»|è½¬åŒ–/.test(text)) return "cross_domain_reframing";
  if (/section|format|readability|layout|æŽ’åº|ç‰ˆé¢|å¯è¯»|æ ¼å¼/.test(text)) return "section_relevance_order";
  if (/experience|bullet|project|evidence|ç»åŽ†|é¡¹ç›®|è¯æ®/.test(text)) return "experience_evidence";
  return "general_resume_edit";
}

function inferTargetSection(item = {}) {
  const native = lowerText(item.targetSection);
  if (native) return native;
  const text = lowerText(adviceText(item));
  if (/summary|headline|å¼€å¤´|ç®€ä»‹/.test(text)) return "summary";
  if (/skills?|æŠ€èƒ½/.test(text)) return "skills";
  if (/education|coursework|gpa|certificate|è¯¾ç¨‹|è¯ä¹¦|æ•™è‚²/.test(text)) return "education";
  if (/project|portfolio|github|é¡¹ç›®|ä½œå“/.test(text)) return "projects";
  if (/experience|bullet|ç»åŽ†|å·¥ä½œ/.test(text)) return "experience";
  return "overall";
}

function inferCoverageFamily(item = {}) {
  const actionFamily = inferActionFamily(item);
  const text = lowerText(adviceText(item));
  const tags = asArray(item.relatedProblemTags).join(" ");
  const combined = `${text} ${tags}`.toLowerCase();
  if (actionFamily === "marketing_growth_metrics" || /marketing_metric_gap|marketing_business_goal_gap/.test(combined)) return "marketing_growth_metrics";
  if (actionFamily === "marketing_campaign_context" || /marketing_tool_gap|marketing_audience_channel_gap|marketing_experience_keyword_gap/.test(combined)) return "marketing_campaign_context";
  if (["jd_keyword_alignment", "keyword_in_experience", "skills_keyword_ordering"].includes(actionFamily)) return "keyword";
  if (["summary_creation", "summary_positioning"].includes(actionFamily)) return "positioning";
  if (actionFamily === "impact_metrics") return "impact_metrics";
  if (actionFamily === "technical_depth") return "technical_depth";
  if (actionFamily === "cross_domain_reframing") return "cross_domain_transfer";
  if (actionFamily === "education_signal") return "junior_signal";
  if (actionFamily === "risk_explanation") return "risk_explanation";
  if (actionFamily === "section_relevance_order") return "readability_structure";
  if (actionFamily === "experience_evidence") return "experience_evidence";
  if (/short|tenure|intern|gap|contract|risk|çŸ­æœŸ|å®žä¹ |å‘¨æœŸ|è¾¹ç•Œ|ç¨³å®š/.test(combined)) return "risk_explanation";
  if (/education|coursework|gpa|certificate|è¯¾ç¨‹|è¯ä¹¦|æ•™è‚²/.test(combined)) return "junior_signal";
  if (/cross|transfer|refram|china|market|è·¨é¢†åŸŸ|è¿ç§»|è½¬åŒ–|éžå…¸åž‹/.test(combined)) return "cross_domain_transfer";
  if (/system design|architecture|deployment|technical_depth|å·¥ç¨‹åŒ–|ç³»ç»Ÿ|æž¶æž„|éƒ¨ç½²|æŠ€æœ¯æ·±åº¦/.test(combined)) return "technical_depth";
  if (/finance|financial|quant|business|stakeholder|data|analytics|ä¸šåŠ¡|é‡‘èž|æ•°æ®|å•†ä¸š/.test(combined)) {
    if (!/keyword|ats|jd/.test(combined) || /business|data|finance|ä¸šåŠ¡|é‡‘èž|æ•°æ®/.test(combined)) return "business_data_context";
  }
  if (/impact|metric|quantif|measurable|result|æˆæžœ|é‡åŒ–|æ•°å­—|ä»·å€¼/.test(combined) || actionFamily === "impact_metrics") return "impact_metrics";
  if (/experience|bullet|project|evidence|ç»åŽ†|é¡¹ç›®|è¯æ®/.test(combined) || actionFamily === "experience_evidence") return "experience_evidence";
  if (/keyword|jd|ats|hard_skill|priority_keyword|å…³é”®è¯|æŠ€èƒ½è¯/.test(combined)) return "keyword";
  if (/summary|headline|target role|job title|position|å®šä½|å²—ä½|å¼€å¤´/.test(combined)) return "positioning";
  if (/section|format|readability|layout|ç‰ˆé¢|å¯è¯»|æ ¼å¼|æŽ’åº/.test(combined)) return "readability_structure";
  return "experience_evidence";
}

function inferActionSlot(item = {}) {
  const family = inferActionFamily(item);
  const coverage = inferCoverageFamily(item);
  const section = inferTargetSection(item);
  const text = lowerText(adviceText(item));
  if (family === "summary_creation") return "summary_creation";
  if (section === "summary" && /target|job title|exact|åŽŸè¯|å²—ä½/.test(text)) return "summary_target_role";
  if (section === "summary") return "summary_positioning";
  if (coverage === "keyword" && section === "experience") return "keyword_in_experience";
  if (coverage === "keyword" && section === "skills") return "skills_keyword_ordering";
  if (coverage === "keyword") return "keyword_placement";
  if (coverage === "marketing_campaign_context") return "marketing_campaign_context";
  if (coverage === "marketing_growth_metrics") return "marketing_growth_metrics";
  if (coverage === "impact_metrics") return "experience_impact_metrics";
  if (coverage === "risk_explanation") return "short_tenure_explanation";
  if (coverage === "junior_signal") return "education_coursework_signal";
  if (coverage === "readability_structure") return "section_weighting";
  if (coverage === "cross_domain_transfer") return "cross_domain_reframing";
  if (coverage === "technical_depth") return "technical_project_depth";
  if (coverage === "business_data_context") return "business_data_context";
  return "experience_bullet_evidence";
}

function buildDuplicateGroupKey(item = {}) {
  return `${item.coverageFamily || inferCoverageFamily(item)}:${item.targetSection || inferTargetSection(item)}:${item.actionFamily || inferActionFamily(item)}`;
}

function hasCaseSpecificLeak(item = {}) {
  const text = lowerText(adviceText(item));
  return /dyson|diffuser|cofounder|project management club|professional summary|alpha research|specific company classification/i.test(text);
}

function hasRoleDriftLeak(item = {}, context = {}) {
  const text = lowerText(adviceText(item));
  const family = context.roleProfile?.canonicalRoleFamily || context.internalAtsResult?.profile?.roleFamily || "";
  const forbiddenByFamily = {
    logistics_operations: /machine learning|deep learning|model training|feature engineering|pytorch|tensorflow|scikit-learn|classification|regression|nlp|computer vision|inference service/i,
    marketing: /general ledger|journal entries|account reconciliation|month-end close|gaap|quickbooks|netsuite|audit workpaper/i,
    machine_learning: /general ledger|accounts payable|accounts receivable|month-end close|gaap|dispatch scheduling|pickup schedule/i,
    cloud_infrastructure: /dyson|diffuser|3d modeling|prototype fabrication|campaign brief|content calendar|general ledger|gaap/i,
    finance: /dyson|diffuser|3d modeling|prototype fabrication|model deployment|pytorch|tensorflow/i,
  };
  return Boolean(forbiddenByFamily[family]?.test(text));
}

function isUnsafeCuratedAdvice(item = {}, context = {}) {
  const source = lowerText(item.source || "");
  if (!source || source === "fallback") return false;
  return hasCaseSpecificLeak(item) || hasRoleDriftLeak(item, context);
}

function deterministicIndex(value = "", modulo = 1) {
  const text = normalizeText(value);
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return modulo ? hash % modulo : 0;
}

function pickTitleVariant(item = {}, variants = []) {
  if (!variants.length) return item.title || "";
  const seed = [
    item.adviceId,
    item.id,
    item.coverageFamily,
    item.actionSlot,
    item.actionFamily,
    item.targetSection,
    item.action,
  ].filter(Boolean).join("|");
  return variants[deterministicIndex(seed, variants.length)];
}

function diversifyAdviceTitle(item = {}, context = {}) {
  const title = sanitizeRoleMixedText(item.title || "", context);
  const compact = normalizeText(title).toLowerCase();
  const isGenericExperienceTitle =
    /^æ”¹å†™å·¥ä½œç»åŽ†\s*bullet$/i.test(title) ||
    /^rewrite\s+experience\s+bullet$/i.test(compact) ||
    /^rewrite\s+work\s+experience\s+bullet$/i.test(compact);
  const family = item.coverageFamily || inferCoverageFamily(item);
  const actionFamily = item.actionFamily || inferActionFamily(item);
  const genericTitlePatterns = [
    /bullet/i,
    /jd\s*keyword/i,
    /keyword/i,
    /summary/i,
    /skills?/i,
    /junior/i,
    /title/i,
    /position/i,
    /target role/i,
    /impact/i,
    /metric/i,
    /tenure/i,
    /intern/i,
    /course/i,
    /education/i,
    /tool/i,
    /delivery/i,
    /section/i,
    /weight/i,
    /关键词|岗位|定位|成果|量化|经历|证据|短期|实习|课程|教育|工具|交付|篇幅|权重|技能/.test(title),
  ];
  const shouldDiversify = isGenericExperienceTitle ||
    genericTitlePatterns.some((pattern) => pattern instanceof RegExp ? pattern.test(compact) || pattern.test(title) : Boolean(pattern));
  if (!shouldDiversify) return title;

  if (family === "keyword" || actionFamily === "skills_keyword_ordering" || actionFamily === "keyword_in_experience") {
    if (actionFamily === "skills_keyword_ordering" || item.targetSection === "skills") {
      return pickTitleVariant(item, ["整理 Skills 关键词", "补齐技能区关键词", "重排岗位关键词"]);
    }
    if (actionFamily === "keyword_in_experience" || item.targetSection === "experience") {
      return pickTitleVariant(item, ["把技能词写成项目证据", "让关键词出现在真实项目里", "补齐经历里的关键词证据"]);
    }
    return pickTitleVariant(item, ["把 JD 关键词放回经历", "补齐关键词匹配信号", "校准 ATS 关键词"]);
  }
  if (family === "readability_structure") {
    return pickTitleVariant(item, ["调整经历篇幅权重", "重排最相关经历顺序", "突出核心经历"]);
  }
  if (family === "impact_metrics" || actionFamily === "experience_impact_metrics") {
    const text = lowerText(`${item.title || ""} ${item.action || ""} ${item.actionSummary || ""}`);
    if (/frequency|scale|efficiency|throughput|cycle|volume|频率|规模|效率|处理量|覆盖范围/.test(text)) {
      return pickTitleVariant(item, ["补上规模、频率和效率", "说明处理量与影响范围", "把工作量写成可比较指标"]);
    }
    return pickTitleVariant(item, ["补上结果数字", "用指标说明实际贡献", "把经历改成可衡量结果"]);
  }
  if (family === "risk_explanation" || actionFamily === "short_tenure_explanation") {
    return pickTitleVariant(item, ["说明短期经历性质", "交代实习或项目周期", "补清经历边界"]);
  }
  if (family === "positioning" || actionFamily === "summary_positioning") {
    return pickTitleVariant(item, ["补上目标岗位原词", "统一开头岗位定位", "让 Summary 指向目标岗位"]);
  }
  if (family === "junior_signal" || actionFamily === "education_coursework_signal") {
    return pickTitleVariant(item, ["用课程或项目补足 junior 信号", "把训练背景写成岗位证据"]);
  }
  if (actionFamily === "tool_delivery_context") {
    return pickTitleVariant(item, ["补足工具与交付场景", "把岗位工具写回经历", "用工具证明实际交付"]);
  }
  return pickTitleVariant(item, ["补强经历里的动作和交付", "把职责写成项目证据", "重写核心经历 bullet"]);
}

function duplicateTitleVariants(item = {}) {
  const family = item.coverageFamily || inferCoverageFamily(item);
  const actionFamily = item.actionFamily || inferActionFamily(item);
  if (family === "keyword" || actionFamily === "skills_keyword_ordering" || actionFamily === "keyword_in_experience") {
    if (actionFamily === "skills_keyword_ordering" || item.targetSection === "skills") {
      return ["整理 Skills 关键词", "补齐技能区关键词", "重排岗位关键词", "校准 ATS 关键词"];
    }
    if (actionFamily === "keyword_in_experience" || item.targetSection === "experience") {
      return ["把技能词写成项目证据", "让关键词出现在真实项目里", "补齐经历里的关键词证据", "把 JD 关键词放回经历"];
    }
    return ["把 JD 关键词放回经历", "补齐关键词匹配信号", "校准 ATS 关键词", "把技能词写成项目证据"];
  }
  if (family === "impact_metrics" || actionFamily === "experience_impact_metrics") {
    const text = lowerText(`${item.title || ""} ${item.action || ""} ${item.actionSummary || ""}`);
    if (/frequency|scale|efficiency|throughput|cycle|volume|频率|规模|效率|处理量|覆盖范围/.test(text)) {
      return ["补上规模、频率和效率", "说明处理量与影响范围", "把工作量写成可比较指标", "补上成果数字和规模"];
    }
    return ["补上结果数字", "用指标说明实际贡献", "把经历改成可衡量结果", "强化 bullet 的结果表达"];
  }
  if (family === "positioning" || actionFamily === "summary_positioning") {
    return ["补上目标岗位原词", "统一开头岗位定位", "让 Summary 指向目标岗位", "收束简历主线"];
  }
  if (family === "risk_explanation" || actionFamily === "short_tenure_explanation") {
    return ["说明短期经历性质", "交代实习或项目周期", "补清经历边界", "降低短期经历疑虑"];
  }
  if (family === "junior_signal" || actionFamily === "education_coursework_signal") {
    return ["用课程或项目补足 junior 信号", "把训练背景写成岗位证据", "补强教育训练证据"];
  }
  if (actionFamily === "tool_delivery_context") {
    return ["补足工具与交付场景", "把岗位工具写回经历", "用工具证明实际交付"];
  }
  if (family === "readability_structure") {
    return ["调整经历篇幅权重", "重排最相关经历顺序", "突出核心经历"];
  }
  return ["补强经历里的动作和交付", "把职责写成项目证据", "重写核心经历 bullet", "补齐项目产出证据"];
}

function makeUniqueReportTitle(item = {}, usedTitles = new Set(), occurrence = 0) {
  const current = normalizeText(item.title);
  if (current && !usedTitles.has(current)) {
    usedTitles.add(current);
    return item.title;
  }
  const variants = duplicateTitleVariants(item);
  const seedOffset = deterministicIndex(`${item.adviceId || ""}|${item.action || item.actionSummary || ""}|${occurrence}`, variants.length || 1);
  for (let i = 0; i < variants.length; i += 1) {
    const candidate = variants[(seedOffset + i) % variants.length];
    const key = normalizeText(candidate);
    if (key && !usedTitles.has(key)) {
      usedTitles.add(key);
      return candidate;
    }
  }
  const fallback = `${current || "修改建议"}（${occurrence + 1}）`;
  usedTitles.add(fallback);
  return fallback;
}

function dedupeReportAdviceTitles(groups = []) {
  const usedTitles = new Set();
  const occurrences = new Map();
  return groups.map((group) => ({
    ...group,
    adviceItems: asArray(group.adviceItems).map((item) => {
      const titleKey = normalizeText(item.title);
      const occurrence = occurrences.get(titleKey) || 0;
      occurrences.set(titleKey, occurrence + 1);
      return {
        ...item,
        title: makeUniqueReportTitle(item, usedTitles, occurrence),
      };
    }),
  }));
}

function limitGroupAdviceItemsByCoverage(items = [], limit = 3, options = {}) {
  const maxPerFamily = Number.isFinite(Number(options.maxPerFamily))
    ? Number(options.maxPerFamily)
    : 1;
  const allowOverflow = options.allowOverflow === true;
  const sorted = asArray(items).sort((a, b) => {
    const aSupplement = a.source === "curator_supplement";
    const bSupplement = b.source === "curator_supplement";
    if (aSupplement !== bSupplement) return aSupplement ? 1 : -1;
    return compareAdvice(a, b);
  });
  const selected = [];
  const selectedKeys = new Set();
  const selectedSlotKeys = new Set();
  const familyCounts = new Map();
  const add = (item) => {
    const key = adviceExactKey(item);
    const slotKey = item.duplicateGroupKey || buildDuplicateGroupKey(item);
    if (selectedKeys.has(key) || selected.length >= limit) return false;
    if (selectedSlotKeys.has(slotKey)) return false;
    selected.push(item);
    selectedKeys.add(key);
    selectedSlotKeys.add(slotKey);
    const family = item.coverageFamily || inferCoverageFamily(item);
    familyCounts.set(family, (familyCounts.get(family) || 0) + 1);
    return true;
  };

  for (const item of sorted) {
    const family = item.coverageFamily || inferCoverageFamily(item);
    if ((familyCounts.get(family) || 0) === 0) add(item);
    if (selected.length >= limit) break;
  }
  for (const item of sorted) {
    const family = item.coverageFamily || inferCoverageFamily(item);
    if ((familyCounts.get(family) || 0) < maxPerFamily) add(item);
    if (selected.length >= limit) break;
  }
  if (allowOverflow) {
    for (const item of sorted) {
      add(item);
      if (selected.length >= limit) break;
    }
  }
  return selected;
}

function selectAlternativeDisplayedMentor(item = {}, currentGroup = {}, context = {}) {
  const candidates = asArray(context.mentorPool)
    .filter((mentor) => !sameMentorSource(mentor, currentGroup))
    .filter((mentor) => !isMentorXProfile(mentor));
  const scored = candidates
    .map((mentor) => scoreMentorDisplayFit(item, mentor, context, item.originalMentorSource))
    .filter((candidate) =>
      candidate.score >= (isRoleAwareMockMentor(currentGroup) && isRoleAwareMockMentor(candidate.mentor) ? 15 : 35) &&
      !isUnexplainableExternalMentor(candidate.mentor, context) &&
      !isRoleFamilyUnsafeDisplayedMentor(candidate.mentor, item, context) &&
      !isWeakDataAnalyticsMentorForTarget(candidate.mentor, item, context)
    )
    .sort((a, b) => b.score - a.score);
  return scored[0] || null;
}

function redistributeOverloadedMentorGroups(groups = [], context = {}, softCap = 5) {
  const output = groups.slice();
  const groupForMentor = (mentor) => {
    const key = mentorGroupKey(mentor);
    let group = output.find((candidate) => mentorGroupKey(candidate) === key);
    if (!group) {
      group = {
        mentorId: mentor.mentorId || key,
        mentorName: mentor.mentorName || "导师",
        company: mentor.company || "",
        companyLogo: mentorLogoFor(mentor),
        mentorTitle: mentor.mentorTitle || "",
        mentorSubtitle: mentor.mentorSubtitle || "",
        careerPathDisplay: mentor.careerPathDisplay || null,
        badges: mentor.badges || [],
        matchReason: "",
        matchedProblems: [],
        adviceItems: [],
      };
      output.push(group);
    }
    return group;
  };

  for (const group of output.slice()) {
    if (isMentorXProfile(group) || asArray(group.adviceItems).length <= softCap) continue;
    const movable = group.adviceItems
      .slice()
      .sort((a, b) => Number(a.displayPriority || 0) - Number(b.displayPriority || 0));
    for (const item of movable) {
      if (group.adviceItems.length <= softCap) break;
      const alternative = selectAlternativeDisplayedMentor(item, group, context);
      if (!alternative) continue;
      const targetGroup = groupForMentor(cleanMentorSource(alternative.mentor));
      const slotKey = item.duplicateGroupKey || buildDuplicateGroupKey(item);
      if (targetGroup.adviceItems.some((existing) => (existing.duplicateGroupKey || buildDuplicateGroupKey(existing)) === slotKey)) continue;
      group.adviceItems = group.adviceItems.filter((existing) => adviceExactKey(existing) !== adviceExactKey(item));
      const displayed = cleanMentorSource(alternative.mentor);
      const attributionMode = inferAttributionMode(item, item.originalMentorSource, displayed);
      targetGroup.adviceItems.push({
        ...item,
        mentorSource: displayed,
        displayedMentorSource: displayed,
        attributionMode,
        sourceDisclosure: sourceDisclosureFor(attributionMode),
        mentorDisplayFit: alternative.fit,
        mentorFitReason: alternative.reason,
        displayMentorScore: Math.round(alternative.score),
      });
    }
  }
  return output.filter((group) => asArray(group.adviceItems).length);
}

function balanceRoleAwareMockGroups(groups = [], context = {}, softCap = 5) {
  const output = groups.map((group) => ({ ...group, adviceItems: asArray(group.adviceItems).slice() }));
  const mockMentors = roleAwareMockMentors(context)
    .map(cleanMentorSource)
    .filter(Boolean)
    .filter((mentor) => !isMentorXProfile(mentor));
  if (mockMentors.length < 2) return output;

  const groupForMentor = (mentor) => {
    const key = mentorGroupKey(mentor);
    let group = output.find((candidate) => mentorGroupKey(candidate) === key);
    if (!group) {
      group = {
        mentorId: mentor.mentorId || key,
        mentorName: mentor.mentorName || "导师",
        company: mentor.company || "",
        companyLogo: mentorLogoFor(mentor),
        mentorTitle: mentor.mentorTitle || "",
        mentorSubtitle: mentor.mentorSubtitle || "",
        careerPathDisplay: mentor.careerPathDisplay || null,
        badges: mentor.badges || [],
        matchReason: "",
        matchedProblems: [],
        adviceItems: [],
      };
      output.push(group);
    }
    return group;
  };

  for (const group of output.slice()) {
    if (!isRoleAwareMockMentor(group) || asArray(group.adviceItems).length <= softCap) continue;
    const alternatives = mockMentors.filter((mentor) =>
      !sameMentorSource(mentor, group) &&
      !isRoleFamilyUnsafeDisplayedMentor(mentor, group.adviceItems[0] || {}, context)
    );
    if (!alternatives.length) continue;
    const movable = group.adviceItems
      .slice()
      .sort((a, b) => Number(a.displayPriority || 0) - Number(b.displayPriority || 0));
    let altIndex = 0;
    for (const item of movable) {
      if (group.adviceItems.length <= softCap) break;
      const displayed = alternatives[altIndex % alternatives.length];
      altIndex += 1;
      const targetGroup = groupForMentor(displayed);
      if (adviceExactKey(item) && targetGroup.adviceItems.some((existing) => adviceExactKey(existing) === adviceExactKey(item))) continue;
      group.adviceItems = group.adviceItems.filter((existing) => adviceExactKey(existing) !== adviceExactKey(item));
      const attributionMode = inferAttributionMode(item, item.originalMentorSource, displayed);
      targetGroup.adviceItems.push({
        ...item,
        mentorSource: displayed,
        displayedMentorSource: displayed,
        attributionMode,
        sourceDisclosure: sourceDisclosureFor(attributionMode),
        mentorDisplayFit: item.mentorDisplayFit || "mock_lens",
        mentorFitReason: item.mentorFitReason || "Role-aware mock mentor lens used because no suitable real mentor was available.",
        displayMentorScore: item.displayMentorScore || 25,
      });
    }
  }
  return output.filter((group) => asArray(group.adviceItems).length);
}

function replaceUnsafeDisplayedGroups(groups = [], context = {}) {
  const output = [];
  const groupForMentor = (mentor) => {
    const key = mentorGroupKey(mentor);
    let group = output.find((candidate) => mentorGroupKey(candidate) === key);
    if (!group) {
      group = {
        mentorId: mentor.mentorId || key,
        mentorName: mentor.mentorName || "导师",
        company: mentor.company || "",
        companyLogo: mentorLogoFor(mentor),
        mentorTitle: mentor.mentorTitle || "",
        mentorSubtitle: mentor.mentorSubtitle || "",
        careerPathDisplay: mentor.careerPathDisplay || null,
        badges: mentor.badges || [],
        matchReason: "",
        matchedProblems: [],
        adviceItems: [],
      };
      output.push(group);
    }
    return group;
  };

  for (const group of groups) {
    for (const item of asArray(group.adviceItems)) {
      const unsafe = isRoleFamilyUnsafeDisplayedMentor(group, item, context) ||
        isWeakDataAnalyticsMentorForTarget(group, item, context) ||
        isUnexplainableExternalMentor(group, context);
      let displayed = cleanMentorSource(group);
      let displayFit = null;
      if (unsafe) {
        const mockFit = selectRoleAwareMockDisplayedMentor(item, context, context.mentorPool || []);
        displayed = cleanMentorSource(mockFit?.mentor);
        displayFit = mockFit;
      }
      if (!displayed || isMentorXProfile(displayed)) continue;
      const targetGroup = groupForMentor(displayed);
      if (targetGroup.adviceItems.some((existing) => adviceExactKey(existing) === adviceExactKey(item))) continue;
      const attributionMode = inferAttributionMode(item, item.originalMentorSource, displayed);
      targetGroup.adviceItems.push({
        ...item,
        mentorSource: displayed,
        displayedMentorSource: displayed,
        attributionMode,
        sourceDisclosure: sourceDisclosureFor(attributionMode),
        mentorDisplayFit: displayFit?.fit || item.mentorDisplayFit,
        mentorFitReason: displayFit?.reason || item.mentorFitReason,
        displayMentorScore: Math.round(displayFit?.score || item.displayMentorScore || 0),
      });
    }
  }
  return output.filter((group) => asArray(group.adviceItems).length);
}

function isHardUnsafeReportGroup(group = {}, item = {}, context = {}) {
  if (!group || isMentorXProfile(group)) return false;
  if (isGenericExecutiveMentor(group) && isSpecializedTargetContext(context)) return true;
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const functionCluster = roleProfile.functionCluster || "";
  if (functionCluster !== "finance" && functionCluster !== "accounting" && hasFinanceMentorSignal(group)) {
    const groupText = mentorDescriptorText(group);
    if (!/marketing|growth|brand|software|engineer|data engineer|data engineering|machine learning|ml engineer|ai engineer|network|infrastructure|cloud|operations|logistics/.test(groupText)) {
      return true;
    }
  }
  if (isDataEngineeringTargetContext(context) && !isRoleAwareMockMentor(group) && !/data engineer|data engineering|data platform|platform engineer|cloud|backend|infrastructure/.test(mentorDescriptorText(group))) {
    return true;
  }
  return false;
}

function hardCleanUnsafeReportGroups(groups = [], context = {}) {
  const output = [];
  const groupForMentor = (mentor) => {
    const key = mentorGroupKey(mentor);
    let group = output.find((candidate) => mentorGroupKey(candidate) === key);
    if (!group) {
      group = {
        mentorId: mentor.mentorId || key,
        mentorName: mentor.mentorName || "导师",
        company: mentor.company || "",
        companyLogo: mentorLogoFor(mentor),
        mentorTitle: mentor.mentorTitle || "",
        mentorSubtitle: mentor.mentorSubtitle || "",
        careerPathDisplay: mentor.careerPathDisplay || null,
        badges: mentor.badges || [],
        matchReason: "",
        matchedProblems: [],
        adviceItems: [],
      };
      output.push(group);
    }
    return group;
  };

  for (const group of groups) {
    for (const item of asArray(group.adviceItems)) {
      let displayed = cleanMentorSource(group);
      let fit = null;
      if (isHardUnsafeReportGroup(group, item, context)) {
        fit = selectRoleAwareMockDisplayedMentor(item, context, context.mentorPool || []);
        displayed = cleanMentorSource(fit?.mentor);
      }
      if (!displayed || isMentorXProfile(displayed)) continue;
      const targetGroup = groupForMentor(displayed);
      if (targetGroup.adviceItems.some((existing) => adviceExactKey(existing) === adviceExactKey(item))) continue;
      const attributionMode = inferAttributionMode(item, item.originalMentorSource, displayed);
      targetGroup.adviceItems.push({
        ...item,
        mentorSource: displayed,
        displayedMentorSource: displayed,
        attributionMode,
        sourceDisclosure: sourceDisclosureFor(attributionMode),
        mentorDisplayFit: fit?.fit || item.mentorDisplayFit,
        mentorFitReason: fit?.reason || item.mentorFitReason,
        displayMentorScore: Math.round(fit?.score || item.displayMentorScore || 0),
      });
    }
  }
  return output.filter((group) => asArray(group.adviceItems).length);
}

function replaceMentorXDisplayedGroups(groups = [], context = {}) {
  const output = groups.filter((group) => !isMentorXProfile(group)).map((group) => ({ ...group, adviceItems: asArray(group.adviceItems).slice() }));
  const groupForMentor = (mentor) => {
    const key = mentorGroupKey(mentor);
    let group = output.find((candidate) => mentorGroupKey(candidate) === key);
    if (!group) {
      group = {
        mentorId: mentor.mentorId || key,
        mentorName: mentor.mentorName || "导师",
        company: mentor.company || "",
        companyLogo: mentorLogoFor(mentor),
        mentorTitle: mentor.mentorTitle || "",
        mentorSubtitle: mentor.mentorSubtitle || "",
        careerPathDisplay: mentor.careerPathDisplay || null,
        badges: mentor.badges || [],
        matchReason: "",
        matchedProblems: [],
        adviceItems: [],
      };
      output.push(group);
    }
    return group;
  };

  const mentorXItems = groups
    .filter((group) => isMentorXProfile(group))
    .flatMap((group) => asArray(group.adviceItems));
  for (const item of mentorXItems) {
    const mockFit = selectRoleAwareMockDisplayedMentor(item, context, context.mentorPool || []);
    const displayed = cleanMentorSource(mockFit?.mentor);
    if (!displayed || isMentorXProfile(displayed)) continue;
    const targetGroup = groupForMentor(displayed);
    const slotKey = item.duplicateGroupKey || buildDuplicateGroupKey(item);
    if (targetGroup.adviceItems.some((existing) =>
      adviceExactKey(existing) === adviceExactKey(item) ||
      (existing.duplicateGroupKey || buildDuplicateGroupKey(existing)) === slotKey
    )) continue;
    const attributionMode = inferAttributionMode(item, item.originalMentorSource, displayed);
    targetGroup.adviceItems.push({
      ...item,
      mentorSource: displayed,
      displayedMentorSource: displayed,
      attributionMode,
      sourceDisclosure: sourceDisclosureFor(attributionMode),
      mentorDisplayFit: mockFit?.fit || "mock_lens",
      mentorFitReason: mockFit?.reason || "Role-aware mock mentor lens used because no suitable real mentor was available.",
      displayMentorScore: Math.round(mockFit?.score || 25),
    });
  }
  return output.filter((group) => asArray(group.adviceItems).length);
}

function displayPriorityFor(item = {}, context = {}) {
  const tags = asArray(item.relatedProblemTags);
  const tagSeverity = new Map(asArray(context.problemTags).map((p) => [p.tag || p, p.severity || "medium"]));
  const strongestTag = tags.reduce((best, tag) => Math.min(best, severityRank(tagSeverity.get(tag))), 4);
  let score = 100 - priorityRank(item.priority) * 12 - strongestTag * 8;
  if (item.coverageFamily === "positioning") score += 9;
  if (item.coverageFamily === "experience_evidence") score += 8;
  if (item.coverageFamily === "impact_metrics") score += 7;
  if (item.coverageFamily === "risk_explanation") score += 8;
  if (item.targetSection && item.targetSection !== "overall") score += 5;
  if (normalizeText(item.currentDiagnosis || item.problemSummary).length > 30) score += 3;
  if (normalizeText(item.action || item.actionSummary).length > 30) score += 4;
  if (item.source === "fallback") score -= 12;
  if (item.source === "curator_supplement") score -= 20;
  if (item.coverageFamily === "keyword") score -= 3;
  return Math.max(0, Math.round(score));
}

function normalizeAdviceItemForCuration(item = {}, context = {}, mentor = {}) {
  const actionFamily = inferActionFamily(item);
  const targetSection = inferTargetSection(item);
  const coverageFamily = inferCoverageFamily({ ...item, actionFamily, targetSection });
  const actionSlot = inferActionSlot({ ...item, actionFamily, targetSection, coverageFamily });
  const evidence = evidenceMatchesCoverage(item.evidence, coverageFamily)
    ? unique(item.evidence)
    : defaultEvidenceForCoverage(coverageFamily, targetSection);
  const fallbackMentorSource = cleanMentorSource({
    mentorId: mentor.mentorId,
    mentorName: mentor.mentorName,
    company: mentor.company,
    companyLogo: mentor.companyLogo || null,
    mentorTitle: mentor.mentorTitle,
    mentorSubtitle: mentor.mentorSubtitle,
  });
  const originalMentorSource = cleanMentorSource(item.originalMentorSource || item.mentorSource) || fallbackMentorSource;
  const mentorPool = buildMentorPool(
    context.mentorPool || [],
    [
      { mentorSource: originalMentorSource },
      { mentorSource: item.displayedMentorSource },
      { mentorSource: fallbackMentorSource },
    ]
  );
  const displayFit = selectDisplayedMentorForAdvice(
    { ...item, actionFamily, targetSection, coverageFamily, actionSlot },
    mentorPool,
    context,
    originalMentorSource
  );
  const displayedMentorSource = displayFit.displayedMentorSource || originalMentorSource || fallbackMentorSource;
  const attributionMode = inferAttributionMode(item, originalMentorSource, displayedMentorSource);
  const sourceDisclosure = sourceDisclosureFor(attributionMode);
  const normalized = {
    ...item,
    title: diversifyAdviceTitle({ ...item, actionFamily, targetSection, coverageFamily, actionSlot }, context),
    currentDiagnosis: sanitizeRoleMixedText(item.currentDiagnosis || item.problemSummary || "", context),
    problemSummary: sanitizeRoleMixedText(item.problemSummary || item.currentDiagnosis || "", context),
    action: sanitizeRoleMixedText(item.action || item.actionSummary || "", context),
    actionSummary: sanitizeRoleMixedText(item.actionSummary || item.action || "", context),
    mentorInsight: sanitizeRoleMixedText(item.mentorInsight || item.mentorLens || item.reason || "", context),
    mentorLens: sanitizeRoleMixedText(item.mentorLens || item.mentorInsight || item.reason || "", context),
    hrPerspective: sanitizeRoleMixedText(item.hrPerspective || item.HR_os || "", context),
    HR_os: sanitizeRoleMixedText(item.HR_os || item.hrPerspective || "", context),
    actionFamily,
    canonicalActionFamily: item.canonicalActionFamily || actionFamily,
    targetSection,
    coverageFamily,
    actionSlot,
    relatedProblemTags: unique(item.relatedProblemTags),
    evidence,
    attributionMode,
    originalMentorSource,
    displayedMentorSource,
    sourceDisclosure,
    mentorSource: displayedMentorSource,
    mentorDisplayFit: displayFit.mentorDisplayFit,
    mentorFitReason: displayFit.mentorFitReason,
    displayMentorScore: displayFit.displayMentorScore,
    mentorRoleCluster: displayFit.mentorDisplayFit,
    adviceSkillClusters: inferAdviceSkillClusters(item),
  };
  normalized.duplicateGroupKey = buildDuplicateGroupKey(normalized);
  normalized.displayPriority = Number.isFinite(Number(item.displayPriority))
    ? Number(item.displayPriority)
    : displayPriorityFor(normalized, context);
  normalized.isPreviewWorthy = item.isPreviewWorthy !== false &&
    ["positioning", "experience_evidence", "impact_metrics", "risk_explanation", "keyword"].includes(normalized.coverageFamily);
  return normalized;
}

function compareAdvice(a, b) {
  return (Number(b.displayPriority || 0) - Number(a.displayPriority || 0)) ||
    (priorityRank(a.priority) - priorityRank(b.priority)) ||
    String(a.adviceId || "").localeCompare(String(b.adviceId || ""));
}

function hasRequiredFamily(items, family) {
  return items.some((item) => item.coverageFamily === family);
}

function chooseBestByKey(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    const existing = map.get(key);
    if (!existing || compareAdvice(item, existing) < 0) map.set(key, item);
  }
  return [...map.values()];
}

function enforceKeywordCaps(items, context = {}) {
  const maxKeyword = isKeywordCritical(context) ? 4 : 3;
  let globalKeywordCount = 0;
  const keywordByMentor = new Map();
  const output = [];
  for (const item of items.sort(compareAdvice)) {
    if (item.coverageFamily !== "keyword") {
      output.push(item);
      continue;
    }
    const mentorKey = mentorGroupKey(item.mentorSource || {});
    if ((keywordByMentor.get(mentorKey) || 0) >= 1) continue;
    if (globalKeywordCount >= maxKeyword) continue;
    keywordByMentor.set(mentorKey, (keywordByMentor.get(mentorKey) || 0) + 1);
    globalKeywordCount += 1;
    output.push(item);
  }
  return output.sort(compareAdvice);
}

function compactAdviceText(value) {
  return lowerText(value).replace(/\s+/g, " ").trim();
}

function adviceExactKey(item = {}) {
  const stableText = [
    item.title,
    item.currentDiagnosis || item.problemSummary,
    item.action || item.actionSummary,
  ].map(compactAdviceText).filter(Boolean).join("|");
  return stableText || String(item.adviceId || item.id || "");
}

function supplementalAdviceTemplates(context = {}) {
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const isMachineLearning = roleProfile.functionCluster === "machine_learning";
  const isAccounting = roleProfile.functionCluster === "accounting";
  const targetRole = normalizeText(context.targetRole || context.internalAtsResult?.jobTitle || "ç›®æ ‡å²—ä½");
  const toolTitle = isMachineLearning ? "补足模型工具和评估语境" : "补足岗位工具和交付语境";
  const toolDiagnosis = isMachineLearning
    ? "简历已经有项目经历，但还可以更明确连接到 MLE 岗位常见的模型、数据、评估或部署交付。"
    : "简历已经有可迁移经历，但还可以更明确连接到目标岗位常见工具、流程或交付物。";
  const toolAction = isMachineLearning
    ? `检查 ${targetRole} JD 中反复出现的模型、数据、评估和部署要求，把真实掌握的 Python、PyTorch/TensorFlow、模型评估、数据处理、API 或部署经验放回对应项目。`
    : isAccounting
      ? `检查 ${targetRole} JD 中反复出现的工具和交付物，把真实掌握的 Excel、报表、对账、合规、流程跟进或数据整理内容放回对应经历。`
      : `检查 ${targetRole} JD 中反复出现的工具、流程和交付物，把真实掌握的技能放回对应经历或项目。`;
  const deliveryTitle = isMachineLearning
    ? "把项目改成模型交付证据"
    : isAccounting
      ? "把职责改成会计交付物"
      : "把职责改成岗位交付物";
  const deliveryDiagnosis = isMachineLearning
    ? "部分项目还停留在参与或负责层面，和 MLE 岗位常见的模型训练、评估、上线或实验结论连接不够明确。"
    : isAccounting
      ? "部分经历还停留在参与或负责层面，和会计岗位常见的交付物连接不够明确。"
      : "部分经历还停留在参与或负责层面，和目标岗位常见交付物连接不够明确。";
  const deliveryAction = isMachineLearning
    ? "挑一条最相关项目，补成「任务场景 + 模型/数据方法 + 评估指标或部署结果」结构，例如数据清洗、特征处理、模型训练、效果评估、API 服务或实验结论。"
    : isAccounting
      ? "挑一条最相关经历，补成「任务场景 + 处理对象 + 交付物」结构，例如报表、对账记录、费用整理、流程跟进、数据核对或月度汇总。"
      : "挑一条最相关经历，补成「任务场景 + 处理对象 + 交付物」结构，让读者能看见你具体完成了什么。";
  return [
    {
      adviceId: "mentorx_supplement_section_weighting",
      title: "è°ƒæ•´ç»åŽ†ç¯‡å¹…æƒé‡",
      currentDiagnosis: "ç®€åŽ†é‡Œä¸åŒç»åŽ†çš„é‡è¦æ€§è¿˜æ²¡æœ‰æ‹‰å¼€ï¼Œè¯»è€…å¯èƒ½ä¼šæŠŠå¼±ç›¸å…³å†…å®¹å’Œæ ¸å¿ƒç»åŽ†çœ‹æˆåŒç­‰é‡è¦ã€‚",
      action: `æŠŠæœ€è´´è¿‘ ${targetRole} çš„ç»åŽ†æˆ–é¡¹ç›®æ”¾åˆ°æ›´é å‰ä½ç½®ï¼Œå¹¶ç»™å®ƒå¤š 1-2 æ¡ bulletï¼›å¼±ç›¸å…³ç»åŽ†åªä¿ç•™èƒ½è¯æ˜Žäº¤ä»˜ã€åä½œæˆ–åŸºç¡€èŒä¸šèƒ½åŠ›çš„å†…å®¹ã€‚`,
      mentorInsight: "å®Œæ•´æŠ¥å‘Šé‡Œé™¤äº†æ”¹å…³é”®è¯ï¼Œä¹Ÿè¦å¤„ç†ä¿¡æ¯æƒé‡ã€‚è¶Šé å‰ã€è¶Šè¯¦ç»†çš„ç»åŽ†ï¼Œè¶Šä¼šå½±å“ HR å¯¹åŒ¹é…åº¦çš„ç¬¬ä¸€åˆ¤æ–­ã€‚",
      hrPerspective: "æˆ‘ä¸ä¼šå¹³å‡é˜…è¯»æ¯æ®µç»åŽ†ï¼›æœ€å‰é¢çš„ç»åŽ†å¦‚æžœä¸å¤Ÿç›¸å…³ï¼ŒåŽé¢çš„äº®ç‚¹å¾ˆå¯èƒ½æ¥ä¸åŠè¢«çœ‹åˆ°ã€‚",
      priority: "medium",
      targetSection: "experience",
      relatedProblemTags: ["weak_section_order"],
      actionFamily: "section_relevance_order",
      canonicalActionFamily: "section_relevance_order",
      mentorSource: MENTORX_SOURCE,
      source: "curator_supplement",
    },
    {
      adviceId: "mentorx_supplement_accounting_tools",
      title: toolTitle,
      currentDiagnosis: toolDiagnosis,
      action: toolAction,
      mentorInsight: "å·¥å…·åä¸è¦åªå †åœ¨ Skillsï¼›æœ€å¥½å’Œå…·ä½“äº¤ä»˜åœºæ™¯ç»‘å®šï¼Œæ‰èƒ½åŒæ—¶æœåŠ¡ ATS å’Œäººå·¥é˜…è¯»ã€‚",
      hrPerspective: "æˆ‘ä¼šçœ‹æŠ€èƒ½æ˜¯å¦å‡ºçŽ°åœ¨çœŸå®žåœºæ™¯é‡Œã€‚åªåˆ—å·¥å…·åä¸å¦‚è¯´æ˜Žä½ ç”¨å®ƒå®Œæˆäº†ä»€ä¹ˆã€‚",
      priority: "medium",
      targetSection: "skills",
      relatedProblemTags: ["weak_experience_keyword_evidence"],
      actionFamily: "experience_evidence",
      canonicalActionFamily: "experience_evidence",
      mentorSource: MENTORX_SOURCE,
      source: "curator_supplement",
    },
    {
      adviceId: "mentorx_supplement_delivery_examples",
      title: deliveryTitle,
      currentDiagnosis: deliveryDiagnosis,
      action: deliveryAction,
      mentorInsight: "ä¼šè®¡ç±»å²—ä½å¾ˆçœ‹é‡ç¨³å®šã€å‡†ç¡®ã€å¯å¤æ ¸çš„äº¤ä»˜ç‰©ã€‚æŠŠç»åŽ†å†™æˆå…·ä½“äº¤ä»˜ï¼Œä¼šæ¯”æ³›æ³›å†™ååŠ©æˆ–å‚ä¸Žæ›´æœ‰è¯´æœåŠ›ã€‚",
      hrPerspective: "æˆ‘ä¼šçœ‹ä½ æ˜¯å¦çœŸçš„æŽ¥è§¦è¿‡å²—ä½ç›¸è¿‘çš„å·¥ä½œæµï¼›äº¤ä»˜ç‰©è¶Šå…·ä½“ï¼Œè¶Šå®¹æ˜“åˆ¤æ–­å¯è¿ç§»æ€§ã€‚",
      priority: "medium",
      targetSection: "experience",
      relatedProblemTags: ["weak_experience_keyword_evidence"],
      actionFamily: "experience_delivery_context",
      canonicalActionFamily: "experience_delivery_context",
      mentorSource: MENTORX_SOURCE,
      source: "curator_supplement",
    },
  ];
}

function fillReportRichness(normalized = [], curated = [], context = {}) {
  let output = curated.slice();
  if (output.length >= 7) return output;
  const existingKeys = new Set(output.map(adviceExactKey));
  let keywordCount = output.filter((item) => item.coverageFamily === "keyword").length;
  const roleFallback = buildRoleAwareFallbackAdvice({
    internalAtsResult: context.internalAtsResult || {},
    retrievalQuery: context.retrievalQuery || {},
    roleProfile: context.roleProfile,
    targetCount: 9,
    usedAdviceItems: output,
  }).fallbackAdviceItems || [];
  const supplements = [
    ...roleFallback.map((item) => ({
      ...item,
      priority: "low",
      displayPriority: Math.min(Number(item.displayPriority || 40), 35),
      source: item.source || "curator_supplement",
    })),
    ...supplementalAdviceTemplates(context),
  ]
    .map((item) => normalizeAdviceItemForCuration(item, context, { ...MENTORX_SOURCE }))
    .filter((item) => normalizeText(item.title) && normalizeText(item.action || item.actionSummary));
  for (const item of supplements) {
    if (output.length >= 7) break;
    const key = adviceExactKey(item);
    if (existingKeys.has(key)) continue;
    if (item.coverageFamily === "keyword" && keywordCount >= 2) continue;
    output.push(item);
    existingKeys.add(key);
    if (item.coverageFamily === "keyword") keywordCount += 1;
  }
  return output.sort(compareAdvice);
}

function problemTagValue(problem = {}) {
  if (typeof problem === "string") return problem;
  return problem.tag || problem.problemTag || problem.id || "";
}

function problemSeverityValue(problem = {}) {
  if (typeof problem === "string") return "medium";
  return problem.severity || "medium";
}

function coveredProblemTagSet(items = []) {
  return new Set(asArray(items).flatMap((item) => asArray(item.relatedProblemTags)).filter(Boolean));
}

function genericAdviceForUncoveredProblem(problem = {}, context = {}) {
  const tag = problemTagValue(problem);
  const targetRole = normalizeText(context.targetRole || context.internalAtsResult?.jobTitle || "目标岗位");
  const priority = problemSeverityValue(problem);
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const lexicon = buildRoleLexicon(roleProfile);
  const topTools = asArray(lexicon.topTools).slice(0, 3).join("、") || "相关工具";
  const deliverables = asArray(lexicon.deliverables).slice(0, 3).join("、") || "岗位交付物";

  if (/github|project_link|portfolio|link|链接|作品/.test(tag)) {
    return {
      adviceId: `uncovered_${compactKey(tag) || "link_evidence"}`,
      title: "补上项目链接或作品入口",
      currentDiagnosis: "简历里有项目或作品经历，但可验证入口还不够明确，读者很难快速确认真实产出。",
      action: `为最贴近 ${targetRole} 的项目补上 GitHub、作品集、Demo、报告或可访问链接，并在 bullet 中说明它对应的 ${deliverables}。`,
      mentorInsight: "项目链接不是装饰，它能把技能清单变成可验证证据，尤其适合经验还不长的候选人。",
      hrPerspective: "如果项目经历很关键，我会希望能看到可验证入口；否则只能按文字描述打折判断。",
      targetSection: "projects",
      coverageFamily: "technical_depth",
      actionFamily: "project_link_evidence",
      relatedProblemTags: [tag],
      evidence: ["项目链接", "可验证证据", "作品入口"],
      priority,
      source: "curator_supplement",
      mentorSource: MENTORX_SOURCE,
    };
  }
  if (/location|exp_location|missing_exp_location|地点|地點/.test(tag)) {
    return {
      adviceId: `uncovered_${compactKey(tag) || "experience_location"}`,
      title: "补齐经历地点信息",
      currentDiagnosis: "部分经历缺少地点或工作形式信息，履历结构看起来不够完整。",
      action: "在 Experience 每段标题行补齐城市/地区、Remote/Hybrid 或项目所在地；如果是线上项目，也可以明确写成 Remote Project。",
      mentorInsight: "地点信息不是核心卖点，但它能降低 HR 理解成本，让经历标题行更完整。",
      hrPerspective: "我扫经历时会看公司、职位、地点和时间是否完整；缺字段会让简历显得不够规范。",
      targetSection: "experience",
      coverageFamily: "readability_structure",
      actionFamily: "experience_location_completion",
      relatedProblemTags: [tag],
      evidence: ["经历地点", "标题行完整度", "格式规范"],
      priority,
      source: "curator_supplement",
      mentorSource: MENTORX_SOURCE,
    };
  }
  if (/repetitive_verbs|verb|action_verb|重复|重複/.test(tag)) {
    return {
      adviceId: `uncovered_${compactKey(tag) || "action_verbs"}`,
      title: "替换重复动词",
      currentDiagnosis: "经历 bullet 的开头动词有重复，读起来像职责罗列，动作层次不够清楚。",
      action: `按 ${targetRole} 的工作语境，把重复的 participated / assisted / responsible for 改成更具体的动作，例如 analyzed、coordinated、built、monitored、reconciled、reported，并连接 ${topTools} 或 ${deliverables}。`,
      mentorInsight: "动词要服务事实，不是为了变花；每个动词最好能带出一个动作、方法或交付物。",
      hrPerspective: "连续看到相同动词时，我会很难判断每条经历的差异和深度。",
      targetSection: "experience",
      coverageFamily: "experience_evidence",
      actionFamily: "action_verb_variety",
      relatedProblemTags: [tag],
      evidence: ["动作动词", "经历层次", "可读性"],
      priority,
      source: "curator_supplement",
      mentorSource: MENTORX_SOURCE,
    };
  }
  if (/resume_optimization_gap|content_quality|format|readability|structure/.test(tag)) {
    return {
      adviceId: `uncovered_${compactKey(tag) || "resume_structure"}`,
      title: "统一简历结构与信息层级",
      currentDiagnosis: "简历还有部分结构性优化空间，重要信息和弱相关内容的层级不够分明。",
      action: `把最贴近 ${targetRole} 的经历、项目和技能放到更靠前位置；弱相关内容只保留能证明协作、交付或基础职业能力的部分。`,
      mentorInsight: "完整报告不只改关键词，也要让读者第一眼看到最相关证据。",
      hrPerspective: "我不会平均阅读每个 section；越靠前、越清楚的内容越影响第一判断。",
      targetSection: "overall",
      coverageFamily: "readability_structure",
      actionFamily: "section_relevance_order",
      relatedProblemTags: [tag],
      evidence: ["信息层级", "Section 顺序", "可读性"],
      priority,
      source: "curator_supplement",
      mentorSource: MENTORX_SOURCE,
    };
  }
  return null;
}

function fillUncoveredProblemAdvice(normalized = [], curated = [], context = {}) {
  const output = curated.slice();
  const existingExact = new Set(output.map(adviceExactKey));
  const existingSlots = new Set(output.map((item) => item.duplicateGroupKey || buildDuplicateGroupKey(item)));
  const coveredTags = coveredProblemTagSet(output);
  const roleProfile = context.roleProfile || roleProfileFromContext(context);
  const roleLexicon = buildRoleLexicon(roleProfile);
  const problems = asArray(context.problemTags)
    .map((problem) => ({ raw: problem, tag: problemTagValue(problem) }))
    .filter((problem) => problem.tag && !coveredTags.has(problem.tag));

  for (const problem of problems) {
    const slotId = slotForProblemTag(problem.tag);
    const rawItem = slotId
      ? buildFallbackAdviceForSlot(slotId, roleLexicon, {
          relatedProblemTags: [problem.tag],
          displayPriority: 45,
          priority: problemSeverityValue(problem.raw),
        }, context)
      : genericAdviceForUncoveredProblem(problem.raw, context);
    if (!rawItem) continue;
    const item = normalizeAdviceItemForCuration({
      ...rawItem,
      adviceId: rawItem.adviceId || `uncovered_${compactKey(problem.tag)}`,
      relatedProblemTags: unique([...(rawItem.relatedProblemTags || []), problem.tag]),
      source: rawItem.source || "curator_supplement",
    }, context, MENTORX_SOURCE);
    const exact = adviceExactKey(item);
    const slot = item.duplicateGroupKey || buildDuplicateGroupKey(item);
    if (existingExact.has(exact) || existingSlots.has(slot)) {
      const existing = output.find((candidate) => (candidate.duplicateGroupKey || buildDuplicateGroupKey(candidate)) === slot);
      if (existing && !asArray(existing.relatedProblemTags).includes(problem.tag)) {
        existing.relatedProblemTags = unique([...asArray(existing.relatedProblemTags), problem.tag]);
        coveredTags.add(problem.tag);
      }
      continue;
    }
    output.push(item);
    existingExact.add(exact);
    existingSlots.add(slot);
    coveredTags.add(problem.tag);
  }
  return output.sort(compareAdvice);
}

function selectDiverseReportAdviceItems(normalized = [], context = {}) {
  const keywordCapped = enforceKeywordCaps(normalized, context).sort(compareAdvice);
  const exactSeen = new Set();
  const sameMentorSlotSeen = new Set();
  const duplicateCounts = new Map();
  const selected = [];

  for (const item of keywordCapped) {
    const exactKey = adviceExactKey(item);
    if (!exactKey || exactSeen.has(exactKey)) continue;

    const slotKey = item.duplicateGroupKey || buildDuplicateGroupKey(item);
    const mentorSlotKey = `${mentorGroupKey(item.mentorSource || {})}:${slotKey}`;
    if (sameMentorSlotSeen.has(mentorSlotKey)) continue;

    const maxPerSlot = item.coverageFamily === "keyword" ? 1 : 2;
    if ((duplicateCounts.get(slotKey) || 0) >= maxPerSlot) continue;

    exactSeen.add(exactKey);
    sameMentorSlotSeen.add(mentorSlotKey);
    duplicateCounts.set(slotKey, (duplicateCounts.get(slotKey) || 0) + 1);
    selected.push(item);
  }

  return selected.sort(compareAdvice);
}

function curateAdviceItems(items = [], context = {}) {
  const normalized = items
    .map((item) => normalizeAdviceItemForCuration(item, context, item._mentor || {}))
    .filter((item) => normalizeText(item.title) && normalizeText(item.action || item.actionSummary))
    .filter((item) => !isUnsafeCuratedAdvice(item, context));
  let curated = selectDiverseReportAdviceItems(normalized, context);

  const addBestFamily = (family) => {
    if (hasRequiredFamily(curated, family)) return;
    const candidate = normalized.filter((item) => item.coverageFamily === family).sort(compareAdvice)[0];
    if (candidate && !curated.some((item) => adviceExactKey(item) === adviceExactKey(candidate))) {
      curated.push(candidate);
      curated = chooseBestByKey(curated, adviceExactKey).sort(compareAdvice);
    }
  };

  if (hasProblemTag(context, /short_tenure|intern|gap/)) addBestFamily("risk_explanation");
  if (hasProblemTag(context, /education|coursework|gpa/)) addBestFamily("junior_signal");
  if (hasProblemTag(context, /weak_experience_keyword_evidence|low_measurable_results|weak_result_orientation/)) {
    addBestFamily("experience_evidence");
    if (!hasRequiredFamily(curated, "experience_evidence")) addBestFamily("impact_metrics");
  }

  curated = fillReportRichness(normalized, curated, context);
  curated = fillUncoveredProblemAdvice(normalized, curated, context);

  return curated.sort(compareAdvice);
}

function selectResultPageAdviceItems(curatedItems = [], context = {}) {
  const maxKeyword = isKeywordCritical(context) ? 2 : 1;
  const selected = [];
  const usedFamilies = new Set();
  let keywordCount = 0;
  const candidates = curatedItems
    .filter((item) => item.isPreviewWorthy !== false)
    .sort(compareAdvice);

  for (const item of candidates) {
    if (selected.length >= 3) break;
    if (item.coverageFamily === "keyword" && keywordCount >= maxKeyword) continue;
    if (usedFamilies.has(item.coverageFamily)) continue;
    selected.push(item);
    usedFamilies.add(item.coverageFamily);
    if (item.coverageFamily === "keyword") keywordCount += 1;
  }

  for (const item of candidates) {
    if (selected.length >= 3) break;
    if (selected.some((x) => (x.adviceId || x.duplicateGroupKey) === (item.adviceId || item.duplicateGroupKey))) continue;
    if (item.coverageFamily === "keyword" && keywordCount >= maxKeyword) continue;
    selected.push(item);
    if (item.coverageFamily === "keyword") keywordCount += 1;
  }

  return selected.slice(0, 3);
}

const LENS_CONFIG = {
  positioning: {
    lens: "岗位定位视角",
    reason: "这组建议主要针对简历开头、目标岗位原词和整体主线，让 HR 更快判断你的投递方向。",
  },
  keyword: {
    lens: "ATS 关键词视角",
    reason: "这组建议主要针对 JD 关键词覆盖和放置位置，帮助 ATS 与 HR 同时看到匹配证据。",
  },
  experience_evidence: {
    lens: "经历证据视角",
    reason: "这组建议主要针对经历 bullet 的动作、方法、工具和产出，让核心能力有真实项目证据支撑。",
  },
  impact_metrics: {
    lens: "成果量化视角",
    reason: "这组建议主要针对结果、指标和业务价值表达，让读者更容易判断你的实际贡献。",
  },
  marketing_campaign_context: {
    lens: "Marketing Campaign 视角",
    reason: "这组建议主要针对 Marketing 工具、audience、channel 和 campaign 场景，让经历不只停留在泛泛的活动支持。",
  },
  marketing_growth_metrics: {
    lens: "Marketing 增长指标视角",
    reason: "这组建议主要针对 CTR、CVR、ROAS、CAC、retention、open rate 等指标，把 Marketing 动作连接到业务结果。",
  },
  risk_explanation: {
    lens: "短期经历与风险解释视角",
    reason: "这组建议主要针对短期经历、实习性质或项目边界说明，帮助 HR 更快理解每段经历的性质和产出。",
  },
  junior_signal: {
    lens: "Junior 背景补强视角",
    reason: "这组建议主要针对课程、项目、证书和训练经历，把 junior 候选人的学习证据转成岗位能力信号。",
  },
  cross_domain_transfer: {
    lens: "跨领域迁移视角",
    reason: "这组建议主要针对非典型背景和可迁移能力表达，帮助你把已有经历翻译成目标岗位能理解的语言。",
  },
  technical_depth: {
    lens: "技术项目深度视角",
    reason: "这组建议主要针对技术项目、系统实现和工程化交付，让技术能力不只停留在工具清单。",
  },
  business_data_context: {
    lens: "业务 / 金融 / 数据场景视角",
    reason: "这组建议主要针对数据、业务场景和决策价值，把分析或项目经历连接到岗位真实工作语境。",
  },
  readability_structure: {
    lens: "版面与可读性视角",
    reason: "这组建议主要针对 section 顺序、信息权重和可扫描性，让重要经历更容易被 HR 第一眼看到。",
  },
};

function inferMentorGroupLens(adviceItems = [], mentorProfile = {}, targetRole = "") {
  const scores = new Map();
  for (const item of adviceItems) {
    const family = item.coverageFamily || inferCoverageFamily(item);
    scores.set(family, (scores.get(family) || 0) + 1 + Number(item.displayPriority || 0) / 100);
  }
  const mentorText = lowerText(`${mentorProfile.company || ""} ${mentorProfile.mentorTitle || ""} ${targetRole || ""}`);
  if (/blackrock|ubs|goldman|jpmorgan|finance|quant|financial|bank|é‡‘èž|é‡åŒ–/.test(mentorText)) {
    scores.set("business_data_context", (scores.get("business_data_context") || 0) + 0.35);
  }
  if (/software|engineer|machine learning|ml|ai|developer|anyscale|openai|google|amazon|meta/.test(mentorText)) {
    scores.set("technical_depth", (scores.get("technical_depth") || 0) + 0.25);
  }
  if (/marketing|growth|brand|crm|campaign|content|seo|sem|meta|google/.test(mentorText)) {
    scores.set("marketing_campaign_context", (scores.get("marketing_campaign_context") || 0) + 0.3);
    scores.set("marketing_growth_metrics", (scores.get("marketing_growth_metrics") || 0) + 0.25);
  }
  if (/architect|design|designer|portfolio|architecture/.test(mentorText)) {
    scores.set("cross_domain_transfer", (scores.get("cross_domain_transfer") || 0) + 0.2);
    scores.set("risk_explanation", (scores.get("risk_explanation") || 0) + 0.2);
  }
  const bestFamily = [...scores.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "experience_evidence";
  return LENS_CONFIG[bestFamily] || LENS_CONFIG.experience_evidence;
}

function buildReportPageMentorGroups(curatedItems = [], originalMentors = [], context = {}) {
  const mentorByKey = new Map();
  for (const mentor of originalMentors || []) {
    const keys = [
      mentorGroupKey(mentor),
      mentor.mentorId ? `id:${mentor.mentorId}` : "",
      mentor.company ? compactKey(mentor.company) : "",
      mentor.mentorName ? compactKey(mentor.mentorName) : "",
    ].filter(Boolean);
    keys.forEach((key) => {
      if (!mentorByKey.has(key)) mentorByKey.set(key, mentor);
    });
  }
  const groups = new Map();
  for (const item of curatedItems) {
    const src = item.mentorSource || {};
    const key = mentorGroupKey(src);
    const base = mentorByKey.get(key) || mentorByKey.get(src.mentorId ? `id:${src.mentorId}` : "") || src;
    if (!groups.has(key)) {
      groups.set(key, {
        mentorId: base.mentorId || src.mentorId || key,
        mentorName: base.mentorName || src.mentorName || "MentorX å¯¼å¸ˆ",
        company: base.company || src.company || "MentorX",
        companyLogo: mentorLogoFor(base) || mentorLogoFor(src),
        mentorTitle: base.mentorTitle || src.mentorTitle || "",
        mentorSubtitle: base.mentorSubtitle || src.mentorSubtitle || "",
        careerPathDisplay: base.careerPathDisplay || src.careerPathDisplay || null,
        badges: base.badges || [],
        matchReason: base.matchReason || item.matchReason || "",
        matchedProblems: base.matchedProblems || [],
        adviceItems: [],
      });
    }
    groups.get(key).adviceItems.push(item);
  }
  const groupCount = groups.size;
  const totalCurated = curatedItems.length;
  const limitedGroups = [...groups.values()].map((group) => {
    const groupLimit = Math.max(1, group.adviceItems.length);
    const isStrategyGroup = isMentorXProfile(group);
    group.adviceItems = limitGroupAdviceItemsByCoverage(group.adviceItems, groupLimit, {
      maxPerFamily: Number.POSITIVE_INFINITY,
      allowOverflow: true,
    });
    const lens = inferMentorGroupLens(group.adviceItems, group, context.targetRole);
    const modes = unique(group.adviceItems.map((item) => item.attributionMode || "verified_original"));
    const attributionMode = modes.length === 1 ? modes[0] : (modes.includes("stitched_lens") ? "stitched_lens" : "verified_original");
    const sourceDisclosure = sourceDisclosureFor(attributionMode);
    return {
      ...group,
      attributionMode,
      sourceDisclosure,
      mentorGroupLens: lens.lens,
      mentorGroupReason: lens.reason,
      adviceItems: group.adviceItems.map((item) => ({
        ...item,
        attributionMode: item.attributionMode || attributionMode,
        sourceDisclosure: item.sourceDisclosure || sourceDisclosureFor(item.attributionMode || attributionMode),
        mentorGroupLens: lens.lens,
        mentorGroupReason: lens.reason,
      })),
    };
  });
  const displayedKeys = new Set(limitedGroups.flatMap((group) => group.adviceItems || []).map(adviceExactKey));
  const missingItems = curatedItems.filter((item) => !displayedKeys.has(adviceExactKey(item))).sort(compareAdvice);
  if (missingItems.length) {
    for (const item of missingItems) {
      const displayFit = selectDisplayedMentorForAdvice(item, context.mentorPool || [], context, item.originalMentorSource);
      const displayed = displayFit.displayedMentorSource;
      if (!displayed || isMentorXProfile(displayed)) continue;
      const key = mentorGroupKey(displayed);
      let targetGroup = limitedGroups.find((group) => mentorGroupKey(group) === key);
      if (!targetGroup) {
        targetGroup = {
          mentorId: displayed.mentorId || key,
          mentorName: displayed.mentorName || "导师",
          company: displayed.company || "",
          companyLogo: mentorLogoFor(displayed),
          mentorTitle: displayed.mentorTitle || "",
          mentorSubtitle: displayed.mentorSubtitle || "",
          careerPathDisplay: displayed.careerPathDisplay || null,
          badges: displayed.badges || [],
          matchReason: displayFit.mentorFitReason || "",
          matchedProblems: [],
          adviceItems: [],
        };
        limitedGroups.push(targetGroup);
      }
      const slotKey = item.duplicateGroupKey || buildDuplicateGroupKey(item);
      if (targetGroup.adviceItems.some((existing) => (existing.duplicateGroupKey || buildDuplicateGroupKey(existing)) === slotKey)) continue;
      const attributionMode = inferAttributionMode(item, item.originalMentorSource, displayed);
      targetGroup.adviceItems.push({
        ...item,
        mentorSource: displayed,
        displayedMentorSource: displayed,
        attributionMode,
        sourceDisclosure: sourceDisclosureFor(attributionMode),
        mentorDisplayFit: displayFit.mentorDisplayFit,
        mentorFitReason: displayFit.mentorFitReason,
        displayMentorScore: displayFit.displayMentorScore,
      });
      displayedKeys.add(adviceExactKey(item));
    }
  }
  const remainingMissingItems = curatedItems
    .filter((item) => !displayedKeys.has(adviceExactKey(item)))
    .sort(compareAdvice);
  if (remainingMissingItems.length) {
    for (const item of remainingMissingItems) {
      const displayFit = selectDisplayedMentorForAdvice(item, context.mentorPool || [], context, item.originalMentorSource);
      let displayed = displayFit.displayedMentorSource;
      if (!displayed || isMentorXProfile(displayed)) {
        displayed = cleanMentorSource(selectRoleAwareMockDisplayedMentor(item, context, context.mentorPool || [])?.mentor);
      }
      if (!displayed || isMentorXProfile(displayed)) continue;
      const key = mentorGroupKey(displayed);
      let targetGroup = limitedGroups.find((group) => mentorGroupKey(group) === key);
      if (!targetGroup) {
        targetGroup = {
          mentorId: displayed.mentorId || key,
          mentorName: displayed.mentorName || "导师",
          company: displayed.company || "",
          companyLogo: mentorLogoFor(displayed),
          mentorTitle: displayed.mentorTitle || "",
          mentorSubtitle: displayed.mentorSubtitle || "",
          careerPathDisplay: displayed.careerPathDisplay || null,
          badges: displayed.badges || [],
          matchReason: displayFit.mentorFitReason || "",
          matchedProblems: [],
          adviceItems: [],
        };
        limitedGroups.push(targetGroup);
      }
      const slotKey = item.duplicateGroupKey || buildDuplicateGroupKey(item);
      if ((targetGroup.adviceItems || []).some((existing) =>
        adviceExactKey(existing) === adviceExactKey(item) ||
        (existing.duplicateGroupKey || buildDuplicateGroupKey(existing)) === slotKey
      )) continue;
      const attributionMode = inferAttributionMode(item, item.originalMentorSource, displayed);
      targetGroup.adviceItems.push({
        ...item,
        mentorSource: displayed,
        displayedMentorSource: displayed,
        attributionMode,
        sourceDisclosure: sourceDisclosureFor(attributionMode),
        mentorDisplayFit: displayFit.mentorDisplayFit,
        mentorFitReason: displayFit.mentorFitReason,
        displayMentorScore: displayFit.displayMentorScore,
      });
    }
  }
  const noMentorXGroups = replaceMentorXDisplayedGroups(limitedGroups, context);
  const balancedExternalGroups = redistributeOverloadedMentorGroups(noMentorXGroups, context, 5);
  const safeGroups = replaceUnsafeDisplayedGroups(balancedExternalGroups, context);
  const balancedGroups = balanceRoleAwareMockGroups(safeGroups, context, 5);
  const hardSafeGroups = hardCleanUnsafeReportGroups(balancedGroups, context);
  const finalBalancedGroups = balanceRoleAwareMockGroups(hardSafeGroups, context, 5);
  const refreshedGroups = finalBalancedGroups.map((group) => {
    const lens = inferMentorGroupLens(group.adviceItems, group, context.targetRole);
    const modes = unique(group.adviceItems.map((item) => item.attributionMode || "verified_original"));
    const attributionMode = modes.length === 1 ? modes[0] : (modes.includes("stitched_lens") ? "stitched_lens" : "verified_original");
    return {
      ...group,
      attributionMode,
      sourceDisclosure: sourceDisclosureFor(attributionMode),
      mentorGroupLens: lens.lens,
      mentorGroupReason: lens.reason,
      adviceItems: asArray(group.adviceItems).map((item) => ({
        ...item,
        mentorGroupLens: lens.lens,
        mentorGroupReason: lens.reason,
        sourceDisclosure: item.sourceDisclosure || sourceDisclosureFor(item.attributionMode || attributionMode),
      })),
    };
  });
  return dedupeReportAdviceTitles(refreshedGroups);
}

function buildCoverageSummary(curatedItems = [], context = {}) {
  const targetTags = unique(asArray(context.problemTags).map((item) => item.tag || item));
  const coveredTags = unique(curatedItems.flatMap((item) => item.relatedProblemTags || []))
    .filter((tag) => targetTags.includes(tag));
  const families = unique(curatedItems.map((item) => item.coverageFamily));
  return {
    totalProblemsDetected: targetTags.length,
    problemsCovered: coveredTags.length,
    coverageRatio: targetTags.length ? Number((coveredTags.length / targetTags.length).toFixed(3)) : 1,
    coveredProblemTags: coveredTags,
    uncoveredProblemTags: targetTags.filter((tag) => !coveredTags.includes(tag)),
    coverageFamilies: families,
    totalAdviceItems: curatedItems.length,
    targetAdviceCountMin: 7,
    targetAdviceCountMax: null,
    adviceCountStatus: curatedItems.length >= 7 ? "sufficient" : "candidate_pool_insufficient",
    curationMode: "problem_coverage_dedupe",
    shortageReason: curatedItems.length >= 7 ? "" : "Curated candidate pool had fewer than 7 non-duplicate, role-safe advice items.",
  };
}

function flattenMentorItems(mentorReport = {}) {
  return asArray(mentorReport.mentors).flatMap((mentor) =>
    asArray(mentor.adviceItems).map((item) => ({ ...item, _mentor: mentor }))
  );
}

function curateMentorAdvicePlan(input = {}) {
  const internalAtsResult = input.internalAtsResult || {};
  const context = {
    ...input,
    internalAtsResult,
    problemTags: asArray(internalAtsResult.problemTags),
    targetRole: input.targetRole || internalAtsResult.jobTitle || internalAtsResult.profile?.targetRole || "",
    avoidMentorXDisplay: input.avoidMentorXDisplay !== false,
  };
  const mentorReport = input.mentorReport || {};
  const rawItems = input.items || flattenMentorItems(mentorReport);
  const roleProfile = roleProfileFromContext(context);
  const mentorPool = buildMentorPool([
    ...asArray(mentorReport.mentors),
    ...asArray(input.mentorPool),
    ...asArray(input.candidateMentors),
    ...roleAwareMockMentors({ ...context, roleProfile }),
  ], rawItems);
  context.roleProfile = roleProfile;
  context.mentorPool = mentorPool;
  const curatedAdviceItems = curateAdviceItems(rawItems, context);
  const resultPageAdviceItems = selectResultPageAdviceItems(curatedAdviceItems, context);
  const reportPageMentorGroups = buildReportPageMentorGroups(
    curatedAdviceItems,
    asArray(mentorReport.mentors),
    context
  );
  return {
    curatedAdviceItems,
    resultPageAdviceItems,
    reportPageMentorGroups,
    coverageSummary: buildCoverageSummary(curatedAdviceItems, context),
  };
}

module.exports = {
  normalizeAdviceItemForCuration,
  inferCoverageFamily,
  inferActionFamily,
  inferActionSlot,
  buildDuplicateGroupKey,
  curateAdviceItems,
  selectResultPageAdviceItems,
  buildReportPageMentorGroups,
  inferMentorGroupLens,
  curateMentorAdvicePlan,
};
