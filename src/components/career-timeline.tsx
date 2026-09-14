import type { CareerEntry } from "../../content/shared/types";
import { CareerSpine } from "@/components/motion/career-spine";
import { Reveal } from "@/components/motion/reveal";

type CareerTimelineProps = {
  entries: readonly CareerEntry[];
  intro: string;
  title: string;
  presentLabel: string;
  opensInNewTabLabel: string;
};

function formatMonth(value: string | null, present: string): string {
  if (!value) return present;
  const [year, month] = value.split("-");
  if (!year || !month) return present;
  return `${month}/${year}`;
}

export function CareerTimeline({
  entries,
  intro,
  title,
  presentLabel,
  opensInNewTabLabel,
}: CareerTimelineProps) {
  return (
    <section
      id="career"
      aria-labelledby="career-heading"
      className="mx-auto w-full max-w-[1440px] scroll-mt-24 px-6"
    >
      <div className="lg:grid lg:grid-cols-[5rem_minmax(0,46rem)] lg:gap-6">
        <CareerSpine entries={entries} />
        <div className="flex flex-col gap-6">
          <h2
            id="career-heading"
            className="font-mono text-xs uppercase tracking-[0.25em] text-muted"
          >
            {title}
          </h2>
          <p className="max-w-2xl text-muted">{intro}</p>
          <ol className="flex flex-col gap-8">
            {entries.map((entry) => {
              const isCenterpiece = entry.slug === "itsc";
              const header = (
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-medium tracking-tight">
                    {entry.orgUrl ? (
                      <a
                        href={entry.orgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent"
                      >
                        {entry.org}
                        <span className="sr-only">
                          {" "}
                          ({opensInNewTabLabel})
                        </span>
                      </a>
                    ) : (
                      entry.org
                    )}
                  </h3>
                  <p className="font-mono text-xs text-muted">
                    {formatMonth(entry.from, presentLabel)} –{" "}
                    {formatMonth(entry.to, presentLabel)}
                    {entry.location ? ` · ${entry.location}` : ""}
                  </p>
                </div>
              );
              const techStack =
                entry.techStack.length > 0 ? (
                  <ul className="flex flex-wrap gap-2 font-mono text-xs text-muted">
                    {entry.techStack.map((tech) => (
                      <li
                        key={tech}
                        className="chip rounded border border-border px-2 py-0.5"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                ) : null;

              if (isCenterpiece) {
                return (
                  <li key={entry.slug} className="flex flex-col gap-3">
                    <Reveal className="flex flex-col gap-3">
                      {header}
                      {entry.intro ? (
                        <p className="text-muted">{entry.intro}</p>
                      ) : null}
                    </Reveal>
                    <ol className="flex flex-col gap-3 border-l border-border pl-4">
                      {entry.roles.map((role, index) => (
                        <li key={`${entry.slug}-${index}`}>
                          <Reveal emphasis className="flex flex-col gap-1">
                            <p className="font-medium">
                              {role.title}
                              <span className="ml-2 font-mono text-xs text-muted">
                                {formatMonth(role.from, presentLabel)} –{" "}
                                {formatMonth(role.to, presentLabel)}
                              </span>
                            </p>
                            <p className="text-sm text-muted">
                              {role.description}
                            </p>
                          </Reveal>
                        </li>
                      ))}
                    </ol>
                    {techStack ? <Reveal>{techStack}</Reveal> : null}
                  </li>
                );
              }

              return (
                <li key={entry.slug} className="flex flex-col gap-3">
                  <Reveal className="flex flex-col gap-3">
                    {header}
                    {entry.intro ? (
                      <p className="text-muted">{entry.intro}</p>
                    ) : null}
                    <ol className="flex flex-col gap-3 border-l border-border pl-4">
                      {entry.roles.map((role, index) => (
                        <li
                          key={`${entry.slug}-${index}`}
                          className="flex flex-col gap-1"
                        >
                          <p className="font-medium">
                            {role.title}
                            <span className="ml-2 font-mono text-xs text-muted">
                              {formatMonth(role.from, presentLabel)} –{" "}
                              {formatMonth(role.to, presentLabel)}
                            </span>
                          </p>
                          <p className="text-sm text-muted">
                            {role.description}
                          </p>
                        </li>
                      ))}
                    </ol>
                    {techStack}
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
