import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";

const caseStudies = defineCollection({
  name: "caseStudies",
  directory: "content",
  include: "*/case-studies/*.mdx", // matches de/... and en/...
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    period: z.string(),
    stack: z.array(z.string()),
    depth: z.enum(["flagship", "deep"]), // D-01 weighting
    order: z.number(),
  }),
  transform: async (doc, ctx) => {
    const mdx = await compileMDX(ctx, doc);
    const [locale] = doc._meta.path.split("/"); // 'de' | 'en'
    const slug = doc._meta.fileName.replace(/\.mdx$/, "");
    // Spreading doc retains the raw MDX text (doc.content) — Phase 2's CV-PDF
    // and v2's AI chat need prose text, not just compiled MDX (CONT-01).
    return { ...doc, mdx, locale, slug };
  },
});

export default defineConfig({ collections: [caseStudies] });
