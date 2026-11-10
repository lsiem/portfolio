import type { MatrixCategory, MatrixSkill } from "./types";

/**
 * Full skill matrix: every rated entry from the two source spreadsheets
 * (software engineering + IT infrastructure). Entries that appear in both
 * sheets are listed once with the higher rating.
 *
 * Level: 1 = "+", 2 = "++", 3 = "+++", 4 = "++++".
 */

export const matrixCategories = [
  { id: "languages", area: "software", label: { de: "Programmiersprachen", en: "Programming languages" } },
  { id: "backend", area: "software", label: { de: "Backend & Frameworks", en: "Backend & frameworks" } },
  { id: "frontend", area: "software", label: { de: "Web-Frontend", en: "Web frontend" } },
  { id: "databases", area: "software", label: { de: "Datenbanken", en: "Databases" } },
  { id: "apis", area: "software", label: { de: "Schnittstellen & Datenformate", en: "APIs & data formats" } },
  { id: "ai", area: "software", label: { de: "KI & Automatisierung", en: "AI & automation" } },
  { id: "product", area: "software", label: { de: "Produkt & Projekt", en: "Product & project" } },
  { id: "quality", area: "software", label: { de: "Testing & Codequalität", en: "Testing & code quality" } },
  { id: "tooling", area: "software", label: { de: "IDEs & Build-Tools", en: "IDEs & build tools" } },
  { id: "data-science", area: "software", label: { de: "Data Science", en: "Data science" } },
  { id: "cms", area: "software", label: { de: "CMS & Fachanwendungen", en: "CMS & business apps" } },
  { id: "devops", area: "infra", label: { de: "DevOps & Container", en: "DevOps & containers" } },
  { id: "cloud", area: "infra", label: { de: "Cloud", en: "Cloud" } },
  { id: "server-os", area: "infra", label: { de: "Server-Betriebssysteme", en: "Server operating systems" } },
  { id: "virtualization", area: "infra", label: { de: "Virtualisierung", en: "Virtualization" } },
  { id: "scripting", area: "infra", label: { de: "Scripting", en: "Scripting" } },
  { id: "network", area: "infra", label: { de: "Netzwerk, VPN & Security", en: "Network, VPN & security" } },
  { id: "collaboration", area: "infra", label: { de: "Kollaboration & Microsoft 365", en: "Collaboration & Microsoft 365" } },
  { id: "client-os", area: "infra", label: { de: "Client & Mobile", en: "Client & mobile" } },
  { id: "storage", area: "infra", label: { de: "Storage & Backup", en: "Storage & backup" } },
] satisfies MatrixCategory[];

export const matrixSkills = [
  // Programmiersprachen
  { name: "Java", category: "languages", level: 4 },
  { name: "Python", category: "languages", level: 4 },
  { name: "TypeScript", category: "languages", level: 4 },
  { name: "JavaScript", category: "languages", level: 4 },
  { name: "SQL", category: "languages", level: 4 },
  { name: "HTML", category: "languages", level: 4 },
  { name: "CSS", category: "languages", level: 3 },
  { name: "XML", category: "languages", level: 3 },
  { name: "Kotlin", category: "languages", level: 2 },
  { name: "Go", category: "languages", level: 1 },
  { name: "C#", category: "languages", level: 1 },
  { name: "C", category: "languages", level: 1 },
  { name: "C++", category: "languages", level: 1 },
  { name: "PHP", category: "languages", level: 1 },
  { name: "SCSS (Sass)", category: "languages", level: 1 },

  // Backend & Frameworks
  { name: "Spring Boot", category: "backend", level: 4 },
  { name: "Spring", category: "backend", level: 4 },
  { name: "Hibernate", category: "backend", level: 4 },
  { name: "Vaadin", category: "backend", level: 4 },
  { name: "Java SE", category: "backend", level: 4 },
  { name: "Flask", category: "backend", level: 3 },
  { name: "FastAPI", category: "backend", level: 3 },
  { name: "Node.js", category: "backend", level: 3 },
  { name: "Django", category: "backend", level: 1 },
  { name: "Thymeleaf", category: "backend", level: 1 },
  { name: ".NET / .NET Core", category: "backend", level: 1 },
  { name: "ASP.NET Core", category: "backend", level: 1 },
  { name: "Entity Framework (Core)", category: "backend", level: 1 },
  { name: "Blazor", category: "backend", level: 1 },
  { name: "WinForms", category: "backend", level: 1 },

  // Web-Frontend
  { name: "React", category: "frontend", level: 2 },
  { name: "Tailwind CSS", category: "frontend", level: 2 },
  { name: "Bootstrap", category: "frontend", level: 2 },
  { name: "Next.js", category: "frontend", level: 1 },
  { name: "Angular", category: "frontend", level: 1 },
  { name: "Vue.js", category: "frontend", level: 1 },
  { name: "React Native", category: "frontend", level: 1 },
  { name: "jQuery", category: "frontend", level: 1 },

  // Datenbanken
  { name: "PostgreSQL", category: "databases", level: 4 },
  { name: "MySQL", category: "databases", level: 4 },
  { name: "MariaDB", category: "databases", level: 4 },
  { name: "MongoDB", category: "databases", level: 3 },
  { name: "Redis", category: "databases", level: 3 },
  { name: "SQLite", category: "databases", level: 3 },
  { name: "Microsoft SQL Server", category: "databases", level: 2 },
  { name: "Liquibase", category: "databases", level: 2 },
  { name: "Oracle Database", category: "databases", level: 1 },

  // Schnittstellen & Datenformate
  { name: "REST", category: "apis", level: 4 },
  { name: "JSON", category: "apis", level: 4 },
  { name: "WebSocket", category: "apis", level: 4 },
  { name: "Microsoft Azure (Schnittstellen)", nameEn: "Microsoft Azure (APIs)", category: "apis", level: 3 },

  // KI & Automatisierung
  { name: "Multi-Agenten-Architektur / MCP-Tool-Calling", nameEn: "Multi-agent architecture / MCP tool calling", category: "ai", level: 3 },
  { name: "RPA / Low-Code", category: "ai", level: 2 },

  // Produkt & Projekt
  { name: "Requirements Engineering", category: "product", level: 4 },
  { name: "Softwarearchitektur & Design", nameEn: "Software architecture & design", category: "product", level: 4 },
  { name: "Implementierung", nameEn: "Implementation", category: "product", level: 4 },
  { name: "Technische Projektleitung", nameEn: "Technical project lead", category: "product", level: 4 },
  { name: "Product Ownership", category: "product", level: 2 },
  { name: "Scrum", category: "product", level: 2 },
  { name: "Kanban", category: "product", level: 2 },
  { name: "Testmanagement", nameEn: "Test management", category: "product", level: 2 },
  { name: "Confluence", category: "product", level: 2 },
  { name: "Jira", category: "product", level: 1 },

  // Testing & Codequalität
  { name: "JUnit", category: "quality", level: 4 },
  { name: "Selenium", category: "quality", level: 4 },
  { name: "Unit Testing", category: "quality", level: 2 },
  { name: "JSLint", category: "quality", level: 2 },
  { name: "CppUnit", category: "quality", level: 1 },
  { name: "cppcheck", category: "quality", level: 1 },
  { name: "lint", category: "quality", level: 1 },

  // IDEs & Build-Tools
  { name: "Git", category: "tooling", level: 4 },
  { name: "IntelliJ IDEA", category: "tooling", level: 4 },
  { name: "PyCharm", category: "tooling", level: 4 },
  { name: "Visual Studio Code", category: "tooling", level: 4 },
  { name: "Javadoc", category: "tooling", level: 4 },
  { name: "Maven", category: "tooling", level: 3 },
  { name: "WebStorm", category: "tooling", level: 3 },
  { name: "PhpStorm", category: "tooling", level: 3 },
  { name: "Jupyter", category: "tooling", level: 3 },
  { name: "Eclipse", category: "tooling", level: 2 },
  { name: "Android Studio", category: "tooling", level: 2 },
  { name: "GCC", category: "tooling", level: 2 },
  { name: "clang", category: "tooling", level: 2 },
  { name: "Ant", category: "tooling", level: 1 },
  { name: "CMake", category: "tooling", level: 1 },
  { name: "Visual Studio", category: "tooling", level: 1 },
  { name: "NetBeans", category: "tooling", level: 1 },
  { name: "Qt Creator", category: "tooling", level: 1 },
  { name: "SQL Server Management Studio", category: "tooling", level: 1 },
  { name: "Unity", category: "tooling", level: 1 },

  // Data Science
  { name: "NumPy", category: "data-science", level: 2 },
  { name: "Matplotlib", category: "data-science", level: 2 },
  { name: "Pandas", category: "data-science", level: 1 },
  { name: "scikit-learn", category: "data-science", level: 1 },
  { name: "TensorFlow", category: "data-science", level: 1 },
  { name: "PyTorch", category: "data-science", level: 1 },

  // CMS & Fachanwendungen
  { name: "WordPress", category: "cms", level: 3 },
  { name: "Shopify", category: "cms", level: 2 },
  { name: "Pisa Sales CRM (Customizing)", category: "cms", level: 2 },

  // DevOps & Container
  { name: "Docker", category: "devops", level: 4 },
  { name: "GitLab CI/CD", category: "devops", level: 4 },
  { name: "Jenkins", category: "devops", level: 4 },
  { name: "Azure DevOps", category: "devops", level: 4 },
  { name: "OpenShift", category: "devops", level: 3 },
  { name: "Ansible", category: "devops", level: 3 },
  { name: "Prometheus / Grafana", category: "devops", level: 3 },
  { name: "Kubernetes", category: "devops", level: 2 },
  { name: "Podman (Red Hat DO188)", category: "devops", level: 2 },
  { name: "Terraform", category: "devops", level: 1 },
  { name: "Vagrant", category: "devops", level: 1 },
  { name: "Splunk", category: "devops", level: 1 },

  // Cloud
  { name: "Microsoft Azure", category: "cloud", level: 3 },
  { name: "Amazon Web Services", category: "cloud", level: 3 },
  { name: "Red Hat", category: "cloud", level: 3 },
  { name: "Google Cloud", category: "cloud", level: 1 },

  // Server-Betriebssysteme
  { name: "Debian", category: "server-os", level: 4 },
  { name: "Ubuntu Server", category: "server-os", level: 4 },
  { name: "CentOS", category: "server-os", level: 3 },
  { name: "Red Hat Enterprise Linux", category: "server-os", level: 2 },
  { name: "Windows Server 2022", category: "server-os", level: 2 },
  { name: "Windows Server 2019", category: "server-os", level: 2 },
  { name: "Windows Server Core", category: "server-os", level: 2 },
  { name: "openSUSE / SUSE Enterprise", category: "server-os", level: 1 },
  { name: "Embedded Linux", category: "server-os", level: 1 },

  // Virtualisierung
  { name: "Proxmox", category: "virtualization", level: 3 },
  { name: "KVM", category: "virtualization", level: 3 },
  { name: "VMware", category: "virtualization", level: 2 },
  { name: "Hyper-V", category: "virtualization", level: 2 },
  { name: "Oracle VirtualBox", category: "virtualization", level: 2 },
  { name: "Parallels Desktop", category: "virtualization", level: 2 },

  // Scripting
  { name: "Bash", category: "scripting", level: 3 },
  { name: "PowerShell", category: "scripting", level: 2 },
  { name: "cmd.exe", category: "scripting", level: 2 },
  { name: "Lua", category: "scripting", level: 1 },
  { name: "VBScript", category: "scripting", level: 1 },
  { name: "AutoHotkey", category: "scripting", level: 1 },

  // Netzwerk, VPN & Security
  { name: "WireGuard", category: "network", level: 3 },
  { name: "OpenVPN", category: "network", level: 3 },
  { name: "Mobile SSL VPN (WatchGuard)", category: "network", level: 3 },
  { name: "GlobalSign (PKI)", category: "network", level: 2 },
  { name: "Fortinet VPN", category: "network", level: 1 },
  { name: "Ubiquiti Dream Machine", category: "network", level: 1 },
  { name: "Broadcom (Routing/Switching)", category: "network", level: 1 },

  // Kollaboration & Microsoft 365
  { name: "Microsoft Teams", category: "collaboration", level: 4 },
  { name: "Microsoft 365 (Beratung)", nameEn: "Microsoft 365 (consulting)", category: "collaboration", level: 4 },
  { name: "Google Workspace", category: "collaboration", level: 3 },
  { name: "Slack", category: "collaboration", level: 2 },
  { name: "Zoom", category: "collaboration", level: 2 },
  { name: "Microsoft Intune", category: "collaboration", level: 2 },
  { name: "Exchange Online", category: "collaboration", level: 1 },
  { name: "Terminaldienste", nameEn: "Terminal services", category: "collaboration", level: 1 },

  // Client & Mobile
  { name: "macOS", category: "client-os", level: 4 },
  { name: "Android", category: "client-os", level: 4 },
  { name: "iOS", category: "client-os", level: 4 },
  { name: "Windows 10 / 11", category: "client-os", level: 3 },
  { name: "Linux Desktop (Debian, Ubuntu)", category: "client-os", level: 3 },

  // Storage & Backup
  { name: "Synology NAS", category: "storage", level: 2 },
  { name: "TrueNAS", category: "storage", level: 1 },
  { name: "Microsoft Azure Backup", category: "storage", level: 1 },
] satisfies MatrixSkill[];
