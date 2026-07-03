# Architecture Research

**Domain:** Immersive, animation-first personal developer portfolio (bilingual DE/EN, dual-mode navigation, Vercel)
**Researched:** 2026-07-02
**Confidence:** MEDIUM (library integration patterns from curated docs = MEDIUM; dual-mode navigation & performance budgets from web sources = LOW–MEDIUM, cross-checked)

> Scope note: The stack decision itself belongs to STACK.md. This document describes the reference architecture the ecosystem converges on in 2026 — a React-based meta-framework (Next.js App Router shape used for concreteness). The component boundaries and data flows hold even if the roadmap swaps the framework (Astro/Nuxt equivalents exist for every box), but the recommendation here is deliberately opinionated: **Next.js App Router**, because immersive portfolios need scroll/animation state flowing across many interactive sections — exactly where Astro's islands model gets awkward (shared state via nanostores across islands) and where a bare Vite SPA gives up SSG, SEO, and i18n route conventions for free.

## Standard Architecture

### System Overview

Immersive portfolios in 2026 are structured as **five layers with one strict rule: content is defined once, below everything, and every mode renders from it.**

```
┌──────────────────────────────────────────────────────────────────────┐
│  MODE LAYER (what the visitor experiences)                           │
│  ┌──────────────────────────┐   ┌─────────────────────────────────┐  │
│  │ Immersive Experience     │   │ Quick-Facts / Overview Mode     │  │
│  │ (default: /[locale])     │◄──┤ (skip CTA → /[locale]/overview) │  │
│  │ scroll story, sections,  │   │ zero animation runtime,         │  │
│  │ optional 3D              │   │ scannable, doubles as           │  │
│  └───────────┬──────────────┘   │ reduced-motion fallback         │  │
│              │                  └───────────────┬─────────────────┘  │
├──────────────┴──────────────────────────────────┴────────────────────┤
│  ANIMATION / EXPERIENCE LAYER (client components only)               │
│  ┌────────────────┐ ┌──────────────────┐ ┌────────────────────────┐  │
│  │ Scroll          │ │ Section          │ │ 3D Scene (optional,    │  │
│  │ Orchestrator    │►│ Animations       │ │ lazy R3F Canvas)       │  │
│  │ Lenis + GSAP    │ │ useGSAP scoped   │ │ reads scroll progress  │  │
│  │ single RAF loop │ │ timelines        │ │ via bridge store       │  │
│  └───────┬─────────┘ └──────────────────┘ └───────────▲────────────┘  │
│          └────────── scroll progress bridge ──────────┘               │
├───────────────────────────────────────────────────────────────────────┤
│  CAPABILITY GATE (decides which animation tier loads)                 │
│  prefers-reduced-motion · hardwareConcurrency/deviceMemory ·          │
│  viewport/input type → tier: static | animated | animated+3D          │
├───────────────────────────────────────────────────────────────────────┤
│  RENDERING / i18n LAYER (server, static at build time)                │
│  app/[locale]/ segment · next-intl routing · setRequestLocale +       │
│  generateStaticParams → fully SSG'd DE + EN pages                     │
├───────────────────────────────────────────────────────────────────────┤
│  CONTENT LAYER (single source of truth)                               │
│  ┌──────────────┐ ┌───────────────┐ ┌──────────────────────────┐      │
│  │ messages/    │ │ content/      │ │ assets (models, images,  │      │
│  │ de.json      │ │ typed data:   │ │ optimized per tier)      │      │
│  │ en.json      │ │ projects, CV, │ │                          │      │
│  │ (UI strings) │ │ skills (DE+EN)│ │                          │      │
│  └──────────────┘ └───────────────┘ └──────────────────────────┘      │
└───────────────────────────────────────────────────────────────────────┘
                          Deployed as static output on Vercel
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Content layer** | Single source of truth for CV, projects, skills, about — in both languages. Presentation-agnostic. | Typed TS modules or MDX per locale (`content/projects/*.de.mdx` + `*.en.mdx`), plus `messages/{de,en}.json` for UI strings |
| **Rendering/i18n layer** | Locale routing, static generation, metadata/SEO per locale | next-intl `defineRouting({locales:['de','en']})`, `app/[locale]/layout.tsx` with `hasLocale` validation + `setRequestLocale`, `generateStaticParams` |
| **Capability gate** | Decide once per visit which experience tier loads: static / animated / animated+3D | Small client hook: `prefers-reduced-motion` media query + `navigator.hardwareConcurrency`/`deviceMemory` heuristics; result in React context |
| **Scroll orchestrator** | The ONE scroll authority. Smooth scroll + trigger positions, single RAF loop | `ReactLenis` (`autoRaf:false`) + GSAP ScrollTrigger; `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t*1000))`, `lagSmoothing(0)` |
| **Section animations** | Per-section timelines, pinning, reveals — self-cleaning | `useGSAP` with `scope` per section component; timelines in refs; `contextSafe` for handlers |
| **3D scene (optional)** | Scroll-linked WebGL scene behind/within DOM content | Lazy `next/dynamic` R3F `<Canvas frameloop="demand">`, fixed full-viewport, driven by ScrollTrigger progress via bridge store, `performance.regress()` under load |
| **Scroll progress bridge** | Decouple DOM scroll authority from 3D consumer | Zustand store or mutable ref: ScrollTrigger `onUpdate` writes `progress`, R3F `useFrame` reads it (no React re-renders per frame) |
| **Quick-facts mode** | Recruiter path: who/what/contact in <30s, no animation runtime | Separate route (`/[locale]/overview`) or top-level static section; renders the SAME content modules; route-level code splitting keeps GSAP/three out of its bundle |
| **Mode switch** | Always-visible escape hatch from immersive → overview | Persistent header CTA ("Skip intro" / "Für Eilige") + deep links; reduced-motion users can land here by default |

## Recommended Project Structure

```
src/
├── app/
│   └── [locale]/                  # everything is locale-scoped
│       ├── layout.tsx             # hasLocale check, setRequestLocale, providers
│       ├── page.tsx               # immersive experience (default mode)
│       ├── overview/page.tsx      # quick-facts mode (no animation imports)
│       └── projects/[slug]/       # case study pages (mostly static)
├── content/                       # SINGLE SOURCE OF TRUTH
│   ├── projects/                  # per-project data/MDX, .de + .en variants
│   ├── career.ts                  # typed CV timeline (both locales)
│   └── skills.ts
├── messages/
│   ├── de.json                    # UI strings (nav, CTAs, labels)
│   └── en.json
├── i18n/
│   └── routing.ts                 # defineRouting({locales, defaultLocale})
├── experience/                    # ANIMATION RUNTIME (all "use client")
│   ├── ScrollProvider.tsx         # Lenis + ScrollTrigger wiring, single RAF
│   ├── capability.ts              # tier detection hook
│   ├── bridge.ts                  # scroll-progress store (DOM → 3D)
│   ├── sections/                  # HeroSection, CareerSection, ... (useGSAP)
│   └── three/                     # lazy-loaded R3F scene, only imported dynamically
├── components/                    # shared presentational (used by BOTH modes)
│   ├── ProjectCard.tsx
│   └── ContactBlock.tsx
└── lib/
```

### Structure Rationale

- **`content/` outside `app/`:** both modes and both locales import the same typed data — this is the load-bearing boundary that makes dual-mode cheap instead of a duplicated site.
- **`experience/` isolates the animation runtime:** everything GSAP/Lenis/three lives here; the overview route never imports from it, so route-level code splitting keeps the recruiter path lean automatically.
- **`experience/three/` only ever imported via `next/dynamic`:** guarantees three.js never lands in the initial bundle.
- **`components/` is mode-neutral:** a `ProjectCard` renders in the immersive story AND the overview grid; animation is applied from outside (GSAP targets via refs/scope), not baked in.

## Architectural Patterns

### Pattern 1: Single Scroll Authority

**What:** Exactly one system owns scroll position — Lenis — and everything else (ScrollTrigger, 3D scene, progress indicators) derives from it on one shared RAF loop.
**When to use:** Always, as soon as you combine smooth scroll + scroll-triggered animation + optional 3D.
**Trade-offs:** Slightly more setup than letting each library run its own loop; in exchange you eliminate the 1–2-frame jitter caused by libraries reading stale scroll values from separate `requestAnimationFrame` loops.

**Example:**
```tsx
// experience/ScrollProvider.tsx ("use client")
const lenisRef = useRef<LenisRef>(null);
useEffect(() => {
  const lenis = lenisRef.current?.lenis;
  lenis?.on('scroll', ScrollTrigger.update);
  const update = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(update);
  gsap.ticker.lagSmoothing(0);
  return () => gsap.ticker.remove(update);
}, []);
return <ReactLenis root options={{ autoRaf: false }} ref={lenisRef}>{children}</ReactLenis>;
```

### Pattern 2: Content-as-Data, Rendered by Both Modes

**What:** CV, projects, skills, contact are typed data structures (with a `de`/`en` field per text or per-locale files). The immersive story and the quick-facts overview are two *renderers* over the same data.
**When to use:** Any dual-mode or multi-audience site. This is the core enabler of the "30-second recruiter path" requirement.
**Trade-offs:** Requires designing the content schema before either mode; slightly constrains free-form immersive copy (long narrative passages live in MDX referenced from the schema).

**Example:**
```ts
// content/career.ts
export const career: CareerEntry[] = [{
  company: 'ITSC GmbH',
  role: { de: 'Systemadministrator', en: 'System Administrator' },
  period: { from: '2023-01', to: null },
  highlights: { de: [...], en: [...] },
}];
// Immersive: <CareerSection entries={career} />  (scroll-pinned timeline)
// Overview:  <CareerList entries={career} />     (plain scannable list)
```

### Pattern 3: Progressive Enhancement Tiers with a Capability Gate

**What:** The site works in three tiers — (1) static/reduced-motion, (2) GSAP-animated, (3) animated + lazy 3D — and a single gate decides the tier once, before any heavy bundle loads.
**When to use:** Whenever 3D or heavy animation is in scope and Core Web Vitals matter (they do here: recruiters bounce).
**Trade-offs:** Every section must have a non-animated final state (design constraint: animate *to* the layout, don't create layout *by* animation). Costs a bit of design discipline, buys accessibility, CWV, and a free reduced-motion story.

**Example:**
```tsx
const tier = useCapabilityTier(); // 'static' | 'animated' | 'full'
{tier === 'full' && <DynamicThreeScene />}   // next/dynamic, loads three.js only here
```

### Pattern 4: Scroll-Progress Bridge (DOM → 3D)

**What:** ScrollTrigger (DOM side) writes normalized progress into a mutable store; the R3F scene reads it inside `useFrame`. No React re-renders per frame, no second scroll listener.
**When to use:** Hybrid DOM+3D pages where HTML content and a WebGL background must stay in sync. Prefer this over drei's `ScrollControls` when GSAP owns the page — the two scroll systems conflict (ScrollControls creates its own scroll container, which breaks ScrollTrigger pinning).
**Trade-offs:** Gives up drei's convenient `useScroll` helpers; in exchange the whole page has one consistent scroll behavior and the 3D layer stays optional/removable.

**Example:**
```ts
// bridge.ts
export const scrollState = { heroProgress: 0 };           // mutable, no reactivity
// DOM side: ScrollTrigger onUpdate: self => scrollState.heroProgress = self.progress
// 3D side:  useFrame(() => { camera.position.z = lerp(5, 2, scrollState.heroProgress) })
```

## Data Flow

### Build-time / Request Flow

```
content/*.ts + messages/*.json
    ↓ (import, per locale via generateStaticParams)
[locale]/layout.tsx (hasLocale → setRequestLocale)
    ↓
RSC render: static HTML for de + en, both modes  →  Vercel CDN (SSG)
    ↓ (hydration, immersive route only)
Capability gate → tier → ScrollProvider mounts → sections register ScrollTriggers
```

### Runtime Scroll Flow (immersive mode)

```
wheel/touch input
    ↓
Lenis (single instance, autoRaf:false)
    ↓ on('scroll')                    ↓ gsap.ticker (one RAF loop)
ScrollTrigger.update() ──► section timelines (useGSAP scoped)
    ↓ onUpdate(progress)
scroll-progress bridge (mutable store)
    ↓ read in useFrame
R3F scene (frameloop="demand" or driven) → WebGL canvas
```

### Key Data Flows

1. **Locale switch:** `next-intl` `<Link>`/router swap to the other `[locale]` static page — full navigation, not client-side string swap. Animation state resets cleanly (ScrollTriggers are re-created per mount via `useGSAP` cleanup). Never re-measure ScrollTrigger positions mid-locale-swap.
2. **Mode switch:** persistent CTA navigates immersive → `/overview`. Because the overview route imports nothing from `experience/`, the recruiter path pays zero animation-bundle cost.
3. **Content update:** edit one file in `content/` → both locales, both modes, and SEO metadata update at next build. No CMS round-trip (CMS is a later, optional integration point).

## Suggested Build Order (dependency-driven)

1. **Content layer + i18n scaffold first.** Everything renders from `content/` and `messages/`; the `[locale]` routing shape is nearly impossible to retrofit cheaply. (Existing German content in the old repo's `src/content/` is raw material.)
2. **Quick-facts/overview mode second.** It's the cheapest complete vertical slice: validates the content schema, gives a shippable baseline on lsiem.de, and *is* the reduced-motion/static tier of Pattern 3 — the immersive mode's fallback exists before the immersive mode does.
3. **Scroll orchestration shell third.** ScrollProvider + capability gate + one proof section. This is the riskiest integration (Lenis/ScrollTrigger/React lifecycle); prove it before building many sections on top.
4. **Immersive sections fourth,** one at a time (hero → career → projects → about → contact), each a scoped `useGSAP` component against the already-final content.
5. **3D layer last.** It's optional by architecture (bridge pattern + capability gate); shipping without it must remain possible at every point.
6. **Performance hardening continuous,** with a gate before launch: Lighthouse/CWV budget on the immersive route, bundle-size check that `overview` contains no GSAP/three chunks.

## Scaling Considerations

Traffic scaling is irrelevant for a fully static personal site on Vercel's CDN. The real scaling axes:

| Scale axis | Architecture adjustments |
|-------|--------------------------|
| More content (7 → 20+ case studies) | Content layer already data-driven; move MDX to a content collection/CMS only when editing friction hurts — not before |
| More animation complexity | Keep the one-section-one-`useGSAP`-scope rule; extract shared timeline helpers, never a global god-timeline |
| More 3D | `frameloop="demand"` + `performance.regress()` + asset compression (draco/ktx2); if scene count grows, one persistent Canvas with scene switching, not multiple canvases |

### Scaling Priorities

1. **First bottleneck:** initial JS payload on the immersive route (GSAP + sections). Fix: route-level splitting already in the architecture; keep three.js dynamic-only.
2. **Second bottleneck:** ScrollTrigger refresh cost as section count grows (recalculating positions on resize/font-load). Fix: `ScrollTrigger.refresh()` once after fonts/images settle; avoid layout-affecting animations.

## Anti-Patterns

### Anti-Pattern 1: Two Scroll Authorities

**What people do:** Combine drei `ScrollControls` (for the 3D scene) with GSAP ScrollTrigger (for DOM sections), or let Lenis and ScrollTrigger each run their own RAF loop.
**Why it's wrong:** ScrollControls creates its own scroll container — ScrollTrigger pinning breaks, and separate RAF loops read stale scroll values (visible 1–2-frame jitter). Documented conflicts in both communities.
**Do this instead:** Lenis owns scroll; ScrollTrigger derives from it on the GSAP ticker; 3D reads progress via the bridge (Pattern 4).

### Anti-Pattern 2: Immersive Mode as the Only Content Renderer

**What people do:** Build the scroll story first with copy hard-coded into animated components, then bolt on a "recruiter view" that duplicates the content.
**Why it's wrong:** Content drifts between modes and locales (4 copies: 2 modes × 2 languages); the 30-second path becomes stale exactly when it matters.
**Do this instead:** Content-as-data (Pattern 2), overview mode built first as the schema's proving ground.

### Anti-Pattern 3: three.js in the Initial Bundle

**What people do:** Import the R3F Canvas statically in the hero so the 3D is "instantly there."
**Why it's wrong:** ~120kb+ of three.js in the critical path wrecks LCP/INP for every visitor, including the majority who'd bounce anyway; the LCP element ends up inside a canvas that renders late.
**Do this instead:** LCP element is real HTML (headline/portrait); Canvas loads via `next/dynamic` + capability gate, ideally after first paint or on viewport approach (IntersectionObserver).

### Anti-Pattern 4: Coupling Animation to Translated Text Metrics

**What people do:** Build timelines that depend on measured text sizes (split-text reveals, pinned sections sized to copy), then swap locale strings client-side.
**Why it's wrong:** German copy is routinely 20–30% longer than English; trigger positions and pinned heights measured for one locale break in the other.
**Do this instead:** Locale switch is a full navigation to the other static page (fresh mount → fresh measurement); design sections tolerant of variable text length; `ScrollTrigger.refresh()` after web fonts load.

### Anti-Pattern 5: No Escape Hatch from the Experience

**What people do:** Scroll-hijack the whole page with no visible skip, forcing recruiters through the story.
**Why it's wrong:** Directly violates this project's core value (facts in <30s); also an accessibility failure for reduced-motion users.
**Do this instead:** Persistent skip CTA from first paint; honor `prefers-reduced-motion` by defaulting those users toward the static tier/overview.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel (hosting, lsiem.de) | SSG output via `generateStaticParams` for both locales | next-intl's middleware does locale negotiation; with `localePrefix` and static pages this stays CDN-cacheable. Decide early: root `/` redirect vs. default-locale-unprefixed |
| Vercel Analytics / Speed Insights | Drop-in client component | Gives real-user CWV to enforce the performance budget post-launch |
| CMS (optional, later) | Behind the content layer only | Content-as-data means a CMS swap touches `content/` loaders, nothing else — defer until editing friction is real |
| AI-chat-over-CV (idea from PROJECT.md) | Separate API route/edge function; reads the same `content/` data | Fits the architecture without touching the experience layer; genuinely separable phase |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Content layer ↔ both modes | Direct typed imports (build time) | The invariant: no mode-specific content files |
| Rendering layer ↔ experience layer | RSC renders shells; client components hydrate inside | All GSAP/Lenis code is `"use client"`; never import experience code into `overview/` |
| Scroll orchestrator ↔ sections | GSAP context/`useGSAP` scope per section | Sections self-register ScrollTriggers, self-clean on unmount |
| DOM scroll ↔ 3D scene | Mutable bridge store, written by ScrollTrigger, read in `useFrame` | One-directional; keeps 3D deletable |
| i18n ↔ experience | None at runtime | Locale switch = navigation; animations must not read locale state |

## Sources

- GSAP React integration (useGSAP, context cleanup, contextSafe) — gsap.com/resources/React via context7 `/llmstxt/gsap_llms_txt` (MEDIUM)
- Lenis + ScrollTrigger single-RAF pattern — [lenis README](https://github.com/darkroomengineering/lenis), [GSAP forum: ScrollTrigger/Lenis sync patterns in React/Next](https://gsap.com/community/forums/topic/40426-patterns-for-synchronizing-scrolltrigger-and-lenis-in-reactnext/), [DevDreaming Next.js + Lenis guide (2026)](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap) (MEDIUM, cross-checked)
- R3F performance (`frameloop="demand"`, `performance.regress`) — pmndrs/react-three-fiber scaling-performance docs via context7 (MEDIUM)
- ScrollControls vs ScrollTrigger conflict — [GSAP forum thread](https://gsap.com/community/forums/topic/40114-scrolltrigger-pin-and-dreis-scrollcontrols-dont-play-well-together/), [drei issue #1986](https://github.com/pmndrs/drei/issues/1986) (MEDIUM)
- next-intl locale routing + static rendering — amannn/next-intl setup docs via context7 (MEDIUM)
- Framework comparison for animation-heavy sites — [Vercel: Next.js vs Astro 2026](https://vercel.com/i/astro-vs-next-js), [Contentful comparison](https://www.contentful.com/blog/astro-next-js-compared/), [CloudCannon](https://cloudcannon.com/blog/astro-vs-next-js/) (MEDIUM — vendor-adjacent, cross-checked)
- Performance budgets / capability gating / lazy 3D — [Motion.dev performance tier list](https://motion.dev/magazine/web-animation-performance-tier-list), [utsubo 100 three.js tips (2026)](https://www.utsubo.com/blog/threejs-best-practices-100-tips), [Gatsby three.js perf article](https://www.gatsbyjs.com/blog/performance-optimization-for-three-js-web-animations/) (LOW–MEDIUM)
- Dual-mode navigation examples — portfolio roundups ([techtidesolutions](https://techtidesolutions.com/rankings/web-developer-portfolio-examples/), [colorlib](https://colorlib.com/wp/developer-portfolios/), [reallygooddesigns](https://reallygooddesigns.com/developer-portfolio-examples/)); Bruno Simon / Jesse Zhou as immersive references (LOW — no single named industry pattern; the "escape hatch + shared content source" principle is synthesized)

---
*Architecture research for: immersive personal developer portfolio (lsiem.de rebuild)*
*Researched: 2026-07-02*
