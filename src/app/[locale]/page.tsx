import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CareerTimeline } from "@/components/career-timeline";
import { CopyEmailButton } from "@/components/copy-email-button";
import { GitHubHeatmap } from "@/components/github-heatmap";
import {
  getCareer,
  getContact,
  getPage,
  getProjects,
  getSkillDomains,
} from "@/lib/content";
import { getContributionCalendar, githubLoginFromUrl } from "@/lib/github";
import { HeroIntro } from "@/components/motion/hero-intro";
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

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const contact = getContact(locale);
  const title = "Lasse Siemoneit";
  const description = contact.role;

  return {
    metadataBase: siteMetadataBase,
    title,
    description,
    alternates: localeAlternates("/"),
    ...openGraphMetadata({
      title,
      description,
      locale,
      pathname: "/",
      type: "profile",
    }),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  // REQUIRED for static rendering — every layout AND page under [locale]
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const commonT = await getTranslations("common");
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
  // Owner-supplied comic portrait, optimized and self-hosted.
  const aboutPhotoSrc: string | null = "/lasse-comic-portrait.webp";
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
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-20 py-20 sm:gap-28 sm:py-28"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
      />
      <section id="hero" className="relative w-full px-6">
        {/* Hero positioning/contrast layer (D-13 successor). The Phase-4
            in-hero canvas slot is retired — the capability-gated field now
            lives in the layout-level StageSlot (DESIGN-SPEC §2.1, WP-A). This
            empty layer keeps the hero's DOM shape unchanged for excluded
            visitors and stays available for a contrast scrim over the stage. */}
        <div
          aria-hidden="true"
          data-parallax="10"
          className="hero-readability-scrim pointer-events-none absolute inset-y-0 left-0 right-[24%] z-0"
        />
        {/*
          Hero intro mount timeline (D-12): the grid overlay, H1 words and
          value-prop are targets of HeroIntro's on-mount timeline. HeroIntro
          renders these SSR children directly (WOW-04) and only layers motion on
          top after hydration on capable devices.
        */}
        <HeroIntro className="relative z-[1] grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-5 lg:col-span-8">
            {/* Decorative engineered grid/tick rule (D-12) — draws in on mount. */}
            <span
              data-hero-grid
              data-parallax="18"
              aria-hidden="true"
              className="block h-px w-full max-w-[12rem] origin-left bg-border"
            />
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
              {t("eyebrow")}
            </p>
            <h1
              data-hero-h1
              className="font-display text-[clamp(2.75rem,2rem+5vw,6rem)] leading-[1.05] tracking-tight"
            >
              {contact.name}
            </h1>
            <p className="max-w-xl text-lg text-muted sm:text-xl">{contact.role}</p>
            <p
              data-hero-valueprop
              data-testid="hero-value-prop"
              className="max-w-xl text-lg text-muted sm:text-xl"
            >
              {contact.valueProp}
            </p>
            <nav aria-label={nav("sections")} className="mt-2">
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
                  <AnchorLink href="#activity" className="text-muted transition-colors hover:text-foreground">
                    {nav("activity")}
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

      <CareerTimeline
        entries={career}
        intro={careerIntro}
        title={careerT("title")}
        presentLabel={careerT("present")}
        opensInNewTabLabel={commonT("opensInNewTab")}
      />

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
            <div className="flex flex-wrap items-center gap-3">
              <Magnetic>
                <a href={`mailto:${contact.email}`} className="text-accent transition-colors hover:text-foreground">
                  {contactT("email")}: {contact.email}
                </a>
              </Magnetic>
              <CopyEmailButton
                email={contact.email}
                copyLabel={contactT("copyEmail")}
                copiedLabel={contactT("copied")}
              />
            </div>
          </li>
          <li>
            <Magnetic>
              <a href={contact.github} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-foreground">
                {contactT("github")} ↗
                <span className="sr-only"> ({commonT("opensInNewTab")})</span>
              </a>
            </Magnetic>
          </li>
          <li>
            <Magnetic>
              <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-foreground">
                {contactT("linkedin")} ↗
                <span className="sr-only"> ({commonT("opensInNewTab")})</span>
              </a>
            </Magnetic>
          </li>
        </ul>
      </section>
    </main>
  );
}
