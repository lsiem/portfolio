---
status: testing
phase: 03-design-direction-immersive-experience
source: [03-VERIFICATION.md]
started: "2026-07-07T12:03:03Z"
updated: "2026-07-07T12:30:00Z"
---

## Current Test

number: 4
name: MOBILE — deliberate touch experience, both /de and /en
expected: |
  On a narrow/touch viewport, the layout is a deliberate single column (not a shrunk
  desktop); the progress spine is hidden; magnetic effects are absent; scrolling is
  native with NO scrolljacking/pinning; content is complete and reads well.
awaiting: user response

## Tests

### 1. WOW — desktop immersive craft (pointer:fine), both /de and /en
expected: Hero intro on mount; career reveals + ITSC multi-beat + spine fill; bento stagger (ELIA + Vidama large); magnetic buttons; GSAP crossfade sub-route transitions; accent stays signal-only. Reads as deliberate medium/expressive craft, not a template.
result: pass
source: human (2026-07-07, /de + /en)

### 2. SKIPPABLE — first-fold facts & navigation, both /de and /en
expected: Name, role, and value prop are visible on first paint (SSR, no wait); anchor nav is present immediately; there is NO unskippable preloader; clicking nav jumps to the section immediately. A recruiter in a hurry gets the facts in under 30s.
result: pass
source: human (2026-07-07, /de + /en)

### 3. QUIET — prefers-reduced-motion variant, both /de and /en
expected: With OS reduced-motion enabled, every page renders its full, fully-designed static content — no motion, no Lenis smoothing, no missing/broken/half-revealed states. It looks intentional and complete, not a stripped fallback.
result: pass
source: human (2026-07-07, /de + /en)

### 4. MOBILE — deliberate touch experience, both /de and /en
expected: On a narrow/touch viewport, the layout is a deliberate single column (not a shrunk desktop); the progress spine is hidden; magnetic effects are absent; scrolling is native with NO scrolljacking/pinning; content is complete and reads well.
result: [pending]

## Summary

total: 4
passed: 3
issues: 0
pending: 1
skipped: 0
blocked: 0

## Gaps

<!-- Populated by /gsd-verify-work if a walkthrough item fails. -->

## Deferred / Ship-gate

- **Production LCP verification (TECH-01):** Local LHCI LCP is ~2.76–2.92s vs the ≤2500ms budget — confirmed font-bound (the D-03 Bricolage hero H1 under Lighthouse's simulated slow-4G/4×-CPU on a load-confounded machine), NOT JS-bound (the Option-A gsap cut did not move it). The budget was calibrated on a production Vercel build, which is the source of truth. Verify production LCP ≤ 2500ms on the Vercel preview for /de and /en before promoting. Phase 4 Success Criterion 3 re-checks this on production regardless. Do NOT relax TECH-01.
