"use strict";

require("dotenv").config({ path: ".env.local" });
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const db = require("../database");
const { _resolveCompanyLogo } = require("../services/mentorAdviceRetrieval");

const PALETTE = [
  ["#f7f2e8", "#1f3d36", "#d9a15f"],
  ["#eef4f1", "#173b57", "#7fa28b"],
  ["#f5eef0", "#4a2533", "#c7837a"],
  ["#eef1f7", "#26395f", "#8ba0c9"],
  ["#f4f1e8", "#403728", "#b58b4d"],
  ["#edf5f4", "#244449", "#79a7a2"],
];

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function filenameForCompany(company) {
  return String(company || "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "")
    .slice(0, 120) + ".svg";
}

function initials(company) {
  const text = String(company || "").trim();
  const latin = text.match(/[A-Za-z0-9]+/g);
  if (latin && latin.length) {
    return latin.slice(0, 3).map((word) => word[0]).join("").toUpperCase();
  }
  return Array.from(text).filter((char) => /\p{L}|\p{N}/u.test(char)).slice(0, 3).join("");
}

function logoPathExists(logoUrl) {
  if (!logoUrl || !logoUrl.startsWith("/logos/")) return false;
  const file = decodeURIComponent(logoUrl.replace(/^\/logos\//, ""));
  return fs.existsSync(path.join(process.cwd(), "public", "logos", file));
}

function makeSvg(company, index) {
  const [bg, ink, accent] = PALETTE[index % PALETTE.length];
  const safeName = escapeXml(company);
  const safeInitials = escapeXml(initials(company));
  const fontSize = Array.from(company).length > 28 ? 34 : 40;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="240" viewBox="0 0 640 240" role="img" aria-label="${safeName} logo">
  <rect width="640" height="240" rx="32" fill="${bg}"/>
  <rect x="28" y="28" width="584" height="184" rx="24" fill="#ffffff" opacity="0.72"/>
  <circle cx="104" cy="120" r="48" fill="${accent}"/>
  <text x="104" y="134" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="800" fill="${ink}">${safeInitials}</text>
  <text x="176" y="132" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="800" fill="${ink}">${safeName}</text>
</svg>
`;
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

  const logosDir = path.join(process.cwd(), "public", "logos");
  fs.mkdirSync(logosDir, { recursive: true });

  const missing = rows.filter((row) => !logoPathExists(_resolveCompanyLogo(row.company)));
  for (const [index, row] of missing.entries()) {
    const file = filenameForCompany(row.company);
    fs.writeFileSync(path.join(logosDir, file), makeSvg(row.company, index), "utf8");
    console.log(`created ${file} (${row.segment_count} segments)`);
  }

  console.log(`created fallback logos: ${missing.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
