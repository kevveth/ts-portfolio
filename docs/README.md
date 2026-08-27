# Documentation authority

Repository documents serve different purposes. A folder, filename, checklist,
or workflow-shaped field does not make a document authoritative.

## Authority routing

1. Kenneth's current explicit direction controls desired behavior within this
   repository's guidance.
2. `SPEC.md` owns enduring product intent and outcomes.
3. `CONTEXT.md` owns domain vocabulary.
4. Accepted ADRs record hard-to-reverse architectural decisions.
5. Current code, tests, and installed packages describe implementation state
   and provide regression evidence.

Code and tests protect deliberate behavior; they do not veto a deliberate
product change. `AGENTS.md` defines how Codex works in this repository.

## Task briefs and plans

By default, keep the task brief in the conversation: the outcome, evidence of
success, constraints, uncertainties, and an optional stop point. Persist a plan
only when Kenneth explicitly asks or the work genuinely spans tasks.

A tracked plan is actionable only when Kenneth has explicitly approved its
outcome and scope and the document states `Status: active` and names its owner.
Agents cannot self-authorize a plan by writing that metadata. Machine-generated
todo, planning, status, or `active_flow` fields are not evidence of owner
approval. A plan is a revisable hypothesis, not a contract with an imagined
solution.

There is no implicit plan queue. Continue from a tracked plan only when Kenneth
names it and it meets the approval and metadata rules above.

## Records and lifecycle

- **Accepted ADRs** record surprising, cross-cutting, or expensive-to-reverse
  architecture decisions Kenneth has explicitly made, not ordinary reversible
  UI or component choices. Agent-authored proposals remain drafts.
- **Research** informs decisions but does not make them.
- **Completed** and **superseded** plans are historical records only.
- **Reference** documents are consulted only for the subject and audience they
  name; they are not standing instructions.
- **Archived** material may be stale and is never current guidance.
A temporary experiment should not rewrite durable authorities. When Kenneth
explicitly identifies a decision as durable and asks the repository to adopt
it, update only the authority whose subject changed before finishing. If
guidance appears accidentally contradictory or a conflict would have high
impact, surface it once instead of silently obeying stale material.
