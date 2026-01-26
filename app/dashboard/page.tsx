"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import Header from "@/components/header";
import { useShadowwireBalance } from "@/hooks/useShadowwireBalance";


type LinkItem = {
  id: string;
  createdAt: string;
  amountLamports: string;
  status: string;
  label: string | null;
};

type PaidItem = {
  paymentId: string;
  createdAt: string;
  amountLamports: string;
  status: string;
  txSignature: string;
  token: string;
  link: {
    id: string;
    label: string | null;
    amountLamports: string;
    creatorWallet: string;
    status: string;
  } | null;
  access: {
    expiresAt: string;
    usedAt: string | null;
  } | null;
};

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const wallet = publicKey?.toBase58();

  const {
    balance,
    loading: balanceLoading,
    error: balanceError,
  } = useShadowwireBalance(wallet);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loadingLinks, setLoadingLinks] = useState(true);
  const [errorLinks, setErrorLinks] = useState<string | null>(null);

  const [payments, setPayments] = useState<PaidItem[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [errorPayments, setErrorPayments] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !wallet) return;

    setLoadingLinks(true);
    setErrorLinks(null);

    fetch("/api/links/mine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((d) => setLinks(d.links ?? []))
      .catch(() => {
        setErrorLinks("failed to load links");
        setLinks([]);
      })
      .finally(() => setLoadingLinks(false));
  }, [connected, wallet]);

  useEffect(() => {
    if (!connected || !wallet) return;

    setLoadingPayments(true);
    setErrorPayments(null);

    fetch("/api/payments/mine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(await r.text());
        return r.json();
      })
      .then((d) => setPayments(d.payments ?? []))
      .catch(() => {
        setErrorPayments("failed to load payments");
        setPayments([]);
      })
      .finally(() => setLoadingPayments(false));
  }, [connected, wallet]);

  if (!connected) {
    return (
      <>
        <Header />
        <p className="p-6">connect your wallet</p>
      </>
    );
  }

  if (balanceLoading || loadingLinks || loadingPayments) {
    return (
      <>
        <Header />
        <p className="p-6">loading…</p>
      </>
    );
  }

  const availableSol = balance ? balance.available / 1e9 : 0;
  const depositedSol = balance ? balance.deposited / 1e9 : 0;


  return (
    <>
      <Header />

      <div className="mx-auto max-w-2xl p-6 space-y-10">
        <h1 className="text-xl font-semibold">your dashboard</h1>

        {balance && (
          <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <p className="text-sm text-[var(--color-text-muted)]">
              private pool balance
            </p>

            <p className="text-lg font-semibold">
              {availableSol.toFixed(9)} SOL
            </p>

            <div className="mt-2 text-xs opacity-60 space-y-1">
              <div>deposited: {depositedSol.toFixed(9)} SOL</div>
              <div>pool: {balance.pool_address}</div>
            </div>
          </div>
        )}

        {balanceError && (
          <p className="text-sm text-red-500">{balanceError}</p>
        )}

        <section>
          <h2 className="mb-4 text-lg font-medium">
            payment links you created
          </h2>

          {errorLinks && (
            <p className="mb-4 text-sm text-red-500">{errorLinks}</p>
          )}

          {links.length === 0 && (
            <p className="text-sm opacity-60">no links yet</p>
          )}

          <ul className="space-y-4">
            {links.map((link) => {
              const solAmount =
                Number(link.amountLamports) / 1e9;
              const payUrl = `${window.location.origin}/pay/${link.id}`;

              return (
                <li
                  key={link.id}
                  className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                >
                  <div className="font-medium">
                    {link.label ?? "untitled link"}
                  </div>

                  <div className="text-sm opacity-80">
                    {solAmount.toFixed(9)} SOL
                  </div>

                  <div className="mt-2 flex justify-between text-xs opacity-60">
                    <span>status: {link.status}</span>
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(payUrl)
                      }
                      className="underline"
                    >
                      copy link
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-medium">
            content you paid for
          </h2>

          {errorPayments && (
            <p className="mb-4 text-sm text-red-500">
              {errorPayments}
            </p>
          )}

          {payments.length === 0 && (
            <p className="text-sm opacity-60">
              no payments yet
            </p>
          )}

          <ul className="space-y-4">
            {payments.map((p) => {
              const solAmount =
                Number(p.amountLamports) / 1e9;

              return (
                <li
                  key={p.paymentId}
                  className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                >
                  <div className="font-medium">
                    {p.link?.label ?? "private content"}
                  </div>

                  <div className="text-sm opacity-80">
                    {solAmount.toFixed(9)} SOL
                  </div>

                  <div className="mt-2 flex justify-between text-xs opacity-60">
                    <span>
                      status: {p.status}
                    </span>
                    {p.access && (
                      <span>
                        access valid until{" "}
                        {new Date(
                          p.access.expiresAt
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={async () => {
                      const res = await fetch("/api/access/redeem", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          paymentId: p.paymentId,
                          wallet,
                        }),
                      });

                      const json = await res.json();
                      if (!res.ok) {
                        alert(json.error || "access failed");
                        return;
                      }

                      window.location.href = `/access?token=${json.token}`;
                    }}
                    className="text-sm underline hover:opacity-80"
                  >
                    access content
                  </button>

                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
