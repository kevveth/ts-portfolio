import { Link } from "@tanstack/react-router";
import { LocalTime } from "#/components/local-time";
import { ThemeToggle } from "#/components/theme-toggle";

export function SiteHeader() {
	return (
		<header className="site-frame personal-header">
			<Link to="/" className="site-name">
				kenneth rathbun
			</Link>
			<LocalTime />
			<div className="personal-navigation">
				<nav aria-label="Main">
					<a href="/#work">
						<span className="navigation-label">work</span>
					</a>
					<a href="/#about">
						<span className="navigation-label">about</span>
					</a>
					<a href="/#contact">
						<span className="navigation-label">contact</span>
					</a>
				</nav>
				<ThemeToggle />
			</div>
		</header>
	);
}
