import { describe, expect, it } from "vitest";
import { SITE, SITE_URL } from "#/content/site";
import { Route as RootRoute } from "./__root";
import { Route as HomeRoute } from "./index";

describe("social sharing", () => {
	it("provides matching absolute OG and Twitter images with truthful descriptions and dimensions", async () => {
		const head = RootRoute.options.head;
		if (!head) throw new Error("Root route must define sharing metadata");
		const result = await head({} as never);
		expect(result.meta).toEqual(
			expect.arrayContaining([
				{ property: "og:image", content: `${SITE_URL}/og.png` },
				{ name: "twitter:image", content: `${SITE_URL}/og.png` },
				{ property: "og:image:type", content: "image/png" },
				{ property: "og:image:width", content: "1200" },
				{ property: "og:image:height", content: "630" },
				{
					property: "og:image:alt",
					content: expect.stringContaining("emerald green"),
				},
				{
					name: "twitter:image:alt",
					content: expect.stringContaining("emerald green"),
				},
			]),
		);
	});

	it.each([
		[HomeRoute, SITE.name, SITE.metaDescription],
	])("supplies route-specific Twitter copy alongside Open Graph copy", async (route, title, description) => {
		const head = route.options.head;
		if (!head) throw new Error("Route must define sharing metadata");
		const result = await head({} as never);
		expect(result.meta).toEqual(
			expect.arrayContaining([
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
			]),
		);
	});
});
