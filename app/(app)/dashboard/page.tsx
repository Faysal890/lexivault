import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getDashboardData(userId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [user, streak, wordCount, masteredCount, recentWords, recentQuiz, todayWords] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, dailyGoal: true } }),
    prisma.streak.findUnique({ where: { userId } }),
    prisma.word.count({ where: { userId } }),
    prisma.word.count({
      where: { userId, wordStats: { correctCount: { gte: 3 } } },
    }),
    prisma.word.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { wordStats: { select: { correctCount: true } } },
    }),
    prisma.quiz.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.word.count({ where: { userId, createdAt: { gte: todayStart } } }),
  ]);

  return { user, streak, wordCount, masteredCount, recentWords, recentQuiz, todayWords };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const data = await getDashboardData(session!.user.id);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const goalPercent = Math.min(100, Math.round(((data.todayWords) / (data.user?.dailyGoal ?? 10)) * 100));
  const wordsToGoal = Math.max(0, (data.user?.dailyGoal ?? 10) - data.todayWords);

  const stats = [
    { icon: "local_fire_department", iconFill: true, bg: "bg-primary-fixed", text: "text-primary", value: data.streak?.currentDays ?? 0, label: "Day Streak" },
    { icon: "menu_book", iconFill: true, bg: "bg-secondary-container", text: "text-secondary", value: data.wordCount, label: "Words Added" },
    { icon: "star", iconFill: true, bg: "bg-tertiary-fixed", text: "text-tertiary", value: data.streak?.totalXP ?? 0, label: "XP Gained" },
    { icon: "check_circle", iconFill: true, bg: "bg-surface-container", text: "text-on-surface-variant", value: data.masteredCount, label: "Mastered" },
  ];

  return (
    <div className="py-4 space-y-6">
      {/* Header */}
      <header className="py-2">
        <p className="text-secondary font-semibold text-xs tracking-wider uppercase mb-1">Fluid Scholar</p>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
          {greeting()}, {data.user?.name?.split(" ")[0]}.
        </h1>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 rounded-2xl flex flex-col justify-between aspect-square shadow-sm">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${s.text}`} style={{ fontVariationSettings: s.iconFill ? "'FILL' 1" : "'FILL' 0" }}>
                {s.icon}
              </span>
            </div>
            <div>
              <span className="font-headline text-3xl font-extrabold text-on-surface">{s.value.toLocaleString()}</span>
              <p className="text-on-surface-variant text-sm font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Continue Learning */}
      <section className="relative overflow-hidden rounded-3xl p-6 bg-surface-container-lowest shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent pointer-events-none" />
        <div className="relative space-y-4">
          <div>
            <h2 className="font-headline text-xl font-bold text-on-surface">
              {wordsToGoal === 0 ? "Daily goal achieved! 🎉" : "Ready for your next set?"}
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              {wordsToGoal === 0
                ? "You've hit your daily target. Keep the streak alive!"
                : `You're ${wordsToGoal} words away from today's goal.`}
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
              <span>{data.todayWords} / {data.user?.dailyGoal ?? 10} words today</span>
              <span>{goalPercent}%</span>
            </div>
            <div className="h-2.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-secondary rounded-full shimmer-bar transition-all duration-700"
                style={{ width: `${goalPercent}%` }}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/quiz" className="flex-1 text-center py-3 bg-gradient-primary text-on-primary font-headline font-bold rounded-2xl text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform">
              Start Quiz
            </Link>
            <Link href="/words/add" className="flex-1 text-center py-3 bg-surface-container-high text-on-surface font-headline font-bold rounded-2xl text-sm active:scale-95 transition-transform">
              Add Words
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Words */}
      <section className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-headline font-bold text-lg text-on-surface">Recent Words</h3>
          <Link href="/words" className="text-primary text-sm font-semibold">View All</Link>
        </div>

        {data.recentWords.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2 block">add_circle</span>
            <p className="text-on-surface-variant text-sm">No words yet. Add your first word!</p>
            <Link href="/words/add" className="mt-4 inline-block text-primary font-bold text-sm">Add a word →</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentWords.map((w: { id: string; englishWord: string; meaning: string; wordStats: { correctCount: number } | null }) => (
              <div key={w.id} className="bg-surface-container-lowest p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center font-bold text-primary font-headline text-sm">
                    {w.englishWord.slice(0, 2)}
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-sm">{w.englishWord}</h4>
                    <p className="text-xs text-on-surface-variant italic">{w.meaning.slice(0, 40)}{w.meaning.length > 40 ? "…" : ""}</p>
                  </div>
                </div>
                {(w.wordStats?.correctCount ?? 0) >= 3 ? (
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                ) : (
                  <span className="material-symbols-outlined text-outline">schedule</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
