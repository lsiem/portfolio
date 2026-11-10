"use client";

import { useTranslations } from "next-intl";
import { Moon, Sun } from "./icons";

/**
 * Two-state theme switch. Dark is the default; the choice is stored in
 * localStorage and applied before paint by the inline script in the layout.
 * Both icons are rendered and toggled via CSS, so there is no hydration
 * mismatch and no state to sync.
 */
export function ThemeToggle() {
  const t = useTranslations("theme");

  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage blocked: the choice simply lasts for this page view.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-9 place-items-center rounded-md border border-border text-muted transition-colors hover:border-border-strong hover:text-fg"
    >
      <span className="sr-only [[data-theme=light]_&]:hidden">{t("toLight")}</span>
      <span className="sr-only hidden [[data-theme=light]_&]:inline">{t("toDark")}</span>
      <Sun className="[[data-theme=light]_&]:hidden" />
      <Moon className="hidden [[data-theme=light]_&]:block" />
    </button>
  );
}
