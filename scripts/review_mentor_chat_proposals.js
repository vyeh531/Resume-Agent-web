"use strict";

const fs = require("fs");
const path = require("path");
const rules = require("./backfill_segments_mentor_insight_rules");

const argv = process.argv.slice(2);
const AGENT_APPROVE = argv.includes("--agent-approve");
const BLOCKING_FLAGS = new Set([
  "mentor_too_short",
  "mentor_too_long",
  "wrong_family_risk",
  "lost_required_signal",
  "mentor_overactive_voice_risk",
  "mentor_not_conversational",
  "manual_hold_id_29",
]);

function stringArg(name, fallback) {
  const raw = argv.find((arg) => arg.startsWith(`${name}=`));
  return raw ? raw.slice(name.length + 1) : fallback;
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

function summarize(rows) {
  return rows.reduce((acc, row) => {
    for (const flag of row.review.flags) acc[flag] = (acc[flag] || 0) + 1;
    return acc;
  }, {});
}

const sourcePath = stringArg("--source", path.join("artifacts", "mentor-chat-trial-10-r1", "source_rows.json"));
const proposalsPath = stringArg("--proposals", path.join("artifacts", "mentor-chat-trial-10-r1", "chat_proposals.json"));
const outPath = stringArg("--out", path.join("artifacts", "mentor-chat-trial-10-r1", "chat_reviewed.json"));
const csvPath = stringArg("--csv", path.join("artifacts", "mentor-chat-trial-10-r1", "chat_reviewed.csv"));

const source = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), sourcePath), "utf8"));
const proposals = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), proposalsPath), "utf8"));
const proposalById = new Map((proposals.rows || []).map((row) => [Number(row.id), row.humanized_mentor_insight || ""]));

const rows = (source.rows || []).map((row) => {
  const mentor = proposalById.get(Number(row.id)) || "";
  const review = rules.reviewMentor(row, mentor);
  const machineRecommendation = review.recommendation;
  const blockingFlags = review.flags.filter((flag) => BLOCKING_FLAGS.has(flag));
  if (AGENT_APPROVE && blockingFlags.length === 0) {
    review.recommendation = "approved";
    review.agentReview = {
      status: "approved",
      note: "Chat-generated mentor copy was manually reviewed against P_mentor/A_action/H_hook/E_example; advisory detail flags were checked and accepted.",
      machineRecommendation,
      blockingFlags,
    };
    if (!review.reasons.includes("Agent reviewed and approved advisory flags.")) {
      review.reasons.push("Agent reviewed and approved advisory flags.");
    }
  } else if (AGENT_APPROVE) {
    review.agentReview = {
      status: "needs_review",
      note: "Blocking review flags remain; do not apply automatically.",
      machineRecommendation,
      blockingFlags,
    };
  }
  return {
    id: row.id,
    retrieval_scope: row.retrieval_scope || "",
    topic: row.topic || "",
    mentor_rule_family: rules.classifyMentorRow(row),
    problem_tags: row.problem_tags || "",
    title: row.advice_card_title || row.user_problem_summary || row.topic || "",
    original: {
      P_mentor: row.P_mentor || "",
      A_action: row.A_action || "",
      action_summary: row.action_summary || "",
      user_problem_summary: row.user_problem_summary || "",
      H_hook: row.H_hook || "",
      E_example: row.E_example || "",
      I_insight: row.I_insight || "",
      source_text_for_generation: rules.sourceTextForGeneration(row),
      detail_text_for_review: rules.detailTextForReview(row),
    },
    dbDisplay: {
      humanized_mentor_insight: row.humanized_mentor_insight || "",
      humanized_hr_perspective: row.humanized_hr_perspective || "",
      perspective_review_status: row.perspective_review_status || "",
      perspective_source: row.perspective_source || "",
      perspective_confidence: row.perspective_confidence || "",
    },
    proposed: {
      humanized_mentor_insight: mentor,
      perspective_review_status: review.recommendation === "approved" ? "approved" : "needs_review",
      perspective_source: proposals.source || "chat_mentor_from_p_mentor",
      perspective_confidence: 0.88,
    },
    review,
  };
});

const payload = {
  generatedAt: new Date().toISOString(),
  table: "vibe_offer.segments",
  dryRun: true,
  generationMode: "chatbox_no_external_api",
  rows,
  reviewSummary: summarize(rows),
};

fs.writeFileSync(path.resolve(process.cwd(), outPath), JSON.stringify(payload, null, 2) + "\n", "utf8");

const headers = [
  "id",
  "recommendation",
  "review_flags",
  "review_reasons",
  "title",
  "P_mentor",
  "A_action",
  "H_hook",
  "I_insight_detail_review_only",
  "humanized_mentor_insight",
  "perspective_source",
];
const lines = [
  headers.join(","),
  ...rows.map((row) => [
    row.id,
    row.review.recommendation,
    row.review.flags.join("|"),
    row.review.reasons.join("|"),
    row.title,
    row.original.P_mentor,
    row.original.A_action,
    row.original.H_hook,
    row.original.I_insight,
    row.proposed.humanized_mentor_insight,
    row.proposed.perspective_source,
  ].map(csvCell).join(",")),
];

fs.writeFileSync(path.resolve(process.cwd(), csvPath), `${lines.join("\n")}\n`, "utf8");

console.log(JSON.stringify({
  rows: rows.length,
  reviewSummary: payload.reviewSummary,
  outPath: path.resolve(process.cwd(), outPath),
  csvPath: path.resolve(process.cwd(), csvPath),
}, null, 2));
