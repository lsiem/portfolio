import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CareerTimeline } from "@/components/career-timeline";
import { CopyEmailButton } from "@/components/copy-email-button";
import { GithubHeatmap } from "@/components/github-heatmap";
import { CV_PATH, Hero } from "@/components/hero";
import { ArrowRight, Download, Github, Linkedin, Mail } from "@/components/icons";
import { ProjectBento } from "@/components/project-bento";
import { Section } from "@/components/section";
import { SkillGroups } from "@/components/skill-groups";
import { Link } from "@/i18n/navigation";
import { formatMonth, getContent, getPage, getSkillMatrix } from "@/lib/content";
import { getContributionCalendar, githubLoginFromUrl } from "@/lib/github";
import {
  localeAlternates,
  openGraphMetadata,
  personJsonLd,
  siteMetadataBase,
} from "@/lib/seo";

type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const { contact } = getContent(locale);
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: siteMetadataBase,
    title: t("title"),
    description: contact.valueProp,
    alternates: localeAlternates("/"),
    ...openGraphMetadata({
      title: t("title"),
      description: contact.valueProp,
      locale,
      pathname: "/",
      type: "profile",
    }),
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = getContent(locale);
  const { contact } = content;
  const matrix = getSkillMatrix(locale);
  const about = getPage(locale, "about");
  const calendar = await getContributionCalendar(githubLoginFromUrl(contact.github));

  const hero = await getTranslations("hero");
  const nav = await getTranslations("nav");
  const t = await getTranslations();

  const stats = [
    { value: "5+", label: hero("statYears") },
    { value: String(content.projects.length), label: hero("statProjects") },
    { value: String(matrix.length), label: hero("statSkills") },
    { value: String(content.certificates.length), label: hero("statCerts") },
  ];

  return (
    <main id="main-content" tabIndex={-1} className="outline-none">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd(contact, locale)).replace(/</g, "\\u003c"),
        }}
      />
      <Hero contact={contact} stats={stats} />

      <Section id="career" index="01" title={nav("career")} intro={content.careerIntro}>
        <CareerTimeline entries={content.career} />
      </Section>

      <Section id="projects" index="02" title={nav("projects")} intro={t("projects.intro")}>
        <ProjectBento projects={content.projects} />
      </Section>

      <Section id="skills" index="03" title={nav("skills")} intro={t("skills.intro")}>
        <SkillGroups domains={content.skillDomains} matrixCount={matrix.length} />

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="reveal panel p-5 sm:p-6">
            <h3 className="font-mono text-xs uppercase tracking-wider text-accent">
              {t("credentials.certificates")}
            </h3>
            <ul className="mt-4 divide-y divide-border">
              {content.certificates.map((cert) => (
                <li key={cert.code} className="flex gap-4 py-3">
                  <span className="chip h-fit shrink-0 border-accent/40 text-accent">{cert.code}</span>
                  <div>
                    <p className="text-[15px] font-medium leading-snug">{cert.title}</p>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {cert.issuer} · {formatMonth(cert.date)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="reveal panel p-5 sm:p-6">
            <h3 className="font-mono text-xs uppercase tracking-wider text-accent">
              {t("credentials.methods")}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {content.methods.map((method) => (
                <li key={method} className="chip px-3 py-1 text-[13px]">
                  {method}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="about" index="04" title={nav("about")}>
        <div className="reveal grid items-center gap-8 md:grid-cols-[minmax(0,16rem)_1fr] md:gap-12">
          <div className="panel relative mx-auto aspect-[4/5] w-full max-w-64 overflow-hidden">
            <div aria-hidden="true" className="bg-grid absolute inset-0" />
            <div aria-hidden="true" className="bg-glow absolute inset-0" />
            <Image
              src="/lasse-comic-portrait-cutout.webp"
              alt={t("about.photoAlt")}
              width={720}
              height={1029}
              sizes="16rem"
              className="relative size-full object-cover object-top"
            />
          </div>
          <div>
            <p className="max-w-2xl text-xl leading-relaxed sm:text-2xl">
              {about?.description}
            </p>
            <p className="mt-5 font-mono text-sm text-muted">{contact.location}</p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-accent underline-offset-4 hover:underline"
            >
              {t("about.readMore")}
              <ArrowRight />
            </Link>
          </div>
        </div>
        {calendar && (
          <div className="reveal mt-12">
            <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-accent">
              {t("activity.title")}
            </h3>
            <GithubHeatmap
              calendar={calendar}
              summary={t("activity.summary", { count: calendar.totalContributions })}
            />
          </div>
        )}
      </Section>

      <Section id="contact" index="05" title={nav("contact")}>
        <div className="reveal panel relative overflow-hidden p-6 sm:p-10">
          <div aria-hidden="true" className="bg-glow pointer-events-none absolute inset-0" />
          <div className="relative">
            <p className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("contact.headline")}
            </p>
            <p className="mt-4 max-w-xl text-lg text-muted">{t("contact.intro")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-accent px-5 font-mono text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
              >
                <Mail />
                {contact.email}
              </a>
              <CopyEmailButton email={contact.email} />
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-6 font-mono text-sm text-muted">
              <li>
                <a href={contact.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-fg">
                  <Github />
                  GitHub
                  <span className="sr-only">({t("common.opensInNewTab")})</span>
                </a>
              </li>
              <li>
                <a href={contact.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-fg">
                  <Linkedin />
                  LinkedIn
                  <span className="sr-only">({t("common.opensInNewTab")})</span>
                </a>
              </li>
              <li>
                <a href={CV_PATH} className="inline-flex items-center gap-2 transition-colors hover:text-fg">
                  <Download />
                  {t("contact.downloadCv")}
                  <span className="text-faint">({t("contact.downloadCvNote")})</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Section>
    </main>
  );
}
