import { join } from "node:path";
import { Document, Font, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CareerEntry, ContactInfo, Project, SkillDomain } from "../../content/shared/types";
import { labels, type CvLocale } from "./labels";

/**
 * CvDocument.tsx — react-pdf <Document> for the build-time CV (CONT-08 / CTX-05).
 *
 * One-column ATS-friendly layout (D-E). Content is passed in as props from
 * scripts/generate-cv.tsx (which imports the same content modules
 * src/lib/content.ts uses) so this component stays locale-agnostic and DRY
 * across both PDFs. Script-only — MUST NOT be imported under src/app/**.
 */

// --- Font registration (module scope, local ttf paths only — RESEARCH Pitfall 1) ---
const geistSansDir = join(process.cwd(), "node_modules/geist/dist/fonts/geist-sans");

Font.register({
  family: "Geist",
  fonts: [
    { src: join(geistSansDir, "Geist-Regular.ttf"), fontWeight: 400 },
    { src: join(geistSansDir, "Geist-Medium.ttf"), fontWeight: 500 },
    { src: join(geistSansDir, "Geist-SemiBold.ttf"), fontWeight: 600 },
  ],
});

// --- Palette (mirrors the site's light-theme tokens — monochrome ink + one accent hairline) ---
const INK = "#1c1917";
const MUTED = "#6b6560";
const BORDER = "#e7e5e4";
const ACCENT = "#c2410c";

const MM_TO_PT = 2.834_645_67;
const MARGIN = Math.round(20 * MM_TO_PT); // ~20mm per D-E

const styles = StyleSheet.create({
  page: {
    fontFamily: "Geist",
    fontSize: 10.5,
    lineHeight: 1.4,
    color: INK,
    paddingTop: MARGIN,
    paddingBottom: MARGIN,
    paddingHorizontal: MARGIN,
  },
  name: {
    fontSize: 23,
    fontWeight: 600,
    marginBottom: 2,
  },
  role: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 6,
  },
  valueProp: {
    fontSize: 10.5,
    color: INK,
    marginBottom: 10,
    maxWidth: "90%",
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 14,
    rowGap: 2,
    paddingBottom: 10,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: ACCENT,
  },
  contactItem: {
    fontSize: 9.5,
    color: MUTED,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: INK,
    marginTop: 14,
    marginBottom: 8,
  },
  careerEntry: {
    marginBottom: 10,
  },
  careerHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orgName: {
    fontSize: 12,
    fontWeight: 500,
  },
  dateRange: {
    fontSize: 9.5,
    color: MUTED,
  },
  location: {
    fontSize: 9.5,
    color: MUTED,
    marginBottom: 4,
  },
  roleItem: {
    marginTop: 4,
    marginLeft: 8,
  },
  roleTitle: {
    fontSize: 10.5,
    fontWeight: 500,
  },
  roleDates: {
    fontSize: 9,
    color: MUTED,
  },
  roleDescription: {
    fontSize: 9.5,
    color: MUTED,
    marginTop: 1,
  },
  projectItem: {
    marginBottom: 6,
  },
  projectTitle: {
    fontSize: 10.5,
    fontWeight: 500,
  },
  projectSummary: {
    fontSize: 9.5,
    color: MUTED,
  },
  skillDomain: {
    marginBottom: 6,
  },
  skillDomainName: {
    fontSize: 10.5,
    fontWeight: 500,
    marginBottom: 2,
  },
  skillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 6,
    rowGap: 2,
  },
  skillChip: {
    fontSize: 9,
    color: MUTED,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 2,
    paddingVertical: 1,
    paddingHorizontal: 4,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: MARGIN,
    right: MARGIN,
    fontSize: 8.5,
    color: MUTED,
    textAlign: "center",
  },
  link: {
    color: MUTED,
    textDecoration: "none",
  },
});

/** Format a "YYYY-MM" (or null) month string for the CV locale. Falls back to a "present" label. */
function formatMonth(value: string | null, presentLabel: string): string {
  if (!value) {
    return presentLabel;
  }
  const [year, month] = value.split("-");
  if (!year || !month) {
    return presentLabel;
  }
  return `${month}/${year}`;
}

function formatAsOfDate(date: Date, locale: CvLocale): string {
  return new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

const PRESENT_LABEL: Record<CvLocale, string> = {
  de: "heute",
  en: "present",
};

export type CvDocumentProps = Readonly<{
  locale: CvLocale;
  generatedAt: Date;
  contact: ContactInfo;
  career: readonly CareerEntry[];
  projects: readonly Project[];
  skillDomains: readonly SkillDomain[];
}>;

/** One-column ATS-friendly CV document (D-E), sourced from the shared content model. */
export function CvDocument({
  locale,
  generatedAt,
  contact,
  career,
  projects,
  skillDomains,
}: CvDocumentProps) {
  const t = labels[locale];
  const present = PRESENT_LABEL[locale];
  // 3-5 project one-liners, favoring flagship/deep over card (D-01 weighting).
  const depthOrder: Record<Project["depth"], number> = { flagship: 0, deep: 1, card: 2 };
  const selectedProjects = [...projects]
    .sort((a, b) => depthOrder[a.depth] - depthOrder[b.depth] || a.order - b.order)
    .slice(0, 5);

  return (
    <Document title={`${contact.name} — ${t.documentTitle}`} author={contact.name} language={locale}>
      <Page size="A4" style={styles.page}>
        {/* Name / role / value-prop (identical source to the hero — REVIEW finding 2) */}
        <Text style={styles.name}>{contact.name}</Text>
        <Text style={styles.role}>{contact.role}</Text>
        <Text style={styles.valueProp}>{contact.valueProp}</Text>

        {/* Contact facts — email/GitHub/LinkedIn only (schema data-minimization) */}
        <View style={styles.contactRow}>
          <Link src={`mailto:${contact.email}`} style={styles.link}>
            <Text style={styles.contactItem}>{contact.email}</Text>
          </Link>
          <Link src={contact.github} style={styles.link}>
            <Text style={styles.contactItem}>{contact.github.replace(/^https?:\/\//, "")}</Text>
          </Link>
          <Link src={contact.linkedin} style={styles.link}>
            <Text style={styles.contactItem}>{contact.linkedin.replace(/^https?:\/\//, "")}</Text>
          </Link>
        </View>

        {/* Career arc (D-02) */}
        <Text style={styles.sectionHeading}>{t.career}</Text>
        {career.map((entry) => (
          <View key={entry.slug} style={styles.careerEntry} wrap={false}>
            <View style={styles.careerHeaderRow}>
              <Text style={styles.orgName}>{entry.org}</Text>
              <Text style={styles.dateRange}>
                {formatMonth(entry.from, present)} – {formatMonth(entry.to, present)}
              </Text>
            </View>
            {entry.location ? <Text style={styles.location}>{entry.location}</Text> : null}
            {entry.roles.map((role, index) => (
              <View key={`${entry.slug}-${index}`} style={styles.roleItem}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDates}>
                  {formatMonth(role.from, present)} – {formatMonth(role.to, present)}
                </Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Selected projects (3-5 one-liners, flagship/deep favored) */}
        <Text style={styles.sectionHeading}>{t.projects}</Text>
        {selectedProjects.map((project) => (
          <View key={project.slug} style={styles.projectItem} wrap={false}>
            <Text style={styles.projectTitle}>{project.title}</Text>
            <Text style={styles.projectSummary}>{project.summary}</Text>
          </View>
        ))}

        {/* Domain-grouped skills — no levels/percent bars (CONT-05 anti-feature) */}
        <Text style={styles.sectionHeading}>{t.skills}</Text>
        {skillDomains.map((domain) => (
          <View key={domain.domain} style={styles.skillDomain} wrap={false}>
            <Text style={styles.skillDomainName}>{domain.domain}</Text>
            <View style={styles.skillRow}>
              {domain.skills.map((skill) => (
                <Text key={skill.name} style={styles.skillChip}>
                  {skill.years ? `${skill.name} (${skill.years})` : skill.name}
                </Text>
              ))}
            </View>
          </View>
        ))}

        {/* "As of" date footer — localized */}
        <Text style={styles.footer} fixed>
          {t.asOfPrefix} {formatAsOfDate(generatedAt, locale)}
        </Text>
      </Page>
    </Document>
  );
}
