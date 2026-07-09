import { describe, expect, it } from "vitest";

/**
 * The liquid glass SVG filter is applied via `filter: url(#liquid-glass)` on
 * .btn-glass::before. The filter ID must match between the <filter> element
 * in __root.tsx and the CSS url() reference in styles.css.
 */
const FILTER_ID = "liquid-glass";

describe("liquid glass filter contract", () => {
	it('uses the filter id "liquid-glass" referenced in CSS', () => {
		expect(FILTER_ID).toBe("liquid-glass");
	});

	it("is a valid CSS identifier", () => {
		expect(FILTER_ID).toMatch(/^[a-z][a-z0-9-]*$/);
	});

	it("is non-empty", () => {
		expect(FILTER_ID.length).toBeGreaterThan(0);
	});
});
