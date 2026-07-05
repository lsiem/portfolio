import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getCaseStudies, getCaseStudy, getContact } from "@/lib/content";
import { routing } from "@/i18n/routing";

// Image metadata — file convention auto-emits og:image/twitter:image tags.
export const alt = "Lasse Siemoneit — Case Study";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Prerender every locale x slug combination at build (mirrors this
 * segment's page.tsx generateStaticParams) — no request-time API, no
 * third-party fetch.
 */
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getCaseStudies(locale).map((caseStudy) => ({
      locale,
      slug: caseStudy.slug,
    })),
  );
}

// Card tokens mirror src/app/globals.css light theme (:root) — ImageResponse
// (Satori) cannot read CSS custom properties, so the values are duplicated
// here as static hex literals rather than through the design-token layer.
const BACKGROUND = "#fafaf9";
const FOREGROUND = "#1c1917";
const MUTED = "#6b6560";
const ACCENT = "#c2410c";

/** Cap card copy length so long summaries never crowd the fixed 630px canvas. */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export default async function Image({ params }: Props) {
  const { locale, slug } = await params;
  const caseStudy = getCaseStudy(locale, slug);
  const contact = getContact(locale);

  // Fall back to the overview composition (name/role) if the slug is
  // unknown — never render a broken/empty card.
  const eyebrow = caseStudy ? "Case Study" : "Portfolio";
  const title = truncate(caseStudy ? caseStudy.title : contact.name, 70);
  const subtitle = truncate(
    caseStudy ? caseStudy.summary : contact.role,
    160,
  );

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
          {eyebrow}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <p
            style={{
              fontFamily: "Geist",
              fontWeight: 600,
              fontSize: 72,
              color: FOREGROUND,
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {title}
          </p>
          <p
            style={{
              fontFamily: "GeistMono",
              fontSize: 28,
              color: MUTED,
              margin: 0,
            }}
          >
            {subtitle}
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
