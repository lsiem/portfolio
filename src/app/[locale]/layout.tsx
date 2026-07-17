import type React from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import type { Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { AnchorLink } from "@/components/motion/anchor-link";
import { MotionProvider } from "@/components/motion/motion-provider";
import { PageTransitionEffect } from "@/components/motion/page-transition-effect";
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

// preload:false (Phase-4 launch hardening, RESEARCH lever 3 — critical-window
// contention): the mono face renders only small eyebrow/label text, but its
// ~30KB preload sat in the simulated LCP critical window alongside the body
// and display faces. Dropping the preload changes delivery timing only — the
// rendered face is identical after load, with next/font's metric-matched
// fallback covering the gap (same pattern the display face used pre-Phase-4).
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  preload: false,
});

// Display face (D-03) — Bricolage Grotesque, self-hosted via next/font/local
// (zero runtime Google Fonts call, DSGVO-clean per AGENTS.md). Phase-4 launch
// hardening (D-11/D-12, levers A+B): the served woff2 is a build-time subset
// (scripts/subset-bricolage.ts, wired into `prebuild`) of the OFL-licensed
// weight-700 latin file committed alongside it — the glyph set is the computed
// union of every display-face string site-wide (hero H1, case-study/prose H1
// titles, message catalogs; both locales) plus a printable-ASCII + umlaut
// safety floor. Switching to next/font/local unlocks `preload: true` on this
// render-path file — display: "swap" retained (locked D-03; "optional" is
// forbidden without explicit user sign-off), and next/font's default
// adjustFontFallback ("Arial") keeps the metric-matched fallback so the swap
// never re-elects the LCP candidate. --font-bricolage maps to the Tailwind
// `font-display` utility via @theme in globals.css.
//
// LCP MEASUREMENTS (local LHCI, production build, slow-4G + 4x-CPU simulation,
// median of 3 runs, 2500ms TECH-01 gate):
//   before (next/font/google, preload:false): /de 2909ms, /en 2758ms
//     — LCP element: a Geist paragraph re-timed by the H1 font-swap
//     (RESEARCH Pitfall 5 / finding #1: the display face adds a fixed ~300ms).
//   lever A (next/font/local full latin 22KB, preload:true): /de 2609ms,
//     /en green — /de still ~110ms over the gate.
//   levers A+B (subset ~15KB / 115 chars, preload:true): /de 2693–2770ms,
//     /en 2609–2614ms — both still over the local gate, so the lighthouserc
//     LCP assertion stays "warn" (exception path, user-approved; the
//     display:"optional" escalation stays unapplied). Production (Vercel +
//     CrUX) remains the calibrated source of truth for the D-11 gate —
//     re-checked end-of-phase in 04-05.
const bricolageGrotesque = localFont({
  src: "../fonts/bricolage-grotesque-subset-700.woff2",
  variable: "--font-bricolage",
  weight: "700",
  display: "swap",
  preload: true,
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
                <AnchorLink
                  href="#contact"
                  className="font-mono text-xs text-muted transition-colors hover:text-foreground"
                >
                  {nav("contact")}
                </AnchorLink>
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
            <PageTransitionEffect>
              <div className="flex flex-1 flex-col">{children}</div>
            </PageTransitionEffect>
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
