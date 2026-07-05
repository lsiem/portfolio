"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

type ThemeOption = "system" | "light" | "dark";

const THEME_OPTIONS: readonly ThemeOption[] = ["system", "light", "dark"];

// Mirrors the light/dark --background token values in globals.css and the
// viewport.themeColor media colors declared in layout.tsx.
const LIGHT_THEME_COLOR = "#fafaf9";
const DARK_THEME_COLOR = "#0a0a0a";

// Module-scope pub/sub so `applyTheme` (an imperative DOM/localStorage
// mutation, not React state) can notify the subscribed component to
// re-render — the useSyncExternalStore pattern RESEARCH §3 recommends to
// read localStorage without a setState-in-effect anti-pattern. Kept at
// module scope (outside the component) so the mutation is a plain
// synchronous side effect of a click, not part of the render closure.
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): ThemeOption {
  try {
    const stored = window.localStorage.getItem("theme");
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

// Stable neutral default on the server so hydration never mismatches
// (RESEARCH Pitfall 3) — the no-flash inline script in layout.tsx already
// applied the real data-theme to the DOM before paint; this control only
// needs to reconcile its own displayed active segment after mount.
function getServerSnapshot(): ThemeOption {
  return "system";
}

function restoreSystemThemeColorMeta(): void {
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    const media = meta.getAttribute("media") ?? "";
    meta.setAttribute(
      "content",
      media.includes("dark") ? DARK_THEME_COLOR : LIGHT_THEME_COLOR,
    );
  }
}

function updateThemeColorMeta(theme: Exclude<ThemeOption, "system">): void {
  const explicitColor =
    theme === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR;
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
    meta.setAttribute("content", explicitColor);
  }
}

function applyTheme(next: ThemeOption): void {
  try {
    if (next === "system") {
      window.localStorage.removeItem("theme");
      delete document.documentElement.dataset.theme;
      restoreSystemThemeColorMeta();
    } else {
      window.localStorage.setItem("theme", next);
      document.documentElement.dataset.theme = next;
      updateThemeColorMeta(next);
    }
  } catch {
    // localStorage unavailable (e.g. private browsing) — the dataset/meta
    // mutations above may be partially applied for this page view only;
    // notify listeners regardless so the control still reflects the click.
  }
  for (const listener of listeners) listener();
}

/**
 * Three-state System / Light / Dark control (TECH-04, D-B). Renders a
 * `role="radiogroup"` with three `role="radio"` options — a single,
 * consistent ARIA pattern (no grouping role or pressed-state attribute
 * mixed in, per REVIEW finding 9).
 */
export function ThemeToggle() {
  const t = useTranslations("theme");
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <div
      role="radiogroup"
      aria-label={t("label")}
      className="flex items-center gap-0.5 rounded-full border border-border px-1 py-1 font-mono text-xs"
    >
      {THEME_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={theme === option}
          onClick={() => applyTheme(option)}
          className={`rounded-full border border-transparent px-2 py-0.5 transition-colors hover:border-foreground/40 hover:text-foreground ${
            theme === option ? "text-foreground" : "text-muted"
          }`}
        >
          {t(option)}
        </button>
      ))}
    </div>
  );
}
