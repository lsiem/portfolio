# Phase 3: Design Direction & Immersive Experience - Pattern Map

**Mapped:** 2026-07-05
**Files analyzed:** 15 (new/modified)
**Analogs found:** 15 / 15 (all matched against existing codebase; no external analogs needed)

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/components/motion/motion-provider.tsx` | provider | event-driven (browser-state → side effect) | `src/components/theme-toggle.tsx` | exact (useSyncExternalStore gate pattern) |
| `src/components/motion/reveal.tsx` | component | event-driven (scroll → DOM mutation) | `src/components/theme-toggle.tsx` (client boundary shape) + `src/app/[locale]/page.tsx` section markup (what it wraps) | role-match |
| `src/components/motion/split-heading.tsx` | component | transform (text → DOM fragments) | `src/app/[locale]/page.tsx` hero `<h1>` (lines 88-90) | role-match |
| `src/components/motion/magnetic.tsx` | component | event-driven (pointer → transform) | `src/components/theme-toggle.tsx` (client component + contextSafe-style guarded interaction) | role-match |
| `src/components/motion/career-spine.tsx` | component | event-driven (scroll progress → DOM) | `src/components/github-heatmap.tsx` (Server Component data→grid rendering, decorative/aria-hidden marks) | partial (closest read-only visual-grid analog; no scroll-driven analog exists yet) |
| `src/components/motion/hero-scene-slot.tsx` | component | transform (empty static slot) | `src/components/github-heatmap.tsx` (Server Component, no client JS) | role-match (both are Server Components with conditional/absent visual output) |
| `src/components/motion/transition-link.tsx` | component | event-driven (click → tween → navigation) | `src/i18n/navigation` `Link` usage in `src/app/[locale]/layout.tsx` (lines 73-78, 106-127) and `page.tsx` (lines 206-211, 268-273) | role-match |
| `src/lib/motion-tokens.ts` | utility | transform (CSS custom properties → GSAP-friendly values) | `src/lib/seo.ts` / `src/lib/github.ts` (existing `lib/` utility module shape) | role-match |
| `src/app/[locale]/layout.tsx` (MODIFIED) | layout/provider mount | request-response (SSR) + provider wrap | itself (existing file) | exact — modify in place |
| `src/app/globals.css` (MODIFIED) | config (design tokens) | static | itself (existing file) | exact — extend in place |
| `src/app/[locale]/page.tsx` (MODIFIED) | page (Server Component) | request-response (SSR) | itself (existing file) | exact — wrap existing sections with new client boundaries, no data-fetching change |
| `src/app/[locale]/case-studies/[slug]/page.tsx` (MODIFIED) | page (Server Component) | request-response (SSR) | `src/app/[locale]/page.tsx` (same content-model + SSR pattern) | exact |
| `src/app/[locale]/[slug]/page.tsx` (MODIFIED, e.g. `/about`) | page (Server Component) | request-response (SSR) | `src/app/[locale]/page.tsx` | exact |
| Career section chapter markup (career-chapter reveal composition, likely `src/components/motion/reveal.tsx` consumer inside `page.tsx`) | component | event-driven | `page.tsx` career `<ol>`/`<li>` block (lines 129-178) | exact (structure unchanged, only wrapped) |
| Bento project grid (project cards, likely inline in `page.tsx` restructured or a new `src/components/motion/project-bento.tsx`) | component | transform (data → asymmetric grid) | `page.tsx` projects `<ul>`/`<li>` block (lines 180-228) | role-match |

## Pattern Assignments

### `src/components/motion/motion-provider.tsx` (provider, event-driven)

**Analog:** `src/components/theme-toggle.tsx`

**The load-bearing pattern to copy verbatim: `useSyncExternalStore`, not `useState`+`useEffect`.** This is the single most important pattern in this phase — RESEARCH.md explicitly flags that violating it previously caused a lint failure requiring a rewrite (Pitfall 4).

**Module-scope pub/sub + snapshot functions** (theme-toggle.tsx lines 15-43):
```typescript
// Module-scope pub/sub so an imperative DOM/browser-API mutation (not React
// state) can notify the subscribed component to re-render.
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): ThemeOption {
  try {
    const stored = window.localStorage.getItem("theme");
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

// Stable neutral default on the server so hydration never mismatches — the
// no-flash inline script in layout.tsx already applied real state to the DOM
// before paint; this control only needs to reconcile its displayed state
// after mount.
function getServerSnapshot(): ThemeOption {
  return "system";
}
```

**Component usage** (theme-toggle.tsx line 90):
```typescript
const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
```

**Adapt for MotionProvider (per RESEARCH.md Pattern 1):** replace the `localStorage` snapshot with two `matchMedia` reads (`prefers-reduced-motion: no-preference` AND `pointer: fine`), replace the pub/sub `Set` with `matchMedia(...).addEventListener("change", callback)` subscriptions (RESEARCH.md's `subscribeMotionGates`/`getMotionGatesSnapshot` sketch), and `getServerSnapshot` returns `false` (motion-off) to guarantee SSR/first-client-render parity — mirrors theme-toggle's "stable neutral default" comment verbatim in intent.

**"use client" directive placement** (theme-toggle.tsx line 1): directive is the first line before any import — follow exactly.

**No-flash inline script precedent** (layout.tsx lines 24-31, 69): the project already has one precedent for "static string literal script, no interpolation, DSGVO-safe, runs before hydration" (`NO_FLASH_THEME_SCRIPT`). `MotionProvider` does NOT need an inline script (matchMedia is synchronously readable, no flash risk the way theme requires), but this confirms the project's established discipline for any pre-hydration DOM work — do not introduce a new inline script for motion state.

---

### `src/components/motion/reveal.tsx`, `magnetic.tsx`, `split-heading.tsx` (components, event-driven)

**Analog:** `src/components/theme-toggle.tsx` (client component shape) + section markup in `src/app/[locale]/page.tsx` (what gets wrapped)

**Client component shape to copy** (theme-toggle.tsx lines 1-5, 88-92):
```typescript
"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
// ... component reads local render state via hooks only, no prop-drilled
// mutation from parent — same shape Reveal/Magnetic/SplitHeading should use.
```

**What these wrap — do not alter existing section markup structure.** Example target from `page.tsx` (career section, lines 129-178): the `<section id="career">` → `<ol>` → `<li>` structure, `formatMonth` helper, and `entry.roles` inner `<ol>` must remain server-rendered exactly as-is. `Reveal` wraps each `<li>` (or a `data-reveal` group) as a thin client boundary — it does not reimplement or restructure the list.

**Real DOM text requirement (D-11.2 / a11y):** the hero `<h1>{contact.name}</h1>` (page.tsx line 88-90) is the SplitHeading target — note it currently has NO nested `<a>` inside it, which RESEARCH.md Pattern 4 requires (never split a heading containing a link). Confirmed safe by construction. Contrast with the career org heading (page.tsx lines 138-146) which DOES conditionally wrap in `<a href={entry.orgUrl}>` — this must NOT be a SplitText target per the nested-link trap.

**Where GSAP `useGSAP` + `matchMedia` gating goes (per RESEARCH.md Pattern 2):**
```tsx
"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function Reveal({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.set(".reveal-item", { opacity: 1, y: 0 });
    });
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(".reveal-item", {
        opacity: 0, y: 24, duration: 0.4,
        ease: "expo.out",
        scrollTrigger: { trigger: scope.current, start: "top 85%", once: true },
      });
    });
    return () => mm.revert();
  }, { scope });
  return <div ref={scope} className="reveal-item">{children}</div>;
}
```
This is the RESEARCH.md-verified pattern — copy its shape, source motion-token values (durations/easing/distance) from `src/lib/motion-tokens.ts` instead of hardcoding `0.4`/`24`/`"expo.out"` inline as shown.

---

### `src/components/motion/hero-scene-slot.tsx` (component, static/reserved seam)

**Analog:** `src/components/github-heatmap.tsx` (Server Component, conditional/empty visual output)

**Server Component with no client JS pattern** (github-heatmap.tsx lines 48-52):
```typescript
export function GitHubHeatmap({ data, labels }: GitHubHeatmapProps) {
  if (!data) {
    return <p className="text-muted">{labels.unavailable}</p>;
  }
  // ...
}
```
`HeroSceneSlot` follows the same "plain function component, no directive, no hooks" shape — per UI-SPEC and RESEARCH.md's Architectural Responsibility Map, this stays a **Server Component** in Phase 3 (empty, `aria-hidden`, `absolute inset-0 -z-10 pointer-events-none`), matching GitHubHeatmap's precedent of a Server Component that sometimes renders nothing/minimal-fallback rather than defaulting every visual component to `"use client"`.

---

### `src/components/motion/career-spine.tsx` (component, event-driven — scroll progress)

**Analog:** `src/components/github-heatmap.tsx` (closest existing "data → decorative grid" renderer; no true scroll-driven analog exists in the codebase yet — flagged below in No Analog Found for the scroll-progress-fill behavior specifically)

**Decorative/aria-hidden marks pattern to copy** (github-heatmap.tsx lines 55-78):
```tsx
<div role="img" aria-label={labels.ariaSummary} className="flex w-fit gap-1 overflow-x-auto">
  {data.weeks.map((week, weekIndex) => (
    <div key={weekIndex} className="flex flex-col gap-1">
      {week.contributionDays.map((day) => {
        const bucket = intensityBucket(day.contributionCount);
        return (
          <div key={day.date} title={...} className={`${CELL_SIZE} ... ${BUCKET_CLASSNAME[bucket]}`} />
        );
      })}
    </div>
  ))}
</div>
<span className="sr-only">{data.totalContributions} — {labels.ariaSummary}</span>
```
Apply the same "visual marks are `aria-hidden`, a single sr-only/labelled summary carries the real semantic content" discipline: UI-SPEC §Progress spine explicitly says spine ticks are `aria-hidden="true"` because the same info (dates) is already visible in the DOM (career entry dates in `page.tsx` lines 147-149). Copy the "don't duplicate screen-reader text" principle directly.

**Server-rendered structure + client-only progress fill split:** the tick/label list itself (year markers, chapter index) can be Server-rendered exactly like `GitHubHeatmap`'s grid; only the animated fill segment (`ScrollTrigger.onUpdate`) needs a thin client wrapper — do not make the whole spine a client component if the static ticks don't need JS.

---

### `src/components/motion/transition-link.tsx` (component, event-driven — click → tween → navigate)

**Analog:** existing `Link` usage from `@/i18n/navigation` throughout `layout.tsx` and `page.tsx`

**Current Link usage to preserve the interface of** (page.tsx lines 206-211):
```tsx
<Link
  href={`/case-studies/${project.slug}`}
  className="text-accent transition-colors hover:text-foreground"
>
  {projectsT("caseStudy")} →
</Link>
```
and (page.tsx lines 268-273):
```tsx
<Link href="/about" className="font-mono text-sm text-muted transition-colors hover:text-foreground">
  {aboutT("readMore")} →
</Link>
```
`TransitionLink` should wrap `@/i18n/navigation`'s `Link`/`useRouter`, NOT `next/navigation`'s directly, to preserve the locale-prefixed routing already established project-wide — every existing internal navigation in this codebase goes through `@/i18n/navigation`, never raw `next/link`. Verify `@/i18n/navigation` exports a `useRouter` compatible with the `router.push(href)` call in RESEARCH.md's Pattern 5 sketch (adjust to `next-intl`'s locale-aware router API if the signature differs).

---

### `src/lib/motion-tokens.ts` (utility, transform)

**Analog:** `src/lib/github.ts`, `src/lib/seo.ts` (existing `lib/` module shape — pure functions/constants, no React, typed exports)

`src/lib/content.ts`/`src/lib/seo.ts` establish the project convention: `lib/` files export typed, pure functions consumed by Server Components (`getCareer`, `personJsonLd`, etc.) with no side effects at import time. `motion-tokens.ts` should follow the same shape — export typed constants/functions (e.g. `getMotionToken(name): number`) that read `--motion-*` CSS custom properties via `getComputedStyle`, called from client components only (never from a Server Component, since `getComputedStyle` is browser-only) — mirrors how `src/lib/github.ts`'s functions are async/server-safe while this new module's functions are client-safe; keep the client/server split explicit in the file's own doc comment, following the commenting density already established in `github-heatmap.tsx` and `theme-toggle.tsx` (dense rationale comments above non-obvious decisions).

---

### `src/app/[locale]/layout.tsx` (MODIFIED — add font + MotionProvider wrap)

**Analog:** itself (existing file, lines 1-140)

**Existing `next/font/google` self-hosting pattern to copy for Bricolage Grotesque** (layout.tsx lines 3, 33-41):
```typescript
import { Geist, Geist_Mono } from "next/font/google";
// ...
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```
Add `Bricolage_Grotesque` the identical way: `import { Bricolage_Grotesque } from "next/font/google"`, instantiate with a `variable: "--font-display"` option, and append `.variable` to the `<html className={...}>` string (layout.tsx line 66) exactly like `geistSans.variable`/`geistMono.variable` are appended today. This is a zero-runtime-call build-time fetch — identical DSGVO posture to the existing Geist fonts (AGENTS.md compliance already proven by this exact code).

**Where MotionProvider mounts relative to existing providers** (layout.tsx lines 63-138): the current nesting is `<html><body><script (no-flash theme)/><NextIntlClientProvider><header/>{children}<footer/></NextIntlClientProvider><Analytics/><SpeedInsights/></body></html>`. Per RESEARCH.md's Architecture Diagram, `<MotionProvider>` should wrap `{children}` — the safest, most surgical insertion point is immediately inside `<NextIntlClientProvider>`, wrapping the `<div className="flex flex-1 flex-col">{children}</div>` block (line 99), NOT wrapping `<header>`/`<footer>` (those stay outside Lenis's scrolled root only if UI-SPEC requires header to stay sticky-native — verify against D-09's "wraps native scroll so position:sticky... keep working" — the sticky header at line 71 currently uses `sticky top-0`, which per Lenis's own docs works when Lenis wraps a container that includes the sticky element in its normal document flow; confirm during implementation whether `<ReactLenis root>` should wrap the whole `<body>` content including header/footer, which is the more common Lenis integration shape, rather than only `{children}`).

**"REQUIRED for static rendering" comment convention** (layout.tsx line 58, page.tsx line 52): copy this terse, load-bearing inline comment style for any new non-obvious required call (e.g. `gsap.registerPlugin(ScrollTrigger)` at module scope needs an equivalent "must be called once at module scope, not in an effect — see RESEARCH Pitfall" comment).

---

### `src/app/globals.css` (MODIFIED — add motion tokens)

**Analog:** itself (existing file, lines 1-91)

**Token declaration + `@theme inline` pattern to copy** (globals.css lines 3-19):
```css
:root {
  --background: #fafaf9;
  --foreground: #1c1917;
  --muted: #6b6560;
  --accent: #c2410c;
  --border: #e7e5e4;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... */
}
```
Add the UI-SPEC's `--motion-duration-*`, `--motion-ease-*`, `--motion-distance-*`, `--motion-stagger-*` tokens as a new `:root` block (or extend the existing one) — these do NOT need a `@theme inline` mirror unless a Tailwind utility class is meant to consume them directly (the UI-SPEC intends GSAP/JS consumption via `getComputedStyle`, not Tailwind utilities, so plain `:root` custom properties suffice, no `@theme inline` entry required per UI-SPEC's "pick one source of truth" instruction).

**Reduced-motion media query precedent already exists** (globals.css lines 64-68):
```css
@media (prefers-reduced-motion: no-preference) {
  html {
    scroll-behavior: smooth;
  }
}
```
This is the exact discipline to extend, not duplicate: the project already gates one CSS behavior behind `prefers-reduced-motion`. Any new pure-CSS motion (if UI-SPEC calls for CSS-level fallback transitions on hover/focus states, e.g. the tech-chip `border-foreground` transition) should follow this same `@media (prefers-reduced-motion: no-preference)` wrapping convention rather than relying solely on the JS-level `MotionProvider` gate for CSS transitions.

**Comment density convention** (globals.css lines 31-36, 53-62, 82-87): every non-obvious CSS decision has a dense rationale comment explaining WHY, referencing requirement IDs (TECH-04, D-B). New motion-token additions should carry equivalent comments citing D-08/D-09/UI-SPEC "Motion Tokens & Choreography" section.

---

### `src/app/[locale]/page.tsx` (MODIFIED — wrap sections, no data-fetching change)

**Analog:** itself (existing file, lines 1-322)

**Critical constraint from RESEARCH.md: data-fetching (`getCareer`, `getProjects`, `getContributionCalendar`, etc., lines 64-76) must NOT change.** Phase 3 only adds `Reveal`/`SplitHeading`/`Magnetic`/`CareerSpine` wrappers AROUND the existing server-rendered JSX. The `formatMonth` helper (lines 43-48), the `personJsonLd` script tag (lines 80-83), and the `<section id="...">` id/aria-labelledby structure (used for both nav anchors AND scroll-mt-24 CSS, lines 84-320) must remain byte-identical in their content-producing logic — only wrap children in new client boundaries.

**Existing section anchor + heading pattern to preserve exactly** (repeated 6x, e.g. lines 129-132):
```tsx
<section id="career" aria-labelledby="career-heading" className="flex scroll-mt-24 flex-col gap-6">
  <h2 id="career-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
    {careerT("title")}
  </h2>
```
UI-SPEC explicitly forbids "upgrading" these H2s to Display size (§"Section H2 convention... must not be upgraded to Display size during Phase 3 execution") — this is a hard constraint the planner must carry into any task touching `page.tsx` headings.

---

## Shared Patterns

### `useSyncExternalStore` for all new browser-state reads (mandatory, cross-cutting)
**Source:** `src/components/theme-toggle.tsx` lines 15-43, 90
**Apply to:** `motion-provider.tsx` (reduced-motion + pointer-fine gates), any future viewport/browser-state hook this phase introduces
**Rule:** Never `useState` + `useEffect` for `matchMedia`/browser state — this codebase's `eslint-plugin-react-hooks` (React-Compiler-aligned) hard-errors on that pattern (documented in STATE.md per RESEARCH.md Pitfall 4). `getServerSnapshot` must always return the "motion off" / neutral value so SSR and first client render never mismatch.

### `"use client"` directive placement
**Source:** `src/components/theme-toggle.tsx` line 1
**Apply to:** every new file in `src/components/motion/`
**Rule:** directive is line 1, before any import statement.

### Dense rationale comments citing requirement IDs
**Source:** `src/app/globals.css` lines 31-36, 53-62; `src/app/[locale]/layout.tsx` lines 14-16, 24-30; `src/app/[locale]/page.tsx` lines 259-264
**Apply to:** all new motion files — every non-obvious architectural decision (why MotionProvider gates this way, why SplitText avoids nested links, why Lenis is `pointer:fine`-only) should carry a comment citing the CONTEXT.md decision ID (D-08, D-09, D-18, D-19) or RESEARCH.md pitfall number, matching the existing codebase's citation style.

### Internal navigation always via `@/i18n/navigation`
**Source:** `src/app/[locale]/layout.tsx` lines 10, 73; `src/app/[locale]/page.tsx` lines 3, 206, 268
**Apply to:** `transition-link.tsx` — must wrap the project's `Link`/router from `@/i18n/navigation`, never raw `next/link` or `next/navigation`'s non-locale-aware router, to preserve locale-prefixed routing.

### Token-driven styling — no new hardcoded colors, no `dark:` utilities
**Source:** `src/app/globals.css` lines 53-62 (comment explaining the token-only theming discipline); `src/app/[locale]/page.tsx` (every color reference is `text-muted`/`text-foreground`/`text-accent`/`border-border`, never a literal hex or `dark:` prefix)
**Apply to:** every new motion component's className strings — colors must reference existing Tailwind color utilities backed by the CSS custom properties (`background`/`foreground`/`muted`/`accent`/`border`), never new hex values (D-02 locked palette).

### Accent color scarcity (10%, signal-only, exhaustive list)
**Source:** UI-SPEC "Color" section (exhaustive 6-item list) + existing usage in `page.tsx` (CV button line 298, org/case-study links lines 140, 208, 304)
**Apply to:** `magnetic.tsx` (max-pull glow), `career-spine.tsx` (active tick), `split-heading.tsx` (optional flourish char) — do not introduce accent usage beyond the UI-SPEC's exhaustive list.

## No Analog Found

| File | Role | Data Flow | Reason |
|---|---|---|---|
| Scroll-progress-fill behavior inside `career-spine.tsx` (the `ScrollTrigger.onUpdate` transform-based fill segment specifically) | component | event-driven (continuous scroll → transform) | No existing component in the codebase reads continuous scroll position and drives a transform; `GitHubHeatmap` is the closest structural analog (decorative aria-hidden grid) but is fully static/server-rendered. Planner should rely on RESEARCH.md Pattern 2 (Reveal-on-enter primitive) and Pattern 1 (Lenis/ScrollTrigger sync) directly rather than an in-repo analog for this specific sub-behavior. |
| `gsap.ticker` ↔ Lenis `ref` wiring inside `motion-provider.tsx` | provider | event-driven (RAF loop sync) | Zero animation dependencies exist in the repo today (RESEARCH.md confirms "this repo currently ships zero animation dependencies") — no in-repo analog possible; use RESEARCH.md Pattern 1 verbatim as the reference, flagged there as MEDIUM confidence pending `node_modules/lenis/dist/lenis-react.d.ts` inspection during implementation. |
| Bento asymmetric grid restructuring (`project-bento.tsx` or inline `page.tsx` rework for D-14) | component | transform (data → asymmetric 12-col grid) | Current `page.tsx` projects section (lines 180-228) is a simple `<ul>`/`<li>` list with no featured/compact hierarchy or grid-column spanning — this is a genuinely new composition, not an elevation of an existing grid pattern. Planner should build from the UI-SPEC's "Bento project grid" component spec directly (breakpoint table + column-span values) rather than an in-repo grid analog. |

## Metadata

**Analog search scope:** `src/components/`, `src/app/[locale]/`, `src/app/globals.css`, `src/lib/`
**Files scanned:** `theme-toggle.tsx`, `locale-switcher.tsx`, `github-heatmap.tsx`, `[locale]/layout.tsx`, `[locale]/page.tsx`, `globals.css`, `lib/content.ts` (referenced, not opened — signature inferred from `page.tsx` imports), `lib/github.ts` (referenced), `lib/seo.ts` (referenced)
**Pattern extraction date:** 2026-07-05

---
*Phase: 3-Design Direction & Immersive Experience*
