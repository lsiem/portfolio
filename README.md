# Portfolio - Lasse Siemoneit

[![Deploy to GitHub Pages](https://github.com/lsiem/portfolio/actions/workflows/deploy.yml/badge.svg)](https://github.com/lsiem/portfolio/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

Personal portfolio website showcasing professional experience, projects, and skills as a Full-Stack Software Developer.

🌐 **Live Demo**: [lsiem.de](https://lsiem.de)

## 🚀 Tech Stack

- **Frontend**: React 19, Tailwind CSS v4
- **Animation**: GSAP with ScrollTrigger, Framer Motion
- **3D Graphics**: Spline
- **Build Tool**: Vite
- **Linting**: ESLint with React Hooks rules
- **Icons**: React Icons (Simple Icons, Font Awesome, Feather Icons, Tabler Icons, Lucide)
- **Performance**: Lazy loading, code splitting, reduced-motion support

## 📦 Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lsiem/portfolio.git
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:5173`

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality

## 🎨 Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS v4
- **Smooth Animations**: GSAP-powered scroll animations with ScrollTrigger and Framer Motion
- **Custom Cursor**: Interactive cursor with accessibility support
- **3D Graphics**: Spline integration for immersive hero section
- **Lazy Loading**: Code-splitting and lazy loading for optimal performance
- **Accessibility**: ARIA labels, keyboard navigation, focus management, reduced-motion support
- **Dark Theme**: Professional dark color scheme throughout
- **SEO Optimized**: Comprehensive meta tags, Open Graph, Twitter Cards, semantic HTML
- **Error Boundaries**: Robust error handling with ErrorBoundary component
- **Multi-Language Support**: German language interface (easily extendable)
- **Contact Form**: Custom contact form with validation (useContactForm hook)

## 📂 Project Structure

```text
portfolio/
├── public/                 # Static assets
│   └── logos/             # Company/project logos
├── src/
│   ├── animations/        # Animation variants and configurations
│   │   └── variants.js
│   ├── assets/            # Images and media files
│   │   └── images/
│   ├── components/        # React components
│   │   ├── AboutSection.jsx        # About/bio section
│   │   ├── ContactSection.jsx      # Contact form
│   │   ├── CustomCursor.jsx        # Custom cursor effect
│   │   ├── ErrorBoundary.jsx       # Error handling wrapper
│   │   ├── ExperienceSection.jsx   # Professional experience
│   │   ├── Header.jsx              # Navigation header
│   │   ├── HeroSection.jsx         # Landing/hero section
│   │   ├── ProjectCard.jsx         # Individual project card
│   │   ├── ProjectsSection.jsx     # Projects showcase
│   │   └── SkillsSection.jsx       # Skills/technologies
│   ├── config/            # Configuration files
│   │   └── personal.js    # Personal info, experience, and social links
│   ├── hooks/             # Custom React hooks
│   │   └── useContactForm.js
│   ├── utils/             # Utility functions
│   │   └── motion.js      # Motion/animation utilities
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles (Tailwind v4)
├── eslint.config.js       # ESLint configuration
├── tailwind.config.js     # Tailwind configuration
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies and scripts
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

### Deploy to GitHub Pages

This project is configured for automatic GitHub Pages deployment. See the detailed [Deployment Guide](DEPLOYMENT.md) for step-by-step instructions.

**Quick Start:**

#### Initial Setup

1. Create a new repository on GitHub (e.g., `portfolio`)

2. Add the repository as a remote:

```bash
git remote add origin https://github.com/lsiem/portfolio.git
```

3. Update `vite.config.js` with your repository name:

```javascript
export default defineConfig({
  base: '/portfolio/', // Replace 'portfolio' with your repo name
  plugins: [react(), tailwindcss()],
})
```

#### Deploy Using GitHub Actions (Recommended)

1. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. Push to GitHub:

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

3. Enable GitHub Pages:
   - Go to your repository settings
   - Navigate to **Pages** section
   - Under **Source**, select **GitHub Actions**

4. Your site will be available at: `https://lsiem.github.io/portfolio/`

#### Manual Deployment

Alternatively, use `gh-pages` for manual deployment:

```bash
npm install -D gh-pages
```

Add to `package.json`:

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

Deploy:

```bash
npm run deploy
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

### Deploy to Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## 📝 Configuration

### Personal Information & Content

All personal content is centralized in `src/config/personal.js`:

- **Contact Information**: Email, GitHub, LinkedIn, and other social links
- **Experience Data**: Professional work history with company details
- **Projects**: Portfolio projects with descriptions and technologies
- **Skills**: Technical skills and expertise areas

```javascript
export const personalInfo = {
  email: 'info@lsiem.de',
  github: 'https://github.com/lsiem',
  linkedin: 'https://www.linkedin.com/in/lasse-siemoneit/',
};
```

Update this file to customize all content throughout the portfolio.

### Tailwind CSS v4

This project uses Tailwind CSS v4 with the `@source` and `@theme` directives in `src/index.css`. Theme customization should be done in the CSS file rather than `tailwind.config.js`.

### SEO & Metadata

Update meta tags in `index.html` for SEO optimization:

- Page title and description
- Open Graph tags for social media
- Twitter Card metadata
- Canonical URL

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📚 Documentation

- **[Quick Reference](QUICK_REFERENCE.md)** - Common commands and quick tips
- **[Deployment Guide](DEPLOYMENT.md)** - Complete guide for deploying to GitHub Pages
- **[Contributing Guide](CONTRIBUTING.md)** - Guidelines for contributing to the project
- **[Setup Summary](SETUP_SUMMARY.md)** - Overview of project configuration
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community guidelines
- **[License](LICENSE)** - MIT License details

## 🤝 Contributing

While this is a personal portfolio, contributions for bug fixes and improvements are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

**Quick contribution steps:**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

### Lasse Siemoneit

- Website: [lsiem.de](https://lsiem.de)
- GitHub: [@lsiem](https://github.com/lsiem)
- LinkedIn: [Lasse Siemoneit](https://www.linkedin.com/in/lasse-siemoneit/)

## 🙏 Acknowledgments

- [GSAP](https://gsap.com/) - Animation library with ScrollTrigger
- [Framer Motion](https://www.framer.com/motion/) - React animation library
- [Spline](https://spline.design/) - 3D design and animation tool
- [React Icons](https://react-icons.github.io/react-icons/) - Comprehensive icon library (includes Simple Icons, Font Awesome, Feather Icons, Tabler Icons, Lucide, and more)
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vite](https://vitejs.dev/) - Next generation frontend tooling

> **Note**: This project previously used Font Awesome and Iconify as separate dependencies. We've since migrated to React Icons, which provides a unified interface to multiple icon sets including Font Awesome icons, eliminating the need for separate icon libraries.
