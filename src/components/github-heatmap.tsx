import type { ContributionCalendar } from "@/lib/github";

const OPACITY = [0, 0.3, 0.5, 0.75, 1];

function bucket(count: number): number {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
}

/** Contribution calendar as a plain CSS grid; the summary carries the meaning. */
export function GithubHeatmap({
  calendar,
  summary,
}: {
  calendar: ContributionCalendar;
  summary: string;
}) {
  return (
    <figure className="panel overflow-hidden p-5 sm:p-6">
      <div className="overflow-x-auto pb-1">
        <div
          aria-hidden="true"
          className="grid w-max grid-flow-col grid-rows-7 gap-[3px]"
        >
          {calendar.weeks.flatMap((week) =>
            week.contributionDays.map((day) => {
              const level = bucket(day.contributionCount);
              return (
                <span
                  key={day.date}
                  style={{
                    gridRowStart: day.weekday + 1,
                    background:
                      level === 0
                        ? "var(--surface-2)"
                        : `color-mix(in srgb, var(--accent) ${OPACITY[level] * 100}%, transparent)`,
                  }}
                  className="size-[11px] rounded-[2px]"
                />
              );
            }),
          )}
        </div>
      </div>
      <figcaption className="mt-4 font-mono text-xs text-muted">{summary}</figcaption>
    </figure>
  );
}
