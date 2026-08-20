/**
 * Portfolio Credentials and the domain rules that select them. Certificate
 * images are imported directly so a Credential always carries its own
 * evidence — there is no registry to keep in sync.
 *
 * `credentialSchema` is the single source of truth: `Credential` is inferred
 * from it, and `credentials.test.ts` parses the entries through it. The parse
 * stays in the test on purpose — this content is frozen when the build
 * finishes, so the only way it goes wrong is a typo while authoring. A failing
 * test catches that; a runtime check would re-prove it to every visitor.
 *
 * Every Credential carries its own `id`. That is what a Link params object
 * reads from the day these get their own route, and it is what keys the list
 * today, so a reworded title stays a copy edit. `CredentialId` is derived from
 * the entries themselves, so featuring an id that doesn't exist is a compile
 * error. Ids are not unique for free the way object keys were — the test
 * checks them.
 */

import { z } from "zod";
import aiFluency from "#/assets/credentials/ai-fluency-for-students-anthropic.png?credential";
import claudeCode101 from "#/assets/credentials/claude-code-101-anthropic.png?credential";
import tanstackStart from "#/assets/credentials/tanstack-start-fundamentals-startdev.png?credential";
import validationWithZod from "#/assets/credentials/validation-with-zod-startdev.png?credential";

export const credentialSchema = z.object({
	/** Stable identity, independent of the title. Lowercase kebab-case. */
	id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
	title: z.string().min(1),
	issuer: z.string().min(1),
	/** Real calendar date, not just `YYYY-MM-DD` shaped — see the test. */
	earnedOn: z.iso.date(),
	description: z.string().min(1),
	/** Built by vite-imagetools; its shape is an ambient declaration, not ours. */
	certificate: z.custom<ImagetoolsPicture>(),
	verificationUrl: z.url().optional(),
});

export type Credential = z.infer<typeof credentialSchema>;

const CREDENTIALS = [
	{
		id: "claude-code-101",
		title: "Claude Code 101",
		issuer: "Anthropic",
		earnedOn: "2026-07-21",
		description:
			"Foundational training in using Claude Code for practical, agentic software development workflows.",
		certificate: claudeCode101,
	},
	{
		id: "ai-fluency-for-students",
		title: "AI Fluency for Students",
		issuer: "Anthropic",
		earnedOn: "2026-07-17",
		description:
			"Anthropic’s framework for using AI effectively, efficiently, ethically, and safely.",
		certificate: aiFluency,
	},
	{
		id: "tanstack-start-fundamentals",
		title: "TanStack Start Fundamentals",
		issuer: "start.dev",
		earnedOn: "2026-08-09",
		description:
			"Full-stack TanStack Start: type-safe file-based routing, server-side data loading, search params, and server functions, capped with an end-to-end project.",
		certificate: tanstackStart,
		verificationUrl:
			"https://start.dev/certificates/cert_196e01005db4427fb586889fa8465181",
	},
	{
		id: "validation-with-zod",
		title: "Validation with Zod",
		issuer: "start.dev",
		earnedOn: "2026-08-15",
		description:
			"Schema-first validation with Zod: parsing untrusted data, inferring types instead of duplicating them, and wiring validation into React forms.",
		certificate: validationWithZod,
		verificationUrl:
			"https://start.dev/certificates/cert_b6e0cc4387c346849f3915517be9f613",
	},
] as const satisfies readonly Credential[];

/** The ids that actually exist, so featuring a typo is a compile error. */
export type CredentialId = (typeof CREDENTIALS)[number]["id"];

export const FEATURED_CREDENTIAL_IDS = [
	"ai-fluency-for-students",
	"claude-code-101",
] as const satisfies readonly CredentialId[];

function sortCredentialsNewestFirst(
	credentials: readonly Credential[],
): Credential[] {
	return [...credentials].sort((left, right) =>
		right.earnedOn.localeCompare(left.earnedOn),
	);
}

export const allCredentials: readonly Credential[] =
	sortCredentialsNewestFirst(CREDENTIALS);

/**
 * Relevance order, not chronological — so this maps the featured ids rather
 * than filtering the collection. The lookup cannot miss (`CredentialId` is
 * derived from these same entries); the filter is how that is expressed
 * without a cast or a throw.
 */
export const featuredCredentials: readonly Credential[] =
	FEATURED_CREDENTIAL_IDS.map((id) =>
		CREDENTIALS.find((credential) => credential.id === id),
	).filter((credential) => credential !== undefined);
