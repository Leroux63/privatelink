"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";

import Header from "@/components/header";
import DepositFlow from "@/components/depositFlow";
import { useShadowwireBalance } from "@/hooks/useShadowwireBalance";

export default function CreatePage() {
  const router = useRouter();
  const { publicKey, connected } = useWallet();
  const wallet = publicKey?.toBase58();

  const {
    balance,
    hasPool,
    hasFunds,
    loading: balanceLoading,
    error: balanceError,
  } = useShadowwireBalance(wallet);

  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!label.trim()) {
      setError("label is required");
      return;
    }

    const parsedPrice = Number(price.replace(",", "."));
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError("invalid price");
      return;
    }

    if (!docUrl.includes("docs.google.com")) {
      setError("invalid google docs link");
      return;
    }

    if (!hasPool || !balance) {
      setError("private pool not ready");
      return;
    }

    const priceLamports = Math.floor(parsedPrice * 1e9);
    if (priceLamports > balance.available) {
      setError("price exceeds private pool balance");
      return;
    }

    try {
      const res = await fetch("/api/links/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: label.trim(),
          priceSol: parsedPrice,
          docUrl,
          creatorWallet: wallet,
          creatorPoolAddress: balance.pool_address,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "server error");

      router.replace("/dashboard");
    } catch (e: any) {
      setError(e.message ?? "failed to create link");
    }
  }

  const balanceSol = balance ? balance.available / 1e9 : 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header />

      <main className="mx-auto max-w-md px-6 py-24">
        <h1 className="mb-6 text-2xl font-semibold">
          create payment link
        </h1>

        {!connected && (
          <p className="text-sm text-[var(--color-text-muted)]">
            connect your wallet to continue
          </p>
        )}

        {connected && balanceLoading && (
          <p className="text-sm text-[var(--color-text-muted)]">
            checking private balance…
          </p>
        )}

        {connected && balanceError && (
          <p className="text-sm text-red-500">
            {balanceError}
          </p>
        )}

        {connected && hasPool && !hasFunds && (
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <p className="mb-2 text-sm text-[var(--color-text-muted)]">
              private pool balance: <strong>0 SOL</strong>
            </p>

            <p className="mb-4 text-sm text-[var(--color-text-muted)]">
              you must deposit funds to activate private payments
            </p>

            <DepositFlow />
          </div>
        )}

        {connected && hasPool && hasFunds && balance && (
          <>
            <div className="mb-6 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                private pool balance
              </p>
              <p className="text-lg font-semibold">
                {balanceSol.toFixed(9)} SOL
              </p>
              <p className="mt-1 text-xs opacity-60">
                pool: {balance.pool_address}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              <div>
                <label className="mb-2 block text-sm">
                  label
                </label>
                <input
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2"
                  placeholder="e.g. Premium doc – January"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">
                  google docs link
                </label>
                <input
                  value={docUrl}
                  onChange={(e) => setDocUrl(e.target.value)}
                  required
                  className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2"
                  placeholder="https://docs.google.com/..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm">
                  price (SOL)
                </label>
                <input
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value.replace(",", "."))
                  }
                  required
                  inputMode="decimal"
                  placeholder="0.01"
                  className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded bg-[var(--color-accent)] py-2 font-medium text-white"
              >
                generate link
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
