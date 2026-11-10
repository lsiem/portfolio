<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project rules

- lsiem.de is DSGVO-scoped: no runtime calls to third parties. Fonts are bundled locally, analytics stay cookieless.
- Content lives in `content/` and `messages/`; German and English must keep the same shape (`pnpm check:content`).
- The public repo must not contain internal system names, roadmap dates or model names of employers.
