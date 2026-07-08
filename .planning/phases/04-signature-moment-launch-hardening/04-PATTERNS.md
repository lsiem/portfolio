# Phase 4: Signature Moment & Launch Hardening — Pattern Map

**Mapped:** 2026-07-08
**Files to create/modify:** 8
**Analogs:** Phase 3 motion layer + Phase 2 launch verification

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/motion/hero-scene-slot.tsx` (MODIFIED) | gate + lazy mount | browser signals → conditional chunk load | `src/components/motion/motion-provider.tsx` | exact (useSyncExternalStore + dynamic import) |
| `src/components/motion/hero-scene-canvas.tsx` | client canvas shell | WebGL render loop | NEW (no prior 3D) | — |
| `src/components/motion/hero-scene-topology.tsx` | 3D scene graph | ref read → GPU mutate | `src/components/motion/career-spine.tsx` (scroll-driven, ref-based) | partial |
| `src/components/motion/hero-scroll-bridge.tsx` | scroll writer | ScrollTrigger → ref | `src/components/motion/career-spine.tsx` | role-match |
| `src/lib/hero-scene-progress.ts` | shared ref store | write (GSAP) / read (R3F) | `src/lib/motion-tokens.ts` (module-scope reader) | role-match |
| `evals/hero-3d.spec.ts` | test contract | Playwright assertions | `evals/immersive.spec.ts` | exact structure |
| `package.json` (MODIFIED) | deps | build-time | Phase 03-01 package.json change | exact |
| `lighthouserc.json` (maybe MODIFIED) | CI budget | static config | `02-06-PLAN.md` | exact if budget adjustment needed |

## Pattern Assignments

### `hero-scene-slot.tsx` → `motion-provider.tsx`

Copy the **gate + lazy import** shape:

1. `useSyncExternalStore(subscribe3dGate, getCanMount3d, getServerSnapshot3d)` where server snapshot is always `false`.
2. `useEffect` that runs `import("./hero-scene-canvas")` only when gate is true, after `requestIdleCallback`.
3. **Stable tree:** when gate false, return the same empty `<div aria-hidden className="absolute inset-0 -z-10 pointer-events-none" />` as Phase 3 — zero visual regression.

**Do NOT** wrap children in a new layout element when gate flips — swap inner content only.

### `hero-scroll-bridge.tsx` → `career-spine.tsx`

`CareerSpine` already lazy-imports gsap + ScrollTrigger behind a desktop gate. Mirror:

- `useGSAP` or guarded `useEffect` with dynamic `import("gsap/ScrollTrigger")`
- `ScrollTrigger.create({ trigger: "#hero", ... onUpdate })`
- Write `heroSceneProgress.current = self.progress`
- Hold `invalidateRef` callback from child canvas via ref/imperative handle OR export a module-level `setInvalidate(fn)` setter called from canvas `onCreated`

### `hero-scene-topology.tsx` — R3F conventions

- `"use client"` first line
- `useFrame` mutates rotation from `heroSceneProgress.current` — **no setState**
- `useThree().invalidate()` after progress change (bridge calls it)
- `useMemo` for geometry; dispose on unmount
- Colors: read CSS variables once on mount via `getComputedStyle(document.documentElement).getPropertyValue('--border')` etc.

### `evals/hero-3d.spec.ts` → `immersive.spec.ts`

- Locale loop `["de", "en"]`
- `emulateMedia({ reducedMotion: 'reduce' })` → assert no `<canvas>` in `#hero`
- Default desktop → assert `<canvas>` present when gate mocked open (or skip canvas assert in CI mobile emulation — document that Lighthouse uses coarse pointer so CI won't mount 3D; test gate logic via `page.addInitScript` to force fine pointer + 4 cores)

### Launch verification → `02-07-PLAN.md`

- `checkpoint:human-verify gate="blocking"` for production walkthrough
- `04-UAT.md` output artifact (like `03-UAT.md`)

## Anti-Patterns (do not copy)

| Anti-pattern | Why |
|--------------|-----|
| Import `three` in `page.tsx` | Pulls WebGL into server graph |
| `ScrollControls` from drei | Second scroll authority |
| Spinner while 3D loads | WOW-04 violation |
| `dark:` Tailwind utilities in 3D materials | Token discipline — read CSS vars |
| `forceContextRestore()` loop | Unreliable; use D-25 degrade |

## Dependency Graph (plans)

```
04-01 (gate + lazy canvas shell)
  └── 04-02 (topology scene + scroll bridge)
        └── 04-03 (context loss + evals)
              └── 04-04 (production launch verification)
```
