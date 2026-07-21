import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
	type Credential,
	getAllCredentials,
	sortCredentialsNewestFirst,
} from "#/content/credentials";

const credentials = getAllCredentials();

describe("credentials content", () => {
	it("uses unique kebab-case IDs and valid date-only values", () => {
		const ids = credentials.map((credential) => credential.id);
		expect(new Set(ids).size).toBe(ids.length);

		for (const credential of credentials) {
			expect(credential.id).toMatch(/^[a-z0-9-]+$/);
			expect(credential.earnedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
			expect(Number.isNaN(Date.parse(credential.earnedOn))).toBe(false);
		}
	});

	it("keeps entries newest first", () => {
		for (let index = 1; index < credentials.length; index += 1) {
			expect(
				credentials[index - 1].earnedOn >= credentials[index].earnedOn,
			).toBe(true);
		}
	});

	it("requires complete display and preview metadata", () => {
		for (const credential of credentials) {
			expect(credential.title.trim()).not.toBe("");
			expect(credential.issuer.trim()).not.toBe("");
			expect(credential.kind.trim()).not.toBe("");
			expect(credential.summary.trim()).not.toBe("");
			expect(credential.topics.length).toBeGreaterThan(0);
			expect(credential.previewKey.trim()).not.toBe("");
		}
	});

	it("publishes the exact Anthropic course-completion entry", () => {
		expect(credentials).toContainEqual({
			id: "anthropic-claude-code-101",
			title: "Claude Code 101",
			issuer: "Anthropic",
			kind: "Completed",
			earnedOn: "2026-07-21",
			summary:
				"Foundational training in using Claude Code for practical, agentic software development workflows.",
			topics: ["Claude Code", "Agentic coding", "Codebase workflows"],
			previewKey: "anthropic-claude-code-101",
		});
		expect(credentials).toContainEqual({
			id: "anthropic-ai-fluency-for-students",
			title: "AI Fluency for Students",
			issuer: "Anthropic",
			kind: "Completed",
			earnedOn: "2026-07-17",
			summary:
				"Anthropic’s framework for using AI effectively, efficiently, ethically, and safely.",
			topics: ["Delegation", "Description", "Discernment", "Diligence"],
			previewKey: "anthropic-ai-fluency-for-students",
		});
		expect(credentials[0].id).toBe("anthropic-claude-code-101");
		expect(credentials[0].kind).not.toBe("Certification");
		expect(credentials[0].kind).not.toBe("Course completion");
	});

	it("supports verification and expiration metadata for future credentials", () => {
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

		expect(futureCredential.expiresOn).toBe("2030-01-10");
		expect(futureCredential.verificationUrl).toMatch(/^https:\/\//);
		expect(
			sortCredentialsNewestFirst([credentials[0], futureCredential]).map(
				(credential) => credential.id,
			),
		).toEqual(["example-professional-credential", "anthropic-claude-code-101"]);
	});

	it("keeps high-resolution optimized preview sources", () => {
		const previews = [
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

		for (const preview of previews) {
			const imagePath = fileURLToPath(
				new URL(`../assets/credentials/${preview.file}`, import.meta.url),
			);
			const png = readFileSync(imagePath);

			expect(png.subarray(1, 4).toString("ascii")).toBe("PNG");
			expect({
				width: png.readUInt32BE(16),
				height: png.readUInt32BE(20),
			}).toEqual({ width: preview.width, height: preview.height });
		}
	});
});
