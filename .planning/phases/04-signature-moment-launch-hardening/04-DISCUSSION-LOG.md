# Phase 4: Signature Moment & Launch Hardening - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 4-Signature Moment & Launch Hardening
**Areas discussed:** Scene concept, Scroll & interaction, Presence & intensity, Launch verification

---

## Scene Concept

### What is the signature 3D moment conceptually?

| Option | Description | Selected |
|--------|-------------|----------|
| Multi-agent constellation | Living node graph — agents connected by pulsing signal lines, tied to ELIA/multi-agent PO identity; cheap point-and-line geometry | ✓ |
| Infra/ops topology | Abstract container/pod grid deploying/scaling — OpenShift roots; reads more "ops" than "AI PO" | |
| Engineered 3D typography | Name/monogram as CAD-like 3D assembly; competes with the split-text headline | |

**User's choice:** Multi-agent constellation (recommended)

### Abstract or encoding real meaning?

| Option | Description | Selected |
|--------|-------------|----------|
| Abstract with hidden structure | Shape subtly derives from something real (career graph / ELIA topology), no labels | ✓ |
| Purely abstract | Generative network, metaphor-level identity link only | |
| Readable/annotated | Mono micro-labels on nodes; competes with hero text, i18n complexity in 3D | |

**User's choice:** Abstract with hidden structure (recommended)

### Material language?

| Option | Description | Selected |
|--------|-------------|----------|
| Precise points + hairlines | Crisp dots, thin lines, orange edge pulses — technical-drawing precision, cheapest render | ✓ |
| Glow & particles | Bloom/particles "AI look" — GPU cost, kitsch risk | |
| Wireframe solids | Small wireframe polyhedra — sculptural, "crypto-site" risk | |

**User's choice:** Precise points + hairlines (recommended)

### Temporal behavior?

| Option | Description | Selected |
|--------|-------------|----------|
| Drift + message pulses | Slow drift; irregular orange pulses travel edges like agent messages | ✓ |
| Calm drift only | Pure atmospheric parallax, no events | |
| Reactive bursts | Network reorganizes visibly — high effort, attention risk | |

**User's choice:** Drift + message pulses (recommended)

---

## Scroll & Interaction

### Scroll behavior / hero exit?

| Option | Description | Selected |
|--------|-------------|----------|
| Scroll-linked exit | Parallax/recede + dissolve on scroll via ScrollTrigger bridge; canvas unmounts/pauses after | ✓ |
| Static backdrop | No scroll coupling | |
| Persistent companion | 3D follows down the page — scope/GPU/CWV risk | |

**User's choice:** Scroll-linked exit (recommended)

### Pointer reaction?

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle pointer influence | Nodes near cursor gently attract/illuminate; pointer-only | ✓ |
| No pointer reaction | Purely autonomous | |
| Full interactive | Draggable/orbitable toy — conflicts with 30s fast path | |

**User's choice:** Subtle pointer influence (recommended)

### Mobile 3D?

| Option | Description | Selected |
|--------|-------------|----------|
| Capable phones included | Gate by measured capability; tuned-down constellation on flagships | ✓ |
| Desktop-only | Fine-pointer/desktop only | |
| You decide | Leave gate boundary to research/planning | |

**User's choice:** Capable phones included (recommended)

---

## Presence & Intensity

### Prominence in the hero?

| Option | Description | Selected |
|--------|-------------|----------|
| Atmospheric layer | Alive but text stays focal; denser at edges, sparser behind copy | ✓ |
| Co-star | Compositional equal to the headline — legibility/fast-path risk | |
| Background whisper | Nearly subliminal — fails the signature promise | |

**User's choice:** Atmospheric layer (recommended)

### Entrance?

| Option | Description | Selected |
|--------|-------------|----------|
| Boot-sequence extension | Assembles as final beat of "system booting" intro; graceful fade-in if late | ✓ |
| Quiet fade-in | Independent cross-fade whenever ready | |
| You decide | Planner picks based on timing variance | |

**User's choice:** Boot-sequence extension (recommended)

### Fallback without 3D?

| Option | Description | Selected |
|--------|-------------|----------|
| Phase-3 hero as-is | No substitute artwork; nothing missing | ✓ |
| Static constellation echo | Static SVG/image in the slot — extra asset, LCP surface | |
| CSS-only hint | CSS dots/lines approximation — cheap-version risk | |

**User's choice:** Phase-3 hero as-is (recommended)

---

## Launch Verification

### Mid-tier Android access?

| Option | Description | Selected |
|--------|-------------|----------|
| I have one available | Hands-on UAT step | |
| Remote/emulated only | DevTools throttling + real-device cloud proxy, documented | ✓ |
| Need to organize one | Late non-blocking checkpoint | |

**User's choice:** Remote/emulated only

### External testers?

| Option | Description | Selected |
|--------|-------------|----------|
| Friends/colleagues | 2–3 real people with scripted protocol (was recommended) | |
| Self-test with protocol | Owner on fresh profile + one agent run | |
| Agent-assisted panel | Browser-agent runs execute scripted walkthroughs; owner spot-checks | ✓ |

**User's choice:** Agent-assisted panel

### LCP gate?

| Option | Description | Selected |
|--------|-------------|----------|
| Hard gate: optimize to green | Explicit LCP work; ≤2500ms on production mobile with 3D; CI assertion restored to error | ✓ |
| Soft gate: no regression | Accept ~2.5–2.9s baseline, keep CI warning | |
| Budget-based compromise | Realistic hard budget (e.g. 2.8s) | |

**User's choice:** Hard gate: optimize to green (recommended)

### Sequencing?

| Option | Description | Selected |
|--------|-------------|----------|
| Harden first, then 3D | LCP green first, then constellation on healthy baseline; clean attribution; de-risks removability | ✓ |
| 3D first, then harden | Hardening at the end — attribution muddier, squeeze risk | |
| Parallel tracks | Independent waves merging for final verification | |

**User's choice:** Harden first, then 3D (recommended)

---

## Claude's Discretion

- Constellation geometry, node counts per tier, hidden-structure source data, drift/pulse tuning
- Capability-gate signals and thresholds (device-tiering research)
- LCP optimization levers
- R3F integration details (dynamic chunking, frameloop, DPR clamp, context-loss recovery); Draco/KTX2 likely unnecessary for points/lines — researcher confirms
- Scroll-exit: unmount vs pause — whichever profiles better

## Deferred Ideas

- Persistent 3D companion beyond the hero (v2)
- Readable/annotated constellation as a standalone "systems map" page (future)
- Re-run Android verification on physical hardware if a device becomes available
- Sound design, terminal easter-egg, AI-chat (unchanged: v2/out of scope)
- CSP hardening (unchanged Phase-2 follow-up)
