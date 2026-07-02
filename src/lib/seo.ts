import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Absolute base URL for metadata. On Vercel deployments this resolves to the
 * production URL of the project; locally it falls back to localhost.
 * Phase 2 switches this to https://lsiem.de with a one-line change.
 */
export const siteMetadataBase = new URL(
  process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000",
);

/**
 * hreflang alternates for a pathname (unprefixed, e.g. "/" or
 * "/case-studies/foo"): self-referencing absolute URLs for de and en plus
 * x-default pointing at the German default variant (D-09).
 */
export function localeAlternates(pathname: string): Metadata["alternates"] {
  const absoluteUrl = (locale: (typeof routing.locales)[number]) =>
    new URL(getPathname({ locale, href: pathname }), siteMetadataBase).href;

  return {
    languages: {
      de: absoluteUrl("de"),
      en: absoluteUrl("en"),
      "x-default": absoluteUrl(routing.defaultLocale),
    },
  };
}
