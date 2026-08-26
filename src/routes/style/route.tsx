import { createFileRoute } from "@tanstack/react-router";
import { PageIntro, Section } from "#/components/section";
import { BadgeSection } from "#/components/style-guide/badge-section";
import { ButtonSection } from "#/components/style-guide/button-section";
import { ColorTokensSection } from "#/components/style-guide/color-tokens-section";
import { SpacingRadiusSection } from "#/components/style-guide/spacing-radius-section";
import { SurfaceSection } from "#/components/style-guide/surface-section";
import { TypeScaleSection } from "#/components/style-guide/type-scale-section";

/**
 * Internal, living style guide — imports the real design-system components
 * (Section/SectionHeading, Button, Badge, Surface) rather than
 * reimplementing their markup, so this page can't visually drift from what
 * ships. Not linked from nav; kept out of search via `noindex`.
 */
export const Route = createFileRoute("/style")({
	head: () => ({
		meta: [
			{ title: "Style guide — internal" },
			{ name: "robots", content: "noindex" },
		],
	}),
	component: StyleGuide,
});

function StyleGuide() {
	return (
		<>
			<Section>
				<PageIntro
					kicker="internal — noindex"
					title="Style guide"
					description="Every color token, type style, and UI primitive this site ships — rendered from the real components. Use the theme toggle in the header to check both themes."
				/>
			</Section>
			<ColorTokensSection />
			<TypeScaleSection />
			<ButtonSection />
			<BadgeSection />
			<SurfaceSection />
			<SpacingRadiusSection />
		</>
	);
}
