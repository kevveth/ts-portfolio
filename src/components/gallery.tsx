import { Picture } from "#/components/picture";
import type { GalleryImage } from "#/content/projects";
import { getProjectImage } from "#/lib/project-images";

export function Gallery({ items }: { items: GalleryImage[] }) {
	return (
		<div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
			{items.map((item) => (
				<figure key={item.src} className="space-y-2.5">
					<div className="overflow-hidden rounded-lg border bg-card shadow-sm">
						<Picture
							picture={getProjectImage(item.src)}
							alt={item.alt}
							sizes="(min-width: 640px) 50vw, 100vw"
						/>
					</div>
					{item.caption ? (
						<figcaption className="font-mono text-xs leading-relaxed text-muted-foreground">
							{item.caption}
						</figcaption>
					) : null}
				</figure>
			))}
		</div>
	);
}
