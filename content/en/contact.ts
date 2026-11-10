import type { ContactInfo } from "../shared/types";

/** Contact (EN): role-relevant facts only, no phone, no address. */
export const contact = {
  name: "Lasse Siemoneit",
  role: "Product Owner & Software Engineer",
  valueProp:
    "I bring together software engineering, platform operations and product ownership to build robust, privacy-compliant systems that hold up in real-world operation.",
  location: "Bremen area · Remote / Hybrid",
  status: "Product Owner Agent Services @ ITSC",
  email: "info@lsiem.de",
  github: "https://github.com/lsiem",
  linkedin: "https://www.linkedin.com/in/lasse-siemoneit/",
} satisfies ContactInfo;
