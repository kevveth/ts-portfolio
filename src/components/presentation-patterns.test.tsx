// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContentState } from "#/components/content-state";
import {
	ProjectActions,
	ProjectMeta,
	TechStack,
} from "#/components/project-patterns";
import { PageIntro, Section } from "#/components/section";
import { Surface } from "#/components/surface";
import type { Project } from "#/content/projects";

const projectPicture: ImagetoolsPicture = {
	sources: { webp: "/example.webp 1200w" },
	img: { src: "/example.png", w: 1200, h: 800 },
};

const project: Project = {
	projectId: "example",
	title: "Example project",
	tagline: "A useful example",
	cover: {
		picture: projectPicture,
		thumbnail: projectPicture,
		alt: "Example project cover",
	},
	socialImage: "/og/example.jpg",
	role: "Design and build",
	year: "2026",
	status: "live",
	stack: ["React", "TypeScript"],
	liveUrl: "https://example.com",
	summary: "Summary",
	problem: "Problem",
	approach: "Approach",
	highlights: [],
	outcomes: [],
	gallery: [],
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

	it("renders project metadata and a labeled technology list", () => {
		render(
			<>
				<ProjectMeta project={project} />
				<TechStack stack={project.stack} />
			</>,
		);
		expect(screen.getByText("Design and build")).toBeInTheDocument();
		const year = screen.getByText("2026");
		expect(year.tagName).toBe("TIME");
		expect(year).toHaveAttribute("datetime", "2026");
		// Terms are present but sr-only, so the rendered line is unchanged.
		expect(screen.getByText("Role")).toHaveClass("sr-only");
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

	it("renders empty-state copy without a misleading live region", () => {
		const { container } = render(<ContentState>Nothing to show.</ContentState>);
		expect(screen.getByText("Nothing to show.")).toBeInTheDocument();
		// Static SSR content that never updates must not announce itself.
		expect(container.querySelector('[role="status"]')).toBeNull();
	});
});
