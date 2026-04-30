import { apiClient } from "./client";

export interface CoinTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export const coinsApi = {
  getBalance: () =>
    apiClient.get<{ coins: number; transactions: CoinTransaction[] }>("/coins/balance"),
};
