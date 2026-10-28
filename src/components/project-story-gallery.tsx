import { type CSSProperties, useState } from "react";
import { Picture } from "#/components/picture";
import type { GalleryImage } from "#/content/projects";

export function ProjectStoryGallery({
	slides,
	title,
}: {
	slides: readonly GalleryImage[];
	title: string;
}) {
	const [index, setIndex] = useState(0);
	const slide = slides[index];
	if (!slide) return null;

	return (
		<figure className="news-gallery" aria-label={`${title} screenshots`}>
			<a
				href={slide.fullSrc}
				className="news-gallery-frame"
				style={
					{ "--gallery-image-position": slide.previewPosition } as CSSProperties
				}
				aria-label={`Open full image ${index + 1} of ${slides.length}: ${slide.alt}`}
			>
				<Picture
					key={slide.fullSrc}
					picture={slide.picture}
					alt={slide.alt}
					sizes="(min-width: 600px) 268px, (min-width: 360px) 320px, calc(100vw - 40px)"
					loading="eager"
					fetchPriority="high"
					className="block h-full"
					imgClassName="news-gallery-image"
				/>
			</a>
			<figcaption className="news-gallery-controls">
				<button
					type="button"
					className="detail-link"
					aria-label="Previous image"
					disabled={slides.length < 2}
					onClick={() =>
						setIndex((current) => (current - 1 + slides.length) % slides.length)
					}
				>
					<span className="link-label" aria-hidden>
						←
					</span>
				</button>
				<output aria-live="polite" aria-atomic="true">
					{index + 1} of {slides.length}
				</output>
				<button
					type="button"
					className="detail-link"
					aria-label="Next image"
					disabled={slides.length < 2}
					onClick={() => setIndex((current) => (current + 1) % slides.length)}
				>
					<span className="link-label" aria-hidden>
						→
					</span>
				</button>
			</figcaption>
		</figure>
	);
}
