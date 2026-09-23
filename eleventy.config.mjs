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

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    htmlTemplateEngine: "njk",
  };
}
