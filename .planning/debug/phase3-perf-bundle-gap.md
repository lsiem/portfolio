---
slug: phase3-perf-bundle-gap
status: resolved
trigger: "Phase 3 perf regression — the Vercel production build ships ~100KB more app /_next JS than the CI localhost `next start` LHCI gate measures for the same commit; LCP on the deployed preview (3.37s/3.72s) and script:size (308KB) fail the TECH-01 budgets. Root-cause the gap, verify whether the Option-A gsap-off-critical-path fix holds on the prod build, and make the CI gate representative. Do not relax budgets. PR #13 held as draft."
created: 2026-07-08
updated: 2026-07-11
phase: 03-design-direction-immersive-experience
related_pr: 13
related_commit: 6349277
resolved_in: 04-02
---

## RESOLUTION (04-02, 2026-07-11)

**The original hypothesis was WRONG.** There is no "~100KB of hidden app JS."
A byte-level decomposition of the deployed `/de` script payload against the
localhost `next start` build (same commit family) shows the app `/_next` chunk
set is **identical (~177KB both)**. The deployed-vs-localhost delta is entirely
NON-app bytes plus one app-triggered lazy load:

| Bucket | Bytes | Nature |
|--------|-------|--------|
| Core app `/_next` chunks | ~177KB | identical localhost == deployed |
| GSAP (`3-66e70216` + `41hjw4kg`) | ~30KB | app-triggered; loaded by a near-fold Reveal's IntersectionObserver |
| `@vercel/analytics` + speed-insights (`/script.js`) | ~6KB | platform scripts (present in prod too) |
| Opaque high-priority script (`/<signed>`, no `/_next`) | ~96KB | **Vercel platform bot-mitigation challenge** |

**Root cause of the 308KB deployed number = 96KB bot-challenge + 30KB GSAP,
not app code.**

1. **The 96KB opaque script is a Vercel bot-mitigation challenge**, not the app
   bundle. Proof: it appears under Lighthouse/LHCI headless Chrome (every run)
   but VANISHES when the same URL is loaded with a normal mobile-UA headless
   browser (every run). It is served from a signed, rotating path outside
   `/_next`, at High priority, and returns only a "Redirecting…" stub to curl.
   It is not in the app bundle, not deterministic, and real users on real
   browsers do not download it. Firewall config shows no custom rules
   (`ips:0 rules:0`, attack-mode off) — this is platform-level baseline
   mitigation firing on headless/datacenter clients. It cannot be toggled
   per-deployment on this plan.
2. **GSAP (~30KB) loaded on the mobile audit** because the previous just-in-time
   pattern imported gsap whenever a Reveal entered the viewport, and the first
   career Reveal sits at/near the mobile fold — so a no-scroll audit at the
   emulated mobile viewport height DID intersect it. (On localhost at 823px it
   did not intersect; the deployed emulation reported a taller layout viewport.)

**Fix (04-02):**
- `reveal.tsx` now splits by pointer: **touch/coarse → CSS-only reveal (NO gsap
  import)**; desktop pointer:fine → the existing just-in-time gsap reveal. D-19
  touch reveals preserved via a compositor-friendly opacity+transform CSS
  transition. Result: the mobile initial load never fetches gsap → app payload
  stays the ~177KB core bundle, under the 184,643 gate. Verified: after the fix,
  scrolling the career section into view on a mobile-touch context loads zero
  gsap chunks.
- **CI gate corrected to audit a local production build (`next start`).** The
  deployed-URL gate briefly introduced in 04-02 is unusable in CI: GitHub
  Actions' headless/datacenter Chrome triggers the 96KB bot-challenge on every
  run, which corrupts script:size AND the main-thread metrics (TBT/LCP/perf).
  Because the app `/_next` chunk set is proven byte-identical localhost==deployed,
  a local production audit measures the true shipped APP payload and excludes
  only non-app platform injection (bot-challenge + proxied analytics) — which is
  exactly what should NOT be gated. A real app-JS regression still surfaces
  locally. This is the plan's sanctioned "representative local build" fallback,
  now evidence-backed.
- The original finding's premise (localhost under-counts app JS) is explicitly
  retracted: localhost was already representative of app JS; it was the DEPLOYED
  number that was inflated by non-app bytes.

# Debug: Phase 3 perf regression (CI gate under-measures real bundle)

## Symptoms

- **Expected:** LHCI on the shipped deployment meets TECH-01 — `largest-contentful-paint` ≤ 2500ms, `resource-summary:script:size` ≤ 184,643 bytes, `categories:performance` ≥ 0.90 — and the CI gate measures what actually ships.
- **Actual:** For the SAME commit (`6349277`):
  - CI job "Parity, build & performance budget" (LHCI vs `http://localhost:3000` via `pnpm start`): `script:size` **177,509 PASS**; LCP **flaky** — one run 2896.8ms FAIL, another run under budget PASS.
  - LHCI vs the deployed Vercel edge preview (`https://portfolio-asmsp4rc1-lsiems-projects.vercel.app`, mobile, 3 runs, identical assertions): `script:size` **308,250 / 308,204 FAIL**, LCP **/de 3373ms · /en 3725ms FAIL**, `performance` **0.88 FAIL**. CLS/TBT passed.
- **Error / assertion:** `largest-contentful-paint failure for maxNumericValue assertion: expected <=2500, found 2896.8` (CI); `found 3373 / 3725` (edge). `resource-summary.script.size ... expected <=184643, found 308250`.
- **Timeline:** Introduced in Phase 3 (motion layer: GSAP + Lenis + Bricolage display font). CWV was "good" through Phase 2 launch. Option-A fix (`3e04780`) moved GSAP to an IntersectionObserver-gated lazy chunk and made the CI localhost gate pass at 177KB.
- **Reproduction:** `pnpm exec lhci autorun --config=<config pointing url at the deployed preview /de + /en>` → fails LCP + script:size. Compare to the CI localhost run (passes script:size).

## Current Focus

hypothesis: The CI localhost no-scroll LHCI audit does not load the same set of `/_next` chunks that the real Vercel deployment loads on initial render, so it under-counts script by ~100KB. Most likely the GSAP/reveal machinery (Option-A lazy chunk) loads eagerly on mount on the real build/page (not only on scroll), OR additional app chunks load that the localhost audit skips — meaning the "gsap off the critical path" win does not hold on the deployed build.
test: Enumerate the exact `/_next/static/chunks/*` that load on the deployed preview during a no-scroll Lighthouse audit vs the localhost build; identify which chunk(s) contain GSAP (`GreenSock`) and whether they load without scrolling.
expecting: The ~100KB delta is a specific set of app chunks (likely GSAP + reveal/career-spine) loading on initial render on the real build.
next_action: Reproduce a local production build (`pnpm build && pnpm start`), diff its first-load JS / loaded-chunk set against the deployed preview's network trace; locate GSAP in the chunk graph and determine its load trigger.

## Evidence

- timestamp: 2026-07-08 — CI localhost LHCI: script:size 177,509 PASS; LCP flaky (2896.8 fail / under-budget pass across two runs of the same check). Source: PR #13 checks, job 85873901394 (fail) + 85873734589 (pass).
- timestamp: 2026-07-08 — Edge preview LHCI (my run, mobile, 3 runs): LCP /de 3373 /en 3725; script:size 308,250/308,204; perf 0.88. Config: scratchpad/lhci-preview.json.
- timestamp: 2026-07-08 — Network trace (chrome-devtools) of deployed /de: 18 script requests. App chunks from `…vercel.app/_next/static/chunks/*` (14 seen). Injected non-app scripts: `vercel.live/_next-live/feedback/feedback.js` (preview toolbar), `/7fbac97…/script.js`, `/139d50a8…/script.js`, and a long `/cb5oPAJ9…` path.
- timestamp: 2026-07-08 — Injected-script transfer sizes: feedback.js (preview toolbar) **23,065 B** (PREVIEW-ONLY, not in production), analytics script.js **1,300 B**, speed-insights script.js **4,746 B**. Injection total ≈ 29 KB → leaves **~100 KB of the 131 KB delta as real app `/_next` JS** the localhost gate does not count.
- timestamp: 2026-07-08 — Deployed initial HTML references only `/_next/static/chunks/*` (no analytics/toolbar in initial markup); extra chunks (reqids 24–28) load after initial paint.
- timestamp: 2026-07-08 — Option-A fix (`3e04780`) converted reveal.tsx/career-spine.tsx/magnetic.tsx/transition-link.tsx to just-in-time GSAP; CI localhost showed GSAP body in a 72KB async-only chunk not referenced in initial HTML.

## Eliminated

- hypothesis: The whole 131KB gap is Vercel preview/analytics injection. — ELIMINATED: measured injection ≈ 29KB (23KB of it preview-only toolbar); ~100KB remains as real app JS.
- hypothesis: The edge is comfortably faster than CI (gate just unrepresentative in the optimistic direction). — ELIMINATED: the edge measured WORSE (LCP 3.4–3.7s, script 308KB) than the CI localhost build.

## Constraints (do NOT violate)

- Do NOT relax TECH-01 budgets (LCP ≤ 2500, script:size ≤ 184,643, performance ≥ 0.90) in lighthouserc.json.
- Do NOT drop the D-03 Bricolage display face or D-08 single-engine (GSAP+Lenis) / D-19 touch reveals.
- Preserve human-verified behavior (UAT 4/4). LCP measured from the local dev machine carries network/CPU noise — prefer a clean lab/field number where possible; `script:size` is a byte count and is authoritative.
- PR #13 is held as DRAFT pending this fix; the eventual fix must make the CI gate measure a representative build (e.g. audit the deployed preview URL) so it stops hiding the real payload.
