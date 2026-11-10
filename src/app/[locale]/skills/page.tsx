import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "@/components/icons";
import { SkillMatrixExplorer } from "@/components/skill-matrix-explorer";
import { Link } from "@/i18n/navigation";
import { getSkillMatrix } from "@/lib/content";
import { localeAlternates, openGraphMetadata, siteMetadataBase } from "@/lib/seo";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const title = `${t("skillsTitle")} – Lasse Siemoneit`;

  return {
    metadataBase: siteMetadataBase,
    title,
    description: t("skillsDescription"),
    alternates: localeAlternates("/skills"),
    ...openGraphMetadata({
      title,
      description: t("skillsDescription"),
      locale,
      pathname: "/skills",
    }),
  };
}

export default async function SkillsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("matrix");
  const rows = getSkillMatrix(locale);

  return (
    <main id="main-content" tabIndex={-1} className="relative isolate outline-none">
      <div aria-hidden="true" className="bg-grid absolute inset-x-0 top-0 -z-10 h-96" />
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <Link
          href="/#skills"
          className="inline-flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-fg"
        >
          <ArrowLeft />
          {t("back")}
        </Link>
        <header className="mt-8 max-w-2xl">
          <p className="eyebrow">{t("eyebrow")}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">{t("intro")}</p>
        </header>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {([1, 2, 3, 4] as const).map((level) => (
            <div key={level} className="bg-surface p-4">
              <dt className="font-mono text-sm font-semibold text-accent">{"+".repeat(level)}</dt>
              <dd className="mt-1.5 text-sm leading-relaxed text-muted">{t(`level${level}`)}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <SkillMatrixExplorer rows={rows} />
        </div>
      </div>
    </main>
  );
}
