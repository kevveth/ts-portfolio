import { Picture } from "#/components/picture";
import { Surface } from "#/components/surface";
import type { GalleryImage } from "#/content/projects";
import { getProjectImage } from "#/lib/project-images";
import { cn } from "#/lib/utils";

export function Gallery({ items }: { items: GalleryImage[] }) {
	return (
		<div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
			{items.map((item, index) => {
				const isCenteredOrphan =
					items.length % 2 === 1 && index === items.length - 1;

				return (
					<figure
						key={item.src}
						className={cn(
							"space-y-2.5",
							isCenteredOrphan &&
								"sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.75rem)]",
						)}
					>
						<Surface
							variant="raised"
							className="flex aspect-[16/10] items-center justify-center overflow-hidden"
						>
							<Picture
								picture={getProjectImage(item.src)}
								alt={item.alt}
								sizes="(min-width: 640px) 50vw, 100vw"
								className="block h-full w-full"
								imgClassName="h-full w-full object-contain object-center"
							/>
						</Surface>
						{item.caption ? (
							<figcaption className="text-center font-mono text-xs leading-relaxed text-muted-foreground">
								{item.caption}
							</figcaption>
						) : null}
					</figure>
				);
			})}
		</div>
	);
}
