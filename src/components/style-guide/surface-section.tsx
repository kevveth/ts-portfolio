import { Section, SectionHeading } from "#/components/section";
import { Surface } from "#/components/surface";

const VARIANTS = ["plain", "raised", "interactive"] as const;
const PADDINGS = ["none", "sm", "md", "lg"] as const;

export function SurfaceSection() {
	return (
		<Section id="surface" width="wide" divided>
			<SectionHeading kicker="components" title="Surface" />
			<p className="mb-8 max-w-2xl text-sm text-muted-foreground">
				<code>#/components/surface</code> — three variants crossed with four
				padding values. The bar inside each cell marks where content starts; at{" "}
				<code>padding=&quot;none&quot;</code> it touches the edge.
			</p>
			<div className="space-y-10">
				{VARIANTS.map((variant) => (
					<div key={variant} className="space-y-3">
						<p className="metadata">{`variant="${variant}"`}</p>
						<div className="grid gap-4 sm:grid-cols-4">
							{PADDINGS.map((padding) => (
								<Surface key={padding} variant={variant} padding={padding}>
									<div className="space-y-2">
										<p className="font-mono text-xs text-muted-foreground">{`padding="${padding}"`}</p>
										<div className="h-2 rounded-full bg-brand/30" />
									</div>
								</Surface>
							))}
						</div>
					</div>
				))}
			</div>
		</Section>
	);
}
