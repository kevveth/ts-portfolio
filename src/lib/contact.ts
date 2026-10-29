import { z } from "zod";

export const CONTACT_BODY_LIMIT = 32 * 1024;
export const CONTACT_FIELDS = ["name", "email", "subject", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

const singleLine = z.string().regex(/^[^\r\n]*$/, "Use a single line.");
export const contactFieldsSchema = z.object({
	name: singleLine.trim().max(100, "Use at most 100 characters.").default(""),
	email: singleLine
		.trim()
		.max(254, "Use at most 254 characters.")
		.pipe(z.email("Enter a valid email address.")),
	subject: singleLine
		.trim()
		.max(200, "Use at most 200 characters.")
		.default(""),
	message: z
		.string()
		.trim()
		.min(1, "Enter a message.")
		.max(5000, "Use at most 5,000 characters."),
});

export const contactRequestSchema = contactFieldsSchema
	.extend({
		submissionId: z.uuid(),
		website: z.string().max(200).default(""),
	})
	.strict();
export type ContactRequest = z.infer<typeof contactRequestSchema>;
export type ContactFieldErrors = Partial<Record<ContactField, string>>;

export function contactFieldErrors(error: z.ZodError): ContactFieldErrors {
	const errors: ContactFieldErrors = {};
	for (const field of CONTACT_FIELDS) {
		const issue = error.issues.find((issue) => issue.path[0] === field);
		if (issue) errors[field] = issue.message;
	}
	return errors;
}

export const contactResultSchema = z.object({
	code: z.enum([
		"accepted",
		"invalid",
		"rejected",
		"unavailable",
		"failed",
		"limited",
	]),
	fieldErrors: z
		.object({
			name: z.string().optional(),
			email: z.string().optional(),
			subject: z.string().optional(),
			message: z.string().optional(),
		})
		.optional(),
});
export type ContactResult = z.infer<typeof contactResultSchema>;
