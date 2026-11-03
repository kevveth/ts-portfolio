// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageIntro, Section } from "#/components/section";
import { Surface } from "#/components/surface";

describe("presentation patterns", () => {
	it("applies explicit section layout variants", () => {
		const { container } = render(
			<Section width="reading" spacing="compact" divided>
				Content
			</Section>,
		);
		expect(container.firstChild).toHaveClass("max-w-3xl", "py-10", "border-t");
	});

	it("renders a semantic page intro", () => {
		const { container } = render(
			<PageIntro
				kicker="projects"
				title="Selected work"
				description="Case studies"
			/>,
		);
		expect(
			screen.getByRole("heading", { level: 1, name: "Selected work" }),
		).toBeInTheDocument();
		expect(screen.getByText("Case studies")).toHaveClass("page-lede");
		expect(container.querySelector("header > hgroup")).toBeInTheDocument();
	});

	it("exposes surface variants for styling", () => {
		const { container } = render(<Surface variant="interactive">Card</Surface>);
		expect(container.firstChild).toHaveAttribute("data-variant", "interactive");
	});

	it("renders the requested semantic surface element", () => {
		const { container } = render(
			<>
				<Surface as="article">Project</Surface>
				<Surface as="figure">Media</Surface>
			</>,
		);

		expect(
			container.querySelector("article[data-slot='surface']"),
		).toHaveTextContent("Project");
		expect(
			container.querySelector("figure[data-slot='surface']"),
		).toHaveTextContent("Media");
	});
});
