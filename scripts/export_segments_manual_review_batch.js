"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const ISSUE = process.argv.find((arg) => arg.startsWith("--issue="))?.split("=")[1] || "scope";
const LIMIT = Number(process.argv.find((arg) => arg.startsWith("--limit="))?.split("=")[1] || 25);
const AFTER_ID = Number(process.argv.find((arg) => arg.startsWith("--after="))?.split("=")[1] || 0);

const WHERE_BY_ISSUE = {
  scope: `
    retrieval_scope = 'resume_edit'
    AND (
      COALESCE("P_mentor",'') || ' ' || COALESCE("A_action",'') || ' ' ||
      COALESCE(user_problem_summary,'') || ' ' || COALESCE(action_summary,'') || ' ' ||
      COALESCE("I_insight",'')
    ) ~* '(投递窗口|窗口期|海投|内推|networking|career fair|抢投|申请时间|秋招|春招|投递量|offer|约面|快速联系|岗位消失|岗位下线|急招|急需人才|好兆头|放平心态|积极应对|申研|升学|录取|admission|申请文书|推荐信|职业规划|职业方向|转行|市场竞争|背景差距|gap分析|路线规划|entry point)'
  `,
  tag: `
    retrieval_scope = 'resume_edit'
    AND (
      COALESCE(problem_tags,'') ~* '(keyword|hard_skill|summary|target_role|portfolio|format|experience)'
    )
  `,
  specific: `
    retrieval_scope = 'resume_edit'
    AND (
      COALESCE("P_mentor",'') || ' ' || COALESCE("A_action",'') || ' ' ||
      COALESCE(user_problem_summary,'') || ' ' || COALESCE(action_summary,'') || ' ' ||
      COALESCE("I_insight",'')
    ) ~* '(仍在读|目前在国内|人在国内|需要sponsorship|CPT|OPT|H-?1B|担心|不确定|焦虑|丧失信心|没进步|岗位消失|岗位下线|快速约面|收到约面|导师 |我觉得|我认为|对吧|好像)'
  `,
};

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");

  const where = WHERE_BY_ISSUE[ISSUE] || WHERE_BY_ISSUE.scope;
  const { rows } = await pool.query(`
    SELECT id, chunk_id, topic, topic_slug, "L1", "L2", "P_mentor", "A_action",
           "I_insight", "E_example", "HR_os", keywords, retrieval_text,
           advice_card_title, user_problem_summary, action_summary,
           role_family, target_roles, target_role, target_role_family,
           generality, advice_type, problem_tags, ats_dimensions, retrieval_scope,
           confidence, background_fit, industry_fit
      FROM segments
     WHERE ${where}
       AND id > $2
     ORDER BY id
     LIMIT $1
  `, [LIMIT, AFTER_ID]);

  const outDir = path.join(process.cwd(), "data", "audit");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `segments_manual_review_${ISSUE}_${Date.now()}.json`);
  fs.writeFileSync(outPath, JSON.stringify(rows, null, 2));

  console.log(JSON.stringify({
    issue: ISSUE,
    after: AFTER_ID,
    count: rows.length,
    output: outPath,
    ids: rows.map((row) => row.id),
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
