// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { ContentState } from "#/components/content-state";
import {
	ProjectActions,
	ProjectMeta,
	TechStack,
} from "#/components/project-patterns";
import { PageIntro, Section } from "#/components/section";
import { Surface } from "#/components/surface";
import type { Project } from "#/content/projects";

vi.mock("ui-library", () => ({
	Button: ({ children }: { children: ReactNode }) => children,
}));

const project: Project = {
	slug: "example",
	title: "Example project",
	tagline: "A useful example",
	role: "Design and build",
	year: "2026",
	status: "live",
	stack: ["React", "TypeScript"],
	liveUrl: "https://example.com",
	featured: false,
	summary: "Summary",
	problem: "Problem",
	approach: "Approach",
	highlights: [],
	outcomes: [],
	gallery: [{ src: "example/cover", alt: "Example" }],
};

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
		render(
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
	});

	it("exposes surface variants for styling", () => {
		const { container } = render(<Surface variant="interactive">Card</Surface>);
		expect(container.firstChild).toHaveAttribute("data-variant", "interactive");
	});

	it("renders project metadata and a labeled technology list", () => {
		render(
			<>
				<ProjectMeta project={project} />
				<TechStack stack={project.stack} />
			</>,
		);
		expect(screen.getByText("Design and build · 2026")).toBeInTheDocument();
		expect(
			screen.getByRole("list", { name: "Technology stack" }),
		).toHaveTextContent("ReactTypeScript");
	});

	it("renders live and contact actions only when requested", () => {
		render(<ProjectActions project={project} contact />);
		expect(
			screen.getByRole("link", { name: /visit example project live site/i }),
		).toHaveAttribute("target", "_blank");
		expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
			"href",
			expect.stringMatching(/^mailto:/),
		);
	});

	it("uses one shared accessible state treatment", () => {
		render(<ContentState>Nothing to show.</ContentState>);
		expect(screen.getByRole("status")).toHaveTextContent("Nothing to show.");
	});
});
