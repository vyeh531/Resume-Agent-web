module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/ats/role-dictionary.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

let cachedDictionary = null;
function loadRoleDictionary() {
    if (cachedDictionary) return cachedDictionary;
    try {
        // require() is used so Vercel's bundler automatically includes the JSON
        // in the serverless function package (fs.readFileSync with a dynamic path
        // is not reliably bundled in serverless environments).
        cachedDictionary = (()=>{
            const e = new Error("Cannot find module '../public/ats_role_dictionary.json'");
            e.code = 'MODULE_NOT_FOUND';
            throw e;
        })().roles || [];
    } catch  {
        cachedDictionary = [];
    }
    return cachedDictionary;
}
function findRoleDictionaryEntry(jobTitle = "", jdText = "") {
    const roles = loadRoleDictionary();
    if (!roles.length) return null;
    const target = normalize(`${jobTitle} ${jdText}`).slice(0, 5000);
    let best = null;
    let bestScore = 0;
    for (const role of roles){
        const aliases = [
            role.canonical_role,
            role.position_title_original,
            ...role.target_role_aliases || []
        ].filter(Boolean);
        let score = 0;
        for (const alias of aliases){
            const cleanAlias = normalize(alias);
            if (!cleanAlias) continue;
            if (target.includes(cleanAlias)) score += 8 + cleanAlias.split(/\s+/).length;
            else {
                const overlap = tokenOverlap(cleanAlias, target);
                score += overlap * 4;
            }
        }
        if (score > bestScore) {
            best = role;
            bestScore = score;
        }
    }
    return bestScore >= 3 ? best : null;
}
function roleToProfile(role) {
    if (!role) return null;
    return {
        target_role: unique([
            role.canonical_role,
            role.position_title_original,
            ...role.target_role_aliases || []
        ].map(normalize).filter(Boolean)),
        core_skills: unique([
            ...role.core_skills_required || [],
            ...role.secondary_skills || []
        ].map(normalize)),
        tools: unique((role.tools_technologies || []).map(normalize)),
        action_verbs: unique((role.strong_action_verbs || []).map(normalize)),
        domain_keywords: unique([
            ...role.domain_keywords || [],
            ...role.experience_project_signals || [],
            ...role.deliverables_outputs || []
        ].map(normalize)),
        nice_to_have: unique([
            ...role.preferred_certs || [],
            ...role.education_background_keywords || []
        ].map(normalize))
    };
}
function normalize(value) {
    return String(value || "").toLowerCase().replace(/[^a-z0-9+#.\s/-]/g, " ").replace(/\s+/g, " ").trim();
}
function tokenOverlap(a, b) {
    const aTokens = new Set(a.split(/\s+/).filter((t)=>t.length > 2));
    if (!aTokens.size) return 0;
    let hits = 0;
    for (const token of aTokens){
        if (b.includes(token)) hits += 1;
    }
    return hits / aTokens.size;
}
function unique(items) {
    return [
        ...new Set(items.filter(Boolean))
    ];
}
module.exports = {
    findRoleDictionaryEntry,
    roleToProfile
};
}),
"[project]/src/ats/ats-scorer.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const { findRoleDictionaryEntry, roleToProfile } = __turbopack_context__.r("[project]/src/ats/role-dictionary.js [app-route] (ecmascript)");
const STOP_WORDS = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "of",
    "in",
    "to",
    "for",
    "is",
    "are",
    "be",
    "on",
    "at",
    "with",
    "that",
    "this",
    "we",
    "you",
    "our",
    "your",
    "as",
    "by",
    "it",
    "its",
    "from",
    "will",
    "can",
    "have",
    "has",
    "been",
    "not",
    "all",
    "also",
    "more",
    "other",
    "their",
    "than",
    "into",
    "was",
    "were",
    "but",
    "may",
    "use",
    "used",
    "using",
    "per",
    "new",
    "strong",
    "ability",
    "experience",
    "including",
    "such",
    "both",
    "based",
    "role",
    "work",
    "team",
    "make",
    "well",
    "able",
    "good",
    "any",
    "who",
    "how",
    "what",
    "they",
    "each",
    "when",
    "about",
    "then",
    "some",
    "these",
    "those",
    "there",
    "here",
    "time",
    "very",
    "just",
    "like",
    "over",
    "only",
    "which",
    "after",
    "before",
    "while",
    "need",
    "should",
    "would",
    "could",
    "them",
    "had",
    "within",
    "across",
    "responsibilities",
    "requirements",
    "preferred",
    "qualification",
    "qualifications",
    "candidate",
    "company",
    "business",
    "hiring",
    "distinguished",
    "full-service",
    "full",
    "service",
    "firm",
    "organization",
    "located",
    "seeking",
    "join",
    "provide",
    "provides",
    "providing",
    "client",
    "clients",
    "services",
    "globally",
    "global",
    "professional",
    "professionals",
    "excellent",
    "highly",
    "leading",
    "established",
    "committed",
    "dedicated",
    "opportunity",
    "position",
    "office",
    "include",
    "includes",
    "included",
    "responsibility",
    "responsibilities",
    "website",
    "http",
    "https",
    "www",
    "com",
    "net",
    "org",
    "inc",
    "llc",
    "ltd",
    "corp",
    "corporation",
    "associates",
    "group",
    "partners",
    "zhang",
    // Job boards & recruiting platforms — should never be keywords
    "linkedin",
    "indeed",
    "glassdoor",
    "handshake",
    "ziprecruiter",
    "monster",
    "careerbuilder",
    "lever",
    "greenhouse",
    "workday",
    "taleo",
    "jobvite",
    // Social media platforms (not developer tools)
    "twitter",
    "facebook",
    "instagram",
    "tiktok",
    "snapchat",
    "pinterest",
    "youtube",
    "reddit",
    "quora",
    "medium",
    "substack",
    "tumblr",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "branch",
    "branches",
    "offices",
    "location",
    "locations",
    "additional",
    "headquarter",
    "headquarters",
    "headquartered",
    "based",
    "california",
    "seattle",
    "new",
    "york",
    "san",
    "francisco",
    "los",
    "angeles",
    "chicago",
    "boston",
    "austin",
    "dallas",
    "houston",
    "washington",
    "remote",
    "hybrid",
    "entry",
    "maintain",
    "records",
    "timely",
    "basis",
    "necessary",
    "adjustments",
    "federal",
    "express",
    "collaborates",
    "providers",
    "exceptional",
    "reliable",
    "cost-efficient",
    "real-time",
    "tracking",
    "advanced",
    "technology",
    "streamline",
    "enhancing",
    "transparency",
    "flexibility",
    "operating",
    "high-density",
    "cities",
    "regions",
    "tailor",
    "specific",
    "needs",
    "e-commerce",
    "customer-centric",
    "guarantees",
    "dependable",
    "experiences"
]);
const STRONG_VERBS = new Set([
    "led",
    "built",
    "developed",
    "designed",
    "implemented",
    "launched",
    "improved",
    "increased",
    "reduced",
    "created",
    "managed",
    "optimized",
    "analyzed",
    "deployed",
    "architected",
    "owned",
    "coordinated",
    "delivered",
    "scaled",
    "automated",
    "engineered",
    "established",
    "drove",
    "executed",
    "spearheaded",
    "streamlined",
    "accelerated",
    "collaborated",
    "partnered",
    "produced",
    "generated",
    "secured",
    "negotiated",
    "trained",
    "mentored",
    "diagnosed",
    "integrated",
    "migrated",
    "refactored",
    "leveraged",
    "authored",
    "researched",
    "performed",
    "conducted",
    "translated",
    "identified",
    "supported",
    "directed",
    "modeled",
    "forecasted",
    "validated",
    "tested",
    "prepared",
    "reconciled",
    "processed",
    "reviewed",
    // additional common resume verbs often missing from detection
    "split",
    "converted",
    "extracted",
    "achieved",
    "enhanced",
    "expanded",
    "eliminated",
    "introduced",
    "transformed",
    "configured",
    "enabled",
    "constructed",
    "rewrote",
    "adopted",
    "overhauled",
    "compiled",
    "applied",
    "restructured",
    "upgraded",
    "unified",
    "connected",
    "controlled",
    "prevented",
    "maintained",
    "resolved",
    "fixed",
    "shipped",
    "extended",
    "defined",
    "proposed",
    "acquired",
    "retained",
    "measured",
    "monitored",
    "documented",
    "published",
    "presented",
    "influenced",
    "prioritized",
    "evaluated",
    "standardized",
    "modernized",
    "containerized",
    "orchestrated",
    "provisioned",
    "instrumented",
    "debugged",
    "profiled",
    "indexed",
    "sharded",
    "cached",
    "batched",
    "parallelized",
    "vectorized",
    "designed",
    "built",
    "launched",
    "implemented"
]);
// Verb / synonym expansion map for soft skills.
// When a JD requires these skill terms and the resume contains the listed
// action verbs or synonyms, it counts as a match.
// e.g. "led" / "lead" in a resume → matches "leadership" in the JD
//      "collaborated" / "partnered" → matches "cross-functional collaboration"
const SKILL_VERB_MAP = {
    // ── Leadership ────────────────────────────────────────────────────────────
    "leadership": [
        "lead",
        "led",
        "leads",
        "headed",
        "heading",
        "directed",
        "supervised",
        "oversaw",
        "managed"
    ],
    "leadership skills": [
        "lead",
        "led",
        "leads",
        "headed",
        "supervised",
        "oversaw"
    ],
    "team leadership": [
        "lead",
        "led",
        "supervised",
        "oversaw",
        "managed team",
        "team lead"
    ],
    "leadership development": [
        "lead",
        "led",
        "mentored",
        "coached",
        "developed team"
    ],
    "people management": [
        "managed",
        "supervised",
        "led",
        "directed",
        "oversaw"
    ],
    // ── Cross-functional / collaboration ──────────────────────────────────────
    "cross-functional": [
        "collaborate",
        "collaborated",
        "collaborating",
        "collaboration",
        "cross-team",
        "partnered",
        "coordinated"
    ],
    "cross-functional collaboration": [
        "collaborate",
        "collaborated",
        "collaborating",
        "collaboration",
        "cross-team",
        "partnered",
        "coordinated",
        "aligned"
    ],
    "collaboration": [
        "collaborate",
        "collaborated",
        "collaborating",
        "partnered",
        "coordinated"
    ],
    "cross-team collaboration": [
        "collaborate",
        "collaborated",
        "cross-team",
        "partnered",
        "coordinated"
    ],
    "stakeholder management": [
        "collaborate",
        "collaborated",
        "partnered",
        "coordinated",
        "aligned",
        "communicated"
    ]
};
const SEMANTIC_MATCH_MAP = {
    "software development engineer": [
        "software engineer",
        "software developer",
        "sde",
        "swe"
    ],
    "cloud-native architectures": [
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
        "ci/cd",
        "cloud infrastructure",
        "cloud architecture"
    ],
    "cloud native architectures": [
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
        "ci/cd",
        "cloud infrastructure",
        "cloud architecture"
    ],
    "communicate effectively": [
        "collaborated",
        "communicated",
        "presented",
        "partnered",
        "aligned",
        "stakeholder communication"
    ],
    "microservices": [
        "microservice",
        "backend services",
        "distributed services",
        "service-oriented architecture",
        "service oriented architecture"
    ],
    "technical documentation": [
        "documentation",
        "documented",
        "technical design document",
        "design docs",
        "runbooks"
    ],
    "operational excellence": [
        "observability",
        "monitoring",
        "incident response",
        "reliability",
        "automation",
        "continuous improvement"
    ],
    "code reviews": [
        "code review",
        "reviewed code",
        "pull request reviews",
        "pr reviews"
    ],
    "object-oriented design": [
        "object oriented design",
        "oop",
        "object-oriented programming",
        "object oriented programming"
    ],
    "ci/cd": [
        "continuous integration",
        "continuous deployment",
        "github actions",
        "jenkins",
        "gitlab ci"
    ],
    "aws": [
        "amazon web services"
    ],
    "debugging": [
        "troubleshooting",
        "diagnosed",
        "debugged",
        "root cause analysis"
    ],
    "data structures": [
        "data structure"
    ],
    "algorithms": [
        "algorithm"
    ]
};
const DIMENSION_MAX = {
    A: 8,
    B: 7,
    C: 12,
    D: 45,
    E: 5,
    F: 23
};
const SOFT_KEYWORD_TERMS = new Set([
    "communication",
    "communicate effectively",
    "communicated",
    "collaboration",
    "cross-functional collaboration",
    "cross-team collaboration",
    "stakeholder management",
    "stakeholder communication",
    "leadership",
    "team leadership",
    "ownership",
    "operational excellence",
    "problem solving",
    "problem-solving",
    "critical thinking",
    "mentoring",
    "mentored",
    "partnered",
    "coordinated",
    "aligned",
    "presentation skills"
]);
const MUST_HAVE_KEYWORDS = new Set([
    "software development engineer",
    "data structures",
    "algorithms",
    "object-oriented design",
    "object oriented design",
    "object-oriented programming",
    "object oriented programming",
    "aws",
    "code reviews",
    "code review",
    "debugging",
    "ci/cd",
    "continuous integration",
    "continuous deployment"
]);
const ROLE_RELEVANT_BOOSTERS = new Set([
    "distributed systems",
    "microservices",
    "cloud-native architecture",
    "cloud-native architectures",
    "cloud native architecture",
    "cloud native architectures",
    "nosql",
    "technical documentation",
    "operational excellence"
]);
const OPTIONAL_RISKY_KEYWORDS = new Set([
    "quantum computing",
    "game development",
    "embedded systems",
    "rust",
    "c++"
]);
const ROLE_DISPLAY_NAMES = {
    logistics_operations: "物流运营",
    accounting: "会计",
    software_engineer: "软件工程师",
    data_analyst: "数据分析师",
    data_scientist: "数据科学家",
    product_manager: "产品经理",
    financial_analyst: "金融/财务分析师",
    marketing: "市场营销",
    general: "通用岗位"
};
function formatRole(roleId) {
    return ROLE_DISPLAY_NAMES[roleId] || roleId.replace(/_/g, " ");
}
const WEAK_PHRASES = [
    "helped",
    "assisted",
    "worked on",
    "worked with",
    "responsible for",
    "participated in",
    "involved in",
    "did",
    "made",
    "used"
];
// Soft-skill indicator keywords for bullet-point skill-balance analysis.
// These terms, when found in bullet text, count as "soft skill" mentions.
const SOFT_SKILL_KEYWORDS = new Set([
    // Leadership & management
    "leadership",
    "managed",
    "directed",
    "supervised",
    "mentored",
    "coached",
    "delegated",
    "empowered",
    "influenced",
    // Collaboration & teamwork
    "collaboration",
    "collaborated",
    "teamwork",
    "cross-functional",
    "partnered",
    "coordinated",
    "aligned",
    // Communication & facilitation
    "communicated",
    "presented",
    "presentation",
    "facilitated",
    "negotiated",
    "persuaded",
    // Problem-solving & strategic thinking
    "problem-solving",
    "critical thinking",
    "decision-making",
    "strategic",
    "innovation",
    "innovative",
    "creative",
    "creativity",
    "analytical",
    // Organization & planning
    "prioritized",
    "organized",
    "multitasked",
    "time management",
    "planned",
    // Interpersonal & professional attributes
    "stakeholder",
    "conflict resolution",
    "adaptable",
    "accountability",
    "ownership",
    "initiative",
    "relationship-building",
    // Training & people development
    "trained",
    "onboarded"
]);
const ROLE_FAMILIES = [
    {
        role: "logistics_operations",
        terms: [
            "揽收",
            "调度",
            "物流",
            "仓库",
            "库管",
            "司机",
            "客服",
            "运营",
            "末端",
            "配送",
            "异常",
            "卡量",
            "时效",
            "完结率",
            "pickup",
            "dispatch",
            "logistics",
            "warehouse",
            "last-mile",
            "parcel"
        ]
    },
    {
        role: "accounting",
        terms: [
            "accountant",
            "staff accountant",
            "accounting",
            "bookkeeping",
            "payroll",
            "tax preparation",
            "quickbooks",
            "financial statements",
            "reconciliation"
        ]
    },
    {
        role: "software_engineer",
        terms: [
            "software engineer",
            "swe",
            "backend",
            "frontend",
            "full stack",
            "full-stack",
            "api",
            "microservice",
            "react",
            "node",
            "java",
            "python"
        ]
    },
    {
        role: "data_analyst",
        terms: [
            "data analyst",
            "business analyst",
            "analytics",
            "sql",
            "tableau",
            "power bi",
            "excel",
            "dashboard"
        ]
    },
    {
        role: "data_scientist",
        terms: [
            "data scientist",
            "machine learning",
            "ml",
            "modeling",
            "experiment",
            "statistics",
            "python",
            "pandas"
        ]
    },
    {
        role: "product_manager",
        terms: [
            "product manager",
            "pm",
            "roadmap",
            "user research",
            "stakeholder",
            "metrics",
            "launch"
        ]
    },
    {
        role: "financial_analyst",
        terms: [
            "financial analyst",
            "finance",
            "valuation",
            "forecast",
            "investment",
            "portfolio",
            "excel"
        ]
    },
    {
        role: "marketing",
        terms: [
            "marketing",
            "campaign",
            "brand",
            "content",
            "seo",
            "growth",
            "social media"
        ]
    }
];
const CATEGORY_PHRASES = {
    tools: [
        // Finance / Data / Software
        "quickbooks",
        "excel",
        "microsoft excel",
        "tableau",
        "power bi",
        "sql",
        "python",
        "sap",
        "netsuite",
        "xero",
        "sage",
        "oracle",
        "salesforce",
        // 會計 / 稅務專用軟體
        "cch axcess",
        "proseries",
        "lacerte",
        "drake tax",
        "ultratax",
        "cch prosystem",
        "gosystem",
        "taxslayer",
        "atx",
        "checkpoint",
        "adp",
        "paychex",
        "gusto",
        "bill.com",
        "expensify",
        "concur",
        "freshbooks",
        "wave",
        "zoho books",
        "react",
        "node.js",
        "next.js",
        "typescript",
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
        // AI / ML tools
        "pytorch",
        "tensorflow",
        "keras",
        "opencv",
        "scikit-learn",
        "hugging face",
        "huggingface",
        "transformers",
        "diffusers",
        "stable diffusion",
        "comfyui",
        "controlnet",
        "lora",
        "sdxl",
        "flux",
        "langchain",
        "llamaindex",
        "llama index",
        "pinecone",
        "weaviate",
        "streamlit",
        "gradio",
        "fastapi",
        "pandas",
        "numpy",
        "matplotlib",
        "jupyter",
        "spark",
        "airflow",
        "dbt",
        "snowflake",
        "bigquery",
        "mongodb",
        "postgresql",
        "redis",
        "elasticsearch",
        // Engineering tools
        "autocad",
        "solidworks",
        "matlab",
        "ansys",
        "labview",
        "simulink",
        "catia",
        "creo",
        "nx",
        "plc",
        "altium",
        "multisim",
        "pspice",
        // Design / UX / Creative tools
        "figma",
        "sketch",
        "adobe xd",
        "illustrator",
        "photoshop",
        "indesign",
        "after effects",
        "premiere pro",
        "lightroom",
        "canva",
        "procreate",
        "blender",
        "cinema 4d",
        "maya",
        "zbrush",
        "davinci resolve",
        "final cut pro",
        "invision",
        "zeplin",
        "framer",
        // Life Sciences / Healthcare tools
        "spss",
        "graphpad",
        "benchling",
        "spotfire",
        "veeva",
        "epic",
        "cerner",
        "flowjo",
        "lims",
        "medidata",
        "iqvia",
        // Marketing tools
        "google analytics",
        "hubspot",
        "mailchimp",
        "hootsuite",
        "semrush",
        "ahrefs",
        "google ads",
        "meta ads",
        "marketo",
        "pardot",
        "adobe analytics",
        "sprout social",
        "buffer",
        "klaviyo",
        // Semiconductor / EDA tools
        "verilog",
        "vhdl",
        "systemverilog",
        "cadence",
        "synopsys",
        "vivado",
        "quartus",
        "hspice",
        "modelsim",
        "mentor graphics",
        // IT / Security tools
        "terraform",
        "ansible",
        "jenkins",
        "gitlab ci",
        "github actions",
        "splunk",
        "datadog",
        "prometheus",
        "grafana",
        "wireshark",
        "servicenow",
        "active directory",
        "jira",
        "confluence",
        // Legal tools
        "westlaw",
        "lexisnexis",
        "bloomberg law",
        // Statistics / Research tools
        "stata",
        "rstudio",
        "r programming",
        "sas",
        "eviews",
        "nvivo",
        "maxqda",
        "atlas.ti",
        // Finance / Banking / IB tools
        "bloomberg terminal",
        "capital iq",
        "factset",
        "refinitiv",
        "pitchbook",
        "argus",
        "dealogic",
        // HR / People Ops tools
        "workday",
        "bamboohr",
        "rippling",
        "lattice",
        "culture amp",
        "15five",
        "paylocity",
        "ukg",
        "ceridian",
        "icims",
        "greenhouse",
        "lever",
        // Architecture / Civil / GIS tools
        "revit",
        "arcgis",
        "qgis",
        "rhino",
        "grasshopper",
        "sketchup",
        "civil 3d",
        "navisworks",
        "infraworks",
        // Productivity / Project Management tools
        "powerpoint",
        "microsoft powerpoint",
        "microsoft word",
        "google workspace",
        "google sheets",
        "google slides",
        "google docs",
        "notion",
        "asana",
        "trello",
        "monday.com",
        "clickup",
        "smartsheet",
        "ms project",
        "basecamp",
        // Customer Success / Support tools
        "zendesk",
        "intercom",
        "freshdesk",
        "gainsight",
        "totango",
        "churnzero",
        // Chemical / Process Engineering tools
        "aspen plus",
        "aspen hysys",
        "chemcad",
        "hysys",
        // Healthcare / Clinical EHR tools
        "meditech",
        "allscripts",
        "athenahealth",
        "nextgen",
        // Education / LMS tools
        "canvas lms",
        "blackboard",
        "moodle",
        "google classroom",
        // Additional SW Engineering — languages & frameworks
        "vue.js",
        "angular",
        "svelte",
        "django",
        "flask",
        "spring",
        "spring boot",
        "express.js",
        "nestjs",
        "ruby on rails",
        "swift",
        "kotlin",
        "flutter",
        "dart",
        "react native",
        "c#",
        "c sharp",
        "golang",
        "scala",
        "mysql",
        "sqlite",
        "cassandra",
        "dynamodb",
        "supabase",
        "firebase",
        "celery",
        "rabbitmq",
        "kafka",
        "nginx",
        "linux",
        "bash",
        "shell scripting",
        "java",
        "ruby",
        "php",
        "perl",
        "haskell",
        "elixir",
        "webpack",
        "vite",
        "babel",
        "eslint",
        "jest",
        "pytest",
        "selenium",
        "postman",
        "graphql",
        "grpc",
        "openapi",
        "swagger",
        "langsmith",
        "openai api",
        "anthropic api",
        "cohere",
        "vertex ai",
        "dvc",
        "mlflow",
        "weights and biases",
        "wandb",
        "ray",
        "triton",
        "tableau prep",
        "looker",
        "metabase",
        "power automate",
        "apache flink",
        "hadoop",
        "hive",
        "presto",
        "databricks"
    ],
    core_skills: [
        // Finance / Accounting
        "tax preparation",
        "bookkeeping",
        "payroll",
        "financial statements",
        "bank reconciliation",
        "account reconciliation",
        "reconciliation",
        "accounts payable",
        "accounts receivable",
        "general ledger",
        "journal entries",
        "month-end close",
        "data analysis",
        "data visualization",
        "machine learning",
        "financial modeling",
        "user research",
        "product roadmap",
        "a/b testing",
        "dashboarding",
        "reporting",
        "software development engineer",
        "software development",
        "data structures",
        "algorithms",
        "object-oriented design",
        "object oriented design",
        "code reviews",
        "code review",
        "debugging",
        "technical documentation",
        "operational excellence",
        // Chinese logistics
        "揽收调度",
        "揽收数据分析",
        "数据分析",
        "资源调配",
        "成本控制",
        "流程优化",
        "报告制作",
        "应急响应",
        "多任务处理",
        "团队协作",
        "客服经验",
        // AI / ML skills
        "fine-tuning",
        "model fine-tuning",
        "model training",
        "model evaluation",
        "dataset curation",
        "inference optimization",
        "prompt engineering",
        "image generation",
        "text generation",
        "computer vision",
        "object detection",
        "image segmentation",
        "model deployment",
        "reinforcement learning",
        "transfer learning",
        "retrieval augmented generation",
        "rag",
        "vector search",
        "embedding",
        "deep learning",
        "neural network",
        "model optimization",
        "visual reasoning",
        "multi-step reasoning",
        // 管理 / 商科
        "strategic planning",
        "process improvement",
        "stakeholder management",
        "cross-functional collaboration",
        "project management",
        "change management",
        "decision making",
        "decision-making",
        "problem solving",
        "problem-solving",
        "business analysis",
        "performance management",
        "team leadership",
        "critical thinking",
        "time management",
        "presentation skills",
        "analytical skills",
        "leadership development",
        "organizational skills",
        // Engineering
        "lean manufacturing",
        "six sigma",
        "gd&t",
        "quality control",
        "fmea",
        "root cause analysis",
        "design verification",
        "systems engineering",
        "process engineering",
        "finite element analysis",
        "tolerance analysis",
        "product development",
        "failure analysis",
        "design for manufacturability",
        "mechanical design",
        "electrical design",
        "circuit design",
        "signal processing",
        "embedded systems",
        "firmware development",
        // Design / UX / Creative
        "wireframing",
        "prototyping",
        "usability testing",
        "user testing",
        "design systems",
        "typography",
        "color theory",
        "visual design",
        "interaction design",
        "motion design",
        "ui design",
        "ux research",
        "information architecture",
        "accessibility",
        "responsive design",
        "brand identity",
        "art direction",
        "creative direction",
        // Life Sciences / Healthcare
        "clinical trials",
        "clinical research",
        "gcp",
        "gmp",
        "fda regulations",
        "irb",
        "hipaa",
        "protocol development",
        "biostatistics",
        "lab techniques",
        "pcr",
        "elisa",
        "cell culture",
        "western blot",
        "next generation sequencing",
        "medical writing",
        "regulatory affairs",
        "pharmacovigilance",
        "data integrity",
        "drug development",
        "formulation",
        // Marketing / Communications
        "seo",
        "sem",
        "content marketing",
        "social media marketing",
        "email marketing",
        "digital marketing",
        "paid advertising",
        "ppc",
        "campaign management",
        "brand management",
        "copywriting",
        "content strategy",
        "influencer marketing",
        "conversion rate optimization",
        "lead generation",
        "marketing analytics",
        "public relations",
        "media relations",
        // Semiconductor / Electronics
        "vlsi design",
        "rtl design",
        "digital ic design",
        "analog ic design",
        "fpga design",
        "chip design",
        "timing analysis",
        "power analysis",
        "design for testability",
        "dft",
        "hardware description language",
        "circuit simulation",
        "place and route",
        "synthesis",
        "logic design",
        "hardware verification",
        "silicon validation",
        // IT / Security
        "cybersecurity",
        "network security",
        "information security",
        "penetration testing",
        "vulnerability assessment",
        "incident response",
        "identity and access management",
        "iam",
        "zero trust",
        "encryption",
        "firewall management",
        "siem",
        "threat detection",
        "network administration",
        "system administration",
        "it infrastructure",
        "cloud security",
        "devsecops",
        "disaster recovery",
        "business continuity",
        "itil",
        // Legal / Compliance
        "legal research",
        "contract drafting",
        "contract review",
        "litigation support",
        "due diligence",
        "regulatory compliance",
        "corporate governance",
        "intellectual property",
        "legal writing",
        "compliance monitoring",
        "policy development",
        "regulatory reporting",
        // Environmental / Sustainability
        "environmental impact assessment",
        "life cycle assessment",
        "lca",
        "ghg inventory",
        "carbon footprint",
        "sustainability reporting",
        "esg reporting",
        "environmental compliance",
        "waste management",
        "air quality monitoring",
        "remediation",
        "iso 14001",
        // HR / Talent Acquisition
        "talent acquisition",
        "recruiting",
        "sourcing",
        "candidate screening",
        "employee relations",
        "performance review",
        "compensation and benefits",
        "compensation & benefits",
        "benefits administration",
        "workforce planning",
        "succession planning",
        "learning and development",
        "l&d",
        "employee engagement",
        "diversity and inclusion",
        "dei",
        "hr business partner",
        "hrbp",
        "hris",
        "talent management",
        "employer branding",
        "organizational design",
        "headcount planning",
        "attrition analysis",
        "people analytics",
        "onboarding program",
        "offboarding",
        "exit interviews",
        // Management Consulting
        "case analysis",
        "structured problem solving",
        "hypothesis-driven",
        "market sizing",
        "benchmarking",
        "operating model",
        "management consulting",
        "strategy consulting",
        "business case development",
        "go-to-market strategy",
        "competitive benchmarking",
        "issue tree",
        "mece",
        "top-down communication",
        "executive communication",
        "client-facing",
        "stakeholder alignment",
        // Economics / Policy / Quantitative Research
        "econometrics",
        "economic modeling",
        "policy analysis",
        "cost-benefit analysis",
        "causal inference",
        "panel data",
        "time series analysis",
        "microeconomics",
        "macroeconomics",
        "quantitative research",
        "qualitative research",
        "survey design",
        "survey methodology",
        "literature review",
        "academic research",
        "research design",
        "statistical modeling",
        "instrumental variables",
        "difference-in-differences",
        "regression discontinuity",
        "natural experiment",
        "randomized controlled trial",
        "rct",
        // Supply Chain / Operations Management
        "procurement",
        "strategic sourcing",
        "demand planning",
        "inventory management",
        "vendor management",
        "supplier management",
        "supply chain management",
        "logistics management",
        "warehouse management",
        "fulfillment",
        "order management",
        "capacity planning",
        "s&op",
        "sales and operations planning",
        "rfp management",
        "contract negotiation",
        "purchase order management",
        "supplier evaluation",
        "supplier development",
        "vendor onboarding",
        "last-mile logistics",
        "reverse logistics",
        "kitting",
        // Architecture / Civil Engineering / Urban Planning
        "building information modeling",
        "bim",
        "construction documents",
        "structural design",
        "site analysis",
        "urban planning",
        "urban design",
        "zoning",
        "land use planning",
        "construction management",
        "cost estimating",
        "sustainable design",
        "passive design",
        "landscape design",
        "civil engineering",
        "geotechnical engineering",
        "transportation planning",
        "stormwater management",
        "traffic engineering",
        "pavement design",
        "foundation design",
        "retaining wall design",
        "site grading",
        // Education / Instructional Design
        "curriculum development",
        "lesson planning",
        "instructional design",
        "e-learning",
        "learning management system",
        "lms",
        "classroom management",
        "differentiated instruction",
        "assessment design",
        "student outcomes",
        "pedagogy",
        "tutoring",
        "academic advising",
        "educational technology",
        "edtech",
        "formative assessment",
        "summative assessment",
        "project-based learning",
        "blended learning",
        "distance learning",
        // Social Sciences / Psychology / Research Methods
        "content analysis",
        "thematic analysis",
        "ethnography",
        "focus groups",
        "interview research",
        "academic writing",
        "psychological assessment",
        "behavior analysis",
        "cognitive research",
        "discourse analysis",
        "grounded theory",
        "mixed methods",
        "action research",
        // Healthcare / Nursing / Clinical (non-lab)
        "patient care",
        "clinical assessment",
        "patient education",
        "medication administration",
        "electronic health records",
        "ehr",
        "emr",
        "triage",
        "care coordination",
        "population health",
        "public health",
        "epidemiology",
        "community health",
        "health informatics",
        "nursing",
        "patient advocacy",
        "discharge planning",
        "clinical documentation",
        "health coaching",
        "case management",
        // Chemical Engineering / Process
        "chemical process design",
        "reaction engineering",
        "heat transfer",
        "mass transfer",
        "thermodynamics",
        "separation processes",
        "process simulation",
        "process safety",
        "hazop",
        "process optimization",
        "scale-up",
        "pilot plant",
        "distillation",
        "absorption",
        "extraction",
        // Aerospace / Advanced Mechanical
        "aerodynamics",
        "computational fluid dynamics",
        "cfd",
        "structural mechanics",
        "propulsion systems",
        "systems integration",
        "orbital mechanics",
        "avionics",
        "flight dynamics",
        "astrodynamics",
        "composite materials",
        "fatigue analysis",
        // Customer Success / Account Management
        "customer success",
        "customer onboarding",
        "renewal management",
        "account management",
        "churn reduction",
        "upsell",
        "cross-sell",
        "quarterly business review",
        "qbr",
        "customer health scoring",
        "voice of customer",
        "net promoter score",
        "nps management",
        "customer retention",
        "product adoption",
        "time to value",
        // Investment / Finance — Advanced
        "dcf analysis",
        "discounted cash flow",
        "financial due diligence",
        "lbo modeling",
        "comparable company analysis",
        "precedent transactions",
        "capital markets",
        "portfolio management",
        "risk management",
        "asset management",
        "investment analysis",
        "equity research",
        "fixed income",
        "derivatives",
        "options pricing",
        "hedge fund",
        "private equity",
        "venture capital",
        "mergers and acquisitions",
        // Sales / Business Development
        "sales strategy",
        "pipeline management",
        "account planning",
        "business development",
        "crm management",
        "cold outreach",
        "prospecting",
        "quota attainment",
        "revenue generation",
        "solution selling",
        "consultative selling",
        // Operations Research / Optimization
        "linear programming",
        "integer programming",
        "stochastic modeling",
        "simulation modeling",
        "operations research",
        "queuing theory",
        "network optimization",
        "combinatorial optimization",
        // Communications / Journalism / Media
        "journalism",
        "news writing",
        "editorial",
        "media production",
        "video production",
        "audio production",
        "podcast production",
        "broadcast journalism",
        "investigative reporting",
        "feature writing",
        "press release",
        "media outreach",
        // Social Work / Nonprofit
        "community organizing",
        "crisis intervention",
        "counseling",
        "social work",
        "child welfare",
        "advocacy",
        "program evaluation",
        "grant writing",
        "fundraising",
        "volunteer management",
        "nonprofit management",
        "community development"
    ],
    domain_keywords: [
        // Finance / Accounting
        "cpa",
        "accounting",
        "audit",
        "tax",
        "gaap",
        "kpi",
        "customer analytics",
        "retention",
        "revenue",
        "forecasting",
        "valuation",
        "etl",
        "api",
        "microservices",
        "stakeholder communication",
        "client communication",
        "distributed systems",
        "cloud-native architecture",
        "cloud-native architectures",
        "cloud native architecture",
        "cloud native architectures",
        "nosql",
        // Chinese logistics
        "揽收",
        "调度",
        "仓库",
        "库管",
        "司机",
        "客服",
        "时效",
        "揽收率",
        "异常卡",
        "重复卡",
        "人效模型",
        "卡量",
        "完结率",
        "异常原因",
        "节假日",
        "促销期",
        "卸车",
        "分拨",
        "值班",
        "系统报警",
        "last-mile delivery",
        "parcel delivery",
        "routing",
        "dispatch",
        // AI / ML domain
        "generative ai",
        "diffusion model",
        "foundation model",
        "large language model",
        "llm",
        "nlp",
        "natural language processing",
        "multimodal",
        "text-to-image",
        "image-to-image",
        "latent diffusion",
        "open source",
        "open-source",
        "mlops",
        "production ml",
        "model serving",
        "model inference",
        "batch inference",
        "prompt-to-image",
        "layout-to-graphic",
        "creative ai",
        "design automation",
        "brand design",
        "visual layout",
        "design system",
        "visual ai",
        "image synthesis",
        "ux",
        // 管理 / 商科
        "operations",
        "customer service",
        "business strategy",
        "business process",
        "cross-functional",
        "organizational development",
        "business development",
        "performance metrics",
        "continuous improvement",
        "strategic initiative",
        "supply chain",
        "policy",
        "procedure",
        "leadership pipeline",
        "corporate strategy",
        "go-to-market",
        "market analysis",
        "competitive analysis",
        "budget management",
        "cost reduction",
        // Engineering
        "manufacturing",
        "production",
        "quality assurance",
        "iso",
        "osha",
        "r&d",
        "research and development",
        "material science",
        "thermal analysis",
        "structural analysis",
        "fluid dynamics",
        "cad",
        "cam",
        "automation",
        "robotics",
        "maintenance",
        "reliability",
        "safety",
        "regulatory standards",
        // Design / UX / Creative
        "user experience",
        "user interface",
        "design thinking",
        "human-centered design",
        "visual storytelling",
        "brand guidelines",
        "style guide",
        "design sprint",
        "design critique",
        "iteration",
        "creative brief",
        "storyboard",
        "illustration",
        "animation",
        // Life Sciences / Healthcare
        "pharmaceutical",
        "biotechnology",
        "clinical data management",
        "patient safety",
        "adverse events",
        "ind",
        "nda",
        "medical device",
        "healthcare compliance",
        "life sciences",
        "biopharma",
        "genomics",
        "proteomics",
        "clinical operations",
        "translational research",
        "preclinical",
        "biomarker",
        "therapeutic",
        "drug discovery",
        // Marketing / Communications
        "brand awareness",
        "engagement",
        "impressions",
        "reach",
        "click-through rate",
        "ctr",
        "roi",
        "cost per acquisition",
        "cpa",
        "customer acquisition",
        "demand generation",
        "inbound marketing",
        "outbound marketing",
        "growth hacking",
        "marketing funnel",
        "b2b marketing",
        "b2c marketing",
        "media buying",
        "sponsorship",
        // Semiconductor / Electronics
        "semiconductor",
        "integrated circuit",
        "system on chip",
        "soc",
        "asic",
        "processor design",
        "memory design",
        "rf design",
        "mixed-signal",
        "tape-out",
        "foundry",
        "process node",
        "eda tools",
        "hardware design",
        "embedded hardware",
        // IT / Security
        "cybersecurity",
        "threat intelligence",
        "malware analysis",
        "data breach",
        "patch management",
        "endpoint security",
        "network monitoring",
        "nist",
        "cis controls",
        "gdpr",
        "ccpa",
        "sox",
        "compliance framework",
        "it governance",
        "help desk",
        "technical support",
        "infrastructure",
        // Legal / Compliance
        "corporate law",
        "securities law",
        "employment law",
        "mergers and acquisitions",
        "regulatory framework",
        "data privacy",
        "compliance program",
        "discovery",
        "case management",
        "contract management",
        "risk mitigation",
        "legal counsel",
        // Environmental / Sustainability
        "esg",
        "sustainability",
        "carbon neutral",
        "net zero",
        "renewable energy",
        "climate change",
        "greenhouse gas",
        "ghg",
        "environmental policy",
        "leed",
        "circular economy",
        "biodiversity",
        "corporate sustainability",
        "green chemistry",
        "decarbonization",
        // Macro — broad industry / business strategy concepts
        "digital transformation",
        "business model",
        "value proposition",
        "competitive landscape",
        "industry trends",
        "market dynamics",
        "market expansion",
        "enterprise",
        "platform",
        "ecosystem",
        "saas",
        "b2b",
        "b2c",
        "product-market fit",
        "revenue model",
        "innovation",
        "scale",
        "scalability",
        "data-driven",
        "growth strategy",
        "organizational change",
        "business intelligence",
        "value creation",
        "digital strategy",
        "disruption",
        "venture",
        "economic impact",
        "industry landscape",
        "macro environment",
        "strategic alignment",
        "total addressable market",
        "tam",
        "market positioning",
        // Micro — specific metrics, processes, and technical concepts
        "ltv",
        "cac",
        "mrr",
        "arr",
        "nps",
        "dau",
        "mau",
        "churn",
        "churn rate",
        "retention",
        "retention rate",
        "conversion",
        "conversion rate",
        "unit economics",
        "customer lifetime value",
        "customer acquisition cost",
        "funnel",
        "funnel optimization",
        "cohort",
        "cohort analysis",
        "okr",
        "mvp",
        "north star metric",
        "agile",
        "scrum",
        "sprint",
        "kanban",
        "devops",
        "ci/cd",
        "rest api",
        "graphql",
        "system design",
        "code review",
        "technical debt",
        "version control",
        "data pipeline",
        "microservices architecture",
        "service-oriented",
        "event-driven",
        "statistical significance",
        "hypothesis testing",
        "regression analysis",
        "a/b testing",
        "multivariate testing",
        "experiment design",
        // HR / People Ops domain
        "headcount",
        "attrition",
        "talent pipeline",
        "workforce development",
        "employee lifecycle",
        "employer brand",
        "employee value proposition",
        "diversity equity inclusion",
        "dei initiatives",
        "employee retention",
        "people operations",
        "hris implementation",
        "payroll processing",
        "total rewards",
        "job leveling",
        "career pathing",
        // Management Consulting domain
        "workstream",
        "deliverable",
        "client engagement",
        "engagement management",
        "strategic recommendation",
        "value creation framework",
        "deck",
        "management presentation",
        "c-suite communication",
        "board presentation",
        // Economics / Policy domain
        "fiscal policy",
        "monetary policy",
        "labor market",
        "gdp",
        "inflation",
        "impact evaluation",
        "program evaluation",
        "policy brief",
        "cost effectiveness analysis",
        "welfare economics",
        "public finance",
        "income inequality",
        "poverty reduction",
        "development economics",
        "behavioral economics",
        "experimental economics",
        // Supply Chain domain
        "lead time",
        "on-time delivery",
        "otd",
        "fill rate",
        "service level",
        "sku",
        "bom",
        "bill of materials",
        "mrp",
        "material requirements planning",
        "just-in-time",
        "jit",
        "lean supply chain",
        "vendor performance",
        "spend analysis",
        "total cost of ownership",
        "tco",
        "rfq",
        "purchase order",
        "raw materials",
        "finished goods",
        "wip",
        "cross-docking",
        "3pl",
        "4pl",
        "freight",
        "incoterms",
        // Architecture / Civil domain
        "building code",
        "master plan",
        "site plan",
        "floor plan",
        "schematic design",
        "design development",
        "construction administration",
        "shop drawings",
        "mixed-use development",
        "transit-oriented development",
        "urban mobility",
        "geotechnical",
        "surveying",
        "infrastructure design",
        "stormwater",
        "grading",
        "utility design",
        "right of way",
        // Education domain
        "student achievement",
        "learning outcomes",
        "stem education",
        "k-12",
        "higher education",
        "professional development",
        "training and development",
        "accreditation",
        "learning objectives",
        "course design",
        "syllabus development",
        "faculty development",
        // Healthcare domain (clinical/operational)
        "value-based care",
        "health outcomes",
        "patient satisfaction",
        "clinical workflow",
        "telemedicine",
        "telehealth",
        "care management",
        "disease management",
        "preventive care",
        "chronic disease management",
        "population health management",
        "utilization management",
        "health equity",
        "social determinants of health",
        "sdoh",
        // Social Sciences / Nonprofit domain
        "social impact",
        "community engagement",
        "policy advocacy",
        "nonprofit management",
        "grant writing",
        "fundraising",
        "program management",
        "community development",
        "civic engagement",
        "capacity building",
        "stakeholder engagement",
        "coalition building",
        // Customer Success domain
        "health score",
        "product adoption",
        "customer journey",
        "expansion revenue",
        "net revenue retention",
        "nrr",
        "gross revenue retention",
        "grr",
        "logo retention",
        "customer segmentation",
        "tier management",
        "executive sponsor",
        // Aerospace / Defense domain
        "faa regulations",
        "mil-spec",
        "airworthiness",
        "propulsion",
        "systems engineering",
        "avionics",
        "flight test",
        "certification",
        // Investment / Finance domain
        "investment banking",
        "private equity",
        "venture capital",
        "asset management",
        "hedge fund",
        "capital markets",
        "equity research",
        "fixed income",
        "credit analysis",
        "lbo",
        "ipo",
        "spac",
        "syndication",
        "underwriting",
        "fund administration",
        "nav",
        "aum",
        // Sales / Revenue domain
        "pipeline",
        "quota",
        "bookings",
        "annual recurring revenue",
        "net new revenue",
        "expansion",
        "win rate",
        "average deal size",
        "sales cycle",
        "territory management",
        "channel sales",
        "partner management",
        "reseller",
        "distributor",
        // Operations Research / Analytics domain
        "optimization problem",
        "constraint satisfaction",
        "heuristic",
        "monte carlo",
        "discrete event simulation",
        "supply-demand balancing",
        // Communications / Media domain
        "media relations",
        "press coverage",
        "editorial calendar",
        "content calendar",
        "newsroom",
        "beat reporting",
        "source development",
        "interview skills",
        "fact-checking",
        "ap style",
        // Chemical / Process domain
        "batch processing",
        "continuous processing",
        "gmp manufacturing",
        "process validation",
        "technology transfer",
        "scale-up",
        "cmc",
        "environmental health and safety",
        "ehs",
        "process hazard analysis"
    ],
    action_verbs: [
        // Finance / Data / Tech
        "prepare",
        "reconcile",
        "analyze",
        "process",
        "review",
        "report",
        "manage",
        "build",
        "develop",
        "implement",
        "optimize",
        "audit",
        "forecast",
        "model",
        "launch",
        "coordinate",
        // Chinese
        "分析",
        "监控",
        "制定",
        "梳理",
        "协同",
        "处理",
        "调配",
        "优化",
        "输出",
        "支援",
        // AI / ML
        "train",
        "fine-tune",
        "evaluate",
        "deploy",
        "curate",
        "generate",
        "infer",
        // 管理 / 商科
        "lead",
        "execute",
        "facilitate",
        "present",
        "identify",
        "assess",
        "plan",
        "prioritize",
        "delegate",
        "negotiate",
        "recommend",
        "drive",
        "oversee",
        "streamline",
        "align",
        "resolve",
        "monitor",
        "deliver",
        "communicate",
        "collaborate",
        "track",
        "contribute",
        "support",
        "rotate",
        // Engineering
        "design",
        "test",
        "validate",
        "simulate",
        "prototype",
        "troubleshoot",
        "calibrate",
        "inspect",
        "manufacture",
        "fabricate",
        "integrate",
        "configure",
        // Design / Creative
        "create",
        "illustrate",
        "animate",
        "render",
        "sketch",
        "iterate",
        "visualize",
        "conceptualize",
        "storyboard",
        "brand",
        // Life Sciences
        "conduct",
        "research",
        "synthesize",
        "formulate",
        "culture",
        "sequence",
        "assay",
        "document",
        "submit",
        "register",
        // Marketing
        "market",
        "campaign",
        "promote",
        "publish",
        "advertise",
        "grow",
        "acquire",
        "engage",
        "convert",
        "segment",
        "target",
        // IT / Security
        "secure",
        "patch",
        "monitor",
        "migrate",
        "provision",
        "automate",
        "architect",
        "harden",
        "encrypt",
        "detect",
        "respond",
        // HR / Talent
        "recruit",
        "source",
        "screen",
        "hire",
        "onboard",
        "coach",
        "retain",
        "interview",
        "assess candidates",
        "headhunt",
        // Education / Training
        "teach",
        "instruct",
        "educate",
        "tutor",
        "facilitate learning",
        "scaffold",
        "differentiate",
        "advise",
        // Supply Chain / Ops
        "procure",
        "replenish",
        "expedite",
        "fulfil",
        "ship",
        "receive",
        "inspect",
        "warehouse",
        "distribute",
        // Healthcare / Clinical
        "administer",
        "treat",
        "counsel",
        "refer",
        "triage",
        "diagnose",
        "prescribe",
        "assess",
        "document",
        // Architecture / Civil
        "draft",
        "permit",
        "survey",
        "inspect",
        "estimate",
        // Consulting / Strategy
        "synthesize",
        "frame",
        "scope",
        "size",
        "hypothesize",
        "benchmark",
        "advise",
        "pitch",
        // Sales / BD
        "prospect",
        "close",
        "upsell",
        "cross-sell",
        "negotiate",
        // Communications / Media
        "write",
        "edit",
        "proofread",
        "publish",
        "broadcast",
        // Finance / Investment
        "model",
        "value",
        "underwrite",
        "syndicate",
        "allocate",
        "hedge",
        // Research / Social Sciences
        "observe",
        "code",
        "transcribe",
        "interpret",
        "test",
        // General additions
        "transform",
        "scale",
        "pilot",
        "revamp",
        "overhaul",
        "standardize",
        "digitize",
        "automate",
        "integrate",
        "centralize",
        "consolidate"
    ],
    nice_to_have: [
        // Finance / Accounting
        "certified public accountant",
        "cpa eligible",
        "bilingual",
        "public accounting",
        "startup experience",
        "consulting experience",
        "advanced excel",
        "open source contribution",
        "research experience",
        "published paper",
        // 管理 / 商科
        "mba",
        "leadership experience",
        "cross-functional experience",
        "rotational program",
        "management experience",
        "operations experience",
        "international experience",
        "volunteer experience",
        // Engineering
        "pe license",
        "six sigma certification",
        "pmp",
        "lean certification",
        "autocad certification",
        "solidworks certification",
        // Design
        "portfolio",
        "dribbble",
        "behance",
        "design award",
        // Life Sciences
        "phd",
        "md",
        "clinical experience",
        "gcp certification",
        "regulatory experience",
        "fda experience",
        // Marketing
        "google certified",
        "hubspot certified",
        "facebook blueprint",
        "content creation experience",
        "agency experience",
        // IT / Security
        "comptia",
        "cissp",
        "cism",
        "ceh",
        "aws certified",
        "azure certified",
        "google cloud certified",
        "ccna",
        "ccnp",
        // Legal
        "bar admission",
        "juris doctor",
        "jd",
        "llm",
        "paralegal certificate",
        // Environmental
        "leed certified",
        "iso 14001 certified",
        "sustainability certification",
        "quantum computing",
        "game development",
        "embedded systems",
        "rust",
        "c++",
        // HR Certifications
        "shrm-cp",
        "shrm-scp",
        "phr",
        "sphr",
        "shrm certified",
        "talent management certified",
        // Finance / Banking Certifications
        "cfa",
        "cfa level 1",
        "cfa candidate",
        "cfa level 2",
        "cfa charterholder",
        "series 7",
        "series 63",
        "series 79",
        "frm",
        "caia",
        "chartered financial analyst",
        // Consulting / Strategy
        "case competition",
        "management consulting internship",
        "strategy internship",
        "consulting internship",
        // Architecture
        "leed ap",
        "are",
        "architect registration examination",
        "registered architect",
        // Supply Chain Certifications
        "apics cpim",
        "apics cscp",
        "cltd",
        "cscmp",
        "certified supply chain professional",
        // Engineering Certifications
        "fe exam",
        "eit",
        "fundamentals of engineering",
        "pe license",
        // Data / Cloud Certifications
        "google data analytics certificate",
        "tableau certified",
        "databricks certified",
        "aws solutions architect",
        "azure data engineer",
        "google cloud professional",
        // Project Management Certifications
        "pmp certified",
        "capm",
        "agile certified",
        "scrum master",
        "csm",
        "safe agile",
        "prince2",
        // Finance Additional
        "acca",
        "cma",
        "enrolled agent",
        "ea",
        "cfp",
        // Legal Additional
        "bar prep",
        "law review",
        "moot court",
        // Language / Cultural
        "bilingual",
        "trilingual",
        "multilingual",
        "toefl",
        "ielts",
        "hsk",
        "delf",
        "goethe",
        "jlpt",
        // Research
        "published research",
        "peer-reviewed publication",
        "conference presentation",
        "research fellowship",
        "grant recipient",
        // General Nice-to-Have Experience
        "startup experience",
        "nonprofit experience",
        "government experience",
        "international internship",
        "study abroad",
        "exchange program",
        "dean's list",
        "honor society",
        "honors thesis",
        "capstone project"
    ]
};
const FALLBACK_ROLE_LEXICON = {
    "staff accountant": {
        target_role: [
            "staff accountant"
        ],
        core_skills: [
            "bookkeeping",
            "tax preparation",
            "payroll",
            "financial statements",
            "reconciliation",
            "general ledger",
            "journal entries"
        ],
        tools: [
            "quickbooks",
            "excel"
        ],
        action_verbs: [
            "prepare",
            "reconcile",
            "process",
            "review"
        ],
        domain_keywords: [
            "accounting",
            "cpa",
            "client communication"
        ],
        nice_to_have: [
            "public accounting",
            "cpa eligible"
        ]
    },
    "data analyst": {
        target_role: [
            "data analyst"
        ],
        core_skills: [
            "data analysis",
            "data visualization",
            "dashboarding",
            "reporting",
            "a/b testing"
        ],
        tools: [
            "sql",
            "python",
            "excel",
            "tableau",
            "power bi"
        ],
        action_verbs: [
            "analyze",
            "build",
            "report",
            "visualize"
        ],
        domain_keywords: [
            "kpi",
            "customer analytics",
            "stakeholder communication"
        ],
        nice_to_have: [
            "statistics",
            "etl"
        ]
    }
};
function normalizeText(text) {
    return String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n")// Common bullet/list characters from Word, PDF, and web sources
    .replace(/[\u2022\u25cf\u25aa\u25e6\u25b8\u25ba\u25a0\u25a1\u25c6\u25c7\u25bd\u25be\u2023\u2043\u2219\u00b7\u2027\uf0b7\uf0a7\u2714\u2713\u2612\u2611\u2739\u2736\u2012\u2013\u276f\u203a]/g, "- ").replace(/[\u201c\u201d]/g, "\"").replace(/[\u2018\u2019]/g, "'").replace(/\ufeff/g, ""); // strip BOM
}
function tokenize(text) {
    return normalizeText(text).toLowerCase().replace(/[^a-z0-9+#.\s/-]/g, " ").split(/\s+/).map((w)=>w.trim().replace(/^[^a-z0-9+#]+|[^a-z0-9+#]+$/gi, "")).filter((w)=>isUsefulKeywordToken(w));
}
function extractKeywords(text) {
    const cleaned = removeCompanyNames(removeCompanyBoilerplate(stripUrlsAndEmails(getJdKeywordText(text))));
    const raw = tokenize(cleaned).filter((w)=>w.length > 3);
    const phrases = [];
    const lower = normalizeText(text).toLowerCase();
    const knownPhrases = [
        "machine learning",
        "deep learning",
        "data analysis",
        "data visualization",
        "power bi",
        "tableau",
        "react",
        "node.js",
        "next.js",
        "typescript",
        "python",
        "sql",
        "aws",
        "azure",
        "gcp",
        "docker",
        "kubernetes",
        "financial modeling",
        "financial statements",
        "tax preparation",
        "client communication",
        "bank reconciliation",
        "account reconciliation",
        "accounts payable",
        "accounts receivable",
        "general ledger",
        "user research",
        "product roadmap",
        "a/b testing",
        "software development engineer",
        "software engineer",
        "data structures",
        "algorithms",
        "object-oriented design",
        "object oriented design",
        "code reviews",
        "code review",
        "cloud-native architecture",
        "cloud-native architectures",
        "cloud native architecture",
        "cloud native architectures",
        "technical documentation",
        "operational excellence",
        "distributed systems",
        "microservices",
        "game development",
        "quantum computing",
        "embedded systems",
        "communicate effectively"
    ];
    for (const phrase of knownPhrases){
        if (lower.includes(phrase)) phrases.push(phrase);
    }
    const phraseParts = new Set(phrases.flatMap((phrase)=>phrase.split(/\s+/)));
    const cleanedRaw = raw.filter((word)=>!phraseParts.has(word));
    return [
        ...new Set([
            ...phrases,
            ...cleanedRaw
        ])
    ];
}
function extractJdKeywords(jdText, jobTitle = "") {
    const jobTitleTerms = new Set(extractKeywords(jobTitle));
    return extractKeywords(jdText).filter((kw)=>!jobTitleTerms.has(kw)).filter((kw)=>isUsefulJdKeyword(kw));
}
function buildKeywordProfile(jdText = "", jobTitle = "") {
    const explicitChineseRole = extractChineseTargetRole(jdText);
    const hasChineseStructuredRole = /\u5c97\u4f4d[^\uff1a:\n]*[\uff1a:]\s*[^\n]*[\u4e00-\u9fff]/.test(normalizeText(jdText));
    const shouldUseDictionary = Boolean(jobTitle && /[a-z]/i.test(jobTitle)) || !explicitChineseRole && !hasChineseStructuredRole;
    const roleEntry = shouldUseDictionary ? findRoleDictionaryEntry(jobTitle, jdText) : null;
    const roleProfile = roleToProfile(roleEntry);
    if (jdText && jdText.trim()) {
        const jdProfile = extractJdProfile(jdText, jobTitle);
        return normalizeProfile({
            source: roleEntry ? "jd+role_dictionary" : "jd",
            role_id: roleEntry?.role_id || null,
            canonical_role: roleEntry?.canonical_role || null,
            target_role: unique([
                ...roleProfile?.target_role || [],
                explicitChineseRole,
                ...jdProfile.target_role
            ].filter(Boolean)),
            core_skills: unique([
                ...jdProfile.core_skills,
                ...termsFromJdThatMatchRole(jdText, roleProfile?.core_skills || [])
            ]),
            tools: unique([
                ...jdProfile.tools,
                ...termsFromJdThatMatchRole(jdText, roleProfile?.tools || [])
            ]),
            action_verbs: unique([
                ...jdProfile.action_verbs,
                ...termsFromJdThatMatchRole(jdText, roleProfile?.action_verbs || [])
            ]),
            domain_keywords: unique([
                ...jdProfile.domain_keywords,
                ...termsFromJdThatMatchRole(jdText, roleProfile?.domain_keywords || [])
            ]),
            nice_to_have: unique([
                ...jdProfile.nice_to_have,
                ...termsFromJdThatMatchRole(jdText, roleProfile?.nice_to_have || [])
            ])
        });
    }
    if (roleProfile) {
        return normalizeProfile({
            source: "role_dictionary",
            role_id: roleEntry.role_id,
            canonical_role: roleEntry.canonical_role,
            ...roleProfile
        });
    }
    return fallbackRoleProfile(jobTitle);
}
function termsFromJdThatMatchRole(jdText, roleTerms) {
    const lower = normalizeText(getJdKeywordText(jdText)).toLowerCase();
    return unique((roleTerms || []).filter((term)=>lower.includes(cleanKeyword(term))));
}
function extractJdProfile(jdText, jobTitle = "") {
    const sections = parseJdSections(jdText);
    const jobTitleTerms = new Set(extractKeywords(jobTitle));
    const cleanLines = (lines)=>removeCompanyNames(removeCompanyBoilerplate(stripUrlsAndEmails(lines.join("\n")))).toLowerCase();
    const reqText = cleanLines(sections.requirements);
    const respText = cleanLines(sections.responsibilities);
    const niceText = cleanLines(sections.nice_to_have);
    const otherText = cleanLines(sections.other);
    // Priority order: requirements first, then responsibilities, nice_to_have, other
    const orderedTexts = [
        reqText,
        respText,
        niceText,
        otherText
    ];
    const allText = orderedTexts.join("\n");
    const collectOrdered = (categoryTerms)=>{
        const seen = new Set();
        const result = [];
        for (const text of orderedTexts){
            for (const term of findCategoryTerms(text, categoryTerms, jobTitleTerms)){
                if (!seen.has(term)) {
                    seen.add(term);
                    result.push(term);
                }
            }
        }
        return result;
    };
    const profile = {
        source: "jd",
        target_role: extractTargetRole(allText, jobTitle),
        core_skills: collectOrdered(CATEGORY_PHRASES.core_skills),
        tools: collectOrdered(CATEGORY_PHRASES.tools),
        action_verbs: findActionVerbs(allText),
        domain_keywords: collectOrdered(CATEGORY_PHRASES.domain_keywords),
        nice_to_have: unique([
            ...findCategoryTerms(niceText, CATEGORY_PHRASES.nice_to_have, jobTitleTerms),
            ...extractNiceToHave(allText, jobTitleTerms)
        ])
    };
    return normalizeProfile(profile);
}
function fallbackRoleProfile(jobTitle = "") {
    const lower = normalizeText(jobTitle).toLowerCase();
    const matchedKey = Object.keys(FALLBACK_ROLE_LEXICON).find((role)=>lower.includes(role));
    const base = matchedKey ? FALLBACK_ROLE_LEXICON[matchedKey] : {
        target_role: jobTitle ? [
            jobTitle.toLowerCase()
        ] : [],
        core_skills: [],
        tools: [],
        action_verbs: [],
        domain_keywords: [],
        nice_to_have: []
    };
    return normalizeProfile({
        source: "role_lexicon",
        ...base
    });
}
function extractTargetRole(text, jobTitle = "") {
    const roles = [];
    const fullText = normalizeText(text);
    const chineseRole = extractChineseTargetRole(fullText);
    if (chineseRole) roles.push(chineseRole);
    const lower = fullText.toLowerCase();
    if (jobTitle && jobTitle.trim()) roles.push(jobTitle.trim().toLowerCase());
    const match = lower.match(/\b(?:seeking|hiring|looking for)\s+(?:an?\s+)?([a-z][a-z\s/-]{2,40}?)(?:\.|,| with | who | to |$)/) || lower.match(/\bposition\s+(?:is\s+)?(?:for\s+)?(?:an?\s+)?([a-z][a-z\s/-]{2,40}?)(?:\.|,| with | who | to |$)/);
    if (match) roles.push(match[1].trim());
    return unique(roles.map(cleanKeyword).filter(Boolean));
}
function findCategoryTerms(lowerText, terms, exclude = new Set()) {
    return unique(terms.filter((term)=>{
        const clean = cleanKeyword(term);
        if (!clean) return false;
        if (clean.includes(" ") || clean.includes("-")) return lowerText.includes(clean);
        return new RegExp(`\\b${escapeRegExp(clean)}\\b`).test(lowerText);
    }).map(cleanKeyword).filter((term)=>term && !exclude.has(term)));
}
function findActionVerbs(lowerText) {
    const verbs = CATEGORY_PHRASES.action_verbs.filter((verb)=>{
        const re = new RegExp(`\\b${escapeRegExp(verb)}(?:s|ed|ing)?\\b`, "i");
        return re.test(lowerText);
    });
    return unique(verbs);
}
function extractNiceToHave(text, exclude = new Set()) {
    const lower = normalizeText(text).toLowerCase();
    const niceSentences = lower.split(/\n|(?<=[.!?])\s+/).filter((s)=>/\b(preferred|nice to have|plus|bonus|preferred qualifications?)\b/.test(s)).join(" ");
    return findCategoryTerms(niceSentences, CATEGORY_PHRASES.nice_to_have, exclude);
}
function normalizeProfile(profile) {
    const normalized = {
        ...profile
    };
    for (const key of [
        "target_role",
        "core_skills",
        "tools",
        "action_verbs",
        "domain_keywords",
        "nice_to_have"
    ]){
        normalized[key] = unique((normalized[key] || []).map(cleanKeyword).filter(Boolean));
    }
    return normalized;
}
function cleanKeyword(value) {
    return String(value || "").toLowerCase().replace(/^[^a-z0-9+#\u4e00-\u9fff]+|[^a-z0-9+#\u4e00-\u9fff]+$/gi, "").replace(/\s+/g, " ").trim();
}
function parseJdSections(jdText) {
    const normalized = normalizeText(jdText);
    const lines = normalized.split("\n");
    const sections = {
        requirements: [],
        responsibilities: [],
        nice_to_have: [],
        other: []
    };
    let current = "other";
    for (const rawLine of lines){
        const line = rawLine.trim();
        if (!line) continue;
        const lower = line.toLowerCase();
        const isShort = line.length < 90;
        if (isShort && (/\b(what we'?re looking for|requirements?|qualifications?|must.?have|required skills?|required qualifications?)\b/.test(lower) || /【?(任职要求|要求)】?/.test(line))) {
            current = "requirements";
            continue;
        }
        if (isShort && /\b(nice.?to.?have|preferred|bonus|good to have|desirable)\b/.test(lower)) {
            current = "nice_to_have";
            continue;
        }
        if (isShort && (/\b(what you'?ll work on|what you'?ll do|responsibilities?|duties|your role|job summary)\b/.test(lower) || /【?(岗位职责|职责)】?/.test(line))) {
            current = "responsibilities";
            continue;
        }
        if (isShort && (/\b(about us|about the company|who we are|what we offer|we offer|benefits?|perks?|compensation)\b/.test(lower) || /【?(公司|公司介绍|网站|地点|关于)】?/.test(line))) {
            current = "other";
            continue;
        }
        sections[current].push(line);
    }
    return sections;
}
function getJdKeywordText(text) {
    const normalized = normalizeText(text);
    if (!/[【\[]?(岗位职责|任职要求|职责|要求|responsibilities|requirements|qualifications|what you|looking for)/i.test(normalized)) {
        return normalized;
    }
    const lines = normalized.split("\n");
    const kept = [];
    let active = false;
    for (const rawLine of lines){
        const line = rawLine.trim();
        if (!line) continue;
        const isHeader = /^【[^】]+】/.test(line) || /^[A-Za-z''\s]+:/.test(line);
        const startsRelevant = /【?(岗位职责|任职要求|职责|要求)】?|^(responsibilities?|requirements?|qualifications?|what you will do|what you'?ll work on|what we'?re looking for|duties|nice to have|nice-to-have)\b/i.test(line);
        const startsIrrelevant = /【?(公司|公司介绍|网站|地点|岗位)】?|^(about us|about the company|about [a-z]+:|company|website|location|what we offer|benefits?|perks?)\b/i.test(line);
        if (startsRelevant) {
            active = true;
            const afterColon = line.split(/[：:]/).slice(1).join(":").trim();
            if (afterColon) kept.push(afterColon);
            continue;
        }
        if (startsIrrelevant && isHeader) {
            active = false;
            continue;
        }
        if (active) kept.push(line);
    }
    return kept.length ? kept.join("\n") : normalized;
}
function extractChineseTargetRole(text) {
    const candidates = [];
    for (const line of normalizeText(text).split("\n")){
        const match = line.match(/\u5c97\u4f4d[^\uff1a:\n]*[\uff1a:]\s*([^\n]+)/);
        if (match) candidates.push(match[1].trim());
    }
    for (const raw of candidates){
        const cleaned = raw.replace(/[（(].*?[）)]/g, "").replace(/\s+/g, " ").trim();
        const looksLikeLocation = /弗吉尼亚|田纳西|加州|洛杉矶|纽约|西雅图|virginia|tennessee|california|seattle/i.test(cleaned);
        const looksLikeRole = /专员|经理|主管|助理|分析师|工程师|会计|运营|支持|intern|analyst|engineer|accountant|specialist|manager/i.test(cleaned);
        if (cleaned && looksLikeRole && !looksLikeLocation) return cleaned.toLowerCase();
    }
    return "";
}
function unique(items) {
    return [
        ...new Set(items)
    ];
}
function isLikelyDomainKeyword(keyword) {
    if (!isUsefulJdKeyword(keyword)) return false;
    if (keyword.length < 5) return false;
    const generic = new Set([
        "entry",
        "maintain",
        "records",
        "timely",
        "basis",
        "necessary",
        "adjustments"
    ]);
    return !generic.has(keyword);
}
function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function removeCompanyBoilerplate(text) {
    return normalizeText(text).split(/\n|(?<=[.!?])\s+/).filter((sentence)=>{
        const s = sentence.toLowerCase();
        const looksLikeCompanyIntro = /\b(full-service|distinguished|founded|located|headquartered|firm|website)\b/.test(s) || /\b(inc|llc|ltd|corp|corporation|associates|partners)\b/.test(s);
        const looksLikeLocationInfo = /\b(branch|branches|office|offices|location|locations|headquarter|headquarters|california|seattle|new york|san francisco|los angeles|chicago|boston|austin|dallas|houston)\b/.test(s);
        const hasRoleRequirement = /\b(required|requirement|qualification|responsibilit|skill|experience with|proficient|knowledge of|must|preferred|duties)\b/.test(s);
        return !looksLikeCompanyIntro && !looksLikeLocationInfo || hasRoleRequirement;
    }).join(" ");
}
function removeCompanyNames(text) {
    const companyNames = extractCompanyNameCandidates(text);
    let cleaned = normalizeText(text);
    for (const name of companyNames){
        if (!name || name.split(/\s+/).length > 6) continue;
        const escaped = escapeRegExp(name);
        cleaned = cleaned.replace(new RegExp(`\\b${escaped}\\b`, "gi"), " ");
    }
    return cleaned;
}
function extractCompanyNameCandidates(text) {
    const raw = normalizeText(text);
    const candidates = [];
    const patterns = [
        /\b([A-Z][A-Za-z&'.-]+(?:\s+[A-Z][A-Za-z&'.-]+){0,4})\s+(?:is|are)\s+(?:a|an|the)?\s*(?:distinguished\s+|leading\s+|full-service\s+|professional\s+)*(?:company|firm|organization|agency|startup|corporation|llc|inc|ltd|group|partners|associates)\b/g,
        /\b(?:About|At|Join)\s+([A-Z][A-Za-z&'.-]+(?:\s+[A-Z][A-Za-z&'.-]+){0,4})\b/g,
        /\b([A-Z][A-Za-z&'.-]+(?:\s+[A-Z][A-Za-z&'.-]+){0,3})\s+(?:LLC|Inc\.?|Ltd\.?|Corporation|Corp\.?|Associates|Partners|Group)\b/g
    ];
    for (const pattern of patterns){
        let match;
        while(match = pattern.exec(raw)){
            const candidate = match[1].trim();
            if (!/^(we|our|the|job|role|responsibilities|qualifications)$/i.test(candidate)) {
                candidates.push(candidate.toLowerCase());
            }
        }
    }
    return unique(candidates);
}
function stripUrlsAndEmails(text) {
    return normalizeText(text).replace(/https?:\/\/\S+/gi, " ").replace(/\bwww\.\S+/gi, " ").replace(/\b[\w.-]+\.\w{2,}(?:\/\S*)?/gi, " ").replace(/\b[\w.-]+@[\w.-]+\.\w{2,}\b/gi, " ");
}
function isUsefulKeywordToken(word) {
    if (!word || word.length <= 2) return false;
    if (STOP_WORDS.has(word)) return false;
    if (/^\d+$/.test(word)) return false;
    if (/^www\./i.test(word)) return false;
    if (/\.(com|net|org|io|co|edu|gov)$/i.test(word)) return false;
    if (/^https?:/i.test(word)) return false;
    return true;
}
function isUsefulJdKeyword(keyword) {
    if (!keyword || STOP_WORDS.has(keyword)) return false;
    if (/^\d+$/.test(keyword)) return false;
    if (keyword.length < 4) return false;
    const genericBusinessWords = new Set([
        "staff",
        "role",
        "work",
        "team",
        "office",
        "branch",
        "location",
        "include",
        "additional",
        "california",
        "seattle",
        "service",
        "firm"
    ]);
    return !genericBusinessWords.has(keyword);
}
function getBulletLines(text) {
    return normalizeText(text).split("\n").map((line)=>line.trim()).filter((line)=>{
        if (!line) return false;
        if (/^[-*]\s/.test(line)) return true;
        // Strip leading non-alpha chars (bullet symbols, etc.) then check verb.
        // Use startsWith instead of splitting on spaces, because pdf-parse often
        // strips all spaces: "Optimized property..." becomes "Optimizedproperty..."
        const stripped = line.replace(/^[^a-zA-Z]+/, "");
        const lower = stripped.toLowerCase();
        const startsWithVerb = [
            ...STRONG_VERBS
        ].some((v)=>lower.startsWith(v));
        return line.length > 40 && startsWithVerb;
    });
}
function parseSections(text) {
    const sections = {};
    const lines = normalizeText(text).split("\n");
    let current = "header";
    sections[current] = [];
    // Patterns include space-merged variants (e.g. "TECHNICALSKILLS") because
    // pdf-parse strips spaces, turning section headers into single merged words.
    const headingMap = [
        [
            /^(summary|profile|professionalsummary|professional summary|careerobjective|career objective|objective)\b/i,
            "summary"
        ],
        [
            /^(experience|workexperience|work experience|professionalexperience|professional experience|employment)\b/i,
            "experience"
        ],
        [
            /^(projects?|projectexperience|project experience|selectedprojects|selected projects)\b/i,
            "projects"
        ],
        [
            /^(skills?|technicalskills?|technical skills?|coreskills?|core skills?|competencies)\b/i,
            "skills"
        ],
        [
            /^(education|academicbackground|academic background)\b/i,
            "education"
        ],
        [
            /^(certifications?|licenses?|awards?|honors?)\b/i,
            "certifications"
        ]
    ];
    for (const rawLine of lines){
        const line = rawLine.trim();
        const matched = headingMap.find(([re])=>re.test(line.replace(/[:：]$/, "")));
        if (matched) {
            current = matched[1];
            sections[current] = sections[current] || [];
            continue;
        }
        sections[current].push(rawLine);
    }
    return Object.fromEntries(Object.entries(sections).map(([key, value])=>[
            key,
            value.join("\n").trim()
        ]));
}
function sectionText(sections, names) {
    return names.map((name)=>sections[name] || "").join("\n");
}
function bulletsFromSection(text) {
    return getBulletLines(text).map((line)=>line.replace(/^[^a-zA-Z]+/, "").trim());
}
function countQuantifiedResults(text) {
    const matches = normalizeText(text).match(/\d+\s*%|\$[\d,]+[kKmMbB]?|\b\d+[kKmMbB]\b|\b[1-9]\d{2,}\b|\b\d+x\b/gi) || [];
    return matches.filter((m)=>{
        const digits = m.replace(/[^0-9]/g, "");
        return !/^20[0-3]\d$/.test(digits);
    }).length;
}
function countStrongVerbStarts(lines) {
    let hits = 0;
    for (const line of lines){
        if (!line.trim()) continue;
        const stripped = line.trim().replace(/^[^a-zA-Z]+/, "");
        const lower = stripped.toLowerCase();
        // startsWith handles both "Optimized..." and "Optimizedproperty..." (merged PDF)
        if (line.trim().length > 20 && [
            ...STRONG_VERBS
        ].some((v)=>lower.startsWith(v))) hits += 1;
    }
    return hits;
}
function countWeakPhrases(text) {
    const lower = normalizeText(text).toLowerCase();
    return WEAK_PHRASES.filter((phrase)=>lower.includes(phrase)).length;
}
function detectRoleFamily(text) {
    const lower = normalizeText(text).toLowerCase();
    let best = {
        role: "general",
        hits: 0,
        terms: []
    };
    for (const family of ROLE_FAMILIES){
        const hits = family.terms.filter((term)=>lower.includes(term));
        if (hits.length > best.hits) best = {
            role: family.role,
            hits: hits.length,
            terms: hits
        };
    }
    return best;
}
function scoreByRatio(ratio, scale) {
    if (ratio >= 0.90) return scale;
    if (ratio >= 0.80) return Math.round(scale * 0.83);
    if (ratio >= 0.70) return Math.round(scale * 0.66);
    if (ratio >= 0.60) return Math.round(scale * 0.51);
    if (ratio >= 0.50) return Math.round(scale * 0.36);
    if (ratio >= 0.40) return Math.round(scale * 0.22);
    if (ratio >= 0.30) return Math.round(scale * 0.13);
    if (ratio >= 0.20) return Math.round(scale * 0.07);
    if (ratio >= 0.10) return Math.round(scale * 0.03);
    return 0;
}
function compareKeywordProfile(profile, resumeText) {
    const categoryWeights = {
        core_skills: 0.38,
        tools: 0.24,
        domain_keywords: 0.18,
        action_verbs: 0.10,
        nice_to_have: 0.10
    };
    const comparison = {};
    let activeWeight = 0;
    let weightedRatio = 0;
    for (const [category, weight] of Object.entries(categoryWeights)){
        const terms = profile[category] || [];
        const matched = terms.filter((term)=>resumeHasTerm(resumeText, term));
        const missing = terms.filter((term)=>!resumeHasTerm(resumeText, term));
        const ratio = terms.length ? matched.length / terms.length : null;
        comparison[category] = {
            terms,
            matched,
            missing,
            ratio
        };
        if (terms.length) {
            activeWeight += weight;
            weightedRatio += ratio * weight;
        }
    }
    const ratio = activeWeight ? weightedRatio / activeWeight : 0;
    const allTerms = unique([
        ...comparison.core_skills.terms,
        ...comparison.tools.terms,
        ...comparison.domain_keywords.terms,
        ...comparison.action_verbs.terms,
        ...comparison.nice_to_have.terms
    ]);
    const allMatched = allTerms.filter((term)=>resumeHasTerm(resumeText, term));
    const allMissing = buildPrioritizedMissing(comparison);
    return {
        ratio,
        comparison,
        allTerms,
        allMatched,
        allMissing
    };
}
function buildPrioritizedMissing(comparison) {
    return unique([
        ...comparison.core_skills.missing,
        ...comparison.tools.missing,
        ...comparison.domain_keywords.missing,
        ...comparison.nice_to_have.missing,
        ...comparison.action_verbs.missing
    ]);
}
function resumeHasTerm(resumeText, term) {
    const lower = normalizeText(resumeText).toLowerCase();
    const clean = cleanKeyword(term);
    if (!clean) return false;
    // substring check handles both normal text and PDF-merged text (no spaces)
    if (lower.includes(clean)) return true;
    if (clean.includes(" ")) {
        // "spring boot" → also try "springboot" for PDFs where spaces were stripped
        if (lower.includes(clean.replace(/\s+/g, ""))) return true;
    } else {
        // inflected forms for single words ("-s", "-ed", "-ing")
        const re = new RegExp(`\\b${escapeRegExp(clean)}(?:s|ed|ing)?\\b`, "i");
        if (re.test(lower)) return true;
    }
    // Synonym / verb expansion: if the JD asks for a soft skill (e.g. "leadership"),
    // also check whether the resume demonstrates it through action verbs (e.g. "led").
    const synonyms = SKILL_VERB_MAP[clean];
    if (synonyms) {
        return synonyms.some((syn)=>{
            if (syn.includes(" ")) return lower.includes(syn);
            const synRe = new RegExp(`\\b${escapeRegExp(syn)}(?:s|ed|ing)?\\b`, "i");
            return synRe.test(lower);
        });
    }
    return false;
}
function compareKeywordProfile(profile, resumeText) {
    const categoryWeights = {
        core_skills: 0.34,
        tools: 0.24,
        domain_keywords: 0.18,
        action_verbs: 0.12,
        nice_to_have: 0.12
    };
    const comparison = {};
    let activeWeight = 0;
    let weightedRatio = 0;
    let exactPhraseCount = 0;
    for (const [category, weight] of Object.entries(categoryWeights)){
        const terms = profile[category] || [];
        const matches = terms.map((term)=>matchTermWithCredit(resumeText, term, category));
        const matched = matches.filter((m)=>m.credit > 0).map((m)=>m.term);
        const exactMatched = matches.filter((m)=>m.type === "exact").map((m)=>m.term);
        const normalizedMatched = matches.filter((m)=>m.type === "normalized").map((m)=>m.term);
        const semanticMatched = matches.filter((m)=>m.type === "semantic").map((m)=>m.term);
        const partialMatched = matches.filter((m)=>m.credit > 0 && m.credit < 1).map((m)=>m.term);
        const missing = matches.filter((m)=>m.credit <= 0).map((m)=>m.term);
        const credit = matches.reduce((sum, m)=>sum + m.credit, 0);
        const ratio = terms.length ? credit / terms.length : null;
        exactPhraseCount += exactMatched.length;
        comparison[category] = {
            terms,
            matched,
            exactMatched,
            normalizedMatched,
            semanticMatched,
            partialMatched,
            missing,
            matches,
            ratio
        };
        if (terms.length) {
            activeWeight += weight;
            weightedRatio += ratio * weight;
        }
    }
    const ratio = activeWeight ? weightedRatio / activeWeight : 0;
    const allMatches = uniqueByTerm(Object.values(comparison).flatMap((data)=>data.matches || []));
    const allTerms = allMatches.map((match)=>match.term);
    const allMatched = allMatches.filter((match)=>match.credit > 0).map((match)=>match.term);
    const allMissing = buildPrioritizedMissing(comparison);
    const hardMatches = allMatches.filter((match)=>classifySkillType(match.term, match.category) === "hard");
    const softMatches = allMatches.filter((match)=>classifySkillType(match.term, match.category) === "soft");
    return {
        ratio,
        comparison,
        allTerms,
        allMatched,
        allMissing,
        hardCoverage: coverageFromMatches(hardMatches),
        softCoverage: coverageFromMatches(softMatches),
        hardTermCount: hardMatches.length,
        softTermCount: softMatches.length,
        combinedKeywordCoverage: coverageFromMatches([
            ...hardMatches,
            ...softMatches
        ]),
        exactPhraseCount,
        experienceEvidence: analyzeKeywordEvidence(profile, resumeText)
    };
}
function resumeHasTerm(resumeText, term) {
    return matchTermWithCredit(resumeText, term).credit > 0;
}
function matchTermWithCredit(resumeText, term, category = "") {
    const lower = normalizeText(resumeText).toLowerCase();
    const clean = cleanKeyword(term);
    if (!clean) return {
        term: clean,
        category,
        type: "missing",
        credit: 0,
        matchedBy: null
    };
    if (hasExactPhrase(lower, clean)) {
        return {
            term: clean,
            category,
            type: "exact",
            credit: 1,
            matchedBy: clean
        };
    }
    if (clean.includes(" ")) {
        if (hasNormalizedPhrase(lower, clean)) {
            return {
                term: clean,
                category,
                type: "normalized",
                credit: 0.8,
                matchedBy: clean
            };
        }
    } else {
        const re = new RegExp(`\\b${escapeRegExp(clean)}(?:s|es|ed|ing)?\\b`, "i");
        if (re.test(lower)) {
            return {
                term: clean,
                category,
                type: "normalized",
                credit: 0.8,
                matchedBy: clean
            };
        }
    }
    const synonyms = unique([
        ...SKILL_VERB_MAP[clean] || [],
        ...SEMANTIC_MATCH_MAP[clean] || []
    ]);
    const matchedSynonym = synonyms.find((syn)=>phraseOrWordMatch(lower, cleanKeyword(syn)));
    if (matchedSynonym) {
        return {
            term: clean,
            category,
            type: "semantic",
            credit: SOFT_KEYWORD_TERMS.has(clean) || SKILL_VERB_MAP[clean] ? 0.6 : 0.5,
            matchedBy: cleanKeyword(matchedSynonym)
        };
    }
    if (clean.includes(" ")) {
        const tokens = clean.split(/\s+/).filter((t)=>t.length > 2 && !STOP_WORDS.has(t));
        const hits = tokens.filter((token)=>phraseOrWordMatch(lower, token)).length;
        if (tokens.length >= 2 && hits / tokens.length >= 0.6) {
            return {
                term: clean,
                category,
                type: "semantic",
                credit: 0.4,
                matchedBy: `${hits}/${tokens.length} tokens`
            };
        }
    }
    return {
        term: clean,
        category,
        type: "missing",
        credit: 0,
        matchedBy: null
    };
}
function uniqueByTerm(matches) {
    const best = new Map();
    for (const match of matches){
        const existing = best.get(match.term);
        if (!existing || match.credit > existing.credit) best.set(match.term, match);
    }
    return [
        ...best.values()
    ];
}
function coverageFromMatches(matches) {
    if (!matches.length) return 0;
    return matches.reduce((sum, match)=>sum + match.credit, 0) / matches.length;
}
function hasExactPhrase(lowerText, cleanTerm) {
    if (!cleanTerm) return false;
    if (!cleanTerm.includes(" ")) {
        return new RegExp(`\\b${escapeRegExp(cleanTerm)}\\b`, "i").test(lowerText);
    }
    return new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(cleanTerm)}([^a-z0-9+#]|$)`, "i").test(lowerText);
}
function hasNormalizedPhrase(lowerText, cleanTerm) {
    const compactText = lowerText.replace(/[\s/-]+/g, "");
    const compactTerm = cleanTerm.replace(/[\s/-]+/g, "");
    if (compactTerm && compactText.includes(compactTerm)) return true;
    const tokens = cleanTerm.split(/\s+/).filter(Boolean).map((token)=>singularize(token));
    if (!tokens.length) return false;
    const normalizedText = lowerText.replace(/[-/]+/g, " ").split(/\s+/).map((token)=>singularize(token)).join(" ");
    return normalizedText.includes(tokens.join(" "));
}
function phraseOrWordMatch(lowerText, cleanTerm) {
    if (!cleanTerm) return false;
    if (hasExactPhrase(lowerText, cleanTerm)) return true;
    return cleanTerm.includes(" ") ? hasNormalizedPhrase(lowerText, cleanTerm) : new RegExp(`\\b${escapeRegExp(cleanTerm)}(?:s|es|ed|ing)?\\b`, "i").test(lowerText);
}
function singularize(token) {
    return String(token || "").replace(/ies$/i, "y").replace(/(?:ses|xes|zes|ches|shes)$/i, (m)=>m.slice(0, -2)).replace(/s$/i, "");
}
function classifySkillType(term, category = "") {
    const clean = cleanKeyword(term);
    if (category === "action_verbs" || SOFT_KEYWORD_TERMS.has(clean) || SKILL_VERB_MAP[clean]) return "soft";
    return "hard";
}
function analyzeKeywordEvidence(profile, resumeText) {
    const sections = parseSections(resumeText);
    const experienceProjectsText = sectionText(sections, [
        "experience",
        "projects"
    ]);
    const skillsText = sectionText(sections, [
        "skills"
    ]);
    const terms = unique([
        ...profile.core_skills || [],
        ...profile.tools || [],
        ...profile.domain_keywords || []
    ].map(cleanKeyword).filter(Boolean)).slice(0, 40);
    const matched = terms.filter((term)=>resumeHasTerm(resumeText, term));
    const inExperience = matched.filter((term)=>resumeHasTerm(experienceProjectsText, term));
    const skillsOnly = matched.filter((term)=>!resumeHasTerm(experienceProjectsText, term) && resumeHasTerm(skillsText, term));
    return {
        matchedCount: matched.length,
        inExperienceCount: inExperience.length,
        skillsOnlyCount: skillsOnly.length,
        skillsOnlyShare: matched.length ? skillsOnly.length / matched.length : 0
    };
}
function analyzeExactJobTitleMatch(resumeText, jobTitle, keywordProfile) {
    const targetTitles = unique([
        jobTitle,
        ...keywordProfile.target_role || []
    ].map(cleanKeyword).filter(Boolean));
    const title = targetTitles.find((term)=>term.split(/\s+/).length >= 2) || targetTitles[0] || "";
    if (!title) return {
        targetTitle: "",
        exact: true,
        partial: false,
        matchedBy: null,
        penalty: 0
    };
    const match = matchTermWithCredit(resumeText, title, "target_role");
    return {
        targetTitle: title,
        exact: match.type === "exact",
        partial: match.credit > 0 && match.type !== "exact",
        matchedBy: match.matchedBy,
        penalty: match.type === "exact" ? 0 : match.credit > 0 ? 3 : 5
    };
}
function buildScoreCaps({ keywordMatch, exactJobTitle, D_final, F }) {
    const caps = [];
    if (keywordMatch.hardCoverage < 0.3) caps.push({
        max: 60,
        reason: "Hard skills coverage < 30%"
    });
    else if (keywordMatch.hardCoverage < 0.45) caps.push({
        max: 70,
        reason: "Hard skills coverage 30-45%"
    });
    if (keywordMatch.combinedKeywordCoverage < 0.4) caps.push({
        max: 72,
        reason: "Hard + soft keyword coverage < 40%"
    });
    if (exactJobTitle && !exactJobTitle.exact) caps.push({
        max: 90,
        reason: "Exact job title missing"
    });
    if (D_final < 20) caps.push({
        max: 70,
        reason: "D dimension < 20/45"
    });
    if (F < 14) caps.push({
        max: 80,
        reason: "F dimension < 14/23"
    });
    return caps;
}
function analyzePhone(text) {
    const candidates = normalizeText(text).match(/(?:\+?\d[\d\s().-]{7,}\d)/g) || [];
    for (const candidate of candidates){
        const digits = candidate.replace(/\D/g, "");
        if (digits.length === 10 || digits.length === 11 && digits.startsWith("1")) {
            return {
                present: true,
                valid: true,
                digits
            };
        }
    }
    return {
        present: candidates.length > 0,
        valid: false,
        digits: candidates[0]?.replace(/\D/g, "") || ""
    };
}
function latestDateOlderThanMonths(text, months) {
    const latest = extractLatestDate(text);
    if (!latest) return false;
    const now = new Date();
    const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
    return latest < cutoff;
}
function extractLatestDate(text) {
    const monthNames = "jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec|january|february|march|april|june|july|august|september|october|november|december";
    const dates = [];
    const normalized = normalizeText(text);
    const monthYearRe = new RegExp(`\\b(${monthNames})\\.?\\s+(20\\d{2})\\b`, "gi");
    let match;
    while(match = monthYearRe.exec(normalized)){
        dates.push(new Date(Number(match[2]), monthToIndex(match[1]), 1));
    }
    const years = normalized.match(/\b20\d{2}\b/g) || [];
    for (const year of years){
        dates.push(new Date(Number(year), 11, 1));
    }
    if (/present|current|now/i.test(normalized)) return new Date();
    return dates.length ? new Date(Math.max(...dates.map((d)=>d.getTime()))) : null;
}
function monthToIndex(month) {
    const key = month.toLowerCase().slice(0, 3);
    return [
        "jan",
        "feb",
        "mar",
        "apr",
        "may",
        "jun",
        "jul",
        "aug",
        "sep",
        "oct",
        "nov",
        "dec"
    ].indexOf(key);
}
function analyzeCoreSkillBulletPlacement(bullets, coreSkills) {
    const required = (coreSkills || []).slice(0, 8);
    if (!required.length || !bullets.length) {
        return {
            coverage: 0,
            earlyPlacement: 0,
            coverageScore: 0,
            orderScore: 0
        };
    }
    const matchedIndexes = [];
    for (const skill of required){
        const idx = bullets.findIndex((bullet)=>resumeHasTerm(bullet, skill));
        if (idx >= 0) matchedIndexes.push(idx);
    }
    const coverage = matchedIndexes.length / required.length;
    const earlyCount = matchedIndexes.filter((idx)=>idx <= 2).length;
    const earlyPlacement = matchedIndexes.length ? earlyCount / matchedIndexes.length : 0;
    return {
        coverage,
        earlyPlacement,
        coverageScore: coverage >= 0.7 ? 2 : coverage >= 0.4 ? 1 : -1,
        orderScore: earlyPlacement >= 0.7 ? 1 : 0
    };
}
function scoreRoleRelevance({ keywordProfile, experienceProjectsText, skillsText, summaryText, resumeText }) {
    // Give full credit for skills appearing in experience bullets, and 0.4× partial
    // credit for skills that are only listed in the Skills section (not woven into
    // experience descriptions). This prevents an unfair 0% score when a candidate
    // properly lists their tech stack in a dedicated Skills section.
    const expTerms = unique([
        ...keywordProfile.core_skills || [],
        ...keywordProfile.domain_keywords || []
    ].map(cleanKeyword).filter(Boolean)).slice(0, 20);
    const expInExp = expTerms.filter((t)=>resumeHasTerm(experienceProjectsText, t)).length;
    const expInSkillsOnly = expTerms.filter((t)=>!resumeHasTerm(experienceProjectsText, t) && resumeHasTerm(skillsText, t)).length;
    const experienceRatio = expTerms.length ? Math.min(1, (expInExp + expInSkillsOnly * 0.4) / expTerms.length) : 0;
    const skillsRatio = ratioForTerms(skillsText, [
        ...keywordProfile.core_skills || [],
        ...keywordProfile.tools || []
    ]);
    const toolsRatio = ratioForTerms(`${skillsText}\n${experienceProjectsText}`, keywordProfile.tools || []);
    const titleSummaryRatio = ratioForTerms(summaryText, keywordProfile.target_role || []);
    const domainRatio = ratioForTerms(`${summaryText}\n${experienceProjectsText}`, keywordProfile.domain_keywords || []);
    const score = experienceRatio * DIMENSION_MAX.F * 0.45 + skillsRatio * DIMENSION_MAX.F * 0.25 + toolsRatio * DIMENSION_MAX.F * 0.15 + titleSummaryRatio * DIMENSION_MAX.F * 0.10 + domainRatio * DIMENSION_MAX.F * 0.05;
    return {
        score: Math.round(score),
        breakdown: {
            experienceProjectsCoreMatch: Number((experienceRatio * 100).toFixed(1)),
            skillsCoreMatch: Number((skillsRatio * 100).toFixed(1)),
            toolsMatch: Number((toolsRatio * 100).toFixed(1)),
            titleSummaryAliasMatch: Number((titleSummaryRatio * 100).toFixed(1)),
            domainKeywordMatch: Number((domainRatio * 100).toFixed(1))
        }
    };
}
function ratioForTerms(text, terms) {
    const cleanTerms = unique((terms || []).map(cleanKeyword).filter(Boolean)).slice(0, 20);
    if (!cleanTerms.length) return 0;
    const matched = cleanTerms.filter((term)=>resumeHasTerm(text, term));
    return matched.length / cleanTerms.length;
}
// ── Experience date & structure helpers ──────────────────────────────────────
const MONTH_ABBR_MAP = {
    jan: 1,
    feb: 2,
    mar: 3,
    apr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    aug: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dec: 12,
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12
};
function extractJobDateRange(line) {
    const s = normalizeText(line).toLowerCase();
    const re = /(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(20\d{2}|19\d{2})\s*[-–—]\s*(?:(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+)?(20\d{2}|19\d{2}|present|current|now)/i;
    const match = s.match(re);
    if (!match) return null;
    const [, startMonStr, startYearStr, endMonStr, endYearStr] = match;
    const startYear = parseInt(startYearStr);
    const startMonth = startMonStr ? MONTH_ABBR_MAP[startMonStr.slice(0, 3)] || 6 : 6;
    const isCurrent = /present|current|now/.test(endYearStr);
    const endYear = isCurrent ? new Date().getFullYear() : parseInt(endYearStr);
    const endMonth = endMonStr ? MONTH_ABBR_MAP[endMonStr.slice(0, 3)] || 6 : isCurrent ? new Date().getMonth() + 1 : 6;
    return {
        startYear,
        startMonth,
        endYear,
        endMonth,
        isCurrent,
        durationMonths: (endYear - startYear) * 12 + (endMonth - startMonth)
    };
}
// Returns true if a line looks like a company name or location header — used to
// distinguish real company/location lines from bullet wrap-around continuations
// that also happen to start with an uppercase letter (e.g. "DNS resolution, …").
function isCompanyOrLocationLine(line) {
    // Legal entity suffixes
    if (/\b(inc\.?|l\.?l\.?c\.?|ltd\.?|co\.,|corp\.?|p\.?c\.?|llp|pllc)\b/i.test(line)) return true;
    // Common company-type words
    if (/\b(technology|technologies|tech|systems?|solutions?|consulting|consultancy|group|laboratory|laboratories|labs?|studio|agency|agencies|enterprises?|holdings?|capital|ventures?)\b/i.test(line)) return true;
    // Country names
    if (/\b(china|usa|united states|canada|uk|england|australia|germany|japan|france|india|korea|singapore|hong kong|taiwan)\b/i.test(line)) return true;
    // "City, ST" two-letter state abbreviation
    if (/,\s*(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/i.test(line)) return true;
    return false;
}
function parseExperienceEntries(expText) {
    const lines = normalizeText(expText).split("\n").map((l)=>l.trim()).filter(Boolean);
    const entries = [];
    let current = null;
    for(let i = 0; i < lines.length; i++){
        const line = lines[i];
        const dr = extractJobDateRange(line);
        if (dr) {
            // ── Look back for company / location header lines ─────────────────────
            // In many resume formats the company name and city appear on the line(s)
            // BEFORE the date range, e.g.:
            //   Shenzhen Meida Technology Co., Ltd.  Shenzhen, China
            //   Software Engineer  Mar 2022 – Jun 2022   ← date range line
            // Use isCompanyOrLocationLine() to filter out bullet wrap-around lines
            // that also happen to start with uppercase (e.g. "DNS resolution, …").
            const headerLines = [];
            for(let j = i - 1; j >= Math.max(0, i - 3); j--){
                const prev = lines[j];
                const isBullet = prev.startsWith("-") || prev.startsWith("•");
                const hasYear = /\d{4}/.test(prev);
                const isUpperStart = /^[A-Z0-9一-鿿]/.test(prev);
                // No length cap here — PDF column-spacing can produce very long lines
                // (e.g. "Shenzhen Meida Technology Co., Ltd.          Shenzhen, China").
                // isCompanyOrLocationLine() is the real filter; length would block valid headers.
                if (!isBullet && !hasYear && isUpperStart && isCompanyOrLocationLine(prev)) {
                    headerLines.unshift(prev);
                } else {
                    break;
                }
            }
            if (current) entries.push(current);
            current = {
                dateRange: dr,
                titleLines: [
                    ...headerLines,
                    line
                ],
                rawText: [
                    ...headerLines,
                    line
                ].join("\n")
            };
        } else if (current) {
            current.rawText += "\n" + line;
            const isBulletLine = line.startsWith("-") || line.startsWith("•");
            // Lowercase-starting lines are wrap-around continuations of bullet text
            // (e.g. "with native Kotlin modules…") — never a job title or company name
            const isContinuation = /^[a-z]/.test(line);
            if (line.length < 300 && !isBulletLine && !isContinuation) {
                current.titleLines.push(line);
            }
        }
    }
    if (current) entries.push(current);
    return entries;
}
function checkChronologicalOrder(entries) {
    if (entries.length < 2) return true;
    for(let i = 0; i < entries.length - 1; i++){
        const a = entries[i].dateRange;
        const b = entries[i + 1].dateRange;
        if (a.startYear * 12 + a.startMonth < b.startYear * 12 + b.startMonth) return false;
    }
    return true;
}
function detectShortTenures(entries) {
    const issues = [];
    for (const entry of entries){
        const dur = entry.dateRange.durationMonths;
        if (dur >= 0 && dur <= 3) {
            const text = entry.titleLines.join(" ").toLowerCase();
            const isIntern = /intern|internship|co-?op|contractor|contract\b|temp\b|temporary|part[- ]time|volunteer/i.test(text);
            if (!isIntern) {
                // Priority 1: a line that looks like a company name (has legal/tech suffix)
                const companyLine = entry.titleLines.find((l)=>!/\d{4}/.test(l) && /\b(inc\.?|l\.?l\.?c\.?|ltd\.?|co\.,|corp\.?|technology|technologies|tech|systems?|solutions?|consulting|group|enterprises?)\b/i.test(l));
                // Priority 2: first line without a year that is NOT just a standalone country/city word
                const fallbackLine = entry.titleLines.find((l)=>!/\d{4}/.test(l) && !/^(china|usa|united states|remote|canada|uk|australia)$/i.test(l.trim()));
                // Priority 3: strip date portion from first titleLine
                const strippedFirst = (entry.titleLines[0] || "").replace(/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}|\d{4}\s*[-–—]\s*(?:\d{4}|present|current|now)/gi, "").trim();
                const rawTitle = companyLine || fallbackLine || strippedFirst;
                issues.push({
                    title: rawTitle.slice(0, 60),
                    durationMonths: dur
                });
            }
        }
    }
    return issues;
}
function computeMustHaveFrequencyBonus(coreSkills, resumeText) {
    if (!coreSkills || !coreSkills.length) return 0;
    const topSkills = coreSkills.slice(0, 5);
    const lower = normalizeText(resumeText).toLowerCase();
    let total = 0;
    for (const skill of topSkills){
        const clean = cleanKeyword(skill);
        if (!clean) continue;
        total += (lower.match(new RegExp(escapeRegExp(clean), "gi")) || []).length;
    }
    if (total >= 15) return 2;
    if (total >= 8) return 1;
    return 0;
}
function checkJdPriorityAlignment(coreSkills, firstJobText) {
    if (!coreSkills || !coreSkills.length || !firstJobText) return 0;
    const topSkills = coreSkills.slice(0, 4);
    const matched = topSkills.filter((skill)=>resumeHasTerm(firstJobText, skill));
    if (matched.length >= 3) return 2;
    if (matched.length >= 1) return 1;
    return 0;
}
// ── File / format helpers ─────────────────────────────────────────────────────
function analyzeFileName(fileName) {
    if (!fileName) return {
        score: 0,
        issues: []
    };
    const issues = [];
    const fn = fileName.replace(/\.(pdf|docx?|txt)$/i, "").toLowerCase();
    const hasCorrectResume = fn.includes("resume");
    const hasMisspelling = !hasCorrectResume && [
        "remuse",
        "resme",
        "rsume",
        "reesume",
        "reusme",
        "resumee"
    ].some((m)=>fn.includes(m));
    const hasNumberSuffix = /\(\d+\)/.test(fn);
    const parts = fn.split(/[_\s\-./]+/).filter(Boolean);
    const hasCopySuffix = parts.some((p)=>[
            "copy",
            "draft",
            "final",
            "new",
            "old"
        ].includes(p) || /^v\d+$/.test(p));
    let score = 0;
    if (hasMisspelling) {
        issues.push('文件名 "resume" 拼写有误（如 remuse、resme），请更正');
        score -= 1;
    } else if (hasCorrectResume) {
        if (hasNumberSuffix) issues.push('文件名含序号后缀如 (1)(2)，请删除并命名为 姓名_Resume.pdf');
        if (hasCopySuffix) issues.push('文件名含 copy/draft 等后缀，请删除');
        if (!hasNumberSuffix && !hasCopySuffix) score += 1;
    } else {
        issues.push('文件名未包含 "resume"，建议命名为 姓名_Resume.pdf');
    }
    return {
        score,
        issues
    };
}
function hasInconsistentDateFormat(text) {
    const hasSpelledMonths = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec)\b/i.test(text);
    const hasNumericMonthDates = /\b(0?[1-9]|1[0-2])\s*\/\s*(20\d{2}|19\d{2})\b/.test(text);
    return hasSpelledMonths && hasNumericMonthDates;
}
function detectChinaExperience(expText, fullText, entries = []) {
    const textToCheck = normalizeText(expText && expText.trim().length > 50 ? expText : fullText);
    const chinaPattern = /\b(beijing|shanghai|shenzhen|guangzhou|chengdu|hangzhou|nanjing|wuhan|tianjin|xi'?an|chongqing|suzhou|zhengzhou|qingdao|dongguan|china|p\.?r\.?\s*china|chinese market)\b/i;
    const chineseCompanyPattern = /\b(alibaba|tencent|baidu|huawei|xiaomi|jd\.com|bytedance|didi|meituan|netease|pinduoduo|ctrip|sina|sohu|lenovo|haier|byd|zte|oppo|vivo|weibo)\b/i;
    // Expanded US city/state list — includes commonly used California cities
    const usPattern = /\b(new york|san francisco|los angeles|chicago|seattle|boston|austin|houston|dallas|atlanta|denver|miami|phoenix|san jose|san diego|irvine|santa clara|sunnyvale|mountain view|palo alto|menlo park|redwood city|cupertino|fremont|oakland|berkeley|pasadena|long beach|anaheim|santa ana|riverside|silicon valley|bay area|nyc|new jersey|philadelphia|portland|minneapolis|pittsburgh|detroit|nashville|charlotte|indianapolis|columbus|memphis|baltimore|raleigh|tampa|orlando|las vegas|salt lake city|cincinnati|kansas city|st\.?\s*louis|sacramento|washington|district of columbia|california|texas|florida|illinois|ohio|georgia|colorado|massachusetts|virginia|pennsylvania|new york state|remote|united states|u\.s\.a?\.?|usa)\b/i;
    // "City, ST" two-letter state abbreviation — most reliable US address signal.
    // Uses /i flag so it also catches lowercased text from PDF extraction ("irvine, ca").
    const usStateAbbrevPattern = /,\s*(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/i;
    const hasChina = (t)=>chinaPattern.test(t) || chineseCompanyPattern.test(t);
    const hasUS = (t)=>usPattern.test(t) || usStateAbbrevPattern.test(t);
    // ── Per-entry detection + full-text US fallback ──────────────────────────────
    // Why full-text fallback matters: many resumes put "City, ST" on the line BEFORE
    // the date range. parseExperienceEntries starts each entry at the date-range line,
    // so "Irvine, CA" placed above the date is NOT captured in entry.rawText.
    // Solution: when per-entry US count is 0 but China signals exist, also scan the
    // full experience text before declaring allChina = true.
    if (entries && entries.length > 0) {
        let chinaCount = 0;
        let usCount = 0;
        for (const entry of entries){
            const t = normalizeText(entry.rawText || "");
            if (hasChina(t)) chinaCount++;
            if (hasUS(t)) usCount++;
        }
        if (chinaCount > 0 || usCount > 0) {
            // If no US signals found in per-entry text, also check the full experience
            // block — location lines that precede the date will be caught here.
            const effectiveHasUS = usCount > 0 || hasUS(textToCheck);
            return {
                allChina: chinaCount > 0 && !effectiveHasUS,
                hasAnyChinaExp: chinaCount > 0
            };
        }
    // No signals at all in any entry — fall through to full-text check.
    }
    // ── Full-text fallback ────────────────────────────────────────────────────────
    const hasChinaSignals = hasChina(textToCheck);
    const hasUsSignals = hasUS(textToCheck);
    return {
        allChina: hasChinaSignals && !hasUsSignals,
        hasAnyChinaExp: hasChinaSignals
    };
}
// ── New rule helpers ─────────────────────────────────────────────────────────
function hasInconsistentMonthStyle(text) {
    // Flag if both full names (January) and abbreviations (Jan) appear in date context
    const hasFullMonth = /\b(January|February|March|April|June|July|August|September|October|November|December)\s+\d{4}/i.test(text);
    const hasAbbrMonth = /\b(Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\.?\s+\d{4}/i.test(text);
    return hasFullMonth && hasAbbrMonth;
}
function checkGPA(educationText) {
    return /\b(GPA|G\.P\.A\.)\s*[:;]?\s*\d\.\d|\b\d\.\d+\s*[\/]\s*4(\.\d+)?\b/i.test(educationText);
}
function checkSectionHasDates(text) {
    return /\b(19|20)\d{2}\b/.test(text);
}
function checkExperienceLocations(expEntries) {
    if (!expEntries.length) return {
        allHaveLocation: true,
        missingCount: 0
    };
    const locationRe = /\b[A-Z][a-z]+,\s*[A-Z]{2}\b|\b(Remote|Hybrid|On-?site)\b/i;
    const missing = expEntries.filter((e)=>!locationRe.test(e.titleLines.join(" ")));
    return {
        allHaveLocation: missing.length === 0,
        missingCount: missing.length
    };
}
function checkJobTitleAlignment(expEntries, jobTitle) {
    if (!jobTitle || !expEntries.length) return {
        aligned: true
    };
    const jdWords = jobTitle.toLowerCase().split(/[\s/,\-]+/).filter((w)=>w.length > 3);
    if (!jdWords.length) return {
        aligned: true
    };
    const allTitles = expEntries.flatMap((e)=>e.titleLines).join(" ").toLowerCase();
    const matchCount = jdWords.filter((w)=>allTitles.includes(w)).length;
    return {
        aligned: matchCount >= Math.ceil(jdWords.length * 0.5)
    };
}
// ── Verb diversity analysis ───────────────────────────────────────────────────
// Returns the base STRONG_VERB that `bulletLine` starts with, or null.
// Longest-match wins (e.g. "managed" beats "manage").
function getStartingVerb(bulletLine) {
    const lower = bulletLine.replace(/^[^a-zA-Z一-鿿]+/, "").toLowerCase().trim();
    if (!lower) return null;
    let best = null;
    for (const v of STRONG_VERBS){
        if (lower.startsWith(v) && (!best || v.length > best.length)) best = v;
    }
    return best;
}
// Counts how often each starting verb is used across all bullet lines.
// Returns diversity stats useful for C-dimension scoring.
function analyzeVerbDiversity(bullets) {
    const verbCounts = {};
    let verbBulletCount = 0;
    for (const bullet of bullets){
        if (!bullet || bullet.trim().length <= 15) continue;
        const verb = getStartingVerb(bullet);
        if (verb) {
            verbBulletCount++;
            verbCounts[verb] = (verbCounts[verb] || 0) + 1;
        }
    }
    const uniqueVerbCount = Object.keys(verbCounts).length;
    const maxRepeat = verbBulletCount > 0 ? Math.max(...Object.values(verbCounts)) : 0;
    const diversityRatio = verbBulletCount > 0 ? uniqueVerbCount / verbBulletCount : 1;
    const repeatedVerbs = Object.entries(verbCounts).filter(([, c])=>c >= 3).sort((a, b)=>b[1] - a[1]).map(([verb, count])=>({
            verb,
            count
        }));
    return {
        verbCounts,
        uniqueVerbCount,
        verbBulletCount,
        diversityRatio,
        repeatedVerbs,
        maxRepeat
    };
}
// ── Soft-skill / tech-skill balance ──────────────────────────────────────────
// Counts unique soft-skill keywords and tech-skill tool terms found in bullet text.
// Returns the raw counts and matched term lists for reporting.
function analyzeSkillBalance(bulletLines) {
    const bulletText = bulletLines.join(" ").toLowerCase();
    // Soft skills: match against SOFT_SKILL_KEYWORDS
    const softMatched = [];
    for (const term of SOFT_SKILL_KEYWORDS){
        const re = term.includes(" ") ? new RegExp(escapeRegExp(term), "i") : new RegExp(`\\b${escapeRegExp(term)}\\b`, "i");
        if (re.test(bulletText)) softMatched.push(term);
    }
    // Tech skills: leverage the existing tools list + common in-bullet tech terms
    const techCandidates = unique([
        ...CATEGORY_PHRASES.tools,
        "algorithm",
        "backend",
        "frontend",
        "full stack",
        "system design",
        "architecture",
        "database",
        "query",
        "pipeline",
        "model",
        "deployment",
        "testing",
        "debugging",
        "code review",
        "version control",
        "git",
        "rest api",
        "graphql",
        "microservice",
        "api",
        "ci/cd",
        "devops",
        "regression",
        "classification",
        "forecasting",
        "statistical"
    ]);
    const techMatched = [];
    const seen = new Set();
    for (const term of techCandidates){
        const clean = term.toLowerCase();
        if (seen.has(clean)) continue;
        seen.add(clean);
        const re = clean.includes(" ") ? new RegExp(escapeRegExp(clean), "i") : new RegExp(`\\b${escapeRegExp(clean)}\\b`, "i");
        if (re.test(bulletText)) techMatched.push(term);
    }
    const softCount = softMatched.length;
    const techCount = techMatched.length;
    const minCount = Math.min(softCount, techCount);
    const maxCount = Math.max(softCount, techCount);
    // ratio = how many times larger the dominant side is (1 = perfectly balanced)
    const ratio = minCount > 0 ? maxCount / minCount : maxCount > 0 ? maxCount : 1;
    return {
        softCount,
        techCount,
        softMatched,
        techMatched,
        ratio
    };
}
// ── Graduation date detection ─────────────────────────────────────────────────
// Returns { year, month, expected } or null.
// `expected: true`  → still enrolled / future graduation (treat as recent grad)
// `expected: false` → already graduated; check year/month against today
function extractGraduationDate(educationText) {
    if (!educationText || !educationText.trim()) return null;
    const lower = normalizeText(educationText).toLowerCase();
    // Currently enrolled or expected graduation
    if (/\b(expected|graduating|anticipated)\b/.test(lower) || /\b(present|current|now)\b/.test(lower)) {
        return {
            expected: true
        };
    }
    const monthPat = "jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec";
    const candidates = [];
    let m;
    // "May 2020 – May 2024" — capture end month + year
    const rangeEndRe = new RegExp(`(?:${monthPat})[a-z]*\\.?\\s+20\\d{2}\\s*[-–—]\\s*((?:${monthPat})[a-z]*\\.?\\s+)?(20\\d{2})`, "gi");
    while((m = rangeEndRe.exec(lower)) !== null){
        const rawMon = (m[1] || "jun").trim().slice(0, 3);
        const idx = monthToIndex(rawMon);
        candidates.push({
            year: parseInt(m[2]),
            month: idx >= 0 ? idx + 1 : 6,
            expected: false
        });
    }
    // "2020 – 2024" year-only ranges
    const yearRangeRe = /\b20\d{2}\s*[-–—]\s*(20\d{2})\b/g;
    while((m = yearRangeRe.exec(lower)) !== null){
        candidates.push({
            year: parseInt(m[1]),
            month: 6,
            expected: false
        });
    }
    if (candidates.length) {
        // Return the most recent end date
        return candidates.reduce((a, b)=>a.year * 12 + a.month >= b.year * 12 + b.month ? a : b);
    }
    // Fallback: any year mentioned
    const years = (lower.match(/\b(20\d{2})\b/g) || []).map(Number);
    if (years.length) return {
        year: Math.max(...years),
        month: 6,
        expected: false
    };
    return null;
}
function analyzeWriteGoodIssues(bulletTexts) {
    try {
        const writeGood = (()=>{
            const e = new Error("Cannot find module 'write-good'");
            e.code = 'MODULE_NOT_FOUND';
            throw e;
        })();
        let passiveCount = 0;
        const flagged = [];
        for (const bullet of bulletTexts.slice(0, 25)){
            const issues = writeGood(bullet, {
                passive: true,
                weasel: false,
                adverb: false,
                illusion: false,
                so: false,
                thereIs: false,
                cliches: false
            });
            if (issues.length > 0) {
                passiveCount += issues.length;
                if (flagged.length < 3) flagged.push({
                    text: bullet.slice(0, 100),
                    reason: issues[0].reason
                });
            }
        }
        return {
            passiveCount,
            flagged
        };
    } catch (e) {
        return {
            passiveCount: 0,
            flagged: []
        };
    }
}
function checkRepetitiveVerbs(bulletLines) {
    const verbCounts = {};
    for (const line of bulletLines){
        const stripped = line.trim().replace(/^[^a-zA-Z]+/, "");
        const firstWord = stripped.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, "");
        if (!firstWord || firstWord.length < 3) continue;
        verbCounts[firstWord] = (verbCounts[firstWord] || 0) + 1;
    }
    const repetitive = Object.entries(verbCounts).filter(([, count])=>count >= 2).sort(([, a], [, b])=>b - a).map(([verb, count])=>({
            verb,
            count
        }));
    const maxCount = repetitive.length ? repetitive[0].count : 0;
    const maxVerb = repetitive.length ? repetitive[0].verb : null;
    return {
        repetitive,
        maxCount,
        maxVerb
    };
}
// ── Candidate profile detection ──────────────────────────────────────────────
function detectSeniority(expEntries) {
    let totalMonths = 0;
    for (const entry of expEntries){
        const dr = entry.dateRange;
        const text = entry.titleLines.join(" ").toLowerCase();
        const isIntern = /intern|internship|co-?op|contractor|temp\b|temporary|part[- ]time|volunteer/i.test(text);
        if (!isIntern && dr.durationMonths > 0) {
            totalMonths += Math.min(dr.durationMonths, 72);
        }
    }
    if (totalMonths < 24) return "entry_level";
    if (totalMonths < 60) return "mid_level";
    return "senior";
}
function buildProfile({ expEntries, isRecentGraduate, targetRole, resumeRole, hasWillingToRelocate, allChina, hasAnyChinaExp }) {
    const seniority = detectSeniority(expEntries);
    let candidateType;
    if (isRecentGraduate || seniority === "entry_level") candidateType = "early_career";
    else if (targetRole.role !== "general" && resumeRole.role !== targetRole.role) candidateType = "career_changer";
    else candidateType = "experienced";
    const market = allChina ? "china" : hasAnyChinaExp ? "mixed" : "us";
    return {
        roleFamily: targetRole.role,
        targetRole: targetRole.role,
        seniority,
        candidateType,
        market,
        willingToRelocate: hasWillingToRelocate
    };
}
// ── Problem tags ─────────────────────────────────────────────────────────────
const PROBLEM_TAG_DEFS = {
    // A
    outdated_resume: {
        dimension: "A",
        topic: "resume_maintenance",
        severity: "medium",
        retrievalWeight: 0.5
    },
    non_chronological_order: {
        dimension: "A",
        topic: "format",
        severity: "high",
        retrievalWeight: 0.3
    },
    inconsistent_date_format: {
        dimension: "A",
        topic: "format",
        severity: "low",
        retrievalWeight: 0.2
    },
    missing_section_dates: {
        dimension: "A",
        topic: "format",
        severity: "low",
        retrievalWeight: 0.2
    },
    file_naming_issue: {
        dimension: "A",
        topic: "format",
        severity: "low",
        retrievalWeight: 0.15
    },
    // B
    missing_summary: {
        dimension: "B",
        topic: "resume_structure",
        severity: "high",
        retrievalWeight: 0.6
    },
    missing_gpa: {
        dimension: "B",
        topic: "education_completeness",
        severity: "medium",
        retrievalWeight: 0.4
    },
    missing_coursework: {
        dimension: "B",
        topic: "education_completeness",
        severity: "medium",
        retrievalWeight: 0.35
    },
    missing_contact_info: {
        dimension: "B",
        topic: "searchability",
        severity: "high",
        retrievalWeight: 0.5
    },
    missing_exp_location: {
        dimension: "B",
        topic: "searchability",
        severity: "low",
        retrievalWeight: 0.25
    },
    // C
    insufficient_quantification: {
        dimension: "C",
        topic: "content_quality",
        severity: "high",
        retrievalWeight: 0.7
    },
    weak_verbs: {
        dimension: "C",
        topic: "content_quality",
        severity: "medium",
        retrievalWeight: 0.6
    },
    passive_voice: {
        dimension: "C",
        topic: "content_quality",
        severity: "medium",
        retrievalWeight: 0.5
    },
    repetitive_verbs: {
        dimension: "C",
        topic: "content_quality",
        severity: "low",
        retrievalWeight: 0.4
    },
    low_bullet_coverage: {
        dimension: "C",
        topic: "content_quality",
        severity: "medium",
        retrievalWeight: 0.5
    },
    short_tenure_unexplained: {
        dimension: "C",
        topic: "career_narrative",
        severity: "high",
        retrievalWeight: 0.6
    },
    // D
    keyword_gap_critical: {
        dimension: "D",
        topic: "keyword_alignment",
        severity: "critical",
        retrievalWeight: 0.9
    },
    keyword_gap_major: {
        dimension: "D",
        topic: "keyword_alignment",
        severity: "high",
        retrievalWeight: 0.75
    },
    keyword_gap_minor: {
        dimension: "D",
        topic: "keyword_alignment",
        severity: "medium",
        retrievalWeight: 0.5
    },
    missing_tools: {
        dimension: "D",
        topic: "tools_alignment",
        severity: "high",
        retrievalWeight: 0.7
    },
    // E
    all_china_experience: {
        dimension: "E",
        topic: "market_fit",
        severity: "critical",
        retrievalWeight: 0.9
    },
    partial_china_experience: {
        dimension: "E",
        topic: "market_fit",
        severity: "high",
        retrievalWeight: 0.7
    },
    no_relocate_signal: {
        dimension: "E",
        topic: "market_fit",
        severity: "medium",
        retrievalWeight: 0.5
    },
    // F
    role_mismatch: {
        dimension: "F",
        topic: "career_positioning",
        severity: "high",
        retrievalWeight: 0.8
    },
    job_title_mismatch: {
        dimension: "F",
        topic: "career_positioning",
        severity: "medium",
        retrievalWeight: 0.55
    },
    summary_missing_role: {
        dimension: "F",
        topic: "career_positioning",
        severity: "medium",
        retrievalWeight: 0.5
    },
    career_growth_optimization: {
        dimension: "F",
        topic: "career_growth",
        severity: "low",
        retrievalWeight: 0.35
    }
};
function makeTag(tagKey) {
    const def = PROBLEM_TAG_DEFS[tagKey];
    if (!def) return null;
    return {
        tag: tagKey,
        ...def
    };
}
function buildProblemTags({ resumeOutdated, isChronological, inconsistentDates, inconsistentMonthStyle, educationHasDates, projectsHasDates, fileNameIssues, hasSummary, isRecentGraduate, hasEducation, hasGPA, hasCoursework, emailValid, phoneValid, expLocationResult, quantifiedCount, weakPhraseCount, writeGoodResult, repetitiveVerbResult, coreSkillBulletCoverage, shortTenures, hasJD, jdMatchRatio, keywordMatch, allChina, hasAnyChinaExp, hasWillingToRelocate, targetRole, resumeRole, jobTitleAligned, summaryMentionsRole, total }) {
    const tags = [];
    const push = (key)=>{
        const t = makeTag(key);
        if (t) tags.push(t);
    };
    // A
    if (resumeOutdated) push("outdated_resume");
    if (!isChronological) push("non_chronological_order");
    if (inconsistentDates || inconsistentMonthStyle) push("inconsistent_date_format");
    if (hasEducation && !educationHasDates || !projectsHasDates) push("missing_section_dates");
    if (fileNameIssues && fileNameIssues.length) push("file_naming_issue");
    // B
    if (!hasSummary && !isRecentGraduate) push("missing_summary");
    if (hasEducation && !hasGPA) push("missing_gpa");
    if (hasEducation && !hasCoursework) push("missing_coursework");
    if (!emailValid || !phoneValid) push("missing_contact_info");
    if (expLocationResult && !expLocationResult.allHaveLocation) push("missing_exp_location");
    // C
    if (quantifiedCount < 3) push("insufficient_quantification");
    if (weakPhraseCount >= 3) push("weak_verbs");
    if (writeGoodResult?.passiveCount >= 2) push("passive_voice");
    if (repetitiveVerbResult?.maxCount >= 2) push("repetitive_verbs");
    if (coreSkillBulletCoverage < 0.4) push("low_bullet_coverage");
    if (shortTenures && shortTenures.length > 0) push("short_tenure_unexplained");
    // D
    if (hasJD) {
        if (jdMatchRatio < 0.3) push("keyword_gap_critical");
        else if (jdMatchRatio < 0.5) push("keyword_gap_major");
        else if (jdMatchRatio < 0.7) push("keyword_gap_minor");
        if ((keywordMatch?.comparison?.tools?.missing?.length || 0) > 2) push("missing_tools");
    }
    // E
    if (allChina) push("all_china_experience");
    else if (hasAnyChinaExp) push("partial_china_experience");
    if (!hasWillingToRelocate && (allChina || hasAnyChinaExp)) push("no_relocate_signal");
    // F
    if (targetRole.role !== "general" && resumeRole.role !== targetRole.role) push("role_mismatch");
    if (jobTitleAligned && !jobTitleAligned.aligned) push("job_title_mismatch");
    if (!summaryMentionsRole) push("summary_missing_role");
    if (total >= 70) push("career_growth_optimization");
    // Sort: critical → high → medium → low
    const order = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3
    };
    return tags.sort((a, b)=>(order[a.severity] ?? 9) - (order[b.severity] ?? 9));
}
// ── Retrieval query ──────────────────────────────────────────────────────────
function buildRetrievalQuery(profile, problemTags, priorityMissingKeywords) {
    const topics = [
        ...new Set(problemTags.map((t)=>t.topic))
    ];
    const tagNames = problemTags.map((t)=>t.tag);
    const priorityKeywords = priorityMissingKeywords.filter((k)=>k.priority === "high" || k.priority === "medium").map((k)=>k.term).slice(0, 5);
    const seniorityExpansion = {
        entry_level: [
            "entry_level",
            "early_career",
            "universal"
        ],
        mid_level: [
            "mid_level",
            "universal"
        ],
        senior: [
            "senior",
            "universal"
        ]
    };
    const queryText = [
        profile.seniority,
        profile.roleFamily,
        ...topics.slice(0, 3),
        ...tagNames.slice(0, 3)
    ].join(" ");
    return {
        roleFamily: profile.roleFamily,
        targetRole: profile.targetRole,
        seniority: profile.seniority,
        topics,
        problemTags: tagNames,
        priorityKeywords,
        queryText,
        filters: {
            roleFamily: [
                profile.roleFamily,
                "universal"
            ],
            seniority: seniorityExpansion[profile.seniority] || [
                "universal"
            ]
        }
    };
}
// ── Diagnostics (frontend-friendly summary) ───────────────────────────────────
function buildDiagnostics({ emailValid, phoneValid, hasLinkedIn, hasPortfolio, hasSummary, hasEducation, hasExperience, inconsistentDates, inconsistentMonthStyle, wordCount, exactJobTitle, jobTitle, quantifiedCount }) {
    return {
        searchability: {
            hasEmail: emailValid,
            hasPhone: phoneValid,
            hasLinkedIn,
            hasPortfolio,
            hasSummary,
            hasEducation,
            hasExperience,
            dateFormattingValid: !inconsistentDates && !inconsistentMonthStyle,
            wordCount
        },
        jobTitleMatch: {
            exactMatch: exactJobTitle?.exact || false,
            targetTitle: exactJobTitle?.targetTitle || jobTitle || "",
            severity: (exactJobTitle?.penalty ?? 0) === 0 ? "none" : "low"
        },
        measurableResults: {
            count: quantifiedCount,
            status: quantifiedCount >= 8 ? "strong" : quantifiedCount >= 5 ? "good" : quantifiedCount >= 3 ? "fair" : "weak"
        }
    };
}
// ── Priority missing keywords ─────────────────────────────────────────────────
function generateKeywordReason(term, type, roleName) {
    switch(type){
        case "hard_skill":
            return `Core skill expected for ${roleName} roles; add to experience bullets or skills section to improve ATS match.`;
        case "tool":
            return `Commonly required tool in ${roleName} job descriptions; add to skills if you have experience with it.`;
        case "domain":
            return `Domain keyword that signals ${roleName} knowledge; consider adding to summary or experience context.`;
        case "soft_skill":
            return `Action verb from the JD; can be naturally incorporated into existing experience bullets.`;
        case "nice_to_have":
            return `Nice-to-have qualification; add if applicable to your background.`;
        default:
            return `Appears in the JD; adding it can improve overall keyword match rate.`;
    }
}
function buildPriorityMissingKeywords(keywordMatch, targetRole) {
    const comparison = keywordMatch?.comparison || {};
    const roleName = targetRole?.role?.replace(/_/g, " ") || "this";
    const categoryConfig = [
        {
            key: "core_skills",
            priority: "high",
            type: "hard_skill"
        },
        {
            key: "tools",
            priority: "high",
            type: "tool"
        },
        {
            key: "domain_keywords",
            priority: "medium",
            type: "domain"
        },
        {
            key: "action_verbs",
            priority: "low",
            type: "soft_skill"
        },
        {
            key: "nice_to_have",
            priority: "low",
            type: "nice_to_have"
        }
    ];
    const result = [];
    for (const { key, priority, type } of categoryConfig){
        const missing = comparison[key]?.missing || [];
        for (const term of missing.slice(0, 4)){
            result.push({
                term,
                priority,
                category: type,
                safeToAdd: true,
                reason: generateKeywordReason(term, type, roleName)
            });
        }
    }
    const order = {
        high: 0,
        medium: 1,
        low: 2
    };
    return result.sort((a, b)=>(order[a.priority] ?? 9) - (order[b.priority] ?? 9)).slice(0, 10);
}
function scoreResumeATS(resumeText, jobTitle = "", jdText = "", options = {}) {
    const normalized = normalizeText(resumeText);
    if (!normalized.trim()) throw new Error("resumeText is required");
    const lowerResume = normalized.toLowerCase();
    const lines = normalized.split("\n");
    const sections = parseSections(normalized);
    const summaryText = sectionText(sections, [
        "summary",
        "header"
    ]);
    const experienceProjectsText = sectionText(sections, [
        "experience",
        "projects"
    ]);
    const skillsText = sectionText(sections, [
        "skills"
    ]);
    const educationText = sectionText(sections, [
        "education"
    ]);
    const hasCoursework = /\b(coursework|relevant courses?|related courses?|course work)\b/i.test(educationText);
    const projectsText = sectionText(sections, [
        "projects"
    ]);
    const hasGPA = checkGPA(educationText);
    const educationHasDates = !educationText.trim() || checkSectionHasDates(educationText);
    const projectsHasDates = !projectsText.trim() || checkSectionHasDates(projectsText);
    const inconsistentMonthStyle = hasInconsistentMonthStyle(normalizeText(resumeText));
    const rawBullets = getBulletLines(normalized).map((l)=>l.replace(/^[-•*]\s*/, ""));
    const writeGoodResult = analyzeWriteGoodIssues(rawBullets);
    const repetitiveVerbResult = checkRepetitiveVerbs(getBulletLines(normalized));
    const verbDiversity = analyzeVerbDiversity(rawBullets);
    const skillBalance = analyzeSkillBalance(rawBullets);
    const experienceBullets = bulletsFromSection(experienceProjectsText);
    const bulletLines = getBulletLines(normalized);
    const hasJD = Boolean(jdText && jdText.trim());
    let A = 0;
    const coreSections = [
        "experience",
        "education",
        "skills"
    ].filter((s)=>lowerResume.includes(s)).length;
    const supportSections = [
        "projects",
        "summary",
        "objective",
        "profile",
        "certifications",
        "awards"
    ].filter((s)=>lowerResume.includes(s)).length;
    A += coreSections * 1.5; // max 4.5 for all 3 core sections
    if (supportSections > 0) A += 0.5;
    if (bulletLines.length >= 8) A += 1;
    else if (bulletLines.length >= 4) A += 0.5;
    if (normalized.length >= 700 && normalized.length <= 9000) A += 1;
    else if (normalized.length < 400) A -= 2;
    else if (normalized.length > 9000) A -= 1;
    const fileNameResult = analyzeFileName(options.fileName);
    A += fileNameResult.score;
    if (hasInconsistentDateFormat(normalized)) A -= 1;
    if (inconsistentMonthStyle) A -= 0.5;
    if (educationText.trim() && !educationHasDates) A -= 0.5;
    if (projectsText.trim() && !projectsHasDates) A -= 0.5;
    // chronological order check runs after expEntries is available — applied post-hoc below
    A = clamp(A, 0, 8);
    let B = 0;
    const hasEmail = /@[\w.-]+\.\w{2,}/.test(normalized);
    const emailValid = hasEmail && /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(normalized);
    const isGmail = hasEmail && /@gmail\.com\b/i.test(normalized);
    const phoneInfo = analyzePhone(normalized);
    const hasWillingToRelocate = /willing\s+to\s+(re)?locate|open\s+to\s+(re)?locat|\brelocate\b|\brelocation\b/i.test(normalized);
    if (hasEmail && emailValid) B += isGmail ? 2.5 : 2;
    else if (hasEmail && !emailValid) B -= 0.5;
    if (phoneInfo.valid) B += 1;
    else if (phoneInfo.present) B -= 0.5;
    if (/linkedin\.com\/in\/|linkedin/i.test(normalized)) B += 2;
    // "Willing to relocate" is scored in E dimension only — no duplicate here
    const hasSummary = Boolean((sections.summary || "").trim());
    // Graduation-date aware summary rule:
    //   - Graduated ≤ 12 months ago (or still enrolled) → summary is optional
    //   - Graduated > 12 months ago → summary is mandatory
    const gradInfo = extractGraduationDate(educationText);
    let isRecentGraduate = false;
    if (gradInfo) {
        if (gradInfo.expected) {
            isRecentGraduate = true; // still enrolled / expected graduation
        } else {
            const _now = new Date();
            const monthsSince = (_now.getFullYear() - gradInfo.year) * 12 + (_now.getMonth() + 1 - gradInfo.month);
            isRecentGraduate = monthsSince >= 0 && monthsSince <= 12;
        }
    }
    if (hasSummary) B += 1;
    else if (!isRecentGraduate) B -= 1; // mandatory for candidates > 1 yr post-graduation
    // Coursework in Education boosts ATS keyword density; penalise if section exists but coursework is absent
    if (educationText.trim() && !hasCoursework) B -= 0.5;
    // GPA is expected in Education section
    if (educationText.trim() && !hasGPA) B -= 0.5;
    B = clamp(B, 0, 7);
    let C = 0;
    const quantifiedCount = countQuantifiedResults(normalized);
    if (quantifiedCount >= 8) C += 5;
    else if (quantifiedCount >= 5) C += 4;
    else if (quantifiedCount >= 3) C += 3;
    else if (quantifiedCount >= 1) C += 1;
    const strongVerbCount = countStrongVerbStarts(lines);
    if (strongVerbCount >= 8) C += 4;
    else if (strongVerbCount >= 5) C += 3;
    else if (strongVerbCount >= 3) C += 2;
    else if (strongVerbCount >= 1) C += 1;
    const impactCount = (normalized.match(/\b(result|impact|improv|reduc|increas|achiev|enabl|boost|cut|sav|generat|drove|delivered|launched|grew|decreas)/gi) || []).length;
    if (impactCount >= 6) C += 2;
    else if (impactCount >= 3) C += 1.5;
    else if (impactCount >= 1) C += 1;
    if (bulletLines.length >= 5) C += 1;
    if (countWeakPhrases(normalized) >= 3) C -= 1;
    if (writeGoodResult.passiveCount >= 5) C -= 1;
    else if (writeGoodResult.passiveCount >= 2) C -= 0.5;
    if (repetitiveVerbResult.maxCount >= 3) C -= 1;
    else if (repetitiveVerbResult.maxCount >= 2) C -= 0.5;
    // Verb diversity: penalise when the same verb is overused
    if (verbDiversity.verbBulletCount >= 5) {
        if (verbDiversity.diversityRatio < 0.35 || verbDiversity.maxRepeat >= 5) C -= 2;
        else if (verbDiversity.diversityRatio < 0.55 || verbDiversity.maxRepeat >= 4) C -= 1;
    }
    // Skill balance: penalise extreme imbalance (one side > 5× the other)
    if (rawBullets.length >= 5 && skillBalance.softCount > 0 && skillBalance.techCount > 0 && skillBalance.ratio > 5) {
        C -= 1;
    }
    const keywordProfile = buildKeywordProfile(jdText, jobTitle);
    const keywordMatch = compareKeywordProfile(keywordProfile, normalized);
    const coreBulletSignal = analyzeCoreSkillBulletPlacement(experienceBullets, keywordProfile.core_skills);
    C += coreBulletSignal.coverageScore;
    C += coreBulletSignal.orderScore;
    C = clamp(C, 0, DIMENSION_MAX.C);
    const jdKeywords = keywordMatch.allTerms;
    const jdHits = keywordMatch.allMatched.length;
    const jdMatchRatio = keywordMatch.softTermCount ? keywordMatch.hardCoverage * 0.78 + keywordMatch.softCoverage * 0.22 : keywordMatch.hardTermCount ? keywordMatch.hardCoverage : keywordMatch.ratio;
    const D = jdKeywords.length ? scoreByRatio(jdMatchRatio, DIMENSION_MAX.D) : 13;
    const expText = sections.experience || "";
    const expEntries = parseExperienceEntries(expText);
    const isChronological = checkChronologicalOrder(expEntries);
    const shortTenures = detectShortTenures(expEntries);
    const expLocationResult = checkExperienceLocations(expEntries);
    const jobTitleAligned = checkJobTitleAlignment(expEntries, jobTitle);
    // Apply B deduction for missing experience locations (post-hoc, after expEntries available)
    if (!expLocationResult.allHaveLocation) B = clamp(B - Math.min(expLocationResult.missingCount * 0.5, 1), 0, 7);
    const mustHaveFreqBonus = computeMustHaveFrequencyBonus(keywordProfile.core_skills, normalized);
    const priorityAlignmentBonus = checkJdPriorityAlignment(keywordProfile.core_skills, expEntries[0]?.rawText || "");
    // Apply A deduction for non-chronological order (computed after expEntries)
    if (!isChronological) A = clamp(A - 1, 0, 8);
    // Rule: most recent experience > 3 months ago → resume may be outdated
    const resumeOutdated = latestDateOlderThanMonths(expText, 3);
    if (resumeOutdated) A = clamp(A - 1, 0, 8);
    // Apply C adjustments: short tenure penalty + JD priority alignment bonus
    if (shortTenures.length >= 2) C = clamp(C - 2, 0, DIMENSION_MAX.C);
    else if (shortTenures.length === 1) C = clamp(C - 1, 0, DIMENSION_MAX.C);
    C = clamp(C + priorityAlignmentBonus, 0, DIMENSION_MAX.C);
    // Apply D frequency bonus for must-have skills (capped at max)
    let D_final = jdKeywords.length ? clamp(D + mustHaveFreqBonus, 0, DIMENSION_MAX.D) : D;
    if (keywordMatch.experienceEvidence.skillsOnlyShare > 0.6 && keywordMatch.experienceEvidence.inExperienceCount < 3) {
        D_final = Math.min(D_final, Math.round(DIMENSION_MAX.D * 0.6));
    }
    const { allChina, hasAnyChinaExp } = detectChinaExperience(expText, normalized, expEntries);
    let E = 0;
    if (allChina) {
        E = 2; // 80% deduction: max 2pt
    } else if (hasAnyChinaExp) {
        E = 3; // 65% deduction: max ~3.5pt
    } else {
        E = 8; // US/international baseline
    }
    if (hasWillingToRelocate) E = Math.min(10, E + 2);
    E = clamp(Math.round(E * 0.5), 0, DIMENSION_MAX.E);
    const summaryMentionsRole = keywordProfile.target_role.some((role)=>resumeHasTerm(summaryText, role)) || extractKeywords(jobTitle).some((kw)=>resumeHasTerm(summaryText, kw));
    const fScore = scoreRoleRelevance({
        keywordProfile,
        experienceProjectsText,
        skillsText,
        summaryText,
        resumeText: normalized
    });
    let F = fScore.score;
    if (summaryMentionsRole) F = Math.min(DIMENSION_MAX.F, F + 2);
    const roleSource = `${jobTitle}\n${jdText}`;
    const targetRole = detectRoleFamily(roleSource || jobTitle);
    const resumeRole = detectRoleFamily(normalized);
    F = clamp(F, 0, DIMENSION_MAX.F);
    const wordCount = normalized.split(/\s+/).filter(Boolean).length;
    const hasExperience = Boolean(expText.trim());
    const profile = buildProfile({
        expEntries,
        isRecentGraduate,
        targetRole,
        resumeRole,
        hasWillingToRelocate,
        allChina,
        hasAnyChinaExp
    });
    const rawTotal = A + B + C + D_final + E + F;
    const formatPenaltyTriggered = A < 8 * 0.6 || B < 7 * 0.6;
    const formatPenaltyReason = [];
    if (A < 8 * 0.6) formatPenaltyReason.push(`格式规范（A 维度）仅 ${A}/8 分`);
    if (B < 7 * 0.6) formatPenaltyReason.push(`基本资料（B 维度）仅 ${B}/7 分`);
    const exactJobTitle = analyzeExactJobTitleMatch(normalized, jobTitle, keywordProfile);
    const scoreCaps = buildScoreCaps({
        keywordMatch,
        exactJobTitle,
        D_final,
        F
    });
    const cappedTotal = scoreCaps.length ? Math.min(rawTotal, ...scoreCaps.map((cap)=>cap.max)) : rawTotal;
    const total = formatPenaltyTriggered ? Math.min(cappedTotal, 54) : cappedTotal;
    const risk = formatPenaltyTriggered ? "高" : total >= 75 ? "低" : total >= 55 ? "中" : "高";
    const missingKeywords = keywordMatch.allMissing;
    const coreSectionNames = [
        "experience",
        "education",
        "skills"
    ].filter((s)=>lowerResume.includes(s));
    const weakPhraseCount = countWeakPhrases(normalized);
    const hasEducation = /education|university|college|bachelor|master|degree/i.test(normalized);
    const phonePresent = analyzePhone(normalized).present;
    const inconsistentDates = hasInconsistentDateFormat(normalized);
    const priorityMissingKeywords = buildPriorityMissingKeywords(keywordMatch, targetRole);
    const problemTagsInput = {
        resumeOutdated,
        isChronological,
        inconsistentDates,
        inconsistentMonthStyle,
        educationHasDates,
        projectsHasDates,
        fileNameIssues: fileNameResult.issues,
        hasSummary,
        isRecentGraduate,
        hasEducation,
        hasGPA,
        hasCoursework,
        emailValid,
        phoneValid: phoneInfo.valid,
        expLocationResult,
        quantifiedCount,
        weakPhraseCount,
        writeGoodResult,
        repetitiveVerbResult,
        coreSkillBulletCoverage: coreBulletSignal.coverage,
        shortTenures,
        hasJD,
        jdMatchRatio,
        keywordMatch,
        allChina,
        hasAnyChinaExp,
        hasWillingToRelocate,
        targetRole,
        resumeRole,
        jobTitleAligned,
        summaryMentionsRole,
        total
    };
    const problemTags = buildProblemTags(problemTagsInput);
    const diagnostics = buildDiagnostics({
        emailValid,
        phoneValid: phoneInfo.valid,
        hasLinkedIn: /linkedin\.com\/in\/|linkedin/i.test(normalized),
        hasPortfolio: /\b\w[\w-]*\.(me|dev|io|app|site|co)\b/i.test(normalized) || /github\.io/i.test(normalized),
        hasSummary,
        hasEducation,
        hasExperience,
        inconsistentDates,
        inconsistentMonthStyle,
        wordCount,
        exactJobTitle,
        jobTitle,
        quantifiedCount
    });
    const retrievalQuery = buildRetrievalQuery(profile, problemTags, priorityMissingKeywords);
    const problems = buildProblems({
        hasEmail,
        hasJD,
        jdMatchRatio,
        quantifiedCount,
        strongVerbCount,
        impactCount,
        bulletCount: bulletLines.length,
        missingKeywords,
        keywordMatch,
        targetRole,
        resumeRole,
        allChina,
        hasAnyChinaExp,
        formatPenaltyTriggered,
        isChronological,
        shortTenures,
        exactJobTitle,
        scoreCaps
    });
    const suggestions = buildSuggestions({
        hasJD,
        missingKeywords,
        keywordMatch,
        quantifiedCount,
        strongVerbCount,
        impactCount,
        targetRole,
        resumeRole,
        allChina,
        hasAnyChinaExp,
        isChronological,
        shortTenures,
        hasSummary,
        isRecentGraduate,
        exactJobTitle
    });
    const dimensionProblems = buildDimensionProblems({
        checks: {
            fileNameIssues: fileNameResult.issues,
            inconsistentDates,
            inconsistentMonthStyle,
            isChronological,
            emailValid,
            isGmail,
            phoneValid: analyzePhone(normalized).valid,
            hasLinkedIn: /linkedin\.com\/in\/|linkedin/i.test(normalized),
            hasPortfolio: /\b\w[\w-]*\.(me|dev|io|app|site|co)\b/i.test(normalized) || /github\.io/i.test(normalized),
            hasWillingToRelocate,
            hasSummary,
            isRecentGraduate,
            summaryMentionsRole,
            allChina,
            hasAnyChinaExp,
            hasCoursework,
            hasGPA,
            educationHasDates,
            projectsHasDates,
            expLocationResult,
            jobTitleAligned,
            exactJobTitle,
            scoreCaps,
            writeGoodResult,
            repetitiveVerbResult,
            verbDiversity,
            skillBalance,
            resumeOutdated,
            coreSkillBulletCoverage: coreBulletSignal.coverage,
            coreSkillEarlyPlacement: coreBulletSignal.earlyPlacement,
            fBreakdown: fScore.breakdown
        },
        coreSections: coreSectionNames,
        coreSectionCount: coreSections,
        resumeLength: normalized.length,
        hasEmail,
        phonePresent,
        hasEducation,
        hasProjects: Boolean(projectsText.trim()),
        quantifiedCount,
        strongVerbCount,
        impactCount,
        weakPhraseCount,
        bulletCount: bulletLines.length,
        shortTenures,
        hasJD,
        jdMatchRatio,
        keywordMatch,
        targetRole,
        resumeRole
    });
    const potentialGain = (D < 20 ? 8 : 0) + (C < 10 ? 6 : 0) + (F < 13 ? 4 : 0) + (A < 6 ? 3 : 0) + (B < 5 ? 2 : 0);
    return {
        engine: "rule-based",
        version: "0.1.0",
        jobTitle: jobTitle || null,
        hasJD,
        total,
        risk,
        formatPenaltyTriggered,
        formatPenaltyReason,
        dimensions: {
            A: {
                score: A,
                max: 8,
                label: "文件与格式规范"
            },
            B: {
                score: B,
                max: 7,
                label: "基本资料完整性"
            },
            C: {
                score: C,
                max: DIMENSION_MAX.C,
                label: "内容质量与成果表达"
            },
            D: {
                score: D_final,
                max: DIMENSION_MAX.D,
                label: "JD 关键词匹配度"
            },
            E: {
                score: E,
                max: DIMENSION_MAX.E,
                label: "地域与市场适配度"
            },
            F: {
                score: F,
                max: DIMENSION_MAX.F,
                label: "职位相关性 / 经验匹配度"
            }
        },
        metrics: {
            bulletCount: bulletLines.length,
            quantifiedCount,
            strongVerbCount,
            impactCount,
            jdKeywordCount: jdKeywords.length,
            jdKeywordHits: jdHits,
            jdMatchRatio: Number((jdMatchRatio * 100).toFixed(1)),
            keywordProfile,
            keywordMatch: summarizeKeywordMatch(keywordMatch),
            detectedTargetRole: targetRole.role,
            detectedResumeRole: resumeRole.role,
            checks: {
                fileNameIssues: fileNameResult.issues,
                inconsistentDates,
                isChronological,
                emailValid,
                isGmail,
                phoneValid: phoneInfo.valid,
                hasLinkedIn: /linkedin\.com\/in\/|linkedin/i.test(normalized),
                hasPortfolio: /\b\w[\w-]*\.(me|dev|io|app|site|co)\b/i.test(normalized) || /github\.io/i.test(normalized),
                hasWillingToRelocate,
                hasSummary,
                summaryMentionsRole,
                allChina,
                hasAnyChinaExp,
                shortTenures,
                hasCoursework,
                mustHaveFreqBonus,
                priorityAlignmentBonus,
                coreSkillBulletCoverage: coreBulletSignal.coverage,
                coreSkillEarlyPlacement: coreBulletSignal.earlyPlacement,
                fBreakdown: fScore.breakdown,
                hasGPA,
                educationHasDates,
                projectsHasDates,
                inconsistentMonthStyle,
                expLocationResult,
                jobTitleAligned,
                exactJobTitle,
                scoreCaps,
                writeGoodResult,
                repetitiveVerbResult,
                verbDiversity,
                skillBalance,
                resumeOutdated
            }
        },
        topMissingKeywords: missingKeywords.slice(0, 12),
        problems: problems.slice(0, 6),
        suggestions: suggestions.slice(0, 6),
        dimensionProblems,
        improvement: formatPenaltyTriggered ? `先解决格式/信息问题，修复后预计提升至 ${Math.min(90, rawTotal + potentialGain)}` : `${total} → ${Math.min(90, total + potentialGain)}（保守估计）`,
        profile,
        problemTags,
        retrievalQuery,
        diagnostics,
        priorityMissingKeywords
    };
}
function buildProblems(ctx) {
    const problems = [];
    if (ctx.formatPenaltyTriggered) {
        problems.unshift("格式或基本资料存在严重缺陷，总分已被上限至 54（高风险）。优先修复格式问题。");
    }
    if (ctx.allChina) {
        problems.push("所有工作经历均在中国，与美国求职市场适配度较低，建议在 Summary 中说明赴美求职意向并突出可迁移技能。");
    } else if (ctx.hasAnyChinaExp) {
        problems.push("部分工作经历在中国，建议优先展示与美国岗位相关的经历，并在 Summary 中加入赴美求职意向说明。");
    }
    if (!ctx.isChronological) {
        problems.push("工作经历未按时间倒序排列（最新在前），需重新排序。");
    }
    if (ctx.shortTenures && ctx.shortTenures.length > 0) {
        const titles = ctx.shortTenures.map((t)=>`"${t.title || "未知岗位"}"`).join("、");
        problems.push(`发现 ${ctx.shortTenures.length} 段在职时长不足 3 个月且未标注 Intern 的经历（${titles}），建议注明是否为实习。`);
    }
    if (ctx.hasJD && ctx.jdMatchRatio < 0.4) {
        problems.push(`JD 关键词覆盖率仅 ${(ctx.jdMatchRatio * 100).toFixed(0)}%，核心技能、工具或领域词匹配不足。`);
    }
    if (ctx.quantifiedCount < 3) {
        problems.push(`量化成果只有 ${ctx.quantifiedCount} 个，bullet 的结果证据不足。`);
    }
    if (ctx.strongVerbCount < 4) {
        problems.push(`强动作动词开头的 bullet 只有 ${ctx.strongVerbCount} 条，经历表达不够主动。`);
    }
    if (ctx.impactCount < 3) {
        problems.push("结果导向语言不足，缺少 improved、reduced、increased、generated 等影响表达。");
    }
    if (ctx.bulletCount < 5) {
        problems.push(`可识别 bullet 只有 ${ctx.bulletCount} 条，ATS 难以稳定解析职责和成果。`);
    }
    if (!ctx.hasEmail) {
        problems.push("未检测到标准 email，联系方式完整性存在风险。");
    }
    if (ctx.targetRole.role !== "general" && ctx.resumeRole.role !== ctx.targetRole.role) {
        problems.push(`目标岗位像是「${formatRole(ctx.targetRole.role)}」，但简历定位更接近「${formatRole(ctx.resumeRole.role)}」，岗位信号不够一致。`);
    }
    if (problems.length === 0) {
        problems.push("基础结构良好，下一步应继续提升 JD 关键词覆盖率和成果量化密度。");
    }
    return problems;
}
function buildDimensionProblems(ctx) {
    const { checks, quantifiedCount, strongVerbCount, impactCount, bulletCount, hasJD, jdMatchRatio, keywordMatch, targetRole, resumeRole } = ctx;
    const A = [];
    const missingCore = [
        "experience",
        "education",
        "skills"
    ].filter((s)=>!ctx.coreSections.includes(s));
    if (missingCore.length) A.push(`缺少核心段落：${missingCore.join("、")}`);
    if (bulletCount < 4) A.push(`bullet 数量仅 ${bulletCount} 条，建议至少 8 条以便 ATS 解析`);
    if (ctx.resumeLength < 400) A.push("简历内容过短（< 400 字符），信息密度不足");
    else if (ctx.resumeLength > 9000) A.push("简历内容过长（> 9000 字符），建议精简至 1-2 页");
    if (checks.fileNameIssues && checks.fileNameIssues.length > 0) A.push(...checks.fileNameIssues);
    if (checks.inconsistentDates) A.push('日期格式不一致：同一份简历混用月份名称（如 "May"）与数字格式（如 "5/2024"），请统一');
    if (checks.inconsistentMonthStyle) A.push('月份写法不统一：同时出现缩写（如 "Jan"）和全称（如 "January"），请统一使用其中一种');
    if (ctx.hasEducation && !checks.educationHasDates) A.push("Education 段落缺少年份，建议补充入学 / 毕业年份");
    if (!checks.projectsHasDates && ctx.hasProjects) A.push("Projects 段落部分条目缺少时间，建议补充项目年份");
    if (!checks.isChronological) A.push("工作经历未按时间倒序排列，建议最新经历放在最前面");
    if (checks.resumeOutdated) A.push("最近一段工作经历日期距今超过 3 个月，简历可能未更新，建议补充最新经历或更新日期");
    const B = [];
    if (!ctx.hasEmail) B.push("未检测到 email 地址");
    else if (!checks.emailValid) B.push("email 格式不合法（拼写错误等），请检查");
    else if (!checks.isGmail) B.push("建议使用 Gmail 邮箱（@gmail.com），部分 ATS 对非 Gmail 邮箱有扣分");
    if (!checks.phoneValid) B.push(ctx.phonePresent ? "电话号码格式有误（非 10/11 位美国号码）" : "未检测到电话号码");
    if (!checks.hasLinkedIn) B.push("未提供 LinkedIn 链接");
    if (!checks.hasSummary && !checks.isRecentGraduate) B.push("缺少 Summary / 个人简介段落");
    if (ctx.hasEducation && !checks.hasCoursework) B.push('Education 段落未列出 Relevant Coursework，建议补充相关课程以增加 ATS 关键词密度');
    if (ctx.hasEducation && !checks.hasGPA) B.push('Education 段落未包含 GPA，建议加入（如 GPA: 3.X / 4.0）');
    if (checks.expLocationResult && !checks.expLocationResult.allHaveLocation) B.push(`${checks.expLocationResult.missingCount} 段工作经历缺少地点信息（如 "New York, NY" 或 "Remote"），建议补充`);
    const C = [];
    if (quantifiedCount < 3) C.push(`量化成果仅 ${quantifiedCount} 个，建议至少 5 个（百分比、金额、规模）`);
    if (strongVerbCount < 4) C.push(`强动词开头的 bullet 仅 ${strongVerbCount} 条，建议用 led、built、optimized 等替代`);
    if (impactCount < 3) C.push("缺少结果导向语言（improved、reduced、increased、generated 等）");
    if (bulletCount < 5) C.push(`可识别 bullet 仅 ${bulletCount} 条，建议至少 8 条`);
    if (ctx.weakPhraseCount >= 3) C.push(`发现 ${ctx.weakPhraseCount} 处弱表达（helped、assisted、responsible for 等）`);
    if (checks.writeGoodResult?.passiveCount >= 5) C.push(`检测到 ${checks.writeGoodResult.passiveCount} 处被动语态，建议改为主动句式（如 "was developed by" → "developed"）`);
    else if (checks.writeGoodResult?.passiveCount >= 2) C.push(`发现 ${checks.writeGoodResult.passiveCount} 处被动语态，建议优先使用主动动词`);
    if (checks.repetitiveVerbResult?.maxCount >= 3) C.push(`动词 "${checks.repetitiveVerbResult.maxVerb}" 重复出现 ${checks.repetitiveVerbResult.maxCount} 次，建议替换为多样化的动作动词以提升 ATS 吸引力`);
    else if (checks.repetitiveVerbResult?.maxCount >= 2) C.push(`动词 "${checks.repetitiveVerbResult.maxVerb}" 重复出现 2 次，建议每条 bullet 使用不同动词，避免表达单一`);
    if (checks.coreSkillBulletCoverage < 0.4) C.push("核心技能在 bullet 中的覆盖率不足 40%");
    else if (checks.coreSkillBulletCoverage < 0.7) C.push("核心技能 bullet 覆盖率未达 70%，可进一步强化");
    if (ctx.shortTenures && ctx.shortTenures.length > 0) {
        ctx.shortTenures.forEach((t)=>{
            C.push(`"${t.title || "某段经历"}" 在职时长仅约 ${t.durationMonths} 个月且未标注 Intern，建议补充说明或注明实习性质`);
        });
    }
    // ── Verb diversity ───────────────────────────────────────────────────────
    const vd = checks.verbDiversity;
    if (vd && vd.verbBulletCount >= 5) {
        if (vd.diversityRatio < 0.55 || vd.maxRepeat >= 4) {
            const pct = Math.round(vd.diversityRatio * 100);
            const repStr = vd.repeatedVerbs.length ? `（重复较多的动词：${vd.repeatedVerbs.map((r)=>`"${r.verb}"×${r.count}`).join("、")}）` : "";
            C.push(`动词多样性不足：${vd.verbBulletCount} 条 bullet 中仅用了 ${vd.uniqueVerbCount} 个不同动词（多样性 ${pct}%）${repStr}。` + `建议将重复动词替换为同义强动词，如 managed→led、built→developed→engineered、improved→optimized→enhanced。`);
        }
    }
    // ── Soft vs tech skill balance ───────────────────────────────────────────
    const sb = checks.skillBalance;
    if (sb && bulletCount >= 5) {
        const { softCount, techCount, ratio } = sb;
        // Always show the distribution summary
        const dominant = softCount >= techCount ? "soft skills" : "tech skills";
        const minority = softCount < techCount ? "soft skills" : "tech skills";
        if (softCount === 0 || techCount === 0) {
            C.push(`Bullet 技能分布：soft skills ${softCount} 个 / tech skills ${techCount} 个。` + `${softCount === 0 ? "未见软技能（领导力、协作、沟通等），建议在部分 bullet 中体现人际/领导维度。" : "未见技术工具词，建议在 bullet 中点名所用工具或技术。"}`);
        } else if (ratio > 3) {
            C.push(`Bullet 技能分布偏向 ${dominant}（soft ${softCount} / tech ${techCount}，比例约 ${Math.round(ratio)}:1）。` + `建议补充更多 ${minority} 相关描述，让简历软硬技能更均衡。`);
        } else {
            C.push(`Bullet 技能分布：soft skills ${softCount} 个 / tech skills ${techCount} 个（比例均衡 ✓）`);
        }
    }
    const D = [];
    if (!hasJD) {
        D.push("未提供 JD，关键词匹配使用通用词库估算，精度有限");
    } else {
        if (jdMatchRatio < 0.4) D.push(`JD 关键词总覆盖率仅 ${(jdMatchRatio * 100).toFixed(0)}%`);
        if (checks.exactJobTitle && !checks.exactJobTitle.exact) D.push(`缺少 exact job title phrase：${checks.exactJobTitle.targetTitle}`);
        if (checks.scoreCaps && checks.scoreCaps.length) D.push(`已触发总分上限：${checks.scoreCaps.map((cap)=>`${cap.reason} <= ${cap.max}`).join("；")}`);
        const cs = keywordMatch.comparison?.core_skills;
        if (cs && cs.missing?.length) D.push(`缺失核心技能：${cs.missing.slice(0, 4).join("、")}`);
        const tools = keywordMatch.comparison?.tools;
        if (tools && tools.missing?.length) D.push(`缺失工具：${tools.missing.slice(0, 4).join("、")}`);
        const domain = keywordMatch.comparison?.domain_keywords;
        if (domain && domain.missing?.length) D.push(`缺失领域词：${domain.missing.slice(0, 3).join("、")}`);
    }
    const E = [];
    if (checks.allChina) {
        E.push("所有工作经历均在中国，美国市场适配度较低");
        E.push("建议在简历中突出可迁移技能，并在 Summary 中说明赴美求职意向");
    } else if (checks.hasAnyChinaExp) {
        E.push("部分工作经历在中国，建议优先展示与美国岗位相关的经历和技能");
        E.push("在 Summary 中加入赴美求职意向说明，增强市场适配信号");
    }
    if (!checks.hasWillingToRelocate) {
        E.push('未提及 "Willing to relocate"，建议加入以向 ATS 和招聘官传递明确信号');
    }
    const F = [];
    const fb = checks.fBreakdown || {};
    if ((fb.experienceProjectsCoreMatch || 0) < 40) F.push(`工作经历与 JD 核心技能匹配率仅 ${fb.experienceProjectsCoreMatch || 0}%`);
    if ((fb.skillsCoreMatch || 0) < 40) F.push(`技能区块与岗位要求匹配率仅 ${fb.skillsCoreMatch || 0}%`);
    if ((fb.toolsMatch || 0) < 40) F.push(`工具技术覆盖率仅 ${fb.toolsMatch || 0}%`);
    if ((fb.titleSummaryAliasMatch || 0) < 50) F.push("Summary / 标题未体现目标岗位定位");
    if (targetRole.role !== "general" && resumeRole.role !== targetRole.role) {
        F.push(`岗位信号不一致：JD 指向「${formatRole(targetRole.role)}」，简历更接近「${formatRole(resumeRole.role)}」`);
    }
    if (checks.jobTitleAligned && !checks.jobTitleAligned.aligned) {
        F.push(`简历工作经历中的 Job Title 与 JD 职位名称差异较大，建议尽量保持一致以提升 ATS 匹配率`);
    }
    return {
        A,
        B,
        C,
        D,
        E,
        F
    };
}
function buildSuggestions(ctx) {
    const suggestions = [];
    if (!ctx.isChronological) {
        suggestions.push("将工作经历重新排列为时间倒序（最新在前），这是所有 ATS 和 HR 的基本预期。");
    }
    if (ctx.shortTenures && ctx.shortTenures.length > 0) {
        suggestions.push("在职时长不足 3 个月的经历请明确标注 Intern/Internship，或考虑是否有必要保留；无说明的短期经历会引发 HR 疑虑。");
    }
    if (!ctx.hasSummary && !ctx.isRecentGraduate) {
        suggestions.push("添加 Summary / 个人简介段落：用 2–3 句话说明你的背景、核心技能和目标岗位，这是 ATS 和 HR 第一眼读到的内容，也有助于提升关键词密度。");
    }
    if (ctx.hasJD) {
        const exactPhraseSuggestion = formatExactPhraseSuggestion(ctx.keywordMatch, ctx.exactJobTitle);
        if (exactPhraseSuggestion) suggestions.push(exactPhraseSuggestion);
        const grouped = formatMissingByCategory(ctx.keywordMatch);
        suggestions.push(grouped || "JD 关键词匹配较好，下一步重点优化量化成果和 bullet 表达。");
    } else {
        suggestions.push("建议加入目标 JD；没有 JD 时会先用岗位词库做通用 ATS 估算。");
    }
    if (ctx.allChina) {
        suggestions.push('在 Summary 中加入 "Seeking US-based opportunities" 并强调可迁移的技术能力，同时考虑补充美国相关实习/项目经历。');
    } else if (ctx.hasAnyChinaExp) {
        suggestions.push('建议将中国经历的描述聚焦在与美国岗位相关的技能和成果上，并在 Summary 中加入 "Willing to relocate"。');
    }
    if (ctx.quantifiedCount < 5) {
        suggestions.push(`把量化成果从 ${ctx.quantifiedCount} 个提升到至少 5 个，优先使用百分比、金额、规模、效率提升。`);
    }
    if (ctx.strongVerbCount < 6) {
        suggestions.push("将 helped、assisted、responsible for 改成 led、built、optimized、launched 等动作动词。");
    }
    if (ctx.impactCount < 4) {
        suggestions.push("每条核心 bullet 尽量写成 Action + Method + Result，明确业务或技术影响。");
    }
    if (ctx.targetRole.role !== "general" && ctx.resumeRole.role !== ctx.targetRole.role) {
        suggestions.push("在 Summary、Skills 和前两段经历中强化目标岗位关键词，让简历定位更一致。");
    }
    return suggestions;
}
function summarizeKeywordMatch(keywordMatch) {
    const summary = {};
    for (const [category, data] of Object.entries(keywordMatch.comparison)){
        summary[category] = {
            total: data.terms.length,
            matched: data.matched.length,
            matchedTerms: data.matched,
            exactMatched: data.exactMatched || [],
            normalizedMatched: data.normalizedMatched || [],
            semanticMatched: data.semanticMatched || [],
            partialMatched: data.partialMatched || [],
            missing: data.missing
        };
    }
    const allMatches = uniqueByTerm(Object.values(keywordMatch.comparison).flatMap((data)=>data.matches || []));
    const bySkillType = (type)=>{
        const matches = allMatches.filter((match)=>classifySkillType(match.term, match.category) === type);
        return {
            total: matches.length,
            coverage: Number((coverageFromMatches(matches) * 100).toFixed(1)),
            matchedTerms: matches.filter((match)=>match.credit > 0).map((match)=>match.term),
            missing: matches.filter((match)=>match.credit <= 0).map((match)=>match.term)
        };
    };
    summary.hard_skills = bySkillType("hard");
    summary.soft_skills = bySkillType("soft");
    summary.matchMethod = {
        exactPhraseCount: keywordMatch.exactPhraseCount || 0,
        hardCoverage: Number((keywordMatch.hardCoverage * 100).toFixed(1)),
        softCoverage: Number((keywordMatch.softCoverage * 100).toFixed(1)),
        hardTermCount: keywordMatch.hardTermCount || 0,
        softTermCount: keywordMatch.softTermCount || 0,
        combinedKeywordCoverage: Number((keywordMatch.combinedKeywordCoverage * 100).toFixed(1)),
        experienceEvidence: keywordMatch.experienceEvidence
    };
    summary.missingByPriority = classifyMissingKeywords(keywordMatch);
    return summary;
}
function formatExactPhraseSuggestion(keywordMatch, exactJobTitle) {
    const requestedExactTerms = [
        "software development engineer",
        "microservices",
        "technical documentation",
        "operational excellence"
    ];
    const partial = [];
    for (const data of Object.values(keywordMatch.comparison || {})){
        for (const match of data.matches || []){
            if (requestedExactTerms.includes(match.term) && match.credit > 0 && match.type !== "exact") {
                partial.push(match.term);
            }
        }
    }
    if (exactJobTitle && exactJobTitle.targetTitle && !exactJobTitle.exact && !partial.includes(exactJobTitle.targetTitle)) {
        partial.unshift(exactJobTitle.targetTitle);
    }
    const terms = unique(partial).slice(0, 5);
    if (!terms.length) return "";
    return `你已经有类似概念，但缺少 exact phrase：${terms.join("、")}。建议只在真实经历对应的 Summary、Experience bullet 或 Skills 中补入原词，不要只靠同义词。`;
}
function classifyMissingKeywords(keywordMatch) {
    const missing = unique(Object.values(keywordMatch.comparison || {}).flatMap((data)=>data.missing || []));
    const group = (set)=>missing.filter((term)=>set.has(cleanKeyword(term)));
    const mustHave = group(MUST_HAVE_KEYWORDS);
    const boosters = group(ROLE_RELEVANT_BOOSTERS);
    const optionalRisky = group(OPTIONAL_RISKY_KEYWORDS);
    const assigned = new Set([
        ...mustHave,
        ...boosters,
        ...optionalRisky
    ]);
    const other = missing.filter((term)=>!assigned.has(term));
    return {
        mustHaveHighPriority: mustHave,
        roleRelevantBooster: boosters,
        optionalRiskyToAdd: optionalRisky,
        other
    };
}
function formatMissingByCategory(keywordMatch) {
    const byPriority = classifyMissingKeywords(keywordMatch);
    const priorityGroups = [];
    if (byPriority.mustHaveHighPriority.length) {
        priorityGroups.push(`Must-have / high priority：${byPriority.mustHaveHighPriority.slice(0, 6).join("、")}（强烈建议补）`);
    }
    if (byPriority.roleRelevantBooster.length) {
        priorityGroups.push(`Role-relevant booster：${byPriority.roleRelevantBooster.slice(0, 6).join("、")}（有真实经验就补）`);
    }
    if (byPriority.optionalRiskyToAdd.length) {
        priorityGroups.push(`Optional / risky to add：${byPriority.optionalRiskyToAdd.slice(0, 6).join("、")}（没有真实经验不要硬补）`);
    }
    if (priorityGroups.length) return `Missing keywords 已分级：${priorityGroups.join("；")}。`;
    const labels = {
        core_skills: "核心技能",
        tools: "工具",
        domain_keywords: "领域关键词",
        nice_to_have: "加分项",
        action_verbs: "动作词"
    };
    const priority = [
        "core_skills",
        "tools",
        "domain_keywords",
        "nice_to_have",
        "action_verbs"
    ];
    const groups = priority.map((category)=>{
        const missing = keywordMatch.comparison[category]?.missing || [];
        if (!missing.length) return "";
        return `${labels[category]}：${missing.slice(0, 5).join("、")}`;
    }).filter(Boolean);
    if (!groups.length) return "";
    return `优先补齐 JD 匹配缺口：${groups.slice(0, 3).join("；")}。`;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Math.round(value)));
}
module.exports = {
    scoreResumeATS,
    extractKeywords,
    buildKeywordProfile,
    normalizeText
};
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/ats/report-formatter.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
const SCORING_MODE = "external_ats_like";
const REPORT_VERSION = "0.2.0";
const DIMENSION_LABELS = {
    A: "\u6587\u4ef6\u4e0e\u683c\u5f0f\u89c4\u8303",
    B: "\u57fa\u672c\u8d44\u6599\u5b8c\u6574\u6027",
    C: "\u5185\u5bb9\u8d28\u91cf\u4e0e\u6210\u679c\u8868\u8fbe",
    D: "JD \u5173\u952e\u8bcd\u5339\u914d\u5ea6",
    E: "\u5730\u57df\u4e0e\u5e02\u573a\u9002\u914d\u5ea6",
    F: "\u804c\u4f4d\u76f8\u5173\u6027 / \u7ecf\u9a8c\u5339\u914d\u5ea6"
};
const SCORE_CAP_THRESHOLDS = {
    hardSkillCritical: 0.3,
    hardSkillLow: 0.45,
    hardSkillCriticalCap: 60,
    hardSkillLowCap: 70,
    jdMatchLow: 45,
    jdMatchLowCap: 75
};
function clampRound(value, min = 0, max = 100) {
    const number = Number.isFinite(Number(value)) ? Number(value) : 0;
    return Math.max(min, Math.min(max, Math.round(number)));
}
function pct(score, max) {
    const value = max ? score / max : 0;
    return Number(Math.max(0, Math.min(1, value)).toFixed(3));
}
function snakeCase(value) {
    return String(value || "unknown").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "unknown";
}
function isPlaceholderTitle(value) {
    return !value || /根据\s*JD\s*分析|依\s*JD\s*自动识别|unknown/i.test(String(value));
}
function titleCaseRole(value) {
    return String(value || "").replace(/_/g, " ").replace(/\b\w/g, (char)=>char.toUpperCase()).trim();
}
function inferCanonicalTargetRole(rawScoreResult, input = {}) {
    const candidates = [
        input.jobTitle,
        rawScoreResult.jobTitle,
        rawScoreResult.metrics?.checks?.exactJobTitle?.targetTitle,
        ...rawScoreResult.metrics?.keywordProfile?.target_role || [],
        rawScoreResult.metrics?.detectedTargetRole,
        rawScoreResult.profile?.targetRole
    ].filter((value)=>value && !isPlaceholderTitle(value));
    const text = `${candidates.join(" ")} ${input.jdText || ""}`.toLowerCase();
    const rolePatterns = [
        {
            role: "software_development_engineer",
            display: "Software Development Engineer",
            pattern: /\bsoftware development engineer\b|\bsde\b/
        },
        {
            role: "software_engineer",
            display: "Software Engineer",
            pattern: /\bsoftware engineer\b|\bswe\b|\bsoftware developer\b/
        },
        {
            role: "full_stack_engineer",
            display: "Full Stack Engineer",
            pattern: /\bfull[-\s]?stack\b/
        },
        {
            role: "frontend_engineer",
            display: "Frontend Engineer",
            pattern: /\bfront[-\s]?end\b/
        },
        {
            role: "backend_engineer",
            display: "Backend Engineer",
            pattern: /\bback[-\s]?end\b/
        },
        {
            role: "data_analyst",
            display: "Data Analyst",
            pattern: /\bdata analyst\b/
        },
        {
            role: "data_scientist",
            display: "Data Scientist",
            pattern: /\bdata scientist\b|\bmachine learning\b/
        },
        {
            role: "product_manager",
            display: "Product Manager",
            pattern: /\bproduct manager\b|\bpm\b/
        },
        {
            role: "financial_analyst",
            display: "Financial Analyst",
            pattern: /\bfinancial analyst\b/
        },
        {
            role: "accounting",
            display: "Accounting",
            pattern: /\baccountant\b|\baccounting\b/
        }
    ];
    const matched = rolePatterns.find((item)=>item.pattern.test(text));
    if (matched) return matched;
    const first = candidates.find((value)=>snakeCase(value) !== "general");
    if (first) {
        const role = snakeCase(first);
        return {
            role,
            display: titleCaseRole(role)
        };
    }
    return {
        role: "unknown",
        display: "依 JD 自动识别"
    };
}
function buildInternalJobTitle(rawScoreResult, input = {}) {
    const rawTitle = input.jobTitle || rawScoreResult.jobTitle || "";
    if (!isPlaceholderTitle(rawTitle)) return rawTitle || null;
    const canonicalRole = inferCanonicalTargetRole(rawScoreResult, input);
    return canonicalRole.role === "unknown" ? "unknown" : canonicalRole.display;
}
function asArray(value) {
    return Array.isArray(value) ? value : [];
}
function buildDimensions(rawScoreResult) {
    const dimensions = rawScoreResult.dimensions || {};
    const dimensionProblems = rawScoreResult.dimensionProblems || {};
    return Object.fromEntries([
        "A",
        "B",
        "C",
        "D",
        "E",
        "F"
    ].map((key)=>{
        const dim = dimensions[key] || {};
        const score = Number(dim.score || 0);
        const max = Number(dim.max || 0);
        return [
            key,
            {
                score,
                max,
                percentage: pct(score, max),
                label: dim.label || DIMENSION_LABELS[key],
                problems: asArray(dimensionProblems[key])
            }
        ];
    }));
}
function buildScoreCaps(rawScoreResult, scores) {
    const reasons = [];
    const hardSkillCoverage = Number(rawScoreResult.metrics?.keywordMatch?.matchMethod?.hardCoverage || 0) / 100;
    const exactJobTitle = rawScoreResult.metrics?.checks?.exactJobTitle;
    if (hardSkillCoverage < SCORE_CAP_THRESHOLDS.hardSkillCritical) {
        reasons.push({
            code: "LOW_HARD_SKILL_MATCH",
            message: "Hard skill coverage is below the configured critical threshold, so the total score is capped.",
            finalCap: SCORE_CAP_THRESHOLDS.hardSkillCriticalCap
        });
    } else if (hardSkillCoverage < SCORE_CAP_THRESHOLDS.hardSkillLow) {
        reasons.push({
            code: "LOW_HARD_SKILL_MATCH",
            message: "Hard skill coverage is below the configured threshold, so the total score is capped.",
            finalCap: SCORE_CAP_THRESHOLDS.hardSkillLowCap
        });
    }
    if (scores.jdMatch.score < SCORE_CAP_THRESHOLDS.jdMatchLow) {
        reasons.push({
            code: "LOW_JD_MATCH",
            message: "JD match score is below the configured threshold, so the total score is capped.",
            finalCap: SCORE_CAP_THRESHOLDS.jdMatchLowCap
        });
    }
    if (exactJobTitle && !exactJobTitle.exact) {
        reasons.push({
            code: "MISSING_EXACT_JOB_TITLE",
            message: "Exact target job title is missing from the resume."
        });
    }
    for (const cap of asArray(rawScoreResult.metrics?.checks?.scoreCaps)){
        if (!reasons.some((reason)=>reason.message === cap.reason)) {
            reasons.push({
                code: snakeCase(cap.reason).toUpperCase(),
                message: cap.reason,
                finalCap: cap.max || null
            });
        }
    }
    const caps = reasons.map((reason)=>reason.finalCap).filter((value)=>Number.isFinite(value));
    return {
        applied: caps.length > 0,
        finalCap: caps.length ? Math.min(...caps) : null,
        reasons: reasons.map(({ code, message })=>({
                code,
                message
            }))
    };
}
function buildScores(rawScoreResult, dimensions) {
    const d = dimensions || buildDimensions(rawScoreResult);
    const scorePercent = (keys)=>{
        const score = keys.reduce((sum, key)=>sum + (d[key]?.score || 0), 0);
        const max = keys.reduce((sum, key)=>sum + (d[key]?.max || 0), 0);
        return clampRound(max ? score / max * 100 : rawScoreResult.total || 0);
    };
    const searchabilityChecks = rawScoreResult.metrics?.checks || {};
    const searchabilityBonus = [
        searchabilityChecks.emailValid,
        searchabilityChecks.phoneValid,
        searchabilityChecks.hasLinkedIn,
        searchabilityChecks.hasPortfolio,
        searchabilityChecks.hasSummary
    ].filter(Boolean).length;
    return {
        overall: {
            score: clampRound(rawScoreResult.total, 0, 100),
            max: 100,
            risk: rawScoreResult.risk || "\u4e2d"
        },
        resumeQuality: {
            score: scorePercent([
                "A",
                "B",
                "C"
            ]),
            max: 100,
            label: "Resume Quality"
        },
        jdMatch: {
            score: scorePercent([
                "D",
                "F"
            ]),
            max: 100,
            label: "JD Match"
        },
        searchability: {
            score: clampRound(scorePercent([
                "A",
                "B"
            ]) * 0.8 + searchabilityBonus * 4, 0, 100),
            max: 100,
            label: "ATS Searchability"
        }
    };
}
function buildProfile(rawScoreResult, input = {}) {
    const rawProfile = rawScoreResult.profile || {};
    const canonicalRole = inferCanonicalTargetRole(rawScoreResult, input);
    const title = isPlaceholderTitle(input.jobTitle || rawScoreResult.jobTitle) ? canonicalRole.display : input.jobTitle || rawScoreResult.jobTitle || "";
    const targetRole = canonicalRole.role || rawProfile.targetRole || snakeCase(title);
    const roleText = `${title} ${input.jdText || ""}`.toLowerCase();
    const roleFamily = /\b(accountant|accounting|bookkeep|audit|tax|controller|cpa|accounts payable|accounts receivable)\b/.test(roleText) ? "accounting" : /\b(finance|financial|investment|fp&a|valuation|treasury)\b/.test(roleText) ? "finance" : /software|swe|sde|full.?stack|backend|frontend/.test(roleText) ? "software_engineer" : rawProfile.roleFamily || targetRole || "unknown";
    return {
        roleFamily,
        targetRole: targetRole === "general" ? "unknown" : targetRole,
        seniority: rawProfile.seniority || inferSeniority(roleText),
        candidateType: rawProfile.candidateType || inferCandidateType(roleText, rawProfile.seniority),
        yearsOfExperience: rawProfile.yearsOfExperience ?? null,
        degreeField: rawProfile.degreeField || null,
        market: rawProfile.market || "unknown",
        location: rawProfile.location || null,
        willingToRelocate: Boolean(rawProfile.willingToRelocate || rawScoreResult.metrics?.checks?.hasWillingToRelocate)
    };
}
function inferSeniority(text) {
    if (/student|intern/.test(text)) return "student";
    if (/new grad|graduate/.test(text)) return "new_grad";
    if (/senior|staff|principal|lead/.test(text)) return "senior";
    if (/mid/.test(text)) return "mid_level";
    if (/entry|junior|associate/.test(text)) return "entry_level";
    return "unknown";
}
function inferCandidateType(text, seniority) {
    if (seniority === "student" || /student|intern/.test(text)) return "student";
    if (seniority === "new_grad" || /new grad|graduate/.test(text)) return "new_grad";
    if (seniority === "entry_level" || seniority === "early_career") return "early_career";
    if (seniority === "mid_level" || seniority === "senior") return "experienced";
    return "unknown";
}
function buildDiagnostics(rawScoreResult, input = {}) {
    const diagnostics = rawScoreResult.diagnostics || {};
    const checks = rawScoreResult.metrics?.checks || {};
    const canonicalRole = inferCanonicalTargetRole(rawScoreResult, input);
    const internalTargetTitle = canonicalRole.role === "unknown" ? "unknown" : canonicalRole.display;
    return {
        searchability: {
            hasEmail: Boolean(diagnostics.searchability?.hasEmail ?? checks.emailValid),
            hasPhone: Boolean(diagnostics.searchability?.hasPhone ?? checks.phoneValid),
            hasLinkedIn: Boolean(diagnostics.searchability?.hasLinkedIn ?? checks.hasLinkedIn),
            hasPortfolio: Boolean(diagnostics.searchability?.hasPortfolio ?? checks.hasPortfolio),
            hasSummary: Boolean(diagnostics.searchability?.hasSummary ?? checks.hasSummary),
            hasEducation: Boolean(diagnostics.searchability?.hasEducation ?? true),
            hasExperience: Boolean(diagnostics.searchability?.hasExperience ?? true),
            hasSkills: true,
            dateFormattingValid: Boolean(diagnostics.searchability?.dateFormattingValid ?? !checks.inconsistentDates),
            wordCount: Number(diagnostics.searchability?.wordCount || 0)
        },
        jobTitleMatch: {
            exactMatch: Boolean(diagnostics.jobTitleMatch?.exactMatch ?? checks.exactJobTitle?.exact),
            targetTitle: internalTargetTitle,
            foundTitles: asArray(diagnostics.jobTitleMatch?.foundTitles),
            severity: diagnostics.jobTitleMatch?.severity || (checks.exactJobTitle?.exact === false ? "medium" : "none")
        },
        measurableResults: {
            count: Number(diagnostics.measurableResults?.count || rawScoreResult.metrics?.quantifiedCount || 0),
            status: diagnostics.measurableResults?.status || "weak"
        },
        resumeTone: {
            hasNegativePhrases: false,
            flaggedPhrases: []
        }
    };
}
function buildKeywordMatchV2(rawScoreResult) {
    const legacy = rawScoreResult.metrics?.keywordMatch || {};
    const matchMethod = legacy.matchMethod || {};
    const categories = {};
    for (const key of [
        "core_skills",
        "tools",
        "domain_keywords",
        "action_verbs",
        "nice_to_have"
    ]){
        const source = legacy[key] || {};
        categories[key] = {
            total: source.total || 0,
            matched: source.matched || 0,
            missing: asArray(source.missing),
            matchedTerms: asArray(source.matchedTerms).map((term)=>({
                    term,
                    matchType: "exact"
                }))
        };
    }
    const toSkillGroup = (source = {})=>({
            total: source.total || 0,
            matched: asArray(source.matchedTerms).length,
            missing: asArray(source.missing).length,
            matchedTerms: asArray(source.matchedTerms).map((term)=>({
                    term,
                    matchType: "exact",
                    resumeCount: null,
                    jdCount: null,
                    locations: []
                })),
            missingTerms: asArray(source.missing).map((term)=>({
                    term,
                    priority: "medium",
                    safeToAdd: true,
                    reason: "Relevant to the target role or job description."
                }))
        });
    return {
        summary: {
            hardSkillCoverage: Number(((matchMethod.hardCoverage || 0) / 100).toFixed(3)),
            softSkillCoverage: Number(((matchMethod.softCoverage || 0) / 100).toFixed(3)),
            overallKeywordCoverage: Number(((matchMethod.combinedKeywordCoverage || rawScoreResult.metrics?.jdMatchRatio || 0) / 100).toFixed(3))
        },
        categories,
        hardSkills: toSkillGroup(legacy.hard_skills),
        softSkills: toSkillGroup(legacy.soft_skills)
    };
}
function buildPriorityMissingKeywords(rawScoreResult) {
    return asArray(rawScoreResult.priorityMissingKeywords).map((item)=>({
            term: item.term,
            priority: item.priority || "medium",
            category: item.category || "hard_skill",
            safeToAdd: item.safeToAdd !== false,
            reason: item.reason || "Relevant to the target role."
        }));
}
function buildProblemTags(internalAtsResult) {
    const tags = asArray(internalAtsResult.problemTags).map(normalizeProblemTag).filter(Boolean);
    const add = (tag)=>{
        if (!tags.some((item)=>item.tag === tag.tag)) tags.push(tag);
    };
    const dScore = internalAtsResult.dimensions?.D?.percentage || 0;
    const hardCoverage = internalAtsResult.keywordMatch?.summary?.hardSkillCoverage || 0;
    const titleExact = internalAtsResult.diagnostics?.jobTitleMatch?.exactMatch;
    const evidence = internalAtsResult.metrics?.checks?.coreSkillBulletCoverage;
    if (dScore < 0.55) add(tag("low_jd_keyword_match", "D", "keyword_alignment", "high", 0.85));
    if (hardCoverage < 0.45) add(tag("low_hard_skill_match", "D", "keyword_alignment", "high", 0.9));
    if (titleExact === false) add(tag("missing_exact_job_title", "F", "role_fit", "medium", 0.65));
    if (evidence != null && evidence < 0.4) add(tag("weak_experience_keyword_evidence", "C", "engineering_practices", "medium", 0.65));
    if (!tags.length || internalAtsResult.total >= 75) {
        add(tag("keyword_gap_minor", "D", "keyword_alignment", "low", 0.4));
        add(tag("career_growth_optimization", "F", "career_growth", "low", 0.35));
    }
    return tags.sort((a, b)=>severityRank(a.severity) - severityRank(b.severity));
}
function normalizeProblemTag(item) {
    if (!item || !item.tag) return null;
    const mapping = {
        keyword_gap_critical: "low_jd_keyword_match",
        keyword_gap_major: "low_jd_keyword_match",
        insufficient_quantification: "low_measurable_results",
        weak_verbs: "weak_action_verbs",
        missing_summary: "weak_summary_role_alignment",
        no_relocate_signal: "missing_relocation_signal",
        short_tenure_unexplained: "short_tenure_unclear",
        missing_coursework: "education_details_missing",
        missing_gpa: "education_details_missing",
        role_mismatch: "weak_target_role_alignment",
        summary_missing_role: "weak_summary_role_alignment"
    };
    return {
        tag: mapping[item.tag] || item.tag,
        dimension: item.dimension || "overall",
        topic: normalizeTopic(item.topic),
        severity: normalizeSeverity(item.severity),
        retrievalWeight: Number(item.retrievalWeight || 0.4),
        evidence: item.evidence || `${item.tag} detected by ATS rules.`
    };
}
function tag(tagName, dimension, topic, severity, retrievalWeight) {
    return {
        tag: tagName,
        dimension,
        topic,
        severity,
        retrievalWeight,
        evidence: `${tagName} detected by ATS rules.`
    };
}
function normalizeTopic(topic) {
    const mapping = {
        resume_structure: "summary_positioning",
        career_positioning: "role_fit",
        tools_alignment: "keyword_alignment",
        resume_maintenance: "content_quality",
        education_completeness: "content_quality",
        career_narrative: "content_quality"
    };
    return mapping[topic] || topic || "content_quality";
}
function normalizeSeverity(value) {
    return [
        "critical",
        "high",
        "medium",
        "low"
    ].includes(value) ? value : "medium";
}
function severityRank(value) {
    return ({
        critical: 0,
        high: 1,
        medium: 2,
        low: 3
    })[value] ?? 9;
}
function buildTopInsights(internalAtsResult) {
    const lowTags = internalAtsResult.problemTags.filter((item)=>item.severity === "low").slice(0, 3);
    const source = lowTags.length ? lowTags : internalAtsResult.problemTags.slice(-2);
    return dedupeInsights(source.map((item)=>({
            title: insightTitle(item),
            severity: item.severity,
            dimension: item.dimension,
            topic: item.topic,
            message: insightMessage(item),
            relatedTags: [
                item.tag
            ]
        })));
}
function buildTopProblems(internalAtsResult) {
    return dedupeInsights(internalAtsResult.problemTags.filter((item)=>[
            "critical",
            "high",
            "medium"
        ].includes(item.severity)).map((item)=>({
            title: problemTitle(item),
            severity: item.severity,
            dimension: item.dimension,
            topic: item.topic,
            message: problemMessage(item),
            relatedTags: [
                item.tag
            ]
        })));
}
function dedupeInsights(items) {
    const byKey = new Map();
    for (const item of items){
        const relatedTags = asArray(item.relatedTags).sort();
        const key = [
            item.title || ""
        ].join("|");
        const existing = byKey.get(key);
        if (!existing) {
            byKey.set(key, {
                ...item,
                relatedTags
            });
        } else {
            const mergedTags = [
                ...new Set([
                    ...existing.relatedTags,
                    ...relatedTags
                ])
            ].sort();
            byKey.set(key, {
                ...existing,
                severity: severityRank(item.severity) < severityRank(existing.severity) ? item.severity : existing.severity,
                relatedTags: mergedTags
            });
        }
    }
    return [
        ...byKey.values()
    ].sort((a, b)=>severityRank(a.severity) - severityRank(b.severity)).slice(0, 3);
}
function insightTitle(item) {
    if (item.tag === "career_growth_optimization") return "\u53ef\u4ee5\u8fdb\u4e00\u6b65\u5f3a\u5316\u804c\u4e1a\u6210\u957f\u6545\u4e8b";
    return "\u5173\u952e\u8bcd\u5339\u914d\u5ea6\u4ecd\u6709\u5c0f\u5e45\u4f18\u5316\u7a7a\u95f4";
}
function insightMessage(item) {
    if (item.tag === "career_growth_optimization") {
        return "\u4f60\u7684\u7b80\u5386\u57fa\u7840\u4e0d\u9519\uff0c\u89e3\u9501\u540e\u53ef\u4ee5\u770b\u66f4\u5177\u4f53\u7684\u5bfc\u5e08\u5efa\u8bae\u6765\u63d0\u5347\u5b9a\u4f4d\u548c\u7ade\u4e89\u529b\u3002";
    }
    return "\u4f60\u7684\u7b80\u5386\u6574\u4f53\u5339\u914d\u5ea6\u8f83\u9ad8\uff0c\u4f46\u4ecd\u6709\u5c11\u91cf JD \u5173\u952e\u8bcd\u53ef\u4ee5\u66f4\u81ea\u7136\u5730\u8865\u8fdb Summary \u6216 Experience\u3002";
}
function problemTitle(item) {
    if (item.tag === "low_hard_skill_match") return "\u6838\u5fc3\u786c\u6280\u80fd\u5339\u914d\u504f\u4f4e";
    if (item.tag === "missing_exact_job_title") return "\u7f3a\u5c11\u76ee\u6807\u5c97\u4f4d\u539f\u8bcd";
    if (item.tag === "low_measurable_results") return "\u53ef\u91cf\u5316\u6210\u679c\u4e0d\u8db3";
    return "JD \u5173\u952e\u8bcd\u5339\u914d\u5ea6\u504f\u4f4e";
}
function problemMessage(item) {
    if (item.tag === "missing_exact_job_title") return "\u7b80\u5386\u4e2d\u672a\u7a33\u5b9a\u51fa\u73b0\u76ee\u6807\u5c97\u4f4d\u539f\u8bcd\uff0c\u53ef\u80fd\u5f71\u54cd ATS \u5bf9\u804c\u4f4d\u5b9a\u4f4d\u7684\u5224\u65ad\u3002";
    if (item.tag === "low_measurable_results") return "\u7ecf\u5386\u4e2d\u7684\u7ed3\u679c\u8bc1\u636e\u504f\u5c11\uff0c\u5efa\u8bae\u63d0\u5347\u767e\u5206\u6bd4\u3001\u89c4\u6a21\u3001\u6548\u7387\u7b49\u91cf\u5316\u8868\u8fbe\u3002";
    if (item.tag === "low_hard_skill_match") return "\u6838\u5fc3\u786c\u6280\u80fd\u8986\u76d6\u4e0d\u8db3\uff0c\u9700\u8981\u628a\u6709\u771f\u5b9e\u7ecf\u9a8c\u652f\u6491\u7684\u5de5\u5177\u3001\u6280\u80fd\u548c\u573a\u666f\u5199\u8fdb\u7ecf\u5386\u8bc1\u636e\u91cc\u3002";
    return "\u4f60\u7684\u7b80\u5386\u7f3a\u5c11\u591a\u4e2a\u76ee\u6807\u5c97\u4f4d\u6838\u5fc3\u5173\u952e\u8bcd\uff0c\u53ef\u80fd\u5f71\u54cd ATS \u521d\u7b5b\u3002";
}
function buildStructuredSuggestions(internalAtsResult) {
    const suggestions = [];
    let priority = 1;
    const add = (type, targetSection, message, relatedTags, relatedKeywords = [], unlockTier = "paid")=>{
        suggestions.push({
            type,
            priority: priority++,
            targetSection,
            message,
            relatedTags,
            relatedKeywords,
            unlockTier
        });
    };
    if (internalAtsResult.problemTags.some((item)=>item.tag === "missing_exact_job_title")) {
        add("keyword_fix", "summary", "Add the exact target title to the Summary section.", [
            "missing_exact_job_title"
        ], [
            internalAtsResult.diagnostics.jobTitleMatch.targetTitle
        ], "free");
    }
    if (internalAtsResult.problemTags.some((item)=>item.tag === "low_jd_keyword_match" || item.tag === "low_hard_skill_match")) {
        add("keyword_fix", "experience", "Prioritize missing role keywords that are supported by real project or work evidence.", [
            "low_jd_keyword_match",
            "low_hard_skill_match"
        ], internalAtsResult.priorityMissingKeywords.slice(0, 3).map((item)=>item.term), "paid");
    }
    if (internalAtsResult.problemTags.some((item)=>item.tag === "low_measurable_results")) {
        add("content_fix", "experience", "Rewrite top bullets with action, method, and measurable result.", [
            "low_measurable_results"
        ], [], "paid");
    }
    for (const suggestion of asArray(internalAtsResult.suggestions).slice(0, 3)){
        add("content_fix", "overall", suggestion, [], [], "premium");
    }
    return suggestions;
}
function buildRetrievalQuery(internalAtsResult) {
    const topics = [
        ...new Set(internalAtsResult.problemTags.map((tagItem)=>tagItem.topic))
    ].slice(0, 6);
    const problemTags = internalAtsResult.problemTags.map((tagItem)=>tagItem.tag).slice(0, 8);
    const priorityKeywords = internalAtsResult.priorityMissingKeywords.filter((item)=>item.priority === "high" || item.priority === "medium").map((item)=>item.term).slice(0, 6);
    const profile = internalAtsResult.profile;
    const targetRoles = [
        ...new Set([
            profile.targetRole,
            profile.roleFamily,
            "universal"
        ].filter(Boolean))
    ];
    const seniority = [
        ...new Set([
            profile.seniority,
            profile.candidateType,
            "universal"
        ].filter(Boolean))
    ];
    return {
        roleFamily: profile.roleFamily,
        targetRole: profile.targetRole,
        seniority: profile.seniority,
        candidateType: profile.candidateType,
        topics,
        problemTags,
        priorityKeywords,
        queryText: [
            profile.seniority,
            profile.targetRole,
            ...problemTags.slice(0, 4),
            ...topics.slice(0, 3)
        ].filter(Boolean).join(" "),
        filters: {
            roleFamily: [
                profile.roleFamily,
                "universal"
            ].filter(Boolean),
            targetRoles,
            seniority,
            topics
        }
    };
}
function buildMentorAdviceSlots() {
    return {
        free: {
            count: 1,
            selectionStrategy: "highest_retrieval_score",
            requiredTags: []
        },
        paid: {
            count: 3,
            selectionStrategy: "diverse_topics",
            preferredTopics: [
                "keyword_alignment",
                "summary_positioning",
                "experience_rewrite",
                "career_growth"
            ]
        }
    };
}
function buildReportAssembly() {
    return {
        freeSections: [
            "ats_score",
            "top_insights",
            "one_mentor_advice",
            "locked_advice_preview"
        ],
        paidSections: [
            "all_mentor_advice",
            "missing_keyword_checklist",
            "section_fix_plan",
            "ai_rewrite_cta"
        ]
    };
}
function buildInternalAtsResult(rawScoreResult, input = {}) {
    const dimensions = buildDimensions(rawScoreResult);
    const scores = buildScores(rawScoreResult, dimensions);
    const result = {
        engine: rawScoreResult.engine || "rule-based",
        version: REPORT_VERSION,
        scoringMode: SCORING_MODE,
        jobTitle: buildInternalJobTitle(rawScoreResult, input),
        hasJD: Boolean(rawScoreResult.hasJD ?? input.jdText),
        total: scores.overall.score,
        maxScore: 100,
        risk: rawScoreResult.risk || scores.overall.risk,
        formatPenaltyTriggered: Boolean(rawScoreResult.formatPenaltyTriggered),
        formatPenaltyReason: asArray(rawScoreResult.formatPenaltyReason),
        scores,
        scoreCaps: null,
        dimensions,
        profile: buildProfile(rawScoreResult, input),
        diagnostics: buildDiagnostics(rawScoreResult, input),
        keywordMatch: buildKeywordMatchV2(rawScoreResult),
        priorityMissingKeywords: buildPriorityMissingKeywords(rawScoreResult),
        problemTags: asArray(rawScoreResult.problemTags),
        topInsights: [],
        topProblems: [],
        structuredSuggestions: [],
        retrievalQuery: null,
        mentorAdviceSlots: buildMentorAdviceSlots(),
        reportAssembly: buildReportAssembly(),
        metrics: rawScoreResult.metrics || {},
        topMissingKeywords: asArray(rawScoreResult.topMissingKeywords),
        problems: asArray(rawScoreResult.problems),
        suggestions: asArray(rawScoreResult.suggestions),
        dimensionProblems: rawScoreResult.dimensionProblems || {},
        improvement: rawScoreResult.improvement || {}
    };
    result.scoreCaps = buildScoreCaps(rawScoreResult, result.scores);
    result.problemTags = buildProblemTags(result);
    result.topProblems = buildTopProblems(result);
    result.topInsights = buildTopInsights(result);
    result.structuredSuggestions = buildStructuredSuggestions(result);
    result.retrievalQuery = buildRetrievalQuery(result);
    return result;
}
function formatInternalAtsResult(rawScoreResult, input = {}) {
    return buildInternalAtsResult(rawScoreResult, input);
}
function buildLockedPreview(paidAdvice) {
    return {
        lockedMentorCount: 3,
        lockedAdviceCount: 9,
        totalMentorCount: 4,
        totalAdviceCount: 12,
        topics: [
            "\u5173\u952e\u8bcd\u8865\u5145\u4f4d\u7f6e",
            "Summary \u5b9a\u4f4d\u5f3a\u5316",
            "Experience bullet \u4f18\u5316",
            "\u5c97\u4f4d\u5339\u914d\u7b56\u7565"
        ],
        message: "\u89e3\u9501\u540e\u67e5\u770b 4 \u4f4d\u5bfc\u5e08\u7684 12 \u6761\u5b8c\u6574\u5efa\u8bae\uff0c\u8986\u76d6\u4f60\u7684\u4e3b\u8981 ATS \u95ee\u9898\u4e0e\u5206\u6bb5\u4fee\u6539\u8def\u5f84\u3002"
    };
}
function topicPreviewLabel(topicValue) {
    const labels = {
        keyword_alignment: "\u5173\u952e\u8bcd\u8865\u5145\u4f4d\u7f6e",
        summary_positioning: "Summary \u5b9a\u4f4d\u5f3a\u5316",
        experience_rewrite: "Experience bullet \u4f18\u5316",
        career_growth: "\u5c97\u4f4d\u5b9a\u4f4d\u5f3a\u5316"
    };
    return labels[topicValue] || "\u5bfc\u5e08\u4fee\u6539\u5efa\u8bae";
}
function formatPublicFreeReport(internalAtsResult, freeAdvice, lockedPreview) {
    const riskBucket = riskToBucket(internalAtsResult.risk, internalAtsResult.total);
    const topProblems = riskBucket === "low" ? [] : internalAtsResult.topProblems.slice(0, 3);
    const topInsights = riskBucket === "high" ? [] : internalAtsResult.topInsights.slice(0, riskBucket === "medium" ? 2 : 3);
    return {
        engine: internalAtsResult.engine,
        version: internalAtsResult.version,
        schemaVersion: "ats_response_v0.2.0",
        scoringMode: internalAtsResult.scoringMode,
        jobTitle: internalAtsResult.jobTitle === "unknown" ? "依 JD 自动识别" : internalAtsResult.jobTitle,
        hasJD: internalAtsResult.hasJD,
        total: internalAtsResult.total,
        risk: internalAtsResult.risk,
        scores: stripScoreLabels(internalAtsResult.scores),
        dimensions: stripDimensionProblems(internalAtsResult.dimensions),
        diagnostics: stripDiagnostics(internalAtsResult.diagnostics),
        topInsights: topInsights.map(stripInsight),
        topProblems: topProblems.map(stripInsight),
        freeMentorAdvice: freeAdvice ? stripFreeAdvice(freeAdvice) : null,
        lockedAdvicePreview: lockedPreview,
        keywordBreakdown: buildPublicKeywordBreakdown(internalAtsResult),
        problems: asArray(internalAtsResult.problems).slice(0, 3),
        suggestions: asArray(internalAtsResult.suggestions).slice(0, 3)
    };
}
function buildPublicKeywordBreakdown(internalAtsResult) {
    const cats = internalAtsResult.keywordMatch?.categories || {};
    const order = [
        "core_skills",
        "tools",
        "domain_keywords"
    ];
    const labels = {
        core_skills: "核心技能",
        tools: "工具 / 技术",
        domain_keywords: "领域词"
    };
    return order.filter((k)=>cats[k] && (cats[k].total > 0 || (cats[k].matchedTerms || []).length > 0 || (cats[k].missing || []).length > 0)).map((k)=>{
        const cat = cats[k];
        return {
            key: k,
            label: labels[k] || k,
            matched: (cat.matchedTerms || []).map((t)=>typeof t === "string" ? t : t.term).filter(Boolean),
            missing: (cat.missing || []).filter(Boolean),
            total: cat.total || 0
        };
    });
}
function riskToBucket(risk, total) {
    if (risk === "高" || risk === "high" || total < 55) return "high";
    if (risk === "中" || risk === "medium" || total < 75) return "medium";
    return "low";
}
function stripScoreLabels(scores) {
    return {
        overall: scores.overall,
        resumeQuality: {
            score: scores.resumeQuality.score,
            max: scores.resumeQuality.max
        },
        jdMatch: {
            score: scores.jdMatch.score,
            max: scores.jdMatch.max
        },
        searchability: {
            score: scores.searchability.score,
            max: scores.searchability.max
        }
    };
}
function stripDimensionProblems(dimensions) {
    return Object.fromEntries(Object.entries(dimensions).map(([key, value])=>[
            key,
            {
                score: value.score,
                max: value.max,
                percentage: value.percentage,
                label: value.label
            }
        ]));
}
function stripDiagnostics(diagnostics) {
    return {
        searchability: diagnostics.searchability,
        jobTitleMatch: {
            exactMatch: diagnostics.jobTitleMatch.exactMatch,
            targetTitle: diagnostics.jobTitleMatch.targetTitle === "unknown" ? "依 JD 自动识别" : diagnostics.jobTitleMatch.targetTitle,
            severity: diagnostics.jobTitleMatch.severity
        },
        measurableResults: diagnostics.measurableResults
    };
}
function stripInsight(item) {
    return {
        title: item.title,
        severity: item.severity,
        message: item.message
    };
}
function stripFreeAdvice(item) {
    if (Array.isArray(item.adviceItems)) {
        return {
            mentorId: item.mentorId,
            mentorName: item.mentorName,
            company: item.company,
            companyLogo: item.companyLogo || null,
            mentorTitle: item.mentorTitle,
            mentorSubtitle: item.mentorSubtitle,
            badges: asArray(item.badges).slice(0, 4),
            matchReason: item.matchReason,
            matchedProblems: asArray(item.matchedProblems).slice(0, 6),
            adviceItems: item.adviceItems.slice(0, 3).map((advice)=>({
                    adviceId: advice.adviceId,
                    title: advice.title,
                    currentDiagnosis: advice.currentDiagnosis || advice.problemSummary,
                    action: advice.action || advice.actionSummary,
                    mentorLens: advice.mentorLens || "",
                    reason: advice.reason || "",
                    mentorInsight: advice.mentorInsight || "",
                    example: advice.example || "",
                    hrPerspective: advice.hrPerspective || "",
                    evidence: asArray(advice.evidence).slice(0, 3),
                    targetSection: advice.targetSection || "overall",
                    relatedProblemTags: asArray(advice.relatedProblemTags).slice(0, 4),
                    priority: advice.priority || "medium",
                    priorityLabel: advice.priorityLabel || (advice.priority === "high" ? "P0 必改" : advice.priority === "medium" ? "P1 建议改" : "P2 加分项"),
                    source: advice.source || "db"
                })),
            careerPathDisplay: item.careerPathDisplay || null
        };
    }
    return {
        adviceId: item.adviceId,
        title: item.title,
        problemSummary: item.problemSummary,
        actionSummary: item.actionSummary
    };
}
function formatPremiumUnlockedReport(internalAtsResult, paidAdviceOrMentorReport) {
    const checklist = internalAtsResult.priorityMissingKeywords.slice(0, 20).map((item)=>({
            term: item.term,
            priority: item.priority,
            category: item.category,
            safeToAdd: item.safeToAdd,
            whereToAdd: item.category === "hard_skill" ? "Experience - first relevant role" : "Summary or Skills",
            reason: item.reason
        }));
    const sectionFixPlan = {
        summary: internalAtsResult.structuredSuggestions.filter((item)=>item.targetSection === "summary"),
        skills: internalAtsResult.structuredSuggestions.filter((item)=>item.targetSection === "skills"),
        experience: internalAtsResult.structuredSuggestions.filter((item)=>item.targetSection === "experience"),
        projects: internalAtsResult.structuredSuggestions.filter((item)=>item.targetSection === "projects"),
        education: internalAtsResult.structuredSuggestions.filter((item)=>item.targetSection === "education")
    };
    const mentorReport = Array.isArray(paidAdviceOrMentorReport) && paidAdviceOrMentorReport.some((item)=>Array.isArray(item.adviceItems)) ? {
        mentors: paidAdviceOrMentorReport
    } : paidAdviceOrMentorReport;
    if (mentorReport && Array.isArray(mentorReport.mentors)) {
        return {
            mentors: mentorReport.mentors.slice(0, 4).map((mentor)=>({
                    mentorId: mentor.mentorId,
                    mentorName: mentor.mentorName,
                    company: mentor.company,
                    companyLogo: mentor.companyLogo || null,
                    mentorTitle: mentor.mentorTitle,
                    mentorSubtitle: mentor.mentorSubtitle,
                    badges: asArray(mentor.badges).slice(0, 4),
                    matchReason: mentor.matchReason,
                    matchedProblems: asArray(mentor.matchedProblems).slice(0, 8),
                    adviceItems: asArray(mentor.adviceItems).slice(0, 3).map((item)=>({
                            adviceId: item.adviceId,
                            title: item.title,
                            problemSummary: item.problemSummary,
                            actionSummary: item.actionSummary,
                            mentorInsight: item.mentorInsight,
                            example: item.example,
                            hrPerspective: item.hrPerspective,
                            targetSection: item.targetSection || "overall",
                            relatedProblemTags: asArray(item.relatedProblemTags).slice(0, 5),
                            priority: item.priority || "medium",
                            source: item.source
                        }))
                })),
            coverageSummary: mentorReport.coverageSummary || {
                totalProblemsDetected: 0,
                problemsCovered: 0,
                coverageRatio: 1,
                coveredProblemTags: [],
                uncoveredProblemTags: []
            },
            missingKeywordChecklist: checklist,
            sectionFixPlan
        };
    }
    const paidAdvice = paidAdviceOrMentorReport;
    return {
        allMentorAdvice: asArray(paidAdvice).map((item)=>({
                adviceId: item.adviceId,
                title: item.title,
                problemSummary: item.problemSummary,
                actionSummary: item.actionSummary,
                mentorInsight: item.mentorInsight,
                example: item.example,
                mentorName: item.mentorName,
                topic: item.topic
            })),
        missingKeywordChecklist: checklist,
        sectionFixPlan,
        detailedSuggestions: internalAtsResult.structuredSuggestions
    };
}
function formatDebugReport(internalAtsResult, mentorCandidates = []) {
    return {
        internalAtsResult,
        metrics: internalAtsResult.metrics,
        problemTags: internalAtsResult.problemTags,
        retrievalQuery: internalAtsResult.retrievalQuery,
        mentorCandidates
    };
}
function createReportId() {
    return `rpt_${crypto.randomBytes(9).toString("hex")}`;
}
function createReportAccessToken() {
    return `rat_${crypto.randomBytes(24).toString("base64url")}`;
}
module.exports = {
    SCORE_CAP_THRESHOLDS,
    buildInternalAtsResult,
    buildScores,
    buildScoreCaps,
    buildDimensions,
    buildProfile,
    buildDiagnostics,
    buildKeywordMatchV2,
    buildPriorityMissingKeywords,
    buildProblemTags,
    buildTopInsights,
    buildTopProblems,
    buildStructuredSuggestions,
    buildRetrievalQuery,
    buildMentorAdviceSlots,
    buildReportAssembly,
    buildLockedPreview,
    formatInternalAtsResult,
    formatPublicFreeReport,
    formatPremiumUnlockedReport,
    formatDebugReport,
    createReportId,
    createReportAccessToken
};
}),
"[project]/database.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const { Pool } = __turbopack_context__.r("[externals]/pg [external] (pg, cjs, [project]/node_modules/pg)");
const crypto = __turbopack_context__.r("[externals]/crypto [external] (crypto, cjs)");
// ── 連線池（單例）────────────────────────────────────────────────
let _pool = null;
function getPool() {
    if (!_pool) {
        _pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            },
            max: 10,
            options: "-c search_path=vibe_offer"
        });
        _pool.on("error", (err)=>console.error("[DB] pool error:", err.message));
        console.log("[DB] Supabase pool initialized");
    }
    return _pool;
}
// ── 內部工具 ──────────────────────────────────────────────────────
function hashToken(token) {
    if (!token) return null;
    return crypto.createHash("sha256").update(String(token)).digest("hex");
}
function safeParseJSON(str, fallback) {
    try {
        return str ? JSON.parse(str) : fallback;
    } catch  {
        return fallback;
    }
}
function deserializeRow(row) {
    return {
        ...row,
        itemScores: safeParseJSON(row.item_scores_json, {}),
        keyProblems: safeParseJSON(row.key_problems_json, []),
        suggestions: safeParseJSON(row.suggestions_json, [])
    };
}
function deserializeAtsReport(row) {
    return {
        ...row,
        has_jd: Boolean(row.has_jd),
        publicReport: safeParseJSON(row.public_report_json, {}),
        internalAtsResult: safeParseJSON(row.internal_ats_json, {}),
        retrievalQuery: safeParseJSON(row.retrieval_query_json, {}),
        mentorCandidates: safeParseJSON(row.mentor_candidates_json, []),
        freeAdvice: safeParseJSON(row.free_advice_json, null),
        paidAdvice: safeParseJSON(row.paid_advice_json, []),
        premiumReport: safeParseJSON(row.premium_report_json, null)
    };
}
// ── resume_analyses ────────────────────────────────────────────────
async function saveAnalysis({ jobTitle, resumeText, jdText, result }) {
    const pool = getPool();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    await pool.query(`INSERT INTO resume_analyses (
        id, created_at, job_title, resume_text, jd_text,
        ats_score, risk_level, scoring_basis,
        item_scores_json, key_problems_json, suggestions_json,
        improvement_expectation, raw_response
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, [
        id,
        now,
        jobTitle || null,
        resumeText || null,
        jdText || null,
        result.basicScore ?? null,
        result.riskLevel || null,
        result.scoringBasis || null,
        JSON.stringify(result.itemScores || {}),
        JSON.stringify(result.keyProblems || []),
        JSON.stringify(result.suggestions || []),
        result.improvementExpectation || null,
        result.rawResponse || null
    ]);
    console.log(`[DB] 已儲存評分記錄 id=${id}`);
    return id;
}
async function getAnalysis(id) {
    const pool = getPool();
    const { rows } = await pool.query("SELECT * FROM resume_analyses WHERE id = $1", [
        id
    ]);
    if (!rows[0]) return null;
    return deserializeRow(rows[0]);
}
async function getRecentAnalyses(limit = 20) {
    const pool = getPool();
    const { rows } = await pool.query(`SELECT id, created_at, job_title, ats_score, risk_level,
            scoring_basis, improvement_expectation, is_paid
     FROM resume_analyses ORDER BY created_at DESC LIMIT $1`, [
        limit
    ]);
    return rows;
}
async function markAsPaid(id, isPaid = true) {
    const pool = getPool();
    await pool.query("UPDATE resume_analyses SET is_paid = $1 WHERE id = $2", [
        isPaid ? 1 : 0,
        id
    ]);
    console.log(`[DB] 已更新付費狀態 id=${id} isPaid=${isPaid}`);
}
// ── ats_reports ────────────────────────────────────────────────────
async function saveAtsReport(reportData) {
    const pool = getPool();
    const now = reportData.createdAt || new Date().toISOString();
    await pool.query(`INSERT INTO ats_reports (
        report_id, created_at, expires_at, job_title, has_jd, total, risk,
        public_report_json, internal_ats_json, retrieval_query_json,
        mentor_candidates_json, free_advice_json, paid_advice_json,
        premium_report_json, payment_status, user_id, report_token_hash
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      ON CONFLICT (report_id) DO NOTHING`, [
        reportData.reportId,
        now,
        reportData.expiresAt || null,
        reportData.jobTitle || null,
        reportData.hasJD ? 1 : 0,
        reportData.total ?? null,
        reportData.risk || null,
        JSON.stringify(reportData.publicReport || {}),
        JSON.stringify(reportData.internalAtsResult || {}),
        JSON.stringify(reportData.retrievalQuery || {}),
        JSON.stringify(reportData.mentorCandidates || []),
        JSON.stringify(reportData.freeAdvice || null),
        JSON.stringify(reportData.paidAdvice || []),
        reportData.premiumReport ? JSON.stringify(reportData.premiumReport) : null,
        reportData.paymentStatus || "unpaid",
        reportData.userId || null,
        hashToken(reportData.reportAccessToken)
    ]);
    console.log(`[DB] saved ats_report report_id=${reportData.reportId}`);
    return reportData.reportId;
}
async function getAtsReport(reportId) {
    const pool = getPool();
    const { rows } = await pool.query("SELECT * FROM ats_reports WHERE report_id = $1", [
        reportId
    ]);
    if (!rows[0]) return null;
    return deserializeAtsReport(rows[0]);
}
async function validateReportAccess(reportId, tokenOrUser = {}) {
    const row = await getAtsReport(reportId);
    if (!row) return {
        ok: false,
        status: 404,
        error: "REPORT_NOT_FOUND"
    };
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
        return {
            ok: false,
            status: 410,
            error: "REPORT_EXPIRED"
        };
    }
    if (row.user_id && tokenOrUser.userId === row.user_id) return {
        ok: true,
        report: row
    };
    if (row.report_token_hash && tokenOrUser.token && hashToken(tokenOrUser.token) === row.report_token_hash) {
        return {
            ok: true,
            report: row
        };
    }
    if (!row.user_id && !row.report_token_hash) return {
        ok: true,
        report: row
    };
    return {
        ok: false,
        status: 403,
        error: "ACCESS_DENIED"
    };
}
async function validateReportUnlock(reportId, tokenOrUser = {}) {
    const access = await validateReportAccess(reportId, tokenOrUser);
    if (!access.ok) return access;
    const devUnlock = process.env.DEV_UNLOCK_REPORTS === "true" && ("TURBOPACK compile-time value", "development") !== "production";
    if (access.report.payment_status === "paid" || devUnlock) {
        return {
            ok: true,
            report: access.report
        };
    }
    return {
        ok: false,
        status: 402,
        error: "PAYMENT_REQUIRED",
        report: access.report
    };
}
async function markAtsReportPaid(reportId, isPaid = true) {
    const pool = getPool();
    await pool.query("UPDATE ats_reports SET payment_status = $1 WHERE report_id = $2", [
        isPaid ? "paid" : "unpaid",
        reportId
    ]);
    console.log(`[DB] updated ats_report payment report_id=${reportId} paid=${isPaid}`);
}
async function closeDB() {
    if (_pool) {
        await _pool.end();
        _pool = null;
        console.log("[DB] 連線已關閉");
    }
}
process.on("exit", ()=>{
    if (_pool) _pool.end();
});
process.on("SIGINT", async ()=>{
    await closeDB();
    process.exit(0);
});
process.on("SIGTERM", async ()=>{
    await closeDB();
    process.exit(0);
});
module.exports = {
    getPool,
    saveAnalysis,
    getAnalysis,
    getRecentAnalyses,
    markAsPaid,
    saveAtsReport,
    getAtsReport,
    validateReportAccess,
    validateReportUnlock,
    markAtsReportPaid,
    hashToken
};
}),
"[project]/services/mentorAdviceRetrieval.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

const db = __turbopack_context__.r("[project]/database.js [app-route] (ecmascript)");
// pg pool is retrieved lazily via db.getPool()
const FALLBACK_FREE_ADVICE = {
    adviceId: "adv_free_tailor_resume",
    title: "不要一份简历投所有岗位",
    problemSummary: "你的简历需要根据目标岗位强化关键词与定位。",
    actionSummary: "根据目标岗位维护不同版本简历，把最相关的技能、项目和关键词放到对应版本里。",
    source: "fallback"
};
const ACCOUNTING_FALLBACK_FREE_ADVICE = {
    adviceId: "adv_free_accounting_positioning",
    title: "先让简历看起来像 Accounting 岗位",
    problemSummary: "你的简历目前和目标 JD 的关键词与职责语言匹配度较低，ATS 可能无法明确判断你在申请 Accounting 方向。",
    actionSummary: "优先把 Summary、Skills 和第一段 Experience 改成 Accounting 相关语言，例如 financial reporting、reconciliation、Excel、QuickBooks、GAAP、accounts payable/receivable 等真实掌握的关键词。",
    source: "fallback",
    adviceIntent: "resume_positioning"
};
const TECH_ROLE_FAMILIES = new Set([
    "software_engineer",
    "ai_engineer",
    "machine_learning",
    "data_scientist"
]);
const BUSINESS_ROLE_FAMILIES = new Set([
    "accounting",
    "finance",
    "financial_analyst",
    "business",
    "operations"
]);
// ── Company → logo file mapping (files live in public/logos/) ─────────────────
const COMPANY_LOGO_MAP = {
    // Big Tech
    "Amazon": "/logos/Amazon.png",
    "Amazon Web Services": "/logos/Amazon Web Services, Inc.png",
    "AWS": "/logos/Amazon Web Services, Inc.png",
    "Google": "/logos/google.png",
    "Meta": "/logos/Meta.png",
    "Microsoft": "/logos/Microsoft.png",
    "Apple": "/logos/Apple.png",
    "NVIDIA": "/logos/NVIDIA.png",
    "Intel": "/logos/Intel.png",
    "Qualcomm": "/logos/Qualcomm.png",
    "Cisco": "/logos/Cisco.png",
    "IBM": "/logos/IBM.jpg",
    "Oracle": "/logos/Oracle.png",
    "Salesforce": "/logos/Salesforce.png",
    "Adobe": "/logos/Adobe.png",
    "Intuit": "/logos/Intuit.png",
    "Snowflake": "/logos/Snowflake.png",
    "Spotify": "/logos/Spotify.png",
    "Uber": "/logos/Uber.jpg",
    "Robinhood": "/logos/Robinhood.png",
    "OpenAI": "/logos/OpenAI.png",
    "ByteDance": "/logos/ByteDance.png",
    "TikTok": "/logos/Tiktok.png",
    "SAP": "/logos/SAP.png",
    "DocuSign": "/logos/DocuSign.png",
    "Dynatrace": "/logos/Dynatrace.png",
    "Comcast": "/logos/Comcast Corporation.png",
    "Siemens": "/logos/Siemens.png",
    "Bosch": "/logos/Bosch Group.png",
    // Finance
    "Goldman Sachs": "/logos/Goldman Sachs.png",
    "JPMorgan": "/logos/JPMorgan Chase.png",
    "JPMorgan Chase": "/logos/JPMorganChase.png",
    "Morgan Stanley": "/logos/Morgan Stanley.png",
    "BlackRock": "/logos/BlackRock.png",
    "Capital One": "/logos/Capital One.png",
    "Bank of America": "/logos/Bank of America.png",
    "Citigroup": "/logos/Citigroup.png",
    "Citi": "/logos/Citigroup.png",
    "American Express": "/logos/American Express.png",
    "State Street": "/logos/State Street.png",
    "Guggenheim": "/logos/Guggenheim Partners.png",
    "Apollo": "/logos/Apollo.png",
    // Consulting
    "McKinsey": "/logos/McKinsey & Company.png",
    "McKinsey & Company": "/logos/McKinsey & Company.png",
    "BCG": "/logos/Boston Consulting Group.png",
    "Boston Consulting Group": "/logos/Boston Consulting Group.png",
    "Deloitte": "/logos/Deloitte.png",
    "KPMG": "/logos/KPMG.png",
    "EY": "/logos/EY.png",
    "PwC": "/logos/PRICE WATERHOUSE COOPERS.png",
    "PricewaterhouseCoopers": "/logos/PRICE WATERHOUSE COOPERS.png",
    "Accenture": "/logos/Accenture.png",
    "BDO": "/logos/BDO.png",
    // Semiconductor & Hardware
    "Applied Materials": "/logos/Applied Materials.png",
    "KLA": "/logos/KLA.png",
    "Lam Research": "/logos/Lam Research.png",
    "Marvell": "/logos/Marvell.png",
    "TSMC": "/logos/TSMC.png",
    "Texas Instruments": "/logos/Texas Instruments.png",
    "Cirrus Logic": "/logos/Cirrus Logic.png",
    "NXP": "/logos/NXP Semiconductors.png",
    "Renesas": "/logos/Renesas Electronics.png",
    "Skyworks": "/logos/Skyworks.png",
    // Healthcare / Pharma
    "Johnson & Johnson": "/logos/Johnson & Johnson.png",
    "Merck": "/logos/Merck.png",
    "Bristol Myers Squibb": "/logos/Bristol Myers Squibb.png",
    "Amgen": "/logos/Amgen.png",
    "Biogen": "/logos/Biogen.png",
    "Moderna": "/logos/Moderna.png",
    "AbbVie": "/logos/AbbVie.png",
    "Humana": "/logos/Humana.png",
    "CVS": "/logos/CVS Health.png",
    "Kaiser": "/logos/Kaiser Permanente.png",
    // Auto / Industrial
    "Tesla": "/logos/Tesla.png",
    "Ford": "/logos/Ford Motor Company.png",
    "General Motors": "/logos/General Motors.png",
    "GM": "/logos/General Motors.png",
    "Nissan": "/logos/Nissan.png",
    "Volvo": "/logos/Volvo Group.png",
    "John Deere": "/logos/John Deere.png",
    "GE": "/logos/General Electric.png",
    "General Electric": "/logos/General Electric.png",
    "Bosch Group": "/logos/Bosch Group.png",
    // Retail & Consumer
    "Amazon (Retail)": "/logos/Amazon.png",
    "Walmart": "/logos/Walmart.png",
    "Target": "/logos/Target.png",
    "Costco": "/logos/Costco.png",
    "Nordstrom": "/logos/Nordstrom.png",
    "Kroger": "/logos/Kroger.png",
    // Media & Entertainment
    "Disney": "/logos/Disney.png",
    "Warner Bros": "/logos/Warner Bros Discovery.png",
    "Sony": "/logos/Sony AI America Inc.png",
    "Spotify": "/logos/Spotify.png",
    "Sirius XM": "/logos/Sirius XM.png",
    "Skydance": "/logos/Skydance.png",
    // Logistics
    "FedEx": "/logos/FedEx.png",
    "UPS": null,
    "Amtrak": "/logos/Amtrak.png"
};
/**
 * Resolves a company name to its logo URL path.
 * Returns null if no logo is found.
 */ function resolveCompanyLogo(company) {
    if (!company) return null;
    // Exact match
    if (COMPANY_LOGO_MAP[company] !== undefined) return COMPANY_LOGO_MAP[company] || null;
    // Case-insensitive / substring match
    const lower = company.toLowerCase();
    for (const [key, val] of Object.entries(COMPANY_LOGO_MAP)){
        if (key.toLowerCase() === lower) return val || null;
        if (lower.includes(key.toLowerCase()) && key.length > 3) return val || null;
    }
    return null;
}
const DEFAULT_FREE_MENTOR_PROFILE = {
    mentorId: "mentor_amazon_default",
    mentorName: "Y 导师",
    company: "Amazon",
    companyLogo: "/logos/Amazon.png"
};
const CONFLICTING_TECH_KEYWORDS = [
    "spring boot",
    "rest api",
    "redis",
    "react",
    "node",
    "typescript",
    "pytorch",
    "transformer",
    "cnn",
    "backend",
    "frontend",
    "ai engineer",
    "software engineer",
    "software development engineer",
    "machine learning engineer"
];
const ACCOUNTING_UNSAFE_KEYWORDS = [
    ...CONFLICTING_TECH_KEYWORDS,
    "tip out",
    "measured cycle",
    "whole cycle"
];
const ACCOUNTING_FINANCE_TERMS = [
    "accounting",
    "finance",
    "audit",
    "bookkeeping",
    "financial reporting",
    "reconciliation",
    "excel",
    "quickbooks",
    "gaap",
    "accounts payable",
    "accounts receivable",
    "tax",
    "accountant",
    "financial analyst"
];
const RESUME_SCOPE_PATTERN = /简历|resume|ats|jd|keyword|关键词|投递|summary|skills|experience|bullet|岗位匹配|岗位定位|targeted resume|resume version/i;
const INTERVIEW_SCOPE_PATTERN = /面试|interview|behavioral|favorite course|课程|mock interview|star|tell me about yourself|自我介绍|stock answer|答案/i;
const ATS_PROBLEM_TAGS = new Set([
    "low_jd_keyword_match",
    "missing_priority_keywords",
    "weak_target_role_alignment",
    "resume_not_tailored_to_jd",
    "low_hard_skill_match",
    "keyword_gap_minor",
    "weak_experience_keyword_evidence",
    "keywords_only_in_skills",
    "missing_exact_job_title"
]);
const FREE_HIGH_RISK_INTENTS = new Set([
    "resume_jd_keyword_fix",
    "resume_positioning",
    "resume_section_rewrite",
    "resume_content_quality"
]);
function normalizeTerm(term) {
    return String(term || "").trim().toLowerCase().replace(/[\s-]+/g, "_").replace(/[^\p{L}\p{N}_]+/gu, "").replace(/^_+|_+$/g, "");
}
function splitCsv(value) {
    if (Array.isArray(value)) return value.map(normalizeTerm).filter(Boolean);
    if (!value) return [];
    return String(value).split(/[,;|，、\n]+/).map(normalizeTerm).filter(Boolean);
}
function includesAny(rowTerms, queryTerms) {
    const rowSet = new Set(splitCsv(rowTerms));
    return splitCsv(queryTerms).some((term)=>rowSet.has(term));
}
function overlapScore(queryTerms, rowTerms) {
    const query = [
        ...new Set(splitCsv(queryTerms))
    ];
    const row = new Set(splitCsv(rowTerms));
    if (!query.length || !row.size) return 0;
    const hits = query.filter((term)=>row.has(term)).length;
    return hits / query.length;
}
function inferRoleFamilyFromJobTitle(jobTitle) {
    const text = String(jobTitle || "").toLowerCase();
    if (/\b(accountant|accounting|bookkeep|audit|tax|controller|cpa|accounts payable|accounts receivable)\b/.test(text)) {
        return "accounting";
    }
    if (/\b(finance|financial|investment|fp&a|valuation|treasury)\b/.test(text)) return "finance";
    if (/\b(business|operations|strategy)\b/.test(text)) return "business";
    if (/\b(software|swe|sde|backend|frontend|full stack|developer|engineer)\b/.test(text)) {
        return "software_engineer";
    }
    if (/\b(data analyst|analytics analyst|business intelligence|bi analyst)\b/.test(text)) return "data_analyst";
    return "unknown";
}
function qualityNormalized(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 0.5;
    return Math.max(0, Math.min(1, numeric));
}
function dimensionsFromProblemTags(problemTags) {
    const map = {
        missing_exact_job_title: "F",
        keyword_gap_minor: "D",
        low_hard_skill_match: "D",
        low_soft_skill_match: "D",
        missing_priority_keywords: "D",
        low_jd_keyword_match: "D",
        weak_summary_role_alignment: "B",
        generic_resume_positioning: "F",
        low_role_specificity: "F",
        weak_target_role_alignment: "F",
        resume_not_tailored_to_jd: "D",
        low_measurable_results: "C",
        weak_action_verbs: "C",
        weak_result_orientation: "C",
        missing_linkedin: "B",
        missing_portfolio: "B",
        outdated_resume: "A",
        formatting_penalty_triggered: "A",
        short_tenure_unclear: "C",
        education_details_missing: "B"
    };
    return [
        ...new Set(splitCsv(problemTags).map((tag)=>map[tag]).filter(Boolean))
    ];
}
function queryRoleFamilies(retrievalQuery = {}) {
    const filters = retrievalQuery.filters || {};
    const direct = normalizeTerm(retrievalQuery.roleFamily);
    const inferred = inferRoleFamilyFromJobTitle(`${retrievalQuery.targetRole || ""} ${retrievalQuery.queryText || ""}`);
    return [
        ...new Set([
            ...splitCsv(filters.roleFamily),
            direct,
            inferred
        ].filter((term)=>term && term !== "unknown"))
    ];
}
function isBusinessQuery(retrievalQuery = {}) {
    return queryRoleFamilies(retrievalQuery).some((term)=>BUSINESS_ROLE_FAMILIES.has(term));
}
function rowText(row) {
    return [
        row.topic,
        row.L1,
        row.L2,
        row.P_mentor,
        row.A_action,
        row.I_insight,
        row.H_hook,
        row.E_example,
        row.HR_os,
        row.keywords,
        row.retrieval_text,
        row.advice_card_title,
        row.user_problem_summary,
        row.action_summary,
        row.role_family,
        row.target_roles
    ].filter(Boolean).join(" ").toLowerCase();
}
function inferAdviceScope(row) {
    const text = rowText(row);
    if (INTERVIEW_SCOPE_PATTERN.test(text)) {
        if (/behavioral|star|tell me about yourself|自我介绍/i.test(text)) return "behavioral_interview";
        return "interview_prep";
    }
    if (RESUME_SCOPE_PATTERN.test(text)) {
        if (/rewrite|改写|精修|bullet|experience/i.test(text)) return "resume_rewrite";
        if (/投递|strategy|version|版本|定位/i.test(text)) return "resume_strategy";
        return "resume_ats";
    }
    if (/job search|求职|networking|linkedin|岗位/i.test(text)) return "job_search_strategy";
    if (/career|职业|成长|规划/i.test(text)) return "career_coaching";
    return "unknown";
}
function inferAdviceIntent(row) {
    const text = rowText(row);
    if (INTERVIEW_SCOPE_PATTERN.test(text)) return "interview_prep";
    if (/3\s*小时|三\s*小时|尽快投递|投递时间|application timing|timing|apply within|early application|抢投|海投/i.test(text)) {
        return "application_timing";
    }
    if (/jd|ats|keyword|关键词|机筛|匹配|岗位匹配|targeted resume|resume version|版本/i.test(text)) {
        return "resume_jd_keyword_fix";
    }
    if (/summary|skills|experience|bullet|section|板块|经历|项目|改写|rewrite|精修/i.test(text)) {
        return "resume_section_rewrite";
    }
    if (/定位|positioning|目标岗位|像.*岗位|role fit|岗位方向/i.test(text)) return "resume_positioning";
    if (/量化|成果|content quality|action verb|impact|表达|内容质量/i.test(text)) return "resume_content_quality";
    if (/job search|求职策略|linkedin|networking|内推|投递策略/i.test(text)) return "job_search_strategy";
    if (/career|职业|成长|规划/i.test(text)) return "career_coaching";
    return "resume_positioning";
}
function isEligibleForAtsResumeReport(row) {
    const scope = inferAdviceScope(row);
    const text = rowText(row);
    if (scope === "interview_prep" || scope === "behavioral_interview") return false;
    if (/favorite course|stock answer|面试答案|interview answers?/i.test(text)) return false;
    if ([
        "resume_ats",
        "resume_rewrite",
        "resume_strategy",
        "job_search_strategy"
    ].includes(scope)) return true;
    if (String(row.ats_dimensions || "").trim()) return true;
    if (splitCsv(row.problem_tags).some((tag)=>ATS_PROBLEM_TAGS.has(tag))) return true;
    return false;
}
function isTechOnlyRow(row) {
    const rowRoles = [
        ...splitCsv(row.role_family),
        ...splitCsv(row.target_roles)
    ].filter((term)=>term !== "universal");
    return rowRoles.length > 0 && rowRoles.every((term)=>TECH_ROLE_FAMILIES.has(term) || /software|backend|frontend|ai|machine_learning/.test(term));
}
function hasConflictingRoleExamples(row, retrievalQuery = {}) {
    if (!isBusinessQuery(retrievalQuery)) return false;
    const text = rowText(row);
    const unsafe = isAccountingQuery(retrievalQuery) ? ACCOUNTING_UNSAFE_KEYWORDS : CONFLICTING_TECH_KEYWORDS;
    return unsafe.some((keyword)=>text.includes(keyword));
}
function isAdviceRoleSafe(row, targetRole, roleFamily) {
    const normalizedRole = normalizeTerm(targetRole || "");
    const normalizedFamily = normalizeTerm(roleFamily || inferRoleFamilyFromJobTitle(targetRole));
    const retrievalQuery = {
        roleFamily: normalizedFamily,
        targetRole: normalizedRole,
        queryText: `${targetRole || ""} ${roleFamily || ""}`,
        filters: {
            roleFamily: [
                normalizedFamily
            ].filter(Boolean),
            targetRoles: [
                normalizedRole
            ].filter(Boolean)
        }
    };
    const scope = row.adviceScope || inferAdviceScope(row);
    const intent = row.adviceIntent || inferAdviceIntent(row);
    const text = rowText(row);
    if (scope === "interview_prep" || scope === "behavioral_interview") return false;
    if (intent === "interview_prep") return false;
    if (!isEligibleForAtsResumeReport(row)) return false;
    if (hasConflictingRoleExamples(row, retrievalQuery)) return false;
    const nonTechnical = ![
        "software_engineer",
        "ai_engineer",
        "machine_learning",
        "data_scientist"
    ].includes(normalizedFamily);
    if (nonTechnical && CONFLICTING_TECH_KEYWORDS.some((keyword)=>text.includes(keyword))) return false;
    if (normalizedFamily === "accounting" || normalizedFamily === "finance" || /account/.test(normalizedRole)) {
        if (ACCOUNTING_UNSAFE_KEYWORDS.some((keyword)=>text.includes(keyword))) return false;
    }
    return /resume|ats|jd|keyword|summary|skills|experience|bullet|简历|关键词|岗位|匹配|经历/i.test(text);
}
function calculateRoleMismatchPenalty(row, retrievalQuery = {}) {
    const queryFamilies = queryRoleFamilies(retrievalQuery);
    const rowFamilies = splitCsv(row.role_family);
    const rowTargets = splitCsv(row.target_roles);
    const concreteFamilies = rowFamilies.filter((term)=>term !== "universal");
    const concreteTargets = rowTargets.filter((term)=>term !== "universal");
    const businessQuery = queryFamilies.some((term)=>BUSINESS_ROLE_FAMILIES.has(term));
    const familyMatch = concreteFamilies.some((term)=>queryFamilies.includes(term));
    if (!queryFamilies.length) return 0;
    if (businessQuery && isTechOnlyRow(row)) return 0.65;
    if (businessQuery && concreteTargets.some((term)=>/software|backend|frontend|ai|machine_learning/.test(term))) return 0.5;
    if (!familyMatch && concreteFamilies.length) return 0.35;
    if (rowFamilies.includes("universal") && !familyMatch) return 0.08;
    return 0;
}
function conflictingExamplePenalty(row, retrievalQuery = {}) {
    return hasConflictingRoleExamples(row, retrievalQuery) ? 0.45 : 0;
}
function calculateRetrievalScore(row, retrievalQuery = {}) {
    const filters = retrievalQuery.filters || {};
    const problemTagScore = overlapScore(retrievalQuery.problemTags, row.problem_tags);
    const roleFamilyScore = overlapScore(filters.roleFamily, row.role_family);
    const targetRoleScore = overlapScore(filters.targetRoles, row.target_roles);
    const seniorityScore = includesAny(row.seniority, "universal") ? Math.max(0.65, overlapScore(filters.seniority, row.seniority)) : overlapScore(filters.seniority, row.seniority);
    const keywordScore = overlapScore(retrievalQuery.priorityKeywords, row.keywords);
    const dimensionScore = overlapScore(dimensionsFromProblemTags(retrievalQuery.problemTags), row.ats_dimensions);
    const accountingKeywordBoost = isBusinessQuery(retrievalQuery) ? overlapScore(ACCOUNTING_FINANCE_TERMS, row.keywords) : 0;
    const roleMismatchPenalty = calculateRoleMismatchPenalty(row, retrievalQuery);
    const roleConflictPenalty = conflictingExamplePenalty(row, retrievalQuery);
    const score = 0.35 * Math.max(problemTagScore, dimensionScore * 0.8) + 0.25 * roleFamilyScore + 0.15 * targetRoleScore + 0.10 * seniorityScore + 0.10 * Math.max(keywordScore, accountingKeywordBoost) + 0.05 * qualityNormalized(row.mentor_quality_score) - roleMismatchPenalty - roleConflictPenalty;
    return Number(score.toFixed(6));
}
function buildMatchedReasons(row, retrievalQuery = {}) {
    const filters = retrievalQuery.filters || {};
    const reasons = [];
    if (overlapScore(retrievalQuery.problemTags, row.problem_tags) > 0) reasons.push("problem_tags");
    if (overlapScore(filters.roleFamily, row.role_family) > 0) reasons.push("role_family");
    if (overlapScore(filters.targetRoles, row.target_roles) > 0) reasons.push("target_roles");
    if (overlapScore(filters.seniority, row.seniority) > 0) reasons.push("seniority");
    if (overlapScore(retrievalQuery.priorityKeywords, row.keywords) > 0) reasons.push("keywords");
    if (overlapScore(dimensionsFromProblemTags(retrievalQuery.problemTags), row.ats_dimensions) > 0) reasons.push("ats_dimensions");
    if (calculateRoleMismatchPenalty(row, retrievalQuery) > 0) reasons.push("role_mismatch_penalty");
    if (hasConflictingRoleExamples(row, retrievalQuery)) reasons.push("conflicting_role_examples");
    const scope = inferAdviceScope(row);
    if (scope !== "unknown") reasons.push(`scope:${scope}`);
    if (includesAny(row.role_family, "universal") || includesAny(row.target_roles, "universal") || includesAny(row.seniority, "universal")) {
        reasons.push("universal_fallback");
    }
    return [
        ...new Set(reasons)
    ];
}
function cleanAndTruncate(value, maxLength = 140, fallback = "") {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (!text) return fallback;
    if (text.length <= maxLength) return text;
    const slice = text.slice(0, maxLength);
    const sentenceEnd = Math.max(slice.lastIndexOf("。"), slice.lastIndexOf("."), slice.lastIndexOf("！"), slice.lastIndexOf("!"), slice.lastIndexOf("？"), slice.lastIndexOf("?"));
    if (sentenceEnd >= 24) return slice.slice(0, sentenceEnd + 1).trim();
    const commaEnd = Math.max(slice.lastIndexOf("，"), slice.lastIndexOf(","), slice.lastIndexOf("；"), slice.lastIndexOf(";"));
    let cut = commaEnd >= 24 ? slice.slice(0, commaEnd).trim() : slice.trim();
    cut = cut.replace(/[\s([{（【《"'“‘,:;，；、]+$/u, "").trim();
    const lastSpace = cut.lastIndexOf(" ");
    if (/^[\x00-\x7F]+$/.test(cut) && lastSpace > Math.floor(maxLength * 0.55)) {
        cut = cut.slice(0, lastSpace).trim();
    }
    if (!cut || /如\s*[a-z]?$/i.test(cut) || /[(（【《]$/.test(cut)) {
        return fallback || `${text.slice(0, Math.max(1, maxLength - 3)).trim()}...`;
    }
    return `${cut}...`;
}
function truncateAtSentence(value, maxLength = 140) {
    return cleanAndTruncate(value, maxLength);
}
function roleSafeActionSummary(row, retrievalQuery = {}) {
    if (hasConflictingRoleExamples(row, retrievalQuery)) {
        return "根据目标岗位维护不同版本简历，把最相关的技能、项目和关键词放到对应版本里。";
    }
    return row.action_summary || row.A_action;
}
function formatAdviceCardForPublic(row, retrievalQuery = {}) {
    return {
        adviceId: row.chunk_id || `seg_${row.id}`,
        title: row.advice_card_title || row.topic,
        problemSummary: cleanAndTruncate(row.user_problem_summary || row.P_mentor, 180),
        actionSummary: cleanAndTruncate(roleSafeActionSummary(row, retrievalQuery), 220),
        mentorInsight: row.I_insight || "",
        example: row.E_example || "",
        hrPerspective: row.HR_os || "",
        topic: row.topic_slug || row.L2,
        mentorName: row.mentor_name,
        unlockTier: row.unlock_tier || "paid",
        safeToShowFree: Number(row.safe_to_show_free || 0) === 1,
        roleFamily: row.role_family || "",
        targetRoles: row.target_roles || "",
        keywords: row.keywords || "",
        atsDimensions: row.ats_dimensions || "",
        retrieval_score: row.retrieval_score,
        matched_reasons: row.matched_reasons || [],
        roleMismatchPenalty: row.roleMismatchPenalty || 0,
        conflictingExamplePenalty: row.conflictingExamplePenalty || 0,
        adviceScope: row.adviceScope || inferAdviceScope(row),
        adviceIntent: row.adviceIntent || inferAdviceIntent(row),
        mentor_title: row.mentor_title || null,
        mentor_career_keywords: row.mentor_career_keywords || null,
        mentor_career_path_display: row.mentor_career_path_display || null,
        mentor_company: row.mentor_company || null
    };
}
function formatAdviceCard(row) {
    return formatAdviceCardForPublic(row, {});
}
function baseSelectSql(where) {
    return `
    SELECT
      id, chunk_id, topic, "L1", "L2", "P_mentor", "A_action", "I_insight", "H_hook", "E_example", "HR_os",
      advice_type, mentor_name, role_family, target_roles, seniority, ats_dimensions,
      problem_tags, keywords, topic_slug, retrieval_text, priority, unlock_tier,
      advice_card_title, user_problem_summary, action_summary, safe_to_show_free,
      requires_ai_rewrite, mentor_quality_score, feedback_score,
      mentor_title, mentor_career_keywords, mentor_career_path_display, mentor_company
    FROM segments
    WHERE ${where}
    LIMIT 500
  `;
}
function likeClauseForTerms(columns, terms, startIdx = 1) {
    const clauses = [];
    const params = [];
    let idx = startIdx;
    for (const term of [
        ...new Set(terms)
    ].filter(Boolean).slice(0, 30)){
        const like = `%${term.replace(/_/g, "%")}%`;
        clauses.push(`(${columns.map((col)=>`LOWER(COALESCE(${col},'')) LIKE $${idx++}`).join(" OR ")})`);
        params.push(...columns.map(()=>like));
    }
    return {
        clause: clauses.length ? clauses.join(" OR ") : "1 = 0",
        params
    };
}
async function queryRows(pool, where, params, retrievalQuery) {
    const { rows } = await pool.query(baseSelectSql(where), params);
    return rows.filter((row)=>isEligibleForAtsResumeReport(row)).map((row)=>{
        const retrieval_score = calculateRetrievalScore(row, retrievalQuery);
        const matched_reasons = buildMatchedReasons(row, retrievalQuery);
        const roleMismatchPenalty = calculateRoleMismatchPenalty(row, retrievalQuery);
        const rowConflictPenalty = conflictingExamplePenalty(row, retrievalQuery);
        return formatAdviceCardForPublic({
            ...row,
            retrieval_score,
            matched_reasons,
            roleMismatchPenalty,
            conflictingExamplePenalty: rowConflictPenalty,
            adviceScope: inferAdviceScope(row),
            adviceIntent: inferAdviceIntent(row)
        }, retrievalQuery);
    });
}
function isHighRiskAtsGap(retrievalQuery = {}) {
    const tags = splitCsv(retrievalQuery.problemTags);
    const text = `${retrievalQuery.queryText || ""} ${tags.join(" ")}`.toLowerCase();
    return tags.some((tag)=>[
            "low_jd_keyword_match",
            "low_hard_skill_match",
            "weak_target_role_alignment",
            "missing_priority_keywords"
        ].includes(tag)) || /high|critical|low_jd|low_hard|keyword_gap/.test(text);
}
function isAccountingQuery(retrievalQuery = {}) {
    return queryRoleFamilies(retrievalQuery).some((term)=>term === "accounting" || term === "finance");
}
function hasStrictSignal(card) {
    return card.matched_reasons.some((reason)=>[
            "problem_tags",
            "ats_dimensions",
            "role_family",
            "target_roles",
            "keywords"
        ].includes(reason));
}
function isGenericUniversalResumeAdvice(card) {
    const reasons = card.matched_reasons || [];
    const scopeAllowed = [
        "resume_ats",
        "resume_rewrite",
        "resume_strategy",
        "job_search_strategy"
    ].includes(card.adviceScope);
    return scopeAllowed && reasons.includes("universal_fallback") && !reasons.includes("conflicting_role_examples");
}
function rankCandidates(candidates, limit) {
    return candidates.filter((card)=>card.retrieval_score > 0).sort((a, b)=>b.retrieval_score - a.retrieval_score || Number(b.safeToShowFree) - Number(a.safeToShowFree) || String(a.adviceId).localeCompare(String(b.adviceId))).slice(0, limit);
}
async function retrieveStrictCandidates(retrievalQuery = {}, options = {}) {
    const pool = options.pool || db.getPool();
    const filters = retrievalQuery.filters || {};
    const terms = [
        ...splitCsv(filters.roleFamily),
        ...splitCsv(filters.targetRoles),
        ...splitCsv(retrievalQuery.problemTags),
        ...splitCsv(retrievalQuery.priorityKeywords),
        ...dimensionsFromProblemTags(retrievalQuery.problemTags)
    ].filter((term)=>term && term !== "unknown" && term !== "universal");
    const { clause, params } = likeClauseForTerms([
        "role_family",
        "target_roles",
        "problem_tags",
        "keywords",
        "ats_dimensions",
        "retrieval_text"
    ], terms);
    const rows = (await queryRows(pool, clause, params, retrievalQuery)).filter(hasStrictSignal).filter((card)=>!card.matched_reasons.includes("conflicting_role_examples")).filter((card)=>card.roleMismatchPenalty < 0.35);
    return rankCandidates(rows, options.limit || 80);
}
async function retrieveFallbackCandidates(retrievalQuery = {}, options = {}) {
    const pool = options.pool || db.getPool();
    const terms = [
        ...splitCsv(retrievalQuery.problemTags),
        ...splitCsv(retrievalQuery.priorityKeywords),
        ...dimensionsFromProblemTags(retrievalQuery.problemTags),
        "universal"
    ].filter(Boolean);
    const { clause, params } = likeClauseForTerms([
        "role_family",
        "target_roles",
        "seniority",
        "problem_tags",
        "keywords",
        "ats_dimensions",
        "retrieval_text"
    ], terms);
    const rows = (await queryRows(pool, clause, params, retrievalQuery)).filter(isGenericUniversalResumeAdvice).filter((card)=>!card.matched_reasons.includes("conflicting_role_examples"));
    return rankCandidates(rows, options.limit || 80);
}
async function retrieveMentorAdvice(retrievalQuery = {}, options = {}) {
    const limit = options.limit || 80;
    const pool = options.pool || db.getPool();
    const [countResult, allRowsResult] = await Promise.all([
        pool.query("SELECT COUNT(*) AS count FROM segments"),
        pool.query(baseSelectSql("1 = 1"), [])
    ]);
    const rawRows = parseInt(countResult.rows[0].count, 10);
    const allRows = allRowsResult.rows;
    const eligibleRows = allRows.filter(isEligibleForAtsResumeReport);
    const excludedInterviewAdvice = allRows.filter((row)=>[
            "interview_prep",
            "behavioral_interview"
        ].includes(inferAdviceScope(row))).length;
    const [strictCandidates, fallbackCandidates] = await Promise.all([
        retrieveStrictCandidates(retrievalQuery, {
            ...options,
            pool,
            limit
        }),
        retrieveFallbackCandidates(retrievalQuery, {
            ...options,
            pool,
            limit
        })
    ]);
    const byId = new Map();
    for (const candidate of [
        ...strictCandidates,
        ...fallbackCandidates
    ]){
        const existing = byId.get(candidate.adviceId);
        if (!existing || candidate.retrieval_score > existing.retrieval_score) byId.set(candidate.adviceId, candidate);
    }
    const candidates = rankCandidates([
        ...byId.values()
    ], limit);
    Object.defineProperty(candidates, "debug", {
        enumerable: false,
        value: {
            strictCandidates: strictCandidates.length,
            fallbackCandidates: fallbackCandidates.length,
            rawRows,
            eligibleRows: eligibleRows.length,
            excludedInterviewAdvice,
            maxRoleMismatchPenalty: candidates.reduce((max, card)=>Math.max(max, card.roleMismatchPenalty || 0), 0),
            selectedScope: candidates[0]?.adviceScope || "fallback",
            retrievalQuery
        }
    });
    return candidates;
}
function selectFreeAdvice(candidates, retrievalQuery = candidates?.debug?.retrievalQuery || {}) {
    const requireResumeIntent = isHighRiskAtsGap(retrievalQuery);
    const freeAdvice = candidates.filter((card)=>card.unlockTier === "free" || card.safeToShowFree).filter((card)=>![
            "interview_prep",
            "behavioral_interview"
        ].includes(card.adviceScope)).filter((card)=>card.adviceIntent !== "application_timing").filter((card)=>!requireResumeIntent || FREE_HIGH_RISK_INTENTS.has(card.adviceIntent)).filter((card)=>!card.matched_reasons?.includes("conflicting_role_examples")).sort((a, b)=>b.retrieval_score - a.retrieval_score || String(a.adviceId).localeCompare(String(b.adviceId)))[0];
    return freeAdvice || (isAccountingQuery(retrievalQuery) ? ACCOUNTING_FALLBACK_FREE_ADVICE : FALLBACK_FREE_ADVICE);
}
function selectPaidAdvice(candidates, freeAdvice) {
    const selected = [];
    const usedTopics = new Set();
    const freeId = freeAdvice?.adviceId;
    const paidCandidates = candidates.filter((card)=>card.adviceId !== freeId).filter((card)=>![
            "interview_prep",
            "behavioral_interview"
        ].includes(card.adviceScope)).filter((card)=>!card.matched_reasons?.includes("conflicting_role_examples")).sort((a, b)=>Number(b.unlockTier === "paid") - Number(a.unlockTier === "paid") || b.retrieval_score - a.retrieval_score || String(a.adviceId).localeCompare(String(b.adviceId)));
    for (const card of paidCandidates){
        if (selected.length >= 3) break;
        if (card.topic && usedTopics.has(card.topic)) continue;
        selected.push(card);
        if (card.topic) usedTopics.add(card.topic);
    }
    for (const card of paidCandidates){
        if (selected.length >= 3) break;
        if (!selected.some((item)=>item.adviceId === card.adviceId)) selected.push(card);
    }
    return selected.slice(0, 3);
}
function problemTagsFromInternal(internalAtsResult = {}) {
    return (internalAtsResult.problemTags || []).map((item)=>({
            tag: item.tag,
            severity: item.severity || "medium",
            dimension: item.dimension || "overall",
            topic: item.topic || "resume_ats"
        })).filter((item)=>item.tag);
}
function severityWeight(severity) {
    return ({
        critical: 1,
        high: 0.85,
        medium: 0.55,
        low: 0.25
    })[severity] ?? 0.4;
}
function targetSectionFromCard(card = {}) {
    const text = `${card.title || ""} ${card.problemSummary || ""} ${card.actionSummary || ""} ${card.topic || ""}`.toLowerCase();
    if (/summary|定位|about/.test(text)) return "summary";
    if (/skill|关键词|keyword|工具/.test(text)) return "skills";
    if (/experience|bullet|经历|项目|证据/.test(text)) return "experience";
    if (/education|gpa|coursework|学校/.test(text)) return "education";
    if (/project|项目/.test(text)) return "projects";
    return "overall";
}
function priorityFromTags(tags = [], problemTags = []) {
    const severities = new Map(problemTags.map((item)=>[
            item.tag,
            item.severity
        ]));
    if (tags.some((tag)=>[
            "critical",
            "high"
        ].includes(severities.get(tag)))) return "high";
    if (tags.some((tag)=>severities.get(tag) === "medium")) return "medium";
    return "low";
}
function priorityLabel(priority) {
    if (priority === "high" || priority === "critical") return "P0 必改";
    if (priority === "medium") return "P1 建议改";
    return "P2 加分项";
}
function generateUserDiagnosis(relatedProblemTags = [], targetProblemTags = [], internalAtsResult = {}, usedDiagnosisTags = new Set()) {
    const dims = internalAtsResult.dimensions || {};
    const missingKw = (internalAtsResult.topMissingKeywords || internalAtsResult.topMissingKw || []).slice(0, 3);
    const jobTitle = internalAtsResult.jobTitle || "目标岗位";
    const jdRatio = internalAtsResult.jdMatchRatio != null ? Math.round(internalAtsResult.jdMatchRatio) : internalAtsResult.keywordMatch?.summary?.overallKeywordCoverage != null ? Math.round(internalAtsResult.keywordMatch.summary.overallKeywordCoverage * 100) : null;
    const diagnoses = {
        low_jd_keyword_match: ()=>`简历与目标 JD 的关键词匹配偏低${jdRatio != null ? `（当前约 ${jdRatio}%）` : ""}，ATS 扫描时匹配信号不够强，容易在第一轮被过滤。`,
        low_hard_skill_match: ()=>`目标岗位的核心技能词${missingKw.length ? `（如 ${missingKw.join("、")}）` : ""}在简历中出现不足，ATS 难以确认你的技能匹配度。`,
        missing_exact_job_title: ()=>`简历中缺少"${jobTitle}"作为精确职位名称，ATS 按岗位原词检索时可能会排除你的简历。`,
        missing_priority_keywords: ()=>`简历缺少目标岗位优先级较高的关键词${missingKw.length ? `（如 ${missingKw.join("、")}）` : ""}，这些词在 ATS 中权重较高。`,
        weak_summary_role_alignment: ()=>`Summary 段落与目标岗位"${jobTitle}"的定位关联不够直接，HR 初筛时难以快速识别你的求职方向。`,
        weak_target_role_alignment: ()=>`简历整体对"${jobTitle}"的方向匹配度偏弱，需要更系统地对照 JD 调整定位和关键词。`,
        weak_experience_keyword_evidence: ()=>`经历 bullet 中目标岗位的核心技能证据不足，技能更多出现在 Skills 栏，缺少在实际工作中使用它们的成果佐证。`,
        keywords_only_in_skills: ()=>`核心技能词主要集中在 Skills 栏，在 Experience 的 bullet 里缺少通过实际成果呈现它们的记录，说服力较弱。`,
        resume_not_tailored_to_jd: ()=>`简历内容与目标 JD 的针对性不足，未能体现对"${jobTitle}"关键词和要求的专项对应。`
    };
    const unusedTags = relatedProblemTags.filter((t)=>diagnoses[t] && !usedDiagnosisTags.has(t));
    const tagPool = unusedTags.length ? unusedTags : relatedProblemTags;
    for (const tag of tagPool){
        if (diagnoses[tag]) {
            usedDiagnosisTags.add(tag);
            return diagnoses[tag]();
        }
    }
    // Generic fallback: point to weakest dimension
    const weakDimLabels = {
        A: "格式规范",
        B: "基本资料",
        C: "内容质量",
        D: "JD 关键词匹配",
        E: "市场适配度",
        F: "经验匹配度"
    };
    const dimEntries = Object.entries(dims).map(([k, v])=>({
            k,
            pct: v.max > 0 ? v.score / v.max : 1
        })).sort((a, b)=>a.pct - b.pct);
    if (dimEntries.length && dimEntries[0].pct < 0.65 && weakDimLabels[dimEntries[0].k]) {
        return `简历在「${weakDimLabels[dimEntries[0].k]}」维度得分偏低，这是影响 ATS 通过率的主要因素之一。`;
    }
    return `简历与目标岗位的匹配信号还不够集中，建议重点对照 JD 优化关键词和成果表达。`;
}
function isBucketRoleSafe(bucket, targetRoleFamily) {
    if (!targetRoleFamily || targetRoleFamily === "unknown") return true;
    const families = bucket.roleFamilies || [];
    // Allow universal content or buckets with no role tags (old data)
    if (families.length === 0) return true;
    if (families.includes("universal")) return true;
    return families.includes(normalizeTerm(targetRoleFamily));
}
function relatedTagsForCard(card = {}, targetProblemTags = []) {
    const cardReasons = splitCsv(card.matched_reasons || []);
    const text = `${card.title || ""} ${card.problemSummary || ""} ${card.actionSummary || ""} ${card.topic || ""} ${card.adviceIntent || ""}`.toLowerCase();
    const tags = [];
    for (const problem of targetProblemTags){
        const tag = problem.tag;
        if (!tag) continue;
        if (cardReasons.includes(tag) || text.includes(tag.replace(/_/g, " "))) tags.push(tag);
        else if (/keyword|关键词|jd|ats/.test(text) && /keyword|jd|hard_skill|priority/.test(tag)) tags.push(tag);
        else if (/summary|定位|position/.test(text) && /summary|role|title|position/.test(tag)) tags.push(tag);
        else if (/experience|bullet|经历|证据/.test(text) && /experience|evidence|skills_only/.test(tag)) tags.push(tag);
        else if (/量化|result|impact|成果/.test(text) && /measurable|result|action/.test(tag)) tags.push(tag);
        else if (/linkedin|portfolio|searchability/.test(text) && /linkedin|portfolio|searchability/.test(tag)) tags.push(tag);
    }
    return [
        ...new Set(tags)
    ].slice(0, 3);
}
function toAdviceItem(card = {}, targetProblemTags = [], index = 0, includePremiumFields = false, internalAtsResult = {}, usedDiagnosisTags = new Set()) {
    const relatedProblemTags = card.relatedProblemTags || relatedTagsForCard(card, targetProblemTags);
    const defaultAction = "优先把目标岗位关键词、相关技能和经历证据放到 Summary、Skills 和 Experience 中。";
    // Always generate diagnosis from the CURRENT user's ATS data, not the original DB user's problem summary
    const currentDiagnosis = generateUserDiagnosis(relatedProblemTags, targetProblemTags, internalAtsResult, usedDiagnosisTags);
    const action = cleanAndTruncate(card.action || card.actionSummary || defaultAction, 280, defaultAction);
    // mentorLens: new schema field; for DB-adapted rows derive from P_mentor if helpful
    const mentorLens = card.mentorLens || "";
    // reason: new schema field; for DB-adapted rows, I_insight is the closest analog
    const reason = card.reason || "";
    // evidence: explicit chips array; populated by fallback templates or buildAdviceEvidence later
    const evidence = Array.isArray(card.evidence) ? [
        ...card.evidence
    ] : [];
    // Determine source: prefer explicit, then detect whether we have native new-schema fields
    const hasNativeNewSchema = !!(card.mentorLens || card.currentDiagnosis || card.action || card.reason);
    const source = card.source || (hasNativeNewSchema ? "db" : "db_adapted");
    const item = {
        adviceId: card.adviceId || `fallback_${index}`,
        title: cleanAndTruncate(card.title || "优化简历与目标岗位的匹配度", 80, "优化简历与目标岗位的匹配度"),
        mentorLens,
        currentDiagnosis,
        action,
        reason,
        evidence,
        // backward compat aliases
        problemSummary: currentDiagnosis,
        actionSummary: action,
        targetSection: card.targetSection || targetSectionFromCard(card),
        relatedProblemTags,
        priority: card.priority || priorityFromTags(relatedProblemTags, targetProblemTags),
        priorityLabel: priorityLabel(card.priority || priorityFromTags(relatedProblemTags, targetProblemTags)),
        source
    };
    if (includePremiumFields) {
        item.mentorInsight = card.mentorInsight || card.I_insight || "";
        item.example = card.example || card.E_example || "";
        item.hrPerspective = card.hrPerspective || card.HR_os || "";
    }
    return item;
}
function fallbackAdviceItems(internalAtsResult = {}, count = 3, usedTags = new Set()) {
    const profile = internalAtsResult.profile || {};
    const roleFamily = normalizeTerm(profile.roleFamily || "");
    const targetRole = internalAtsResult.jobTitle || profile.targetRole || "target role";
    const ROLE_PROFILES = {
        accounting: {
            name: "Accounting",
            keywords: "financial reporting、reconciliation、Excel、QuickBooks、GAAP、accounts payable/receivable、audit support 或 month-end close",
            evidence: "说明你处理了什么报表、对账、发票或流程，并补充数量、频率或结果。"
        },
        finance: {
            name: "Finance",
            keywords: "financial modeling、Excel、valuation、DCF、budgeting、variance analysis、FP&A、Bloomberg 或 financial statements",
            evidence: "说明你构建了什么模型、分析了什么财务数据、支持了什么决策，并补充规模或结果。"
        },
        financial_analyst: {
            name: "Financial Analyst",
            keywords: "financial modeling、Excel、variance analysis、budgeting、forecasting、KPI tracking 或 reporting",
            evidence: "说明你分析了什么数据、提交了什么报告、支持了什么业务决策。"
        },
        software_engineer: {
            name: "Software Engineer",
            keywords: "distributed systems、microservices、APIs、CI/CD、AWS、TypeScript、Java、Python 或 system design",
            evidence: "说明你设计或实现了什么服务、API 或系统模块，并补充规模、性能或可靠性结果。"
        },
        ai_engineer: {
            name: "AI / ML Engineer",
            keywords: "Python、PyTorch、TensorFlow、LLM、fine-tuning、model deployment、RAG、vector DB 或 ML pipeline",
            evidence: "说明你训练或部署了什么模型，并补充准确率、延迟或业务影响。"
        },
        machine_learning: {
            name: "Machine Learning",
            keywords: "Python、scikit-learn、PyTorch、feature engineering、model evaluation、A/B testing 或 data pipeline",
            evidence: "说明你解决了什么 ML 问题、使用了什么方法、取得了什么指标结果。"
        },
        data_scientist: {
            name: "Data Scientist",
            keywords: "Python、R、SQL、statistical modeling、A/B testing、machine learning、visualization 或 experimentation",
            evidence: "说明你做了什么分析、使用了什么方法、输出了什么洞察或业务建议。"
        },
        data_analyst: {
            name: "Data Analyst",
            keywords: "SQL、Excel、Tableau、Power BI、data cleaning、KPI reporting、dashboards 或 business insights",
            evidence: "说明你清洗了什么数据、搭建了什么 dashboard、追踪了什么 KPI，并补充业务洞察或结果。"
        },
        product_manager: {
            name: "Product Manager",
            keywords: "product roadmap、user research、A/B testing、PRD、stakeholder management、OKR、go-to-market 或 cross-functional",
            evidence: "说明你负责了什么产品或功能、如何推动跨团队协作、取得了什么可量化结果。"
        },
        marketing: {
            name: "Marketing",
            keywords: "campaign management、SEO/SEM、Google Analytics、content strategy、brand awareness、lead generation 或 CRM",
            evidence: "说明你策划或执行了什么 campaign、使用了什么渠道、取得了什么转化或增长结果。"
        },
        business_analyst: {
            name: "Business Analyst",
            keywords: "requirements gathering、process improvement、SQL、Excel、stakeholder communication、Agile、JIRA 或 business case",
            evidence: "说明你分析了什么业务问题、提出了什么方案、推动了什么流程改进或结果。"
        },
        consulting: {
            name: "Consulting",
            keywords: "client engagement、problem structuring、data analysis、presentation、Excel modeling、project management 或 cross-industry",
            evidence: "说明你参与了什么项目、解决了什么客户问题、产出了什么交付物或建议。"
        },
        operations: {
            name: "Operations",
            keywords: "process optimization、supply chain、logistics、KPI tracking、cross-functional coordination、lean 或 project management",
            evidence: "说明你优化了什么流程、管理了什么运营指标、取得了什么效率或成本改善。"
        },
        project_manager: {
            name: "Project Manager",
            keywords: "PMP、Agile、Scrum、stakeholder management、budget control、risk management、timeline 或 cross-functional coordination",
            evidence: "说明你管理了什么项目、规模多大、如何控制风险、最终交付了什么结果。"
        },
        sales: {
            name: "Sales",
            keywords: "quota attainment、pipeline management、CRM、Salesforce、account management、cold outreach、negotiation 或 revenue growth",
            evidence: "说明你负责了什么区域或客户、达成了什么销售目标、取得了什么业绩数据。"
        },
        ux_design: {
            name: "UX / Product Design",
            keywords: "Figma、user research、wireframing、prototyping、usability testing、design system 或 user journey mapping",
            evidence: "说明你设计了什么产品或功能、怎么做的用研、最终用户体验有什么改善。"
        },
        hr: {
            name: "HR / People Ops",
            keywords: "talent acquisition、onboarding、HRIS、employee relations、performance management、Workday 或 HR policy",
            evidence: "说明你负责了什么招聘或人事流程、管理了多少人或职位、取得了什么效率或满意度结果。"
        }
    };
    const rp = ROLE_PROFILES[roleFamily] || {
        name: targetRole !== "target role" ? targetRole : "目标岗位",
        keywords: "target role keywords、JD 核心职责、role-specific tools 和真实掌握的岗位技能",
        evidence: "说明你承担了什么职责、使用了什么工具、产出了什么结果，并尽量补充数量、频率或影响。"
    };
    const roleName = rp.name;
    const keywordText = rp.keywords;
    const evidenceText = rp.evidence;
    const isAccounting = [
        "accounting",
        "finance",
        "financial_analyst"
    ].includes(roleFamily);
    const templates = [
        {
            adviceId: "fb_target_role_positioning",
            title: `先让简历看起来像 ${roleName} 岗位`,
            mentorLens: `从内部筛选角度看，ATS 和 recruiter 第一眼会先判断：这份简历到底是不是在投 ${roleName}。如果 Summary 和前几条经历没有出现岗位原词，很容易被归到不相关方向。`,
            currentDiagnosis: isAccounting ? "你的简历目前有基础经历和教育背景，但和这份 JD 的岗位语言连接较弱。系统检测到 JD Match 和职位相关性都偏低，说明简历还没有稳定传达 Accounting 定位。" : `你的简历目前和目标 JD 的岗位语言匹配度较低，ATS 可能无法明确判断你在申请 ${roleName} 方向。`,
            action: isAccounting ? "先在 Summary 中自然加入 Accounting / Accountant 等目标岗位原词，并用一句话说明你与财务、报表、对账或审计支持相关的经验。" : `先在 Summary 中自然加入 ${targetRole === "unknown" ? roleName : targetRole} 等目标岗位原词，并用一句话说明你与该岗位核心职责相关的经验。`,
            reason: "这样做可以帮助 ATS 和 recruiter 更快识别你的投递方向，也能让后面的 Skills 和 Experience 看起来更有一致性。",
            evidence: [
                "JD Match 偏低",
                "F 职位相关性偏低",
                "缺少目标岗位原词"
            ],
            // backward compat
            get problemSummary () {
                return this.currentDiagnosis;
            },
            get actionSummary () {
                return this.action;
            },
            relatedProblemTags: [
                "missing_exact_job_title",
                "weak_summary_role_alignment",
                "weak_target_role_alignment"
            ],
            targetSection: "summary",
            priority: "high",
            source: "fallback"
        },
        {
            adviceId: "fb_jd_keyword_alignment",
            title: isAccounting ? "补上 JD 中真实掌握的 Accounting 关键词" : "补上 JD 中真实掌握的岗位关键词",
            mentorLens: "ATS 做关键词匹配时，会扫全文搜索 JD 中的核心技能词。如果 Skills 区块缺少这些词，系统会把你的匹配分打低，recruiter 在关键词筛选时也会跳过你。",
            currentDiagnosis: "当前简历缺少目标岗位会搜索的核心硬技能和工具词，导致 JD Match 分数偏低。",
            action: `把你真实掌握的 ${roleName} 相关关键词补进 Skills，例如 ${keywordText}。`,
            reason: "把真实掌握的关键词补进 Skills，不仅能直接提升 ATS 匹配分，也能让 recruiter 快速确认你的技能范围与 JD 相符。",
            evidence: [
                "JD Match 偏低",
                "D 关键词维度偏低",
                "Skills 缺少 JD 核心词"
            ],
            // backward compat
            get problemSummary () {
                return this.currentDiagnosis;
            },
            get actionSummary () {
                return this.action;
            },
            relatedProblemTags: [
                "low_jd_keyword_match",
                "missing_priority_keywords",
                "low_hard_skill_match"
            ],
            targetSection: "skills",
            priority: "high",
            source: "fallback"
        },
        {
            adviceId: "fb_experience_keyword_evidence",
            title: "把关键词写进经历证据",
            mentorLens: "即使 Skills 里有关键词，ATS 和 recruiter 还是会看 Experience 里有没有对应的证据。光靠 Skills 列词、缺乏经历支撑，很容易被认为是简历注水。",
            currentDiagnosis: "即使关键词出现在 Skills 区块，如果 Experience 中没有对应证据，ATS 和招聘方仍然难以判断你的真实匹配度。",
            action: `选择一段最相关经历，把 ${roleName} 关键词写进 bullet：${evidenceText}`,
            reason: "经历证据让关键词变得可信。把技能词嵌入到具体工作内容里，既提升 ATS 分，也让 recruiter 看到你真的做过相关工作。",
            evidence: [
                "Experience 缺少关键词证据",
                "关键词集中在 Skills 区块",
                "JD Match 偏低"
            ],
            // backward compat
            get problemSummary () {
                return this.currentDiagnosis;
            },
            get actionSummary () {
                return this.action;
            },
            relatedProblemTags: [
                "weak_experience_keyword_evidence",
                "keywords_only_in_skills",
                "resume_not_tailored_to_jd"
            ],
            targetSection: "experience",
            priority: "high",
            source: "fallback"
        }
    ];
    const selected = [];
    for (const template of templates){
        if (selected.length >= count) break;
        if (template.relatedProblemTags.some((tag)=>!usedTags.has(tag))) {
            selected.push(template);
            template.relatedProblemTags.forEach((tag)=>usedTags.add(tag));
        }
    }
    for (const template of templates){
        if (selected.length >= count) break;
        if (!selected.some((item)=>item.adviceId === template.adviceId)) selected.push(template);
    }
    return selected.slice(0, count);
}
function groupAdviceByMentor(candidates = []) {
    const buckets = new Map();
    for (const card of candidates){
        const mentorName = card.mentorName || "Y导师";
        const key = mentorName;
        if (!buckets.has(key)) {
            const company = inferCompanyFromMentor(card);
            buckets.set(key, {
                mentorId: `mentor_${buckets.size + 1}_${normalizeTerm(mentorName || "mentor")}`,
                mentorName,
                company,
                companyLogo: resolveCompanyLogo(company),
                mentorTitle: inferMentorTitle(card),
                careerPathDisplay: card.mentor_career_path_display || null,
                badges: [],
                cards: [],
                roleFamilies: new Set()
            });
        }
        const b = buckets.get(key);
        b.cards.push(card);
        splitCsv(card.roleFamily || card.role_family || "").filter(Boolean).forEach((rf)=>b.roleFamilies.add(rf));
    }
    return [
        ...buckets.values()
    ].map((bucket)=>{
        const sorted = bucket.cards.sort((a, b)=>(b.retrieval_score || 0) - (a.retrieval_score || 0));
        return {
            ...bucket,
            badges: buildMentorBadges(sorted),
            cards: sorted,
            roleFamilies: [
                ...bucket.roleFamilies
            ]
        };
    });
}
function inferCompanyFromMentor(card = {}) {
    // Direct from DB (segments.mentor_company populated via mentors join in migration)
    if (card.mentor_company) return card.mentor_company;
    // Final fallback
    return "Amazon";
}
function inferMentorTitle(card = {}) {
    // Prefer actual title from DB
    if (card.mentor_title) return card.mentor_title;
    // Intent-based fallback
    if (card.adviceIntent === "resume_jd_keyword_fix") return "ATS / JD 关键词策略师";
    if (card.adviceIntent === "resume_section_rewrite") return "简历内容优化师";
    if (card.adviceIntent === "resume_content_quality") return "经历成果表达师";
    if (card.adviceIntent === "job_search_strategy") return "求职策略顾问";
    if (card.adviceIntent === "resume_positioning") return "岗位定位顾问";
    return "简历策略师";
}
function buildMentorBadges(cards = []) {
    const cardArr = Array.isArray(cards) ? cards : [
        cards
    ];
    // Prefer career keywords pre-stored in DB
    const kwJson = cardArr.find((c)=>c.mentor_career_keywords)?.mentor_career_keywords;
    if (kwJson) {
        try {
            const kws = JSON.parse(kwJson);
            if (Array.isArray(kws) && kws.length) return kws.slice(0, 3);
        } catch (_) {}
    }
    // Fallback: use L1 topic categories from cards
    const topics = [
        ...new Set(cardArr.map((c)=>c.L1 || c.topic).filter(Boolean))
    ];
    if (topics.length) return topics.slice(0, 3);
    return [
        "简历优化",
        "ATS 策略"
    ];
}
function coverageForAdvice(item = {}) {
    return new Set(item.relatedProblemTags || []);
}
function calculateAdviceCoverage(adviceItems = [], problemTags = []) {
    const target = new Set(problemTags.map((item)=>item.tag || item).filter(Boolean));
    const covered = new Set();
    for (const item of adviceItems){
        for (const tag of item.relatedProblemTags || []){
            if (target.has(tag)) covered.add(tag);
        }
    }
    return covered;
}
function adviceSelectionScore(card, targetProblemTags, coveredTags, selectedCards = []) {
    const related = relatedTagsForCard(card, targetProblemTags);
    const uncovered = related.filter((tag)=>!coveredTags.has(tag));
    const severity = targetProblemTags.filter((item)=>uncovered.includes(item.tag)).reduce((sum, item)=>sum + severityWeight(item.severity), 0);
    const roleFitScore = Math.max(0, 1 - (card.roleMismatchPenalty || 0));
    const diversityBonus = selectedCards.some((item)=>item.topic === card.topic || item.adviceIntent === card.adviceIntent) ? 0 : 1;
    return 0.25 * (card.retrieval_score || 0) + 0.35 * Math.min(1, uncovered.length / 2) + 0.15 * Math.min(1, severity) + 0.10 * roleFitScore + 0.05 * 0.6 + 0.10 * diversityBonus;
}
function selectTopAdviceForMentor(mentorBucket, targetProblemTags, count, coveredTags = new Set(), internalAtsResult = {}) {
    const selected = [];
    const cards = [
        ...mentorBucket.cards || []
    ];
    const usedDiagnosisTags = new Set();
    while(selected.length < count && cards.length){
        cards.sort((a, b)=>adviceSelectionScore(b, targetProblemTags, coveredTags, selected) - adviceSelectionScore(a, targetProblemTags, coveredTags, selected));
        const card = cards.shift();
        const item = toAdviceItem(card, targetProblemTags, selected.length, true, internalAtsResult, usedDiagnosisTags);
        selected.push(item);
        item.relatedProblemTags.forEach((tag)=>coveredTags.add(tag));
    }
    if (selected.length < count) {
        selected.push(...fallbackAdviceItems(internalAtsResult, count - selected.length, coveredTags));
    }
    return selected.slice(0, count);
}
function normalizeFreeAdviceLanes(adviceItems = [], internalAtsResult = {}) {
    // Prefer high-quality DB items; only fill gaps with fallback (not replace DB with fallback)
    const dbItems = adviceItems.filter((item)=>item.source !== "fallback");
    if (dbItems.length >= 3) return dbItems.slice(0, 3);
    // Fill remaining slots with fallback without overriding existing DB items
    const usedTags = new Set(dbItems.flatMap((item)=>item.relatedProblemTags || []));
    const extras = fallbackAdviceItems(internalAtsResult, 3 - dbItems.length, usedTags);
    return [
        ...dbItems,
        ...extras
    ].slice(0, 3);
}
const BIG_TECH_COMPANIES = new Set([
    "Google",
    "Amazon",
    "Meta",
    "Microsoft",
    "Apple",
    "NVIDIA",
    "OpenAI",
    "ByteDance",
    "TikTok",
    "Uber",
    "Airbnb",
    "LinkedIn",
    "Spotify",
    "Robinhood",
    "Goldman Sachs",
    "JPMorgan",
    "JPMorgan Chase",
    "Morgan Stanley",
    "BlackRock",
    "McKinsey",
    "BCG",
    "Deloitte",
    "Accenture"
]);
function mentorMatchScore(bucket, targetProblemTags, targetRoleFamily = "") {
    const covered = new Set();
    let score = 0;
    for (const card of bucket.cards || []){
        score += card.retrieval_score || 0;
        relatedTagsForCard(card, targetProblemTags).forEach((tag)=>covered.add(tag));
    }
    const brandBonus = BIG_TECH_COMPANIES.has(bucket.company) ? 0.5 : 0;
    // +1 bonus if mentor's role_family overlaps with user's target role (or mentor has "universal" content)
    const bucketFamilies = bucket.roleFamilies || [];
    const normalized = normalizeTerm(targetRoleFamily || "");
    const roleFamilyBonus = bucketFamilies.includes("universal") || normalized && bucketFamilies.includes(normalized) ? 1.0 : 0;
    return score + covered.size * 0.35 + brandBonus + roleFamilyBonus;
}
function selectDiverseMentors(mentorBuckets, targetCount, targetProblemTags = [], targetRoleFamily = "") {
    const selected = [];
    const usedCompanies = new Set();
    const usedIntents = new Set();
    const sorted = [
        ...mentorBuckets
    ].sort((a, b)=>mentorMatchScore(b, targetProblemTags, targetRoleFamily) - mentorMatchScore(a, targetProblemTags, targetRoleFamily));
    // Pass 1: prefer unique company + unique primary intent
    for (const bucket of sorted){
        if (selected.length >= targetCount) break;
        const company = bucket.company || "unknown";
        const primaryIntent = bucket.cards[0]?.adviceIntent || "resume_ats";
        const companyConflict = usedCompanies.has(company) && company !== "Amazon";
        const intentConflict = usedIntents.has(primaryIntent) && selected.length < targetCount - 1;
        if (companyConflict || intentConflict) continue;
        selected.push(bucket);
        usedCompanies.add(company);
        usedIntents.add(primaryIntent);
    }
    // Pass 2: fill remaining slots ignoring company uniqueness, still avoid same intent
    for (const bucket of sorted){
        if (selected.length >= targetCount) break;
        if (selected.includes(bucket)) continue;
        const primaryIntent = bucket.cards[0]?.adviceIntent || "resume_ats";
        if (usedIntents.has(primaryIntent)) continue;
        selected.push(bucket);
        usedIntents.add(primaryIntent);
    }
    // Pass 3: fill any remaining with best-scoring buckets not yet selected
    for (const bucket of sorted){
        if (selected.length >= targetCount) break;
        if (!selected.includes(bucket)) selected.push(bucket);
    }
    return selected.slice(0, targetCount);
}
function mentorFromBucket(bucket, adviceItems, targetProblemTags, index) {
    const coveredTags = [
        ...calculateAdviceCoverage(adviceItems, targetProblemTags)
    ];
    return {
        mentorId: bucket.mentorId || `mentor_${index + 1}`,
        mentorName: bucket.mentorName || `${String.fromCharCode(89 - index)}导师`,
        company: bucket.company || "MentorX",
        companyLogo: bucket.companyLogo || null,
        mentorTitle: bucket.mentorTitle || "简历策略师",
        badges: bucket.badges || [
            "ATS 简历",
            "导师知识库"
        ],
        careerPathDisplay: bucket.careerPathDisplay || null,
        matchReason: buildMatchReason(coveredTags),
        matchedProblems: coveredTags,
        adviceItems
    };
}
function buildMatchReason(tags = []) {
    if (tags.some((tag)=>/keyword|hard_skill|priority/.test(tag))) return "这位导师最匹配你当前的 JD 关键词和岗位匹配问题。";
    if (tags.some((tag)=>/summary|title|role|position/.test(tag))) return "这位导师更擅长处理岗位定位和 Summary 表达问题。";
    if (tags.some((tag)=>/experience|evidence|measurable|result/.test(tag))) return "这位导师能帮助你把经历证据写得更像目标岗位。";
    return "这位导师的建议与你当前 ATS 简历问题高度相关。";
}
function fallbackMentor(index, internalAtsResult, coveredTags = new Set()) {
    const adviceItems = fallbackAdviceItems(internalAtsResult, 3, coveredTags);
    return mentorFromBucket({
        ...DEFAULT_FREE_MENTOR_PROFILE,
        mentorId: index === 0 ? DEFAULT_FREE_MENTOR_PROFILE.mentorId : `fallback_mentor_${index + 1}`,
        mentorName: index === 0 ? DEFAULT_FREE_MENTOR_PROFILE.mentorName : `${String.fromCharCode(89 - index)} 导师`,
        mentorTitle: [
            "ATS / JD 关键词策略师",
            "简历内容优化师",
            "岗位定位顾问",
            "经历成果表达师"
        ][index] || "简历策略师"
    }, adviceItems, problemTagsFromInternal(internalAtsResult), index);
}
function selectFreeMentorPlan(candidates, internalAtsResult) {
    const targetProblemTags = problemTagsFromInternal(internalAtsResult).slice(0, 6);
    const profile = internalAtsResult.profile || {};
    let roleSafeRejected = 0;
    const freeCandidates = candidates.filter((card)=>(card.unlockTier === "free" || card.safeToShowFree) && card.adviceIntent !== "application_timing" && ![
            "interview_prep",
            "behavioral_interview"
        ].includes(card.adviceScope)).filter((card)=>{
        const safe = isAdviceRoleSafe(card, internalAtsResult.jobTitle || profile.targetRole, profile.roleFamily);
        if (!safe) roleSafeRejected += 1;
        return safe;
    });
    const buckets = groupAdviceByMentor(freeCandidates);
    const roleFamily = profile.roleFamily || "";
    // Hard filter: only allow mentors whose role_family matches the target (or is universal/empty)
    const roleSafeBuckets = buckets.filter((b)=>isBucketRoleSafe(b, roleFamily));
    const candidateBuckets = roleSafeBuckets.length > 0 ? roleSafeBuckets : buckets;
    // For free plan: guarantee first mentor comes from a recognizable company when possible
    const sortedBuckets = [
        ...candidateBuckets
    ].sort((a, b)=>mentorMatchScore(b, targetProblemTags, roleFamily) - mentorMatchScore(a, targetProblemTags, roleFamily));
    const bigTechBucket = sortedBuckets.find((b)=>BIG_TECH_COMPANIES.has(b.company));
    const bucket = bigTechBucket || selectDiverseMentors(candidateBuckets, 1, targetProblemTags, roleFamily)[0];
    let plan;
    if (!bucket) {
        plan = fallbackMentor(0, internalAtsResult);
    } else {
        const coveredTags = new Set();
        const adviceItems = selectTopAdviceForMentor(bucket, targetProblemTags, 3, coveredTags, internalAtsResult);
        // Use real bucket mentor data; fall back only for fields not available in bucket
        const mergedBucket = {
            ...DEFAULT_FREE_MENTOR_PROFILE,
            ...bucket,
            company: bucket.company || DEFAULT_FREE_MENTOR_PROFILE.company,
            companyLogo: bucket.companyLogo || null,
            mentorTitle: bucket.mentorTitle || DEFAULT_FREE_MENTOR_PROFILE.mentorTitle,
            careerPathDisplay: bucket.careerPathDisplay || null
        };
        plan = mentorFromBucket(mergedBucket, normalizeFreeAdviceLanes(adviceItems, internalAtsResult), targetProblemTags, 0);
    }
    Object.defineProperty(plan, "debug", {
        enumerable: false,
        value: {
            roleSafeRejected,
            freeAdviceSources: (plan.adviceItems || []).map((item)=>item.source || "db")
        }
    });
    return plan;
}
function buildFreeMentorAdvicePlan({ candidates = [], internalAtsResult = {}, publicReport = null } = {}) {
    return selectFreeMentorPlan(candidates, internalAtsResult, publicReport);
}
function selectPremiumMentorPlan(candidates, internalAtsResult, freeMentorPlan = null) {
    const profile = internalAtsResult.profile || {};
    const targetProblemTags = problemTagsFromInternal(internalAtsResult);
    const roleFamily = profile.roleFamily || "";
    const buckets = groupAdviceByMentor(candidates.filter((card)=>![
            "interview_prep",
            "behavioral_interview"
        ].includes(card.adviceScope) && isAdviceRoleSafe(card, internalAtsResult.jobTitle || profile.targetRole, roleFamily)));
    // Hard filter: only allow mentors in the same role_family (or universal)
    const roleSafeBuckets = buckets.filter((b)=>isBucketRoleSafe(b, roleFamily));
    const candidateBuckets = roleSafeBuckets.length >= 4 ? roleSafeBuckets : roleSafeBuckets.length > 0 ? roleSafeBuckets : buckets;
    const selectedBuckets = selectDiverseMentors(candidateBuckets, 4, targetProblemTags, roleFamily);
    const coveredTags = new Set();
    const mentors = [];
    if (freeMentorPlan) {
        mentors.push(freeMentorPlan);
        freeMentorPlan.adviceItems.forEach((item)=>(item.relatedProblemTags || []).forEach((tag)=>coveredTags.add(tag)));
    }
    for (const bucket of selectedBuckets){
        if (mentors.length >= 4) break;
        if (mentors.some((mentor)=>mentor.mentorId === bucket.mentorId)) continue;
        const adviceItems = selectTopAdviceForMentor(bucket, targetProblemTags, 3, coveredTags, internalAtsResult);
        mentors.push(mentorFromBucket(bucket, adviceItems, targetProblemTags, mentors.length));
    }
    while(mentors.length < 4){
        mentors.push(fallbackMentor(mentors.length, internalAtsResult, coveredTags));
    }
    return mentors.slice(0, 4).map((mentor)=>({
            ...mentor,
            adviceItems: mentor.adviceItems.slice(0, 3)
        }));
}
function buildCoverageSummary(selectedAdviceItems, internalAtsResult) {
    const problems = problemTagsFromInternal(internalAtsResult);
    const target = problems.map((item)=>item.tag);
    const covered = [
        ...calculateAdviceCoverage(selectedAdviceItems, problems)
    ];
    const uncovered = target.filter((tag)=>!covered.includes(tag));
    return {
        totalProblemsDetected: target.length,
        problemsCovered: covered.length,
        coverageRatio: target.length ? Number((covered.length / target.length).toFixed(3)) : 1,
        coveredProblemTags: covered,
        uncoveredProblemTags: uncovered
    };
}
function buildLockedAdvicePreview(premiumMentorPlan = [], internalAtsResult = {}) {
    const totalMentorCount = 4;
    const totalAdviceCount = 12;
    const roleFamily = normalizeTerm(internalAtsResult.profile?.roleFamily || internalAtsResult.jobTitle || "");
    const topics = roleFamily === "accounting" || roleFamily === "finance" ? [
        "Accounting 关键词补充位置",
        "Summary 岗位定位强化",
        "Experience bullet 优化",
        "岗位匹配与投递策略"
    ] : roleFamily === "software_engineer" ? [
        "技术关键词补充位置",
        "Summary 工程定位强化",
        "Experience bullet 优化",
        "项目与系统设计表达"
    ] : [
        "关键词补充位置",
        "Summary 定位强化",
        "Experience bullet 优化",
        "岗位匹配策略"
    ];
    const lockedMentors = (premiumMentorPlan.slice(1, 4) || []).map((mentor)=>{
        // Derive generic topic labels without leaking specific advice titles
        const items = mentor.adviceItems || [];
        const previewTopics = [
            ...new Set(items.slice(0, 3).map((item)=>{
                const sec = item.targetSection || "";
                const tags = item.relatedProblemTags || [];
                if (/keyword|jd|ats/i.test(sec) || tags.some((t)=>/keyword|jd|hard_skill/.test(t))) return "关键词策略";
                if (/summary|headline/i.test(sec) || tags.some((t)=>/summary|title|role/.test(t))) return "Summary 定位";
                if (/experience|bullet/i.test(sec) || tags.some((t)=>/experience|evidence/.test(t))) return "经历描述优化";
                if (/skill/i.test(sec)) return "技能区块";
                if (/education/i.test(sec)) return "教育背景";
                return "岗位匹配策略";
            }))
        ].slice(0, 3);
        return {
            mentorId: mentor.mentorId,
            mentorName: mentor.mentorName,
            company: mentor.company,
            companyLogo: mentor.companyLogo || null,
            mentorTitle: mentor.mentorTitle,
            careerPathDisplay: mentor.careerPathDisplay || null,
            lockedAdviceCount: items.length,
            previewTopics
        };
    });
    return {
        lockedMentorCount: Math.max(0, totalMentorCount - 1),
        lockedAdviceCount: Math.max(0, totalAdviceCount - 3),
        totalMentorCount,
        totalAdviceCount,
        topics,
        lockedMentors,
        message: "解锁后查看 4 位导师的 12 条完整建议，覆盖你的主要 ATS 问题与分段修改路径。"
    };
}
/**
 * Build public-safe evidence chips for a single advice item.
 * Returns max 3 qualitative descriptors — no raw scores or internal metric values.
 *
 * @param {object} adviceItem  - The advice item (new schema)
 * @param {object|null} publicReport - The public ATS report (unused for now; reserved)
 * @param {object} internalAtsResult - Internal ATS result (used only for tag presence, not values)
 */ function buildAdviceEvidence(adviceItem, publicReport, internalAtsResult = {}) {
    // If the item already carries explicit evidence chips, honour them
    if (Array.isArray(adviceItem.evidence) && adviceItem.evidence.length) {
        return adviceItem.evidence.slice(0, 3);
    }
    const tags = adviceItem.relatedProblemTags || [];
    const chips = [];
    if (tags.some((t)=>/job_title|exact_title/.test(t))) chips.push("缺少目标岗位原词");
    if (tags.some((t)=>/jd_keyword|hard_skill|keyword_gap|priority_keyword/.test(t))) chips.push("JD Match 偏低");
    if (tags.some((t)=>/experience_keyword|skills_only|evidence/.test(t))) chips.push("Experience 缺少关键词证据");
    if (tags.some((t)=>/summary|role_alignment|target_role/.test(t))) chips.push("Summary 岗位定位不清晰");
    if (tags.some((t)=>/measurable|result|impact/.test(t))) chips.push("Bullet 量化结果不足");
    if (tags.some((t)=>/linkedin/.test(t))) chips.push("LinkedIn 链接缺失");
    if (tags.some((t)=>/portfolio/.test(t))) chips.push("Portfolio 链接缺失");
    return chips.slice(0, 3);
}
/** @deprecated Use buildAdviceEvidence instead */ function buildPublicSafeEvidence(item, atsResult = {}) {
    return buildAdviceEvidence(item, null, atsResult);
}
function formatPublicFreeMentorAdvice(freeMentorPlan, internalAtsResult = {}) {
    return {
        mentorId: freeMentorPlan.mentorId,
        mentorName: freeMentorPlan.mentorName,
        company: freeMentorPlan.company,
        companyLogo: freeMentorPlan.companyLogo || null,
        mentorTitle: freeMentorPlan.mentorTitle,
        careerPathDisplay: freeMentorPlan.careerPathDisplay || null,
        badges: freeMentorPlan.badges || [],
        matchReason: freeMentorPlan.matchReason,
        matchedProblems: freeMentorPlan.matchedProblems || [],
        adviceItems: (freeMentorPlan.adviceItems || []).slice(0, 3).map((item)=>{
            // Resolve canonical new-schema fields, supporting both native and adapted cards
            const currentDiagnosis = item.currentDiagnosis || item.problemSummary || "";
            const action = item.action || item.actionSummary || "";
            return {
                adviceId: item.adviceId,
                title: item.title,
                // ── New schema fields (PART 1 / PART 7 — all included in free tier) ──
                mentorLens: item.mentorLens || "",
                currentDiagnosis,
                action,
                reason: item.reason || "",
                evidence: buildAdviceEvidence(item, null, internalAtsResult),
                // ── Backward-compat aliases (PART 8) ──
                problemSummary: currentDiagnosis,
                actionSummary: action,
                targetSection: item.targetSection || "overall",
                relatedProblemTags: item.relatedProblemTags || [],
                priority: item.priority || "medium",
                // Rich mentor voice fields — same quality as paid, just no rewrite
                mentorInsight: item.mentorInsight || item.I_insight || "",
                example: item.example || item.E_example || "",
                hrPerspective: item.hrPerspective || item.HR_os || "",
                source: item.source || "db"
            };
        })
    };
}
function formatPremiumMentorReport(premiumMentorPlan, internalAtsResult) {
    const mentors = premiumMentorPlan.slice(0, 4).map((mentor)=>({
            ...mentor,
            adviceItems: (mentor.adviceItems || []).slice(0, 3).map((item)=>{
                const currentDiagnosis = item.currentDiagnosis || item.problemSummary || "";
                const action = item.action || item.actionSummary || "";
                return {
                    adviceId: item.adviceId,
                    title: item.title,
                    // New schema fields
                    mentorLens: item.mentorLens || "",
                    currentDiagnosis,
                    action,
                    reason: item.reason || "",
                    evidence: buildAdviceEvidence(item, null, internalAtsResult),
                    // Backward compat
                    problemSummary: currentDiagnosis,
                    actionSummary: action,
                    // Paid-only premium fields (PART 7)
                    mentorInsight: item.mentorInsight || "",
                    example: item.example || "",
                    hrPerspective: item.hrPerspective || "",
                    targetSection: item.targetSection || "overall",
                    relatedProblemTags: item.relatedProblemTags || [],
                    priority: item.priority || "medium",
                    source: item.source
                };
            })
        }));
    const allAdviceItems = mentors.flatMap((mentor)=>mentor.adviceItems);
    return {
        mentors,
        coverageSummary: buildCoverageSummary(allAdviceItems, internalAtsResult)
    };
}
module.exports = {
    FALLBACK_FREE_ADVICE,
    ACCOUNTING_FALLBACK_FREE_ADVICE,
    splitCsv,
    overlapScore,
    includesAny,
    normalizeTerm,
    inferRoleFamilyFromJobTitle,
    inferAdviceScope,
    inferAdviceIntent,
    isEligibleForAtsResumeReport,
    isAdviceRoleSafe,
    hasConflictingRoleExamples,
    calculateRoleMismatchPenalty,
    calculateRetrievalScore,
    buildMatchedReasons,
    retrieveStrictCandidates,
    retrieveFallbackCandidates,
    retrieveMentorAdvice,
    selectFreeAdvice,
    selectPaidAdvice,
    cleanAndTruncate,
    groupAdviceByMentor,
    buildFreeMentorAdvicePlan,
    selectFreeMentorPlan,
    selectPremiumMentorPlan,
    calculateAdviceCoverage,
    selectDiverseMentors,
    selectTopAdviceForMentor,
    buildCoverageSummary,
    buildLockedAdvicePreview,
    buildAdviceEvidence,
    buildPublicSafeEvidence,
    formatPublicFreeMentorAdvice,
    formatPremiumMentorReport,
    formatAdviceCard,
    formatAdviceCardForPublic,
    truncateAtSentence
};
}),
"[project]/file-parser.js [app-route] (ecmascript)", ((__turbopack_context__, module, exports) => {

const pdf = __turbopack_context__.r("[externals]/pdf-parse [external] (pdf-parse, cjs, [project]/node_modules/pdf-parse)");
const mammoth = __turbopack_context__.r("[externals]/mammoth [external] (mammoth, cjs, [project]/node_modules/mammoth)");
/**
 * 解析 PDF 文件，提取文本
 * @param {Buffer} fileBuffer - PDF 文件内容
 * @returns {Promise<string>} 提取的文本
 */ async function parsePDF(fileBuffer) {
    try {
        console.log("[PDF] 开始解析...");
        const data = await pdf(fileBuffer);
        const text = data.text;
        if (!text || text.trim().length === 0) {
            throw new Error("PDF 中未找到文本内容（可能是扫描版 PDF）");
        }
        console.log(`[PDF] 解析完成，提取 ${text.length} 字符`);
        return text;
    } catch (error) {
        console.error("[PDF] 解析失败:", error.message);
        throw new Error(`PDF 解析失败: ${error.message}`);
    }
}
/**
 * 解析 DOCX 文件，提取文本
 * @param {Buffer} fileBuffer - DOCX 文件内容
 * @returns {Promise<string>} 提取的文本
 */ async function parseDocx(fileBuffer) {
    try {
        console.log("[DOCX] 开始解析...");
        const result = await mammoth.extractRawText({
            buffer: fileBuffer
        });
        const text = result.value;
        if (!text || text.trim().length === 0) {
            throw new Error("DOCX 中未找到文本内容");
        }
        console.log(`[DOCX] 解析完成，提取 ${text.length} 字符`);
        return text;
    } catch (error) {
        console.error("[DOCX] 解析失败:", error.message);
        throw new Error(`Word 文件解析失败: ${error.message}`);
    }
}
module.exports = {
    parsePDF,
    parseDocx
};
}),
"[project]/app/lib/atsHelpers.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildAtsReportPayload",
    ()=>buildAtsReportPayload,
    "logPublicAtsResponseForTesting",
    ()=>logPublicAtsResponseForTesting,
    "resolveResumeText",
    ()=>resolveResumeText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ats$2f$ats$2d$scorer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ats/ats-scorer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ats$2f$report$2d$formatter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ats/report-formatter.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$mentorAdviceRetrieval$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/services/mentorAdviceRetrieval.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$file$2d$parser$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/file-parser.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$database$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/database.js [app-route] (ecmascript)");
;
;
;
;
;
async function resolveResumeText(file, bodyResumeText) {
    if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = file.name.toLowerCase().split('.').pop();
        if (ext === 'pdf') return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$file$2d$parser$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parsePDF"])(buffer);
        if (ext === 'docx') return await (0, __TURBOPACK__imported__module__$5b$project$5d2f$file$2d$parser$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["parseDocx"])(buffer);
        if (ext === 'txt') return buffer.toString('utf-8');
        throw new Error('不支援的檔案格式：' + ext);
    }
    if (bodyResumeText) return bodyResumeText;
    throw new Error('請提供 resumeText 或上傳 file');
}
function logRetrievalDebug({ reportContext, mentorCandidateCount, strictCandidateCount, fallbackCandidateCount, selectedFreeAdviceId, paidAdviceCount, roleMismatchPenalty, selectedScope, rawRows, eligibleRows, excludedInterviewAdvice }) {
    if (process.env.LOG_ATS_RETRIEVAL_DEBUG === 'false') return;
    console.log('[Advice Retrieval]', JSON.stringify({
        reportContext,
        rawRows,
        eligibleRows,
        candidates: mentorCandidateCount,
        strictCandidates: strictCandidateCount,
        fallbackCandidates: fallbackCandidateCount,
        selectedFreeAdvice: selectedFreeAdviceId,
        selectedScope,
        excludedInterviewAdvice,
        paidAdvice: paidAdviceCount,
        roleMismatchPenalty
    }));
}
function logAdvicePlan(freeMentorPlan, premiumMentorPlan = [], coverageSummary = {}) {
    if (process.env.LOG_ATS_RETRIEVAL_DEBUG === 'false') return;
    const allAdviceCount = premiumMentorPlan.reduce((sum, mentor)=>sum + (mentor.adviceItems?.length || 0), 0);
    const freeAdviceSources = (freeMentorPlan?.adviceItems || []).map((item)=>item.source || 'db');
    console.log('[Advice Plan]', JSON.stringify({
        freeMentor: freeMentorPlan?.mentorId || null,
        freeAdviceCount: freeMentorPlan?.adviceItems?.length || 0,
        freeAdviceSources,
        roleSafeRejected: freeMentorPlan?.debug?.roleSafeRejected || 0,
        premiumMentors: premiumMentorPlan.length,
        premiumAdviceCount: allAdviceCount,
        lockedAdviceCount: Math.max(0, allAdviceCount - (freeMentorPlan?.adviceItems?.length || 0)),
        coverageRatio: coverageSummary.coverageRatio ?? 0,
        coveredProblemTags: coverageSummary.coveredProblemTags || [],
        uncoveredProblemTags: coverageSummary.uncoveredProblemTags || []
    }));
}
function logPublicAtsResponseForTesting(label, payload) {
    if (process.env.LOG_ATS_PUBLIC_RESPONSE === 'false') return;
    const loggedPayload = {
        ...payload,
        reportAccessToken: payload.reportAccessToken ? '[REDACTED]' : payload.reportAccessToken
    };
    console.log(`\n[ATS Public Response][${label}]`);
    console.log(JSON.stringify(loggedPayload, null, 2));
    console.log('[/ATS Public Response]\n');
}
async function buildAtsReportPayload(rawScoreResult, input, userId = null) {
    const internalAtsResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ats$2f$report$2d$formatter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatInternalAtsResult"])(rawScoreResult, input);
    const retrievalQuery = internalAtsResult.retrievalQuery;
    const mentorCandidates = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$mentorAdviceRetrieval$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["retrieveMentorAdvice"])(retrievalQuery);
    const freeMentorPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$mentorAdviceRetrieval$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["selectFreeMentorPlan"])(mentorCandidates, internalAtsResult);
    const premiumMentorPlan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$mentorAdviceRetrieval$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["selectPremiumMentorPlan"])(mentorCandidates, internalAtsResult, freeMentorPlan);
    const freeAdvice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$mentorAdviceRetrieval$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatPublicFreeMentorAdvice"])(freeMentorPlan, internalAtsResult);
    const paidAdvice = premiumMentorPlan.slice(1);
    const premiumMentorReport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$mentorAdviceRetrieval$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatPremiumMentorReport"])(premiumMentorPlan, internalAtsResult);
    logRetrievalDebug({
        reportContext: input?.jobTitle || rawScoreResult.jobTitle || 'unknown',
        mentorCandidateCount: mentorCandidates.length,
        strictCandidateCount: mentorCandidates.debug?.strictCandidates ?? 0,
        fallbackCandidateCount: mentorCandidates.debug?.fallbackCandidates ?? 0,
        selectedFreeAdviceId: freeAdvice?.mentorId || null,
        paidAdviceCount: paidAdvice.reduce((sum, mentor)=>sum + (mentor.adviceItems?.length || 0), 0),
        roleMismatchPenalty: mentorCandidates.debug?.maxRoleMismatchPenalty ?? 0,
        selectedScope: mentorCandidates.debug?.selectedScope || 'mentor_plan',
        rawRows: mentorCandidates.debug?.rawRows ?? 0,
        eligibleRows: mentorCandidates.debug?.eligibleRows ?? 0,
        excludedInterviewAdvice: mentorCandidates.debug?.excludedInterviewAdvice ?? 0
    });
    const lockedPreview = (0, __TURBOPACK__imported__module__$5b$project$5d2f$services$2f$mentorAdviceRetrieval$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildLockedAdvicePreview"])(premiumMentorPlan, internalAtsResult);
    const publicReport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ats$2f$report$2d$formatter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatPublicFreeReport"])(internalAtsResult, freeAdvice, lockedPreview);
    const premiumReport = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ats$2f$report$2d$formatter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["formatPremiumUnlockedReport"])(internalAtsResult, premiumMentorReport);
    logAdvicePlan(freeMentorPlan, premiumMentorPlan, premiumReport.coverageSummary);
    const reportId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ats$2f$report$2d$formatter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createReportId"])();
    const reportAccessToken = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ats$2f$report$2d$formatter$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createReportAccessToken"])();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();
    await __TURBOPACK__imported__module__$5b$project$5d2f$database$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].saveAtsReport({
        reportId,
        reportAccessToken,
        expiresAt,
        jobTitle: internalAtsResult.jobTitle,
        hasJD: internalAtsResult.hasJD,
        total: internalAtsResult.total,
        risk: internalAtsResult.risk,
        publicReport,
        internalAtsResult,
        retrievalQuery,
        mentorCandidates,
        freeAdvice: freeMentorPlan,
        paidAdvice,
        premiumReport,
        paymentStatus: 'unpaid',
        userId
    });
    return {
        reportId,
        reportAccessToken,
        publicReport,
        internalAtsResult,
        mentorCandidates,
        freeAdvice: freeMentorPlan,
        paidAdvice,
        premiumReport
    };
}
}),
"[project]/app/api/v1/score/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$atsHelpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/atsHelpers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ats$2f$ats$2d$scorer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/ats/ats-scorer.js [app-route] (ecmascript)");
;
;
async function POST(request) {
    try {
        const contentType = request.headers.get('content-type') || '';
        let file = null, jobTitle = '', jdText = '', resumeText = '';
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();
            file = formData.get('file');
            jobTitle = formData.get('jobTitle') || '';
            jdText = formData.get('jdText') || '';
            resumeText = formData.get('resumeText') || '';
        } else {
            const body = await request.json();
            jobTitle = body.jobTitle || '';
            jdText = body.jdText || '';
            resumeText = body.resumeText || '';
        }
        const userId = request.headers.get('x-user-id') || null;
        if (!jobTitle && !jdText) {
            return Response.json({
                success: false,
                error: 'jobTitle or jdText is required'
            }, {
                status: 400
            });
        }
        const resolvedText = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$atsHelpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["resolveResumeText"])(file, resumeText);
        const rawScoreResult = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$ats$2f$ats$2d$scorer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["scoreResumeATS"])(resolvedText, jobTitle, jdText);
        const report = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$atsHelpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["buildAtsReportPayload"])(rawScoreResult, {
            resumeText: resolvedText,
            jobTitle,
            jdText
        }, userId);
        const payload = {
            success: true,
            reportId: report.reportId,
            reportAccessToken: report.reportAccessToken,
            publicReport: report.publicReport,
            premiumMentors: report.premiumReport?.mentors || null,
            timestamp: new Date().toISOString()
        };
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$atsHelpers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["logPublicAtsResponseForTesting"])('score', payload);
        return Response.json(payload);
    } catch (err) {
        console.error('[ATS-Report] Error:', err.message);
        return Response.json({
            success: false,
            error: err.message
        }, {
            status: 400
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__003fkyw._.js.map