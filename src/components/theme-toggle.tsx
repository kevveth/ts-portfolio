import { Moon, Sun } from "lucide-react";
import { Button } from "#/components/ui/button";
import { getCurrentTheme, setTheme } from "#/lib/theme";

/**
 * Icons swap via the `dark:` variant instead of client state, so SSR output
 * matches the class the pre-paint theme script applied — no hydration
 * mismatch, no flash of the wrong icon.
 */
export function ThemeToggle() {
	return (
		<Button
			variant="ghost"
			size="icon"
			aria-label="Toggle theme"
			onClick={() => setTheme(getCurrentTheme() === "dark" ? "light" : "dark")}
		>
			<Sun aria-hidden className="dark:hidden" />
			<Moon aria-hidden className="hidden dark:block" />
		</Button>
	);
}
