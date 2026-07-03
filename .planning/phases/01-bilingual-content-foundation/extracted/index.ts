export { personalInfo, hasSocialLink, getConfiguredSocialLinks } from './personal';
export { aboutContent, profileImage } from './about';
export { skillsContent } from './skills';
export { experienceContent } from './experience';
export { projectsContent } from './projects';
export { uiText, navItems } from './ui';
export type { NavSectionId } from './ui';
export type * from './types';

// Validate content shape in development only, via a dynamic import so that zod
// and the schemas are never pulled into the production bundle (a static import
// would keep them in the graph even behind a dead `if (DEV)` branch). Shipping
// per-item runtime validation adds weight and risks a white screen on bad data;
// correctness is already locked in by content.test.ts in CI.
if (import.meta.env.DEV) {
  void Promise.all([
    import('./experience'),
    import('./projects'),
    import('./validate'),
  ]).then(([{ experienceContent }, { projectsContent }, { assertContentValid, experienceSchema, projectSchema }]) => {
    projectsContent.projects.forEach((project) => {
      assertContentValid(projectSchema, project, `project "${project.id}"`);
    });

    experienceContent.experiences.forEach((experience, index) => {
      assertContentValid(experienceSchema, experience, `experience at index ${index}`);
    });
  });
}
