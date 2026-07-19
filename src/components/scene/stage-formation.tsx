"use client";

import { useEffect } from "react";
import { sceneBridge, type FormationId } from "./scene-bridge";

/**
 * Route-formation marker (DESIGN-SPEC §5.1 Contract 1). Pages that want a
 * specific field shape (case studies -> "halo", prose/legal -> "rest") render
 * this near-zero-cost client marker; it writes `bridge.routeFormation` once
 * on mount and renders nothing. Without a mounted canvas the write is a dead
 * letter on the one-way D-08 bridge — the DOM is byte-render-identical either
 * way, so excluded visitors pay nothing.
 */
export function StageFormation({ id }: { id: FormationId }) {
  useEffect(() => {
    sceneBridge.routeFormation = id;
  }, [id]);
  return null;
}
