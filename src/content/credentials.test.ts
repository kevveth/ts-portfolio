import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
	getAllCredentials,
	getFeaturedCredentials,
	getPreferredCredentialEvidence,
} from "#/content/credentials";

describe("credentials content", () => {
	it("publishes valid credentials with unique kebab-case IDs and evidence", () => {
		const credentials = getAllCredentials();
		const ids = credentials.map((credential) => credential.id);

		expect(new Set(ids).size).toBe(ids.length);
		for (const credential of credentials) {
			expect(credential.id).toMatch(/^[a-z0-9-]+$/);
			expect(credential.earnedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(Number.isNaN(Date.parse(`${credential.earnedOn}T00:00:00Z`))).toBe(
				false,
			);
			if (credential.expiresOn) {
				expect(credential.expiresOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
				expect(
					Number.isNaN(Date.parse(`${credential.expiresOn}T00:00:00Z`)),
				).toBe(false);
			}
			expect(credential.title.trim()).not.toBe("");
			expect(credential.issuer.trim()).not.toBe("");
			expect(credential.description.trim()).not.toBe("");
			expect(
				Boolean(credential.certificateKey || credential.verificationUrl),
			).toBe(true);
		}
	});

	it("returns the complete collection newest-earned first", () => {
		expect(getAllCredentials().map((credential) => credential.id)).toEqual([
			"anthropic-claude-code-101",
			"anthropic-ai-fluency-for-students",
		]);
	});

	it("preserves explicit featured relevance order", () => {
		expect(
			getFeaturedCredentials("2026-08-03").map((credential) => credential.id),
		).toEqual([
			"anthropic-ai-fluency-for-students",
			"anthropic-claude-code-101",
		]);
	});

	it("rejects duplicate or missing featured IDs", () => {
		const credentials = getAllCredentials();
		const knownId = credentials[0].id;

		expect(() =>
			getFeaturedCredentials("2026-08-03", {
				credentials,
				featuredIds: [knownId, knownId],
			}),
		).toThrow(`Duplicate Featured Credential ID: ${knownId}`);
		expect(() =>
			getFeaturedCredentials("2026-08-03", {
				credentials,
				featuredIds: ["missing-credential"],
			}),
		).toThrow("Unknown Featured Credential ID: missing-credential");
	});

	it("keeps expired credentials in the collection but excludes them from featured results", () => {
		const expiringCredential = {
			id: "example-expiring-credential",
			title: "Example Expiring Credential",
			issuer: "Example Institute",
			earnedOn: "2025-01-10",
			expiresOn: "2026-07-17",
			description: "Fixture for expiration eligibility.",
			certificateKey: "example-certificate",
		} as const;
		const source = {
			credentials: [expiringCredential],
			featuredIds: [expiringCredential.id],
		};

		expect(
			getFeaturedCredentials("2026-07-17", source).map(
				(credential) => credential.id,
			),
		).toContain("example-expiring-credential");
		expect(
			getFeaturedCredentials("2026-07-18", source).map(
				(credential) => credential.id,
			),
		).not.toContain("example-expiring-credential");
	});

	it("prefers verification evidence and falls back to a certificate", () => {
		expect(
			getPreferredCredentialEvidence({
				verificationUrl: "https://example.com/verify/credential",
				certificateKey: "example-certificate",
			}),
		).toEqual({
			type: "verification",
			url: "https://example.com/verify/credential",
		});
		expect(
			getPreferredCredentialEvidence({
				certificateKey: "example-certificate",
			}),
		).toEqual({ type: "certificate", key: "example-certificate" });
	});

	it("keeps high-resolution optimized certificate sources", () => {
		const certificates = [
			{
				file: "ai-fluency-for-students-anthropic.png",
				width: 3760,
				height: 2851,
			},
			{
				file: "claude-code-101-anthropic.png",
				width: 3300,
				height: 2550,
			},
		];

		for (const certificate of certificates) {
			const imagePath = fileURLToPath(
				new URL(`../assets/credentials/${certificate.file}`, import.meta.url),
			);
			const png = readFileSync(imagePath);

			expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
			expect({
				width: png.readUInt32BE(16),
				height: png.readUInt32BE(20),
			}).toEqual({ width: certificate.width, height: certificate.height });
		}
	});
});
