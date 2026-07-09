import type { Activity } from "react-activity-calendar";
import { z } from "zod";
import { SITE } from "#/content/site";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Shape of a single day from GitHub's contributionCalendar GraphQL response. */
export type GitHubContribution = {
	date: string;
	contributionCount: number;
};

/** Discriminated union returned by the fetch function. */
export type ContributionResult =
	| { ok: true; data: Activity[] }
	| { ok: false; error: string };

// ---------------------------------------------------------------------------
// Zod schema for runtime validation of the GraphQL response
// ---------------------------------------------------------------------------

const contributionDaySchema = z.object({
	date: z.string(),
	contributionCount: z.number().int().min(0),
});

const weekSchema = z.object({
	contributionDays: z.array(contributionDaySchema),
});

const contributionCalendarSchema = z.object({
	weeks: z.array(weekSchema),
});

const graphqlDataSchema = z.object({
	data: z.object({
		user: z
			.object({
				contributionsCollection: z.object({
					contributionCalendar: contributionCalendarSchema,
				}),
			})
			.nullable(),
	}),
});

// ---------------------------------------------------------------------------
// Mapping — raw counts → 0–4 levels for react-activity-calendar
// ---------------------------------------------------------------------------

/**
 * Quantize a raw contribution count into a 0-4 activity level.
 *
 * Levels are modeled after GitHub's own contributionLevel semantics:
 *   0 = no activity
 *   1 = low   (1–4)
 *   2 = moderate (5–9)
 *   3 = high  (10–19)
 *   4 = intense (20+)
 */
export function quantizeLevel(count: number): 0 | 1 | 2 | 3 | 4 {
	if (count === 0) return 0;
	if (count <= 4) return 1;
	if (count <= 9) return 2;
	if (count <= 19) return 3;
	return 4;
}

/**
 * Map raw GitHub contribution days into the `Activity[]` shape expected by
 * `react-activity-calendar`. Each day gets its `date`, `count`, and a
 * quantized `level` in 0–4.
 */
export function mapContributions(days: GitHubContribution[]): Activity[] {
	return days.map((day) => ({
		date: day.date,
		count: day.contributionCount,
		level: quantizeLevel(day.contributionCount),
	}));
}

// ---------------------------------------------------------------------------
// Fetch — call GitHub's GraphQL API with a PAT
// ---------------------------------------------------------------------------

const GITHUB_GQL_ENDPOINT = "https://api.github.com/graphql";

const CONTRIBUTIONS_QUERY = `
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}`;

/**
 * Fetch the last year's contribution calendar from GitHub's GraphQL API.
 *
 * Returns `{ ok: true, data: Activity[] }` on success or
 * `{ ok: false, error: string }` on failure (missing token, network error,
 * GraphQL errors, or invalid response shape).
 *
 * The PAT (GITHUB_TOKEN) must be available at build time — it is read from
 * `process.env` and never shipped to the client bundle.
 */
export async function fetchContributions(): Promise<ContributionResult> {
	const token = import.meta.env.GITHUB_TOKEN;
	if (!token) {
		return { ok: false, error: "GITHUB_TOKEN is not set" };
	}

	const now = new Date();
	const to = now.toISOString();
	const from = new Date(
		now.getFullYear() - 1,
		now.getMonth(),
		now.getDate(),
	).toISOString();

	try {
		const response = await fetch(GITHUB_GQL_ENDPOINT, {
			method: "POST",
			headers: {
				Authorization: `bearer ${token}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				query: CONTRIBUTIONS_QUERY,
				variables: { username: SITE.githubUsername, from, to },
			}),
		});

		if (!response.ok) {
			return {
				ok: false,
				error: `GitHub API returned ${response.status}`,
			};
		}

		const json: unknown = await response.json();
		const parsed = graphqlDataSchema.safeParse(json);

		if (!parsed.success) {
			return { ok: false, error: "Activity data unavailable right now" };
		}

		if (parsed.data.data.user === null) {
			return { ok: false, error: `User "${SITE.githubUsername}" not found` };
		}

		const days =
			parsed.data.data.user.contributionsCollection.contributionCalendar.weeks.flatMap(
				(week) => week.contributionDays,
			);

		return { ok: true, data: mapContributions(days) };
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : "Unknown error",
		};
	}
}
