import type { MetadataRoute } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCaseStudies, getPages } from "@/lib/content";

const SITE_ORIGIN = "https://lsiem.de";
type Locale = (typeof routing.locales)[number];

function absoluteUrl(locale: Locale, pathname: string): string {
  return new URL(getPathname({ locale, href: pathname }), SITE_ORIGIN).href;
}

function languageAlternates(pathname: string): Record<string, string> {
  return {
    de: absoluteUrl("de", pathname),
    en: absoluteUrl("en", pathname),
    "x-default": absoluteUrl(routing.defaultLocale, pathname),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pagePaths = getPages(routing.defaultLocale).map(
    (page) => `/${page.slug}`,
  );
  const caseStudyPaths = getCaseStudies(routing.defaultLocale).map(
    (caseStudy) => `/case-studies/${caseStudy.slug}`,
  );
  const paths = ["/", ...pagePaths, ...caseStudyPaths];

  return paths.flatMap((pathname) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(locale, pathname),
      alternates: { languages: languageAlternates(pathname) },
      changeFrequency: pathname === "/" ? "weekly" : "monthly",
      priority: pathname === "/" ? 1 : pathname.startsWith("/case-studies/") ? 0.8 : 0.5,
    })),
  );
}
