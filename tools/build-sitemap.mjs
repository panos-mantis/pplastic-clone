/* ===========================================================
   pplastic — sitemap generator
   Emits sitemap.xml with every page in both languages, each URL
   carrying xhtml:link alternates so Google sees the EN/EL pairing
   from the sitemap as well as from the page <head>.

   Run:  node tools/build-sitemap.mjs
   =========================================================== */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Single source of truth, shared with the Eleventy build.
const SITE = (await import("../src/_data/site.mjs")).default.url;
const META = require(path.join(ROOT, "tools", "meta.el.json"));

const TODAY = new Date().toISOString().slice(0, 10);

/* page -> changefreq, priority. 404 is noindex, so it is excluded. */
const RANK = {
  "index.html":       ["monthly", "1.0"],
  "marine.html":      ["monthly", "0.9"],
  "technical.html":   ["monthly", "0.9"],
  "rub-rails.html":   ["monthly", "0.8"],
  "inflatable.html":  ["monthly", "0.8"],
  "heavy-duty.html":  ["monthly", "0.8"],
  "various.html":     ["monthly", "0.8"],
  "catalogue.html":   ["monthly", "0.8"],
  "contact.html":     ["yearly",  "0.7"],
  "about.html":       ["yearly",  "0.6"],
  "exhibitions.html": ["monthly", "0.5"],
  "privacy.html":     ["yearly",  "0.2"],
};

const urlFor = (file, lang) => {
  const base = lang === "el" ? SITE + "/el/" : SITE + "/";
  return file === "index.html" ? base : base + file;
};

const pages = Object.keys(META).filter((k) => !k.startsWith("_") && k !== "404.html");
const missing = pages.filter((p) => !RANK[p]);
if (missing.length) { console.error("No ranking for: " + missing.join(", ")); process.exit(1); }

const out = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
  '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  "",
];

for (const file of pages) {
  const [freq, prio] = RANK[file];
  for (const lang of ["en", "el"]) {
    out.push("  <url>");
    out.push("    <loc>" + urlFor(file, lang) + "</loc>");
    out.push('    <xhtml:link rel="alternate" hreflang="en" href="' + urlFor(file, "en") + '"/>');
    out.push('    <xhtml:link rel="alternate" hreflang="el" href="' + urlFor(file, "el") + '"/>');
    out.push('    <xhtml:link rel="alternate" hreflang="x-default" href="' + urlFor(file, "en") + '"/>');
    out.push("    <lastmod>" + TODAY + "</lastmod>");
    out.push("    <changefreq>" + freq + "</changefreq>");
    out.push("    <priority>" + prio + "</priority>");
    out.push("  </url>");
    out.push("");
  }
}

/* the catalogue PDF is a single language-neutral asset */
out.push("  <url>");
out.push("    <loc>" + SITE + "/assets/docs/pplastic-catalogue-2026.pdf</loc>");
out.push("    <lastmod>" + TODAY + "</lastmod>");
out.push("    <changefreq>yearly</changefreq>");
out.push("    <priority>0.6</priority>");
out.push("  </url>");
out.push("");
out.push("</urlset>");
out.push("");

fs.writeFileSync(path.join(ROOT, "_site", "sitemap.xml"), out.join("\n"));
console.log("sitemap.xml: " + (pages.length * 2 + 1) + " URLs (" + pages.length + " pages x 2 languages + 1 PDF)");
