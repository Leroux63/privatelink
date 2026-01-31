"use client";

import { User } from "lucide-react";

type CreatorProfile = {
  twitterUsername: string;
  twitterName: string;
  twitterAvatarUrl: string;
};

type Props = {
  profile: CreatorProfile | null;
};

export default function CreatorBadge({ profile }: Props) {
  if (!profile) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-muted)]">
          <User size={18} className="opacity-60" />
        </div>

        <div className="leading-tight">
          <div className="text-sm font-medium">Anonymous creator</div>
          <div className="text-xs text-[var(--color-text-muted)]">
            identity not verified
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={profile.twitterAvatarUrl}
        alt=""
        referrerPolicy="no-referrer"
        className="h-10 w-10 rounded-full"
      />

      <div className="leading-tight">
        <div className="text-sm font-medium">
          @{profile.twitterUsername}
        </div>
        <div className="text-xs text-[var(--color-text-muted)]">
          {profile.twitterName}
        </div>
      </div>
    </div>
  );
}