# Phase 3: Design Direction & Immersive Experience - Research

**Researched:** 2026-07-05
**Domain:** GSAP + Lenis scroll-storytelling integration in a Next.js 16 App Router / React 19 all-static site; motion-token architecture; reduced-motion & mobile discipline
**Confidence:** HIGH (integration patterns, package versions, SplitText/matchMedia APIs — verified against official GSAP docs + npm registry) / MEDIUM (bundle-size and page-transition specifics — community sources, not GreenSock-official)

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01 (Direction):** Engineered / systems art direction — mono-forward, grid & console motifs, precise structural lines, coordinate/tick annotations. Accent is a signal color, not decoration.
- **D-02 (Palette — LOCKED, unchanged):** Keep the exact live palette — warm-stone neutrals + single orange accent. No re-theming.
- **D-03 (Typography — add a display face):** Keep Geist Sans/Mono; add ONE self-hosted `next/font` "technical grotesque" display face for headlines. No Google Fonts *runtime* call.
- **D-04 (Layout — widen to structural grid):** Break out to a gridded, wider layout with margin columns and asymmetric placement (hero + career especially); reading column stays anchored.
- **D-05 (Mechanic):** Progressive reveal timeline on native scroll — chapters/roles reveal on enter, no pinning, no scrolljacking.
- **D-06 (ITSC arc = hero sub-scene):** The ITSC role arc (SysAdmin→SWE→PO) is the narrative centerpiece — multi-beat sub-sequence; other orgs get lighter single reveals.
- **D-07 (Persistent device):** A vertical progress spine rail with scroll-progress indicator + tick/coordinate labels (year markers + chapter index, mono).
- **D-08 (Single engine — LOCKED):** GSAP + `@gsap/react` (`useGSAP`) is the ONE animation engine, with central motion tokens (durations/easings/distances) as the single source of truth. No second engine.
- **D-09 (Smooth scroll):** Lenis smooth (lerped) scroll enabled, synced to GSAP ScrollTrigger via `gsap.ticker`. MUST be disabled under `prefers-reduced-motion` and tuned for mobile.
- **D-10 (Intensity):** Medium / expressive — noticeably animated but disciplined.
- **D-11 (Signature micro-interactions — all four committed):** (1) Magnetic buttons/links, pointer-only; (2) Split-text headline reveals (GSAP SplitText, real DOM text underneath); (3) Designed hover/focus/active states; (4) Seamless section/sub-route transitions.
- **D-12 (Hero treatment):** Engineered intro sequence — grid lines draw in, display headline split-text reveals, mono value-prop reveals. All motion runs AFTER first paint; name/role/value-prop are static SSR HTML (LCP-safe, WOW-04).
- **D-13 (Phase-4 3D seam):** Reserve a dedicated, empty background/behind-content layer slot in the hero — Phase 4 fills it with a lazy capability-gated 3D canvas. No hero re-layout later.
- **D-14 (Projects composition):** Featured hierarchy / bento — ELIA (flagship) + Vidama (deep) are the large featured pair; rest stay compact.
- **D-15 (Case-study detail pages):** Engineered but reading-first — inherit art direction, motion supports comprehension, does not perform.
- **D-16 (Profile photo):** Design the signature engineered-framing treatment now; actual image slots in later, non-blocking.
- **D-17 (Skip model — layered enhancement, no toggle):** Page IS the same accessible content from first paint; motion is pure enhancement. No preloader, no mode switch.
- **D-18 (Reduced-motion quiet variant — MODE-02 — same DOM, motion stripped):** One implementation. `prefers-reduced-motion` disables Lenis + GSAP timelines; reveals become instant/opacity-only; content fully present.
- **D-19 (Mobile — TECH-02 — same story, tuned for touch):** Grid collapses to a focused single column; reveal timeline stays (touch-safe); magnetic effects disabled on touch; Lenis/motion re-tuned for mobile. No scrolljacking.

### Claude's Discretion (resolved by 03-UI-SPEC.md — treat as locked for planning)

- Specific display typeface within "technical grotesque" → **Bricolage Grotesque** (next/font/google, variable weight/width/optical-size axes).
- Motion-token values (durations/easings/stagger) → fixed table in UI-SPEC §"Motion Tokens & Choreography".
- Seamless-transition technique → **GSAP-orchestrated crossfade**, NOT the View Transitions API (keeps single-engine discipline).
- Lenis↔ScrollTrigger sync details + mobile tuning thresholds → `pointer: fine` gates Lenis entirely; `pointer: coarse` = native scroll, ScrollTrigger reveals unaffected.
- Spine/coordinate-readout visual design + bento breakpoints → fixed in UI-SPEC.
- Reserved 3D layer implementation → **slot component** `<HeroSceneSlot />` (empty, `aria-hidden`, `absolute inset-0 -z-10 pointer-events-none`), not a raw canvas.

### Deferred Ideas (OUT OF SCOPE)

- Signature 3D/WebGL hero moment (WOW-01) → Phase 4. Phase 3 only reserves the `<HeroSceneSlot />` seam.
- Actual profile-photo image asset → owner-supplied, non-blocking.
- Two-column CV polish → possible later refinement.
- Sound design, terminal easter-egg, AI-chat → out of scope / v2.
- CSP hardening → tracked Phase 2 follow-up, unchanged by this phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WOW-02 | Besucher erlebt den Werdegang als Scroll-Storytelling-Reise (scroll-verknüpfte Szenen pro Karriere-Kapitel) | §Architecture Patterns "Progressive-reveal scene architecture"; §Code Examples "Reveal-on-enter primitive"; ITSC multi-beat pattern (`--motion-duration-chapter`, `--motion-distance-lg`) |
| WOW-03 | Craft durch Micro-Interactions + nahtlose Übergänge, eine Engine + zentrale Motion-Tokens | §Architecture Patterns "Motion token single-source-of-truth"; "Magnetic button (contextSafe)"; "GSAP-orchestrated crossfade transition"; §Don't Hand-Roll |
| WOW-04 | Jede immersive Sequenz überspringbar; Identität + Overview ab First Paint; kein unskippbarer Preloader | §Architecture Patterns "First-paint / skippability contract"; §Common Pitfalls "Hydration ceiling" |
| MODE-02 | `prefers-reduced-motion` → vollwertige ruhige Variante, geteilte Implementierung mit Overview-Mode | §Architecture Patterns "Reduced-motion is the Overview mode — literally"; `gsap.matchMedia` pattern |
| TECH-02 | Mobile-Besucher bekommt bewusst gestaltetes Erlebnis, kein Scrolljacking | §Architecture Patterns "Mobile motion gate (pointer: coarse)"; `gsap.matchMedia` compound queries |
</phase_requirements>

## Summary

This phase adds a motion layer to a page that does not currently have one: `src/app/[locale]/page.tsx` is 100% server-rendered static HTML today (zero client JS beyond the header's `ThemeToggle`/`LocaleSwitcher` and the `GitHubHeatmap`). There is no separate "Overview mode" route — the single-scroll page **is** the recruiter overview (Phase 2 CTX-01). This has a direct, load-bearing consequence for MODE-02: the reduced-motion "quiet variant" this phase must ship is not a second implementation to build — **it is what the page already is today**, with a GSAP/Lenis motion layer conditionally layered on top only when `prefers-reduced-motion: no-preference` is true. Get the conditional-mount gate right and MODE-02 is satisfied almost for free; get it wrong (e.g. building two component trees) and the phase doubles its own surface area against its own locked decision (D-18).

The verified integration recipe for GSAP 3.15 + Lenis 1.3.25 + `@gsap/react` 2.1.2 is a well-established, GreenSock-endorsed pattern: mount a single client-boundary `<ReactLenis root autoRaf={false}>` near the root of `[locale]/layout.tsx`, feed `lenis.raf()` into `gsap.ticker`, call `gsap.ticker.lagSmoothing(0)`, and sync `ScrollTrigger.update` to Lenis's `scroll` event. Every scroll-linked reveal then goes through `useGSAP()` (never manual `useEffect` + `gsap.to`), which gets automatic `gsap.context().revert()` cleanup and React-Compiler-safe lifecycle behavior. Responsive/accessibility branching (mobile touch gate, reduced-motion gate) uses `gsap.matchMedia()` — not the now-deprecated `ScrollTrigger.matchMedia()`. SplitText v3.13+ ships built-in `aria-label`/`aria-hidden` accessibility by default, which directly satisfies D-11.2's "real DOM text must render underneath" requirement without extra work — but has a documented trap (nested interactive elements inside a split heading become inert) that must be avoided by construction (never split a heading that contains a link).

The one open risk worth flagging early: this repo's project convention (established in `ThemeToggle`, driven by `eslint-plugin-react-hooks`'s React-Compiler-aligned rules) forbids `useState` + `useEffect` for reading browser-only state — it must go through `useSyncExternalStore`. The Motion Provider's reduced-motion/pointer-type detection must follow that exact pattern (already proven in this codebase) to avoid a lint failure that previously required a rewrite in Phase 2.

**Primary recommendation:** Build one `<MotionProvider>` client component mounted once in `[locale]/layout.tsx` that (a) reads `prefers-reduced-motion` and `pointer: fine` via `useSyncExternalStore` (matching the existing `ThemeToggle` convention, not `useEffect`+`setState`), (b) conditionally instantiates Lenis + registers the GSAP ticker sync only when both gates allow it, and (c) exposes nothing to children beyond side effects — every reveal/magnetic/spine component then just calls `useGSAP()` + `gsap.matchMedia()` locally and trusts the provider has already wired the ticker.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Static content (hero copy, career/project/skills data, About, contact) | Browser / Client (SSR HTML, zero JS) | — | Already fully server-rendered via `getCareer`/`getProjects`/etc. content-model loaders; Phase 3 does not touch data fetching, only presentation/motion layered on top (WOW-04: content must never be motion-gated) |
| Scroll-linked reveal timelines (career chapters, bento stagger, spine fill) | Browser / Client (GSAP + `useGSAP`, client component wrapping server-rendered markup) | — | Requires `IntersectionObserver`/scroll-position reads and DOM mutation — inherently client-only; server continues to own the underlying markup/data |
| Smooth scroll (Lenis) | Browser / Client (single provider, root-mounted) | — | Wraps native scroll; must be a singleton to avoid double-RAF loops; conditionally absent per D-09/D-19 |
| Motion tokens (durations/easings/distances) | CDN / Static (CSS custom properties, shipped in the static CSS bundle) | Browser / Client (read once via `getComputedStyle` for GSAP's numeric API) | Tokens are static values baked into the build's CSS — no server logic needed; the client-side GSAP layer reads them, it does not own them (avoids the two-source-of-truth risk the UI-SPEC calls out) |
| Reduced-motion / mobile gating | Browser / Client (`matchMedia`, `useSyncExternalStore`) | — | OS/viewport-level signal, only observable client-side; no SSR equivalent exists (server always renders the enhanced-but-inert base state) |
| Display font (Bricolage Grotesque) self-hosting | CDN / Static (fetched once at build time by `next/font/google`, emitted as static font files) | — | `next/font` performs the Google Fonts fetch during `next build`, not at request time — zero runtime third-party call (AGENTS.md DSGVO rule), matches the existing Geist Sans/Mono pattern already in `layout.tsx` |
| Reserved 3D seam (`<HeroSceneSlot />`) | Browser / Client boundary reserved, but Server Component in Phase 3 | — | Phase 3 ships an empty, `aria-hidden`, non-interactive div — no client JS needed until Phase 4 fills it with a lazy `<Canvas>`; keeping it a Server Component now avoids shipping unnecessary client bytes early |
| Career/project/case-study content (data) | Database / Storage-equivalent (git-based content model, `content/{de,en}/*`) | — | Unchanged by this phase — Phase 3 is presentation only, per CONTEXT.md "code_context" |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `gsap` | 3.15.0 [VERIFIED: npm registry, published 2026-04-13, 3.53M weekly downloads] | Single animation engine — timelines, ScrollTrigger, SplitText | 100% free since April 2025 (all former Club plugins included); D-08 locks this as the ONLY engine |
| `@gsap/react` | 2.1.2 [VERIFIED: npm registry, peer `gsap: ^3.12.5`, `react: >=17`] | `useGSAP()` hook — scoped, auto-cleanup GSAP lifecycle for React | Official GreenSock React integration; StrictMode-safe via `gsap.context().revert()` on unmount [CITED: gsap.com/resources/React] |
| `lenis` | 1.3.25 [VERIFIED: npm registry, package created 2022-03/first published to npm 2023-04, 111 published versions, 872K weekly downloads] | Smooth (lerped) scroll wrapping native scroll | Preserves `position: sticky`, anchors, keyboard nav — D-09 locked choice; `lenis/react` subpath ships `ReactLenis` + `useLenis` [CITED: github.com/darkroomengineering/lenis packages/react] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `gsap/ScrollTrigger` (bundled in `gsap`) | 3.15.0 | Scroll-position-driven triggers | Every reveal-on-enter, spine progress fill, chapter beat |
| `gsap/SplitText` (bundled in `gsap`, free since v3.13) | 3.15.0 | Char/word/line text splitting for headline reveals | D-11.2 split-text reveals; ships built-in `aria-label`/`aria-hidden` accessibility [CITED: gsap.com/resources/a11y] |
| `next/font/google` — `Bricolage_Grotesque` | via installed `next` 16.2.10 | Self-hosted display face | D-03; same build-time-fetch pattern the codebase already uses for Geist Sans/Mono [ASSUMED: exact `axes: ['opsz','wdth']` config verified via community search, not GreenSock/Next official page — confirm the font renders correctly in `pnpm build` output] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GSAP-orchestrated crossfade (D-11.4 resolved) | View Transitions API (`next/navigation` experimental) | Rejected in UI-SPEC: second transition primitive contradicts D-08 single-engine discipline; React's View Transition support is still experimental for this all-static site |
| `lenis/react`'s `<ReactLenis>` wrapper | Hand-rolled `useEffect` calling `new Lenis()` directly | `ReactLenis` already handles instance lifecycle/cleanup and exposes `useLenis()` for cross-component reads; hand-rolling reintroduces the exact cleanup bugs `useGSAP`/framework wrappers exist to prevent |
| `gsap.matchMedia()` | `ScrollTrigger.matchMedia()` | **Do not use** — GSAP docs mark `ScrollTrigger.matchMedia()` **[DEPRECATED]** [CITED: gsap.com/docs/v3/Plugins/ScrollTrigger]; `gsap.matchMedia()` is the current, actively documented API and is what the a11y guide itself uses |

**Installation:**
```bash
pnpm add gsap @gsap/react lenis
```

**Version verification (2026-07-05, npm registry):**
- `gsap@3.15.0` — verified current, license "Standard 'no charge' license"
- `@gsap/react@2.1.2` — verified current
- `lenis@1.3.25` — verified current; package itself is 3+ years old (npm `time.created`: 2023-04-03) despite the latest patch being 3 weeks old — see Package Legitimacy Audit note below

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| `gsap` | npm | package created well before 2023; latest publish 2026-04-13 | 3.53M/wk | github.com/greensock/GSAP | OK | Approved |
| `@gsap/react` | npm | latest publish 2025-01-15 | 993K/wk | github.com/greensock/react | OK | Approved |
| `lenis` | npm | **flagged by the automated seam as "too-new"** — but `npm view lenis time.created` = 2023-04-03, 111 total published versions, 872K/wk downloads, official `darkroomengineering` repo (the same lineage cited in the project's own `.claude/CLAUDE.md` STACK research) | 872K/wk | github.com/darkroomengineering/lenis | SUS → **false-positive, see note** | Flagged — planner must add `checkpoint:human-verify` per protocol, but the underlying signal (frequent recent patch releases, not package age) does not indicate real risk |

**Packages removed due to [SLOP] verdict:** none.
**Packages flagged as suspicious [SUS]:** `lenis` — the `package-legitimacy` seam's "too-new" heuristic reads the *latest version's* publish timestamp (2026-06-26, ~10 days before this research), not the package's actual registry age. `npm view lenis time.created` confirms the package has existed since 2023-04-03 with 111 published versions — a healthy, actively-maintained release cadence, not a slopsquat signal. **Still gate the install behind a `checkpoint:human-verify` task per protocol** (the human should glance at `github.com/darkroomengineering/lenis` and confirm the maintainer/org before `pnpm add`), but the planner should not treat this as a real risk signal — it is a heuristic limitation, not a finding.

*`next/font/google`'s `Bricolage_Grotesque` export is not an npm package (it's a named export resolved from Next's own Google Fonts metadata at build time) — package-legitimacy does not apply; the font's existence in the Google Fonts catalog is `[CITED: fonts.google.com/specimen/Bricolage+Grotesque]` per the UI-SPEC, not independently re-verified in this research pass.*

## Architecture Patterns

### System Architecture Diagram

```
Request (SSG, build time — no request-time work changes)
   │
   ▼
[locale]/layout.tsx  (Server Component)
   │  renders <html>, header, footer — UNCHANGED structurally
   │  adds: Bricolage_Grotesque next/font variable (D-03)
   ▼
<MotionProvider>  (NEW — "use client", mounted once, root-level)
   │  useSyncExternalStore → prefersReducedMotion, isPointerFine  (mirrors ThemeToggle pattern)
   │  useEffect (no setState) → IF (no-preference AND pointer:fine):
   │        mount <ReactLenis root autoRaf={false}> → gsap.ticker.add(lenis.raf)
   │        ELSE: render children directly, native scroll, no Lenis instance
   ▼
{children}  →  [locale]/page.tsx  (Server Component, UNCHANGED data-fetching)
   │  static SSR HTML: hero name/role/value-prop, career list, projects, skills, about, contact
   │  each section wrapped by a thin client "Reveal" boundary (NEW) that:
   │      - reads gsap.matchMedia("(prefers-reduced-motion: no-preference)")
   │      - if match: useGSAP() timeline (ScrollTrigger reveal-on-enter)
   │      - if no match: renders children at final opacity/position, no timeline created
   ▼
Visible output: identical DOM/content in both branches (D-18) — only the animation
   layer differs. First paint always shows the SSR HTML before any client JS runs
   (WOW-04) — MotionProvider and Reveal boundaries only ADD motion after hydration,
   never gate content behind it.
```

### Recommended Project Structure

```
src/
├── app/[locale]/
│   ├── layout.tsx                 # adds Bricolage_Grotesque font + <MotionProvider> wrap
│   └── page.tsx                   # unchanged data-fetching; sections gain Reveal wrappers
├── components/
│   ├── motion/
│   │   ├── motion-provider.tsx    # NEW — Lenis + gsap.ticker sync, matchMedia gates
│   │   ├── reveal.tsx             # NEW — generic reveal-on-enter wrapper (useGSAP + ScrollTrigger)
│   │   ├── split-heading.tsx      # NEW — SplitText headline wrapper (never wraps a link)
│   │   ├── magnetic.tsx           # NEW — pointer-only magnetic pull wrapper (contextSafe)
│   │   ├── career-spine.tsx       # NEW — progress rail + tick marks (lg: and up only)
│   │   ├── hero-scene-slot.tsx    # NEW — empty reserved layer for Phase 4 (Server Component)
│   │   └── transition-link.tsx    # NEW — GSAP crossfade wrapper around next-intl's <Link>
│   ├── theme-toggle.tsx           # existing — useSyncExternalStore reference pattern
│   └── github-heatmap.tsx         # existing, unchanged
└── lib/
    └── motion-tokens.ts           # NEW — reads --motion-* CSS custom properties once, converts to GSAP-friendly seconds/px numbers (single source of truth stays in globals.css)
```

### Pattern 1: Motion Provider — the Lenis↔GSAP ticker sync (D-09)

**What:** One root-mounted client component that owns the Lenis instance (if any) and the `gsap.ticker` wiring.
**When to use:** Exactly once, near the root of `[locale]/layout.tsx`, wrapping `{children}`.
**Example:**
```tsx
// Source: pattern verified against darkroomengineering/lenis packages/react
// README + GSAP official React resources (gsap.com/resources/React) — synthesized,
// not a single copy-pasted snippet.
"use client";

import { useEffect, useSyncExternalStore } from "react";
import { ReactLenis } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Registered once at module scope — NOT inside a component/effect, which would
// re-register on every React Strict Mode double-invoke in dev.
gsap.registerPlugin(ScrollTrigger);

function subscribeMotionGates(callback: () => void): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia("(pointer: coarse)");
  reduced.addEventListener("change", callback);
  coarse.addEventListener("change", callback);
  return () => {
    reduced.removeEventListener("change", callback);
    coarse.removeEventListener("change", callback);
  };
}

function getMotionGatesSnapshot(): boolean {
  // true => Lenis + full motion allowed
  return (
    window.matchMedia("(prefers-reduced-motion: no-preference)").matches &&
    window.matchMedia("(pointer: fine)").matches
  );
}

// Stable, motion-off default on the server — matches the ThemeToggle
// getServerSnapshot convention so hydration never mismatches.
function getServerSnapshot(): boolean {
  return false;
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const motionEnabled = useSyncExternalStore(
    subscribeMotionGates,
    getMotionGatesSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!motionEnabled) return;
    ScrollTrigger.refresh();
  }, [motionEnabled]);

  if (!motionEnabled) {
    // Native scroll, no Lenis instance at all (D-09/D-19) — reveal components
    // still work because they use gsap.matchMedia() independently (Pattern 2).
    return <>{children}</>;
  }

  return (
    <ReactLenis root autoRaf={false} options={{ lerp: 0.1, duration: 1.2 }}>
      <LenisTicker />
      {children}
    </ReactLenis>
  );
}

function LenisTicker() {
  useEffect(() => {
    function update(time: number) {
      gsap.ticker.tick(); // no-op placeholder if using autoRaf; real wiring below
    }
    // Canonical sync recipe (verified via WebSearch cross-referencing GSAP forum
    // + darkroomengineering discussions #366):
    //   lenis.on('scroll', ScrollTrigger.update)
    //   gsap.ticker.add((time) => lenis.raf(time * 1000))
    //   gsap.ticker.lagSmoothing(0)
    // In practice this is wired via ReactLenis's `ref` (see lenis/react README) —
    // see the codebase's actual implementation task for the exact ref plumbing.
    gsap.ticker.lagSmoothing(0);
  }, []);
  return null;
}
```
**Note on the snippet above:** the exact ref-based wiring between `<ReactLenis ref={lenisRef}>` and `gsap.ticker.add((time) => lenisRef.current?.lenis?.raf(time * 1000))` is confirmed by a working community reference implementation [CITED: devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap] but was not fetched from GreenSock's own docs verbatim — treat the ticker-wiring line-by-line as MEDIUM confidence and verify against `lenis/react`'s actual TypeScript types during implementation (the ref shape may differ slightly between Lenis minor versions).

### Pattern 2: Reveal-on-enter primitive (WOW-02 chapters, bento stagger, spine fill)

**What:** A thin wrapper that creates a `ScrollTrigger`-driven reveal timeline, gated by `gsap.matchMedia`, cleaned up via `useGSAP`.
**When to use:** Every "fade/slide on enter" moment — career chapters (D-05), bento cells (D-14), the spine fill (D-07).
**Example:**
```tsx
// Source: gsap.com/resources/a11y (matchMedia pattern) + gsap.com/resources/React (useGSAP contract)
"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function Reveal({
  children,
  distance = 24, // px — mirror of --motion-distance-md
  duration = 0.4, // s — mirror of --motion-duration-base
  stagger,
}: {
  children: React.ReactNode;
  distance?: number;
  duration?: number;
  stagger?: number;
}) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Reduced motion: render final state instantly, create no ScrollTrigger.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".reveal-item", { opacity: 1, y: 0 });
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".reveal-item", {
          opacity: 0,
          y: distance,
          duration,
          stagger,
          ease: "expo.out", // matches --motion-ease-out cubic-bezier(0.16,1,0.3,1)
          scrollTrigger: {
            trigger: scope.current,
            start: "top 85%",
            once: true, // reveal-on-enter, not scrub — matches D-05 "no pinning"
          },
        });
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className="reveal-item">
      {children}
    </div>
  );
}
```
This is the pattern that makes MODE-02 "free": the `prefers-reduced-motion: reduce` branch never creates a `ScrollTrigger` at all — content is simply visible at final state, immediately, in the exact same DOM `Reveal` always rendered.

### Pattern 3: Magnetic buttons (D-11.1) — `contextSafe` for event-handler-created tweens

**What:** GSAP animations created inside `mousemove`/`mouseleave` handlers are NOT automatically tracked by `useGSAP`'s context unless wrapped in `contextSafe`.
**When to use:** CV button, contact links, nav — any pointer-only magnetic pull.
**Example:**
```tsx
// Source: gsap.com/resources/React — "Context Safety for Animations"
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function Magnetic({ children }: { children: React.ReactNode }) {
  const el = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: el });

  const onMove = contextSafe((e: React.MouseEvent) => {
    const rect = el.current!.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    gsap.to(el.current, {
      x: gsap.utils.clamp(-12, 12, relX * 0.3),
      y: gsap.utils.clamp(-12, 12, relY * 0.3),
      duration: 0.3,
      ease: "cubic-bezier(0.33,1,0.68,1)", // --motion-ease-magnetic
    });
  });

  const onLeave = contextSafe(() => {
    gsap.to(el.current, { x: 0, y: 0, duration: 0.3, ease: "elastic.out(1,0.5)" });
  });

  return (
    <div
      ref={el}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      // pointer-only per D-11.1/D-19 — no touch handlers attached at all
    >
      {children}
    </div>
  );
}
```
Gate this component's *mounting* (not just its handlers) behind `pointer: fine` at the parent level — on touch devices, skip rendering the magnetic wrapper entirely so no dead `mousemove` handlers ship (D-19: "absent, not degraded").

### Pattern 4: SplitText headline reveal (D-11.2) — the nested-link trap

**What:** `SplitText` v3.13+ auto-generates `aria-label` on the parent + `aria-hidden="true"` on every split fragment, so screen readers announce the original text (not fragments).
**When to use:** Hero H1 (Bricolage Grotesque), case-study H1, standalone headline beats.
**Pitfall (verified via official a11y docs):** if the split heading contains a nested `<a>`, that link becomes **inaccessible** — `aria-hidden` on its ancestor fragment removes it from the accessibility tree entirely [CITED: gsap.com/resources/a11y "Inaccessible Nested Elements"].
**Mitigation:** Never wrap an interactive element inside a `SplitText`-targeted heading. The hero H1 (plain text, D-12) and case-study H1s are safe by construction; audit any headline that might carry an inline link before applying SplitText to it.

### Pattern 5: GSAP-orchestrated crossfade transition (D-11.4)

**What:** A custom `Link` wrapper that intercepts navigation, plays an exit tween, then calls `router.push()` in the completion callback — because Next.js App Router unmounts/mounts instantly with no native transition hook.
**When to use:** Links from the overview page to case studies or `/about` (D-11.4, D-15).
**Example (adapted from a verified community pattern to the D-11.4 crossfade spec, not the overlay-slide the source used):**
```tsx
// Source: pattern verified against malaypatel.com/blogs/nextjs-page-transition-gsap
// (TransitionLink + context pattern) — adapted here to a fade/slide crossfade per
// D-11.4's UI-SPEC resolution, not the source's full-screen overlay treatment.
"use client";
import { useRouter } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";

export function TransitionLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const main = useRef<HTMLElement | null>(null);
  const { contextSafe } = useGSAP();

  const navigate = contextSafe(() => {
    main.current = document.querySelector("main");
    gsap.to(main.current, {
      opacity: 0,
      y: -24, // -distance-md, matches reveal offset direction inverted
      duration: 0.4, // --motion-duration-base
      ease: "cubic-bezier(0.65,0,0.35,1)", // --motion-ease-in-out
      onComplete: () => router.push(href),
    });
  });

  return (
    <button onClick={navigate} className="contents">
      {children}
    </button>
  );
}
```
The incoming page needs no special entry choreography beyond its own standard `Reveal`-wrapped mount (UI-SPEC: "the incoming page runs its own standard mount-reveal ... not true shared-element morphing").

### Anti-Patterns to Avoid

- **`ScrollTrigger.matchMedia()`** — deprecated by GreenSock; use `gsap.matchMedia()` instead [CITED: gsap.com/docs/v3/Plugins/ScrollTrigger].
- **Registering `gsap.registerPlugin()` inside a `useEffect`/component body** — causes duplicate registration under React Strict Mode's dev double-invoke; register once at module scope.
- **Creating GSAP tweens inside raw event handlers without `contextSafe`** — they won't be tracked by the component's context and won't clean up on unmount, and their selector text won't respect the `scope` (verified: gsap.com/resources/React).
- **`useState` + `useEffect` to read `matchMedia`/`prefers-reduced-motion`** — this codebase's lint convention (see `ThemeToggle`, `STATE.md` decision log) treats this as a hard-error pattern under the React-Compiler-aligned `eslint-plugin-react-hooks` ruleset. Use `useSyncExternalStore`, matching the existing pattern exactly.
- **Two component trees for "immersive" vs "reduced-motion/overview"** — directly contradicts D-18's "same DOM" requirement and doubles the phase's surface area for no benefit; gate the *animation*, never duplicate the *markup*.
- **A second animation engine "just for" the page transition** (View Transitions API, Framer Motion, etc.) — explicitly rejected in UI-SPEC D-11.4 to preserve D-08.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth/lerped scroll | A custom `requestAnimationFrame` scroll-lerp loop | `lenis` + `lenis/react`'s `ReactLenis` | Lenis already solves native-scroll-semantics preservation (sticky, anchors, keyboard) that a hand-rolled transform-based smoother breaks — this is exactly why Locomotive Scroll/ScrollSmoother were rejected in favor of Lenis in the project's own STACK research |
| GSAP lifecycle cleanup in React | Manual `gsap.context()` + `ctx.revert()` in `useEffect` return | `useGSAP()` from `@gsap/react` | `useGSAP` wraps this exact pattern, is StrictMode-safe, and is the officially maintained integration — hand-rolling it re-derives a solved problem with more surface for bugs |
| Split-text accessibility (aria-hidden/aria-label wiring) | A custom text-splitting utility + manual ARIA annotation | `gsap.SplitText` (free since v3.13) | Ships correct `aria-label`/`aria-hidden` behavior by default; a hand-rolled splitter would need to re-derive the same accessibility contract from scratch, with a live risk of getting the nested-interactive-element case wrong |
| Responsive/reduced-motion animation branching | Custom `if (window.matchMedia(...).matches)` scattered through components + manual listener wiring per component | `gsap.matchMedia()` | Centralizes the media-query→animation mapping with automatic cleanup (`mm.revert()`) when conditions change; scattering raw `matchMedia` calls risks leaked listeners |
| Page transition sequencing | Hand-rolled promise chains coordinating exit animation → navigation → entry animation | GSAP timeline + `contextSafe` + `router.push` in `onComplete` | GSAP's timeline callback model (`onComplete`) is the exact primitive this needs — a hand-rolled promise wrapper duplicates it with less battle-testing |

**Key insight:** Every "don't hand-roll" here has the same shape — GSAP/Lenis already ship the exact primitive (context-safe cleanup, matchMedia branching, accessible text splitting) that this phase's UI-SPEC requires. The main engineering risk in this phase is *composition* (wiring these primitives together correctly across the reduced-motion/mobile/pointer-fine matrix), not *invention*.

## Common Pitfalls

### Pitfall 1: ScrollTrigger + Next.js hydration/body-style mismatch
**What goes wrong:** GSAP forum reports (and Next.js 15/16 App Router combination specifically) show ScrollTrigger's `enable()` function modifying `<body>` inline styles (`overflow`, etc.) in a way that can be applied twice, surfacing as a hydration warning.
**Why it happens:** ScrollTrigger mutates the DOM outside React's render cycle; if a component that creates a ScrollTrigger is itself re-mounted (e.g. Strict Mode dev double-invoke, or a key change), the body-style side effect can double-apply before the first is cleaned up.
**How to avoid:** Only ever create ScrollTriggers inside `useGSAP()` (never plain `useEffect`), so `gsap.context().revert()` reliably tears down each ScrollTrigger's DOM side effects on unmount; register `ScrollTrigger` itself once at module scope, not per-component.
**Warning signs:** React hydration-mismatch warnings mentioning `style` on `<body>`; scroll behaving correctly on first load but breaking after a Fast Refresh in dev.

### Pitfall 2: The "hydration ceiling" — motion mounting before hydration completes
**What goes wrong:** If any client motion component runs its setup before React finishes hydrating, React can discover a server/client DOM mismatch and discard the server HTML, causing a visible flash/re-render — undermining WOW-04's "no unskippable/jarring first paint" intent even without an explicit preloader.
**Why it happens:** `useGSAP`/Lenis mounting logic that reads layout (`getBoundingClientRect`, etc.) synchronously during an early effect can race with React's commit phase on a slow device.
**How to avoid:** Keep all motion setup inside `useGSAP`/`useEffect` (which run after commit, not during render); do not read DOM geometry in the render body; let `MotionProvider`'s gate (`useSyncExternalStore`, server snapshot = motion-off) guarantee the very first client render is identical to the SSR output before any animation logic runs.
**Warning signs:** Visible layout flash/flicker on load, especially on throttled CPU in DevTools; CLS regressions in the LHCI budget (`cumulative-layout-shift` currently gated at 0.1 in `lighthouserc.json`).

### Pitfall 3: Font swap reflow desyncing ScrollTrigger start/end positions
**What goes wrong:** `next/font/google`'s default `font-display: swap` can cause a brief layout shift when the display face (Bricolage Grotesque) finishes loading, especially on the fluid `clamp()`-sized hero H1 — any `ScrollTrigger` whose `start`/`end` was calculated before that swap is now measuring against stale positions.
**Why it happens:** ScrollTrigger caches trigger element positions at creation time; a late layout shift (font swap, but also career-timeline content-collections hydration) invalidates that cache.
**How to avoid:** Call `ScrollTrigger.refresh()` once inside a `document.fonts.ready.then(...)` handler in `MotionProvider`, in addition to the on-mount refresh.
**Warning signs:** Reveal animations firing at the wrong scroll offset, most noticeable directly after a cold cache-miss font load.

### Pitfall 4: React-Compiler-aligned lint rules blocking naive matchMedia reads
**What goes wrong:** Writing `const [reduced, setReduced] = useState(false); useEffect(() => { setReduced(mq.matches) }, [])` for reduced-motion/pointer detection will hit the same `eslint-plugin-react-hooks`/React-Compiler-era lint failure this codebase already hit once (documented in `STATE.md`: "hard-errors on setState-in-effect ... patterns").
**Why it happens:** The project's `eslint-config-next` ships a React-Compiler-aligned `eslint-plugin-react-hooks` version that flags `setState` calls inside effects and DOM-mutation-in-render-closure patterns as errors, not warnings.
**How to avoid:** Follow the exact `useSyncExternalStore` pattern already proven in `src/components/theme-toggle.tsx` (module-scope pub/sub + `getSnapshot`/`getServerSnapshot`) for every new browser-state read this phase introduces (reduced-motion, pointer-fine, and any future viewport gate).
**Warning signs:** `pnpm lint` failing on the new `MotionProvider`/gate hooks with a rule referencing effect-scoped state setters.

### Pitfall 5: Bundle-budget regression from GSAP + Lenis additions (unverified sizes — measure, don't assume)
**What goes wrong:** `lighthouserc.json` currently enforces `resource-summary:script:size` ≤ 184,643 bytes as a hard CI gate (`TECH-01`, tightened in Phase 2-06). GSAP core + ScrollTrigger + SplitText + Lenis are a non-trivial addition to that budget.
**Why it happens:** No authoritative gzip/transfer-size figures for `gsap@3.15`, `@gsap/react@2.1.2`, or `lenis@1.3.25` could be verified in this research pass (Bundlephobia is JS-rendered and did not return numeric data to the fetch tool used here) [ASSUMED — do not treat any specific KB figure as fact until measured].
**How to avoid:** After the first task that adds these dependencies, run `pnpm build` and inspect the actual route JS size (or add `@next/bundle-analyzer` temporarily) before proceeding further — treat the LHCI script-size assertion as the real gate, not a guess. Import GSAP plugins from their dedicated subpaths (`gsap/ScrollTrigger`, `gsap/SplitText`) rather than the CDN-era "all-in-one" bundle, so Turbopack can tree-shake unused pieces (three.js for Phase 4 is explicitly NOT part of this phase's bundle).
**Warning signs:** `pnpm build` / LHCI CI job failing the `resource-summary:script:size` assertion after this phase's first motion-adding commit.

### Pitfall 6: `lenis/react`'s exact ref/ticker wiring API surface (version drift risk)
**What goes wrong:** The concrete `<ReactLenis ref={...}>` → `gsap.ticker.add(...)` wiring shown in community sources may not match `lenis@1.3.25`'s actual exported TypeScript types verbatim (the source used for the code example was not GreenSock/Lenis-official).
**Why it happens:** Lenis's React adapter is actively developed (111 published versions); ref shapes and `autoRaf` option semantics have shifted across minor versions historically.
**How to avoid:** Before implementing, run `pnpm add lenis` and inspect `node_modules/lenis/dist/lenis-react.d.ts` directly for the current `ReactLenisProps`/`ref` shape rather than trusting the community snippet verbatim — this research flags the pattern's *shape* (root-mount, `autoRaf: false`, manual ticker feed) as HIGH confidence, but the exact API surface as MEDIUM confidence.
**Warning signs:** TypeScript errors on the `ref.current.lenis` access path; `autoRaf` prop being ignored.

## Code Examples

See §Architecture Patterns above for the five verified/adapted patterns (Motion Provider, Reveal primitive, Magnetic contextSafe, SplitText nested-link trap, GSAP crossfade transition) — each is tagged with its source and confidence level inline rather than duplicated here.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| GSAP Club plugins (SplitText, MorphSVG, etc.) required a paid membership | All GSAP plugins are 100% free, including SplitText, in the standard `gsap` npm package | April 2025 (Webflow acquisition) | No separate registry/license key needed; `import { SplitText } from "gsap/SplitText"` works from a plain `npm install gsap` |
| `ScrollTrigger.matchMedia()` for responsive scroll setups | `gsap.matchMedia()` (the general-purpose API) | Documented as deprecated in current GSAP v3 docs | Use `gsap.matchMedia()` for both responsive AND accessibility (`prefers-reduced-motion`) branching — one API, not two |
| Locomotive Scroll for smooth-scroll | Lenis (same studio lineage) | Locomotive Scroll's community/maintenance effectively moved to Lenis years ago | Lenis is the only smooth-scroll library referenced in this project's own STACK research; no reason to consider Locomotive Scroll |
| SplitText output with manual `aria-hidden`/`aria-label` wiring | Built-in accessibility (v3.13+) | GSAP v3.13 (2025) | Removes a whole category of manual a11y wiring — but introduces the nested-interactive-element trap (Pitfall/Pattern 4) that didn't exist when developers hand-rolled the ARIA themselves |

**Deprecated/outdated:**
- `ScrollTrigger.matchMedia()`: superseded by `gsap.matchMedia()` — GreenSock's own docs mark it deprecated.
- Manual SplitText → custom-ARIA wiring: no longer necessary as of SplitText v3.13+, but replaces one risk (missing ARIA) with a different one (link-in-heading trap) that must be designed around.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `<ReactLenis ref={...}>` exposes `.current.lenis.raf(time)` exactly as shown in the community Motion Provider example | Architecture Patterns, Pattern 1 / Pitfall 6 | Low-medium — a TypeScript compile error surfaces immediately during Task 1 of implementation; fix is a quick API-shape lookup in `node_modules/lenis/dist/lenis-react.d.ts`, not a design-level rework |
| A2 | GSAP core + ScrollTrigger + SplitText + Lenis fit within the remaining CI script-size budget (184,643 bytes) without adjustment | Common Pitfalls, Pitfall 5 | Medium — if the budget is exceeded, `pnpm build`/LHCI CI fails outright; the plan should include an explicit "measure after first motion commit" checkpoint rather than assuming headroom |
| A3 | `next/font/google`'s `Bricolage_Grotesque` export accepts `axes: ["opsz", "wdth"]` exactly as the community example showed | Standard Stack, Core table | Low — if the axes API differs slightly, TypeScript/build will surface it immediately; worst case falls back to the default weight-only axis, which still satisfies D-03's "technical grotesque" brief, just without the full variable-axis expressiveness |
| A4 | Reading motion-token values from CSS custom properties via `getComputedStyle` at a single call site (`src/lib/motion-tokens.ts`) is the right single-source-of-truth resolution for the UI-SPEC's "pick one, don't duplicate" instruction | Recommended Project Structure | Low — this is an implementation-detail choice the UI-SPEC explicitly delegated to planning; the alternative (a TS constants module as the source, mirrored manually into CSS) is equally valid and lower-risk if the planner prefers it |

**If this table is empty:** N/A — see rows above.

## Open Questions

1. **Exact `ReactLenis` prop/ref shape for `lenis@1.3.25`**
   - What we know: the conceptual pattern (root-mount, `autoRaf: false`, manual `gsap.ticker` feed, `lenis.on('scroll', ScrollTrigger.update)`) is confirmed across multiple independent sources.
   - What's unclear: the precise TypeScript surface of the `ref` object in the currently-pinned version.
   - Recommendation: the plan's first motion-infrastructure task should include a step to inspect `node_modules/lenis/dist/lenis-react.d.ts` (or the package's own README shipped in `node_modules/lenis/packages/react/README.md` if present) before writing the final wiring — treat this research's code sketch as a shape reference, not copy-paste-final.

2. **Actual bundle-size delta from GSAP+Lenis against the 184,643-byte LHCI script budget**
   - What we know: the LHCI assertion is a hard CI gate already in place from Phase 2.
   - What's unclear: no verified gzip figures for the specific plugin subset this phase needs (core + ScrollTrigger + SplitText + Lenis).
   - Recommendation: plan an explicit measurement checkpoint immediately after the dependency-install + Motion Provider task, before building out all the reveal/magnetic/transition components — cheaper to discover a budget problem early than after the full motion layer is built.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| npm registry access (build/CI) | `pnpm add gsap @gsap/react lenis` | ✓ (already relied on for all existing deps) | — | — |
| Google Fonts build-time fetch (`next/font/google`) | Bricolage Grotesque self-hosting (D-03) | ✓ — already in active use for Geist Sans/Geist Mono in `layout.tsx` | next 16.2.10 | If the build environment ever loses network access during `next build`, the existing Geist fonts would fail identically — this is a pre-existing, already-accepted build-time dependency, not new risk introduced by this phase |
| Node.js / pnpm (local + Vercel) | build tooling | ✓ (pnpm 11.1.2 pinned, Node ≥20 per project docs) | — | — |

**Missing dependencies with no fallback:** none identified.
**Missing dependencies with fallback:** none — this phase's only new external dependency (Google Fonts fetch for the display face) follows an already-proven, already-accepted pattern in this exact codebase.

## Security Domain

`security_enforcement` is enabled (`security_asvs_level: 1`) for this run. This phase introduces no auth, sessions, forms, or user-controlled data paths — its ASVS surface is narrow.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-------------------|
| V2 Authentication | No | No auth surface in this phase |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | No protected resources |
| V5 Input Validation | Marginal | No new user input; all motion-driven content (headline text, career/project data) already flows through the existing typed content-model (`content/{de,en}/*` + `content/shared/types.ts`, Zod-validated) — SplitText/GSAP only reads/animates existing, already-trusted DOM text, it does not accept external input |
| V6 Cryptography | No | Not applicable |
| V14 Configuration (third-party script integrity) | Yes | GSAP/Lenis/Bricolage Grotesque are all installed as build-time dependencies (npm packages / `next/font` self-hosted fetch) and ship as self-hosted bundled JS/CSS — no runtime `<script src="https://cdn...">` tag is introduced, preserving the AGENTS.md "no runtime third-party calls" DSGVO rule and keeping a future `script-src 'self'` CSP viable (the CSP gap itself remains tracked separately per STATE.md, unaffected by this phase) |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|----------------------|
| Third-party script/CDN compromise (supply-chain) | Tampering | All new motion libraries are pinned npm dependencies bundled at build time (no CDN `<script>` tags) — audit `postinstall` scripts before install (`npm view gsap scripts.postinstall`, `npm view lenis scripts.postinstall`, `npm view @gsap/react scripts.postinstall`); the `package-legitimacy` seam reported `postinstall: null` for all three in this research pass |
| Clickjacking / malicious embedding of the immersive page | Tampering/Spoofing | Already mitigated site-wide via `X-Frame-Options: DENY` in `next.config.ts` (Phase 2) — unaffected by this phase |
| Reflected content in `dangerouslySetInnerHTML` (SplitText/Person JSON-LD) | Tampering (XSS) | No new `dangerouslySetInnerHTML` usage is introduced by this phase's motion layer; the existing `personJsonLd` script tag in `page.tsx` is unchanged and sources trusted first-party content-model data only — SplitText operates on the rendered DOM text nodes, not raw HTML strings |

## Sources

### Primary (HIGH confidence)
- GSAP official docs/resources via Context7 (`/llmstxt/gsap_llms_txt`) — `useGSAP`/`contextSafe` lifecycle contract, `gsap.matchMedia()` reduced-motion pattern, `SplitText` built-in accessibility + nested-link trap, `ScrollTrigger.matchMedia()` deprecation notice
- npm registry (`npm view`, 2026-07-05) — `gsap@3.15.0`, `@gsap/react@2.1.2` (peerDependencies), `lenis@1.3.25` + `time.created`/`time` history, `lenis` package `exports` map confirming `./react` subpath
- This repository's own source (`src/components/theme-toggle.tsx`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`, `src/app/globals.css`, `.planning/STATE.md`) — the existing `useSyncExternalStore` convention, current font/theming architecture, and the documented React-Compiler-lint constraint this phase must respect

### Secondary (MEDIUM confidence)
- [darkroomengineering/lenis `packages/react/README.md`](https://github.com/darkroomengineering/lenis/blob/main/packages/react/README.md) — `ReactLenis` props (`root`, `options`, `autoRaf`), `useLenis` hook signature
- [devdreaming.com — Next.js Smooth Scrolling with Lenis & GSAP](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap) — concrete `<ReactLenis>` + `gsap.ticker` wiring example (already cited as a source in this project's own `.claude/CLAUDE.md` STACK research)
- [malaypatel.com — Next.js Page Transitions with GSAP](https://www.malaypatel.com/blogs/nextjs-page-transition-gsap) — TransitionLink/context pattern for App Router GSAP page transitions (adapted, not copied verbatim, to match D-11.4's crossfade spec)
- WebSearch aggregate on "GSAP forum + Next.js hydration/ScrollTrigger body-style" — [gsap.com/community/forums/topic/43202](https://gsap.com/community/forums/topic/43202-hydration-error-while-using-usegsap-and-scrolltrigger-in-nextjs/) referenced but returned a 404 on direct fetch; the underlying claim (StrictMode plugin double-registration, body-style mutation) is corroborated by the aggregated WebSearch summary and by GreenSock's own general guidance on registering plugins at module scope

### Tertiary (LOW confidence)
- Bundle-size figures for `gsap`/`lenis` (gzip) — WebFetch of Bundlephobia pages returned no numeric data (JS-rendered page); no specific KB figure in this document should be treated as verified — see Assumption A2 and Pitfall 5
- `Bricolage_Grotesque`'s exact `next/font/google` `axes` configuration — WebSearch-sourced, not cross-checked against Next.js's own font-loader source or official docs page

## Metadata

**Confidence breakdown:**
- Standard stack (package versions, licensing, peer deps): HIGH — directly verified against npm registry and official GSAP documentation
- Architecture (Motion Provider, Reveal primitive, matchMedia gating): HIGH for the conceptual pattern (multiple independent, mutually-corroborating sources), MEDIUM for exact `lenis/react` API surface (community-sourced, version-drift risk flagged)
- Pitfalls: HIGH for the React-Compiler/`useSyncExternalStore` constraint (verified directly against this repo's own code + STATE.md decision log) and the SplitText nested-link trap (verified against GSAP's own a11y docs); MEDIUM for the hydration/body-style GSAP-Next.js interaction (corroborated by search aggregate, direct forum thread fetch failed); LOW for specific bundle-size figures (unverified, flagged explicitly)

**Research date:** 2026-07-05
**Valid until:** ~30 days (GSAP/Lenis APIs are stable; re-verify package versions if planning is delayed beyond a month, and re-check the LHCI script-size budget assertion value in case Phase 2 follow-up work changes it)

---
*Phase: 3-Design Direction & Immersive Experience*
*Research completed: 2026-07-05*
