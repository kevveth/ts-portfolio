// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { CredentialList, FeaturedCredentials } from "#/components/credentials";
import type { Credential } from "#/content/credentials";
import { renderWithRouter } from "#/test/router";

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

const stubCertificate: ImagetoolsPicture = {
	sources: { webp: "/stub.webp 1200w" },
	img: { src: "/stub.png", w: 1200, h: 800 },
};

const certificateCredential: Credential = {
	id: "example-certificate-credential",
	title: "Example Certificate Credential",
	issuer: "Example Institute",
	earnedOn: "2026-01-10",
	description: "A certificate-backed achievement.",
	certificate: stubCertificate,
};

const verifiedCredential: Credential = {
	id: "example-verified-credential",
	title: "Example Verified Credential",
	issuer: "Example Institute",
	earnedOn: "2027-01-10",
	description: "A renewable achievement with two evidence paths.",
	certificate: stubCertificate,
	verificationUrl: "https://example.com/verify/example",
};

const longCopyCredential: Credential = {
	id: "example-long-copy-credential",
	title:
		"Example Credential With a Deliberately Long Professional Title That Should Not Be Truncated",
	issuer: "Example Institute",
	earnedOn: "2025-06-15",
	description:
		"A deliberately long description that verifies the list preserves complete portfolio copy rather than clipping it to fit a row.",
	certificate: stubCertificate,
	verificationUrl: "https://example.com/verify/official",
};

describe("CredentialList", () => {
	it("renders title, metadata, description, and certificate for each Credential", () => {
		render(
			<CredentialList
				credentials={[certificateCredential, verifiedCredential]}
			/>,
		);

		const headings = screen.getAllByRole("heading", { level: 3 });
		expect(headings.map((heading) => heading.textContent)).toEqual([
			"Example Certificate Credential",
			"Example Verified Credential",
		]);

		expect(screen.getByText("January 10, 2026")).toHaveAttribute(
			"datetime",
			"2026-01-10",
		);
		expect(screen.getByText("A certificate-backed achievement.")).toBeVisible();
		expect(
			screen.getAllByRole("img", { name: /certificate issued to/ }),
		).toHaveLength(2);
	});

	it("keeps the certificate in the DOM while its disclosure is closed", () => {
		render(<CredentialList credentials={[certificateCredential]} />);

		const disclosure = screen.getByText("View certificate").closest("details");
		expect(disclosure).not.toHaveAttribute("open");
		expect(
			screen.getByRole("img", {
				name: "Example Certificate Credential certificate issued to Kenneth Rathbun by Example Institute",
			}),
		).toBeInTheDocument();
	});

	it("groups the certificate disclosures into one exclusive accordion", () => {
		const { container } = render(
			<CredentialList
				credentials={[certificateCredential, verifiedCredential]}
			/>,
		);

		const disclosures = container.querySelectorAll("details");
		expect(disclosures).toHaveLength(2);
		for (const disclosure of disclosures) {
			// A shared name makes the browser close the others natively.
			expect(disclosure).toHaveAttribute("name", "credential-certificates");
		}
	});

	it("renders a verification link only when the Credential has one", () => {
		render(
			<CredentialList
				credentials={[certificateCredential, verifiedCredential]}
			/>,
		);

		const links = screen.getAllByRole("link", { name: /Verify credential/ });
		expect(links).toHaveLength(1);
		expect(links[0]).toHaveAttribute(
			"href",
			"https://example.com/verify/example",
		);
	});

	it("renders row titles at the requested heading level", () => {
		// /credentials sits row titles directly under the page h1, so it asks for
		// h2; the homepage nests them under a section h2 and takes the default.
		render(
			<CredentialList
				credentials={[certificateCredential]}
				headingLevel="h2"
			/>,
		);

		expect(
			screen.getByRole("heading", {
				level: 2,
				name: "Example Certificate Credential",
			}),
		).toBeVisible();
	});

	it("preserves complete copy for long titles and descriptions", () => {
		render(<CredentialList credentials={[longCopyCredential]} />);

		expect(
			screen.getByRole("heading", { name: longCopyCredential.title }),
		).toBeVisible();
		expect(screen.getByText(longCopyCredential.description)).toBeVisible();
	});
});

describe("FeaturedCredentials", () => {
	it("wraps the list with section chrome and a link to the full collection", async () => {
		await renderWithRouter(
			<FeaturedCredentials
				credentials={[certificateCredential, verifiedCredential]}
			/>,
		);

		expect(screen.getByRole("heading", { name: "Credentials" })).toBeVisible();
		expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
		expect(
			screen.getByRole("link", { name: "View all credentials" }),
		).toHaveAttribute("href", "/credentials");
	});
});
