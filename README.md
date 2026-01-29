# Skill Check — Assessment Platform

> **Keep your tech skills sharp. Regular tests help prevent skill decay.**

A full-stack assessment platform for developers: take topic-based quizzes (React, Next.js, JavaScript, TypeScript, etc.), track progress, and maintain your edge as tools and AI evolve.

**Author:** [Denys Vodniakov](https://github.com/denys-vodniakov)

---

## Concept & Purpose

### The problem: skills can degrade

Whether you code daily or lean on AI assistants, **technical skills drift over time**:

- **Less hands-on practice** → weaker recall, slower debugging, foggier mental models  
- **Over-reliance on AI** → you stop re-deriving solutions; when the model is wrong or unavailable, you’re stuck  
- **Framework churn** → React, Next.js, tooling change; what you “knew” ages quickly  

If you don’t deliberately reinforce knowledge, it fades.

### The idea: tests as maintenance

**Skill Check** treats assessments as **ongoing skill maintenance**:

1. **Check what you know** — short quizzes by category (React, Next.js, JS/TS, etc.) and difficulty  
2. **Get immediate feedback** — correct/incorrect, explanations, time per question  
3. **Track over time** — dashboard, history, pass rate, average score (for registered users)  
4. **Stay accountable** — regular practice reduces decay and keeps you confident when you need to reason from first principles  

The platform is built both as a **usable product** and as a **portfolio demo** showcasing full-stack, CMS-driven, and frontend architecture skills.

---

## Business Idea

- **Audience:** Developers, bootcamp grads, engineers switching stacks or returning after a break.  
- **Value:** Low-friction, topic-focused assessments; optional user accounts to save results and track progress.  
- **Monetization potential:** Freemium (free tests + basic stats) vs premium (advanced analytics, team/org dashboards, custom tests).  
- **Differentiator:** Clean UX, transparent feedback, category/difficulty filters, and a CMS-driven content model so non-devs can manage tests.

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **CMS & API** | [Payload CMS 3](https://payloadcms.com/) |
| **Database** | PostgreSQL ([Vercel Postgres](https://vercel.com/storage/postgres)) |
| **Auth** | JWT, custom register/login/me endpoints |
| **Frontend** | React 19, [Tailwind CSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Motion](https://motion.dev/) |
| **State** | [Zustand](https://github.com/pmndrs/zustand) (test progress, persisted) |
| **Rich text** | [Lexical](https://lexical.dev/) via Payload |
| **Deploy** | [Vercel](https://vercel.com/), [Vercel Blob](https://vercel.com/storage/blob) for media |
| **Testing** | [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Frontend (Next.js)                             │
├─────────────────────────────────────────────────────────────────────────┤
│  • (frontend) layout: Header, Footer, Theme, AuthProvider                 │
│  • Pages: /, /[slug], /login, /register, /dashboard, /dashboard/profile  │
│  • Tests: /test/[id] (take test), CMS pages with TestsList block         │
│  • State: AuthContext (user), Zustand (test progress, persist)           │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API & CMS (Payload)                              │
├─────────────────────────────────────────────────────────────────────────┤
│  • /api/auth/* (login, register, logout, me, verify)                     │
│  • /api/tests/list, /api/tests/[id]/questions                            │
│  • /api/test-results (submit answers, scoring)                           │
│  • /api/user/profile, /api/user/avatar, /api/user/stats                  │
│  • /admin — Payload admin UI                                             │
│  • GraphQL, REST via Payload                                             │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Data (PostgreSQL + Vercel Blob)                       │
├─────────────────────────────────────────────────────────────────────────┤
│  Collections: Users, Tests, Questions, TestResults, Pages, Posts,        │
│               Media, Categories                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
src/
├── app/
│   ├── (frontend)/                 # Public site
│   │   ├── layout.tsx              # Root layout, Header, Footer, providers
│   │   ├── page.tsx                # Home
│   │   ├── [slug]/page.tsx         # CMS pages (Hero + blocks)
│   │   ├── login/, register/
│   │   ├── dashboard/              # User dashboard + profile
│   │   ├── test/[id]/page.tsx      # Take a test
│   │   ├── posts/, search/
│   │   └── globals.css
│   └── (payload)/
│       ├── admin/                  # Payload admin UI
│       └── api/                    # Auth, tests, test-results, user, etc.
├── blocks/                         # Page building blocks (CMS)
│   ├── TestsList/                  # Filterable tests grid (category, difficulty, search)
│   ├── TestsCarousel/
│   ├── Content, MediaBlock, Form, CallToAction, WhyChooseUs, …
│   └── RenderBlocks.tsx
├── collections/                    # Payload collections
│   ├── Users, Tests, Questions, TestResults
│   ├── Pages, Posts, Media, Categories
│   └── */
├── components/                     # Shared UI
│   ├── ui/                         # Button, Card, Input, Badge, …
│   ├── Stepper, AnimatedGradientBackground, RichText, …
│   ├── ProtectedRoute, AdminBar
│   └── */
├── contexts/
│   └── AuthContext.tsx             # Auth state, login, register, profile
├── store/
│   └── testStore.ts                # Zustand store for test progress (persist)
├── Header/, Footer/, heros/        # Layout & hero configs
├── providers/                      # Theme, etc.
├── access/                         # Payload access control
├── fields/, hooks/, utilities/
├── payload.config.ts
└── payload-types.ts                # Generated Payload types
```

---

## Main Features

- **Tests**
  - Categories: React, Next.js, JavaScript, TypeScript, CSS/HTML, General, Mixed  
  - Difficulty: Easy, Medium, Hard, Mixed  
  - Single-select answers, optional time limit, passing score  
  - Rich-text questions (Lexical), code blocks, feedback per option  

- **Test experience**
  - Stepper UI, animated background, theme-aware (light/dark)  
  - Progress persisted (Zustand); resume-or-restart dialog  
  - Anonymous tests allowed; optional registration **after** completion to save results  

- **Users & dashboard**
  - Register, login, JWT auth  
  - Profile (name, email, avatar, bio, etc.)  
  - Dashboard: stats, recent results, expandable result details with correct/incorrect feedback  

- **CMS-driven content**
  - **Pages** (Hero + blocks): Content, Media, Forms, **TestsList**, TestsCarousel, WhyChooseUs, …  
  - **TestsList** block: filters (category, difficulty, search), sort, grid/list, pagination / infinite scroll / “Load more”  
  - All configurable from Payload admin (no deploy for content changes).  

- **Infrastructure**
  - SEO (meta, Open Graph), sitemaps, redirects  
  - Vercel Analytics & Speed Insights  
  - E2E (Playwright) and integration (Vitest) tests  

---

## Getting Started

**Requirements:** Node 22.x, pnpm 9+, PostgreSQL (e.g. Vercel Postgres).

1. Clone and install:
   ```bash
   git clone <repo-url>
   cd payload-test-project
   pnpm install
   ```

2. Configure env (see `.env.example`):
   ```bash
   POSTGRES_URL=postgres://…
   PAYLOAD_SECRET=…
   # optional: Vercel Blob for media
   ```

3. Run migrations (if not using `push` in dev):
   ```bash
   pnpm migrate
   ```

4. Dev server:
   ```bash
   pnpm dev
   ```
   - Site: [https://www.codetest.fun/](https://www.codetest.fun/)  
   - Admin: [https://www.codetest.fun/admin](https://www.codetest.fun/admin)  

5. Seed (optional):
   ```bash
   # POST /api/seed or use Seed button in BeforeDashboard (admin)
   ```

6. Build & start:
   ```bash
   pnpm build
   pnpm start
   ```

---

## Scripts

| Command | Description |
|--------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` / `pnpm lint:fix` | ESLint |
| `pnpm generate:types` | Regenerate Payload types |
| `pnpm migrate` | Run DB migrations |
| `pnpm test` | Vitest + Playwright |

---

## License

MIT.

---

**Denys Vodniakov** — [GitHub](https://github.com/denisvodnakov) · Assessment platform & portfolio demo.
