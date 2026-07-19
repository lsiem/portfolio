import type { ComponentType, ReactNode } from "react";
import { Link } from "@/i18n/navigation";
import type { Project } from "../../../content/shared/types";
import { BentoHover } from "./bento-hover";
import { Reveal } from "./reveal";

/**
 * Featured bento project grid (D-14). ELIA (flagship) + Vidama (deep) render as
 * the large featured pair on the widened 12-col structural grid (D-04); the rest
 * stay compact. Server Component — composes the client `<Reveal>` around each
 * cell so the only client JS is the reveal boundary itself (no bento-level JS).
 *
 * Featured signal = a heavier `2px` top border + larger heading — NOT extra
 * accent (D-02 accent budget preserved). All colors via tokens (no hex
 * literals, no theme-variant utility classes — re-theming is `:root[data-theme]`
 * only). Every project is exactly ONE `<li>` (finding #5): a featured project
 * is a single `<li>` that is itself the 12-col grid container, with the card and
 * the supporting tag panel nested inside it — never two sibling `<li>`s — so
 * assistive tech announces N projects, not N×panels.
 */

/** Minimal link contract so callers can swap the anchor implementation. */
type LinkLike = ComponentType<{
  href: string;
  className?: string;
  children: ReactNode;
}>;

type ProjectBentoProps = {
  projects: readonly Project[];
  labels: { caseStudy: string; visit: string };
  /**
   * Component used for INTERNAL case-study links. Defaults to the locale-aware
   * `@/i18n/navigation` Link (behavior identical to the pre-bento list). Plan 03
   * (Wave 3) injects `TransitionLink` here to add the D-11.4 crossfade to bento
   * case-study links with zero further edits to this component. The EXTERNAL
   * `visit` link is deliberately NOT routed through this — external URLs must
   * never go through the in-app crossfade router.
   */
  LinkComponent?: LinkLike;
};

const CASE_STUDY_DEPTHS: ReadonlySet<Project["depth"]> = new Set([
  "flagship",
  "deep",
]);

function hasCaseStudy(project: Project): boolean {
  return CASE_STUDY_DEPTHS.has(project.depth);
}

function isFeatured(project: Project): boolean {
  return project.depth === "flagship" || project.depth === "deep";
}

function TechChips({ tags }: { tags: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2 font-mono text-xs text-muted">
      {tags.map((tag) => (
        <li key={tag} className="chip rounded border border-border px-2 py-0.5">
          {tag}
        </li>
      ))}
    </ul>
  );
}

function ProjectLinks({
  project,
  labels,
  LinkComponent,
}: {
  project: Project;
  labels: { caseStudy: string; visit: string };
  LinkComponent: LinkLike;
}) {
  return (
    <div className="flex flex-wrap gap-4 font-mono text-sm">
      {hasCaseStudy(project) ? (
        <LinkComponent
          href={`/case-studies/${project.slug}`}
          className="text-accent transition-colors hover:text-foreground"
        >
          {labels.caseStudy} →
        </LinkComponent>
      ) : null}
      {project.url ? (
        // External link — never routed through LinkComponent / the crossfade router.
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted transition-colors hover:text-foreground"
        >
          {labels.visit} ↗
        </a>
      ) : null}
    </div>
  );
}

export function ProjectBento({
  projects,
  labels,
  LinkComponent = Link,
}: ProjectBentoProps) {
  return (
    // BentoHover (WP-D): boxless client wrapper feeding bridge.hoverRect —
    // this stays a Server Component; only the hover boundary ships JS.
    <BentoHover>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-12">
        {projects.map((project) => {
          if (isFeatured(project)) {
            return (
              <li key={project.slug} className="sm:col-span-2 lg:col-span-12">
                <Reveal className="grid grid-cols-1 gap-6 border-t-2 border-border pt-6 lg:grid-cols-12">
                  <div className="flex flex-col gap-3 lg:col-span-8">
                    <h3 className="text-2xl font-medium tracking-tight">
                      {project.title}
                    </h3>
                    {project.period ? (
                      <p className="font-mono text-xs text-muted">
                        {project.period}
                      </p>
                    ) : null}
                    <p className="max-w-2xl text-muted">{project.summary}</p>
                    <ProjectLinks
                      project={project}
                      labels={labels}
                      LinkComponent={LinkComponent}
                    />
                  </div>
                  <div className="flex flex-col gap-3 lg:col-span-4">
                    <TechChips tags={project.tags} />
                  </div>
                </Reveal>
              </li>
            );
          }

          return (
            <li key={project.slug} className="lg:col-span-4">
              <Reveal className="flex h-full flex-col gap-2 border-t border-border pt-6">
                <h3 className="text-lg font-medium tracking-tight">
                  {project.title}
                </h3>
                {project.period ? (
                  <p className="font-mono text-xs text-muted">
                    {project.period}
                  </p>
                ) : null}
                <p className="text-muted">{project.summary}</p>
                <TechChips tags={project.tags} />
                <ProjectLinks
                  project={project}
                  labels={labels}
                  LinkComponent={LinkComponent}
                />
              </Reveal>
            </li>
          );
        })}
      </ul>
    </BentoHover>
  );
}
