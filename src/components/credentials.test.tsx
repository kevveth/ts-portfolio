// @vitest-environment jsdom

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Credentials } from "#/components/credentials";
import type { Credential } from "#/content/credentials";

beforeAll(() => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockReturnValue({
			matches: true,
			media: "(prefers-reduced-motion: reduce)",
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn(),
		}),
	});
});

afterEach(cleanup);

const futureCredential: Credential = {
	id: "example-professional-credential",
	title: "Example Professional Credential",
	issuer: "Example Institute",
	kind: "Professional certification",
	earnedOn: "2027-01-10",
	expiresOn: "2030-01-10",
	summary: "Fixture for fields used by renewable credentials.",
	topics: ["Systems design"],
	previewKey: "anthropic-ai-fluency-for-students",
	verificationUrl: "https://example.com/verify/example",
};

describe("Credentials", () => {
	it("keeps the certificate preview out of the closed section", () => {
		render(<Credentials />);

		expect(
			screen.getByRole("heading", { name: "Certificates & credentials" }),
		).toBeInTheDocument();
		for (const badge of screen.getAllByText("Completed")) {
			expect(badge).toHaveAttribute("data-variant", "brand");
		}
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(
			screen.queryByRole("img", { name: /certificate issued/i }),
		).not.toBeInTheDocument();
	});

	it("opens an accessible certificate dialog", async () => {
		render(<Credentials />);
		fireEvent.click(
			screen.getAllByRole("button", { name: "View certificate" })[0],
		);

		const dialog = await screen.findByRole("dialog", {
			name: "Claude Code 101 certificate",
		});
		expect(dialog).toHaveAccessibleDescription(
			"Issued by Anthropic on July 21, 2026. Full certificate preview.",
		);
		expect(
			screen.getByRole("img", {
				name: "Claude Code 101 certificate issued to Kenneth Rathbun by Anthropic",
			}),
		).toBeInTheDocument();
	});

	it("closes on Escape and returns focus to the trigger", async () => {
		render(<Credentials />);
		const trigger = screen.getAllByRole("button", {
			name: "View certificate",
		})[0];
		fireEvent.click(trigger);
		await screen.findByRole("dialog");

		fireEvent.keyDown(document, { key: "Escape" });

		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		expect(trigger).toHaveFocus();
	});

	it("renders future expiration and verification fields", () => {
		render(<Credentials credentials={[futureCredential]} />);

		expect(screen.getByText("January 10, 2030")).toHaveAttribute(
			"datetime",
			"2030-01-10",
		);
		expect(
			screen.getByRole("link", { name: "Verify credential" }),
		).toHaveAttribute("href", "https://example.com/verify/example");
	});
});
