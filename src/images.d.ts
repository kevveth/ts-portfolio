/**
 * Types for vite-imagetools marker imports (see IMAGE_PRESETS in
 * vite.config.ts). `vite/client`'s asset wildcards don't cover query-string
 * specifiers, so each marker gets an ambient module declaration.
 */

/** Shape of an imagetools `as=picture` export. */
interface ImagetoolsPicture {
	/** Format name → srcset string, e.g. { avif: "...", webp: "..." }. */
	sources: Record<string, string>;
	img: { src: string; w: number; h: number };
}

declare module "*?hero" {
	const picture: ImagetoolsPicture;
	export default picture;
}

declare module "*?gallery" {
	const picture: ImagetoolsPicture;
	export default picture;
}

declare module "*?thumb" {
	const picture: ImagetoolsPicture;
	export default picture;
}
