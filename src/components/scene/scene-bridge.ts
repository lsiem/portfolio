/**
 * One-way GSAP-land -> canvas-land bridge (RESEARCH Pattern 3). The ONLY
 * shared surface between GSAP/DOM choreography and the R3F scene interior —
 * single-engine discipline (Phase 3 D-08): GSAP/DOM code WRITES these fields
 * imperatively (never a React re-render), and `useFrame` READS them every
 * frame. No listeners/pub-sub needed — `useFrame` already polls at the
 * render-loop rate, so a plain mutable module-scope object (mirrors
 * theme-toggle.tsx's module-scope-state convention) is sufficient.
 *
 * NOTE (deviation, Rule 3 — blocking): the plan assigns this file's creation
 * to Task 2, but Task 1's `useFrame` loop needs `sceneBridge.paused` for its
 * early-return, so it is created here (Task 1) instead, fully shaped per
 * RESEARCH Pattern 3 from the start. Task 2 wires the actual PRODUCERS
 * (hero-intro's boot-beat handshake, the scroll-exit progress sources, the
 * pointer listener) that write into it.
 *
 * Fields:
 *   - scrollProgress: 0..1, written by the hero's scroll-exit progress source
 *     (D-05) — 0 = hero fully in view, 1 = hero fully scrolled past.
 *   - introBeatAt: performance.now() timestamp when the boot-sequence hero
 *     intro timeline completed (0 = not yet / never runs on touch) — the D-09
 *     boot-beat handshake.
 *   - pointer: {x, y, active} — unprojected scene-plane coordinates, written
 *     ONLY when `pointer: fine` (D-06); stays inactive (false) on
 *     touch/keyboard, where the listener is never installed.
 *   - paused: true once the hero has scrolled fully past (D-05) or the tab is
 *     hidden — every per-frame body (drift/pulses/pointer) early-returns.
 */

export interface ScenePointer {
  x: number;
  y: number;
  active: boolean;
}

export interface SceneBridgeState {
  scrollProgress: number;
  introBeatAt: number;
  pointer: ScenePointer;
  paused: boolean;
}

export const sceneBridge: SceneBridgeState = {
  scrollProgress: 0,
  introBeatAt: 0,
  pointer: { x: 0, y: 0, active: false },
  paused: false,
};
