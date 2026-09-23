# pplastic — Website Improvement Roadmap

Working notes for the modern clone of **pplastic** (Papadopoulos Plastic Profiles S.A.).

**What this is right now:** a demonstration build, used to show the work to someone
considering a site of their own. It is not live on a real domain, and `pplastic.gr`
is not ours. Staging: <https://panos-mantis.github.io/pplastic-clone/>

Status legend: ✅ done · 🟡 partly done · ⬜ not started · ⛔ blocked on material we don't have

---

## Running it

The site is built with [Eleventy](https://www.11ty.dev/). There is no longer any
HTML at the repo root — it is generated.

```bash
npm install
npm run serve      # local dev server with live reload
npm run build      # full build into _site/
```

`npm run build` runs three steps in order:

1. `eleventy` — renders the English pages from `src/` into `_site/`
2. `tools/build-el.mjs` — generates `_site/el/` from that English output
3. `tools/build-sitemap.mjs` — writes `_site/sitemap.xml`

Step 2 **exits non-zero on any string it cannot translate**, so a missed
translation fails the build rather than shipping English text onto a Greek page.
Two build steps are run by hand and their output is committed, because they need
assets or network access that the deploy should not depend on:

```bash
npm run build:fonts   # re-download the web fonts
npm run build:og      # regenerate the share cards (needs TTFs, see tools/build-og.mjs)
```

### Where to edit what

| To change | Edit |
| --- | --- |
| English page copy or structure | `src/<page>.njk` — the page's `<main>` plus front matter |
| Header, footer, nav, `<head>` | `src/_includes/layouts/base.njk` — one file, all pages |
| Domain, email, phone, address | `src/_data/site.mjs` |
| Greek body copy | the `el` block in `js/i18n-data.js` |
| Greek titles / meta descriptions | `tools/meta.el.json` |
| Greek image alt text | `tools/alts.el.json` |
| Styling | `css/style.css` — design tokens in `:root` at the top |

Never edit `_site/` — every build overwrites it.

---

## Current state (updated 2026-09-23)

- ✅ Modern responsive site, **12 pages** (home, about, marine + 4 sub-pages, technical,
  exhibitions, catalogue, contact, privacy), each in English and Greek.
- ✅ **Built from one shared layout.** Header and footer used to be copy-pasted into
  11 files; they now live in `base.njk`. Verified byte-identical output across the
  migration.
- ✅ **Separate Greek URLs**, pre-rendered at `/el/`, with reciprocal `hreflang`.
  Nothing is translated in the browser, so crawlers see real Greek HTML.
- ✅ `sitemap.xml` (25 URLs), `robots.txt`, `404.html` in both languages.
- ✅ **Self-hosted fonts** — no third-party request on any page.
- ✅ **1200×630 share card** in both languages, so a pasted link renders full-width.
- ✅ **Sticky quick-contact bar** on phones (call · email · enquiry).
- ✅ Real material property table on Technical, taken from the 2026 PDF catalogue.
- ✅ Privacy notice in both languages, linked from the footer.
- ✅ Real contact details, EmailJS contact form, per-page structured data.
- ✅ Accessibility basics: skip link, landmarks, focus-visible, `aria-expanded`,
  Escape closes the menu, reduced-motion support.
- ⬜ High-resolution photography, official logo, trust signals, per-profile specs.

### How the pages are built

`src/<page>.njk` holds only that page's `<main>` content plus front matter (title,
description, JSON-LD). Everything shared is rendered by `src/_includes/layouts/base.njk`.
Runtime behaviour lives in `js/main.js`; `js/i18n.js` now only exposes `pplasticT()`
for the few strings scripts build at runtime.

---

## Remaining work

### 1. High-resolution photography · Priority: HIGH · 🟡
- **Why:** every photo is **240×180 px**. The layout deliberately keeps them small
  (framed photos max ~400px) so they never look stretched, but they cannot go
  full-bleed and look soft on retina screens.
- **Decision:** design around it for now — the current layout does exactly that.
- **Do, when real photos exist:** factory, extrusion lines, product cross-sections.
  Export WebP ~1600px wide, <200KB, same filenames as today so no markup changes.
- **Still a placeholder:** Exhibitions (`.media-ph` block) — a stand photo is ideal.

### 2. Contact form hardening · Priority: HIGH (before any real launch) · 🟡
- ✅ EmailJS, honeypot, button disabled while sending, EN/ΕΛ status messages,
  phone optional.
- ⬜ **Send one real test from the live domain** and confirm it arrives.
- ⬜ Origin-lock the EmailJS key to the real domain. The public key is visible in
  page source — normal for EmailJS, which is exactly why the origin lock matters.
- ⬜ `emailjs-com` is deprecated → migrate to `@emailjs/browser`.
- Note: all three need a real domain and the company's EmailJS account, so none of
  them can be done on this demo build.

### 3. Official logo · Priority: MEDIUM · 🟡
- An interim SVG mark (the bracket glyph from the old PNG) is used in the header,
  footer, favicon and share card — crisp at any size.
- ⬜ Swap in the company's real vector logo: the inline `<svg>` in `base.njk`,
  `assets/images/favicon.svg`, and the mark in `tools/build-og.mjs`.

### 4. SEO · Priority: — · ✅ done
- ✅ Unique meta per page, canonicals, absolute OG URLs, favicon.
- ✅ `sitemap.xml` + `robots.txt`.
- ✅ Greek indexed separately: real `/el/` URLs + reciprocal `hreflang`.
- ✅ 1200×630 share image per language, `twitter:card=summary_large_image`.

### 5. Trust signals · Priority: MEDIUM · ⛔
- Stats band shows 1962 · 60+ years · 4 marine ranges · 1:1 sample matching.
- ⛔ ISO/quality certifications, client logos, testimonials — **only if real and
  approved**. Inventing these is worse than having none, so this is blocked until
  the company supplies them.
- ⬜ **Confirm** the home hero facts are accurate: "Family-run since 1962",
  "Made in Athens, Greece", "Custom profiles to drawing".

### 6. Deepen thin pages · Priority: MEDIUM · 🟡
- ✅ Marine sub-pages: real spec lines + 4 dimensioned drawings each.
- ✅ **Raw material properties table** on Technical — specific gravity, Shore A
  hardness, tensile strength, elongation, for all three compounds. Taken from the
  2026 catalogue PDF, localised down to the decimal separator.
- ⛔ Per-profile spec tables (weight/m, ordering quantity, exact dimensions). The
  data is in the PDF but its text layers overlap, so extraction produces garbled
  numbers like `00,8,95500 kkiliolo`. Needs the source spreadsheet, or careful
  manual transcription — **not** guesswork, since these are real order figures.
- ⛔ Exhibitions calendar (show, dates, city, stand number). We have no real show
  dates. The page currently says "get in touch for our upcoming schedule", which is
  honest; a fabricated calendar for a real company would be worse than none.

### 7. Polish · Priority: LOW · 🟡
- ✅ Lazy-loaded images, scroll-reveal, focus states, skip link, sticky header shadow.
- ✅ Sticky quick-contact bar on phones.
- ⬜ Optional: hide the bar on scroll-down / reveal on scroll-up, if it feels heavy.

### 8. Legal / compliance (EU) · Priority: MEDIUM before launch · 🟡
- ✅ Privacy notice in both languages, linked in the footer.
- ✅ **Fonts self-hosted** — EU courts have ruled that Google Fonts leaks visitor
  IPs without consent. The site sets no cookies and loads no trackers, so it needs
  no cookie banner.
- ⬜ The privacy wording is drawn from what the site actually does, but it has **not
  been reviewed by a lawyer**. Before a real launch, it should be.

### 9. Maintainability · Priority: — · ✅ done
- ✅ Eleventy with one shared layout. The migration removed ~3,400 lines of
  duplicated markup and was verified to produce identical output.

---

## Suggested sequence

Ordered for the current goal — a demo that has to look and feel finished. A real
launch would put #2 and #8 first instead.

| Order | Item | Rationale |
|------|------|-----------|
| 1 | #1 Photography | By far the biggest remaining visual gain, and the only thing that still reads as unfinished. Blocked on real images. |
| 2 | #3 Official logo | Cheap once the asset exists; the interim mark is decent but generic. |
| 3 | #5 Confirm hero facts | Costs nothing, and removes the risk of stating something untrue. |
| 4 | #6 Per-profile specs | Real depth, but needs clean source data. |
| 5 | #2 + #8 Form test, origin lock, legal review | Only meaningful against a real domain. |

## Open questions

- Is there a photo library (factory, products, team), or should we shoot/stock-source?
- Any certifications (ISO 9001, etc.) we are cleared to show?
- Are the home hero facts and stats accurate as written (see #5)?
- Is there a spreadsheet behind the catalogue PDF, with the per-profile weights and
  ordering quantities in machine-readable form?

---

## File map

```
pplastic-clone/
├── src/
│   ├── *.njk                  # 12 pages: front matter + <main> only
│   ├── _includes/layouts/
│   │   └── base.njk           # the shell — head, header, footer, mobile bar
│   └── _data/site.mjs         # domain, email, phone, address
├── css/
│   ├── style.css              # design tokens in :root at the top
│   └── fonts.css              # generated by tools/fetch-fonts.mjs
├── js/
│   ├── i18n-data.js           # EN/ΕΛ table — source of truth for both languages
│   ├── i18n.js                # pplasticT() for runtime strings only
│   └── main.js                # mobile menu, header shadow, scroll-reveal
├── tools/
│   ├── build-el.mjs           # generates _site/el/ ; fails on missing translations
│   ├── build-sitemap.mjs      # generates _site/sitemap.xml
│   ├── fetch-fonts.mjs        # downloads the web fonts (run by hand)
│   ├── build-og.mjs           # generates the share cards (run by hand)
│   ├── meta.el.json           # Greek <head> strings per page
│   └── alts.el.json           # Greek image alt text
├── assets/
│   ├── images/                # product photos (240×180), drawings, share cards
│   ├── fonts/                 # self-hosted woff2
│   └── docs/                  # pplastic-catalogue-2026.pdf
├── eleventy.config.mjs
└── _site/                     # build output — generated, not committed
```
