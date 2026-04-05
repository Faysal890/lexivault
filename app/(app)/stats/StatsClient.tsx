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
    <div className="py-4 space-y-6">
      <header>
        <p className="text-secondary font-semibold text-xs tracking-wider uppercase mb-1">Your Journey</p>
        <h1 className="font-headline text-3xl font-extrabold text-on-surface">Progress & Stats</h1>
      </header>

      {/* Level Card */}
      <div className="bg-gradient-to-br from-primary to-primary-container rounded-3xl p-6 text-on-primary relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-on-primary/70 text-xs font-bold uppercase tracking-wider">Current Level</p>
              <h2 className="font-headline text-4xl font-extrabold">{streak.level}</h2>
            </div>
            <div className="text-right">
              <p className="text-on-primary/70 text-xs font-bold uppercase tracking-wider">Total XP</p>
              <p className="font-headline text-2xl font-extrabold">{streak.totalXP.toLocaleString()}</p>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-on-primary/70 font-semibold">
              <span>Level {streak.level}</span>
              <span>{xpToNext} XP to Level {streak.level + 1}</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: "local_fire_department", bg: "bg-primary-fixed", text: "text-primary", v: streak.current, l: "Day Streak", sub: `Best: ${streak.longest}` },
          { icon: "menu_book", bg: "bg-secondary-container", text: "text-secondary", v: totalWords, l: "Total Words", sub: `${masteredWords} mastered` },
          { icon: "psychology", bg: "bg-tertiary-fixed", text: "text-tertiary", v: totalQuizzes, l: "Quizzes Taken", sub: `Avg ${avgAccuracy}% acc.` },
          { icon: "verified", bg: "bg-surface-container", text: "text-on-surface-variant", v: `${avgAccuracy}%`, l: "Avg Accuracy", sub: "quiz performance" },
        ].map((s) => (
          <div key={s.l} className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <span className={`material-symbols-outlined ${s.text} text-xl`} style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
            </div>
            <div className="font-headline text-2xl font-extrabold text-on-surface">{s.v}</div>
            <div className="text-on-surface-variant text-xs font-semibold mt-0.5">{s.l}</div>
            <div className="text-outline text-[10px] mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm">
        <h3 className="font-headline font-bold text-on-surface mb-4">Words Added This Week</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyActivity} barSize={24}>
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
      {quizHistory.length > 1 && (
        <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm">
          <h3 className="font-headline font-bold text-on-surface mb-4">Quiz Accuracy Trend</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={quizHistory}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e4" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#424754" }} />
              <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#424754" }} width={25} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #e1e3e4", borderRadius: "12px", fontSize: "12px" }} formatter={(v: number) => [`${v}%`, "Accuracy"]} />
              <Line type="monotone" dataKey="accuracy" stroke="#006c49" strokeWidth={2.5} dot={{ fill: "#006c49", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weak Words */}
      {weakWords.length > 0 && (
        <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm">
          <h3 className="font-headline font-bold text-on-surface mb-3">Words to Practice</h3>
          <div className="space-y-2">
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
