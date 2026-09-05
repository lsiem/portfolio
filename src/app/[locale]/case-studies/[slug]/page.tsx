import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MDXContent } from "@content-collections/mdx/react";
import { routing } from "@/i18n/routing";
import { getCaseStudies, getCaseStudy } from "@/lib/content";
import { Reveal } from "@/components/motion/reveal";
import { SplitHeading } from "@/components/motion/split-heading";
import { TransitionLink } from "@/components/motion/transition-link";
import { StageFormation } from "@/components/scene/stage-formation";
import { Link } from "@/i18n/navigation";
import {
  localeAlternates,
  openGraphMetadata,
  siteMetadataBase,
} from "@/lib/seo";

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
    ...openGraphMetadata({
      title: caseStudy.title,
      description: caseStudy.summary,
      locale,
      pathname: `/case-studies/${slug}`,
      type: "article",
    }),
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
  const caseStudies = getCaseStudies(locale);
  const currentIndex = caseStudies.findIndex((entry) => entry.slug === slug);
  const nextCaseStudy =
    currentIndex >= 0
      ? caseStudies[(currentIndex + 1) % caseStudies.length]
      : undefined;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-6 py-20 sm:py-28"
    >
      {/* Kontinuum (WP-D, DESIGN-SPEC §3): sparse orbital ring behind the h1
          for capable tiers — a dead-letter bridge write for everyone else. */}
      <StageFormation id="halo" />
      <article className="flex flex-col gap-10">
        {/* Engineered but reading-first (D-15): Bricolage display H1, gentle
            reveals that support comprehension — no chapter-level drama. */}
        <header className="flex flex-col gap-6 border-b border-border pb-10">
          <Link
            href="/#projects"
            className="w-fit font-mono text-sm text-muted transition-colors hover:text-foreground"
          >
            ← {t("backToProjects")}
          </Link>
          <SplitHeading
            as="h1"
            className="font-display text-[clamp(2.25rem,1.6rem+3vw,4rem)] leading-[1.1] tracking-tight"
          >
            {caseStudy.title}
          </SplitHeading>
          <Reveal className="flex flex-col gap-6">
            <p className="text-lg text-muted">{caseStudy.summary}</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 font-mono text-sm">
              <dt className="text-muted">{t("role")}</dt>
              <dd>{caseStudy.role}</dd>
              <dt className="text-muted">{t("period")}</dt>
              <dd>{caseStudy.period}</dd>
              <dt className="text-muted">{t("stack")}</dt>
              <dd>{caseStudy.stack.join(", ")}</dd>
            </dl>
          </Reveal>
        </header>
        <div className="flex flex-col text-[15px] leading-relaxed [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
          <MDXContent code={caseStudy.mdx} />
        </div>
        {nextCaseStudy && nextCaseStudy.slug !== slug ? (
          <footer className="border-t border-border pt-8">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {t("nextCaseStudy")}
            </p>
            <TransitionLink
              href={`/case-studies/${nextCaseStudy.slug}`}
              className="text-xl font-semibold tracking-tight transition-colors hover:text-accent"
            >
              {nextCaseStudy.title} →
            </TransitionLink>
          </footer>
        ) : null}
      </article>
    </main>
  );
}
