# pplastic — Website Improvement Roadmap

Working notes for the modern clone of **pplastic** (Papadopoulos Plastic Profiles S.A.).
Live folder: `pplastic-clone/` — open `index.html` via Live Server (port 5500).

Status legend: ✅ done · 🟡 partly done · ⬜ not started

---

## Current state (updated 2026-09-21)

- ✅ Modern responsive site, 11 pages (home, about, marine + 4 sub-pages, technical,
  exhibitions, catalogue, contact).
- ✅ **Visual redesign (Sept 2026):** new header/nav, Manrope display font (supports Greek),
  SVG icons instead of emoji, photo frames sized for our low-res images, dark stats band,
  side-by-side CTA bands, contact page with icon list + map link.
- ✅ Real contact details (address, tel, fax, email, hours, contact persons).
- ✅ Contact form sends via **EmailJS** (translated status messages, honeypot, pinned SDK).
- ✅ EN / ΕΛ toggle via `js/i18n.js` — every visible string, including dropdown items,
  breadcrumbs and form messages, exists in both languages.
- ✅ Per-page `<title>`, description, canonical, Open Graph/Twitter tags, SVG favicon.
- ✅ Accessibility basics: skip link, `<main>` landmark, focus-visible styles,
  `aria-expanded` on the menu toggle, Escape closes the menu, reduced-motion support.
- ✅ All product photos used (4 were sitting unused; the rolling-shutter photo
  was wrongly on the Rub rails page and now lives on Technical).
- ✅ Marine sub-pages carry the **original site's 16 profile drawings**, captions and real
  specs (materials, size ranges) from pplastic.gr/html/{rub_rails,inflatable,heavy_duty,various}.html.
- ✅ The real **2026 PDF catalogue** is in `assets/docs/` and downloadable from the
  Catalogue page and every marine sub-page.
- ⬜ High-resolution photography, trust signals, deeper product content, cookie/privacy.

### Fixed bugs from the previous version
- Header brand text overlapped the nav links; the page scrolled sideways below ~1230px
  (the EN/ΕΛ buttons were 140px wide each).
- Footer logo rendered as a white box (the global `img` fallback background painted
  behind the transparent PNG).
- Photos were shown at native 240px next to empty space, or stretched and pixelated.
- `exhibitions.html` pointed `og:image` at a file that doesn't exist; all `og:image`
  URLs were relative (social platforms ignore those).
- "Rub rails" was untranslated in Greek → now "Προστατευτικά κουπαστής".

### How the pages are built
Header and footer are **copied into every HTML file**. If you change the nav, change it
in all 11 pages (or see #9 below). Shared behaviour lives in `js/main.js`
(mobile menu, header shadow, scroll-reveal); translations in `js/i18n.js`.

---

## Remaining work

### 1. High-resolution photography  ·  Priority: HIGH  ·  🟡
- **Why:** Every photo we have is **240×180 px**. The layout now keeps them small
  (framed photos max ~400px, cards, a stacked "prints" hero) so they don't look broken,
  but they can't go full-width and look soft on retina screens.
- **Do:** Get originals or reshoot — factory, extrusion lines, product cross-sections.
  Export WebP ~1600px wide, <200KB. Swap files in `assets/images/` (same names = no
  HTML changes) and then the `.photo` max-width can grow.
- **Still placeholder:** Exhibitions (`.media-ph` block) — a stand/booth photo is ideal.

### 2. Contact form hardening  ·  Priority: HIGH  ·  🟡
- ✅ Sends via EmailJS; honeypot field; button disabled while sending; messages in EN/ΕΛ;
  phone is now optional (fewer required fields = more enquiries).
- ⬜ **Send one real test from the live domain** and confirm it reaches the inbox.
- ⬜ In the EmailJS dashboard, restrict allowed origins to `pplastic.gr` (the public key
  is visible in the page source, which is normal for EmailJS, so origin-locking matters).
- ⬜ The `emailjs-com` package is deprecated → migrate to `@emailjs/browser` when convenient.

### 3. Official logo  ·  Priority: MEDIUM  ·  🟡
- An interim SVG mark (the bracket icon from the old PNG) is used in the header, footer
  and favicon — crisp at any size and visible on light backgrounds.
- ⬜ Get the **official vector logo** from the company and replace the inline `<svg>` in
  header/footer + `assets/images/favicon.svg`. `pplastic-white.png` is no longer used.

### 4. SEO follow-ups  ·  Priority: MEDIUM  ·  🟡
- ✅ Unique meta per page, canonical URLs, absolute OG image URLs, favicon.
- ⬜ OG images are 240×180 — link previews will be small. Make one 1200×630 share image.
- ⬜ Add `sitemap.xml` + `robots.txt`.
- ⬜ Greek pages can't be indexed separately: the language switch is client-side, so
  Google only sees English. Real Greek SEO needs separate URLs (e.g. `/el/…`) + `hreflang`.

### 5. Trust signals  ·  Priority: MEDIUM  ·  ⬜
- Stats band no longer shows "∞ applications" / "100% quality" (vague claims read as filler).
  It now shows 1962 · 60+ years · 4 marine ranges · 1:1 sample matching.
- ⬜ Add ISO/quality certifications, client logos or a short testimonial **only if real
  and approved** — false claims are worse than none.
- ⬜ **Confirm** the new home hero facts are accurate: "Family-run since 1962",
  "Made in Athens, Greece", "Custom profiles to drawing".

### 6. Deepen thin pages  ·  Priority: MEDIUM  ·  🟡
- ✅ Marine sub-pages: real spec lines + 4 dimensioned profile drawings each (from the
  original site); Technical has an applications gallery; Exhibitions has a "how to meet
  us" section.
- ⬜ Full spec tables per profile (hardness, colours, exact dimensions) — the PDF catalogue
  has more detail that could be brought onto the pages.
- ⬜ Exhibitions calendar (show, dates, city, stand number).
- ✅ Downloadable PDF catalogue.

### 7. Polish  ·  Priority: LOW  ·  🟡
- ✅ Lazy-loaded images, scroll-reveal, focus states, skip link, sticky header shadow,
  "Contact us" as a pill button in the nav.
- ⬜ Optional: sticky "Contact us" bar on mobile if analytics show people don't find it.

### 8. Legal / compliance (EU)  ·  Priority: MEDIUM before launch  ·  ⬜
- ⬜ Privacy notice page — the contact form sends personal data through EmailJS
  (a third-party processor), so this is needed, with a link under the form.
- ⬜ **Self-host the fonts** (Inter, Manrope) instead of loading from Google Fonts —
  EU courts have ruled that Google Fonts leaks visitor IPs without consent. Self-hosting
  may remove the need for a cookie banner entirely (the site sets no cookies itself).

### 9. Maintainability  ·  Priority: LOW  ·  ⬜
- Header/footer are duplicated in 11 files. If pages keep growing, move to a tiny static
  site generator (e.g. Eleventy) with one shared layout — same HTML output, one place to edit.

---

## Suggested sequence

| Order | Item | Rationale |
|------|------|-----------|
| 1 | #2 Test the form on the live domain + origin lock | Enquiries are the whole point. |
| 2 | #8 Privacy page + self-hosted fonts | Required before going live in the EU. |
| 3 | #1 High-res photography | Biggest remaining visual/credibility gain. |
| 4 | #3 Official logo + #4 share image & sitemap | Quick polish once assets exist. |
| 5 | #5 + #6 Trust signals & real specs | Needs material from the company. |
| 6 | #9 Shared layout | Only if the site keeps growing. |

---

## Open questions

- Do you have a photo library (factory, products, team)? Or should we shoot/stock-source?
- Any certifications (ISO 9001, etc.) we're cleared to show?
- Are the home hero facts and stats accurate as written (see #5)?
- Should Greek get its own URLs for search, or is the toggle enough for now?

---

## File map

```
pplastic-clone/
├── index.html            # home
├── about.html
├── marine.html
├── rub-rails.html        # marine sub-pages
├── inflatable.html
├── heavy-duty.html
├── various.html
├── technical.html
├── exhibitions.html
├── catalogue.html
├── contact.html          # EmailJS form script at the bottom
├── css/style.css         # design tokens at the top (:root)
├── js/i18n.js            # EN/ΕΛ dictionary + toggle + window.pplasticT()
├── js/main.js            # mobile menu, header shadow, scroll-reveal
├── assets/images/        # product photos + profile drawings (all 240×180), favicon.svg, old logo PNG
└── assets/docs/          # pplastic-catalogue-2026.pdf
```
