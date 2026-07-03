---
name: project-initialization-and-rewrite
description: Workflow command scaffold for project-initialization-and-rewrite in portfolio.
allowed_tools: ["Bash", "Read", "Write", "Grep", "Glob"]
---

# /project-initialization-and-rewrite

Use this workflow when working on **project-initialization-and-rewrite** in `portfolio`.

## Goal

Describes the workflow for initializing a new project foundation or performing a major rewrite (e.g., switching frameworks, scaffolding, or extracting old content). Involves mass file creation, deletion, and configuration.

## Common Files

- `.gitignore`
- `.github/workflows/ci.yml`
- `package.json`
- `package-lock.json`
- `pnpm-lock.yaml`
- `next.config.ts`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Extract or archive old content files to a planning or extracted directory
- Delete obsolete source files, configs, and documentation
- Scaffold new project structure (e.g., create-next-app, Vite, etc.)
- Add or update configuration files (e.g., package.json, next.config.ts, tailwind.config.js, etc.)
- Install and configure dependencies

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.