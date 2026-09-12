# Phase 4: Signature Moment & Launch Hardening — Security

**Phase:** 4
**ASVS level:** 1 (per `.planning/config.json`)
**Scope:** Supply-chain for new 3D dependencies; WebGL attack surface; launch verification hygiene

## Threat Model Summary

Phase 4 adds **client-side WebGL rendering** and **three new npm dependencies**. There is still **no** authentication, sessions, forms, user-controlled input reaching the server, or new network endpoints. The 3D layer is decorative, `aria-hidden`, non-interactive, and loads only from first-party bundled code.

| STRIDE | Applicable? | Notes |
|--------|-------------|-------|
| Spoofing | No | No auth |
| Tampering (supply chain) | **Yes** | New packages: three, @react-three/fiber, @react-three/drei |
| Repudiation | No | — |
| Information disclosure | Low | WebGL renderer exposes GPU vendor strings in console — not displayed to users |
| Denial of service | Low | GPU-heavy scene could slow client tab — mitigated by D-23 gate + D-24 caps |
| Elevation | No | — |

## Controls

| ID | Threat | Mitigation | Status |
|----|--------|------------|--------|
| T-04-SC | Tampering (supply chain) | `checkpoint:human-verify` package-legitimacy gate in 04-01 before `pnpm add`; pin exact versions; verify empty `postinstall` on all three packages | open until 04-01 Task 1 |
| T-04-WS | WebGL client DoS | Capability gate excludes mobile/low-core; `frameloop="demand"`; context-loss unmount (D-25) | planned 04-03 |
| T-04-PI | Pointer events on canvas | `pointer-events-none` on slot; canvas non-interactive | planned 04-01 |
| T-04-RT | Runtime third-party fetch | Procedural scene only — no CDN textures, no Google Fonts in WebGL, no external model URLs | locked D-20 |

## Package Legitimacy (pre-install gate)

Human must approve before install (same protocol as 03-01):

| Package | Expected repo | postinstall |
|---------|---------------|-------------|
| `three@0.185.1` | github.com/mrdoob/three.js | empty |
| `@react-three/fiber@9.6.1` | github.com/pmndrs/react-three-fiber | empty |
| `@react-three/drei@10.7.7` | github.com/pmndrs/drei | empty |

## WebGL-Specific Notes

- **No `eval` or dynamic shader strings from user input** — shaders are static template strings in source.
- **No loading external `.glb` / `.hdr` URLs** — procedural geometry only (D-20).
- **Context loss** is treated as a client stability event, not a security incident — degrade gracefully.

## Launch Verification

Production cutover (04-04) reuses Phase 2 gates:

- Do not promote if CV 404, Impressum placeholder, or GITHUB_TOKEN missing.
- No new secrets introduced in Phase 4.

## Deferred (unchanged)

- CSP gap documented in STATE.md / `next.config.ts` — out of scope.
