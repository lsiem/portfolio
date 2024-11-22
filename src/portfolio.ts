import { Skills } from "./types/portfolio";

// Website related settings
const settings = {
  isSplash: true, // Change this to false if you don't want Splash screen.
} as const;

//SEO Related settings
const seo = {
  title: "Lasse Siemoneit | Portfolio",
  description:
    "Ich bin ein selbsterlerneter und passionierter Full-Stack Software Entwickler mit einem Fokus auf die Entwicklung von Web- und Hybrid-Apps.",
  og: {
    title: "Lasse Siemoneit | Portfolio",
    type: "website",
    url: "https://lsiem.github.io",
  },
} as const;

//Home Page
const greeting = {
  title: "Hi, ich bin Lasse",
  logo_name: "Lasse Siemoneit",
  subTitle:
    "Ich bin ein selbsterlerneter und passionierter Full-Stack Software Entwickler mit einem Fokus auf die Entwicklung von Web- und Hybrid-Apps.",
  resumeLink:
    "https://drive.google.com/file/d/1ZvSjgNAqE6I3TBNOjo_ZfMYI7zyhhfy3/view?usp=sharing",
  portfolio_repository: "https://github.com/lsiem/portfolio",
  githubProfile: "https://github.com/lsiem",
} as const;

const socialMediaLinks = {
  github: "https://github.com/YourGithubUsername",
  linkedin: "https://www.linkedin.com/in/YourLinkedInUsername",
  gmail: "your.email@gmail.com",
  instagram: "https://www.instagram.com/YourInstagramUsername",
} as const;

const skills: Skills = {
  data: [
    {
      title: "Webentwicklung",
      categories: [
        {
          categoryTitle: "Frontend-Entwicklung",
          skills: [
            "⚡ Erstellung von responsiven Benutzeroberflächen mit HTML5, CSS3 und modernem JavaScript",
            "⚡ Einsatz von Vaadin für Rich Internet Applications",
          ],
          softwareSkills: [
            {
              skillName: "HTML5",
              fontAwesomeClassname: "simple-icons:html5",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "CSS3",
              fontAwesomeClassname: "simple-icons:css3",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "JavaScript",
              fontAwesomeClassname: "simple-icons:javascript",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Vaadin",
              fontAwesomeClassname: "simple-icons:vaadin",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        // ... rest of the skills data remains the same
      ],
    },
    // ... rest of the skills sections remain the same
  ],
};

// Experience Page
interface Experience {
  title: string;
  company: string;
  company_url: string;
  logo_path: string;
  duration: string;
  location: string;
  description: string;
  color?: string;
}

interface Project {
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

interface ExperienceSection {
  title: string;
  work?: boolean;
  mainProjects?: boolean;
  sideProjects?: boolean;
  experiences?: Experience[];
  projects?: Project[];
}

const experience: {
  title: string;
  subtitle: string;
  description: string;
  sections: ExperienceSection[];
} = {
  title: "Referenzen",
  subtitle: "Berufliche Tätigkeiten",
  description:
    "Mit 16 startete mein Weg als Consultant in einem Start-Up-Unternehmen. Hier beriet und betreute ich Firmen bei der Digitalisierung und Migration in die Cloud. Seit 5 Jahren bin ich als Full-Stack-Entwickler und DevOps Engineer tätig und habe viel Erfahrung gesammelt. Meine Expertise ist die Planung und Realisierung von Softwareprojekten und digitalen Infrastrukturen.",
  sections: [
    // ... experience sections remain the same
  ],
};

// Contact Page
const contactPageData = {
  contactSection: {
    title: "Kontaktiere mich",
    profile_image_path: "lasse_profile.webp",
    description:
      "Interessiert an meiner Arbeit? Ich freue mich auf deine Kontaktaufnahme für einen persönlichen Austausch.",
  },
  blogSection: {
    title: "Blog",
    subtitle:
      "Ich dokumentiere gerne einige meiner Erfahrungen auf meinem beruflichen Werdegang und teile mein technisches Wissen.",
    link: "https://blog.lsiem.de/",
    avatar_image_path: "blogs_image.svg",
  },
} as const;

const projects: Project[] = [
  // ... projects array remains the same
];

const about = {
  title: "Über mich",
  description:
    "Ich bin ein selbsterlerneter und passionierter Full-Stack Software Entwickler mit einem Fokus auf die Entwicklung von Web- und Hybrid-Apps. Ich bin ein leidenschaftlicher Entwickler, der ständig neue Technologien erlernt und anwendet, um innovative Lösungen zu schaffen. Mein Schwerpunkt liegt auf der Erstellung robuster, benutzerfreundlicher und skalierbarer Software, die sowohl technische als auch wirtschaftliche Anforderungen erfüllt.",
} as const;

export {
  settings,
  seo,
  greeting,
  socialMediaLinks,
  skills,
  experience,
  contactPageData,
  projects,
  about,
};
