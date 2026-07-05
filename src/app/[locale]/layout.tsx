import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import type { Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
          <div className="flex flex-1 flex-col">{children}</div>
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
