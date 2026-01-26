"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function Header() {
  const { connected } = useWallet();

  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
      {/* Logo */}
      <Link
        href="/"
        className="text-lg font-semibold tracking-tight"
      >
        <span>private</span>
        <span className="text-[var(--color-accent)]">link</span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {connected && (
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:opacity-80"
          >
            dashboard
          </Link>
        )}

        <WalletMultiButton />
      </div>
    </header>
  );
}
