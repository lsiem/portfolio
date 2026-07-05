import type { ContactInfo } from "../shared/types";

/**
 * Kontakt (DE) — bewusst nur berufsrelevante Fakten. Kein Telefon, kein
 * Geburtsdatum, keine Adresse (öffentliches Repo, Datenminimierung — der
 * geteilte Vertrag hat diese Felder gar nicht erst). Die Rolle spiegelt den
 * breiteren D-02-Bogen (Engineering + Produktverantwortung).
 */
export const contact = {
  name: "Lasse Siemoneit",
  role: "Software Engineer & Product Owner",
  valueProp:
    "Ich bringe Softwareentwicklung, Plattformbetrieb und Produktverantwortung zusammen, um robuste, datenschutzkonforme Systeme zu bauen, die im echten Betrieb bestehen.",
  email: "info@lsiem.de",
  github: "https://github.com/lsiem",
  linkedin: "https://www.linkedin.com/in/lasse-siemoneit/",
} satisfies ContactInfo;
