"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const WRITE = process.argv.includes("--write");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : 0;

const DOMAIN_PATTERNS = [
  /\b(hardware|electrical|circuit|analog|pcb|fpga|rtl|verilog|vlsi|semiconductor|embedded|firmware|tape out|bring up|adc|bom)\b/i,
  /\b(medical device|medical equipment|biomedical device|clinical trial|patient|medical chart|medical record|hospital|pharma|biotech|cro)\b/i,
  /\b(da|data analyst|machine learning|deep learning|tensorflow|pytorch|llm|rag|nlp|computer vision|tableau|power bi|sql|pandas)\b/i,
  /\b(quant|trading|risk consulting|rcsa|valuation|dcf|fp&a|fpa|bloomberg|pitchbook|series 7|series 66)\b/i,
  /\b(game design|game mechanics|level design|player experience|ux|ui|figma|portfolio|storyboard|animation|demo reel)\b/i,
  /硬件|硬體|电路|電路|医疗器械|醫療器械|临床|臨床|患者|病患|数据分析|資料分析|机器学习|機器學習|量化|投研|风控|風控|作品集|游戏|遊戲/i,
];

const CASE_PATTERNS = [
  /\b(Alpha Research|VADER|MACD|COVID patient|Superseed|Broadcom|Doordash|Instacart|Google|Meta|IBM|Moot Court|Legal Clinic)\b/i,
  /\b[A-Z][A-Za-z0-9&/.-]{2,}\s+(?:project|pipeline|internship|case|model|dashboard|experience)\b/,
  /你这(?:段|条|个)|你这里|这段(?:实习|经历|项目)|这条(?:经历|项目|bullet)|医院实习|咖啡因项目|学校.*项目|课程项目|某学校|当时|原简历/i,
];

function compact(value, max = 220) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, max);
}

const SAFE_CASE_PATTERNS = [
  /\b(Alpha Research|VADER|MACD|COVID patient|Superseed|Broadcom|Doordash|Instacart|Google|Meta|IBM|Moot Court|Legal Clinic)\b/i,
  /\b[A-Z][A-Za-z0-9&/.-]{2,}\s+(?:project|pipeline|internship|case|model|dashboard|experience)\b/,
  /\u4f60\u8fd9(?:\u6bb5|\u6761|\u4e2a)|\u4f60\u8fd9\u91cc|\u8fd9\u6bb5(?:\u5b9e\u4e60|\u9879\u76ee)|\u8fd9\u6761(?:\u9879\u76ee|bullet)|\u533b\u9662\u5b9e\u4e60|\u5496\u5561\u56e0\u9879\u76ee|\u5b66\u6821.*\u9879\u76ee|\u8bfe\u7a0b\u9879\u76ee|\u67d0\u5b66\u6821|\u5f53\u65f6|\u539f\u7b80\u5386/i,
];

function hasAny(patterns, text) {
  return patterns.some((pattern) => pattern.test(String(text || "")));
}

function classifyText(text = "") {
  const value = String(text || "").trim();
  const hasDomain = hasAny(DOMAIN_PATTERNS, value);
  const hasCase = hasAny(SAFE_CASE_PATTERNS, value);
  if (!value) return "empty";
  if (hasCase) return "raw_case_leak";
  if (hasDomain) return "raw_domain_ok";
  return "raw_generic_ok";
}

function sourceStatus(row, role = "mentor") {
  const raw = role === "mentor" ? row.humanized_mentor_insight_raw : row.humanized_hr_perspective_raw;
  if (raw) return "raw_present";
  const legacy = role === "mentor" ? row.humanized_mentor_insight : row.humanized_hr_perspective;
  const source = role === "mentor" ? row.I_insight : row.HR_os;
  if (legacy && hasAny(SAFE_CASE_PATTERNS, legacy)) return "expected_blank_due_case_leak";
  if (source && hasAny(SAFE_CASE_PATTERNS, source)) return "expected_blank_due_case_leak";
  if (!legacy && !source) return "source_missing";
  return "needs_raw_generation";
}

function rowIssues(row) {
  const mentorClass = classifyText(row.humanized_mentor_insight_raw);
  const hrClass = classifyText(row.humanized_hr_perspective_raw);
  const mentorRawStatus = sourceStatus(row, "mentor");
  const hrRawStatus = sourceStatus(row, "hr");
  const issues = [];
  if (mentorClass === "raw_case_leak") issues.push("mentor_raw_case_leak");
  if (hrClass === "raw_case_leak") issues.push("hr_raw_case_leak");
  if (mentorRawStatus !== "raw_present") issues.push(`mentor_${mentorRawStatus}`);
  if (hrRawStatus !== "raw_present") issues.push(`hr_${hrRawStatus}`);
  const hasDomainRaw = [row.humanized_mentor_insight_raw, row.humanized_hr_perspective_raw].some((text) => hasAny(DOMAIN_PATTERNS, text));
  const roleScope = [
    row.activation_role_family,
    row.activation_keywords,
    row.role_family,
    row.target_roles,
  ].filter(Boolean).join(" ");
  const hasConcreteRoleScope = roleScope && !/^universal(?:,\s*universal)*$/i.test(roleScope.trim());
  if (hasDomainRaw && !hasConcreteRoleScope && row.display_action_mode === "raw") issues.push("missing_raw_activation");
  const generalized = [row.humanized_mentor_insight_generalized, row.humanized_hr_perspective_generalized].filter(Boolean).join(" ");
  if (generalized && hasAny(DOMAIN_PATTERNS, generalized)) issues.push("generalized_domain_leak");
  if (generalized && hasAny(SAFE_CASE_PATTERNS, generalized)) issues.push("generalized_case_leak");
  if (row.display_action_mode !== "raw" && (!row.humanized_mentor_insight_generalized || !row.humanized_hr_perspective_generalized)) {
    issues.push("missing_generalized_perspective");
  }
  return { mentorClass, hrClass, mentorRawStatus, hrRawStatus, issues };
}

async function main() {
  const pool = db.getPool();
  const limitSql = LIMIT > 0 ? `LIMIT ${LIMIT}` : "";
  const { rows } = await pool.query(`
    SELECT id, chunk_id, role_family, target_roles, activation_role_family, activation_keywords,
           display_action_mode, action_specificity, canonical_action_family, action_depth,
           "A_action", generalized_action, "I_insight", "HR_os",
           to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
           to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
           to_jsonb(segments)->>'humanized_mentor_insight_raw' AS humanized_mentor_insight_raw,
           to_jsonb(segments)->>'humanized_hr_perspective_raw' AS humanized_hr_perspective_raw,
           to_jsonb(segments)->>'humanized_mentor_insight_generalized' AS humanized_mentor_insight_generalized,
           to_jsonb(segments)->>'humanized_hr_perspective_generalized' AS humanized_hr_perspective_generalized,
           to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status
      FROM segments
     WHERE retrieval_scope = 'resume_edit'
       AND COALESCE(action_review_status, '') != 'exclude'
     ORDER BY id
     ${limitSql}
  `);

  const summary = {};
  const samples = {};
  const findings = [];
  for (const row of rows) {
    const result = rowIssues(row);
    for (const key of [result.mentorClass, result.hrClass, ...result.issues]) {
      summary[key] = (summary[key] || 0) + 1;
      samples[key] = samples[key] || [];
      if (samples[key].length < 12) {
        samples[key].push({
          id: row.id,
          mode: row.display_action_mode,
          role: row.activation_role_family || row.role_family || "",
          mentor: compact(row.humanized_mentor_insight),
          hr: compact(row.humanized_hr_perspective || row.HR_os),
          mentorRaw: compact(row.humanized_mentor_insight_raw),
          hrRaw: compact(row.humanized_hr_perspective_raw),
          mentorGeneralized: compact(row.humanized_mentor_insight_generalized),
          hrGeneralized: compact(row.humanized_hr_perspective_generalized),
        });
      }
    }
    if (result.issues.length) findings.push({ id: row.id, ...result, row });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    scanned: rows.length,
    summary,
    samples,
    findingCount: findings.length,
    findings: findings.slice(0, 500),
  };
  console.log(JSON.stringify({
    scanned: report.scanned,
    summary,
    findingCount: findings.length,
    sampleIds: findings.slice(0, 30).map((item) => item.id),
  }, null, 2));

  if (WRITE) {
    const outDir = path.join(process.cwd(), "data", "audit", "perspective_split");
    fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, `audit_${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2), "utf8");
    console.log(`outPath=${outPath}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
