export const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark";

const SYSTEM_THEME_QUERY = "(prefers-color-scheme: dark)";

/** Literal resolutions of the `--background` tokens in `src/styles.css`. */
export const THEME_COLORS = {
	light: "#f5f5f2",
	dark: "#161616",
} as const satisfies Record<Theme, string>;

export function resolveInitialTheme(
	storedTheme: string | null,
	prefersDark: boolean,
): Theme {
	return storedTheme === "dark" || (storedTheme !== "light" && prefersDark)
		? "dark"
		: "light";
}

export function syncThemeColor(theme: Theme): void {
	for (const meta of document.querySelectorAll<HTMLMetaElement>(
		'meta[name="theme-color"]',
	)) {
		meta.content = THEME_COLORS[theme];
	}
}

/**
 * Inline pre-paint script for the document <head>. Applies the stored theme
 * (falling back to the OS preference) before first paint so SSR'd pages never
 * flash the wrong theme, and stamps `js` on <html> so the contact form only
 * appears when scripting is available.
 */
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add("js");var t;try{t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}var dark=t==="dark"||(t!=="light"&&matchMedia("${SYSTEM_THEME_QUERY}").matches);d.classList.toggle("dark",dark);document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.content=dark?"${THEME_COLORS.dark}":"${THEME_COLORS.light}"})})()`;

export function getCurrentTheme(): Theme {
	return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
	document.documentElement.classList.toggle("dark", theme === "dark");
	syncThemeColor(theme);
}

function getStoredTheme(): string | null {
	try {
		return localStorage.getItem(THEME_STORAGE_KEY);
	} catch {
		return null;
	}
}

/** Applies a choice, returning to system tracking when it matches the OS. */
export function setTheme(theme: Theme): void {
	applyTheme(theme);
	const systemTheme = resolveInitialTheme(
		null,
		window.matchMedia(SYSTEM_THEME_QUERY).matches,
	);
	try {
		if (theme === systemTheme) {
			localStorage.removeItem(THEME_STORAGE_KEY);
		} else {
			localStorage.setItem(THEME_STORAGE_KEY, theme);
		}
	} catch {
		// Storage unavailable (private mode etc.) — the theme still applies.
	}
}

/** Syncs hydrated metadata and follows OS/storage changes without animation. */
export function watchTheme(): () => void {
	const systemPreference = window.matchMedia(SYSTEM_THEME_QUERY);
	const syncTheme = () => {
		applyTheme(resolveInitialTheme(getStoredTheme(), systemPreference.matches));
	};
	const onSystemChange = () => {
		const storedTheme = getStoredTheme();
		if (storedTheme !== "light" && storedTheme !== "dark") {
			applyTheme(resolveInitialTheme(storedTheme, systemPreference.matches));
		}
	};
	const onStorage = (event: StorageEvent) => {
		if (event.storageArea && event.storageArea !== localStorage) return;
		if (event.key === THEME_STORAGE_KEY || event.key === null) syncTheme();
	};

	systemPreference.addEventListener("change", onSystemChange);
	window.addEventListener("storage", onStorage);
	// Also catch changes between the pre-paint script and hydration.
	syncTheme();
	return () => {
		systemPreference.removeEventListener("change", onSystemChange);
		window.removeEventListener("storage", onStorage);
	};
}
