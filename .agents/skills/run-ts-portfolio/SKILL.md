---
name: run-ts-portfolio
description: Start or reuse the portfolio development server and check affected rendered pages, responsive layouts, navigation, or interactions in a browser.
---

# Run and inspect the portfolio

Use this skill for browser work. Build and automated-test gates live in root
`AGENTS.md`; running this skill does not require a full-site audit.

## Development server

- Check whether an appropriate portfolio server is already running and reuse it.
  `pnpm dev` defaults to port 3000; previous sessions have used port 3050.
- If needed, start `pnpm dev --port 3050` from the repository root and wait for
  it to answer. Keep track of the process you started.
- Kenneth wants the development server left running unless he asks to stop it.
  Investigate a busy port before starting another server; do not kill unrelated
  processes or assume an old saved PID still identifies the same process.

## Browser checks

Prefer the available browser integration. Check the changed page or interaction
and its relevant viewport/theme states. Include keyboard focus and console errors
when the change could affect them. Expand to other pages for shared UI changes.

Use normal motion for ordinary checks; check reduced motion when motion changes.
Wait for the actual fonts/images needed for a capture. Inspect image
`currentSrc`, dimensions, or network requests when image selection is in question;
automated tests stub image processing.

Check legibility, labels, and contrast when affected by the change. Use available
measurement tools when colors or layered backgrounds warrant them, and report
any verification gaps. Unrelated changes do not require a contrast audit.

Contact browser checks should use disabled delivery or a mocked transport.
Follow `docs/contact-setup.md` for operational changes and live delivery checks.

## Optional local driver

Use `driver.mjs` only when Playwright and a compatible browser are already
available. Playwright is not a declared project dependency; do not install it
merely to use this fallback.

```sh
PORTFOLIO_BASE=http://localhost:3050 node .agents/skills/run-ts-portfolio/driver.mjs
```

Enter `help` for commands. Common commands are `launch`, `nav /projects`,
`wait main`, `ss work`, `console-errors`, and `quit`. Screenshots default to
`/tmp/portfolio-shots/`; set `SCREENSHOT_DIR` to change that directory.
The driver defaults to reduced motion; use the browser integration to inspect
normal-motion behavior. `quit` closes the browser and leaves the server running.
