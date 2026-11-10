import { getTranslations } from "next-intl/server";
import { formatMonth } from "@/lib/content";
import type { CareerEntry } from "../../content/shared/types";
import { ArrowUpRight } from "./icons";

export async function CareerTimeline({ entries }: { entries: CareerEntry[] }) {
  const t = await getTranslations("career");
  const common = await getTranslations("common");
  const period = (from: string, to: string | null) =>
    `${formatMonth(from)} – ${to ? formatMonth(to) : common("present")}`;

  return (
    <ol className="relative space-y-6 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border md:before:left-[calc(11rem+7px)]">
      {entries.map((entry) => (
        <li key={entry.slug} className="reveal relative grid gap-3 pl-8 md:grid-cols-[11rem_1fr] md:gap-0 md:pl-0">
          <span
            aria-hidden="true"
            className={`absolute left-0 top-1.5 size-[15px] rounded-full border-2 bg-bg md:left-[11rem] ${
              entry.to === null ? "border-accent" : "border-border-strong"
            }`}
          />
          <p className="font-mono text-xs text-muted md:pr-6 md:pt-1 md:text-right">
            {period(entry.from, entry.to)}
          </p>
          <div className="panel p-5 sm:p-6 md:ml-10">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="text-lg font-semibold tracking-tight">
                {entry.orgUrl ? (
                  <a
                    href={entry.orgUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 underline-offset-4 hover:text-accent hover:underline"
                  >
                    {entry.org}
                    <ArrowUpRight className="text-faint" />
                    <span className="sr-only">({common("opensInNewTab")})</span>
                  </a>
                ) : (
                  entry.org
                )}
              </h3>
              <p className="font-mono text-xs text-faint">{entry.location}</p>
            </div>
            <div className="mt-4 space-y-6">
              {entry.roles.map((role) => (
                <div key={role.title} className="border-l-2 border-accent/50 pl-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h4 className="font-medium text-accent">{role.title}</h4>
                    {entry.roles.length > 1 && (
                      <p className="font-mono text-xs text-muted">{period(role.from, role.to)}</p>
                    )}
                  </div>
                  <ul className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-muted">
                    {role.points.map((point) => (
                      <li key={point} className="relative pl-4 before:absolute before:left-0 before:top-[0.7em] before:h-px before:w-2 before:bg-faint">
                        {point}
                      </li>
                    ))}
                  </ul>
                  <ul aria-label={t("stack")} className="mt-3 flex flex-wrap gap-1.5">
                    {role.stack.map((item) => (
                      <li key={item} className="chip">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
