import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getContact } from "@/lib/content";
import { routing } from "@/i18n/routing";

// Image metadata — file convention auto-emits og:image/twitter:image tags.
export const alt = "Lasse Siemoneit — Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Prerender both locales at build — no request-time API, no third-party fetch. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Card tokens mirror src/app/globals.css light theme (:root) — ImageResponse
// (Satori) cannot read CSS custom properties, so the values are duplicated
// here as static hex literals rather than through the design-token layer.
const BACKGROUND = "#fafaf9";
const FOREGROUND = "#1c1917";
const MUTED = "#6b6560";
const ACCENT = "#c2410c";

type Props = { params: Promise<{ locale: string }> };

export default async function Image({ params }: Props) {
  const { locale } = await params;
  const contact = getContact(locale);

  const [geistSemiBold, geistMono] = await Promise.all([
    readFile(
      join(
        process.cwd(),
        "node_modules/geist/dist/fonts/geist-sans/Geist-SemiBold.ttf",
      ),
    ),
    readFile(
      join(
        process.cwd(),
        "node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.ttf",
      ),
    ),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BACKGROUND,
          padding: "80px",
        }}
      >
        <p
          style={{
            fontFamily: "GeistMono",
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: MUTED,
            margin: 0,
          }}
        >
          Portfolio
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              fontFamily: "Geist",
              fontWeight: 600,
              fontSize: 96,
              color: FOREGROUND,
              margin: 0,
              lineHeight: 1.05,
            }}
          >
            {contact.name}
          </p>
          <p
            style={{
              fontFamily: "GeistMono",
              fontSize: 32,
              color: MUTED,
              margin: 0,
            }}
          >
            {contact.role}
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div style={{ width: 64, height: 4, background: ACCENT }} />
          <p
            style={{
              fontFamily: "GeistMono",
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: 4,
              color: MUTED,
              margin: 0,
            }}
          >
            {locale}
          </p>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistSemiBold, weight: 600, style: "normal" },
        { name: "GeistMono", data: geistMono, weight: 400, style: "normal" },
      ],
    },
  );
}
