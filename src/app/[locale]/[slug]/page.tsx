import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getPage, getPages } from "@/lib/content";
import { localeAlternates, openGraphMetadata, siteMetadataBase } from "@/lib/seo";

type Props = Readonly<{ params: Promise<{ locale: string; slug: string }> }>;

// Only about, impressum and datenschutz render; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getPages(locale).map((page) => ({ locale, slug: page.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getPage(locale, slug);
  if (!page) return {};
  const description = page.description ?? page.title;

  return {
    metadataBase: siteMetadataBase,
    title: `${page.title} – Lasse Siemoneit`,
    description,
    alternates: localeAlternates(`/${slug}`),
    ...openGraphMetadata({ title: page.title, description, locale, pathname: `/${slug}` }),
  };
}

export default async function ProsePage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = getPage(locale, slug);
  if (!page) notFound();
  const nav = await getTranslations("nav");

  return (
    <main id="main-content" tabIndex={-1} className="relative isolate outline-none">
      <div aria-hidden="true" className="bg-grid absolute inset-x-0 top-0 -z-10 h-96" />
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft />
          {nav("home")}
        </Link>
        <h1 className="mt-8 border-b border-border pb-8 text-4xl font-semibold tracking-tight sm:text-5xl">
          {page.title}
        </h1>
        <article className="prose mt-10">
          <MDXContent code={page.mdx} />
        </article>
      </div>
    </main>
  );
}
