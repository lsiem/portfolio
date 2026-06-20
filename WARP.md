# WARP.md — Portfolio Architecture

## Overview

Animation-first React/Vite/TypeScript SPA deployed on Vercel (`lsiem.de`).

## Stack

- React 19 + Vite 7 + TypeScript
- Tailwind CSS v4 (`@theme` tokens in `src/index.css`)
- Lenis + GSAP ScrollTrigger
- Framer Motion for UI micro-interactions
- React Three Fiber for the hero scene
- Resend via `api/contact.ts`

## Structure

```
src/
  content/          Typed content modules + Zod validation
  components/
    layout/         Header, SectionWrapper, ScrollProgress
    sections/       Hero, Skills, About, Experience, Projects, Contact
    ui/             Button, Modal, Badge, Toast, MagneticButton
    three/          HeroScene (lazy)
    easter-eggs/    DevTerminal
  hooks/            Lenis, GSAP scroll, contact form, motion prefs
  utils/            Motion helpers, cn()
api/
  contact.ts        Vercel Serverless → Resend
```

## Content

All copy and structured data live in `src/content/*.ts`. Experience and projects are separate datasets. Content is validated at import time via Zod schemas in `src/content/validate.ts`.

## Motion & Accessibility

- Reduced motion toggle in the header
- Lenis disabled when reduced motion is active
- Custom cursor only on fine pointers
- Modal focus trap + ESC close + `aria-live` for form status

## Commands

```bash
npm run dev        # Vite dev server
npm run build      # Typecheck + production build
npm run lint       # ESLint
npm run test       # Vitest unit tests
npm run test:e2e   # Playwright smoke tests
vercel dev         # Local API + frontend
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md). Production deploys happen through Vercel on push to `main`.
