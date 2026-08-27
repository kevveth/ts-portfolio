# Domain docs

Follow the authority routing in `docs/README.md`; never infer authority from a
folder, filename, checklist, or workflow-shaped field.

Read `CONTEXT.md` when domain language is relevant to the task. Read only the
directly relevant accepted ADRs or explicitly active plans. Do not read
completed or superseded plans, reference notes, or archived material by default;
consult them only when the current task specifically needs their history or
evidence.

If `CONTEXT.md` or `docs/adr/` does not exist, proceed silently. Do not propose
empty placeholders. Do not create or update domain records or ADRs unless the
task includes recording an explicitly confirmed domain or architecture
decision.

This is a single-context repository. Do not introduce `CONTEXT-MAP.md` or
per-folder context documents unless it later becomes a genuine multi-context
monorepo.

## Keep each record focused

- Use `CONTEXT.md` only as a concise glossary of domain concepts. Do not turn it into a specification, scratchpad, or implementation guide.
- Use `docs/adr/` for hard-to-reverse architecture decisions.

## Use the glossary's vocabulary

When output names a domain concept in an issue title, proposal, hypothesis, or test, use the term defined in `CONTEXT.md`. Do not drift to synonyms the glossary explicitly avoids.

If a needed concept is absent, reconsider whether the project uses that language. If the gap is real, note it for the `domain-modeling` skill.

## Flag ADR conflicts

If proposed work contradicts an existing ADR, surface the conflict explicitly rather than silently overriding it. Name the ADR and explain why reopening the decision may be warranted.
