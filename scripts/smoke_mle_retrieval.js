"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const {
  retrieveMentorAdvice,
  selectFreeMentorPlan,
  selectPremiumMentorPlan,
} = require("../services/mentorAdviceRetrieval");
const db = require("../database");

const internalAtsResult = {
  profile: {
    roleFamily: "machine_learning",
    targetRole: "Machine Learning Engineer Intern (MLE)",
    canonicalRoleFamily: "machine_learning",
    roleGroup: "engineering_technical",
  },
  problemTags: [
    { tag: "low_jd_keyword_match", severity: "critical", dimension: "D_keyword_match", topic: "resume_ats" },
    { tag: "missing_priority_keywords", severity: "critical", dimension: "D_keyword_match", topic: "resume_ats" },
    { tag: "low_hard_skill_match", severity: "high", dimension: "D_keyword_match", topic: "skills" },
    { tag: "weak_experience_keyword_evidence", severity: "high", dimension: "C_content_quality", topic: "experience" },
    { tag: "missing_exact_job_title", severity: "medium", dimension: "F_role_fit", topic: "summary" },
    { tag: "weak_target_role_alignment", severity: "medium", dimension: "F_role_fit", topic: "summary" },
  ],
};

const retrievalQuery = {
  targetRole: "Machine Learning Engineer Intern (MLE)",
  problemTags: internalAtsResult.problemTags.map((item) => item.tag),
  priorityKeywords: [
    "machine learning",
    "image generation",
    "Stable Diffusion",
    "SDXL",
    "Flux",
    "ComfyUI",
    "Python",
    "prompt engineering",
    "model evaluation",
    "debugging",
  ],
  filters: {
    roleFamily: ["machine_learning", "ai_engineer"],
    targetRoles: ["machine_learning_engineer", "mle", "machine_learning_engineer_intern"],
    seniority: ["intern", "entry"],
  },
};

function compact(value, length = 260) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

async function segmentIdForAdviceId(pool, adviceId) {
  if (!adviceId || String(adviceId).startsWith("fb_")) return "";
  const segMatch = String(adviceId).match(/^seg_(\d+)$/);
  if (segMatch) return segMatch[1];
  const { rows } = await pool.query("SELECT id FROM segments WHERE chunk_id = $1 LIMIT 1", [adviceId]);
  return rows[0]?.id || "";
}

async function printItem(pool, item, index) {
  const segmentId = await segmentIdForAdviceId(pool, item.adviceId || item.id);
  console.log(`\n#${index + 1} ${item.priorityLabel || item.priority || ""} ${item.targetSection || ""}`);
  console.log(`segmentId=${segmentId} adviceId=${item.adviceId || item.id || ""} source=${item.source || ""} score=${item.score ?? ""}`);
  console.log(`role=${item.roleFamily || ""} target=${item.targetRoles || ""}`);
  console.log(`tags=${(item.relatedProblemTags || item.problemTags || []).join?.(",") || item.problemTags || ""}`);
  console.log(`title=${compact(item.title || item.adviceCardTitle || item.userProblemSummary)}`);
  console.log(`current=${compact(item.currentDiagnosis || item.problemSummary || item.userProblemSummary)}`);
  console.log(`action=${compact(item.action || item.actionSummary)}`);
}

async function main() {
  const pool = db.getPool();
  const candidates = await retrieveMentorAdvice(retrievalQuery, { limit: 100 });
  const freePlan = selectFreeMentorPlan(candidates, internalAtsResult);
  const premiumPlan = selectPremiumMentorPlan(candidates, internalAtsResult, freePlan);
  const paidItems = (premiumPlan || [])
    .flatMap((mentor) => mentor.adviceItems || [])
    .slice(0, 12);

  console.log(JSON.stringify({
    candidates: candidates.length,
    freeCount: freePlan?.adviceItems?.length || 0,
    paidCount: paidItems.length,
    freeIds: (freePlan?.adviceItems || []).map((item) => item.adviceId || item.id),
    paidIds: paidItems.map((item) => item.adviceId || item.id),
  }, null, 2));

  console.log("\n## FREE");
  for (const [index, item] of (freePlan?.adviceItems || []).entries()) {
    await printItem(pool, item, index);
  }

  console.log("\n## PAID");
  for (const [index, item] of paidItems.entries()) {
    await printItem(pool, item, index);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
