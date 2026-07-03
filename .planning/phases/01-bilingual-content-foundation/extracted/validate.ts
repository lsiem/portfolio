import { z } from 'zod';

export const projectSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  tags: z.array(z.string()).min(1),
  url: z.string().url(),
  screenshot: z.string().min(1),
  featured: z.boolean(),
  problem: z.string().optional(),
  solution: z.string().optional(),
});

export const experienceSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  companyUrl: z.string().url(),
  logoPath: z.string().min(1),
  duration: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(1),
  techStack: z.array(z.string()).min(1),
  color: z.string().optional(),
});

export function assertContentValid<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  label: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid ${label}: ${result.error.message}`);
  }
  return result.data;
}
