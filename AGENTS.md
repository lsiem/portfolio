<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent tooling: two lanes over one repo

This repo is worked on by two agent harnesses. Both read this file; git is the single source of truth.

- **Claude Code** — structural and planning-heavy work (GSD workflow, CodeGraph, Serena, Vercel). The primary lane.
- **Google Antigravity** (desktop IDE + `agy` CLI, bridged into Claude Code via the `agy` plugin) — visual/browser-driven iteration where its browser agent can render and verify UI.

Rules for both:

- **Never edit the working tree from both harnesses at once.** Work one lane per session and commit before switching.
- **Antigravity is build-time only.** Nothing it (or Gemini) produces may add a runtime Google/third-party call to the shipped site — lsiem.de is DSGVO-scoped, analytics stay cookieless, and Google Fonts must be self-hosted via `next/font`.
- **Local tooling stays out of git:** `google-cloud-sdk/`, `google-cloud-cli-*.tar.gz`, and `.antigravity/` are gitignored.
- **`agy` auth lives in the system keyring**, never in the repo.
