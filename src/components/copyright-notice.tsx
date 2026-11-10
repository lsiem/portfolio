"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

const subscribe = () => () => {};

/**
 * Footer copyright line. The pages are prerendered, so the server only knows
 * the year of the last build; after hydration the visitor's current year wins.
 */
export function CopyrightNotice({ buildYear }: { buildYear: number }) {
  const t = useTranslations("footer");
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => buildYear,
  );

  return <span>{t("copyright", { year })}</span>;
}
