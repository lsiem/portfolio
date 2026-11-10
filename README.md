# Portfolio — lsiem.de

Bilingual (DE/EN) portfolio of Lasse Siemoneit: a statically rendered
Next.js 16 site with a typed, Git-based content model.

## Stack

- **Next.js 16** (App Router), everything prerendered
- **next-intl** for `/de` and `/en` (German is the default)
- **Content Collections** for MDX prose (case studies, about, legal pages)
- **Tailwind CSS 4**; design tokens live in `src/app/globals.css`
  (dark by default, light via the header toggle)
- **Geist Sans / Geist Mono**, bundled locally — no third-party font requests
- Animations are CSS only and respect `prefers-reduced-motion`

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Local dev server |
| `pnpm build` | Production build (runs `check:content` first) |
| `pnpm start` | Serve the production build |
| `pnpm check:content` | DE/EN parity check for `content/` and `messages/` |
| `pnpm lint` | ESLint |
| `pnpm test` | Playwright smoke tests against the production build |

## Content

```
content/
  shared/types.ts          # the DE/EN contract
  shared/skill-matrix.ts   # full rated skill matrix (/skills explorer)
  de/ en/                  # identical structure per locale
    career.ts projects.ts skills.ts certificates.ts contact.ts
    case-studies/*.mdx
    pages/*.mdx            # about, impressum, datenschutz
messages/{de,en}.json      # UI strings
public/cv/                 # CV download (PDF, German)
```

To update the site, edit the content files; both locales must keep the same
shape or the build fails.

## Optional environment

- `GITHUB_TOKEN` — enables the GitHub contribution calendar on the home page.
  Without it the section is simply not rendered.
