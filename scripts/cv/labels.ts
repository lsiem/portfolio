/**
 * labels.ts — static CV chrome strings (section labels + "as of" prefix).
 *
 * These are NOT content-model facts (career/projects/skills/contact) — they are
 * document chrome that has no next-intl message key equivalent, since the CV is
 * a build script output, not a rendered page. Mirrors the {de,en} const-map
 * convention from content/{de,en}/contact.ts. Dependency-free.
 */

export const labels = {
  de: {
    documentTitle: "Lebenslauf",
    career: "Werdegang",
    projects: "Projekte",
    skills: "Fähigkeiten",
    contact: "Kontakt",
    asOfPrefix: "Stand:",
  },
  en: {
    documentTitle: "Curriculum Vitae",
    career: "Career",
    projects: "Projects",
    skills: "Skills",
    contact: "Contact",
    asOfPrefix: "As of:",
  },
} as const;

export type CvLocale = keyof typeof labels;
export type CvLabels = (typeof labels)[CvLocale];
