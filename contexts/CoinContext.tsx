"use client";
import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import { coinsApi } from "@/lib/api-client";

interface CoinContextValue {
  coins: number | null;
  updateCoins: (newBalance: number) => void;
  refreshCoins: () => void;
}

const CoinContext = createContext<CoinContextValue>({
  coins: null,
  updateCoins: () => {},
  refreshCoins: () => {},
});

export function CoinProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [coins, setCoins] = useState<number | null>(null);

  const refreshCoins = useCallback(() => {
    if (session?.user?.id) {
      coinsApi.getBalance().then((b) => setCoins(b.coins)).catch(() => {});
    }
  }, [session?.user?.id]);

  useEffect(() => {
    refreshCoins();
  }, [refreshCoins]);

  const updateCoins = useCallback((newBalance: number) => {
    setCoins(newBalance);
  }, []);

  return (
    <CoinContext.Provider value={{ coins, updateCoins, refreshCoins }}>
      {children}
    </CoinContext.Provider>
  );
}

export function useCoins() {
  return useContext(CoinContext);
}
