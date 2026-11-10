import type { SkillDomain } from "../shared/types";

/**
 * Kernfähigkeiten (DE) mit Erfahrung in Jahren, wie im Lebenslauf.
 * Die vollständige Matrix liegt in content/shared/skill-matrix.ts.
 */
export const skillDomains = [
  {
    domain: "Web & Application Engineering",
    skills: [
      { name: "Java & Spring Boot", years: 5 },
      { name: "TypeScript & JavaScript", years: 5 },
      { name: "REST APIs & WebSocket", years: 5 },
      { name: "Python (Flask, FastAPI)", years: 4 },
      { name: "Vaadin", years: 4 },
    ],
  },
  {
    domain: "Cloud & Container",
    skills: [
      { name: "Docker", years: 5 },
      { name: "Linux-Serverbetrieb", years: 5 },
      { name: "AWS & Azure", years: 4 },
      { name: "OpenShift & Kubernetes", years: 2 },
    ],
  },
  {
    domain: "Datenbanken",
    skills: [
      { name: "PostgreSQL & MySQL", years: 5 },
      { name: "MongoDB & Redis", years: 3 },
    ],
  },
  {
    domain: "DevOps & CI/CD",
    skills: [
      { name: "GitLab CI & Jenkins", years: 5 },
      { name: "Prometheus & Grafana", years: 3 },
      { name: "Ansible & Shell", years: 3 },
    ],
  },
  {
    domain: "KI & Integration",
    skills: [
      { name: "Multi-Agenten-Architektur", years: 1 },
      { name: "MCP-basiertes Tool-Calling", years: 1 },
      { name: "Agent-Framework-Orchestrierung", years: 1 },
    ],
  },
] satisfies SkillDomain[];
