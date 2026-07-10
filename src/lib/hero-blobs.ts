/**
 * Pure math for the hero "lava lamp" background — no DOM, no canvas. A
 * metaball field sampled at low resolution and posterized into bands for a
 * chunky/retro look once the caller upscales with `image-rendering: pixelated`.
 *
 * Six blobs drift on prime-period Lissajous orbits with deterministic
 * noise-based jitter for organic micro-motion. Colors are blended by
 * contribution weight at overlap zones (rather than picking one dominant
 * blob), producing the smooth color transitions characteristic of a real
 * lava lamp.
 */

export type BlobCenter = {
	x: number;
	y: number;
	radius: number;
	colorIndex: number;
	/** Vertical stretch factor (≥1) — blobs elongate when moving fast vertically, mimicking real lava-lamp blob deformation. */
	stretchY: number;
};

// ---------------------------------------------------------------------------
// 2D value noise — deterministic hash-based, no external deps.
// Same inputs always produce the same output; safe for deterministic tests.
// ---------------------------------------------------------------------------

function hash2D(ix: number, iy: number): number {
	let h = ((ix * 374761393 + iy * 668265263) | 0) >>> 0;
	h = ((h ^ (h >> 13)) * 1274126177) >>> 0;
	// Map to [0, 1)
	return (h ^ (h >> 16)) / 4294967296;
}

function noise2D(x: number, y: number): number {
	const ix = Math.floor(x);
	const iy = Math.floor(y);
	const fx = x - ix;
	const fy = y - iy;
	const sx = fx * fx * (3 - 2 * fx);
	const sy = fy * fy * (3 - 2 * fy);
	const n00 = hash2D(ix, iy);
	const n10 = hash2D(ix + 1, iy);
	const n01 = hash2D(ix, iy + 1);
	const n11 = hash2D(ix + 1, iy + 1);
	return (
		n00 +
		(n10 - n00) * sx +
		(n01 - n00) * sy +
		(n00 - n10 - n01 + n11) * sx * sy
	);
}

// ---------------------------------------------------------------------------
// Blob definitions
// ---------------------------------------------------------------------------

/**
 * Per-blob Lissajous drift parameters. Periods are small primes so the
 * composite motion doesn't visibly repeat on a human-scale cycle. Amplitude
 * fractions stay under 0.4 so centers remain inside buffer bounds at every
 * phase — `getBlobCenters` samples anywhere without a separate clamp.
 *
 * Radius fractions range 0.16–0.28: smaller blobs read as "foreground"
 * (faster, tighter), larger blobs read as "background" (slower, diffuser).
 * Kept close to original 0.20–0.30 range to maintain field coverage.
 */
const BLOB_DEFS = [
	// Warm-toned blobs (colorIndex 0, 1)
	{
		periodX: 17,
		periodY: 23,
		phase: 0,
		ampFracX: 0.3,
		ampFracY: 0.28,
		radiusFrac: 0.26,
		colorIndex: 0,
	},
	{
		periodX: 23,
		periodY: 31,
		phase: 1.7,
		ampFracX: 0.24,
		ampFracY: 0.3,
		radiusFrac: 0.2,
		colorIndex: 1,
	},
	// Cool-toned blobs (colorIndex 2, 3)
	{
		periodX: 29,
		periodY: 19,
		phase: 3.4,
		ampFracX: 0.28,
		ampFracY: 0.22,
		radiusFrac: 0.22,
		colorIndex: 2,
	},
	{
		periodX: 31,
		periodY: 37,
		phase: 5.1,
		ampFracX: 0.22,
		ampFracY: 0.32,
		radiusFrac: 0.16,
		colorIndex: 3,
	},
	// Neutral / mid-tone blobs (colorIndex 4)
	{
		periodX: 37,
		periodY: 27,
		phase: 2.3,
		ampFracX: 0.32,
		ampFracY: 0.24,
		radiusFrac: 0.26,
		colorIndex: 4,
	},
	// Extra warm blob for asymmetry (colorIndex 0)
	{
		periodX: 41,
		periodY: 29,
		phase: 4.6,
		ampFracX: 0.26,
		ampFracY: 0.26,
		radiusFrac: 0.18,
		colorIndex: 0,
	},
] as const;

export const BLOB_COUNT = BLOB_DEFS.length;
export const COLOR_COUNT = 5; // matches --hero-blob-1 through --hero-blob-5 in styles.css
export const POSTERIZE_BANDS = 4;

const TAU = Math.PI * 2;
const NOISE_FREQ = 0.04; // spatial frequency for position jitter
const JITTER_AMPLITUDE = 7; // max px of jitter in buffer coords

type BlobDef = (typeof BLOB_DEFS)[number];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Blob centers (buffer pixel coordinates) at a given time.
 * Deterministic — same inputs always produce the same output.
 * Each blob includes a `stretchY` factor derived from its instantaneous
 * vertical velocity, so it elongates when rising/sinking fast.
 */
export function getBlobCenters(
	timeSeconds: number,
	width: number,
	height: number,
): BlobCenter[] {
	return BLOB_DEFS.map((def) => {
		const baseX = lissajousX(def, timeSeconds, width);
		const baseY = lissajousY(def, timeSeconds, height);

		// Organic micro-jitter from 2D noise sampled near the blob's position
		const jx =
			(noise2D(baseX * NOISE_FREQ + 3.1, timeSeconds * 0.4) - 0.5) *
			2 *
			JITTER_AMPLITUDE;
		const jy =
			(noise2D(baseY * NOISE_FREQ + 7.2, timeSeconds * 0.4 + 50) - 0.5) *
			2 *
			JITTER_AMPLITUDE;

		const radius = Math.min(width, height) * def.radiusFrac;

		// Vertical velocity → stretch. blobs rise ~1–2 px/frame at typical
		// periods; this maps to stretch 1.0–1.35 with a soft clamp.
		const vy = lissajousVelocityY(def, timeSeconds, height);
		const stretchY = 1 + Math.min(Math.abs(vy) * 0.025, 0.35);

		return {
			x: baseX + jx,
			y: baseY + jy,
			radius,
			colorIndex: def.colorIndex,
			stretchY,
		};
	});
}

/** Raw metaball field strength at (x, y) — sum of each blob's radius²/distance². Respects `stretchY` so elongated blobs have taller influence. */
export function sampleField(
	x: number,
	y: number,
	centers: readonly BlobCenter[],
): number {
	let sum = 0;
	for (const c of centers) {
		const dx = x - c.x;
		const dy = (y - c.y) / c.stretchY;
		const distSq = dx * dx + dy * dy;
		sum += (c.radius * c.radius) / (distSq + 1);
	}
	return sum;
}

/**
 * Quantizes a raw field value into a discrete band (0 … bands-1), producing
 * the retro/stepped look instead of a smooth alpha ramp. Returns -1 below
 * `threshold` (nothing to paint at this pixel).
 */
export function posterizeField(
	value: number,
	threshold: number,
	bands: number = POSTERIZE_BANDS,
): number {
	if (value < threshold) return -1;
	const normalized = Math.min(1, (value - threshold) / threshold);
	return Math.min(bands - 1, Math.floor(normalized * bands));
}

/**
 * Weighted color blending at (x, y). Returns a `Float64Array` of length
 * `maxColors` where each entry is the normalized contribution weight (0–1)
 * of that color index, summing to 1. Pixels near a single blob get that
 * blob's color; overlap zones get a smooth blend of all contributing blobs.
 *
 * This replaces the old `dominantColorIndex` — weighted blending produces
 * the smooth warm-to-cool transitions that make a lava lamp read as lava
 * rather than a Voronoi diagram.
 */
export function blendColors(
	x: number,
	y: number,
	centers: readonly BlobCenter[],
	maxColors: number = COLOR_COUNT,
): Float64Array {
	const raw = new Float64Array(maxColors);
	let total = 0;
	for (const c of centers) {
		const dx = x - c.x;
		const dy = (y - c.y) / c.stretchY;
		const distSq = dx * dx + dy * dy;
		const w = (c.radius * c.radius) / (distSq + 1);
		raw[c.colorIndex] += w;
		total += w;
	}
	if (total < 1e-10) return raw; // all zeros
	for (let i = 0; i < maxColors; i++) {
		raw[i] /= total;
	}
	return raw;
}

/**
 * @deprecated Use `blendColors` for weighted blending. Kept for backward
 * compatibility with existing callers that only need the dominant color.
 */
export function dominantColorIndex(
	x: number,
	y: number,
	centers: readonly BlobCenter[],
): number {
	let best = 0;
	let bestContribution = -Infinity;
	for (const c of centers) {
		const dx = x - c.x;
		const dy = (y - c.y) / c.stretchY;
		const distSq = dx * dx + dy * dy;
		const contribution = (c.radius * c.radius) / (distSq + 1);
		if (contribution > bestContribution) {
			bestContribution = contribution;
			best = c.colorIndex;
		}
	}
	return best;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function lissajousX(def: BlobDef, t: number, w: number): number {
	return (
		w / 2 + Math.sin(TAU * (t / def.periodX) + def.phase) * w * def.ampFracX
	);
}

function lissajousY(def: BlobDef, t: number, h: number): number {
	return (
		h / 2 +
		Math.cos(TAU * (t / def.periodY) + def.phase * 1.3) * h * def.ampFracY
	);
}

/** Instantaneous vertical velocity (px/s) — derivative of lissajousY. */
function lissajousVelocityY(def: BlobDef, t: number, h: number): number {
	return (
		-Math.sin(TAU * (t / def.periodY) + def.phase * 1.3) *
		(TAU / def.periodY) *
		h *
		def.ampFracY
	);
}
