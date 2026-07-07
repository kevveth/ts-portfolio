import { defineConfig } from "vitest/config";

const IMAGE_MARKER = /[?&](hero|gallery|thumb)\b/;
const STUB_PREFIX = "\0image-stub:";

export default defineConfig({
	plugins: [
		// vite-imagetools marker imports (see vite.config.ts) don't exist in the
		// test pipeline; stub them with a fixed picture object.
		{
			name: "stub-imagetools-pictures",
			enforce: "pre",
			resolveId(source) {
				return IMAGE_MARKER.test(source) ? STUB_PREFIX + source : null;
			},
			load(id) {
				if (!id.startsWith(STUB_PREFIX)) return null;
				return `export default {
					sources: { "image/webp": "/stub.webp 1200w" },
					img: { src: "/stub.png", w: 1200, h: 800 },
				}`;
			},
		},
	],
	test: {
		environment: "node",
		include: ["src/**/*.test.{ts,tsx}"],
		setupFiles: ["./src/test/setup.ts"],
	},
});
