# Workflow Automate

Personal Next.js hub for daily automation workflows — starting with a Costco product search pipeline that exports Excel reports and updates PowerPoint slides.

**New here?** See **[GUIDE.md](./GUIDE.md)** for step-by-step local setup (written for non-developers using **Claude Code** — no GitHub or Node.js required to start). In the project folder, run `claude` and say **“Guide me through local setup”**.

## Quick start

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL before db:migrate
npm run generate:ppt-template
npm run db:migrate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the dashboard. Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Local-first development

Code changes stay on your machine until you choose to commit and deploy.

```bash
npm run dev
```

Use `.env.local` (not committed) for secrets. Pull shared DB credentials from Vercel when you need the remote Neon instance:

```bash
vercel env pull .env.local --environment=production --yes
```

| Layer | Local | Remote (optional) |
|-------|--------|-------------------|
| App code | `npm run dev` | Deploy when ready (see below) |
| Database | Neon via `DATABASE_URL` | `npm run db:migrate` |
| Costco API | `COSTCO_USE_MOCK=true` or real creds | — |
| Artifacts | `STORAGE_MODE=local` → `./output/{runId}/` | `BLOB_READ_WRITE_TOKEN` on Vercel |

**Workflow UI:** [http://localhost:3000/workflows/costco](http://localhost:3000/workflows/costco)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run dev:reset` | Clear `.next`, regenerate Prisma client, start dev |
| `npm run build` | Migrate DB, generate Prisma client, production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run ci` | Lint + typecheck + pipeline benchmark |
| `npm run db:migrate` | Apply Prisma migrations (`prisma migrate dev`) |
| `npm run db:studio` | Open Prisma Studio |
| `npm run generate:ppt-template` | Create starter PPT template |
| `npm run verify:excel` | Generate sample Excel fixtures |
| `npm run verify:ppt` | Generate sample PPT fixtures |
| `npm run verify:pipeline` | Benchmark 200-product export (< 5 min) |

## Project structure

```
workflow-automate/
├── app/                    # Next.js App Router (dashboard, workflows, API)
├── components/             # UI primitives + workflow components
├── lib/
│   ├── adapters/costco/    # Costco product source adapter
│   ├── exporters/          # Excel + PPT builders
│   ├── jobs/               # Async job orchestration
│   ├── storage/            # Vercel Blob + local artifact storage
│   └── mappers/            # Field mapping
├── prisma/                 # WorkflowRun, Artifact models
├── templates/              # PPT templates
└── docs/                   # PRD, user stories, implementation plan
```

## Environment

See [`.env.example`](./.env.example) for all variables. Minimum for local dev:

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL for jobs/runs |
| `STORAGE_MODE` | No | `local` (default dev) or `blob` |
| `COSTCO_USE_MOCK` | No | `true` for offline dev / CI |
| `PPT_TEMPLATE_PATH` | No | Defaults to `templates/costco-ongoing-products.pptx` |
| `BLOB_READ_WRITE_TOKEN` | Prod | Vercel Blob for artifact storage |

## CI

GitHub Actions runs on push/PR to `main`:

1. `npm ci`
2. `npm run generate:ppt-template`
3. `prisma migrate deploy` (Postgres service)
4. `npm run lint`
5. `npm run typecheck`
6. `npm run verify:pipeline` (200-product export under 5 minutes)
7. `npm run build`

Run locally: `npm run ci` (no database required for the benchmark portion).

## Deploy (Vercel)

**Production:** [https://workflow-automate.vercel.app](https://workflow-automate.vercel.app)

### Prerequisites

1. Vercel project linked to this repo
2. Neon (or Postgres) with `DATABASE_URL` set in Vercel env
3. `BLOB_READ_WRITE_TOKEN` for production artifact storage
4. Costco API credentials (`COSTCO_*`) or `COSTCO_USE_MOCK=true` for testing
5. PPT template available at deploy time (`templates/costco-ongoing-products.pptx` in repo, or custom `PPT_TEMPLATE_PATH`)

### Environment variables (Vercel dashboard)

Set for **Production** and **Preview**:

- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN`
- `STORAGE_MODE=blob`
- `COSTCO_USE_MOCK`, `COSTCO_CLIENT_IDENTIFIER`, `COSTCO_VISITOR_ID`, etc.
- `PPT_TEMPLATE_PATH` (if not using default)
- `NEXT_PUBLIC_APP_URL` (your deployment URL)

### Deploy commands

```bash
# Apply migrations to production DB (from machine with DATABASE_URL)
set -a && source .env.local && set +a && npx prisma migrate deploy

# Deploy via git push (recommended)
git push origin main

# Or manual deploy
vercel deploy --prod
```

`vercel.json` runs migrations during build and sets API `maxDuration` to 300s for long-running job polling/downloads.

### Health check

After deploy: `GET /api/health` should return `{ "ok": true, "db": "connected" }`.

## Documentation

- [CLAUDE.md](./CLAUDE.MD) — product & architecture spec (PRD)
- [docs/user-stories.md](./docs/user-stories.md) — acceptance criteria
- [docs/implementation-plan.md](./docs/implementation-plan.md) — build steps

## Agent workflow

1. `/cook` — PRD → user stories + implementation plan
2. `/coder` — implement one plan step at a time
