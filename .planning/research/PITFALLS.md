# Pitfalls Research

**Domain:** Immersive / animation-heavy personal developer portfolio (second rebuild of lsiem.de)
**Researched:** 2026-07-02
**Confidence:** LOW per provider tier (web search / web fetch), but findings are cross-corroborated across multiple independent sources, including NN/g primary usability research, official GSAP docs, and three.js maintainer forums. Treat directional claims as reliable, specific numbers as approximate.

**Framing:** The first rebuild failed on three axes — generic design, thin content, messy code. Every pitfall below is annotated with which failure axis it feeds. A second rebuild that ignores these repeats the first one with a nicer stack.

## Critical Pitfalls

### Pitfall 1: Effects-First, Content-Last (the "thin content" root cause)

**What goes wrong:**
The build starts with the hero animation, the 3D scene, and the scroll choreography. Content (case studies, Werdegang, Über-mich) gets written last, under time pressure, to fill the already-designed layout. Result: spectacular shell, placeholder-grade substance — exactly the "Inhalte zu dünn" verdict on rebuild #1. Hiring-manager surveys consistently find that 3–5 deep, well-documented projects beat 10 shallow ones, and that case-study depth is what separates senior from junior portfolios. A great design with mediocre content loses to a mediocre design with great content.

**Why it happens:**
Animation work is fun and visually rewarding; writing honest case studies about ITSC, Just Relate, and Vidama is hard and unglamorous. The layout also constrains the content ("this panel fits ~40 words"), so content gets trimmed to fit the design instead of the design serving the content.

**How to avoid:**
Make content a first-class phase that completes *before* visual design locks. Write full DE case studies (problem → constraints → decisions → outcome → what I'd do differently) for the ~7 projects, prune to the best 3–5, and only then design the immersive presentation *around* that material. Design reviews should ask "does this scene reveal content?" not "does this look cool?"

**Warning signs:**
- Lorem ipsum or single-sentence project blurbs surviving past the design phase
- Case studies that describe *what the project is* but not *what Lasse decided/built/learned*
- Animation tickets outnumbering content tickets 5:1 in the roadmap

**Phase to address:**
Dedicated early Content/Narrative phase (before design direction); content completeness as an explicit gate for the design phase.

---

### Pitfall 2: Scrolljacking the Recruiter Path

**What goes wrong:**
Scroll-storytelling overrides native scroll (Lenis/GSAP scrub, pinned sections, horizontal panels). NN/g usability testing found the majority of users experience disorientation from scrolljacking, some interpret it as a *bug*, and — critically — task-oriented users (recruiters scanning for facts) have far less tolerance than exploratory visitors. All problems amplify on mobile. This directly attacks the core value: "Fakten in unter 30 Sekunden."

**Why it happens:**
Scroll-driven narrative is the defining pattern of awwwards-style sites, and it demos beautifully when the *author* scrolls at the intended pace. Real users scroll fast, backwards, and mid-animation.

**How to avoid:**
Follow the NN/g guidelines: keep scrolljacked sequences short; keep them below the fold (the first viewport must be instantly informative); never change scroll direction unexpectedly; keep important text out of scrubbed sections; always provide a sticky nav / skip control as escape route; and skip scrolljacking on mobile entirely. The planned "Skip/Überblick" mode must be discoverable within the first screen, not hidden at the end of the story.

**Warning signs:**
- Name, role, and contact are not visible/reachable within ~5 seconds without playing the story
- Testers scroll backwards to re-read text that animated away
- The mobile build reuses desktop scroll choreography

**Phase to address:**
UX architecture / information design phase (recruiter path designed first, immersive layer added on top); verified again in a UAT phase with a stopwatch test.

---

### Pitfall 3: Preloader and Hero Animation Destroy Core Web Vitals

**What goes wrong:**
A loading screen ("EXPERIENCE LOADING… 73%") plus a JS-rendered hero pushes LCP past 4s and long main-thread animation tasks wreck INP. Recruiters bounce (sub-3s load expectation is the common bar in hiring-manager guidance), and the PROJECT.md constraint "Immersion darf Ladezeit nicht ruinieren" is violated on day one. Preloaders are especially insidious: they *are* the LCP element being delayed by design.

**Why it happens:**
The immersive scene needs assets (3D models, textures, fonts), so a preloader feels like the honest solution. And in a client-rendered SPA, nothing meaningful paints until the JS bundle executes — the architecture forces the problem.

**How to avoid:**
Render the first viewport (name, role, nav, key facts) as server-rendered/static HTML that paints immediately; treat it as the LCP element and preload its assets. Lazy-load the 3D/animation layer *after* first paint and enhance progressively — the page must be fully useful before the wow-layer arrives. Prefer compositor-friendly CSS/WAAPI for entrance animation; keep GSAP/WebGL off the critical path. Set an explicit performance budget (e.g., LCP < 2.5s on mid-tier mobile, initial JS < ~150KB gzip) and enforce it in CI (Lighthouse CI).

**Warning signs:**
- Any full-screen preloader in the design mockups
- Hero content only exists inside a `<canvas>` or is injected by JS
- Lighthouse mobile score checked "later" instead of per-PR

**Phase to address:**
Stack/architecture decision phase (SSR/SSG capability is a selection criterion); performance budget wired into the very first scaffolding phase, not retrofitted.

---

### Pitfall 4: Shipping Desktop WebGL to Every Device

**What goes wrong:**
The 3D scene runs unconditionally on mobile: WebGL context loss on iOS/Android under memory pressure (a top recurring three.js forum topic), battery drain, thermal throttling, sub-20fps scrub animations. Since ~68% of initial portfolio views are mobile, most first impressions get the *worst* version of the site. Undisposed geometries/materials/textures leak GPU memory across route changes (a single 4K texture is 64MB+ VRAM), eventually killing the tab.

**Why it happens:**
Development happens on an M-series Mac where everything runs at 120fps. Disposal discipline (`geometry.dispose()`, `material.dispose()`, `texture.dispose()`, closing ImageBitmaps) is invisible until it fails in production.

**How to avoid:**
Tier the experience by device capability: detect GPU/memory class and `prefers-reduced-motion`, then serve full 3D / lightweight 2D animation / static tiers. Cap pixel ratio (`Math.min(devicePixelRatio, 2)`), compress assets (Draco/KTX2), target <100 draw calls, monitor `renderer.info.memory` during development, and handle the `webglcontextlost` event with a graceful static fallback. Test on a real mid-tier Android phone before any 3D work is called done.

**Warning signs:**
- `renderer.info.memory` counts grow across navigation
- No `webglcontextlost` handler anywhere in the codebase
- QA checklist has no physical mobile device on it

**Phase to address:**
Immersive/3D implementation phase — capability tiering and disposal patterns are *entry* requirements for that phase, not polish. Flag this phase for deeper research (needs concrete device-tiering strategy for the chosen stack).

---

### Pitfall 5: `prefers-reduced-motion` as an Afterthought

**What goes wrong:**
Motion accessibility is bolted on at the end, when every section is a hand-tuned timeline. Retrofitting then means rewriting the animation layer, so it gets skipped — leaving users with vestibular disorders (dizziness, nausea from parallax/scroll motion) with an unusable site, and leaving an accessibility hole in a portfolio that is itself a work sample.

**Why it happens:**
Animations are authored as the *only* rendering path; there is no "no-motion" representation of each section to fall back to. GSAP requires manual handling (`gsap.matchMedia()`), unlike Motion's built-in `MotionConfig reducedMotion` — so with GSAP-style stacks it's pure discipline.

**How to avoid:**
Define three motion tiers from day one — full / reduced / none — and require every section to render complete content in the "none" tier (this doubles as the recruiter skip-mode and the SSR fallback, one architecture solving three requirements). Wire `prefers-reduced-motion` via `gsap.matchMedia()` (or the stack's equivalent) at the animation-system level, not per component. Add a visible motion toggle in the UI — system preference alone is not enough because many affected users never discover the OS setting.

**Warning signs:**
- Content invisible (opacity 0) until an animation reveals it — with reduced motion it would simply never appear
- No global motion-preference abstraction; each component queries media directly or not at all
- The reduced-motion path is tested by nobody

**Phase to address:**
Animation infrastructure phase (the motion-tier abstraction is part of the foundation); verified in accessibility/UAT phase.

---

### Pitfall 6: Animation Spaghetti (the "messy code" root cause)

**What goes wrong:**
Every component owns its own GSAP timelines, ScrollTriggers, scroll/resize listeners, and magic numbers. ScrollTriggers aren't killed on unmount (scrubbed ones leak memory notoriously); React Strict Mode double-invokes effects and duplicates animations; resize breaks pinned sections; changing one section's timing breaks three others. This is precisely the "Codebasis unsauber" failure of rebuild #1, and it compounds: by the end, nobody dares touch the animation code.

**Why it happens:**
Animations get added incrementally per section with no shared conventions. Raw `useEffect` + GSAP is the path of least resistance and fails silently in Strict Mode. Scroll choreography intrinsically couples sections (pin offsets shift everything below), but the code pretends they're independent.

**How to avoid:**
Establish animation architecture conventions *before* the first animated section: use the official integration hook (`useGSAP` / equivalent) exclusively — never raw effects; every animation lives inside a scoped context with automatic `revert()` cleanup; event handlers wrapped with `contextSafe`; timing/easing tokens centralized in one motion-config module; scroll orchestration (section order, pin lengths) owned by one coordinator, with sections exposing declarative animation definitions. Code-review rule: any PR adding a ScrollTrigger must show its cleanup.

**Warning signs:**
- Animations play twice in dev (Strict Mode double-fire — cleanup is broken)
- Duplicated easing/duration literals across components
- Resizing the window breaks pinned/scrubbed sections
- Fear of refactoring any animated component

**Phase to address:**
Foundation/scaffolding phase (conventions + motion-config module exist before feature phases); enforced via code review in every animation phase.

---

### Pitfall 7: Client-Only i18n That Search Engines and Users Can't Reach

**What goes wrong:**
The DE/EN switcher swaps strings in JS on one URL. Consequences: Google can't index the English version (no unique per-locale URLs), hreflang is missing or wrong so German recruiters land on English pages and vice versa, shared links open in the sharer's language not the reader's, and SSR/CSR locale detection mismatches cause hydration errors or a flash of the wrong language. Missing `x-default` and missing self-referencing hreflang entries are the most common mistakes and cause Google to ignore the entire hreflang set.

**Why it happens:**
Client-side string swapping is the easiest i18n to implement in a SPA, and the SEO damage is invisible until months later in Search Console.

**How to avoid:**
Route-based locales from the start (`lsiem.de/de/…`, `lsiem.de/en/…` or equivalent), server-rendered per locale. Emit complete hreflang sets (every locale referencing all variants *including itself*, plus `x-default`). Never emit hreflang/sitemap entries for pages that merely fall back to the other language — translate fully or don't list it. Locale switcher links to the *same page* in the other locale, as a real `<a href>`. Treat i18n as an architectural property of the routing layer, chosen with the stack — retrofitting route-based i18n into a finished SPA is a structural rewrite.

**Warning signs:**
- Language switch doesn't change the URL
- `curl` of any page returns only one language regardless of path
- Hydration warnings mentioning text content mismatch

**Phase to address:**
Stack/architecture decision phase (i18n routing support is a stack selection criterion); implemented in the routing/foundation phase, not as a late feature.

---

### Pitfall 8: Awwwards-Mimicry Produces "Generic" Again

**What goes wrong:**
Rebuild #1 was judged "generisch" — the trap now is swapping one genre of generic (template portfolio) for another (awwwards clone: dark theme, huge serif display type, marquee text, 3D blob, cursor follower). These tropes are so widespread that an immersive site built from them is as interchangeable as a Bootstrap template. Cookie-cutter case-study structure without unique contributions has the same effect on the content side.

**Why it happens:**
Inspiration browsing (awwwards, godly.website) converges everyone on the same current meta. Copying interaction patterns is much easier than deriving a design from one's own identity and material.

**How to avoid:**
Run an explicit design-direction phase that starts from *content and identity* — self-taught full-stack + DevOps, sysadmin-to-CTO arc, German pragmatism — and derives a distinctive visual concept from it, before looking at inspiration sites. Write down the concept in one sentence ("the site is a ___"); if the sentence would fit any developer, iterate. Use inspiration only to steal *craft quality*, never whole patterns. A useful test: screenshot the hero, cover the name — could a reviewer tell whose site this is or at least that it isn't a template?

**Warning signs:**
- The design brief lists reference sites but no personal concept
- Every design decision justifies itself with "site X does this"
- Feedback like "looks professional" but never "looks like *you*"

**Phase to address:**
Design-direction/concept phase, gated before implementation; revisit at UAT ("wow" check with real external viewers).

---

### Pitfall 9: The Rebuild That Never Ships

**What goes wrong:**
Scope creep plus perfectionism: the immersive concept grows (AI chat over the CV, blog, CMS, more scenes), nothing is ever "wow enough", and the rebuild joins the first one as an unfinished artifact while the old site stays live. Personal projects are maximally exposed to this because there's no external deadline and the builder is also the client. This is the meta-pitfall: a portfolio 80% as spectacular but *live on lsiem.de* beats a perfect one at 60% completion.

**Why it happens:**
Immersive sites have unbounded polish surface (every easing can be tuned forever). Second rebuilds carry extra pressure — "this time it must be perfect" — which raises the bar and stalls shipping.

**How to avoid:**
Structure the roadmap in shippable vertical slices: an early milestone that puts a complete, content-full, performant, bilingual — but visually modest — site live on lsiem.de, then layer immersive phases on top of a live site. Timebox polish per section. Park ideas (AI chat, CMS, blog) in a backlog with explicit "not this milestone" status. Definition of done per phase is written before the phase starts.

**Warning signs:**
- Weeks of commits with nothing deployed to production
- Reopening "done" sections for another polish pass while later phases are untouched
- The requirement list growing mid-milestone

**Phase to address:**
Roadmap structure itself (milestone 1 = live minimal site; immersion = subsequent milestones/phases). This is a planning decision, not an implementation task.

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Client-only i18n string swap | Ships fast | Uncrawlable EN site, hreflang rewrite = routing rewrite | Never (routing-level from day 1) |
| Skipping ScrollTrigger cleanup ("page never unmounts") | Less boilerplate | Leaks + double animations the moment routing/Strict Mode is involved | Never |
| Hardcoding animation values per component | Fast per-section iteration | Incoherent motion feel; global retiming impossible | Only in throwaway prototypes |
| Building desktop-first, "adapt mobile later" | Desktop demo looks great | Scroll choreography rarely translates; mobile becomes a broken port of desktop | Never for this project (~68% mobile first views) |
| Full-screen preloader to hide asset loading | Simple asset management | LCP catastrophic; recruiters bounce | Never; progressive enhancement instead |
| Copying content from old site "as placeholder" | Sections fill up quickly | Placeholders ossify → "thin content" verdict repeats | Only if content phase is already scheduled and gated |
| Skipping reduced-motion until "after launch" | Faster animation authoring | Retrofit = rewrite of animation layer | Never; tier system from foundation |

## Integration Gotchas

Common mistakes when connecting to external services.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel deploy | Treating preview = production perf; testing only on fast dev machine | Lighthouse CI against production URL, throttled mobile profile |
| Web fonts (display type) | Multiple large display fonts blocking render, FOUT mid-animation | Subset + preload the 1–2 critical fonts, `font-display: swap`, fallback metrics tuned |
| Analytics (German audience) | Dropping Google Analytics in without consent | GDPR applies (DE visitors): cookieless analytics (e.g., Vercel Analytics/Plausible-class) or a consent layer |
| Contact form / mail | Exposing plain `mailto:`/address or unprotected form endpoint | Spam-protected form (honeypot/turnstile) or obfuscated contact; rate-limit any serverless endpoint |
| 3D asset pipeline | Committing raw multi-MB GLB/4K textures | Draco/KTX2 compression step in the build pipeline; asset size budget |
| hreflang/sitemap | Generating alternates for untranslated fallback pages | Only emit hreflang/sitemap entries for fully translated pages; include self-reference + `x-default` |

## Performance Traps

Patterns that work at small scale but fail as usage grows — here "scale" is device diversity, not user count.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Animating layout properties (top/left/width) via JS | Smooth on dev machine, jank on mid-tier devices | Animate only `transform`/`opacity`; compositor-friendly by default | Any device below high-end |
| Scroll-scrubbed timelines with `scrub` + heavy DOM | Growing memory, degrading FPS over session | Known GSAP leak class: strict cleanup, minimal scrubbed DOM | After a few minutes of scrolling on mobile |
| Unbounded devicePixelRatio on canvas | 4x pixel work on retina/mobile, thermal throttling | Cap DPR ≤ 2, adaptive resolution | Any high-DPI phone |
| One JS bundle containing GSAP + 3D + i18n + content | First load slow everywhere | Route/section-level code splitting; 3D layer lazy-loaded post-paint | Every first visit (the visit that decides the hire) |
| Undisposed WebGL resources across sections | `renderer.info.memory` climbing, eventual context loss | Dispose discipline + context-lost handler + static fallback | Long sessions, low-RAM phones |
| Videos/Lottie autoplaying off-screen | Battery drain, main-thread churn | IntersectionObserver-gated playback | Mobile, multi-section pages |

## Security Mistakes

Domain-specific issues beyond general web security — a portfolio's attack surface is small but its *credibility* surface is large.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Unprotected serverless contact endpoint | Spam floods, abuse of Vercel function quota, mail reputation damage | Honeypot + Turnstile/rate limiting on the function |
| Publishing full CV data (birthdate, address, phone) | Scraping, identity abuse — German CVs traditionally over-share | Publish role-relevant facts only; full CV as gated/on-request PDF |
| GDPR-noncompliant analytics/embeds for DE visitors | Legal exposure + unprofessional signal to German employers | Cookieless analytics; no third-party embeds that set cookies without consent; Impressum/Datenschutz pages (German legal requirement, TMG/DSGVO) |
| Leaking API keys in client bundle (AI-chat feature later) | Key abuse, cost explosion | Any future AI/CV-chat runs through a server route with rate limiting, never client-side keys |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Facts locked behind the story (contact at the end of the scroll) | Recruiter leaves without name/contact — core value failed | First viewport = who/what/contact + visible skip mode; story is opt-in depth |
| Text that animates away while being read | Cognitive overload; NN/g found text+scrub is the worst combo | Keep substantive text static; animate decoration, not information |
| Custom cursor / hidden scrollbar / disabled zoom | Broken expectations, accessibility harm | Keep native affordances; enhance, don't replace |
| Language auto-detection with no obvious switcher | German recruiter trapped in EN (or vice versa) | Persistent, visible DE/EN switcher; URL-based locale so links preserve language |
| Immersion identical on mobile | Janky, hot, disorienting mobile experience for ~68% of first views | Designed-down mobile experience (simpler motion, same content), not a scaled desktop |
| "Wow" measured by the author | Self-assessment blindness — how rebuild #1 became "generic" | External viewers (incl. one recruiter-type) in UAT; 30-second fact test + "would you scroll on?" test |

## "Looks Done But Isn't" Checklist

- [ ] **Immersive sections:** Often missing reduced-motion/static rendering — verify every section is fully readable with animations disabled
- [ ] **Scroll choreography:** Often missing resize/orientation handling — verify pinned sections survive rotation and window resize
- [ ] **3D scene:** Often missing context-loss handler and disposal — verify `webglcontextlost` fallback and stable `renderer.info.memory` across navigation
- [ ] **i18n:** Often missing hreflang self-reference/x-default and untranslated-page exclusion — verify with `curl` per locale URL and Search Console
- [ ] **Recruiter path:** Often missing the stopwatch test — verify a stranger finds who/what/contact in <30s on a phone
- [ ] **Performance:** Often measured only on dev hardware — verify Lighthouse mobile (throttled) on the production URL, LCP < 2.5s
- [ ] **Content:** Often still at placeholder depth — verify each featured case study answers problem/decisions/outcome/learning
- [ ] **Legal (DE):** Often missing Impressum + Datenschutzerklärung — verify both exist and are reachable from every page

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| CWV budget blown late | MEDIUM | Lazy-load the wow-layer behind first paint; demote heaviest scene to static poster + "explore" opt-in |
| Scrolljacking tests badly | LOW–MEDIUM | Shorten scrubs, unpin sections, promote skip mode to primary nav — choreography changes, content untouched |
| Animation spaghetti detected mid-build | MEDIUM | Freeze new sections; extract motion-config + coordinator; migrate section by section (don't big-bang refactor) |
| Client-only i18n discovered post-launch | HIGH | Structural: introduce locale routes + redirects + hreflang; this is why it must be prevented at stack choice |
| Design judged generic at UAT | MEDIUM–HIGH | Content survives; re-run design-direction on hero + one signature interaction rather than full redesign |
| Rebuild stalling (nothing shipped) | LOW to recover, HIGH if ignored | Cut scope to the live-minimal milestone, deploy within days, resume immersion phases against production |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Effects-first, content-last | Content/Narrative phase (early, gated) | Case-study depth review before design lock |
| Scrolljacking recruiter path | UX architecture phase (recruiter path first) | 30-second stopwatch UAT, mobile + desktop |
| Preloader/hero kills CWV | Stack decision + Foundation (perf budget in CI) | Lighthouse CI green on every PR; prod URL audit |
| Desktop WebGL on all devices | Immersive/3D phase (tiering as entry requirement) — **flag for deeper research** | Test matrix incl. mid-tier Android; memory stable across nav |
| reduced-motion afterthought | Animation infrastructure phase (motion tiers) | All sections readable with motion off; UI toggle present |
| Animation spaghetti | Foundation phase (conventions, motion-config, coordinator) | Strict-Mode clean; cleanup shown in every animation PR |
| Client-only i18n | Stack decision + Routing/Foundation phase | Per-locale URLs curl-able; hreflang set complete |
| Awwwards-mimicry → generic | Design-direction phase (concept before inspiration) | External "whose site is this?" test at UAT |
| Rebuild never ships | Roadmap structure (live-minimal milestone first) | Production deploy exists by end of milestone 1 |

## Sources

All web-tier (LOW per provider classification); key claims corroborated across ≥2 independent sources.

- [NN/g — Scrolljacking 101](https://www.nngroup.com/articles/scrolljacking-101/) (primary usability research; fetched directly)
- [Don't Fuck With Scroll](https://dontfuckwithscroll.com/), [Discovery Design — Scroll Hijacking usability](https://discoverydesign.co.uk/blog/post/scroll-hijacking-why-scrolljacking-is-a-usability-nightmare/)
- [GSAP — Accessible Animation docs](https://gsap.com/resources/a11y/), [gsap.matchMedia reduced-motion demo](https://codepen.io/GreenSock/pen/RwMQwpR), [Motion — React accessibility](https://motion.dev/docs/react-accessibility), [Anne Bovelett — GSAP and accessibility](https://annebovelett.eu/gsap-and-accessibility-yes-you-can-have-both/)
- [GSAP forums — ScrollTrigger scrub memory leak](https://gsap.com/community/forums/topic/29002-memory-leak-in-scrolltrigger-scrub/), [GSAP — JS framework integration docs](https://gsap.com/resources/frameworks/), [Marmelab — GSAP in practice: avoid the pitfalls](https://marmelab.com/blog/2024/05/30/gsap-in-practice-avoid-the-pitfalls.html)
- [three.js forum — context lost on iOS/Android](https://discourse.threejs.org/t/how-to-fix-context-lost-android-iphone-ios/56829), [three.js forum — WebGL memory management](https://discourse.threejs.org/t/webgl-memory-management-puzzlers/24583), [Utsubo — 100 Three.js performance tips](https://www.utsubo.com/blog/threejs-best-practices-100-tips)
- [profy.dev — Portfolio websites survey (60+ hiring managers)](https://profy.dev/article/portfolio-websites-survey) (fetch failed; cited from search snippets — MEDIUM-relevance), [Hakia — Developer portfolio guide](https://hakia.com/skills/building-portfolio/), [OpenDoors — How recruiters actually look at portfolios](https://blog.opendoorscareers.com/p/how-recruiters-and-hiring-managers-actually-look-at-your-portfolio)
- [better-i18n — hreflang & locale URL guide](https://better-i18n.com/en/blog/i18n-seo-hreflang-locale-urls-guide/), [lingo.dev — i18n SEO checklist](https://dev.to/lingodotdev/the-i18n-seo-checklist-15-seo-optimization-techniques-to-reach-a-global-audience-59l0)
- [Ableneo — CWV in modern web apps](https://www.ableneo.com/insight/how-to-improve-core-web-vitals-lcp-inp-cls-in-modern-web-apps/), [DEV — CWV practical fixes](https://dev.to/benriemer/core-web-vitals-in-2026-the-practical-fixes-for-inp-lcp-and-cls-that-actually-work-4ef0)
- [Foleo — Your design portfolio might be holding you back](https://www.foleo.design/foleo-blog/your-design-portfolio-might-be-holding-you-back-but-you-can-fix-it-let-me-explain), [Speckyboy — Scope creep in web design](https://speckyboy.com/scope-creep-web-design/)

---
*Pitfalls research for: immersive personal developer portfolio (lsiem.de rebuild #2)*
*Researched: 2026-07-02*
