import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

// System theme-color meta (TECH-04) — matches the --background token in
// globals.css for each media case. The ThemeToggle client control updates
// this meta live when the visitor picks an explicit Light/Dark override.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// No-flash inline theme script (TECH-04 / D-B, RESEARCH §3). A static
// string literal — no interpolation of request/user data, no external
// call (DSGVO) — so it is XSS-safe and safe to run before hydration. Reads
// localStorage key "theme"; if "light"/"dark", sets documentElement's
// data-theme attribute before first paint so there is no flash. System
// (unset/anything else) leaves data-theme unset so the
// @media(prefers-color-scheme) block in globals.css governs.
const NO_FLASH_THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face (D-03) — Bricolage Grotesque, self-hosted at build by next/font
// (zero runtime Google Fonts call, DSGVO-clean per AGENTS.md, same pattern as
// Geist above). Weight-only variable axis (wght): the opsz+wdth axes were
// dropped to keep the preloaded woff2 small enough to hold the BLOCKING LHCI
// LCP budget (<=2500ms) — with all three axes the variable font ballooned to
// ~131KB and regressed hero LCP past the gate (finding #1 / RESEARCH Pitfall 5).
// The hero H1 still renders in Bricolage across the 700-800 display weight
// range; only the optical-size/width fine-tuning is forgone (UI-SPEC allows the
// weight-only fallback). --font-bricolage maps to the Tailwind `font-display`
// utility via @theme in globals.css.
const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: "variable",
  // preload:false — the display face is not the LCP-critical font. With swap
  // (next/font default) the hero H1 first paints in the metric-adjusted fallback
  // (adjustFontFallback default keeps CLS low) so LCP fires on that immediate
  // text paint, NOT gated on the Bricolage download; Bricolage then swaps in.
  // Preloading it instead made the woff2 compete with the real LCP text and
  // pushed LCP past the BLOCKING 2500ms gate (finding #1 / RESEARCH Pitfall 5).
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // REQUIRED for static rendering — every layout AND page under [locale]
  setRequestLocale(locale);
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${bricolageGrotesque.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
        <NextIntlClientProvider>
          <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="font-mono text-sm font-semibold tracking-tight transition-opacity hover:opacity-70"
              >
                LS<span className="text-accent">.</span>
              </Link>
              {/*
                Header control cluster (D-A order): logo | spacer | Contact |
                ThemeToggle | LocaleSwitcher. Stays single-row on narrow
                viewports; if it ever overflows, Contact may collapse to an
                icon-only affordance with an aria-label (inline SVG,
                currentColor — Claude's discretion, not needed yet at this
                width).
              */}
              <div className="flex items-center gap-4">
                <a
                  href="#contact"
                  className="font-mono text-xs text-muted transition-colors hover:text-foreground"
                >
                  {nav("contact")}
                </a>
                <ThemeToggle />
                <LocaleSwitcher />
              </div>
            </div>
          </header>
          {/*
            MotionProvider wraps only {children} (the page body), not the sticky
            header/footer chrome (finding #8). Lenis runs in `root` mode, so it
            governs the whole window scroll regardless of this DOM nesting —
            keeping the header outside the Lenis subtree avoids re-scoping the
            sticky header while hash-anchor nav (#career etc.) still lands
            correctly under Lenis on desktop. LenisRef ref shape confirmed via
            node_modules/lenis/dist/lenis-react.d.ts.
          */}
          <MotionProvider>
            <div className="flex flex-1 flex-col">{children}</div>
          </MotionProvider>
          <footer className="border-t border-border/60">
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-8 font-mono text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} Lasse Siemoneit</span>
              <nav aria-label={t("legal.label")}>
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="transition-colors hover:text-foreground"
                    >
                      {t("legal.about")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/impressum"
                      className="transition-colors hover:text-foreground"
                    >
                      {t("legal.impressum")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/datenschutz"
                      className="transition-colors hover:text-foreground"
                    >
                      {t("legal.datenschutz")}
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </footer>
        </NextIntlClientProvider>
        {/* Cookieless, GDPR-friendly analytics (TECH-06, D-10) — no consent banner */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
