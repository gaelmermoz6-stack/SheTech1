# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SheTech is a French-language e-learning platform targeting African women and girls. It is a monorepo of two independent apps:
Pas d'icone que des fontAwesome
- `shetechback/` — Node.js/Express REST API (ESM, Prisma + PostgreSQL, port 5000)
- `shetechfront/` — React 19 SPA built with Vite (React Router v7, port 5173)

The backend was migrated from a MySQL monolith to a modular Prisma/PostgreSQL (Neon) architecture; the frontend was migrated from state-based routing to React Router. Recently refactored to match GeekCoding4Kids-style course hierarchy (Parcours → Formation → Module → Cours → Leçon). Older docs or comments referencing MySQL, a single `server.js`, or "no React Router" are stale.

## Commands

### Backend (`shetechback/`)
```bash
npm run dev          # nodemon src/server.js (auto-reload)
npm start            # node src/server.js
npm run db:migrate   # prisma migrate dev — apply/create migrations
npm run db:generate  # prisma generate — regenerate client after schema edits
npm run db:studio    # prisma studio — browse the DB
npm run db:seed      # node prisma/seed.js
```
After any edit to `prisma/schema.prisma`, run `db:generate` (and `db:migrate` to change the DB).

### Frontend (`shetechfront/`)
```bash
npm run dev      # Vite dev server (host 0.0.0.0)
npm run build    # production build to dist/
npm run lint     # ESLint
npm run preview  # preview production build
```

There is no automated test suite in either app.

## Environment

Backend reads `shetechback/.env` (see `.env.example`). Required:
- `DATABASE_URL` — PostgreSQL connection string (Neon). **This is the only DB config**; there are no `DB_HOST`/`DB_USER`/etc. vars anymore.
- `JWT_SECRET` — signs auth tokens
- `PORT` — defaults to 5000
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — a default admin is auto-created on startup if no admin exists (`src/lib/startup.js`)
- `GMAIL_USER`, `GMAIL_PASS` — nodemailer (Gmail app password) for password-reset emails
- `OPENROUTER_API_KEY` — AI quiz generation
- `YOUTUBE_API_KEY`, `FRONTEND_URL` (reset-email links, default `http://localhost:5173`)

Frontend uses `VITE_API_URL` (defaults to `http://localhost:5000`).

## Backend architecture (`shetechback/src/`)

Layered structure: `server.js` → `routes/*.routes.js` → `controllers/*.controller.js` → Prisma. Shared helpers in `lib/`, middleware in `middlewares/`.

**Route mounting:** Check `src/server.js` for current mounts. Root routes include auth, parcours, formations. Nested module/cours routes live in `modules.routes.js` and `cours.routes.js`:
```js
app.use('/parcours', parcoursRoutes);
app.use('/formations', formationRoutes);
app.use(modulesRoutes);    // GET /formations/:id/modules, GET /modules/:id, etc.
app.use(coursRoutes);      // GET /modules/:id/cours, GET /cours/:id, etc.
app.use(progressionRoutes);
// ... other routers mounted at root
```

**Prisma client:** import the singleton `prisma` from `src/lib/prisma.js` (never `new PrismaClient()` in a controller). It memoizes on `global` to survive dev hot-reloads.

**Auth middleware** (`src/middlewares/auth.middleware.js`), applied per-route in the route files:
- `verifierToken` — validates `Authorization: Bearer <token>`, sets `req.user`
- `verifierAdmin` — requires `req.user.role === 'admin'`
- `verifierMentorOuAdmin` — requires `admin` or `mentor`

**User roles:** `apprenante` (default), `mentor`, `admin`.

**File uploads** (`src/middlewares/upload.middleware.js`): multer disk storage → `uploads/livrables/`, ≤5MB, whitelist of PDF/DOC(X)/JPEG/PNG/TXT. Uploads are served statically from `/uploads`. The `uploads/` tree is gitignored and recreated on startup by `server.js`.

**Course hierarchy (newly refactored):**
```
Parcours (learning pathway, e.g. "Développement Web")
  └─ Formation (e.g. "Fondamentaux du Web")
     └─ Module (e.g. "HTML & CSS", with metadata: couleur, icone, langages[], competences[], livrables[])
        └─ Cours (course unit, e.g. "Introduction au HTML")
           └─ Lecon (individual lesson, e.g. "Les balises HTML essentielles")
              ├─ Video[] (embedded or link, cascade-deleted)
              ├─ Audio[] (cascade-deleted)
              └─ PieceJointe[] (PDF, DOC, etc., cascade-deleted)
```

Controllers: `parcours.controller.js`, `formation.controller.js`, `module.controller.js`, `cours.controller.js`, `lecon.controller.js`.

**Domain-specific behavior:**
- **Cours quizzes** (`cours.controller.js`, `CoursQuiz`): one quiz per cours with `CoursQuizQuestion[]`. Submissions scored; results in `CoursQuizResultat` (composite unique `[userId, quizId]`).
- **Lesson progress** (`ProgressionLecon`, renamed from `LeconFaite`): tracks `completee`, `dateCompletee`, `tempsPasseMinutes` per `[userId, leconId]`.
- **Formation progress** (`ProgressionFormation`, renamed from `Progression`): percentage per `[userId, formationId]`.
- **Certificates** (`certificat.controller.js`, `lib/pdf.js`): PDFs generated server-side with pdfkit, written to `uploads/certificats/`. Eligibility depends on formation-quiz completion; each cert has a `codeVerification` and is unique per `[userId, formationId]`.
- **Projets**: user submissions against admin-authored `ProjetBrief`s; mentors/admins evaluate (`statutEvaluation`, `note`, `commentaireMentor`).

## Frontend architecture (`shetechfront/src/`)

**React Router v7** with `createBrowserRouter` in `router.jsx` (rendered by `main.jsx`). Routes:
- Public: `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`
- `/dashboard/*` — wrapped in `<ProtectedRoute>` + `<DashboardLayout>` (renders sidebar + `<Outlet>`); children:
  - index: `DashboardHome`
  - `formations`: `FormationsPage` (hierarchical parcours/formations/modules/cours/lecons view)
  - `formations/:formationId/modules/:moduleId/cours/:coursId/lecons/:leconId`: `CoursDetail` (lesson viewer with tabs: content/resources/quiz)
  - `projets`: `Projets`
  - `communaute`: `Community`
  - `certificats`: `Certificats`
  - `profil`: `ProfilPage`
- `/admin` — wrapped in `<AdminRoute>` (redirects non-admins to `/dashboard`)
- `*` → redirect to `/`

**Auth state** lives in `store/authStore.js` (or context, per implementation), persisted to `localStorage` (`token`, `user`). `ProtectedRoute`/`AdminRoute` gate on it.

**API calls:** import the shared axios instance from `src/lib/api.js`. Its request interceptor auto-attaches Bearer token from localStorage — do not set headers manually or re-create axios instances.

**Data fetching:** `src/hooks/useFormations.js` and `src/hooks/useParcours.js` provide React Query hooks for formations/parcours/modules/cours/lecons. Use these instead of raw `api.get()` in components.

**Formations page** (`FormationsPage.jsx`): renders parcours cards (click to expand) → formations → modules (with couleur/icone) → cours → lecons (click to navigate to `CoursDetail`). Expects full nested hierarchy from `GET /parcours/:id`.

**Lesson viewer** (`CoursDetail.jsx`): tabbed interface for lesson content, videos, audios, file downloads, and quiz. Called from `FormationsPage` lecon links.

**Orphaned files (do not edit):**
- `App.jsx`, `Dashboard.jsx`, `Dashboard.css`, `MentorasPage.jsx` — not referenced by routing. Legacy from pre-Router migration.
- `contexts/AuthContext.jsx` — superseded by `store/authStore.js`.

### Styling
- `App.css` is the primary stylesheet (global reset, CSS variables, `.dash-*` classes, auth/homepage). Imported in `main.jsx`. `Dashboard.css` is orphaned — do not use it.
- Page components (`FormationsPage.jsx`, `CoursDetail.jsx`, `Community.jsx`, `Certificats.jsx`, etc.) use **inline styles** with module-level color constants. `FormationsPage.jsx` uses `const ACCENT = '#C45C7A'`, `const BG = '#F9F0F3'`.
- **Canonical colors:** accent rose `#C45C7A`, page beige `#F9F0F3`, dark text burgundy `#1a0f14`, secondary gold `#E8A554`. Module cards use individual `couleur` field (stored in DB: `#FF6B9D`, `#FFD93D`, etc.).
- No CSS-in-JS library; all styling is inline or in `App.css`. Keep it simple.

## Gotchas and Common Pitfalls

**Backend:**
- **Prisma nested includes:** When fetching formations in `getParcoursDetail`, **always** include the full nested hierarchy (`modules` → `cours` → `lecons`) or the frontend will show "0 modules". Use the pattern from `getFormation` in `formation.controller.js` as a reference.
- **Auth middleware:** `verifierToken` requires a Bearer token; `verifierAdmin` additionally checks `role === 'admin'`. Public endpoints like `GET /parcours` and `GET /formations` do not have `verifierToken`, but `GET /parcours/:id` does. Check `*.routes.js` before assuming.
- **Model renames:** `Progression` → `ProgressionFormation`, `LeconFaite` → (split into `ProgressionLecon`). Old queries using these names will fail.

**Frontend:**
- **FormationsPage data path:** Expects `formation.modules[].cours[].lecons[]` to exist in the parcours detail API response. If `modules` key is missing, expand/collapse handlers silently fail (no errors, just no content renders).
- **useParcoursDetail hook:** Does a raw `GET /parcours/:id` call, which **requires a valid auth token** in localStorage. If token is absent or expired, the query fails silently (check browser console for 401/403).
- **No local state for hierarchy:** FormationsPage uses React `useState` for `expanded` flags on each card. This is deliberate (cheap, no server-side state), but means collapsing/re-expanding re-renders with full data each time (not cached per card).
- **Orphaned components:** Do not edit `App.jsx`, `Dashboard.jsx`, `MentorasPage.jsx` — they are not in the active routing tree. Edit `pages/FormationsPage.jsx`, `pages/CoursDetail.jsx`, etc., instead.

## Database

PostgreSQL via Prisma (v5.22.0). The single source of truth is `prisma/schema.prisma`; migrations live in `prisma/migrations/`. Models use `@@map`/`@map` to keep **snake_case table and column names** while exposing camelCase in code (e.g. `motDePasse` ↔ `mot_de_passe`, model `User` ↔ table `users`).

**Composite/unique keys to respect:**
- `ProgressionLecon`: `@@unique([userId, leconId])`
- `ProgressionFormation`: `@@unique([userId, formationId])`
- `CoursQuizResultat`: `@@unique([userId, quizId])`
- `FormationQuizResultat`: `@@unique([userId, formationId])`

**Seeding:** `prisma/seed.js` creates:
- 3 users (admin@shetech.com/Admin123!, marie@shetech.com/User123!, mentor@shetech.com/Mentor123!)
- 8 parcours (Développement Web, Design Graphique, Data Science, DevOps & Cloud, Mobile Dev, Sécurité Informatique, Entrepreneuriat Tech, AI & Machine Learning)
- 16 formations (2 per parcours; first parcours has full module/cours/lecon hierarchy seeded)
- 2 modules for first formation with courses, lessons, videos, and quiz questions

Run with `npm run db:seed` to reset DB and populate test data.
