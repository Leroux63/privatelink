"use client";

import { toast } from "sonner";

type Props = {
  id: string;
  label: string | null;
  amountLamports: string;
  status: string;
};

export default function PaymentLinkCard({
  id,
  label,
  amountLamports,
  status,
}: Props) {
  const solAmount = Number(amountLamports) / 1e9;
  const payUrl = `${window.location.origin}/pay/${id}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(payUrl);
    toast.success("Payment link copied");
  }

  return (
    <li className="rounded-lg bg-[var(--color-surface)] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-medium">
            {label ?? "untitled link"}
          </div>
          <div className="text-sm text-[var(--color-text-muted)]">
            {solAmount.toFixed(9)} SOL · {status}
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="
            inline-flex items-center gap-2
            rounded-md border
            px-3 py-1.5
            text-sm font-medium
            cursor-pointer
            transition
            hover:bg-[var(--color-bg-muted)]
            hover:border-[var(--color-border-strong)]
            active:scale-[0.97]
          "
        >
          copy link
        </button>
      </div>
    </li>
  );
}