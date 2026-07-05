import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GitHubHeatmap } from "@/components/github-heatmap";
import {
  getCareer,
  getCaseStudy,
  getContact,
  getPage,
  getProjects,
  getSkillDomains,
} from "@/lib/content";
import { getContributionCalendar, githubLoginFromUrl } from "@/lib/github";
import { CareerSpine } from "@/components/motion/career-spine";
import { HeroIntro } from "@/components/motion/hero-intro";
import { HeroSceneSlot } from "@/components/motion/hero-scene-slot";
import { Reveal } from "@/components/motion/reveal";
import {
  localeAlternates,
  openGraphMetadata,
  personJsonLd,
  siteMetadataBase,
} from "@/lib/seo";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const title = "Lasse Siemoneit";
  const description = t("role");

  return {
    metadataBase: siteMetadataBase,
    title,
    description,
    alternates: localeAlternates("/"),
    ...openGraphMetadata({ title, description, locale, pathname: "/" }),
  };
}

/**
 * Render "YYYY-MM" as "MM/YYYY"; null/undefined or a malformed value
 * (missing the "-" separator or the month segment) falls back to the
 * present label rather than rendering "undefined/YYYY".
 */
function formatMonth(value: string | null, present: string): string {
  if (!value) return present;
  const [year, month] = value.split("-");
  if (!year || !month) return present;
  return `${month}/${year}`;
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  // REQUIRED for static rendering — every layout AND page under [locale]
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const nav = await getTranslations("nav");
  const careerT = await getTranslations("career");
  const projectsT = await getTranslations("projects");
  const skillsT = await getTranslations("skills");
  const aboutT = await getTranslations("about");
  const activityT = await getTranslations("activity");
  const contactT = await getTranslations("contact");

  const { intro: careerIntro, entries: career } = getCareer(locale);
  const projects = getProjects(locale);
  const skillDomains = getSkillDomains(locale);
  const contact = getContact(locale);
  const aboutPage = getPage(locale, "about");
  // Trusted first-party data from the typed content model (no user input),
  // so dangerouslySetInnerHTML is safe here per react/security rules.
  const personLd = personJsonLd(contact, locale);
  // Build-time-only fetch with daily ISR (src/lib/github.ts) — the shipped
  // page never calls GitHub at runtime; null degrades to a fallback line.
  const contributionCalendar = await getContributionCalendar(
    githubLoginFromUrl(contact.github),
  );

  return (
    // Width shell (D-04, finding #2): <main> owns the vertical rhythm and a wide
    // 1440px cap but NO global ~768px reading cap — that moves per-section so the
    // hero and career can break wide while prose sections stay reading-anchored.
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-20 py-20 sm:gap-28 sm:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <section id="hero" className="relative w-full px-6">
        {/* Reserved Phase-4 3D background layer (D-13) — empty in Phase 3. */}
        <HeroSceneSlot />
        {/*
          Hero intro mount timeline (D-12): the grid overlay, H1 words and
          value-prop are targets of HeroIntro's on-mount timeline. HeroIntro
          renders these SSR children directly (WOW-04) and only layers motion on
          top after hydration on capable devices.
        */}
        <HeroIntro className="relative grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-9">
            {/* Decorative engineered grid/tick rule (D-12) — draws in on mount. */}
            <span
              data-hero-grid
              aria-hidden="true"
              className="block h-px w-full max-w-[12rem] origin-left bg-border"
            />
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
              Portfolio
            </p>
            <h1
              data-hero-h1
              className="font-display text-[clamp(2.75rem,2rem+5vw,6rem)] leading-[1.05] tracking-tight"
            >
              {contact.name}
            </h1>
            <p className="max-w-xl text-lg text-muted sm:text-xl">{t("role")}</p>
            <p
              data-hero-valueprop
              data-testid="hero-value-prop"
              className="max-w-xl text-lg text-muted sm:text-xl"
            >
              {contact.valueProp}
            </p>
            <nav aria-label={nav("home")} className="mt-2">
              <ul className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-sm">
                <li>
                  <a href="#career" className="text-muted transition-colors hover:text-foreground">
                    {nav("career")}
                  </a>
                </li>
                <li>
                  <a href="#projects" className="text-muted transition-colors hover:text-foreground">
                    {nav("projects")}
                  </a>
                </li>
                <li>
                  <a href="#skills" className="text-muted transition-colors hover:text-foreground">
                    {nav("skills")}
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-muted transition-colors hover:text-foreground">
                    {nav("about")}
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-muted transition-colors hover:text-foreground">
                    {nav("contact")}
                  </a>
                </li>
              </ul>
            </nav>
          </div>
        </HeroIntro>
      </section>

      {/*
        Career breaks wide (D-04) with a left-margin column (D-07) that hosts
        the CareerSpine progress rail (lg+ only, scoped to this section's
        scroll range); the reading content stays anchored in the right column.
      */}
      <section
        id="career"
        aria-labelledby="career-heading"
        className="mx-auto w-full max-w-[1440px] scroll-mt-24 px-6"
      >
        <div className="lg:grid lg:grid-cols-[5rem_minmax(0,46rem)] lg:gap-6">
          {/* Progress spine (D-07) — lives in the reserved left margin column,
              lg+ only, scoped to this section's scroll range. */}
          <CareerSpine entries={career} />
          <div className="flex flex-col gap-6">
        <h2 id="career-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {careerT("title")}
        </h2>
        <p className="max-w-2xl text-muted">{careerIntro}</p>
        <ol className="flex flex-col gap-8">
          {career.map((entry) => {
            // ITSC is the narrative centerpiece (D-06): its SysAdmin → Software
            // Engineering → Product Owner roles play as emphasized multi-beat
            // reveals; every other org gets a single lighter reveal (D-05).
            const isItsc = entry.slug === "itsc";
            const header = (
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-medium tracking-tight">
                  {entry.orgUrl ? (
                    <a href={entry.orgUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                      {entry.org}
                    </a>
                  ) : (
                    entry.org
                  )}
                </h3>
                <p className="font-mono text-xs text-muted">
                  {formatMonth(entry.from, careerT("present"))} – {formatMonth(entry.to, careerT("present"))}
                  {entry.location ? ` · ${entry.location}` : ""}
                </p>
              </div>
            );
            const techStack =
              entry.techStack.length > 0 ? (
                <ul className="flex flex-wrap gap-2 font-mono text-xs text-muted">
                  {entry.techStack.map((tech) => (
                    <li key={tech} className="rounded border border-border px-2 py-0.5">
                      {tech}
                    </li>
                  ))}
                </ul>
              ) : null;

            if (isItsc) {
              return (
                <li key={entry.slug} className="flex flex-col gap-3">
                  <Reveal className="flex flex-col gap-3">
                    {header}
                    {entry.intro ? <p className="text-muted">{entry.intro}</p> : null}
                  </Reveal>
                  <ol className="flex flex-col gap-3 border-l border-border pl-4">
                    {entry.roles.map((role, i) => (
                      <li key={`${entry.slug}-${i}`}>
                        <Reveal emphasis className="flex flex-col gap-1">
                          <p className="font-medium">
                            {role.title}
                            <span className="ml-2 font-mono text-xs text-muted">
                              {formatMonth(role.from, careerT("present"))} – {formatMonth(role.to, careerT("present"))}
                            </span>
                          </p>
                          <p className="text-sm text-muted">{role.description}</p>
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
                  {entry.intro ? <p className="text-muted">{entry.intro}</p> : null}
                  <ol className="flex flex-col gap-3 border-l border-border pl-4">
                    {entry.roles.map((role, i) => (
                      <li key={`${entry.slug}-${i}`} className="flex flex-col gap-1">
                        <p className="font-medium">
                          {role.title}
                          <span className="ml-2 font-mono text-xs text-muted">
                            {formatMonth(role.from, careerT("present"))} – {formatMonth(role.to, careerT("present"))}
                          </span>
                        </p>
                        <p className="text-sm text-muted">{role.description}</p>
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

      <section
        id="projects"
        aria-labelledby="projects-heading"
        className="mx-auto flex w-full max-w-3xl scroll-mt-24 flex-col gap-6 px-6"
      >
        <h2 id="projects-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {projectsT("title")}
        </h2>
        <ul className="flex flex-col gap-6">
          {projects.map((project) => {
            const caseStudy =
              project.depth === "flagship" || project.depth === "deep"
                ? getCaseStudy(locale, project.slug)
                : undefined;
            return (
              <li key={project.slug} className="flex flex-col gap-2 border-b border-border pb-6 last:border-b-0">
                <h3 className="text-lg font-medium tracking-tight">{project.title}</h3>
                {project.period ? (
                  <p className="font-mono text-xs text-muted">{project.period}</p>
                ) : null}
                <p className="text-muted">{project.summary}</p>
                <ul className="flex flex-wrap gap-2 font-mono text-xs text-muted">
                  {project.tags.map((tag) => (
                    <li key={tag} className="rounded border border-border px-2 py-0.5">
                      {tag}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-4 font-mono text-sm">
                  {caseStudy ? (
                    <Link
                      href={`/case-studies/${project.slug}`}
                      className="text-accent transition-colors hover:text-foreground"
                    >
                      {projectsT("caseStudy")} →
                    </Link>
                  ) : null}
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted transition-colors hover:text-foreground"
                    >
                      {projectsT("visit")} ↗
                    </a>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        id="skills"
        aria-labelledby="skills-heading"
        className="mx-auto flex w-full max-w-3xl scroll-mt-24 flex-col gap-6 px-6"
      >
        <h2 id="skills-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {skillsT("title")}
        </h2>
        <div className="flex flex-col gap-8">
          {skillDomains.map((domain) => (
            <div key={domain.domain} className="flex flex-col gap-3">
              <h3 className="text-lg font-medium tracking-tight">{domain.domain}</h3>
              <ul className="flex flex-col gap-2">
                {domain.skills.map((skill) => (
                  <li key={skill.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-medium">{skill.name}</span>
                    {typeof skill.years === "number" ? (
                      <span className="font-mono text-xs text-muted">
                        {skillsT("years", { years: skill.years })}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section
        id="about"
        aria-labelledby="about-heading"
        className="mx-auto flex w-full max-w-3xl scroll-mt-24 flex-col gap-6 px-6"
      >
        <h2 id="about-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {aboutT("title")}
        </h2>
        {/*
          Text-first per CTX-03 (02-CONTEXT.md): the profile photo is an
          owner-supplied asset that slots in later as a non-blocking
          follow-up (rounded-lg, ~96-160px avatar scale, per D-D). No <img>
          is rendered here — the section degrades to text-only cleanly.
        */}
        {aboutPage?.description ? (
          <p className="max-w-2xl text-muted">{aboutPage.description}</p>
        ) : null}
        <Link
          href="/about"
          className="font-mono text-sm text-muted transition-colors hover:text-foreground"
        >
          {aboutT("readMore")} →
        </Link>
      </section>

      <section
        id="activity"
        aria-labelledby="activity-heading"
        className="mx-auto flex w-full max-w-3xl scroll-mt-24 flex-col gap-6 px-6"
      >
        <h2 id="activity-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {activityT("title")}
        </h2>
        <GitHubHeatmap
          data={contributionCalendar}
          labels={{
            ariaSummary: activityT("ariaSummary"),
            unavailable: activityT("unavailable"),
          }}
        />
      </section>

      <section
        id="contact"
        aria-labelledby="contact-heading"
        className="mx-auto flex w-full max-w-3xl scroll-mt-24 flex-col gap-4 px-6"
      >
        <h2 id="contact-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {contactT("title")}
        </h2>
        <p className="max-w-xl text-muted">{contactT("intro")}</p>
        <a
          href={`/Lasse-Siemoneit-CV-${locale}.pdf`}
          download
          aria-label={contactT("downloadCvAria")}
          className="inline-flex w-fit items-center rounded-md bg-accent px-4 py-2 font-mono text-sm text-background transition-colors hover:bg-foreground focus-visible:outline-offset-4"
        >
          {contactT("downloadCv")}
        </a>
        <ul className="flex flex-col gap-2 font-mono text-sm">
          <li>
            <a href={`mailto:${contact.email}`} className="text-accent transition-colors hover:text-foreground">
              {contactT("email")}: {contact.email}
            </a>
          </li>
          <li>
            <a href={contact.github} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-foreground">
              {contactT("github")} ↗
            </a>
          </li>
          <li>
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-foreground">
              {contactT("linkedin")} ↗
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
