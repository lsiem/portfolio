import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["de", "en"],
  defaultLocale: "de",
  localePrefix: "always", // /de and /en always prefixed
  localeDetection: false, // no accept-language negotiation; / → /de always
});
