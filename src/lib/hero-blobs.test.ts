import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
	BLOB_COUNT,
	blendColors,
	COLOR_COUNT,
	dominantColorIndex,
	getBlobCenters,
	POSTERIZE_BANDS,
	posterizeField,
	sampleField,
} from "./hero-blobs";

const WIDTH = 160;
const HEIGHT = 100;

describe("getBlobCenters", () => {
	it("is deterministic for a fixed time", () => {
		const a = getBlobCenters(12.34, WIDTH, HEIGHT);
		const b = getBlobCenters(12.34, WIDTH, HEIGHT);
		expect(a).toEqual(b);
	});

	it("returns BLOB_COUNT centers (6 blobs)", () => {
		expect(getBlobCenters(0, WIDTH, HEIGHT)).toHaveLength(BLOB_COUNT);
		expect(BLOB_COUNT).toBe(6);
	});

	it("keeps every center inside the buffer bounds across a full drift cycle", () => {
		for (let t = 0; t < 120; t += 0.5) {
			for (const c of getBlobCenters(t, WIDTH, HEIGHT)) {
				expect(c.x).toBeGreaterThanOrEqual(0);
				expect(c.x).toBeLessThanOrEqual(WIDTH);
				expect(c.y).toBeGreaterThanOrEqual(0);
				expect(c.y).toBeLessThanOrEqual(HEIGHT);
			}
		}
	});

	it("moves over time (not frozen)", () => {
		const a = getBlobCenters(0, WIDTH, HEIGHT);
		const b = getBlobCenters(10, WIDTH, HEIGHT);
		expect(a).not.toEqual(b);
	});

	it("includes stretchY >= 1 on every blob (deformation field)", () => {
		for (let t = 0; t < 60; t += 2) {
			for (const c of getBlobCenters(t, WIDTH, HEIGHT)) {
				expect(c.stretchY).toBeGreaterThanOrEqual(1);
				expect(c.stretchY).toBeLessThanOrEqual(1.36); // max stretch ~35%
			}
		}
	});

	it("stretchY varies with vertical velocity (not constant)", () => {
		const a = getBlobCenters(0, WIDTH, HEIGHT);
		const b = getBlobCenters(5, WIDTH, HEIGHT);
		// At least one blob should change stretch (different velocity at t=0 vs t=5)
		const varied = a.some((c, i) => c.stretchY !== b[i].stretchY);
		expect(varied).toBe(true);
	});
});

describe("sampleField", () => {
	it("is strongest at a blob's own center", () => {
		const centers = getBlobCenters(0, WIDTH, HEIGHT);
		const [first] = centers;
		const atCenter = sampleField(first.x, first.y, centers);
		const farAway = sampleField(first.x + WIDTH, farAwayY(centers), centers);
		expect(atCenter).toBeGreaterThan(farAway);
	});

	it("returns 0 for an empty center list", () => {
		expect(sampleField(10, 10, [])).toBe(0);
	});

	it("respects stretchY — stretched blob extends further vertically", () => {
		const stretched: typeof centers = [
			{ x: 80, y: 50, radius: 20, colorIndex: 0, stretchY: 2.0 },
		];
		const normal: typeof centers = [
			{ x: 80, y: 50, radius: 20, colorIndex: 0, stretchY: 1.0 },
		];
		// stretchY compresses the effective vertical distance (dy / stretchY),
		// so a stretched blob has stronger influence at the same pixel offset
		const above = sampleField(80, 30, stretched);
		const aboveNormal = sampleField(80, 30, normal);
		expect(above).toBeGreaterThan(aboveNormal);
	});
});

describe("posterizeField", () => {
	it("returns -1 below the threshold", () => {
		expect(posterizeField(0.1, 1)).toBe(-1);
	});

	it("quantizes into at most POSTERIZE_BANDS discrete bands", () => {
		const seen = new Set<number>();
		for (let v = 0; v < 10; v += 0.05) {
			seen.add(posterizeField(v, 1));
		}
		for (const band of seen) {
			expect(band).toBeGreaterThanOrEqual(-1);
			expect(band).toBeLessThan(POSTERIZE_BANDS);
		}
	});

	it("is monotonic non-decreasing as the field value increases", () => {
		let prev = posterizeField(0, 1);
		for (let v = 0; v < 10; v += 0.25) {
			const band = posterizeField(v, 1);
			expect(band).toBeGreaterThanOrEqual(prev);
			prev = band;
		}
	});
});

describe("blendColors", () => {
	it("returns weights that sum to ~1 at any sampled point", () => {
		const centers = getBlobCenters(5, WIDTH, HEIGHT);
		for (let y = 0; y < HEIGHT; y += 10) {
			for (let x = 0; x < WIDTH; x += 10) {
				const field = sampleField(x, y, centers);
				if (field < 0.5) continue; // skip empty regions
				const weights = blendColors(x, y, centers, COLOR_COUNT);
				const sum = weights.reduce((a, b) => a + b, 0);
				expect(sum).toBeCloseTo(1, 5);
			}
		}
	});

	it("returns an array of length maxColors", () => {
		const centers = getBlobCenters(0, WIDTH, HEIGHT);
		const w = blendColors(80, 50, centers, COLOR_COUNT);
		expect(w).toHaveLength(COLOR_COUNT);
	});

	it("gives highest weight to the blob whose center the point sits at", () => {
		const centers = getBlobCenters(5, WIDTH, HEIGHT);
		const target = centers[2];
		const weights = blendColors(target.x, target.y, centers, COLOR_COUNT);
		const maxWeight = Math.max(...weights);
		expect(weights[target.colorIndex]).toBe(maxWeight);
	});

	it("blends colors at midpoint between two differently-colored blobs", () => {
		const a = { x: 70, y: 50, radius: 20, colorIndex: 0, stretchY: 1 };
		const b = { x: 90, y: 50, radius: 20, colorIndex: 1, stretchY: 1 };
		const weights = blendColors(80, 50, [a, b], COLOR_COUNT);
		// Both blobs should contribute meaningfully at the midpoint
		expect(weights[0]).toBeGreaterThan(0.3);
		expect(weights[1]).toBeGreaterThan(0.3);
		expect(weights[0]).toBeCloseTo(weights[1], 1);
	});

	it("returns all zeros for empty centers", () => {
		const weights = blendColors(10, 10, [], COLOR_COUNT);
		for (let i = 0; i < COLOR_COUNT; i++) {
			expect(weights[i]).toBe(0);
		}
	});
});

describe("dominantColorIndex (deprecated compat)", () => {
	it("picks the nearest blob's color at its own center", () => {
		const centers = getBlobCenters(5, WIDTH, HEIGHT);
		const target = centers[2];
		expect(dominantColorIndex(target.x, target.y, centers)).toBe(
			target.colorIndex,
		);
	});
});

/**
 * Guards the CSS side of the contract: the blob palette must stay derived
 * from --brand via color-mix (never a hardcoded hex), matching the
 * discipline already enforced for .btn-glass in glass-filter.test.ts.
 */
describe("hero blob palette tokens", () => {
	const stylesPath = fileURLToPath(new URL("../styles.css", import.meta.url));
	const styles = readFileSync(stylesPath, "utf-8");

	it("defines --hero-blob-1 through --hero-blob-5 in :root and .dark", () => {
		for (let i = 1; i <= 5; i++) {
			const token = `--hero-blob-${i}`;
			const regex = new RegExp(`${token}:`, "g");
			const matches = styles.match(regex) ?? [];
			expect(
				matches.length,
				`${token} should appear twice (:root + .dark)`,
			).toBe(2);
		}
	});

	it("derives every hero-blob token from var(--brand) via color-mix, never a hardcoded hex", () => {
		const tokenBlocks = styles.match(/--hero-blob-\d:[^;]+;/g) ?? [];
		expect(tokenBlocks.length).toBeGreaterThan(0);
		for (const block of tokenBlocks) {
			expect(block).toMatch(/color-mix\(/);
			expect(block).toMatch(/var\(--brand\)/);
			expect(block).not.toMatch(/#[0-9a-fA-F]{3,8}/);
		}
	});
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const centers = getBlobCenters(0, WIDTH, HEIGHT);
function farAwayY(cs: typeof centers): number {
	return cs[0].y + HEIGHT;
}
