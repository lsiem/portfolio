import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Project } from "../../content/shared/types";
import { ArrowRight, ArrowUpRight } from "./icons";

const SPAN: Record<Project["size"], string> = {
  flagship: "lg:col-span-6",
  feature: "lg:col-span-3",
  compact: "lg:col-span-2",
};

export async function ProjectBento({ projects }: { projects: Project[] }) {
  const t = await getTranslations("projects");
  const common = await getTranslations("common");

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
      {projects.map((project) => {
        const flagship = project.size === "flagship";
        return (
          <li
            key={project.slug}
            className={`reveal panel panel-hover relative flex flex-col overflow-hidden p-5 sm:p-6 ${SPAN[project.size]} ${
              flagship ? "sm:col-span-2 lg:p-8" : ""
            }`}
          >
            {flagship && (
              <>
                <div aria-hidden="true" className="bg-glow pointer-events-none absolute inset-0" />
                <p className="relative mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent/40 bg-accent-soft px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-accent">
                  <span className="status-dot size-1.5 rounded-full bg-ok" />
                  {t("flagship")}
                </p>
              </>
            )}
            <h3
              className={`relative font-semibold tracking-tight ${
                flagship ? "text-2xl sm:text-3xl" : "text-lg"
              }`}
            >
              {project.title}
            </h3>
            <p className="relative mt-1 font-mono text-xs text-accent">{project.context}</p>
            <p
              className={`relative mt-3 leading-relaxed text-muted ${
                flagship ? "max-w-3xl text-base sm:text-lg" : "text-[15px]"
              }`}
            >
              {project.summary}
            </p>
            {project.tags.length > 0 && (
              <ul className="relative mt-4 flex flex-wrap gap-1.5">
                {project.tags.map((tag) => (
                  <li key={tag} className="chip">
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {(project.caseStudy || project.url) && (
              <div className="relative mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-5 font-mono text-xs">
                {project.caseStudy && (
                  <Link
                    href={`/case-studies/${project.caseStudy}`}
                    className="inline-flex items-center gap-1.5 text-accent underline-offset-4 hover:underline"
                  >
                    {t("caseStudy")}
                    <ArrowRight />
                    <span className="sr-only">: {project.title}</span>
                  </Link>
                )}
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted underline-offset-4 hover:text-fg hover:underline"
                  >
                    {t("visit")}
                    <ArrowUpRight />
                    <span className="sr-only">
                      : {project.title} ({common("opensInNewTab")})
                    </span>
                  </a>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
