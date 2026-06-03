"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const {
  retrieveMentorAdvice,
  isAdviceRoleSafe,
  isCardAlignedWithTargetProblems,
  inferAdviceIntent,
  inferAdviceScope,
} = require("../services/mentorAdviceRetrieval");

const internalAtsResult = {
  profile: {
    roleFamily: "machine_learning",
    targetRole: "Machine Learning Engineer Intern (MLE)",
  },
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
    "LLM",
    "RAG",
    "YOLO",
    "PyTorch",
    "TensorFlow",
  ],
  filters: {
    roleFamily: ["machine_learning", "ai_engineer"],
    targetRoles: ["machine_learning_engineer", "mle", "machine_learning_engineer_intern"],
    seniority: ["intern", "entry"],
  },
};

function compact(value, length = 220) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

async function main() {
  const targetProblemTags = internalAtsResult.problemTags;
  const candidates = await retrieveMentorAdvice(retrievalQuery, { limit: 140 });
  console.log(JSON.stringify({
    candidates: candidates.length,
    debug: candidates.debug || null,
  }, null, 2));

  for (const [index, card] of candidates.slice(0, 80).entries()) {
    const roleSafe = isAdviceRoleSafe(card, internalAtsResult.profile.targetRole, internalAtsResult.profile.roleFamily);
    const aligned = isCardAlignedWithTargetProblems(card, targetProblemTags);
    console.log(`\n#${index + 1} id=${card.adviceId}`);
    console.log(`score=${card.retrieval_score ?? ""} scope=${card.retrievalScope || ""}/${card.adviceScope || inferAdviceScope(card)} intent=${card.adviceIntent || inferAdviceIntent(card)}`);
    console.log(`role=${card.roleFamily || ""} targets=${card.targetRoles || ""}`);
    console.log(`reasons=${(card.matched_reasons || []).join(",")} roleSafe=${roleSafe} aligned=${aligned}`);
    console.log(`title=${compact(card.title || card.problemSummary)}`);
    console.log(`action=${compact(card.actionSummary)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
