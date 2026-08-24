import { useEffect, useState } from "react";

export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

/** Literal resolutions of the `--background` tokens in `src/styles.css`. */
export const THEME_COLORS = {
	light: "#f8f8f9",
	dark: "#0a0a0c",
} as const satisfies Record<Theme, string>;

export function resolveInitialTheme(
	storedTheme: string | null,
	prefersDark: boolean,
): Theme {
	return storedTheme === "dark" || (storedTheme !== "light" && prefersDark)
		? "dark"
		: "light";
}

function syncThemeColor(theme: Theme): void {
	for (const meta of document.querySelectorAll<HTMLMetaElement>(
		'meta[name="theme-color"]',
	)) {
		meta.content = THEME_COLORS[theme];
	}
}

/**
 * Inline pre-paint script for the document <head>. Applies the stored theme
 * (falling back to the OS preference) before first paint so SSR'd pages never
 * flash the wrong theme, and stamps `js` on <html> so progressive-enhancement
 * CSS (e.g. .reveal) only hides content when scripting is actually available.
 */
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add("js");var t;try{t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}var dark=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);d.classList.toggle("dark",dark);document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.content=dark?"${THEME_COLORS.dark}":"${THEME_COLORS.light}"})})()`;

export function getCurrentTheme(): Theme {
	return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function subscribeToThemeChange(
	callback: (theme: Theme) => void,
): () => void {
	const observer = new MutationObserver(() => callback(getCurrentTheme()));
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class"],
	});
	return () => observer.disconnect();
}

/** Hydration-safe theme state: SSR starts light, then resolves after mount. */
export function useTheme(): Theme {
	const [theme, setThemeState] = useState<Theme>("light");
	useEffect(() => {
		setThemeState(getCurrentTheme());
		return subscribeToThemeChange(setThemeState);
	}, []);
	return theme;
}

/** Applies the theme to <html> and persists the explicit choice. */
export function setTheme(theme: Theme): void {
	document.documentElement.classList.toggle("dark", theme === "dark");
	syncThemeColor(theme);
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// Storage unavailable (private mode etc.) — theme still applies for this page.
	}
}
