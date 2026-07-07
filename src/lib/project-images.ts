import chavosGallery from "#/assets/chavos-parlor/gallery.png?gallery";
import chavosHero from "#/assets/chavos-parlor/hero.png?hero";
import chavosHeroThumb from "#/assets/chavos-parlor/hero.png?thumb";
import chavosServices from "#/assets/chavos-parlor/services.png?gallery";
import chavosWizardDetails from "#/assets/chavos-parlor/wizard-details.png?gallery";
import chavosWizardService from "#/assets/chavos-parlor/wizard-service.png?gallery";
import chavosWizardTime from "#/assets/chavos-parlor/wizard-time.png?gallery";

/**
 * Resolves the string keys used by gallery entries in src/content/projects.ts
 * to build-time-optimized pictures. Adding a project's images means adding
 * imports + entries here; content stays a pure data module.
 */
const PROJECT_IMAGES: Record<string, ImagetoolsPicture> = {
	"chavos-parlor/hero": chavosHero,
	"chavos-parlor/services": chavosServices,
	"chavos-parlor/gallery": chavosGallery,
	"chavos-parlor/wizard-service": chavosWizardService,
	"chavos-parlor/wizard-time": chavosWizardTime,
	"chavos-parlor/wizard-details": chavosWizardDetails,
};

/** Card thumbnails, keyed by project slug. */
const PROJECT_THUMBS: Record<string, ImagetoolsPicture> = {
	"chavos-parlor": chavosHeroThumb,
};

export function getProjectImage(key: string): ImagetoolsPicture {
	const picture = PROJECT_IMAGES[key];
	if (!picture) {
		throw new Error(
			`No image registered for key "${key}" in project-images.ts`,
		);
	}
	return picture;
}

export function getProjectThumb(slug: string): ImagetoolsPicture {
	const picture = PROJECT_THUMBS[slug];
	if (!picture) {
		throw new Error(
			`No thumbnail registered for slug "${slug}" in project-images.ts`,
		);
	}
	return picture;
}
