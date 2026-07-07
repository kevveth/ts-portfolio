import { describe, expect, it } from "vitest";
import {
	getAllProjects,
	getFeaturedProject,
	getProject,
	getStatusMeta,
	STATUS_META,
} from "./projects";

describe("projects content", () => {
	it("resolves a known slug", () => {
		const project = getProject("chavos-parlor");
		expect(project).toBeDefined();
		expect(project?.title).toBe("Chavo's Parlor");
	});

	it("returns undefined for an unknown slug", () => {
		expect(getProject("does-not-exist")).toBeUndefined();
	});

	it("has a featured project for the Home hero", () => {
		const featured = getFeaturedProject();
		expect(featured.featured).toBe(true);
		expect(featured.slug).toBe("chavos-parlor");
	});

	it("featured project has a live URL and testimonial quote", () => {
		const featured = getFeaturedProject();
		expect(featured.liveUrl).toMatch(/^https:\/\//);
		expect(featured.testimonial?.quote).toBeTruthy();
	});

	it("every project has complete card/case-study fields", () => {
		for (const project of getAllProjects()) {
			expect(project.slug).toMatch(/^[a-z0-9-]+$/);
			expect(project.tagline.length).toBeGreaterThan(0);
			expect(project.highlights.length).toBeGreaterThan(0);
			expect(project.outcomes.length).toBeGreaterThan(0);
			expect(project.gallery.length).toBeGreaterThan(0);
		}
	});

	it("chavos-parlor is live", () => {
		expect(getProject("chavos-parlor")?.status).toBe("live");
	});

	it("every project has a valid status with a non-empty label", () => {
		for (const project of getAllProjects()) {
			expect(STATUS_META).toHaveProperty(project.status);
			expect(getStatusMeta(project.status).label.trim().length).toBeGreaterThan(
				0,
			);
		}
	});

	it("every gallery image has non-empty alt text", () => {
		for (const project of getAllProjects()) {
			for (const image of project.gallery) {
				expect(image.alt.trim().length).toBeGreaterThan(0);
			}
		}
	});
});
