"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { LayoutGrid, Map, Github } from "lucide-react";

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

  const linkBase =
    "flex items-center gap-2 text-sm font-medium transition";

  const active = "text-[var(--color-text-main)]";
  const inactive =
    "text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]";

  return (
    <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/privatelink_logo.png"
          alt="PrivateLink logo"
          width={60}
          height={60}
          priority
          className="block"
        />
        <span className="text-lg font-semibold tracking-tight leading-none">
          <span>Private</span>
          <span className="text-[var(--color-accent)]">Link</span>
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/roadmap"
          className={`${linkBase} ${
            pathname === "/roadmap" ? active : inactive
          }`}
        >
          <Map size={16} />
          <span className="hidden sm:inline">Roadmap</span>
        </Link>

        {connected && (
          <Link
            href="/dashboard"
            className={`${linkBase} ${
              pathname === "/dashboard" ? active : inactive
            }`}
          >
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
        )}

        <a
          href="https://github.com/Leroux63/privatelink"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] transition"
          aria-label="GitHub repository"
        >
          <Github size={18} />
        </a>

        <WalletMultiButton />
      </div>
    </header>
  );
}