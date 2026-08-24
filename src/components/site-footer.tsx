import { CONTACT_CHANNELS } from "#/components/contact-links";
import { SITE } from "#/content/site";

export function SiteFooter() {
	return (
		<footer className="border-t">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground">
						© <time dateTime={SITE.copyrightYear}>{SITE.copyrightYear}</time>{" "}
						{SITE.name}
					</p>
					<p className="font-mono text-xs text-muted-foreground">
						built with TanStack Start · deployed on Vercel
					</p>
				</div>
				{/* <address> is the element for the page author's own contact
				    details — exactly what these channels are. It defaults to
				    italic, hence not-italic. */}
				<nav aria-label="Contact">
					<address className="flex items-center gap-5 not-italic">
						{CONTACT_CHANNELS.map((channel) => (
							<a
								key={channel.label}
								href={channel.href}
								className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
								{...(channel.external
									? { target: "_blank", rel: "noreferrer" }
									: {})}
							>
								{channel.label}
							</a>
						))}
					</address>
				</nav>
			</div>
		</footer>
	);
}
