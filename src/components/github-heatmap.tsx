import type { ContributionCalendar } from "@/lib/github";

type GitHubHeatmapLabels = {
  /** Localized grid summary, e.g. "GitHub contributions, last 12 months". */
  ariaSummary: string;
  /** Localized fallback line shown when `data` is null. */
  unavailable: string;
};

type GitHubHeatmapProps = {
  data: ContributionCalendar | null;
  labels: GitHubHeatmapLabels;
};

/** Fixed cell size in px — kept constant regardless of data so the grid never causes CLS. */
const CELL_SIZE = "h-[11px] w-[11px]";

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
 * Monochrome foreground-opacity ramp — never the accent color (UI-SPEC:
 * accent stays scarce and the grid must stay theme-adaptive).
 */
const BUCKET_CLASSNAME: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-border",
  1: "bg-foreground/20",
  2: "bg-foreground/40",
  3: "bg-foreground/70",
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
    <div className="flex flex-col gap-2">
      <div
        role="img"
        aria-label={labels.ariaSummary}
        className="flex w-fit gap-1 overflow-x-auto"
      >
        {data.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.contributionDays.map((day) => {
              const bucket = intensityBucket(day.contributionCount);
              return (
                // data-level (Kontinuum WP-D, DESIGN-SPEC §5.1 Contract 4):
                // the stage chunk reads `#activity [data-level]` once to lift
                // the REAL contribution levels into the 53×7 grid formation —
                // gzip-trivial dual-purpose markup, zero JS, zero new fetches.
                <div
                  key={day.date}
                  title={`${day.date}: ${day.contributionCount}`}
                  data-level={bucket}
                  className={`${CELL_SIZE} shrink-0 rounded-[2px] ${BUCKET_CLASSNAME[bucket]}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <span className="sr-only">
        {data.totalContributions} — {labels.ariaSummary}
      </span>
    </div>
  );
}
