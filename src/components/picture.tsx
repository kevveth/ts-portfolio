import { cn } from "#/lib/utils";

type PictureProps = {
	picture: ImagetoolsPicture;
	alt: string;
	/** Restricts image sources to matching media; the fallback stays inline. */
	media?: string;
	/** `sizes` hint forwarded to every source. */
	sizes?: string;
	loading?: "lazy" | "eager";
	fetchPriority?: "high" | "low" | "auto";
	className?: string;
	imgClassName?: string;
};

/**
 * Renders a vite-imagetools `as=picture` object with explicit dimensions so
 * images never cause layout shift. Below-the-fold images stay lazy (the
 * default); the Home featured shot opts into eager + high priority.
 */
export function Picture({
	picture,
	alt,
	media,
	sizes,
	loading = "lazy",
	fetchPriority,
	className,
	imgClassName,
}: PictureProps) {
	return (
		<picture className={className}>
			{Object.entries(picture.sources).map(([format, srcSet]) => (
				<source
					key={format}
					type={`image/${format}`}
					srcSet={srcSet}
					media={media}
					sizes={sizes}
				/>
			))}
			{media && <source media={media} srcSet={picture.img.src} sizes={sizes} />}
			<img
				src={
					media
						? "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
						: picture.img.src
				}
				width={picture.img.w}
				height={picture.img.h}
				alt={alt}
				loading={loading}
				fetchPriority={fetchPriority}
				decoding="async"
				className={cn("h-auto w-full", imgClassName)}
			/>
		</picture>
	);
}
