import type { ContributionCalendar } from "@/lib/github";

type GitHubHeatmapLabels = {
  /** Localized grid summary, e.g. "GitHub contributions, last 12 months". */
  ariaSummary: string;
  /** Localized fallback line shown when `data` is null. */
  unavailable: string;
  /** Localized visible total, e.g. "661 contributions in 12 months". */
  total: string;
};

type GitHubHeatmapProps = {
  data: ContributionCalendar | null;
  labels: GitHubHeatmapLabels;
};

/**
 * Bucket a day's contribution count into one of 5 intensity steps using
 * fixed thresholds (RESEARCH §2). Bucket 0 = no contributions.
 */
function intensityBucket(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 9) return 3;
  return 4;
}

/**
 * Monochrome foreground/background mixes — never the accent color (UI-SPEC:
 * accent stays scarce and the grid must stay theme-adaptive). Bucket 0 is
 * mixed strongly enough to clear ~3:1 against the page background in both
 * themes; fixed 11px cells used to overflow the reading column.
 */
const BUCKET_CLASSNAME: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-[color-mix(in_oklab,var(--foreground)_44%,var(--background))]",
  1: "bg-[color-mix(in_oklab,var(--foreground)_60%,var(--background))]",
  2: "bg-[color-mix(in_oklab,var(--foreground)_74%,var(--background))]",
  3: "bg-[color-mix(in_oklab,var(--foreground)_88%,var(--background))]",
  4: "bg-foreground",
};

/**
 * Server Component rendering a week x day GitHub contribution grid
 * (TECH-08 / CTX-04). Renders ONLY the localized fallback line when `data`
 * is null (missing token or failed build-time fetch) — never a broken
 * grid or a runtime retry to GitHub.
 */
export function GitHubHeatmap({ data, labels }: GitHubHeatmapProps) {
  if (!data) {
    return <p className="text-muted">{labels.unavailable}</p>;
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="font-mono text-xs text-muted">{labels.total}</p>
      <div
        role="img"
        aria-label={`${labels.total}. ${labels.ariaSummary}`}
        className="grid w-full gap-[2px]"
        style={{
          gridTemplateColumns: `repeat(${data.weeks.length}, minmax(0, 1fr))`,
        }}
      >
        {data.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex min-w-0 flex-col gap-[2px]">
            {week.contributionDays.map((day) => {
              const bucket = intensityBucket(day.contributionCount);
              return (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.contributionCount}`}
                  className={`aspect-square w-full rounded-[1px] ${BUCKET_CLASSNAME[bucket]}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
