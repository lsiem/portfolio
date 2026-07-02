import { describe, expect, it } from 'vitest';
import { projectsContent } from '@/content/projects';
import { projectSchema } from '@/content/validate';

describe('content schema', () => {
  it('validates all projects', () => {
    projectsContent.projects.forEach((project) => {
      expect(projectSchema.safeParse(project).success).toBe(true);
    });
  });
});
