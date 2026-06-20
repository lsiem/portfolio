import type { SkillGroup } from './types';

export const skillsContent = {
  title: 'Meine Fähigkeiten',
  subtitle:
    'Ein umfassender Überblick über meine technischen Kompetenzen und Fachgebiete',
  groups: [
    {
      title: 'Webentwicklung',
      categories: [
        {
          categoryTitle: 'Frontend-Entwicklung',
          skills: [
            'Erstellung responsiver Benutzeroberflächen mit HTML5, CSS3 und modernem JavaScript',
            'Einsatz von Vaadin für Rich Internet Applications',
          ],
          softwareSkills: [
            { skillName: 'HTML5', iconId: 'simple-icons:html5' },
            { skillName: 'CSS3', iconId: 'simple-icons:css3' },
            { skillName: 'JavaScript', iconId: 'simple-icons:javascript' },
            { skillName: 'Vaadin', iconId: 'simple-icons:vaadin' },
          ],
        },
        {
          categoryTitle: 'Backend-Entwicklung',
          skills: [
            'Entwicklung robuster Server-Anwendungen in Java mit Spring Boot',
            'Nutzung von Python für leichte bis mittelschwere Server- und Client-Anwendungen',
          ],
          softwareSkills: [
            { skillName: 'Spring Boot', iconId: 'simple-icons:springboot' },
            { skillName: 'Python', iconId: 'simple-icons:python' },
            { skillName: 'Django', iconId: 'simple-icons:django' },
            { skillName: 'Flask', iconId: 'simple-icons:flask' },
          ],
        },
        {
          categoryTitle: 'API-Entwicklung',
          skills: [
            'Entwurf und Design von RESTful APIs mit Postman',
            'Realisierung von RESTful APIs mit Spring, Flask und FastAPI',
          ],
          softwareSkills: [
            { skillName: 'Postman', iconId: 'simple-icons:postman' },
            { skillName: 'FastAPI', iconId: 'simple-icons:fastapi' },
          ],
        },
      ],
    },
    {
      title: 'Datenbankverwaltung',
      categories: [
        {
          categoryTitle: 'Relationale Datenbanken',
          skills: [
            'Entwurf relationaler Datenbanken wie MySQL und PostgreSQL',
            'Entwicklung von Datenmodellen und komplexer Abfragen',
          ],
          softwareSkills: [
            { skillName: 'MySQL', iconId: 'simple-icons:mysql' },
            { skillName: 'PostgreSQL', iconId: 'simple-icons:postgresql' },
          ],
        },
        {
          categoryTitle: 'NoSQL-Datenbanken',
          skills: [
            'Speicherung und Verwaltung mit MongoDB und Redis',
            'Integration von NoSQL-Datenbanken in Anwendungen',
          ],
          softwareSkills: [
            { skillName: 'MongoDB', iconId: 'simple-icons:mongodb' },
            { skillName: 'Redis', iconId: 'simple-icons:redis' },
          ],
        },
      ],
    },
    {
      title: 'DevOps',
      categories: [
        {
          categoryTitle: 'CI/CD und Containerisierung',
          skills: [
            'Automatisierung von CI/CD-Pipelines mit Jenkins und GitLab CI',
            'Containerisierung und Orchestrierung mit Docker und Kubernetes',
          ],
          softwareSkills: [
            { skillName: 'Jenkins', iconId: 'simple-icons:jenkins' },
            { skillName: 'GitLab CI', iconId: 'simple-icons:gitlab' },
            { skillName: 'Docker', iconId: 'simple-icons:docker' },
            { skillName: 'Kubernetes', iconId: 'simple-icons:kubernetes' },
          ],
        },
        {
          categoryTitle: 'Cloud Dienste',
          skills: [
            'Bereitstellung von Anwendungen in AWS und Azure',
            'Migration von On-Premise-Anwendungen in die Cloud',
          ],
          softwareSkills: [
            { skillName: 'Amazon AWS', iconId: 'simple-icons:amazonaws' },
            { skillName: 'Azure', iconId: 'simple-icons:microsoftazure' },
          ],
        },
        {
          categoryTitle: 'Überwachung und Sicherheit',
          skills: [
            'Überwachung mit Prometheus und Grafana',
            'Integration von Sicherheitsprotokollen mit OWASP ZAP oder Nessus',
          ],
          softwareSkills: [
            { skillName: 'Prometheus', iconId: 'simple-icons:prometheus' },
            { skillName: 'Grafana', iconId: 'simple-icons:grafana' },
          ],
        },
      ],
    },
    {
      title: 'Serverkonfiguration',
      categories: [
        {
          categoryTitle: 'Linux-Server',
          skills: [
            'Aufbau und Konfiguration von Linux-Servern und Clustern',
            'Automatisierung mit Shell-Skripting und Ansible',
          ],
          softwareSkills: [
            { skillName: 'Linux', iconId: 'simple-icons:linux' },
            { skillName: 'Ansible', iconId: 'simple-icons:ansible' },
          ],
        },
        {
          categoryTitle: 'Windows Server',
          skills: [
            'Konfiguration von Windows Servern und Active Directory',
            'Automatisierung mit PowerShell',
          ],
          softwareSkills: [
            { skillName: 'Windows Server', iconId: 'simple-icons:windows' },
            { skillName: 'PowerShell', iconId: 'simple-icons:powershell' },
          ],
        },
      ],
    },
  ] satisfies SkillGroup[],
};
