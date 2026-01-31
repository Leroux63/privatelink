import Header from "@/components/header";
import Link from "next/link";
import {
  Lock,
  CreditCard,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Footer from "@/components/footer";

export default function Page() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <main className="mx-auto max-w-6xl px-6 py-32">
        <div className="grid gap-20 md:grid-cols-2 items-center">
          
          {/* LEFT */}
          <div>
            <h1 className="mb-6 text-4xl font-semibold leading-tight">
              Sell private content
              <br />
              <span className="text-[var(--color-accent)]">
                without leaks
              </span>
            </h1>

            <p className="mb-10 max-w-xl text-lg text-[var(--color-text-muted)]">
              Create a secure payment link for private Google Docs or lessons.
              Buyers get a one-time, expiring access after payment.
            </p>

            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded border border-[var(--color-accent)] bg-[var(--color-accent)] px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              <CreditCard size={18} />
              Create payment link
            </Link>
          </div>

          {/* RIGHT */}
          <div className="grid gap-6">
            <Feature
              icon={<FileText size={20} />}
              title="Private content"
              text="Your Google Doc stays private and is never shared publicly."
            />
            <Feature
              icon={<Lock size={20} />}
              title="One-time access"
              text="Each buyer gets a unique access token that expires."
            />
            <Feature
              icon={<ShieldCheck size={20} />}
              title="Anti-leak protection"
              text="Links cannot be reused or forwarded."
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="text-[var(--color-accent)]">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-[var(--color-text-muted)]">
          {text}
        </div>
      </div>
    </div>
  );
}
