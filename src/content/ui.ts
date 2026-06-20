export const uiText = {
  nav: {
    home: 'Start',
    skills: 'Skills',
    about: 'Über mich',
    experience: 'Erfahrung',
    projects: 'Projekte',
    contact: 'Kontakt',
  },
  hero: {
    greeting: 'Hi, Ich bin Lasse',
    typingRoles: ['Full-Stack', 'DevOps', 'Cloud'],
    ctaProjects: 'Projekte ansehen',
    ctaGithub: 'GitHub',
    terminalBadge: '{ }',
  },
  contact: {
    title: 'Kontakt',
    subtitle: 'Lass uns zusammenarbeiten',
    name: 'Name',
    email: 'E-Mail',
    message: 'Nachricht',
    submit: 'Nachricht senden',
    submitting: 'Wird gesendet…',
    success: 'Nachricht erfolgreich gesendet!',
    error: 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.',
    copyEmail: 'E-Mail kopieren',
    copied: 'Kopiert!',
  },
  projects: {
    filterAll: 'Alle',
    filterFeatured: 'Hauptprojekte',
    filterSide: 'Nebenprojekte',
    viewCaseStudy: 'Case Study',
    close: 'Schließen',
    problem: 'Problem',
    solution: 'Lösung',
    technologies: 'Technologien',
    visit: 'Projekt besuchen',
  },
  experience: {
    flipHint: 'Klicken für Details',
    back: 'Technologien',
  },
  loading: {
    title: 'Lasse Siemoneit',
    subtitle: 'Portfolio wird geladen…',
  },
  accessibility: {
    reducedMotion: 'Animationen reduzieren',
    customCursor: 'Custom Cursor',
    skipToContent: 'Zum Inhalt springen',
  },
  terminal: {
    title: 'Dev Terminal',
    placeholder: 'Befehl eingeben…',
    close: 'Terminal schließen',
  },
} as const;

export const navItems = [
  { id: 'home', label: uiText.nav.home, href: '#home' },
  { id: 'skills', label: uiText.nav.skills, href: '#skills' },
  { id: 'about', label: uiText.nav.about, href: '#about' },
  { id: 'experience', label: uiText.nav.experience, href: '#experience' },
  { id: 'projects', label: uiText.nav.projects, href: '#projects' },
  { id: 'contact', label: uiText.nav.contact, href: '#contact' },
] as const;

export type NavSectionId = (typeof navItems)[number]['id'];
