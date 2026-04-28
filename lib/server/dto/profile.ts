import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  nativeLanguage: z.string().min(1).max(50).optional(),
  dailyGoal: z.number().int().min(1).max(50).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export interface ProfileDto {
  id: string;
  name: string;
  email: string;
  nativeLanguage: string;
  dailyGoal: number;
  createdAt: Date;
}
