import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export interface Word {
  id: string;
  englishWord: string;
  meaning: string;
  exampleSentence?: string | null;
  difficultyLevel: number;
  tags: string;
  createdAt: string;
  wordStats?: {
    correctCount: number;
    wrongCount: number;
    lastReviewed?: string | null;
  } | null;
}

export interface QuizQuestion {
  id: string;
  wordId: string;
  word: string;
  meaning: string;
  questionType: "multiple_choice" | "fill_blank" | "reverse";
  question: string;
  options?: string[];
  correctAnswer: string;
}

export interface Stats {
  totalWords: number;
  masteredWords: number;
  totalQuizzes: number;
  averageAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  weeklyActivity: { date: string; count: number }[];
  weakWords: Word[];
}
