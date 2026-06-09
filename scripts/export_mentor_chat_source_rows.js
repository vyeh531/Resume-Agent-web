"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const argv = process.argv.slice(2);

function numberArg(name, fallback) {
  const raw = argv.find((arg) => arg.startsWith(`${name}=`));
  if (!raw) return fallback;
  const value = Number(raw.slice(name.length + 1));
  return Number.isFinite(value) ? value : fallback;
}

function stringArg(name, fallback) {
  const raw = argv.find((arg) => arg.startsWith(`${name}=`));
  return raw ? raw.slice(name.length + 1) : fallback;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

const LIMIT = numberArg("--limit", 50);
const RESUME_AFTER_ID = numberArg("--resume-after-id", 0);
const SCOPE = stringArg("--scope", "resume_edit");
const OUT = stringArg("--out", path.join("artifacts", "mentor-chat-batch", "source_rows.json"));

const SELECT_COLUMNS = `
  id, chunk_id, retrieval_scope, topic, "L1", "L2", advice_type,
  problem_tags, ats_dimensions, role_family, target_roles, seniority,
  advice_card_title, user_problem_summary, action_summary,
  "P_mentor", "A_action", "I_insight", "H_hook", "E_example", "HR_os",
  to_jsonb(segments)->>'humanized_mentor_insight' AS humanized_mentor_insight,
  to_jsonb(segments)->>'humanized_hr_perspective' AS humanized_hr_perspective,
  to_jsonb(segments)->>'perspective_review_status' AS perspective_review_status,
  to_jsonb(segments)->>'perspective_source' AS perspective_source,
  to_jsonb(segments)->>'perspective_confidence' AS perspective_confidence
`;

async function main() {
  const params = [];
  const where = [
    `concat_ws(' ', "P_mentor", "A_action", action_summary, user_problem_summary, "H_hook", "E_example") <> ''`,
    `COALESCE(humanized_mentor_insight, '') = ''`,
  ];
  if (SCOPE !== "all") {
    params.push(SCOPE);
    where.push(`retrieval_scope = $${params.length}`);
  }
  if (RESUME_AFTER_ID > 0) {
    params.push(RESUME_AFTER_ID);
    where.push(`id > $${params.length}`);
  }

  const pool = db.getPool();
  const { rows } = await pool.query(
    `
      SELECT ${SELECT_COLUMNS}
        FROM segments
       WHERE ${where.join(" AND ")}
       ORDER BY id
       LIMIT ${LIMIT}
    `,
    params
  );

  const resolvedOut = path.resolve(process.cwd(), OUT);
  ensureDir(path.dirname(resolvedOut));
  fs.writeFileSync(resolvedOut, JSON.stringify({
    generatedAt: new Date().toISOString(),
    table: "vibe_offer.segments",
    scope: SCOPE,
    limit: LIMIT,
    resumeAfterId: RESUME_AFTER_ID,
    rows,
  }, null, 2) + "\n", "utf8");

  console.log(JSON.stringify({
    rows: rows.length,
    firstId: rows[0]?.id || null,
    lastId: rows[rows.length - 1]?.id || null,
    out: resolvedOut,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
