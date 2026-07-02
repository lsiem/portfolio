import type { Experience } from './types';

export const experienceContent = {
  title: 'Referenzen',
  subtitle: 'Berufliche Tätigkeiten',
  description:
    'Mit 16 startete mein Weg als Consultant in einem Start-Up-Unternehmen. Seit 5 Jahren bin ich als Full-Stack-Entwickler und DevOps Engineer tätig. Meine Expertise liegt in der Planung und Realisierung von Softwareprojekten und digitalen Infrastrukturen.',
  experiences: [
    {
      title: 'Systemadministrator',
      company: 'ITSC GmbH',
      companyUrl: 'https://www.itsc.de',
      logoPath: '/logos/itsc_logo.svg',
      duration: 'Juni 2024 – Heute',
      location: 'Hannover, Remote',
      description:
        'Verwaltung und Optimierung der IT-Infrastruktur öffentlicher Krankenkassen — Server, Netzwerke, Microservices im Clusterbetrieb und weitere IT-Ressourcen.',
      techStack: ['Linux', 'Kubernetes', 'Docker', 'Microservices', 'Active Directory'],
    },
    {
      title: 'Software Engineer',
      company: 'Just Relate Group GmbH',
      companyUrl: 'https://www.justrelate.de',
      logoPath: '/logos/justrelate_logo.svg',
      duration: 'Januar 2024 – Heute',
      location: 'Berlin, Remote',
      description:
        'Customizing des Pisa Sales CRM für individuelle Kundenanforderungen. Initiierung und Implementierung einer KI-Integration zur Steigerung der CRM-Effizienz und als Grundlage für zukünftige Produktanbindungen.',
      techStack: ['Java', 'Spring Boot', 'CRM', 'KI-Integration', 'REST APIs'],
      color: '#0071C5',
    },
    {
      title: 'Chief Technology Officer',
      company: 'Vidama GmbH',
      companyUrl: 'https://www.vidama.de',
      logoPath: '/logos/vidama_logo.svg',
      duration: 'Dezember 2021 – Januar 2024',
      location: 'Oldenburg, Remote',
      description:
        'Als einziger Entwickler verantwortlich für die gesamte individuelle Softwareentwicklung — von der Planung über die Umsetzung bis zur Wartung komplexer Kundenlösungen.',
      techStack: ['Python', 'Flask', 'FastAPI', 'Docker', 'CI/CD'],
      color: '#ee3c26',
    },
    {
      title: 'Inhaber',
      company: 'Lasse Siemoneit',
      companyUrl: 'https://lsiem.de',
      logoPath: '/logos/lsiem_logo.svg',
      duration: 'April 2021 – Heute',
      location: 'Hatten, Remote',
      description:
        'Entwicklung maßgeschneiderter Softwarelösungen und Beratung zur digitalen Transformation. Strategischer Einsatz digitaler Technologien zur Prozessoptimierung und langfristigen Wettbewerbsfähigkeit.',
      techStack: ['Full-Stack', 'Java', 'Python', 'Cloud', 'Beratung'],
      color: '#22d3ee',
    },
    {
      title: 'Consultant / Software Engineer',
      company: 'Heinsohn IT Solutions GmbH',
      companyUrl: 'https://www.heinsohn-it.com/',
      logoPath: '/logos/heinsohn_logo.svg',
      duration: 'Mai 2021 – Dezember 2021',
      location: 'Westerstede, Remote',
      description:
        'Als Microsoft Partner Unternehmen bei der Digitalisierung mit Microsoft 365 beraten. Präsentationen zu Teams und M365-Produkten sowie Entwicklung kundenspezifischer Software mit Azure-Schnittstellen.',
      techStack: ['Microsoft 365', 'Azure', 'Teams', 'Consulting'],
      color: '#ee3c26',
    },
  ] satisfies Experience[],
};
