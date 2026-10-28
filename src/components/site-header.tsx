import { Link } from "@tanstack/react-router";
import { LocalTime } from "#/components/local-time";

export function SiteHeader() {
	return (
		<header className="site-frame personal-header">
			<Link to="/" className="site-name">
				kenneth rathbun
			</Link>
			<LocalTime />
		</header>
	);
}
