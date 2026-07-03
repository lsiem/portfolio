import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MDXContent } from "@content-collections/mdx/react";
import { routing } from "@/i18n/routing";
import { getCaseStudies, getCaseStudy } from "@/lib/content";
import { localeAlternates, siteMetadataBase } from "@/lib/seo";

type Props = Readonly<{ params: Promise<{ locale: string; slug: string }> }>;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getCaseStudies(locale).map((caseStudy) => ({
      locale,
      slug: caseStudy.slug,
    })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const caseStudy = getCaseStudy(locale, slug);
  if (!caseStudy) {
    return {};
  }

  return {
    metadataBase: siteMetadataBase,
    title: caseStudy.title,
    description: caseStudy.summary,
    alternates: localeAlternates(`/case-studies/${slug}`),
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { locale, slug } = await params;
  // REQUIRED for static rendering — every layout AND page under [locale]
  setRequestLocale(locale);

  const caseStudy = getCaseStudy(locale, slug);
  if (!caseStudy) {
    notFound();
  }

  const t = await getTranslations("caseStudy");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-20 sm:py-28">
      <article className="flex flex-col gap-10">
        <header className="flex flex-col gap-6 border-b border-border pb-10">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            {caseStudy.title}
          </h1>
          <p className="text-lg text-muted">{caseStudy.summary}</p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-mono text-sm">
            <dt className="text-muted">{t("role")}</dt>
            <dd>{caseStudy.role}</dd>
            <dt className="text-muted">{t("period")}</dt>
            <dd>{caseStudy.period}</dd>
            <dt className="text-muted">{t("stack")}</dt>
            <dd>{caseStudy.stack.join(", ")}</dd>
          </dl>
        </header>
        <div className="flex flex-col text-[15px] leading-relaxed [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
          <MDXContent code={caseStudy.mdx} />
        </div>
      </article>
    </main>
  );
}
