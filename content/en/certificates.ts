import type { Certificate } from "../shared/types";

export const certificates = [
  {
    title:
      "Red Hat OpenShift Developer I: Introduction to Containers with Podman",
    code: "DO188",
    issuer: "Red Hat",
    date: "2025-09",
  },
  {
    title:
      "Red Hat OpenShift Administration I: Operating a Production Cluster",
    code: "DO180",
    issuer: "Red Hat",
    date: "2024-07",
  },
] satisfies Certificate[];

export const methods = [
  "Product management",
  "Agile software development",
  "Stakeholder management",
  "Project management",
  "Consulting",
  "RPA",
  "DevOps",
];
