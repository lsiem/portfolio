import type { Project } from "../shared/types";

/**
 * Projects (EN) — English adaptation of the final German copy (D-05), in
 * lock-step with content/de/projects.ts (I18N-02).
 *
 * D-01 weighting: ELIA (flagship) → Vidama media library (deep case study) →
 * OpenShift platform (card), plus selected older projects as cards. D-03: the
 * ELIA entry uses abstracted whitelist vocabulary only — no internal system
 * names, roadmap dates or model names (public repo). Prose/case studies land
 * in plan 01-04.
 */
export const projects = [
  {
    slug: "elia",
    title: "ELIA — multi-agent AI assistant",
    summary:
      "Internal AI assistant for an IT service provider serving health insurers: a multi-agent architecture with MCP-based tool calling instead of classic RAG (live data rather than a vector index) and a feature-flagged orchestrator migration to a current agent framework. EU data residency and GDPR as a deliberate platform decision, connected to the ITSM system, wiki and Teams.",
    tags: [
      "Multi-agent architecture",
      "MCP",
      "Agent framework",
      "EU data residency",
      "GDPR",
      "Teams integration",
    ],
    depth: "flagship",
    order: 1,
  },
  {
    slug: "vidama-mediathek",
    title: "Sales Partner Media Library for EWE & osnatel",
    summary:
      "Enterprise media library for sales partners: manage campaign films, assign them regionally and play them in the shop — with template-based content creation and an end-to-end role model.",
    tags: ["Java", "Spring Boot", "Vaadin", "PostgreSQL", "Docker", "CI/CD"],
    url: "https://bpp.ewe.de/login",
    period: "12/2021 – 01/2024",
    depth: "deep",
    order: 2,
  },
  {
    slug: "openshift-platform",
    title: "OpenShift platform operations for public health insurers",
    summary:
      "Operating and optimizing a container platform for public health insurers: OpenShift/Kubernetes clusters, Linux servers and microservices in cluster mode — the technical foundation the later product work builds on.",
    tags: ["OpenShift", "Kubernetes", "Linux", "Docker", "Microservices"],
    period: "since 06/2024",
    depth: "card",
    order: 3,
  },
  {
    slug: "disy-one",
    title: "Disy-One — digital signage platform",
    summary:
      "Media management platform for enterprises: configurable playback on steles, TVs and perimeter boards for EWE, Olantis, Famila and insurers. A scalable Python platform with monitoring and containerized deployment.",
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
      "Real-time control of media playback at sports events — team walk-outs, sponsor content and live orchestration for Handball Bundesliga clubs, driven over WebSocket with a simple operator interface.",
    tags: ["Python", "Flask", "WebSocket", "Docker", "FastAPI"],
    url: "https://www.handball-bundesliga-frauen.de/",
    period: "12/2021 – 01/2024",
    depth: "card",
    order: 5,
  },
  {
    slug: "immobilienbaukasten",
    title: "Real-estate site builder",
    summary:
      "One-page generator for real-estate projects: build landing pages from templates — no coding required. A template-based builder with dynamic content management.",
    tags: ["Java", "Spring Boot", "Thymeleaf", "PostgreSQL", "Docker"],
    url: "https://www.schluessel-gruppe.de/",
    period: "12/2021 – 01/2024",
    depth: "card",
    order: 6,
  },
] satisfies Project[];
