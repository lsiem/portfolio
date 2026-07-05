# Phase 3: Design Direction & Immersive Experience - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-05
**Phase:** 3-Design Direction & Immersive Experience
**Areas discussed:** Art Direction, Career Storytelling, Motion & Craft, Skip & Quiet Variant, Display Face, Hero Treatment, Projects & Case Studies, Profile Photo

---

## Art Direction — Direction

| Option | Description | Selected |
|--------|-------------|----------|
| Engineered / systems | Mono-forward, grid/console motifs, precise lines; accent as signal color | ✓ |
| Elevate current minimal | Keep Swiss-minimal, let motion carry the wow | |
| Dark-first cinematic | Dramatic dark-first, high contrast, atmosphere | |
| Editorial / magazine | Bold typographic hierarchy, asymmetric grid-breaking | |

**User's choice:** Engineered / systems
**Notes:** Fits the developer/DevOps identity; builds on the mono typography already shipped.

## Art Direction — Color world

| Option | Description | Selected |
|--------|-------------|----------|
| Keep warm-stone + orange | Reuse exact live palette; engineered feel from grid/mono/motion | ✓ |
| Cooler technical neutrals | Shift to graphite/console greys | |
| New signal accent | Swap orange for phosphor/cyan/amber | |
| Neutrals + dual accent | Add a second functional accent | |

**User's choice:** Keep warm-stone + orange
**Notes:** Zero re-theming risk; dark mode already tuned.

## Art Direction — Typography

| Option | Description | Selected |
|--------|-------------|----------|
| Geist only, mono-forward | Push mono harder; no new fonts | |
| Add a display face | One distinctive self-hosted display face for headlines + Geist | ✓ |
| Mono as the headline | Geist Mono becomes the headline face | |

**User's choice:** Add a display face
**Notes:** Must be self-hosted via next/font (no Google runtime, DSGVO-clean). Category refined later to "technical grotesque".

## Art Direction — Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Single column + grid accents | Keep max-w-3xl, add grid motifs | |
| Widen to structural grid | Wider gridded layout, margin columns, asymmetric placement | ✓ |
| Section-dependent | Most single-column, signature sections break wide | |

**User's choice:** Widen to structural grid
**Notes:** Reading column stays anchored for text integrity.

---

## Career Storytelling — Mechanic

| Option | Description | Selected |
|--------|-------------|----------|
| Pinned scrub scenes | Chapters pin + scrub | |
| Progressive reveal timeline | Native scroll, reveal-on-enter, no scrolljacking | ✓ |
| Horizontal chapters | Vertical scroll drives horizontal movement | |
| You decide | Delegate to research/UI-spec | |

**User's choice:** Progressive reveal timeline
**Notes:** Robust; degrades trivially to reduced-motion + mobile.

## Career Storytelling — ITSC arc treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Hero sub-scene | ITSC expands into a multi-beat sub-sequence (centerpiece) | ✓ |
| Uniform beats | Every org/role reveals with equal weight | |
| You decide | Delegate emphasis distribution | |

**User's choice:** Hero sub-scene
**Notes:** SysAdmin→SWE→PO is the emphasized narrative core; other orgs lighter.

## Career Storytelling — Persistent device

| Option | Description | Selected |
|--------|-------------|----------|
| Progress spine + ticks | Vertical rail + scroll-progress + tick/coordinate labels | ✓ |
| Year/coordinate readout | Fixed mono readout updating per chapter | |
| No persistent chrome | Reveals only | |
| You decide | Delegate | |

**User's choice:** Progress spine + ticks

---

## Motion & Craft — Scroll

| Option | Description | Selected |
|--------|-------------|----------|
| Native scroll only | No Lenis; GSAP drives reveals | |
| Lenis smooth scroll | Lerped scroll (STACK rec), disabled under reduced-motion | ✓ |
| You decide | Delegate | |

**User's choice:** Lenis smooth scroll
**Notes:** Must disable under reduced-motion; tune for mobile.

## Motion & Craft — Intensity

| Option | Description | Selected |
|--------|-------------|----------|
| Refined & precise | Restrained, fast, purposeful | |
| Medium / expressive | Staggered reveals, split-text, magnetic — disciplined | ✓ |
| Bold & kinetic | Big, dramatic, showy | |

**User's choice:** Medium / expressive

## Motion & Craft — Micro-interactions (multi-select)

| Option | Description | Selected |
|--------|-------------|----------|
| Magnetic buttons/links | Pull toward cursor; pointer-only | ✓ |
| Split-text headline reveals | GSAP SplitText; real DOM text underneath | ✓ |
| Designed hover states | Deliberate hover/focus/active across surfaces | ✓ |
| Seamless section/page transitions | View Transitions API or GSAP | ✓ |

**User's choice:** All four
**Notes:** Single engine (GSAP + @gsap/react) treated as settled per STACK.md + success criterion.

---

## Skip & Quiet Variant — Skip model

| Option | Description | Selected |
|--------|-------------|----------|
| Layered enhancement (no toggle) | Content present from first paint; motion is enhancement; anchor nav is the "skip" | ✓ |
| Explicit skip/overview control | Visible affordance to disable motion / jump past hero | |
| Both | Layered base + a small calm-motion control | |

**User's choice:** Layered enhancement (no toggle)
**Notes:** Matches Phase 2 CTX-01 (single-scroll overview IS the recruiter overview).

## Skip & Quiet Variant — Reduced-motion production

| Option | Description | Selected |
|--------|-------------|----------|
| Same DOM, motion stripped | One implementation; reduced-motion disables Lenis+GSAP, reveals instant | ✓ |
| Distinct quiet layout | Separately art-directed calm variant | |
| You decide | Delegate | |

**User's choice:** Same DOM, motion stripped
**Notes:** This IS the "shared implementation with overview-mode" MODE-02 requires.

## Skip & Quiet Variant — Mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Same story, tuned for touch | Grid collapses to focused single column; reveals stay; magnetic off on touch; Lenis/intensity re-tuned | ✓ |
| Lighter motion on mobile | Reduce motion density on small screens | |
| You decide | Delegate | |

**User's choice:** Same story, tuned for touch

---

## Display Face — Category

| Option | Description | Selected |
|--------|-------------|----------|
| Technical grotesque | Characterful neo-grotesque, pairs with Geist, engineered | ✓ |
| Monospace display | Full terminal/systems headline | |
| Geometric / constructed | Mechanical, drafted, echoes the grid | |
| You decide | Delegate category + face | |

**User's choice:** Technical grotesque
**Notes:** Specific face delegated to research/UI-spec within self-hosted constraint.

---

## Hero — Treatment

| Option | Description | Selected |
|--------|-------------|----------|
| Engineered intro sequence | Grid draws in, split-text headline, mono value-prop reveal; "system booting" | ✓ |
| Structural static + subtle motion | Striking static composition, restrained motion | |
| You decide | Delegate | |

**User's choice:** Engineered intro sequence
**Notes:** Name/role/value-prop stay static SSR HTML (LCP-safe).

## Hero — Phase-4 3D seam

| Option | Description | Selected |
|--------|-------------|----------|
| Reserve a background canvas layer | Empty behind-content slot Phase 4 fills with lazy 3D; no re-layout | ✓ |
| Standalone now, restructure in P4 | Best hero now, accept rework later | |
| You decide | Delegate | |

**User's choice:** Reserve a background canvas layer
**Notes:** Matches roadmap's capability-gate + scroll-bridge + strippable 3D intent.

---

## Projects & Case Studies — Composition

| Option | Description | Selected |
|--------|-------------|----------|
| Featured hierarchy / bento | ELIA flagship large, Vidama medium, rest compact | ✓ (adapted) |
| Uniform elevated cards | Equal-weight engineered cards | |
| List + motion only | Keep list, add motion/hover | |

**User's choice:** Featured hierarchy — clarified verbatim: "ELIA/ITSC and Vidama featured, rest compact."
**Notes:** Owner initially phrased it as "Do 1. for Vidama and ITSC"; clarified in plain text that ITSC = the ELIA case study (Product-Owner work at ITSC). Final: ELIA + Vidama are the two large featured items; the rest of the projects compact. Matches Phase 1 D-01 weighting.

## Projects & Case Studies — Detail pages

| Option | Description | Selected |
|--------|-------------|----------|
| Engineered but reading-first | Inherit art direction + motion, optimized for reading | ✓ |
| Overview-only immersion | Case-study pages stay clean Phase-2 layout | |
| You decide | Delegate | |

**User's choice:** Engineered but reading-first

---

## Profile Photo

| Option | Description | Selected |
|--------|-------------|----------|
| Design the treatment, photo slots in | Signature engineered framing designed now; image slots in later | ✓ |
| Stay fully deferred | Keep About text-first | |
| You decide | Delegate | |

**User's choice:** Design the treatment, photo slots in
**Notes:** Image remains owner-supplied, non-blocking.

---

## Claude's Discretion

- Specific display typeface within "technical grotesque" + self-hosted constraint (D-03).
- Motion-token values (durations, easings, stagger) and the seamless-transition technique (View Transitions API vs GSAP).
- Lenis↔ScrollTrigger sync details and mobile tuning thresholds.
- Spine/coordinate-readout visual design and bento breakpoints.
- Implementation of the reserved 3D layer (placeholder canvas vs slot component).

## Deferred Ideas

- Signature 3D/WebGL hero moment (WOW-01) → Phase 4 (Phase 3 only reserves the seam).
- Actual profile-photo image asset → owner-supplied, non-blocking.
- Two-column CV polish → possible later refinement.
- Sound design, terminal easter-egg, AI-chat → out of scope / v2.
- CSP hardening → tracked Phase 2 follow-up, unchanged by this phase.
