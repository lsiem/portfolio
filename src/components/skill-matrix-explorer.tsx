"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { MatrixRow } from "@/lib/content";
import type { SkillArea, SkillLevel } from "../../content/shared/types";
import { Search } from "./icons";

const LEVELS: SkillLevel[] = [1, 2, 3, 4];

function LevelMeter({ level, label }: { level: SkillLevel; label: string }) {
  return (
    <span role="img" aria-label={label} className="flex shrink-0 gap-[3px]">
      {LEVELS.map((step) => (
        <span
          key={step}
          className={`h-3.5 w-1.5 rounded-[2px] ${
            step <= level ? "bg-accent" : "bg-border-strong/60"
          }`}
        />
      ))}
    </span>
  );
}

export function SkillMatrixExplorer({ rows }: { rows: MatrixRow[] }) {
  const t = useTranslations("matrix");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<SkillArea | "all">("all");
  const [minLevel, setMinLevel] = useState<SkillLevel>(1);

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = rows.filter(
      (row) =>
        (area === "all" || row.area === area) &&
        row.level >= minLevel &&
        (needle === "" ||
          row.name.toLowerCase().includes(needle) ||
          row.category.toLowerCase().includes(needle)),
    );
    const map = new Map<string, { category: string; rows: MatrixRow[] }>();
    for (const row of filtered) {
      const group = map.get(row.categoryId) ?? { category: row.category, rows: [] };
      group.rows.push(row);
      map.set(row.categoryId, group);
    }
    return { total: filtered.length, list: [...map.entries()] };
  }, [rows, query, area, minLevel]);

  const filtersActive = query !== "" || area !== "all" || minLevel !== 1;
  const reset = () => {
    setQuery("");
    setArea("all");
    setMinLevel(1);
  };

  const areas: { value: SkillArea | "all"; label: string }[] = [
    { value: "all", label: t("areaAll") },
    { value: "software", label: t("areaSoftware") },
    { value: "infra", label: t("areaInfra") },
  ];

  const pill = (active: boolean) =>
    `h-9 rounded-md border px-3 font-mono text-xs transition-colors ${
      active
        ? "border-accent bg-accent-soft text-accent"
        : "border-border text-muted hover:border-border-strong hover:text-fg"
    }`;

  return (
    <div>
      <div className="panel sticky top-[4.5rem] z-30 flex flex-col gap-4 bg-surface/95 p-4 backdrop-blur-md lg:flex-row lg:items-end">
        <label className="flex-1">
          <span className="mb-1.5 block font-mono text-xs text-muted">{t("search")}</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPlaceholder")}
              className="h-10 w-full rounded-md border border-border bg-bg pl-9 pr-3 text-sm placeholder:text-faint focus:border-accent focus:outline-none"
            />
          </span>
        </label>
        <fieldset>
          <legend className="mb-1.5 font-mono text-xs text-muted">{t("area")}</legend>
          <div className="flex flex-wrap gap-1.5">
            {areas.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={area === option.value}
                onClick={() => setArea(option.value)}
                className={pill(area === option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1.5 font-mono text-xs text-muted">{t("minLevel")}</legend>
          <div className="flex gap-1.5">
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                aria-pressed={minLevel === level}
                aria-label={t("levelAria", { level })}
                onClick={() => setMinLevel(level)}
                className={pill(minLevel === level)}
              >
                {"+".repeat(level)}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 font-mono text-xs text-muted">
        <p aria-live="polite">{t("result", { count: groups.total })}</p>
        {filtersActive && (
          <button type="button" onClick={reset} className="text-accent underline-offset-4 hover:underline">
            {t("reset")}
          </button>
        )}
      </div>

      {groups.total === 0 ? (
        <p className="panel mt-4 p-10 text-center text-muted">{t("empty")}</p>
      ) : (
        <div className="mt-4 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {groups.list.map(([id, group]) => (
            <section key={id} className="panel mb-4 break-inside-avoid p-5">
              <h2 className="flex items-baseline justify-between gap-3 font-mono text-xs uppercase tracking-wider text-accent">
                {group.category}
                <span className="text-faint">{group.rows.length}</span>
              </h2>
              <ul className="mt-3 divide-y divide-border">
                {group.rows.map((row) => (
                  <li key={row.name} className="flex items-center justify-between gap-4 py-2 text-[15px]">
                    <span>{row.name}</span>
                    <LevelMeter level={row.level} label={t("levelAria", { level: row.level })} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
