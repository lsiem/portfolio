# Quick Reference

Quick commands and references for working with this portfolio project.

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/lsiem/portfolio.git
cd portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🛠️ Development Commands

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🚀 Deployment Commands

```bash
# Commit changes
git add .
git commit -m "Your commit message"

# Push to GitHub (auto-deploys via Actions)
git push origin main

# Check deployment status
# Go to: https://github.com/lsiem/portfolio/actions
```

## 📝 Content Updates

### Update Personal Information

Edit `src/config/personal.js`:

```javascript
export const personalInfo = {
  email: 'your@email.com',
  github: 'https://github.com/username',
  linkedin: 'https://linkedin.com/in/username',
};
```

### Add/Edit Experience

In `src/config/personal.js`, update `experienceData`:

```javascript
experiences: [
  {
    title: "Position Title",
    company: "Company Name",
    company_url: "https://company.com",
    logo_path: "logo.png", // Place in public/logos/
    duration: "Month Year - Present",
    location: "Location",
    description: "Job description...",
    technologies: ["Tech1", "Tech2"]
  }
]
```

### Add/Edit Projects

In `src/config/personal.js`, update `projectsData`:

```javascript
projects: [
  {
    title: "Project Name",
    description: "Project description...",
    technologies: ["React", "Node.js"],
    github: "https://github.com/username/repo",
    live: "https://project-url.com",
    image: "project-image.jpg" // Place in src/assets/images/
  }
]
```

## 🎨 Styling Updates

### Update Colors

Edit `src/index.css`:

```css
@theme {
  --color-primary: #yourcolor;
  --color-secondary: #yourcolor;
}
```

### Component Styles

Edit individual component files in `src/components/`.

## 🌐 Domain Configuration

### Using Custom Domain (lsiem.de)

1. **vite.config.js**:
   ```javascript
   base: '/'
   ```

2. **public/CNAME**:
   ```
   lsiem.de
   ```

3. **DNS Records**: Add A records pointing to GitHub IPs

### Using GitHub Subdomain (username.github.io/portfolio)

1. **vite.config.js**:
   ```javascript
   base: '/portfolio/'
   ```

2. **Delete or rename** `public/CNAME`

## 🔧 Configuration Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Vite build configuration |
| `tailwind.config.js` | Tailwind CSS config (minimal with v4) |
| `eslint.config.js` | ESLint rules |
| `src/index.css` | Global styles & Tailwind v4 theme |
| `src/config/personal.js` | All content and personal data |
| `package.json` | Dependencies and scripts |

## 🐛 Troubleshooting

### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Styles Not Loading

1. Check `base` path in `vite.config.js`
2. Clear browser cache
3. Rebuild: `npm run build`

### GitHub Actions Failing

1. Check Actions tab for error logs
2. Verify all dependencies in `package.json`
3. Test build locally: `npm run build`

## 📊 File Structure Reference

```
portfolio/
├── .github/
│   ├── workflows/
│   │   └── deploy.yml          # GitHub Actions deployment
│   ├── ISSUE_TEMPLATE/         # Issue templates
│   └── pull_request_template.md
├── public/
│   ├── CNAME                    # Custom domain config
│   └── logos/                   # Company/project logos
├── src/
│   ├── components/              # React components (10 files)
│   ├── config/
│   │   └── personal.js          # All content here!
│   ├── hooks/                   # Custom hooks
│   ├── animations/              # GSAP/Framer Motion configs
│   └── utils/                   # Utility functions
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── DEPLOYMENT.md
├── LICENSE
└── README.md
```

## 🔗 Useful Links

- **Live Site**: [lsiem.de](https://lsiem.de)
- **Repository**: [github.com/lsiem/portfolio](https://github.com/lsiem/portfolio)
- **Actions**: [github.com/lsiem/portfolio/actions](https://github.com/lsiem/portfolio/actions)
- **Issues**: [github.com/lsiem/portfolio/issues](https://github.com/lsiem/portfolio/issues)

## 📚 Documentation

- [README.md](README.md) - Main documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) - Community standards

## 🎯 Common Tasks

### Update Content
1. Edit `src/config/personal.js`
2. Test: `npm run dev`
3. Commit and push

### Add New Component
1. Create in `src/components/`
2. Import in `App.jsx`
3. Add to lazy loading if non-critical

### Update Dependencies
```bash
npm update
npm audit fix
```

### Check Bundle Size
```bash
npm run build
# Check dist/ folder size
du -sh dist/
```

---

**Need more help?** Check the full [README](README.md) or open an [issue](https://github.com/lsiem/portfolio/issues).
