---
description: Portfolio development patterns, coding conventions, commit style, and step-by-step workflows for Next.js/TypeScript.
---
# portfolio Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill provides a comprehensive guide to developing and maintaining the `portfolio` project, a TypeScript-based Next.js application. It covers coding conventions, commit patterns, testing strategies, and detailed, step-by-step workflows for common development scenarios such as project initialization, internationalization, content modeling, and CI/test suite management. This guide is designed to help contributors quickly understand and apply the project's standards and processes.

## Coding Conventions

### File Naming

- **CamelCase** is used for file names:
  - Example: `myComponent.tsx`, `userProfile.ts`

### Import Style

- **Mixed imports** are used, including both default and named imports.
  - Example:
    ```typescript
    import React from 'react';
    import { useRouter } from 'next/navigation';
    import type { User } from './types';
    ```

### Export Style

- **Named exports** are preferred:
  - Example:
    ```typescript
    // Good
    export function MyComponent() { ... }
    export const MY_CONSTANT = 42;

    // Avoid default exports
    // export default MyComponent;
    ```

### Commit Patterns

- **Conventional commits** are used.
- Prefixes: `docs`, `feat`, `chore`, `fix`
- Example commit messages:
  - `feat: add language switcher component`
  - `fix: correct locale routing bug`
  - `docs: update roadmap for Q2`
  - `chore: update dependencies`

## Workflows

### Phase Planning and Documentation

**Trigger:** When planning a new phase, documenting requirements, or updating project research and plans  
**Command:** `/plan-phase`

1. Create or update markdown files under `.planning/` (e.g., `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`).
2. Add or revise research and plan files under `.planning/research/` and `.planning/phases/`.
3. Optionally update `.gitignore` or related config if new files or directories are introduced.

**Example:**
```bash
# Add a new phase plan
touch .planning/phases/v2/PLAN.md
git add .planning/phases/v2/PLAN.md
git commit -m "docs: add v2 phase plan"
```

---

### Project Initialization and Rewrite

**Trigger:** When starting a new project foundation, migrating frameworks, or performing a full rewrite  
**Command:** `/init-project`

1. Extract or archive old content files to a planning or extracted directory.
2. Delete obsolete source files, configs, and documentation.
3. Scaffold new project structure (e.g., using `create-next-app` or Vite).
4. Add or update configuration files (`package.json`, `next.config.ts`, `tailwind.config.js`, etc.).
5. Install and configure dependencies.
6. Set up initial public assets and documentation.

**Example:**
```bash
npx create-next-app@latest
mv old_src .planning/phases/v1/extracted/
rm -rf old_src
git add .
git commit -m "chore: scaffold Next.js project and archive legacy code"
```

---

### i18n Feature Development

**Trigger:** When adding or improving multilingual support (e.g., new language, locale routing, translation keys)  
**Command:** `/add-locale`

1. Add or update translation JSON files (e.g., `messages/de.json`, `messages/en.json`).
2. Update or create locale-based layouts and pages (`src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx`).
3. Implement or update language switcher components (`src/components/locale-switcher.tsx`).
4. Update i18n utility files (`src/i18n/navigation.ts`, etc.).
5. Update configuration (`next.config.ts`) to support new locales.

**Example:**
```typescript
// src/components/locale-switcher.tsx
export function LocaleSwitcher() {
  // ...switcher logic
}
```
```json
// messages/fr.json
{
  "greeting": "Bonjour"
}
```

---

### Content Model Extension

**Trigger:** When adding a new content type, extending schemas, or localizing content  
**Command:** `/add-content-type`

1. Add or update content collection definitions (`content-collections.ts`).
2. Add new content files for each locale (e.g., `content/de/case-studies/*.mdx`).
3. Update or create shared types and schemas (`content/shared/types.ts`).
4. Update SSG/page logic to consume new content (`src/app/[locale]/case-studies/[slug]/page.tsx`).
5. Update configuration if necessary (`tsconfig.json`).

**Example:**
```typescript
// content-collections.ts
export const caseStudies = [
  { slug: "project-x", locale: "en", ... },
  { slug: "projekt-x", locale: "de", ... }
];
```

---

### CI and Test Suite Extension

**Trigger:** When adding new automated tests, extending CI, or configuring test runners  
**Command:** `/add-test-suite`

1. Add or update CI workflow files (`.github/workflows/ci.yml`).
2. Add or update test specs (e.g., `evals/*.spec.ts`, `e2e/*.spec.ts`).
3. Update test runner configuration (`playwright.config.ts`).
4. Update `package.json` or lockfiles if dependencies change.

**Example:**
```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test
```
```typescript
// evals/sample.spec.ts
import { describe, it, expect } from 'vitest';

describe('sample', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2);
  });
});
```

## Testing Patterns

- **Framework:** [vitest](https://vitest.dev/)
- **Test file pattern:** `*.test.ts`
- **Example:**
  ```typescript
  // src/lib/math.test.ts
  import { add } from './math';

  test('add returns sum', () => {
    expect(add(2, 3)).toBe(5);
  });
  ```
- Tests are colocated with source or in dedicated test directories.

## Commands

| Command          | Purpose                                                      |
|------------------|--------------------------------------------------------------|
| /plan-phase      | Start or update planning, requirements, or research docs     |
| /init-project    | Scaffold, migrate, or rewrite the project foundation         |
| /add-locale      | Add or extend internationalization features                  |
| /add-content-type| Add or extend typed content models and schemas               |
|| /add-test-suite  | Add or extend CI and automated test suites                   |
