/**
 * Scene theme-token -> THREE.Color resolver (UI-SPEC "Constellation token
 * mapping"; RESEARCH Pattern 5). BROWSER-ONLY — only ever imported from
 * inside the lazy scene chunk (never touches the eager route bundle).
 * Resolves the four tokens the constellation needs (--muted, --border,
 * --accent, --foreground) from `getComputedStyle(documentElement)` —
 * globals.css tokens are plain hex, so no oklch parsing is needed.
 *
 * Re-resolves on the same two signals theme-toggle.tsx mutates/reads:
 *   - a MutationObserver on documentElement's `data-theme` attribute
 *     (explicit Light/Dark choice, theme-toggle.tsx applyTheme())
 *   - `matchMedia("(prefers-color-scheme: dark)")` change ("System" removes
 *     data-theme entirely, so the media query is the only remaining signal)
 *
 * No hardcoded hex anywhere in scene code (UI-SPEC hard rule): every color
 * that reaches a three.js material flows through this module. The only
 * fallback is a plain numeric grey (not a "#RRGGBB" string literal), used
 * only if a token computes to an empty string — which should never happen
 * post-mount since globals.css defines all four tokens unconditionally.
 */

import * as THREE from "three";

export interface SceneColors {
  muted: THREE.Color;
  border: THREE.Color;
  accent: THREE.Color;
  foreground: THREE.Color;
}

const TOKENS = {
  muted: "--muted",
  border: "--border",
  accent: "--accent",
  foreground: "--foreground",
} as const;

// Numeric (non-hex-string) fallback — see file header. 0x808080 = neutral grey.
const FALLBACK_COLOR = 0x808080;

function readColor(name: string): THREE.Color {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return raw ? new THREE.Color(raw) : new THREE.Color(FALLBACK_COLOR);
}

/** Resolve all four scene tokens right now. */
export function resolveSceneColors(): SceneColors {
  return {
    muted: readColor(TOKENS.muted),
    border: readColor(TOKENS.border),
    accent: readColor(TOKENS.accent),
    foreground: readColor(TOKENS.foreground),
  };
}

/**
 * Subscribe to theme changes and invoke `callback(colors)` with freshly
 * resolved colors whenever `data-theme` mutates or the OS color-scheme
 * preference changes (for visitors on "System"). Returns a teardown.
 */
export function observeThemeColors(
  callback: (colors: SceneColors) => void,
): () => void {
  const notify = (): void => callback(resolveSceneColors());

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === "data-theme") {
        notify();
        break;
      }
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", notify);

  return () => {
    observer.disconnect();
    media.removeEventListener("change", notify);
  };
}
