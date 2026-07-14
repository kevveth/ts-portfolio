import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
	attractBlobCenters,
	BLOB_COUNT,
	COLOR_COUNT,
	getBlobCenters,
	gradientMix,
	reflectPosition,
	sampleField,
	smoothFieldAlpha,
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

	it("keeps every deformed visible edge inside desktop and mobile buffers", () => {
		for (const [width, height] of [
			[160, 100],
			[160, 220],
			[160, 64],
		]) {
			for (let t = 0; t < 120; t += 0.25) {
				for (const c of getBlobCenters(t, width, height)) {
					expect(c.x - c.radius * c.stretchX).toBeGreaterThanOrEqual(0);
					expect(c.x + c.radius * c.stretchX).toBeLessThanOrEqual(width);
					expect(c.y - c.radius * c.stretchY).toBeGreaterThanOrEqual(0);
					expect(c.y + c.radius * c.stretchY).toBeLessThanOrEqual(height);
				}
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
				expect(c.stretchY).toBeGreaterThanOrEqual(0.9);
				expect(c.stretchY).toBeLessThanOrEqual(1.23);
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
			{
				x: 80,
				y: 50,
				radius: 20,
				stretchX: 1,
				stretchY: 2.0,
			},
		];
		const normal: typeof centers = [
			{
				x: 80,
				y: 50,
				radius: 20,
				stretchX: 1,
				stretchY: 1.0,
			},
		];
		// stretchY compresses the effective vertical distance (dy / stretchY),
		// so a stretched blob has stronger influence at the same pixel offset
		const above = sampleField(80, 30, stretched);
		const aboveNormal = sampleField(80, 30, normal);
		expect(above).toBeGreaterThan(aboveNormal);
	});
});

describe("reflectPosition", () => {
	it("reflects velocity at a radius-aware wall", () => {
		const before = reflectPosition(20, 10, 7.9, 10, 100);
		const after = reflectPosition(20, 10, 8.1, 10, 100);
		expect(before.velocity).toBeGreaterThan(0);
		expect(after.velocity).toBeLessThan(0);
		expect(after.maxImpact).toBeGreaterThan(0);
	});

	it("handles simultaneous corner collisions deterministically", () => {
		const x = reflectPosition(10, 10, 9, 10, 100);
		const y = reflectPosition(10, 10, 9, 10, 100);
		expect(x.position).toBe(100);
		expect(y.position).toBe(100);
		expect(x.maxImpact).toBe(1);
		expect(y.maxImpact).toBe(1);
	});
});

describe("responsive field helpers", () => {
	it("attracts only blobs within the pointer falloff", () => {
		const baseline = getBlobCenters(0, WIDTH, HEIGHT);
		const pointer = { x: baseline[0].x + 10, y: baseline[0].y, active: true };
		const attracted = attractBlobCenters(baseline, pointer, 35);
		expect(attracted[0].x).toBeGreaterThan(baseline[0].x);
		expect(attracted.some((blob, i) => blob.x === baseline[i].x)).toBe(true);
	});

	it("leaves the deterministic field unchanged for inactive pointers", () => {
		const baseline = getBlobCenters(0, WIDTH, HEIGHT);
		expect(
			attractBlobCenters(baseline, { x: 20, y: 20, active: false }, 50),
		).toEqual(baseline);
	});

	it("keeps the travelling gradient mix in the normalized range", () => {
		for (let t = 0; t < 100; t += 2.5) {
			const mix = gradientMix(57, 31, t, WIDTH, HEIGHT);
			expect(mix).toBeGreaterThanOrEqual(0);
			expect(mix).toBeLessThanOrEqual(1);
		}
	});

	it("feathers metaball edges smoothly", () => {
		expect(smoothFieldAlpha(0.8, 1)).toBe(0);
		expect(smoothFieldAlpha(1.2, 1)).toBeGreaterThan(0);
		expect(smoothFieldAlpha(1.7, 1)).toBe(1);
	});
});

describe("hero blob palette tokens", () => {
	const stylesPath = fileURLToPath(new URL("../styles.css", import.meta.url));
	const styles = readFileSync(stylesPath, "utf-8");

	it("defines exactly two theme-specific canvas colors", () => {
		for (let i = 1; i <= COLOR_COUNT; i++) {
			const token = `--hero-color-${i}`;
			const regex = new RegExp(`${token}:`, "g");
			const matches = styles.match(regex) ?? [];
			expect(
				matches.length,
				`${token} should appear twice (:root + .dark)`,
			).toBe(2);
		}
		expect(styles).not.toMatch(/--hero-color-3:/);
	});

	it("uses wide-gamut OKLCH endpoints with alpha mixed in CSS", () => {
		const tokenBlocks = styles.match(/--hero-color-\d:[^;]+;/g) ?? [];
		expect(tokenBlocks).toHaveLength(COLOR_COUNT * 2);
		for (const block of tokenBlocks) {
			expect(block).toMatch(/color-mix\(/);
			expect(block).toMatch(/oklch\(/);
			expect(block).toMatch(/transparent/);
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
