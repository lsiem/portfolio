import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// Security response headers (T-02-09, T-02-17, T-02-18 — 02-06 hardening pass).
//
// CSP TODO (documented fallback, not shipped — 02-06 REVIEW finding 7 /
// STATE.md `## Blockers/Concerns`):
//
// A CSP was attempted with `script-src 'self' '<hash of the no-flash theme
// script>'`. Verified with Playwright + a browser console check against a
// production build (`pnpm build && pnpm start`): the static hash-only CSP
// BREAKS the site. Next.js App Router streams the RSC payload for every page
// via multiple `self.__next_f.push(...)` inline `<script>` tags whose content
// (and therefore sha256 hash) differs per route AND per build — there is no
// finite, stable hash set to allowlist for a statically-generated App Router
// site. The only spec-compliant ways to allow these are (a) `'unsafe-inline'`
// on script-src (explicitly disallowed by this plan), or (b) per-request
// nonces via Proxy/middleware, which forces dynamic rendering on every route
// and would break the whole site's static optimization (SSG/ISR) — a much
// larger architectural change than this hardening plan's scope.
//
// Exact blockers to resolve before a CSP can ship:
// 1. Next.js App Router's per-page RSC hydration inline scripts have
//    non-deterministic, per-build/per-route hashes — no static allowlist is
//    possible without nonce-based dynamic rendering.
// 2. Nonce-based CSP requires Proxy-injected per-request nonces, which forces
//    every route to render dynamically — incompatible with this project's
//    all-static (SSG/ISR) architecture and its CWV budget.
//
// Non-CSP headers below (HSTS, nosniff, X-Frame-Options DENY, Referrer-Policy,
// Permissions-Policy) ship unconditionally and are NOT affected by this gap.
// Tracked as a follow-up in .planning/STATE.md `## Blockers/Concerns`.
const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

// withContentCollections MUST be the outermost plugin
export default withContentCollections(withNextIntl(nextConfig));
