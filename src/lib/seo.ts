import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { ContactInfo } from "../../content/shared/types";

/**
 * Absolute base URL for metadata. Production builds resolve to the real
 * domain https://lsiem.de; locally it falls back to localhost.
 */
export const siteMetadataBase = new URL(
  process.env.NODE_ENV === "production" ? "https://lsiem.de" : "http://localhost:3000",
);

/**
 * hreflang alternates for a pathname (unprefixed, e.g. "/" or
 * "/case-studies/foo"): self-referencing absolute URLs for de and en plus
 * x-default pointing at the German default variant.
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
  type?: "profile" | "article" | "website";
};

/**
 * openGraph + twitter fields for a locale-scoped page. The image is set
 * explicitly: a page-level `openGraph` object replaces the one inherited from
 * `[locale]/opengraph-image.tsx`, so sub-pages would otherwise ship without
 * `og:image`. Every page shares the locale's generated image.
 */
export function openGraphMetadata({
  title,
  description,
  locale,
  pathname,
  type = "website",
}: OpenGraphMetadataParams): Pick<Metadata, "openGraph" | "twitter"> {
  const url = new URL(
    getPathname({
      locale: locale as (typeof routing.locales)[number],
      href: pathname,
    }),
    siteMetadataBase,
  ).href;
  const image = {
    url: new URL(`/${locale}/opengraph-image`, siteMetadataBase).href,
    width: 1200,
    height: 630,
    alt: "Lasse Siemoneit – Product Owner & Software Engineer",
  };

  return {
    openGraph: {
      title,
      description,
      url,
      siteName: "Lasse Siemoneit",
      locale,
      type,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
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
 * Person JSON-LD for the overview page. All facts come from the
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
