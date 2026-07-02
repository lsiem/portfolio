export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  github: string;
  linkedin: string;
}

export interface SoftwareSkill {
  skillName: string;
  iconId: string;
}

export interface SkillCategory {
  categoryTitle: string;
  skills: string[];
  softwareSkills: SoftwareSkill[];
}

export interface SkillGroup {
  title: string;
  categories: SkillCategory[];
}

export interface Experience {
  title: string;
  company: string;
  companyUrl: string;
  logoPath: string;
  duration: string;
  location: string;
  description: string;
  techStack: string[];
  color?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  url: string;
  screenshot: string;
  featured: boolean;
  problem?: string;
  solution?: string;
}

export interface AboutContent {
  headline: string;
  bio: string;
  heroTagline: string;
  stats: Array<{ label: string; value: number; suffix?: string }>;
}

export type ProjectFilter = 'all' | 'featured' | 'side';

export type SocialKey = 'github' | 'linkedin';
