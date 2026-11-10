/**
 * Shared content contract. Per-locale modules under content/de and content/en
 * use `satisfies` against these types, so the compiler enforces that both
 * languages have the same shape.
 */

/** "YYYY-MM" month string, e.g. "2021-12". */
export type YearMonth = `${number}-${number}`;

export type CareerRole = {
  title: string;
  from: YearMonth;
  /** `null` means "present". */
  to: YearMonth | null;
  points: string[];
  stack: string[];
};

export type CareerEntry = {
  slug: string;
  org: string;
  orgUrl?: string;
  location: string;
  from: YearMonth;
  /** `null` means "present". */
  to: YearMonth | null;
  roles: CareerRole[];
};

export type Project = {
  slug: string;
  title: string;
  /** Short line under the title, e.g. "Vidama GmbH · Alleinentwickler". */
  context: string;
  summary: string;
  tags: string[];
  url?: string;
  /** flagship = full-width, feature = half-width, compact = third-width. */
  size: "flagship" | "feature" | "compact";
  /** Slug of a case study under content/<locale>/case-studies, if one exists. */
  caseStudy?: string;
};

export type Skill = {
  name: string;
  years: number;
};

export type SkillDomain = {
  domain: string;
  skills: Skill[];
};

export type Certificate = {
  title: string;
  code: string;
  issuer: string;
  /** "YYYY-MM" */
  date: YearMonth;
};

/**
 * Contact info: role-relevant facts only. Deliberately no phone, birthdate
 * or street address (public repo, data minimization).
 */
export type ContactInfo = {
  name: string;
  role: string;
  valueProp: string;
  location: string;
  /** Current position, shown as the status line in the hero. */
  status: string;
  email: string;
  github: string;
  linkedin: string;
};

export type SkillArea = "software" | "infra";

/** 1 = "+", 4 = "++++" (see the legend in messages/*.json). */
export type SkillLevel = 1 | 2 | 3 | 4;

export type MatrixCategory = {
  id: string;
  area: SkillArea;
  label: { de: string; en: string };
};

export type MatrixSkill = {
  name: string;
  /** English name where it differs from the German one. */
  nameEn?: string;
  category: string;
  level: SkillLevel;
};
