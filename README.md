# Portfolio — lsiem.de

Bilingual (DE/EN) personal portfolio of Lasse Siemoneit, built as a
statically-rendered Next.js 16 site with a typed, Git-based content model.

## Stack

- **Next.js 16** (App Router, Turbopack) — full SSG, one route tree per locale
- **next-intl** — route-based i18n (`/de`, `/en`), `localePrefix=always`,
  German default, full hreflang (`de` / `en` / `x-default`) in head + `Link` header
- **Content Collections** — MDX prose with Zod-validated frontmatter
- **TypeScript + Zod** — structured content as typed modules; the compiler and a
  parity gate enforce DE↔EN completeness
- **Tailwind CSS 4** — styling (deliberately minimal in this phase; presentation
  is Phase 2)
- **Vercel** — hosting, cookieless Web Analytics + Speed Insights

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Local dev server |
| `pnpm build` | Production build (runs `check:content` first via `prebuild`) |
| `pnpm start` | Serve the production build locally |
| `pnpm check:content` | DE/EN locale parity gate + local confidentiality blocklist scan |
| `pnpm lint` | ESLint |

## Content model

Content is the single source of truth, organized as parallel locale trees:

```
content/
  shared/types.ts          # Zod schemas + inferred TS types (the DE↔EN contract)
  de/                      # German
    career.ts projects.ts skills.ts contact.ts   # structured data (typed modules)
    case-studies/*.mdx     # long-form prose (MDX + frontmatter)
    pages/*.mdx            # about, impressum, datenschutz
  en/                      # English — identical structure
```

- **Structured data** (career, projects, skills, contact) lives in typed TS
  modules; `satisfies` against the shared contract makes the compiler the
  structured-parity check.
- **Long-form prose** (case studies, pages) lives in MDX with Zod-validated
  frontmatter, consumed only through typed accessors in `src/lib/content.ts`.
- **Parity gate** (`pnpm check:content`) fails the build if any content file
  exists in only one locale, and — locally — scans committed content against a
  confidentiality blocklist. The blocklist lives under
  `.planning/phases/*/reference/` and is gitignored (local-only); the scan skips
  gracefully in CI where the file is absent.

## Deployment

Deploys go to Vercel **preview** URLs only in this phase. The production domain
(`lsiem.de`) and its Git-integration switch to this site are handled in Phase 2;
do not run `vercel --prod` from this workflow.

CI (`.github/workflows/ci.yml`) runs `check:content` → `build` → Lighthouse CI
budget on every push, failing on LCP / initial-JS / performance-score regressions.

## Notes

- `.planning/` and any `reference/` directories are local-only working material
  and are excluded from Git and from Vercel uploads.
