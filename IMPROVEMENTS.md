# pplastic — Website Improvement Roadmap

Working notes for the modern clone of **pplastic** (Papadopoulos Plastic Profiles S.A.).
Live folder: `pplastic-clone/` — open `index.html` via Live Server (port 5500).

These are suggestions gathered during the redesign. They are **not** yet implemented
(except where noted). Use this file to pick up the work later.

---

## Current state (as of last session)

- ✅ Modern responsive clone built (11 pages: home, about, marine + 4 sub-pages,
  technical, exhibitions, catalogue, contact).
- ✅ Real contact details added (address, tel, fax, email, hours, contact persons).
- ✅ Image placeholders added to all text-only pages + global broken-image fallback.
- ✅ EN / ΕΛ in-page language toggle wired via `js/i18n.js` (preference saved in
  `localStorage`). All visible copy is translatable.
- ⬜ Real photography, working contact form, SEO/meta, logo, trust signals, etc.

---

## Suggestions (analyzed)

### 1. Real photography  ·  Priority: HIGH
- **Why:** For a B2B industrial manufacturer, photos are the single biggest trust
  signal. The current gradient placeholders communicate structure but not credibility.
  Buyers (boat builders, distributors) want to see the factory, extrusion lines, and
  real product cross-sections.
- **What's involved:** Replace each `.media-ph` panel and the 3 homepage product
  `<img>` with real photos. Keep the placeholder component as the fallback.
- **Effort:** Low–Medium (depending on how many photos you have). Main work is
  sourcing/shooting + exporting web-optimized (WebP, ~1200–1600px, <200KB).
- **Note:** Consistent lighting/background across shots matters more than quantity.
  A few hero-quality images beat many mediocre ones.

### 2. Make the contact form actually send  ·  Priority: HIGH
- **Why:** Right now the form shows a demo `alert()`. Every real enquiry is lost —
  the site looks finished but captures nothing. This is the main conversion path.
- **What's involved:** Point the form at a handler. Easiest: **Formspree**
  (`action="https://formspree.io/f/XXXX"` + `method="POST"`), no backend needed.
  Alternative: your own endpoint / email service. Add basic validation + a success state.
- **Effort:** Low.
- **Note:** Decouple from the language toggle — keep field labels translatable, but
  the submit target stays the same. Consider a honeypot field for spam.

### 3. Logo upgrade  ·  Priority: MEDIUM
- **Why:** The current `pplastic-white.png` is low-res and white — invisible on light
  backgrounds (it only shows because we force a dark chip behind it). Looks unpolished.
- **What's involved:** Get a proper **SVG** wordmark (scales infinitely, tiny file) plus
  a dark variant for light backgrounds. Update the `<img>` in header + footer.
- **Effort:** Low (once you have the asset). Could also be redrawn in code.
- **Note:** If no SVG exists, I can recreate the logo as inline SVG from the PNG.

### 4. SEO & social meta  ·  Priority: MEDIUM
- **Why:** Without per-page `<title>`/`<meta description>` and Open Graph tags, Google
  can't rank the site and shared links show a blank preview. The homepage title exists;
  inner pages are generic.
- **What's involved:** Unique `<title>` + `<meta name="description">` per page;
  OG/Twitter cards (`og:title`, `og:description`, `og:image`); a `favicon.ico`/SVG.
- **Effort:** Low.
- **Note:** Tie meta to the i18n system later (Greek pages should have Greek meta) so
  search results match the user's language.

### 5. Trust signals  ·  Priority: MEDIUM
- **Why:** The site *claims* 60+ years of expertise but shows no proof. B2B buyers
  need reassurance before contacting.
- **What's involved:** "Extruding since 1962" badge, ISO / quality certifications,
  maybe a short customer quote or "trusted by" client logos. Could live in the homepage
  stats band or a new strip.
- **Effort:** Low–Medium (depends on what assets/approval you have).
- **Note:** Only add certifications you can actually display — false claims are worse
  than none.

### 6. Deepen thin pages  ·  Priority: MEDIUM
- **Why:** Marine sub-pages (rub-rails, inflatable, heavy-duty, various) and Exhibitions
  are 1–2 paragraphs. They rank poorly and don't answer a buyer's questions.
- **What's involved:** Add real specs (materials, dimensions, colours), a downloadable
  brochure/catalogue PDF, and an Exhibitions calendar (dates, booth, city).
- **Effort:** Medium (needs real product info from you).
- **Note:** This is where the placeholder images get replaced with actual product shots.

### 7. Visual polish & UX  ·  Priority: LOW–MEDIUM
- **Why:** Small touches that make it feel premium rather than "template".
- **What's involved:**
  - Lazy-load images (`loading="lazy"`) for speed.
  - Subtle scroll-reveal animations on sections.
  - Sticky mobile CTA ("Contact us") so the conversion path is always one tap away.
  - Ensure focus-visible states + a "skip to content" link for accessibility.
- **Effort:** Low–Medium.

### 8. Legal / compliance  ·  Priority: LOW (but required for EU)
- **Why:** Greek/EU site → a cookie consent + privacy notice is expected.
- **What's involved:** Simple cookie banner + a Privacy page linking to `pplastic@otenet.gr`.
- **Effort:** Low.

---

## Suggested sequence

| Order | Item | Rationale |
|------|------|-----------|
| 1 | #2 Working contact form | Captures enquiries immediately; zero risk. |
| 2 | #1 Real photography | Biggest visual/credibility gain; replaces placeholders. |
| 3 | #3 Logo SVG | Quick polish, fixes a visible flaw. |
| 4 | #4 SEO/meta + favicon | Needed before any promotion/launch. |
| 5 | #5 + #6 Trust signals & deeper content | Strengthens the pages once real material exists. |
| 6 | #7 Polish & #8 Legal | Final layer before go-live. |

---

## Open questions for later

- Do you have a photo library (factory, products, team)? Or should we shoot/stock-source?
- Form backend preference: Formspree (no code) vs. your own email endpoint?
- Any certifications (ISO 9001, etc.) we're cleared to show?
- Want the Greek (`ΕΛ`) pages to also have Greek meta/OG tags, or keep meta in English for now?
- Should the "Catalogue" CTA serve a real PDF, or stay as a contact prompt?

---

## File map (for reference)

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
├── contact.html
├── css/style.css
├── js/i18n.js            # EN/ΕΛ dictionary + toggle logic
└── assets/images/        # logo + 3 product photos + placeholders
```
