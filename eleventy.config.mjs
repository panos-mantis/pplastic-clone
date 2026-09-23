/* Eleventy builds the English pages from src/ into _site/.
   The Greek pages are then generated from that output by tools/build-el.mjs,
   so /el/ always mirrors whatever English markup Eleventy just produced. */
export default function (eleventyConfig) {
  // Served as-is; none of it is templated.
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("robots.txt");

  eleventyConfig.addGlobalData(
    "defaultRobots",
    "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
  );

  // One branded 1200x630 card for every page. The product photos are 240x180,
  // which social platforms render as a thumbnail rather than a full-width card.
  // Regenerate with `npm run build:og`.
  eleventyConfig.addGlobalData("ogImage", "assets/images/og-cover.png");
  eleventyConfig.addGlobalData("ogImageWidth", "1200");
  eleventyConfig.addGlobalData("ogImageHeight", "630");
  eleventyConfig.addGlobalData(
    "ogImageAlt",
    "pplastic — Papadopoulos Plastic Profiles S.A., PVC profile extrusion in Athens since 1962"
  );

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
  };
}
