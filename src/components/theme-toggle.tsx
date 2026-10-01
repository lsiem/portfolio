"use client";

import { useRef, useSyncExternalStore, type KeyboardEvent } from "react";
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

function ThemeIcon({ option }: { option: ThemeOption }) {
  const common = {
    viewBox: "0 0 16 16",
    "aria-hidden": true as const,
    className: "size-3.5 sm:hidden",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
  };

  if (option === "light") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="2.25" />
        <path d="M8 1.75v1.5M8 12.75v1.5M1.75 8h1.5M12.75 8h1.5M3.4 3.4l1.06 1.06M11.54 11.54l1.06 1.06M3.4 12.6l1.06-1.06M11.54 4.46l1.06-1.06" />
      </svg>
    );
  }

  if (option === "dark") {
    return (
      <svg {...common}>
        <path d="M10.2 2.2a5.2 5.2 0 1 0 3.6 8.9 4.4 4.4 0 0 1-3.6-8.9Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="2" y="2.5" width="12" height="8" rx="1" />
      <path d="M6 13.25h4M8 10.5v2.75" />
    </svg>
  );
}

/**
 * Three-state System / Light / Dark control (TECH-04, D-B). Renders a
 * `role="radiogroup"` with three `role="radio"` options — a single,
 * consistent ARIA pattern (no grouping role or pressed-state attribute
 * mixed in, per REVIEW finding 9). Below `sm` the words collapse to icons
 * so the locale switcher stays inside the header padding; the accessible
 * name stays the full label.
 */
export function ThemeToggle() {
  const t = useTranslations("theme");
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ): void => {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % THEME_OPTIONS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex =
        (currentIndex - 1 + THEME_OPTIONS.length) % THEME_OPTIONS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = THEME_OPTIONS.length - 1;
    }

    if (nextIndex === undefined) return;

    event.preventDefault();
    applyTheme(THEME_OPTIONS[nextIndex]);
    optionRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={t("label")}
      className="flex items-center gap-0.5 rounded-full border border-border px-1 py-1 font-mono text-xs"
    >
      {THEME_OPTIONS.map((option, index) => (
        <button
          key={option}
          ref={(element) => {
            optionRefs.current[index] = element;
          }}
          type="button"
          role="radio"
          aria-checked={theme === option}
          tabIndex={theme === option ? 0 : -1}
          onClick={() => applyTheme(option)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          aria-label={t(option)}
          className={`inline-flex items-center justify-center rounded-full border px-1.5 py-1 transition-colors sm:px-2 sm:py-0.5 ${
            theme === option
              ? "border-foreground/20 bg-foreground text-background"
              : "border-transparent text-muted hover:border-foreground/40 hover:text-foreground"
          }`}
        >
          <ThemeIcon option={option} />
          <span className="hidden sm:inline">{t(option)}</span>
        </button>
      ))}
    </div>
  );
}
