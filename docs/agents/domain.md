# Domain Docs

How engineering skills should consume this repository's domain and architecture documentation while exploring the codebase.

## Before exploring, read these

- **`CONTEXT.md`** at the repository root, when it exists.
- **Relevant records under `specs/` and `docs/`**, including product scope, technical architecture, and workflow documentation.
- **Relevant ADRs under `docs/adr/`**, when that directory exists.

If `CONTEXT.md` or `docs/adr/` does not exist, proceed silently. Do not propose empty placeholders. The `domain-modeling` skill, reached through workflows such as `grill-with-docs` and `improve-codebase-architecture`, creates them lazily when terminology or decisions are actually resolved.

## File structure

This is a single-context repository:

```text
/
├── CONTEXT.md              # domain glossary, created lazily
├── docs/
│   ├── adr/                 # architectural decisions, created lazily
│   └── handoffs/            # established cross-agent handoffs
├── specs/                 # product and architecture records
└── src/
```

Do not introduce `CONTEXT-MAP.md` or per-folder context documents unless this repository later becomes a genuine multi-context monorepo.

## Keep each record focused

- Use `CONTEXT.md` only as a concise glossary of domain concepts. Do not turn it into a specification, scratchpad, or implementation guide.
- Use `docs/adr/` for hard-to-reverse architecture decisions.
- Keep product specifications and delivery state under `specs/`.
- Keep cross-agent continuation records under `docs/handoffs/` and follow that directory's existing lifecycle.

## Use the glossary's vocabulary

When output names a domain concept in an issue title, proposal, hypothesis, or test, use the term defined in `CONTEXT.md`. Do not drift to synonyms the glossary explicitly avoids.

If a needed concept is absent, reconsider whether the project uses that language. If the gap is real, note it for the `domain-modeling` skill.

## Flag ADR conflicts

If proposed work contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it. Name the ADR and explain why reopening the decision may be warranted.
