"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

async function main() {
  const pool = db.getPool();
  const { rows } = await pool.query(`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE coalesce(humanized_mentor_insight, '') <> '')::int AS with_mentor,
      count(*) FILTER (WHERE perspective_source = 'chat_mentor_from_p_mentor')::int AS chat_source,
      count(*) FILTER (WHERE perspective_source = 'mentor_rules_from_p_mentor')::int AS rules_source,
      count(*) FILTER (WHERE id = 29 AND coalesce(humanized_mentor_insight, '') <> '')::int AS id29_has_text
    FROM segments
  `);
  console.log(JSON.stringify(rows[0], null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
