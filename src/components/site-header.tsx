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
					<a href="/#work">work</a>
					<a href="/#about">about</a>
					<a href="/#contact">contact</a>
				</nav>
				<ThemeToggle />
			</div>
		</header>
	);
}
