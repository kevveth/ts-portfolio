import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "#/components/theme-toggle";

export function SiteHeader() {
	return (
		<header className="site-frame personal-header">
			<Link to="/" className="site-name">
				kenneth rathbun
			</Link>
			<p className="site-byline">developer / skateboarder / barista</p>
			<div className="personal-navigation">
				<nav aria-label="Main">
					<Link to="/" hash="work">
						work
					</Link>
					<Link to="/" hash="about">
						about
					</Link>
					<Link to="/" hash="contact">
						contact
					</Link>
				</nav>
				<ThemeToggle />
			</div>
		</header>
	);
}
