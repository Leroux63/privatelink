import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6 text-sm text-[var(--color-text-muted)]">
        <span>
          © {new Date().getFullYear()} privatelink
        </span>

        <div className="flex items-center gap-4">
          <Link href="/" className="hover:text-[var(--color-text-main)]">
            Home
          </Link>
          <Link
            href="/dashboard"
            className="hover:text-[var(--color-text-main)]"
          >
            Dashboard
          </Link>
          <a
            href="https://solana.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-text-main)]"
          >
            Built on Solana
          </a>
        </div>
      </div>
    </footer>
  );
}
