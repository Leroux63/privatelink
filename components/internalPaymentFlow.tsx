"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ShadowWireClient } from "@radr/shadowwire";

type Props = {
  linkId: string;
  amountLamports: number;
  recipientWallet?: string;
  onSuccess?: () => void;
};

export default function InternalPaymentFlow({
  linkId,
  amountLamports,
  recipientWallet,
  onSuccess,
}: Props) {
  const { publicKey, connected, signMessage } = useWallet();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    if (!connected || !publicKey || !signMessage) {
      setError("wallet not connected");
      return;
    }

    if (!recipientWallet) {
      setError("invalid payment link (missing recipient)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const client = new ShadowWireClient({ debug: true });

      const proof = await client.generateProofLocally(
        amountLamports,
        "SOL"
      );

      const result = await client.internalTransfer(
        {
          sender_wallet: publicKey.toBase58(),
          recipient_wallet: recipientWallet,
          token: "SOL",
          amount: amountLamports,
          nonce: Math.floor(Date.now() / 1000),
          proof_bytes: proof.proofBytes,
          commitment: proof.commitmentBytes,
        },
        { signMessage }
      );

      if (!result.success || !result.tx_signature) {
        throw new Error(
          result.error ??
            "payment failed (internal transfer not executed)"
        );
      }

      const confirmRes = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId,
          txSignature: result.tx_signature,
          payerWallet: publicKey.toBase58(),
          amountLamports,
        }),
      });

      if (!confirmRes.ok) {
        const t = await confirmRes.text();
        throw new Error(t || "payment confirmation failed");
      }

      onSuccess?.();
    } catch (e: any) {
      console.error("internal payment error:", e);
      setError(e?.message ?? "payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <p className="mb-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <button
        onClick={handlePay}
        disabled={loading}
        className="
          w-full
          rounded-md
          bg-[var(--color-accent)]
          px-4
          py-3
          text-sm
          font-medium
          text-white
          cursor-pointer
          transition
          hover:opacity-90
          hover:shadow-sm
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >
        {loading ? "processing…" : "pay now"}
      </button>
    </>
  );
}