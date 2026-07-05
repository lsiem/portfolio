# Phase 2: Recruiter Overview Live - Pattern Map

**Mapped:** 2026-07-05
**Files analyzed:** 15 (new + modified)
**Analogs found:** 12 / 15 (3 are net-new patterns with partial anchors)

> This codebase is Next.js 16 (App Router, full SSG) + React 19.2 + Tailwind 4 CSS-first (**no component library**) + next-intl 4. Content is a set of plain TS modules + MDX at repo root `content/{de,en}/*`, loaded through `src/lib/content.ts`. Every page/layout under `[locale]` calls `setRequestLocale(locale)` and `await params` (params is a Promise in Next 16). Copy these conventions verbatim.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/[locale]/page.tsx` (MODIFY — add sections, JSON-LD, heatmap mount, CV/contact affordances, OG meta) | route/page (RSC) | request-response (SSG) | itself (current interim build) | exact (extend in place) |
| `src/app/[locale]/layout.tsx` (MODIFY — no-flash script, ThemeToggle + Contact in header cluster, `viewport.themeColor`) | layout (RSC) | request-response (SSG) | itself | exact (extend in place) |
| `src/components/section/*.tsx` (OPTIONAL extract: Hero/Career/Projects/Skills/About/Contact) | component (RSC, presentational) | transform (content→HTML) | inline sections in `page.tsx` L53-235 | exact (lift-and-shift) |
| `src/components/theme-toggle.tsx` (NEW) | component (Client) | event-driven | `src/components/locale-switcher.tsx` | role-match (client control, header cluster) |
| `src/components/header-controls.tsx` (OPTIONAL NEW cluster) | component | request-response | header `<div>` in `layout.tsx` L49-57 | partial (markup pattern) |
| `src/components/github-heatmap.tsx` (NEW) | component (RSC) | transform + fallback | skills-grid block in `page.tsx` L188-211 | role-match (grid render from data) |
| `src/lib/github.ts` (NEW) | service (server-only) | request-response (build/ISR fetch) | `src/lib/content.ts` (loader shape) + `seo.ts` (env-var use) | role-match (lib accessor) |
| `src/lib/seo.ts` (MODIFY — add `openGraph`/`twitter` block builder + Person JSON-LD helper) | utility (metadata) | transform | itself (`localeAlternates`) | exact (extend in place) |
| `src/app/[locale]/opengraph-image.tsx` (NEW) | route (build-static image) | file-I/O (read ttf) → transform | `case-studies/[slug]/page.tsx` (params-Promise + `getX(locale)` pattern) | partial (new Next convention) |
| `src/app/[locale]/case-studies/[slug]/opengraph-image.tsx` (OPTIONAL NEW) | route (build-static image) | file-I/O → transform | overview `opengraph-image.tsx` (once written) | exact (sibling) |
| `scripts/generate-cv.tsx` (NEW) | build script (Node/tsx) | batch → file-I/O | `scripts/check-content-parity.ts` | role-match (standalone Node build step) |
| `scripts/cv/CvDocument.tsx` (NEW) | component (react-pdf, non-DOM) | transform | inline sections in `page.tsx` (same content shape) | partial (different render target) |
| `scripts/cv/labels.ts` (NEW) | config/data | — | `content/{de,en}/contact.ts` (`{de,en}` const map) | role-match |
| `src/app/globals.css` (MODIFY — `data-theme` overrides, `@custom-variant dark`, reduced-motion guard) | config (styles) | — | itself L3-45 | exact (extend in place) |
| `package.json` (MODIFY — `prebuild` chain + `generate:cv` script + 3 devDeps) | config | — | itself L6-14 | exact |

---

## Pattern Assignments

### `src/app/[locale]/page.tsx` (route/page, SSG) — MODIFY

**Analog:** itself — the overview already renders hero/career/projects/skills/contact from the content loaders. Phase 2 adds an About block, the GitHub heatmap mount, a CV download button in `#contact`, and a Person JSON-LD `<script>`; and extends `generateMetadata` with the `openGraph`/`twitter` block.

**Page + metadata skeleton to preserve** (L13-49):
```tsx
type Props = Readonly<{ params: Promise<{ locale: string }> }>;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  return {
    metadataBase: siteMetadataBase,
    title: "Lasse Siemoneit",
    description: t("role"),
    alternates: localeAlternates("/"),
    // Phase 2 ADD: openGraph + twitter block (built via seo.ts helper)
  };
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);          // REQUIRED for static rendering — keep
  const contact = getContact(locale);
  // ... getCareer / getProjects / getSkillDomains as today
}
```

**Section pattern to copy for the new About + heatmap sections** (mono eyebrow h2, `scroll-mt-24`, `aria-labelledby`) — from career section L87-91:
```tsx
<section id="about" aria-labelledby="about-heading" className="flex scroll-mt-24 flex-col gap-6">
  <h2 id="about-heading" className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
    {aboutT("title")}
  </h2>
  {/* ... */}
</section>
```

**Accent-link vs muted-external-link discipline already established** — copy exactly (email accent, GitHub/LinkedIn muted), L219-233:
```tsx
<a href={`mailto:${contact.email}`} className="text-accent transition-colors hover:text-foreground"> … </a>
<a href={contact.github} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-foreground"> … ↗ </a>
```
The **CV download button** is the ONE allowed filled-accent CTA (UI-SPEC): `bg-accent text-background rounded-md px-4 py-2` + `download` + format-bearing `aria-label`. Place inside `#contact` only (D-C).

**Person JSON-LD** — server-rendered, first-party controlled data (RESEARCH §4). Emit near the top of the returned tree:
```tsx
<script type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify({
    "@context": "https://schema.org", "@type": "Person",
    name: contact.name, jobTitle: contact.role,
    url: `${siteMetadataBase.origin}/${locale}`,
    email: `mailto:${contact.email}`,
    sameAs: [contact.github, contact.linkedin],
  }) }} />
```
(Data is controlled — no user input — so `dangerouslySetInnerHTML` is acceptable here per react/security rules.)

---

### `src/components/theme-toggle.tsx` (client component) — NEW

**Analog:** `src/components/locale-switcher.tsx` — the only existing client control, and it already lives in the header cluster with the exact token styling the toggle must match.

**Client-component + token styling to copy** (whole file, L1-29):
```tsx
"use client";
import { useTranslations } from "next-intl";
// className baseline to mirror (locale switcher):
// "rounded-full border border-border px-3 py-1 font-mono text-xs text-muted
//  transition-colors hover:border-foreground/40 hover:text-foreground"
```
Diverge from the analog for: 3-state System/Light/Dark (segmented — RESEARCH Open Q3), `localStorage` key `theme`, writes `document.documentElement.dataset.theme`, `aria-label` "Darstellung"/"Theme" + per-option `aria-pressed`/`aria-checked`. **Accent NOT used** (UI-SPEC). Reconcile stored value in a mount `useEffect` (or `useSyncExternalStore`) to avoid hydration mismatch (RESEARCH Pitfall 3). Active segment `text-foreground`, inactive `text-muted`, hover `border-foreground/40`.

---

### `src/lib/github.ts` (server-only service) — NEW

**Analog:** `src/lib/content.ts` for the accessor-function shape (`export function getX(locale): Type`), and `src/lib/seo.ts` for the `process.env.*` build-time env read.

**Content-loader accessor shape to mirror** (`content.ts` L59-61):
```ts
export function getContact(locale: string): ContactInfo { return CONTACT[contentLocale(locale)]; }
```

**New pattern** (verified in RESEARCH §2): `import "server-only"` at top; `getContributionCalendar(login)` does a build-time POST to `https://api.github.com/graphql` with `Authorization: Bearer ${process.env.GITHUB_TOKEN}` and `next: { revalidate: 86400, tags: ["github-contributions"] }`. **Graceful fallback**: `if (!token) return null` and `try/catch → return null` (never throw into the page — matches the codebase's "degrade to fallback line" contract). `login` = `lsiem`, derived from `getContact(locale).github` not hardcoded.

---

### `src/components/github-heatmap.tsx` (RSC) — NEW

**Analog:** the skills-domain grid in `page.tsx` L188-211 — nested `.map` render from a typed content structure, `font-mono text-xs text-muted`, chip/cell styling with `rounded border border-border`.

**Cell/grid styling** per UI-SPEC + RESEARCH §2: week×day grid, cells `~11px`, `gap-1`, `rounded-[2px]`. **Monochrome `--foreground`-opacity ramp** (empty → `--border`; then `foreground/20 → /40 → /70 → foreground`) — **accent forbidden**. Accessibility: grid `role`/`aria-label` "GitHub contributions, last 12 months" (localized) + visually-hidden `totalContributions`. **Empty/error state**: when `getContributionCalendar` returns `null`, render the static fallback line ("GitHub-Aktivität derzeit nicht verfügbar." / "GitHub activity is currently unavailable.") from `next-intl` messages — never a broken grid.

---

### `src/lib/seo.ts` (metadata utility) — MODIFY

**Analog:** itself — `localeAlternates(pathname)` is the exact pattern for a new `openGraph`/`twitter` block builder and a `personJsonLd(contact, locale)` helper.

**Existing helper shape to extend** (L21-32):
```ts
export function localeAlternates(pathname: string): Metadata["alternates"] { … }
```
Add an `openGraph`/`twitter` builder returning `Metadata["openGraph"]` (title, description, `url`, `siteName`, `locale`, `type: "profile"`). `siteMetadataBase` (L10-14) already resolves relative OG URLs to absolute AND is the **one-line CTX-06 domain flip** — change the localhost/VERCEL fallback to `https://lsiem.de` at cutover. The `opengraph-image.tsx` file convention auto-emits the `og:image`/`twitter:image` tags — do NOT hand-wire image URLs.

---

### `src/app/[locale]/opengraph-image.tsx` (build-static image) — NEW

**Analog:** `case-studies/[slug]/page.tsx` for the Next-16 `params`-is-Promise + `getX(locale)` conventions; the image API itself is a new Next convention (RESEARCH §4, verified against bundled Next 16 docs).

**Conventions to copy** (params Promise, from `case-studies/[slug]/page.tsx` L9/L21):
```tsx
type Props = Readonly<{ params: Promise<{ locale: string }> }>;
const { locale } = await params;   // Next 16 — params is a Promise, MUST await
```
**New (verified) pattern:**
```tsx
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lasse Siemoneit — Portfolio";
// fonts: readFile geist ttf from node_modules/geist/dist/fonts/geist-sans|geist-mono
```
Constraints: **flexbox + CSS subset only (NO `display:grid`)**; **TTF/OTF**; **≤500KB total** incl. fonts. Card composition: `--background` field, mono eyebrow, Geist SemiBold name, muted role, single accent hairline, locale indicator (Claude's Discretion per CONTEXT).

---

### `scripts/generate-cv.tsx` + `scripts/cv/CvDocument.tsx` + `scripts/cv/labels.ts` — NEW

**Analog:** `scripts/check-content-parity.ts` — the established standalone Node build-script pattern (shebang, dependency-light, run from `prebuild`, uses `node:*` built-ins). `CvDocument.tsx` mirrors the section content shape from `page.tsx`; `labels.ts` mirrors the `{de,en}` const-map convention from `content/{de,en}/contact.ts` and `content.ts` L26-30.

**Build-script conventions to copy** (`check-content-parity.ts` L1-27): file-header docblock explaining the DSGVO/no-runtime rationale, `node:fs`/`node:path` built-ins, exit-code discipline.

**New (RESEARCH §1, MEDIUM-HIGH confidence):** `@react-pdf/renderer` v4.5.1. `Font.register` with **local ttf file `src` paths** (never URLs — Pitfall 1 async-font race) from `node_modules/geist/dist/fonts/geist-sans/*`. Loop `["de","en"]`, `renderToFile(<CvDocument locale generatedAt/>, public/Lasse-Siemoneit-CV-${locale}.pdf)`. Import content directly from `content/{de,en}/{career,projects,skills,contact}.ts` (single source of truth). One-column ATS layout (D-E). Contact facts = email/GitHub/LinkedIn only (schema has no phone/address). **Must never be imported under `src/app/**`** — keep it script-only (devDep) so it stays out of the client/runtime graph.

---

### `src/app/globals.css` (styles) — MODIFY

**Analog:** itself — the interim token block L3-45 is the exact structure to extend.

**Existing token structure** (L3-29): `:root { --background … }`, `@theme inline { --color-* … }`, `@media (prefers-color-scheme: dark) { :root { … } }`.

**Add** (RESEARCH §3, confirm `@custom-variant` block-form against installed Tailwind 4 at implementation — Assumption A6):
- Keep `:root` (light) + the media-query dark block = **System** behavior.
- Add `:root[data-theme="light"]` / `:root[data-theme="dark"]` explicit overrides (higher specificity → wins over media query).
- Register `@custom-variant dark { &:where([data-theme="dark"], [data-theme="dark"] *) { @slot; } @media (prefers-color-scheme: dark) { &:where(:not([data-theme] *)) { @slot; } } }` — only if `dark:` utilities are actually used (token-only approach needs none).
- **Fix Pitfall 6:** wrap `html { scroll-behavior: smooth }` (L31-33) in `@media (prefers-reduced-motion: no-preference)`.

---

### `src/app/[locale]/layout.tsx` (layout) — MODIFY

**Analog:** itself — the header cluster (L48-58) and body structure (L46-97) are extended in place.

**Header cluster to extend** (L48-57) — add `Contact` anchor + `<ThemeToggle/>` to the right of `<LocaleSwitcher/>` per D-A order (logo | spacer | Contact | ThemeToggle | LocaleSwitcher):
```tsx
<header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
  <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
    <Link href="/" …>LS<span className="text-accent">.</span></Link>
    {/* ADD: Contact anchor (#contact) + ThemeToggle before LocaleSwitcher */}
    <LocaleSwitcher />
  </div>
</header>
```

**No-flash inline script** (RESEARCH §3) — first child of `<body>`, raw inline `<script>` via `dangerouslySetInnerHTML` (NOT a hydrated component), reads `localStorage` `theme` → sets `documentElement.dataset.theme`. Add `viewport.themeColor` media array export for the System theme-color meta.

---

## Shared Patterns

### Locale + static rendering (apply to EVERY new page/layout/OG route)
**Source:** `src/app/[locale]/page.tsx` L34-38, `case-studies/[slug]/page.tsx` L36-38
```tsx
const { locale } = await params;   // params is a Promise (Next 16)
setRequestLocale(locale);          // REQUIRED for static rendering
```

### Content access (apply to sections, heatmap, CV, OG, JSON-LD)
**Source:** `src/lib/content.ts` L39-61 — always read facts through `getCareer/getProjects/getSkillDomains/getContact(locale)`; never hardcode `lsiem`/contact facts (RESEARCH anti-pattern).

### External-link safety (apply to every `target="_blank"`)
**Source:** `page.tsx` L98, L225 — `target="_blank" rel="noopener noreferrer"`, muted styling (`text-muted hover:text-foreground`). Accent is reserved (UI-SPEC): logo `.`, Case Study links, email, CV button, `::selection`, active anchor-nav — **never** external/Visit links, chips, borders, heatmap cells, or controls.

### Section shell (apply to About + Activity sections)
**Source:** `page.tsx` L87-91 — `<section id aria-labelledby className="flex scroll-mt-24 flex-col gap-6">` + mono-eyebrow `<h2>` (`font-mono text-xs uppercase tracking-[0.25em] text-muted`).

### i18n imports
**Source:** `page.tsx` L2-3, `locale-switcher.tsx` L3-5 — `getTranslations`/`setRequestLocale` from `next-intl/server` (RSC); `useTranslations`/`useLocale` from `next-intl` + `Link` from `@/i18n/navigation` (client). All copy lives in `next-intl` messages, never hardcoded (UI-SPEC Copywriting Contract).

### Metadata + domain base
**Source:** `seo.ts` L10-14, `page.tsx` L19-24 — `metadataBase: siteMetadataBase` + `alternates: localeAlternates(path)` on every route; `siteMetadataBase` is the single CTX-06 cutover point.

### Build-script discipline
**Source:** `scripts/check-content-parity.ts` L1-27 + `package.json` L9 `prebuild` — new build artifacts (CV) chain into `prebuild` (before `next build`, so `public/` is populated — Pitfall 5); DSGVO no-runtime-third-party rationale documented in a file header.

---

## No Analog Found (planner should lean on RESEARCH.md)

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/app/[locale]/opengraph-image.tsx` | build-static image | file-I/O → transform | No `next/og` `ImageResponse` usage exists yet — new Next 16 file convention. Follow RESEARCH §4 (verified against bundled docs). Only the params/locale conventions are borrowed. |
| `scripts/cv/CvDocument.tsx` | react-pdf document | transform | No PDF rendering exists; react-pdf's `<Document>/<Page>/<Text>` model has no DOM analog. Content shape mirrors `page.tsx`; render target is new. RESEARCH §1. |
| `src/lib/github.ts` (the authenticated build-time `fetch`) | server-only fetch | request-response (build/ISR) | First authenticated build-time data source in the repo; accessor *shape* mirrors `content.ts` but the fetch+ISR+PAT pattern is new. RESEARCH §2. |

---

## Metadata

**Analog search scope:** `src/app/[locale]/**`, `src/components/**`, `src/lib/**`, `content/**`, `scripts/**`, `src/app/globals.css`, `package.json`
**Files scanned:** 11 (page.tsx, layout.tsx, case-studies/[slug]/page.tsx, seo.ts, content.ts, locale-switcher.tsx, globals.css, contact.ts, shared/types.ts, package.json, check-content-parity.ts)
**Pattern extraction date:** 2026-07-05
</content>
</invoke>
