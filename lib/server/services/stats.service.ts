import { startOfDay, subDays, format } from "date-fns";
import { quizRepo } from "../repositories/quiz.repo";
import { statsRepo } from "../repositories/stats.repo";
import { streakRepo } from "../repositories/streak.repo";
import { userRepo } from "../repositories/user.repo";
import { wordRepo } from "../repositories/word.repo";
import type { StatsDetailDto, StatsSummaryDto } from "../dto/stats";

const DAY_MS = 86_400_000;

export const statsService = {
  async summary(userId: string): Promise<StatsSummaryDto> {
    const [streak, totalWords, masteredWords, totalQuizzes, agg] = await Promise.all([
      streakRepo.findByUserId(userId),
      wordRepo.count(userId),
      wordRepo.countMastered(userId),
      quizRepo.count(userId),
      quizRepo.aggregate(userId),
    ]);

    const avgAccuracy =
      totalQuizzes > 0 && agg._sum.totalQuestions && agg._sum.totalQuestions > 0
        ? Math.round(((agg._avg.score ?? 0) / (agg._sum.totalQuestions / totalQuizzes)) * 100)
        : 0;

    return {
      currentStreak: streak?.currentDays ?? 0,
      longestStreak: streak?.longestDays ?? 0,
      totalXP: streak?.totalXP ?? 0,
      level: streak?.level ?? 1,
      totalWords,
      masteredWords,
      totalQuizzes,
      avgAccuracy,
    };
  },

  async detail(userId: string): Promise<StatsDetailDto> {
    const [streak, totalWords, quizzes, wordStatsList, weakWords] = await Promise.all([
      streakRepo.findByUserId(userId),
      wordRepo.count(userId),
      quizRepo.listRecent(userId, 20),
      statsRepo.listWordStatsForUser(userId),
      wordRepo.findWeak(userId, 5),
    ]);

    const last7 = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return { label: format(date, "EEE"), iso: startOfDay(date) };
    });

    const weeklyActivity = await Promise.all(
      last7.map(async ({ label, iso }) => {
        const next = new Date(iso.getTime() + DAY_MS);
        const count = await wordRepo.countCreatedBetween(userId, iso, next);
        return { date: label, count };
      })
    );

    const quizHistory = quizzes
      .map((q) => ({
        date: format(new Date(q.createdAt), "MMM d"),
        accuracy: q.totalQuestions > 0 ? Math.round((q.score / q.totalQuestions) * 100) : 0,
      }))
      .reverse();

    const avgAccuracy =
      quizzes.length > 0
        ? Math.round(
            quizzes.reduce(
              (sum, q) => sum + (q.totalQuestions > 0 ? (q.score / q.totalQuestions) * 100 : 0),
              0
            ) / quizzes.length
          )
        : 0;

    const masteredWords = wordStatsList.filter((ws) => ws.correctCount >= 3).length;

    return {
      currentStreak: streak?.currentDays ?? 0,
      longestStreak: streak?.longestDays ?? 0,
      totalXP: streak?.totalXP ?? 0,
      level: streak?.level ?? 1,
      totalWords,
      masteredWords,
      totalQuizzes: quizzes.length,
      avgAccuracy,
      weeklyActivity,
      quizHistory,
      weakWords: weakWords.map((w) => ({
        word: w.englishWord,
        wrong: w.wordStats?.wrongCount ?? 0,
        correct: w.wordStats?.correctCount ?? 0,
      })),
    };
  },

  async dashboard(userId: string) {
    const todayStart = startOfDay(new Date());

    const [user, streak, wordCount, masteredCount, recentWords, recentQuiz, todayWords] =
      await Promise.all([
        userRepo.getSummary(userId),
        streakRepo.findByUserId(userId),
        wordRepo.count(userId),
        wordRepo.countMastered(userId),
        wordRepo.findRecentMinimal(userId, 5),
        quizRepo.findLatest(userId),
        wordRepo.countCreatedBetween(userId, todayStart, new Date(todayStart.getTime() + DAY_MS)),
      ]);

    return { user, streak, wordCount, masteredCount, recentWords, recentQuiz, todayWords };
  },
};
