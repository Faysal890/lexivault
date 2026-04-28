import Link from "next/link";
import { requireUserId } from "@/lib/server/auth";
import { statsService } from "@/lib/server/services/stats.service";

export default async function DashboardPage() {
  const userId = await requireUserId();
  const data = await statsService.dashboard(userId);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const dailyGoal = data.user?.dailyGoal ?? 10;
  const goalPercent = Math.min(100, Math.round((data.todayWords / dailyGoal) * 100));
  const wordsToGoal = Math.max(0, dailyGoal - data.todayWords);

  const stats = [
    { icon: "local_fire_department", iconFill: true, bg: "bg-primary-fixed", text: "text-primary", value: data.streak?.currentDays ?? 0, label: "Day Streak" },
    { icon: "menu_book", iconFill: true, bg: "bg-secondary-container", text: "text-secondary", value: data.wordCount, label: "Words Added" },
    { icon: "star", iconFill: true, bg: "bg-tertiary-fixed", text: "text-tertiary", value: data.streak?.totalXP ?? 0, label: "XP Gained" },
    { icon: "check_circle", iconFill: true, bg: "bg-surface-container", text: "text-on-surface-variant", value: data.masteredCount, label: "Mastered" },
  ];

  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8">
      {/* Header */}
      <header className="py-2 lg:flex lg:items-end lg:justify-between lg:py-0">
        <div>
          <p className="text-secondary font-semibold text-xs tracking-wider uppercase mb-1">Fluid Scholar</p>
          <h1 className="font-headline text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
            {greeting()}, {data.user?.name?.split(" ")[0]}.
          </h1>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/words/add" className="flex items-center gap-1.5 bg-surface-container-high text-on-surface px-4 py-2.5 rounded-2xl text-sm font-bold hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-base">add</span> Add Word
          </Link>
          <Link href="/quiz" className="flex items-center gap-1.5 bg-gradient-primary text-on-primary px-4 py-2.5 rounded-2xl text-sm font-bold shadow-md shadow-primary/20 hover:shadow-lg transition-shadow">
            <span className="material-symbols-outlined text-base">play_arrow</span> Start Quiz
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-5 lg:p-6 rounded-2xl flex flex-col justify-between aspect-square lg:aspect-auto shadow-sm">
            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl ${s.bg} flex items-center justify-center`}>
              <span className={`material-symbols-outlined ${s.text} lg:text-[28px]`} style={{ fontVariationSettings: s.iconFill ? "'FILL' 1" : "'FILL' 0" }}>
                {s.icon}
              </span>
            </div>
            <div className="lg:mt-6">
              <span className="font-headline text-3xl lg:text-4xl font-extrabold text-on-surface">{s.value.toLocaleString()}</span>
              <p className="text-on-surface-variant text-sm font-medium">{s.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Continue Learning + Recent Words */}
      <div className="space-y-6 lg:grid lg:grid-cols-5 lg:gap-6 lg:space-y-0">
        {/* Continue Learning */}
        <section className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-surface-container-lowest shadow-sm lg:col-span-2">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent pointer-events-none" />
          <div className="relative space-y-4 lg:h-full lg:flex lg:flex-col">
            <div>
              <h2 className="font-headline text-xl lg:text-2xl font-bold text-on-surface">
                {wordsToGoal === 0 ? "Daily goal achieved! 🎉" : "Ready for your next set?"}
              </h2>
              <p className="text-on-surface-variant text-sm mt-1">
                {wordsToGoal === 0
                  ? "You've hit your daily target. Keep the streak alive!"
                  : `You're ${wordsToGoal} words away from today's goal.`}
              </p>
            </div>
            <div className="space-y-2 lg:flex-1 lg:flex lg:flex-col lg:justify-end">
              <div className="flex justify-between text-xs font-semibold text-on-surface-variant">
                <span>{data.todayWords} / {dailyGoal} words today</span>
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
        <section className="space-y-3 lg:col-span-3 lg:bg-surface-container-lowest lg:rounded-3xl lg:p-6 lg:shadow-sm lg:space-y-4">
          <div className="flex items-center justify-between px-1 lg:px-0">
            <h3 className="font-headline font-bold text-lg lg:text-xl text-on-surface">Recent Words</h3>
            <Link href="/words" className="text-primary text-sm font-semibold hover:underline">View All →</Link>
          </div>

          {data.recentWords.length === 0 ? (
            <div className="bg-surface-container-lowest lg:bg-surface-container-low rounded-2xl p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2 block">add_circle</span>
              <p className="text-on-surface-variant text-sm">No words yet. Add your first word!</p>
              <Link href="/words/add" className="mt-4 inline-block text-primary font-bold text-sm">Add a word →</Link>
            </div>
          ) : (
            <div className="space-y-2 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
              {data.recentWords.map((w) => (
                <div key={w.id} className="bg-surface-container-lowest lg:bg-surface-container-low p-4 rounded-2xl flex items-center justify-between shadow-sm lg:shadow-none hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center font-bold text-primary font-headline text-sm shrink-0">
                      {w.englishWord.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-on-surface text-sm truncate">{w.englishWord}</h4>
                      <p className="text-xs text-on-surface-variant italic truncate">{w.meaning.slice(0, 40)}{w.meaning.length > 40 ? "…" : ""}</p>
                    </div>
                  </div>
                  {(w.wordStats?.correctCount ?? 0) >= 3 ? (
                    <span className="material-symbols-outlined text-secondary shrink-0 ml-2" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  ) : (
                    <span className="material-symbols-outlined text-outline shrink-0 ml-2">schedule</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
