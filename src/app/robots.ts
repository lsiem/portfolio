import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://lsiem.de/sitemap.xml",
    host: "https://lsiem.de",
  };
}
