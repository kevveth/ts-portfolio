import { createFileRoute } from "@tanstack/react-router";
import { SITE, SITE_URL } from "#/content/site";
import { ContactForm } from "./-contact-form";

const TITLE = `Contact | ${SITE.name}`;
const DESCRIPTION =
	"Contact Kenneth Rathbun about opportunities, projects, or a quick hello.";

export const Route = createFileRoute("/contact")({
	head: () => ({
		meta: [
			{ title: TITLE },
			{ name: "description", content: DESCRIPTION },
			{ property: "og:title", content: TITLE },
			{ property: "og:description", content: DESCRIPTION },
			{ property: "og:url", content: `${SITE_URL}/contact` },
			{ name: "twitter:title", content: TITLE },
			{ name: "twitter:description", content: DESCRIPTION },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/contact` }],
	}),
	component: Contact,
});

function Contact() {
	return (
		<article className="site-frame contact-page">
			<h1 className="index-label">Contact</h1>
			<ContactForm />
			<noscript>
				<p className="contact-alternative">
					The form needs JavaScript.{" "}
					<a href={`mailto:${SITE.email}`}>Email me directly.</a>
				</p>
			</noscript>
		</article>
	);
}
