# Portfolio design-system sheet

The accepted presentation is **option A / specimen index**, with a centered project name and the universal subtitle “design system.” This is the actual HTML/CSS source of `src/assets/chavos-parlor/design-sheet.png`; text and swatches are rendered by the browser, not generated illustrations.

## Reuse

Add a project in `projects.js`, supply its actual font files in `fonts/`, and add corresponding `@font-face` declarations in `sheet.css`. The common presentation uses Courier New; the specimens use the project's own fonts and colors. Display specimens are enlarged for the board; the table records actual website sizes. Option A does not read date or location.

The original comparison renderer is preserved unchanged, including option B and the limited Supreme public-interface reference, so the approved source remains reproducible. A is the selected layout; the reference is not an exhaustive Supreme design-system specification. Unverified Supreme mobile sizes are shown as dashes.

## Export

From this directory run `python3 -m http.server 3054 --bind 127.0.0.1`. Open `http://127.0.0.1:3054/sheet.html?option=a&project=chavos&scale=2` in a browser. Wait for `document.documentElement.dataset.ready` to become `true`, which follows `document.fonts.ready`, and take a full-page screenshot. The export must be 1440 × 1920. Without `scale=2`, the sheet is 720 × 960. Keep the browser at normal zoom. If the capture tool returns JPEG bytes, encode them as PNG before saving the final `.png`; renaming the extension does not convert the format.

Save the accepted PNG under `src/assets/<project-id>/`, then import it with the existing `?gallery` and `?url` image presets. It will fit the case-study gallery's 3:4 frame. The website does not expose this authoring tool as a public route.

The interface examples are static specimens. They do not initiate booking or navigation. Oswald and Karla were copied from the barber site's existing self-hosted fonts; both SIL Open Font Licenses are bundled alongside the font files.
