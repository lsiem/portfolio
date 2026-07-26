# Portfolio Neubau — lsiem.de

## What This Is

Lasse Siemoneit's personal portfolio at lsiem.de — an immersive, bilingual web experience that works as a professional calling card for recruiters, tech leads and a general audience.

**v1.0 shipped 2026-07-26.** The rebuild is done: the previous React/Vite/GSAP SPA was discarded and replaced from zero. The site is live, statically prerendered, DE/EN, with a solid-3D KERN stage that recomposes per section behind a capability gate.

## Current State

**Shipped:** v1.0 (2026-07-26) — 6 phases, 21 plans, 137 commits over 24 days. [Milestone archive](./milestones/v1.0-ROADMAP.md)

**Live stack:** Next.js 16 (App Router, SSG) · React 19 · TypeScript 6 · Tailwind 4 · GSAP 3 + Lenis (one animation engine, no second) · next-intl (route-based DE/EN) · three.js + @react-three/fiber (lazy chunk only) · content-collections (Git-based content model) · Vercel

**What exists today:**
- Bilingual content model as single source of truth, feeding the site, the dense overview and the build-time CV PDFs
- Full recruiter surface: hero value-prop, career timeline, project bento with two deep case studies, domain-grouped skills, about, one-click contact, live GitHub activity
- Motion system: scroll-storytelling career spine, magnetic controls, crossfade route transitions, reduced-motion quiet variant
- KERN solid-3D stage: 384 instanced beveled shard-prisms forming the LS monogram, reshaping per section, object-constancy route transitions, two draw calls
- Dark mode (system + toggle), OG images per page/locale, Person JSON-LD, cookieless analytics

**Quality gates in CI on every push and PR:** content parity → unit tests (17 assertions) → build → DSGVO chunk tripwire → 159 Playwright evals against the production build → Lighthouse budget (eager 179,673 B against a 184,643 B ceiling, pinned to `?webgl=off`).

**Measured in production:** LCP 815ms desktop / 768ms under 4× CPU + Slow 4G with 3D forced on, CLS 0.00 — roughly 3× under the 2500ms budget. WCAG AA in both themes, zero sub-AA failures.

## Core Value

Wer die Seite besucht, sagt "wow" — und findet trotzdem in unter 30 Sekunden die Fakten (wer, was, Kontakt), wenn er es eilig hat.

**Still the right priority.** v1.0 validated both halves: the automated 30-second stopwatch flow passes on production in both locales, and the wow layer never blocks it — the first viewport is server-rendered HTML and the 3D stage mounts post-idle behind a gate.

## Next Milestone Goals

No milestone is active. The obvious candidate is **v1.1 — AI & Interaction**, already scoped at v1.0 requirements definition:

- **AI-01** — "Ask Lasse" chat: RAG over the content model, streaming UI, DE/EN, guardrails against off-topic and prompt injection, rate limiting plus cost cap
- **AI-02** — Interactive terminal easter egg (`help`, `cv`, `projects`), later backed by the AI-01 endpoint

The static-first Next.js app already has the server seam these need — route handlers plus the AI SDK, no architecture change. Run `/gsd-new-milestone` to scope it properly rather than treating the above as settled.

Also open, non-blocking (see STATE.md → Deferred Items): a real external human tester for the stopwatch flow, a physical mid-tier Android measurement, and backfilling verification artifacts for the workflow-driven phases 5–6.

## Requirements

All 24 v1 requirements shipped. Full list with final traceability: [v1.0-REQUIREMENTS.md](./milestones/v1.0-REQUIREMENTS.md).

### Active

None — awaiting the next milestone's requirements definition.

### Out of Scope

Audited at v1.0 close; all reasons still valid. Full table in the [requirements archive](./milestones/v1.0-REQUIREMENTS.md).

Headlines: no blog (no established writing routine — a stale blog hurts more than none), no sound design, no testimonials, no hosted CMS (the Git content model *is* the CMS for a single author), no skill percentage bars, and above all **no unskippable intro or forced preloader** — that one directly violates the core value.

<details>
<summary>Pre-v1.0 requirement tracking (superseded)</summary>

- [x] Prominenter Skip-/Überblick-Modus für Eilige — *validated in Phase 2*
- [x] Vollständige Inhalte: Werdegang, Projekte/Case Studies, Skills, Über-mich, Kontakt — *validated in Phase 1–2*
- [x] Zweisprachig Deutsch + Englisch mit Umschalter — *validated in Phase 1–2*
- [x] Live auf lsiem.de deployed, performant — *validated in Phase 2*
- [x] Stack-Entscheidung auf Basis der Recherche — *validated in Phase 1*
- [x] Immersives Erlebnis als Standard-Modus — *validated in Phases 3–6*

</details>

## Context

- **Profil:** Selbsterlernter Full-Stack-Entwickler & DevOps Engineer, 5+ Jahre Erfahrung, Fokus Web- und Hybrid-Apps. Werdegang: ITSC GmbH, Just Relate, ex-CTO Vidama, Freelance.
- **Alt-Rewrite:** the earlier React 19 + Vite + Framer Motion + R3F build is gone from the serving path and kept only in git history. lsiem.de has served the Next.js site since Phase 1.
- **Two agent lanes:** this repo is worked by Claude Code (primary, GSD workflow) and Google Antigravity (visual/browser iteration). Never both at once — see AGENTS.md. v1.0's most expensive process failure was a cross-lane bulk commit that rewrote the site unreviewed and had to be caught in verification and reverted.
- **DSGVO scope:** lsiem.de is German-jurisdiction. Analytics stay cookieless, fonts are self-hosted via `next/font`, and no runtime third-party call may be added. A build-time chunk tripwire enforces this in CI.

## Constraints

- **Hosting**: Vercel + domain lsiem.de
- **Sprache**: content bilingual DE/EN
- **Performance**: immersion must not ruin load time or Core Web Vitals — CI enforces the budget
- **Tech stack**: settled at v1.0 (see Current State). Changes now need a reason, not just a preference.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Kompletter Neustart statt Weiterentwicklung des Rewrites | Design, Inhalte und Codebasis überzeugen nicht | ✅ Validated — v1.0 shipped; nothing from the old build survived into the serving path |
| "Erlebnis mit Abkürzung": immersiv als Standard, Skip/Überblick für Eilige | Löst die Spannung zwischen Wow-Anspruch und Recruiter-Bedürfnis | ✅ Validated — automated stopwatch passes on production; wow layer never blocks first paint |
| Stack-Wahl an Recherche delegiert | Evidenzbasiert statt Bauchgefühl | ✅ Validated — Next.js 16 + GSAP; SSG-first fixed the old build's LCP/SEO weakness |
| Zweisprachig DE/EN | Deutsche Recruiter UND internationale Tech-Leads | ✅ Validated — route-based i18n, hreflang, per-locale OG, parity gate in CI |
| Live deploy ab Phase 1, komplette Site live ab Phase 2 | Gegenmittel zum "Rebuild, der nie shippt" | ✅ Validated — the site was live and useful 3 days in, and never regressed off production |
| Genau eine Animations-Engine (GSAP), D-08 | Zwei Engines waren die Unsauberkeit des Alt-Builds | ✅ Held for the entire milestone — no second engine admitted |
| 3D architektonisch streichbar (Gate + Lazy + Bridge) | Wow darf CWV nicht kosten | ✅ Validated — survived two full 3D-layer replacements without touching the DOM contract |
| Reduced-motion ist ein unbedingtes Zero-Canvas-Gate (D-10) | Accessibility darf nicht überschreibbar sein | ✅ Held — beats even `?webgl=force`; enforced by evals |
| Produktion ist die kalibrierte Wahrheit für LCP (D-11) | Lokale Lab-Runs sind kein CDN | ✅ Validated — the 2.7s LHCI warn was a cold-localhost artifact; production is 815ms |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-26 at v1.0 milestone close — full rebuild shipped and live on lsiem.de*
