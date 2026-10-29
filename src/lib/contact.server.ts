import "@tanstack/react-start/server-only";
import {
	CONTACT_BODY_LIMIT,
	type ContactResult,
	contactFieldErrors,
	contactRequestSchema,
} from "./contact";
import {
	deliverContactEmail,
	getContactConfiguration,
} from "./contact-email.server";

function result(body: ContactResult, status: number, headers?: HeadersInit) {
	return Response.json(body, {
		status,
		headers: { "Cache-Control": "no-store", ...headers },
	});
}

class BodyTooLarge extends Error {}

async function readBody(request: Request) {
	const reader = request.body?.getReader();
	if (!reader) return "";
	const chunks: Uint8Array[] = [];
	let size = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > CONTACT_BODY_LIMIT) {
				await reader.cancel();
				throw new BodyTooLarge();
			}
			chunks.push(value);
		}
	} finally {
		reader.releaseLock();
	}
	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

export async function handleContactRequest(
	request: Request,
): Promise<Response> {
	if (request.method !== "POST")
		return result({ code: "rejected" }, 405, { Allow: "POST" });
	const config = getContactConfiguration();
	if (!config) return result({ code: "unavailable" }, 503);
	const origin = request.headers.get("origin");
	if (!origin || !config.origins.includes(origin))
		return result({ code: "rejected" }, 403);
	if (
		request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !==
		"application/json"
	) {
		return result({ code: "rejected" }, 415);
	}
	let raw: unknown;
	try {
		raw = JSON.parse(await readBody(request));
	} catch (error) {
		return result(
			{ code: "rejected" },
			error instanceof BodyTooLarge ? 413 : 400,
		);
	}
	const parsed = contactRequestSchema.safeParse(raw);
	if (!parsed.success)
		return result(
			{ code: "invalid", fieldErrors: contactFieldErrors(parsed.error) },
			400,
		);
	if (parsed.data.website) return result({ code: "rejected" }, 400);
	try {
		const accepted = await deliverContactEmail(parsed.data, config);
		return result(
			{ code: accepted ? "accepted" : "failed" },
			accepted ? 200 : 502,
		);
	} catch {
		// Do not log visitor data, provider bodies, or credentials.
		return result({ code: "failed" }, 502);
	}
}
