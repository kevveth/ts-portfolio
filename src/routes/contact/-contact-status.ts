import { createServerFn } from "@tanstack/react-start";

// Only availability crosses the server boundary, never configuration or keys.
export const getContactAvailability = createServerFn({ method: "GET" }).handler(
	async () => {
		const { getContactConfiguration } = await import(
			"#/lib/contact-email.server"
		);
		return { enabled: getContactConfiguration() !== null };
	},
);
