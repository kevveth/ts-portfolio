import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react";
import { Picture } from "#/components/picture";
import { Reveal } from "#/components/reveal";
import { Button } from "#/components/ui/button";
import type { Credential } from "#/content/credentials";
import { SITE } from "#/content/site";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

export function formatCredentialDate(date: Credential["earnedOn"]): string {
	return DATE_FORMATTER.format(new Date(`${date}T00:00:00Z`));
}

export function getCertificateAlt(credential: Credential): string {
	return `${credential.title} certificate issued to ${SITE.name} by ${credential.issuer}`;
}

type CredentialsProps = {
	credentials: readonly Credential[];
};

type CredentialListProps = CredentialsProps & {
	/** Level for each row's title beneath its surrounding section heading. */
	headingLevel?: "h2" | "h3";
};

/** Compact credential treatment used by the homepage. */
export function CredentialList({
	credentials,
	headingLevel: RowHeading = "h3",
}: CredentialListProps) {
	return (
		<Reveal>
			<ul className="border-b">
				{credentials.map((credential) => (
					<li
						key={credential.id}
						className="border-t py-8 first:border-t-0 first:pt-0"
					>
						<RowHeading className="text-lg leading-tight font-semibold text-balance">
							{credential.title}
						</RowHeading>
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
						{/* Shared `name` makes these mutually exclusive natively. */}
						<details name="credential-certificates" className="group mt-4">
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
							<Button asChild variant="outline" size="sm" className="mt-4">
								<a
									href={credential.verificationUrl}
									target="_blank"
									rel="noreferrer"
									aria-label={`Verify ${credential.title} credential (opens in a new tab)`}
								>
									Verify credential
									<ExternalLinkIcon data-icon="inline-end" aria-hidden />
								</a>
							</Button>
						) : null}
					</li>
				))}
			</ul>
		</Reveal>
	);
}
