#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Missing DIRECT_URL or DATABASE_URL");

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const { rows } = await pool.query(`
      select canonical_title, count(*)::int as count
      from vibe_offer.segments
      where retrieval_scope = 'resume_edit'
      group by canonical_title
      order by count desc, canonical_title asc
    `);
    for (const row of rows) {
      console.log(`${row.canonical_title}\t${row.count}`);
    }
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
