# Portfolio Project Memory

## Stack
- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS v4
- **Content**: `@content-collections` (MDX) — `withContentCollections` must be the outermost Next.js plugin
- **i18n**: `next-intl` v4
- **Analytics**: `@vercel/analytics` + `@vercel/speed-insights`
- **Package manager**: pnpm 9 (lockfile v9, `allowBuilds` restrictions in `pnpm-workspace.yaml`)

## Plugin wrap order
```ts
export default withContentCollections(withNextIntl(nextConfig));
```
This order is mandatory — content-collections must wrap next-intl.

## Key conventions
- All content lives in `content/`
- Source code lives in `src/`
- Public assets in `public/`
- i18n messages in `messages/`

## ECC install
- Profile: `developer` + `framework:nextjs`
- Target: `claude`
- Installed: 2026-07-03

## Notes
- `@lhci/cli` is installed — Lighthouse CI available for perf audits
- No test runner configured yet — add Playwright for E2E if needed
