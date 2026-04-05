import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// SM-2 Spaced Repetition Algorithm
function calculateNextReview(correctCount: number, easeFactor: number, wasCorrect: boolean) {
  if (!wasCorrect) {
    return { interval: 1, newEase: Math.max(1.3, easeFactor - 0.2), nextReview: new Date(Date.now() + 86400000) };
  }
  const newEase = easeFactor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02));
  let interval = 1;
  if (correctCount === 1) interval = 1;
  else if (correctCount === 2) interval = 6;
  else interval = Math.round((correctCount - 1) * newEase);
  const nextReview = new Date(Date.now() + interval * 86400000);
  return { interval, newEase: Math.max(1.3, newEase), nextReview };
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { questions, score, totalQuestions, quizType } = await req.json();

    // Save quiz record
    const quiz = await prisma.quiz.create({
      data: {
        userId: session.user.id,
        score,
        totalQuestions,
        quizType: quizType ?? "mixed",
        questions: {
          create: questions.map((q: {
            wordId: string; questionType: string; userAnswer: string;
            correctAnswer: string; isCorrect: boolean; options?: string[];
          }) => ({
            wordId: q.wordId,
            questionType: q.questionType,
            userAnswer: q.userAnswer ?? "",
            correctAnswer: q.correctAnswer,
            isCorrect: q.isCorrect,
            options: q.options ? JSON.stringify(q.options) : "[]",
          })),
        },
      },
    });

    // Update word stats using SRS
    for (const q of questions) {
      const ws = await prisma.wordStats.findUnique({ where: { wordId: q.wordId } });
      if (!ws) continue;
      const { newEase, nextReview } = calculateNextReview(ws.correctCount, ws.easeFactor, q.isCorrect);
      await prisma.wordStats.update({
        where: { wordId: q.wordId },
        data: {
          correctCount: q.isCorrect ? { increment: 1 } : ws.correctCount,
          wrongCount: !q.isCorrect ? { increment: 1 } : ws.wrongCount,
          lastReviewed: new Date(),
          nextReview,
          easeFactor: newEase,
        },
      });
    }

    // Award XP based on performance
    const accuracy = totalQuestions > 0 ? score / totalQuestions : 0;
    const xpGain = Math.round(score * 10 * (accuracy >= 0.8 ? 1.5 : 1));

    // Update streak
    const streak = await prisma.streak.findUnique({ where: { userId: session.user.id } });
    if (streak) {
      const now = new Date();
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const lastActivity = streak.lastActivity;

      let newDays = streak.currentDays;
      if (!lastActivity || lastActivity < yesterday) newDays = 1;
      else if (lastActivity >= yesterday && lastActivity < today) newDays = streak.currentDays + 1;

      const newXP = streak.totalXP + xpGain;
      const newLevel = Math.floor(newXP / 100) + 1;

      await prisma.streak.update({
        where: { userId: session.user.id },
        data: {
          currentDays: newDays,
          longestDays: Math.max(streak.longestDays, newDays),
          lastActivity: now,
          totalXP: newXP,
          level: newLevel,
        },
      });
    }

    return NextResponse.json({ quizId: quiz.id, xpGained: xpGain });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to submit quiz" }, { status: 500 });
  }
}
