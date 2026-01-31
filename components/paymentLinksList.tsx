"use client";

import PaymentLinkCard from "@/components/paymentLinkCard";
import Link from "next/link";

type LinkItem = {
  id: string;
  createdAt: string;
  amountLamports: string;
  status: string;
  label: string | null;
};

type Props = {
  links: LinkItem[];
};

export default function PaymentLinksList({ links }: Props) {
  if (links.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center bg-[var(--color-surface)]">
        <p className="text-sm text-[var(--color-text-muted)]">
          You haven’t created any payment links yet.
        </p>

        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Create a private link to sell access to your content.
        </p>

        <Link
          href="/create"
          className="mt-4 inline-flex items-center justify-center rounded bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Create payment link
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <PaymentLinkCard
          key={link.id}
          id={link.id}
          label={link.label}
          amountLamports={link.amountLamports}
          status={link.status}
        />
      ))}
    </ul>
  );
}