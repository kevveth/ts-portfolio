import { describe, expect, it } from "vitest";
import { z } from "zod";
import { allCredentials, featuredCredentials } from "#/content/credentials";

describe("credentials authoring", () => {
	it("gives every Credential a distinct id", () => {
		const ids = allCredentials.map((credential) => credential.id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	it("uses kebab-case ids and real date-only values", () => {
		for (const credential of allCredentials) {
			expect(credential.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
			expect(z.iso.date().safeParse(credential.earnedOn).success).toBe(true);
		}
	});

	it("uses HTTPS verification URLs when present", () => {
		for (const credential of allCredentials) {
			if (credential.verificationUrl) {
				expect(new URL(credential.verificationUrl).protocol).toBe("https:");
			}
		}
	});
});

describe("credentials content", () => {
	it("returns the complete collection newest-earned first", () => {
		const earnedOn = allCredentials.map((credential) => credential.earnedOn);

		expect(earnedOn).toEqual([...earnedOn].sort().reverse());
	});

	it("preserves explicit featured relevance order", () => {
		expect(featuredCredentials.map((credential) => credential.id)).toEqual([
			"ai-fluency-for-students",
			"claude-code-101",
		]);
	});
});
