import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

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

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <NextIntlClientProvider>
          <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="font-mono text-sm font-semibold tracking-tight transition-opacity hover:opacity-70"
              >
                LS<span className="text-accent">.</span>
              </Link>
              <LocaleSwitcher />
            </div>
          </header>
          <div className="flex flex-1 flex-col">{children}</div>
          <footer className="border-t border-border/60">
            <div className="mx-auto w-full max-w-3xl px-6 py-8 font-mono text-xs text-muted">
              © {new Date().getFullYear()} Lasse Siemoneit
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
