import type { SkillDomain } from "../shared/types";

/**
 * Skills (DE) — nach Domäne gruppiert, jede Fähigkeit mit Jahren (Schätzung
 * aus dem Werdegang) und projectSlugs, die auf reale Projekt-Slugs aus
 * projects.ts verweisen. Bewusst KEINE Prozent-/Level-Balken (CONT-05
 * Anti-Feature); Icon-Kopplung entfällt (Präsentation, Pitfall 6).
 *
 * Jahres-Schätzungen: Full-Stack/Java/Python seit ~2021 (~5 J.), Container-
 * Plattform seit ITSC 2024 (~2 J.), KI/Agenten seit ~2024–2026 (~1–2 J.).
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
    domain: "Cloud & Container-Plattformen",
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
        name: "Linux-Serverbetrieb",
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
    domain: "Datenbanken",
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
        name: "Ansible & Shell-Automatisierung",
        years: 3,
        projectSlugs: ["openshift-platform"],
      },
    ],
  },
  {
    domain: "KI & Integration",
    skills: [
      {
        name: "Multi-Agenten-Architektur",
        years: 1,
        projectSlugs: ["elia"],
      },
      {
        name: "MCP-basiertes Tool-Calling",
        years: 1,
        projectSlugs: ["elia"],
      },
      {
        name: "Agent-Framework-Orchestrierung",
        years: 1,
        projectSlugs: ["elia"],
      },
    ],
  },
] satisfies SkillDomain[];
