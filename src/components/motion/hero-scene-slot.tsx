/**
 * Reserved background layer for the Phase-4 3D hero canvas (D-13). This is a
 * Server Component on purpose — no "use client", no hooks, no client JS shipped
 * in Phase 3. It renders an empty, non-interactive, aria-hidden layer sitting
 * behind the hero content.
 *
 * Phase 4 fills its children with the lazily-mounted, capability-gated 3D
 * <Canvas> (react-three-fiber) — no hero re-layout, no z-index/positioning
 * changes needed at that point. In Phase 3 it produces no visible output.
 */
export function HeroSceneSlot() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    />
  );
}
