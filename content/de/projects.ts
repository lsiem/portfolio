import type { Project } from "../shared/types";

/** Projekte (DE), in Anzeigereihenfolge. Quelle: Lebenslauf, Stand 11/2026. */
export const projects = [
  {
    slug: "elia",
    title: "ELIA – interner KI-Assistent",
    context: "ITSC GmbH · Product Owner",
    summary:
      "Produktverantwortung für den internen KI-Assistenten einer IT-Dienstleisterin für Krankenkassen: Anforderungen mit den Fachbereichen klären, Backlog und Prioritäten steuern und das Team von der Idee bis in den Betrieb begleiten.",
    tags: ["Product Ownership", "KI-Agenten"],
    size: "flagship",
  },
  {
    slug: "vidama-mediathek",
    title: "Vertriebspartner-Mediathek für EWE & osnatel",
    context: "Vidama GmbH · Alleinentwickler",
    summary:
      "Enterprise-Mediathek: Kampagnenfilme verwalten und gezielt zuweisen, im Shop wiedergeben und eigene Inhalte aus Templates erstellen – mit durchgängigem Rollenmodell.",
    tags: ["Java", "Spring Boot", "Vaadin", "PostgreSQL", "Docker"],
    url: "https://bpp.ewe.de/login",
    size: "feature",
    caseStudy: "vidama-mediathek",
  },
  {
    slug: "disy-one",
    title: "Disy-One – Digital-Signage-Plattform",
    context: "Vidama GmbH",
    summary:
      "Konfigurierbares Abspielen von Medien auf Stelen, TVs und Banden für EWE/osnatel, Olantis, Famila und Versicherungen. Skalierbare Python-Plattform mit Monitoring.",
    tags: ["Python", "Flask", "FastAPI", "Docker", "Prometheus / Grafana"],
    url: "https://vidama.de",
    size: "feature",
  },
  {
    slug: "sport-event-controller",
    title: "Sport Event Controller",
    context: "Für VfL Oldenburg Handball & Buxtehuder SV",
    summary:
      "Echtzeit-Steuerung der Medienwiedergabe bei Sport-Events – Einlaufshow, Sponsoreninhalte und Live-Orchestrierung über WebSocket mit einfachem Bedieninterface.",
    tags: ["Python", "Flask", "FastAPI", "WebSocket", "Docker"],
    size: "feature",
  },
  {
    slug: "immobilienbaukasten",
    title: "Immobilienbaukasten",
    context: "Für die Schlüssel Gruppe GmbH",
    summary:
      "Webanwendung zum Erstellen von One-Page-Webseiten für Immobilienprojekte aus Vorlagen – ohne Programmierkenntnisse.",
    tags: ["Java", "Spring Boot", "Thymeleaf", "PostgreSQL", "Docker"],
    url: "https://www.schluessel-gruppe.de/",
    size: "feature",
  },
  {
    slug: "ferrero-foto-aktion",
    title: "Ferrero Foto-Aktion",
    context: "Marketingkampagne",
    summary:
      "Automatisierter Foto-Upload, Website-Erstellung und QR-Code-Druck – über 1.200 Teilnehmer in deutschen Großstädten.",
    tags: [],
    size: "compact",
  },
  {
    slug: "kundenportal-imke-folkerts",
    title: "Kundenportal Imke Folkerts",
    context: "Fotografin · Webportal",
    summary:
      "Verwaltung von Kundendaten und digitale Registrierung für ein Fotostudio.",
    tags: [],
    size: "compact",
  },
  {
    slug: "website-jr-purtec",
    title: "Website JR PurTec",
    context: "Webentwicklung",
    summary:
      "Moderne, benutzerfreundliche Unternehmenswebsite im Bereich Polyurethan-Technologie.",
    tags: [],
    size: "compact",
  },
] satisfies Project[];
