import { appendFileSync } from "node:fs";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  // #region agent log
  appendFileSync("/opt/cursor/logs/debug.log", `${JSON.stringify({ hypothesisId: "A,B,C", location: "src/app/[locale]/not-found.tsx:NotFound", message: "localized not-found entered", data: {}, timestamp: Date.now() })}\n`);
  // #endregion
  const t = await getTranslations("notFound");
  // #region agent log
  appendFileSync("/opt/cursor/logs/debug.log", `${JSON.stringify({ hypothesisId: "C", location: "src/app/[locale]/not-found.tsx:getTranslations", message: "not-found translations resolved", data: { title: t("title") }, timestamp: Date.now() })}\n`);
  // #endregion

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-24 sm:py-32"
    >
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
        {t("eyebrow")}
      </p>
      <h1 className="font-display text-[clamp(2.5rem,2rem+4vw,5rem)] leading-tight tracking-tight">
        {t("title")}
      </h1>
      <p className="max-w-xl text-lg text-muted">{t("description")}</p>
      <Link
        href="/"
        className="mt-2 w-fit rounded-full bg-foreground px-5 py-3 font-mono text-sm text-background transition-opacity hover:opacity-80"
      >
        ← {t("backHome")}
      </Link>
    </main>
  );
}
