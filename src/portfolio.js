/* Change this file to get your personal Porfolio */

// Website related settings
const settings = {
  isSplash: true, // Change this to false if you don't want Splash screen.
};

//SEO Related settings
const seo = {
  title: "Lasse Siemoneit | Portfolio",
  description:
    "Ich bin ein selbsterlerneter und passionierter Full-Stack Software Entwickler mit einem Fokus auf die Entwicklung von Web- und Hybrid-Apps.",
  og: {
    title: "Lasse Siemoneit | Portfolio",
    type: "website",
    url: "https://lsiem.github.io",
  },
};

//Home Page
const greeting = {
  title: "Hi, ich bin Lasse",
  logo_name: "Lasse Siemoneit",
  subTitle:
    "Ich bin ein selbsterlerneter und passionierter Full-Stack Software Entwickler mit einem Fokus auf die Entwicklung von Web- und Hybrid-Apps.",
  resumeLink:
    "https://drive.google.com/file/d/1ZvSjgNAqE6I3TBNOjo_ZfMYI7zyhhfy3/view?usp=sharing",
  portfolio_repository: "https://github.com/lsiem/portfolio",
  githubProfile: "https://github.com/lsiem",
};

const socialMediaLinks = [
  /* Social Media Link */
  {
    name: "Github",
    link: "https://github.com/lsiem",
    fontAwesomeIcon: "fa-github", // Reference https://fontawesome.com/icons/github?style=brands
    backgroundColor: "#181717", // Reference https://simpleicons.org/?q=github
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/lasse-siemoneit-170ab7195/",
    fontAwesomeIcon: "fa-linkedin-in", // Reference https://fontawesome.com/icons/linkedin-in?style=brands
    backgroundColor: "#0077B5", // Reference https://simpleicons.org/?q=linkedin
  },
  {
    name: "Gmail",
    link: "mailto:lasse.siemoneit@gmail.com",
    fontAwesomeIcon: "fa-google", // Reference https://fontawesome.com/icons/google?style=brands
    backgroundColor: "#D14836", // Reference https://simpleicons.org/?q=gmail
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/lsiem0927/",
    fontAwesomeIcon: "fa-instagram", // Reference https://fontawesome.com/icons/instagram?style=brands
    backgroundColor: "#E4405F", // Reference https://simpleicons.org/?q=instagram
  },
];

const skills = {
  data: [
    {
      title: "Webentwicklung",
      categories: [
        {
          categoryTitle: "Frontend-Entwicklung",
          skills: [
            "⚡ Erstellung von responsiven Benutzeroberflächen mit HTML5, CSS3 und modernem JavaScript",
            "⚡ Einsatz von Vaadin für Rich Internet Applications",
          ],
          softwareSkills: [
            {
              skillName: "HTML5",
              fontAwesomeClassname: "simple-icons:html5",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "CSS3",
              fontAwesomeClassname: "simple-icons:css3",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "JavaScript",
              fontAwesomeClassname: "simple-icons:javascript",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Vaadin",
              fontAwesomeClassname: "simple-icons:vaadin",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "Backend-Entwicklung",
          skills: [
            "⚡ Entwicklung robuster Server-Anwendungen in Java mit Spring Boot",
            "⚡ Nutzung von Python für leichte bis mittelschwere Server- und Client-Anwendungen",
          ],
          softwareSkills: [
            {
              skillName: "Java",
              fontAwesomeClassname: "fa-brands:java",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Spring Boot",
              fontAwesomeClassname: "simple-icons:spring",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Python",
              fontAwesomeClassname: "simple-icons:python",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "API-Entwicklung",
          skills: [
            "⚡ Entwurf und Design von RESTful APIs mit Postman",
            "⚡ Realisierung von RESTful APIs unter Verwendung von Spring oder Flask und FastAPI",
          ],
          softwareSkills: [
            {
              skillName: "Postman",
              fontAwesomeClassname: "simple-icons:postman",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Flask",
              fontAwesomeClassname: "simple-icons:flask",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "FastAPI",
              fontAwesomeClassname: "simple-icons:fastapi",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Datenbankverwaltung",
      categories: [
        {
          categoryTitle: "SQL-Datenbanken",
          skills: [
            "⚡ Entwurf und Design von relationalen Datenbanken wie MySQL und PostgreSQL",
            "⚡ Entwicklung von Datenmodellen und Durchführung komplexer Abfragen",
          ],
          softwareSkills: [
            {
              skillName: "MySQL",
              fontAwesomeClassname: "fontisto:mysql",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "PostgreSQL",
              fontAwesomeClassname: "simple-icons:postgresql",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
      ],
    },
    {
      title: "DevOps",
      categories: [
        {
          categoryTitle: "Continuous Integration / Continuous Deployment",
          skills: [
            "⚡ Versionsverwaltung mit Git und GitHub",
            "⚡ Einsatz von GitHub Actions, Azure DevOps oder Jenkins für CI/CD Pipelines",
          ],
          softwareSkills: [
            {
              skillName: "Git",
              fontAwesomeClassname: "simple-icons:git",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "GitHub",
              fontAwesomeClassname: "simple-icons:github",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Azure DevOps",
              fontAwesomeClassname: "simple-icons:azuredevops",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "Cloud Dienste",
          skills: [
            "⚡ Konfiguration und Verwalten von Azure Cloud Diensten",
            "⚡ Migration von On-Premise Diensten auf Cloud Dienste",
          ],
          softwareSkills: [
            {
              skillName: "Azure",
              fontAwesomeClassname: "simple-icons:microsoftazure",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Azure Functions",
              fontAwesomeClassname: "simple-icons:azurefunctions",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Azure Pipelines",
              fontAwesomeClassname: "simple-icons:azurepipelines",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Azure Artifacts",
              fontAwesomeClassname: "simple-icons:azureartifacts",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Cloud Migration",
              fontAwesomeClassname: "carbon:ibm-cloud-mass-data-migration",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "Überwachung und Sicherheit",
          skills: [
            "⚡ Integration von Sicherheitsprotokollen und - tools mit OWASP ZAP oder Nessus",
            "⚡ Nutzung von Tools wie Grafana oder Datadog zur Überwachung der Systemleistung",
          ],
          softwareSkills: [
            {
              skillName: "Prometheus",
              fontAwesomeClassname: "simple-icons:prometheus",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Grafana",
              fontAwesomeClassname: "simple-icons:grafana",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Datadog",
              fontAwesomeClassname: "simple-icons:datadog",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "OWASP ZAP",
              fontAwesomeClassname: "simple-icons:owasp",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Serverkonfiguration und -management",
      categories: [
        {
          categoryTitle: "Linux Server",
          skills: [
            "⚡ Aufbau und Konfiguration von Linux-Servern und Clustern",
            "⚡ Automatisierung von Routinetasks mittels Shell-Skripting",
          ],
          softwareSkills: [
            {
              skillName: "Linux",
              fontAwesomeClassname: "simple-icons:linux",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Shell-Scripting",
              fontAwesomeClassname: "simple-icons:gnubash",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "Windows Server",
          skills: [
            "⚡ Bereitstellen und Konfigurieren von Windows-Servern und Clustern",
            "⚡ Domain-Management und Active Directory Administration",
          ],
          softwareSkills: [
            {
              skillName: "Windows Server",
              fontAwesomeClassname: "simple-icons:windows",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "PowerShell",
              fontAwesomeClassname: "simple-icons:powershell",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Active Directory",
              fontAwesomeClassname: "carbon:directory-domain",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "Containerisierung und Orchestrierung",
          skills: [
            "⚡ Nutzung von Docker zur Containerisierung von Anwendungen",
            "⚡ Einsatz von Kubernetes für die Orchestrierung von Container-Deployments",
          ],
          softwareSkills: [
            {
              skillName: "Docker",
              fontAwesomeClassname: "simple-icons:docker",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Kubernetes",
              fontAwesomeClassname: "simple-icons:kubernetes",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Consulting",
      categories: [
        {
          categoryTitle: "Technologieberatung",
          skills: [
            "⚡ Analyse und Optimierung von IT-Infrastrukturen",
            "⚡ Beratung zur digitalen Transformation und Cloud-Migration",
            "⚡ Implementierungsstrategien für moderne Technologielösungen",
          ],
          softwareSkills: [
            {
              skillName: "IT-Consulting",
              fontAwesomeClassname: "game-icons:teacher",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Digital Transformation",
              fontAwesomeClassname: "carbon:ibm-cloud-mass-data-migration",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "Sicherheitsberatung",
          skills: [
            "⚡ Entwicklung und Implementierung von Sicherheitsstrategien",
            "⚡ Risikobewertung und Compliance-Prüfungen",
            "⚡ Beratung zu Datenintegration und Informationssicherheit",
          ],
          softwareSkills: [
            {
              skillName: "Sicherheit",
              fontAwesomeClassname: "material-symbols:security",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Compliance",
              fontAwesomeClassname: "fluent-mdl2:compliance-audit",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Data Integration",
              fontAwesomeClassname: "mingcute:file-security-fill",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
      ],
    },
  ],
};

// Experience Page
const experience = {
  title: "Referenzen",
  subtitle: "Berufliche Tätigkeiten",
  description:
    "Mit 16 startete mein Weg als Consultant in einem Start-Up-Unternehmen. Hier beriet und betreute ich Firmen bei der Digitalisierung und Migration in die Cloud. Seit 5 Jahren bin ich als Full-Stack-Entwickler und DevOps Engineer tätig und habe viel Erfahrung gesammelt. Meine Expertise ist die Planung und Realisierung von Softwareprojekten und digitalen Infrastrukturen.",
  header_image_path: "experience.png",
  sections: [
    {
      title: "Work",
      work: true,
      experiences: [
        {
          title: "",
          company: "",
          company_url: "",
          logo_path: "",
          duration: "",
          location: "",
          description:
            "",
          color: "#000000",
        },
        {
          title: "",
          company: "",
          company_url: "",
          logo_path: "",
          duration: "",
          location: "",
          description:
            "",
          color: "#000000",
        },
      ],
    },
  ],
};

// Contact Page
const contactPageData = {
  contactSection: {
    title: "Kontaktiere mich",
    profile_image_path: "lasse_profile.webp",
    description:
      "Interessiert an meiner Arbeit? Ich freue mich auf deine Kontaktaufnahme für einen persönlichen Austausch.",
  },
  blogSection: {
    title: "Blog",
    subtitle:
      "Ich dokumentiere gerne einige meiner Erfahrungen auf meinem beruflichen Werdegang und teile mein technisches Wissen.",
    link: "https://blog.lsiem.de/",
    avatar_image_path: "blogs_image.svg",
  },
};

export {
  settings,
  seo,
  greeting,
  socialMediaLinks,
  skills,
  experience,
  contactPageData,
};
