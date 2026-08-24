// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
	resolveCssColorRgba,
	resolveCssColorString,
} from "./resolve-css-color";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("resolveCssColorString", () => {
	it("returns the browser-resolved color without leaving its probe in the DOM", () => {
		vi.spyOn(window, "getComputedStyle").mockReturnValue({
			color: "rgb(12, 34, 56)",
		} as CSSStyleDeclaration);
		const childrenBefore = document.body.childElementCount;

		expect(resolveCssColorString("--brand-ink")).toBe("rgb(12, 34, 56)");
		expect(document.body.childElementCount).toBe(childrenBefore);
	});
});

describe("resolveCssColorRgba", () => {
	it("returns byte RGB channels and normalized alpha", () => {
		vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
			clearRect: vi.fn(),
			fillRect: vi.fn(),
			fillStyle: "",
			getImageData: vi.fn().mockReturnValue({
				data: new Uint8ClampedArray([10, 20, 30, 128]),
			}),
		} as unknown as CanvasRenderingContext2D);

		const [red, green, blue, alpha] = resolveCssColorRgba("oklch(50% 0.2 30)");

		expect([red, green, blue]).toEqual([10, 20, 30]);
		expect(alpha).toBeCloseTo(0.502, 3);
	});
});
