/**
 * CV-only details that the website does not show: labels for the PDF,
 * personal details, and the longer descriptions used in the CV.
 * German and English must keep the same shape.
 */

export type Locale = "de" | "en";

export type CvExtras = {
  labels: {
    cv: string;
    cvTitle: string;
    profile: string;
    experience: string;
    experienceContinued: string;
    skills: string;
    yearsHint: string;
    years: (n: number) => string;
    certificates: string;
    personal: string;
    projects: string;
    methods: string;
    stack: string;
    present: string;
    page: string;
    asOf: string;
  };
  personal: { label: string; value: string }[];
  /** Extra bullet points per role, keyed by "<career slug>:<role from>". */
  extraPoints: Record<string, { at: number; text: string }[]>;
  projectOverrides: Record<
    string,
    { title?: string; summary?: string; tags?: string[] }
  >;
};

const asOf = (locale: Locale) =>
  new Intl.DateTimeFormat(locale === "de" ? "de-DE" : "en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date());

export const cvExtras: Record<Locale, CvExtras> = {
  de: {
    labels: {
      cv: "Lebenslauf",
      cvTitle: "Lebenslauf",
      profile: "Profil",
      experience: "Werdegang",
      experienceContinued: "Werdegang – Fortsetzung",
      skills: "Fähigkeiten",
      yearsHint: "Erfahrung in Jahren",
      years: (n) => `${n} J.`,
      certificates: "Zertifikate",
      personal: "Persönliches",
      projects: "Projekte",
      methods: "Produkt & Methoden",
      stack: "Umfeld",
      present: "heute",
      page: "Seite",
      asOf: `Stand: ${asOf("de")}`,
    },
    personal: [
      { label: "Geburtsdatum", value: "27.09.2001" },
      { label: "Wohnort", value: "Raum Bremen" },
    ],
    extraPoints: {
      "itsc:2026-04": [
        {
          at: 2,
          text: "Architektur-Leitplanken: Multi-Agenten-Architektur, MCP-basiertes Tool-Calling statt klassischem RAG, EU-Datenresidenz und DSGVO-Konformität",
        },
      ],
    },
    projectOverrides: {
      elia: {
        title: "ELIA – Multi-Agenten-KI-Assistent",
        summary:
          "Interner KI-Assistent einer IT-Dienstleisterin für Krankenkassen: Multi-Agenten-Architektur mit MCP-basiertem Tool-Calling statt klassischem RAG – Live-Daten statt Vektor-Index. Feature-geflaggte Orchestrator-Migration auf ein aktuelles Agent-Framework im Parallelbetrieb. EU-Datenresidenz und DSGVO als bewusste Plattform-Entscheidung; angebunden an ITSM-System, Wiki und Microsoft Teams.",
        tags: ["Multi-Agenten-Architektur", "MCP", "OpenShift / Kubernetes", "MS Teams", "DSGVO"],
      },
    },
  },
  en: {
    labels: {
      cv: "Curriculum Vitae",
      cvTitle: "CV",
      profile: "Profile",
      experience: "Experience",
      experienceContinued: "Experience – continued",
      skills: "Skills",
      yearsHint: "Experience in years",
      years: (n) => `${n} ${n === 1 ? "yr" : "yrs"}`,
      certificates: "Certificates",
      personal: "Personal details",
      projects: "Projects",
      methods: "Product & methods",
      stack: "Stack",
      present: "present",
      page: "Page",
      asOf: `As of ${asOf("en")}`,
    },
    personal: [
      { label: "Date of birth", value: "27 September 2001" },
      { label: "Based in", value: "Bremen area, Germany" },
    ],
    extraPoints: {
      "itsc:2026-04": [
        {
          at: 2,
          text: "Architecture guardrails: multi-agent architecture, MCP-based tool calling instead of classic RAG, EU data residency and GDPR compliance",
        },
      ],
    },
    projectOverrides: {
      elia: {
        title: "ELIA – multi-agent AI assistant",
        summary:
          "Internal AI assistant of an IT service provider for health insurers: multi-agent architecture with MCP-based tool calling instead of classic RAG – live data instead of a vector index. Feature-flagged orchestrator migration to a current agent framework, run in parallel. EU data residency and GDPR as a deliberate platform decision; connected to the ITSM system, wiki and Microsoft Teams.",
        tags: ["Multi-agent architecture", "MCP", "OpenShift / Kubernetes", "MS Teams", "GDPR"],
      },
    },
  },
};
