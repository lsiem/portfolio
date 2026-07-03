import type { CareerEntry } from "../shared/types";

/**
 * Werdegang (DE) — strukturierte Timeline gegen den geteilten Vertrag
 * (content/shared/types.ts). Der TypeScript-Compiler erzwingt über das
 * `satisfies`-Idiom, dass DE und EN dieselbe Struktur haben (I18N-02, D-06).
 *
 * D-02: Die ITSC-Station bildet die Rollenentwicklung Systemadministrator
 * (OpenShift) → Software Engineering → Product Owner eines internen
 * KI-Assistenten als `roles`-Array ab — der alte flache Eintrag war veraltet.
 * D-03: Interne Systemnamen, Roadmap-Daten und Modellnamen bleiben abstrahiert
 * (öffentliches Repo).
 */

export const careerIntro =
  "Mit 16 begann mein Weg als Consultant in einem Start-up. Seit über fünf Jahren arbeite ich als Full-Stack-Entwickler und im Betrieb digitaler Infrastrukturen — vom ersten Entwurf über die Umsetzung bis zum Betrieb. Mein Schwerpunkt liegt in der Planung und Realisierung von Softwareprojekten und Container-Plattformen.";

export const career = [
  {
    slug: "itsc",
    org: "ITSC GmbH",
    orgUrl: "https://www.itsc.de",
    location: "Hannover, Remote",
    from: "2024-06",
    to: null,
    intro:
      "IT-Dienstleisterin für öffentliche Krankenkassen. Innerhalb der ITSC hat sich meine Rolle vom Plattformbetrieb über die Softwareentwicklung bis zur Produktverantwortung für einen internen KI-Assistenten entwickelt.",
    roles: [
      {
        title: "Systemadministrator",
        from: "2024-06",
        to: null,
        description:
          "Betrieb und Optimierung der Container-Plattform öffentlicher Krankenkassen: OpenShift-/Kubernetes-Cluster, Linux-Server, Netzwerke und Microservices im Clusterbetrieb.",
      },
      {
        title: "Software Engineering",
        from: null,
        to: null,
        description:
          "Übergang vom Plattformbetrieb in die Softwareentwicklung — Aufbau interner Anwendungen und Integrationen auf Basis der bestehenden Cluster-Infrastruktur.",
      },
      {
        title: "Product Owner eines internen KI-Assistenten",
        from: "2026-04",
        to: null,
        description:
          "Produktverantwortung für einen internen KI-Assistenten: Multi-Agenten-Architektur, MCP-basiertes Tool-Calling statt klassischem RAG, EU-Datenresidenz und DSGVO-Konformität sowie Teams-Integration. Priorisierung, Architektur-Entscheidungen und Tradeoffs aus Produktsicht.",
      },
    ],
    techStack: [
      "OpenShift",
      "Kubernetes",
      "Linux",
      "Docker",
      "Microservices",
      "Multi-Agenten-Architektur",
      "MCP",
    ],
  },
  {
    slug: "just-relate",
    org: "Just Relate Group GmbH",
    orgUrl: "https://www.justrelate.de",
    location: "Berlin, Remote",
    from: "2024-01",
    to: null,
    roles: [
      {
        title: "Software Engineer",
        from: "2024-01",
        to: null,
        description:
          "Customizing des Pisa-Sales-CRM für individuelle Kundenanforderungen. Initiierung und Umsetzung einer KI-Integration zur Steigerung der CRM-Effizienz und als Grundlage für zukünftige Produktanbindungen.",
      },
    ],
    techStack: ["Java", "Spring Boot", "CRM", "KI-Integration", "REST APIs"],
  },
  {
    slug: "vidama",
    org: "Vidama GmbH",
    orgUrl: "https://www.vidama.de",
    location: "Oldenburg, Remote",
    from: "2021-12",
    to: "2024-01",
    roles: [
      {
        title: "Chief Technology Officer",
        from: "2021-12",
        to: "2024-01",
        description:
          "Als einziger Entwickler verantwortlich für die gesamte individuelle Softwareentwicklung — von der Planung über die Umsetzung bis zur Wartung komplexer Kundenlösungen wie der Vertriebspartner-Mediathek für EWE und osnatel.",
      },
    ],
    techStack: ["Python", "Flask", "FastAPI", "Java", "Docker", "CI/CD"],
  },
  {
    slug: "freelance",
    org: "Lasse Siemoneit",
    orgUrl: "https://lsiem.de",
    location: "Hatten, Remote",
    from: "2021-04",
    to: null,
    roles: [
      {
        title: "Inhaber / Freelance Software Engineer",
        from: "2021-04",
        to: null,
        description:
          "Entwicklung maßgeschneiderter Softwarelösungen und Beratung zur digitalen Transformation. Strategischer Einsatz digitaler Technologien zur Prozessoptimierung und langfristigen Wettbewerbsfähigkeit.",
      },
    ],
    techStack: ["Full-Stack", "Java", "Python", "Cloud", "Beratung"],
  },
  {
    slug: "heinsohn",
    org: "Heinsohn IT Solutions GmbH",
    orgUrl: "https://www.heinsohn-it.com/",
    location: "Westerstede, Remote",
    from: "2021-05",
    to: "2021-12",
    roles: [
      {
        title: "Consultant / Software Engineer",
        from: "2021-05",
        to: "2021-12",
        description:
          "Als Microsoft-Partnerunternehmen bei der Digitalisierung mit Microsoft 365 beraten. Präsentationen zu Teams und M365-Produkten sowie Entwicklung kundenspezifischer Software mit Azure-Schnittstellen.",
      },
    ],
    techStack: ["Microsoft 365", "Azure", "Teams", "Consulting"],
  },
] satisfies CareerEntry[];
