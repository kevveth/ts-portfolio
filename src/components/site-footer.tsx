import { CONTACT_CHANNELS } from "#/components/contact-links";

export function SiteFooter() {
	return (
		<footer id="contact" className="site-frame personal-footer">
			<nav aria-label="Contact">
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
