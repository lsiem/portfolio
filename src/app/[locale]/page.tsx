import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCaseStudies } from "@/lib/content";
import { localeAlternates, siteMetadataBase } from "@/lib/seo";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return {
    metadataBase: siteMetadataBase,
    title: "Lasse Siemoneit",
    description: t("role"),
    alternates: localeAlternates("/"),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  // REQUIRED for static rendering — every layout AND page under [locale]
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const nav = await getTranslations("nav");
  const caseStudies = getCaseStudies(locale);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-20 px-6 py-20 sm:gap-28 sm:py-28">
      <section className="flex flex-col gap-5">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          Portfolio
        </p>
        <h1 className="text-5xl font-semibold tracking-tight sm:text-7xl">
          Lasse Siemoneit
        </h1>
        <p className="max-w-xl text-lg text-muted sm:text-xl">{t("role")}</p>
        <nav className="mt-2">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
            <li>
              <Link
                href="/"
                className="text-muted transition-colors hover:text-foreground"
              >
                {nav("home")}
              </Link>
            </li>
            <li>
              <a
                href="#projects"
                className="text-muted transition-colors hover:text-foreground"
              >
                {nav("projects")}
              </a>
            </li>
          </ul>
        </nav>
      </section>

      <section id="projects" className="flex scroll-mt-24 flex-col gap-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {t("caseStudies")}
        </h2>
        <ul className="flex flex-col overflow-hidden rounded-xl border border-border">
          {caseStudies.map((caseStudy) => (
            <li key={caseStudy.slug} className="border-b border-border last:border-b-0">
              <Link
                href={`/case-studies/${caseStudy.slug}`}
                className="group flex items-center justify-between gap-4 px-5 py-5 transition-colors hover:bg-foreground/5"
              >
                <span className="text-lg font-medium tracking-tight">
                  {caseStudy.title}
                </span>
                <span
                  aria-hidden
                  className="font-mono text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
