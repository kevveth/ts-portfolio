import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "#/components/theme-toggle";

export function SiteNavigation() {
	return (
		<div className="personal-navigation">
			<nav aria-label="Main">
				<a href="/#work">
					<span className="navigation-label font-bold">work</span>
				</a>
				<Link to="/about">
					<span className="navigation-label">about</span>
				</Link>
				<a href="/#contact">
					<span className="navigation-label">contact</span>
				</a>
			</nav>
			<ThemeToggle />
		</div>
	);
}
