# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173) with hot reload
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint to check code quality

# Debugging port conflicts
lsof -ti:5173 | xargs kill -9    # Kill process on port 5173
npm run dev -- --port 3000      # Use different port

# Dependencies
npm ci                           # Clean install (faster, production-ready)
npm update                       # Update dependencies
npm audit fix                    # Fix security vulnerabilities
```

## Architecture Overview

This is a React 19 + Vite portfolio using Tailwind CSS v4 with advanced animation capabilities and accessibility considerations.

### Performance & Loading Strategy

- **Lazy Loading**: Non-critical components (Skills, About, Experience, Projects, Contact) are lazy-loaded using `React.lazy()` and `Suspense`
- **Critical Path**: Only Header, HeroSection, and CustomCursor load immediately
- **Code Splitting**: Automatic component-level code splitting via Vite

### Animation Architecture

**GSAP + ScrollTrigger Integration:**
- Main animation engine in `App.jsx` with proper cleanup (`ScrollTrigger.getAll().forEach(trigger => trigger.kill())`)
- Accessibility: All animations respect `prefers-reduced-motion` via `src/utils/motion.js`
- Utility functions for consistent motion behavior across components

**Framer Motion:**
- Component-level animations in `src/animations/variants.js`
- Reduced motion support built into all variants
- Staggered container animations for lists

### Styling Architecture

**Tailwind CSS v4:**
- Configuration via CSS `@theme` directive in `src/index.css` (not `tailwind.config.js`)
- Global theme tokens defined as CSS custom properties
- Semantic color system with HSL color functions

### State Management Patterns

**Custom Hooks:**
- `useContactForm`: Centralized form state, validation, and submission logic
- Shared between multiple components for consistent form behavior
- Includes error handling and success states

**Configuration-Driven Content:**
- All personal data centralized in `src/config/personal.js`
- Experience, projects, skills data as JavaScript objects
- Helper functions for social link management

### Error Handling

**ErrorBoundary Component:**
- Specifically designed for 3D Spline component failures
- Provides fallback UI with retry functionality
- Logs errors to console (extend for error reporting services)

### 3D Graphics Integration

**Spline Integration:**
- `@splinetool/react-spline` for 3D hero section
- Wrapped in ErrorBoundary for graceful degradation
- Performance optimized with lazy loading

## Content Management

**Personal Information:**
- Edit `src/config/personal.js` for all content updates
- Experience data structure includes company logos (place in `public/logos/`)
- Project images go in `src/assets/images/`
- Social links with conditional rendering based on configuration

**Logos and Assets:**
- Company logos: `public/logos/` (referenced by filename in personal.js)
- Project images: `src/assets/images/` (imported in components)
- Icons: React Icons, Font Awesome, Iconify packages

## Deployment

**GitHub Pages (Auto-Deployment):**
```bash
# Deploy process (automated on push to main)
git add .
git commit -m "Your changes"
git push origin main
# GitHub Actions builds and deploys automatically
```

**Domain Configuration:**
- Custom domain: `base: '/'` in vite.config.js + `public/CNAME`
- GitHub subdomain: `base: '/portfolio/'` + remove CNAME

**Build Process:**
- Node.js 20, npm ci for dependencies
- `npm run build` creates optimized dist/
- GitHub Actions workflow handles deployment to Pages

## Accessibility Features

- **Reduced Motion**: All animations check `prefers-reduced-motion`
- **Focus Management**: Custom focus indicators for all interactive elements
- **Custom Cursor**: Only enabled on pointer-capable devices
- **Semantic HTML**: ARIA labels and semantic structure
- **Keyboard Navigation**: Full keyboard accessibility

## Language & Internationalization

- Currently German language interface
- Validation messages and UI text in German
- Structure supports easy expansion to multi-language setup

## Key Dependencies

- **React 19** + **Vite 7** (latest versions)
- **Tailwind CSS v4** with Vite plugin
- **GSAP** with ScrollTrigger for scroll animations
- **Framer Motion** for component animations
- **Spline** for 3D graphics integration
- **ESLint 9** with React Hooks rules

## Development Notes

- ESLint configured for React 19 with hooks rules
- No test setup currently (extend with Vitest if needed)
- Bundle analysis: Check `dist/` folder size after build
- Custom cursor disabled on touch devices for better UX
- All animations use hardware acceleration for smooth performance