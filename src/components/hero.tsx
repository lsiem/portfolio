import { getTranslations } from "next-intl/server";
import type { ContactInfo } from "../../content/shared/types";
import { ArrowRight, Download } from "./icons";

export const CV_PATH = "/cv/Lasse-Siemoneit-CV-de.pdf";

type Stat = { value: string; label: string };

export async function Hero({
  contact,
  stats,
}: {
  contact: ContactInfo;
  stats: Stat[];
}) {
  const t = await getTranslations("hero");
  const [firstName, ...rest] = contact.name.split(" ");

  const profile = [
    [t("keyRole"), contact.role],
    [t("keyFocus"), t("focus")],
    [t("keyLocation"), contact.location],
    [t("keyExperience"), t("experience")],
  ];

  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden="true" className="bg-grid absolute inset-0 -z-10" />
      <div aria-hidden="true" className="bg-glow absolute inset-0 -z-10" />
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:pb-24">
        <div>
          <p
            className="rise inline-flex max-w-full items-center gap-2.5 rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-xs text-muted"
            style={{ "--i": 0 } as React.CSSProperties}
          >
            <span className="status-dot size-2 shrink-0 rounded-full bg-ok" />
            <span className="truncate">{contact.status}</span>
          </p>
          <h1
            className="rise mt-6 text-[clamp(2.75rem,9vw,5.5rem)] font-semibold leading-[0.95] tracking-tighter"
            style={{ "--i": 1 } as React.CSSProperties}
          >
            {firstName}
            <br />
            <span className="text-accent">{rest.join(" ")}</span>
          </h1>
          <p
            className="rise mt-6 font-mono text-sm text-fg sm:text-base"
            style={{ "--i": 2 } as React.CSSProperties}
          >
            <span className="text-accent">&gt;</span> {contact.role}
            <span className="caret ml-1 inline-block h-[1.1em] w-[0.55em] translate-y-[0.2em] bg-accent" aria-hidden="true" />
          </p>
          <p
            className="rise mt-6 max-w-xl text-lg leading-relaxed text-muted"
            style={{ "--i": 3 } as React.CSSProperties}
          >
            {contact.valueProp}
          </p>
          <div
            className="rise mt-8 flex flex-wrap gap-3"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            <a
              href="#projects"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
            >
              {t("ctaProjects")}
              <ArrowRight />
            </a>
            <a
              href={CV_PATH}
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface px-5 text-sm font-medium transition-colors hover:border-accent"
            >
              <Download />
              {t("ctaCv")}
            </a>
            <a
              href="#contact"
              className="inline-flex h-11 items-center rounded-md px-3 text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
            >
              {t("ctaContact")}
            </a>
          </div>
        </div>

        <div
          className="rise panel overflow-hidden font-mono text-[13px] leading-relaxed shadow-2xl shadow-black/20"
          style={{ "--i": 5 } as React.CSSProperties}
          role="group"
          aria-label={t("terminalLabel")}
        >
          <div className="flex items-center gap-1.5 border-b border-border bg-surface-2 px-4 py-3" aria-hidden="true">
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="ml-3 text-xs text-faint">profile.yaml</span>
          </div>
          <dl className="space-y-2.5 p-5">
            {profile.map(([key, value]) => (
              <div key={key} className="grid grid-cols-[6.5rem_1fr] gap-2">
                <dt className="text-accent">{key}:</dt>
                <dd className="text-fg">{value}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[6.5rem_1fr] gap-2">
              <dt className="text-accent">{t("keyStatus")}:</dt>
              <dd className="text-ok">{contact.status}</dd>
            </div>
          </dl>
        </div>
      </div>

      <dl className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px overflow-hidden border-y border-border bg-border sm:grid-cols-4 lg:rounded-t-xl lg:border-x">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse gap-1 bg-bg px-4 py-5 sm:px-6">
            <dt className="font-mono text-xs text-muted">{stat.label}</dt>
            <dd className="text-2xl font-semibold tracking-tight sm:text-3xl">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
