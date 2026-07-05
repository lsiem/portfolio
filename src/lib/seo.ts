import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { ContactInfo } from "../../content/shared/types";

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

/** Params for {@link openGraphMetadata}. */
export type OpenGraphMetadataParams = {
  title: string;
  description: string;
  locale: string;
  /** Unprefixed pathname, e.g. "/" or "/case-studies/foo" — mirrors {@link localeAlternates}. */
  pathname: string;
};

/**
 * openGraph + twitter textual fields for a locale-scoped page (TECH-05).
 * Deliberately omits `images` — the `opengraph-image.tsx` file convention
 * auto-emits `og:image`/`twitter:image`, so hand-wiring an image URL here
 * would create a second, conflicting source of truth.
 */
export function openGraphMetadata({
  title,
  description,
  locale,
  pathname,
}: OpenGraphMetadataParams): Pick<Metadata, "openGraph" | "twitter"> {
  const url = new URL(
    getPathname({
      locale: locale as (typeof routing.locales)[number],
      href: pathname,
    }),
    siteMetadataBase,
  ).href;

  return {
    openGraph: {
      title,
      description,
      url,
      siteName: "Lasse Siemoneit",
      locale,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** schema.org Person structured data, server-rendered as inline JSON-LD. */
export type PersonJsonLd = {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  jobTitle: string;
  url: string;
  email: string;
  sameAs: string[];
  inLanguage: string;
};

/**
 * Person JSON-LD for the overview page (TECH-05). All facts come from the
 * typed content model via `contact` — never hardcoded — so DE/EN and future
 * contact updates stay in sync automatically.
 */
export function personJsonLd(contact: ContactInfo, locale: string): PersonJsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: contact.name,
    jobTitle: contact.role,
    url: `${siteMetadataBase.origin}/${locale}`,
    email: `mailto:${contact.email}`,
    sameAs: [contact.github, contact.linkedin],
    inLanguage: locale,
  };
}
