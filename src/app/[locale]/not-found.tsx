import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative isolate flex flex-1 items-center outline-none"
    >
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10" />
      <div className="mx-auto w-full max-w-3xl px-4 py-24 sm:px-6">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted">{t("description")}</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center rounded-md bg-accent px-5 text-sm font-medium text-accent-fg"
        >
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
