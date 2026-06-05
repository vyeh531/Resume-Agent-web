"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const TEMPLATE_PATTERNS = [
  /根据目标岗位重新分配简历叙事重点/,
  /把这段经历改写成更可验证的简历证据/,
  /如果目标岗位缺少项目证据/,
  /如果目标岗位缺少关键技能信号/,
  /围绕目标岗位重新检查/,
  /动作 \+ 方法\/工具 \+ 结果/,
];

function qualityFlags(action = "") {
  const flags = [];
  if (!action || action.length < 24) flags.push("too_short");
  if (action.length > 140) flags.push("too_long");
  if (TEMPLATE_PATTERNS.some((pattern) => pattern.test(action))) flags.push("template_like");
  if (/真实掌握|不要为了匹配 JD|不要把练习项目包装/.test(action)) flags.push("safety_template");
  if (!/[，。；]/.test(action)) flags.push("low_sentence_shape");
  return flags;
}

function rewriteHint(row) {
  const family = row.canonical_action_family || "";
  if (family === "summary_positioning") return "写成 Summary/Objective 的具体改法：岗位原词 + 可迁移背景 + 一句业务能力。";
  if (family === "jd_keyword_alignment") return "写成 JD keyword mapping 的具体改法：先选真实掌握词，再落到 Skills 和一条经历。";
  if (family === "experience_evidence") return "写成 bullet 改法：任务、方法/工具、协作对象、结果，不要只说泛泛补证据。";
  if (family === "skills_section") return "写成技能栏排序/取舍的具体动作，并提醒只写能解释的技能。";
  if (family === "education_signal") return "写成课程/项目/证书如何支撑目标岗位，不要像学习计划。";
  return "保留专业判断，写成用户能马上改简历的一句话。";
}

async function main() {
  const limit = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 300);
  const pool = db.getPool();
  const { rows } = await pool.query(`
    SELECT id, chunk_id, topic, "L1", "L2", role_family, target_roles,
           "P_mentor", "A_action", action_summary, "I_insight", "HR_os",
           action_specificity, display_action_mode, generalized_action,
           canonical_action_family, action_depth, action_review_status
      FROM segments
     WHERE (retrieval_scope IS NULL OR retrieval_scope = 'resume_edit')
       AND COALESCE(generalized_action, '') <> ''
       AND COALESCE(display_action_mode, '') IN ('generalized', 'grounded_raw')
     ORDER BY id
  `);
  const candidates = rows
    .map((row) => {
      const flags = qualityFlags(row.generalized_action);
      return { ...row, qualityFlags: flags, rewriteHint: rewriteHint(row), priorityScore: flags.length * 10 + (row.display_action_mode === "generalized" ? 3 : 0) };
    })
    .filter((row) => row.qualityFlags.length)
    .sort((a, b) => b.priorityScore - a.priorityScore || Number(a.id) - Number(b.id))
    .slice(0, limit);
  const byFlag = candidates.reduce((acc, row) => {
    for (const flag of row.qualityFlags) acc[flag] = (acc[flag] || 0) + 1;
    return acc;
  }, {});
  const outDir = path.join(process.cwd(), "data", "audit", "generalized_action_quality");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `candidates_${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), scanned: rows.length, rowCount: candidates.length, byFlag, candidates }, null, 2), "utf8");
  console.log(JSON.stringify({ scanned: rows.length, candidates: candidates.length, byFlag, outPath, topIds: candidates.slice(0, 20).map((row) => row.id) }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
