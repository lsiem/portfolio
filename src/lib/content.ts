import { allCaseStudies } from "content-collections";

export type CaseStudy = (typeof allCaseStudies)[number];

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
