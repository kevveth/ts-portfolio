/**
 * Two CSS-color probes, each solving a different problem the platform gives
 * us no direct API for. They live together so the "why" of each technique
 * stays in one place.
 */

/**
 * Resolves a CSS custom property to the browser's `rgb(...)` serialization.
 *
 * Reading `getComputedStyle(...).getPropertyValue` for a custom property
 * returns the raw authored token text (e.g. the literal string
 * "oklch(0.72 0.19 25)"), not a guaranteed-parseable value. Applying the
 * token as a real `color` on a throwaway element and reading it back gets
 * the resolved `rgb(...)` form, which any JS color library can parse.
 */
export function resolveCssColorString(varName: string): string | null {
	if (typeof document === "undefined") return null;
	const probe = document.createElement("span");
	probe.style.color = `var(${varName})`;
	probe.style.display = "none";
	document.body.appendChild(probe);
	const resolved = getComputedStyle(probe).color;
	document.body.removeChild(probe);
	return resolved || null;
}

/** sRGB byte channels plus a normalized 0–1 alpha channel. */
export type ResolvedRgba = [r: number, g: number, b: number, a: number];

/**
 * Resolves a CSS color (including color-mix()/oklab, which canvas fillStyle
 * can't be string-compared against) to concrete sRGB bytes via a 1x1 canvas
 * round-trip.
 */
export function resolveCssColorRgba(colorString: string): ResolvedRgba {
	const probe = document.createElement("canvas");
	probe.width = 1;
	probe.height = 1;
	const ctx = probe.getContext("2d");
	if (!ctx) return [0, 0, 0, 0];
	ctx.clearRect(0, 0, 1, 1);
	ctx.fillStyle = colorString;
	ctx.fillRect(0, 0, 1, 1);
	const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
	return [r, g, b, a / 255];
}
