import { CONTACT_CHANNELS } from "#/components/contact-links";
import { SiteNavigation } from "#/components/site-navigation";

export function SiteFooter() {
	return (
		<footer id="contact" className="site-frame personal-footer">
			<SiteNavigation />
			<nav aria-label="Contact" className="footer-contact">
				<address>
					{CONTACT_CHANNELS.map((channel) => (
						<a key={channel.label} href={channel.href} className="detail-link">
							{channel.label.toLowerCase()}
						</a>
					))}
				</address>
			</nav>
		</footer>
	);
}
