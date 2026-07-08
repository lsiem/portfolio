# Phase 4: Signature Moment & Launch Hardening - Context

**Gathered:** 2026-07-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver **ONE identity-bound Signature-3D/WebGL-Moment in the hero** (WOW-01) — lazy-loaded after first paint, capability-gated, never in the initial bundle, architecturally removable at any time — and **verify every promise of the site on the production URL before launch**: mobile Lighthouse/CWV audit with the 3D moment active (launch verification of TECH-01), the 30-second stopwatch test, and the reduced-motion walkthrough (launch verification of MODE-01/MODE-02).

The Phase-3 seam is ready: `HeroSceneSlot` (`src/components/motion/hero-scene-slot.tsx`) is an empty, aria-hidden background layer (`absolute inset-0 -z-10`) behind the hero content — the canvas drops in with **no hero re-layout**.

**Also in scope (carried from Phase 3):** the deferred **production LCP re-check** — production currently measures ~2.5–2.9s LCP against the 2.5s budget, and the CI LCP assertion was downgraded to `warn` (2026-07-08) to unblock merges. Phase 4 restores this to green (see D-11).

**NOT in this phase:** any new content, sections, or capabilities; 3D anywhere outside the hero (see deferred).

</domain>

<decisions>
## Implementation Decisions

### Scene Concept (WOW-01 — the creative anchor)
- **D-01 (Concept):** **Multi-agent constellation** — a living node graph: agents/nodes connected by signal lines, quietly orchestrated. Conceptually bound to Lasse's *present* identity: Product Owner of ELIA, a multi-agent, MCP-based AI assistant. Reads as "systems that think together" and speaks the locked engineered/grid/signal-color language.
- **D-02 (Meaning):** **Abstract with hidden structure** — the graph's shape subtly derives from something real (e.g. the career graph or ELIA's agent topology), but carries **no labels, no legend**. Insiders might notice; everyone else sees a beautiful living system. Keeps the hero clean; avoids i18n in 3D.
- **D-03 (Material language):** **Precise points + hairlines** — small crisp dots, thin exact lines, occasional orange pulse traveling an edge; technical-drawing precision. Matches the engineered/tick/coordinate art direction, stays quiet behind text, and is the cheapest material to render (points/lines, no bloom/postprocessing required).
- **D-04 (Temporal behavior):** **Drift + message pulses** — nodes drift slowly in 3D; at irregular intervals an orange pulse travels along an edge like a message between agents. Event-driven activity IS the multi-agent metaphor. Not busy, never distracting.

### Scroll & Interaction
- **D-05 (Scroll behavior):** **Scroll-linked exit** — the constellation subtly parallaxes/recedes with scroll progress and dissolves as the hero leaves the viewport (the roadmap's "Scroll-Bridge", via the existing GSAP ScrollTrigger infrastructure). After exit the canvas **unmounts/pauses to free the GPU** — the rest of the visit is 3D-free.
- **D-06 (Pointer):** **Subtle pointer influence** — nodes near the cursor gently attract/illuminate; same "magnetic" language as the Phase-3 buttons. **Pointer-only, no-op on touch/keyboard** (consistent with Phase 3 D-11.1).
- **D-07 (Mobile):** **Capable phones included** — the gate decides by **measured capability** (GPU tier, device memory, data-saver, battery signals), not form factor. Flagship phones get a tuned-down constellation (fewer nodes, clamped DPR); mid/low-tier get none. The mobile Lighthouse audit (success criterion 3) must pass WITH the constellation active on capable devices.

### Presence & Intensity
- **D-08 (Prominence):** **Atmospheric layer** — clearly present and alive, but headline/value-prop remain the unambiguous focal point. Constellation occupies depth behind/around the text: denser toward the edges, sparser behind copy. Wow = noticing the system is real, not spectacle. Protects the 30-second test (WOW-04 discipline).
- **D-09 (Entrance):** **Boot-sequence extension** — the constellation assembles as the **final beat of the existing "system booting" hero intro** (nodes wake and connect cluster by cluster, the grid comes alive). If lazy-load completes after the intro already finished (slow network), it **fades in gracefully instead** — no double intro, no waiting.
- **D-10 (Fallback):** **Phase-3 hero as-is** — visitors without the 3D layer (weak devices, `prefers-reduced-motion`, WebGL failure/context-loss) get the complete engineered hero with **no substitute artwork**. The cleanest proof of "full experience without it": nothing is missing. Zero extra assets, zero extra LCP surface.

### Launch Verification & Hardening
- **D-11 (LCP = hard gate, optimize to green):** Phase 4 includes **explicit LCP optimization work** (hero render path, font loading, priority hints — research decides the levers). Launch check requires **LCP ≤ 2500ms on production mobile WITH the constellation active**, and the CI Lighthouse LCP assertion is **restored from `warn` to `error`** at phase end. This closes the Phase-3 deferral and honors TECH-01's original promise.
- **D-12 (Sequencing — harden first, then 3D):** First get production LCP green on the existing site (restores headroom + the CI error assertion), THEN build the constellation on the healthy baseline and verify it stays green. Clean attribution (any regression = the 3D), and if 3D were ever cut, launch hardening is already complete — matching "architektonisch jederzeit streichbar".
- **D-13 (Android device test — remote/emulated):** No physical mid-tier Android available. Use **Chrome DevTools CPU/GPU throttling + a real-device cloud (WebPageTest/BrowserStack or equivalent)** as the closest proxy for the "real mid-tier Android" criterion, and **document the proxy explicitly** in VERIFICATION.md.
- **D-14 (External testers — agent-assisted panel):** Browser-agent runs (Playwright / Antigravity browser agent) execute the scripted 30-second stopwatch test and the reduced-motion walkthrough on the production URL; the owner spot-checks the runs. The scripts + pass criteria live in the plan; results are recorded as launch verification evidence.

### Claude's Discretion
- Exact constellation geometry (node count per device tier, cluster layout, the "hidden structure" source data), drift speeds, pulse frequency — within D-01…D-04.
- Capability-gate implementation (which signals, thresholds) and device-tier boundaries — within D-07; research flag covers device-tiering.
- The LCP optimization levers (font strategy, preload hints, hero render path) — within D-11's hard target.
- R3F/three integration details: `next/dynamic` chunking, `frameloop` strategy, DPR clamp values, context-loss recovery — per STACK.md guidance + phase research (Draco/KTX2 likely unnecessary for points/lines — no meshes to compress; researcher confirms).
- Whether the scroll-exit unmounts or pauses the canvas (D-05) — whichever profiles better.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase goal, requirements, prior locked decisions
- `.planning/ROADMAP.md` — Phase 4 goal + 4 success criteria (signature moment on capable devices; lazy/never-initial-bundle + full experience without it incl. context-loss fallback; production mobile Lighthouse/CWV with 3D active + mid-tier Android; external-tester 30s test + reduced-motion walkthrough). Research flag: device-tiering, asset pipeline, context-loss handling.
- `.planning/REQUIREMENTS.md` — WOW-01 (the only open requirement); anti-features still bind (no unskippable intro, no autoplay sound, no forms).
- `.planning/phases/03-design-direction-immersive-experience/03-CONTEXT.md` — locked decisions this phase builds on: D-02 (palette locked), D-08 (GSAP single engine — the R3F canvas is a rendering layer, not a second animation engine for DOM), D-09 (Lenis, reduced-motion disabled), D-13 (the reserved hero seam this phase fills), D-17/D-18 (content from first paint; quiet variant), D-19 (mobile discipline).
- `.planning/phases/03-design-direction-immersive-experience/03-VERIFICATION.md` — the deferred production LCP re-check (measured ~2.5–2.9s) that D-11/D-12 resolve.

### Stack / architecture / pitfalls (verified research)
- `.planning/research/STACK.md` — 3D layer versions & rules: three ~0.185, @react-three/fiber ^9.6, drei ^10.7, React pinned `~19.2.0` (fiber peer `<19.3`); `next/dynamic` + lazy mount so 3D never blocks LCP; `frameloop="demand"` where possible; DPR clamp `[1, 1.5]`; "Heavy WebGL as LCP element" = forbidden.
- `.planning/research/PITFALLS.md` — CWV budget in CI; WebGL-as-LCP caution; reduced-motion semantics.
- `lighthouserc.json` — the CI budget file: LCP assertion currently `["warn", 2500]` — D-11 restores `"error"` at phase end; TBT 200ms / CLS 0.1 / script-size 184643 / perf-score 0.9 remain hard errors. **Note:** the 3D chunk must stay OUT of the initial script-size budget (lazy chunk).

### Project rules
- `AGENTS.md` — no runtime third-party calls (DSGVO); self-hosted everything; Antigravity browser agent is build-time only (relevant to D-14 agent-assisted testing — runs against production URL, adds nothing to the shipped site).

### Existing implementation (the seam + hero to harden)
- `src/components/motion/hero-scene-slot.tsx` — the empty reserved layer (Server Component, `absolute inset-0 -z-10`, aria-hidden) the canvas mounts into. Drop-in, no re-layout (Phase 3 D-13).
- `src/components/motion/motion-provider.tsx` — reduced-motion/touch gating context the capability gate should compose with (one gating story, not two).
- `src/components/motion/hero-intro.tsx` — the "system booting" intro timeline D-09 extends with the constellation's assembly beat.
- `src/app/[locale]/layout.tsx` + `src/app/globals.css` — fonts (LCP levers for D-11) and the locked color tokens the constellation reads (background/foreground/accent) for light+dark parity.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`HeroSceneSlot`**: purpose-built empty slot — Phase 4 swaps its children for the lazily-mounted canvas; positioning/z-index already correct.
- **`MotionProvider`** (reduced-motion + touch gating): the 3D capability gate should extend this existing gating layer — reduced-motion already means "no 3D" for free (D-10).
- **`hero-intro.tsx` GSAP timeline**: the boot sequence D-09 hooks into — add the constellation beat to the existing timeline rather than a parallel choreography.
- **ScrollTrigger infrastructure** (Phase 3): drives the D-05 scroll-linked exit; the "Scroll-Bridge" is a ScrollTrigger progress → scene uniform/opacity mapping.
- **CI/LHCI pipeline** (`lighthouserc.json`, parity workflow): already runs 3×/de+/en — D-11's restored error assertion slots in without new tooling.

### Established Patterns
- **Client boundaries around server content**: motion mounts client-side without breaking SSG — the canvas follows the same pattern (`next/dynamic`, `ssr: false`, mounted after first paint/idle).
- **Token-driven theming**: constellation colors must read the CSS custom properties (or their resolved values) so light/dark both look intentional — no hardcoded hex.
- **Single-engine discipline**: GSAP owns DOM motion; the R3F render loop owns only the canvas interior. The bridge (scroll progress, intro beat timing) flows one way from GSAP/ScrollTrigger into scene state.

### Integration Points
- **Canvas mount**: `next/dynamic` client component inside `HeroSceneSlot`'s layer; loaded on idle/after first paint; never in initial bundle (verify via bundle analysis + script-size budget).
- **Capability gate**: composes MotionProvider's reduced-motion/touch signals with GPU/memory/data-saver detection (D-07); gate result decides mount at runtime.
- **Context-loss handling**: `webglcontextlost` → fall back to D-10 (remove canvas, Phase-3 hero remains) — success criterion 2 explicitly requires this.
- **LCP hardening (D-12 first)**: hero fonts/render path in `layout.tsx`/`globals.css` — independent of all 3D work, lands before the canvas exists.

</code_context>

<specifics>
## Specific Ideas

- **The constellation is ELIA's world made visible**: agents passing messages — the owner's Product-Owner identity, not a generic particle background. The "hidden structure" (D-02) should derive from something genuinely his (career graph or agent topology), even though it's never labeled.
- **Discipline continues to be a feature**: atmospheric, not spectacle (D-08); the fast recruiter path stays sacred; edges denser, text areas sparser.
- **"Boot-up" is the narrative thread**: Phase 3's grid-draw + split-text intro gains its final act — the system comes alive (D-09).
- **Removability is a design requirement, not an afterthought**: harden-first sequencing (D-12) means the site is launch-ready even with the 3D deleted.

</specifics>

<deferred>
## Deferred Ideas

- **Persistent 3D companion** (constellation echo following into the career section / merging with the spine) — explicitly rejected for this phase (D-05 chose scroll-linked exit); a possible v2 evolution.
- **Readable/annotated constellation** (nodes labeled with skills/projects as 3D data-viz) — rejected for hero cleanliness (D-02); could inspire a future standalone "systems map" page.
- **Physical mid-tier Android acquisition** — if a real device becomes available later, re-run the D-13 proxy test on hardware and upgrade the verification evidence.
- **Sound design, terminal easter-egg, AI-chat** — unchanged: out of scope / v2 (REQUIREMENTS Out of Scope).
- **CSP hardening** — unchanged Phase-2 follow-up; the lazy 3D chunk is self-hosted, so a future `script-src 'self'` CSP stays viable.

</deferred>

---

*Phase: 4-Signature Moment & Launch Hardening*
*Context gathered: 2026-07-08*
