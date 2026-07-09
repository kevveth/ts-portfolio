import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The liquid glass button effect is pure CSS (no SVG filter). This guards
 * against the SVG feTurbulence displacement tier being reintroduced without
 * also restoring `liquid-glass-filter.tsx` and its mount in `__root.tsx` —
 * it was removed because on this site's flat backgrounds it distorted
 * nothing recognizable as glass and only produced a cloud/mold-like artifact.
 */
const stylesPath = fileURLToPath(new URL("../styles.css", import.meta.url));
const styles = readFileSync(stylesPath, "utf-8");

describe("liquid glass button styles", () => {
	it("defines the .btn-glass class", () => {
		expect(styles).toMatch(/\.btn-glass\s*\{/);
	});

	it("does not reference the removed SVG displacement filter", () => {
		expect(styles).not.toMatch(/url\(#liquid-glass\)/);
	});
});
