# Deployment Guide

## Vercel (Recommended)

This portfolio deploys to **Vercel** at the custom domain `lsiem.de`.

### Setup

1. Import the repository at [vercel.com](https://vercel.com)
2. Framework preset: **Vite**
3. Build command: `npm run build`
4. Output directory: `dist`
5. Node.js version: **20+**

### Domain

1. Open **Project Settings → Domains**
2. Add `lsiem.de`
3. Configure DNS records as shown by Vercel

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `RESEND_API_KEY` | Yes (production) | Resend API key for `/api/contact` |

Set the variable in Vercel Project Settings and locally via `.env.local` for `vercel dev`.

### Local API Development

```bash
npm install
vercel dev
```

The contact form posts to `/api/contact`, which is handled by the Vercel Serverless Function in `api/contact.ts`.

### CI

GitHub Actions runs `lint`, `build`, and `test` on pull requests via `.github/workflows/ci.yml`.

### Notes

- `vite.config.ts` uses `base: '/'` for the custom domain
- Static assets live in `public/`
- Replace placeholder SVG logos/screenshots in `public/logos/` and `public/projects/` with production assets when available
