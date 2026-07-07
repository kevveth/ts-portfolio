export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

/**
 * Inline pre-paint script for the document <head>. Applies the stored theme
 * (falling back to the OS preference) before first paint so SSR'd pages never
 * flash the wrong theme, and stamps `js` on <html> so progressive-enhancement
 * CSS (e.g. .reveal) only hides content when scripting is actually available.
 */
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");var dark=t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches);d.classList.toggle("dark",dark)}catch(e){}})()`;

export function getCurrentTheme(): Theme {
	return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Applies the theme to <html> and persists the explicit choice. */
export function setTheme(theme: Theme): void {
	document.documentElement.classList.toggle("dark", theme === "dark");
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// Storage unavailable (private mode etc.) — theme still applies for this page.
	}
}
