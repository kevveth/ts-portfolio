# Spec-Driven Development with Claude Code

*A working tutorial, built around your portfolio site project*

This is written against the current Claude Code docs (checked July 2026). Where a claim came from official documentation, it's cited. Where it's my recommendation rather than a documented feature, it's marked as such.

## First, the mixup

You mentioned `/goal` and `/run`. Both are real, current Claude Code commands — good instinct pulling from the docs, they're just not what you'd guess from the names:

- **`/goal`** sets a completion condition and Claude keeps working turn after turn until it's met, without you re-prompting. A small model checks the condition after every turn. Example: `/goal all tests in test/auth pass and the lint step is clean`. It clears itself once satisfied, or run `/goal clear` to stop it early. [(source)](https://code.claude.com/docs/en/goal)
- **`/run`** launches and drives your actual running app — server, browser, CLI, whatever it is — so you can watch a change work, instead of only trusting a test suite. It has a sibling, **`/verify`**, which does the same thing but specifically to confirm a change did what it should. [(source)](https://code.claude.com/docs/en/skills#run-and-verify-your-app)

Neither of these *is* spec-driven development on its own. They're two of several building blocks. The actual workflow lives across a handful of docs, and I've pulled the pieces together below.

## What spec-driven development actually means here

Anthropic's own framing (from their best-practices guide) is simpler than most of the third-party tutorials out there: **review at phase gates, not during implementation.** Instead of watching every edit Claude makes, you review three checkpoints — the spec, the plan, the diff — and let Claude work unsupervised between them. [(source)](https://code.claude.com/docs/en/best-practices)

Four phases, each catching a different class of mistake:

1. **Spec** — catches "solving the wrong problem" and scope creep
2. **Plan** — catches half-finished implementations and approaches that conflict with existing patterns
3. **Implement** — Claude codes against the approved plan in a clean context
4. **Verify / review** — catches the stuff that only shows up once it's built

This isn't a plugin or a special mode you turn on. It's a discipline you follow using ordinary Claude Code features: plan mode, a markdown file, a fresh session, and a review command.

## The toolkit (verified against docs.claude.com)

| Feature | What it does | When you'd use it |
|---|---|---|
| **Interview pattern** | You ask Claude to interview you with the `AskUserQuestion` tool, digging into edge cases and tradeoffs, then write everything to `SPEC.md` | Start of any feature big enough to get wrong |
| **`/plan`** (plan mode) | Claude reads and researches but can't edit anything until you approve a plan. `Ctrl+G` opens the plan in your editor to hand-edit it | After the spec, before touching code |
| Fresh session (`/clear`) | Wipes conversation history but keeps `CLAUDE.md` and project skills | Right before implementation, so Claude codes against the spec/plan file, not a cluttered conversation |
| **`/goal`** | Keeps Claude working across turns until a verifiable condition holds | Long, mechanical tasks with a clear finish line ("every page uses the new layout, build passes") |
| **`/run` / `/verify`** | Boots your actual app and drives it to confirm behavior, not just types and tests | Full-stack work, where "the types check" ≠ "the feature works" |
| **`/run-skill-generator`** | One-time setup: figures out how your specific project builds/launches (env vars, DB, multi-step build) and writes that recipe as a project skill so `/run`/`/verify` stop guessing | Once per project, right after scaffolding it |
| **`/code-review`**, **`/security-review`** | Fresh-context review of your diff for bugs, cleanups, or security issues, before you ship | Before every merge/deploy |
| **Subagents** (`.claude/agents/*.md`) | Give a specialized assistant its own tools and system prompt, run in an isolated context | Repeated review roles (e.g. "content reviewer" for your case-study writeups) |
| **Skills** (`.claude/skills/<name>/SKILL.md`) | Reusable, on-demand instructions/workflows, invoked by name or automatically | Anything you'd otherwise re-paste into chat every time |
| **`CLAUDE.md`** | Loaded at the start of every session — build commands, conventions, gotchas | Project setup, and updated whenever Claude repeats a mistake |
| **Hooks** | Deterministic scripts that fire on tool events (e.g. block a write, run a linter after every edit) | Rules you want enforced with zero exceptions, not just "advisory" |
| **Checkpoints (`/rewind`)** | Every prompt snapshots your code; roll back conversation, code, or both | Trying something risky without fear |

## The loop, applied to your portfolio site

You've got a running example already: a barber shop site you just shipped, and now you want somewhere to show it off — a personal developer portfolio. Full-stack TypeScript, and since you specifically want to get sharp on **TanStack Start**, that's the frame: file-based routing via TanStack Router, `createServerFn` for anything that needs to touch a database, and a small SQLite/Postgres DB (Prisma or Drizzle) for your project entries so you're not hardcoding a giant array of objects. It's more framework than a static portfolio strictly needs, which is fine — that's the point of picking it.

### Phase 0 — Scaffold + CLAUDE.md

```bash
npx @tanstack/cli@latest create
```

This prompts you for a project name, package manager, and optional add-ons (Tailwind, ESLint). It scaffolds the standard TanStack Start layout: `src/router.tsx`, `src/routes/__root.tsx`, and a `src/routes/` directory where file-based routes live. [(source)](https://tanstack.com/start/latest/docs/framework/react/getting-started)

```bash
cd portfolio
claude
```

Inside Claude Code, run `/init` to generate a starter `CLAUDE.md`. Then hand-edit it down to what actually matters — Anthropic's own guidance is to keep this file short, since a bloated one gets ignored. For a TanStack Start portfolio project that's probably:

```markdown
# Stack
TanStack Start (React), TanStack Router file-based routing, TypeScript,
Prisma + SQLite, Tailwind.

# Commands
- `npm run dev` — dev server
- `npm run build` — must pass before any commit
- `npx prisma studio` — inspect local DB

# Conventions
- Routes live in src/routes/, one file per route (createFileRoute).
  __root.tsx is the shell — always rendered, holds <html>/<head>/<Scripts>.
- Anything touching the DB or env vars goes through a server function
  (createServerFn from @tanstack/react-start), never called directly
  from a client component.
- Split server code as: users.functions.ts (createServerFn wrappers,
  safe to import anywhere) / users.server.ts (DB queries, server-only) /
  schemas.ts (shared Zod schemas, client-safe).
- Validate server function input with Zod, not manual checks.
- Project entries live in the DB, not hardcoded arrays.
```

### Phase 1 — Interview → SPEC.md

This is the documented pattern for kicking off a feature you haven't fully thought through yourself. [(source)](https://code.claude.com/docs/en/best-practices#let-claude-interview-you) Type this as your first prompt:

```
I want to build a personal developer portfolio site using TanStack Start.
It needs to showcase projects I've built, starting with a barber shop
website I just finished. Interview me in detail using the
AskUserQuestion tool.

Ask about technical implementation, UI/UX, edge cases, concerns, and
tradeoffs. Don't ask obvious questions, dig into the hard parts I might
not have considered.

Keep interviewing until we've covered everything, then write a complete
spec to SPEC.md.
```

Expect it to push on things like: how do you add a new project later (admin form? editing a DB row directly?), do case studies get their own route (`posts/$slug.tsx`-style) or just a card, do you want a contact form (and if so, is that a `createServerFn` POST handler, or does it need a public webhook — which would mean a [server route](https://tanstack.com/start/latest/docs/framework/react/guide/server-routes) instead), is there a CMS or is content just markdown rendered server-side, does the DB access belong behind auth middleware anywhere (it shouldn't for a public portfolio, but Claude should ask).

A good `SPEC.md` names the files/routes involved, states what's explicitly out of scope for v1, and ends with a concrete way to prove it works ("visiting `/` lists all projects, clicking one shows the case study, a broken image doesn't crash the page").

**Review this file yourself before moving on.** This is the cheapest place to catch a wrong turn.

### Phase 2 — Plan mode

```
/plan implement the portfolio site described in SPEC.md
```

Claude researches and proposes a plan without touching files. Press `Ctrl+G` to open it in your editor and edit directly if something's off — e.g., you know you want the project data seeded from a script rather than typed by hand. Approve it, and Claude exits plan mode already primed with an approach you signed off on.

### Phase 3 — Fresh session, implement

Run `/clear` before the actual build. This keeps `CLAUDE.md` and any skills, but drops the back-and-forth of the interview and planning conversation — so the implementation session reads `SPEC.md` and the approved plan directly, rather than working from a long, possibly-meandering chat history.

```
implement the plan for the portfolio site. reference SPEC.md throughout.
```

### Phase 4 — See it actually running

The first time in a project, set up the launch recipe once:

```
/run-skill-generator
```

This walks through getting your app running from a clean checkout — installing deps, running `prisma migrate`, starting the dev server — and saves that as a project skill so `/run` and `/verify` stop guessing next time. [(source)](https://code.claude.com/docs/en/skills#run-and-verify-your-app)

Then, instead of "the build passes, ship it":

```
/verify the project list page loads, shows the barber site case study,
and clicking into it renders without errors
```

This is the part that matters most for full-stack work specifically: a green build and passing types don't tell you the API route actually returns data, or that the DB connection string is wrong in dev. `/verify` boots the real thing and drives it.

### Phase 5 — Review before it ships

```
/code-review
/security-review
```

Both run in a fresh subagent context looking only at your diff — useful because the session that wrote the code is the worst-positioned session to catch its own mistakes. `/security-review` matters even for a portfolio site: contact forms and any admin-only "add a project" route are exactly the kind of thing worth a second look.

### Ongoing: `/goal` for the tedious stretches

Once the core site works, you'll have batches of repetitive work — e.g., writing up 4 more case studies once you've built the layout for the first one. That's a good `/goal` candidate:

```
/goal every project in the database has a case-study page that uses
CaseStudyLayout, images have alt text, and npm run build is clean
```

Claude keeps working across turns until that's actually true, instead of you re-prompting after each one.

## A subagent worth setting up

If you're going to be writing case-study copy for each project (including the barber site), a small subagent catches inconsistency without cluttering your main session:

`.claude/agents/content-reviewer.md`:
```markdown
---
name: content-reviewer
description: Reviews case-study writeups for typos, tone consistency, and missing details (client, stack, timeline, outcome)
tools: Read, Grep
model: sonnet
---
You are reviewing portfolio case-study content, not code. Check for:
- Typos and awkward phrasing
- Consistent tone across case studies
- Missing basics: what the client needed, what you built, what stack,
  what the outcome was
Flag issues with the specific line; don't rewrite unless asked.
```

Invoke it with: *"use the content-reviewer subagent on my new case study for the barber project."*

## Quick reference

| You want to... | Run |
|---|---|
| Start a new feature you haven't fully scoped | Interview prompt → `SPEC.md` |
| Plan before a multi-file change | `/plan <description>` |
| Reset context before implementing | `/clear` |
| Confirm the app really works, not just tests | `/run` or `/verify` |
| Teach `/run`/`/verify` your project's launch quirks | `/run-skill-generator` (once) |
| Grind through repetitive work unattended | `/goal <verifiable condition>` |
| Catch bugs before merging | `/code-review` |
| Catch security issues before shipping | `/security-review` |
| Undo something that went sideways | `/rewind` (aliases: `/checkpoint`, `/undo`) |
| See what's eating your context window | `/context` |

## Do this today

Scaffold the TanStack Start app (`npx @tanstack/cli@latest create`), run `/init`, and paste the interview prompt from Phase 1 verbatim (swap in your own details). Stop once `SPEC.md` exists and read it yourself before doing anything else — that's the entire point of the phase gate.

## Sources

- [Keep Claude working toward a goal](https://code.claude.com/docs/en/goal)
- [Extend Claude with skills](https://code.claude.com/docs/en/skills) (see "Run and verify your app")
- [Commands reference](https://code.claude.com/docs/en/commands)
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) (see "Explore first, then plan, then code" and "Let Claude interview you")
- [Create custom subagents](https://code.claude.com/docs/en/sub-agents)
- [Choose a permission mode](https://code.claude.com/docs/en/permission-modes)
- [How Claude remembers your project (CLAUDE.md)](https://code.claude.com/docs/en/memory)
- [TanStack Start: Getting Started](https://tanstack.com/start/latest/docs/framework/react/getting-started)
- [TanStack Start: Routing](https://tanstack.com/start/latest/docs/framework/react/guide/routing)
- [TanStack Start: Server Functions](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)
