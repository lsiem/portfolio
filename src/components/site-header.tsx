import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";

const SECTIONS = ["career", "projects", "skills", "about", "contact"] as const;

export async function SiteHeader() {
  const t = await getTranslations("nav");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          aria-label={`Lasse Siemoneit, ${t("home")}`}
          className="font-mono text-sm font-semibold tracking-tight"
        >
          <span className="text-accent">~/</span>lsiem
        </Link>
        <nav aria-label={t("label")} className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1 font-mono text-[13px] text-muted">
            {SECTIONS.map((id) => (
              <li key={id}>
                <Link
                  href={`/#${id}`}
                  className="rounded-md px-2.5 py-1.5 transition-colors hover:bg-surface-2 hover:text-fg"
                >
                  {t(id)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2 lg:ml-2">
          <Link
            href="/skills"
            className="grid h-9 place-items-center rounded-md border border-accent/40 bg-accent-soft px-3 font-mono text-xs text-accent transition-colors hover:border-accent"
          >
            {t("matrix")}
          </Link>
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
