# Building a "liquid glass" effect in CSS

Notes from building the `.btn-glass` treatment (`src/styles.css`, default
`<Button>` variant in `src/components/ui/button.tsx`) — an Apple iOS 26
"Liquid Glass"-inspired button effect. Written up so the next glass-morphism
component (a card, a nav bar, a modal) doesn't have to re-derive this from
scratch, and doesn't repeat the mistakes this one went through.

## The layering model

Back to front, four layers on one element:

1. **Body** — `backdrop-filter: blur(...)` + a translucent tinted
   `background` + `box-shadow` (depth + an inset "bezel" edge-shade).
2. **`::after`, `z-index: -1`** — interior gloss: a soft, broad radial
   highland across the upper interior, plus a tighter top-center glow.
   **Negative z-index is deliberate**: it paints above the element's own
   background but *below* the in-flow label text, so it brightens the glass
   without laying a lightening overlay across the glyphs. A `z-index: 0`
   here (the natural first guess) sits in front of static-positioned text
   and visibly washes out contrast — this was a real bug in an earlier pass.
3. **`::before`, `z-index: 1`** — the specular rim: a directional highlight
   that hugs the element's actual `border-radius`, not a flat bar.
4. **Content** (text/icon) — themed contrast treatment (see below).

## Two techniques worth reusing directly

**The ring-mask trick**, for a highlight that's a thin *stroke* following
the shape's rounded corners rather than a bar or a uniform border:

```css
.el::before {
	content: "";
	position: absolute;
	inset: 0;
	padding: 2px; /* ring thickness */
	border-radius: inherit;
	background: /* any gradient */;
	-webkit-mask:
		linear-gradient(#fff 0 0) content-box,
		linear-gradient(#fff 0 0);
	-webkit-mask-composite: xor;
	mask:
		linear-gradient(#fff 0 0) content-box,
		linear-gradient(#fff 0 0);
	mask-composite: exclude;
}
```

Two full-box mask layers, one clipped to `content-box` — the XOR/exclude
leaves only the padding-width ring visible, correctly following whatever
`border-radius` the element has. Scales to any size/shape for free; no
per-instance map or JS measurement needed.

**A directional rim via `conic-gradient`**, so the highlight reads as light
hitting a curved edge from one direction (bright at top, unlit down the
sides, faint counter-highlight at the bottom) instead of an flat,
shape-agnostic outline:

```css
background: conic-gradient(
	from 0deg at 50% 50%,
	var(--rim-top)    0deg,
	transparent       65deg,
	transparent       115deg,
	var(--rim-bottom) 170deg,
	var(--rim-bottom) 190deg,
	transparent       245deg,
	transparent       295deg,
	var(--rim-top)    360deg
);
```

`0deg` in `conic-gradient` is straight up, proceeding clockwise — the
stop pairs above carve a bright ~130° arc at top, dark ~50° arcs down each
side, and a dim ~20° arc at bottom. This directly reads as "an overhead
light hitting curved glass," which a `linear-gradient(to bottom, ...)` rim
(a uniform bar, brightness varying only with *y*, not with *angle around the
shape*) does not.

## What actually made it look "glassy," and what didn't

- **A `feTurbulence`/`feDisplacementMap` SVG filter, applied only to a
  decorative rim gradient, was a dead end.** It was disconnected from the
  actual blur/background layer, so on flat backgrounds it just warped a
  gradient into cloud/mold-like blobs — it never read as refraction. Deleted
  entirely; see git history (`liquid-glass-filter.tsx`,
  `feTurbulence`/`feDisplacementMap` in `styles.css`) if reviving this idea —
  the honest version would need `backdrop-filter: url(#filter) blur(...)`
  with an edge-concentrated (not uniform-noise) displacement map, and would
  only be visible over a backdrop with actual texture behind it (see next
  point).
- **`backdrop-filter: brightness()/saturate()` does ~nothing over a flat
  background.** These filters operate on the blurred backdrop; if the
  backdrop is a near-solid page background (true for every button on this
  site), there's no texture for them to brighten/saturate. Don't rely on
  them for vividness — see the fill-opacity point below instead.
- **The specular rim and interior gloss layers are what actually read as
  "glass"** — not raw transparency. Apple's own WWDC25 "Meet Liquid Glass"
  material description backs this up: the material stays close to the
  *intended* tint color rather than washing out, and glass reads as glass
  through lensing/highlights, not primarily through see-through-ness.

## The contrast trap (read this before tuning opacity)

A "glassy," lightly-tinted translucent fill looks right by eye and can still
fail WCAG AA by a wide margin. On this project's flat backgrounds, a
translucent brand-tinted fill blends heavily toward the page color — toward
white in light mode (reads pastel), toward black in dark mode (reads muddy)
— and either direction can crater the contrast against the fixed
`--primary-foreground` label color.

Concretely: the fill here had to be pinned to ~96–98% opacity (barely
translucent at all) to clear 4.5:1 against real glyph pixels — a ~60%
opacity value that looked fine in a quick screenshot measured at 2.5:1 in
one state. **Never eyeball this. Use the `verify-contrast` skill**
(`.claude/skills/verify-contrast/`) to measure the actual composited pixel
at the actual text row, in every interactive state (rest/hover/active/
focus) and both themes, before shipping an opacity/tint value. See that
skill's notes for why a plain contrast calculator can't do this for a
gradient/blur/color-mix background.

Two second-order effects to watch for once the base fill passes:

- **The interior gloss (layer 2) locally *lightens* the fill** — measure
  contrast with that layer present, not against the flat fill color alone.
- **An inset "bezel" edge-shade box-shadow locally *darkens* the fill** near
  that edge — same caveat, opposite direction. If your text is vertically
  centered in a fixed-height, flex-centered element (as these buttons are),
  the risk band is the padding zone near the top/bottom, not the text row
  itself — but confirm exactly where the text row lands per size variant
  rather than assuming.

## The focus-ring trap

If your glass layer sets its own `box-shadow` (needed for the depth/bezel
shadows above), and the design system's focus indicator is *also*
`box-shadow`-based (Tailwind's `focus-visible:ring-*` utilities, and
`outline-none` is set as the base style expecting the ring to cover focus
visibility) — **your box-shadow silently wins and the element loses its
focus indicator entirely**, with no error or warning. This is invisible
unless you specifically tab to the element and inspect computed styles; it
doesn't show up in a visual screenshot review of rest/hover states.

Fix: give the glass element its own `:focus-visible` rule using `outline`
instead of fighting over `box-shadow` — `outline` is a separate property
nothing else here touches:

```css
.btn-glass:focus-visible {
	outline: 2px solid var(--ring);
	outline-offset: 2px;
}
```

Check this specifically (`getComputedStyle(el).outline` while focused, or
just tab to the element and look) any time a component's box-shadow is
fully replaced rather than composed with the design system's existing ring.

## Respecting motion/transparency preferences

Two different user preferences, handled separately (not conflated into one
"reduced motion turns off glass" block):

- `prefers-reduced-transparency: reduce` — drop the glass material back to
  a solid fill. This is the right query for "the user doesn't want
  transparency," and Apple's own accessibility modifiers document exactly
  this behavior ("makes glass frostier / obscures more content").
- `prefers-reduced-motion: reduce` — suppress hover/press *motion*
  (transform, transitions) only. The material itself (blur, tint, rim,
  gloss) can and should stay — Apple's guidance is "decreases intensity of
  effects, disables elastic properties," not "remove the material."

## Reference

- Live implementation: `src/styles.css` (search `.btn-glass`),
  `src/components/ui/button.tsx` (`default` variant).
- Contrast verification: `.claude/skills/verify-contrast/`.
- Apple's own description of the material (lensing, highlights, adaptive
  tint/shadow, accessibility modifiers): WWDC25 session "Meet Liquid Glass"
  (`developer.apple.com/videos/play/wwdc2025/219/`).
