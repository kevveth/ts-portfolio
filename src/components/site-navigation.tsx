import { Link, useLocation } from "@tanstack/react-router";
import { ThemeToggle } from "#/components/theme-toggle";

export function SiteNavigation() {
	const pathname = useLocation({
		select: (location) => location.pathname.replace(/\/$/, "") || "/",
	});
	const isWork =
		pathname === "/" ||
		pathname === "/projects" ||
		pathname.startsWith("/projects/");
	return (
		<div className="personal-navigation">
			<nav aria-label="Main">
				<a
					href="/#work"
					className="desktop-work-link"
					aria-current={isWork ? "page" : undefined}
				>
					<span className="navigation-label">work</span>
				</a>
				<a
					href="/projects"
					className="mobile-work-link"
					aria-current={isWork ? "page" : undefined}
				>
					<span className="navigation-label">work</span>
				</a>
				<Link
					to="/about"
					aria-current={pathname === "/about" ? "page" : undefined}
				>
					<span className="navigation-label">about</span>
				</Link>
				<Link
					to="/contact"
					aria-current={pathname === "/contact" ? "page" : undefined}
				>
					<span className="navigation-label">contact</span>
				</Link>
			</nav>
			<ThemeToggle />
		</div>
	);
}
