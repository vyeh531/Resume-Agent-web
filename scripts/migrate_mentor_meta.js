"use strict";

/**
 * Migration: add mentor_title + career_keywords to mentors & segments
 *
 * 1. ALTER mentors  → add career_keywords_json TEXT
 * 2. Populate career_keywords_json by extracting 3 keywords from career_path / title / company
 * 3. ALTER segments → add mentor_title TEXT, mentor_career_keywords TEXT
 * 4. UPDATE segments via join through sessions→mentors
 */

const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "mentor_kb-v5.db");
const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL");

// ── Step 1: add columns if missing ──────────────────────────────────────────

function addColIfMissing(table, col, type) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((r) => r.name);
  if (!cols.includes(col)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
    console.log(`[migrate] Added ${table}.${col}`);
  } else {
    console.log(`[migrate] ${table}.${col} already exists, skipping`);
  }
}

addColIfMissing("mentors", "career_keywords_json", "TEXT");
addColIfMissing("mentors", "career_path_display", "TEXT");
addColIfMissing("segments", "mentor_title", "TEXT");
addColIfMissing("segments", "mentor_career_keywords", "TEXT");
addColIfMissing("segments", "mentor_career_path_display", "TEXT");
addColIfMissing("segments", "mentor_company", "TEXT");

// ── Step 2: extract keywords from career_path ────────────────────────────────

const KNOWN_COMPANIES = [
  "Google", "Amazon", "Meta", "Microsoft", "Apple", "NVIDIA", "Intel",
  "TikTok", "ByteDance", "Goldman Sachs", "JPMorgan", "Morgan Stanley",
  "McKinsey", "BCG", "Deloitte", "Accenture", "Salesforce", "Adobe",
  "Netflix", "Uber", "Airbnb", "LinkedIn", "Twitter", "Spotify",
  "Bank of America", "Merrill Lynch", "Citigroup", "BlackRock", "Capital One",
  "Cisco", "Oracle", "SAP", "IBM", "Qualcomm", "Tesla", "Bosch",
  "Xerox", "UnitedHealthcare", "Navigant", "AOL", "PeerNova",
];

function extractKeywords(mentor) {
  const keywords = [];
  const path = (mentor.career_path || "").replace(/\s+/g, " ").trim();
  const title = (mentor.title || "").trim();
  const company = (mentor.company || "").trim();

  // 1. Current position badge: "现 {Company} · {Title}" (shortened)
  if (company && company.toLowerCase() !== "freelancer") {
    const shortTitle = title.split(/[,，\/]/)[0].trim().slice(0, 30);
    keywords.push(shortTitle ? `现 ${company}` : company);
    if (shortTitle) keywords.push(shortTitle);
  } else if (title) {
    keywords.push(title.slice(0, 30));
  }

  // 2. Past notable companies mentioned in career_path
  for (const co of KNOWN_COMPANIES) {
    if (
      co.toLowerCase() !== company.toLowerCase() &&
      path.toLowerCase().includes(co.toLowerCase()) &&
      !keywords.some((k) => k.includes(co))
    ) {
      keywords.push(`前${co}`);
      if (keywords.length >= 4) break;
    }
  }

  // 3. Years of experience / coaching numbers from career_path
  const yearsMatch = path.match(/(\d+)\s*[年\-]\s*(以上|\+|Years?|年|Experience)?/i);
  if (yearsMatch && !keywords.some((k) => k.includes("年"))) {
    keywords.push(`${yearsMatch[1]}年+ 经验`);
  }
  const coachMatch = path.match(/辅导\s*(\d+\+?)\s*名/);
  if (coachMatch) keywords.push(`辅导 ${coachMatch[1]}+ 学员`);
  const ratingMatch = (mentor.credibility_signal || "").match(/Rating:\s*(\d)/i);
  if (ratingMatch && Number(ratingMatch[1]) >= 4) keywords.push("⭐ 高评分");

  return [...new Set(keywords)].slice(0, 3);
}

// ── Step 2b: extract career_path_display "A → B → C（现）" ──────────────────

// Industry-category mapping for known company types
const INDUSTRY_MAP = [
  { keywords: ["google", "apple", "microsoft", "amazon", "meta", "facebook", "tiktok", "bytedance", "netflix", "uber", "airbnb", "linkedin", "twitter", "spotify", "nvidia", "intel", "qualcomm", "cisco", "oracle", "sap", "ibm", "peernova", "sharethrough", "vizient", "roofstock", "vindicia"], label: "科技公司" },
  { keywords: ["goldman sachs", "jpmorgan", "morgan stanley", "bank of america", "merrill lynch", "citigroup", "blackrock", "capital one", "mufg", "jpmc", "wells fargo", "barclays", "ubs", "credit suisse", "fidelity", "vanguard", "navigant", "aaa", "caipital"], label: "金融公司" },
  { keywords: ["mckinsey", "bcg", "bain", "deloitte", "accenture", "kpmg", "pwc", "ey", "a.t. kearney", "kearney", "ihs", "celebrity consulting"], label: "咨询公司" },
  { keywords: ["salesforce", "adobe", "sap", "workday", "servicenow"], label: "企业软件" },
  { keywords: ["unitedhealth", "unitedhealthcare", "aetna", "cigna", "humana", "blue cross", "aamc", "barron lighting"], label: "医疗健康" },
  { keywords: ["kimberly-clark", "kotex", "p&g", "unilever", "budweiser", "ab inbev", "百威"], label: "快消品牌" },
  { keywords: ["agency", "广告", "ogilvy", "bbdo", "ddb", "wpp", "publicis", "dentsu"], label: "广告 agency" },
  { keywords: ["xerox", "bosch", "tesla", "ge", "honeywell", "space system loral", "loral"], label: "工业/制造" },
  { keywords: ["aol", "yahoo", "iheartmedia", "fox entertainment", "fox"], label: "媒体/互联网" },
  { keywords: ["freelance", "freelancer", "自创", "创始人", "founder", "startup", "创业"], label: "创业/独立" },
];

function getIndustryLabel(companyName) {
  const lower = (companyName || "").toLowerCase();
  for (const { keywords, label } of INDUSTRY_MAP) {
    if (keywords.some((k) => lower.includes(k))) return label;
  }
  return null;
}

function extractCareerPathDisplay(mentor) {
  const careerText = (mentor.career_path || "").replace(/\s+/g, " ").trim();
  const currentCompany = (mentor.company || "").trim();

  if (!careerText && !currentCompany) return null;

  // Collect all known companies mentioned in career_path (in order of appearance)
  const allCompanies = KNOWN_COMPANIES.concat(currentCompany ? [currentCompany] : []);
  const mentioned = [];

  for (const co of allCompanies) {
    if (!co) continue;
    const idx = careerText.toLowerCase().indexOf(co.toLowerCase());
    if (idx !== -1 && !mentioned.some((m) => m.name.toLowerCase() === co.toLowerCase())) {
      mentioned.push({ name: co, idx });
    }
  }

  // Sort by order of mention (chronological in most bios)
  mentioned.sort((a, b) => a.idx - b.idx);

  // Limit to 4 stops
  const stops = mentioned.slice(0, 4);

  // If current company not already in list, append it
  if (currentCompany && currentCompany.toLowerCase() !== "freelancer") {
    const alreadyIn = stops.some((s) => s.name.toLowerCase() === currentCompany.toLowerCase());
    if (!alreadyIn) stops.push({ name: currentCompany, idx: Infinity });
  }

  if (stops.length === 0) {
    // Fallback: just show title@company
    return currentCompany ? `${currentCompany}（现）` : null;
  }

  // Build display segments
  const segments = stops.map((s, i) => {
    const isLast = i === stops.length - 1;
    const label = getIndustryLabel(s.name);
    const tag = isLast && currentCompany && s.name.toLowerCase() === currentCompany.toLowerCase() ? "（现）" : "";
    return label ? `${label}（${s.name}）${tag}` : `${s.name}${tag}`;
  });

  return segments.join(" → ");
}

// ── Step 3: populate mentors.career_keywords_json + career_path_display ──────

const mentors = db.prepare("SELECT * FROM mentors").all();
const updateMentor = db.prepare(
  "UPDATE mentors SET career_keywords_json = ?, career_path_display = ? WHERE id = ?"
);

let mentorCount = 0;
for (const m of mentors) {
  if (!m.career_path && !m.title && !m.company) continue;
  const kws = extractKeywords(m);
  const display = extractCareerPathDisplay(m);
  updateMentor.run(JSON.stringify(kws), display, m.id);
  mentorCount++;
}
console.log(`[migrate] Updated ${mentorCount} mentors with career_keywords_json + career_path_display`);

// Sample check
const sample = db
  .prepare("SELECT name, title, company, career_keywords_json, career_path_display FROM mentors WHERE career_path_display IS NOT NULL LIMIT 8")
  .all();
console.log("[migrate] Sample mentor career_path_display:");
for (const r of sample) {
  console.log(`  ${r.name} @ ${r.company}`);
  console.log(`    path: ${r.career_path_display}`);
  console.log(`    kws:  ${r.career_keywords_json}`);
}

// ── Step 4: populate segments.mentor_title + mentor_career_keywords + mentor_career_path_display ──

const updateSegment = db.prepare(
  "UPDATE segments SET mentor_title = ?, mentor_career_keywords = ?, mentor_career_path_display = ?, mentor_company = ? WHERE session_id = ?"
);

// Build session_id → mentor info map
const sessionRows = db.prepare(`
  SELECT ss.id AS session_id, m.title, m.company, m.career_keywords_json, m.career_path_display
  FROM sessions ss
  JOIN mentors m ON ss.mentor_id = m.id
  WHERE m.company IS NOT NULL OR m.title IS NOT NULL OR m.career_keywords_json IS NOT NULL
`).all();

const sessionMap = new Map();
for (const row of sessionRows) {
  sessionMap.set(row.session_id, {
    title: row.title,
    company: row.company,
    career_keywords_json: row.career_keywords_json,
    career_path_display: row.career_path_display,
  });
}

let segCount = 0;
const segSessions = db.prepare("SELECT DISTINCT session_id FROM segments WHERE session_id IS NOT NULL").all();
for (const { session_id } of segSessions) {
  const meta = sessionMap.get(session_id);
  if (!meta) continue;
  updateSegment.run(meta.title || null, meta.career_keywords_json || null, meta.career_path_display || null, meta.company || null, session_id);
  segCount++;
}
console.log(`[migrate] Updated segments for ${segCount} sessions`);

// Sample check
const segSample = db.prepare(`
  SELECT mentor_name, mentor_title, mentor_career_keywords
  FROM segments
  WHERE mentor_title IS NOT NULL
  LIMIT 6
`).all();
console.log("[migrate] Sample segment mentor meta:");
for (const r of segSample) {
  console.log(`  ${r.mentor_name} | ${r.mentor_title} | ${r.mentor_career_keywords}`);
}

db.close();
console.log("[migrate] Done. Restart server to pick up new columns.");
