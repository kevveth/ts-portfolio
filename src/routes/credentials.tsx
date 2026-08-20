import { createFileRoute } from "@tanstack/react-router";
import { CredentialList } from "#/components/credentials";
import { PageIntro, Section } from "#/components/section";
import { allCredentials } from "#/content/credentials";
import { SITE, SITE_URL } from "#/content/site";

const TITLE = `Credentials | ${SITE.name}`;
const DESCRIPTION =
	"A complete collection of role-relevant credentials, with certificate and verification evidence.";

export const Route = createFileRoute("/credentials")({
	head: () => ({
		meta: [
			{ title: TITLE },
			{ name: "description", content: DESCRIPTION },
			{ property: "og:title", content: TITLE },
			{ property: "og:description", content: DESCRIPTION },
			{ property: "og:url", content: `${SITE_URL}/credentials` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/credentials` }],
	}),
	component: CredentialsPage,
});

function CredentialsPage() {
	// Static, compile-time content — a loader would only park it in the eager
	// route bundle and dehydrate a second copy into the HTML.
	return (
		<Section width="wide">
			<PageIntro
				kicker="credential collection"
				title="Credentials"
				description="Achievements supported by issuer-provided certificate previews and official verification where available."
				className="mb-10"
			/>
			<CredentialList credentials={allCredentials} />
		</Section>
	);
}
