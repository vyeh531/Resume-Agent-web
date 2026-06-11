"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");
const { _resolveCompanyLogo } = require("../services/mentorAdviceRetrieval");

function logoPathExists(logoUrl) {
  if (!logoUrl || !logoUrl.startsWith("/logos/")) return false;
  const file = decodeURIComponent(logoUrl.replace(/^\/logos\//, ""));
  return fs.existsSync(path.join(process.cwd(), "public", "logos", file));
}

async function main() {
  const pool = db.getPool();
  const { rows } = await pool.query(`
    SELECT mentor_company AS company, COUNT(*)::int AS segment_count
    FROM segments
    WHERE mentor_company IS NOT NULL
      AND btrim(mentor_company) <> ''
    GROUP BY mentor_company
    ORDER BY lower(mentor_company)
  `);

  const results = rows.map((row) => {
    const logo = _resolveCompanyLogo(row.company);
    return {
      company: row.company,
      segmentCount: row.segment_count,
      logo,
      exists: logoPathExists(logo),
    };
  });

  const missing = results.filter((item) => !item.logo || !item.exists);
  const covered = results.length - missing.length;

  console.log(`mentor companies: ${results.length}`);
  console.log(`covered: ${covered}`);
  console.log(`missing: ${missing.length}`);

  if (missing.length) {
    console.log("\nMissing logo coverage:");
    for (const item of missing) {
      console.log(`- ${item.company} (${item.segmentCount} segments) => ${item.logo || "NO_MATCH"}`);
    }
    process.exitCode = 1;
  } else {
    console.log("\nAll segment mentor companies resolve to existing local logo files.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
