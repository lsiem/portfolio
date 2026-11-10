import { allCaseStudies, allPages } from "content-collections";
import { career as careerDe, careerIntro as careerIntroDe } from "../../content/de/career";
import { career as careerEn, careerIntro as careerIntroEn } from "../../content/en/career";
import { certificates as certificatesDe, methods as methodsDe } from "../../content/de/certificates";
import { certificates as certificatesEn, methods as methodsEn } from "../../content/en/certificates";
import { contact as contactDe } from "../../content/de/contact";
import { contact as contactEn } from "../../content/en/contact";
import { projects as projectsDe } from "../../content/de/projects";
import { projects as projectsEn } from "../../content/en/projects";
import { skillDomains as skillDomainsDe } from "../../content/de/skills";
import { skillDomains as skillDomainsEn } from "../../content/en/skills";
import { matrixCategories, matrixSkills } from "../../content/shared/skill-matrix";
import type {
  CareerEntry,
  Certificate,
  ContactInfo,
  Project,
  SkillArea,
  SkillDomain,
  SkillLevel,
} from "../../content/shared/types";

export type CaseStudy = (typeof allCaseStudies)[number];
export type Page = (typeof allPages)[number];
export type Locale = "de" | "en";

const CONTENT = {
  de: {
    career: careerDe as CareerEntry[],
    careerIntro: careerIntroDe,
    projects: projectsDe as Project[],
    skillDomains: skillDomainsDe as SkillDomain[],
    contact: contactDe as ContactInfo,
    certificates: certificatesDe as Certificate[],
    methods: methodsDe,
  },
  en: {
    career: careerEn as CareerEntry[],
    careerIntro: careerIntroEn,
    projects: projectsEn as Project[],
    skillDomains: skillDomainsEn as SkillDomain[],
    contact: contactEn as ContactInfo,
    certificates: certificatesEn as Certificate[],
    methods: methodsEn,
  },
};

function contentLocale(locale: string): Locale {
  return locale === "en" ? "en" : "de";
}

/** All structured content for a locale. */
export function getContent(locale: string) {
  return CONTENT[contentLocale(locale)];
}

/** One row of the skill-matrix explorer, already localized. */
export type MatrixRow = {
  name: string;
  level: SkillLevel;
  area: SkillArea;
  categoryId: string;
  category: string;
};

/** The full skill matrix for a locale, in category order, strongest first. */
export function getSkillMatrix(locale: string): MatrixRow[] {
  const key = contentLocale(locale);
  const order = new Map(matrixCategories.map((c, i) => [c.id, i]));
  const byId = new Map(matrixCategories.map((c) => [c.id, c]));
  return matrixSkills
    .map((skill) => {
      const category = byId.get(skill.category)!;
      return {
        name: key === "en" && "nameEn" in skill && skill.nameEn ? skill.nameEn : skill.name,
        level: skill.level as SkillLevel,
        area: category.area as SkillArea,
        categoryId: category.id,
        category: category.label[key],
      };
    })
    .sort(
      (a, b) =>
        order.get(a.categoryId)! - order.get(b.categoryId)! ||
        b.level - a.level,
    );
}

/** "2024-06" -> "06/2024" */
export function formatMonth(value: string): string {
  const [year, month] = value.split("-");
  return `${month}/${year}`;
}

export function getCaseStudies(locale: string): CaseStudy[] {
  return allCaseStudies
    .filter((caseStudy) => caseStudy.locale === locale)
    .sort((a, b) => a.order - b.order);
}

export function getCaseStudy(locale: string, slug: string): CaseStudy | undefined {
  return allCaseStudies.find(
    (caseStudy) => caseStudy.locale === locale && caseStudy.slug === slug,
  );
}

export function getPages(locale: string): Page[] {
  return allPages
    .filter((page) => page.locale === locale)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function getPage(locale: string, slug: string): Page | undefined {
  return allPages.find((page) => page.locale === locale && page.slug === slug);
}
