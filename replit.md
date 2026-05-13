# Healthcare Monitoring Platform

An AI-powered full-stack healthcare monitoring SaaS — patients log vitals, get anomaly alerts, chat with an AI assistant, and book appointments. Doctors monitor patients and manage appointments. Hospital admins see analytics and manage operations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/healthcare-app run dev` — run the frontend (port varies)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, Recharts, Framer Motion, wouter
- API: Express 5, JWT auth (jsonwebtoken), bcryptjs
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for API contracts
- `lib/db/src/schema/` — Drizzle table schemas (users, vitals, alerts, appointments, hospitals)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, vitals, alerts, appointments, analytics, patients, hospitals, ai)
- `artifacts/api-server/src/lib/auth.ts` — JWT auth middleware + helpers
- `artifacts/api-server/src/lib/anomaly.ts` — Health anomaly detection logic (normal/risk/critical)
- `artifacts/healthcare-app/src/` — React frontend (pages per role)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod validators (do not edit)

## Architecture decisions

- JWT tokens stored in frontend localStorage for simplicity; all protected routes require `Authorization: Bearer <token>` header
- Anomaly detection runs server-side on every vitals submission; alerts are auto-created and saved to DB
- Role-based access: patients see their own data, doctors/admins see all patients
- No external SMS integration in MVP (smsSent flag tracked, service stubbed)
- AI assistant is rule-based (keyword matching) — no external LLM needed for MVP

## Product

- **Landing page**: public page with hero, features, testimonials
- **Auth**: Register/login with role selection (patient / doctor / caretaker / hospital_admin)
- **Patient dashboard**: vitals entry, health charts (Recharts), AI assistant chat, alerts, appointments, hospitals
- **Doctor dashboard**: patient list with status badges, appointment management, emergency alerts
- **Hospital admin dashboard**: analytics, doctor/patient/appointment management

## Demo accounts

- Patient: `patient@demo.com` / `demo123`
- Doctor: `doctor@demo.com` / `demo123`
- Caretaker: `caretaker@demo.com` / `demo123`
- Admin: `admin@demo.com` / `demo123`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- The `bcrypt` package requires native build scripts — use `bcryptjs` (pure JS) instead
- Vitals anomaly detection is in `artifacts/api-server/src/lib/anomaly.ts`
- Seeded demo password hash is for `demo123` — if you re-seed with a fresh hash, generate it via the register endpoint first

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
