# Lasse Siemoneit — Portfolio

Animation-first portfolio built with React 19, Vite, TypeScript, Tailwind CSS v4, GSAP, Framer Motion, Lenis, and React Three Fiber.

## Features

- Single-page layout: Hero, Skills, About, Experience, Projects, Contact
- Typed content architecture in `src/content/`
- Resend-backed contact form via `api/contact.ts`
- Reduced-motion support, custom cursor, particle background, dev terminal easter egg
- Vitest unit tests, Playwright smoke tests, GitHub Actions CI

## Development

```bash
npm install
npm run dev
```

For the contact API locally:

```bash
vercel dev
```

## Scripts

```bash
npm run build
npm run lint
npm run test
npm run test:e2e
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md). Production target: Vercel at `lsiem.de`.
