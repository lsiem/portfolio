---
name: "source-command-phase-planning-and-documentation"
description: "Workflow command scaffold for phase-planning-and-documentation in portfolio."
---

# source-command-phase-planning-and-documentation

Use this skill when the user asks to run the migrated source command `phase-planning-and-documentation`.

## Command Template

# /phase-planning-and-documentation

Use this workflow when working on **phase-planning-and-documentation** in `portfolio`.

## Goal

Captures the workflow for planning, documenting, and updating project phases, requirements, and research. This includes creating, updating, and revising markdown files for project phases, research, requirements, and roadmaps.

## Common Files

- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/research/*.md`
- `.planning/phases/*/*.md`

## Suggested Sequence

1. Understand the current state and failure mode before editing.
2. Make the smallest coherent change that satisfies the workflow goal.
3. Run the most relevant verification for touched files.
4. Summarize what changed and what still needs review.

## Typical Commit Signals

- Create or update markdown files under .planning/ (e.g., REQUIREMENTS.md, ROADMAP.md, STATE.md)
- Add or revise research and plan files under .planning/research/ and .planning/phases/
- Optionally update .gitignore or related config if new files or directories are introduced

## Notes

- Treat this as a scaffold, not a hard-coded script.
- Update the command if the workflow evolves materially.
