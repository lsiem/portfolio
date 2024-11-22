export interface SoftwareSkill {
  skillName: string;
  fontAwesomeClassname?: string;
  imageSrc?: string;
  style?: {
    [key: string]: string | number;
  };
}

export interface SkillCategory {
  categoryTitle: string;
  skills: string[];
  softwareSkills: SoftwareSkill[];
}

export interface SkillData {
  title: string;
  categories: SkillCategory[];
}

export interface Skills {
  data: SkillData[];
}

export interface Experience {
  title: string;
  company: string;
  company_url: string;
  logo_path: string;
  duration: string;
  location: string;
  description: string;
  color?: string;
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ExperienceSection {
  title: string;
  work?: boolean;
  mainProjects?: boolean;
  sideProjects?: boolean;
  experiences?: Experience[];
  projects?: Project[];
}
