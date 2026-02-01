import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-4 text-xs text-[var(--color-text-muted)] md:flex-row md:items-center md:justify-between">
        {/* Left: brand */}
        <div className="flex items-center gap-2">
          <Image
            src="/privatelink_logo.png"
            alt="PrivateLink logo"
            width={40}
            height={40}
            className="block"
          />
          <span className="font-medium text-[var(--color-text-main)]">
            <span>Private</span>
            <span className="text-[var(--color-accent)]">Link</span>
          </span>
          <span className="hidden sm:inline">
            © {new Date().getFullYear()}
          </span>
        </div>

        {/* Center: nav */}
        <nav className="flex items-center gap-4">
          <Link href="/" className="hover:text-[var(--color-text-main)]">
            Home
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-[var(--color-text-main)]"
          >
            Dashboard
          </Link>
          <Link
            href="/roadmap"
            className="hover:text-[var(--color-text-main)]"
          >
            Roadmap
          </Link>
          <a
            href="https://github.com/Leroux63/privatelink"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-text-main)]"
          >
            GitHub
          </a>
        </nav>

        {/* Right: sponsors */}
        <div className="flex items-center gap-3 opacity-70">
          <Image
            src="/sponsors/solana-logo.svg"
            alt="Solana Foundation"
            width={60}
            height={16}
          />
          <Image
            src="/sponsors/helius-logo.svg"
            alt="Helius"
            width={54}
            height={16}
          />
          <Image
            src="/sponsors/radr-logo.svg"
            alt="Radr Labs"
            width={48}
            height={16}
          />
        </div>
      </div>
    </footer>
  );
}