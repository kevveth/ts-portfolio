import { useForm, useStore } from "@tanstack/react-form";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
	CONTACT_FIELDS,
	contactFieldsSchema,
	contactRequestSchema,
	contactResultSchema,
} from "#/lib/contact";

// Controlled inputs always have a value; the API also accepts omitted name/website.
const contactFormSchema = contactFieldsSchema.extend({
	name: contactFieldsSchema.shape.name.unwrap(),
	subject: contactFieldsSchema.shape.subject.unwrap(),
	website: contactRequestSchema.shape.website.unwrap(),
});

const FEEDBACK = {
	accepted: "Thanks—your message has been submitted.",
	invalid: "Please check the highlighted fields and try again.",
	rejected: "Unable to submit this message. Please email me directly.",
	unavailable:
		"The form is currently unavailable. Please email me directly below.",
	failed:
		"I couldn’t confirm your submission. You can retry or email me directly.",
	limited:
		"Too many attempts. Please wait before trying again, or email me directly.",
};

function retryMessage(value: string | null) {
	if (!value) return FEEDBACK.limited;
	const seconds = /^\d+$/.test(value)
		? Number(value)
		: (Date.parse(value) - Date.now()) / 1000;
	return Number.isFinite(seconds) && seconds > 0
		? `Too many attempts. Try again in about ${Math.max(1, Math.ceil(seconds / 60))} minute(s), or email me directly.`
		: FEEDBACK.limited;
}

export function ContactForm() {
	const [feedback, setFeedback] = useState("");
	const attempt = useRef<{ payload: string; id: string } | null>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const form = useForm({
		defaultValues: {
			name: "",
			email: "",
			subject: "",
			message: "",
			website: "",
		},
		validators: { onSubmit: contactFormSchema },
		onSubmitInvalid: ({ formApi }) => {
			setFeedback(FEEDBACK.invalid);
			const first = CONTACT_FIELDS.find(
				(name) => formApi.getFieldMeta(name)?.errors.length,
			);
			if (first)
				formRef.current
					?.querySelector<HTMLElement>(`[name="${first}"]`)
					?.focus();
		},
		onSubmit: async ({ value, formApi }) => {
			// Standard Schema validation doesn't apply Zod transformations to values.
			const values = {
				...contactFieldsSchema.parse(value),
				website: value.website,
			};
			const payload = JSON.stringify(values);
			if (!attempt.current || attempt.current.payload !== payload)
				attempt.current = { payload, id: crypto.randomUUID() };
			setFeedback("");
			try {
				const response = await fetch("/api/contact", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ ...values, submissionId: attempt.current.id }),
					signal: AbortSignal.timeout(15_000),
				});
				if (response.status === 429) {
					setFeedback(retryMessage(response.headers.get("Retry-After")));
					return;
				}
				const result = contactResultSchema.safeParse(await response.json());
				if (
					!result.success ||
					(result.data.code === "accepted" && !response.ok)
				) {
					setFeedback(FEEDBACK.failed);
					return;
				}
				setFeedback(FEEDBACK[result.data.code]);
				if (result.data.code === "invalid") {
					for (const name of CONTACT_FIELDS) {
						const message = result.data.fieldErrors?.[name];
						if (message)
							formApi.setFieldMeta(name, (meta) => ({
								...meta,
								errorMap: { ...meta.errorMap, onServer: message },
							}));
					}
				}
				if (response.ok && result.data.code === "accepted") {
					formApi.resetField("message");
					formApi.resetField("subject");
					attempt.current = null;
				}
			} catch {
				setFeedback(FEEDBACK.failed);
			}
		},
	});
	const pending = useStore(form.store, (state) => state.isSubmitting);

	useEffect(() => {
		if (pending || !feedback) return;
		const first = CONTACT_FIELDS.find(
			(name) => form.getFieldMeta(name)?.errors.length,
		);
		const target = first ? `[name="${first}"]` : 'button[type="submit"]';
		formRef.current?.querySelector<HTMLElement>(target)?.focus();
	}, [form, pending, feedback]);

	return (
		<form
			ref={formRef}
			action="/api/contact"
			method="post"
			className="contact-form"
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				if (!form.state.isSubmitting) void form.handleSubmit();
			}}
		>
			<fieldset disabled={pending} aria-busy={pending}>
				<legend className="sr-only">Send an inquiry</legend>
				<div className="contact-fields">
					{CONTACT_FIELDS.map((name) => (
						<form.Field key={name} name={name}>
							{(field) => {
								const error = field.state.meta.errors[0];
								const message =
									typeof error === "string" ? error : error?.message;
								const inputProps = {
									id: `contact-${name}`,
									name,
									placeholder: name === "subject" ? "subject (optional)" : name,
									value: field.state.value,
									onBlur: field.handleBlur,
									onChange: (
										event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
									) => {
										attempt.current = null;
										setFeedback("");
										field.setMeta((meta) => ({
											...meta,
											errorMap: { ...meta.errorMap, onServer: undefined },
										}));
										field.handleChange(event.target.value);
									},
									"aria-invalid": !!message,
									"aria-describedby": message
										? `contact-${name}-error`
										: undefined,
								};
								return (
									<div className={`contact-field contact-field-${name}`}>
										<label className="sr-only" htmlFor={inputProps.id}>
											{name === "subject" ? "subject (optional)" : name}
										</label>
										{name === "message" ? (
											<textarea
												{...inputProps}
												rows={6}
												required
												maxLength={5000}
											/>
										) : (
											<input
												{...inputProps}
												type={name === "email" ? "email" : "text"}
												autoComplete={name === "subject" ? "off" : name}
												required={name === "email"}
												maxLength={
													name === "email"
														? 254
														: name === "subject"
															? 200
															: 100
												}
											/>
										)}
										{message ? (
											<p className="contact-error" id={`contact-${name}-error`}>
												{message}
											</p>
										) : null}
									</div>
								);
							}}
						</form.Field>
					))}
				</div>
				<form.Field name="website">
					{(field) => (
						<div hidden aria-hidden="true">
							<label htmlFor="contact-website">Website</label>
							<input
								id="contact-website"
								name={field.name}
								value={field.state.value}
								onChange={(event) => field.handleChange(event.target.value)}
								tabIndex={-1}
								autoComplete="off"
								maxLength={200}
							/>
						</div>
					)}
				</form.Field>
				<button className="contact-send" type="submit">
					<span>{pending ? "sending…" : "send"}</span>
				</button>
			</fieldset>
			<output
				className="contact-feedback"
				aria-live="polite"
				aria-atomic="true"
			>
				{pending ? "Sending your message…" : feedback}
			</output>
		</form>
	);
}
