// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ContactForm } from "./-contact-form";

const transport = vi.fn<typeof fetch>();
beforeEach(() => {
	vi.stubGlobal("fetch", transport);
	transport.mockReset();
});
afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});
function fillForm() {
	fireEvent.change(screen.getByLabelText("email"), {
		target: { value: "visitor@example.com" },
	});
	fireEvent.change(screen.getByLabelText("message"), {
		target: { value: "Hello about a project." },
	});
}
function submit() {
	fireEvent.click(screen.getByRole("button", { name: "send" }));
}

it("focuses a labelled validation error without sending", async () => {
	render(<ContactForm enabled />);
	const form = screen.getByRole("button", { name: "send" }).closest("form");
	expect(form).toHaveAttribute("method", "post");
	expect(form).toHaveAttribute("action", "/api/contact");
	expect(screen.queryByText(/\(required\)/)).not.toBeInTheDocument();
	expect(screen.getByLabelText("subject (optional)")).not.toBeRequired();
	expect(
		screen.queryByText("Enter a valid email address."),
	).not.toBeInTheDocument();
	fireEvent.blur(screen.getByLabelText("email"));
	expect(
		screen.queryByText("Enter a valid email address."),
	).not.toBeInTheDocument();
	submit();
	await waitFor(() => expect(screen.getByLabelText("email")).toHaveFocus());
	expect(screen.getByText("Enter a valid email address.")).toBeVisible();
	expect(screen.getByText("Enter a message.")).toBeVisible();
	expect(transport).not.toHaveBeenCalled();
});

it("allows a corrected form to submit after an empty attempt", async () => {
	transport.mockResolvedValueOnce(Response.json({ code: "accepted" }));
	render(<ContactForm enabled />);
	submit();
	await screen.findByText("Enter a message.");
	fillForm();
	submit();
	await screen.findByText("Thanks—your message has been submitted.");
	expect(transport).toHaveBeenCalledTimes(1);
});

it("announces pending, prevents duplicates, and clears inquiry fields after acceptance", async () => {
	let resolve: (response: Response) => void = () => {};
	transport.mockReturnValue(
		new Promise<Response>((done) => {
			resolve = done;
		}),
	);
	render(<ContactForm enabled />);
	fillForm();
	fireEvent.change(screen.getByLabelText("subject (optional)"), {
		target: { value: "Project inquiry" },
	});
	submit();
	expect(screen.getByRole("button", { name: "sending…" })).toBeDisabled();
	expect(screen.getByRole("status")).toHaveTextContent("Sending your message…");
	fireEvent.submit(
		screen.getByRole("button").closest("form") as HTMLFormElement,
	);
	await waitFor(() => expect(transport).toHaveBeenCalledTimes(1));
	expect(JSON.parse(String(transport.mock.calls[0][1]?.body)).subject).toBe(
		"Project inquiry",
	);
	await act(async () => resolve(Response.json({ code: "accepted" })));
	expect(screen.getByRole("status")).toHaveTextContent(
		"Thanks—your message has been submitted.",
	);
	expect(screen.getByLabelText("message")).toHaveValue("");
	expect(screen.getByLabelText("subject (optional)")).toHaveValue("");
	expect(screen.getByLabelText("email")).toHaveValue("visitor@example.com");
});

it("keeps content and submission ID on retry, then renews the ID after an edit", async () => {
	transport.mockImplementation(async () =>
		Response.json({ code: "failed" }, { status: 502 }),
	);
	render(<ContactForm enabled />);
	fillForm();
	fireEvent.change(screen.getByLabelText("subject (optional)"), {
		target: { value: "Project inquiry" },
	});
	submit();
	await screen.findByText(/couldn’t confirm/);
	expect(screen.getByLabelText("subject (optional)")).toHaveValue(
		"Project inquiry",
	);
	expect(screen.getByLabelText("message")).toHaveValue(
		"Hello about a project.",
	);
	const first = JSON.parse(String(transport.mock.calls[0][1]?.body));
	submit();
	await waitFor(() => expect(transport).toHaveBeenCalledTimes(2));
	await waitFor(() =>
		expect(screen.getByRole("button", { name: "send" })).toBeEnabled(),
	);
	expect(
		JSON.parse(String(transport.mock.calls[1][1]?.body)).submissionId,
	).toBe(first.submissionId);
	fireEvent.change(screen.getByLabelText("subject (optional)"), {
		target: { value: "A revised subject" },
	});
	submit();
	await waitFor(() => expect(transport).toHaveBeenCalledTimes(3));
	expect(
		JSON.parse(String(transport.mock.calls[2][1]?.body)).submissionId,
	).not.toBe(first.submissionId);
});

it.each([
	[
		() =>
			Promise.resolve(Response.json({ code: "unavailable" }, { status: 503 })),
		/currently unavailable/,
	],
	[
		() =>
			Promise.resolve(
				new Response("limit", {
					status: 429,
					headers: { "Retry-After": "120" },
				}),
			),
		/about 2 minute/,
	],
	[
		() => Promise.resolve(new Response("upstream HTML", { status: 502 })),
		/couldn’t confirm/,
	],
	[
		() => Promise.reject(new DOMException("timeout", "TimeoutError")),
		/couldn’t confirm/,
	],
	[
		() => Promise.resolve(Response.json({ code: "accepted" }, { status: 502 })),
		/couldn’t confirm/,
	],
])("preserves the message for unavailable, limited and uncertain failures", async (implementation, text) => {
	transport.mockImplementationOnce(implementation);
	render(<ContactForm enabled />);
	fillForm();
	submit();
	await screen.findByText(text);
	expect(screen.getByLabelText("message")).toHaveValue(
		"Hello about a project.",
	);
	expect(screen.getByRole("button", { name: "send" })).toBeEnabled();
});

it("focuses server field errors after re-enabling the controls", async () => {
	transport.mockResolvedValueOnce(
		Response.json(
			{ code: "invalid", fieldErrors: { email: "Check this address." } },
			{ status: 400 },
		),
	);
	render(<ContactForm enabled />);
	fillForm();
	submit();
	await screen.findByText("Check this address.");
	await waitFor(() => expect(screen.getByLabelText("email")).toHaveFocus());
	transport.mockResolvedValueOnce(Response.json({ code: "accepted" }));
	fireEvent.change(screen.getByLabelText("email"), {
		target: { value: "corrected@example.com" },
	});
	submit();
	await screen.findByText("Thanks—your message has been submitted.");
});

it("keeps the published form disabled and blocks submission until enabled", () => {
	render(<ContactForm />);
	const button = screen.getByRole("button", { name: "send" });
	expect(button).toBeDisabled();
	expect(button).toHaveAccessibleDescription("coming soon — use email below");
	fillForm();
	fireEvent.submit(button.closest("form") as HTMLFormElement);
	expect(transport).not.toHaveBeenCalled();
});
