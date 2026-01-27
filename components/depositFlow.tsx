"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { shadowwireClient } from "@/lib/shadowwire/client";

const MIN_DEPOSIT_SOL = 0.1;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Props = {
  refreshBalance: () => Promise<any>;
};

export default function DepositFlow({ refreshBalance }: Props) {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeposit() {
    if (!connected || !publicKey || !signTransaction) {
      setError("wallet not ready");
      return;
    }

    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed < MIN_DEPOSIT_SOL) {
      setError(`minimum deposit is ${MIN_DEPOSIT_SOL} SOL`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const lamports = Math.floor(parsed * 1e9);

      const res = await shadowwireClient.deposit({
        wallet: publicKey.toBase58(),
        amount: lamports,
      });

      const buffer = Buffer.from(res.unsigned_tx_base64, "base64");

      if (buffer[0] < 128) {
        const tx = Transaction.from(buffer);
        const signed = await signTransaction(tx);
        await connection.sendRawTransaction(signed.serialize());
      } else {
        const tx = VersionedTransaction.deserialize(buffer);
        const signed = await signTransaction(tx);
        await connection.sendRawTransaction(signed.serialize());
      }

      for (let i = 0; i < 4; i++) {
        await sleep(5000);
        await refreshBalance();
      }

      setAmount("");
    } catch (e: any) {
      setError(e?.message ?? "deposit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1">deposit amount (SOL)</label>
        <input
          type="number"
          min={MIN_DEPOSIT_SOL}
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={handleDeposit}
        disabled={loading}
        className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "processing..." : "deposit"}
      </button>
    </div>
  );
}
