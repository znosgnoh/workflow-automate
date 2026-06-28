# Project Rules

General conventions for Next.js + Tailwind + Vercel + Prisma + PostgreSQL projects.
Domain-specific rules belong in `CLAUDE.MD`; this file covers stack-wide engineering standards.

---

## 1. Architecture & Framework

- Use **only** the Next.js App Router (`app/` directory). Do not use the Pages router.
- Maximize **Server Components** and RSC. Use Client Components (`"use client"`) only when required:
  - Forms with client-side state
  - Browser APIs (localStorage, geolocation, etc.)
  - GSAP or other animation libraries
  - Real-time UI (toasts, modals driven by client state)
- Prefer **Server Actions** for mutations. Use **Route Handlers** (`app/api/.../route.ts`) for webhooks, OAuth callbacks, and non-HTML APIs.
- Colocate feature code logically: `app/`, `components/`, `lib/`, `prisma/`.

---

## 2. Styling & UI

- Use **only Tailwind CSS** for styling. No custom CSS files except `app/globals.css` (theme tokens, base resets).
- **Mobile-first** responsive design. Touch-friendly targets (min ~44px tap areas where appropriate).
- Use semantic HTML and accessible patterns (labels, focus states, alt text).
- Prefer composition over one-off inline styles. Extract repeated UI into `components/ui/` when reused 2+ times.

---

## 3. TypeScript

- **100% TypeScript.** Avoid `any`; use `unknown` + narrowing when input is untyped.
- Derive types from Prisma where possible (`Prisma.UserGetPayload`, etc.).
- Define Zod schemas for Server Action and API inputs; infer types with `z.infer<typeof schema>`.
- Export shared types from `lib/types/` or colocate with the feature.

---

## 4. Database & Prisma

- Schema lives in `prisma/schema.prisma`. Run migrations with `npx prisma migrate dev` (local) and deploy with `prisma migrate deploy` (CI/production).
- Use a **singleton** Prisma client in `lib/prisma.ts` to avoid connection exhaustion in dev.
- Never instantiate `new PrismaClient()` in every file.
- Handle `PrismaClientKnownRequestError` for unique constraint / not-found cases with clear user-facing messages.
- Add indexes for foreign keys and frequent `where` / `orderBy` columns.

---

## 5. Validation & Errors

- Validate **all** external input (forms, webhooks, query params) with Zod before touching the database.
- Server Actions: return `{ ok: true, data }` or `{ ok: false, error: string }` — or use typed action patterns consistently across the project.
- API routes: return JSON with appropriate HTTP status codes (400, 401, 403, 404, 422, 500).
- Log server errors; never leak stack traces or secrets to the client.

---

## 6. Security

- **Do not** hardcode secrets, API keys, or tokens in source code or the client bundle.
- Store secrets in `.env.local` (local) and Vercel environment variables (production).
- OAuth refresh tokens and third-party credentials: **server-side only** (database or encrypted store).
- Validate webhook signatures when the provider supports them.
- Sanitize user-generated content before rendering if it can contain HTML.

---

## 7. GSAP (optional)

- Use GSAP only in Client Components.
- Prefer `useGSAP` (from `@gsap/react`) or `gsap.context()` for scoped animations and cleanup on unmount.
- Respect `prefers-reduced-motion`: skip or simplify animations when the user prefers reduced motion.
- Animate `transform` and `opacity` when possible; avoid layout-thrashing properties in hot paths.

---

## 8. Vercel & Deployment

- Ensure `npm run build` (or `pnpm build`) passes before considering a step complete.
- Document required env vars in `.env.example`.
- Use Vercel Cron (`vercel.json`) for scheduled jobs when needed.
- Health check at `app/api/health/route.ts` should verify DB connectivity when `DATABASE_URL` is set.

---

## 9. File & Naming Conventions

```
app/
  (routes)/          # Route groups
  api/               # Route handlers
  actions/           # Server Actions (or lib/actions/)
components/
  ui/                # Generic UI primitives
  [feature]/         # Feature-specific components
lib/
  prisma.ts
  validations/       # Zod schemas
  utils/
prisma/
  schema.prisma
  migrations/
```

- Components: `PascalCase.tsx`
- Utilities / actions: `kebab-case.ts` or `camelCase.ts` — pick one and stay consistent
- Server Actions file: verb-noun (`create-post.ts`, `update-profile.ts`)

---

## 10. Testing & Quality

- Run `npm run lint` and `npm run typecheck` (add script if missing) after substantive changes.
- Do not leave `console.log` debug noise in committed code.
- Prefer small, focused diffs. Do not refactor unrelated code in the same change.

---

## 11. Agent Behavior

- Read `CLAUDE.MD` for domain requirements before implementing.
- Run **`/cook`** before coding greenfield work — produces `docs/user-stories.md` and `docs/implementation-plan.md`.
- Implement **one implementation-plan step at a time** unless the user asks for multiple.
- Do not use lazy placeholders like `// TODO: implement` in delivered code — ship working implementations.
- When unsure about domain logic, ask or follow the PRD; do not invent business rules.
