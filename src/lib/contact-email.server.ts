import "@tanstack/react-start/server-only";
import { z } from "zod";
import type { ContactRequest } from "./contact";

const configurationSchema = z.object({
	apiKey: z.string().trim().min(1),
	from: z.email(),
	to: z.email(),
	origins: z
		.array(
			z.string().refine((value) => {
				try {
					const url = new URL(value);
					return (
						["http:", "https:"].includes(url.protocol) && url.origin === value
					);
				} catch {
					return false;
				}
			}),
		)
		.min(1),
});
export type ContactConfiguration = z.infer<typeof configurationSchema>;

/** Runtime-only: importing this module never reads credentials or sends mail. */
export function getContactConfiguration(): ContactConfiguration | null {
	if (process.env.CONTACT_FORM_ENABLED !== "true") return null;
	const result = configurationSchema.safeParse({
		apiKey: process.env.RESEND_API_KEY,
		from: process.env.CONTACT_FROM_EMAIL,
		to: process.env.CONTACT_TO_EMAIL,
		origins: process.env.CONTACT_ALLOWED_ORIGINS?.split(",").map((origin) =>
			origin.trim(),
		),
	});
	return result.success ? result.data : null;
}

export async function deliverContactEmail(
	input: ContactRequest,
	config: ContactConfiguration,
): Promise<boolean> {
	const response = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${config.apiKey}`,
			"Content-Type": "application/json",
			"Idempotency-Key": `portfolio-contact/${input.submissionId}`,
		},
		body: JSON.stringify({
			from: `Portfolio contact <${config.from}>`,
			to: [config.to],
			reply_to: input.email,
			subject: "Portfolio inquiry",
			text: [
				`Name: ${input.name || "Not provided"}`,
				`Email: ${input.email}`,
				`Subject: ${input.subject || "Not provided"}`,
				`Submission: ${input.submissionId}`,
				"",
				input.message,
			].join("\n"),
		}),
		signal: AbortSignal.timeout(10_000),
	});
	if (!response.ok) return false;
	const result = z
		.object({ id: z.string().trim().min(1) })
		.safeParse(await response.json());
	return result.success;
}
