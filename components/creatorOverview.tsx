"use client";

import CreatorBadge from "@/components/creatorBadge";

type CreatorProfile = {
  twitterUsername: string;
  twitterName: string;
  twitterAvatarUrl: string;
};

type Props = {
  wallet: string;
  profile: CreatorProfile | null;
  xEnabled: boolean;
  xConnected: boolean;
  onUnlockX: () => Promise<void>;
  onConnectX: () => Promise<void>;
};

export default function CreatorOverview({
  profile,
  xEnabled,
  xConnected,
  onUnlockX,
  onConnectX,
}: Props) {
  return (
    <section className="rounded-lg bg-[var(--color-surface)] p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Creator dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage your private payment links and earnings
          </p>
        </div>

        <div className="flex items-center gap-4">
          <CreatorBadge profile={profile} />

          {!xEnabled && (
            <button
              onClick={onUnlockX}
              className="rounded bg-black px-3 py-2 text-sm text-white hover:opacity-90"
            >
              Verify identity
            </button>
          )}

          {xEnabled && !xConnected && (
            <button
              onClick={onConnectX}
              className="rounded border px-3 py-2 text-sm hover:bg-[var(--color-bg-muted)]"
            >
              Connect X
            </button>
          )}
        </div>
      </div>
    </section>
  );
}