import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { MDXContent } from "@content-collections/mdx/react";
import { routing } from "@/i18n/routing";
import { getPage, getPages } from "@/lib/content";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { localeAlternates, siteMetadataBase } from "@/lib/seo";

type Props = Readonly<{ params: Promise<{ locale: string; slug: string }> }>;

// Only the prose-page slugs from generateStaticParams render — unknown slugs 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getPages(locale).map((page) => ({ locale, slug: page.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const page = getPage(locale, slug);
  if (!page) {
    return {};
  }

  return {
    metadataBase: siteMetadataBase,
    title: page.title,
    description: page.description,
    alternates: localeAlternates(`/${slug}`),
  };
}

export default async function ProsePage({ params }: Props) {
  const { locale, slug } = await params;
  // REQUIRED for static rendering — every layout AND page under [locale]
  setRequestLocale(locale);

  const page = getPage(locale, slug);
  if (!page) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-20 sm:py-28">
      {/* Engineered reading-first (D-15): promote page.title to a single
          top-level Bricolage display <h1> (the MDX body starts at <h2>, so the
          page had no <h1> — WCAG single-h1 + display identity, finding #4). */}
      <header className="border-b border-border pb-10">
        <SplitHeading
          as="h1"
          className="font-display text-[clamp(2.25rem,1.6rem+3vw,4rem)] leading-[1.1] tracking-tight"
        >
          {page.title}
        </SplitHeading>
      </header>
      <Reveal>
        <article className="flex flex-col text-[15px] leading-relaxed [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
          <MDXContent code={page.mdx} />
        </article>
      </Reveal>
    </main>
  );
}
