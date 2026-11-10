import type { ReactNode } from "react";

/** Numbered page section: `01 / Werdegang`. */
export function Section({
  id,
  index,
  title,
  intro,
  children,
}: {
  id: string;
  index: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="border-t border-border py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <header className="reveal mb-12 max-w-2xl">
          <p className="eyebrow">
            {index} <span className="text-faint">/</span> {title}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {title}
          </h2>
          {intro && <p className="mt-4 text-lg leading-relaxed text-muted">{intro}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}
