# Expert Ophthalmology Witness: full site in the new theme

Static build of all 64 pages from https://www.expertophthalmologywitness.com/page-sitemap.xml,
redesigned in the approved homepage theme.

- Every page sits at the same URL path as the live site (e.g. `/texas-expert-ophthalmology-witness/`).
- Title, meta description, robots, canonical, Open Graph / Twitter tags and Yoast schema are copied from each live page unchanged.
- H1, every heading and every paragraph, list item and internal link from the live page content are kept (checked automatically).
- Internal links are relative, so the site works when hosted anywhere. Canonical tags still point to the live domain.
- `assets/css/eow.css` is the homepage theme, `assets/css/inner.css` the inner-page layout, `assets/js/inner.js` the shared header, menus and case form.
- Forms run in demo mode until `formEndpoint` is set in `assets/js/inner.js` and in the homepage `CONFIG` object.
