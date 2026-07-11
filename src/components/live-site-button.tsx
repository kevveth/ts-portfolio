import { ExternalLink } from "lucide-react";
import { Button } from "ui-library";

/** Shared "Visit live site" CTA — opens a project's liveUrl in a new tab. */
export function LiveSiteButton({
	href,
	variant = "default",
}: {
	href: string;
	variant?: "default" | "outline";
}) {
	return (
		<Button asChild variant={variant}>
			<a href={href} target="_blank" rel="noreferrer">
				Visit live site
				<ExternalLink aria-hidden />
			</a>
		</Button>
	);
}
