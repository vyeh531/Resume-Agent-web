"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");
const COMMIT_PER_CHUNK = process.argv.includes("--commit-per-chunk");
const LIMIT_ARG = process.argv.find((arg) => arg.startsWith("--limit="));
const LIMIT = LIMIT_ARG ? Number(LIMIT_ARG.split("=")[1]) : 0;
const OFFSET_ARG = process.argv.find((arg) => arg.startsWith("--offset="));
const OFFSET = OFFSET_ARG ? Number(OFFSET_ARG.split("=")[1]) : 0;
const CHUNK_ARG = process.argv.find((arg) => arg.startsWith("--chunk-size="));
const CHUNK_SIZE = CHUNK_ARG ? Number(CHUNK_ARG.split("=")[1]) : 100;
const IDS_FILE_ARG = process.argv.find((arg) => arg.startsWith("--ids-file="));
const IDS_FILE = IDS_FILE_ARG ? IDS_FILE_ARG.slice("--ids-file=".length) : "";

const CASE_PATTERNS = [
  /\b(Alpha Research|VADER|MACD|COVID patient|Superseed|Broadcom|Doordash|Instacart|Google|Meta|IBM|Moot Court|Legal Clinic)\b/i,
  /\b[A-Z][A-Za-z0-9&/.-]{2,}\s+(?:project|pipeline|internship|case|model|dashboard|experience)\b/,
  /你这(?:段|条|个)|你这里|这段(?:实习|经历|项目)|这条(?:经历|项目|bullet)|医院实习|咖啡因项目|学校.*项目|课程项目|某学校|当时|原简历/i,
];

function compact(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

const SAFE_CASE_PATTERNS = [
  /\b(Alpha Research|VADER|MACD|COVID patient|Superseed|Broadcom|Doordash|Instacart|Google|Meta|IBM|Moot Court|Legal Clinic)\b/i,
  /\b[A-Z][A-Za-z0-9&/.-]{2,}\s+(?:project|pipeline|internship|case|model|dashboard|experience)\b/,
  /\u4f60\u8fd9(?:\u6bb5|\u6761|\u4e2a)|\u4f60\u8fd9\u91cc|\u8fd9\u6bb5(?:\u5b9e\u4e60|\u9879\u76ee)|\u8fd9\u6761(?:\u9879\u76ee|bullet)|\u533b\u9662\u5b9e\u4e60|\u5496\u5561\u56e0\u9879\u76ee|\u5b66\u6821.*\u9879\u76ee|\u8bfe\u7a0b\u9879\u76ee|\u67d0\u5b66\u6821|\u5f53\u65f6|\u539f\u7b80\u5386/i,
];

function hasCaseLeak(text = "") {
  return SAFE_CASE_PATTERNS.some((pattern) => pattern.test(String(text || "")));
}

function familyOf(row) {
  return compact(row.canonical_action_family || "general");
}

function generalizedMentor(row) {
  const family = familyOf(row);
  if (family === "summary_positioning" || family === "overall_positioning") {
    return "建议先把简历开头的岗位定位写清楚，让后面的技能和经历都服务同一个目标方向。";
  }
  if (family === "jd_keyword_alignment" || family === "skills_section") {
    return "关键词不要只堆在列表里，要落到真实经历证据中，让 ATS 和人工筛选都能看懂匹配关系。";
  }
  if (family === "education_signal") {
    return "教育背景要写成岗位能力证据，优先呈现相关训练、课程或项目如何支撑目标岗位。";
  }
  if (family === "format_cleanup" || family === "section_structure") {
    return "格式和结构要服务阅读效率，先保证重点内容能被稳定解析、快速看到。";
  }
  if (family === "quantified_impact") {
    return "经历描述要让读者看到工作量、方法和结果边界，数字不必夸张，但要能支撑贡献判断。";
  }
  return "这条建议要回到真实经历里，把内容写成任务、方法、结果和可验证证据，而不是只停留在描述或标签。";
}

function generalizedHr(row) {
  const family = familyOf(row);
  if (family === "summary_positioning" || family === "overall_positioning") {
    return "我会先判断这份简历到底投什么岗位；定位清楚时，后面的经历才更容易被放在正确语境里理解。";
  }
  if (family === "jd_keyword_alignment" || family === "skills_section") {
    return "我会用 JD 关键词快速确认基本匹配，但也会继续看经历里有没有对应证据。";
  }
  if (family === "education_signal") {
    return "经验还不长时，我会看教育和训练能不能补足岗位信号；只列名称说服力不够。";
  }
  if (family === "format_cleanup" || family === "section_structure") {
    return "结构清楚会降低筛选成本；如果格式或顺序影响阅读，亮点可能还没被看到就被削弱。";
  }
  if (family === "quantified_impact") {
    return "我会看这段经历有没有结果和影响范围；只有职责描述时，很难判断贡献大小。";
  }
  return "我看经历时会找任务、方法和结果；信息越具体可验证，越容易判断是否值得继续推进。";
}

function rawOrBlank(text = "") {
  const cleaned = compact(text);
  return cleaned && !hasCaseLeak(cleaned) ? cleaned : "";
}

function rawMentorTemplate(row) {
  const family = familyOf(row);
  if (family === "summary_positioning" || family === "overall_positioning") {
    return "这类修改要先把岗位定位讲清楚，让简历开头、技能和经历指向同一个方向。";
  }
  if (family === "jd_keyword_alignment" || family === "skills_section") {
    return "技能词可以保留领域特色，但要写在真实经历或项目证据旁边，避免只像关键词堆叠。";
  }
  if (family === "education_signal") {
    return "教育和训练信息要服务目标岗位，重点是说明相关基础和可迁移能力，而不是简单列名称。";
  }
  if (family === "format_cleanup" || family === "section_structure") {
    return "结构和格式要帮助读者快速抓重点，越靠前的位置越应该放最能支持目标岗位的证据。";
  }
  if (family === "quantified_impact") {
    return "经历要写出任务、方法和结果边界，让读者能判断贡献大小，而不是只看到职责描述。";
  }
  return "这条建议要保留领域判断，但不能绑定某个具体个案；重点是把真实经历写成可验证证据。";
}

function rawHrTemplate(row) {
  const family = familyOf(row);
  if (family === "summary_positioning" || family === "overall_positioning") {
    return "我会先看候选人的目标方向是否清楚；定位明确时，后面的内容才更容易被继续阅读。";
  }
  if (family === "jd_keyword_alignment" || family === "skills_section") {
    return "我会先扫岗位关键词，但也会继续看这些能力是否有经历证据支撑。";
  }
  if (family === "education_signal") {
    return "经验还不长时，我会看教育背景和训练是否能补足岗位信号。";
  }
  if (family === "format_cleanup" || family === "section_structure") {
    return "结构清楚能降低筛选成本；如果顺序或格式影响阅读，亮点会更难被看到。";
  }
  if (family === "quantified_impact") {
    return "我会看这段经历是否有结果和影响范围；只有职责描述时，贡献判断会比较保守。";
  }
  return "我看经历时会找任务、方法和结果；信息越具体可验证，越容易判断是否推进。";
}

function proposedFor(row) {
  const legacyMentor = compact(row.humanized_mentor_insight);
  const legacyHr = compact(row.humanized_hr_perspective);
  const insight = compact(row.I_insight);
  const hrOs = compact(row.HR_os);
  const rawMentor = compact(row.humanized_mentor_insight_raw) ||
    rawOrBlank(legacyMentor) ||
    rawOrBlank(insight) ||
    rawMentorTemplate(row);
  const rawHr = compact(row.humanized_hr_perspective_raw) ||
    rawOrBlank(legacyHr) ||
    rawOrBlank(hrOs) ||
    rawHrTemplate(row);
  const genMentor = compact(row.humanized_mentor_insight_generalized) || generalizedMentor(row);
  const genHr = compact(row.humanized_hr_perspective_generalized) || generalizedHr(row);
  const mentorSource = compact(row.humanized_mentor_insight_raw) ? "existing" :
    rawOrBlank(legacyMentor) ? "legacy" :
    rawOrBlank(insight) ? "I_insight" :
    "template";
  const hrSource = compact(row.humanized_hr_perspective_raw) ? "existing" :
    rawOrBlank(legacyHr) ? "legacy" :
    rawOrBlank(hrOs) ? "HR_os" :
    "template";
  const needsReview = Boolean(
    (legacyMentor && hasCaseLeak(legacyMentor) && mentorSource !== "I_insight" && mentorSource !== "template") ||
    (legacyHr && hasCaseLeak(legacyHr) && hrSource !== "HR_os" && hrSource !== "template") ||
    (insight && hasCaseLeak(insight) && mentorSource === "template") ||
    (hrOs && hasCaseLeak(hrOs) && hrSource === "template")
  );
  return {
    id: Number(row.id),
    humanized_mentor_insight: legacyMentor,
    humanized_hr_perspective: legacyHr,
    humanized_mentor_insight_raw: rawMentor,
    humanized_hr_perspective_raw: rawHr,
    humanized_mentor_insight_generalized: genMentor,
    humanized_hr_perspective_generalized: genHr,
    perspective_review_status: row.perspective_review_status || "approved",
    perspective_source: needsReview ? "perspective_split_rules_raw_review" : "perspective_split_rules",
    perspective_confidence: needsReview ? 0.55 : 0.82,
    perspective_split_meta: { mentorSource, hrSource },
  };
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  let ids = [];
  if (IDS_FILE) {
    const parsed = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), IDS_FILE), "utf8"));
    ids = Array.isArray(parsed) ? parsed.map(Number).filter(Boolean) : [];
  }
  const limitSql = LIMIT > 0 ? `LIMIT ${LIMIT}` : "";
  const offsetSql = OFFSET > 0 ? `OFFSET ${OFFSET}` : "";
  const idWhereSql = ids.length ? `AND id = ANY($1::int[])` : "";
  const queryParams = ids.length ? [ids] : [];
  const { rows } = await pool.query(`
    SELECT id, canonical_action_family, "I_insight", "HR_os",
           to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
           to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
           to_jsonb(segments)->>'humanized_mentor_insight_raw' AS humanized_mentor_insight_raw,
           to_jsonb(segments)->>'humanized_hr_perspective_raw' AS humanized_hr_perspective_raw,
           to_jsonb(segments)->>'humanized_mentor_insight_generalized' AS humanized_mentor_insight_generalized,
           to_jsonb(segments)->>'humanized_hr_perspective_generalized' AS humanized_hr_perspective_generalized,
           to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status,
           to_jsonb(segments)->>'perspective_source' AS perspective_source,
           NULLIF(to_jsonb(segments)->>'perspective_confidence', '')::numeric AS perspective_confidence
      FROM segments
     WHERE retrieval_scope = 'resume_edit'
       AND COALESCE(action_review_status, '') != 'exclude'
       ${idWhereSql}
     ORDER BY id
     ${limitSql}
     ${offsetSql}
  `, queryParams);

  const proposed = rows.map(proposedFor);
  const changed = proposed.filter((p, index) => {
    const current = rows[index];
    return [
      "humanized_mentor_insight_raw",
      "humanized_hr_perspective_raw",
      "humanized_mentor_insight_generalized",
      "humanized_hr_perspective_generalized",
      "perspective_review_status",
      "perspective_source",
      "perspective_confidence",
    ].some((column) => compact(current[column]) !== compact(p[column]));
  });
  const needsReview = changed.filter((row) => row.perspective_source === "perspective_split_rules_raw_review");

  console.log(JSON.stringify({
    apply: APPLY,
    commitPerChunk: COMMIT_PER_CHUNK,
    offset: OFFSET,
    scanned: rows.length,
    changedRows: changed.length,
    needsReviewRows: needsReview.length,
    byMentorSource: changed.reduce((acc, row) => {
      const source = row.perspective_split_meta?.mentorSource || "unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {}),
    byHrSource: changed.reduce((acc, row) => {
      const source = row.perspective_split_meta?.hrSource || "unknown";
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {}),
    sampleIds: changed.slice(0, 30).map((row) => row.id),
  }, null, 2));

  const outDir = path.join(process.cwd(), "data", "audit", "perspective_split");
  fs.mkdirSync(outDir, { recursive: true });
  const proposalPath = path.join(outDir, `backfill_proposed_${Date.now()}.json`);
  fs.writeFileSync(proposalPath, JSON.stringify({ rows: changed }, null, 2), "utf8");
  console.log(`proposal=${proposalPath}`);

  if (!APPLY) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_perspective_split_${Date.now()}.jsonl`);
  fs.writeFileSync(backupPath, rows.map((row) => JSON.stringify(row)).join("\n") + "\n", "utf8");
  console.log(`backup=${backupPath}`);

  if (!COMMIT_PER_CHUNK) await pool.query("BEGIN");
  try {
    const chunkSize = Math.max(1, CHUNK_SIZE || 100);
    for (let index = 0; index < changed.length; index += chunkSize) {
      const chunk = changed.slice(index, index + chunkSize);
      if (COMMIT_PER_CHUNK) await pool.query("BEGIN");
      await pool.query(
        `UPDATE segments
            SET humanized_mentor_insight_raw = p.humanized_mentor_insight_raw,
                humanized_hr_perspective_raw = p.humanized_hr_perspective_raw,
                humanized_mentor_insight_generalized = p.humanized_mentor_insight_generalized,
                humanized_hr_perspective_generalized = p.humanized_hr_perspective_generalized,
                perspective_review_status = p.perspective_review_status,
                perspective_source = p.perspective_source,
                perspective_confidence = p.perspective_confidence
           FROM jsonb_to_recordset($1::jsonb) AS p(
                id int,
                humanized_mentor_insight_raw text,
                humanized_hr_perspective_raw text,
                humanized_mentor_insight_generalized text,
                humanized_hr_perspective_generalized text,
                perspective_review_status text,
                perspective_source text,
                perspective_confidence numeric
           )
          WHERE segments.id = p.id`,
        [JSON.stringify(chunk)]
      );
      if (COMMIT_PER_CHUNK) {
        await pool.query("COMMIT");
        console.log(`applied ${Math.min(index + chunk.length, changed.length)}/${changed.length}`);
      }
    }
    if (!COMMIT_PER_CHUNK) await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => {});
    throw error;
  }
  console.log("Apply complete.");
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  hasCaseLeak,
  rawOrBlank,
  rawMentorTemplate,
  rawHrTemplate,
  proposedFor,
  generalizedMentor,
  generalizedHr,
};
