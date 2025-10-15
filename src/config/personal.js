/**
 * Personal contact and social media configuration
 * Replace placeholder values with real URLs and email
 */

export const personalInfo = {
  email: 'info@lsiem.de',
  github: 'https://github.com/lsiem',
  linkedin: 'https://www.linkedin.com/in/lasse-siemoneit/',

  // Optional: Add more social links as needed
  twitter: '',
  portfolio: '',
};

/**
 * Check if a social link is configured
 * @param {string} key - The key to check (e.g., 'github', 'linkedin')
 * @returns {boolean}
 */
export const hasSocialLink = (key) => {
  return Boolean(personalInfo[key] && personalInfo[key].trim());
};

/**
 * Get all configured social links
 * @returns {Array<{key: string, url: string}>}
 */
export const getConfiguredSocialLinks = () => {
  return Object.entries(personalInfo)
    .filter(([, value]) => value && value.trim())
    .map(([key, url]) => ({ key, url }));
};

/**
 * Professional experience data
 */
export const experienceData = {
  title: "Referenzen",
  subtitle: "Berufliche Tätigkeiten",
  description:
    "Mit 16 startete mein Weg als Consultant in einem Start-Up-Unternehmen. Hier beriet und betreute ich Firmen bei der Digitalisierung und Migration in die Cloud. Seit 5 Jahren bin ich als Full-Stack-Entwickler und DevOps Engineer tätig und habe viel Erfahrung gesammelt. Meine Expertise ist die Planung und Realisierung von Softwareprojekten und digitalen Infrastrukturen.",
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
        "Zudem habe ich die Entwicklung und Implementierung einer K.I. Integration in das Pisa Sales CRM initiiert. Diese Innovation zielt darauf ab, die Funktionalität und Effizienz des CRM-Systems durch den Einsatz " +
        "von künstlicher Intelligenz signifikant zu steigern. Die K.I. Integration ist nicht nur ein bedeutender Schritt zur Verbesserung der aktuellen CRM-Lösung, sondern legt auch das Fundament für zukünftige Anbindungen an " +
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
        "Bandbreite der individuellen Softwareentwicklung verantwortlich - von " +
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
        "maßgeschneiderter Softwarelösungen für Unternehmen. Diese " +
        "Lösungen sind auf die spezifischen " +
        "Anforderungen und Herausforderungen meiner Kunden zugeschnitten, " +
        "um deren Effizienz und Produktivität zu steigern. " +
        "Darüber hinaus biete ich Beratungsleistungen zur digitalen " +
        "Transformation und Optimierung von Geschäftsprozessen. Dabei unterstütze ich " +
        "Unternehmen dabei, digitale Technologien strategisch " +
        "einzusetzen, um ihre Prozesse zu verbessern und langfristig " +
        "wettbewerbsfähig zu bleiben. " +
        "Durch meine freiberufliche Tätigkeit helfe ich Unternehmen, sich in ihrer " +
        "digitalen Landschaft zu navigieren und maßgeschneiderte Lösungen für ihre " +
        "Bedürfnisse zu implementieren.",
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
        "Bei der Heinsohn IT Solutions GmbH war ich als Consultant / Software Engineer tätig. Als Microsoft Partner habe ich einige Unternehmen bei der Digitalisierung mit Microsoft 365 beraten und betreut. " +
        "Dazu gehörte das Erstellen und Halten von Präsentationen über die verschiedenen Microsoft 365 Produkte wie z.B. Microsoft Teams und deren optimale Nutzung, sowie die Entwicklung von kundenspezifischen Softwareprojekten mit Microsoft 365 / Azure Schnittstelle.",
      color: "#ee3c26",
    },
  ],
};

/**
 * Skills data structure
 */
export const skillsData = {
  title: "Meine Fähigkeiten",
  subtitle: "Ein umfassender Überblick über meine technischen Kompetenzen und Fachgebiete",
  data: [
    {
      title: "Webentwicklung",
      categories: [
        {
          categoryTitle: "Frontend-Entwicklung",
          skills: [
            "Erstellung von responsiven Benutzeroberflächen mit HTML5, CSS3 und modernem JavaScript",
            "Einsatz von Vaadin für Rich Internet Applications",
          ],
          softwareSkills: [
            { skillName: "HTML5", fontAwesomeClassname: "simple-icons:html5" },
            { skillName: "CSS3", fontAwesomeClassname: "simple-icons:css3" },
            { skillName: "JavaScript", fontAwesomeClassname: "simple-icons:javascript" },
            { skillName: "Vaadin", fontAwesomeClassname: "simple-icons:vaadin" },
          ],
        },
        {
          categoryTitle: "Backend-Entwicklung",
          skills: [
            "Entwicklung robuster Server-Anwendungen in Java mit Spring Boot",
            "Nutzung von Python für leichte bis mittelschwere Server- und Client-Anwendungen",
          ],
          softwareSkills: [
            { skillName: "Spring Boot", fontAwesomeClassname: "simple-icons:springboot" },
            { skillName: "Python", fontAwesomeClassname: "simple-icons:python" },
            { skillName: "Django", fontAwesomeClassname: "simple-icons:django" },
            { skillName: "Flask", fontAwesomeClassname: "simple-icons:flask" },
          ],
        },
        {
          categoryTitle: "API-Entwicklung",
          skills: [
            "Entwurf und Design von RESTful APIs mit Postman",
            "Realisierung von RESTful APIs unter Verwendung von Spring oder Flask und FastAPI",
          ],
          softwareSkills: [
            { skillName: "Postman", fontAwesomeClassname: "simple-icons:postman" },
            { skillName: "FastAPI", fontAwesomeClassname: "simple-icons:fastapi" },
          ],
        },
      ],
    },
    {
      title: "Datenbankverwaltung",
      categories: [
        {
          categoryTitle: "Relationale Datenbanken",
          skills: [
            "Entwurf und Design von relationalen Datenbanken wie MySQL und PostgreSQL",
            "Entwicklung von Datenmodellen und Durchführung komplexer Abfragen",
          ],
          softwareSkills: [
            { skillName: "MySQL", fontAwesomeClassname: "simple-icons:mysql" },
            { skillName: "PostgreSQL", fontAwesomeClassname: "simple-icons:postgresql" },
          ],
        },
        {
          categoryTitle: "NoSQL-Datenbanken",
          skills: [
            "Verwendung von MongoDB und Redis für die Speicherung und Verwaltung von Daten",
            "Integration von NoSQL-Datenbanken in Anwendungen und Systeme",
          ],
          softwareSkills: [
            { skillName: "MongoDB", fontAwesomeClassname: "simple-icons:mongodb" },
            { skillName: "Redis", fontAwesomeClassname: "simple-icons:redis" },
          ],
        },
      ],
    },
    {
      title: "DevOps",
      categories: [
        {
          categoryTitle: "CI/CD und Containerisierung",
          skills: [
            "Automatisierung von CI/CD-Pipelines mit Jenkins und GitLab CI",
            "Verwendung von Docker und Kubernetes für die Containerisierung und Orchestrierung von Anwendungen",
          ],
          softwareSkills: [
            { skillName: "Jenkins", fontAwesomeClassname: "simple-icons:jenkins" },
            { skillName: "GitLab CI", fontAwesomeClassname: "simple-icons:gitlab" },
            { skillName: "Docker", fontAwesomeClassname: "simple-icons:docker" },
            { skillName: "Kubernetes", fontAwesomeClassname: "simple-icons:kubernetes" },
          ],
        },
        {
          categoryTitle: "Cloud Dienste",
          skills: [
            "Bereitstellung von Anwendungen in der Cloud mit AWS und Azure",
            "Migration von On-Premise-Anwendungen in die Cloud",
          ],
          softwareSkills: [
            { skillName: "Amazon AWS", fontAwesomeClassname: "simple-icons:amazonaws" },
            { skillName: "Azure", fontAwesomeClassname: "simple-icons:microsoftazure" },
          ],
        },
        {
          categoryTitle: "Überwachung und Sicherheit",
          skills: [
            "Überwachung von Anwendungen und Infrastrukturen mit Prometheus und Grafana",
            "Integration von Sicherheitsprotokollen und -tools mit OWASP ZAP oder Nessus",
          ],
          softwareSkills: [
            { skillName: "Prometheus", fontAwesomeClassname: "simple-icons:prometheus" },
            { skillName: "Grafana", fontAwesomeClassname: "simple-icons:grafana" },
          ],
        },
      ],
    },
    {
      title: "Serverkonfiguration",
      categories: [
        {
          categoryTitle: "Linux-Server",
          skills: [
            "Aufbau und Konfiguration von Linux-Servern und Clustern",
            "Automatisierung von Routinetasks mittels Shell-Skripting und Ansible",
          ],
          softwareSkills: [
            { skillName: "Linux", fontAwesomeClassname: "simple-icons:linux" },
            { skillName: "Ansible", fontAwesomeClassname: "simple-icons:ansible" },
          ],
        },
        {
          categoryTitle: "Windows Server",
          skills: [
            "Konfiguration und Verwaltung von Windows Servern und Active Directory",
            "Automatisierung von Routinetasks mittels PowerShell",
          ],
          softwareSkills: [
            { skillName: "Windows Server", fontAwesomeClassname: "simple-icons:windows" },
            { skillName: "PowerShell", fontAwesomeClassname: "simple-icons:powershell" },
          ],
        },
      ],
    },
  ],
};

/**
 * Projects data structure
 */
export const projectsData = {
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
            "EWE/osnatel, Olantis, Famila, Öffentliche Versicherungen in deren Stehlen, TVs oder Banden ermöglicht. ",
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
            "Handball Bundesliga für Frauen.",
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
            "Die Ferrero Fotoaktion ist eine Marketingkampagne der Ferrero Gruppe, die im letzten Jahr von der Teamwork GmbH und mir durchgeführt wurde. " +
            "Dabei fuhr Teamwork mit einer riesigen Weihnachtskugel durch deutsche Großstädte, in der sich Menschen fotografieren lassen konnten, um einen Gruß an Freunde und Familie zu senden. " +
            "Ich entwickelte eine Automatisierung, die die Fotos speicherte, auf eine von mir entwickelte Website mit einem vorgefertigten Template hochlud und automatisch einen QR-Code druckte, der auf diese Website verwies. " +
            "Auf diese Weise konnten die Menschen ihr Foto direkt auf ihrem Handy betrachten und, wenn sie wollten, auch direkt über die Website in sozialen Netzwerken oder per E-Mail teilen. Die Marketingkampagne war mit über 1.200 Teilnehmern ein großer Erfolg mit positivem Feedback der Ferrero Gruppe.",
          technologies: ["Python", "HTML", "CSS", "JavaScript"],
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
            "JavaScript",
            "PHP",
          ],
          link: "https://www.jrpurtec.com/",
        },
        {
          title: "Imke Folkerts Kundenportal",
          description:
            "Kundenportal für Imke Folkerts Fotografin für die Verwaltung von Kundendaten, sowie die Möglichkeit der digitalen Registrierung für Kunden.",
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
