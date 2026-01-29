type CreatorProfile = {
  twitterUsername: string
  twitterName: string
  twitterAvatarUrl: string
}

type Props = {
  profile: CreatorProfile | null
}

export default function CreatorBadge({ profile }: Props) {
  if (!profile) {
    return (
      <div className="flex items-center gap-2 text-sm opacity-60">
        <div className="h-8 w-8 rounded-full bg-gray-300" />
        <span>Anonymous creator</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <img
        src={profile.twitterAvatarUrl}
        alt=""
        className="h-8 w-8 rounded-full"
        referrerPolicy="no-referrer"
      />
      <div className="leading-tight">
        <div className="text-sm font-medium">
          @{profile.twitterUsername}
        </div>
        <div className="text-xs opacity-60">
          {profile.twitterName}
        </div>
      </div>
    </div>
  )
}
