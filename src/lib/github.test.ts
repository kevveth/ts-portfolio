import { describe, expect, it } from "vitest";
import {
	type GitHubContribution,
	mapContributions,
	quantizeLevel,
} from "./github";

describe("quantizeLevel", () => {
	it("returns 0 for zero contributions", () => {
		expect(quantizeLevel(0)).toBe(0);
	});

	it("returns 1 for low activity (1-4)", () => {
		expect(quantizeLevel(1)).toBe(1);
		expect(quantizeLevel(4)).toBe(1);
	});

	it("returns 2 for moderate activity (5-9)", () => {
		expect(quantizeLevel(5)).toBe(2);
		expect(quantizeLevel(9)).toBe(2);
	});

	it("returns 3 for high activity (10-19)", () => {
		expect(quantizeLevel(10)).toBe(3);
		expect(quantizeLevel(19)).toBe(3);
	});

	it("returns 4 for intense activity (20+)", () => {
		expect(quantizeLevel(20)).toBe(4);
		expect(quantizeLevel(100)).toBe(4);
	});
});

describe("mapContributions", () => {
	const sampleDays: GitHubContribution[] = [
		{ date: "2026-01-01", contributionCount: 0 },
		{ date: "2026-01-02", contributionCount: 3 },
		{ date: "2026-01-03", contributionCount: 7 },
		{ date: "2026-01-04", contributionCount: 15 },
		{ date: "2026-01-05", contributionCount: 42 },
	];

	it("maps contributionCount to level 0-4 with date and count", () => {
		const result = mapContributions(sampleDays);
		expect(result).toHaveLength(5);
		expect(result).toEqual([
			{ date: "2026-01-01", count: 0, level: 0 },
			{ date: "2026-01-02", count: 3, level: 1 },
			{ date: "2026-01-03", count: 7, level: 2 },
			{ date: "2026-01-04", count: 15, level: 3 },
			{ date: "2026-01-05", count: 42, level: 4 },
		]);
	});

	it("handles empty input", () => {
		expect(mapContributions([])).toEqual([]);
	});

	it("all-zero contributions map to all level 0", () => {
		const zeros: GitHubContribution[] = [
			{ date: "2026-01-01", contributionCount: 0 },
			{ date: "2026-01-02", contributionCount: 0 },
		];
		const result = mapContributions(zeros);
		expect(result.every((d) => d.level === 0)).toBe(true);
	});
});
