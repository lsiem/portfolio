import type { CareerEntry } from "../shared/types";

/** Career (EN). Source: CV as of 11/2026, kept in step with content/de/career.ts. */

export const careerIntro =
  "Self-taught software engineer with more than five years of experience along the whole chain: as a full-stack developer and CTO I took custom software from idea to production, as a systems administrator I ran container platforms for public health insurers – today I am a product owner for AI agents. I make architecture decisions from operational reality: what can actually be run, does it keep the privacy promise, and where is complexity worth it?";

export const career = [
  {
    slug: "itsc",
    org: "ITSC GmbH",
    orgUrl: "https://www.itsc.de",
    location: "Hanover · Remote",
    from: "2024-06",
    to: null,
    roles: [
      {
        title: "Product Owner Agent Services",
        from: "2026-04",
        to: null,
        points: [
          "End-to-end product ownership for the internal AI assistant ELIA and AI agents that relieve teams of ticket handling, knowledge research and routine tasks",
          "Roadmap, release planning and acceptance criteria; prioritizing requirements from support, operations and business units",
          "Enablement through roadshows, trainings and best practices; coordination of security and data protection",
        ],
        stack: [
          "AI agents",
          "MCP",
          "RPA",
          "Low-/no-code",
          "Azure DevOps",
          "MS Teams",
          "Confluence",
        ],
      },
      {
        title: "Systems Administrator & Software Engineer",
        from: "2024-06",
        to: "2026-04",
        points: [
          "Operating and optimizing the container platform of public health insurers: OpenShift/Kubernetes clusters, Linux servers, networks and microservices",
          "Transition into software engineering: building internal applications and integrations on the existing cluster infrastructure",
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
        "Mr. Siemoneit’s performance has always met with our full and unreserved recognition.",
      source: "Interim reference, VALUNY GmbH (translated from German)",
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
          "Customizing the Pisa Sales CRM for individual client requirements",
          "Initiated and implemented an AI integration to raise CRM efficiency – the basis for further product integrations",
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
          "As the sole developer, responsible for all custom software development – planning, architecture, implementation, operations and maintenance",
          "Enterprise solutions for EWE and osnatel (sales-partner media library), digital signage (Disy-One) and live media control for Handball Bundesliga clubs",
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
    location: "Self-employed · Remote",
    from: "2021-04",
    to: null,
    roles: [
      {
        title: "Owner / Freelance Software Engineer",
        from: "2021-04",
        to: null,
        points: [
          "Building tailored software solutions (full-stack, cloud) and advising on digital transformation and process optimization",
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
          "Digitalization consulting and presentations on Microsoft 365 and Teams at a Microsoft partner",
          "Building client-specific software with Azure interfaces",
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
