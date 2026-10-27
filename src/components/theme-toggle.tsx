import { useEffect } from "react";
import { getCurrentTheme, setTheme, syncThemeColor } from "#/lib/theme";

/** CSS follows the pre-paint theme, keeping the label hydration-safe. */
export function ThemeToggle() {
	// React can hoist an additional theme-color tag during hydration. Sync
	// the final head without turning the OS preference into a saved override.
	useEffect(() => syncThemeColor(getCurrentTheme()), []);
	return (
		<button
			type="button"
			className="theme-toggle"
			aria-label="Toggle theme"
			onClick={() => setTheme(getCurrentTheme() === "dark" ? "light" : "dark")}
		>
			<span className="dark:hidden">dark</span>
			<span className="hidden dark:inline">light</span>
		</button>
	);
}
