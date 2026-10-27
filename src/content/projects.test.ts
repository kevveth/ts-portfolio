import { describe, expect, it } from "vitest";
import { getProject, projects } from "./projects";

describe("projects", () => {
	it("describes the maintained Square integration and keeps dated evidence", () => {
		const project = getProject("chavos-parlor");
		expect(project?.approach).toContain(
			"Square manages scheduling, customer records, and payments",
		);
		expect(project?.cover.alt).toContain("October 26, 2026");
		expect(project?.implementation).toContain(
			"TypeScript, React, TanStack Start, and Tailwind",
		);
		expect(project?.highlights[0]?.body).toContain(
			"the Square form’s labels, keyboard navigation, and focus behavior",
		);
		expect(JSON.stringify(project)).not.toMatch(
			/Git history|b96f939|unpaid project/,
		);
	});
	it("finds each project by its route id", () => {
		for (const project of projects) {
			expect(getProject(project.projectId)).toBe(project);
		}
	});

	it("returns undefined for an unknown route id", () => {
		expect(getProject("does-not-exist")).toBeUndefined();
	});

	it("uses unique, route-safe ids", () => {
		const ids = projects.map((project) => project.projectId);

		expect(new Set(ids).size).toBe(ids.length);
		for (const id of ids) {
			expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
		}
	});
});
