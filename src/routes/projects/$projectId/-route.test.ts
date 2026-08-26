import { describe, expect, it } from "vitest";
import { projects } from "#/content/projects";
import { SITE_URL } from "#/content/site";
import { Route } from "./route";

describe("project route metadata", () => {
	it("uses a dedicated social image instead of the display cover fallback", async () => {
		const head = Route.options.head;
		if (!head) throw new Error("Project route must define head metadata");

		const metadata = await head({ loaderData: projects[0] } as never);
		const openGraphImage = metadata.meta?.find(
			(meta) => meta && "property" in meta && meta.property === "og:image",
		);

		expect(openGraphImage).toMatchObject({
			content: `${SITE_URL}/og/chavos-parlor.jpg`,
		});
		expect(metadata.meta).toEqual(
			expect.arrayContaining([
				{ property: "og:image:type", content: "image/jpeg" },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
			]),
		);
	});
});
