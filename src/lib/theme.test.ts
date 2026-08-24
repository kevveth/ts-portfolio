// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { resolveInitialTheme, setTheme } from "./theme";

describe("setTheme", () => {
	beforeEach(() => {
		document.documentElement.className = "";
		document.head.innerHTML = `
			<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f8f8f9">
			<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0a0a0c">
		`;
		localStorage.clear();
	});

	it("applies a saved light choice before paint even when the OS is dark", () => {
		expect(resolveInitialTheme("light", true)).toBe("light");
	});

	it("keeps browser chrome metadata consistent with an explicit theme", () => {
		setTheme("dark");

		expect(document.documentElement).toHaveClass("dark");
		expect(localStorage.getItem("theme")).toBe("dark");
		expect(
			Array.from(document.querySelectorAll('meta[name="theme-color"]')).map(
				(meta) => meta.getAttribute("content"),
			),
		).toEqual(["#0a0a0c", "#0a0a0c"]);
	});
});
