# Chavo's Parlor media provenance

`design-sheet.png` is a 1440 × 1920 browser export of the accepted HTML/CSS specimen-index template, option A, approved October 28, 2026. The centered header shows the project name and “design system”; it requires no date or location. Actual Oswald/Karla WOFF2 files render the specimens, and flat swatches use the source color values. Its palette, font weights, type sizes, button radius and photo radius come from the barber repository’s `src/styles.css`, `src/components/landing/hero.tsx`, `src/components/landing/services.tsx`, and `src/components/ui/button.tsx`. The reusable renderer, project data, fonts, font licenses, and export instructions live in `scripts/design-system-template/`. The board fits the gallery’s 3:4 frame and opens full-size when clicked. Earlier generated illustrations and their prompt remain recoverable in Git history; this export replaces them.

`production-desktop.png` and `production-mobile.png` are byte-for-byte copies of the barber repository's `docs/evidence/2026-10-26/public-1280.png` and `public-390.png`.

Origin: https://chavosparlor.com/; October 26, 2026 approximately 20:46 UTC / 13:46 PDT; accepted application `8e2fbd782503ef4d9e7b16b8c7e681af06a2fc60`, deployment `dpl_B3HwBM7CuNZa8Ys6ieZoqCoNTNFv`. Desktop viewport 1280 × 900; phone 390 × 900. Real public catalog/current hours, approved media, no injected test menu, no booking/payment submitted. Source files remain complete; any future cover crop needs the capture date and provenance.

Kenneth confirmed October 26 that Chavo approved the photos/reviews discussed for the site and portfolio. Kenneth's editorial and publication approval remains separate.

Older hero/services/gallery/booking-widget and wizard images are retained as existing assets but must not imply that retired custom booking/payment features are active. No business-result or testimonial claim follows from a capture.

The project sharing card `public/og/chavos-parlor.jpg` combines a labeled crop of
the first 1280 × 880 pixels of the documented desktop capture with Kenneth’s
portfolio identity. It is an editorial card, not an unmodified screenshot. The
home sharing card `public/og.png` uses the accepted emerald green identity. Both
are 1200 × 630; regenerate them with `node scripts/generate-social-images.mjs`
(using Sharp from the existing Vite image pipeline). Full source captures above
remain unchanged and inspectable from the case study.
