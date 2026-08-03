import { ArrowRightIcon, ExternalLinkIcon, Maximize2Icon } from "lucide-react";
import { Picture } from "#/components/picture";
import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { Surface } from "#/components/surface";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import {
	type Credential,
	type DateOnly,
	getPreferredCredentialEvidence,
} from "#/content/credentials";
import { getCredentialPreview } from "#/lib/credential-images";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

function formatCredentialDate(date: DateOnly): string {
	return DATE_FORMATTER.format(new Date(`${date}T00:00:00Z`));
}

function getCertificateAlt(credential: Credential): string {
	return `${credential.title} certificate issued to Kenneth Rathbun by ${credential.issuer}`;
}

type CredentialsProps = {
	credentials: readonly Credential[];
};

export function FeaturedCredentials({ credentials }: CredentialsProps) {
	return (
		<Section id="credentials">
			<SectionHeading kicker="credentials" title="Credentials" />
			<Reveal>
				<ul className="border-b">
					{credentials.map((credential) => (
						<li
							key={credential.id}
							className="grid gap-5 border-t py-6 first:pt-0 first:border-t-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
						>
							<div className="min-w-0">
								<h3 className="text-lg leading-tight font-semibold">
									{credential.title}
								</h3>
								<CredentialMetadata credential={credential} />
								<p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
									{credential.description}
								</p>
							</div>
							<PreferredEvidenceAction credential={credential} />
						</li>
					))}
				</ul>
				<Button asChild variant="brand-link" className="mt-6">
					<a href="/credentials">
						View all credentials
						<ArrowRightIcon data-icon="inline-end" aria-hidden />
					</a>
				</Button>
			</Reveal>
		</Section>
	);
}

export function CredentialCollection({ credentials }: CredentialsProps) {
	return (
		<Reveal>
			<div className="grid gap-8 md:grid-cols-2">
				{credentials.map((credential) => (
					<Surface
						key={credential.id}
						padding="none"
						className="flex h-full flex-col overflow-hidden"
					>
						{credential.certificateKey ? (
							<Picture
								picture={getCredentialPreview(credential.certificateKey)}
								alt={getCertificateAlt(credential)}
								sizes="(min-width: 1024px) 496px, (min-width: 768px) 50vw, 100vw"
								className="flex aspect-[4/3] items-center justify-center border-b bg-muted p-3"
								imgClassName="max-h-full w-auto max-w-full object-contain"
							/>
						) : null}
						<div className="flex flex-1 flex-col p-5 sm:p-6">
							<h2 className="text-xl leading-tight font-semibold">
								{credential.title}
							</h2>
							<CredentialMetadata credential={credential} showExpiration />
							<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
								{credential.description}
							</p>
							<div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
								{credential.certificateKey ? (
									<CertificateLightbox credential={credential} />
								) : null}
								{credential.verificationUrl ? (
									<VerificationLink url={credential.verificationUrl} />
								) : null}
							</div>
						</div>
					</Surface>
				))}
			</div>
		</Reveal>
	);
}

function CredentialMetadata({
	credential,
	showExpiration = false,
}: {
	credential: Credential;
	showExpiration?: boolean;
}) {
	return (
		<p className="metadata mt-2">
			{credential.issuer}
			<span aria-hidden> · </span>
			<time dateTime={credential.earnedOn}>
				{formatCredentialDate(credential.earnedOn)}
			</time>
			{showExpiration && credential.expiresOn ? (
				<>
					<span aria-hidden> · </span>
					<span>
						Expiration:{" "}
						<time dateTime={credential.expiresOn}>
							{formatCredentialDate(credential.expiresOn)}
						</time>
					</span>
				</>
			) : null}
		</p>
	);
}

function PreferredEvidenceAction({ credential }: { credential: Credential }) {
	const evidence = getPreferredCredentialEvidence(credential);

	return evidence.type === "verification" ? (
		<VerificationLink url={evidence.url} />
	) : (
		<CertificateLightbox credential={credential} />
	);
}

function VerificationLink({ url }: { url: string }) {
	return (
		<Button asChild variant="outline" size="sm">
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

function CertificateLightbox({ credential }: { credential: Credential }) {
	if (!credential.certificateKey) return null;

	const earnedOn = formatCredentialDate(credential.earnedOn);
	const preview = getCredentialPreview(credential.certificateKey);

	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Maximize2Icon data-icon="inline-start" aria-hidden />
					View certificate
				</Button>
			</DialogTrigger>
			<DialogContent className="flex max-h-[calc(100svh-2rem)] flex-col gap-4 overflow-hidden p-4 sm:max-w-[calc(100%-2rem)] sm:p-6 2xl:max-w-7xl">
				<DialogHeader className="pr-8 text-left">
					<DialogTitle>{credential.title} certificate</DialogTitle>
					<DialogDescription>
						Issued by {credential.issuer} on {earnedOn}. Full certificate
						preview.
					</DialogDescription>
				</DialogHeader>
				<Picture
					picture={preview}
					alt={getCertificateAlt(credential)}
					sizes="(min-width: 1280px) 1152px, calc(100vw - 4rem)"
					className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-md border bg-muted"
					imgClassName="h-auto max-h-[calc(100svh-10rem)] w-auto max-w-full object-contain"
				/>
			</DialogContent>
		</Dialog>
	);
}
