"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const db = require("../database");
const {
  humanizeMentorInsight,
  humanizeHrPerspective,
} = require("../services/mentorAdviceRetrieval");
const {
  reviewFlagsFor,
  writeCsv,
} = require("./audit_segments_perspective_tone");

const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const outArg = process.argv.find((arg) => arg.startsWith("--out="));
const csvArg = process.argv.find((arg) => arg.startsWith("--csv="));
const statusArg = process.argv.find((arg) => arg.startsWith("--status="));
const RUNTIME_ONLY = process.argv.includes("--runtime-only");
const LIMIT = Math.min(Math.max(Number(limitArg ? limitArg.slice("--limit=".length) : 25) || 25, 1), 100);
const REVIEW_STATUS = statusArg ? statusArg.slice("--status=".length) : "needs_review";
const OUT_FILE = outArg
  ? outArg.slice("--out=".length)
  : path.join("data", "audits", `segments_perspective_humanized_${Date.now()}.json`);
const CSV_FILE = csvArg ? csvArg.slice("--csv=".length) : "";

if (REVIEW_STATUS === "approved") {
  throw new Error("Batch generation cannot mark perspective rows as approved. Generate as needs_review, then approve after human review.");
}

function extractJsonArray(text) {
  const cleaned = String(text || "").replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("LLM response did not contain a JSON array");
  return JSON.parse(match[0]);
}

function fallbackProposal(row) {
  const card = {
    ...row,
    adviceId: row.id ? `seg_${row.id}` : row.chunk_id,
    title: row.advice_card_title || row.topic || "",
    mentorInsight: row.I_insight || "",
    mentorLens: row.P_mentor || "",
    hrPerspective: row.HR_os || "",
    relatedProblemTags: String(row.problem_tags || "").split(",").map((v) => v.trim()).filter(Boolean),
    canonicalActionFamily: row.canonical_action_family || "",
  };
  return {
    id: row.id,
    humanized_mentor_insight: humanizeMentorInsight(card),
    humanized_hr_perspective: humanizeHrPerspective(card),
    perspective_review_status: REVIEW_STATUS,
    perspective_source: "runtime_rule_fallback",
    perspective_confidence: 0.65,
  };
}

function validateProposal(row, proposal) {
  const mentor = String(proposal.humanized_mentor_insight || "").trim();
  const hr = String(proposal.humanized_hr_perspective || "").trim();
  if (!mentor || !hr) return fallbackProposal(row);
  return {
    id: Number(row.id),
    humanized_mentor_insight: mentor.slice(0, 180),
    humanized_hr_perspective: hr.slice(0, 160),
    perspective_review_status: REVIEW_STATUS,
    perspective_source: "anthropic_batch",
    perspective_confidence: Number(proposal.perspective_confidence || 0.78),
  };
}

async function main() {
  if (!RUNTIME_ONLY && !process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is required for LLM batch generation");
  }
  const pool = db.getPool();
  const { rows } = await pool.query(
    `SELECT id, chunk_id, topic, "L1", "L2", "P_mentor", "A_action", "I_insight", "HR_os",
            problem_tags, role_family, target_roles, canonical_action_family, action_depth,
            advice_card_title, user_problem_summary, action_summary, unlock_tier, confidence,
            to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
            to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
            to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status,
            to_jsonb(segments)->>'perspective_source' AS perspective_source,
            to_jsonb(segments)->>'perspective_confidence' AS perspective_confidence
       FROM segments
      WHERE (retrieval_scope IS NULL OR retrieval_scope = 'resume_edit')
        AND COALESCE("I_insight", '') <> ''
        AND COALESCE("HR_os", '') <> ''
        AND COALESCE(humanized_mentor_insight, '') = ''
        AND COALESCE(humanized_hr_perspective, '') = ''
      ORDER BY mentor_quality_score DESC NULLS LAST, id
      LIMIT $1`,
    [LIMIT]
  );

  let parsed = [];
  let proposalSource = "runtime_rule_fallback";
  if (!RUNTIME_ONLY) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const promptRows = rows.map((row) => ({
    id: row.id,
    title: row.advice_card_title || row.topic || "",
    problem: row.user_problem_summary || row.P_mentor || "",
    action: row.action_summary || row.A_action || "",
    mentorInsight: row.I_insight || "",
    hrPerspective: row.HR_os || "",
    problemTags: row.problem_tags || "",
    actionFamily: row.canonical_action_family || "",
  }));

  const message = await client.messages.create({
    model: process.env.PERSPECTIVE_HUMANIZE_MODEL || "claude-sonnet-4-6",
    max_tokens: 7000,
    temperature: 0.4,
    system: [
      "You rewrite resume-advice display copy into natural Chinese.",
      "Return ONLY a valid JSON array. No markdown.",
      "For each input row, return id, humanized_mentor_insight, humanized_hr_perspective, perspective_confidence.",
      "Mentor voice: senior schoolmate helping a junior revise their resume; encouraging, specific, not preachy.",
      "Mentor must give advice only; do not write as if the mentor will personally edit or operate on the resume. Avoid phrases like 我会帮你, 我会把, 我会从, 我会陪你.",
      "HR voice: professional, direct, precise screening risk; can be sharp but not mocking.",
      "Avoid repeated templates across rows.",
      "Mentor: 35-90 Chinese characters, max 2 sentences. HR: 30-80 Chinese characters, max 2 sentences.",
      "Do not invent new resume facts."
    ].join(" "),
    messages: [{
      role: "user",
      content: JSON.stringify(promptRows, null, 2),
    }],
  });

  const raw = message.content?.[0]?.text || "";
  parsed = extractJsonArray(raw);
  proposalSource = "anthropic_batch";
  }
  const byId = new Map(parsed.map((row) => [Number(row.id), row]));
  const outputRows = rows.map((row) => {
    const proposal = RUNTIME_ONLY ? fallbackProposal(row) : validateProposal(row, byId.get(Number(row.id)) || {});
    const auditRow = {
      id: row.id,
      topic: row.topic,
      problem_tags: row.problem_tags,
      current: {
        I_insight: row.I_insight,
        HR_os: row.HR_os,
      },
      original: {
        mentorInsight: row.I_insight,
        hrPerspective: row.HR_os,
      },
      dbDisplay: {
        humanized_mentor_insight: row.humanized_mentor_insight || "",
        humanized_hr_perspective: row.humanized_hr_perspective || "",
        perspective_review_status: row.perspective_review_status || "",
        perspective_source: row.perspective_source || "",
        perspective_confidence: row.perspective_confidence || "",
      },
      proposed: {
        ...proposal,
        perspective_source: proposalSource,
      },
    };
    const review = reviewFlagsFor(auditRow);
    auditRow.review = {
      ...review,
      recommendation: review.flags.length ? "needs_manual_review" : "good_as_is",
    };
    if (!review.flags.length) {
      auditRow.review.flags.push("good_as_is");
      auditRow.review.reasons.push("No heuristic review risks detected; still requires human spot-check before DB approval.");
    }
    return auditRow;
  });
  const reviewSummary = outputRows.reduce((acc, row) => {
    for (const flag of row.review.flags) acc[flag] = (acc[flag] || 0) + 1;
    return acc;
  }, {});

  const fullPath = path.resolve(process.cwd(), OUT_FILE);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    table: "vibe_offer.segments",
    dryRun: true,
    runtimeOnly: RUNTIME_ONLY,
    reviewStatus: REVIEW_STATUS,
    reviewSummary,
    rows: outputRows,
  }, null, 2) + "\n");
  if (CSV_FILE) writeCsv(outputRows, CSV_FILE);

  console.log(JSON.stringify({
    output: fullPath,
    csv: CSV_FILE ? path.resolve(process.cwd(), CSV_FILE) : "",
    rows: outputRows.length,
    reviewStatus: REVIEW_STATUS,
    runtimeOnly: RUNTIME_ONLY,
    reviewSummary,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
