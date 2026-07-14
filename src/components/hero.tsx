import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Mail } from "lucide-react";
import { Button } from "ui-library";
import { HeroBlobs } from "#/components/hero-blobs";
import { Reveal } from "#/components/reveal";
import { Section } from "#/components/section";
import { SITE } from "#/content/site";

export function Hero() {
	return (
		<div className="hero-arena relative isolate overflow-hidden">
			<div aria-hidden className="absolute inset-0 -z-20">
				<HeroBlobs />
			</div>
			<Section className="relative py-20 sm:py-28">
				<div
					aria-hidden
					className="hero-copy-wash absolute inset-y-10 left-0 z-0 w-[min(48rem,92%)]"
				/>
				<Reveal className="relative z-10">
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
						<span className="hero-role font-semibold">{SITE.role}.</span>{" "}
						{SITE.headline}
					</p>
					<p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
						{SITE.bio}
					</p>
					<div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2">
						<Button asChild size="lg" className="portfolio-primary">
							<a href={`mailto:${SITE.email}`}>
								<Mail aria-hidden />
								Start a conversation
							</a>
						</Button>
						<Button asChild size="lg" variant="link" className="portfolio-link">
							<Link to="/projects">
								Explore projects
								<ArrowUpRight aria-hidden />
							</Link>
						</Button>
					</div>
				</Reveal>
			</Section>
		</div>
	);
}
