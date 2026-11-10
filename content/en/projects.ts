import type { Project } from "../shared/types";

/** Projects (EN), in display order. Kept in step with content/de/projects.ts. */
export const projects = [
  {
    slug: "elia",
    title: "ELIA – multi-agent AI assistant",
    context: "ITSC GmbH · Product Owner",
    summary:
      "Internal AI assistant of an IT service provider for health insurers: a multi-agent architecture with MCP-based tool calling instead of classic RAG – live data rather than a vector index. Feature-flagged orchestrator migration to a current agent framework, run in parallel. EU data residency and GDPR as a deliberate platform decision; connected to the ITSM system, wiki and Microsoft Teams.",
    tags: [
      "Multi-agent architecture",
      "MCP",
      "OpenShift / Kubernetes",
      "MS Teams",
      "GDPR",
    ],
    size: "flagship",
    caseStudy: "elia",
  },
  {
    slug: "vidama-mediathek",
    title: "Sales-partner media library for EWE & osnatel",
    context: "Vidama GmbH · Sole developer",
    summary:
      "Enterprise media library: manage campaign films and assign them selectively, play them in the shop and create your own content from templates – with an end-to-end role model.",
    tags: ["Java", "Spring Boot", "Vaadin", "PostgreSQL", "Docker"],
    url: "https://bpp.ewe.de/login",
    size: "feature",
    caseStudy: "vidama-mediathek",
  },
  {
    slug: "disy-one",
    title: "Disy-One – digital signage platform",
    context: "Vidama GmbH",
    summary:
      "Configurable media playback on steles, TVs and perimeter boards for EWE/osnatel, Olantis, Famila and insurers. A scalable Python platform with monitoring.",
    tags: ["Python", "Flask", "FastAPI", "Docker", "Prometheus / Grafana"],
    url: "https://vidama.de",
    size: "feature",
  },
  {
    slug: "sport-event-controller",
    title: "Sport Event Controller",
    context: "For VfL Oldenburg Handball & Buxtehuder SV",
    summary:
      "Real-time control of media playback at sports events – walk-out show, sponsor content and live orchestration over WebSocket with a simple operator interface.",
    tags: ["Python", "Flask", "FastAPI", "WebSocket", "Docker"],
    size: "feature",
  },
  {
    slug: "immobilienbaukasten",
    title: "Real-estate site builder",
    context: "For Schlüssel Gruppe GmbH",
    summary:
      "Web application for creating one-page websites for real-estate projects from templates – no programming skills required.",
    tags: ["Java", "Spring Boot", "Thymeleaf", "PostgreSQL", "Docker"],
    url: "https://www.schluessel-gruppe.de/",
    size: "feature",
  },
  {
    slug: "ferrero-foto-aktion",
    title: "Ferrero photo campaign",
    context: "Marketing campaign",
    summary:
      "Automated photo upload, website generation and QR-code printing – more than 1,200 participants in major German cities.",
    tags: [],
    size: "compact",
  },
  {
    slug: "kundenportal-imke-folkerts",
    title: "Client portal Imke Folkerts",
    context: "Photographer · Web portal",
    summary:
      "Customer data management and digital registration for a photo studio.",
    tags: [],
    size: "compact",
  },
  {
    slug: "website-jr-purtec",
    title: "Website JR PurTec",
    context: "Web development",
    summary:
      "Modern, user-friendly company website in the field of polyurethane technology.",
    tags: [],
    size: "compact",
  },
] satisfies Project[];
