import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { SkillDomain } from "../../content/shared/types";
import { ArrowRight } from "./icons";

export async function SkillGroups({
  domains,
  matrixCount,
}: {
  domains: SkillDomain[];
  matrixCount: number;
}) {
  const t = await getTranslations("skills");

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {domains.map((domain) => (
        <div key={domain.domain} className="reveal panel p-5 sm:p-6">
          <h3 className="font-mono text-xs uppercase tracking-wider text-accent">
            {domain.domain}
          </h3>
          <ul className="mt-4 divide-y divide-border">
            {domain.skills.map((skill) => (
              <li key={skill.name} className="flex items-baseline justify-between gap-4 py-2.5 text-[15px]">
                <span>{skill.name}</span>
                <span className="shrink-0 font-mono text-sm text-muted">
                  <span aria-hidden="true">{t("years", { years: skill.years })}</span>
                  <span className="sr-only">{t("yearsAria", { years: skill.years })}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <Link
        href="/skills"
        className="reveal panel group relative flex flex-col justify-between overflow-hidden border-accent/40 p-5 sm:p-6"
      >
        <div aria-hidden="true" className="bg-glow pointer-events-none absolute inset-0" />
        <div className="relative">
          <p className="font-mono text-5xl font-semibold tracking-tighter text-accent">
            {matrixCount}
          </p>
          <h3 className="mt-3 text-lg font-semibold tracking-tight">{t("matrixTitle")}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-muted">
            {t("matrixText", { count: matrixCount })}
          </p>
        </div>
        <p className="relative mt-6 inline-flex items-center gap-2 font-mono text-sm text-accent">
          {t("matrixCta")}
          <ArrowRight className="transition-transform group-hover:translate-x-1" />
        </p>
      </Link>
    </div>
  );
}
