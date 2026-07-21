/**
 * Select, role-relevant credentials. Preview keys stay as strings so this
 * content module remains pure and node-testable; credential-images.ts maps
 * them to optimized image imports.
 */

export type DateOnly = `${number}-${number}-${number}`;

export type CredentialKind = "Completed" | "Professional certification";

export type Credential = {
	id: string;
	title: string;
	issuer: string;
	kind: CredentialKind;
	earnedOn: DateOnly;
	expiresOn?: DateOnly;
	summary: string;
	topics: readonly [string, ...string[]];
	previewKey: string;
	verificationUrl?: string;
};

const CREDENTIAL_ENTRIES = [
	{
		id: "anthropic-claude-code-101",
		title: "Claude Code 101",
		issuer: "Anthropic",
		kind: "Completed",
		earnedOn: "2026-07-21",
		summary:
			"Foundational training in using Claude Code for practical, agentic software development workflows.",
		topics: ["Claude Code", "Agentic coding", "Codebase workflows"],
		previewKey: "anthropic-claude-code-101",
	},
	{
		id: "anthropic-ai-fluency-for-students",
		title: "AI Fluency for Students",
		issuer: "Anthropic",
		kind: "Completed",
		earnedOn: "2026-07-17",
		summary:
			"Anthropic’s framework for using AI effectively, efficiently, ethically, and safely.",
		topics: ["Delegation", "Description", "Discernment", "Diligence"],
		previewKey: "anthropic-ai-fluency-for-students",
	},
] as const satisfies readonly Credential[];

export function sortCredentialsNewestFirst(
	credentials: readonly Credential[],
): Credential[] {
	return [...credentials].sort((left, right) =>
		right.earnedOn.localeCompare(left.earnedOn),
	);
}

const CREDENTIALS = sortCredentialsNewestFirst(CREDENTIAL_ENTRIES);

export function getAllCredentials(): readonly Credential[] {
	return CREDENTIALS;
}
