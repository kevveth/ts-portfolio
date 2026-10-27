import { ExternalLinkIcon, ImageIcon } from "lucide-react";
import {
	formatCredentialDate,
	getCertificateAlt,
} from "#/components/credentials";
import { Picture } from "#/components/picture";
import { Reveal } from "#/components/reveal";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import type { Credential } from "#/content/credentials";
import { SITE } from "#/content/site";
import { cn } from "#/lib/utils";

type CredentialCollectionProps = {
	credentials: readonly Credential[];
	headingLevel?: "h2" | "h3";
};

/** Full collection with certificate previews and issuer verification. */
export function CredentialCollection({
	credentials,
	headingLevel: RowHeading = "h2",
}: CredentialCollectionProps) {
	return (
		<Reveal>
			<ul className="credential-collection">
				{credentials.map((credential) => (
					<li key={credential.id}>
						<CredentialMetadata credential={credential} />
						<RowHeading>{credential.title}</RowHeading>
						<p className="credential-description">{credential.description}</p>
						<div className="credential-actions">
							{credential.verificationUrl ? (
								<VerificationLink credential={credential} />
							) : null}
							<CertificateDialog credential={credential} />
						</div>
					</li>
				))}
			</ul>
		</Reveal>
	);
}

function CredentialMetadata({
	credential,
	className,
}: {
	credential: Credential;
	className?: string;
}) {
	return (
		<p className={cn("metadata uppercase tracking-wide", className)}>
			{credential.issuer}
			<span aria-hidden> · </span>
			<time dateTime={credential.earnedOn}>
				{formatCredentialDate(credential.earnedOn)}
			</time>
		</p>
	);
}

function VerificationLink({ credential }: { credential: Credential }) {
	if (!credential.verificationUrl) return null;

	return (
		<Button asChild variant="brand-link" size="sm">
			<a
				href={credential.verificationUrl}
				target="_blank"
				rel="noreferrer"
				aria-label={`Verify ${credential.title} credential (opens in a new tab)`}
			>
				Verify
				<ExternalLinkIcon data-icon="inline-end" aria-hidden />
			</a>
		</Button>
	);
}

function CertificateDialog({ credential }: { credential: Credential }) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="brand-link" size="sm">
					Certificate
					<ImageIcon data-icon="inline-end" aria-hidden />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-4xl">
				<DialogHeader className="pr-8">
					<DialogTitle>{credential.title} certificate</DialogTitle>
					<DialogDescription>
						Issued to {SITE.name} by {credential.issuer} on{" "}
						{formatCredentialDate(credential.earnedOn)}.
					</DialogDescription>
				</DialogHeader>
				<Picture
					picture={credential.certificate}
					alt={getCertificateAlt(credential)}
					sizes="(min-width: 640px) 832px, calc(100vw - 4rem)"
					loading="eager"
					className="block overflow-hidden rounded-md border bg-muted"
				/>
			</DialogContent>
		</Dialog>
	);
}
