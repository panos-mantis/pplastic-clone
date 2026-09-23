/* ===========================================================
   pplastic — Greek page generator
   Reads the English pages Eleventy has just written into _site/
   and writes fully pre-rendered Greek copies into _site/el/, so
   Greek content has its own crawlable URLs. Also stamps reciprocal
   hreflang tags and a real <a> language switcher onto BOTH languages.

   Source of truth:
     - body copy .......... js/i18n-data.js  (el table)
     - <head> metadata .... tools/meta.el.json
     - page structure ..... Eleventy's English output in _site/

   Run:  npm run build   (eleventy first, then this)
   Safe to re-run; it is idempotent. Exits non-zero on any string
   it cannot translate, so a missed translation fails the build
   rather than shipping English text onto a Greek page.
   =========================================================== */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Single source of truth, shared with the Eleventy build.
const SITE = (await import("../src/_data/site.mjs")).default.url;
// Eleventy has already written the English pages here; /el/ is generated
// alongside them, so the whole site ships from one directory.
const BUILD = path.join(ROOT, "_site");
const OUT_DIR = path.join(BUILD, "el");

const I18N = require(path.join(ROOT, "js", "i18n-data.js"));
const META = require(path.join(ROOT, "tools", "meta.el.json"));
const ALTS = require(path.join(ROOT, "tools", "alts.el.json"));

const PAGES = Object.keys(META).filter((k) => !k.startsWith("_"));
const VOID_TAGS = new Set(["input", "img", "br", "hr", "meta", "link"]);

let warnings = 0;
const warn = (msg) => { warnings++; console.warn("  ! " + msg); };

/* ---------- public URL for a page, per language ---------- */
function urlFor(file, lang) {
  const base = lang === "el" ? SITE + "/el/" : SITE + "/";
  return file === "index.html" ? base : base + file;
}

/* ---------- find every element carrying data-i18n ---------- */
function findI18nTags(html) {
  const tags = [];
  const re = /data-i18n="([^"]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    const open = html.lastIndexOf("<", m.index);
    const close = html.indexOf(">", m.index);
    if (open === -1 || close === -1) { warn('unparseable tag near "' + m[1] + '"'); continue; }
    const name = /^<([a-zA-Z][\w-]*)/.exec(html.slice(open, open + 40));
    if (!name) { warn('no tag name for "' + m[1] + '"'); continue; }
    // guard: a '>' inside an attribute value would desync this scan
    const attrs = html.slice(open, close);
    if ((attrs.match(/"/g) || []).length % 2 !== 0) { warn('unbalanced quotes near "' + m[1] + '"'); continue; }
    tags.push({ key: m[1], open, close, tag: name[1].toLowerCase() });
  }
  return tags;
}

/* ---------- locate the closing tag, honouring nesting ---------- */
function findClose(html, tag, from) {
  const re = new RegExp("<(/?)" + tag + "\\b", "gi");
  re.lastIndex = from;
  let depth = 1, m;
  while ((m = re.exec(html))) {
    if (m[1] === "/") { if (--depth === 0) return m.index; }
    else depth++;
  }
  return -1;
}

/* Two different kinds of string flow through this script:
   - js/i18n-data.js values are HTML fragments (they carry <em>, <br>, &amp;)
     and are inserted verbatim, exactly as the old innerHTML runtime did.
   - tools/meta.el.json and tools/alts.el.json are plain text and must be
     escaped on the way into HTML. JSON-LD is raw text inside <script>, so it
     takes the plain, unescaped form. */
const escFragmentAttr = (s) => s.replace(/"/g, "&quot;");
const escText = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escTextAttr = (s) => escText(s).replace(/"/g, "&quot;");

/* ---------- swap every translatable string to Greek ---------- */
function translateBody(html, table) {
  const tags = findI18nTags(html);
  let applied = 0;
  // walk backwards so earlier offsets stay valid
  for (let i = tags.length - 1; i >= 0; i--) {
    const { key, open, close, tag } = tags[i];
    const value = table[key];
    if (value == null) { warn('no Greek string for "' + key + '"'); continue; }

    if (tag === "input" || tag === "textarea") {
      const openTag = html.slice(open, close + 1);
      if (!/placeholder="/.test(openTag)) { warn('"' + key + '" on <' + tag + '> without placeholder'); continue; }
      const swapped = openTag.replace(/placeholder="[^"]*"/, 'placeholder="' + escFragmentAttr(value) + '"');
      html = html.slice(0, open) + swapped + html.slice(close + 1);
      applied++;
      continue;
    }
    if (VOID_TAGS.has(tag)) { warn('"' + key + '" on void <' + tag + ">"); continue; }

    const closeIdx = findClose(html, tag, close + 1);
    if (closeIdx === -1) { warn("no </" + tag + '> for "' + key + '"'); continue; }
    html = html.slice(0, close + 1) + value + html.slice(closeIdx);
    applied++;
  }
  return { html, applied, total: tags.length };
}

/* ---------- <head> metadata ---------- */
function setMeta(html, selector, value) {
  const re = new RegExp("(<meta\\s+" + selector + "\\s+content=\")[^\"]*(\">)");
  if (!re.test(html)) return html;
  return html.replace(re, "$1" + escTextAttr(value) + "$2");
}

function rewriteHead(html, file, meta) {
  const elUrl = urlFor(file, "el");
  html = html.replace(/<title>[\s\S]*?<\/title>/, "<title>" + escText(meta.title) + "</title>");
  html = setMeta(html, 'name="description"', meta.description);
  html = setMeta(html, 'property="og:title"', meta.title);
  html = setMeta(html, 'property="og:description"', meta.description);
  html = setMeta(html, 'name="twitter:title"', meta.title);
  html = setMeta(html, 'name="twitter:description"', meta.description);
  html = setMeta(html, 'property="og:locale"', "el_GR");

  // The share card carries text, so Greek pages need the Greek rendering of it.
  html = html.replace(/og-cover\.png/g, "og-cover-el.png");
  const coverAlt = META._coverAlt || meta.imageAlt;
  if (coverAlt) {
    html = setMeta(html, 'property="og:image:alt"', coverAlt);
    html = setMeta(html, 'name="twitter:image:alt"', coverAlt);
  }
  html = setMeta(html, 'property="og:url"', elUrl);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(">)/, "$1" + elUrl + "$2");
  return html;
}

/* ---------- reciprocal hreflang ---------- */
function hreflangFor(file) {
  return [
    '  <link rel="alternate" hreflang="en" href="' + urlFor(file, "en") + '">',
    '  <link rel="alternate" hreflang="el" href="' + urlFor(file, "el") + '">',
    '  <link rel="alternate" hreflang="x-default" href="' + urlFor(file, "en") + '">',
  ].join("\n");
}

function setHreflang(html, file, enabled) {
  // strip any previous block first so re-runs stay clean
  html = html.replace(/\n?[ \t]*<link rel="alternate" hreflang="[^"]*"[^>]*>/g, "");
  if (!enabled) return html;
  return html.replace(/(<link rel="canonical" href="[^"]*">)/, "$1\n" + hreflangFor(file));
}

/* ---------- language switcher as real links ---------- */
function switcherFor(file, lang) {
  const enHref = lang === "el" ? "../" + file : file;
  const elHref = lang === "el" ? file : "el/" + file;
  const cur = (l) => (l === lang ? ' aria-current="true"' : "");
  const act = (l) => (l === lang ? " active" : "");
  return [
    '<li class="lang-switch" role="group" aria-label="Language">',
    '            <a class="lang-btn' + act("en") + '" href="' + enHref + '" hreflang="en" lang="en"' + cur("en") + ">EN</a>",
    '            <a class="lang-btn' + act("el") + '" href="' + elHref + '" hreflang="el" lang="el"' + cur("el") + ">ΕΛ</a>",
    "          </li>",
  ].join("\n");
}

function setSwitcher(html, file, lang) {
  const re = /<li class="lang-switch"[\s\S]*?<\/li>/;
  if (!re.test(html)) { warn("no lang-switch block in " + file); return html; }
  return html.replace(re, switcherFor(file, lang));
}

/* ---------- JSON-LD ---------- */
function rewriteJsonLd(html, file, meta, org) {
  const re = /(<script type="application\/ld\+json">\n)([\s\S]*?)(\n\s*<\/script>)/;
  const m = html.match(re);
  if (!m) return html; // 404 has none
  let graph;
  try { graph = JSON.parse(m[2]); }
  catch (e) { warn("JSON-LD parse failed in " + file + ": " + e.message); return html; }

  const elUrl = urlFor(file, "el");
  for (const node of graph["@graph"]) {
    const type = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];

    if (type.includes("Organization")) {
      node.description = org.description;
      if (node.address) {
        node.address.streetAddress = org.streetAddress;
        node.address.addressLocality = org.addressLocality;
      }
      continue;
    }
    if (type.includes("WebSite")) {
      node.description = org.websiteDescription;
      continue;
    }
    if (type.includes("BreadcrumbList")) {
      node["@id"] = elUrl + "#breadcrumb";
      for (const item of node.itemListElement) {
        const leaf = item.item.replace(SITE + "/", "");
        item.item = urlFor(leaf === "" ? "index.html" : leaf, "el");
        const greek = greekCrumb(item.name);
        if (greek) item.name = greek;
        else warn('no Greek breadcrumb for "' + item.name + '"');
      }
      continue;
    }
    // the page node
    node["@id"] = elUrl + "#webpage";
    node.url = elUrl;
    node.name = meta.title;
    node.description = meta.description;
    node.inLanguage = "el";
    if (node.breadcrumb) node.breadcrumb["@id"] = elUrl + "#breadcrumb";
    if (node.primaryImageOfPage && meta.imageAlt) node.primaryImageOfPage.caption = meta.imageAlt;
  }

  const body = JSON.stringify(graph, null, 2)
    .split("\n").map((l) => "  " + l).join("\n");
  return html.replace(re, "$1" + body + "$3");
}

/* map an English breadcrumb label to Greek via the bc.* keys */
const CRUMB_KEYS = ["bc.home", "bc.about", "bc.marine", "bc.technical", "bc.exhibitions",
  "bc.catalogue", "bc.contact", "bc.rubrails", "bc.inflatable", "bc.heavyduty", "bc.various",
  "bc.privacy"];
function greekCrumb(english) {
  for (const k of CRUMB_KEYS) if (I18N.en[k] === english) return I18N.el[k];
  return null;
}

/* ---------- image alt text ---------- */
function translateAlts(html) {
  let translated = 0;
  html = html.replace(/alt="([^"]*)"/g, (whole, english) => {
    if (english === "") return whole; // decorative
    const greek = ALTS[english];
    if (greek == null) { warn('no Greek alt for "' + english + '"'); return whole; }
    translated++;
    return 'alt="' + escTextAttr(greek) + '"';
  });
  return { html, translated };
}

/* ---------- relative asset paths need one level up ---------- */
function fixAssetPaths(html) {
  return html.replace(/(href|src)="(css|js|assets)\//g, '$1="../$2/');
}

/* =========================== run =========================== */
fs.mkdirSync(OUT_DIR, { recursive: true });
console.log("Building Greek pages into /el/  (" + PAGES.length + " pages)\n");

for (const file of PAGES) {
  const srcPath = path.join(BUILD, file);
  if (!fs.existsSync(srcPath)) { warn("missing source " + file); continue; }
  const source = fs.readFileSync(srcPath, "utf8");
  const meta = META[file];
  const indexable = file !== "404.html";

  /* --- English page: hreflang + switcher, written back in place --- */
  let en = setHreflang(source, file, indexable);
  en = setSwitcher(en, file, "en");
  if (en !== source) fs.writeFileSync(srcPath, en);

  /* --- Greek page --- */
  let el = en.replace(/<html lang="en">/, '<html lang="el">');
  const out = translateBody(el, I18N.el);
  el = out.html;
  el = rewriteHead(el, file, meta);
  el = rewriteJsonLd(el, file, meta, META._org);
  el = setSwitcher(el, file, "el");
  const alt = translateAlts(el);
  el = alt.html;
  el = fixAssetPaths(el);

  fs.writeFileSync(path.join(OUT_DIR, file), el);
  console.log("  el/" + file.padEnd(18) + " " + String(out.applied + "/" + out.total).padEnd(8) +
    " strings, " + alt.translated + " alts");
}

console.log("\nDone. " + warnings + " warning(s).");
process.exit(warnings ? 1 : 0);
