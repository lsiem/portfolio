"use client";

import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

function subscribeLocation(callback: () => void): () => void {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}

function getSearchSnapshot(): string {
  return window.location.search;
}

function getServerSearchSnapshot(): string {
  return "";
}

/**
 * Language switcher: a REAL anchor to the same page in the other locale,
 * causing a full navigation (never a client-side string swap).
 */
export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const search = useSyncExternalStore(
    subscribeLocation,
    getSearchSnapshot,
    getServerSearchSnapshot,
  );
  const t = useTranslations("common");

  const otherLocale = routing.locales.find((l) => l !== locale) ?? "de";
  const webgl = new URLSearchParams(search).get("webgl");
  const href = webgl === "force" || webgl === "off"
    ? `${pathname}?webgl=${webgl}`
    : pathname;

  return (
    <Link
      href={href}
      locale={otherLocale}
      rel="alternate"
      hrefLang={otherLocale}
      className="rounded-full border border-border px-3 py-1 font-mono text-xs text-muted transition-colors hover:border-foreground/40 hover:text-foreground"
    >
      {t("languageSwitcher")}
    </Link>
  );
}
