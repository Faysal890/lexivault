"use client";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  streak: { current: number; longest: number; totalXP: number; level: number };
  totalWords: number;
  masteredWords: number;
  totalQuizzes: number;
  avgAccuracy: number;
  weeklyActivity: { date: string; count: number }[];
  quizHistory: { date: string; accuracy: number }[];
  weakWords: { word: string; wrong: number; correct: number }[];
}

export default function StatsClient({ streak, totalWords, masteredWords, totalQuizzes, avgAccuracy, weeklyActivity, quizHistory, weakWords }: Props) {
  const xpToNext = (streak.level * 100) - (streak.totalXP % (streak.level * 100));
  const levelProgress = Math.min(100, 100 - Math.round((xpToNext / (streak.level * 100)) * 100));

  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8">
      <header>
        <p className="text-secondary font-semibold text-xs tracking-wider uppercase mb-1">Your Journey</p>
        <h1 className="font-headline text-3xl lg:text-4xl font-extrabold text-on-surface">Progress & Stats</h1>
        <p className="hidden lg:block text-on-surface-variant text-sm mt-1">Track your vocabulary growth, streaks and quiz performance.</p>
      </header>

      {/* Level Card */}
      <div className="bg-gradient-to-br from-primary to-primary-container rounded-3xl p-6 lg:p-8 text-on-primary relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 lg:w-40 lg:h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 lg:w-32 lg:h-32 bg-white/10 rounded-full" />
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-white/5 rounded-full hidden lg:block" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <div>
              <p className="text-on-primary/70 text-xs font-bold uppercase tracking-wider">Current Level</p>
              <h2 className="font-headline text-4xl lg:text-6xl font-extrabold">{streak.level}</h2>
            </div>
            <div className="text-right">
              <p className="text-on-primary/70 text-xs font-bold uppercase tracking-wider">Total XP</p>
              <p className="font-headline text-2xl lg:text-4xl font-extrabold">{streak.totalXP.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-1.5 lg:max-w-2xl">
            <div className="flex justify-between text-xs text-on-primary/70 font-semibold">
              <span>Level {streak.level}</span>
              <span>{xpToNext} XP to Level {streak.level + 1}</span>
            </div>
            <div className="h-2 lg:h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {[
          { icon: "local_fire_department", bg: "bg-primary-fixed", text: "text-primary", v: streak.current, l: "Day Streak", sub: `Best: ${streak.longest}` },
          { icon: "menu_book", bg: "bg-secondary-container", text: "text-secondary", v: totalWords, l: "Total Words", sub: `${masteredWords} mastered` },
          { icon: "psychology", bg: "bg-tertiary-fixed", text: "text-tertiary", v: totalQuizzes, l: "Quizzes Taken", sub: `Avg ${avgAccuracy}% acc.` },
          { icon: "verified", bg: "bg-surface-container", text: "text-on-surface-variant", v: `${avgAccuracy}%`, l: "Avg Accuracy", sub: "quiz performance" },
        ].map((s) => (
          <div key={s.l} className="bg-surface-container-lowest rounded-2xl p-4 lg:p-5 shadow-sm">
            <div className={`w-9 h-9 lg:w-11 lg:h-11 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <span className={`material-symbols-outlined ${s.text} text-xl lg:text-2xl`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div className="font-headline text-2xl lg:text-3xl font-extrabold text-on-surface">{s.v}</div>
            <div className="text-on-surface-variant text-xs lg:text-sm font-semibold mt-0.5">{s.l}</div>
            <div className="text-outline text-[10px] lg:text-xs mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {/* Weekly Activity Chart */}
        <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-6 shadow-sm">
          <h3 className="font-headline font-bold text-on-surface mb-4 lg:text-lg">Words Added This Week</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyActivity} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e4" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#424754" }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#424754" }} width={20} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #e1e3e4", borderRadius: "12px", fontSize: "12px" }}
                formatter={(v: number) => [`${v} words`, "Added"]}
              />
              <Bar dataKey="count" fill="#0058be" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quiz Accuracy Chart */}
        {quizHistory.length > 1 ? (
          <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-6 shadow-sm">
            <h3 className="font-headline font-bold text-on-surface mb-4 lg:text-lg">Quiz Accuracy Trend</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={quizHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e4" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#424754" }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#424754" }} width={25} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e1e3e4", borderRadius: "12px", fontSize: "12px" }} formatter={(v: number) => [`${v}%`, "Accuracy"]} />
                <Line type="monotone" dataKey="accuracy" stroke="#006c49" strokeWidth={2.5} dot={{ fill: "#006c49", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="hidden lg:flex bg-surface-container-lowest rounded-3xl p-6 shadow-sm flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3">show_chart</span>
            <h3 className="font-headline font-bold text-on-surface">Quiz Accuracy Trend</h3>
            <p className="text-on-surface-variant text-sm mt-1">Take a couple of quizzes to see your accuracy trend here.</p>
          </div>
        )}
      </div>

      {/* Weak Words */}
      {weakWords.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-6 shadow-sm">
          <h3 className="font-headline font-bold text-on-surface mb-3 lg:text-lg">Words to Practice</h3>
          <div className="space-y-2 lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-3 lg:space-y-0">
            {weakWords.map((w) => (
              <div key={w.word} className="flex items-center justify-between p-3 bg-error-container/20 rounded-2xl">
                <span className="font-semibold text-on-surface text-sm">{w.word}</span>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-secondary">✓ {w.correct}</span>
                  <span className="text-error">✗ {w.wrong}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
