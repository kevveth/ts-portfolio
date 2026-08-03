/**
 * Portfolio Credentials and the domain rules that select them. Certificate
 * keys stay as strings so this module remains dependency-free and testable;
 * credential-images.ts maps them to optimized image imports.
 */

export type DateOnly = `${number}-${number}-${number}`;

type CertificateEvidence = {
	certificateKey: string;
	verificationUrl?: string;
};

type VerificationEvidence = {
	certificateKey?: string;
	verificationUrl: string;
};

export type Credential = {
	id: string;
	title: string;
	issuer: string;
	earnedOn: DateOnly;
	expiresOn?: DateOnly;
	description: string;
} & (CertificateEvidence | VerificationEvidence);

export type PreferredCredentialEvidence =
	| { type: "verification"; url: string }
	| { type: "certificate"; key: string };

const CREDENTIAL_ENTRIES = [
	{
		id: "anthropic-claude-code-101",
		title: "Claude Code 101",
		issuer: "Anthropic",
		earnedOn: "2026-07-21",
		description:
			"Foundational training in using Claude Code for practical, agentic software development workflows.",
		certificateKey: "anthropic-claude-code-101",
	},
	{
		id: "anthropic-ai-fluency-for-students",
		title: "AI Fluency for Students",
		issuer: "Anthropic",
		earnedOn: "2026-07-17",
		description:
			"Anthropic’s framework for using AI effectively, efficiently, ethically, and safely.",
		certificateKey: "anthropic-ai-fluency-for-students",
	},
] as const satisfies readonly Credential[];

export const FEATURED_CREDENTIAL_IDS = [
	"anthropic-ai-fluency-for-students",
	"anthropic-claude-code-101",
] as const;

type FeaturedCredentialSource = {
	credentials: readonly Credential[];
	featuredIds: readonly string[];
};

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const CREDENTIAL_ID_PATTERN = /^[a-z0-9-]+$/;

function isValidDateOnly(value: string): value is DateOnly {
	if (!DATE_ONLY_PATTERN.test(value)) return false;
	const [year, month, day] = value.split("-").map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	);
}

function validateCredentials(credentials: readonly Credential[]): void {
	const ids = new Set<string>();

	for (const credential of credentials) {
		if (!CREDENTIAL_ID_PATTERN.test(credential.id) || ids.has(credential.id)) {
			throw new Error(`Invalid or duplicate Credential ID: ${credential.id}`);
		}
		ids.add(credential.id);

		if (!isValidDateOnly(credential.earnedOn)) {
			throw new Error(`Invalid earned date for Credential: ${credential.id}`);
		}
		if (credential.expiresOn && !isValidDateOnly(credential.expiresOn)) {
			throw new Error(
				`Invalid expiration date for Credential: ${credential.id}`,
			);
		}
		if (!credential.certificateKey && !credential.verificationUrl) {
			throw new Error(`Credential has no evidence: ${credential.id}`);
		}
	}
}

function sortCredentialsNewestFirst(
	credentials: readonly Credential[],
): Credential[] {
	return [...credentials].sort((left, right) =>
		right.earnedOn.localeCompare(left.earnedOn),
	);
}

validateCredentials(CREDENTIAL_ENTRIES);
const CREDENTIALS = sortCredentialsNewestFirst(CREDENTIAL_ENTRIES);

export function getAllCredentials(): readonly Credential[] {
	return CREDENTIALS;
}

export function getFeaturedCredentials(
	asOf: DateOnly,
	source: FeaturedCredentialSource = {
		credentials: CREDENTIALS,
		featuredIds: FEATURED_CREDENTIAL_IDS,
	},
): readonly Credential[] {
	if (!isValidDateOnly(asOf)) {
		throw new Error(`Invalid featured Credential date: ${asOf}`);
	}
	validateCredentials(source.credentials);

	const credentialById = new Map(
		source.credentials.map((credential) => [credential.id, credential]),
	);
	const featuredIds = new Set<string>();

	return source.featuredIds.flatMap((id) => {
		if (featuredIds.has(id)) {
			throw new Error(`Duplicate Featured Credential ID: ${id}`);
		}
		featuredIds.add(id);

		const credential = credentialById.get(id);
		if (!credential) {
			throw new Error(`Unknown Featured Credential ID: ${id}`);
		}

		return credential.expiresOn && credential.expiresOn < asOf
			? []
			: [credential];
	});
}

export function getPreferredCredentialEvidence(
	credential: Pick<Credential, "certificateKey" | "verificationUrl">,
): PreferredCredentialEvidence {
	if (credential.verificationUrl) {
		return { type: "verification", url: credential.verificationUrl };
	}
	if (credential.certificateKey) {
		return { type: "certificate", key: credential.certificateKey };
	}
	throw new Error("Credential has no evidence");
}
