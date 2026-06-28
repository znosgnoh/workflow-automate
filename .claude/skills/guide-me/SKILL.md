---
name: guide-me
description: >-
  Walks new and non-technical users through workflow-automate local setup using
  the Claude desktop app or Claude Code CLI, including installing Node.js from
  scratch, downloading the project without GitHub, environment configuration,
  verification, and optional PR help. Use when the user says guide me, setup
  help, run locally, claude app, desktop app, first time setup, no github, no
  node, claude code, new contributor, or references GUIDE.md.
---

# Guide Me — Local Setup & Contributing

Help the user complete [GUIDE.md](../../../GUIDE.md). They may use the **Claude desktop app (Code tab, Local mode)**, the **terminal `claude` command**, or both — same skills and config. They may have **no GitHub account** and **no Node.js** yet. Use plain language. Run commands when possible. **Never** commit or expose secrets.

## First message — ask what they have

Before running anything, learn their situation. Use **AskQuestion** or short conversational questions:

1. **Computer?** (Mac / Windows / Linux)
2. **Using Claude desktop app or terminal?** (Desktop → Code tab → Local is fine)
3. **Node.js installed?** (`node -v` — if unknown, run it for them)
4. **Claude Code in terminal?** (`claude --version`) — skip if they only use desktop app
5. **Git installed?** (`git --version`) — optional for running; required for desktop Local on Windows
6. **GitHub account?** — optional for running; needed only for PRs
7. **Project on disk?** (ZIP unzip path, clone path, or not yet)
8. **DATABASE_URL?** (Neon or team-provided — block app setup until resolved)

Track progress:

```
Setup progress:
- [ ] Node.js 20+ installed
- [ ] Claude desktop app **or** `claude` CLI available
- [ ] Project folder on disk (ZIP or git)
- [ ] Project opened in Claude (desktop Local folder or terminal `cd`)
- [ ] npm install
- [ ] .env.local created
- [ ] DATABASE_URL set
- [ ] COSTCO_USE_MOCK=true (default) or real Costco creds
- [ ] generate:ppt-template + db:migrate
- [ ] npm run dev + /api/health OK
- [ ] Test run in browser
```

## Phase 0 — Tools from zero

### Node.js (required for this app)

The **workflow-automate app** needs Node.js even though Claude Code can be installed without it.

If `node -v` fails or is below v20:

1. Send user to https://nodejs.org — download **LTS**
2. Install, restart terminal
3. Re-check `node -v` and `npm -v`

Do not proceed to `npm install` until Node works.

### Claude Code (recommended)

If `claude` is missing, install per OS ([docs](https://code.claude.com/docs/en/setup)):

- **Mac/Linux:** `curl -fsSL https://claude.ai/install.sh | bash`
- **Windows PowerShell:** `irm https://claude.ai/install.ps1 | iex`

Remind: paid Anthropic plan required. First `claude` run logs in.

### Git & GitHub (optional for run-only)

- **No Git / no GitHub:** Guide ZIP download (GUIDE.md Phase 1 Option A)
- **GitHub only needed for PRs** — say this clearly so users don’t feel blocked

## Phase 1 — Get project without GitHub

If user has no Git:

1. Direct to https://github.com/znosgnoh/workflow-automate → **Code → Download ZIP**
2. Unzip to `Documents/workflow-automate` (or similar)
3. `cd` into that folder in terminal
4. Note: updates require re-download or installing Git later

If user has Git + access: `git clone https://github.com/znosgnoh/workflow-automate.git`

Confirm current working directory is project root (`package.json` exists).

## Phase 2 — Environment

1. Create `.env.local` from `.env.example`:
   - Mac/Linux: `cp .env.example .env.local`
   - Windows: `Copy-Item .env.example .env.local`
2. **Do not print** full secrets from `.env.local`
3. Default beginners to:
   - `STORAGE_MODE=local`
   - `COSTCO_USE_MOCK=true`
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000`
4. **DATABASE_URL** — ask user to create Neon (GUIDE.md Phase 5) or provide team string. **Stop and ask** if missing.

### Costco mode (AskQuestion)

- **Mock (default):** no Costco credentials
- **Real:** need `COSTCO_CLIENT_IDENTIFIER` + `COSTCO_VISITOR_ID` from team lead

Never guess tokens or database URLs.

## Phase 3 — Setup commands

Run in order; fix each failure before continuing:

```bash
npm install
npm run generate:ppt-template
npm run db:migrate
```

## Phase 4 — Run and verify

```bash
npm run dev
```

Check health (separate shell or background):

```bash
curl -s http://localhost:3000/api/health
```

Expect `"ok":true` and `"db":"connected"`.

Ask user to open http://localhost:3000/workflows/costco and run search `coconut`.

## Troubleshooting

| Symptom | Action |
|---------|--------|
| `node`/`npm` not found | Phase 0 Node install |
| `claude` not found | Phase 0 Claude Code install |
| `cp` fails on Windows | `Copy-Item` |
| DB errors | Fix `DATABASE_URL`, Neon dashboard |
| Costco not configured | `COSTCO_USE_MOCK=true` |
| Port 3000 in use | `npm run dev -- -p 3001` |
| Prisma stale | `npm run dev:reset` |

## Pull Requests (only when user wants to contribute)

Prerequisites: Git, GitHub account, repo access or fork.

If user has **no GitHub**:

- They can still edit and test locally
- Offer: zip changes or describe edits to team lead
- Optionally walk through github.com/signup when ready

If ready for PR:

1. `git checkout -b short-name`
2. Focused changes; `npm run lint` + `npm run typecheck` if code changed
3. Commit **only when user asks** — never `.env.local`
4. `git push -u origin BRANCH`
5. `gh pr create` if `gh` works; else GitHub UI steps from GUIDE.md

## Communication style

- Assume **non-technical** reader
- One step at a time; confirm before next
- Explain jargon: Node = “runs the app”, `.env.local` = “private settings file”, PR = “request to merge your changes”
- Celebrate health check + first successful run

## Reference

- [GUIDE.md](../../../GUIDE.md) — canonical user guide
- [README.md](../../../README.md) — technical details
- [.env.example](../../../.env.example) — env template
