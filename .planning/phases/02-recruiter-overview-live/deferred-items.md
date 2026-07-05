# Deferred Items — Phase 02 recruiter-overview-live

Out-of-scope discoveries logged per the executor's scope-boundary rule
(fix only what the current task's changes directly touch).

## From 02-04 (OG images + Person JSON-LD)

- **`⚠ metadataBase property in metadata export is not set` build warning
  for the root `/_not-found` route.** Adding `src/app/[locale]/opengraph-image.tsx`
  makes `next build` attempt OG/Twitter image URL resolution globally,
  surfacing this warning for the framework-generated root not-found page,
  which has no `layout.tsx`/`not-found.tsx` at `src/app/` (only under
  `src/app/[locale]/`) and therefore no `metadataBase` in its metadata
  chain. Build still succeeds; this is cosmetic. Out of scope for TECH-05
  (locale-scoped OG/JSON-LD) — would require adding a root-level
  `src/app/not-found.tsx` with its own `metadataBase`, which is a
  separate, unrelated route not touched by any 02-04 file.
