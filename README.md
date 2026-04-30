# Lexora — English Vocabulary Learning App

A production-ready Next.js 14 web application for learning English vocabulary with adaptive quizzes, spaced repetition, a coin economy, and a full admin panel.

---

## Features

| Feature | Details |
|---|---|
| Authentication | Email/password with JWT sessions via NextAuth, email verification, password reset |
| Word Management | Add, edit, delete words with meanings, examples, tags; export to Excel / PDF / Word |
| AI Generation | Claude-powered example sentence generation, gated behind the coin economy |
| Smart Quiz | Multiple choice, fill-in-blank, reverse (meaning→word) |
| Spaced Repetition | SM-2 algorithm schedules word reviews optimally |
| Progress Stats | Recharts for accuracy trends and weekly activity |
| Gamification | XP points, levels, daily streaks, coin rewards |
| Coin Economy | Virtual coin balance, Lemon Squeezy store for purchasing coin packs |
| Admin Panel | User management, word moderation, coin grants, configurable settings |
| Pronunciation | Text-to-speech for every English word |
| Responsive | Mobile-first with bottom nav; full desktop SideNav layout at lg: breakpoint |

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Environment setup
```bash
cp .env.example .env
# Fill in all values — see Environment Variables section below
```

### 3. Setup database & seed demo data
```bash
npm run db:push
npm run db:seed
```

### 4. Start dev server
```bash
npm run dev
```

Open http://localhost:3000

**Demo login:** `demo@lexora.app` / `password123`  
**Admin login:** set `role = ADMIN` on any user row in the database (or via Prisma Studio).

---

## Environment Variables

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=<random 32-byte base64>       # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000     # Used for password-reset links and store redirects
GMAIL_USER=you@gmail.com                      # Gmail address for transactional email
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx        # Gmail App Password (not your account password)
LEMONSQUEEZY_API_KEY=...                      # Lemon Squeezy API key
LEMONSQUEEZY_STORE_ID=...                     # Lemon Squeezy store ID
LEMONSQUEEZY_WEBHOOK_SECRET=...               # Lemon Squeezy webhook signing secret
```

---

## Project Structure

```
lexora/
├── app/
│   ├── (auth)/          # login, register, forgot-password, reset-password, verify-email
│   ├── (app)/           # dashboard, words, quiz, stats, profile, store
│   ├── (admin)/         # admin panel — users, words, settings, coin packages
│   ├── api/v1/          # REST API — auth, words, quiz, stats, profile, coins, store, admin
│   └── api/auth/        # NextAuth handler
├── components/          # BottomNav, TopNav, SideNav, SessionProvider
├── contexts/            # CoinContext (live coin balance)
├── lib/
│   ├── api-client/      # Typed fetch wrappers for client components
│   ├── server/
│   │   ├── dto/         # Zod schemas + DTO types
│   │   ├── repositories/# Pure DB access (Prisma wrappers)
│   │   └── services/    # Business logic (auth, word, quiz, coin, store, settings, AI)
│   ├── auth.ts          # NextAuth authOptions
│   └── prisma.ts        # Prisma singleton
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── middleware.ts        # Route protection
```

---

## Scripts

```bash
npm run dev          # Dev server (http://localhost:3000)
npm run build        # Production build
npm run db:push      # Sync Prisma schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma GUI
npx tsc --noEmit     # Type-check without building
```

---

## Coin Economy

Users earn coins on registration and after daily quizzes. Coins are spent on AI example-sentence generation. Admins configure all costs at `/admin/settings`. Users can buy coin packs via the Lemon Squeezy store at `/store`. The webhook at `/api/v1/store/webhook` verifies HMAC-SHA256 signatures and credits coins automatically.

---

## Spaced Repetition (SM-2)

Words are scheduled using the SM-2 algorithm — correct answers extend review intervals exponentially via `easeFactor`; wrong answers reset to 1 day. The quiz generator always prioritises due words and weak words first, capped at 100 words per session.

---

## Deploy to Vercel

1. Create a PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Add all environment variables in the Vercel dashboard.
3. Deploy: `vercel deploy`
4. Run `npx prisma db push` against the production database.

---

## Tech Stack

Next.js 14 App Router · TypeScript · Prisma ORM · PostgreSQL (Neon) · NextAuth.js · Tailwind CSS · Material Design 3 tokens · Recharts · Zod · Lemon Squeezy · Nodemailer · Claude AI
