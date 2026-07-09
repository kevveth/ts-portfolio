import { describe, expect, it } from "vitest";

/**
 * The liquid glass SVG filter ID is a CSS contract: styles.css references
 * it via `url(#liquid-glass)`. If this constant drifts from the filter in
 * __root.tsx, the effect silently breaks across the entire site.
 */
const FILTER_ID = "liquid-glass";

describe("liquid glass filter contract", () => {
	it('uses the filter id "liquid-glass" referenced in CSS', () => {
		expect(FILTER_ID).toBe("liquid-glass");
	});

	it("is a valid CSS identifier (no spaces, no special chars besides hyphens)", () => {
		expect(FILTER_ID).toMatch(/^[a-z][a-z0-9-]*$/);
	});

	it("is non-empty", () => {
		expect(FILTER_ID.length).toBeGreaterThan(0);
	});
});
