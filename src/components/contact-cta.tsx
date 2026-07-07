import { CONTACT_CHANNELS } from "#/components/contact-links";
import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";
import { Button } from "#/components/ui/button";
import { SITE } from "#/content/site";

export function ContactCta() {
	return (
		<Section id="contact" className="border-t">
			<SectionHeading
				kicker="contact"
				title="Have a role or a project in mind?"
			/>
			<Reveal>
				<p className="max-w-xl leading-relaxed text-muted-foreground">
					I'm open to full-time engineering roles and select freelance work. The
					fastest way to reach me is email — I read everything.
				</p>
				<div className="mt-7 flex flex-wrap items-center gap-3">
					{CONTACT_CHANNELS.map((channel, i) => (
						<Button
							key={channel.label}
							asChild
							size="lg"
							variant={i === 0 ? "default" : "outline"}
						>
							<a
								href={channel.href}
								{...(channel.external
									? { target: "_blank", rel: "noreferrer" }
									: {})}
							>
								<channel.Icon aria-hidden />
								{i === 0 ? SITE.email : channel.label}
							</a>
						</Button>
					))}
				</div>
			</Reveal>
		</Section>
	);
}
