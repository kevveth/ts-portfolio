import { Link } from "@tanstack/react-router";
import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react";
import { Picture } from "#/components/picture";
import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { Button } from "#/components/ui/button";
import type { Credential } from "#/content/credentials";
import { SITE } from "#/content/site";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

function formatCredentialDate(date: Credential["earnedOn"]): string {
	return DATE_FORMATTER.format(new Date(`${date}T00:00:00Z`));
}

function getCertificateAlt(credential: Credential): string {
	return `${credential.title} certificate issued to ${SITE.name} by ${credential.issuer}`;
}

type CredentialsProps = {
	credentials: readonly Credential[];
};

/**
 * The one Credential renderer, shared by the homepage and /credentials. Rows
 * are identical on both; only the surrounding chrome and how many records
 * they receive differ.
 */
export function CredentialList({ credentials }: CredentialsProps) {
	return (
		<Reveal>
			<ul className="border-b">
				{credentials.map((credential) => (
					<li
						key={credential.id}
						className="border-t py-8 first:border-t-0 first:pt-0"
					>
						<h3 className="text-lg leading-tight font-semibold">
							{credential.title}
						</h3>
						<p className="metadata mt-2">
							{credential.issuer}
							<span aria-hidden> · </span>
							<time dateTime={credential.earnedOn}>
								{formatCredentialDate(credential.earnedOn)}
							</time>
						</p>
						<p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
							{credential.description}
						</p>
						<details className="group mt-4">
							<summary className="inline-flex cursor-pointer list-none items-center text-sm font-medium text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
								<ArrowRightIcon
									className="mr-1.5 size-4 transition-transform group-open:rotate-90"
									aria-hidden
								/>
								View certificate
							</summary>
							<Picture
								picture={credential.certificate}
								alt={getCertificateAlt(credential)}
								sizes="(min-width: 768px) 640px, 100vw"
								className="mt-3 block max-w-2xl overflow-hidden rounded-md border bg-muted"
							/>
						</details>
						{credential.verificationUrl ? (
							<VerificationLink url={credential.verificationUrl} />
						) : null}
					</li>
				))}
			</ul>
		</Reveal>
	);
}

export function FeaturedCredentials({ credentials }: CredentialsProps) {
	return (
		<Section id="credentials">
			<SectionHeading kicker="credentials" title="Credentials" />
			<CredentialList credentials={credentials} />
			<Button asChild variant="brand-link" className="mt-6">
				<Link to="/credentials">
					View all credentials
					<ArrowRightIcon data-icon="inline-end" aria-hidden />
				</Link>
			</Button>
		</Section>
	);
}

function VerificationLink({ url }: { url: string }) {
	return (
		<Button asChild variant="outline" size="sm" className="mt-4">
			<a
				href={url}
				target="_blank"
				rel="noreferrer"
				aria-label="Verify credential (opens in a new tab)"
			>
				Verify credential
				<ExternalLinkIcon data-icon="inline-end" aria-hidden />
			</a>
		</Button>
	);
}
