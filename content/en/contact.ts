import type { ContactInfo } from "../shared/types";

/**
 * Contact (EN) — role-relevant facts only. No phone, birthdate or address
 * (public repo, data minimization — the shared contract has no such fields).
 * The role reflects the broader D-02 arc (engineering + product ownership).
 */
export const contact = {
  name: "Lasse Siemoneit",
  role: "Software Engineer & Product Owner",
  email: "info@lsiem.de",
  github: "https://github.com/lsiem",
  linkedin: "https://www.linkedin.com/in/lasse-siemoneit/",
} satisfies ContactInfo;
