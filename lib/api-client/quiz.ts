import { apiClient } from "./client";
import type {
  GenerateQuizQuery,
  QuizQuestionDto,
  QuizSubmitResultDto,
  SubmitQuizInput,
} from "@/lib/server/dto/quiz";

export const quizApi = {
  generate: (params: Partial<GenerateQuizQuery>) =>
    apiClient.get<QuizQuestionDto[]>("/quiz/generate", { query: params }),

  submit: (input: SubmitQuizInput) =>
    apiClient.post<QuizSubmitResultDto>("/quiz/submit", input),
};
