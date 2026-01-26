"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ShadowWireClient,
  initWASM,
  isWASMSupported,
  generateRangeProof,
  TokenUtils,
} from "@radr/shadowwire";

type Status = "init" | "ready" | "processing" | "success" | "error";

type Props = {
  recipient: string;
  amount: number; // SOL
  linkId: string;
};

export default function PrivatePaymentFlow({
  recipient,
  amount,
  linkId,
}: Props) {
  const { publicKey, signMessage, connected } = useWallet();

  const [state, setState] = useState<Status>("init");
  const [error, setError] = useState<string | null>(null);

  const client = new ShadowWireClient({ debug: true });

  useEffect(() => {
    async function init() {
      if (!connected || !publicKey) return;

      try {
        if (!isWASMSupported()) {
          throw new Error("WASM not supported");
        }

        await initWASM("/wasm/settler_wasm_bg.wasm");
        setState("ready");
      } catch (e: any) {
        setError(e.message ?? "init failed");
        setState("error");
      }
    }

    init();
  }, [connected, publicKey]);

  async function handlePayment() {
    if (!publicKey || !signMessage) {
      setError("wallet not ready");
      return;
    }

    setState("processing");
    setError(null);

    try {
      const amountLamports = TokenUtils.toSmallestUnit(
        amount,
        "SOL"
      );

      const proof = await generateRangeProof(
        amountLamports,
        64
      );

      const result = await client.transferWithClientProofs({
        sender: publicKey.toBase58(),
        recipient,
        amount,
        token: "SOL",
        type: "external",
        customProof: proof,
        wallet: { signMessage },
      });

      if (!result.success) {
        throw new Error("transfer failed");
      }

      setState("success");
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? "payment failed");
      setState("error");
    }
  }

  if (!connected) return <p>connect wallet</p>;
  if (state === "init") return <p>initializing…</p>;
  if (state === "error") return <p>{error}</p>;
  if (state === "success") return <p>payment confirmed</p>;

  return (
    <button
      onClick={handlePayment}
      disabled={state === "processing"}
      className="w-full rounded bg-[var(--color-accent)] px-4 py-3 font-medium text-white"
    >
      {state === "processing"
        ? "processing…"
        : "pay now"}
    </button>
  );
}
