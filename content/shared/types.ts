import { z } from "zod";

/**
 * Shared Zod schemas + inferred TS types for structured content.
 *
 * This is the interface contract plans 01-03/01-04 implement against:
 * per-locale TS modules under content/de/ and content/en/ import these types,
 * so the compiler itself enforces DE↔EN completeness for structured data
 * (I18N-02). Schemas are presentation-free (no colors, logos, sizes) —
 * presentation is a Phase 2 concern.
 */

/** "YYYY-MM" month string, e.g. "2021-12". */
const yearMonth = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Expected YYYY-MM");

/**
 * A single role within a career entry. `from` is nullable to support
 * mid-progression phases whose exact start date is unconfirmed;
 * `to: null` means "present".
 */
export const careerRoleSchema = z.object({
  title: z.string().min(1),
  from: yearMonth.nullable(),
  to: yearMonth.nullable(),
  description: z.string().min(1),
});

/**
 * One career station. `roles` (min 1) models role progressions within the
 * same organization (D-02: Systemadministrator → Software Engineering →
 * Product Owner). `to: null` means "present".
 */
export const careerEntrySchema = z.object({
  slug: z.string().min(1),
  org: z.string().min(1),
  orgUrl: z.url().optional(),
  location: z.string().optional(),
  from: yearMonth,
  to: yearMonth.nullable(),
  roles: z.array(careerRoleSchema).min(1),
  intro: z.string().optional(),
  techStack: z.array(z.string()),
  highlights: z.array(z.string()).optional(),
});

/** Project metadata. `depth` carries the D-01 weighting. */
export const projectSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  tags: z.array(z.string()).min(1),
  url: z.url().optional(),
  period: z.string().optional(),
  depth: z.enum(["flagship", "deep", "card"]),
  order: z.number(),
});

/** A single skill — deliberately NO percent/level fields (CONT-05). */
export const skillSchema = z.object({
  name: z.string().min(1),
  years: z.number().optional(),
  projectSlugs: z.array(z.string()).optional(),
  note: z.string().optional(),
});

export const skillDomainSchema = z.object({
  domain: z.string().min(1),
  skills: z.array(skillSchema),
});

/**
 * Contact info — role-relevant facts only: deliberately NO phone,
 * birthdate, or address fields (public repo, data minimization).
 */
export const contactInfoSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  /**
   * One-sentence value proposition — the single source of truth for the
   * hero (src/app/[locale]/page.tsx) AND the CV document (Plan 02
   * CvDocument). Do not duplicate this copy in next-intl messages.
   */
  valueProp: z.string().min(1),
  email: z.email(),
  github: z.url(),
  linkedin: z.url(),
});

export type CareerRole = z.infer<typeof careerRoleSchema>;
export type CareerEntry = z.infer<typeof careerEntrySchema>;
export type Project = z.infer<typeof projectSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type SkillDomain = z.infer<typeof skillDomainSchema>;
export type ContactInfo = z.infer<typeof contactInfoSchema>;
