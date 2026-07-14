import { Button } from "ui-library";
import { CONTACT_CHANNELS } from "#/components/contact-links";
import { Reveal } from "#/components/reveal";
import { Section, SectionHeading } from "#/components/section";

export function ContactCta() {
	return (
		<Section id="contact" className="contact-panel my-8 sm:my-12">
			<SectionHeading
				kicker="contact"
				title="Have a role or a project in mind?"
			/>
			<Reveal>
				<p className="max-w-xl leading-relaxed text-muted-foreground">
					I'm open to full-time engineering roles and select freelance work. The
					fastest way to reach me is email — I read everything.
				</p>
				<div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2">
					{CONTACT_CHANNELS.map((channel, i) => (
						<Button
							key={channel.label}
							asChild
							size="lg"
							variant={i === 0 ? "default" : "link"}
							className={i === 0 ? "portfolio-primary" : "portfolio-link"}
						>
							<a
								href={channel.href}
								{...(channel.external
									? { target: "_blank", rel: "noreferrer" }
									: {})}
							>
								<channel.Icon aria-hidden />
								{i === 0 ? "Email me" : channel.label}
							</a>
						</Button>
					))}
				</div>
			</Reveal>
		</Section>
	);
}
