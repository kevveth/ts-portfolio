import {
	createMemoryHistory,
	createRootRoute,
	createRouter,
	RouterProvider,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * Renders a component inside a throwaway in-memory router. Anything using
 * `<Link>` needs a RouterProvider above it; the real route tree would drag in
 * every route's head and loader, so this stands up the minimum a Link needs to
 * resolve an href. `to` values are still type-checked against the real router
 * via the `Register` declaration in src/router.tsx.
 */
export async function renderWithRouter(ui: ReactNode) {
	const rootRoute = createRootRoute({ component: () => ui });
	const router = createRouter({
		routeTree: rootRoute,
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});

	// Without this the first paint is the router's pending state, not `ui`.
	await router.load();

	return render(<RouterProvider router={router} />);
}
