<!-- GSD:project-start source:PROJECT.md -->

## Project

**Portfolio Neubau — lsiem.de**

Ein kompletter Neubau des persönlichen Portfolios von Lasse Siemoneit (lsiem.de) — als immersives, spektakuläres Web-Erlebnis, das als berufliche Visitenkarte Recruiter, Tech-Leads und ein breites Publikum beeindruckt. Der bestehende Rewrite (React/Vite/GSAP-SPA) wird verworfen; Konzept, Design, Inhalte und Stack werden von Grund auf neu gedacht.

**Core Value:** Wer die Seite besucht, sagt "wow" — und findet trotzdem in unter 30 Sekunden die Fakten (wer, was, Kontakt), wenn er es eilig hat.

### Constraints

- **Hosting**: Vercel + Domain lsiem.de — bestehende Infrastruktur weiternutzen
- **Sprache**: Inhalte zweisprachig DE/EN — internationale Tech-Leads erreichen
- **Performance**: Immersion darf Ladezeit und Core Web Vitals nicht ruinieren — Recruiter springen sonst ab
- **Tech stack**: Bewusst offen — wird durch Recherche-Phase entschieden, keine Vorfestlegung

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommendation in One Sentence

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 16.2.x (16.2.10 latest, verified npm 2026-07-02) | Meta-framework: SSG/PPR, routing, image & font optimization | Fixes the previous build's core weakness (Vite SPA = blank-shell LCP, weak SEO, no localized routes). Static-prerendered HTML gives excellent Core Web Vitals *despite* heavy client animation. Turbopack is the stable default bundler (2–5x faster builds); React Compiler support is stable (auto-memoization = fewer animation-triggered re-renders). First-class on Vercel — the mandated host. |
| **React** | 19.2.x (19.2.7) — **pin `~19.2.0`** | UI runtime | Required by R3F 9 (peer range `>=19 <19.3` — see Version Compatibility). React is non-negotiable once optional 3D is in scope: React Three Fiber has no ecosystem equal outside React. |
| **TypeScript** | 6.0.x (6.0.3 latest) | Type safety | Current stable major. If any tooling in the chain rejects TS 6, fall back to 5.9.x — no code changes needed at this project's level. |
| **GSAP** | 3.15.0 | The animation engine: timelines, ScrollTrigger, SplitText, Flip | **100% free since April 2025 (Webflow acquisition), including ALL formerly-paid Club plugins** — ScrollTrigger, SplitText, ScrollSmoother, MorphSVG, DrawSVG, Inertia — for commercial use ([gsap.com/pricing](https://gsap.com/pricing/), [Webflow announcement](https://webflow.com/blog/gsap-becomes-free)). Undisputed standard for scroll-storytelling and complex timeline choreography — exactly this project's center of gravity. Verified license field on npm: "Standard 'no charge' license". |
| **@gsap/react** | 2.1.2 | `useGSAP()` hook | Official React integration: automatic cleanup/scoping via `gsap.context()`, StrictMode-safe. Eliminates the manual-lifecycle mess that made the old codebase feel unclean. |
| **Lenis** | 1.3.25 | Smooth/lerped scroll | The 2026 standard (darkroom.engineering). Wraps *native* scroll, so `position: sticky`, anchor links, keyboard nav, and accessibility keep working — unlike transform-based smoothers. Pairs with ScrollTrigger via `gsap.ticker` (see Integration Notes). |
| **Tailwind CSS** | 4.3.x (4.3.2) | Styling | CSS-first config, container queries, tiny runtime cost. v4 is mature (released Jan 2025, now on 4.3). Utility styling keeps custom animation CSS (the actual craft here) separate and small. |
| **next-intl** | 4.13.x (4.13.1) | DE/EN i18n | The de-facto App Router i18n library. Locale-prefixed routes (`/de`, `/en`) = indexable, shareable, hreflang-correct bilingual pages — verified peer support for `next ^16.0.0`. |

### 3D Layer (optional, load-on-demand)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **three** | 0.185.x (0.185.1) | WebGL engine | Only if the design calls for a 3D hero/scene. Always behind `next/dynamic` + lazy mount so it never blocks LCP. |
| **@react-three/fiber** | 9.6.x (9.6.1) | React renderer for three.js | Standard declarative 3D in React. v9 is the React 19 line. |
| **@react-three/drei** | 10.7.x (10.7.7) | R3F helpers (cameras, controls, text, environment) | Whenever R3F is used — avoids reimplementing staples. |
| **@react-three/postprocessing** | 3.0.x (3.0.4) | Bloom, DoF, grain effects | Only for hero-scene polish; each pass costs GPU frame budget. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **motion** (formerly Framer Motion) | 12.x (12.42.2) | Declarative React animations | **Deliberately NOT in the default stack** — see "What NOT to Use". Add only if a specific need (e.g., `AnimatePresence` exit animations for the language/overlay UI) proves painful in GSAP Flip. One engine keeps the codebase clean. |
| **@vercel/analytics** / **@vercel/speed-insights** | latest | Real-user Core Web Vitals monitoring | From day one — the "wow without ruining CWV" constraint needs field data, not just Lighthouse. |
| **zod** | 4.x | Content/schema validation | If content is typed frontmatter/JSON (recommended for bilingual content files). |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **pnpm** | Package manager | Fast, strict; standard for 2026 Next.js projects. |
| **ESLint 9 + eslint-config-next** | Linting | Flat config; ships with `create-next-app`. |
| **Prettier** | Formatting | With `prettier-plugin-tailwindcss` for class sorting. |
| **Lighthouse CI / `@vercel/speed-insights`** | CWV budget enforcement | Set budgets early (LCP < 2.5s, INP < 200ms) — retrofitting performance onto an immersive site fails. |

## Installation

# Scaffold (Turbopack + Tailwind 4 + TS are defaults)

# Animation core

# i18n

# 3D (only when the design commits to it)

# Monitoring

## Integration Notes (load-bearing details)

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 16 | **Astro 7** | If 3D were dropped and the site were mostly-static with island animations, Astro's near-zero JS baseline gives the best raw CWV, and Astro + GSAP is a proven Awwwards-tier combo ([Codrops case study, Feb 2026](https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/)). Rejected here because (a) optional 3D pulls in React islands anyway, at which point Next's integrated model is simpler, (b) next-intl's bilingual routing/formatting story is more complete, and (c) **Astro 7.0 shipped 2026-06-22 — 10 days old, with a full Rust compiler rewrite**; early-major risk on a solo project. Astro 6 (Mar 2026) would be the safer Astro pick. |
| GSAP (single engine) | **Motion 12** (motion.dev) | If the site were primarily state-driven UI transitions (spring physics, layout animations, exit animations) rather than scroll choreography. Motion is MIT, smaller when tree-shaken, and hardware-accelerates via WAAPI. For scroll-storytelling, ScrollTrigger's scrubbing/pinning/snapping is materially stronger ([Motion's own comparison](https://motion.dev/docs/gsap-vs-motion)). |
| Lenis | **GSAP ScrollSmoother** (now free) | If you want effects-per-element (`data-speed`, parallax lag) with zero sync code. Rejected as default: it replaces native scrolling with a transformed fixed container, degrading `position: sticky`, anchors, and assistive-tech behavior; Lenis preserves native scroll semantics. |
| Lenis | **Pure CSS scroll-driven animations** | For simple reveal/progress effects they're compositor-thread and free. Not sufficient as the primary system in 2026: Firefox support is still partial/flagged; `animation-trigger` is Chrome-only. Use as progressive enhancement, GSAP as the reliable cross-browser base. |
| React Three Fiber | **Vanilla three.js** | Inside an Astro/vanilla stack, or for a single non-reactive canvas scene where you want zero abstraction. In a React app, R3F + drei is strictly more productive. |
| next-intl | **Paraglide JS / hand-rolled dictionaries** | Paraglide compiles messages to tree-shaken functions (smallest runtime). For exactly two locales, next-intl's routing + formatting integration outweighs the bytes saved. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Vite React SPA (previous architecture)** | Client-rendered blank shell = poor LCP/SEO, no localized routes, everything ships in one JS bundle. This was the discarded build's structural flaw. | Next.js 16 SSG |
| **Two animation engines (GSAP + Framer Motion together, as before)** | Overlapping responsibilities, two mental models, doubled bundle, and the "unclean codebase" feeling the user is escaping. GSAP alone now covers timelines, scroll, text-splitting, and FLIP layout transitions — free. | GSAP 3.15 only; add `motion` later only for a proven gap |
| **`framer-motion` package name** | Renamed; `framer-motion@12.42.2` is a compatibility alias of `motion`. New code should not use the old import. | `motion` (if used at all) |
| **Locomotive Scroll** | Effectively superseded; community and new work moved to Lenis (same studio lineage, native-scroll approach). | Lenis 1.3.x |
| **ScrollMagic / AOS / wow.js** | Legacy scroll libraries, stale maintenance, main-thread listener patterns. | GSAP ScrollTrigger (+ CSS scroll-driven animations as enhancement) |
| **Gatsby / Create React App** | Both effectively dead for new projects in 2026. | Next.js 16 |
| **React Three Fiber v8** | Pre-React-19 line; incompatible with this stack. | @react-three/fiber ^9 |
| **Heavy WebGL as LCP element** | Canvas hero as the largest paint = LCP disaster; also drains mobile batteries. | Static/SSG hero with progressive canvas mount behind interaction/idle |

## Stack Patterns by Variant

- Use R3F 9 + drei 10 with a dedicated lazy chunk, `<Canvas frameloop="demand">` where possible, and DPR clamping (`dpr={[1, 1.5]}`).
- Because uncapped pixel ratio + always-on render loop is the #1 INP/battery killer on immersive sites.
- Drop three/R3F entirely; GSAP + SplitText + Flip + Lenis + CSS scroll-driven enhancements carry the whole experience.
- Because the wow factor of top portfolios in 2026 is mostly choreography and typography, not WebGL — and CWV headroom grows massively.
- Add Next.js route handlers (+ Vercel AI SDK for the chat) — no architecture change needed.
- Because the static-first Next app already has the server seam; an Astro or SPA choice would make this a bigger lift.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| @react-three/fiber 9.6.1 | react `>=19 <19.3` | **Pin React `~19.2.0`.** The upper bound `<19.3` means a future React 19.3 will break install until fiber widens the range (verified from npm peerDependencies 2026-07-02). |
| @react-three/drei 10.7.7 | @react-three/fiber `^9`, three `>=0.159`, react `^19` | three 0.185.1 ✓ |
| next-intl 4.13.1 | next `^16.0.0`, react `^19` | Verified peer range includes Next 16 ✓ |
| @gsap/react 2.1.2 | gsap `^3.12.5`, react `>=17` | ✓ |
| tailwindcss 4.3.2 | Next 16 via `@tailwindcss/postcss` | Default in current `create-next-app` |
| Node.js | ≥ 20.x for Next 16 (Astro 7 would require ≥ 22.12) | Vercel default runtime fine |

## Confidence Assessment

| Claim | Confidence | Basis |
|-------|------------|-------|
| All version numbers & peer ranges | HIGH | npm registry, queried 2026-07-02 |
| GSAP 100% free incl. all plugins | HIGH | gsap.com/pricing, Webflow official blog, npm license field — cross-verified |
| Next.js 16 features (Turbopack default, stable React Compiler, Cache Components) | HIGH | nextjs.org/blog/next-16 + docs |
| Next.js over Astro for *this* project | MEDIUM | Judgment call from verified facts (R3F needs React; next-intl maturity; Astro 7 age). Reasonable people could pick Astro 6. |
| Lenis over ScrollSmoother (accessibility rationale) | MEDIUM-HIGH | Lenis README + multiple independent comparisons; consistent across sources |
| CSS scroll-driven animations not yet cross-browser-safe as primary | MEDIUM | caniuse/MDN via search (Firefox partial/flagged); re-verify at implementation time |

## Sources

- npm registry (`npm view`, 2026-07-02) — latest versions, peerDependencies, release timestamps for next, react, gsap, @gsap/react, motion, lenis, three, @react-three/fiber, @react-three/drei, next-intl, tailwindcss, astro, typescript — HIGH
- [GSAP Pricing](https://gsap.com/pricing/) + [Webflow: GSAP becomes free](https://webflow.com/blog/gsap-becomes-free) — licensing — HIGH
- [Next.js 16 release blog](https://nextjs.org/blog/next-16) + [v16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16) — framework features — HIGH
- [Astro 7.0 announcement](https://astro.build/blog/astro-7/) (released 2026-06-22) — Rust compiler, Vite 8, Node ≥22.12 — HIGH (currency), MEDIUM (stability judgment)
- [Motion: GSAP vs Motion](https://motion.dev/docs/gsap-vs-motion) + [LogRocket React animation libraries 2026](https://blog.logrocket.com/best-react-animation-libraries/) — engine comparison — MEDIUM
- [Lenis GitHub](https://github.com/darkroomengineering/lenis) + [Zun Creative: ScrollSmoother vs Lenis](https://zuncreative.com/blog/smooth_scroll_meditation/) + [DevDreaming Next.js+Lenis+GSAP guide](https://devdreaming.com/blogs/nextjs-smooth-scrolling-with-lenis-gsap) — smooth-scroll tradeoffs & sync pattern — MEDIUM-HIGH
- [MDN scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations) + [caniuse animation-timeline](https://caniuse.com/mdn-css_properties_animation-timeline_scroll) — browser support — MEDIUM
- [Codrops: Astro + GSAP portfolio build (Feb 2026)](https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/) — ecosystem practice — MEDIUM

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
