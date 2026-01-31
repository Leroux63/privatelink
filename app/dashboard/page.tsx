"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import DepositFlow from "@/components/depositFlow";
import WithdrawFlow from "@/components/withdrawFlow";
import { useShadowwireBalance } from "@/hooks/useShadowwireBalance";
import CreatorOverview from "@/components/creatorOverview";
import PaymentLinksList from "@/components/paymentLinksList";
import PoolBadge from "@/components/poolBadge";
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
  const [toast, setToast] = useState<string | null>(null);
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
      .then((r) => r.json())
      .then((d) => {
        setXEnabled(d.enabled);
        setXConnected(d.connected);
        setXProfile(d.profile ?? null);
      });
  }, [wallet]);

  /* ===================== GUARDS ===================== */

  if (!connected) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p>connect your wallet</p>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p>loading balance…</p>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p>connect your wallet</p>
      </div>
    );
  }
  /* ===================== RENDER ===================== */

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-12">
      {/* ===== HEADER ===== */}
      <CreatorOverview
        wallet={wallet}
        profile={xProfile}
        xEnabled={xEnabled}
        xConnected={xConnected}
        onUnlockX={async () => {
          await fetch("/api/x/unlock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet }),
          });
          setXEnabled(true);
        }}
        onConnectX={async () => {
          const r = await fetch("/api/x/connect", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ wallet }),
          });
          const d = await r.json();
          window.location.href = d.redirectUrl;
        }}
      />
      {/* ===== POOL ===== */}
      <section className="rounded-lg bg-[var(--color-surface)] p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* === DEPOSIT === */}
          <div className="flex flex-col rounded-lg border p-4 h-full">
            <h3 className="mb-4 text-sm font-medium">
              Deposit
            </h3>

            <div className="flex-1">
              <DepositFlow refreshBalance={refreshBalance} />
            </div>
          </div>

          {/* === WITHDRAW === */}
          <div className="flex flex-col rounded-lg border p-4 h-full">
            <h3 className="mb-4 text-sm font-medium">
              Withdraw
            </h3>

            <div className="flex-1">
              <WithdrawFlow
                availableLamports={balance.available}
                refreshBalance={refreshBalance}
              />
            </div>
          </div>

          {/* === POOL BADGE === */}
          <div className="flex flex-col justify-between rounded-lg border p-4 h-full">
            <h3 className="mb-4 text-sm font-medium">
              Pool
            </h3>

            <div className="flex-1 flex items-center justify-center">
              <PoolBadge balanceSol={balance.available / 1e9} />
            </div>
          </div>

        </div>
      </section>
      {/* ===== LINKS CREATED ===== */}

      <section>
        <h2 className="mb-4 text-lg font-medium">
          Payment links you created
        </h2>

        <PaymentLinksList links={links} />
      </section>

      {/* ===== CONTENT PAID ===== */}
      <section>
        <h2 className="mb-4 text-lg font-medium">
          Content you paid for
        </h2>

        {payments.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)]">
            no paid content yet
          </p>
        )}

        <ul className="space-y-3">
          {payments.map((p) => {
            const solAmount = Number(p.amountLamports) / 1e9;

            return (
              <li
                key={p.paymentId}
                className="rounded-lg bg-[var(--color-surface)] p-4"
              >
                <div className="space-y-1">
                  <div className="font-medium">
                    {p.link?.label ?? "private content"}
                  </div>

                  <div className="text-sm text-[var(--color-text-muted)]">
                    {solAmount.toFixed(9)} SOL · {p.status}
                  </div>

                  {p.access && (
                    <div className="text-xs text-[var(--color-text-muted)]">
                      valid until{" "}
                      {new Date(p.access.expiresAt).toLocaleString()}
                    </div>
                  )}
                </div>

                {p.access &&
                  !p.access.usedAt &&
                  new Date(p.access.expiresAt) > new Date() && (
                    <button
                      className="mt-3 rounded border px-3 py-1 text-sm hover:bg-[var(--color-bg-muted)]"
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

                        window.location.href = `/access?token=${d.token}`;
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
  );
}