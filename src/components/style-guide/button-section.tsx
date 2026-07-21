import { Check } from "lucide-react";
import { Section, SectionHeading } from "#/components/section";
import { Button } from "#/components/ui/button";

const VARIANTS = [
	"default",
	"secondary",
	"destructive",
	"outline",
	"ghost",
	"link",
	"brand-link",
] as const;

const TEXT_SIZES = ["xs", "sm", "default", "lg"] as const;
const ICON_SIZES = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const;

export function ButtonSection() {
	return (
		<Section id="button" width="wide" divided>
			<SectionHeading kicker="components" title="Button" />
			<p className="mb-8 max-w-2xl text-sm text-muted-foreground">
				<code>#/components/ui/button</code> — every variant crossed with every
				size. Icon-only sizes render a single glyph with an{" "}
				<code>aria-label</code> instead of a text child.
			</p>
			<div className="space-y-8">
				{VARIANTS.map((variant) => (
					<div key={variant} className="space-y-3">
						<p className="metadata">{`variant="${variant}"`}</p>
						<div className="flex flex-wrap items-center gap-3">
							{TEXT_SIZES.map((size) => (
								<Button key={size} variant={variant} size={size}>
									{size}
								</Button>
							))}
							<span aria-hidden className="mx-1 self-stretch border-l" />
							{ICON_SIZES.map((size) => (
								<Button
									key={size}
									variant={variant}
									size={size}
									aria-label={`${variant} ${size} icon button`}
								>
									<Check aria-hidden />
								</Button>
							))}
						</div>
					</div>
				))}
			</div>
			<SectionHeading
				kicker="disabled state"
				as="h3"
				spacing="tight"
				className="mt-10"
			/>
			<div className="flex flex-wrap items-center gap-3">
				<Button disabled>Default disabled</Button>
				<Button variant="outline" disabled>
					Outline disabled
				</Button>
				<Button variant="destructive" disabled>
					Destructive disabled
				</Button>
			</div>
		</Section>
	);
}
