import { Section, SectionHeading } from "#/components/section";
import { Badge } from "#/components/ui/badge";

const VARIANTS = [
	"default",
	"brand",
	"secondary",
	"destructive",
	"outline",
	"ghost",
	"link",
] as const;

export function BadgeSection() {
	return (
		<Section id="badge" divided>
			<SectionHeading kicker="components" title="Badge" />
			<p className="mb-6 max-w-2xl text-sm text-muted-foreground">
				<code>#/components/ui/badge</code> — all seven variants.
			</p>
			<div className="flex flex-wrap gap-3">
				{VARIANTS.map((variant) => (
					<Badge key={variant} variant={variant}>
						{variant}
					</Badge>
				))}
			</div>
		</Section>
	);
}
