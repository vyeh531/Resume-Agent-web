"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");
const {
  retrieveMentorAdvice,
  isAdviceRoleSafe,
  isCardAlignedWithTargetProblems,
} = require("../services/mentorAdviceRetrieval");

const IDS = (process.argv.find((arg) => arg.startsWith("--ids="))?.split("=")[1] || "")
  .split(",")
  .map((id) => Number(id.trim()))
  .filter(Boolean);

const internalAtsResult = {
  profile: { roleFamily: "machine_learning", targetRole: "Machine Learning Engineer Intern (MLE)" },
  problemTags: [
    { tag: "low_jd_keyword_match", severity: "critical" },
    { tag: "missing_priority_keywords", severity: "critical" },
    { tag: "low_hard_skill_match", severity: "high" },
    { tag: "weak_experience_keyword_evidence", severity: "high" },
    { tag: "missing_exact_job_title", severity: "medium" },
    { tag: "weak_target_role_alignment", severity: "medium" },
  ],
};

const retrievalQuery = {
  targetRole: "Machine Learning Engineer Intern (MLE)",
  problemTags: internalAtsResult.problemTags.map((item) => item.tag),
  priorityKeywords: [
    "machine learning", "image generation", "Stable Diffusion", "SDXL", "Flux",
    "ComfyUI", "Python", "prompt engineering", "model evaluation", "debugging",
    "LLM", "RAG", "YOLO", "PyTorch", "TensorFlow",
  ],
  filters: {
    roleFamily: ["machine_learning", "ai_engineer"],
    targetRoles: ["machine_learning_engineer", "mle", "machine_learning_engineer_intern"],
    seniority: ["intern", "entry"],
  },
};

function compact(value, length = 240) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

async function main() {
  if (!IDS.length) {
    console.error("Usage: node scripts\\check_mle_candidate_ids.js --ids=1,2,3");
    process.exit(1);
  }

  const pool = db.getPool();
  const { rows } = await pool.query(
    `SELECT id, chunk_id, retrieval_scope, role_family, target_roles, problem_tags,
            ats_dimensions, keywords, advice_card_title, user_problem_summary,
            "A_action", action_summary
       FROM segments
      WHERE id = ANY($1::int[])
      ORDER BY array_position($1::int[], id)`,
    [IDS]
  );
  const candidates = await retrieveMentorAdvice(retrievalQuery, { limit: 220 });
  const byAdviceId = new Map(candidates.map((card, index) => [card.adviceId, { card, index }]));

  console.log(JSON.stringify({ requested: IDS.length, retrieved: candidates.length }, null, 2));
  for (const row of rows) {
    const entry = byAdviceId.get(`seg_${row.id}`);
    const card = entry?.card;
    console.log(`\n# row=${row.id} rank=${entry ? entry.index + 1 : "NOT_RETRIEVED"}`);
    console.log(`chunk=${row.chunk_id}`);
    console.log(`scope=${row.retrieval_scope || ""} role=${row.role_family || ""} targets=${row.target_roles || ""}`);
    console.log(`tags=${row.problem_tags || ""} dims=${row.ats_dimensions || ""} keywords=${compact(row.keywords, 160)}`);
    console.log(`title=${compact(row.advice_card_title || row.user_problem_summary)}`);
    console.log(`action=${compact(row.A_action || row.action_summary, 360)}`);
    if (card) {
      console.log(`candidate_score=${card.retrieval_score ?? ""} reasons=${(card.matched_reasons || []).join(",")}`);
      console.log(`roleSafe=${isAdviceRoleSafe(card, internalAtsResult.profile.targetRole, internalAtsResult.profile.roleFamily)} aligned=${isCardAlignedWithTargetProblems(card, internalAtsResult.problemTags)}`);
      console.log(`cardRole=${card.roleFamily || ""} cardTargets=${card.targetRoles || ""}`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
