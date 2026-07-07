"use client";

import { Link } from "@tanstack/react-router";
import { Github, Menu } from "lucide-react";
import { useState } from "react";
import { CONTACT_CHANNELS } from "#/components/contact-links";
import { ThemeToggle } from "#/components/theme-toggle";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "#/components/ui/sheet";
import { SITE } from "#/content/site";

export function SiteHeader() {
	const [open, setOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
			<div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
				<Link
					to="/"
					className="font-mono text-sm font-medium tracking-tight text-foreground"
				>
					<span aria-hidden className="text-brand">
						~/
					</span>
					kenneth-rathbun
				</Link>
				<div className="flex items-center gap-0.5 sm:gap-1">
					<nav
						aria-label="Main"
						className="hidden items-center gap-0.5 md:flex sm:gap-1"
					>
						{SITE.nav.map((item) => (
							<Link
								key={item.to}
								to={item.to}
								className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
								activeProps={{ className: "text-foreground" }}
								activeOptions={{ exact: item.to === "/" }}
							>
								{item.label}
							</Link>
						))}
						<Button variant="ghost" size="icon" asChild>
							<a
								href={SITE.github}
								target="_blank"
								rel="noreferrer"
								aria-label="GitHub profile"
							>
								<Github aria-hidden />
							</a>
						</Button>
					</nav>
					<Sheet open={open} onOpenChange={setOpen}>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="md:hidden"
								aria-label="Open menu"
							>
								<Menu aria-hidden />
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="gap-0">
							<SheetHeader>
								<SheetTitle className="sr-only">Navigation</SheetTitle>
								<SheetDescription className="sr-only">
									Site navigation and contact links.
								</SheetDescription>
							</SheetHeader>
							<nav aria-label="Main" className="flex flex-col gap-0.5 px-2">
								{SITE.nav.map((item) => (
									<Link
										key={item.to}
										to={item.to}
										onClick={() => setOpen(false)}
										className="rounded-md px-4 py-3 text-base text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
										activeProps={{ className: "text-foreground" }}
										activeOptions={{ exact: item.to === "/" }}
									>
										{item.label}
									</Link>
								))}
							</nav>
							<Separator className="my-2" />
							<nav
								aria-label="Contact"
								className="flex flex-col gap-0.5 px-2 pb-4"
							>
								<p className="px-4 pb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
									Contact
								</p>
								{CONTACT_CHANNELS.map((channel) => (
									<a
										key={channel.label}
										href={channel.href}
										aria-label={channel.label}
										onClick={() => setOpen(false)}
										className="flex items-center gap-3 rounded-md px-4 py-3 text-base text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
										{...(channel.external
											? { target: "_blank", rel: "noreferrer" }
											: {})}
									>
										<channel.Icon aria-hidden className="size-4" />
										{channel.label}
									</a>
								))}
							</nav>
						</SheetContent>
					</Sheet>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
