"use client";

import { useEffect, useState, useCallback } from "react";
import { shadowwireClient } from "@/lib/shadowwire/client";

export type ShadowwireBalance = {
  available: number;
  deposited: number;
  withdrawn_to_escrow: number;
  pool_address: string;
};

export function useShadowwireBalance(wallet?: string) {
  const [balance, setBalance] = useState<ShadowwireBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!wallet) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const b = await shadowwireClient.getBalance(wallet, "SOL");

      setBalance({
        available: b.available,
        deposited: b.deposited,
        withdrawn_to_escrow: b.withdrawn_to_escrow,
        pool_address: b.pool_address,
      });
    } catch (e: any) {
      console.error("shadowwire balance error:", e);
      setError(e?.message ?? "failed to load balance");
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [wallet]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    balance,
    loading,
    error,
    hasPool: !!balance?.pool_address,
    hasFunds: (balance?.available ?? 0) > 0,
    refresh,
  };
}
