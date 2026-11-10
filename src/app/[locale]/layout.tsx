import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CopyrightNotice } from "@/components/copyright-notice";
import { SiteHeader } from "@/components/site-header";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { siteMetadataBase } from "@/lib/seo";
import { THEME_COLORS } from "@/lib/theme";
import "../globals.css";

export const metadata: Metadata = { metadataBase: siteMetadataBase };

// Applies a stored theme choice before first paint and sets the browser
// chrome colour to match. The `theme-color` meta is created here instead of
// via the `viewport` export: React would re-insert its own tag next to one
// this script had changed. Static string, no user input, no external request.
const THEME_SCRIPT = `(function(){var t=null;try{t=localStorage.getItem('theme');}catch(e){}if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}var m=document.createElement('meta');m.name='theme-color';m.content=t==='light'?'${THEME_COLORS.light}':'${THEME_COLORS.dark}';document.head.appendChild(m);})();`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations("footer");
  const a11y = await getTranslations("accessibility");

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col font-sans">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <NextIntlClientProvider>
          <a
            href="#main-content"
            className="fixed left-4 top-4 z-50 -translate-y-24 rounded-md bg-accent px-4 py-2 font-mono text-sm text-accent-fg transition-transform focus:translate-y-0"
          >
            {a11y("skipToContent")}
          </a>
          <SiteHeader />
          <div className="flex flex-1 flex-col">{children}</div>
          <footer className="border-t border-border">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 font-mono text-xs text-faint sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <CopyrightNotice buildYear={new Date().getFullYear()} />
              <nav aria-label={t("legalLabel")}>
                <ul className="flex flex-wrap gap-x-5 gap-y-2">
                  {(["about", "impressum", "datenschutz"] as const).map((slug) => (
                    <li key={slug}>
                      <Link href={`/${slug}`} className="transition-colors hover:text-fg">
                        {t(slug)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </footer>
        </NextIntlClientProvider>
        {process.env.VERCEL === "1" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
