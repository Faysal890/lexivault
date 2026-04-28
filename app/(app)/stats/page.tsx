import { requireUserId } from "@/lib/server/auth";
import { statsService } from "@/lib/server/services/stats.service";
import StatsClient from "./StatsClient";

export default async function StatsPage() {
  const userId = await requireUserId();
  const stats = await statsService.detail(userId);

  return (
    <StatsClient
      streak={{
        current: stats.currentStreak,
        longest: stats.longestStreak,
        totalXP: stats.totalXP,
        level: stats.level,
      }}
      totalWords={stats.totalWords}
      masteredWords={stats.masteredWords}
      totalQuizzes={stats.totalQuizzes}
      avgAccuracy={stats.avgAccuracy}
      weeklyActivity={stats.weeklyActivity}
      quizHistory={stats.quizHistory}
      weakWords={stats.weakWords}
    />
  );
}
