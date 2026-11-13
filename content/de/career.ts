import type { CareerEntry } from "../shared/types";

/** Werdegang (DE). Quelle: Lebenslauf, Stand 11/2026. */

export const careerIntro =
  "Autodidaktischer Software Engineer mit über fünf Jahren Erfahrung entlang der gesamten Kette: als Full-Stack-Entwickler und CTO individuelle Software von der Idee bis in den Betrieb gebracht, als Systemadministrator Container-Plattformen für öffentliche Krankenkassen betrieben – heute Product Owner für KI-Agenten. Architekturentscheidungen treffe ich aus der Betriebsrealität heraus: Was lässt sich betreiben, hält das Datenschutzversprechen, wo lohnt sich Komplexität?";

export const career = [
  {
    slug: "itsc",
    org: "ITSC GmbH",
    orgUrl: "https://www.itsc.de",
    location: "Hannover · Remote",
    from: "2024-06",
    to: null,
    roles: [
      {
        title: "Product Owner Agent Services",
        from: "2026-04",
        to: null,
        points: [
          "End-to-End-Produktverantwortung für den internen KI-Assistenten ELIA und KI-Agenten, die Teams bei Ticketbearbeitung, Wissensrecherche und Routineaufgaben entlasten",
          "Roadmap, Release-Planung und Akzeptanzkriterien; Priorisierung der Anforderungen aus Support, Betrieb und Fachbereichen",
          "Enablement über Roadshows, Trainings und Best Practices; Koordination von Security und Datenschutz",
        ],
        stack: [
          "AI-Agents",
          "MCP",
          "RPA",
          "Low-/No-Code",
          "Azure DevOps",
          "MS Teams",
          "Confluence",
        ],
      },
      {
        title: "Systemadministrator & Software Engineer",
        from: "2024-06",
        to: "2026-04",
        points: [
          "Betrieb und Optimierung der Container-Plattform öffentlicher Krankenkassen: OpenShift-/Kubernetes-Cluster, Linux-Server, Netzwerke und Microservices",
          "Übergang in die Softwareentwicklung: Aufbau interner Anwendungen und Integrationen auf der bestehenden Cluster-Infrastruktur",
        ],
        stack: [
          "OpenShift",
          "Kubernetes",
          "Podman/Docker",
          "Linux",
          "Ansible",
          "Bash",
        ],
      },
    ],
    reference: {
      quote:
        "Die Leistungen von Herrn Siemoneit finden stets uneingeschränkt unsere volle Anerkennung.",
      source: "Zwischenzeugnis, VALUNY GmbH",
      date: "2026-09",
    },
  },
  {
    slug: "just-relate",
    org: "JustRelate Group GmbH",
    orgUrl: "https://www.justrelate.de",
    location: "Berlin · Remote",
    from: "2024-01",
    to: "2024-06",
    roles: [
      {
        title: "Software Engineer",
        from: "2024-01",
        to: "2024-06",
        points: [
          "Customizing des Pisa-Sales-CRM für individuelle Kundenanforderungen",
          "Initiierung und Umsetzung einer KI-Integration zur Steigerung der CRM-Effizienz – Grundlage für weitere Produktanbindungen",
        ],
        stack: ["Java", "Spring Boot", "REST APIs", "SQL"],
      },
    ],
  },
  {
    slug: "vidama",
    org: "Vidama GmbH",
    orgUrl: "https://www.vidama.de",
    location: "Oldenburg",
    from: "2021-12",
    to: "2024-01",
    roles: [
      {
        title: "Chief Technology Officer",
        from: "2021-12",
        to: "2024-01",
        points: [
          "Als einziger Entwickler verantwortlich für die gesamte individuelle Softwareentwicklung – Planung, Architektur, Umsetzung, Betrieb und Wartung",
          "Enterprise-Lösungen für EWE und osnatel (Vertriebspartner-Mediathek), Digital Signage (Disy-One) und Live-Mediensteuerung für Handball-Bundesligisten",
        ],
        stack: [
          "Java",
          "Spring Boot",
          "Vaadin",
          "Python (Flask, FastAPI)",
          "PostgreSQL",
          "Docker",
          "CI/CD",
        ],
      },
    ],
  },
  {
    slug: "freelance",
    org: "lsiem – Lasse Siemoneit",
    location: "Selbstständig · Remote",
    from: "2021-04",
    to: null,
    roles: [
      {
        title: "Inhaber / Freelance Software Engineer",
        from: "2021-04",
        to: null,
        points: [
          "Entwicklung maßgeschneiderter Softwarelösungen (Full-Stack, Cloud) und Beratung zur digitalen Transformation und Prozessoptimierung",
        ],
        stack: ["Java", "Python", "TypeScript", "Azure", "Linux", "Azure DevOps"],
      },
    ],
  },
  {
    slug: "heinsohn",
    org: "Heinsohn IT Solutions GmbH",
    orgUrl: "https://www.heinsohn-it.com/",
    location: "Westerstede · Remote",
    from: "2021-05",
    to: "2021-12",
    roles: [
      {
        title: "Consultant / Software Engineer",
        from: "2021-05",
        to: "2021-12",
        points: [
          "Digitalisierungsberatung und Präsentationen zu Microsoft 365 und Teams bei einem Microsoft-Partner",
          "Entwicklung kundenspezifischer Software mit Azure-Schnittstellen",
        ],
        stack: [
          "Java",
          "Microsoft Azure",
          "Microsoft 365",
          "Azure DevOps",
          "Windows Server",
        ],
      },
    ],
  },
] satisfies CareerEntry[];
