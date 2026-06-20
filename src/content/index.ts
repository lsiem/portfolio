export { personalInfo, hasSocialLink, getConfiguredSocialLinks } from './personal';
export { aboutContent, profileImage } from './about';
export { skillsContent } from './skills';
export { experienceContent } from './experience';
export { projectsContent } from './projects';
export { uiText, navItems } from './ui';
export type { NavSectionId } from './ui';
export type * from './types';

import { experienceContent } from './experience';
import { projectsContent } from './projects';
import { assertContentValid, experienceSchema, projectSchema } from './validate';

projectsContent.projects.forEach((project) => {
  assertContentValid(projectSchema, project, `project "${project.id}"`);
});

experienceContent.experiences.forEach((experience, index) => {
  assertContentValid(experienceSchema, experience, `experience at index ${index}`);
});
