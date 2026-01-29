"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import Header from "@/components/header";
import DepositFlow from "@/components/depositFlow";
import WithdrawFlow from "@/components/withdrawFlow";
import { useShadowwireBalance } from "@/hooks/useShadowwireBalance";
import CreatorBadge from "@/components/creatorBadge";

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

type CreatorProfile = {
  twitterUsername: string;
  twitterName: string;
  twitterAvatarUrl: string;
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
  const [xEnabled, setXEnabled] = useState(false);
  const [xConnected, setXConnected] = useState(false);
  const [xProfile, setXProfile] = useState<CreatorProfile | null>(null);


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

  useEffect(() => {
    if (!wallet) return;

    fetch("/api/creator/x/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet }),
    })
      .then(r => r.json())
      .then(d => {
        setXEnabled(d.enabled);
        setXConnected(d.connected);
        setXProfile(d.profile ?? null);
      });
  }, [wallet]);


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
        <section className="rounded border p-4 space-y-4">
          <h2 className="text-lg font-medium">Creator identity</h2>

          <CreatorBadge profile={xProfile} />

          {!xEnabled && (
            <button
              onClick={async () => {
                await fetch("/api/x/unlock", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ wallet }),
                });
                setXEnabled(true);
              }}
              className="rounded bg-black px-4 py-2 text-white text-sm"
            >
              Verify identity
            </button>
          )}

          {xEnabled && !xConnected && (
            <button
              onClick={async () => {
                const r = await fetch("/api/x/connect", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ wallet }),
                });
                const d = await r.json();
                window.location.href = d.redirectUrl;
              }}
              className="rounded border px-4 py-2 text-sm"
            >
              Connect X account
            </button>
          )}
        </section>


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
                  className="rounded border p-4 space-y-2"
                >
                  <div className="font-medium">
                    {p.link?.label ?? "private content"}
                  </div>

                  <div className="text-sm opacity-80">
                    {(Number(p.amountLamports) / 1e9).toFixed(9)} SOL
                  </div>

                  <div className="text-xs opacity-60">
                    status: {p.status}
                  </div>

                  {p.access && (
                    <div className="text-xs opacity-60">
                      valid until{" "}
                      {new Date(p.access.expiresAt).toLocaleString()}
                    </div>
                  )}

                  {/* ===== VIEW CONTENT BUTTON ===== */}
                  {p.access &&
                    !p.access.usedAt &&
                    new Date(p.access.expiresAt) > new Date() && (
                      <button
                        className="mt-2 inline-block rounded border px-3 py-1 text-sm hover:bg-gray-50"
                        onClick={async () => {
                          const r = await fetch("/api/access/redeem", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              paymentId: p.paymentId,
                              wallet,
                            }),
                          });

                          const d = await r.json();

                          if (!r.ok || !d.token) {
                            alert(d.error ?? "access failed");
                            return;
                          }

                          window.location.href = `/access/${d.token}`;
                        }}
                      >
                        View content
                      </button>
                    )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
