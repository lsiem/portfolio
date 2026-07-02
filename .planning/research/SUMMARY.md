# Project Research Summary

**Project:** lsiem.de portfolio rebuild (rebuild #2)
**Domain:** Immersive, animation-first personal developer portfolio — bilingual DE/EN, dual-mode navigation, deployed on Vercel
**Researched:** 2026-07-02
**Confidence:** MEDIUM-HIGH (stack HIGH; features/architecture MEDIUM; pitfalls LOW-tier sources but cross-corroborated)

## Executive Summary

This is an immersive scroll-storytelling developer portfolio — the second rebuild after a first attempt that failed on three axes: generic design, thin content, and messy code. Research across all four dimensions converges on a clear diagnosis: the previous stack's libraries (GSAP, Lenis, R3F) were fine; the *frame* was wrong. A Vite SPA with two competing animation engines produced blank-shell LCP, no localized routes, and lifecycle spaghetti. Experts in 2026 build these sites as static-first meta-framework apps with exactly one animation engine, content defined once as typed data, and every heavy layer (3D especially) behind a capability gate.

The recommended approach: **Next.js 16 (App Router, SSG) + TypeScript + Tailwind 4 + GSAP 3.15 (now 100% free including all Club plugins) as the single animation engine + Lenis smooth scroll + next-intl for locale-prefixed DE/EN routes + optional lazy-loaded React Three Fiber 9**. Architecturally, the site is five layers with one strict rule: content is defined once (typed `content/` modules, per-locale) and both experience modes — the immersive default and a zero-animation recruiter "overview" mode — render from it. The overview mode is not a fallback; it is the structural differentiator that *permits* the immersive default to be aggressive, and it doubles as the `prefers-reduced-motion` tier.

The key risks are behavioral, not technical: effects-first-content-last (the "thin content" root cause), scrolljacking the recruiter path (violating the "facts in <30s" core value), preloader/canvas heroes destroying Core Web Vitals, and the rebuild never shipping. Mitigation is structural: write content before designing scenes, build the overview mode as the first vertical slice, keep the LCP element real server-rendered HTML, wire the performance budget and animation conventions into the foundation phase, and structure milestone 1 as a complete-but-visually-modest site live on lsiem.de before immersion phases begin.

## Key Findings

### Recommended Stack

A deliberate evolution of the discarded build: same animation ecosystem, new frame. Static-first Next.js fixes LCP/SEO/i18n structurally; one animation engine fixes the codebase feel. All versions verified against npm on 2026-07-02.

**Core technologies:**
- **Next.js 16.2.x**: meta-framework, SSG — fixes the SPA's blank-shell LCP, gives localized routes, first-class on Vercel
- **React 19.2.x — pin `~19.2.0`**: required by R3F 9 (peer range `>=19 <19.3`)
- **GSAP 3.15 + @gsap/react 2.1.2**: the single animation engine (timelines, ScrollTrigger, SplitText, Flip) — all plugins free since the Webflow acquisition; `useGSAP()` gives StrictMode-safe cleanup
- **Lenis 1.3.x**: smooth scroll wrapping *native* scroll (preserves sticky/anchors/a11y); driven from `gsap.ticker` in one RAF loop
- **next-intl 4.13.x**: locale-prefixed `/de` `/en` routes, verified Next 16 peer support
- **Tailwind CSS 4.3.x**: utility styling; keeps custom animation CSS small
- **three 0.185 + @react-three/fiber 9.6 + drei 10.7** (optional): only behind `next/dynamic`, never in the initial bundle
- **@vercel/analytics + speed-insights**: real-user CWV from day one

**Explicitly avoid:** Vite SPA, GSAP + Framer Motion together, Locomotive Scroll, ScrollMagic/AOS, R3F v8, WebGL canvas as the LCP element.

### Expected Features

The framing finding: **the site shell doesn't get you hired — the content inside does** (93% of hiring managers look at portfolios, but projects/case studies are what convert). And 2026's design meta rewards **one exceptional signature interaction + ruthless discipline everywhere else**, not stacked effects.

**Must have (table stakes):**
- Hero answering "who/what" in 5 seconds — identity never hidden behind an intro
- 5–7 projects, 2–3 as deep case studies (problem → decisions → outcome)
- Werdegang timeline, skills (no percentage bars), about, one-click contact, CV PDF download
- CWV-good load, designed mobile experience, full reduced-motion variant, accessibility, dark theme, DE/EN i18n with URL-based locales, SEO/OG/hreflang, cookieless analytics (GDPR), Impressum/Datenschutz

**Should have (competitive):**
- **Recruiter/overview mode** ("In Eile?") — THE structural differentiator; a designed first-class artifact, shared with reduced-motion
- One signature 3D/shader hero moment tied to Lasse's identity (not generic blobs)
- Scroll-storytelling Werdegang — where immersion serves content
- Disciplined micro-interactions; "how this site was built" meta case study (v1.x)
- AI chat over CV (v1.x — highest-value tech differentiator, needs content model live first)

**Defer (v2+):** Blog (only with a proven writing habit), sound design, additional 3D scenes, hosted CMS (anti-feature — the repo is the CMS).

### Architecture Approach

Five layers, one rule: content defined once, below everything; every mode renders from it. Immersive route and overview route are two renderers over the same typed `content/` data. The animation runtime lives in an isolated `experience/` directory the overview route never imports — route-level code splitting keeps the recruiter path free of GSAP/three automatically.

**Major components:**
1. **Content layer** (`content/` + `messages/{de,en}.json`) — single source of truth, per-locale typed data; feeds both modes, CV PDF, OG images, and later AI chat
2. **Rendering/i18n layer** — next-intl `[locale]` segment, `generateStaticParams` → fully SSG'd DE+EN pages
3. **Capability gate** — decides tier (static / animated / animated+3D) once per visit from reduced-motion + device heuristics
4. **Scroll orchestrator** — Lenis + ScrollTrigger on ONE shared RAF loop (single scroll authority); per-section `useGSAP` scoped timelines
5. **Scroll-progress bridge** — mutable store from ScrollTrigger `onUpdate` read in R3F `useFrame`; keeps the 3D layer optional and deletable
6. **Overview mode** — separate route, zero animation imports, doubles as reduced-motion tier

**Key anti-patterns:** two scroll authorities (drei ScrollControls + ScrollTrigger conflict), immersive mode as the only content renderer, three.js in the initial bundle, animation coupled to translated text metrics (German copy runs 20–30% longer), no escape hatch.

### Critical Pitfalls

1. **Effects-first, content-last** — write and gate case studies/Werdegang (DE+EN) *before* design locks; design reviews ask "does this scene reveal content?"
2. **Scrolljacking the recruiter path** — first viewport instantly informative; skip CTA visible from first paint; no scrolljacking on mobile; verify with a 30-second stopwatch UAT
3. **Preloader/canvas hero kills CWV** — LCP element is real static HTML; wow-layer lazy-loads after first paint; performance budget (LCP < 2.5s, initial JS < ~150KB gzip) enforced in CI from scaffolding
4. **Desktop WebGL on every device** — capability tiering, DPR cap ≤ 2, disposal discipline, `webglcontextlost` fallback; test on a real mid-tier Android (needs deeper research at that phase)
5. **Animation spaghetti / reduced-motion afterthought** — `useGSAP` exclusively, centralized motion-config tokens, motion tiers from day one; every section must render complete content with motion off
6. **Client-only i18n** — route-based locales from the start; complete hreflang sets incl. self-reference + x-default (structural rewrite if retrofitted)
7. **The rebuild that never ships** — milestone 1 = complete, bilingual, performant, visually modest site live on lsiem.de; immersion layered onto a live site

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Content & Narrative
**Rationale:** Both prior-failure root causes ("thin content") and every downstream feature (i18n, overview mode, scroll scenes, CV PDF, later AI chat) depend on finished, structured content. Scroll choreography rebuilt after content changes is wasted work.
**Delivers:** Written DE+EN case studies (7 → best 3–5), Werdegang narrative, skills/about/contact copy; a typed content schema.
**Addresses:** Deep case studies, up-to-date content (FEATURES P1).
**Avoids:** Pitfall 1 (effects-first, content-last) — content completeness is the gate to design.

### Phase 2: Foundation & i18n Scaffold
**Rationale:** `[locale]` routing shape and performance budget are nearly impossible to retrofit; conventions must exist before the first animated section.
**Delivers:** Next.js 16 + Tailwind 4 scaffold, next-intl routing (`/de`, `/en`, hreflang, sitemap), `content/` layer wired, analytics, Lighthouse CI with CWV budgets, Impressum/Datenschutz, deploy pipeline to Vercel.
**Uses:** Next.js 16, next-intl 4, Tailwind 4, pnpm, Vercel Analytics.
**Implements:** Content layer + rendering/i18n layer.
**Avoids:** Pitfalls 3 (CWV budget from day one) and 7 (client-only i18n).

### Phase 3: Overview Mode (Live-Minimal Milestone)
**Rationale:** Cheapest complete vertical slice; proves the content schema; IS the reduced-motion/static tier; puts a shippable site on lsiem.de early — the direct antidote to "the rebuild never ships."
**Delivers:** Full recruiter one-pager (who/what/skills/timeline/projects/contact/CV PDF) in both locales, dark theme, SEO/OG, mobile-designed. **Production deploy on lsiem.de by end of this phase.**
**Addresses:** Recruiter mode, CV PDF, all content table stakes.
**Avoids:** Pitfalls 2, 9.

### Phase 4: Design Direction & Animation Infrastructure
**Rationale:** A distinctive concept must be derived from identity/content before implementation (or "generic" repeats); animation conventions must precede animated sections (or "messy code" repeats).
**Delivers:** Written one-sentence design concept, visual system; ScrollProvider (Lenis + ScrollTrigger single-RAF), capability gate, motion-config tokens, `gsap.matchMedia()` reduced-motion wiring, one proof section.
**Uses:** GSAP 3.15, @gsap/react, Lenis (the riskiest integration — prove it once, early).
**Avoids:** Pitfalls 5, 6, 8.

### Phase 5: Immersive Sections
**Rationale:** Sections build one at a time on proven infrastructure against final content: hero → Werdegang scroll-story → projects → about → contact.
**Delivers:** The immersive default experience with micro-interactions and transitions; mobile-designed variants; skip CTA persistent from first paint.
**Avoids:** Pitfall 2 (recruiter path stays one click away throughout).

### Phase 6: Signature 3D/WebGL Moment (optional by architecture)
**Rationale:** Last because the bridge pattern + capability gate make it deletable; shipping without it must remain possible at every point.
**Delivers:** Lazy R3F scene (`next/dynamic`, `frameloop="demand"`, DPR clamp, Draco/KTX2, disposal + context-lost fallback), driven by the scroll-progress bridge.
**Avoids:** Pitfall 4 — tiering and disposal are entry requirements, not polish.

### Phase 7: Hardening, UAT & Launch Polish
**Rationale:** Verification of every research-flagged claim before calling it done.
**Delivers:** Lighthouse mobile audit on the prod URL, 30-second stopwatch test with external viewers, "whose site is this?" design test, reduced-motion walkthrough, hreflang/curl verification, real mid-tier Android test, "looks done but isn't" checklist cleared.

### v1.x (post-launch backlog, explicitly not milestone 1)
AI chat over CV (server route, rate-limited, RAG over `content/`), meta case study, `npx lsiem` CLI card, easter eggs, GitHub stats, `/uses` and `/now`.

### Phase Ordering Rationale

- **Content → schema → overview → immersion** follows the hard dependency chain found in FEATURES and ARCHITECTURE: everything consumes the same structured content, and the overview mode is the immersive mode's fallback — it must exist first.
- **Live-minimal milestone (end of Phase 3)** directly implements the PITFALLS recommendation for defeating the "never ships" meta-pitfall.
- **Animation infrastructure before animated sections** prevents both root causes of rebuild #1's "messy code" and the reduced-motion retrofit trap.
- **3D last and optional** — the architecture (bridge + gate + lazy chunk) is explicitly designed so cutting 3D costs nothing.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 6 (3D/WebGL):** device-tiering strategy, asset pipeline (Draco/KTX2), context-loss handling for the chosen scene concept — PITFALLS explicitly flags this
- **Phase 3 (CV PDF generation):** generating a designed PDF from the content model — no pattern verified in research
- **v1.x AI chat:** RAG design, guardrails, GDPR logging, cost caps — full research phase when scheduled

Phases with standard patterns (skip research-phase):
- **Phase 2 (Foundation/i18n):** next-intl + SSG is thoroughly documented; integration recipe already captured in STACK/ARCHITECTURE
- **Phase 4 (Animation infra):** Lenis + ScrollTrigger single-RAF pattern is documented verbatim in research with code
- **Phase 5 (Sections):** standard useGSAP/ScrollTrigger work following Phase 4 conventions

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions/peer ranges verified against npm 2026-07-02; GSAP licensing cross-verified official sources. Next-vs-Astro judgment is MEDIUM but defensible |
| Features | MEDIUM | Hiring-manager survey + award-site analysis are strong; individual differentiator ideas are inspiration-grade |
| Architecture | MEDIUM | Library integration patterns from curated docs; dual-mode pattern is synthesized (no single named industry pattern) but internally consistent |
| Pitfalls | MEDIUM | Web-tier sources, but every critical claim corroborated by 2+ independent sources incl. NN/g primary research and official GSAP docs |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **React `~19.2.0` pin:** R3F 9's `<19.3` upper bound will break on a future React 19.3 — re-verify peer ranges at Phase 2 scaffold time
- **CSS scroll-driven animations browser support:** Firefox still partial/flagged per research — re-verify at Phase 4/5 if used as progressive enhancement
- **CV PDF from content model:** no verified pattern; resolve during Phase 3 planning
- **Signature moment concept:** research says it must be identity-derived, but the concept itself is a design decision — Phase 4 design-direction work, not research
- **gsd-tools research seams unavailable** during STACK research (`Unknown command`); confidence tiers were applied manually — no impact on findings

## Sources

### Primary (HIGH confidence)
- npm registry (`npm view`, 2026-07-02) — all versions and peer ranges
- gsap.com/pricing + Webflow announcement — GSAP fully free
- nextjs.org/blog/next-16 + upgrade guide — framework features

### Secondary (MEDIUM confidence)
- GSAP/Lenis/next-intl/R3F docs (partly via context7) — integration patterns, single-RAF sync, `useGSAP` cleanup, `frameloop="demand"`
- NN/g Scrolljacking 101 — recruiter-path usability (primary research, fetched)
- profy.dev 60+ hiring-manager survey — content > shell
- Awwwards/Metabole/Codrops analyses — 2026 design meta, award-site patterns
- GSAP forums + three.js forums — ScrollTrigger leaks, ScrollControls conflict, WebGL context loss

### Tertiary (LOW confidence)
- Portfolio roundups, differentiator write-ups (npx card, terminal portfolio) — inspiration-grade, validate per feature

---
*Research completed: 2026-07-02*
*Ready for roadmap: yes*
