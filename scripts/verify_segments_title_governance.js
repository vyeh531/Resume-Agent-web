#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" });

const { Pool } = require("pg");

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DIRECT_URL or DATABASE_URL");
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const summary = await pool.query(`
      select
        count(*)::int as total,
        count(*) filter (
          where canonical_title is null or btrim(canonical_title) = ''
        )::int as blank_title,
        count(*) filter (
          where canonical_title like '%简历优化建议%'
        )::int as banned_title,
        count(*) filter (
          where length(canonical_title) > 80
        )::int as over_80_chars,
        count(*) filter (
          where title_review_status = 'needs_review'
        )::int as needs_review,
        count(*) filter (
          where title_review_status = 'auto_classified'
        )::int as auto_classified
      from vibe_offer.segments
    `);

    const topTitles = await pool.query(`
      select canonical_title, count(*)::int as count
      from vibe_offer.segments
      group by canonical_title
      order by count desc
      limit 8
    `);

    console.log(JSON.stringify({
      summary: summary.rows[0],
      topTitles: topTitles.rows,
    }, null, 2));
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
