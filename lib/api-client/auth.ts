import { apiClient } from "./client";
import type {
  ForgotPasswordInput,
  RegisterInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "@/lib/server/dto/auth";

export const authApi = {
  register: (input: RegisterInput) =>
    apiClient.post<{ message: string; devCode?: string }>("/auth/register", input),

  verifyEmail: (input: VerifyEmailInput) =>
    apiClient.post<{ message: string }>("/auth/verify-email", input),

  resendVerification: (input: ResendVerificationInput) =>
    apiClient.post<{ message: string }>("/auth/resend-verification", input),

  forgotPassword: (input: ForgotPasswordInput) =>
    apiClient.post<{ message: string }>("/auth/forgot-password", input),

  resetPassword: (input: ResetPasswordInput) =>
    apiClient.post<{ message: string }>("/auth/reset-password", input),
};
