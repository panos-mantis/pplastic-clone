/* Generates the 1200x630 Open Graph share image, in English and Greek.

   Run manually (npm run build:og) — the PNGs are committed. It is deliberately
   NOT part of `npm run build`: it needs the TTFs in .cache/fonts, and pinning
   the output means a share card can never silently change on a deploy.

   Setup, once:
     curl the Inter 400/600 and Manrope 800 TTFs into .cache/fonts/
     (see tools/fetch-fonts.mjs for the Google Fonts URL shape)

   Why it exists: og:image was a 240x180 product photo, so a pasted link
   rendered as a thumbnail. 1200x630 + twitter:card=summary_large_image gets
   the full-width card. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONT_CACHE = path.join(ROOT, ".cache", "fonts");
const OUT_DIR = path.join(ROOT, "assets", "images");

const C = {
  deep: "#04202a",
  primary: "#0b3d4f",
  accent: "#19b6d6",
  accentSoft: "#9fd9e6",
  orange: "#f77f00",
};

const COPY = {
  en: {
    file: "og-cover.png",
    tagline: "PVC profile extrusion since 1962",
    chips: ["Marine", "Technical", "Industrial"],
    place: "Athens, Greece",
  },
  el: {
    file: "og-cover-el.png",
    tagline: "Διέλαση προφίλ PVC από το 1962",
    chips: ["Ναυτιλιακά", "Τεχνικά", "Βιομηχανικά"],
    place: "Αθήνα, Ελλάδα",
  },
};

/* A row of profile cross-sections — the actual product, used as the motif
   rather than generic decoration. */
function motif() {
  const stroke = `fill="none" stroke="${C.accent}" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"`;
  return `
  <g opacity="0.5" transform="translate(862 96)">
    <g transform="translate(0 0)">
      <!-- U-section rub rail -->
      <path d="M14 0 L14 96 Q14 128 46 128 L122 128 Q154 128 154 96 L154 0" ${stroke}/>
    </g>
    <g transform="translate(0 178)">
      <!-- D-section fender -->
      <path d="M14 0 L78 0 Q154 0 154 64 Q154 128 78 128 L14 128 Z" ${stroke}/>
    </g>
    <g transform="translate(0 356)">
      <!-- edge / trim profile -->
      <path d="M14 20 Q14 0 34 0 L154 0 M14 20 L14 128 M14 128 L154 128" ${stroke}/>
      <path d="M46 34 L122 34" ${stroke} opacity="0.55"/>
    </g>
  </g>`;
}

function card(lang) {
  const t = COPY[lang];
  // Sized to the label, so the longer Greek words do not overflow the pill.
  let x = 96;
  const chips = t.chips
    .map((label) => {
      const w = Math.round(label.length * 10.6) + 40;
      const g = `
    <g transform="translate(${x} 470)">
      <rect width="${w}" height="44" rx="22" fill="none" stroke="${C.accent}" stroke-width="2" opacity="0.75"/>
      <text x="${w / 2}" y="29" text-anchor="middle" font-family="Inter" font-weight="600"
            font-size="19" fill="${C.accentSoft}">${label}</text>
    </g>`;
      x += w + 18;
      return g;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.primary}"/>
      <stop offset="1" stop-color="${C.deep}"/>
    </linearGradient>
    <!-- Fades in from the left so there is no seam where it starts. -->
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.accent}" stop-opacity="0"/>
      <stop offset="1" stop-color="${C.accent}" stop-opacity="0.2"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="600" width="600" height="630" fill="url(#glow)"/>
  ${motif()}

  <!-- brand mark: the same bracket glyph as the site header -->
  <g transform="translate(96 88)">
    <rect width="76" height="76" rx="19" fill="${C.accent}"/>
    <path d="M32.3 28.5h-7.6v32.3h7.6M43.7 15.2h7.6v32.3h-7.6"
          fill="none" stroke="#fff" stroke-width="5.3" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <text x="192" y="148" font-family="Manrope" font-weight="800" font-size="72"
        fill="#ffffff" letter-spacing="-2">pplastic</text>

  <text x="96" y="252" font-family="Inter" font-weight="600" font-size="27"
        fill="${C.accentSoft}" letter-spacing="0.5">Papadopoulos Plastic Profiles S.A.</text>

  <rect x="96" y="288" width="92" height="5" rx="2.5" fill="${C.orange}"/>

  <text x="96" y="374" font-family="Manrope" font-weight="800" font-size="44"
        fill="#ffffff" letter-spacing="-0.8">${t.tagline}</text>

  <text x="96" y="424" font-family="Inter" font-weight="400" font-size="24"
        fill="${C.accentSoft}" opacity="0.85">${t.place}</text>
  ${chips}
</svg>`;
}

if (!fs.existsSync(FONT_CACHE)) {
  console.error(`Missing ${path.relative(ROOT, FONT_CACHE)} — see the header of this file.`);
  process.exit(1);
}
const fontFiles = fs
  .readdirSync(FONT_CACHE)
  .filter((f) => /\.(ttf|otf)$/i.test(f))
  .map((f) => path.join(FONT_CACHE, f));

for (const lang of Object.keys(COPY)) {
  const png = new Resvg(card(lang), {
    fitTo: { mode: "width", value: 1200 },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: "Inter" },
  })
    .render()
    .asPng();

  const dest = path.join(OUT_DIR, COPY[lang].file);
  fs.writeFileSync(dest, png);
  console.log(`  ${COPY[lang].file.padEnd(20)} ${(png.length / 1024).toFixed(1)} KB`);
}
