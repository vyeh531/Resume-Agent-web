"use strict";

const fs = require("fs");
const path = require("path");

const auditArg = process.argv.find((arg) => arg.startsWith("--audit="));
const batchLabel = process.argv.find((arg) => arg.startsWith("--batch="))?.split("=")[1] || "batch_01";
const limit = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 80);
const offset = Number(process.argv.find((arg) => arg.startsWith("--offset="))?.split("=")[1] || 0);

if (!auditArg) {
  console.error("Usage: node scripts/review_badraw_terms_batch.js --audit=data/audit/governance_badraw_*.json [--batch=batch_01] [--offset=0] [--limit=80]");
  process.exit(1);
}

const auditPath = path.resolve(process.cwd(), auditArg.split("=").slice(1).join("="));
const audit = JSON.parse(fs.readFileSync(auditPath, "utf8"));
const sourceRows = (audit.badRaw || []).slice(offset, offset + limit);
const outPath = path.join(
  process.cwd(),
  "data/audit/segments_action_review_batches",
  `reviewed_badraw_terms_${batchLabel}_2026-06-05T03-58-04-041Z.json`
);

function textOf(row) {
  return [
    row.A_action,
    row.action_summary,
    row.P_mentor,
    row.I_insight,
    row.HR_os,
    row.topic,
    row.role_family,
  ].filter(Boolean).join(" ");
}

function familyFor(row) {
  const text = textOf(row).toLowerCase();
  if (/green card|h1b|opt|stem opt|cpt|ead|f-?1|sponsor|sponsorship|work authorization|authorized to work|visa/.test(text)) return "overall_positioning";
  if (/skill|skills|sql|python|excel|tableau|powerbi|aws|gcp|llm|ai|ml|model|technical|技术技能|技能/.test(text)) return "skills_section";
  if (/summary|objective|定位|目标岗位|方向|投递|career|求职策略|职业规划/.test(text)) return "overall_positioning";
  if (/format|header|linkedin|link|简历头部|联系方式/.test(text)) return "profile_links";
  if (/course|课程|certificate|training|kaggle|github/.test(text)) return "education_signal";
  if (/keyword|jd|ats|关键词|机筛/.test(text)) return "jd_keyword_alignment";
  return "experience_evidence";
}

function depthFor(row, family) {
  const text = textOf(row).toLowerCase();
  if (/投递|方向|定位|选择|评估|判断/.test(text)) return "diagnose";
  if (/header|link|投递|申请|面试介绍|介绍项目/.test(text)) return "delivery";
  if (/section|模块|板块|结构|合并|拆分|顺序/.test(text)) return "structure";
  if (/skill|skills|复习|学习|补充|掌握|证据|证明|量化|结果|impact|metric/.test(text)) return "proof";
  return family === "overall_positioning" ? "diagnose" : "rewrite";
}

function roleFamilyFor(row) {
  const text = textOf(row).toLowerCase();
  const families = [];
  if (/marketing|campaign|social media|consumer|customer/.test(text)) families.push("marketing");
  if (/data analyst|data analysis|sql|tableau|powerbi|analytics|etl|data engineer/.test(text)) families.push("data_analytics");
  if (/software|sde|backend|frontend|api|aws|lambda|java|python/.test(text)) families.push("software_engineer");
  if (/ai|machine learning|ml|llm|rag|kaggle|model|deepseek|vader|macd|alpha research/.test(text)) families.push("machine_learning");
  if (/finance|financial|bank|wealth|ib|m&a|valuation|risk|quant|trading|cfa|mfe/.test(text)) families.push("finance");
  if (/accounting|audit|transfer pricing/.test(text)) families.push("accounting");
  return [...new Set(families)].join(",");
}

function activationKeywordsFor(row) {
  const text = textOf(row);
  const patterns = [
    /Risk Consulting|RCSA|control framework|regulatory compliance|operational risk/gi,
    /Financial Advisor|financial advisory|corporate finance|valuation|M&A|private wealth management/gi,
    /Alpha Research|Alpha research|VADER|MACD|trading book|limits monitoring|Risk Quant|Quantitative Risk|MFE/gi,
    /Kaggle|GitHub|LLM|DeepSeek|OpenAI|AWS|Lambda|SQL|Python|Tableau|Power BI/gi,
    /marketing|campaign|customer|consumer|social media|competitive analysis/gi,
  ];
  const found = [];
  for (const pattern of patterns) {
    for (const match of text.matchAll(pattern)) found.push(match[0]);
  }
  return [...new Set(found)].slice(0, 12).join(",");
}

function isIdentityOrVisa(row) {
  const text = textOf(row);
  if (/sponsor(?:ed)?\s+brand|(?:partner|brand|sports?|outreach)[\s/,-]*sponsorship|sponsorship[\s/,-]*(?:rights|activation|service|package|服务|合作|拓展)|sports?\s+sponsorship/i.test(text)) {
    return false;
  }
  if (/Sponsor问题|sponsor问题|不提供Sponsor|提供Sponsor|需要Sponsor|JD.*Sponsor|Sponsor.*JD/i.test(text)) {
    return true;
  }
  if (/SQL|Python|Tableau|Power BI|Excel|技能|skill/i.test(row.action || row.A_action || row.action_summary || "")) {
    return /green card|permanent resident|h1b|opt|stem opt|cpt|ead|f-?1|work authorization|authorized to work|工签|绿卡|工作身份|身份合规|绿卡身份/i.test(text);
  }
  return /green card|permanent resident|h1b|opt|stem opt|cpt|ead|f-?1|work authorization|authorized to work|visa|no sponsorship|need(?:s|ed)? sponsorship|requires? sponsorship|签证|工签|绿卡|工作身份|身份合规|绿卡身份/i.test(text);
}

function generalizedActionFor(row, family) {
  const text = textOf(row).toLowerCase();
  if (/无法支持背调|背调|self-employed|凭空捏造|捏造|擦边球/.test(text)) {
    return "如果某段经历无法背调或容易被误解，不要放大成雇佣经历或虚构职责；改用真实可核验的项目、课程或作品表述，并写清任务、方法和产出。";
  }
  if (/kaggle|github|项目数量|缺乏.*项目|补充.*项目|自建项目/.test(text)) {
    return "如果目标岗位缺少项目证据，可以补一个真实可解释的项目或作品；写进简历时要说明数据来源、方法、交付物和结果，不要把练习项目包装成真实工作经历。";
  }
  if (/skill|skills|sql|python|excel|tableau|powerbi|aws|gcp|llm|ai|ml|model|技术技能|技能/.test(text)) {
    return "如果目标岗位缺少关键技能信号，先补齐真实掌握的工具和方法，再把它们放进 Skills 与对应项目证据里；不要为了匹配 JD 写入无法解释的技能。";
  }
  if (/投递|方向|定位|目标岗位|career|职业|求职策略|转行/.test(text)) {
    return "先根据目标岗位重新确认简历主线：保留最能支撑该方向的经历，弱化干扰定位的内容，并把可迁移能力改写成岗位能理解的证据。";
  }
  if (/marketing|campaign|customer|consumer|social media|用户|市场/.test(text)) {
    return "把真实经历中与用户、市场、渠道或协作相关的部分提炼出来，按「任务背景 + 方法 + 产出 + 业务影响」重写，不要把没有做过的职责写成事实。";
  }
  if (/finance|financial|bank|wealth|ib|valuation|risk|quant|trading|cfa|mfe/.test(text)) {
    return "如果目标岗位偏金融或风险方向，先确认细分岗位需要的分析、建模、报告或客户场景，再只保留你能用真实经历支撑的关键词和成果。";
  }
  if (family === "profile_links") {
    return "检查简历头部和链接信息，只保留真实、稳定、可验证且与求职相关的内容，避免放入可能引发误读或不必要筛选风险的信息。";
  }
  return "把这段经历改写成更可验证的简历证据：说明真实任务、使用的方法或工具、你的具体贡献，以及能支撑目标岗位的结果。";
}

const reviews = sourceRows.map((row) => {
  const family = familyFor(row);
  const exclude = isIdentityOrVisa(row);
  const proposed = exclude
    ? {
        action_specificity: "case_specific",
        display_action_mode: "exclude",
        generalized_action: "",
        activation_role_family: "",
        activation_keywords: "",
        grounding_terms: activationKeywordsFor(row),
        canonical_action_family: family,
        action_depth: "diagnose",
        action_review_status: "approved",
      }
    : {
        action_specificity: "role_specific",
        display_action_mode: "generalized",
        generalized_action: generalizedActionFor(row, family),
        activation_role_family: roleFamilyFor(row),
        activation_keywords: activationKeywordsFor(row),
        grounding_terms: "",
        canonical_action_family: family,
        action_depth: depthFor(row, family),
        action_review_status: "approved",
      };
  proposed.review_reason = `badraw_terms_${batchLabel}: broad raw-risk cleanup; keep useful advice generalized, exclude identity/visa/work-authorization content.`;
  return {
    id: row.id,
    proposed,
    review_decision: {
      reviewer: "chat_context",
      decision: `approved_${proposed.display_action_mode}`,
      notes: "Generated from bad-raw audit. This keeps career/project/skill-gap advice reusable while preventing prior-student raw details or identity/visa advice from surfacing.",
    },
  };
});

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(reviews, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  output: outPath,
  rows: reviews.length,
  excluded: reviews.filter((row) => row.proposed.display_action_mode === "exclude").map((row) => row.id),
  generalized: reviews.filter((row) => row.proposed.display_action_mode === "generalized").length,
}, null, 2));
