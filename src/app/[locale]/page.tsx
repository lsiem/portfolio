import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GitHubHeatmap } from "@/components/github-heatmap";
import {
  getCareer,
  getContact,
  getPage,
  getProjects,
  getSkillDomains,
} from "@/lib/content";
import { getContributionCalendar, githubLoginFromUrl } from "@/lib/github";
import { CareerSpine } from "@/components/motion/career-spine";
import { HeroIntro } from "@/components/motion/hero-intro";
import { HeroSceneSlot } from "@/components/motion/hero-scene-slot";
import { HeroSceneGate } from "@/components/scene/hero-scene-gate";
import { Magnetic } from "@/components/motion/magnetic";
import { AnchorLink } from "@/components/motion/anchor-link";
import { ProjectBento } from "@/components/motion/project-bento";
import { Reveal } from "@/components/motion/reveal";
import { TransitionLink } from "@/components/motion/transition-link";
import {
  localeAlternates,
  openGraphMetadata,
  personJsonLd,
  siteMetadataBase,
} from "@/lib/seo";
import { SceneDataRegistrar } from "@/components/scene/scene-context";

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
  // Owner-supplied About portrait (D-16) — non-blocking. Set to a public/ path
  // (e.g. "/lasse.jpg") to enable the framed photo treatment; null keeps the
  // section text-only exactly as before.
  const aboutPhotoSrc: string | null = null;
  const aboutPhotoCaption: string | null = null;
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
      <SceneDataRegistrar data={{ career, projects, contact }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <section id="hero" className="relative w-full px-6">
        {/* Phase-4 3D background layer (D-13): the capability-gated, lazily
            mounted hero constellation (04-03). Absent for excluded visitors. */}
        <HeroSceneSlot>
          <HeroSceneGate />
        </HeroSceneSlot>
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
                  <AnchorLink href="#career" className="text-muted transition-colors hover:text-foreground">
                    {nav("career")}
                  </AnchorLink>
                </li>
                <li>
                  <AnchorLink href="#projects" className="text-muted transition-colors hover:text-foreground">
                    {nav("projects")}
                  </AnchorLink>
                </li>
                <li>
                  <AnchorLink href="#skills" className="text-muted transition-colors hover:text-foreground">
                    {nav("skills")}
                  </AnchorLink>
                </li>
                <li>
                  <AnchorLink href="#about" className="text-muted transition-colors hover:text-foreground">
                    {nav("about")}
                  </AnchorLink>
                </li>
                <li>
                  <AnchorLink href="#contact" className="text-muted transition-colors hover:text-foreground">
                    {nav("contact")}
                  </AnchorLink>
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
                    <li key={tech} className="chip rounded border border-border px-2 py-0.5">
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

      {/* Projects break wide (D-04) as an asymmetric bento — ELIA + Vidama
          featured, the rest compact (D-14). TransitionLink is injected as the
          bento's LinkComponent so its internal case-study links get the D-11.4
          crossfade; the external visit link stays a native anchor. */}
      <section
        id="projects"
        aria-labelledby="projects-heading"
        className="mx-auto flex w-full max-w-[1440px] scroll-mt-24 flex-col gap-6 px-6"
      >
        <h2 id="projects-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {projectsT("title")}
        </h2>
        <ProjectBento
          projects={projects}
          labels={{
            caseStudy: projectsT("caseStudy"),
            visit: projectsT("visit"),
          }}
          LinkComponent={TransitionLink}
        />
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
          Signature engineered photo treatment (D-16): the framed portrait slots
          in beside the text on lg+ / stacked on mobile. The image is an
          owner-supplied asset (aboutPhotoSrc null today) — when absent the
          section degrades to exactly the prior text-only state; when present it
          renders in the space-reserved .photo-frame (no CLS) with the coordinate
          corner ticks. Set aboutPhotoSrc to a public/ path to enable it.
        */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
          {aboutPhotoSrc ? (
            <Reveal className="shrink-0">
              <figure className="flex flex-col gap-2">
                <div className="photo-frame">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={aboutPhotoSrc}
                    alt={aboutT("photoAlt")}
                    width={200}
                    height={200}
                  />
                  {/* Decorative L-shaped coordinate corner ticks (D-16). */}
                  <svg
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="1"
                  >
                    <path d="M2,10 V2 H10" />
                    <path d="M-10,2 h8 v8" transform="translate(100%,0)" />
                    <path d="M2,-10 v8 h8" transform="translate(0,100%)" />
                    <path d="M-10,-10 h8 v8 h-8 z" transform="translate(100%,100%)" opacity="0" />
                    <path d="M-2,-10 v8 M-10,-2 h8" transform="translate(100%,100%)" />
                  </svg>
                </div>
                {aboutPhotoCaption ? (
                  <figcaption className="font-mono text-xs text-muted">
                    {aboutPhotoCaption}
                  </figcaption>
                ) : null}
              </figure>
            </Reveal>
          ) : null}
          <div className="flex flex-col gap-6">
            {aboutPage?.description ? (
              <p className="max-w-2xl text-muted">{aboutPage.description}</p>
            ) : null}
            <TransitionLink
              href="/about"
              className="w-fit font-mono text-sm text-muted transition-colors hover:text-foreground"
            >
              {aboutT("readMore")} →
            </TransitionLink>
          </div>
        </div>
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
        {/* Magnetic pull on pointer:fine (D-11.1); absent on touch. Rendered
            unconditionally — the fine-pointer gate is internal to Magnetic. */}
        <Magnetic className="w-fit">
          <a
            href={`/Lasse-Siemoneit-CV-${locale}.pdf`}
            download
            aria-label={contactT("downloadCvAria")}
            className="cv-button inline-flex w-fit items-center rounded-md bg-accent px-4 py-2 font-mono text-sm text-background transition-colors hover:bg-foreground focus-visible:outline-offset-4"
          >
            {contactT("downloadCv")}
          </a>
        </Magnetic>
        <ul className="flex flex-col gap-2 font-mono text-sm">
          <li>
            <Magnetic>
              <a href={`mailto:${contact.email}`} className="text-accent transition-colors hover:text-foreground">
                {contactT("email")}: {contact.email}
              </a>
            </Magnetic>
          </li>
          <li>
            <Magnetic>
              <a href={contact.github} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-foreground">
                {contactT("github")} ↗
              </a>
            </Magnetic>
          </li>
          <li>
            <Magnetic>
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-foreground">
                {contactT("linkedin")} ↗
              </a>
            </Magnetic>
          </li>
        </ul>
      </section>
    </main>
  );
}
