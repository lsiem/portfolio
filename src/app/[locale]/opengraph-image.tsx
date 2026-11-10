import { ImageResponse } from "next/og";
import { routing } from "@/i18n/routing";
import { getContent } from "@/lib/content";

export const alt = "Lasse Siemoneit – Product Owner & Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { contact } = getContent(locale);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#07090b",
          backgroundImage:
            "radial-gradient(ellipse at 80% 0%, rgba(53,214,198,0.22), transparent 60%)",
          color: "#e7eef1",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#35d6c6" }}>~/lsiem</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 700, letterSpacing: -4 }}>
            {contact.name}
          </div>
          <div style={{ display: "flex", marginTop: 16, fontSize: 36, color: "#35d6c6" }}>
            {contact.role}
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: "#8b9ba4" }}>
          {contact.location} · lsiem.de
        </div>
      </div>
    ),
    size,
  );
}
