import Link from "next/link";
import { requireUserId } from "@/lib/server/auth";
import { statsService } from "@/lib/server/services/stats.service";

const WORD_GRADIENTS = [
  "linear-gradient(135deg,#0058be,#4d8ce0)",
  "linear-gradient(135deg,#006c49,#00a372)",
  "linear-gradient(135deg,#924700,#c47b00)",
  "linear-gradient(135deg,#6d28d9,#a855f7)",
  "linear-gradient(135deg,#b91c1c,#ef4444)",
  "linear-gradient(135deg,#0369a1,#38bdf8)",
];

export default async function DashboardPage() {
  const userId = await requireUserId();
  const data = await statsService.dashboard(userId);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const greetingIcon =
    hour < 12 ? "wb_sunny" : hour < 17 ? "partly_cloudy_day" : "nights_stay";

  const dailyGoal  = data.user?.dailyGoal ?? 10;
  const goalPercent = Math.min(100, Math.round((data.todayWords / dailyGoal) * 100));
  const wordsToGoal = Math.max(0, dailyGoal - data.todayWords);
  const currentStreak = data.streak?.currentDays ?? 0;
  const level = data.streak?.level ?? 1;
  const firstName = data.user?.name?.split(" ")[0] ?? "Learner";

  const statCards = [
    {
      icon: "local_fire_department",
      value: currentStreak.toLocaleString(),
      label: "Day Streak",
      badge: currentStreak > 0 ? "🔥 Active" : undefined,
      bg: "linear-gradient(135deg,#0058be,#2170e4)",
      delay: "0ms",
    },
    {
      icon: "menu_book",
      value: data.wordCount.toLocaleString(),
      label: "Words Added",
      bg: "linear-gradient(135deg,#006c49,#009965)",
      delay: "80ms",
    },
    {
      icon: "star",
      value: (data.streak?.totalXP ?? 0).toLocaleString(),
      label: "Total XP",
      bg: "linear-gradient(135deg,#924700,#c47b00)",
      delay: "160ms",
    },
    {
      icon: "verified",
      value: data.masteredCount.toLocaleString(),
      label: "Mastered",
      bg: "linear-gradient(135deg,#1c2526,#2e3132)",
      delay: "240ms",
    },
  ];

  return (
    <div className="py-4 space-y-5 lg:py-0 lg:space-y-6">

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <header
        className="relative overflow-hidden rounded-3xl bg-gradient-primary p-6 lg:p-8 text-on-primary shadow-lg shadow-primary/25"
        style={{ animation: "fade-up 0.5s ease both" }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-14 -right-14 w-52 h-52 lg:w-72 lg:h-72 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-36 h-36 lg:w-52 lg:h-52 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute top-8 right-[28%] w-12 h-12 bg-white/5 rounded-full pointer-events-none hidden lg:block" />

        <div className="relative">
          {/* Greeting + level badge */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className="material-symbols-outlined text-[16px] text-on-primary/70"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {greetingIcon}
                </span>
                <span className="text-on-primary/70 font-semibold text-xs tracking-wider uppercase">
                  {greeting}
                </span>
              </div>
              <h1 className="font-headline text-3xl lg:text-4xl font-extrabold tracking-tight">
                {firstName}! 👋
              </h1>
              <p className="text-on-primary/70 text-sm mt-1">
                {wordsToGoal === 0
                  ? "You crushed today's goal. Keep the streak alive! 🎉"
                  : `${wordsToGoal} word${wordsToGoal !== 1 ? "s" : ""} left to reach your daily goal.`}
              </p>
            </div>

            {/* Level badge */}
            <div className="shrink-0 bg-white/15 border border-white/25 rounded-2xl px-3 py-2.5 lg:px-4 lg:py-3 text-center min-w-[60px]">
              <span className="block text-[10px] font-bold text-on-primary/70 uppercase tracking-wide leading-none mb-1">
                Level
              </span>
              <span className="font-headline text-2xl lg:text-3xl font-extrabold leading-none">
                {level}
              </span>
            </div>
          </div>

          {/* Daily progress bar */}
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-on-primary/70">
              <span>{data.todayWords} / {dailyGoal} words today</span>
              <span>{goalPercent}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/90 rounded-full transition-all duration-1000"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-5 flex gap-3">
            <Link
              href="/quiz"
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white text-primary py-2.5 lg:px-6 rounded-2xl text-sm font-bold shadow-md active:scale-95 transition-transform hover:shadow-lg"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                play_arrow
              </span>
              Start Quiz
            </Link>
            <Link
              href="/words/add"
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white/15 text-on-primary border border-white/30 py-2.5 lg:px-6 rounded-2xl text-sm font-bold active:scale-95 transition-transform hover:bg-white/25"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Word
            </Link>
          </div>
        </div>
      </header>

      {/* ── Stats Row ───────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="relative overflow-hidden rounded-2xl p-4 lg:p-5 flex flex-col justify-between min-h-[120px] lg:min-h-[140px] shadow-md"
            style={{ background: s.bg, animation: `fade-up 0.5s ease ${s.delay} both` }}
          >
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
            <div className="flex items-start justify-between">
              <span
                className="material-symbols-outlined text-white/90 text-2xl lg:text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {s.icon}
              </span>
              {s.badge && (
                <span className="text-[9px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                  {s.badge}
                </span>
              )}
            </div>
            <div>
              <div className="font-headline text-3xl lg:text-4xl font-extrabold text-white leading-none">
                {s.value}
              </div>
              <div className="text-white/70 text-xs font-semibold mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* ── Recent Words ────────────────────────────────────────── */}
      <section
        className="lg:bg-surface-container-lowest lg:rounded-3xl lg:p-6 lg:shadow-sm"
        style={{ animation: "fade-up 0.5s ease 300ms both" }}
      >
        <div className="flex items-center justify-between px-1 lg:px-0 mb-4">
          <div>
            <h3 className="font-headline font-bold text-lg lg:text-xl text-on-surface">
              Recent Words
            </h3>
            <p className="text-on-surface-variant text-xs mt-0.5 hidden lg:block">
              Your latest vocabulary additions
            </p>
          </div>
          <Link
            href="/words"
            className="flex items-center gap-0.5 text-primary text-sm font-semibold hover:underline shrink-0"
          >
            View All
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>

        {data.recentWords.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-10 text-center">
            <span
              className="material-symbols-outlined text-5xl text-primary/40 mb-3 block"
              style={{
                animation: "float 3s ease-in-out infinite",
                fontVariationSettings: "'FILL' 1",
              }}
            >
              auto_stories
            </span>
            <p className="font-headline font-bold text-on-surface mb-1">
              Start your vocabulary journey
            </p>
            <p className="text-on-surface-variant text-sm">
              Add your first word and begin learning today.
            </p>
            <Link
              href="/words/add"
              className="mt-4 inline-flex items-center gap-2 bg-gradient-primary text-on-primary px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm"
            >
              <span className="material-symbols-outlined text-base">add</span>
              Add a word
            </Link>
          </div>
        ) : (
          <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {data.recentWords.map((w, i) => (
              <div
                key={w.id}
                className="group bg-surface-container-lowest p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200"
                style={{ animation: `fade-up 0.45s ease ${380 + i * 55}ms both` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white font-headline text-sm shrink-0 shadow-sm"
                    style={{ background: WORD_GRADIENTS[i % WORD_GRADIENTS.length] }}
                  >
                    {w.englishWord.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-on-surface text-sm truncate">
                      {w.englishWord}
                    </h4>
                    <p className="text-xs text-on-surface-variant italic truncate">
                      {w.meaning.length > 42
                        ? w.meaning.slice(0, 42) + "…"
                        : w.meaning}
                    </p>
                  </div>
                </div>
                {(w.wordStats?.correctCount ?? 0) >= 3 ? (
                  <span
                    className="material-symbols-outlined text-secondary shrink-0 ml-2"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-outline shrink-0 ml-2 group-hover:text-primary transition-colors">
                    schedule
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
