import { createFileRoute } from "@tanstack/react-router";
import { SITE, SITE_URL } from "#/content/site";

const TITLE = `Privacy | ${SITE.name}`;
const DESCRIPTION =
	"How this portfolio handles inquiries, website analytics, and preferences.";

export const Route = createFileRoute("/privacy")({
	head: () => ({
		meta: [
			{ title: TITLE },
			{ name: "description", content: DESCRIPTION },
			{ property: "og:title", content: TITLE },
			{ property: "og:description", content: DESCRIPTION },
			{ property: "og:url", content: `${SITE_URL}/privacy` },
		],
		links: [{ rel: "canonical", href: `${SITE_URL}/privacy` }],
	}),
	component: Privacy,
});

function Privacy() {
	return (
		<article className="site-frame about-page privacy-page">
			<h1 className="index-label">Privacy</h1>
			<p>Updated November 3, 2026.</p>
			<h2>Inquiries</h2>
			<p>
				I use your email address and message, plus any name or subject you
				provide, to respond to your inquiry. Please leave out passwords, payment
				details, and other sensitive information. You do not need an account to
				browse this site or contact me.
			</p>
			<p>
				The site is hosted by Vercel. Contact-form messages are delivered
				through Resend to my iCloud Mail inbox. Direct emails go to that inbox
				through your email provider. The website does not keep a separate
				inquiry database, and I do not use inquiries for mailing lists or
				advertising.
			</p>
			<h2>Keeping and deleting messages</h2>
			<p>
				I delete inquiries that do not become client work from my inbox after 90
				days. Client correspondence may be kept longer for ongoing work and
				records. Providers may retain separate logs or backup copies under their
				own policies.
			</p>
			<h2>Website activity and preferences</h2>
			<p>
				Vercel processes request information, including IP addresses, to host
				and protect the site and limit repeated form submissions. Vercel Web
				Analytics provides aggregate traffic statistics without analytics
				cookies. Your light or dark theme preference is saved in your browser.
			</p>
			<h2>Questions</h2>
			<p>
				For questions or a request to delete your inquiry, email{" "}
				<a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
			</p>
			<p>
				Provider information:{" "}
				<a href="https://resend.com/legal/privacy-policy">Resend</a>,{" "}
				<a href="https://www.apple.com/legal/privacy/">Apple</a>, and{" "}
				<a href="https://vercel.com/docs/analytics/privacy-policy">
					Vercel Web Analytics
				</a>
				.
			</p>
		</article>
	);
}
