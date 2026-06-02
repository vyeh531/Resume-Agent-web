"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");

const UPDATES = [
  {
    id: 771,
    problem_tags: "weak_result_orientation,weak_action_verbs,low_measurable_results",
    ats_dimensions: "C_content_quality",
    reason: "chatgpt_polish_advice_is_content_quality_not_keyword_gap",
  },
  {
    id: 3420,
    problem_tags: "weak_experience_keyword_evidence,weak_result_orientation",
    ats_dimensions: "C_content_quality,F_role_fit",
    reason: "pm_bullet_structure_advice_is_experience_evidence_not_skill_gap",
  },
  {
    id: 8731,
    problem_tags: "education_details_missing,weak_target_role_alignment",
    ats_dimensions: "B_contact,C_content_quality",
    reason: "course_name_rewording_is_readability_education_context_not_keyword_gap",
  },
  {
    id: 12341,
    problem_tags: "formatting_penalty_triggered,low_role_specificity",
    ats_dimensions: "A_format,F_role_fit",
    reason: "language_section_cleanup_is_section_relevance_not_skill_gap",
  },
  {
    id: 13495,
    problem_tags: "missing_portfolio,weak_target_role_alignment,low_role_specificity",
    ats_dimensions: "B_contact,F_role_fit",
    role_family: "design_creative",
    target_roles: "animator,3d_animator,motion_designer",
    reason: "animator_portfolio_ordering_is_portfolio_role_fit_not_jd_keyword_gap",
  },
  {
    id: 15918,
    problem_tags: "formatting_penalty_triggered",
    ats_dimensions: "A_format",
    reason: "month_abbreviation_advice_is_format_only",
  },
  {
    id: 24086,
    problem_tags: "weak_result_orientation,low_measurable_results",
    ats_dimensions: "C_content_quality",
    reason: "quantification_credibility_advice_is_content_quality_not_keyword_gap",
  },
];

function compact(row) {
  return {
    id: row.id,
    reason: row.reason,
    old_problem_tags: row.problem_tags || "",
    new_problem_tags: row.next_problem_tags,
    old_ats_dimensions: row.ats_dimensions || "",
    new_ats_dimensions: row.next_ats_dimensions,
    old_role_family: row.role_family || "",
    new_role_family: row.next_role_family || row.role_family || "",
    old_target_roles: row.target_roles || "",
    new_target_roles: row.next_target_roles || row.target_roles || "",
    topic: row.topic || "",
    title: String(row.advice_card_title || row.user_problem_summary || row.P_mentor || "").replace(/\s+/g, " ").slice(0, 220),
    action: String(row.A_action || row.action_summary || "").replace(/\s+/g, " ").slice(0, 360),
  };
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");

  const ids = UPDATES.map((row) => row.id);
  const { rows } = await pool.query(
    `
      SELECT id, topic, retrieval_scope, role_family, target_roles,
             problem_tags, ats_dimensions, advice_card_title, user_problem_summary,
             "P_mentor", "A_action", action_summary
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY id
    `,
    [ids]
  );

  const byId = new Map(UPDATES.map((row) => [row.id, row]));
  const updates = rows.map((row) => {
    const next = byId.get(row.id);
    return {
      ...row,
      reason: next.reason,
      next_problem_tags: next.problem_tags,
      next_ats_dimensions: next.ats_dimensions,
      next_role_family: next.role_family || row.role_family,
      next_target_roles: next.target_roles || row.target_roles,
    };
  }).filter((row) =>
    (row.problem_tags || "") !== row.next_problem_tags ||
    (row.ats_dimensions || "") !== row.next_ats_dimensions ||
    (row.role_family || "") !== (row.next_role_family || "") ||
    (row.target_roles || "") !== (row.next_target_roles || "")
  );

  const missing = ids.filter((id) => !rows.some((row) => row.id === id));
  console.log(JSON.stringify({
    apply: APPLY,
    intended: UPDATES.length,
    found: rows.length,
    updates: updates.length,
    missing,
  }, null, 2));

  for (const row of updates.map(compact)) {
    console.log(`\n# id=${row.id} ${row.reason}`);
    console.log(`topic=${row.topic}`);
    console.log(`title=${row.title}`);
    console.log(`action=${row.action}`);
    console.log(`tags: ${row.old_problem_tags} -> ${row.new_problem_tags}`);
    console.log(`dims: ${row.old_ats_dimensions} -> ${row.new_ats_dimensions}`);
    if (row.old_role_family !== row.new_role_family || row.old_target_roles !== row.new_target_roles) {
      console.log(`role: ${row.old_role_family} / ${row.old_target_roles} -> ${row.new_role_family} / ${row.new_target_roles}`);
    }
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }
  if (!updates.length) return;

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_remaining_keyword_tags_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates.map(compact), null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query(`
      CREATE TEMP TABLE segment_remaining_keyword_tag_updates (
        id integer PRIMARY KEY,
        problem_tags text,
        ats_dimensions text,
        role_family text,
        target_roles text
      ) ON COMMIT DROP
    `);
    for (const row of updates) {
      await pool.query(
        `
          INSERT INTO segment_remaining_keyword_tag_updates
            (id, problem_tags, ats_dimensions, role_family, target_roles)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [row.id, row.next_problem_tags, row.next_ats_dimensions, row.next_role_family, row.next_target_roles]
      );
    }
    await pool.query(`
      UPDATE segments AS target
         SET problem_tags = updates.problem_tags,
             ats_dimensions = updates.ats_dimensions,
             role_family = updates.role_family,
             target_roles = updates.target_roles
        FROM segment_remaining_keyword_tag_updates AS updates
       WHERE target.id = updates.id
    `);
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
