# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SheTech is a French-language e-learning platform targeting African women and girls. It consists of two separate apps:

- `shetechback/` — Node.js/Express REST API (CommonJS, port 5000)
- `shetechfront/` — React 19 SPA built with Vite (ESM, port 5173)

## Commands

### Backend (`shetechback/`)
```bash
cd shetechback
npm run dev        # nodemon (auto-reload)
npm start          # node server.js (production)
```

### Frontend (`shetechfront/`)
```bash
cd shetechfront
npm run dev        # Vite dev server
npm run build      # Production build to dist/
npm run lint       # ESLint
npm run preview    # Preview production build
```

## Environment

The backend reads from `shetechback/.env`. Required variables:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` — MySQL connection (default db: `shetech`)
- `JWT_SECRET` — used to sign 24h tokens
- `PORT` — defaults to 5000
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — auto-created on first start if no admin exists
- `GMAIL_USER`, `GMAIL_PASS` — nodemailer (Gmail app password) for password reset emails
- `FRONTEND_URL` — used in reset-password email links (default `http://localhost:5173`)
- `OPENROUTER_API_KEY` — AI quiz generation via OpenRouter

The frontend uses `VITE_API_URL` (defaults to `http://localhost:5000`).

> **Note:** The current `.env` contains a `DATABASE_URL` (PostgreSQL/Neon) but `db.js` uses `mysql2` with individual `DB_*` vars. These two are inconsistent — verify which DB is actually active before modifying connection code.

## Architecture

### Backend (`shetechback/server.js`)

All routes live in a single `server.js` (~1930 lines). There is no router file splitting. The DB connection is a single persistent MySQL connection exported from `db.js` (not a pool).

**Auth middleware chain:**
- `verifierToken` — validates JWT from `Authorization: Bearer <token>`, attaches `req.user`
- `verifierAdmin` — requires `req.user.role === 'admin'`
- `verifierMentorOuAdmin` — requires role `admin` or `mentor`

**User roles:** `apprenante` (default), `mentor`, `admin`

**Key domain areas and their routes:**
- Auth: `POST /register`, `POST /login`, `POST /forgot-password`, `GET|POST /reset-password`
- Formations: `GET /formations`, `GET /formations/:id` (returns nested modules → leçons → videos)
- Modules → Leçons → Videos: nested CRUD, admin-only write
- Module quiz: AI-generated via OpenRouter (`POST /modules/:id/generate-quiz`), stored in `module_quiz`, submitted via `POST /modules/:id/quiz/soumettre` (pass threshold: 70%)
- Progress tracking: `lecons_faites` table + `progression` table + `GET /formations/:id/progression-calculee`
- Projets: user project submissions tied to `projets_briefs` (briefs created by admin); mentor/admin evaluation via `PUT /admin/projets/:id/evaluer`
- Livrables: file uploads (PDF/DOC/image ≤5MB) via multer, stored in `uploads/livrables/`
- Certificats: PDF generated server-side with pdfkit; three styles (`generateCertificatePDF`, `generateClassicCertificatePDF`, `generateModernCertificatePDF`); eligibility = all module quizzes passed; stored in `uploads/certificats/`
- Community: forum posts/responses, votes, user follows — tables prefixed `community_` and `user_`
- Marketplace: product listings, cart, orders — tables prefixed `marketplace_`
- Mentoring sessions: `sessions_mentorat` table, admin manages

### Frontend (`shetechfront/src/`)

**No React Router is installed.** Routing is entirely state-based.

`App.jsx` manages a `page` state (`home`, `login`, `register`, `forgot`, `reset`, `dashboard`). Once logged in, `Dashboard.jsx` manages an `activePage` state. When `activePage` changes, Dashboard returns the sub-component directly (full replacement), which means **the sidebar disappears on sub-pages** — each sub-page receives an `onBack` callback to return to the dashboard view.

| activePage | Component |
|---|---|
| `dashboard` | inline in Dashboard.jsx |
| `formation` | `Formations.jsx` → `VueFormations` → `FormationDetail.jsx` |
| `projets` | `Projets.jsx` |
| `communaute` | `Community.jsx` |
| `certificats` | `Certificats.jsx` |
| `admin` | `AdminDashboard.jsx` |

Auth token and user object are stored in `localStorage` (`token`, `user` keys). All API calls use axios with `Authorization: Bearer <token>` header.

**API base URL:** `import.meta.env.VITE_API_URL || "http://localhost:5000"` — defined as a module-level `const API` in every component (no shared axios instance).

### Color system

The canonical accent color is `#C45C7A` (rose/bordeaux). The full palette:

| Token | Value | Use |
|---|---|---|
| `--burgundy` | `#6D2E46` | Dark text, headings |
| `--burgun-dark` | `#2B1B24` | Sidebar background, hero overlays |
| `--burgun-light` | `#C45C7A` | **Primary accent** — buttons, borders, highlights |
| `--gold` | `#E8A554` | Secondary accent |
| `--beige` | `#F9F0F3` | Page background |

**Known inconsistency:** `Dashboard.css` and `App.css` both define `:root` CSS variables but with **different hex values** (e.g. `--burgundy: #7B2D4E` in Dashboard.css vs `#6D2E46` in App.css). The active styles for `.dash-*` classes are in `App.css`; Dashboard.css contains unused/orphaned classes (`.sidebar`, `.nav-item`, `.card`, etc.) that are not referenced anywhere. When editing styles, use `App.css`.

Sub-page components (`Formations.jsx`, `Community.jsx`, `FormationDetail.jsx`) bypass CSS variables entirely and use hardcoded module-level constants (`const ACCENT = "#C45C7A"`) with inline styles. `AdminDashboard.jsx` uses a `const C = {...}` palette object.

### CSS architecture

- **`App.css`** — global reset, CSS variables, auth pages, all `.dash-*` dashboard classes, homepage classes, shared animation keyframes. This is the primary stylesheet.
- **`Dashboard.css`** — defines a second (conflicting) `:root` block and CSS classes that are not used. Treat as orphaned.
- Sub-pages use inline styles almost exclusively (no separate CSS files per component).

### Static file serving

Uploaded files are served at `http://localhost:5000/uploads/...` via `app.use('/uploads', express.static('uploads'))`.

### Database

MySQL database named `shetech`. Schema migrations are SQL files in `shetechback/migrations/`. The `certificats` table is created programmatically on server start via `ensureCertificatsTable()`. A default admin account is also auto-created on startup if none exists.

Core tables: `users`, `formations`, `modules`, `lecons`, `videos`, `quiz`, `module_quiz`, `module_quiz_resultats`, `lecons_faites`, `progression`, `projets_briefs`, `projets`, `projet_commentaires`, `projet_likes`, `livrables`, `sessions_mentorat`, `ressources`, `certificats`, `password_reset_tokens`, `community_posts`, `community_responses`, `community_votes`, `user_follows`, `marketplace_produits`, `marketplace_panier`, `marketplace_commandes`.
