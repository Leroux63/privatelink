"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { LayoutGrid } from "lucide-react";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function Header() {
  const { connected } = useWallet();
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-4">
      <Link href="/" className="text-lg font-semibold tracking-tight">
        <span>private</span>
        <span className="text-[var(--color-accent)]">link</span>
      </Link>

      <div className="flex items-center gap-5">
        {connected && (
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 text-sm font-medium transition ${
              pathname === "/dashboard"
                ? "text-[var(--color-text-main)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]"
            }`}
          >
            <LayoutGrid size={16} />
            <span>Dashboard</span>
          </Link>
        )}

        <WalletMultiButton />
      </div>
    </header>
  );
}
