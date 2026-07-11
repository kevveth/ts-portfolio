import { Picture } from "#/components/picture";
import { Surface } from "#/components/surface";
import type { GalleryImage } from "#/content/projects";
import { getProjectImage } from "#/lib/project-images";

export function Gallery({ items }: { items: GalleryImage[] }) {
	return (
		<div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
			{items.map((item) => (
				<figure key={item.src} className="space-y-2.5">
					<Surface variant="raised" className="overflow-hidden">
						<Picture
							picture={getProjectImage(item.src)}
							alt={item.alt}
							sizes="(min-width: 640px) 50vw, 100vw"
						/>
					</Surface>
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
