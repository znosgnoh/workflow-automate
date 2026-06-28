# Workshop Minutes — Workflow Automate
**Date:** 2026-06-28  
**Facilitator:** Sam Taylor (Meeting Assistant)  
**Idea under review:** Next.js hub for personal automation workflows; MVP = Costco product search → Excel export with pivot summary → PPT slide update

## Attendees
Elena Vasquez (PO) · Marcus Chen (UX) · Priya Sharma (BA) · Jordan Okonkwo (Growth) · Lars Bergström (Architect) · Alex Rivera (Engineer) · Sam Taylor (MA)

## Agenda
1. Problem & vision
2. Users & requirements
3. Growth & metrics
4. Architecture & feasibility
5. MVP scope
6. Risks & open questions

## Key Decisions
| # | Decision | Owner | Rationale |
|---|----------|-------|-----------|
| D1 | Product is a **personal workflow hub**, not a multi-tenant SaaS in v1 | Elena (PO) | User is sole operator; auth/multi-tenant adds weeks with no v1 value |
| D2 | MVP workflow = **Costco Product Report Pipeline** only | Elena (PO) | Proves the platform pattern before adding other daily automations |
| D3 | **Pre-compute pivot summary in code**, write to Excel summary sheet; defer native Excel pivot-table refresh | Lars + Alex | ExcelJS/pptxgenjs cannot reliably create/refresh Excel pivot objects; pre-aggregation matches user outcome |
| D4 | PPT updates via **template + placeholder replacement** (pptxgenjs or python-pptx sidecar) | Lars | User has a fixed slide format; template-driven beats building slides from scratch |
| D5 | Costco integration as **pluggable adapter** behind `CostcoProductSource` interface | Lars | API may be unofficial/scraped; adapter isolates breakage |
| D6 | Long-running jobs via **async job queue** (DB-backed `Job` model + polling UI) | Alex | Vercel serverless timeout limits; file gen may exceed 10–60s |
| D7 | Store generated files in **Vercel Blob** (or local `./output` in dev) | Alex | Enables download links and run history without DB bloat |
| D8 | Field mapping defined in **config JSON per workflow**, not hardcoded | Priya | User said "filter necessary fields" — config supports iteration without redeploy |

## MVP Scope (v1)
| Feature | User outcome | Priority |
|---------|--------------|----------|
| Workflow dashboard listing available automations | See what tools exist; launch Costco pipeline | Must |
| Costco search form (term + optional filters) | Trigger product lookup for e.g. "coconut" | Must |
| Field filter/map from API response → canonical schema | Excel/PPT get consistent columns | Must |
| Excel export (.xlsx): raw data sheet + summary/pivot sheet | Downloadable report with prices, manufacturer, expiry, etc. | Must |
| PPT export: update "ongoing products" slide from template | Slide matches provided format without manual copy-paste | Must |
| Run history + download links | Re-run or retrieve past outputs | Must |
| User auth / multi-user | N/A for v1 | Won't |
| Scheduled/cron runs | Nice but not day-one | Should (defer) |
| Additional workflows beyond Costco | Platform goal but post-MVP | Won't (v1) |
| In-browser Excel/PPT preview | Heavy; download is enough | Won't |

## Dissenting Views
- **Alex (Engineer):** Wanted Python microservice for Excel pivots and PPT (pandas + python-pptx). **Rejected for v1** — adds deployment complexity; JS path ships faster; Python sidecar is Phase 2 if fidelity gaps appear.
- **Marcus (UX):** Wanted inline preview of PPT slide before download. **Deferred** — template fidelity verified via download in v1.
- **Jordan (Growth):** Argued for shareable workflow links. **Rejected** — personal tool; no distribution need in v1.

## Risks
| Risk | Impact | Mitigation |
|------|--------|------------|
| No official Costco product API | H | Treat as adapter spike; document auth/cookies/endpoints; graceful failure UX |
| Excel "pivot chart" ≠ pre-computed summary | M | Confirm with user whether summary table + chart image in Excel is acceptable |
| PPT template format unknown | M | User provides `.pptx` template early; build placeholder map |
| Vercel function timeout on large result sets | M | Job queue + background processing; paginate Costco requests |
| API ToS / scraping legality | H | Personal use only; no redistribution; user owns credentials |
| Field schema drift from Costco response | M | Zod validation + mapping layer; log unmapped fields |

## Open Questions
| # | Question | Owner | Due |
|---|----------|-------|-----|
| Q1 | What is the exact Costco API (endpoint, auth, existing script)? | User | Before Phase 1 spike |
| Q2 | Full list of Excel columns and pivot dimensions (rows/columns/values)? | User | Before FR-03 implementation |
| Q3 | Provide sample PPT template + which slide(s) to update? | User | Before FR-05 implementation |
| Q4 | Is summary table + chart sufficient, or must it be a native Excel PivotTable object? | User | Before architecture lock |
| Q5 | Typical result volume per search (10 vs 1000 products)? | User | Sizing job timeout |
| Q6 | Run frequency — manual only or weekly scheduled? | User | Phase 2 planning |

## Action Items
| # | Action | Owner |
|---|--------|-------|
| A1 | Update CLAUDE.md & README.md from brief | Agent |
| A2 | User to share Costco API details or existing script | User |
| A3 | User to provide PPT template and column spec | User |
| A4 | Spike Costco adapter + sample Excel output | Engineer (Phase 1) |

## Transcript Summary
Team aligned on a personal Next.js workflow hub with Costco as the first pipeline. PO cut scope to single-user, manual-trigger MVP. UX mapped a three-step journey: search → run status → download Excel + PPT. BA defined canonical product schema and acceptance criteria. Growth reframed success as time-saved per run, not acquisition. Architect proposed adapter pattern, job queue, and template-based PPT. Engineer sized MVP as **M (2–3 weeks)** if Costco API is known; **L** if discovery required. Key tension: native Excel pivot vs pre-computed summary — deferred to user (Q4).
