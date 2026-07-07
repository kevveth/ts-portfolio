import type { LucideIcon } from "lucide-react";
import { Github, Linkedin, Mail } from "lucide-react";
import { SITE } from "#/content/site";

export type ContactChannel = {
	label: string;
	href: string;
	external: boolean;
	Icon: LucideIcon;
};

/** Single source of truth for the site's contact channels. */
export const CONTACT_CHANNELS: ContactChannel[] = [
	{ label: "Email", href: `mailto:${SITE.email}`, external: false, Icon: Mail },
	{ label: "GitHub", href: SITE.github, external: true, Icon: Github },
	{ label: "LinkedIn", href: SITE.linkedin, external: true, Icon: Linkedin },
];
