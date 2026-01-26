"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { shadowwireClient } from "@/lib/shadowwire/client";

const MIN_DEPOSIT_SOL = 0.1;

export default function DepositFlow() {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeposit() {
    if (!connected || !publicKey || !signTransaction) {
      setError("wallet not ready");
      return;
    }

    const parsed = Number(amount);
    if (isNaN(parsed) || parsed < MIN_DEPOSIT_SOL) {
      setError(`minimum deposit is ${MIN_DEPOSIT_SOL} SOL`);
      return;
    }

    const lamports = Math.floor(parsed * 1e9);

    setLoading(true);
    setError(null);

    try {
      const depositTx = await shadowwireClient.deposit({
        wallet: publicKey.toBase58(),
        amount: lamports,
      });

      const buffer = Buffer.from(
        depositTx.unsigned_tx_base64,
        "base64"
      );

      let signedTx;
      let signature: string;

      if (buffer[0] < 128) {
        const tx = Transaction.from(buffer);
        signedTx = await signTransaction(tx);
        signature = await connection.sendRawTransaction(
          signedTx.serialize()
        );
      } else {
        const tx = VersionedTransaction.deserialize(buffer);
        signedTx = await signTransaction(tx);
        signature = await connection.sendRawTransaction(
          signedTx.serialize()
        );
      }

      await connection.confirmTransaction(signature, "confirmed");
      setDone(true);
    } catch (e: any) {
      setError(e.message ?? "deposit failed");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        private payments activated
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1">
          deposit amount (SOL)
        </label>
        <input
          type="number"
          min={MIN_DEPOSIT_SOL}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
          placeholder={`${MIN_DEPOSIT_SOL}`}
        />
      </div>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        onClick={handleDeposit}
        disabled={loading}
        className="w-full rounded bg-[var(--color-accent)] px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "processing..." : "deposit & activate"}
      </button>
    </div>
  );
}
