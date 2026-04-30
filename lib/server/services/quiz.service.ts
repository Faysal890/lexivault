import { BadRequestError } from "../errors";
import { wordRepo } from "../repositories/word.repo";
import { quizRepo } from "../repositories/quiz.repo";
import { statsRepo } from "../repositories/stats.repo";
import { streakService } from "./streak.service";
import { settingsService } from "./settings.service";
import { coinService } from "./coin.service";
import type { GenerateQuizQuery, QuestionType, QuizQuestionDto, SubmitQuizInput } from "../dto/quiz";

const DAY_MS = 86_400_000;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestionType(type: GenerateQuizQuery["type"]): QuestionType {
  if (type !== "mixed") return type;
  const types: QuestionType[] = ["multiple_choice", "multiple_choice", "fill_blank", "reverse"];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * SM-2: correct answers extend interval via easeFactor; wrong resets to 1 day.
 */
function calculateNextReview(correctCount: number, easeFactor: number, wasCorrect: boolean) {
  if (!wasCorrect) {
    return {
      interval: 1,
      newEase: Math.max(1.3, easeFactor - 0.2),
      nextReview: new Date(Date.now() + DAY_MS),
    };
  }
  const newEase = easeFactor + (0.1 - (5 - 4) * (0.08 + (5 - 4) * 0.02));
  let interval = 1;
  if (correctCount === 1) interval = 1;
  else if (correctCount === 2) interval = 6;
  else interval = Math.round((correctCount - 1) * newEase);
  return {
    interval,
    newEase: Math.max(1.3, newEase),
    nextReview: new Date(Date.now() + interval * DAY_MS),
  };
}

export const quizService = {
  async generate(userId: string, query: GenerateQuizQuery): Promise<QuizQuestionDto[]> {
    const allWords = await wordRepo.findRecent(userId, 100);
    if (allWords.length < 2) return [];

    const now = new Date();
    type W = (typeof allWords)[number];
    const sorted = allWords.sort((a: W, b: W) => {
      const aDue = !a.wordStats?.nextReview || new Date(a.wordStats.nextReview) <= now ? 0 : 1;
      const bDue = !b.wordStats?.nextReview || new Date(b.wordStats.nextReview) <= now ? 0 : 1;
      if (aDue !== bDue) return aDue - bDue;
      const aAcc = a.wordStats
        ? a.wordStats.correctCount / (a.wordStats.correctCount + a.wordStats.wrongCount + 1)
        : 0.5;
      const bAcc = b.wordStats
        ? b.wordStats.correctCount / (b.wordStats.correctCount + b.wordStats.wrongCount + 1)
        : 0.5;
      return aAcc - bAcc;
    });

    const quizWords = sorted.slice(0, Math.min(query.size, allWords.length));

    const questions: QuizQuestionDto[] = quizWords.map((word: W) => {
      const qType = pickQuestionType(query.type);

      if (qType === "fill_blank") {
        return {
          wordId: word.id,
          word: word.englishWord,
          meaning: word.meaning,
          questionType: "fill_blank",
          question: `What is the English word for: "${word.meaning}"?`,
          correctAnswer: word.englishWord,
        };
      }

      if (qType === "reverse") {
        const candidates = shuffle(allWords.filter((w: W) => w.id !== word.id));
        const seen = new Set([word.meaning]);
        const wrong: string[] = [];
        for (const w of candidates) {
          if (!seen.has(w.meaning)) { seen.add(w.meaning); wrong.push(w.meaning); }
          if (wrong.length === 3) break;
        }
        if (wrong.length < 1) {
          return {
            wordId: word.id, word: word.englishWord, meaning: word.meaning,
            questionType: "fill_blank",
            question: `What is the English word for: "${word.meaning}"?`,
            correctAnswer: word.englishWord,
          };
        }
        return {
          wordId: word.id,
          word: word.englishWord,
          meaning: word.meaning,
          questionType: "reverse",
          question: `What does "${word.englishWord}" mean?`,
          options: shuffle([word.meaning, ...wrong]),
          correctAnswer: word.meaning,
        };
      }

      const candidates = shuffle(allWords.filter((w: W) => w.id !== word.id));
      const seen = new Set([word.englishWord]);
      const wrong: string[] = [];
      for (const w of candidates) {
        if (!seen.has(w.englishWord)) { seen.add(w.englishWord); wrong.push(w.englishWord); }
        if (wrong.length === 3) break;
      }
      if (wrong.length < 1) {
        return {
          wordId: word.id, word: word.englishWord, meaning: word.meaning,
          questionType: "fill_blank",
          question: `Which word means: "${word.meaning}"?`,
          correctAnswer: word.englishWord,
        };
      }
      return {
        wordId: word.id,
        word: word.englishWord,
        meaning: word.meaning,
        questionType: "multiple_choice",
        question: `Which word means: "${word.meaning}"?`,
        options: shuffle([word.englishWord, ...wrong]),
        correctAnswer: word.englishWord,
      };
    });

    return shuffle(questions);
  },

  async submit(userId: string, input: SubmitQuizInput) {
    if (input.questions.length === 0) throw new BadRequestError("No questions submitted");

    // Anti-cheat: validate that every wordId belongs to this user, then recompute correctness
    // and score on the server. The client cannot grant itself XP/coins by lying.
    const wordIds = Array.from(new Set(input.questions.map((q) => q.wordId)));
    const userWords = await wordRepo.findByIdsForUser(userId, wordIds);
    if (userWords.length !== wordIds.length) {
      throw new BadRequestError("Invalid quiz submission");
    }
    const userWordMap = new Map(userWords.map((w) => [w.id, w]));

    const normalize = (s: string) => s.trim().toLowerCase();
    const validatedQuestions = input.questions.map((q) => {
      const word = userWordMap.get(q.wordId)!;
      // Determine expected answer from question type — never trust client-supplied correctAnswer.
      let expected: string;
      if (q.questionType === "reverse") {
        expected = word.meaning;
      } else {
        // multiple_choice and fill_blank both expect the English word
        expected = word.englishWord;
      }
      const userAnswer = (q.userAnswer ?? "").trim();
      const isCorrect = userAnswer.length > 0 && normalize(userAnswer) === normalize(expected);
      return {
        wordId: q.wordId,
        questionType: q.questionType,
        userAnswer,
        correctAnswer: expected,
        isCorrect,
        options: q.options ? JSON.stringify(q.options) : "[]",
      };
    });

    const validatedScore = validatedQuestions.filter((q) => q.isCorrect).length;
    const validatedTotal = validatedQuestions.length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const isFirstQuizToday = (await quizRepo.countQuizzesToday(userId, todayStart)) === 0;

    const quiz = await quizRepo.create({
      user: { connect: { id: userId } },
      score: validatedScore,
      totalQuestions: validatedTotal,
      timeTaken: input.timeTaken ?? null,
      quizType: input.quizType,
      questions: { create: validatedQuestions },
    });

    const stats = await statsRepo.findManyByWordIds(wordIds);
    const wsByWord = new Map(stats.map((s) => [s.wordId, s]));

    await Promise.all(
      validatedQuestions.map((q) => {
        const ws = wsByWord.get(q.wordId);
        if (!ws) return Promise.resolve();
        const { newEase, nextReview } = calculateNextReview(ws.correctCount, ws.easeFactor, q.isCorrect);
        return statsRepo.update(q.wordId, {
          correctCount: q.isCorrect ? { increment: 1 } : ws.correctCount,
          wrongCount: !q.isCorrect ? { increment: 1 } : ws.wrongCount,
          lastReviewed: new Date(),
          nextReview,
          easeFactor: newEase,
        });
      })
    );

    const accuracy = validatedTotal > 0 ? validatedScore / validatedTotal : 0;
    const xpGain = Math.round(validatedScore * 10 * (accuracy >= 0.8 ? 1.5 : 1));
    await streakService.addXp(userId, xpGain);

    let coinsEarned = 0;
    let newCoinBalance: number | undefined;
    if (isFirstQuizToday) {
      const settings = await settingsService.getSettings();
      if (settings.dailyQuizCoins > 0) {
        newCoinBalance = await coinService.addCoins(userId, settings.dailyQuizCoins, "QUIZ_REWARD", "Daily quiz reward");
        coinsEarned = settings.dailyQuizCoins;
      }
    }

    return { quizId: quiz.id, score: validatedScore, totalQuestions: validatedTotal, xpGained: xpGain, coinsEarned, newCoinBalance };
  },
};
