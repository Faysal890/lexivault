import { apiClient } from "./client";
import type { StatsSummaryDto } from "@/lib/server/dto/stats";

export const statsApi = {
  summary: () => apiClient.get<StatsSummaryDto>("/stats"),
};
