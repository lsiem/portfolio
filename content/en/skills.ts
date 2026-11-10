import type { SkillDomain } from "../shared/types";

/**
 * Core skills (EN) with years of experience, as in the CV.
 * The full matrix lives in content/shared/skill-matrix.ts.
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
      { name: "Linux server operations", years: 5 },
      { name: "AWS & Azure", years: 4 },
      { name: "OpenShift & Kubernetes", years: 2 },
    ],
  },
  {
    domain: "Databases",
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
      { name: "Ansible & shell", years: 3 },
    ],
  },
  {
    domain: "AI & Integration",
    skills: [
      { name: "Multi-agent architecture", years: 1 },
      { name: "MCP-based tool calling", years: 1 },
      { name: "Agent framework orchestration", years: 1 },
    ],
  },
] satisfies SkillDomain[];
