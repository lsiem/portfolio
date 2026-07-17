# Phase 4: Signature Moment & Launch Hardening - Pattern Map

**Mapped:** 2026-07-08
**Files analyzed:** 13 new / 5 modified
**Analogs found:** 15 / 18 (3 files have no in-repo analog — RESEARCH.md Code Examples cover them)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/components/scene/hero-scene-gate.tsx` (new) | component (client gate) | event-driven (idle → async decision → mount) | `src/components/motion/motion-provider.tsx` | exact (gate + lazy-import lifecycle) |
| `src/lib/capability.ts` (new) | utility (pure decision pipeline) | request-response (signals → tier) | `src/lib/motion-tokens.ts` | role-match (browser-only lib module, SSR-guard conventions) |
| `src/components/scene/constellation-canvas.tsx` (new, lazy chunk entry) | component | streaming (RAF render loop) | `src/components/motion/hero-intro.tsx` | role-match (client enhancement over SSR markup) + RESEARCH Code Example 3 |
| `src/components/scene/constellation.tsx` (new) | component (scene interior) | streaming (useFrame per-frame mutation) | — (no R3F in repo) | none — use RESEARCH Code Example 4 |
| `src/components/scene/constellation-data.ts` (new) | utility (static graph data) | batch (computed once) | `src/lib/content.ts` | role-match (typed static data module) |
| `src/components/scene/scene-bridge.ts` (new) | utility (module-scope mutable singleton) | pub-sub (GSAP writes, useFrame reads) | `src/components/theme-toggle.tsx` (module-scope pub/sub) | role-match |
| `src/lib/theme-color-resolver.ts` (new) | utility | event-driven (MutationObserver/matchMedia) | `src/components/theme-toggle.tsx` | role-match (data-theme + theme-color conventions) |
| `src/components/motion/hero-scene-slot.tsx` (modified) | component (Server) | request-response (SSG) | itself — children swap only | exact |
| `src/components/motion/hero-intro.tsx` (modified: boot-beat handshake) | component | event-driven (GSAP timeline) | itself | exact |
| Scroll-exit bridge (in scene files) | behavior | event-driven (ScrollTrigger progress) | `src/components/motion/career-spine.tsx` (ScrollTrigger) + `reveal.tsx` (IntersectionObserver touch fallback, Pitfall 8) | exact |
| `src/app/[locale]/layout.tsx` (modified: font strategy, D-11) | config | request-response | itself (Bricolage block, lines 45–67) | exact |
| `src/app/globals.css` (modified if tokens added) | config | — | itself (hex tokens lines 4–15, 69–84) | exact |
| `public/benchmarks/` copy step (new prebuild step) | config/build | file-I/O | `package.json` `prebuild` (`check:content` + `generate:cv`) | exact |
| `lighthouserc.json` (modified: warn→error; possibly second config) | config | — | itself | exact |
| `evals/launch/stopwatch.spec.ts` (new) | test | request-response | `evals/immersive.spec.ts` | exact |
| `evals/launch/reduced-motion.spec.ts` (new) | test | request-response | `evals/immersive.spec.ts` (emulateMedia reducedMotion) | exact |
| SceneErrorBoundary (in `hero-scene-gate.tsx`) | component (class ErrorBoundary) | request-response | — (none in repo) | none — ~20-line standard class per RESEARCH |
| `?webgl=` override handling | utility (in `capability.ts`) | request-response | — | none — RESEARCH Code Example 1 |

## Pattern Assignments

### `src/components/scene/hero-scene-gate.tsx` (client gate, event-driven)

**Analog:** `src/components/motion/motion-provider.tsx`

**Gate via `useSyncExternalStore` — MANDATORY repo convention** (lines 13–40). The repo's React-Compiler lint **hard-errors on setState-in-effect for media state**; mirror this shape verbatim for any reduced-motion signal:
```tsx
function subscribeMotionGates(callback: () => void): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  reduced.addEventListener("change", callback);
  return () => reduced.removeEventListener("change", callback);
}
function getServerSnapshot(): boolean {
  return false; // stable motion-off SSR default — hydration never mismatches
}
```
**CAUTION (RESEARCH Pitfall 7):** do NOT copy the `pointer: fine` half of this gate — the 3D gate must allow touch. Only reduced-motion composes.

Note: the gate's *async* tier decision (idle → detect-gpu) is `useEffect` + `setState`, which IS allowed — the lint convention targets synchronous media-query reads; MotionProvider itself sets state-like refs in effects for async work.

**Lazy-import lifecycle with cancellation** (motion-provider.tsx lines 66–118) — the exact copy target for the gate's effect body:
```tsx
useEffect(() => {
  if (!motionEnabled) return;
  let cancelled = false;
  let teardown: (() => void) | undefined;
  void (async () => {
    const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
      import("lenis"), import("gsap"), import("gsap/ScrollTrigger"),
    ]);
    if (cancelled) return;
    // ...setup...
    teardown = () => { /* ... */ };
  })();
  return () => { cancelled = true; teardown?.(); };
}, [motionEnabled]);
```
Apply the same `cancelled` flag around `decideSceneTier()` and the `import("detect-gpu")` boundary (keeps detect-gpu out of the eager bundle, mirroring the gsap discipline documented at lines 52–57: "keeping the eager per-route bundle under the 184,643-byte gate").

**Structural stability** (motion-provider.tsx lines 42–58 doc comment + line 121): the component returns children/null at a stable tree position; enhancement attaches as a side effect. The gate returns `null` until tier resolves (D-10: nothing missing).

**`next/dynamic` + ErrorBoundary:** no in-repo analog — use RESEARCH Code Example 2 (`dynamic(() => import("./constellation-canvas"), { ssr: false })` inside this client component; `ssr:false` errors in Server Components).

---

### `src/lib/capability.ts` (utility, pure pipeline)

**Analog:** `src/lib/motion-tokens.ts` (structure + SSR discipline), logic from RESEARCH Code Example 1.

**SSR-safety convention** (motion-tokens.ts lines 1–17 doc comment):
```
BROWSER-ONLY utility — never import from a Server Component. ...
guards `typeof window === "undefined"` as its FIRST statement ...
Never call it as a component default-PARAMETER value (default params
execute during SSR render even in client components) — read INSIDE effect bodies.
```
Copy this header discipline: exported `decideSceneTier()` is called only inside the gate's effect. Use string-literal union types like motion-tokens' token unions (`type SceneTier = "none" | "mobile" | "desktop"`).

---

### `src/components/scene/scene-bridge.ts` (module-scope mutable singleton, pub-sub)

**Analog:** `src/components/theme-toggle.tsx` lines 21–26 — the repo's sanctioned module-scope-state pattern:
```tsx
// Module-scope pub/sub so `applyTheme` (an imperative DOM/localStorage
// mutation, not React state) can notify the subscribed component ...
// Kept at module scope (outside the component) so the mutation is a plain
// synchronous side effect, not part of the render closure.
const listeners = new Set<() => void>();
```
The bridge is even simpler (no listeners — `useFrame` polls each frame). Shape per RESEARCH Pattern 3 (`scrollProgress`, `introBeatAt`, `pointer`, `paused`).

---

### `src/lib/theme-color-resolver.ts` (utility, event-driven)

**Analog:** `src/components/theme-toggle.tsx`

**Theme mechanics to reuse** (lines 63–73): the theme lives on `document.documentElement.dataset.theme` (`data-theme` attribute) — that's what the MutationObserver watches; `"system"` removes the attribute, so also listen to `matchMedia("(prefers-color-scheme: dark)")`.

**Token source** (`src/app/globals.css` lines 4–7 / 69–72): plain hex — `--accent: #c2410c` (light) / `#fb923c` (dark), `--background: #fafaf9`/`#0a0a0a`, `--foreground: #1c1917`/`#ededed`. `new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue("--accent").trim())` works directly (no oklch parsing). No hardcoded hex in scene code — token-driven theming is an established pattern (04-CONTEXT code_context).

---

### `src/components/scene/constellation-canvas.tsx` + `constellation.tsx`

**No R3F analog exists in the repo.** Copy RESEARCH Code Examples 3 (Canvas config: `frameloop={running ? "always" : "never"}`, `dpr={tier === "mobile" ? [1, 1.25] : [1, 1.5]}`, `webglcontextlost` → `setLost(true)` → return null) and 4 (useFrame delta-based mutation, no React state per frame).

**Repo conventions that still apply:**
- Header doc-comment style with decision references (`(D-05)`, `(RESEARCH Pitfall N)`) — every motion file does this (see hero-intro.tsx lines 34–56).
- `"use client"` line 1; `import type` for type-only imports.
- Motion timing values: read via `getMotionToken()` (`src/lib/motion-tokens.ts`) inside effect/frame bodies where DOM-side timing is shared.

---

### `src/components/motion/hero-intro.tsx` (modify: D-09 boot-beat handshake)

**Analog:** itself. The timeline construction (lines 99–134) is where the handshake lands:
```tsx
ctx = gsap.context(() => {
  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  // 0-400ms grid draw ... 200-900ms H1 words ... 500-1000ms value-prop
}, root);
```
Add `sceneBridge.introBeatAt = performance.now()` in the timeline's `onComplete` (RESEARCH Pattern 4). Preserve the invariants documented in lines 40–44: hero text opacity stays 1 (transform-only reveals), reduced-motion/touch → timeline never runs. Also note lines 93–97: `await document.fonts.ready` before splitting (font-metric timing) — the boot beat inherits this timing.

---

### Scroll-exit bridge (D-05, inside scene files)

**Analog A (motion stack up, desktop):** `src/components/motion/career-spine.tsx` lines 81–105 — the repo's canonical lazy ScrollTrigger progress scrub:
```tsx
const [{ gsap }, { ScrollTrigger }] = await Promise.all([
  import("gsap"), import("gsap/ScrollTrigger"),
]);
if (cancelled) return;
gsap.registerPlugin(ScrollTrigger);
const trigger = ScrollTrigger.create({
  trigger: `#${targetId}`,
  start: "top center",
  end: "bottom center",
  onUpdate: (self) => { gsap.set(fill, { scaleY: self.progress }); },
});
cleanup = () => trigger.kill();
```
For the scene: `onUpdate` writes `sceneBridge.scrollProgress = self.progress` instead of touching DOM.

**Analog B (touch — Pitfall 8, ScrollTrigger absent):** `src/components/motion/reveal.tsx` lines 78+ — the repo's IntersectionObserver precedent (used precisely to avoid loading gsap on touch/Lighthouse paths). On capable phones compute progress from a passive scroll listener / IntersectionObserver and write the same `sceneBridge.scrollProgress`. reveal.tsx's gate (lines 11–19) also demonstrates gating on reduced-motion ONLY, not pointer — the exact gate split the 3D layer needs.

---

### `src/app/[locale]/layout.tsx` (modify: D-11 font levers)

**Analog:** itself, lines 45–67 — the block to replace, with its measurement history:
```tsx
// Display face (D-03) — Bricolage Grotesque, self-hosted at build by next/font
// ... static woff2, ~22KB ... preload:false, swap ...
// adding this second render-path font adds a fixed ~300ms ... pushes the
// LOCAL simulated LCP to ~2.75s ...
const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  ...
  preload: false,
});
```
D-11 lever: swap `Bricolage_Grotesque` from `next/font/google` to `next/font/local` with a hand-subsetted woff2 + `preload: true` (RESEARCH Pitfall 5). Keep the `variable: "--font-bricolage"` name — it maps to Tailwind's `font-display` utility via `@theme` in globals.css. Preserve the doc-comment-with-measurements style when changing this block. MotionProvider (lines 101–105) depends on `document.fonts.ready` + `ScrollTrigger.refresh()` — font-strategy changes keep that contract intact.

---

### `public/benchmarks/` copy step (detect-gpu self-hosting, Pitfall 2)

**Analog:** `package.json` `prebuild` chain:
```json
"prebuild": "pnpm check:content && pnpm generate:cv",
```
Append a copy step (script in `scripts/`, TS via `tsx` like `generate-cv.tsx`, or a plain `cp -r node_modules/detect-gpu/dist/benchmarks public/benchmarks`). RESEARCH explicitly names this "the CV-PDF prebuild pattern".

---

### `lighthouserc.json` (modify: D-11 assertion restore)

**Analog:** itself:
```json
"largest-contentful-paint": ["warn", { "maxNumericValue": 2500 }],
```
→ `"error"` at phase end. All other assertions unchanged (TBT 200 / CLS 0.1 / script:size 184643 / perf 0.9). If a second `?webgl=force` audit is added (RESEARCH Open Question 1), it is a **separate config file/run** — LHCI assertions are global per config (Assumption A5).

---

### `evals/launch/stopwatch.spec.ts` + `reduced-motion.spec.ts` (tests)

**Analog:** `evals/immersive.spec.ts`

**Structure** (lines 1–35): imports from `@playwright/test` + typed content from `../src/lib/content`; locale loop:
```ts
const locales = ["de", "en"] as const;
for (const locale of locales) {
  test.describe(`Immersive hero (/${locale})`, () => {
    test("hero H1 renders in the Bricolage display face (D-03)", async ({ page }) => {
      await page.goto(`/${locale}`);
      const h1 = page.locator("#hero h1");
      await expect(h1).toBeVisible();
      ...
```
**Reduced-motion emulation** (lines 98, 185, 232, …): `await page.emulateMedia({ reducedMotion: "reduce" });` — existing per-test pattern; alternatively `test.use({ reducedMotion: "reduce" })` per RESEARCH Code Example 6. New: launch specs target the production URL (`baseURL: "https://lsiem.de"`) — RESEARCH Code Example 6.

**Selectors already established:** `#hero`, `#hero h1`, `[data-testid="hero-value-prop"]`, `#hero nav a[href="#career"]` — reuse for the 30-second stopwatch assertions. New assertion for D-10: `await expect(page.locator("canvas")).toHaveCount(0)` under reduced-motion.

---

## Shared Patterns

### 1. `useSyncExternalStore` media/browser-state gate (repo-wide hard convention)
**Source:** `src/components/theme-toggle.tsx` (origin), mirrored in `motion-provider.tsx`, `hero-intro.tsx`, `reveal.tsx`
**Apply to:** any synchronous media-query/browser-state read in `hero-scene-gate.tsx`
`subscribe*` + `get*Snapshot` + `getServerSnapshot() => false/neutral`. setState-in-effect for these signals hard-errors under the repo's React-Compiler lint (see motion-provider.tsx lines 6–11, RESEARCH Pitfall 6).

### 2. Lazy dynamic-import with `cancelled` flag + teardown
**Source:** `motion-provider.tsx` lines 66–118, `hero-intro.tsx` lines 70–142, `career-spine.tsx` lines 81–105
**Apply to:** gate effect, detect-gpu import, ScrollTrigger bridge setup
Every heavy import goes through `void (async () => { ... await import(...); if (cancelled) return; ...})()` with cleanup returning `cancelled = true; teardown?.()`. This is THE bundle-discipline mechanism keeping the eager route under the 184,643-byte LHCI gate.

### 3. Decision-referencing doc comments
**Source:** every file in `src/components/motion/`
**Apply to:** all new scene files
Block comment atop each component explaining its contract with `(D-NN)` / `(RESEARCH Pitfall N)` / `(finding #N)` references. The "streichbar" requirement makes this documentation load-bearing for Phase 4.

### 4. Token-driven values, no hardcoded constants
**Source:** `src/lib/motion-tokens.ts` (motion), `globals.css` hex tokens (color), `theme-toggle.tsx` LIGHT/DARK_THEME_COLOR mirrors
**Apply to:** constellation colors (via `theme-color-resolver.ts`), any DOM-side timing (via `getMotionToken`)

### 5. Reduced-motion = SSR-final-state, structural stability
**Source:** `motion-provider.tsx` (lines 42–50), `reveal.tsx` (lines 38–40), `hero-intro.tsx` (lines 40–44)
**Apply to:** gate returning `null` (D-10), canvas unmount on context loss
Gated enhancements never change the children tree position; disabled = SSR output untouched.

## No Analog Found

Files/pieces with no close in-repo match (planner uses RESEARCH.md patterns instead):

| File/Piece | Role | Data Flow | Reason | RESEARCH Source |
|------|------|-----------|--------|-----------------|
| `constellation.tsx` scene interior (useFrame, BufferGeometry) | component | streaming | No three/R3F code exists yet | Code Example 4, Pattern 3, Anti-Patterns |
| SceneErrorBoundary | component | — | No class ErrorBoundary in repo | ~20-line standard class (Deliberately-NOT-added table) |
| `?webgl=` override + detect-gpu pipeline | utility | request-response | New capability domain | Code Example 1, Pattern 8 |

## Metadata

**Analog search scope:** `src/components/`, `src/components/motion/`, `src/lib/`, `src/app/`, `evals/`, `scripts/`, root configs (`lighthouserc.json`, `package.json`)
**Files scanned:** ~25 (8 read in depth)
**Pattern extraction date:** 2026-07-08
