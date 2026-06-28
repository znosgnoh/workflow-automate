# Implementation Plan — Workflow Automate

**Project:** Workflow Automate — Costco Product Report MVP  
**Source:** `CLAUDE.MD` + `docs/user-stories.md`  
**Date:** 2026-06-28

---

## 1. File Tree

```
workflow-automate/
├── app/
│   ├── layout.tsx                      # Root layout, nav, fonts
│   ├── page.tsx                        # Dashboard — workflow cards + last run
│   ├── globals.css                     # Tailwind imports, theme tokens
│   ├── error.tsx                       # Route error boundary
│   ├── global-error.tsx                # Root error boundary
│   ├── workflows/
│   │   └── costco/
│   │       ├── page.tsx                # Search form + active run panel
│   │       └── history/
│   │           └── page.tsx            # Run history table
│   └── api/
│       ├── health/
│       │   └── route.ts                # GET health + DB check
│       ├── runs/
│       │   ├── route.ts                # POST create run (optional alt to action)
│       │   └── [id]/
│       │       └── route.ts            # GET run status + artifacts
│       └── artifacts/
│           └── [id]/
│               └── download/
│                   └── route.ts        # Local dev file proxy (if no Blob)
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   └── skeleton.tsx
│   ├── layout/
│   │   ├── app-header.tsx
│   │   └── app-nav.tsx
│   └── workflows/
│       ├── workflow-card.tsx           # Dashboard card
│       ├── costco-search-form.tsx    # Client: form + validation
│       ├── run-progress.tsx          # Client: poll + step display
│       ├── run-history-table.tsx     # Server: history list
│       └── artifact-download-links.tsx
├── lib/
│   ├── prisma.ts                       # Prisma singleton
│   ├── utils/
│   │   ├── cn.ts                       # tailwind merge helper
│   │   └── filename.ts                 # Sanitize search term → filename
│   ├── validations/
│   │   ├── costco-run.ts               # Zod: create run input
│   │   └── product.ts                  # Zod: canonical product schema
│   ├── adapters/
│   │   └── costco/
│   │       ├── types.ts                # CostcoProductSource interface
│   │       ├── client.ts               # Real API implementation
│   │       ├── mock.ts                 # Dev stub
│   │       └── index.ts                # Factory: mock vs real by env
│   ├── mappers/
│   │   ├── field-mapper.ts             # Config JSON → canonical product[]
│   │   └── config/
│   │       └── costco-product-report.json
│   ├── exporters/
│   │   ├── excel/
│   │   │   ├── build-workbook.ts       # Data + Summary sheets + chart
│   │   │   └── summary-config.ts       # Aggregation dimensions
│   │   └── ppt/
│   │       ├── template-loader.ts
│   │       ├── slide-updater.ts        # Fill ongoing products table
│   │       └── index.ts
│   ├── storage/
│   │   ├── blob.ts                     # Vercel Blob upload
│   │   └── local.ts                    # Dev fallback ./output
│   ├── jobs/
│   │   ├── types.ts                    # JobStep enum, RunStatus
│   │   ├── create-run.ts               # DB insert + enqueue
│   │   ├── get-run.ts                  # Fetch run + artifacts
│   │   ├── list-runs.ts                # History query
│   │   └── processor.ts                # Pipeline orchestrator
│   └── workflows/
│       ├── registry.ts                 # Workflow metadata (Phase 4; stub in Step 3)
│       └── costco-product-report.ts    # Costco handler wiring
├── app/actions/
│   └── create-costco-run.ts            # Server Action: validate + create run
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── templates/
│   └── costco-ongoing-products.pptx    # User-provided (gitignored if sensitive)
├── config/
│   └── costco-field-map.json           # Field mapping config
├── output/                             # Local dev artifacts (gitignored)
├── docs/
│   ├── user-stories.md
│   └── implementation-plan.md
├── .env.example
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
└── vercel.json                         # Optional: maxDuration for API routes
```

---

## 2. Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum RunStatus {
  pending
  running
  completed
  failed
}

enum ArtifactType {
  xlsx
  pptx
}

model WorkflowRun {
  id          String       @id @default(cuid())
  workflowId  String
  searchTerm  String
  status      RunStatus    @default(pending)
  currentStep String?      // e.g. "fetching" | "mapping" | "excel" | "ppt" | "uploading"
  error       String?
  productCount Int?
  createdAt   DateTime     @default(now())
  completedAt DateTime?
  artifacts   Artifact[]

  @@index([workflowId, createdAt(sort: Desc)])
  @@index([status])
}

model Artifact {
  id        String       @id @default(cuid())
  runId     String
  run       WorkflowRun  @relation(fields: [runId], references: [id], onDelete: Cascade)
  type      ArtifactType
  url       String
  filename  String
  createdAt DateTime     @default(now())

  @@index([runId])
}
```

**Migration strategy:**
- Step 2: `npx prisma migrate dev --name init_workflow_runs`
- Production: `prisma migrate deploy` in Vercel build or post-deploy hook
- No seed required for MVP; mock adapter used in dev

---

## 3. Server Layer

### Server Actions

| Action | File | Input (Zod) | Output |
|--------|------|-------------|--------|
| `createCostcoRun` | `app/actions/create-costco-run.ts` | `{ searchTerm: string }` min 1 max 200 | `{ ok: true, runId }` \| `{ ok: false, error }` |

### API Routes

| Method | Route | Purpose | Response |
|--------|-------|---------|----------|
| GET | `/api/health` | Liveness + optional DB ping | `{ ok, db?, timestamp }` |
| GET | `/api/runs/[id]` | Poll run status | `{ id, status, currentStep, error?, artifacts[], productCount? }` |
| GET | `/api/artifacts/[id]/download` | Local dev download proxy | File stream (only when `STORAGE_MODE=local`) |

### Zod Schemas

```typescript
// lib/validations/costco-run.ts
createCostcoRunSchema = z.object({
  searchTerm: z.string().trim().min(1).max(200),
});

// lib/validations/product.ts
canonicalProductSchema = z.object({
  productName: z.string(),
  originalPrice: z.number().nullable(),
  promotionalPrice: z.number().nullable(),
  manufacturer: z.string().nullable(),
  expiryDate: z.coerce.date().nullable(),
  sku: z.string().nullable(),
  category: z.string().nullable(),
});
```

### Job Processor Flow (`lib/jobs/processor.ts`)

```
1. set status=running, currentStep=fetching
2. raw = costcoAdapter.search(searchTerm)
3. currentStep=mapping → products = fieldMapper(raw)
4. currentStep=excel → buffer = excelBuilder(products, config)
5. currentStep=ppt → buffer = pptBuilder(products, templatePath)
6. currentStep=uploading → upload both → create Artifact rows
7. set status=completed, completedAt=now, productCount=len(products)
   OR on throw: status=failed, error=safeMessage
```

**Trigger:** After `createCostcoRun`, call `processRun(runId)` via:
- `waitUntil(processRun(runId))` from `@vercel/functions` on Vercel, OR
- Fire-and-forget async in dev with error handling

---

## 4. UI Components

| Component | Type | Responsibility |
|-----------|------|----------------|
| `AppHeader` | Server | Title, nav links (Dashboard, Costco) |
| `WorkflowCard` | Server | Name, description, last run summary, link |
| `CostcoSearchForm` | Client | Controlled input, submit → Server Action, disable while pending |
| `RunProgress` | Client | Poll `/api/runs/[id]` every 2s; step checklist; aria-live region |
| `ArtifactDownloadLinks` | Server/Client | Render download buttons from artifact URLs |
| `RunHistoryTable` | Server | Fetch last 20 runs; status badges; links |
| `Badge` | Server | Status colors: pending=gray, running=blue, completed=green, failed=red |
| `Skeleton` | Server | Loading placeholders for dashboard and run panel |

### Pages

| Route | Server/Client mix | Data |
|-------|-------------------|------|
| `/` | Server | Registry/workflows list, latest run per workflow |
| `/workflows/costco` | Server shell + Client form/progress | Optional `?runId=` query for active run |
| `/workflows/costco/history` | Server | `listRuns({ workflowId, limit: 20 })` |

**GSAP:** Not in MVP scope — no animation dependencies in Phase 1–3.

---

## 5. Integrations

| Integration | Implementation | Env vars |
|-------------|----------------|----------|
| Costco product source | `lib/adapters/costco/` — interface + mock + real client | `COSTCO_API_URL`, `COSTCO_API_KEY`, `COSTCO_USE_MOCK=true` |
| Vercel Blob | `@vercel/blob` put() in `lib/storage/blob.ts` | `BLOB_READ_WRITE_TOKEN` |
| Local storage fallback | Write to `output/{runId}/` when no blob token | `STORAGE_MODE=local` |
| PostgreSQL | Prisma via Vercel Postgres | `DATABASE_URL` |
| PPT template | File at `templates/costco-ongoing-products.pptx` or `PPT_TEMPLATE_PATH` | `PPT_TEMPLATE_PATH` |

**Excel library:** `exceljs` — Data sheet, Summary sheet with `addRow` aggregation, `addChart` for column chart.

**PPT library:** Start with `pptxgenjs` reading template via `jszip` unzip + XML patch, OR `officegen`/`pptx-automizer` if template fidelity requires. Spike in Step 5; fallback: generate new deck matching layout if template patch is blocked.

---

## 6. Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."

# Storage
BLOB_READ_WRITE_TOKEN=""          # Optional in dev → local fallback
STORAGE_MODE="blob"               # "blob" | "local"

# Costco
COSTCO_USE_MOCK="true"            # Dev default
COSTCO_API_URL=""
COSTCO_API_KEY=""

# PPT
PPT_TEMPLATE_PATH="templates/costco-ongoing-products.pptx"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Vercel:** Set env vars in dashboard; add `vercel.json` with `"functions": { "app/api/**/*.ts": { "maxDuration": 300 } }` for job trigger route if needed.

---

## 7. Implementation Steps

### Step 1: Environment initialization
**Goal:** Runnable Next.js shell with health check and dashboard placeholder.  
**Stories:** US-1.1, US-1.2, US-1.3, US-1.4

**Files to create:**
- Scaffold via `create-next-app@latest` (TypeScript, Tailwind, ESLint, App Router, `src/` = **no**)
- `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- `components/layout/app-header.tsx`
- `components/workflows/workflow-card.tsx` (static Costco card)
- `app/api/health/route.ts`
- `.env.example`, update `README.md` scripts section
- `lib/utils/cn.ts`
- `package.json` scripts: `"typecheck": "tsc --noEmit"`

**Verify:**
```bash
npm install
npm run lint
npm run typecheck
npm run build
curl http://localhost:3000/api/health
```

---

### Step 2: Database architecture
**Goal:** Prisma models, migrations, singleton client.  
**Stories:** US-2.1, US-2.2

**Files to create/modify:**
- `prisma/schema.prisma` (full schema above)
- `lib/prisma.ts`
- `lib/jobs/types.ts` (RunStatus, JobStep re-exports)
- Run migration

**Verify:**
```bash
npx prisma migrate dev --name init_workflow_runs
npx prisma studio  # inspect empty tables
npm run build
```

---

### Step 3: Job layer — create, poll, list
**Goal:** Async run lifecycle without pipeline logic yet.  
**Stories:** US-2.3, US-2.4, US-2.5 (stub processor), US-2.6

**Files to create:**
- `lib/validations/costco-run.ts`
- `lib/jobs/create-run.ts`
- `lib/jobs/get-run.ts`
- `lib/jobs/list-runs.ts`
- `lib/jobs/processor.ts` (stub: mark completed after 2s delay)
- `app/actions/create-costco-run.ts`
- `app/api/runs/[id]/route.ts`
- `components/workflows/costco-search-form.tsx`
- `components/workflows/run-progress.tsx`
- `components/workflows/run-history-table.tsx`
- `app/workflows/costco/page.tsx`
- `app/workflows/costco/history/page.tsx`
- Update `app/page.tsx` with last run from DB

**Verify:**
```bash
npm run dev
# Submit search → run created → poll returns completed (stub)
# History page lists run
npm run build
```

---

### Step 4: Costco adapter + field mapper
**Goal:** Fetch (or mock) products and map to canonical schema.  
**Stories:** US-3.1, US-3.2

**Files to create:**
- `lib/adapters/costco/types.ts`
- `lib/adapters/costco/mock.ts` (10 sample products for "coconut", etc.)
- `lib/adapters/costco/client.ts` (real API — placeholder until user provides endpoint)
- `lib/adapters/costco/index.ts`
- `lib/validations/product.ts`
- `lib/mappers/field-mapper.ts`
- `config/costco-field-map.json`
- Wire into `processor.ts` steps 1–2

**Verify:**
```bash
COSTCO_USE_MOCK=true npm run dev
# Run pipeline → processor logs productCount > 0
# Failed mapping logs warnings in server console
```

---

### Step 5: Excel exporter
**Goal:** Generate `.xlsx` with Data + Summary + chart.  
**Stories:** US-3.3, US-3.4

**Files to create:**
- `lib/exporters/excel/build-workbook.ts`
- `lib/exporters/excel/summary-config.ts`
- `lib/utils/filename.ts`
- Add `exceljs` dependency
- Wire processor step 3

**Verify:**
```bash
# Manual script or run via UI → inspect output xlsx locally
# 0 products: empty data sheet, summary message
# 50 products: chart renders
npm run build
```

---

### Step 6: PPT exporter + storage
**Goal:** Template-based PPT + upload to Blob/local.  
**Stories:** US-3.5, US-3.6

**Files to create:**
- `lib/exporters/ppt/template-loader.ts`
- `lib/exporters/ppt/slide-updater.ts`
- `lib/exporters/ppt/index.ts`
- `lib/storage/blob.ts`
- `lib/storage/local.ts`
- `templates/costco-ongoing-products.pptx` (placeholder or user file)
- `app/api/artifacts/[id]/download/route.ts` (local mode)
- Wire processor steps 4–5
- Add `@vercel/blob` dependency

**Verify:**
```bash
STORAGE_MODE=local npm run dev
# Complete run → files in output/{runId}/
# Artifact records populated
# Download links work
npm run build
```

---

### Step 7: UI polish — dashboard, progress, accessibility
**Goal:** Complete MVP UX per PRD.  
**Stories:** US-3.7, US-3.8, US-3.9, US-5.3

**Files to create/modify:**
- `components/ui/button.tsx`, `input.tsx`, `badge.tsx`, `card.tsx`, `skeleton.tsx`
- Refine `RunProgress` step labels matching processor `currentStep`
- `components/workflows/artifact-download-links.tsx`
- Dashboard last-run query optimization
- `aria-live` on progress component
- Empty/error states on all pages

**Verify:**
```bash
npm run dev
# Full flow: search "coconut" → progress steps → download xlsx + pptx
# 375px viewport manual check
npm run lint && npm run typecheck && npm run build
```

---

### Step 8: Production readiness
**Goal:** Error handling, CI scripts, docs.  
**Stories:** US-5.1, US-5.2, US-5.4

**Files to create/modify:**
- `app/error.tsx`, `app/global-error.tsx`
- `vercel.json` (maxDuration if needed)
- `.github/workflows/ci.yml` (optional)
- Finalize `.env.example`, README deploy section
- Processor error messages sanitized

**Verify:**
```bash
npm run lint
npm run typecheck
npm run build
# Simulate Costco failure → run status failed, no stack in UI
```

---

## 8. Step → Story Traceability

| Step | Story IDs |
|------|-----------|
| 1 | US-1.1, US-1.2, US-1.3, US-1.4 |
| 2 | US-2.1, US-2.2 |
| 3 | US-2.3, US-2.4, US-2.5, US-2.6, US-3.7 (partial) |
| 4 | US-3.1, US-3.2 |
| 5 | US-3.3, US-3.4 |
| 6 | US-3.5, US-3.6 |
| 7 | US-3.7, US-3.8, US-3.9, US-5.3 |
| 8 | US-5.1, US-5.2, US-5.4 |

**Post-MVP (not scheduled):** US-4.1, US-4.2 → Phase 4 after MVP ship.

---

## 9. Dependencies (npm)

```json
{
  "dependencies": {
    "@prisma/client": "latest",
    "@vercel/blob": "latest",
    "exceljs": "latest",
    "zod": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "prisma": "latest",
    "typescript": "latest"
  }
}
```

Add PPT library after Step 6 spike (`pptxgenjs`, `pptx-automizer`, or `jszip` + manual XML).

---

## 10. Open Implementation Decisions (resolve during coding)

| # | Decision | Default for Coder |
|---|----------|-------------------|
| 1 | Costco real API shape unknown | Ship mock adapter; `client.ts` with TODO interface matching user sample JSON |
| 2 | PPT template fidelity | Try `pptx-automizer` first; document fallback |
| 3 | Summary pivot dimension | Group by `category`, count products, sum `promotionalPrice` |
| 4 | Job trigger on Vercel | `waitUntil` from `@vercel/functions` in Server Action |

---

## Handoff

Run **Coder** (`.claude/commands/coder.md`) starting with **Step 1**. Do not skip steps. Each step must pass verification commands before proceeding.
