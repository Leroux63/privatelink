import Header from "@/components/header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header />

      <main className="mx-auto max-w-4xl px-6 py-32">
        <h1 className="mb-6 text-4xl font-semibold leading-tight">
          private payments
          <br />
          <span className="text-[var(--color-accent)]">
            for creators
          </span>
        </h1>

        <p className="mb-10 max-w-xl text-lg text-[var(--color-text-muted)]">
          create payment links.
          share them anywhere.
          access is unlocked only after payment.
        </p>

        <Link
          href="/create"
          className="inline-flex rounded border border-[var(--color-accent)] bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition hover:opacity-90"
        >
          create payment link
        </Link>
      </main>
    </div>
  );
}
