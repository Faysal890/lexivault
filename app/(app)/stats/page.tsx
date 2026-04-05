import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import StatsClient from "./StatsClient";
import { subDays, format, startOfDay } from "date-fns";

export default async function StatsPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [streak, totalWords, quizzes, wordStats, weakWords] = await Promise.all([
    prisma.streak.findUnique({ where: { userId } }),
    prisma.word.count({ where: { userId } }),
    prisma.quiz.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.wordStats.findMany({ where: { word: { userId } }, include: { word: { select: { englishWord: true, meaning: true } } } }),
    prisma.word.findMany({
      where: { userId, wordStats: { wrongCount: { gte: 2 } } },
      include: { wordStats: true },
      orderBy: { wordStats: { wrongCount: "desc" } },
      take: 5,
    }),
  ]);

  // Weekly activity - words added per day
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return { date: format(date, "EEE"), isoDate: startOfDay(date).toISOString() };
  });

  const wordsByDay = await Promise.all(
    last7.map(async ({ date, isoDate }) => {
      const nextDay = new Date(new Date(isoDate).getTime() + 86400000);
      const count = await prisma.word.count({
        where: { userId, createdAt: { gte: new Date(isoDate), lt: nextDay } },
      });
      return { date, count };
    })
  );

  type QuizRow = { createdAt: Date; score: number; totalQuestions: number };
  const quizScores = (quizzes as QuizRow[]).map((q) => ({
    date: format(new Date(q.createdAt), "MMM d"),
    accuracy: q.totalQuestions > 0 ? Math.round((q.score / q.totalQuestions) * 100) : 0,
  })).reverse();

  const avgAccuracy = quizzes.length > 0
    ? Math.round((quizzes as QuizRow[]).reduce((sum: number, q) => sum + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0), 0) / quizzes.length)
    : 0;

  type WsRow = { correctCount: number };
  const masteredWords = (wordStats as WsRow[]).filter((ws) => ws.correctCount >= 3).length;

  return (
    <StatsClient
      streak={{ current: streak?.currentDays ?? 0, longest: streak?.longestDays ?? 0, totalXP: streak?.totalXP ?? 0, level: streak?.level ?? 1 }}
      totalWords={totalWords}
      masteredWords={masteredWords}
      totalQuizzes={quizzes.length}
      avgAccuracy={avgAccuracy}
      weeklyActivity={wordsByDay}
      quizHistory={quizScores}
      weakWords={weakWords.map((w: { englishWord: string; wordStats: { wrongCount: number; correctCount: number } | null }) => ({ word: w.englishWord, wrong: w.wordStats?.wrongCount ?? 0, correct: w.wordStats?.correctCount ?? 0 }))}
    />
  );
}
