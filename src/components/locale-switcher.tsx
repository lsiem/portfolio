"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("common");
  const target = locale === "de" ? "en" : "de";

  return (
    <Link
      href={pathname}
      locale={target}
      lang={target}
      aria-label={t("switchLocaleAria")}
      className="grid h-9 place-items-center rounded-md border border-border px-2.5 font-mono text-xs uppercase text-muted transition-colors hover:border-border-strong hover:text-fg"
    >
      {target}
    </Link>
  );
}
