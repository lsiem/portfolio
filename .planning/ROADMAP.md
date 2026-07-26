# Roadmap: Portfolio Neubau lsiem.de

## Milestones

- ✅ **v1.0 — Portfolio Neubau** (Phases 1–6, 21 plans, shipped 2026-07-26) — [archive](./milestones/v1.0-ROADMAP.md) · [requirements](./milestones/v1.0-REQUIREMENTS.md) · [audit](./v1.0-MILESTONE-AUDIT.md) · live at [lsiem.de](https://lsiem.de)

## Current Milestone

No active milestone. Run `/gsd-new-milestone` to scope the next one.

**Phase numbering continues from 7** — never restart at 1.

## Backlog

Carried from v1.0 requirements scoping (2026-07-02), deferred by plan rather than slippage:

- **AI-01** — "Ask Lasse" AI chat: RAG over the content model, streaming UI, DE/EN, guardrails against off-topic and prompt injection, rate limiting plus cost cap
- **AI-02** — Interactive terminal easter egg (`help`, `cv`, `projects`), later backed by the AI-01 endpoint

Open items carried out of v1.0 (non-blocking, tracked in STATE.md → Deferred Items):

- External human tester for the 30-second stopwatch flow and reduced-motion walkthrough on production
- Physical mid-tier Android device measurement (emulated throttling is only a proxy)
- Backfill VERIFICATION artifacts for the workflow-driven phases 5 and 6, or codify that workflow-driven phases close on PR + design-spec evidence
- Refresh stale architecture comments (`stage/seeded.ts`, `stage-gate.tsx`, `stage-canvas.tsx`) and the two stale clauses in `lighthouserc.webgl.json`

---

*v1.0 phase details, success criteria, decisions and tech debt: [.planning/milestones/v1.0-ROADMAP.md](./milestones/v1.0-ROADMAP.md)*
