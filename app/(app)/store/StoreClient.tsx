"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { storeApi, coinsApi } from "@/lib/api-client";
import { useCoins } from "@/contexts/CoinContext";

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  priceUsd: number;
}

interface CoinTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

const TX_META: Record<string, { label: string; icon: string; color: string }> = {
  NEW_USER_BONUS: { label: "Welcome bonus",  icon: "card_giftcard",       color: "text-secondary" },
  GENERATION:     { label: "AI generation",  icon: "auto_awesome",        color: "text-error"     },
  QUIZ_REWARD:    { label: "Quiz reward",     icon: "emoji_events",        color: "text-secondary" },
  PURCHASE:       { label: "Purchase",        icon: "shopping_cart",       color: "text-tertiary"  },
  ADMIN_GRANT:    { label: "Admin grant",     icon: "admin_panel_settings",color: "text-primary"   },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export default function StoreClient({
  packages,
  initialBalance,
  initialTransactions,
}: {
  packages: CoinPackage[];
  initialBalance: number;
  initialTransactions: CoinTransaction[];
}) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const cancelled = searchParams.get("cancelled") === "true";
  const oid = searchParams.get("oid"); // our internal orderId embedded in the redirect URL

  const [buying, setBuying] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<"idle" | "waiting" | "done" | "timeout">("idle");
  const [coinsAdded, setCoinsAdded] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<CoinTransaction[]>(initialTransactions);
  const { coins, updateCoins } = useCoins();
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const attempts = useRef(0);

  const fetchAndSyncBalance = async () => {
    try {
      const balance = await coinsApi.getBalance();
      updateCoins(balance.coins);
      setTransactions(balance.transactions);
    } catch {
      // silently ignore — UI will refetch on next mount
    }
  };

  // Poll our DB order status until the webhook marks it COMPLETED (max ~60s)
  useEffect(() => {
    if (!success || !oid) {
      if (success) fetchAndSyncBalance();
      return;
    }

    setPaymentState("waiting");

    pollTimer.current = setInterval(async () => {
      attempts.current += 1;
      try {
        const result = await storeApi.getOrderStatus(oid);
        if (result.status === "COMPLETED") {
          clearInterval(pollTimer.current!);
          setCoinsAdded(result.coins);
          setPaymentState("done");
          await fetchAndSyncBalance();
        } else if (attempts.current >= 20) {
          // 20 × 3s = 60s — webhook likely delayed; tell user it will arrive soon
          clearInterval(pollTimer.current!);
          setPaymentState("timeout");
          await fetchAndSyncBalance();
        }
      } catch {
        if (attempts.current >= 20) {
          clearInterval(pollTimer.current!);
          setPaymentState("timeout");
        }
      }
    }, 3000);

    return () => { if (pollTimer.current) clearInterval(pollTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const balance = coins ?? initialBalance;

  const handleBuy = async (packageId: string) => {
    setBuying(packageId);
    try {
      const { url } = await storeApi.createCheckout(packageId);
      window.location.href = url;
    } catch {
      setBuying(null);
      alert("Unable to start checkout. Please try again.");
    }
  };

  return (
    <div className="py-4 space-y-6 lg:py-0 lg:space-y-8">
      <div>
        <h1 className="font-headline text-2xl lg:text-4xl font-extrabold text-on-surface">Coin Store</h1>
        <p className="text-on-surface-variant text-sm mt-1">Buy coins to generate AI example sentences and translations.</p>
      </div>

      {/* Payment status banners */}
      {success && paymentState === "waiting" && (
        <div className="flex items-center gap-3 bg-surface-container rounded-2xl p-4">
          <span className="material-symbols-outlined text-primary text-[22px] animate-spin">refresh</span>
          <div>
            <p className="font-semibold text-on-surface text-sm">Confirming your payment…</p>
            <p className="text-xs text-on-surface-variant mt-0.5">This usually takes a few seconds.</p>
          </div>
        </div>
      )}

      {success && paymentState === "done" && (
        <div className="flex items-center gap-3 bg-secondary-container/30 border border-secondary/20 rounded-2xl p-4">
          <span className="material-symbols-outlined text-secondary text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <div>
            <p className="font-semibold text-on-surface text-sm">Payment confirmed!</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {coinsAdded !== null ? `+${coinsAdded.toLocaleString()} coins added to your account.` : "Coins added to your account."}
            </p>
          </div>
        </div>
      )}

      {success && paymentState === "timeout" && (
        <div className="flex items-start gap-3 bg-surface-container-lowest border border-surface-container-high rounded-2xl p-4">
          <span className="material-symbols-outlined text-outline text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
          <div>
            <p className="font-semibold text-on-surface text-sm">Payment received</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Your coins are being processed and will appear shortly. Refresh the page to check.</p>
          </div>
        </div>
      )}

      {cancelled && (
        <div className="flex items-center gap-3 bg-surface-container rounded-2xl p-4">
          <span className="material-symbols-outlined text-outline text-[22px]">info</span>
          <p className="text-sm text-on-surface-variant">Payment cancelled — no charge was made.</p>
        </div>
      )}

      {/* Balance Card */}
      <div className="bg-surface-container-lowest rounded-3xl p-5 lg:p-7">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-tertiary-fixed flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
          </div>
          <div>
            <p className="text-on-surface-variant text-sm">Your balance</p>
            <p className="font-headline text-3xl font-extrabold text-tertiary">{balance.toLocaleString()}</p>
            <p className="text-on-surface-variant text-xs mt-0.5">10 coins = 1 AI sentence generation</p>
          </div>
        </div>
      </div>

      {/* Packages */}
      <div>
        <h2 className="font-headline font-bold text-on-surface text-sm uppercase tracking-wider text-outline mb-3">Available Packages</h2>
        {packages.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2 block">shopping_bag</span>
            <p className="text-on-surface-variant text-sm">No packages available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-surface-container-high flex flex-col gap-4">
                <div>
                  <h3 className="font-headline font-bold text-on-surface text-lg">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-extrabold text-tertiary">{pkg.coins.toLocaleString()}</span>
                    <span className="text-on-surface-variant text-sm">coins</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">≈ {Math.floor(pkg.coins / 10).toLocaleString()} sentence generations</p>
                </div>
                <div className="mt-auto">
                  <p className="text-on-surface font-bold text-lg mb-2">${(pkg.priceUsd / 100).toFixed(2)} USD</p>
                  <button
                    onClick={() => handleBuy(pkg.id)}
                    disabled={buying === pkg.id}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-primary text-on-primary py-2.5 rounded-2xl text-sm font-bold shadow-sm shadow-primary/20 hover:shadow-md transition-shadow disabled:opacity-60"
                  >
                    {buying === pkg.id ? (
                      <><span className="material-symbols-outlined animate-spin text-base">refresh</span> Redirecting...</>
                    ) : (
                      <><span className="material-symbols-outlined text-base">shopping_cart</span> Buy Now</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-container rounded-2xl p-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-outline text-[18px] mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
        <p className="text-xs text-on-surface-variant">Payments are processed securely by Lemon Squeezy. Coins are credited automatically after payment confirmation.</p>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="font-headline font-bold text-on-surface text-sm uppercase tracking-wider text-outline mb-3">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-2 block">receipt_long</span>
            <p className="text-on-surface-variant text-sm">No transactions yet.</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm">
            {transactions.map((tx, i) => {
              const meta = TX_META[tx.type] ?? { label: tx.type, icon: "toll", color: "text-on-surface-variant" };
              const isCredit = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className={`flex items-center gap-4 px-5 py-4 ${i < transactions.length - 1 ? "border-b border-surface-container-high" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center shrink-0`}>
                    <span className={`material-symbols-outlined text-[18px] ${meta.color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">{tx.description}</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">{meta.label} · {formatDate(tx.createdAt)}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${isCredit ? "text-secondary" : "text-error"}`}>
                    {isCredit ? "+" : ""}{tx.amount.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
