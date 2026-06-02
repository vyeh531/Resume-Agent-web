"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");

const APPLY = process.argv.includes("--apply");

const UPDATES = {
  309: { role_family: "hardware_electrical", target_roles: "hardware_engineer" },
  2035: { role_family: "finance,supply_chain", target_roles: "investment_analyst,supply_chain_analyst" },
  3357: { role_family: "design_creative", target_roles: "concept_artist,illustrator,animator,game_designer" },
  3360: { role_family: "design_creative", target_roles: "concept_artist,animator,game_designer" },
  4324: { retrieval_scope: "job_search", role_family: "hardware_electrical", target_roles: "hardware_engineer,chip_verification_engineer" },
  5238: { role_family: "data_analyst", target_roles: "management_analyst,business_analyst" },
  6311: { role_family: "hardware_electrical", target_roles: "hardware_engineer,electrical_engineer" },
  6314: { role_family: "hardware_electrical", target_roles: "hardware_engineer,electrical_engineer" },
  6317: { role_family: "hardware_electrical", target_roles: "hardware_engineer,electrical_engineer" },
  7198: { role_family: "mechanical_engineering", target_roles: "mechanical_engineer,robotics_engineer" },
  7878: { role_family: "hardware_electrical", target_roles: "hardware_engineer" },
  8517: { role_family: "hardware_electrical", target_roles: "digital_ic_engineer,analog_ic_engineer,hardware_engineer" },
  8537: { retrieval_scope: "interview", role_family: "hardware_electrical", target_roles: "ic_design_engineer,hardware_engineer" },
  9447: { role_family: "finance", target_roles: "quantitative_analyst,financial_analyst" },
  10571: { role_family: "hardware_electrical", target_roles: "hardware_engineer" },
  10589: { retrieval_scope: "job_search", role_family: "hardware_electrical", target_roles: "hardware_engineer" },
  10647: { retrieval_scope: "interview", role_family: "accounting,finance", target_roles: "accountant,financial_analyst" },
  15133: { role_family: "hardware_electrical", target_roles: "electronic_engineer,hardware_engineer" },
  17987: { role_family: "finance", target_roles: "financial_analyst,business_analyst" },
  19065: { role_family: "mechanical_engineering", target_roles: "mechanical_engineer,automotive_engineer" },
  19926: { role_family: "finance,data_analyst", target_roles: "financial_analyst,business_analyst" },
  19962: { retrieval_scope: "job_search", role_family: "finance", target_roles: "financial_analyst" },
  21683: { role_family: "finance", target_roles: "quantitative_analyst" },
  21821: { retrieval_scope: "career_strategy", role_family: "hardware_electrical", target_roles: "hardware_engineer" },
  21830: { role_family: "hardware_electrical", target_roles: "hardware_engineer,embedded_engineer" },
  22034: { role_family: "hardware_electrical", target_roles: "hardware_engineer,embedded_engineer,control_engineer" },
  23334: { role_family: "hardware_electrical", target_roles: "hardware_engineer,ic_design_engineer" },
  23345: { retrieval_scope: "career_strategy", role_family: "hardware_electrical", target_roles: "eda_engineer,ic_design_engineer" },
  24604: { role_family: "hardware_electrical", target_roles: "hardware_engineer" },
  24609: { role_family: "hardware_electrical", target_roles: "hardware_engineer" },
  24800: { role_family: "finance", target_roles: "quantitative_analyst" },
};

function compact(value, length = 260) {
  return String(value || "").replace(/\s+/g, " ").slice(0, length);
}

function countBy(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row.next[key] || row.current[key] || "";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

async function main() {
  const pool = db.getPool();
  await pool.query("SET statement_timeout = '10min'");
  const ids = Object.keys(UPDATES).map(Number);
  const { rows } = await pool.query(
    `
      SELECT id, retrieval_scope, role_family, target_roles, target_role,
             target_role_family, topic, "L1", "L2", problem_tags,
             advice_card_title, user_problem_summary, "A_action", action_summary
        FROM segments
       WHERE id = ANY($1::int[])
       ORDER BY id
    `,
    [ids]
  );

  const updates = rows.map((row) => ({
    id: row.id,
    current: {
      retrieval_scope: row.retrieval_scope || "",
      role_family: row.role_family || "",
      target_roles: row.target_roles || "",
    },
    next: {
      retrieval_scope: UPDATES[row.id].retrieval_scope || row.retrieval_scope || "resume_edit",
      role_family: UPDATES[row.id].role_family || row.role_family || "",
      target_roles: UPDATES[row.id].target_roles || row.target_roles || "",
    },
    row,
  }));

  console.log(JSON.stringify({
    apply: APPLY,
    requested: ids.length,
    found: rows.length,
    by_next_scope: countBy(updates, "retrieval_scope"),
    by_next_role_family: countBy(updates, "role_family"),
  }, null, 2));

  for (const item of updates) {
    console.log(`\n# id=${item.id}`);
    console.log(`scope: ${item.current.retrieval_scope} -> ${item.next.retrieval_scope}`);
    console.log(`role: ${item.current.role_family} -> ${item.next.role_family}`);
    console.log(`targets: ${item.current.target_roles} -> ${item.next.target_roles}`);
    console.log(`topic=${item.row.topic || ""} / ${item.row.L1 || ""} / ${item.row.L2 || ""}`);
    console.log(`title=${compact(item.row.advice_card_title || item.row.user_problem_summary, 220)}`);
    console.log(`action=${compact(item.row.A_action || item.row.action_summary, 300)}`);
  }

  if (!APPLY) {
    console.log("\nDry run only. Re-run with --apply after reviewing samples.");
    return;
  }

  const backupDir = path.join(process.cwd(), "data", "backups");
  fs.mkdirSync(backupDir, { recursive: true });
  const backupPath = path.join(backupDir, `segments_universal_role_leaks_${Date.now()}.json`);
  fs.writeFileSync(backupPath, JSON.stringify(updates, null, 2));
  console.log(`backup=${backupPath}`);

  await pool.query("BEGIN");
  try {
    await pool.query(`
      CREATE TEMP TABLE segment_role_leak_updates (
        id integer PRIMARY KEY,
        retrieval_scope text,
        role_family text,
        target_roles text
      ) ON COMMIT DROP
    `);
    const params = [];
    const values = updates.map((item, index) => {
      params.push(item.id, item.next.retrieval_scope, item.next.role_family, item.next.target_roles);
      const offset = index * 4;
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4})`;
    });
    await pool.query(
      `INSERT INTO segment_role_leak_updates (id, retrieval_scope, role_family, target_roles) VALUES ${values.join(",")}`,
      params
    );
    await pool.query(`
      UPDATE segments AS target
         SET retrieval_scope = updates.retrieval_scope,
             role_family = updates.role_family,
             target_roles = updates.target_roles
        FROM segment_role_leak_updates AS updates
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
