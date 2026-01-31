"use client";

import Image from "next/image";

export default function PoolBadge({ balanceSol }: { balanceSol: number }) {
  return (
    <div
      className="
        flex items-center gap-3
        rounded-lg
        bg-[var(--color-bg-muted)]
        px-4 py-3
        shadow-sm
        select-none
      "
    >
      <Image
        src="/solana.png"
        alt="Solana"
        width={20}
        height={20}
      />

      <div className="leading-tight">
        <div className="text-xs text-[var(--color-text-muted)]">
          Private pool
        </div>
        <div className="text-sm font-medium">
          {balanceSol.toFixed(4)} SOL
        </div>
      </div>
    </div>
  );
}