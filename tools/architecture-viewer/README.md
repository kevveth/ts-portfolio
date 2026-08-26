# Architecture viewer

This is a disposable, development-only orientation aid for the current
codebase. It is not an architecture specification.

Start the portfolio development server:

```sh
pnpm dev
```

Then visit:

<http://localhost:3000/architecture>

The route rescans `src/**/*.ts` and `src/**/*.tsx` on every request and derives
local import relationships, exports, dependents, and source previews. Reloading
the page is enough to see the current code. Its area descriptions are
orientation hints, not enforced boundaries. The route returns 404 outside the
Vite development environment.
