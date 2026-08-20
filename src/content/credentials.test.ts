import { describe, expect, it } from "vitest";
import {
	allCredentials,
	credentialSchema,
	featuredCredentials,
} from "#/content/credentials";

/**
 * These checks used to run at module load in credentials.ts. The content is
 * frozen at build time, so they belong here: they guard against a typo while
 * authoring, which is the only way this data can go wrong.
 */
describe("credentials authoring", () => {
	it("satisfies the Credential schema", () => {
		// The compiler only checks shape: `earnedOn: "2026-8-15"` type-checks,
		// then throws a RangeError inside Intl.DateTimeFormat when the page
		// renders. `z.iso.date()` is what rejects it, along with blank copy,
		// a malformed verification URL, and a non-kebab-case id.
		const result = credentialSchema.array().safeParse(allCredentials);

		expect(result.error?.issues ?? []).toEqual([]);
	});

	it("gives every Credential a distinct id", () => {
		// Ids are React keys and the future route param. As object keys they were
		// unique for free — a duplicate was a syntax error. In an array nothing
		// stops two entries sharing one, so this is the check that replaces it.
		const ids = allCredentials.map((credential) => credential.id);

		expect(new Set(ids).size).toBe(ids.length);
	});

	it("ships a real certificate image with every Credential", () => {
		// The schema takes imagetools' output on trust; this is the one thing
		// worth confirming actually resolved to a built image.
		for (const credential of allCredentials) {
			expect(credential.certificate.img.w).toBeGreaterThan(0);
		}
	});
});

describe("credentials content", () => {
	it("returns the complete collection newest-earned first", () => {
		const earnedOn = allCredentials.map((credential) => credential.earnedOn);

		expect(earnedOn).toEqual([...earnedOn].sort().reverse());
	});

	it("preserves explicit featured relevance order", () => {
		expect(featuredCredentials.map((credential) => credential.title)).toEqual([
			"AI Fluency for Students",
			"Claude Code 101",
		]);
	});
});
