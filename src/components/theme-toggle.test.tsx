// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeToggle } from "./theme-toggle";

describe("theme toggle", () => {
	const originalTransition = Object.getOwnPropertyDescriptor(
		document,
		"startViewTransition",
	);

	beforeEach(() => {
		document.documentElement.className = "dark";
		localStorage.clear();
		// Reproduce a light metadata tag added after the pre-paint script.
		document.head.innerHTML = '<meta name="theme-color" content="#f5f5f2">';
	});
	afterEach(() => {
		cleanup();
		document.documentElement.className = "";
		document.documentElement.removeAttribute("style");
		if (originalTransition) {
			Object.defineProperty(
				document,
				"startViewTransition",
				originalTransition,
			);
		} else {
			Reflect.deleteProperty(document, "startViewTransition");
		}
		vi.unstubAllGlobals();
	});

	it("resynchronizes hydrated metadata without saving an OS-derived preference", () => {
		render(<ThemeToggle />);
		expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
			"content",
			"#161616",
		);
		expect(localStorage.getItem("theme")).toBeNull();
	});

	it("saves an explicit toggle and updates the document and browser chrome", () => {
		render(<ThemeToggle />);
		fireEvent.click(screen.getByRole("button"));
		expect(document.documentElement).not.toHaveClass("dark");
		expect(screen.getByRole("button")).not.toHaveAttribute("aria-label");
		expect(screen.getByRole("button")).toHaveAccessibleName(
			"Switch to darklight theme",
		);
		expect(localStorage.getItem("theme")).toBe("light");
		expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
			"content",
			"#f5f5f2",
		);
	});

	it("reveals from the button, ignores overlapping activation, and cleans up", async () => {
		let finish = () => {};
		const finished = new Promise<void>((resolve) => {
			finish = resolve;
		});
		const start = vi.fn((update: () => void) => {
			update();
			return { ready: Promise.resolve(), finished };
		});
		Object.defineProperty(document, "startViewTransition", {
			configurable: true,
			value: start,
		});
		vi.stubGlobal("matchMedia", () => ({ matches: false }));
		render(<ThemeToggle />);
		const button = screen.getByRole("button");
		vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
			left: 100,
			top: 50,
			width: 60,
			height: 44,
		} as DOMRect);
		fireEvent.click(button);
		expect(
			document.documentElement.style.getPropertyValue("--theme-reveal-x"),
		).toBe("130px");
		expect(
			document.documentElement.style.getPropertyValue("--theme-reveal-y"),
		).toBe("72px");
		expect(document.documentElement).toHaveClass("theme-revealing");
		expect(localStorage.getItem("theme")).toBe("light");
		fireEvent.click(button);
		expect(start).toHaveBeenCalledTimes(1);
		finish();
		await finished;
		expect(document.documentElement).not.toHaveClass("theme-revealing");
		expect(document.documentElement.style.cssText).toBe("");
		expect(
			document.documentElement.style.getPropertyValue("--theme-reveal-x"),
		).toBe("");
		fireEvent.click(button);
		expect(localStorage.getItem("theme")).toBe("dark");
	});

	it("switches immediately for reduced motion even when transitions are supported", () => {
		const start = vi.fn();
		Object.defineProperty(document, "startViewTransition", {
			configurable: true,
			value: start,
		});
		vi.stubGlobal("matchMedia", () => ({ matches: true }));
		render(<ThemeToggle />);
		fireEvent.click(screen.getByRole("button"));
		expect(start).not.toHaveBeenCalled();
		expect(localStorage.getItem("theme")).toBe("light");
		expect(document.documentElement).not.toHaveClass("theme-revealing");
	});

	it.each([
		"Enter",
		" ",
	])("waits for %j release before switching themes", (key) => {
		render(<ThemeToggle />);
		const button = screen.getByRole("button");
		fireEvent.keyDown(button, { key });
		fireEvent.keyDown(button, { key, repeat: true });
		expect(button).toHaveClass("is-pressed");
		expect(document.documentElement).toHaveClass("dark");
		expect(localStorage.getItem("theme")).toBeNull();
		fireEvent.keyUp(button, { key });
		expect(button).not.toHaveClass("is-pressed");
		expect(document.documentElement).not.toHaveClass("dark");
		expect(localStorage.getItem("theme")).toBe("light");
		fireEvent.keyUp(button, { key });
		expect(localStorage.getItem("theme")).toBe("light");
	});

	it("cancels a held keyboard press when focus leaves the control", () => {
		render(<ThemeToggle />);
		const button = screen.getByRole("button");
		fireEvent.keyDown(button, { key: "Enter" });
		fireEvent.blur(button);
		fireEvent.keyUp(button, { key: "Enter" });
		expect(button).not.toHaveClass("is-pressed");
		expect(localStorage.getItem("theme")).toBeNull();
	});
});
