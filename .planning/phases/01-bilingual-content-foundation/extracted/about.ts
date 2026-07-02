import type { AboutContent } from './types';

export const aboutContent: AboutContent = {
  headline: 'Über mich',
  heroTagline:
    'Ich bin ein selbsterlernter und passionierter Full-Stack Software Entwickler mit einem Fokus auf die Entwicklung von Web- und Hybrid-Apps.',
  bio:
    'Ich bin ein leidenschaftlicher Entwickler, der ständig neue Technologien erlernt und anwendet, um innovative Lösungen zu schaffen. Mein Schwerpunkt liegt auf der Erstellung robuster, benutzerfreundlicher und skalierbarer Software, die sowohl technische als auch wirtschaftliche Anforderungen erfüllt.',
  stats: [
    { label: 'Jahre Erfahrung', value: 5, suffix: '+' },
    { label: 'Projekte', value: 7 },
    { label: 'Tech-Stacks', value: 15, suffix: '+' },
    { label: 'Kunden', value: 10, suffix: '+' },
  ],
};

export const profileImage = '/assets/me.svg';
