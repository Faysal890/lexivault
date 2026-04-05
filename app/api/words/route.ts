import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const wordSchema = z.object({
  englishWord: z.string().min(1).max(100).trim(),
  meaning: z.string().min(1).max(500).trim(),
  exampleSentence: z.string().max(500).optional().default(""),
  difficultyLevel: z.number().int().min(1).max(3).default(1),
  tags: z.string().max(200).optional().default(""),
});

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const words = await prisma.word.findMany({
    where: {
      userId: session.user.id,
      ...(q ? { OR: [{ englishWord: { contains: q } }, { meaning: { contains: q } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { wordStats: true },
  });
  return NextResponse.json(words);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const data = wordSchema.parse(body);

    const word = await prisma.word.create({
      data: {
        ...data,
        exampleSentence: data.exampleSentence || null,
        userId: session.user.id,
        wordStats: { create: {} },
      },
    });

    // Update streak activity
    await updateStreak(session.user.id, 5); // 5 XP per word

    return NextResponse.json(word, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error(err);
    return NextResponse.json({ error: "Failed to create word" }, { status: 500 });
  }
}

async function updateStreak(userId: string, xpGain: number) {
  const streak = await prisma.streak.findUnique({ where: { userId } });
  if (!streak) return;

  const now = new Date();
  const lastActivity = streak.lastActivity;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);

  let newDays = streak.currentDays;
  if (!lastActivity || lastActivity < yesterday) {
    newDays = 1;
  } else if (lastActivity >= yesterday && lastActivity < today) {
    newDays = streak.currentDays + 1;
  }

  const newXP = streak.totalXP + xpGain;
  const newLevel = Math.floor(newXP / 100) + 1;

  await prisma.streak.update({
    where: { userId },
    data: {
      currentDays: newDays,
      longestDays: Math.max(streak.longestDays, newDays),
      lastActivity: now,
      totalXP: newXP,
      level: newLevel,
    },
  });
}
