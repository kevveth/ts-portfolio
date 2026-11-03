import { Link } from "@tanstack/react-router";
import { CONTACT_CHANNELS } from "#/components/contact-links";
import { SiteNavigation } from "#/components/site-navigation";
import { ThemeToggle } from "#/components/theme-toggle";

export function SiteFooter() {
	return (
		<footer id="contact" className="site-frame personal-footer">
			<SiteNavigation />
			<div className="footer-secondary">
				<nav aria-label="Contact" className="footer-contact">
					<address>
						{CONTACT_CHANNELS.map((channel) => (
							<a
								key={channel.label}
								href={channel.href}
								className="detail-link"
							>
								<span className="link-label">
									{channel.label.toLowerCase()}
								</span>
							</a>
						))}
					</address>
				</nav>
				<nav aria-label="Privacy" className="footer-privacy">
					<Link to="/privacy" className="detail-link">
						<span className="link-label">privacy</span>
					</Link>
				</nav>
			</div>
			<ThemeToggle />
		</footer>
	);
}
