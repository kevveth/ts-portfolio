import { CONTACT_CHANNELS } from "#/components/contact-links";
import { SITE } from "#/content/site";

export function SiteFooter() {
	return (
		<footer id="contact" className="site-frame personal-footer">
			<nav aria-label="Contact">
				<address>
					{CONTACT_CHANNELS.map((channel) => (
						<a key={channel.label} href={channel.href} className="text-link">
							{channel.label.toLowerCase()} <span aria-hidden>↗</span>
						</a>
					))}
				</address>
			</nav>
			<p>
				© <time dateTime={SITE.copyrightYear}>{SITE.copyrightYear}</time>{" "}
				{SITE.name}
			</p>
		</footer>
	);
}
