# 📘 Lexora — English Vocabulary Learning App

A production-ready Next.js web application for learning English vocabulary with adaptive quizzes, spaced repetition, and beautiful UI matching your Lexora design system.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Authentication | Email/password with JWT sessions via NextAuth |
| 📚 Word Management | Add, edit, delete words with meanings, examples, tags |
| 🧠 Smart Quiz | Multiple choice, fill-in-blank, reverse (meaning→word) |
| 🔁 Spaced Repetition | SM-2 algorithm schedules word reviews optimally |
| 📊 Progress Stats | Recharts for accuracy trends and weekly activity |
| 🏆 Gamification | XP points, levels, daily streaks |
| 🔊 Pronunciation | Text-to-speech for every English word |
| 📱 Mobile-First | Beautiful bottom nav, works on all screen sizes |

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Environment setup
```bash
cp .env.example .env
# Edit .env — set NEXTAUTH_SECRET with: openssl rand -base64 32
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

**Demo login:** demo@lexora.app / password123

---

## 🏗️ Project Structure

```
lexora/
├── app/
│   ├── (auth)/login & register
│   ├── (app)/dashboard, words, quiz, stats, profile
│   ├── api/auth, words, quiz, stats, profile
│   ├── layout.tsx & page.tsx (landing)
├── components/BottomNav, TopNav, SessionProvider
├── lib/auth.ts, prisma.ts
├── prisma/schema.prisma, seed.ts
└── middleware.ts (route protection)
```

---

## 🚢 Deploy to Vercel + PostgreSQL (Production)

1. Create a free PostgreSQL DB on [Neon](https://neon.tech) or [Supabase](https://supabase.com)

2. In `prisma/schema.prisma`, change the provider:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Set environment variables in Vercel dashboard:
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

4. Deploy: `vercel deploy`

5. Then run: `npx prisma db push`

---

## 🧪 Scripts

```bash
npm run dev          # Dev server
npm run build        # Production build  
npm run db:push      # Sync schema
npm run db:studio    # Prisma GUI
npm run db:seed      # Seed demo data
```

---

## 🧠 Spaced Repetition (SM-2)

Words are scheduled using the SM-2 algorithm — correct answers extend review intervals, wrong answers reset to 1 day. The quiz generator always prioritizes due words and weak words first.

---

## Tech Stack: Next.js 14 · Prisma · SQLite/PostgreSQL · NextAuth · Tailwind CSS · Recharts · Zod
