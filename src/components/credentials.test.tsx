// @vitest-environment jsdom

import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
	CredentialCollection,
	FeaturedCredentials,
} from "#/components/credentials";
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

const certificateCredential: Credential = {
	id: "example-certificate-credential",
	title: "Example Certificate Credential",
	issuer: "Example Institute",
	earnedOn: "2026-01-10",
	description: "A certificate-backed achievement.",
	certificateKey: "anthropic-ai-fluency-for-students",
};

const verifiedCredential: Credential = {
	id: "example-verified-credential",
	title: "Example Verified Credential",
	issuer: "Example Institute",
	earnedOn: "2027-01-10",
	expiresOn: "2030-01-10",
	description: "A renewable achievement with two evidence paths.",
	certificateKey: "anthropic-claude-code-101",
	verificationUrl: "https://example.com/verify/example",
};

const verificationOnlyCredential: Credential = {
	id: "example-verification-only-credential",
	title:
		"Example Verification-Only Credential With a Deliberately Long Professional Title",
	issuer: "Example Institute",
	earnedOn: "2025-06-15",
	description:
		"A deliberately long description that verifies the collection preserves complete portfolio copy even when a Credential has official verification evidence but no certificate preview.",
	verificationUrl: "https://example.com/verify/official",
};

const expiredCredential: Credential = {
	...certificateCredential,
	id: "example-expired-credential",
	title: "Example Expired Credential",
	expiresOn: "2025-12-31",
};

describe("FeaturedCredentials", () => {
	it("renders an unnumbered editorial list in the supplied order", () => {
		render(
			<FeaturedCredentials
				credentials={[certificateCredential, verifiedCredential]}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Credentials" })).toBeVisible();
		const headings = screen.getAllByRole("heading", { level: 3 });
		expect(headings.map((heading) => heading.textContent)).toEqual([
			"Example Certificate Credential",
			"Example Verified Credential",
		]);
		expect(
			screen.queryByRole("list", { name: /topics/i }),
		).not.toBeInTheDocument();
		expect(screen.queryByText(/^\d+[.)]$/)).not.toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "View all credentials" }),
		).toHaveAttribute("href", "/credentials");
	});

	it("renders exactly one preferred evidence action per Credential", () => {
		render(
			<FeaturedCredentials
				credentials={[certificateCredential, verifiedCredential]}
			/>,
		);

		expect(
			screen.getAllByRole("button", { name: "View certificate" }),
		).toHaveLength(1);
		expect(
			screen.getAllByRole("link", { name: /Verify credential/ }),
		).toHaveLength(1);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});
});

describe("certificate lightbox", () => {
	it("is labeled, describes the evidence, and gives the certificate useful alternative text", async () => {
		render(<FeaturedCredentials credentials={[certificateCredential]} />);
		fireEvent.click(screen.getByRole("button", { name: "View certificate" }));

		const dialog = await screen.findByRole("dialog", {
			name: "Example Certificate Credential certificate",
		});
		expect(dialog).toHaveAccessibleDescription(
			"Issued by Example Institute on January 10, 2026. Full certificate preview.",
		);
		expect(
			screen.getByRole("img", {
				name: "Example Certificate Credential certificate issued to Kenneth Rathbun by Example Institute",
			}),
		).toBeInTheDocument();
	});

	it("closes on Escape and restores focus to its trigger", async () => {
		render(<FeaturedCredentials credentials={[certificateCredential]} />);
		const trigger = screen.getByRole("button", { name: "View certificate" });
		fireEvent.click(trigger);
		await screen.findByRole("dialog");

		fireEvent.keyDown(document, { key: "Escape" });

		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		expect(trigger).toHaveFocus();
	});
});

describe("CredentialCollection", () => {
	it("renders expiration metadata and every available evidence path", () => {
		render(<CredentialCollection credentials={[verifiedCredential]} />);

		expect(screen.getByText("January 10, 2030")).toHaveAttribute(
			"datetime",
			"2030-01-10",
		);
		expect(screen.getByText(/Expiration/)).toBeVisible();
		expect(
			screen.getByRole("button", { name: "View certificate" }),
		).toBeVisible();
		expect(
			screen.getByRole("link", { name: /Verify credential/ }),
		).toHaveAttribute("href", "https://example.com/verify/example");
	});

	it("keeps expired and verification-only Credentials with complete copy", () => {
		render(
			<CredentialCollection
				credentials={[verificationOnlyCredential, expiredCredential]}
			/>,
		);

		expect(
			screen.getByRole("heading", {
				name: verificationOnlyCredential.title,
			}),
		).toBeVisible();
		expect(
			screen.getByText(verificationOnlyCredential.description),
		).toBeVisible();
		expect(
			screen.getByRole("link", { name: /Verify credential/ }),
		).toHaveAttribute("href", "https://example.com/verify/official");
		expect(
			screen.getByRole("heading", { name: "Example Expired Credential" }),
		).toBeVisible();
		expect(screen.getByText("December 31, 2025")).toHaveAttribute(
			"datetime",
			"2025-12-31",
		);
		expect(
			screen.getAllByRole("button", { name: "View certificate" }),
		).toHaveLength(1);
	});
});
