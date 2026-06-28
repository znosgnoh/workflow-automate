# Workflow Automate

Personal Next.js hub for daily automation workflows — starting with a Costco product search pipeline that exports Excel reports and updates PowerPoint slides.

## Quick start

```bash
npm install
cp .env.example .env.local   # set DATABASE_URL before db:migrate
npm run db:migrate           # Step 2+: apply Prisma migrations
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the dashboard. Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run db:migrate` | Apply Prisma migrations (`prisma migrate dev`) |
| `npm run db:studio` | Open Prisma Studio |

## Project structure

```
workflow-automate/
├── app/                    # Next.js App Router (dashboard, workflows UI)
├── lib/
│   ├── adapters/costco/    # Costco product source adapter
│   ├── exporters/
│   │   ├── excel/          # exceljs data + summary builder
│   │   └── ppt/            # Template-based PPT updater
│   ├── jobs/               # Async job orchestration
│   └── mappers/            # Field mapping config
├── prisma/                 # Schema: WorkflowRun, Artifact
├── templates/              # User PPT templates (gitignored if sensitive)
├── docs/
│   └── brainstorm/         # Workshop minutes & briefs
└── .claude/                # Agent commands (cook → coder)
```

## Documentation

- [CLAUDE.md](./CLAUDE.MD) — product & architecture spec (PRD)
- [docs/brainstorm/2026-06-28-project-brief.md](./docs/brainstorm/2026-06-28-project-brief.md) — workshop brief
- [docs/brainstorm/2026-06-28-meeting-minutes.md](./docs/brainstorm/2026-06-28-meeting-minutes.md) — workshop minutes

## Environment

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL for jobs/runs |
| `BLOB_READ_WRITE_TOKEN` | Yes (prod) | Generated file storage |
| `COSTCO_*` | TBD | Costco API credentials (pending user input) |

## Deploy

Target: **Vercel** with Vercel Postgres and Vercel Blob. Env vars in Vercel dashboard. Long-running file generation uses async jobs to stay within serverless limits.

## Next steps

1. Share Costco API details or existing script
2. Provide PPT template + Excel column/pivot spec
3. Run `/cook` → Coder (one implementation-plan step at a time)
