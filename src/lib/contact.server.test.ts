import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONTACT_BODY_LIMIT, contactFieldsSchema } from "./contact";
import { handleContactRequest } from "./contact.server";

vi.mock("@tanstack/react-start/server-only", () => ({}));

const payload = {
	name: "A visitor",
	email: "visitor@example.com",
	subject: "Website project",
	message: "Hello!\nI'd like to discuss a project.",
	website: "",
	submissionId: "600d04d6-c40b-450e-847e-38580193f22f",
};
const transport = vi.fn<typeof fetch>();
function request(
	body: unknown = payload,
	headers: Record<string, string> = {},
) {
	return new Request("https://portfolio.example/api/contact", {
		method: "POST",
		headers: {
			Origin: "https://portfolio.example",
			"Content-Type": "application/json",
			...headers,
		},
		body: typeof body === "string" ? body : JSON.stringify(body),
	});
}

beforeEach(() => {
	vi.stubEnv("CONTACT_FORM_ENABLED", "true");
	vi.stubEnv("RESEND_API_KEY", "test-only-key");
	vi.stubEnv("CONTACT_FROM_EMAIL", "forms@example.com");
	vi.stubEnv("CONTACT_TO_EMAIL", "ken@example.com");
	vi.stubEnv(
		"CONTACT_ALLOWED_ORIGINS",
		"https://portfolio.example,http://localhost:3050",
	);
	vi.stubGlobal("fetch", transport);
	transport.mockReset();
	transport.mockResolvedValue(Response.json({ id: "provider-test-id" }));
});
afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

describe("contact validation", () => {
	it("accepts trimmed boundary values and optional name", () => {
		expect(
			contactFieldsSchema.parse({
				email: " visitor@example.com ",
				message: " Hello ",
			}),
		).toEqual({
			name: "",
			email: payload.email,
			subject: "",
			message: "Hello",
		});
		expect(
			contactFieldsSchema.safeParse({
				...payload,
				name: "n".repeat(100),
				subject: "s".repeat(200),
				message: "m".repeat(5000),
			}).success,
		).toBe(true);
	});
	it.each([
		{ name: "n".repeat(101) },
		{ name: "Visitor\r\nOther" },
		{ subject: "s".repeat(201) },
		{ subject: "Inquiry\r\nOther" },
		{ email: "invalid" },
		{ email: "visitor@example.com\n" },
		{ email: `${"a".repeat(250)}@example.com` },
		{ message: "  " },
		{ message: "m".repeat(5001) },
	])("rejects invalid fields before delivery: %j", async (override) => {
		const response = await handleContactRequest(
			request({ ...payload, ...override }),
		);
		expect(response.status).toBe(400);
		expect((await response.json()).code).toBe("invalid");
		expect(transport).not.toHaveBeenCalled();
	});
});

describe("contact request boundary", () => {
	it.each([
		"CONTACT_FORM_ENABLED",
		"RESEND_API_KEY",
		"CONTACT_FROM_EMAIL",
		"CONTACT_TO_EMAIL",
		"CONTACT_ALLOWED_ORIGINS",
	])("fails closed without %s", async (key) => {
		vi.stubEnv(key, "");
		const response = await handleContactRequest(request());
		expect(response.status).toBe(503);
		expect(await response.json()).toEqual({ code: "unavailable" });
		expect(transport).not.toHaveBeenCalled();
	});
	it.each([
		[request(payload, { Origin: "https://other.example" }), 403],
		[request(payload, { Origin: "null" }), 403],
		[request(payload, { Origin: "" }), 403],
		[request(payload, { "Content-Type": "text/plain" }), 415],
		[request("{broken"), 400],
		[request({ ...payload, website: "spam" }), 400],
		[request({ ...payload, to: "attacker@example.com" }), 400],
		[request({ ...payload, submissionId: "not-a-uuid" }), 400],
	])("rejects unsafe requests without sending (%s)", async (input, status) => {
		const response = await handleContactRequest(input);
		expect(response.status).toBe(status);
		expect(response.headers.get("cache-control")).toBe("no-store");
		expect(transport).not.toHaveBeenCalled();
	});
	it("rejects non-POST requests", async () => {
		const response = await handleContactRequest(
			new Request("https://portfolio.example/api/contact"),
		);
		expect(response.status).toBe(405);
		expect(response.headers.get("allow")).toBe("POST");
		expect(transport).not.toHaveBeenCalled();
	});
	it.each([
		undefined,
		"1",
	])("bounds actual streamed bytes even with Content-Length %s", async (length) => {
		const stream = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(new Uint8Array(CONTACT_BODY_LIMIT));
				controller.enqueue(new Uint8Array(1));
				controller.close();
			},
		});
		const input = new Request("https://portfolio.example/api/contact", {
			method: "POST",
			headers: {
				Origin: "https://portfolio.example",
				"Content-Type": "application/json",
				...(length ? { "Content-Length": length } : {}),
			},
			body: stream,
			duplex: "half",
		} as RequestInit);
		expect((await handleContactRequest(input)).status).toBe(413);
		expect(transport).not.toHaveBeenCalled();
	});
});

describe("Resend boundary (mocked; never live)", () => {
	it("uses fixed recipient/sender, Reply-To, deterministic text and the same retry key", async () => {
		for (let index = 0; index < 2; index++) {
			transport.mockResolvedValueOnce(
				Response.json({ id: "provider-test-id" }),
			);
			expect(await (await handleContactRequest(request())).json()).toEqual({
				code: "accepted",
			});
		}
		const [url, options] = transport.mock.calls[0];
		expect(url).toBe("https://api.resend.com/emails");
		expect(options?.headers).toMatchObject({
			"Idempotency-Key": `portfolio-contact/${payload.submissionId}`,
		});
		expect(options?.signal).toBeInstanceOf(AbortSignal);
		const mail = JSON.parse(String(options?.body));
		expect(mail).toMatchObject({
			from: "Portfolio contact <forms@example.com>",
			to: ["ken@example.com"],
			reply_to: payload.email,
			subject: "Portfolio inquiry",
		});
		expect(mail.text).toContain(payload.message);
		expect(mail.text).toContain(`Subject: ${payload.subject}`);
		expect(mail.html).toBeUndefined();
		expect(transport.mock.calls[1][1]?.body).toBe(options?.body);
		expect(transport.mock.calls[1][1]?.headers).toEqual(options?.headers);
	});
	it.each([
		() =>
			Promise.resolve(
				Response.json({ message: "private provider detail" }, { status: 429 }),
			),
		() => Promise.resolve(Response.json({ id: "" })),
		() => Promise.resolve(new Response("not json")),
		() => Promise.reject(new DOMException("timeout", "TimeoutError")),
		() => Promise.reject(new Error("network failure")),
	])("reports provider rejection, malformed acceptance or uncertain transport as failure", async (implementation) => {
		transport.mockImplementationOnce(implementation);
		const response = await handleContactRequest(request());
		expect(response.status).toBe(502);
		expect(await response.json()).toEqual({ code: "failed" });
	});
});
