import { Lightbulb } from "lucide-react";
import { type SyntheticEvent, useEffect, useRef } from "react";
import { getCurrentTheme, setTheme, syncThemeColor } from "#/lib/theme";

function clearPressed(event: SyntheticEvent<HTMLButtonElement>) {
	event.currentTarget.classList.remove("is-pressed");
}

/** CSS follows the pre-paint theme, keeping the label hydration-safe. */
export function ThemeToggle() {
	const transitioning = useRef(false);

	function toggleTheme(button: HTMLButtonElement) {
		if (transitioning.current) return;
		const nextTheme = getCurrentTheme() === "dark" ? "light" : "dark";
		if (
			!document.startViewTransition ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			setTheme(nextTheme);
			return;
		}

		const root = document.documentElement;
		const bounds = button.getBoundingClientRect();
		// Button coordinates also work for keyboard activation and scrolled pages.
		const x = bounds.left + bounds.width / 2;
		const y = bounds.top + bounds.height / 2;
		const radius = Math.hypot(
			Math.max(x, window.innerWidth - x),
			Math.max(y, window.innerHeight - y),
		);
		root.style.setProperty("--theme-reveal-x", `${x}px`);
		root.style.setProperty("--theme-reveal-y", `${y}px`);
		root.style.setProperty("--theme-reveal-radius", `${radius}px`);
		root.classList.add("theme-revealing");
		transitioning.current = true;

		const finish = () => {
			root.classList.remove("theme-revealing");
			for (const property of ["x", "y", "radius"]) {
				root.style.removeProperty(`--theme-reveal-${property}`);
			}
			transitioning.current = false;
		};
		try {
			const transition = document.startViewTransition(() =>
				setTheme(nextTheme),
			);
			// A skipped snapshot still applies the theme; consume its ready rejection.
			void transition.ready.catch(() => {});
			void transition.finished.then(finish, finish);
		} catch {
			finish();
			setTheme(nextTheme);
		}
	}

	// React can hoist an additional theme-color tag during hydration. Sync
	// the final head without turning the OS preference into a saved override.
	useEffect(() => syncThemeColor(getCurrentTheme()), []);
	return (
		<button
			type="button"
			className="theme-toggle"
			title="Switch between light and dark mode"
			onPointerDown={(event) => {
				if (event.button === 0 && !transitioning.current) {
					event.currentTarget.classList.add("is-pressed");
				}
			}}
			onPointerUp={clearPressed}
			onPointerCancel={clearPressed}
			onPointerLeave={clearPressed}
			onBlur={clearPressed}
			onKeyDown={(event) => {
				if (event.key === " " || event.key === "Enter") {
					event.preventDefault();
					if (!transitioning.current)
						event.currentTarget.classList.add("is-pressed");
				}
			}}
			onKeyUp={(event) => {
				if (
					(event.key === " " || event.key === "Enter") &&
					event.currentTarget.classList.contains("is-pressed")
				) {
					event.preventDefault();
					clearPressed(event);
					event.currentTarget.click();
				}
			}}
			onClick={(event) => {
				clearPressed(event);
				toggleTheme(event.currentTarget);
			}}
		>
			<span className="theme-toggle-visual" aria-hidden="true">
				<span className="theme-toggle-icon">
					<Lightbulb className="theme-bulb" size={24} strokeWidth={1.25} />
				</span>
			</span>
			<span className="sr-only">
				Switch to <span className="dark:hidden">dark</span>
				<span className="hidden dark:inline">light</span> theme
			</span>
		</button>
	);
}
