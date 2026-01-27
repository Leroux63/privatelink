"use client";

import { use, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import Header from "@/components/header";
import DepositFlow from "@/components/depositFlow";
import InternalPaymentFlow from "@/components/internalPaymentFlow";
import { useShadowwireBalance } from "@/hooks/useShadowwireBalance";

type Props = {
  params: Promise<{ linkId: string }>;
};

type PaymentLinkData = {
  id: string;
  label: string | null;
  amountLamports: string;
  status: string;
  creatorWallet: string;
};

export default function PayPage({ params }: Props) {
  const { linkId } = use(params);

  const { publicKey, connected } = useWallet();
  const wallet = publicKey?.toBase58();

  const {
    balance,
    hasPool,
    hasFunds,
    loading: balanceLoading,
    error: balanceError,
    refresh,
  } = useShadowwireBalance(wallet);

  const [data, setData] = useState<PaymentLinkData | null>(null);
  const [loadingLink, setLoadingLink] = useState(true);
  const [errorLink, setErrorLink] = useState<string | null>(null);

  useEffect(() => {
    setLoadingLink(true);
    setErrorLink(null);

    fetch(`/api/links/${linkId}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          const t = await r.text();
          throw new Error(t || "link not found");
        }
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => {
        console.error("pay link error:", e);
        setErrorLink("invalid or expired payment link");
        setData(null);
      })
      .finally(() => setLoadingLink(false));
  }, [linkId]);

  if (loadingLink) {
    return (
      <>
        <Header />
        <p className="p-6">loading…</p>
      </>
    );
  }

  if (errorLink || !data) {
    return (
      <>
        <Header />
        <p className="p-6 text-sm text-red-500">
          {errorLink ?? "invalid link"}
        </p>
      </>
    );
  }

  if (!data.creatorWallet) {
    return (
      <>
        <Header />
        <p className="p-6 text-sm text-red-500">
          invalid payment link (missing recipient)
        </p>
      </>
    );
  }

  const amountSol = Number(data.amountLamports) / 1e9;
  const label = data.label ?? "private content";
  const balanceSol = balance ? balance.available / 1e9 : 0;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header />

      <main className="mx-auto max-w-md px-6 py-24 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            anonymous private payment
          </p>
        </div>

        <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <div className="flex justify-between text-sm">
            <span className="opacity-70">amount</span>
            <span className="font-medium">
              {amountSol.toFixed(9)} SOL
            </span>
          </div>
        </div>

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
          <p className="text-sm text-red-500">{balanceError}</p>
        )}

        {connected && hasPool && !hasFunds && (
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <p className="mb-4 text-sm text-[var(--color-text-muted)]">
              to pay anonymously, you must first deposit SOL into the
              private pool.
            </p>
            <DepositFlow refreshBalance={refresh} />
          </div>
        )}

        {connected && hasPool && hasFunds && balance && (
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-6 space-y-4">
            <div className="text-sm">
              private pool balance:
              <strong className="ml-1">
                {balanceSol.toFixed(9)} SOL
              </strong>
            </div>

            <InternalPaymentFlow
              linkId={data.id}
              amountLamports={Number(data.amountLamports)}
              recipientWallet={data.creatorWallet}
            />
          </div>
        )}

        <p className="text-xs text-center opacity-60">
          anonymous payment via private pool
        </p>
      </main>
    </div>
  );
}
