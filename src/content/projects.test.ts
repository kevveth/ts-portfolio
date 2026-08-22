import { describe, expect, it } from "vitest";
import { getProject, projects } from "./projects";

describe("projects", () => {
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
