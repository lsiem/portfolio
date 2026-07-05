# Phase 2: Recruiter Overview Live - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-05
**Phase:** 2-recruiter-overview-live
**Areas discussed:** UI-SPEC open decisions, Profile photo, GitHub activity data, MODE-01 dense overview, Overview section order, CV-PDF technique constraints, Production cutover timing, Branch strategy

---

## Gray area selection (round 1)

Offered: CV-PDF approach, UI-SPEC open decisions, Profile photo, GitHub activity data.
**Selected:** UI-SPEC open decisions, Profile photo, GitHub activity data.
**Not selected:** CV-PDF approach → generation technique left as a research flag (fidelity/layout still decided via D-E + CTX-05).

---

## Dark-mode toggle (D-B)

| Option | Description | Selected |
|--------|-------------|----------|
| 3-state: System/Light/Dark | Defaults to System, force Light/Dark, persisted, no-flash script | ✓ |
| 2-state: Light/Dark | Simpler toggle, loses explicit follow-system | |

**User's choice:** 3-state System/Light/Dark.

## CV document layout (D-E)

| Option | Description | Selected |
|--------|-------------|----------|
| One-column, ATS-friendly | Linear column, parses reliably in ATS, lowest risk | ✓ |
| Two-column (sidebar) | Sidebar + main, more designed, some ATS mis-order risk | |

**User's choice:** One-column, ATS-friendly.

## Profile photo (CONT-06)

| Option | Description | Selected |
|--------|-------------|----------|
| Ship text-first, slot photo later | About ships text-only now, photo drops in non-blocking | ✓ |
| I'll supply a photo now | Full About-with-photo this phase | |
| Text-only permanently | No photo at all, drops CONT-06 sub-criterion | |

**User's choice:** Ship text-first, slot photo later.
**Notes:** Photo becomes a non-blocking owner follow-up; Phase 2 stays unblocked.

## Photo shape/treatment (D-D)

| Option | Description | Selected |
|--------|-------------|----------|
| Rounded (rounded-lg) | Soft-cornered avatar-scale, neutral baseline | ✓ |
| Square | Hard-edged square crop | |
| You decide | Claude discretion within baseline | |

**User's choice:** Rounded (`rounded-lg`).

## GitHub activity data (TECH-08)

| Option | Description | Selected |
|--------|-------------|----------|
| GraphQL API + token, build-time/ISR | Official data via PAT env var, daily ISR, no runtime call | ✓ |
| Leave sourcing to research | Researcher compares options | |
| Defer heatmap from this phase | Drop TECH-08 for now | |

**User's choice:** GraphQL API + token, build-time/ISR.
**Notes:** Account `github.com/lsiem`. Owner action: create read-only PAT + add to Vercel env.

---

## Gray area selection (round 2)

After the first round the user chose "Explore more gray areas." Offered: MODE-01 dense overview, Overview section order, CV-PDF technique constraints, Production cutover timing.
**Selected:** all four.

## MODE-01 dense overview

| Option | Description | Selected |
|--------|-------------|----------|
| Single-scroll page IS the overview | Anchor-nav in first fold = the one click; no separate view | ✓ |
| Add a condensed TL;DR block | Compact summary card + full sections below; extra sync burden | |

**User's choice:** Single-scroll page IS the overview.

## Overview section order

| Option | Description | Selected |
|--------|-------------|----------|
| Career-first (current) | hero → career → projects → skills → about → contact; leads with the SysAdmin→SWE→PO arc | ✓ |
| Projects-first | Leads with ELIA flagship + case studies | |

**User's choice:** Career-first (current).

## CV-PDF technique constraint

| Option | Description | Selected |
|--------|-------------|----------|
| Build-time static file | Generated at build from content model, static asset per locale, zero runtime | ✓ |
| On-demand server route | Per-request generation, live "as of" date, small runtime cost | |
| Leave fully to research | No constraint | |

**User's choice:** Build-time static file. (Generation *technique* still a research item under this constraint.)

## Production cutover timing

| Option | Description | Selected |
|--------|-------------|----------|
| Promote at end of phase | Build on preview URLs, flip siteMetadataBase + promote when verification passes | ✓ |
| Progressive cutover | Promote sections as they land; live site shows partial states | |

**User's choice:** Promote at end of phase.

## Branch strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Rename this branch to a phase branch | fix/interim-portfolio-styling → phase/02-recruiter-overview-live | ✓ |
| New branch off this one | Fresh phase branch, leave fix/ as-is | |
| Keep committing on current branch | Use fix/interim-portfolio-styling as-is | |

**User's choice:** Rename this branch. Executed: branch renamed to `phase/02-recruiter-overview-live`; one PR to `main` at end of phase.

---

## Claude's Discretion

- OG image template composition (`next/og` `ImageResponse` at build) within the UI-SPEC neutral spec.
- Icon approach (inline SVG vs tree-shaken lucide-react) — minimal, monochrome.
- Exact Tailwind 4 `@custom-variant dark (…)` syntax — confirm against current docs.
- CV-PDF library/tooling selection within the build-time constraint (guided by research).
- MDX/content-loader plumbing for feeding CV + OG generators.

## Deferred Ideas

- Profile photo asset → owner-supplied, slots into About post-Phase-2 (non-blocking).
- Signature visual identity, color world, bold/kinetic type, decorative & scroll motion, immersive experience, signature photo treatment → Phase 3.
- Full reduced-motion quiet-variant (MODE-02) → Phase 3.
- Two-column CV polish → possible Phase 3.
- shadcn / component library → not adopted; Phase 3 identity concern if ever.
