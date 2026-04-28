import { apiClient } from "./client";
import type {
  ForgotPasswordInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
} from "@/lib/server/dto/auth";

export const authApi = {
  register: (input: RegisterInput) =>
    apiClient.post<{ message: string; devVerifyUrl?: string }>("/auth/register", input),

  verifyEmail: (token: string) =>
    apiClient.get<{ message: string }>("/auth/verify-email", { query: { token } }),

  resendVerification: (input: ResendVerificationInput) =>
    apiClient.post<{ message: string }>("/auth/resend-verification", input),

  forgotPassword: (input: ForgotPasswordInput) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", input),

  resetPassword: (input: ResetPasswordInput) =>
    apiClient.post<{ message: string }>("/auth/reset-password", input),
};
