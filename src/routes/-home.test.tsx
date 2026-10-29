// @vitest-environment jsdom

import { cleanup, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SiteFooter } from "#/components/site-footer";
import { SiteHeader } from "#/components/site-header";
import { SiteNavigation } from "#/components/site-navigation";
import { SITE } from "#/content/site";
import { renderWithRouter } from "#/test/router";
import { Home } from "./-home";
import { Route } from "./index";

describe("personal homepage", () => {
	afterEach(cleanup);
	it("offers direct project, About page and contact paths", async () => {
		await renderWithRouter(
			<>
				<SiteHeader />
				<Home />
				<SiteFooter />
			</>,
		);
		expect(Route.options.loader).toBeUndefined();
		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
			"Kenneth Rathbun",
		);
		expect(
			screen.getByRole("link", { name: "View Chavo’s Parlor project" }),
		).toHaveAttribute("href", "/projects/chavos-parlor");
		expect(
			screen.queryByRole("link", { name: "credentials" }),
		).not.toBeInTheDocument();
		expect(document.getElementById("about")).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: "email" })).toHaveAttribute(
			"href",
			`mailto:${SITE.email}`,
		);
		expect(screen.getAllByRole("link", { name: "work" })[0]).toHaveAttribute(
			"href",
			"/#work",
		);
		expect(screen.getByRole("link", { name: "about" })).toHaveAttribute(
			"href",
			"/about",
		);
		expect(screen.getByRole("link", { name: "contact" })).toHaveAttribute(
			"href",
			"/contact",
		);
		expect(screen.getAllByRole("link", { name: "work" })[0]).toHaveAttribute(
			"aria-current",
			"page",
		);
		for (const name of ["about", "contact"]) {
			expect(screen.getByRole("link", { name })).not.toHaveAttribute(
				"aria-current",
			);
		}
		expect(screen.getAllByRole("link", { name: "work" })[1]).toHaveAttribute(
			"href",
			"/projects",
		);
		expect(
			screen.getAllByRole("link", { name: "work" })[1],
		).not.toHaveAttribute("aria-current");
		expect(document.getElementById("work")).toBeInTheDocument();

		expect(document.getElementById("contact")).toBeInTheDocument();
	});

	it.each([
		["/", "work"],
		["/#work", "work"],
		["/about", "about"],
		["/contact", "contact"],
		["/projects", "work"],
		["/projects/chavos-parlor", "work"],
	])("marks the current navigation section at %s", async (initialEntry, current) => {
		await renderWithRouter(<SiteNavigation />, initialEntry);
		expect(screen.getAllByRole("link", { name: "work" })[0]).toHaveAttribute(
			"href",
			"/#work",
		);
		expect(screen.getByRole("link", { name: "contact" })).toHaveAttribute(
			"href",
			"/contact",
		);
		for (const name of ["work", "about", "contact"]) {
			const links = screen.getAllByRole("link", { name });
			for (const link of links) {
				const isMobileHomeWork =
					name === "work" &&
					(initialEntry === "/" || initialEntry === "/#work") &&
					link.classList.contains("mobile-work-link");
				if (name === current && !isMobileHomeWork)
					expect(link).toHaveAttribute("aria-current", "page");
				else expect(link).not.toHaveAttribute("aria-current");
			}
		}
	});

	it("provides the real production preview with explicit dimensions", async () => {
		await renderWithRouter(<Home />);
		const image = screen.getByRole("img", {
			name: /production website, captured October 26, 2026/,
		});
		expect(image).toHaveAttribute("loading", "eager");
		expect(image).toHaveAttribute("fetchpriority", "high");
		expect(image).toHaveAttribute("width");
		expect(image).toHaveAttribute("height");
		expect(screen.queryByText("GitHub contributions")).not.toBeInTheDocument();
	});
});
