import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXContent } from "@content-collections/mdx/react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getCaseStudies, getCaseStudy } from "@/lib/content";
import { localeAlternates, openGraphMetadata, siteMetadataBase } from "@/lib/seo";

type Props = Readonly<{ params: Promise<{ locale: string; slug: string }> }>;

export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getCaseStudies(locale).map((caseStudy) => ({ locale, slug: caseStudy.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const caseStudy = getCaseStudy(locale, slug);
  if (!caseStudy) return {};
  const pathname = `/case-studies/${slug}`;

  return {
    metadataBase: siteMetadataBase,
    title: `${caseStudy.title} – Lasse Siemoneit`,
    description: caseStudy.summary,
    alternates: localeAlternates(pathname),
    ...openGraphMetadata({
      title: caseStudy.title,
      description: caseStudy.summary,
      locale,
      pathname,
      type: "article",
    }),
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const caseStudy = getCaseStudy(locale, slug);
  if (!caseStudy) notFound();
  const t = await getTranslations("caseStudy");

  return (
    <main id="main-content" tabIndex={-1} className="relative isolate outline-none">
      <div aria-hidden="true" className="bg-grid absolute inset-x-0 top-0 -z-10 h-96" />
      <div className="mx-auto w-full max-w-3xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft />
          {t("backToProjects")}
        </Link>
        <header className="mt-8">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {caseStudy.title}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted">{caseStudy.summary}</p>
          <dl className="panel mt-8 grid gap-5 p-5 font-mono text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-faint">{t("role")}</dt>
              <dd className="mt-1">{caseStudy.role}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-faint">{t("period")}</dt>
              <dd className="mt-1">{caseStudy.period}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wider text-faint">{t("stack")}</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {caseStudy.stack.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </dd>
            </div>
          </dl>
        </header>
        <article className="prose mt-12">
          <MDXContent code={caseStudy.mdx} />
        </article>
      </div>
    </main>
  );
}
