import type { PersonalInfo } from './types';

export const personalInfo: PersonalInfo = {
  name: 'Lasse Siemoneit',
  title: 'Full-Stack Software Entwickler',
  email: 'info@lsiem.de',
  github: 'https://github.com/lsiem',
  linkedin: 'https://www.linkedin.com/in/lasse-siemoneit/',
};

export const hasSocialLink = (key: keyof Pick<PersonalInfo, 'github' | 'linkedin'>): boolean =>
  Boolean(personalInfo[key]?.trim());

export const getConfiguredSocialLinks = (): Array<{ key: 'github' | 'linkedin'; url: string }> =>
  (['github', 'linkedin'] as const)
    .filter((key) => hasSocialLink(key))
    .map((key) => ({ key, url: personalInfo[key] }));
