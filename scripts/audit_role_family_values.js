"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const db = require("../database");

async function main() {
  const pool = db.getPool();
  const { rows } = await pool.query(`
    SELECT role_family, COUNT(*)::int AS count
      FROM segments
     WHERE role_family IS NOT NULL
       AND role_family != ''
     GROUP BY role_family
     ORDER BY count DESC, role_family
     LIMIT 120
  `);
  for (const row of rows) {
    console.log(`${row.count}\t${row.role_family}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
