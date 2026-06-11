"use strict";
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "../public/logos");

const LOGOS = [
  // From mentor DB — missing companies
  { name: "LinkedIn",              domain: "linkedin.com" },
  { name: "Broadcom",              domain: "broadcom.com" },
  { name: "Wells Fargo",           domain: "wellsfargo.com" },
  { name: "Visa",                  domain: "visa.com" },
  { name: "UBS",                   domain: "ubs.com" },
  { name: "Pimco",                 domain: "pimco.com" },
  { name: "Credit Suisse",         domain: "credit-suisse.com" },
  { name: "Roblox",                domain: "roblox.com" },
  { name: "eBay",                  domain: "ebay.com" },
  { name: "Yelp",                  domain: "yelp.com" },
  { name: "Western Digital",       domain: "westerndigital.com" },
  { name: "Compass",               domain: "compass.com" },
  { name: "IQVIA",                 domain: "iqvia.com" },
  { name: "Netflix",               domain: "netflix.com" },
  { name: "Stripe",                domain: "stripe.com" },
  { name: "Lyft",                  domain: "lyft.com" },
  { name: "Airbnb",                domain: "airbnb.com" },
  { name: "Palantir",              domain: "palantir.com" },
  { name: "Databricks",            domain: "databricks.com" },
  { name: "Workday",               domain: "workday.com" },
  { name: "ServiceNow",            domain: "servicenow.com" },
  { name: "Atlassian",             domain: "atlassian.com" },
  { name: "Zoom",                  domain: "zoom.us" },
  { name: "Slack",                 domain: "slack.com" },
  { name: "Twitter",               domain: "twitter.com" },
  { name: "Pinterest",             domain: "pinterest.com" },
  { name: "Coinbase",              domain: "coinbase.com" },
  { name: "DoorDash",              domain: "doordash.com" },
  { name: "Instacart",             domain: "instacart.com" },
  { name: "Square",                domain: "squareup.com" },
  { name: "Rivian",                domain: "rivian.com" },
  { name: "Waymo",                 domain: "waymo.com" },
  { name: "Lockheed Martin",       domain: "lockheedmartin.com" },
  { name: "Raytheon",              domain: "raytheon.com" },
  { name: "Boeing",                domain: "boeing.com" },
  { name: "Northrop Grumman",      domain: "northropgrumman.com" },
  { name: "Medtronic",             domain: "medtronic.com" },
  { name: "Abbott",                domain: "abbott.com" },
  { name: "Pfizer",                domain: "pfizer.com" },
  { name: "Eli Lilly",             domain: "lilly.com" },
  { name: "Genentech",             domain: "gene.com" },
  { name: "Gilead",                domain: "gilead.com" },
  { name: "Verizon",               domain: "verizon.com" },
  { name: "T-Mobile",              domain: "t-mobile.com" },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    const req = lib.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on("finish", () => { file.close(); resolve(); });
    });
    req.on("error", (err) => { fs.unlinkSync(dest); reject(err); });
    req.setTimeout(10000, () => { req.destroy(); reject(new Error("timeout")); });
  });
}

async function main() {
  const ok = [], fail = [], skip = [];
  for (const { name, domain } of LOGOS) {
    const dest = path.join(OUT_DIR, `${name}.png`);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      skip.push(name);
      continue;
    }
    const url = `https://logo.clearbit.com/${domain}`;
    try {
      await download(url, dest);
      console.log(`✓ ${name}`);
      ok.push(name);
    } catch (e) {
      console.log(`✗ ${name} — ${e.message}`);
      fail.push(name);
    }
  }
  console.log(`\nDone: ${ok.length} downloaded, ${skip.length} skipped, ${fail.length} failed`);
  if (fail.length) console.log("Failed:", fail.join(", "));
}

main();
