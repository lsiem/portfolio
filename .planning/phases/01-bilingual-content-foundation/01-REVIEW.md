---
status: issues
files_reviewed: 41
critical: 0
warning: 2
info: 2
total: 4
---

# Code Review Report — Phase 01 (bilingual-content-foundation)

This code review analyzes the source and infrastructure files changed during Phase 01 for bugs, security vulnerabilities, accessibility (a11y), and quality issues.

## Summary of Findings

- **Critical/Blocker:** 0
- **Warning:** 2
- **Info:** 2
- **Total:** 4

---

## Detailed Findings

### WR-01: Playwright strict mode violation and count mismatches in evals/home.spec.ts

- **File:** [evals/home.spec.ts](file:///Users/lasse/Development/Projects/portfolio/evals/home.spec.ts)
- **Line Range:** L19-L22 and L28-L31
- **Severity:** Warning
- **Impact:** Causes the Playwright automated test suite to fail when run locally or in CI.
- **Description:**
  1. The locator `page.locator("nav")` matches multiple `<nav>` elements present on the page (one in `<header>` and one in `<footer>` for legal links), triggering a Playwright strict mode violation.
  2. The assertion `await expect(items).toHaveCount(1)` expects exactly 1 case study/project list item. However, because `page.locator("#projects ul li")` matches nested `li` elements (like tags lists) and multiple projects have been added in Phase 01, this locator matches 39 elements instead of 1.
- **Recommendation:**
  1. Restructure the navigation locator to be specific, e.g. `page.locator("header nav")` or `page.getByRole("navigation").first()`.
  2. Use a more specific selector for the projects list like `page.locator("#projects > ul > li")` and check that the count is greater than 0, or match the exact number of projects in the dataset (e.g. 6).

---

### WR-02: Missing dynamicParams = false in case-studies/[slug]/page.tsx

- **File:** [src/app/[locale]/case-studies/[slug]/page.tsx](file:///Users/lasse/Development/Projects/portfolio/src/app/[locale]/case-studies/[slug]/page.tsx)
- **Line Range:** L10-L12
- **Severity:** Warning
- **Impact:** Next.js might attempt to dynamically resolve unknown case study slugs at request time instead of returning a static 404 immediately.
- **Description:**
  While the static pages route (`src/app/[locale]/[slug]/page.tsx`) correctly sets `export const dynamicParams = false;` to guarantee static-only compilation and serving, this declaration is missing in the case studies route. This conflicts with the project's architectural goal of pure SSG with no dynamic rendering.
- **Recommendation:**
  Add `export const dynamicParams = false;` in the file header to force static-only routing.

---

### IF-01: Alphabetical single blocklist limit in scripts/check-content-parity.ts

- **File:** [scripts/check-content-parity.ts](file:///Users/lasse/Development/Projects/portfolio/scripts/check-content-parity.ts)
- **Line Range:** L83-L99
- **Severity:** Info
- **Impact:** Potential maintenance or coverage gaps if future phases use separate blocklists.
- **Description:**
  The `findBlocklist()` helper only resolves the first alphabetical `blocklist.txt` found under any phase folder. If future phases define different forbidden terms, they won't be merged or dynamically selected.
- **Recommendation:**
  Consider updating `findBlocklist` to scan and aggregate terms from all blocklist files found across phase directories, or pass the active phase directory path as a parameter.

---

### IF-02: Language switcher accessibility enhancement

- **File:** [src/components/locale-switcher.tsx](file:///Users/lasse/Development/Projects/portfolio/src/components/locale-switcher.tsx)
- **Line Range:** L18-L28
- **Severity:** Info
- **Impact:** Screen reader users might hear only the language name without descriptive context about the action.
- **Description:**
  The switcher link renders the target language name ("English" / "Deutsch") but lacks an explicit `aria-label` describing the transition.
- **Recommendation:**
  Add an `aria-label` attribute (e.g. `Change language to English` or `Sprache auf Deutsch umstellen`) to the Link component for improved accessibility (a11y).
