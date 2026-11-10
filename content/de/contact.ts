import type { ContactInfo } from "../shared/types";

/** Kontakt (DE): nur berufsrelevante Fakten, kein Telefon, keine Adresse. */
export const contact = {
  name: "Lasse Siemoneit",
  role: "Product Owner & Software Engineer",
  valueProp:
    "Ich bringe Softwareentwicklung, Plattformbetrieb und Produktverantwortung zusammen, um robuste, datenschutzkonforme Systeme zu bauen, die im echten Betrieb bestehen.",
  location: "Raum Bremen · Remote / Hybrid",
  status: "Product Owner Agent Services @ ITSC",
  email: "info@lsiem.de",
  github: "https://github.com/lsiem",
  linkedin: "https://www.linkedin.com/in/lasse-siemoneit/",
} satisfies ContactInfo;
