---
name: cook
description: >-
  PRD to user stories and implementation plan in one pass. Reads CLAUDE.MD,
  writes docs/user-stories.md and docs/implementation-plan.md. Use when the
  user says /cook, cook the project, plan from PRD, or before running the Coder
  command.
---

# Cook

Combined requirements + architecture workflow. Replaces separate story-generator and planner steps.

## When to use

- User invokes `/cook`
- Greenfield or phased build after PRD is ready (`CLAUDE.MD`)
- Before Coder — need stories and an implementation plan

## Instructions

1. Read `.claude/commands/cook.md` **in full** and follow it exactly.
2. Read `CLAUDE.MD` (or `AGENTS.md` if that is the project spec).
3. Execute all four Cook Progress steps; **always persist** both docs artifacts.
4. Summarize in chat: story count, plan steps, file paths.

## Outputs

| Artifact | Path |
|----------|------|
| User stories | `docs/user-stories.md` |
| Implementation plan | `docs/implementation-plan.md` |
| Timeline (optional) | `docs/timeline.md` |

## Next step

Run **Coder** — `.claude/commands/coder.md` — one implementation-plan step at a time.
