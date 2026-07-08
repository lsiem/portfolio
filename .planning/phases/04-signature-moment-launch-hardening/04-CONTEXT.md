# Phase 4: Signature Moment & Launch Hardening — Context

**Phase:** 4 — Signature Moment & Launch Hardening
**Mode:** mvp
**Depends on:** Phase 3 (Design Direction & Immersive Experience)
**Requirements:** WOW-01 (+ launch re-verification of TECH-01, MODE-01, MODE-02 on production)

## Phase Goal

Der Hero liefert den einen identitätsgebundenen 3D/WebGL-Wow-Moment — lazy, capability-gated und jederzeit streichbar — und jede Zusage der Site ist vor dem Launch auf der Produktions-URL verifiziert.

## What This Phase Delivers

1. **WOW-01:** ONE signature 3D/WebGL moment in the hero — the "Infrastructure Topology" procedural lattice (D-20), visible only on capable desktop pointer devices.
2. **Launch hardening:** Production verification of TECH-01 (CWV with 3D active), MODE-01 (30s stopwatch), MODE-02 (reduced-motion full content) on `https://lsiem.de`.

## What This Phase Does NOT Deliver

- No second 3D scene elsewhere on the site.
- No imported 3D assets / Draco / KTX2 pipeline (deferred v1.x).
- No postprocessing bloom stack.
- No CSP resolution (tracked Phase 2 follow-up).
- No v2 features (AI chat, terminal).

## Locked Decisions

### Carried from Phase 3 (unchanged)

| ID | Decision |
|----|----------|
| D-01 | Engineered / systems art direction — grid, mono, coordinate motifs |
| D-02 | Warm-stone palette + single orange accent (token-driven) |
| D-08 | GSAP is the only DOM animation engine |
| D-13 | Hero 3D seam: `<HeroSceneSlot />` behind content, no re-layout |
| D-17 | No preloader; content from first paint |
| D-18 | Reduced-motion = same DOM, no WebGL |
| D-19 | Mobile (`pointer: coarse`) = no WebGL, deliberate static layout |

### New for Phase 4

| ID | Decision | Rationale |
|----|----------|-----------|
| D-20 | **Scene: "Infrastructure Topology"** — procedural node/edge lattice, accent pulse on one path, no GLB | Identity-bound (DevOps/SWE), avoids asset pipeline, matches D-01 |
| D-21 | Lazy mount: `dynamic({ ssr: false })` + `requestIdleCallback`, invisible loading (no spinner) | WOW-04 / TECH-01 — never block first paint |
| D-22 | Scroll bridge: GSAP ScrollTrigger → module ref → R3F `useFrame` | Single scroll authority; no drei ScrollControls |
| D-23 | 3D gate: `no-preference` + `pointer:fine` + `hardwareConcurrency >= 4` + WebGL2 | PITFALLS #4 tiering; mobile never gets 3D |
| D-24 | `frameloop="demand"`, `dpr={[1,1.5]}`, `antialias: false`, low-power preference | GPU/battery discipline |
| D-25 | Context loss → dispose + unmount to empty layer (no restore loop) | ROADMAP SC2 fallback |
| D-26 | Launch verification on production URL for TECH-01, MODE-01, MODE-02 | Phase goal clause 2 |

## Success Criteria (from ROADMAP)

1. Capable desktop visitor sees ONE signature 3D/WebGL moment in the hero, conceptually tied to Lasse's identity.
2. 3D loads lazy after first paint, never in initial bundle; weak devices / reduced-motion get full experience without it, including context-loss fallback.
3. Production URL passes mobile Lighthouse/CWV audit with 3D active (TECH-01 re-check); tested on real mid-tier Android.
4. External testers pass 30-second stopwatch and reduced-motion walkthrough on production (MODE-01 / MODE-02 re-check).

## Code Context (existing seams)

- `src/components/motion/hero-scene-slot.tsx` — empty Server Component layer today; Phase 4 converts to client gate + lazy canvas.
- `src/app/[locale]/page.tsx` — hero section already places `<HeroSceneSlot />` at `absolute inset-0 -z-10`.
- `src/components/motion/motion-provider.tsx` — analog for `useSyncExternalStore` gating + lazy import pattern.
- `lighthouserc.json` — LCP warn 2500ms, script size 184643 bytes, TBT 200ms.
- `evals/immersive.spec.ts` — Phase 3 contracts to extend, not break.

## Open Items from Prior Phases (this phase closes)

| Item | Source | Phase 4 action |
|------|--------|----------------|
| Production LCP ≤ 2500ms with Bricolage H1 | 03-VERIFICATION deferred | Re-run on production; confirm 3D does not regress |
| WOW-01 pending | REQUIREMENTS.md | Implement + verify |
| 3D research flag (tiering, context loss) | STATE.md blockers | Resolved in 04-RESEARCH.md, implemented in 04-01–03 |

## References

- `.planning/ROADMAP.md` — Phase 4 entry
- `.planning/REQUIREMENTS.md` — WOW-01
- `.planning/phases/04-signature-moment-launch-hardening/04-RESEARCH.md`
- `.planning/phases/04-signature-moment-launch-hardening/04-UI-SPEC.md`
- `.planning/phases/03-design-direction-immersive-experience/03-CONTEXT.md` — deferred 3D list
