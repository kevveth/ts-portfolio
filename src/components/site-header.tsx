import { Link } from "@tanstack/react-router";
import { LocalTime } from "#/components/local-time";
import { ThemeToggle } from "#/components/theme-toggle";

export function SiteHeader() {
	return (
		<header className="site-frame personal-header">
			<div className="header-identity">
				<Link to="/" className="site-name">
					kenneth rathbun
				</Link>
				<div className="header-theme">
					<ThemeToggle />
				</div>
			</div>
			<LocalTime />
		</header>
	);
}
