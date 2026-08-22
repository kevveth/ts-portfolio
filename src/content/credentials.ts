/**
 * Static portfolio credentials and their selection rules. Certificate images
 * are direct imports, so every Credential carries its own evidence.
 */

import aiFluency from "#/assets/credentials/ai-fluency-for-students-anthropic.png?credential";
import claudeCode101 from "#/assets/credentials/claude-code-101-anthropic.png?credential";
import tanstackStart from "#/assets/credentials/tanstack-start-fundamentals-startdev.png?credential";
import validationWithZod from "#/assets/credentials/validation-with-zod-startdev.png?credential";

export type Credential = {
	/** Stable identity, independent of display copy. Lowercase kebab-case. */
	id: string;
	title: string;
	issuer: string;
	earnedOn: string;
	description: string;
	certificate: ImagetoolsPicture;
	verificationUrl?: string;
};

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

type CredentialId = (typeof CREDENTIALS)[number]["id"];

const FEATURED_CREDENTIAL_IDS = [
	"ai-fluency-for-students",
	"claude-code-101",
] as const satisfies readonly CredentialId[];

export const allCredentials: readonly Credential[] = [...CREDENTIALS].sort(
	(left, right) => right.earnedOn.localeCompare(left.earnedOn),
);

/** Relevance order, rather than chronological order. */
export const featuredCredentials: readonly Credential[] =
	FEATURED_CREDENTIAL_IDS.map((id) =>
		CREDENTIALS.find((credential) => credential.id === id),
	).filter((credential) => credential !== undefined);
