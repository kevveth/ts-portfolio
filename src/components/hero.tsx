import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "ui-library";
import { HeroBlobs } from "#/components/hero-blobs";
import { Reveal } from "#/components/reveal";
import { Section } from "#/components/section";
import { getFeaturedProject } from "#/content/projects";
import { SITE } from "#/content/site";

export function Hero() {
	const featured = getFeaturedProject();

	return (
		<div className="relative">
			<HeroBlobs />
			<div aria-hidden className="bg-grid absolute inset-0 -z-10" />
			<Section className="py-20 sm:py-28">
				<Reveal>
					<p className="kicker mb-5">
						<span aria-hidden className="text-brand">
							${" "}
						</span>
						whoami
					</p>
					<h1 className="text-4xl font-bold tracking-tight text-balance sm:text-6xl">
						{SITE.name}
					</h1>
					<p className="mt-4 max-w-2xl text-xl text-balance sm:text-2xl">
						<span className="font-semibold text-brand">{SITE.role}.</span>{" "}
						{SITE.headline}
					</p>
					<p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
						{SITE.bio}
					</p>
					<div className="mt-9 flex flex-wrap items-center gap-3">
						<Button asChild size="lg" variant="glass" glassColor="sapphire">
							<Link to="/projects/$slug" params={{ slug: featured.slug }}>
								View the case study
								<ArrowRight aria-hidden />
							</Link>
						</Button>
						<Button asChild size="lg" variant="glass">
							<a href={`mailto:${SITE.email}`}>
								<Mail aria-hidden />
								Get in touch
							</a>
						</Button>
					</div>
				</Reveal>
			</Section>
		</div>
	);
}
