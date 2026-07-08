/**
 * Motion-token reader (D-08). BROWSER-ONLY utility — never import from a Server
 * Component. globals.css is the single source of truth for the --motion-* custom
 * properties (durations/easings/distances/staggers); this module only READS
 * them via getComputedStyle and converts to GSAP-friendly values:
 *   - durations & staggers: ms -> seconds (GSAP's numeric API is seconds)
 *   - distances: px -> plain number
 *   - easings: the raw cubic-bezier string
 *
 * SSR-safety (finding #4): getMotionToken guards `typeof window === "undefined"`
 * as its FIRST statement and returns a constant fallback, so it never calls
 * getComputedStyle/document during `next build` static compilation of
 * "use client" modules. Never call it as a component default-PARAMETER value
 * (default params execute during SSR render even in client components) — read
 * tokens INSIDE useGSAP/effect bodies instead.
 */

type DurationToken =
  | "--motion-duration-fast"
  | "--motion-duration-base"
  | "--motion-duration-slow"
  | "--motion-duration-chapter";

type EaseToken =
  | "--motion-ease-out"
  | "--motion-ease-in-out"
  | "--motion-ease-magnetic";

type DistanceToken =
  | "--motion-distance-sm"
  | "--motion-distance-md"
  | "--motion-distance-lg";

type StaggerToken =
  | "--motion-stagger-char"
  | "--motion-stagger-word"
  | "--motion-stagger-list";

export type MotionTokenName =
  | DurationToken
  | EaseToken
  | DistanceToken
  | StaggerToken;

// Constant fallbacks — mirror the globals.css canonical values, expressed in the
// already-converted units this reader returns (seconds / px / cubic-bezier).
const FALLBACKS: Record<MotionTokenName, number | string> = {
  "--motion-duration-fast": 0.15,
  "--motion-duration-base": 0.4,
  "--motion-duration-slow": 0.8,
  "--motion-duration-chapter": 1.2,
  "--motion-ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "--motion-ease-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
  "--motion-ease-magnetic": "cubic-bezier(0.33, 1, 0.68, 1)",
  "--motion-distance-sm": 8,
  "--motion-distance-md": 24,
  "--motion-distance-lg": 48,
  "--motion-stagger-char": 0.018,
  "--motion-stagger-word": 0.04,
  "--motion-stagger-list": 0.06,
};

const isEase = (name: MotionTokenName): name is EaseToken =>
  name.startsWith("--motion-ease-");

// Convert a raw computed CSS value ("400ms" / "0.4s" / "24px") to a number.
// Time values (ms/s) are normalized to SECONDS; lengths (px) to a plain number.
function parseNumericToken(raw: string, fallback: number): number {
  const value = raw.trim();
  if (value === "") return fallback;
  const numeric = parseFloat(value);
  if (Number.isNaN(numeric)) return fallback;
  if (value.endsWith("ms")) return numeric / 1000;
  if (value.endsWith("s")) return numeric; // already seconds
  return numeric; // px (or unitless)
}

// Memoize per token name — the CSS custom properties are static for the page
// lifetime, so a single getComputedStyle read per token is enough.
const cache = new Map<MotionTokenName, number | string>();

export function getMotionToken(
  name: DurationToken | DistanceToken | StaggerToken,
): number;
export function getMotionToken(name: EaseToken): string;
export function getMotionToken(name: MotionTokenName): number | string {
  // SSR guard MUST be the first statement (finding #4).
  if (typeof window === "undefined") return FALLBACKS[name];

  const cached = cache.get(name);
  if (cached !== undefined) return cached;

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();

  let resolved: number | string;
  if (isEase(name)) {
    resolved = raw === "" ? (FALLBACKS[name] as string) : raw;
  } else {
    resolved = parseNumericToken(raw, FALLBACKS[name] as number);
  }

  cache.set(name, resolved);
  return resolved;
}
