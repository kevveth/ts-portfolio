import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
	BLOB_COUNT,
	dominantColorIndex,
	getBlobCenters,
	POSTERIZE_BANDS,
	posterizeField,
	sampleField,
} from "./hero-blobs";

const WIDTH = 96;
const HEIGHT = 60;

describe("getBlobCenters", () => {
	it("is deterministic for a fixed time", () => {
		const a = getBlobCenters(12.34, WIDTH, HEIGHT);
		const b = getBlobCenters(12.34, WIDTH, HEIGHT);
		expect(a).toEqual(b);
	});

	it("returns BLOB_COUNT centers", () => {
		expect(getBlobCenters(0, WIDTH, HEIGHT)).toHaveLength(BLOB_COUNT);
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
});

describe("sampleField", () => {
	it("is strongest at a blob's own center", () => {
		const centers = getBlobCenters(0, WIDTH, HEIGHT);
		const [first] = centers;
		const atCenter = sampleField(first.x, first.y, centers);
		const farAway = sampleField(first.x + WIDTH, first.y + HEIGHT, centers);
		expect(atCenter).toBeGreaterThan(farAway);
	});

	it("returns 0 for an empty center list", () => {
		expect(sampleField(10, 10, [])).toBe(0);
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

describe("dominantColorIndex", () => {
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

	it("defines --hero-blob-1/2/3 in :root and .dark", () => {
		const rootMatches = styles.match(/--hero-blob-1:/g) ?? [];
		expect(rootMatches.length).toBe(2);
		for (const name of ["--hero-blob-1", "--hero-blob-2", "--hero-blob-3"]) {
			expect(styles).toContain(`${name}:`);
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
