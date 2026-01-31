"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import type { ShadowwireBalance } from "@/hooks/useShadowwireBalance";

const MIN_WITHDRAW_LAMPORTS = 100_000_000;

type Props = {
  availableLamports: number;
  refreshBalance: () => Promise<ShadowwireBalance | null>;
};

export default function WithdrawFlow({
  availableLamports,
  refreshBalance,
}: Props) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sig, setSig] = useState<string | null>(null);

  async function handleWithdraw() {
    if (!publicKey || !signTransaction) return;

    setError(null);
    setSig(null);

    const sol = Number(amount.replace(",", "."));
    if (!Number.isFinite(sol) || sol <= 0) {
      setError("invalid amount");
      return;
    }

    const lamports = Math.floor(sol * 1e9);

    if (lamports < MIN_WITHDRAW_LAMPORTS) {
      setError("minimum withdraw is 0.1 SOL");
      return;
    }

    if (lamports > availableLamports) {
      setError("amount exceeds balance");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet: publicKey.toBase58(),
          amountLamports: lamports,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.unsignedTx) {
        throw new Error(json.error || "withdraw failed");
      }

      const buffer = Buffer.from(json.unsignedTx, "base64");

      let signature: string;

      if (buffer[0] < 128) {
        const tx = Transaction.from(buffer);
        const signed = await signTransaction(tx);
        signature = await connection.sendRawTransaction(
          signed.serialize()
        );
      } else {
        const tx = VersionedTransaction.deserialize(buffer);
        const signed = await signTransaction(tx);
        signature = await connection.sendRawTransaction(
          signed.serialize()
        );
      }

      setSig(signature);

      const initialAvailable = availableLamports;

      for (let i = 0; i < 5; i++) {
        await new Promise((r) => setTimeout(r, 5000));

        const updated = await refreshBalance();
        if (!updated) continue;

        if (updated.available !== initialAvailable) {
          break;
        }
      }

      setAmount("");
    } catch (e: any) {
      setError(e?.message || "withdraw failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pt-4 border-t space-y-2">
      <label className="block text-xs text-[var(--color-text-muted)]">
        Withdraw amount (SOL)
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value.replace(/[^0-9.,]/g, ""))
          }
          placeholder="0.1"
          className="
      flex-1
      rounded
      border
      px-3 py-2
      text-sm
      focus:outline-none
      focus:ring-1
      focus:ring-black
    "
        />

        <button
          type="button"
          onClick={() =>
            setAmount((availableLamports / 1e9).toFixed(9))
          }
          className="
      rounded
      border
      px-3
      text-sm
      cursor-pointer
      transition
      hover:bg-[var(--color-bg-muted)]
      active:scale-[0.97]
    "
        >
          max
        </button>
      </div>

      <button
        disabled={loading}
        onClick={handleWithdraw}
        className="
    w-full
    mt-2
    rounded
    bg-black
    py-2
    text-sm font-medium
    text-white
    cursor-pointer
    transition
    hover:opacity-90
    active:scale-[0.98]
    disabled:opacity-40
    disabled:cursor-not-allowed
  "
      >
        {loading ? "Withdrawing…" : "Withdraw"}
      </button>

      {sig && (
        <p className="text-xs break-all opacity-60">
          tx: {sig}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500 whitespace-pre-wrap">
          {error}
        </p>
      )}
    </div>
  );
}
