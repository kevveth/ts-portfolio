// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./theme-toggle";

describe("theme toggle", () => {
	beforeEach(() => {
		document.documentElement.className = "dark";
		localStorage.clear();
		// Reproduce a light metadata tag added after the pre-paint script.
		document.head.innerHTML = '<meta name="theme-color" content="#f5f5f2">';
	});
	afterEach(() => {
		cleanup();
		document.documentElement.className = "";
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
		expect(screen.getByRole("button")).toHaveTextContent(
			"Switch to darklight theme",
		);
		expect(localStorage.getItem("theme")).toBe("light");
		expect(document.querySelector('meta[name="theme-color"]')).toHaveAttribute(
			"content",
			"#f5f5f2",
		);
	});
});
