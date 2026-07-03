import type { CareerEntry } from "../shared/types";

/**
 * Career (EN) — English adaptation of the final German text (D-05), written
 * for international tech leads rather than translated literally, and kept in
 * lock-step with content/de/career.ts (I18N-02). Same structure, satisfies
 * the shared contract so tsc is the parity check.
 *
 * D-02: the ITSC station models the role progression Systems Administrator
 * (OpenShift) → Software Engineering → Product Owner of an internal AI
 * assistant. D-03: internal system names, roadmap dates and model names stay
 * abstracted (public repo).
 */

export const careerIntro =
  "My path started at 16 as a consultant in a start-up. For over five years I have worked as a full-stack developer and in the operation of digital infrastructure — from the first draft through implementation to running it in production. My focus is planning and delivering software projects and container platforms.";

export const career = [
  {
    slug: "itsc",
    org: "ITSC GmbH",
    orgUrl: "https://www.itsc.de",
    location: "Hannover, Remote",
    from: "2024-06",
    to: null,
    intro:
      "IT service provider for public health insurers. Inside ITSC my role has grown from platform operations through software engineering to product ownership of an internal AI assistant.",
    roles: [
      {
        title: "Systems Administrator",
        from: "2024-06",
        to: null,
        description:
          "Operating and optimizing the container platform of public health insurers: OpenShift/Kubernetes clusters, Linux servers, networks and microservices running in cluster mode.",
      },
      {
        title: "Software Engineering",
        from: null,
        to: null,
        description:
          "Moving from platform operations into software engineering — building internal applications and integrations on top of the existing cluster infrastructure.",
      },
      {
        title: "Product Owner of an internal AI assistant",
        from: "2026-04",
        to: null,
        description:
          "Product ownership for an internal AI assistant: multi-agent architecture, MCP-based tool calling instead of classic RAG, EU data residency and GDPR compliance, plus Teams integration. Prioritization, architecture decisions and trade-offs from a product perspective.",
      },
    ],
    techStack: [
      "OpenShift",
      "Kubernetes",
      "Linux",
      "Docker",
      "Microservices",
      "Multi-agent architecture",
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
          "Customizing the Pisa Sales CRM for individual client requirements. Initiated and implemented an AI integration to raise CRM efficiency and lay the groundwork for future product connections.",
      },
    ],
    techStack: ["Java", "Spring Boot", "CRM", "AI integration", "REST APIs"],
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
          "As the sole developer, responsible for all custom software development — from planning through implementation to maintenance of complex client solutions such as the sales-partner media library for EWE and osnatel.",
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
        title: "Owner / Freelance Software Engineer",
        from: "2021-04",
        to: null,
        description:
          "Building tailored software solutions and advising on digital transformation. Strategic use of digital technology for process optimization and long-term competitiveness.",
      },
    ],
    techStack: ["Full-stack", "Java", "Python", "Cloud", "Consulting"],
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
          "Advised clients on digitalization with Microsoft 365 as a Microsoft partner company. Delivered presentations on Teams and M365 products and built client-specific software with Azure interfaces.",
      },
    ],
    techStack: ["Microsoft 365", "Azure", "Teams", "Consulting"],
  },
] satisfies CareerEntry[];
