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

  grantCoins: (userId: string, amount: number, reason?: string) =>
    apiClient.post<{ coins: number }>(`/admin/users/${userId}/coins`, { action: "add", amount, reason }),

  setCoins: (userId: string, amount: number, reason?: string) =>
    apiClient.post<{ coins: number }>(`/admin/users/${userId}/coins`, { action: "set", amount, reason }),

  getSettings: () =>
    apiClient.get<{ newUserCoins: number; generationCost: number; dailyQuizCoins: number }>("/admin/settings"),

  updateSettings: (data: { newUserCoins?: number; generationCost?: number; dailyQuizCoins?: number }) =>
    apiClient.patch<{ newUserCoins: number; generationCost: number; dailyQuizCoins: number }>("/admin/settings", data),

  listPackages: () =>
    apiClient.get<Array<{ id: string; name: string; coins: number; priceUsd: number; lsVariantId: string | null; isActive: boolean }>>("/admin/packages"),

  createPackage: (data: { name: string; coins: number; priceUsd: number; lsVariantId?: string }) =>
    apiClient.post<{ id: string; name: string; coins: number; priceUsd: number; lsVariantId: string | null; isActive: boolean }>("/admin/packages", data),

  updatePackage: (id: string, data: { name?: string; coins?: number; priceUsd?: number; lsVariantId?: string; isActive?: boolean }) =>
    apiClient.patch<{ id: string; name: string; coins: number; priceUsd: number; lsVariantId: string | null; isActive: boolean }>(`/admin/packages/${id}`, data),

  deletePackage: (id: string) =>
    apiClient.delete(`/admin/packages/${id}`),
};
