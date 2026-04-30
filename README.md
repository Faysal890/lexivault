<div align="center">

<img src="public/logo.png" alt="LexiVault" width="80" />

# LexiVault

**AI-powered vocabulary learning, built for retention.**

LexiVault combines spaced repetition, adaptive quizzes, and Claude AI to help learners build lasting English vocabulary — on any device.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?style=flat-square&logo=prisma)](https://prisma.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

[Live Demo](https://lexora.app) · [Report a Bug](https://github.com/Faysal890/Lexora/issues) · [Request a Feature](https://github.com/Faysal890/Lexora/issues)

</div>

---

## Overview

LexiVault is a full-stack SaaS vocabulary learning platform. Users build and review personal word lists, take AI-assisted adaptive quizzes scheduled by the SM-2 spaced repetition algorithm, and earn coins through daily engagement. Coins can be spent on Claude AI–generated example sentences or topped up via the built-in Lemon Squeezy coin store. Administrators control all costs and user data through a dedicated panel.

---

## Features

### For Learners
- **Smart Quizzes** — multiple choice, fill-in-blank, and reverse (meaning → word) question types
- **Spaced Repetition (SM-2)** — the quiz engine prioritises due and weak words automatically; correct answers extend intervals exponentially
- **AI Example Generation** — Claude generates contextual example sentences on demand, gated by the coin economy
- **Progress Dashboard** — accuracy trends, weekly activity heatmap, XP level, and streak tracking
- **Word Export** — download your word list as Excel, PDF, or Word; respects active search and tag filters
- **Pronunciation** — text-to-speech playback for every word

### For Operators
- **Coin Economy** — configurable balances for new-user bonus, daily quiz reward, and AI generation cost
- **Coin Store** — Lemon Squeezy–hosted checkout; packages managed in the admin panel; webhook credits coins automatically via HMAC-SHA256 verification
- **Admin Panel** — full user management, word moderation, per-user coin grants, and global settings
- **Transactional Email** — email verification and password reset via Gmail / Nodemailer; tokens are SHA-256-hashed, single-use, and time-limited

### Platform
- **Mobile-first** — bottom navigation bar on mobile; full SideNav desktop layout at the `lg:` breakpoint
- **Secure by default** — Content-Security-Policy header, rate limiting on sensitive endpoints, Zod-validated inputs with field-level max-length caps
- **Layered architecture** — routes → services → repositories; no business logic in controllers, no Prisma in services

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Language | TypeScript 5 |
| Database | PostgreSQL (Neon) via Prisma ORM |
| Auth | NextAuth.js (JWT strategy) |
| AI | Anthropic Claude API |
| Payments | Lemon Squeezy |
| Email | Nodemailer (Gmail SMTP) |
| Styling | Tailwind CSS + Material Design 3 tokens |
| Charts | Recharts |
| Validation | Zod |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A PostgreSQL database ([Neon](https://neon.tech) free tier works)
- A Gmail account with an [App Password](https://support.google.com/accounts/answer/185833)
- A [Lemon Squeezy](https://lemonsqueezy.com) account (for the coin store)
- An [Anthropic](https://console.anthropic.com) API key (for AI generation)

### 1. Clone & install

```bash
git clone https://github.com/Faysal890/Lexora.git
cd lexora
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in every value:

```env
# Database
DATABASE_URL=postgresql://...

# Auth
NEXTAUTH_SECRET=                        # openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email (Gmail)
GMAIL_USER=you@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Lemon Squeezy
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=
```

### 3. Set up the database

```bash
npm run db:push    # apply schema
npm run db:seed    # load demo data
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Role | Email | Password |
|---|---|---|
| User | `demo@lexora.app` | `password123` |
| Admin | set `role = ADMIN` in DB | — |

---

## Project Structure

```
lexora/
├── app/
│   ├── (auth)/           # login · register · forgot-password · reset-password · verify-email
│   ├── (app)/            # dashboard · words · quiz · stats · profile · store
│   ├── (admin)/          # users · words · settings · coin packages
│   └── api/v1/           # REST controllers (auth · words · quiz · stats · coins · store · admin)
├── components/           # TopNav · SideNav · BottomNav · SessionProvider
├── contexts/             # CoinContext — live balance shared across the shell
├── lib/
│   ├── api-client/       # typed fetch wrappers for client components
│   └── server/
│       ├── dto/          # Zod schemas + inferred DTO types
│       ├── repositories/ # Prisma wrappers — the only layer that touches the DB
│       └── services/     # business logic — auth · word · quiz · streak · coin · store · settings · AI
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── middleware.ts         # JWT-based route protection
```

---

## Deployment

### Vercel (recommended)

1. Push the repo to GitHub and import it into [Vercel](https://vercel.com).
2. Add all environment variables in the Vercel dashboard (Settings → Environment Variables).
3. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production domain.
4. Deploy. After the first deploy, run:
   ```bash
   npx prisma db push
   ```
5. In your Lemon Squeezy dashboard, point the webhook to:
   ```
   https://your-domain.com/api/v1/store/webhook
   ```

---

## Scripts

```bash
npm run dev          # start development server
npm run build        # production build (runs prisma generate first)
npm run db:push      # sync schema to database
npm run db:seed      # seed demo data
npm run db:studio    # open Prisma Studio GUI
npx tsc --noEmit     # type-check without emitting
```

---

## License

MIT © [Khalilur Rahman Faysal](https://github.com/Faysal890)
