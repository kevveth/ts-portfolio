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

## On-canvas glass: when the flat-background assumption breaks

Every rule above assumes the glass sits on a near-flat page background — true
everywhere except the hero CTA, which sits on top of `HeroBlobs` (the
animated "lava lamp" canvas, `src/components/hero-blobs.tsx`). There, a
98%/88%-opaque fill (needed for `--primary-foreground` text per the contrast
trap above) makes the button read as solid — none of the canvas shows
through. `.btn-glass-on-canvas` (`src/styles.css`, same `@supports` block)
handles this case differently rather than by just lowering the base fill's
opacity:

- **Swap the text color, don't just fight for fill transparency.** A
  translucent fill blends toward whatever's behind it. Behind this button
  that's always some point between `--background` and
  `--background`-plus-a-faint-brand-tint (see next point) — and
  `--foreground` is *defined* as "the color that contrasts with
  `--background`" in both themes. So `--foreground` text keeps working as the
  fill gets more transparent, where `--primary-foreground` (tuned for a
  near-opaque brand fill) would not.
- **Check how faint the moving backdrop actually is before assuming
  "arbitrary colors."** `--hero-blob-1..5` (`styles.css` `:root`) are bounded
  — currently 30-45% brand-mixed alpha (the implementation was replaced
  after this section was first written; a much fainter 5-9%-alpha version
  existed earlier and made verification harder for the wrong reason — see
  next point). Either way, the real backdrop range behind these buttons is
  tightly bounded — `--background` at one end, `--background` plus the
  single highest-alpha `--hero-blob-N` at the other. That makes worst-case
  verification tractable: test both flat extremes (hide the canvas; then
  swap in a full-strength flat div at the highest configured blob alpha)
  rather than trying to sample an animation.
- **A very-low-alpha backdrop (the original ~9% version) is genuinely almost
  invisible under a heavy blur once composited under any non-trivial fill
  opacity** — measured with `verify-contrast`, the composited pixel was
  byte-identical whether the canvas was hidden or a 9%-brand overlay was
  present, at fill opacities down to ~20%. The current 30-45%-alpha
  implementation doesn't have this problem (the two extremes measurably
  differ), but the lesson generalizes: **don't rely on the contrast script's
  screenshot to confirm the motion effect *reads*** — it wasn't built for
  that, regardless of how strong the backdrop is. Confirm visually instead:
  screenshot the button element in a burst over a few seconds and diff
  frames; a single snapshot can easily land on a blob-free moment and look
  like the fix did nothing.
- **Lowering `backdrop-filter: blur()` matters as much as fill opacity —
  but which direction depends on whether you want edges legible or erased.**
  The canvas (`hero-blobs.tsx`) is a small buffer scaled up for a
  deliberately "chunky," posterized look — the blob edges are what the eye
  actually picks up, not a smooth gradient. The base tier's 14px blur (tuned
  for a flat backdrop) smooths right over those edges. `.btn-glass-on-canvas`
  (the vivid "Clear" treatment, below) drops to 8px specifically to keep
  edges legible; `.btn-glass-frosted` (the muted "Regular" treatment) goes
  the *other* way, to 16px, deliberately erasing them for a soft diffuse
  wash instead. Pick the blur radius based on which effect you want, not a
  single "less blur is more glassy" rule.
- **Both on-canvas variants must re-pin `backdrop-filter`/`border-color` on
  `:hover`.** Base `.btn-glass:hover` sets its own 16px
  blur/brightness/saturate and a brand-cast border. `.btn-glass-frosted`
  re-pins these (see its hover rule); `.btn-glass-on-canvas` originally
  didn't, so hovering it silently jumped from the deliberate 8px blur above
  to 16px, blurring away exactly the blob edges this variant exists to keep
  legible. Any new on-canvas variant needs the same re-pin — it's easy to
  add a variant's rest-state rule and forget hover inherits from the base
  class otherwise.
- **The `prefers-reduced-transparency` fallback needs its own override.** The
  shared fallback block resets `background`/`box-shadow` but never touched
  `color` before this variant existed, because base `.btn-glass` never
  touches `color` either. Since `.btn-glass-on-canvas` does, the fallback
  block needs an explicit rule restoring `--primary-foreground` for it
  specifically — otherwise a user with this preference gets a solid
  `--primary` fill with `--foreground` text, which was never contrast-checked
  against a fully opaque fill.

## Two on-canvas treatments: Clear vs. Regular

The hero's two CTAs sit side by side on the same canvas but are meant to
read as visually distinct, matching Apple's own two Liquid Glass variants:

- **`.btn-glass-on-canvas`** ("Clear") — the primary "View the case study"
  button. Vivid, crisp 8px blur that preserves the canvas's blob edges.
  Meant to be eye-catching and to visibly show the lava lamp moving through
  it. Tinted with a dedicated `--hero-cta-tint` variable (a dark sapphire
  blue), not `--brand` — see "A dedicated tint variable" below — at 40-64%
  fill opacity depending on theme/state (light 40/50/52% rest/hover/active,
  dark 48/56/64%). Opacity is higher than a first-glance "glass" material
  suggests because dark mode's `--brand`-derived lava blobs are warm-hued;
  a lower-opacity sapphire fill blends toward that warmth and reads muddy
  purple rather than sapphire (verified visually, not just by contrast
  number — see below).
- **`.btn-glass-frosted`** ("Regular") — the secondary "Get in touch" button,
  stacked with `.btn-glass-on-canvas`'s sibling class `.btn-glass` (not
  `.btn-glass-on-canvas` itself — see below). Muted, background-tinted
  (only 6-8% brand mixed into `--background`, not `--brand` directly) fill
  at 55-80% opacity depending on state, heavy 16px blur that erases blob
  edges into a soft diffuse wash. Meant to read as legible/quiet on its own,
  never competing with the primary for vividness.

Two things worth remembering if a third on-canvas component ever needs
this pattern:

- **Both stack on `.btn-glass` as a base** (for the shared specular-rim/
  gloss pseudo-elements, the focus-ring fix, and the reduced-motion/
  reduced-transparency plumbing) and layer a second modifier class on top
  for their specific fill/blur/color values — `.btn-glass-on-canvas` and
  `.btn-glass-frosted` are siblings, not parent/child. Each needs its own
  `prefers-reduced-transparency` override block, since neither's tier-1
  fallback matches `.btn-glass`'s own tier-1 (solid `--primary`).
- **Opacity direction on hover/active is opposite between the two.**
  `.btn-glass-on-canvas` gets *more vivid/brand-saturated* on hover (Apple's
  "glass energizes with light on interaction"). `.btn-glass-frosted` gets
  *more opaque* on hover — it moves toward `--background`, not toward
  `--brand` — because "more frosted" is the correct interaction read for a
  Regular-style material, not "more vivid." Don't copy one variant's
  hover direction onto the other by reflex.
- **A more-opaque fill makes the on-canvas contrast problem *easier*, not
  harder.** `.btn-glass-on-canvas`'s fill is mostly transparent, so the
  composited pixel is dominated by whatever's behind it — hence needing
  `--foreground` (contrasts with the backdrop) instead of
  `--primary-foreground`. `.btn-glass-frosted`'s fill is 55-80% opaque and
  itself background-colored, so the composited pixel stays pinned near
  `--background` almost regardless of the canvas — `--foreground` still
  applies, but the margin is far larger (verified 13-17.6:1 vs. the clear
  variant's 8.8-14.3:1) because the fill itself is doing most of the
  contrast work, not the (much smaller, now-diluted) backdrop contribution.

## A dedicated tint variable for the primary CTA

`.btn-glass-on-canvas` is tinted with `--hero-cta-tint` (defined in `:root`
and `.dark`, `src/styles.css`), not `--brand` — a deliberate choice made
when the button was re-tinted to a dark sapphire blue. `--brand` flips warm
in dark mode (hue ~25, orange/red) and is referenced 40+ times: `--primary`
and `--ring` site-wide, every `--hero-blob-*` token, nine
`text-brand`/`border-brand` component call sites, and a **hardcoded hex
mirror** in `contribution-graph.tsx` that would silently desync. Repainting
`--brand` itself to get a blue button would re-skin the entire dark theme
and require re-verifying contrast on every one of those surfaces, for a
change that was only ever about one button. If a future request is "make
the whole dark theme cooler," that's a separate, larger project — treat it
as such rather than folding it into this variable.

One consequence worth knowing: dark mode's lava blobs stay warm-hued behind
a cool sapphire button. This is *by design* — a tint that visibly differs
from its backdrop is what makes it read as glass rather than a hole in the
page — but it does mean fill opacity has to be pushed higher than you'd
expect (see the numbers above) purely to keep the sapphire from blending
into a muddy purple as the warm canvas bleeds through the translucent fill.
**Verify this by eye, not just by contrast number** — a fill can clear
4.5:1 comfortably while still visually reading as the wrong hue; the
contrast script has no opinion on whether "purple" vs. "sapphire" is the
right color, only on legibility.

## The specular sheen layer

`.btn-glass::after` (the interior-gloss layer, "layer 2" above) carries a
third background image, `var(--glass-sheen)`, painted *first* in the layer
list (behind the two ambient radial-gradients). The base `.btn-glass`
defines it as a no-op transparent gradient — `--glass-sheen`,
`--glass-sheen-size`, `--glass-sheen-pos` all exist purely so every button's
`::after` has a stable 3-layer stack; only `.btn-glass-on-canvas` overrides
them with a real streak.

The streak itself is an oversized (240% width), off-center diagonal
`linear-gradient(115deg, ...)` with a bright core and soft falloff on both
sides, positioned via `background-position` (fed by `--glass-sheen-pos`).
This is what actually reads as "light glancing off a curved lens" — the
existing symmetric top-center radial-gradients (the pre-existing "gloss")
could not produce that read no matter how tuned, because they're
geometrically ambient/symmetric, not directional. Hover/active shift
`--glass-sheen-pos` sideways (a "sweep") with a `transition:
background-position` scoped to `.btn-glass-on-canvas::after` specifically —
custom properties don't transition, so the transition has to target the
actual property (`background-position`) the variable feeds, on the
concrete selector, not the base `.btn-glass` (whose sheen is inert and
doesn't need one).

**This is a second, sharper instance of the contrast trap above.** Because
the streak sweeps to a different horizontal position on hover, it can land
its brightest point directly under the text's left edge in one theme while
sitting harmlessly in the middle of the button in another — measured here,
an initial dark-mode hover streak at 44% peak alpha dropped text contrast
to 3.01:1 (a light-text-on-lightened-background failure) purely because the
sweep parked its peak at the same x position the contrast script samples
near the text's leading edge. Light mode has the opposite risk direction —
lightening the fill under dark text *helps* contrast — so the two themes'
sheen alphas are tuned independently and are not simply light/dark mirrors
of the same numbers. **Sample more than the default left-edge `--x`**: this
work caught the failure only by also checking `--x 0.3` and `--x 0.9`
(landing near the button's right-side icon) in both themes, since the sweep
makes the worst-case x position state-dependent rather than fixed at rest.

## Fallback identity is independent of the glass tint

`prefers-reduced-transparency: reduce` drops `.btn-glass-on-canvas` back to
the shared tier-1 fallback: solid `--primary` fill with
`--primary-foreground` text (see the shared fallback block, and its
`.btn-glass-on-canvas`-specific `color` override, in `src/styles.css`). This
was a deliberate decision, not an oversight: with the glass material gone,
there's no "sapphire glass" left to preserve, so the fallback intentionally
stays brand-colored (blue in light mode, orange/red in dark mode) rather
than introducing a second, never-contrast-verified "solid sapphire" fill.
`.btn-glass-frosted` already established that a variant's fallback identity
can diverge from its glass identity — this follows the same precedent.

## Reference

- Live implementation: `src/styles.css` (search `.btn-glass`),
  `src/components/ui/button.tsx` (`default` variant).
- Contrast verification: `.claude/skills/verify-contrast/`.
- Apple's own description of the material (lensing, highlights, adaptive
  tint/shadow, accessibility modifiers): WWDC25 session "Meet Liquid Glass"
  (`developer.apple.com/videos/play/wwdc2025/219/`).
