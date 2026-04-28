export interface StatsSummaryDto {
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  totalWords: number;
  masteredWords: number;
  totalQuizzes: number;
  avgAccuracy: number;
}

export interface StatsDetailDto extends StatsSummaryDto {
  weeklyActivity: { date: string; count: number }[];
  quizHistory: { date: string; accuracy: number }[];
  weakWords: { word: string; wrong: number; correct: number }[];
}
