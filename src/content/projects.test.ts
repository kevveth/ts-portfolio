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

	it("featured project has a live URL", () => {
		const featured = getFeaturedProject();
		expect(featured.liveUrl).toMatch(/^https:\/\//);
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

	it("every project has non-empty thumbnail alt text", () => {
		for (const project of getAllProjects()) {
			expect(project.thumbAlt.trim().length).toBeGreaterThan(0);
		}
	});

	it("chavos-parlor is live", () => {
		expect(getProject("chavos-parlor")?.status).toBe("live");
	});

	it("separates the live Square widget from the parked custom flow", () => {
		const project = getProject("chavos-parlor");
		expect(project?.productionConstraint).toContain("Free Appointments plan");
		expect(project?.gallery.map((image) => image.src)).toContain(
			"chavos-parlor/booking-widget",
		);
		expect(project?.gallery.map((image) => image.src)).not.toContain(
			"chavos-parlor/wizard-service",
		);
		expect(project?.customFlow?.summary).toContain("Square Plus");
		expect(project?.customFlow?.gallery).toHaveLength(3);
	});

	it("keeps Chavo's current verification count accurate", () => {
		expect(getProject("chavos-parlor")?.highlights).toContainEqual(
			expect.objectContaining({
				title: "Quality gates",
				body: expect.stringContaining("Thirty-nine test files"),
			}),
		);
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
			const images = [
				...project.gallery,
				...(project.customFlow?.gallery ?? []),
			];
			for (const image of images) {
				expect(image.alt.trim().length).toBeGreaterThan(0);
			}
		}
	});
});
