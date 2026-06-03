"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 80);

const ROLE_PATTERN = /(machine[_\s-]?learning|ai[_\s-]?engineer|data[_\s-]?scientist|deep learning|computer vision|generative ai|ml engineer|mle|llm|rag)/i;
const CONTENT_PATTERN = /(image generation|stable diffusion|sdxl|flux|comfyui|prompt|generative|computer vision|vision model|model|machine learning|deep learning|python|pytorch|tensorflow|sklearn|huggingface|dataset|evaluation|inference|debugging|pipeline|project|项目|模型|机器学习|深度学习|图像|视觉|生成式|数据集|评估|推理|调参)/i;
const RESUME_PATTERN = /(简历|resume|skills?|experience|project|bullet|summary|jd|ats|keyword|关键词|项目|经历|技能|岗位|改写|补充|加入|写入|展示|突出|量化)/i;

function compact(value, length = 260) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

function score(row) {
  const text = [
    row.role_family,
    row.target_roles,
    row.problem_tags,
    row.keywords,
    row.topic,
    row.L1,
    row.L2,
    row.advice_card_title,
    row.user_problem_summary,
    row.A_action,
    row.action_summary,
    row.I_insight,
  ].filter(Boolean).join(" ");
  let value = 0;
  if (/image generation|stable diffusion|sdxl|flux|comfyui|视觉|图像|生成式/i.test(text)) value += 10;
  if (/machine[_\s-]?learning|mle|ml engineer|deep learning|computer vision|机器学习|深度学习/i.test(text)) value += 6;
  if (/python|pytorch|tensorflow|sklearn|huggingface|model|模型|dataset|evaluation|inference|debugging|pipeline/i.test(text)) value += 4;
  if (/project|项目|experience|经历|bullet/i.test(text)) value += 3;
  if (/low_jd_keyword_match|missing_priority_keywords|low_hard_skill_match|weak_experience_keyword_evidence|missing_exact_job_title|weak_target_role_alignment/.test(row.problem_tags || "")) value += 2;
  if ((row.retrieval_scope || "resume_edit") === "resume_edit") value += 2;
  if (/interview|面试|job_search|career_strategy|school_application/.test(row.retrieval_scope || "")) value -= 6;
  if (/data analyst|business analyst|tableau|power bi|excel|marketing|accounting|legal|clinical/i.test(text)) value -= 3;
  return value;
}

async function main() {
  const pool = db.getPool();
  const { rows } = await pool.query(`
    SELECT id, chunk_id, retrieval_scope, role_family, target_roles, problem_tags,
           ats_dimensions, keywords, topic, "L1", "L2", advice_card_title,
           user_problem_summary, "A_action", action_summary, "I_insight"
      FROM segments
     WHERE (
       role_family ~* $1 OR target_roles ~* $1 OR keywords ~* $2 OR
       retrieval_text ~* $2 OR advice_card_title ~* $2 OR
       user_problem_summary ~* $2 OR "A_action" ~* $2 OR action_summary ~* $2 OR
       "I_insight" ~* $2
     )
       AND (
         retrieval_scope IS NULL OR retrieval_scope = 'resume_edit'
       )
     ORDER BY id
     LIMIT 2000
  `, [ROLE_PATTERN.source, CONTENT_PATTERN.source]);

  const candidates = rows
    .filter((row) => RESUME_PATTERN.test([
      row.topic, row.L1, row.L2, row.advice_card_title, row.user_problem_summary, row.A_action, row.action_summary,
    ].filter(Boolean).join(" ")))
    .map((row) => ({ ...row, score: score(row) }))
    .sort((a, b) => b.score - a.score || a.id - b.id)
    .slice(0, LIMIT);

  console.log(JSON.stringify({
    scanned: rows.length,
    candidates: candidates.length,
    limit: LIMIT,
  }, null, 2));

  for (const row of candidates) {
    console.log(`\n# id=${row.id} score=${row.score}`);
    console.log(`chunk=${row.chunk_id || ""}`);
    console.log(`scope=${row.retrieval_scope || ""} role=${row.role_family || ""} targets=${row.target_roles || ""}`);
    console.log(`tags=${row.problem_tags || ""} dims=${row.ats_dimensions || ""}`);
    console.log(`keywords=${compact(row.keywords, 180)}`);
    console.log(`topic=${[row.topic, row.L1, row.L2].filter(Boolean).join(" / ")}`);
    console.log(`title=${compact(row.advice_card_title || row.user_problem_summary)}`);
    console.log(`action=${compact(row.A_action || row.action_summary, 420)}`);
    console.log(`insight=${compact(row.I_insight, 260)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
