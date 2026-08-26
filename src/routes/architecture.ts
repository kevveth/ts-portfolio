import { readFile } from "node:fs/promises";
import path from "node:path";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/architecture")({
	server: {
		handlers: {
			GET: async () => {
				if (!import.meta.env.DEV) {
					return new Response("Not found", { status: 404 });
				}

				const [{ buildArchitectureMap }, template] = await Promise.all([
					import("#/lib/architecture-map.server"),
					readFile(
						path.join(process.cwd(), "tools/architecture-viewer/index.html"),
						"utf8",
					),
				]);
				const architecture = await buildArchitectureMap();
				const serializedArchitecture = JSON.stringify(architecture).replaceAll(
					"<",
					"\\u003c",
				);
				const html = template.replace(
					"<!--ARCHITECTURE_DATA-->",
					`<script>window.ARCHITECTURE_DATA = ${serializedArchitecture};</script>`,
				);

				return new Response(html, {
					headers: {
						"Cache-Control": "no-store",
						"Content-Type": "text/html; charset=utf-8",
					},
				});
			},
		},
	},
});
