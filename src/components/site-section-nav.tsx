"use client";

import { useTranslations } from "next-intl";
import { AnchorLink } from "@/components/motion/anchor-link";
import { usePathname } from "@/i18n/navigation";

const SECTIONS = [
  "career",
  "projects",
  "skills",
  "about",
  "activity",
] as const;

export function SiteSectionNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  if (pathname !== "/") return null;

  return (
    <nav aria-label={t("sections")} className="hidden lg:block">
      <ul className="flex items-center gap-5 font-mono text-xs text-muted">
        {SECTIONS.map((section) => (
          <li key={section}>
            <AnchorLink
              href={`#${section}`}
              className="transition-colors hover:text-foreground"
            >
              {t(section)}
            </AnchorLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
