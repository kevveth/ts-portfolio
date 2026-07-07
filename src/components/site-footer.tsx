import { CONTACT_CHANNELS } from "#/components/contact-links";
import { SITE } from "#/content/site";

export function SiteFooter() {
	return (
		<footer className="border-t">
			<div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
				<div className="space-y-1">
					<p className="text-sm text-muted-foreground" suppressHydrationWarning>
						© {new Date().getFullYear()} {SITE.name}
					</p>
					<p className="font-mono text-xs text-muted-foreground">
						built with TanStack Start · deployed on Vercel
					</p>
				</div>
				<nav aria-label="Contact" className="flex items-center gap-5">
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
				</nav>
			</div>
		</footer>
	);
}
