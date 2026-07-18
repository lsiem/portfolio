/**
 * Shared stage-chunk types (DESIGN-SPEC §5.1 Contract 2). Types ONLY — no
 * runtime code, so importing from anywhere (eager or lazy) costs zero bytes.
 *
 * Ownership note: Contract 2 is implemented by WP-B (`buildFormation`) with
 * WP-C supplying the input (`measure.ts` -> `MeasuredLayout`). This file was
 * created by WP-C because WP-B's copy did not exist yet at write time; the
 * shapes below match the frozen contract exactly, so if WP-B lands its own
 * definition the two are structurally identical and integration only has to
 * dedupe the file, never reconcile shapes.
 */

/**
 * An axis-aligned rect in DOCUMENT space (CSS px): `getBoundingClientRect()`
 * plus the scroll offset at measure time (`rect.top + scrollY`,
 * `rect.left + scrollX`). Document space is the coordinate system formation
 * targets live in — per DESIGN-SPEC §3's global rule the stage group applies
 * `-scrollY * worldPerPixel` per frame, so doc-space targets track their DOM
 * twins during scroll without re-measurement.
 */
export interface DocRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * One measurement pass over the live DOM (Contract 2), consumed by WP-B's
 * `buildFormation(id, layout, count)`. Produced exclusively by
 * `measure.ts#measureLayout()` — after `document.fonts.ready`, re-produced on
 * debounced-200ms resize and on locale route change.
 */
export interface MeasuredLayout {
  /**
   * Doc-space rects of the stage sections, keyed by bare section id
   * ("hero", "career", ... — `SECTION_SEQUENCE` selectors minus the "#").
   * Only sections present in the current route's DOM appear.
   */
  sections: Record<string, DocRect>;
  /** Doc-space rects of the project bento cells (`#projects > ul > li`, one per project). */
  bentoCells: DocRect[];
  /**
   * Doc-space x of the career rail (`filament` anchor, lg+). Falls back to the
   * career section's left edge (then viewport center) when the rail is hidden.
   */
  spineX: number;
  /**
   * Contribution levels 0..4 read once from the SSR heatmap's per-cell
   * `data-level` attributes (Contract 4); null when the cells are absent or
   * malformed — the `grid` formation then uses its neutral wave-sheet fallback.
   */
  heatmap: Uint8Array | null;
  /** Viewport size (CSS px) at measure time. */
  viewport: { w: number; h: number };
  /**
   * World units per CSS px on the z=0 scene plane for the stage camera —
   * the single doc-space -> scene-space conversion factor (unprojected once
   * at measure time, DESIGN-SPEC §3 global rule).
   */
  worldPerPixel: number;
}
