"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import Header from "@/components/header";
import DepositFlow from "@/components/depositFlow";
import WithdrawFlow from "@/components/withdrawFlow";
import { useShadowwireBalance } from "@/hooks/useShadowwireBalance";

/* ===================== TYPES ===================== */

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

/* ===================== PAGE ===================== */

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const wallet = publicKey?.toBase58();

  const {
    balance,
    error: balanceError,
    refresh: refreshBalance,
  } = useShadowwireBalance(wallet);

  const [links, setLinks] = useState<LinkItem[]>([]);
  const [payments, setPayments] = useState<PaidItem[]>([]);

  /* ===================== DATA LOAD ===================== */

  useEffect(() => {
    if (!connected || !wallet) return;

    fetch("/api/links/mine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    })
      .then((r) => r.json())
      .then((d) => setLinks(d.links ?? []))
      .catch(() => setLinks([]));
  }, [connected, wallet]);

  useEffect(() => {
    if (!connected || !wallet) return;

    fetch("/api/payments/mine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    })
      .then((r) => r.json())
      .then((d) => setPayments(d.payments ?? []))
      .catch(() => setPayments([]));
  }, [connected, wallet]);

  /* ===================== GUARDS ===================== */

  if (!connected) {
    return (
      <>
        <Header />
        <p className="p-6">connect your wallet</p>
      </>
    );
  }

  if (!balance) {
    return (
      <>
        <Header />
        <p className="p-6">loading balance…</p>
      </>
    );
  }

  /* ===================== RENDER ===================== */

  return (
    <>
      <Header />

      <div className="mx-auto max-w-2xl p-6 space-y-12">
        <h1 className="text-xl font-semibold">your dashboard</h1>

        {/* ===== DEPOSIT ===== */}
        <div className="rounded border bg-[var(--color-surface)] p-4 space-y-3">
          <p className="text-sm text-[var(--color-text-muted)]">
            private pool deposit
          </p>
          <DepositFlow refreshBalance={refreshBalance} />

        </div>

        {/* ===== BALANCE + WITHDRAW ===== */}
        <div className="rounded border p-4 space-y-4">
          <p className="text-sm opacity-60">private pool balance</p>

          <p className="text-lg font-semibold">
            {(balance.available / 1e9).toFixed(9)} SOL
          </p>

          <div className="text-xs opacity-60 space-y-1">
            <div>
              deposited: {(balance.deposited / 1e9).toFixed(9)} SOL
            </div>
            <div>pool: {balance.pool_address}</div>
          </div>

          <WithdrawFlow
            availableLamports={balance.available}
            refreshBalance={refreshBalance}
          />
        </div>

        {balanceError && (
          <p className="text-sm text-red-500">{balanceError}</p>
        )}

        {/* ===== LINKS ===== */}
        <section>
          <h2 className="mb-4 text-lg font-medium">
            payment links you created
          </h2>

          {links.length === 0 && (
            <p className="text-sm opacity-60">no links yet</p>
          )}

          <ul className="space-y-4">
            {links.map((link) => {
              const solAmount = Number(link.amountLamports) / 1e9;
              const payUrl = `${window.location.origin}/pay/${link.id}`;

              return (
                <li
                  key={link.id}
                  className="rounded border p-4 space-y-1"
                >
                  <div className="font-medium">
                    {link.label ?? "untitled link"}
                  </div>
                  <div className="text-sm opacity-80">
                    {solAmount.toFixed(9)} SOL
                  </div>
                  <div className="flex justify-between text-xs opacity-60">
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

        {/* ===== PAYMENTS ===== */}
        <section>
          <h2 className="mb-4 text-lg font-medium">
            content you paid for
          </h2>

          {payments.length === 0 && (
            <p className="text-sm opacity-60">no payments yet</p>
          )}

          <ul className="space-y-4">
            {payments.map((p) => {
              const solAmount = Number(p.amountLamports) / 1e9;

              return (
                <li
                  key={p.paymentId}
                  className="rounded border p-4 space-y-1"
                >
                  <div className="font-medium">
                    {p.link?.label ?? "private content"}
                  </div>
                  <div className="text-sm opacity-80">
                    {solAmount.toFixed(9)} SOL
                  </div>
                  <div className="text-xs opacity-60 flex justify-between">
                    <span>status: {p.status}</span>
                    {p.access && (
                      <span>
                        valid until{" "}
                        {new Date(
                          p.access.expiresAt
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
