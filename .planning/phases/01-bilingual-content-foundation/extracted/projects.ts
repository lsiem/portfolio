import type { Project } from './types';

export const projectsContent = {
  title: 'Projekte',
  subtitle: 'Ausgewählte Arbeiten',
  description:
    'Eine Auswahl meiner Projekte — von Enterprise-Mediatheken über Event-Steuerung bis hin zu Marketing-Automatisierung.',
  projects: [
    {
      id: 'ewe-mediathek',
      title: 'EWE/osnatel Vertriebspartner Mediathek',
      description:
        'Vertriebspartnermediathek für EWE und osnatel: Kampagnenfilme verwalten, zuweisen und im Shop wiedergeben — mit Template-basierter Content-Erstellung.',
      tags: ['Java', 'Spring Boot', 'Vaadin', 'PostgreSQL', 'Docker', 'CI/CD'],
      url: 'https://bpp.ewe.de/login',
      screenshot: '/projects/ewe-mediathek.svg',
      featured: true,
      problem: 'Vertriebspartner benötigten zentral verwaltete Marketingmedien mit regionaler Kontrolle.',
      solution:
        'Enterprise-Webapp mit Rollenmodell für Admins, Vertriebspartner und Beauftragte inklusive Medienverwaltung und Shop-Integration.',
    },
    {
      id: 'disy-one',
      title: 'Disy-One',
      description:
        'Medienverwaltungsplattform für Unternehmen — konfigurierbares Abspielen auf Stehlen, TVs und Banden für EWE, Olantis, Famila und Versicherungen.',
      tags: ['Python', 'Flask', 'FastAPI', 'Docker', 'Grafana', 'Prometheus'],
      url: 'https://vidama.de',
      screenshot: '/projects/disy-one.svg',
      featured: true,
      problem: 'Unternehmen brauchten zentral gesteuerte Digital-Signage-Inhalte.',
      solution: 'Skalierbare Python-Plattform mit Monitoring und containerisierter Bereitstellung.',
    },
    {
      id: 'sport-event-controller',
      title: 'Sport Event Controller',
      description:
        'Steuerung der Medienwiedergabe bei Sport-Events — Einlaufshow, Sponsoreninhalte und Live-Orchestrierung für Handball-Bundesliga-Vereine.',
      tags: ['Python', 'Flask', 'WebSocket', 'Docker', 'FastAPI'],
      url: 'https://www.handball-bundesliga-frauen.de/',
      screenshot: '/projects/sport-event.svg',
      featured: true,
      problem: 'Vereine benötigten eine einfache Lösung für komplexe Event-Mediensteuerung.',
      solution: 'Echtzeit-Steuerung via WebSocket mit intuitivem Bedieninterface.',
    },
    {
      id: 'ferrero-foto',
      title: 'Ferrero Foto-Aktion',
      description:
        'Marketing-Automatisierung für Ferrero: Fotos speichern, auf Template-Website hochladen und QR-Code für sofortigen Mobile-Zugriff drucken — über 1.200 Teilnehmer.',
      tags: ['Python', 'HTML', 'CSS', 'JavaScript', 'Automation'],
      url: 'https://lsiem.de',
      screenshot: '/projects/ferrero.svg',
      featured: true,
      problem: 'Live-Marketingkampagne brauchte sofortige Foto-Bereitstellung für Besucher.',
      solution: 'Automatisierte Pipeline von Kamera bis Mobile-Website mit Social-Sharing.',
    },
    {
      id: 'jr-purtec',
      title: 'Website Entwicklung JR PurTec',
      description:
        'Moderne Unternehmenswebsite für Polyurethan-Technologie — klares Design, intuitive Navigation und starke Markenidentität.',
      tags: ['WordPress', 'Elementor', 'PHP', 'JavaScript'],
      url: 'https://www.jrpurtec.com/',
      screenshot: '/projects/jr-purtec.svg',
      featured: false,
      problem: 'Digitale Visitenkarte für ein technisches B2B-Unternehmen.',
      solution: 'WordPress-Site mit Elementor und optimierter Nutzerführung.',
    },
    {
      id: 'imke-folkerts',
      title: 'Imke Folkerts Kundenportal',
      description:
        'Kundenportal für Fotografin — Verwaltung von Kundendaten und digitale Registrierung.',
      tags: ['Java', 'Spring Boot', 'Vaadin', 'PostgreSQL', 'Docker'],
      url: 'https://www.imkefolkerts-fotografin.de/',
      screenshot: '/projects/imke-folkerts.svg',
      featured: false,
      problem: 'Manuelle Kundenverwaltung sollte digitalisiert werden.',
      solution: 'Self-Service-Portal mit sicherer Kundenregistrierung.',
    },
    {
      id: 'immobilienbaukasten',
      title: 'Immobilienbaukasten',
      description:
        'One-Page-Generator für Immobilienprojekte — ohne Programmierkenntnisse Webseiten aus Vorlagen erstellen.',
      tags: ['Java', 'Spring Boot', 'Thymeleaf', 'PostgreSQL', 'Docker'],
      url: 'https://www.schluessel-gruppe.de/',
      screenshot: '/projects/immobilien.svg',
      featured: false,
      problem: 'Immobilienmakler brauchten schnelle Projekt-Landingpages ohne Entwickler.',
      solution: 'Template-basierter Baukasten mit dynamischer Inhaltspflege.',
    },
  ] satisfies Project[],
};
