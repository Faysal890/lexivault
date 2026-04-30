# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (runs prisma generate first)
npm run db:push      # Sync Prisma schema to database (use after schema changes)
npm run db:seed      # Seed demo data (demo@lexora.app / password123)
npm run db:studio    # Open Prisma GUI
npx tsc --noEmit     # Type-check without building
```

After any `prisma/schema.prisma` change, always run `npm run db:push` to apply the migration.

## Architecture

**Stack:** Next.js 14 App Router · TypeScript · Prisma ORM · PostgreSQL (Neon) · NextAuth.js (JWT) · Tailwind CSS · Recharts

**Layered architecture:**
- `app/api/v1/**/route.ts` — thin REST controllers. Parse with zod, call a service, return via `ok()` / `created()` / `noContent()`. No business logic, no Prisma access.
- `app/api/auth/[...nextauth]/route.ts` — NextAuth-managed; stays outside `/api/v1`.
- `lib/server/services/*.service.ts` — business logic (SRS, streak/XP, AI orchestration, password reset, coin economy, store, settings). Single source of truth. **Server components and route handlers both call services directly.**
- `lib/server/repositories/*.repo.ts` — pure DB access wrapping Prisma. No business rules.
- `lib/server/dto/*.ts` — zod input schemas + DTO types.
- `lib/server/{errors,http,auth}.ts` — `AppError` taxonomy, response envelope helpers (`ok`/`created`/`fail`/`handle`), and `requireUserId()` session helper.
- `lib/server/rate-limit.ts` — sliding-window rate limiter (in-memory). Wrap sensitive routes (auth, AI generation) to reject repeated requests before they hit services.
- `lib/api-client/*` — typed fetch wrappers used only by client components. Speaks the `{ data }` / `{ error }` envelope and throws `ApiClientError`.

**Rendering pattern:** Server components (`page.tsx`) call services directly — same process, no internal HTTP. They pass data to `*Client.tsx` components, which mutate state via `lib/api-client` calling `/api/v1/*`.

**Route groups:**
- `app/(auth)/` — login, register, forgot-password, reset-password, verify-email (public)
- `app/(app)/` — dashboard, words, quiz, stats, profile, store (protected via `middleware.ts`)
- `app/(admin)/` — admin panel, users, words, settings (requires `ADMIN` role via `requireAdminId()`)

**Authentication:** JWT strategy via NextAuth. `lib/auth.ts` holds `authOptions`. JWT callback puts `user.id` on the token; session callback exposes it as `session.user.id`. Use `requireUserId()` from `lib/server/auth.ts` in services and routes — it throws `UnauthorizedError` (handled by the `handle()` wrapper to a 401 envelope). `requireAdminId()` additionally checks `role === ADMIN` and throws `ForbiddenError`. `middleware.ts` protects `/dashboard`, `/words`, `/quiz`, `/stats`, `/profile`, `/store`, `/admin` page routes.

**Database access:** Always import `prisma` from `lib/prisma.ts` — singleton that prevents connection exhaustion in dev. Repositories are the only place that imports it; services and routes never touch Prisma directly.

**Spaced Repetition (SM-2):** `lib/server/services/quiz.service.ts` (`calculateNextReview`). Correct answers extend the review interval exponentially via `easeFactor`; wrong answers reset to 1 day. `quizService.generate` sorts words by due date then accuracy, capped at 100 words.

**Gamification:** `Streak` model tracks `currentDays`, `longestDays`, `totalXP`, `level`. XP is awarded by `streakService.addXp` — +5 on word creation, `score × 10` (×1.5 if accuracy ≥ 80%) on quiz submit. Level = `floor(totalXP / 100) + 1`.

**Coin economy:** `User.coins` is the balance. `coinService` in `lib/server/services/coin.service.ts` handles credit (`addCoins`), debit (`deductCoins` — throws `InsufficientCoinsError` → HTTP 402 if balance too low), and admin override (`setCoins`). Every change creates a `CoinTransaction` ledger row. Coin events:
- New user registration → `settings.newUserCoins` credited (type `NEW_USER_BONUS`)
- AI sentence generation → `settings.generationCost` debited (type `GENERATION`)
- First quiz of the day → `settings.dailyQuizCoins` credited (type `QUIZ_REWARD`)
- Admin grant → `ADMIN_GRANT`
- Store purchase → `PURCHASE` (credited by Lemon Squeezy webhook)

`CoinContext` (`contexts/CoinContext.tsx`) holds the live balance in React state; `TopNav` and `SideNav` display it. After generation the route returns `remainingCoins` so client components call `updateCoins()` immediately without a refetch.

**Coin store (Lemon Squeezy):** `storeService` creates a Lemon Squeezy hosted checkout. `CoinPackage` rows are managed at `/admin/settings`; each needs a `lsVariantId` (Lemon Squeezy variant ID) to enable checkout. The webhook at `POST /api/v1/store/webhook` verifies the `x-signature` header with HMAC-SHA256 and credits coins on `order_created`. The webhook route uses `req.arrayBuffer()` (raw body, no JSON parsing) — do not add `bodyParser`.

**Admin settings:** `AppSettings` is a singleton row (id = `"singleton"`). `settingsService` / `settingsRepo` use `upsert` to guarantee it always exists. Admins configure `newUserCoins`, `generationCost`, `dailyQuizCoins` at `/admin/settings`. The same page manages `CoinPackage` CRUD.

**Export feature:** `app/(app)/words/WordsClient.tsx` exports words to Excel (via `xlsx` — dynamic import), PDF (browser print window via `window.open`), and Word (HTML blob saved as `.doc`). Exports respect active search/tag filters.

**Password reset / email verification:** `authService` in `lib/server/services/auth.service.ts`. Tokens are SHA-256-hashed, single-use, stored in `PasswordResetToken` / `EmailVerificationToken`. Reset TTL 1h, verify TTL 24h. Forgot-password and resend-verification always return 200 to avoid leaking account existence.

**Security:** `next.config.mjs` sets a `Content-Security-Policy` header. `lib/server/rate-limit.ts` provides a sliding-window limiter — use it on auth endpoints and AI generation routes. All DTO schemas in `lib/server/dto/` enforce max-length caps on string fields to prevent oversized payloads.

**API documentation:** `docs/API.md` (human) and `docs/openapi.yaml` (OpenAPI 3.1) describe every `/api/v1` endpoint. Update both when adding or changing routes.

## Styling System

The design uses Material Design 3 color tokens defined in `tailwind.config.ts` (e.g. `bg-surface-container-lowest`, `text-on-surface-variant`, `text-primary`). Use these semantic tokens instead of raw Tailwind colors.

Reusable CSS component classes are in `app/globals.css`:
- `.input-field` — standard form inputs
- `.btn-primary` / `.btn-secondary` — full-width action buttons
- `.card` — rounded container
- `.quiz-option` / `.quiz-option-selected` — quiz answer buttons
- `.material-symbols-outlined` — Google Material Symbols icon font (not lucide-react)

Icons use Google Material Symbols (loaded via CSS `@import`), not lucide-react. Use `<span className="material-symbols-outlined">icon_name</span>`. To fill an icon: add `style={{ fontVariationSettings: "'FILL' 1" }}`.

Fonts: `font-headline` (Plus Jakarta Sans) for headings, default body uses Inter.

## Responsive Layout

The UI is mobile-first; the desktop layout activates at the Tailwind `lg:` breakpoint (1024px+).

**Shell (`app/(app)/layout.tsx`):**
- Mobile: `TopNav` (fixed top) + `BottomNav` (fixed bottom) — both `lg:hidden`.
- Desktop: `SideNav` (fixed left, 256px wide, `hidden lg:flex`) — content gets `lg:pl-64` to clear it.
- Content wrapper: `max-w-2xl mx-auto` on mobile, `lg:max-w-7xl lg:px-10 lg:py-8` on desktop.

**Page conventions:**
- In-app pages (dashboard, stats, words, quiz, profile) use multi-column grids at `lg:` (commonly `lg:grid-cols-5` for asymmetric layouts, `lg:grid-cols-2`/`lg:grid-cols-4` for symmetric ones). Cards drop their bottom padding (`lg:py-0`) since the layout shell provides outer padding.
- Forms (word add/edit, profile settings, quiz setup) split related fields into `lg:grid-cols-2` rows so they're not stacked vertically on wide screens.
- Auth pages `login` and `register` use a two-column desktop layout: gradient brand panel on the left (`hidden lg:flex`), form on the right with the card chrome dropped (`lg:bg-transparent lg:shadow-none lg:p-0`). Transient auth pages (`forgot-password`, `reset-password`, `verify-email`) keep the centered single-card pattern, just wider (`lg:max-w-md`).

When adding a new screen, follow the same mobile-first → `lg:` upgrade pattern. Don't introduce `md:` breakpoints unless there's a specific reason — the design jumps straight from phone to desktop.

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<random 32-byte base64>
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000        # Used to build password-reset links and store redirects
GMAIL_USER=you@gmail.com                         # Gmail address for transactional email (nodemailer)
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx           # Gmail App Password (not your login password)
LEMONSQUEEZY_API_KEY=...                         # Lemon Squeezy API key (for creating checkouts)
LEMONSQUEEZY_STORE_ID=...                        # Lemon Squeezy store ID
LEMONSQUEEZY_WEBHOOK_SECRET=...                  # Lemon Squeezy webhook signing secret
```

## Key Constraints

- `Word.tags` is stored as a comma-separated string, not an array — split with `.split(",").map(t => t.trim()).filter(Boolean)` when rendering.
- `QuizQuestion.options` is stored as a JSON string — parse with `JSON.parse()` when reading.
- Ownership check happens in services (`wordService.get` etc.) by filtering on `userId` — repositories never trust callers. Don't add a second check at the route layer.
- New API endpoints go under `app/api/v1/` and follow the controller-service-repository split. Wrap handlers in `handle()` so thrown `AppError`s become envelope responses.
- Client components must use `lib/api-client` (not raw `fetch`) so error envelopes are unwrapped consistently.
- `@tanstack/react-query` and `lucide-react` are in `package.json` but unused — do not import them.
- `InsufficientCoinsError` maps to HTTP 402. Client components check `err.status === 402` and show a "Get more coins →" link to `/store`.
- `CoinTransaction.amount` is always positive for credits and negative for debits — do not flip the sign at the service layer.
- The Lemon Squeezy webhook must receive the raw request body. The route at `app/api/v1/store/webhook/route.ts` uses `req.arrayBuffer()` — never wrap it with a body-parsing middleware.
- `AppSettings` singleton is always fetched via `settingsService.getSettings()` (upsert guarantees the row exists). Never query `AppSettings` directly from a service or route.
