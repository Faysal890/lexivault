import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const [streak, totalWords, masteredWords, totalQuizzes, avgAccuracyRaw] = await Promise.all([
    prisma.streak.findUnique({ where: { userId } }),
    prisma.word.count({ where: { userId } }),
    prisma.word.count({ where: { userId, wordStats: { correctCount: { gte: 3 } } } }),
    prisma.quiz.count({ where: { userId } }),
    prisma.quiz.aggregate({ where: { userId }, _avg: { score: true }, _sum: { totalQuestions: true } }),
  ]);

  const avgAccuracy = avgAccuracyRaw._sum.totalQuestions && avgAccuracyRaw._sum.totalQuestions > 0
    ? Math.round(((avgAccuracyRaw._avg.score ?? 0) / (avgAccuracyRaw._sum.totalQuestions / (await prisma.quiz.count({ where: { userId } })))) * 100)
    : 0;

  return NextResponse.json({
    currentStreak: streak?.currentDays ?? 0,
    longestStreak: streak?.longestDays ?? 0,
    totalXP: streak?.totalXP ?? 0,
    level: streak?.level ?? 1,
    totalWords,
    masteredWords,
    totalQuizzes,
    avgAccuracy,
  });
}
