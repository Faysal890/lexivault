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

**Route groups:**
- `app/(auth)/` — login, register (public)
- `app/(app)/` — dashboard, words, quiz, stats, profile (protected via `middleware.ts`)
- `app/api/` — REST endpoints; all routes call `getServerSession(authOptions)` and return 401 if unauthenticated

**Rendering pattern:** Server components fetch data and pass it to `*Client.tsx` client components as props. The server component file (e.g. `words/page.tsx`) handles the DB query; the sibling `WordsClient.tsx` handles all interactivity.

**Authentication:** JWT strategy via NextAuth. `lib/auth.ts` holds `authOptions`. The JWT callback attaches `user.id` to the token; the session callback exposes it as `session.user.id`. `middleware.ts` protects all app routes via NextAuth middleware.

**Database access:** Always import `prisma` from `lib/prisma.ts` — it's a singleton that prevents connection exhaustion in development. Never instantiate `PrismaClient` directly.

**Spaced Repetition (SM-2):** Implemented in `app/api/quiz/submit/route.ts` (`calculateNextReview`). Correct answers extend the review interval exponentially via `easeFactor`; wrong answers reset to 1 day. Quiz generation in `app/api/quiz/generate/route.ts` sorts words by due date then accuracy, capped at 100 words.

**Gamification:** `Streak` model tracks `currentDays`, `longestDays`, `totalXP`, `level`. XP is awarded on word creation (+5 XP via `updateStreak` in `app/api/words/route.ts`) and quiz completion (score × 10, ×1.5 bonus if accuracy ≥ 80%). Level = `floor(totalXP / 100) + 1`.

**Export feature:** `app/(app)/words/WordsClient.tsx` exports words to Excel (via `xlsx`), PDF (via `jspdf` + `jspdf-autotable`), and Word (HTML blob saved as `.doc`). Libraries are loaded with dynamic `import()` to avoid bundle bloat.

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

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<random 32-byte base64>
NEXTAUTH_URL=http://localhost:3000
```

## Key Constraints

- `Word.tags` is stored as a comma-separated string, not an array — split with `.split(",").map(t => t.trim()).filter(Boolean)` when rendering.
- `QuizQuestion.options` is stored as a JSON string — parse with `JSON.parse()` when reading.
- All API mutations must verify `session.user.id` matches the resource owner before updating/deleting.
- `@tanstack/react-query` and `lucide-react` are in `package.json` but unused — do not import them.
