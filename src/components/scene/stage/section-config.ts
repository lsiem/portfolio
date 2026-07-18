import { getCaseStudies, getPages } from "@/lib/content";
import { routing } from "@/i18n/routing";
import type { FormationId } from "../scene-bridge";

/**
 * Section choreography config (DESIGN-SPEC §3, §5.1 Contract 2 — WP-C). Two
 * registries live here:
 *
 * 1. `SECTION_SEQUENCE` — the homepage's scroll stations in document order.
 *    Both scroll producers resolve it against the live DOM (sections missing
 *    from a route simply don't participate), and WP-B's formation engine uses
 *    the same ids to key `MeasuredLayout.sections`.
 * 2. The route→formation registry — keys derived from the SAME `content.ts`
 *    slugs that generate the routes (Weltlinie graft), so a page and its
 *    formation can never drift apart. Unknown route → "rest": degrades to
 *    calm, never crashes.
 *
 * BUNDLE CONTRACT: this module (transitively `@/lib/content` →
 * content-collections, which carries the compiled MDX bodies) may only be
 * imported from `stage/` modules — it lives in the lazy stage chunk (§2.2),
 * never in the eager route bundle. The content data is a build-time constant
 * already shipped in the route payloads; its weight here counts against the
 * non-blocking lab ceiling (`lighthouserc.webgl.json`, re-baselined by WP-E),
 * not the 184,643 B eager gate.
 */

export interface SectionStep {
  /** CSS selector of the section element (homepage `<section id>`). */
  el: string;
  /** The formation the field holds while this section owns the viewport. */
  formation: FormationId;
}

/**
 * Homepage stations in document order (§3 section table). For each ADJACENT
 * pair the scroll director creates one scrubbed boundary trigger; the touch
 * producer derives the identical boundaries via progress.ts.
 */
export const SECTION_SEQUENCE: ReadonlyArray<SectionStep> = [
  { el: "#hero", formation: "constellation" },
  { el: "#career", formation: "filament" },
  { el: "#projects", formation: "lattice" },
  { el: "#skills", formation: "orbits" },
  { el: "#about", formation: "frame" },
  { el: "#activity", formation: "grid" },
  { el: "#contact", formation: "glyph" },
];

/**
 * Locale-stripped route key → formation. Built once at module scope from the
 * content.ts slug sources (union across both locales — DE/EN slugs may or may
 * not coincide; either way the key set covers every generated route):
 *   ""                      → constellation (homepage scroll owns the rest)
 *   "case-studies/<slug>"   → halo
 *   "<page-slug>"           → rest  (about, impressum, datenschutz)
 */
function buildRouteRegistry(): ReadonlyMap<string, FormationId> {
  const registry = new Map<string, FormationId>();
  registry.set("", "constellation");
  for (const locale of routing.locales) {
    for (const caseStudy of getCaseStudies(locale)) {
      registry.set(`case-studies/${caseStudy.slug}`, "halo");
    }
    for (const page of getPages(locale)) {
      registry.set(page.slug, "rest");
    }
  }
  return registry;
}

const ROUTE_FORMATIONS: ReadonlyMap<string, FormationId> = buildRouteRegistry();

/**
 * Formation for a `usePathname()` value (locale-prefixed, `localePrefix:
 * "always"` — e.g. "/de", "/en/case-studies/elia", "/de/impressum"). The
 * safety net UNDER the `<StageFormation>` markers: consumers (conductor /
 * stage-canvas) fall back to it when no marker has written for the current
 * route — e.g. the homepage, which renders no marker. Unknown → "rest".
 */
export function formationForRoute(pathname: string): FormationId {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const routeSegments =
    first !== undefined &&
    (routing.locales as readonly string[]).includes(first)
      ? segments.slice(1)
      : segments;
  return ROUTE_FORMATIONS.get(routeSegments.join("/")) ?? "rest";
}
