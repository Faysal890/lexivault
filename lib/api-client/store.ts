import { apiClient } from "./client";

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  priceUsd: number;
  isActive: boolean;
}

export const storeApi = {
  getPackages: () => apiClient.get<CoinPackage[]>("/store/packages"),

  createCheckout: (packageId: string) =>
    apiClient.post<{ url: string; orderId: string }>("/store/checkout", { packageId }),

  getOrderStatus: (oid: string) =>
    apiClient.get<{ status: "PENDING" | "COMPLETED"; coins: number }>(`/store/verify?oid=${oid}`),
};
