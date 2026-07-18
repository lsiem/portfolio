/**
 * One-way GSAP/DOM-land -> canvas-land bridge (RESEARCH Pattern 3). The ONLY
 * shared surface between GSAP/DOM choreography and the R3F scene interior —
 * single-engine discipline (Phase 3 D-08): producers WRITE these fields
 * imperatively (never a React re-render), and `useFrame` READS them every
 * frame. No listeners/pub-sub needed — `useFrame` already polls at the
 * render-loop rate, so a plain mutable module-scope object (mirrors
 * theme-toggle.tsx's module-scope-state convention) is sufficient.
 *
 * Phase-5 Kontinuum (WP-A): extended to the frozen `StageBridge` contract
 * (DESIGN-SPEC §5.1 Contract 1). This file is OWNED by WP-A; every other work
 * package imports TYPES only and writes through `sceneBridge`. Until the
 * stage chunk mounts (WP-B/C/D), the new fields are dead letters — writes are
 * harmless because no consumer exists, and `invalidate` is a module-level
 * no-op that `StageCanvas.onCreated` replaces with R3F's `state.invalidate`
 * once a canvas actually exists. That inert-by-default shape is what keeps
 * the DOM byte-render-identical for excluded visitors (tier "none",
 * reduced motion, `?webgl=off`, context lost, chunk failed).
 */

export type FormationId =
  | "constellation"
  | "filament"
  | "lattice"
  | "orbits"
  | "frame"
  | "grid"
  | "glyph"
  | "halo"
  | "rest";

export interface ScenePointer {
  x: number;
  y: number;
  active: boolean;
}

export interface StageBridge {
  /** Scroll director writes the boundary-zone morph between adjacent sections. */
  formation: { from: FormationId; to: FormationId; t: number };
  /** StageFormation marker writes once on mount (route-level formation). */
  routeFormation: FormationId;
  /** career-spine's existing ScrollTrigger onUpdate writes 0..1 (WP-D). */
  sectionProgress: number;
  /** Scroll producers write 0..1 whole-page progress (camera-spline input). */
  pageProgress: number;
  /** Scroll producers write window scrollY in px (stage-group transform input). */
  scrollY: number;
  /** Lenis listener writes |velocity|; `useFrame` decays it toward 0. */
  scrollVelocity: number;
  /**
   * Unprojected scene-plane coordinates, written ONLY when `pointer: fine`
   * (D-06); stays inactive (false) on touch/keyboard, where the listener is
   * never installed.
   */
  pointer: ScenePointer;
  /** project-bento hover writes a document-space px rect; null = no hover. */
  hoverRect: { x: number; y: number; w: number; h: number } | null;
  /** Chunk reads `#activity [data-level]` cells once (Contract 4); null = fallback. */
  heatmapLevels: Uint8Array | null;
  /** transition-link writes the route-transition OUT/IN state (WP-D). */
  transition: { phase: "idle" | "out" | "in"; t: number; startedAt: number };
  /** IntersectionObserver producer (chunk): #hero/#contact in view, tab visible. */
  ambientVisible: boolean;
  /**
   * performance.now() timestamp when the boot-sequence hero intro timeline
   * completed (0 = not yet / never runs on touch) — the D-09 boot-beat
   * handshake.
   */
  introBeatAt: number;
  /**
   * true while the tab is hidden (or, Wave 1 only, once the hero has scrolled
   * fully past per D-05) — every per-frame body early-returns.
   */
  paused: boolean;
  /** No-op until StageCanvas.onCreated captures R3F `state.invalidate` (WP-B). */
  invalidate: () => void;
}

export interface SceneBridgeState extends StageBridge {
  /**
   * Wave-1 legacy: hero scroll-exit progress 0..1 (D-05) — 0 = hero fully in
   * view, 1 = hero fully scrolled past. Written by constellation-canvas's two
   * progress producers, read by constellation.tsx. Retired together with
   * those files when WP-B lands the stage chunk (`formation`/`pageProgress`
   * supersede it).
   */
  scrollProgress: number;
}

export const sceneBridge: SceneBridgeState = {
  // "constellation" is the hero/homepage default; StageFormation markers
  // overwrite it on routes that want a different field shape (halo/rest).
  formation: { from: "constellation", to: "constellation", t: 0 },
  routeFormation: "constellation",
  sectionProgress: 0,
  pageProgress: 0,
  scrollY: 0,
  scrollVelocity: 0,
  pointer: { x: 0, y: 0, active: false },
  hoverRect: null,
  heatmapLevels: null,
  transition: { phase: "idle", t: 0, startedAt: 0 },
  ambientVisible: false,
  introBeatAt: 0,
  paused: false,
  invalidate: () => {
    // Intentionally empty: replaced by R3F state.invalidate in StageCanvas
    // onCreated (WP-B). Dead-letter writes before then must cost nothing.
  },
  scrollProgress: 0,
};
