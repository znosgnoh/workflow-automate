# User Stories — Workflow Automate

**Project:** Personal Next.js automation hub — MVP: Costco Product Report pipeline  
**Source:** `CLAUDE.MD`  
**Date:** 2026-06-28

---

## Phase 1: Environment Initialization

### US-1.1: Bootstrap Next.js project
**As a** developer **I want** a Next.js App Router project with TypeScript, Tailwind, and ESLint **so that** all subsequent features share a consistent foundation.
**Acceptance Criteria:**
- [ ] Next.js (latest) initialized with App Router and TypeScript
- [ ] Tailwind CSS configured with mobile-first defaults in `globals.css`
- [ ] ESLint + `npm run lint` passes
- [ ] `npm run typecheck` script exists and passes
- [ ] `npm run build` succeeds on clean checkout

### US-1.2: Base layout and navigation shell
**As an** ops analyst **I want** a clean app shell with navigation **so that** I can access workflows from a single entry point.
**Acceptance Criteria:**
- [ ] Root layout with app title and minimal nav
- [ ] Dashboard route at `/` lists available workflows (Costco placeholder card)
- [ ] Responsive at 375px width; touch-friendly tap targets
- [ ] Semantic HTML: `main`, `nav`, heading hierarchy
- [ ] Empty state when no workflows have run yet

### US-1.3: Health check endpoint
**As a** developer **I want** a health check API **so that** deployment and local dev can verify the app is running.
**Acceptance Criteria:**
- [ ] `GET /api/health` returns `{ ok: true, timestamp }` when app is up
- [ ] Returns 503 with error body when `DATABASE_URL` is set but DB unreachable
- [ ] No secrets exposed in response body

### US-1.4: Environment documentation
**As a** developer **I want** documented env vars **so that** local setup and Vercel deploy are reproducible.
**Acceptance Criteria:**
- [ ] `.env.example` lists `DATABASE_URL`, `BLOB_READ_WRITE_TOKEN`, Costco placeholders
- [ ] README quick-start references `.env.example`
- [ ] No real secrets committed to repo

---

## Phase 2: Database & Jobs

### US-2.1: Workflow run persistence
**As an** ops analyst **I want** each pipeline run stored in the database **so that** I can track status and retrieve history.
**Acceptance Criteria:**
- [ ] `WorkflowRun` model: `id`, `workflowId`, `searchTerm`, `status`, `error`, `createdAt`, `completedAt`
- [ ] Status enum values: `pending`, `running`, `completed`, `failed`
- [ ] Initial migration applied; `lib/prisma.ts` singleton used everywhere
- [ ] Index on `workflowId` + `createdAt` for history queries

### US-2.2: Artifact metadata storage
**As an** ops analyst **I want** generated file metadata linked to runs **so that** I can download Excel and PPT from past runs.
**Acceptance Criteria:**
- [ ] `Artifact` model: `id`, `runId`, `type` (`xlsx` | `pptx`), `url`, `filename`, `createdAt`
- [ ] Foreign key to `WorkflowRun` with cascade delete
- [ ] Index on `runId`

### US-2.3: Create async workflow run
**As an** ops analyst **I want** to submit a search and get a run ID immediately **so that** long-running work does not block the UI.
**Acceptance Criteria:**
- [ ] Server Action or API route creates `WorkflowRun` with `status: pending`
- [ ] Input validated with Zod: `searchTerm` required, min 1 char, max 200 chars
- [ ] Returns `{ ok: true, runId }` or `{ ok: false, error }`
- [ ] Invalid input returns user-facing validation message (400)
- [ ] Triggers background job processor (does not block response)

### US-2.4: Job status polling
**As an** ops analyst **I want** to see live run progress **so that** I know when files are ready.
**Acceptance Criteria:**
- [ ] `GET /api/runs/[id]` returns run status, step label, error if failed, artifact list when complete
- [ ] Client polls every 2–3s while status is `pending` or `running`
- [ ] Polling stops on `completed` or `failed`
- [ ] Status changes announced to screen readers (`aria-live="polite"`)
- [ ] 404 for unknown run ID

### US-2.5: Job processor orchestration
**As a** developer **I want** a job processor that executes pipeline steps in order **so that** fetch → transform → Excel → PPT runs reliably.
**Acceptance Criteria:**
- [ ] Processor updates status to `running` at start
- [ ] Steps execute: fetch products → map fields → build Excel → build PPT → upload artifacts
- [ ] On success: `status: completed`, `completedAt` set
- [ ] On failure: `status: failed`, `error` message stored (no stack trace to client)
- [ ] Partial artifacts not marked complete if any step fails

### US-2.6: Run history list
**As an** ops analyst **I want** to see my last N runs **so that** I can re-download prior reports.
**Acceptance Criteria:**
- [ ] Dashboard or `/workflows/costco/history` lists last 20 runs
- [ ] Each row: search term, date, status badge, download links when complete
- [ ] Empty state: "No runs yet"
- [ ] Failed runs show error summary with option to retry (new run)

---

## Phase 3: Costco Pipeline (MVP Core)

### US-3.1: Costco product search adapter
**As an** ops analyst **I want** products fetched by keyword from Costco **so that** I don't manually browse and copy data.
**Acceptance Criteria:**
- [ ] `CostcoProductSource` interface in `lib/adapters/costco/types.ts`
- [ ] Implementation reads credentials from server env only
- [ ] Returns raw product array for search term
- [ ] Handles API timeout with retry (max 2) or clear failure
- [ ] Returns empty array (not error) when no products match
- [ ] Mock/stub adapter available for dev when Costco creds absent

### US-3.2: Config-driven field mapping
**As an** ops analyst **I want** API fields mapped to a consistent schema **so that** Excel and PPT always get the same columns.
**Acceptance Criteria:**
- [ ] Config JSON maps source keys → canonical fields
- [ ] Canonical Zod schema: `productName`, `originalPrice`, `promotionalPrice`, `manufacturer`, `expiryDate`, `sku`, `category`
- [ ] Unmapped source keys log warning server-side; do not fail run
- [ ] Missing required field (`productName`) skips row with warning count in run metadata
- [ ] Invalid price values coerced or flagged per config rules

### US-3.3: Excel data sheet export
**As an** ops analyst **I want** an Excel file with all product rows **so that** I can inspect raw data and share with colleagues.
**Acceptance Criteria:**
- [ ] **Data** sheet with header row matching canonical schema
- [ ] One row per mapped product; currency formatted for price columns
- [ ] Date columns formatted for `expiryDate`
- [ ] File named `{searchTerm}-{date}.xlsx` (sanitized filename)
- [ ] Builds successfully with 0, 1, and 200+ rows

### US-3.4: Excel summary sheet with chart
**As an** ops analyst **I want** a summary sheet with aggregation and chart **so that** I get pivot-style insight without manual Excel work.
**Acceptance Criteria:**
- [ ] **Summary** sheet with aggregation (default: count by `category`; configurable in workflow config)
- [ ] Embedded chart reflecting summary data (bar or column)
- [ ] Summary updates when data sheet changes
- [ ] Handles empty data: summary sheet shows "No data" message, no chart error

### US-3.5: PPT template-based slide update
**As an** ops analyst **I want** my PowerPoint template updated with ongoing products **so that** my slide deck stays in the approved format.
**Acceptance Criteria:**
- [ ] Template loaded from `templates/costco-ongoing-products.pptx` (or env path)
- [ ] Designated slide updated with product table: name, prices, manufacturer, expiry
- [ ] Row sort order configurable (default: `productName` asc)
- [ ] Max rows configurable to prevent overflow (default: 25)
- [ ] Output `.pptx` uploaded as artifact
- [ ] Clear error if template file missing with setup instructions

### US-3.6: Artifact upload and download
**As an** ops analyst **I want** generated files stored and downloadable **so that** I can open them in Excel and PowerPoint.
**Acceptance Criteria:**
- [ ] Excel and PPT uploaded to Vercel Blob (or local `./output` in dev without token)
- [ ] `Artifact` records created with blob URL and filename
- [ ] Download links on run detail and history views
- [ ] Downloads use correct MIME types
- [ ] Blob URLs not exposed in client bundle at build time

### US-3.7: Costco workflow UI — search and run
**As an** ops analyst **I want** a form to enter a search term and start a run **so that** I can trigger the pipeline in one click.
**Acceptance Criteria:**
- [ ] Route: `/workflows/costco`
- [ ] Form: search term input, Run button
- [ ] Submit disabled while run in progress for same session
- [ ] Validation error shown inline for empty/invalid term
- [ ] On submit: redirect or show inline progress panel with run ID
- [ ] Mobile: form usable at 375px; labels associated with inputs

### US-3.8: Costco workflow UI — progress and downloads
**As an** ops analyst **I want** to watch progress and download files when done **so that** I know the pipeline succeeded.
**Acceptance Criteria:**
- [ ] Progress steps displayed: Fetching → Mapping → Building Excel → Building PPT → Uploading
- [ ] Current step highlighted; completed steps checked
- [ ] On complete: download buttons for `.xlsx` and `.pptx`
- [ ] On failure: error message + "Try again" action
- [ ] Loading skeleton while initial run record loads

### US-3.9: Dashboard workflow card
**As an** ops analyst **I want** the dashboard to show Costco workflow status **so that** I see last run at a glance.
**Acceptance Criteria:**
- [ ] Card: "Costco Product Report" with link to `/workflows/costco`
- [ ] Shows last run: term, status, relative timestamp
- [ ] "No runs yet" when history empty
- [ ] Click navigates to workflow page

---

## Phase 4: Platform Extensibility (Post-MVP — documented for traceability)

### US-4.1: Workflow registry pattern
**As a** developer **I want** a registry of workflow definitions **so that** adding automation #2 doesn't duplicate job/artifact logic.
**Acceptance Criteria:**
- [ ] `lib/workflows/registry.ts` exports workflow metadata (id, name, route, handler)
- [ ] Costco registered as first entry
- [ ] Dashboard reads from registry (not hardcoded cards)

### US-4.2: Scheduled runs (deferred)
**As an** ops analyst **I want** optional scheduled runs **so that** weekly reports run without manual trigger.
**Acceptance Criteria:**
- [ ] Deferred to Phase 4; not in MVP cut line
- [ ] Documented as future Vercel Cron integration

---

## Phase 5: Production Readiness

### US-5.1: Error boundaries and logging
**As a** developer **I want** server errors logged and client errors contained **so that** failures are debuggable without breaking the whole app.
**Acceptance Criteria:**
- [ ] `app/error.tsx` and `app/global-error.tsx` for client boundaries
- [ ] Server errors logged with run ID context; no secrets in logs
- [ ] Client sees generic friendly message, not stack traces

### US-5.2: CI-ready scripts
**As a** developer **I want** lint, typecheck, and build in CI **so that** broken code doesn't deploy.
**Acceptance Criteria:**
- [ ] `package.json` scripts: `lint`, `typecheck`, `build`
- [ ] All pass on clean checkout with mock env
- [ ] Optional GitHub Actions workflow documented in README

### US-5.3: Accessibility pass
**As an** ops analyst using assistive tech **I want** forms and status updates accessible **so that** I can run workflows independently.
**Acceptance Criteria:**
- [ ] All form inputs have visible labels
- [ ] Focus states visible on interactive elements
- [ ] Job status region uses `aria-live="polite"`
- [ ] Color contrast meets WCAG AA for status badges

### US-5.4: Performance baseline
**As an** ops analyst **I want** runs under 200 products to finish within 5 minutes **so that** the tool meets the north-star metric.
**Acceptance Criteria:**
- [ ] Pipeline completes mock 200-product run in < 5 min locally
- [ ] No N+1 DB queries in history list
- [ ] Blob uploads run sequentially or with bounded concurrency

---

## Edge Case Summary (cross-cutting)

| Scenario | Expected behavior | Stories |
|----------|-------------------|---------|
| Empty search term | Inline validation error; no run created | US-3.7 |
| Costco API down | Run `failed`; error stored; retry available | US-3.1, US-2.5 |
| No products found | Run `completed`; Excel with empty Data sheet; PPT with empty table message | US-3.3, US-3.5 |
| Missing BLOB token in dev | Fall back to local `./output`; downloads via API route | US-3.6 |
| Missing PPT template | Run `failed` with setup message | US-3.5 |
| Unknown run ID polled | 404 JSON response | US-2.4 |
| Serverless timeout mid-run | Job remains `running` or marked `failed` on next poll; idempotent re-process TBD | US-2.5 |

**Total stories:** 24 (20 MVP must-have, 4 post-MVP/deferred)
