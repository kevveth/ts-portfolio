import { ExternalLinkIcon, Maximize2Icon } from "lucide-react";
import { Picture } from "#/components/picture";
import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { Surface } from "#/components/surface";
import { Badge } from "#/components/ui/badge";
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
	getAllCredentials,
} from "#/content/credentials";
import { getCredentialPreview } from "#/lib/credential-images";
import { cn } from "#/lib/utils";

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

export function formatCredentialDate(date: DateOnly): string {
	return DATE_FORMATTER.format(new Date(`${date}T00:00:00Z`));
}

type CredentialsProps = {
	credentials?: readonly Credential[];
};

export function Credentials({
	credentials = getAllCredentials(),
}: CredentialsProps) {
	const hasMultipleCredentials = credentials.length > 1;

	return (
		<Section id="credentials">
			<SectionHeading kicker="credentials" title="Certificates & credentials" />
			<Reveal>
				<div
					className={cn(
						"grid gap-4",
						hasMultipleCredentials ? "md:grid-cols-2" : "max-w-3xl",
					)}
				>
					{credentials.map((credential) => (
						<CredentialCard key={credential.id} credential={credential} />
					))}
				</div>
			</Reveal>
		</Section>
	);
}

function CredentialCard({ credential }: { credential: Credential }) {
	const preview = getCredentialPreview(credential.previewKey);
	const earnedOn = formatCredentialDate(credential.earnedOn);

	return (
		<Surface padding="md" className="flex h-full flex-col">
			<header className="flex flex-col gap-3">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<h3 className="text-lg leading-tight font-semibold">
						{credential.title}
					</h3>
					<Badge variant="brand">{credential.kind}</Badge>
				</div>
				<p className="metadata">
					{credential.issuer}
					<span aria-hidden> · </span>
					<time dateTime={credential.earnedOn}>{earnedOn}</time>
					{credential.expiresOn ? (
						<>
							<span aria-hidden> · </span>
							<span>
								Expires{" "}
								<time dateTime={credential.expiresOn}>
									{formatCredentialDate(credential.expiresOn)}
								</time>
							</span>
						</>
					) : null}
				</p>
			</header>

			<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
				{credential.summary}
			</p>

			<ul
				aria-label={`${credential.title} topics`}
				className="mt-4 flex flex-wrap gap-2"
			>
				{credential.topics.map((topic) => (
					<li key={topic}>
						<Badge variant="outline">{topic}</Badge>
					</li>
				))}
			</ul>

			<div className="mt-auto flex flex-wrap items-center gap-2 pt-5">
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
							alt={`${credential.title} certificate issued to Kenneth Rathbun by ${credential.issuer}`}
							sizes="(min-width: 1280px) 1152px, calc(100vw - 4rem)"
							className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-md border bg-muted"
							imgClassName="h-auto max-h-[calc(100svh-10rem)] w-auto max-w-full object-contain"
						/>
					</DialogContent>
				</Dialog>

				{credential.verificationUrl ? (
					<Button asChild variant="link" size="sm">
						<a
							href={credential.verificationUrl}
							target="_blank"
							rel="noreferrer"
						>
							Verify credential
							<ExternalLinkIcon data-icon="inline-end" aria-hidden />
						</a>
					</Button>
				) : null}
			</div>
		</Surface>
	);
}
