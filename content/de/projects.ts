import type { Project } from "../shared/types";

/**
 * Projekte (DE) — Metadaten gegen den geteilten Vertrag (content/shared/types.ts).
 *
 * D-01-Gewichtung: ELIA (Flaggschiff) → Vidama-Mediathek (tiefe Case Study) →
 * OpenShift-Plattform (Karte), plus ausgewählte ältere Projekte als Karten.
 * D-03: Der ELIA-Eintrag verwendet ausschließlich abstrahiertes Whitelist-
 * Vokabular — keine internen Systemnamen, Roadmap-Daten oder Modellnamen
 * (öffentliches Repo). Prosa/Case Studies folgen in Plan 01-04.
 */
export const projects = [
  {
    slug: "elia",
    title: "ELIA — Multi-Agenten-KI-Assistent",
    summary:
      "Interner KI-Assistent einer IT-Dienstleisterin für Krankenkassen: Multi-Agenten-Architektur mit MCP-basiertem Tool-Calling statt klassischem RAG (Live-Daten statt Vektor-Index) und einer feature-geflaggten Orchestrator-Migration auf ein aktuelles Agent-Framework. EU-Datenresidenz und DSGVO als bewusste Plattform-Entscheidung, angebunden an ITSM-System, Wiki und Teams.",
    tags: [
      "Multi-Agenten-Architektur",
      "MCP",
      "Agent-Framework",
      "EU-Datenresidenz",
      "DSGVO",
      "Teams-Integration",
    ],
    depth: "flagship",
    order: 1,
  },
  {
    slug: "vidama-mediathek",
    title: "Vertriebspartner-Mediathek für EWE & osnatel",
    summary:
      "Enterprise-Mediathek für Vertriebspartner: Kampagnenfilme verwalten, gezielt zuweisen und im Shop wiedergeben — mit Template-basierter Content-Erstellung und durchgängigem Rollenmodell.",
    tags: ["Java", "Spring Boot", "Vaadin", "PostgreSQL", "Docker", "CI/CD"],
    url: "https://bpp.ewe.de/login",
    period: "12/2021 – 01/2024",
    depth: "deep",
    order: 2,
  },
  {
    slug: "openshift-platform",
    title: "OpenShift-Plattformbetrieb für öffentliche Krankenkassen",
    summary:
      "Betrieb und Optimierung einer Container-Plattform für öffentliche Krankenkassen: OpenShift-/Kubernetes-Cluster, Linux-Server und Microservices im Clusterbetrieb — die technische Grundlage, auf der die spätere Produktarbeit aufsetzt.",
    tags: ["OpenShift", "Kubernetes", "Linux", "Docker", "Microservices"],
    period: "seit 06/2024",
    depth: "card",
    order: 3,
  },
  {
    slug: "disy-one",
    title: "Disy-One — Digital-Signage-Plattform",
    summary:
      "Medienverwaltungsplattform für Unternehmen: konfigurierbares Abspielen auf Stelen, TVs und Banden für EWE, Olantis, Famila und Versicherungen. Skalierbare Python-Plattform mit Monitoring und containerisierter Bereitstellung.",
    tags: ["Python", "Flask", "FastAPI", "Docker", "Grafana", "Prometheus"],
    url: "https://vidama.de",
    period: "12/2021 – 01/2024",
    depth: "card",
    order: 4,
  },
  {
    slug: "sport-event-controller",
    title: "Sport Event Controller",
    summary:
      "Echtzeit-Steuerung der Medienwiedergabe bei Sport-Events — Einlaufshow, Sponsoreninhalte und Live-Orchestrierung für Handball-Bundesliga-Vereine, gesteuert über WebSocket mit einem einfachen Bedieninterface.",
    tags: ["Python", "Flask", "WebSocket", "Docker", "FastAPI"],
    url: "https://www.handball-bundesliga-frauen.de/",
    period: "12/2021 – 01/2024",
    depth: "card",
    order: 5,
  },
  {
    slug: "immobilienbaukasten",
    title: "Immobilienbaukasten",
    summary:
      "One-Page-Generator für Immobilienprojekte: Landingpages aus Vorlagen erstellen — ohne Programmierkenntnisse. Template-basierter Baukasten mit dynamischer Inhaltspflege.",
    tags: ["Java", "Spring Boot", "Thymeleaf", "PostgreSQL", "Docker"],
    url: "https://www.schluessel-gruppe.de/",
    period: "12/2021 – 01/2024",
    depth: "card",
    order: 6,
  },
] satisfies Project[];
