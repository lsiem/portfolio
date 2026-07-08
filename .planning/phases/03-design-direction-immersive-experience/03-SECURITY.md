---
phase: 03
slug: design-direction-immersive-experience
status: verified
# threats_open = count of OPEN threats at or above workflow.security_block_on severity (the blocking gate)
threats_open: 0
asvs_level: 1
created: 2026-07-07
---

# Phase 03 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> Retroactive verification (State B) — register built from the four PLAN.md
> `<threat_model>` blocks and verified against the shipped implementation.

**Scope note:** Phase 3 is a presentation/motion layer. It adds three build-time
npm dependencies (`gsap`, `@gsap/react`, `lenis`) and one self-hosted `next/font`
display face (Bricolage Grotesque), plus client motion components. It introduces
**no** authentication, sessions, forms, user-controlled input, network endpoints,
or new runtime third-party calls (DSGVO). ASVS surface is narrow (V14 config /
supply-chain + V5 marginal); L1 grep-depth verification is sufficient.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm registry → build | New motion packages enter the build/bundle at install time | Third-party package code (pinned versions) |
| build → client bundle | Self-hosted JS/CSS/font bytes shipped to the visitor | First-party bundled assets only — no runtime third-party call (DSGVO) |
| client → client-side navigation | `TransitionLink` intercepts clicks and drives `router.push` | First-party content-model route strings only |
| owner asset → About photo slot | Owner-supplied image renders in the framed slot | Static `public/` image path (none supplied yet) |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-03-SC | Tampering (supply chain) | `pnpm add gsap @gsap/react lenis` | high | mitigate | Task-1 blocking-human package-legitimacy checkpoint approved (03-01); versions pinned `gsap@3.15.0` / `@gsap/react@2.1.2` / `lenis@1.3.25`; `scripts.postinstall` reconfirmed empty for all three (2026-07-07); `lenis` SUS auto-flag confirmed false-positive (registry `time.created` 2023-04-03, 111 versions, official `darkroomengineering` repo) | closed |
| T-03-01 | Tampering (config / bundling + single-engine) | GSAP/Lenis/Bricolage bundling; second-engine avoidance | low | mitigate | All shipped as self-hosted bundled JS/CSS/font via npm + `next/font` build-time fetch — no runtime `<script src=cdn>` (keeps a future `script-src 'self'` CSP viable); single animation engine confirmed — `framer-motion`/`motion` absent from `package.json`, only `gsap`/`@gsap/react`/`lenis` | closed |
| T-03-02 | Tampering (XSS) | SplitHeading/SplitText, CareerSpine, ProjectBento, case-study/about MDX, About photo | low | mitigate | No `dangerouslySetInnerHTML` in any motion component (grep-verified); SplitText/GSAP operate on rendered DOM text nodes, not raw HTML; MDX rendered via existing `MDXContent` (first-party content model); About photo is a static `<img>` with an owner-supplied `public/` asset, not user-injected markup; pre-existing `personJsonLd` + no-flash theme `<script>` (static literals, trusted content-model data) unchanged by this phase | closed |
| T-03-04 | Denial of Service (client) | `CareerSpine` ScrollTrigger progress fill | low | accept | Transform-only (`scaleY`, compositor) fill, no per-frame layout thrash; reveals `once`; spine gated `lg`+ AND reduced-motion (never on mobile emulation); CI CWV gate enforces TBT ≤ 200ms (measured ~0ms) | closed (accepted) |
| T-03-05 | Information disclosure | ELIA case-study presentation | low | accept | Presentation only; ELIA confidentiality (Phase 1 D-03: public repo, abstract-only) is enforced in the content model this phase reads — no internal names/dates/models authored here | closed (accepted) |
| T-03-06 | Tampering (open redirect / unsafe scheme) | `TransitionLink` `router.push(href)` | low | mitigate | `href` values are first-party content-model routes/literals only (case-study slugs, `/about`) — no user-controlled URL; internal-only via `@/i18n/navigation` (grep: `next/navigation` count 0); external links keep native `<a target="_blank" rel="noopener noreferrer">` and are NOT routed through `TransitionLink` | closed |
| T-03-07 | Denial of Service (client) | `Magnetic` mousemove tweens | low | accept | Transform-only GSAP tweens throttled by GSAP's ticker; gated `pointer:fine` AND `no-preference` (no listeners bound on touch/reduced-motion — "absent, not degraded"); CI TBT ≤ 200ms gate | closed (accepted) |
| T-03-08 | Denial of Service (client) | case-study / about reveals | low | accept | Reading-first single gentle reveals, transform/opacity only, IntersectionObserver `once`; reduced-motion strips them entirely; CI CWV gate (TBT ≤ 200ms, CLS ≤ 0.1) enforces | closed (accepted) |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `high` (workflow.security_block_on) count toward threats_open*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-03-01 | T-03-04 | Client-only transform-only ScrollTrigger fill; compositor-friendly, gated off on mobile/reduced-motion; CWV TBT gate guards it | Owner (via phase plan disposition) | 2026-07-07 |
| AR-03-02 | T-03-05 | ELIA abstract-only confidentiality already enforced upstream in the content model (Phase 1 D-03); phase adds presentation only | Owner (Phase 1 D-03) | 2026-07-07 |
| AR-03-03 | T-03-07 | Pointer-only, touch/reduced-motion-gated, transform-only, ticker-throttled magnetic tweens; CWV TBT gate guards it | Owner (via phase plan disposition) | 2026-07-07 |
| AR-03-04 | T-03-08 | Reading-first gentle reveals, transform/opacity only, once, reduced-motion-stripped; CWV gate guards it | Owner (via phase plan disposition) | 2026-07-07 |

*Accepted risks do not resurface in future audit runs. All are low-severity client-side performance dispositions, below the `high` block threshold.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-07-07 | 8 | 8 | 0 | /gsd-secure-phase (State B, retroactive verify; register authored at plan time, ASVS L1 short-circuit) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-07-07
