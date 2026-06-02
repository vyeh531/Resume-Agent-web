"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

(async () => {
  const pool = db.getPool();
  const { rows } = await pool.query(`
    SELECT column_name, data_type
      FROM information_schema.columns
     WHERE table_schema = 'vibe_offer'
       AND table_name = 'segments'
     ORDER BY ordinal_position
  `);
  console.log(JSON.stringify(rows, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
