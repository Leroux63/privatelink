"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowRight } from "lucide-react";

import DepositFlow from "@/components/depositFlow";
import PoolBadge from "@/components/poolBadge";
import { useShadowwireBalance } from "@/hooks/useShadowwireBalance";

const MIN_PRICE_SOL = 0.1;
const DOC_SERVICE_ACCOUNT =
  "privatelink-doc-access@privatelink-484817.iam.gserviceaccount.com";

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
    refresh: refreshBalance,
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
    if (!Number.isFinite(parsedPrice) || parsedPrice < MIN_PRICE_SOL) {
      setError(`minimum price is ${MIN_PRICE_SOL} SOL`);
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

      <main className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-12 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold leading-tight">
              Create a private payment link
            </h1>
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <span className="font-medium text-[var(--color-text-main)]">
                Sell private Google Docs securely
              </span>
              <span className="opacity-60">—</span>
              <span>
                Access is unlocked only after payment
              </span>
            </div>
          </div>

          {connected && hasPool && balance && (
            <PoolBadge balanceSol={balanceSol} />
          )}
        </div>

        {!connected && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Connect your wallet to continue
          </p>
        )}

        {connected && balanceLoading && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Checking private balance…
          </p>
        )}

        {connected && balanceError && (
          <p className="text-sm text-red-500">
            {balanceError}
          </p>
        )}

        {connected && hasPool && !hasFunds && (
          <div className="rounded-lg bg-[var(--color-bg-muted)] p-6 space-y-4">
            <h2 className="text-sm font-medium">
              Fund your private pool
            </h2>

            <p className="text-sm text-[var(--color-text-muted)]">
              Private payments require a funded pool.
              Funds are used to securely route and anonymize buyer payments.
            </p>

            <DepositFlow refreshBalance={refreshBalance} />
          </div>
        )}

        {connected && hasPool && hasFunds && balance && (
          <form
            onSubmit={handleSubmit}
            className="
              mt-6
              rounded-xl
              bg-[var(--color-surface)]
              p-8
              space-y-6
              shadow-sm
            "
          >
            <div>
              <label className="mb-2 block text-sm">
                Label
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                required
                className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2"
                placeholder="Premium lesson – January"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">
                Google Docs link
              </label>

              <div className="rounded-md bg-[var(--color-bg-muted)] p-3 text-xs">
                <p className="mb-1 font-medium">
                  Required access
                </p>
                <p className="text-[var(--color-text-muted)]">
                  This Google Doc must be shared as Viewer with:
                </p>
                <p className="mt-1 font-mono text-[11px]">
                  {DOC_SERVICE_ACCOUNT}
                </p>
              </div>

              <input
                value={docUrl}
                onChange={(e) => setDocUrl(e.target.value)}
                required
                className="mt-3 w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2"
                placeholder="https://docs.google.com/..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm">
                Price (SOL)
              </label>
              <input
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value.replace(",", "."))
                }
                required
                inputMode="decimal"
                placeholder="0.1"
                className="w-full rounded border border-[var(--color-border)] bg-transparent px-3 py-2"
              />
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                Minimum price enforced by network: 0.1 SOL
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="
                group
                flex w-full items-center justify-center gap-2
                rounded
                bg-[var(--color-accent)]
                px-4 py-2
                font-medium text-white
                cursor-pointer
                transition
                hover:opacity-90
                hover:shadow-sm
                active:scale-[0.99]
              "
            >
              <span>Generate link</span>
              <ArrowRight
                size={16}
                className="
                  opacity-0
                  transition
                  group-hover:opacity-100
                  group-hover:translate-x-0.5
                "
              />
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
