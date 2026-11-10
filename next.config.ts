import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

// Security response headers.
//
// No Content-Security-Policy yet: App Router hydrates through inline
// `self.__next_f.push(...)` scripts whose hashes differ per route and per
// build, so a static hash allowlist breaks the site, and nonces would force
// every route to render dynamically. The headers below do not depend on it.
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
