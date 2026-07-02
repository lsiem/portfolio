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
    <main>
      <article>
        <header>
          <h1>{caseStudy.title}</h1>
          <p>{caseStudy.summary}</p>
          <dl>
            <dt>{t("role")}</dt>
            <dd>{caseStudy.role}</dd>
            <dt>{t("period")}</dt>
            <dd>{caseStudy.period}</dd>
            <dt>{t("stack")}</dt>
            <dd>{caseStudy.stack.join(", ")}</dd>
          </dl>
        </header>
        <MDXContent code={caseStudy.mdx} />
      </article>
    </main>
  );
}
