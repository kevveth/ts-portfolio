import { cn } from "#/lib/utils";

type PictureProps = {
	picture: ImagetoolsPicture;
	alt: string;
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
					sizes={sizes}
				/>
			))}
			<img
				src={picture.img.src}
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
