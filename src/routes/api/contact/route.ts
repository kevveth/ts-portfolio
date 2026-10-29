import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { handleContactRequest } from "#/lib/contact.server";

export const Route = createFileRoute("/api/contact")({
	server: { handlers: { ANY: ({ request }) => handleContactRequest(request) } },
});
