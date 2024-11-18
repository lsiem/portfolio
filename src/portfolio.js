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

const socialMediaLinks = {
  github: "https://github.com/YourGithubUsername",
  linkedin: "https://www.linkedin.com/in/YourLinkedInUsername",
  gmail: "your.email@gmail.com",
  instagram: "https://www.instagram.com/YourInstagramUsername",
};

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
            "⚡ Einsatz von CI/CD Pipelines, Azure DevOps oder Jenkins für CI/CD Pipelines",
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
  sections: [
    {
      title: "Berufliche Tätigkeiten",
      work: true,
      experiences: [
        {
          title: "Systemadministrator",
          company: "ITSC GmbH",
          company_url: "https://www.itsc.de",
          logo_path: "itsc_logo.png",
          duration: "Juni 2024 - Heute",
          location: "Hannover, Remote",
          description:
            "In meiner Rolle als Systemadministrator bei der ITSC GmbH bin ich für die Verwaltung und Optimierung der IT-Infrastruktur von öffentlichen Krankenkassen verantwortlich. Dazu gehört die Verwaltung von Servern, Netzwerken, Microservices im Klusterbetrieb und anderen IT-Ressourcen.",
        },
        {
          title: "Software Engineer",
          company: "Just Relate Group GmbH",
          company_url: "https://www.justrelate.de",
          logo_path: "justrelate_logo.webp",
          duration: "Januar 2024 - Heute",
          location: "Berlin, Remote",
          description:
            "In meiner Rolle als Software Engineer bei der JustRelate Group GmbH bin ich für das Customizing des Pisa Sales CRM zuständig, um es präzise auf die individuellen Anforderungen unserer Kunden zuzuschneiden. " +
            "Diese maßgeschneiderte Anpassung ermöglicht eine optimale Unterstützung der spezifischen Geschäftsprozesse unserer Kunden durch das CRM-System. " +
            "Zudem habe ich die Entwicklung und Implementierung einer K.I. Integration in das Pisa Sales CRM initiiert. Diese Innovation zielt darauf ab, die Funktionalität und Effizienz des CRM-Systems durch den Einsatz" +
            "von künstlicher Intelligenz signifikant zu steigern. Die K.I. Integration ist nicht nur ein bedeutender Schritt zur Verbesserung der aktuellen CRM-Lösung, sondern legt auch das Fundament für zukünftige Anbindungen an" +
            "andere Produkte der JustRelate Group GmbH, um ein kohärentes und fortschrittliches digitales Lösungsportfolio anzubieten.",
          color: "#0071C5",
        },
        {
          title: "Chief Technology Officer",
          company: "Vidama GmbH",
          company_url: "https://www.vidama.de",
          logo_path: "vidama_logo.png",
          duration: "Dezember 2021 - Januar 2024",
          location: "Oldenburg, Remote",
          description:
            "Bei der Vidama GmbH war ich als einziger Entwickler für die gesamte " +
            "Bandbreite der individuellen Softwareentwicklung verantwortlich - von" +
            "der initialen Planung über die Umsetzung bis hin zur Wartung der " +
            "Projekte. Diese Rolle erforderte ein tiefgreifendes technisches " +
            "Verständnis und die Fähigkeit, komplexe Softwarelösungen selbstständig " +
            "zu konzipieren und zu realisieren. Durch die Übernahme des gesamten " +
            "Entwicklungszyklus konnte ich umfassende Erfahrungen in allen Phasen " +
            "der Softwareerstellung sammeln und sicherstellen, dass die entwickelten " +
            "Anwendungen den Anforderungen und Erwartungen der Kunden in vollem " +
            "Umfang entsprechen.",
          color: "#ee3c26",
        },
        {
          title: "Inhaber",
          company: "Lasse Siemoneit",
          company_url: "https://lsiem.de",
          logo_path: "lsiem_logo.png",
          duration: "April 2021 - Heute",
          location: "Hatten, Remote",
          description:
            "In meiner Selbständigkeit konzentriere ich mich auf die Entwicklung " +
            "Softwarelösungen für Unternehmen. Diese " +
            "Lösungen sind auf die spezifischen " +
            "Anforderungen und Herausforderungen meiner Kunden " +
            "um deren Effizienz und Produktivität zu steigern. " +
            "Darüber hinaus biete ich Beratungsleistungen zur digitalen " +
            "Transformation und Optimierung von Geschäftsprozessen. Dabei " +
            "Unternehmen dabei, digitale Technologien strategisch einzusetzen " +
            "einzusetzen, um ihre Prozesse zu verbessern und langfristig " +
            "wettbewerbsfähig zu bleiben. " +
            "Durch meine freiberufliche Tätigkeit helfe ich Unternehmen, ihre digitale " +
            "digitalen Landschaft zu navigieren und maßgeschneiderte " +
            "Bedürfnisse zu implementieren",
          color: "#ee3c26",
        },
        {
          title: "Consultant / Software Engineer",
          company: "Heinsohn IT Solutions GmbH",
          company_url: "https://www.heinsohn-it.com/",
          logo_path: "heinsohn_logo.png",
          duration: "Mai 2021 - Dezember 2021",
          location: "Westerstede, Remote",
          description:
            "Bei der Heinsohn IT Solutions GmbH war ich als Consultant / Software Engineer tätig. Als Microsoft Partner habe ich einige Unternehmen bei der Digitalisierung mit Microsoft 365 beraten und betreut." +
            "Dazu gehörte das Erstellen und Halten von Präsentationen, über die verschiedenen Microsoft 365 Produkte wie z.B. Microsoft Teams und deren optimale Nutzung, sowie die Entwicklung von kundenspezifischen Softwareprojekten mit Microsoft 365 / Azure Schnittstelle.",
          color: "#ee3c26",
        },
      ],
    },
    {
      title: "Hauptprojekte",
      mainProjects: true,
      projects: [
        {
          title: "EWE/osnatel Vertriebspartner Mediathek",
          description:
            "Entwicklung einer Vertriebspartnermediathek für die EWE " +
            "Aktiengesellschaft und osnatel. Administratoren können entsprechende " +
            "Kampagnenfilme verwalten, organisieren und zuweisen. " +
            "Vertriebspartner haben die Möglichkeit sich diese anzuschauen, bei sich " +
            "im Shop wiederzugeben und eigene Inhalte anhand von Templates zu erstellen " +
            "Vertriebsbeauftragte haben dabei stets die Kontrolle über alle " +
            "Vertriebspartner in ihrem Vertriebsgebiet",
          technologies: [
            "Java",
            "Spring Boot",
            "Gradle",
            "Vaadin",
            "CSS",
            "HTML",
            "JavaScript",
            "PostgreSQL",
            "REST",
            "Docker",
            "CI/CD Pipelines",
            "JUnit",
            "Mockito",
            "Selenium",
          ],
          link: "https://bpp.ewe.de/login",
        },
        {
          title: "Disy-One",
          description:
            "Projekt für die Vidama GmbH, welches das Verwalten und " +
            "konfigurierbares Abspielen von Medien für Unternehmen, wie " +
            "EWE/osnatel, Olantis, Famila, Öffentliche Versicherungen in deren Stehlen, TVs oder Banden ermglicht. ",
          technologies: [
            "Python",
            "Flask",
            "FastAPI",
            "REST",
            "Bash",
            "Unix",
            "Docker",
            "CI/CD Pipelines",
            "Grafana",
            "Prometheus",
          ],
          link: "https://vidama.de",
        },
        {
          title: "Sport Event Controller",
          description:
            "Der Sport Event Controller bietet eine Lösung für die Steuerung der " +
            "Medienwiedergabe während eines Sport-Events. Ursprünglich für den VFL " +
            "Oldenburg Handball Frauen entwickelt, um eine einfache Lösung zur " +
            "Steuerung der Einlaufshow, sowie die Verwaltung der Wiedergabe von " +
            "Sponsoreninhalten zu ermöglichen. Mittlerweile bei weiteren Vereinen, wie " +
            "dem Buxtehuder SV Handball Frauen und zukünftig für weitere Vereine der " +
            "Handball Bundesliga fr Frauen.",
          technologies: [
            "Python",
            "Flask",
            "FastAPI",
            "REST",
            "Bash",
            "Unix",
            "Docker",
            "CI/CD Pipelines",
            "WebSocket",
            "Orchestration",
            "CI/CD Pipelines",
            "HTML",
            "CSS",
            "JavaScript",
          ],
          link: "https://www.handball-bundesliga-frauen.de/",
        },
        {
          title: "Ferrero Foto-Aktion",
          description:
            "Die Ferrero Fotoaktion ist eine Marketingkampagne der Ferrero Gruppe, die im letzten Jahr von der Teamwork GmbH und mir durchgeführt wurde. " +
            "Dabei fuhr Teamwork mit einer riesigen Weihnachtskugel durch deutsche Großstädte, in der sich Menschen fotografieren lassen konnten, um einen Gruß an Freunde und Familie zu senden. " +
            "Ich entwickelte eine Automatisierung, die die Fotos speicherte, auf eine von mir entwickelte Website mit einem vorgefertigten Template hochlud und automatisch einen QR-Code druckte, der auf diese Website verwies. " +
            "Auf diese Weise konnten die Menschen ihr Foto direkt auf ihrem Handy betrachten und, wenn sie wollten, auch direkt über die Website in sozialen Netzwerken oder per E-Mail teilen. Die Marketingkampagne war mit über 1.200 Teilnehmern ein großer Erfolg mit positivem Feedback der Ferrero Gruppe.",
          technologies: ["Python", "AWS", "HTML", "CSS", "JavaScript"],
        },
      ],
    },
    {
      title: "Nebenprojekte",
      sideProjects: true,
      projects: [
        {
          title: "Website Entwicklung JR PurTec",
          description:
            "Für JR PurTec habe ich eine moderne und benutzerfreundliche Website entwickelt, die das Fachwissen des Unternehmens im Bereich der Polyurethan-Technologie und seine breite Palette von Anwendungen - von der Automobilindustrie über den öffentlichen Nahverkehr bis hin zur Medizintechnik - vorstellt. Die Website fungiert als digitale Visitenkarte, mit einem klaren Design und einer intuitiven Navigation für einen einfachen Zugang zu Unternehmensinformationen, Produktdetails und Kontaktmöglichkeiten. Ziel war es, die Markenidentität von JR PurTec stark zu repräsentieren und gleichzeitig die Nutzererfahrung zu verbessern, um Kunden und Interessenten ein umfassendes Verständnis der hochwertigen Lösungen und des Engagements für Nachhaltigkeit zu vermitteln.",
          technologies: [
            "WordPress",
            "JetPack",
            "Elementor",
            "HTML",
            "CSS",
            "JavaScrpt",
            "PHP",
          ],
          link: "https://www.jrpurtec.com/",
        },
        {
          title: "Imke Folkerts Kundenportal",
          description:
            "Kundenportal für Imke Folkerts Fotografin für die Verwaltung von Kundendaten, sowie die Mglichkeit der digitalen Registrierung für Kunden.",
          technologies: [
            "Java",
            "Spring Boot",
            "Vaadin",
            "Gradle",
            "HTML",
            "CSS",
            "JavaScript",
            "PostgreSQL",
            "Docker",
            "CI/CD Pipelines",
          ],
          link: "https://www.imkefolkerts-fotografin.de/",
        },
        {
          title: "Immobilienbaukasten",
          description:
            "Der Immobilienbaukasten ist eine Webanwendung, welche ursprünglich für die Schlüssel Gruppe GmbH entwickelt wurde und anhand einer benutzerfreundlichen und intuitiven Weboberfläche " +
            "das erstellen von One-Page Webseiten für Immobilienprojekte ohne Programmierkenntnisse ermöglicht. In einer dynamischen Maske können alle relevanten Daten zur Immobilie eingegeben " +
            "werden, Bilder hochgeladen und das generelle Aussehen anhand von Vorlagen definiert werden.",
          technologies: [
            "Java",
            "Spring Boot",
            "Thymeleaf",
            "HTML",
            "CSS",
            "JavaScript",
            "PostgreSQL",
            "Docker",
            "CI/CD Pipelines",
          ],
          link: "https://www.schluessel-gruppe.de/",
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

const projects = [
  {
    title: "EWE/osnatel Vertriebspartner Mediathek",
    description:
      "Entwicklung einer Vertriebspartnermediathek für die EWE Aktiengesellschaft und osnatel...",
    technologies: ["Java", "Spring Boot", "Vaadin", "PostgreSQL"],
    link: "https://bpp.ewe.de/login",
  },
  {
    title: "Disy-One",
    description:
      "Projekt für die Vidama GmbH, welches das Verwalten und konfigurierbares Abspielen von Medien für Unternehmen, wie EWE/osnatel, Olantis, Famila, Öffentliche Versicherungen in deren Stehlen, TVs oder Banden ermglicht...",
    technologies: [
      "Python",
      "Flask",
      "FastAPI",
      "REST",
      "Bash",
      "Unix",
      "Docker",
      "CI/CD Pipelines",
      "Grafana",
      "Prometheus",
    ],
    link: "https://vidama.de",
  },
  {
    title: "Sport Event Controller",
    description:
      "Der Sport Event Controller bietet eine Lösung für die Steuerung der Medienwiedergabe während eines Sport-Events...",
    technologies: [
      "Python",
      "Flask",
      "FastAPI",
      "REST",
      "Bash",
      "Unix",
      "Docker",
      "CI/CD Pipelines",
      "WebSocket",
      "Orchestration",
      "HTML",
      "CSS",
      "JavaScript",
    ],
    link: "https://www.handball-bundesliga-frauen.de/",
  },
  {
    title: "Ferrero Foto-Aktion",
    description:
      "Die Ferrero Fotoaktion ist eine Marketingkampagne der Ferrero Gruppe, die im letzten Jahr von der Teamwork GmbH und mir durchgeführt wurde...",
    technologies: ["Python", "AWS", "HTML", "CSS", "JavaScript"],
  },
  {
    title: "Immobilienbaukasten",
    description:
      "Der Immobilienbaukasten ist eine Webanwendung, welche ursprünglich für die Schlüssel Gruppe GmbH entwickelt wurde und anhand einer benutzerfreundlichen und intuitiven Weboberfläche das erstellen von One-Page Webseiten für Immobilienprojekte ohne Programmierkenntnisse ermglicht...",
    technologies: [
      "Java",
      "Spring Boot",
      "Thymeleaf",
      "HTML",
      "CSS",
      "JavaScript",
      "PostgreSQL",
      "Docker",
      "CI/CD Pipelines",
    ],
    link: "https://www.schluessel-gruppe.de/",
  },
  {
    title: "Website Entwicklung JR PurTec",
    description:
      "Für JR PurTec habe ich eine moderne und benutzerfreundliche Website entwickelt, die das Fachwissen des Unternehmens im Bereich der Polyurethan-Technologie und seine breite Palette von Anwendungen - von der Automobilindustrie über den öffentlichen Nahverkehr bis hin zur Medizintechnik - vorstellt...",
    technologies: [
      "WordPress",
      "JetPack",
      "Elementor",
      "HTML",
      "CSS",
      "JavaScrpt",
      "PHP",
    ],
    link: "https://www.jrpurtec.com/",
  },
  {
    title: "Imke Folkerts Kundenportal",
    description:
      "Kundenportal für Imke Folkerts Fotografin für die Verwaltung von Kundendaten, sowie die Mglichkeit der digitalen Registrierung für Kunden...",
    technologies: [
      "Java",
      "Spring Boot",
      "Vaadin",
      "Gradle",
      "HTML",
      "CSS",
      "JavaScript",
      "PostgreSQL",
      "Docker",
      "CI/CD Pipelines",
    ],
    link: "https://www.imkefolkerts-fotografin.de/",
  },
  {
    title: "Just Relate Group GmbH",
    description:
      "Entwicklung eines CRM-Systems für die Just Relate Group GmbH, welches die Verwaltung von Kundenanfragen und deren Verteilung auf die entsprechenden Mitarbeiter ermöglicht...",
    technologies: [
      "Java",
      "Spring Boot",
      "Vaadin",
      "Gradle",
      "HTML",
      "CSS",
      "JavaScript",
      "PostgreSQL",
      "Docker",
      "CI/CD Pipelines",
      "JUnit",
      "Mockito",
      "Selenium",
    ],
    link: "https://www.justrelate.de/",
  },
  {
    title: "ITSC GmbH",
    description:
      "Verwaltung und Optimierung der IT-Infrastruktur von öffentlichen Krankenkassen...",
    technologies: [
      "Python",
      "RedHat OpenShift",
      "Kubernetes",
      "Docker",
      "CI/CD Pipelines",
      "Shell",
      "Unix",
    ],
    link: "https://www.itsc.de/",
  },
];

const about = {
  title: "Über mich",
  description:
    "Ich bin ein selbsterlerneter und passionierter Full-Stack Software Entwickler mit einem Fokus auf die Entwicklung von Web- und Hybrid-Apps. Ich bin ein leidenschaftlicher Entwickler, der ständig neue Technologien erlernt und anwendet, um innovative Lösungen zu schaffen. Mein Schwerpunkt liegt auf der Erstellung robuster, benutzerfreundlicher und skalierbarer Software, die sowohl technische als auch wirtschaftliche Anforderungen erfüllt.",
};

export {
  settings,
  seo,
  greeting,
  socialMediaLinks,
  skills,
  experience,
  contactPageData,
  projects,
  about,
};
