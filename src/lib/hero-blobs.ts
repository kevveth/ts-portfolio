/**
 * Pure math for the hero "lava lamp" background — no DOM, no canvas. A
 * metaball field sampled at low resolution and posterized into bands, which
 * is what gives the chunky/retro look once the caller upscales the buffer
 * with `image-rendering: pixelated` rather than drawing at native res.
 */

export type BlobCenter = {
	x: number;
	y: number;
	radius: number;
	colorIndex: number;
};

/**
 * Per-blob Lissajous drift parameters. Periods (seconds) and phases are
 * deliberately mismatched/irrational-ish relative to each other so the
 * composite motion doesn't visibly repeat on a short cycle. Amplitude
 * fractions are kept well under 0.5 so every center stays inside the
 * buffer bounds at every phase — required for `getBlobCenters` to be safe
 * to sample at any time without a separate clamp.
 */
const BLOB_DEFS = [
	{
		periodX: 23,
		periodY: 31,
		phase: 0,
		ampFracX: 0.34,
		ampFracY: 0.3,
		radiusFrac: 0.26,
		colorIndex: 0,
	},
	{
		periodX: 29,
		periodY: 19,
		phase: 1.7,
		ampFracX: 0.3,
		ampFracY: 0.34,
		radiusFrac: 0.22,
		colorIndex: 1,
	},
	{
		periodX: 37,
		periodY: 27,
		phase: 3.4,
		ampFracX: 0.28,
		ampFracY: 0.26,
		radiusFrac: 0.3,
		colorIndex: 2,
	},
	{
		periodX: 21,
		periodY: 40,
		phase: 5.1,
		ampFracX: 0.32,
		ampFracY: 0.28,
		radiusFrac: 0.2,
		colorIndex: 0,
	},
] as const;

export const BLOB_COUNT = BLOB_DEFS.length;
export const POSTERIZE_BANDS = 4;

const TAU = Math.PI * 2;

/** Blob centers (buffer pixel coordinates) at a given time, for a buffer of the given size. Deterministic: same inputs always produce the same output. */
export function getBlobCenters(
	timeSeconds: number,
	width: number,
	height: number,
): BlobCenter[] {
	return BLOB_DEFS.map((def) => {
		const x =
			width / 2 +
			Math.sin(TAU * (timeSeconds / def.periodX) + def.phase) *
				width *
				def.ampFracX;
		const y =
			height / 2 +
			Math.cos(TAU * (timeSeconds / def.periodY) + def.phase * 1.3) *
				height *
				def.ampFracY;
		const radius = Math.min(width, height) * def.radiusFrac;
		return { x, y, radius, colorIndex: def.colorIndex };
	});
}

/** Raw (pre-posterize) metaball field strength at (x, y) — sum of each blob's radius²/distance² contribution. */
export function sampleField(
	x: number,
	y: number,
	centers: readonly BlobCenter[],
): number {
	let sum = 0;
	for (const c of centers) {
		const dx = x - c.x;
		const dy = y - c.y;
		const distSq = dx * dx + dy * dy;
		sum += (c.radius * c.radius) / (distSq + 1);
	}
	return sum;
}

/**
 * Quantizes a raw field value into a discrete band, producing the
 * retro/stepped look instead of a smooth alpha ramp. Returns -1 below
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

/** Colorindex of the strongest single contributor at (x, y) — which blob's tint should paint this band. */
export function dominantColorIndex(
	x: number,
	y: number,
	centers: readonly BlobCenter[],
): number {
	let best = 0;
	let bestContribution = -Infinity;
	for (const c of centers) {
		const dx = x - c.x;
		const dy = y - c.y;
		const distSq = dx * dx + dy * dy;
		const contribution = (c.radius * c.radius) / (distSq + 1);
		if (contribution > bestContribution) {
			bestContribution = contribution;
			best = c.colorIndex;
		}
	}
	return best;
}
