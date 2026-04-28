import { apiClient } from "./client";
import type {
  ChangePasswordInput,
  ProfileDto,
  UpdateProfileInput,
} from "@/lib/server/dto/profile";

export const profileApi = {
  get: () => apiClient.get<ProfileDto>("/profile"),

  update: (input: UpdateProfileInput) => apiClient.put<ProfileDto>("/profile", input),

  changePassword: (input: ChangePasswordInput) =>
    apiClient.post<{ message: string }>("/profile/change-password", input),
};
