import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestionType(type: string, wordType: "multiple_choice" | "fill_blank" | "reverse") {
  if (type !== "mixed") return type as "multiple_choice" | "fill_blank" | "reverse";
  const types: ("multiple_choice" | "fill_blank" | "reverse")[] = ["multiple_choice", "multiple_choice", "fill_blank", "reverse"];
  return types[Math.floor(Math.random() * types.length)];
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "mixed";
  const size = Math.min(20, Math.max(5, parseInt(searchParams.get("size") ?? "10")));

  // Fetch user words with SRS priority (cap at 100 to avoid loading entire collection)
  const allWords = await prisma.word.findMany({
    where: { userId: session.user.id },
    include: { wordStats: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  if (allWords.length < 2) {
    return NextResponse.json({ questions: [], error: "Not enough words" });
  }

  // SRS: prioritize words due for review or with low accuracy
  const now = new Date();
  type WordWithStats = typeof allWords[0];
  const sortedWords = allWords.sort((a: WordWithStats, b: WordWithStats) => {
    const aStats = a.wordStats;
    const bStats = b.wordStats;
    const aDue = !aStats?.nextReview || new Date(aStats.nextReview) <= now ? 0 : 1;
    const bDue = !bStats?.nextReview || new Date(bStats.nextReview) <= now ? 0 : 1;
    if (aDue !== bDue) return aDue - bDue;
    const aAccuracy = aStats ? aStats.correctCount / (aStats.correctCount + aStats.wrongCount + 1) : 0.5;
    const bAccuracy = bStats ? bStats.correctCount / (bStats.correctCount + bStats.wrongCount + 1) : 0.5;
    return aAccuracy - bAccuracy;
  });

  const quizWords = sortedWords.slice(0, Math.min(size, allWords.length));
  const wordPool = allWords; // For generating wrong options

  const questions = quizWords.map((word: WordWithStats) => {
    const qType = pickQuestionType(type, "multiple_choice");

    if (qType === "fill_blank") {
      return {
        wordId: word.id,
        word: word.englishWord,
        meaning: word.meaning,
        questionType: "fill_blank" as const,
        question: `What is the English word for: "${word.meaning}"?`,
        correctAnswer: word.englishWord,
      };
    }

    if (qType === "reverse") {
      // Show English word, pick native meaning
      const wrongOptions = shuffle(wordPool.filter((w: WordWithStats) => w.id !== word.id)).slice(0, 3).map((w: WordWithStats) => w.meaning);
      const options = shuffle([word.meaning, ...wrongOptions]);
      return {
        wordId: word.id,
        word: word.englishWord,
        meaning: word.meaning,
        questionType: "reverse" as const,
        question: `What does "${word.englishWord}" mean?`,
        options,
        correctAnswer: word.meaning,
      };
    }

    // Multiple choice: show meaning, pick English word
    const wrongOptions = shuffle(wordPool.filter((w: WordWithStats) => w.id !== word.id)).slice(0, 3).map((w: WordWithStats) => w.englishWord);
    const options = shuffle([word.englishWord, ...wrongOptions]);
    return {
      wordId: word.id,
      word: word.englishWord,
      meaning: word.meaning,
      questionType: "multiple_choice" as const,
      question: `Which word means: "${word.meaning}"?`,
      options,
      correctAnswer: word.englishWord,
    };
  });

  return NextResponse.json({ questions: shuffle(questions) });
}
