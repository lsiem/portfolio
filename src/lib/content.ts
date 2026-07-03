import { allCaseStudies, allPages } from "content-collections";
import {
  career as careerDe,
  careerIntro as careerIntroDe,
} from "../../content/de/career";
import {
  career as careerEn,
  careerIntro as careerIntroEn,
} from "../../content/en/career";
import { projects as projectsDe } from "../../content/de/projects";
import { projects as projectsEn } from "../../content/en/projects";
import { skillDomains as skillDomainsDe } from "../../content/de/skills";
import { skillDomains as skillDomainsEn } from "../../content/en/skills";
import { contact as contactDe } from "../../content/de/contact";
import { contact as contactEn } from "../../content/en/contact";
import type {
  CareerEntry,
  ContactInfo,
  Project,
  SkillDomain,
} from "../../content/shared/types";

export type CaseStudy = (typeof allCaseStudies)[number];
export type Page = (typeof allPages)[number];

const CAREER = { de: careerDe, en: careerEn } as const;
const CAREER_INTRO = { de: careerIntroDe, en: careerIntroEn } as const;
const PROJECTS = { de: projectsDe, en: projectsEn } as const;
const SKILL_DOMAINS = { de: skillDomainsDe, en: skillDomainsEn } as const;
const CONTACT = { de: contactDe, en: contactEn } as const;

type ContentLocale = keyof typeof CAREER;

/** Narrow an arbitrary locale string to a supported content locale (de default). */
function contentLocale(locale: string): ContentLocale {
  return locale === "en" ? "en" : "de";
}

/** Career timeline for a locale, plus the intro prose. */
export function getCareer(locale: string): {
  intro: string;
  entries: readonly CareerEntry[];
} {
  const key = contentLocale(locale);
  return { intro: CAREER_INTRO[key], entries: CAREER[key] };
}

/** Project metadata for a locale, sorted by `order` (D-01 weighting). */
export function getProjects(locale: string): readonly Project[] {
  return [...PROJECTS[contentLocale(locale)]].sort((a, b) => a.order - b.order);
}

/** Domain-grouped skills for a locale (CONT-05 shape — no percent bars). */
export function getSkillDomains(locale: string): readonly SkillDomain[] {
  return SKILL_DOMAINS[contentLocale(locale)];
}

/** Contact info for a locale (role-relevant facts only). */
export function getContact(locale: string): ContactInfo {
  return CONTACT[contentLocale(locale)];
}

/** All case studies for a locale, sorted by their `order` frontmatter. */
export function getCaseStudies(locale: string): CaseStudy[] {
  return allCaseStudies
    .filter((caseStudy) => caseStudy.locale === locale)
    .sort((a, b) => a.order - b.order);
}

/** A single case study by locale + slug, or undefined if unknown. */
export function getCaseStudy(
  locale: string,
  slug: string,
): CaseStudy | undefined {
  return allCaseStudies.find(
    (caseStudy) => caseStudy.locale === locale && caseStudy.slug === slug,
  );
}

/** All prose pages (about, impressum, datenschutz) for a locale, sorted by `order`. */
export function getPages(locale: string): Page[] {
  return allPages
    .filter((page) => page.locale === locale)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** A single prose page by locale + slug, or undefined if unknown. */
export function getPage(locale: string, slug: string): Page | undefined {
  return allPages.find(
    (page) => page.locale === locale && page.slug === slug,
  );
}
