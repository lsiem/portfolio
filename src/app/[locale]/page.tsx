import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
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

  return (
    <main>
      <h1>Lasse Siemoneit</h1>
      <p>{t("role")}</p>
      <nav>
        <ul>
          <li>
            <Link href="/">{nav("home")}</Link>
          </li>
          <li>
            <a href="#projects">{nav("projects")}</a>
          </li>
          <li>
            <a href="#about">{nav("about")}</a>
          </li>
          <li>
            <a href="#contact">{nav("contact")}</a>
          </li>
        </ul>
      </nav>
    </main>
  );
}
