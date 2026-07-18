import { StageGate } from "./stage-gate";

/**
 * Layout-level stage slot (DESIGN-SPEC §2.1). Server Component on purpose —
 * no "use client", no hooks, zero client JS of its own: the client boundary
 * is StageGate. Fixed, full-viewport, behind the DOM (-z-10), non-interactive,
 * aria-hidden — the single persistent home of the WebGL field. Because App
 * Router layouts never remount, whatever the gate mounts here survives
 * /de <-> /en and page <-> case-study navigations for free.
 *
 * The fixed inset-0 box is also the sizing context for the R3F <Canvas>
 * container: the lazy chunk's own wrapper is display:contents, so the canvas
 * always fills the viewport — no per-section positioning (the Phase-4 in-hero
 * HeroSceneSlot is retired; the hero keeps only a positioning/contrast div).
 *
 * LINT CONTRACT: This slot may only ever render StageGate. Hoisting a Canvas
 * above the gate re-creates the reverted d9b8e57 architecture
 * (04-VERIFICATION blocker 2).
 */
export function StageSlot() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    >
      <StageGate />
    </div>
  );
}
