# Deploying pplastic.gr

The site is static — HTML, CSS, two small JS files and images. There is no build
step to run at deploy time; everything in the repo is already the finished output.

## What ships

```
/                      English site (index.html, marine.html, …)
/el/                   Greek site   (el/index.html, el/marine.html, …)
/assets/               images + the catalogue PDF   (shared by both languages)
/css/  /js/            shared
/robots.txt            allows everything, points at the sitemap
/sitemap.xml           23 URLs — 11 pages × 2 languages + the catalogue PDF
/404.html  /el/404.html
/tools/                build scripts — NOT needed at runtime, safe to exclude
```

Both languages are fully pre-rendered. Nothing is translated in the browser, so
search engines see real Greek HTML at real Greek URLs.

## Host requirements

Four things the host must get right:

1. **Serve `el/index.html` for `/el/`.** Every static host does this by default.
   Confirm it, because `https://pplastic.gr/el/` is the canonical Greek homepage.
2. **Serve `404.html` with a real HTTP 404 status**, not 200. A "soft 404"
   (missing page returning 200) gets the URL indexed as a real page.
3. **HTTPS with HTTP → HTTPS redirect.** Every canonical and hreflang URL in the
   markup is `https://`; serving over plain HTTP creates a duplicate set of URLs.
4. **One hostname only.** Pick `pplastic.gr` or `www.pplastic.gr` and 301 the
   other to it. The markup uses the bare domain, so if you prefer `www`, update
   `SITE` in `tools/build-el.mjs` and `tools/build-sitemap.mjs`, re-run both, and
   fix `robots.txt`.

### Per-host notes

**Netlify** — drop the repo in; `404.html` and `/el/` work as-is. To serve the
Greek 404 under `/el/`, add a `_redirects` file:

```
/el/*  /el/404.html  404
```

**Vercel** — works as-is. Set `"cleanUrls": false` in `vercel.json` so the
`.html` URLs in the markup stay exactly as written.

**GitHub Pages** — `404.html` is picked up automatically. Add an empty
`.nojekyll` file at the root so nothing is filtered out. Custom domain goes in a
`CNAME` file. Note Pages cannot serve a separate 404 per directory.

**Apache / cPanel** — add `.htaccess`:

```apache
ErrorDocument 404 /404.html
DirectoryIndex index.html
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
```

## After the first deploy

1. Add **both** `https://pplastic.gr/` and `https://pplastic.gr/el/` in Google
   Search Console, or add the domain property, which covers both.
2. Submit `https://pplastic.gr/sitemap.xml`.
3. In Search Console open **Indexing → Pages** after a week and confirm Greek
   URLs are being indexed, and **Experience → International Targeting** (or the
   Rich Results test) to confirm hreflang is read without errors.
4. Test a few pages in the [Rich Results Test](https://search.google.com/test/rich-results)
   to confirm the Organization and Breadcrumb structured data is picked up.
5. Register the business on **Google Business Profile** with exactly the address,
   phone and hours in the markup — this is what makes the company show up for
   local Greek searches, and it is separate from anything in the code.


## Staging on GitHub Pages

`.github/workflows/pages.yml` publishes every push to `master` to

    https://panos-mantis.github.io/pplastic-clone/

This is a **review copy, not the live site**. `pplastic.gr` is not our domain,
so the staging copy must not compete with the real one in search results. The
workflow therefore publishes with:

- `robots.txt` replaced by `User-agent: * / Disallow: /`
- `sitemap.xml` removed — every URL in it points at `pplastic.gr`
- `tools/` and the `.md` files left out of the published output
- `.nojekyll` added so Pages serves the files as-is

The versions committed in the repo stay production-correct; only the published
copy is altered. The `canonical` and `hreflang` tags still point at
`pplastic.gr`, which is the correct signal for a staging duplicate.

The workflow also re-runs both build scripts and fails if that produces a diff,
so a hand-edit to `/el/` is caught rather than shipped.

Greek pages are served from `/el/` as real files, so they work on a project
sub-path without changes. GitHub Pages cannot serve a per-directory 404, so a
bad URL under `/el/` gets the English `404.html`; the Greek one is only used
once the site moves to a host that supports it.

### Going live

When the real domain is in play, drop the two staging overrides from the
workflow (or deploy the repo as-is to the production host) so `robots.txt` and
`sitemap.xml` ship in their committed form.

## Changing content later

Edit the **English** page or the translation table, then regenerate:

```bash
node tools/build-el.mjs        # rewrites /el/ from the English pages
node tools/build-sitemap.mjs   # rewrites sitemap.xml
```

| To change | Edit |
| --- | --- |
| English page copy or structure | the `.html` file at the root |
| Greek body copy | the `el` block in `js/i18n-data.js` |
| Greek titles / meta descriptions | `tools/meta.el.json` |
| Greek image alt text | `tools/alts.el.json` |

Never edit files in `/el/` by hand — the next build overwrites them.

`build-el.mjs` exits non-zero and prints a warning for any string it cannot
translate, so a missed translation fails the build rather than shipping English
text onto a Greek page. It is safe to re-run at any time.
