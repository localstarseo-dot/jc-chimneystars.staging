# WordPress migration handoff

Status: separated static source, not a finished native Gutenberg block library.

1. Finish and approve each section in `src/pages/home.html`. Preserve the shared header/footer unless a revision is requested. Build and test the static staging site at desktop and mobile widths.
2. Choose the WordPress integration: Custom HTML blocks preserve markup but require code editing; native Gutenberg patterns require converting markup into actual blocks. HTML alone does not become a visually editable block pattern.
3. Split approved sections into named patterns. Handle header/footer in the theme's template parts, not repeated inside page content. Do not paste the document's `html`, `head`, or `body` tags into a block.
4. Scope CSS under a page Group class such as `cs-staging-page`; migrate global body/root selectors carefully. Enter the Group class without a leading dot. Enqueue styles once through the theme or site plugin. Review CSS URLs relative to their final stylesheet location.
5. Upload images to the WordPress Media Library. Use `asset-manifest.json` as the source-to-packaged mapping, and record each final attachment ID/URL. Replace references in both HTML and CSS. Do not depend on GitHub-hosted images in production.
6. Keep the offer bar and pop-out in a shared template part or site-wide block pattern rather than duplicating them on every page. Replace the preview form in `src/components/lead-offer.html` with the confirmed Chimney Star Forminator shortcode. Keep the server-rendered form in its intended container; do not clone or move it with JavaScript.
7. Enqueue JavaScript once and verify selectors against the rendered Gutenberg DOM. Test navigation, dropdowns, mobile menu, timeline movement, offer timer persistence, auto invitation, modal focus trapping, Escape/backdrop close, reduced motion and keyboard use. Recheck the served script because WordPress may encode pasted operators.
8. Replace staging and production-domain links with verified WordPress destinations. Verify phone/booking actions, Forminator notifications, consent, spam protection, CRM delivery, business claims, schema ownership and analytics. Avoid duplicate SEO-plugin structured data.
9. Keep staging excluded from indexing. Set production canonical URLs and remove noindex only at the authorized launch. Public Pages is not a private staging environment.
10. Validate desktop/mobile layout, image loading, LCP, CLS, INP, accessibility and actual conversion delivery after publication.

Track milestones separately: Built → Published → Tracked → QA-tested → Measured. A passing static build does not establish WordPress publication, live performance, or lead tracking.
