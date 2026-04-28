import { apiClient } from "./client";
import type {
  AdminUserRowDto,
  AdminUserDetailDto,
  AdminWordRowDto,
  AdminPlatformStatsDto,
  PaginatedDto,
} from "@/lib/server/dto/admin";

export const adminApi = {
  getStats: () =>
    apiClient.get<AdminPlatformStatsDto>("/admin/stats"),

  listUsers: (params?: { page?: number; search?: string; role?: string }) =>
    apiClient.get<PaginatedDto<AdminUserRowDto>>("/admin/users", { query: params }),

  getUser: (id: string) =>
    apiClient.get<AdminUserDetailDto>(`/admin/users/${id}`),

  updateRole: (id: string, role: "USER" | "ADMIN") =>
    apiClient.patch<AdminUserDetailDto>(`/admin/users/${id}`, { role }),

  deleteUser: (id: string) =>
    apiClient.delete(`/admin/users/${id}`),

  listWords: (params?: { page?: number; search?: string; userId?: string }) =>
    apiClient.get<PaginatedDto<AdminWordRowDto>>("/admin/words", { query: params }),

  deleteWord: (id: string) =>
    apiClient.delete(`/admin/words/${id}`),
};
