// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	resolveInitialTheme,
	setTheme,
	THEME_COLORS,
	type Theme,
	watchTheme,
} from "./theme";

describe("theme", () => {
	let prefersDark: boolean;
	let systemPreference: MediaQueryList;
	let stopWatching: (() => void) | undefined;

	function expectTheme(theme: Theme) {
		expect(document.documentElement.classList.contains("dark")).toBe(
			theme === "dark",
		);
		expect(
			Array.from(document.querySelectorAll('meta[name="theme-color"]')).map(
				(meta) => meta.getAttribute("content"),
			),
		).toEqual([THEME_COLORS[theme], THEME_COLORS[theme]]);
	}

	function changeSystemTheme(dark: boolean) {
		prefersDark = dark;
		systemPreference.dispatchEvent(new Event("change"));
	}

	function storageEvent(key: string | null = "theme") {
		window.dispatchEvent(
			new StorageEvent("storage", { key, storageArea: localStorage }),
		);
	}

	beforeEach(() => {
		prefersDark = false;
		systemPreference = new EventTarget() as MediaQueryList;
		Object.defineProperty(systemPreference, "matches", {
			get: () => prefersDark,
		});
		vi.stubGlobal("matchMedia", () => systemPreference);
		document.documentElement.className = "";
		document.head.innerHTML = `
			<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f5f5f2">
			<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#161616">
		`;
		localStorage.clear();
	});

	afterEach(() => {
		stopWatching?.();
		stopWatching = undefined;
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	it("applies a saved light choice before paint even when the OS is dark", () => {
		expect(resolveInitialTheme("light", true)).toBe("light");
	});

	it.each([
		false,
		true,
	])("clears an override when the chosen theme matches the OS (dark: %s)", (dark) => {
		prefersDark = dark;
		localStorage.setItem("theme", dark ? "light" : "dark");
		const theme = dark ? "dark" : "light";
		setTheme(theme);
		expectTheme(theme);
		expect(localStorage.getItem("theme")).toBeNull();
	});

	it.each([
		false,
		true,
	])("saves an override when the chosen theme opposes the OS (dark: %s)", (dark) => {
		prefersDark = dark;
		const theme = dark ? "light" : "dark";
		setTheme(theme);
		expectTheme(theme);
		expect(localStorage.getItem("theme")).toBe(theme);
	});

	it.each([
		false,
		true,
	])("follows OS changes without saving an override (initial dark: %s)", (dark) => {
		prefersDark = dark;
		stopWatching = watchTheme();
		expectTheme(dark ? "dark" : "light");
		changeSystemTheme(!dark);
		expectTheme(dark ? "light" : "dark");
		expect(localStorage.getItem("theme")).toBeNull();
		expect(document.documentElement).not.toHaveClass("theme-revealing");
	});

	it.each([
		"light",
		"dark",
	] as const)("preserves a %s override when OS changes match it and then oppose it", (theme) => {
		prefersDark = theme !== "dark";
		localStorage.setItem("theme", theme);
		stopWatching = watchTheme();
		changeSystemTheme(theme === "dark");
		expectTheme(theme);
		expect(localStorage.getItem("theme")).toBe(theme);
		changeSystemTheme(theme !== "dark");
		expectTheme(theme);
		expect(localStorage.getItem("theme")).toBe(theme);
	});

	it("syncs overrides from storage events and resumes OS tracking on removal", () => {
		stopWatching = watchTheme();
		localStorage.setItem("theme", "dark");
		storageEvent();
		expectTheme("dark");
		localStorage.setItem("theme", "light");
		storageEvent();
		expectTheme("light");
		changeSystemTheme(true);
		expectTheme("light");
		localStorage.removeItem("theme");
		storageEvent();
		expectTheme("dark");
		changeSystemTheme(false);
		expectTheme("light");
		expect(localStorage.getItem("theme")).toBeNull();
	});

	it("returns to the OS theme when another tab clears localStorage", () => {
		localStorage.setItem("theme", "dark");
		stopWatching = watchTheme();
		localStorage.clear();
		storageEvent(null);
		expectTheme("light");
	});

	it("ignores unrelated keys and sessionStorage events", () => {
		stopWatching = watchTheme();
		localStorage.setItem("theme", "dark");
		storageEvent("other-key");
		window.dispatchEvent(
			new StorageEvent("storage", {
				key: "theme",
				storageArea: sessionStorage,
			}),
		);
		expectTheme("light");
	});

	it("removes both listeners on cleanup", () => {
		const stop = watchTheme();
		stop();
		changeSystemTheme(true);
		expectTheme("light");
		localStorage.setItem("theme", "dark");
		storageEvent();
		expectTheme("light");
	});

	it("continues following the OS when storage is unavailable", () => {
		vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
			throw new Error("Storage unavailable");
		});
		stopWatching = watchTheme();
		changeSystemTheme(true);
		expectTheme("dark");
	});
});
