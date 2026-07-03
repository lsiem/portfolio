import type { SkillDomain } from "../shared/types";

/**
 * Skills (EN) — English adaptation (D-05), in lock-step with
 * content/de/skills.ts. Grouped by domain, each skill carrying years
 * (estimated from the career timeline) and projectSlugs referencing real
 * project slugs from projects.ts. Deliberately NO percent/level bars
 * (CONT-05 anti-feature); no icon coupling (presentation, Pitfall 6).
 */
export const skillDomains = [
  {
    domain: "Web & Application Engineering",
    skills: [
      {
        name: "Java & Spring Boot",
        years: 5,
        projectSlugs: ["vidama-mediathek", "immobilienbaukasten"],
      },
      {
        name: "Python (Flask, FastAPI)",
        years: 4,
        projectSlugs: ["disy-one", "sport-event-controller"],
      },
      {
        name: "Vaadin",
        years: 4,
        projectSlugs: ["vidama-mediathek"],
      },
      {
        name: "TypeScript & JavaScript",
        years: 5,
      },
      {
        name: "REST APIs & WebSocket",
        years: 5,
        projectSlugs: ["sport-event-controller"],
      },
    ],
  },
  {
    domain: "Cloud & Container Platforms",
    skills: [
      {
        name: "OpenShift & Kubernetes",
        years: 2,
        projectSlugs: ["openshift-platform"],
      },
      {
        name: "Docker",
        years: 5,
        projectSlugs: ["disy-one", "vidama-mediathek"],
      },
      {
        name: "Linux server operations",
        years: 5,
        projectSlugs: ["openshift-platform"],
      },
      {
        name: "AWS & Azure",
        years: 4,
      },
    ],
  },
  {
    domain: "Databases",
    skills: [
      {
        name: "PostgreSQL & MySQL",
        years: 5,
        projectSlugs: ["vidama-mediathek", "immobilienbaukasten"],
      },
      {
        name: "MongoDB & Redis",
        years: 3,
      },
    ],
  },
  {
    domain: "DevOps & CI/CD",
    skills: [
      {
        name: "GitLab CI & Jenkins",
        years: 5,
        projectSlugs: ["vidama-mediathek"],
      },
      {
        name: "Prometheus & Grafana",
        years: 3,
        projectSlugs: ["disy-one"],
      },
      {
        name: "Ansible & shell automation",
        years: 3,
        projectSlugs: ["openshift-platform"],
      },
    ],
  },
  {
    domain: "AI & Integration",
    skills: [
      {
        name: "Multi-agent architecture",
        years: 1,
        projectSlugs: ["elia"],
      },
      {
        name: "MCP-based tool calling",
        years: 1,
        projectSlugs: ["elia"],
      },
      {
        name: "Agent framework orchestration",
        years: 1,
        projectSlugs: ["elia"],
      },
    ],
  },
] satisfies SkillDomain[];
