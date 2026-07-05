# Phase 3: Design Direction & Immersive Experience - Context

**Gathered:** 2026-07-05
**Status:** Ready for planning

<domain>
## Phase Boundary

Give the site a distinctive, **identity-derived design direction** and turn the default visit into a **scroll-storytelling journey with felt craft** — layered on top of the recruiter overview shipped in Phase 2. The immersion must **never block the fast recruiter path**, must be **fully designed for `prefers-reduced-motion`**, and must be **deliberately shaped for mobile** (no scrolljacking, no degraded desktop layout).

Requirements: **WOW-02** (career scroll-storytelling), **WOW-03** (micro-interactions + seamless transitions, one engine + motion tokens), **WOW-04** (every immersive sequence skippable; identity + overview visible from first paint; no unskippable preloader), **MODE-02** (full reduced-motion quiet variant, shared implementation with overview), **TECH-02** (deliberate mobile experience).

**NOT in this phase (→ Phase 4):** the signature 3D/WebGL hero moment (WOW-01). Phase 3 **reserves the architectural seam** for it (see D-09) but ships no 3D. The 3D layer, device-tiering, and asset pipeline are Phase 4.

**Introduces** the motion infrastructure that does not exist yet: this repo currently ships **zero animation dependencies** (no GSAP, no Lenis) — Phase 3 adds and wires them.

</domain>

<decisions>
## Implementation Decisions

Phase 3 has a **UI hint = yes**: a `03-UI-SPEC.md` design contract will be produced (via `/gsd-ui-phase 3`) before/at planning. The decisions below are the locked inputs that the UI-spec and planner build on; they resolve the vision-level gray areas so downstream agents do not re-ask the owner.

### Art Direction
- **D-01 (Direction):** **Engineered / systems** art direction — mono-forward, grid & console motifs, precise structural lines, coordinate/tick annotations. The accent is a **signal color**, not decoration. Derived from Lasse's identity (self-taught full-stack + DevOps engineer, OpenShift/systems roots, now Product Owner of a multi-agent AI assistant) and builds on the mono typography already shipped.
- **D-02 (Palette — LOCKED, unchanged):** **Keep the exact live palette** — warm-stone neutrals (`--background`/`--foreground`/`--muted`/`--border`) + the single orange accent (`--accent`). No re-theming; light AND dark tokens stay as shipped in `src/app/globals.css`. The engineered feel comes from **grid + mono + motion**, not new colors. Accent discipline (~10%, signal-only) from Phase 2 (CTX-02 specifics) continues.
- **D-03 (Typography — add a display face):** Keep Geist Sans (body) + Geist Mono (labels/metadata/annotations, pushed harder). **Add ONE distinctive display typeface for headlines**, category = **technical grotesque** (characterful neo-grotesque with personality at large sizes, pairs with Geist, "engineered" without going full terminal). **HARD CONSTRAINT: self-hosted via `next/font` — no Google Fonts runtime call, DSGVO-clean** (AGENTS.md rule). The specific face is the researcher's/UI-spec's pick within this category + constraint.
- **D-04 (Layout — widen to structural grid):** Break out from the strict `max-w-3xl` single column to a **visibly gridded, wider layout** with margin columns and asymmetric placement — most impactful in the hero + career sections. A content/reading column stays **anchored for text integrity**. Responsive collapse handled per D-13 (mobile).

### Career Storytelling (WOW-02)
- **D-05 (Mechanic):** **Progressive reveal timeline on native scroll** — chapters/roles reveal (fade/slide) on enter, **no pinning, no scrolljacking**. Chosen for robustness: degrades trivially to reduced-motion and mobile. Satisfies "scroll-linked scenes per career chapter" via reveal-on-enter. (GSAP ScrollTrigger drives the reveals; see D-08 engine.)
- **D-06 (ITSC arc = hero sub-scene):** The **ITSC role arc — Systemadministrator (OpenShift) → Software Engineering → Product Owner (ELIA)** — is the narrative centerpiece: it expands into its own **multi-beat sub-sequence**, each role transition a distinct emphasized reveal step. Other orgs (Just Relate, Vidama, Freelance) get lighter single reveals. (Aligns with Phase 1 D-02 career arc.)
- **D-07 (Persistent device):** A **vertical progress spine rail** with a scroll-progress indicator and **tick/coordinate labels** (year markers + chapter index, mono). Reinforces the engineered/console motif and orients the reader. Matches the structural-grid direction (D-04).

### Motion & Craft (WOW-03)
- **D-08 (Single engine — LOCKED):** **GSAP + `@gsap/react` (`useGSAP`)** is the one animation engine, with **central motion tokens** (durations, easings, distances) as the single source of truth — directly satisfies the success criterion "genau eine Animations-Engine mit zentralen Motion-Tokens." Per STACK.md. No second animation engine (no Motion/Framer) unless a proven gap forces it (Phase-2 anti-pattern: two engines).
- **D-09 (Smooth scroll):** **Lenis smooth (lerped) scroll is enabled** (STACK recommendation — wraps native scroll so `position: sticky`, anchors, and keyboard nav keep working; synced to GSAP ScrollTrigger via `gsap.ticker`). **MUST be disabled under `prefers-reduced-motion`** and tuned so it never feels laggy on mobile (see D-13).
- **D-10 (Intensity):** **Medium / expressive** — noticeably animated (staggered reveals, split-text, magnetic interactions), clearly "wow" but disciplined. Not spectacle (protects CWV/INP + the fast path).
- **D-11 (Signature micro-interactions — all four committed):**
  1. **Magnetic buttons/links** (CV button, contact links, nav) — subtle pull toward cursor; **pointer-only, no-op on touch/keyboard**.
  2. **Split-text headline reveals** (GSAP SplitText, now free) — by char/word/line on enter; **real DOM text must render underneath** (a11y/SEO). Pairs with the display face.
  3. **Designed hover/focus/active states** across cards, project rows, links, tech chips — the "everything feels designed" layer; preserves/extends the global `:focus-visible` ring (TECH-03).
  4. **Seamless section + sub-route transitions** (to case studies, about) — technique (View Transitions API vs GSAP) is the researcher's call.

### Hero (Phase-3 treatment + Phase-4 seam)
- **D-12 (Hero treatment):** **Engineered intro sequence** — on load, structural grid lines/ticks draw in, the display headline reveals via split-text, and the mono value-prop reveals — a composed "system booting" moment. **All motion runs after first paint; name/role/value-prop render as static SSR HTML** (LCP-safe, never gated behind motion — WOW-04).
- **D-13 (Phase-4 3D seam — reserve a background canvas layer):** Architect the hero now with a **dedicated, empty background/behind-content layer slot** that Phase 4 fills with the lazy, capability-gated 3D canvas — **no hero re-layout later**. Content + grid sit above it. Matches the roadmap's "3D architektonisch jederzeit streichbar (Capability-Gate + Lazy-Load + Scroll-Bridge)" intent.

### Projects & Case Studies (heavier flagship treatment — deferred from Phase 2)
- **D-14 (Projects composition):** **Featured hierarchy / bento** — the **two deep case studies are the large featured pair: ELIA (flagship, Lasse's Product-Owner work at ITSC) + Vidama (Mediathek deep)**; the **rest of the projects stay compact**. Asymmetric bento on the structural grid. Delivers the "heavier flagship-project treatment" deferred from Phase 2. Weighting matches Phase 1 D-01. *(Clarified with owner: "ELIA/ITSC and Vidama featured, rest compact.")*
- **D-15 (Case-study detail pages):** **Engineered but reading-first** — case-study interior pages inherit the engineered art direction (display face, grid, reveals, spine) but stay optimized for reading; motion supports comprehension, does not perform. Consistent identity across the whole site.

### Profile Photo (CONT-06 — deferred treatment from Phase 2)
- **D-16 (Design the treatment now, photo slots in):** Phase 3 **designs the signature photo treatment** (engineered framing — e.g. grid crop, mono/duotone, coordinate label) for the About section. The **actual image remains owner-supplied and slots into the finished slot without blocking** the phase. Design now, asset later. (Extends Phase 2 CTX-03 / D-D.)

### Skip & Reduced-Motion & Mobile
- **D-17 (Skip model — layered enhancement, no toggle):** The page **IS the same accessible content from first paint** — identity, value-prop, and anchor-nav visible immediately; **motion is pure enhancement layered on top**. "Skipping" = the facts are always already there + the anchor nav jumps anywhere. **No preloader, no mode switch.** Matches Phase 2 CTX-01 (the single-scroll overview IS the recruiter overview; no separate condensed view).
- **D-18 (Reduced-motion quiet variant — MODE-02 — same DOM, motion stripped):** **One implementation.** `prefers-reduced-motion` disables Lenis + GSAP timelines; reveals become instant/opacity-only; content is fully present and intentionally designed. This IS the "shared implementation with the overview-mode" MODE-02 requires — never a broken/afterthought state.
- **D-19 (Mobile — TECH-02 — same story, tuned for touch):** The structural grid **collapses to a focused single column** (a deliberately composed mobile layout, NOT a shrunk desktop). The progressive-reveal timeline + reveals **stay** (touch-safe); **magnetic effects disabled on touch**; split-text kept. Lenis + motion intensity **re-tuned/eased for mobile** to protect battery + INP on mid-tier Android. No scrolljacking.

### Claude's Discretion
- The **specific display typeface** within "technical grotesque" + self-hosted constraint (D-03).
- **Motion-token values** (exact durations, easings, stagger amounts) and the technique for **seamless transitions** (View Transitions API vs GSAP) (D-11.4).
- **Lenis↔ScrollTrigger sync** details and mobile tuning thresholds (D-09, D-19).
- Exact **spine/coordinate-readout** visual design and bento breakpoints (D-07, D-14).
- Whether the reserved 3D layer is a `<canvas>` placeholder, a positioned wrapper, or a slot component (D-13) — keep the Phase-4 drop-in cheap.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase goal, requirements, prior locked decisions
- `.planning/ROADMAP.md` — Phase 3 goal + the 5 success criteria (career scroll-storytelling; craft micro-interactions + seamless transitions on one engine + motion tokens; every sequence skippable / identity + overview from first paint / no unskippable preloader; full reduced-motion quiet variant shared with overview; deliberate mobile, no scrolljacking). Also Phase 4 entry — the 3D moment is explicitly deferred there.
- `.planning/REQUIREMENTS.md` — WOW-02, WOW-03, WOW-04, MODE-02, TECH-02 (Phase 3 scope); anti-features that still bind (no unskippable intro / forced preloader, no autoplay sound, no percent bars, no forms).
- `.planning/phases/02-recruiter-overview-live/02-CONTEXT.md` — Phase 2 locked decisions this phase builds on: **CTX-01** (single-scroll overview IS the recruiter overview, no separate condensed view), **CTX-02** (career-first section order), accent discipline (~10%, signal-only), no-forms, token-driven theming; and the explicit **Deferred → Phase 3** list (signature identity, kinetic typography, scroll-driven motion, heavier flagship treatment, signature photo treatment, full MODE-02) that this CONTEXT now resolves.
- `.planning/phases/01-bilingual-content-foundation/01-CONTEXT.md` — **D-01** (ELIA flagship + Vidama deep + OpenShift lighter — the weighting behind D-14), **D-02** (ITSC SysAdmin→SWE→PO arc — the story behind D-06), **D-03** (ELIA confidentiality: public repo, abstract only — still binds any case-study copy touched here), **D-09** (German default locale).

### Stack / architecture / pitfalls (verified research)
- `.planning/research/STACK.md` — verified versions & integration rules: **GSAP 3.15 + `@gsap/react` 2.1.2** (D-08), **Lenis 1.3.x** + the `gsap.ticker` sync pattern (D-09), React `~19.2.0` pin, Next.js 16, Tailwind 4 CSS-first, SplitText/ScrollTrigger now free. Also the **"one engine, not two" What-NOT-to-Use** rule.
- `.planning/research/ARCHITECTURE.md` — five-layer architecture; `[locale]` + `generateStaticParams` → full SSG; where the client motion layer mounts relative to server-rendered content.
- `.planning/research/PITFALLS.md` — CWV budget enforced in CI (TECH-01 still guards this phase); "heavy WebGL as LCP element" caution (relevant to the D-13 reserved layer); reduced-motion + native-scroll semantics.

### Project rules (bilingual / DSGVO / two-harness)
- `AGENTS.md` — **self-hosted fonts via `next/font` only, no runtime Google/third-party calls** (binds D-03); no runtime third-party calls at all (DSGVO); Antigravity is build-time only.
- `content/{de,en}/*` + `content/shared/types.ts` — the bilingual content model the career timeline, projects/case-study hierarchy, and About render from (unchanged data source; Phase 3 is presentation).

### Existing implementation to elevate (not rebuild)
- `src/app/[locale]/page.tsx` — the single-scroll overview (hero → career → projects → skills → about → activity → contact) that Phase 3 elevates in place.
- `src/app/globals.css` — the warm-stone + orange tokens, `@theme inline`, `::selection`, `scroll-behavior`, global `:focus-visible` ring — the token base D-02 keeps and the motion layer extends.
- `src/app/[locale]/layout.tsx` — Geist fonts via `next/font`, header/main/footer landmarks, theme cluster — where the display face (D-03) and motion providers (Lenis/GSAP) get wired.
- `src/components/{theme-toggle,locale-switcher,github-heatmap}.tsx` — existing client components + the header control cluster the craft layer (D-11) applies to.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Overview page + all sections** (`src/app/[locale]/page.tsx`): fully built, accessible, SSR. Phase 3 elevates it in place (grid, motion, hierarchy) — does not rebuild content. Hero already renders name/role/value-prop as static HTML (LCP-safe base for D-12).
- **Design tokens** (`src/app/globals.css`): warm-stone + orange, `@theme inline`, 3-state theming, `:focus-visible` ring — kept as-is (D-02); motion tokens get added alongside.
- **Content model** (`content/{de,en}/*`, `content/shared/types.ts`): drives the career timeline (D-05/D-06), the featured-project hierarchy (D-14), case studies (D-15), About (D-16). No schema change needed — Phase 3 is presentation.
- **Case-study + prose routes** (`src/app/[locale]/case-studies/[slug]/page.tsx`, `[locale]/[slug]/page.tsx`): the reading-first pages D-15 elevates.

### Established Patterns
- **Tailwind 4 CSS-first** (`@theme inline`), **no component library** (standing project decision — hand-authored components; do NOT introduce shadcn — see Phase 2 deferred).
- **Token-driven theming**: every surface reads color via CSS custom properties; re-theming is via `:root[data-theme]` overrides (no `dark:` utilities). Motion tokens should follow the same central-variable discipline (D-08).
- **next-intl** routen-based i18n (German default), full SSG via `generateStaticParams` — the motion layer must be client-mounted **without** breaking static prerendering of content (server content + `"use client"` motion wrappers).
- **CWV budget in CI (LHCI)**: LCP≤2500ms, TBT≤200ms, CLS≤0.1 already enforced — the immersive layer must stay within it (motion after first paint; no layout shift from reveals).

### Integration Points
- **Motion providers**: Lenis + GSAP/`useGSAP` context need mounting in a client boundary (likely in/around `layout.tsx`), synced via `gsap.ticker`, disabled under reduced-motion (D-09/D-18).
- **Display face**: added via `next/font` (self-hosted) in `layout.tsx`, exposed as a `--font-display` token in `globals.css` (D-03).
- **Reserved 3D layer**: a background slot in the hero composition (D-13) — new structural element, empty in Phase 3.
- **Reveals/ScrollTrigger**: attach to existing section markup; must keep real DOM text (split-text overlays real headings — D-11.2).
- **CSP note (carried)**: no CSP ships yet (Phase 2 02-06 gap); adding client motion libs doesn't change that, but keep bundle self-hosted (no CDN scripts) so a future `script-src 'self'` CSP stays viable.

</code_context>

<specifics>
## Specific Ideas

- **Identity anchor for the art direction:** the "engineer who builds and operates systems" story — OpenShift/DevOps → software engineering → Product Owner of a multi-agent, MCP-based AI assistant. The engineered/console/grid language (D-01) should read as *his* world, not a generic dev-portfolio trope.
- **The ITSC growth arc is the emotional core** (D-06): the SysAdmin→SWE→PO progression is the thing to make land as a distinct multi-beat moment — the owner emphasized the *role evolution*, not just the tech.
- **Featured pair = ELIA + Vidama** (D-14), owner-confirmed verbatim: "ELIA/ITSC and Vidama featured, rest compact."
- **Discipline is a feature:** medium/expressive, not spectacle (D-10); accent stays a signal color (D-02); the fast recruiter path is sacred (D-17). Wow must never cost the 30-second facts test.

</specifics>

<deferred>
## Deferred Ideas

- **Signature 3D/WebGL hero moment (WOW-01)** → **Phase 4**. Phase 3 only reserves the background layer seam (D-13). Device-tiering, Draco/KTX2 asset pipeline, and WebGL context-loss handling are Phase-4 research (already flagged in ROADMAP + STATE blockers).
- **Actual profile-photo image asset** → owner-supplied, non-blocking; slots into the D-16 treatment whenever provided.
- **Two-column CV polish** (Phase 2 D-E alternative) → still a possible later refinement; not in Phase 3 scope unless it falls out naturally.
- **Sound design, terminal easter-egg, AI-chat** → out of scope / v2 (per REQUIREMENTS Out of Scope + Deferred Items). Not part of the immersive layer.
- **CSP hardening** → tracked Phase 2 follow-up (nonce-incompatible with all-static architecture); unchanged by this phase.

None of the above blocks planning or execution of Phase 3.

</deferred>

---

*Phase: 3-Design Direction & Immersive Experience*
*Context gathered: 2026-07-05*
