/* Change this file to get your personal Porfolio */

// Website related settings
const settings = {
  isSplash: true, // Change this to false if you don't want Splash screen.
};

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
};

//Home Page
const greeting = {
  title: "Hi, ich bin Lasse",
  logo_name: "AshutoshHathidara",
  subTitle:
    "Ich bin ein selbsterlerneter und passionierter Full-Stack Software Entwickler mit einem Fokus auf die Entwicklung von Web- und Hybrid-Apps.",
  resumeLink:
    "https://drive.google.com/file/d/1bXRknv_h-XI_3CQ3SGPteGODtvEb7YvI/view?usp=sharing",
  portfolio_repository: "https://github.com/lsiem/portfolio",
  githubProfile: "https://github.com/lsiem",
};

const socialMediaLinks = [
  /* Social Media Link */
  {
    name: "Github",
    link: "https://github.com/lsiem",
    fontAwesomeIcon: "fa-github", // Reference https://fontawesome.com/icons/github?style=brands
    backgroundColor: "#181717", // Reference https://simpleicons.org/?q=github
  },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/in/lasse-siemoneit-170ab7195/",
    fontAwesomeIcon: "fa-linkedin-in", // Reference https://fontawesome.com/icons/linkedin-in?style=brands
    backgroundColor: "#0077B5", // Reference https://simpleicons.org/?q=linkedin
  },
  {
    name: "Gmail",
    link: "mailto:lasse.siemoneit@gmail.com",
    fontAwesomeIcon: "fa-google", // Reference https://fontawesome.com/icons/google?style=brands
    backgroundColor: "#D14836", // Reference https://simpleicons.org/?q=gmail
  },
  {
    name: "Instagram",
    link: "https://www.instagram.com/lsiem0927/",
    fontAwesomeIcon: "fa-instagram", // Reference https://fontawesome.com/icons/instagram?style=brands
    backgroundColor: "#E4405F", // Reference https://simpleicons.org/?q=instagram
  },
];

const skills = {
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
        {
          categoryTitle: "Backend-Entwicklung",
          skills: [
            "⚡ Entwicklung robuster Server-Anwendungen in Java mit Spring Boot",
            "⚡ Nutzung von Python für leichte bis mittelschwere Server- und Client-Anwendungen",
          ],
          softwareSkills: [
            {
              skillName: "Java",
              fontAwesomeClassname: "fa-brands:java",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Spring Boot",
              fontAwesomeClassname: "simple-icons:spring",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Python",
              fontAwesomeClassname: "simple-icons:python",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "API-Entwicklung",
          skills: [
            "⚡ Entwurf und Design von RESTful APIs mit Postman",
            "⚡ Realisierung von RESTful APIs unter Verwendung von Spring oder Flask und FastAPI",
          ],
          softwareSkills: [
            {
              skillName: "Postman",
              fontAwesomeClassname: "simple-icons:postman",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Flask",
              fontAwesomeClassname: "simple-icons:flask",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "FastAPI",
              fontAwesomeClassname: "simple-icons:fastapi",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Datenbankverwaltung",
      categories: [
        {
          categoryTitle: "SQL-Datenbanken",
          skills: [
            "⚡ Entwurf und Design von relationalen Datenbanken wie MySQL und PostgreSQL",
            "⚡ Entwicklung von Datenmodellen und Durchführung komplexer Abfragen",
          ],
          softwareSkills: [
            {
              skillName: "MySQL",
              fontAwesomeClassname: "fontisto:mysql",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "PostgreSQL",
              fontAwesomeClassname: "simple-icons:postgresql",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
      ],
    },
    {
      title: "DevOps",
      categories: [
        {
          categoryTitle: "Continuous Integration / Continuous Deployment",
          skills: [
            "⚡ Versionsverwaltung mit Git und GitHub",
            "⚡ Einsatz von GitHub Actions, Azure DevOps oder Jenkins für CI/CD Pipelines",
          ],
          softwareSkills: [
            {
              skillName: "Git",
              fontAwesomeClassname: "simple-icons:git",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "GitHub",
              fontAwesomeClassname: "simple-icons:github",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Azure DevOps",
              fontAwesomeClassname: "simple-icons:azuredevops",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "Cloud Dienste",
          skills: [
            "⚡ Konfiguration und Verwalten von Azure Cloud Diensten",
            "⚡ Migration von On-Premise Diensten auf Cloud Dienste",
          ],
          softwareSkills: [
            {
              skillName: "Azure",
              fontAwesomeClassname: "simple-icons:microsoftazure",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Azure Functions",
              fontAwesomeClassname: "simple-icons:azurefunctions",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Azure Pipelines",
              fontAwesomeClassname: "simple-icons:azurepipelines",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Azure Artifacts",
              fontAwesomeClassname: "simple-icons:azureartifacts",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Cloud Migration",
              fontAwesomeClassname: "carbon:ibm-cloud-mass-data-migration",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "Überwachung und Sicherheit",
          skills: [
            "⚡ Integration von Sicherheitsprotokollen und - tools mit OWASP ZAP oder Nessus",
            "⚡ Nutzung von Tools wie Grafana oder Datadog zur Überwachung der Systemleistung",
          ],
          softwareSkills: [
            {
              skillName: "Prometheus",
              fontAwesomeClassname: "simple-icons:prometheus",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Grafana",
              fontAwesomeClassname: "simple-icons:grafana",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Datadog",
              fontAwesomeClassname: "simple-icons:datadog",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "OWASP ZAP",
              fontAwesomeClassname: "simple-icons:owasp",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Serverkonfiguration und -management",
      categories: [
        {
          categoryTitle: "Linux Server",
          skills: [
            "⚡ Aufbau und Konfiguration von Linux-Servern und Clustern",
            "⚡ Automatisierung von Routinetasks mittels Shell-Skripting",
          ],
          softwareSkills: [
            {
              skillName: "Linux",
              fontAwesomeClassname: "simple-icons:linux",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Shell-Scripting",
              fontAwesomeClassname: "simple-icons:gnubash",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "Windows Server",
          skills: [
            "⚡ Bereitstellen und Konfigurieren von Windows-Servern und Clustern",
            "⚡ Domain-Management und Active Directory Administration",
          ],
          softwareSkills: [
            {
              skillName: "Windows Server",
              fontAwesomeClassname: "simple-icons:windows",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "PowerShell",
              fontAwesomeClassname: "simple-icons:powershell",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Active Directory",
              fontAwesomeClassname: "carbon:directory-domain",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "Containerisierung und Orchestrierung",
          skills: [
            "⚡ Nutzung von Docker zur Containerisierung von Anwendungen",
            "⚡ Einsatz von Kubernetes für die Orchestrierung von Container-Deployments",
          ],
          softwareSkills: [
            {
              skillName: "Docker",
              fontAwesomeClassname: "simple-icons:docker",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Kubernetes",
              fontAwesomeClassname: "simple-icons:kubernetes",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
      ],
    },
    {
      title: "Consulting",
      categories: [
        {
          categoryTitle: "Technologieberatung",
          skills: [
            "⚡ Analyse und Optimierung von IT-Infrastrukturen",
            "⚡ Beratung zur digitalen Transformation und Cloud-Migration",
            "⚡ Implementierungsstrategien für moderne Technologielösungen",
          ],
          softwareSkills: [
            {
              skillName: "IT-Consulting",
              fontAwesomeClassname: "game-icons:teacher",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Digital Transformation",
              fontAwesomeClassname: "carbon:ibm-cloud-mass-data-migration",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
        {
          categoryTitle: "Sicherheitsberatung",
          skills: [
            "⚡ Entwicklung und Implementierung von Sicherheitsstrategien",
            "⚡ Risikobewertung und Compliance-Prüfungen",
            "⚡ Beratung zu Datenintegration und Informationssicherheit",
          ],
          softwareSkills: [
            {
              skillName: "Sicherheit",
              fontAwesomeClassname: "material-symbols:security",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Compliance",
              fontAwesomeClassname: "fluent-mdl2:compliance-audit",
              style: {
                color: "#3776AB",
              },
            },
            {
              skillName: "Data Integration",
              fontAwesomeClassname: "mingcute:file-security-fill",
              style: {
                color: "#3776AB",
              },
            },
          ],
        },
      ],
    },
  ],
};

// Experience Page
const experience = {
  title: "Experience",
  subtitle: "Work, Internship and Volunteership",
  description:
    "I have worked with many evolving startups as ML and DL Developer, Designer and Software Architect. I have also worked with some well established companies mostly as AI Developer. I love organising events and that is why I am also involved with many opensource communities as a representative.",
  header_image_path: "experience.svg",
  sections: [
    {
      title: "Work",
      work: true,
      experiences: [
        {
          title: "Machine Learning Engineer",
          company: "TikTok Inc.",
          company_url: "https://www.tiktok.com/en/",
          logo_path: "tiktok_logo.png",
          duration: "June 2023 - Present",
          location: "San Jose, CA, USA",
          description:
            "Improving ads ranking models on the core TikTok product. Experience working on modeling two-tower architectures like DeepFM, Wide & deep learning, etc. Working on Large Language Models (LLM) pretraining and Large Multi-modal Model (LMM) finetuning strategies.",
          color: "#000000",
        },
        {
          title: "Associate AI Engineer",
          company: "Legato Health Technology",
          company_url: "https://legatohealthtech.com/",
          logo_path: "legato_logo.png",
          duration: "June 2020 - Aug 2021",
          location: "Hyderabad, Telangana",
          description:
            "I am working on automating healthcare products. The projects involve automation for process improvements and for significantly enhancing the profits. I am currently working on Cancer Survival and Reoccurence Prediction. Our goal is to make AI system which scales and removes doctor dependency as much as possible.",
          color: "#0879bf",
        },
        {
          title: "Android and ML Developer",
          company: "Muffito Incorporation",
          company_url: "https://www.linkedin.com/company/muffito-inc/about/",
          logo_path: "muffito_logo.png",
          duration: "May 2018 - Oct 2018",
          location: "Pune, Maharashtra",
          description:
            "I have created complete Android Application for locating Pub, Bar and beverage shops around you. I have also worked on implementation of algorithms for Face Detection, Text extraction from Image. I was involved in a team for creating complete software architecure of mobile and web application as well as admin panel for company.",
          color: "#9b1578",
        },
        {
          title: "Android Developer",
          company: "FreeCopy Pvt. Ltd.",
          company_url: "https://www.linkedin.com/company/freecopy/about/",
          logo_path: "freecopy_logo.png",
          duration: "Nov 2017 - Dec 2017",
          location: "Ahmedabad, Gujarat",
          description:
            "FreeCopy is the Start up from Indian Institute of Management, Ahmedabad. I have changed the integration of the whole app from Google to Firebase. I learnt the efﬁcient ways of Data communications like Retroﬁt, Eventbus etc. I experienced the real time start up. I learnt the Design thinking of UI on perspective of People.",
          color: "#fc1f20",
        },
      ],
    },
    {
      title: "Internships",
      experiences: [
        {
          title: "Machine Learning Intern",
          company: "TikTok Inc.",
          company_url: "https://www.tiktok.com/en/",
          logo_path: "tiktok_logo.png",
          duration: "May 2022 - Aug 2022",
          location: "San Francisco, USA",
          description:
            "Building new features on the backend recommendation system, specifically ranking algorithms for Ads that touch hundreds of millions of people around the world. Improving online and offline content ranking algorithms by performing hard sample data replays for training steps.",
          color: "#000000",
        },
        {
          title: "Data Science Research Intern",
          company: "Delhivery Pvt. Ltd.",
          company_url: "https://www.delhivery.com/",
          logo_path: "delhivery_logo.png",
          duration: "May 2019 - Sept 2019",
          location: "Gurgaon, Haryana",
          description:
            "I have worked on project of predicting freight rates based on previous data. There were two objectives: (1) To build a forecasting engine to predict daily freight rates. (2) To embed feature in the model which can explain the seasonal major changes in freight rate based on regions and locations. I have closely worked with deep learning models in combination with statistical methods to create solution for this. At the end of internship, I had created model deployed on AWS EC2 with the use of Kafka stream jobs, ElasticSearch and PostgreSQL.",
          color: "#ee3c26",
        },
        {
          title: "Data Science Intern",
          company: "Intel Indexer LLC",
          company_url:
            "https://opencorporates.com/companies/us_dc/EXTUID_4170286",
          logo_path: "intel_logo.jpg",
          duration: "Nov 2018 - Dec 2018",
          location: "Work From Home",
          description:
            "This is financial Solution Company. I have made Supervised Learning model for the company which can perform time series analysis on Stock price data for 32 companies. I have built LSTM Neural Networks Model and trained the data of 32 companies for last 2 years. This model is also used for forecasting.",
          color: "#0071C5",
        },
      ],
    },
    {
      title: "Volunteerships",
      experiences: [
        {
          title: "Google Explore ML Facilitator",
          company: "Google",
          company_url: "https://about.google/",
          logo_path: "google_logo.png",
          duration: "June 2019 - April 2020",
          location: "Hyderabad, Telangana",
          description:
            "Explore Machine Learning (ML) is a Google-sponsored program for university students to get started with Machine Learning. The curriculum offers 3 tracks of ML Content (Beginner, Intermediate, Advanced) and relies on university student facilitators to train other students on campus and to build opensource projects under this program.",
          color: "#4285F4",
        },
        {
          title: "Microsoft Student Partner",
          company: "Microsoft",
          company_url: "https://www.microsoft.com/",
          logo_path: "microsoft_logo.png",
          duration: "Aug 2019 - May 2020",
          location: "Hyderabad, Telangana",
          description:
            "Microsoft Student Partner is a program for university students to lead the awareness and use of Cloud especially Azure tools in the development of their projects and startups. Under this program, I have organised hands on workshops and seminars to teach Cloud Computing concepts to students.",
          color: "#D83B01",
        },
        {
          title: "Mozilla Campus Captain",
          company: "Mozilla",
          company_url: "https://www.mozilla.org/",
          logo_path: "mozilla_logo.png",
          duration: "Oct 2019 - May 2020",
          location: "Kurnool, Andhra Pradesh",
          description:
            "My responsibility for this program was to create opensource environment in college and in the city. We have organised multiple hackathons on the problems collected by ordinary people from Kurnool city. We have build opensource community of our own college. The community is available at dsc_iiitdmk on github.",
          color: "#000000",
        },
        {
          title: "Developer Students Club Member",
          company: "DSC IIITDM Kurnool",
          company_url:
            "https://www.linkedin.com/company/developer-students-club-iiitdm-kurnool",
          logo_path: "dsc_logo.png",
          duration: "Jan 2018 - May 2020",
          location: "Kurnool, Andhra Pradesh",
          description:
            "We have well established developer club in college which is directly associated with Google Developers. We have developed many interdisciplinary projects under the membership of this club. We have organised workshops and activities on Android Application Development, Flutter and React JS.",
          color: "#0C9D58",
        },
        {
          title: "Developer Program Member",
          company: "Github",
          company_url: "https://github.com/",
          logo_path: "github_logo.png",
          duration: "July 2019 - PRESENT",
          location: "Work From Home",
          description:
            "I am actively contributing to many opensource projects. I have contributed to projects of organisations like Tensorflow, Uber, Facebook, Google, Scikit-learn, Kiwix, Sympy, Python, NVLabs, Fossasia, Netrack, Keras etc. These contributions include bug fixes, feature requests and formulating proper documentation for project.",
          color: "#181717",
        },
      ],
    },
  ],
};

// Contact Page
const contactPageData = {
  contactSection: {
    title: "Contact Me",
    profile_image_path: "animated_ashutosh.png",
    description:
      "I am available on almost every social media. You can message me, I will reply within 24 hours. I can help you with ML, AI, React, Android, Cloud and Opensource Development.",
  },
  blogSection: {
    title: "Blogs",
    subtitle:
      "I like to document some of my experiences in professional career journey as well as some technical knowledge sharing.",
    link: "https://blogs.ashutoshhathidara.com/",
    avatar_image_path: "blogs_image.svg",
  },
  addressSection: {
    title: "Address",
    subtitle: "Saratoga Ave, San Jose, CA, USA 95129",
    locality: "San Jose",
    country: "USA",
    region: "California",
    postalCode: "95129",
    streetAddress: "Saratoga Avenue",
    avatar_image_path: "address_image.svg",
    location_map_link: "https://maps.app.goo.gl/NvYZqa34Wye4tpS17",
  },
  phoneSection: {
    title: "",
    subtitle: "",
  },
};

export {
  settings,
  seo,
  greeting,
  socialMediaLinks,
  skills,
  experience,
  contactPageData,
};
