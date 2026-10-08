# Chimney Star staging

Repository: `localstarseo-dot/jc-chimneystars.staging`. This is a static staging homepage, not an installed WordPress theme. The latest packaged homepage is the starting design, including the official timeline star and text-only navigation.

## Edit locally

- `src/pages/home.html`: homepage sections and FAQ structured data.
- `src/components/lead-offer.html`: reusable offer bar, scroll-activated quick form, pop-out and preview lead form.
- `src/components/site-header.html`: shared navigation.
- `src/components/site-footer.html`: shared footer.
- `src/styles/site.css`: CSS, in the original cascade order.
- `src/scripts/site.js`: navigation, timeline and lead-offer interactions.
- `src/document.html`: document metadata, font loading and template slots.
- `assets/`: 37 optimized, locally hosted brand/photo assets.

Use Node 20 or newer. No npm dependencies or install step are required. Preview uses Python 3.

```sh
npm run build
npm run validate
npm run preview
```

Open http://127.0.0.1:8766/. After edits, rebuild and refresh. Do not directly edit generated `index.html`, `styles/site-v3.css`, or `scripts/site.js`.

## Git and staging

Before working, run `git pull --ff-only` with a clean working tree. Then edit source, build, validate and review:

```sh
git diff --check
git status
git add .
git commit -m "Update Chimney Star staging"
git push origin main
```

The generated files are deliberately committed, so GitHub Pages needs no custom build workflow. In repository Settings > Pages select **Deploy from a branch**, **main**, **/(root)**. After a successful Pages deployment the expected address is https://localstarseo-dot.github.io/jc-chimneystars.staging/.

Edit source files, not generated files, if working in GitHub's editor. Pull those changes locally and rebuild before publishing. Local-first editing is the simplest workflow. Git stores the history; you do not need to download the site again for WordPress migration.

The staging page has `noindex, nofollow`; this is not access control. A public repository and public Pages site are publicly visible. Google Fonts and Maps still require internet access. Non-homepage navigation points to the existing production website; those pages are not included here.

The lead form is intentionally a non-submitting staging mock. It does not send or retain field data. Before WordPress publication, replace the mock with the confirmed Chimney Star Forminator shortcode and verify consent copy, notifications, CRM delivery, spam protection and one-time analytics events.

## Recovery and migration

This repository starts with a fresh history. The earlier `chimney-stars-jc` repository and its local backup remain separately available.

See `docs/WORDPRESS-MIGRATION.md` before moving sections into Gutenberg. Existing content and business claims have been preserved, not newly verified.
